import { render, screen, waitFor, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Router } from 'wouter';
import { memoryLocation } from 'wouter/memory-location';

import { LeccionDetail, sinTituloDuplicado } from '../LeccionDetail';

import type { CursoEntry, LeccionEntry } from '~/lib/courses-registry';

import { CURSOS, cargarLeccion } from '~/lib/courses-registry';
import { fechaLarga } from '~/pages/Biblioteca/biblioteca-data';
import { ubicarLeccion } from '~/pages/Entrenamientos/entrenamientos-data';

/**
 * LeccionDetail.test.tsx — página papel 3.5, el lector de lección. Cero
 * slugs hardcodeados: las fixtures se eligen por posición derivada de
 * CURSOS/ubicarLeccion (patrón exacto de EnsayoDetail.test.tsx), más una
 * fixture explícita —la lección con `# H1` duplicado— encontrada
 * recorriendo el registry y cargando cuerpos, nunca por slug fijo.
 */

function renderAt(path: string) {
  const { hook } = memoryLocation({ path, static: true });
  return render(
    <Router hook={hook}>
      <LeccionDetail />
    </Router>,
  );
}

function linkPorHref(scope: HTMLElement, href: string): HTMLElement {
  const el = scope.querySelector(`a[href="${href}"]`);
  if (!el) throw new Error(`no se encontró un link a ${href} dentro del scope`);
  return el as HTMLElement;
}

/** Espera a que el cuerpo asincrónico termine de cargar (fase 'listo' o 'error'). */
async function esperarCargaCompleta() {
  await waitFor(() => {
    expect(screen.queryByText('Cargando — menos que un trámite.')).not.toBeInTheDocument();
  });
}

/** El primer heading nivel 2 real del cuerpo — el patrón de una lección "normal". */
function primerH2(body: string): string {
  const m = /^##\s+(.+)$/m.exec(body);
  if (!m?.[1]) throw new Error('el cuerpo no abre con un heading nivel 2 — fixture inválida');
  return m[1].trim();
}

interface FixtureLeccion {
  curso: CursoEntry;
  leccion: LeccionEntry;
  posicion: number;
}

/**
 * Recorre el registry cargando cuerpos hasta encontrar una lección cuyo
 * cuerpo abre con `# {title}` idéntico al frontmatter (Decisión 8, spec).
 * No hardcodea el curso ni el slug: usa `sinTituloDuplicado` —la misma
 * función que usa la página— para decidir si el cuerpo cambia al pasarla.
 */
async function buscarLeccionConH1Duplicado(): Promise<FixtureLeccion> {
  for (const curso of CURSOS) {
    for (const [i, leccion] of curso.lecciones.entries()) {
      // Búsqueda secuencial de una fixture, no un hot path — await en el loop es intencional.
      const cuerpo = await cargarLeccion(curso.slug, leccion.slug);
      if (cuerpo !== null && sinTituloDuplicado(cuerpo, leccion.titulo) !== cuerpo) {
        return { curso, leccion, posicion: i + 1 };
      }
    }
  }
  throw new Error('ninguna lección con H1 duplicado — fixture inválida (verificado 2026-07-24: hay 10)');
}

const primerCurso = CURSOS[0];
if (!primerCurso) throw new Error('CURSOS vacío — fixture inválida');
const primeraLeccionDelPrimerCurso = primerCurso.lecciones[0];
if (!primeraLeccionDelPrimerCurso) throw new Error('primer curso sin lecciones — fixture inválida');
const ultimaPosicionDelPrimerCurso = primerCurso.lecciones.length;

const cursoMedio = CURSOS.find((c) => c.lecciones.length >= 3);
if (!cursoMedio) throw new Error('ningún curso con 3+ lecciones — fixture inválida');
const posicionMedio = Math.floor(cursoMedio.lecciones.length / 2) + 1;
if (posicionMedio <= 1 || posicionMedio >= cursoMedio.lecciones.length) {
  throw new Error('la posición del medio no cae realmente en el medio — fixture inválida');
}
const leccionMedio = cursoMedio.lecciones[posicionMedio - 1];
if (!leccionMedio) throw new Error('lección del medio no encontrada — fixture inválida');

