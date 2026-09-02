import { describe, expect, it } from 'vitest';

import { extraerEncabezados, renderMarkdown, separarNotasAlPie, slugDeEncabezado } from '../markdown';

describe('renderMarkdown — ids de encabezado', () => {
  it('cada encabezado sale con un id slug de su texto, sin acentos ni signos', () => {
    const html = renderMarkdown('## III. Diagnóstico — lo que más pesa\n\nTexto.\n');

    expect(html).toContain('<h2 id="iii-diagnostico-lo-que-mas-pesa">');
    expect(html).toContain('III. Diagnóstico — lo que más pesa</h2>');
  });

  it('dos encabezados iguales no comparten id: el segundo lleva sufijo', () => {
    const html = renderMarkdown('## Modelo financiero\n\na\n\n### Detalle\n\nb\n\n## Modelo financiero\n');

    expect(html).toContain('id="modelo-financiero"');
    expect(html).toContain('id="modelo-financiero-2"');
    expect(html).toContain('<h3 id="detalle">');
  });

  it('el slug ignora énfasis, código y links del texto del encabezado', () => {
    expect(slugDeEncabezado('**I.** El `stack` de [capacidades](x)')).toBe('i-el-stack-de-capacidades');
    expect(slugDeEncabezado('¡¿?!')).toBe('seccion');
  });
});

describe('extraerEncabezados', () => {
  it('devuelve los h2 con los MISMOS ids que renderMarkdown les pone, en texto plano', () => {
    const raw = '# Título\n\n## Uno **fuerte**\n\ntexto\n\n### No va\n\n## Uno fuerte\n';

    const secciones = extraerEncabezados(raw);

    expect(secciones).toEqual([
      { id: 'uno-fuerte', nivel: 2, texto: 'Uno fuerte' },
      { id: 'uno-fuerte-2', nivel: 2, texto: 'Uno fuerte' },
    ]);
    const html = renderMarkdown(raw);
    for (const s of secciones) expect(html).toContain(`id="${s.id}"`);
  });

  it('ignora el frontmatter y respeta el nivel pedido', () => {
    const raw = '---\ntitle: x\n---\n\n## Dos\n\n### Tres\n';

    expect(extraerEncabezados(raw, 3)).toEqual([{ id: 'tres', nivel: 3, texto: 'Tres' }]);
  });
});

describe('notas al pie (D-081)', () => {
  const raw = 'Se llama ¡BASTA![^1], y sigue[^fuente].\n\n[^1]: La nota con *énfasis*.\n[^fuente]: Otra nota.\n';

  it('separa las definiciones y numera las referencias por orden de aparición', () => {
    const { cuerpo, notas } = separarNotasAlPie(raw);

    expect(cuerpo).not.toContain('[^1]');
    expect(cuerpo).not.toContain('[^1]:');
    expect(cuerpo).toContain('<sup class="nota-ref" id="ref-nota-1"><a href="#nota-1">1</a></sup>');
    expect(cuerpo).toContain('<sup class="nota-ref" id="ref-nota-2"><a href="#nota-2">2</a></sup>');
    expect(notas).toEqual([
      { n: 1, id: '1', texto: 'La nota con *énfasis*.' },
      { n: 2, id: 'fuente', texto: 'Otra nota.' },
    ]);
  });

  it('renderiza las notas al final con markdown inline y vuelta al texto', () => {
    const html = renderMarkdown(raw);

    expect(html).not.toContain('[^');
    expect(html).toContain('<section class="notas-al-pie" aria-label="Notas">');
    expect(html).toContain('<li id="nota-1">La nota con <em>énfasis</em>. <a href="#ref-nota-1"');
    expect(html).toContain('<li id="nota-2">Otra nota.');
  });

  it('una referencia sin definición queda como estaba: el error se ve', () => {
    const html = renderMarkdown('Algo[^huerfana] y nada más.\n');

    expect(html).toContain('[^huerfana]');
    expect(html).not.toContain('notas-al-pie');
  });
});
