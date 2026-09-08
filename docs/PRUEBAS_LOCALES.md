# Guía de Pruebas Locales — RindeNX + Puente GastosNX

> **⚠️ IMPORTANTE:** Antes de hacer deploy a producción, todas estas pruebas deben pasar exitosamente en el ambiente local.

## Pre-requisitos

1. **Servidor de desarrollo corriendo:**
   ```bash
   npm run dev
   ```
   El servidor debe estar en `http://localhost:3000`.

2. **Usuario super-admin creado en la hoja Users:**
   - `email`: rodrigo@nxchile.com (o el que uses)
   - `password_hash`: SHA-256 de la contraseña
   - `rol`: `superadmin`
   - `activo`: `TRUE`

3. **Empresa de prueba en la hoja Config del spreadsheet maestro:**
   - `empresaNombre`: NXChile (o el de prueba)
   - `sheetId`: ID del spreadsheet de la empresa
   - `subdomain`: `nxchile` (o el de prueba)
   - `activo`: `TRUE`

4. **Spreadsheet de la empresa con las 7 hojas** (creadas automáticamente al primer acceso, o manualmente):
   - `Gastos` (GastosNX)
   - `Rendiciones` (con columna K `fondo_id`)
   - `GastosRinde` (con columna O `tipo_documento`)
   - `Asientos`
   - `Puente`
   - `Fondos` ← **nueva**
   - `Config_Rinde`

   **Nota:** Las hojas se crean automáticamente la primera vez que el usuario accede. La nueva hoja `Fondos` y la columna `tipo_documento` deben existir en el spreadsheet base (creadas manualmente si ya existía el spreadsheet antes de estos cambios).

## Plan de pruebas

### 1. Pruebas del Super-Admin

#### 1.1. Login super-admin
- [ ] Ir a `http://localhost:3000/super-admin/login`
- [ ] Ingresar email y contraseña del super-admin
- [ ] **Esperado:** Redirige al dashboard `/super-admin` con las 8 fases listadas

#### 1.2. Verificación de fases
- [ ] En el dashboard del super-admin, verificar que se muestren las 8 fases con su estado
- [ ] **Esperado:** Fases 1-7 ✅ Completada, Fase 8 en curso

#### 1.3. Gestión de empresas
- [ ] Click en "Empresas" en el dashboard
- [ ] Verificar que aparezca la empresa de prueba
- [ ] **Esperado:** Tabla con empresa, email, subdominio, sheet ID, estado

#### 1.4. Gestión de usuarios
- [ ] Click en "Usuarios" en el dashboard
- [ ] Verificar lista de usuarios
- [ ] **Esperado:** Tabla con email, empresa, plan, producto, rol, estado

### 2. Pruebas de RindeNX (usuario con `tipo_usuario: rinde` o `ambos`)

#### 2.1. Acceso al dashboard RindeNX
- [ ] Login con un usuario con `tipo_usuario: rinde` o `ambos`
- [ ] Verificar que aparezca el botón "RindeNX" en el navbar de GastosNX
- [ ] Click en el botón "RindeNX"
- [ ] **Esperado:** Redirige a `/rinde` y muestra el dashboard con pestañas "Fondos en Curso" y "Rendiciones"

#### 2.2. Asignar un fondo (necesario para rendir)
- [ ] Como admin, en el dashboard de RindeNX ir a "Asignación de Fondos"
- [ ] Click en "Asignar Fondo"
- [ ] Seleccionar el usuario con `tipo_usuario: rinde` o `ambos`, definir monto y observación
- [ ] Click en "Asignar"
- [ ] **Esperado:** el fondo aparece "En curso" con saldo = monto asignado

> ℹ️ **Modelo "una rendición por fondo":** cada fondo tiene una única rendición abierta. "Rendir contra este Fondo" reutiliza la rendición `abierta` (si existe) o crea una con `monto_estimado` = saldo del fondo. El usuario agrega gastos (OCR individual/masivo) e incluso puede **sobre-render** (sumar más que el fondo).

#### 2.3. Crear rendición / rendir contra el fondo
- [ ] En el dashboard, en "Fondos en Curso" click en "Rendir contra este Fondo"
- [ ] **Esperado:** abre la rendición `abierta` del fondo (o crea una nueva) y redirige a `/rinde/rendiciones/[id]`

