import { NextRequest, NextResponse } from 'next/server'
import { google } from 'googleapis'
import { createHash } from 'crypto'

// Hash con SHA256 (compatible con auth.ts del cliente)
function hashPassword(password: string): string {
  return createHash('sha256').update(password).digest('hex')
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔐 API Auth: Intentando login...')
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email y contraseña son requeridos' },
        { status: 400 }
      )
    }

    // Credenciales de Google
    const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
    const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n')
    const spreadsheetId = process.env.GOOGLE_CONFIG_SHEET_ID

    if (!serviceAccountEmail || !privateKey || !spreadsheetId) {
      console.error('❌ Faltan credenciales de Google en .env.local')
      return NextResponse.json(
        { error: 'Configuración del servidor incompleta' },
        { status: 500 }
      )
    }

    // Autenticar con Google
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: serviceAccountEmail,
        private_key: privateKey,
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    })

    const sheets = google.sheets({ version: 'v4', auth })

    // Leer hoja "Usuarios" en Config Maestro
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Usuarios!A2:J100',
    })

    const rows = response.data.values
    if (!rows || rows.length === 0) {
      return NextResponse.json(
        { error: 'No hay usuarios registrados' },
        { status: 404 }
      )
    }

    // Buscar usuario por email
    const passwordHash = hashPassword(password)
    const userRow = rows.find(row => {
      const [rowEmail, rowPassword] = row
      const emailMatch = rowEmail?.toLowerCase().trim() === email.toLowerCase().trim()
      const passwordMatch = rowPassword === passwordHash || rowPassword === password
      return emailMatch && passwordMatch
    })

    if (!userRow) {
      return NextResponse.json(
        { error: 'Email o contraseña incorrectos' },
        { status: 401 }
      )
    }

    // Parsear datos del usuario (columnas de la hoja Usuarios)
    const [
      userEmail,
      _, // password_hash (NO retornar)
      empresa_nombre,
      plan,
      limite_boletas,
      boletas_usadas,
      activo,
      rol,
      __, // creado_en
      sheet_id_asociado,
    ] = userRow

    // Verificar si está activo
    const activoStr = String(activo).toLowerCase().trim()
    const isActive =
      activo === true ||
      activo === 'true' ||
      activo === 'TRUE' ||
      activo === 1 ||
      activo === '1' ||
      activoStr === 'true' ||
      activoStr === 'verdadero' ||
      activoStr === 'yes' ||
      activoStr === 'si'

    console.log(`🔍 Debug activo: valor="${activo}", string="${activoStr}", resultado=${isActive}`)

    if (!isActive) {
      console.error(`❌ Usuario inactivo: email="${email}", activo="${activo}"`)
      return NextResponse.json(
        { error: 'Usuario inactivo. Contacta al administrador.' },
        { status: 403 }
      )
    }

    // Construir objeto de sesión (CON .trim() en todos los campos)
    const user = {
      email: String(userEmail).toLowerCase().trim(),
      empresa_nombre: String(empresa_nombre || '').trim(),
      plan: String(plan || 'base').trim(),
      limite_boletas: Number(limite_boletas) || 100,
      boletas_usadas: Number(boletas_usadas) || 0,
      activo: true,
      rol: String(rol || 'user').toLowerCase().trim(),  // ← IMPORTANTE: .trim() + toLowerCase()
      sheet_id_asociado: String(sheet_id_asociado || '').trim(),
    }

    console.log(`✅ Login exitoso: ${user.email} (rol: ${user.rol})`)

    return NextResponse.json({
      message: 'Login exitoso',
      user,
    })
  } catch (error) {
    console.error('❌ Error en login API:', error instanceof Error ? error.message : error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}