// src/components/SupportButton.tsx
'use client'

import { MessageCircle } from 'lucide-react'

export function SupportButton() {
  const whatsappNumber = '56977412178' // Tu número
  const message = encodeURIComponent('Hola! Tengo una consulta sobre GastosSII')
  
  return (
    <a
      href={`https://wa.me/${whatsappNumber}?text=${message}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-24 right-6 z-50 w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white shadow-lg hover:shadow-xl hover:scale-110 transition-all sm:hidden"
    >
      <MessageCircle className="w-6 h-6" />
    </a>
  )
}