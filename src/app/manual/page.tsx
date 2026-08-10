'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft, BookOpen, PlayCircle } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'

export default function ManualPage() {
  const router = useRouter()

  // 🔗 REEMPLAZA CON TU VIDEO ID DE YOUTUBE
  // Ej: Si tu URL es https://www.youtube.com/watch?v=ABC123xyz
  // Entonces videoId = "ABC123xyz"
  const videoId = '9txm6hqHre8'

  return (
    <main className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      {/* ===== NAVBAR ===== */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => router.push('/')}
              className="flex items-center gap-2 text-gray-700 hover:text-emerald-600 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-semibold">Volver al Inicio</span>
            </button>
            <Badge variant="default" className="bg-emerald-600">
              <BookOpen className="w-3 h-3 mr-1" />
              Manual de Uso v1.0
            </Badge>
          </div>
        </div>
      </nav>

      {/* ===== HEADER ===== */}
      <section className="py-12 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-800 rounded-full text-sm font-medium mb-6">
            <PlayCircle className="w-4 h-4" />
            Tutorial interactivo paso a paso
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Manual de Uso de GastosNX
          </h1>
          <p className="text-lg text-gray-600 leading-relaxed">
            Aprende a registrar tus boletas, gestionar gastos y exportar información 
            en menos de 10 minutos.
          </p>
        </div>
      </section>

      {/* ===== VIDEO DE YOUTUBE ===== */}
      <section className="py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            {/* Contenedor 16:9 para YouTube */}
            <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
              <iframe
                src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&autohide=1`}
                className="absolute top-0 left-0 w-full h-full"
                title="Manual de Uso GastosNX"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          </div>

          {/* Info del Video */}
          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm">
              ⏱️ Duración estimada: 10-15 minutos • 📱 Compatible con móvil y desktop
            </p>
          </div>
        </div>
      </section>

      {/* ===== FOOTER SIMPLE ===== */}
      <footer className="bg-gray-900 text-gray-300 py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm text-gray-400">
            © 2026 GastosNX by NXChile. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </main>
  )
}