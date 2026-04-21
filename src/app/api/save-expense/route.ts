import { NextRequest, NextResponse } from 'next/server'
import { google } from 'googleapis'
import { uploadReceiptImage } from '@/lib/storage'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const imageFile = formData.get('image') as File
    const dataString = formData.get('data') as string
    const expenseData = JSON.parse(dataString)

    const {
      fecha, rut, proveedor, monto, categoria,
      boleta_numero, giro, notas, ocr_confidence,
      userEmail, userEmpresa, userPlan, userLimite, userUsadas, userRol, userSheetId
    } = expenseData

    const requiredFields = ['fecha', 'monto', 'proveedor', 'categoria', 'userEmail', 'userSheetId']
    const missingFields = requiredFields.filter(field => !expenseData[field])

    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: 'Campos requeridos faltantes', missing: missingFields },
        { status: 400 }
      )
    }

    if (typeof monto !== 'number' || monto <= 0) {
      return NextResponse.json(
        { error: 'El monto debe ser un número positivo' },
        { status: 400 }
      )
    }

    const boletasUsadas = Number(userUsadas) || 0
    const limiteBoletas = Number(userLimite) || 100

    if (boletasUsadas >= limiteBoletas) {
      return NextResponse.json(
        {
          error: `Límite de boletas alcanzado (${boletasUsadas}/${limiteBoletas}). Contacta para ampliar tu plan.`,
          boletas_usadas: boletasUsadas,
          limite_boletas: limiteBoletas,
        },
        { status: 403 }
      )
    }

    // Upload a Supabase (OPCIONAL - si falla, igual guarda el gasto)
    let imageUrl = null
    if (imageFile && imageFile.size > 0) {
      try {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
        imageUrl = await uploadReceiptImage(imageFile, userEmail, timestamp)
      } catch (uploadError) {
        console.warn('⚠️ Error subiendo imagen, pero se guarda el gasto:', uploadError)
      }
    }

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    })

    const sheets = google.sheets({ version: 'v4', auth })
    const spreadsheetId = userSheetId

    if (!spreadsheetId) {
      throw new Error('Usuario no tiene sheet asociado')
    }

    const timestamp = new Date().toISOString()
    const row = [
      timestamp,
      fecha,
      rut || '',
      proveedor,
      monto,
      categoria || '',
      boleta_numero || '',
      giro || '',
      notas || '',
      ocr_confidence || 0,
      imageUrl || '',
      userEmail,
    ]

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Gastos!A:L',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [row],
      },
    })

    const configSheetId = process.env.GOOGLE_CONFIG_SHEET_ID
    if (configSheetId) {
      const usersResponse = await sheets.spreadsheets.values.get({
        spreadsheetId: configSheetId,
        range: 'Usuarios!A2:J100',
      })

      const rows = usersResponse.data.values || []
      const userIndex = rows.findIndex(row => row[0]?.toLowerCase() === userEmail.toLowerCase())

      if (userIndex >= 0) {
        const newCount = boletasUsadas + 1
        await sheets.spreadsheets.values.update({
          spreadsheetId: configSheetId,
          range: `Usuarios!F${userIndex + 2}`,
          valueInputOption: 'RAW',
          requestBody: {
            values: [[newCount]],
          },
        })
      }
    }

    console.log(`✅ Gasto guardado: ${userEmail} - $${monto}`)

    return NextResponse.json({
      success: true,
      message: 'Gasto guardado exitosamente',
      boletas_usadas: boletasUsadas + 1,
      limite_boletas: limiteBoletas,
      imageUrl: imageUrl,
    })
  } catch (error) {
    console.error('❌ Error en save-expense:', error instanceof Error ? error.message : error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}