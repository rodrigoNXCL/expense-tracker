# CURRENT.md — GastosNX / RindeNX

> **Fuente de verdad del estado actual del proyecto.**
> Este documento debe mantenerse sincronizado con cualquier cambio estructural. Léelo antes de modificar código.

**Última actualización:** 2026-09-22

---

## 1. Resumen del proyecto

**GastosNX** (versión `1.0.0`) es una aplicación web chilena para registrar, respaldar y categorizar **gastos operacionales menores** (peajes, estacionamientos, colaciones, combustibles, etc.) destinada a pymes y contadores en Chile.

Propósito principal: capturar el respaldo de un gasto antes de que se pierda, ordenarlo y dejarlo listo para la Declaración de Renta anual (compatible con requisitos SII). **No determina deducibilidad tributaria** — solo respaldo y orden documental.

**Marca / URL:** gastos.nxchile.com · Autor: NXChile · Contacto: gastos@nxchile.com
> ℹ️ **Marca (2026-08-10):** la interfaz fue unificada de **"GastosSII"** → **"GastosNX"** (navbar, footers, textos y emails). El logotipo oficial es `public/images/LogogastosNX.png` (693×138, usado con `width={693}`/`height={138}` y clases `h-* w-auto object-contain`).

### RindeNX (sistema independiente, en desarrollo)

> ⚠️ **Coexistencia:** RindeNX es un **sistema independiente** que coexiste con GastosNX en el mismo repositorio. Ambos productos tienen dashboards separados, datos independientes y un **puente opcional** que permite aprovechar ciertos documentos de rendiciones en la línea de Gastos.

- **Subdominio:** `rinde.nxchile.com` (mismo deploy que `gastos.nxchile.com`, enrutado por `src/proxy.ts`). **Desplegado y verificado (2026-09-08):** dominio agregado en Vercel, DNS en Cloudflare (`CNAME rinde → expense-tracker-nxchile.vercel.app`) propagado y `COOKIE_DOMAIN=.nxchile.com` configurado. Detalles en `DEPLOY.md` §2.1.
- **Landing pública:** `src/app/rinde-landing/` (ruta `/rinde-landing`, pública sin auth; en `rinde.nxchile.com` es la raíz vía proxy). Paleta ámbar/naranja (RindeNX). Secciones: Hero+CTA demo, Prueba social (logos), "¿Tu empresa todavía funciona así?" (pain points), Cómo funciona (timeline 7 pasos), Demo visual (2 cards de fondo), Beneficios (fondo completo controlado), RindeNX+GastosNX (ecosistema), Testimonios (Antes→Resultado), CTA final (demo+WhatsApp). Contacto: `rinde@nxchile.com`.
- **Página de precios:** `src/app/precios/` (ruta `/precios`, pública sin auth). SEO optimizado (title, meta description, OG, structured data SoftwareApplication/Organization/FAQPage/BreadcrumbList). Selector mensual/anual, 4 planes (Pyme $9.900/$12.900, Empresa $19.900/$24.900, Pro $34.900/$44.900, +30 cotizar), flujos visuales (fondo→contabilidad, admin→rendidor→contabilidad, RindeNX→GastosNX), beneficios, sectores, FAQ 9 preguntas, CTA demo/WhatsApp.
- **SSO entre subdominios:** la cookie `gx_session` acepta `domain` vía la variable `COOKIE_DOMAIN` (p.ej. `.nxchile.com`). En localhost debe quedar vacía. Con el mismo deploy + `AUTH_SECRET`, login en un subdominio vale para ambos.
- **Funcionalidad:** Manejo de rendiciones de fondos fijos, gastos de personal, revisión/aprobación por admin, generación de asiento contable.
- **Asignación de fondos:** El admin asigna un monto + observación/glosa a un usuario, quien rinde contra ese fondo.
- **Puente (Fase 5):** RindeNX → GastosNX (dirección única). Solo aplica a empresas con `gastos_activo=TRUE` en la hoja `Config_Rinde` del spreadsheet.
- **Usuarios afectados por el puente:** solo `tipo_usuario: ambos` y empresas que también usan GastosNX.
- **NO comparte tablas con GastosNX:** cada cliente tiene su propio spreadsheet que contiene tanto la línea de Gastos como la de RindeNX.

---

## 2. Plan de 8 Fases del Proyecto

| # | Fase | Estado | Descripción |
|---|------|--------|-------------|
| 1 | Identificación de usuario | ✅ Completada | Campo `tipo_usuario` agregado a la hoja Users (columna K). Valores: `gastos`, `rinde`, `ambos`. |
| 2 | Dashboard super-admin con navegación | ✅ Completada | Autenticación contra Google Sheets, layout con navbar, logout, listado de fases. |
| 3 | Gestión de usuarios en la hoja Users | ✅ Completada | CRUD de usuarios desde el super-admin (`/super-admin/usuarios`) con filtros, modal de edición y modal de creación. |
| 4 | Gestión de empresas (hoja Config) | ✅ Completada | CRUD de empresas desde el super-admin (`/super-admin/empresas`) con validación de email/subdomain/sheet_id. |
| 5 | Puente GastosNX + RindeNX | ✅ Completada | Integración unidireccional RindeNX → GastosNX con selección manual de gastos al aprobar rendición. Solo `boleta` y `voucher` pasan (las `factura` no). |
| 6 | RindeNX - Fondos y asientos | ✅ Completada | Spreadsheet RindeNX con 7 hojas (Rendiciones, GastosRinde, Asientos, Puente, Fondos, Config_Rinde + Gastos), dashboard, rendiciones, gastos, aprobación, asiento contable. |
| 7 | RindeNX - Puente de documentos | ✅ Completada | Vista `/rinde/puente` con tabla de documentos traspasados, filtros y sección en detalle de rendición mostrando los gastos pasados. |
| 8 | Documentación y despliegue | ✅ Completada | Actualización de `CURRENT.md` y `DECISIONS.md`, guía de pruebas locales, guía de despliegue de `rinde.nxchile.com`. Despliegue verificado y funcionando (2026-09-08). |

### Cambios adicionales recientes (post-Fase 8)

- ✅ Hoja `Fondos` agregada (asignación de fondos por admin)
- ✅ Columna `tipo_documento` en `GastosRinde` (boleta/factura/voucher/sin_comprobante)
- ✅ Asiento contable separado por tipo (boletas vs facturas)
- ✅ Herencia de plan/boletas/empresa al crear usuarios desde el admin
- ✅ **Bug login corregido (2026-09-03):** la hoja Usuarios se leía solo hasta la columna J, por lo que `tipo_usuario` (columna K) nunca se cargaba en la sesión y todo usuario caía en `/dashboard`. Se amplió el rango a `Usuarios!A2:K100`, se agregó `tipo_usuario` al payload de sesión y a los tipos `SessionPayload`/`UserSession`. Ahora:
  - `rinde` → login redirige a `/rinde`
  - `ambos` → login redirige a GastosNX `/dashboard` y muestra botón **RindeNX** en el navbar (también redirige a `/rinde` si es `solo rinde`)
  - `gastos` → bloqueado de `/rinde` (layout redirige a `/dashboard`)
- ✅ Vinculación rendiciones ↔ fondos: `rendiciones` guardan `fondo_id` (col K), y al aprobar se descuenta el `monto_total` del saldo del fondo (`Fondos!D{row}`).
- ✅ Asignación de fondos filtra usuarios: solo se listan usuarios con `tipo_usuario` = `rinde` o `ambos` (se excluye `gastos`).
- ✅ Dashboard RindeNX rediseñado: diseño elegante (fondos neutros, stat cards arriba, pestañas **Fondos en Curso** / **Rendiciones**). Para usuarios no-admin se **oculta** el Puente de Documentos y se muestra flujo atado a un fondo único.
- ✅ OCR + Supabase en captura de gastos de RindeNX: `/rinde/rendiciones/[id]/nuevo-gasto` ahora tiene captura de imagen (`CameraCapture`), OCR con pre-relleno (`OcrProcessor` + `parseBoletaChilena`), vista previa y subida del comprobante a Supabase Storage. `/api/rinde/gastos` acepta `multipart/form-data` (imagen + datos), sube la imagen y guarda `image_url` (col K). El detalle de rendición muestra miniatura del comprobante.
- ✅ **Bugs corregidos (2026-09-03, sesión de revisión):**
  - **Listado de usuarios al asignar fondo:** `/api/admin/users` (GET) leía `Usuarios!A2:J` y nunca devolvía `tipo_usuario` (col K), por lo que la asignación de fondos no mostraba ningún usuario (filtro `rinde`/`ambos`). Ampliado a `Usuarios!A2:K`. El PUT ahora lee/escribe `A:K` y preserva `tipo_usuario`.
  - **Refresco de fondos/rendiciones:** los GET de `/api/rinde/fondos` y `/api/rinde/rendiciones` ejecutaban `ensureRindeStructure` (7+ llamadas a Google Sheets) en cada lectura, causando carga lenta. Se eliminó de los GET (la estructura ya se asegura en los POST/escrituras y al crear el spreadsheet). El GET de rendiciones ahora lee `A2:K` e incluye `fondo_id`.
  - **`rinde/page.tsx`:** forzaba `tipo_usuario: 'rinde'` hardcodeado; ahora usa el tipo real de la sesión (afecta a usuarios `ambos`).
