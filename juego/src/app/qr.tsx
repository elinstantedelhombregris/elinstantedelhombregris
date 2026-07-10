import { PantallaPronto } from '@/components/juego/PantallaPronto';
import { ESTADOS_VACIOS } from '@/content';

/** Stub — G5 lo reemplaza por chispas y círculos cara a cara (QR). */
export default function Qr() {
  return <PantallaPronto titulo="Chispas y círculos" detalle={ESTADOS_VACIOS.circulo} />;
}
