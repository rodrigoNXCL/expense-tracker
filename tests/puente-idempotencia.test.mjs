/**
 * Pruebas de la idempotencia de las operaciones POSTERIORES al registro en
 * `Gastos` del puente RindeNX.
 *
 * Simula el fallo parcial: el puente se cae después de registrar en `Gastos` y
 * antes/asimientras completa los pasos. Un reintento no debe duplicar cruces,
 * asientos ni descuentos de fondo, y debe dejar un estado coherente.
 *
 * No se afirma atomicidad: Sheets no la ofrece. Se verifica identify-and-skip.
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'

const P = await import('../src/lib/puente-idempotencia.ts')

// --- Identificadores estables ---------------------------------------------
test('El id del asiento es determinista: mismo rendicion_id => mismo id', () => {
  const a = P.asientoIdDeterminista('rend-1')
  const b = P.asientoIdDeterminista('rend-1')
  assert.equal(a, b, 'un reintento debe producir el MISMO id de asiento')
  assert.notEqual(a, P.asientoIdDeterminista('rend-2'))
})

test('El id del cruce es determinista y distinto por gasto', () => {
  assert.equal(P.puenteIdDeterminista('r1', 'g1'), P.puenteIdDeterminista('r1', 'g1'))
  assert.notEqual(P.puenteIdDeterminista('r1', 'g1'), P.puenteIdDeterminista('r1', 'g2'))
  assert.notEqual(P.puenteIdDeterminista('r1', 'g1'), P.puenteIdDeterminista('r2', 'g1'))
})

test('La clave de idempotencia del lote es estable y por gasto', () => {
  assert.equal(P.claveGasto('r1', 'g1'), 'puente:r1:g1')
})

// --- Estados de rendición --------------------------------------------------
test('Detección de estados', () => {
  assert.equal(P.rendicionYaAprobada(['r1', '', '', 'aprobada']), true)
  assert.equal(P.rendicionYaAprobada(['r1', '', '', 'APROBADA ']), true)
  assert.equal(P.rendicionYaAprobada(['r1', '', '', 'procesando']), false)
  assert.equal(P.rendicionEnProceso(['r1', '', '', 'procesando']), true)
  assert.equal(P.rendicionEnEstadoTerminal(['r1', '', '', 'cerrada']), true)
  assert.equal(P.rendicionEnEstadoTerminal(['r1', '', '', 'aprobada']), true)
  assert.equal(P.rendicionEnEstadoTerminal(['r1', '', '', 'procesando']), false)
})

// --- Regla contable intacta -----------------------------------------------
test('La fórmula del saldo no cambia: max(0, saldo - rendido)', () => {
  assert.equal(P.calcularNuevoSaldoFondo(1000, 400), 600)
  assert.equal(P.calcularNuevoSaldoFondo(300, 400), 0, 'nunca negativo')
  assert.equal(P.calcularNuevoSaldoFondo(0, 0), 0)
})

// --- Plan de ejecución -----------------------------------------------------
const rendicion = (estado) => ['rend-1', '', '', estado, '1000']

test('Primera ejecución: registra todo', () => {
  const plan = P.planificarPuente({
    rendicion: rendicion('procesando'),
    filasPuente: [], filasAsientos: [],
    gastosAPasar: [{ id: 'g1' }, { id: 'g2' }],
    tieneFondo: true,
  })
  assert.deepEqual(plan.registrarCruces, ['g1', 'g2'])
  assert.equal(plan.insertarAsiento, true)
  assert.equal(plan.descontarFondo, true)
  assert.equal(plan.aprobar, true)
})

test('Reintento con todo ya hecho: no repite NADA', () => {
  const filasPuente = [
    [P.puenteIdDeterminista('rend-1', 'g1'), 'g1', 'rend-1', '2', '', 'a'],
    [P.puenteIdDeterminista('rend-1', 'g2'), 'g2', 'rend-1', '3', '', 'a'],
    [P.puenteFondoId('rend-1'), P.MARCA_FONDO, 'rend-1', '1000', '', 'a'],
  ]
  const filasAsientos = [[P.asientoIdDeterminista('rend-1'), 'rend-1', '', 'rendicion', 'x', '1', '0', '', 'a', '']]
  const plan = P.planificarPuente({
    rendicion: rendicion('procesando'),
    filasPuente, filasAsientos,
    gastosAPasar: [{ id: 'g1' }, { id: 'g2' }],
    tieneFondo: true,
  })
  assert.deepEqual(plan.registrarCruces, [], 'ningún cruce duplicado')
  assert.equal(plan.insertarAsiento, false, 'ningún asiento duplicado')
  assert.equal(plan.descontarFondo, false, 'NINGÚN segundo descuento')
  assert.equal(plan.aprobar, true, 'solo falta marcar aprobada')
})

test('Fallo parcial tras registrar cruces pero antes del asiento', () => {
  const filasPuente = [
    [P.puenteIdDeterminista('rend-1', 'g1'), 'g1', 'rend-1', '2', '', 'a'],
    [P.puenteIdDeterminista('rend-1', 'g2'), 'g2', 'rend-1', '3', '', 'a'],
  ]
  const plan = P.planificarPuente({
    rendicion: rendicion('procesando'),
    filasPuente, filasAsientos: [],
    gastosAPasar: [{ id: 'g1' }, { id: 'g2' }],
    tieneFondo: true,
  })
  assert.deepEqual(plan.registrarCruces, [])
  assert.equal(plan.insertarAsiento, true)
  assert.equal(plan.descontarFondo, true)
})

test('Fallo parcial tras el asiento pero antes del descuento de fondo', () => {
  const filasPuente = [
    [P.puenteIdDeterminista('rend-1', 'g1'), 'g1', 'rend-1', '2', '', 'a'],
  ]
  const filasAsientos = [[P.asientoIdDeterminista('rend-1'), 'rend-1']]
  const plan = P.planificarPuente({
    rendicion: rendicion('procesando'),
    filasPuente, filasAsientos,
    gastosAPasar: [{ id: 'g1' }],
    tieneFondo: true,
  })
  assert.deepEqual(plan.registrarCruces, [])
  assert.equal(plan.insertarAsiento, false)
  assert.equal(plan.descontarFondo, true, 'el fondo aún no se descontó')
})

test('Rendición ya aprobada: el plan no propone ninguna escritura', () => {
  const plan = P.planificarPuente({
    rendicion: rendicion('aprobada'),
    filasPuente: [], filasAsientos: [],
    gastosAPasar: [{ id: 'g1' }],
    tieneFondo: true,
  })
  assert.equal(plan.yaAprobada, true)
  assert.deepEqual(plan.registrarCruces, [])
  assert.equal(plan.insertarAsiento, false)
  assert.equal(plan.descontarFondo, false)
  assert.equal(plan.aprobar, false)
})

test('El marcador de fondo distingue el descuento de un cruce normal', () => {
  assert.equal(P.fondoYaDescontado([[P.puenteFondoId('r1'), P.MARCA_FONDO]], 'r1'), true)
  assert.equal(P.fondoYaDescontado([[P.puenteFondoId('r2'), P.MARCA_FONDO]], 'r1'), false)
  assert.equal(P.fondoYaDescontado([[P.puenteIdDeterminista('r1', 'g1'), 'g1']], 'r1'), false)
})

// --- Simulación del reintento completo ------------------------------------
test('Simulación: reintentar tres veces no duplica nada y el saldo baja una vez', () => {
  const rendicionId = 'rend-9'
  const gastos = [{ id: 'gA' }, { id: 'gB' }]

  // Estado persistido simulado
  const filasPuente = []
  const filasAsientos = []
  let saldoFondo = 5000
  let rendEstado = 'procesando'
  const totalRendido = 1200

  const ejecutar = () => {
    const plan = P.planificarPuente({
      rendicion: [rendicionId, '', '', rendEstado],
      filasPuente, filasAsientos, gastosAPasar: gastos, tieneFondo: true,
    })
    if (plan.yaAprobada) return { rejection: 0, descuento: 0 }
    let rejection = 0
    for (const g of plan.registrarCruces) {
      filasPuente.push([P.puenteIdDeterminista(rendicionId, g.id), g.id, rendicionId, '2', '', 'a'])
      rejection++
    }
    if (plan.insertarAsiento) filasAsientos.push([P.asientoIdDeterminista(rendicionId)])
    if (plan.descontarFondo) {
      filasPuente.push([P.puenteFondoId(rendicionId), P.MARCA_FONDO])
      saldoFondo = P.calcularNuevoSaldoFondo(saldoFondo, totalRendido)
    }
    if (plan.aprobar) rendEstado = 'aprobada'
    return { rejection, descuento: plan.descontarFondo ? 1 : 0 }
  }

  const r1 = ejecutar()
  const r2 = ejecutar() // reintento
  const r3 = ejecutar() // reintento

  assert.equal(r1.rejection, 2)
  assert.equal(r1.descuento, 1)
  assert.equal(r2.rejection, 0, 'segundo intento no registra cruces')
  assert.equal(r2.descuento, 0, 'segundo intento NO descuenta otra vez')
  assert.equal(r3.rejection, 0)
  assert.equal(r3.descuento, 0)
  assert.equal(filasPuente.length, 3, '2 cruces + 1 marcador de fondo')
  assert.equal(filasAsientos.length, 1, 'un solo asiento')
  assert.equal(saldoFondo, 3800, '5000 - 1200 descontado UNA vez')
})