#### 2.4. Agregar gastos (OCR)
- [ ] En el detalle, click en "Agregar Gasto" → captura de comprobante con OCR
- [ ] Llenar/verificar formulario: Fecha, RUT, Proveedor, Monto, Categoría, Tipo de Documento (boleta/factura/voucher/sin_comprobante)
- [ ] Click en "Guardar Gasto"
- [ ] **Esperado:** vuelve a la rendición, el gasto aparece en la tabla y el `monto_total` se actualiza en vivo
- [ ] Repetir 2-4 veces (boleta + factura + voucher) para sumar varios comprobantes
- [ ] **Esperado:** se puede agregar gastos mientras la rendición esté `abierta`

#### 2.5. Marcar la rendición como terminada
- [ ] Con todos los gastos agregados, click en "Marcar como Terminada"
- [ ] **Esperado:** el estado cambia a `terminada`; el usuario ya **no puede** agregar ni editar gastos
- [ ] **Esperado:** los botones de agregar gastos desaparecen o quedan deshabilitados

### 3. Pruebas del Puente (con `gastos_activo=TRUE`)

#### 3.1. Configurar el spreadsheet RindeNX para usar el puente
- [ ] Abrir el spreadsheet RindeNX de prueba
- [ ] En la hoja `Config_Rinde`, agregar fila (7 columnas A:G):
  - Columna A: "NXChile" (empresa)
  - Columna B: "TRUE" (rinde_activo)
  - Columna C: "TRUE" (gastos_activo) ← **Crítico para activar el puente**
  - Columna D: email del admin
  - Columna E: cuenta anticipo (ej. "Fondo por rendir – Cuenta por cobrar empleados")
  - Columna F: cuenta saldo a favor (ej. "Saldo a favor del usuario – Reembolso")
  - Columna G: cuenta saldo en contra (ej. "Saldo por devolver del usuario")
  - *Si la fila queda vacía, el sistema usa los defaults configurados.*

#### 3.2. Aprobar rendición con puente
- [ ] Como admin, abrir el detalle de la rendición (estado `terminada`)
- [ ] Click en "Aprobar con Puente"
- [ ] **Esperado:** aparece modal con checkboxes para cada gasto
- [ ] **Esperado:** solo los gastos `boleta`/`voucher` se pueden seleccionar (facturas y sin_comprobante no)
- [ ] Seleccionar 1 o 2 gastos (no todos)
- [ ] Ingresar comentarios
- [ ] Click en "Aprobar y Pasar X Gasto(s)"
- [ ] **Esperado:**
  - Estado de la rendición cambia a "Aprobada"
  - Se descuenta el total rendido del saldo del fondo
  - Aparece sección "Asiento Contable Generado" (cuadrado: Debe = Haber)
  - Aparece sección "Documentos enviados a GastosNX" con los gastos seleccionados

#### 3.3. Verificar en Google Sheets de Gastos
- [ ] Abrir el spreadsheet de Gastos de la empresa
- [ ] Ir a la hoja `Gastos`
- [ ] **Esperado:** Aparecen nuevas filas con los gastos seleccionados

#### 3.4. Verificar en Google Sheets de RindeNX
- [ ] Abrir el spreadsheet RindeNX
- [ ] **Hoja `Gastos`:** Los gastos seleccionados tienen `pasado_a_gastos=TRUE` (columna N)
- [ ] **Hoja `Puente`:** Aparecen registros con los IDs
- [ ] **Hoja `Asientos`:** Aparece el asiento contable generado

### 4. Pruebas del Puente desactivado (con `gastos_activo=FALSE`)

#### 4.1. Crear otra rendición de prueba
- [ ] Repetir pasos 2.1 a 2.4 con una rendición nueva

#### 4.2. Desactivar el puente
- [ ] En el spreadsheet RindeNX, hoja `Config_Rinde`, columna C (gastos_activo): cambiar a "FALSE"

#### 4.3. Aprobar rendición sin puente
- [ ] Como admin, aprobar la rendición
- [ ] **Esperado:** Botón dice "Aprobar" (no "Aprobar con Puente")
- [ ] **Esperado:** No aparece modal de selección
- [ ] Click en "Aprobar"
- [ ] **Esperado:** 
  - Estado cambia a "Aprobada"
  - Aparece asiento contable
  - NO aparece sección "Documentos enviados a GastosNX"
  - En hoja `Gastos` de RindeNX, los gastos siguen con `pasado_a_gastos=FALSE`

