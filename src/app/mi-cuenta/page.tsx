'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle, FileText, KeyRound, Loader2 } from 'lucide-react'

interface SessionData {
  email: string
  empresa_nombre: string
  plan: string
  rol: string
  tipo_usuario?: string
}

export default function MiCuentaPage() {
  const router = useRouter()
  const [session, setSession] = useState<SessionData | null>(null)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  useEffect(() => {
    fetch('/api/auth/me', { credentials: 'same-origin' })
      .then((r) => r.json())
      .then((d) => {
        if (d?.user) setSession(d.user)
        else router.push('/login')
      })
      .catch(() => router.push('/login'))
  }, [router])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (newPassword.length < 8) {
      setError('La nueva contraseña debe tener al menos 8 caracteres.')
      return
    }
    if (newPassword !== confirm) {
      setError('Las contraseñas nuevas no coinciden.')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ currentPassword, newPassword }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'No se pudo cambiar la contraseña')
      setDone(true)
      setCurrentPassword('')
      setNewPassword('')
      setConfirm('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error inesperado')
    } finally {
      setLoading(false)
    }
  }

  const isRinde = session?.tipo_usuario === 'rinde' || session?.tipo_usuario === 'ambos'

  return (
    <main className="min-h-screen bg-neutral-50 px-4 py-10">
      <div className="max-w-lg mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-gradient-to-tr from-amber-500 to-orange-600 rounded-lg flex items-center justify-center">
              <FileText className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-neutral-900">
              {isRinde ? 'Rinde' : 'Gastos'}<span className="text-amber-600">NX</span>
            </span>
          </div>
          <button
            onClick={() => router.push(isRinde ? '/rinde' : '/dashboard')}
            className="text-sm text-neutral-500 hover:text-neutral-800 transition-colors"
          >
            Volver
          </button>
        </div>

        <h1 className="text-2xl font-bold text-neutral-900 mb-1">Mi cuenta</h1>
        <p className="text-sm text-neutral-500 mb-6">
          {session?.email}
          {session?.empresa_nombre ? ` · ${session.empresa_nombre}` : ''}
        </p>

        <div className="bg-white rounded-2xl border border-black/5 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <KeyRound className="w-4 h-4 text-amber-600" />
            <h2 className="text-base font-semibold text-neutral-900">Cambiar contraseña</h2>
          </div>
          <p className="text-sm text-neutral-500 mb-5">
            Necesitas confirmar tu contraseña actual. Mínimo 8 caracteres.
          </p>

          {done && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl p-3 text-sm mb-4 flex items-start gap-2">
              <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>Tu contraseña fue actualizada. Usa la nueva desde el próximo ingreso.</span>
            </div>
          )}

          <form onSubmit={submit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 text-sm">
                {error}
              </div>
            )}
            <div>
              <label htmlFor="current" className="block text-sm font-medium text-neutral-700 mb-1.5">
                Contraseña actual
              </label>
              <input
                id="current"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:border-amber-500 focus:outline-none text-sm"
              />
            </div>
            <div>
              <label htmlFor="new" className="block text-sm font-medium text-neutral-700 mb-1.5">
                Nueva contraseña
              </label>
              <input
                id="new"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                minLength={8}
                required
                autoComplete="new-password"
                className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:border-amber-500 focus:outline-none text-sm"
                placeholder="Mínimo 8 caracteres"
              />
            </div>
            <div>
              <label htmlFor="confirm" className="block text-sm font-medium text-neutral-700 mb-1.5">
                Confirmar nueva contraseña
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
              />
            </div>
            <button
              type="submit"
              disabled={loading || !session}
              className="w-full px-6 py-3 bg-amber-500 text-white text-sm font-semibold rounded-full hover:bg-amber-600 transition-colors disabled:opacity-50 inline-flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Guardando…
                </>
              ) : (
                'Cambiar contraseña'
              )}
            </button>
          </form>

          <p className="text-xs text-neutral-400 mt-4">
            ¿No recuerdas la actual? Ciérra sesión y usa «¿Olvidaste tu contraseña?» en el
            inicio de sesión.
          </p>
        </div>
      </div>
    </main>
  )
}