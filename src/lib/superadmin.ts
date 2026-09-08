import { createHash } from 'crypto'

const SUPER_ADMIN_COOKIE = 'gx_superadmin_session'
const SUPER_ADMIN_SESSION_DAYS = 7

export interface SuperAdminSession {
  email: string
  exp: number
  iat: number
}

function getSecret(): string {
  const secret = process.env.AUTH_SECRET
  if (!secret) {
    throw new Error('AUTH_SECRET no está definido en variables de entorno')
  }
  return secret
}

function base64UrlEncode(input: string): string {
  return Buffer.from(input)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

function base64UrlDecode(input: string): string {
  const padded = input + '==='.slice(0, (4 - (input.length % 4)) % 4)
  return Buffer.from(padded.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf-8')
}

function hmacSha256(secret: string, data: string): string {
  return createHash('sha256').update(secret + data).digest('hex')
}

export function signSuperAdminSession(email: string): string {
  const now = Math.floor(Date.now() / 1000)
  const exp = now + SUPER_ADMIN_SESSION_DAYS * 24 * 60 * 60
  const payload: SuperAdminSession = {
    email: email.toLowerCase().trim(),
    iat: now,
    exp,
  }
  const header = { alg: 'HS256', typ: 'JWT' }
  const headerB64 = base64UrlEncode(JSON.stringify(header))
  const payloadB64 = base64UrlEncode(JSON.stringify(payload))
  const signature = hmacSha256(getSecret(), `${headerB64}.${payloadB64}`)
  return `${headerB64}.${payloadB64}.${signature}`
}

export function verifySuperAdminToken(token: string): SuperAdminSession | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    const [headerB64, payloadB64, signature] = parts
    const expectedSignature = hmacSha256(getSecret(), `${headerB64}.${payloadB64}`)
    if (signature !== expectedSignature) return null
    const payload = JSON.parse(base64UrlDecode(payloadB64)) as SuperAdminSession
    if (payload.exp < Math.floor(Date.now() / 1000)) return null
    return payload
  } catch {
    return null
  }
}

export function getSuperAdminCookieName(): string {
  return SUPER_ADMIN_COOKIE
}

export function getSuperAdminSessionDays(): number {
  return SUPER_ADMIN_SESSION_DAYS
}
