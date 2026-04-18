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
    console.log('🔍 [DEBUG] getCompanyConfig llamado con subdomain:', subdomain)
    console.log('🔍 [DEBUG] GOOGLE_CONFIG_SHEET_ID:', process.env.GOOGLE_CONFIG_SHEET_ID?.substring(0, 20) + '...')

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    })

    const sheets = google.sheets({ version: 'v4', auth })

    // Intentar con range más amplio para debug
    const range = 'A1:Z50'
    console.log('🔍 [DEBUG] Leyendo range:', range)

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_CONFIG_SHEET_ID,
      range: range,
    })

    const rows = response.data.values
    console.log('🔍 [DEBUG] Rows leídas:', rows?.length || 0)
    console.log('🔍 [DEBUG] Primera fila (headers):', rows?.[0])
    console.log('🔍 [DEBUG] Segunda fila (datos):', rows?.[1])

    if (!rows || rows.length < 2) {
      console.warn('⚠️ No hay datos en el Sheet Maestro (menos de 2 filas)')
      return null
    }

    // Buscar por subdomain (columna D = índice 3) o email (columna A = índice 0)
    const searchKey = subdomain.toLowerCase().trim()
    const configRow = rows.slice(1).find(row => {
      const rowSubdomain = row[3]?.toLowerCase().trim()
      const rowEmail = row[0]?.toLowerCase().trim()
      console.log('🔍 [DEBUG] Comparando:', { rowSubdomain, rowEmail, searchKey })
      return rowSubdomain === searchKey || rowEmail === searchKey
    })

    if (!configRow) {
      console.warn(`⚠️ No se encontró configuración para subdomain: ${searchKey}`)
      console.log('🔍 [DEBUG] Todas las filas disponibles:', rows.slice(1).map(r => ({ email: r[0], subdomain: r[3] })))
      return null
    }

    const config: CompanyConfig = {
      email: configRow[0] || '',
      sheetId: configRow[1] || '',
      empresaNombre: configRow[2] || '',
      subdomain: configRow[3] || '',
      activo: configRow[4]?.toUpperCase() === 'TRUE',
    }

    console.log('✅ [DEBUG] Config encontrada:', config)

    if (!config.activo) {
      console.warn(`⚠️ La empresa "${config.empresaNombre}" está inactiva`)
      return null
    }

    if (!config.sheetId) {
      console.error(`❌ La empresa "${config.empresaNombre}" no tiene sheet_id`)
      return null
    }

    return config
  } catch (error) {
    console.error('❌ Error en getCompanyConfig:', error)
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