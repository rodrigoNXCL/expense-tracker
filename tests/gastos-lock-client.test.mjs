/**
 * Pruebas del cliente `src/lib/gastos-lock.ts`: mapeo de estados, fail-closed
 * y manejo de respuestas no JSON (redirecciones de Google).
 */
import { test, beforeEach, afterEach } from 'node:test'
import assert from 'node:assert/strict'

const URL = 'https://script.google.com/macros/s/EJEMPLO/exec'
const SECRET = 'secreto-de-prueba-1234567890'

process.env.GAS_LOCK_URL = URL
process.env.GAS_LOCK_SECRET = SECRET

const { callLock, mapLockStatus, isWriteConfirmed, lockErrorResponse, LockUnavailableError } =
  await import('../src/lib/gastos-lock.ts')

let fetchOriginal
let ultimaLlamada

function mockFetch(handler) {
  globalThis.fetch = async (url, opts) => {
    ultimaLlamada = { url, opts }
    return handler(url, opts)
  }
}
const jsonRes = (obj) =>
  new Response(JSON.stringify(obj), { status: 200, headers: { 'content-type': 'application/json' } })

beforeEach(() => {
  fetchOriginal = globalThis.fetch
  process.env.GAS_LOCK_URL = URL
  process.env.GAS_LOCK_SECRET = SECRET
})
afterEach(() => {
  globalThis.fetch = fetchOriginal
  delete process.env.GAS_LOCK_TIMEOUT_MS
})

// --- Mapeo de estados ------------------------------------------------------
test('ok y duplicate son los únicos que confirman escritura', () => {
  assert.equal(isWriteConfirmed({ status: 'ok' }), true)
  assert.equal(isWriteConfirmed({ status: 'duplicate' }), true)
  for (const s of ['quota_exceeded', 'lock_timeout', 'unauthorized', 'not_configured',
    'schema_not_migrated', 'schema_conflict', 'unknown_action', 'bad_request',
    'script_error', 'neutralize_failed']) {
    assert.equal(isWriteConfirmed({ status: s }), false, `${s} no debe confirmar escritura`)
  }
})

test('Ningún estado desconocido se interpreta como éxito', () => {
  const m = mapLockStatus({ status: 'inventado' })
  assert.equal(m.http, 503)
  assert.equal(m.outcome, 'unknown')
  assert.equal(m.code, 'unrecognized_status:inventado')
  assert.equal(isWriteConfirmed({ status: 'inventado' }), false)
})

test('unauthorized y not_configured nunca son éxito ni reintentables', () => {
  for (const s of ['unauthorized', 'not_configured']) {
    const m = mapLockStatus({ status: s })
    assert.equal(m.http, 503)
    assert.equal(m.outcome, 'infra_misconfigured')
    assert.equal(m.retryable, false)
  }
})

test('schema_not_migrated y schema_conflict sonSchema problem, no reintentables', () => {
  for (const s of ['schema_not_migrated', 'schema_conflict']) {
    const m = mapLockStatus({ status: s })
    assert.equal(m.outcome, 'schema_problem')
    assert.equal(m.retryable, false)
    assert.equal(m.http, 503)
  }
})

test('quota_exceeded es rechazo de negocio: 403 y no reintentable', () => {
  const m = mapLockStatus({ status: 'quota_exceeded' })
  assert.equal(m.http, 403)
  assert.equal(m.outcome, 'rejected_quota')
  assert.equal(m.retryable, false)
})

test('lock_timeout es reintentable con la MISMA clave', () => {
  const m = mapLockStatus({ status: 'lock_timeout' })
  assert.equal(m.http, 503)
  assert.equal(m.retryable, true)
})

// --- Configuración ---------------------------------------------------------
test('Configuración ausente: falla cerrado con not_configured', async () => {
  delete process.env.GAS_LOCK_URL
  delete process.env.GAS_LOCK_SECRET
  let llamado = false
  globalThis.fetch = async () => { llamado = true; return jsonRes({ status: 'ok' }) }
  await assert.rejects(() => callLock('save', {}), (e) => {
    assert.ok(e instanceof LockUnavailableError)
    assert.equal(e.kind, 'not_configured')
    return true
  })
  assert.equal(llamado, false, 'no debe llamar al script si no hay configuración')
})

// --- Contrato HTTP ---------------------------------------------------------
test('Apps Script responde 200 con status=unauthorized; el backend NO lo toma como éxito', async () => {
  mockFetch(() => jsonRes({ status: 'unauthorized', http_status_noted: 401 }))
  const r = await callLock('save', {})
  assert.equal(r.status, 'unauthorized')
  assert.equal(isWriteConfirmed(r), false)
  assert.equal(mapLockStatus(r).http, 503)
})

test('Respuesta HTML (redirección/consentimiento) se trata como unreachable', async () => {
  mockFetch(() => new Response('<!DOCTYPE html><html>Sign in</html>', {
    status: 200, headers: { 'content-type': 'text/html' },
  }))
  await assert.rejects(() => callLock('save', {}), (e) => {
    assert.equal(e.kind, 'unreachable')
    assert.match(e.message, /no devolvió JSON/)
    return true
  })
})

test('JSON sin campo status se trata como unreachable', async () => {
  mockFetch(() => jsonRes({ resultado: 'algo' }))
  await assert.rejects(() => callLock('save', {}), (e) => {
    assert.equal(e.kind, 'unreachable')
    return true
  })
})

test('El secreto viaja en la query string y la acción en el cuerpo', async () => {
  mockFetch(() => jsonRes({ status: 'ok' }))
  await callLock('saveBatch', { spreadsheetId: 'x' })
  assert.match(ultimaLlamada.url, /token=/)
  assert.equal(ultimaLlamada.opts.method, 'POST')
  assert.equal(JSON.parse(ultimaLlamada.opts.body).action, 'saveBatch')
})

test('Timeout: devuelve la clave para permitir reintento idempotente', async () => {
  process.env.GAS_LOCK_TIMEOUT_MS = '40'
  mockFetch((url, opts) => new Promise((_, rej) => {
    opts.signal.addEventListener('abort', () => {
      const e = new Error('aborted'); e.name = 'AbortError'; rej(e)
    })
  }))
  await assert.rejects(() => callLock('save', {}), (e) => {
    assert.equal(e.kind, 'timeout')
    assert.match(e.message, /idempotency_key/)
    return true
  })
})

test('lockErrorResponse con clave permite reintentar sin duplicar', () => {
  const r = lockErrorResponse(new LockUnavailableError('timeout', 'x'), 'clave-fija')
  assert.equal(r.status, 503)
  assert.equal(r.body.idempotency_key, 'clave-fija')
  assert.equal(r.body.retryable, true)
})

test('lockErrorResponse con unauthorized no es reintentable', () => {
  const r = lockErrorResponse(new LockUnavailableError('unauthorized', 'x'), 'k')
  assert.equal(r.status, 503)
  assert.equal(r.body.retryable, false)
  assert.match(String(r.body.error), /mal configurado/)
})