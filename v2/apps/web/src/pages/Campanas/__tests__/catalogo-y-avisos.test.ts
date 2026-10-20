import { SLUG_CAMPANA_NACIONAL } from '@v2/shared';
import { describe, expect, it } from 'vitest';

import { avisoDeEstado } from '../aviso-estado';
import { camposConError, errorDeCampo, erroresDelContrato } from '../errores-contrato';
import { ordenarCatalogo, separarQuierenAbrir } from '../filtrar-catalogo';
import {
  SLUG_DEMO_CAMPANA,
  enlaceParticiparCampana,
  esEdicionAnterior,
  fechaCampana,
  textoAportes,
  textoCanales,
} from '../presentacion';

import type { CampanaPublica, EstadoCampana } from '@v2/shared';

import { fechaDeRegistro } from '~/components/participacion/fechas';
import { aportarHref } from '~/lib/participacion/aportar';

const campana = (estado: EstadoCampana, cambios: Partial<CampanaPublica> = {}) =>
  ({
    slug: 'una-campana',
    revision: 3,
    estado,
    puedoEditar: false,
    puedoEditarContrato: false,
    historial: [],
    contrato: { fechaDevolucion: '2026-11-10' },
    ...cambios,
  }) as CampanaPublica;

describe('ordenarCatalogo', () => {
  const c = (slug: string, estado: EstadoCampana) => ({ slug, estado });
  it('pone la nacional primero y después las abiertas, sin reordenar dentro de cada grupo', () => {
    const lista = [
      c('cerrada-1', 'cerrada'),
      c('abierta-1', 'abierta'),
      c('pausada-1', 'pausada'),
      c(SLUG_CAMPANA_NACIONAL, 'cerrada'),
      c('abierta-2', 'abierta'),
    ];
    expect(ordenarCatalogo(lista).map((x) => x.slug)).toEqual([
      SLUG_CAMPANA_NACIONAL,
      'abierta-1',
      'abierta-2',
      'cerrada-1',
      'pausada-1',
    ]);
  });
  it('sin nacional conserva el orden del servidor entre las abiertas y entre el resto', () => {
    const lista = [c('b', 'pausada'), c('a', 'abierta'), c('c', 'cerrada')];
    expect(ordenarCatalogo(lista).map((x) => x.slug)).toEqual(['a', 'b', 'c']);
  });
  it('no modifica la lista que recibe', () => {
    const lista = [c('b', 'pausada'), c('a', 'abierta')];
    ordenarCatalogo(lista);
    expect(lista.map((x) => x.slug)).toEqual(['b', 'a']);
  });
  it('si se ordenan juntas, las que quieren abrir van al final', () => {
    const lista = [c('r1', 'reuniendo'), c('p1', 'por_revisar'), c('cerrada', 'cerrada')];
    expect(ordenarCatalogo([...lista, c('a1', 'abierta')]).map((x) => x.slug)).toEqual([
      'a1',
      'cerrada',
      'r1',
      'p1',
    ]);
  });
});

describe('separarQuierenAbrir', () => {
  const c = (slug: string, estado: EstadoCampana) => ({ slug, estado });
  it('las que juntan gente o esperan revisión van aparte, sin cambiar el orden de cada grupo', () => {
    const { catalogo, quierenAbrir } = separarQuierenAbrir([
      c('r1', 'reuniendo'),
      c('a1', 'abierta'),
      c('p1', 'por_revisar'),
      c(SLUG_CAMPANA_NACIONAL, 'abierta'),
    ]);
    expect(catalogo.map((x) => x.slug)).toEqual(['a1', SLUG_CAMPANA_NACIONAL]);
    expect(quierenAbrir.map((x) => x.slug)).toEqual(['r1', 'p1']);
  });
});

describe('presentación de una campaña', () => {
  it('el enlace para sumar un aporte lleva el slug y la edición vigente', () => {
    expect(enlaceParticiparCampana({ slug: 'mi-argentina-ideal', revision: 4 })).toBe(
      aportarHref({ campana: 'mi-argentina-ideal', edicion: 4 }),
    );
    expect(enlaceParticiparCampana({ slug: 'x', revision: 4 })).toContain('edicion=4');
  });
  it('los aportes van en singular y plural, y sin ninguno lo dicen', () => {
    expect(textoAportes(0)).toBe('Todavía no llegaron aportes.');
    expect(textoAportes(1)).toBe('1 aporte publicado.');
    expect(textoAportes(2)).toBe('2 aportes publicados.');
  });
  it('los canales se leen en español y uno desconocido no se pierde', () => {
    expect(textoCanales(['web', 'encuentro', 'asistido'])).toBe(
      'Por la web · En encuentros · Con ayuda de una persona',
    );
    expect(textoCanales(['otro'])).toBe('otro');
  });
  it('una edición es anterior cuando el historial tiene otra más nueva', () => {
    expect(esEdicionAnterior({ revision: 2, historial: [] })).toBe(false);
    expect(
      esEdicionAnterior({
        revision: 2,
        historial: [{ revision: 3, estado: 'abierta', motivo: '', fecha: '' }],
      }),
    ).toBe(true);
  });
  it('los días van en palabras y un instante cae el día argentino que corresponde', () => {
    expect(fechaCampana('2026-11-10')).toBe('10 de noviembre de 2026');
    // 01:30 UTC del 9 es todavía el 8 a la noche en la Argentina.
    expect(fechaDeRegistro('2026-10-09T01:30:00.000Z')).toBe('8 de octubre de 2026');
    expect(fechaDeRegistro('no es una fecha')).toBe('');
  });
});

