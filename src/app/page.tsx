'use client'

import { useState } from 'react'
import CameraCapture from '@/components/CameraCapture'
import OcrProcessor from '@/components/OcrProcessor'
import ExpenseForm from '@/components/ExpenseForm'
import { OcrResult } from '@/lib/ocr'
import { ParsedExpense } from '@/lib/parser'

export default function Home() {
  const [step, setStep] = useState<'capture' | 'review' | 'saved'>('capture')
  const [capturedImage, setCapturedImage] = useState<Blob | null>(null)
  const [ocrResult, setOcrResult] = useState<OcrResult | null>(null)
  const [parsedData, setParsedData] = useState<ParsedExpense | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleImageCapture = (imageBlob: Blob) => {
    setCapturedImage(imageBlob)
    setError(null)
    setStep('capture')
  }

  const handleOcrExtracted = (result: OcrResult) => {
    setOcrResult(result)
    const parsed = parseBoletaChilena(result.fullText, result.confidence)
    setParsedData(parsed)
    setStep('review')
    console.log('Datos parseados:', parsed)
  }

  const handleError = (errorMessage: string) => {
    setError(errorMessage)
    console.error('Error:', errorMessage)
  }

  const handleSaveExpense = (data: ParsedExpense) => {
    console.log('Guardando gasto:', data)
    setStep('saved')
  }

  const handleReset = () => {
    setCapturedImage(null)
    setOcrResult(null)
    setParsedData(null)
    setError(null)
    setStep('capture')
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-4">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-primary">
            📸 controlGASTOS_nxCHILE
          </h1>
          <p className="text-text-muted text-sm">
            Registra gastos capturando boletas con tu cámara
          </p>
        </div>

        {/* Mensajes de estado */}
        {error && (
          <div className="bg-error/10 text-error px-4 py-2 rounded-lg text-sm">
            ⚠️ {error}
          </div>
        )}

        {parsedData && parsedData.monto === 0 && (
          <div className="bg-warning/10 text-warning px-4 py-2 rounded-lg text-sm">
            ⚠️ <strong>Atención:</strong> El monto no fue detectado automáticamente. 
            Por favor ingrésalo manualmente en el formulario.
          </div>
        )}

        {ocrResult && ocrResult.confidence < 60 && (
          <div className="bg-warning/10 text-warning px-4 py-2 rounded-lg text-sm">
            ⚠️ OCR con baja confianza ({ocrResult.confidence.toFixed(0)}%). 
            Revisa bien los datos antes de guardar.
          </div>
        )}

        {/* Paso 1: Captura */}
        {step === 'capture' && (
          <CameraCapture 
            onCapture={handleImageCapture}
            onError={handleError}
          />
        )}

        {/* Paso 2: Procesamiento OCR (invisible) */}
        {capturedImage && !ocrResult && (
          <OcrProcessor
            imageBlob={capturedImage}
            onExtracted={handleOcrExtracted}
            onError={handleError}
          />
        )}

        {/* Paso 3: Formulario de revisión */}
        {step === 'review' && parsedData && (
          <ExpenseForm
            initialData={parsedData}
            onSave={handleSaveExpense}
            onCancel={handleReset}
          />
        )}

        {/* Paso 4: Confirmación de guardado */}
        {step === 'saved' && (
          <div className="card text-center space-y-4">
            <div className="text-5xl">✅</div>
            <h3 className="text-xl font-semibold text-success">¡Gasto Guardado!</h3>
            <p className="text-text-muted">
              Los datos se enviarán a Google Sheets en el próximo paso.
            </p>
            <button onClick={handleReset} className="w-full btn btn-primary">
              📷 Nuevo Gasto
            </button>
          </div>
        )}

        {/* Botón Historial (siempre visible) */}
        {step !== 'review' && (
          <button className="w-full btn btn-outline">
            📋 Ver Historial
          </button>
        )}

        {/* Footer */}
        <p className="text-center text-xs text-text-muted">
          v0.4.1 • NXChile
        </p>
      </div>
    </main>
  )
}

// Import necesario para parseBoletaChilena
import { parseBoletaChilena } from '@/lib/parser'