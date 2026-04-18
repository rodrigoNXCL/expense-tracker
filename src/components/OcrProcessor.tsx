'use client'

import { useState, useEffect } from 'react'
import { extractTextFromImage, OcrResult } from '@/lib/ocr'

interface OcrProcessorProps {
  imageBlob: Blob | null
  onExtracted: (result: OcrResult) => void
  onError?: (error: string) => void
}

export default function OcrProcessor({ imageBlob, onExtracted, onError }: OcrProcessorProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (imageBlob) {
      processImage()
    }
  }, [imageBlob])

  const processImage = async () => {
    if (!imageBlob) return

    setIsProcessing(true)
    setProgress(0)

    try {
      const result = await extractTextFromImage(imageBlob, setProgress)
      onExtracted(result)
    } catch (error) {
      onError?.(error instanceof Error ? error.message : 'Error procesando imagen')
    } finally {
      setIsProcessing(false)
    }
  }

  if (!isProcessing) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="card max-w-sm w-full space-y-4">
        <div className="text-center space-y-2">
          <div className="text-4xl">🤖</div>
          <h3 className="text-lg font-semibold">Procesando con OCR</h3>
          <p className="text-sm text-text-muted">
            Extrayendo texto de la boleta...
          </p>
        </div>

        {/* Barra de progreso */}
        <div className="space-y-2">
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-center text-sm font-medium text-primary">
            {progress}%
          </p>
        </div>

        <p className="text-xs text-text-muted text-center">
          Esto puede tomar unos segundos
        </p>
      </div>
    </div>
  )
}