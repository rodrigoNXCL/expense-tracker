'use client'

import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Check, Sparkles, ArrowLeft, Mail, Clock, CreditCard } from 'lucide-react'

export default function ConfirmacionPage() {
  const searchParams = useSearchParams()
  const plan = searchParams.get('plan') || 'free'
  const pago = searchParams.get('pago') || 'none'

  const esPago = pago === 'pending'
  const esFree = plan === 'free'

  const planes = {
    free: {
      nombre: 'Free',
      precio: 0,
      color: 'from-emerald-500 to-teal-600',
    },
    pro: {
      nombre: 'Pro',
      precio: 9900,
      color: 'from-blue-500 to-indigo-600',
    },
    enterprise: {
      nombre: 'Enterprise',
      precio: 19990,
      color: 'from-purple-500 to-pink-600',
    },
  }

  const planActual = planes[plan as keyof typeof planes] || planes.free

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center p-4">
      <div className="max-w-lg w-full space-y-6">
        {/* ===== NAVBAR ===== */}
        <nav className="flex items-center justify-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/30">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">GastosSII</h1>
              <p className="text-xs text-gray-500">Registro completado</p>
            </div>
          </div>
        </nav>

        {/* ===== CARD DE CONFIRMACIÓN ===== */}
        <Card className="border-emerald-100 shadow-xl shadow-emerald-500/10 overflow-hidden">
          {/* Header con color del plan */}
          <div className={`bg-gradient-to-r ${planActual.color} p-6 text-center text-white`}>
            <div className="w-16 h-16 mx-auto mb-3 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <Check className="h-8 w-8" />
            </div>
            <h1 className="text-2xl font-bold">¡Solicitud Enviada!</h1>
            <p className="text-white/90 mt-1">Plan {planActual.nombre}</p>
          </div>

          <CardContent className="p-6 space-y-6">
            {/* Mensaje según tipo de registro */}
            {esFree ? (
              <div className="text-center space-y-3">
                <p className="text-gray-700">
                  Hemos recibido tu solicitud para el plan <strong>Free</strong>.
                </p>
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                  <p className="text-sm text-emerald-800">
                    ✅ No requiere pago
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center space-y-3">
                <p className="text-gray-700">
                  Hemos recibido tu solicitud para el plan <strong>{planActual.nombre}</strong>.
                </p>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-center gap-2 text-amber-800">
                    <CreditCard className="h-4 w-4" />
                    <p className="text-sm font-medium">
                      Pago pendiente de coordinación
                    </p>
                  </div>
                  <p className="text-xs text-amber-700">
                    Total anual: ${(planActual.precio * 12).toLocaleString('es-CL')} 
                    (${planActual.precio.toLocaleString('es-CL')}/mes)
                  </p>
                </div>
              </div>
            )}

            {/* Próximos pasos */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 text-center flex items-center justify-center gap-2">
                <Clock className="h-5 w-5 text-emerald-600" />
                ¿Qué pasa ahora?
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">1</div>
                  <p className="text-sm text-gray-700">
                    Revisaremos tu solicitud manualmente
                  </p>
                </div>
                
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">2</div>
                  <p className="text-sm text-gray-700">
                    {esFree 
                      ? 'Te enviaremos un email con tus datos de acceso' 
                      : 'Te contactaremos para coordinar el pago (transferencia, Fintoc, Flow o Mercado Pago)'
                    }
                  </p>
                </div>
                
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">3</div>
                  <p className="text-sm text-gray-700">
                    Una vez confirmado, recibirás tu acceso en máximo <strong>24 hrs hábiles</strong>
                  </p>
                </div>
              </div>
            </div>

            {/* Info de contacto */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium">¿Tienes dudas?</p>
                  <p className="text-blue-700 mt-1">
                    Escríbenos a{' '}
                    <a href="mailto:gastossii@nxchile.com" className="underline font-medium">
                      gastossii@nxchile.com
                    </a>
                  </p>
                </div>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="space-y-3 pt-4">
              <Button
                variant="outline"
                onClick={() => window.location.href = '/'}
                className="w-full border-emerald-500 text-emerald-600 hover:bg-emerald-50"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver al Inicio
              </Button>
              
              <Button
                variant="ghost"
                onClick={() => window.location.href = '/login'}
                className="w-full text-gray-600"
              >
                Ir a Login →
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-xs text-gray-500">
          v0.8.0 • GastosSII by NXChile
        </p>
      </div>
    </div>
  )
}