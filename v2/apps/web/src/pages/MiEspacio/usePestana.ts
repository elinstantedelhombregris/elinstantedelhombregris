import { useLocation, useSearch } from 'wouter';

export const PESTANAS = [
  { id: 'aportes', nombre: 'Mis aportes' },
  { id: 'sigo', nombre: 'Lo que sigo' },
  { id: 'borradores', nombre: 'Mis borradores' },
  { id: 'analisis', nombre: 'Mis análisis' },
  { id: 'avisos', nombre: 'Avisos' },
  { id: 'cuenta', nombre: 'Cuenta y datos' },
] as const;

export type IdPestana = (typeof PESTANAS)[number]['id'];

const RUTA = '/mi-espacio';

function esPestana(valor: string | null): valor is IdPestana {
  return PESTANAS.some((p) => p.id === valor);
}

/**
 * La pestaña vive en la dirección (`?pestana=`): se puede compartir con uno
 * mismo, recargar y volver con el botón de atrás. Lo desconocido cae en la
 * primera. Cambiar de pestaña reemplaza la entrada del historial en vez de
 * sumar una por cada clic.
 */
export function usePestana(): [IdPestana, (id: IdPestana) => void] {
  const search = useSearch();
  const [, navigate] = useLocation();
  const pedida = new URLSearchParams(search).get('pestana');
  const actual: IdPestana = esPestana(pedida) ? pedida : 'aportes';
  const elegir = (id: IdPestana) => {
    navigate(`${RUTA}?pestana=${id}`, { replace: true });
  };
  return [actual, elegir];
}
