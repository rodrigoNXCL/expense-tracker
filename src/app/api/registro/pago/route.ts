import { NextRequest, NextResponse } from 'next/server'
import { google } from 'googleapis'
import { hashPassword } from '@/lib/auth'

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets']

async function getSheetsClient() {
  try {
    const credentialsJson = process.env.GOOGLE_CREDENTIALS
    if (!credentialsJson) {
      console.error('❌ GOOGLE_CREDENTIALS no está configurado')
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
    console.log('📝 API Registro Pago: Recibiendo solicitud...')
    
    const body = await request.json()
    const { email, password, empresa_nombre, nombre_completo, telefono, plan } = body

    if (!email || !password || !empresa_nombre || !nombre_completo || !telefono || !plan) {
      console.error('❌ Faltan campos requeridos')
      return NextResponse.json(
        { error: 'Todos los campos son requeridos' },
        { status: 400 }
      )
    }

    const planesValidos = ['pro', 'enterprise']
    if (!planesValidos.includes(plan)) {
      console.error('❌ Plan inválido:', plan)
      return NextResponse.json(
        { error: 'Plan inválido' },
        { status: 400 }
      )
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i
    if (!emailRegex.test(email)) {
      console.error('❌ Email inválido:', email)
      return NextResponse.json(
        { error: 'Email inválido' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      console.error('❌ Contraseña muy corta')
      return NextResponse.json(
        { error: 'La contraseña debe tener al menos 6 caracteres' },
        { status: 400 }
      )
    }

    const sheets = await getSheetsClient()
    const spreadsheetId = process.env.GOOGLE_SHEET_ID_USERS

    if (!spreadsheetId) {
      console.error('❌ GOOGLE_SHEET_ID_USERS no está configurado')
      return NextResponse.json(
        { error: 'Configuración incompleta: falta GOOGLE_SHEET_ID_USERS' },
        { status: 500 }
      )
    }

    console.log('📄 Verificando email existente en sheet:', spreadsheetId)

    const existingEmailsResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Usuarios!A:A',
    })

    const emails = existingEmailsResponse.data.values?.flat() || []
    const emailExists = emails.some((e: any) => 
      String(e).toLowerCase().trim() === email.toLowerCase().trim()
    )
    
    if (emailExists) {
      console.error('❌ Email ya registrado:', email)
      return NextResponse.json(
        { error: 'El email ya está registrado' },
        { status: 409 }
      )
    }

    console.log('🔐 Hasheando contraseña...')
    const hashedPassword = await hashPassword(password)

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

    console.log('📝 Agregando fila a la sheet...')
    
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Usuarios!A:J',
      valueInputOption: 'RAW',
      requestBody: {
        values: [newRow],
      },
    })

    console.log(`✅ Usuario ${plan} registrado en sheet: ${email}`)

    // ✅ Enviar email al admin CON LA PASSWORD EN TEXTO PLANO
    console.log('📧 Enviando notificación por email al admin...')
    
    try {
      await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          access_key: process.env.NEXT_PUBLIC_WEB3FORMS_KEY,
          from_name: `GastosSII Registro - ${nombre_completo}`,
          replyto: email,
          email: 'gastos@nxchile.com',
          subject: `💳 Nuevo registro PAGO: ${plan.toUpperCase()} - ${empresa_nombre}`,
          message: `
            Nuevo registro de plan pago recibido:
            
            Nombre: ${nombre_completo}
            Email: ${email}
            Teléfono: ${telefono}
            Empresa: ${empresa_nombre}
            Plan: ${plan}
            Password: ${password}
            Fecha: ${new Date().toLocaleString('es-CL')}
            
            ⚠️ ACCIONES REQUERIDAS:
            1. Guarda esta password en un lugar seguro
            2. Contacta al cliente para coordinar pago
            3. Una vez confirmado el pago, aprueba al usuario (FALSE → TRUE)
            4. Asigna sheet_id_asociado
            5. Envía credenciales al usuario
          `,
          redirect: 'false',
        }),
      })
      console.log('✅ Email de notificación enviado a gastos@nxchile.com')
    } catch (emailError) {
      console.error('⚠️ Error enviando email (pero el usuario se registró):', emailError)
    }

    return NextResponse.json(
      { 
        message: 'Solicitud enviada exitosamente',
        email,
        empresa_nombre,
        plan
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('❌ ERROR EN API REGISTRO PAGO:', error instanceof Error ? error.message : error)
    console.error('Stack trace:', error instanceof Error ? error.stack : 'N/A')
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}