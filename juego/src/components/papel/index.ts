/**
 * Kit Papel y Tinta — las 10 primitivas del cuaderno (spec §3:
 * docs/superpowers/specs/2026-07-21-juego-papel-y-tinta.md).
 * Punto de entrada único: `import { Kicker, TituloAnton, ... } from '@/components/papel'`.
 *
 * Los componentes viejos (GlassCard, AccentButton, SectionBadge,
 * DisplayText) siguen intactos en `@/components/ui` — las pantallas
 * migran a este kit en las tasks PT3–PT7.
 */

export { Kicker } from './Kicker';
export { TituloAnton } from './TituloAnton';
export { PapelCard } from './PapelCard';
export { BotonTinta } from './BotonTinta';
export { ChipTipo } from './ChipTipo';
export { Sello } from './Sello';
export { Palitos } from './Palitos';
export { FilaIndice } from './FilaIndice';
export { GranoPapel } from './GranoPapel';
export { ExpedienteNum } from './ExpedienteNum';
export { agruparPalitos, type GrupoPalitos } from './palitos-logica';
