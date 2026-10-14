/**
 * Pruebas del límite autoritativo (`Usuarios!E`) y de su degradación.
 *
 * Decisión que se verifica aquí: si NO se puede leer el límite vigente, el
 * script NO decide cupo y NO escribe nada. Falla cerrado.
 *
 * Contexto del riesgo que esto evita: `Usuarios!F` es informativo y el valor
 * que envía el backend es una copia que viaja en el JWT (TTL 7 días,
 * reconciliada cada 5 min como máximo). Si el administrador BAJA el límite y la
 * lectura falla en ese instante, usar la copia concedería cupo por encima del
 * límite real. Por eso no hay fallback.
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  loadGasLock, gastosSheetMigrada, usuariosSheet,
  FakeSpreadsheet, BASE_SHEET_ID, CONFIG_ID,
} from './harness-gaslock.mjs'

const SECRETO = 'secreto-de-prueba-1234567890'
const EMAIL = 'user@empresa.cl'

function base(limite = 100, opts = {}) {
  const g = gastosSheetMigrada()
  const u = usuariosSheet(
    opts.usuarios || [[EMAIL, 'h', 'Empresa', 'pro', limite, 0, 'TRUE', 'user', '', BASE_SHEET_ID]]
  )
  const sheets = {
    [BASE_SHEET_ID]: new FakeSpreadsheet(BASE_SHEET_ID, { Gastos: g, Usuarios: u }),
    [CONFIG_ID]: new FakeSpreadsheet(CONFIG_ID, { Usuarios: u }),
  }
  const { invoke } = loadGasLock({ secret: SECRETO, sheets, failOpenId: opts.failOpenId || null })
  return { invoke, g, u }
}

const fila = () => [
  new Date().toISOString(), '2026-10-13', '76258687-8', 'COPEC S.A.', 53500,
  'Otros', '12345', '', '', 0, '', EMAIL,
]

const guardar = (invoke, over = {}) =>
  invoke({
    action: 'save',
    spreadsheetId: BASE_SHEET_ID,
    configSpreadsheetId: CONFIG_ID,
    userEmail: EMAIL,
    idempotencyKey: 'k1',
    limite: 100,
    row: fila(),
    ...over,
  })

const guardarBatch = (invoke, over = {}) =>
  invoke({
    action: 'saveBatch',
    spreadsheetId: BASE_SHEET_ID,
    configSpreadsheetId: CONFIG_ID,
    userEmail: EMAIL,
    limite: 100,
    rows: [
      { idempotencyKey: 'p:a', row: fila() },
      { idempotencyKey: 'p:b', row: fila() },
    ],
    ...over,
  })

// --- Camino feliz ----------------------------------------------------------
test('Con la hoja legible, el limite viene de Usuarios!E', () => {
  const { invoke, g } = base(7)
  const r = guardar(invoke, { limite: 999 })
  assert.equal(r.status, 'ok')
  assert.equal(r.limite, 7)
  assert.equal(r.limit_source, 'Usuarios!E')
  assert.equal(g.grid.length, 2)
})

test('Un limite ENVIADO mayor que el de la hoja no amplifica el cupo', () => {
  const { invoke } = base(1)
  assert.equal(guardar(invoke, { limite: 500, idempotencyKey: 'a' }).status, 'ok')
  const r = guardar(invoke, { limite: 500, idempotencyKey: 'b' })
  assert.equal(r.status, 'quota_exceeded', 'la hoja manda, no la copia del token')
})

// --- Degradación: falla cerrado -------------------------------------------
test('Si falla la lectura de Usuarios!E: limit_unavailable y NINGUNA escritura', () => {
  const { invoke, g } = base(100, { failOpenId: CONFIG_ID })
  const r = guardar(invoke, { limite: 500 })
  assert.equal(r.status, 'limit_unavailable')
  assert.equal(r.retryable, true)
  assert.equal(r.motivo, 'read_error')
  assert.equal(g.grid.length, 1, 'NO se escribió ninguna fila')
  assert.equal(g.writes.filter((w) => w.op === 'appendRow').length, 0, 'ni un append')
})

test('El limite enviado NO se usa como fallback cuando falla la lectura', () => {
  const { invoke, g } = base(1, { failOpenId: CONFIG_ID })
  // Aunque el backend diga 999, no se autoriza nada.
  const r = guardar(invoke, { limite: 999 })
  assert.equal(r.status, 'limit_unavailable')
  assert.equal(g.grid.length, 1, 'sin fallback no hay consumo por encima del límite')
})

test('Sin configSpreadsheetId tampoco se decide cupo', () => {
  const { invoke, g } = base(100)
  const r = guardar(invoke, { configSpreadsheetId: null })
  assert.equal(r.status, 'limit_unavailable')
  assert.equal(r.motivo, 'missing_config')
  assert.equal(g.grid.length, 1)
})

test('Usuario ausente de la hoja Usuarios: limit_unavailable, no bad_request', () => {
  const { invoke, g } = base(100, {
    usuarios: [['otra@empresa.cl', 'h', 'E', 'pro', 100, 0, 'TRUE', 'user', '', BASE_SHEET_ID]],
  })
  const r = guardar(invoke, {})
  assert.equal(r.status, 'limit_unavailable')
  assert.equal(r.motivo, 'usuario_no_encontrado')
  assert.equal(g.grid.length, 1)
})

test('Limite 0 o vacio en la hoja: limit_unavailable (no bad_request)', () => {
  const { invoke } = base(100, {
    usuarios: [[EMAIL, 'h', 'E', 'pro', 0, 0, 'TRUE', 'user', '', BASE_SHEET_ID]],
  })
  const r = guardar(invoke, {})
  assert.equal(r.status, 'limit_unavailable')
  assert.equal(r.motivo, 'limite_invalido')
})

test('saveBatch tambien falla cerrado sin escribir parte del lote', () => {
  const { invoke, g } = base(100, { failOpenId: CONFIG_ID })
  const r = guardarBatch(invoke, { limite: 500 })
  assert.equal(r.status, 'limit_unavailable')
  assert.equal(g.grid.length, 1, 'ninguna fila del lote')
  assert.equal(g.writes.filter((w) => w.op === 'appendRow').length, 0)
})

// --- Recuperación ---------------------------------------------------------
test('Tras la recuperacion de la lectura, el MISMO key funciona sin duplicar', () => {
  const g = gastosSheetMigrada()
  const u = usuariosSheet([[EMAIL, 'h', 'E', 'pro', 100, 0, 'TRUE', 'user', '', BASE_SHEET_ID]])
  const mk = (fail) => {
    const { invoke } = loadGasLock({
      secret: SECRETO,
      sheets: {
        [BASE_SHEET_ID]: new FakeSpreadsheet(BASE_SHEET_ID, { Gastos: g, Usuarios: u }),
        [CONFIG_ID]: new FakeSpreadsheet(CONFIG_ID, { Usuarios: u }),
      },
      failOpenId: fail ? CONFIG_ID : null,
    })
    return invoke
  }
  // 1) Intento con la lectura caida
  const r1 = mk(true)({
    action: 'save', spreadsheetId: BASE_SHEET_ID, configSpreadsheetId: CONFIG_ID,
    userEmail: EMAIL, idempotencyKey: 'reintento', limite: 100, row: fila(),
  })
  assert.equal(r1.status, 'limit_unavailable')
  assert.equal(g.grid.length, 1)

  // 2) Reintento con la MISMA clave cuando la lectura se recupera
  const r2 = mk(false)({
    action: 'save', spreadsheetId: BASE_SHEET_ID, configSpreadsheetId: CONFIG_ID,
    userEmail: EMAIL, idempotencyKey: 'reintento', limite: 100, row: fila(),
  })
  assert.equal(r2.status, 'ok')
  assert.equal(g.grid.length, 2, 'una sola fila: el primer intento no habia escrito')

  // 3) Tercer intento con la misma clave: idempotente
  const r3 = mk(false)({
    action: 'save', spreadsheetId: BASE_SHEET_ID, configSpreadsheetId: CONFIG_ID,
    userEmail: EMAIL, idempotencyKey: 'reintento', limite: 100, row: fila(),
  })
  assert.equal(r3.status, 'duplicate')
  assert.equal(g.grid.length, 2, 'sigue habiendo una sola fila')
})

// --- Contrato con el backend ---------------------------------------------
test('El backend mapea limit_unavailable a 503 reintentable, nunca a exito', async () => {
  const URL = 'https://script.google.com/macros/s/EJEMPLO/exec'
  process.env.GAS_LOCK_URL = URL
  process.env.GAS_LOCK_SECRET = 's'
  const { mapLockStatus, isWriteConfirmed } = await import('../src/lib/gastos-lock.ts')
  const m = mapLockStatus({ status: 'limit_unavailable' })
  assert.equal(m.http, 503)
  assert.equal(m.outcome, 'limit_unknown')
  assert.equal(m.retryable, true)
  assert.equal(isWriteConfirmed({ status: 'limit_unavailable' }), false)
  delete process.env.GAS_LOCK_URL
  delete process.env.GAS_LOCK_SECRET
})

test('Ya no existe ningun estado con fallback de limite en el script', async () => {
  const { readFileSync } = await import('fs')
  const src = readFileSync('google-apps-script/GastosLock.gs', 'utf8')
  assert.equal(/session_fallback/.test(src), false, 'session_fallback debe haber desaparecido')
  assert.equal(/source: 'session'/.test(src), false, 'no debe quedar el fallback "session"')
  assert.equal(/limite: Number\(b\.limite\)/.test(src), false, 'no debe usarse el limite enviado')
})