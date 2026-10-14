/**
 * Idempotencia de las operaciones POSTERIORES al registro en `Gastos` del
 * puente RindeNX.
 *
 * POR QUÉ EXISTE
 * --------------
 * `saveBatch` protege el registro en `Gastos`, pero el puente después realiza
 * varias escrituras independientes: marcar `GastosRinde!N`, registrar en
 * `Puente`, insertar el asiento contable, aprobar la rendición y descontar el
 * saldo del fondo. Una clave de idempotencia en `Gastos` NO cubre esas
 * escrituras: si el proceso falla a mitad de camino, un reintento volvería a
 * insertar el asiento y a descontar el saldo otra vez.
 *
 * Sheets no ofrece transacciones ni escrituras condicionales, así que NO se
 * afirma atomicidad. Lo que se hace es unIdentify-and-skip: cada operación
 * tiene un identificador estable derivado de la rendición, se comprueba antes
 * de actuar y se omite si ya se hizo. Eso hace el reintento seguro y
 * recuperable sin alterar la lógica contable.
 *
 * COMPATIBLE CON EL ESQUEMA ACTUAL: no se agrega ninguna columna ni pestaña.
 *
 * REGLA CONTABLE INTOCABLE: el saldo del fondo solo se descuenta UNA vez y
 * siempre por el `total_rendido` completo de la rendición (boletas, vouchers y
 * facturas), igual que antes de este cambio.
 */

/** Estado de la rendición mientras el puente está en curso. */
export const ESTADO_PROCESANDO = 'procesando'

/** Marcador del descuento de fondo dentro de `Puente` (columna `rinde_gasto_id`). */
export const MARCA_FONDO = '__SALDO_FONDO__'

/**
 * Identificador estable del asiento de una rendición.
 *
 * Antes usaba `Date.now()` + `Math.random()`, por lo que un reintento generaba
 * un id distinto y el asiento se duplicaba. Ahora es función pura de la
 * rendición: mismo `rendicion_id` => mismo asiento.
 */
export function asientoIdDeterminista(rendicionId: string): string {
  return `AST-${hashEstable(rendicionId)}`
}

/** Identificador estable del registro de puente de un gasto. */
export function puenteIdDeterminista(rendicionId: string, gastoId: string): string {
  return `PTE-${hashEstable(`${rendicionId}:${gastoId}`)}`
}

/** Identificador del marcador de descuento del fondo de una rendición. */
export function puenteFondoId(rendicionId: string): string {
  return `PTE-FONDO-${hashEstable(rendicionId)}`
}

/** Hash determinista y corto (no criptográfico: solo identidad estable). */
export function hashEstable(input: string): string {
  let h1 = 0x811c9dc5
  let h2 = 0x01000193
  for (let i = 0; i < input.length; i++) {
    const c = input.charCodeAt(i)
    h1 = (h1 ^ c) >>> 0
    h1 = Math.imul(h1, 0x01000193) >>> 0
    h2 = (h2 + c * (i + 7)) >>> 0
    h2 = Math.imul(h2, 0x85ebca6b) >>> 0
  }
  return (
    h1.toString(36).padStart(7, '0').slice(0, 7).toUpperCase() +
    h2.toString(36).padStart(7, '0').slice(0, 7).toUpperCase()
  )
}

/** Normaliza para comparar estados de rendición sin depender de mayúsculas. */
export function normalizarEstado(v: unknown): string {
  return String(v ?? '').trim().toLowerCase()
}

/** ¿La rendición ya quedó completamente procesada? */
export function rendicionYaAprobada(fila: unknown[]): boolean {
  return normalizarEstado(fila?.[3]) === 'aprobada'
}

/** ¿La rendición está en un estado terminal que impide reprocesarla? */
export function rendicionEnEstadoTerminal(fila: unknown[]): boolean {
  const e = normalizarEstado(fila?.[3])
  return e === 'cerrada' || e === 'aprobada' || e === 'rechazada'
}

/** ¿Quedó a medio procesar (crash después de marcar `procesando`)? */
export function rendicionEnProceso(fila: unknown[]): boolean {
  return normalizarEstado(fila?.[3]) === ESTADO_PROCESANDO
}

/**
 * Clave de idempotencia de cada gasto en `Gastos`, estable entre reintentos.
 */
