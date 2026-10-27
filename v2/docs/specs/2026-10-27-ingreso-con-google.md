# Ingresar y crear la cuenta con Google

**Estado:** propuesta, 27/10/2026. Decidido por Juan: primero Google y después Microsoft. La cuenta se vincula sola sólo si Google garantiza que el correo es de quien entra. Quien llega nuevo elige su nombre de usuario en una pantalla propia.

## Por qué

Hoy una cuenta se crea con usuario, nombre, correo y contraseña. Después hay que abrir el enlace del correo de verificación. Son dos pasos donde la gente se cae. El segundo depende además de que producción esté mandando correos de verdad: sin `RESEND_API_KEY`, el sitio sólo registra el envío. «Continuar con Google» resuelve las dos cosas a la vez, porque Google ya verificó ese correo.

Para participar no hace falta cuenta, y eso no cambia. Esto es para quien sí quiere una: para que sus aportes la sigan a otro dispositivo, para proponer una campaña o para coordinarla.

## Qué ve la persona

1. En `/ingresar` y en `/registrarse`, arriba del formulario, aparece el botón **«Continuar con Google»**. Debajo dice «o con tu correo» y sigue el formulario de siempre. El botón sólo aparece si producción tiene configurado Google (ver «Configuración»).
2. Al tocarlo va a la página de Google, elige su cuenta y vuelve.
3. Al volver pasa una de estas cosas:
   - **Ya había entrado con Google:** queda adentro y vuelve a la página desde donde vino (el mismo `volver` de hoy).
   - **Tiene una cuenta con ese correo y Google lo da por verificado:** se vinculan y queda adentro. Ver las reglas en «Vincular».
   - **Es nueva:** ve la pantalla «**Último paso**» (`/registrarse/google`). Muestra el correo con el que entró, para que sepa qué cuenta usó, y pide dos datos:
     - **Usuario**, con una sugerencia ya disponible armada con la parte del correo antes de la @ y las mismas reglas de siempre (3 a 32 caracteres: letras, números, `_` y `-`).
     - **Nombre**, con la misma aclaración que en el registro: no se publica.

     Al confirmar, la cuenta queda creada con el correo verificado y la persona adentro.

   - **Tiene el doble factor prendido:** pasa por `/2fa-desafio`, igual que hoy después de la contraseña.
   - **Canceló en Google, o algo falló:** vuelve a `/ingresar` con un mensaje que dice qué pasó y que puede usar su correo.

4. En Mi espacio, el apartado de la cuenta dice «Entrás con Google (correo@…)».

Las palabras en pantalla van en voseo y siguen el glosario. El botón respeta la guía de marca de Google: el logo «G» oficial servido desde el propio sitio, sin CDN, y el texto «Continuar con Google».

## El flujo, del lado del servidor

Es el flujo de «código de autorización» con PKCE, entero en la API. **No se carga ningún script de Google en las páginas.** Google no ve qué hace la persona en el sitio, y la CSP no cambia: el botón es un enlace común, y el ida y vuelta son navegaciones, no pedidos de JavaScript.

1. `GET /api/auth/google?volver=<ruta>`
   - Arma `state`, `nonce` y un `code_verifier` al azar.
   - Los guarda en la cookie `eihg_google`: firmada con `SESSION_SECRET`, `httpOnly`, `Secure`, `SameSite=Lax`, `path=/api/auth/google`, por 10 minutos, junto con `volver`. La API lo valida con las mismas reglas que `volverTrasIngresar` de la web: una ruta propia, sin `//`, que no sea `/ingresar`, `/registrarse` ni `/2fa-desafio`; si no, vuelve a `/mi-espacio`.
   - Redirige a Google con `response_type=code`, `scope=openid email`, `code_challenge` (S256), `state`, `nonce` y `prompt=select_account`.
2. `GET /api/auth/google/callback?code&state`
   - Lee y borra `eihg_google`. Si falta, si venció o si el `state` no coincide, vuelve con `error=google_vencido`.
   - Cambia el código por los tokens en el endpoint de tokens de Google, con el secreto y el `code_verifier`. Lo único que se usa es el `id_token`; el token de acceso no se guarda.
   - **Verifica el `id_token`:**
     - firma RS256 con las claves públicas de Google, que se guardan en memoria según su `Cache-Control` y se vuelven a pedir si llega un `kid` desconocido;
     - `iss` es `https://accounts.google.com` o `accounts.google.com`;
     - `aud` es el client id;
     - `exp` e `iat`, con un minuto de tolerancia;
     - el `nonce` coincide.
   - **Sin `email_verified: true` no sigue:** vuelve con `error=google_sin_verificar`. Ni crea cuenta ni vincula.
   - Busca la identidad por `(google, sub)`, nunca por correo, y aplica «Vincular» o «Cuenta nueva».
   - **Si la cuenta tiene doble factor:** redirige a `/2fa-desafio?ticket=…&volver=…`, con el mismo ticket que firma hoy `/login`. La página del desafío ya respeta `volver`.
   - **Si no:** emite las cookies de sesión de siempre (`setAuthCookies`) y redirige a `volver`.
