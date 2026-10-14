/**
 * Prueba HTTP de extremo a extremo del desfase del dashboard.
 *
 * Levanta un endpoint local que ejecuta el `GastosLock.gs` REAL sobre una hoja
 * en memoria, arranca el servidor de desarrollo de Next y recorre el flujo real:
 * POST /api/save-expense -> GET /api/auth/me con la cookie devuelta.
 *
 * NO toca ninguna hoja de clientes.
 * Uso:  node tests/desfase-dashboard.http.mjs   (con el repo como cwd)
 */
import { createServer } from 'http'
import { readFileSync } from 'fs'
import { createContext, runInContext } from 'vm'
import { createHash, createHmac } from 'crypto'
import { createRequire } from 'module'

const R = 'C:/nxCL/webNX/expense-tracker/'
const requireRepo = createRequire(R + 'package.json')
const H = requireRepo('fs')

const { FakeSheet, FakeSpreadsheet, usuariosSheet } = requireRepo('./tests/harness-gaslock.mjs')

const SECRETO = 'secreto-desfase-http'
const EMAIL = 'user@empresa.cl'
const GASTOS = 'GASTOS'
const CFG = 'CFG'
const LIMITE = 9999
const INICIALES = 10
const PUERTO_LOCK = 4595

const CAB = ['timestamp', 'fecha', 'rut', 'proveedor', 'monto', 'categoria',
  'boleta_numero', 'giro', 'notas', 'ocr', 'image_url', 'creado_por',
  'idempotency_key', 'estado']

const g = new FakeSheet('Gastos', [CAB.slice()], 14)
const u = usuariosSheet([[EMAIL, 'h', 'Empresa', 'pro', LIMITE, 0, 'TRUE', 'user', '', GASTOS]])
for (let i = 0; i < INICIALES; i++) {
  g.grid.push([`2026-10-01T00:00:00Z`, '2026-10-01', '76258687-8', 'PREVIO', 1000,
    'Otros', String(i), '', '', 0, '', EMAIL, `previo-${i}`, 'ok'])
}
const sheets = {
  [GASTOS]: new FakeSpreadsheet(GASTOS, { Gastos: g, Usuarios: u }),
  [CFG]: new FakeSpreadsheet(CFG, { Usuarios: u }),
}
const props = { GAS_LOCK_SECRET: SECRETO }
let busy = false
const sb = {
  SpreadsheetApp: { openById: (id) => sheets[id] || sheets[CFG] },
  LockService: { getScriptLock: () => ({
    tryLock: () => { if (busy) return false; busy = true; return true },
    releaseLock: () => { busy = false } }) },
  PropertiesService: { getScriptProperties: () => ({ getProperty: (k) => (k in props ? props[k] : null) }) },
  Utilities: { DigestAlgorithm: { SHA_256: 'SHA_256' }, Charset: { UTF_8: 'UTF_8' },
    computeDigest: (a, d) => [...createHash('sha256').update(String(d), 'utf8').digest()] },
  ContentService: { MimeType: { JSON: 'application/json' },
    createTextOutput: (t) => ({ setMimeType() { return this }, getContent() { return t } }) },
  console: { log() {}, warn() {}, error() {} },
  isFinite, Number, String, Math, Array, Object, JSON, RegExp, parseInt, parseFloat, Date,
}
sb.globalThis = sb
const scriptCtx = createContext(sb)
runInContext(readFileSync(R + 'google-apps-script/GastosLock.gs', 'utf8'), scriptCtx,
  { filename: 'GastosLock.gs' })

const lockServer = createServer((req, res) => {
  let body = ''
  req.on('data', (c) => (body += c))
  req.on('end', () => {
    const url = new URL(req.url, 'http://localhost')
    const out = scriptCtx.handle_({
      parameter: Object.fromEntries(url.searchParams),
      postData: { contents: body },
    })
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(out.getContent())
  })
})
await new Promise((r) => lockServer.listen(PUERTO_LOCK, r))

