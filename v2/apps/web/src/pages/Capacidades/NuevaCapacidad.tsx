import { capacidadSchema } from '@v2/shared';
import { useRef, useState } from 'react';
import { useLocation } from 'wouter';

import { BusquedaTerritorial, type LugarMapa } from '../ElMapa/instrumento/BusquedaTerritorial';
import { CampoDato } from '../Fichas/cuaderno/CampoDato';

import { BotonPapel } from '~/components/papel/primitives';
import { ErrorOperacion } from '~/components/participacion/Elementos';
import { useOperacionCapacidad } from '~/lib/queries/capacidades';

export function NuevaCapacidad({ senalId }: { senalId: string }) {
  const [, navegar] = useLocation();
  const recibo = useRef(crypto.randomUUID());
  const op = useOperacionCapacidad();
  const [v, setV] = useState({
    titulo: '',
    tipo: 'tiempo',
    unidad: 'horas',
    cantidad: '',
    desde: '',
    hasta: '',
    zona: '',
    restricciones: '',
    firma: '',
  });
  const [lugar, setLugar] = useState<LugarMapa | null>(null);
  const [autorizo, setAutorizo] = useState(false);
  const [error, setError] = useState('');
  const campo = (
    key: keyof typeof v,
    etiqueta: string,
    tipo: 'texto' | 'date' | 'number' | 'largo' = 'texto',
  ) => (
    <CampoDato
      etiqueta={etiqueta}
      tipo={tipo}
      valor={v[key]}
      cambiar={(valor) => {
        setV({ ...v, [key]: valor });
      }}
    />
  );
  return (
    <form
      className="border-tinta mt-8 border-t-2 pt-6"
      onSubmit={(e) => {
        e.preventDefault();
        const r = capacidadSchema.safeParse({
          ...v,
          cantidad: v.cantidad === '' ? null : Number(v.cantidad),
          territorioId: lugar?.id ?? null,
          senalId,
          idLocal: recibo.current,
          autorizoOferta: autorizo,
        });
        if (!r.success) {
          setError(r.error.issues[0]?.message ?? 'Revisá los datos.');
          return;
        }
        setError('');
        op.mutate(
          { ruta: '', cuerpo: r.data },
          {
            onSuccess: (res) => {
              if (res.id) navegar(`/capacidades/${res.id}`);
            },
          },
        );
      }}
    >
      <h2 className="font-anton text-3xl">Ofrecer una capacidad concreta</h2>
      <p className="mt-3">
        La oferta queda ligada a tu aporte. Sus condiciones serán públicas y se conservarán para las
        reservas. Para cambiar cantidad o período, cerrá la oferta y creá otra.
      </p>
      <fieldset disabled={op.isPending}>
        {campo('titulo', 'Qué ofrecés')}
        <CampoDato
          etiqueta="Tipo de capacidad"
          valor={v.tipo}
          opciones={[
            ['tiempo', 'Tiempo'],
            ['espacio', 'Espacio'],
            ['equipo', 'Equipo'],
            ['material', 'Material'],
            ['servicio', 'Servicio'],
          ]}
          cambiar={(tipo) => {
            setV({ ...v, tipo });
          }}
        />
        {campo('unidad', 'Unidad (horas, plazas, herramientas…)')}
        {campo('cantidad', 'Cantidad total del período (vacío si requiere evaluación)', 'number')}
        <p className="mt-2 text-sm">
          Usá cantidades enteras; para fracciones elegí una unidad menor, por ejemplo minutos. La
          cantidad cubre todo el período y no se renueva cada día. Un préstamo devuelto requiere una
          nueva oferta.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          {campo('desde', 'Disponible desde (día UTC)', 'date')}
          {campo('hasta', 'Disponible hasta (día UTC)', 'date')}
        </div>
        <div className="mt-5">
          <p className="mb-3">
            Territorio de servicio:{' '}
            {lugar?.name ?? 'Sin territorio del catálogo seleccionado; detallalo abajo.'}
          </p>
          <BusquedaTerritorial onElegir={setLugar} superficie="papel" />
          {lugar ? (
            <button
              type="button"
              className="min-h-11 underline"
              onClick={() => {
                setLugar(null);
              }}
            >
              Quitar territorio
            </button>
          ) : null}
        </div>
        {campo('zona', 'Dónde puede usarse, sin domicilios particulares')}
        {campo('restricciones', 'Horarios, accesibilidad, requisitos y restricciones', 'largo')}
        {campo('firma', 'Firma pública de quien ofrece o de la organización que autoriza')}
        <label className="mt-5 flex gap-3">
          <input
            type="checkbox"
            checked={autorizo}
            onChange={(e) => {
              setAutorizo(e.target.checked);
            }}
          />
          Confirmo que puedo ofrecer esta capacidad y que tengo autorización si represento a una
          organización.
        </label>
        <ErrorOperacion mensaje={error || op.error?.message} />
        <BotonPapel className="mt-5" type="submit">
          Publicar oferta
        </BotonPapel>
      </fieldset>
    </form>
  );
}
