'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Shield, LogOut, Building2, Users, ArrowRight, BarChart3 } from 'lucide-react'

interface Props {
  email: string
}

interface Stats {
  empresas: { total: number; activas: number; inactivas: number }
  usuarios: {
    total: number
    activos: number
    inactivos: number
    por_tipo: { gastos: number; rinde: number; ambos: number }
    por_plan: { free: number; pro: number; enterprise: number }
  }
}

export default function SuperAdminDashboardClient({ email }: Props) {
  const router = useRouter()
  const [loggingOut, setLoggingOut] = useState(false)
  const [stats, setStats] = useState<Stats | null>(null)

  useEffect(() => {
    fetch('/api/super-admin/stats', { credentials: 'same-origin' })
      .then((r) => r.json())
      .then((d) => setStats(d))
      .catch(() => {})
  }, [])

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
                <h1 className="text-lg font-bold text-white">Super Admin</h1>
                <p className="text-xs text-slate-400">{email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="flex items-center gap-2 px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-50"
            >
              <LogOut className="w-4 h-4" />
              {loggingOut ? 'Saliendo...' : 'Cerrar sesión'}
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-emerald-400 text-sm font-medium">Sesión activa</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-1">
            Bienvenido al Dashboard Super Admin
          </h2>
          <p className="text-slate-400">
            Gestiona empresas, usuarios y configuración de GastosNX / RindeNX.
          </p>
        </div>

        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-slate-800/50 border border-emerald-500/30 rounded-2xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400">Empresas</p>
                  <p className="text-2xl font-bold text-emerald-400 mt-1">{stats.empresas.total}</p>
                  <p className="text-xs text-slate-500 mt-1">{stats.empresas.activas} activas</p>
                </div>
                <Building2 className="h-8 w-8 text-emerald-500" />
              </div>
            </div>
            <div className="bg-slate-800/50 border border-blue-500/30 rounded-2xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400">Usuarios</p>
                  <p className="text-2xl font-bold text-blue-400 mt-1">{stats.usuarios.total}</p>
                  <p className="text-xs text-slate-500 mt-1">{stats.usuarios.activos} activos</p>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </div>
            <div className="bg-slate-800/50 border border-amber-500/30 rounded-2xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400">Solo RindeNX</p>
                  <p className="text-2xl font-bold text-amber-400 mt-1">{stats.usuarios.por_tipo.rinde}</p>
                  <p className="text-xs text-slate-500 mt-1">usuarios</p>
                </div>
                <BarChart3 className="h-8 w-8 text-amber-500" />
              </div>
            </div>
            <div className="bg-slate-800/50 border border-purple-500/30 rounded-2xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400">Ambos</p>
                  <p className="text-2xl font-bold text-purple-400 mt-1">{stats.usuarios.por_tipo.ambos}</p>
                  <p className="text-xs text-slate-500 mt-1">usuarios puente</p>
                </div>
                <BarChart3 className="h-8 w-8 text-purple-500" />
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={() => router.push('/super-admin/empresas')}
            className="bg-slate-800/50 border border-emerald-500/30 hover:border-emerald-500 hover:bg-slate-800/80 rounded-2xl p-6 text-left transition-all group"
          >
            <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center mb-4">
              <Building2 className="w-6 h-6 text-emerald-400" />
            </div>
            <h3 className="text-white font-semibold mb-1 flex items-center gap-2">
              Empresas
              <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </h3>
            <p className="text-slate-400 text-sm mb-3">Gestionar hoja Config</p>
            <span className="text-xs text-emerald-400 font-medium">Disponible</span>
          </button>

          <button
            onClick={() => router.push('/super-admin/usuarios')}
            className="bg-slate-800/50 border border-blue-500/30 hover:border-blue-500 hover:bg-slate-800/80 rounded-2xl p-6 text-left transition-all group"
          >
            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="text-white font-semibold mb-1 flex items-center gap-2">
              Usuarios
              <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </h3>
            <p className="text-slate-400 text-sm mb-3">Gestionar hoja Users</p>
            <span className="text-xs text-emerald-400 font-medium">Disponible</span>
          </button>
        </div>

        <div className="bg-slate-800/30 border border-slate-700/30 rounded-2xl p-6">
          <h3 className="text-white font-semibold mb-3">Plan de 8 Fases del Proyecto</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-slate-300">Fase 1: Identificación de usuario (tipo_usuario)</span>
              <span className="text-emerald-400 text-xs ml-auto">Completada</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-slate-300">Fase 2: Dashboard super-admin con navegación</span>
              <span className="text-emerald-400 text-xs ml-auto">Completada</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-slate-300">Fase 3: Gestión de usuarios en la hoja Users</span>
              <span className="text-emerald-400 text-xs ml-auto">Completada</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-slate-300">Fase 4: Gestión de empresas (hoja Config)</span>
              <span className="text-emerald-400 text-xs ml-auto">Completada</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-slate-300">Fase 5: Puente GastosNX + RindeNX</span>
              <span className="text-emerald-400 text-xs ml-auto">Completada</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-slate-300">Fase 6: RindeNX - Fondos y asientos</span>
              <span className="text-emerald-400 text-xs ml-auto">Completada</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-slate-300">Fase 7: RindeNX - Puente de documentos</span>
              <span className="text-emerald-400 text-xs ml-auto">Completada</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-slate-300">Fase 8: Documentación y despliegue</span>
              <span className="text-emerald-400 text-xs ml-auto">Completada</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

