import { createHmac, timingSafeEqual } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'

/**
 * Sesión verificable del lado servidor (ADR-002).
 * JWT HS256 firmado con AUTH_SECRET, enviado como cookie httpOnly.
 * El cliente ya no puede modificar rol/sheet_id/empresa desde localStorage.
 */

export interface SessionPayload {
  email: string
  empresa_nombre: string
  plan: string
  limite_boletas: number
  boletas_usadas: number
  activo: boolean
  rol: string
  sheet_id_asociado: string
}

const COOKIE_NAME = 'gx_session'
const TOKEN_TTL = 7 * 24 * 60 * 60 // 7 días

function base64url(data: Buffer | string): string {
  return Buffer.from(data).toString('base64url')
}

function getSecret(): string {
  const secret = process.env.AUTH_SECRET
  if (!secret || secret.length < 16) {
    throw new Error('AUTH_SECRET no configurado (mín 16 caracteres)')
  }
  return secret
}

function sign(input: string): string {
  return base64url(createHmac('sha256', getSecret()).update(input).digest())
}

// Firmar HS256
function signPayload(headerB64: string, payloadB64: string): string {
  return sign(`${headerB64}.${payloadB64}`)
}

// Verificar con comparación de tiempo constante
function verify(headerB64: string, payloadB64: string, signature: string): boolean {
  const expected = sign(`${headerB64}.${payloadB64}`)
  const expectedBuf = Buffer.from(expected)
  const givenBuf = Buffer.from(signature)
  return expectedBuf.length === givenBuf.length && timingSafeEqual(expectedBuf, givenBuf)
}

// Generar token JWT para la sesión
export function signSession(user: SessionPayload): string {
  const header = base64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const now = Math.floor(Date.now() / 1000)
  const payload = base64url(
    JSON.stringify({ ...user, iat: now, exp: now + TOKEN_TTL })
  )
  const signature = signPayload(header, payload)
  return `${header}.${payload}.${signature}`
}

// Leer y verificar el token (devuelve payload sin iat/exp o null si inválido/vencido)
export function verifySessionToken(token: string): SessionPayload | null {
  const parts = token.split('.')
  if (parts.length !== 3) return null
  const [headerB64, payloadB64, signature] = parts
  try {
    if (!verify(headerB64, payloadB64, signature)) return null
    const payloadStr = Buffer.from(payloadB64, 'base64url').toString('utf8')
    const payload = JSON.parse(payloadStr)
    const now = Math.floor(Date.now() / 1000)
    if (!payload.exp || payload.exp < now) return null
    const { iat, exp, ...rest } = payload
    return rest as SessionPayload
  } catch {
    return null
  }
}

// Establecer cookie httpOnly en la respuesta del login
export function setSessionCookie(response: NextResponse, token: string): NextResponse {
  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: TOKEN_TTL,
  })
  return response
}

// Borrar cookie (logout)
export function clearSessionCookie(response: NextResponse): NextResponse {
  response.cookies.set(COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  })
  return response
}

/**
 * Obtener la sesión validada desde la request (lee cookie + verifica JWT).
 * Usar en todas las API Routes protegidas, en lugar del header x-session.
 */
export function readSession(request: NextRequest): SessionPayload | null {
  const token = request.cookies.get(COOKIE_NAME)?.value
  if (!token) return null
  return verifySessionToken(token)
}

export { COOKIE_NAME }