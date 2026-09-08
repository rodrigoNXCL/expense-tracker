'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft, ArrowRight, FileText, DollarSign, Receipt,
  ExternalLink, Loader2, CheckCircle, Calendar
} from 'lucide-react'
import type { SessionPayload } from '@/lib/session'

interface DocumentoPuente {
  puente_id: string
  gasto: {
    id: string
    fecha: string
    rut: string
    proveedor: string
    monto: number
    categoria: string
    boleta_numero: string
    giro: string
    notas: string
    image_url: string
    creado_por: string
  } | null
  rendicion: {
    id: string
    descripcion: string
    usuario_email: string
    estado: string
    fecha_creacion: string
    fecha_cierre: string
  } | null
  gastos_sheet_id: string
  gastos_row_number: number
  pasado_en: string
  aprobado_por: string
}

interface Props {
  session: SessionPayload & { tipo_usuario?: string }
}

export default function PuenteDocumentosClient({ session }: Props) {
  const router = useRouter()
  const [documentos, setDocumentos] = useState<DocumentoPuente[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filterRendicion, setFilterRendicion] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    load()
  }, [])

  const load = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/rinde/puente/documentos', { credentials: 'same-origin' })
      const data = await res.json()
      if (res.ok) {
        setDocumentos(data.documentos || [])
      } else {
        setError(data.error || 'Error al cargar')
      }
    } catch {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  const rendicionesUnicas = Array.from(
    new Set(documentos.map((d) => d.rendicion?.id).filter(Boolean))
  )

  const filtered = documentos.filter((d) => {
    if (filterRendicion && d.rendicion?.id !== filterRendicion) return false
    if (search) {
      const s = search.toLowerCase()
      const matchProv = d.gasto?.proveedor?.toLowerCase().includes(s)
      const matchRut = d.gasto?.rut?.toLowerCase().includes(s)
      const matchCat = d.gasto?.categoria?.toLowerCase().includes(s)
      if (!matchProv && !matchRut && !matchCat) return false
    }
    return true
  })

  const totalMonto = filtered.reduce((sum, d) => sum + (d.gasto?.monto || 0), 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50">
      <nav className="bg-white border-b border-amber-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push('/rinde')}
                className="p-2 hover:bg-amber-50 rounded-lg text-amber-600"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/30">
                <ArrowRight className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">Puente de Documentos</h1>
                <p className="text-xs text-gray-500">RindeNX → GastosNX</p>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-xl p-3 text-sm">
            {error}
          </div>
        )}

        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 rounded-2xl p-6 text-white">
          <h2 className="text-2xl font-bold mb-1">Documentos traspasados a GastosNX</h2>
          <p className="text-amber-50">
            Gastos menores aprobados en tus rendiciones que se replicaron en la línea de Gastos
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white border border-amber-100 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Documentos</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{documentos.length}</p>
              </div>
              <Receipt className="h-10 w-10 text-amber-500" />
            </div>
          </div>
          <div className="bg-white border border-amber-100 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Monto Total</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  ${documentos.reduce((s, d) => s + (d.gasto?.monto || 0), 0).toLocaleString('es-CL')}
                </p>
              </div>
              <DollarSign className="h-10 w-10 text-amber-500" />
            </div>
          </div>
          <div className="bg-white border border-amber-100 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Rendiciones</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{rendicionesUnicas.length}</p>
              </div>
              <FileText className="h-10 w-10 text-amber-500" />
            </div>
          </div>
        </div>

        <div className="bg-white border border-amber-100 rounded-2xl p-4 shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Buscar por proveedor, RUT o categoría..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <select
              value={filterRendicion}
              onChange={(e) => setFilterRendicion(e.target.value)}
              className="px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="">Todas las rendiciones</option>
              {rendicionesUnicas.map((id) => (
                <option key={id} value={id}>
                  {id}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="bg-white border border-amber-100 rounded-2xl p-16 flex items-center justify-center">
            <Loader2 className="w-6 h-6 text-amber-500 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white border border-amber-100 rounded-2xl p-12 text-center">
            <ArrowRight className="w-12 h-12 mx-auto text-amber-300 mb-3" />
            <p className="text-gray-500">No hay documentos traspasados a GastosNX</p>
            <p className="text-xs text-gray-400 mt-2">
              Los documentos aparecerán aquí cuando se apruebe una rendición y se seleccione qué gastos pasan a GastosNX
            </p>
          </div>
        ) : (
          <div className="bg-white border border-amber-100 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-amber-50 border-b border-amber-100">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Fecha</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Proveedor</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">RUT</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Categoría</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Monto</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Rendición</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Pasado el</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Aprobado por</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((d) => (
                    <tr key={d.puente_id} className="border-b border-amber-50 hover:bg-amber-50/50">
                      <td className="px-4 py-3 text-sm text-gray-700">{d.gasto?.fecha || '-'}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 font-medium">{d.gasto?.proveedor || '-'}</td>
                      <td className="px-4 py-3 text-sm text-gray-700 font-mono">{d.gasto?.rut || '-'}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{d.gasto?.categoria || '-'}</td>
                      <td className="px-4 py-3 text-right text-sm font-semibold text-gray-900">
                        ${(d.gasto?.monto || 0).toLocaleString('es-CL')}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <button
                          onClick={() => router.push(`/rinde/rendiciones/${d.rendicion?.id}`)}
                          className="text-amber-600 hover:text-amber-700 flex items-center gap-1"
                        >
                          <span className="font-mono text-xs">{d.rendicion?.id?.substring(0, 8) || '-'}</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {d.pasado_en ? new Date(d.pasado_en).toLocaleString('es-CL', { dateStyle: 'short', timeStyle: 'short' }) : '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">{d.aprobado_por || '-'}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-amber-50 border-t-2 border-amber-200">
                    <td colSpan={4} className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                      Total filtrado:
                    </td>
                    <td className="px-4 py-3 text-right text-base font-bold text-gray-900">
                      ${totalMonto.toLocaleString('es-CL')}
                    </td>
                    <td colSpan={3}></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}

        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm text-amber-900">
          <p className="font-semibold mb-1">¿Cómo funciona el puente?</p>
          <ul className="space-y-1 text-xs">
            <li>• Al aprobar una rendición, el admin puede seleccionar qué gastos pasan a GastosNX</li>
            <li>• Solo los gastos seleccionados se duplican en la hoja de Gastos</li>
            <li>• Cada traspaso queda registrado con su rendición original y la fecha de aprobación</li>
            <li>• La dirección es única: RindeNX → GastosNX (nunca al revés)</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
