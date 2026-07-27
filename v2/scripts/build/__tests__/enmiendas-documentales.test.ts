import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const aqui = dirname(fileURLToPath(import.meta.url));
const raizV2 = join(aqui, '..', '..', '..');

function leer(ruta: string): string {
  return readFileSync(join(raizV2, ruta), 'utf8');
}

const LEY = 'docs/design-system/README.md';
const ARQUITECTURA = 'docs/architecture/README.md';
const MASTER = 'docs/plans/2026-07-21-papel-y-tinta-master-plan.md';

/**
 * B0 del sustrato: la documentación dejaba de coincidir con lo que ① implementa
 * en cuatro puntos que, sin guardia, ② reintroduce en la primera página que
 * construya (§11.3 es literalmente la Definición de terminado por página).
 */
describe('enmienda documental de ① (B0)', () => {
  it('la arquitectura ya no limita el SSG a blog/ensayos/courses', () => {
    const texto = leer(ARQUITECTURA);
    expect(texto).not.toContain('SSG only at build time for blog/ensayos/courses');
    expect(texto).toContain('2026-07-26-el-sustrato.md');
  });

  it('§3 de la ley ya no manda Google Fonts', () => {
    const texto = leer(LEY);
    expect(texto).not.toContain('## 3. Tipografía (Google Fonts)');
    expect(texto).toContain('## 3. Tipografía (auto-hospedada)');
    expect(texto).toContain('/fonts/');
  });

  it('la ley ancla la versión 1.2 a la enmienda de ①', () => {
    const texto = leer(LEY);
    expect(texto).not.toContain(
      'Versión 1.1 · julio 2026 · fuente de verdad para todas las páginas del sitio.',
    );
    expect(texto).toContain('Versión 1.2 · julio 2026');
    expect(texto).toContain(
      'Enmendado por `docs/specs/2026-07-26-el-sustrato.md` (①): §1, §3, §5, §7, §11.3 y §12.',
    );
  });

  it('§1 ya no hardcodea el color del tagline (fix de contraste AA)', () => {
    const texto = leer(LEY);
    expect(texto).not.toContain('(Space Mono 10px, uppercase, #7A756A)');
    expect(texto).toContain(
      'El número aparece **sólo cuando hay algo que contar**',
    );
    expect(texto).toContain('Nunca una constante escrita a mano.');
  });

  it('§1 ya no lista como "gráficos" permitidos glifos que las fuentes no traen', () => {
    const texto = leer(LEY);
    expect(texto).not.toContain('flechas tipográficas (→ ↗ ↺ ▌).');
    expect(texto).toContain(
      '**no** son glifos: ninguna de las seis familias los trae',
    );
    expect(texto).toContain('components/papel/primitives/Glifos.tsx');
  });

  it('§5 reemplaza los seis glifos inline por los componentes <Glifo*/> del catálogo', () => {
    const texto = leer(LEY);
    // Cargando (botón)
    expect(texto).not.toContain('texto reemplazado por «— ▌» con blink-cursor');
    expect(texto).toContain('«— » + `<GlifoCursor />` con blink-cursor');
    // Select
    expect(texto).not.toContain('flecha ▾ tipográfica.');
    expect(texto).toContain('`<GlifoDespliegue />` a la derecha.');
    // Búsqueda
    expect(texto).not.toContain('y cursor ▌; resultados en filas de índice.');
    expect(texto).toContain('«buscar:» y `<GlifoCursor />`;');
    // Tabla — orden asc/desc
    expect(texto).not.toContain('orden con ▲▼ tipográficos,');
    expect(texto).toContain('orden con `<GlifoOrdenAsc />`/`<GlifoOrdenDesc />`,');
    // Modal (cierre arriba a la derecha)
    expect(texto).not.toContain('cierre «✕» tipográfico arriba a la derecha.');
    expect(texto).toContain('cierre «×» (U+00D7) arriba a la derecha.');
    // Popover de mapa (cierre + Escape + foco)
    expect(texto).not.toContain('Cierre «✕» tipográfico + Escape');
    expect(texto).toContain('Cierre «×» (U+00D7) + Escape');
  });

  it('§12 lista sólo los glifos que las seis familias traen', () => {
    const texto = leer(LEY);
    expect(texto).toContain('→ ← ↑ ↓ – — × − + · « » ¡ !');
    expect(texto).not.toContain('Solo glifos tipográficos → ↗ ↺ ▌ ▾ ¡ !');
  });

  it('ni §5, ni §7, ni §11.3 siguen mandando asterisco sobre datos inventados', () => {
    const texto = leer(LEY);
    expect(texto).not.toContain('todo dato inventado lleva asterisco');
    expect(texto).not.toContain('asteriscos en datos demo');
    // §5 es la tercera pata, y la que ② lee para construir cada página: sin estos
    // dos asserts el mandato del asterisco sobrevive intacto en la sección del kit
    // y el resto de la suite queda verde igual.
    expect(texto).not.toContain('obligatoria junto a toda métrica inventada');
    expect(texto).not.toContain('* datos de demostración');
  });

  it('la tarea 1.3 del master plan ya no pide el fallback con asterisco', () => {
    const texto = leer(MASTER);
    expect(texto).not.toContain('fallback to demo constant + asterisk');
    // Files quedaba enmendada pero Produces y Step 5 seguían pidiendo la misma
    // constante de respaldo que Files ya había retirado: sin estos asserts la
    // contradicción entre las tres líneas del mismo bloque puede volver.
    expect(texto).not.toContain('demo-constant fallback while loading/error');
    expect(texto).not.toContain(
      'keep `* datos de demostración` only for metrics still fake',
    );
    expect(texto).toContain(
      'con cero, cargando o error el slot dice «Falta la tuya.» a secas — sin constante de respaldo',
    );
    expect(texto).toContain(
      'wire header query (sin constante de respaldo: régimen «Falta la tuya.»',
    );
  });

  it('la tarea 8.1 del master plan cede a ① lo que ① entrega', () => {
    const texto = leer(MASTER);
    expect(texto).not.toContain(
      '**8.1 SEO/OG:** per-page titles/descriptions per §14, OG template card, favicon «¡», sitemap.xml, prerender of public routes.',
    );
    expect(texto).toContain('2026-07-26-el-sustrato.md');
  });

  it('D1–D4 están escritas en un ADR y no sólo en la spec', () => {
    const adr = leer('docs/adr/0007-sustrato-indexacion-y-host.md');

    for (const decision of ['D1 ·', 'D2 ·', 'D3 ·', 'D4 ·']) {
      expect(adr).toContain(decision);
    }
    expect(adr).toContain('elinstantedelhombregris.com');
    expect(adr).toContain('vercel.json');
  });
});
