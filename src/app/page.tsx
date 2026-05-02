'use client'

import { useRouter } from 'next/navigation'
import { Check, Shield, FileCheck, Database, AlertTriangle, ArrowRight, Lock, Clock, Camera } from 'lucide-react'

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
            
            {/* Botones - CORREGIDOS */}
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

      {/* ===== HERO PRINCIPAL - COPY CTO ===== */}
      <section className="relative pt-24 pb-32 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Badge de confianza */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-full text-sm font-medium mb-8">
            <Shield className="w-4 h-4" />
            Respaldo documental empresarial • Compatible con el SII
          </div>

          {/* Título Principal - ENFOQUE EN RIESGO (CTO) */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
            ¿Y si el SII te pide un respaldo
            <br />
            <span className="text-emerald-600">hoy mismo?</span>
          </h1>

          {/* Subtítulo - DOLOR REAL (CTO) */}
          <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
            Tu operación depende de documentos que hoy están dispersos en correos, 
            WhatsApp y carpetas. GastosSII centraliza, respalda y mantiene disponible 
            toda tu evidencia tributaria — para que nunca pierdas tiempo, multas ni tranquilidad.
          </p>

          {/* CTA Buttons - CORREGIDOS */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <button
              onClick={() => router.push('/registro/free')}
              className="px-10 py-5 bg-emerald-600 text-white text-lg font-bold rounded-xl hover:bg-emerald-700 transition-all inline-flex items-center gap-2 shadow-lg"
            >
              Prueba Gratis
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

      {/* ===== CÓMO FUNCIONA - NUEVA SECCIÓN ===== */}
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
            {/* Paso 1 */}
            <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-200">
              <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center mb-6">
                <Camera className="w-7 h-7 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">1. Captura tu boleta</h3>
              <p className="text-gray-600">
                Toma una foto o sube el documento. Nuestro OCR con Azure AI extrae todos los datos automáticamente.
              </p>
            </div>

            {/* Paso 2 */}
            <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-200">
              <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center mb-6">
                <Database className="w-7 h-7 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">2. Se respalda automáticamente</h3>
              <p className="text-gray-600">
                Cada documento se guarda en la nube con trazabilidad completa. Sin depender de personas o archivos locales.
              </p>
            </div>

            {/* Paso 3 */}
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

      {/* ===== SECCIÓN PROBLEMA - COPY CTO ===== */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-50 rounded-2xl mb-6">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            El riesgo no es perder una boleta.
            <br />
            Es no encontrarla cuando realmente importa.
          </h2>
          <p className="text-xl text-gray-600 leading-relaxed mb-8">
            Cuando llega una revisión tributaria, una auditoría interna o tu contador 
            pide evidencia urgente:
          </p>
          
          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto text-left">
            <div className="flex items-start gap-3 p-4 bg-white rounded-xl">
              <span className="text-2xl">❌</span>
              <div>
                <p className="font-semibold text-gray-900">Documentos dispersos</p>
                <p className="text-sm text-gray-600 mt-1">Correos, WhatsApp, carpetas sin orden</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-white rounded-xl">
              <span className="text-2xl">❌</span>
              <div>
                <p className="font-semibold text-gray-900">Dependencia humana</p>
                <p className="text-sm text-gray-600 mt-1">Si esa persona falta, la evidencia se pierde</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-white rounded-xl">
              <span className="text-2xl">❌</span>
              <div>
                <p className="font-semibold text-gray-900">Tiempo perdido</p>
                <p className="text-sm text-gray-600 mt-1">Horas buscando respaldos que deberías tener en segundos</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-white rounded-xl">
              <span className="text-2xl">❌</span>
              <div>
                <p className="font-semibold text-gray-900">Exposición tributaria</p>
                <p className="text-sm text-gray-600 mt-1">Sin respaldo, el gasto no es deducible</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== SECCIÓN SOLUCIÓN - COPY CTO ===== */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-2xl mb-6">
              <Shield className="w-8 h-8 text-emerald-600" />
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Tu capa de protección documental
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Cada gasto capturado queda respaldado, centralizado y disponible para quien lo necesite.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <div className="bg-gray-50 rounded-xl p-6">
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
                <FileCheck className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Evidencia inmediata</h3>
              <p className="text-gray-600 text-sm">Encuentra cualquier respaldo en segundos, no en horas.</p>
            </div>

            <div className="bg-gray-50 rounded-xl p-6">
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
                <Lock className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Trazabilidad completa</h3>
              <p className="text-gray-600 text-sm">Sabes quién capturó, cuándo y dónde está cada documento.</p>
            </div>

            <div className="bg-gray-50 rounded-xl p-6">
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
                <Database className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Disponibilidad garantizada</h3>
              <p className="text-gray-600 text-sm">Acceso desde cualquier dispositivo, sin depender de personas.</p>
            </div>

            <div className="bg-gray-50 rounded-xl p-6">
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Respaldo tributario</h3>
              <p className="text-gray-600 text-sm">Documentación lista para el SII, auditores o contadores.</p>
            </div>

            <div className="bg-gray-50 rounded-xl p-6">
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
                <Clock className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Control operacional</h3>
              <p className="text-gray-600 text-sm">Visibilidad total de tus gastos, con aprobación y categorías.</p>
            </div>

            <div className="bg-gray-50 rounded-xl p-6">
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
                <Check className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Export contable</h3>
              <p className="text-gray-600 text-sm">CSV y Excel listos para tu contador.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== SECCIÓN BENEFICIOS - COPY CTO ===== */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Menos exposición. Más tranquilidad. Control real.
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Los beneficios de tener tu respaldo documental bajo control.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="flex items-start gap-4 p-6 bg-white rounded-xl shadow-sm">
              <div className="text-3xl">🛡️</div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Protección tributaria</h3>
                <p className="text-gray-600">Reduce tu exposición frente al SII con respaldos centralizados y trazables.</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-6 bg-white rounded-xl shadow-sm">
              <div className="text-3xl">⚡</div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Respuesta inmediata</h3>
                <p className="text-gray-600">Encuentra cualquier documento en segundos. No pierdas horas buscando.</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-6 bg-white rounded-xl shadow-sm">
              <div className="text-3xl">🔐</div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Independencia operacional</h3>
                <p className="text-gray-600">No dependas de personas específicas. Tu evidencia está siempre disponible.</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-6 bg-white rounded-xl shadow-sm">
              <div className="text-3xl">📊</div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Control empresarial</h3>
                <p className="text-gray-600">Visibilidad total de tus gastos, con trazabilidad y respaldo documental.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== PLANES Y PRECIOS ===== */}
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

      {/* ===== CIERRE - COPY CTO ===== */}
      <section className="py-24 bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Tu operación merece respaldo serio.
            <br />
            No más improvisación documental.
          </h2>
          <p className="text-xl text-gray-300 mb-10 leading-relaxed">
            GastosSII está diseñado para empresas que entienden que el respaldo documental 
            no es un "extra administrativo" — es protección operacional.
            <br /><br />
            Cuando el SII, un auditor o tu contador piden evidencia, tú ya la tienes. 
            Centralizada. Disponible. Bajo tu control.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={() => router.push('/registro/free')}
              className="px-10 py-5 bg-emerald-600 text-white text-lg font-bold rounded-xl hover:bg-emerald-700 transition-all inline-flex items-center gap-2"
            >
              Prueba Gratis
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