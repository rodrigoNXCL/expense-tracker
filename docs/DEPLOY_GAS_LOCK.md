# Despliegue del control de cupos (Apps Script + LockService)

**Estado (2026-10-14): desplegado y operativo.** El Web App "GastosNX - Control de Cupos"
está publicado y `GAS_LOCK_URL` / `GAS_LOCK_SECRET` están configuradas en Vercel
Production (confirmado por el owner). La migración de esquema de la sección 4
**fue ejecutada y verificada**: auditoría de solo lectura del 2026-10-14 confirma
`idempotency_key` (M) y `estado` (N) presentes en las 4 hojas de empresa
(NXChile, San Andres SpA, Bastcon, RCC EIRL), con `creado_por` en L y sin
conflictos.

Este documento se conserva como **referencia operativa**: contrato del script,
procedimiento de despliegue/migración (para nuevas hojas de empresa), verificación
y rotación de credenciales. Las secciones 2–6 describen pasos ya ejecutados.

---

## 0. CONTRATO HTTP REAL (léase antes que nada)

**`ContentService` de Apps Script NO permite fijar códigos de estado HTTP.**
Todas las respuestas del script salen con **HTTP 200** y el resultado viaja en el
campo `status` del cuerpo JSON. Cualquier documentación que prometa un 401, 409 o
503 del script es incorrecta.

| `status` devuelto | HTTP real | Qué significa | Qué responde el backend |
|---|---|---|---|
| `ok` | 200 | Gasto registrado | 200 |
| `duplicate` | 200 | Ya existía esa `idempotency_key` | 200 (idempotente) |
| `quota_exceeded` | 200 | Sin cupo | **403** |
| `limit_unavailable` | 200 | No se pudo leer `Usuarios!E` | 503 (reintentable) |
| `write_failed` | 200 | El `appendRow` falló; nada o poco escrito | 503 (reintentable) |
| `partial_batch` | 200 | Lote escrito a medias | 503 (reintentable) |
| `neutralize_failed` | 200 | Registró y no pudo marcar rechazado | 500 |
| `lock_timeout` | 200 | No se obtuvo el bloqueo | 503 (reintentable) |
| `unauthorized` | 200 | Secreto incorrecto | 503 (no reintentable) |
| `not_configured` | 200 | Falta la propiedad del script | 503 (no reintentable) |
| `schema_not_migrated` | 200 | Faltan columnas M/N | 503 (no reintentable) |
| `schema_conflict` | 200 | M/N ocupadas con otro contenido | 503 (no reintentable) |
| `unknown_action` | 200 | Acción desconocida | 500 |
| `bad_request` | 200 | Validación fallida | 400 |
| `script_error` | 200 | Excepción no prevista | 500 |

`write_failed` y `partial_batch` comparten una propiedad importante: **las filas
que sí se escribieron conservan su `idempotency_key`**. Por eso reenviar el mismo
lote no duplica: el script reconoce las claves existentes y solo inserta las que
faltan. Sheets no ofrece transacciones y este script no afirma atomicidad.

Reglas del backend (`src/lib/gastos-lock.ts`):

1. **Solo `ok` y `duplicate` confirman la escritura.** Nada más.
2. Cualquier `status` fuera de la tabla se trata como fallo (fail-closed, 503).
3. Si Google devuelve **HTML** en vez de JSON (redirección, pantalla de
   consentimiento o de login), se detecta y se reporta como `unreachable`. **No
   se interpreta como éxito.**
4. `limit_unavailable` significa que el script no pudo leer el límite vigente y
   por tanto **no decidió cupo**. No escribe nada. El cliente reintenta con la
   **misma** `idempotency_key`, así que no hay riesgo de duplicar.

## 1. Qué hace y por qué

Google Sheets no ofrece incremento atómico de celda ni escritura condicional.
Un patrón leer-modificar-escribir sobre `Usuarios!F` pierde incrementos con dos
peticiones simultáneas. `LockService` serializa las operaciones que consumen
cupos y, dentro de esa sección crítica, se hace:

1. Verificar la `idempotency_key`.
2. Releer el **límite desde `Usuarios!E`** y el consumo real.
3. Decidir si la operación cabe.
4. Escribir la fila con la clave en el **mismo** append.