- ✅ **Corrección de mapeo puente → hoja `Gastos` de GastosNX:** el POST `/api/rinde/puente` escribía solo 11 valores corridos en `Gastos!A:L` (A=fecha, ... K=creado_por, L vacío). Ahora escribe las 12 columnas en el MISMO orden que `/api/save-expense` y que lee `/api/expenses`: `A=timestamp`, `B=fecha`, `C=rut`, `D=proveedor`, `E=monto`, `F=categoria`, `G=boleta_numero`, `H=giro`, `I=notas`, `J=ocr_confidence`, `K=image_url`, `L=creado_por`. Así los gastos pasados por el puente calzan idénticos a los gastos nativos de GastosNX.
- ~~⏳ Pendiente: Vincular dashboard unificado para admin `ambos`~~
- ~~⏳ Pendiente: Actualización de `docs/PRUEBAS_LOCALES.md` con los nuevos flujos~~
- ✅ **Modelo "una rendición por fondo" (2026-09-03):** cada fondo tiene una única rendición en curso. Al presionar **"Rendir contra este Fondo"** se reutiliza la rendición `abierta` existente (o se crea con `monto_estimado` = saldo del fondo). El usuario rinde varias veces (OCR individual/masivo) agregando gastos a la misma rendición, y puede **sobre-render** (rinde más del fondo asignado).
- ✅ **Estados de rendición ampliados:** `terminada` (el usuario cierra su rendición, bloqueando edición) → el admin puede `abrir`/devolver, `aprobar`, `rechazar` o `pagar_saldo_favor` (cierra la rendición pagando el saldo a favor al usuario).
- ✅ **Asiento cuadrado (Debe = Haber):** rediseñado en `generateAsientoContable` para reflejar la diferencia rendido vs fondo asignado (saldo en contra/a favor). Usa cuentas configurables de `Config_Rinde!E:F`. Ver estructura en §6.
- ✅ **Bloqueo de gastos por estado:** POST `/api/rinde/gastos` ahora valida que la rendición esté `abierta` y pertenezca al/los usuarios con permiso; rechaza agregar gastos una vez `terminada`/`aprobada`/`cerrada`. El `monto_total` de la rendición (col E) se recalcula en vivo sumando **solo sus propios gastos**.
- ✅ **Diferencia frente al fondo (2026-09-03):** el GET `/api/rinde/rendiciones/[id]` devuelve el `fondo` asignado (monto + saldo); la tarjeta de resumen del detalle y el mensaje de saldo en contra comparan el total rendido contra el **fondo asignado** (no contra el monto_total de la rendición).
- ✅ **ADR-011 (2026-09-03):** unificación del modelo a "una rendición por fondo", estados ampliados (`terminada`, `pagar_saldo_favor`), bloqueo de gastos por estado/ownership, y **asiento cuadrado (Debe = Haber)** con cuentas configurables de `Config_Rinde!E:G` (supera el asiento de 3 líneas del ADR-010). Detalles en `DECISIONS.md` ADR-011.
- ✅ **Refuerzo del parser OCR compartido (2026-09-03):** `src/lib/parser.ts` (`parseBoletaChilena`) se fortaleció y aplica a **ambos** productos (GastosNX `/captura` y RindeNX `/nuevo-gasto`). Correcciones: se eliminó un **loop infinito** (regex RUT sin flag `g`) que colgaba el parseo; detección de **tipo de documento** (boleta/factura/voucher); **monto** en la línea siguiente a `TOTAL:`/`MONTO COMPRA`; **RUT del proveedor** acotado al bloque superior del documento (no confunde tokens de tarjeta) tolerando formatos deformados por OCR; **proveedor** por razón social (SA./SPA./LTDA.); validación de dígito verificador del RUT.
- ✅ **Landing pública RindeNX (2026-09-08):** nueva ruta pública `src/app/rinde-landing/page.tsx` (+ `layout.tsx` con metadata/OG propios) con Hero+CTA, "Cómo funciona" (3 pasos), Beneficios (6 cards), Prueba social (logos clientes NXChile) y Contacto (WhatsApp + `rinde@nxchile.com` + acceso). Paleta ámbar/naranja; CTA a `/login` compartido; sin registrar usuarios (acceso por admin).
- ✅ **Proxy de subdominios (2026-09-08):** `src/proxy.ts` (Next 16 renombró `middleware` → `proxy`). En `rinde.nxchile.com`: `/`→`/rinde-landing`, `/login`→compartido, `/rinde**`→pasa directo, resto→rewrite `/rinde/<ruta>`. Fuera del host `rinde.` no hace nada. Assets estáticos siempre pasan.
- ✅ **SSO cookie entre subdominios (2026-09-08):** `src/lib/session.ts` firma la cookie `gx_session` con `domain` optativo vía `COOKIE_DOMAIN` (debe ser `.nxchile.com` en producción). Mismo deploy + mismo `AUTH_SECRET` hacen que gastos./rinde. compartan sesión; en localhost la variable se deja vacía y el comportamiento no cambia.
- ✅ **Despliegue en producción verificado (2026-09-08):** `rinde.nxchile.com` resuelve al mismo deploy que `gastos.nxchile.com`, carga la landing RindeNX en `/`, el login compartido funciona y la app `/rinde` opera con normalidad. Fase 8 cerrada.
- ✅ **Avance de consumo en "Fondos en Curso" (2026-09-14):** las tarjetas de fondo del dashboard ahora muestran barra de progreso de **avance del consumo** (`consumido = monto_asignado − saldo`, con % coloreado por umbrales), el monto consumido "de $X", y para el admin un badge con la cantidad y monto de rendiciones **en trámite** (abierta/terminada/en_revision) atadas al fondo. Se agrega el helper `consumoFondo()` en `dashboard-client.tsx`.
- ✅ **429 Google Sheets mitigado en flujo aprobar+puente (2026-09-14):** se eliminó `ensureRindeStructure` (≈7 lecturas) de los GET y PATCH de `rendiciones/[id]`, del GET/POST de `puente`, y del PATCH/DELETE de `fondos/[id]` (la estructura solo se asegura en los POST/escrituras). Además se deduplicaron lecturas: el POST `/api/rinde/puente` ya no relee `GastosRinde` (recalcula totales desde la lectura inicial) ni `Fondos` (una sola lectura usada para asignado y descuento de saldo); el PATCH de rendiciones igual reusa una lectura única de `Fondos`. El ciclo aprobar+puente pasa de ~55 a ~18 lecturas.
- ✅ **Avance vs fondo incluye sobre-rendición (2026-09-14):** en las tarjetas de fondo del dashboard (admin y rendidor) el avance refleja lo **efectivamente rendido** (incluye rendiciones en trámite): "Rendido $X de $Y", porcentaje (puede superar 100%), "aprobado/descontado" y badge verde "Sobre-rendido +$Z — saldo a favor a reembolsar" cuando se rindió más que el fondo asignado (`consumoFondo()` en `dashboard-client.tsx`).
- ✅ **Tarjetas superiores con avance (2026-09-14):** "Saldo Disponible" muestra barra de avance con "Comprometido (aprobado + en trámite) $X (pct%)"; "Por Revisar / Abiertas" muestra "Por $X en rendiciones en curso"; "Rendiciones Aprobadas" muestra "Total contabilizado $X".
- ✅ **Asiento contable desplegado completo (2026-09-14):** el GET de rendición solo devolvía la primera línea del asiento (el id se escribía únicamente en la fila cabecera), mostrando Debe/Haber en 0 cuando la primera línea era de facturas vacías. Se corrige: el GET filtra por `rendicion_id` (col B) para recuperar **todas** las líneas del asiento, y los generadores (POST `/api/rinde/puente` y PATCH rendiciones) escriben `asiento.id` en **todas** las líneas. El asiento de la rendición ejemplo se despliega completo y cuadrado.
- ✅ **Aviso "Fondo consumido/sobre-rendido" al agregar gasto (2026-09-14):** en `/rinde/rendiciones/[id]/nuevo-gasto` se consulta el detalle de la rendición; si el fondo está en $0 o ya se rindió ≥ monto asignado, se muestra un banner (ámbar si alcanzó el límite, verde si ya está sobre-rendido) indicando que igual puede registrar el gasto porque la sobre-rendición está permitida y el excedente se liquidará como saldo a favor al aprobar.
- ✅ **Detalle de rendición por rol (2026-09-14):** el rendidor ve solo lo que rindió (resumen, gastos y acciones de su rendición); la sección **Asiento Contable**, los **Documentos enviados a GastosNX (puente)** y la columna "Pasado a Gastos" quedan visibles únicamente para admins en `/rinde/rendiciones/[id]`.
- ✅ **Landing RindeNX — upgrades para campaña comercial (2026-09-14):** rediseño completo de `src/app/rinde-landing/page.tsx` para campañas de publicidad. Cambios: (1) CTA unificado a **"Solicitar demostración"** (→ WhatsApp) en hero, admin section, sticky mobile y CTA final; (2) nuevo subtítulo de posicionamiento en hero; (3) nueva sección **"¿Tu empresa todavía funciona así?"** con 7 pain points; (4) **timeline de 7 pasos** (reemplaza 3 cards con imágenes); (5) nueva sección **demo visual** con 2 cards de fondo (en revisión $800k / aprobada $300k); (6) beneficios reformulados: "El fondo completo controlado de principio a fin"; (7) nueva sección **RindeNX + GastosNX** (ecosistema con diagrama); (8) **testimonios placeholder** con estructura Antes→Resultado (AC, RCC, San Andrés); (9) imports limpiados (`Clock` eliminado). Versión actualizada: flujo visual RindeNX→GastosNX con split facturas/otros gastos, ejemplo concreto $500k, "Todo gasto cuenta", GastosNX como complemento natural.
- ✅ **Página de precios RindeNX (2026-09-14):** nueva ruta `/precios` (`src/app/precios/page.tsx` + `precios-client.tsx`). SEO completo (title, meta description, OG, structured data SoftwareApplication/Organization/FAQPage/BreadcrumbList, canonical, index/follow). Selector mensual/anual con toggle real de precios, 4 planes (Pyme $9.900/$12.900 con tag "PARA COMENZAR", Empresa $19.900/$24.900, Pro $34.900/$44.900, +30 cotizar). Copy: "Precio preferente con pago anual". Flujos visuales verticales con valores demo (fondo→contabilidad, admin→rendidor→contabilidad, RindeNX→GastosNX→Contabilidad). Beneficios, sectores, FAQ 9 preguntas (contenido en DOM para SEO), CTA demo/WhatsApp. Analytics: BillingToggle, PlanClick. Responsive mobile-first. Proxy `/precios` agregado en `src/proxy.ts`.
- ✅ **Landing → Precios linkage (2026-09-14):** la landing RindeNX ahora enlaza a `/precios` en 4 puntos: navbar ("Planes y precios"), hero CTA secundario ("Ver planes y precios"), CTA final ("Ver planes y precios") y footer (sección Producto).
- 🔴 **ADR-013 — Resuelto (2026-09-14):** el proxy de subdominios reescribía **`/api/**` → `/rinde/api/**`** (ruta inexistente), por lo que **todas** las APIs devolvían `404` con HTML en `rinde.nxchile.com`. Síntoma visible: el login fallaba con `Unexpected token '<', "<!DOCTYPE "... is not valid JSON` (`login/page.tsx` hace `response.json()` sin validar `content-type`). El alcance real era mayor: RindeNX cargaba el shell **sin datos**; `gastos.nxchile.com` nunca se vio afectado. El defecto era **latente desde `c54ba0f`** y no se detectó porque en local el proxy no se activa sin header `Host: rinde.nxchile.com` y porque las verificaciones previas solo cubrieron páginas. **Fix:** passthrough explícito `if (pathname.startsWith('/api/')) return NextResponse.next()` antes del rewrite final (aditivo, no altera ninguna rama previa). Verificado en dev y en producción. Pruebas en `PRUEBAS_LOCALES.md` §11; detalle en `DECISIONS.md` ADR-013 y `DEPLOY.md` §2.1.
- ✅ **Cambio y recuperación de contraseña para el usuario (2026-09-14):** el flujo quedó completo en sus dos vertientes. **Recuperación** (olvidé mi clave): `POST /api/auth/reset-request` envía un enlace con token HMAC de 1 h → página `/reset-password` → `POST /api/auth/reset-confirm`. **Cambio con sesión iniciada**: `POST /api/auth/change-password` (exige contraseña actual, nueva de mínimo 8 caracteres) + página `/mi-cuenta`, con botón "Mi cuenta" en las barras de ambos productos (`/rinde` y `/dashboard`). Ambos endpoints escriben siempre con sal, así que completan la migración de cuentas legacy. `/mi-cuenta` quedó registrada en el proxy (misma clase de bug que `/api/**`).
- ✅ **Instrucciones del generador de hash corregidas (2026-09-14):** `/admin/generador-hash` indicaba pegar el hash en la **columna C**, pero `password_hash` es la **columna B** (A=email, B=password_hash, C=empresa_nombre). Seguir esas instrucciones rompía el login. Se corrigió y se aclarar que **el usuario ingresa con la contraseña original, nunca con el hash**.

