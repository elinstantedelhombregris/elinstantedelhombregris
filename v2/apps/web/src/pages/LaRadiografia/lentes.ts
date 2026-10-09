import type { NodoDibujable } from './constelacion-pintor';

export type LenteDelCielo = 'vinculos' | 'nucleos' | 'clases';
/**
 * Las tres vistas del cielo. El título es lo que se ve en el botón y lo que
 * anuncia el lector de pantalla: el mismo texto (WCAG 2.5.3). Los identificadores
 * (`vinculos`, `nucleos`, `clases`) son de código y no se muestran.
 */
export const LENTES_DEL_CIELO = [
  {
    id: 'vinculos',
    titulo: 'Líneas',
    entrada: 'Seguí qué aportes se parecen.',
    lectura:
      'Una línea une dos aportes cuyo texto se parece; la punteada, un vínculo que declaró una persona. Girar el cielo cambia la vista, no el dato.',
  },
  {
    id: 'nucleos',
    titulo: 'Grupos',
    entrada: 'Mirá qué queda junto al cambiar el nivel de parecido.',
    lectura:
      'Cada grupo junta aportes parecidos según el nivel de abajo. Dónde queda en pantalla no significa nada.',
  },
  {
    id: 'clases',
    titulo: 'Por tipo',
    entrada: 'Separá lo que hay que comprobar de lo que queremos diseñar.',
    lectura:
      'Cuatro columnas: lo que hay, lo que querés, lo que vas a hacer, lo que no sabés. Un deseo no se vuelve hecho porque se parezca a uno.',
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
    const clave = lente === 'clases' ? (n.clase ?? 'desconocida') : (n.nucleoId ?? 'sin-grupo');
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
  // Los aportes sin grupo quedan dispersos en el margen; nunca forman un grupo ficticio.
  return [
    ...agrupados,
    ...solas.map((n, i) => {
      const angulo = ((i + 0.5) * Math.PI * 2) / solas.length;
      return { ...n, x: Math.cos(angulo) * 1.04, y: Math.sin(angulo) * 0.73, z: 0 };
    }),
  ];
}
