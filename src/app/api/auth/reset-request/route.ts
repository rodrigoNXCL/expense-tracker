import { NextRequest, NextResponse } from 'next/server'
import { getSheets } from '@/lib/sheets'
import { createHmac } from 'crypto'

/**
 * Paso 1 del autoservicio de recuperación (ADR-001).
 *
 * El cliente escribe su email. Si existe una cuenta activa, se le envía por
 * correo un enlace con un token firmado que caduca en 1 hora.
 *
 * Decisiones de seguridad:
 *  - La respuesta es SIEMPRE `{ ok: true }`, exista o no el email. Así no se
 *    puede enumerar qué direcciones tienen cuenta.
 *  - El token es stateless (HMAC con AUTH_SECRET): no se guarda nada en la
 *    hoja, no hay estado que limpiar y no se puede reutilizar tras su uso
 *    porque el hash cambia al ejecutar el paso 2.
 */

const TOKEN_TTL_MS = 60 * 60 * 1000 // 1 hora

function base64url(input: string | Buffer): string {
  return Buffer.from(input).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

export function signResetToken(email: string, secret: string): string {
  const payload = base64url(JSON.stringify({ email, exp: Date.now() + TOKEN_TTL_MS }))
  const sig = createHmac('sha256', secret).update(payload).digest('base64')
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
  return `${payload}.${sig}`
}

export function verifyResetToken(token: string, secret: string): { email: string } | null {
  const [payload, sig] = token.split('.')
  if (!payload || !sig) return null

  const expected = createHmac('sha256', secret).update(payload).digest('base64')
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')

  // Comparación de tiempo constante sobre longitudes iguales.
  if (sig.length !== expected.length) return null
  let diff = 0
  for (let i = 0; i < sig.length; i++) diff |= sig.charCodeAt(i) ^ expected.charCodeAt(i)
  if (diff !== 0) return null

  try {
    const data = JSON.parse(Buffer.from(payload, 'base64').toString('utf8'))
    if (typeof data?.email !== 'string' || typeof data?.exp !== 'number') return null
    if (Date.now() > data.exp) return null
    return { email: data.email }
  } catch {
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()
    const normalized = String(email || '').toLowerCase().trim()
    const generic = NextResponse.json({ ok: true })

    if (!normalized || !normalized.includes('@')) return generic

    const secret = process.env.AUTH_SECRET
    const spreadsheetId = process.env.GOOGLE_CONFIG_SHEET_ID
    const web3formsKey = process.env.NEXT_PUBLIC_WEB3FORMS_KEY
    if (!secret || !spreadsheetId || !web3formsKey) return generic

    const sheets = await getSheets(true)
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Usuarios!A2:K200',
    })
    const rows = res.data.values || []
    const row = rows.find(
      (r) => r[0]?.toLowerCase().trim() === normalized && (r[6] === 'TRUE' || r[6] === true)
    )
    if (!row) return generic

    const token = signResetToken(normalized, secret)
    const host = request.headers.get('host') || 'rinde.nxchile.com'
    const isRinde = host.startsWith('rinde.')
    const link = `https://${host}/reset-password?token=${encodeURIComponent(token)}`

    await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        access_key: web3formsKey,
        from_name: isRinde ? 'RindeNX - Recuperación' : 'GastosNX - Recuperación',
        email: isRinde ? 'rinde@nxchile.com' : 'gastos@nxchile.com',
        reply_to: normalized,
        subject: `Restablece tu contraseña de ${isRinde ? 'RindeNX' : 'GastosNX'}`,
        message: [
          `Hola,`,
          ``,
          `Recibimos una solicitud para restablecer la contraseña de la cuenta ${normalized}.`,
          ``,
          `Para crear una nueva contraseña, abre este enlace:`,
          link,
          ``,
          `El enlace vence en 1 hora.`,
          ``,
          `Si no solicitaste este cambio, puedes ignorar este correo: tu contraseña actual sigue vigente.`,
        ].join('\n'),
        redirect: 'false',
      }),
    })

    console.log(`🔐 Reset: enlace enviado para ${normalized}`)
    return generic
  } catch (err) {
    console.error('❌ Reset request:', err)
    // No revela si el correo existe ni falla la UI.
    return NextResponse.json({ ok: true })
  }
}