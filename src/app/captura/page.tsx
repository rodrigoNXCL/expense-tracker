'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import CameraCapture from '@/components/CameraCapture'
import OcrProcessor from '@/components/OcrProcessor'
import ExpenseForm from '@/components/ExpenseForm'
import { OcrResult } from '@/lib/ocr'
import { ParsedExpense } from '@/lib/parser'
import { getSession, logout, saveSession } from '@/lib/auth'
import { parseBoletaChilena } from '@/lib/parser'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Alert } from '@/components/ui/Alert'
import {
  Receipt, Camera, CheckCircle, AlertCircle, XCircle,
  ArrowLeft, LogOut, Loader2, Sparkles
} from 'lucide-react'

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

  useEffect(() => {
    const session = getSession()
    if (!session || !session.activo) {
      router.replace('/login')
      return
    }
    setUser(session)
    setIsCheckingAuth(false)
  }, [router])

  const porcentajeUsado = user ? (user.boletas_usadas / user.limite_boletas) * 100 : 0
  const boletasRestantes = user ? user.limite_boletas - user.boletas_usadas : 0
  const limiteAlcanzado = porcentajeUsado >= 100

  const handleImageCapture = (imageBlob: Blob) => {
    setCapturedImage(imageBlob)
    setError(null)
  }

  const handleOcrExtracted = (result: OcrResult) => {
    setOcrResult(result)
    const parsed = parseBoletaChilena(result.text, result.confidence)
    setParsedData(parsed)
    setStep('review')
  }

  const handleError = (errorMessage: string) => {
    setError(errorMessage)
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
        userEmail: session.email,
        userEmpresa: session.empresa_nombre,
        userPlan: session.plan,
        userLimite: session.limite_boletas,
        userUsadas: session.boletas_usadas,
        userRol: session.rol,
        userSheetId: session.sheet_id_asociado,
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
      setStep('saved')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReset = () => {
    setCapturedImage(null)
    setOcrResult(null)
    setParsedData(null)
    setError(null)
    setStep('capture')
  }

  const handleLogout = () => {
    logout()
    router.replace('/login')
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
      {/* ===== NAVBAR PREMIUM ===== */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-emerald-100/50 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/30">
                <Receipt className="h-5 w-5" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-bold text-gray-900">GastosSII</h1>
                <p className="text-xs text-gray-500">Nueva Boleta</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/dashboard')}
                className="text-gray-600 hover:text-emerald-600"
              >
                <span className="hidden sm:inline">📋 Dashboard</span>
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
          <div className="space-y-6">
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
                <div className="text-center space-y-3">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl text-white shadow-lg shadow-emerald-500/30">
                    <Camera className="h-8 w-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Capturar Boleta</h2>
                    <p className="text-gray-600 mt-1">
                      Toma una foto o sube una imagen de tu boleta
                    </p>
                  </div>
                  <Badge variant="success" className="inline-flex">
                    <Sparkles className="w-3 h-3 mr-1" />
                    OCR Inteligente
                  </Badge>
                </div>

                <CameraCapture 
                  onCapture={handleImageCapture} 
                  onError={handleError} 
                />

                <Card className="p-6 bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-emerald-600" />
                    Consejos para una mejor captura
                  </h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-600 mt-1">•</span>
                      <span>Asegúrate de que la boleta esté bien iluminada</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-600 mt-1">•</span>
                      <span>Mantén la cámara estable y paralela a la boleta</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-600 mt-1">•</span>
                      <span>Incluye todos los bordes de la boleta en la foto</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-600 mt-1">•</span>
                      <span>Evita sombras y reflejos</span>
                    </li>
                  </ul>
                </Card>
              </>
            )}
          </div>
        )}

        {capturedImage && !ocrResult && (
          <OcrProcessor 
            imageBlob={capturedImage} 
            onExtracted={handleOcrExtracted} 
            onError={handleError} 
          />
        )}

        {step === 'review' && parsedData && (
          <div className="space-y-6">
            <div className="text-center space-y-3">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl text-white shadow-lg shadow-blue-500/30">
                <CheckCircle className="h-8 w-8" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Revisar Datos</h2>
                <p className="text-gray-600 mt-1">
                  Verifica que los datos extraídos sean correctos
                </p>
              </div>
            </div>

            <ExpenseForm 
              initialData={parsedData} 
              onSave={handleSaveExpense}
              onCancel={handleReset}
              isSubmitting={isSubmitting}
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
                Los datos fueron registrados exitosamente en Google Sheets
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
              <Card className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200">
                <p className="text-2xl font-bold text-emerald-600">
                  {user.boletas_usadas}
                </p>
                <p className="text-xs text-gray-600 mt-1">Boletas usadas</p>
              </Card>
              <Card className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
                <p className="text-2xl font-bold text-blue-600">
                  {boletasRestantes}
                </p>
                <p className="text-xs text-gray-600 mt-1">Restantes</p>
              </Card>
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
                📋 Ver Dashboard
              </Button>
            </div>
          </Card>
        )}

        <div className="text-center py-6">
          <p className="text-sm text-gray-500">
            v0.8.0 • GastosSII by NXChile
          </p>
        </div>
      </div>
    </div>
  )
}