### Auditoría SEO/conversión de landings — RindeNX y GastosNX (2026-09-14)

Trabajo de auditoría previa y corrección quirúrgica sobre las landings públicas. **No se tocó ninguna funcionalidad operativa ni autenticada**: tras este trabajo el login, la sesión y todos los endpoints siguen intactos (verificado por regresión).

**Fase 0 — línea base (NO DISPONIBLE):** Search Console, GA4/analítica y Core Web Vitals no están accesibles desde el repositorio. **No se publicaron métricas, posiciones ni CTR inventadas.** Estado real obtained por verificación HTTP directa contra producción.

**P0 resueltos:**
- 🔴 **Canonical de RindeNX apuntaba a GastosNX.** El layout raíz (`src/app/layout.tsx`) tenía `<link rel="canonical" href="https://gastos.nxchile.com">` hardcodeado en `<head>`, que heredaba **todas** las páginas de RindeNX. Google recibía la instrucción de canonizar RindeNX contra el dominio hermano, impidiendo su indexación. **Fix:** se eliminó el `<link>` fijo, se declaró `metadataBase` + `alternates.canonical: '/'` en el layout raíz (dominio de GastosNX) y canonical propio `https://rinde.nxchile.com` en `app/rinde-landing/layout.tsx`. `/precios` ya traía el suyo y no se tocó.
- 🔴 **`robots.txt` y `sitemap.xml` no existían** (404 en ambos dominios). **Fix:** se implementaron como *route handlers* por host (`src/app/robots.txt/route.ts`, `src/app/sitemap.xml/route.ts`) y **no** como archivos estáticos en `public/`, porque ambos subdominios comparten deploy y un archivo único habría servido URLs del dominio equivocado. GastosNX declara 1 URL; RindeNX declara `/` y `/precios`. Se excluyen del rastreo `api/**`, paneles, pantallas autenticadas y `/registro`.
- 🔴 **Testimonios con métricas inventadas.** Se conservan la atribución a AC Constructores, RCC Servicios y Transportes San Andrés (autorización del owner), pero se **retiraron las cifras** que nunca fueron de los clientes ("80% menos tiempo administrativo", "60% más rápido", "0 sorpresas"). Se reemplazaron por descripciones cualitativas verificables del producto. **Pendiente:** si el owner obtiene cifras reales de esos clientes, se pueden reincorporar.
- 🔴 **Sin analítica ⇒ eventos de `/precios` muertos.** `BillingToggle` y `PlanClick` invocan `w.gtag(...)` dentro de `if (w.gtag)`, pero **no existe script de gtag/GA4 cargado en el proyecto**, por lo que nunca se disparan. **Pendiente de decisión de negocio:** instalar o no GA4. Hasta entonces no hay medición de conversión.

**P1 resueltos:**
- **Afirmaciones contables.** Se eliminó "sin errores" del texto de beneficios y se reemplazaron dos badges "Debe = Haber" por "Listo para tu contador"; el paso 7 del timeline ya no afirma "Debe = Haber, siempre". `/precios` ya estaba limpio.
- **Zoom bloqueado** (`maximumScale: 1, userScalable: false`) en ambos layouts: impedía ampliar en móvil (WCAG 1.4.4). Eliminado.
- **RindeNX no tenía FAQ** mientras GastosNX sí (y su FAQ ya decía correctamente que no determina deducibilidad). Se añadió FAQ de 5 preguntas a RindeNX, incluyendo: no reemplaza al contador, no determina deducibilidad, quién carga la rendición, qué pasa ante sobre-rendición y que GastosNX es opcional. Con disclaimer de registro operacional.

**Pendientes de decisión de negocio (no implementados):**
- Condiciones de contratación (hoy inexistentes). La política de privacidad **sí** se implementó.
- Identificador de GA4 (el gtag ya queda preparado y condicionado a `NEXT_PUBLIC_GA4_ID`; el owner lo verá más adelante).

### Utilidad explícita en las landings + privacidad (2026-09-14)

Segunda iteración de la auditoría: los H1 de ambas landings eran **ganchos de conversión**, no descripciones literales del producto. RindeNX no decía "fondos por rendir" en su H1 y GastosNX no decía "registro de gastos"; un visitante que solo leyera el titular no sabía qué era cada producto.

- **H1 ahora literal y diferenciado:**
  - RindeNX: "Controla tus **fondos por rendir** de principio a fin"
  - GastosNX: "Registra tus **gastos operacionales** y conserva cada respaldo"
  - **El gancho original no se perdió:** "Rendiciones que llegan cuadradas, todos los meses." (RindeNX) y "¿Dónde quedan los gastos que no son factura?" (GastosNX) se conservan como línea prominente bajo el H1.
- **Bloque "qué hace" de 3 pasos** en ambos heroes, para que la utilidad se entienda en segundos sin displazar el CTA.
- Se mantiene **un solo `<h1>` por página** (verificado).
- **Política de privacidad y tratamiento de datos** (`src/app/privacidad/page.tsx`), redactada a partir del comportamiento **verificado en código**: hojas en Google Sheets aisladas por empresa, imágenes en Supabase Storage, envío de la imagen a Google Cloud Vision para OCR, cookie `gx_session` httpOnly con vigencia de 7 días, avisos por Web3Forms sin incluir contraseñas, y aclaración de que no se almacenan datos bancarios. Enlada desde el pie de ambas landings y agregada al proxy.
- **GA4 preparado pero inactivo:** `src/app/layout.tsx` inyecta gtag **solo** si existe `NEXT_PUBLIC_GA4_ID`. Sin esa variable no se carga ningún script (verificado: 0 scripts). Al configurar el ID, los eventos `BillingToggle` y `PlanClick` de `/precios` —hoy código muerto por falta de gtag— pasan a registrarse.

**Deuda consciente:** los `no-explicit-any` y `no-unused-vars` del lint siguen abiertos; no afectan la medición ni confiabilidad.

### Cierre SEO: títulos, imagen OG y cross-sell (2026-09-14)

Última iteración de la auditoría, aplicada por indicación del owner. Sin tocar funcionalidad operativa ni autenticada.

**Títulos y meta descriptions** — alineados con los H1 literales ya modificados y diferenciados entre productos (requisito anti-canibalización):

| Página | Title |
|---|---|
| RindeNX | `Software de Rendición de Gastos y Fondos por Rendir \| RindeNX` |
| RindeNX `/precios` | `RindeNX \| Precios de software de rendiciones de gastos` |
| GastosNX | `Control de Gastos Operacionales y Boletas para Empresas \| GastosNX` |

> ⚠️ **Deuda consciente:** la base maestra recomienda *no* reemplazar un título con mejor rendimiento
> sin Search Console. **No hay acceso a Search Console**, así que estos títulos se aplicaron por
> coherencia con el H1 y por eliminación de canibalización entre productos, **no** por medición.
> Conviene reevaluarlos cuando exista la línea base real.

**Imagen Open Graph de RindeNX (bug corregido).** RindeNX reutilizaba `hero_principal.webp`, que es una **foto de marca de GastosNX**: al compartir un enlace de RindeNX en redes o en WhatsApp se veía el producto hermano. Se creó `src/app/rinde-landing/opengraph-image.tsx` con `next/og` (**incluido en Next, sin dependencias nuevas**) y Next inyecta la etiqueta `og:image` automáticamente. Verificado: responde `200 image/png`, 66 KB. Las referencias a `hero_principal.webp` se quitaron del layout de RindeNX.

**Cross-sell en ambos sentidos.** GastosNX **mencionaba** RindeNX en el texto pero **no lo enlazaba**: no existía ni una URL a `rinde.nxchile.com` en toda la landing, lo que además desperdiciaba el anchor para SEO. Se agregó enlace contextual con texto descriptivo y la aclaración de que son productos independientes. Verificado: 1 enlace en cada dirección.

**Claim sin respaldo retirado.** El badge **"MÁS POPULAR"** del plan Pro de GastosNX afirmaba una preferencia que no está respaldada por datos. Reemplazado por **"RECOMENDADO"**, que es una recomendación editorial y no una afirmación de Uso real. (El mismo criterio se aplicó antes a los testimonios con métricas inventadas.)

