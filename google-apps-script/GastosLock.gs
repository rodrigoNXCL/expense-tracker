/**
 * GastosLock.gs — serialización de operaciones que consumen cupos.
 * Proyecto de Apps Script independiente: "GastosNX - Control de Cupos".
 *
 * ===========================================================================
 * CONTRATO HTTP (léase primero)
 * ===========================================================================
 * `ContentService` de Apps Script NO permite fijar un código de estado HTTP.
 * TODAS las respuestas salen con **HTTP 200** y el resultado viaja en el campo
 * `status` del cuerpo JSON. El segundo parámetro de `json_()` es solo
 * metadato (`http_status_noted`) y nunca debe interpretarse como el código.
 * El backend decide por `status`, y trata cualquier estado desconocido como
 * fallo (fail-closed).
 *
 * ===========================================================================
 * POR QUÉ EXISTE
 * ===========================================================================
 * Google Sheets no ofrece incremento atómico de celda ni escritura condicional.
 * Un patrón leer-modificar-escribir sobre `Usuarios!F` pierde incrementos cuando
 * dos peticiones simultáneas leen el mismo valor. Tampoco existe un índice
 * único que dé idempotencia real.
 *
 * `LockService` serializa las ejecuciones de ESTE proyecto. Con la sección
 * crítica protegida (verificar clave → releer límite y consumo → decidir →
 * escribir) desaparece la carrera: cada petición ve el estado real.
 *
 * ===========================================================================
 * GARANTÍAS
 * ===========================================================================
 * 1. Toda operación que consuma cupos se serializa globalmente.
 * 2. `idempotency_key` viaja dentro del MISMO append que la fila: no existe
 *    ventana con gasto sin clave.
 * 3. Un reintento con la misma clave devuelve el resultado original: no crea
 *    fila ni consume cupo.
 * 4. El límite se lee de `Usuarios!E` DENTRO del bloqueo. Si no se puede leer,
 *    NO se decide cupo y NO se escribe nada.
 * 5. Si aun así el consumo superara el límite, se marca SOLO la fila propia con
 *    `estado='rechazado'`. Nunca se borra un gasto válido.
 * 6. Un registro con `estado='rechazado'` no cuenta para el consumo.
 *
 * ===========================================================================
 * ESQUEMA DE COLUMNAS
 * ===========================================================================
 * Las posiciones NO se asumen: se detectan por nombre de cabecera en la fila 1.
 * `creado_por`, `idempotency_key` y `estado` se leen y se escriben en la
 * posición detectada. Si el esquema es incompatible o ambiguo, la operación
 * se detiene SIN escribir.
 *
 * Fallback único y acotado: si la fila 1 está completamente vacía (hoja sin
 * cabeceras), se asume el esquema histórico de 12 columnas con `creado_por` en
 * L y las columnas de control en M y N. Si la fila 1 tiene contenido pero no
 * se reconoce `creado_por`, es ambiguo y se detiene.
 *
 * ===========================================================================
 * ESCRITURAS PARCIALES (no hay transacciones ACID)
 * ===========================================================================
 * Sheets NO ofrece atomicidad y este script NO la afirma. En su lugar:
 *   - Cada fila lleva su clave en el mismo append, así que una fila escrita
 *     queda siempre identificada.
 *   - Un `appendRow` que falla a mitad de un lote deja filas escritas con su
 *     clave. El script devuelve `partial_batch` con las claves insertadas,
 *     fallidas y pendientes, para que el lote pueda auditarse.
 *   - El reintento del mismo lote reconoce las claves ya escritas y solo
 *     inserta las que faltan: nunca duplica.
 *   - No se borra ninguna fila para "deshacer" un lote: eso destruiría gastos
 *     válidos. `estado='rechazado'` es la única marca de no consumo.
 *
 * ===========================================================================
 * LO QUE ESTE SCRIPT NO PROTEGE
 * ===========================================================================
 *   - La edición manual de `Gastos` en el navegador.
 *   - Cualquier ruta que escriba en `Gastos` sin pasar por `save`/`saveBatch`.
 *   - El bloqueo es global a este script, no por empresa.
 *
 * ===========================================================================
 * SEGURIDAD
 * ===========================================================================
 * Todas las acciones, incluida `migrate`, exigen el secreto compartido
 * guardado en las propiedades del script (`GAS_LOCK_SECRET`). Si la propiedad
 * no existe la respuesta es `not_configured`; si el secreto no coincide,
 * `unauthorized`. En ambos casos NO se ejecuta ninguna acción y NO se escribe
 * nada. El secreto nunca vive en el repositorio.
 */

