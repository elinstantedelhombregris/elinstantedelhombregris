# La campaña nacional «Mi Argentina ideal»

Decisión del 9/10/2026: existe una campaña nacional y permanente, `mi-argentina-ideal`, y la abre y responde por ella Juan Bravin. Todo aporte que se publica sin elegir otra campaña le corresponde, así que hay alguien que debe una devolución.

Desde el 20/10/2026 cualquiera con cuenta verificada puede **proponer** una campaña, pero sólo la administración la **abre**, y sólo después de que traiga 50 personas nuevas (ver «Campañas que propone la gente», más abajo, y la spec `docs/specs/2026-10-19-mi-argentina-ideal-la-pila.md` §11).

Esta página explica cómo sembrarla, quién administra y qué hace falta antes de tocar producción. La siembra y el permiso están en el código; sembrar en producción es un paso humano.

## Quién administra

La lista es `ADMIN_USERNAMES`: nombres de usuario separados por comas, tal como figuran en la tabla `users` de **v2** (no los de v1). Sin la variable, nadie administra.

- `POST /api/v1/campanas` lo puede usar cualquier cuenta con el correo verificado: la campaña nace en borrador. **Abrir o programar** una campaña, y decidir sobre las que están en revisión aunque sean de otra cuenta, es sólo de la administración (`403 NOT_ADMIN` para el resto). Quien impulsa una campaña la presenta, la retira para corregir y, una vez abierta, la pausa, la pasa a devolución y la cierra.
- Se compara con el nombre **de la base**, no con el del token de sesión. Si se cambia `ADMIN_USERNAMES`, el efecto es inmediato en el siguiente pedido; no hay que esperar a que venza ninguna sesión.
- Revisar una campaña (`PUT /api/v1/campanas/:id`), publicar la devolución y manejar el equipo siguen como antes: los hace quien convoca o un editor invitado. Ojo: revisar el contrato devuelve la campaña a borrador y sube la edición, y reabrirla es una acción de administración.
- `GET /api/auth/me`, el login y el refresh devuelven `esAdmin` dentro de `user`. La web lo usa para mostrar u ocultar los controles; el permiso real es el de la API.

## Antes de sembrar en producción

1. **Las migraciones tienen que estar aplicadas** en la base de destino (hasta la 0042: Mirar, campañas propuestas y aportes parecidos). La siembra escribe en `campanas` y `campana_ediciones` y lee `users`; sin esas migraciones falla en el primer enunciado.
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

## Mirar: reportes, retención y avisos

En Mirar no hay revisión previa (decisión D3 del dueño): un aporte entra en cuanto se publica.

- **Reportes.** Cualquiera puede reportar un aporte con uno de tres motivos. Un reporte cuenta sólo si quien reporta ya contestó cinco aportes; así nadie saca un aporte abriendo trece pestañas privadas. **Con 13 reportes que cuentan, el aporte sale de Mirar y de Ver**: no se borra, queda retenido, y su autor ve en Mi espacio por qué salió.
- **Avisos.** Te llega un aviso en Mi espacio, en la pestaña Avisos, en dos casos: cuando un aporte sale por reportes, y con el primer reporte por «tiene datos de una persona». Los dos llevan a `/gestion/pila`.
- **Retener y devolver** (`/gestion/pila`). Ahí ves los aportes reportados, con los motivos y cuántos reportes cuentan. «Retener ahora» saca un aporte en el momento, sin esperar los 13, y te pide un motivo. «Devolver» lo vuelve a poner, y los reportes empiezan a contar de nuevo desde cero. Cada decisión queda registrada con tu cuenta.
- **El filtro de datos personales** frena antes de publicar los teléfonos, mails y números de DNI en los aportes de Mi Argentina ideal. Es una protección, no una moderación: no juzga lo que se dice.

## Campañas que propone la gente

1. Alguien con cuenta verificada propone una campaña en `/campanas/proponer` y la presenta. Desde ahí la campaña está **juntando gente** (estado `reuniendo`), con una página pública que muestra su progreso.
2. Cuenta una persona **nueva** que llega desde esa página, toca «Sumate» y publica su primer aporte o da sus primeras cinco opiniones en Mirar. Cada persona cuenta para una sola campaña. Si su aporte se retira o se retiene, deja de contar.
3. Al llegar a **50 personas** (`UMBRAL_IMPULSO` en `@v2/shared`), la campaña pasa sola a **revisión** (`por_revisar`), y te llega un aviso a vos y a quien la impulsa.
4. En `/gestion/campanas`, sección «Para revisar», ves las reglas de la campaña, quién la impulsa, cuántas personas trajo y lo que escribieron esas personas. Revisá que las reglas se cumplan: una pregunta, una fecha de devolución posible, un uso de datos claro y nada que ataque a nadie. No se juzga si la idea gusta. Después:
   - **Abrir** o **Programar**: la campaña queda en manos de quien la impulsa, que coordina, publica la devolución y la cierra.
   - **Devolver con un motivo**: vuelve a `reuniendo` y quien la impulsa lee tu motivo en su historial.
5. Cada cuenta puede tener una sola campaña juntando gente o en revisión por vez.

## Lanzamiento en persona: el cartel con QR

Mirar sólo muestra aportes reales (decisión D1), así que el arranque se hace en persona: en escuelas, clubes y plazas, con un cartel que lleva un código QR. Cada persona escanea y carga su aporte en su propio teléfono. No hace falta modo asistido.

- El QR apunta a `https://elinstantedelhombregris.com/mi-argentina-ideal/imaginar`. Para una campaña que junta gente, a `https://elinstantedelhombregris.com/campanas/<slug>`, así cuenta para esa campaña.
- Cualquier generador de QR sirve, porque el enlace no lleva datos de nadie.
- Una escuela entera sale a internet por una sola conexión. Los límites de pedidos están pensados para eso (mil por hora por conexión, y el techo real va por persona), pero conviene avisar antes de un encuentro grande.
- Si en algún lugar hace falta escucha asistida (alguien que carga lo que otra persona dice), primero hay que sumar el canal «asistido» a las reglas de la campaña. Eso es una edición nueva.

