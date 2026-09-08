import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import {
  getSuperAdminCookieName,
  getSuperAdminSessionDays,
  signSuperAdminSession,
  verifySuperAdminToken,
  type SuperAdminSession,
} from './superadmin'

export function readSuperAdminSession(request: NextRequest): SuperAdminSession | null {
  const token = request.cookies.get(getSuperAdminCookieName())?.value
  if (!token) return null
  return verifySuperAdminToken(token)
}

export async function readSuperAdminSessionFromCookies(): Promise<SuperAdminSession | null> {
  const store = await cookies()
  const token = store.get(getSuperAdminCookieName())?.value
  if (!token) return null
  return verifySuperAdminToken(token)
}

export function setSuperAdminCookie(response: NextResponse, email: string): NextResponse {
  const token = signSuperAdminSession(email)
  const isProd = process.env.NODE_ENV === 'production'
  response.cookies.set({
    name: getSuperAdminCookieName(),
    value: token,
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    path: '/',
    maxAge: getSuperAdminSessionDays() * 24 * 60 * 60,
  })
  return response
}

export function clearSuperAdminCookie(response: NextResponse): NextResponse {
  response.cookies.set({
    name: getSuperAdminCookieName(),
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  })
  return response
}
