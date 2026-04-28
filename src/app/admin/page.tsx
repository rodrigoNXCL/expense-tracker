'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getSession, logout } from '@/lib/auth'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Alert } from '@/components/ui/Alert'
import { Input } from '@/components/ui/Input'
import {
  Shield, Users, Plus, Trash2, Edit, Save, X,
  Loader2, CheckCircle, XCircle, AlertCircle,
  LogOut, Receipt, TrendingUp
} from 'lucide-react'

interface User {
  email: string
  empresa_nombre: string
  plan: string
  limite_boletas: number
  boletas_usadas: number
  activo: boolean
  rol: string
  sheet_id_asociado: string
}

// Plan hierarchy
const PLAN_HIERARCHY: Record<string, number> = {
  'free': 1,
  'pro': 2,
  'enterprise': 3,
}

export default function AdminPage() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    empresa_nombre: '',
    plan: 'free',
    limite_boletas: 10,
    activo: true,
  })

  useEffect(() => {
    const session = getSession()
    if (!session || !session.activo || session.rol !== 'admin') {
      router.replace('/login')
      return
    }
    setCurrentUser(session)
    loadUsers()
    setLoading(false)
  }, [router])

  const loadUsers = async () => {
    try {
      const session = getSession()
      if (!session) return
      
      const response = await fetch('/api/admin/users', {
        headers: { 'x-session': JSON.stringify(session) },
      })
      
      const result = await response.json()
      if (response.ok) {
        setUsers(result.users || [])
      } else {
        setError(result.error || 'Error cargando usuarios')
      }
    } catch (err) {
      setError('Error de conexión')
    }
  }

  // ✅ Filtrar planes disponibles según el plan del admin actual
  const getAvailablePlans = () => {
    if (!currentUser) return ['free']
    
    const currentPlanLevel = PLAN_HIERARCHY[currentUser.plan] || 1
    const allPlans = ['free', 'pro', 'enterprise']
    
    return allPlans.filter(plan => PLAN_HIERARCHY[plan] <= currentPlanLevel)
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const session = getSession()
      if (!session) throw new Error('No hay sesión')

      // ✅ Validar que el plan no supere el del admin
      const availablePlans = getAvailablePlans()
      if (!availablePlans.includes(formData.plan)) {
        throw new Error(`No tienes permisos para crear usuarios con plan ${formData.plan}`)
      }

      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-session': JSON.stringify(session),
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()
      if (!response.ok) {
        throw new Error(result.error || 'Error creando usuario')
      }

      setSuccess('Usuario creado exitosamente')
      setShowCreateModal(false)
      loadUsers()
      resetForm()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error creando usuario')
    } finally {
      setSaving(false)
    }
  }

  const handleUpdateUser = async (email: string, updates: Partial<User>) => {
    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const session = getSession()
      if (!session) throw new Error('No hay sesión')

      const response = await fetch(`/api/admin/users?email=${encodeURIComponent(email)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-session': JSON.stringify(session),
        },
        body: JSON.stringify(updates),
      })

      const result = await response.json()
      if (!response.ok) {
        throw new Error(result.error || 'Error actualizando usuario')
      }

      setSuccess('Usuario actualizado exitosamente')
      loadUsers()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error actualizando usuario')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteUser = async (email: string) => {
    if (!confirm(`¿Estás seguro de eliminar el usuario ${email}?`)) return

    setSaving(true)
    setError(null)

    try {
      const session = getSession()
      if (!session) throw new Error('No hay sesión')

      const response = await fetch(`/api/admin/users?email=${encodeURIComponent(email)}`, {
        method: 'DELETE',
        headers: { 'x-session': JSON.stringify(session) },
      })

      const result = await response.json()
      if (!response.ok) {
        throw new Error(result.error || 'Error eliminando usuario')
      }

      setSuccess('Usuario eliminado exitosamente')
      loadUsers()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error eliminando usuario')
    } finally {
      setSaving(false)
    }
  }

  const handleResetCounter = async (email: string) => {
    if (!confirm(`¿Resetear contador de boletas para ${email}?`)) return

    try {
      await handleUpdateUser(email, { boletas_usadas: 0 })
    } catch (err) {
      // Error ya se maneja en handleUpdateUser
    }
  }

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      empresa_nombre: '',
      plan: 'free',
      limite_boletas: 10,
      activo: true,
    })
  }

  const handleLogout = () => {
    logout()
    router.replace('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-teal-50">
        <Card className="text-center p-8 space-y-4">
          <Loader2 className="w-10 h-10 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground font-medium">Cargando panel de administración...</p>
        </Card>
      </div>
    )
  }

  if (!currentUser) return null

  const availablePlans = getAvailablePlans()

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      {/* ===== NAVBAR ===== */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-emerald-100/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-purple-500/30">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">Panel de Administración</h1>
                <p className="text-xs text-gray-500">Gestión de usuarios y empresas</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard')}>
                <Receipt className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Salir
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* ===== ALERTAS ===== */}
        {error && (
          <Alert variant="error">
            <XCircle className="h-5 w-5" />
            <span>{error}</span>
          </Alert>
        )}

        {success && (
          <Alert variant="success">
            <CheckCircle className="h-5 w-5" />
            <span>{success}</span>
          </Alert>
        )}

        {/* ===== STATS ===== */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600">Total Usuarios</p>
                  <p className="text-3xl font-bold text-purple-700 mt-1">{users.length}</p>
                </div>
                <Users className="h-10 w-10 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-emerald-600">Activos</p>
                  <p className="text-3xl font-bold text-emerald-700 mt-1">
                    {users.filter(u => u.activo).length}
                  </p>
                </div>
                <CheckCircle className="h-10 w-10 text-emerald-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Boletas Totales</p>
                  <p className="text-3xl font-bold text-blue-700 mt-1">
                    {users.reduce((sum, u) => sum + (u.boletas_usadas || 0), 0)}
                  </p>
                </div>
                <TrendingUp className="h-10 w-10 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ===== BOTÓN CREAR USUARIO ===== */}
        <div className="flex justify-end">
          <Button
            onClick={() => setShowCreateModal(true)}
            className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-semibold shadow-lg shadow-purple-500/30"
          >
            <Plus className="h-5 w-5 mr-2" />
            Crear Usuario
          </Button>
        </div>

        {/* ===== TABLA DE USUARIOS ===== */}
        <Card className="border-emerald-100 shadow-lg shadow-emerald-500/5 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-emerald-100">
            <CardTitle className="text-xl text-gray-900">Usuarios Registrados</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px]">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wide">Email</th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wide">Empresa</th>
                    <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wide">Plan</th>
                    <th className="text-center py-4 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wide">Boletas</th>
                    <th className="text-center py-4 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wide">Estado</th>
                    <th className="text-right py-4 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wide">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.email} className="border-b border-gray-50 hover:bg-gradient-to-r hover:from-emerald-50/30 hover:to-teal-50/30 transition-all">
                      <td className="py-4 px-6 text-sm font-medium text-gray-900">{user.email}</td>
                      <td className="py-4 px-6 text-sm text-gray-700">{user.empresa_nombre}</td>
                      <td className="py-4 px-6">
                        <Badge 
                          variant={user.plan === 'pro' ? 'default' : user.plan === 'enterprise' ? 'warning' : 'secondary'}
                          className="capitalize"
                        >
                          {user.plan}
                        </Badge>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className="text-sm font-semibold text-gray-900">
                          {user.boletas_usadas} / {user.limite_boletas}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <Badge variant={user.activo ? 'success' : 'destructive'}>
                          {user.activo ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleResetCounter(user.email)}
                            disabled={saving}
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          >
                            <TrendingUp className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteUser(user.email)}
                            disabled={saving}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ===== MODAL CREAR USUARIO - FIJO TRANSPARENCIA ===== */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full max-h-[90vh] overflow-y-auto bg-white">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-purple-100">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl text-gray-900">Crear Nuevo Usuario</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowCreateModal(false)
                    resetForm()
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Tu plan: <span className="font-semibold capitalize">{currentUser.plan}</span>
              </p>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <form onSubmit={handleCreateUser} className="space-y-4">
                <Input
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
                <Input
                  label="Contraseña"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
                <Input
                  label="Nombre Empresa"
                  value={formData.empresa_nombre}
                  onChange={(e) => setFormData({ ...formData, empresa_nombre: e.target.value })}
                  required
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Plan</label>
                  <select
                    value={formData.plan}
                    onChange={(e) => setFormData({ ...formData, plan: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    {availablePlans.map(plan => (
                      <option key={plan} value={plan} className="capitalize">
                        {plan} {plan === currentUser.plan ? '(tu plan)' : ''}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Solo puedes crear usuarios con planes iguales o inferiores al tuyo
                  </p>
                </div>
                <Input
                  label="Límite de Boletas"
                  type="number"
                  value={formData.limite_boletas}
                  onChange={(e) => setFormData({ ...formData, limite_boletas: parseInt(e.target.value) || 0 })}
                  required
                  min="0"
                />
                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowCreateModal(false)
                      resetForm()
                    }}
                    className="flex-1"
                    disabled={saving}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={saving}
                    className="flex-1 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-semibold"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Creando...
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        Crear
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}