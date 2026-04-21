'use client'
import { useState, useEffect } from 'react'
import { ParsedExpense } from '@/lib/parser'
import { getSession } from '@/lib/auth'

interface ExpenseFormProps {
  initialData: ParsedExpense
  onSave: (data: ParsedExpense) => void
  onCancel: () => void
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

export default function ExpenseForm({ initialData, onSave, onCancel }: ExpenseFormProps) {
  const [formData, setFormData] = useState<ParsedExpense>(initialData)
  const [categoria, setCategoria] = useState<string>('Combustible')
  const [notas, setNotas] = useState<string>('')
  const [isValid, setIsValid] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

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
  if (!isValid) return
  
  setIsSubmitting(true)
  setSubmitError(null)
  
  try {
    // ✅ Solo llamar al padre, NO guardar aquí
    onSave({ ...formData, categoria, notas })
  } catch (error) {
    console.error('❌ Error:', error)
    setSubmitError(error instanceof Error ? error.message : 'Error desconocido')
  } finally {
    setIsSubmitting(false)
  }
}

  return (
    <form onSubmit={handleSubmit} className="card space-y-4 text-left">
      <h3 className="font-semibold text-lg text-center">✏️ Revisar y Editar Datos</h3>
      
      {submitError && (
        <div className="bg-error/10 text-error px-4 py-2 rounded-lg text-sm">
          ⚠️ {submitError}
        </div>
      )}

      {/* Proveedor */}
      <div>
        <label className="block text-sm font-medium mb-1">Proveedor / Razón Social</label>
        <input
          type="text"
          value={formData.proveedor}
          onChange={(e) => handleChange('proveedor', e.target.value)}
          className="input"
          placeholder="Ej: COPEC S.A."
          disabled={isSubmitting}
        />
      </div>

      {/* RUT */}
      <div>
        <label className="block text-sm font-medium mb-1">RUT</label>
        <input
          type="text"
          value={formData.rut}
          onChange={(e) => handleChange('rut', e.target.value)}
          className="input"
          placeholder="Ej: 76258687-8"
          disabled={isSubmitting}
        />
      </div>

      {/* Fecha y Monto */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium mb-1">Fecha</label>
          <input
            type="date"
            value={formData.fecha}
            onChange={(e) => handleChange('fecha', e.target.value)}
            className="input"
            disabled={isSubmitting}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Monto Total ($)</label>
          <input
            type="number"
            value={formData.monto === 0 ? '' : formData.monto}
            onChange={(e) => {
              const value = e.target.value
              handleChange('monto', value === '' ? 0 : parseFloat(value) || 0)
            }}
            className="input"
            placeholder="Ingresa monto"
            min="0"
            step="1"
            disabled={isSubmitting}
          />
          {formData.monto === 0 && (
            <p className="text-xs text-warning mt-1">⚠️ Ingresa el monto total</p>
          )}
        </div>
      </div>

      {/* Categoría */}
      <div>
        <label className="block text-sm font-medium mb-1">Categoría</label>
        <select
          value={categoria}
          onChange={(e) => setCategoria(e.target.value)}
          className="input"
          disabled={isSubmitting}
        >
          {CATEGORIAS.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Número de Boleta */}
      <div>
        <label className="block text-sm font-medium mb-1">N° Boleta (opcional)</label>
        <input
          type="text"
          value={formData.boletaNumero}
          onChange={(e) => handleChange('boletaNumero', e.target.value)}
          className="input"
          placeholder="Ej: 5372609"
          disabled={isSubmitting}
        />
      </div>

      {/* Notas */}
      <div>
        <label className="block text-sm font-medium mb-1">Notas (opcional)</label>
        <textarea
          value={notas}
          onChange={(e) => setNotas(e.target.value)}
          className="input"
          rows={2}
          placeholder="Detalles adicionales..."
          disabled={isSubmitting}
        />
      </div>

      {/* Confianza del OCR */}
      <div className="bg-gray-50 p-3 rounded-lg text-xs">
        <p className="font-medium">Confianza del OCR: {formData.confidence.toFixed(0)}%</p>
        {formData.confidence < 60 && (
          <p className="text-warning mt-1">⚠️ Revisa bien los datos antes de guardar</p>
        )}
      </div>

      {/* Botones */}
      <div className="flex gap-2 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 btn btn-outline"
          disabled={isSubmitting}
        >
          🗑️ Descartar
        </button>
        <button
          type="submit"
          disabled={!isValid || isSubmitting}
          className="flex-1 btn btn-primary disabled:opacity-50"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Guardando...
            </span>
          ) : (
            '💾 Guardar'
          )}
        </button>
      </div>
    </form>
  )
}