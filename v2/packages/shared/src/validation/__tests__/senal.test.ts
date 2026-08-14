import { describe, expect, it } from 'vitest';

import { CONTRATO_SENAL, senalSchema, tipoSenalSchema } from '../senal.js';

/**
 * Las guardas del contrato de ingesta.
 *
 * El grueso de este archivo es una sola cosa dicha de varias maneras: que la
 * normalización a NFC pasa **antes** de validar el enum. Es el defecto más
 * fácil de reintroducir de todo el módulo —`z.enum(...).transform(...)` se lee
 * perfectamente natural y no normaliza nunca— y su modo de falla es el peor
 * posible: un 400 sobre una palabra correctamente escrita, que sólo le pasa a
 * quien escribe desde un teclado que emite NFD, y que en el log se ve como un
 * cliente mandando basura.
 */

/** `'sueño'` con la ñ descompuesta: `n` + combining tilde. Se ve igual. */
const SUENO_NFD = 'sueño';
/** `'práctica'` con la tilde combinante. */
const PRACTICA_NFD = 'práctica';

const base = {
  contrato: CONTRATO_SENAL,
  idLocal: '6f1e4c8a-1b2d-4e3f-8a9b-0c1d2e3f4a5b',
  texto: 'Hay un pozo en la esquina hace tres meses.',
  cedeLicencia: true,
  casa: 'no' as const,
};

describe('el tipo se normaliza antes de validarse', () => {
  it('acepta «sueño» con la ñ descompuesta y devuelve la forma compuesta', () => {
    // Las dos formas se ven idénticas y no son el mismo string.
    expect(SUENO_NFD).not.toBe('sueño');
    expect(SUENO_NFD.normalize('NFC')).toBe('sueño');

    const leido = tipoSenalSchema.parse(SUENO_NFD);
    expect(leido).toBe('sueño');
  });

  it('acepta «práctica» con la tilde combinante', () => {
    expect(PRACTICA_NFD).not.toBe('práctica');
    expect(tipoSenalSchema.parse(PRACTICA_NFD)).toBe('práctica');
  });

  it('acepta mayúsculas y espacios de sobra, que es lo que manda un formulario', () => {
    expect(tipoSenalSchema.parse('  BASTA ')).toBe('basta');
  });

  it('rechaza «valor», que salió del canon', () => {
    expect(tipoSenalSchema.safeParse('valor').success).toBe(false);
  });

  it('rechaza un tipo mal escrito sin plegarlo contra ninguno', () => {
    const r = tipoSenalSchema.safeParse('bastta');
    expect(r.success).toBe(false);
  });
});

describe('los nueve tipos entran', () => {
  const NUEVE = [
    'basta',
    'necesidad',
    'recurso',
    'práctica',
    'saber',
    'sueño',
    'propuesta',
    'compromiso',
    'pregunta',
  ];

  it.each(NUEVE)('%s es del canon', (tipo) => {
    expect(tipoSenalSchema.parse(tipo)).toBe(tipo);
  });
});

describe('las reglas que dependen del tipo', () => {
  const manana = new Date(Date.now() + 86_400_000).toISOString().slice(0, 10);
  const ayer = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);

  it('un compromiso sin fecha no pasa', () => {
    const r = senalSchema.safeParse({ ...base, tipo: 'compromiso' });
    expect(r.success).toBe(false);
    if (!r.success) {
      expect(r.error.issues[0]?.path).toEqual(['comprometidoPara']);
    }
  });

  it('un compromiso con fecha pasada no pasa: vencido al nacer no es un compromiso', () => {
    const r = senalSchema.safeParse({ ...base, tipo: 'compromiso', comprometidoPara: ayer });
    expect(r.success).toBe(false);
  });

  it('un compromiso con fecha futura pasa', () => {
    const r = senalSchema.safeParse({ ...base, tipo: 'compromiso', comprometidoPara: manana });
    expect(r.success).toBe(true);
  });

  it('un basta con fecha de cumplimiento no pasa', () => {
    const r = senalSchema.safeParse({ ...base, tipo: 'basta', comprometidoPara: manana });
    expect(r.success).toBe(false);
  });

  it('un saber sin fuente no pasa: sin procedencia es un rumor', () => {
    expect(senalSchema.safeParse({ ...base, tipo: 'saber' }).success).toBe(false);
    expect(
      senalSchema.safeParse({ ...base, tipo: 'saber', fuente: 'Me lo dijo la del kiosco.' }).success,
    ).toBe(true);
  });

  it('una práctica sin periodicidad no pasa', () => {
    expect(senalSchema.safeParse({ ...base, tipo: 'práctica' }).success).toBe(false);
    expect(
      senalSchema.safeParse({ ...base, tipo: 'práctica', periodicidad: 'semanal' }).success,
    ).toBe(true);
  });

  it('la periodicidad es un vocabulario cerrado, no texto libre', () => {
    // La base lo amarra con `senales_periodicidad_conocida_chk`. Si el borde
    // aceptara texto libre, esto llegaría a Postgres y volvería como un 500.
    expect(
      senalSchema.safeParse({ ...base, tipo: 'práctica', periodicidad: 'Martes y jueves 18h' })
        .success,
    ).toBe(false);
  });

  it('`sostenidaPor` fuera de práctica no pasa: la base los amarra juntos', () => {
    expect(
      senalSchema.safeParse({ ...base, tipo: 'basta', sostenidaPor: 'La cooperativa' }).success,
    ).toBe(false);
  });

  it('sólo práctica y propuesta llevan título', () => {
    expect(
      senalSchema.safeParse({ ...base, tipo: 'propuesta', titulo: 'Semáforo en la esquina' })
        .success,
    ).toBe(true);
    expect(senalSchema.safeParse({ ...base, tipo: 'basta', titulo: 'Che' }).success).toBe(false);
  });

  it('sólo un hecho declara días de vigencia', () => {
    expect(senalSchema.safeParse({ ...base, tipo: 'basta', diasDeVigencia: 90 }).success).toBe(true);
    expect(senalSchema.safeParse({ ...base, tipo: 'sueño', diasDeVigencia: 90 }).success).toBe(
      false,
    );
  });
});

