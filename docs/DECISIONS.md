# DECISIONS.md — Registro de Decisiones de Arquitectura

> **Fuente de verdad de las decisiones de arquitectura.**
> Cada decisión relevante se registra aquí. No contradecir una decisión registrada sin justificación técnica y sin actualizar este documento.

**Última actualización:** 2026-09-22

---

## Formato de registro

Cada decisión (ADR — Architecture Decision Record) usa el siguiente formato:

```md
### ADR-### — Título breve
- **Fecha:** YYYY-MM-DD
- **Estado:** Aceptada | Propuesta | Deprecada | Superada
- **Contexto:** ¿Por qué se tomó esta decisión?
- **Decisión:** ¿Qué se decidió?
- **Alternativas consideradas:** opciones descartadas
- **Consecuencias:** impacto positivo y riesgos
- **Referencias:** archivos/links relacionados
```

---

## Decisiones registradas

Las inconsistencias detectadas durante la revisión completa del proyecto (2026-08-09) se registran aquí como ADRs, ordenadas de **mayor a menor importancia** (impacto en seguridad/negocio). Cada una incluye los pasos a corregir. Referencia cruzada: `docs/CURRENT.md`, sección 11.

### ADR-001 — Estrategia de hashing de contraseñas inconsistente e insegura
- **Fecha:** 2026-08-09
- **Estado:** ✅ **Resuelto** (2026-09-14) — ver resolución al final.
- **Contexto:** Existen **dos mecanismos de hash incompatibles**:
  - Login real (`api/auth`, cliente `lib/auth.ts`): hash **SHA-256 plano** del password.
  - Herramientas/stubs (`admin/generador-hash`, `lib/password-utils.ts`): formato **`algo:salt:hash`** (SHA-256 con salt). El generador de hash produce hashes `sha256:<salt>:<hash>` que **NO son compatibles** con el login actual (que no aplica salt).
  - Además, los registros (`registro/free`, `registro/pago`) y la creación de usuarios (`admin/users`) envían la **contraseña en texto plano** al email del administrador vía Web3Forms, y `api/admin/create-user-sheet` crea un admin por defecto con password en texto plano (`admin123`).
  - El hashing se hace tanto con `crypto.subtle.digest` (cliente/edge) como con `createHash` (Node), sin definir un estándar único.
- **Decisión (pendiente):** Unificar toda la estrategia de contraseñas en **un solo algoritmo con sal** (formato `algo:salt:hash`), aplicado de forma consistente en: login (`api/auth`), registro (`registro/free`, `registro/pago`), creación de usuarios (`api/admin/users`), reset (`admin/reset-password`) y tools internos. Eliminar el uso de SHA-256 plano y dejar de enviar contraseñas en texto plano por email.
- **Alternativas consideradas:** mantener SHA-256 plano (descartada por falta de sal y compatibilidad rota); usar bcrypt/argon2 (requeriría migración de todo el esquema; evaluar a futuro).
- **Consecuencias:** Mejora la seguridad, pero requiere migrar/regenerar los hashes almacenados en la hoja `Usuarios` (todos los usuarios existentes deben setear nueva contraseña) y actualizar las rutas involucradas.
- **Pasos a corregir:**
  1. Unificar `lib/auth.ts` y `lib/password-utils.ts` en una única librería de hashing con salt.
  2. Actualizar `api/auth` y `lib/auth.hashPassword` para usar el algoritmo unificado (y valide ambos formatos durante la transición).
  3. Actualizar `registro/free`, `registro/pago` y `api/admin/users` para hash con salt.
  4. Quitar el envío de contraseñas en texto plano de los emails (Web3Forms).
  5. Cambiar el admin por defecto de `create-user-sheet` (eliminar `admin123`).
  6. Regenerar/limpiar los hashes existentes en la sheet `Usuarios`.
- **Referencias:** `src/app/api/auth/route.ts`, `src/lib/auth.ts`, `src/lib/password-utils.ts`, `src/app/admin/generador-hash/page.tsx`, `src/app/api/admin/create-user-sheet/route.ts`, `src/app/api/admin/reset-password/...`.
- **Resolución implementada (2026-09-14):**
  1. **Librería única** `src/lib/password.ts`: `hashPassword()` produce `sha256:<salt>:<hash>` con salt criptográfico de 16 bytes (`randomBytes`); `verifyPassword()` acepta el formato con sal y el histórico SHA-256 plano; comparación con `timingSafeEqual`. `generatePassword()` para altas. Se eliminaron `lib/password-utils.ts` (nunca lo usó el login) y el `hashPassword` duplicado de `lib/auth.ts`, que ahora reexporta desde `lib/password.ts`.
  2. **Fallback de texto plano eliminado.** `api/auth/route.ts` y `api/super-admin/auth/route.ts` ya no comparan `rowPassword === password`. Ese fallback era lo que realmente autenticaba en producción.
  3. **Migración de la hoja.** Los 5 usuarios con contraseña en texto plano (`rodrigo@nxchile.com`, `admin@nxchile.cl`, `test@nxchile.cl`, `transrcc.cl@gmail.com`, `prueba@nxchile.com`) se migraron a `sha256:<salt>:<hash>` con script con backup y dry-run. Contraseña unificada por decisión del owner: `1234567`.
  4. **Migración transparente (rehash-on-login).** `api/auth` y `api/super-admin/auth` detectan formato `legacy` y reescriben la fila con sal en el primer login exitoso, sin interrumpir la sesión. El fallo de escritura se captura y solo se registra: nunca bloquea el login. Cubre a los 5 clientes reales (San Andrés, Bastcon, RCC) que conservaban SHA-256 sin sal y cuyo texto plano no era recuperable.
  5. **Generador de hash corregido.** `/admin/generador-hash` delega en `POST /api/admin/hash-password` (protegido, requiere rol admin/superadmin), que usa `lib/password.ts`. Antes generaba en el cliente con salt de `Math.random()` y un formato que el login podía rechazar.
  6. **Contraseña fuera del correo.** `api/registro/free` ya no incluye `Password:` en el email de Web3Forms.
  7. **`admin123` eliminado.** `create-user-sheet` genera una contraseña aleatoria de 14 caracteres, la hashea y la devuelve **una sola vez** en la respuesta; la hoja solo guarda el hash.
  8. **Autoservicio de recuperación de contraseña (nuevo).** Antes el modal de recuperación solo enviaba un email a NXChile y dependía de que un admin respondiera. Ahora: `POST /api/auth/reset-request` valida el correo, genera un **token stateless HMAC** (email + expiración de 1 h) firmado con `AUTH_SECRET` y envía el enlace por correo; `POST /api/auth/reset-confirm` valida el token y escribe el hash con sal; página `/reset-password?token=…` para fijar la nueva contraseña (mínimo 8 caracteres). Al ser stateless **no requiere columnas nuevas en la hoja** ni estado que limpiar. `reset-request` responde siempre `{ ok: true }` para no revelar qué correos tienen cuenta.
