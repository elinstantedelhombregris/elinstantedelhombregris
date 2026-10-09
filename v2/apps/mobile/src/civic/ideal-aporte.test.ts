import { SLUG_CAMPANA_NACIONAL, contribucionSchema } from '@v2/shared';
import { describe, expect, it } from 'vitest';

import { campanaDe } from './campana-de-prueba';
import {
  MENSAJE_CAMPANA_CERRADA,
  MENSAJE_CAMPANA_INEXISTENTE,
  MENSAJE_EDICION_CAMBIADA,
  MINIMO_CARACTERES_APORTE,
  MOTIVO_BUSCANDO_CAMPANA,
  MOTIVO_CAMPANA_PENDIENTE,
  MOTIVO_CASILLAS_DOS,
  MOTIVO_CASILLAS_TRES,
  MOTIVO_SIN_TEXTO,
  borradorNuevo,
  borradorParaCambiarEnvio,
  borradorParaOtroAporte,
  campanaALeer,
  destinoDelEnvio,
  lecturaCoincide,
  lineaDeDestino,
  motivoSinPublicar,
  resolverDestino,
  type Destino,
  type LecturaCampana,
} from './ideal-aporte';

import type { BorradorIdeal } from './ideal';

const ID_A = '34b57499-a167-4dda-ae15-f0e0c3c67720';
const ID_B = '0b6f6f3e-98a1-4d1f-9d0f-6b7d0b6f1c22';
const AHORA = new Date('2026-10-09T15:00:00.000Z');

const nacional = (cambios: Parameters<typeof campanaDe>[0] = {}) =>
  campanaDe({
    slug: SLUG_CAMPANA_NACIONAL,
    revision: 4,
    contrato: { titulo: 'Mi Argentina ideal', responsable: 'Juan Bravin' },
    ...cambios,
  });
const ok = (campana = nacional()): LecturaCampana => ({ tipo: 'ok', campana });

describe('A qué campaña va un aporte sin campaña elegida', () => {
  it('sin elegir ninguna, se lee la nacional por su slug', () => {
    expect(campanaALeer({ campanaId: null, envio: null })).toBe(SLUG_CAMPANA_NACIONAL);
    expect(campanaALeer({ campanaId: null, envio: null })).toBe('mi-argentina-ideal');
  });

  it('una campaña elegida manda sobre la nacional', () => {
    expect(campanaALeer({ campanaId: 'otra', envio: null })).toBe('otra');
  });

  it('con un envío confirmado la campaña es la del envío, incluso si fue «ninguna»', () => {
    const envioCon = (campanaId: string | null) =>
      ({ senal: {}, campanaId, edicion: null }) as never;
    expect(campanaALeer({ campanaId: null, envio: envioCon('x') })).toBe('x');
    expect(campanaALeer({ campanaId: 'otra', envio: envioCon(null) })).toBeNull();
  });

  it('reconoce una lectura que ya tiene, por id o por slug, para no pedirla dos veces', () => {
    const lectura = ok();
    expect(lecturaCoincide(SLUG_CAMPANA_NACIONAL, lectura)).toBe(true);
    expect(lecturaCoincide(nacional().id, lectura)).toBe(true);
    expect(lecturaCoincide('otra', lectura)).toBe(false);
    expect(lecturaCoincide(null, lectura)).toBe(false);
    expect(lecturaCoincide(SLUG_CAMPANA_NACIONAL, { tipo: 'cargando' })).toBe(false);
    expect(lecturaCoincide(SLUG_CAMPANA_NACIONAL, { tipo: 'no_existe' })).toBe(false);
  });
});

