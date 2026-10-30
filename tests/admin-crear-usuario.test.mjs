/**
 * Reproduce el error reportado: alta de usuario desde el dashboard admin
 * fallaba con "Email, contrasena y nombre de empresa son requeridos".
 *
 * Causa: formData se inicializa al MONTAR el componente, cuando currentUser es
 * null, y copiaba empresa_nombre de ahi. Ese snapshot quedaba vacio aunque la
 * UI mostrara "Empresa heredada". Aqui se reproduce el desfase y se verifica la
 * correccion (construirPayloadUsuario toma la empresa/plan de la sesion real en
 * el momento del envio).
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { construirPayloadUsuario } from '../src/lib/admin-usuarios.ts'

const SESION = { empresa_nombre: 'NXChile', plan: 'enterprise' }

/** El estado que producia el bug: montaje con currentUser = null. */
const formDataDelMontaje = {
  email: 'nuevo@cliente.cl',
  password: 'secreta123',
  empresa_nombre: '',
  plan: 'free',
  tipo_usuario: 'gastos',
  limite_boletas: 10,
  activo: true,
}

test('REPRODUCCION del bug: el snapshot del montaje lleva empresa vacia', () => {
  assert.equal(formDataDelMontaje.empresa_nombre, '',
    'asi quedaba formData tras montar con currentUser=null')
  // El backend exige empresa_nombre: vacio => 400 con el mensaje reportado.
  const rechazado = !formDataDelMontaje.email || !formDataDelMontaje.password ||
    !formDataDelMontaje.empresa_nombre
  assert.equal(rechazado, true, 'la validacion del backend rechazaba SIEMPRE')
})

test('Con la correccion, el payload lleva la empresa heredada del admin', () => {
  const payload = construirPayloadUsuario(SESION, formDataDelMontaje)
  assert.equal(payload.empresa_nombre, 'NXChile')
  const rechazado = !payload.email || !payload.password || !payload.empresa_nombre
  assert.equal(rechazado, false, 'ya no dispara el 400 reportado')
})

test('El plan enviado es el heredado, no el congelado en free', () => {
  const payload = construirPayloadUsuario(SESION, formDataDelMontaje)
  assert.equal(payload.plan, 'enterprise',
    'antes enviaba free aunque la UI mostrara enterprise')
})

test('La validacion del backend (email, password, empresa) pasa', () => {
  const payload = construirPayloadUsuario(SESION, formDataDelMontaje)
  assert.ok(payload.email)
  assert.ok(payload.password)
  assert.ok(payload.empresa_nombre)
})

test('No muta el estado del formulario', () => {
  const copia = { ...formDataDelMontaje }
  construirPayloadUsuario(SESION, formDataDelMontaje)
  assert.deepEqual(formDataDelMontaje, copia)
})

test('Si el admin no tiene empresa en sesion, conserva el valor del formulario', () => {
  const payload = construirPayloadUsuario(null, formDataDelMontaje)
  assert.equal(payload.empresa_nombre, '')
  assert.equal(payload.plan, 'free')
})

test('Los campos que escribe el admin no se alteran', () => {
  const payload = construirPayloadUsuario(SESION, formDataDelMontaje)
  assert.equal(payload.email, 'nuevo@cliente.cl')
  assert.equal(payload.password, 'secreta123')
  assert.equal(payload.tipo_usuario, 'gastos')
  assert.equal(payload.activo, true)
})