// ---------------------------------------------------------------------------
// Propiedades y constantes
// ---------------------------------------------------------------------------

const PROP_SECRET = 'GAS_LOCK_SECRET'
const LOCK_TIMEOUT_MS = 20000
const SHEET_NAME = 'Gastos'
const USUARIOS_SHEET = 'Usuarios'

const HEADER_CREATED_BY = 'creado_por'
const HEADER_KEY = 'idempotency_key'
const HEADER_STATE = 'estado'
const STATE_OK = 'ok'
const STATE_REJECTED = 'rechazado'

const MAX_KEY_LENGTH = 200
const MAX_BATCH_ROWS = 500

/**
 * Esquema histórico de la hoja `Gastos` cuando NO hay fila de cabeceras:
 * 12 columnas A..L con `creado_por` en L, y las columnas de control en M y N.
 * Solo se usa si la fila 1 está vacía por completo (ver `resolveLayout_`).
 */
const LEGACY_WIDTH = 12
const LEGACY_CREATED_BY_COL = 12
const LEGACY_KEY_COL = 13
const LEGACY_STATE_COL = 14

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
    var secret = String(
      PropertiesService.getScriptProperties().getProperty(PROP_SECRET) || ''
    ).trim()
    if (!secret) {
      return json_({
        status: 'not_configured',
        message:
          'Falta la propiedad de script ' + PROP_SECRET +
          '. El script rechaza todas las acciones hasta configurarla.',
      })
    }
    if (!secretsMatch_(extractToken_(e), secret)) {
      return json_({ status: 'unauthorized', message: 'Secreto compartido incorrecto.' })
    }

    const body = readBody_(e)
    const action = body.action

    if (action === 'ping') {
      return json_({ status: 'ok', service: 'gastos-lock', time: new Date().toISOString() })
    }

    // `migrate` no consume cupo, así que no necesita el bloqueo, pero SÍ exige
    // el secreto (comprobado arriba) porque modifica cabeceras.
    if (action === 'migrate') {
      return json_(migrate_(body.spreadsheetId))
    }

    const lock = LockService.getScriptLock()
    if (!lock.tryLock(LOCK_TIMEOUT_MS)) {
      return json_({
        status: 'lock_timeout',
        message: 'No se obtuvo el bloqueo en el tiempo esperado. No se escribio nada.',
      })
    }
    try {
      if (action === 'save') return json_(save_(body))
      if (action === 'saveBatch') return json_(saveBatch_(body))
      return json_({ status: 'unknown_action', action: action || null })
    } finally {
      lock.releaseLock()
    }
  } catch (err) {
    // Toda respuesta es HTTP 200: el motivo viaja en `status`.
    if (err && err.schemaProblem) {
      return json_({ status: err.schemaProblem, message: String(err.message) })
    }
    return json_({
      status: 'script_error',
      message: String(err && err.stack ? err.stack : err),
    })
  }
}

// ---------------------------------------------------------------------------
// Acciones
// ---------------------------------------------------------------------------

/**
 * Agrega las cabeceras de control si no existen. Idempotente y NO modifica
 * datos históricos: escribe únicamente la fila 1.
 *
 * Seguridad del esquema:
 *   - Si la fila 1 ya identifica `idempotency_key` o `estado` en otra posición,
 *     se respetan tal cual y no se añade nada.
 *   - Si la posición destino está ocupada con otro contenido, se DETIENE con
 *     `schema_conflict`: sobrescribirla destruiría datos de otro uso.
 *   - Si la fila 1 tiene contenido pero no se reconoce `creado_por`, no se
 *     asume nada: se detiene con `schema_conflict`.
 */
