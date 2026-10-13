import { NextRequest, NextResponse } from 'next/server'
import { readSessionMeta, signSession, setSessionCookie } from '@/lib/session'
import { getSheets } from '@/lib/sheets'
import { countExpensesOfUser } from '@/lib/gastos-cuenta'

/**
 * Antigüedad máxima de la copia del contador que viaja en el token. Mientras la
 * sesión sea más reciente que esto NO se lee Google Sheets: la copia del token
 * es suficiente y cada carga de página cuesta 0 lecturas.
 *
 * Al vencer el plazo se hace UNA reconciliación controlada que relee el límite
 * y el consumo, y renueva la cookie. Consecuencia asumida: un cambio
 * administrativo puede tardar hasta 5 minutos en reflejarse si no hay
 * invalidación inmediata.
 */
const MAX_SESSION_AGE_S = 5 * 60

/**
 * Devuelve la sesión validada del servidor a partir de la cookie httpOnly (ADR-002).
 *
 * El contador de boletas es una COPIA TEMPORAL, nunca la base para incrementar
 * el consumo: eso lo hace el script bloqueado. Aquí solo se reconcilia.
 *
 * Si la lectura falla, se devuelve la copia del token como respaldo para no
 * dejar al usuario sin sesión; el contador queda desactualizado hasta la
 * próxima reconciliación exitosa.
 */
export async function GET(request: NextRequest) {
  const meta = readSessionMeta(request)
  if (!meta || !meta.session.activo) {
    return NextResponse.json({ user: null }, { status: 401 })
  }
  const { session } = meta

  const sessionAge = Math.floor(Date.now() / 1000) - meta.issuedAt
  const isFresh = sessionAge < MAX_SESSION_AGE_S

  // Sesión reciente: 0 lecturas a Google Sheets.
  if (isFresh) {
    return NextResponse.json({ user: session })
  }

  const configSheetId = process.env.GOOGLE_CONFIG_SHEET_ID
  if (!configSheetId) {
    return NextResponse.json({ user: session })
  }

  try {
    const sheets = await getSheets(true)
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: configSheetId,
      range: 'Usuarios!A2:J200',
    })
    const rows = response.data.values || []
    const row = rows.find(
      (r) => r[0]?.toLowerCase().trim() === session.email.toLowerCase().trim()
    )
    const limite = row ? Number(row[4]) : 0

    // El consumo se cuenta desde los gastos reales del usuario, no desde la
    // celda `Usuarios!F`, que es solo informativa. Los registros marcados como
    // `rechazado` por el bloqueo no cuentan.
    let usadas = session.boletas_usadas
    if (session.sheet_id_asociado) {
      try {
        usadas = await countExpensesOfUser(sheets, session.sheet_id_asociado, session.email)
      } catch (err) {
        console.warn('⚠️ /api/auth/me: no se pudo contar, se usa el valor de sesión:', err)
      }
    }

    const reconciled = {
      ...session,
      limite_boletas: limite > 0 ? limite : session.limite_boletas,
      boletas_usadas: usadas,
    }

    // Se renueva la cookie para que la próxima ventana de 5 minutos arranque
    // desde el valor reconciliado y no vuelva a leer.
    const response2 = NextResponse.json({ user: reconciled })
    setSessionCookie(response2, signSession(reconciled))
    return response2
  } catch (error) {
    console.error('❌ /api/auth/me: no se pudo leer desde Sheets:', error)
    return NextResponse.json({ user: session })
  }
}