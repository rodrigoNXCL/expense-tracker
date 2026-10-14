/**
 * Pruebas de la corrección de `validateBatchItems_`.
 *
 * El defecto: la validación se ejecutaba ANTES de resolver el esquema y leía
 * `creado_por` de la columna fija 12. Eso valida el contenido equivocado:
 * rechaza lotes válidos o acepta lotes cuyo consumo se atribuiría a otra
 * columna.
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  loadGasLock, usuariosSheet,
  FakeSheet, FakeSpreadsheet, BASE_SHEET_ID, CONFIG_ID,
} from './harness-gaslock.mjs'

const SECRETO = 'secreto-de-prueba-1234567890'
const EMAIL = 'user@empresa.cl'

const BASE12 = ['timestamp', 'fecha', 'rut', 'proveedor', 'monto', 'categoria',
  'boleta_numero', 'giro', 'notas', 'ocr', 'image_url', 'creado_por']

/** Esquema real de cliente: creado_por en L (12), control en M (13) y N (14). */
const CAB_L = BASE12.concat(['idempotency_key', 'estado'])
/** Lo mismo pero sin las columnas de control: estado previo a migrar. */
const CAB_L_SIN_MIGRAR = BASE12.slice()
/** Esquema desplazado: creado_por en O (15), control en P (16) y Q (17).
 *  Sin duplicar `creado_por`: el detector toma siempre la primera coincidencia. */
const CAB_O = [
  'timestamp', 'fecha', 'rut', 'proveedor', 'monto', 'categoria',
  'boleta_numero', 'giro', 'notas', 'ocr', 'image_url',
  'dato1', 'dato2', 'dato3',
  'creado_por', 'idempotency_key', 'estado',
]

/** Fila con `creado_por` en la columna indicada (base 1). */
function fila(email, ancho, colCreadoPor) {
  const r = [new Date().toISOString(), '2026-10-13', '76258687-8', 'COPEC S.A.', 53500,
    'Otros', '12345', '', '', 0, '', '']
  while (r.length < ancho) r.push('')
  r[colCreadoPor - 1] = email
  return r
}

function montar({ cabecera = CAB_L, limite = 100 } = {}) {
  const g = new FakeSheet('Gastos', [cabecera.slice()], cabecera.length)
  const u = usuariosSheet([[EMAIL, 'h', 'Empresa', 'pro', limite, 0, 'TRUE', 'user', '', BASE_SHEET_ID]])
  const sheets = {
    [BASE_SHEET_ID]: new FakeSpreadsheet(BASE_SHEET_ID, { Gastos: g, Usuarios: u }),
    [CONFIG_ID]: new FakeSpreadsheet(CONFIG_ID, { Usuarios: u }),
  }
  const { invoke, ctx } = loadGasLock({ secret: SECRETO, sheets })
  return { invoke, ctx, g, layout: ctx.resolveLayout_(g, {}) }
}

const lote = (invoke, items, over = {}) => invoke({
  action: 'saveBatch', spreadsheetId: BASE_SHEET_ID, configSpreadsheetId: CONFIG_ID,
  userEmail: EMAIL, limite: 100, rows: items, ...over,
})

test('A1 la posición de creado_por se toma de la cabecera en cada esquema', () => {
  assert.equal(montar({ cabecera: CAB_L }).layout.createdBy, 12, 'esquema real: L')
  const o = montar({ cabecera: CAB_O })
  assert.equal(o.layout.createdBy, 15, 'esquema desplazado: O')
  assert.equal(o.layout.key, 16)
  assert.equal(o.layout.state, 17)
})

test('A2 lote valido con creado_por en O: aceptado', () => {
  const { invoke, g } = montar({ cabecera: CAB_O })
  const n = CAB_O.length
  const r = lote(invoke, [
    { idempotencyKey: 'a', row: fila(EMAIL, n, 15) },
    { idempotencyKey: 'b', row: fila(EMAIL, n, 15) },
  ])
  assert.equal(r.status, 'ok', r.message || JSON.stringify(r.errores || []))
  assert.equal(r.inserted, 2)
  assert.equal(g.grid.length, 3)
})

test('A3 la fila se escribe en la columna detectada, no en la L fija', () => {
  const { invoke, g } = montar({ cabecera: CAB_O })
  const n = CAB_O.length
  lote(invoke, [{ idempotencyKey: 'a', row: fila(EMAIL, n, 15) }])
  const f = g.grid[1]
  assert.equal(f[14], EMAIL, 'O (indice 14) = creado_por detectado')
  assert.equal(f[15], 'a', 'P = idempotency_key')
  assert.equal(f[11], '', 'L no se escribio a ciegas')
  assert.equal(f[16], 'ok', 'Q = estado')
})

