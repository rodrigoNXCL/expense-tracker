'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Alert } from '@/components/ui/Alert'
import { Badge } from '@/components/ui/Badge'
import { Key, Copy, Check, RefreshCw, Mail } from 'lucide-react'

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('')
  const [generatedPassword, setGeneratedPassword] = useState('')
  const [copied, setCopied] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Generar password aleatoria
  const generatePassword = (length: number = 8) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%'
    let password = ''
    for (let i = 0; i < length; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return password
  }

  const handleGenerate = () => {
    const newPassword = generatePassword(8)
    setGeneratedPassword(newPassword)
    setCopied(false)
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(generatedPassword)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSendEmail = async () => {
    if (!email || !generatedPassword) {
      setError('Completa email y genera una password')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Enviar password al usuario por email
      await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          access_key: process.env.NEXT_PUBLIC_WEB3FORMS_KEY,
          from_name: 'GastosNX - Nueva Contraseña',
          email: email,
          subject: '🔐 Tu nueva contraseña de GastosNX',
          message: `
            Hola,
            
            Tu nueva contraseña de GastosNX ha sido generada:
            
            Email: ${email}
            Nueva Contraseña: ${generatedPassword}
            
            Por favor, guárdala en un lugar seguro.
            
            Si no solicitaste esto, contacta a gastos@nxchile.com
            
            Saludos,
            Equipo GastosNX
          `,
          redirect: 'false',
        }),
      })

      alert('✅ Password enviada al email del usuario')
      setGeneratedPassword('')
      setEmail('')
    } catch (err) {
      setError('Error enviando email')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <Badge variant="default" className="bg-gradient-to-r from-emerald-500 to-teal-600">
            <Key className="w-3 h-3 mr-1" />
            Admin Panel
          </Badge>
          <h1 className="text-3xl font-bold text-gray-900">Resetear Contraseña de Usuario</h1>
          <p className="text-gray-600">Genera una nueva password y envíasela al usuario</p>
        </div>

        {/* Generador */}
        <Card>
          <CardHeader>
            <CardTitle>1. Generar Nueva Contraseña</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                readOnly
                value={generatedPassword || 'Haz click en Generar'}
                className="font-mono"
              />
              <Button onClick={handleGenerate} variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" />
                Generar
              </Button>
              {generatedPassword && (
                <Button onClick={handleCopy} variant="outline">
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              )}
            </div>
            <p className="text-xs text-gray-500">
              💡 Tip: La password debe tener al menos 6 caracteres
            </p>
          </CardContent>
        </Card>

        {/* Enviar Email */}
        <Card>
          <CardHeader>
            <CardTitle>2. Enviar al Usuario</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && <Alert variant="error"><span>{error}</span></Alert>}
            <Input
              type="email"
              label="Email del usuario"
              placeholder="usuario@empresa.cl"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Button 
              onClick={handleSendEmail} 
              disabled={!generatedPassword || isLoading}
              className="w-full"
            >
              <Mail className="w-4 h-4 mr-2" />
              {isLoading ? 'Enviando...' : 'Enviar Password por Email'}
            </Button>
          </CardContent>
        </Card>

        {/* Instrucciones */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-6 space-y-3">
            <h3 className="font-semibold text-blue-900">📋 Proceso Completo:</h3>
            <ol className="space-y-2 text-sm text-blue-800">
              <li>1. El usuario te contacta porque olvidó su password</li>
              <li>2. Genera una nueva password con esta herramienta</li>
              <li>3. Envía la password al email del usuario</li>
              <li>4. <strong>Importante:</strong> Actualiza el hash en la Google Sheet</li>
            </ol>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-4">
              <p className="text-xs text-yellow-800">
                ⚠️ <strong>Nota:</strong> Después de enviar la password, debes actualizar manualmente 
                el hash en la columna C de la Sheet "Usuarios". Usa la misma password para generar 
                el hash en la consola del navegador.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}