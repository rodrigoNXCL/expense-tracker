import { NextRequest, NextResponse } from 'next/server'
import { google } from 'googleapis'

export async function GET(request: NextRequest) {
  try {
    // 1. Obtener sesión desde headers
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

    // 2. Debug log para verificar sesión
    console.log('🔍 Debug sesión:', {
      email: session.email,
      rol: session.rol,
      sheet_id: session.sheet_id_asociado,
    })

    // 3. Conectar a Google Sheets
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    })

    const sheets = google.sheets({ version: 'v4', auth })

    // 4. Usar el sheet_id_asociado de la sesión
    const spreadsheetId = session.sheet_id_asociado
    if (!spreadsheetId) {
      throw new Error('Usuario no tiene sheet asociado')
    }

    // 5. Leer todos los gastos
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Gastos!A2:L',
    })

    const rows = response.data.values || []

    // 6. Convertir a objetos
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
      image_url: row[10] || '',
      creado_por: row[11] || '',
    }))

    // 7. Debug: mostrar primeros 3 gastos
    console.log('🔍 Debug gastos (primeros 3):', expenses.slice(0, 3).map(e => ({
      fecha: e.fecha,
      creado_por: e.creado_por,
    })))

    // 8. FILTRAR SEGÚN ROL (con .trim() para evitar espacios)
    let filteredExpenses = expenses
    const userRol = (session.rol || '').toLowerCase().trim()
    const userEmail = (session.email || '').toLowerCase().trim()

    console.log('🔍 Debug filtro:', { userRol, userEmail })

    if (userRol === 'admin') {
      // Admin ve TODOS los gastos de su empresa
      filteredExpenses = expenses
      console.log('✅ Usuario es ADMIN, ve todos los gastos')
    } else {
      // User normal solo ve SUS gastos
      filteredExpenses = expenses.filter(exp => 
        (exp.creado_por || '').toLowerCase().trim() === userEmail
      )
      console.log(`✅ Usuario es USER, ve ${filteredExpenses.length} de ${expenses.length} gastos`)
    }

    // 9. Ordenar por fecha (más reciente primero)
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