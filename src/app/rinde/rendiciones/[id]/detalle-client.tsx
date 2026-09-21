'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft, CheckCircle, XCircle, FileText, DollarSign,
  Plus, Loader2, Eye, MessageSquare, Receipt, ArrowRight
} from 'lucide-react'
import type { SessionPayload } from '@/lib/session'

interface Rendicion {
  id: string
  fecha_creacion: string
  fecha_cierre: string
  estado: string
  monto_total: number
  descripcion: string
  usuario_email: string
  aprobado_por: string
  comentarios: string
  asiento_id: string
  fondo_id?: string
}

interface Gasto {
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
  tipo_documento?: string
}

interface PuenteConfig {
  gastos_activo: boolean
  gastos_sheet_id: string
  admin_email: string
}

interface Puente {
  id: string
  rinde_gasto_id: string
  rendicion_id: string
  gastos_sheet_id: string
  gastos_row_number: number
  pasado_en: string
  aprobado_por: string
}

interface Props {
  session: SessionPayload & { tipo_usuario?: string }
  rendicionId: string
}

export default function RendicionDetalleClient({ session, rendicionId }: Props) {
  const router = useRouter()
  const [rendicion, setRendicion] = useState<Rendicion | null>(null)
  const [gastos, setGastos] = useState<Gasto[]>([])
  const [asiento, setAsiento] = useState<any>(null)
  const [puente, setPuente] = useState<Puente[]>([])
  const [puenteConfig, setPuenteConfig] = useState<PuenteConfig | null>(null)
  const [fondo, setFondo] = useState<{ id: string; monto_asignado: number; saldo: number; observacion: string; estado: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [procesando, setProcesando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showAccionModal, setShowAccionModal] = useState<null | 'aprobar' | 'rechazar' | 'cerrar' | 'enviar_revision' | 'aprobar_con_puente' | 'abrir' | 'pagar_saldo_favor' | 'marcar_terminada'>(null)
  const [comentarios, setComentarios] = useState('')
  const [pago, setPago] = useState({ fecha: new Date().toISOString().split('T')[0], medio: '', monto: '' })
  const [gastosSeleccionados, setGastosSeleccionados] = useState<Set<string>>(new Set())

  const isAdmin = session.rol === 'admin'

  const load = async () => {
    setLoading(true)
    try {
      const [rendRes, puenteRes] = await Promise.all([
        fetch(`/api/rinde/rendiciones/${rendicionId}`, { credentials: 'same-origin' }),
        fetch('/api/rinde/puente', { credentials: 'same-origin' }),
      ])
      const rendData = await rendRes.json()
      if (rendRes.ok) {
        setRendicion(rendData.rendicion)
        setGastos(rendData.gastos || [])
        setAsiento(rendData.asiento)
        setPuente(rendData.puente || [])
        setFondo(rendData.fondo || null)
      } else {
        setError(rendData.error || 'Error al cargar')
      }
      if (puenteRes.ok) {
        const puenteData = await puenteRes.json()
        setPuenteConfig(puenteData.config)
      }
    } catch {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [rendicionId])

  const handleAccion = async (accion: 'aprobar' | 'rechazar' | 'cerrar' | 'enviar_revision' | 'abrir' | 'pagar_saldo_favor' | 'marcar_terminada') => {
    setProcesando(true)
    setError(null)
    try {
      const body: any = { accion, comentarios }
      if (accion === 'pagar_saldo_favor' && pago) {
        body.pago = pago
      }
      const res = await fetch(`/api/rinde/rendiciones/${rendicionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (res.ok) {
        setShowAccionModal(null)
        setComentarios('')
        setPago({ fecha: new Date().toISOString().split('T')[0], medio: '', monto: '' })
        await load()
      } else {
        setError(data.error || 'Error al procesar')
      }
    } catch {
      setError('Error de conexión')
    } finally {
      setProcesando(false)
    }
  }

  const handleAprobarConPuente = async () => {
    setProcesando(true)
    setError(null)
    try {
      const res = await fetch('/api/rinde/puente', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({
          rendicion_id: rendicionId,
          gastos_seleccionados: Array.from(gastosSeleccionados),
          comentarios,
        }),
      })
      const data = await res.json()
      if (res.ok) {
        setShowAccionModal(null)
        setComentarios('')
        setGastosSeleccionados(new Set())
        await load()
      } else {
        setError(data.error || 'Error al ejecutar puente')
      }
    } catch {
      setError('Error de conexión')
    } finally {
      setProcesando(false)
    }
  }

  const handleAgregarGasto = async (gasto: Partial<Gasto>) => {
    setProcesando(true)
    setError(null)
    try {
      const res = await fetch(`/api/rinde/gastos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ ...gasto, rendicion_id: rendicionId }),
      })
      const data = await res.json()
      if (res.ok) {
        await load()
      } else {
        setError(data.error || 'Error al agregar gasto')
      }
    } catch {
      setError('Error de conexión')
    } finally {
      setProcesando(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-50">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
      </div>
    )
  }

  if (!rendicion) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-50">
        <p className="text-gray-600">Rendición no encontrada</p>
      </div>
    )
  }

  const totalGastos = gastos.reduce((sum, g) => sum + g.monto, 0)
  // El usuario solo edita si la rendición está abierta y es suya; una vez terminada, el admin debe abrirla
  const puedeEditar = !(isAdmin) && rendicion.estado === 'abierta' && rendicion.usuario_email === session.email
  // El admin siempre puede administrar (aprobar/reabrir/etc.) pero no "agregar gastos" por el usuario
  const puedeAgregarGastos = !isAdmin && rendicion.estado === 'abierta' && rendicion.usuario_email === session.email
  const puenteActivo = puenteConfig?.gastos_activo === true
  const gastosNoPasados = gastos.filter((g) => !g.pasado_a_gastos)
  const totalSeleccionado = Array.from(gastosSeleccionados).reduce((sum, id) => {
    const g = gastos.find((x) => x.id === id)
    return sum + (g?.monto || 0)
  }, 0)
  const totalBoletas = gastos.filter((g) => g.tipo_documento === 'boleta' || g.tipo_documento === 'voucher').reduce((s, g) => s + g.monto, 0)
  const totalFacturas = gastos.filter((g) => g.tipo_documento === 'factura').reduce((s, g) => s + g.monto, 0)
  // Diferencia real: rendido vs fondo asignado
  const asignado = fondo?.monto_asignado || 0
  const diferencia = totalGastos - asignado

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50">
      <nav className="bg-white border-b border-amber-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push('/rinde')}
                className="p-2 hover:bg-amber-50 rounded-lg text-amber-600"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-lg font-bold text-gray-900">Rendición</h1>
                <p className="text-xs text-gray-500 font-mono">{rendicion.id}</p>
              </div>
            </div>
            <EstadoBadge estado={rendicion.estado} />
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-xl p-3 text-sm">
            {error}
          </div>
        )}

        <div className="bg-white border border-amber-100 rounded-2xl p-6 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Descripción</p>
              <p className="text-lg font-semibold text-gray-900 mt-1">{rendicion.descripcion}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Usuario</p>
              <p className="text-lg font-semibold text-gray-900 mt-1">{rendicion.usuario_email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Fecha de Creación</p>
              <p className="text-gray-900">
                {rendicion.fecha_creacion ? new Date(rendicion.fecha_creacion).toLocaleString('es-CL') : '-'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Fecha de Cierre</p>
              <p className="text-gray-900">
                {rendicion.fecha_cierre ? new Date(rendicion.fecha_cierre).toLocaleString('es-CL') : 'Pendiente'}
              </p>
            </div>
            {rendicion.fondo_id && (
              <div>
                <p className="text-sm text-gray-500">Fondo</p>
                <p className="text-gray-900 font-mono text-sm mt-1">{rendicion.fondo_id}</p>
              </div>
            )}
            {rendicion.aprobado_por && (
              <div>
                <p className="text-sm text-gray-500">Aprobado/Cerrado por</p>
                <p className="text-gray-900">{rendicion.aprobado_por}</p>
              </div>
            )}
            {rendicion.comentarios && (
              <div className="md:col-span-2">
                <p className="text-sm text-gray-500">Comentarios</p>
                <p className="text-gray-900 flex items-start gap-2 mt-1">
                  <MessageSquare className="w-4 h-4 text-gray-400 mt-1 shrink-0" />
                  {rendicion.comentarios}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-amber-100 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Fondo Asignado</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  ${asignado.toLocaleString('es-CL')}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-amber-500" />
            </div>
            {fondo && <p className="text-xs text-gray-400 mt-1">Saldo actual: ${(fondo.saldo || 0).toLocaleString('es-CL')}</p>}
          </div>
          <div className="bg-white border border-amber-100 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Gastos</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  ${totalGastos.toLocaleString('es-CL')}
                </p>
              </div>
              <Receipt className="h-8 w-8 text-amber-500" />
            </div>
          </div>
          <div className="bg-white border border-amber-100 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Boletas/Vouchers</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  ${totalBoletas.toLocaleString('es-CL')}
                </p>
              </div>
              <FileText className="h-8 w-8 text-amber-500" />
            </div>
            <p className="text-xs text-gray-400 mt-1">Facturas: ${totalFacturas.toLocaleString('es-CL')}</p>
          </div>
          <div className={`bg-white border rounded-2xl p-5 shadow-sm ${diferencia !== 0 ? (diferencia > 0 ? 'border-emerald-200' : 'border-rose-200') : 'border-amber-100'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Diferencia</p>
                <p className={`text-2xl font-bold mt-1 ${diferencia > 0 ? 'text-emerald-600' : diferencia < 0 ? 'text-rose-600' : 'text-gray-900'}`}>
                  {diferencia === 0 ? '$0' : `${diferencia > 0 ? '+' : '-'}$${Math.abs(diferencia).toLocaleString('es-CL')}`}
                </p>
              </div>
              <ArrowRight className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-xs text-gray-400 mt-1">
              {diferencia > 0 ? 'Saldo a favor del usuario' : diferencia < 0 ? 'Saldo por devolver' : 'Fondo cuadrado'}
            </p>
          </div>
        </div>

        {asiento && isAdmin && (
          <div className="bg-emerald-50/60 border border-emerald-200 rounded-2xl p-6">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <h3 className="text-lg font-semibold text-emerald-900 flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Asiento Contable
                {asiento.cuadra !== false && (
                  <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">Cuadrado</span>
                )}
              </h3>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => exportAsientoCSV(asiento, rendicion)}
                  className="px-3 py-1.5 bg-white border border-emerald-300 text-emerald-700 text-xs font-semibold rounded-lg hover:bg-emerald-50"
                >
                  CSV
                </button>
                <button
                  onClick={() => exportAsientoPDF(asiento, rendicion)}
                  className="px-3 py-1.5 bg-emerald-700 text-white text-xs font-semibold rounded-lg hover:bg-emerald-800"
                >
                  PDF
                </button>
                <button
                  onClick={() => shareAsiento(asiento, rendicion)}
                  className="px-3 py-1.5 bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-lg hover:bg-emerald-200"
                >
                  Compartir
                </button>
              </div>
            </div>

            <div className="text-xs text-emerald-700 mb-3">
              {asiento.id} · {asiento.fecha} · {asiento.descripcion}
            </div>

            <div className="bg-white rounded-xl overflow-hidden border border-emerald-100">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-emerald-50 text-emerald-900 text-xs uppercase tracking-wider">
                    <th className="px-4 py-2 text-left">Cuenta</th>
                    <th className="px-4 py-2 text-right">Debe</th>
                    <th className="px-4 py-2 text-right">Haber</th>
                  </tr>
                </thead>
                <tbody>
                  {asiento.lineas?.map((l: any, idx: number) => (
                    <tr key={idx} className="border-t border-emerald-50">
                      <td className="px-4 py-2 text-gray-800">{l.cuenta}</td>
                      <td className="px-4 py-2 text-right text-gray-900">{l.debe ? `$${l.debe.toLocaleString('es-CL')}` : ''}</td>
                      <td className="px-4 py-2 text-right text-gray-900">{l.haber ? `$${l.haber.toLocaleString('es-CL')}` : ''}</td>
                    </tr>
                  ))}
                  <tr className="border-t-2 border-emerald-200 bg-emerald-50 font-bold text-emerald-900">
                    <td className="px-4 py-2">Totales</td>
                    <td className="px-4 py-2 text-right">${(asiento.totalDebe || 0).toLocaleString('es-CL')}</td>
                    <td className="px-4 py-2 text-right">${(asiento.totalHaber || 0).toLocaleString('es-CL')}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {puente.length > 0 && isAdmin && (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-amber-900 mb-3 flex items-center gap-2">
              <ArrowRight className="w-5 h-5" />
              Documentos enviados a GastosNX
            </h3>
            <p className="text-sm text-amber-800 mb-4">
              {puente.length} documento(s) de esta rendición fueron aprobados y traspasados a la línea de Gastos.
            </p>
            <div className="space-y-2">
              {puente.map((p) => {
                const gasto = gastos.find((g) => g.id === p.rinde_gasto_id)
                if (!gasto) return null
                return (
                  <div
                    key={p.id}
                    className="bg-white border border-amber-200 rounded-xl p-3 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{gasto.proveedor}</p>
                        <p className="text-xs text-gray-500">
                          {gasto.fecha} · Fila #{p.gastos_row_number} en Gastos
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">${gasto.monto.toLocaleString('es-CL')}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(p.pasado_en).toLocaleDateString('es-CL')}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold text-gray-900">Gastos de la Rendición</h3>
          {puedeAgregarGastos && rendicion.estado === 'abierta' && (
            <button
              onClick={() => router.push(`/rinde/rendiciones/${rendicionId}/nuevo-gasto`)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold rounded-xl shadow-lg shadow-amber-500/30"
            >
              <Plus className="w-4 h-4" />
              Agregar Gasto
            </button>
          )}
        </div>

        {gastos.length === 0 ? (
          <div className="bg-white border border-amber-100 rounded-2xl p-12 text-center">
            <Receipt className="w-12 h-12 mx-auto text-amber-300 mb-3" />
            <p className="text-gray-500">No hay gastos en esta rendición</p>
          </div>
        ) : (
          <div className="bg-white border border-amber-100 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-amber-50 border-b border-amber-100">
                    <th className="text-center px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Comp.</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Fecha</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Proveedor</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">RUT</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Categoría</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Tipo Doc</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Monto</th>
                    {isAdmin && <th className="text-center px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Pasado a Gastos</th>}
                  </tr>
                </thead>
                <tbody>
                  {gastos.map((g) => (
                    <tr key={g.id} className="border-b border-amber-50 hover:bg-amber-50/50">
                      <td className="px-4 py-3 text-center">
                        {g.image_url ? (
                          <a
                            href={g.image_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Ver comprobante"
                            className="inline-block"
                          >
                            <img
                              src={g.image_url}
                              alt="Comprobante"
                              className="w-9 h-9 object-cover rounded-lg border border-amber-200 hover:opacity-80 transition-opacity"
                            />
                          </a>
                        ) : (
                          <span className="text-xs text-gray-300">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">{g.fecha}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{g.proveedor}</td>
                      <td className="px-4 py-3 text-sm text-gray-700 font-mono">{g.rut}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{g.categoria}</td>
                      <td className="px-4 py-3"><TipoDocBadge tipo={g.tipo_documento} /></td>
                      <td className="px-4 py-3 text-right text-sm font-semibold text-gray-900">
                        ${g.monto.toLocaleString('es-CL')}
                      </td>
                      {isAdmin && (
                      <td className="px-4 py-3 text-center">
                        {g.pasado_a_gastos ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
                            <CheckCircle className="w-3 h-3" /> Sí
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                            No
                          </span>
                        )}
                      </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {!isAdmin && rendicion.usuario_email === session.email && rendicion.estado === 'abierta' && (
          <div className="bg-white border border-amber-100 rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">¿Terminaste tus gastos?</h3>
            <p className="text-sm text-gray-500 mb-4">
              Al marcar la rendición como <strong>terminada</strong>, el administrador la revisará. Ya no podrás agregar ni editar gastos hasta que el admin la abra de nuevo.
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setShowAccionModal('marcar_terminada')}
                disabled={gastos.length === 0}
                className="px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-xl shadow-lg shadow-violet-500/30 disabled:opacity-50 flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                Marcar como Terminada
              </button>
            </div>
          </div>
        )}

        {isAdmin && rendicion.estado !== 'aprobada' && rendicion.estado !== 'cerrada' && (
          <div className="bg-white border border-amber-100 rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Acciones del Administrador</h3>
            <div className="flex flex-wrap gap-3">
              {/* Reabrir si está terminada/terminada/en revisión/rechazada */}
              {['terminada', 'en_revision', 'rechazada'].includes(rendicion.estado) && (
                <button
                  onClick={() => setShowAccionModal('abrir')}
                  className="px-4 py-2 bg-blue-100 text-blue-700 font-semibold rounded-xl hover:bg-blue-200"
                >
                  Abrir / Devolver al Usuario
                </button>
              )}
              {rendicion.estado === 'terminada' && (
                <>
                  <button
                    onClick={() => setShowAccionModal('aprobar_con_puente')}
                    disabled={gastos.length === 0}
                    className={`px-4 py-2 font-semibold rounded-xl shadow-lg disabled:opacity-50 flex items-center gap-2 ${
                      puenteActivo
                        ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-amber-500/30 hover:from-amber-600 hover:to-orange-700'
                        : 'bg-emerald-600 text-white shadow-emerald-500/30 hover:bg-emerald-700'
                    }`}
                  >
                    <ArrowRight className="w-4 h-4" />
                    {puenteActivo ? 'Aprobar con Puente' : 'Aprobar'}
                  </button>
                  <button
                    onClick={() => setShowAccionModal('rechazar')}
                    className="px-4 py-2 bg-rose-100 text-rose-700 font-semibold rounded-xl hover:bg-rose-200 flex items-center gap-2"
                  >
                    <XCircle className="w-4 h-4" />
                    Rechazar / Pedir Corrección
                  </button>
                </>
              )}
              {rendicion.estado === 'aprobada' && diferencia > 0 && (
                <button
                  onClick={() => setShowAccionModal('pagar_saldo_favor')}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/30 flex items-center gap-2"
                >
                  <DollarSign className="w-4 h-4" />
                  Confirmar y Pagar Saldo a Favor
                </button>
              )}
            </div>
            {puenteActivo && rendicion.estado === 'terminada' && gastos.length > 0 && (
              <p className="text-xs text-amber-700 mt-3 bg-amber-50 p-2 rounded-lg">
                <strong>Puente activo:</strong> GastosNX está habilitado. Al aprobar podrás elegir qué boletas/vouchers pasan a GastosNX. Las facturas se registran solo en el asiento contable.
              </p>
            )}
            {!puenteActivo && rendicion.estado === 'terminada' && (
              <p className="text-xs text-gray-500 mt-3">
                <strong>Puente inactivo:</strong> esta empresa no usa GastosNX. La aprobación genera el asiento contable de respaldo y descuenta del fondo.
              </p>
            )}
            {diferencia < 0 && rendicion.estado === 'terminada' && (
              <p className="text-xs text-rose-600 mt-3 bg-rose-50 p-2 rounded-lg">
                Saldo en contra: el usuario rindió menos que el fondo asignado (${asignado.toLocaleString('es-CL')}). Puedes dejarlo abierto para que complete, aprobar y reflejar el saldo, o rechazar para pedir corrección.
              </p>
            )}
          </div>
        )}
      </div>

      {showAccionModal === 'aprobar_con_puente' && (
        <PuenteModal
          gastos={gastosNoPasados}
          seleccionados={gastosSeleccionados}
          setSeleccionados={setGastosSeleccionados}
          totalSeleccionado={totalSeleccionado}
          comentarios={comentarios}
          setComentarios={setComentarios}
          puenteActivo={puenteActivo}
          onConfirm={handleAprobarConPuente}
          onClose={() => {
            setShowAccionModal(null)
            setComentarios('')
            setGastosSeleccionados(new Set())
          }}
          procesando={procesando}
        />
      )}

      {showAccionModal && showAccionModal !== 'aprobar_con_puente' && (
        <AccionModal
          accion={showAccionModal}
          comentarios={comentarios}
          setComentarios={setComentarios}
          pago={pago}
          setPago={setPago}
          diferencia={diferencia}
          onConfirm={() => handleAccion(showAccionModal as 'aprobar' | 'rechazar' | 'cerrar' | 'enviar_revision' | 'abrir' | 'pagar_saldo_favor' | 'marcar_terminada')}
          onClose={() => {
            setShowAccionModal(null)
            setComentarios('')
            setPago({ fecha: new Date().toISOString().split('T')[0], medio: '', monto: '' })
          }}
          procesando={procesando}
        />
      )}
    </div>
  )
}

function EstadoBadge({ estado }: { estado: string }) {
  const map: Record<string, { label: string; className: string }> = {
    abierta: { label: 'Abierta', className: 'bg-blue-100 text-blue-700' },
    terminada: { label: 'Terminada', className: 'bg-violet-100 text-violet-700' },
    en_revision: { label: 'En Revisión', className: 'bg-amber-100 text-amber-700' },
    aprobada: { label: 'Aprobada', className: 'bg-emerald-100 text-emerald-700' },
    rechazada: { label: 'Rechazada', className: 'bg-rose-100 text-rose-700' },
    cerrada: { label: 'Cerrada', className: 'bg-gray-100 text-gray-700' },
  }
  const config = map[estado] || map.abierta
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${config.className}`}>
      {config.label}
    </span>
  )
}

function TipoDocBadge({ tipo }: { tipo?: string }) {
  const map: Record<string, { label: string; className: string; pasa: boolean }> = {
    boleta: { label: 'Boleta', className: 'bg-emerald-100 text-emerald-700', pasa: true },
    voucher: { label: 'Voucher', className: 'bg-teal-100 text-teal-700', pasa: true },
    factura: { label: 'Factura', className: 'bg-blue-100 text-blue-700', pasa: false },
    sin_comprobante: { label: 'Sin Comp.', className: 'bg-gray-100 text-gray-600', pasa: false },
  }
  const config = map[tipo || 'boleta'] || map.boleta
  return (
    <span
      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${config.className}`}
      title={config.pasa ? 'Pasa al puente de GastosNX' : 'No pasa al puente de GastosNX'}
    >
      {config.label}
    </span>
  )
}

function AccionModal({
  accion,
  comentarios,
  setComentarios,
  pago,
  setPago,
  diferencia,
  onConfirm,
  onClose,
  procesando,
}: {
  accion: string
  comentarios: string
  setComentarios: (s: string) => void
  pago: { fecha: string; medio: string; monto: string }
  setPago: (p: { fecha: string; medio: string; monto: string }) => void
  diferencia: number
  onConfirm: () => void
  onClose: () => void
  procesando: boolean
}) {
  const titles: Record<string, string> = {
    aprobar: 'Aprobar Rendición',
    rechazar: 'Rechazar Rendición',
    cerrar: 'Cerrar Rendición',
    enviar_revision: 'Enviar a Revisión',
    abrir: 'Abrir Rendición',
    marcar_terminada: 'Marcar como Terminada',
    pagar_saldo_favor: 'Pagar Saldo a Favor',
  }
  const esPago = accion === 'pagar_saldo_favor'
  const esMarcar = accion === 'marcar_terminada' || accion === 'abrir'
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full">
        <div className="p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">{titles[accion] || 'Confirmar'}</h3>

          {esMarcar && (
            <p className="text-sm text-gray-600 mb-4">
              {accion === 'marcar_terminada'
                ? 'Al confirmar, la rendición se envía al administrador y dejarás de poder editarla.'
                : 'La rendición vuelve a quedar abierta para que el usuario pueda seguir agregando o corrigiendo gastos.'}
            </p>
          )}

          {esPago && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-4">
              <p className="text-sm text-emerald-800 mb-1">
                Saldo a favor del usuario: <strong>${diferencia.toLocaleString('es-CL')}</strong>
              </p>
              <p className="text-xs text-emerald-700">
                Registra los datos referenciales del pago. Esto queda como respaldo en el asiento y cierra la rendición.
              </p>
            </div>
          )}

          {esPago && (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de pago</label>
                <input
                  type="date"
                  value={pago.fecha}
                  onChange={(e) => setPago({ ...pago, fecha: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Medio de pago</label>
                <select
                  value={pago.medio}
                  onChange={(e) => setPago({ ...pago, medio: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">Selecciona...</option>
                  <option value="Transferencia">Transferencia</option>
                  <option value="Efectivo">Efectivo</option>
                  <option value="Cheque">Cheque</option>
                  <option value="Pago de remuneración">Pago de remuneración</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Monto devuelto</label>
                <input
                  type="number"
                  value={pago.monto}
                  onChange={(e) => setPago({ ...pago, monto: e.target.value })}
                  placeholder={diferencia.toLocaleString('es-CL')}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          )}

          {!esPago && !esMarcar && (
            <>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Comentarios {accion === 'rechazar' && <span className="text-rose-500">*</span>}
              </label>
              <textarea
                value={comentarios}
                onChange={(e) => setComentarios(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="Escribe un comentario..."
              />
            </>
          )}

          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              disabled={procesando}
              className="flex-1 px-4 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold rounded-xl disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={onConfirm}
              disabled={procesando || (accion === 'rechazar' && !comentarios)}
              className={`flex-1 px-4 py-2.5 text-white font-semibold rounded-xl shadow-lg disabled:opacity-50 ${
                accion === 'pagar_saldo_favor'
                  ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/30'
                  : 'bg-gradient-to-r from-amber-500 to-orange-600 shadow-amber-500/30'
              }`}
            >
              {procesando ? 'Procesando...' : 'Confirmar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function exportAsientoCSV(asiento: any, rendicion: any) {
  const lines: (string | number)[][] = [
    ['Asiento contable', asiento?.id || ''],
    ['Rendicion', rendicion?.id || ''],
    ['Fecha', asiento?.fecha || ''],
    ['Descripcion', asiento?.descripcion || ''],
    [],
    ['Cuenta', 'Debe', 'Haber'],
    ...(asiento?.lineas || []).map((l: any) => [l.cuenta, l.debe || 0, l.haber || 0]),
    ['Totales', asiento?.totalDebe || 0, asiento?.totalHaber || 0],
  ]
  const csv = lines.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `asiento_${rendicion?.id || 'rendicion'}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

function exportAsientoPDF(asiento: any, rendicion: any) {
  const w = window.open('', '_blank')
  if (!w) return
  w.document.write(`
    <html><head><title>Asiento ${asiento?.id || ''}</title>
    <style>
      body{font-family:Arial,sans-serif;padding:24px;color:#111}
      h1{font-size:18px;margin:0 0 4px}
      .meta{font-size:12px;color:#555;margin-bottom:16px}
      table{width:100%;border-collapse:collapse;font-size:13px}
      th,td{border:1px solid #ddd;padding:8px 10px;text-align:left}
      th{background:#f4f4f4}
      td.num,th.num{text-align:right}
      .totals{font-weight:700;background:#f0fdf4}
      .btn{text-align:right;margin-bottom:12px}
    </style></head><body>
    <div class="btn"><button onclick="window.print()">Imprimir / Guardar PDF</button></div>
    <h1>Asiento Contable</h1>
    <div class="meta">${asiento?.id || ''} &nbsp;·&nbsp; ${asiento?.fecha || ''} &nbsp;·&nbsp; ${asiento?.descripcion || ''}</div>
    <table><thead><tr><th>Cuenta</th><th class="num">Debe</th><th class="num">Haber</th></tr></thead>
    <tbody>
      ${(asiento?.lineas || []).map((l: any) => `<tr><td>${l.cuenta}</td><td class="num">${l.debe ? '$' + Number(l.debe).toLocaleString('es-CL') : ''}</td><td class="num">${l.haber ? '$' + Number(l.haber).toLocaleString('es-CL') : ''}</td></tr>`).join('')}
      <tr class="totals"><td>Totales</td><td class="num">$${Number(asiento?.totalDebe || 0).toLocaleString('es-CL')}</td><td class="num">$${Number(asiento?.totalHaber || 0).toLocaleString('es-CL')}</td></tr>
    </tbody></table>
    </body></html>`)
  w.document.close()
}

function shareAsiento(asiento: any, rendicion: any) {
  const text = encodeURIComponent(
    `Asiento contable ${asiento?.id || ''} · ${asiento?.fecha || ''}\nRendición: ${rendicion?.id || ''}\n${(asiento?.lineas || []).map((l: any) => `• ${l.cuenta}: Debe $${(l.debe||0).toLocaleString('es-CL')} / Haber $${(l.haber||0).toLocaleString('es-CL')}`).join('\n')}\nDebe total: $${(asiento?.totalDebe||0).toLocaleString('es-CL')} · Haber total: $${(asiento?.totalHaber||0).toLocaleString('es-CL')}`
  )
  const choice = window.confirm('¿Cómo quieres compartir el asiento?\n\nAceptar = WhatsApp\nCancelar = Correo')
  if (choice) {
    window.open(`https://wa.me/?text=${text}`, '_blank')
  } else {
    window.location.href = `mailto:?subject=Asiento%20contable%20${encodeURIComponent(asiento?.id || '')}&body=${text}`
  }
}

function PuenteModal({
  gastos,
  seleccionados,
  setSeleccionados,
  totalSeleccionado,
  comentarios,
  setComentarios,
  puenteActivo,
  onConfirm,
  onClose,
  procesando,
}: {
  gastos: Gasto[]
  seleccionados: Set<string>
  setSeleccionados: (s: Set<string>) => void
  totalSeleccionado: number
  comentarios: string
  setComentarios: (s: string) => void
  puenteActivo: boolean
  onConfirm: () => void
  onClose: () => void
  procesando: boolean
}) {
  const toggleGasto = (id: string) => {
    const next = new Set(seleccionados)
    if (next.has(id)) {
      next.delete(id)
    } else {
      next.add(id)
    }
    setSeleccionados(next)
  }

  const puedePasar = (g: Gasto) => g.tipo_documento === 'boleta' || g.tipo_documento === 'voucher'

  const toggleAll = () => {
    const pasables = gastos.filter(puedePasar)
    if (seleccionados.size === pasables.length && pasables.length > 0) {
      setSeleccionados(new Set())
    } else {
      setSeleccionados(new Set(pasables.map((g) => g.id)))
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gradient-to-r from-amber-500 to-orange-600 p-6 text-white">
          <h3 className="text-xl font-bold">Aprobar Rendición con Puente</h3>
          <p className="text-amber-100 text-sm mt-1">
            {puenteActivo
              ? 'Selecciona qué gastos pasarán a GastosNX. Los demás se mantienen solo en RindeNX.'
              : 'El puente no está activo. Puedes aprobar la rendición sin pasar gastos a GastosNX.'}
          </p>
        </div>

        <div className="p-6 space-y-4">
          {puenteActivo && gastos.length > 0 && (
            <div className="flex items-center justify-between bg-amber-50 p-3 rounded-xl">
              <label className="flex items-center gap-2 text-sm font-medium text-amber-900 cursor-pointer">
                <input
                  type="checkbox"
                  checked={gastos.filter(puedePasar).length > 0 && seleccionados.size === gastos.filter(puedePasar).length}
                  onChange={toggleAll}
                  className="w-4 h-4 rounded border-amber-300 text-amber-600 focus:ring-amber-500"
                />
                {seleccionados.size === 0 ? 'Seleccionar todos (boletas/vouchers)' : 'Deseleccionar todos'}
              </label>
              <div className="text-sm">
                <span className="text-amber-700">Total a pasar: </span>
                <span className="font-bold text-amber-900">${totalSeleccionado.toLocaleString('es-CL')}</span>
              </div>
            </div>
          )}

          {gastos.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Receipt className="w-12 h-12 mx-auto text-gray-300 mb-2" />
              <p>No hay gastos para seleccionar</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {gastos.map((g) => (
                <label
                  key={g.id}
                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                    seleccionados.has(g.id)
                      ? 'bg-amber-50 border-amber-300'
                      : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={seleccionados.has(g.id)}
                    onChange={() => toggleGasto(g.id)}
                    disabled={!puenteActivo || !puedePasar(g)}
                    className="w-4 h-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                  />
                  <div className="flex-1 grid grid-cols-2 sm:grid-cols-5 gap-2 text-sm">
                    <div>
                      <p className="text-xs text-gray-500">Fecha</p>
                      <p className="text-gray-900">{g.fecha}</p>
                    </div>
                    <div className="sm:col-span-2">
                      <p className="text-xs text-gray-500">Proveedor</p>
                      <p className="text-gray-900 font-medium">{g.proveedor}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Tipo</p>
                      <TipoDocBadge tipo={g.tipo_documento} />
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Monto</p>
                      <p className="font-semibold text-gray-900">${g.monto.toLocaleString('es-CL')}</p>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Comentarios</label>
            <textarea
              value={comentarios}
              onChange={(e) => setComentarios(e.target.value)}
              rows={2}
              className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="Comentarios sobre la aprobación..."
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              disabled={procesando}
              className="flex-1 px-4 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold rounded-xl disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={onConfirm}
              disabled={procesando}
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold rounded-xl shadow-lg shadow-amber-500/30 disabled:opacity-50"
            >
              {procesando ? 'Procesando...' : puenteActivo ? `Aprobar y Pasar ${seleccionados.size} Gasto(s)` : 'Aprobar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
