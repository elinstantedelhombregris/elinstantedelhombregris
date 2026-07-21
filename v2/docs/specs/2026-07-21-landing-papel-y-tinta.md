# Landing «Papel y Tinta» — port del diseño BASTA v2

**Fecha:** 2026-07-21
**Fuente de diseño:** proyecto Claude Design `4700ef68-ee79-4e8d-8c1f-3340e66be687`, archivo `BASTA v2.dc.html` (copia en `docs/design-system/BASTA-v2.dc.html`).
**Sistema de diseño:** `docs/design-system/README.md` («Papel y Tinta» v1.0) + `tokens.css`.

## Por qué

v2 arrancó con el tema oscuro heredado de v1 como placeholder. El rediseño «Papel y Tinta»
(manifiesto impreso: papel crudo, tinta, violeta accionable, sello rojo) es la identidad
definitiva del sitio. Se migra página por página; esta spec cubre la primera: la landing.

## Qué

1. **Tokens** en Tailwind (`papel/tinta/oscuro/violeta/sello/verde/ambar/cian`,
   fuentes `anton/archivo/space`) + keyframes canónicos en `index.css`.
2. **Chrome papel**: `PapelHeader` (wordmark + contador FOMO + nav mono + CTA «Sembrar tu voz»),
   `PapelFooter` (wordmark outline + recorrido + principios + CTA), `PaperGrain` (grano de papel),
   `DespertarVeil` (velo de saturación gris→color, `localStorage['basta_despierto']`).
3. **Home** reconstruida con las secciones del diseño: hero con rito de la tinta,
   ticker de voces, la idea en tres líneas, banda del hombre gris (tally marks),
   cifras, teaser de planes, banda CTA.
4. **RootLayout** enruta el chrome: las rutas ya rediseñadas (`PAPEL_ROUTES`, hoy solo `/`)
   reciben el chrome papel; el resto conserva Header/Footer viejos hasta que les toque.

## Decisiones

- **Datos demo con asterisco** (regla del sistema): voces 12.496, semillas 3.107, círculos 214
  quedan hardcodeados en `pages/Home/landing-data.ts` hasta que existan los endpoints reales.
  El footer dice «Prototipo con datos de demostración».
- **Planes reales, no demo**: el diseño inventó códigos (PLANISV, PLAN24CN…). El teaser y la
  cifra «22» salen de `PLAN_REGISTRY` (contenido MDX real, sin asterisco).
- **Rutas**: La idea → `/la-vision` · El mapa → `/el-mapa` · El mandato → `/mandato-vivo` ·
  La prueba → `/planes` · La biblioteca → `/ensayos` · Sembrar → `/la-semilla-de-basta` ·
  capítulo I → `/el-instante-del-hombre-gris` · círculos → `/comunidad`.
  Cuando se rediseñen esas páginas puede renombrarse la ruta (p. ej. `/la-idea`).
- **Sin auth en el header papel** (fidelidad al diseño). `/ingresar` sigue accesible directo
  y desde el chrome viejo. Se revisa cuando se rediseñe el flujo de cuenta.
- **Fuentes vía Google Fonts** (patrón ya existente en `index.html`). Self-hosting con
  `@fontsource` queda como follow-up de infra.
- **CSS keyframes, no framer-motion**, para el rito de la tinta y el marquee: son las
  animaciones canónicas del sistema y necesitan delays por letra. `prefers-reduced-motion`
  las apaga dejando estados finales.

## Definición de terminado (del sistema)

kicker + título + CTA presentes · una sola interacción firma (el rito de la tinta) ·
asteriscos en datos demo · responsive a 1 columna · voseo consistente · AA + focus violeta.

## Follow-ups

- Rediseñar el resto de las páginas (idea → mapa → mandato → prueba → biblioteca → sembrar).
- Endpoint real de conteo de voces para el contador FOMO.
- Self-host de fuentes (Anton/Archivo/Space Mono) vía @fontsource.
- Al completar la migración: borrar Header/Footer viejos y el tema oscuro de `index.css`.
