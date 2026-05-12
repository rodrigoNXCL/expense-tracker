import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { SupportButton } from '@/components/SupportButton'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter'
})

export const metadata: Metadata = {
  // ✅ SEO OPTIMIZADO
  title: 'GastosNX | Registra gastos deducibles para tu empresa en Chile',
  description: 'Captura, respalda y organiza los gastos menores de tu empresa. Descuéntalos en tu Declaración de Renta ante el SII. Hecho para pymes y contadores en Chile.',
  keywords: ['gastos deducibles', 'pymes Chile', 'SII', 'declaración de renta', 'gastos operacionales', 'contadores Chile', 'respaldo boletas', 'gastos menores'],
  authors: [{ name: 'NXChile' }],
  openGraph: {
    title: 'GastosNX | Registra gastos deducibles para tu empresa en Chile',
    description: 'Captura, respalda y organiza los gastos menores de tu empresa. Descuéntalos en tu Declaración de Renta ante el SII.',
    type: 'website',
    locale: 'es_CL',
    siteName: 'GastosNX',
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'GastosNX'
  },
  robots: {
    index: true,
    follow: true,
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
        <meta name="apple-mobile-web-app-title" content="GastosNX" />
      </head>
      <body className="font-sans antialiased min-h-screen">
        {children}
        <SupportButton />
      </body>
    </html>
  )
}