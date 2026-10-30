/**
 * Payload para crear un usuario desde el dashboard admin.
 *
 * POR QUÉ EXISTE
 * --------------
 * El estado del formulario se inicializaba UNA vez al montar el componente,
 * cuando `currentUser` todavía no había cargado (`null`), y copiaba
 * `empresa_nombre` y `plan` de ahí. Ese snapshot quedaba congelado en vacío:
 * la UI mostraba "Empresa heredada" leyendo `currentUser` directamente, pero
 * el cuerpo enviado llevaba `empresa_nombre: ''`, así que el backend rechazaba
 * toda alta con "Email, contraseña y nombre de empresa son requeridos".
 *
 * La regla: los datos HEREDADOS del admin (empresa y plan) se toman de la
 * sesión real EN EL MOMENTO DEL ENVÍO, no del snapshot del montaje. El límite
 * de boletas lo recalcula el servidor desde el plan (no cambia aquí).
 */

export interface AdminSesion {
  empresa_nombre?: string
  plan?: string
}

export interface FormularioUsuario {
  email: string
  password: string
  empresa_nombre: string
  plan: string
  tipo_usuario: string
  limite_boletas: number
  activo: boolean
}

/** Datos heredados: en el envío mandan los de la sesión, no los del montaje. */
export function construirPayloadUsuario(
  currentUser: AdminSesion | null,
  formData: FormularioUsuario
): FormularioUsuario {
  return {
    ...formData,
    empresa_nombre: currentUser?.empresa_nombre || formData.empresa_nombre,
    plan: currentUser?.plan || formData.plan,
  }
}
