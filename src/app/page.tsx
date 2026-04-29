'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Check, Sparkles, Camera, Database, Shield, FileText, ArrowRight } from 'lucide-react'

export default function LandingPage() {
  const router = useRouter()

  return (
    <main className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      {/* ===== NAVBAR ===== */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-emerald-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center text-white text-xl font-bold shadow-lg">
                🧾
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">GastosSII</h1>
                <p className="text-xs text-gray-500">by NXChile</p>
              </div>
            </div>
            {/* Botones */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push('/login')}
                className="px-4 py-2 text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-colors"
              >
                Iniciar Sesión
              </button>
              <button
                onClick={() => router.push('/registro/pago')}
                className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-sm font-semibold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all"
              >
                Comenzar Ahora
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* ===== HERO PRINCIPAL ===== */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium mb-8 animate-fade-in">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            Compatible con el SII de Chile
          </div>

          {/* Título Principal */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
            Controla tus gastos antes que tus gastos
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-600">
              controlen tu negocio
            </span>
          </h1>

          {/* Subtítulo */}
          <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
            Digitaliza, organiza y encuentra cada respaldo en segundos.
          </p>

          {/* CTA Button */}
          <button
            onClick={() => router.push('/registro/free')}
            className="px-10 py-5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-lg font-bold rounded-2xl shadow-2xl hover:shadow-emerald-500/25 hover:scale-105 transition-all inline-flex items-center gap-2"
          >
            Comenzar ahora
            <ArrowRight className="w-5 h-5" />
          </button>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto pt-16 border-t border-gray-200">
            <div>
              <p className="text-3xl font-bold text-gray-900">100%</p>
              <p className="text-sm text-gray-500 mt-1">Compatible SII</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-900">&lt;5s</p>
              <p className="text-sm text-gray-500 mt-1">Por boleta</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-900">OCR</p>
              <p className="text-sm text-gray-500 mt-1">Azure AI</p>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-1/2 left-0 -translate-y-1/2 w-96 h-96 bg-emerald-200 rounded-full blur-3xl opacity-20 -z-10" />
        <div className="absolute top-1/2 right-0 -translate-y-1/2 w-96 h-96 bg-teal-200 rounded-full blur-3xl opacity-20 -z-10" />
      </section>

      {/* ===== SECCIÓN 1 — PROBLEMA ===== */}
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            El desorden financiero cuesta más de lo que parece.
          </h2>
          <p className="text-xl text-gray-600 leading-relaxed">
            Boletas extraviadas, registros incompletos y gastos sin control generan
            <span className="text-emerald-600 font-semibold"> pérdidas silenciosas </span>
            todos los meses.
          </p>
        </div>
      </section>

      {/* ===== SECCIÓN 2 — SOLUCIÓN ===== */}
      <section className="py-24 bg-gradient-to-br from-emerald-50 to-teal-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Registra un gasto en segundos.
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Captura boletas desde tu celular y mantén toda tu información organizada
              y disponible cuando la necesites.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center text-white mb-6">
                <Camera className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Captura rápida</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3 text-gray-600">
                  <Check className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <span>Captura rápida desde el celular</span>
                </li>
                <li className="flex items-start gap-3 text-gray-600">
                  <Check className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <span>Registro centralizado</span>
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white mb-6">
                <Database className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Siempre disponible</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3 text-gray-600">
                  <Check className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <span>Información siempre disponible</span>
                </li>
                <li className="flex items-start gap-3 text-gray-600">
                  <Check className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <span>Menos tiempo buscando respaldos</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ===== SECCIÓN 3 — VALOR ===== */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Todo respaldado. Todo centralizado.
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Mantén el control operativo y financiero de tu empresa desde un solo lugar.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <div className="flex items-start gap-3 p-4 bg-emerald-50 rounded-xl">
              <Check className="w-6 h-6 text-emerald-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-gray-900">Historial ordenado</h4>
                <p className="text-sm text-gray-600 mt-1">Todos tus gastos en un solo lugar</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-emerald-50 rounded-xl">
              <Check className="w-6 h-6 text-emerald-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-gray-900">Clasificación automática</h4>
                <p className="text-sm text-gray-600 mt-1">Categorías inteligentes</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-emerald-50 rounded-xl">
              <Check className="w-6 h-6 text-emerald-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-gray-900">Exportación de información</h4>
                <p className="text-sm text-gray-600 mt-1">CSV y Excel para contabilidad</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-emerald-50 rounded-xl">
              <Check className="w-6 h-6 text-emerald-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-gray-900">Acceso rápido</h4>
                <p className="text-sm text-gray-600 mt-1">Encuentra documentos al instante</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-emerald-50 rounded-xl">
              <Check className="w-6 h-6 text-emerald-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-gray-900">Respaldo digital seguro</h4>
                <p className="text-sm text-gray-600 mt-1">Tus datos protegidos siempre</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== SECCIÓN 4 — BENEFICIO OPERATIVO ===== */}
      <section className="py-24 bg-gradient-to-br from-gray-50 to-emerald-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Menos tiempo administrando. Más tiempo haciendo crecer tu negocio.
          </h2>
          <p className="text-xl text-gray-600 leading-relaxed">
            Reduce el caos administrativo y encuentra cada documento cuando realmente lo necesites.
          </p>
        </div>
      </section>

      {/* ===== PLANES Y PRECIOS ===== */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Planes para cada necesidad
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Elige el plan que mejor se adapte a tu empresa
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Plan Free */}
            <div className="bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all border border-gray-200">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Free</h3>
                <p className="text-gray-600">Para probar el sistema</p>
              </div>
              <div className="mb-6">
                <span className="text-5xl font-bold text-gray-900">$0</span>
                <span className="text-gray-600">/mes</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3 text-gray-600">
                  <Check className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  <span>1 usuario</span>
                </li>
                <li className="flex items-center gap-3 text-gray-600">
                  <Check className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  <span>10 boletas/mes</span>
                </li>
                <li className="flex items-center gap-3 text-gray-600">
                  <Check className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  <span>OCR Azure AI</span>
                </li>
                <li className="flex items-center gap-3 text-gray-600">
                  <Check className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  <span>Dashboard básico</span>
                </li>
              </ul>
              <Button
                variant="outline"
                size="lg"
                className="w-full border-2 border-emerald-500 text-emerald-600 hover:bg-emerald-50"
                onClick={() => router.push('/registro/free')}
              >
                Comenzar Gratis
              </Button>
            </div>

            {/* Plan Pro (Destacado) */}
            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl p-8 shadow-2xl transform scale-105 relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-yellow-400 text-yellow-900 px-4 py-1 rounded-full text-sm font-bold">
                MÁS POPULAR
              </div>
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-white mb-2">Pro</h3>
                <p className="text-emerald-100">Para empresas en crecimiento</p>
              </div>
              <div className="mb-6">
                <span className="text-5xl font-bold text-white">$9.900</span>
                <span className="text-emerald-100">/mes</span>
                <p className="text-xs text-emerald-100 mt-1">Facturación anual</p>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3 text-white">
                  <Check className="w-5 h-5 flex-shrink-0" />
                  <span>Hasta 2 usuarios</span>
                </li>
                <li className="flex items-center gap-3 text-white">
                  <Check className="w-5 h-5 flex-shrink-0" />
                  <span>500 boletas/mes</span>
                </li>
                <li className="flex items-center gap-3 text-white">
                  <Check className="w-5 h-5 flex-shrink-0" />
                  <span>OCR Azure AI</span>
                </li>
                <li className="flex items-center gap-3 text-white">
                  <Check className="w-5 h-5 flex-shrink-0" />
                  <span>Dashboard avanzado</span>
                </li>
                <li className="flex items-center gap-3 text-white">
                  <Check className="w-5 h-5 flex-shrink-0" />
                  <span>Export CSV + Excel</span>
                </li>
              </ul>
              <Button
                variant="secondary"
                size="lg"
                className="w-full bg-white text-emerald-600 hover:bg-emerald-50 font-bold"
                onClick={() => router.push('/registro/pago?plan=pro')}
              >
                Elegir Pro
              </Button>
            </div>

            {/* Plan Enterprise */}
            <div className="bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all border border-gray-200">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Enterprise</h3>
                <p className="text-gray-600">Para grandes empresas</p>
              </div>
              <div className="mb-6">
                <span className="text-5xl font-bold text-gray-900">$19.990</span>
                <span className="text-gray-600">/mes</span>
                <p className="text-xs text-gray-500 mt-1">Facturación anual</p>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3 text-gray-600">
                  <Check className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  <span>Hasta 5 usuarios</span>
                </li>
                <li className="flex items-center gap-3 text-gray-600">
                  <Check className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  <span>Boletas ilimitadas</span>
                </li>
                <li className="flex items-center gap-3 text-gray-600">
                  <Check className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  <span>OCR Azure AI</span>
                </li>
                <li className="flex items-center gap-3 text-gray-600">
                  <Check className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  <span>API access</span>
                </li>
                <li className="flex items-center gap-3 text-gray-600">
                  <Check className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  <span>Soporte 24/7</span>
                </li>
              </ul>
              <Button
                variant="outline"
                size="lg"
                className="w-full border-2 border-emerald-500 text-emerald-600 hover:bg-emerald-50"
                onClick={() => router.push('/registro/pago?plan=enterprise')}
              >
                Elegir Enterprise
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ===== SECCIÓN 5 — CIERRE ===== */}
      <section className="py-24 bg-gradient-to-r from-emerald-500 to-teal-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Diseñado para empresas que necesitan orden financiero real.
          </h2>
          <p className="text-xl text-emerald-100 mb-10">
            Gastos NXChile simplifica la gestión de gastos y respaldos para que tu
            operación funcione con mayor control y claridad.
          </p>
          <button
            onClick={() => router.push('/registro/pago')}
            className="px-10 py-5 bg-white text-emerald-600 text-lg font-bold rounded-2xl shadow-2xl hover:shadow-white/25 hover:scale-105 transition-all inline-flex items-center gap-2"
          >
            Solicitar acceso
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center text-white font-bold">
                  🧾
                </div>
                <h3 className="text-lg font-bold text-white">GastosSII</h3>
              </div>
              <p className="text-sm text-gray-400">
                La forma más simple de gestionar tus gastos empresariales en Chile.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Producto</h4>
              <ul className="space-y-2 text-sm">
                <li><button className="hover:text-white transition-colors">Características</button></li>
                <li><button className="hover:text-white transition-colors">Precios</button></li>
                <li><button className="hover:text-white transition-colors">Seguridad</button></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Empresa</h4>
              <ul className="space-y-2 text-sm">
                <li><button className="hover:text-white transition-colors">Sobre Nosotros</button></li>
                <li><button className="hover:text-white transition-colors">Contacto</button></li>
                <li><button className="hover:text-white transition-colors">Privacidad</button></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-gray-800 text-center text-sm text-gray-400">
            <p>© 2026 GastosSII by NXChile. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </main>
  )
}