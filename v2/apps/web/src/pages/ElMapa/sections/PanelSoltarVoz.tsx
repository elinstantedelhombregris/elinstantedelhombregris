import { CONSENTIMIENTO_ANTES_DE_ENVIAR, declaracionDeliberacionDe } from '@v2/shared';
import { useState, type FormEvent } from 'react';

import { PLACEHOLDER_NEUTRO, PLACEHOLDER_TIPO } from '../el-mapa-data';

import { SelectorPrecision, type PrecisionElegida } from './SelectorPrecision';
import { CamposPorTipo } from './soltar/CamposPorTipo';
import { PreguntaDeLaCasa } from './soltar/PreguntaDeLaCasa';
import { SelectorDeTipo } from './soltar/SelectorDeTipo';

import type { RespuestaDeVivienda } from '@v2/civic-core';

import { BotonPapel, Sello } from '~/components/papel/primitives';
import { ApiError } from '~/lib/api';
import { despertar } from '~/lib/despertar';
import { useProvincias, useSoltarVoz, type SoltarVozInput } from '~/lib/queries/open-data';
import { claseDe, type TipoSenal } from '~/lib/vocabulario';

/**
 * Panel «Soltá tu voz» — la conversión primaria del sitio.
 *
 * Anónimo por diseño (sin campo de nombre); provincia opcional y honesta.
 *
 * ## Qué cambió respecto de la versión de seis tipos
 *
 * Los seis de `TIPOS_VOZ` eran «los que la web sabía dibujar», no el canon. Son
 * **nueve en cuatro clases**, `valor` salió —un valor no tiene coordenada— y
 * con eso entran tres campos que la base exige y que ningún default puede
 * inventar: la pregunta de la casa (que habilita guardar dirección), la cesión
 * de licencia (sin ella el volcado publica la fila sin `texto`) y, según el
 * tipo, la fecha del compromiso, la fuente del saber o la periodicidad de la
 * práctica.
 *
 * ## Los textos de consentimiento se IMPORTAN
 *
 * `CONSENTIMIENTO_ANTES_DE_ENVIAR` y `declaracionDeliberacionDe` vienen de
 * `@v2/shared`. Copiarlos a mano acá rompe la guarda de
 * `consentimiento.test.ts`, que recorre las apps buscando fragmentos escritos a
 * mano y falla nombrando el archivo — y con razón: tres specs escribieron tres
 * redacciones del mismo permiso, y dos redacciones que pueden divergir van a
 * divergir.
 */
