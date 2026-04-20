import { NextRequest, NextResponse } from 'next/server'
import { google } from 'googleapis'
import { getCompanyConfig } from '@/lib/companyConfig'

export interface SaveExpenseRequest {
  subdomain: string
  email: string
  fecha: string
  rut: string
  proveedor: string
  monto: number
  categoria: string
  boleta_numero: string
  giro: string
  notas: string
  ocr_confidence: number
}

/**
 * POST /api/save-expense
 * 
 * Guarda un gasto en el Sheet de la empresa correspondiente
 * 
 * Body requerido:
 * - subdomain: Identificador de la empresa (ej: 'nxchile')
 * - email: Email del usuario que registra
 * - fecha: Fecha del gasto (YYYY-MM-DD)
 * - monto: Monto total (número)
 * - proveedor: Nombre del proveedor
 * - categoria: Categoría del gasto
 * 
 * Body opcional:
 * - rut, boleta_numero, giro, notas, ocr_confidence
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Parsear y validar body
    const body = await request.json()
    
    const requiredFields = ['subdomain', 'email', 'fecha', 'monto', 'proveedor', 'categoria']
    const missingFields = requiredFields.filter(field => !body[field])
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { 
          error: 'Campos requeridos faltantes',
          missing: missingFields 
        },
        { status: 400 }
      )
    }

    // 2. Validar monto positivo
    if (typeof body.monto !== 'number' || body.monto <= 0) {
      return NextResponse.json(
        { error: 'El monto debe ser un número positivo' },
        { status: 400 }
      )
    }

    // 3. Obtener configuración de la empresa
    const companyConfig = await getCompanyConfig(body.subdomain)
    
    if (!companyConfig) {
      return NextResponse.json(
        { error: `Empresa no encontrada: ${body.subdomain}` },
        { status: 404 }
      )
    }

    // 4. Preparar fila de datos (orden de columnas del Sheet de Gastos)
    const timestamp = new Date().toISOString()
    const row = [
      timestamp,                    // A: timestamp
      body.fecha,                   // B: fecha
      body.rut || '',               // C: rut
      body.proveedor,               // D: proveedor
      body.monto,                   // E: monto
      body.categoria,               // F: categoria
      body.boleta_numero || '',     // G: boleta_numero
      body.giro || '',              // H: giro
      body.notas || '',             // I: notas
      body.ocr_confidence || 0,     // J: ocr_confidence
      body.email,                   // K: creado_por
    ]

    // 5. Autenticar y escribir en Google Sheets
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    })

    const sheets = google.sheets({ version: 'v4', auth })

    await sheets.spreadsheets.values.append({
      spreadsheetId: companyConfig.sheetId,
      range: 'Gastos!A:K',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [row],
      },
    })

    // 6. Retornar éxito
    return NextResponse.json({
      success: true,
      message: 'Gasto guardado exitosamente',
      data: {
        timestamp,
        empresa: companyConfig.empresaNombre,
        sheetId: companyConfig.sheetId,
      },
    }, { status: 200 })

  } catch (error) {
    console.error('❌ Error en save-expense:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}