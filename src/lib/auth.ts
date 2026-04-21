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

// Guardar sesión en localStorage
export function saveSession(user: UserSession): void {
  localStorage.setItem('expense_tracker_session', JSON.stringify(user))
}

// Obtener sesión actual
export function getSession(): UserSession | null {
  const session = localStorage.getItem('expense_tracker_session')
  if (!session) return null
  try {
    return JSON.parse(session) as UserSession
  } catch {
    return null
  }
}

// Cerrar sesión
export function logout(): void {
  localStorage.removeItem('expense_tracker_session')
}

// Verificar si usuario está autenticado
export function isAuthenticated(): boolean {
  const session = getSession()
  return !!session?.activo
}