describe('avisoDeEstado', () => {
  const sinAdmin = { esAdmin: false };
  it('una campaña abierta no necesita aviso', () => {
    expect(avisoDeEstado(campana('abierta'), sinAdmin)).toBeNull();
  });
  it('el ejemplo local se avisa como ejemplo, sea cual sea su estado', () => {
    const aviso = avisoDeEstado(campana('pausada', { slug: SLUG_DEMO_CAMPANA }), sinAdmin);
    expect(aviso?.titular).toBe('Ejemplo local, sin campaña real.');
  });
  it('cada estado dice qué significa para quien llega', () => {
    expect(avisoDeEstado(campana('programada'), sinAdmin)?.titular).toBe(
      'Esta campaña todavía no abrió.',
    );
    expect(avisoDeEstado(campana('en_devolucion'), sinAdmin)?.detalle).toBe(
      'Está prevista para el 10 de noviembre de 2026.',
    );
    expect(avisoDeEstado(campana('cerrada'), sinAdmin)?.titular).toBe(
      'Esta campaña está cerrada y ya no recibe aportes.',
    );
  });
  it('la pausa cuenta el último motivo registrado para ese estado', () => {
    const aviso = avisoDeEstado(
      campana('pausada', {
        historial: [
          { revision: 1, estado: 'pausada', motivo: 'Primera pausa.', fecha: '' },
          { revision: 2, estado: 'abierta', motivo: 'Se reabrió.', fecha: '' },
          { revision: 3, estado: 'pausada', motivo: 'Segunda pausa.', fecha: '' },
        ],
      }),
      sinAdmin,
    );
    expect(aviso?.detalle).toContain('Motivo de la pausa: Segunda pausa.');
  });
  it('el borrador solo se avisa a quien lo edita, y a la administración le dice cómo abrirlo', () => {
    expect(avisoDeEstado(campana('borrador'), sinAdmin)).toBeNull();
    const admin = avisoDeEstado(campana('borrador', { puedoEditar: true }), { esAdmin: true });
    expect(`${admin?.titular ?? ''} ${admin?.detalle ?? ''}`).toBe(
      'Esta campaña es un borrador: solo la ven vos y tu equipo. Cuando esté lista, abrila desde “Cuidar el recorrido”.',
    );
    const editor = avisoDeEstado(campana('borrador', { puedoEditarContrato: true }), sinAdmin);
    expect(editor?.detalle).toBe('Cuando esté lista, la abre la coordinación de ¡BASTA!');
  });
});

describe('errores del formulario de campaña', () => {
  const problemas = [
    { path: ['titulo'], message: 'Escribí al menos 8 caracteres.' },
    { path: ['titulo'], message: 'Otro mensaje del mismo campo.' },
    { path: ['fases', 1, 'nombre'], message: 'Poné un nombre.' },
    {
      path: ['fechaDevolucion'],
      message: 'Invalid date',
      code: 'invalid_string',
      validation: 'date',
    },
    { path: ['temas', 0], message: 'Tema muy corto.' },
  ];
  it('guarda el primer mensaje de cada campo, con la clave del camino', () => {
    expect(erroresDelContrato(problemas)).toEqual({
      titulo: 'Escribí al menos 8 caracteres.',
      'fases.1.nombre': 'Poné un nombre.',
      fechaDevolucion: 'Elegí una fecha válida.',
      'temas.0': 'Tema muy corto.',
    });
  });
  it('encuentra el error de un campo aunque venga de una de sus partes', () => {
    const errores = erroresDelContrato(problemas);
    expect(errorDeCampo(errores, 'temas')).toBe('Tema muy corto.');
    expect(errorDeCampo(errores, 'fases.1.nombre')).toBe('Poné un nombre.');
    expect(errorDeCampo(errores, 'fases.0.nombre')).toBeUndefined();
    expect(errorDeCampo(errores, 'tema')).toBeUndefined();
  });
  it('nombra cada campo con error una sola vez, en español y sin claves crudas', () => {
    expect(camposConError(erroresDelContrato(problemas))).toEqual([
      'Nombre de la campaña',
      'Etapas y fechas',
      'Fecha prevista de devolución',
      'Temas',
    ]);
  });
});
