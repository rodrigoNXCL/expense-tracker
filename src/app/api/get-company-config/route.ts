import { NextRequest, NextResponse } from 'next/server'
import { getCompanyConfig, extractSubdomain } from '@/lib/companyConfig'

/**
 * GET /api/get-company-config
 * 
 * Obtiene la configuración de la empresa basada en el subdominio o parámetro
 */
export async function GET(request: NextRequest) {
  try {
    // 1. Obtener subdominio desde query params o desde el host
    const searchParams = request.nextUrl.searchParams
    let subdomain = searchParams.get('subdomain')

    // Si no se provee por query, intentar extraer del host
    if (!subdomain) {
      const host = request.headers.get('host') || ''
      subdomain = extractSubdomain(host)
      
      // Fallback para desarrollo local
      if (!subdomain && process.env.NODE_ENV === 'development') {
        subdomain = 'nxchile'
      }
    }

    // 2. Validar que tenemos un subdominio
    if (!subdomain) {
      return NextResponse.json(
        { error: 'No se pudo determinar el subdominio de la empresa' },
        { status: 400 }
      )
    }

    // 3. Obtener configuración desde Sheet Maestro
    const config = await getCompanyConfig(subdomain)

    // 4. Validar que se encontró la configuración
    if (!config) {
      return NextResponse.json(
        { error: `No se encontró configuración para la empresa: ${subdomain}` },
        { status: 404 }
      )
    }

    // 5. Retornar configuración (sin datos sensibles)
    return NextResponse.json({
      success: true,
      data: {
        sheetId: config.sheetId,
        empresaNombre: config.empresaNombre,
        subdomain: config.subdomain,
      },
    }, { status: 200 })

  } catch (error) {
    console.error('❌ Error en get-company-config:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}