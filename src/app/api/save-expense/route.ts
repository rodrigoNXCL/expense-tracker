import { NextRequest, NextResponse } from 'next/server'
import { uploadReceiptImage } from '@/lib/storage'
import { getSheets } from '@/lib/sheets'
import { readSession } from '@/lib/session'
import { countExpensesOfUser } from '@/lib/gastos-cuenta'

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

    // Fuente de verdad del consumo: los registros reales del usuario en la hoja
    // `Gastos`. No se usa la celda `Usuarios!F` porque obligaria a un
    // leer-luego-escribir, y dos peticiones simultaneas leerian el mismo valor y
    // escribirian el mismo +1, perdiendo un incremento. Google Sheets no ofrece
    // incremento atomico de una celda. Los `append` sobre `Gastos!A:L` si son
    // seguros: cada fila es un hecho consumado y no se sobrescribe.
    if (!userSheetId) {
      throw new Error('Usuario no tiene sheet asociado')
    }
    const sheets = await getSheets()
    const consumos = await countExpensesOfUser(sheets, userSheetId, userEmail)

    // El limite si puede venir de la hoja: lo cambia el administrador.
    const configSheetId = process.env.GOOGLE_CONFIG_SHEET_ID
    let limiteVigente = limiteBoletas
    let indiceUsuario = -1
    if (configSheetId) {
      try {
        const usersResponse = await getSheets(true).then((s) =>
          s.spreadsheets.values.get({
            spreadsheetId: configSheetId,
            range: 'Usuarios!A2:J200',
          })
        )
        const rows = usersResponse.data.values || []
        indiceUsuario = rows.findIndex(
          (row) => row[0]?.toLowerCase().trim() === userEmail.toLowerCase().trim()
        )
        if (indiceUsuario >= 0) {
          const limiteEnHoja = Number(rows[indiceUsuario][4])
          if (limiteEnHoja > 0) limiteVigente = limiteEnHoja
        }
      } catch (err) {
        console.warn('⚠️ No se pudo leer el limite vigente, se usa el de la sesion:', err)
      }
    }

    if (consumos >= limiteVigente) {
      return NextResponse.json(
        {
          error: `Límite de boletas alcanzado (${consumos}/${limiteVigente}). Contacta para ampliar tu plan.`,
          boletas_usadas: consumos,
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

    // El conteo se hace UNA vez por guardado (antes de validar el limite). Tras el
    // `append` se responde con `consumos + 1` en lugar de recontar: bajo
    // concurrencia un recuento inmediato puede dar un valor transitorio, y
    // `/api/auth/me` vuelve a contar las filas reales en cada carga de pagina,
    // corrigiendo cualquier desvio. Asi cada guardado cuesta una sola lectura
    // de la columna `L`, sin duplicar llamadas contra la cuota de Sheets.
    const consumosTrasGuardar = consumos + 1

    // `Usuarios!F` queda como dato informativo para leer en la hoja. Ninguna
    // decision depende de el, por lo que su eventual desincronizacion no
    // afecta el cupo.
    if (configSheetId && indiceUsuario >= 0) {
      try {
        await sheets.spreadsheets.values.update({
          spreadsheetId: configSheetId,
          range: `Usuarios!F${indiceUsuario + 2}`,
          valueInputOption: 'RAW',
          requestBody: {
            values: [[consumosTrasGuardar]],
          },
        })
      } catch (err) {
        console.warn('⚠️ No se pudo actualizar el contador informativo:', err)
      }
    }

    console.log(`✅ Gasto guardado: ${userEmail} - $${monto} (cuenta ${consumosTrasGuardar}/${limiteVigente})`)

    return NextResponse.json({
      success: true,
      message: 'Gasto guardado exitosamente',
      boletas_usadas: consumosTrasGuardar,
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