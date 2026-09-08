import { NextRequest, NextResponse } from 'next/server'
import { getSheets } from '@/lib/sheets'
import { readSession } from '@/lib/session'
import { getRindeSpreadsheetId, ensureRindeStructure } from '@/lib/rinde-helpers'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const session = await readSession(request)
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const spreadsheetId = await getRindeSpreadsheetId(session)
    if (!spreadsheetId) {
      return NextResponse.json({ error: 'RindeNX no configurado' }, { status: 404 })
    }

    const sheets = await getSheets()

    const fondosRes = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Fondos!A2:I',
    })
    const rows = fondosRes.data.values || []
    const fondos = rows.map((row: any[]) => ({
      id: row[0] || '',
      usuario_email: row[1] || '',
      monto_asignado: parseFloat(row[2]) || 0,
      saldo: parseFloat(row[3]) || 0,
      observacion: row[4] || '',
      fecha_asignacion: row[5] || '',
      estado: row[6] || 'en_curso',
      asignado_por: row[7] || '',
      empresa: row[8] || '',
    }))

    const filtered = session.rol === 'admin'
      ? fondos
      : fondos.filter((f: any) => f.usuario_email === session.email)

    return NextResponse.json({ fondos: filtered, total: fondos.length })
  } catch (error) {
    console.error('❌ Error en GET /api/rinde/fondos:', error)
    return NextResponse.json(
      { error: 'Error al listar fondos', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await readSession(request)
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }
    if (session.rol !== 'admin') {
      return NextResponse.json({ error: 'Solo admin puede asignar fondos' }, { status: 403 })
    }

    const body = await request.json()
    const { usuario_email, monto_asignado, observacion } = body

    if (!usuario_email || !monto_asignado || !observacion) {
      return NextResponse.json({ error: 'usuario_email, monto_asignado y observacion son requeridos' }, { status: 400 })
    }
    if (monto_asignado <= 0) {
      return NextResponse.json({ error: 'El monto debe ser mayor a 0' }, { status: 400 })
    }

    const spreadsheetId = await getRindeSpreadsheetId(session)
    if (!spreadsheetId) {
      return NextResponse.json({ error: 'RindeNX no configurado' }, { status: 404 })
    }

    const sheets = await getSheets()
    await ensureRindeStructure(sheets, spreadsheetId)

    const id = `FND-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`
    const fechaAsignacion = new Date().toISOString()
    const newRow = [
      id,
      usuario_email.toLowerCase().trim(),
      String(monto_asignado),
      String(monto_asignado),
      observacion,
      fechaAsignacion,
      'en_curso',
      session.email,
      session.empresa_nombre || '',
    ]

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Fondos!A:I',
      valueInputOption: 'RAW',
      requestBody: { values: [newRow] },
    })

    return NextResponse.json({
      fondo: {
        id,
        usuario_email,
        monto_asignado,
        saldo: monto_asignado,
        observacion,
        fecha_asignacion: fechaAsignacion,
        estado: 'en_curso',
        asignado_por: session.email,
      },
    })
  } catch (error) {
    console.error('❌ Error en POST /api/rinde/fondos:', error)
    return NextResponse.json(
      { error: 'Error al asignar fondo', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    )
  }
}
