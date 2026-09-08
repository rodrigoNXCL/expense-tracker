'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft, Wallet, Plus, X, Edit2, Trash2, Lock, Unlock, Users, CheckCircle, XCircle, Clock
} from 'lucide-react'

interface Fondo {
  id: string
  usuario_email: string
  monto_asignado: number
  saldo: number
  observacion: string
  fecha_asignacion: string
  estado: 'en_curso' | 'cerrado' | 'aprobado' | 'rechazado'
  asignado_por: string
  empresa: string
}

export default function FondosClient({ session }: { session: any }) {
  const router = useRouter()
  const [fondos, setFondos] = useState<Fondo[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [editing, setEditing] = useState<Fondo | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [usuariosEmpresa, setUsuariosEmpresa] = useState<string[]>([])
  const [form, setForm] = useState({
    usuario_email: '',
    monto_asignado: '',
    observacion: '',
  })

  const isAdmin = session.rol === 'admin'

  const load = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/rinde/fondos', { credentials: 'same-origin' })
      const data = await res.json()
      if (res.ok) {
        setFondos(data.fondos || [])
      } else {
        setError(data.error || 'Error al cargar fondos')
      }
    } catch {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    if (isAdmin) {
      fetch('/api/admin/users', { credentials: 'same-origin' })
        .then((r) => r.json())
        .then((d) => {
          const users = (d.users || [])
            .filter((u: any) =>
              u.empresa_nombre === session.empresa_nombre &&
              (u.tipo_usuario === 'rinde' || u.tipo_usuario === 'ambos')
            )
            .map((u: any) => u.email)
          setUsuariosEmpresa(users)
        })
        .catch(() => {})
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    try {
      const url = editing
        ? `/api/rinde/fondos/${editing.id}`
        : '/api/rinde/fondos'
      const method = editing ? 'PATCH' : 'POST'
      const body = editing
        ? { accion: 'editar', monto_asignado: parseFloat(form.monto_asignado), observacion: form.observacion }
        : { usuario_email: form.usuario_email, monto_asignado: parseFloat(form.monto_asignado), observacion: form.observacion }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (res.ok) {
        setSuccess(editing ? 'Fondo actualizado' : 'Fondo asignado')
        setShowCreate(false)
        setEditing(null)
        setForm({ usuario_email: '', monto_asignado: '', observacion: '' })
        load()
        setTimeout(() => setSuccess(null), 3000)
      } else {
        setError(data.error || 'Error')
      }
    } catch {
      setError('Error de conexión')
    }
  }

  const handleCerrar = async (fondo: Fondo) => {
    if (!confirm(`¿Cerrar el fondo de ${fondo.usuario_email}? No podrá recibir más rendiciones.`)) return
    try {
      const res = await fetch(`/api/rinde/fondos/${fondo.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ accion: 'cerrar' }),
      })
      const data = await res.json()
      if (res.ok) {
        setSuccess('Fondo cerrado')
        load()
        setTimeout(() => setSuccess(null), 3000)
      } else {
        setError(data.error || 'Error')
      }
    } catch {
      setError('Error de conexión')
    }
  }

  const handleEliminar = async (fondo: Fondo) => {
    if (!confirm(`¿Eliminar el fondo de ${fondo.usuario_email}? Esta acción no se puede deshacer.`)) return
    try {
      const res = await fetch(`/api/rinde/fondos/${fondo.id}`, {
        method: 'DELETE',
        credentials: 'same-origin',
      })
      const data = await res.json()
      if (res.ok) {
        setSuccess('Fondo eliminado')
        load()
        setTimeout(() => setSuccess(null), 3000)
      } else {
        setError(data.error || 'Error')
      }
    } catch {
      setError('Error de conexión')
    }
  }

  const openEdit = (fondo: Fondo) => {
    setEditing(fondo)
    setForm({
      usuario_email: fondo.usuario_email,
      monto_asignado: String(fondo.monto_asignado),
      observacion: fondo.observacion,
    })
    setShowCreate(true)
  }

  const stats = {
    total: fondos.length,
    en_curso: fondos.filter((f) => f.estado === 'en_curso').length,
    cerrados: fondos.filter((f) => f.estado === 'cerrado').length,
    monto_total: fondos.reduce((sum, f) => sum + f.monto_asignado, 0),
    saldo_total: fondos.reduce((sum, f) => sum + f.saldo, 0),
  }

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
              <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/30">
                <Wallet className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">
                  {isAdmin ? 'Asignación de Fondos' : 'Mis Fondos'}
                </h1>
                <p className="text-xs text-gray-500">{session.email}</p>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {success && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl p-3 text-sm">
            {success}
          </div>
        )}
        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-xl p-3 text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-white border border-amber-100 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Fondos</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
              </div>
              <Wallet className="h-8 w-8 text-amber-500" />
            </div>
          </div>
          <div className="bg-white border border-amber-100 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">En Curso</p>
                <p className="text-2xl font-bold text-blue-600 mt-1">{stats.en_curso}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-500" />
            </div>
          </div>
          <div className="bg-white border border-amber-100 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Cerrados</p>
                <p className="text-2xl font-bold text-gray-600 mt-1">{stats.cerrados}</p>
              </div>
              <Lock className="h-8 w-8 text-gray-500" />
            </div>
          </div>
          <div className="bg-white border border-amber-100 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Saldo Total</p>
                <p className="text-2xl font-bold text-amber-600 mt-1">
                  ${stats.saldo_total.toLocaleString('es-CL')}
                </p>
              </div>
              <Wallet className="h-8 w-8 text-amber-500" />
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">
            {isAdmin ? 'Fondos Asignados' : 'Mis Fondos Asignados'}
          </h2>
          {isAdmin && (
            <button
              onClick={() => {
                setEditing(null)
                setForm({ usuario_email: '', monto_asignado: '', observacion: '' })
                setShowCreate(true)
              }}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold rounded-xl shadow-lg shadow-amber-500/30"
            >
              <Plus className="w-4 h-4" />
              Asignar Fondo
            </button>
          )}
        </div>

        {loading ? (
          <div className="bg-white border border-amber-100 rounded-2xl p-16 text-center text-gray-500">
            Cargando fondos...
          </div>
        ) : fondos.length === 0 ? (
          <div className="bg-white border border-amber-100 rounded-2xl p-12 text-center">
            <Wallet className="w-12 h-12 mx-auto text-amber-300 mb-3" />
            <p className="text-gray-500">
              {isAdmin ? 'No has asignado fondos aún' : 'No tienes fondos asignados'}
            </p>
          </div>
        ) : (
          <div className="bg-white border border-amber-100 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-amber-50 border-b border-amber-100">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Usuario</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Observación</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Asignado</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Saldo</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Consumido</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Estado</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Fecha</th>
                    {isAdmin && <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Acciones</th>}
                  </tr>
                </thead>
                <tbody>
                  {fondos.map((f) => {
                    const consumido = f.monto_asignado - f.saldo
                    const isCerrado = f.estado === 'cerrado'
                    return (
                      <tr key={f.id} className="border-b border-amber-50 hover:bg-amber-50/50">
                        <td className="px-4 py-3 text-sm text-gray-900">{f.usuario_email}</td>
                        <td className="px-4 py-3 text-sm text-gray-700 max-w-xs truncate">{f.observacion}</td>
                        <td className="px-4 py-3 text-right text-sm font-semibold text-gray-900">
                          ${f.monto_asignado.toLocaleString('es-CL')}
                        </td>
                        <td className="px-4 py-3 text-right text-sm font-semibold text-amber-700">
                          ${f.saldo.toLocaleString('es-CL')}
                        </td>
                        <td className="px-4 py-3 text-right text-sm text-gray-600">
                          ${consumido.toLocaleString('es-CL')}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {isCerrado ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                              <Lock className="w-3 h-3" /> Cerrado
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                              <Unlock className="w-3 h-3" /> En curso
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {f.fecha_asignacion ? new Date(f.fecha_asignacion).toLocaleDateString('es-CL') : '-'}
                        </td>
                        {isAdmin && (
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              {!isCerrado && (
                                <>
                                  <button
                                    onClick={() => openEdit(f)}
                                    className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                                    title="Editar"
                                  >
                                    <Edit2 className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleCerrar(f)}
                                    className="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg"
                                    title="Cerrar fondo"
                                  >
                                    <Lock className="w-4 h-4" />
                                  </button>
                                </>
                              )}
                              <button
                                onClick={() => handleEliminar(f)}
                                className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                                title="Eliminar"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm text-amber-900">
          <p className="font-semibold mb-1">¿Cómo funciona?</p>
          <ul className="space-y-1 text-xs">
            <li>• El admin asigna un fondo a un usuario con un monto y una observación/glosa</li>
            <li>• El usuario puede crear rendiciones contra ese fondo</li>
            <li>• Al aprobar una rendición, el monto se descuenta automáticamente del saldo del fondo</li>
            <li>• El admin puede editar el monto o la glosa, cerrar el fondo o eliminarlo (si no tiene consumo)</li>
            <li>• Los fondos cerrados no pueden recibir más rendiciones</li>
          </ul>
        </div>
      </div>

      {showCreate && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="bg-gradient-to-r from-amber-500 to-orange-600 p-6 text-white flex items-center justify-between">
              <h3 className="text-xl font-bold">
                {editing ? 'Editar Fondo' : 'Asignar Fondo'}
              </h3>
              <button
                onClick={() => {
                  setShowCreate(false)
                  setEditing(null)
                }}
                className="text-white hover:text-amber-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {!editing && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Usuario *</label>
                  <select
                    value={form.usuario_email}
                    onChange={(e) => setForm({ ...form, usuario_email: e.target.value })}
                    required
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="">Selecciona un usuario</option>
                    {usuariosEmpresa.map((email) => (
                      <option key={email} value={email}>
                        {email}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Monto a Asignar *</label>
                <input
                  type="number"
                  value={form.monto_asignado}
                  onChange={(e) => setForm({ ...form, monto_asignado: e.target.value })}
                  required
                  min="1"
                  placeholder="50000"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Observación / Glosa *</label>
                <textarea
                  value={form.observacion}
                  onChange={(e) => setForm({ ...form, observacion: e.target.value })}
                  required
                  rows={3}
                  placeholder="Ej: Gastos de viaje a Santiago para el cliente ACME"
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Describe para qué es este fondo. El usuario lo verá al rendir.
                </p>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreate(false)
                    setEditing(null)
                  }}
                  className="flex-1 px-4 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-semibold rounded-xl shadow-lg shadow-amber-500/30"
                >
                  {editing ? 'Guardar' : 'Asignar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
