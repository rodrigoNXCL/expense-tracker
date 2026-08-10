import { google, sheets_v4 } from 'googleapis'

// Scopes reutilizables
export const SCOPES_READONLY = ['https://www.googleapis.com/auth/spreadsheets.readonly']
export const SCOPES_FULL = ['https://www.googleapis.com/auth/spreadsheets']

/**
 * Obtiene un cliente de Google Sheets unificado.
 *
 * Soporta ambos formatos de credenciales de entorno (ADR-004):
 *  - `GOOGLE_CREDENTIALS`: JSON completo de la Service Account.
 *  - `GOOGLE_SERVICE_ACCOUNT_EMAIL` + `GOOGLE_PRIVATE_KEY`: par email/llave.
 *
 * Prioriza `GOOGLE_CREDENTIALS` si está disponible; en caso contrario usa
 * el par email/llave. Lanza un error claro si no hay credenciales.
 */
export async function getSheets(readOnly = false): Promise<sheets_v4.Sheets> {
  const scopes = readOnly ? SCOPES_READONLY : SCOPES_FULL

  try {
    // Formato 1: GOOGLE_CREDENTIALS (JSON completo)
    const credentialsJson = process.env.GOOGLE_CREDENTIALS
    if (credentialsJson) {
      const credentials = JSON.parse(credentialsJson)
      const auth = new google.auth.GoogleAuth({ credentials, scopes })
      return google.sheets({ version: 'v4', auth })
    }

    // Formato 2: GOOGLE_SERVICE_ACCOUNT_EMAIL + GOOGLE_PRIVATE_KEY
    const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
    const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n')
    if (serviceAccountEmail && privateKey) {
      const auth = new google.auth.GoogleAuth({
        credentials: {
          client_email: serviceAccountEmail,
          private_key: privateKey,
        },
        scopes,
      })
      return google.sheets({ version: 'v4', auth })
    }

    console.error('❌ No hay credenciales de Google Sheets configuradas')
    throw new Error('Configuración del servidor incompleta: faltan credenciales de Google Sheets')
  } catch (error) {
    if (error instanceof Error && error.message.includes('Configuración del servidor')) {
      throw error
    }
    console.error('Error configurando Google Sheets:', error)
    throw new Error('Error de configuración de Google Sheets')
  }
}