3. `GET /api/auth/google/alta` y `POST /api/auth/google/alta`, para la pantalla «Último paso».
   - Los dos leen la cookie `eihg_google_alta`: firmada, `httpOnly`, 15 minutos, `path=/api/auth/google`, con `sub` y correo, y se escribe sólo en el callback.
   - El GET devuelve el correo y una sugerencia de usuario libre.
   - El POST recibe `{ username, name }` validados con los esquemas del registro. Vuelve a comprobar que la identidad y el correo sigan libres (si dos pestañas compiten, gana una sola). Crea la cuenta sin contraseña, con el correo verificado y su identidad, en una transacción, emite la sesión y borra la cookie.
   - El POST va exento del doble envío de CSRF, igual que `/register`: no hay sesión todavía, y la cookie `Lax` firmada no viaja en un POST que venga de otro sitio.
4. `GET /api/auth/proveedores` devuelve `{ google: boolean }`. La web muestra el botón sólo con `true`.

Las cuatro rutas van con `loginRateLimit()`. Ninguna escribe el correo ni el `sub` en los registros del servidor.

## Vincular: cuándo una entrada con Google se une a una cuenta que ya existe

Sólo por correo, y sólo con `email_verified: true` de Google. Hay tres casos:

- **La cuenta existente tiene el correo verificado:** las dos pruebas dicen lo mismo, así que se vincula y entra.
- **La cuenta existente no tiene el correo verificado.** Es el caso del «secuestro previo»: alguien pudo crear una cuenta con el correo de otra persona y una contraseña suya, y esperar a que la dueña real entre con Google. Google prueba quién es la dueña, y la contraseña no probó nada. Entonces se vincula, pero antes se limpia:
  - se borran la contraseña y el doble factor;
  - se cierran todas las sesiones;
  - se marca el correo como verificado.

  Lo publicado con esa cuenta queda como está. El paso se registra en `eventos_civicos` para la persona: «Vinculamos tu cuenta con Google y cerramos las sesiones anteriores».

- **La cuenta existente está desactivada:** no entra. Vuelve con `error=cuenta_inactiva`.

Una identidad de Google queda atada a una sola cuenta: `(proveedor, sujeto)` es único. Si después la persona cambia el correo de su cuenta, la identidad sigue, porque se busca por `sub`.

## Cuenta nueva

No se crea nada hasta que la persona confirma el «Último paso». Si cierra la pestaña antes, no queda una cuenta a medio hacer, y la cookie vence sola en 15 minutos.

## Cuentas sin contraseña

`users.password_hash` pasa a aceptar `NULL` (migración `0043`). Con eso:

- **El ingreso con contraseña** contra una cuenta sin contraseña responde el mismo «Email o contraseña incorrectos» de hoy, sin decir si la cuenta existe.
- **«Olvidé mi contraseña»** sirve para crear una, porque el correo está verificado. Es la forma de tener los dos caminos de entrada.
- **Las dos acciones que hoy piden la contraseña** son cerrar la cuenta (`POST /api/v1/mi-espacio/cerrar-cuenta`) y apagar el doble factor (`POST /api/auth/2fa/disable`). Para una cuenta sin contraseña, aceptan en su lugar una **confirmación reciente con Google**:
  - el botón «Confirmar con Google» vuelve a pasar por Google con `?para=confirmar`;
  - el callback comprueba que el `sub` sea el de la cuenta con la sesión abierta;
  - deja la cookie `eihg_confirmado`: firmada, atada al id de la cuenta, por 5 minutos.

  Sin eso, quien entró sólo con Google no podría cerrar su cuenta, y cerrarla es uno de sus derechos.

## Datos que se guardan

Una tabla nueva, `identidades_externas` (esquema en `packages/db/src/schema/identidades.ts` y repositorio en `repositories/identidades.ts`):

| columna                 | qué                                                                 |
| ----------------------- | ------------------------------------------------------------------- |
| `id`                    | `serial`                                                            |
| `user_id`               | la cuenta; `on delete cascade`                                      |
| `proveedor`             | `'google'`; un `check` lo limita a los proveedores que hay          |
| `sujeto`                | el `sub` de Google: un identificador estable, no el correo          |
| `correo`                | el correo que dijo Google al vincular, para mostrarlo en Mi espacio |
| `creada_en`, `usada_en` | cuándo se vinculó y cuándo se usó por última vez                    |

Índice único en `(proveedor, sujeto)` y otro en `user_id`. **No se piden el nombre, la foto ni los contactos**: el alcance es `openid email`, nada más. Lo único que se guarda de Google es el `sub` y el correo. El nombre lo escribe la persona.

