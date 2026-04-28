import { NextRequest, NextResponse } from 'next/server'
import { google } from 'googleapis'
import { hashPassword, verifyPassword } from '@/lib/auth'

// ✅ CONFIGURACIÓN DE LÍMITES POR PLAN
const PLAN_LIMITS: Record<string, { boletas: number; usuarios: number }> = {
  'free': { boletas: 10, usuarios: 1 },
  'pro': { boletas: 500, usuarios: 3 },
  'enterprise': { boletas: 9999, usuarios: 10 },
}

// Jerarquía de planes (qué puede crear cada admin)
const PLAN_HIERARCHY: Record<string, number> = {
  'free': 1,
  'pro': 2,
  'enterprise': 3,
}

// Configurar Google Sheets
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets']

async function getSheetsClient() {
  try {
    const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS || '{}')
    
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: SCOPES,
    })

    const sheets = google.sheets({ version: 'v4', auth })
    return sheets
  } catch (error) {
    console.error('Error configurando Google Sheets:', error)
    throw new Error('Error de configuración de Google Sheets')
  }
}

// GET: Listar usuarios (SOLO de la empresa del admin)
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 GET /api/admin/users - Iniciando...')

    const sessionHeader = request.headers.get('x-session')
    if (!sessionHeader) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const session = JSON.parse(sessionHeader)
    if (!session.activo || session.rol !== 'admin') {
      return NextResponse.json({ error: 'No tienes permisos de administrador' }, { status: 403 })
    }

    const sheets = await getSheetsClient()
    const spreadsheetId = process.env.GOOGLE_SHEET_ID_USERS

    if (!spreadsheetId) {
      return NextResponse.json({ error: 'Configuración incompleta' }, { status: 500 })
    }

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Usuarios!A2:J',
    })

    const rows = response.data.values || []
    
    // ✅ FILTRAR: Solo usuarios de la misma empresa
    const adminEmpresa = session.empresa_nombre
    const filteredRows = rows.filter(row => row[2] === adminEmpresa)
    
    console.log(`✅ ${filteredRows.length} usuarios encontrados para ${adminEmpresa}`)
    
    const users = filteredRows.map(row => ({
      email: row[0] || '',
      password: row[1] || '',
      empresa_nombre: row[2] || '',
      plan: row[3] || 'free',
      limite_boletas: parseInt(row[4]) || 10,
      boletas_usadas: parseInt(row[5]) || 0,
      activo: row[6] === 'true' || row[6] === 'TRUE',
      rol: row[7] || 'user',
      creado_en: row[8] || '',
      sheet_id_asociado: row[9] || '',
    }))

    return NextResponse.json({ users }, { status: 200 })
  } catch (error) {
    console.error('❌ Error en GET /api/admin/users:', error)
    return NextResponse.json(
      { error: 'Error cargando usuarios', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    )
  }
}

// POST: Crear nuevo usuario
export async function POST(request: NextRequest) {
  try {
    console.log('📝 POST /api/admin/users - Creando usuario...')

    const sessionHeader = request.headers.get('x-session')
    if (!sessionHeader) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const session = JSON.parse(sessionHeader)
    if (!session.activo || session.rol !== 'admin') {
      return NextResponse.json({ error: 'No tienes permisos de administrador' }, { status: 403 })
    }

    const body = await request.json()
    const { email, password, empresa_nombre, plan, limite_boletas, activo = true } = body

    // Validaciones básicas
    if (!email || !password || !empresa_nombre) {
      return NextResponse.json(
        { error: 'Email, contraseña y nombre de empresa son requeridos' },
        { status: 400 }
      )
    }

    // Validar jerarquía de planes
    const adminPlanLevel = PLAN_HIERARCHY[session.plan] || 1
    const newUserPlanLevel = PLAN_HIERARCHY[plan] || 1
    
    if (newUserPlanLevel > adminPlanLevel) {
      return NextResponse.json(
        { error: `No tienes permisos para crear usuarios con plan ${plan}. Tu plan es ${session.plan}.` },
        { status: 403 }
      )
    }

    const sheets = await getSheetsClient()
    const spreadsheetId = process.env.GOOGLE_SHEET_ID_USERS

    if (!spreadsheetId) {
      return NextResponse.json({ error: 'Configuración incompleta' }, { status: 500 })
    }

    // ✅ Obtener sheet_id_asociado del admin (para asignar al nuevo usuario)
    const adminSheetId = session.sheet_id_asociado
    if (!adminSheetId) {
      return NextResponse.json(
        { error: 'Admin no tiene sheet_id_asociado configurado' },
        { status: 400 }
      )
    }

    // Obtener todos los usuarios de la misma empresa
    const existingUsersResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Usuarios!C:C',
    })

    const companyNames = existingUsersResponse.data.values?.flat() || []
    const usersFromSameCompany = companyNames.filter(name => name === session.empresa_nombre).length

    const adminPlanLimits = PLAN_LIMITS[session.plan] || PLAN_LIMITS['free']
    
    if (usersFromSameCompany >= adminPlanLimits.usuarios) {
      return NextResponse.json(
        { error: `Tu plan ${session.plan} permite máximo ${adminPlanLimits.usuarios} usuario(s). Ya tienes ${usersFromSameCompany}.` },
        { status: 403 }
      )
    }

    // Verificar si el email ya existe
    const existingEmailsResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Usuarios!A:A',
    })

    const emails = existingEmailsResponse.data.values?.flat() || []
    if (emails.includes(email)) {
      return NextResponse.json(
        { error: 'El email ya está registrado' },
        { status: 409 }
      )
    }

    // Hash de contraseña
    const hashedPassword = await hashPassword(password)

    // Determinar límite de boletas según plan
    const planLimits = PLAN_LIMITS[plan] || PLAN_LIMITS['free']
    const finalLimiteBoletas = limite_boletas || planLimits.boletas

    // ✅ Crear nueva fila CON sheet_id_asociado
    const newRow = [
      email,
      hashedPassword,
      empresa_nombre,
      plan || 'free',
      finalLimiteBoletas,
      0, // boletas_usadas inicia en 0
      activo ? 'TRUE' : 'FALSE',
      'user', // rol por defecto
      new Date().toISOString(),
      adminSheetId, // ✅ sheet_id_asociado del admin
    ]

    // Agregar a la sheet
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Usuarios!A:J',
      valueInputOption: 'RAW',
      requestBody: {
        values: [newRow],
      },
    })

    console.log(`✅ Usuario ${email} creado exitosamente con sheet_id: ${adminSheetId}`)

    return NextResponse.json(
      { message: 'Usuario creado exitosamente', email },
      { status: 201 }
    )
  } catch (error) {
    console.error('❌ Error en POST /api/admin/users:', error)
    return NextResponse.json(
      { error: 'Error creando usuario', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    )
  }
}

