import { PantallaPronto } from '@/components/juego/PantallaPronto';
import { ESTADOS_VACIOS } from '@/content';

/** Stub — G4 lo reemplaza por el álbum de constelaciones. */
export default function Album() {
  return <PantallaPronto titulo="Álbum" detalle={ESTADOS_VACIOS.album} />;
}
