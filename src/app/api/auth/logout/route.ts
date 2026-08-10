import { NextRequest, NextResponse } from 'next/server'
import { clearSessionCookie } from '@/lib/session'

// Logout: borra la cookie httpOnly de sesión
export async function POST(request: NextRequest) {
  const response = NextResponse.json({ ok: true })
  return clearSessionCookie(response)
}