describe('lo que no se puede omitir', () => {
  it('sin `cedeLicencia` no pasa: nadie licencia obra ajena por default', () => {
    const { cedeLicencia: _, ...sinCesion } = base;
    expect(senalSchema.safeParse({ ...sinCesion, tipo: 'basta' }).success).toBe(false);
  });

  it('sin `casa` no pasa: es la que decide si se puede guardar una dirección', () => {
    const { casa: _, ...sinCasa } = base;
    expect(senalSchema.safeParse({ ...sinCasa, tipo: 'basta' }).success).toBe(false);
  });

  it('`cedeLicencia: false` pasa — la fila existe, el volcado sale sin texto', () => {
    expect(senalSchema.safeParse({ ...base, tipo: 'basta', cedeLicencia: false }).success).toBe(
      true,
    );
  });

  it('el contrato viejo se rechaza con nombre', () => {
    expect(senalSchema.safeParse({ ...base, tipo: 'basta', contrato: 'v0' }).success).toBe(false);
  });

  it('`origen` no es del contrato: lo decide la ruta', () => {
    const r = senalSchema.safeParse({ ...base, tipo: 'basta', origen: 'campo' });
    // Pasa, pero `origen` no sobrevive al parseo: no está en la forma de salida.
    expect(r.success).toBe(true);
    if (r.success) expect('origen' in r.data).toBe(false);
  });
});

describe('el engrosado y la casa', () => {
  it('rechazar el engrosado sobre una casa ajena no se puede', () => {
    expect(
      senalSchema.safeParse({ ...base, tipo: 'basta', casa: 'ajena', aceptaEngrosado: false })
        .success,
    ).toBe(false);
  });

  it('sobre la propia sí', () => {
    expect(
      senalSchema.safeParse({ ...base, tipo: 'basta', casa: 'propia', aceptaEngrosado: false })
        .success,
    ).toBe(true);
  });

  it('`sinRespuesta` es una respuesta válida y no un hueco', () => {
    expect(senalSchema.safeParse({ ...base, tipo: 'basta', casa: 'sinRespuesta' }).success).toBe(
      true,
    );
  });
});

describe('la dirección', () => {
  it('una altura sin calle no ubica nada', () => {
    expect(senalSchema.safeParse({ ...base, tipo: 'basta', altura: 1450 }).success).toBe(false);
    expect(
      senalSchema.safeParse({ ...base, tipo: 'basta', altura: 1450, calleId: 41822 }).success,
    ).toBe(true);
  });
});

describe('los campos libres se normalizan', () => {
  it('el texto sale en NFC para que el volcado no tenga dos formas de lo mismo', () => {
    const r = senalSchema.safeParse({
      ...base,
      tipo: 'basta',
      texto: `El baño del club está roto.`,
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.texto).toBe('El baño del club está roto.');
      expect(r.data.texto.normalize('NFC')).toBe(r.data.texto);
    }
  });

  it('un texto vacío no pasa', () => {
    expect(senalSchema.safeParse({ ...base, tipo: 'basta', texto: '   ' }).success).toBe(false);
  });
});
