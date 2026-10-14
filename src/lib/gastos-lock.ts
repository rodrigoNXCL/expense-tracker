/**
 * Cliente del script de Apps Script que serializa el consumo de cupos.
 *
 * CONTRATO REAL (verificado contra las capacidades de Apps Script):
 * `ContentService` NO permite fijar códigos de estado HTTP. Todas las
 * respuestas del script llegan con **HTTP 200** y el resultado viaja en el
 * campo `status` del cuerpo JSON. Este módulo NUNCA decide por el código HTTP:
 * decide por `status`. Cualquier estado desconocido se trata como fallo
 * (fail-closed), jamás como éxito.
 *
 * PRINCIPIO: falla cerrado. Si el script no está configurado, no responde,
 * responde HTML (p.ej. una redirección de consentimiento de Google) o se
 * agota el tiempo, este módulo lanza un error y la ruta devuelve 503 sin
 * escribir nada. NUNCA hay una escritura alternativa directa en `Gastos`,
 * porque eludiría el bloqueo y reintroduciría la carrera.
 */

export type LockStatus =
  | 'ok'
  | 'duplicate'
  | 'quota_exceeded'
  | 'limit_unavailable'
  | 'write_failed'
  | 'partial_batch'
  | 'neutralize_failed'
  | 'lock_timeout'
  | 'unauthorized'
  | 'not_configured'
  | 'schema_not_migrated'
  | 'schema_conflict'
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
  limit_source?: string
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

/** Categoría de fallo, para decidir la respuesta HTTP del backend. */
export type LockFailureKind =
  | 'not_configured'
  | 'unreachable'
  | 'timeout'
  | 'unauthorized'

/**
 * Error de infraestructura del lock. Distinto de un rechazo de negocio: un
 * `quota_exceeded` es una respuesta válida, no un fallo del sistema.
 */
export class LockUnavailableError extends Error {
  readonly kind: LockFailureKind
  constructor(kind: LockFailureKind, message: string) {
    super(message)
    this.name = 'LockUnavailableError'
    this.kind = kind
  }
}

/**
 * Clasificación explícita de cada estado del script.
 *
 * `http` es el código que el backend debe devolver al cliente.
 * `kind` permite tratar de forma uniforme cada familia de problema.
 *
 * Reglas:
 *  - `ok` y `duplicate` son los ÚNICOS estados que permiten confirmar la
 *    escritura. `duplicate` confirma el resultado de una operación previa, no
 *    una escritura nueva.
 *  - `unauthorized` y `not_configured` NUNCA son éxito: son 503 con
 *    `retryable: false` porque reintentar sin corregir la credencial no ayuda.
 *  - `schema_not_migrated` y `schema_conflict` son 503 no reintentables: la
 *    hoja tiene que intervenirse primero.
 *  - `limit_unavailable` significa que el script NO pudo leer `Usuarios!E` y no
 *    decidió cupo. Es reintentable y no escribe nada: el cliente reenvía la
 *    MISMA `idempotency_key` cuando la lectura se recupere.
 *  - Cualquier estado fuera de esta tabla se marca `unknown` y se trata con
 *    fail-closed.
 */
export type LockOutcome =
  | 'saved' | 'replayed' | 'rejected_quota' | 'rejected_needs_ops' | 'limit_unknown'
  | 'partial_write'
  | 'infra_unavailable' | 'infra_misconfigured' | 'schema_problem'
  | 'script_bug' | 'unknown'

export interface LockMapping {
  http: number
  outcome: LockOutcome
  retryable: boolean
  code: string
}

const MAPPING: Record<LockStatus, LockMapping> = {
  ok: { http: 200, outcome: 'saved', retryable: false, code: 'ok' },
  duplicate: { http: 200, outcome: 'replayed', retryable: false, code: 'duplicate' },
  quota_exceeded: { http: 403, outcome: 'rejected_quota', retryable: false, code: 'quota_exceeded' },
  limit_unavailable: { http: 503, outcome: 'limit_unknown', retryable: true, code: 'limit_unavailable' },
  // Escritura interrumpida: hay filas con clave ya escritas. El reintento con
  // la MISMA clave las reconoce y solo inserta las que faltan.
  partial_batch: { http: 503, outcome: 'partial_write', retryable: true, code: 'partial_batch' },
  write_failed: { http: 503, outcome: 'partial_write', retryable: true, code: 'write_failed' },
  neutralize_failed: { http: 500, outcome: 'rejected_needs_ops', retryable: false, code: 'neutralize_failed' },
  lock_timeout: { http: 503, outcome: 'infra_unavailable', retryable: true, code: 'lock_timeout' },
  unauthorized: { http: 503, outcome: 'infra_misconfigured', retryable: false, code: 'unauthorized' },
  not_configured: { http: 503, outcome: 'infra_misconfigured', retryable: false, code: 'not_configured' },
  schema_not_migrated: { http: 503, outcome: 'schema_problem', retryable: false, code: 'schema_not_migrated' },
  schema_conflict: { http: 503, outcome: 'schema_problem', retryable: false, code: 'schema_conflict' },
  unknown_action: { http: 500, outcome: 'script_bug', retryable: false, code: 'unknown_action' },
  bad_request: { http: 400, outcome: 'script_bug', retryable: false, code: 'bad_request' },
  script_error: { http: 500, outcome: 'script_bug', retryable: false, code: 'script_error' },
}

