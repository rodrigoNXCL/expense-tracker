'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Alert } from '@/components/ui/Alert'
import { Badge } from '@/components/ui/Badge'
import { saveSession } from '@/lib/auth'
import { Mail, Lock, Check, Loader2, X, MessageCircle } from 'lucide-react'
import Image from 'next/image'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  
  // Estados para modales
  const [showRecoveryModal, setShowRecoveryModal] = useState(false)
  const [showContactModal, setShowContactModal] = useState(false)
  const [recoveryForm, setRecoveryForm] = useState({ email: '', empresa: '' })
  const [contactForm, setContactForm] = useState({ nombre: '', email: '', mensaje: '' })
  const [formLoading, setFormLoading] = useState(false)
  const [formSuccess, setFormSuccess] = useState<string | null>(null)

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

      // ADR-002: la cookie httpOnly ya fue seteada por el servidor.
      // Guardamos solo para el caché en memoria del cliente.
      saveSession(result.user)
      router.push('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setIsLoading(false)
    }
  }

  // Web3Forms: Recuperación de contraseña
  const handleRecoverySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormLoading(true)
    setFormSuccess(null)

    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          access_key: process.env.NEXT_PUBLIC_WEB3FORMS_KEY,
          from_name: 'GastosNX - Recuperación',
          email: 'gastos@nxchile.com',
          subject: `🔐 Solicitud recuperación: ${recoveryForm.email}`,
          message: `
            Nueva solicitud de recuperación de contraseña:
            
            Email del usuario: ${recoveryForm.email}
            Empresa: ${recoveryForm.empresa}
            Fecha: ${new Date().toLocaleString('es-CL')}
            
            Acción requerida: Verificar usuario y enviar nueva contraseña.
          `,
          redirect: 'false',
        }),
      })

      const result = await response.json()

      if (result.success) {
        setFormSuccess('✅ Solicitud enviada. Te contactaremos a la brevedad.')
        setRecoveryForm({ email: '', empresa: '' })
        setTimeout(() => setShowRecoveryModal(false), 3000)
      } else {
        throw new Error('Error enviando formulario')
      }
    } catch (err) {
      setError('Error enviando solicitud. Intenta nuevamente.')
    } finally {
      setFormLoading(false)
    }
  }

  // Web3Forms: Contacto administrador
  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormLoading(true)
    setFormSuccess(null)

    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          access_key: process.env.NEXT_PUBLIC_WEB3FORMS_KEY,
          from_name: contactForm.nombre || 'Usuario GastosNX',
          replyto: contactForm.email,
          email: 'gastos@nxchile.com',
          subject: `📩 Contacto desde landing: ${contactForm.nombre || 'Sin nombre'}`,
          message: `
            Nuevo mensaje de contacto:
            
            Nombre: ${contactForm.nombre}
            Email: ${contactForm.email}
            Mensaje: ${contactForm.mensaje}
            Fecha: ${new Date().toLocaleString('es-CL')}
          `,
          redirect: 'false',
        }),
      })

      const result = await response.json()

      if (result.success) {
        setFormSuccess('✅ Mensaje enviado. Te responderemos pronto.')
        setContactForm({ nombre: '', email: '', mensaje: '' })
        setTimeout(() => setShowContactModal(false), 3000)
      } else {
        throw new Error('Error enviando formulario')
      }
    } catch (err) {
      setError('Error enviando mensaje. Intenta nuevamente.')
    } finally {
      setFormLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      <div className="w-full max-w-md space-y-8">
        
        {/* ===== HEADER ===== */}
        <div className="text-center space-y-4 animate-fade-in">
          {/* Logo */}
          <div className="mb-3">
            <Image
              src="/images/LogogastosNX.png"
              alt="GastosNX"
              width={693}
              height={138}
              priority
              loading="eager"
              className="h-16 w-auto object-contain mx-auto"
            />
          </div>

          {/* Título */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">Inicia sesión</h1>
            <p className="text-gray-600">Controla tus gastos de forma inteligente</p>
          </div>

          {/* Badge SII */}
          <Badge variant="success" className="inline-flex">
            <Check className="w-3 h-3 mr-1" />
            Compatible con el SII de Chile
          </Badge>
        </div>

        {/* ===== FORMULARIO LOGIN ===== */}
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
                onClick={() => setShowRecoveryModal(true)}
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
              <span className="px-4 bg-white text-gray-500">¿Nuevo en GastosNX?</span>
            </div>
          </div>

          {/* CTA Registro - ACTUALIZADO */}
          <Button
            variant="outline"
            size="lg"
            className="w-full"
            onClick={() => router.push('/registro/free')}
          >
            Crear cuenta Gratis →
          </Button>
        </Card>

        {/* ===== FOOTER ===== */}
        <div className="text-center space-y-2">
          <p className="text-sm text-gray-600">
            ¿Necesitas ayuda?{' '}
            <button
              onClick={() => setShowContactModal(true)}
              className="text-emerald-600 hover:text-emerald-700 font-medium underline underline-offset-2"
            >
              Contacta al Administrador
            </button>
          </p>
          <p className="text-xs text-gray-400">
            v0.8.0 • GastosNX by NXChile
          </p>
        </div>
      </div>

      {/* ===== MODAL RECUPERACIÓN CONTRASEÑA ===== */}
      {showRecoveryModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full bg-white">
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900">Recuperar contraseña</h3>
                <button
                  onClick={() => { setShowRecoveryModal(false); setError(null); setFormSuccess(null); }}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              {formSuccess && (
                <Alert variant="success">
                  <span>{formSuccess}</span>
                </Alert>
              )}
              
              <form onSubmit={handleRecoverySubmit} className="space-y-4">
                <Input
                  label="Tu correo electrónico"
                  type="email"
                  placeholder="tu@empresa.cl"
                  value={recoveryForm.email}
                  onChange={(e) => setRecoveryForm({ ...recoveryForm, email: e.target.value })}
                  required
                  disabled={formLoading}
                />
                <Input
                  label="Nombre de tu empresa"
                  placeholder="Ej: Mi Empresa SpA"
                  value={recoveryForm.empresa}
                  onChange={(e) => setRecoveryForm({ ...recoveryForm, empresa: e.target.value })}
                  required
                  disabled={formLoading}
                />
                <p className="text-xs text-gray-500">
                  Te enviaremos una nueva contraseña a tu correo registrado.
                </p>
                <Button
                  type="submit"
                  size="lg"
                  disabled={formLoading}
                  className="w-full"
                >
                  {formLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4 mr-2" />
                      Solicitar recuperación
                    </>
                  )}
                </Button>
              </form>
            </div>
          </Card>
        </div>
      )}

      {/* ===== MODAL CONTACTO ADMINISTRADOR ===== */}
      {showContactModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full bg-white">
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900">Contactar administrador</h3>
                <button
                  onClick={() => { setShowContactModal(false); setError(null); setFormSuccess(null); }}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              {formSuccess && (
                <Alert variant="success">
                  <span>{formSuccess}</span>
                </Alert>
              )}
              
              <form onSubmit={handleContactSubmit} className="space-y-4">
                <Input
                  label="Tu nombre"
                  placeholder="Ej: Juan Pérez"
                  value={contactForm.nombre}
                  onChange={(e) => setContactForm({ ...contactForm, nombre: e.target.value })}
                  required
                  disabled={formLoading}
                />
                <Input
                  label="Tu correo"
                  type="email"
                  placeholder="tu@email.cl"
                  value={contactForm.email}
                  onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                  required
                  disabled={formLoading}
                />
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none resize-none"
                  placeholder="¿En qué podemos ayudarte?"
                  rows={4}
                  value={contactForm.mensaje}
                  onChange={(e) => setContactForm({ ...contactForm, mensaje: e.target.value })}
                  required
                  disabled={formLoading}
                />
                <Button
                  type="submit"
                  size="lg"
                  disabled={formLoading}
                  className="w-full"
                >
                  {formLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Enviar mensaje
                    </>
                  )}
                </Button>
              </form>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}