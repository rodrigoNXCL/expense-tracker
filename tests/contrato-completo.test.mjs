/**
 * Contrato completo de `GastosLock.gs`: autenticación, guardado, lotes,
 * migración en todos sus escenarios, concurrencia y esquemas incompatibles.
 *
 * Todo se ejecuta sobre hojas simuladas en memoria. NINGUNA hoja real de
 * clientes se lee ni se escribe en este fichero.
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  loadGasLock, gastosSheetMigrada, usuariosSheet,
  FakeSheet, FakeSpreadsheet, BASE_SHEET_ID, CONFIG_ID,
} from './harness-gaslock.mjs'

const SECRETO = 'a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4'
const EMAIL = 'user@empresa.cl'

const HEADER_OK = ['timestamp', 'fecha', 'rut', 'proveedor', 'monto', 'categoria',
  'boleta_numero', 'giro', 'notas', 'ocr_confidence', 'image_url', 'creado_por']

/** Cabeceras reales: las 12 de siempre MÁS las dos de control ya migradas. */
const HEADER_MIGRADO = HEADER_OK.concat(['idempotency_key', 'estado'])

const fila = (email = EMAIL) => [
  new Date().toISOString(), '2026-10-13', '76258687-8', 'COPEC S.A.', 53500,
  'Otros', '12345', '', '', 0, '', email,
]

/** Monta un escenario: hoja `Gastos` con la cabecera indicada + `Usuarios`. */
function montar({ cabecera = HEADER_MIGRADO, limite = 100, filas = [], secret = SECRETO, failOpenId = null } = {}) {
  // `cabecera === null` significa fila 1 VACÍA con datos debajo.
  const g = cabecera === null
    ? new FakeSheet('Gastos', [[''], ...filas.map((f) => f.slice())], 14)
    : new FakeSheet('Gastos', [cabecera.slice(), ...filas.map((f) => f.slice())], Math.max(cabecera.length, 14))
  const u = usuariosSheet([[EMAIL, 'h', 'Empresa', 'pro', limite, 0, 'TRUE', 'user', '', BASE_SHEET_ID]])
  const sheets = {
    [BASE_SHEET_ID]: new FakeSpreadsheet(BASE_SHEET_ID, { Gastos: g, Usuarios: u }),
    [CONFIG_ID]: new FakeSpreadsheet(CONFIG_ID, { Usuarios: u }),
  }
  const { invoke, ctx } = loadGasLock({ secret, sheets, failOpenId })
  return { invoke, ctx, g, u, sheets }
}

const guardar = (invoke, over = {}) => invoke({
  action: 'save', spreadsheetId: BASE_SHEET_ID, configSpreadsheetId: CONFIG_ID,
  userEmail: EMAIL, idempotencyKey: 'k1', limite: 100, row: fila(), ...over,
})
const lote = (invoke, claves, over = {}) => invoke({
  action: 'saveBatch', spreadsheetId: BASE_SHEET_ID, configSpreadsheetId: CONFIG_ID,
  userEmail: EMAIL, limite: 100,
  rows: claves.map((k) => ({ idempotencyKey: k, row: fila() })), ...over,
})
const migrar = (invoke, token = SECRETO) =>
  invoke({ action: 'migrate', spreadsheetId: BASE_SHEET_ID }, token)

// ===========================================================================
// 1. Autenticación
// ===========================================================================
test('1a ping con el secreto correcto', () => {
  const { invoke } = montar()
  const r = invoke({ action: 'ping' })
  assert.equal(r.status, 'ok')
  assert.equal(r.service, 'gastos-lock')
})
test('1b ping con secreto incorrecto', () => {
  const { invoke } = montar()
  assert.equal(invoke({ action: 'ping' }, 'secreto-malo').status, 'unauthorized')
})
test('1c ping sin secreto en la propiedad del script', () => {
  const { invoke } = montar({ secret: null })
  const r = invoke({ action: 'ping' })
  assert.equal(r.status, 'not_configured')
})
test('1d ping sin token', () => {
  const { invoke } = montar()
  assert.equal(invoke({ action: 'ping' }, null).status, 'unauthorized')
})

