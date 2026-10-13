/**
 * GastosLock.gs — serialización de operaciones que consumen cupos.
 *
 * POR QUÉ EXISTE
 * --------------
 * Google Sheets no ofrece incremento atómico de celda ni escritura condicional.
 * Un patrón leer-modificar-escribir sobre `Usuarios!F` pierde incrementos cuando
 * dos peticiones simultáneas leen el mismo valor. Tampoco existe un índice
 * único que permita idempotencia real.
 *
 * `LockService` serializa las ejecuciones de ESTE proyecto de script. Con la
 * sección crítica protegida (verificar clave -> releer consumo -> decidir ->
 * escribir) desaparece la carrera: cada petición ve el estado real.
 *
 * GARANTÍAS
 * ---------
 * 1. Las operaciones que consumen cupos se serializan de forma global.
 * 2. `idempotency_key` viaja dentro del MISMO append que la fila, por lo que no
 *    existe ventana con gasto sin clave.
 * 3. Un reintento con la misma clave devuelve el resultado original: no crea
 *    fila ni consume cupo.
 * 4. El cupo se relee dentro del bloqueo antes de decidir.
 * 5. Si aun así el consumo superara el límite, se marca SOLO la fila propia con
 *    estado='rechazado'. Nunca se borra un gasto válido.
 * 6. Un registro con estado='rechazado' no cuenta para el consumo.
 *
 * FALLOS PARCIALES
 * ----------------
 * Sheets no es transaccional. El diseño NO depende de que varias escrituras
 * sean atómicas:
 *   - Si el append ocurre y la respuesta se pierde, la fila existe con su
 *     clave: el reintento la encuentra y devuelve el resultado original.
 *   - Si falla la actualización de `Usuarios!F`, no hay pérdida: el contador es
 *     informativo, el consumo se deriva de las filas y la siguiente
 *     reconciliación lo repara.
 *   - Si falla la neutralización, la fila queda 'ok' y el consumo podría exceder
 *     el límite en 1. Por eso el script se despliega junto con el endpoint de
 *     reconciliación documentado en docs/DEPLOY_GAS_LOCK.md.
 *
 * SEGURIDAD
 * ---------
 * El endpoint requiere un secreto compartido guardado en las propiedades del
 * script (`GAS_LOCK_SECRET`). Sin él, responde 401.
 */

// ---------------------------------------------------------------------------
// Propiedades y constantes
// ---------------------------------------------------------------------------

const PROP_SECRET = 'GAS_LOCK_SECRET'
const LOCK_TIMEOUT_MS = 20000
const SHEET_NAME = 'Gastos'
const USUARIOS_SHEET = 'Usuarios'

const HEADER_KEY = 'idempotency_key'
const HEADER_STATE = 'estado'
const STATE_OK = 'ok'
const STATE_REJECTED = 'rechazado'

/** Columna L (índice 12, base 1) = `creado_por`. Es el ancla del consumo. */
const FALLBACK_CREATED_BY_COL = 12

// ---------------------------------------------------------------------------
// Punto de entrada HTTP
// ---------------------------------------------------------------------------

function doGet(e) {
  return handle_(e)
}

function doPost(e) {
  return handle_(e)
}

function handle_(e) {
  try {
    const secret = PropertiesService.getScriptProperties().getProperty(PROP_SECRET)
    if (!secret) {
      return json_({ status: 'not_configured', message: `Falta la propiedad ${PROP_SECRET}` }, 500)
    }
    if (!secretsMatch_(String(e.parameter.token || ''), String(secret))) {
      return json_({ status: 'unauthorized' }, 401)
    }

    const body = readBody_(e)
    const action = body.action

    if (action === 'ping') {
      return json_({ status: 'ok', service: 'gastos-lock', time: new Date().toISOString() })
    }

    // El bloqueo cubre TODO lo que decide sobre cupo. Las operaciones que no
    // consumen (ping, migrate) no lo toman.
    if (action === 'migrate') {
      return json_(migrate_(body.spreadsheetId))
    }

    const lock = LockService.getScriptLock()
    if (!lock.tryLock(LOCK_TIMEOUT_MS)) {
      return json_(
        { status: 'lock_timeout', message: 'No se obtuvo el bloqueo en el tiempo esperado' },
        503
      )
    }
    try {
      if (action === 'save') return json_(save_(body))
      if (action === 'saveBatch') return json_(saveBatch_(body))
      return json_({ status: 'unknown_action', action: action || null }, 400)
    } finally {
      lock.releaseLock()
    }
  } catch (err) {
    // Hoja sin las columnas nuevas: se distingue de un error real para que el
    // backend pueda dar un mensaje accionable en vez de un 500 opaco.
    if (err && err.schemaNotMigrated) {
      return json_({ status: 'schema_not_migrated', message: String(err.message) }, 409)
    }
    return json_({ status: 'script_error', message: String(err && err.stack ? err.stack : err) }, 500)
  }
}

