'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Copy, Check } from 'lucide-react'

export default function GeneradorHashPage() {
  const [password, setPassword] = useState('')
  const [hash, setHash] = useState('')
  const [copied, setCopied] = useState(false)

  const generateHash = async (pwd: string) => {
    const salt = Math.random().toString(36).substring(2)
    const hashBuffer = await crypto.subtle.digest(
      'SHA-256',
      new TextEncoder().encode(salt + pwd)
    )
    const hashValue = Array.from(new Uint8Array(hashBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
    return `sha256:${salt}:${hashValue}`
  }

  const handleGenerate = async () => {
    if (!password) return
    const newHash = await generateHash(password)
    setHash(newHash)
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(hash)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Generador de Hash para Contraseñas</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>Generar Hash</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              type="text"
              label="Contraseña (texto plano)"
              placeholder="Ej: NuevaPass123"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            
            <Button onClick={handleGenerate} className="w-full">
              Generar Hash
            </Button>

            {hash && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Hash para Google Sheet:</label>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={handleCopy}
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
                <textarea
                  readOnly
                  value={hash}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg font-mono text-sm"
                  rows={3}
                />
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
              <h3 className="font-semibold text-blue-900 mb-2">📋 Instrucciones:</h3>
              <ol className="space-y-1 text-sm text-blue-800">
                <li>1. Escribe la contraseña que quieres asignar</li>
                <li>2. Click en "Generar Hash"</li>
                <li>3. Copia el hash generado</li>
                <li>4. Ve a la Google Sheet "Usuarios"</li>
                <li>5. Busca al usuario</li>
                <li>6. Pega el hash en la columna C (Contraseña)</li>
                <li>7. Guarda la sheet</li>
                <li>8. Envía la contraseña al usuario por email</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}