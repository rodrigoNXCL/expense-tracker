import { NextRequest, NextResponse } from 'next/server'
import { createHash } from 'crypto'
import { getSheets } from '@/lib/sheets'
import {
  setSuperAdminCookie,
  clearSuperAdminCookie,
} from '@/lib/superadmin-cookies'

function hashPassword(password: string): string {
  return createHash('sha256').update(password).digest('hex')
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, action } = body

    if (action === 'logout') {
      const logoutResponse = NextResponse.json({ message: 'Logout exitoso' })
      return clearSuperAdminCookie(logoutResponse)
    }

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email y contraseña son requeridos' },
        { status: 400 }
      )
    }

    const emailNormalized = email.toLowerCase().trim()

    const spreadsheetId = process.env.GOOGLE_CONFIG_SHEET_ID
    if (!spreadsheetId) {
      return NextResponse.json(
        { error: 'Configuración del servidor incompleta' },
        { status: 500 }
      )
    }

    const sheets = await getSheets(true)
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Usuarios!A2:J100',
    })

    const rows = response.data.values || []
    const passwordHash = hashPassword(password)
    const userRow = rows.find(row => {
      const [rowEmail, rowPassword] = row
      return (
        rowEmail?.toLowerCase().trim() === emailNormalized &&
        (rowPassword === passwordHash || rowPassword === password)
      )
    })

    if (!userRow) {
      return NextResponse.json(
        { error: 'Email o contraseña incorrectos' },
        { status: 401 }
      )
    }

    const rol = String(userRow[7] || '').toLowerCase().trim()
    if (rol !== 'superadmin') {
      return NextResponse.json(
        { error: 'Este usuario no tiene permisos de super admin' },
        { status: 403 }
      )
    }

    const activo = String(userRow[6] || '').toLowerCase().trim()
    const isActive =
      activo === 'true' || activo === 'verdadero' || activo === 'yes' || activo === 'si'
    if (!isActive) {
      return NextResponse.json(
        { error: 'Usuario inactivo' },
        { status: 403 }
      )
    }

    const session = {
      email: emailNormalized,
      empresa_nombre: String(userRow[2] || '').trim(),
      exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60,
    }

    const successResponse = NextResponse.json({
      message: 'Login exitoso',
      session,
    })
    return setSuperAdminCookie(successResponse, emailNormalized)
  } catch (error) {
    console.error('❌ Error en /api/super-admin/auth:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  const { readSuperAdminSession } = await import('@/lib/superadmin-cookies')
  const session = readSuperAdminSession(request)
  if (!session) {
    return NextResponse.json({ authenticated: false }, { status: 401 })
  }
  return NextResponse.json({ authenticated: true, session })
}
