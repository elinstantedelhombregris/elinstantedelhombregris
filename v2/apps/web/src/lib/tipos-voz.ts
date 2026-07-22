import type { TipoVoz } from '~/components/papel/primitives';

/**
 * Los 6 tipos de voz del sistema, en el orden canónico (README §7).
 * Fuente única — antes vivía duplicado en `pages/ElMapa/el-mapa-data.ts`
 * y `pages/ElMandatoVivo/mandato-regimen.ts` (sweep 2.3).
 */
export const TIPOS_VOZ: readonly TipoVoz[] = ['basta', 'sueño', 'necesidad', 'compromiso', 'recurso', 'valor'];