- **Verificación:** 16/16 pruebas unitarias de `hashPassword`/`verifyPassword`/`detectFormat` (incluye rechazo de texto plano y aceptación de legacy). Login real verificado para los 4 usuarios migrados y rechazo de contraseña incorrecta (401). `reset-request` devuelve `{ ok: true }` tanto para correo existente como inexistente; `reset-confirm` rechaza token inválido (400).
- **Referencias post-resolución:** `src/lib/password.ts`, `src/app/api/auth/{route,reset-request,reset-confirm}`, `src/app/api/super-admin/auth/route.ts`, `src/app/api/admin/hash-password/route.ts`, `src/app/reset-password/page.tsx`, `src/app/login/page.tsx`, `src/app/admin/generador-hash/page.tsx`, `src/app/api/admin/create-user-sheet/route.ts`, `src/app/api/registro/free/route.ts`.

---

### ADR-002 — Estrategia de autenticación de sesión débil (header `x-session` + localStorage)
- **Fecha:** 2026-08-09
- **Estado:** ✅ **Resuelto** (implementado 2026-08-10) — ver resolución al final.
- **Contexto:** No hay token/JWT. La sesión completa (`email`, `rol`, `plan`, `sheet_id_asociado`, etc.) se guarda en **localStorage** y se envía por el **header `x-session`** en cada llamada a API. Las API Routes confían en el `rol` y `empresa_nombre` que envía el cliente para filtrar datos. Esto permite, en teoría, modificar el `rol` a `admin` o el `sheet_id_asociado` desde el cliente.
- **Decisión (implementada):** Sesión **verificable del servidor** con **JWT HS256 firmado** con `AUTH_SECRET`, transmitido en **cookie httpOnly** (`sameSite=lax`, `secure` en prod). El cliente ya no posee datos de sesión manipulables.
- **Alternativas consideradas:** JWT firmado con secreto; Sessión cookie httpOnly + middleware Next.js.
- **Consecuencias:** Elimina el riesgo de escalada de privilegios y acceso a datos ajenos. Requirió cambios en todas las rutas que leían `x-session` y en el cliente.
- **Resolución implementada (2026-08-10):**
  - Nuevo `src/lib/session.ts`: `signSession`, `verifySessionToken`, `readSession(request)`, `setSessionCookie`, `clearSessionCookie`. Implementa HS256 con `crypto` de Node (sin dependencias).
  - `api/auth` firma y setea la cookie httpOnly al validar contra Sheets.
  - Nuevos endpoints: `GET /api/auth/me` (devuelve sesión validada) y `POST /api/auth/logout` (borra cookie).
  - Migradas a `readSession(request)` (sin confiar en `x-session`): `api/expenses`, `api/export`, `api/admin/users`, `api/admin/stats`, `api/save-expense`. Este último resuelve `sheet_id`, rol y límite desde el servidor (el cliente ya no envía `userSheetId`/`userUsadas`).
  - Cliente `lib/auth.ts`: `getSession()` = caché en memoria (síncrono), `loadSession()` consulta `/api/auth/me`, `logout()` borra la cookie. Se eliminó el uso de `localStorage` para la sesión.
  - Páginas migradas a `loadSession()` al montar: `login`, `dashboard`, `admin`, `captura`.
  - **Requisito de entorno:** agregar `AUTH_SECRET` (mín 16 caracteres) en producción. En local ya existe en `.env.local`.
