# Probar «Llegar a tiempo a la escuela» con la API real

Desde `v2`, ejecutá `pnpm dev:escuela`. Necesitás las dependencias instaladas y `initdb`, `pg_ctl`, `psql` y `createdb` en el PATH. El comando prepara una base independiente, aplica las migraciones y deja la API en primer plano. No lee `.env` ni hereda claves de proveedores externos.

En otra terminal, desde `v2`, ejecutá `PUBLIC_API_URL=http://127.0.0.1:4000 pnpm --filter @v2/web exec vite --host 127.0.0.1 --port 4179`. Si la web ya está funcionando en ese puerto, reutilizala.

Abrí [el recorrido escolar](http://127.0.0.1:4179/recorridos/llegar-a-tiempo-a-la-escuela#ensayo-local). Arriba aparece **Probalo con cuentas y datos guardados**, con enlaces a la campaña, la ficha y la tarea preparada. Abajo sigue la simulación sin persistencia. El panel de práctica requiere una compilación de desarrollo y la entrada local de la API; no se ofrece en producción.

## Cuentas y pasos

Las tres cuentas ficticias tienen la contraseña `EscuelaLocal2026!` y correos `@example.invalid`. Sólo existen en esta base local.

1. **`escuela_coordina`**: ingresar, abrir la tarea y elegir **Elegir ficha de devolución**. Buscar «Llegar a tiempo», seleccionar la ficha, confirmar y guardar. Esta cuenta administra la iniciativa y edita la ficha.
2. **`escuela_participa`**: ingresar con otra sesión, abrir la tarea, **Sumarme al equipo** y después **Acepto hacerme cargo de esta tarea**, con firma de ensayo y nota. Son decisiones separadas.
3. Con esa misma cuenta, abrir **Aceptar o registrar un paso**, elegir **Iniciar o retomar** y registrar una nota. Sumar las cinco combinaciones ficticias de la planilla de la guía. Registrar **Declarar ejecución realizada**.
4. Abrir **Ver evidencia y resultados → Registrar evidencia del resultado**. Publicar las cuentas, el método y sus límites, autorizando la publicación en el ensayo. La ficha muestra el resultado pendiente de revisión.
5. **`escuela_revisa`**: sumarse al equipo, abrir la evidencia y registrar una revisión con firma y fundamento. Esta cuenta no creó ni realizó la tarea. Volver a la ficha: el resultado muestra la revisión y sus límites.
6. **`escuela_coordina`**: publicar la devolución en la campaña. Mantener visible la objeción sobre trabajo y cuidados y explicar qué debe investigarse antes de proponer cambiar horarios.

Para cambiar de rol, abrir Mi espacio → Cuenta y datos y cerrar sesión y volver a ingresar. También sirven perfiles o ventanas privadas independientes. Si cambia la versión de la tarea mientras escribís, el formulario conserva el texto y pide revisar la nueva versión. Una tarea tomada debe continuarse o liberarse desde la cuenta que la aceptó.

## Qué significa el resultado

La planilla contiene cinco combinaciones inventadas. A, C y E dan 07:50; B y D dan 08:05 frente a un ingreso supuesto a las 08:00. Comprobar esas sumas verifica el ejercicio y la continuidad del registro. No mide un servicio de transporte, no demuestra una mejora de puntualidad, no representa preferencias ciudadanas ni valida el diseño con personas reales. La intervención de desacuerdo también está identificada como material ficticio.

La cuenta de revisión es distinta técnicamente; una prueba automatizada con tres cuentas no acredita independencia entre personas. El piloto humano sigue pendiente según `docs/demos/2026-10-17-piloto-recorrido-escolar.md`.

## Persistencia y parada

- API: `127.0.0.1:4000`; sólo escucha en loopback.
- Postgres: `127.0.0.1:55441/basta_escuela_local`; directorio `.operations/escuela/postgres`.
- Recibos de preparación: `.operations/escuela/preparacion.json`; objetos preparados: `.operations/escuela/recorrido.json`.
- La preparación vuelve a usar los objetos y no reinicia las tareas, las firmas, las evidencias ni las revisiones. No hay borrado automático ni reinicio destructivo.
- Para parar la API, Ctrl+C en su terminal. Para detener después Postgres: `pnpm dev:escuela --detener-base`. Volver a arrancar conserva todo.
- Si ya hay otra API en el puerto 4000, el arranque falla; no mata procesos ajenos. Si el puerto de Postgres pertenece a otro directorio, rechaza modificarlo.

## Verificación reproducible

Con los servidores activos:

```sh
ESCUELA_LOCAL_E2E=1 PLAYWRIGHT_BASE_URL=http://127.0.0.1:4179 pnpm exec playwright test tests/e2e/escuela-api-local.spec.ts --workers=1
```

La prueba usa navegador, login con contraseña, cookies, CSRF y Postgres reales, sin interceptar peticiones. Crea una tarea cuyo título empieza «Verificación técnica escolar» y consume esa tarea; deja la tarea de práctica sin asignación ni vínculo. Conserva su evidencia y devolución como prueba técnica identificada. Si ya comenzaste la tarea de práctica, esa aserción final fallará: no se restablece tu progreso para hacer pasar el test.

El límite general del servidor de ensayo es 1.200 solicitudes por minuto para permitir la verificación automatizada con varias sesiones. Los límites de login, las cookies y la protección CSRF permanecen activos. Los integrantes incorporados por la prueba salen al terminar; no se retira una membresía que ya existía al empezar.
