# Los arreglos de la auditoría de diseño — plan

Spec: `docs/specs/2026-09-01-auditoria-diseno-arreglos.md`. Cada tarea: test primero, implementación, `pnpm test:unit` del archivo, commit con rutas explícitas (D-010).

- [x] 1. Tokens y contraste: `tinta-50` → `#6B665C` en `apps/web/tailwind.config.ts`, `docs/design-system/tokens.css` y README §2; banda gris de Inicio en tinta; `text-tinta-30` → `text-tinta-50` en texto con significado sobre papel.
- [x] 2. `BarraModos` con scroll horizontal propio (test en `pages/ElMapa/instrumento/__tests__/Chrome.test.tsx`).
- [x] 3. Sello EJEMPLO del mandato en línea bajo 560px (test en `DocumentoMandato.test.tsx`).
- [x] 4. `CifrasStrip` y `CapituloSinLider`: cero en palabras (tests existentes actualizados).
- [x] 5. `lib/markdown.ts`: ids de encabezado, `extraerEncabezados`, notas al pie (test nuevo `lib/__tests__/markdown.test.ts`).
- [x] 6. `components/papel/IndiceLector.tsx` + cableado en `PlanDetail` (tests nuevos + `PlanDetail.test.tsx`).
- [x] 7. Tipografía del formulario del mapa (`PanelSoltarVoz`, `PreguntaDeLaCasa`, `SelectorDeTipo`, `SelectorPrecision`, `CamposPorTipo`).
- [x] 8. `PlanesTeaser` kicker a dos líneas; `FilaIndiceExpandible` hover; `HeroBasta` CTAs bajo el párrafo.
- [x] 9. `lib/rito.ts` + `RootLayout` + `index.css` `.rito-visto` (test `lib/__tests__/rito.test.ts`).
- [x] 10. Verificación completa: `pnpm test:unit` (923 en verde; quedan las 4 fallas previas de `blog-registry` y D-077), `pnpm lint`, `pnpm exec tsc --noEmit`, `pnpm build`, recaptura Playwright a 390 y 1440.
- [x] 11. `docs/DEUDAS.md`: D-078..D-082 resueltas. Commit final.
