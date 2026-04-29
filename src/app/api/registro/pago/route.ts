import { NextRequest, NextResponse } from 'next/server'
import { google } from 'googleapis'
import { hashPassword } from '@/lib/auth'

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets']

async function getSheetsClient() {
  try {
    const credentialsJson = process.env.GOOGLE_CREDENTIALS
    if (!credentialsJson) throw new Error('GOOGLE_CREDENTIALS no está configurado')
    const credentials = JSON.parse(credentialsJson)
    const auth = new google.auth.GoogleAuth({ credentials, scopes: SCOPES })
    return google.sheets({ version: 'v4', auth })
  } catch (error) {
    console.error('❌ Error configurando Google Sheets:', error)
    throw error
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, empresa_nombre, nombre_completo, telefono, plan } = body

    if (!email || !password || !empresa_nombre || !nombre_completo || !telefono || !plan) {
      return NextResponse.json({ error: 'Todos los campos son requeridos' }, { status: 400 })
    }

    const planesValidos = ['pro', 'enterprise']
    if (!planesValidos.includes(plan)) {
      return NextResponse.json({ error: 'Plan inválido' }, { status: 400 })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Email inválido' }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'La contraseña debe tener al menos 6 caracteres' }, { status: 400 })
    }

    const sheets = await getSheetsClient()
    const spreadsheetId = process.env.GOOGLE_SHEET_ID_USERS

    if (!spreadsheetId) {
      return NextResponse.json({ error: 'Configuración incompleta: falta GOOGLE_SHEET_ID_USERS' }, { status: 500 })
    }

    const existingEmailsResponse = await sheets.spreadsheets.values.get({ spreadsheetId, range: 'Usuarios!A:A' })
    const emails = existingEmailsResponse.data.values?.flat() || []
    const emailExists = emails.some((e: any) => String(e).toLowerCase().trim() === email.toLowerCase().trim())
    
    if (emailExists) {
      return NextResponse.json({ error: 'El email ya está registrado' }, { status: 409 })
    }

    const hashedPassword = await hashPassword(password)

    // ✅ LÍMITES ACTUALIZADOS: Pro=2 usuarios, Enterprise=5 usuarios
    const planLimits = {
      pro: { limite_boletas: 500, usuarios: 2 },
      enterprise: { limite_boletas: 9999, usuarios: 5 },
    }

    const limits = planLimits[plan as 'pro' | 'enterprise']

    const newRow = [
      email.toLowerCase().trim(),
      hashedPassword,
      empresa_nombre,
      plan,
      limits.limite_boletas,
      0,
      'FALSE',
      'user',
      new Date().toISOString(),
      '',
    ]

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Usuarios!A:J',
      valueInputOption: 'RAW',
      requestBody: { values: [newRow] },
    })

    console.log(`✅ Solicitud ${plan} registrada: ${email} - ${empresa_nombre}`)

    return NextResponse.json({ message: 'Solicitud enviada exitosamente', email, empresa_nombre, plan }, { status: 201 })
  } catch (error) {
    console.error('❌ Error en API Registro Pago:', error instanceof Error ? error.message : error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}