### Bugs de producción corregidos tras la auditoría (2026-09-14)

1. **OCR roto: `Cannot read properties of null (reading 'toFixed')`.** El cambio de ADR-005 (dejar de inventar un 95% de confianza y devolver `null`) dejó dos llamadas sin guardia:
   - `src/lib/ocr.ts`: `result.confidence.toFixed(0)` en el log. **Iba a romper en GastosNX** (ruta `/captura`).
   - `src/app/rinde/rendiciones/[id]/nuevo-gasto/nuevo-gasto-client.tsx`: badge `OCR {confidence.toFixed(0)}%` **y** la comparación `confidence >= 80`. **Iba a romper en RindeNX** (ruta de nuevo gasto).
   Se corrigieron ambos: el tipo `OcrResult.confidence` pasó a `number | null`, el log formatea solo si hay valor, y el badge muestra 'Texto reconocido · por verificar' (mismo criterio honesto que GastosNX, sin número inventado). Verificado contra imagen real: la API devuelve `confidence: null` y el flujo ya no lanza.
2. **Loop de redirección para usuarios solo-gastos en `rinde.nxchile.com`.** `rinde/layout.tsx` y `login/page.tsx` redirigían a `/dashboard` de forma relativa; en el subdominio rinde el proxy reescribe `/dashboard` → `/rinde`, el guard volvía a redirigir y la página quedaba en blanco o en bucle. Ahora ambos redirigen a la **URL absoluta** `https://gastos.nxchile.com/dashboard`, que es donde vive su app.

### Navegación entre productos: rutas absolutas (2026-09-14)

**Causa raíz común de los dos síntomas reportados.** GastosNX y RindeNX comparten deploy pero viven en subdominios distintos, y `src/proxy.ts` reescribe en `rinde.*` toda ruta desconocida con el prefijo `/rinde`. Consecuencia: **toda navegación entre productos con ruta relativa rompe**.

| Síntoma | Ruta relativa | Resultado | Fix |
|---|---|---|---|
| Usuario `gastos` entra a `/rinde` en el subdominio | `redirect('/dashboard')` | el proxy reescribe a `/rinde`, el guard reexpulsa y vuelve a redirigir: **bucle / pantalla en blanco** | URL absoluta a `gastos.nxchile.com/dashboard` |
| Usuario `rinde` en `/dashboard` de GastosNX | `replace('/rinde')` | queda en `/rinde/rinde`: **404 en blanco** | URL absoluta a `rinde.nxchile.com/rinde` |
| Usuario `ambos` en RindeNX pulsa "volver a GastosNX" | `push('/dashboard')` | se queda en el mismo subdominio, **nunca llega a GastosNX** | URL absoluta |

**Solución:** nuevo módulo `src/lib/domains.ts` con `RINDE_DASHBOARD` y `GASTOS_DASHBOARD` (URLs absolutas) más `isRindeHost()`. Se aplicó en **todos** los cruces entre productos: `login/page.tsx`, `rinde/layout.tsx`, `rinde/dashboard-client.tsx`, `dashboard/page.tsx`, `rinde/fondos`, `rinde/puente`, `detalle-client.tsx`, `captura/page.tsx` y `admin/page.tsx`.

> **Regla:** nunca cruzar productos con ruta relativa. Usar siempre las constantes de `lib/domains.ts`.
> Este bug es la misma familia que ADR-013 (el proxy reescribiendo rutas que debía dejar pasar): allí fue
> `/api/**`, aquí son las rutas de navegación entre dominios.

**Verificación con cookies de sesión reales** (firmadas con el mismo algoritmo que `session.ts`, HS256 de 3 partes):

| Perfil | Ruta probada | Resultado |
|---|---|---|
| solo-gastos | `/rinde` en el subdominio | redirige a `https://gastos.nxchile.com/dashboard` ✅ |
| solo-gastos | `/dashboard` en GastosNX | 200 ✅ |
| rinde | `/rinde` | 200 ✅ |
| ambos | `/rinde` | 200 ✅ |
| ambos | `/dashboard` en GastosNX | 200 ✅ |

### Corrección P0 de GastosNX: parser OCR y cupos (2026-10-13)

Tarea autorizada con alcance acotado: corregir la precisión del OCR y el desfase de cupos, sin tocar landings, motor de visión, login, permisos ni arquitectura.

#### 1. Causa raíz OCR: no era el motor, era el parser

Google Cloud Vision (`TEXT_DETECTION`) lee correctamente y con buena latencia: **1.6 s estable** (primera corrida 3.4 s por arranque en frío de la función serverless). No se cambió el motor ni las latencias.

Los fallos estaban en `src/lib/parser.ts`, al interpretar el texto:

- **Monto:** el regex "inline" era `/^(TOTAL|MONTO)[\s:]*([\d.,]+)$/` **sin flag multiline**, así que `^`/`$` anclaban a todo el string y nunca casaba. Cuando el total venía en la misma línea (`TOTAL 81.380`), no se detectaba y se caía al fallback, que terminaba devolviendo el **total de la tarjeta** (p. ej. 100.000) en vez del gasto (81.380).
- **Proveedor:** las abreviaturas con puntos (`S.A.`, `E.I.R.L.`) no casaban con `\bSA\b`. Sin razón social reconocida, el fallback elegía la primera línea "tipo nombre", que en muchas boletas es el encabezado del comprobante (p. ej. `R16.568.660-1`).
- **Fecha:** cuando el comprobante no trae fecha legible se usaba la de hoy **sin ningún indicador**, indistinguible de una fecha realmente leída.

**Correcciones aplicadas en `src/lib/parser.ts`:**
1. Monto: se cubre "TOTAL <valor>" en la misma línea **y** "TOTAL" solo con el valor en las líneas siguientes, con flag correcto; se excluyen explícitamente líneas de tarjeta/crédito/débito/cambio para que el fallback no las tome como total.
2. Proveedor: regex de razón social acepta abreviaturas con puntos; el fallback descarta líneas que son casi solo dígitos/puntuación (encabezados y códigos).
3. Fecha: nuevo campo `fechaDetectada` (interfaz `ParsedExpense`). No se inventa fecha; la UI recibe el flag para avisar.
4. **Aviso visible de fecha no encontrada** en `src/components/ExpenseForm.tsx`: cuando `fechaDetectada === false`, se muestra un aviso ámbar bajo el campo fecha indicando que se dejó la fecha de hoy y que debe revisarla.

**Precisión medida** (5 comprobantes, parser real vía ruta de prueba, valores esperados verificados a mano):

| Campo | Antes | Después |
|---|---|---|
| monto | 4/5 | **5/5** |
| proveedor | 1/5 | **5/5** |
| fecha | 4/4 evaluables | **4/4** |
| rut | 5/5 | **5/5** |

Sin regresión: un voucher con `MONTO DE COMPRA` en línea siguiente sigue extrayendo bien el monto y detectando `voucher`.

#### 2. Causa raíz de cupos: contador congelado en el JWT

El contador **sí se escribía** en Google Sheets, pero se leía e incrementaba desde el **JWT**, que queda congelado al iniciar sesión. Como el valor del JWT nunca cambiaba, cada guardado reescribía siempre `(valorJWT + 1)`, por lo que el contador **nunca avanzaba más allá de 1**. Además `/api/auth/me` devolvía el JWT tal cual, así que recargar la página o cambiar de dispositivo tampoco actualizaba nada.

**Correcciones aplicadas:**
- `src/app/api/save-expense/route.ts`: ahora **lee la fila vigente del usuario en `Usuarios`** (fuente de verdad) antes de validar el límite e incrementar. Reutiliza esa misma lectura para el incremento, por lo que **no añade una segunda consulta** a Sheets.
- `src/app/api/auth/me/route.ts`: rehidrata `limite_boletas` y `boletas_usadas` desde Google Sheets en cada lectura. Si la lectura falla, degrada al valor del JWT para no dejar al usuario sin sesión.
- `src/app/captura/page.tsx`: aplica también el `limite_boletas` vigente que devuelve el endpoint, no solo el contador.

Google Sheets se mantiene como fuente de verdad. No se cambió la fuente, no se añadieron endpoints/columnas/tablas.

**Pruebas de cupos ejecutadas** (caso base forzado a 500/0, usuario de prueba controlado, valores restaurados al final):

| Prueba | Resultado |
|---|---|
| 1. Crear 10 gastos con JWT congelado en 0 | Hoja queda **500 asignados / 10 consumidos / 490 disponibles**; contador avanza 1→10 ✅ |
| 2. `/api/auth/me` refleja el valor vigente | 10 (el JWT tenía 0) ✅ |
| 3. Recarga / segunda llamada con el mismo JWT viejo | 10 ✅ |
| 4. Cambio administrativo del límite (500→600) | `/api/auth/me` y el siguiente guardado reflejan 600 ✅ |
| 5. Dos guardados simultáneos | Ver limitaciones ⚠️ |
| 6. Gasto rechazado por límite (403) | El contador **no** se incrementa ✅ |

**Limitación conocida y no resuelta (medida, no oculta):** con **dos guardados simultáneos** desde el mismo JWT, ambos leen el mismo valor vigente y ambos escriben `+1`, por lo que se pierde una unidad (hoja quedó en 12 en vez de 13). Es una condición de carrera inherente al patrón leer-luego-escribir de Google Sheets (no ofrece actualización atómica de una celda). El caso realista de doble clic / reintento manual queda fuera de alcance de este arreglo. No se ha declarado resuelto.

#### Archivos modificados
- `src/lib/parser.ts` — extracción de monto, proveedor y marca de fecha.
- `src/components/ExpenseForm.tsx` — aviso de fecha no encontrada (único cambio de UI).
- `src/app/api/save-expense/route.ts` — cupos desde la hoja.
- `src/app/api/auth/me/route.ts` — rehidratación del contador.
- `src/app/captura/page.tsx` — aplica límite vigente.

#### Verificación adicional
- Build limpio.
- Lint sin errores nuevos en los archivos tocados (los de `ExpenseForm.tsx` son preexistentes: había 3 antes de estos cambios).

#### Restricciones respetadas
No se tocaron landings, motor de visión, login, permisos ni arquitectura. No se desplegó a producción (pendiente de autorización). No se modificó la fuente de verdad.