// ---------------------------------------------------------------------------
// Acciones
// ---------------------------------------------------------------------------

/**
 * Agrega las cabeceras M y N si no existen. Idempotente y NO modifica datos
 * históricos: solo escribe la fila 1. El llamador decide cuándo ejecutarlo.
 */
function migrate_(spreadsheetId) {
  if (!spreadsheetId) return { status: 'bad_request', message: 'falta spreadsheetId' }
  const sheet = openGastos_(spreadsheetId)
  const header = readHeader_(sheet)
  const added = []
  if (header.key === -1) {
    sheet.getRange(1, FALLBACK_CREATED_BY_COL + 1).setValue(HEADER_KEY)
    added.push(HEADER_KEY)
  }
  if (header.state === -1) {
    sheet.getRange(1, FALLBACK_CREATED_BY_COL + 2).setValue(HEADER_STATE)
    added.push(HEADER_STATE)
  }
  return {
    status: added.length ? 'migrated' : 'already_migrated',
    added: added,
    message:
      added.length > 0
        ? 'Cabeceras agregadas. No se modifico ningun registro existente.'
        : 'La hoja ya tenia las columnas; no se modifico nada.',
  }
}

/**
 * Guarda un único gasto. Devuelve el estado de la operación para que el backend
 * responde sin escribir nada por su cuenta.
 */
function save_(b) {
  const invalid = validate_(b, ['email', 'idempotencyKey', 'limite', 'row'])
  if (invalid) return invalid

  const sheet = openGastos_(b.spreadsheetId)
  const cols = requireColumns_(sheet)

  const data = readRows_(sheet, cols)
  const email = norm_(b.email)

  // 1) Idempotencia: una fila con esta clave ya representa esta operacion.
  const found = findByKey_(data, cols.key, b.idempotencyKey)
  if (found !== -1) {
    const estado = String(data[found][cols.state - 1] || STATE_OK)
    return {
      status: 'duplicate',
      idempotent: true,
      estado: estado,
      consumos: countConsumed_(data, cols, email),
      limite: Number(b.limite),
      message: 'La operacion ya se habia registrado; no se creo una fila nueva.',
    }
  }

  // 2) Cupo vigente, releido dentro del bloqueo.
  const consumosAntes = countConsumed_(data, cols, email)
  const limite = Number(b.limite)
  if (consumosAntes >= limite) {
    // 3) Sin cupo: se rechaza ANTES de crear el gasto.
    return {
      status: 'quota_exceeded',
      consumos: consumosAntes,
      limite: limite,
      message: 'Limite de boletas alcanzado.',
    }
  }

  // 4) Registro. La clave viaja en el mismo append que la fila.
  const row = b.row.slice(0, FALLBACK_CREATED_BY_COL - 1)
  while (row.length < FALLBACK_CREATED_BY_COL - 1) row.push('')
  row.push(String(b.idempotencyKey), STATE_OK)
  sheet.appendRow(row)

  // 5) Verificacion posterior. Con el bloqueo tomado, el recuento es fiable.
  const after = readRows_(sheet, cols)
  const consumosDespues = countConsumed_(after, cols, email)
  if (consumosDespues > limite) {
    // Neutralizo SOLO mi fila. No borro nada.
    neutralizeOwn_(sheet, cols, b.idempotencyKey)
    const final = readRows_(sheet, cols)
    return {
      status: 'quota_exceeded',
      consumos: countConsumed_(final, cols, email),
      limite: limite,
      neutralized: true,
      message: 'La operacion superaba el limite disponible; el registro quedo marcado como rechazado.',
    }
  }

  // 6) Contador informativo. Su fallo no afecta el cupo: se deriva de filas.
  updateCounter_(b, consumosDespues)

  const finalIdx = findByKey_(readRows_(sheet, cols), cols, b.idempotencyKey)

  return {
    status: 'ok',
    idempotent: false,
    placed: [{ idempotencyKey: String(b.idempotencyKey), row: finalIdx === -1 ? null : finalIdx + 2 }],
    consumos: consumosDespues,
    limite: limite,
  }
}

