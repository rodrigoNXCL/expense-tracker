/**
 * Pruebas de autenticación del script.
 *
 * Reproducen el fallo reportado en producción: el endpoint devolvía
 * `unauthorized` con "Secreto compartido incorrecto." aunque el secreto fuese
 * correcto, porque el token solo se leía de `e.parameter` (query string).
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  loadGasLock, gastosSheetMigrada, usuariosSheet,
  FakeSpreadsheet, BASE_SHEET_ID,
} from './harness-gaslock.mjs'

const SECRETO = 'a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4'
const EMAIL = 'user@empresa.cl'

function sheets() {
  const g = gastosSheetMigrada()
  const u = usuariosSheet([[EMAIL, 'h', 'E', 'pro', 100, 0, 'TRUE', 'user', '', BASE_SHEET_ID]])
  return { [BASE_SHEET_ID]: new FakeSpreadsheet(BASE_SHEET_ID, { Gastos: g, Usuarios: u }) }
}

/** Invoca handle_ directamente para controlar query string y cuerpo. */
function ping(e, secret = SECRETO) {
  const { ctx } = loadGasLock({ secret, sheets: sheets() })
  return JSON.parse(ctx.handle_(e).getContent())
}

const enQuery = (token) => ({ parameter: { token }, postData: { contents: '{"action":"ping"}' } })
const enCuerpo = (token) => ({
  parameter: {},
  postData: { contents: JSON.stringify({ action: 'ping', token }) },
})

test('token en la query string (como el backend real): aceptado', () => {
  assert.equal(ping(enQuery(SECRETO)).status, 'ok')
})

test('token en el cuerpo JSON: aceptado (ANTES fallaba con unauthorized)', () => {
  const r = ping(enCuerpo(SECRETO))
  assert.equal(r.status, 'ok', 'el token en el cuerpo debe aceptarse')
})

test('sin token en ninguna vía: unauthorized', () => {
  assert.equal(ping({ parameter: {}, postData: { contents: '{"action":"ping"}' } }).status, 'unauthorized')
})

test('token incorrecto: unauthorized', () => {
  assert.equal(ping(enQuery('otro-secreto')).status, 'unauthorized')
  assert.equal(ping(enCuerpo('otro-secreto')).status, 'unauthorized')
})

test('espacios en la propiedad: se toleran (artefacto de copiar/pegar)', () => {
  assert.equal(ping(enQuery(SECRETO), SECRETO + '  \n').status, 'ok')
})

test('propiedad ausente: not_configured antes de comparar nada', () => {
  assert.equal(ping(enQuery(SECRETO), null).status, 'not_configured')
})

test('query string tiene prioridad pero el cuerpo rescata si falta', () => {
  const { ctx } = loadGasLock({ secret: SECRETO, sheets: sheets() })
  // Query con token válido y cuerpo con otro: manda la query.
  const r = JSON.parse(ctx.handle_({
    parameter: { token: SECRETO },
    postData: { contents: '{"action":"ping","token":"otro"}' },
  }).getContent())
  assert.equal(r.status, 'ok')
})
