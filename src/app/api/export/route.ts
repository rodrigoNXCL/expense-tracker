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

    // 2. Conectar a Google Sheets
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    })

    const sheets = google.sheets({ version: 'v4', auth })
    const spreadsheetId = session.sheet_id_asociado

    if (!spreadsheetId) {
      throw new Error('Usuario no tiene sheet asociado')
    }

    // 3. Leer gastos
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Gastos!A2:L',
    })

    const rows = response.data.values || []
    
    // 4. Convertir a objetos
    let expenses = rows.map(row => ({
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

    // 5. Filtrar según rol
    if (session.rol !== 'admin') {
      expenses = expenses.filter(exp => exp.creado_por === session.email)
    }

    // 6. Generar CSV
    const headers = ['Fecha', 'RUT', 'Proveedor', 'Monto', 'Categoría', 'N° Boleta', 'Giro', 'Notas', 'URL Imagen', 'Creado Por']
    const csvRows = [headers.join(',')]

    // ✅ DESPUÉS
for (const exp of expenses) {
  csvRows.push([
    exp.fecha,
    exp.rut,
    `"${exp.proveedor.replace(/"/g, '""')}"`,
    exp.monto,
    exp.categoria,
    exp.boleta_numero,
    `"${exp.giro.replace(/"/g, '""')}"`,
    `"${exp.notas.replace(/"/g, '""')}"`,
    exp.image_url || '',  // ← AGREGAR: URL Imagen
    exp.creado_por,
  ].join(','))
}

    const csvContent = csvRows.join('\n')

    // 7. Retornar como archivo descargable
    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="gastos_${session.empresa_nombre}_${new Date().toISOString().split('T')[0]}.csv"`,
      },
    })
  } catch (error) {
    console.error('❌ Error exportando:', error instanceof Error ? error.message : error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}