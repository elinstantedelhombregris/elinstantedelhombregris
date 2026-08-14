import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Entrenamientos } from '../Entrenamientos';

import { CURSO_COUNT, LECCION_COUNT } from '~/lib/courses-registry';
import {
  GRUPOS,
  duracionLarga,
  numeroDeFila,
  rotuloNivel,
} from '~/pages/Entrenamientos/entrenamientos-data';

/**
 * Entrenamientos.test.tsx — catálogo papel 3.5, composer. Ningún literal de
 * contenido derivado: los conteos y los datos de cada fila se computan desde
 * GRUPOS/CURSO_COUNT/LECCION_COUNT, las mismas derivadas que consume el
 * composer (patrón de Bitacora.test.tsx / Biblioteca.test.tsx).
 */
describe('Entrenamientos (página papel 3.5 — el catálogo, composer)', () => {
  it('abre con el kicker, el H1 con rito de la tinta y el lead con los conteos derivados', () => {
    render(<Entrenamientos />);

    expect(screen.getByText('Entrenamientos · sin cuenta, sin costo')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 1, name: 'Entrená la mirada.' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        new RegExp(`${String(CURSO_COUNT)} entrenamientos, ${String(LECCION_COUNT)} lecciones`),
      ),
    ).toBeInTheDocument();
    expect(screen.getByText(/^No mandamos tu recorrido a ningún servidor/)).toBeInTheDocument();
  });

  it('encabezado del índice y un h3 por grupo con el conteo real de ese grupo', () => {
    render(<Entrenamientos />);

    expect(screen.getByText('El catálogo entero · tocá para abrir')).toBeInTheDocument();

    for (const grupo of GRUPOS) {
      const heading = screen.getByRole('heading', { level: 3, name: grupo.rotulo });
      const wrapper = heading.closest('div');
      expect(wrapper).not.toBeNull();
      if (!wrapper) continue;
      expect(
        within(wrapper).getByText(
          `${String(grupo.cursos.length)} entrenamientos · ${String(grupo.lecciones)} lecciones`,
        ),
      ).toBeInTheDocument();
    }
  });

  it('renderiza CURSO_COUNT filas cerradas; la primera del primer grupo es 01 + su título + su marca de nivel', () => {
    render(<Entrenamientos />);

    const filas = screen.getAllByRole('button', { expanded: false });
    expect(filas).toHaveLength(CURSO_COUNT);

    const primerGrupo = GRUPOS[0];
    const primerCurso = primerGrupo?.cursos[0];
    expect(primerCurso).toBeDefined();
    if (!primerCurso) return;

    expect(filas[0]).toHaveTextContent(numeroDeFila(0));
    expect(filas[0]).toHaveTextContent(primerCurso.title);
    expect(filas[0]).toHaveTextContent(rotuloNivel(primerCurso.level));
  });

  it('apertura única global: abrir una fila del primer grupo muestra su excerpt y el link real; abrir una del último grupo cierra la anterior; retocarla la cierra', () => {
    render(<Entrenamientos />);

    const primerGrupo = GRUPOS[0];
    const ultimoGrupo = GRUPOS.at(-1);
    expect(primerGrupo).toBeDefined();
    expect(ultimoGrupo).toBeDefined();
    if (!primerGrupo || !ultimoGrupo) return;

    const primerCurso = primerGrupo.cursos[0];
    expect(primerCurso).toBeDefined();
    if (!primerCurso) return;

    const filaPrimera = screen.getByText(primerCurso.title).closest('button');
    expect(filaPrimera).not.toBeNull();
    if (!filaPrimera) return;
    fireEvent.click(filaPrimera);

    expect(screen.getByText(`«${primerCurso.excerpt}»`)).toBeInTheDocument();
    const entrega = screen.getByText(
      (_texto, elemento) =>
        elemento !== null &&
        elemento.tagName === 'P' &&
        elemento.textContent.includes(primerCurso.productoFinal ?? ''),
    );
    expect(entrega).toBeInTheDocument();
    expect(entrega.closest('div')?.parentElement?.querySelector('img')).toHaveAttribute(
      'src',
      primerCurso.coverImage,
    );
    const link = screen.getByRole('link', {
      name: `Abrir el entrenamiento · ${String(primerCurso.lecciones.length)} lecciones · ${duracionLarga(primerCurso.duration)} →`,
    });
    expect(link).toHaveAttribute('href', `/entrenamientos/${primerCurso.slug}`);
    expect(screen.getAllByRole('button', { expanded: true })).toHaveLength(1);

    const ultimoCurso = ultimoGrupo.cursos.at(-1);
    expect(ultimoCurso).toBeDefined();
    if (!ultimoCurso || ultimoCurso.slug === primerCurso.slug) return;

    const filaUltima = screen.getByText(ultimoCurso.title).closest('button');
    expect(filaUltima).not.toBeNull();
    if (!filaUltima) return;
    fireEvent.click(filaUltima);

    expect(screen.queryByText(`«${primerCurso.excerpt}»`)).not.toBeInTheDocument();
    expect(screen.getAllByRole('button', { expanded: true })).toHaveLength(1);

    fireEvent.click(filaUltima);
    expect(screen.queryAllByRole('button', { expanded: true })).toHaveLength(0);
  });

  it('cierra con la banda que manda al mapa', () => {
    render(<Entrenamientos />);

    expect(screen.getByRole('heading', { name: 'Entrenaste. Ahora usalo.' })).toBeInTheDocument();
    const cta = screen.getByRole('link', { name: 'Soltar mi voz en el mapa →' });
    expect(cta).toHaveAttribute('href', '/el-mapa');
  });

  it('honestidad: sin certificado/progreso/inscripción, sin datos de demostración, sin chrome v1-port', () => {
    const { container } = render(<Entrenamientos />);

    expect(screen.queryByText(/certificado|progreso|inscrib/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/datos de demostración/i)).not.toBeInTheDocument();
    expect(container.innerHTML).not.toMatch(/glass/);
    expect(container.innerHTML).not.toMatch(/gradient-text/);
    expect(container.innerHTML).not.toMatch(/iris-violet/);
    expect(container.innerHTML).not.toMatch(/font-serif/);
  });
});