export function PanelSoltarVoz() {
  const [tipo, setTipo] = useState<TipoSenal | null>(null);
  const [texto, setTexto] = useState('');
  const [provinciaId, setProvinciaId] = useState('');
  const [casa, setCasa] = useState<RespuestaDeVivienda>('sinRespuesta');
  const [cede, setCede] = useState(false);
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
  const provincias = useProvincias();
  const soltar = useSoltarVoz();

  const cambiarExtra = (campo: string, valor: string) => {
    setExtra((p) => ({ ...p, [campo]: valor }));
  };

  /**
   * Lo que falta para poder enviar, dicho como una lista y no como un botón
   * gris sin explicación. Los tres primeros son del contrato; los de abajo son
   * CHECK de la base traducidos: si el formulario no los pide, el servidor
   * contesta 400 sobre un campo que la persona nunca vio.
   */
  const falta: string[] = [];
  if (tipo === null) falta.push('elegí de qué estás hablando');
  if (texto.trim().length === 0) falta.push('escribí algo');
  if (!cede) falta.push('marcá que cedés la licencia del texto');
  if (tipo !== null && claseDe(tipo) === 'acto' && extra.comprometidoPara === '') {
    falta.push('poné para cuándo');
  }
  if (tipo === 'saber' && extra.fuente.trim() === '') falta.push('decí cómo lo sabés');
  if (tipo === 'práctica' && extra.periodicidad === '') falta.push('decí cada cuánto');

  const valido = falta.length === 0;

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (tipo === null || !valido || soltar.isPending) return;

    const input: SoltarVozInput = {
      contrato: 'basta-senal/v1',
      // El uuid lo pone el cliente: **es la idempotencia**. Si el envío se
      // reintenta —red que se corta, doble tap— el servidor reconoce el mismo
      // id y devuelve la misma señal en vez de escribir dos.
      idLocal: crypto.randomUUID(),
      tipo,
      texto: texto.trim(),
      casa,
      cedeLicencia: cede,
    };
    if (provinciaId !== '') input.provinceId = Number(provinciaId);
    if (extra.titulo.trim() !== '') input.titulo = extra.titulo.trim();
    if (extra.fuente.trim() !== '') input.fuente = extra.fuente.trim();
    if (extra.comprometidoPara !== '') input.comprometidoPara = extra.comprometidoPara;
    if (extra.periodicidad !== '') input.periodicidad = extra.periodicidad;
    if (extra.sostenidaPor.trim() !== '') input.sostenidaPor = extra.sostenidaPor.trim();
    if (ubicacion.punto) {
      input.punto = ubicacion.punto;
      input.precisionPedida = ubicacion.precision;
    }

    soltar.mutate(input, {
      onSuccess: (respuesta) => {
        despertar();
        const nombre = (provincias.data ?? []).find((p) => String(p.id) === provinciaId)?.name ?? '';
        setRecibida(nombre);
        setEngrosado(respuesta.engrosado ?? respuesta.direccionRetirada ?? null);
        setTexto('');
        setExtra({
          titulo: '',
          fuente: '',
          comprometidoPara: '',
          periodicidad: '',
          sostenidaPor: '',
        });
        setUbicacion({ punto: null, precision: 'province' });
      },
    });
  };

  const errorMensaje = soltar.isError
    ? soltar.error instanceof ApiError && soltar.error.code === 'RATE_LIMITED'
      ? soltar.error.message
      : 'Esto se rompió. Lo decimos porque publicamos todo. Probá de nuevo.'
    : null;

  const deliberacion = tipo === null ? null : declaracionDeliberacionDe(tipo);

  return (
    <section aria-labelledby="soltar-titulo" className="border-tinta bg-papel border">
      <div className="border-tinta flex items-baseline justify-between gap-3 border-b px-[22px] py-4">
        <h2
          id="soltar-titulo"
          className="font-space text-[11px] font-bold uppercase tracking-[0.14em]"
        >
          Soltá tu voz
        </h2>
        <span className="font-space text-violeta text-[11px] font-bold uppercase tracking-[0.14em]">
          30 segundos
        </span>
      </div>
      <form onSubmit={onSubmit} className="p-[22px]" noValidate>
        <SelectorDeTipo valor={tipo} onElegir={setTipo} />

        <label htmlFor="voz-texto" className="sr-only">
          Tu voz
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

        {/* La nota de la deliberación sólo aparece en la clase `deseo`, y dice
            que todavía no existe. Un sueño hoy recibe adhesiones y nada más:
            prometer una deliberación que no está construida sería peor que el
            silencio. */}
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
            }}
            className="border-tinta bg-papel-crudo text-tinta font-space w-full appearance-none border p-3.5 text-[13px]"
          >
            <option value="">Toda la Argentina</option>
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
          Sin provincia tu voz cuenta igual, pero no cae en el mapa.
        </p>

        <SelectorPrecision valor={ubicacion} onCambio={setUbicacion} />

        <PreguntaDeLaCasa valor={casa} onCambio={setCasa} />

        <label
          htmlFor="voz-cesion"
          className="border-papel-borde mt-4 flex cursor-pointer items-start gap-2.5 border-t pt-3.5"
        >
          <input
            id="voz-cesion"
            type="checkbox"
            checked={cede}
            onChange={(e) => {
              setCede(e.target.checked);
            }}
            className="mt-0.5 shrink-0"
          />
          <span className="font-archivo text-tinta-75 text-[14px] leading-relaxed">
            {/* Las tres líneas van en su orden: de lo reversible a lo
                irreversible. Importadas, nunca transcritas. */}
            {CONSENTIMIENTO_ANTES_DE_ENVIAR.map((linea) => (
              <span key={linea} className="mb-1.5 block">
                {linea}
              </span>
            ))}
          </span>
        </label>

        <BotonPapel
          type="submit"
          variant="violeta"
          loading={soltar.isPending}
          disabled={!valido}
          className="mt-3.5 w-full"
        >
          Soltar la voz →
        </BotonPapel>

        {/* Qué falta, dicho. Un botón gris sin explicación es la forma más
            barata de perder a alguien que ya escribió. */}
        {valido || falta.length === 0 ? null : (
          <p className="font-space text-tinta-50 mt-2 text-[11px]">Falta: {falta.join(' · ')}.</p>
        )}

        {errorMensaje ? (
          <p role="alert" className="font-space text-sello mt-3 text-[11px]">
            {errorMensaje}
          </p>
        ) : null}

        {recibida !== null ? (
          <div role="status" className="mt-4 flex flex-wrap items-center gap-3.5">
            <Sello
              color="verde"
              rotate={-6}
              className="border-2 px-[11px] py-[7px] text-[11px] tracking-[0.14em]"
            >
              Recibida
            </Sello>
            <span className="font-space text-tinta-75 text-xs">
              {recibida === ''
                ? 'Tu voz quedó registrada. Ya cuenta con todas las demás.'
                : `Tu voz cayó en ${recibida}. Ya está en el mapa, a la vista de todos.`}
            </span>
            {/* Si el servidor engrosó la precisión o retiró parte de la
                dirección, se dice acá y no después: nadie se entera más tarde
                de que su punto se publicó distinto de lo que creía. */}
            {engrosado !== null ? (
              <p className="font-space text-tinta-75 w-full text-[11px] leading-relaxed">
                {engrosado}
              </p>
            ) : null}
          </div>
        ) : null}
      </form>
    </section>
  );
}
