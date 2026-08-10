'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import CameraCapture from '@/components/CameraCapture'
import OcrProcessor from '@/components/OcrProcessor'
import ExpenseForm from '@/components/ExpenseForm'
import { OcrResult } from '@/lib/ocr'
import { ParsedExpense } from '@/lib/parser'
import { getSession, loadSession, logout, saveSession } from '@/lib/auth'
import { parseBoletaChilena } from '@/lib/parser'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Alert } from '@/components/ui/Alert'
import {
  CheckCircle, AlertCircle, XCircle, Camera,
  ArrowLeft, LogOut, Loader2, Sparkles, Receipt
} from 'lucide-react'

// Clave para persistir el borrador en la pestaña (sessionStorage)
const DRAFT_KEY = 'captura_borrador_v1'

// Helpers para convertir imagen entre Blob y dataURL (persistencia del borrador)
function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(blob)
  })
}

function dataUrlToBlob(dataUrl: string, mime: string | null): Blob {
  const byteString = atob(dataUrl.split(',')[1])
  const mimeType = mime || 'image/jpeg'
  const bytes = new Uint8Array(byteString.length)
  for (let i = 0; i < byteString.length; i++) {
    bytes[i] = byteString.charCodeAt(i)
  }
  return new Blob([bytes], { type: mimeType })
}

interface DraftData {
  step: 'review'
  imageDataUrl: string | null
  imageMime: string | null
  ocrResult: OcrResult | null
  parsedData: ParsedExpense | null
}

