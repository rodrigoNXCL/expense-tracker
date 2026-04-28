import { NextRequest, NextResponse } from 'next/server'
import { google } from 'googleapis'

export async function GET(request: NextRequest) {
  try {
    // 1. Verificar sesión y rol admin
    const sessionHeader = request.headers.get('x-session')
    if (!sessionHeader) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    
    let session
    try { session = JSON.parse(sessionHeader) } 
    catch { return NextResponse.json({ error: 'Sesión inválida' }, { status: 401 }) }
    
    if (session.rol !== 'admin') {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
    }

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    })

    const sheets = google.sheets({ version: 'v4', auth })
    const configSheetId = process.env.GOOGLE_CONFIG_SHEET_ID

    // 2. Filtrar usuarios por empresa del admin
    const userEmpresa = (session.empresa_nombre || '').toLowerCase().trim()
    
    const usersResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: configSheetId,
      range: 'Usuarios!A2:J100',
    })
    const users = usersResponse.data.values || []
    
    // Filtrar solo usuarios de esta empresa
    const empresaUsers = users.filter(row => 
      (row[2] || '').toLowerCase().trim() === userEmpresa
    )
    
    const empresas = new Set(empresaUsers.map(row => row[2]).filter(Boolean))

    // 3. Sumar gastos del mes actual (solo de esta empresa)
    let totalGastos = 0
    let totalMonto = 0
    
    for (const user of empresaUsers) {
      const sheetId = user[9] // Columna J = sheet_id_asociado
      if (sheetId) {
        try {
          const gastosRes = await sheets.spreadsheets.values.get({
            spreadsheetId: sheetId,
            range: 'Gastos!A2:E1000',
          })
          const gastos = gastosRes.data.values || []
          const mesActual = new Date().toISOString().slice(0, 7) // YYYY-MM
          
          for (const gasto of gastos) {
            if (gasto[0]?.startsWith(mesActual)) {
              totalGastos++
              totalMonto += parseFloat(gasto[4]) || 0
            }
          }
        } catch { /* ignorar errores */ }
      }
    }

    return NextResponse.json({
      stats: {
        total_usuarios: empresaUsers.length,
        total_empresas: empresas.size,
        total_gastos_mes: totalGastos,
        total_monto_mes: totalMonto,
      }
    })
  } catch (error) {
    console.error('❌ Error obteniendo stats:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}