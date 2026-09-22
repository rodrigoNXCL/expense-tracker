import { NextRequest, NextResponse } from 'next/server'

/**
 * Proxy de subdominios (rinde.nxchile.com → RindeNX).
 *
 * GastosNX y RindeNX viven en el MISMO deploy. Este proxy solo actúa
 * cuando el host es *.rinde.nxchile.com y reescribe las rutas para que el
 * subdominio use la app RindeNX sin contar con una carpeta raíz propia.
 *
 * Reglas en rinde.*:
 *  - `/` y `/landing`  → landing pública (rinde-landing)
 *  - `/login`          → login compartido entre ambos productos
 *  - `/rinde**`        → pasa directo (rutas internas de la app RindeNX)
 *  - resto             → se reescribe como `/rinde/<ruta>` (dashboard, etc.)
 *
 * Los assets estáticos (/_next, /images, /manifest.json, favicon, PWA)
 * siempre pasan sin cambio.
 */

const RINDE_HOST_PREFIX = 'rinde.'
const ASSET_PREFIXES = ['/_next/', '/images/', '/manifest.json', '/favicon.ico', '/icon-192.png', '/icon-512.png', '/sw.js', '/workbox-']

function isStaticAsset(pathname: string): boolean {
  return ASSET_PREFIXES.some((prefix) => pathname.startsWith(prefix))
}

export function proxy(request: NextRequest) {
  const host = request.headers.get('host') || ''
  const { pathname } = request.nextUrl

  // Fuera del subdominio rinde.* → comportamiento normal (GastosNX)
  if (!host.startsWith(RINDE_HOST_PREFIX)) {
    return NextResponse.next()
  }

  // Assets públicos: siempre pasan
  if (isStaticAsset(pathname)) {
    return NextResponse.next()
  }

  // Rutas expuestas de RindeNX en su subdominio
  switch (pathname) {
    case '/':
    case '/landing':
      return NextResponse.rewrite(new URL('/rinde-landing', request.url))
    case '/login':
    case '/rinde-landing':
    case '/precios':
      return NextResponse.next()
  }

  // Rutas internas de la app RindeNX ya llegan con el prefijo /rinde
  if (pathname.startsWith('/rinde')) {
    return NextResponse.next()
  }

  // Cualquier otra ruta (p.ej. /dashboard, /puente) se asume parte de RindeNX
  return NextResponse.rewrite(new URL(`/rinde${pathname}`, request.url))
}

export const config = {
  matcher: ['/((?!_next|images|manifest\\.json|favicon\\.ico|icon-\\d+\\.png|sw\\.js|workbox-).*)'],
}