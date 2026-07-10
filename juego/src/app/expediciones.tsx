import { PantallaPronto } from '@/components/juego/PantallaPronto';
import { ESTADOS_VACIOS } from '@/content';

/** Stub — G4 lo reemplaza por el panel de expediciones. */
export default function Expediciones() {
  return <PantallaPronto titulo="Expediciones" detalle={ESTADOS_VACIOS.expediciones} />;
}
