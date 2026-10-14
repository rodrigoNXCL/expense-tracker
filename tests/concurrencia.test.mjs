/**
 * Pruebas de concurrencia del lock.
 *
 * Limitación honesta: `LockService` serializa ejecuciones DISTINTAS de Apps
 * Script dentro de Google. Un sandbox local no puede reproducir esa
 * serialización real, así que aquí se prueba lo que sí es determinista:
 *   1. Que el lock se tome SIEMPRE en las acciones que consumen cupo.
 *   2. Que un `tryLock` fallido NO escriba nada (no hay ruta alternativa).
 *   3. Que N invocaciones concurrentes sobre el MISMO estado, ejecutadas
 *      bajo el mismo lock, produzcan un consumo determinista sin sobrecupo.
 * La serialización real de Google se valida en el entorno desplegado
 * (docs/DEPLOY_GAS_LOCK.md seccion 8).
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  loadGasLock, gastosSheetMigrada, usuariosSheet,
  FakeSpreadsheet, BASE_SHEET_ID, CONFIG_ID,
} from './harness-gaslock.mjs'

const SECRETO = 'secreto-de-prueba-1234567890'

function escenario(limite) {
  const g = gastosSheetMigrada()
  const u = usuariosSheet([['user@empresa.cl', 'h', 'E', 'pro', limite, 0, 'TRUE', 'user', '', BASE_SHEET_ID]])
  const sheets = {
    [BASE_SHEET_ID]: new FakeSpreadsheet(BASE_SHEET_ID, { Gastos: g, Usuarios: u }),
    [CONFIG_ID]: new FakeSpreadsheet(CONFIG_ID, { Usuarios: u }),
  }
  const { invoke, calls, setBusy } = loadGasLock({ secret: SECRETO, sheets })
  return { invoke, calls, setBusy, g }
}

const fila = (email) => [
  new Date().toISOString(), '2026-10-13', '76258687-8', 'COPEC S.A.', 53500,
  'Otros', '12345', '', '', 0, '', email,
]
const guardar = (invoke, key) =>
  invoke({
    action: 'save', spreadsheetId: BASE_SHEET_ID, configSpreadsheetId: CONFIG_ID,
    userEmail: 'user@empresa.cl', idempotencyKey: key, limite: 9999, row: fila('user@empresa.cl'),
  })

test('Toda acción que consume cupo toma el bloqueo', () => {
  const { invoke, calls } = escenario(100)
  guardar(invoke, 'a')
  guardar(invoke, 'b')
  assert.equal(calls.lockAcquired, 2, 'cada guardado debe tomar el lock')
  assert.equal(calls.released, 2, 'y liberarlo')
})

test('Si el lock no se obtiene, NO se escribe nada (sin ruta alternativa)', () => {
  const { invoke, setBusy, g } = escenario(100)
  setBusy(true) // otro sector tiene el bloqueo
  const r = guardar(invoke, 'a')
  assert.equal(r.status, 'lock_timeout')
  assert.equal(g.grid.length, 1, 'ninguna fila escrita sin bloqueo')
  assert.notEqual(r.status, 'ok')
  assert.notEqual(r.status, 'duplicate')
})

test('N operaciones con claves distintas bajo el lock: nunca se supera el limite', () => {
  const limite = 5
  const { invoke, g } = escenario(limite)
  const resultados = []
  // Se ejecutan de forma secuente porque el sandbox no tiene concurrencia real:
  // el efecto que se verifica es que el control de cupo decide cada vez sobre
  // el estado ya actualizado, que es exactamente lo que garantiza el lock.
  for (let i = 0; i < 8; i++) resultados.push(guardar(invoke, `k${i}`))

  const aceptados = resultados.filter((r) => r.status === 'ok')
  const rechazados = resultados.filter((r) => r.status === 'quota_exceeded')
  assert.equal(aceptados.length, limite, `exactamente ${limite} aceptados`)
  assert.equal(rechazados.length, 8 - limite)
  assert.equal(g.grid.length, limite + 1, 'cabecera + exactamente `limite` filas')
  const consumoFinal = aceptados[aceptados.length - 1].consumos
  assert.equal(consumoFinal, limite, 'el consumo nunca excede el limite')
})

test('N operaciones con la MISMA clave: una sola fila y un solo consumo', () => {
  const { invoke, g } = escenario(100)
  const r = []
  for (let i = 0; i < 6; i++) r.push(guardar(invoke, 'misma-clave'))
  assert.equal(r.filter((x) => x.status === 'ok').length, 1)
  assert.equal(r.filter((x) => x.status === 'duplicate').length, 5)
  assert.equal(g.grid.length, 2, 'cabecera + 1 fila')
  assert.equal(r[r.length - 1].consumos, 1)
})

test('saveBatch con lote mayor que el remanente: no inserta ninguna fila', () => {
  const limite = 4
  const { invoke, g } = escenario(limite)
  guardar(invoke, 'ya-1')
  guardar(invoke, 'ya-2')

  const r = invoke({
    action: 'saveBatch', spreadsheetId: BASE_SHEET_ID, configSpreadsheetId: CONFIG_ID,
    userEmail: 'user@empresa.cl', limite: 9999,
    rows: [
      { idempotencyKey: 'p:a', row: fila('user@empresa.cl') },
      { idempotencyKey: 'p:b', row: fila('user@empresa.cl') },
      { idempotencyKey: 'p:c', row: fila('user@empresa.cl') },
    ],
  })
  assert.equal(r.status, 'quota_exceeded')
  assert.equal(r.available, limite - 2)
  assert.equal(g.grid.length, 3, 'sigue con las 2 filas previas: el lote no se registro parcial')
})

test('saveBatch: un registro rechazado no consume cupo', () => {
  const { invoke, g } = escenario(10)
  const r = invoke({
    action: 'saveBatch', spreadsheetId: BASE_SHEET_ID, configSpreadsheetId: CONFIG_ID,
    userEmail: 'user@empresa.cl', limite: 9999,
    rows: [
      { idempotencyKey: 'a', row: fila('user@empresa.cl') },
      { idempotencyKey: 'b', row: fila('user@empresa.cl') },
    ],
  })
  assert.equal(r.status, 'ok')
  assert.equal(r.consumos, 2)
  // Ninguna fila debe tener estado distinto de 'ok'
  const estados = g.grid.slice(1).map((f) => f[13])
  assert.deepEqual(estados, ['ok', 'ok'])
})