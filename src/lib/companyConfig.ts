import { google } from 'googleapis'

export interface CompanyConfig {
  email: string
  sheetId: string
  empresaNombre: string
  subdomain: string
  activo: boolean
}

export async function getCompanyConfig(subdomain: string): Promise<CompanyConfig | null> {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    })

    const sheets = google.sheets({ version: 'v4', auth })

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_CONFIG_SHEET_ID,
      range: 'A:E',
    })

    const rows = response.data.values
    if (!rows || rows.length < 2) {
      console.warn('⚠️ No hay datos en el Sheet Maestro de Configuración')
      return null
    }

    const searchKey = subdomain.toLowerCase().trim()
    const configRow = rows.slice(1).find(row => {
      const rowSubdomain = row[3]?.toLowerCase().trim()
      const rowEmail = row[0]?.toLowerCase().trim()
      return rowSubdomain === searchKey || rowEmail === searchKey
    })

    if (!configRow) {
      console.warn(`⚠️ No se encontró configuración para: ${subdomain}`)
      return null
    }

    const config: CompanyConfig = {
      email: configRow[0] || '',
      sheetId: configRow[1] || '',
      empresaNombre: configRow[2] || '',
      subdomain: configRow[3] || '',
      activo: configRow[4]?.toUpperCase() === 'TRUE',
    }

    if (!config.activo) {
      console.warn(`⚠️ La empresa "${config.empresaNombre}" está inactiva`)
      return null
    }

    if (!config.sheetId) {
      console.error(`❌ La empresa "${config.empresaNombre}" no tiene sheet_id configurado`)
      return null
    }

    return config
  } catch (error) {
    console.error('❌ Error leyendo configuración de empresa:', error)
    return null
  }
}

export function extractSubdomain(host: string): string | null {
  const hostname = host.replace(/^www\./, '')
  const parts = hostname.split('.')
  if (parts.length === 3) {
    return parts[0] !== 'gastos' ? parts[0] : null
  }
  return null
}