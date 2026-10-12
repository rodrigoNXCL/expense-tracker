import { NextRequest, NextResponse } from 'next/server'
import { getSheets } from '@/lib/sheets'
import { readSession } from '@/lib/session'
import { verifyPassword, hashPassword } from '@/lib/password'

/**
 * Cambio de contraseña por el propio usuario (con sesión iniciada).
 *
 * Complementa al autoservicio de recuperación (`/api/auth/reset-request`), que
 * cubre el caso "olvidé mi contraseña". Aquí el usuario ya está autenticado y
 * quiere rotar su clave sin depender de nadie.
 *
 * Exige:
 *  - sesión válida (cookie httpOnly, ADR-002);
 *  - la contraseña actual, para probar que la cuenta le pertenece;
 *  - una contraseña nueva de mínimo 8 caracteres, distinta de la actual.
 */
export async function POST(request: NextRequest) {
  try {
    const session = readSession(request)
    if (!session) {
      return NextResponse.json({ error: 'No has iniciado sesión.' }, { status: 401 })
    }

    const { currentPassword, newPassword } = await request.json()

    if (typeof currentPassword !== 'string' || !currentPassword) {
      return NextResponse.json({ error: 'Ingresa tu contraseña actual.' }, { status: 400 })
    }
    if (typeof newPassword !== 'string' || newPassword.length < 8) {
      return NextResponse.json(
        { error: 'La nueva contraseña debe tener al menos 8 caracteres.' },
        { status: 400 }
      )
    }
    if (currentPassword === newPassword) {
      return NextResponse.json(
        { error: 'La nueva contraseña debe ser distinta de la actual.' },
        { status: 400 }
      )
    }

    const spreadsheetId = process.env.GOOGLE_CONFIG_SHEET_ID
    if (!spreadsheetId) {
      return NextResponse.json({ error: 'Configuración del servidor incompleta' }, { status: 500 })
    }

    const sheets = await getSheets()
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Usuarios!A2:B200',
    })
    const rows = res.data.values || []
    const index = rows.findIndex(
      (r) => r[0]?.toLowerCase().trim() === session.email.toLowerCase().trim()
    )
    if (index === -1) {
      return NextResponse.json({ error: 'No se encontró tu cuenta.' }, { status: 404 })
    }

    if (!verifyPassword(currentPassword, rows[index][1])) {
      return NextResponse.json({ error: 'La contraseña actual no es correcta.' }, { status: 401 })
    }

    // Siempre se escribe con sal: este endpoint también completa la migración
    // de las cuentas que aún tenían SHA-256 sin sal.
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `Usuarios!B${index + 2}`,
      valueInputOption: 'RAW',
      requestBody: { values: [[hashPassword(newPassword)]] },
    })

    console.log(`🔐 Cambio de contraseña para ${session.email}`)
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('❌ Cambio de contraseña:', err)
    return NextResponse.json({ error: 'Error al cambiar la contraseña.' }, { status: 500 })
  }
}