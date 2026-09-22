'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowRight, Check, ChevronDown, FileText, Layers, MessageCircle,
  Receipt, Wallet, Users, Building2, CircleDollarSign,
  ClipboardCheck, BookOpen,
} from 'lucide-react'

const PLANS = [
  {
    name: 'RindeNX Pyme',
    tag: 'PARA COMENZAR',
    rendidores: 'Hasta 5 rendidores',
    annual: 9900,
    annualTotal: 118800,
    monthly: 12900,
    description: 'Controla fondos, gastos, respaldos, aprobaciones y saldos.',
    features: [
      'Fondos por rendir',
      'Registro de gastos',
      'Carga de respaldos',
      'OCR de documentos',
      'Revisión de rendiciones',
      'Aprobación y rechazo',
      'Control de saldos',
      'Historial de rendiciones',
      'Panel de administración',
      'Exportación de información',
      'Información para proceso contable',
    ],
    cta: 'SOLICITAR DEMOSTRACIÓN',
    highlighted: true,
  },
  {
    name: 'RindeNX Empresa',
    tag: '',
    rendidores: 'Hasta 15 rendidores',
    annual: 19900,
    annualTotal: 238800,
    monthly: 24900,
    description: 'Control centralizado para equipos con varios rendidores.',
    features: [
      'Todo lo de Pyme',
      'Hasta 15 rendidores',
      'Mayor volumen de operaciones',
      'Administración centralizada',
      'Control consolidado de rendiciones',
    ],
    cta: 'SOLICITAR DEMOSTRACIÓN',
    highlighted: false,
  },
  {
    name: 'RindeNX Pro',
    tag: '',
    rendidores: 'Hasta 30 rendidores',
    annual: 34900,
    annualTotal: 418800,
    monthly: 44900,
    description: 'Para empresas con alto volumen de operaciones.',
    features: [
      'Todo lo de Empresa',
      'Hasta 30 rendidores',
      'Mayor capacidad operacional',
      'Gestión centralizada de mayor volumen',
    ],
    cta: 'SOLICITAR DEMOSTRACIÓN',
    highlighted: false,
  },
  {
    name: 'RindeNX +30',
    tag: '',
    rendidores: 'Más de 30 rendidores',
    annual: 0,
    annualTotal: 0,
    monthly: 0,
    description: 'Configuración a medida para necesidades específicas.',
    features: [
      'Más de 30 rendidores',
      'Configuración a medida',
      'Soporte dedicado',
    ],
    cta: 'HABLAR CON UN ASESOR',
    highlighted: false,
    custom: true,
  },
]

const FAQ = [
  {
    q: '¿Cuánto cuesta RindeNX?',
    a: 'RindeNX comienza en $9.900 mensuales con pago anual y hasta 5 rendidores incluidos. Para quienes prefieren pagar mes a mes, el plan Pyme tiene un valor de $12.900 mensuales.',
  },
  {
    q: '¿Cuál es la diferencia entre pagar mensual y anual?',
    a: 'El pago anual permite acceder al precio preferente de cada plan. El pago mensual ofrece mayor flexibilidad de pago con una tarifa mensual superior.',
  },
  {
    q: '¿Qué es un rendidor?',
    a: 'Es una persona que recibe fondos de la empresa y posteriormente debe registrar y rendir los gastos realizados.',
  },
  {
    q: '¿RindeNX sirve para controlar fondos por rendir?',
    a: 'Sí. RindeNX permite registrar fondos entregados, asociar gastos y respaldos, revisar la rendición y controlar los saldos pendientes.',
  },
  {
    q: '¿RindeNX permite subir boletas y facturas?',
    a: 'Sí. Los documentos pueden asociarse a los gastos registrados y RindeNX incorpora OCR para facilitar la captura de información.',
  },
  {
    q: '¿RindeNX reemplaza el sistema contable?',
    a: 'No. RindeNX está orientado al control y gestión de fondos y rendiciones. La información puede prepararse para facilitar el proceso contable.',
  },
  {
    q: '¿Puedo utilizar RindeNX con pocos trabajadores?',
    a: 'Sí. El plan Pyme permite comenzar con hasta 5 rendidores.',
  },
  {
    q: '¿Puedo aumentar la cantidad de rendidores?',
    a: 'Sí. RindeNX cuenta con planes para empresas con mayor cantidad de rendidores.',
  },
  {
    q: '¿RindeNX se integra con GastosNX?',
    a: 'Sí. Los gastos asociados a las rendiciones pueden continuar su flujo hacia GastosNX para mantener y organizar sus respaldos y antecedentes.',
  },
]