describe('Destino por defecto: la campaña nacional, sin bloquear a nadie', () => {
  const porDefecto = { porDefecto: true, sinCampana: false, edicion: null };

  it('abierta: el aporte va a la nacional con la edición que la campaña informa ahora', () => {
    const d = resolverDestino({ ...porDefecto, lectura: ok(nacional({ revision: 7 })) });
    expect(d).toMatchObject({ tipo: 'campana', nacional: true, edicion: 7 });
    expect(destinoDelEnvio(d)).toEqual({ campanaId: nacional().id, edicion: 7 });
  });

  it('una edición vieja guardada nunca pisa la de hoy', () => {
    const d = resolverDestino({
      ...porDefecto,
      edicion: 2,
      lectura: ok(nacional({ revision: 7 })),
    });
    expect(destinoDelEnvio(d)).toEqual({ campanaId: nacional().id, edicion: 7 });
  });

  it('si la campaña nacional no existe en este servidor, se publica sin campaña', () => {
    const d = resolverDestino({ ...porDefecto, lectura: { tipo: 'no_existe' } });
    expect(d).toEqual({ tipo: 'ninguna' });
    expect(destinoDelEnvio(d)).toEqual({ campanaId: null, edicion: null });
  });

  it('si no está abierta (devolución, pausa, cerrada), también se publica sin campaña', () => {
    for (const estado of [
      'borrador',
      'programada',
      'pausada',
      'en_devolucion',
      'cerrada',
    ] as const) {
      const d = resolverDestino({ ...porDefecto, lectura: ok(nacional({ estado })) });
      expect(d).toEqual({ tipo: 'ninguna' });
    }
  });

  it('si no se pudo leer (sin conexión, 5xx) NO se publica en silencio sin campaña: se bloquea y se puede reintentar', () => {
    const d = resolverDestino({
      ...porDefecto,
      lectura: { tipo: 'error', mensaje: 'No hay conexión.' },
    });
    expect(d).toMatchObject({ tipo: 'bloqueado', motivo: 'error', mensaje: 'No hay conexión.' });
    expect(destinoDelEnvio(d)).toBeNull();
  });
});

describe('Cargando no es cerrado', () => {
  it('mientras se lee, el destino es «cargando»: no está bloqueado ni sin campaña', () => {
    for (const porDefecto of [true, false]) {
      const d = resolverDestino({
        porDefecto,
        sinCampana: false,
        edicion: null,
        lectura: { tipo: 'cargando' },
      });
      expect(d).toEqual({ tipo: 'cargando' });
      expect(destinoDelEnvio(d)).toBeNull();
    }
  });
});

describe('Campaña elegida a mano', () => {
  const elegida = { porDefecto: false, sinCampana: false };

  it('abierta y en la edición con la que se empezó: se publica ahí', () => {
    const c = campanaDe({ revision: 2 });
    const d = resolverDestino({ ...elegida, edicion: 2, lectura: ok(c) });
    expect(d).toMatchObject({ tipo: 'campana', nacional: false, edicion: 2 });
    expect(destinoDelEnvio(d)).toEqual({ campanaId: c.id, edicion: 2 });
  });

  it('sin edición guardada, toma la vigente', () => {
    const d = resolverDestino({
      ...elegida,
      edicion: null,
      lectura: ok(campanaDe({ revision: 3 })),
    });
    expect(destinoDelEnvio(d)?.edicion).toBe(3);
  });

  it('si no está abierta, bloquea con un mensaje honesto (no la manda a la nacional en silencio)', () => {
    const d = resolverDestino({
      ...elegida,
      edicion: 2,
      lectura: ok(campanaDe({ estado: 'en_devolucion' })),
    });
    expect(d).toMatchObject({
      tipo: 'bloqueado',
      motivo: 'cerrada',
      mensaje: MENSAJE_CAMPANA_CERRADA,
    });
    expect(destinoDelEnvio(d)).toBeNull();
  });

  it('si cambió de edición mientras escribías, bloquea y lo dice', () => {
    const d = resolverDestino({ ...elegida, edicion: 2, lectura: ok(campanaDe({ revision: 3 })) });
    expect(d).toMatchObject({
      tipo: 'bloqueado',
      motivo: 'edicion',
      mensaje: MENSAJE_EDICION_CAMBIADA,
    });
  });

  it('elegir la nacional a mano tampoco arrastra una edición vieja', () => {
    const d = resolverDestino({
      ...elegida,
      edicion: 1,
      lectura: ok(nacional({ revision: 4 })),
    });
    expect(destinoDelEnvio(d)).toEqual({ campanaId: nacional().id, edicion: 4 });
  });

  it('una campaña elegida que no existe bloquea (no se publica en otra)', () => {
    const d = resolverDestino({ ...elegida, edicion: null, lectura: { tipo: 'no_existe' } });
    expect(d).toMatchObject({ tipo: 'bloqueado', mensaje: MENSAJE_CAMPANA_INEXISTENTE });
  });

  it('el mensaje de cada bloqueo explica qué hacer: guardar el texto y volver', () => {
    expect(MENSAJE_CAMPANA_CERRADA).toMatch(/Guardá tu texto en este teléfono/);
    expect(MENSAJE_EDICION_CAMBIADA).toMatch(/reglas de la campaña/);
    expect(MENSAJE_EDICION_CAMBIADA).not.toMatch(/contrato|fase/i);
  });
});

