import { useState } from 'react';

import type { LugarMapa } from '~/pages/ElMapa/instrumento/BusquedaTerritorial';

/**
 * El lugar de un aporte, que sigue al lugar que se está mirando en el mapa.
 *
 * Antes se congelaba al abrir el panel: si la persona recorría otro lugar y
 * volvía a aportar, el aporte salía con el primero. Ahora, cuando el mapa pasa
 * a otro lugar —o a ninguno: «todo el país»—, el formulario lo toma, y `aviso`
 * lo dice si ya había uno. Elegir un lugar a mano (`elegir`) sigue mandando
 * hasta que el mapa cambie. Quien lo usa se ocupa de no pasar un `null`
 * transitorio mientras el mapa todavía está buscando el lugar.
 */
export function useLugarSincronizado(delMapa: LugarMapa | null) {
  const [lugar, setLugar] = useState<LugarMapa | null>(delMapa);
  const [visto, setVisto] = useState<number | null>(delMapa?.id ?? null);
  const [aviso, setAviso] = useState<string | null>(null);
  if ((delMapa?.id ?? null) !== visto) {
    setVisto(delMapa?.id ?? null);
    setLugar(delMapa);
    // Solo avisa si había un lugar antes: la primera vez que llega no cambió nada.
    if (visto !== null)
      setAviso(
        delMapa
          ? `Cambiaste de lugar: ahora es ${delMapa.name}.`
          : 'Cambiaste de lugar: ahora es todo el país.',
      );
  }
  const elegir = (siguiente: LugarMapa | null) => {
    setLugar(siguiente);
    setAviso(null);
  };
  return { lugar, elegir, aviso };
}
