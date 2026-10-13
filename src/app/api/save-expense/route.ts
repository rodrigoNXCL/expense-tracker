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

    // La fuente de verdad del cupo es Google Sheets, no el JWT (que queda
    // congelado al iniciar sesión). Se resuelve una sola vez, antes de guardar,
    // para validar el límite contra el valor vigente y reutilizar la fila en el
    // incremento posterior: cero lecturas extra.
    const configSheetId = process.env.GOOGLE_CONFIG_SHEET_ID
    let contadorVigente = boletasUsadas
    let limiteVigente = limiteBoletas
    let filaUsuario: string[] | null = null
    let indiceUsuario = -1

    if (configSheetId) {
      const usersResponse = await getSheets().then((s) =>
        s.spreadsheets.values.get({ spreadsheetId: configSheetId, range: 'Usuarios!A2:J100' })
      )
      const rows = usersResponse.data.values || []
      indiceUsuario = rows.findIndex((row) => row[0]?.toLowerCase() === userEmail.toLowerCase())
      if (indiceUsuario >= 0) {
        filaUsuario = rows[indiceUsuario]
        contadorVigente = Number(filaUsuario[5]) || 0
        const limiteEnHoja = Number(filaUsuario[4])
        if (limiteEnHoja > 0) limiteVigente = limiteEnHoja
      }
    }

    if (contadorVigente >= limiteVigente) {
      return NextResponse.json(
        {
          error: `Límite de boletas alcanzado (${contadorVigente}/${limiteVigente}). Contacta para ampliar tu plan.`,
          boletas_usadas: contadorVigente,
          limite_boletas: limiteVigente,
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

    if (configSheetId && indiceUsuario >= 0 && filaUsuario) {
      await sheets.spreadsheets.values.update({
        spreadsheetId: configSheetId,
        range: `Usuarios!F${indiceUsuario + 2}`,
        valueInputOption: 'RAW',
        requestBody: {
          values: [[contadorVigente + 1]],
        },
      })
    }

    console.log(`✅ Gasto guardado: ${userEmail} - $${monto} (cuenta ${contadorVigente}/${limiteVigente})`)

    return NextResponse.json({
      success: true,
      message: 'Gasto guardado exitosamente',
      // Valores vigentes leídos de Google Sheets, no los del JWT congelado.
      boletas_usadas: contadorVigente + 1,
      limite_boletas: limiteVigente,
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