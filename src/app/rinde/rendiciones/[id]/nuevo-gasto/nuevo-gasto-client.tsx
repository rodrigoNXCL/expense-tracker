'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft, Save, Loader2, Camera, CheckCircle, Receipt,
  AlertCircle, Sparkles
} from 'lucide-react'
import type { SessionPayload } from '@/lib/session'
import CameraCapture from '@/components/CameraCapture'
import OcrProcessor from '@/components/OcrProcessor'
import { parseBoletaChilena } from '@/lib/parser'
import type { OcrResult } from '@/lib/ocr'

interface Props {
  session: SessionPayload & { tipo_usuario?: string }
  rendicionId: string
}

type Step = 'capture' | 'review' | 'saved'

export default function NuevoGastoClient({ session, rendicionId }: Props) {
  const router = useRouter()
  const [step, setStep] = useState<Step>('capture')
  const [capturedImage, setCapturedImage] = useState<Blob | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(undefined)
  const [showOcr, setShowOcr] = useState(false)
  const [ocrResult, setOcrResult] = useState<OcrResult | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    fecha: new Date().toISOString().split('T')[0],
    rut: '',
    proveedor: '',
    monto: '',
    categoria: 'colación',
    boleta_numero: '',
    giro: '',
    notas: '',
    tipo_documento: 'boleta',
  })

  const handleImageCapture = (imageBlob: Blob) => {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(URL.createObjectURL(imageBlob))
    setCapturedImage(imageBlob)
    setError(null)
    setShowOcr(true)
  }

  const handleOcrExtracted = (result: OcrResult) => {
    setOcrResult(result)
    const parsed = parseBoletaChilena(result.text, result.confidence)
    setForm((prev) => ({
      ...prev,
      fecha: parsed.fecha || prev.fecha,
      rut: parsed.rut || prev.rut,
      proveedor: parsed.proveedor !== 'Proveedor no detectado' ? parsed.proveedor : prev.proveedor,
      monto: parsed.monto ? String(parsed.monto) : prev.monto,
      giro: parsed.giro || prev.giro,
      boleta_numero: parsed.boletaNumero || prev.boleta_numero,
      categoria: parsed.categoria || prev.categoria,
      tipo_documento: parsed.tipoDocumento,
    }))
    setShowOcr(false)
    setStep('review')
  }

  const handleOcrError = (errorMessage: string) => {
    setError(errorMessage)
    setShowOcr(false)
    setStep('review')
  }

  const handleRetake = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(undefined)
    setCapturedImage(null)
    setOcrResult(null)
    setError(null)
    setShowOcr(false)
    setForm((prev) => ({
      ...prev,
      rut: '',
      proveedor: '',
      monto: '',
      boleta_numero: '',
      giro: '',
    }))
    setStep('capture')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const formData = new FormData()
      if (capturedImage) {
        formData.append('image', capturedImage, 'receipt.jpg')
      }
      formData.append('data', JSON.stringify({
        rendicion_id: rendicionId,
        ...form,
        monto: parseFloat(form.monto) || 0,
        ocr_confidence: ocrResult?.confidence || 0,
      }))

      const res = await fetch('/api/rinde/gastos', {
        method: 'POST',
        credentials: 'same-origin',
        body: formData,
      })
      const data = await res.json()
      if (res.ok) {
        setStep('saved')
      } else {
        setError(data.error || 'Error al guardar')
      }
    } catch {
      setError('Error de conexión')
    } finally {
      setSaving(false)
    }
  }

  const goBack = () => {
    if (step !== 'capture' && capturedImage) {
      handleRetake()
      return
    }
    router.push(`/rinde/rendiciones/${rendicionId}`)
  }

  if (step === 'saved') {
    return (
      <div className="min-h-screen bg-slate-50/60 text-slate-800 flex items-center justify-center p-4">
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs max-w-md w-full p-10 text-center space-y-5">
          <div className="w-20 h-20 mx-auto rounded-full bg-emerald-100 flex items-center justify-center">
            <CheckCircle className="h-10 w-10 text-emerald-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">¡Gasto registrado!</h3>
            <p className="text-sm text-slate-500 mt-1">
              El comprobante fue agregado a la rendición correctamente.
            </p>
          </div>
          <div className="space-y-3 pt-2">
            <button
              onClick={handleRetake}
              className="w-full px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <Camera className="w-4 h-4" />
              Registrar Otro Gasto
            </button>
            <button
              onClick={() => router.push(`/rinde/rendiciones/${rendicionId}`)}
              className="w-full px-4 py-2.5 border-2 border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl transition-colors"
            >
              Volver a la Rendición
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50/60 text-slate-800">
      <nav className="bg-white border-b border-slate-200/80 sticky top-0 z-30">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <button
                onClick={goBack}
                className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-800"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-base font-bold text-slate-900">
                  {step === 'review' ? 'Revisar Comprobante' : 'Nuevo Gasto'}
                </h1>
                <p className="text-xs text-slate-500">Agregar comprobante a la rendición</p>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl p-3 text-sm flex items-start gap-2">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <div className="flex-1">
              {error}
              {step === 'review' && (
                <button
                  onClick={handleRetake}
                  className="block mt-2 text-xs font-semibold underline underline-offset-2"
                >
                  Intentar con otra imagen
                </button>
              )}
            </div>
          </div>
        )}

        {step === 'capture' && (
          <div className="space-y-5">
            <div className="text-center space-y-2">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-amber-500 rounded-2xl text-white shadow-lg shadow-amber-500/20">
                <Receipt className="h-7 w-7" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Capturar Comprobante</h2>
                <p className="text-sm text-slate-500">
                  Fotografía la boleta, factura o voucher para leerla con OCR
                </p>
              </div>
            </div>
            <CameraCapture onCapture={handleImageCapture} onError={setError} onPreview={setPreviewUrl} />
          </div>
        )}

        {showOcr && <OcrProcessor imageBlob={capturedImage} onExtracted={handleOcrExtracted} onError={handleOcrError} />}

        {step === 'review' && (
          <form onSubmit={handleSubmit} className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Verifica los datos</h2>
                <p className="text-xs text-slate-500">Corrige lo que el OCR no leyó correctamente</p>
              </div>
              {ocrResult && (
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${
                  ocrResult.confidence >= 80
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60'
                    : 'bg-amber-50 text-amber-700 border-amber-200/60'
                }`}>
                  <Sparkles className="w-3 h-3" />
                  OCR {ocrResult.confidence.toFixed(0)}%
                </span>
              )}
            </div>

            {previewUrl && (
              <div className="flex items-start gap-3 bg-slate-50 border border-slate-200/80 rounded-xl p-3">
                <img
                  src={previewUrl}
                  alt="Vista previa del comprobante"
                  className="w-20 h-20 object-cover rounded-lg border border-slate-200"
                />
                <button
                  type="button"
                  onClick={handleRetake}
                  className="text-xs font-semibold text-amber-600 hover:text-amber-800 underline underline-offset-2 mt-1"
                >
                  Cambiar imagen
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Fecha *</label>
                <input
                  type="date"
                  value={form.fecha}
                  onChange={(e) => setForm({ ...form, fecha: e.target.value })}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">RUT</label>
                <input
                  type="text"
                  value={form.rut}
                  onChange={(e) => setForm({ ...form, rut: e.target.value })}
                  placeholder="12.345.678-9"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Proveedor *</label>
                <input
                  type="text"
                  value={form.proveedor}
                  onChange={(e) => setForm({ ...form, proveedor: e.target.value })}
                  required
                  placeholder="Nombre del proveedor"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Monto *</label>
                <input
                  type="number"
                  value={form.monto}
                  onChange={(e) => setForm({ ...form, monto: e.target.value })}
                  required
                  min="0"
                  placeholder="0"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Categoría</label>
                <select
                  value={form.categoria}
                  onChange={(e) => setForm({ ...form, categoria: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="colación">Colación</option>
                  <option value="transporte">Transporte</option>
                  <option value="peaje">Peaje</option>
                  <option value="estacionamiento">Estacionamiento</option>
                  <option value="combustible">Combustible</option>
                  <option value="hospedaje">Hospedaje</option>
                  <option value="oficina">Oficina</option>
                  <option value="otro">Otro</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Tipo de Documento *</label>
                <select
                  value={form.tipo_documento}
                  onChange={(e) => setForm({ ...form, tipo_documento: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="boleta">Boleta</option>
                  <option value="factura">Factura</option>
                  <option value="voucher">Voucher</option>
                  <option value="sin_comprobante">Sin Comprobante</option>
                </select>
                <p className="text-xs mt-1 text-slate-400">
                  {form.tipo_documento === 'boleta' || form.tipo_documento === 'voucher'
                    ? 'Pasará al puente de GastosNX'
                    : 'No pasa al puente de GastosNX'}
                </p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">N° Comprobante</label>
                <input
                  type="text"
                  value={form.boleta_numero}
                  onChange={(e) => setForm({ ...form, boleta_numero: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Notas</label>
                <textarea
                  value={form.notas}
                  onChange={(e) => setForm({ ...form, notas: e.target.value })}
                  rows={2}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={goBack}
                disabled={saving}
                className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl shadow-xs transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Guardar Gasto
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
