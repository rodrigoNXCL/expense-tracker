'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { CheckCircle, FileText, Lock } from 'lucide-react'

function ResetForm() {
  const router = useRouter()
  const params = useSearchParams()
  const token = params.get('token') || ''

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.')
      return
    }
    if (password !== confirm) {
      setError('Las contraseñas no coinciden.')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/auth/reset-confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'No se pudo actualizar')
      setDone(true)
      setTimeout(() => router.push('/login'), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error inesperado')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-neutral-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-gradient-to-tr from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-neutral-900">
              Rinde<span className="text-amber-600">NX</span>
            </span>
          </div>
          <h1 className="text-2xl font-bold text-neutral-900 mb-2">Restablecer contraseña</h1>
          <p className="text-sm text-neutral-500">Elige una nueva contraseña para tu cuenta.</p>
        </div>

        <div className="bg-white rounded-2xl border border-black/5 p-8 shadow-sm">
          {done ? (
            <div className="text-center py-4">
              <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
              <p className="text-neutral-900 font-semibold mb-1">Contraseña actualizada</p>
              <p className="text-sm text-neutral-500">Te redirigimos al inicio de sesión…</p>
            </div>
          ) : !token ? (
            <div className="text-center py-4">
              <Lock className="w-10 h-10 text-neutral-300 mx-auto mb-4" />
              <p className="text-neutral-900 font-semibold mb-1">Enlace no válido</p>
              <p className="text-sm text-neutral-500 mb-6">
                Solicita un nuevo enlace desde la pantalla de inicio de sesión.
              </p>
              <button
                onClick={() => router.push('/login')}
                className="px-6 py-3 bg-amber-500 text-white text-sm font-semibold rounded-full hover:bg-amber-600 transition-colors"
              >
                Volver al inicio de sesión
              </button>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 text-sm">
                  {error}
                </div>
              )}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-neutral-700 mb-1.5">
                  Nueva contraseña
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={8}
                  required
                  autoComplete="new-password"
                  className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:border-amber-500 focus:outline-none text-sm"
                  placeholder="Mínimo 8 caracteres"
                />
              </div>
              <div>
                <label htmlFor="confirm" className="block text-sm font-medium text-neutral-700 mb-1.5">
                  Confirmar contraseña
                </label>
                <input
                  id="confirm"
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  minLength={8}
                  required
                  autoComplete="new-password"
                  className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:border-amber-500 focus:outline-none text-sm"
                  placeholder="Repite la contraseña"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-3 bg-amber-500 text-white text-sm font-semibold rounded-full hover:bg-amber-600 transition-colors disabled:opacity-50"
              >
                {loading ? 'Guardando…' : 'Guardar nueva contraseña'}
              </button>
              <button
                type="button"
                onClick={() => router.push('/login')}
                className="w-full text-center text-sm text-neutral-500 hover:text-neutral-700 transition-colors"
              >
                Cancelar
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-neutral-50" />}>
      <ResetForm />
    </Suspense>
  )
}