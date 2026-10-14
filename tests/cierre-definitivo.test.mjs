/**
 * Pruebas de los 10 puntos exigidos en el cierre definitivo de `GastosLock.gs`.
 *
 * Todas en memoria: NINGUNA hoja real de clientes se toca.
 * La serialización real de `LockService` NO se puede reproducir aquí y queda
 * para el entorno desplegado (ver `docs/DEPLOY_GAS_LOCK.md` §8).
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'fs'
import {
  loadGasLock, gastosSheetMigrada, usuariosSheet,
  FakeSheet, FakeSpreadsheet, BASE_SHEET_ID, CONFIG_ID,
} from './harness-gaslock.mjs'

const SECRETO = 'secreto-de-prueba-1234567890'
const EMAIL = 'user@empresa.cl'

function base({ limite = 100, failOpenId = null, header = null } = {}) {
  const g = header ? new FakeSheet('Gastos', [header], Math.max(header.length, 14)) : gastosSheetMigrada()
  const u = usuariosSheet([[EMAIL, 'h', 'Empresa', 'pro', limite, 0, 'TRUE', 'user', '', BASE_SHEET_ID]])
  const sheets = {
    [BASE_SHEET_ID]: new FakeSpreadsheet(BASE_SHEET_ID, { Gastos: g, Usuarios: u }),
    [CONFIG_ID]: new FakeSpreadsheet(CONFIG_ID, { Usuarios: u }),
  }
  const { invoke, ctx } = loadGasLock({ secret: SECRETO, sheets, failOpenId })
  return { invoke, ctx, g, u }
}

const fila = (email = EMAIL) => [
  new Date().toISOString(), '2026-10-13', '76258687-8', 'COPEC S.A.', 53500,
  'Otros', '12345', '', '', 0, '', email,
]
const guardar = (invoke, over = {}) =>
  invoke({
    action: 'save', spreadsheetId: BASE_SHEET_ID, configSpreadsheetId: CONFIG_ID,
    userEmail: EMAIL, idempotencyKey: 'k1', limite: 100, row: fila(), ...over,
  })
const lote = (invoke, claves, over = {}) =>
  invoke({
    action: 'saveBatch', spreadsheetId: BASE_SHEET_ID, configSpreadsheetId: CONFIG_ID,
    userEmail: EMAIL, limite: 100,
    rows: claves.map((k) => ({ idempotencyKey: k, row: fila() })),
    ...over,
  })

// ===========================================================================
// 1. Límite disponible y límite agotado
// ===========================================================================
test('1a límite disponible: registra y devuelve el de Usuarios!E', () => {
  const { invoke, g } = base({ limite: 3 })
  const r = guardar(invoke, { limite: 999 })
  assert.equal(r.status, 'ok')
  assert.equal(r.limite, 3)
  assert.equal(r.limit_source, 'Usuarios!E')
  assert.equal(r.consumos, 1)
  assert.equal(g.grid.length, 2)
})

test('1b límite agotado: rechaza ANTES de escribir', () => {
  const { invoke, g } = base({ limite: 1 })
  assert.equal(guardar(invoke, { idempotencyKey: 'a' }).status, 'ok')
  const antes = g.grid.length
  const r = guardar(invoke, { idempotencyKey: 'b' })
  assert.equal(r.status, 'quota_exceeded')
  assert.equal(r.consumos, 1)
  assert.equal(g.grid.length, antes, 'ninguna fila nueva')
})

// ===========================================================================
// 2. Fallo de lectura de Usuarios!E: ninguna escritura
// ===========================================================================
test('2 fallo de Usuarios!E: limit_unavailable y cero escrituras', () => {
  const { invoke, g } = base({ failOpenId: CONFIG_ID })
  const r = guardar(invoke, { limite: 500 })
  assert.equal(r.status, 'limit_unavailable')
  assert.equal(r.motivo, 'read_error')
  assert.equal(r.retryable, true)
  assert.equal(g.writes.length, 0, 'ni una escritura de ningún tipo')
  assert.equal(g.grid.length, 1)
})

test('2b saveBatch sin límite legible: cero escrituras', () => {
  const { invoke, g } = base({ failOpenId: CONFIG_ID })
  const r = lote(invoke, ['p:a', 'p:b'])
  assert.equal(r.status, 'limit_unavailable')
  assert.equal(g.writes.length, 0)
})

// ===========================================================================
// 3. Esquema incompatible: ninguna escritura
// ===========================================================================
test('3a cabeceras sin creado_por: esquema ambiguo, no se escribe', () => {
  // Fila 1 con contenido pero sin `creado_por`: asumir la L contaría mal.
  const { invoke, g } = base({ header: ['id', 'fecha', 'rut', 'proveedor', 'monto'] })
  const r = guardar(invoke, {})
  assert.equal(r.status, 'schema_conflict')
  assert.match(r.message, /creado_por/)
  assert.equal(g.writes.length, 0)
})

test('3b sin columnas de control: schema_not_migrated, no se escribe', () => {
  const header = ['timestamp', 'fecha', 'rut', 'proveedor', 'monto', 'categoria',
    'boleta_numero', 'giro', 'notas', 'ocr_confidence', 'image_url', 'creado_por']
  const { invoke, g } = base({ header })
  const r = guardar(invoke, {})
  assert.equal(r.status, 'schema_not_migrated')
  assert.equal(g.writes.length, 0)
})

test('3c hoja sin fila de cabeceras: se detiene, no asume posiciones', () => {
  // Comportamiento corregido: sin cabeceras no se puede verificar cuál es
  // `creado_por`, así que NO se asume L/M/N. Antes devolvía ok y escribía la
  // clave en una columna nunca cabecera.
  const { invoke, g } = base({ header: [] })
  const r = guardar(invoke, {})
  assert.equal(r.status, 'schema_conflict', 'debe detenerse, no operar sobre un esquema supuesto')
  assert.equal(g.writes.length, 0, 'cero escrituras')
})

test('3d cabeceras desplazadas: la clave se escribe donde dice la cabecera', () => {
  // Esquema no estándar: control en P y Q, no en M y N.
  const h = ['timestamp', 'fecha', 'rut', 'proveedor', 'monto', 'categoria',
    'boleta_numero', 'giro', 'notas', 'ocr', 'image_url', 'creado_por',
    'columna_extra', '', '', 'idempotency_key', 'estado']
  const { invoke, g } = base({ header: h })
  const r = guardar(invoke, {})
  assert.equal(r.status, 'ok')
  assert.equal(g.grid[1][15], 'k1', 'P = idempotency_key (posición detectada)')
  assert.equal(g.grid[1][16], 'ok', 'Q = estado')
  assert.notEqual(g.grid[1][12], 'k1', 'NO se escribió a ciegas en M')
})

// ===========================================================================
// 4. Migración repetida sin cambios destructivos
// ===========================================================================
test('4a migrar dos veces: la segunda no cambia nada', () => {
  const h = ['timestamp', 'fecha', 'rut', 'proveedor', 'monto', 'categoria',
    'boleta_numero', 'giro', 'notas', 'ocr', 'image_url', 'creado_por']
  const { invoke, g } = base({ header: h })
  g.grid.push(fila('previo@otra.cl'))

  const r1 = invoke({ action: 'migrate', spreadsheetId: BASE_SHEET_ID })
  assert.equal(r1.status, 'migrated')
  const filasAntes = g.grid.length
  assert.equal(g.grid[0][12], 'idempotency_key')
  assert.equal(g.grid[0][13], 'estado')

  const r2 = invoke({ action: 'migrate', spreadsheetId: BASE_SHEET_ID })
  assert.equal(r2.status, 'already_migrated')
  assert.deepEqual(r2.added, [])
  assert.equal(g.grid.length, filasAntes, 'no añadió ni quitó filas de datos')
})

test('4b migrar no modifica los datos históricos', () => {
  const h = ['timestamp', 'fecha', 'rut', 'proveedor', 'monto', 'categoria',
    'boleta_numero', 'giro', 'notas', 'ocr', 'image_url', 'creado_por']
  const { invoke, g } = base({ header: h })
  const historico = fila('cliente@empresa.cl')
  g.grid.push(historico.slice())
  const copia = JSON.stringify(g.grid[1])

  invoke({ action: 'migrate', spreadsheetId: BASE_SHEET_ID })
  assert.equal(JSON.stringify(g.grid[1]), copia, 'el registro histórico quedó intacto')
})

test('4c destino ocupado: se detiene sin sobrescribir', () => {
  const h = ['timestamp', 'fecha', 'rut', 'proveedor', 'monto', 'categoria',
    'boleta_numero', 'giro', 'notas', 'ocr', 'image_url', 'creado_por',
    'dato_ajeno']
  const { invoke, g } = base({ header: h })
  const r = invoke({ action: 'migrate', spreadsheetId: BASE_SHEET_ID })
  assert.equal(r.status, 'schema_conflict')
  assert.equal(g.grid[0][12], 'dato_ajeno', 'NO se sobrescribió')
  assert.equal(g.writes.filter((w) => w.op === 'setValue').length, 0)
})

test('4d migrar exige el secreto', () => {
  const { invoke, g } = base()
  const r = invoke({ action: 'migrate', spreadsheetId: BASE_SHEET_ID }, 'incorrecto')
  assert.equal(r.status, 'unauthorized')
  assert.equal(g.writes.length, 0)
})

// ===========================================================================
// 5. Claves duplicadas dentro del mismo lote
// ===========================================================================
test('5a clave repetida dentro del lote: se rechaza entero', () => {
  const { invoke, g } = base()
  const r = lote(invoke, ['p:a', 'p:b', 'p:a'])
  assert.equal(r.status, 'bad_request')
  assert.match(r.message, /No se escribio nada/)
  assert.ok(r.errores.some((e) => /duplicada dentro del lote/.test(e)), r.errores.join('|'))
  assert.equal(g.writes.length, 0, 'nada se escribió')
})

test('5b clave vacía o fila malformada: se rechaza entero', () => {
  const { invoke, g } = base()
  const r = invoke({
    action: 'saveBatch', spreadsheetId: BASE_SHEET_ID, configSpreadsheetId: CONFIG_ID,
    userEmail: EMAIL, limite: 100,
    rows: [
      { idempotencyKey: 'p:a', row: fila() },
      { idempotencyKey: '', row: fila() },
      { idempotencyKey: 'p:c', row: [] },
    ],
  })
  assert.equal(r.status, 'bad_request')
  assert.equal(r.errores.length, 2, 'dos filas inválidas detectadas')
  assert.equal(g.writes.length, 0)
})

test('5c creado_por distinto al del lote: se rechaza entero', () => {
  const { invoke, g } = base()
  const r = invoke({
    action: 'saveBatch', spreadsheetId: BASE_SHEET_ID, configSpreadsheetId: CONFIG_ID,
    userEmail: EMAIL, limite: 100,
    rows: [
      { idempotencyKey: 'p:a', row: fila() },
      { idempotencyKey: 'p:b', row: fila('otro@empresa.cl') },
    ],
  })
  assert.equal(r.status, 'bad_request')
  assert.ok(r.errores.some((e) => /creado_por/.test(e)))
  assert.equal(g.writes.length, 0, 'un lote mixto impediría atribuir el consumo')
})

test('5d se valida TODO antes de escribir: una fila mala invalida el lote', () => {
  const { invoke, g } = base()
  const r = lote(invoke, ['p:a', 'p:b', 'x'.repeat(201)])
  assert.equal(r.status, 'bad_request')
  assert.equal(g.writes.length, 0, 'ni siquiera las filas válidas se escribieron')
})

// ===========================================================================
// 6. Reintento de un lote ya registrado
// ===========================================================================
test('6 reintento del mismo lote: no duplica ni vuelve a consumir', () => {
  const { invoke, g } = base({ limite: 50 })
  const r1 = lote(invoke, ['p:a', 'p:b', 'p:c'])
  assert.equal(r1.status, 'ok')
  assert.equal(r1.inserted, 3)
  assert.equal(g.grid.length, 4)

  const r2 = lote(invoke, ['p:a', 'p:b', 'p:c'])
  assert.equal(r2.status, 'ok')
  assert.equal(r2.inserted, 0)
  assert.equal(r2.already_present, 3)
  assert.equal(r2.consumos, 3, 'no se consumió de nuevo')
  assert.equal(g.grid.length, 4, 'siguen siendo 3 filas')
})

test('6b reintento parcial: solo inserta lo que falta', () => {
  const { invoke, g } = base({ limite: 50 })
  lote(invoke, ['p:a', 'p:b'])
  const r = lote(invoke, ['p:a', 'p:b', 'p:c'])
  assert.equal(r.inserted, 1)
  assert.equal(r.already_present, 2)
  assert.equal(g.grid.length, 4)
})

// ===========================================================================
// 7. Fallo simulado después de insertar una parte del lote
// ===========================================================================
test('7 fallo a mitad del lote: partial_batch con detalle auditable', () => {
  const { invoke, g } = base({ limite: 50 })
  let appends = 0
  g.failOn = {
    op: 'appendRow',
    match: () => { appends++; if (appends === 3) throw new Error('Cuota de escritura de Sheets') },
  }
  const r = lote(invoke, ['p:a', 'p:b', 'p:c', 'p:d'])
  assert.equal(r.status, 'partial_batch')
  assert.equal(r.inserted, 2)
  assert.deepEqual(r.inserted_keys, ['p:a', 'p:b'])
  assert.deepEqual(r.failed_keys, ['p:c'])
  assert.deepEqual(r.pending_keys, ['p:d'], 'las restantes NO se escribieron')
  assert.equal(r.retryable, true)
  assert.ok(r.placed.some((p) => p.row === 2), 'las escritas quedan auditables')
  assert.equal(g.grid.length, 3, 'cabecera + 2 escritas')
})

// ===========================================================================
// 8. Recuperación del lote parcial sin duplicar
// ===========================================================================
test('8 reintento tras partial_batch completa el lote sin duplicar', () => {
  const { invoke, g } = base({ limite: 50 })
  let appends = 0
  g.failOn = {
    op: 'appendRow',
    match: () => { appends++; if (appends === 3) throw new Error('Fallo transitorio') },
  }
  const r1 = lote(invoke, ['p:a', 'p:b', 'p:c', 'p:d'])
  assert.equal(r1.status, 'partial_batch')
  assert.equal(g.grid.length, 3)

  g.failOn = null // se recupera la escritura
  const r2 = lote(invoke, ['p:a', 'p:b', 'p:c', 'p:d'])
  assert.equal(r2.status, 'ok')
  assert.equal(r2.inserted, 2, 'solo las que faltaban')
  assert.equal(r2.already_present, 2)
  assert.equal(r2.consumos, 4, 'consumo final correcto, sin duplicados')
  assert.equal(g.grid.length, 5, 'cabecera + 4 filas, ninguna duplicada')

  const claves = g.grid.slice(1).map((f) => f[12])
  assert.deepEqual(claves.sort(), ['p:a', 'p:b', 'p:c', 'p:d'], 'sin claves repetidas')
})

test('8b un lote parcial NO se marca como completado', async () => {
  const { lockSinEscritura } = await import('../src/lib/puente-idempotencia.ts')
  // `partial_batch` wrote some rows: the rendición must stay recoverable.
  assert.equal(lockSinEscritura('partial_batch'), false,
    'con filas escritas no se revierte: el reintento las reconcilia')
  assert.equal(lockSinEscritura('write_failed'), false, 'idem para save_')
})

// ===========================================================================
// 9. Conservación de creado_por
// ===========================================================================
test('9a creado_por se conserva exactamente en su columna', () => {
  const { invoke, g } = base()
  guardar(invoke, { idempotencyKey: 'a' })
  const f = g.grid[1]
  assert.equal(f.length, 14)
  assert.equal(f[11], EMAIL, 'L = creado_por intacto')
  assert.equal(f[1], '2026-10-13', 'B = fecha intacta')
  assert.equal(f[4], 53500, 'E = monto intacto')
  assert.equal(f[12], 'a', 'M = idempotency_key')
  assert.equal(f[13], 'ok', 'N = estado')
})

test('9b creado_por manipulado se corrige al usuario autenticado', () => {
  const { invoke, g } = base()
  // El backend intenta colar otro usuario en la fila.
  guardar(invoke, { idempotencyKey: 'a', row: fila('intruso@otro.cl') })
  assert.equal(g.grid[1][11], EMAIL, 'se atribuye al usuario autenticado')
  const r = guardar(invoke, { idempotencyKey: 'b' })
  assert.equal(r.consumos, 2, 'solo los 2 gastos propios; el intruso no consumió cupo')
})

test('9c la fila se construye sobre el esquema detectado, no sobre M/N fijos', () => {
  const h = ['timestamp', 'fecha', 'rut', 'proveedor', 'monto', 'categoria',
    'boleta_numero', 'giro', 'notas', 'ocr', 'image_url', 'creado_por',
    'extra', '', '', 'idempotency_key', 'estado']
  const { invoke, g } = base({ header: h })
  guardar(invoke, { idempotencyKey: 'a' })
  assert.equal(g.grid[1][15], 'a', 'clave en la posición detectada')
  assert.equal(g.grid[1][11], EMAIL, 'creado_por en L')
})

// ===========================================================================
// 10. Consumo: solo filas del usuario, excluyendo 'rechazado'
// ===========================================================================
test('10a cuenta solo las filas del usuario', () => {
  const { invoke, g } = base({ limite: 100 })
  guardar(invoke, { idempotencyKey: 'a' })
  // Gasto de OTRO usuario, insertado directamente.
  g.grid.push(fila('otro@empresa.cl'))
  const r = guardar(invoke, { idempotencyKey: 'b' })
  assert.equal(r.consumos, 2, 'el gasto ajeno no cuenta')
})

test('10b un registro rechazado no consume cupo', () => {
  const { invoke, ctx, g } = base({ limite: 100 })
  guardar(invoke, { idempotencyKey: 'a' })
  guardar(invoke, { idempotencyKey: 'b' })
  // Marcar 'a' como rechazado (neutralización).
  const sheet = ctx.openGastos_(BASE_SHEET_ID)
  ctx.neutralizeOwn_(sheet, ctx.resolveLayout_(sheet, {}), 'a')
  const r = guardar(invoke, { idempotencyKey: 'c' })
  assert.equal(r.consumos, 2, 'la rechazada no cuenta: 1 previa + 1 nueva = 2')
})

test('10c los registros históricos sin estado cuentan como válidos', () => {
  const { invoke, ctx, g } = base({ limite: 100 })
  g.grid.push(fila(EMAIL)) // histórico: sin clave ni estado
  const r = guardar(invoke, { idempotencyKey: 'a' })
  assert.equal(r.consumos, 2, 'el histórico cuenta')
})

test('10d el consumo real manda aunque Usuarios!F esté desincronizado', () => {
  const { invoke, g, u } = base({ limite: 2 })
  guardar(invoke, { idempotencyKey: 'a' })
  guardar(invoke, { idempotencyKey: 'b' })
  u.grid[1][5] = 0 // contador informativo roto
  const r = guardar(invoke, { idempotencyKey: 'c' })
  assert.equal(r.status, 'quota_exceeded')
  assert.equal(r.consumos, 2)
})

// ===========================================================================
// Coherencia documental
// ===========================================================================
test('El archivo no afirma códigos HTTP inexistentes', () => {
  const src = readFileSync('google-apps-script/GastosLock.gs', 'utf8')
  assert.match(src, /NO permite fijar un c[oó]digo de estado/)
  assert.equal(/responde 401/.test(src), false, 'no debe afirmar un 401 imposible')
  assert.equal(/json_\(\{[^}]*status: 'unauthorized' \}, 401\)/.test(src), false)
  assert.equal(/source: 'session'/.test(src), false, 'sin fallback de límite')
  assert.equal(/session_fallback/.test(src), false)
})

test('El docblock de resolveLimit_ ya no describe el fallback eliminado', () => {
  const src = readFileSync('google-apps-script/GastosLock.gs', 'utf8')
  const i = src.indexOf('function resolveLimit_')
  const bloque = src.slice(Math.max(0, i - 900), i)
  assert.equal(/se usa el valor enviado/.test(bloque), false,
    'el comentario anterior describía un fallback que ya no existe')
})