export function claveGasto(rendicionId: string, gastoId: string): string {
  return `puente:${rendicionId}:${gastoId}`
}

/**
 * ¿Ya se registró este cruce en `Puente`?
 * `Puente!A` = id, `Puente!B` = rinde_gasto_id.
 */
export function puenteYaRegistrado(
  filasPuente: unknown[][],
  rendicionId: string,
  gastoId: string
): boolean {
  const id = puenteIdDeterminista(rendicionId, gastoId)
  return filasPuente.some((f) => String(f?.[0] ?? '') === id)
}

/** ¿Ya seinsertó el asiento de esta rendición en `Asientos`? */
export function asientoYaInsertado(filasAsientos: unknown[][], rendicionId: string): boolean {
  const id = asientoIdDeterminista(rendicionId)
  return filasAsientos.some((f) => String(f?.[0] ?? '') === id)
}

/**
 * ¿Ya se descontó el saldo del fondo para esta rendición?
 *
 * Se comprueba el marcador en `Puente`, no el valor del saldo: inferirlo del
 * saldo sería frágil (otro movimiento podría alterar la cifra) y podría
 * saltarse el descuento o aplicarlo dos veces.
 */
export function fondoYaDescontado(
  filasPuente: unknown[][],
  rendicionId: string
): boolean {
  const id = puenteFondoId(rendicionId)
  return filasPuente.some((f) => String(f?.[0] ?? '') === id && String(f?.[1] ?? '') === MARCA_FONDO)
}

/**
 * Nuevo saldo del fondo. Idéntica a la regla previa: `max(0, saldo - rendido)`.
 * Se extrae para poder probarla sin tocar Sheets.
 */
export function calcularNuevoSaldoFondo(saldoActual: number, totalRendido: number): number {
  return Math.max(0, (Number(saldoActual) || 0) - (Number(totalRendido) || 0))
}

/**
 * Resultado de la planificación de un reintento. Sirve para decidir qué pasos
 * ejecutar y para informar al operador de qué queda pendiente.
 */
/**
 * ¿Este estado del lock garantiza que NO se escribió nada en `Gastos`?
 *
 * La distinction importa porque el puente marca la rendición como
 * `procesando` ANTES de llamar al lock. Si el lock rechaza sin haber escrito,
 * la rendición debe volver a su estado anterior: dejarla en `procesando` sin
 * ninguna escritura sería un estado mentiroso.
 *
 * Un estado ambiguo (el backend no supo si el script escribió) NO permite
 * revertir: en ese caso se mantiene `procesando` y el reintento resuelve por
 * clave de idempotencia.
 */
export function lockSinEscritura(status: string): boolean {
  const estadosSinEscritura = [
    'quota_exceeded',
    'limit_unavailable',
    'schema_not_migrated',
    'schema_conflict',
    'unauthorized',
    'not_configured',
    'bad_request',
    'unknown_action',
    'lock_timeout',
  ]
  return estadosSinEscritura.includes(status)
}

export interface PlanPuente {
  yaAprobada: boolean
  enProceso: boolean
  registrarCruces: string[]
  insertarAsiento: boolean
  descontarFondo: boolean
  aprobar: boolean
}

export function planificarPuente(args: {
  rendicion: unknown[]
  filasPuente: unknown[][]
  filasAsientos: unknown[][]
  gastosAPasar: { id: string }[]
  tieneFondo: boolean
}): PlanPuente {
  const { rendicion, filasPuente, filasAsientos, gastosAPasar, tieneFondo } = args
  const rendicionId = String(rendicion?.[0] ?? '')
  const yaAprobada = rendicionYaAprobada(rendicion)
  const enProceso = rendicionEnProceso(rendicion)

  return {
    yaAprobada,
    enProceso,
    registrarCruces: yaAprobada
      ? []
      : gastosAPasar
          .filter((g) => !puenteYaRegistrado(filasPuente, rendicionId, g.id))
          .map((g) => g.id),
    insertarAsiento: !yaAprobada && !asientoYaInsertado(filasAsientos, rendicionId),
    descontarFondo: !yaAprobada && tieneFondo && !fondoYaDescontado(filasPuente, rendicionId),
    aprobar: !yaAprobada,
  }
}