import { NextRequest, NextResponse } from 'next/server'
import { getSheets } from '@/lib/sheets'
import { readSuperAdminSession } from '@/lib/superadmin-cookies'

function validarEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function validarSubdomain(subdomain: string): boolean {
  return /^[a-z0-9-]{1,50}$/.test(subdomain)
}

function validarSheetId(sheetId: string): boolean {
  return /^[a-zA-Z0-9_-]{20,100}$/.test(sheetId)
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = readSuperAdminSession(request)
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { id } = await params
    const targetEmail = decodeURIComponent(id).toLowerCase().trim()

    const body = await request.json()
    const { email, sheetId, empresaNombre, subdomain, activo } = body

    if (email && !validarEmail(email)) {
      return NextResponse.json({ error: 'Email inválido' }, { status: 400 })
    }
    if (subdomain && !validarSubdomain(subdomain)) {
      return NextResponse.json({ error: 'Subdominio inválido' }, { status: 400 })
    }
    if (sheetId && !validarSheetId(sheetId)) {
      return NextResponse.json({ error: 'Sheet ID inválido' }, { status: 400 })
    }

    const spreadsheetId = process.env.GOOGLE_CONFIG_SHEET_ID
    if (!spreadsheetId) {
      return NextResponse.json({ error: 'GOOGLE_CONFIG_SHEET_ID no configurado' }, { status: 500 })
    }

    const sheets = await getSheets()
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Config!A2:E',
    })

    const rows = response.data.values || []
    const rowIndex = rows.findIndex(row =>
      String(row[0] || '').toLowerCase().trim() === targetEmail
    )

    if (rowIndex === -1) {
      return NextResponse.json({ error: 'Empresa no encontrada' }, { status: 404 })
    }

    const currentRow = rows[rowIndex]
    const updatedRow = [
      (email ?? currentRow[0]).toLowerCase().trim(),
      (sheetId ?? currentRow[1]).trim(),
      (empresaNombre ?? currentRow[2]).trim(),
      (subdomain ?? currentRow[3]).toLowerCase().trim(),
      activo !== undefined ? (activo ? 'TRUE' : 'FALSE') : (currentRow[4] || 'TRUE'),
    ]

    const rowNumber = rowIndex + 2
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `Config!A${rowNumber}:E${rowNumber}`,
      valueInputOption: 'RAW',
      requestBody: { values: [updatedRow] },
    })

    return NextResponse.json({
      message: 'Empresa actualizada exitosamente',
      empresa: {
        email: updatedRow[0],
        sheetId: updatedRow[1],
        empresaNombre: updatedRow[2],
        subdomain: updatedRow[3],
        activo: updatedRow[4] === 'TRUE',
      },
    })
  } catch (error) {
    console.error('❌ Error en PUT /api/super-admin/empresas/[id]:', error)
    return NextResponse.json(
      { error: 'Error al actualizar empresa', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = readSuperAdminSession(request)
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { id } = await params
    const targetEmail = decodeURIComponent(id).toLowerCase().trim()

    const spreadsheetId = process.env.GOOGLE_CONFIG_SHEET_ID
    if (!spreadsheetId) {
      return NextResponse.json({ error: 'GOOGLE_CONFIG_SHEET_ID no configurado' }, { status: 500 })
    }

    const sheets = await getSheets()
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Config!A2:E',
    })

    const rows = response.data.values || []
    const rowIndex = rows.findIndex(row =>
      String(row[0] || '').toLowerCase().trim() === targetEmail
    )

    if (rowIndex === -1) {
      return NextResponse.json({ error: 'Empresa no encontrada' }, { status: 404 })
    }

    const currentRow = rows[rowIndex]
    const rowNumber = rowIndex + 2
    const updatedRow = [
      currentRow[0],
      currentRow[1],
      currentRow[2],
      currentRow[3],
      'FALSE',
    ]

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `Config!A${rowNumber}:E${rowNumber}`,
      valueInputOption: 'RAW',
      requestBody: { values: [updatedRow] },
    })

    return NextResponse.json({ message: 'Empresa desactivada exitosamente' })
  } catch (error) {
    console.error('❌ Error en DELETE /api/super-admin/empresas/[id]:', error)
    return NextResponse.json(
      { error: 'Error al desactivar empresa', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    )
  }
}
