'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Check, Shield, ArrowRight, Lock, Clock, Camera, FileText, MessageCircle, X, Play, Building2, Calculator, Briefcase, Users, ChevronRight, Receipt, Car, Fuel, ShoppingCart, Coffee, Package, Wallet, TrendingUp, Calendar, BarChart3, ArrowDown, ArrowDownRight, SplitSquareVertical } from 'lucide-react'
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

      {/* ===== 1. HERO ===== */}
      <section className="relative pt-32 pb-20 lg:pt-44 lg:pb-32 bg-linear-to-b from-white to-neutral-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <div className="text-center lg:text-left flex flex-col items-center lg:items-start">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-emerald-50 border border-emerald-200/60 text-emerald-700 rounded-full text-[13px] font-medium mb-8">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Producto de NXChile · Tecnología operacional
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-[64px] font-bold text-neutral-900 mb-6 leading-[1.05] tracking-tight">
                ¿Dónde quedan los gastos que no son factura?
              </h1>
              <p className="text-lg sm:text-xl text-neutral-500 mb-10 max-w-xl leading-relaxed">
                Peajes, estacionamientos, colaciones, vouchers. Gastos reales que tu empresa hace todos los días. GastosNX los registra, respalda y ordena para que nunca más se pierdan.
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
            <div className="relative hidden lg:block">
              <div className="relative w-full h-110 lg:h-140 rounded-[28px] overflow-hidden shadow-2xl shadow-black/10 ring-1 ring-black/5">
                <Image src="/images/hero_principal.webp" alt="Usuario fotografiando una boleta con GastosNX antes de que se pierda" fill className="object-cover" priority />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== PRUEBA SOCIAL ===== */}
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

      {/* ===== 2. PROBLEMA ===== */}
      <section className="py-24 lg:py-28 bg-neutral-950 text-white relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold mb-6 tracking-tight">El gasto ocurrió.<br />¿Pero quedó registrado?</h2>
            <p className="text-lg text-neutral-400 max-w-2xl mx-auto leading-relaxed">
              El peaje de $8.500. La boleta del almuerzo. El voucher del estacionamiento. Son gastos reales. Pero si no quedan registrados con su respaldo, para efectos prácticos no existen.
            </p>
          </div>

          {/* Flujo del problema */}
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <p className="text-xs font-semibold text-red-400 uppercase tracking-wider mb-4">Lo que pasa hoy</p>
              <div className="space-y-3">
                {['Gasto ocurre', 'Foto por WhatsApp', 'Papel en el bolsillo', 'Correo al final del mes', 'Excel desordenado', 'Documento perdido', 'Reconstrucción al cierre'].map((step, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-red-500/20 text-red-400 text-xs font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                    <span className="text-neutral-300 text-sm">{step}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6">
              <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-4">Lo que debería pasar</p>
              <div className="space-y-3">
                {['Gasto ocurre', 'Fotografía el documento', 'GastosNX registra', 'Datos + imagen guardados', 'Historial ordenado', 'Revisión cuando necesites', 'Exportación lista'].map((step, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                    <span className="text-neutral-300 text-sm">{step}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== 3. EXPLICACIÓN SIMPLE ===== */}
      <section className="py-20 lg:py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900 mb-6 tracking-tight">Todo gasto cuenta.</h2>
          <p className="text-lg text-neutral-500 leading-relaxed max-w-2xl mx-auto">
            GastosNX no es una carpeta de imágenes. Es un sistema que vincula <strong className="text-neutral-900">los datos del gasto</strong> con <strong className="text-neutral-900">el documento que lo respalda</strong>, y los mantiene ordenados para cuando tu contador los necesite.
          </p>
        </div>
      </section>

      {/* ===== 4. FLUJO PRINCIPAL ===== */}
      <section id="como-funciona" className="py-24 lg:py-28 bg-neutral-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold text-neutral-900 mb-5 tracking-tight">Así funciona GastosNX.</h2>
            <p className="text-lg text-neutral-500 leading-relaxed max-w-2xl mx-auto">Cada gasto sigue un camino claro: desde que ocurre hasta que queda listo para revisión y exportación.</p>
          </div>

          {/* Flujo visual central */}
          <div className="relative max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {[
                { icon: <ShoppingCart className="w-6 h-6" />, title: 'Gasto ocurre', desc: 'Peaje, boleta, voucher, estacionamiento', color: 'bg-amber-50 border-amber-200 text-amber-700' },
                { icon: <Camera className="w-6 h-6" />, title: 'Captura documento', desc: 'Fotografía o upload del respaldo', color: 'bg-blue-50 border-blue-200 text-blue-700' },
                { icon: <FileText className="w-6 h-6" />, title: 'GastosNX registra', desc: 'OCR lee fecha, monto, proveedor', color: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
                { icon: <Shield className="w-6 h-6" />, title: 'Documento respaldado', desc: 'Datos + imagen vinculados', color: 'bg-violet-50 border-violet-200 text-violet-700' },
                { icon: <BarChart3 className="w-6 h-6" />, title: 'Historial listo', desc: 'Ordenado para revisión y exportación', color: 'bg-neutral-100 border-neutral-200 text-neutral-700' },
              ].map((step, i) => (
                <div key={i} className="relative">
                  <div className={`${step.color} border rounded-2xl p-5 text-center h-full`}>
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-white/80 mb-3">{step.icon}</div>
                    <h3 className="text-sm font-bold mb-1">{step.title}</h3>
                    <p className="text-xs opacity-70 leading-relaxed">{step.desc}</p>
                  </div>
                  {i < 4 && (
                    <div className="hidden lg:flex absolute top-1/2 -right-3 -translate-y-1/2 z-10">
                      <ChevronRight className="w-5 h-5 text-neutral-300" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== 5. EJEMPLO REAL ===== */}
      <section className="py-24 lg:py-28 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900 mb-4 tracking-tight">Un gasto real, recorriendo todo el sistema.</h2>
            <p className="text-lg text-neutral-500">Así se ve cuando un trabajador registra un peaje de $8.500.</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 items-start">
            {/* Lado izquierdo: el gasto */}
            <div className="bg-neutral-50 rounded-3xl p-8 border border-black/5">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                  <Car className="w-6 h-6 text-amber-700" />
                </div>
                <div>
                  <p className="font-bold text-neutral-900">Peaje Ruta 68</p>
                  <p className="text-sm text-neutral-500">15/09/2026 · Trabajador: Juan Pérez</p>
                </div>
              </div>
              <div className="bg-white rounded-2xl p-6 border border-black/5 mb-4">
                <p className="text-4xl font-bold text-neutral-900 mb-1">$8.500</p>
                <p className="text-sm text-neutral-500">Peaje · Voucher impreso</p>
              </div>
              <div className="flex items-center gap-2 text-sm text-neutral-500">
                <Camera className="w-4 h-4" />
                <span>Juan fotografía el voucher en el momento</span>
              </div>
            </div>

            {/* Lado derecho: qué captura GastosNX */}
            <div className="space-y-4">
              <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">GastosNX captura automáticamente</p>
              {[
                { label: 'Fecha', value: '15/09/2026', icon: <Calendar className="w-4 h-4" /> },
                { label: 'Monto', value: '$8.500', icon: <Wallet className="w-4 h-4" /> },
                { label: 'Tipo de gasto', value: 'Peaje', icon: <Car className="w-4 h-4" /> },
                { label: 'Documento', value: 'Voucher #45892', icon: <FileText className="w-4 h-4" /> },
                { label: 'Usuario', value: 'Juan Pérez', icon: <Users className="w-4 h-4" /> },
                { label: 'Estado', value: 'Respaldado', icon: <Shield className="w-4 h-4" /> },
              ].map((field, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl border border-black/5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-700">{field.icon}</div>
                    <span className="text-sm text-neutral-600">{field.label}</span>
                  </div>
                  <span className="text-sm font-semibold text-neutral-900">{field.value}</span>
                </div>
              ))}
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200/60">
                <p className="text-sm text-emerald-700 font-medium">El voucher queda asociado al registro. El gasto queda en el historial. Administración puede consultar quién gastó, cuánto, cuándo, en qué y con qué respaldo.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== 6. ANTES VS DESPUÉS ===== */}
      <section className="py-24 lg:py-28 bg-neutral-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900 mb-4 tracking-tight">El gasto ya ocurrió.<br />El problema es lo que pasa después.</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-3xl p-8 border border-black/5">
              <p className="text-xs font-semibold text-red-500 uppercase tracking-wider mb-6">Sin sistema</p>
              <div className="space-y-3">
                {[
                  'Gasto ocurre',
                  'Foto por WhatsApp',
                  'Papel en el bolsillo',
                  'Correo al final del mes',
                  'Excel desordenado',
                  'Documento perdido',
                  'Reconstrucción al cierre',
                ].map((step, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-red-50 rounded-xl">
                    <span className="w-6 h-6 rounded-full bg-red-100 text-red-600 text-xs font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                    <span className="text-sm text-neutral-700">{step}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-emerald-50 rounded-3xl p-8 border border-emerald-200/60">
              <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-6">Con GastosNX</p>
              <div className="space-y-3">
                {[
                  'Gasto ocurre',
                  'Fotografía el documento',
                  'GastosNX registra',
                  'Datos + imagen guardados',
                  'Historial ordenado',
                  'Revisión cuando necesites',
                  'Exportación lista',
                ].map((step, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-emerald-200/40">
                    <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                    <span className="text-sm text-neutral-700">{step}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== 7. DASHBOARD / PRODUCTO REAL ===== */}
      <section className="py-24 lg:py-28 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900 mb-4 tracking-tight">Así se ve tu información.</h2>
            <p className="text-lg text-neutral-500">No ilustraciones. La interfaz real con datos reales.</p>
          </div>

          {/* Mockup del dashboard */}
          <div className="bg-neutral-950 rounded-3xl p-6 lg:p-8 shadow-2xl shadow-black/20 ring-1 ring-white/10 max-w-5xl mx-auto">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="ml-3 text-xs text-neutral-500 font-mono">GastosNX — Dashboard</span>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
              {[
                { label: 'Total del mes', value: '$1.245.800', accent: true },
                { label: 'Documentos', value: '47', accent: false },
                { label: 'Sin observaciones', value: '43', accent: false },
                { label: 'Pendientes', value: '4', accent: false },
              ].map((stat, i) => (
                <div key={i} className={`rounded-xl p-4 ${stat.accent ? 'bg-emerald-500/15 border border-emerald-500/30' : 'bg-white/5 border border-white/10'}`}>
                  <p className="text-xs text-neutral-400 mb-1">{stat.label}</p>
                  <p className={`text-xl font-bold ${stat.accent ? 'text-emerald-400' : 'text-white'}`}>{stat.value}</p>
                </div>
              ))}
            </div>

            {/* Desglose */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-5 mb-6">
              <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-4">Desglose por categoría</p>
              <div className="space-y-2.5">
                {[
                  { cat: 'Boletas', monto: '$420.000', pct: 34 },
                  { cat: 'Peajes', monto: '$240.800', pct: 19 },
                  { cat: 'Otros', monto: '$305.000', pct: 24 },
                  { cat: 'Vouchers', monto: '$185.000', pct: 15 },
                  { cat: 'Estacionamientos', monto: '$95.000', pct: 8 },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <span className="text-sm text-neutral-300 w-32 shrink-0">{item.cat}</span>
                    <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${item.pct}%` }} />
                    </div>
                    <span className="text-sm font-mono text-neutral-400 w-20 text-right">{item.monto}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Registros recientes */}
            <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
              <div className="p-4 border-b border-white/10">
                <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Registros recientes</p>
              </div>
              <div className="divide-y divide-white/5">
                {[
                  { fecha: '15/09', desc: 'Peaje Ruta 68', monto: '$8.500', tipo: 'Peaje', user: 'Juan P.' },
                  { fecha: '15/09', desc: 'Almuerzo clientes', monto: '$32.500', tipo: 'Boleta', user: 'María S.' },
                  { fecha: '14/09', desc: 'Estacionamiento Centro', monto: '$6.000', tipo: 'Voucher', user: 'Carlos R.' },
                  { fecha: '14/09', desc: 'Materiales ferretería', monto: '$18.200', tipo: 'Boleta', user: 'Ana L.' },
                  { fecha: '13/09', desc: 'Combustible', monto: '$52.000', tipo: 'Voucher', user: 'Pedro M.' },
                ].map((g, i) => (
                  <div key={i} className="flex items-center justify-between px-4 py-3 hover:bg-white/5 transition-colors">
                    <div className="flex items-center gap-4">
                      <span className="text-xs text-neutral-500 font-mono w-12">{g.fecha}</span>
                      <div>
                        <p className="text-sm text-neutral-200">{g.desc}</p>
                        <p className="text-xs text-neutral-500">{g.tipo} · {g.user}</p>
                      </div>
                    </div>
                    <span className="text-sm font-mono text-neutral-300">{g.monto}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== 8. QUÉ PUEDES REGISTRAR ===== */}
      <section className="py-24 lg:py-28 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900 mb-4 tracking-tight">¿Qué puedes registrar?</h2>
            <p className="text-lg text-neutral-500 max-w-2xl mx-auto">Gastos operacionales que necesites registrar y respaldar, especialmente aquellos que no siguen el flujo de una factura.<br />La clasificación y tratamiento tributario corresponden a cada empresa y su asesoría contable.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {[
              { icon: <Receipt className="w-6 h-6" />, name: 'Boletas', desc: 'Compras menores del día a día' },
              { icon: <FileText className="w-6 h-6" />, name: 'Vouchers', desc: 'Tickets de tarjeta y otros' },
              { icon: <Car className="w-6 h-6" />, name: 'Peajes', desc: 'Peajes de ruta y autopista' },
              { icon: <Fuel className="w-6 h-6" />, name: 'Estacionamientos', desc: 'Tickets de parking' },
              { icon: <ShoppingCart className="w-6 h-6" />, name: 'Compras menores', desc: 'Materiales, insumos, urgentes' },
              { icon: <Coffee className="w-6 h-6" />, name: 'Alimentación', desc: 'Colaciones y reuniones' },
              { icon: <Package className="w-6 h-6" />, name: 'Gastos de terreno', desc: 'Operaciones fuera de la oficina' },
              { icon: <TrendingUp className="w-6 h-6" />, name: 'Otros gastos', desc: 'Cualquier gasto operacional' },
            ].map((item, i) => (
              <div key={i} className="bg-white rounded-2xl p-5 border border-black/5 text-center hover:border-emerald-300 transition-colors">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-neutral-100 rounded-xl text-neutral-700 mb-3">{item.icon}</div>
                <h3 className="text-sm font-bold text-neutral-900 mb-1">{item.name}</h3>
                <p className="text-xs text-neutral-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 9. FLUJO MENSUAL ===== */}
      <section className="py-24 lg:py-28 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900 mb-4 tracking-tight">Registra cuando ocurre. No al cierre del año.</h2>
            <p className="text-lg text-neutral-500">Cada gasto registrado a tiempo es un gasto que no tendrás que reconstruir después.</p>
          </div>

          {/* Timeline mensual */}
          <div className="relative max-w-3xl mx-auto">
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-neutral-200 hidden md:block" />
            <div className="space-y-6">
              {[
                { dia: 'Día 1', gasto: 'Peaje $8.500', accion: 'Registro + respaldo' },
                { dia: 'Día 7', gasto: 'Almuerzo clientes $28.000', accion: 'Registro + respaldo' },
                { dia: 'Día 15', gasto: 'Materiales $45.000', accion: 'Registro + respaldo' },
                { dia: 'Día 22', gasto: 'Estacionamiento $6.000', accion: 'Registro + respaldo' },
                { dia: 'Día 30', gasto: '47 gastos acumulados', accion: 'Historial ordenado → Revisión → Exportación' },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-4 md:gap-8">
                  <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center shrink-0 relative z-10">
                    <span className="text-xs font-bold text-emerald-700">{item.dia.split(' ')[1]}</span>
                  </div>
                  <div className="bg-neutral-50 rounded-xl p-4 border border-black/5 flex-1">
                    <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1">{item.dia}</p>
                    <p className="text-sm font-semibold text-neutral-900 mb-0.5">{item.gasto}</p>
                    <p className="text-xs text-emerald-700">{item.accion}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="text-center mt-12">
            <p className="text-lg font-semibold text-neutral-900">No esperes al cierre del año para reconstruir tus gastos.<br />Regístralos cuando ocurren.</p>
          </div>
        </div>
      </section>

      {/* ===== 10. FLUJO ANUAL ===== */}
      <section className="py-24 lg:py-28 bg-neutral-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900 mb-4 tracking-tight">El respaldo se construye durante todo el año.</h2>
            <p className="text-lg text-neutral-500">Cuando llega el momento de revisar el año, ya tienes el historial construido.</p>
          </div>

          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 max-w-4xl mx-auto mb-10">
            {['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'].map((mes, i) => (
              <div key={i} className={`rounded-xl p-4 text-center border ${i < 9 ? 'bg-emerald-50 border-emerald-200/60' : 'bg-white border-black/5'}`}>
                <p className="text-xs font-semibold text-neutral-500 mb-1">{mes}</p>
                <p className={`text-lg font-bold ${i < 9 ? 'text-emerald-700' : 'text-neutral-300'}`}>{i < 9 ? '✓' : '—'}</p>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-2xl p-6 border border-black/5 max-w-2xl mx-auto text-center">
            <p className="text-sm text-neutral-500 mb-2">Gastos acumulados al cierre</p>
            <p className="text-3xl font-bold text-neutral-900 mb-2">$14.892.400</p>
            <p className="text-sm text-neutral-500">564 documentos · 12 meses · Historial completo</p>
            <div className="mt-4 flex items-center justify-center gap-4 text-sm">
              <span className="text-emerald-700 font-medium">Revisión contable</span>
              <ChevronRight className="w-4 h-4 text-neutral-300" />
              <span className="text-neutral-700 font-medium">Tratamiento tributario según corresponda</span>
            </div>
          </div>
        </div>
      </section>

      {/* ===== 11. RINDENX → GASTOSNX ===== */}
      <section className="py-24 lg:py-28 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-amber-50 border border-amber-200/60 text-amber-700 rounded-full text-[13px] font-medium mb-6">
              <SplitSquareVertical className="w-3 h-3" />
              RindeNX + GastosNX
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900 mb-4 tracking-tight">¿Qué pasa con los gastos que aparecen en una rendición?</h2>
            <p className="text-lg text-neutral-500 max-w-2xl mx-auto">RindeNX controla el fondo y cierra la rendición. Los gastos que no siguen el flujo de una factura pueden pasar a GastosNX. Así el gasto no queda fuera del registro de la empresa.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Factura */}
            <div className="bg-neutral-50 rounded-3xl p-8 border border-black/5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <FileText className="w-5 h-5 text-blue-700" />
                </div>
                <div>
                  <h3 className="font-bold text-neutral-900">Factura</h3>
                  <p className="text-xs text-neutral-500">Proveedor · IVA</p>
                </div>
              </div>
              <div className="h-px bg-neutral-200 my-4" />
              <div className="flex items-center gap-2 text-sm text-neutral-600">
                <ArrowDownRight className="w-4 h-4 text-blue-600" />
                <span>Flujo de información para proceso contable</span>
              </div>
            </div>

            {/* Boleta / Voucher */}
            <div className="bg-emerald-50 rounded-3xl p-8 border border-emerald-200/60">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <Receipt className="w-5 h-5 text-emerald-700" />
                </div>
                <div>
                  <h3 className="font-bold text-neutral-900">Boleta / Voucher / Gasto menor</h3>
                  <p className="text-xs text-neutral-500">Documentos que no siguen el flujo de una factura</p>
                </div>
              </div>
              <div className="h-px bg-emerald-200 my-4" />
              <div className="flex items-center gap-2 text-sm text-emerald-700">
                <ArrowDownRight className="w-4 h-4" />
                <span>GastosNX → Registro + respaldo + historial</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== 12. CASO COMPLETO DE UNA RENDICIÓN ===== */}
      <section className="py-24 lg:py-28 bg-neutral-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900 mb-4 tracking-tight">Caso completo: un fondo, varios gastos.</h2>
            <p className="text-lg text-neutral-500">Un trabajador recibe $500.000 y realiza distintos gastos durante la semana.</p>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-black/5 shadow-lg shadow-black/5 max-w-4xl mx-auto">
            {/* Fondo */}
            <div className="bg-amber-50 border border-amber-200/60 rounded-2xl p-6 mb-8">
              <p className="text-xs font-semibold text-amber-700 uppercase tracking-wider mb-2">Fondo entregado</p>
              <p className="text-3xl font-bold text-amber-900">$500.000</p>
            </div>

            {/* Gastos */}
            <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-4">Gastos realizados</p>
            <div className="grid sm:grid-cols-2 gap-3 mb-8">
              {[
                { desc: 'Factura materiales', monto: '$220.000', tipo: 'Factura' },
                { desc: 'Boleta alimentación', monto: '$45.000', tipo: 'Boleta' },
                { desc: 'Voucher peaje', monto: '$18.000', tipo: 'Voucher' },
                { desc: 'Estacionamiento', monto: '$12.000', tipo: 'Voucher' },
                { desc: 'Otros gastos respaldados', monto: '$25.000', tipo: 'Boleta' },
              ].map((g, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-neutral-50 rounded-xl border border-black/5">
                  <div>
                    <p className="text-sm font-semibold text-neutral-900">{g.desc}</p>
                    <p className="text-xs text-neutral-500">{g.tipo}</p>
                  </div>
                  <span className="text-sm font-mono text-neutral-700">{g.monto}</span>
                </div>
              ))}
            </div>

            {/* RindeNX */}
            <div className="bg-neutral-950 rounded-2xl p-6 text-white mb-8">
              <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3">RindeNX controla</p>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div><p className="text-lg font-bold">$500.000</p><p className="text-xs text-neutral-400">Fondo</p></div>
                <div><p className="text-lg font-bold">$320.000</p><p className="text-xs text-neutral-400">Total gastos</p></div>
                <div><p className="text-lg font-bold">$180.000</p><p className="text-xs text-neutral-400">Saldo</p></div>
              </div>
            </div>

            {/* Separación */}
            <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-4">Separación por tipo</p>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 rounded-xl border border-blue-200/60">
                <p className="text-sm font-bold text-blue-900 mb-1">Factura → Proceso contable</p>
                <p className="text-xs text-blue-700">$220.000 · Información para el contador</p>
              </div>
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200/60">
                <p className="text-sm font-bold text-emerald-900 mb-1">Boletas + Vouchers → GastosNX</p>
                <p className="text-xs text-emerald-700">$100.000 · Registro + respaldo + historial</p>
              </div>
            </div>

            <div className="mt-6 p-4 bg-neutral-50 rounded-xl border border-black/5 text-center">
              <p className="text-sm text-neutral-600">La empresa conserva una historia completa de cómo se utilizó el dinero.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== 13. BENEFICIOS POR PERFIL ===== */}
      <section className="py-24 lg:py-28 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900 mb-4 tracking-tight">¿Qué gana cada persona?</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
            {[
              { role: 'Empresa / Dueño', quote: 'Veo cuánto se está gastando y dónde.', icon: <Building2 className="w-6 h-6" /> },
              { role: 'Administración', quote: 'Dejo de perseguir documentos y reconstruir gastos.', icon: <Calculator className="w-6 h-6" /> },
              { role: 'Trabajador', quote: 'Registro el gasto cuando ocurre y adjunto su respaldo.', icon: <Users className="w-6 h-6" /> },
              { role: 'Contador', quote: 'Recibo información más ordenada para revisar.', icon: <Briefcase className="w-6 h-6" /> },
            ].map((item, i) => (
              <div key={i} className="bg-neutral-50 rounded-2xl p-6 border border-black/5 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-emerald-100 rounded-xl text-emerald-700 mb-4">{item.icon}</div>
                <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-2">{item.role}</p>
                <p className="text-sm text-neutral-700 italic">&ldquo;{item.quote}&rdquo;</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 14. CONTABILIDAD / REVISIÓN ===== */}
      <section className="py-24 lg:py-28 bg-neutral-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900 mb-5 tracking-tight">Información lista para que tu contador revise.</h2>
              <p className="text-lg text-neutral-500 leading-relaxed mb-8">GastosNX no hace la contabilidad. Entrega información ordenada para que el proceso correspondiente se ejecute con menos errores y menos tiempo perdido.</p>
              <ul className="space-y-3">
                {[
                  'Exporta gastos por período en CSV o Excel',
                  'Cada registro incluye fecha, monto, categoría y documento',
                  'El contador recibe todo categorizado y con respaldo',
                  'Sin reconstructuir gastos desde correos o WhatsApp',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-neutral-700">
                    <Check className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                    <span className="text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative">
              <div className="bg-white rounded-3xl p-8 shadow-2xl shadow-black/10 ring-1 ring-black/5">
                <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-4">Exportación de gastos — Agosto 2026</p>
                <div className="space-y-2">
                  {[
                    { fecha: '01/08', desc: 'Peaje Ruta 5', cat: 'Peaje', monto: '$7.200' },
                    { fecha: '03/08', desc: 'Almuerzo reunión', cat: 'Boleta', monto: '$24.500' },
                    { fecha: '05/08', desc: 'Estacionamiento', cat: 'Voucher', monto: '$5.000' },
                    { fecha: '08/08', desc: 'Materiales obra', cat: 'Boleta', monto: '$38.000' },
                    { fecha: '12/08', desc: 'Combustible', cat: 'Voucher', monto: '$48.000' },
                  ].map((g, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-neutral-100 last:border-0">
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-neutral-400 font-mono w-10">{g.fecha}</span>
                        <div>
                          <p className="text-sm text-neutral-900">{g.desc}</p>
                          <p className="text-xs text-neutral-500">{g.cat}</p>
                        </div>
                      </div>
                      <span className="text-sm font-mono text-neutral-700">{g.monto}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-neutral-100 flex items-center justify-between">
                  <span className="text-sm font-semibold text-neutral-900">Total período</span>
                  <span className="text-lg font-bold text-emerald-700">$122.700</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== 15. DECLARACIÓN DE RENTA ===== */}
      <section className="py-24 lg:py-28 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900 mb-6 tracking-tight">Cuando llega el momento de revisar el año, ya tienes el historial construido.</h2>
          <p className="text-lg text-neutral-500 leading-relaxed max-w-2xl mx-auto mb-10">
            GastosNX no determina deducibilidad tributaria. Eso lo hace tu contador. Lo que GastosNX hace es que los gastos estén registrados, respaldados y ordenados para que el proceso se ejecute correctamente.
          </p>

          <div className="flex flex-col md:flex-row items-center justify-center gap-4 max-w-3xl mx-auto">
            {[
              { text: 'Gasto durante el año', icon: <ShoppingCart className="w-5 h-5" /> },
              { text: 'Registro', icon: <FileText className="w-5 h-5" /> },
              { text: 'Respaldo', icon: <Shield className="w-5 h-5" /> },
              { text: 'Historial', icon: <BarChart3 className="w-5 h-5" /> },
            ].map((step, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="flex items-center gap-2 px-4 py-2 bg-neutral-50 rounded-xl border border-black/5">
                  <div className="text-emerald-600">{step.icon}</div>
                  <span className="text-sm font-medium text-neutral-700">{step.text}</span>
                </div>
                {i < 3 && <ChevronRight className="w-4 h-4 text-neutral-300 hidden md:block" />}
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-col md:flex-row items-center justify-center gap-4">
            <div className="px-6 py-3 bg-neutral-100 rounded-xl border border-neutral-200">
              <p className="text-sm font-medium text-neutral-700">Cierre del período</p>
            </div>
            <ChevronRight className="w-4 h-4 text-neutral-300 hidden md:block" />
            <div className="px-6 py-3 bg-neutral-100 rounded-xl border border-neutral-200">
              <p className="text-sm font-medium text-neutral-700">Revisión contable</p>
            </div>
            <ChevronRight className="w-4 h-4 text-neutral-300 hidden md:block" />
            <div className="px-6 py-3 bg-emerald-100 rounded-xl border border-emerald-200">
              <p className="text-sm font-medium text-emerald-800">Tratamiento tributario según corresponda</p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== 16. CLIENTES REALES ===== */}
      <section className="py-20 lg:py-24 bg-neutral-50 border-y border-black/5">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm font-semibold text-neutral-500 uppercase tracking-wider mb-8">Empresas que ya usan GastosNX</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12 items-center mb-12">
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

      {/* ===== 17. PLANES Y PRECIOS ===== */}
      <section id="precios" className="py-24 lg:py-28 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900 mb-4 tracking-tight">Elige tu plan. Empieza a ordenar tus gastos.</h2>
            <p className="text-lg text-neutral-500 max-w-2xl mx-auto">Registra tus primeros gastos reales sin tarjeta y comprueba cómo funciona.</p>
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
            {/* Plan Pro */}
            <div className="bg-neutral-900 rounded-3xl p-8 text-white relative shadow-2xl shadow-black/20 flex flex-col">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-emerald-500 text-white px-4 py-1 rounded-full text-xs font-semibold tracking-wide">MÁS POPULAR</div>
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-white mb-1">Pro</h3>
                <p className="text-neutral-400 text-sm">Para pymes que quieren mantener sus gastos registrados y ordenados durante todo el año.</p>
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
            <p className="text-neutral-700 font-medium">Registra los gastos cuando ocurren y evita reconstruirlos meses después.</p>
          </div>
        </div>
      </section>

      {/* ===== 18. FAQ ===== */}
      <section id="faq" className="py-24 lg:py-28 bg-neutral-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900 mb-4 tracking-tight">Preguntas frecuentes</h2>
            <p className="text-lg text-neutral-500">Lo que más nos preguntan antes de empezar.</p>
          </div>
          <div className="space-y-3">
            {[
              { q: '¿GastosNX determina si un gasto es deducible?', a: 'No. GastosNX no reemplaza a tu contador ni determina deducibilidad tributaria. Su objetivo es entregarte respaldo y orden documental para que tu contador pueda trabajar mejor.' },
              { q: '¿Los documentos quedan respaldados para su revisión?', a: 'GastosNX mantiene el registro del gasto asociado a su documento de respaldo y conserva la información ordenada para su revisión. El tratamiento y validez tributaria de cada gasto corresponde a la empresa y a su asesoría contable según la normativa vigente.' },
              { q: '¿Cuánto tarda el acceso?', a: 'El plan Free se activa de inmediato. Los planes Pro se activan en máximo 24 hrs hábiles tras confirmar el pago.' },
              { q: '¿Puedo exportar a Excel/CSV?', a: 'Sí. El plan Pro incluye exportación a CSV y Excel con todos los gastos del período, listos para tu contador.' },
              { q: '¿Cómo funciona el precio por usuario?', a: 'El plan Pro incluye hasta 3 usuarios base. Cada usuario adicional tiene un precio preferencial según el periodo elegido (anual o mes a mes).' },
              { q: '¿Puedo agregar más de 3 usuarios?', a: 'Sí. Puedes agregar usuarios adicionales con precio preferencial: $2.500 c/u (plan anual) o $3.000 c/u (plan mes a mes). IVA incluido.' },
              { q: '¿Qué diferencia hay entre pago anual y mes a mes?', a: 'El plan anual tiene un mejor precio por usuario ($3.300 vs $4.000) y se factura una vez al año. El plan mes a mes te da flexibilidad sin contrato, con un valor ligeramente mayor.' },
              { q: '¿Qué tecnología de OCR usan?', a: 'Usamos OCR con Google AI, una de las tecnologías de reconocimiento de texto más confiables del mercado, optimizada para boletas chilenas.' },
              { q: '¿GastosNX reemplaza al contador?', a: 'No. GastosNX le da a tu contador la información ordenada y respaldada que necesita para trabajar mejor. La revisión y el tratamiento tributario corresponden a él.' },
            ].map((item, i) => (
              <details key={i} className="group bg-white rounded-2xl border border-black/5 overflow-hidden">
                <summary className="flex items-center justify-between cursor-pointer p-5 text-left">
                  <span className="font-semibold text-neutral-900">{item.q}</span>
                  <span className="text-emerald-600 group-open:rotate-45 transition-transform text-xl leading-none shrink-0 ml-4">+</span>
                </summary>
                <div className="px-5 pb-5 text-neutral-600 text-[15px] leading-relaxed">{item.a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 19. CTA FINAL ===== */}
      <section className="py-24 lg:py-28 bg-neutral-950 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="relative hidden lg:block">
              <div className="relative w-full h-105 rounded-[28px] overflow-hidden shadow-2xl shadow-black/40 ring-1 ring-white/10">
                <Image src="/images/para_pymes.webp" alt="Dueño de pyme chilena con control de gastos en su celular" fill className="object-cover" />
              </div>
            </div>
            <div className="text-center lg:text-left">
              <h2 className="text-3xl lg:text-5xl font-bold text-white mb-6 tracking-tight">Llega a tu contador con todo ordenado.</h2>
              <p className="text-lg text-neutral-400 mb-10 leading-relaxed">Registra durante el año los gastos reales de tu empresa, conserva sus respaldos y llega al cierre con la información construida, no reconstruida. GastosNX es la herramienta que conecta tu operación con tu contador — para que la información de tus gastos llegue ordenada y respaldada a revisión.</p>
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

      {/* ===== INSTAGRAM ===== */}
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
            {[1, 2, 3, 4].map((n) => (
              <a key={n} href="https://www.instagram.com/nx_chile" target="_blank" rel="noopener noreferrer" className="group relative aspect-square rounded-2xl overflow-hidden border border-black/5 hover:shadow-lg transition-all">
                <Image src={`/images/instagram/post-${n}.jpeg`} alt="Publicación GastosNX en Instagram" fill className="object-cover group-hover:scale-105 transition-transform" />
                <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/70 to-transparent text-white text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  Ver en Instagram
                </div>
              </a>
            ))}
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
              <p className="text-sm leading-relaxed text-neutral-500">GastosNX es el sistema que usan pymes y contadores en Chile para registrar, respaldar y ordenar los gastos operacionales de su empresa. Desarrollado en Chile para la realidad tributaria chilena.</p>
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

      {/* ===== WHATSAPP FLOTANTE ===== */}
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
