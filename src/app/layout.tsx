import type { Metadata, Viewport } from 'next'
import './globals.css'

// ✅ Metadata principal
export const metadata: Metadata = {
  title: 'ExpenseTracker',
  description: 'Registro ágil de gastos con OCR',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'ExpenseTracker'
  }
}

// ✅ Viewport separado (Next.js 16 requirement)
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#2563eb'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  )
}