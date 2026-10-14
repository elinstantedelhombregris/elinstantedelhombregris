import { describe, expect, it } from 'vitest';

import { accionReservaSchema, capacidadSchema, solicitudCapacidadSchema } from '../capacidades';

const base = {
  idLocal: '11111111-1111-4111-8111-111111111111',
  senalId: '22222222-2222-4222-8222-222222222222',
  titulo: 'Sala',
  tipo: 'espacio',
  unidad: 'horas',
  cantidad: 10,
  desde: '2028-02-01',
  hasta: '2028-02-29',
  territorioId: null,
  zona: 'Barrio',
  restricciones: 'Por la tarde',
  firma: 'Equipo',
  autorizoOferta: true,
};
describe('Contrato de capacidades', () => {
  it('distingue cantidad desconocida de cero, acepta año bisiesto y rechaza fechas imposibles', () => {
    expect(capacidadSchema.safeParse(base).success).toBe(true);
    expect(capacidadSchema.parse({ ...base, cantidad: null }).cantidad).toBeNull();
    for (const cantidad of [0, -1, 0.5, Infinity, 1_000_001])
      expect(capacidadSchema.safeParse({ ...base, cantidad }).success).toBe(false);
    expect(capacidadSchema.safeParse({ ...base, hasta: '2027-02-29' }).success).toBe(false);
    expect(capacidadSchema.safeParse({ ...base, hasta: '2028-01-31' }).success).toBe(false);
    expect(capacidadSchema.safeParse({ ...base, autorizoOferta: false }).success).toBe(false);
  });
  it('exige aceptación de condiciones y nota para declarar entrega o discrepancia', () => {
    const solicitud = {
      idLocal: base.idLocal,
      fichaId: base.senalId,
      cantidad: 1,
      paraFecha: base.hasta,
      necesidad: 'Encuentro',
      compatibilidad: 'Horario compatible',
      aceptaCondiciones: true,
    };
    expect(solicitudCapacidadSchema.safeParse(solicitud).success).toBe(true);
    expect(
      solicitudCapacidadSchema.safeParse({ ...solicitud, aceptaCondiciones: false }).success,
    ).toBe(false);
    expect(accionReservaSchema.safeParse({ accion: 'declarar_entrega', nota: '   ' }).success).toBe(
      false,
    );
    expect(
      accionReservaSchema.safeParse({ accion: 'discrepar', nota: 'Falta una hora' }).success,
    ).toBe(true);
  });
});