### 5. Pruebas de la vista de Documentos del Puente

#### 5.1. Acceder a la vista
- [ ] Login como admin
- [ ] Ir a `/rinde/puente`
- [ ] **Esperado:** Tabla con los documentos que fueron pasados al puente

#### 5.2. Filtros
- [ ] Filtrar por búsqueda (proveedor o RUT)
- [ ] **Esperado:** Tabla se filtra correctamente
- [ ] Filtrar por rendición
- [ ] **Esperado:** Solo aparecen documentos de esa rendición

#### 5.3. Links a la rendición
- [ ] Click en el ID de una rendición en la tabla
- [ ] **Esperado:** Redirige al detalle de esa rendición

### 6. Pruebas de aislamiento (GastosNX no se afecta)

#### 6.0. Prueba de acceso/routing por tipo_usuario (CRÍTICO)
- [ ] Crear 3 usuarios de prueba con `tipo_usuario` distintos en la hoja Users:
  - `gastos@solo.cl` → `gastos`
  - `rinde@solo.cl` → `rinde`
  - `ambos@admin.cl` → `ambos` (rol: admin)
- [ ] **NOTA:** si ya había iniciado sesión antes de la corrección, **cerrar sesión y volver a entrar** (la cookie debe regenerarse con `tipo_usuario`)
- [ ] Login con `gastos@solo.cl`
  - **Esperado:** entra a `/dashboard` (GastosNX)
  - NO ve botón RindeNX en navbar
  - Si navega manualmente a `/rinde`, **redirige a `/dashboard`** (layout lo bloquea)
- [ ] Login con `rinde@solo.cl`
  - **Esperado:** entra directo a `/rinde`
  - **NO debe poder** entrar a `/dashboard` (redirige a `/rinde`)
- [ ] Login con `ambos@admin.cl`
  - **Esperado:** entra a `/dashboard` (GastosNX)
  - **SI ve botón "RindeNX"** en el navbar → click lleva a `/rinde`
  - Puede alternar entre GastosNX y RindeNX usando el navbar

#### 6.1. Login con usuario `tipo_usuario: gastos`
- [ ] Crear un usuario con `tipo_usuario: gastos` en la hoja Users
- [ ] Login con ese usuario
- [ ] **Esperado:** 
  - NO aparece botón "RindeNX" en navbar
  - Si intenta ir a `/rinde` manualmente, redirige a `/dashboard`
  - Todo el flujo de GastosNX funciona normal (captura, dashboard, admin)

#### 6.2. Verificar que las APIs de GastosNX siguen funcionando
- [ ] Como usuario `gastos`, registrar un gasto
- [ ] **Esperado:** Se guarda correctamente en el spreadsheet de Gastos
- [ ] **Verificar:** El contador `boletas_usadas` se incrementa
- [ ] **Verificar:** NO se ve afectado por cambios en RindeNX

#### 6.3. Verificar que la API de admin sigue funcionando
- [ ] Como admin de GastosNX, ir a `/admin`
- [ ] **Esperado:** La tabla de usuarios muestra el campo "Producto" (GastosNX/RindeNX/Ambos)
- [ ] **Esperado:** Se pueden crear/editar usuarios sin problema
- [ ] **Esperado:** Plan, empresa y límite de boletas aparecen como "heredados" (campos bloqueados)

### 7. Pruebas del flujo de Fondos (NUEVO)

#### 7.1. Asignar un fondo como admin
- [ ] Login como admin (rol: admin, tipo_usuario: ambos o rinde)
- [ ] En el dashboard de RindeNX, click en "Asignación de Fondos"
- [ ] Click en "Asignar Fondo"
- [ ] Llenar formulario:
  - Usuario: seleccionar de la lista
  - Monto: 50000
  - Observación: "Gastos de viaje a Santiago"
- [ ] Click en "Asignar"
- [ ] **Esperado:** 
  - Aparece el fondo en la tabla
  - Estado: "En curso"
  - Saldo = Monto asignado

#### 7.2. Editar un fondo
- [ ] En la tabla de fondos, click en el ícono de editar
- [ ] Cambiar el monto a 60000
- [ ] Click en "Guardar"
- [ ] **Esperado:** El monto se actualiza correctamente

