'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Shield, LogOut, Search, Users, ArrowLeft, X, Edit2, Check, XCircle, Plus } from 'lucide-react'

interface User {
  email: string
  password_hash: string
  empresa_nombre: string
  plan: string
  limite_boletas: number
  boletas_usadas: number
  activo: boolean
  rol: string
  creado_en: string
  sheet_id_asociado: string
  tipo_usuario: 'gastos' | 'rinde' | 'ambos'
}

interface Props {
  adminEmail: string
}

export default function UsuariosClient({ adminEmail }: Props) {
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [filtered, setFiltered] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterTipo, setFilterTipo] = useState('')
  const [filterPlan, setFilterPlan] = useState('')
  const [filterActivo, setFilterActivo] = useState('')
  const [total, setTotal] = useState(0)
  const [editing, setEditing] = useState<User | null>(null)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loggingOut, setLoggingOut] = useState(false)
  const [creating, setCreating] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    empresa_nombre: '',
    plan: 'free',
    tipo_usuario: 'gastos' as 'gastos' | 'rinde' | 'ambos',
    limite_boletas: 10,
    activo: true,
    rol: 'user',
    sheet_id_asociado: '',
  })

  const loadUsers = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (filterTipo) params.set('tipo_usuario', filterTipo)
      if (filterPlan) params.set('plan', filterPlan)
      if (filterActivo) params.set('activo', filterActivo)

      const res = await fetch(`/api/super-admin/usuarios?${params}`, { credentials: 'same-origin' })
      const data = await res.json()
      if (res.ok) {
        setUsers(data.users || [])
        setFiltered(data.users || [])
        setTotal(data.total || 0)
      } else {
        setError(data.error || 'Error cargando usuarios')
      }
    } catch (err) {
      setError('Error cargando usuarios')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

  useEffect(() => {
    loadUsers()
  }, [filterTipo, filterPlan, filterActivo])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    loadUsers()
  }

  const handleLogout = async () => {
    setLoggingOut(true)
    try {
      await fetch('/api/super-admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'logout' }),
      })
      router.push('/super-admin/login')
    } catch {
      setLoggingOut(false)
    }
  }

  const handleSaveUser = async () => {
    if (!editing) return
    setSaving(true)
    setError(null)
    setSuccess(null)
    try {
      const res = await fetch('/api/super-admin/usuarios', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify(editing),
      })
      const data = await res.json()
      if (res.ok) {
        setSuccess('Usuario actualizado correctamente')
        setEditing(null)
        loadUsers()
        setTimeout(() => setSuccess(null), 3000)
      } else {
        setError(data.error || 'Error actualizando usuario')
      }
    } catch (err) {
      setError('Error actualizando usuario')
    } finally {
      setSaving(false)
    }
  }

  const handleToggleActivo = async (user: User) => {
    try {
      const updated = { ...user, activo: !user.activo }
      const res = await fetch('/api/super-admin/usuarios', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify(updated),
      })
      if (res.ok) {
        setSuccess(`Usuario ${updated.activo ? 'activado' : 'desactivado'}`)
        loadUsers()
        setTimeout(() => setSuccess(null), 3000)
      } else {
        const data = await res.json()
        setError(data.error || 'Error actualizando usuario')
      }
    } catch (err) {
      setError('Error actualizando usuario')
    }
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreating(true)
    setError(null)
    try {
      const res = await fetch('/api/super-admin/usuarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify(newUser),
      })
      const data = await res.json()
      if (res.ok) {
        setSuccess('Usuario creado exitosamente')
        setShowCreateModal(false)
        setNewUser({
          email: '',
          password: '',
          empresa_nombre: '',
          plan: 'free',
          tipo_usuario: 'gastos',
          limite_boletas: 10,
          activo: true,
          rol: 'user',
          sheet_id_asociado: '',
        })
        loadUsers()
        setTimeout(() => setSuccess(null), 3000)
      } else {
        setError(data.error || 'Error creando usuario')
      }
    } catch (err) {
      setError('Error creando usuario')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <nav className="bg-slate-900/80 backdrop-blur-xl border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/30">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">Gestión de Usuarios</h1>
                <p className="text-xs text-slate-400">{adminEmail}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => router.push('/super-admin')}
                className="flex items-center gap-2 px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Volver
              </button>
              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className="flex items-center gap-2 px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-50"
              >
                <LogOut className="w-4 h-4" />
                {loggingOut ? 'Saliendo...' : 'Salir'}
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {success && (
          <div className="bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded-xl p-3 text-sm">
            {success}
          </div>
        )}
        {error && (
          <div className="bg-rose-500/20 border border-rose-500/30 text-rose-400 rounded-xl p-3 text-sm">
            {error}
          </div>
        )}

        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <Users className="w-6 h-6" />
                Usuarios Registrados
              </h2>
              <p className="text-slate-400 text-sm mt-1">
                {filtered.length} de {total} usuarios
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/30 hover:from-blue-600 hover:to-indigo-700"
            >
              <Plus className="w-4 h-4" />
              Crear Usuario
            </button>
          </div>

          <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-5 gap-3 mb-4">
            <div className="sm:col-span-2 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por email o empresa..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <select
              value={filterTipo}
              onChange={(e) => setFilterTipo(e.target.value)}
              className="px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">Todos los productos</option>
              <option value="gastos">Solo GastosNX</option>
              <option value="rinde">Solo RindeNX</option>
              <option value="ambos">Ambos</option>
            </select>
            <select
              value={filterPlan}
              onChange={(e) => setFilterPlan(e.target.value)}
              className="px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">Todos los planes</option>
              <option value="free">Free</option>
              <option value="pro">Pro</option>
              <option value="enterprise">Enterprise</option>
            </select>
            <select
              value={filterActivo}
              onChange={(e) => setFilterActivo(e.target.value)}
              className="px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">Todos los estados</option>
              <option value="true">Activos</option>
              <option value="false">Inactivos</option>
            </select>
          </form>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px]">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase">Email</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase">Empresa</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase">Plan</th>
                  <th className="text-center py-3 px-4 text-xs font-semibold text-slate-400 uppercase">Producto</th>
                  <th className="text-center py-3 px-4 text-xs font-semibold text-slate-400 uppercase">Rol</th>
                  <th className="text-center py-3 px-4 text-xs font-semibold text-slate-400 uppercase">Boletas</th>
                  <th className="text-center py-3 px-4 text-xs font-semibold text-slate-400 uppercase">Estado</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-slate-400 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400">
                      Cargando usuarios...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400">
                      No se encontraron usuarios con los filtros aplicados
                    </td>
                  </tr>
                ) : (
                  filtered.map((user) => (
                    <tr key={user.email} className="border-b border-slate-700/50 hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-4 text-sm text-white font-medium">{user.email}</td>
                      <td className="py-3 px-4 text-sm text-slate-300">{user.empresa_nombre}</td>
                      <td className="py-3 px-4">
                        <span className="inline-block px-2 py-1 text-xs font-medium rounded-lg bg-slate-700 text-slate-200 capitalize">
                          {user.plan}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-block px-2 py-1 text-xs font-medium rounded-lg ${
                            user.tipo_usuario === 'rinde'
                              ? 'bg-amber-500/20 text-amber-300'
                              : user.tipo_usuario === 'ambos'
                              ? 'bg-purple-500/20 text-purple-300'
                              : 'bg-blue-500/20 text-blue-300'
                          }`}
                        >
                          {user.tipo_usuario === 'rinde' ? 'RindeNX' : user.tipo_usuario === 'ambos' ? 'Ambos' : 'GastosNX'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-block px-2 py-1 text-xs font-medium rounded-lg ${
                            user.rol === 'superadmin'
                              ? 'bg-rose-500/20 text-rose-300'
                              : user.rol === 'admin'
                              ? 'bg-indigo-500/20 text-indigo-300'
                              : 'bg-slate-600 text-slate-200'
                          }`}
                        >
                          {user.rol}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center text-sm text-slate-300">
                        {user.boletas_usadas} / {user.limite_boletas}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {user.activo ? (
                          <span className="inline-flex items-center gap-1 text-emerald-400 text-xs font-medium">
                            <Check className="w-3 h-3" />
                            Activo
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-rose-400 text-xs font-medium">
                            <XCircle className="w-3 h-3" />
                            Inactivo
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setEditing(user)}
                            className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleToggleActivo(user)}
                            className={`p-1.5 rounded-lg transition-colors ${
                              user.activo
                                ? 'text-slate-400 hover:text-rose-400 hover:bg-slate-800'
                                : 'text-slate-400 hover:text-emerald-400 hover:bg-slate-800'
                            }`}
                            title={user.activo ? 'Desactivar' : 'Activar'}
                          >
                            {user.activo ? <XCircle className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {editing && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-700">
              <h3 className="text-xl font-bold text-white">Editar Usuario</h3>
              <button
                onClick={() => setEditing(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Email</label>
                <input
                  type="text"
                  value={editing.email}
                  disabled
                  className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-xl text-slate-500 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Empresa</label>
                <input
                  type="text"
                  value={editing.empresa_nombre}
                  onChange={(e) => setEditing({ ...editing, empresa_nombre: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Plan</label>
                <select
                  value={editing.plan}
                  onChange={(e) => setEditing({ ...editing, plan: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="free">Free</option>
                  <option value="pro">Pro</option>
                  <option value="enterprise">Enterprise</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Producto</label>
                <select
                  value={editing.tipo_usuario}
                  onChange={(e) => setEditing({ ...editing, tipo_usuario: e.target.value as 'gastos' | 'rinde' | 'ambos' })}
                  className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="gastos">Solo GastosNX</option>
                  <option value="rinde">Solo RindeNX</option>
                  <option value="ambos">Ambos productos</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Rol</label>
                <select
                  value={editing.rol}
                  onChange={(e) => setEditing({ ...editing, rol: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="user">Usuario</option>
                  <option value="admin">Admin</option>
                  <option value="superadmin">Super Admin</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Límite de Boletas</label>
                <input
                  type="number"
                  value={editing.limite_boletas}
                  onChange={(e) => setEditing({ ...editing, limite_boletas: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="activo"
                  checked={editing.activo}
                  onChange={(e) => setEditing({ ...editing, activo: e.target.checked })}
                  className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-purple-500 focus:ring-purple-500"
                />
                <label htmlFor="activo" className="text-sm text-slate-300">
                  Usuario activo
                </label>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setEditing(null)}
                  className="flex-1 px-4 py-2 bg-slate-700 text-white rounded-xl hover:bg-slate-600 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSaveUser}
                  disabled={saving}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {saving ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-700">
              <h3 className="text-xl font-bold text-white">Crear Nuevo Usuario</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateUser} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Email *</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  required
                  className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Contraseña *</label>
                <input
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  required
                  minLength={4}
                  className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-slate-500 mt-1">Se almacenará hasheada con SHA-256</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Empresa *</label>
                <input
                  type="text"
                  value={newUser.empresa_nombre}
                  onChange={(e) => setNewUser({ ...newUser, empresa_nombre: e.target.value })}
                  required
                  className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Tipo de Producto</label>
                <select
                  value={newUser.tipo_usuario}
                  onChange={(e) => setNewUser({ ...newUser, tipo_usuario: e.target.value as 'gastos' | 'rinde' | 'ambos' })}
                  className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="gastos">Solo GastosNX</option>
                  <option value="rinde">Solo RindeNX</option>
                  <option value="ambos">Ambos productos</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Plan</label>
                <select
                  value={newUser.plan}
                  onChange={(e) => setNewUser({ ...newUser, plan: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="free">Free</option>
                  <option value="pro">Pro</option>
                  <option value="enterprise">Enterprise</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Rol</label>
                <select
                  value={newUser.rol}
                  onChange={(e) => setNewUser({ ...newUser, rol: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="user">Usuario</option>
                  <option value="admin">Admin</option>
                  <option value="superadmin">Super Admin</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Límite de Boletas</label>
                <input
                  type="number"
                  value={newUser.limite_boletas}
                  onChange={(e) => setNewUser({ ...newUser, limite_boletas: parseInt(e.target.value) || 10 })}
                  min="0"
                  className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Google Sheet ID</label>
                <input
                  type="text"
                  value={newUser.sheet_id_asociado}
                  onChange={(e) => setNewUser({ ...newUser, sheet_id_asociado: e.target.value })}
                  placeholder="Opcional - se puede asignar después"
                  className="w-full px-4 py-2 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-slate-500 mt-1">Si lo dejas vacío, el usuario no podrá registrar gastos hasta que se le asigne</p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="newUserActivo"
                  checked={newUser.activo}
                  onChange={(e) => setNewUser({ ...newUser, activo: e.target.checked })}
                  className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-blue-500 focus:ring-blue-500"
                />
                <label htmlFor="newUserActivo" className="text-sm text-slate-300">
                  Usuario activo
                </label>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  disabled={creating}
                  className="flex-1 px-4 py-2 bg-slate-700 text-white rounded-xl hover:bg-slate-600 transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {creating ? 'Creando...' : 'Crear Usuario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
