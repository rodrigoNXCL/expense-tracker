import { NextRequest, NextResponse } from 'next/server'
import { getSheets } from '@/lib/sheets'
import { readSession } from '@/lib/session'
import {
  callLock,
  lockErrorResponse,
  mapLockStatus,
  isWriteConfirmed,
} from '@/lib/gastos-lock'
import {
  ESTADO_PROCESANDO,
  asientoYaInsertado,
  MARCA_FONDO,
  asientoIdDeterminista,
  puenteIdDeterminista,
  puenteFondoId,
  claveGasto,
  normalizarEstado,
  rendicionEnEstadoTerminal,
  rendicionEnProceso,
  calcularNuevoSaldoFondo,
  planificarPuente,
  lockSinEscritura,
} from '@/lib/puente-idempotencia'
import {
  getRindeSpreadsheetId,
  generateAsientoContable,
} from '@/lib/rinde-helpers'

export const dynamic = 'force-dynamic'

/**
 * Límite vigente de un usuario en `Usuarios!E`. Es el mismo dato que usa
 * GastosNX: el puente no inventa una regla de consumo nueva, comparte el mismo
 * cupo porque escribe en la misma hoja `Gastos` con el mismo `creado_por`.
 */
async function resolveLimite_(email: string): Promise<number> {
  const configSheetId = process.env.GOOGLE_CONFIG_SHEET_ID
  if (!configSheetId) throw new Error('GOOGLE_CONFIG_SHEET_ID no configurado')
  const sheets = await getSheets(true)
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: configSheetId,
    range: 'Usuarios!A2:J200',
  })
  const rows = res.data.values || []
  const row = rows.find((r) => r[0]?.toLowerCase().trim() === email.toLowerCase().trim())
  const limite = row ? Number(row[4]) : 0
  if (limite <= 0) {
    throw new Error(`El usuario ${email} no tiene un límite válido en Usuarios!E`)
  }
  return limite
}

interface GastoRinde {
  id: string
  rendicion_id: string
  fecha: string
  rut: string
  proveedor: string
  monto: number
  categoria: string
  boleta_numero: string
  giro: string
  notas: string
  image_url: string
  creado_por: string
  pasado_a_gastos: boolean
  tipo_documento: string
}

