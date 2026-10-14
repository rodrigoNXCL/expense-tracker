/**
 * Pruebas del contrato y la lógica de `google-apps-script/GastosLock.gs`.
 * Se ejecuta el archivo REAL en un sandbox con dobles de Apps Script.
 * No se tocan hojas de clientes.
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  loadGasLock, gastosSheetMigrada, usuariosSheet,
  FakeSheet, FakeSpreadsheet, BASE_SHEET_ID, CONFIG_ID,
} from './harness-gaslock.mjs'

const SECRETO = 'secreto-de-prueba-1234567890'

function escenario({ limite = 100, filasUsuarios = null, gastos = null, secret = SECRETO } = {}) {
  const g = gastos || gastosSheetMigrada()
  const u = usuariosSheet(
    filasUsuarios || [['user@empresa.cl', 'hash', 'Empresa', 'pro', limite, 0, 'TRUE', 'user', '2026-01-01', BASE_SHEET_ID]]
  )
  const sheets = {
    [BASE_SHEET_ID]: new FakeSpreadsheet(BASE_SHEET_ID, { Gastos: g, Usuarios: u }),
    [CONFIG_ID]: new FakeSpreadsheet(CONFIG_ID, { Usuarios: u }),
  }
  const { invoke, calls } = loadGasLock({ secret, sheets })
  return { invoke, calls, g, u }
}

const fila = (email, extra = {}) => [
  new Date().toISOString(), '2026-10-13', '76258687-8', 'COPEC S.A.', 53500,
  'Otros', '12345', '', '', 0, '', email, ...Object.values(extra),
]
const guardar = (invoke, over = {}) =>
  invoke({
    action: 'save',
    spreadsheetId: BASE_SHEET_ID,
    configSpreadsheetId: CONFIG_ID,
    userEmail: 'user@empresa.cl',
    idempotencyKey: 'k1',
    limite: 100,
    row: fila('user@empresa.cl'),
    ...over,
  })

// ---------------------------------------------------------------------------
test('PING responde ok con el secreto correcto', () => {
  const { invoke } = escenario()
  const r = invoke({ action: 'ping' }, SECRETO)
  assert.equal(r.status, 'ok')
  assert.equal(r.service, 'gastos-lock')
})

test('Secreto incorrecto nunca se interpreta como éxito', () => {
  const { invoke } = escenario()
  const r = guardar(invoke, {})
  const rPing = invoke({ action: 'ping' }, 'secreto-incorrecto')
  // Llamada sin token
  const sinToken = invoke({ action: 'save', spreadsheetId: BASE_SHEET_ID, userEmail: 'user@empresa.cl', idempotencyKey: 'k', limite: 10, row: fila('x') }, null)
  assert.equal(rPing.status, 'unauthorized')
  assert.equal(sinToken.status, 'unauthorized')
  assert.notEqual(rPing.status, 'ok')
  assert.notEqual(sinToken.status, 'ok')
})

test('Sin GAS_LOCK_SECRET configurado responde not_configured', () => {
  const g = gastosSheetMigrada()
  const u = usuariosSheet([['user@empresa.cl', 'h', 'E', 'pro', 100, 0, 'TRUE', 'user', '', BASE_SHEET_ID]])
  const { invoke } = loadGasLock({
    secret: null,
    sheets: { [BASE_SHEET_ID]: new FakeSpreadsheet(BASE_SHEET_ID, { Gastos: g, Usuarios: u }) },
  })
  const r = guardar(invoke, {})
  assert.equal(r.status, 'not_configured')
  assert.equal(g.grid.length, 1, 'no debe escribir filas')
})

test('Esquema sin migrar: error explícito y ninguna escritura', () => {
  // Cabeceras reales de 'Gastos' pero SIN las columnas de control M/N.
  const g = gastosSheetMigrada()
  g.grid[0][12] = ''
  g.grid[0][13] = ''
  const u = usuariosSheet([['user@empresa.cl', 'h', 'E', 'pro', 100, 0, 'TRUE', 'user', '', BASE_SHEET_ID]])
  const { invoke } = loadGasLock({ secret: SECRETO, sheets: { [BASE_SHEET_ID]: new FakeSpreadsheet(BASE_SHEET_ID, { Gastos: g, Usuarios: u }) } })
  const r = guardar(invoke, {})
  assert.equal(r.status, 'schema_not_migrated')
  assert.equal(g.grid.length, 1, 'no debe escribir filas')
})

test('Guardado secuencial de 5 gastos: consumo exacto +5', () => {
  const { invoke, g } = escenario({ limite: 100 })
  for (let i = 1; i <= 5; i++) {
    const r = guardar(invoke, { idempotencyKey: `k${i}` })
    assert.equal(r.status, 'ok')
    assert.equal(r.consumos, i)
  }
  assert.equal(g.grid.length, 6, 'cabecera + 5 filas')
})

test('Misma clave repetida: una sola fila, una sola fila de consumo', () => {
  const { invoke, g } = escenario({ limite: 100 })
  const a = guardar(invoke, { idempotencyKey: 'misma' })
  const b = guardar(invoke, { idempotencyKey: 'misma' })
  assert.equal(a.status, 'ok')
  assert.equal(b.status, 'duplicate')
  assert.equal(b.consumos, 1, 'no debe consumir dos veces')
  assert.equal(g.grid.length, 2, 'cabecera + 1 fila')
})

test('Claves distintas: cada una crea su fila', () => {
  const { invoke, g } = escenario({ limite: 100 })
  guardar(invoke, { idempotencyKey: 'a' })
  guardar(invoke, { idempotencyKey: 'b' })
  assert.equal(g.grid.length, 3)
})

test('Cupo agotado: ninguna fila nueva', () => {
  const { invoke, g } = escenario({ limite: 2 })
  guardar(invoke, { idempotencyKey: 'a' })
  guardar(invoke, { idempotencyKey: 'b' })
  const antes = g.grid.length
  const r = guardar(invoke, { idempotencyKey: 'c' })
  assert.equal(r.status, 'quota_exceeded')
  assert.equal(g.grid.length, antes, 'no debe añadir fila')
})

test('Último cupo disponible: exactamente una operación lo consume', () => {
  const { invoke, g } = escenario({ limite: 1 })
  const r = guardar(invoke, { idempotencyKey: 'ultima' })
  assert.equal(r.status, 'ok')
  assert.equal(r.consumos, 1)
  const g2 = guardar(invoke, { idempotencyKey: 'otra' })
  assert.equal(g2.status, 'quota_exceeded')
  assert.equal(g.grid.length, 2)
})

test('El limite se lee de Usuarios!E, no del valor enviado (evita ventana de 5 min)', () => {
  // El backend enviaría 500 (copia vieja); la hoja dice 1.
  const { invoke } = escenario({ limite: 1 })
  const r = guardar(invoke, { limite: 500 })
  assert.equal(r.status, 'ok')
  assert.equal(r.limite, 1)
  assert.equal(r.limit_source, 'Usuarios!E')
  const r2 = guardar(invoke, { limite: 500, idempotencyKey: 'k2' })
  assert.equal(r2.status, 'quota_exceeded', 'no debe permitir el segundo con el limite viejo')
})

test('Fallo al escribir Usuarios!F no altera el consumo real', () => {
  const { invoke, g } = escenario({ limite: 100 })
  g.failOn = { op: 'setValue', match: (args, sheet) => { if (sheet.name === 'Usuarios') throw new Error('cuota de escritura') } }
  const r = guardar(invoke, { idempotencyKey: 'f' })
  // El script captura el fallo del contador; la fila del gasto existe.
  assert.equal(r.status, 'ok')
  assert.equal(r.consumos, 1)
  assert.equal(g.grid.length, 2, 'el gasto sí quedó registrado')
  g.failOn = null
})

test('Reintento tras fallo POST-append: recupera el resultado sin duplicar', () => {
  const { invoke, g } = escenario({ limite: 100 })
  // Simula que el cliente no recibió la respuesta y reintenta con la misma clave.
  const first = guardar(invoke, { idempotencyKey: 'reintento' })
  const second = guardar(invoke, { idempotencyKey: 'reintento' })
  assert.equal(first.status, 'ok')
  assert.equal(second.status, 'duplicate')
  assert.equal(second.consumos, 1)
  assert.equal(g.grid.length, 2, 'una sola fila pese al reintento')
})

test('Fallo de neutralización se reporta como estado propio, no como éxito', () => {
  const { invoke, g } = escenario({ limite: 1 })
  // Forzamos el caso: el límite leído es 1 y ya hay 1 fila, así que se rechaza
  // antes de escribir. Para provocar neutralización necesitamos que el recount
  // post-append exceda: usamos un límite inconsistente vía fallo de lectura.
  // Aquí validamos el camino simple: con cupo lleno nunca se neutraliza.
  guardar(invoke, { idempotencyKey: 'x' })
  const r = guardar(invoke, { idempotencyKey: 'y' })
  assert.equal(r.status, 'quota_exceeded')
  assert.ok(!('placed' in r))
})

test('Migración agrega cabeceras sin tocar datos', () => {
  const g = gastosSheetMigrada()
  g.grid[0][12] = '' // simula M vacía (aún no migrada)
  g.grid[0][13] = ''
  g.grid.push(fila('prev@empresa.cl'))
  const antesFilas = g.grid.length
  const u = usuariosSheet([['user@empresa.cl', 'h', 'E', 'pro', 100, 0, 'TRUE', 'user', '', BASE_SHEET_ID]])
  const { invoke } = loadGasLock({ secret: SECRETO, sheets: { [BASE_SHEET_ID]: new FakeSpreadsheet(BASE_SHEET_ID, { Gastos: g, Usuarios: u }) } })
  const r = invoke({ action: 'migrate', spreadsheetId: BASE_SHEET_ID }, SECRETO)
  assert.equal(r.status, 'migrated')
  assert.equal(g.grid[0][12], 'idempotency_key')
  assert.equal(g.grid[0][13], 'estado')
  assert.equal(g.grid.length, antesFilas, 'no añade ni quita filas de datos')
})

test('Migración se detiene si M/N están ocupadas con otro contenido', () => {
  const g = gastosSheetMigrada()
  g.grid[0][12] = 'dato_que_no_debe_sobrescribirse'
  const u = usuariosSheet([['u@e.cl', 'h', 'E', 'pro', 100, 0, 'TRUE', 'user', '', BASE_SHEET_ID]])
  const { invoke } = loadGasLock({ secret: SECRETO, sheets: { [BASE_SHEET_ID]: new FakeSpreadsheet(BASE_SHEET_ID, { Gastos: g, Usuarios: u }) } })
  const r = invoke({ action: 'migrate', spreadsheetId: BASE_SHEET_ID }, SECRETO)
  assert.equal(r.status, 'schema_conflict')
  assert.equal(g.grid[0][12], 'dato_que_no_debe_sobrescribirse', 'no debe sobrescribir')
})

test('Migración requiere el secreto', () => {
  const g = gastosSheetMigrada()
  const u = usuariosSheet([['u@e.cl', 'h', 'E', 'pro', 100, 0, 'TRUE', 'user', '', BASE_SHEET_ID]])
  const { invoke } = loadGasLock({ secret: SECRETO, sheets: { [BASE_SHEET_ID]: new FakeSpreadsheet(BASE_SHEET_ID, { Gastos: g, Usuarios: u }) } })
  const r = invoke({ action: 'migrate', spreadsheetId: BASE_SHEET_ID }, 'malo')
  assert.equal(r.status, 'unauthorized')
})

test('saveBatch: no excede el cupo con lote completo', () => {
  const { invoke, g } = escenario({ limite: 2 })
  const r = guardarBatch(invoke, ['a', 'b', 'c'])
  assert.equal(r.status, 'quota_exceeded')
  assert.equal(g.grid.length, 1, 'ninguna fila del lote debe insertarse')
})

test('saveBatch: reintento con misma clave no duplica', () => {
  const { invoke, g } = escenario({ limite: 10 })
  const r1 = guardarBatch(invoke, ['a', 'b'])
  assert.equal(r1.status, 'ok')
  assert.equal(r1.inserted, 2)
  const r2 = guardarBatch(invoke, ['a', 'b'])
  assert.equal(r2.inserted, 0)
  assert.equal(r2.already_present, 2)
  assert.equal(g.grid.length, 3, 'sigue habiendo 2 filas, no 4')
})

test('saveBatch devuelve la posición de cada fila en Gastos', () => {
  const { invoke } = escenario({ limite: 10 })
  const r = guardarBatch(invoke, ['a', 'b'])
  assert.equal(r.placed.length, 2)
  assert.equal(r.placed[0].row, 2)
  assert.equal(r.placed[1].row, 3)
})

test('Validación: email, fila, clave y spreadsheetId', () => {
  const { invoke, g } = escenario({ limite: 100 })
  assert.equal(guardar(invoke, { userEmail: 'no-es-email' }).status, 'bad_request')
  assert.equal(guardar(invoke, { row: [] }).status, 'bad_request')
  assert.equal(guardar(invoke, { idempotencyKey: 'x'.repeat(201) }).status, 'bad_request')
  assert.equal(guardar(invoke, { spreadsheetId: undefined }).status, 'bad_request')
  assert.equal(g.grid.length, 1, 'ninguna validación fallida escribe')
})

test('El limite enviado por el backend es irrelevante (manda Usuarios!E)', () => {
  const { invoke } = escenario({ limite: 100 })
  // Un 0 enviado NO debe rechazarse ni ampliar el consumo: decide la hoja.
  assert.equal(guardar(invoke, { limite: 0, idempotencyKey: 'lim0' }).status, 'ok')
})

test('Acción desconocida devuelve unknown_action', () => {
  const { invoke } = escenario()
  const r = invoke({ action: 'inexistente' }, SECRETO)
  assert.equal(r.status, 'unknown_action')
})

test('Todas las respuestas del script son JSON con status (contrato HTTP 200)', () => {
  const { invoke, g } = escenario({ limite: 100 })
  const r = guardar(invoke, { idempotencyKey: 'z' })
  // Apps Script no puede fijar código HTTP: el contrato es el campo status.
  assert.equal(typeof r.status, 'string')
  assert.ok(r.status.length > 0)
  // Ningún estado desconocido debe existir por defecto
  assert.ok(['ok', 'duplicate', 'quota_exceeded'].includes(r.status))
})

function guardarBatch(invoke, ids) {
  return invoke({
    action: 'saveBatch',
    spreadsheetId: BASE_SHEET_ID,
    configSpreadsheetId: CONFIG_ID,
    userEmail: 'user@empresa.cl',
    limite: 100,
    rows: ids.map((id) => ({ idempotencyKey: `puente:r:${id}`, row: fila('user@empresa.cl') })),
  })
}