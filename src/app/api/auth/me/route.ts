import { NextRequest, NextResponse } from 'next/server'
import { readSession } from '@/lib/session'

// Devuelve la sesión validada del servidor a partir de la cookie httpOnly (ADR-002)
export async function GET(request: NextRequest) {
  const session = readSession(request)
  if (!session || !session.activo) {
    return NextResponse.json({ user: null }, { status: 401 })
  }
  return NextResponse.json({ user: session })
}