import { NextRequest, NextResponse } from 'next/server'
import { readSession } from '@/lib/session'
import { getSheets } from '@/lib/sheets'

/**
 * Devuelve la sesión validada del servidor a partir de la cookie httpOnly (ADR-002).
 *
 * El contador de boletas se rehidrata desde Google Sheets, que es la fuente de
 * verdad. Antes se devolvía tal cual venía en el JWT, congelado al iniciar
 * sesión: por eso recargar la página o abrirla en otro dispositivo mostraba
 * siempre el valor de ese momento y los "disponibles" no se actualizaban.
 *
 * Si la lectura falla, se devuelve la sesión del JWT como respaldo para no
 * dejar al usuario sin sesión; el contador quedará desactualizado solo hasta
 * la próxima carga exitosa.
 */
export async function GET(request: NextRequest) {
  const session = readSession(request)
  if (!session || !session.activo) {
    return NextResponse.json({ user: null }, { status: 401 })
  }

  const spreadsheetId = process.env.GOOGLE_CONFIG_SHEET_ID
  if (!spreadsheetId) {
    return NextResponse.json({ user: session })
  }

  try {
    const sheets = await getSheets(true)
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Usuarios!A2:J200',
    })
    const rows = response.data.values || []
    const row = rows.find((r) => r[0]?.toLowerCase().trim() === session.email.toLowerCase().trim())

    if (!row) {
      return NextResponse.json({ user: session })
    }

    const limite = Number(row[4])
    const usadas = Number(row[5])

    return NextResponse.json({
      user: {
        ...session,
        limite_boletas: limite > 0 ? limite : session.limite_boletas,
        boletas_usadas: Number.isFinite(usadas) ? usadas : session.boletas_usadas,
      },
    })
  } catch (error) {
    console.error('❌ /api/auth/me: no se pudo leer el contador desde Sheets:', error)
    return NextResponse.json({ user: session })
  }
}