import { useDespierto } from '~/lib/despertar';

/**
 * Velo del despertar — firma award §10.7: el sitio entero llega en gris
 * (mix-blend saturation) y se enciende con la primera acción del usuario.
 */
export function DespertarVeil() {
  const despierto = useDespierto();

  return (
    <div
      aria-hidden
      data-testid="despertar-veil"
      className="bg-oscuro-meta pointer-events-none fixed inset-0 z-[99] mix-blend-saturation transition-opacity duration-[1400ms] ease-out"
      style={{ opacity: despierto ? 0 : 0.6 }}
    />
  );
}