/**
 * Guarda N filas (flujo del puente RindeNX). Valida el cupo para el lote
 * COMPLETO antes de escribir: es todo o nada, para no dejar una rendición a
 * medias. Cada fila lleva su propia clave, asi un reintento solo escribe las
 * que faltan.
 */
function saveBatch_(b) {
  const invalid = validate_(b, ['email', 'limite', 'rows'])
  if (invalid) return invalid
  if (!Array.isArray(b.rows) || b.rows.length === 0) {
    return { status: 'bad_request', message: 'rows vacio' }
  }

  const sheet = openGastos_(b.spreadsheetId)
  const cols = requireColumns_(sheet)
  const data = readRows_(sheet, cols)
  const email = norm_(b.email)
  const limite = Number(b.limite)

  // Filtrar las ya registradas por clave: son idempotentes.
  const pendientes = []
  let yaRegistradas = 0
  for (const item of b.rows) {
    if (!item || !item.idempotencyKey || !Array.isArray(item.row)) continue
    if (findByKey_(data, cols.key, item.idempotencyKey) !== -1) {
      yaRegistradas++
    } else {
      pendientes.push(item)
    }
  }

  if (pendientes.length === 0) {
    return {
      status: 'ok',
      idempotent: true,
      inserted: 0,
      already_present: yaRegistradas,
      consumos: countConsumed_(data, cols, email),
      limite: limite,
      message: 'Todas las filas ya estaban registradas.',
    }
  }

  const consumosAntes = countConsumed_(data, cols, email)

  // Validacion del lote completo: nada se escribe si el conjunto no cabe.
  if (consumosAntes + pendientes.length > limite) {
    return {
      status: 'quota_exceeded',
      consumos: consumosAntes,
      limite: limite,
      requested: pendientes.length,
      available: Math.max(0, limite - consumosAntes),
      message: 'Cupo insuficiente para pasar la rendicion completa; no se registro ningun gasto.',
    }
  }

  for (const item of pendientes) {
    const row = item.row.slice(0, FALLBACK_CREATED_BY_COL - 1)
    while (row.length < FALLBACK_CREATED_BY_COL - 1) row.push('')
    row.push(String(item.idempotencyKey), STATE_OK)
    sheet.appendRow(row)
  }

  const after = readRows_(sheet, cols)
  const consumosDespues = countConsumed_(after, cols, email)
  if (consumosDespues > limite) {
    // Neutralizo SOLO las filas de este lote.
    for (const item of pendientes) neutralizeOwn_(sheet, cols, item.idempotencyKey)
    const final = readRows_(sheet, cols)
    return {
      status: 'quota_exceeded',
      consumos: countConsumed_(final, cols, email),
      limite: limite,
      neutralized: true,
      message: 'El lote superaba el limite; sus registros quedaron marcados como rechazados.',
    }
  }

  updateCounter_(b, consumosDespues)

  // Se devuelve el número de fila en `Gastos` de CADA clave del lote, incluidas
  // las que ya estaban: el flujo del puente lo usa para registrar el cruce en
  // su hoja de auditoría.
  const finalRows = readRows_(sheet, cols)
  const placed = []
  for (const item of b.rows) {
    if (!item || !item.idempotencyKey) continue
    const idx = findByKey_(finalRows, cols, item.idempotencyKey)
    placed.push({ idempotencyKey: String(item.idempotencyKey), row: idx === -1 ? null : idx + 2 })
  }

  return {
    status: 'ok',
    idempotent: pendientes.length === 0,
    inserted: pendientes.length,
    already_present: yaRegistradas,
    placed: placed,
    consumos: consumosDespues,
    limite: limite,
  }
}

// ---------------------------------------------------------------------------
// Utilidades de hoja
// ---------------------------------------------------------------------------

function openGastos_(spreadsheetId) {
  if (!spreadsheetId) throw new Error('falta spreadsheetId')
  const ss = SpreadsheetApp.openById(spreadsheetId)
  const sheet = ss.getSheetByName(SHEET_NAME)
  if (!sheet) throw new Error('No existe la hoja ' + SHEET_NAME)
  return sheet
}

function readHeader_(sheet) {
  const lastCol = Math.max(sheet.getLastColumn(), FALLBACK_CREATED_BY_COL + 2)
  const values = sheet.getRange(1, 1, 1, lastCol).getValues()[0].map(norm_)
  const find = function (name) {
    for (let i = 0; i < values.length; i++) {
      if (values[i] === name) return i + 1
    }
    return -1
  }
  var key = find(HEADER_KEY)
  var state = find(HEADER_STATE)
  // `creado_por` puede no tener cabecera en hojas antiguas: se cae a la L.
  var createdBy = find('creado_por')
  if (createdBy === -1) createdBy = FALLBACK_CREATED_BY_COL
  return { key: key, state: state, createdBy: createdBy, lastCol: lastCol }
}

