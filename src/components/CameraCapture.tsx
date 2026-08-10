'use client'

import { useState, useRef, useEffect } from 'react'
import { Camera, RefreshCw, Check, X } from 'lucide-react'

interface CameraCaptureProps {
  onCapture: (imageBlob: Blob) => void
  onPreview?: (imageUrl: string) => void
  onError?: (error: string) => void
}

export default function CameraCapture({ onCapture, onPreview, onError }: CameraCaptureProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [capturedFile, setCapturedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleCapture = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      onError?.('Selecciona una imagen válida')
      return
    }

    setIsLoading(true)

    // Limpiar preview anterior
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
    setCapturedFile(file)
    onPreview?.(url)

    // Reset input para permitir re-seleccionar
    if (fileInputRef.current) fileInputRef.current.value = ''

    setIsLoading(false)
  }

  const triggerCamera = () => fileInputRef.current?.click()

  const retakePhoto = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(null)
    setCapturedFile(null)
    triggerCamera()
  }

  const cancelPreview = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(null)
    setCapturedFile(null)
  }

  const confirmPhoto = () => {
    if (!capturedFile) {
      onError?.('No hay imagen para confirmar')
      return
    }
    const blob = new Blob([capturedFile], { type: capturedFile.type })
    onCapture(blob)
  }

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  return (
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleCapture}
        className="hidden"
        aria-label="Seleccionar imagen de la boleta"
      />

      {previewUrl ? (
        <div className="space-y-3">
          <div className="relative rounded-2xl overflow-hidden bg-neutral-100 border border-black/5">
            <img
              src={previewUrl}
              alt="Vista previa de la boleta"
              className="w-full max-h-72 object-contain"
            />
            <button
              type="button"
              onClick={cancelPreview}
              aria-label="Descartar imagen"
              className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={retakePhoto}
              className="flex-1 px-4 py-3 rounded-xl border border-neutral-200 text-neutral-700 font-semibold text-sm hover:bg-neutral-50 transition-colors inline-flex items-center justify-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Retomar
            </button>
            <button
              type="button"
              onClick={confirmPhoto}
              className="flex-1 px-4 py-3 rounded-xl bg-neutral-900 text-white font-semibold text-sm hover:bg-neutral-700 transition-colors inline-flex items-center justify-center gap-2"
            >
              <Check className="h-4 w-4" />
              Continuar
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={triggerCamera}
          disabled={isLoading}
          className="w-full px-6 py-5 rounded-2xl border-2 border-dashed border-neutral-300 bg-neutral-50 text-neutral-700 font-semibold hover:border-neutral-900 hover:bg-neutral-100 hover:text-neutral-900 transition-all disabled:opacity-50 flex flex-col items-center justify-center gap-2"
        >
          <span className="w-12 h-12 rounded-full bg-neutral-900 text-white flex items-center justify-center shadow-lg">
            {isLoading ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Camera className="h-5 w-5" />
            )}
          </span>
          <span className="text-base">Capturar Boleta</span>
          <span className="text-xs font-normal text-neutral-500">Usa la cámara o sube una foto</span>
        </button>
      )}

      <p className="text-xs text-neutral-500 text-center">
        Foto nítida y derecha = mejor lectura del OCR
      </p>
    </div>
  )
}