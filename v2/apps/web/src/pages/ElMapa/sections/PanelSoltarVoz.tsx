import { declaracionDeliberacionDe } from '@v2/shared';
import { useEffect, useRef, useState, type FormEvent } from 'react';

import { FraseCampana } from '../../Imaginar/FraseCampana';
import { PLACEHOLDER_NEUTRO, PLACEHOLDER_TIPO } from '../el-mapa-data';

import { SelectorPrecision, type PrecisionElegida } from './SelectorPrecision';
import { CamposPorTipo } from './soltar/CamposPorTipo';
import { ConsentimientoVoz } from './soltar/ConsentimientoVoz';
import { PreguntaDeLaCasa } from './soltar/PreguntaDeLaCasa';
import { SelectorDeTipo } from './soltar/SelectorDeTipo';

import type { CampanaDeAporte } from '../../Imaginar/FraseCampana';
import type { LugarMapa } from '../instrumento/BusquedaTerritorial';
import type { RespuestaDeVivienda } from '@v2/civic-core';

import { Sello } from '~/components/papel/primitives';
import { BotonConMotivo } from '~/components/participacion/BotonConMotivo';
import { despertar } from '~/lib/despertar';
import { useProvincias, type SoltarVozInput, type VozSoltada } from '~/lib/queries/open-data';
import { claseDe, type TipoSenal } from '~/lib/vocabulario';

export interface PublicacionVoz {
  /** `campana` es aquella en la que entró el aporte, o `null` si entró sin campaña. */
  enviar: (
    input: SoltarVozInput,
    onSuccess: (respuesta: VozSoltada, campana: CampanaDeAporte | null) => void,
  ) => void;
  pendiente: boolean;
  error: string | null;
  /** Por qué la campaña no recibe el aporte ahora; bloquea el botón y lo explica. */
  bloqueo?: string | null;
}

/**
 * El aporte puntual: nueve tipos, lugar y precisión. La publicación (campaña,
 * cuenta, reintentos) la resuelve quien lo monta; acá viven el formulario y el
 * recibo. El lugar sigue al que se mira en el mapa.
 */
