'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Alert } from '@/components/ui/Alert'
import { Badge } from '@/components/ui/Badge'
import { Check, Sparkles, ArrowLeft, Loader2, CreditCard, Clock, Mail } from 'lucide-react'

export default function RegistroPagoPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const planParam = searchParams.get('plan') || 'pro'
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    empresa_nombre: '',
    nombre_completo: '',
    telefono: '',
    plan: planParam,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const planes = {
    pro: {
      nombre: 'Pro',
      precio: 9900,
      usuarios: 3,
      boletas: '500 boletas/mes',
    },
    enterprise: {
      nombre: 'Enterprise',
      precio: 19990,
      usuarios: 10,
      boletas: 'Ilimitadas',
    },
  }

  const planActual = planes[formData.plan as 'pro' | 'enterprise'] || planes.pro

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      // Enviar solicitud de registro al admin
      const response = await fetch('/api/registro/pago', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Error en registro')
      }

      // Redirigir a confirmación con info de pago
      router.push(`/registro/confirmacion?plan=${formData.plan}&pago=pending`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      {/* ===== NAVBAR ===== */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-emerald-100/50 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/30">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">GastosSII</h1>
                <p className="text-xs text-gray-500">Registro {planActual.nombre}</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={() => router.push('/registro')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </div>
        </div>
      </nav>

      <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* ===== HEADER ===== */}
        <div className="text-center space-y-4 mb-8">
          <Badge variant="default" className="mb-2 bg-gradient-to-r from-emerald-500 to-teal-600">
            <CreditCard className="w-3 h-3 mr-1" />
            Plan {planActual.nombre}
          </Badge>
          <h1 className="text-3xl font-bold text-gray-900">
            Comienza con {planActual.nombre}
          </h1>
          <p className="text-gray-600">
            Regístrate y coordina el pago para activar tu cuenta
          </p>
        </div>

        {/* ===== CARD DE PLAN ===== */}
        <Card className="mb-8 border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">📦 Resumen del plan</h3>
              <Badge variant="success">${planActual.precio.toLocaleString('es-CL')}/mes</Badge>
            </div>
            <ul className="space-y-2 mb-4">
              <li className="flex items-start gap-2 text-sm text-gray-700">
                <Check className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                <span><strong>{planActual.usuarios} usuarios</strong> incluidos</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-gray-700">
                <Check className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                <span><strong>{planActual.boletas}</strong></span>
              </li>
              <li className="flex items-start gap-2 text-sm text-gray-700">
                <Check className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                <span><strong>OCR Azure AI</strong> - Misma tecnología para todos los planes</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-gray-700">
                <Check className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                <span><strong>Dashboard avanzado</strong> con reportes detallados</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-gray-700">
                <Check className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                <span><strong>Export CSV + Excel</strong></span>
              </li>
            </ul>
            
            {/* Selector de plan */}
            <div className="flex gap-2 mb-4">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, plan: 'pro' })}
                className={`flex-1 py-3 px-4 rounded-lg border-2 font-medium transition-all ${
                  formData.plan === 'pro'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <p className="font-semibold">Pro</p>
                <p className="text-xs">$9.900/mes</p>
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, plan: 'enterprise' })}
                className={`flex-1 py-3 px-4 rounded-lg border-2 font-medium transition-all ${
                  formData.plan === 'enterprise'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <p className="font-semibold">Enterprise</p>
                <p className="text-xs">$19.990/mes</p>
              </button>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <Clock className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-amber-800">
                  <p className="font-medium">Facturación anual</p>
                  <p className="text-amber-700">
                    Total: <strong>${(planActual.precio * 12).toLocaleString('es-CL')}</strong> por año
                    ({Math.round(planActual.precio / planActual.usuarios).toLocaleString('es-CL')}/usuario/mes)
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ===== FORMULARIO ===== */}
        <Card className="border-emerald-100 shadow-lg shadow-emerald-500/5">
          <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-emerald-100">
            <CardTitle className="text-xl text-gray-900">Completa tus datos</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-5">
            {error && (
              <Alert variant="error">
                <span>{error}</span>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Nombre Completo */}
              <Input
                id="nombre_completo"
                label="Nombre completo"
                placeholder="Ej: Juan Pérez"
                value={formData.nombre_completo}
                onChange={(e) => setFormData({ ...formData, nombre_completo: e.target.value })}
                required
                disabled={isLoading}
              />

              {/* Email */}
              <Input
                id="email"
                type="email"
                label="Correo electrónico"
                placeholder="tu@empresa.cl"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                disabled={isLoading}
              />

              {/* Teléfono */}
              <Input
                id="telefono"
                type="tel"
                label="Teléfono de contacto"
                placeholder="+56 9 1234 5678"
                value={formData.telefono}
                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                required
                disabled={isLoading}
              />

              {/* Contraseña */}
              <Input
                id="password"
                type="password"
                label="Contraseña"
                placeholder="Mínimo 6 caracteres"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                minLength={6}
                disabled={isLoading}
              />

              {/* Nombre Empresa */}
              <Input
                id="empresa_nombre"
                label="Nombre de tu empresa"
                placeholder="Ej: Mi Empresa SpA"
                value={formData.empresa_nombre}
                onChange={(e) => setFormData({ ...formData, empresa_nombre: e.target.value })}
                required
                disabled={isLoading}
              />

              {/* Info importante */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
                <div className="flex items-start gap-2">
                  <Mail className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium">¿Qué pasa después?</p>
                    <ul className="mt-1 space-y-1 text-blue-700">
                      <li>• Revisaremos tu solicitud manualmente</li>
                      <li>• Te contactaremos para coordinar el pago</li>
                      <li>• Métodos de pago: Transferencia, Fintoc, Flow, Mercado Pago</li>
                      <li>• Una vez confirmado el pago, recibirás tus accesos</li>
                      <li>• Tiempo estimado: 24 hrs hábiles</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                size="lg"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold shadow-lg shadow-emerald-500/30"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Enviando solicitud...
                  </>
                ) : (
                  <>
                    <Check className="h-5 w-5 mr-2" />
                    Solicitar Plan {planActual.nombre}
                  </>
                )}
              </Button>
            </form>

            {/* Términos */}
            <p className="text-xs text-gray-500 text-center">
              Al registrarte, aceptas nuestros{' '}
              <a href="#" className="text-emerald-600 hover:underline">términos de servicio</a>
            </p>
          </CardContent>
        </Card>

        {/* ===== CTA FREE ===== */}
        <div className="mt-8 text-center space-y-3">
          <p className="text-gray-600">
            ¿Prefieres probar gratis primero?
          </p>
          <Button
            variant="outline"
            onClick={() => router.push('/registro/free')}
            className="border-emerald-500 text-emerald-600 hover:bg-emerald-50"
          >
            Ver plan Free →
          </Button>
        </div>
      </div>
    </div>
  )
}