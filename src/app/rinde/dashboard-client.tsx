'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft, Plus, FileText, CheckCircle, Clock, XCircle,
  TrendingUp, Loader2, LogOut, ArrowRight, Wallet, Shield, Layers, Receipt
} from 'lucide-react'
import type { SessionPayload } from '@/lib/session'

interface Rendicion {
  id: string
  fecha_creacion: string
  fecha_cierre: string
  estado: 'abierta' | 'terminada' | 'en_revision' | 'aprobada' | 'rechazada' | 'cerrada'
  monto_total: number
  descripcion: string
  usuario_email: string
  aprobado_por: string
  comentarios: string
  fondo_id?: string
  asignado?: number
  diferencia?: number
}

interface Fondo {
  id: string
  usuario_email: string
  monto_asignado: number
  saldo: number
  observacion: string
  fecha_asignacion: string
  estado: string
  asignado_por: string
  empresa: string
}

interface Props {
  session: SessionPayload & { tipo_usuario?: string }
}

export default function RindeDashboardClient({ session }: Props) {
  const router = useRouter()
  const [rendiciones, setRendiciones] = useState<Rendicion[]>([])
  const [fondos, setFondos] = useState<Fondo[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'fondos' | 'rendiciones'>('fondos')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedFondoForRendicion, setSelectedFondoForRendicion] = useState<string>('')
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pendingFondoId, setPendingFondoId] = useState<string | null>(null)
  const [showCountModal, setShowCountModal] = useState(false)
  const [createdRendicionId, setCreatedRendicionId] = useState<string | null>(null)

  const isAdmin = session.rol === 'admin'

  const loadData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [resRend, resFondos] = await Promise.all([
        fetch('/api/rinde/rendiciones', { credentials: 'same-origin' }),
        fetch('/api/rinde/fondos', { credentials: 'same-origin' }),
      ])

      const dataRend = await resRend.json()
      const dataFondos = await resFondos.json()

      if (resRend.ok) {
        setRendiciones(dataRend.rendiciones || [])
      }
      if (resFondos.ok) {
        setFondos(dataFondos.fondos || [])
      }
    } catch {
      setError('Error de conexión con el servidor')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleCreateRendicion = async (descripcion: string, montoEstimado: number, fondoId: string, modo: 'captura' | 'detalle' = 'detalle') => {
    setCreating(true)
    setError(null)
    try {
      const res = await fetch('/api/rinde/rendiciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ descripcion, monto_estimado: montoEstimado, fondo_id: fondoId || undefined }),
      })
      const data = await res.json()
      if (res.ok) {
        setShowCreateModal(false)
        setShowCountModal(false)
        if (modo === 'captura') {
          router.push(`/rinde/rendiciones/${data.rendicion.id}/nuevo-gasto`)
        } else {
          router.push(`/rinde/rendiciones/${data.rendicion.id}`)
        }
      } else {
        setError(data.error || 'Error al crear rendición')
      }
    } catch {
      setError('Error de conexión')
    } finally {
      setCreating(false)
    }
  }

  // Flujo rápido "Rendir contra este Fondo": una sola rendición por fondo (abierta)
  const getRendicionAbiertaDelFondo = (fondoId: string) => {
    return rendiciones.find((r) => r.fondo_id === fondoId && r.estado === 'abierta')
  }

  const handleRendirContraFondo = async (modo: 'captura' | 'detalle') => {
    if (!pendingFondoId) return
    const fondo = activeFondos.find((f) => f.id === pendingFondoId)
    if (!fondo) return
    setError(null)

    // Si ya existe una rendición abierta para este fondo, se reutiliza (el usuario entra varias veces a agregar gastos)
    const existente = getRendicionAbiertaDelFondo(pendingFondoId)
    if (existente) {
      setShowCountModal(false)
      if (modo === 'captura') {
        router.push(`/rinde/rendiciones/${existente.id}/nuevo-gasto`)
      } else {
        router.push(`/rinde/rendiciones/${existente.id}`)
      }
      return
    }

    const fondoSaldo = fondo.saldo || 0
    const glosaDefault = fondo.observacion
      ? `Rendición — ${fondo.observacion}`
      : `Rendición contra fondo ${pendingFondoId.substring(0, 8)}`
    await handleCreateRendicion(glosaDefault, fondoSaldo, pendingFondoId, modo)
  }

  // Al pulsar el botón "Rendir contra este Fondo" en la tarjeta del fondo
  const preguntarCantidad = (fondoId: string) => {
    setPendingFondoId(fondoId)
    setShowCountModal(true)
  }

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'same-origin' })
    router.push('/login')
  }

  const activeFondos = fondos.filter((f) => String(f.estado).toLowerCase() === 'en_curso')
  const totalMontoFondos = activeFondos.reduce((sum, f) => sum + f.monto_asignado, 0)
  const totalSaldoFondos = activeFondos.reduce((sum, f) => sum + f.saldo, 0)

  const rendicionesPendientes = rendiciones.filter((r) => r.estado === 'en_revision' || r.estado === 'abierta')

  return (
    <div className="min-h-screen bg-slate-50/60 text-slate-800">
      {/* ===== NAVBAR ELEGANTE ===== */}
      <nav className="bg-white border-b border-slate-200/80 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              {(session.tipo_usuario === 'ambos' || isAdmin) && (
                <button
                  onClick={() => router.push('/dashboard')}
                  className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-800 transition-colors"
                  title="Volver a GastosNX"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
              )}
              <div className="w-9 h-9 bg-gradient-to-tr from-amber-500 to-amber-600 rounded-lg flex items-center justify-center shadow-xs">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base font-bold text-slate-900 tracking-tight">RindeNX</h1>
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200/60">
                    {isAdmin ? 'Administrador' : 'Rendidor'}
                  </span>
                </div>
                <p className="text-xs text-slate-500">{session.empresa_nombre || session.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {isAdmin && (
                <button
                  onClick={() => router.push('/rinde/puente')}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-amber-700 hover:bg-amber-50/80 border border-slate-200 hover:border-amber-200 rounded-lg transition-all"
                >
                  <Layers className="w-3.5 h-3.5 text-amber-600" />
                  Puente GastosNX
                </button>
              )}

              <div className="h-4 w-[1px] bg-slate-200 hidden sm:block" />

              <div className="text-right hidden sm:block">
                <p className="text-xs font-medium text-slate-700">{session.email}</p>
              </div>

              <button
                onClick={handleLogout}
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                title="Cerrar sesión"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* ===== CONTENIDO PRINCIPAL ===== */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-xl p-4 text-sm flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="text-xs underline font-semibold">Cerrar</button>
          </div>
        )}

        {/* ===== METRICAS ARRIBA (FINAS Y SUBTILES) ===== */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Fondos Activos</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{activeFondos.length}</p>
              <p className="text-xs text-slate-500 mt-1">Total asignado: ${totalMontoFondos.toLocaleString('es-CL')}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
              <Wallet className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Saldo Disponible</p>
              <p className="text-2xl font-bold text-emerald-600 mt-1">${totalSaldoFondos.toLocaleString('es-CL')}</p>
              <p className="text-xs text-slate-500 mt-1">Para rendiciones futuras</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Por Revisar / Abiertas</p>
              <p className="text-2xl font-bold text-amber-600 mt-1">{rendicionesPendientes.length}</p>
              <p className="text-xs text-slate-500 mt-1">Rendiciones requeridas</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
              <Clock className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Rendiciones Aprobadas</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">
                {rendiciones.filter((r) => r.estado === 'aprobada' || r.estado === 'cerrada').length}
              </p>
              <p className="text-xs text-slate-500 mt-1">Cerradas y contabilizadas</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center border border-slate-200">
              <CheckCircle className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* ===== PESTAÑAS PRINCIPALES ===== */}
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
          {/* Header de pestañas */}
          <div className="border-b border-slate-200/80 px-6 pt-4 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <button
                onClick={() => setActiveTab('fondos')}
                className={`pb-3 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
                  activeTab === 'fondos'
                    ? 'border-amber-500 text-amber-700'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Wallet className="w-4 h-4" />
                {isAdmin ? 'Fondos en Curso' : 'Mis Fondos Activos'}
                <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-slate-200/70 text-slate-700">
                  {activeFondos.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('rendiciones')}
                className={`pb-3 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
                  activeTab === 'rendiciones'
                    ? 'border-amber-500 text-amber-700'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <FileText className="w-4 h-4" />
                {isAdmin ? 'Rendiciones de Equipo' : 'Mis Rendiciones'}
                <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-slate-200/70 text-slate-700">
                  {rendiciones.length}
                </span>
              </button>
            </div>

            <div className="pb-3 sm:pb-0 flex items-center gap-2">
              {isAdmin ? (
                <button
                  onClick={() => router.push('/rinde/fondos')}
                  className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Asignar Nuevo Fondo
                </button>
              ) : (
                <button
                  onClick={() => {
                    setSelectedFondoForRendicion('')
                    setShowCreateModal(true)
                  }}
                  className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Nueva Rendición
                </button>
              )}
            </div>
          </div>

          {/* ===== TAB 1: FONDOS EN CURSO ===== */}
          {activeTab === 'fondos' && (
            <div className="p-6 space-y-4">
              {loading ? (
                <div className="py-12 text-center text-slate-400 flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin text-amber-500" />
                  Cargando fondos...
                </div>
              ) : activeFondos.length === 0 ? (
                <div className="py-12 text-center border-2 border-dashed border-slate-200 rounded-xl">
                  <Wallet className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-slate-600 font-medium text-sm">
                    {isAdmin ? 'No hay fondos asignados en curso' : 'No tienes fondos activos asignados'}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    {isAdmin
                      ? 'Asigna un fondo a un colaborador para que pueda rendir sus gastos.'
                      : 'Solicita a tu administrador la asignación de un fondo para rendir.'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {activeFondos.map((f) => (
                    <div
                      key={f.id}
                      className="border border-slate-200/80 hover:border-amber-300 rounded-xl p-5 bg-white hover:shadow-xs transition-all flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-slate-500 truncate max-w-[180px]">
                            {f.usuario_email}
                          </span>
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                            En curso
                          </span>
                        </div>

                        <p className="text-sm font-semibold text-slate-900 line-clamp-2">{f.observacion}</p>

                        <div className="pt-2 border-t border-slate-100 flex items-baseline justify-between">
                          <div>
                            <p className="text-[10px] text-slate-400 uppercase tracking-wider">Saldo Disponible</p>
                            <p className="text-lg font-bold text-emerald-600">
                              ${f.saldo.toLocaleString('es-CL')}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] text-slate-400 uppercase tracking-wider">Asignado</p>
                            <p className="text-xs font-semibold text-slate-600">
                              ${f.monto_asignado.toLocaleString('es-CL')}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="pt-4 mt-2">
                        {!isAdmin ? (
                          <button
                            onClick={() => preguntarCantidad(f.id)}
                            className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold rounded-lg border border-amber-600/30 transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                          >
                            Rendir contra este Fondo
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => router.push('/rinde/fondos')}
                            className="w-full py-1.5 text-xs text-slate-500 hover:text-slate-800 text-center font-medium transition-colors"
                          >
                            Gestionar Fondos →
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ===== TAB 2: RENDICIONES ===== */}
          {activeTab === 'rendiciones' && (
            <div>
              {loading ? (
                <div className="py-12 text-center text-slate-400 flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin text-amber-500" />
                  Cargando rendiciones...
                </div>
              ) : rendiciones.length === 0 ? (
                <div className="py-12 text-center border-2 border-dashed border-slate-200 rounded-xl m-6">
                  <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-slate-600 font-medium text-sm">Sin rendiciones registradas</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                        <th className="px-6 py-3">ID Rendición</th>
                        <th className="px-6 py-3">Descripción</th>
                        {isAdmin && <th className="px-6 py-3">Rendidor</th>}
                        <th className="px-6 py-3 text-center">Estado</th>
                        <th className="px-6 py-3 text-right">Monto Declarado</th>
                        <th className="px-6 py-3">Fecha</th>
                        <th className="px-6 py-3 text-right">Acción</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                      {rendiciones.map((r) => (
                        <tr
                          key={r.id}
                          className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                          onClick={() => router.push(`/rinde/rendiciones/${r.id}`)}
                        >
                          <td className="px-6 py-3.5 font-mono text-xs text-slate-500">{r.id.substring(0, 12)}</td>
                          <td className="px-6 py-3.5 font-medium text-slate-900 max-w-xs truncate">{r.descripcion}</td>
                          {isAdmin && <td className="px-6 py-3.5 text-xs text-slate-600">{r.usuario_email}</td>}
                          <td className="px-6 py-3.5 text-center">
                            <EstadoBadge estado={r.estado} />
                          </td>
                          <td className="px-6 py-3.5 text-right font-semibold text-slate-900">
                            ${(r.monto_total || 0).toLocaleString('es-CL')}
                          </td>
                          <td className="px-6 py-3.5 text-xs text-slate-500">
                            {r.fecha_creacion ? new Date(r.fecha_creacion).toLocaleDateString('es-CL') : '-'}
                          </td>
                          <td className="px-6 py-3.5 text-right">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                router.push(`/rinde/rendiciones/${r.id}`)
                              }}
                              className="text-xs font-semibold text-amber-600 hover:text-amber-800 transition-colors"
                            >
                              Ver detalle →
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* ===== MODAL CREAR RENDICION ===== */}
      {showCreateModal && (
        <CreateRendicionModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateRendicion}
          creating={creating}
          fondos={activeFondos}
          initialFondoId={selectedFondoForRendicion}
        />
      )}

      {/* ===== MODAL 1 O VARIOS GASTOS ===== */}
      {showCountModal && (
        <RapidoModal
          creating={creating}
          fondo={activeFondos.find((f) => f.id === pendingFondoId)}
          onSingle={() => handleRendirContraFondo('captura')}
          onMulti={() => handleRendirContraFondo('detalle')}
          onClose={() => {
            setShowCountModal(false)
            setPendingFondoId(null)
          }}
        />
      )}
    </div>
  )
}

function EstadoBadge({ estado }: { estado: Rendicion['estado'] }) {
  const map: Record<Rendicion['estado'], { label: string; className: string }> = {
    abierta: { label: 'Abierta', className: 'bg-blue-50 text-blue-700 border-blue-200/60' },
    terminada: { label: 'Terminada', className: 'bg-violet-50 text-violet-700 border-violet-200/60' },
    en_revision: { label: 'En Revisión', className: 'bg-amber-50 text-amber-700 border-amber-200/60' },
    aprobada: { label: 'Aprobada', className: 'bg-emerald-50 text-emerald-700 border-emerald-200/60' },
    rechazada: { label: 'Rechazada', className: 'bg-rose-50 text-rose-700 border-rose-200/60' },
    cerrada: { label: 'Cerrada', className: 'bg-slate-100 text-slate-700 border-slate-200/60' },
  }
  const config = map[estado] || map.abierta
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.className}`}>
      {config.label}
    </span>
  )
}

function CreateRendicionModal({
  onClose,
  onCreate,
  creating,
  fondos,
  initialFondoId,
}: {
  onClose: () => void
  onCreate: (descripcion: string, monto: number, fondoId: string) => void
  creating: boolean
  fondos: Fondo[]
  initialFondoId?: string
}) {
  const [descripcion, setDescripcion] = useState('')
  const [montoSugerido, setMontoSugerido] = useState(0)
  const [fondoId, setFondoId] = useState(initialFondoId || (fondos.length > 0 ? fondos[0].id : ''))
  const fondoSeleccionado = fondos.find((f) => f.id === fondoId)
  const saldoFondo = fondoSeleccionado?.saldo || 0

  // Pre-cargar el monto con el saldo del fondo cada vez que cambie el fondo
  useEffect(() => {
    setMontoSugerido(fondoId ? (fondos.find((f) => f.id === fondoId)?.saldo || 0) : 0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fondoId])

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200/80 overflow-hidden">
        <div className="bg-slate-900 p-6 text-white">
          <h3 className="text-lg font-bold">Nueva Rendición de Gastos</h3>
          <p className="text-slate-400 text-xs mt-1">Declara tus gastos contra un fondo asignado</p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            onCreate(descripcion, montoSugerido, fondoId)
          }}
          className="p-6 space-y-4"
        >
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Fondo Asignado *
            </label>
            {fondos.length > 0 ? (
              <select
                value={fondoId}
                onChange={(e) => setFondoId(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="">Selecciona el fondo a rendir</option>
                {fondos.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.observacion} (${f.saldo.toLocaleString('es-CL')} saldo)
                  </option>
                ))}
              </select>
            ) : (
              <p className="text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-xl p-3">
                No tienes fondos activos. Solicita uno a tu administrador para rendir.
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Glosa / Descripción Rendición *
            </label>
            <input
              type="text"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              required
              placeholder="Ej: Rendición Viaje Santiago Marzo"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Saldo disponible (referencia)
            </label>
            <div className="w-full px-3.5 py-3 bg-slate-50 border border-emerald-200 rounded-xl text-base font-bold text-emerald-600">
              ${montoSugerido.toLocaleString('es-CL')}
            </div>
            <p className="text-[11px] text-slate-400 mt-1.5 leading-snug">
              El monto inicial se precarga con el saldo del fondo. Ajustará solo con los totales de tus gastos al declararlos.
            </p>
          </div>

          <div className="flex gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              disabled={creating}
              className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={creating || (fondos.length > 0 && !fondoId)}
              className="flex-1 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors disabled:opacity-50"
            >
              {creating ? 'Creando...' : 'Crear Rendición'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function RapidoModal({
  creating,
  fondo,
  onSingle,
  onMulti,
  onClose,
}: {
  creating: boolean
  fondo?: Fondo
  onSingle: () => void
  onMulti: () => void
  onClose: () => void
}) {
  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200/80 overflow-hidden">
        <div className="bg-slate-900 p-6 text-white">
          <h3 className="text-lg font-bold">Rendir contra este Fondo</h3>
          <p className="text-slate-400 text-xs mt-1">Abre la rendición de este fondo para declarar tus gastos</p>
        </div>

        <div className="p-6 space-y-4">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center justify-between">
            <div className="min-w-0">
              <p className="text-[10px] text-slate-400 uppercase tracking-wider">Fondo</p>
              <p className="text-sm font-semibold text-slate-900 line-clamp-1">{fondo?.observacion || '—'}</p>
            </div>
            <div className="text-right ml-3 flex-shrink-0">
              <p className="text-[10px] text-slate-400 uppercase tracking-wider">Saldo</p>
              <p className="text-base font-bold text-emerald-600">${(fondo?.saldo || 0).toLocaleString('es-CL')}</p>
            </div>
          </div>

          <p className="text-sm text-slate-600 text-center">
            ¿Cuántos gastos vas a declarar para esta rendición?
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={onSingle}
              disabled={creating}
              className="px-4 py-4 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-bold rounded-xl shadow-sm transition-colors disabled:opacity-50 text-center"
            >
              <span className="block text-lg mb-0.5">📄</span>
              1 gasto
              <span className="block text-[11px] font-normal opacity-90 mt-0.5">
                rápido, captura y listo
              </span>
            </button>
            <button
              onClick={onMulti}
              disabled={creating}
              className="px-4 py-4 bg-amber-500 hover:bg-amber-600 text-white text-sm font-bold rounded-xl shadow-sm transition-colors disabled:opacity-50 text-center"
            >
              <span className="block text-lg mb-0.5">🗂️</span>
              Varios gastos
              <span className="block text-[11px] font-normal opacity-90 mt-0.5">
                agrega varios documentos
              </span>
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={creating}
            className="w-full px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  )
}
