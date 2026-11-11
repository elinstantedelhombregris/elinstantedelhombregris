/**
 * La cuenta de días de la cabecera de Ver (D-158).
 *
 * La API manda `recibeHasta` como un día suelto (`2027-02-28`): es la fecha de
 * la primera fase del contrato, «hasta acá se reciben aportes». `Date.parse`
 * lee un día suelto como medianoche UTC, que en la Argentina son las 21:00 del
 * día anterior, y la cabecera cerraba la campaña un día antes de lo que dice su
 * contrato. El test de la página no lo veía porque su dato de mentira traía una
 * hora que el servidor nunca manda.
 */
import { describe, expect, it } from 'vitest';

import { diasHasta, fraseDeFecha } from '../ver/formato';

/** Un instante en hora argentina. */
const enArgentina = (dia: string, hora: string) => Date.parse(`${dia}T${hora}:00-03:00`);

describe('diasHasta, con el día suelto que manda la API', () => {
  const ULTIMO_DIA = '2027-02-28';

  it('el último día todavía falta un día, a cualquier hora', () => {
    expect(diasHasta(ULTIMO_DIA, enArgentina('2027-02-28', '00:05'))).toBe(1);
    expect(diasHasta(ULTIMO_DIA, enArgentina('2027-02-28', '12:00'))).toBe(1);
    expect(diasHasta(ULTIMO_DIA, enArgentina('2027-02-28', '23:55'))).toBe(1);
  });

  it('la noche anterior no cierra la campaña: quedan dos días', () => {
    // Las 21:00 del 27 son la medianoche UTC del 28: ahí cortaba antes.
    expect(diasHasta(ULTIMO_DIA, enArgentina('2027-02-27', '20:59'))).toBe(2);
    expect(diasHasta(ULTIMO_DIA, enArgentina('2027-02-27', '21:00'))).toBe(2);
    expect(diasHasta(ULTIMO_DIA, enArgentina('2027-02-27', '23:59'))).toBe(2);
  });

  it('recién deja de recibir cuando el último día terminó en la Argentina', () => {
    expect(diasHasta(ULTIMO_DIA, enArgentina('2027-03-01', '00:00'))).toBe(0);
    expect(fraseDeFecha(diasHasta(ULTIMO_DIA, enArgentina('2027-03-01', '00:00')))).toBe(
      'ya no recibe aportes',
    );
  });

  it('cuenta el día de hoy y el último: el 20 de octubre al mediodía faltan 132', () => {
    // La frase de la spec (§5, «Cabecera»).
    expect(fraseDeFecha(diasHasta(ULTIMO_DIA, enArgentina('2026-10-20', '12:00')))).toBe(
      'faltan 132 días',
    );
  });

  it('el día no cambia con la hora: de la mañana a la noche dice lo mismo', () => {
    const manana = diasHasta(ULTIMO_DIA, enArgentina('2026-11-10', '08:00'));
    const noche = diasHasta(ULTIMO_DIA, enArgentina('2026-11-10', '22:40'));
    expect(manana).toBe(111);
    expect(noche).toBe(111);
  });
});

describe('diasHasta, con lo demás', () => {
  it('un instante con hora se respeta tal cual', () => {
    const fin = '2027-02-28T12:00:00-03:00';
    expect(diasHasta(fin, enArgentina('2027-02-28', '11:00'))).toBe(1);
    expect(diasHasta(fin, enArgentina('2027-02-28', '12:30'))).toBe(0);
  });

  it('sin fecha, o con una que no se entiende, no dice nada', () => {
    expect(diasHasta(null, Date.now())).toBeNull();
    expect(diasHasta('no es una fecha', Date.now())).toBeNull();
    expect(diasHasta('2027-02-30', Date.now())).toBeNull();
    expect(fraseDeFecha(null)).toBeNull();
  });
});
