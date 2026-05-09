/**
 * Open-data dataset catalog.
 *
 * Static, hand-curated list of the datasets the platform exposes.
 * The DatosAbiertos page renders this list; once a dataset goes live
 * the entry's `available` flips to `true` and `downloadUrl` points at
 * a snapshot.
 *
 * Adding a dataset:
 *   1. Append an entry here.
 *   2. Drop the snapshot file in apps/web/public/datasets/<id>.json
 *   3. Set `available: true` and `downloadUrl: '/datasets/<id>.json'`.
 */
export interface OpenDataset {
  id: string;
  title: string;
  description: string;
  format: string;
  licenseHint: string;
  available: boolean;
  downloadUrl?: string;
}

export const OPEN_DATASETS: OpenDataset[] = [
  {
    id: 'suenos',
    title: 'Sueños ciudadanos por provincia',
    description:
      'Cada sueño que la red registra, normalizado por provincia. Texto + categoría + fecha. Anonimizado.',
    format: 'JSON · CSV',
    licenseHint: 'CC0 — uso libre con atribución apreciada.',
    available: false,
  },
  {
    id: 'pulse',
    title: 'Señales de pulso (mandato vivo)',
    description:
      'Statements espontáneos de la ciudadanía clasificados por sentimiento + tema (cuando aplica).',
    format: 'JSON',
    licenseHint: 'CC0',
    available: false,
  },
  {
    id: 'civic',
    title: 'Perfiles cívicos agregados',
    description:
      'Distribución de arquetipos cívicos por provincia + cohorte temporal. Sin datos personales.',
    format: 'JSON',
    licenseHint: 'CC0',
    available: false,
  },
  {
    id: 'iniciativas',
    title: 'Iniciativas activas',
    description:
      'Listado público de iniciativas, sus PLANs asociados y métricas de actividad.',
    format: 'JSON',
    licenseHint: 'CC0',
    available: false,
  },
];
