'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSession, logout } from '@/lib/auth'

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

  useEffect(() => {
    const session = getSession()
    if (!session || !session.activo) {
      router.replace('/login')
      return
    }
    setUser(session)
    loadExpenses()
    setLoading(false)
  }, [router])

  const loadExpenses = async () => {
    try {
      const session = getSession()
      if (!session) {
        console.error('❌ No hay sesión')
        return
      }
      const response = await fetch('/api/expenses', {
        headers: {
          'x-session': JSON.stringify(session),
        },
      })
      const result = await response.json()
      if (response.ok) {
        setExpenses(result.expenses || [])
      }
    } catch (error) {
      console.error('❌ Error cargando gastos:', error)
    }
  }

  const handleExport = async () => {
    setExporting(true)
    try {
      const session = getSession()
      if (!session) {
        console.error('❌ No hay sesión')
        return
      }
      const response = await fetch('/api/export', {
        headers: {
          'x-session': JSON.stringify(session),
        },
      })
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
      console.error('❌ Error exportando:', error)
    } finally {
      setExporting(false)
    }
  }

  const handleLogout = () => {
    logout()
    router.replace('/login')
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4">
        <div className="card text-center space-y-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted">Cargando dashboard...</p>
        </div>
      </main>
    )
  }

  if (!user) {
    return null
  }

  const totalMonto = expenses.reduce((sum, exp) => sum + exp.monto, 0)

  return (
    <main className="min-h-screen p-4 bg-bg">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-primary">Dashboard</h1>
          <button onClick={handleLogout} className="text-sm text-primary hover:underline">
            🔐 Cerrar sesión
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="card p-4 space-y-2">
            <p className="text-sm text-muted">Usuario</p>
            <p className="text-lg font-semibold">{user.email}</p>
            <p className="text-sm text-muted">{user.empresa_nombre}</p>
          </div>
          <div className="card p-4 space-y-2">
            <p className="text-sm text-muted">Plan</p>
            <div className="flex gap-2">
              <span className="px-2 py-1 bg-primary/10 text-primary rounded text-sm">
                {user.plan}
              </span>
              <span className="px-2 py-1 bg-success/10 text-success rounded text-sm">
                {user.boletas_usadas}/{user.limite_boletas} boletas
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="card p-4 text-center">
            <p className="text-2xl font-bold text-primary">{expenses.length}</p>
            <p className="text-xs text-muted">Gastos registrados</p>
          </div>
          <div className="card p-4 text-center">
            <p className="text-2xl font-bold text-success">${totalMonto.toLocaleString('es-CL')}</p>
            <p className="text-xs text-muted">Total acumulado</p>
          </div>
          <div className="card p-4 text-center">
            <p className="text-2xl font-bold text-warning">{user.limite_boletas - user.boletas_usadas}</p>
            <p className="text-xs text-muted">Boletas restantes</p>
          </div>
        </div>

        <div className="flex gap-2">
          <button onClick={() => router.push('/')} className="flex-1 btn btn-primary">
            📷 Nuevo Gasto
          </button>
          <button
            onClick={handleExport}
            disabled={exporting || expenses.length === 0}
            className="flex-1 btn btn-outline disabled:opacity-50"
          >
            {exporting ? 'Exportando...' : '📄 Exportar CSV'}
          </button>
        </div>
        
        {/* Lista de gastos */}
<div className="card p-4">
  <h2 className="font-semibold mb-3">
    Gastos Recientes
    {user.rol === 'admin' && <span className="text-xs text-muted ml-2">(Todos los usuarios)</span>}
  </h2>
  
  {expenses.length === 0 ? (
    <p className="text-sm text-muted text-center py-8">
      Sin gastos registrados aún.
      <br />
      <button onClick={() => router.push('/')} className="text-primary hover:underline mt-2">
        Registrar tu primer gasto →
      </button>
    </p>
  ) : (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
      {/* Reemplazar desde línea ~217 */}
<thead>
  <tr className="border-b"><th className="text-left py-2">Fecha</th><th className="text-left py-2">Proveedor</th><th className="text-right py-2">Monto</th><th className="text-left py-2">Categoría</th><th className="text-left py-2">Ver</th>{user.rol === 'admin' && <th className="text-left py-2">Usuario</th>}</tr>
</thead>
<tbody>
  {expenses.slice(0, 10).map((exp, idx) => (
    <tr key={idx} className="border-b last:border-0"><td className="py-2">{exp.fecha}</td><td className="py-2">{exp.proveedor}</td><td className="text-right py-2 font-medium">${exp.monto.toLocaleString('es-CL')}</td><td className="py-2"><span className="px-2 py-1 bg-primary/10 text-primary rounded text-xs">{exp.categoria}</span></td><td className="py-2">{exp.image_url ? <a href={exp.image_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-xs">📄 Ver</a> : <span className="text-muted text-xs">—</span>}</td>{user.rol === 'admin' && <td className="py-2 text-xs text-muted">{exp.creado_por}</td>}</tr>
  ))}
</tbody>  
      </table>
      {expenses.length > 10 && (
        <p className="text-xs text-muted text-center mt-2">
          Mostrando 10 de {expenses.length} gastos (exporta CSV para ver todos)
        </p>
      )}
    </div>
  )}
</div>

        <p className="text-center text-xs text-text-muted">v0.5.0 • NXChile</p>
      </div>
    </main>
  )
}