Ningún registro válido se borra. Una operación que no cabe se marca
`estado='rechazado'` y no cuenta para el consumo.

### Lo que `LockService` NO protege (límites conocidos)

- **Edición manual** de `Gastos` en el navegador: no pasa por el script.
- **Cualquier otra ruta** que escriba en `Gastos` sin llamar a `save`/`saveBatch`.
- El bloqueo es **global** a todo el script, no por empresa.

## 2. Crear el proyecto

1. Abre <https://script.google.com> y crea un proyecto nuevo.
2. **Ponle el nombre `GastosNX - Control de Cupos`.**
3. Borra el contenido de `Code.gs`.
4. Pega **el archivo completo** `google-apps-script/GastosLock.gs` del repositorio,
   tal cual y sin editar nada. Cada función debe quedar con su `function` en
  columna 0: Apps Script no usa llaves de apertura y exige que no haya sangría
   delante de las declaraciones de nivel superior. Si al pegar aparece un error
   de sintaxis, casi siempre es que el editor añadió sangría o faltan saltos de
   línea.
5. Guardar. El archivo tiene ~700 líneas; verifica que el contador de líneas del
   editor coincide antes de continuar.

## 3. Configurar el secreto (paso crítico)

1. En el proyecto: **Configuración del proyecto** → **Mostrar el archivo de
   manifiesto `appsscript.json`**.
2. Añade el ámbito `https://www.googleapis.com/auth/spreadsheets` bajo
   `oauthScopes`.
3. Ve a **Configuración del proyecto → Propiedades del script → Añadir**:
   - Nombre: `GAS_LOCK_SECRET`
   - Valor: cadena aleatoria de al menos 32 caracteres.

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

> Sin esta propiedad el script responde `not_configured` y rechaza todo. No la
> guardes en el repositorio ni en un archivo compartido.

## 4. Migrar el esquema (autorización explícita)

Columnas nuevas: **M** = `idempotency_key`, **N** = `estado`. Los registros
históricos quedan intactos: ambas vacías cuentan como estado `ok`, sin backfill.

La migración es idempotente, **solo escribe la fila 1**, y **se detiene con
`schema_conflict`** si M o N ya contienen otro contenido (para no sobrescribir).

```bash
curl -X POST "$GAS_LOCK_URL?token=$GAS_LOCK_SECRET" \
  -H 'Content-Type: application/json' \
  -d '{"action":"migrate","spreadsheetId":"<ID_HOJA_EMPRESA>"}'
```

Respuestas posibles:

```json
{"status":"migrated","added":["idempotency_key","estado"],
 "message":"Cabeceras agregadas. No se modifico ningun registro existente."}
{"status":"already_migrated","added":[],"message":"..."}
{"status":"schema_conflict","message":"Migracion detenida: las columnas destino ya estan ocupadas..."}
```

Ejecuta una vez **por cada hoja de empresa** listada en `Usuarios!J`.

### Verificación antes y después de migrar

```bash
# ANTES
curl -s -X POST "$GAS_LOCK_URL?token=$GAS_LOCK_SECRET" \
  -H 'Content-Type: application/json' \
  -d "{\"action\":\"migrate\",\"spreadsheetId\":\"$HOJA\"}" > /dev/null
# accounta filas de 'Gastos' ANTES y DESPUÉS con:
curl -s "https://sheets.googleapis.com/v4/spreadsheets/$HOJA/values/Gastos!A2:N?key=$API_KEY" | jq '.values | length'
```

**Criterio de aceptación:** el número de filas de datos debe ser idéntico antes y
después. Solo cambia la fila 1 (cabeceras) y se añaden las columnas M y N.

## 5. Autorizar y desplegar

1. **Publicar → Nuevo despliegue → Aplicación web**
2. Tipo: **Aplicación web**
3. Ejecutar como: **Yo** (la cuenta propietaria)
4. Quién tiene acceso: **Cualquier persona**
   - El secreto de la sección 3 protege el endpoint. Con acceso restringido a tu
     cuenta el backend no podrá llamarlo.
5. Desplegar y autorizar los permisos de Sheets.
6. Copiar la **URL /exec**.

