import { describe, expect, it } from 'vitest';

import { detectarCola } from '../src/content/cola-generada';

const GEN_A = `## Formalizarse

Texto propio del autor.

### Aplicación práctica

Guía práctica. Para que esta idea no quede en el plano conceptual, conviene traducirla a decisiones observables.

### Cómo se ve en el territorio

En Argentina, muchas discusiones se traban porque se habla desde consignas generales.

### Errores comunes

- Confundir el nombre del problema con su causa de fondo.

### Ejercicio guiado

1. Resume la idea central de la lección en dos frases propias.

### Idea fuerza

Cuando un aprendizaje se traduce en decisiones mejores, deja de ser información.`;

const GEN_B = `## El arte de convocar

Texto propio del autor.

## Aplicación práctica

La diferencia entre convocar y manipular. Cobra valor cuando lo conviertes en una decisión observable dentro de tu proyecto.

## Idea fuerza

El arte de convocar vale por su capacidad para mejorar decisiones reales.`;

describe('detectarCola', () => {
  it('corta la generación A y devuelve el texto propio', () => {
    const corte = detectarCola(GEN_A);
    expect(corte.motivo).toBe('cola-limpia');
    expect(GEN_A.slice(0, corte.indice ?? 0).trim().endsWith('Texto propio del autor.')).toBe(true);
    expect(corte.encabezados).toHaveLength(5);
  });

  it('corta la generación B, que usa ## y otro texto', () => {
    const corte = detectarCola(GEN_B);
    expect(corte.motivo).toBe('cola-limpia');
    expect(corte.encabezados).toEqual(['Aplicación práctica', 'Idea fuerza']);
  });

  it('no toca una lección sin cola', () => {
    const corte = detectarCola('## Título\n\nSólo prosa.');
    expect(corte).toEqual({ motivo: 'sin-cola', indice: null, encabezados: [] });
  });

  it('no toca las secciones del autor con nombre parecido', () => {
    const propio = '## Bucles\n\nProsa.\n\n### Ejercicio: Mapear Bucles\n\n1. Dibujá tu bucle.';
    expect(detectarCola(propio).motivo).toBe('sin-cola');
  });

  it('no corta cuando el encabezado coincide pero el párrafo no tiene huella', () => {
    const ajeno = '## Monotributo\n\nProsa.\n\n### Errores comunes\n\n- No recategorizarse cada seis meses.';
    expect(detectarCola(ajeno).motivo).toBe('sin-huella');
  });

  it('no corta cuando después de la cola aparece contenido ajeno', () => {
    const mezclado = `${GEN_A}\n\n## Un cierre del autor\n\nEsto lo escribió alguien.`;
    expect(detectarCola(mezclado).motivo).toBe('cola-abierta');
  });

  it('corta cuando la huella está en una sección posterior de la cola, no en la primera', () => {
    // Caso real: a la primera sección se le corrió una palabra («dos o tres
    // frases» en vez de «dos frases»), y la huella textual está dos secciones
    // más abajo. Con la ventana pegada a la primera sección, esto no se cortaba.
    const corrido = `## Cooperativas

Texto propio del autor.

## Ejercicio guiado

1. Resume la idea central de la lección en dos o tres frases propias.

## Idea fuerza

Cooperativas de consumo vale por su capacidad para mejorar decisiones reales.`;
    const corte = detectarCola(corrido);
    expect(corte.motivo).toBe('cola-limpia');
    expect(corrido.slice(0, corte.indice ?? 0).trim().endsWith('Texto propio del autor.')).toBe(true);
  });

  it('un encabezado de cola temprano con cola abierta no tapa la cola real de más abajo', () => {
    // Caso real de teoria-juegos: un «Errores comunes» de otro bloque aparece
    // antes que la cola verdadera. Quedándose con el primer candidato, el
    // archivo entero se declaraba sin-huella y la cola real no se veía nunca.
    const dosBloques = `## Módulo 4

Texto propio.

### Errores comunes

- Un error que escribió el autor.

### Sección propia del autor

Prosa del autor.

### Aplicación práctica

Para que esta idea no quede en el plano conceptual, conviene traducirla a decisiones observables.

### Idea fuerza

Cuando un aprendizaje se traduce en decisiones mejores, deja de ser información.`;
    const corte = detectarCola(dosBloques);
    expect(corte.motivo).toBe('cola-limpia');
    expect(corte.encabezados).toEqual(['Aplicación práctica', 'Idea fuerza']);
    expect(dosBloques.slice(0, corte.indice ?? 0)).toContain('Prosa del autor.');
  });

  it('reconoce la tercera generación, la de teoria-juegos', () => {
    const genC = `## Coordinación

Texto propio del autor.

### Aplicación argentina

La utilidad real del contenido aparece cuando lo llevas a decisiones concretas en Argentina.

### Errores comunes

- Quedarse con el concepto técnico y no traducirlo a decisiones observables.

### Ejercicio de aplicación

1. Elegí un caso.

### Cierre

La prueba de esta lección no está en repetir su vocabulario.`;
    const corte = detectarCola(genC);
    expect(corte.motivo).toBe('cola-limpia');
    expect(corte.encabezados).toEqual([
      'Aplicación argentina',
      'Errores comunes',
      'Ejercicio de aplicación',
      'Cierre',
    ]);
  });
});
