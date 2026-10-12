import { NextRequest, NextResponse } from 'next/server'
import { getSheets } from '@/lib/sheets'
import { verifyPassword, hashPassword, detectFormat } from '@/lib/password'
import {
  setSuperAdminCookie,
  clearSuperAdminCookie,
} from '@/lib/superadmin-cookies'

/**
 * Migración transparente (ADR-001) para super-admin: mismo criterio que
 * `/api/auth`. El fallo de escritura nunca impide el login.
 */
async function upgradeStoredHash(
  email: string,
  rowNumber: number,
  password: string
): Promise<void> {
  try {
    const spreadsheetId = process.env.GOOGLE_CONFIG_SHEET_ID
    if (!spreadsheetId) return
    const sheets = await getSheets()
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `Usuarios!B${rowNumber}`,
      valueInputOption: 'RAW',
      requestBody: { values: [[hashPassword(password)]] },
    })
    console.log(`🔐 API SuperAdmin: hash migrado a formato con sal para ${email} (fila ${rowNumber})`)
  } catch (err) {
    console.warn(`⚠️ API SuperAdmin: no se pudo migrar el hash de ${email}:`, err)
  }
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
    const index = rows.findIndex(row => {
      const [rowEmail, rowPassword] = row
      return rowEmail?.toLowerCase().trim() === emailNormalized && verifyPassword(password, rowPassword)
    })
    const userRow = index >= 0 ? rows[index] : undefined

    if (!userRow) {
      return NextResponse.json(
        { error: 'Email o contraseña incorrectos' },
        { status: 401 }
      )
    }

    // Migración transparente del formato histórico al formato con sal.
    if (detectFormat(userRow[1]) === 'legacy') {
      await upgradeStoredHash(emailNormalized, index + 2, password)
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
