import {
  leerDiseno,
  relojDeDiseno,
  serializarDiseno,
  type Diseno,
  type LecturaDeDiseno,
  type Pais,
} from '@v2/civic-core';

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

export function escribirDisenoEnHash(diseno: Diseno, pais: Pais): string {
  return `#${CLAVE}=${encodeURIComponent(JSON.stringify(serializarDiseno(diseno, pais)))}`;
}

/**
 * Lo que había en el hash, en tres estados que no se confunden.
 *
 * `'nada'` y `'roto'` son distintos y tienen que serlo: abrir la página sin
 * hash no merece un aviso, y abrir un link cortado por un cliente de mail sí.
 * Un `null` para los dos casos obligaría a inventar la diferencia en el que
 * llama, que es donde se pierde.
 */
type TraidoDelHash =
  | { readonly tipo: 'nada' }
  | { readonly tipo: 'roto' }
  | { readonly tipo: 'json'; readonly json: unknown };

function traerDelHash(hash: string): TraidoDelHash {
  const crudo = hash.startsWith('#') ? hash.slice(1) : hash;
  if (crudo === '') return { tipo: 'nada' };

  const parametros = new URLSearchParams(crudo);
  const valor = parametros.get(CLAVE);
  if (valor === null || valor === '') return { tipo: 'nada' };

  try {
    return { tipo: 'json', json: JSON.parse(valor) };
  } catch {
    return { tipo: 'roto' };
  }
}

/**
 * El reloj del país que trae el link, si trae alguno.
 *
 * Se lee **antes que el diseño y antes de armar el país**, y ése es el orden
 * que hace que un link sirva: `Pais` se construye con un reloj, su huella lo
 * incluye, y el escenario del link declara esa huella. Si la página inventa un
 * reloj nuevo en cada carga, la huella nunca coincide con la declarada y
 * `verificarPais` tira antes de la primera corrida — recargar mataba la
 * herramienta y compartir una configuración era imposible.
 *
 * `null` cuando el link no trae reloj (formato viejo) o cuando lo que trae no
 * es un instante: la página cae a `Date.now()` y `leerDiseno` lo dice.
 */
export function leerRelojDelHash(hash: string): number | null {
  const traido = traerDelHash(hash);
  return traido.tipo === 'json' ? relojDeDiseno(traido.json) : null;
}

/**
 * Lee el diseño del hash. Siempre devuelve algo: el default, con avisos.
 *
 * Los avisos no son decorativos —«este link venía con la semilla rota, la
 * reemplacé por la de fábrica»— porque un diseño que se abre distinto de como
 * se compartió y no lo dice es peor que uno que no se abre.
 */
export function leerDisenoDelHash(hash: string, base: Diseno): LecturaDeDiseno {
  const traido = traerDelHash(hash);
  switch (traido.tipo) {
    case 'nada':
      return { diseno: base, avisos: [] };
    case 'roto':
      return {
        diseno: base,
        avisos: [
          'El link traía un diseño que no se pudo leer —probablemente se cortó al copiarlo—, así ' +
            'que se abrió el de fábrica.',
        ],
      };
    case 'json':
      return leerDiseno(traido.json, base);
  }
}