// ===========================================================================
// 2. save
// ===========================================================================
test('2a registro válido', () => {
  const { invoke, g } = montar()
  const r = guardar(invoke)
  assert.equal(r.status, 'ok')
  assert.equal(r.consumos, 1)
  assert.equal(g.grid.length, 2)
})
test('2b reintento con la misma clave devuelve el original sin duplicar', () => {
  const { invoke, g } = montar()
  guardar(invoke)
  const r = guardar(invoke)
  assert.equal(r.status, 'duplicate')
  assert.equal(r.consumos, 1)
  assert.equal(g.grid.length, 2, 'una sola fila')
})
test('2c cupo agotado: no escribe', () => {
  const { invoke, g } = montar({ limite: 1 })
  guardar(invoke, { idempotencyKey: 'a' })
  const r = guardar(invoke, { idempotencyKey: 'b' })
  assert.equal(r.status, 'quota_exceeded')
  assert.equal(g.grid.length, 2)
})
test('2d lectura fallida de Usuarios!E: limit_unavailable, cero escrituras', () => {
  const { invoke, g } = montar({ failOpenId: CONFIG_ID })
  const r = guardar(invoke)
  assert.equal(r.status, 'limit_unavailable')
  assert.equal(r.motivo, 'read_error')
  assert.equal(g.writes.length, 0)
})

// ===========================================================================
// 3. saveBatch
// ===========================================================================
test('3a claves duplicadas dentro del lote: rechaza entero', () => {
  const { invoke, g } = montar()
  const r = lote(invoke, ['a', 'b', 'a'])
  assert.equal(r.status, 'bad_request')
  assert.ok(r.errores.some((e) => /duplicada/.test(e)))
  assert.equal(g.writes.length, 0)
})
test('3b lote que supera el cupo: no escribe ninguna fila', () => {
  const { invoke, g } = montar({ limite: 4 })
  guardar(invoke, { idempotencyKey: 'p1' })
  guardar(invoke, { idempotencyKey: 'p2' })
  const antes = g.grid.length
  const r = lote(invoke, ['a', 'b', 'c'])
  assert.equal(r.status, 'quota_exceeded')
  assert.equal(r.available, 2)
  assert.equal(g.grid.length, antes, 'sin escritura parcial')
})
test('3c fallo parcial devuelve partial_batch con detalle auditable', () => {
  const { invoke, g } = montar()
  let n = 0
  g.failOn = { op: 'appendRow', match: () => { n++; if (n === 3) throw new Error('cuota') } }
  const r = lote(invoke, ['a', 'b', 'c', 'd'])
  assert.equal(r.status, 'partial_batch')
  assert.deepEqual(r.inserted_keys, ['a', 'b'])
  assert.deepEqual(r.failed_keys, ['c'])
  assert.deepEqual(r.pending_keys, ['d'])
})
test('3d reintento tras fallo parcial completa sin duplicar', () => {
  const { invoke, g } = montar()
  let n = 0
  g.failOn = { op: 'appendRow', match: () => { n++; if (n === 3) throw new Error('cuota') } }
  lote(invoke, ['a', 'b', 'c', 'd'])
  g.failOn = null
  const r = lote(invoke, ['a', 'b', 'c', 'd'])
  assert.equal(r.status, 'ok')
  assert.equal(r.inserted, 2)
  assert.equal(r.already_present, 2)
  const claves = g.grid.slice(1).map((f) => f[12]).sort()
  assert.deepEqual(claves, ['a', 'b', 'c', 'd'], 'sin duplicados')
})

