# Despliegue del control de cupos (Apps Script + LockService)

**Estado: el script NO está desplegado.** Hasta que completes los pasos de este
documento, el guardado de gastos y el puente RindeNX responden `503` y **no
registran nada**. Es intencional: el sistema falla cerrado antes que escribir sin
serialización.

⚠️ No se modificó el esquema de ninguna hoja. La migración de la sección 4 la
ejecutas tú, de forma explícita.

---

## 1. Qué hace y por qué

Google Sheets no ofrece incremento atómico de celda ni escritura condicional.
Un patrón leer-modificar-escribir sobre `Usuarios!F` pierde incrementos con dos
peticiones simultáneas. `LockService` de Apps Script serializa las operaciones
que consumen cupos, y dentro de esa sección crítica se hace:

1. Verificar la `idempotency_key`.
2. Releer el consumo y el límite vigentes.
3. Decidir si la operación cabe.
4. Escribir la fila con la clave en el **mismo** append.

Ningún registro válido se borra. Un registro que no cabe se marca
`estado='rechazado'` y no cuenta para el consumo.

## 2. Crear el proyecto

1. Abre <https://script.google.com> y crea un proyecto nuevo.
2. Borra el contenido de `Code.gs`.
3. Pega el contenido de `google-apps-script/GastosLock.gs` del repositorio.
4. Guardar.

## 3. Configurar el secreto (paso crítico)

1. En el proyecto, abre **Configuración del proyecto** (icono de engranaje) →
   **Mostrar el archivo de manifiesto `appsscript.json`**.
2. Añade el作用域 `https://www.googleapis.com/auth/spreadsheets` bajo
   `oauthScopes`.
3. Ve a **Configuración del proyecto → Propiedades del script → Añadir**:
   - Nombre: `GAS_LOCK_SECRET`
   - Valor: una cadena aleatoria de al menos 32 caracteres.

Genera el valor de forma local, por ejemplo:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

> El script **rechaza toda petición** si esta propiedad no existe. No lo
> guardes en el repositorio ni en un archivo de texto compartido.

## 4. Migrar el esquema de las hojas (autorización explícita)

Las columnas nuevas son **M** = `idempotency_key` y **N** = `estado`. Los
registros históricos quedan intactos: ambas vacías cuentan como estado `ok`.

La migración es idempotente y **solo escribe la fila 1**.

```bash
curl -X POST "$GAS_LOCK_URL?token=$GAS_LOCK_SECRET" \
  -H 'Content-Type: application/json' \
  -d '{"action":"migrate","spreadsheetId":"<ID_HOJA_EMPRESA>"}'
```

Respuesta esperada:

```json
{"status":"migrated","added":["idempotency_key","estado"],
 "message":"Cabeceras agregadas. No se modifico ningun registro existente."}
```

Ejecuta una vez **por cada hoja de empresa** que exista en `Usuarios!J`.
Verifica antes y después que el número de filas de `Gastos` no cambió.

## 5. Autorizar y desplegar

1. **Publicar → Nuevo despliegue → Aplicación web**
2. 类型: **Aplicación web**
3. Ejecutar como: **Yo** (la cuenta propietaria del proyecto)
4. Quién tiene acceso: **Cualquier persona**
   - El secreto de la sección 3 es lo que protege el endpoint. Con acceso
     restringido a tu cuenta el backend no podrá llamarlo.
5. Desplegar y autorizar los permisos de Sheets cuando Google los solicite.
6. Copiar la **URL /exec**.

## 6. Configurar el backend

En `.env.local` (no en `.env.example`, no en Git):

```bash
GAS_LOCK_URL=https://script.google.com/macros/s/AKfycb.../exec
GAS_LOCK_SECRET=<el mismo valor de la sección 3>
GAS_LOCK_TIMEOUT_MS=20000
```

Reiniciar el servidor de desarrollo o redesplegar.

## 7. Verificar

```bash
# 1) El script responde
curl -X POST "$GAS_LOCK_URL?token=$GAS_LOCK_SECRET" \
  -H 'Content-Type: application/json' -d '{"action":"ping"}'
# -> {"status":"ok","service":"gastos-lock",...}

# 2) Un token incorrecto debe ser rechazado
curl -X POST "$GAS_LOCK_URL?token=incorrecto" \
  -H 'Content-Type: application/json' -d '{"action":"ping"}'
# -> {"status":"unauthorized"} con HTTP 401

# 3) La hoja sin migrar debe decirlo claramente
curl -X POST "$GAS_LOCK_URL?token=$GAS_LOCK_SECRET" \
  -H 'Content-Type: application/json' \
  -d '{"action":"save","spreadsheetId":"<HOJA_SIN_MIGRAR>","userEmail":"a@b.cl","idempotencyKey":"k1","limite":10,"row":[]}'
# -> {"status":"schema_not_migrated"} con HTTP 409
```

## 8. Pruebas obligatorias antes de declarar validado

La garantía central **no está probada hasta ejecutar con el script desplegado**.

| Prueba | Criterio de éxito |
|---|---|
| Secuencial (5) | consumo exacto `+5` |
| 2 simultáneos, **misma clave** | una sola fila; ambas respuestas `duplicate`; consumo `+1` |
| 2 simultáneos, **claves distintas** | dos filas; consumo `+2` |
| 5 simultáneos, claves distintas | 5 filas; consumo `+5` |
| Último cupo | exactamente N filas, nunca N+1 |
| Cupo agotado | `403`, **ninguna** fila nueva |
| Reintento secuencial | `duplicate`, sin fila ni consumo adicional |
| Error parcial (caer tras el append) | el reintento devuelve el resultado original |
| Puente con cupo insuficiente | `403`, **ninguna** fila, rendición no queda a medias |
| Puente repetido | una sola vez por gasto |

## 9. Rotar o revocar

**Rotar el secreto**
1. En el script: Propiedades del script → editar `GAS_LOCK_SECRET` con un valor
   nuevo.
2. En `.env.local`: actualizar `GAS_LOCK_SECRET`.
3. Reiniciar. Las peticiones en vuelo con el secreto viejo pasan a `401` y el
   backend responde `503` sin escribir nada.

**Revocar por completo**
1. Borrar la propiedad `GAS_LOCK_SECRET` del script, o
2. En el proyecto: **Implementaciones → ⋮ → Eliminar**. El endpoint `/exec` deja
   de existir de inmediato.

En ambos casos el backend empieza a responder `503` y **no se pierde ni se
duplica ningún gasto**: es el comportamiento de fallo cerrado.

## 10. Riesgos conocidos

- **Latencia.** Apps Script puede añadir 1–3 s al guardado, más en la primera
  llamada tras inactividad. La clave de idempotencia es ahora más importante:
  neutraliza el doble clic causado por esa latencia.
- **Alcance del bloqueo.** `getScriptLock()` serializa **globalmente** a todos
  los clientes, no por empresa. Aceptable a este volumen; a escala habría que
  segmentar.
- **Edición manual.** Si alguien edita `Gastos` a mano en el navegador, el
  bloqueo no lo ve. Documentado como límite conocido.
- **Fallo de la neutralización.** Si el script marca como rechazado y esa
  escritura falla, el consumo podría exceder el límite en 1. El valor se corrige
  en la siguiente reconciliación.