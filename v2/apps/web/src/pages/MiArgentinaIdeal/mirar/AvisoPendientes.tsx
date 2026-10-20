/**
 * Si la red falló y las respuestas no llegaron después de reintentar, se dice:
 * nada se pierde en silencio (spec §4, «Sin cuenta, y sin perder respuestas»).
 */
export function AvisoPendientes({
  perdidas,
  onReintentar,
}: {
  perdidas: number;
  onReintentar: () => void;
}) {
  if (perdidas === 0) return null;
  return (
    <p
      role="alert"
      className="border-sello text-sello flex flex-wrap items-center gap-x-3 gap-y-1 border-[1.5px] px-3 py-2.5 text-[14.5px] leading-snug"
    >
      <span>
        {perdidas === 1
          ? 'Tu última respuesta no se guardó.'
          : `Tus últimas ${perdidas} respuestas no se guardaron.`}
      </span>
      <button
        type="button"
        onClick={onReintentar}
        className="font-space min-h-11 text-[12px] font-bold uppercase tracking-[0.08em] underline underline-offset-4"
      >
        Reintentar
      </button>
    </p>
  );
}