**Cerrar la cuenta tiene que borrar sus identidades.** `CuentaCivicaRepository.cerrar` no borra la fila de `users`: la anonimiza y borra sesiones, tokens y doble factor. Por eso la cascada no alcanza, y se suma un `delete from identidades_externas` al mismo enunciado. Si no, una cuenta cerrada se podría reabrir entrando con Google.

## Privacidad

- La política (`content/legal/privacidad.mdx`) suma un renglón a la tabla de proveedores: «**Google** — sólo si elegís Continuar con Google. Google sabe que entraste a este sitio y nos manda tu correo y un identificador de tu cuenta. No le pedimos tu nombre, tu foto ni tus contactos». Sale como versión 5, con su fecha.
- «Ningún tercero ve tu dirección IP por abrir el sitio» sigue siendo verdad: Google la ve sólo si la persona toca el botón.
- Participar sigue sin pedir cuenta. «Anónimo si querés» no cambia.

## Configuración

| variable               | dónde              | qué                                                 |
| ---------------------- | ------------------ | --------------------------------------------------- |
| `GOOGLE_CLIENT_ID`     | Vercel, Production | el ID de cliente de Google; no es secreto           |
| `GOOGLE_CLIENT_SECRET` | Vercel, Production | el secreto; **nunca** en el repo ni en un chat      |
| `PUBLIC_WEB_URL`       | Vercel, Production | tiene que ser `https://elinstantedelhombregris.com` |

La dirección de vuelta se arma con `PUBLIC_WEB_URL`: `${PUBLIC_WEB_URL}/api/auth/google/callback`. Tiene que ser idéntica a la registrada en Google.

En producción, si falta alguna de las tres o `PUBLIC_WEB_URL` no es `https`, Google queda apagado (`proveedores.google = false`) y la API lo avisa una sola vez en el registro. Así un despliegue a medio configurar no muestra un botón roto.

Los correos de verificación y de recupero usan la misma `PUBLIC_WEB_URL`. Si hoy no está puesta, esos enlaces apuntan a `localhost` (anotar como deuda si se confirma).

## Pruebas

- **Unitarias (civic-core o API):**
  - verificación del `id_token`: firma, `iss`, `aud`, `exp`, `nonce` y `email_verified`, con claves de prueba;
  - la sugerencia de usuario;
  - la decisión «entrar / vincular / limpiar y vincular / alta / rechazar», como función pura.
- **Integración (Postgres descartable):**
  - un Google falso en un puerto local sirve el endpoint de tokens y las claves, y la configuración de prueba lo apunta ahí;
  - casos: alta completa; segunda entrada; vinculación con correo verificado; vinculación con limpieza (contraseña, doble factor y sesiones borrados); cuenta desactivada; `state` vencido; carrera de dos altas; doble factor después de Google; cerrar la cuenta con confirmación reciente.
- **Web:**
  - el botón aparece sólo con `google: true`;
  - la pantalla «Último paso»: sugerencia, errores de usuario tomado y envío;
  - los mensajes de `?error=`.
- **E2E:** desde `/ingresar` hasta la redirección a Google, comprobando la URL armada: `scope`, `code_challenge_method=S256` y la dirección de vuelta. Después, la pantalla «Último paso» con la API simulada. El ida y vuelta real con Google se prueba a mano en producción, con la cuenta de Juan.

## Fuera de esta entrega

- **Microsoft.** Va después. Su `email` no siempre está verificado en las cuentas de trabajo y se vincula sólo con `xms_edov`; necesita su propia sección.
- Desvincular Google desde Mi espacio. Hace falta tener contraseña para no quedarse sin entrada; va con Microsoft.
- Cambiar el correo de la cuenta.
- El «One Tap» de Google, que exige cargar su script en las páginas.

## Plan en tareas

1. [ ] ADR 0012 «Ingreso con proveedores externos»: flujo del servidor, sin SDK ni dependencias nuevas (la firma se verifica con `node:crypto` y `jsonwebtoken`, que ya está), y las reglas de vinculación.
2. [ ] Migración `0043`: `identidades_externas` y `password_hash` que acepta `NULL`. Esquema y repositorio, con sus pruebas.
3. [ ] Verificación del `id_token` y decisión de vinculación como funciones puras, con sus pruebas.
4. [ ] Rutas `/api/auth/google`, `/callback`, `/alta` y `/proveedores`; exención de CSRF de `/alta`; configuración; pruebas de integración con el Google falso.
5. [ ] Cuentas sin contraseña: login, recupero, confirmación reciente en cerrar la cuenta y apagar el doble factor; `cerrar` borra las identidades.
6. [ ] Web: botón en `/ingresar` y `/registrarse`, pantalla «Último paso», mensajes de error y el apartado de Mi espacio.
7. [ ] Política de privacidad, versión 5.
8. [ ] Verificación completa, E2E y prueba a mano en producción con la cuenta de Juan.
