// Generar password aleatoria
export function generatePassword(length: number = 8): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%'
  let password = ''
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return password
}

// Verificar password (para login)
export async function verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
  const crypto = await import('crypto')
  const [algorithm, salt, hash] = hashedPassword.split(':')
  
  const hashBuffer = await crypto.subtle.digest(
    algorithm,
    Buffer.from(salt + plainPassword)
  )
  
  const generatedHash = Buffer.from(hashBuffer).toString('hex')
  return generatedHash === hash
}