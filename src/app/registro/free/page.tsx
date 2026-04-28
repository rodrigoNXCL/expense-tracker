'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Alert } from '@/components/ui/Alert'
import { Badge } from '@/components/ui/Badge'
import { Check, Sparkles, ArrowLeft, Loader2, Mail } from 'lucide-react'

export default function RegistroFreePage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    empresa_nombre: '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      // Enviar solicitud de registro al admin
      const response = await fetch('/api/registro/free', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Error en registro')
      }

      // Redirigir a confirmación
      router.push('/registro/confirmacion?plan=free')
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
                <p className="text-xs text-gray-500">Registro Free</p>
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
          <Badge variant="success" className="mb-2">
            <Check className="w-3 h-3 mr-1" />
            Plan Gratuito
          </Badge>
          <h1 className="text-3xl font-bold text-gray-900">
            Comienza gratis con GastosSII
          </h1>
          <p className="text-gray-600">
            Perfecto para probar el sistema antes de comprometerte
          </p>
        </div>

        {/* ===== CARD DE PLAN ===== */}
        <Card className="mb-8 border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50/50">
          <CardContent className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">📦 Lo que incluye:</h3>
            <ul className="space-y-2">
              <li className="flex items-start gap-2 text-sm text-gray-700">
                <Check className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                <span><strong>1 usuario</strong> - Solo tú puedes acceder</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-gray-700">
                <Check className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                <span><strong>10 boletas/mes</strong> - Para pequeños volúmenes</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-gray-700">
                <Check className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                <span><strong>OCR Azure AI</strong> - Misma tecnología que planes pagos</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-gray-700">
                <Check className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                <span><strong>Dashboard básico</strong> - Visualiza tus gastos</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-gray-700">
                <Check className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                <span><strong>Export CSV</strong> - Descarga tus datos</span>
              </li>
            </ul>
            <p className="text-xs text-gray-500 mt-4 text-center">
              ⏱️ Recibirás tus accesos en máximo 24 hrs hábiles
            </p>
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
                      <li>• Crearemos tu cuenta en el sistema</li>
                      <li>• Te enviaremos un email con tus accesos</li>
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
                    Solicitar Plan Free
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

        {/* ===== CTA UPGRADE ===== */}
        <div className="mt-8 text-center space-y-3">
          <p className="text-gray-600">
            ¿Necesitas más usuarios o boletas ilimitadas?
          </p>
          <Button
            variant="outline"
            onClick={() => router.push('/registro/pago')}
            className="border-emerald-500 text-emerald-600 hover:bg-emerald-50"
          >
            Ver planes Pro y Enterprise →
          </Button>
        </div>
      </div>
    </div>
  )
}