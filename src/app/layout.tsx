import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { SupportButton } from '@/components/SupportButton'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter'
})

export const metadata: Metadata = {
  title: 'GastosSII - Control Inteligente de Gastos',
  description: 'Registra boletas con OCR, gestiona gastos empresariales y cumple con el SII. Simple, rápido y seguro.',
  keywords: ['gastos', 'boletas', 'SII', 'Chile', 'OCR', 'contabilidad', 'empresas'],
  authors: [{ name: 'NXChile' }],
  openGraph: {
    title: 'GastosSII - Control Inteligente de Gastos',
    description: 'Registra boletas con OCR, gestiona gastos empresariales y cumple con el SII.',
    type: 'website',
    locale: 'es_CL',
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'GastosSII'
  }
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#10b981'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es-CL" className={inter.variable}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="GastosSII" />
      </head>
      <body className="font-sans antialiased min-h-screen">
        {children}
        <SupportButton />
      </body>
    </html>
  )
}