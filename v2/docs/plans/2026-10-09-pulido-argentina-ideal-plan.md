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
- [x] **U1 campana-admin** (mergeada `63cf2897`) (db, shared, api): siembra idempotente de la nacional; `exigirAdmin`; username desde la fila en `authenticate`; `esAdmin` en `/auth/me` y en `lib/auth/types.ts`; pruebas. Puerto 55451.
- [x] **U2 mapa-unido** (mergeada `ac068941`) (web): una entrada en el mapa; redirecciones; `lib/participacion/aportar.ts` (`APORTAR_HREF`, `aportarHref`); campaña por defecto = nacional; enlaces entrantes; arreglos B1–B5, consentimiento que no se resetea, borrador que no se borra; copy de esos archivos con el glosario. Puerto 55452.
- [x] **U3 bugs** (mergeada `86cdd3a0`) (api exportaciones, auth web, fichas, colaborar, móvil): cron diario + avance al consultar; ingresar/registrarse/2FA en papel; enlace que recarga en la ficha; invitación que no se resetea; `.env.example` móvil; error de red que borra la sesión en móvil. Puerto 55453.

## Ola 2 — después de mergear la 1
- [x] **U4 campañas-web** (mergeada): ocultar abrir campaña a no-admin (`esAdmin`); nacional fija arriba; enlaces con `aportarHref`; ejemplo por marca y no por slug; copy de Campañas con el glosario y los reemplazos del informe A.
- [x] **U5 barrido de copy** — partido en U5a entrada-cuenta, U5b lectura, U5c fichas (mergeadas) (Home, Mi espacio, nav/footer, Fichas, Radiografía, Mandato, Datos abiertos): glosario, H1 que nombran, enums traducidos (un solo mapa por concepto en `lib/vocabulario.ts`), plurales, ceros en palabras, `volver` en los cinco enlaces a ingresar.

## Ola 3
- [x] **U6 guardia del glosario** (U6a textos legales + U6b guardia, mergeadas): test AST con lista permitida y línea de base que solo baja (modelo: `packages/shared/src/open-data/__tests__/consentimiento.test.ts`).
- [x] **U7 sistema de diseño** (mergeada): `participacion/Elementos.tsx` → kit Papel; bordes con token; contraste del pie y del mapa; plantilla única de página (Fichas).
- [x] **U8 app móvil** (mergeada; faltan las tres preguntas y la elección de lugar): glosario, campaña nacional por defecto, elección de lugar, pantalla de éxito, avisos de publicación.

## Después
- Profundidad (leyenda de la Radiografía, gráficos con n, enlaces a PLANes, Mandato como embudo, Recibo con «qué sigue»), guía PDF regenerada, conteos de PLAN hardcodeados.
- Producción, con confirmación: aplicar migraciones, cuenta de Juan verificada en v2, `ADMIN_USERNAMES` en Vercel, correr la siembra con `--produccion`.

## Registro
- 2026-10-09 — Ola 1 mergeada; verificación completa sobre la rama integrada en verde (lint, type-check, unit web 1173, scripts 205, integración api 412 + db 210, build). Se agregó `hrefIngresar` en `lib/auth/volver.ts` como contrato común de la Ola 2.
- Ola 2 en curso: U4 campañas-web (55461), U5a entrada-cuenta (55462), U5b lectura — mapa, Radiografía, Mandato (55463), U5c fichas (55464). U8 móvil adelantada (sin base).
- Ola 2 mergeada (U4, U5a, U5b, U5c) + U8, U9 (lista de fichas con extracto, temas y afirmaciones) y U6a (glosario en textos legales, `VERSION_DE_CESION` = 2, grupos «Grupo A/B», PLANGEO sin «22»). Verificación completa en verde: unit web 1506, integración api 412 + db 210, build, planes:check.
- Ola 3: U7 diseño en curso (55467). Después: U6b guardia del glosario, registro en DEUDAS, capturas de control.
- Ola 3 mergeada: U7 diseño, U6b guardia, U10 remates, U11 deudas (D-105…D-121). Verificación final en verde: lint, type-check, unit (web 1552, civic-core 495, shared 170, db 65, api 37), scripts 244, integración api 414 + db 210, build, planes, entrenamientos, móvil tsc + 333 tests. Capturas de control en curso.
- Cierre: capturas de control (`h-revision-visual-despues.md`), U12 últimos arreglos (casillas en papel, recibo veraz, panel sin tope, contrastes de noche), buscadores en papel, deudas D-122…D-125. Verificación de cierre en verde: unit web 1600, integración api 414 + db 210, scripts 244, móvil 333, build, planes, entrenamientos.
- Pendiente de confirmación del dueño: mergear a `main` (despliega v2), migraciones 0025–0030 en producción, cuenta de Juan + `ADMIN_USERNAMES`, siembra de la nacional (D-121).
