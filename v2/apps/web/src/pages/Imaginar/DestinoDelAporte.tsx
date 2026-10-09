import { Link } from 'wouter';

import { FraseCampana } from './FraseCampana';

import type { ReactNode } from 'react';
import type { ContextoDeCampana } from '~/lib/participacion/useCampanaDeAporte';

import { Nota } from '~/components/participacion/Elementos';

/**
 * Antes de publicar: a dónde va el aporte.
 *
 * Con una campaña pedida por el enlace dice cuál y si recibe aportes; sin ella,
 * dice lo que va a pasar de verdad (la campaña nacional, o ninguna). Lo mismo
 * lo usan las tres preguntas y el aporte puntual.
 */
export function DestinoDelAporte({
  contexto,
  en = 'todo',
}: {
  contexto: ContextoDeCampana;
  /**
   * Las tres preguntas lo muestran en dos momentos: al empezar, si el enlace
   * trae una campaña (cambia la pregunta), y al revisar, si el aporte va a la
   * nacional por defecto (es lo que hay que saber antes de publicar).
   */
  en?: 'inicio' | 'revision' | 'todo';
}) {
  const { pedido, explicita, campana, destino, bloqueo, comprobando } = contexto;
  const pedida = explicita || pedido.problema !== null;
  if ((en === 'inicio' && !pedida) || (en === 'revision' && pedida)) return null;
  if (pedido.problema) return <AvisoDeCampana tipo="alert">{bloqueo}</AvisoDeCampana>;
  if (explicita) {
    if (!campana)
      return comprobando ? (
        <AvisoDeCampana tipo="status">Buscando la campaña…</AvisoDeCampana>
      ) : (
        <AvisoDeCampana tipo="alert">{bloqueo}</AvisoDeCampana>
      );
    const reglas = `/campanas/${campana.slug}${pedido.edicion ? `?edicion=${campana.revision}` : ''}`;
    return (
      <Nota>
        <p>
          Campaña: <strong>{campana.contrato.titulo}</strong> · edición {campana.revision}.{' '}
          {destino
            ? 'Tu aporte entra en esta campaña cuando lo publiques.'
            : 'Esta edición no recibe aportes ahora; tu texto queda con vos.'}
        </p>
        <Link
          href={reglas}
          className="text-violeta mt-2 inline-flex min-h-11 items-center underline"
        >
          Leer las reglas de la campaña y la devolución
        </Link>
      </Nota>
    );
  }
  if (comprobando) return null;
  return (
    <Nota>
      <FraseCampana campana={destino} momento="antes" />
    </Nota>
  );
}

function AvisoDeCampana({ tipo, children }: { tipo: 'alert' | 'status'; children: ReactNode }) {
  return (
    <Nota>
      <p role={tipo}>{children}</p>
    </Nota>
  );
}
