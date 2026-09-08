# Guía de Despliegue — RindeNX en `rinde.nxchile.com`

> **⚠️ ANTES DE DESPLEGAR:** Todas las pruebas locales deben haber pasado exitosamente (ver `PRUEBAS_LOCALES.md`).

## 1. Pre-requisitos del entorno de producción

### 1.1. Variables de entorno (`.env.local` o config de Vercel)

Las siguientes variables deben estar configuradas en producción:

```bash
# Google Sheets (Service Account) — mismas que GastosNX
GOOGLE_SERVICE_ACCOUNT_EMAIL
GOOGLE_PRIVATE_KEY
GOOGLE_CREDENTIALS                    # JSON completo (alternativa)
GOOGLE_CONFIG_SHEET_ID                # Spreadsheet maestro
GOOGLE_SHEET_ID_USERS                 # Hoja Users

# Sesión JWT
AUTH_SECRET                           # Mín. 16 caracteres

# SSO entre subdominios (gastos. y rinde.)
COOKIE_DOMAIN='.nxchile.com'          # Fijar SOLO en producción; en localhost dejar vacío

# OCR
GOOGLE_VISION_API_KEY

# Supabase
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY

# Web3Forms (emails)
NEXT_PUBLIC_WEB3FORMS_KEY

# IMPORTANTE: Nuevas variables (si se separa sheet_id_rinde del sheet_id_asociado)
# GOOGLE_SHEET_ID_RINDE_PREFIX         # (Opcional) Prefijo para spreadsheets RindeNX
```

### 1.2. Permisos de Service Account

El Service Account debe tener acceso de **lectura y escritura** a:
- Spreadsheet maestro (`GOOGLE_CONFIG_SHEET_ID`)
- Spreadsheet de usuarios (`GOOGLE_SHEET_ID_USERS`)
- Spreadsheet de Gastos de cada empresa
- Spreadsheet de RindeNX de cada empresa

## 2. Configuración del subdominio `rinde.nxchile.com`

### 2.1. Opción A: Mismo deploy, routing por subdominio (Recomendado para MVP) — ✅ Implementado

**IMPORTANTE:** Esta opción **ya está implementada** y **desplegada y verificada en producción (2026-09-08)**:
dominio `rinde.nxchile.com` agregado en Vercel, `CNAME rinde → expense-tracker-nxchile.vercel.app` propagado en
Cloudflare y `COOKIE_DOMAIN=.nxchile.com` configurado. La sección queda como referencia del procedimiento.

1. En **Vercel**, ir al proyecto del expense-tracker (el mismo de `gastos.nxchile.com`)
2. Settings → Domains → Agregar `rinde.nxchile.com`
3. Configurar DNS en **Cloudflare** (o el proveedor de `nxchile.com`) apuntando al **mismo deploy** que `gastos.nxchile.com`:
   ```
   Tipo: CNAME
   Nombre: rinde
   Objetivo: expense-tracker-nxchile.vercel.app
   Proxy: solo DNS (nube gris)
   ```
   > ⚠️ El valor del CNAME es **solo el hostname** (sin `https://` ni `/`). Requiere propagación
   > (hasta 24h) antes de que `rinde.nxchile.com` responda.
4. Configurar la variable de entorno en Vercel (área de Producción):
   ```
   COOKIE_DOMAIN=.nxchile.com
   ```
   Esto hace que la cookie de sesión (`gx_session`) sea compartida entre `gastos.nxchile.com`
   y `rinde.nxchile.com`, logueando una vez en ambos productos (mismo deploy, mismo `AUTH_SECRET`).

El routing está en `src/proxy.ts` (Next 16 renombró `middleware` → `proxy`; si vuelves a una
versión anterior de Next, renombra el archivo a `src/middleware.ts` y la función a `middleware`):

```typescript
// src/proxy.ts
import { NextRequest, NextResponse } from 'next/server'

export function proxy(request: NextRequest) {
  const host = request.headers.get('host') || ''
  const { pathname } = request.nextUrl

  if (!host.startsWith('rinde.')) return NextResponse.next()   // domain principal: sin cambio
  if (isStaticAsset(pathname)) return NextResponse.next()       // /_next, /images, PWA, favicon

  switch (pathname) {
    case '/': case '/landing': return NextResponse.rewrite(new URL('/rinde-landing', request.url))
    case '/login': case '/rinde-landing': return NextResponse.next()
  }

  if (pathname.startsWith('/rinde')) return NextResponse.next()  // rutas internas de la app
  return NextResponse.rewrite(new URL(`/rinde${pathname}`, request.url)) // /dashboard → /rinde/dashboard
}

export const config = {
  matcher: ['/((?!_next|images|manifest\\.json|favicon\\.ico|icon-\\d+\\.png|sw\\.js|workbox-).*)'],
}
```

