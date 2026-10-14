/**
 * Reproduce el desfase del indicador del plan tras guardar.
 *
 * Caso reportado: tras guardar un gasto, "Gastos Registrados" pasa a 11 pero el
 * indicador del plan se queda en 10/9999 con 9989 disponibles. Al iniciar
 * sesión de nuevo muestra 11/9999 y 9988.
 *
 * Causa: `/api/auth/me` devuelve la copia del token mientras la sesión sea menor
 * de 5 minutos, y esa copia queda congelada en el momento del login. Si el
 * guardado no renueva la cookie, la siguiente lectura del dashboard reinstala
 * el valor viejo.
 *
 * Estos casos cubren la regla de refresco. La prueba de extremo a extremo por
 * HTTP real está en `tests/desfase-dashboard.http.mjs`.
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { contadorTrasGuardar, boletasDisponibles } from '../src/lib/sesion-contadores.ts'

const LIMITE = 9999
const sesion = (usadas) => ({
  email: 'user@empresa.cl', empresa_nombre: 'Empresa', plan: 'pro',
  limite_boletas: LIMITE, boletas_usadas: usadas, activo: true, rol: 'user',
  sheet_id_asociado: 'GASTOS', tipo_usuario: 'gastos',
})

test('El desfase: la copia vieja del token sigue mostrando 10 y 9989', () => {
  // Estado en el momento en que el usuario entra y guarda sin que se renueve
  // la cookie: la sesión cacheada en el navegador es la del login.
  const copiaLogin = sesion(10)
  assert.equal(copiaLogin.boletas_usadas, 10)
  assert.equal(boletasDisponibles(copiaLogin), 9989, 'el valor obsoleto que ve el usuario')
})

test('Tras el guardado el contador pasa de 10 a 11', () => {
  const guardado = contadorTrasGuardar(sesion(10), 11, LIMITE)
  assert.equal(guardado.boletas_usadas, 11)
})

test('Tras el guardado los disponibles pasan de 9989 a 9988', () => {
  const guardado = contadorTrasGuardar(sesion(10), 11, LIMITE)
  assert.equal(boletasDisponibles(guardado), 9988)
  assert.equal(boletasDisponibles(sesion(10)) - boletasDisponibles(guardado), 1,
    'exactamente una boleta menos disponible')
})

test('La renovación conserva el resto de la sesión', () => {
  const antes = sesion(10)
  const despues = contadorTrasGuardar(antes, 11, LIMITE)
  assert.equal(despues.email, antes.email)
  assert.equal(despues.rol, antes.rol)
  assert.equal(despues.sheet_id_asociado, antes.sheet_id_asociado)
  assert.equal(despues.tipo_usuario, antes.tipo_usuario)
  assert.equal(despues.activo, true)
})

test('La renovación no muta la sesión original', () => {
  const antes = sesion(10)
  contadorTrasGuardar(antes, 11, LIMITE)
  assert.equal(antes.boletas_usadas, 10, 'la copia previa queda intacta')
})

test('Un reintento idempotente devuelve el mismo contador, no lo incrementa', () => {
  // El lock devuelve `duplicate` con el consumo actual; renovar con ese valor
  // no debe avanzar el contador.
  const trasGuardar = contadorTrasGuardar(sesion(10), 11, LIMITE)
  const trasReintento = contadorTrasGuardar(trasGuardar, 11, LIMITE)
  assert.equal(trasReintento.boletas_usadas, 11)
  assert.equal(boletasDisponibles(trasReintento), 9988)
})

test('Si el administrador cambió el límite, se refleja en la renovación', () => {
  const conNuevoLimite = contadorTrasGuardar(sesion(10), 11, 100)
  assert.equal(conNuevoLimite.limite_boletas, 100)
  assert.equal(boletasDisponibles(conNuevoLimite), 89)
})
