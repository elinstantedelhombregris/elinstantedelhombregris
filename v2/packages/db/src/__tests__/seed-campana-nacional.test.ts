/**
 * La siembra de la campaña nacional, sin base.
 *
 * Estos tests no abren una conexión: afirman el contrato que se va a escribir y
 * las reglas de la línea de comandos que deciden si el script puede tocar una
 * base. Que la siembra escriba una sola vez, y que se niegue ante otro dueño o
 * ante un responsable inexistente, es una propiedad de Postgres y está en
 * `tests/seed-campana-nacional.test.ts`.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { SLUG_CAMPANA_NACIONAL, contratoCampanaSchema } from '@v2/shared';
import { describe, expect, it } from 'vitest';

import {
  CIERRE_RECEPCION,
  ID_LOCAL_CAMPANA_NACIONAL,
  PRIMERA_DEVOLUCION,
  TEMAS_CAMPANA_NACIONAL,
  construirContratoNacional,
  fechaLarga,
  hoyEnArgentina,
} from '../../scripts/campana-nacional/contrato.js';
import {
  ErrorDeUso,
  describirDestino,
  elegirDestino,
  leerOpciones,
} from '../../scripts/campana-nacional/opciones.js';

const HOY = '2026-10-09';

/** Todos los textos del contrato, para afirmar sobre el copy sin repetir campo por campo. */
function textos(c: ReturnType<typeof construirContratoNacional>): string[] {
  return [
    c.titulo,
    c.pregunta,
    c.proposito,
    c.participantes,
    c.responsable,
    c.devolucion,
    c.efecto,
    c.usoDatos,
    c.metodoLectura,
    ...c.temas,
    ...c.fases.flatMap((f) => [f.nombre, f.salida]),
  ];
}

describe('el contrato de la campaña nacional', () => {
  const contrato = construirContratoNacional(HOY);

  it('pasa el esquema que valida GET /campanas, y volver a parsearlo no lo cambia', () => {
    expect(contratoCampanaSchema.parse(contrato)).toEqual(contrato);
  });

  it('es de todo el país, lo atiende Juan Bravin y recibe por la web', () => {
    expect(contrato.territorios).toEqual([]);
    expect(contrato.responsable).toBe('Juan Bravin');
    expect(contrato.canales).toEqual(['web']);
    expect(contrato.institucion).toBe('');
  });

  it('tiene las dos etapas y la devolución en las fechas decididas', () => {
    expect(contrato.fases.map((f) => [f.nombre, f.fecha])).toEqual([
      ['Recibe aportes', '2027-02-28'],
      ['Lectura', '2027-03-14'],
    ]);
    expect(contrato.fechaDevolucion).toBe('2027-03-15');
    expect(CIERRE_RECEPCION).toBe('2027-02-28');
    expect(PRIMERA_DEVOLUCION).toBe('2027-03-15');
  });

  it('la primera etapa dice desde qué día recibe y las dos dicen su rango', () => {
    const [recibe, lectura] = contrato.fases;
    expect(recibe?.salida).toContain('desde el 9 de octubre de 2026 hasta el 28 de febrero de 2027');
    expect(lectura?.salida).toContain('del 1 al 14 de marzo de 2027');
    expect(construirContratoNacional('2026-12-01').fases[0]?.salida).toContain(
      'desde el 1 de diciembre de 2026',
    );
  });

  it('dice que la campaña sigue después de la primera devolución, con una cada tres meses', () => {
    expect(contrato.devolucion).toContain('15 de marzo de 2027');
    expect(contrato.devolucion).toMatch(/sigue abierta/);
    expect(contrato.devolucion).toMatch(/cada tres meses se abre una edición nueva/);
    expect(contrato.devolucion).toMatch(/devolución nueva/);
  });

  it('la devolución declara su alcance: qué cuenta, sus límites, a qué se conecta y que no promete', () => {
    const d = contrato.devolucion;
    expect(d).toMatch(/por tema y por lugar/);
    expect(d).toMatch(/cuenta aportes y no personas/);
    expect(d).toMatch(/no prueba nada/);
    expect(d).toMatch(/fichas de la campaña/);
    expect(d).toMatch(/PLANes de ¡BASTA!/);
    expect(d).toMatch(/No promete resultados ni compromete al Estado/);
    expect(d).toMatch(/nunca publica los nombres de quienes aportaron/);
  });

  it('usa a lo sumo ocho temas distintos, todos del catálogo de aportes', () => {
    expect(contrato.temas.length).toBeLessThanOrEqual(8);
    expect(new Set(contrato.temas).size).toBe(contrato.temas.length);
    expect(contrato.temas).toEqual([...TEMAS_CAMPANA_NACIONAL]);
  });

  it('escribe «¡BASTA!» siempre con los signos', () => {
    for (const t of textos(contrato)) expect(t).not.toMatch(/(?<!¡)\bBASTA\b/);
  });

  it('respeta el glosario y no usa la jerga que el informe del 9/10 sacó de la interfaz', () => {
    const jerga = /\b(señal(es)?|contratos?|ámbitos?|convocatorias?|reflexi(ón|ones)|relatos?)\b/i;
    for (const t of textos(contrato)) expect(t).not.toMatch(jerga);
  });

  it('no usa el molde «no es X, es Y» y le habla al lector de vos', () => {
    for (const t of textos(contrato)) {
      expect(t).not.toMatch(/\bno es\b[^.;]*[,;]\s*(sino|es)\b/i);
    }
    expect(contrato.pregunta).toContain('imaginás');
  });

  it('no deja que la primera etapa cierre antes de la siembra', () => {
    expect(() => construirContratoNacional('2027-03-01')).toThrow(/primera etapa cerró/);
    expect(construirContratoNacional(CIERRE_RECEPCION).fases[0]?.fecha).toBe(CIERRE_RECEPCION);
  });

  it('rechaza una fecha de hoy que no tiene forma de fecha', () => {
    expect(() => construirContratoNacional('9/10/2026')).toThrow(/AAAA-MM-DD/);
    expect(() => construirContratoNacional('2026-13-40')).toThrow(/AAAA-MM-DD/);
  });
});

