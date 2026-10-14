/**
 * Contadores del plan tras un guardado exitoso.
 *
 * POR QUÉ EXISTE
 * --------------
 * `/api/auth/me` devuelve la copia del token mientras la sesión tenga menos de
 * 5 minutos, para no leer Google Sheets en cada carga. Esa copia queda
 * congelada en el momento del login, así que si el guardado no renueva la
 * cookie, el dashboard vuelve a pintar el valor anterior aunque el gasto se
 * haya registrado: "Gastos Registrados" avanza (lo lee `/api/expenses`, que sí
 * va a la hoja) y el indicador del plan se queda atrás hasta que expira la
 * ventana o se inicia sesión de nuevo.
 *
 * La corrección es que quien conoce el valor real tras la escritura — la ruta
 * de guardado, que devuelve los contadores del lock — renueve la sesión. Este
 * módulo deja esa regla explícita y verificable.
 */

/** Sesión con los contadores que el lock acaba de confirmar. */
export function contadorTrasGuardar<T extends { boletas_usadas: number; limite_boletas: number }>(
  session: T,
  usadas: number,
  limite: number
): T {
  return {
    ...session,
    boletas_usadas: usadas,
    limite_boletas: limite,
  }
}

/** Boletas todavía disponibles según el plan. */
export function boletasDisponibles(usuario: {
  boletas_usadas: number
  limite_boletas: number
}): number {
  return usuario.limite_boletas - usuario.boletas_usadas
}
