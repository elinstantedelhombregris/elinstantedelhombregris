import { useState, type FormEvent } from 'react';

import { PLACEHOLDER_NEUTRO, PLACEHOLDER_TIPO, TIPOS_VOZ } from '../el-mapa-data';

import { BotonPapel, ChipTipo, Sello, type TipoVoz } from '~/components/papel/primitives';
import { ApiError } from '~/lib/api';
import { despertar } from '~/lib/despertar';
import { useProvincias, useSoltarVoz, type SoltarVozInput } from '~/lib/queries/open-data';

/**
 * Panel «Soltá tu voz» (§4 de la spec) — la conversión primaria del sitio.
 * Anónimo por diseño (sin campo de nombre); provincia opcional y honesta.
 * La interacción firma: 201 → sello RECIBIDA + despertar() (§10.7, «primera
 * voz soltada») + invalidación que hace caer el punto nuevo en el mapa.
 */
export function PanelSoltarVoz() {
  const [tipo, setTipo] = useState<TipoVoz | null>(null);
  const [texto, setTexto] = useState('');
  const [provinciaId, setProvinciaId] = useState('');
  /** null = sin enviar · '' = recibida sin provincia · nombre = recibida con provincia. */
  const [recibida, setRecibida] = useState<string | null>(null);
  const provincias = useProvincias();
  const soltar = useSoltarVoz();

  const valido = tipo !== null && texto.trim().length > 0;

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (tipo === null || !valido || soltar.isPending) return;
    const input: SoltarVozInput = { body: texto.trim(), category: tipo };
    if (provinciaId !== '') input.provinceId = Number(provinciaId);
    soltar.mutate(input, {
      onSuccess: () => {
        despertar();
        const nombre = (provincias.data ?? []).find((p) => String(p.id) === provinciaId)?.name ?? '';
        setRecibida(nombre);
        setTexto('');
      },
    });
  };

  const errorMensaje = soltar.isError
    ? soltar.error instanceof ApiError && soltar.error.code === 'RATE_LIMITED'
      ? soltar.error.message
      : 'Esto se rompió. Lo decimos porque publicamos todo. Probá de nuevo.'
    : null;

  return (
    <section aria-labelledby="soltar-titulo" className="border-tinta bg-papel border">
      <div className="border-tinta flex items-baseline justify-between gap-3 border-b px-[22px] py-4">
        <h2 id="soltar-titulo" className="font-space text-[11px] font-bold uppercase tracking-[0.14em]">
          Soltá tu voz
        </h2>
        <span className="font-space text-violeta text-[11px] font-bold uppercase tracking-[0.14em]">
          30 segundos
        </span>
      </div>
      <form onSubmit={onSubmit} className="p-[22px]" noValidate>
        <div role="group" aria-label="Tipo de voz" className="mb-4 flex flex-wrap gap-2">
          {TIPOS_VOZ.map((t) => (
            <button
              key={t}
              type="button"
              aria-pressed={tipo === t}
              onClick={() => {
                setTipo(t);
              }}
              className="min-h-[44px]"
            >
              <ChipTipo tipo={t} active={tipo === t} />
            </button>
          ))}
        </div>

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
        <p className="font-space text-tinta-50 mt-1.5 text-[10px]">
          Sin provincia tu voz cuenta igual, pero no cae en el mapa.
        </p>

        <BotonPapel type="submit" variant="violeta" loading={soltar.isPending} disabled={!valido} className="mt-3.5 w-full">
          Soltar la voz →
        </BotonPapel>

        {errorMensaje ? (
          <p role="alert" className="font-space text-sello mt-3 text-[11px]">
            {errorMensaje}
          </p>
        ) : null}

        {recibida !== null ? (
          <div role="status" className="mt-4 flex flex-wrap items-center gap-3.5">
            <Sello color="verde" rotate={-6} className="border-2 px-[11px] py-[7px] text-[11px] tracking-[0.14em]">
              Recibida
            </Sello>
            <span className="font-space text-tinta-75 text-xs">
              {recibida === ''
                ? 'Tu voz quedó registrada. Ya cuenta con todas las demás.'
                : `Tu voz cayó en ${recibida}. Ya está en el mapa, a la vista de todos.`}
            </span>
          </div>
        ) : null}
      </form>
    </section>
  );
}
