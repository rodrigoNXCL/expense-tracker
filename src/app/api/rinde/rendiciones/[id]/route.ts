import { NextRequest, NextResponse } from 'next/server'
import { getSheets } from '@/lib/sheets'
import { readSession } from '@/lib/session'
import { getRindeSpreadsheetId, generateAsientoContable } from '@/lib/rinde-helpers'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await readSession(request)
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { id } = await params
    const spreadsheetId = await getRindeSpreadsheetId(session)
    if (!spreadsheetId) {
      return NextResponse.json({ error: 'RindeNX no configurado' }, { status: 404 })
    }

    const sheets = await getSheets()

    const rendRes = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Rendiciones!A2:K',
    })
    const rendRows = rendRes.data.values || []
    const rendRow = rendRows.find((row: any[]) => row[0] === id)
    if (!rendRow) {
      return NextResponse.json({ error: 'Rendición no encontrada' }, { status: 404 })
    }

    const rendicion = {
      id: rendRow[0],
      fecha_creacion: rendRow[1],
      fecha_cierre: rendRow[2],
      estado: rendRow[3],
      monto_total: parseFloat(rendRow[4]) || 0,
      descripcion: rendRow[5],
      usuario_email: rendRow[6],
      aprobado_por: rendRow[7],
      comentarios: rendRow[8],
      asiento_id: rendRow[9],
      fondo_id: rendRow[10] || '',
    }

    const gastosRes = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'GastosRinde!A2:O',
    })
    const gastosRows = gastosRes.data.values || []
    const gastos = gastosRows
      .filter((row: any[]) => row[1] === id)
      .map((row: any[]) => ({
        id: row[0],
        rendicion_id: row[1],
        fecha: row[2],
        rut: row[3],
        proveedor: row[4],
        monto: parseFloat(row[5]) || 0,
        categoria: row[6],
        boleta_numero: row[7],
        giro: row[8],
        notas: row[9],
        image_url: row[10],
        creado_por: row[11],
        creado_en: row[12],
        pasado_a_gastos: row[13] === 'TRUE',
        tipo_documento: row[14] || 'boleta',
      }))

    let asiento = null
    if (rendicion.asiento_id) {
      const astRes = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: 'Asientos!A2:J',
      })
      const astRows = astRes.data.values || []
      const astLines = astRows.filter((row: any[]) => row[0] === rendicion.asiento_id || row[1] === id)
      const lineas = astLines.map((row: any[]) => ({
        cuenta: row[4] || '',
        debe: parseFloat(row[5]) || 0,
        haber: parseFloat(row[6]) || 0,
      }))
      const totalDebe = lineas.reduce((s, l) => s + l.debe, 0)
      const totalHaber = lineas.reduce((s, l) => s + l.haber, 0)
      asiento = {
        id: rendicion.asiento_id,
        rendicion_id: astLines[0]?.[1] || '',
        fecha: astLines[0]?.[2] || '',
        tipo: astLines[0]?.[3] || '',
        descripcion: astLines[0]?.[7] || '',
        creado_por: astLines[0]?.[8] || '',
        lineas,
        totalDebe,
        totalHaber,
        cuadra: Math.abs(totalDebe - totalHaber) < 0.01,
      }
    }

    const puenteRes = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Puente!A2:F',
    })
    const puenteRows = puenteRes.data.values || []
    const puente = puenteRows
      .filter((row: any[]) => row[2] === id)
      .map((row: any[]) => ({
        id: row[0],
        rinde_gasto_id: row[1],
        rendicion_id: row[2],
        gastos_row_number: parseInt(row[3]) || 0,
        pasado_en: row[4],
        aprobado_por: row[5],
      }))

    // Información del fondo asociado (monto asignado) para reflejar la diferencia
    let fondoContext = null
    if (rendicion.fondo_id) {
      const fondosCtx = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: 'Fondos!A2:I',
      })
      const fRowCtx = (fondosCtx.data.values || []).find((row: any[]) => row[0] === rendicion.fondo_id)
      if (fRowCtx) {
        fondoContext = {
          id: fRowCtx[0],
          monto_asignado: parseFloat(fRowCtx[2]) || 0,
          saldo: parseFloat(fRowCtx[3]) || 0,
          observacion: fRowCtx[4] || '',
          estado: fRowCtx[6] || '',
        }
      }
    }

    return NextResponse.json({ rendicion, gastos, asiento, puente, fondo: fondoContext })
  } catch (error) {
    console.error('❌ Error en GET /api/rinde/rendiciones/[id]:', error)
    return NextResponse.json(
      { error: 'Error al cargar rendición', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await readSession(request)
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { accion, comentarios } = body

    const ACCIONES_ADMIN = ['aprobar', 'rechazar', 'cerrar', 'enviar_revision', 'abrir', 'pagar_saldo_favor']
    const ACCIONES_USUARIO = ['marcar_terminada']
    if (![...ACCIONES_ADMIN, ...ACCIONES_USUARIO].includes(accion)) {
      return NextResponse.json({ error: 'Acción inválida' }, { status: 400 })
    }
    const esAccionAdmin = ACCIONES_ADMIN.includes(accion)
    if (esAccionAdmin && session.rol !== 'admin') {
      return NextResponse.json({ error: 'Solo admin puede realizar esa acción' }, { status: 403 })
    }

    if (!esAccionAdmin && session.rol === 'admin') {
      return NextResponse.json({ error: 'Acción no disponible para admin' }, { status: 400 })
    }

    const spreadsheetId = await getRindeSpreadsheetId(session)
    if (!spreadsheetId) {
      return NextResponse.json({ error: 'RindeNX no configurado' }, { status: 404 })
    }

    const sheets = await getSheets()

    const rendRes = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Rendiciones!A2:K',
    })
    const rendRows = rendRes.data.values || []
    const rowIndex = rendRows.findIndex((row: any[]) => row[0] === id)
    if (rowIndex === -1) {
      return NextResponse.json({ error: 'Rendición no encontrada' }, { status: 404 })
    }

    const rendRow = rendRows[rowIndex]
    const rowNumber = rowIndex + 2

    // Solo el dueño (o admin) puede marcar terminada / operar
    if (session.email !== rendRow[6] && session.rol !== 'admin') {
      return NextResponse.json({ error: 'No tienes permisos sobre esta rendición' }, { status: 403 })
    }

    // Transiciones permitidas por estado
    const estadoActual = rendRow[3]
    if (accion === 'marcar_terminada' && estadoActual !== 'abierta') {
      return NextResponse.json({ error: 'Solo se puede marcar como terminada una rendición abierta' }, { status: 400 })
    }
    if (accion === 'abrir' && !['terminada', 'en_revision', 'rechazada'].includes(estadoActual)) {
      return NextResponse.json({ error: 'Solo se puede abrir una rendición cerrada/terminada' }, { status: 400 })
    }

    const estadoMap: Record<string, string> = {
      aprobar: 'aprobada',
      rechazar: 'rechazada',
      cerrar: 'cerrada',
      enviar_revision: 'en_revision',
      abrir: 'abierta',
      pagar_saldo_favor: 'cerrada',
      marcar_terminada: 'terminada',
    }
    const nuevoEstado = estadoMap[accion]
    const accionesConCierre = ['aprobar', 'rechazar', 'cerrar', 'pagar_saldo_favor']
    const fechaCierre = accionesConCierre.includes(accion) ? new Date().toISOString() : rendRow[2]

    let asientoId = rendRow[9] || ''
    if (accion === 'aprobar' || accion === 'cerrar' || accion === 'pagar_saldo_favor') {
      const gastosRes = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: 'GastosRinde!A2:O',
      })
      const gastosRows = gastosRes.data.values || []
      const montoBoletas = gastosRows
        .filter((row: any[]) => row[1] === id && (row[14] === 'boleta' || row[14] === 'voucher'))
        .reduce((sum: number, row: any[]) => sum + (parseFloat(row[5]) || 0), 0)
      const montoFacturas = gastosRows
        .filter((row: any[]) => row[1] === id && row[14] === 'factura')
        .reduce((sum: number, row: any[]) => sum + (parseFloat(row[5]) || 0), 0)
      const totalRendido = montoBoletas + montoFacturas

      // Config: cuenta anticipo referencial
      const configRes = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: 'Config_Rinde!A2:G',
      })
      const configRow = (configRes.data.values || [])[0] || []
      const cuentaAnticipo = configRow[4] || 'Fondo por rendir – Cuenta por cobrar empleados'
      const cuentaSaldoFavor = configRow[5] || 'Saldo a favor del usuario – Reembolso'
      const cuentaSaldoContra = configRow[6] || 'Saldo por devolver del usuario'

      // Monto asignado del fondo (una sola lectura de Fondos, reutilizada para descontar el saldo)
      const fondoIdA = rendRow[10] || ''
      let fondosRows: any[] = []
      let fondoRowIdx = -1
      let montoAsignadoFondo = 0
      if (fondoIdA) {
        const fResA = await sheets.spreadsheets.values.get({
          spreadsheetId,
          range: 'Fondos!A2:I',
        })
        fondosRows = fResA.data.values || []
        fondoRowIdx = fondosRows.findIndex((row: any[]) => row[0] === fondoIdA)
        montoAsignadoFondo = fondoRowIdx !== -1 ? parseFloat(fondosRows[fondoRowIdx][2]) || 0 : 0
      }

      const asiento = generateAsientoContable(id, montoBoletas, montoFacturas, rendRow[5], montoAsignadoFondo, cuentaAnticipo, cuentaSaldoFavor, cuentaSaldoContra)

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
          new Date().toISOString(),
        ])
      })

      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: 'Asientos!A:J',
        valueInputOption: 'RAW',
        requestBody: { values: asientoValues },
      })
      asientoId = asiento.id

      // Descontar saldo del fondo asociado con el TOTAL rendido (boletas+vouchers+facturas)
      // Solo al aprobar (el pago saldo a favor cierra sin tocar el fondo si ya se descontó)
      if (fondoIdA && accion === 'aprobar' && fondoRowIdx !== -1) {
        const fondoRow = fondosRows[fondoRowIdx]
        const saldoActual = parseFloat(fondoRow[3]) || 0
        const nuevoSaldo = Math.max(0, saldoActual - totalRendido)
        const fondoRowNumber = fondoRowIdx + 2

        await sheets.spreadsheets.values.update({
          spreadsheetId,
          range: `Fondos!D${fondoRowNumber}`,
          valueInputOption: 'RAW',
          requestBody: { values: [[String(nuevoSaldo)]] },
        })
      }

      // Actualizar el monto_total real (col E) con el total rendido
      rendRow[4] = String(totalRendido)
    }

    // Registrar información de pago del saldo a favor en los comentarios
    let comentariosFinales = comentarios !== undefined ? comentarios : rendRow[8]
    if (accion === 'pagar_saldo_favor') {
      const pagoInfo = body.pago
      const pagoTexto = pagoInfo
        ? `Pago saldo a favor: fecha=${pagoInfo.fecha || '-'}, medio=${pagoInfo.medio || '-'}, monto=${pagoInfo.monto || '-'}`
        : 'Saldo a favor confirmado y cerrado'
      comentariosFinales = comentariosFinales
        ? `${comentariosFinales} | ${pagoTexto}`
        : pagoTexto
    }

    const updatedRow = [
      rendRow[0],
      rendRow[1],
      fechaCierre,
      nuevoEstado,
      rendRow[4],
      rendRow[5],
      rendRow[6],
      accion === 'aprobar' || accion === 'rechazar' || accion === 'cerrar' || accion === 'pagar_saldo_favor' ? session.email : rendRow[7],
      comentariosFinales,
      asientoId,
      rendRow[10] || '',
    ]

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `Rendiciones!A${rowNumber}:K${rowNumber}`,
      valueInputOption: 'RAW',
      requestBody: { values: [updatedRow] },
    })

    return NextResponse.json({
      success: true,
      estado: nuevoEstado,
      mensaje: accion === 'aprobar' ? 'Rendición aprobada y asiento contable generado' :
               accion === 'rechazar' ? 'Rendición rechazada' :
               accion === 'cerrar' ? 'Rendición cerrada' :
               accion === 'abrir' ? 'Rendición reabierta' :
               accion === 'marcar_terminada' ? 'Rendición marcada como terminada' :
               accion === 'pagar_saldo_favor' ? 'Saldo a favor pagado y rendición cerrada' :
               'Rendición enviada a revisión',
    })
  } catch (error) {
    console.error('❌ Error en PATCH /api/rinde/rendiciones/[id]:', error)
    return NextResponse.json(
      { error: 'Error al actualizar rendición', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    )
  }
}
