'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Check, Shield, ArrowRight, Lock, Clock, Camera, FileText, MessageCircle, X, Play, Star, Building2, Calculator, Briefcase, Users } from 'lucide-react'
import Image from 'next/image'

export default function LandingPage() {
  const router = useRouter()
  const [showStickyCTA, setShowStickyCTA] = useState(false)
  const [showWhatsApp, setShowWhatsApp] = useState(true)

  useEffect(() => {
    const handleScroll = () => {
      setShowStickyCTA(window.scrollY > 800)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const whatsappMessage = encodeURIComponent('Hola, vengo de gastos.nxchile.com y quiero saber más sobre GastosNX para mi empresa.')
  const whatsappLink = `https://wa.me/56977412178?text=${whatsappMessage}`

  return (
    <main className="min-h-screen bg-white text-neutral-900 antialiased">
      {/* ===== NAVBAR ===== */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-white/85 backdrop-blur-xl border-b border-black/5">
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
            <div className="flex items-center gap-1">
              <button onClick={() => router.push('/login')} className="px-5 py-2.5 text-sm font-medium text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100 rounded-full transition-colors">Iniciar Sesión</button>
              <button onClick={() => router.push('/registro')} className="ml-2 px-5 py-2.5 bg-neutral-900 text-white text-sm font-semibold rounded-full hover:bg-neutral-700 transition-colors">Ver Planes</button>
            </div>
          </div>
        </div>
      </nav>

      {/* ===== HERO PRINCIPAL ===== */}
      <section className="relative pt-32 pb-20 lg:pt-44 lg:pb-32 bg-linear-to-b from-white to-neutral-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <div className="text-center lg:text-left flex flex-col items-center lg:items-start nx-fade-up">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-emerald-50 border border-emerald-200/60 text-emerald-700 rounded-full text-[13px] font-medium mb-8">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Producto de NXChile · Tecnología operacional
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-[64px] font-bold text-neutral-900 mb-6 leading-[1.05] tracking-tight">
                Deja de perder gastos operacionales
                <br className="hidden sm:block" />
                <span className="text-emerald-600"> antes de la Declaración de Renta.</span>
              </h1>
              <p className="text-lg sm:text-xl text-neutral-500 mb-10 max-w-xl leading-relaxed">
                Captura boletas desde el celular, organízalas automáticamente y entrégalas listas a tu contador. Desarrollado por NXChile.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <button onClick={() => router.push('/registro/free')} className="w-full sm:w-auto px-7 py-3.5 bg-neutral-900 text-white text-base font-semibold rounded-full hover:bg-neutral-700 transition-all inline-flex items-center justify-center gap-2">
                  Prueba Gratis <ArrowRight className="w-4 h-4" />
                </button>
                <button onClick={() => router.push('/registro')} className="w-full sm:w-auto px-7 py-3.5 bg-white text-neutral-700 text-base font-semibold rounded-full border border-neutral-200 hover:border-neutral-300 transition-all">
                  Ver Planes
                </button>
              </div>
            </div>
            <div className="relative hidden lg:block nx-fade-up" style={{ animationDelay: '0.15s' }}>
              <div className="relative w-full h-110 lg:h-140 rounded-[28px] overflow-hidden shadow-2xl shadow-black/10 ring-1 ring-black/5">
                <Image src="/images/hero_principal.webp" alt="Usuario fotografiando una boleta con GastosNX antes de que se pierda" fill className="object-cover" priority />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== PRUEBA SOCIAL: LOGOS DE CLIENTES ===== */}
      <section className="py-12 lg:py-16 bg-neutral-50 border-b border-black/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm font-semibold text-neutral-500 uppercase tracking-wider mb-8">
            Empresas y contadores que ya ordenan sus gastos con GastosNX
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12 items-center">
            <div className="flex items-center justify-center h-20 transition-all opacity-60 hover:opacity-100 grayscale hover:grayscale-0">
              <Image src="/images/clients/ac_logo.png" alt="AC Constructores y Consultores" width={240} height={80} className="max-h-16 w-auto object-contain" />
            </div>
            <div className="flex items-center justify-center h-20 transition-all opacity-60 hover:opacity-100 grayscale hover:grayscale-0">
              <Image src="/images/clients/RCCServicios.jpeg" alt="RCC Servicios EIRL" width={240} height={80} className="max-h-16 w-auto object-contain" />
            </div>
            <div className="flex items-center justify-center h-20 transition-all opacity-60 hover:opacity-100 grayscale hover:grayscale-0">
              <Image src="/images/clients/sanAndres.png" alt="Transportes San Andrés SPA" width={240} height={80} className="max-h-16 w-auto object-contain" />
            </div>
            <div className="flex items-center justify-center h-20 transition-all opacity-60 hover:opacity-100 grayscale hover:grayscale-0">
              <Image src="/images/clients/bastcon.jpg" alt="Bastcon" width={240} height={80} className="max-h-16 w-auto object-contain" />
            </div>
          </div>
        </div>
      </section>

      {/* ===== BLOQUE DE CONFIANZA SIMPLE ===== */}
      <section className="py-12 bg-white border-y border-black/5">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-lg text-neutral-600 font-medium">
            Pensado para pymes y contadores que necesitan dejar atrás el caos de las boletas.
          </p>
        </div>
      </section>

      {/* ===== CÓMO FUNCIONA — 3 PASOS + VIDEO DEMO ===== */}
      <section id="como-funciona" className="py-24 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <h2 className="text-3xl lg:text-5xl font-bold text-neutral-900 mb-5 tracking-tight">El eslabón que faltaba entre tu operación y tu contador.</h2>
            <p className="text-lg text-neutral-500 leading-relaxed">GastosNX no reemplaza a tu contador. Le da todo lo que necesita para revisar tu operación sin perder tiempo. Sin boletas perdidas. Sin gastos que quedaron fuera.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto mb-16">
            <div className="bg-neutral-50 rounded-3xl p-8 border border-black/10 hover:border-emerald-300 transition-all">
              <div className="relative w-full h-44 mb-6 rounded-2xl overflow-hidden">
                <Image src="/images/paso1_captura.webp" alt="Usuario capturando un gasto con GastosNX desde el celular" fill className="object-cover" />
              </div>
              <div className="inline-flex items-center justify-center w-8 h-8 bg-emerald-100 text-emerald-700 rounded-full text-sm font-bold mb-3">1</div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">Captura en el momento</h3>
              <p className="text-neutral-500 text-[15px] leading-relaxed">En el estacionamiento, en el restaurant, en la ferretería. Saca la foto en el momento. GastosNX lee la boleta y la registra sola. <span className="text-emerald-700 font-medium">Ahorras tiempo y nunca más persigues un voucher.</span></p>
            </div>
            <div className="bg-neutral-50 rounded-3xl p-8 border border-black/10 hover:border-emerald-300 transition-all">
              <div className="relative w-full h-44 mb-6 rounded-2xl overflow-hidden">
                <Image src="/images/paso2_respaldo.webp" alt="Respaldo digital de gastos operacionales guardados desde el celular" fill className="object-cover" />
              </div>
              <div className="inline-flex items-center justify-center w-8 h-8 bg-emerald-100 text-emerald-700 rounded-full text-sm font-bold mb-3">2</div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">Respaldo automático en la nube</h3>
              <p className="text-neutral-500 text-[15px] leading-relaxed">El sistema lo clasifica por tipo de gasto, lo guarda con trazabilidad completa y lo deja disponible para cuando lo necesites. <span className="text-emerald-700 font-medium">Trazabilidad real, lista para el SII.</span></p>
            </div>
            <div className="bg-neutral-50 rounded-3xl p-8 border border-black/10 hover:border-emerald-300 transition-all">
              <div className="relative w-full h-44 mb-6 rounded-2xl overflow-hidden">
                <Image src="/images/paso3_contador.webp" alt="Vista del dashboard de GastosNX con exportación de gastos en CSV y Excel" fill className="object-cover" />
              </div>
              <div className="inline-flex items-center justify-center w-8 h-8 bg-emerald-100 text-emerald-700 rounded-full text-sm font-bold mb-3">3</div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">Tu contador recibe todo ordenado</h3>
              <p className="text-neutral-500 text-[15px] leading-relaxed">Exporta todos los gastos del período con un clic. Llega con todo ordenado por categoría y fecha. <span className="text-emerald-700 font-medium">Menos horas de revisión, más orden para el cierre.</span></p>
            </div>
          </div>

          {/* ===== VIDEO DEMO ===== */}
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-emerald-50 border border-emerald-200/60 text-emerald-700 rounded-full text-[13px] font-medium mb-4">
                <Play className="w-3 h-3" />
                Demo en 40 segundos
              </div>
              <h3 className="text-2xl lg:text-3xl font-bold text-neutral-900 tracking-tight">Míralo funcionando</h3>
              <p className="text-neutral-500 mt-2">Sin registro, sin configuración. Solo lo que hace GastosNX por tu pyme.</p>
            </div>
            <div className="relative w-full rounded-3xl overflow-hidden shadow-2xl shadow-black/10 ring-1 ring-black/5" style={{ paddingTop: '56.25%' }}>
              <iframe
                src="https://www.youtube.com/embed/9txm6hqHre8?rel=0&modestbranding=1"
                title="Demo GastosNX — Funcionamiento del sistema"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute top-0 left-0 w-full h-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ===== SECCIÓN PROBLEMA ===== */}
      <section className="py-24 lg:py-28 bg-neutral-50 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04]">
          <Image src="/images/problema_boletas.webp" alt="Boletas y vouchers sin respaldo en escritorio de empresa" fill className="object-cover" />
        </div>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900 mb-6 tracking-tight">Un gasto sin respaldo suele perderse en el proceso.</h2>
          <p className="text-lg text-neutral-500 leading-relaxed mb-8">
            El peaje, el estacionamiento, la colación de trabajo, los materiales del día: todos son gastos reales. Todos son gastos que conviene guardar y ordenar. Pero sin respaldo, el SII no los reconoce.
            <br /><br />
            <span className="text-emerald-600 font-semibold">Cuando llega la Declaración de Renta, esos gastos no existen. Y tu empresa paga impuestos sobre una base que debería ser menor. Eso no es mala suerte — es falta de sistema.</span>
          </p>
        </div>
      </section>

      {/* ===== SECCIÓN SOLUCIÓN / FEATURES ===== */}
      <section className="py-24 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-neutral-900 rounded-2xl mb-8">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900 mb-4 tracking-tight">Hecho para los que mueven Chile todos los días.</h2>
            <p className="text-lg text-neutral-500 leading-relaxed">GastosNX está diseñado para pymes y contadores chilenos que necesitan registrar gastos menores operacionales y mantener el orden antes del cierre. Sin depender de papel. Sin carpetas improvisadas. Sin perder un peso que te corresponde recuperar.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
            <div className="bg-neutral-50 rounded-2xl p-6 border border-black/5">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mb-4 ring-1 ring-black/5"><Camera className="w-6 h-6 text-neutral-900" /></div>
              <h3 className="text-base font-semibold text-neutral-900 mb-1.5">Captura en segundos, donde estés</h3>
              <p className="text-neutral-500 text-sm leading-relaxed">Fotografía la boleta en el momento. Sin esperar llegar a la oficina. Sin perder el respaldo.</p>
            </div>
            <div className="bg-neutral-50 rounded-2xl p-6 border border-black/5">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mb-4 ring-1 ring-black/5"><Shield className="w-6 h-6 text-neutral-900" /></div>
              <h3 className="text-base font-semibold text-neutral-900 mb-1.5">Respaldo digital con trazabilidad</h3>
              <p className="text-neutral-500 text-sm leading-relaxed">Cada documento guardado en la nube con trazabilidad completa. Documentos guardados y disponibles para revisión.</p>
            </div>
            <div className="bg-neutral-50 rounded-2xl p-6 border border-black/5">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mb-4 ring-1 ring-black/5"><Lock className="w-6 h-6 text-neutral-900" /></div>
              <h3 className="text-base font-semibold text-neutral-900 mb-1.5">Acceso inmediato para ti y tu contador</h3>
              <p className="text-neutral-500 text-sm leading-relaxed">Cualquier boleta en menos de 10 segundos. Sin llamar a nadie. Sin buscar en carpetas.</p>
            </div>
            <div className="bg-neutral-50 rounded-2xl p-6 border border-black/5">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mb-4 ring-1 ring-black/5"><FileText className="w-6 h-6 text-neutral-900" /></div>
              <h3 className="text-base font-semibold text-neutral-900 mb-1.5">Historial listo para declaración de renta</h3>
              <p className="text-neutral-500 text-sm leading-relaxed">Todos tus gastos ordenados por tipo, monto y fecha. Exactamente como lo necesita tu contador.</p>
            </div>
            <div className="bg-neutral-50 rounded-2xl p-6 border border-black/5">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mb-4 ring-1 ring-black/5"><Check className="w-6 h-6 text-neutral-900" /></div>
              <h3 className="text-base font-semibold text-neutral-900 mb-1.5">Exportación directa para tu contador</h3>
              <p className="text-neutral-500 text-sm leading-relaxed">Un clic y tienes todos los gastos del período en Excel o CSV. Tu contador llega con todo listo.</p>
            </div>
            <div className="bg-neutral-50 rounded-2xl p-6 border border-black/5">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mb-4 ring-1 ring-black/5"><Clock className="w-6 h-6 text-neutral-900" /></div>
              <h3 className="text-base font-semibold text-neutral-900 mb-1.5">Menos papeles. Más orden.</h3>
              <p className="text-neutral-500 text-sm leading-relaxed">Cada boleta que antes se perdía, ahora está respaldada. Y eso se traduce en llegar a tu contador con todo más claro y ordenado.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== SECCIÓN DIFERENCIAL ===== */}
      <section className="py-24 lg:py-28 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-neutral-900 rounded-2xl mb-8">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900 mb-6 tracking-tight">Si el gasto existe, debería quedar respaldado.</h2>
          <p className="text-lg text-neutral-500 leading-relaxed">GastosNX está diseñado para empresas y contribuyentes que necesitan registrar gastos operacionales menores y mantener el orden antes del cierre. Si el gasto queda guardado y ordenado, tu contador puede revisarlo con más facilidad. Nosotros nos encargamos de que siempre tengas ese respaldo.</p>
        </div>
      </section>

      {/* ===== TIPOS DE GASTO ===== */}
      <section className="py-24 lg:py-28 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900 mb-4 tracking-tight">¿Qué gastos puedes guardar con GastosNX?</h2>
            <p className="text-lg text-neutral-500 leading-relaxed">En Chile, los gastos operacionales menores son importantes de registrar. GastosNX te ayuda a capturarlos todos, sin que ninguno quede fuera de tu declaración.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
            <div className="flex items-start gap-4 p-6 bg-white rounded-2xl border border-black/5">
              <div className="text-3xl">🛣️</div>
              <div>
                <h3 className="text-base font-semibold text-neutral-900 mb-1.5">Peajes</h3>
                <p className="text-neutral-500 text-sm leading-relaxed">Gastos de peaje que conviene respaldar en el momento. Fotografía el voucher y nunca más pierdas ese respaldo.</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-6 bg-white rounded-2xl border border-black/5">
              <div className="text-3xl">🅿️</div>
              <div>
                <h3 className="text-base font-semibold text-neutral-900 mb-1.5">Estacionamientos</h3>
                <p className="text-neutral-500 text-sm leading-relaxed">Estacionamientos y gastos diarios que conviene respaldar en el momento. Respalda cada ticket antes de que se borre.</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-6 bg-white rounded-2xl border border-black/5">
              <div className="text-3xl">🛒</div>
              <div>
                <h3 className="text-base font-semibold text-neutral-900 mb-1.5">Compras menores</h3>
                <p className="text-neutral-500 text-sm leading-relaxed">Materiales, insumos y compras menores suman más de lo que crees al cierre tributario.</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-6 bg-white rounded-2xl border border-black/5">
              <div className="text-3xl">📄</div>
              <div>
                <h3 className="text-base font-semibold text-neutral-900 mb-1.5">Vouchers</h3>
                <p className="text-neutral-500 text-sm leading-relaxed">Vouchers digitalizados y con trazabilidad. Válidos ante cualquier revisión.</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-6 bg-white rounded-2xl border border-black/5">
              <div className="text-3xl">☕</div>
              <div>
                <h3 className="text-base font-semibold text-neutral-900 mb-1.5">Colaciones</h3>
                <p className="text-neutral-500 text-sm leading-relaxed">Colaciones y gastos diarios que muchas veces se olvidan si no se registran a tiempo.</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-6 bg-white rounded-2xl border border-black/5">
              <div className="text-3xl">📦</div>
              <div>
                <h3 className="text-base font-semibold text-neutral-900 mb-1.5">Gastos operacionales diarios</h3>
                <p className="text-neutral-500 text-sm leading-relaxed">Cada gasto operacional del día, respaldado y listo para descontarlo en tu Declaración de Renta.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== PLANES Y PRECIOS ===== */}
      <section id="precios" className="py-24 lg:py-28 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900 mb-4 tracking-tight">Elige tu plan. Empieza a recuperar lo que estabas perdiendo.</h2>
            <p className="text-lg text-neutral-500 max-w-2xl mx-auto">El costo del plan se recupera con el primer gasto deducible que no pierdas. Sin tarjeta para empezar.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Plan Free */}
            <div className="bg-neutral-50 rounded-3xl p-8 border border-black/5 flex flex-col">
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-neutral-900 mb-1">Free</h3>
                <p className="text-neutral-500 text-sm">Pruébalo con tus propios gastos reales. Sin tarjeta, sin compromiso.</p>
              </div>
              <div className="mb-7">
                <span className="text-5xl font-bold text-neutral-900 tracking-tight">$0</span>
                <span className="text-neutral-500">/mes</span>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                <li className="flex items-center gap-3 text-neutral-600 text-[15px]"><Check className="w-5 h-5 text-emerald-500 shrink-0" /><span><strong>1 usuario</strong></span></li>
                <li className="flex items-center gap-3 text-neutral-600 text-[15px]"><Check className="w-5 h-5 text-emerald-500 shrink-0" /><span><strong>10 boletas / mes</strong></span></li>
                <li className="flex items-center gap-3 text-neutral-600 text-[15px]"><Check className="w-5 h-5 text-emerald-500 shrink-0" /><span><strong>OCR con Google AI</strong> (mismo que Pro)</span></li>
                <li className="flex items-center gap-3 text-neutral-600 text-[15px]"><Check className="w-5 h-5 text-emerald-500 shrink-0" /><span>Dashboard básico</span></li>
                <li className="flex items-center gap-3 text-neutral-600 text-[15px]"><Check className="w-5 h-5 text-emerald-500 shrink-0" /><span>Export CSV</span></li>
              </ul>
              <button onClick={() => router.push('/registro/free')} className="w-full px-6 py-3.5 bg-neutral-900 text-white text-[15px] font-semibold rounded-full hover:bg-neutral-700 transition-colors">Empezar gratis sin tarjeta</button>
              <p className="text-xs text-neutral-500 text-center mt-3">Ideal para probar el sistema con tus primeros gastos.</p>
            </div>
            {/* Plan Pro (Destacado) */}
            <div className="bg-neutral-900 rounded-3xl p-8 text-white relative shadow-2xl shadow-black/20 flex flex-col">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-emerald-500 text-white px-4 py-1 rounded-full text-xs font-semibold tracking-wide">MÁS POPULAR</div>
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-white mb-1">Pro</h3>
                <p className="text-neutral-400 text-sm">Para pymes que quieren cerrar el año pagando menos.</p>
              </div>
              <div className="mb-7 space-y-3">
                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
                  <p className="text-xs text-emerald-300 font-semibold mb-1">PAGO ANUAL · Recomendado</p>
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-3xl font-bold text-white tracking-tight">$3.300</span>
                    <span className="text-neutral-300 text-sm">/ usuario / mes</span>
                  </div>
                  <p className="text-xs text-neutral-300">Hasta 3 usuarios incluidos → <span className="font-semibold text-white">$9.900 / mes total</span></p>
                  <p className="text-xs text-neutral-400 mt-1">Usuario adicional: $2.500 c/u · IVA incluido</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <p className="text-xs text-neutral-400 font-semibold mb-1">PAGO MES A MES</p>
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-3xl font-bold text-white tracking-tight">$4.000</span>
                    <span className="text-neutral-300 text-sm">/ usuario / mes</span>
                  </div>
                  <p className="text-xs text-neutral-300">Hasta 3 usuarios incluidos → <span className="font-semibold text-white">$12.000 / mes total</span></p>
                  <p className="text-xs text-neutral-400 mt-1">Usuario adicional: $3.000 c/u · IVA incluido</p>
                </div>
              </div>
              <ul className="space-y-3 mb-6 flex-1">
                <li className="flex items-center gap-3 text-neutral-200 text-[15px]"><Check className="w-5 h-5 text-emerald-400 shrink-0" /><span>Hasta <strong>3 usuarios base + adicionales</strong></span></li>
                <li className="flex items-center gap-3 text-neutral-200 text-[15px]"><Check className="w-5 h-5 text-emerald-400 shrink-0" /><span><strong>500 boletas / mes</strong></span></li>
                <li className="flex items-center gap-3 text-neutral-200 text-[15px]"><Check className="w-5 h-5 text-emerald-400 shrink-0" /><span>OCR con Google AI</span></li>
                <li className="flex items-center gap-3 text-neutral-200 text-[15px]"><Check className="w-5 h-5 text-emerald-400 shrink-0" /><span>Dashboard avanzado</span></li>
                <li className="flex items-center gap-3 text-neutral-200 text-[15px]"><Check className="w-5 h-5 text-emerald-400 shrink-0" /><span>Export CSV + Excel</span></li>
                <li className="flex items-center gap-3 text-neutral-200 text-[15px]"><Check className="w-5 h-5 text-emerald-400 shrink-0" /><span>Soporte prioritario</span></li>
              </ul>
              <button onClick={() => router.push('/registro/pago?plan=pro')} className="w-full px-6 py-3.5 bg-white text-neutral-900 text-[15px] font-semibold rounded-full hover:bg-emerald-50 transition-colors">Elegir Pro</button>
              <p className="text-xs text-emerald-300 text-center mt-3">El plan anual sale más conveniente. Cada usuario adicional tiene precio preferencial.</p>
            </div>
          </div>
          <div className="text-center mt-14 p-6 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/60 rounded-2xl max-w-3xl mx-auto">
            <p className="text-neutral-700 font-medium">💡 <strong>El costo del plan se recupera con el primer gasto deducible que no pierdas.</strong> Cada semana sin GastosNX es una semana de respaldos que ya no puedes recuperar.</p>
          </div>
        </div>
      </section>

      {/* ===== CONFIANZA + NXCHILE ===== */}
      <section className="py-20 lg:py-24 bg-neutral-50 border-y border-black/5">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white border border-emerald-200/60 text-emerald-700 rounded-full text-[13px] font-medium mb-6">
            Producto oficial de NXChile
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900 mb-5 tracking-tight">
            GastosNX es un producto de NXChile.
          </h2>
          <p className="text-lg text-neutral-500 leading-relaxed max-w-3xl mx-auto mb-10">
            Tecnología operacional para empresas chilenas. Compatible con los requisitos del <span className="font-semibold text-neutral-700">SII</span> · <span className="font-semibold text-neutral-700">OCR con Google AI</span> · Desarrollado en Chile para la realidad tributaria chilena.
          </p>
          <div className="grid sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
            <div className="bg-white rounded-2xl p-5 border border-black/5">
              <div className="text-2xl mb-2">🏛️</div>
              <p className="text-sm font-semibold text-neutral-900">Compatible con SII</p>
              <p className="text-xs text-neutral-500 mt-1">Respaldo documental ordenado</p>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-black/5">
              <div className="text-2xl mb-2">🤖</div>
              <p className="text-sm font-semibold text-neutral-900">OCR con Google AI</p>
              <p className="text-xs text-neutral-500 mt-1">Lectura automática de boletas</p>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-black/5">
              <div className="text-2xl mb-2">🇨🇱</div>
              <p className="text-sm font-semibold text-neutral-900">Hecho en Chile</p>
              <p className="text-xs text-neutral-500 mt-1">Para la realidad local</p>
            </div>
          </div>
          <div className="mt-10">
            <a href="https://www.nxchile.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-emerald-700 font-semibold hover:text-emerald-800 transition-colors">
              Conoce NXChile →
            </a>
          </div>
        </div>
      </section>

      {/* ===== FAQ ===== */}
      <section id="faq" className="py-24 lg:py-28 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900 mb-4 tracking-tight">Preguntas frecuentes</h2>
            <p className="text-lg text-neutral-500">Lo que más nos preguntan antes de empezar.</p>
          </div>
          <div className="space-y-3">
            <details className="group bg-neutral-50 rounded-2xl border border-black/5 overflow-hidden">
              <summary className="flex items-center justify-between cursor-pointer p-5 text-left">
                <span className="font-semibold text-neutral-900">¿GastosNX determina si un gasto es deducible?</span>
                <span className="text-emerald-600 group-open:rotate-45 transition-transform text-xl leading-none">+</span>
              </summary>
              <div className="px-5 pb-5 text-neutral-600 text-[15px] leading-relaxed">No. GastosNX no reemplaza a tu contador ni determina deducibilidad tributaria. Su objetivo es entregarte respaldo y orden documental para que tu contador pueda trabajar mejor.</div>
            </details>
            <details className="group bg-neutral-50 rounded-2xl border border-black/5 overflow-hidden">
              <summary className="flex items-center justify-between cursor-pointer p-5 text-left">
                <span className="font-semibold text-neutral-900">¿Los documentos sirven ante el SII?</span>
                <span className="text-emerald-600 group-open:rotate-45 transition-transform text-xl leading-none">+</span>
              </summary>
              <div className="px-5 pb-5 text-neutral-600 text-[15px] leading-relaxed">GastosNX entrega respaldo y orden documental compatible con los requisitos del SII. La validez tributaria final la determina tu contador según la normativa vigente.</div>
            </details>
            <details className="group bg-neutral-50 rounded-2xl border border-black/5 overflow-hidden">
              <summary className="flex items-center justify-between cursor-pointer p-5 text-left">
                <span className="font-semibold text-neutral-900">¿Cuánto tarda el acceso?</span>
                <span className="text-emerald-600 group-open:rotate-45 transition-transform text-xl leading-none">+</span>
              </summary>
              <div className="px-5 pb-5 text-neutral-600 text-[15px] leading-relaxed">El plan Free se activa de inmediato. Los planes Pro se activan en máximo 24 hrs hábiles tras confirmar el pago.</div>
            </details>
            <details className="group bg-neutral-50 rounded-2xl border border-black/5 overflow-hidden">
              <summary className="flex items-center justify-between cursor-pointer p-5 text-left">
                <span className="font-semibold text-neutral-900">¿Puedo exportar a Excel/CSV?</span>
                <span className="text-emerald-600 group-open:rotate-45 transition-transform text-xl leading-none">+</span>
              </summary>
              <div className="px-5 pb-5 text-neutral-600 text-[15px] leading-relaxed">Sí. El plan Pro incluye exportación a CSV y Excel con todos los gastos del período, listos para tu contador.</div>
            </details>
            <details className="group bg-neutral-50 rounded-2xl border border-black/5 overflow-hidden">
              <summary className="flex items-center justify-between cursor-pointer p-5 text-left">
                <span className="font-semibold text-neutral-900">¿Cómo funciona el precio por usuario?</span>
                <span className="text-emerald-600 group-open:rotate-45 transition-transform text-xl leading-none">+</span>
              </summary>
              <div className="px-5 pb-5 text-neutral-600 text-[15px] leading-relaxed">El plan Pro incluye hasta 3 usuarios base. Cada usuario adicional tiene un precio preferencial según el periodo elegido (anual o mes a mes).</div>
            </details>
            <details className="group bg-neutral-50 rounded-2xl border border-black/5 overflow-hidden">
              <summary className="flex items-center justify-between cursor-pointer p-5 text-left">
                <span className="font-semibold text-neutral-900">¿Puedo agregar más de 3 usuarios?</span>
                <span className="text-emerald-600 group-open:rotate-45 transition-transform text-xl leading-none">+</span>
              </summary>
              <div className="px-5 pb-5 text-neutral-600 text-[15px] leading-relaxed">Sí. Puedes agregar usuarios adicionales con precio preferencial: $2.500 c/u (plan anual) o $3.000 c/u (plan mes a mes). IVA incluido.</div>
            </details>
            <details className="group bg-neutral-50 rounded-2xl border border-black/5 overflow-hidden">
              <summary className="flex items-center justify-between cursor-pointer p-5 text-left">
                <span className="font-semibold text-neutral-900">¿Qué diferencia hay entre pago anual y mes a mes?</span>
                <span className="text-emerald-600 group-open:rotate-45 transition-transform text-xl leading-none">+</span>
              </summary>
              <div className="px-5 pb-5 text-neutral-600 text-[15px] leading-relaxed">El plan anual tiene un mejor precio por usuario ($3.300 vs $4.000) y se factura una vez al año. El plan mes a mes te da flexibilidad sin contrato, con un valor ligeramente mayor.</div>
            </details>
            <details className="group bg-neutral-50 rounded-2xl border border-black/5 overflow-hidden">
              <summary className="flex items-center justify-between cursor-pointer p-5 text-left">
                <span className="font-semibold text-neutral-900">¿Qué tecnología de OCR usan?</span>
                <span className="text-emerald-600 group-open:rotate-45 transition-transform text-xl leading-none">+</span>
              </summary>
              <div className="px-5 pb-5 text-neutral-600 text-[15px] leading-relaxed">Usamos OCR con Google AI, una de las tecnologías de reconocimiento de texto más confiables del mercado, optimizada para boletas chilenas.</div>
            </details>
          </div>
        </div>
      </section>

      {/* ===== CIERRE ===== */}
      <section className="py-24 lg:py-28 bg-neutral-950 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <Image src="/images/cierre_cta.webp" alt="Boleta respaldada digitalmente con GastosNX" fill className="object-cover" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="relative hidden lg:block">
              <div className="relative w-full h-105 rounded-[28px] overflow-hidden shadow-2xl shadow-black/40 ring-1 ring-white/10">
                <Image src="/images/para_pymes.webp" alt="Dueño de pyme chilena con control de gastos en su celular" fill className="object-cover" />
              </div>
            </div>
            <div className="text-center lg:text-left">
              <h2 className="text-3xl lg:text-5xl font-bold text-white mb-6 tracking-tight">Llega a tu contador con todo. Paga solo lo que te corresponde.</h2>
              <p className="text-lg text-neutral-400 mb-10 leading-relaxed">Cada gasto que registras hoy puede volver mañana como ahorro real en tu declaración. GastosNX es la herramienta que conecta tu operación con tu contador — para que ningún gasto válido quede fuera de tu renta.</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start items-center">
                <button onClick={() => router.push('/registro/free')} className="px-8 py-3.5 bg-white text-neutral-900 text-base font-semibold rounded-full hover:bg-neutral-100 transition-all inline-flex items-center gap-2">Comenzar ahora <ArrowRight className="w-4 h-4" /></button>
                <button onClick={() => router.push('/registro')} className="px-8 py-3.5 bg-transparent text-white text-base font-semibold rounded-full border border-white/25 hover:border-white/50 transition-all">Ver Planes</button>
              </div>
              <p className="text-sm text-neutral-500 mt-8">⏱️ Recibirás tus accesos en máximo 24 hrs hábiles</p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== PARA CONTADORES ===== */}
      <section id="para-contadores" className="py-24 lg:py-28 bg-gradient-to-br from-slate-50 to-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-emerald-50 border border-emerald-200/60 text-emerald-700 rounded-full text-[13px] font-medium mb-6">
                <Briefcase className="w-3 h-3" />
                Para contadores
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900 mb-5 tracking-tight">Recibe los gastos de tus clientes ya ordenados.</h2>
              <p className="text-lg text-neutral-500 leading-relaxed mb-8">GastosNX te entrega la información de tus clientes lista para revisar. Sin Excel, sin correos con fotos, sin perseguir boletas. Solo un export limpio al cierre de cada mes.</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-3 text-neutral-700"><Check className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" /><span><strong>Menos horas de revisión:</strong> todo llega categorizado y con fecha.</span></li>
                <li className="flex items-start gap-3 text-neutral-700"><Check className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" /><span><strong>Respaldo trazable:</strong> cada boleta con su imagen original disponible.</span></li>
                <li className="flex items-start gap-3 text-neutral-700"><Check className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" /><span><strong>Exportación directa:</strong> CSV o Excel, listo para tu software contable.</span></li>
                <li className="flex items-start gap-3 text-neutral-700"><Check className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" /><span><strong>Cero costo para el contador:</strong> tu cliente paga, tú recibes.</span></li>
              </ul>
              <div className="flex flex-col sm:flex-row gap-3">
                <a href="mailto:gastos@nxchile.com?subject=Solicito%20acceso%20demo%20contador" className="px-6 py-3.5 bg-neutral-900 text-white text-[15px] font-semibold rounded-full hover:bg-neutral-700 transition-colors inline-flex items-center justify-center gap-2">
                  <Users className="w-4 h-4" />
                  Solicitar acceso demo contador
                </a>
                <a href="mailto:gastos@nxchile.com?subject=Quiero%20recomendar%20GastosNX" className="px-6 py-3.5 bg-white text-neutral-700 text-[15px] font-semibold rounded-full border border-neutral-200 hover:border-neutral-300 transition-all inline-flex items-center justify-center gap-2">
                  Quiero recomendar GastosNX
                </a>
              </div>
            </div>
            <div className="relative">
              <div className="bg-white rounded-3xl p-8 shadow-2xl shadow-black/10 ring-1 ring-black/5">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-neutral-100">
                  <Building2 className="w-8 h-8 text-emerald-600" />
                  <div>
                    <p className="font-semibold text-neutral-900">Panel del contador</p>
                    <p className="text-xs text-neutral-500">Recepción de gastos</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 font-bold text-sm">AC</div>
                      <div>
                        <p className="text-sm font-semibold text-neutral-900">AC Constructores</p>
                        <p className="text-xs text-neutral-500">47 boletas · Agosto</p>
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-emerald-700 bg-white px-2.5 py-1 rounded-full">Listo</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold text-sm">RC</div>
                      <div>
                        <p className="text-sm font-semibold text-neutral-900">RCC Servicios</p>
                        <p className="text-xs text-neutral-500">23 boletas · Agosto</p>
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-neutral-600 bg-white px-2.5 py-1 rounded-full">Listo</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-700 font-bold text-sm">TS</div>
                      <div>
                        <p className="text-sm font-semibold text-neutral-900">Transportes San Andrés</p>
                        <p className="text-xs text-neutral-500">12 boletas · Agosto</p>
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-neutral-600 bg-white px-2.5 py-1 rounded-full">Listo</span>
                  </div>
                </div>
                <div className="mt-6 pt-4 border-t border-neutral-100 text-center">
                  <p className="text-xs text-neutral-500">Ejemplo visual · Vista previa del panel</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== INSTAGRAM (Opción D: link + grid placeholder) ===== */}
      <section id="instagram" className="py-20 lg:py-24 bg-white border-t border-black/5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-neutral-100 border border-neutral-200 text-neutral-700 rounded-full text-[13px] font-medium mb-4">
              Síguenos en Instagram
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900 mb-3 tracking-tight">@nx_chile en Instagram</h2>
            <p className="text-lg text-neutral-500 max-w-2xl mx-auto">Tips sobre respaldo de gastos, novedades del producto y casos de clientes reales.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
            <a href="https://www.instagram.com/nx_chile" target="_blank" rel="noopener noreferrer" className="group relative aspect-square rounded-2xl overflow-hidden border border-black/5 hover:shadow-lg transition-all">
              <Image src="/images/instagram/post-1.jpeg" alt="Publicación GastosNX en Instagram" fill className="object-cover group-hover:scale-105 transition-transform" />
              <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/70 to-transparent text-white text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                Ver en Instagram
              </div>
            </a>
            <a href="https://www.instagram.com/nx_chile" target="_blank" rel="noopener noreferrer" className="group relative aspect-square rounded-2xl overflow-hidden border border-black/5 hover:shadow-lg transition-all">
              <Image src="/images/instagram/post-2.jpeg" alt="Publicación GastosNX en Instagram" fill className="object-cover group-hover:scale-105 transition-transform" />
              <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/70 to-transparent text-white text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                Ver en Instagram
              </div>
            </a>
            <a href="https://www.instagram.com/nx_chile" target="_blank" rel="noopener noreferrer" className="group relative aspect-square rounded-2xl overflow-hidden border border-black/5 hover:shadow-lg transition-all">
              <Image src="/images/instagram/post-3.jpeg" alt="Publicación GastosNX en Instagram" fill className="object-cover group-hover:scale-105 transition-transform" />
              <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/70 to-transparent text-white text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                Ver en Instagram
              </div>
            </a>
            <a href="https://www.instagram.com/nx_chile" target="_blank" rel="noopener noreferrer" className="group relative aspect-square rounded-2xl overflow-hidden border border-black/5 hover:shadow-lg transition-all">
              <Image src="/images/instagram/post-4.jpeg" alt="Publicación GastosNX en Instagram" fill className="object-cover group-hover:scale-105 transition-transform" />
              <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/70 to-transparent text-white text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                Ver en Instagram
              </div>
            </a>
          </div>
          <div className="text-center">
            <a href="https://www.instagram.com/nx_chile" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white text-sm font-semibold rounded-full hover:opacity-90 transition-opacity">
              Ver @nx_chile en Instagram →
            </a>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="bg-neutral-950 text-neutral-400 py-16 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-10 mb-10">
            <div>
              <div className="flex items-center gap-3 mb-5">
                <Image
                  src="/images/LogogastosNX.png"
                  alt="Logotipo GastosNX"
                  width={693}
                  height={138}
                  className="h-11 w-auto object-contain brightness-0 invert"
                />
              </div>
              <p className="text-sm leading-relaxed text-neutral-500">GastosNX es el sistema que usan pymes y contadores en Chile para registrar, respaldar y descontar gastos operacionales menores en la Declaración de Renta anual. Compatible con los requisitos del SII. Desarrollado en Chile para la realidad tributaria chilena.</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4 text-sm">Producto</h4>
              <ul className="space-y-2.5 text-sm">
                <li><button onClick={() => router.push('/registro')} className="hover:text-white transition-colors">Planes y precios</button></li>
                <li><button onClick={() => router.push('/registro/free')} className="hover:text-white transition-colors">Prueba gratuita</button></li>
                <li><button onClick={() => router.push('/manual')} className="hover:text-white transition-colors">Manual de Uso</button></li>
                <li><button onClick={() => document.getElementById('como-funciona')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-white transition-colors">Cómo funciona</button></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4 text-sm">Empresa</h4>
              <ul className="space-y-2.5 text-sm">
                <li><a href="mailto:gastos@nxchile.com" className="hover:text-white transition-colors">gastos@nxchile.com</a></li>
                <li><button onClick={() => router.push('/login')} className="hover:text-white transition-colors">Iniciar Sesión</button></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-white/10 text-center text-sm">
            <p className="mb-2 text-neutral-500">GastosNX no reemplaza al contador ni determina deducibilidad tributaria. Su objetivo es ayudarte a mantener respaldo y orden documental.</p>
            <p className="text-neutral-500">© 2026 GastosNX by NXChile. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>

      {/* ===== STICKY CTA MOBILE ===== */}
      {showStickyCTA && (
        <div className="fixed bottom-0 inset-x-0 z-40 md:hidden bg-white/95 backdrop-blur-xl border-t border-black/10 shadow-2xl shadow-black/10 p-3 flex gap-2">
          <button onClick={() => router.push('/registro/free')} className="flex-1 px-4 py-3 bg-emerald-600 text-white text-sm font-semibold rounded-full hover:bg-emerald-700 transition-colors">
            Probar gratis
          </button>
          <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="px-4 py-3 bg-[#25D366] text-white text-sm font-semibold rounded-full hover:bg-[#1DA851] transition-colors inline-flex items-center justify-center">
            <MessageCircle className="w-5 h-5" />
          </a>
        </div>
      )}

      {/* ===== WHATSAPP FLOTANTE (Desktop + Mobile) ===== */}
      {showWhatsApp && (
        <a
          href={whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Contactar por WhatsApp"
          className="hidden md:flex fixed bottom-6 right-6 z-50 w-14 h-14 bg-[#25D366] hover:bg-[#1DA851] text-white rounded-full shadow-2xl shadow-emerald-500/30 items-center justify-center transition-all hover:scale-110 group"
        >
          <MessageCircle className="w-7 h-7" />
          <span className="absolute right-full mr-3 px-3 py-1.5 bg-neutral-900 text-white text-xs font-medium rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            ¿Dudas? Escríbenos
          </span>
        </a>
      )}
    </main>
  )
}