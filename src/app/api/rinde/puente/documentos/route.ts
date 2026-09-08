import { NextRequest, NextResponse } from 'next/server'
import { getSheets } from '@/lib/sheets'
import { readSession } from '@/lib/session'
import { getRindeSpreadsheetId } from '@/lib/rinde-helpers'

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

    const rendRes = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Rendiciones!A2:J',
    })
    const rendRows = rendRes.data.values || []
    const rendicionesMap: Record<string, any> = {}
    rendRows.forEach((row: any[]) => {
      rendicionesMap[row[0]] = {
        id: row[0],
        descripcion: row[5] || '',
        usuario_email: row[6] || '',
        estado: row[3] || '',
        fecha_creacion: row[1] || '',
        fecha_cierre: row[2] || '',
      }
    })

    const gastosRes = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'GastosRinde!A2:O',
    })
    const gastosRows = gastosRes.data.values || []
    const gastosMap: Record<string, any> = {}
    gastosRows.forEach((row: any[]) => {
      const id = row[0] || ''
      gastosMap[id] = {
        id,
        rendicion_id: row[1] || '',
        fecha: row[2] || '',
        rut: row[3] || '',
        proveedor: row[4] || '',
        monto: parseFloat(row[5]) || 0,
        categoria: row[6] || '',
        boleta_numero: row[7] || '',
        giro: row[8] || '',
        notas: row[9] || '',
        image_url: row[10] || '',
        creado_por: row[11] || '',
      }
    })

    const puenteRes = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Puente!A2:F',
    })
    const puenteRows = puenteRes.data.values || []

    const documentosPasados = puenteRows.map((row: any[]) => {
      const rindeGastoId = row[1] || ''
      const rendicionId = row[2] || ''
      const gasto = gastosMap[rindeGastoId]
      const rendicion = rendicionesMap[rendicionId]
      return {
        puente_id: row[0] || '',
        gasto: gasto || null,
        rendicion: rendicion || null,
        gastos_row_number: parseInt(row[3]) || 0,
        pasado_en: row[4] || '',
        aprobado_por: row[5] || '',
      }
    })

    const filtered = session.rol === 'admin'
      ? documentosPasados
      : documentosPasados.filter((d: any) => d.gasto?.creado_por === session.email)

    const totalPasado = filtered.reduce((sum: number, d: any) => sum + (d.gasto?.monto || 0), 0)

    return NextResponse.json({
      documentos: filtered,
      total: filtered.length,
      total_monto: totalPasado,
    })
  } catch (error) {
    console.error('❌ Error en GET /api/rinde/puente/documentos:', error)
    return NextResponse.json(
      { error: 'Error al listar documentos del puente', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    )
  }
}
