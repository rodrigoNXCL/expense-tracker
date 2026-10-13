/**
 * Rutas absolutas por producto.
 *
 * GastosNX y RindeNX comparten deploy pero viven en subdominios distintos, y el
 * proxy de `src/proxy.ts` reescribe en `rinde.*` cualquier ruta que no reconozca
 * con el prefijo `/rinde`. Consecuencia: **navegar con rutas relativas entre
 * productos rompe**:
 *
 *   - `router.push('/rinde')` desde `gastos.nxchile.com` cae en el subdominio
 *     equivocado (el usuario acaba en RindeNX sobre gastos.nxchile.com).
 *   - `router.replace('/rinde')` desde `rinde.nxchile.com` para un usuario que
 *     no tiene acceso produce `/rinde/rinde` → 404 → pantalla en blanco.
 *
 * Se centraliza aquí la navegación entre productos para no repetir el problema.
 */

export const GASTOS_ORIGIN = 'https://gastos.nxchile.com'
export const RINDE_ORIGIN = 'https://rinde.nxchile.com'

/** Dashboard de RindeNX, siempre en su subdominio. */
export const RINDE_DASHBOARD = `${RINDE_ORIGIN}/rinde`
/** Dashboard de GastosNX, siempre en su dominio principal. */
export const GASTOS_DASHBOARD = `${GASTOS_ORIGIN}/dashboard`

/** ¿Estamos sirviendo el subdominio de RindeNX? */
export function isRindeHost(): boolean {
  if (typeof window === 'undefined') return false
  return window.location.hostname.startsWith('rinde.')
}