import { createHash, randomBytes, timingSafeEqual } from 'crypto'

/**
 * hashing de contraseñas — estándar único (cierra ADR-001).
 *
 * Formato almacenado: `sha256:<salt>:<hash>`
 *   - salt  : 16 bytes hex (32 caracteres)
 *   - hash  : SHA-256 de `salt + password`
 *
 * Se usa sal por usuario para que dos contraseñas iguales no produzcan el
 * mismo valor almacenado y para resists ataques de tabla precalculada.
 *
 * Comparaciones con `timingSafeEqual` para no filtrar información por tiempo.
 */

const ALGO = 'sha256'
const SALT_BYTES = 16
const SALT_CHARS = SALT_BYTES * 2
const HASH_CHARS = 64
const SALTED_RE = new RegExp(`^${ALGO}:[^:]+:[0-9a-f]{${HASH_CHARS}}$`, 'i')
const LEGACY_PLAIN_RE = new RegExp(`^[0-9a-f]{${HASH_CHARS}}$`, 'i')

/** Genera el valor completo `sha256:<salt>:<hash>` para storing. */
export function hashPassword(password: string): string {
  const salt = randomBytes(SALT_BYTES).toString('hex')
  const hash = createHash(ALGO).update(salt + password).digest('hex')
  return `${ALGO}:${salt}:${hash}`
}

/** SHA-256 plano. Solo para leer hashes históricos; nunca para storing. */
function legacyPlainHash(password: string): string {
  return createHash(ALGO).update(password).digest('hex')
}

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a, 'utf8')
  const bufB = Buffer.from(b, 'utf8')
  if (bufA.length !== bufB.length) return false
  return timingSafeEqual(bufA, bufB)
}

/** Formatos reconocidos en la hoja `Usuarios` (columna B). */
export type PasswordFormat = 'salted' | 'legacy' | 'unknown'

export function detectFormat(stored: string | undefined | null): PasswordFormat {
  if (!stored) return 'unknown'
  if (SALTED_RE.test(stored)) return 'salted'
  if (LEGACY_PLAIN_RE.test(stored)) return 'legacy'
  return 'unknown'
}

export function isSalted(stored: string | undefined | null): boolean {
  return detectFormat(stored) === 'salted'
}

/**
 * Verifica una contraseña contra el valor almacenado.
 *
 * Acepta el formato con sal (actual) y el SHA-256 plano (histórico, para que
 * los usuarios migrados no pierdan acceso). El formato de texto plano NO se
 * acepta: fue eliminado junto con la migración de la hoja.
 */
export function verifyPassword(password: string, stored: string | undefined | null): boolean {
  if (!stored) return false

  if (SALTED_RE.test(stored)) {
    const [, salt, hash] = stored.split(':')
    return safeEqual(createHash(ALGO).update(salt + password).digest('hex'), hash.toLowerCase())
  }

  if (LEGACY_PLAIN_RE.test(stored)) {
    return safeEqual(legacyPlainHash(password), stored.toLowerCase())
  }

  return false
}

/** Contraseña aleatoria para altas administrativas. */
export function generatePassword(length = 12): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%'
  let out = ''
  for (let i = 0; i < length; i++) out += chars.charAt(Math.floor(Math.random() * chars.length))
  return out
}