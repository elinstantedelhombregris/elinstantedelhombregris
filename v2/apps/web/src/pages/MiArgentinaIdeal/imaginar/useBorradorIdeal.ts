import { useEffect, useRef, useState } from 'react';

import { quitarParametroDeLaUrl } from '~/lib/participacion/aportar';
import { borrarBorrador, guardarBorrador, leerBorradores } from '~/lib/participacion/borradores';
import { unirRespuestas } from '~/lib/participacion/texto-aporte';

/**
 * «Guardar borrador en este dispositivo», explícito (spec §3, P6), y retomarlo con
 * `?borrador=`. Usa el archivo local de siempre (`lib/participacion/borradores.ts`):
 * lo escrito va como primera de las tres frases, así Mi espacio lo lista igual, y un
 * borrador viejo de las tres preguntas se retoma con sus respuestas juntas.
 */
export function useBorradorIdeal({
  pedido,
  campanaId,
  edicion,
  alCargar,
}: {
  /** El `borrador` del enlace, si lo trae. */
  pedido: string | undefined;
  /** La campaña del enlace (slug o id), si nombró una. */
  campanaId: string | null;
  /** La edición que la persona vio al empezar, si el enlace nombró una campaña. */
  edicion: number | null;
  /** Recibe el texto del borrador retomado. Tiene que ser estable. */
  alCargar: (texto: string) => void;
}) {
  const identidad = useRef<string>(crypto.randomUUID());
  const [nota, setNota] = useState('');
  const [error, setError] = useState('');

  // Se carga una vez por identificador: que el enlace cambie por otra razón no pisa lo escrito.
  const cargado = useRef<string | null>(null);
  useEffect(() => {
    if (!pedido || cargado.current === pedido) return;
    cargado.current = pedido;
    void leerBorradores()
      .then((lista) => {
        const b = lista.find((v) => v.id === pedido);
        if (!b) {
          setError('No encontramos ese borrador en este dispositivo. Podés empezar uno nuevo.');
          return;
        }
        identidad.current = b.id;
        alCargar(unirRespuestas(b.frases));
        setNota('Retomaste un borrador que estaba guardado solo en este dispositivo.');
      })
      .catch((e: unknown) => {
        setError(e instanceof Error ? e.message : 'No pudimos leer el borrador.');
      });
  }, [pedido, alCargar]);

  const guardar = async (texto: string) => {
    setError('');
    if (!texto.trim()) {
      setError('Todavía no escribiste nada para guardar.');
      return;
    }
    try {
      await guardarBorrador({
        id: identidad.current,
        fecha: new Date().toISOString(),
        frases: [texto, '', ''],
        campanaId,
        edicion,
      });
      setNota('Tu borrador quedó en este dispositivo. No se publicó ni se subió a una cuenta.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No pudimos guardar el borrador.');
    }
  };

  /** Después de publicar, el borrador ya no hace falta. */
  const descartar = () => {
    void borrarBorrador(identidad.current).catch(() => undefined);
    quitarParametroDeLaUrl('borrador');
  };

  return { guardar, descartar, nota, error };
}
