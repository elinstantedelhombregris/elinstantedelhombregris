import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Router } from 'wouter';
import { memoryLocation } from 'wouter/memory-location';

import { PracticaDetail } from '../PracticaDetail';

import type { CursoEntry, PracticaEntry } from '~/lib/courses-registry';

import { CURSOS, cargarPractica } from '~/lib/courses-registry';

/**
 * PracticaDetail.test.tsx — página papel 3.5, la práctica. Cero slugs
 * hardcodeados: la fixture principal es el curso con MENOS preguntas
 * (verificado 2026-07-24: 10, hay varios empatados) para contestar todas
 * sin ruido — se encuentra cargando las 31 prácticas reales, nunca por
 * nombre fijo (patrón exacto de LeccionDetail.test.tsx /
 * EntrenamientoDetail.test.tsx).
 */

function renderAt(path: string) {
  const { hook } = memoryLocation({ path, static: true });
  return render(
    <Router hook={hook}>
      <PracticaDetail />
    </Router>,
  );
}

/** Espera a que el quiz asincrónico termine de cargar (fase 'listo' o 'error'). */
async function esperarCargaCompleta() {
  await waitFor(() => {
    expect(screen.queryByText('Cargando — menos que un trámite.')).not.toBeInTheDocument();
  });
}

interface FixtureCurso {
  curso: CursoEntry;
  practica: PracticaEntry;
}

/** Recorre las 31 prácticas reales y devuelve la de MENOS preguntas — nunca un slug fijo. */
async function buscarCursoConMenosPreguntas(): Promise<FixtureCurso> {
  let elegido: FixtureCurso | null = null;
  for (const curso of CURSOS) {
    // Búsqueda secuencial de una fixture, no un hot path — await en el loop es intencional.
    const practica = await cargarPractica(curso.slug);
    if (practica === null) continue;
    if (elegido === null || practica.preguntas.length < elegido.practica.preguntas.length) {
      elegido = { curso, practica };
    }
  }
  if (elegido === null) throw new Error('ninguna práctica cargó — fixture inválida');
  return elegido;
}

/** Un fieldset (por índice de pregunta) del documento renderizado. */
function fieldsetDe(indice: number): HTMLElement {
  const fieldsets = document.querySelectorAll('fieldset');
  const el = fieldsets[indice];
  if (!el) throw new Error(`no hay fieldset en el índice ${String(indice)}`);
  return el;
}

/** El <label> cuyo texto contiene la opción dada — evita chocar con el tilde decorativo. */
function labelDeOpcion(scope: HTMLElement, texto: string): HTMLElement {
  const labels = Array.from(scope.querySelectorAll('label'));
  const encontrada = labels.find((l) => l.textContent.includes(texto));
  if (!encontrada) throw new Error(`no se encontró la opción "${texto}"`);
  return encontrada;
}

