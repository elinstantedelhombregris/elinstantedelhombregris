import { useRoute } from 'wouter';

import { DetalleFicha } from './Fichas/DetalleFicha';
import { ListaFichas } from './Fichas/ListaFichas';
import { NuevaFicha } from './Fichas/NuevaFicha';

/** Las fichas: la lista, la ficha nueva y la ficha abierta comparten la plantilla de Campañas. */
export function Fichas() {
  const [nueva] = useRoute('/fichas/nueva');
  const [, parametros] = useRoute('/fichas/:id');
  if (nueva) return <NuevaFicha />;
  if (parametros?.id) return <DetalleFicha id={parametros.id} />;
  return <ListaFichas />;
}
