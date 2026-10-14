/**
 * Verificación de los cinco puntos de cierre antes del despliegue.
 * Todo en memoria: ninguna hoja real de clientes.
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  loadGasLock, gastosSheetMigrada, usuariosSheet,
  FakeSpreadsheet, BASE_SHEET_ID, CONFIG_ID,
} from './harness-gaslock.mjs'

const SECRETO = 'secreto-de-prueba-1234567890'
const EMAIL = 'user@empresa.cl'

function base({ limite = 100, failOpenId = null, usuarios = null } = {}) {
  const g = gastosSheetMigrada()
  const u = usuariosSheet(
    usuarios || [[EMAIL, 'h', 'Empresa', 'pro', limite, 0, 'TRUE', 'user', '', BASE_SHEET_ID]]
  )
  const sheets = {
    [BASE_SHEET_ID]: new FakeSpreadsheet(BASE_SHEET_ID, { Gastos: g, Usuarios: u }),
    [CONFIG_ID]: new FakeSpreadsheet(CONFIG_ID, { Usuarios: u }),
  }
  const { invoke } = loadGasLock({ secret: SECRETO, sheets, failOpenId })
  return { invoke, g, u }
}

const fila = () => [
  new Date().toISOString(), '2026-10-13', '76258687-8', 'COPEC S.A.', 53500,
  'Otros', '12345', '', '', 0, '', EMAIL,
]
const guardar = (invoke, over = {}) =>
  invoke({
    action: 'save', spreadsheetId: BASE_SHEET_ID, configSpreadsheetId: CONFIG_ID,
    userEmail: EMAIL, idempotencyKey: 'k1', limite: 100, row: fila(), ...over,
  })
const lote = (invoke, over = {}) =>
  invoke({
    action: 'saveBatch', spreadsheetId: BASE_SHEET_ID, configSpreadsheetId: CONFIG_ID,
    userEmail: EMAIL, limite: 100,
    rows: [
      { idempotencyKey: 'p:a', row: fila() },
      { idempotencyKey: 'p:b', row: fila() },
      { idempotencyKey: 'p:c', row: fila() },
    ],
    ...over,
  })

// ===========================================================================
// PUNTO 1 — limit_unavailable -> 503 reintentable, sin escrituras
// ===========================================================================
test('P1 script: limit_unavailable y el backend lo traduce a 503 reintentable', async () => {
  const { invoke, g } = base({ failOpenId: CONFIG_ID })
  const r = guardar(invoke)
  assert.equal(r.status, 'limit_unavailable')
  assert.equal(r.retryable, true)
  assert.equal(g.writes.filter((w) => w.op === 'appendRow').length, 0, 'cero filas escritas')

  const { mapLockStatus, isWriteConfirmed } = await import('../src/lib/gastos-lock.ts')
  const m = mapLockStatus(r)
  assert.equal(m.http, 503)
  assert.equal(m.retryable, true)
  assert.equal(m.outcome, 'limit_unknown')
  assert.equal(isWriteConfirmed(r), false, 'jamás se interpreta como éxito')
})

test('P1 puente: los estados sin escritura permiten revertir la rendición', async () => {
  const { lockSinEscritura } = await import('../src/lib/puente-idempotencia.ts')
  for (const s of ['limit_unavailable', 'quota_exceeded', 'schema_not_migrated',
    'schema_conflict', 'unauthorized', 'not_configured', 'bad_request',
    'unknown_action', 'lock_timeout']) {
    assert.equal(lockSinEscritura(s), true, `${s} debe permitir revertir: no se escribió nada`)
  }
  // Un resultado AMBIGUO no permite revertir: hay que dejar la rendición
  // recuperable para que el reintento resuelva por clave de idempotencia.
  for (const s of ['ok', 'duplicate', 'script_error', 'neutralize_failed']) {
    assert.equal(lockSinEscritura(s), false, `${s} no debe revertir automáticamente`)
  }
})

test('P1 puente: lock_timeout no completa la rendición pero tampoco la deja rota', async () => {
  const { lockSinEscritura } = await import('../src/lib/puente-idempotencia.ts')
  // lock_timeout => el script no obtuvo el bloqueo, luego no escribió: revierte.
  assert.equal(lockSinEscritura('lock_timeout'), true)
})

// ===========================================================================
// PUNTO 2 — fallo al actualizar Usuarios!F
// ===========================================================================
test('P2 el gasto se guarda aunque falle Usuarios!F, y el reintento no duplica', () => {
  const { invoke, g } = base()
  // La escritura del contador falla; la del gasto NO debe verse afectada.
  g.failOn = { op: 'setValue', match: () => {} }

  const u = usuariosSheet([[EMAIL, 'h', 'Empresa', 'pro', 100, 0, 'TRUE', 'user', '', BASE_SHEET_ID]])
  u.failOn = { op: 'setValue', match: () => { throw new Error('Cuota de escritura agotada') } }
  const { invoke: invoke2 } = loadGasLock({
    secret: SECRETO,
    sheets: {
      [BASE_SHEET_ID]: new FakeSpreadsheet(BASE_SHEET_ID, { Gastos: g, Usuarios: u }),
      [CONFIG_ID]: new FakeSpreadsheet(CONFIG_ID, { Usuarios: u }),
    },
  })

  const r1 = invoke2({
    action: 'save', spreadsheetId: BASE_SHEET_ID, configSpreadsheetId: CONFIG_ID,
    userEmail: EMAIL, idempotencyKey: 'contador-falla', limite: 100, row: fila(),
  })
  assert.equal(r1.status, 'ok', 'el gasto se registra igual')
  assert.equal(r1.consumos, 1, 'el consumo real es correcto pese al fallo del contador')
  assert.equal(g.grid.length, 2, 'la fila del gasto existe')

  // Reintento con la MISMA clave: no duplica ni vuelve a consumir.
  const r2 = invoke2({
    action: 'save', spreadsheetId: BASE_SHEET_ID, configSpreadsheetId: CONFIG_ID,
    userEmail: EMAIL, idempotencyKey: 'contador-falla', limite: 100, row: fila(),
  })
  assert.equal(r2.status, 'duplicate')
  assert.equal(r2.consumos, 1, 'no se consume una segunda unidad')
  assert.equal(g.grid.length, 2, 'sigue habiendo UNA sola fila')
})

test('P2 el contador desincronizado no altera el consumo real', () => {
  const { invoke, g, u } = base({ limite: 2 })
  guardar(invoke, { idempotencyKey: 'a' })
  guardar(invoke, { idempotencyKey: 'b' })
  assert.equal(g.grid.length, 3, '2 filas de datos')

  // Se simula el contador roto: Usuarios!F vuelve a 0 aunque hay 2 consumos.
  u.grid[1][5] = 0
  assert.equal(u.grid[1][5], 0, 'el contador informativo dice 0 (roto)')

  const r = guardar(invoke, { idempotencyKey: 'c' })
  assert.equal(r.status, 'quota_exceeded',
    'el limite se decide por las filas reales, no por el contador roto')
  assert.equal(r.consumos, 2, 'el consumo real sigue siendo 2')
})

// ===========================================================================
// PUNTO 3 — el frontend conserva la clave
// ===========================================================================
test('P3 tras un timeout el frontend conserva la MISMA clave', async () => {
  const { claveParaReintento } = await import('../src/lib/idempotency-cliente.ts')
  const clave = 'clave-enviada-original'
  // Timeout sin cuerpo util: se conserva la clave.
  assert.equal(claveParaReintento(clave, null, false), clave)
  assert.equal(claveParaReintento(clave, {}, false), clave)
  // Timeout con clave del backend: se adopta la del servidor.
  assert.equal(
    claveParaReintento(clave, { idempotency_key: 'clave-del-backend' }, false),
    'clave-del-backend'
  )
  // 503 limit_unavailable: conserva (reintentable, nada se escribió).
  assert.equal(
    claveParaReintento(clave, { code: 'limit_unavailable', retryable: true }, false),
    clave
  )
})

test('P3 la clave se descarta solo al confirmar o ante rechazo definitivo', async () => {
  const { claveParaReintento } = await import('../src/lib/idempotency-cliente.ts')
  const clave = 'clave-x'
  // Confirmado: operación cerrada.
  assert.equal(claveParaReintento(clave, { success: true }, true), '')
  // cupo agotado: el siguiente intento es otra operación.
  assert.equal(claveParaReintento(clave, { code: 'quota_exceeded' }, false), '')
  // duplicado también es confirmación.
  assert.equal(claveParaReintento(cladeSafe(clave), { idempotent: true }, true), '')
})
function cladeSafe(c) { return c }

// ===========================================================================
// PUNTO 4 — saveBatch
// ===========================================================================
test('P4 saveBatch sin límite legible: rechaza el lote COMPLETO', () => {
  const { invoke, g } = base({ failOpenId: CONFIG_ID })
  const r = lote(invoke)
  assert.equal(r.status, 'limit_unavailable')
  assert.equal(g.writes.filter((w) => w.op === 'appendRow').length, 0, 'ni una fila del lote')
  assert.equal(g.grid.length, 1)
})

test('P4 saveBatch sin cupo suficiente: rechaza el lote COMPLETO', () => {
  const { invoke, g } = base({ limite: 4 })
  guardar(invoke, { idempotencyKey: 'previa-1' })
  guardar(invoke, { idempotencyKey: 'previa-2' })
  const antes = g.grid.length
  const r = lote(invoke) // pide 3, solo quedan 2
  assert.equal(r.status, 'quota_exceeded')
  assert.equal(r.available, 2)
  assert.equal(g.grid.length, antes, 'NO se registro parcialmente')
})

test('P4 saveBatch valida contra Usuarios!E, no contra el limite enviado', () => {
  const { invoke, g } = base({ limite: 2 })
  // El backend "cree" que hay 999 de cupo: la hoja manda.
  const r = lote(invoke, { limite: 999 })
  assert.equal(r.status, 'quota_exceeded')
  assert.equal(r.limite, 2)
  assert.equal(r.limit_source, 'Usuarios!E')
  assert.equal(g.grid.length, 1)
})

test('P4 saveBatch con cupo suficiente: insierte todo y devuelve las filas', () => {
  const { invoke, g } = base({ limite: 10 })
  const r = lote(invoke)
  assert.equal(r.status, 'ok')
  assert.equal(r.inserted, 3)
  assert.equal(r.placed.length, 3)
  assert.equal(g.grid.length, 4, 'cabecera + 3 filas')
  // Cada fila conserva sus 12 columnas originales: la clave va en M.
  const f = g.grid[1]
  assert.equal(f[11], EMAIL, 'L = creado_por intacto')
  assert.equal(f[12], 'p:a', 'M = idempotency_key')
  assert.equal(f[13], 'ok', 'N = estado')
})