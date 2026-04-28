'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Check, Sparkles, X, Camera, Database, Shield, FileText } from 'lucide-react'

export default function LandingPage() {
  const router = useRouter()
  const [showModal, setShowModal] = useState(false)

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

      {/* ===== HERO SECTION ===== */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium mb-8 animate-fade-in">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            Compatible con el SII de Chile
          </div>

          {/* Título Principal */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
            Controla tus gastos
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-600">
              de forma inteligente
            </span>
          </h1>

          {/* Subtítulo */}
          <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
            Captura boletas con tu cámara, extrae datos automáticamente con OCR
            y gestiona tus gastos empresariales de manera simple y segura.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <button
              onClick={() => router.push('/registro/free')}
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-lg font-bold rounded-2xl shadow-2xl hover:shadow-emerald-500/25 hover:scale-105 transition-all flex items-center justify-center gap-2"
            >
              🎁 Prueba Gratis Ahora
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
            <button
              onClick={() => setShowModal(true)}
              className="w-full sm:w-auto px-8 py-4 bg-white text-emerald-600 text-lg font-semibold rounded-2xl border-2 border-emerald-200 hover:border-emerald-300 hover:bg-emerald-50 transition-all"
            >
              ℹ️ Conocer Más
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto pt-8 border-t border-gray-200">
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

      {/* ===== CARACTERÍSTICAS ===== */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Todo lo que necesitas para gestionar tus gastos
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Herramientas poderosas diseñadas para simplificar tu trabajo
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="group p-8 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-3xl hover:shadow-2xl transition-all hover:-translate-y-1">
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center text-white text-2xl mb-6 shadow-lg group-hover:scale-110 transition-transform">
                <Camera className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Captura con Cámara
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Toma fotos de tus boletas y comprobantes. Nuestro sistema las procesa automáticamente.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group p-8 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl hover:shadow-2xl transition-all hover:-translate-y-1">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white text-2xl mb-6 shadow-lg group-hover:scale-110 transition-transform">
                <Sparkles className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                OCR Inteligente
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Tecnología Azure AI Vision extrae datos con alta precisión automáticamente.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group p-8 bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl hover:shadow-2xl transition-all hover:-translate-y-1">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center text-white text-2xl mb-6 shadow-lg group-hover:scale-110 transition-transform">
                <Database className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Dashboard en Tiempo Real
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Visualiza tus gastos, categorías y límites de uso en un solo lugar.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="group p-8 bg-gradient-to-br from-orange-50 to-red-50 rounded-3xl hover:shadow-2xl transition-all hover:-translate-y-1">
              <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center text-white text-2xl mb-6 shadow-lg group-hover:scale-110 transition-transform">
                📱
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Multi-Dispositivo
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Accede desde tu celular, tablet o computador. Sincronización en la nube.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="group p-8 bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl hover:shadow-2xl transition-all hover:-translate-y-1">
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center text-white text-2xl mb-6 shadow-lg group-hover:scale-110 transition-transform">
                <Shield className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Seguro y Privado
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Tus datos están protegidos. Cada empresa tiene su espacio aislado.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="group p-8 bg-gradient-to-br from-cyan-50 to-teal-50 rounded-3xl hover:shadow-2xl transition-all hover:-translate-y-1">
              <div className="w-14 h-14 bg-gradient-to-br from-cyan-500 to-teal-600 rounded-2xl flex items-center justify-center text-white text-2xl mb-6 shadow-lg group-hover:scale-110 transition-transform">
                <FileText className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Exportación CSV
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Descarga tus gastos en formato CSV para tu contabilidad o informes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== PLANES Y PRECIOS ===== */}
      <section className="py-24 bg-gradient-to-br from-gray-50 to-emerald-50">
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
            <div className="bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all">
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
                  <Check className="w-5 h-5 text-emerald-500" />
                  1 usuario
                </li>
                <li className="flex items-center gap-3 text-gray-600">
                  <Check className="w-5 h-5 text-emerald-500" />
                  10 boletas/mes
                </li>
                <li className="flex items-center gap-3 text-gray-600">
                  <Check className="w-5 h-5 text-emerald-500" />
                  OCR Azure AI
                </li>
                <li className="flex items-center gap-3 text-gray-600">
                  <Check className="w-5 h-5 text-emerald-500" />
                  Dashboard básico
                </li>
              </ul>
              <button
                onClick={() => router.push('/registro/free')}
                className="w-full py-3 border-2 border-emerald-500 text-emerald-600 font-semibold rounded-xl hover:bg-emerald-50 transition-colors"
              >
                Prueba Gratis
              </button>
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
                  <Check className="w-5 h-5" />
                  Hasta 3 usuarios
                </li>
                <li className="flex items-center gap-3 text-white">
                  <Check className="w-5 h-5" />
                  500 boletas/mes
                </li>
                <li className="flex items-center gap-3 text-white">
                  <Check className="w-5 h-5" />
                  OCR Azure AI
                </li>
                <li className="flex items-center gap-3 text-white">
                  <Check className="w-5 h-5" />
                  Dashboard avanzado
                </li>
                <li className="flex items-center gap-3 text-white">
                  <Check className="w-5 h-5" />
                  Soporte prioritario
                </li>
              </ul>
              <button
                onClick={() => router.push('/registro/pago?plan=pro')}
                className="w-full py-3 bg-white text-emerald-600 font-bold rounded-xl hover:bg-emerald-50 transition-colors shadow-lg"
              >
                Elegir Pro
              </button>
            </div>

            {/* Plan Enterprise */}
            <div className="bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all">
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
                  <Check className="w-5 h-5 text-emerald-500" />
                  Hasta 10 usuarios
                </li>
                <li className="flex items-center gap-3 text-gray-600">
                  <Check className="w-5 h-5 text-emerald-500" />
                  Boletas ilimitadas
                </li>
                <li className="flex items-center gap-3 text-gray-600">
                  <Check className="w-5 h-5 text-emerald-500" />
                  OCR Azure AI
                </li>
                <li className="flex items-center gap-3 text-gray-600">
                  <Check className="w-5 h-5 text-emerald-500" />
                  API access
                </li>
                <li className="flex items-center gap-3 text-gray-600">
                  <Check className="w-5 h-5 text-emerald-500" />
                  Soporte 24/7
                </li>
              </ul>
              <button
                onClick={() => router.push('/registro/pago?plan=enterprise')}
                className="w-full py-3 border-2 border-emerald-500 text-emerald-600 font-semibold rounded-xl hover:bg-emerald-50 transition-colors"
              >
                Elegir Enterprise
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ===== CTA FINAL ===== */}
      <section className="py-24 bg-gradient-to-r from-emerald-500 to-teal-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            ¿Listo para simplificar tus gastos?
          </h2>
          <p className="text-xl text-emerald-100 mb-10">
            Únete a empresas que ya confían en GastosSII para su gestión diaria
          </p>
          <button
            onClick={() => router.push('/registro/free')}
            className="px-10 py-5 bg-white text-emerald-600 text-lg font-bold rounded-2xl shadow-2xl hover:shadow-white/25 hover:scale-105 transition-all"
          >
            Comenzar Ahora - Es Gratis
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

      {/* ===== MODAL "CONOCER MÁS" ===== */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto bg-white">
            <div className="sticky top-0 bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-emerald-100 p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">¿Cómo funciona GastosSII?</h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-emerald-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <CardContent className="p-6 space-y-6">
              {/* Objetivo */}
              <div className="space-y-3">
                <h3 className="font-semibold text-lg text-gray-900">🎯 Objetivo</h3>
                <p className="text-gray-600">
                  Registrar tus gastos empresariales de forma simple, respaldar cada comprobante 
                  y cumplir con el SII de Chile sin complicaciones.
                </p>
              </div>

              {/* Flujo */}
              <div className="space-y-3">
                <h3 className="font-semibold text-lg text-gray-900">🔄 Flujo del Sistema</h3>
                <div className="grid gap-4">
                  <div className="flex items-start gap-3 p-3 bg-emerald-50 rounded-lg">
                    <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">1</div>
                    <div>
                      <p className="font-medium text-gray-900">Captura</p>
                      <p className="text-sm text-gray-600">Toma una foto de tu boleta con tu celular o cámara</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">2</div>
                    <div>
                      <p className="font-medium text-gray-900">OCR Inteligente</p>
                      <p className="text-sm text-gray-600">Azure AI extrae automáticamente: fecha, monto, RUT, proveedor</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
                    <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">3</div>
                    <div>
                      <p className="font-medium text-gray-900">Revisión</p>
                      <p className="text-sm text-gray-600">Verifica y corrige los datos si es necesario</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg">
                    <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">4</div>
                    <div>
                      <p className="font-medium text-gray-900">Guardado</p>
                      <p className="text-sm text-gray-600">Se guarda en tu Google Sheet privado automáticamente</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Características Clave */}
              <div className="space-y-3">
                <h3 className="font-semibold text-lg text-gray-900">✨ Características Clave</h3>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-gray-700">
                    <Check className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <span><strong>OCR con Azure AI:</strong> Misma tecnología en todos los planes</span>
                  </li>
                  <li className="flex items-start gap-2 text-gray-700">
                    <Check className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <span><strong>Google Sheets:</strong> Cada empresa tiene su propia hoja privada</span>
                  </li>
                  <li className="flex items-start gap-2 text-gray-700">
                    <Check className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <span><strong>Multi-usuario:</strong> Planes Pro y Enterprise permiten varios usuarios</span>
                  </li>
                  <li className="flex items-start gap-2 text-gray-700">
                    <Check className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <span><strong>Exportación:</strong> Descarga tus datos en CSV para tu contabilidad</span>
                  </li>
                  <li className="flex items-start gap-2 text-gray-700">
                    <Check className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <span><strong>100% Compatible SII:</strong> Cumple con la normativa chilena</span>
                  </li>
                </ul>
              </div>

              {/* Planes */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <h3 className="font-semibold text-gray-900">📦 Planes Disponibles</h3>
                <div className="space-y-2 text-sm">
                  <p><strong>Free:</strong> 1 usuario, 10 boletas/mes - Gratis</p>
                  <p><strong>Pro:</strong> Hasta 3 usuarios, 500 boletas/mes - $9.900/mes (anual)</p>
                  <p><strong>Enterprise:</strong> Hasta 10 usuarios, ilimitadas - $19.990/mes (anual)</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </main>
  )
}