**Comportamiento en `rinde.nxchile.com`:**
- `/` y `/landing`  → landing pública de RindeNX (`/rinde-landing`)
- `/login`          → login compartido (mismo login que `gastos.nxchile.com`)
- `/rinde**`        → rutas internas pasan directo (p.ej. `/rinde`, `/rinde/fondos`)
- otra ruta         → se reescribe con prefijo `/rinde` (p.ej. `/dashboard` → `/rinde/dashboard`)
- `/super-admin**`  → no está disponible desde `rinde.*` (se administra desde `gastos.nxchile.com`)

### 2.2. Opción B: Reverse proxy con Nginx (Más limpio)

1. En el servidor de producción, configurar Nginx:

```nginx
server {
  listen 443 ssl;
  server_name rinde.nxchile.com;
  
  ssl_certificate /etc/ssl/certs/nxchile.com.crt;
  ssl_certificate_key /etc/ssl/private/nxchile.com.key;
  
  location / {
    proxy_pass http://localhost:3000/rinde/;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

2. Las APIs también deben rutearse:

```nginx
  location /api/rinde/ {
    proxy_pass http://localhost:3000/api/rinde/;
  }
  
  location /api/auth/ {
    proxy_pass http://localhost:3000/api/auth/;
  }
```

### 2.3. Opción C: Deploy separado (Más aislamiento)

1. Crear un nuevo proyecto en Vercel: `rinde-nxchile`
2. Apuntar al mismo repositorio pero con un build command que solo incluya RindeNX
3. Configurar `rinde.nxchile.com` en el nuevo proyecto
4. **Desventaja:** Duplica el deploy y requiere variables de entorno duplicadas

**Recomendación:** Usar **Opción A** para MVP, considerar **Opción B** si se requiere URLs más limpias.

## 3. Pasos del despliegue

### 3.1. Pre-deploy checklist

- [ ] Todas las pruebas locales pasaron (ver `PRUEBAS_LOCALES.md`)
- [ ] Variables de entorno configuradas en Vercel
- [ ] Documentación actualizada (`CURRENT.md`, `DECISIONS.md`)
- [ ] Build local exitoso: `npm run build`
- [ ] Service Account tiene acceso a los spreadsheets de RindeNX

### 3.2. Deploy a staging (recomendado)

1. Crear una rama `staging-rinde`:
   ```bash
   git checkout -b staging-rinde
   git push origin staging-rinde
   ```

2. Vercel detecta el push y crea un preview deployment
3. Probar en el preview con la guía de pruebas locales adaptada al dominio de preview

### 3.3. Deploy a producción

1. Merge a `main`:
   ```bash
   git checkout main
   git merge staging-rinde
   git push origin main
   ```

2. Vercel despliega automáticamente
3. Verificar que el deploy fue exitoso
4. Configurar `rinde.nxchile.com` en el dashboard de Vercel
5. Configurar DNS (CNAME)
6. Esperar propagación DNS (puede tomar hasta 24h)

### 3.4. Verificación post-deploy

- [ ] `https://gastos.nxchile.com` sigue funcionando normal
- [ ] `https://rinde.nxchile.com` carga la **landing pública** de RindeNX (`/rinde-landing`)
- [ ] Desde la landing, "Ingresar a mi cuenta" lleva a `/login` y el login funciona
- [ ] Logueado en `gastos.nxchile.com`, abrir `rinde.nxchile.com` NO pide login de nuevo (SSO por `COOKIE_DOMAIN=.nxchile.com`) y viceversa
- [ ] `https://rinde.nxchile.com/dashboard` muestra la app RindeNX (rewrite a `/rinde/dashboard`)
- [ ] Login con usuario `tipo_usuario: rinde` o `ambos` funciona
- [ ] Asignar fondo y "Rendir contra este Fondo" funciona en producción
- [ ] El puente funciona (si hay `gastos_activo=TRUE`)
- [ ] Verificar logs en Vercel para detectar errores (el proxy corre en Edge)

> ℹ️ El código en `src/proxy.ts` solo actúa sobre `rinde.` como prefijo de host; `api.*`, los assets
> y cualquier otro host pasan sin reescribirse.

## 4. Rollback

Si algo sale mal:

1. **Rollback en Vercel:** Settings → Deployments → click en el deploy anterior → "Promote to Production"
2. **Revertir merge:** `git revert` del merge y push
3. **DNS:** Si el problema es solo del subdominio, se puede quitar el CNAME temporalmente

## 5. Monitoreo post-deploy

- Revisar logs de Vercel diariamente la primera semana
- Verificar que las APIs de Google Sheets no excedan cuotas
- Monitorear que el Service Account no pierda acceso a los spreadsheets
- Pedir feedback a los usuarios de prueba

## 6. Próximos pasos (post MVP)

Una vez validado en producción:

- [ ] Notificaciones por email cuando se aprueba una rendición (Web3Forms)
- [ ] Dashboard de analytics para el admin (resumen mensual de rendiciones)
- [ ] Roles más granulares en RindeNX (revisor vs. aprobador final)

> ℹ️ **Ya implementado (no pendiente):** OCR en RindeNX (Google Cloud Vision), export del asiento en CSV/PDF (print) + compartir por correo/WhatsApp.
