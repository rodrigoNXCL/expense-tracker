'use client'

import { useState, useRef } from 'react'

interface CameraCaptureProps {
  onCapture: (imageBlob: Blob) => void
  onPreview?: (imageUrl: string) => void
  onError?: (error: string) => void
}

export default function CameraCapture({ onCapture, onPreview, onError }: CameraCaptureProps) {
  const [isCapturing, setIsCapturing] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleCapture = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      onError?.('Por favor selecciona una imagen válida')
      return
    }

    setIsCapturing(true)

    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
    onPreview?.(url)

    onCapture(file)
    
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    setIsCapturing(false)
  }

  const triggerCamera = () => {
    fileInputRef.current?.click()
  }

  const retakePhoto = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
    }
    triggerCamera()
  }

  useState(() => () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
  })

  return (
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleCapture}
        className="hidden"
        aria-label="Capturar imagen con cámara"
      />

      {/* Preview de imagen capturada */}
      {previewUrl && (
        <div className="card p-3 space-y-3">
          <div className="relative rounded-lg overflow-hidden bg-gray-100 aspect-video flex items-center justify-center">
            <img 
              src={previewUrl} 
              alt="Vista previa" 
              className="max-h-48 object-contain"
            />
          </div>
          
          <div className="flex gap-2">
            <button
              type="button"
              onClick={retakePhoto}
              className="flex-1 btn btn-outline text-sm py-2"
            >
              🔄 Retomar
            </button>
            <button
              type="button"
              onClick={() => onCapture(previewUrlToBlob(previewUrl))}
              className="flex-1 btn btn-primary text-sm py-2"
            >
              ✅ Confirmar
            </button>
          </div>
        </div>
      )}

      {/* Botón principal (solo si no hay preview) */}
      {!previewUrl && (
        <button
          type="button"
          onClick={triggerCamera}
          onTouchStart={(e) => e.preventDefault()}
          disabled={isCapturing}
          className="w-full btn btn-primary shadow-lg disabled:opacity-50 active:scale-95 transition-transform"
        >
          {isCapturing ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Procesando...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2 text-lg">
              📷 Capturar Boleta
            </span>
          )}
        </button>
      )}

      {/* Tips de calidad de foto */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-2">
        <p className="text-xs font-semibold text-blue-800">💡 Tips para mejor OCR:</p>
        <ul className="text-xs text-blue-700 space-y-1 text-left">
          <li>📱 Usa <strong>zoom 2x</strong> si la boleta es pequeña</li>
          <li>💡 Busca buena iluminación (sin sombras)</li>
          <li>📐 Mantén la boleta plana y centrada</li>
          <li>🎯 Enfoca bien antes de capturar</li>
        </ul>
      </div>

      <p className="text-xs text-text-muted text-center">
        {previewUrl ? 'Confirma o retoma la foto' : 'Usa la cámara trasera • Foto nítida = mejor OCR'}
      </p>
    </div>
  )
}

function previewUrlToBlob(url: string): Blob {
  return new Blob()
}