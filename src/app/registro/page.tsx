'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Check, Sparkles, ArrowRight } from 'lucide-react'

export default function RegistroPage() {
  const router = useRouter()

  const planes = [
    {
      nombre: 'Free',
      precioMensual: 0,
      facturacion: 'Gratis',
      descripcion: 'Para probar el sistema',
      usuarios: 1,
      boletas: '10 boletas/mes',
      caracteristicas: [
        '1 usuario',
        '10 boletas/mes',
        'OCR Azure AI',
        'Dashboard básico',
        'Export CSV',
      ],
      boton: 'Prueba Gratis',
      variant: 'outline' as const,
      destino: '/registro/free',
      destacado: false,
    },
    {
      nombre: 'Pro',
      precioMensual: 9900,
      facturacion: 'anual',
      descripcion: 'Para empresas en crecimiento',
      usuarios: 3,
      boletas: '500 boletas/mes',
      caracteristicas: [
        'Hasta 3 usuarios',
        '500 boletas/mes',
        'OCR Azure AI',
        'Dashboard avanzado',
        'Export CSV + Excel',
        'Soporte prioritario',
      ],
      boton: 'Comenzar Ahora',
      variant: 'primary' as const,
      destino: '/registro/pago?plan=pro',
      destacado: true,
    },
    {
      nombre: 'Enterprise',
      precioMensual: 19990,
      facturacion: 'anual',
      descripcion: 'Para grandes empresas',
      usuarios: 10,
      boletas: 'Ilimitadas',
      caracteristicas: [
        'Hasta 10 usuarios',
        'Boletas ilimitadas',
        'OCR Azure AI',
        'Dashboard avanzado',
        'Export CSV + Excel',
        'API access',
        'Soporte 24/7',
      ],
      boton: 'Comenzar Ahora',
      variant: 'primary' as const,
      destino: '/registro/pago?plan=enterprise',
      destacado: false,
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      {/* ===== NAVBAR ===== */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-emerald-100/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/30">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">GastosSII</h1>
                <p className="text-xs text-gray-500">Selecciona tu plan</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={() => router.push('/')}>
              ← Volver
            </Button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
        {/* ===== HEADER ===== */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">
            Elige el plan perfecto para tu empresa
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Todos los planes incluyen OCR con Azure AI. 
            Los planes pagos se facturan anualmente.
          </p>
        </div>

        {/* ===== PLANES ===== */}
        <div className="grid md:grid-cols-3 gap-8">
          {planes.map((plan) => (
            <Card 
              key={plan.nombre}
              className={`relative transition-all duration-300 ${
                plan.destacado 
                  ? 'border-2 border-emerald-500 shadow-xl shadow-emerald-500/20 scale-105' 
                  : 'border border-gray-200 hover:shadow-lg'
              }`}
            >
              {/* Badge Destacado */}
              {plan.destacado && (
                <Badge variant="success" className="absolute -top-3 left-1/2 -translate-x-1/2">
                  MÁS POPULAR
                </Badge>
              )}

              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl text-gray-900">{plan.nombre}</CardTitle>
                <div className="mt-4">
                  {plan.precioMensual === 0 ? (
                    <div>
                      <span className="text-5xl font-bold text-gray-900">$0</span>
                      <p className="text-gray-500 mt-1">{plan.facturacion}</p>
                    </div>
                  ) : (
                    <div>
                      <span className="text-5xl font-bold text-gray-900">${plan.precioMensual.toLocaleString('es-CL')}</span>
                      <p className="text-gray-500 mt-1">por mes ({plan.facturacion})</p>
                      <p className="text-xs text-gray-400 mt-1">
                        ~${Math.round(plan.precioMensual / plan.usuarios).toLocaleString('es-CL')}/usuario/mes
                      </p>
                    </div>
                  )}
                </div>
                <p className="text-sm text-gray-600 mt-2">{plan.descripcion}</p>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Características */}
                <ul className="space-y-3">
                  {plan.caracteristicas.map((caract, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                      <Check className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <span>{caract}</span>
                    </li>
                  ))}
                </ul>

                {/* Botón */}
                <Button
                  variant={plan.variant}
                  size="lg"
                  className="w-full font-semibold"
                  onClick={() => router.push(plan.destino)}
                >
                  {plan.boton}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>

                {/* Nota planes pagos */}
                {plan.precioMensual > 0 && (
                  <div className="text-center space-y-1">
                    <p className="text-xs text-gray-500">
                      ⏱️ Recibirás tus accesos en máximo 24 hrs hábiles
                    </p>
                    <p className="text-xs text-gray-400">
                      Total anual: ${(plan.precioMensual * 12).toLocaleString('es-CL')}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* ===== INFO ADICIONAL ===== */}
        <div className="text-center space-y-4 pt-8 border-t border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">¿Tienes dudas?</h3>
          <p className="text-gray-600">
            Contáctanos en{' '}
            <a href="mailto:gastossii@nxchile.com" className="text-emerald-600 hover:underline font-medium">
              gastossii@nxchile.com
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}