async function getConfig(sheets: any, spreadsheetId: string) {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Config_Rinde!A2:G',
  })
  const rows = res.data.values || []
  if (rows.length === 0) {
    return { empresa: '', rinde_activo: 'TRUE', gastos_activo: 'FALSE', admin_email: '', cuenta_anticipo: 'Fondo por rendir – Cuenta por cobrar empleados', cuenta_saldo_favor: 'Saldo a favor del usuario – Reembolso', cuenta_saldo_contra: 'Saldo por devolver del usuario' }
  }
  const row = rows[0]
  return {
    empresa: row[0] || '',
    rinde_activo: row[1] || 'TRUE',
    gastos_activo: row[2] || 'FALSE',
    admin_email: row[3] || '',
    cuenta_anticipo: row[4] || 'Fondo por rendir – Cuenta por cobrar empleados',
    cuenta_saldo_favor: row[5] || 'Saldo a favor del usuario – Reembolso',
    cuenta_saldo_contra: row[6] || 'Saldo por devolver del usuario',
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await readSession(request)
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const spreadsheetId = await getRindeSpreadsheetId(session)
    if (!spreadsheetId) {
      return NextResponse.json({ error: 'RindeNX no configurado' }, { status: 404 })
    }

    const sheets = await getSheets()
    const config = await getConfig(sheets, spreadsheetId)

    const puenteRes = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Puente!A2:F',
    })
    const rows = puenteRes.data.values || []
    const registros = rows.map((row: any[]) => ({
      id: row[0] || '',
      rinde_gasto_id: row[1] || '',
      rendicion_id: row[2] || '',
      gastos_row_number: parseInt(row[3]) || 0,
      pasado_en: row[4] || '',
      aprobado_por: row[5] || '',
    }))

    return NextResponse.json({
      config: {
        gastos_activo: config.gastos_activo === 'TRUE',
        admin_email: config.admin_email,
      },
      registros,
      total: registros.length,
    })
  } catch (error) {
    console.error('❌ Error en GET /api/rinde/puente:', error)
    return NextResponse.json(
      { error: 'Error al listar puente', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await readSession(request)
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }
    if (session.rol !== 'admin') {
      return NextResponse.json({ error: 'Solo admin puede ejecutar el puente' }, { status: 403 })
    }

    const body = await request.json()
    const { rendicion_id, gastos_seleccionados, comentarios } = body

    if (!rendicion_id || !Array.isArray(gastos_seleccionados)) {
      return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })
    }

    const spreadsheetId = await getRindeSpreadsheetId(session)
    if (!spreadsheetId) {
      return NextResponse.json({ error: 'RindeNX no configurado' }, { status: 404 })
    }

    const sheets = await getSheets()

    const config = await getConfig(sheets, spreadsheetId)
    if (config.gastos_activo !== 'TRUE') {
      return NextResponse.json(
        { error: 'El puente no está activo para esta empresa (gastos_activo=FALSE)' },
        { status: 400 }
      )
    }

    const rendRes = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Rendiciones!A2:K',
    })
    const rendRows = rendRes.data.values || []
    const rendRowIndex = rendRows.findIndex((row: any[]) => row[0] === rendicion_id)
    if (rendRowIndex === -1) {
      return NextResponse.json({ error: 'Rendición no encontrada' }, { status: 404 })
    }
    const rendRow = rendRows[rendRowIndex]
    const rendicionId = String(rendRow[0] || '')
    const estadoActual = normalizarEstado(rendRow[3])
    const rendRowNumber = rendRowIndex + 2

    if (rendicionEnEstadoTerminal(rendRow) && estadoActual !== ESTADO_PROCESANDO) {
      if (estadoActual === 'aprobada') {
        // Reintento de una rendición YA completada: se responde con éxito
        // idempotente y NO se repite ninguna escritura (ni asiento, ni
        // descuento de fondo, ni cruces).
        return NextResponse.json({
          success: true,
          idempotent: true,
          estado: 'aprobada',
          rendicion_id: rendicionId,
          gastos_pasados: 0,
          asiento_id: rendRow[9] || '',
          mensaje: 'La rendición ya había sido aprobada; no se repitió ninguna operación.',
        })
      }
      return NextResponse.json({ error: 'La rendición ya fue procesada' }, { status: 400 })
    }

    // Una rendición que quedó en `procesando` es recuperable: el reintento
    // continúa el trabajo verificando paso a paso qué falta, sin duplicar lo
    // ya hecho.
    const reanudando = rendicionEnProceso(rendRow)

    const gastosRes = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'GastosRinde!A2:O',
    })
    const gastosRows = gastosRes.data.values || []
    const seleccionSet = new Set(gastos_seleccionados)
    const gastosParaPasar: { gasto: GastoRinde; rowIndex: number }[] = []
    const gastosNoPasarPorTipo: string[] = []
    gastosRows.forEach((row: any[], idx: number) => {
      const id = row[0] || ''
      const tipoDoc = row[14] || 'boleta'
      if (seleccionSet.has(id) && row[13] !== 'TRUE') {
        if (tipoDoc === 'boleta' || tipoDoc === 'voucher') {
          gastosParaPasar.push({
            gasto: {
              id,
              rendicion_id: row[1] || '',
              fecha: row[2] || '',
              rut: row[3] || '',
              proveedor: row[4] || '',
              monto: parseFloat(row[5]) || 0,
              categoria: row[6] || '',
              boleta_numero: row[7] || '',
              giro: row[8] || '',
              notas: row[9] || '',
              image_url: row[10] || '',
              creado_por: row[11] || '',
              pasado_a_gastos: false,
              tipo_documento: tipoDoc,
            },
            rowIndex: idx + 2,
          })
        } else {
          gastosNoPasarPorTipo.push(id)
        }
      }
    })

    // Se marca `procesando` antes de tocar nada. Si el proceso muere a mitad,
    // la rendicion queda en un estado RECUPERABLE: un reintento la continua
    // verificando cada paso. Si se dejara sin marcar, un reintento no podria
    // distinguir "nunca empezo" de "empezo y se cayo".
    if (!reanudando) {
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `Rendiciones!D${rendRowNumber}`,
        valueInputOption: 'RAW',
        requestBody: { values: [[ESTADO_PROCESANDO]] },
      })
    }

    // Estado previo de las tablas de seguimiento, para no repetir pasos.
    const puentePrevio = await sheets.spreadsheets.values.get({ spreadsheetId, range: 'Puente!A:F' })
    const filasPuente = puentePrevio.data.values || []
    const asientosPrevio = await sheets.spreadsheets.values.get({ spreadsheetId, range: 'Asientos!A:J' })
    const filasAsientos = asientosPrevio.data.values || []

    const plan = planificarPuente({
      rendicion: [rendicionId, rendRow[3] === ESTADO_PROCESANDO ? ESTADO_PROCESANDO : ''],
      filasPuente,
      filasAsientos,
      gastosAPasar: gastosParaPasar.map((g) => ({ id: g.gasto.id })),
      tieneFondo: false,
    })

    const puenteResults: any[] = []
    if (gastosParaPasar.length > 0) {
      const ahora = new Date().toISOString()

      // Clave estable por gasto: si el puente se reintenta, el script reconoce
      // las filas ya escritas y solo agrega las que falten. No depende de
      // `Date.now()`, así que sobrevive a un reintento.
      const items = gastosParaPasar.map(({ gasto }) => ({
        idempotencyKey: claveGasto(rendicion_id, gasto.id),
        row: [
          ahora,
          gasto.fecha,
          gasto.rut,
          gasto.proveedor,
          gasto.monto,
          gasto.categoria,
          gasto.boleta_numero,
          gasto.giro,
          gasto.notas,
          '95',
          gasto.image_url,
          gasto.creado_por,
        ],
      }))

      // El registro en `Gastos` ocurre DENTRO del bloqueo, con validación de
      // cupo para el lote completo. Si no hay cupo suficiente no se escribe
      // ninguna fila: la rendición no queda a medias.
      const lockUser = gastosParaPasar[0].gasto.creado_por || session.email
      const lockResult = await callLock('saveBatch', {
        spreadsheetId,
        configSpreadsheetId: process.env.GOOGLE_CONFIG_SHEET_ID || null,
        userEmail: lockUser,
        limite: await resolveLimite_(lockUser),
        rows: items,
      })

      // Decisión por `status`: Apps Script siempre responde HTTP 200.
      if (lockResult.status === 'quota_exceeded') {
        // La rendicion vuelve a su estado anterior: no se registro nada del lote.
        await sheets.spreadsheets.values.update({
          spreadsheetId,
          range: `Rendiciones!D${rendRowNumber}`,
          valueInputOption: 'RAW',
          requestBody: { values: [[rendRow[3] || '']] },
        })
        return NextResponse.json(
          {
            error: `Cupo insuficiente para pasar la rendición completa: quedan ${
              lockResult.available ?? 0
            } de ${lockResult.requested ?? items.length} gastos. No se registró ninguno.`,
            code: 'quota_exceeded',
            boletas_usadas: lockResult.consumos ?? 0,
            limite_boletas: lockResult.limite ?? 0,
          },
          { status: 403 }
        )
      }
      if (!isWriteConfirmed(lockResult)) {
        const mapping = mapLockStatus(lockResult)
        // Si el lock garantiza que no escribio nada, la rendicion vuelve a su
        // estado anterior: no se dejo a medias sin motivo. Si el resultado es
        // ambiguo, se mantiene `procesando` para que el reintento resuelva por
        // clave de idempotencia.
        if (lockSinEscritura(lockResult.status)) {
          await sheets.spreadsheets.values.update({
            spreadsheetId,
            range: `Rendiciones!D${rendRowNumber}`,
            valueInputOption: 'RAW',
            requestBody: { values: [[rendRow[3] || '']] },
          })
        }
        const mensaje =
          mapping.outcome === 'limit_unknown'
            ? 'No pudimos verificar el limite de boletas. No se registro ningun gasto ni se completo la rendicion.'
            : mapping.outcome === 'schema_problem'
              ? 'La hoja de esta empresa aun no tiene las columnas de control. No se registro ningun gasto.'
              : 'No se pudo registrar el cruce de gastos. No se completo la rendicion.'
        return NextResponse.json(
          {
            error: mensaje,
            code: mapping.code,
            retryable: mapping.retryable,
            estado: lockSinEscritura(lockResult.status) ? rendRow[3] || '' : ESTADO_PROCESANDO,
          },
          { status: mapping.http }
        )
      }

      // Posición de cada fila en `Gastos`, resuelta por clave.
      const placedByKey = new Map<string, number | null>(
        (lockResult.placed || []).map((p) => [p.idempotencyKey, p.row])
      )

      const crucesPendientes = new Set(plan.registrarCruces)

      for (let i = 0; i < gastosParaPasar.length; i++) {
        const { gasto, rowIndex } = gastosParaPasar[i]
        const key = items[i].idempotencyKey
        const gastosRow = placedByKey.get(key)

        // `GastosRinde!N` es una marca booleana: reescribir TRUE es inocuo.
        await sheets.spreadsheets.values.update({
          spreadsheetId,
          range: `GastosRinde!N${rowIndex}`,
          valueInputOption: 'RAW',
          requestBody: { values: [['TRUE']] },
        })

        // Id estable: un reintento produce el MISMO id, y si ya existe en
        // `Puente` se omite la insercion (no se duplica el registro).
        const puenteId = puenteIdDeterminista(rendicion_id, gasto.id)
        if (crucesPendientes.has(gasto.id)) {
          await sheets.spreadsheets.values.append({
            spreadsheetId,
            range: 'Puente!A:F',
            valueInputOption: 'RAW',
            requestBody: {
              values: [[
                puenteId,
                gasto.id,
                rendicion_id,
                String(gastosRow ?? ''),
                ahora,
                session.email,
              ]],
            },
          })
          filasPuente.push([puenteId, gasto.id, rendicion_id, String(gastosRow ?? ''), ahora, session.email])
        }
        puenteResults.push({ id: puenteId, gasto_id: gasto.id, gastos_row: gastosRow, ya_registrado: !crucesPendientes.has(gasto.id) })
      }
    }

    const fechaCierre = new Date().toISOString()

    // El asiento y el descuento del fondo deben reflejar TODOS los gastos de la rendición
    // (boletas + vouchers + facturas), no solo los que pasan al puente. Se reutiliza la
    // lectura inicial de GastosRinde para no duplicar requests.
    const gastosRendicion = gastosRows
      .filter((row: any[]) => row[1] === rendicion_id)
    const montoBoletas = gastosRendicion
      .filter((row: any[]) => row[14] === 'boleta' || row[14] === 'voucher')
      .reduce((sum, row: any[]) => sum + (parseFloat(row[5]) || 0), 0)
    const montoFacturas = gastosRendicion
      .filter((row: any[]) => row[14] === 'factura')
      .reduce((sum, row: any[]) => sum + (parseFloat(row[5]) || 0), 0)
    const totalRendido = montoBoletas + montoFacturas

    // Monto asignado del fondo para reflejar la diferencia (una sola lectura de Fondos,
    // reutilizada luego para descontar el saldo)
    const fondoId = rendRow[10] || ''
    let fondosRows: any[] = []
    let fondoRowIdx = -1
    let montoAsignadoFondo = 0
    if (fondoId) {
      const fondosRes = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: 'Fondos!A2:I',
      })
      fondosRows = fondosRes.data.values || []
      fondoRowIdx = fondosRows.findIndex((row: any[]) => row[0] === fondoId)
      montoAsignadoFondo = fondoRowIdx !== -1 ? parseFloat(fondosRows[fondoRowIdx][2]) || 0 : 0
    }

    const asiento = generateAsientoContable(rendicion_id, montoBoletas, montoFacturas, rendRow[5], montoAsignadoFondo, config.cuenta_anticipo, config.cuenta_saldo_favor, config.cuenta_saldo_contra)

    // Id estable derivado de la rendicion. `generateAsientoContable` genera uno
    // aleatorio, que en un reintento duplicaria el asiento; aqui se sustituye
    // por uno determinista ANTES de escribir, de modo que el paso se pueda
    // detectar como ya hecho.
    asiento.id = asientoIdDeterminista(rendicion_id)

    const asientoValues: any[][] = []
    asiento.lineas.forEach((linea) => {
      asientoValues.push([
        asiento.id,
        asiento.rendicion_id,
        asiento.fecha,
        asiento.tipo,
        linea.cuenta,
        String(linea.debe),
        String(linea.haber),
        asiento.descripcion,
        session.email,
        fechaCierre,
      ])
    })

    // Solo se inserta si no existe ya un asiento con este id.
    const planFinal = planificarPuente({
      rendicion: [rendicionId, ESTADO_PROCESANDO],
      filasPuente,
      filasAsientos,
      gastosAPasar: gastosParaPasar.map((g) => ({ id: g.gasto.id })),
      tieneFondo: fondoId && fondoRowIdx !== -1,
    })

    let asientoInsertado = false
    if (planFinal.insertarAsiento) {
      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: 'Asientos!A:J',
        valueInputOption: 'RAW',
        requestBody: { values: asientoValues },
      })
      asientoInsertado = true
    }

    // Descuento del fondo: IDENTICO una sola vez, controlado por un marcador
    // estable en `Puente`. La regla contable no cambia.
    let fondoDescontado = false
    if (fondoId && fondoRowIdx !== -1 && planFinal.descontarFondo) {
      const fondoRow = fondosRows[fondoRowIdx]
      const nuevoSaldo = calcularNuevoSaldoFondo(parseFloat(fondoRow[3]) || 0, totalRendido)

      // Primero el marcador y luego el saldo: si se cae en medio, el reintento
      // ve el marcador y NO vuelve a descontar.
      const marcaFondoId = puenteFondoId(rendicion_id)
      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: 'Puente!A:F',
        valueInputOption: 'RAW',
        requestBody: {
          values: [[marcaFondoId, MARCA_FONDO, rendicion_id, String(totalRendido), fechaCierre, session.email]],
        },
      })
      filasPuente.push([marcaFondoId, MARCA_FONDO, rendicion_id, String(totalRendido), fechaCierre, session.email])

      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `Fondos!D${fondoRowIdx + 2}`,
        valueInputOption: 'RAW',
        requestBody: { values: [[String(nuevoSaldo)]] },
      })
      fondoDescontado = true
    }

    // La rendicion SOLO se marca `aprobada` cuando las operaciones obligatorias
    // ya quedaron hechas. Si algo falla antes, queda en `procesando` y el
    // reintento continua.
    const pasosObligatoriosPendientes: string[] = []
    if (!asientoInsertado && !asientoYaInsertado) pasosObligatoriosPendientes.push('asiento')
    if (fondoId && fondoRowIdx !== -1 && !fondoDescontado) pasosObligatoriosPendientes.push('descuento_fondo')

    if (pasosObligatoriosPendientes.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Rendición dejada en estado '${ESTADO_PROCESANDO}': no se pudo completar ${
            pasosObligatoriosPendientes.join(' y ')
          }. Reintenta para continuar.`,
          code: 'partial_processing',
          estado: ESTADO_PROCESANDO,
          rendicion_id: rendicion_id,
          pendiente: pasosObligatoriosPendientes,
        },
        { status: 503 }
      )
    }

    const updatedRend = [
      rendRow[0],
      rendRow[1],
      fechaCierre,
      'aprobada',
      String(totalRendido),
      rendRow[5],
      rendRow[6],
      session.email,
      comentarios || rendRow[8] || '',
      asiento.id,
      rendRow[10] || '',
    ]
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `Rendiciones!A${rendRowNumber}:K${rendRowNumber}`,
      valueInputOption: 'RAW',
      requestBody: { values: [updatedRend] },
    })

    return NextResponse.json({
      success: true,
      idempotent: reanudando,
      estado: 'aprobada',
      rendicion_id,
      gastos_pasados: puenteResults.length,
      asiento_id: asiento.id,
      total_rendido: totalRendido,
      saldo_diferencia: asiento.diferencia,
      fondo_descontado: fondoDescontado,
      mensaje: reanudando
        ? `Rendición aprobada. Operación reanudada: no se repitieron pasos ya completados.`
        : puenteResults.length > 0
        ? `Rendición aprobada. ${puenteResults.length} gasto(s) pasado(s) a GastosNX.`
        : 'Rendición aprobada sin pasar gastos a GastosNX.',
    })
  } catch (error) {
    console.error('❌ Error en POST /api/rinde/puente:', error)
    // Si el bloqueo no está disponible, el puente NO recurre a una escritura
    // directa en `Gastos`: se devuelve un error controlado.
    const mapped = lockErrorResponse(error)
    return NextResponse.json(
      { ...mapped.body, details: error instanceof Error ? error.message : 'Unknown' },
      { status: mapped.status }
    )
  }
}
