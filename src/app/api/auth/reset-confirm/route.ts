import { NextRequest, NextResponse } from 'next/server'
import { getSheets } from '@/lib/sheets'
import { hashPassword } from '@/lib/password'
import { verifyResetToken } from '../reset-request/route'

/**
 * Paso 2 del autoservicio de recuperación (ADR-001).
 *
 * Valida el token firmado, exige una contraseña de mínimo 8 caracteres y
 * escribe el hash con sal en la fila del usuario. El token es de un solo uso
 * en la práctica: al cambiar el hash, el enlace queda obsoleto.
 */
export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json()

    const secret = process.env.AUTH_SECRET
    const spreadsheetId = process.env.GOOGLE_CONFIG_SHEET_ID
    if (!secret || !spreadsheetId) {
      return NextResponse.json({ error: 'Configuración del servidor incompleta' }, { status: 500 })
    }

    const valid = verifyResetToken(String(token || ''), secret)
    if (!valid) {
      return NextResponse.json(
        { error: 'El enlace venció o no es válido. Solicita uno nuevo.' },
        { status: 400 }
      )
    }

    if (typeof password !== 'string' || password.length < 8) {
      return NextResponse.json(
        { error: 'La contraseña debe tener al menos 8 caracteres.' },
        { status: 400 }
      )
    }

    const sheets = await getSheets()
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Usuarios!A2:B200',
    })
    const rows = res.data.values || []
    const index = rows.findIndex(
      (r) => r[0]?.toLowerCase().trim() === valid.email.toLowerCase().trim()
    )
    if (index === -1) {
      return NextResponse.json({ error: 'No se encontró la cuenta.' }, { status: 404 })
    }

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `Usuarios!B${index + 2}`,
      valueInputOption: 'RAW',
      requestBody: { values: [[hashPassword(password)]] },
    })

    console.log(`🔐 Reset: contraseña actualizada para ${valid.email}`)
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('❌ Reset confirm:', err)
    return NextResponse.json({ error: 'Error al actualizar la contraseña.' }, { status: 500 })
  }
}