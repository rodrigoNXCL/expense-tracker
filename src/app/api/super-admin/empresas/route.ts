import { NextRequest, NextResponse } from 'next/server'
import { getSheets } from '@/lib/sheets'
import { readSuperAdminSession } from '@/lib/superadmin-cookies'

interface Empresa {
  email: string
  sheetId: string
  empresaNombre: string
  subdomain: string
  activo: boolean
}

const CONFIG_SHEET_HEADERS = [
  'email',
  'sheetId',
  'empresaNombre',
  'subdomain',
  'activo',
]

function validarEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function validarSubdomain(subdomain: string): boolean {
  return /^[a-z0-9-]{1,50}$/.test(subdomain)
}

function validarSheetId(sheetId: string): boolean {
  return /^[a-zA-Z0-9_-]{20,100}$/.test(sheetId)
}

async function ensureHeaders(sheets: any, spreadsheetId: string) {
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Config!A1:E1',
  })
  const existing = response.data.values?.[0] || []
  if (existing.length === 0) {
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: 'Config!A1:E1',
      valueInputOption: 'RAW',
      requestBody: { values: [CONFIG_SHEET_HEADERS] },
    })
  }
}

export async function GET() {
  try {
    const spreadsheetId = process.env.GOOGLE_CONFIG_SHEET_ID
    if (!spreadsheetId) {
      return NextResponse.json({ error: 'GOOGLE_CONFIG_SHEET_ID no configurado' }, { status: 500 })
    }

    const sheets = await getSheets(true)
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Config!A2:E',
    })

    const rows = response.data.values || []
    const empresas: Empresa[] = rows
      .filter(row => row[0] && row[1] && row[2])
      .map(row => ({
        email: String(row[0] || '').trim(),
        sheetId: String(row[1] || '').trim(),
        empresaNombre: String(row[2] || '').trim(),
        subdomain: String(row[3] || '').trim(),
        activo: String(row[4] || '').toUpperCase().trim() === 'TRUE',
      }))

    return NextResponse.json({ empresas, total: empresas.length })
  } catch (error) {
    console.error('❌ Error en GET /api/super-admin/empresas:', error)
    return NextResponse.json(
      { error: 'Error al listar empresas', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = readSuperAdminSession(request)
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { email, sheetId, empresaNombre, subdomain, activo = true } = body

    if (!email || !sheetId || !empresaNombre || !subdomain) {
      return NextResponse.json(
        { error: 'Todos los campos son requeridos' },
        { status: 400 }
      )
    }

    if (!validarEmail(email)) {
      return NextResponse.json({ error: 'Email inválido' }, { status: 400 })
    }
    if (!validarSubdomain(subdomain)) {
      return NextResponse.json(
        { error: 'Subdominio inválido (solo minúsculas, números y guiones, máx 50 chars)' },
        { status: 400 }
      )
    }
    if (!validarSheetId(sheetId)) {
      return NextResponse.json({ error: 'Sheet ID inválido' }, { status: 400 })
    }

    const spreadsheetId = process.env.GOOGLE_CONFIG_SHEET_ID
    if (!spreadsheetId) {
      return NextResponse.json({ error: 'GOOGLE_CONFIG_SHEET_ID no configurado' }, { status: 500 })
    }

    const sheets = await getSheets()
    await ensureHeaders(sheets, spreadsheetId)

    const existing = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Config!A2:E',
    })
    const existingRows = existing.data.values || []
    const duplicate = existingRows.find(row =>
      String(row[0] || '').toLowerCase().trim() === email.toLowerCase().trim() ||
      String(row[3] || '').toLowerCase().trim() === subdomain.toLowerCase().trim()
    )
    if (duplicate) {
      return NextResponse.json(
        { error: 'Ya existe una empresa con ese email o subdominio' },
        { status: 409 }
      )
    }

    const newRow = [
      email.toLowerCase().trim(),
      sheetId.trim(),
      empresaNombre.trim(),
      subdomain.toLowerCase().trim(),
      activo ? 'TRUE' : 'FALSE',
    ]

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Config!A:E',
      valueInputOption: 'RAW',
      requestBody: { values: [newRow] },
    })

    return NextResponse.json(
      { message: 'Empresa creada exitosamente', empresa: { email, sheetId, empresaNombre, subdomain, activo } },
      { status: 201 }
    )
  } catch (error) {
    console.error('❌ Error en POST /api/super-admin/empresas:', error)
    return NextResponse.json(
      { error: 'Error al crear empresa', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    )
  }
}
