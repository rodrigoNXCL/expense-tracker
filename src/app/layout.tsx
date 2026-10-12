import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { SupportButton } from '@/components/SupportButton'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter'
})

/**
 * Google Analytics 4 (opcional).
 *
 * Se carga solo si existe `NEXT_PUBLIC_GA4_ID`. Sin esa variable no se inyecta
 * ningún script: la landing funciona igual y sin dependencias externas.
 *
 * Con el ID configurado, los eventos que ya dispara la página de precios
 * (`BillingToggle`, `PlanClick`) pasan a registrarse. Esos eventos hoy existen
 * en el código pero nunca se disparan porque no había ningún gtag cargado.
 */
const GA4_ID = process.env.NEXT_PUBLIC_GA4_ID

export const metadata: Metadata = {
  metadataBase: new URL('https://gastos.nxchile.com'),
  title: 'Control de Gastos Operacionales y Boletas para Empresas | GastosNX',
  description: 'Registra boletas, vouchers y gastos operacionales desde el celular. Conserva los respaldos, organiza la información y facilita la revisión de tu contador.',
  keywords: ['gastos operacionales', 'pymes Chile', 'contadores Chile', 'respaldo gastos', 'ordenar boletas', 'control de gastos'],
  authors: [{ name: 'NXChile' }],
  
  openGraph: {
    title: 'GastosNX | Control de gastos operacionales y boletas para empresas',
    description: 'Registra boletas, vouchers y gastos operacionales desde el celular. Conserva los respaldos y facilita la revisión de tu contador.',
    type: 'website',
    locale: 'es_CL',
    siteName: 'GastosNX',
    url: 'https://gastos.nxchile.com',
    images: [
      {
        url: 'https://gastos.nxchile.com/images/hero_principal.webp',
        width: 1200,
        height: 630,
        alt: 'GastosNX - Guarda y organiza gastos',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GastosNX | Control de gastos operacionales y boletas para empresas',
    description: 'Registra boletas, vouchers y gastos operacionales desde el celular. Conserva los respaldos y facilita la revisión de tu contador.',
    images: ['https://gastos.nxchile.com/images/hero_principal.webp'],
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
  // El canonical se resuelve por layout. Este layout raíz sirve a
  // gastos.nxchile.com, que es el dominio principal del repositorio.
  // RindeNX lo sobrescribe en app/rinde-landing/layout.tsx y app/precios.
  // No declarar aquí un <link rel="canonical"> fijo: el layout raíz también
  // lo heredan las páginas de RindeNX y terminaban canonizadas hacia
  // gastos.nxchile.com, lo que impide indexarlas correctamente.
  alternates: {
    canonical: '/',
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/icon-192.png',
  }
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  // Sin maximumScale/userScalable: bloquear el zoom impide leer el contenido
  // en móvil y rompe accesibilidad (WCAG 1.4.4).
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
        {GA4_ID && (
          <>
            <script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`}
            />
            <script
              dangerouslySetInnerHTML={{
                __html: `window.dataLayer=window.dataLayer||[];function.gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA4_ID}');`,
              }}
            />
          </>
        )}
      </head>
      <body className="font-sans antialiased min-h-screen">
        {children}
        <SupportButton />
      </body>
    </html>
  )
}