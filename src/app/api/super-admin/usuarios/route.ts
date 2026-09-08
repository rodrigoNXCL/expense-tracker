import { NextRequest, NextResponse } from 'next/server'
import { getSheets } from '@/lib/sheets'
import { readSuperAdminSession } from '@/lib/superadmin-cookies'

export async function GET(request: NextRequest) {
  try {
    const session = await readSuperAdminSession(request)
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get('search')?.toLowerCase() || ''
    const tipoUsuario = searchParams.get('tipo_usuario') || ''
    const plan = searchParams.get('plan') || ''
    const activo = searchParams.get('activo')

    const usersSheetId = process.env.GOOGLE_SHEET_ID_USERS
    if (!usersSheetId) {
      return NextResponse.json({ error: 'GOOGLE_SHEET_ID_USERS no configurado' }, { status: 500 })
    }

    const sheets = await getSheets()
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: usersSheetId,
      range: 'Usuarios!A2:K',
    })

    const rows = response.data.values || []
    const users = rows.map((row: any[]) => ({
      email: row[0] || '',
      password_hash: row[1] || '',
      empresa_nombre: row[2] || '',
      plan: row[3] || 'free',
      limite_boletas: parseInt(row[4]) || 10,
      boletas_usadas: parseInt(row[5]) || 0,
      activo: row[6] === 'true' || row[6] === 'TRUE',
      rol: row[7] || 'user',
      creado_en: row[8] || '',
      sheet_id_asociado: row[9] || '',
      tipo_usuario: row[10] || 'gastos',
    }))

    let filtered = users
    if (search) {
      filtered = filtered.filter(
        (u: any) =>
          u.email.toLowerCase().includes(search) ||
          u.empresa_nombre.toLowerCase().includes(search)
      )
    }
    if (tipoUsuario) {
      filtered = filtered.filter((u: any) => u.tipo_usuario === tipoUsuario)
    }
    if (plan) {
      filtered = filtered.filter((u: any) => u.plan === plan)
    }
    if (activo !== null && activo !== '') {
      const wantActivo = activo === 'true'
      filtered = filtered.filter((u: any) => u.activo === wantActivo)
    }

    return NextResponse.json({ users: filtered, total: users.length }, { status: 200 })
  } catch (error) {
    console.error('❌ Error en GET /api/super-admin/usuarios:', error)
    return NextResponse.json(
      { error: 'Error cargando usuarios', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await readSuperAdminSession(request)
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { email, password, empresa_nombre, plan, tipo_usuario, limite_boletas, activo = true, rol = 'user', sheet_id_asociado } = body

    if (!email || !password || !empresa_nombre) {
      return NextResponse.json({ error: 'Email, password y empresa son requeridos' }, { status: 400 })
    }

    const usersSheetId = process.env.GOOGLE_SHEET_ID_USERS
    if (!usersSheetId) {
      return NextResponse.json({ error: 'GOOGLE_SHEET_ID_USERS no configurado' }, { status: 500 })
    }

    const sheets = await getSheets()
    const existing = await sheets.spreadsheets.values.get({
      spreadsheetId: usersSheetId,
      range: 'Usuarios!A2:K',
    })
    const existingRows = existing.data.values || []
    const duplicate = existingRows.find((row: any[]) =>
      String(row[0] || '').toLowerCase().trim() === email.toLowerCase().trim()
    )
    if (duplicate) {
      return NextResponse.json({ error: 'Ya existe un usuario con ese email' }, { status: 409 })
    }

    const { createHash } = await import('crypto')
    const password_hash = createHash('sha256').update(password).digest('hex')

    const id = `USR-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`
    const newRow = [
      email.toLowerCase().trim(),
      password_hash,
      empresa_nombre.trim(),
      plan || 'free',
      String(limite_boletas || 10),
      '0',
      activo ? 'TRUE' : 'FALSE',
      rol,
      new Date().toISOString(),
      sheet_id_asociado || '',
      tipo_usuario || 'gastos',
    ]

    await sheets.spreadsheets.values.append({
      spreadsheetId: usersSheetId,
      range: 'Usuarios!A:K',
      valueInputOption: 'RAW',
      requestBody: { values: [newRow] },
    })

    return NextResponse.json({
      success: true,
      message: 'Usuario creado exitosamente',
      id,
      email,
    })
  } catch (error) {
    console.error('❌ Error en POST /api/super-admin/usuarios:', error)
    return NextResponse.json(
      { error: 'Error creando usuario', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await readSuperAdminSession(request)
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { email, empresa_nombre, plan, limite_boletas, activo, rol, tipo_usuario } = body

    if (!email) {
      return NextResponse.json({ error: 'Email requerido' }, { status: 400 })
    }

    const usersSheetId = process.env.GOOGLE_SHEET_ID_USERS
    if (!usersSheetId) {
      return NextResponse.json({ error: 'GOOGLE_SHEET_ID_USERS no configurado' }, { status: 500 })
    }

    const sheets = await getSheets()
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: usersSheetId,
      range: 'Usuarios!A2:K',
    })

    const rows = response.data.values || []
    const rowIndex = rows.findIndex((row: any[]) => row[0] === email)
    if (rowIndex === -1) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    const existing = rows[rowIndex]
    const updated = [
      email,
      existing[1] || '',
      empresa_nombre !== undefined ? empresa_nombre : (existing[2] || ''),
      plan !== undefined ? plan : (existing[3] || 'free'),
      limite_boletas !== undefined ? String(limite_boletas) : (existing[4] || '10'),
      existing[5] || '0',
      activo !== undefined ? String(activo) : existing[6],
      rol !== undefined ? rol : (existing[7] || 'user'),
      existing[8] || '',
      existing[9] || '',
      tipo_usuario !== undefined ? tipo_usuario : (existing[10] || 'gastos'),
    ]

    const range = `Usuarios!A${rowIndex + 2}:K${rowIndex + 2}`
    await sheets.spreadsheets.values.update({
      spreadsheetId: usersSheetId,
      range,
      valueInputOption: 'RAW',
      requestBody: { values: [updated] },
    })

    return NextResponse.json({ success: true, message: 'Usuario actualizado' }, { status: 200 })
  } catch (error) {
    console.error('❌ Error en PUT /api/super-admin/usuarios:', error)
    return NextResponse.json(
      { error: 'Error actualizando usuario', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    )
  }
}
