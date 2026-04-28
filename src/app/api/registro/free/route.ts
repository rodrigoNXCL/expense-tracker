import { NextRequest, NextResponse } from 'next/server'
import { google } from 'googleapis'
import { hashPassword } from '@/lib/auth'

// Configurar Google Sheets
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets']

async function getSheetsClient() {
  try {
    const credentialsJson = process.env.GOOGLE_CREDENTIALS
    if (!credentialsJson) {
      throw new Error('GOOGLE_CREDENTIALS no está configurado')
    }

    const credentials = JSON.parse(credentialsJson)
    
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: SCOPES,
    })

    const sheets = google.sheets({ version: 'v4', auth })
    return sheets
  } catch (error) {
    console.error('❌ Error configurando Google Sheets:', error)
    throw error
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('📝 API Registro Free: Recibiendo solicitud...')
    
    const body = await request.json()
    const { email, password, empresa_nombre } = body

    // Validaciones básicas
    if (!email || !password || !empresa_nombre) {
      return NextResponse.json(
        { error: 'Email, contraseña y nombre de empresa son requeridos' },
        { status: 400 }
      )
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Email inválido' },
        { status: 400 }
      )
    }

    // Validar longitud de contraseña
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'La contraseña debe tener al menos 6 caracteres' },
        { status: 400 }
      )
    }

    const sheets = await getSheetsClient()
    const spreadsheetId = process.env.GOOGLE_SHEET_ID_USERS

    if (!spreadsheetId) {
      return NextResponse.json(
        { error: 'Configuración incompleta: falta GOOGLE_SHEET_ID_USERS' },
        { status: 500 }
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

    // Crear nueva fila con estado "pendiente"
    const newRow = [
      email,
      hashedPassword,
      empresa_nombre,
      'free', // plan
      10, // limite_boletas (plan free)
      0, // boletas_usadas
      'FALSE', // activo (pendiente de aprobación)
      'user', // rol
      new Date().toISOString(),
      '', // sheet_id_asociado (se asignará al aprobar)
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

    console.log(`✅ Solicitud Free registrada: ${email} - ${empresa_nombre}`)

    // TODO: Enviar email al admin para notificar nuevo registro
    // await sendEmailToAdmin({ email, empresa_nombre, plan: 'free' })

    return NextResponse.json(
      { 
        message: 'Solicitud enviada exitosamente',
        email,
        empresa_nombre,
        plan: 'free'
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('❌ Error en API Registro Free:', error instanceof Error ? error.message : error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}