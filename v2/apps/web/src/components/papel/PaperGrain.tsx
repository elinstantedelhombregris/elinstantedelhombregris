/**
 * Grano de papel — overlay fijo sobre toda página papel (firma award §10.3).
 * SVG feTurbulence como data-uri, multiply al 5%: imperceptible de cerca,
 * cálido de lejos. Definido en index.css (.paper-grain).
 */
export function PaperGrain() {
  return <div aria-hidden className="paper-grain" />;
}
