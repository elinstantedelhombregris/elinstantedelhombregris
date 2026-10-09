import { BusquedaTerritorial, type LugarMapa } from '../ElMapa/instrumento/BusquedaTerritorial';

interface Props {
  /** `null` es «todo el país». */
  territorioId: number | null;
  nombre: string;
  elegir: (lugar: LugarMapa) => void;
  todoElPais: () => void;
}

/** El lugar de la ficha: el nombre elegido y el buscador, nunca el número del catálogo. */
export function LugarDeLaFicha({ territorioId, nombre, elegir, todoElPais }: Props) {
  return (
    <div className="bg-tinta text-oscuro-texto p-4">
      <p className="mb-3">{territorioId === null ? 'Lugar: todo el país.' : `Lugar: ${nombre}.`}</p>
      <BusquedaTerritorial onElegir={elegir} />
      <button className="mt-3 min-h-11 underline" type="button" onClick={todoElPais}>
        Usar todo el país
      </button>
    </div>
  );
}