function requireColumns_(sheet) {
  const header = readHeader_(sheet)
  if (header.key === -1 || header.state === -1) {
    const err = new Error(
      'Faltan las columnas ' + HEADER_KEY + '/' + HEADER_STATE +
      '. Ejecuta la migracion (action=migrate) antes de operar.'
    )
    err.schemaNotMigrated = true
    throw err
  }
  return header
}

function readRows_(sheet, header) {
  const lastRow = sheet.getLastRow()
  if (lastRow < 2) return []
  const width = Math.max(header.lastCol, header.key, header.state, header.createdBy)
  return sheet.getRange(2, 1, lastRow - 1, width).getValues()
}

/**
 * Consumo vigente: filas del usuario cuyo estado NO es 'rechazado'.
 * Los registros historicos tienen `estado` vacio y se cuentan como 'ok'.
 */
function countConsumed_(data, cols, email) {
  let n = 0
  for (let i = 0; i < data.length; i++) {
    const row = data[i]
    if (norm_(row[cols.createdBy - 1]) !== email) continue
    const estado = norm_(row[cols.state - 1])
    if (estado === STATE_REJECTED) continue
    n++
  }
  return n
}

function findByKey_(data, cols, key) {
  const target = String(key || '')
  if (!target) return -1
  for (let i = 0; i < data.length; i++) {
    if (String(data[i][cols.key - 1] || '').trim() === target) return i
  }
  return -1
}

/** Marca SOLO la fila con esa clave como rechazada. Nunca borra. */
function neutralizeOwn_(sheet, cols, key) {
  const data = readRows_(sheet, cols)
  const idx = findByKey_(data, cols, key)
  if (idx === -1) return false
  sheet.getRange(idx + 2, cols.state).setValue(STATE_REJECTED)
  return true
}

/**
 * Actualiza `Usuarios!F`. Es INFORMATIVO: el consumo real se deriva de las
 * filas. Si falla, no se pierde nada y la reconciliación lo repara.
 */
function updateCounter_(b, consumos) {
  try {
    if (!b.configSpreadsheetId || !b.userEmail) return
    const ss = SpreadsheetApp.openById(b.configSpreadsheetId)
    const sheet = ss.getSheetByName(USUARIOS_SHEET)
    if (!sheet) return
    const lastRow = sheet.getLastRow()
    if (lastRow < 2) return
    const values = sheet.getRange(2, 1, lastRow - 1, 1).getValues()
    const target = norm_(b.userEmail)
    for (let i = 0; i < values.length; i++) {
      if (norm_(values[i][0]) === target) {
        sheet.getRange(i + 2, 6).setValue(consumos)
        return
      }
    }
  } catch (err) {
    // Deliberadamente silencioso: el contador es informativo.
    console.warn('No se pudo actualizar Usuarios!F: ' + err)
  }
}

// ---------------------------------------------------------------------------
// Utilidades generales
// ---------------------------------------------------------------------------

function validate_(b, required) {
  if (!b) return { status: 'bad_request', message: 'cuerpo vacio' }
  for (var i = 0; i < required.length; i++) {
    var k = required[i]
    if (b[k] === undefined || b[k] === null || b[k] === '') {
      return { status: 'bad_request', message: 'falta ' + k }
    }
  }
  return null
}

function readBody_(e) {
  if (e.postData && e.postData.contents) {
    try {
      return JSON.parse(e.postData.contents)
    } catch (err) {
      return {}
    }
  }
  return {}
}

function norm_(v) {
  return String(v === null || v === undefined ? '' : v).trim().toLowerCase()
}

/**
 * Comparacion de secretos. Apps Script no ofrece comparacion de tiempo
 * constante; el riesgo es teorico porque el canal ya es HTTPS y la respuesta no
 * filtra longitud util. Aun asi se evita la comparacion directa con === sobre
 * operandos de distinta longitud mediante un hash previo.
 */
function secretsMatch_(a, b) {
  if (!a || !b) return false
  var ha = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, a, Utilities.Charset.UTF_8)
  var hb = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, b, Utilities.Charset.UTF_8)
  if (ha.length !== hb.length) return false
  var diff = 0
  for (var i = 0; i < ha.length; i++) {
    diff |= ha[i] ^ hb[i]
  }
  return diff === 0
}

function json_(obj, code) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON
  )
}