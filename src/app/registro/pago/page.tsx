'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Alert } from '@/components/ui/Alert'
import { Badge } from '@/components/ui/Badge'
import { Check, ArrowLeft, Loader2, CreditCard, Clock, Mail } from 'lucide-react'
import Image from 'next/image'

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

  // ✅ PRECIOS ACTUALIZADOS - MENSUAL Y ANUAL (por usuario)
  const planes = {
    pro: {
      nombre: 'Pro',
      precioPorUsuarioAnual: 3300,   // / usuario / mes (anual)
      precioPorUsuarioMensual: 4000, // / usuario / mes (mes a mes)
      usuariosBase: 3,
      precioUsuarioExtraAnual: 2500,
      precioUsuarioExtraMensual: 3000,
      totalAnualMensual: 9900,   // 3 usuarios x $3.300
      totalMensualMensual: 12000, // 3 usuarios x $4.000
      boletas: '500 boletas/mes',
    },
  }

  const planActual = planes[formData.plan as 'pro'] || planes.pro

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      // ✅ 1. Enviar email de notificación (Web3Forms desde cliente)
      await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          access_key: process.env.NEXT_PUBLIC_WEB3FORMS_KEY,
          from_name: `GastosNX Registro - ${formData.nombre_completo}`,
          replyto: formData.email,
          email: 'gastos@nxchile.com',
          subject: `💳 Nuevo registro PAGO: ${formData.plan.toUpperCase()} - ${formData.empresa_nombre}`,
          message: `
Nuevo registro de plan pago recibido:

Nombre: ${formData.nombre_completo}
Email: ${formData.email}
Teléfono: ${formData.telefono}
Empresa: ${formData.empresa_nombre}
Plan: ${formData.plan}
Fecha: ${new Date().toLocaleString('es-CL')}

Acción requerida:
1. Contactar al cliente para coordinar pago
2. Una vez confirmado, activar usuario en Sheet
3. Asignar sheet_id_asociado
          `,
          redirect: 'false',
        }),
      })

      // ✅ 2. Guardar en base de datos (API)
      const response = await fetch('/api/registro/pago', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Error en registro')
      }

      // ✅ 3. Redirigir
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
              <Image
                src="/images/LogogastosNX.png"
                alt="GastosNX"
                width={693}
                height={138}
                priority
                loading="eager"
                className="h-10 w-auto object-contain"
              />
            </div>
            <Button variant="ghost" size="sm" onClick={() => router.push('/registro')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </div>
        </div>
      </nav>

      {/* ===== CONTENIDO PRINCIPAL ===== */}
      <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="text-center space-y-4 mb-8">
          <Badge variant="default" className="mb-2 bg-gradient-to-r from-emerald-500 to-teal-600">
            <CreditCard className="w-3 h-3 mr-1" />
            Plan {planActual.nombre}
          </Badge>
          <h1 className="text-3xl font-bold text-gray-900">Comienza con {planActual.nombre}</h1>
          <p className="text-gray-600">Regístrate y coordina el pago para activar tu cuenta</p>
        </div>

        {/* ===== CARD DE RESUMEN DEL PLAN ===== */}
        <Card className="mb-8 border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">📦 Resumen del plan</h3>
              <Badge variant="success">
                Pro
              </Badge>
            </div>

            <ul className="space-y-2 mb-4">
              <li className="flex items-start gap-2 text-sm text-gray-700">
                <Check className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                <span><strong>Hasta {planActual.usuariosBase} usuarios base</strong> + adicionales</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-gray-700">
                <Check className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                <span><strong>{planActual.boletas}</strong></span>
              </li>
              <li className="flex items-start gap-2 text-sm text-gray-700">
                <Check className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                <span><strong>OCR con Google AI</strong> - Misma tecnología para todos los planes</span>
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

            {/* Pricing Cards: Anual vs Mes a mes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              <div className="bg-white border-2 border-emerald-500 rounded-lg p-4">
                <p className="text-xs text-emerald-700 font-semibold mb-1">PAGO ANUAL · Recomendado</p>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-2xl font-bold text-gray-900">${planActual.precioPorUsuarioAnual.toLocaleString('es-CL')}</span>
                  <span className="text-gray-600 text-sm">/ usuario / mes</span>
                </div>
                <p className="text-xs text-gray-600">3 usuarios = <strong>${planActual.totalAnualMensual.toLocaleString('es-CL')} / mes</strong></p>
                <p className="text-xs text-gray-500">Usuario extra: ${planActual.precioUsuarioExtraAnual.toLocaleString('es-CL')} c/u</p>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-xs text-gray-700 font-semibold mb-1">PAGO MES A MES</p>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-2xl font-bold text-gray-900">${planActual.precioPorUsuarioMensual.toLocaleString('es-CL')}</span>
                  <span className="text-gray-600 text-sm">/ usuario / mes</span>
                </div>
                <p className="text-xs text-gray-600">3 usuarios = <strong>${planActual.totalMensualMensual.toLocaleString('es-CL')} / mes</strong></p>
                <p className="text-xs text-gray-500">Usuario extra: ${planActual.precioUsuarioExtraMensual.toLocaleString('es-CL')} c/u</p>
              </div>
            </div>

            {/* Info de Facturación */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <Clock className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-amber-800">
                  <p className="font-medium">El plan anual es más conveniente</p>
                  <p className="text-amber-700">
                    Ahorras <strong>${((planActual.precioPorUsuarioMensual - planActual.precioPorUsuarioAnual) * planActual.usuariosBase * 12).toLocaleString('es-CL')} al año</strong> por los 3 usuarios base.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ===== FORMULARIO DE REGISTRO ===== */}
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
              <Input
                id="nombre_completo"
                label="Nombre completo"
                placeholder="Ej: Juan Pérez"
                value={formData.nombre_completo}
                onChange={(e) => setFormData({ ...formData, nombre_completo: e.target.value })}
                required
                disabled={isLoading}
              />

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

              <Input
                id="empresa_nombre"
                label="Nombre de tu empresa"
                placeholder="Ej: Mi Empresa SpA"
                value={formData.empresa_nombre}
                onChange={(e) => setFormData({ ...formData, empresa_nombre: e.target.value })}
                required
                disabled={isLoading}
              />

              {/* Info del Proceso */}
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

            <p className="text-xs text-gray-500 text-center">
              Al registrarte, aceptas nuestros{' '}
              <a href="#" className="text-emerald-600 hover:underline">
                términos de servicio
              </a>
            </p>
          </CardContent>
        </Card>

        {/* Link a Plan Free */}
        <div className="mt-8 text-center space-y-3">
          <p className="text-gray-600">¿Prefieres probar gratis primero?</p>
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