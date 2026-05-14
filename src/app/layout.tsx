import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { SupportButton } from '@/components/SupportButton'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter'
})

export const metadata: Metadata = {
  title: 'GastosNX - Guarda y organiza gastos antes de que se pierdan',
  description: 'Guarda y organiza gastos desde el celular antes de que se pierdan. Pensado para pymes y contadores en Chile. Prueba gratis.',
  keywords: ['gastos operacionales', 'pymes Chile', 'contadores Chile', 'respaldo gastos', 'ordenar boletas', 'control de gastos'],
  authors: [{ name: 'NXChile' }],
  
  openGraph: {
    title: 'GastosNX - Guarda y organiza gastos antes de que se pierdan',
    description: 'Guarda y organiza gastos desde el celular antes de que se pierdan. Para pymes y contadores en Chile.',
    type: 'website',
    locale: 'es_CL',
    siteName: 'GastosNX',
    url: 'https://gastos.nxchile.com',
    images: [
      {
        url: 'https://gastos.nxchile.com/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'GastosNX - Guarda y organiza gastos',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GastosNX - Guarda y organiza gastos antes de que se pierdan',
    description: 'Guarda y organiza gastos desde el celular antes de que se pierdan. Para pymes y contadores en Chile.',
    images: ['https://gastos.nxchile.com/images/og-image.jpg'],
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
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/icon-192.png',
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
        <link rel="canonical" href="https://gastos.nxchile.com" />
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