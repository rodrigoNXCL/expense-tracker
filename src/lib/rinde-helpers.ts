import type { SessionPayload } from './session'

export type RindeSession = SessionPayload & {
  tipo_usuario?: 'gastos' | 'rinde' | 'ambos'
}

export function getRindeSpreadsheetId(session: RindeSession | SessionPayload): string | null {
  const s = session as RindeSession
  if (s.tipo_usuario === 'gastos') {
    return null
  }
  return s.sheet_id_asociado || null
}

export function generateAsientoContable(
  rendicionId: string,
  montoBoletas: number,
  montoFacturas: number,
  descripcion: string,
  montoAsignadoFondo: number = 0,
  cuentaAnticipo: string = 'Fondo por rendir – Cuenta por cobrar empleados',
  cuentaSaldoFavor: string = 'Saldo a favor del usuario – Reembolso',
  cuentaSaldoContra: string = 'Saldo por devolver del usuario'
) {
  const fecha = new Date().toISOString().split('T')[0]
  const totalRendido = montoBoletas + montoFacturas
  const asignado = Math.max(0, montoAsignadoFondo || 0)
  // Diferencia: si rindió más que el fondo, hay saldo a favor del usuario (crédito). Si rindió menos, debe devolver (débito).
  const diferencia = totalRendido - asignado

  const lineas: { cuenta: string; debe: number; haber: number }[] = [
    { cuenta: 'Gastos operacionales – Facturas', debe: round2(montoFacturas), haber: 0 },
    { cuenta: 'Gastos operacionales – Boletas/Vouchers', debe: round2(montoBoletas), haber: 0 },
  ]

  if (diferencia < 0) {
    // Rindió menos: saldo que el usuario debe devolver (cuenta por cobrar)
    lineas.push({ cuenta: `Saldo en contra (${cuentaSaldoContra})`, debe: round2(-diferencia), haber: 0 })
  }

  lineas.push({ cuenta: cuentaAnticipo, debe: 0, haber: round2(asignado) })

  if (diferencia > 0) {
    // Rindió más: saldo a favor del usuario (reembolso, cuenta por pagar)
    lineas.push({ cuenta: `Saldo a favor (${cuentaSaldoFavor})`, debe: 0, haber: round2(diferencia) })
  }

  const totalDebe = round2(lineas.reduce((s, l) => s + l.debe, 0))
  const totalHaber = round2(lineas.reduce((s, l) => s + l.haber, 0))

  return {
    id: `AST-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
    rendicion_id: rendicionId,
    fecha,
    tipo: 'rendicion',
    lineas,
    totalDebe,
    totalHaber,
    cuadra: Math.abs(totalDebe - totalHaber) < 0.01,
    total: totalRendido,
    asignado,
    diferencia,
    descripcion: `Rendición: ${descripcion}`,
  }
}

function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100
}

export const RINDE_TABS = [
  { title: 'Rendiciones', headers: ['id', 'fecha_creacion', 'fecha_cierre', 'estado', 'monto_total', 'descripcion', 'usuario_email', 'aprobado_por', 'comentarios', 'asiento_id', 'fondo_id'] },
  { title: 'GastosRinde', headers: ['id', 'rendicion_id', 'fecha', 'rut', 'proveedor', 'monto', 'categoria', 'boleta_numero', 'giro', 'notas', 'image_url', 'creado_por', 'creado_en', 'pasado_a_gastos', 'tipo_documento'] },
  { title: 'Asientos', headers: ['id', 'rendicion_id', 'fecha', 'tipo', 'cuenta', 'debe', 'haber', 'descripcion', 'creado_por', 'creado_en'] },
  { title: 'Puente', headers: ['id', 'rinde_gasto_id', 'rendicion_id', 'gastos_row_number', 'pasado_en', 'aprobado_por'] },
  { title: 'Fondos', headers: ['id', 'usuario_email', 'monto_asignado', 'saldo', 'observacion', 'fecha_asignacion', 'estado', 'asignado_por', 'empresa'] },
  { title: 'Config_Rinde', headers: ['empresa', 'rinde_activo', 'gastos_activo', 'admin_email', 'cuenta_anticipo', 'cuenta_saldo_favor', 'cuenta_saldo_contra'] },
] as const

export async function ensureRindeStructure(sheets: any, spreadsheetId: string) {
  const meta = await sheets.spreadsheets.get({ spreadsheetId })
  const existing = meta.data.sheets?.map((s: any) => s.properties.title) || []

  for (const tab of RINDE_TABS) {
    if (!existing.includes(tab.title)) {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: { requests: [{ addSheet: { properties: { title: tab.title } } }] },
      })
    }
    const headerRes = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${tab.title}!A1:${String.fromCharCode(64 + tab.headers.length)}1`,
    })
    if (!headerRes.data.values?.[0]?.length) {
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${tab.title}!A1:${String.fromCharCode(64 + tab.headers.length)}1`,
        valueInputOption: 'RAW',
        requestBody: { values: [tab.headers] },
      })
    }
  }
}

export const TIPOS_DOCUMENTO = ['boleta', 'factura', 'voucher', 'sin_comprobante'] as const
export type TipoDocumento = (typeof TIPOS_DOCUMENTO)[number]

export function documentoPasaAGastos(tipo: string): boolean {
  return tipo === 'boleta' || tipo === 'voucher'
}