describe('LeccionDetail (página papel 3.5 — el lector de lección)', () => {
  it('cabecera: kicker derivado y H1 con aria-label real', () => {
    renderAt(`/entrenamientos/${cursoMedio.slug}/leccion/${String(posicionMedio)}`);

    expect(
      screen.getByText(
        `Lección ${String(posicionMedio)} de ${String(cursoMedio.lecciones.length)} · ${String(leccionMedio.minutos)} min`,
      ),
    ).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: leccionMedio.titulo })).toBeInTheDocument();
  });

  it('backlink al entrenamiento', () => {
    renderAt(`/entrenamientos/${cursoMedio.slug}/leccion/${String(posicionMedio)}`);

    const backlink = screen.getByRole('link', { name: `← ${cursoMedio.title}` });
    expect(backlink).toHaveAttribute('href', `/entrenamientos/${cursoMedio.slug}`);
  });

  it('cuerpo: tras cargar, un fragmento real del cuerpo aparece en el DOM', async () => {
    const cuerpo = await cargarLeccion(primerCurso.slug, primeraLeccionDelPrimerCurso.slug);
    expect(cuerpo).not.toBeNull();
    if (cuerpo === null) return;
    const fragmento = primerH2(cuerpo);

    renderAt(`/entrenamientos/${primerCurso.slug}/leccion/1`);

    expect(await screen.findByRole('heading', { level: 2, name: fragmento })).toBeInTheDocument();
  });

  it('deduplicación de H1: la lección cuyo cuerpo abre con # {title} muestra un solo heading nivel 1 y el título una sola vez', async () => {
    const { curso, leccion, posicion } = await buscarLeccionConH1Duplicado();

    const { container } = renderAt(`/entrenamientos/${curso.slug}/leccion/${String(posicion)}`);
    await esperarCargaCompleta();

    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    // getByText no sirve acá: el H1 del rito de la tinta fragmenta el título en
    // spans letra por letra, así que se cuenta la aparición literal sobre el
    // texto concatenado del documento (1 = solo el H1; 2 = el cuerpo lo repitió).
    const apariciones = container.textContent.split(leccion.titulo).length - 1;
    expect(apariciones).toBe(1);
  });

  it('lección normal: el cuerpo se renderiza completo desde su primer ##, sin tocar el resto', async () => {
    const cuerpo = await cargarLeccion(primerCurso.slug, primeraLeccionDelPrimerCurso.slug);
    expect(cuerpo).not.toBeNull();
    if (cuerpo === null) return;
    expect(sinTituloDuplicado(cuerpo, primeraLeccionDelPrimerCurso.titulo)).toBe(cuerpo);

    renderAt(`/entrenamientos/${primerCurso.slug}/leccion/1`);
    await esperarCargaCompleta();

    expect(screen.getByRole('heading', { level: 2, name: primerH2(cuerpo) })).toBeInTheDocument();
    // Un solo heading nivel 1 en toda la página — el de la cabecera, no uno del cuerpo.
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
  });

  it('cadena — la primera lección del curso no tiene eslabón anterior', () => {
    const { container } = renderAt(`/entrenamientos/${primerCurso.slug}/leccion/1`);
    const nav = container.querySelector('nav');
    expect(nav).not.toBeNull();
    if (!nav) return;

    expect(nav.textContent).not.toContain('←');
    if (ultimaPosicionDelPrimerCurso > 1) {
      const siguiente = primerCurso.lecciones[1];
      expect(siguiente).toBeDefined();
      if (!siguiente) return;
      const link = linkPorHref(nav, `/entrenamientos/${primerCurso.slug}/leccion/2`);
      expect(link).toHaveTextContent(`${siguiente.titulo} →`);
    }
  });

  it('cadena — una lección del medio tiene ambos eslabones con los títulos reales de sus vecinas', () => {
    const ubicacion = ubicarLeccion(cursoMedio.slug, posicionMedio);
    expect(ubicacion).not.toBeNull();
    if (!ubicacion?.anterior || !ubicacion.siguiente) return;

    const { container } = renderAt(`/entrenamientos/${cursoMedio.slug}/leccion/${String(posicionMedio)}`);
    const nav = container.querySelector('nav');
    expect(nav).not.toBeNull();
    if (!nav) return;

    const linkAnterior = linkPorHref(
      nav,
      `/entrenamientos/${cursoMedio.slug}/leccion/${String(ubicacion.anterior.posicion)}`,
    );
    expect(linkAnterior).toHaveTextContent(`← ${ubicacion.anterior.leccion.titulo}`);

    const linkSiguiente = linkPorHref(
      nav,
      `/entrenamientos/${cursoMedio.slug}/leccion/${String(ubicacion.siguiente.posicion)}`,
    );
    expect(linkSiguiente).toHaveTextContent(`${ubicacion.siguiente.leccion.titulo} →`);
  });

  it('cadena — la última lección del curso apunta a la práctica y no a otra lección', () => {
    const ubicacion = ubicarLeccion(primerCurso.slug, ultimaPosicionDelPrimerCurso);
    expect(ubicacion).not.toBeNull();
    if (!ubicacion) return;
    expect(ubicacion.siguiente).toBeNull();

    const { container } = renderAt(
      `/entrenamientos/${primerCurso.slug}/leccion/${String(ultimaPosicionDelPrimerCurso)}`,
    );
    const nav = container.querySelector('nav');
    expect(nav).not.toBeNull();
    if (!nav) return;

    const linkPractica = linkPorHref(nav, `/entrenamientos/${primerCurso.slug}/practica`);
    expect(linkPractica).toHaveTextContent('La práctica →');

    // El único link que apunta "hacia adelante" en el nav es el de la práctica —
    // ninguna otra flecha derecha compite con ella.
    const linksHaciaAdelante = within(nav)
      .getAllByRole('link')
      .filter((l) => /→$/.exec(l.textContent));
    expect(linksHaciaAdelante).toHaveLength(1);
    expect(linksHaciaAdelante[0]).toBe(linkPractica);
  });

  it('estados — mientras carga muestra el microcopy de carga', () => {
    renderAt(`/entrenamientos/${cursoMedio.slug}/leccion/${String(posicionMedio)}`);

    expect(screen.getByText('Cargando — menos que un trámite.')).toBeInTheDocument();
  });

  it('edición impresa: article con edicion-impresa, folio con clases print, backlink/cadena con print:hidden, H1 con guarda de impresión', async () => {
    const { container } = renderAt(`/entrenamientos/${cursoMedio.slug}/leccion/${String(posicionMedio)}`);
    await esperarCargaCompleta();

    const article = container.querySelector('article');
    expect(article).not.toBeNull();
    expect(article).toHaveClass('edicion-impresa');

    const fecha = fechaLarga(new Date().toISOString());
    const folio = screen.getByText(new RegExp(`¡BASTA! · edición del lector · ${fecha}`));
    expect(folio).toHaveClass('hidden');
    expect(folio).toHaveClass('print:block');

    const backlink = screen.getByRole('link', { name: `← ${cursoMedio.title}` });
    expect(backlink).toHaveClass('print:hidden');

    const nav = container.querySelector('nav');
    expect(nav).not.toBeNull();
    expect(nav).toHaveClass('print:hidden');

    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1).toHaveClass('print:[&_span]:animate-none');
  });

  it.each([
    ['posición 0', `/entrenamientos/${primerCurso.slug}/leccion/0`],
    [
      'posición fuera de rango',
      `/entrenamientos/${primerCurso.slug}/leccion/${String(ultimaPosicionDelPrimerCurso + 1)}`,
    ],
    ['posición no numérica', `/entrenamientos/${primerCurso.slug}/leccion/abc`],
    ['slug de curso inexistente', '/entrenamientos/no-existe-este-slug/leccion/1'],
  ])('404 (%s): expediente extraviado con CTA a /entrenamientos', (_nombre, path) => {
    renderAt(path);

    expect(screen.getByText('expediente extraviado')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Esa lección no está.' })).toBeInTheDocument();
    expect(screen.getByText('Extraviado')).toBeInTheDocument();
    const cta = screen.getByRole('link', { name: 'Ver los entrenamientos →' });
    expect(cta).toHaveAttribute('href', '/entrenamientos');
  });

  it('honestidad: sin firma de autor, sin CTA al mapa, sin % en el chrome de la página', async () => {
    const { container } = renderAt(`/entrenamientos/${cursoMedio.slug}/leccion/${String(posicionMedio)}`);
    await esperarCargaCompleta();

    expect(screen.queryByText('— El hombre gris')).not.toBeInTheDocument();
    expect(container.querySelector('a[href="/el-mapa"]')).toBeNull();

    // El "%" se controla en el CHROME (kicker + cadena), no en el cuerpo:
    // el cuerpo es contenido verbatim del autor y puede legítimamente traer
    // un porcentaje en su prosa (spec, Decisión 18 — los cuerpos son intocables).
    const kicker = screen.getByText(/^Lección /);
    expect(kicker.textContent).not.toMatch(/%/);
    const nav = container.querySelector('nav');
    expect(nav?.textContent ?? '').not.toMatch(/%/);
  });
});