const SECTORS = [
  'Construcción', 'Transporte', 'Agricultura', 'Servicios', 'Equipos en terreno', 'Ventas',
]

export default function PreciosClient() {
  const router = useRouter()
  const [annual, setAnnual] = useState(true)
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const whatsappMessage = encodeURIComponent('Hola, vengo de rinde.nxchile.com/precios y quiero solicitar una demostración de RindeNX.')
  const whatsappLink = `https://wa.me/56977412178?text=${whatsappMessage}`
  const whatsappAsesor = encodeURIComponent('Hola, vengo de rinde.nxchile.com/precios y necesito cotizar RindeNX para más de 30 rendidores.')
  const whatsappAsesorLink = `https://wa.me/56977412178?text=${whatsappAsesor}`

  const handleBillingToggle = (isAnnual: boolean) => {
    setAnnual(isAnnual)
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const w = window as any
      if (w.gtag) {
        w.gtag('event', 'BillingToggle', { billing_type: isAnnual ? 'annual' : 'monthly' })
      }
    } catch {}
  }

  const handlePlanClick = (planName: string) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const w = window as any
      if (w.gtag) {
        w.gtag('event', 'PlanClick', { plan_name: planName })
      }
    } catch {}
  }

  return (
    <main className="min-h-screen bg-white text-neutral-900 antialiased">
      {/* ===== NAVBAR ===== */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-white/85 backdrop-blur-xl border-b border-black/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-tr from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-md shadow-amber-500/20">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight text-neutral-900">
                Rinde<span className="text-amber-600">NX</span>
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => router.push('/rinde-landing')} className="px-5 py-2.5 text-sm font-medium text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100 rounded-full transition-colors">Inicio</button>
              <a href="https://gastos.nxchile.com" target="_blank" rel="noopener noreferrer" className="hidden sm:inline-flex ml-2 px-5 py-2.5 bg-neutral-900 text-white text-sm font-semibold rounded-full hover:bg-neutral-700 transition-colors">
                GastosNX →
              </a>
              <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="ml-2 px-5 py-2.5 bg-amber-500 text-white text-sm font-semibold rounded-full hover:bg-amber-600 transition-colors">
                Solicitar demo
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* ===== HERO ===== */}
      <section className="pt-32 pb-16 lg:pt-44 lg:pb-24 bg-linear-to-b from-white to-amber-50/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-bold text-neutral-900 mb-6 leading-[1.08] tracking-tight max-w-4xl mx-auto">
            Planes RindeNX para controlar fondos y rendiciones de gastos
          </h1>
          <p className="text-lg sm:text-xl text-neutral-500 mb-8 max-w-2xl mx-auto leading-relaxed">
            Controla cada fondo que entregas, cada gasto que se rinde y cada saldo pendiente desde un solo lugar.
          </p>
          <div className="mb-2">
            <span className="text-3xl sm:text-4xl font-bold text-neutral-900">Desde $9.900</span>
            <span className="text-lg text-neutral-500 ml-2">/ mes</span>
          </div>
          <p className="text-sm text-neutral-500 mb-8">Pagando anual.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="px-8 py-3.5 bg-amber-500 text-white text-base font-semibold rounded-full hover:bg-amber-600 transition-all inline-flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20">
              Solicitar demostración <ArrowRight className="w-4 h-4" />
            </a>
            <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="px-8 py-3.5 bg-white text-neutral-700 text-base font-semibold rounded-full border border-neutral-200 hover:border-neutral-300 transition-all inline-flex items-center justify-center gap-2">
              <MessageCircle className="w-4 h-4" /> Hablar por WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* ===== SELECTOR + PLANES ===== */}
      <section id="planes" className="py-16 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Selector */}
          <div className="flex flex-col items-center mb-12">
            <div className="inline-flex items-center bg-neutral-100 rounded-full p-1">
              <button
                onClick={() => handleBillingToggle(false)}
                className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all ${!annual ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-500 hover:text-neutral-700'}`}
              >
                Pago mensual
              </button>
              <button
                onClick={() => handleBillingToggle(true)}
                className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all ${annual ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-500 hover:text-neutral-700'}`}
              >
                Pago anual
              </button>
            </div>
            {annual && (
              <p className="mt-3 text-sm font-medium text-amber-600">Precio preferente con pago anual</p>
            )}
          </div>

          {/* Tarjetas de planes */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {PLANS.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-2xl border p-6 flex flex-col ${
                  plan.highlighted
                    ? 'border-amber-300 bg-amber-50/50 shadow-lg shadow-amber-500/10'
                    : plan.custom
                    ? 'border-neutral-200 bg-neutral-50'
                    : 'border-black/10 bg-white'
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3 left-6 px-3 py-1 bg-amber-500 text-white text-xs font-bold rounded-full">
                    {plan.tag}
                  </div>
                )}
                {!plan.highlighted && plan.tag && (
                  <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-3">{plan.tag}</p>
                )}
                <h3 className="text-lg font-bold text-neutral-900 mb-1">{plan.name}</h3>
                <p className="text-sm text-neutral-500 mb-4">{plan.rendidores}</p>

                {plan.custom ? (
                  <div className="mb-4">
                    <p className="text-2xl font-bold text-neutral-900">Cotizar</p>
                  </div>
                ) : (
                  <div className="mb-4">
                    <p className="text-3xl font-bold text-neutral-900">
                      ${annual ? plan.annual.toLocaleString('es-CL') : plan.monthly.toLocaleString('es-CL')}
                    </p>
                    <p className="text-sm text-neutral-500">
                      / mes {annual ? '· Pago anual' : '· Pago mensual'}
                    </p>
                    {annual && (
                      <p className="text-xs text-neutral-400 mt-1">
                        ${plan.annualTotal.toLocaleString('es-CL')} / año
                      </p>
                    )}
                  </div>
                )}

                <p className="text-sm text-neutral-500 mb-5 leading-relaxed">{plan.description}</p>

                <div className="border-t border-black/5 pt-4 mb-6 flex-1">
                  <ul className="space-y-2">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-neutral-600">
                        <Check className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>

                <a
                  href={plan.custom ? whatsappAsesorLink : whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => handlePlanClick(plan.name)}
                  className={`block text-center px-5 py-3 rounded-xl text-sm font-semibold transition-all ${
                    plan.highlighted
                      ? 'bg-amber-500 text-white hover:bg-amber-600 shadow-md shadow-amber-500/20'
                      : 'bg-neutral-900 text-white hover:bg-neutral-700'
                  }`}
                >
                  {plan.cta}
                </a>
              </div>
            ))}
          </div>

          {/* Explicación */}
          <div className="mt-12 text-center max-w-2xl mx-auto">
            <p className="text-neutral-500 text-sm leading-relaxed">
              Elige cómo pagar. Con el pago anual accedes al precio preferente de RindeNX. Si prefieres comenzar mes a mes, puedes hacerlo con la tarifa mensual correspondiente.
            </p>
          </div>
        </div>
      </section>

      {/* ===== FLUJO: FONDO → CONTABILIDAD ===== */}
      <section className="py-16 lg:py-24 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900 mb-5 tracking-tight">
              No controles solo el gasto. Controla el fondo completo.
            </h2>
            <p className="text-lg text-neutral-500 leading-relaxed">
              Una rendición no comienza cuando alguien sube una boleta. Comienza cuando la empresa entrega un fondo. RindeNX permite seguir ese fondo desde su asignación hasta la rendición, revisión, aprobación, saldo y entrega de información para contabilidad.
            </p>
          </div>
          <div className="max-w-3xl mx-auto">
            <div className="space-y-0">
              {[
                { label: 'Fondo entregado', value: '$200.000', icon: Wallet, color: 'bg-amber-500' },
                { label: 'Gastos', value: '$137.500', icon: Receipt, color: 'bg-amber-500' },
                { label: 'Respaldos', value: '3 documentos', icon: FileText, color: 'bg-amber-500' },
                { label: 'Rendición', value: 'En revisión', icon: ClipboardCheck, color: 'bg-amber-500' },
                { label: 'Saldo', value: '$62.500', icon: CircleDollarSign, color: 'bg-amber-500' },
                { label: 'Contabilidad', value: 'Información lista', icon: BookOpen, color: 'bg-amber-500' },
              ].map((step, i) => (
                <div key={i} className="relative flex items-center gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 ${step.color} rounded-lg flex items-center justify-center`}>
                      <step.icon className="w-5 h-5 text-white" />
                    </div>
                    {i < 5 && <div className="w-0.5 h-8 bg-amber-200" />}
                  </div>
                  <div className="bg-white rounded-xl px-5 py-3 border border-black/5 shadow-sm flex-1 mb-2">
                    <p className="text-sm font-semibold text-neutral-900">{step.label}</p>
                    <p className="text-sm text-neutral-500">{step.value}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-neutral-400 mt-4 text-center">Ejemplo demostrativo</p>
          </div>
        </div>
      </section>

      {/* ===== ESLABÓN: ADMIN → RENDIDOR → CONTABILIDAD ===== */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900 mb-5 tracking-tight">
              El eslabón entre tu fondo y tu contador.
            </h2>
          </div>
          <div className="max-w-3xl mx-auto">
            <div className="space-y-0">
              {[
                { role: 'Administrador', desc: 'Entrega y controla el fondo.', icon: Building2 },
                { role: 'Rendidor', desc: 'Registra gastos y entrega respaldos.', icon: Users },
                { role: 'Contabilidad', desc: 'Recibe información ordenada.', icon: BookOpen },
              ].map((step, i) => (
                <div key={i} className="relative flex items-center gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center">
                      <step.icon className="w-5 h-5 text-white" />
                    </div>
                    {i < 2 && <div className="w-0.5 h-8 bg-amber-200" />}
                  </div>
                  <div className="bg-white rounded-xl px-5 py-3 border border-black/5 shadow-sm flex-1 mb-2">
                    <p className="text-sm font-semibold text-neutral-900">{step.role}</p>
                    <p className="text-sm text-neutral-500">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== SOFTWARE DE RENDICIÓN ===== */}
      <section className="py-16 lg:py-24 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900 mb-5 tracking-tight">
              Software de rendición de gastos para empresas en Chile
            </h2>
            <p className="text-lg text-neutral-500 leading-relaxed mb-4">
              RindeNX es un software de gestión de rendiciones de gastos que permite a las empresas controlar fondos por rendir, registrar gastos, asociar respaldos, revisar rendiciones, aprobar operaciones y mantener un historial centralizado.
            </p>
            <p className="text-lg text-neutral-500 leading-relaxed">
              En lugar de gestionar rendiciones mediante planillas, correos, fotografías o mensajes dispersos, RindeNX concentra la información en un solo sistema. Esto permite que administración, trabajadores y contabilidad trabajen sobre la misma información.
            </p>
          </div>
        </div>
      </section>

      {/* ===== CONTROL DE FONDOS ===== */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900 mb-5 tracking-tight">
              Controla tus fondos por rendir
            </h2>
            <p className="text-lg text-neutral-500 leading-relaxed">
              Cuando una empresa entrega dinero para combustible, viáticos, compras, viajes u otros gastos operacionales, necesita saber cuánto entregó, cuánto se utilizó, qué gastos fueron respaldados y qué saldo permanece pendiente. RindeNX permite mantener ese control desde la entrega del fondo hasta el cierre de la rendición.
            </p>
          </div>
        </div>
      </section>

      {/* ===== RINDENX + GASTOSNX ===== */}
      <section className="py-16 lg:py-24 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 max-w-3xl mx-auto">
            <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900 mb-5 tracking-tight">RindeNX + GastosNX</h2>
          </div>
          <div className="max-w-3xl mx-auto">
            <div className="space-y-0">
              {[
                { name: 'RindeNX', desc: 'Control de fondos y rendiciones', color: 'bg-amber-500', icon: FileText },
                { name: 'GastosNX', desc: 'Organización de gastos y respaldos', color: 'bg-blue-500', icon: Layers },
                { name: 'Contabilidad', desc: 'Información ordenada', color: 'bg-neutral-700', icon: BookOpen },
              ].map((step, i) => (
                <div key={i} className="relative flex items-center gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 ${step.color} rounded-lg flex items-center justify-center`}>
                      <step.icon className="w-5 h-5 text-white" />
                    </div>
                    {i < 2 && <div className="w-0.5 h-8 bg-neutral-200" />}
                  </div>
                  <div className="bg-white rounded-xl px-5 py-3 border border-black/5 shadow-sm flex-1 mb-2">
                    <p className="text-sm font-semibold text-neutral-900">{step.name}</p>
                    <p className="text-sm text-neutral-500">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-sm text-neutral-500 text-center mt-6 leading-relaxed">
              Soluciones independientes que pueden complementarse según las necesidades de tu empresa.
            </p>
            <div className="text-center mt-4">
              <a href="https://gastos.nxchile.com" target="_blank" rel="noopener noreferrer" className="text-amber-600 font-semibold text-sm hover:text-amber-700 transition-colors">
                Conoce GastosNX →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ===== BENEFICIOS ===== */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 max-w-3xl mx-auto">
            <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900 mb-5 tracking-tight">
              Una forma más simple de controlar las rendiciones
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
            {[
              { title: 'Un solo lugar', desc: 'Todas las rendiciones en un sistema centralizado.' },
              { title: 'Menos seguimiento', desc: 'No más correos ni WhatsApp persiguiendo comprobantes.' },
              { title: 'Respaldos asociados', desc: 'Cada gasto con su comprobante digital.' },
              { title: 'Control de saldos', desc: 'Sabes cuánto falta por justificar en cada fondo.' },
              { title: 'Historial', desc: 'Registro completo de cada operación realizada.' },
              { title: 'Revisión y aprobación', desc: 'Flujo claro para administradores.' },
              { title: 'Info para contabilidad', desc: 'Datos estructurados para el proceso contable.' },
              { title: 'OCR integrado', desc: 'Captura de documentos con lectura automática.' },
            ].map((b, i) => (
              <div key={i} className="bg-neutral-50 rounded-xl p-5 border border-black/5">
                <h3 className="text-sm font-bold text-neutral-900 mb-1">{b.title}</h3>
                <p className="text-xs text-neutral-500 leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== PARA QUIÉN ES ===== */}
      <section className="py-16 lg:py-24 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 max-w-3xl mx-auto">
            <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900 mb-5 tracking-tight">
              RindeNX está pensado para empresas que entregan fondos a sus trabajadores
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 max-w-4xl mx-auto">
            {SECTORS.map((s) => (
              <div key={s} className="bg-white rounded-xl p-4 border border-black/5 text-center shadow-sm">
                <p className="text-sm font-semibold text-neutral-900">{s}</p>
              </div>
            ))}
          </div>
          <p className="text-center text-neutral-500 text-sm mt-8 max-w-2xl mx-auto">
            Empresas que necesitan controlar dinero entregado a trabajadores y recuperar sus rendiciones de manera ordenada.
          </p>
        </div>
      </section>

      {/* ===== FAQ ===== */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 max-w-3xl mx-auto">
            <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900 mb-5 tracking-tight">
              Preguntas frecuentes
            </h2>
          </div>
          <div className="max-w-2xl mx-auto space-y-3">
            {FAQ.map((faq, i) => (
              <div key={i} className="border border-black/10 rounded-xl overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left bg-white hover:bg-neutral-50 transition-colors"
                >
                  <span className="text-sm font-semibold text-neutral-900 pr-4">{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-neutral-400 shrink-0 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                </button>
                <div className={`px-5 ${openFaq === i ? 'pb-5' : 'h-0 overflow-hidden'}`}>
                  <p className="text-sm text-neutral-500 leading-relaxed">{faq.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA FINAL ===== */}
      <section className="py-16 lg:py-24 bg-neutral-950 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h2 className="text-3xl lg:text-5xl font-bold text-white mb-5 tracking-tight">
            ¿Quieres dejar de perseguir rendiciones?
          </h2>
          <p className="text-lg text-neutral-400 leading-relaxed max-w-2xl mx-auto mb-10">
            Conoce cómo RindeNX puede adaptarse al flujo de fondos y gastos de tu empresa.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="px-8 py-3.5 bg-amber-500 text-white text-base font-semibold rounded-full hover:bg-amber-600 transition-all inline-flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20">
              Solicitar demostración <ArrowRight className="w-4 h-4" />
            </a>
            <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="px-8 py-3.5 bg-transparent text-white text-base font-semibold rounded-full border border-white/25 hover:border-white/50 transition-all inline-flex items-center justify-center gap-2">
              <MessageCircle className="w-4 h-4" /> Hablar por WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="bg-neutral-950 text-neutral-400 py-12 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-tr from-amber-500 to-orange-600 rounded-lg flex items-center justify-center">
                <FileText className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-bold text-white">Rinde<span className="text-amber-500">NX</span></span>
            </div>
            <div className="flex items-center gap-6 text-sm">
              <button onClick={() => router.push('/rinde-landing')} className="hover:text-white transition-colors">Inicio</button>
              <a href="https://gastos.nxchile.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">GastosNX</a>
              <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Contacto</a>
            </div>
            <p className="text-xs text-neutral-500">© 2026 RindeNX by NXChile</p>
          </div>
        </div>
      </footer>

      {/* ===== WHATSAPP FLOTANTE ===== */}
      <a
        href={whatsappLink}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Contactar por WhatsApp"
        className="hidden md:flex fixed bottom-6 right-6 z-50 w-14 h-14 bg-[#25D366] hover:bg-[#1DA851] text-white rounded-full shadow-2xl shadow-black/20 items-center justify-center transition-all hover:scale-110 group"
      >
        <MessageCircle className="w-7 h-7" />
        <span className="absolute right-full mr-3 px-3 py-1.5 bg-neutral-900 text-white text-xs font-medium rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          ¿Dudas? Escríbenos
        </span>
      </a>
    </main>
  )
}
