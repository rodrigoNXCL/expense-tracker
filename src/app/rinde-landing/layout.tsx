import type { Metadata, Viewport } from 'next'

export const metadata: Metadata = {
  title: 'RindeNX - Rendiciones cuadradas para fondos por rendir',
  description: 'Digitaliza los fondos por rendir de tu empresa: asigna fondos, rinde gastos con OCR y obtén el asiento contable automático. Desarrollado por NXChile.',
  keywords: ['rendiciones', 'fondos por rendir', 'caja chica', 'asiento contable', 'Chile', 'NXChile', 'rendimiento de cuentas'],
  authors: [{ name: 'NXChile' }],
  // Canonical propio: el layout raíz lo declara hacia gastos.nxchile.com, y
  // sin esto la landing de RindeNX se canonizaría contra el dominio hermano.
  alternates: {
    canonical: 'https://rinde.nxchile.com',
  },
  openGraph: {
    title: 'RindeNX - Rendiciones cuadradas para fondos por rendir',
    description: 'Asigna fondos, rinde con OCR y obtén el asiento contable automático. Desarrollado por NXChile.',
    type: 'website',
    locale: 'es_CL',
    siteName: 'RindeNX',
    url: 'https://rinde.nxchile.com',
    images: [
      {
        url: 'https://rinde.nxchile.com/images/hero_principal.webp',
        width: 1200,
        height: 630,
        alt: 'RindeNX - Rendiciones cuadradas',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RindeNX - Rendiciones cuadradas para fondos por rendir',
    description: 'Asigna fondos, rinde con OCR y obtén el asiento contable automático. Desarrollado por NXChile.',
    images: ['https://rinde.nxchile.com/images/hero_principal.webp'],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/icon-192.png',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  // Sin maximumScale/userScalable: bloquear el zoom impide leer el contenido
  // en móvil y rompe accesibilidad (WCAG 1.4.4).
  themeColor: '#f59e0b',
}

export default function RindeLandingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}