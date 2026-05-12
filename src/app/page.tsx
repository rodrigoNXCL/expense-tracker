'use client'

import { useRouter } from 'next/navigation'
import { Check, Shield, ArrowRight, Lock, Clock, Camera, FileText } from 'lucide-react'
import Image from 'next/image'

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
                <h1 className="text-xl font-bold text-gray-900">GastosNX</h1>
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

      {/* ===== HERO PRINCIPAL ===== */}
      <section className="relative pt-24 pb-32 bg-gradient-to-br from-gray-50 to-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* GRID LAYOUT: Columna Izquierda (Texto) | Columna Derecha (Imagen) */}
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            
            {/* COLUMNA IZQUIERDA: Todo el texto */}
            <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
              
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-full text-sm font-medium mb-8">
                <Shield className="w-4 h-4" />
                Para pymes y contadores en Chile • Compatible con el SII
              </div>

              {/* Título Principal */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight tracking-tight">
                Estás pagando más impuestos
                <br />
                <span className="text-emerald-600">de los que te corresponden.</span>
              </h1>

              {/* Subtítulo */}
              <p className="text-lg sm:text-xl text-gray-600 mb-10 max-w-2xl leading-relaxed">
                Cada gasto menor de tu empresa sin respaldo es dinero que le estás 
                regalando al SII. GastosNX lo detiene.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto mb-16 justify-center lg:justify-start">
                <button
                  onClick={() => router.push('/registro/free')}
                  className="w-full sm:w-auto px-8 sm:px-10 py-4 sm:py-5 bg-emerald-600 text-white text-lg font-bold rounded-xl hover:bg-emerald-700 transition-all inline-flex items-center justify-center gap-2 shadow-lg"
                >
                  Probar Gratis
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button
                  onClick={() => document.getElementById('como-funciona')?.scrollIntoView({ behavior: 'smooth' })}
                  className="w-full sm:w-auto px-8 sm:px-10 py-4 sm:py-5 bg-white text-gray-700 text-lg font-bold rounded-xl border-2 border-gray-300 hover:border-gray-400 transition-all"
                >
                  Cómo Funciona
                </button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 sm:gap-8 pt-8 border-t border-gray-200 w-full max-w-lg mx-auto lg:mx-0">
                <div className="text-center">
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900">100%</p>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1">Gastos respaldados ante el SII</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900">&lt;10s</p>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1">Encuentra cualquier boleta</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900">OCR</p>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1">Tecnología bancaria - Azure AI</p>
                </div>
              </div>
            </div>

            {/* COLUMNA DERECHA: Imagen (Solo Desktop) */}
            <div className="hidden lg:block relative">
              <div className="relative w-full h-[600px] rounded-2xl overflow-hidden shadow-2xl transform rotate-1 hover:rotate-0 transition-all duration-500">
                <Image
                  src="/images/hero_principal.webp"
                  alt="Empresario registrando gasto operacional con GastosNX desde su celular"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== CÓMO FUNCIONA ===== */}
      <section id="como-funciona" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              El eslabón que faltaba entre tu operación y tu contador.
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              GastosNX no reemplaza a tu contador. Le da todo lo que necesita para descontar 
              cada gasto real en tu Declaración de Renta anual. Sin boletas perdidas. 
              Sin gastos que quedaron fuera.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Paso 1 */}
            <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-200">
              <div className="relative w-full h-48 mb-6 rounded-lg overflow-hidden">
                <Image
                  src="/images/paso1_captura.webp"
                  alt="Captura de boleta con OCR en GastosNX"
                  fill
                  className="object-cover"
                />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">1. Fotografía el gasto donde ocurre</h3>
              <p className="text-gray-600">
                En el estacionamiento, en el restaurant, en la ferretería. Saca la foto 
                en el momento. GastosNX lee la boleta con inteligencia artificial y la 
                registra sola. Sin escribir nada.
              </p>
            </div>

            {/* Paso 2 */}
            <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-200">
              <div className="relative w-full h-48 mb-6 rounded-lg overflow-hidden">
                <Image
                  src="/images/paso2_respaldo.webp"
                  alt="Respaldo automático de gastos operacionales en la nube"
                  fill
                  className="object-cover"
                />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">2. Queda respaldado y categorizado</h3>
              <p className="text-gray-600">
                El sistema lo clasifica por tipo de gasto, lo guarda en la nube con 
                trazabilidad completa y lo deja disponible para cuando lo necesites. 
                Sin carpetas. Sin Excel manual.
              </p>
            </div>

            {/* Paso 3 */}
            <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-200">
              <div className="relative w-full h-48 mb-6 rounded-lg overflow-hidden">
                <Image
                  src="/images/paso3_contador.webp"
                  alt="Gastos exportados y listos para el contador en GastosNX"
                  fill
                  className="object-cover"
                />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">3. Tu contador lo descuenta en renta</h3>
              <p className="text-gray-600">
                Exporta todos los gastos del período con un clic. Llega a tu contador 
                con todo ordenado por categoría y fecha. Ningún gasto deducible queda 
                fuera de tu Declaración de Renta.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== SECCIÓN PROBLEMA ===== */}
      <section className="py-24 bg-gray-50 relative overflow-hidden">
        {/* Imagen de fondo semitransparente */}
        <div className="absolute inset-0 opacity-5">
          <Image
            src="/images/problema_boletas.webp"
            alt="Boletas y vouchers sin respaldo en escritorio de empresa"
            fill
            className="object-cover"
          />
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Un gasto sin respaldo no existe para el SII.
          </h2>
          <p className="text-xl text-gray-600 leading-relaxed mb-8">
            El peaje, el estacionamiento, la colación de trabajo, los materiales del día: 
            todos son gastos reales. Todos son deducibles. Pero sin respaldo, el SII no los reconoce.
            <br /><br />
            <span className="text-emerald-600 font-semibold">
              Cuando llega la Declaración de Renta, esos gastos no existen. Y tu empresa 
              paga impuestos sobre una base que debería ser menor. Eso no es mala suerte — 
              es falta de sistema.
            </span>
          </p>
        </div>
      </section>

      {/* ===== SECCIÓN SOLUCIÓN ===== */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-2xl mb-6">
              <Shield className="w-8 h-8 text-emerald-600" />
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Hecho para los que mueven Chile todos los días.
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              GastosNX está diseñado para pymes y contadores chilenos que necesitan 
              registrar gastos menores operacionales y descontarlos legalmente en renta. 
              Sin depender de papel. Sin carpetas improvisadas. Sin perder un peso 
              que te corresponde recuperar.
            </p>
          </div>

          {/* 6 Features */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <div className="bg-gray-50 rounded-xl p-6">
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
                <Camera className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Captura en segundos, donde estés</h3>
              <p className="text-gray-600 text-sm">
                Fotografía la boleta en el momento. Sin esperar llegar a la oficina. 
                Sin perder el respaldo.
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-6">
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Respaldo legal ante el SII</h3>
              <p className="text-gray-600 text-sm">
                Cada documento guardado en la nube con trazabilidad completa. 
                Válido ante fiscalización o auditoría.
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-6">
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
                <Lock className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Acceso inmediato para ti y tu contador</h3>
              <p className="text-gray-600 text-sm">
                Cualquier boleta en menos de 10 segundos. Sin llamar a nadie. 
                Sin buscar en carpetas.
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-6">
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
                <FileText className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Historial listo para declaración de renta</h3>
              <p className="text-gray-600 text-sm">
                Todos tus gastos ordenados por tipo, monto y fecha. 
                Exactamente como lo necesita tu contador.
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-6">
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
                <Check className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Exportación directa para tu contador</h3>
              <p className="text-gray-600 text-sm">
                Un clic y tienes todos los gastos del período en Excel o CSV. 
                Tu contador llega con todo listo.
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-6">
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
                <Clock className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Menos papeles. Más gastos deducibles.</h3>
              <p className="text-gray-600 text-sm">
                Cada boleta que antes se perdía, ahora está respaldada. 
                Y eso se traduce en menos impuestos al cierre del año.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== SECCIÓN DIFERENCIAL ===== */}
      <section className="py-24 bg-gradient-to-br from-emerald-50 to-teal-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-2xl mb-6">
            <Shield className="w-8 h-8 text-emerald-600" />
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Si el gasto existe, debería quedar respaldado.
          </h2>
          <p className="text-xl text-gray-600 leading-relaxed">
            GastosNX está diseñado para empresas y contribuyentes de primera categoría 
            que necesitan registrar gastos operacionales menores y descontarlos de su 
            base imponible en la Declaración de Renta anual. Si el gasto ocurrió y 
            tienes el respaldo, el SII lo acepta. Nosotros nos encargamos de que 
            siempre tengas ese respaldo.
          </p>
        </div>
      </section>

      {/* ===== TIPOS DE GASTO ===== */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              ¿Qué gastos puedes descontar en tu renta?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              En Chile, los gastos operacionales menores son deducibles si cuentas 
              con el respaldo correspondiente. GastosNX te ayuda a capturarlos todos, 
              sin que ninguno quede fuera de tu declaración.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <div className="flex items-start gap-4 p-6 bg-emerald-50 rounded-xl">
              <div className="text-4xl">🛣️</div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Peajes</h3>
                <p className="text-gray-600 text-sm">
                  Gastos de peaje deducibles. Fotografía el voucher en el momento 
                  y nunca más pierdas ese respaldo.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-6 bg-emerald-50 rounded-xl">
              <div className="text-4xl">🅿️</div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Estacionamientos</h3>
                <p className="text-gray-600 text-sm">
                  Estacionamientos de trabajo, 100% deducibles. 
                  Respalda cada ticket antes de que se borre.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-6 bg-emerald-50 rounded-xl">
              <div className="text-4xl">🛒</div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Compras menores</h3>
                <p className="text-gray-600 text-sm">
                  Materiales, insumos y compras menores suman más de lo que 
                  crees al cierre tributario.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-6 bg-emerald-50 rounded-xl">
              <div className="text-4xl">📄</div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Vouchers</h3>
                <p className="text-gray-600 text-sm">
                  Vouchers digitalizados y con trazabilidad. 
                  Válidos ante cualquier revisión del SII.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-6 bg-emerald-50 rounded-xl">
              <div className="text-4xl">☕</div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Colaciones</h3>
                <p className="text-gray-600 text-sm">
                  Colaciones de trabajo son gasto deducible. 
                  GastosNX las respalda antes de que se pierdan.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-6 bg-emerald-50 rounded-xl">
              <div className="text-4xl">📦</div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Gastos operacionales diarios</h3>
                <p className="text-gray-600 text-sm">
                  Cada gasto operacional del día, respaldado y listo 
                  para descontarlo en tu Declaración de Renta.
                </p>
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
              Elige tu plan. Empieza a recuperar lo que estabas perdiendo.
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              El costo mensual de GastosNX es menor que el primer gasto deducible 
              que rescates. Así de directo.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Plan Free */}
            <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-200">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Free</h3>
                <p className="text-gray-600">Pruébalo con tus propios gastos reales. Sin tarjeta.</p>
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

            {/* Plan Pro */}
            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl p-8 shadow-2xl transform scale-105 relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-yellow-400 text-yellow-900 px-4 py-1 rounded-full text-sm font-bold">
                MÁS POPULAR
              </div>
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-white mb-2">Pro</h3>
                <p className="text-emerald-100">Para pymes que quieren cerrar el año pagando menos.</p>
              </div>
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
                <p className="text-gray-600">Para empresas con múltiples centros de costo y equipos que generan gastos en terreno.</p>
              </div>
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

          {/* Nota de urgencia */}
          <div className="text-center mt-12 p-6 bg-amber-50 border border-amber-200 rounded-xl">
            <p className="text-amber-800 font-medium">
              ⚠️ La Declaración de Renta es una vez al año. Los gastos ocurren todos los días. 
              Cada semana sin GastosNX es una semana de respaldos que ya no puedes recuperar.
            </p>
          </div>
        </div>
      </section>

      {/* ===== CIERRE ===== */}
      <section className="py-24 bg-gray-900 relative overflow-hidden">
        {/* Imagen de fondo semitransparente */}
        <div className="absolute inset-0 opacity-10">
          <Image
            src="/images/cierre_cta.webp"
            alt="Boleta respaldada digitalmente con GastosNX"
            fill
            className="object-cover"
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Imagen Izquierda (Solo Desktop) */}
            <div className="relative hidden lg:block">
              <div className="relative w-full h-[400px] rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src="/images/para_pymes.webp"
                  alt="Dueño de pyme chilena con control de gastos en su celular"
                  fill
                  className="object-cover"
                />
              </div>
            </div>

            {/* Copy Cierre */}
            <div className="text-center lg:text-left">
              <h2 className="text-4xl font-bold text-white mb-6">
                Llega a tu contador con todo. Paga solo lo que te corresponde.
              </h2>
              <p className="text-xl text-gray-300 mb-10 leading-relaxed">
                Cada gasto que registras hoy puede volver mañana como ahorro real 
                en tu declaración. GastosNX es la herramienta que conecta tu 
                operación con tu contador — para que ningún gasto válido quede 
                fuera de tu renta.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center">
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
          </div>
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
                <h3 className="text-lg font-bold text-white">GastosNX</h3>
              </div>
              <p className="text-sm text-gray-400">
                GastosNX es el sistema que usan pymes y contadores en Chile para 
                registrar, respaldar y descontar gastos operacionales menores en 
                la Declaración de Renta anual. Compatible con los requisitos del 
                SII. Desarrollado en Chile para la realidad tributaria chilena.
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
            <p>© 2026 GastosNX by NXChile. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </main>
  )
}