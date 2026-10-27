# ADR 0012 — Ingreso con proveedores externos

Estado: aceptada, 27/10/2026. Empieza por Google; Microsoft va después con su propia enmienda.
La spec es `docs/specs/2026-10-27-ingreso-con-google.md`.

## Contexto

Crear una cuenta pide usuario, nombre, correo y contraseña, y después abrir un enlace de
verificación que depende de que producción mande correos. Juan pidió que se pueda entrar y
crear la cuenta con Google, y más adelante con Microsoft.

Hay tres maneras comunes de hacerlo:

- el SDK de Google en las páginas («Sign in with Google» y «One Tap»);
- una biblioteca de OAuth (Passport, `openid-client`, `arctic`);
- el flujo del código de autorización hecho a mano en la API.

## Decisión

Se usa el **flujo del código de autorización con PKCE, entero en la API**, sin SDK y sin
dependencias nuevas:

1. **Ningún script de un proveedor en las páginas.** El botón es un enlace a
   `/api/auth/google`, y el ida y vuelta son navegaciones. La CSP no cambia, y Google no ve
   qué hace la persona en el sitio. Por eso «One Tap» queda afuera: exige cargar su script.
2. **La firma del `id_token` se verifica con `node:crypto` y `jsonwebtoken`, que ya está.**
   Las claves públicas del proveedor se guardan en memoria según su `Cache-Control`. Son unas
   cien líneas que se prueban contra claves propias. Una biblioteca de OAuth ahorraría esas
   líneas, pero sumaría una dependencia sobre la parte más sensible de la cuenta.
3. **Se pide el mínimo: `openid email`.** Del proveedor se guarda sólo el `sub` y el correo,
   en `identidades_externas`. El nombre lo escribe la persona.
4. **Una identidad se busca por `(proveedor, sub)` y nunca por correo.** El correo sólo sirve
   para vincular la primera vez, y sólo si el proveedor lo da por verificado. Si la cuenta
   existente no tenía el correo verificado, antes de vincular se borran su contraseña, su doble
   factor y sus sesiones: quien la creó no probó que el correo fuera suyo.
5. **La contraseña pasa a ser opcional.** Las acciones que la pedían aceptan, para una cuenta
   sin contraseña, una confirmación reciente con el proveedor.
6. **El proveedor se apaga solo si falta configuración.** Sin client id, sin secreto o sin una
   `PUBLIC_WEB_URL` con `https`, la API no lo ofrece y la web no muestra el botón.

## Consecuencias

- Agregar Microsoft es otro módulo con las mismas piezas: el punto de entrada, la vuelta y su
  verificador. Su regla de correo verificado es otra (`xms_edov`), y por eso necesita su
  enmienda.
- Si un proveedor rota sus claves, el verificador las vuelve a pedir al ver un `kid`
  desconocido. Si el proveedor no responde, la entrada con ese proveedor falla y la entrada con
  contraseña sigue andando.
- La política de privacidad nombra al proveedor en su tabla, con el alcance exacto que se pide.
