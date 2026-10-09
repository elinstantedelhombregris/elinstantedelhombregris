# La campaña nacional «Mi Argentina ideal»

Decisión del 9/10/2026: existe una campaña nacional y permanente, `mi-argentina-ideal`, y la abre y responde por ella Juan Bravin. Todo aporte que se publica sin elegir otra campaña le corresponde, así que hay alguien que debe una devolución. Solo la administración abre campañas y cambia su fase.

Esta página explica cómo sembrarla, quién administra y qué hace falta antes de tocar producción. La siembra y el permiso están en el código; sembrar en producción es un paso humano.

## Quién administra

La lista es `ADMIN_USERNAMES`: nombres de usuario separados por comas, tal como figuran en la tabla `users` de **v2** (no los de v1). Sin la variable, nadie administra.

- `POST /api/v1/campanas` y `POST /api/v1/campanas/:id/estado` responden `403 NOT_ADMIN` a quien no figura. La fase, además, solo la cambia quien convocó la campaña (`403 SIN_PERMISO` para otra administradora).
- Se compara con el nombre **de la base**, no con el del token de sesión. Si se cambia `ADMIN_USERNAMES`, el efecto es inmediato en el siguiente pedido; no hay que esperar a que venza ninguna sesión.
- Revisar una campaña (`PUT /api/v1/campanas/:id`), publicar la devolución y manejar el equipo siguen como antes: los hace quien convoca o un editor invitado. Ojo: revisar el contrato devuelve la campaña a borrador y sube la edición, y reabrirla es una acción de administración.
- `GET /api/auth/me`, el login y el refresh devuelven `esAdmin` dentro de `user`. La web lo usa para mostrar u ocultar los controles; el permiso real es el de la API.

## Antes de sembrar en producción

1. **Las migraciones 0025 a 0030 tienen que estar aplicadas** en la base de destino. La siembra escribe en `campanas` y `campana_ediciones` y lee `users`; sin esas migraciones falla en el primer enunciado.
2. **La cuenta de Juan tiene que existir en v2**, estar activa y **tener el correo verificado**. La siembra se niega si no (quien abre la campaña tiene que poder recibir los avisos de ella). También `POST /campanas/:id/estado` exige el correo verificado para abrir.
3. **`ADMIN_USERNAMES` tiene que contener el nombre de usuario de Juan en v2** (en Vercel, y en `v2/.env` si se prueba en local). Si el nombre cambia, la lista queda desactualizada y nadie administra. Es el único paso que la siembra no revisa.
   **El orden importa:** primero se crea y verifica la cuenta, después se carga el nombre en `ADMIN_USERNAMES`. Al revés, cualquiera podría registrarse con ese nombre antes que Juan y quedar como administración.
4. Tener a mano la URL de la base. **El script no lee `v2/.env`**: `v2/.env` apunta a producción y un script que lo lee por costumbre escribe ahí sin que nadie lo haya decidido (D-014).

## Sembrar en local

Contra la base descartable que levanta `pnpm test:integration:local`, o contra un Postgres propio con las migraciones aplicadas:

```bash
cd v2/packages/db

# En seco: lee, valida e imprime el contrato que escribiría. No cambia nada.
pnpm db:seed-campana-nacional \
  --url=postgresql://postgres@127.0.0.1:55440/basta_descartable_test \
  --owner-username=<usuario>

# Escribe.
pnpm db:seed-campana-nacional \
  --url=postgresql://postgres@127.0.0.1:55440/basta_descartable_test \
  --owner-username=<usuario> --aplicar
```

Un host `127.0.0.1` o `localhost` usa el mismo puente que los tests; no hace falta nada más. Antes de hacer nada el script imprime host, base y responsable (nunca la clave).

## Sembrar en producción

Un host que no es de esta máquina exige `--produccion`, incluso en seco: sin esa bandera el script ni se conecta.

```bash
cd v2/packages/db

# 1. En seco. Revisá host, base y responsable en lo que imprime, y el contrato completo.
pnpm db:seed-campana-nacional --url='<DATABASE_URL de producción>' \
  --owner-username=<usuario de Juan en v2> --produccion

# 2. Solo si lo anterior es lo que querés.
pnpm db:seed-campana-nacional --url='<DATABASE_URL de producción>' \
  --owner-username=<usuario de Juan en v2> --produccion --aplicar
```

Si podés, pasá la URL desde una variable de entorno del momento (`--url="$URL_PRODUCCION"`) para que la clave no quede escrita en el historial del shell. Después de sembrar, abrí `/campanas/mi-argentina-ideal` y verificá que muestre edición 1 y estado abierta.

### Qué escribe

- Una fila en `campanas`: slug `mi-argentina-ideal` (`SLUG_CAMPANA_NACIONAL` de `@v2/shared`), `id_local` fijo, `revision 1`, `estado abierta`, `territorios: []` (todo el país), y la cuenta indicada como `creador_id`.
- Una fila en `campana_ediciones` para la edición 1, en el mismo enunciado SQL: no puede quedar una sin la otra.

Nace abierta y sin pasar por borrador, a propósito: un aporte solo entra si la campaña está abierta y su edición coincide con la revisión vigente. La edición vigente es la 1.

### Idempotencia

- Si la campaña ya existe y es de la misma cuenta: imprime «La campaña ya existe» y sale con 0, **sin tocar nada**. No compara el contrato, porque pudo haberse editado a propósito; tampoco depende de la fecha de hoy.
- Si existe y es de otra cuenta: sale con código 1 y no cambia nada.
- Sin cuenta, con la cuenta inactiva o sin correo verificado: sale con 1 antes de escribir.
- Códigos de salida: `0` bien o ya existía, `1` corte esperado (cuenta, dueño, fechas), `2` error de uso (faltan opciones, host remoto sin `--produccion`).

### Fechas del contrato

La primera etapa (**Recibe aportes**) va desde el día de la siembra hasta el 28/2/2027; **Lectura**, del 1 al 14 de marzo; la primera devolución es el 15/3/2027. Cada etapa del contrato tiene una sola fecha (la de cierre) y el rango completo está escrito en su texto. Si la siembra se corre después del 28/2/2027 el script se niega y avisa: hay que actualizar `scripts/campana-nacional/contrato.ts` antes.

Después de la primera devolución la campaña sigue: hay una edición y una devolución por trimestre. Eso se hace revisando el contrato (`PUT`) con las fechas siguientes y volviéndola a abrir; ninguna tarea lo hace sola. Con la fecha de devolución vencida, `POST /campanas/:id/estado` rechaza abrirla (`FECHA_VENCIDA`).

## Qué prueba esto

- `packages/db/src/__tests__/seed-campana-nacional.test.ts` (sin base): el contrato pasa `contratoCampanaSchema`, fechas, glosario, reglas de la línea de comandos, y que ningún archivo de la siembra importa `dotenv`.
- `packages/db/tests/seed-campana-nacional.test.ts` (Postgres descartable): crear, correr de nuevo sin cambios, otro dueño, cuenta inexistente, sin verificar o inactiva, carrera de dos corridas, y el script ejecutable de punta a punta sin filtrar la clave de `--url`.
- `apps/api/tests/campanas-admin.test.ts` y `auth-esadmin.test.ts`: el permiso, que el nombre del token no lo da, y `esAdmin` en `/me`, login y refresh.
