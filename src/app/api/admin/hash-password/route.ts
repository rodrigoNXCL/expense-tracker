import { NextRequest, NextResponse } from 'next/server'
import { readSession } from '@/lib/session'
import { hashPassword } from '@/lib/password'

/**
 * Genera un hash de contraseña con el MISMO formato que usa el login.
 *
 * El generador living en `/admin/generador-hash` es cliente y antes producía
 * `sha256:<salt>:<hash>` con un salt de `Math.random()` (predecible) y sin
 * guarantee de que el login lo aceptara. Delegar aquí garantiza una sola
 * implementación (ADR-001).
 *
 * Protegido: requiere sesión de admin activa.
 */
export async function POST(request: NextRequest) {
  try {
    const session = readSession(request)
    if (!session || !session.activo || (session.rol !== 'admin' && session.rol !== 'superadmin')) {
      return NextResponse.json(
        { error: 'No tienes permisos de administrador' },
        { status: 403 }
      )
    }

    const { password } = await request.json()
    if (typeof password !== 'string' || password.length < 6) {
      return NextResponse.json(
        { error: 'La contraseña debe tener al menos 6 caracteres' },
        { status: 400 }
      )
    }

    return NextResponse.json({ hash: hashPassword(password) })
  } catch {
    return NextResponse.json({ error: 'Error generando el hash' }, { status: 500 })
  }
}