describe('Un envío ya confirmado sin campaña', () => {
  it('queda sin campaña sin leer nada', () => {
    const d = resolverDestino({
      porDefecto: false,
      sinCampana: true,
      edicion: null,
      lectura: { tipo: 'cargando' },
    });
    expect(d).toEqual({ tipo: 'ninguna' });
  });
});

describe('La línea que dice a dónde va el aporte', () => {
  it('nacional, otra campaña, ninguna y cargando', () => {
    const n = resolverDestino({
      porDefecto: true,
      sinCampana: false,
      edicion: null,
      lectura: ok(nacional()),
    });
    expect(lineaDeDestino(n)).toBe('Va a la campaña nacional «Mi Argentina ideal», edición 4.');
    const otra = resolverDestino({
      porDefecto: false,
      sinCampana: false,
      edicion: 2,
      lectura: ok(campanaDe({ revision: 2 })),
    });
    expect(lineaDeDestino(otra)).toBe('Va a la campaña «Aprender en Mendoza», edición 2.');
    expect(lineaDeDestino({ tipo: 'ninguna' })).toBe(
      'Por ahora no hay una campaña abierta: tu aporte se publica sin campaña.',
    );
    expect(lineaDeDestino({ tipo: 'cargando' })).toBe('Buscando la campaña…');
  });

  it('un bloqueo con campaña conocida la nombra; sin ella no dice nada', () => {
    const cerrada = resolverDestino({
      porDefecto: false,
      sinCampana: false,
      edicion: 2,
      lectura: ok(campanaDe({ estado: 'cerrada', revision: 2 })),
    });
    expect(lineaDeDestino(cerrada)).toBe('Campaña «Aprender en Mendoza», edición 2.');
    const sinDatos: Destino = { tipo: 'bloqueado', motivo: 'error', campana: null, mensaje: 'x' };
    expect(lineaDeDestino(sinDatos)).toBeNull();
  });
});

describe('Por qué el botón «Publicar mi aporte» está apagado', () => {
  const listo = {
    texto: 'Quiero poder aprender cerca de casa.',
    asistido: false,
    autor: false,
    revisado: true,
    publico: true,
    destino: { tipo: 'ninguna' } as Destino,
  };

  it('el mínimo es el del servidor: un carácter después de recortar espacios', () => {
    expect(MINIMO_CARACTERES_APORTE).toBe(1);
    expect(motivoSinPublicar({ ...listo, texto: 'a' })).toBeNull();
    expect(motivoSinPublicar({ ...listo, texto: 'Sí' })).toBeNull();
    expect(motivoSinPublicar({ ...listo, texto: '' })).toBe(MOTIVO_SIN_TEXTO);
    expect(motivoSinPublicar({ ...listo, texto: '  \n ' })).toBe(MOTIVO_SIN_TEXTO);
    expect(MOTIVO_SIN_TEXTO).toBe('Escribí al menos una frase para seguir.');
  });

  it('un texto corto que el servidor acepta no queda bloqueado por la app', () => {
    // El servidor pide `min(1)`; la app pedía 10 y rechazaba «Salud» o «Más trenes».
    expect(motivoSinPublicar({ ...listo, texto: 'Salud' })).toBeNull();
  });

  it('faltan casillas: dice cuántas', () => {
    expect(motivoSinPublicar({ ...listo, revisado: false })).toBe(MOTIVO_CASILLAS_DOS);
    expect(motivoSinPublicar({ ...listo, publico: false })).toBe(MOTIVO_CASILLAS_DOS);
    expect(MOTIVO_CASILLAS_DOS).toBe('Marcá las dos casillas para publicar.');
  });

  it('ayudando a otra persona son tres casillas', () => {
    expect(motivoSinPublicar({ ...listo, asistido: true, autor: false })).toBe(
      MOTIVO_CASILLAS_TRES,
    );
    expect(motivoSinPublicar({ ...listo, asistido: true, autor: true })).toBeNull();
  });

  it('primero se pide escribir, después marcar, después esperar a la campaña', () => {
    expect(motivoSinPublicar({ ...listo, texto: '', revisado: false })).toBe(MOTIVO_SIN_TEXTO);
    expect(motivoSinPublicar({ ...listo, revisado: false, destino: { tipo: 'cargando' } })).toBe(
      MOTIVO_CASILLAS_DOS,
    );
    expect(motivoSinPublicar({ ...listo, destino: { tipo: 'cargando' } })).toBe(
      MOTIVO_BUSCANDO_CAMPANA,
    );
  });

  it('una campaña bloqueada apunta al aviso de arriba, que dice por qué', () => {
    const destino: Destino = {
      tipo: 'bloqueado',
      motivo: 'cerrada',
      campana: campanaDe(),
      mensaje: MENSAJE_CAMPANA_CERRADA,
    };
    expect(motivoSinPublicar({ ...listo, destino })).toBe(MOTIVO_CAMPANA_PENDIENTE);
  });

  it('con todo en orden no hay motivo', () => {
    expect(motivoSinPublicar(listo)).toBeNull();
    const conCampana: Destino = {
      tipo: 'campana',
      campana: nacional(),
      nacional: true,
      edicion: 4,
    };
    expect(motivoSinPublicar({ ...listo, destino: conCampana })).toBeNull();
  });
});