### Precios con IVA incluido (2026-09-14)

Confirmación del responsable de negocio: **todos los precios publicados son IVA incluido** en ambos productos. Se declaró en los puntos donde efectivamente se muestran los precios:

- **RindeNX `/precios`:** hero ("Desde $9.900 / mes · **IVA incluido**"), cada tarjeta de plan (bajo el precio), texto explicativo bajo las tarjetas, y **nueva FAQ** "¿Los precios incluyen IVA?". La pregunta se replicó en el **JSON-LD** (`FAQPage`), que quedó validado: 10 preguntas, parseo correcto.
- **GastosNX landing:** se quitó el "IVA incluido" repetido en dos líneas sueltas y se concentró en **una declaración única** bajo los precios, más **nueva FAQ** "¿Los precios incluyen IVA?".
- **GastosNX `/registro/pago`:** declaración bajo el desglose de precios, que es donde el cliente ve el monto antes de contratar.

> ℹ️ **Consistencia:** antes "IVA incluido" solo aparecía en GastosNX y únicamente en la FAQ de usuarios
> adicionales. RindeNX no lo declaraba en ningún punto, pese a publicar precios. Ahora ambos productos
> lo declaran en todos los lugares donde se muestra un precio. No se modificó ninguna cifra: solo se
> agregó la declaración que corresponde.
- ✅ **Landing GastosNX — rediseño explicativo con flujos (2026-09-22):** reescritura completa de `src/app/page.tsx` (landing principal) según directriz de "explicación visual y flujos". Cambios: (1) hero reformulado: "¿Dónde quedan los gastos que no son factura?"; (2) nueva sección **Problema** con flujo visual "Lo que pasa hoy" vs "Lo que debería paso" (7 pasos cada uno, fondo negro); (3) sección **Explicación simple** "Todo gasto cuenta"; (4) **Flujo principal** central con 5 etapas (Gasto→Captura→Registro→Respaldo→Historial) usando iconos y colores; (5) **Ejemplo real** de peaje $8.500 con los 6 campos que captura GastosNX; (6) **Antes vs Después** comparativo lado a lado; (7) **Dashboard mockup real** con stats ($1.245.800), desglose por categoría y registros recientes; (8) **Tipos de gastos** (8 categorías con iconos); (9) **Flujo mensual** timeline día 1→30; (10) **Flujo anual** 12 meses con acumulación; (11) **RindeNX→GastosNX** separación factura vs boleta/voucher; (12) **Caso completo** rendición con fondo $500k y 5 gastos; (13) **Beneficios por perfil** (empresa, admin, trabajador, contador); (14) **Contabilidad/revisión** con mockup de exportación; (15) **Declaración de Renta** como consecuencia del orden; (16) **Clientes reales** logos; (17) **Planes** Free+Pro; (18) **FAQ** 9 preguntas; (19) **CTA final** + contadores + Instagram. Principios: sin ilustraciones abstractas, flujos con CSS puro, dashboard con datos reales, el dato y el flujo son el diseño. Se eliminaron: imagen `problema_boletas.webp` de fondo, imagen `hero_principal.webp` en sección problema, sección "Solución/features" original con 6 cards genéricas, imagen `cierre_cta.webp` de fondo.

---

## 3. Estructura de carpetas de RindeNX

```
src/
  app/
    rinde/                                  # Módulo RindeNX
      layout.tsx                            # Auth guard
      page.tsx                              # Dashboard de RindeNX
      dashboard-client.tsx                  # UI dashboard
      puente/
        page.tsx                            # Vista de documentos del puente
        puente-client.tsx                   # UI de documentos traspasados
      fondos/
        page.tsx                            # Asignación de fondos
        fondos-client.tsx                   # UI de fondos
      rendiciones/
        [id]/
          page.tsx                          # Detalle de rendición
          detalle-client.tsx                # UI detalle + acciones + modal puente
          nuevo-gasto/
            page.tsx                        # Form nuevo gasto
            nuevo-gasto-client.tsx          # UI formulario
    rinde-landing/                          # Landing pública RindeNX (sin auth)
      page.tsx                              # Landing (Hero+CTA, Cómo funciona, Beneficios, Prueba social+contacto)
      layout.tsx                            # Metadata/OG propios de la landing
    precios/                                # Página de precios RindeNX (sin auth)
      page.tsx                              # Server component (SEO, structured data)
      precios-client.tsx                    # Client component (selector, planes, FAQ)
    api/
      rinde/
        rendiciones/
          route.ts                          # GET/POST rendiciones
          [id]/
            route.ts                        # GET/PATCH rendición
        gastos/
          route.ts                          # POST gastos (con tipo_documento)
        puente/
          route.ts                          # GET/POST puente
          documentos/
            route.ts                        # GET documentos del puente
        fondos/
          route.ts                          # GET/POST fondos
          [id]/
            route.ts                        # PATCH/DELETE fondo
  lib/
    rinde-helpers.ts                        # Helpers RindeNX (spreadsheetId, asientos, Fondos)
  proxy.ts                                  # Proxy de subdominios: rinde.* → RindeNX (Next 16)
```

---

## 6. Esquema de datos (Google Sheets)

### Hoja **Usuarios** (columnas `A:K`)
| Índice | Columna | Descripción |
|--------|---------|-------------|
| 0 | `email` | Email del usuario (único) |
| 1 | `password_hash` | Hash SHA-256 de la contraseña |
| 2 | `empresa_nombre` | Nombre de la empresa |
| 3 | `plan` | `free` / `pro` / `enterprise` |
| 4 | `limite_boletas` | Límite mensual de boletas |
| 5 | `boletas_usadas` | Contador mensual de boletas |
| 6 | `activo` | `TRUE` / `FALSE` |
| 7 | `rol` | `admin` / `user` / `superadmin` |
| 8 | `creado_en` | Timestamp ISO de creación |
| 9 | `sheet_id_asociado` | Spreadsheet de la empresa (contiene Gastos y Rinde) |
| 10 | `tipo_usuario` | `gastos` / `rinde` / `ambos` (Fase 1) |

### Hoja **Gastos** (columnas `A:L`) — para GastosNX
| Índice | Columna | Descripción |
|--------|---------|-------------|
| 0 | `timestamp` | Timestamp ISO de registro |
| 1 | `fecha` | Fecha del gasto (YYYY-MM-DD) |
| 2 | `rut` | RUT del proveedor |
| 3 | `proveedor` | Nombre del proveedor |
| 4 | `monto` | Monto (numérico) |
| 5 | `categoria` | Categoría |
| 6 | `boleta_numero` | N° de boleta |
| 7 | `giro` | Giro del proveedor |
| 8 | `notas` | Notas adicionales |
| 9 | `ocr_confidence` | Confianza del OCR |
| 10 | `image_url` | URL pública de la imagen en Supabase |
| 11 | `creado_por` | Email del usuario que registró el gasto |

### Hojas de RindeNX (en el mismo spreadsheet que Gastos)

#### `Rendiciones` (columnas `A:K`)
| Índice | Columna | Descripción |
|--------|---------|-------------|
| 0 | `id` | ID único de la rendición |
| 1 | `fecha_creacion` | ISO timestamp |
| 2 | `fecha_cierre` | ISO timestamp de cierre |
| 3 | `estado` | `abierta` / `terminada` / `en_revision` / `aprobada` / `rechazada` / `cerrada` |
| 4 | `monto_total` | Monto total de la rendición |
| 5 | `descripcion` | Descripción |
| 6 | `usuario_email` | Email del usuario que creó la rendición |
| 7 | `aprobado_por` | Email del admin que aprobó |
| 8 | `comentarios` | Comentarios del admin |
| 9 | `asiento_id` | ID del asiento contable |
| 10 | `fondo_id` | ID del fondo asignado (pendiente de UI) |

#### `GastosRinde` (columnas `A:O`)
| Índice | Columna | Descripción |
|--------|---------|-------------|
| 0 | `id` | ID único del gasto |
| 1 | `rendicion_id` | ID de la rendición padre |
| 2 | `fecha` | Fecha del gasto |
| 3 | `rut` | RUT del proveedor |
| 4 | `proveedor` | Nombre del proveedor |
| 5 | `monto` | Monto numérico |
| 6 | `categoria` | Categoría |
| 7 | `boleta_numero` | Número de boleta/factura |
| 8 | `giro` | Giro del proveedor |
| 9 | `notas` | Notas |
| 10 | `image_url` | URL de la imagen |
| 11 | `creado_por` | Email del usuario |
| 12 | `creado_en` | ISO timestamp |
| 13 | `pasado_a_gastos` | `TRUE` / `FALSE` |
| 14 | `tipo_documento` | `boleta` / `factura` / `voucher` / `sin_comprobante` |

#### `Asientos` (columnas `A:J`)
| Índice | Columna | Descripción |
|--------|---------|-------------|
| 0 | `id` | ID del asiento |
| 1 | `rendicion_id` | ID de la rendición |
| 2 | `fecha` | Fecha del asiento |
| 3 | `tipo` | Tipo de asiento (`rendicion`) |
| 4 | `cuenta` | Cuenta contable |
| 5 | `debe` | Monto en debe |
| 6 | `haber` | Monto en haber |
| 7 | `descripcion` | Descripción del asiento |
| 8 | `creado_por` | Email del admin |
| 9 | `creado_en` | ISO timestamp |

**Estructura del asiento (cuadrado, registro operacional que refleja la diferencia):**
- `Gastos operacionales – Facturas` → Débito (total facturas)
- `Gastos operacionales – Boletas/Vouchers` → Débito (total boletas + vouchers)
- Si rindió **menos** que el fondo: `Saldo por devolver del usuario` → Débito (diferencia)
- `Fondo por rendir – Cuenta por cobrar empleados` → Haber (monto asignado del fondo)
- Si rindió **más** que el fondo: `Saldo a favor del usuario – Reembolso` → Haber (diferencia)

El asiento **cuadra siempre** (Debe = Haber = monto asignado del fondo o total rendido). `cuenta_anticipo`, `cuenta_saldo_favor` y `cuenta_saldo_contra` son configurables en `Config_Rinde!E:G`. La app es un **registro operacional**, no un sistema contable: el contador usa este asiento como respaldo. Se descarga en **CSV / PDF (print)** y se comparte por **correo o WhatsApp**.

