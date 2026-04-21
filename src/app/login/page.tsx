'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import LoginForm from '@/components/LoginForm'

export default function LoginPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async (email: string, password: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Error en login')
      }

      // Guardar sesión
      localStorage.setItem('expense_tracker_session', JSON.stringify(result.user))

      // Redirigir al dashboard
      router.push('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="w-full max-w-sm space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="text-5xl mb-2">📸</div>
          <h1 className="text-3xl font-bold text-primary">ExpenseTracker</h1>
          <p className="text-muted text-sm">Inicia sesión para continuar</p>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-error/10 text-error px-4 py-3 rounded-lg text-sm">
            ⚠️ {error}
          </div>
        )}

        {/* Formulario */}
        <LoginForm onLogin={handleLogin} isLoading={isLoading} />

        {/* Footer */}
        <p className="text-center text-xs text-text-muted">
          v0.5.0 • NXChile
        </p>
      </div>
    </main>
  )
}