function migrate_(spreadsheetId) {
  if (!spreadsheetId) return { status: 'bad_request', message: 'falta spreadsheetId' }
  const sheet = openGastos_(spreadsheetId)

  // `requireControl: false` porque migrar es justamente el paso en el que las
  // columnas de control aun NO existen. Solo se detiene si el esquema de base
  // (`creado_por`) es ilegible o si el destino está ocupado.
  const layout = resolveLayout_(sheet, { requireControl: false })
  if (!layout.ok) {
    return {
      status: layout.status,
      message: layout.message,
      // Se reenvía el diagnóstico completo para que la auditoría de la
      // migración sepa por qué se detuvo, sin exponer datos de la hoja.
      esquema_detectado: layout.esquema_detectado,
    }
  }

  const cols = layout
  const lastCol = Math.max(sheet.getLastColumn(), cols.key, cols.state)
  const destino = sheet.getRange(1, LEGACY_CREATED_BY_COL + 1, 1, 2).getValues()[0]

  const conflicto = []

  // Guarda de colisión: las columnas de destino (M/N) NO pueden ser la misma
  // que `creado_por`. Si lo fueran, escribir la cabecera sobrescribiría el
  // encabezado de esa columna y el consumo se contaría sobre la columna
  // equivocada. Se detiene esa hoja y se reporta.
  if (cols.createdBy === LEGACY_KEY_COL || cols.createdBy === LEGACY_STATE_COL) {
    return {
      status: 'schema_conflict',
      message:
        'La cabecera ' + HEADER_CREATED_BY + ' esta en la columna ' + cols.createdBy +
        ', que es el destino de las cabeceras de control. Escribirlas sobrescribiria datos. ' +
        'No se modifico nada.',
      esquema_detectado: cols.esquema,
      created_by_col: cols.createdBy,
    }
  }

  if (cols.key === -1 && String(destino[0] || '').trim() !== '') {
    conflicto.push(
      'M contiene "' + destino[0] + '" y no es la cabecera ' + HEADER_KEY
    )
  }
  if (cols.state === -1 && String(destino[1] || '').trim() !== '') {
    conflicto.push(
      'N contiene "' + destino[1] + '" y no es la cabecera ' + HEADER_STATE
    )
  }
  if (conflicto.length > 0) {
    return {
      status: 'schema_conflict',
      message:
        'Migracion detenida: las columnas destino ya estan ocupadas. ' + conflicto.join('; ') +
        '. No se modifico nada.',
      columnas_ocupadas: conflicto.length,
      columnas_libres_hasta: lastCol,
    }
  }

  const added = []
  if (cols.key === -1) {
    sheet.getRange(1, LEGACY_KEY_COL).setValue(HEADER_KEY)
    added.push(HEADER_KEY)
  }
  if (cols.state === -1) {
    sheet.getRange(1, LEGACY_STATE_COL).setValue(HEADER_STATE)
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
 * Límite vigente leído de `Usuarios!E` DENTRO del bloqueo.
 *
 * `Usuarios!E` es la única fuente autoritativa del límite. El valor que envía
 * el backend es una copia que viaja en el JWT y puede tener días de antigüedad
 * (el token vive 7 días y se reconcilia cada 5 minutos como máximo), por lo que
 * NO se usa como respaldo: si el administrador baja el límite y esta lectura
 * falla, usarlo concedería cupo por encima del límite real.
 *
 * Ante cualquier problema devuelve `{ ok: false, reason }` para que el llamador
 * detenga la operación sin escribir. Ver `limiteNoDisponible_`.
 */
function resolveLimit_(b) {
  if (!b.configSpreadsheetId || !b.userEmail) {
    return { ok: false, reason: 'missing_config' }
  }
  try {
    const ss = SpreadsheetApp.openById(b.configSpreadsheetId)
    const sheet = ss.getSheetByName(USUARIOS_SHEET)
    if (!sheet) return { ok: false, reason: 'usuarios_sheet_missing' }
    const lastRow = sheet.getLastRow()
    if (lastRow < 2) return { ok: false, reason: 'usuarios_empty' }
    const values = sheet.getRange(2, 1, lastRow - 1, 1).getValues()
    const target = norm_(b.userEmail)
    for (var i = 0; i < values.length; i++) {
      if (norm_(values[i][0]) === target) {
        const limite = Number(sheet.getRange(i + 2, 5).getValue())
        if (isFinite(limite) && limite > 0) {
          return { ok: true, limite: limite, source: 'Usuarios!E' }
        }
        return { ok: false, reason: 'limite_invalido' }
      }
    }
    return { ok: false, reason: 'usuario_no_encontrado' }
  } catch (err) {
    console.warn('No se pudo leer Usuarios!E: ' + err)
    return { ok: false, reason: 'read_error' }
  }
}

/**
 * Sin límite autoritativo NO se decide cupo y NO se escribe nada.
 *
 * El rechazo es reintentable y no crea filas, así que el cliente puede reenviar
 * la MISMA `idempotency_key` cuando la lectura se recupere, sin duplicar.
 */
function limiteNoDisponible_(limitInfo) {
  return {
    status: 'limit_unavailable',
    message:
      'No se pudo leer el limite vigente del plan. No se registro el gasto para no consumir ' +
      'cupo a ciegas. Reintenta en unos segundos.',
    motivo: limitInfo.reason,
    retryable: true,
  }
}

/**
 * Guarda un único gasto.
 *
 * El límite se relee dentro del bloqueo y la idempotencia se verifica ANTES de
 * escribir. La clave viaja en el mismo append que la fila.
 */
function save_(b) {
  const invalid = validate_(b, ['spreadsheetId', 'userEmail', 'idempotencyKey', 'row'])
  if (invalid) return invalid
  if (!Array.isArray(b.row) || b.row.length === 0) {
    return { status: 'bad_request', message: 'row vacio' }
  }
  const keyError = validateKey_(b.idempotencyKey)
  if (keyError) return keyError
  if (!isEmail_(b.userEmail)) {
    return { status: 'bad_request', message: 'userEmail invalido' }
  }

  const sheet = openGastos_(b.spreadsheetId)
  const layout = resolveLayout_(sheet)
  if (!layout.ok) return layoutError_(layout)
  const cols = layout

  const data = readRows_(sheet, cols)
  const email = norm_(b.userEmail)

  // 1) Idempotencia: una fila con esta clave ya representa esta operación.
  const found = findByKey_(data, cols, b.idempotencyKey)
  if (found !== -1) {
    return {
      status: 'duplicate',
      idempotent: true,
      estado: String(data[found][cols.state - 1] || STATE_OK),
      consumos: countConsumed_(data, cols, email),
      message: 'La operacion ya se habia registrado; no se creo una fila nueva.',
    }
  }

  // 2) Límite vigente, desde la fuente autoritativa y dentro del bloqueo.
  const limitInfo = resolveLimit_(b)
  if (!limitInfo.ok) return limiteNoDisponible_(limitInfo)
  const limite = limitInfo.limite

  const consumosAntes = countConsumed_(data, cols, email)
  if (consumosAntes >= limite) {
    // 3) Sin cupo: se rechaza ANTES de crear el gasto.
    return {
      status: 'quota_exceeded',
      consumos: consumosAntes,
      limite: limite,
      limit_source: limitInfo.source,
      message: 'Limite de boletas alcanzado.',
    }
  }

  // 4) Registro. La fila se construye sobre el esquema DETECTADO.
  const row = buildRow_(b.row, b.idempotencyKey, STATE_OK, cols, b.userEmail)
  try {
    sheet.appendRow(row)
  } catch (err) {
    return {
      status: 'write_failed',
      message: 'No se pudo escribir el gasto: ' + String(err),
      idempotencyKey: String(b.idempotencyKey),
      retryable: true,
    }
  }

  // 5) Verificación posterior. Con el bloqueo tomado, el recuento es fiable.
  const after = readRows_(sheet, cols)
  const consumosDespues = countConsumed_(after, cols, email)
  if (consumosDespues > limite) {
    // Neutralizo SOLO mi fila. No borro nada.
    var neutralizado = false
    try {
      neutralizado = neutralizeOwn_(sheet, cols, b.idempotencyKey)
    } catch (err) {
      console.error('Fallo al neutralizar: ' + err)
      return {
        status: 'neutralize_failed',
        consumos: consumosDespues,
        limite: limite,
        idempotencyKey: String(b.idempotencyKey),
        message:
          'El gasto se registro pero superaba el limite y no se pudo marcar como rechazado. ' +
          'Requiere reconciliacion manual.',
      }
    }
    const final = readRows_(sheet, cols)
    return {
      status: 'quota_exceeded',
      consumos: countConsumed_(final, cols, email),
      limite: limite,
      limit_source: limitInfo.source,
      neutralized: neutralizado,
      message: 'La operacion superaba el limite disponible; el registro quedo marcado como rechazado.',
    }
  }

  // 6) Contador informativo. Su fallo no afecta el cupo: se deriva de filas.
  updateCounter_(b, consumosDespues)

  const finalRows = readRows_(sheet, cols)
  const finalIdx = findByKey_(finalRows, cols, b.idempotencyKey)

  return {
    status: 'ok',
    idempotent: false,
    placed: [{ idempotencyKey: String(b.idempotencyKey), row: finalIdx === -1 ? null : finalIdx + 2 }],
    consumos: consumosDespues,
    limite: limite,
    limit_source: limitInfo.source,
  }
}

/**
 * Guarda N filas (flujo del puente RindeNX).
 *
 * NO es atómico: Sheets no lo permite y este script no lo afirma. Lo que sí
 * garantiza:
 *   - Todas las filas y claves se validan ANTES de escribir nada.
 *   - El cupo se valida para el lote COMPLETO: si no cabe, no se escribe ninguna.
 *   - Cada fila lleva su clave en su propio append, así que un fallo a mitad
 *     deja filas identificadas y el reintento solo inserta las que faltan.
 *   - Un `appendRow` fallido produce `partial_batch` con el detalle auditable.
 */
function saveBatch_(b) {
  const invalid = validate_(b, ['spreadsheetId', 'userEmail', 'rows'])
  if (invalid) return invalid
  if (!Array.isArray(b.rows) || b.rows.length === 0) {
    return { status: 'bad_request', message: 'rows vacio' }
  }
  if (b.rows.length > MAX_BATCH_ROWS) {
    return {
      status: 'bad_request',
      message: 'El lote excede ' + MAX_BATCH_ROWS + ' filas.',
    }
  }
  if (!isEmail_(b.userEmail)) {
    return { status: 'bad_request', message: 'userEmail invalido' }
  }

  // El esquema se resuelve ANTES de validar el lote: la posición real de
  // `creado_por` se detecta por cabecera y no puede suponerse.
  const sheet = openGastos_(b.spreadsheetId)
  const layout = resolveLayout_(sheet)
  if (!layout.ok) return layoutError_(layout)
  const cols = layout

  const itemsError = validateBatchItems_(b.rows, b.userEmail, cols.createdBy)
  if (itemsError) return itemsError

  const data = readRows_(sheet, cols)
  const email = norm_(b.userEmail)

  const limitInfo = resolveLimit_(b)
  if (!limitInfo.ok) return limiteNoDisponible_(limitInfo)
  const limite = limitInfo.limite

  // Separar las ya registradas de las pendientes: las primeras son idempotentes.
  const pendientes = []
  const placed = []
  for (const item of b.rows) {
    const idx = findByKey_(data, cols, item.idempotencyKey)
    if (idx !== -1) {
      placed.push({ idempotencyKey: item.idempotencyKey, row: idx + 2 })
    } else {
      pendientes.push(item)
    }
  }

  if (pendientes.length === 0) {
    return {
      status: 'ok',
      idempotent: true,
      inserted: 0,
      already_present: placed.length,
      placed: placed,
      consumos: countConsumed_(data, cols, email),
      limite: limite,
      limit_source: limitInfo.source,
      message: 'Todas las filas ya estaban registradas.',
    }
  }

  const consumosAntes = countConsumed_(data, cols, email)

  // Validación del lote COMPLETO: si el conjunto no cabe, no se escribe nada.
  if (consumosAntes + pendientes.length > limite) {
    return {
      status: 'quota_exceeded',
      consumos: consumosAntes,
      limite: limite,
      limit_source: limitInfo.source,
      requested: pendientes.length,
      available: Math.max(0, limite - consumosAntes),
      message: 'Cupo insuficiente para pasar la rendicion completa; no se registro ningun gasto.',
    }
  }

  // Inserción fila a fila. Un fallo NO se oculta: se reporta qué quedó escrito.
  const insertedKeys = []
  const failedKeys = []
  const errores = []
  for (const item of pendientes) {
    try {
      sheet.appendRow(buildRow_(item.row, item.idempotencyKey, STATE_OK, cols, b.userEmail))
      insertedKeys.push(item.idempotencyKey)
    } catch (err) {
      failedKeys.push(item.idempotencyKey)
      errores.push(item.idempotencyKey + ': ' + String(err))
      break // se detiene: el orden del lote importa para el puente
    }
  }

  const after = readRows_(sheet, cols)

  if (failedKeys.length > 0) {
    const pendientesRestantes = pendientes
      .slice(insertedKeys.length + failedKeys.length)
      .map((it) => it.idempotencyKey)
    const placedParcial = []
    for (const key of placed.concat(insertedKeys.map((k) => ({ idempotencyKey: k, row: null })))) {
      const idx = findByKey_(after, cols, key.idempotencyKey)
      placedParcial.push({ idempotencyKey: key.idempotencyKey, row: idx === -1 ? null : idx + 2 })
    }
    console.error('Lote parcial: ' + errores.join(' | '))
    return {
      status: 'partial_batch',
      inserted: insertedKeys.length,
      already_present: placed.length,
      inserted_keys: insertedKeys,
      failed_keys: failedKeys,
      pending_keys: pendientesRestantes,
      placed: placedParcial,
      consumos: countConsumed_(after, cols, email),
      limite: limite,
      limit_source: limitInfo.source,
      retryable: true,
      message:
        'El lote se escribio parcialmente. Las filas ya escritas conservan su clave y un ' +
        'reintento del mismo lote solo insertara las que faltan.',
    }
  }

  const consumosDespues = countConsumed_(after, cols, email)
  if (consumosDespues > limite) {
    // Neutralizo SOLO las filas de este lote. No borro ninguna.
    for (const item of pendientes) {
      try {
        neutralizeOwn_(sheet, cols, item.idempotencyKey)
      } catch (err) {
        console.error('Fallo al neutralizar lote: ' + err)
        return {
          status: 'neutralize_failed',
          consumos: consumosDespues,
          limite: limite,
          message: 'No se pudieron marcar como rechazadas todas las filas del lote. Requiere reconciliacion.',
        }
      }
    }
    const final = readRows_(sheet, cols)
    return {
      status: 'quota_exceeded',
      consumos: countConsumed_(final, cols, email),
      limite: limite,
      limit_source: limitInfo.source,
      neutralized: true,
      message: 'El lote superaba el limite; sus registros quedaron marcados como rechazados.',
    }
  }

  updateCounter_(b, consumosDespues)

  const finalRows = readRows_(sheet, cols)
  const placedFinal = []
  for (const item of b.rows) {
    const idx = findByKey_(finalRows, cols, item.idempotencyKey)
    placedFinal.push({ idempotencyKey: item.idempotencyKey, row: idx === -1 ? null : idx + 2 })
  }

  return {
    status: 'ok',
    idempotent: false,
    inserted: insertedKeys.length,
    already_present: placed.length,
    placed: placedFinal,
    consumos: consumosDespues,
    limite: limite,
    limit_source: limitInfo.source,
  }
}

// ---------------------------------------------------------------------------
// Esquema de columnas
// ---------------------------------------------------------------------------

function openGastos_(spreadsheetId) {
  if (!spreadsheetId) throw new Error('falta spreadsheetId')
  const ss = SpreadsheetApp.openById(spreadsheetId)
  const sheet = ss.getSheetByName(SHEET_NAME)
  if (!sheet) throw new Error('No existe la hoja ' + SHEET_NAME)
  return sheet
}

/**
 * Detecta la posición real de las columnas de control leyendo la fila 1.
 *
 * Devuelve `{ ok: true, key, state, createdBy, lastCol }` o
 * `{ ok: false, status, message }` si el esquema no es utilizable.
 *
 * Decisiones:
 *  - Las posiciones se toman SIEMPRE del nombre de la cabecera en la fila 1.
 *  - Si la fila 1 está COMPLETAMENTE VACÍA, el esquema es AMBIGUO y se detiene
 *    con `schema_conflict`.
 *
 *    Antes esta rama devolvía las posiciones históricas (L/M/N) como si las
 *    cabeceras ya existieran. Eso producía dos fallos encadenados: `save_`
 *    escribía la clave en una columna que nunca se había cabecera, y `migrate_`
 *    respondía `already_migrated` sin escribir nada. Sin fila de cabeceras no
 *    hay forma de verificar que la L sea realmente `creado_por`, y asumirlo
 *    haría que el consumo se contara sobre la columna equivocada. Es más seguro
 *    detenerse y que una persona confirme la estructura.
 *
 *    Ninguna hoja de clientes está en este caso: las cuatro hojas `Gastos`
 *    verificadas tienen fila de cabeceras con `creado_por` en la L.
 *
 *  - Si falta `creado_por` con la fila 1 poblada, también se detiene: mismo
 *    motivo.
 *  - Las tres columnas de control deben ser distintas entre sí.
 */
function resolveLayout_(sheet, options) {
  const requireControl = !(options && options.requireControl === false)
  const lastCol = Math.max(sheet.getLastColumn(), LEGACY_WIDTH)
  const values = sheet.getRange(1, 1, 1, lastCol).getValues()[0]
  const hayCabeceras = values.some(function (v) {
    return String(v === null || v === undefined ? '' : v).trim() !== ''
  })

  const find = function (name) {
    for (let i = 0; i < values.length; i++) {
      if (norm_(values[i]) === name) return i + 1
    }
    return -1
  }

  if (!hayCabeceras) {
    // Fila 1 vacía: NO se asume ninguna posición. Ver el comentario del
    // docblock. Se detiene aquí tanto para operar como para migrar.
    return {
      ok: false,
      status: 'schema_conflict',
      message:
        'La fila 1 de ' + SHEET_NAME + ' esta completamente vacia, asi que no se puede verificar ' +
        'que columna es ' + HEADER_CREATED_BY + ' ni donde deben ir ' + HEADER_KEY + '/' + HEADER_STATE +
        '. No se asumio el esquema historico ni se escribio nada. Anade las cabeceras manualmente ' +
        'y vuelve a ejecutar la migracion.',
      esquema_detectado: 'sin_cabeceras',
    }
  }

  const createdBy = find(HEADER_CREATED_BY)
  if (createdBy === -1) {
    return {
      ok: false,
      status: 'schema_conflict',
      message:
        'No se encontro la cabecera ' + HEADER_CREATED_BY + ' en la fila 1 de ' + SHEET_NAME +
        '. No se asume la columna L porque contaria el consumo sobre la columna equivocada. ' +
        'No se escribio nada.',
    }
  }

  const key = find(HEADER_KEY)
  const state = find(HEADER_STATE)
  if (key === -1 || state === -1) {
    if (!requireControl) {
      // Estado previo a la migración: se devuelve el layout con -1 para que la
      // decisión la tome el llamador (migrate_ las añade).
      return {
        ok: true,
        key: key,
        state: state,
        createdBy: createdBy,
        lastCol: Math.max(lastCol, key, state),
        esquema: 'cabeceras',
      }
    }
    return {
      ok: false,
      status: 'schema_not_migrated',
      message:
        'Faltan las cabeceras ' + HEADER_KEY + '/' + HEADER_STATE + ' en ' + SHEET_NAME +
        '. Ejecuta la migracion (action=migrate) antes de operar. No se escribio nada.',
    }
  }
  if (requireControl && (key === state || key === createdBy || state === createdBy)) {
    return {
      ok: false,
      status: 'schema_conflict',
      message:
        'Cabeceras de control en posiciones invalidas (' + HEADER_KEY + '=' + key + ', ' +
        HEADER_STATE + '=' + state + ', ' + HEADER_CREATED_BY + '=' + createdBy +
        '). No se escribio nada.',
    }
  }

  return {
    ok: true,
    key: key,
    state: state,
    createdBy: createdBy,
    lastCol: Math.max(lastCol, key, state),
    esquema: 'cabeceras',
  }
}

/** Convierte un error de esquema en la respuesta que espera el backend. */
function layoutError_(layout) {
  return { status: layout.status, message: layout.message }
}

/**
 * Construye la fila sobre el esquema DETECTADO: los datos en sus columnas y
 * la clave y el estado en las posiciones reales de `cols`.
 *
 * `creado_por` se fuerza al email autenticado: así el consumo siempre se
 * atribuye al usuario correcto aunque la fila venha manipulada.
 */
function buildRow_(inputRow, key, state, cols, email) {
  const width = Math.max(cols.createdBy, cols.key, cols.state)
  const row = []
  for (let i = 0; i < width; i++) {
    row.push(i < inputRow.length ? inputRow[i] : '')
  }
  row[cols.createdBy - 1] = String(email || '')
  row[cols.key - 1] = String(key)
  row[cols.state - 1] = String(state)
  return row
}

// ---------------------------------------------------------------------------
// Validaciones
// ---------------------------------------------------------------------------

function validateKey_(key) {
  const k = String(key === null || key === undefined ? '' : key).trim()
  if (!k) return { status: 'bad_request', message: 'idempotencyKey vacio' }
  if (k.length > MAX_KEY_LENGTH) {
    return {
      status: 'bad_request',
      message: 'idempotencyKey excede ' + MAX_KEY_LENGTH + ' caracteres',
    }
  }
  return null
}

function isEmail_(value) {
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(String(value || ''))
}

/**
 * Valida TODO el lote antes de escribir una sola fila.
 *
 * Rechaza: elementos ausentes, claves vacías o demasiado largas, filas que no
 * son arreglos, y CLAVES DUPLICADAS dentro del mismo lote (que de otro modo
 * insertarían dos filas con la misma clave). También exige que todas las filas
 * pertenezcan al mismo usuario, porque el cupo se calcula por usuario y un
 * lote mixto haría imposible atribuir el consumo con una sola comparación
 * contra `Usuarios!E`.
 *
 * `creado_por` se lee en la posición REAL detectada por cabecera
 * (`createdByCol`), nunca en una columna fija: suponer la L haría validar el
 * contenido equivocado, con rechazos falsos o, peor, lotes aceptados cuyo
 * consumo se atribuiría a la columna equivocada.
 */
function validateBatchItems_(rows, email, createdByCol) {
  const vistos = {}
  const problemas = []
  const createdBy = (createdByCol && createdByCol > 0)
    ? createdByCol
    : LEGACY_CREATED_BY_COL

  for (let i = 0; i < rows.length; i++) {
    const item = rows[i]
    const ref = 'fila[' + i + ']'
    if (!item || typeof item !== 'object') {
      problemas.push(ref + ': elemento ausente o no es un objeto')
      continue
    }
    const keyError = validateKey_(item.idempotencyKey)
    if (keyError) {
      problemas.push(ref + ': ' + keyError.message)
      continue
    }
    const key = String(item.idempotencyKey).trim()
    if (vistos[key]) {
      problemas.push(ref + ': idempotencyKey duplicada dentro del lote (' + key + ')')
      continue
    }
    vistos[key] = true

    if (!Array.isArray(item.row) || item.row.length === 0) {
      problemas.push(ref + ': row vacio o no es un arreglo')
      continue
    }
    const creado = norm_(item.row[createdBy - 1])
    if (creado && creado !== norm_(email)) {
      problemas.push(
        ref + ': creado_por (' + creado + ') no coincide con el usuario del lote (' +
        norm_(email) + ')'
      )
    }
  }

  if (problemas.length > 0) {
    return {
      status: 'bad_request',
      message: 'El lote tiene filas invalidas. No se escribio nada.',
      errores: problemas,
    }
  }
  return null
}

// ---------------------------------------------------------------------------
// Utilidades de hoja
// ---------------------------------------------------------------------------

function readRows_(sheet, cols) {
  const lastRow = sheet.getLastRow()
  if (lastRow < 2) return []
  const width = Math.max(cols.lastCol, cols.key, cols.state, cols.createdBy)
  return sheet.getRange(2, 1, lastRow - 1, width).getValues()
}

/**
 * Consumo vigente: filas del usuario cuyo estado NO es 'rechazado'.
 * Los registros históricos tienen `estado` vacío y cuentan como 'ok'.
 */
function countConsumed_(data, cols, email) {
  let n = 0
  for (let i = 0; i < data.length; i++) {
    const row = data[i]
    if (norm_(row[cols.createdBy - 1]) !== email) continue
    if (norm_(row[cols.state - 1]) === STATE_REJECTED) continue
    n++
  }
  return n
}

function findByKey_(data, cols, key) {
  const target = String(key || '').trim()
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
    for (var i = 0; i < values.length; i++) {
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
 * Extrae el secreto compartido de la petición.
 *
 * Se acepta desde la QUERY STRING (como hace el backend real) y también desde
 * el cuerpo JSON. Antes solo se leía de `e.parameter`, de modo que cualquier
 * cliente que enviara el token en el cuerpo recibía `unauthorized` aunque el
 * secreto fuese correcto: `e.parameter.token` era `undefined` y la comparación
 * fallaba antes de llegar a comparar nada.
 *
 * El valor se devuelve SIN recortar para que el diagnóstico pueda medir la
 * longitud real; el recorte se aplica al comparar.
 */
function extractToken_(e) {
  if (e.parameter && e.parameter.token !== undefined && e.parameter.token !== null &&
      String(e.parameter.token) !== '') {
    return String(e.parameter.token)
  }
  var body = readBody_(e)
  if (body && typeof body.token === 'string' && body.token !== '') return body.token
  return ''
}

/**
 * Comparación de secretos. Apps Script no ofrece comparación de tiempo
 * constante; el riesgo es teórico porque el canal ya es HTTPS y la respuesta no
 * filtra longitud útil. Aun así se evita la comparación directa con `===`
 * sobre operandos de distinta longitud mediante un hash previo.
 *
 * `Utilities.computeDigest` devuelve un array de bytes CON SIGNO. El XOR entre
 * dos valores idénticos da 0 con cualquiera de las dos representaciones, así
 * que la comparación es válida tal cual.
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

/**
 * Serializa la respuesta.
 *
 * CONTRATO HTTP REAL DE APPS SCRIPT: `ContentService` NO permite fijar un
 * código de estado. TODAS las respuestas salen con HTTP 200 y el resultado va
 * en el campo `status` del cuerpo JSON.
 *
 * El backend decide por `status`, nunca por el código HTTP, y trata cualquier
 * estado desconocido como fallo.
 */
function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON
  )
}