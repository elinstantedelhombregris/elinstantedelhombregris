/**
 * Paletas del Cielo (spec §3.3): el fondo migra del negro puro hacia
 * tintes de amanecer. Cada gradiente es [centro, borde] del radial que
 * pinta CieloCanvas — siempre oscuro, para que las estrellas manden.
 * Se compran con brasas (30–80); la Noche Pura viene con el cielo.
 */

export interface PaletaCielo {
  /** kebab-case estable — se persiste en settings y unlocks. */
  id: string;
  nombre: string;
  /** Una línea de voz propia para el álbum. */
  descripcion: string;
  /** Brasas; 0 = de fábrica, no se compra. */
  precio: number;
  /** [centro, borde] del gradiente radial del fondo del Cielo. */
  gradiente: readonly [string, string];
}

export const PALETAS: PaletaCielo[] = [
  {
    id: 'noche-pura',
    nombre: 'Noche Pura',
    descripcion: 'La noche honda de siempre: índigo de medianoche antes de todo.',
    precio: 0,
    gradiente: ['#131736', '#07070c'],
  },
  {
    id: 'madrugada',
    nombre: 'Madrugada',
    descripcion: 'Un azul hondo: la hora de los que no aflojan.',
    precio: 30,
    gradiente: ['#0f2048', '#070b14'],
  },
  {
    id: 'cenizas',
    nombre: 'Cenizas',
    descripcion: 'El gris tibio del fogón: acá hubo fuego, y va a haber más.',
    precio: 50,
    gradiente: ['#241b14', '#0c0a09'],
  },
  {
    id: 'aurora',
    nombre: 'Aurora',
    descripcion: 'El primer tinte del amanecer: la noche empieza a ceder.',
    precio: 80,
    gradiente: ['#311a44', '#0e0a16'],
  },
];

/** La Noche Pura: idéntica al fondo original del Cielo. */
export const PALETA_DEFAULT: PaletaCielo = PALETAS[0]!;

/** La paleta que corresponde al setting persistido (default: Noche Pura). */
export const paletaPorId = (id: string | null | undefined): PaletaCielo =>
  PALETAS.find((p) => p.id === id) ?? PALETA_DEFAULT;
