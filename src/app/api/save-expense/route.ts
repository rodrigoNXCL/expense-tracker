import { NextRequest, NextResponse } from 'next/server'
import { uploadReceiptImage } from '@/lib/storage'
import { getSheets } from '@/lib/sheets'
import { readSession } from '@/lib/session'

export async function POST(request: NextRequest) {
  try {
    // ADR-002: la sesión sale del servidor (cookie httpOnly), no del cliente
    const session = readSession(request)
    if (!session || !session.activo) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const formData = await request.formData()
    const imageFile = formData.get('image') as File
    const dataString = formData.get('data') as string
    const expenseData = JSON.parse(dataString)

    const {
      fecha, rut, proveedor, monto, categoria,
      boleta_numero, giro, notas, ocr_confidence,
    } = expenseData

    const requiredFields = ['fecha', 'monto', 'proveedor', 'categoria']
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

    // Datos de sesión provenientes del servidor (no confiables del cliente)
    const userEmail = session.email
    const userSheetId = session.sheet_id_asociado
    const boletasUsadas = Number(session.boletas_usadas) || 0
    const limiteBoletas = Number(session.limite_boletas) || 100

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

    const sheets = await getSheets()
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