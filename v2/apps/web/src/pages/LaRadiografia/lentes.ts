import type { NodoDibujable } from './constelacion-pintor';

export type LenteDelCielo = 'vinculos' | 'nucleos' | 'clases';
export const LENTES_DEL_CIELO = [
  {
    id: 'vinculos',
    titulo: 'Red de vínculos',
    entrada: 'Seguí las relaciones entre voces.',
    lectura:
      'La línea continua representa semejanza medida; la punteada, un vínculo declarado. El giro cambia la vista, no el dato.',
  },
  {
    id: 'nucleos',
    titulo: 'Islas de sentido',
    entrada: 'Mirá qué permanece junto al cambiar el umbral.',
    lectura:
      'Cada isla reúne una componente del grafo en este corte. La separación y el tamaño del espacio son acomodo visual, no una medida de distancia semántica.',
  },
  {
    id: 'clases',
    titulo: 'Hechos, deseos y acciones',
    entrada: 'Separá lo que debemos comprobar de lo que queremos diseñar.',
    lectura:
      'Las columnas ordenan por la clase declarada. Las relaciones siguen siendo las mismas: un deseo no se vuelve hecho porque se parezca a uno.',
  },
] as const;
const CLASES = ['deseo', 'hecho', 'acto', 'meta'];

/** Disposiciones de lectura, nunca PCA, t-SNE ni UMAP. Preservan IDs y relaciones. */
export function disponerNodos(
  nodos: readonly NodoDibujable[],
  lente: LenteDelCielo,
): NodoDibujable[] {
  if (lente === 'vinculos') return [...nodos];
  const grupos = new Map<string, NodoDibujable[]>();
  const solas: NodoDibujable[] = [];
  for (const n of nodos) {
    if (lente === 'nucleos' && n.nucleoId === null) {
      solas.push(n);
      continue;
    }
    const clave = lente === 'clases' ? (n.clase ?? 'desconocida') : (n.nucleoId ?? 'voces-solas');
    grupos.set(clave, [...(grupos.get(clave) ?? []), n]);
  }
  const claves = [...grupos.keys()].sort((a, b) =>
    lente === 'clases'
      ? (CLASES.includes(a) ? CLASES.indexOf(a) : 4) -
          (CLASES.includes(b) ? CLASES.indexOf(b) : 4) || a.localeCompare(b)
      : a.localeCompare(b),
  );
  const agrupados = claves.flatMap((clave, i) => {
    const miembros = grupos.get(clave) ?? [];
    const columnas = Math.ceil(Math.sqrt(claves.length));
    const fila = Math.floor(i / columnas);
    const col = i % columnas;
    const filas = Math.ceil(claves.length / columnas);
    const centroX =
      lente === 'clases'
        ? -1.05 + ((i + 0.5) * 2.1) / claves.length
        : -0.95 + ((col + 0.5) * 1.9) / columnas;
    const centroY = lente === 'clases' ? 0 : 0.8 - ((fila + 0.5) * 1.6) / filas;
    return miembros
      .sort((a, b) => a.id.localeCompare(b.id))
      .map((n, j) => {
        const angulo = j * Math.PI * (3 - Math.sqrt(5));
        const radio = Math.sqrt((j + 0.5) / miembros.length);
        const ancho = lente === 'clases' ? Math.min(0.2, 0.82 / claves.length) : 0.65 / columnas;
        const alto = lente === 'clases' ? 0.75 : 0.55 / filas;
        return {
          ...n,
          x: centroX + Math.cos(angulo) * radio * ancho,
          y: centroY + Math.sin(angulo) * radio * alto,
          z: 0,
        };
      });
  });
  // Las voces sin núcleo quedan dispersas en el margen; nunca forman una isla ficticia.
  return [
    ...agrupados,
    ...solas.map((n, i) => {
      const angulo = ((i + 0.5) * Math.PI * 2) / solas.length;
      return { ...n, x: Math.cos(angulo) * 1.04, y: Math.sin(angulo) * 0.73, z: 0 };
    }),
  ];
}
