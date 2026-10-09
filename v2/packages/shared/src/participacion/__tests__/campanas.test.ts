import { describe, expect, it } from 'vitest';

import { contratoCampanaSchema, USO_DATOS_CONTRATO_ANTERIOR, METODO_LECTURA_CONTRATO_ANTERIOR } from '../campanas.js';

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
