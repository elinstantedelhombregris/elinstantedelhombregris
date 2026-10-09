import { describe, expect, it } from 'vitest';

import { contratoCampanaSchema, USO_DATOS_CONTRATO_ANTERIOR, METODO_LECTURA_CONTRATO_ANTERIOR } from '../campanas.js';
import { MAX_TEMAS } from '../temas.js';

const anterior = {
  titulo: 'Aprender cerca de quienes queremos',
  pregunta: '¿Qué sería posible en nuestra vida ideal?',
  proposito: 'Escuchar y formular juntos condiciones de vida para diseñar.',
  territorios: [],
  temas: ['educación'],
  participantes: 'Quienes quieran aprender y cuidar en comunidad.',
  canales: ['web'],
  responsable: 'Equipo de prueba',
  devolucion: 'Una lectura pública para revisar con quienes participaron.',
  fechaDevolucion: '2099-12-20',
  efecto: 'Una exploración sin aceptación institucional.',
  fases: [{ nombre: 'Imaginar', salida: 'Relatos revisados por quienes participan.', fecha: '2099-12-01' }],
};

describe('Contrato de campaña con uso de datos y método declarado', () => {
  it('un contrato anterior sigue siendo legible y declara exactamente qué no informó', () => {
    const c = contratoCampanaSchema.parse(anterior);
    expect(c.usoDatos).toBe(USO_DATOS_CONTRATO_ANTERIOR);
    expect(c.metodoLectura).toBe(METODO_LECTURA_CONTRATO_ANTERIOR);
    expect(c.institucion).toBe('');
    expect(anterior).not.toHaveProperty('usoDatos');
  });
  it('un contrato nuevo no puede declarar vacíos los usos o el método', () => {
    expect(contratoCampanaSchema.safeParse({ ...anterior, usoDatos: '', metodoLectura: '' }).success).toBe(false);
    const c = contratoCampanaSchema.parse({ ...anterior, usoDatos: 'Leer las voces autorizadas sin cambiar los permisos elegidos.', metodoLectura: 'Contrastar fuentes, ausencias y diferencias con devolución revisable.', institucion: 'Institución mencionada' });
    expect(c.institucion).toBe('Institución mencionada');
  });
  it('nombrar una institución no permite inventar aceptación institucional', () => {
    expect(contratoCampanaSchema.safeParse({ ...anterior, institucion: 'Una institución', institucionAcepto: true }).success).toBe(false);
  });
});

describe('Los mensajes del esquema de campaña, en castellano y con las palabras del glosario', () => {
  const mensajesDe = (entrada: unknown) => {
    const r = contratoCampanaSchema.safeParse(entrada);
    return r.success
      ? {}
      : Object.fromEntries(r.error.issues.map((i) => [i.path.join('.'), i.message]));
  };

  it('lo que se aclara de las reglas anteriores dice «reglas de la campaña» y no «contrato»', () => {
    expect(USO_DATOS_CONTRATO_ANTERIOR).toContain('reglas anteriores de la campaña');
    expect(METODO_LECTURA_CONTRATO_ANTERIOR).toContain('reglas anteriores de la campaña');
    expect(`${USO_DATOS_CONTRATO_ANTERIOR} ${METODO_LECTURA_CONTRATO_ANTERIOR}`).not.toMatch(
      /contrato/i,
    );
  });

  it('una fecha vacía o ausente pide elegir una fecha, no dice «Invalid date» ni «Required»', () => {
    const sinFecha: Partial<typeof anterior> = { ...anterior };
    delete sinFecha.fechaDevolucion;
    const m = mensajesDe({
      ...anterior,
      fechaDevolucion: '',
      fases: [{ ...anterior.fases[0], fecha: '' }],
    });
    expect(m.fechaDevolucion).toBe('Elegí una fecha.');
    expect(m['fases.0.fecha']).toBe('Elegí una fecha.');
    expect(mensajesDe(sinFecha).fechaDevolucion).toBe('Elegí una fecha.');
  });

  it('un campo corto no dice que «la pregunta» necesita contexto, salvo el de la pregunta', () => {
    const m = mensajesDe({ ...anterior, titulo: 'Corto', pregunta: 'Corta' });
    expect(m.titulo).toBe('Escribí al menos 8 caracteres en este campo.');
    expect(m.pregunta).toBe('Escribí al menos 10 caracteres para que la pregunta tenga contexto.');
  });

  it('las etapas fuera de orden y los lugares repetidos hablan de etapas y lugares', () => {
    const m = mensajesDe({
      ...anterior,
      territorios: [2, 2],
      fases: [
        {
          nombre: 'Imaginar',
          salida: 'Relatos revisados por quienes participan.',
          fecha: '2099-12-10',
        },
        { nombre: 'Leer', salida: 'Una lectura abierta para revisar.', fecha: '2099-12-01' },
      ],
    });
    expect(m.territorios).toBe('Un lugar alcanza una vez. Revisá los lugares repetidos.');
    expect(m.fases).toBe('Las fechas de las etapas deben seguir su recorrido.');
  });
});

describe('El tope de temas de una campaña es el catálogo entero', () => {
  const conTemas = (n: number) => ({
    ...anterior,
    temas: Array.from({ length: n }, (_, i) => `tema-${i}`),
  });

  it('el tope es trece', () => {
    expect(MAX_TEMAS).toBe(13);
  });

  it('trece temas se aceptan', () => {
    const r = contratoCampanaSchema.safeParse(conTemas(13));
    expect(r.success).toBe(true);
  });

  it('catorce temas se rechazan, con el mensaje de siempre y en el campo de temas', () => {
    const r = contratoCampanaSchema.safeParse(conTemas(14));
    expect(r.success).toBe(false);
    if (!r.success) {
      const tema = r.error.issues.find((i) => i.path.join('.') === 'temas');
      expect(tema?.message).toBe('Acortá este campo sin perder su sentido.');
    }
  });

  it('un contrato guardado con ocho temas sigue siendo legible', () => {
    expect(contratoCampanaSchema.safeParse(conTemas(8)).success).toBe(true);
  });

  it('el tope de etapas no cambió: sigue siendo ocho', () => {
    const fase = anterior.fases[0];
    const nueve = Array.from({ length: 9 }, () => fase);
    expect(contratoCampanaSchema.safeParse({ ...anterior, fases: nueve }).success).toBe(false);
  });
});
