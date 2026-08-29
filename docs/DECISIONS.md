# DECISIONS.md — Registro de Decisiones de Arquitectura

> **Fuente de verdad de las decisiones de arquitectura.**
> Cada decisión relevante se registra aquí. No contradecir una decisión registrada sin justificación técnica y sin actualizar este documento.

**Última actualización:** 2026-08-09

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
- **Estado:** Propuesta (pendiente de corrección)
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
- **Estado:** Propuesta (pendiente de corrección)
- **Contexto:** En `api/ocr` (Google Cloud Vision) el campo `confidence` se fija en **95** de forma fija, porque Google Vision no entrega confianza en `TEXT_DETECTION`. Ese valor se usa luego para colorear badges ("Confianza OCR") y para mensajes de advertencia, dando una falsa sensación de precisión.
- **Decisión (pendiente):** El `ocr_confidence` no debe reflejar un valor inventado. Evaluar una heurística de confianza derivada del parseo (p. ej. completitud de campos extraídos por `lib/parser.ts`) o marcar el valor como no disponible.
- **Alternativas consideradas:** usar la confianza de documento de Vision (no disponible en este modo); calcular un índice de completitud del parseo.
- **Consecuencias:** Mejora la fiabilidad de la UI y evita decisiones erróneas del usuario basadas en una confianza falsa.
- **Pasos a corregir:**
  1. En `api/ocr`, quitar el `confidence` fijo en 95.
  2. Calcular un índice de confianza basado en cuántos campos clave (`proveedor`, `monto`, `fecha`, `rut`) se extrajeron en el parseo.
  3. Ajustar la UI (`ExpenseForm`) para reflejar ese índice o un estado "no disponible".
- **Referencias:** `src/app/api/ocr/route.ts`, `src/components/ExpenseForm.tsx`, `src/lib/parser.ts`.

---

### ADR-006 — Endpoints y librerías no utilizadas (código muerto)
- **Fecha:** 2026-08-09
- **Estado:** Propuesta (pendiente de corrección)
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

Antes de registrar:

- Revisar si la decisión contradice una existente → si es el caso, indicarlo y justificar el cambio.
- Marcar con estado `Deprecada`/`Superada` la decisión anterior afectada.
- Mantenerlo en español y consistente con `AI_PROTOCOL.md`.