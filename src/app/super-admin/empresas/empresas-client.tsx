'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Shield, ArrowLeft, Plus, Edit2, Power, PowerOff, Search,
  Building2, Loader2, AlertCircle, CheckCircle2, X
} from 'lucide-react'

interface Empresa {
  email: string
  sheetId: string
  empresaNombre: string
  subdomain: string
  activo: boolean
}

interface Props {
  adminEmail: string
}

const EMPTY_FORM = {
  email: '',
  sheetId: '',
  empresaNombre: '',
  subdomain: '',
  activo: true,
}

export default function EmpresasClient({ adminEmail }: Props) {
  const router = useRouter()
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Empresa | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const loadEmpresas = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/super-admin/empresas')
      const data = await res.json()
      if (res.ok) {
        setEmpresas(data.empresas || [])
      } else {
        setError(data.error || 'Error al cargar')
      }
    } catch {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadEmpresas()
  }, [])

  const openCreate = () => {
    setEditing(null)
    setForm(EMPTY_FORM)
    setError(null)
    setShowModal(true)
  }

  const openEdit = (empresa: Empresa) => {
    setEditing(empresa)
    setForm({
      email: empresa.email,
      sheetId: empresa.sheetId,
      empresaNombre: empresa.empresaNombre,
      subdomain: empresa.subdomain,
      activo: empresa.activo,
    })
    setError(null)
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditing(null)
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    try {
      const url = editing
        ? `/api/super-admin/empresas/${encodeURIComponent(editing.email)}`
        : '/api/super-admin/empresas'
      const method = editing ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Error al guardar')
      }

      setSuccess(editing ? 'Empresa actualizada' : 'Empresa creada')
      closeModal()
      loadEmpresas()
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setSaving(false)
    }
  }

  const toggleActivo = async (empresa: Empresa) => {
    try {
      const res = await fetch(`/api/super-admin/empresas/${encodeURIComponent(empresa.email)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activo: !empresa.activo }),
      })
      if (res.ok) {
        setSuccess(empresa.activo ? 'Empresa desactivada' : 'Empresa activada')
        loadEmpresas()
        setTimeout(() => setSuccess(null), 3000)
      } else {
        const data = await res.json()
        setError(data.error || 'Error al cambiar estado')
      }
    } catch {
      setError('Error de conexión')
    }
  }

  const filtered = empresas.filter(e =>
    e.empresaNombre.toLowerCase().includes(search.toLowerCase()) ||
    e.email.toLowerCase().includes(search.toLowerCase()) ||
    e.subdomain.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <nav className="bg-slate-900/80 backdrop-blur-xl border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push('/super-admin')}
                className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white"
                title="Volver al dashboard"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">Empresas</h1>
                <p className="text-xs text-slate-400">Hoja Config · {empresas.length} registros</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-slate-400 text-sm">
              <Shield className="w-4 h-4" />
              <span className="hidden sm:inline">{adminEmail}</span>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {success && (
          <div className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-sm">
            <CheckCircle2 className="w-4 h-4" />
            <span>{success}</span>
          </div>
        )}
        {error && !showModal && (
          <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Buscar por nombre, email o subdominio..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <button
            onClick={openCreate}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/30"
          >
            <Plus className="w-4 h-4" />
            Nueva Empresa
          </button>
        </div>

        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-6 h-6 text-emerald-400 animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <Building2 className="w-10 h-10 mx-auto mb-3 text-slate-600" />
              <p>No hay empresas {search && `que coincidan con "${search}"`}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-900/50 border-b border-slate-700/50">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase">Empresa</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase">Email</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase">Subdominio</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase">Sheet ID</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-slate-400 uppercase">Estado</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-slate-400 uppercase">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((empresa) => (
                    <tr
                      key={empresa.email}
                      className="border-b border-slate-700/30 hover:bg-slate-800/30"
                    >
                      <td className="px-4 py-3 text-white font-medium">{empresa.empresaNombre}</td>
                      <td className="px-4 py-3 text-slate-300 text-sm">{empresa.email}</td>
                      <td className="px-4 py-3 text-slate-300 text-sm font-mono">
                        {empresa.subdomain}.nxchile.com
                      </td>
                      <td className="px-4 py-3 text-slate-400 text-xs font-mono">
                        {empresa.sheetId.substring(0, 12)}...
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${
                            empresa.activo
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'bg-red-500/20 text-red-400'
                          }`}
                        >
                          {empresa.activo ? 'Activa' : 'Inactiva'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openEdit(empresa)}
                            className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white"
                            title="Editar"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => toggleActivo(empresa)}
                            className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white"
                            title={empresa.activo ? 'Desactivar' : 'Activar'}
                          >
                            {empresa.activo ? (
                              <PowerOff className="w-4 h-4 text-red-400" />
                            ) : (
                              <Power className="w-4 h-4 text-emerald-400" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-emerald-900/30 to-teal-900/30 border-b border-slate-700 p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">
                  {editing ? 'Editar Empresa' : 'Nueva Empresa'}
                </h2>
                <button
                  onClick={closeModal}
                  className="p-1 hover:bg-slate-700 rounded-lg text-slate-400"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span>{error}</span>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Nombre Empresa</label>
                <input
                  type="text"
                  value={form.empresaNombre}
                  onChange={(e) => setForm({ ...form, empresaNombre: e.target.value })}
                  required
                  disabled={saving}
                  placeholder="Ej: AC Constructores SpA"
                  className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                  disabled={saving || !!editing}
                  placeholder="contacto@empresa.cl"
                  className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
                />
                {editing && <p className="text-xs text-slate-500 mt-1">El email no se puede modificar</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Subdominio</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={form.subdomain}
                    onChange={(e) => setForm({ ...form, subdomain: e.target.value.toLowerCase() })}
                    required
                    disabled={saving}
                    placeholder="empresa"
                    pattern="[a-z0-9-]{1,50}"
                    className="flex-1 px-4 py-2.5 bg-slate-900/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <span className="text-slate-400 text-sm">.nxchile.com</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Google Sheet ID</label>
                <div className="mb-3 p-3 bg-slate-900/70 border border-slate-600 rounded-lg text-xs text-slate-300 space-y-1">
                  <p className="font-semibold text-slate-200">📋 Pasos para crear el Spreadsheet:</p>
                  <ol className="list-decimal list-inside space-y-0.5 ml-2">
                    <li>Ve a <a href="https://sheets.new" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline">sheets.new</a> y crea un nuevo spreadsheet</li>
                    <li>Renómbralo como: <code className="bg-slate-800 px-1 rounded">ExpenseTracker - Gastos [Nombre Empresa]</code></li>
                    <li>Compártelo con el email del Service Account (darle permisos de <strong>Editor</strong>)</li>
                    <li>Copia el ID del spreadsheet desde la URL (entre <code className="bg-slate-800 px-1 rounded">/d/</code> y <code className="bg-slate-800 px-1 rounded">/edit</code>)</li>
                    <li>Pégalo abajo</li>
                  </ol>
                  <p className="text-amber-300 mt-2">
                    💡 El email del Service Account está en <code className="bg-slate-800 px-1 rounded">.env.local</code> como <code className="bg-slate-800 px-1 rounded">GOOGLE_SERVICE_ACCOUNT_EMAIL</code>
                  </p>
                </div>
                <input
                  type="text"
                  value={form.sheetId}
                  onChange={(e) => setForm({ ...form, sheetId: e.target.value })}
                  required
                  disabled={saving}
                  placeholder="1ZRI5spMiOGbzznAMFH5vGc91ucWIy56tBBcG8L4rh0E"
                  className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <p className="text-xs text-slate-500 mt-1">
                  {editing
                    ? 'ID del Spreadsheet (no modificable en edición)'
                    : 'ID del spreadsheet de la empresa (hoja Gastos + RindeNX)'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="activo"
                  checked={form.activo}
                  onChange={(e) => setForm({ ...form, activo: e.target.checked })}
                  disabled={saving}
                  className="w-4 h-4 rounded border-slate-600 bg-slate-900 text-emerald-500 focus:ring-emerald-500"
                />
                <label htmlFor="activo" className="text-sm text-slate-300">Empresa activa</label>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="flex-1 px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-xl disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/30 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Guardando...
                    </>
                  ) : editing ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
