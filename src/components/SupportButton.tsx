'use client'

import { MessageCircle } from 'lucide-react'

export function SupportButton() {
  const whatsappNumber = '56977412178' // ← CAMBIA POR TU NÚMERO REAL
  const whatsappMessage = 'Hola, necesito información sobre GastosNX'
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 bg-green-500 text-white rounded-full shadow-2xl hover:bg-green-600 hover:scale-110 transition-all duration-300 group"
      aria-label="Contactar por WhatsApp"
    >
      <MessageCircle className="w-7 h-7" />
      <span className="absolute right-full mr-3 px-3 py-1.5 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
        ¿Necesitas ayuda?
      </span>
    </a>
  )
}