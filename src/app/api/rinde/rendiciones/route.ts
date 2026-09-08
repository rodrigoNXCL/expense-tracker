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
      return NextResponse.json({ error: 'RindeNX no configurado para esta empresa' }, { status: 404 })
    }

    const sheets = await getSheets()

    const rendicionesRes = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Rendiciones!A2:K',
    })
    const rows = rendicionesRes.data.values || []
    const rendiciones = rows.map((row: any[]) => ({
      id: row[0] || '',
      fecha_creacion: row[1] || '',
      fecha_cierre: row[2] || '',
      estado: row[3] || 'abierta',
      monto_total: parseFloat(row[4]) || 0,
      descripcion: row[5] || '',
      usuario_email: row[6] || '',
      aprobado_por: row[7] || '',
      comentarios: row[8] || '',
      asiento_id: row[9] || '',
      fondo_id: row[10] || '',
    }))

    const filtered = session.rol === 'admin'
      ? rendiciones
      : rendiciones.filter((r: any) => r.usuario_email === session.email)

    return NextResponse.json({ rendiciones: filtered, total: rendiciones.length })
  } catch (error) {
    console.error('❌ Error en GET /api/rinde/rendiciones:', error)
    return NextResponse.json(
      { error: 'Error al listar rendiciones', details: error instanceof Error ? error.message : 'Unknown' },
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

    const body = await request.json()
    const { descripcion, monto_estimado, fondo_id } = body

    if (!descripcion) {
      return NextResponse.json({ error: 'Descripción requerida' }, { status: 400 })
    }

    const spreadsheetId = await getRindeSpreadsheetId(session)
    if (!spreadsheetId) {
      return NextResponse.json({ error: 'RindeNX no configurado para esta empresa' }, { status: 404 })
    }

    const sheets = await getSheets()
    await ensureRindeStructure(sheets, spreadsheetId)

    // Validar fondo si se envía: debe existir y pertenecer al usuario (o ser admin)
    let fondoValido: any = null
    if (fondo_id) {
      const fondosRes = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: 'Fondos!A2:I',
      })
      const fondosRows = fondosRes.data.values || []
      fondoValido = fondosRows.find((row: any[]) => {
        const esDueño = session.rol === 'admin' || row[1] === session.email
        return row[0] === fondo_id && esDueño
      })
      if (!fondoValido) {
        return NextResponse.json({ error: 'Fondo no encontrado o no asignado a este usuario' }, { status: 400 })
      }
      if (String(fondoValido[6]).toLowerCase() === 'cerrado') {
        return NextResponse.json({ error: 'El fondo está cerrado' }, { status: 400 })
      }
    }

    const id = `RND-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`
    const fechaCreacion = new Date().toISOString()
    const newRow = [
      id,
      fechaCreacion,
      '',
      'abierta',
      String(monto_estimado || 0),
      descripcion,
      session.email,
      '',
      '',
      '',
      fondo_id || '',
    ]

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Rendiciones!A:K',
      valueInputOption: 'RAW',
      requestBody: { values: [newRow] },
    })

    return NextResponse.json({
      rendicion: {
        id,
        fecha_creacion: fechaCreacion,
        estado: 'abierta',
        descripcion,
        monto_total: monto_estimado || 0,
        usuario_email: session.email,
        fondo_id: fondo_id || '',
      },
    })
  } catch (error) {
    console.error('❌ Error en POST /api/rinde/rendiciones:', error)
    return NextResponse.json(
      { error: 'Error al crear rendición', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    )
  }
}
