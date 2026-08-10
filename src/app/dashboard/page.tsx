'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSession, loadSession, logout } from '@/lib/auth'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import {
  User, Shield, BarChart3, DollarSign, Camera, Download,
  LogOut, Building, CheckCircle, AlertTriangle, XCircle,
  Eye, Receipt, TrendingUp, Wallet, Loader2, X
} from 'lucide-react'
import Image from 'next/image'

interface Expense {
  timestamp: string
  fecha: string
  rut: string
  proveedor: string
  monto: number
  categoria: string
  boleta_numero: string
  giro: string
  notas: string
  ocr_confidence: number
  image_url: string
  creado_por: string
}

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)
  const [showBreakdown, setShowBreakdown] = useState(false)

  useEffect(() => {
    ;(async () => {
      const session = await loadSession()
      if (!session || !session.activo) {
        router.replace('/login')
        return
      }
      setUser(session)
      await loadExpenses()
      setLoading(false)
    })()
  }, [router])

  const loadExpenses = async () => {
    try {
      const response = await fetch('/api/expenses', { credentials: 'same-origin' })
      const result = await response.json()
      if (response.ok) setExpenses(result.expenses || [])
    } catch (error) {
      console.error('Error cargando gastos:', error)
    }
  }

  const handleExport = async () => {
    setExporting(true)
    try {
      const response = await fetch('/api/export', { credentials: 'same-origin' })
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `gastos_${user.empresa_nombre}_${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error('Error exportando:', error)
    } finally {
      setExporting(false)
    }
  }

  const handleLogout = async () => {
    await logout()
    router.replace('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-teal-50">
        <Card className="text-center p-8 space-y-4">
          <Loader2 className="w-10 h-10 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground font-medium">Cargando dashboard...</p>
        </Card>
      </div>
    )
  }

  if (!user) return null

  const totalMonto = expenses.reduce((sum, exp) => sum + exp.monto, 0)
  const boletasRestantes = user.limite_boletas - user.boletas_usadas
  const porcentajeUsado = (user.boletas_usadas / user.limite_boletas) * 100

  // Desglose de gastos por categoría (para el modal del Total Acumulado)
  const categoriasBreakdown = (() => {
    const map = new Map<string, number>()
    for (const exp of expenses) {
      const cat = exp.categoria || 'Sin categoría'
      map.set(cat, (map.get(cat) || 0) + exp.monto)
    }
    return Array.from(map.entries())
      .map(([categoria, monto]) => ({ categoria, monto }))
      .sort((a, b) => b.monto - a.monto)
  })()

  const getAlertConfig = () => {
    if (porcentajeUsado >= 100) {
      return {
        variant: 'error' as const,
        icon: <XCircle className="h-5 w-5" />,
        title: 'Límite Alcanzado',
        message: `Has usado ${user.boletas_usadas} de ${user.limite_boletas} boletas. Contacta a tu administrador.`,
        bg: 'from-red-500 to-rose-600',
        barColor: 'bg-white'
      }
    }
    if (porcentajeUsado >= 90) {
      return {
        variant: 'warning' as const,
        icon: <AlertTriangle className="h-5 w-5" />,
        title: 'Casi Llegas al Límite',
        message: `Te quedan ${boletasRestantes} boletas disponibles`,
        bg: 'from-amber-500 to-orange-600',
        barColor: 'bg-white'
      }
    }
    if (porcentajeUsado >= 80) {
      return {
        variant: 'warning' as const,
        icon: <AlertTriangle className="h-5 w-5" />,
        title: 'Uso Elevado',
        message: `Te quedan ${boletasRestantes} boletas (${porcentajeUsado.toFixed(0)}% usado)`,
        bg: 'from-amber-400 to-yellow-500',
        barColor: 'bg-white'
      }
    }
    return {
      variant: 'success' as const,
      icon: <CheckCircle className="h-5 w-5" />,
      title: 'Boletas Disponibles',
      message: `${boletasRestantes} boletas restantes este mes`,
      bg: 'from-emerald-500 to-teal-600',
      barColor: 'bg-white'
    }
  }

  const alertConfig = getAlertConfig()

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      {/* ===== NAVBAR ===== */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-emerald-100/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Image
                src="/images/LogogastosNX.png"
                alt="GastosNX"
                width={693}
                height={138}
                priority
                loading="eager"
                className="h-10 w-auto object-contain"
              />
              <div className="hidden sm:block">
                <p className="text-xs text-gray-500">{user.empresa_nombre}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-full border border-emerald-200">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-sm text-gray-700 font-medium">{user.email}</span>
              </div>
              <Button variant="ghost" size="sm" onClick={handleLogout} className="text-gray-600 hover:text-emerald-600">
                <LogOut className="h-4 w-4 mr-2" />
                Salir
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* ===== ALERTA DE LÍMITE ===== */}
        <div className="max-w-3xl mx-auto">
          <Card className="overflow-hidden border-0 shadow-lg">
            <div className={`bg-gradient-to-r ${alertConfig.bg} p-4`}>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 text-white mt-0.5">
                  {alertConfig.icon}
                </div>
                <div className="flex-1 text-white">
                  <p className="font-bold text-sm">{alertConfig.title}</p>
                  <p className="text-white/90 text-sm mt-1">{alertConfig.message}</p>
                  <div className="w-full bg-white/30 rounded-full h-2 mt-3 overflow-hidden">
                    <div
                      className={`h-2 rounded-full ${alertConfig.barColor} transition-all duration-500`}
                      style={{ width: `${Math.min(porcentajeUsado, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* ===== STATS CARDS ===== */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="group hover:shadow-xl transition-all duration-300 border-emerald-100 bg-gradient-to-br from-white to-emerald-50/50">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-md">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Usuario</p>
                  <p className="text-sm text-gray-900 font-semibold">{user.rol === 'admin' ? 'Administrador' : 'Usuario'}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm font-bold text-gray-900 break-all">{user.email}</p>
              <div className="flex items-center gap-1.5 mt-2 text-xs text-gray-500">
                <Building className="h-3 w-3" />
                <span>{user.empresa_nombre}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-xl transition-all duration-300 border-blue-100 bg-gradient-to-br from-white to-blue-50/50">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-md">
                  <Shield className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Plan</p>
                  <p className="text-sm text-gray-900 font-semibold capitalize">{user.plan}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Badge className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white border-0">
                  {user.boletas_usadas}/{user.limite_boletas}
                </Badge>
                <span className="text-xs text-gray-500">boletas usadas</span>
              </div>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-xl transition-all duration-300 border-purple-100 bg-gradient-to-br from-white to-purple-50/50">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white shadow-md">
                  <BarChart3 className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Gastos</p>
                  <p className="text-sm text-gray-900 font-semibold">Registrados</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {expenses.length}
              </p>
              <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                <TrendingUp className="h-3 w-3" />
                <span>este mes</span>
              </div>
            </CardContent>
          </Card>

          <Card 
            onClick={() => expenses.length > 0 && setShowBreakdown(true)}
            className={`group hover:shadow-xl transition-all duration-300 border-emerald-100 bg-gradient-to-br from-white to-emerald-50/50 ${expenses.length > 0 ? 'cursor-pointer' : 'cursor-default'}`}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center text-white shadow-md">
                  <Wallet className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total</p>
                  <p className="text-sm text-gray-900 font-semibold">Acumulado</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                ${totalMonto.toLocaleString('es-CL')}
              </p>
              <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                <DollarSign className="h-3 w-3" />
                <span>CLP</span>
                {expenses.length > 0 && (
                  <span className="ml-auto inline-flex items-center gap-1 text-emerald-600 font-medium">
                    Ver detalle
                    <TrendingUp className="h-3 w-3" />
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ===== ACCIONES ===== */}
        <div className="flex flex-wrap gap-3">
          <Button
            size="lg"
            onClick={() => router.push('/captura')}
            disabled={porcentajeUsado >= 100}
            className="flex-1 min-w-[200px] bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:scale-[1.02] transition-all"
          >
            <Camera className="h-5 w-5 mr-2" />
            Nuevo Gasto
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={handleExport}
            disabled={exporting || expenses.length === 0}
            className="flex-1 min-w-[200px] border-2 border-emerald-500 text-emerald-600 hover:bg-emerald-50 font-semibold"
          >
            {exporting ? (
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
            ) : (
              <Download className="h-5 w-5 mr-2" />
            )}
            {exporting ? 'Exportando...' : 'Exportar CSV'}
          </Button>
          {user.rol === 'admin' && (
            <Button
              variant="outline"
              size="lg"
              onClick={() => router.push('/admin')}
              className="flex-1 min-w-[200px] border-2 border-emerald-500 text-emerald-600 hover:bg-emerald-50 font-semibold"
            >
              <Shield className="h-5 w-5 mr-2" />
              Admin
            </Button>
          )}
        </div>

        {/* ===== TABLA DE GASTOS ===== */}
        <Card className="border-emerald-100 shadow-lg shadow-emerald-500/5 overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 px-6 py-4 border-b border-emerald-100">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Gastos Recientes</h2>
                {user.rol === 'admin' && (
                  <p className="text-xs text-gray-500 mt-0.5">Todos los usuarios de tu empresa</p>
                )}
              </div>
              <Badge variant="secondary" className="bg-white border-emerald-200 text-emerald-700">
                {expenses.length} registros
              </Badge>
            </div>
          </div>
          
          <CardContent className="p-0">
            {expenses.length === 0 ? (
              <div className="text-center py-16 px-4">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center">
                  <Receipt className="h-10 w-10 text-emerald-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Sin gastos registrados</h3>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                  Comienza registrando tu primer gasto. Es rápido y fácil con nuestro OCR inteligente.
                </p>
                <Button
                  onClick={() => router.push('/captura')}
                  disabled={porcentajeUsado >= 100}
                  className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold"
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Registrar tu primer gasto
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto -mx-6 px-6">
                <table className="w-full min-w-[700px]">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wide whitespace-nowrap">Fecha</th>
                      <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wide whitespace-nowrap">Proveedor</th>
                      <th className="text-right py-4 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wide whitespace-nowrap">Monto</th>
                      <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wide whitespace-nowrap">Categoría</th>
                      <th className="text-center py-4 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wide whitespace-nowrap">Ver</th>
                      {user.rol === 'admin' && (
                        <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wide whitespace-nowrap">Usuario</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {expenses.slice(0, 10).map((exp, idx) => (
                      <tr key={idx} className="border-b border-gray-50 hover:bg-gradient-to-r hover:from-emerald-50/50 hover:to-teal-50/50 transition-all">
                        <td className="py-4 px-6 text-sm text-gray-700 font-medium whitespace-nowrap">{exp.fecha}</td>
                        <td className="py-4 px-6 text-sm font-semibold text-gray-900 whitespace-nowrap">{exp.proveedor}</td>
                        <td className="text-right py-4 px-6 whitespace-nowrap">
                          <span className="text-sm font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                            ${exp.monto.toLocaleString('es-CL')}
                          </span>
                        </td>
                        <td className="py-4 px-6 whitespace-nowrap">
                          <Badge 
                            variant="success" 
                            className="bg-white text-emerald-800 border-emerald-300 font-semibold whitespace-nowrap"
                          >
                            {exp.categoria}
                          </Badge>
                        </td>
                        <td className="text-center py-4 px-6 whitespace-nowrap">
                          {exp.image_url ? (
                            <a
                              href={exp.image_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-emerald-600 hover:text-emerald-700 text-sm font-medium transition-colors"
                            >
                              <Eye className="h-3.5 w-3.5" />
                              Ver
                            </a>
                          ) : (
                            <span className="text-gray-400 text-sm">—</span>
                          )}
                        </td>
                        {user.rol === 'admin' && (
                          <td className="py-4 px-6 text-xs text-gray-500 whitespace-nowrap">{exp.creado_por}</td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            
            {expenses.length > 10 && (
              <div className="text-center py-6 bg-gray-50">
                <p className="text-sm text-gray-500 mb-3">
                  Mostrando 10 de {expenses.length} gastos
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExport}
                  className="border-emerald-500 text-emerald-600 hover:bg-emerald-50"
                >
                  Exportar CSV para ver todos
                  <TrendingUp className="h-3 w-3 ml-2" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ===== FOOTER ===== */}
        <div className="text-center py-6">
          <p className="text-sm text-gray-500">
            v0.8.0 • GastosNX by NXChile
          </p>
        </div>
      </div>

      {/* ===== BOTTOM NAV (MÓVIL) ===== */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-emerald-100 sm:hidden z-50 shadow-lg">
        <div className="flex items-center justify-around py-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/dashboard')}
            className="flex flex-col items-center gap-1 h-auto py-2 px-4 text-emerald-600"
          >
            <BarChart3 className="h-5 w-5" />
            <span className="text-xs font-medium">Dashboard</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/captura')}
            disabled={porcentajeUsado >= 100}
            className="flex flex-col items-center gap-1 h-auto py-2 px-4"
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              porcentajeUsado >= 100 ? 'bg-gray-200' : 'bg-gradient-to-br from-emerald-500 to-teal-600'
            }`}>
              <Camera className={`h-5 w-5 ${porcentajeUsado >= 100 ? 'text-gray-400' : 'text-white'}`} />
            </div>
            <span className={`text-xs font-medium ${porcentajeUsado >= 100 ? 'text-gray-400' : 'text-emerald-600'}`}>Nuevo</span>
          </Button>
          {user.rol === 'admin' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/admin')}
              className="flex flex-col items-center gap-1 h-auto py-2 px-4 text-emerald-600"
            >
              <Shield className="h-5 w-5" />
              <span className="text-xs font-medium">Admin</span>
            </Button>
          )}
        </div>
      </nav>

      <div className="h-24 sm:hidden" />

      {/* ===== MODAL: DESGLOSE POR CATEGORÍA ===== */}
      {showBreakdown && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowBreakdown(false)}
        >
          <Card
            className="w-full max-w-md bg-white shadow-2xl overflow-hidden border-emerald-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">Total Acumulado</h3>
                <p className="text-emerald-50 text-sm">Desglose por categoría</p>
              </div>
              <button
                onClick={() => setShowBreakdown(false)}
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
                aria-label="Cerrar"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <CardContent className="p-6">
              <p className="text-3xl font-bold text-gray-900 mb-6">
                ${totalMonto.toLocaleString('es-CL')}
                <span className="text-sm font-medium text-gray-500 ml-2">total</span>
              </p>
              {categoriasBreakdown.length === 0 ? (
                <p className="text-sm text-gray-500">Aún no hay gastos registrados.</p>
              ) : (
                <ul className="space-y-4">
                  {categoriasBreakdown.map(({ categoria, monto }) => {
                    const porcentaje = totalMonto > 0 ? (monto / totalMonto) * 100 : 0
                    return (
                      <li key={categoria}>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-sm font-semibold text-gray-800">{categoria}</span>
                          <span className="text-sm font-bold text-emerald-700">
                            ${monto.toLocaleString('es-CL')}
                            <span className="text-xs font-medium text-gray-400 ml-1">
                              ({porcentaje.toFixed(0)}%)
                            </span>
                          </span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                          <div
                            className="h-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500"
                            style={{ width: `${Math.min(porcentaje, 100)}%` }}
                          />
                        </div>
                      </li>
                    )
                  })}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}