export default function CapturaPage() {
  const router = useRouter()
  const [step, setStep] = useState<'capture' | 'review' | 'saved'>('capture')
  const [capturedImage, setCapturedImage] = useState<Blob | null>(null)
  const [ocrResult, setOcrResult] = useState<OcrResult | null>(null)
  const [parsedData, setParsedData] = useState<ParsedExpense | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [showOcr, setShowOcr] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(undefined)

  // Restaurar borrador al montar (para que no se pierda la captura al recargar)
  useEffect(() => {
    ;(async () => {
      const session = await loadSession()
      if (!session || !session.activo) {
        router.replace('/login')
        return
      }
      setUser(session)

      try {
        const raw = sessionStorage.getItem(DRAFT_KEY)
        if (raw) {
          const draft: DraftData = JSON.parse(raw)
          if (draft.step === 'review' && draft.parsedData && draft.ocrResult) {
            setParsedData(draft.parsedData)
            setOcrResult(draft.ocrResult)
            setCapturedImage(draft.imageDataUrl ? dataUrlToBlob(draft.imageDataUrl, draft.imageMime) : null)
            setStep('review')
          }
        }
      } catch (e) {
        // Borrador corrupto: se ignora
        sessionStorage.removeItem(DRAFT_KEY)
      }

      setIsCheckingAuth(false)
    })()
  }, [router])

  // Persistir borrador cuando el usuario llega al paso de revisión
  useEffect(() => {
    let cancelled = false
    if (step === 'review' && parsedData && ocrResult) {
      ;(async () => {
        let imageDataUrl: string | null = null
        let imageMime: string | null = null
        if (capturedImage) {
          try {
            imageDataUrl = await blobToDataUrl(capturedImage)
            imageMime = capturedImage.type
          } catch { /* noop */ }
        }
        if (cancelled) return
        const draft: DraftData = { step: 'review', imageDataUrl, imageMime, ocrResult, parsedData }
        try { sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft)) }
        catch { /* Quota excedida: se omite */ }
      })()
    }
    return () => { cancelled = true }
  }, [step, parsedData, ocrResult, capturedImage])

  const porcentajeUsado = user ? (user.boletas_usadas / user.limite_boletas) * 100 : 0
  const boletasRestantes = user ? user.limite_boletas - user.boletas_usadas : 0
  const limiteAlcanzado = porcentajeUsado >= 100

  const handleImageCapture = (imageBlob: Blob) => {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    const url = URL.createObjectURL(imageBlob)
    setPreviewUrl(url)
    setCapturedImage(imageBlob)
    setError(null)
    setShowOcr(true)
  }

  const handleOcrExtracted = (result: OcrResult) => {
    setOcrResult(result)
    const parsed = parseBoletaChilena(result.text, result.confidence)
    setParsedData(parsed)
    setShowOcr(false)
    setStep('review')
  }

  const handleError = (errorMessage: string) => {
    setError(errorMessage)
    setShowOcr(false)
  }

  const handleSaveExpense = async (data: ParsedExpense) => {
    setIsSubmitting(true)
    setError(null)

    const session = getSession()
    if (!session) {
      setError('No hay sesión activa')
      setIsSubmitting(false)
      return
    }

    try {
      const formData = new FormData()
      if (capturedImage) {
        formData.append('image', capturedImage, 'receipt.jpg')
      }
      // ADR-002: la sesión (email/sheet/rol/límite) la resuelve el servidor desde la cookie
      formData.append('data', JSON.stringify({
        fecha: data.fecha,
        rut: data.rut,
        proveedor: data.proveedor,
        monto: data.monto,
        categoria: data.categoria,
        boleta_numero: data.boletaNumero,
        giro: data.giro,
        notas: data.notas,
        ocr_confidence: data.confidence,
      }))

      const response = await fetch('/api/save-expense', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()
      if (!response.ok) {
        throw new Error(result.error || 'Error al guardar el gasto')
      }

      const updatedSession = { ...session, boletas_usadas: result.boletas_usadas }
      saveSession(updatedSession)
      setUser(updatedSession)
      clearDraft()
      setStep('saved')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReset = () => {
    clearDraft()
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(undefined)
    setCapturedImage(null)
    setOcrResult(null)
    setParsedData(null)
    setError(null)
    setShowOcr(false)
    setStep('capture')
  }

  // Re-fotografiar conservando el OCR ya extraído (vuelve a capturar nueva imagen)
  const handleRetake = () => {
    clearDraft()
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(undefined)
    setCapturedImage(null)
    setError(null)
    setShowOcr(false)
    setStep('capture')
  }

  const handleLogout = async () => {
    clearDraft()
    await logout()
    router.replace('/login')
  }

  const clearDraft = () => {
    try { sessionStorage.removeItem(DRAFT_KEY) } catch { /* noop */ }
  }

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-teal-50">
        <Card className="text-center p-8 space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground font-medium">Verificando sesión...</p>
        </Card>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      {/* ===== NAVBAR ===== */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-black/5 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Image
              src="/images/LogogastosNX.png"
              alt="GastosNX"
              width={693}
              height={138}
              priority
              loading="eager"
              className="h-9 w-auto object-contain"
            />
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/dashboard')}
                className="text-gray-600 hover:text-emerald-600"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Dashboard</span>
                <span className="sm:hidden">Dashboard</span>
              </Button>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Salir</span>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {user && limiteAlcanzado && (
          <Alert variant="error">
            <XCircle className="h-5 w-5" />
            <div>
              <p className="font-semibold">Límite Alcanzado</p>
              <p className="text-sm mt-1">
                Has usado {user.boletas_usadas} de {user.limite_boletas} boletas.
                Contacta a tu administrador.
              </p>
            </div>
          </Alert>
        )}

        {user && porcentajeUsado >= 80 && !limiteAlcanzado && (
          <Alert variant={porcentajeUsado >= 90 ? 'warning' : 'info'}>
            <AlertCircle className="h-5 w-5" />
            <div>
              <p className="font-semibold">
                {porcentajeUsado >= 90 ? '⚠️ Casi llegas al límite' : 'ℹ️ Uso elevado'}
              </p>
              <p className="text-sm mt-1">
                Te quedan {boletasRestantes} boletas ({porcentajeUsado.toFixed(0)}% usado)
              </p>
            </div>
          </Alert>
        )}

        {error && (
          <Alert variant="error">
            <XCircle className="h-5 w-5" />
            <span>{error}</span>
          </Alert>
        )}

        {step === 'capture' && (
          <div className="space-y-5">
            {limiteAlcanzado ? (
              <Card className="text-center p-12 space-y-6">
                <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-red-100 to-rose-100 flex items-center justify-center">
                  <XCircle className="h-10 w-10 text-red-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    No puedes registrar más boletas
                  </h3>
                  <p className="text-gray-500">
                    Has alcanzado el límite de {user.limite_boletas} boletas este mes
                  </p>
                </div>
                <Button
                  onClick={() => router.push('/dashboard')}
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold"
                >
                  Volver al Dashboard
                </Button>
              </Card>
            ) : (
              <>
                <div className="text-center space-y-2">
                  <div className="inline-flex items-center justify-center w-14 h-14 bg-neutral-900 rounded-2xl text-white shadow-lg">
                    <Receipt className="h-7 w-7" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Nueva Boleta</h2>
                    <p className="text-sm text-gray-500">
                      {boletasRestantes} boletas disponibles este mes
                    </p>
                  </div>
                </div>

                <CameraCapture
                  onCapture={handleImageCapture}
                  onError={handleError}
                />
              </>
            )}
          </div>
        )}

        {showOcr && <OcrProcessor imageBlob={capturedImage} onExtracted={handleOcrExtracted} onError={handleError} />}

        {step === 'review' && parsedData && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Revisar Datos</h2>
                <p className="text-sm text-gray-500">Verifica que los datos sean correctos</p>
              </div>
              <Badge variant={ocrResult && ocrResult.confidence >= 80 ? 'success' : 'warning'} className="inline-flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                OCR {ocrResult ? `${ocrResult.confidence.toFixed(0)}%` : ''}
              </Badge>
            </div>
            <ExpenseForm
              initialData={parsedData}
              onSave={handleSaveExpense}
              onCancel={handleRetake}
              isSubmitting={isSubmitting}
              onRetake={handleRetake}
              imagePreviewUrl={previewUrl}
            />
          </div>
        )}

        {step === 'saved' && (
          <Card className="text-center p-12 space-y-6">
            <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center">
              <CheckCircle className="h-10 w-10 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                ¡Boleta Guardada!
              </h3>
              <p className="text-gray-600">
                Los datos fueron registrados exitosamente
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
              <div className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl">
                <p className="text-2xl font-bold text-emerald-600">
                  {user.boletas_usadas}
                </p>
                <p className="text-xs text-gray-600 mt-1">Boletas usadas</p>
              </div>
              <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl">
                <p className="text-2xl font-bold text-blue-600">
                  {boletasRestantes}
                </p>
                <p className="text-xs text-gray-600 mt-1">Restantes</p>
              </div>
            </div>
            <div className="space-y-3 max-w-sm mx-auto">
              <Button
                onClick={handleReset}
                size="lg"
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold shadow-lg shadow-emerald-500/30"
              >
                <Camera className="h-5 w-5 mr-2" />
                Nueva Boleta
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => router.push('/dashboard')}
                className="w-full border-2 border-emerald-500 text-emerald-600 hover:bg-emerald-50 font-semibold"
              >
                Ver Dashboard
              </Button>
            </div>
          </Card>
        )}

        <div className="text-center py-6">
          <p className="text-sm text-gray-500">
            v0.8.0 • GastosNX by NXChile
          </p>
        </div>
      </div>
    </div>
  )
}