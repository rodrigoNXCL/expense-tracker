/**
 * Gestión de la clave de idempotencia en el cliente.
 *
 * EXTRAÍDA de `captura/page.tsx` para poder probar el comportamiento: la
 * garantía "el reintento reutiliza la misma clave" es un requisito de
 * seguridad del cupo, no un detalle de UI.
 *
 * Reglas:
 *  - Una clave se genera al iniciar un envío y se CONSERVA entre reintentos de
 *    esa misma boleta.
 *  - Si el servidor devuelve una clave (por ejemplo tras un resultado ambiguo
 *    por timeout), se adopta: es la que garantiza que el reintento recupere el
 *    resultado original en vez de crear una segunda fila.
 *  - Solo se descarta cuando la escritura queda confirmada, o cuando el
 *    rechazo es definitivo (cupo agotado): en ese caso el siguiente intento es
 *    una operacion nueva y necesita una clave nueva.
 */

/** Clave nueva para iniciar una operacion. */
export function nuevaClave(): string {
  return globalThis.crypto.randomUUID()
}

/**
 * Decide la clave a usar en el siguiente envio.
 *
 * @param claveActual  clave vigente (vacia si no hay operacion en curso)
 * @param resultado    cuerpo de la respuesta del servidor
 * @param ok           `response.ok` de la peticion
 * @returns la clave a usar en el proximo envio
 */
export function claveParaReintento(claveActual: string, resultado: unknown, ok: boolean): string {
  if (ok) {
    // Escritura confirmada: la operacion se cierra.
    return ''
  }

  // El servidor puede proponer la clave que el backend genero. Se adopta siempre
  // que venga: cubre el caso de timeout, donde el backend registro el gasto pero
  // la respuesta se perdio.
  const servida = (resultado as { idempotency_key?: unknown } | null)?.idempotency_key
  if (typeof servida === 'string' && servida.trim()) {
    return servida.trim()
  }

  // Rechazo definitivo: reintentar con la misma clave devolveria siempre el
  // mismo rechazo. La siguiente boleta necesita una clave nueva.
  const code = (resultado as { code?: unknown } | null)?.code
  if (code === 'quota_exceeded') {
    return ''
  }

  // Fallo transitorio: se conserva la MISMA clave para no duplicar.
  return claveActual
}