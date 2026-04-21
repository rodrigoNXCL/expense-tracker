import { NextRequest, NextResponse } from 'next/server'
import { google } from 'googleapis'

export async function GET(request: NextRequest) {
  try {
    // 1. Obtener sesión desde headers (NO desde localStorage)
    const sessionHeader = request.headers.get('x-session')
    
    if (!sessionHeader) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    let session
    try {
      session = JSON.parse(sessionHeader)
    } catch {
      return NextResponse.json({ error: 'Sesión inválida' }, { status: 401 })
    }

    // 2. Conectar a Google Sheets
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    })

    const sheets = google.sheets({ version: 'v4', auth })
    
    // 3. Usar el sheet_id_asociado de la sesión
    const spreadsheetId = session.sheet_id_asociado
    
    if (!spreadsheetId) {
      throw new Error('Usuario no tiene sheet asociado')
    }

    // 4. Leer todos los gastos
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Gastos!A2:L',
    })

    const rows = response.data.values || []
    
    // 5. Convertir a objetos
    const expenses = rows.map(row => ({
      timestamp: row[0] || '',
      fecha: row[1] || '',
      rut: row[2] || '',
      proveedor: row[3] || '',
      monto: parseFloat(row[4]) || 0,
      categoria: row[5] || '',
      boleta_numero: row[6] || '',
      giro: row[7] || '',
      notas: row[8] || '',
      ocr_confidence: parseFloat(row[9]) || 0,
      image_url: row[10] || '',      // NUEVO!
      creado_por: row[11] || '',
    }))

    // 6. FILTRAR SEGÚN ROL
    let filteredExpenses = expenses
    if (session.rol === 'admin') {
      // Admin ve TODOS los gastos de su empresa
      filteredExpenses = expenses
    } else {
      // User normal solo ve SUS gastos
      filteredExpenses = expenses.filter(exp => exp.creado_por === session.email)
    }

    // 7. Ordenar por fecha (más reciente primero)
    filteredExpenses.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    return NextResponse.json({
      expenses: filteredExpenses,
      total: filteredExpenses.length,
      total_monto: filteredExpenses.reduce((sum, exp) => sum + exp.monto, 0),
    })
  } catch (error) {
    console.error('❌ Error obteniendo gastos:', error instanceof Error ? error.message : error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}