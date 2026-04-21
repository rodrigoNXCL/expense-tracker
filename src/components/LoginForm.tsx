'use client'
import { useState } from 'react'

interface LoginFormProps {
  onLogin: (email: string, password: string) => void
  isLoading: boolean
}

export default function LoginForm({ onLogin, isLoading }: LoginFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email && password) {
      onLogin(email, password)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-4">
      {/* Email */}
      <div>
        <label className="block text-sm font-medium mb-1">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="input"
          placeholder="tu@empresa.cl"
          disabled={isLoading}
          required
        />
      </div>

      {/* Password */}
      <div>
        <label className="block text-sm font-medium mb-1">Contraseña</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="input"
          placeholder="••••••••"
          disabled={isLoading}
          required
        />
      </div>

      {/* Botón */}
      <button
        type="submit"
        disabled={isLoading || !email || !password}
        className="w-full btn btn-primary disabled:opacity-50"
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Iniciando...
          </span>
        ) : (
          '🔐 Iniciar Sesión'
        )}
      </button>

      {/* Ayuda */}
      <p className="text-xs text-text-muted text-center">
        ¿Olvidaste tu contraseña? Contacta al administrador
      </p>
    </form>
  )
}