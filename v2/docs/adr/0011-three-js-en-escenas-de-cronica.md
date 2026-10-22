# ADR 0011 — `three` en las escenas de crónica

Estado: aceptada, 22/10/2026. Enmienda el ADR 0003, que sigue vigente para todo lo demás.

## Contexto

El ADR 0003 dejó `three` afuera de v2 hasta que un caso concreto lo pidiera, porque en v1
pagaba ~700 KB en pantallas donde solo decoraba.

La crónica «No ames tu trabajo: trabajá tu amor» argumenta con tres modelos que necesitan
volumen y movimiento para entenderse: 82.800 horas de una vida laboral como una grilla que
se levanta (82.800 puntos a 60 cuadros por segundo no los sostiene canvas 2D), la confianza
que cae en un vacío o atraviesa una red y vuelve, y una carrera adentro de una malla que se
rompe. El autor pidió explícitamente three.js. No es decoración: cada escena es la versión
visual de una cuenta o un mecanismo del texto, y el epígrafe la describe para quien no la ve.

## Decisión

Se admite `three` (solo el núcleo; ni `@react-three/*` ni `drei` ni addons) con estas reglas:

1. **Solo escenas de crónica.** Un MDX pide una escena con un hueco
   `<div data-escena="nombre"></div>`; `EscenasDeCronica` la monta con un portal. El registro
   (`components/escenas/registro.ts`) es la lista cerrada de escenas y no importa `three`.
2. **Cero bytes en el bundle de base.** Cada escena es un `lazy()`; `three` llega en un chunk
   propio y recién cuando el lector está a 600 px de una escena.
3. **Se apaga cuando no se mira.** El loop corre solo con la escena en pantalla y la pestaña
   visible. Al desmontar se liberan geometrías, materiales y el contexto WebGL.
4. **Siempre hay salida sin animación.** `prefers-reduced-motion` dibuja la escena quieta en su
   estado final; sin WebGL 2 queda un aviso; en la edición impresa queda el epígrafe.
5. **Una escena nueva es un archivo en el registro y una prueba de su modelo.** Las cuentas
   viven en módulos puros (`*-modelo.ts`, `horas-geometria.ts`) que se prueban sin GPU, y
   `escenas.test.ts` impide publicar un MDX que pida una escena inexistente.

## Consecuencias

- Una dependencia de producción más (40 de 45).
- El chunk `three-*.js` (fijado en `manualChunks` de `vite.config.ts`) pesa 522 KB, 130 KB
  con gzip, medido el 22/10/2026 con three 0.186.1. Cada escena suma entre 2,5 y 4,3 KB gzip.
  Lo paga solo quien abre una crónica con escenas y llega hasta ellas; la entrada principal
  no lo referencia.
- Si otra página quiere 3D, este ADR no la cubre: vuelve a valer el ADR 0003.
