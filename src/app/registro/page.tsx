'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Check, Star, ArrowLeft } from 'lucide-react'
import Image from 'next/image'

export default function RegistroPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      {/* ===== NAVBAR ===== */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-emerald-100/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <Image
              src="/images/LogogastosNX.png"
              alt="Logotipo GastosNX"
              width={693}
              height={138}
              priority
              loading="eager"
              className="h-10 w-auto object-contain"
            />
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
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div className="grid md:grid-cols-2 gap-8">
          
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
  <p className="text-xs text-gray-500 mb-2">IVA incluido · Facturación anual ($118.800 total)</p>
  <div className="bg-emerald-50 rounded-lg p-2">
    <p className="text-xs text-emerald-700">
      <span className="font-semibold">También disponible:</span> $12.500/mes sin contrato
    </p>
  </div>
</div>
              <p className="text-sm text-gray-600 mt-2">Para empresas en crecimiento</p>
            </CardHeader>
            <CardContent className="pt-6">
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-2 text-sm text-gray-700">
                  <Check className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <span><strong>Hasta 3 usuarios</strong> ✅</span>
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