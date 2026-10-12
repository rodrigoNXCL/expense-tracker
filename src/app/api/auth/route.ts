import { NextRequest, NextResponse } from 'next/server'
import { getSheets } from '@/lib/sheets'
import { signSession, setSessionCookie } from '@/lib/session'
import { verifyPassword, hashPassword, detectFormat } from '@/lib/password'

/**
 * Migración transparente (ADR-001): si el valor almacenado usa el formato
 * histórico SHA-256 sin sal, se reescribe con sal en el primer login exitoso.
 * `rowNumber` es el número real de fila en la hoja (el rango se lee desde A2).
 * Nunca debe impedir el login si la escritura falla.
 */
async function upgradeStoredHash(
  email: string,
  rowNumber: number,
  password: string
): Promise<void> {
  try {
    const sheets = await getSheets()
    const spreadsheetId = process.env.GOOGLE_CONFIG_SHEET_ID
    if (!spreadsheetId) return

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `Usuarios!B${rowNumber}`,
      valueInputOption: 'RAW',
      requestBody: { values: [[hashPassword(password)]] },
    })
    console.log(`🔐 API Auth: hash migrado a formato con sal para ${email} (fila ${rowNumber})`)
  } catch (err) {
    console.warn(`⚠️ API Auth: no se pudo migrar el hash de ${email}:`, err)
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔐 API Auth: Intentando login...')
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email y contraseña son requeridos' },
        { status: 400 }
      )
    }

    // Credenciales de Google
    const spreadsheetId = process.env.GOOGLE_CONFIG_SHEET_ID

    if (!spreadsheetId) {
      console.error('❌ Faltan credenciales de Google en .env.local')
      return NextResponse.json(
        { error: 'Configuración del servidor incompleta' },
        { status: 500 }
      )
    }

    // Autenticar con Google
    const sheets = await getSheets(true)

    // Leer hoja "Usuarios" en Config Maestro (A:K incluye tipo_usuario)
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Usuarios!A2:K100',
    })

    const rows = response.data.values
    if (!rows || rows.length === 0) {
      return NextResponse.json(
        { error: 'No hay usuarios registrados' },
        { status: 404 }
      )
    }

    // Buscar usuario por email.
    // `rows` empieza en la fila 2 de la hoja, por eso el índice + 2.
    const index = rows.findIndex((row) => {
      const [rowEmail, rowPassword] = row
      const emailMatch = rowEmail?.toLowerCase().trim() === email.toLowerCase().trim()
      return emailMatch && verifyPassword(password, rowPassword)
    })
    const userRow = index >= 0 ? rows[index] : undefined

    if (!userRow) {
      return NextResponse.json(
        { error: 'Email o contraseña incorrectos' },
        { status: 401 }
      )
    }

    // Migración transparente: si el hash venía en formato histórico, se
    // actualiza a formato con sal sin interrumpir el login.
    const storedFormat = detectFormat(userRow[1])
    if (storedFormat === 'legacy') {
      await upgradeStoredHash(email.trim().toLowerCase(), index + 2, password)
    }

    // Parsear datos del usuario (columnas de la hoja Usuarios)
    const [
      userEmail,
      _, // password_hash (NO retornar)
      empresa_nombre,
      plan,
      limite_boletas,
      boletas_usadas,
      activo,
      rol,
      __, // creado_en
      sheet_id_asociado,
      tipo_usuario,
    ] = userRow

    // Verificar si está activo
    const activoStr = String(activo).toLowerCase().trim()
    const isActive =
      activo === true ||
      activo === 'true' ||
      activo === 'TRUE' ||
      activo === 1 ||
      activo === '1' ||
      activoStr === 'true' ||
      activoStr === 'verdadero' ||
      activoStr === 'yes' ||
      activoStr === 'si'

    console.log(`🔍 Debug activo: valor="${activo}", string="${activoStr}", resultado=${isActive}`)

    if (!isActive) {
      console.error(`❌ Usuario inactivo: email="${email}", activo="${activo}"`)
      return NextResponse.json(
        { error: 'Usuario inactivo. Contacta al administrador.' },
        { status: 403 }
      )
    }

    // Construir objeto de sesión (CON .trim() en todos los campos)
    const user = {
      email: String(userEmail).toLowerCase().trim(),
      empresa_nombre: String(empresa_nombre || '').trim(),
      plan: String(plan || 'base').trim(),
      limite_boletas: Number(limite_boletas) || 100,
      boletas_usadas: Number(boletas_usadas) || 0,
      activo: true,
      rol: String(rol || 'user').toLowerCase().trim(),  // ← IMPORTANTE: .trim() + toLowerCase()
      sheet_id_asociado: String(sheet_id_asociado || '').trim(),
      tipo_usuario: (String(tipo_usuario || 'gastos').toLowerCase().trim() as 'gastos' | 'rinde' | 'ambos'),  // ← NUEVO: 'gastos' | 'rinde' | 'ambos'
    }

    console.log(`✅ Login exitoso: ${user.email} (rol: ${user.rol}, tipo_usuario: ${user.tipo_usuario})`)

    // ADR-002: firmar sesión y setear cookie httpOnly (el cliente ya no manipula rol/sheet)
    const token = signSession(user)
    const loginResponse = NextResponse.json({ message: 'Login exitoso', user })
    return setSessionCookie(loginResponse, token)
  } catch (error) {
    console.error('❌ Error en login API:', error instanceof Error ? error.message : error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}