- **Referencias:** `src/lib/session.ts`, `src/lib/auth.ts`, `src/app/api/auth/{route,me,logout}` , `src/app/api/*` (expenses, export, save-expense, admin/*).

---

### ADR-003 — Inconsistencia de límites de usuarios por plan según origen
- **Fecha:** 2026-08-09
- **Estado:** ✅ **Resuelto** (2026-08-28) — ver resolución al final.
- **Contexto:** Los límites de usuarios por plan difieren según el endpoint, y cambiaron la oferta pública (2026-08-10, elimina Enterprise y Plan Contador, Pro pasa a 3 usuarios). La primera resolución (2026-08-18) alineó los valores en backend pero la UI pública mantenía precios desactualizados (Enterprise visible, precios antiguos en `/registro/pago` y `/registro/confirmacion`).
  - Backend (alineado 2026-08-18): `api/admin/users` → `PLAN_LIMITS`: `free:{boletas:10,usuarios:1}`, `pro:{boletas:500,usuarios:3}`, `enterprise:{boletas:9999,usuarios:10}`.
  - UI pública (corregido 2026-08-28): `/registro/pago` y `/registro/confirmacion` ofrecían plan Enterprise con precios antiguos (`$19.990/$24.990`) y Pro con precio total único (`$9.900`/`$12.900`) sin desglose por usuario.
- **Decisión (implementada):** Definir una **única fuente de verdad** para límites por plan (constante central compartida) **y** presentar precios por usuario (no por plan) tanto en backend como en UI pública.
- **Alternativas consideradas:** mantener valores por endpoint (descartado, genera comportamiento divergente). Mantener precio total en lugar de por usuario (descartado, impide escalado claro con usuarios extras).
- **Consecuencias:** Evita que un admin pueda crear más usuarios de los que corresponde a su plan, o que el registro permita límites distintos a los publicados. La estructura por usuario es comercialmente más escalable y transparente.
- **Resolución implementada (2026-08-18 — backend):**
  - Se creó la constante `PLAN_LIMITS` en `src/app/api/admin/users/route.ts` y `src/app/admin/page.tsx` con `{ free: 10, pro: 500, enterprise: 9999 }`.
  - El API route ahora siempre usa el límite del plan, ignorando el valor enviado por el cliente.
  - El frontend formulario hereda el plan del admin y valida el límite máximo de boletas.
  - El input `limite_boletas` está atado al máximo permitido por el plan seleccionado.
- **Resolución implementada (2026-08-28 — UI pública + nueva estructura de precios):**
  - **Eliminación del plan Enterprise** de toda la UI pública: `/registro`, `/registro/pago`, `/registro/confirmacion`, landing. Permanece solo en el schema interno (`PLAN_LIMITS`, `PLAN_HIERARCHY`).
  - **Nueva estructura de precios Pro** (presentada por usuario, no por plan):
    - **Pago anual:** $3.300 / usuario / mes (IVA incluido). Hasta 3 usuarios incluidos → $9.900 / mes total. Usuario adicional: $2.500 c/u.
    - **Pago mes a mes:** $4.000 / usuario / mes (IVA incluido). Hasta 3 usuarios incluidos → $12.000 / mes total. Usuario adicional: $3.000 c/u.
  - `src/app/registro/pago/page.tsx`: nuevo objeto `planes` con `pro` únicamente, contiene `precioPorUsuarioAnual`, `precioPorUsuarioMensual`, `usuariosBase: 3`, `precioUsuarioExtraAnual`, `precioUsuarioExtraMensual`, `totalAnualMensual`, `totalMensualMensual`. Sin toggle Pro vs Enterprise.
  - `src/app/registro/page.tsx`: presentación de Pro con dos cards (anual recomendado + mensual) y nota "IVA incluido en todos los precios".
  - `src/app/registro/confirmacion/page.tsx`: solo `free` y `pro` en el objeto `planes`. `pro.precio = 3300` (por usuario, no total).
  - `src/app/page.tsx` (landing): Pro con dos cards (anual + mensual), nota comercial "El plan anual sale más conveniente. Cada usuario adicional tiene precio preferencial." y nota de valor "El costo del plan se recupera con el primer gasto deducible que no pierdas.".
  - Plan Free mejorado: mención explícita "OCR con Google AI (mismo que Pro)" y CTA "Empezar gratis sin tarjeta".
- **Referencias:** `src/app/api/admin/users/route.ts`, `src/app/admin/page.tsx`, `src/app/registro/page.tsx`, `src/app/registro/pago/page.tsx`, `src/app/registro/confirmacion/page.tsx`, `src/app/page.tsx`, `CURRENT.md` sección 7.

---

### ADR-004 — Doble sistema de credenciales de Google Sheets
- **Fecha:** 2026-08-09
- **Estado:** ✅ **Resuelto** (implementado 2026-08-10) — ver resolución al final.
- **Contexto:** No hay una única forma de autenticarse con Google:
  - `api/auth`, `api/expenses`, `api/save-expense`, `api/export`, `lib/companyConfig.ts` usan `GOOGLE_SERVICE_ACCOUNT_EMAIL` + `GOOGLE_PRIVATE_KEY`.
  - `api/admin/users`, `api/registro/free`, `api/registro/pago` usan `GOOGLE_CREDENTIALS` (JSON completo). Además, cada archivo re-implementa `getSheetsClient()`.
- **Decisión (implementada):** Centralizar la obtención del cliente de Google Sheets en una única utilidad reutilizable con soporte de ambos formatos de variables de entorno.
- **Alternativas consideradas:** unificar a solo `GOOGLE_CREDENTIALS`; unificar a `EMAIL+KEY`.
- **Consecuencias:** Mayor mantenibilidad y menos riesgo de configuraciones incompletas.
- **Resolución implementada (2026-08-10):**
  - Creado `src/lib/sheets.ts` con `getSheets(readOnly?)`. Prioriza `GOOGLE_CREDENTIALS`; si no, usa `GOOGLE_SERVICE_ACCOUNT_EMAIL` + `GOOGLE_PRIVATE_KEY`. Scopes configurables (`SCOPES_READONLY`/`SCOPES_FULL`).
  - `readOnly=true` aplica `spreadsheets.readonly` (lectura); `false` aplica `spreadsheets` (escritura).
  - Reemplazadas todas las implementaciones duplicadas: `api/auth`, `api/expenses`, `api/export`, `api/save-expense`, `api/admin/users`, `api/admin/stats`, `api/admin/create-user-sheet`, `api/registro/free`, `api/registro/pago` y `lib/companyConfig.ts`.
- **Referencias:** `src/lib/sheets.ts`, todas las rutas `/api/*` que usan googleapis; `src/lib/companyConfig.ts`.

---

### ADR-005 — Confianza de OCR no fiable (valor fijo)
- **Fecha:** 2026-08-09
- **Estado:** ✅ **Resuelto** (2026-09-14) — ver resolución al final.
- **Contexto:** En `api/ocr` (Google Cloud Vision) el campo `confidence` se fija en **95** de forma fija, porque Google Vision no entrega confianza en `TEXT_DETECTION`. Ese valor se usa luego para colorear badges ("Confianza OCR") y para mensajes de advertencia, dando una falsa sensación de precisión.
- **Decisión (pendiente):** El `ocr_confidence` no debe reflejar un valor inventado. Evaluar una heurística de confianza derivada del parseo (p. ej. completitud de campos extraídos por `lib/parser.ts`) o marcar el valor como no disponible.
- **Alternativas consideradas:** usar la confianza de documento de Vision (no disponible en este modo); calcular un índice de completitud del parseo.
- **Consecuencias:** Mejora la fiabilidad de la UI y evita decisiones erróneas del usuario basadas en una confianza falsa.
- **Pasos a corregir:**
  1. En `api/ocr`, quitar el `confidence` fijo en 95.
  2. Calcular un índice de confianza basado en cuántos campos clave (`proveedor`, `monto`, `fecha`, `rut`) se extrajeron en el parseo.
  3. Ajustar la UI (`ExpenseForm`) para reflejar ese índice o un estado "no disponible".
- **Referencias:** `src/app/api/ocr/route.ts`, `src/components/ExpenseForm.tsx`, `src/lib/parser.ts`.
- **Resolución implementada (2026-09-14):** se eligió la opción "marcar como no disponible" por ser la honesta y de menor riesgo.
  1. `api/ocr` ya no fija `confidence = 95`; devuelve `confidence: null` porque Vision en `TEXT_DETECTION` no entrega ese dato.
  2. `lib/parser.ts`: `parseBoletaChilena` acepta `number | null` y normaliza a `0` ("no disponible"), para no propagar `null` como si fuera una medición.
  3. `captura/page.tsx`: el badge "OCR 95%" se reemplaza por "Texto reconocido · revisa los datos".
  4. `components/ExpenseForm.tsx`: el badge de "Confianza OCR" con porcentaje y su alerta condicionada se reemplazan por "Datos extraídos por OCR — Por verificar", con instrucción de revisar monto, fecha y proveedor.
  5. `save-expense` sigue escribiendo `ocr_confidence` con `|| 0`, por lo que la columna `ocr_confidence` de la hoja `Gastos` se mantiene válida (`0` = no disponible).
- **Consecuencia:** la UI ya no muestra un número inventado; la responsabilidad de verificar los campos queda explícita para el usuario. No se implementó el índice de completitud del parseo porque añade complejidad sin valor real: el usuario revisa igual.

---

### ADR-006 — Endpoints y librerías no utilizadas (código muerto)
- **Fecha:** 2026-08-09
- **Estado:** ✅ **Resuelto** (2026-09-14) — ver resolución al final.
- **Contexto:** Existen elementos sin uso funcional que confunden el estado del proyecto:
  - `api/user` es un stub que retorna **501 Not implemented**.
  - `lib/sheets-users.ts` está **vacío**.
  - `lib/storage.ts` provee `deleteReceiptImage`, pero no hay flujo de borrado de imágenes que lo invoque.
  - Componentes/íconos referenciados en `layout.tsx` (`og-image.jpg`) no existen en `public/images`.
- **Decisión (pendiente):** Decidir entre implementar o eliminar estos elementos para mantener el código limpio y la documentación precisa.
- **Alternativas consideradas:** dejar como está (descartado, genera deuda técnica y documentación inexacta).
- **Consecuencias:** Código más claro y mantenible; flujo de borrado de imágenes (si aplica) documentado.
- **Pasos a corregir:**
  1. `api/user`: eliminarlo o implementarlo según necesidad real.
  2. `lib/sheets-users.ts`: eliminarlo si no aporta.
  3. Decidir si se implementa el borrado de imágenes y vincularlo a un flujo (ej. eliminar gasto).
  4. Verificar que los assets referenciados en `layout.tsx` existan en `public/images`.
- **Referencias:** `src/app/api/user/route.ts`, `src/lib/sheets-users.ts`, `src/lib/storage.ts`, `src/app/layout.tsx`.
- **Resolución implementada (2026-09-14):** se optó por eliminar en lugar de implementar, salvo el punto 4.
  1. `api/user` **eliminado** (era un stub 501 sin consumidores; la sesión se expone en `/api/auth/me`, ADR-002).
  2. `lib/sheets-users.ts` **eliminado** (archivo vacío, sin imports en todo el proyecto).
  3. `deleteReceiptImage` **eliminado** de `lib/storage.ts`. No existía flujo de borrado de imágenes que lo invocara; el borrado de gastos no borra el comprobante de Supabase, por lo que mantener la función sin uso solo sugería una capacidad inexistente. **Deuda consciente:** si en el futuro se implementa el borrado de imágenes, hay que reincorporar la función y conectarla a ese flujo.
  4. Assets de `layout.tsx`: `og-image.jpg` estaba referenciado en 4 lugares (`layout.tsx` ×2, `rinde-landing/layout.tsx` ×2) pero **no existía** en `public/images/`, por lo que las metaetiquetas Open Graph apuntaban a un 404. Reapuntadas a `hero_principal.webp`, que sí existe.
- **Consecuencias:** superficie de código menor y documentación coherente con el estado real. Se eliminan rutas de API públicas (`/api/user` pasaba de 501 a 404).

---

### ADR-007 — Rediseño de landing y alineación con NXChile
- **Fecha:** 2026-08-28
- **Estado:** ✅ **Resuelto** (implementado) — ver resolución al final.
- **Contexto:** El plan "Mejora y Alineación GastosNX ↔ NXChile" (interno, 2026-08-28) identificó debilidades de conversión y desalineación con el sello `www.nxchile.com`:
  - Identidad visual desconectada, falta de prueba social, CTA sin explicación del siguiente paso, poco refuerzo del vínculo con NXChile.
  - Presentación de precios Pro poco clara (solo total $9.900, sin desglose por usuario ni extras).
  - Menciones incorrectas de OCR ("Azure AI" en lugar de "Google AI") en 5 ubicaciones de la UI pública.
  - Ausencia de sección "Para Contadores", FAQ, prueba social y canal de WhatsApp directo.
  - OCR activo en backend: Google Cloud Vision (confirmado en `src/app/api/ocr/route.ts` y `lib/ocr.ts`).
- **Decisión (implementada):** Rediseñar la landing (`src/app/page.tsx`) y las páginas de registro público (`/registro`, `/registro/free`, `/registro/pago`, `/registro/confirmacion`) **sin tocar la funcionalidad operativa** (login, dashboard, captura, admin, API). Implementar las secciones de la Fase 1 (quick wins) del plan.
- **Alternativas consideradas:** rediseño completo con cambio de tipografía (descartado por costo de implementación y riesgo de LCP). Scraping de Instagram con `instagram-scraper` o puppeteer (descartado por riesgo de baneo de Meta y no soportado en runtime serverless de Vercel). Embeds dinámicos de Instagram vía API Graph (descartado por requerir cuenta Business de Meta, app aprobada y token de larga duración, fuera de alcance).
- **Consecuencias:** Mayor coherencia con el sello NXChile, mejor claridad de precios, eliminación de menciones incorrectas de OCR, y habilitación de canales directos (WhatsApp, Instagram) sin agregar dependencias operativas.
- **Resolución implementada:**
  - **`src/app/page.tsx` (landing) — cambios principales:**
    - **Hero:** badge "Producto de NXChile · Tecnología operacional", headline "Deja de perder gastos operacionales antes de la Declaración de Renta", subheadline con mención a NXChile.
    - **Prueba social:** sección con 4 logos de clientes reales en `public/images/clients/` (AC Constructores y Consultores, RCC Servicios EIRL, Transportes San Andrés SPA, Bastcon), con efecto grayscale que se quita en hover.
    - **Cómo funciona:** rediseño de los 3 pasos con números destacados y micro-copy de beneficio en cada uno + **video demo de YouTube embebido** (videoId `9txm6hqHre8`, mismo que `/manual`).
    - **Planes y precios:** Free con mención explícita "OCR con Google AI (mismo que Pro)" y CTA "Empezar gratis sin tarjeta". Pro con dos cards (anual recomendado $3.300/usuario + mensual $4.000/usuario), nota comercial "El plan anual sale más conveniente. Cada usuario adicional tiene precio preferencial." y nota de valor destacada.
    - **Sección "Producto de NXChile":** trust badges (SII, OCR con Google AI, Hecho en Chile) + link visible a www.nxchile.com.
    - **FAQ:** 8 preguntas desplegables con `<details>`/`<summary>` (deducibilidad, SII, tiempo de acceso, export, precio por usuario, usuarios extra, diferencia anual vs mensual, OCR Google AI).
    - **Para Contadores:** sección completa con beneficios clave (menos horas de revisión, respaldo trazable, exportación directa, cero costo para el contador), CTAs (`mailto:gastos@nxchile.com`) y mockup visual del panel de contador con tarjetas de los clientes reales.
    - **Instagram (Opción D):** grid de 4 imágenes en `public/images/instagram/post-{1..4}.jpeg` enlazando a `https://www.instagram.com/nx_chile` con CTA gradient. **No se hace scraping ni embeds dinámicos** (riesgo de baneo de Meta).
    - **WhatsApp flotante:** botón verde esquina inferior derecha con color `#25D366`, solo visible en desktop (`hidden md:flex`), tooltip "¿Dudas? Escríbenos". Link: `https://wa.me/56977412178?text=Hola,%20vengo%20de%20gastos.nxchile.com...`.
    - **Sticky CTA mobile:** barra fija inferior mobile con botón "Probar gratis" + WhatsApp, aparece tras scroll >800px (`window.scrollY > 800`).
    - **Correcciones de copy:** "OCR Azure AI" → "OCR con Google AI" en todas las ubicaciones (landing, `/registro`, `/registro/free`, `/registro/pago`).
  - **`src/app/registro/page.tsx`:** nueva presentación de Pro con dos cards (anual + mensual), "OCR con Google AI" corregido, nota "IVA incluido en todos los precios".
  - **`src/app/registro/free/page.tsx`:** "OCR con Google AI" corregido, eliminado "Enterprise" del CTA inferior.
  - **`src/app/registro/pago/page.tsx`:** **eliminado plan Enterprise** del array `planes`. Nuevo objeto `planes.pro` con `precioPorUsuarioAnual`, `precioPorUsuarioMensual`, `usuariosBase: 3`, precios de extras. Eliminado toggle Pro vs Enterprise, reemplazado por dos cards de pricing (anual recomendado + mensual). Nota de ahorro "Ahorras $X al año" calculada dinámicamente. OCR corregido a "Google AI".
  - **`src/app/registro/confirmacion/page.tsx`:** **eliminado Enterprise** del objeto `planes`. `pro.precio = 3300` (por usuario, no total). Mensaje actualizado: "Plan Pro desde $3.300/usuario/mes (anual), hasta 3 usuarios incluidos".
  - **Nuevos assets en `public/images/`:** `clients/{ac_logo.png, RCCServicios.jpeg, sanAndres.png, bastcon.jpg}` e `instagram/post-{1..4}.jpeg` (autorización de uso de logos confirmada por el dueño del producto).
- **Lo que NO se hizo (fuera de alcance o excluido explícitamente):**
  - **Tipografía Inter / cambio de paleta premium** (deferido — requiere decisión de arquitectura de design tokens; impacto en LCP si no se usa `next/font`).
  - **Tracking / GA4 events** (4.9 del plan, excluido por instrucción del usuario).
  - **Scraping o embeds dinámicos de Instagram** (riesgo de baneo de Meta; se eligió Opción D: link estático a perfil + grid de imágenes controladas).
  - **Funcionalidad operativa:** no se tocaron login, dashboard, captura, admin, ni API routes.
- **Referencias:** `src/app/page.tsx`, `src/app/registro/page.tsx`, `src/app/registro/free/page.tsx`, `src/app/registro/pago/page.tsx`, `src/app/registro/confirmacion/page.tsx`, `public/images/clients/`, `public/images/instagram/`, `CURRENT.md` secciones 7, 11, 12.

---

### ADR-008 — Plan de 8 fases: super-admin + RindeNX (2026-09-01)

- **Contexto:** Se requiere incorporar un nuevo producto (**RindeNX**) al ecosistema NXChile sin afectar la estabilidad ni la funcionalidad operativa de **GastosNX**. Adicionalmente, se necesita un **super-admin** que gestione empresas y usuarios de forma centralizada (sin depender de variables de entorno como `SUPER_ADMIN_EMAILS`, que se prestaba a errores).
- **Decisión (en implementación):**
  1. Adoptar un **plan de 8 fases** explícito, registrado en `CURRENT.md` §2.
  2. **GastosNX y RindeNX coexisten** en el mismo repositorio, pero con rutas, dominios y datos independientes. RindeNX se construirá en `src/app/rinde/` y se vinculará al subdominio `rinde.nxchile.com` cuando se despliegue.
  3. El **super-admin** autentica contra la **hoja Usuarios** del Google Sheet maestro (no contra `SUPER_ADMIN_EMAILS`). El campo `rol: superadmin` en la hoja Users es la fuente de verdad.
  4. Se agrega el campo `tipo_usuario` (columna K) a la hoja Users con valores `gastos`, `rinde` o `ambos`.
  5. El **puente** (Fase 5) es **unidireccional**: RindeNX → GastosNX, solo para usuarios con `tipo_usuario: ambos`, y requiere confirmación del admin de la cuenta. Nunca al revés.
- **Plan de 8 fases:**
  1. ✅ Identificación de usuario (`tipo_usuario`).
  2. ✅ Dashboard super-admin con navegación.
  3. ⏳ Gestión de usuarios en la hoja Users.
  4. ⏳ Gestión de empresas (hoja Config).
  5. ⏳ Puente GastosNX + RindeNX.
  6. ⏳ RindeNX - Fondos y asientos.
  7. ⏳ RindeNX - Puente de documentos.
  8. ⏳ Documentación y despliegue.
- **Vinculación de subdominio (Fase 8):**
  - `rinde.nxchile.com` se vinculará al directorio `src/app/rinde/` (pendiente de implementación).
  - La configuración DNS se realizará al final del plan, en la Fase 8.
- **Alternativas consideradas:** monorepos separados (Nx/Turborepo) para GastosNX y RindeNX (descartado por complejidad operativa y costo de mantener dos despliegues); single-app con todo mezclado (descartado por acoplamiento no deseado).
- **Consecuencias:** GastosNX mantiene su funcionalidad intacta. RindeNX se desarrolla como módulo aislado. El super-admin permite gestionar ambos productos desde una sola consola.
- **Lo que NO se hace (por ahora):** migrar GastosNX a monorepo, separar RindeNX en otro repo, modificar login/dashboard/captura/admin de GastosNX.
- **Referencias:** `CURRENT.md` §1, §2, §6 (Users columna K), §11. Dashboard super-admin en `src/app/super-admin/`.

---

### ADR-009 — RindeNX como sistema independiente y puente unidireccional (2026-09-02)

- **Contexto:** Se necesitaba un sistema para manejar rendiciones de fondos fijos y gastos de personal (RindeNX), coexistiendo con GastosNX (gastos operacionales menores). El cliente NXChile quería que ciertos gastos aprobados en rendiciones se aprovecharan también en la línea de Gastos, evitando duplicación de captura.
- **Decisión (implementada):**
  1. **RindeNX es un sistema independiente** con su propio dashboard (`/rinde`), su propio spreadsheet por cliente y su propia sesión.
  2. **NO comparte tablas con GastosNX.** Cada cliente que use RindeNX tiene su propio spreadsheet con 4 hojas: `Rendiciones`, `Gastos`, `Asientos`, `Puente`, `Config`.
  3. **El puente es unidireccional: RindeNX → GastosNX.** Nunca al revés. Solo aplica a empresas con `gastos_activo=TRUE` en la hoja `Config` del spreadsheet RindeNX.
  4. **Selección manual de gastos al aprobar rendición.** El admin de la cuenta (no el super-admin) revisa la rendición y elige qué gastos pasan a GastosNX. Los demás quedan solo en RindeNX.
  5. **El super-admin solo crea las cuentas.** No participa en la aprobación del puente.
  6. **Tres tipos de usuario:** `gastos` (solo GastosNX), `rinde` (solo RindeNX), `ambos` (acceso a ambos con puente opcional).
  7. **El campo `sheet_id_rinde`** en la sesión del usuario (futuro) apunta al spreadsheet RindeNX del cliente. Por ahora, se asume 1:1 con `sheet_id_asociado`.
- **Fases cubiertas:** 5 (puente), 6 (módulo RindeNX), 7 (trazabilidad del puente).
- **Vinculación de subdominio (Fase 8):**
  - `rinde.nxchile.com` se vinculará al directorio `src/app/rinde/` en el deploy.
  - En Vercel, se configura un dominio adicional con el path prefix `/rinde`.
  - Configuración DNS pendiente (CNAME de `rinde.nxchile.com` al deploy de Vercel).
- **Estructura del spreadsheet RindeNX (creada automáticamente al primer acceso):**
  - `Rendiciones`: `id`, `fecha_creacion`, `fecha_cierre`, `estado`, `monto_total`, `descripcion`, `usuario_email`, `aprobado_por`, `comentarios`, `asiento_id`
  - `Gastos`: `id`, `rendicion_id`, `fecha`, `rut`, `proveedor`, `monto`, `categoria`, `boleta_numero`, `giro`, `notas`, `image_url`, `creado_por`, `creado_en`, `pasado_a_gastos`
  - `Asientos`: `id`, `rendicion_id`, `fecha`, `tipo`, `cuenta`, `debe`, `haber`, `descripcion`, `creado_por`, `creado_en`
  - `Puente`: `id`, `rinde_gasto_id`, `rendicion_id`, `gastos_sheet_id`, `gastos_row_number`, `pasado_en`, `aprobado_por`
  - `Config`: `empresa`, `rinde_activo`, `gastos_activo`, `gastos_sheet_id`, `admin_email`
- **Lo que NO se hace:**
  - No se migra GastosNX a monorepo.
  - No se separan RindeNX y GastosNX en repos distintos (decisión: mismo repo, distinto módulo).
  - No se comparte base de datos entre ambos (cada uno tiene su spreadsheet).
  - No se afecta la lógica existente de GastosNX (login, dashboard, captura, admin, API).
- **Referencias:** `src/app/rinde/`, `src/app/api/rinde/`, `src/lib/rinde-helpers.ts`, `CURRENT.md` §1, §2, §3.

---

### ADR-010 — Asignación de Fondos, tipo de documento y herencia de plan (2026-09-02)

- **Contexto:** Después de la implementación base de RindeNX, se detectó la necesidad de:
  1. Asignar fondos específicos a usuarios (no solo "tener rendiciones abiertas")
  2. Separar el asiento contable según el tipo de documento (boleta vs factura) para cumplir con la lógica del SII chileno
  3. Simplificar la creación de usuarios desde el admin (heredar plan y configuración)

- **Decisión (implementada):**
  1. **Hoja `Fondos` agregada al spreadsheet** (columnas A:I):
     - El admin asigna un fondo con `monto_asignado`, `saldo` (se actualiza), `observacion` (glosa) y `estado`
     - Estados: `en_curso` (puede recibir rendiciones) / `cerrado` (no recibe más)
     - Permite múltiples fondos activos por usuario
  2. **Columna `tipo_documento` agregada a `GastosRinde` (columna O)**:
     - Valores: `boleta`, `factura`, `voucher`, `sin_comprobante`
     - **El puente solo pasa `boleta` y `voucher`** (gastos menores). Las `factura` NO pasan a GastosNX.
     - `sin_comprobante` se permite en RindeNX pero NO pasa al puente.
  3. **Asiento contable separado en 3 líneas** (Nivel intermedio SII):
     - Línea 1: `Gastos operacionales (boletas/vouchers)` → Debe
     - Línea 2: `Proveedores por pagar (facturas)` → Debe
     - Línea 3: `Caja / Banco` → Haber (total)
     - No se maneja IVA ni retenciones (lo hace el contador después).
  4. **Herencia automática al crear usuarios desde `/admin`**:
     - El nuevo usuario hereda del admin: `plan`, `limite_boletas`, `empresa_nombre`, `sheet_id_asociado`
     - El admin solo elige: `tipo_usuario` y `rol`
     - El campo `sheet_id_asociado` es el mismo spreadsheet (contiene Gastos y Rinde).

- **Estructura del spreadsheet unificado (un solo archivo por cliente):**
  - `Gastos` (GastosNX)
  - `Rendiciones` (cabecera de rendiciones, con `fondo_id` columna K)
  - `GastosRinde` (gastos individuales de rendiciones, con `tipo_documento` columna O)
  - `Asientos` (contables, 3 líneas por rendición)
  - `Puente` (trazabilidad RindeNX → Gastos)
  - `Fondos` (asignaciones del admin)
  - `Config_Rinde` (config del puente)

- **Faltante (deuda técnica para próximas iteraciones):**
  - UI para vincular rendiciones con fondos (campo `fondo_id` ya existe en schema, falta en formularios)
  - Descuento automático del `saldo` del fondo al aprobar una rendición
  - Dashboard unificado para admin `ambos` con pestañas Gastos/Rinde/Fondos

- **Referencias:** `src/lib/rinde-helpers.ts`, `src/app/api/rinde/fondos/`, `src/app/rinde/fondos/`, `src/app/admin/page.tsx`.

---

### ADR-011 — Modelo "una rendición por fondo" + asiento cuadrado con cuentas configurables (2026-09-03)

- **Contexto:** En la validación del flujo RindeNX se detectaron dos mejoras de fondo:
  1. El modelo anterior permitía crear una rendición por cada "evento" de gastos, duplicando rendiciones para el mismo fondo y dificultando la diferencia rendido vs. asignado.
  2. El asiento contable era de 3 líneas fijas (`Caja/Banco`) y no reflejaba la **diferencia** entre lo rendido y lo asignado del fondo (saldo en contra / saldo a favor), ni permitía configurar las cuentas. Además, `Config_Rinde` había crecido a 7 columnas (A:G) pero `generateAsientoContable` ignoraba las columnas E/F.

- **Decisión (implementada):**
  1. **Modelo "una rendición por fondo en curso":**
     - Cada fondo tiene una única rendición `abierta`. "Rendir contra este Fondo" reutiliza la rendición `abierta` existente (o crea una con `monto_estimado` = saldo del fondo).
     - El usuario agrega gastos varias veces (OCR individual/masivo) a la **misma** rendición y puede **sobre-render** (rinde más del fondo asignado).
  2. **Estados de rendición ampliados:**
     - `abierta` → el usuario la cierra manualmente con **`marcar_terminada`** → `terminada` (bloquea agregar/editar gastos).
     - Admin: `abrir`/devolver (vuelve a `abierta`), `aprobar` (con/sin puente), `rechazar`, o `pagar_saldo_favor` (registra fecha/medio/monto y cierra la rendición pagando el saldo a favor).
  3. **Bloqueo por estado/ownership en el servidor:**
     - `POST /api/rinde/gastos` solo acepta agregar gastos si la rendición está `abierta` y pertenece al usuario (salvo admin).
     - El `monto_total` (col E) se recalcula en vivo sumando **solo los gastos de esa rendición**.
  4. **Asiento contable cuadrado (Debe = Haber) — supera al asiento de 3 líneas del ADR-010:**
     - Débito: `Gastos operacionales – Facturas` y `Gastos operacionales – Boletas/Vouchers`.
     - Débito (si rindió menos): `Saldo en contra ({cuenta_saldo_contra})`.
     - Haber: `{cuenta_anticipo}` por el monto asignado del fondo.
     - Haber (si rindió más): `Saldo a favor ({cuenta_saldo_favor})`.
     - `generateAsientoContable` ahora recibe las tres cuentas configurables de `Config_Rinde!E:G` (antes ignoraba E/F).
  5. **Respaldo de diferencia en la UI:**
     - `GET /api/rinde/rendiciones/[id]` devuelve el `fondo` (monto_asignado + saldo) para comparar el total rendido contra el **asignado** (no contra el monto_total de la rendición).
  6. **La app es un registro operacional, no un sistema contable.** El asiento es un respaldo para el contador, exportable en **CSV / PDF (print)** y compartible por **correo o WhatsApp**.

- **Deprecada / Superada:** el asiento de 3 líneas descrito en ADR-010 punto 3 queda reemplazado por el asiento cuadrado del ADR-011.

- **Referencias:** `src/lib/rinde-helpers.ts` (`generateAsientoContable`), `src/app/api/rinde/gastos/route.ts`, `src/app/api/rinde/rendiciones/[id]/route.ts`, `src/app/api/rinde/puente/route.ts`, `src/app/rinde/dashboard-client.tsx`, `src/app/rinde/rendiciones/[id]/detalle-client.tsx`, `CURRENT.md` §6.

---

### ADR-012 — Rediseño de landing GastosNX: enfoque explicativo con flujos visuales

- **Fecha:** 2026-09-22
- **Estado:** Aceptada (implementada)
- **Contexto:** La landing de GastosNX original (ADR-007) era una landing de marketing estándar con secciones genéricas (features, problemas, FAQ). El problema comercial es que GastosNX requiere **educación**: el visitante no entiende automáticamente qué son los "gastos operacionales menores" ni por qué importa registrarlos. RindeNX vende rápido porque el problema es evidente ("entrego dinero y necesito controlar cómo se rindió"), pero GastosNX necesita explicar un concepto más difuso.
- **Decisión (implementada):** Rediseñar la landing con 19 secciones siguiendo una directriz de "explicación visual y flujos": cada concepto se explica con un flujo visual, no solo con texto. El visitante debe poder explicar GastosNX con sus propias palabras al terminar el recorrido: "Es donde registro y respaldo los gastos de mi empresa que no necesariamente pasan por una factura."
- **Principios clave:**
  1. **No explicar solo con texto.** Cuando un concepto pueda explicarse con un flujo, mostrar el flujo.
  2. **El dato y el flujo son el diseño.** Priorizar tablas, registros, documentos, estados, filtros, totales, historial y flujos. Evitar ilustraciones abstractas, robots, sparkles, imágenes de stock.
  3. **Dashboard con datos reales.** No mostrar un dashboard genérico; mostrar una interfaz con información realista ($1.245.800 total, 47 documentos, desglose por categoría).
  4. **Ejemplo concreto.** Un peaje de $8.500 recorre todo el sistema, mostrando qué captura GastosNX.
  5. **Comparación Antes/Después.** Flujo visual del problema (7 pasos sin sistema) vs la solución (7 pasos con GastosNX).
  6. **RindeNX→GastosNX como sección estratégica.** Separar factura (proceso contable) de boleta/voucher (→ GastosNX).
  7. **Beneficios por perfil.** Empresa, admin, trabajador, contador: cada uno entiende qué gana.
  8. **Declaración de Renta como consecuencia del orden**, no como promesa fiscal.
- **Alternativas consideradas:** mantener la landing anterior con tweaks menores (descartado, no resuelve el problema de educación comercial); crear una página interactiva con JavaScript pesado (descartado, impacto en performance y mantenibilidad).
- **Consecuencias:** Landing más extensa que RindeNX (necesario para educación comercial). Mayor mantenimiento de la página principal. Mejor comprensión del producto por parte del visitante. Se eliminaron dependencias de imágenes de fondo (`problema_boletas.webp`, `cierre_cta.webp`) que ya no se usan.
- **Referencias:** `src/app/page.tsx`, `CURRENT.md` §2 (cambios adicionales recientes), ADR-012.

### ADR-013 — El proxy de subdominios interceptaba `/api/**` y rompía RindeNX en producción

- **Fecha:** 2026-09-14
- **Estado:** ✅ **Resuelto** (implementado y verificado)
- **Contexto:** El proxy de `src/proxy.ts` (Next 16, antes `middleware`) enruta `rinde.nxchile.com` hacia la app RindeNX que vive en `src/app/rinde/`, reescribiendo con prefijo `/rinde` toda ruta no reconocida. Sin embargo, **las API routes no viven bajo `src/app/rinde/`**: están en `src/app/api/` y son **compartidas** por ambos productos (`/api/auth`, `/api/auth/me`, `/api/auth/logout`, `/api/rinde/**`, `/api/expenses`, `/api/get-company-config`, etc.). El rewrite final no las excluía, por lo que en el subdominio toda API se convertía en `/rinde/api/**`, ruta inexistente.
- **Síntoma reportado:** login desde `rinde.nxchile.com` fallaba con `Unexpected token '<', "<!DOCTYPE "... is not valid JSON`.-origen: `src/app/login/page.tsx` ejecuta `await response.json()` sin validar `content-type`; recibía el HTML del 404.
- **Alcance real (mayor al reportado):** no era solo el login. **Todas** las APIs devolvían `404 text/html` en el subdominio, por lo que RindeNX cargaba el shell del dashboard pero **sin datos**. `gastos.nxchile.com` nunca se vio afectado porque el proxy retorna temprano cuando el host no empieza con `rinde.`.
- **Origen del defecto:** latente desde `c54ba0f` (creación del proxy); ningún commit posterior lo introdujo. El commit `4fd2800` (agregar `/precios`) solo añadió un caso al `switch` y no altera este comportamiento.
- **Por qué no se detectó antes:** (1) en desarrollo local el proxy no se activa salvo que se envíe `Host: rinde.nxchile.com`; (2) la verificación registrada el 2026-09-08 cubrió **páginas** (`/`, `/login` → `200`) pero nunca llamadas API, por lo que el defecto pasó como "funcionando".
- **Decisión (implementada):** agregar un passthrough explícito de `/api/` en el proxy, antes del rewrite final:
  ```typescript
  // API routes: viven en /api/* y son compartidas por ambos productos
  if (pathname.startsWith('/api/')) {
    return NextResponse.next()
  }
  ```
  Es **aditivo**: no altera ninguna rama previa (`/`, `/landing`, `/login`, `/precios`, `/rinde**`, assets, rewrite final).
- **Alternativas consideradas:**
  1. *Mover las API de RindeNX bajo `src/app/rinde/api/`* — descartado: rompe el diseño compartido de endpoints entre productos, duplica rutas y exige cambiar todos los `fetch` del cliente.
  2. *Excluir `api` en el `matcher` del proxy* — descartado: el `matcher` decide si el proxy corre, no qué ruta se sirve; excluirlo dejaría el rewrite igual y no resuelve el problema (además reduce la cobertura de pruebas futuras).
  3. *Endurecer `login/page.tsx` validando `content-type` antes de `json()`* — **complementario, no sustituto**: mejora el mensaje de error para el usuario, pero no devuelve la API. Se deja como mejora de robustez futura.
- **Consecuencias:** RindeNX vuelve a ser funcional en `rinde.nxchile.com`. Se formaliza la regla de que **cualquier ruta bajo `/api/` debe pasar sin prefijo** en subdominios con rewrite. Se agrega `PRUEBAS_LOCALES.md` §11 con pruebas que exigen el header `Host: rinde.nxchile.com`, porque sin él el proxy no se ejercita y la prueba pasa siempre. Sin credenciales reales para las pruebas: el POST usa un email ficticio y solo valida el formato de la respuesta.
- **Verificación:** build en verde; APIs en el subdominio devuelven JSON (`401` sin sesión); `/api/auth` responde `{"error":"..."}` en `401` en lugar de HTML; páginas y assets que funcionaban conservan su código (`/`, `/precios`, `/login`, `/rinde-landing` → `200`; `/rinde`, `/rinde/fondos` → `307`; `/super-admin` → `404` por diseño).
- **Referencias:** `src/proxy.ts`, `src/app/login/page.tsx`, `DEPLOY.md` §2.1, `PRUEBAS_LOCALES.md` §11, `CURRENT.md` §2.

### Nota sobre registro de nuevas inconsistencias

A partir de ahora, cualquier nueva inconsistencia detectada se registrará con el formato ADR de la sección anterior y una referencia cruzada en `CURRENT.md` (sección "Observaciones / temas pendientes").

## Guía para registrar nuevas decisiones

Se documenta una decisión cuando:

- Se cambia demasiado la arquitectura o el flujo de datos.
- Se agregan/eliminan servicios o dependencias clave (Base de Datos, Storage, OCR, Auth, etc.).
- Se modifica el esquema de Google Sheets (columnas/tablas).
- Se cambian planes, límites o reglas de negocio.
- Se introduce un nuevo patrón que afecte a múltiples módulos.
- Se detecta una inconsistencia de diseño y se decide su resolución (recomendación: además descrita en `CURRENT.md`, sección "Observaciones").

### ADR-014 — Serialización del consumo de cupos con Apps Script LockService

- **Fecha:** 2026-10-13
- **Estado:** 🟡 **Implementado, pendiente de validación en el sistema desplegado**
- **Contexto:** `Usuarios!F` se actualizaba con leer-luego-escribir. Dos peticiones simultáneas leían el mismo valor y escribían el mismo `+1`: se perdía un incremento. Google Sheets **no ofrece incremento atómico de celda ni escritura condicional**, y un bloqueo en memoria no serviría porque las instancias serverless son efímeras y no coordinan entre sí. El commit `38b2ea2` eliminó la pérdida **derivando el consumo de las filas reales de `Gastos`**, lo que corrigió el conteo pero dejó dos problemas: (a) `rinde/puente` escribía en `Gastos` **sin validar el cupo en absoluto**, y (b) un reintento de la misma operación creaba una segunda fila y consumía dos veces.
- **Decisión:**
  1. **LockService de Google Apps Script** serializa toda operación que consuma cupos. Dentro de la sección crítica (verificar clave → releer consumo y límite → decidir → escribir) desaparece la carrera. Autorizado expresamente por el usuario; sin KV/Redis ni servicios de terceros.
  2. **`idempotency_key` viaja en el mismo append que la fila**, de modo que no existe ventana con gasto sin clave. Un reintento devuelve el resultado original sin crear fila ni consumir.
  3. **Nunca se borra un gasto válido.** Si aun así el consumo superara el límite, se marca `estado='rechazado'` **solo la fila propia**; un registro rechazado no cuenta para el consumo.
  4. **Falla cerrado.** Sin `GAS_LOCK_URL`/`GAS_LOCK_SECRET`, o si el script no responde, las rutas devuelven `503` y no escriben. Ninguna ruta conserva una escritura alternativa que eluda el bloqueo.
  5. **`Usuarios!F` es informativo.** El consumo se deriva de las filas, así que un fallo al actualizarlo no pierde nada y la reconciliación lo repara. Ese es el mecanismo de recuperación ante fallos parciales: no se asume que varias escrituras en Sheets sean atómicas.
  6. **Lecturas controladas:** `/api/auth/me` no lee Sheets si la sesión tiene menos de 5 minutos; al vencer el plazo reconcilia contador y límite y renueva la cookie. Un cambio administrativo puede tardar hasta 5 minutos en reflejarse.
- **Esquema:** `Gastos` de `A:L` a `A:N` — `M`=`idempotency_key`, `N`=`estado`. Ambas vacías cuentan como estado `ok`, por lo que los registros históricos **no se modifican** y no requieren backfill. La migración la ejecuta el usuario de forma explícita (`action=migrate`), nunca automáticamente.
- **Alternativas consideradas:**
  - **Contador atómico externo (Redis/KV):** la más robusta, pero introduce dependencia e infraestructura prohibidas sin autorización.
  - **Derivación desde filas (`38b2ea2`):** elimina incrementos perdidos sin infraestructura, pero no idempotencia ni serialización estricta. Se mantiene como segunda barrera y como mecanismo de reconciliación.
  - **Rollback compensatorio:** choca con la regla de no eliminar gastos válidos. Se sustituyó por **neutralizar** (marcar rechazado) en lugar de borrar.
- **Riesgos aceptados:** latencia adicional de 1–3 s en el guardado (la clave de idempotencia neutraliza el doble clic que provoca); `getScriptLock()` serializa globalmente y no por empresa; la edición manual de `Gastos` en el navegador queda fuera del bloqueo.
- **Pendiente:** el script no está desplegado. La garantía central **no está validada** hasta ejecutar pruebas concurrentes reales contra el endpoint desplegado (ver `docs/DEPLOY_GAS_LOCK.md` §8).
- **Referencias:** `google-apps-script/GastosLock.gs`, `src/lib/gastos-lock.ts`, `src/app/api/save-expense/route.ts`, `src/app/api/rinde/puente/route.ts`, `src/app/api/auth/me/route.ts`, `docs/DEPLOY_GAS_LOCK.md`.Antes de registrar:

- Revisar si la decisión contradice una existente → si es el caso, indicarlo y justificar el cambio.
- Marcar con estado `Deprecada`/`Superada` la decisión anterior afectada.
- Mantenerlo en español y consistente con `AI_PROTOCOL.md`.