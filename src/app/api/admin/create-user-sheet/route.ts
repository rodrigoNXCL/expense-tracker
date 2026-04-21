import { NextRequest, NextResponse } from 'next/server'
import { google } from 'googleapis'

export async function POST(request: NextRequest) {
  try {
    console.log(' Creando hoja Usuarios...')

    // Autenticar con Google
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    })

    const sheets = google.sheets({ version: 'v4', auth })

    const spreadsheetId = process.env.GOOGLE_CONFIG_SHEET_ID

    if (!spreadsheetId) {
      throw new Error('Falta GOOGLE_CONFIG_SHEET_ID en .env.local')
    }

    // Verificar si ya existe la hoja
    const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId })
    const existingSheet = spreadsheet.data.sheets?.find(
      sheet => sheet.properties?.title === 'Usuarios'
    )

    if (existingSheet) {
      return NextResponse.json({
        message: '⚠️ La hoja Usuarios ya existe',
        sheetId: existingSheet.properties?.sheetId,
      })
    }

    // Crear nueva hoja
    const response = await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [
          {
            addSheet: {
              properties: {
                title: 'Usuarios',
                gridProperties: {
                  rowCount: 100,
                  columnCount: 10,
                },
              },
            },
          },
        ],
      },
    })

    const newSheet = response.data.replies?.[0]?.addSheet?.properties
    const newSheetId = newSheet?.sheetId

    if (!newSheetId) {
      throw new Error('No se pudo obtener el ID de la nueva hoja')
    }

    // Agregar headers
    const headers = [
      'email',
      'password_hash',
      'empresa_nombre',
      'plan',
      'limite_boletas',
      'boletas_usadas',
      'activo',
      'rol',
      'creado_en',
      'sheet_id_asociado',
    ]

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: 'Usuarios!A1:J1',
      valueInputOption: 'RAW',
      requestBody: {
        values: [headers],
      },
    })

    // Agregar usuario admin por defecto
    const adminUser = [
      'admin@nxchile.cl',
      'admin123', // ← CAMBIAR después del primer login
      'NXChile',
      'admin',
      9999,
      0,
      true,
      'admin',
      new Date().toISOString(),
      '1cx-Jcfzr9R2ETDskyVCrdAO8E8ikJtFScjkk5neBT1s',
    ]

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: 'Usuarios!A2:J2',
      valueInputOption: 'RAW',
      requestBody: {
        values: [adminUser],
      },
    })

    console.log('✅ Hoja Usuarios creada exitosamente')

    return NextResponse.json({
      message: '✅ Hoja Usuarios creada',
      sheetId: newSheetId,
      headers,
    })
  } catch (error) {
    console.error('❌ Error creando hoja:', error instanceof Error ? error.message : error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error creando hoja' },
      { status: 500 }
    )
  }
}