describe('las fechas', () => {
  it('fechaLarga escribe el día sin cero y el mes en castellano', () => {
    expect(fechaLarga('2027-03-15')).toBe('15 de marzo de 2027');
    expect(fechaLarga('2026-10-09')).toBe('9 de octubre de 2026');
    expect(() => fechaLarga('2026-1-9')).toThrow();
  });

  it('hoyEnArgentina cuenta el día en Buenos Aires, no en UTC', () => {
    // 02:30 UTC del 10/10 son las 23:30 del 9/10 en Buenos Aires (UTC-3).
    expect(hoyEnArgentina(new Date('2026-10-10T02:30:00Z'))).toBe('2026-10-09');
    expect(hoyEnArgentina(new Date('2026-10-10T03:00:00Z'))).toBe('2026-10-10');
  });
});

describe('las constantes de la siembra', () => {
  it('el slug es el de @v2/shared y el id_local es un uuid fijo', () => {
    expect(SLUG_CAMPANA_NACIONAL).toBe('mi-argentina-ideal');
    expect(ID_LOCAL_CAMPANA_NACIONAL).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
    );
  });
});

describe('la línea de comandos', () => {
  const local = 'postgresql://postgres@127.0.0.1:55440/basta_descartable_test';
  const remota = 'postgresql://neondb_owner:clave-secreta-123@ep-algo-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require';

  it('exige --url y --owner-username', () => {
    expect(() => leerOpciones(['--owner-username=juan'])).toThrow(/Falta --url/);
    expect(() => leerOpciones([`--url=${local}`])).toThrow(/Falta --owner-username/);
    expect(() => leerOpciones([`--url=${local}`, '--owner-username='])).toThrow(ErrorDeUso);
  });

  it('es en seco salvo que se pase --aplicar', () => {
    const seco = leerOpciones([`--url=${local}`, '--owner-username=juan']);
    expect(seco).toMatchObject({ username: 'juan', aplicar: false, produccion: false });
    const real = leerOpciones([`--url=${local}`, '--owner-username=juan', '--aplicar']);
    expect(real.aplicar).toBe(true);
  });

  it('rechaza una opción desconocida sin repetir lo que venía después del igual', () => {
    try {
      leerOpciones([`--url=${local}`, '--owner-username=juan', '--urll=postgres://u:clave-secreta@h/db']);
      expect.unreachable();
    } catch (e) {
      expect(e).toBeInstanceOf(ErrorDeUso);
      expect((e as Error).message).toContain('--urll');
      expect((e as Error).message).not.toContain('clave-secreta');
    }
  });

  it('solo acepta URLs de Postgres', () => {
    expect(() => leerOpciones(['--url=https://example.com/db', '--owner-username=juan'])).toThrow(
      /postgres/,
    );
    expect(() => leerOpciones(['--url=no-es-una-url', '--owner-username=juan'])).toThrow(ErrorDeUso);
  });

  it('una base de esta máquina no pide --produccion', () => {
    const { url, produccion } = leerOpciones([`--url=${local}`, '--owner-username=juan']);
    expect(elegirDestino(url, produccion)).toEqual({ tipo: 'local' });
  });

  it('una base remota se niega sin --produccion, ni siquiera para leer, y no muestra la clave', () => {
    const { url, produccion } = leerOpciones([`--url=${remota}`, '--owner-username=juan']);
    expect(() => elegirDestino(url, produccion)).toThrow(ErrorDeUso);
    try {
      elegirDestino(url, produccion);
    } catch (e) {
      expect((e as Error).message).toContain('ep-algo-pooler.us-east-2.aws.neon.tech');
      expect((e as Error).message).not.toContain('clave-secreta');
    }
  });

  it('una base remota con --produccion pasa', () => {
    const { url, produccion } = leerOpciones([`--url=${remota}`, '--owner-username=juan', '--produccion']);
    expect(elegirDestino(url, produccion)).toEqual({ tipo: 'remoto' });
  });

  it('un host que solo se parece a uno local sigue siendo remoto', () => {
    const { url, produccion } = leerOpciones([
      '--url=postgresql://u:p@localhost.ejemplo.com/db',
      '--owner-username=juan',
    ]);
    expect(() => elegirDestino(url, produccion)).toThrow(ErrorDeUso);
    const conArroba = leerOpciones([
      '--url=postgresql://localhost@ejemplo.com/db',
      '--owner-username=juan',
    ]);
    expect(() => elegirDestino(conArroba.url, conArroba.produccion)).toThrow(ErrorDeUso);
  });

  it('describe el destino con host y base, nunca con usuario ni clave', () => {
    const { url } = leerOpciones([`--url=${remota}`, '--owner-username=juan', '--produccion']);
    const descripcion = describirDestino(url);
    expect(descripcion).toEqual({ host: 'ep-algo-pooler.us-east-2.aws.neon.tech', base: 'neondb' });
    expect(JSON.stringify(descripcion)).not.toMatch(/clave-secreta|neondb_owner|sslmode/);
  });
});

describe('importar el script', () => {
  it('no corre la siembra ni toca el código de salida', async () => {
    const antes = process.exitCode;
    const modulo = await import('../../scripts/seed-campana-nacional.js');
    expect(process.exitCode).toBe(antes);
    expect(modulo.construirContratoNacional(HOY)).toEqual(construirContratoNacional(HOY));
  });
});

describe('el .env de producción', () => {
  it('ningún archivo de la siembra importa dotenv ni load-env', () => {
    const raiz = fileURLToPath(new URL('../../scripts/', import.meta.url));
    const archivos = [
      'seed-campana-nacional.ts',
      ...readdirSync(`${raiz}campana-nacional`).map((f) => `campana-nacional/${f}`),
    ];
    expect(archivos.length).toBeGreaterThanOrEqual(4);
    for (const a of archivos) {
      expect(readFileSync(`${raiz}${a}`, 'utf8'), a).not.toMatch(
        /from\s+['"][^'"]*(dotenv|load-env)|require\(\s*['"][^'"]*(dotenv|load-env)|import\s+['"][^'"]*(dotenv|load-env)/,
      );
    }
  });
});