#### 7.3. Cerrar un fondo
- [ ] En la tabla de fondos, click en el ícono de candado
- [ ] Confirmar el cierre
- [ ] **Esperado:** Estado cambia a "Cerrado"

#### 7.4. Eliminar un fondo sin consumo
- [ ] Crear un fondo nuevo (sin rendiciones)
- [ ] Click en el ícono de papelera
- [ ] Confirmar eliminación
- [ ] **Esperado:** El fondo desaparece de la tabla

#### 7.5. Ver fondos como usuario
- [ ] Login como el usuario al que se le asignó el fondo
- [ ] En el dashboard de RindeNX, click en "Mis Fondos"
- [ ] **Esperado:** 
  - Ve solo SUS fondos
  - Puede ver el saldo y la observación
  - No tiene acciones de editar/eliminar

### 8. Pruebas del tipo de documento y separación SII (NUEVO)

#### 8.1. Agregar gasto tipo boleta
- [ ] Crear una rendición
- [ ] Agregar un gasto con `tipo_documento: boleta`
- [ ] **Esperado:** El gasto se guarda correctamente

#### 8.2. Agregar gasto tipo factura
- [ ] Agregar otro gasto con `tipo_documento: factura`
- [ ] **Esperado:** El gasto se guarda correctamente

#### 8.3. Agregar gasto tipo voucher
- [ ] Agregar otro gasto con `tipo_documento: voucher`
- [ ] **Esperado:** El gasto se guarda correctamente

#### 8.4. Agregar gasto sin comprobante
- [ ] Agregar otro gasto con `tipo_documento: sin_comprobante`
- [ ] **Esperado:** El gasto se guarda correctamente

#### 8.5. Aprobar rendición con puente activo
- [ ] En la hoja `Config_Rinde`, verificar que `gastos_activo=TRUE`
- [ ] Como admin, aprobar la rendición con el puente
- [ ] **Esperado:** 
  - Solo los gastos con `tipo_documento: boleta` o `voucher` aparecen en el modal de selección
  - Los gastos con `tipo_documento: factura` o `sin_comprobante` NO se pueden pasar

#### 8.6. Verificar asiento contable cuadrado
- [ ] Aprobar la rendición y abrir el spreadsheet, hoja `Asientos`
- [ ] **Esperado:** el asiento **cuadra** (Debe = Haber) y refleja la diferencia contra el fondo asignado:
  - Débito: `Gastos operacionales – Facturas` (suma de facturas)
  - Débito: `Gastos operacionales – Boletas/Vouchers` (suma de boletas + vouchers)
  - Si rindió **menos** que el fondo → Débito: `Saldo en contra ({cuenta_saldo_contra})`
  - Haber: `{cuenta_anticipo}` (monto asignado del fondo)
  - Si rindió **más** que el fondo → Haber: `Saldo a favor ({cuenta_saldo_favor})`
- [ ] **Verificar:** totales Debe y Haber son iguales (asiento cuadrado)
- [ ] Si el usuario rindió menos: aparece la línea de débito por el saldo a devolver
- [ ] Si el usuario rindió más (sobre-rendición): aparece la línea de haber por el saldo a favor
- [ ] Probar exportar el asiento a **CSV** y **PDF (print)** y **compartir** por correo/WhatsApp

### 9. Pruebas de herencia de plan (NUEVO)

#### 9.1. Verificar campos heredados
- [ ] Como admin, ir a `/admin`
- [ ] Click en "Crear Usuario"
- [ ] **Esperado:** 
  - El campo "Plan" aparece como "heredado" (bloqueado, muestra el plan del admin)
  - El campo "Empresa" aparece como "heredado" (bloqueado, muestra la empresa del admin)
  - El campo "Límite de Boletas" aparece como "heredado" (bloqueado, muestra las boletas del admin)
  - Solo se puede elegir: `tipo_usuario` y `rol`

#### 9.2. Crear usuario heredado
- [ ] Llenar el formulario eligiendo `tipo_usuario: rinde` y `rol: user`
- [ ] Click en "Crear"
- [ ] **Esperado:** El usuario se crea con el mismo plan, empresa, boletas y sheet_id_asociado del admin

