/**
 * Arranque del script `GastosLock.gs` real dentro de un sandbox, con dobles de
 * las APIs de Apps Script y una hoja de Google simulada en memoria.
 *
 * No se usan hojas reales de clientes. Todo ocurre en memoria.
 */
import { readFileSync } from 'fs'
import { createContext, runInContext } from 'vm'
import { createHash } from 'crypto'

/** Hoja simulada con el comportamiento que el script necesita. */
export class FakeSheet {
  constructor(name, rows = [], cols = 12) {
    this.name = name
    this.grid = rows.map((r) => r.slice())
    while (this.grid.length < 1) this.grid.push([])
    if (this.grid[0].length < cols) while (this.grid[0].length < cols) this.grid[0].push('')
    for (const r of this.grid) while (r.length < cols) r.push('')
    this.cols = cols
    this.writes = []
    this.failOn = null // { op: 'setValue'|'appendRow', match: (args)=>bool }
  }
  getLastRow() { return this.grid.length }
  getLastColumn() { return Math.max(...this.grid.map((r) => r.length), this.cols) }
  getRange(row, col, numRows = 1, numCols = 1) {
    const self = this
    return {
      getValues() {
        const out = []
        for (let r = 0; r < numRows; r++) {
          const line = []
          for (let c = 0; c < numCols; c++) {
            line.push((self.grid[row - 1 + r] || [])[col - 1 + c] ?? '')
          }
          out.push(line)
        }
        return out
      },
      getValue() { return (this.getValues()[0] || [])[0] ?? '' },
      setValue(v) { self._set(row, col, v); return this },
    }
  }
  _set(row, col, v) {
    if (this.failOn && this.failOn.op === 'setValue') { this.failOn.match([row, col, v], this) }
    this.writes.push({ op: 'setValue', row, col, v })
    while (this.grid.length < row) this.grid.push([])
    while (this.grid[row - 1].length < col) this.grid[row - 1].push('')
    this.grid[row - 1][col - 1] = v
  }
  appendRow(values) {
    if (this.failOn && this.failOn.op === 'appendRow') { this.failOn.match([values], this) }
    const arr = values.slice()
    while (this.grid.length === 0) this.grid.push([])
    this.grid.push(arr)
    while (this.grid[0].length < arr.length) this.grid[0].push('')
    this.writes.push({ op: 'appendRow', values: arr })
  }
}

/** Libro simulado con varias pestañas. */
export class FakeSpreadsheet {
  constructor(id, sheets) { this.id = id; this._sheets = sheets }
  getSheetByName(n) { return this._sheets[n] || null }
}

/**
 * Crea el contexto de Apps Script simulado y ejecuta el `.gs` real.
 * @param {object} opts
 *  - secret: valor de GAS_LOCK_SECRET en Script Properties
 *  - sheets: { [spreadsheetId]: FakeSpreadsheet }
 */
export function loadGasLock({ secret = 'secreto-de-prueba', sheets = {}, failOpenId = null } = {}) {
  const props = secret === null ? {} : { GAS_LOCK_SECRET: secret }
  const calls = { locks: 0, lockAcquired: 0, released: 0 }
  let lockBusy = false

  const SpreadsheetApp = {
    openById(id) {
      // Simula un fallo de lectura transitorio (cuota de Sheets, red, etc.).
      if (failOpenId && failOpenId === id) {
        throw new Error('Fallo transitorio de lectura de Sheets: ' + id)
      }
      const ss = sheets[id]
      if (!ss) throw new Error('No se encontró el archivo: ' + id)
      return ss
    },
  }

  const LockService = {
    getScriptLock() {
      return {
        tryLock(ms) {
          calls.locks++
          if (lockBusy) return false // otro"sector" lo tiene
          lockBusy = true
          calls.lockAcquired++
          return true
        },
        releaseLock() { lockBusy = false; calls.released++ },
      }
    },
  }

  const PropertiesService = {
    getScriptProperties() {
      return {
        getProperty: (k) => (k in props ? props[k] : null),
      }
    },
  }

  const Utilities = {
    DigestAlgorithm: { SHA_256: 'SHA_256' },
    Charset: { UTF_8: 'UTF_8' },
    computeDigest(alg, data) {
      return [...createHash('sha256').update(String(data), 'utf8').digest()]
    },
  }

  const ContentService = {
    MimeType: { JSON: 'application/json' },
    createTextOutput(txt) {
      return {
        setMimeType() { return this },
        getContent() { return txt },
      }
    },
  }

  const sandbox = {
    SpreadsheetApp, LockService, PropertiesService, Utilities, ContentService,
    console: { log() {}, warn() {}, error() {} },
    isFinite, Number, String, Math, Array, Object, JSON, RegExp, parseInt, parseFloat, Date,
  }
  sandbox.globalThis = sandbox
  const ctx = createContext(sandbox)

  const src = readFileSync('google-apps-script/GastosLock.gs', 'utf8')
  runInContext(src, ctx, { filename: 'GastosLock.gs' })

  /**
   * Invoca doPost y devuelve el JSON parseado.
   * Por defecto envía el secreto configurado (como hace el backend con
   * `?token=`). `invoke(body, null)` simula una llamada SIN token.
   */
  function invoke(body, queryToken) {
    const t = queryToken === undefined ? secret : queryToken
    const e = { parameter: t === null ? {} : { token: t }, postData: { contents: JSON.stringify(body) } }
    return JSON.parse(ctx.doPost(e).getContent())
  }
  function invokeGet(queryToken) {
    const t = queryToken === undefined ? secret : queryToken
    const e = { parameter: t === null ? {} : { token: t } }
    return JSON.parse(ctx.doGet(e).getContent())
  }

  return { ctx, invoke, invokeGet, calls, setBusy: (v) => { lockBusy = v } }
}

/** Construye la hoja `Gastos` migrada (con M y N) y vacía de datos. */
export function gastosSheetMigrada(header = []) {
  const h = ['id', 'fecha', 'rut', 'proveedor', 'monto', 'categoria', 'boleta_numero', 'giro', 'notas', 'ocr', 'image_url', 'creado_por']
  while (h.length < 12) h.push('')
  h[12] = 'idempotency_key'
  h[13] = 'estado'
  return new FakeSheet('Gastos', [h], 14)
}

/** Hoja `Usuarios` de la configuración: [email, hash, empresa, plan, limite, usadas, activo, rol, creado, sheet]. */
export function usuariosSheet(rows) {
  const h = ['email', 'password_hash', 'empresa_nombre', 'plan', 'limite_boletas', 'boletas_usadas', 'activo', 'rol', 'creado_en', 'sheet_id_asociado']
  return new FakeSheet('Usuarios', [h, ...rows], 10)
}

export const BASE_SHEET_ID = 'sheet-de-prueba'
export const CONFIG_ID = 'config-de-prueba'