describe('«Sumar otro aporte» y «Cambiar el texto o el tema» renuevan la clave de idempotencia', () => {
  const publicado: BorradorIdeal = {
    ...borradorNuevo(ID_A, AHORA, { campanaId: 'camp-1', edicion: 3 }),
    texto: 'Mi texto ya publicado',
    tema: 'salud',
    modo: 'asistido',
    envio: contribucionSchema.parse({
      senal: {
        contrato: 'basta-senal/v1',
        idLocal: ID_A,
        tipo: 'sueño',
        texto: 'Mi texto ya publicado',
        casa: 'sinRespuesta',
        cedeLicencia: false,
      },
      campanaId: null,
      edicion: null,
      fragmentos: [],
      interpretacionConfirmada: true,
      aceptaPublicar: true,
    }),
    recibo: 'recibo-1',
    cuentaAlConfirmar: 9,
  };

  it('un borrador nuevo viene en blanco, sin envío, con el id que le damos y sin campaña por defecto', () => {
    const b = borradorNuevo(ID_B, AHORA);
    expect(b).toEqual({
      id: ID_B,
      texto: '',
      tema: '',
      campanaId: null,
      edicion: null,
      modo: 'personal',
      fecha: AHORA.toISOString(),
      envio: null,
      recibo: null,
    });
  });

  it('sumar otro aporte: id nuevo (si no, la API devolvería el aporte anterior), sin texto ni envío ni recibo', () => {
    const otro = borradorParaOtroAporte(publicado, ID_B, AHORA);
    expect(otro.id).toBe(ID_B);
    expect(otro.id).not.toBe(publicado.id);
    expect(otro.texto).toBe('');
    expect(otro.tema).toBe('');
    expect(otro.modo).toBe('personal');
    expect(otro.envio).toBeNull();
    expect(otro.recibo).toBeNull();
    expect(otro.cuentaAlConfirmar).toBeUndefined();
    expect(otro.retirado).toBeUndefined();
  });

  it('sumar otro aporte sigue en la misma campaña elegida, pero sin la edición: se lee la de hoy', () => {
    const otro = borradorParaOtroAporte(publicado, ID_B, AHORA);
    expect(otro.campanaId).toBe('camp-1');
    expect(otro.edicion).toBeNull();
    // Sin campaña elegida, queda en blanco: irá a la nacional.
    const sinCampana = borradorParaOtroAporte({ campanaId: null }, ID_B, AHORA);
    expect(sinCampana.campanaId).toBeNull();
  });

  it('cambiar el texto o el tema: descarta el envío y su cuenta, y cambia el id', () => {
    const pendiente: BorradorIdeal = { ...publicado, recibo: null };
    const nuevo = borradorParaCambiarEnvio(pendiente, ID_B);
    expect(nuevo.id).toBe(ID_B);
    expect(nuevo.envio).toBeNull();
    expect(nuevo.recibo).toBeNull();
    expect('cuentaAlConfirmar' in nuevo).toBe(false);
  });

  it('cambiar el envío conserva lo que la persona escribió y eligió', () => {
    const nuevo = borradorParaCambiarEnvio({ ...publicado, recibo: null }, ID_B);
    expect(nuevo.texto).toBe('Mi texto ya publicado');
    expect(nuevo.tema).toBe('salud');
    expect(nuevo.modo).toBe('asistido');
    expect(nuevo.campanaId).toBe('camp-1');
  });

  it('no modifica el borrador de origen', () => {
    const antes = JSON.stringify(publicado);
    borradorParaCambiarEnvio(publicado, ID_B);
    borradorParaOtroAporte(publicado, ID_B, AHORA);
    expect(JSON.stringify(publicado)).toBe(antes);
    expect(publicado.id).toBe(ID_A);
  });
});