export function PanelSoltarVoz({
  contexto,
  publicacion,
}: {
  contexto?: LugarMapa | null;
  publicacion: PublicacionVoz;
}) {
  const [localidad, setLocalidad] = useState<LugarMapa | null>(null);
  const [tipo, setTipo] = useState<TipoSenal | null>(null);
  const [texto, setTexto] = useState('');
  const [provinciaId, setProvinciaId] = useState('');
  // Cuando el mapa pasa a otro lugar —o a ninguno—, el formulario lo toma. Se
  // mira el id y no el objeto: el mismo lugar llega dos veces con identidades
  // distintas, y un lugar que la persona eligió a mano no se pisa por eso.
  const lugarAplicado = useRef<number | null>(null);
  useEffect(() => {
    const id = contexto?.id ?? null;
    if (id === lugarAplicado.current) return;
    lugarAplicado.current = id;
    setProvinciaId(contexto ? String(contexto.provinceId) : '');
    setLocalidad(
      contexto && (contexto.level === 'locality' || contexto.level === 'settlement')
        ? contexto
        : null,
    );
  }, [contexto]);
  const [casa, setCasa] = useState<RespuestaDeVivienda>('sinRespuesta');
  const [cede, setCede] = useState(false);
  const [publicar, setPublicar] = useState(false);
  const intento = useRef<{ cuerpo: string; id: string } | null>(null);
  const [reciboId, setReciboId] = useState<string | null>(null);
  const [extra, setExtra] = useState({
    titulo: '',
    fuente: '',
    comprometidoPara: '',
    periodicidad: '',
    sostenidaPor: '',
  });
  const [ubicacion, setUbicacion] = useState<PrecisionElegida>({
    punto: null,
    precision: 'province',
  });
  const [recibida, setRecibida] = useState<string | null>(null);
  const [engrosado, setEngrosado] = useState<string | null>(null);
  const [campanaRecibida, setCampanaRecibida] = useState<CampanaDeAporte | null>(null);
  const provincias = useProvincias();
  const pendiente = publicacion.pendiente;

  const cambiarExtra = (campo: string, valor: string) => {
    setExtra((p) => ({ ...p, [campo]: valor }));
  };

  /** Falta visible antes de enviar, incluidas las condiciones del tipo elegido. */
  const falta: string[] = [];
  if (tipo === null) falta.push('elegí de qué estás hablando');
  if (texto.trim().length === 0) falta.push('escribí algo');
  if (!publicar) falta.push('marcá que querés publicarla');
  if (tipo !== null && claseDe(tipo) === 'acto' && extra.comprometidoPara === '') {
    falta.push('poné para cuándo');
  }
  if (tipo === 'saber' && extra.fuente.trim() === '') falta.push('decí cómo lo sabés');
  if (tipo === 'práctica' && extra.periodicidad === '') falta.push('decí cada cuánto');

  const valido = falta.length === 0;
  const bloqueo = publicacion.bloqueo ?? null;
  const motivo = valido ? bloqueo : `Falta: ${falta.join(' · ')}.`;

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (tipo === null || !valido || pendiente || bloqueo) return;

    const input: SoltarVozInput = {
      contrato: 'basta-senal/v1',
      // El mismo cuerpo conserva UUID al reintentar.
      idLocal: crypto.randomUUID(),
      tipo,
      texto: texto.trim(),
      casa,
      cedeLicencia: cede,
    };
    if (provinciaId !== '') input.provinceId = Number(provinciaId);
    if (localidad) input.cityId = localidad.id;
    if (extra.titulo.trim() !== '') input.titulo = extra.titulo.trim();
    if (extra.fuente.trim() !== '') input.fuente = extra.fuente.trim();
    if (extra.comprometidoPara !== '') input.comprometidoPara = extra.comprometidoPara;
    if (extra.periodicidad !== '') input.periodicidad = extra.periodicidad;
    if (extra.sostenidaPor.trim() !== '') input.sostenidaPor = extra.sostenidaPor.trim();
    if (ubicacion.punto) {
      input.punto = ubicacion.punto;
      input.precisionPedida = ubicacion.precision;
    }

    const cuerpo = JSON.stringify({ ...input, idLocal: undefined });
    if (intento.current?.cuerpo === cuerpo) input.idLocal = intento.current.id;
    else intento.current = { cuerpo, id: input.idLocal };

    const confirmar = (respuesta: VozSoltada, campana: CampanaDeAporte | null) => {
      despertar();
      intento.current = null;
      setReciboId(respuesta.idPublico);
      const nombre = (provincias.data ?? []).find((p) => String(p.id) === provinciaId)?.name ?? '';
      setRecibida(nombre);
      setEngrosado(respuesta.engrosado ?? respuesta.direccionRetirada ?? null);
      setCampanaRecibida(campana);
      // Lo que ya salió no se arrastra al aporte siguiente: ni el texto, ni el
      // tipo, ni la respuesta sobre la casa, ni —sobre todo— los permisos. La
      // publicación es irrevocable hacia atrás y no puede quedar tildada de antemano.
      setTexto('');
      setTipo(null);
      setCasa('sinRespuesta');
      setPublicar(false);
      setCede(false);
      setExtra({
        titulo: '',
        fuente: '',
        comprometidoPara: '',
        periodicidad: '',
        sostenidaPor: '',
      });
      setUbicacion({ punto: null, precision: 'province' });
    };
    publicacion.enviar(input, confirmar);
  };

  const errorMensaje = publicacion.error;

  const deliberacion = tipo === null ? null : declaracionDeliberacionDe(tipo);

  return (
    <section aria-labelledby="soltar-titulo" className="border-tinta bg-papel border">
      <div className="border-tinta flex items-baseline justify-between gap-3 border-b px-[22px] py-4">
        <h3
          id="soltar-titulo"
          className="font-space text-[11px] font-bold uppercase tracking-[0.14em]"
        >
          Un aporte puntual
        </h3>
        <span className="font-space text-violeta text-[11px] font-bold uppercase tracking-[0.14em]">
          A tu ritmo
        </span>
      </div>
      <form onSubmit={onSubmit} className="p-[22px]" noValidate>
        <SelectorDeTipo valor={tipo} onElegir={setTipo} />

        <label htmlFor="voz-texto" className="sr-only">
          Tu aporte
        </label>
        <textarea
          id="voz-texto"
          rows={3}
          maxLength={2000}
          value={texto}
          onChange={(e) => {
            setTexto(e.target.value);
          }}
          placeholder={tipo ? PLACEHOLDER_TIPO[tipo] : PLACEHOLDER_NEUTRO}
          className="border-tinta bg-papel-crudo text-tinta placeholder:text-tinta-50 w-full resize-y border p-3.5 text-[15px] leading-normal"
        />

        {/* La declaración de cada tipo conserva la diferencia entre aporte y acuerdo. */}
        {deliberacion === null ? null : (
          <p className="border-violeta/40 text-tinta-75 mt-2.5 border-l-2 py-1 pl-3 text-[13px] leading-relaxed">
            {deliberacion}
          </p>
        )}

        {tipo === null ? null : (
          <CamposPorTipo
            tipo={tipo}
            titulo={extra.titulo}
            fuente={extra.fuente}
            comprometidoPara={extra.comprometidoPara}
            periodicidad={extra.periodicidad}
            sostenidaPor={extra.sostenidaPor}
            onCambio={cambiarExtra}
          />
        )}

        <label
          htmlFor="voz-provincia"
          className="font-space text-tinta-75 mb-1.5 mt-3.5 block text-[11px] uppercase tracking-[0.12em]"
        >
          ¿Desde dónde? (opcional)
        </label>
        <div className="relative">
          <select
            id="voz-provincia"
            value={provinciaId}
            onChange={(e) => {
              setProvinciaId(e.target.value);
              setLocalidad(null);
            }}
            className="border-tinta bg-papel-crudo text-tinta font-space w-full appearance-none border p-3.5 text-[13px]"
          >
            <option value="">Todo el país</option>
            {(provincias.data ?? []).map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <span
            aria-hidden
            className="font-space text-tinta-50 pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[11px]"
          >
            ▾
          </span>
        </div>
        <p className="font-archivo text-tinta-75 mt-1.5 text-[13px] leading-snug">
          Sin provincia tu aporte cuenta igual, pero no cae en el mapa.
        </p>

        {localidad ? (
          <p className="my-3 text-sm">
            Localidad del aporte: {localidad.name}.{' '}
            <button
              type="button"
              className="min-h-11 underline"
              onClick={() => {
                setLocalidad(null);
              }}
            >
              Usar solo provincia
            </button>
          </p>
        ) : null}
        <SelectorPrecision valor={ubicacion} onCambio={setUbicacion} />

        <PreguntaDeLaCasa valor={casa} onCambio={setCasa} />

        <ConsentimientoVoz
          publicar={publicar}
          cede={cede}
          setPublicar={setPublicar}
          setCede={setCede}
        />

        <div className="mt-3.5 flex flex-wrap gap-2">
          <BotonConMotivo type="submit" motivo={motivo} ocupado={pendiente} className="w-full">
            {pendiente ? 'Publicando tu aporte…' : 'Publicar mi aporte →'}
          </BotonConMotivo>
        </div>

        {errorMensaje ? (
          <p role="alert" className="font-space text-sello mt-3 text-[11px]">
            {errorMensaje}
          </p>
        ) : null}

        {reciboId && recibida !== null ? (
          <div role="status" className="mt-4 flex flex-wrap items-center gap-3.5">
            <Sello
              color="verde"
              rotate={-6}
              className="border-2 px-[11px] py-[7px] text-[11px] tracking-[0.14em]"
            >
              Recibido
            </Sello>
            <div className="font-space text-tinta-75 min-w-0 flex-1 text-xs leading-relaxed">
              <FraseCampana campana={campanaRecibida} />
              <p className="mt-2">
                {recibida === ''
                  ? 'No indicaste una provincia, así que cuenta pero no aparece en un lugar del mapa.'
                  : `Quedó en ${recibida}. Desde su página lo seguís o lo retirás.`}
              </p>
            </div>
            {/* El recibo explica los cambios de precisión autorizados. */}
            {engrosado !== null ? (
              <p className="font-space text-tinta-75 w-full text-[11px] leading-relaxed">
                {engrosado}
              </p>
            ) : null}
            <a className="block min-h-11 w-full underline" href={`/senal/${reciboId}`}>
              Ver mi aporte y cómo sigue →
            </a>
          </div>
        ) : null}
      </form>
    </section>
  );
}