// PUT: Actualizar usuario
export async function PUT(request: NextRequest) {
  try {
    const sessionHeader = request.headers.get('x-session')
    if (!sessionHeader) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const session = JSON.parse(sessionHeader)
    if (!session.activo || session.rol !== 'admin') {
      return NextResponse.json({ error: 'No tienes permisos de administrador' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

    if (!email) {
      return NextResponse.json(
        { error: 'Email es requerido' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const updates = body

    const sheets = await getSheetsClient()
    const spreadsheetId = process.env.GOOGLE_SHEET_ID_USERS

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Usuarios!A:J',
    })

    const rows = response.data.values || []
    const rowIndex = rows.findIndex(row => row[0] === email)

    if (rowIndex === -1) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    const rowNumber = rowIndex + 2
    const currentRow = rows[rowIndex]

    const updatedRow = [
      currentRow[0] || email,
      currentRow[1] || '',
      updates.empresa_nombre || currentRow[2] || '',
      updates.plan || currentRow[3] || 'free',
      updates.limite_boletas || currentRow[4] || 10,
      updates.boletas_usadas !== undefined ? updates.boletas_usadas : (currentRow[5] || 0),
      updates.activo !== undefined ? (updates.activo ? 'TRUE' : 'FALSE') : (currentRow[6] || 'TRUE'),
      currentRow[7] || 'user',
      currentRow[8] || '',
      currentRow[9] || '',
    ]

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `Usuarios!A${rowNumber}:J${rowNumber}`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [updatedRow],
      },
    })

    return NextResponse.json(
      { message: 'Usuario actualizado exitosamente' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error actualizando usuario:', error)
    return NextResponse.json(
      { error: 'Error actualizando usuario' },
      { status: 500 }
    )
  }
}

// DELETE: Eliminar usuario
export async function DELETE(request: NextRequest) {
  try {
    const sessionHeader = request.headers.get('x-session')
    if (!sessionHeader) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const session = JSON.parse(sessionHeader)
    if (!session.activo || session.rol !== 'admin') {
      return NextResponse.json({ error: 'No tienes permisos de administrador' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

    if (!email) {
      return NextResponse.json(
        { error: 'Email es requerido' },
        { status: 400 }
      )
    }

    const sheets = await getSheetsClient()
    const spreadsheetId = process.env.GOOGLE_SHEET_ID_USERS

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Usuarios!A:J',
    })

    const rows = response.data.values || []
    const rowIndex = rows.findIndex(row => row[0] === email)

    if (rowIndex === -1) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    const rowNumber = rowIndex + 2

    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [
          {
            deleteDimension: {
              range: {
                sheetId: 0,
                dimension: 'ROWS',
                startIndex: rowNumber - 1,
                endIndex: rowNumber,
              },
            },
          },
        ],
      },
    })

    return NextResponse.json(
      { message: 'Usuario eliminado exitosamente' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error eliminando usuario:', error)
    return NextResponse.json(
      { error: 'Error eliminando usuario' },
      { status: 500 }
    )
  }
}