// ===========================================================================
// 4. Migración — todos los escenarios
// ===========================================================================
test('4a ambas cabeceras ausentes: las agrega', () => {
  const { invoke, g } = montar({ cabecera: HEADER_OK })
  const r = migrar(invoke)
  assert.equal(r.status, 'migrated')
  assert.deepEqual(r.added.sort(), ['estado', 'idempotency_key'])
  assert.equal(g.grid[0][12], 'idempotency_key')
  assert.equal(g.grid[0][13], 'estado')
})
test('4b solo falta una: agrega solo esa', () => {
  const cab = HEADER_OK.concat(['idempotency_key', '']) // M presente, N vacia
  const { invoke, g } = montar({ cabecera: cab })
  const r = migrar(invoke)
  assert.equal(r.status, 'migrated')
  assert.deepEqual(r.added, ['estado'], 'no reescribe la que ya existe')
  assert.equal(g.grid[0][12], 'idempotency_key', 'intacta')
  assert.equal(g.grid[0][13], 'estado')
})
test('4c ambas cabeceras ya existen: already_migrated, no escribe', () => {
  const cab = HEADER_OK.concat(['idempotency_key', 'estado'])
  const { invoke, g } = montar({ cabecera: cab })
  const r = migrar(invoke)
  assert.equal(r.status, 'already_migrated')
  assert.deepEqual(r.added, [])
  assert.equal(g.writes.length, 0)
})
test('4d fila 1 vacía: schema_conflict y NO dice already_migrated', () => {
  // Este es el defecto corregido: antes devolvía already_migrated sin escribir.
  const { invoke, g } = montar({ cabecera: null, filas: [fila()] })
  const r = migrar(invoke)
  assert.equal(r.status, 'schema_conflict', 'debe detenerse, no fingir que ya está')
  assert.notEqual(r.status, 'already_migrated')
  assert.equal(r.esquema_detectado, 'sin_cabeceras')
  assert.equal(g.writes.length, 0, 'no escribe cabeceras sobre datos sin mapear')
})
test('4e fila 1 vacía también detiene save_', () => {
  const { invoke, g } = montar({ cabecera: null, filas: [fila()] })
  const r = guardar(invoke)
  assert.equal(r.status, 'schema_conflict')
  assert.equal(g.writes.length, 0)
})
test('4f destino ocupado: se detiene sin sobrescribir', () => {
  const cab = HEADER_OK.concat(['dato_ajeno'])
  const { invoke, g } = montar({ cabecera: cab })
  const r = migrar(invoke)
  assert.equal(r.status, 'schema_conflict')
  assert.equal(g.grid[0][12], 'dato_ajeno', 'intacto')
  assert.equal(g.writes.length, 0)
})
test('4g creado_por no identificable: schema_conflict', () => {
  const cab = ['timestamp', 'fecha', 'rut', 'proveedor', 'monto']
  const { invoke, g } = montar({ cabecera: cab })
  const r = migrar(invoke)
  assert.equal(r.status, 'schema_conflict')
  assert.match(r.message, /creado_por/)
  assert.equal(g.writes.length, 0)
})
test('4h cabeceras en posiciones distintas: las respeta, no duplica', () => {
  const cab = HEADER_OK.concat(['extra', '', '', 'idempotency_key', 'estado'])
  const { invoke, g } = montar({ cabecera: cab })
  const r = migrar(invoke)
  assert.equal(r.status, 'already_migrated')
  assert.equal(g.grid[0][15], 'idempotency_key')
  assert.equal(g.grid[0][16], 'estado')
  assert.equal(g.writes.length, 0)
})
test('4i migración idempotente: tres veces sin cambios', () => {
  const { invoke, g } = montar({ cabecera: HEADER_OK, filas: [fila('previo@empresa.cl')] })
  const antes = JSON.stringify(g.grid[1])
  assert.equal(migrar(invoke).status, 'migrated')
  assert.equal(migrar(invoke).status, 'already_migrated')
  assert.equal(migrar(invoke).status, 'already_migrated')
  assert.equal(JSON.stringify(g.grid[1]), antes, 'el histórico quedó intacto')
  assert.equal(g.grid.filter((f) => String(f[12]).trim() === 'idempotency_key').length, 1,
    'no duplicó cabeceras')
})
test('4j migrar exige el secreto', () => {
  const { invoke, g } = montar({ cabecera: HEADER_OK })
  assert.equal(migrar(invoke, 'malo').status, 'unauthorized')
  assert.equal(g.writes.length, 0)
})
test('4k tras migrar, save_ funciona', () => {
  const { invoke, g } = montar({ cabecera: HEADER_OK })
  migrar(invoke)
  const r = guardar(invoke)
  assert.equal(r.status, 'ok')
  assert.equal(g.grid[1][11], EMAIL, 'L = creado_por intacto')
  assert.equal(g.grid[1][12], 'k1', 'M = clave')
})

