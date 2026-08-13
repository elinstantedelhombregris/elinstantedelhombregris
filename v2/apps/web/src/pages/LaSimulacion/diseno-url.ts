import { leerDiseno, serializarDiseno, type Diseno, type LecturaDeDiseno } from '@v2/civic-core';

/**
 * El diseño en el hash — spec §8.7: el módulo **no guarda escenarios en el
 * servidor**. Lo citable vive en la URL y en un `.json` que se baja.
 *
 * La disciplina de lectura es la de `area-url.ts`, que ya resolvió esto una
 * vez: **parsear defensivo y devolver el default ante basura, nunca romper la
 * página**. Un link truncado por un cliente de mail o editado a mano no puede
 * dejar a alguien mirando una pantalla en blanco; abre el diseño por defecto y
 * dice qué no entendió. `leerDiseno` de `civic-core` hace ese trabajo y además
 * acota cada valor a su dominio declarado: acá sólo hay que llegar hasta el
 * JSON sin explotar en el camino.
 *
 * Se guarda como JSON escapado y no en base64 por el mismo motivo por el que el
 * bitset de mandatos se serializa como ceros y unos: un link roto tiene que
 * poder leerse de un vistazo. Un blob opaco no se depura, se descarta.
 */

const CLAVE = 'd';

export function escribirDisenoEnHash(diseno: Diseno): string {
  return `#${CLAVE}=${encodeURIComponent(JSON.stringify(serializarDiseno(diseno)))}`;
}

/**
 * Lee el diseño del hash. Siempre devuelve algo: el default, con avisos.
 *
 * Los avisos no son decorativos —«este link venía con la semilla rota, la
 * reemplacé por la de fábrica»— porque un diseño que se abre distinto de como
 * se compartió y no lo dice es peor que uno que no se abre.
 */
export function leerDisenoDelHash(hash: string, base: Diseno): LecturaDeDiseno {
  const crudo = hash.startsWith('#') ? hash.slice(1) : hash;
  if (crudo === '') return { diseno: base, avisos: [] };

  const parametros = new URLSearchParams(crudo);
  const valor = parametros.get(CLAVE);
  if (valor === null || valor === '') return { diseno: base, avisos: [] };

  let json: unknown;
  try {
    json = JSON.parse(valor);
  } catch {
    return {
      diseno: base,
      avisos: [
        'El link traía un diseño que no se pudo leer —probablemente se cortó al copiarlo—, así ' +
          'que se abrió el de fábrica.',
      ],
    };
  }

  return leerDiseno(json, base);
}
