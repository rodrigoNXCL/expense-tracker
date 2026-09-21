import { NextRequest, NextResponse } from 'next/server'
import { getSheets } from '@/lib/sheets'
import { readSession } from '@/lib/session'
import {
  getRindeSpreadsheetId,
  generateAsientoContable,
} from '@/lib/rinde-helpers'

export const dynamic = 'force-dynamic'

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
    if (rendRow[3] === 'cerrada' || rendRow[3] === 'aprobada' || rendRow[3] === 'rechazada') {
      return NextResponse.json({ error: 'La rendición ya fue procesada' }, { status: 400 })
    }

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

    const puenteResults: any[] = []
    if (gastosParaPasar.length > 0) {
      const ahora = new Date().toISOString()
      const gastosParaGastos = gastosParaPasar.map(({ gasto }) => [
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
      ])

      const appendRes = await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: 'Gastos!A:L',
        valueInputOption: 'RAW',
        requestBody: { values: gastosParaGastos },
      })

      const updatedRange = appendRes.data.updates?.updatedRange || ''
      const match = updatedRange.match(/A(\d+):L(\d+)/)
      const startRow = match ? parseInt(match[1]) : 0
      const endRow = match ? parseInt(match[2]) : startRow + gastosParaGastos.length - 1

      for (let i = 0; i < gastosParaPasar.length; i++) {
        const { gasto, rowIndex } = gastosParaPasar[i]
        const gastosRow = startRow + i

        await sheets.spreadsheets.values.update({
          spreadsheetId,
          range: `GastosRinde!N${rowIndex}`,
          valueInputOption: 'RAW',
          requestBody: { values: [['TRUE']] },
        })

        const puenteId = `PTE-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}-${i}`
        await sheets.spreadsheets.values.append({
          spreadsheetId,
          range: 'Puente!A:F',
          valueInputOption: 'RAW',
          requestBody: {
            values: [[
              puenteId,
              gasto.id,
              rendicion_id,
              String(gastosRow),
              new Date().toISOString(),
              session.email,
            ]],
          },
        })
        puenteResults.push({ id: puenteId, gasto_id: gasto.id, gastos_row: gastosRow })
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

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Asientos!A:J',
      valueInputOption: 'RAW',
      requestBody: { values: asientoValues },
    })

    const rendRowNumber = rendRowIndex + 2
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

    // Descontar saldo del fondo asociado con el TOTAL rendido (boletas+vouchers+facturas)
    if (fondoId && fondoRowIdx !== -1) {
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

    return NextResponse.json({
      success: true,
      estado: 'aprobada',
      rendicion_id,
      gastos_pasados: puenteResults.length,
      asiento_id: asiento.id,
      total_rendido: totalRendido,
      saldo_diferencia: asiento.diferencia,
      mensaje: puenteResults.length > 0
        ? `Rendición aprobada. ${puenteResults.length} gasto(s) pasado(s) a GastosNX.`
        : 'Rendición aprobada sin pasar gastos a GastosNX.',
    })
  } catch (error) {
    console.error('❌ Error en POST /api/rinde/puente:', error)
    return NextResponse.json(
      { error: 'Error al ejecutar puente', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    )
  }
}
