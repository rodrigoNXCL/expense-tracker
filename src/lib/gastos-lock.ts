/**
 * Cliente del script de Apps Script que serializa el consumo de cupos.
 *
 * PRINCIPIO DE DISEÑO: falla cerrado.
 * Si el script no está configurado, no responde o agota el tiempo, este módulo
 * lanza un error y la ruta devuelve 503. NUNCA escribe en `Gastos` por su
 * cuenta: una escritura alternativa eludiría el bloqueo y reintroduciría la
 * carrera que estamos corrigiendo.
 */

export type LockStatus =
  | 'ok'
  | 'duplicate'
  | 'quota_exceeded'
  | 'lock_timeout'
  | 'unauthorized'
  | 'not_configured'
  | 'schema_not_migrated'
  | 'unknown_action'
  | 'bad_request'
  | 'script_error'

export interface PlacedRow {
  idempotencyKey: string
  row: number | null
}

export interface LockResult {
  status: LockStatus
  idempotent?: boolean
  estado?: string
  consumos?: number
  limite?: number
  inserted?: number
  already_present?: number
  placed?: PlacedRow[]
  requested?: number
  available?: number
  neutralized?: boolean
  message?: string
}

export interface LockItem {
  idempotencyKey: string
  row: unknown[]
}

/**
 * Error de infraestructura del lock. Distinto de un rechazo de negocio: un
 * `quota_exceeded` es una respuesta válida, no un fallo del sistema.
 */
export class LockUnavailableError extends Error {
  readonly kind: 'not_configured' | 'unreachable' | 'timeout' | 'unauthorized'
  constructor(kind: 'not_configured' | 'unreachable' | 'timeout' | 'unauthorized', message: string) {
    super(message)
    this.name = 'LockUnavailableError'
    this.kind = kind
  }
}

const TIMEOUT_MS = Number(process.env.GAS_LOCK_TIMEOUT_MS || 20000)

function getConfig(): { url: string; secret: string } {
  const url = process.env.GAS_LOCK_URL
  const secret = process.env.GAS_LOCK_SECRET
  if (!url || !secret) {
    throw new LockUnavailableError(
      'not_configured',
      'GAS_LOCK_URL o GAS_LOCK_SECRET no están configurados. El guardado está deshabilitado a propósito para no escribir sin bloqueo.'
    )
  }
  return { url, secret }
}

/** Ejecuta una acción contra el script. Lanza solo ante fallo de infraestructura. */
export async function callLock(action: string, body: Record<string, unknown>): Promise<LockResult> {
  const { url, secret } = getConfig()
  const endpoint = `${url}${url.includes('?') ? '&' : '?'}token=${encodeURIComponent(secret)}`

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, ...body }),
      signal: controller.signal,
      cache: 'no-store',
    })
    const text = await res.text()
    let parsed: LockResult
    try {
      parsed = JSON.parse(text) as LockResult
    } catch {
      throw new LockUnavailableError('unreachable', `Respuesta ilegible del script (HTTP ${res.status})`)
    }
    // 401 y 503 con cuerpo JSON son respuestas legítimas del script.
    if (!parsed || !parsed.status) {
      throw new LockUnavailableError('unreachable', `Respuesta inesperada del script (HTTP ${res.status})`)
    }
    return parsed
  } catch (err) {
    if (err instanceof LockUnavailableError) throw err
    if (err instanceof Error && err.name === 'AbortError') {
      throw new LockUnavailableError('timeout', `El script no respondió en ${TIMEOUT_MS} ms`)
    }
    throw new LockUnavailableError('unreachable', 'No se pudo contactar el script de bloqueo')
  } finally {
    clearTimeout(timer)
  }
}

/**
 * Traduce un fallo de infraestructura a una respuesta HTTP segura.
 * En todos los casos el gasto NO se registra.
 */
export function lockErrorResponse(err: unknown): {
  status: number
  body: { error: string; code: string; retryable: boolean }
} {
  if (err instanceof LockUnavailableError) {
    if (err.kind === 'unauthorized') {
      return {
        status: 503,
        body: {
          error: 'El servicio de control de cupos rechazó la credencial. No se guardó tu gasto.',
          code: 'lock_unauthorized',
          retryable: false,
        },
      }
    }
    return {
      status: 503,
      body: {
        error:
          'El control de cupos no está disponible. No se guardó tu gasto, así que no se consumió cupo. Intenta de nuevo en unos segundos.',
        code: 'lock_unavailable',
        retryable: true,
      },
    }
  }
  return {
    status: 500,
    body: { error: 'Error interno del servidor', code: 'internal', retryable: true },
  }
}

/** Mensaje de negocio cuando la hoja aún no tiene las columnas nuevas. */
export function schemaNotMigratedResponse(): {
  status: number
  body: { error: string; code: string; retryable: boolean }
} {
  return {
    status: 503,
    body: {
      error:
        'La hoja de esta empresa aún no tiene las columnas de control (idempotency_key, estado). El guardado está deshabilitado hasta ejecutar la migración autorizada.',
      code: 'schema_not_migrated',
      retryable: false,
    },
  }
}

export function randomKey(): string {
  return crypto.randomUUID()
}