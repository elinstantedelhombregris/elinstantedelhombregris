import { solicitudCapacidadSchema, type CapacidadPublica } from '@v2/shared';
import { useRef, useState } from 'react';
import { Link } from 'wouter';

import { CampoDato } from '../Fichas/cuaderno/CampoDato';

import { BotonPapel } from '~/components/papel/primitives';
import { ErrorOperacion } from '~/components/participacion/Elementos';
import { useOperacionCapacidad } from '~/lib/queries/capacidades';

export function SolicitarCapacidad({
  capacidad: c,
  fichaId,
}: {
  capacidad: CapacidadPublica;
  fichaId: string;
}) {
  const [v, setV] = useState({
    fichaId,
    cantidad: '',
    paraFecha: '',
    necesidad: '',
    compatibilidad: '',
  });
  const [acepta, setAcepta] = useState(false);
  const [error, setError] = useState('');
  const [aviso, setAviso] = useState('');
  const recibo = useRef(crypto.randomUUID());
  const op = useOperacionCapacidad();
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
    <details className="mt-6 border-t pt-5">
      <summary className="min-h-11 cursor-pointer font-semibold underline">
        Proponer una solicitud
      </summary>
      <p>
        La solicitud expresa tu aceptación de las condiciones. Quien ofrece debe aceptarla para
        reservar. La cercanía por sí sola no asegura que sirva para tu necesidad.
      </p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setAviso('');
          const r = solicitudCapacidadSchema.safeParse({
            ...v,
            fichaId: v.fichaId.trim().split('/fichas/').at(-1)?.split(/[?#]/)[0],
            cantidad:
              c.cantidad === null ? null : v.cantidad === '' ? undefined : Number(v.cantidad),
            aceptaCondiciones: acepta,
            idLocal: recibo.current,
          });
          if (!r.success) {
            setError(r.error.issues[0]?.message ?? 'Revisá los datos.');
            return;
          }
          setError('');
          op.mutate(
            { ruta: `/${c.id}/reservas`, cuerpo: r.data },
            {
              onSuccess: () => {
                recibo.current = crypto.randomUUID();
                setAviso(
                  'Solicitud enviada. La cantidad se reserva cuando la acepta quien ofrece.',
                );
                setV({ ...v, cantidad: '', necesidad: '', compatibilidad: '' });
                setAcepta(false);
              },
            },
          );
        }}
      >
        <fieldset disabled={op.isPending}>
          <Link href="/fichas" target="_blank" className="inline-flex min-h-11 underline">
            Buscar una ficha que editás
          </Link>
          {campo('fichaId', 'Enlace o identificador de la ficha que necesita esta capacidad')}
          {c.cantidad === null ? (
            <p className="mt-3">Cantidad por evaluar entre las partes.</p>
          ) : (
            campo('cantidad', `Cantidad solicitada (${c.unidad})`, 'number')
          )}
          {campo('paraFecha', 'Fecha acordable dentro del período (día UTC)', 'date')}
          {campo('necesidad', 'Para qué se necesita', 'largo')}
          {campo('compatibilidad', 'Por qué sirve y cómo cumplirías sus restricciones', 'largo')}
          <p className="mt-3 text-sm">
            Estos detalles solo los ven tu cuenta y quien ofrece. Evitá datos de salud, domicilios y
            contactos de otras personas.
          </p>
          <label className="mt-4 flex gap-3">
            <input
              type="checkbox"
              checked={acepta}
              onChange={(e) => {
                setAcepta(e.target.checked);
              }}
            />
            Revisé y acepto las condiciones de esta oferta.
          </label>
          <ErrorOperacion mensaje={error || op.error?.message} />
          <BotonPapel type="submit" className="mt-4">
            Enviar solicitud
          </BotonPapel>
        </fieldset>
        {aviso ? (
          <p role="status" className="mt-4">
            {aviso}
          </p>
        ) : null}
      </form>
    </details>
  );
}
