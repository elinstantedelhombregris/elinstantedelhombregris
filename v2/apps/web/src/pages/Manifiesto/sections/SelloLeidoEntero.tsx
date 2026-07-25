import { Sello } from '~/components/papel/primitives';

/**
 * Sello §10.5 — «manifiesto leído hasta el final → LEÍDO ENTERO». Verde,
 * como el VISTO del mandato (§2: verde = logrado). Efímero por decisión de
 * spec: no se guarda, no cuenta a nadie, no da XP y no se imprime — la
 * edición impresa es el documento, no la sesión.
 */
export function SelloLeidoEntero() {
  return (
    <div role="status" className="mt-8 flex flex-wrap items-center gap-4 print:hidden">
      <Sello color="verde" rotate={-4}>
        Leído entero
      </Sello>
      <span className="font-space text-tinta-50 text-xs">
        Llegaste al final. Ahora empieza la parte tuya.
      </span>
    </div>
  );
}