#### `Puente` (columnas `A:F`)
| Índice | Columna | Descripción |
|--------|---------|-------------|
| 0 | `id` | ID único del registro |
| 1 | `rinde_gasto_id` | ID del gasto en GastosRinde |
| 2 | `rendicion_id` | ID de la rendición |
| 3 | `gastos_row_number` | Fila donde se insertó en hoja Gastos |
| 4 | `pasado_en` | ISO timestamp del traspaso |
| 5 | `aprobado_por` | Email del admin |

**Nota:** Solo se registran traspasos de gastos con `tipo_documento` = `boleta` o `voucher`. Las facturas NO pasan al puente.

#### `Fondos` (columnas `A:I`)
| Índice | Columna | Descripción |
|--------|---------|-------------|
| 0 | `id` | ID único del fondo |
| 1 | `usuario_email` | Email del usuario asignado |
| 2 | `monto_asignado` | Monto original asignado |
| 3 | `saldo` | Saldo actual (se descuenta al aprobar rendiciones) |
| 4 | `observacion` | Glosa/observación del fondo |
| 5 | `fecha_asignacion` | ISO timestamp |
| 6 | `estado` | `en_curso` / `cerrado` |
| 7 | `asignado_por` | Email del admin que asignó |
| 8 | `empresa` | Nombre de la empresa |

#### `Config_Rinde` (columnas `A:G`)
| Índice | Columna | Descripción |
|--------|---------|-------------|
| 0 | `empresa` | Nombre de la empresa |
| 1 | `rinde_activo` | `TRUE` / `FALSE` |
| 2 | `gastos_activo` | `TRUE` / `FALSE` (controla el puente) |
| 3 | `admin_email` | Email del admin |
| 4 | `cuenta_anticipo` | Nombre de la cuenta anticipo (ej. "Fondo por rendir – Cuenta por cobrar empleados") |
| 5 | `cuenta_saldo_favor` | Cuenta para saldo a favor (ej. "Saldo a favor del usuario – Reembolso") |
| 6 | `cuenta_saldo_contra` | Cuenta para saldo en contra (ej. "Saldo por devolver del usuario") |

### Hoja de configuración de empresas (`GOOGLE_CONFIG_SHEET_ID`, `A:E`)
`email`, `sheetId`, `empresaNombre`, `subdomain`, `activo` (ver `lib/companyConfig.ts`).

---

## 2. Stack tecnológico

| Área | Tecnología |
|------|-----------|
| Framework | **Next.js 16.2.4** (App Router) |
| UI / React | **React 19.2.4** |
| Lenguaje | TypeScript 5 (strict) |
| Estilos | Tailwind CSS 4 + PostCSS + autoprefixer |
| Íconos | lucide-react |
| Utilidades CSS | clsx + tailwind-merge (`cn`) |
| PWA | @ducanh2912/next-pwa + workbox-webpack-plugin |
| Google Sheets | googleapis (`google.sheets`) |
| Storage de imágenes | @supabase/supabase-js (bucket `receipts`) |
| OCR | **Google Cloud Vision API** (`/api/ocr`) |
| Envío de emails | Web3Forms (`api.web3forms.com/submit`) |

Scripts: `dev` (next dev) · `build` (next build) · `start` (next start) · `lint` (eslint).

---

## 3. Arquitectura general

> **Regla clave:** NO existe base de datos relacional propia. La **fuente de verdad de datos es Google Sheets**, vía Service Account. Supabase se usa **solo para almacenar imágenes** (no tablas de negocio).

Flujo de datos de alto nivel:

```mermaid
flowchart LR
    A[Cliente React] --> B[API Routes /api/*]
    B --> C[Google Sheets Service Account]
    B --> D[Supabase Storage bucket receipts]
    B --> E[Google Cloud Vision OCR]
    B --> F[Web3Forms email]
```

### Almacenamiento de datos (Google Sheets)

Existen **dos** Google Spreadsheets usados como base de datos:

1. **Hoja de Configuración/Usuarios** (`GOOGLE_CONFIG_SHEET_ID`):
   - Hoja **Usuarios** — columnas `A:J` (ver sección 6).
   - Hoja de empresas/maestra — columnas `A:E` para configuración por subdominio (leída por `lib/companyConfig.ts`).
2. **Spreadsheet de gastos por usuario** (`sheet_id_asociado` guardado en cada fila de Usuario):
   - Hoja **Gastos** — columnas `A:L` (ver sección 6).

Un **Spreadsheet maestro** (`GOOGLE_SHEET_ID_USERS`) contiene la hoja **Usuarios** para alta de registros/creación de usuarios.

---

## 4. Estructura de carpetas

```
src/
  app/
    └ (raíz) page.tsx ...         Landing pública GastosNX (página de marketing)
    rinde-landing/
      page.tsx ...                 Landing pública RindeNX (ámbar; ruta /rinde-landing)
      layout.tsx ...               Metadata/OG propios de la landing RindeNX
    captura/page.tsx              Flujo de captura → OCR → revisión → guardado
    dashboard/page.tsx            Dashboard del usuario / empresa (stats + lista gastos + desglose por categoría)
    login/page.tsx                Login + modales recuperación/contacto
    manual/page.tsx               Manual de uso con video YouTube
    registro/
      page.tsx                    Selección de plan (Free/Pro)
      free/page.tsx               Registro plan Free
      pago/page.tsx               Registro plan de pago (Pro/Enterprise)
      confirmacion/{loading,page}.tsx
    admin/
      page.tsx                    Panel admin: gestión de usuarios
      generador-hash/page.tsx     Generador de hash de contraseñas
      reset-password/page.tsx     Reset de contraseña manual
    api/
      auth/route.ts            POST login (valida contra Usuarios sheets)
      auth/me/route.ts         GET sesión validada desde cookie httpOnly (ADR-002)
      auth/logout/route.ts     POST logout (borra cookie de sesión)
      expenses/route.ts        GET gastos (filtra por rol)
      save-expense/route.ts       POST guarda gasto + sube imagen + actualiza contador
      export/route.ts             GET CSV de gastos
      ocr/route.ts                POST Google Cloud Vision OCR
      get-company-config/route.ts GET config por subdominio
      health/route.ts             GET health check Supabase
      user/route.ts               (stub) GET Not implemented (501)
      admin/
        users/route.ts            CRUD usuarios (GET/POST/PUT/DELETE)
        stats/route.ts            GET estadísticas de empresa
        create-user-sheet/route.ts  Util: crea hoja Usuarios + admin por defecto
    layout.tsx                    Root layout (SEO, PWA, SupportButton)
    globals.css                   Estilos globales
  proxy.ts                        Proxy de subdominios: rinde.* → RindeNX (Next 16)
  components/
    CameraCapture.tsx             Captura de foto/upload (blob)
    OcrProcessor.tsx              Overlay de progreso OCR
    ExpenseForm.tsx               Formulario de revisión/edición de gasto
    DashboardStats.tsx            (componente de stats)
    LoginForm.tsx                 (formulario login)
    SupportButton.tsx             Botón flotante de soporte
    ui/                           Button, Card, Input, Badge, Alert
  lib/
    auth.ts                       Cliente sesión (loadSession/getSession) + hashPassword (SHA-256)
    session.ts                    Sesión JWT HS256 + cookie httpOnly (ADR-002)
    storage.ts                    Subida/borrado imagen a Supabase Storage
    ocr.ts                        Cliente OCR → /api/ocr
    parser.ts                     Parser de boleta chilena (texto OCR → datos)
    companyConfig.ts              Lectura de config por subdominio
    sheets-users.ts               (vacío)
    password-utils.ts             Utilidades de password (generar/verificar)
    utils.ts                      cn() helpers
```

---

## 5. Autenticación y sesión

- El login delega en `/api/auth` (POST con `{ email, password }`).
- La contraseña se valida contra Google Sheets (comparando el hash SHA-256 almacenado).
- **Sesión (ADR-002, resuelto):** al validar, el servidor **firma un JWT HS256** (con `AUTH_SECRET`) y lo envía como **cookie httpOnly** (`gx_session`). La sesión ya **no** se guarda en `localStorage` ni viaja por el header `x-session`.
- El cliente (`lib/auth.ts`) usa `loadSession()` para consultar `/api/auth/me` (lee la cookie) y cachea en memoria con `getSession()`. `logout()` llama a `/api/auth/logout`.
- Cualquier página protegida (dashboard, captura, admin) llama a `loadSession()` al montar y redirige a `/login` si no hay sesión activa.
- Las API Routes protegidas obtienen la sesión validada con `readSession(request)` (leen y verifican la cookie). **No confían en datos enviados por el cliente** (rol, sheet_id, límites).
- Control de acceso admin: campo `rol === 'admin'` (normalizado con `.trim().toLowerCase()` en el token).

Campos de la sesión (`UserSession`):
`email`, `empresa_nombre`, `plan`, `limite_boletas`, `boletas_usadas`, `activo`, `rol`, `sheet_id_asociado`.

---

## 6. Esquema de datos (Google Sheets)

### Hoja **Usuarios** (columnas `A:K`)
| Índice | Columna | Descripción |
|--------|---------|-------------|
| 0 | `email` | Email del usuario (único) |
| 1 | `password_hash` | Hash SHA-256 de la contraseña |
| 2 | `empresa_nombre` | Nombre de la empresa |
| 3 | `plan` | `free` / `pro` / `enterprise` |
| 4 | `limite_boletas` | Límite mensual de boletas |
| 5 | `boletas_usadas` | Contador mensual de boletas |
| 6 | `activo` | `TRUE` / `FALSE` |
| 7 | `rol` | `admin` / `user` / `superadmin` |
| 8 | `creado_en` | Timestamp ISO de creación |
| 9 | `sheet_id_asociado` | Spreadsheet de gastos de la empresa |
| 10 | `tipo_usuario` | Producto: `gastos` / `rinde` / `ambos` (Fase 1) |

