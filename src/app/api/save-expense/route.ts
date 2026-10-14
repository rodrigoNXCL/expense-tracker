import { NextRequest, NextResponse } from 'next/server'
import { uploadReceiptImage } from '@/lib/storage'
import { getSheets } from '@/lib/sheets'
import { readSessionMeta, signSession, setSessionCookie } from '@/lib/session'
import { contadorTrasGuardar } from '@/lib/sesion-contadores'
import {
  callLock,
  randomKey,
  lockErrorResponse,
  mapLockStatus,
  isWriteConfirmed,
} from '@/lib/gastos-lock'

/**
 * Antigüedad máxima de la copia del límite que viaja en el token. Pasado este
 * plazo se relee `Usuarios` paraalker cambios administrativos.
 */
const MAX_SESSION_AGE_S = 5 * 60

export async function POST(request: NextRequest) {
  let lockInUse = false
  let lastIdempotencyKey: string | undefined
  try {
    // ADR-002: la sesión sale del servidor (cookie httpOnly), no del cliente.
    // `readSessionMeta` además entrega `iat`, necesario para no leer Sheets en
    // cada guardado.
    const meta = readSessionMeta(request)
    if (!meta || !meta.session.activo) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }
    const { session } = meta

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

    if (!userSheetId) {
      return NextResponse.json(
        { error: 'Tu cuenta no tiene una hoja de gastos asociada. Contacta al administrador.' },
        { status: 400 }
      )
    }

    // El límite lo mantiene el administrador en `Usuarios!E`. Se relee solo si
    // la sesión está más antigua que el plazo; mientras tanto se usa la copia
    // del token, que es exactamente la ventana de 5 minutos acordada.
    const sessionAge = Math.floor(Date.now() / 1000) - meta.issuedAt
    let limiteVigente = Number(session.limite_boletas) || 100
    if (sessionAge >= MAX_SESSION_AGE_S) {
      const configSheetId = process.env.GOOGLE_CONFIG_SHEET_ID
      if (configSheetId) {
        try {
          const sheets = await getSheets(true)
          const usersResponse = await sheets.spreadsheets.values.get({
            spreadsheetId: configSheetId,
            range: 'Usuarios!A2:J200',
          })
          const rows = usersResponse.data.values || []
          const idx = rows.findIndex(
            (row) => row[0]?.toLowerCase().trim() === userEmail.toLowerCase().trim()
          )
          if (idx >= 0) {
            const limiteEnHoja = Number(rows[idx][4])
            if (limiteEnHoja > 0) limiteVigente = limiteEnHoja
          }
        } catch (err) {
          console.warn('⚠️ No se pudo leer el limite vigente, se usa el de la sesion:', err)
        }
      }
    }

    // Upload a Supabase (OPCIONAL - si falla, igual guarda el gasto).
    // Va ANTES de llamar al script: no se mantiene el bloqueo abierto durante
    // una llamada externa a otro servicio.
    let imageUrl = null
    if (imageFile && imageFile.size > 0) {
      try {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
        imageUrl = await uploadReceiptImage(imageFile, userEmail, timestamp)
      } catch (uploadError) {
        console.warn('⚠️ Error subiendo imagen, pero se guarda el gasto:', uploadError)
      }
    }

    // La clave viaja con el reintento: si el cliente la reenvía, el script
    // devuelve el resultado original en vez de crear una segunda fila.
    const clientKey = formData.get('idempotency_key')
    const idempotencyKey =
      typeof clientKey === 'string' && clientKey.trim() ? clientKey.trim() : randomKey()
    lastIdempotencyKey = idempotencyKey

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

    // A partir de aquí, la decisión de cupo y el registro ocurren DENTRO del
    // bloqueo del script. Esta ruta nunca escribe en `Gastos` por su cuenta.
    lockInUse = true
    const result = await callLock('save', {
      spreadsheetId: userSheetId,
      configSpreadsheetId: process.env.GOOGLE_CONFIG_SHEET_ID || null,
      userEmail,
      idempotencyKey,
      limite: limiteVigente,
      row,
    })
    lockInUse = false

    // Decisión por `status`, nunca por el código HTTP: Apps Script siempre
    // responde 200. Un estado no reconocido cae en fail-closed.
    const mapping = mapLockStatus(result)

    if (result.status === 'quota_exceeded') {
      const consumos = result.consumos ?? 0
      return NextResponse.json(
        {
          error: `Límite de boletas alcanzado (${consumos}/${result.limite ?? limiteVigente}). Contacta para ampliar tu plan.`,
          code: 'quota_exceeded',
          boletas_usadas: consumos,
          limite_boletas: result.limite ?? limiteVigente,
          idempotency_key: idempotencyKey,
        },
        { status: 403 }
      )
    }

    // `ok` y `duplicate` son los únicos estados que confirman la escritura.
    if (isWriteConfirmed(result)) {
      console.log(
        `✅ Gasto ${result.status === 'duplicate' ? 'idempotente' : 'guardado'}: ${userEmail} - $${monto} (cuenta ${result.consumos}/${result.limite ?? limiteVigente}, limite desde ${result.limit_source || 'n/d'})`
      )
      const usadas = result.consumos ?? 0
      const limite = result.limite ?? limiteVigente

      // Se renueva la cookie con los contadores que acaba de devolver el lock.
      // Sin esto, `/api/auth/me` devuelve la copia del token (que solo se
      // reconcilia cada 5 minutos) y el dashboard queda mostrando el valor
      // anterior al guardado hasta que expire esa ventana o se inicie sesión
      // de nuevo. Con la cookie renovada, la copia ya lleva el dato correcto.
      const refreshed = contadorTrasGuardar(session, usadas, limite)
      const ok = NextResponse.json({
        success: true,
        idempotent: result.status === 'duplicate',
        message:
          result.status === 'duplicate'
            ? 'Este gasto ya había sido registrado; no se creó uno nuevo.'
            : 'Gasto guardado exitosamente',
        boletas_usadas: usadas,
        limite_boletas: limite,
        limit_source: result.limit_source,
        imageUrl: imageUrl,
        idempotency_key: idempotencyKey,
      })
      setSessionCookie(ok, signSession(refreshed))
      return ok
    }

    // Todo lo demás es fallo: nunca se reporta como éxito.
    console.error('❌ Guardado rechazado por el lock:', result.status, result.message)
    return NextResponse.json(
      {
        error:
          mapping.outcome === 'schema_problem'
            ? 'La hoja de esta empresa aún no tiene las columnas de control (idempotency_key, estado). El guardado está deshabilitado hasta ejecutar la migración autorizada.'
            : mapping.outcome === 'limit_unknown'
              ? 'No pudimos verificar tu límite de boletas en este momento. No se guardó tu gasto ni se consumió cupo. Intenta de nuevo en unos segundos.'
            : mapping.outcome === 'rejected_needs_ops'
              ? 'El gasto quedó registrado pero requiere revisión manual. Contacta al administrador.'
              : 'No se pudo confirmar el guardado de tu gasto. Intenta de nuevo.',
        code: mapping.code,
        retryable: mapping.retryable,
        // La clave se devuelve siempre: permite reintentar sin duplicar.
        idempotency_key: idempotencyKey,
      },
      { status: mapping.http }
    )
  } catch (error) {
    console.error('❌ Error en save-expense:', error instanceof Error ? error.message : error)
    // Si el bloqueo no está disponible, no se escribe nada: responder con un
    // error controlado en vez de recurrir a una escritura alternativa que
    // eludiría la serialización.
    const mapped = lockErrorResponse(error, lastIdempotencyKey)
    return NextResponse.json({ ...mapped.body, pending: lockInUse }, { status: mapped.status })
  }
}