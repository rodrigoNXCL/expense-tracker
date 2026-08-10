export interface UserSession {
  email: string
  empresa_nombre: string
  plan: string
  limite_boletas: number
  boletas_usadas: number
  activo: boolean
  rol: string
  sheet_id_asociado: string
}

// Hash simple para passwords (SHA256)
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

// Validar usuario contra Google Sheets
export async function validateUser(email: string, password: string): Promise<UserSession | null> {
  try {
    const response = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    if (!response.ok) {
      return null
    }

    const result = await response.json()
    return result.user as UserSession
  } catch (error) {
    console.error('❌ Error validando usuario:', error)
    return null
  }
}

// ---------------------------------------------------------------
// Sesión verificable del servidor (ADR-002)
// La cookie httpOnly es la fuente de verdad. El cliente solo cachea
// en memoria lo que el servidor devuelve via /api/auth/me.
// ---------------------------------------------------------------

let sessionCache: UserSession | null | undefined = undefined

// Obtener sesión desde caché en memoria (síncrono, para compatibilidad)
export function getSession(): UserSession | null {
  return sessionCache ?? null
}

/**
 * Consulta la sesión al servidor (leer cookie httpOnly) y actualiza el caché.
 * Devuelve true si hay sesión activa.
 */
export async function loadSession(): Promise<UserSession | null> {
  try {
    const response = await fetch('/api/auth/me', {
      method: 'GET',
      credentials: 'same-origin',
    })
    if (!response.ok) {
      sessionCache = null
      return null
    }
    const result = await response.json()
    sessionCache = result.user ?? null
    return sessionCache ?? null
  } catch (error) {
    console.error('❌ Error cargando sesión:', error)
    sessionCache = null
    return null
  }
}

// Actualizar solo el contador local mientras la cookie principal sigue siendo la fuente real
export function saveSession(user: UserSession): void {
  sessionCache = user
}

// Cerrar sesión: borra cookie httpOnly y limpia caché
export async function logout(): Promise<void> {
  try {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'same-origin' })
  } catch {
    // aún limpiar local
  } finally {
    sessionCache = null
  }
}

// Verificar si usuario está autenticado
export function isAuthenticated(): boolean {
  const session = getSession()
  return !!session?.activo
}

/**
 * Verificar si el usuario puede acceder a rutas de admin
 */
export const isAdmin = (session: ReturnType<typeof getSession> | null): boolean => {
  return session?.activo === true && session?.rol === 'admin'
}