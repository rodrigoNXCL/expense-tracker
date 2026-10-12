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
    // Rutas públicas que existen en la raíz de la app y no deben llevar
    // el prefijo /rinde (si no, el rewrite final las deja en 404).
    case '/login':
    case '/rinde-landing':
    case '/precios':
    case '/reset-password':
    case '/mi-cuenta':
    // Archivos de SEO generados por host: sin esto, el rewrite final los
    // mandaría a /rinde/robots.txt y /rinde/sitemap.xml (404).
    case '/robots.txt':
    case '/sitemap.xml':
      return NextResponse.next()
  }

  // Alias: el dashboard de RindeNX vive en /rinde, no en /rinde/dashboard.
  // Sin esto, /dashboard en el subdominio caería en el rewrite final y daría 404.
  if (pathname === '/dashboard') {
    return NextResponse.rewrite(new URL('/rinde', request.url))
  }

  // API routes: viven en /api/* y son compartidas por ambos productos
  // (login, sesión, RindeNX y GastosNX). Deben pasar sin prefijo.
  if (pathname.startsWith('/api/')) {
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