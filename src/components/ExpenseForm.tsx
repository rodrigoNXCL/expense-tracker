'use client'

import { useState, useEffect } from 'react'
import { ParsedExpense } from '@/lib/parser'
import { getSession } from '@/lib/auth'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Alert } from '@/components/ui/Alert'
import { AlertCircle, CheckCircle, XCircle, Loader2 } from 'lucide-react'

interface ExpenseFormProps {
  initialData: ParsedExpense
  onSave: (data: ParsedExpense) => Promise<void>
  onCancel: () => void
  isSubmitting?: boolean
}

const CATEGORIAS = [
  'Combustible',
  'Estacionamiento',
  'Peaje',
  'Alimentación',
  'Mantención Vehículo',
  'Suministros',
  'Servicios',
  'Otros',
]

export default function ExpenseForm({ 
  initialData, 
  onSave, 
  onCancel,
  isSubmitting: parentIsSubmitting = false
}: ExpenseFormProps) {
  const [formData, setFormData] = useState<ParsedExpense>(initialData)
  const [categoria, setCategoria] = useState<string>('Combustible')
  const [notas, setNotas] = useState<string>('')
  const [isValid, setIsValid] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const session = getSession()
    setUser(session)
  }, [])

  const porcentajeUsado = user ? (user.boletas_usadas / user.limite_boletas) * 100 : 0
  const boletasRestantes = user ? user.limite_boletas - user.boletas_usadas : 0
  const limiteAlcanzado = porcentajeUsado >= 100

  useEffect(() => {
    const isValidForm = formData.monto > 0 && formData.fecha.length > 0 && categoria.length > 0
    setIsValid(isValidForm)
  }, [formData, categoria])

  const handleChange = (field: keyof ParsedExpense, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (submitError) setSubmitError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // ✅ Prevenir doble submit
    if (parentIsSubmitting || limiteAlcanzado) return
    
    if (!isValid) {
      setSubmitError('Por favor completa todos los campos requeridos')
      return
    }

    try {
      await onSave({ ...formData, categoria, notas })
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Error desconocido')
    }
  }

  const getAlertConfig = () => {
    if (limiteAlcanzado) {
      return {
        variant: 'error' as const,
        icon: <XCircle className="h-4 w-4" />,
        title: 'Límite alcanzado',
        message: `Has usado ${user.boletas_usadas} de ${user.limite_boletas} boletas`,
        bg: 'bg-red-50 border-red-200 text-red-800'
      }
    }
    if (porcentajeUsado >= 90) {
      return {
        variant: 'warning' as const,
        icon: <AlertCircle className="h-4 w-4" />,
        title: 'Casi llegas al límite',
        message: `Te quedan ${boletasRestantes} boletas`,
        bg: 'bg-amber-50 border-amber-200 text-amber-800'
      }
    }
    if (porcentajeUsado >= 80) {
      return {
        variant: 'info' as const,
        icon: <AlertCircle className="h-4 w-4" />,
        title: 'Uso elevado',
        message: `Te quedan ${boletasRestantes} boletas`,
        bg: 'bg-blue-50 border-blue-200 text-blue-800'
      }
    }
    return {
      variant: 'success' as const,
      icon: <CheckCircle className="h-4 w-4" />,
      title: 'Boletas disponibles',
      message: `${boletasRestantes} boletas restantes`,
      bg: 'bg-emerald-50 border-emerald-200 text-emerald-800'
    }
  }

  const alertConfig = getAlertConfig()

  return (
    <Card className="border-emerald-100 shadow-lg shadow-emerald-500/5">
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 px-6 py-4 border-b border-emerald-100">
        <h3 className="font-bold text-gray-900 flex items-center gap-2">
          <span className="text-xl">✏️</span>
          Revisar Datos
        </h3>
      </div>
      
      <CardContent className="p-6 space-y-5">
        {/* Alerta de Límite */}
        {user && (
          <div className={`rounded-lg border p-3 ${alertConfig.bg}`}>
            <div className="flex items-start gap-2">
              {alertConfig.icon}
              <div className="flex-1">
                <p className="font-medium text-sm">{alertConfig.title}</p>
                <p className="text-xs mt-0.5 opacity-90">{alertConfig.message}</p>
              </div>
            </div>
          </div>
        )}

        {submitError && (
          <Alert variant="error">
            <XCircle className="h-4 w-4" />
            <span className="text-sm">{submitError}</span>
          </Alert>
        )}

        <div className="space-y-4">
          {/* Proveedor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Proveedor <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.proveedor}
              onChange={(e) => handleChange('proveedor', e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
              placeholder="Ej: COPEC S.A."
              disabled={parentIsSubmitting || limiteAlcanzado}
            />
          </div>

          {/* RUT */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              RUT <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.rut}
              onChange={(e) => handleChange('rut', e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
              placeholder="Ej: 76258687-8"
              disabled={parentIsSubmitting || limiteAlcanzado}
            />
          </div>

          {/* Fecha y Monto */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Fecha <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.fecha}
                onChange={(e) => handleChange('fecha', e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                disabled={parentIsSubmitting || limiteAlcanzado}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Monto <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={formData.monto === 0 ? '' : formData.monto}
                onChange={(e) => handleChange('monto', e.target.value === '' ? 0 : parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                placeholder="$"
                min="0"
                step="1"
                disabled={parentIsSubmitting || limiteAlcanzado}
              />
              {formData.monto === 0 && (
                <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  Ingresa el monto
                </p>
              )}
            </div>
          </div>

          {/* Categoría */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Categoría <span className="text-red-500">*</span>
            </label>
            <select
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
              disabled={parentIsSubmitting || limiteAlcanzado}
            >
              {CATEGORIAS.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* N° Boleta */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              N° Boleta <span className="text-gray-400 font-normal">(opcional)</span>
            </label>
            <input
              type="text"
              value={formData.boletaNumero}
              onChange={(e) => handleChange('boletaNumero', e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
              placeholder="Ej: 5372609"
              disabled={parentIsSubmitting || limiteAlcanzado}
            />
          </div>

          {/* Notas */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Notas <span className="text-gray-400 font-normal">(opcional)</span>
            </label>
            <textarea
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all resize-none"
              rows={2}
              placeholder="Detalles adicionales..."
              disabled={parentIsSubmitting || limiteAlcanzado}
            />
          </div>

          {/* OCR Confidence */}
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-700">Confianza OCR</p>
              <Badge variant={formData.confidence >= 80 ? 'success' : formData.confidence >= 60 ? 'warning' : 'destructive'}>
                {formData.confidence.toFixed(0)}%
              </Badge>
            </div>
            {formData.confidence < 60 && (
              <p className="text-xs text-amber-600 mt-1.5 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                Revisa bien los datos extraídos
              </p>
            )}
          </div>
        </div>

        {/* Botones de Acción */}
        <div className="flex gap-3 pt-4 border-t border-gray-100">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={parentIsSubmitting || limiteAlcanzado}
            className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            🗑️ Descartar
          </Button>
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={!isValid || parentIsSubmitting || limiteAlcanzado}
            className={`flex-1 ${
              limiteAlcanzado 
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                : 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700'
            }`}
          >
            {parentIsSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Guardando...
              </>
            ) : limiteAlcanzado ? (
              '🚫 Límite'
            ) : (
              '💾 Guardar'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}