### 10. Pruebas de estados de rendición y saldo (NUEVO)

#### 10.1. Marcar como terminada
- [ ] Como usuario, en una rendición con gastos, click en "Marcar como Terminada"
- [ ] **Esperado:** el estado cambia a `terminada`; el usuario no puede agregar/editar gastos
- [ ] **Esperado:** el POST `/api/rinde/gastos` rechaza nuevos gastos (mensaje de estado)

#### 10.2. Admin aprueba (saldo a favor)
- [ ] Con un fondo de $50.000 y gastos por $55.000 (sobre-rendición), aprobar
- [ ] **Esperado:** el asiento muestra línea "Saldo a favor ({cuenta_saldo_favor})" por $5.000 en el Haber
- [ ] Admin puede "Confirmar y Pagar Saldo a Favor" (registra fecha/medio/monto y cierra la rendición)

#### 10.3. Admin aprueba (saldo en contra)
- [ ] Con un fondo de $50.000 y gastos por $30.000, aprobar
- [ ] **Esperado:** el asiento muestra línea "Saldo en contra ({cuenta_saldo_contra})" por $20.000 en el Debe
- [ ] El fondo conserva el saldo remanente y el mensaje alerta saldo en contra

#### 10.4. Admin reabre una rendición terminada
- [ ] Sobre una rendición `terminada`, admin click en "Abrir"/devolver
- [ ] **Esperado:** el estado vuelve a `abierta` y el usuario puede agregar gastos nuevamente

#### 10.5. Admin rechaza
- [ ] Click en "Rechazar" con comentario
- [ ] **Esperado:** el estado cambia a `rechazada`; el usuario ve el motivo y puede reiniciar/corregir

## Resumen de validaciones

Antes de hacer deploy, todas estas pruebas deben estar ✅:

- [ ] Login super-admin funciona
- [ ] Las 8 fases se muestran correctamente en el dashboard
- [ ] Gestión de empresas funciona (CRUD)
- [ ] Gestión de usuarios funciona (CRUD + filtros + Crear Usuario)
- [ ] Acceso a `/rinde` solo para usuarios `rinde` o `ambos`
- [ ] Asignar fondo funciona (admin asigna, usuario ve)
- [ ] "Rendir contra este Fondo" reutiliza la rendición `abierta` del fondo
- [ ] Agregar gastos a rendición funciona (OCR, varios comprobantes)
- [ ] Agregar gastos se bloquea cuando la rendición no está `abierta` (dueño/estado)
- [ ] Marcar rendición como `terminada` funciona y bloquea edición
- [ ] Aprobar con puente funciona (con `gastos_activo=TRUE`)
- [ ] Aprobar sin puente funciona (con `gastos_activo=FALSE`)
- [ ] Al aprobar se descuenta el total rendido del saldo del fondo
- [ ] Los gastos seleccionados se duplican en el spreadsheet de Gastos
- [ ] El asiento contable se genera automáticamente y **cuadra** (Debe = Haber)
- [ ] El asiento refleja la diferencia (saldo en contra/a favor) contra el fondo asignado
- [ ] Export del asiento a CSV / PDF / correo / WhatsApp funciona
- [ ] La hoja `Puente` registra todos los traspasos
- [ ] La vista `/rinde/puente` muestra los documentos del puente
- [ ] Los filtros de la vista de documentos funcionan
- [ ] Solo boletas y vouchers pasan al puente (facturas no)
- [ ] Estados: marcar terminada, abrir/reabrir, aprobar, rechazar, pagar saldo a favor
- [ ] Usuarios `gastos` no tienen acceso a RindeNX
- [ ] GastosNX sigue funcionando sin afectaciones
- [ ] El admin de GastosNX ve los campos heredados en la creación de usuarios

## Deuda técnica conocida (post-MVP)

- [ ] Notificaciones por email (Web3Forms) al aprobar/rechazar
- [ ] Configuración DNS de `rinde.nxchile.com`
- [ ] Dashboard unificado para admin `ambos` con pestañas
- [ ] Validación/buscar proveedores concat en asiento (opcional)

## Reporte de bugs

Si encuentras algún bug durante las pruebas, regístralo con:
- Pantalla donde ocurre
- Pasos para reproducir
- Comportamiento esperado vs. observado
- Captura de pantalla (si aplica)