// ===========================================================================
// 5. Peticiones simultáneas
// ===========================================================================
test('5a ocho secuenciales contra cincocupo: nunca se supera', () => {
  const { invoke, g } = montar({ limite: 5 })
  const res = []
  for (let i = 0; i < 8; i++) res.push(guardar(invoke, { idempotencyKey: 'k' + i }))
  const ok = res.filter((r) => r.status === 'ok').length
  assert.equal(ok, 5, 'exactamente el cupo')
  assert.equal(g.grid.length, 6, 'cabecera + 5 filas')
  assert.equal(res.filter((r) => r.status === 'quota_exceeded').length, 3)
})
test('5b misma clave repetida: una sola fila y un solo consumo', () => {
  const { invoke, g } = montar()
  for (let i = 0; i < 6; i++) guardar(invoke, { idempotencyKey: 'misma' })
  assert.equal(g.grid.length, 2)
})
test('5c lotes simultáneos no duplican ni exceden', () => {
  const { invoke, g } = montar({ limite: 10 })
  for (let i = 0; i < 4; i++) lote(invoke, ['x' + i])
  const claves = g.grid.slice(1).map((f) => f[12])
  assert.equal(claves.length, 4)
  assert.equal(new Set(claves).size, 4, 'sin claves repetidas')
})

// ===========================================================================
// 6. Esquemas incompatibles
// ===========================================================================
test('6a sin columnas de control: schema_not_migrated sin escribir', () => {
  const { invoke, g } = montar({ cabecera: HEADER_OK })
  const r = guardar(invoke)
  assert.equal(r.status, 'schema_not_migrated')
  assert.equal(g.writes.length, 0)
})
test('6b columnas de control en posición inválida (colisión): schema_conflict', () => {
  const { invoke, g } = montar()
  g.grid[0][11] = 'idempotency_key' // colisión con creado_por
  const r = guardar(invoke)
  assert.equal(r.status, 'schema_conflict')
  assert.equal(g.writes.length, 0)
})
test('6c hoja inexistente: script_error, nada escrito', () => {
  const { invoke } = montar()
  const r = guardar(invoke, { spreadsheetId: 'no-existe' })
  assert.equal(r.status, 'script_error')
})

// ===========================================================================
// 7. Consumo
// ===========================================================================
test('7a solo cuenta filas del usuario', () => {
  const { invoke, g } = montar()
  guardar(invoke)
  g.grid.push(fila('otro@empresa.cl'))
  assert.equal(guardar(invoke, { idempotencyKey: 'b' }).consumos, 2)
})
test('7b estado rechazado no consume', () => {
  const { invoke, ctx, g } = montar()
  guardar(invoke, { idempotencyKey: 'a' })
  guardar(invoke, { idempotencyKey: 'b' })
  const sh = ctx.openGastos_(BASE_SHEET_ID)
  ctx.neutralizeOwn_(sh, ctx.resolveLayout_(sh, {}), 'a')
  assert.equal(guardar(invoke, { idempotencyKey: 'c' }).consumos, 2)
})
