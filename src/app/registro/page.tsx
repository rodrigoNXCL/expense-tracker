'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Check, Sparkles, ArrowLeft, Star } from 'lucide-react'

export default function RegistroPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      {/* ===== NAVBAR ===== */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-emerald-100/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/30">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">GastosSII</h1>
                <p className="text-xs text-gray-500">Selecciona tu plan</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={() => router.push('/')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </div>
        </div>
      </nav>

      {/* ===== HEADER ===== */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <Badge variant="default" className="mb-4 bg-gradient-to-r from-emerald-500 to-teal-600">
          <Star className="w-3 h-3 mr-1" />
          Todos los planes incluyen OCR con Azure AI
        </Badge>
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Elige el plan perfecto para tu empresa
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Todos los planes incluyen OCR con Azure AI. Los planes pagos se facturan anualmente.
        </p>
      </div>

      {/* ===== PLANES ===== */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div className="grid md:grid-cols-3 gap-8">
          
          {/* Plan Free */}
          <Card className="border-emerald-200 shadow-lg hover:shadow-xl transition-all">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-2xl font-bold text-gray-900">Free</CardTitle>
              <div className="mt-4">
                <span className="text-5xl font-bold text-gray-900">$0</span>
                <p className="text-gray-500 mt-1">Gratis</p>
              </div>
              <p className="text-sm text-gray-600 mt-2">Para probar el sistema</p>
            </CardHeader>
            <CardContent className="pt-6">
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-2 text-sm text-gray-700">
                  <Check className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <span><strong>1 usuario</strong></span>
                </li>
                <li className="flex items-start gap-2 text-sm text-gray-700">
                  <Check className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <span><strong>10 boletas/mes</strong></span>
                </li>
                <li className="flex items-start gap-2 text-sm text-gray-700">
                  <Check className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <span><strong>OCR Azure AI</strong></span>
                </li>
                <li className="flex items-start gap-2 text-sm text-gray-700">
                  <Check className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <span><strong>Dashboard básico</strong></span>
                </li>
                <li className="flex items-start gap-2 text-sm text-gray-700">
                  <Check className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <span><strong>Export CSV</strong></span>
                </li>
              </ul>
              <Button
                variant="outline"
                size="lg"
                className="w-full border-2 border-emerald-500 text-emerald-600 hover:bg-emerald-50"
                onClick={() => router.push('/registro/free')}
              >
                Prueba Gratis →
              </Button>
            </CardContent>
          </Card>

          {/* Plan Pro (Destacado) */}
          <Card className="border-2 border-emerald-500 shadow-xl relative transform scale-105 bg-gradient-to-br from-emerald-50 to-teal-50">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-emerald-500 text-white px-4 py-1 rounded-full text-sm font-bold">
              MÁS POPULAR
            </div>
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-2xl font-bold text-gray-900">Pro</CardTitle>
              <div className="mt-4">
  <div className="flex items-baseline gap-2 mb-1">
    <span className="text-5xl font-bold text-gray-900">$9.900</span>
    <span className="text-gray-600">/mes</span>
  </div>
  <p className="text-xs text-gray-500 mb-2">Facturación anual ($118.800 total)</p>
  <div className="bg-emerald-50 rounded-lg p-2">
    <p className="text-xs text-emerald-700">
      <span className="font-semibold">También disponible:</span> $12.900/mes sin contrato
    </p>
  </div>
</div>
              <p className="text-sm text-gray-600 mt-2">Para empresas en crecimiento</p>
            </CardHeader>
            <CardContent className="pt-6">
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-2 text-sm text-gray-700">
                  <Check className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <span><strong>Hasta 2 usuarios</strong> ✅</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-gray-700">
                  <Check className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <span><strong>500 boletas/mes</strong></span>
                </li>
                <li className="flex items-start gap-2 text-sm text-gray-700">
                  <Check className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <span><strong>OCR Azure AI</strong></span>
                </li>
                <li className="flex items-start gap-2 text-sm text-gray-700">
                  <Check className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <span><strong>Dashboard avanzado</strong></span>
                </li>
                <li className="flex items-start gap-2 text-sm text-gray-700">
                  <Check className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <span><strong>Export CSV + Excel</strong></span>
                </li>
                <li className="flex items-start gap-2 text-sm text-gray-700">
                  <Check className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <span><strong>Soporte prioritario</strong></span>
                </li>
              </ul>
              <Button
                size="lg"
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold shadow-lg shadow-emerald-500/30"
                onClick={() => router.push('/registro/pago?plan=pro')}
              >
                Comenzar Ahora →
              </Button>
              <p className="text-xs text-gray-500 text-center mt-4">
                ⏱️ Recibirás tus accesos en máximo 24 hrs hábiles<br />
                Total anual: $118.800
              </p>
            </CardContent>
          </Card>

          {/* Plan Enterprise */}
          <Card className="border-emerald-200 shadow-lg hover:shadow-xl transition-all">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-2xl font-bold text-gray-900">Enterprise</CardTitle>
              <div className="mt-4">
  <div className="flex items-baseline gap-2 mb-1">
    <span className="text-5xl font-bold text-gray-900">$19.990</span>
    <span className="text-gray-600">/mes</span>
  </div>
  <p className="text-xs text-gray-500 mb-2">Facturación anual ($239.880 total)</p>
  <div className="bg-gray-100 rounded-lg p-2">
    <p className="text-xs text-gray-600">
      <span className="font-semibold">También disponible:</span> $24.990/mes sin contrato
    </p>
  </div>
</div>
              <p className="text-sm text-gray-600 mt-2">Para grandes empresas</p>
            </CardHeader>
            <CardContent className="pt-6">
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-2 text-sm text-gray-700">
                  <Check className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <span><strong>Hasta 5 usuarios</strong> ✅</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-gray-700">
                  <Check className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <span><strong>Boletas ilimitadas</strong></span>
                </li>
                <li className="flex items-start gap-2 text-sm text-gray-700">
                  <Check className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <span><strong>OCR Azure AI</strong></span>
                </li>
                <li className="flex items-start gap-2 text-sm text-gray-700">
                  <Check className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <span><strong>Dashboard avanzado</strong></span>
                </li>
                <li className="flex items-start gap-2 text-sm text-gray-700">
                  <Check className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <span><strong>Export CSV + Excel</strong></span>
                </li>
                <li className="flex items-start gap-2 text-sm text-gray-700">
                  <Check className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <span><strong>API access</strong></span>
                </li>
                <li className="flex items-start gap-2 text-sm text-gray-700">
                  <Check className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <span><strong>Soporte 24/7</strong></span>
                </li>
              </ul>
              <Button
                variant="outline"
                size="lg"
                className="w-full border-2 border-emerald-500 text-emerald-600 hover:bg-emerald-50"
                onClick={() => router.push('/registro/pago?plan=enterprise')}
              >
                Comenzar Ahora →
              </Button>
              <p className="text-xs text-gray-500 text-center mt-4">
                ⏱️ Recibirás tus accesos en máximo 24 hrs hábiles<br />
                Total anual: $239.880
              </p>
            </CardContent>
          </Card>
        </div>

        {/* ===== INFO ADICIONAL ===== */}
        <div className="text-center space-y-4 pt-16 border-t border-gray-200 mt-8">
          <h3 className="text-lg font-semibold text-gray-900">¿Tienes dudas?</h3>
          <p className="text-gray-600">
            Contáctanos en{' '}
            <a href="mailto:gastos@nxchile.com" className="text-emerald-600 hover:underline font-medium">
              gastos@nxchile.com
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}