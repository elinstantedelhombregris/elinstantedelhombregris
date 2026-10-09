import { useState } from 'react';

import { BusquedaTerritorial, type LugarMapa } from './BusquedaTerritorial';

import type { Exploracion } from './exploracion-url';

import { BotonPapel } from '~/components/papel/primitives';
import { TemaDelAporte } from '~/components/participacion/TemaDelAporte';
import { ESTADO_EN_CASTELLANO, TIPOS_SENAL } from '~/lib/vocabulario';

export function FiltrosExploracion({
  valor,
  cambiar,
  elegir,
}: {
  valor: Exploracion;
  cambiar: (valor: Exploracion) => void;
  elegir: (lugar: LugarMapa) => void;
}) {
  // Los selectores se pliegan detrás de un botón en todos los anchos: apilados
  // ocupaban la primera pantalla entera del teléfono y el mapa quedaba abajo del
  // pliegue, y en el escritorio dejarlos abiertos tampoco aportaba nada.
  const [abiertos, setAbiertos] = useState(false);
  const activos =
    [valor.tipo, valor.estado, valor.tema].filter(Boolean).length +
    (valor.rango === 'todo' ? 0 : 1);
  return (
    <div className="text-oscuro-texto border-oscuro-borde border-b p-4">
      <div className="flex flex-wrap items-end gap-4">
        <BusquedaTerritorial onElegir={elegir} />
        <BotonPapel
          type="button"
          variant="fantasma"
          surface="oscuro"
          aria-expanded={abiertos}
          aria-controls="filtros-exploracion"
          onClick={() => {
            setAbiertos(!abiertos);
          }}
        >
          {abiertos ? 'Ocultar filtros' : activos > 0 ? `Filtros (${String(activos)})` : 'Filtros'}
        </BotonPapel>
        <div
          id="filtros-exploracion"
          className={`${abiertos ? 'flex' : 'hidden'} basis-full flex-wrap items-end gap-4`}
        >
          <label className="text-xs">
            Período
            <select
              aria-label="Período de la consulta"
              value={valor.rango}
              onChange={(e) => {
                const rango = e.target.value;
                if (rango === '7d' || rango === '30d' || rango === 'todo')
                  cambiar({ ...valor, rango });
              }}
              className="bg-papel text-tinta border-oscuro-borde mt-1 block min-h-11 border px-3"
            >
              <option value="todo">Todo el período</option>
              <option value="7d">Últimos 7 días</option>
              <option value="30d">Últimos 30 días</option>
            </select>
          </label>
          <TemaDelAporte
            rotulo="Tema de los aportes"
            vacio="Todos los temas"
            valor={valor.tema ?? ''}
            cambiar={(tema) => {
              cambiar({ ...valor, tema });
            }}
          />
          <label className="text-xs">
            Tipo de aporte
            <select
              aria-label="Tipo de aporte"
              value={valor.tipo ?? ''}
              onChange={(e) => {
                cambiar({ ...valor, tipo: e.target.value });
              }}
              className="bg-papel text-tinta border-oscuro-borde mt-1 block min-h-11 border px-3"
            >
              <option value="">Todos los tipos</option>
              {TIPOS_SENAL.map((tipo) => (
                <option key={tipo} value={tipo}>
                  {tipo}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs">
            Estado
            <select
              aria-label="Estado del aporte"
              value={valor.estado ?? ''}
              onChange={(e) => {
                cambiar({ ...valor, estado: e.target.value });
              }}
              className="bg-papel text-tinta border-oscuro-borde mt-1 block min-h-11 border px-3"
            >
              <option value="">Todos los estados</option>
              {Object.entries(ESTADO_EN_CASTELLANO)
                .filter(([id]) => id !== 'retirada')
                .map(([id, nombre]) => (
                  <option key={id} value={id}>
                    {nombre}
                  </option>
                ))}
            </select>
          </label>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-sm">
        {/* El alcance del mapa («solo cuenta lo que se cargó con ubicación») lo
            dice la sección de arriba, visible en todos los anchos: acá solo se
            nombra el lugar, para no repetirlo en cada pantalla. */}
        <p>
          Lugar:{' '}
          <strong>
            {valor.lugarNombre ?? (valor.lugarId ? 'el lugar elegido' : 'todo el país')}
          </strong>
          .
        </p>
        {valor.lugarId || valor.tipo || valor.estado || valor.tema ? (
          <button
            type="button"
            className="min-h-11 underline"
            onClick={() => {
              cambiar({ modo: valor.modo, rango: 'todo' });
            }}
          >
            Limpiar filtros
          </button>
        ) : null}
      </div>
    </div>
  );
}
