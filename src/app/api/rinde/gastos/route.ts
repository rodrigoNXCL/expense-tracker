import { NextRequest, NextResponse } from 'next/server'
import { getSheets } from '@/lib/sheets'
import { readSession } from '@/lib/session'
import { uploadReceiptImage } from '@/lib/storage'
import { getRindeSpreadsheetId, ensureRindeStructure } from '@/lib/rinde-helpers'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const session = await readSession(request)
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const contentType = request.headers.get('content-type') || ''
    let body: Record<string, any>
    let imageFile: File | null = null

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData()
      imageFile = formData.get('image') as File | null
      body = JSON.parse((formData.get('data') as string) || '{}')
    } else {
      body = await request.json()
    }

    const {
      rendicion_id,
      fecha,
      rut,
      proveedor,
      monto,
      categoria,
      boleta_numero,
      giro,
      notas,
      image_url,
      ocr_confidence,
      tipo_documento = 'boleta',
    } = body

    if (!rendicion_id || !fecha || !proveedor || !monto) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 })
    }

    const tiposValidos = ['boleta', 'factura', 'voucher', 'sin_comprobante']
    if (!tiposValidos.includes(tipo_documento)) {
      return NextResponse.json({ error: 'tipo_documento inválido' }, { status: 400 })
    }

    const spreadsheetId = await getRindeSpreadsheetId(session)
    if (!spreadsheetId) {
      return NextResponse.json({ error: 'RindeNX no configurado' }, { status: 404 })
    }

    const sheets = await getSheets()
    await ensureRindeStructure(sheets, spreadsheetId)

    const rendRes = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Rendiciones!A2:K',
    })
    const rendRows = rendRes.data.values || []
    const rendRow = rendRows.find((row: any[]) => row[0] === rendicion_id)
    if (!rendRow) {
      return NextResponse.json({ error: 'Rendición no encontrada' }, { status: 404 })
    }
    const estadoRend = rendRow[3]
    // Solo el dueño de la rendición (o el admin) puede agregar gastos
    if (session.rol !== 'admin' && rendRow[6] !== session.email) {
      return NextResponse.json({ error: 'No tienes permisos sobre esta rendición' }, { status: 403 })
    }
    // Solo se agregan gastos mientras la rendición está abierta
    if (estadoRend !== 'abierta') {
      return NextResponse.json({
        error: `No se pueden agregar gastos: la rendición está ${
          estadoRend === 'terminada' ? 'terminada (espera revisión del admin)' : estadoRend
        }`,
      }, { status: 400 })
    }

    // Upload a Supabase (OPCIONAL - si falla, igual guarda el gasto)
    let finalImageUrl = image_url || ''
    if (imageFile && imageFile.size > 0) {
      try {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
        const uploaded = await uploadReceiptImage(imageFile, session.email, timestamp)
        if (uploaded) finalImageUrl = uploaded
      } catch (uploadError) {
        console.warn('⚠️ Error subiendo imagen, pero se guarda el gasto:', uploadError)
      }
    }

    const id = `GAS-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`
    const newRow = [
      id,
      rendicion_id,
      fecha,
      rut || '',
      proveedor,
      String(monto),
      categoria || '',
      boleta_numero || '',
      giro || '',
      notas || '',
      finalImageUrl,
      session.email,
      new Date().toISOString(),
      'FALSE',
      tipo_documento,
    ]

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'GastosRinde!A:O',
      valueInputOption: 'RAW',
      requestBody: { values: [newRow] },
    })

    const totalRes = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'GastosRinde!A2:O',
    })
    const totalGastos = (totalRes.data.values || [])
      .filter((row: any[]) => row[1] === rendicion_id)
      .reduce((sum: number, row: any[]) => sum + (parseFloat(row[5]) || 0), 0)
    const rendRowIndex = rendRows.findIndex((row: any[]) => row[0] === rendicion_id)
    const rowNumber = rendRowIndex + 2
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `Rendiciones!E${rowNumber}`,
      valueInputOption: 'RAW',
      requestBody: { values: [[String(totalGastos)]] },
    })

    return NextResponse.json({ success: true, id, total_rendicion: totalGastos })
  } catch (error) {
    console.error('❌ Error en POST /api/rinde/gastos:', error)
    return NextResponse.json(
      { error: 'Error al guardar gasto', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    )
  }
}
