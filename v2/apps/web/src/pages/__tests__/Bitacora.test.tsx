import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Bitacora } from '../Bitacora';

import {
  ANIOS,
  CRONICA_COUNT,
  DESDE,
  categoriaVisible,
  fechaLarga,
} from '~/pages/Bitacora/bitacora-data';

/**
 * Bitacora.test.tsx — índice papel 3.4. Ningún literal de contenido
 * derivado: los conteos y los datos de cada fila se computan desde
 * ANIOS/CRONICA_COUNT/DESDE, las mismas derivadas que consume el composer
 * (patrón de Biblioteca.test.tsx / IndiceEnsayos.test.tsx).
 */
describe('Bitacora (página papel 3.4 — el índice, composer)', () => {
  it('abre con el kicker, el H1 con rito de la tinta y el backlink a la biblioteca', () => {
    render(<Bitacora />);

    expect(
      screen.getByText(`La bitácora · ${String(CRONICA_COUNT)} crónicas · desde ${DESDE}`),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 1, name: 'Acá se escribe mientras pasa.' }),
    ).toBeInTheDocument();

    const backlink = screen.getByText('← La biblioteca');
    expect(backlink).toHaveAttribute('href', '/biblioteca');
  });

  it('el lead cierra con la línea de la spec y NO cuenta las crónicas', () => {
    render(<Bitacora />);

    const lead = screen.getByText(/Están en orden, pero se leen en cualquiera\.$/);
    expect(lead).toBeInTheDocument();
    // La bitácora se sigue escribiendo: el lead no puede afirmar un total.
    expect(lead.textContent).toMatch(/Crónicas enteras, sin registro y sin recorte\./);
    expect(lead.textContent).not.toMatch(/\d/);
  });

  it('un h2 por año con el conteo real, singular cuando corresponde', () => {
    render(<Bitacora />);

    for (const grupo of ANIOS) {
      const n = grupo.cronicas.length;
      const etiqueta = `${grupo.anio} · ${String(n)} crónica${n === 1 ? '' : 's'}`;
      expect(screen.getByRole('heading', { level: 2, name: etiqueta })).toBeInTheDocument();
    }
  });

  it('renderiza CRONICA_COUNT filas cerradas; la primera del primer año es 01 + su título, fecha y categoría', () => {
    render(<Bitacora />);

    const filas = screen.getAllByRole('button', { expanded: false });
    expect(filas).toHaveLength(CRONICA_COUNT);

    const primerAnio = ANIOS[0];
    const primeraCronica = primerAnio?.cronicas[0];
    expect(primeraCronica).toBeDefined();
    if (!primeraCronica) return;

    expect(filas[0]).toHaveTextContent('01');
    expect(filas[0]).toHaveTextContent(primeraCronica.title);
    expect(filas[0]).toHaveTextContent(fechaLarga(primeraCronica.publishedAt));
    if (primeraCronica.category !== '') {
      expect(filas[0]).toHaveTextContent(categoriaVisible(primeraCronica.category));
    }
  });

  it('apertura única global: abrir una fila muestra su summary y el link real; abrir una del último año cierra la anterior; retocarla la cierra', () => {
    render(<Bitacora />);

    const primerAnio = ANIOS[0];
    const ultimoAnio = ANIOS.at(-1);
    expect(primerAnio).toBeDefined();
    expect(ultimoAnio).toBeDefined();
    if (!primerAnio || !ultimoAnio) return;

    const primeraCronica = primerAnio.cronicas.find((p) => p.summary !== '');
    expect(primeraCronica).toBeDefined();
    if (!primeraCronica) return;

    const filaPrimera = screen.getByText(primeraCronica.title).closest('button');
    expect(filaPrimera).not.toBeNull();
    if (!filaPrimera) return;
    fireEvent.click(filaPrimera);

    expect(screen.getByText(`«${primeraCronica.summary}»`)).toBeInTheDocument();
    const minutos =
      primeraCronica.readingMinutes > 0 ? ` · ${String(primeraCronica.readingMinutes)} min` : '';
    const link = screen.getByRole('link', { name: `Leer la crónica${minutos} →` });
    expect(link).toHaveAttribute('href', `/bitacora/${primeraCronica.slug}`);
    expect(screen.getAllByRole('button', { expanded: true })).toHaveLength(1);

    const ultimaCronica = ultimoAnio.cronicas.at(-1);
    expect(ultimaCronica).toBeDefined();
    if (!ultimaCronica || ultimaCronica.slug === primeraCronica.slug) return;

    const filaUltima = screen.getByText(ultimaCronica.title).closest('button');
    expect(filaUltima).not.toBeNull();
    if (!filaUltima) return;
    fireEvent.click(filaUltima);

    expect(screen.queryByText(`«${primeraCronica.summary}»`)).not.toBeInTheDocument();
    expect(screen.getAllByRole('button', { expanded: true })).toHaveLength(1);

    fireEvent.click(filaUltima);
    expect(screen.queryAllByRole('button', { expanded: true })).toHaveLength(0);
  });

  it('cero cifras de post en cualquier superficie', () => {
    render(<Bitacora />);
    expect(screen.queryByText(/vistas|me gusta|comentarios|lecturas/i)).not.toBeInTheDocument();
  });

  it('cierra con la banda que manda al mapa', () => {
    render(<Bitacora />);

    expect(screen.getByRole('heading', { name: '¿Y vos qué ves?' })).toBeInTheDocument();
    const cta = screen.getByRole('link', { name: 'Soltar mi voz en el mapa →' });
    expect(cta).toHaveAttribute('href', '/el-mapa');
  });

  it('mata el chrome v1-port: sin glass/gradient-text/iris-violet/font-serif ni el header viejo', () => {
    const { container } = render(<Bitacora />);

    expect(screen.queryByText('Lo que vamos pensando juntos.')).not.toBeInTheDocument();
    expect(container.innerHTML).not.toMatch(/glass/);
    expect(container.innerHTML).not.toMatch(/gradient-text/);
    expect(container.innerHTML).not.toMatch(/iris-violet/);
    expect(container.innerHTML).not.toMatch(/font-serif/);
  });
});