### Hoja **Gastos** (columnas `A:L`)
| Índice | Columna | Descripción |
|--------|---------|-------------|
| 0 | `timestamp` | Timestamp ISO de registro |
| 1 | `fecha` | Fecha del gasto (YYYY-MM-DD) |
| 2 | `rut` | RUT del proveedor |
| 3 | `proveedor` | Nombre del proveedor |
| 4 | `monto` | Monto (numérico) |
| 5 | `categoria` | Categoría |
| 6 | `boleta_numero` | N° de boleta |
| 7 | `giro` | Giro del proveedor |
| 8 | `notas` | Notas adicionales |
| 9 | `ocr_confidence` | Confianza del OCR |
| 10 | `image_url` | URL pública de la imagen en Supabase |
| 11 | `creado_por` | Email del usuario que registró el gasto |

### Hoja de configuración de empresas (`GOOGLE_CONFIG_SHEET_ID`, `A:E`)
`email`, `sheetId`, `empresaNombre`, `subdomain`, `activo` (ver `lib/companyConfig.ts`).

---

## 7. Planes y límites

### Oferta pública vigente (2026-08-28)

#### Plan Free
- **$0 / mes**
- 1 usuario (self-registro)
- 10 boletas / mes
- OCR con Google AI
- Dashboard básico + Export CSV

#### Plan Pro — Pago anual (recomendado)
- **$3.300 por usuario / mes** (IVA incluido)
- Incluye hasta **3 usuarios** → **$9.900 / mes** total
- Usuario adicional (sobre los 3 de base): **$2.500 c/u**
- Facturación anual
- 500 boletas / mes
- OCR con Google AI
- Dashboard avanzado
- Export CSV + Excel
- Soporte prioritario

#### Plan Pro — Pago mes a mes
- **$4.000 por usuario / mes** (IVA incluido)
- Incluye hasta **3 usuarios** → **$12.000 / mes** total
- Usuario adicional (sobre los 3 de base): **$3.000 c/u**
- Sin contrato
- 500 boletas / mes
- Mismas características que el Pro anual

> ℹ️ **Enterprise eliminado (2026-08-28):** el plan Enterprise fue removido de la oferta pública y de los flujos de registro (`/registro`, `/registro/pago`, `/registro/confirmacion`). Permanece `enterprise` solo en el schema interno (`PLAN_LIMITS`, `PLAN_HIERARCHY`) por si fuera necesario a futuro, pero **ya no se ofrece, no se muestra en la UI pública y no se puede seleccionar en el registro**.
>
> ✅ **ADR-003 (2026-08-28):** **Resuelto**. Se unificó la fuente de verdad de límites por plan: `PLAN_LIMITS` en `src/app/api/admin/users/route.ts` y `src/app/admin/page.tsx`. Se alineó toda la UI pública (landing, `/registro`, `/registro/pago`, `/registro/confirmacion`) con la nueva estructura de precios por usuario. El admin hereda el plan al crear usuarios y el límite de boletas siempre viene de la constante del plan (no del cliente). Detalles completos en `DECISIONS.md` ADR-003.

### Jerarquía de planes (admin)
`free (1) < pro (2) < enterprise (3)` — un admin solo puede crear/editar usuarios con planes iguales o inferiores al suyo (`PLAN_HIERARCHY`).

### Constantes centralizadas

| Archivo | Constante | Valores |
|---------|-----------|---------|
| `src/app/api/admin/users/route.ts` | `PLAN_LIMITS` | `{ free: { boletas: 10, usuarios: 1 }, pro: { boletas: 500, usuarios: 3 }, enterprise: { boletas: 9999, usuarios: 10 } }` |
| `src/app/api/admin/users/route.ts` | `PLAN_HIERARCHY` | `{ free: 1, pro: 2, enterprise: 3 }` |
| `src/app/admin/page.tsx` | `PLAN_LIMITS` (frontend) | `{ free: 10, pro: 500, enterprise: 9999 }` |
| `src/app/registro/pago/page.tsx` | `planes.pro` | Precios por usuario (anual $3.300, mensual $4.000) y extras ($2.500 / $3.000) |

---

## 8. Flujo de captura de gasto

1. **Captura** (`/captura`): el usuario fotografía o sube una imagen (componente `CameraCapture`).
2. **OCR** (`/api/ocr`): la imagen se envía a **Google Cloud Vision** (`TEXT_DETECTION`), que devuelve el texto completo. Confianza fija en `95`.
3. **Parseo** (`lib/parser.ts`): `parseBoletaChilena(ocrText, confidence)` extrae fecha, RUT, proveedor, monto, giro y n° de boleta usando expresiones regulares. **Compartido por GastosNX (`/captura`) y RindeNX (`/rinde/.../nuevo-gasto`)**: aplica la misma lógica robusta a ambos. El parser detecta boleta/factura/voucher (`tipoDocumento`, usado por RindeNX), captura el **monto** en la línea siguiente a `TOTAL:`/`MONTO COMPRA` (típico de vouchers), busca el **RUT del proveedor** en el bloque superior del documento (evitando tokens de tarjeta) tolerando formatos deformados por OCR, y prioriza **razón social** del proveedor (SA., SPA., LTDA.). Incluye la restricción del dígito verificador del RUT.
4. **Revisión** (`ExpenseForm`): el usuario valida/edita los campos y selecciona categoría.
5. **Guardado** (`/api/save-expense`, POST multipart):
   - Sube la imagen a Supabase Storage (`receipts` bucket). **Si falla, igual guarda el gasto** (imagen opcional).
   - Valida límite de boletas (`boletas_usadas >= limite_boletas` → HTTP 403).
   - Append a la hoja `Gastos!A:L` del `sheet_id_asociado`.
   - Incrementa `boletas_usadas` en la hoja Usuarios.
   - Devuelve `boletas_usadas` actualizado para refrescar la sesión local.

---

## 9. API Routes (resumen funcional)

| Ruta | Método | Función |
|------|--------|---------|
| `/api/auth` | POST | Login, valida usuario y setea cookie httpOnly (ADR-002) |
| `/api/auth/me` | GET | Devuelve la sesión validada desde la cookie |
| `/api/auth/logout` | POST | Borra la cookie de sesión |
| `/api/expenses` | GET | Lista gastos del usuario/empresa (filtra por rol admin/user) |
| `/api/save-expense` | POST | Guarda gasto + imagen + incrementa contador |
| `/api/export` | GET | Descarga CSV de gastos (filtra por rol) |
| `/api/ocr` | POST | OCR vía Google Cloud Vision |
| `/api/health` | GET | Health check de Supabase |
| `/api/get-company-config` | GET | Config por subdominio |
| `/api/user` | GET | **Stub** — retorna 501 Not implemented |
| `/api/admin/users` | GET/POST/PUT/DELETE | CRUD de usuarios (solo admin, filtrando por empresa) |
| `/api/admin/stats` | GET | Estadísticas de la empresa del admin |
| `/api/admin/create-user-sheet` | POST | Util: crea hoja `Usuarios` + admin por defecto |
| `/api/registro/free` | POST | Alta de registro plan Free en sheet |
| `/api/registro/pago` | POST | Alta de registro plan Pro/Enterprise en sheet |

---

## 10. Variables de entorno requeridas

Las variables indicadas se leen vía `process.env` en API Routes y cliente (`NEXT_PUBLIC_*`). Lista clave:

```
# Google Sheets (Service Account)
GOOGLE_SERVICE_ACCOUNT_EMAIL
GOOGLE_PRIVATE_KEY
GOOGLE_CREDENTIALS        (JSON completo; `src/lib/sheets.ts` lo prioriza)
GOOGLE_CONFIG_SHEET_ID
GOOGLE_SHEET_ID_USERS

# Sesión JWT (ADR-002, OBLIGATORIA)
AUTH_SECRET              (mín 16 caracteres; firma de la cookie de sesión)

# SSO entre subdominios (solo producción, ver DEPLOY.md §2.1)
COOKIE_DOMAIN            ('.nxchile.com'; compartir sesión entre gastos. y rinde.)

# OCR
GOOGLE_VISION_API_KEY

# Supabase (Storage)
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY

# Emails (Web3Forms)
NEXT_PUBLIC_WEB3FORMS_KEY
```

> ✅ **Nota de credenciales (ADR-004, resuelto):** `src/lib/sheets.ts` (`getSheets(readOnly?)`) soporta **ambos** formatos: prioriza `GOOGLE_CREDENTIALS` (JSON completo) y, si no está, usa `GOOGLE_SERVICE_ACCOUNT_EMAIL` + `GOOGLE_PRIVATE_KEY`. Ya no es necesario mantener lógica duplicada en cada ruta; basta con que exista al menos uno de los dos formatos.

---

## 11. Observaciones / temas pendientes conocidos

> Las siguientes inconsistencias se encuentran **registradas como ADR en `docs/DECISIONS.md`**, ordenadas de mayor a menor importancia, cada una con sus pasos a corregir. Referencia cruzada del seguimiento: `DECISIONS.md`.
> **Estado 2026-09-14:** ADR-001, ADR-002, ADR-003, ADR-004, ADR-005, ADR-006, ADR-007, ADR-008 y ADR-013 **resueltos**. Fases 1-8 del plan **completadas**. **Sin pendientes abiertos.**

| # | ADR | Tema pendiente | Urgencia |
|---|-----|----------------|----------|
| — | — | **Sin pendientes.** ADR-001, ADR-005 y ADR-006 fueron resueltos el 2026-09-14. | — |

✅ **ADR-001 (2026-09-14):** **Resuelto.** Hashing unificado con sal en `src/lib/password.ts` (`sha256:<salt>:<hash>`, salt criptográfico, `timingSafeEqual`). **Eliminado el fallback de contraseña en texto plano** que realmente autenticaba en producción (tanto en `api/auth` como en `api/super-admin/auth`). Los 5 usuarios que estaban en texto plano se migraron a la hoja; los 5 clientes con SHA-256 sin sal se migran solos en su próximo login (rehash-on-login, el fallo de escritura nunca bloquea el acceso). Contraseña fuera de los emails. `admin123` reemplazado por una aleatoria mostrada una sola vez. Generador de hash corregido. **Nuevo autoservicio de recuperación de contraseña** (`/api/auth/reset-request`, `/api/auth/reset-confirm`, página `/reset-password`) con token HMAC stateless: el cliente se recupera solo, sin depender de un admin. Ver `DECISIONS.md` ADR-001.
✅ **ADR-005 (2026-09-14):** **Resuelto.** `api/ocr` ya no devuelve `confidence: 95` (Google Vision en `TEXT_DETECTION` no entrega ese dato): ahora devuelve `null`. La UI muestra "Texto reconocido · revisa los datos" y "Datos extraídos por OCR — Por verificar" en vez de un porcentaje inventado. `parseBoletaChilena` tolera `null` y normaliza a `0`.
✅ **ADR-006 (2026-09-14):** **Resuelto.** Eliminados el stub `api/user` (501), el archivo vacío `lib/sheets-users.ts` y `deleteReceiptImage` (nunca invocado). Las 4 referencias Open Graph apuntaban a `og-image.jpg`, que **no existía** (404); se reapuntaron a `hero_principal.webp`.

