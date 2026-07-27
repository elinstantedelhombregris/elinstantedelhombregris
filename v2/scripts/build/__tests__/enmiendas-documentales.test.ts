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
