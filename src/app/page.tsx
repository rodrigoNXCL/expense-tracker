'use client'

import { useRouter } from 'next/navigation'
import { Check, Shield, ArrowRight, Lock, Clock, Camera, FileText, Users, Download, CreditCard } from 'lucide-react'
import Image from 'next/image'

export default function LandingPage() {
  const router = useRouter()

  return (
    <main className="min-h-screen bg-white">
      {/* ===== NAVBAR ===== */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center text-white text-xl font-bold">🧾</div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">GastosNX</h1>
                <p className="text-xs text-gray-500">by NXChile</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => router.push('/login')} className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">Iniciar Sesión</button>
              <button onClick={() => router.push('/registro')} className="px-5 py-2.5 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-700 transition-colors">Ver Planes</button>
            </div>
          </div>
        </div>
      </nav>

      {/* ===== HERO PRINCIPAL (BLOQUE 3) ===== */}
      <section className="relative pt-20 pb-16 lg:pt-28 lg:pb-32 bg-gradient-to-br from-gray-50 to-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-12 items-center">
            <div className="text-center lg:text-left flex flex-col items-center lg:items-start">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-full text-sm font-medium mb-6">
                Para pymes y contadores en Chile
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight tracking-tight">
                Deja de perder gastos <br />
                <span className="text-emerald-600">antes de renta.</span>
              </h1>
              <p className="text-lg sm:text-xl text-gray-600 mb-10 max-w-2xl leading-relaxed">
                Captura y organiza tus respaldos desde el celular en segundos.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto justify-center lg:justify-start">
                <button onClick={() => router.push('/registro/free')} className="w-full sm:w-auto px-8 py-4 bg-emerald-600 text-white text-lg font-bold rounded-xl hover:bg-emerald-700 transition-all inline-flex items-center justify-center gap-2 shadow-lg">
                  Prueba Gratis <ArrowRight className="w-5 h-5" />
                </button>
                <button onClick={() => router.push('/registro')} className="w-full sm:w-auto px-8 py-4 bg-white text-gray-700 text-lg font-bold rounded-xl border-2 border-gray-300 hover:border-gray-400 transition-all">
                  Ver Planes
                </button>
              </div>
            </div>
            <div className="relative hidden lg:block w-full">
              <div className="relative w-full h-[400px] lg:h-[550px] rounded-2xl overflow-hidden shadow-2xl">
                <Image src="/images/hero_principal.webp" alt="Usuario fotografiando una boleta con GastosNX antes de que se pierda" fill className="object-cover" priority />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== BLOQUE DE CONFIANZA SIMPLE (BLOQUE 4) ===== */}
      <section className="py-10 bg-white border-y border-gray-100">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-lg text-gray-600 font-medium">
            Pensado para pymes y contadores que necesitan dejar atrás el caos de las boletas.
          </p>
        </div>
      </section>

      {/* ===== CÓMO FUNCIONA ===== */}
      <section id="como-funciona" className="py-20 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">El eslabón que faltaba entre tu operación y tu contador.</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">GastosNX no reemplaza a tu contador. Le da todo lo que necesita para revisar tu operación sin perder tiempo. Sin boletas perdidas. Sin gastos que quedaron fuera.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-200">
              <div className="relative w-full h-48 mb-6 rounded-lg overflow-hidden">
                <Image src="/images/paso1_captura.webp" alt="Usuario capturando un gasto con GastosNX desde el celular" fill className="object-cover" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">1. Fotografía el gasto donde ocurre</h3>
              <p className="text-gray-600">En el estacionamiento, en el restaurant, en la ferretería. Saca la foto en el momento. GastosNX lee la boleta y la registra sola. Sin escribir nada.</p>
            </div>
            <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-200">
              <div className="relative w-full h-48 mb-6 rounded-lg overflow-hidden">
                <Image src="/images/paso2_respaldo.webp" alt="Respaldo digital de gastos operacionales guardados desde el celular" fill className="object-cover" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">2. Queda respaldado y categorizado</h3>
              <p className="text-gray-600">El sistema lo clasifica por tipo de gasto, lo guarda en la nube con trazabilidad completa y lo deja disponible para cuando lo necesites. Sin carpetas. Sin Excel manual.</p>
            </div>
            <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-200">
              <div className="relative w-full h-48 mb-6 rounded-lg overflow-hidden">
                <Image src="/images/paso3_contador.webp" alt="Vista del dashboard de GastosNX con exportación de gastos en CSV y Excel" fill className="object-cover" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">3. Tu contador recibe la información ordenada</h3>
              <p className="text-gray-600">Exporta todos los gastos del período con un clic. Llega a tu contador con todo ordenado por categoría y fecha. Menos gastos perdidos antes de llegar al contador.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== SECCIÓN PROBLEMA ===== */}
      <section className="py-20 lg:py-24 bg-gray-50 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <Image src="/images/problema_boletas.webp" alt="Boletas y vouchers sin respaldo en escritorio de empresa" fill className="object-cover" />
        </div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">Un gasto sin respaldo suele perderse en el proceso.</h2>
          <p className="text-lg text-gray-600 leading-relaxed mb-8">
            El peaje, el estacionamiento, la colación de trabajo, los materiales del día: todos son gastos reales. Todos son gastos que conviene guardar y ordenar. Pero sin respaldo, el SII no los reconoce.
            <br /><br />
            <span className="text-emerald-600 font-semibold">Cuando llega la Declaración de Renta, esos gastos no existen. Y tu empresa paga impuestos sobre una base que debería ser menor. Eso no es mala suerte — es falta de sistema.</span>
          </p>
        </div>
      </section>

      {/* ===== SECCIÓN SOLUCIÓN / FEATURES ===== */}
      <section className="py-20 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-2xl mb-6">
              <Shield className="w-8 h-8 text-emerald-600" />
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Hecho para los que mueven Chile todos los días.</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">GastosNX está diseñado para pymes y contadores chilenos que necesitan registrar gastos menores operacionales y mantener el orden antes del cierre. Sin depender de papel. Sin carpetas improvisadas. Sin perder un peso que te corresponde recuperar.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <div className="bg-gray-50 rounded-xl p-6">
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4"><Camera className="w-6 h-6 text-emerald-600" /></div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Captura en segundos, donde estés</h3>
              <p className="text-gray-600 text-sm">Fotografía la boleta en el momento. Sin esperar llegar a la oficina. Sin perder el respaldo.</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-6">
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4"><Shield className="w-6 h-6 text-emerald-600" /></div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Respaldo digital con trazabilidad</h3>
              <p className="text-gray-600 text-sm">Cada documento guardado en la nube con trazabilidad completa. Documentos guardados y disponibles para revisión.</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-6">
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4"><Lock className="w-6 h-6 text-emerald-600" /></div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Acceso inmediato para ti y tu contador</h3>
              <p className="text-gray-600 text-sm">Cualquier boleta en menos de 10 segundos. Sin llamar a nadie. Sin buscar en carpetas.</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-6">
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4"><FileText className="w-6 h-6 text-emerald-600" /></div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Historial listo para declaración de renta</h3>
              <p className="text-gray-600 text-sm">Todos tus gastos ordenados por tipo, monto y fecha. Exactamente como lo necesita tu contador.</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-6">
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4"><Check className="w-6 h-6 text-emerald-600" /></div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Exportación directa para tu contador</h3>
              <p className="text-gray-600 text-sm">Un clic y tienes todos los gastos del período en Excel o CSV. Tu contador llega con todo listo.</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-6">
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4"><Clock className="w-6 h-6 text-emerald-600" /></div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Menos papeles. Más orden.</h3>
              <p className="text-gray-600 text-sm">Cada boleta que antes se perdía, ahora está respaldada. Y eso se traduce en llegar a tu contador con todo más claro y ordenado.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== SECCIÓN DIFERENCIAL ===== */}
      <section className="py-20 lg:py-24 bg-gradient-to-br from-emerald-50 to-teal-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-2xl mb-6">
            <Shield className="w-8 h-8 text-emerald-600" />
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">Si el gasto existe, debería quedar respaldado.</h2>
          <p className="text-lg text-gray-600 leading-relaxed">GastosNX está diseñado para empresas y contribuyentes que necesitan registrar gastos operacionales menores y mantener el orden antes del cierre. Si el gasto queda guardado y ordenado, tu contador puede revisarlo con más facilidad. Nosotros nos encargamos de que siempre tengas ese respaldo.</p>
        </div>
      </section>

      {/* ===== TIPOS DE GASTO ===== */}
      <section className="py-20 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">¿Qué gastos puedes guardar con GastosNX?</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">En Chile, los gastos operacionales menores son importantes de registrar. GastosNX te ayuda a capturarlos todos, sin que ninguno quede fuera de tu declaración.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <div className="flex items-start gap-4 p-6 bg-emerald-50 rounded-xl">
              <div className="text-4xl">🛣️</div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Peajes</h3>
                <p className="text-gray-600 text-sm">Gastos de peaje que conviene respaldar en el momento. Fotografía el voucher y nunca más pierdas ese respaldo.</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-6 bg-emerald-50 rounded-xl">
              <div className="text-4xl">🅿️</div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Estacionamientos</h3>
                <p className="text-gray-600 text-sm">Estacionamientos y gastos diarios que conviene respaldar en el momento. Respalda cada ticket antes de que se borre.</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-6 bg-emerald-50 rounded-xl">
              <div className="text-4xl">🛒</div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Compras menores</h3>
                <p className="text-gray-600 text-sm">Materiales, insumos y compras menores suman más de lo que crees al cierre tributario.</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-6 bg-emerald-50 rounded-xl">
              <div className="text-4xl">📄</div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Vouchers</h3>
                <p className="text-gray-600 text-sm">Vouchers digitalizados y con trazabilidad. Válidos ante cualquier revisión.</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-6 bg-emerald-50 rounded-xl">
              <div className="text-4xl">☕</div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Colaciones</h3>
                <p className="text-gray-600 text-sm">Colaciones y gastos diarios que muchas veces se olvidan si no se registran a tiempo.</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-6 bg-emerald-50 rounded-xl">
              <div className="text-4xl">📦</div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Gastos operacionales diarios</h3>
                <p className="text-gray-600 text-sm">Cada gasto operacional del día, respaldado y listo para descontarlo en tu Declaración de Renta.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== PLAN CONTADOR ===== */}
      <section id="contadores" className="py-20 lg:py-24 bg-emerald-900/85 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white text-emerald-900 rounded-full text-sm font-bold">
              Para contadores
            </div>
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold text-white text-center mb-6">Tú cobras por ordenar. Nosotros lo ordenamos por ti.</h2>
          <p className="text-lg text-white/85 text-center max-w-3xl mx-auto mb-12 leading-relaxed">
            Si manejas varias empresas, el Plan Contador de GastosNX está hecho para ti.
            Tus clientes registran sus gastos. Tú recibes todo ordenado para trabajar.
            Sin bolsas de boletas. Sin fotos por WhatsApp. Sin horas perdidas antes del cierre.
          </p>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-16">
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Panel centralizado</h3>
              <p className="text-white/85 text-sm">Administra todos tus clientes desde una sola cuenta. Sin entrar y salir de sesiones distintas.</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mb-4">
                <Download className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Todo listo para exportar</h3>
              <p className="text-white/85 text-sm">Cada empresa con sus gastos ordenados por fecha y categoría. Un clic y tienes el CSV para trabajar.</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mb-4">
                <CreditCard className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Precio por usuario</h3>
              <p className="text-white/85 text-sm">Pagas solo por los clientes que activas. Sin paquetes fijos. Sin pagar por lo que no usas.</p>
            </div>
          </div>
          <div className="text-center mb-12">
            <p className="text-white/70 text-sm mb-2">Plan Contador</p>
            <div className="text-5xl md:text-6xl font-bold text-white mb-2">
              $2.500 <span className="text-2xl md:text-3xl font-normal text-white/70">por usuario / mes</span>
            </div>
            <p className="text-white/70 text-sm mb-1">Facturación anual. Mínimo 5 usuarios.</p>
            <p className="text-white/50 text-xs">Cada usuario incluye 100 registros al mes. Para clientes con mayor volumen, escalar a plan Pro o Enterprise.</p>
          </div>
          <div className="text-center mb-6">
            <a
              href="https://wa.me/56977412178?text=Hola%2C+soy+contador+y+me+interesa+el+Plan+Contador+de+GastosNX.+Quiero+saber+c%C3%B3mo+funciona+para+mis+clientes."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-10 py-5 bg-white text-emerald-900 text-lg font-bold rounded-xl hover:bg-emerald-50 transition-all shadow-lg"
            >
              Quiero el Plan Contador
              <ArrowRight className="w-5 h-5" />
            </a>
          </div>
          <p className="text-white/70 text-sm text-center">
            Sin contrato de permanencia para comenzar. Únete a los contadores que ya confían en GastosNX.
          </p>
        </div>
      </section>

      {/* ===== PLANES Y PRECIOS ===== */}
      <section id="precios" className="py-20 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Elige tu plan. Empieza a recuperar lo que estabas perdiendo.</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">El costo mensual de GastosNX es menor que el primer gasto deducible que rescates. Así de directo.</p>
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
                <li className="flex items-center gap-3 text-gray-600"><Check className="w-5 h-5 text-emerald-500 flex-shrink-0" /><span>1 usuario</span></li>
                <li className="flex items-center gap-3 text-gray-600"><Check className="w-5 h-5 text-emerald-500 flex-shrink-0" /><span>10 boletas/mes</span></li>
                <li className="flex items-center gap-3 text-gray-600"><Check className="w-5 h-5 text-emerald-500 flex-shrink-0" /><span>OCR Azure AI</span></li>
                <li className="flex items-center gap-3 text-gray-600"><Check className="w-5 h-5 text-emerald-500 flex-shrink-0" /><span>Dashboard básico</span></li>
              </ul>
              <button onClick={() => router.push('/registro/free')} className="w-full px-6 py-3 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition-colors">Prueba Gratis</button>
            </div>
            {/* Plan Pro */}
            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl p-8 shadow-2xl transform scale-105 relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-yellow-400 text-yellow-900 px-4 py-1 rounded-full text-sm font-bold">MÁS POPULAR</div>
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-white mb-2">Pro</h3>
                <p className="text-emerald-100">Para pymes que quieren cerrar el año pagando menos.</p>
              </div>
              <div className="mb-6">
                <div className="flex items-baseline gap-2 mb-1"><span className="text-4xl font-bold text-white">$9.900</span><span className="text-emerald-100">/mes</span></div>
                <p className="text-xs text-emerald-100 mb-2">Facturación anual ($118.800 total)</p>
                <div className="bg-white/20 rounded-lg p-2"><p className="text-xs text-white"><span className="font-semibold">También disponible:</span> $12.900/mes sin contrato anual</p></div>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3 text-white"><Check className="w-5 h-5 flex-shrink-0" /><span>Hasta 2 usuarios</span></li>
                <li className="flex items-center gap-3 text-white"><Check className="w-5 h-5 flex-shrink-0" /><span>500 boletas/mes</span></li>
                <li className="flex items-center gap-3 text-white"><Check className="w-5 h-5 flex-shrink-0" /><span>OCR Azure AI</span></li>
                <li className="flex items-center gap-3 text-white"><Check className="w-5 h-5 flex-shrink-0" /><span>Dashboard avanzado</span></li>
                <li className="flex items-center gap-3 text-white"><Check className="w-5 h-5 flex-shrink-0" /><span>Export CSV + Excel</span></li>
              </ul>
              <button onClick={() => router.push('/registro/pago?plan=pro')} className="w-full px-6 py-3 bg-white text-emerald-600 font-semibold rounded-lg hover:bg-emerald-50 transition-colors">Elegir Pro</button>
            </div>
            {/* Plan Enterprise */}
            <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-200">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Enterprise</h3>
                <p className="text-gray-600">Para empresas con múltiples centros de costo y equipos que generan gastos en terreno.</p>
              </div>
              <div className="mb-6">
                <div className="flex items-baseline gap-2 mb-1"><span className="text-4xl font-bold text-gray-900">$19.990</span><span className="text-gray-600">/mes</span></div>
                <p className="text-xs text-gray-500 mb-2">Facturación anual ($239.880 total)</p>
                <div className="bg-gray-100 rounded-lg p-2"><p className="text-xs text-gray-600"><span className="font-semibold">También disponible:</span> $24.990/mes sin contrato anual</p></div>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3 text-gray-600"><Check className="w-5 h-5 text-emerald-500 flex-shrink-0" /><span>Hasta 5 usuarios</span></li>
                <li className="flex items-center gap-3 text-gray-600"><Check className="w-5 h-5 text-emerald-500 flex-shrink-0" /><span>Boletas ilimitadas</span></li>
                <li className="flex items-center gap-3 text-gray-600"><Check className="w-5 h-5 text-emerald-500 flex-shrink-0" /><span>OCR Azure AI</span></li>
                <li className="flex items-center gap-3 text-gray-600"><Check className="w-5 h-5 text-emerald-500 flex-shrink-0" /><span>API access</span></li>
                <li className="flex items-center gap-3 text-gray-600"><Check className="w-5 h-5 text-emerald-500 flex-shrink-0" /><span>Soporte 24/7</span></li>
              </ul>
              <button onClick={() => router.push('/registro/pago?plan=enterprise')} className="w-full px-6 py-3 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition-colors">Elegir Enterprise</button>
            </div>
          </div>
          <div className="text-center mt-12 p-6 bg-amber-50 border border-amber-200 rounded-xl">
            <p className="text-amber-800 font-medium">⚠️ La Declaración de Renta es una vez al año. Los gastos ocurren todos los días. Cada semana sin GastosNX es una semana de respaldos que ya no puedes recuperar.</p>
          </div>
        </div>
      </section>

      {/* ===== CIERRE ===== */}
      <section className="py-20 lg:py-24 bg-gray-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <Image src="/images/cierre_cta.webp" alt="Boleta respaldada digitalmente con GastosNX" fill className="object-cover" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="relative hidden lg:block">
              <div className="relative w-full h-[400px] rounded-2xl overflow-hidden shadow-2xl">
                <Image src="/images/para_pymes.webp" alt="Dueño de pyme chilena con control de gastos en su celular" fill className="object-cover" />
              </div>
            </div>
            <div className="text-center lg:text-left">
              <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">Llega a tu contador con todo. Paga solo lo que te corresponde.</h2>
              <p className="text-lg text-gray-300 mb-10 leading-relaxed">Cada gasto que registras hoy puede volver mañana como ahorro real en tu declaración. GastosNX es la herramienta que conecta tu operación con tu contador — para que ningún gasto válido quede fuera de tu renta.</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center">
                <button onClick={() => router.push('/registro/free')} className="px-10 py-5 bg-emerald-600 text-white text-lg font-bold rounded-xl hover:bg-emerald-700 transition-all inline-flex items-center gap-2">Comenzar ahora <ArrowRight className="w-5 h-5" /></button>
                <button onClick={() => router.push('/registro')} className="px-10 py-5 bg-white text-gray-900 text-lg font-bold rounded-xl hover:bg-gray-100 transition-all">Ver Planes</button>
              </div>
              <p className="text-sm text-gray-400 mt-8">⏱️ Recibirás tus accesos en máximo 24 hrs hábiles</p>
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
                <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-bold">🧾</div>
                <h3 className="text-lg font-bold text-white">GastosNX</h3>
              </div>
              <p className="text-sm text-gray-400">GastosNX es el sistema que usan pymes y contadores en Chile para registrar, respaldar y descontar gastos operacionales menores en la Declaración de Renta anual. Compatible con los requisitos del SII. Desarrollado en Chile para la realidad tributaria chilena.</p>
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
            <p className="mb-2">GastosNX no reemplaza al contador ni determina deducibilidad tributaria. Su objetivo es ayudarte a mantener respaldo y orden documental.</p>
            <p>© 2026 GastosNX by NXChile. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </main>
  )
}