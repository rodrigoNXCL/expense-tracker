import { NextRequest } from 'next/server'

/**
 * sitemap.xml por dominio (mismo motivo que robots.txt: los dos subdominios
 * comparten deploy y un archivo estático serviría URLs del dominio equivocado).
 *
 * Se listan únicamente URLs públicas y canónicas. Ninguna ruta autenticada,
 * panel ni endpoint de API.
 */

export function GET(request: NextRequest) {
  const host = (request.headers.get('host') || '').split(':')[0]
  const isRinde = host.startsWith('rinde.')

  const urls = isRinde
    ? [
        { loc: 'https://rinde.nxchile.com/', priority: '1.0', changefreq: 'weekly' },
        { loc: 'https://rinde.nxchile.com/precios', priority: '0.9', changefreq: 'monthly' },
      ]
    : [{ loc: 'https://gastos.nxchile.com/', priority: '1.0', changefreq: 'weekly' }]

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${u.loc}</loc>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>
`

  return new Response(body, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}