test('A4 creado_por ajeno en la columna detectada: se rechaza entero', () => {
  const { invoke, g } = montar({ cabecera: CAB_O })
  const n = CAB_O.length
  const r = lote(invoke, [
    { idempotencyKey: 'a', row: fila(EMAIL, n, 15) },
    { idempotencyKey: 'b', row: fila('intruso@otro.cl', n, 15) },
  ])
  assert.equal(r.status, 'bad_request')
  assert.ok(r.errores.some((e) => /creado_por/.test(e)), r.errores.join('|'))
  assert.equal(g.writes.length, 0)
})

test('A5 esquema real en L: sigue validando correctamente', () => {
  const { invoke, g } = montar({ cabecera: CAB_L })
  const n = CAB_L.length
  assert.equal(lote(invoke, [{ idempotencyKey: 'a', row: fila(EMAIL, n, 12) }]).status, 'ok')
  const malo = lote(invoke, [{ idempotencyKey: 'b', row: fila('otro@empresa.cl', n, 12) }])
  assert.equal(malo.status, 'bad_request')
  assert.equal(g.grid.length, 2, 'solo se escribio la fila valida')
})

test('A6 creado_por vacio: se atribuye al usuario autenticado', () => {
  const { invoke, g } = montar({ cabecera: CAB_O })
  const n = CAB_O.length
  const r = lote(invoke, [{ idempotencyKey: 'a', row: fila('', n, 15) }])
  assert.equal(r.status, 'ok')
  assert.equal(g.grid[1][14], EMAIL, 'se fuerza al usuario del lote')
})

test('A7 esquema incompatible: se detiene por esquema ANTES de validar', () => {
  const { invoke, g } = montar({ cabecera: CAB_L_SIN_MIGRAR })
  const n = CAB_L_SIN_MIGRAR.length
  const r = lote(invoke, [{ idempotencyKey: 'a', row: fila('otro@empresa.cl', n, 12) }])
  assert.equal(r.status, 'schema_not_migrated')
  assert.equal(g.writes.length, 0)
})

test('A8 migracion: colision creado_por en el destino se detiene sin escribir', () => {
  // creado_por EXCLUSIVAMENTE en N (14), que es el destino de `estado`.
  const cab = ['timestamp', 'fecha', 'rut', 'proveedor', 'monto', 'categoria',
    'boleta_numero', 'giro', 'notas', 'ocr', 'image_url', 'x', 'y', 'creado_por']
  const g = new FakeSheet('Gastos', [cab.slice()], 14)
  const u = usuariosSheet([[EMAIL, 'h', 'E', 'pro', 100, 0, 'TRUE', 'user', '', BASE_SHEET_ID]])
  const sheets = { [BASE_SHEET_ID]: new FakeSpreadsheet(BASE_SHEET_ID, { Gastos: g, Usuarios: u }) }
  const { invoke } = loadGasLock({ secret: SECRETO, sheets })
  const r = invoke({ action: 'migrate', spreadsheetId: BASE_SHEET_ID })
  assert.equal(r.status, 'schema_conflict')
  assert.match(r.message, /sobrescribiria/)
  assert.equal(g.writes.length, 0)
  assert.equal(g.grid[0][13], 'creado_por', 'intacto')
})

test('A9 migracion normal: añade ambas cabeceras en M y N sin tocar datos', () => {
  const g = new FakeSheet('Gastos', [CAB_L_SIN_MIGRAR.slice()], 12)
  const u = usuariosSheet([[EMAIL, 'h', 'E', 'pro', 100, 0, 'TRUE', 'user', '', BASE_SHEET_ID]])
  const sheets = {
    [BASE_SHEET_ID]: new FakeSpreadsheet(BASE_SHEET_ID, { Gastos: g, Usuarios: u }),
    [CONFIG_ID]: new FakeSpreadsheet(CONFIG_ID, { Usuarios: u }),
  }
  const { invoke } = loadGasLock({ secret: SECRETO, sheets })
  const r = invoke({ action: 'migrate', spreadsheetId: BASE_SHEET_ID })
  assert.equal(r.status, 'migrated')
  assert.equal(g.grid[0][12], 'idempotency_key')
  assert.equal(g.grid[0][13], 'estado')
  assert.equal(invoke({ action: 'migrate', spreadsheetId: BASE_SHEET_ID }).status, 'already_migrated')

  const s = invoke({
    action: 'save', spreadsheetId: BASE_SHEET_ID, configSpreadsheetId: CONFIG_ID,
    userEmail: EMAIL, idempotencyKey: 'k', limite: 100, row: fila(EMAIL, 12, 12),
  })
  assert.equal(s.status, 'ok')
  assert.equal(g.grid[1][11], EMAIL)
  assert.equal(g.grid[1][12], 'k')
})
