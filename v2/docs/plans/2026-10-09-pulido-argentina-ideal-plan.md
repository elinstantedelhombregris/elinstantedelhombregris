# Plan — pulido de «Argentina ideal»

> Análisis y decisiones: `v2/docs/analisis/2026-10-09-pulido-argentina-ideal/README.md`.
> Rama de integración: `codex/argentina-ideal`. Unidades: `unit/pulido/<nombre>` en `.worktrees/pulido--<nombre>`.
> Nada se mergea a `main` ni se pushea sin confirmación del dueño: un push a `main` despliega v2 y la rama trae migraciones 0025–0030 sin aplicar en producción.

## Decisiones fijas
- **aporte** = lo publicado; **borrador** = lo no publicado; **campaña**; **reglas de la campaña** (no «contrato»); **etapa** (no «fase»); **lugar** / «todo el país» (no «ámbito»); **ficha**. «Voz» solo en la invitación de marca.
- Campaña nacional `SLUG_CAMPANA_NACIONAL = 'mi-argentina-ideal'` (en `@v2/shared`), responsable Juan Bravin; edición 1 recibe hasta 2027-02-28, lectura 2027-03-01..14, devolución 2027-03-15, luego trimestral. Todo aporte sin campaña elegida va a ella.
- Abrir campañas y cambiar su estado: solo admin (`ADMIN_USERNAMES`, allowlist existente). `/auth/me` expone `esAdmin`.
- Imaginar vive en el mapa: una entrada; la conversación guiada es el camino por defecto; el aporte directo es la alternativa. `/imaginar` y `/campanas/:slug/participar` redirigen conservando la query.
- Exportaciones: se avanzan al consultarlas; cron diario de respaldo.
- Pruebas: nunca `pnpm verify`/`pnpm test` a secas (`v2/.env` es producción). Se corre `lint`, `type-check`, `test:unit`, `test:scripts`, `PUERTO_PRUEBA=<n> pnpm test:integration:local`, `build`. Los worktrees no llevan `v2/.env`.

## Ola 1 — en paralelo
- [ ] **U1 campana-admin** (db, shared, api): siembra idempotente de la nacional; `exigirAdmin`; username desde la fila en `authenticate`; `esAdmin` en `/auth/me` y en `lib/auth/types.ts`; pruebas. Puerto 55451.
- [ ] **U2 mapa-unido** (web): una entrada en el mapa; redirecciones; `lib/participacion/aportar.ts` (`APORTAR_HREF`, `aportarHref`); campaña por defecto = nacional; enlaces entrantes; arreglos B1–B5, consentimiento que no se resetea, borrador que no se borra; copy de esos archivos con el glosario. Puerto 55452.
- [ ] **U3 bugs** (api exportaciones, auth web, fichas, colaborar, móvil): cron diario + avance al consultar; ingresar/registrarse/2FA en papel; enlace que recarga en la ficha; invitación que no se resetea; `.env.example` móvil; error de red que borra la sesión en móvil. Puerto 55453.

## Ola 2 — después de mergear la 1
- [ ] **U4 campañas-web**: ocultar abrir campaña a no-admin (`esAdmin`); nacional fija arriba; enlaces con `aportarHref`; ejemplo por marca y no por slug; copy de Campañas con el glosario y los reemplazos del informe A.
- [ ] **U5 barrido de copy** (Home, Mi espacio, nav/footer, Fichas, Radiografía, Mandato, Datos abiertos): glosario, H1 que nombran, enums traducidos (un solo mapa por concepto en `lib/vocabulario.ts`), plurales, ceros en palabras, `volver` en los cinco enlaces a ingresar.

## Ola 3
- [ ] **U6 guardia del glosario**: test AST con lista permitida y línea de base que solo baja (modelo: `packages/shared/src/open-data/__tests__/consentimiento.test.ts`).
- [ ] **U7 sistema de diseño**: `participacion/Elementos.tsx` → kit Papel; bordes con token; contraste del pie y del mapa; plantilla única de página (Fichas).
- [ ] **U8 app móvil**: glosario, campaña nacional por defecto, elección de lugar, pantalla de éxito, avisos de publicación.

## Después
- Profundidad (leyenda de la Radiografía, gráficos con n, enlaces a PLANes, Mandato como embudo, Recibo con «qué sigue»), guía PDF regenerada, conteos de PLAN hardcodeados.
- Producción, con confirmación: aplicar migraciones, cuenta de Juan verificada en v2, `ADMIN_USERNAMES` en Vercel, correr la siembra con `--produccion`.
