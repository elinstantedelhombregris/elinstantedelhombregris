import { PROVINCIAS_REF } from '../provincias-ref';

import type { SenalConTipo } from '../useVistaMapa';
import type { EstadoMedido, Territorio, VozMedida } from '@v2/civic-core';
import type { ProvinciaApi } from '~/lib/queries/open-data';

/**
 * El puente entre lo que la web tiene y lo que el motor necesita.
 *
 * El id de territorio es el NOMBRE canónico de la provincia, no su id
 * numérico. No es capricho: el coroplético recorre las features del GeoJSON y
 * las indexa por nombre, así que usando el nombre el resultado del motor entra
 * directo al mapa sin una tabla de traducción más — y una traducción menos es
 * un lugar menos donde CABA se vuelva a llamar distinto (D-012).
 */

export function territoriosDesde(provincias: readonly ProvinciaApi[]): Territorio[] {
  const salida: Territorio[] = [];
  for (const p of provincias) {
    const ref = PROVINCIAS_REF[p.name];
    // Sin referencia no hay denominador. Inventarle una población plausible
    // sería exactamente la clase de número que el motor existe para no tener.
    if (ref === undefined) continue;
    salida.push({
      id: p.name,
      nombre: p.name,
      poblacion: ref.pob * 1000,
      km2: ref.km2 * 1000,
    });
  }
  return salida;
}

export function estadoMedidoDesde(
  senales: readonly SenalConTipo[],
  provincias: readonly ProvinciaApi[],
  ahora: number,
): EstadoMedido {
  const nombrePorId = new Map(provincias.map((p) => [p.id, p.name]));
  const voces: VozMedida[] = [];

  for (const s of senales) {
    if (s.provinceId === null) continue;
    const nombre = nombrePorId.get(s.provinceId);
    // Una voz sin territorio útil no se cuenta: meterla en un agregado sin
    // saber dónde cae la pondría en ningún lado y en todos a la vez.
    if (nombre === undefined || PROVINCIAS_REF[nombre] === undefined) continue;
    const fecha = Date.parse(s.createdAt);
    if (Number.isNaN(fecha)) continue;
    voces.push({ territorioId: nombre, tipo: s.tipoVoz, fecha });
  }

  return { voces, ahora };
}
