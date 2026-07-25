import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Router } from 'wouter';
import { memoryLocation } from 'wouter/memory-location';

import { EntrenamientoDetail } from '../EntrenamientoDetail';

import { CURSOS } from '~/lib/courses-registry';
import {
  GRUPOS,
  duracionLarga,
  numeroDeFila,
  rotuloNivel,
  ubicarCurso,
} from '~/pages/Entrenamientos/entrenamientos-data';

/** Monta `EntrenamientoDetail` con la ubicación de wouter fijada al path dado. */
function renderAt(path: string) {
  const { hook } = memoryLocation({ path, static: true });
  return render(
    <Router hook={hook}>
      <EntrenamientoDetail />
    </Router>,
  );
}

function linkPorHref(scope: HTMLElement, href: string): HTMLElement {
  const el = scope.querySelector(`a[href="${href}"]`);
  if (!el) throw new Error(`no se encontró un link a ${href} dentro del scope`);
  return el as HTMLElement;
}

const primerCurso = CURSOS[0];
if (!primerCurso) throw new Error('CURSOS vacío — fixture inválida');

// «El último» es el último de la cadena AGRUPADA del catálogo (patrón exacto de
// entrenamientos-data.test.ts), no CURSOS.at(-1): las categorías no son contiguas
// en el orderIndex global, así que el curso de mayor orderIndex puede caer en un
// grupo que no es el último.
const ordenDeCatalogo = GRUPOS.flatMap((g) => g.cursos);
const ultimoCurso = ordenDeCatalogo.at(-1);
if (!ultimoCurso) throw new Error('cadena de catálogo vacía — fixture inválida');

const grupoConMedio = GRUPOS.find((g) => g.cursos.length >= 3);
if (!grupoConMedio) throw new Error('ningún grupo con 3+ cursos — fixture inválida');
const medioIndex = Math.floor((grupoConMedio.cursos.length - 1) / 2);
const cursoDelMedio = grupoConMedio.cursos[medioIndex];
if (!cursoDelMedio || medioIndex === 0 || medioIndex === grupoConMedio.cursos.length - 1) {
  throw new Error('el curso del medio no cae realmente en el medio — fixture inválida');
}

// El último curso de un grupo que no es el último de todo: su «siguiente» cruza
// de grupo por construcción (ubicarCurso, verificado en entrenamientos-data.test.ts).
const primerGrupo = GRUPOS[0];
const siguienteGrupo = GRUPOS[1];
if (!primerGrupo || !siguienteGrupo) throw new Error('menos de dos grupos — fixture inválida');
const ultimoDelPrimerGrupo = primerGrupo.cursos.at(-1);
if (!ultimoDelPrimerGrupo) throw new Error('primer grupo vacío — fixture inválida');

