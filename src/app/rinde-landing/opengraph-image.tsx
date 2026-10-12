import { ImageResponse } from 'next/og'

/**
 * Imagen Open Graph de RindeNX.
 *
 * Antes, RindeNX reutilizaba `hero_principal.webp`, que es una foto de marca
 * de **GastosNX**: al compartir un enlace de RindeNX en redes se veía el
 * producto hermano. Esta imagen se genera en el servidor con `next/og`
 * (incluido en Next, sin dependencias nuevas) y es específica de RindeNX.
 *
 * Next inyecta automáticamente las metaetiquetas `og:image` / `twitter:image`
 * para esta ruta, que tienen prioridad sobre las declaradas en el layout.
 */

export const alt = 'RindeNX — Controla tus fondos por rendir de principio a fin'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: '#0c0a09',
          padding: '72px',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Franja ámbar superior */}
        <div style={{ display: 'flex', height: 10, width: 220, background: '#f59e0b' }} />

        {/* Marca + titular */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 64,
                height: 64,
                borderRadius: 16,
                background: '#f59e0b',
                color: '#ffffff',
                fontSize: 34,
                fontWeight: 700,
              }}
            >
              R
            </div>
            <div style={{ display: 'flex', fontSize: 44, fontWeight: 700, color: '#ffffff' }}>
              Rinde<span style={{ color: '#f59e0b' }}>NX</span>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              fontSize: 68,
              fontWeight: 700,
              color: '#ffffff',
              lineHeight: 1.1,
              maxWidth: 940,
            }}
          >
            Controla tus fondos por rendir de principio a fin
          </div>

          <div style={{ display: 'flex', fontSize: 32, color: '#d6d3d1', maxWidth: 940 }}>
            Registra gastos y respaldos, revisa rendiciones y conoce el saldo pendiente.
          </div>
        </div>

        {/* Pie */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: 26,
            color: '#a8a29e',
          }}
        >
          <div style={{ display: 'flex' }}>Software de rendición de gastos · NXChile</div>
          <div style={{ display: 'flex', color: '#f59e0b' }}>rinde.nxchile.com</div>
        </div>
      </div>
    ),
    { ...size }
  )
}