describe('PracticaDetail (página papel 3.5 — la práctica)', () => {
  it('cabecera: kicker con el conteo real, H1 y lead con la description real del quiz', async () => {
    const { curso, practica } = await buscarCursoConMenosPreguntas();
    renderAt(`/entrenamientos/${curso.slug}/practica`);

    const n = practica.preguntas.length;
    expect(await screen.findByText(`Práctica · ${String(n)} preguntas`)).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: 'La práctica.' })).toBeInTheDocument();
    expect(screen.getByText(practica.descripcion)).toBeInTheDocument();
  });

  it('el aviso: copy exacto de la spec', async () => {
    const { curso } = await buscarCursoConMenosPreguntas();
    renderAt(`/entrenamientos/${curso.slug}/practica`);

    expect(
      await screen.findByText(
        'Esto no es un examen. No se puntúa, no se guarda y no da certificado: es para que veas qué te quedó y qué no.',
      ),
    ).toBeInTheDocument();
  });

  it('se renderiza un fieldset con legend "Pregunta {i} de {n}" por cada pregunta, con sus opciones como radios', async () => {
    const { curso, practica } = await buscarCursoConMenosPreguntas();
    renderAt(`/entrenamientos/${curso.slug}/practica`);
    await esperarCargaCompleta();

    const n = practica.preguntas.length;
    expect(document.querySelectorAll('fieldset')).toHaveLength(n);
    practica.preguntas.forEach((pregunta, i) => {
      expect(screen.getByText(`Pregunta ${String(i + 1)} de ${String(n)}`)).toBeInTheDocument();
      const radios = within(fieldsetDe(i)).getAllByRole('radio');
      expect(radios).toHaveLength(pregunta.opciones.length);
    });
  });

  it('true_false: muestra Verdadero/Falso aunque el archivo no traiga options', async () => {
    const { curso, practica } = await buscarCursoConMenosPreguntas();
    const indiceTF = practica.preguntas.findIndex(
      (p) => p.opciones.length === 2 && p.opciones[0] === 'Verdadero' && p.opciones[1] === 'Falso',
    );
    expect(indiceTF).toBeGreaterThanOrEqual(0);

    renderAt(`/entrenamientos/${curso.slug}/practica`);
    await esperarCargaCompleta();

    const fieldset = fieldsetDe(indiceTF);
    expect(within(fieldset).getByText('Verdadero')).toBeInTheDocument();
    expect(within(fieldset).getByText('Falso')).toBeInTheDocument();
  });

  it('corrección — acertar: "Esa era." + la explicación real + el fieldset queda disabled', async () => {
    const { curso, practica } = await buscarCursoConMenosPreguntas();
    renderAt(`/entrenamientos/${curso.slug}/practica`);
    await esperarCargaCompleta();

    const pregunta = practica.preguntas[0];
    if (!pregunta) throw new Error('práctica sin preguntas — fixture inválida');

    const fieldset = fieldsetDe(0);
    const radios = within(fieldset).getAllByRole('radio');
    const radioCorrecto = radios[pregunta.correcta];
    if (!radioCorrecto) throw new Error('índice correcto fuera de rango — fixture inválida');
    fireEvent.click(radioCorrecto);

    expect(await within(fieldset).findByText('Esa era.')).toBeInTheDocument();
    expect(within(fieldset).getByText(pregunta.explicacion)).toBeInTheDocument();
    expect(fieldset).toBeDisabled();
  });

  it('corrección — errar: "No era esa." + la explicación + la opción correcta marcada; un segundo click no cambia nada', async () => {
    const { curso, practica } = await buscarCursoConMenosPreguntas();
    // Una pregunta con al menos 2 opciones para poder elegir a propósito la incorrecta.
    const indice = practica.preguntas.findIndex((p) => p.opciones.length >= 2);
    const pregunta = practica.preguntas[indice];
    if (!pregunta) throw new Error('ninguna pregunta con 2+ opciones — fixture inválida');
    const incorrecta = pregunta.correcta === 0 ? 1 : 0;

    renderAt(`/entrenamientos/${curso.slug}/practica`);
    await esperarCargaCompleta();

    const fieldset = fieldsetDe(indice);
    const radios = within(fieldset).getAllByRole('radio');
    const radioIncorrecto = radios[incorrecta];
    const radioCorrecto = radios[pregunta.correcta];
    if (!radioIncorrecto || !radioCorrecto) throw new Error('índices fuera de rango — fixture inválida');

    fireEvent.click(radioIncorrecto);

    expect(await within(fieldset).findByText('No era esa.')).toBeInTheDocument();
    expect(within(fieldset).getByText(pregunta.explicacion)).toBeInTheDocument();
    const opcionCorrecta = pregunta.opciones[pregunta.correcta];
    if (!opcionCorrecta) throw new Error('opción correcta indefinida — fixture inválida');
    expect(labelDeOpcion(fieldset, opcionCorrecta)).toHaveClass('text-verde');
    expect(fieldset).toBeDisabled();

    // Segundo click en otra opción: no cambia nada — sigue elegida la primera.
    fireEvent.click(radioCorrecto);
    expect(radioIncorrecto).toBeChecked();
    expect(radioCorrecto).not.toBeChecked();

    // Cuál es cuál se dice con PALABRAS, no solo con color: en escala de
    // grises tenían que distinguirse igual, y el ✓ no está en el catálogo
    // cerrado de glifos de §12.
    expect(within(fieldset).getByText('tu respuesta')).toBeInTheDocument();
    expect(within(fieldset).getByText('la correcta')).toBeInTheDocument();
    expect(fieldset.textContent).not.toContain('✓');
  });

  it('resultado: ausente hasta contestar todas; luego "Resultado", el conteo real y los palitos aria-hidden', async () => {
    const { curso, practica } = await buscarCursoConMenosPreguntas();
    renderAt(`/entrenamientos/${curso.slug}/practica`);
    await esperarCargaCompleta();

    expect(screen.queryByText('Resultado')).not.toBeInTheDocument();

    practica.preguntas.forEach((pregunta, i) => {
      const radios = within(fieldsetDe(i)).getAllByRole('radio');
      const radio = radios[pregunta.correcta];
      if (!radio) throw new Error('índice correcto fuera de rango — fixture inválida');
      fireEvent.click(radio);
    });

    const n = practica.preguntas.length;
    expect(await screen.findByText('Resultado')).toBeInTheDocument();
    expect(screen.getByText(`${String(n)} de ${String(n)}`)).toBeInTheDocument();

    const contenedor = screen.getByText('Resultado').parentElement;
    if (!contenedor) throw new Error('el bloque de resultado no tiene contenedor');
    expect(contenedor.querySelector('[aria-hidden]')).not.toBeNull();

    // Honestidad del chrome que controlamos (kicker + aviso + resultado): el
    // cuerpo de las preguntas es contenido real del quiz.json y puede
    // legítimamente traer un «%» o la palabra «puntos» en su enunciado.
    const chrome =
      screen.getByText(`Práctica · ${String(n)} preguntas`).textContent +
      screen.getByText(
        'Esto no es un examen. No se puntúa, no se guarda y no da certificado: es para que veas qué te quedó y qué no.',
      ).textContent +
      contenedor.textContent;
    expect(chrome).not.toMatch(/%/);
    expect(chrome).not.toMatch(/aprobad[oa]|desaprobad[oa]|\bpuntos\b|\bminutos\b|\bintentos\b/i);
  });

  it('"Empezar de nuevo ↺" resetea todo sin recargar: ningún fieldset disabled, sin Resultado', async () => {
    const { curso, practica } = await buscarCursoConMenosPreguntas();
    renderAt(`/entrenamientos/${curso.slug}/practica`);
    await esperarCargaCompleta();

    practica.preguntas.forEach((pregunta, i) => {
      const radios = within(fieldsetDe(i)).getAllByRole('radio');
      const radio = radios[pregunta.correcta];
      if (!radio) throw new Error('índice correcto fuera de rango — fixture inválida');
      fireEvent.click(radio);
    });
    expect(await screen.findByText('Resultado')).toBeInTheDocument();
    document.querySelectorAll('fieldset').forEach((f) => {
      expect(f).toBeDisabled();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Empezar de nuevo ↺' }));

    expect(screen.queryByText('Resultado')).not.toBeInTheDocument();
    document.querySelectorAll('fieldset').forEach((f) => {
      expect(f).not.toBeDisabled();
    });
  });

  it('cierre: "Ya lo pensaste. Ahora decilo." + link "Soltar mi voz en el mapa →"', async () => {
    const { curso } = await buscarCursoConMenosPreguntas();
    renderAt(`/entrenamientos/${curso.slug}/practica`);

    expect(
      await screen.findByRole('heading', { level: 2, name: 'Ya lo pensaste. Ahora decilo.' }),
    ).toBeInTheDocument();
    const cta = screen.getByRole('link', { name: 'Soltar mi voz en el mapa →' });
    expect(cta).toHaveAttribute('href', '/el-mapa');
  });

  it('backlink al entrenamiento', async () => {
    const { curso } = await buscarCursoConMenosPreguntas();
    renderAt(`/entrenamientos/${curso.slug}/practica`);

    const backlink = screen.getByRole('link', { name: `← ${curso.title}` });
    expect(backlink).toHaveAttribute('href', `/entrenamientos/${curso.slug}`);
  });

  it('404: slug inexistente muestra el expediente extraviado con CTA a /entrenamientos', () => {
    renderAt('/entrenamientos/no-existe-este-slug/practica');

    expect(screen.getByText('expediente extraviado')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Ese entrenamiento no está.' })).toBeInTheDocument();
    expect(screen.getByText('Extraviado')).toBeInTheDocument();
    const cta = screen.getByRole('link', { name: 'Ver los entrenamientos →' });
    expect(cta).toHaveAttribute('href', '/entrenamientos');
  });

  it('estados — mientras carga muestra el microcopy de carga', async () => {
    const { curso } = await buscarCursoConMenosPreguntas();
    renderAt(`/entrenamientos/${curso.slug}/practica`);

    expect(screen.getByText('Cargando — menos que un trámite.')).toBeInTheDocument();
  });
});