**Rutas públicas que deben pasar sin prefijo `/rinde` en `rinde.nxchile.com`:**
`/login`, `/rinde-landing`, `/precios`, `/reset-password`, `/mi-cuenta`.
> ⚠️ Cualquier ruta nueva de la **raíz de `src/app/`** debe agregarse aquí. Si no, el rewrite
> final la manda a `/rinde/…` y responde 404. Es la misma causa que el bug de `/api/**` (ADR-013).

### Seguimiento posterior a ADR-001 — migración de hashes legacy

> **Decisión del owner (2026-09-14):** Opción A. Se acepta que los hashes históricos
> SHA-256 **sin sal** sigan existiendo hasta que cada usuario entre por primera vez.
> `verifyPassword()` mantiene la rama `legacy` a propósito: si se retirara antes de que
> los 5 migren, esos clientes perderían el acceso.

**Estado actual de la hoja `Usuarios` (10 cuentas):**

| Formato | Cuentas | Estado |
|---|---|---|
| `sha256:<sal>:<hash>` (con sal) | `rodrigo@nxchile.com`, `admin@nxchile.cl`, `test@nxchile.cl`, `transrcc.cl@gmail.com`, `prueba@nxchile.com` | ✅ migrados |
| SHA-256 plano de 64 hex (sin sal) | `marcelo@sanandres.cl`, `marita@sanandres.cl`, `luis@sanandres.cl`, `l.avila.leonel@hotmail.com`, `nata.luengo@gmail.com` | ⏳ migrarán en su próximo login |

**Cómo verificar que terminó la migración:** leer `Usuarios!B:B` y comprobar que **las 10**
filas tengan el formato `sha256:<sal>:<hash>`. Basta con que ninguna valor sea un hex de 64
caracteres pelado. Cada login de un usuario legacy reescribe su fila automáticamente.

**Qué hacer si en ~30 días siguen igual** (no es urgente, es un control):
1. Pedir a esos 5 usuarios que restablezcan su contraseña con el autoservicio nuevo
   (`/login` → "¿Olvidaste tu contraseña?"). Quedan con sal de inmediato, sin que NXChile
   necesite conocer sus contraseñas actuales.
2. Verificar de nuevo el formato.
3. Solo cuando las 10 filas estén con sal, retirar la rama `legacy` de
   `src/lib/password.ts` para que el código quede en un solo formato.

**Riesgo mientras dure la transición:** un hash SHA-256 sin sal se puede romper *offline*
con diccionario sin tocar el sistema (a diferencia de un intento online, que queda
registrado). El tamaño de la ventana depende de cuándo entren los usuarios, no del código.

**Deuda consciente adicional (no es un bug):** SHA-256 es una función rápida y no está
diseñada para contraseñas. El estándar recomendado es una función lenta (scrypt, argon2id,
bcrypt). Se mantiene SHA-256 con sal porque ya resuelve los problemas críticos detectados
(texto plano, ausencia de sal, doble implementación). Si se decide migrar a **scrypt**
(`crypto.scrypt`, ya disponible en el core de Node sin dependencias nuevas), el momento
más barato es ahora, con 10 usuarios; hacerlo con cientos exigiría rehashear toda la base.
En ese caso el prefijo pasaría a `scrypt:…` y `verify()` aceptaría ambos formatos.

---

✅ **ADR-002 (2026-08-10):** Sesión migrada a **JWT HS256 en cookie httpOnly** (`src/lib/session.ts`), endpoints `/api/auth/me` y `/api/auth/logout`, API routes leen `readSession`, cliente usa `loadSession()`. Eliminada la sesión manipulable de localStorage + `x-session`.
✅ **ADR-003 (2026-08-28):** **Resuelto** — Unificación de límites por plan, nueva estructura de precios por usuario ($3.300 anual / $4.000 mensual + extras), eliminación del plan Enterprise de la oferta pública, alineación de toda la UI pública. Ver `DECISIONS.md` ADR-003.
✅ **ADR-004 (2026-08-10):** Centralizado el cliente de Google Sheets en `src/lib/sheets.ts` (`getSheets(readOnly?)`), con soporte de ambos formatos de credenciales.
✅ **ADR-007 (2026-08-28):** **Resuelto** — Rediseño de la landing (`src/app/page.tsx`) alineada con el sello NXChile: prueba social con logos de clientes reales, sección "Cómo funciona" con video demo embebido, sección "Para Contadores" con mockup, sección Instagram con link a @nx_chile, WhatsApp flotante, sticky CTA mobile, FAQ con 8 preguntas. Sin cambios en funcionalidad operativa. Ver `DECISIONS.md` ADR-007.

Cada ADR en `DECISIONS.md` incluye el **contexto, la decisión, las alternativas y la resolución** detallados.

---

## 12. Convenciones de desarrollo

- Idioma de comunicación y UI: **Español (Chile)** (`es-CL`).
- Formato monetario: pesos chilenos CLP (`toLocaleString('es-CL')`).
- UI basada en componentes `ui/` (Button, Card, Input, Badge, Alert) con gradientes verdes/esmeralda (`emerald`/`teal`).
- Prefijos de `console.log` con emojis para debugging (`🔍`, `✅`, `❌`, `⚠️`).
- Alias de importación: `@/*` → `./src/*`.
- Sin librería de estado global; el estado se maneja con `useState`/`useEffect`.
- **Sesión (ADR-002):** cookie httpOnly + JWT firmado. El cliente usa `loadSession()`/`getSession()` de `lib/auth.ts` (caché en memoria). No se persiste sesión en `localStorage`.

### Branding y canales públicos (ADR-007)

- **Marca oficial:** "GastosNX by NXChile". Logotipo en `public/images/LogogastosNX.png` (693×138, usado con `width={693}`/`height={138}` y clases `h-* w-auto object-contain`).
- **Sitio base:** www.nxchile.com. La landing debe reforzar el vínculo con NXChile (badge "Producto de NXChile" en hero, sección confianza, link a www.nxchile.com).
- **WhatsApp de contacto:** `+56 9 77412178` (configurado en `whatsappLink` de la landing, formato `https://wa.me/56977412178?text=...`). El mensaje predefinido es: "Hola, vengo de gastos.nxchile.com y quiero saber más sobre GastosNX para mi empresa."
- **Instagram oficial:** `https://www.instagram.com/nx_chile`. La landing muestra un grid de 4 posts en `public/images/instagram/post-{1..4}.jpeg` enlazando al perfil. No se hace scraping ni embeds dinámicos (riesgo de baneo de Meta).
- **Email de contacto:** `gastos@nxchile.com` (usado en CTAs "Solicitar acceso demo contador", "Quiero recomendar GastosNX", soporte).
- **Vimeo/YouTube de demo:** videoId `9txm6hqHre8` embebido en la landing (también usado en `/manual`).
- **Sticky CTA mobile:** aparece tras scroll >800px en mobile (`md:hidden`), fijo en bottom con botón "Probar gratis" + WhatsApp.
- **WhatsApp flotante:** solo visible en desktop (`hidden md:flex`), esquina inferior derecha, color `#25D366`, con tooltip "¿Dudas? Escríbenos" al hover.
- **Logos de clientes autorizados** (prueba social en landing): `public/images/clients/{ac_logo.png, RCCServicios.jpeg, sanAndres.png, bastcon.jpg}`. Empresas: AC Constructores y Consultores, RCC Servicios EIRL, Transportes San Andrés SPA, Bastcon.

### Branding RindeNX (landing pública, 2026-09-08)

- **Marca:** "RindeNX by NXChile". Sin archivo de logo dedicado: se usa un badge (cuadro degradado `amber-500 → orange-600` + ícono `FileText` blanco) junto al wordmark "Rinde**NX**" (`text-amber-600`), mismo estilo que la navbar de la app `/rinde`.
- **Paleta:** ámbar/naranja (`amber-*`, `orange-*`) sobre neutros; contraste: secciones oscuras `neutral-950` y acentos `bg-amber-500`.
- **Contacto:** `rinde@nxchile.com` + WhatsApp `+56 9 77412178` (mismo número que GastosNX, mensaje predefinido "vengo de rinde.nxchile.com").
- **CTA principal:** "Solicitar demostración" → WhatsApp (`https://wa.me/56977412178`). RindeNX **no tiene registro público**: los usuarios los crea el admin en la hoja Usuarios.
- **Cross-sell:** en la landing hay link a `https://gastos.nxchile.com` (y viceversa desde GastosNX) porque comparten cuenta y deploy. La landing enlaza a `/precios` (navbar, hero, CTA final, footer).

### OCR (proveedor único)

- Proveedor activo: **Google Cloud Vision API** (TEXT_DETECTION). Configurado vía `GOOGLE_VISION_API_KEY`.
- En la UI pública siempre se muestra como **"OCR con Google AI"** (nunca "Azure", "OCR.space" u otros).
- Variables de entorno `AZURE_VISION_*` y `NEXT_PUBLIC_OCRSPACE_API_KEY` en `.env.local` son legados y **no se usan en código** (migración pendiente de limpieza, ADR-006 cubre parcialmente).

---

## 13. Notas de mantenimiento

- **Al agregar/modificar API Routes, mantener la doc de esta sección (`§9`) sincronizada.**
- **Al cambiar columnas del schema, actualizar las tablas de la sección 6.**
- **Al cambiar variables de entorno requeridas, actualizar la sección 10.**
- Cualquier cambio estructural debe registrar una decisión en `DECISIONS.md`.