const env = readFileSync(R + '.env.local', 'utf8')
const AUTH_SECRET = env.split('\n').find((l) => l.startsWith('AUTH_SECRET='))
  .split('=').slice(1).join('=').trim().replace(/^["']|["']$/g, '')
const b64 = (s) => Buffer.from(s).toString('base64url')
const mint = (o) => {
  const h = b64(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const n = Math.floor(Date.now() / 1000)
  const p = b64(JSON.stringify({ ...o, iat: n, exp: n + 604800 }))
  return `${h}.${p}.${createHmac('sha256', AUTH_SECRET).update(`${h}.${p}`).digest('base64url')}`
}
const token = mint({
  email: EMAIL, empresa_nombre: 'Empresa', plan: 'pro', limite_boletas: LIMITE,
  boletas_usadas: INICIALES, activo: true, rol: 'user',
  sheet_id_asociado: GASTOS, tipo_usuario: 'gastos',
})

let pass = 0, fail = 0
const chk = (n, ok, d = '') => { ok ? pass++ : fail++; console.log(`  [${ok ? 'OK   ' : 'FALLA'}] ${n}${d ? ' — ' + d : ''}`) }
const disp = (x) => x.limite_boletas - x.boletas_usadas

const BASE = process.env.PORT ? `http://localhost:${process.env.PORT}` : null
if (!BASE) { console.error('Falta PORT. Arranca `npm run dev` y ejecuta con PORT=<puerto>.'); process.exit(2) }

const me = async (c) => (await (await fetch(`${BASE}/api/auth/me`, { headers: { cookie: `gx_session=${c}` } })).json()).user
const guardar = async (c, key) => {
  const fd = new FormData()
  fd.append('data', JSON.stringify({ fecha: '2026-10-13', proveedor: 'DESFASE', monto: 1000, categoria: 'Otros' }))
  if (key) fd.append('idempotency_key', key)
  return fetch(`${BASE}/api/save-expense`, { method: 'POST', headers: { cookie: `gx_session=${c}` }, body: fd })
}

console.log(`=== DESFASE DEL DASHBOARD (HTTP real, hoja en memoria) ===`)
console.log(`servidor: ${BASE} | lock: http://localhost:${PUERTO_LOCK}/exec\n`)

const antes = await me(token)
chk('Punto de partida: plan en 10/9999 con 9989 disponibles',
  antes.boletas_usadas === 10 && disp(antes) === 9989,
  `${antes.boletas_usadas}/${antes.limite_boletas}, disponibles=${disp(antes)}`)

const res = await guardar(token, 'DESFASE-1')
const body = await res.json()
chk('El guardado responde con 11/9999',
  res.status === 200 && body.boletas_usadas === 11 && body.limite_boletas === LIMITE,
  `HTTP ${res.status}, ${body.boletas_usadas}/${body.limite_boletas}`)

const setCookie = res.headers.get('set-cookie') || ''
const nueva = (setCookie.match(/gx_session=([^;]+)/) || [])[1]
chk('El guardado renueva la cookie de sesión', !!nueva,
  nueva ? 'Set-Cookie presente (esa era la causa del desfase)' : 'SIN Set-Cookie')

const despues = await me(nueva || token)
chk('El indicador del plan pasa a 11/9999', despues.boletas_usadas === 11,
  `${despues.boletas_usadas}/${despues.limite_boletas}`)
chk('Los disponibles pasan a 9988', disp(despues) === 9988, `disponibles=${disp(despues)}`)
chk('La hoja tiene 11 gastos', g.grid.length - 1 === INICIALES + 1, `${g.grid.length - 1} filas`)

const reintento = await (await guardar(nueva || token, 'DESFASE-1')).json()
chk('El reintento no duplica ni mueve el contador',
  reintento.boletas_usadas === 11 && g.grid.length - 1 === INICIALES + 1,
  `consumo=${reintento.boletas_usadas}, filas=${g.grid.length - 1}`)

console.log(`\n=========== ${fail === 0 ? 'DESFASE CORREGIDO' : fail + ' FALLA(S)'} (${pass} OK / ${fail} fallo) ===========`)
lockServer.close()
// Sin process.exit: forzar la salida con handles abiertos rompe libuv en Windows.
if (fail > 0) throw new Error(fail + ' comprobaciones fallaron')
