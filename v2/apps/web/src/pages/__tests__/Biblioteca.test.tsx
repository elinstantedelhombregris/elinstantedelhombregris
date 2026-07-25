import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Biblioteca } from '../Biblioteca';

import { SECCIONES_BIBLIOTECA } from '~/components/papel/papel-nav';
import { CURSO_COUNT } from '~/lib/courses-registry';
import {
  CICLO_COUNT,
  CRONICA_COUNT,
  CURSOS_DESTACADOS,
  ENSAYO_COUNT,
  HREF_BITACORA,
  HREF_CRONICA_PAIS_QUE_VIENE,
  hrefCronica,
  ULTIMAS_CRONICAS,
} from '~/pages/Biblioteca/biblioteca-data';
import { rotuloNivel } from '~/pages/Entrenamientos/entrenamientos-data';

/**
 * Biblioteca.test.tsx — composer del hub papel 3.1. Ningún literal de
 * contenido derivado: los conteos se interpolan desde las mismas constantes
 * que consume el composer (patrón de Planes.test.tsx).
 */
describe('Biblioteca (página papel 3.1 — El hub, composer)', () => {
  it('abre con el kicker, el H1 con rito de la tinta y el lead con los conteos derivados', () => {
    render(<Biblioteca />);

    expect(screen.getByText('La biblioteca · leer también es hacer')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 1, name: 'Papel, tinta y método.' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(new RegExp(`${String(ENSAYO_COUNT)} ensayos en ${String(CICLO_COUNT)} ciclos`)),
    ).toBeInTheDocument();
    expect(screen.getByText(/Robate todo\.$/)).toBeInTheDocument();
  });

  it('destaca el manifiesto sin cifras, con link entero a /manifiesto', () => {
    render(<Biblioteca />);

    expect(screen.getByText('Documento fundacional')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'El manifiesto del hombre gris' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText('No es un programa: es un espejo. Si algo te resuena, ahí empieza.'),
    ).toBeInTheDocument();

    const link = screen.getByText('El manifiesto del hombre gris').closest('a');
    expect(link).toHaveAttribute('href', '/manifiesto');
    expect(link).toHaveTextContent('Leerlo entero →');

    expect(screen.queryByText(/seis partes|cinco minutos/i)).not.toBeInTheDocument();
  });

  it('presenta la bitácora real: últimas crónicas, categorías reales y link al total, sin asterisco de demo', () => {
    render(<Biblioteca />);

    expect(screen.getByText('Bitácora · lo que va pasando')).toBeInTheDocument();

    const verEntera = screen.getByRole('link', {
      name: `Ver la bitácora entera · ${String(CRONICA_COUNT)} crónicas →`,
    });
    expect(verEntera).toHaveAttribute('href', HREF_BITACORA);

    for (const post of ULTIMAS_CRONICAS) {
      const titulo = screen.getByText(post.title);
      const enlace = titulo.closest('a');
      expect(enlace).toHaveAttribute('href', hrefCronica(post.slug));
      if (enlace && post.category !== '') {
        expect(within(enlace).getByText(post.category)).toBeInTheDocument();
      }
    }

    expect(screen.queryByText(/datos de demostración/i)).not.toBeInTheDocument();
  });

  it('cierra con la banda que manda al mapa', () => {
    render(<Biblioteca />);

    expect(screen.getByRole('heading', { name: 'Leíste. Ahora decí.' })).toBeInTheDocument();
    const cta = screen.getByRole('link', { name: 'Soltar mi voz en el mapa →' });
    expect(cta).toHaveAttribute('href', '/el-mapa');
  });

  it('monta la vidriera de entrenamientos: curados reales, catálogo completo detrás', () => {
    render(<Biblioteca />);

    expect(screen.getByText('Entrenamiento · el ojo se educa')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Para diseñar un país, primero entrená la mirada.' }),
    ).toBeInTheDocument();

    for (const curso of CURSOS_DESTACADOS) {
      const titulo = screen.getByText(curso.title);
      const celda = titulo.closest('a');
      expect(celda).toHaveAttribute('href', `/entrenamientos/${curso.slug}`);
      if (!celda) continue;
      expect(within(celda).getByText(rotuloNivel(curso.level))).toBeInTheDocument();
      expect(within(celda).getByText(`${String(curso.duration)} min`)).toBeInTheDocument();
      expect(within(celda).getByText(curso.excerpt)).toBeInTheDocument();
      expect(
        within(celda).getByText(`${String(curso.lecciones.length)} lecciones · Empezar →`),
      ).toBeInTheDocument();
    }

    const verTodos = screen.getByRole('link', {
      name: `Ver los ${String(CURSO_COUNT)} entrenamientos →`,
    });
    expect(verTodos).toHaveAttribute('href', '/entrenamientos');

    expect(screen.getByText(/los entrenamientos/)).toBeInTheDocument();
  });

  it('abre la puerta a la crónica del país que viene, entre entrenamientos y bitácora (D9)', () => {
    const { container } = render(<Biblioteca />);

    const link = screen.getByText('La crónica del país que viene').closest('a');
    expect(link).toHaveAttribute('href', HREF_CRONICA_PAIS_QUE_VIENE);
    expect(link).toHaveTextContent('Ficción especulativa');
    expect(link).toHaveTextContent(
      'No es una predicción. Es un ejercicio para ver que otro camino es posible.',
    );
    expect(link).toHaveTextContent('Leer la crónica →');

    const encabezados = [...container.querySelectorAll('h2')].map((h) => h.textContent);
    const indiceEntrenamientos = encabezados.findIndex((t) => t.includes('Para diseñar un país,'));
    const indiceCronica = encabezados.findIndex((t) => t.includes('La crónica del país que viene'));
    const indiceBitacora = encabezados.findIndex((t) => t.includes('Bitácora · lo que va pasando'));

    expect(indiceEntrenamientos).toBeGreaterThanOrEqual(0);
    expect(indiceCronica).toBeGreaterThan(indiceEntrenamientos);
    expect(indiceCronica).toBeLessThan(indiceBitacora);
  });

  it('cada estante tiene su ancla: el menú del header promete anclas y el hub tiene que cumplirlas', () => {
    const { container } = render(<Biblioteca />);

    const anclasQuePrometeElMenu = SECCIONES_BIBLIOTECA.flatMap((seccion) => {
      const [, ancla] = seccion.href.split('#');
      return ancla === undefined ? [] : [ancla];
    });
    expect(anclasQuePrometeElMenu.length).toBeGreaterThan(0);
    for (const ancla of anclasQuePrometeElMenu) {
      expect(container.querySelector(`#${ancla}`)).not.toBeNull();
    }

    // Los cinco estantes son direccionables aunque el menú de hoy linkee a la
    // página propia de cuatro de ellos: mañana puede querer el ancla.
    for (const ancla of ['manifiesto', 'ensayos', 'entrenamientos', 'cronica', 'bitacora']) {
      const seccion = container.querySelector(`#${ancla}`);
      expect(seccion).not.toBeNull();
      // Sin esto el header sticky tapa el título del estante al saltar.
      expect(seccion?.className).toMatch(/scroll-mt-20/);
    }
  });

  it('la portada nombra los cinco estantes — incluida la crónica', () => {
    render(<Biblioteca />);

    const lead = screen.getByText(/Todo lo que el movimiento piensa está publicado entero/);
    expect(lead).toHaveTextContent('el manifiesto');
    expect(lead).toHaveTextContent(`${String(ENSAYO_COUNT)} ensayos en ${String(CICLO_COUNT)} ciclos`);
    expect(lead).toHaveTextContent('los entrenamientos');
    expect(lead).toHaveTextContent('la crónica del país que viene');
    expect(lead).toHaveTextContent('la bitácora');
  });

  it('mata el chrome v1-port: sin header serif viejo, sin glass/gradient-text/iris-violet/font-serif', () => {
    const { container } = render(<Biblioteca />);

    expect(screen.queryByText('Pensamiento de fondo.')).not.toBeInTheDocument();
    expect(container.innerHTML).not.toMatch(/glass/);
    expect(container.innerHTML).not.toMatch(/gradient-text/);
    expect(container.innerHTML).not.toMatch(/iris-violet/);
    expect(container.innerHTML).not.toMatch(/font-serif/);
  });
});