/** Estados que confirman que el gasto quedó registrado. Nada más lo hace. */
export function isWriteConfirmed(result: LockResult): boolean {
  return result.status === 'ok' || result.status === 'duplicate'
}

/** Tabla de estados -> respuesta HTTP. Estado desconocido => fail-closed. */
export function mapLockStatus(result: LockResult): LockMapping {
  const known = MAPPING[result.status]
  if (known) return known
  return {
    http: 503,
    outcome: 'unknown',
    retryable: false,
    code: `unrecognized_status:${String(result.status)}`,
  }
}

/** Se lee en cada llamada: no se captura al importar el módulo. */
function timeoutMs(): number {
  const n = Number(process.env.GAS_LOCK_TIMEOUT_MS)
  return Number.isFinite(n) && n > 0 ? n : 20000
}

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

/**
 * Ejecuta una acción contra el script.
 *
 * Gestión de redirecciones: Google puede devolver HTML (consentimiento, login o
 * una página de error) en lugar del JSON del script. Eso NO es una respuesta
 * válida: se detecta por el `content-type` y por el parseo, y se reporta como
 * `unreachable`, nunca como éxito.
 */
export async function callLock(action: string, body: Record<string, unknown>): Promise<LockResult> {
  const { url, secret } = getConfig()
  const endpoint = `${url}${url.includes('?') ? '&' : '?'}token=${encodeURIComponent(secret)}`

  const controller = new AbortController()
  const ms = timeoutMs()
  const timer = setTimeout(() => controller.abort(), ms)
  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, ...body }),
      signal: controller.signal,
      cache: 'no-store',
      redirect: 'follow',
    })

    const contentType = res.headers.get('content-type') || ''
    const text = await res.text()

    let parsed: LockResult
    try {
      parsed = JSON.parse(text) as LockResult
    } catch {
      throw new LockUnavailableError(
        'unreachable',
        `El script no devolvió JSON (content-type: ${contentType || 'desconocido'}, HTTP ${res.status}, url final: ${res.url}). Puede ser una redirección o una página de consentimiento de Google.`
      )
    }
    if (!parsed || typeof parsed !== 'object' || typeof parsed.status !== 'string') {
      throw new LockUnavailableError(
        'unreachable',
        `El script devolvió JSON sin campo 'status' (HTTP ${res.status}).`
      )
    }
    return parsed
  } catch (err) {
    if (err instanceof LockUnavailableError) throw err
    if (err instanceof Error && err.name === 'AbortError') {
      throw new LockUnavailableError(
        'timeout',
        `El script no respondió en ${ms} ms. El resultado es ambiguo: reintenta con la misma idempotency_key para no duplicar.`
      )
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
export function lockErrorResponse(
  err: unknown,
  idempotencyKey?: string
): { status: number; body: Record<string, unknown> } {
  if (err instanceof LockUnavailableError) {
    const body: Record<string, unknown> = {
      error:
        'El control de cupos no está disponible. No se guardó tu gasto, así que no se consumió cupo. Intenta de nuevo en unos segundos.',
      code: `lock_${err.kind}`,
      retryable: true,
      // Se devuelve la clave para que el reintento sea idempotente. Si el
      // resultado anterior fue ambiguo (timeout), reenviar la MISMA clave
      // recupera el resultado original en vez de crear una segunda fila.
      idempotency_key: idempotencyKey,
    }
    if (err.kind === 'unauthorized' || err.kind === 'not_configured') {
      body.error =
        'El control de cupos está mal configurado en el servidor. No se guardó tu gasto. Contacta al administrador.'
      body.retryable = false
    }
    return { status: 503, body }
  }
  return {
    status: 500,
    body: { error: 'Error interno del servidor', code: 'internal', retryable: true, idempotency_key: idempotencyKey },
  }
}

export function randomKey(): string {
  return globalThis.crypto.randomUUID()
}