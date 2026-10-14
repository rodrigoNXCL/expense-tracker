'use client'

import { useSyncExternalStore } from 'react'
import { MessageCircle } from 'lucide-react'
import { isRindeHost } from '@/lib/domains'

const noopSubscribe = () => () => {}

export function SupportButton() {
  const whatsappNumber = '56977412178'
  const product = useSyncExternalStore(
    noopSubscribe,
    () => (isRindeHost() ? 'RindeNX' : 'GastosNX'),
    () => 'GastosNX',
  )

  const whatsappMessage = `Hola, necesito información sobre ${product}`
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-20 md:bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 bg-[#25D366] hover:bg-[#1DA851] text-white rounded-full shadow-2xl hover:scale-110 transition-all group"
      aria-label="Contactar por WhatsApp"
    >
      <MessageCircle className="w-7 h-7" />
      <span className="absolute right-full mr-3 px-3 py-1.5 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
        ¿Necesitas ayuda?
      </span>
    </a>
  )
}
