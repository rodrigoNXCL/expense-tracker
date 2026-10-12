import type { Metadata, Viewport } from 'next'

export const metadata: Metadata = {
  title: 'Software de Rendición de Gastos y Fondos por Rendir | RindeNX',
  description:
    'Controla fondos por rendir, registra gastos con respaldo, revisa rendiciones y calcula saldos pendientes. Simplifica el cierre operativo y contable con RindeNX.',
  keywords: ['rendiciones', 'fondos por rendir', 'caja chica', 'asiento contable', 'Chile', 'NXChile', 'rendimiento de cuentas'],
  authors: [{ name: 'NXChile' }],
  // Canonical propio: el layout raíz lo declara hacia gastos.nxchile.com, y
  // sin esto la landing de RindeNX se canonizaría contra el dominio hermano.
  alternates: {
    canonical: 'https://rinde.nxchile.com',
  },
  openGraph: {
    title: 'RindeNX | Software de rendición de gastos para empresas',
    description: 'Controla fondos por rendir, registra gastos con respaldo, revisa rendiciones y calcula saldos pendientes.',
    type: 'website',
    locale: 'es_CL',
    siteName: 'RindeNX',
    url: 'https://rinde.nxchile.com',
    // La imagen la genera `opengraph-image.tsx` (específica de RindeNX).
    // Antes se reutilizaba hero_principal.webp, que es una foto de GastosNX.
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RindeNX | Software de rendición de gastos para empresas',
    description: 'Controla fondos por rendir, registra gastos con respaldo, revisa rendiciones y calcula saldos pendientes.',
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