describe('EntrenamientoDetail (página papel 3.5 — la portada del entrenamiento)', () => {
  it.each([
    ['CURSOS[0]', primerCurso],
    ['el último de la cadena', ultimoCurso],
    ['un curso del medio de un grupo', cursoDelMedio],
  ])('%s: kicker, H1 con aria-label real y lead con la description real', (_nombre, curso) => {
    renderAt(`/entrenamientos/${curso.slug}`);

    expect(
      screen.getByText(`Entrenamiento · ${rotuloNivel(curso.level)} · ${duracionLarga(curso.duration)}`),
    ).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: curso.title })).toBeInTheDocument();
    expect(screen.getByText(curso.description)).toBeInTheDocument();
  });

  it('backlink a /entrenamientos', () => {
    renderAt(`/entrenamientos/${primerCurso.slug}`);

    const backlink = screen.getByRole('link', { name: '← Todos los entrenamientos' });
    expect(backlink).toHaveAttribute('href', '/entrenamientos');
  });

  it('cuadro de lecciones: encabezado, una fila por lección, primera y última con su ruta y datos reales', () => {
    renderAt(`/entrenamientos/${primerCurso.slug}`);

    const encabezado = screen.getByText('Lecciones').closest('div');
    expect(encabezado).not.toBeNull();
    const cuadroLecciones = encabezado?.parentElement ?? null;
    expect(cuadroLecciones).not.toBeNull();
    if (!cuadroLecciones) return;
    expect(within(cuadroLecciones).getByText('gratis · a tu ritmo')).toBeInTheDocument();

    const filas = within(cuadroLecciones).getAllByRole('link');
    expect(filas).toHaveLength(primerCurso.lecciones.length);

    const primeraLeccion = primerCurso.lecciones[0];
    const ultimaLeccion = primerCurso.lecciones.at(-1);
    expect(primeraLeccion).toBeDefined();
    expect(ultimaLeccion).toBeDefined();
    if (!primeraLeccion || !ultimaLeccion) return;

    const total = primerCurso.lecciones.length;
    const primeraFila = filas[0];
    const ultimaFila = filas.at(-1);

    expect(primeraFila).toHaveAttribute('href', `/entrenamientos/${primerCurso.slug}/leccion/1`);
    expect(primeraFila).toHaveTextContent(numeroDeFila(0));
    expect(primeraFila).toHaveTextContent(primeraLeccion.titulo);
    expect(primeraFila).toHaveTextContent(`${String(primeraLeccion.minutos)} min`);

    expect(ultimaFila).toHaveAttribute('href', `/entrenamientos/${primerCurso.slug}/leccion/${String(total)}`);
    expect(ultimaFila).toHaveTextContent(numeroDeFila(total - 1));
    expect(ultimaFila).toHaveTextContent(ultimaLeccion.titulo);
    expect(ultimaFila).toHaveTextContent(`${String(ultimaLeccion.minutos)} min`);
  });

  it('cuadro de la práctica: copy exacto de la spec y link a la práctica del curso', () => {
    renderAt(`/entrenamientos/${primerCurso.slug}`);

    expect(screen.getByText('La práctica')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Preguntas sobre lo que acabás de leer. No las corrige nadie: te las corregís vos, con la explicación al lado. No se guarda nada.',
      ),
    ).toBeInTheDocument();
    const cta = screen.getByRole('link', { name: 'Hacer la práctica →' });
    expect(cta).toHaveAttribute('href', `/entrenamientos/${primerCurso.slug}/practica`);
  });

  it('cadena — CURSOS[0] no tiene eslabón anterior, solo el siguiente', () => {
    const ubicacion = ubicarCurso(primerCurso.slug);
    expect(ubicacion).not.toBeNull();
    if (!ubicacion?.siguiente) return;
    expect(ubicacion.anterior).toBeNull();

    const { container } = renderAt(`/entrenamientos/${primerCurso.slug}`);
    const nav = container.querySelector('nav');
    expect(nav).not.toBeNull();
    if (!nav) return;

    expect(within(nav).getAllByRole('link')).toHaveLength(1);
    const link = linkPorHref(nav, `/entrenamientos/${ubicacion.siguiente.curso.slug}`);
    expect(link).toHaveTextContent(`${ubicacion.siguiente.curso.title} →`);
  });

  it('cadena — el último de la cadena agrupada no tiene eslabón siguiente, solo el anterior', () => {
    const ubicacion = ubicarCurso(ultimoCurso.slug);
    expect(ubicacion).not.toBeNull();
    if (!ubicacion?.anterior) return;
    expect(ubicacion.siguiente).toBeNull();

    const { container } = renderAt(`/entrenamientos/${ultimoCurso.slug}`);
    const nav = container.querySelector('nav');
    expect(nav).not.toBeNull();
    if (!nav) return;

    expect(within(nav).getAllByRole('link')).toHaveLength(1);
    const link = linkPorHref(nav, `/entrenamientos/${ubicacion.anterior.curso.slug}`);
    expect(link).toHaveTextContent(`← ${ubicacion.anterior.curso.title}`);
  });

  it('cruce de grupo: el último curso de un grupo intermedio avisa el rótulo del grupo destino en el eslabón siguiente', () => {
    const ubicacion = ubicarCurso(ultimoDelPrimerGrupo.slug);
    expect(ubicacion).not.toBeNull();
    if (!ubicacion?.siguiente) return;
    expect(ubicacion.siguiente.cruzaGrupo).toBe(true);

    const { container } = renderAt(`/entrenamientos/${ultimoDelPrimerGrupo.slug}`);
    const nav = container.querySelector('nav');
    expect(nav).not.toBeNull();
    if (!nav) return;

    const link = linkPorHref(nav, `/entrenamientos/${ubicacion.siguiente.curso.slug}`);
    expect(within(link).getByText(siguienteGrupo.rotulo)).toBeInTheDocument();
  });

  it('sin cruce: un curso del medio de un grupo no lleva línea de rótulo de grupo en ninguno de sus dos eslabones', () => {
    const ubicacion = ubicarCurso(cursoDelMedio.slug);
    expect(ubicacion).not.toBeNull();
    if (!ubicacion?.anterior || !ubicacion.siguiente) return;
    expect(ubicacion.anterior.cruzaGrupo).toBe(false);
    expect(ubicacion.siguiente.cruzaGrupo).toBe(false);

    const { container } = renderAt(`/entrenamientos/${cursoDelMedio.slug}`);
    const nav = container.querySelector('nav');
    expect(nav).not.toBeNull();
    if (!nav) return;

    expect(within(nav).queryByText(grupoConMedio.rotulo)).not.toBeInTheDocument();
  });

  it('404: slug inexistente muestra el expediente extraviado con CTA a /entrenamientos', () => {
    renderAt('/entrenamientos/no-existe-este-slug');

    expect(screen.getByText('expediente extraviado')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Ese entrenamiento no está.' })).toBeInTheDocument();
    expect(screen.getByText('Extraviado')).toBeInTheDocument();
    const cta = screen.getByRole('link', { name: 'Ver los entrenamientos →' });
    expect(cta).toHaveAttribute('href', '/entrenamientos');
  });

  it('honestidad: sin certificado/progreso/inscripción, sin %, sin conteo de preguntas, sin chrome v1-port', () => {
    const { container } = renderAt(`/entrenamientos/${primerCurso.slug}`);

    expect(screen.queryByText(/certificado|progreso|inscrib/i)).not.toBeInTheDocument();
    expect(container.innerHTML).not.toMatch(/%/);
    // El aviso de la práctica dice «Preguntas sobre lo que acabás de leer» (copy real de
    // la spec) — lo que no debe aparecer es un CONTEO: «10 preguntas», «n preguntas».
    expect(screen.queryByText(/\d+\s*preguntas/i)).not.toBeInTheDocument();
    expect(container.innerHTML).not.toMatch(/glass/);
    expect(container.innerHTML).not.toMatch(/gradient-text/);
    expect(container.innerHTML).not.toMatch(/iris-violet/);
    expect(container.innerHTML).not.toMatch(/font-serif/);
  });
});
