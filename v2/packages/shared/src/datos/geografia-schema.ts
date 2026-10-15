import { PROVINCIAS_CANONICAS } from '@v2/civic-core';
import { z } from 'zod';

const punto = z.tuple([
  z.number().finite().min(-180).max(180),
  z.number().finite().min(-90).max(90),
]);
const anillo = z
  .array(punto)
  .min(4)
  .superRefine((a, ctx) => {
    const primero = a[0];
    const ultimo = a.at(-1);
    if (!primero || primero[0] !== ultimo?.[0] || primero[1] !== ultimo[1])
      ctx.addIssue({ code: 'custom', message: 'El anillo debe estar cerrado.' });
    const area = a.reduce((s, p, i) => {
      const q = a[i + 1];
      return q ? s + p[0] * q[1] - q[0] * p[1] : s;
    }, 0);
    if (Math.abs(area) < 1e-12)
      ctx.addIssue({ code: 'custom', message: 'El anillo tiene área nula.' });
  });
const poligono = z.array(anillo).min(1);
export const geometriaSchema = z.object({
  type: z.literal('FeatureCollection'),
  features: z
    .array(
      z.object({
        type: z.literal('Feature'),
        properties: z
          .object({ name: z.string().min(1), georefId: z.string().nullable() })
          .passthrough(),
        geometry: z.discriminatedUnion('type', [
          z.object({ type: z.literal('Polygon'), coordinates: poligono }),
          z.object({ type: z.literal('MultiPolygon'), coordinates: z.array(poligono).min(1) }),
        ]),
      }),
    )
    .min(1),
});
export const CAPAS_VERSIONADAS = ['provincias', 'departamentos', 'municipios'] as const;
export type CapaVersionada = (typeof CAPAS_VERSIONADAS)[number];
const DIGITOS = { provincias: 2, departamentos: 5, municipios: 6 };
const TECHO = { provincias: 650, departamentos: 1000, municipios: 1800 };

export function validarGeografia(texto: string, capa: CapaVersionada) {
  if (new TextEncoder().encode(texto).byteLength > TECHO[capa] * 1024)
    throw new Error(`La capa ${capa} supera el techo de peso.`);
  const datos = geometriaSchema.parse(JSON.parse(texto));
  const codigos = datos.features.flatMap((f) =>
    f.properties.georefId === null ? [] : [f.properties.georefId],
  );
  if (codigos.some((c) => !PROVINCIAS_CANONICAS.some((p) => p.georefId === c.slice(0, 2))))
    throw new Error('El código no corresponde a una provincia conocida.');
  if (
    capa === 'provincias' &&
    datos.features.some(
      (f) =>
        !PROVINCIAS_CANONICAS.some(
          (p) => p.georefId === f.properties.georefId && p.name === f.properties.name,
        ),
    )
  )
    throw new Error('El nombre y el código provincial no coinciden.');
  if (new Set(codigos).size !== codigos.length)
    throw new Error(`Hay códigos duplicados en ${capa}.`);
  if (codigos.some((c) => !new RegExp(`^\\d{${DIGITOS[capa]}}$`).test(c)))
    throw new Error(`Hay códigos inválidos en ${capa}.`);
  if (capa !== 'municipios' && codigos.length !== datos.features.length)
    throw new Error(`Faltan códigos en ${capa}.`);
  if (capa === 'provincias' && codigos.length !== 24)
    throw new Error('Se necesitan las 24 provincias.');
  return {
    datos,
    rasgos: datos.features.length,
    identificados: codigos.length,
    sinCodigo: datos.features.length - codigos.length,
  };
}
