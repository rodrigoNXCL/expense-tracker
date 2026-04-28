'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Alert } from '@/components/ui/Alert'
import { Badge } from '@/components/ui/Badge'
import { Mail, Lock, Sparkles, Check, Loader2 } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
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

      localStorage.setItem('expense_tracker_session', JSON.stringify(result.user))
      router.push('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      <div className="w-full max-w-md space-y-8">
        
        {/* ===== HEADER ===== */}
        <div className="text-center space-y-4 animate-fade-in">
          {/* Logo */}
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl shadow-2xl shadow-emerald-500/30 mb-2">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          
          {/* Título */}
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-1">GastosSII</h1>
            <p className="text-gray-600">Controla tus gastos de forma inteligente</p>
          </div>

          {/* Badge SII */}
          <Badge variant="success" className="inline-flex">
            <Check className="w-3 h-3 mr-1" />
            Compatible con el SII de Chile
          </Badge>
        </div>

        {/* ===== FORMULARIO ===== */}
        <Card className="p-8 space-y-6 shadow-xl">
          {/* Error Message */}
          {error && (
            <Alert variant="error">
              <span>{error}</span>
            </Alert>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email */}
            <div className="relative">
              <Input
                id="email"
                type="email"
                label="Correo electrónico"
                placeholder="tu@empresa.cl"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="pl-12"
              />
              <Mail className="absolute left-3 top-9 w-5 h-5 text-gray-400" />
            </div>

            {/* Password */}
            <div className="relative">
              <Input
                id="password"
                type="password"
                label="Contraseña"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                className="pl-12"
              />
              <Lock className="absolute left-3 top-9 w-5 h-5 text-gray-400" />
            </div>

            {/* Recordarme + Olvidé contraseña */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-gray-600">Recordarme</span>
              </label>
              <button
                type="button"
                className="text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Iniciando sesión...
                </>
              ) : (
                <>
                  <Lock className="w-5 h-5 mr-2" />
                  Iniciar sesión
                </>
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">¿Nuevo en GastosSII?</span>
            </div>
          </div>

          {/* CTA Registro */}
          <Link href="/">
            <Button variant="outline" size="lg" className="w-full">
              Crear cuenta gratis →
            </Button>
          </Link>
        </Card>

        {/* ===== FOOTER ===== */}
        <div className="text-center space-y-2">
          <p className="text-sm text-gray-600">
            ¿Necesitas ayuda?{' '}
            <button className="text-emerald-600 hover:text-emerald-700 font-medium underline underline-offset-2">
              Contacta al administrador
            </button>
          </p>
          <p className="text-xs text-gray-400">
            v0.8.0 • GastosSII by NXChile
          </p>
        </div>
      </div>
    </div>
  )
}