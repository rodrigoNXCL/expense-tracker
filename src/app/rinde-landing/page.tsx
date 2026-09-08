'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowRight, Check, Clock, FileText, Layers, Lock, MessageCircle,
  Receipt, Shield, Wallet, Camera, Users, Building2,
} from 'lucide-react'
import Image from 'next/image'

export default function RindeLandingPage() {
  const router = useRouter()
  const [showStickyCTA, setShowStickyCTA] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setShowStickyCTA(window.scrollY > 800)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const whatsappMessage = encodeURIComponent('Hola, vengo de rinde.nxchile.com y quiero saber más sobre RindeNX para mi empresa.')
  const whatsappLink = `https://wa.me/56977412178?text=${whatsappMessage}`

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
              <button onClick={() => router.push('/login')} className="px-5 py-2.5 text-sm font-medium text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100 rounded-full transition-colors">Iniciar Sesión</button>
              <a href="https://gastos.nxchile.com" target="_blank" rel="noopener noreferrer" className="hidden sm:inline-flex ml-2 px-5 py-2.5 bg-neutral-900 text-white text-sm font-semibold rounded-full hover:bg-neutral-700 transition-colors">
                GastosNX →
              </a>
              <button onClick={() => router.push('/login')} className="ml-2 px-5 py-2.5 bg-amber-500 text-white text-sm font-semibold rounded-full hover:bg-amber-600 transition-colors">
                Ingresar
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* ===== HERO + CTA ===== */}
      <section className="relative pt-32 pb-20 lg:pt-44 lg:pb-32 bg-linear-to-b from-white to-amber-50/60 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <div className="text-center lg:text-left flex flex-col items-center lg:items-start nx-fade-up">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-amber-50 border border-amber-200/60 text-amber-700 rounded-full text-[13px] font-medium mb-8">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                Producto de NXChile · Fondos por rendir
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-[64px] font-bold text-neutral-900 mb-6 leading-[1.05] tracking-tight">
                Rendiciones que llegan
                <br className="hidden sm:block" />
                <span className="text-amber-600"> cuadradas, todos los meses.</span>
              </h1>
              <p className="text-lg sm:text-xl text-neutral-500 mb-10 max-w-xl leading-relaxed">
                RindeNX digitaliza los fondos por rendir de tu empresa: asigna fondos, registra gastos con OCR y genera el asiento contable de forma automática. Desarrollado por NXChile.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <button onClick={() => router.push('/login')} className="w-full sm:w-auto px-7 py-3.5 bg-amber-500 text-white text-base font-semibold rounded-full hover:bg-amber-600 transition-all inline-flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25">
                  Ingresar a mi cuenta <ArrowRight className="w-4 h-4" />
                </button>
                <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto px-7 py-3.5 bg-white text-neutral-700 text-base font-semibold rounded-full border border-neutral-200 hover:border-neutral-300 transition-all text-center">
                  Pedir acceso para mi empresa
                </a>
              </div>
            </div>

            {/* Mockup del dashboard RindeNX */}
            <div className="relative hidden lg:block nx-fade-up" style={{ animationDelay: '0.15s' }}>
              <div className="bg-white rounded-[28px] p-6 shadow-2xl shadow-amber-600/10 ring-1 ring-black/5">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-gradient-to-tr from-amber-500 to-orange-600 rounded-lg flex items-center justify-center">
                      <FileText className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-neutral-900">RindeNX</p>
                      <p className="text-xs text-neutral-500">Fondos por rendir · Agosto</p>
                    </div>
                  </div>
                  <div className="flex gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-200" />
                    <span className="w-2 h-2 rounded-full bg-amber-300" />
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-5">
                  <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100">
                    <p className="text-xs font-medium text-amber-700 mb-1">Fondo asignado</p>
                    <p className="text-xl font-bold text-neutral-900">$200.000</p>
                  </div>
                  <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100">
                    <p className="text-xs font-medium text-amber-700 mb-1">Saldo por rendir</p>
                    <p className="text-xl font-bold text-neutral-900">$56.300</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-black/5">
                    <div className="flex items-center gap-3">
                      <Camera className="w-4 h-4 text-amber-600" />
                      <div>
                        <p className="text-sm font-semibold text-neutral-900">Boleta Supermercado</p>
                        <p className="text-xs text-neutral-400">15 ago · $48.700</p>
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full">Imputada</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-black/5">
                    <div className="flex items-center gap-3">
                      <Receipt className="w-4 h-4 text-amber-600" />
                      <div>
                        <p className="text-sm font-semibold text-neutral-900">Factura Gasolineras</p>
                        <p className="text-xs text-neutral-400">14 ago · $65.000</p>
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full">Imputada</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-black/5">
                    <div className="flex items-center gap-3">
                      <FileText className="w-4 h-4 text-amber-600" />
                      <div>
                        <p className="text-sm font-semibold text-neutral-900">Voucher peaje</p>
                        <p className="text-xs text-neutral-400">13 ago · $5.000</p>
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full">Imputada</span>
                  </div>
                </div>
                <div className="mt-5 pt-4 border-t border-black/5 flex items-center justify-between">
                  <p className="text-xs text-neutral-500">Asiento contable automático</p>
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600">
                    <Check className="w-3.5 h-3.5" /> Debe = Haber
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== PRUEBA SOCIAL: CLIENTES ===== */}
      <section className="py-12 lg:py-16 bg-neutral-50 border-b border-black/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm font-semibold text-neutral-500 uppercase tracking-wider mb-8">
            Empresas que ya cuadran sus rendiciones con NXChile
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

      {/* ===== CÓMO FUNCIONA ===== */}
      <section id="como-funciona" className="py-24 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <h2 className="text-3xl lg:text-5xl font-bold text-neutral-900 mb-5 tracking-tight">El eslabón que faltaba entre tu fondo y tu contador.</h2>
            <p className="text-lg text-neutral-500 leading-relaxed">RindeNX no reemplaza a tu contador. Le entrega una rendición ordenada, respaldada y siempre cuadrada — sin boleta perdida, sin saldo que quede sin explicar.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <div className="bg-neutral-50 rounded-3xl p-8 border border-black/10 hover:border-amber-300 transition-all">
              <div className="relative w-full h-44 mb-6 rounded-2xl overflow-hidden">
                <Image src="/images/paso3_contador.webp" alt="Fondo asignado a un rendidor dentro de RindeNX" fill className="object-cover" />
              </div>
              <div className="inline-flex items-center justify-center w-8 h-8 bg-amber-100 text-amber-700 rounded-full text-sm font-bold mb-3">1</div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">Se asigna un fondo, no un gasto suelto</h3>
              <p className="text-neutral-500 text-[15px] leading-relaxed">El administrador entrega un fondo de caja o cupo de gasto a cada rendidor. <span className="text-amber-700 font-medium">Una rendición por fondo. Nada de montos huérfanos.</span></p>
            </div>
            <div className="bg-neutral-50 rounded-3xl p-8 border border-black/10 hover:border-amber-300 transition-all">
              <div className="relative w-full h-44 mb-6 rounded-2xl overflow-hidden">
                <Image src="/images/paso1_captura.webp" alt="Rendidor fotografiando una boleta con OCR dentro de RindeNX" fill className="object-cover" />
              </div>
              <div className="inline-flex items-center justify-center w-8 h-8 bg-amber-100 text-amber-700 rounded-full text-sm font-bold mb-3">2</div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">Cada gasto se rinde con su respaldo</h3>
              <p className="text-neutral-500 text-[15px] leading-relaxed">El rendidor registra boletas, facturas y vouchers con OCR o manualmente. <span className="text-amber-700 font-medium">Cada gasto queda imputado a su rendición con imagen y trazabilidad.</span></p>
            </div>
            <div className="bg-neutral-50 rounded-3xl p-8 border border-black/10 hover:border-amber-300 transition-all">
              <div className="relative w-full h-44 mb-6 rounded-2xl overflow-hidden">
                <Image src="/images/paso2_respaldo.webp" alt="Rendición cerrada, aprobada y convertida en asiento contable en RindeNX" fill className="object-cover" />
              </div>
              <div className="inline-flex items-center justify-center w-8 h-8 bg-amber-100 text-amber-700 rounded-full text-sm font-bold mb-3">3</div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">Se cierra, se aprueba y el asiento sale solo</h3>
              <p className="text-neutral-500 text-[15px] leading-relaxed">El sistema calcula la diferencia contra el fondo asignado y genera el asiento automáticamente. <span className="text-amber-700 font-medium">Debe = Haber. Anticipo, saldo a favor y por devolver, actualizados.</span></p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== BENEFICIOS ===== */}
      <section className="py-24 lg:py-28 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-amber-500 rounded-2xl mb-8">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900 mb-4 tracking-tight">Fin a las rendiciones que nunca cuadran.</h2>
            <p className="text-lg text-neutral-500 leading-relaxed">RindeNX está hecho para pymes y contadores que necesitan controlar fondos por rendir sin planillas desactualizadas ni correos persiguiendo comprobantes.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
            <div className="bg-white rounded-2xl p-6 border border-black/5">
              <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center mb-4 ring-1 ring-amber-100"><Wallet className="w-6 h-6 text-amber-600" /></div>
              <h3 className="text-base font-semibold text-neutral-900 mb-1.5">Un fondo, una rendición</h3>
              <p className="text-neutral-500 text-sm leading-relaxed">Siempre sabes qué fondo está en manos de quién, cuánto se ha rendido y cuánto falta por justificar.</p>
            </div>
            <div className="bg-white rounded-2xl p-6 border border-black/5">
              <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center mb-4 ring-1 ring-amber-100"><Camera className="w-6 h-6 text-amber-600" /></div>
              <h3 className="text-base font-semibold text-neutral-900 mb-1.5">Registro con OCR, en el momento</h3>
              <p className="text-neutral-500 text-sm leading-relaxed">Boletas, facturas y vouchers se leen solos. El rendidor registra al instante y deja el respaldo digital para siempre.</p>
            </div>
            <div className="bg-white rounded-2xl p-6 border border-black/5">
              <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center mb-4 ring-1 ring-amber-100"><Check className="w-6 h-6 text-amber-600" /></div>
              <h3 className="text-base font-semibold text-neutral-900 mb-1.5">Asiento cuadrado automático</h3>
              <p className="text-neutral-500 text-sm leading-relaxed">Al aprobar, RindeNX genera el asiento de la rendición con Debe = Haber: anticipo, saldo a favor y saldo por devolver, sin errores de tipeo.</p>
            </div>
            <div className="bg-white rounded-2xl p-6 border border-black/5">
              <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center mb-4 ring-1 ring-amber-100"><Clock className="w-6 h-6 text-amber-600" /></div>
              <h3 className="text-base font-semibold text-neutral-900 mb-1.5">Estados claros de punta a punta</h3>
              <p className="text-neutral-500 text-sm leading-relaxed">Abierta, terminada, en revisión, aprobada o rechazada. Cada rendición sabe exactamente dónde está y qué le falta.</p>
            </div>
            <div className="bg-white rounded-2xl p-6 border border-black/5">
              <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center mb-4 ring-1 ring-amber-100"><Layers className="w-6 h-6 text-amber-600" /></div>
              <h3 className="text-base font-semibold text-neutral-900 mb-1.5">Puente con GastosNX</h3>
              <p className="text-neutral-500 text-sm leading-relaxed">Los gastos operacionales de la rendición pueden pasar a GastosNX para el respaldo tributario anual. Una sola cuenta, una sola empresa.</p>
            </div>
            <div className="bg-white rounded-2xl p-6 border border-black/5">
              <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center mb-4 ring-1 ring-amber-100"><Lock className="w-6 h-6 text-amber-600" /></div>
              <h3 className="text-base font-semibold text-neutral-900 mb-1.5">Trazabilidad y control</h3>
              <p className="text-neutral-500 text-sm leading-relaxed">Todo queda registrado: quién asignó el fondo, quién rinde, quién aprueba y con qué comentarios. Auditoría lista para revisión.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== PRUEBA SOCIAL + CONTACTO ===== */}
      <section className="py-24 lg:py-28 bg-neutral-950 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <Image src="/images/cierre_cta.webp" alt="Fondo de la sección de contacto de RindeNX" fill className="object-cover" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white/10 border border-white/20 text-amber-300 rounded-full text-[13px] font-medium mb-6">
              Producto oficial de NXChile
            </div>
            <h2 className="text-3xl lg:text-5xl font-bold text-white mb-5 tracking-tight">Llega al cierre con todo cuadrado.</h2>
            <p className="text-lg text-neutral-400 leading-relaxed max-w-3xl mx-auto mb-10">
              Cada fondo por rendir que pasa por RindeNX vuelve como una rendición ordenada, un asiento contable listo y un saldo sin preguntas pendientes.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
              <button onClick={() => router.push('/login')} className="px-8 py-3.5 bg-amber-500 text-white text-base font-semibold rounded-full hover:bg-amber-600 transition-all inline-flex items-center gap-2 shadow-lg shadow-amber-500/20">
                Ingresar a mi cuenta <ArrowRight className="w-4 h-4" />
              </button>
              <button onClick={() => router.push('/login')} className="px-8 py-3.5 bg-transparent text-white text-base font-semibold rounded-full border border-white/25 hover:border-white/50 transition-all">
                Probar con mis rendidores
              </button>
            </div>
            <p className="text-sm text-neutral-500 mt-8">💬 ¿Dudas? Escríbenos por WhatsApp y te mostramos el sistema.</p>
          </div>

          <div className="grid sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
            <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="bg-white rounded-2xl p-5 text-center hover:shadow-xl transition-all">
              <div className="text-2xl mb-2">💬</div>
              <p className="text-sm font-semibold text-neutral-900">WhatsApp directo</p>
              <p className="text-xs text-neutral-500 mt-1">+56 9 7741 2178</p>
            </a>
            <a href="mailto:rinde@nxchile.com?subject=Solicito%20acceso%20a%20RindeNX" className="bg-white rounded-2xl p-5 text-center hover:shadow-xl transition-all">
              <div className="text-2xl mb-2">📧</div>
              <p className="text-sm font-semibold text-neutral-900">Escríbenos</p>
              <p className="text-xs text-neutral-500 mt-1">rinde@nxchile.com</p>
            </a>
            <button onClick={() => router.push('/login')} className="bg-white rounded-2xl p-5 text-center hover:shadow-xl transition-all">
              <div className="text-2xl mb-2">🔐</div>
              <p className="text-sm font-semibold text-neutral-900">Ya soy usuario</p>
              <p className="text-xs text-neutral-500 mt-1">Entro a mi cuenta</p>
            </button>
          </div>

          <div className="mt-12 text-center">
            <a href="https://gastos.nxchile.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-amber-300 font-semibold hover:text-amber-200 transition-colors">
              ¿Buscas respaldo de gastos tributarios? Conoce GastosNX →
            </a>
          </div>
        </div>
      </section>

      {/* ===== PARA ADMINISTRADORES / CONTADORES ===== */}
      <section className="py-24 lg:py-28 bg-gradient-to-br from-amber-50/60 to-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-amber-50 border border-amber-200/60 text-amber-700 rounded-full text-[13px] font-medium mb-6">
                <Users className="w-3 h-3" />
                Para administradores y contadores
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900 mb-5 tracking-tight">Deja de perseguir rendiciones. Revisa todo desde un panel.</h2>
              <p className="text-lg text-neutral-500 leading-relaxed mb-8">RindeNX te entrega cada fondo por rendir con su saldo, cada gasto con su comprobante y cada asiento listo para tu sistema contable.</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-3 text-neutral-700"><Check className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" /><span><strong>Diferencia contra el fondo:</strong> el saldo en contra o a favor se calcula al instante.</span></li>
                <li className="flex items-start gap-3 text-neutral-700"><Check className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" /><span><strong>Aprobación con comentarios:</strong> rechaza o aprueba dejando la instrucción registrada.</span></li>
                <li className="flex items-start gap-3 text-neutral-700"><Check className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" /><span><strong>Asiento automático:</strong> anticipo, saldo a favor y saldo por devolver con Debe igual a Haber.</span></li>
                <li className="flex items-start gap-3 text-neutral-700"><Check className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" /><span><strong>Cuentas configurables por empresa:</strong> el asiento se adapta a tu plan de cuentas.</span></li>
              </ul>
              <div className="flex flex-col sm:flex-row gap-3">
                <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="px-6 py-3.5 bg-amber-500 text-white text-[15px] font-semibold rounded-full hover:bg-amber-600 transition-colors inline-flex items-center justify-center gap-2">
                  <Building2 className="w-4 h-4" />
                  Solicitar acceso para mi empresa
                </a>
                <button onClick={() => router.push('/login')} className="px-6 py-3.5 bg-white text-neutral-700 text-[15px] font-semibold rounded-full border border-neutral-200 hover:border-neutral-300 transition-all inline-flex items-center justify-center gap-2">
                  <Users className="w-4 h-4" />
                  Soy administrador, entrar
                </button>
              </div>
            </div>
            <div className="relative">
              <div className="bg-white rounded-3xl p-8 shadow-2xl shadow-black/10 ring-1 ring-black/5">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-neutral-100">
                  <div className="w-10 h-10 bg-gradient-to-tr from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-neutral-900">Panel del administrador</p>
                    <p className="text-xs text-neutral-500">Estado de fondos por rendir</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-amber-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center text-amber-700 font-bold text-sm">AC</div>
                      <div>
                        <p className="text-sm font-semibold text-neutral-900">AC Constructores</p>
                        <p className="text-xs text-neutral-500">Fondo $500.000 · Rendido $421.000</p>
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-amber-700 bg-white px-2.5 py-1 rounded-full">En revisión</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold text-sm">RC</div>
                      <div>
                        <p className="text-sm font-semibold text-neutral-900">RCC Servicios</p>
                        <p className="text-xs text-neutral-500">Fondo $300.000 · Rendido $300.000</p>
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-emerald-700 bg-white px-2.5 py-1 rounded-full">Aprobada</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-700 font-bold text-sm">TS</div>
                      <div>
                        <p className="text-sm font-semibold text-neutral-900">Transportes San Andrés</p>
                        <p className="text-xs text-neutral-500">Fondo $800.000 · Rendido $655.000</p>
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-rose-600 bg-white px-2.5 py-1 rounded-full">Saldo en contra</span>
                  </div>
                </div>
                <div className="mt-6 pt-4 border-t border-neutral-100 flex items-center justify-between">
                  <p className="text-xs text-neutral-500">Ejemplo visual · Vista previa del panel</p>
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600">
                    <Check className="w-3.5 h-3.5" /> Asientos generados
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="bg-neutral-950 text-neutral-400 py-16 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-10 mb-10">
            <div>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 bg-gradient-to-tr from-amber-500 to-orange-600 rounded-lg flex items-center justify-center">
                  <FileText className="w-4 h-4 text-white" />
                </div>
                <span className="text-lg font-bold tracking-tight text-white">Rinde<span className="text-amber-500">NX</span></span>
              </div>
              <p className="text-sm leading-relaxed text-neutral-500">RindeNX es el sistema que usan pymes y contadores para controlar fondos por rendir, digitalizar rendiciones y generar asientos contables automáticos. Desarrollado en Chile por NXChile.</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4 text-sm">Producto</h4>
              <ul className="space-y-2.5 text-sm">
                <li><button onClick={() => document.getElementById('como-funciona')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-white transition-colors">Cómo funciona</button></li>
                <li><button onClick={() => router.push('/login')} className="hover:text-white transition-colors">Iniciar Sesión</button></li>
                <li><a href="https://gastos.nxchile.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">GastosNX — gastos tributarios</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4 text-sm">Contacto</h4>
              <ul className="space-y-2.5 text-sm">
                <li><a href="mailto:rinde@nxchile.com" className="hover:text-white transition-colors">rinde@nxchile.com</a></li>
                <li><a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">WhatsApp +56 9 7741 2178</a></li>
                <li><a href="https://www.nxchile.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">nxchile.com</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-white/10 text-center text-sm">
            <p className="mb-2 text-neutral-500">RindeNX no reemplaza al contador ni determina tratamiento tributario. Su objetivo es entregar orden, trazabilidad y asientos cuadrados.</p>
            <p className="text-neutral-500">© 2026 RindeNX by NXChile. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>

      {/* ===== STICKY CTA MOBILE ===== */}
      {showStickyCTA && (
        <div className="fixed bottom-0 inset-x-0 z-40 md:hidden bg-white/95 backdrop-blur-xl border-t border-black/10 shadow-2xl shadow-black/10 p-3 flex gap-2">
          <button onClick={() => router.push('/login')} className="flex-1 px-4 py-3 bg-amber-500 text-white text-sm font-semibold rounded-full hover:bg-amber-600 transition-colors">
            Ingresar a mi cuenta
          </button>
          <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="px-4 py-3 bg-[#25D366] text-white text-sm font-semibold rounded-full hover:bg-[#1DA851] transition-colors inline-flex items-center justify-center">
            <MessageCircle className="w-5 h-5" />
          </a>
        </div>
      )}

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