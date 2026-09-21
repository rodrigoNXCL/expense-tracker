import { NextRequest, NextResponse } from 'next/server'
import { getSheets } from '@/lib/sheets'
import { readSession } from '@/lib/session'
import { getRindeSpreadsheetId } from '@/lib/rinde-helpers'

export const dynamic = 'force-dynamic'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await readSession(request)
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }
    if (session.rol !== 'admin') {
      return NextResponse.json({ error: 'Solo admin puede modificar fondos' }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()
    const { accion, monto_asignado, observacion } = body

    if (!['cerrar', 'reabrir', 'editar'].includes(accion)) {
      return NextResponse.json({ error: 'Acción inválida' }, { status: 400 })
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
    const rowIndex = rows.findIndex((row: any[]) => row[0] === id)
    if (rowIndex === -1) {
      return NextResponse.json({ error: 'Fondo no encontrado' }, { status: 404 })
    }

    const fondo = rows[rowIndex]
    const rowNumber = rowIndex + 2

    let updatedRow = [...fondo]
    if (accion === 'cerrar') {
      updatedRow[6] = 'cerrado'
    } else if (accion === 'reabrir') {
      updatedRow[6] = 'en_curso'
    } else if (accion === 'editar') {
      if (monto_asignado !== undefined) {
        const nuevoMonto = parseFloat(monto_asignado)
        if (nuevoMonto <= 0) {
          return NextResponse.json({ error: 'El monto debe ser mayor a 0' }, { status: 400 })
        }
        const montoOriginal = parseFloat(fondo[2]) || 0
        const saldoActual = parseFloat(fondo[3]) || 0
        const consumido = montoOriginal - saldoActual
        if (nuevoMonto < consumido) {
          return NextResponse.json(
            { error: `El nuevo monto no puede ser menor a lo ya consumido ($${consumido})` },
            { status: 400 }
          )
        }
        const diferencia = nuevoMonto - montoOriginal
        updatedRow[2] = String(nuevoMonto)
        updatedRow[3] = String(saldoActual + diferencia)
      }
      if (observacion !== undefined) {
        updatedRow[4] = observacion
      }
    }

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `Fondos!A${rowNumber}:I${rowNumber}`,
      valueInputOption: 'RAW',
      requestBody: { values: [updatedRow] },
    })

    return NextResponse.json({ success: true, mensaje: `Fondo ${accion}do correctamente` })
  } catch (error) {
    console.error('❌ Error en PATCH /api/rinde/fondos/[id]:', error)
    return NextResponse.json(
      { error: 'Error al modificar fondo', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await readSession(request)
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }
    if (session.rol !== 'admin') {
      return NextResponse.json({ error: 'Solo admin puede eliminar fondos' }, { status: 403 })
    }

    const { id } = await params
    const spreadsheetId = await getRindeSpreadsheetId(session)
    if (!spreadsheetId) {
      return NextResponse.json({ error: 'RindeNX no configurado' }, { status: 404 })
    }

    const sheets = await getSheets()

    const rendRes = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Rendiciones!A2:K',
    })
    const rendRows = rendRes.data.values || []
    const rendicionUsandoFondo = rendRows.find((row: any[]) => row[10] === id)
    if (rendicionUsandoFondo) {
      return NextResponse.json(
        { error: 'No se puede eliminar el fondo porque tiene rendiciones asociadas' },
        { status: 400 }
      )
    }

    const fondosRes = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Fondos!A2:I',
    })
    const rows = fondosRes.data.values || []
    const rowIndex = rows.findIndex((row: any[]) => row[0] === id)
    if (rowIndex === -1) {
      return NextResponse.json({ error: 'Fondo no encontrado' }, { status: 404 })
    }

    const rowNumber = rowIndex + 2
    const saldo = parseFloat(rows[rowIndex][3]) || 0
    const montoAsignado = parseFloat(rows[rowIndex][2]) || 0
    if (montoAsignado - saldo > 0) {
      return NextResponse.json(
        { error: `No se puede eliminar: el fondo tiene $${montoAsignado - saldo} consumido. Ciérrelo en lugar de eliminarlo.` },
        { status: 400 }
      )
    }

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `Fondos!A${rowNumber}:I${rowNumber}`,
      valueInputOption: 'RAW',
      requestBody: { values: [['', '', '', '', '', '', '', '', '']] },
    })

    return NextResponse.json({ success: true, mensaje: 'Fondo eliminado' })
  } catch (error) {
    console.error('❌ Error en DELETE /api/rinde/fondos/[id]:', error)
    return NextResponse.json(
      { error: 'Error al eliminar fondo', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    )
  }
}
