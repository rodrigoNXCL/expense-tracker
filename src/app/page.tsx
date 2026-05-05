'use client'

import { useRouter } from 'next/navigation'
import { Check, Shield, FileCheck, Database, ArrowRight, Lock, Clock, Camera, FileText } from 'lucide-react'

export default function LandingPage() {
  const router = useRouter()

  return (
    <main className="min-h-screen bg-white">
      {/* ===== NAVBAR ===== */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center text-white text-xl font-bold">
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
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
              >
                Iniciar Sesión
              </button>
              <button
                onClick={() => router.push('/registro')}
                className="px-5 py-2.5 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-700 transition-colors"
              >
                Ver Planes
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* ===== HERO PRINCIPAL - NUEVO COPY ===== */}
      <section className="relative pt-24 pb-32 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Badge de confianza */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-full text-sm font-medium mb-8">
            <Shield className="w-4 h-4" />
            Respaldo documental empresarial • Compatible con el SII
          </div>

          {/* Título Principal - NUEVO COPY */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
            Muchos gastos reales nunca llegan
            <br />
            <span className="text-emerald-600">respaldados a la renta.</span>
          </h1>

          {/* Subtítulo - NUEVO COPY */}
          <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
            Registra y respalda peajes, estacionamientos, vouchers y gastos operacionales 
            antes de que se pierdan.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <button
              onClick={() => router.push('/registro/free')}
              className="px-10 py-5 bg-emerald-600 text-white text-lg font-bold rounded-xl hover:bg-emerald-700 transition-all inline-flex items-center gap-2 shadow-lg"
            >
              Probar Gratis
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => document.getElementById('como-funciona')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-10 py-5 bg-white text-gray-700 text-lg font-bold rounded-xl border-2 border-gray-300 hover:border-gray-400 transition-all"
            >
              Cómo Funciona
            </button>
          </div>

          {/* Stats de confianza */}
          <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto pt-16 border-t border-gray-200">
            <div>
              <p className="text-3xl font-bold text-gray-900">100%</p>
              <p className="text-sm text-gray-500 mt-1">Trazabilidad documental</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-900">&lt;10s</p>
              <p className="text-sm text-gray-500 mt-1">Búsqueda de evidencia</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-900">OCR</p>
              <p className="text-sm text-gray-500 mt-1">Azure AI validado</p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== CÓMO FUNCIONA ===== */}
      <section id="como-funciona" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Respaldo centralizado. Evidencia disponible. Control empresarial.
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              GastosSII no es una app para "ordenar gastos". Es tu capa de protección documental.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-200">
              <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center mb-6">
                <Camera className="w-7 h-7 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">1. Captura tu boleta</h3>
              <p className="text-gray-600">
                Toma una foto o sube el documento. Nuestro OCR con Azure AI extrae todos los datos automáticamente.
              </p>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-200">
              <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center mb-6">
                <Database className="w-7 h-7 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">2. Se respalda automáticamente</h3>
              <p className="text-gray-600">
                Cada documento se guarda en la nube con trazabilidad completa. Sin depender de personas o archivos locales.
              </p>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-200">
              <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center mb-6">
                <FileCheck className="w-7 h-7 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">3. Disponible cuando lo necesites</h3>
              <p className="text-gray-600">
                Encuentra cualquier respaldo en segundos. Listo para el SII, auditores o tu contador.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== SECCIÓN PROBLEMA - NUEVO COPY ===== */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Los gastos pequeños también importan.
          </h2>
          <p className="text-xl text-gray-600 leading-relaxed">
            En muchas empresas, los gastos operacionales menores terminan perdiéndose entre papeles, 
            boletas borradas o registros incompletos.
            <br /><br />
            <span className="text-emerald-600 font-semibold">Y cuando llega el cierre tributario, simplemente no están.</span>
          </p>
        </div>
      </section>

      {/* ===== SECCIÓN SOLUCIÓN - NUEVO COPY ===== */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-2xl mb-6">
              <Shield className="w-8 h-8 text-emerald-600" />
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Respalda gastos reales antes de que se pierdan.
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Gastos.nxchile te ayuda a mantener registro y respaldo digital de gastos operacionales 
              del día a día, sin depender del papel físico ni carpetas improvisadas.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <div className="bg-gray-50 rounded-xl p-6">
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
                <FileCheck className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Registro rápido</h3>
              <p className="text-gray-600 text-sm">Captura gastos en segundos desde cualquier dispositivo.</p>
            </div>

            <div className="bg-gray-50 rounded-xl p-6">
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
                <Database className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Respaldo digital</h3>
              <p className="text-gray-600 text-sm">Tus documentos seguros en la nube, siempre disponibles.</p>
            </div>

            <div className="bg-gray-50 rounded-xl p-6">
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
                <Lock className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Información disponible</h3>
              <p className="text-gray-600 text-sm">Accede a tus gastos cuando los necesites, sin depender de nadie.</p>
            </div>

            <div className="bg-gray-50 rounded-xl p-6">
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
                <FileText className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Historial organizado</h3>
              <p className="text-gray-600 text-sm">Todos tus gastos en un solo lugar, ordenados por fecha y categoría.</p>
            </div>

            <div className="bg-gray-50 rounded-xl p-6">
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
                <Check className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Gastos listos para revisión</h3>
              <p className="text-gray-600 text-sm">Documentación lista para el SII, auditores o tu contador.</p>
            </div>

            <div className="bg-gray-50 rounded-xl p-6">
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
                <Clock className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Ahorra tiempo</h3>
              <p className="text-gray-600 text-sm">Menos búsqueda de papeles, más tiempo para tu negocio.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== SECCIÓN DIFERENCIAL - NUEVA ===== */}
      <section className="py-24 bg-gradient-to-br from-emerald-50 to-teal-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-2xl mb-6">
            <Shield className="w-8 h-8 text-emerald-600" />
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Si el gasto existe, debería quedar respaldado.
          </h2>
          <p className="text-xl text-gray-600 leading-relaxed">
            La plataforma está diseñada para ayudar a empresas y contribuyentes de primera categoría 
            a mantener respaldo real de gastos operacionales que muchas veces quedan fuera del registro tributario.
          </p>
        </div>
      </section>

      {/* ===== SECCIÓN BENEFICIOS - NUEVO COPY ===== */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Menos papeles perdidos. Más respaldo para tu operación.
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Centraliza boletas, vouchers y gastos menores en un solo lugar y mantén 
              tu información disponible cuando realmente la necesites.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <div className="flex items-start gap-4 p-6 bg-emerald-50 rounded-xl">
              <div className="text-3xl"></div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Peajes</h3>
                <p className="text-gray-600 text-sm">Registra todos tus gastos de peaje sin perder los vouchers.</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-6 bg-emerald-50 rounded-xl">
              <div className="text-3xl">🅿️</div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Estacionamientos</h3>
                <p className="text-gray-600 text-sm">Respalda gastos de estacionamiento operacional.</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-6 bg-emerald-50 rounded-xl">
              <div className="text-3xl">🛒</div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Compras menores</h3>
                <p className="text-gray-600 text-sm">Gastos pequeños que suman al final del mes.</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-6 bg-emerald-50 rounded-xl">
              <div className="text-3xl">📄</div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Vouchers</h3>
                <p className="text-gray-600 text-sm">Todos tus vouchers en un solo lugar, siempre disponibles.</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-6 bg-emerald-50 rounded-xl">
              <div className="text-3xl">☕</div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Colaciones</h3>
                <p className="text-gray-600 text-sm">Gastos de alimentación operacional respaldados.</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-6 bg-emerald-50 rounded-xl">
              <div className="text-3xl">📦</div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Gastos operacionales diarios</h3>
                <p className="text-gray-600 text-sm">Todo lo que tu empresa gasta día a día, bajo control.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== PLANES Y PRECIOS - CON OPCIONES MENSUAL/ANUAL ===== */}
      <section id="precios" className="py-24 bg-white">
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
            <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-200">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Free</h3>
                <p className="text-gray-600">Comienza sin costo</p>
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
              <button
                onClick={() => router.push('/registro/free')}
                className="w-full px-6 py-3 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition-colors"
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
              
              {/* PRECIOS DUALES - MENSUAL Y ANUAL */}
              <div className="mb-6">
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-4xl font-bold text-white">$9.900</span>
                  <span className="text-emerald-100">/mes</span>
                </div>
                <p className="text-xs text-emerald-100 mb-2">Facturación anual ($118.800 total)</p>
                <div className="bg-white/20 rounded-lg p-2">
                  <p className="text-xs text-white">
                    <span className="font-semibold">También disponible:</span> $12.900/mes sin contrato anual
                  </p>
                </div>
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
              <button
                onClick={() => router.push('/registro/pago?plan=pro')}
                className="w-full px-6 py-3 bg-white text-emerald-600 font-semibold rounded-lg hover:bg-emerald-50 transition-colors"
              >
                Elegir Pro
              </button>
            </div>

            {/* Plan Enterprise */}
            <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-200">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Enterprise</h3>
                <p className="text-gray-600">Para grandes empresas</p>
              </div>
              
              {/* PRECIOS DUALES - MENSUAL Y ANUAL */}
              <div className="mb-6">
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-4xl font-bold text-gray-900">$19.990</span>
                  <span className="text-gray-600">/mes</span>
                </div>
                <p className="text-xs text-gray-500 mb-2">Facturación anual ($239.880 total)</p>
                <div className="bg-gray-100 rounded-lg p-2">
                  <p className="text-xs text-gray-600">
                    <span className="font-semibold">También disponible:</span> $24.990/mes sin contrato anual
                  </p>
                </div>
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
              <button
                onClick={() => router.push('/registro/pago?plan=enterprise')}
                className="w-full px-6 py-3 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition-colors"
              >
                Elegir Enterprise
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ===== CIERRE - NUEVO COPY ===== */}
      <section className="py-24 bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Respaldo digital para gastos reales.
          </h2>
          <p className="text-xl text-gray-300 mb-10 leading-relaxed">
            Porque muchos gastos sí existen.
            <br />
            El problema es que normalmente no quedan respaldados correctamente.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={() => router.push('/registro/free')}
              className="px-10 py-5 bg-emerald-600 text-white text-lg font-bold rounded-xl hover:bg-emerald-700 transition-all inline-flex items-center gap-2"
            >
              Comenzar ahora
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => router.push('/registro')}
              className="px-10 py-5 bg-white text-gray-900 text-lg font-bold rounded-xl hover:bg-gray-100 transition-all"
            >
              Ver Planes
            </button>
          </div>

          <p className="text-sm text-gray-400 mt-8">
            ⏱️ Recibirás tus accesos en máximo 24 hrs hábiles
          </p>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="bg-gray-900 text-gray-300 py-12 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-bold">
                  🧾
                </div>
                <h3 className="text-lg font-bold text-white">GastosSII</h3>
              </div>
              <p className="text-sm text-gray-400">
                Respaldo documental empresarial para compañías que requieren control y trazabilidad.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Producto</h4>
              <ul className="space-y-2 text-sm">
                <li><button onClick={() => router.push('/registro')} className="hover:text-white transition-colors">Planes y precios</button></li>
                <li><button onClick={() => router.push('/registro/free')} className="hover:text-white transition-colors">Prueba gratuita</button></li>
                <li><button onClick={() => router.push('/manual')} className="hover:text-white transition-colors">Manual de Uso</button></li>
                <li><button onClick={() => document.getElementById('como-funciona')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-white transition-colors">Cómo funciona</button></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Empresa</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="mailto:gastos@nxchile.com" className="hover:text-white transition-colors">gastos@nxchile.com</a></li>
                <li><button onClick={() => router.push('/login')} className="hover:text-white transition-colors">Iniciar Sesión</button></li>
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