## 6. Configurar Vercel Production

En **Vercel → Project → Settings → Environment Variables** (scope: **Production**):

| Variable | Valor | Notas |
|---|---|---|
| `GAS_LOCK_URL` | URL `/exec` de la sección 5 | |
| `GAS_LOCK_SECRET` | el mismo de la sección 3 | marcar como **Sensitive** |
| `GAS_LOCK_TIMEOUT_MS` | `20000` | opcional |

Después: **Deployments → Redeploy** del último commit, o redeploy con un nuevo
commit. Si faltara alguna variable, el guardado responde `503` (fail-closed).

## 7. Verificar el endpoint (comandos exactos)

```bash
# 1) Responde (HTTP 200 + status ok)
curl -s -X POST "$GAS_LOCK_URL?token=$GAS_LOCK_SECRET" \
  -H 'Content-Type: application/json' -d '{"action":"ping"}'
# -> {"status":"ok","service":"gastos-lock",...}

# 2) Secreto incorrecto: HTTP 200 pero status=unauthorized
curl -s -o /dev/null -w "HTTP %{http_code}\n" -X POST "$GAS_LOCK_URL?token=incorrecto" \
  -H 'Content-Type: application/json' -d '{"action":"ping"}'
# -> HTTP 200, cuerpo {"status":"unauthorized"}

# 3) Hoja sin migrar: HTTP 200 pero status=schema_not_migrated
curl -s -X POST "$GAS_LOCK_URL?token=$GAS_LOCK_SECRET" \
  -H 'Content-Type: application/json' \
  -d '{"action":"save","spreadsheetId":"<HOJA_SIN_MIGRAR>","userEmail":"a@b.cl","idempotencyKey":"k1","limite":10,"row":[]}'
# -> {"status":"schema_not_migrated"}
```

## 8. Pruebas desplegadas de concurrencia e idempotencia

Los tests locales (`npm test`, 168 casos) prueban la lógica con un sandbox, pero
**no reproducen la serialización real de Google**. Esta batería contra el
endpoint publicado es la **verificación formal recomendada** del despliegue
actual (no bloqueante para la operación diaria).

| Prueba | Criterio de éxito |
|---|---|
| Secuencial (5) | consumo exacto `+5` |
| 2 simultáneos, **misma clave** | una sola fila; ambas `duplicate`; consumo `+1` |
| 2 simultáneos, **claves distintas** | dos filas; consumo `+2` |
| 5 simultáneos, claves distintas | 5 filas; consumo `+5` |
| Último cupo | exactamente N filas, nunca N+1 |
| Cupo agotado | `quota_exceeded`, **ninguna** fila nueva |
| Reintento secuencial | `duplicate`, sin fila ni consumo adicional |
| Error parcial (caer tras el append) | el reintento devuelve el resultado original |
| Puente con cupo insuficiente | `quota_exceeded`, **ninguna** fila |
| Puente repetido | una sola vez por gasto; un solo asiento; un solo descuento de fondo |
| Aprobación interrumpida | rendición queda en `procesando` y el reintento la completa |

## 9. Rotar o revocar

**Rotar el secreto**
1. Script: Propiedades del script → editar `GAS_LOCK_SECRET`.
2. Vercel: actualizar `GAS_LOCK_SECRET` y redesplegar.
3. Las peticiones en vuelo con el secreto viejo pasan a `status=unauthorized` y
   el backend responde 503 sin escribir nada.

**Revocar por completo**
1. Borrar la propiedad `GAS_LOCK_SECRET`, o
2. **Implementaciones → ⋮ → Eliminar**: el endpoint `/exec` deja de existir.

En ambos casos el backend responde `503` y **no se pierde ni se duplica ningún
gasto**: es el comportamiento de fallo cerrado.

## 10. Riesgos aceptados

- **Latencia:** 1–3 s por guardado, más en la primera llamada tras inactividad.
  La clave de idempotencia neutraliza el doble clic que provoca.
- **Alcance del bloqueo:** global, no por empresa.
- **Edición manual** de `Gastos`: fuera del control.
- **Fallo de neutralización:** puede quedar 1 unidad sobre el límite; se corrige
  en la siguiente reconciliación (`/api/auth/me`).