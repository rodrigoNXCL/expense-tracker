'use client'

import { useEffect, useState } from 'react'

export default function Home() {
  const [isPWA, setIsPWA] = useState(false)

  useEffect(() => {
    // Detectar si está instalado como PWA
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
    const isIOSStandalone = (window.navigator as any).standalone === true
    setIsPWA(isStandalone || isIOSStandalone)
  }, [])

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="text-center space-y-6 max-w-sm w-full">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-primary">
            📸 ExpenseTracker
          </h1>
          <p className="text-text-muted text-sm">
            Registra gastos capturando boletas con tu cámara
          </p>
        </div>

        {/* Estado PWA */}
        {isPWA ? (
          <div className="bg-success/10 text-success px-4 py-2 rounded-lg text-sm font-medium">
            ✅ App instalada - Modo offline disponible
          </div>
        ) : (
          <div className="bg-warning/10 text-warning px-4 py-2 rounded-lg text-sm font-medium">
            💡 Instala esta app en tu home screen
          </div>
        )}

        {/* Botones principales */}
        <div className="space-y-3 pt-4">
          <button className="w-full btn btn-primary shadow-lg">
            📷 Capturar Gasto
          </button>
          
          <button className="w-full btn btn-outline">
            📋 Ver Historial
          </button>
        </div>

        {/* Info adicional */}
        <div className="pt-6 space-y-2">
          <div className="card text-sm">
            <h3 className="font-semibold mb-2">¿Cómo funciona?</h3>
            <ul className="text-text-muted space-y-1 text-left">
              <li>📸 Toma foto de tu boleta</li>
              <li>🤖 OCR extrae fecha, monto y proveedor</li>
              <li>📝 Clasifica por categoría</li>
              <li>💾 Guarda en Google Sheets</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="fixed bottom-4 text-xs text-text-muted">
        v0.1.0 • NXChile
      </footer>
    </main>
  )
}