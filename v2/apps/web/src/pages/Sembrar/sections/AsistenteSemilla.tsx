import { useRef, useState } from 'react';

import { LARGO_MAXIMO, PASOS_SEMILLA, type SemillaGuardada } from '../sembrar-data';

import { BotonPapel } from '~/components/papel/primitives';
import { ApiError } from '~/lib/api';
import { despertar } from '~/lib/despertar';
import { usePlantarSemilla } from '~/lib/queries/semillas';

interface AsistenteSemillaProps {
  onPlantada: (semilla: SemillaGuardada) => void;
}

/**
 * §2 de la spec — la máquina de estados del asistente (stepper §5,
 * enmienda de esta página). Tres frases, volver sin perder nada,
 * despertar() en el primer avance, POST al final.
 */
export function AsistenteSemilla({ onPlantada }: AsistenteSemillaProps) {
  const [paso, setPaso] = useState(0);
  const [frases, setFrases] = useState<string[]>(['', '', '']);
  const desperto = useRef(false);
  const tituloRef = useRef<HTMLHeadingElement>(null);
  const plantar = usePlantarSemilla();

  const actual = PASOS_SEMILLA[paso];
  if (!actual) return null;
  const texto = frases[paso] ?? '';
  const valido = texto.trim().length > 0;
  const ultimo = paso === PASOS_SEMILLA.length - 1;

  const enfocarTitulo = () => {
    queueMicrotask(() => {
      tituloRef.current?.focus();
    });
  };

  const actualizarTexto = (valor: string) => {
    setFrases((prev) => {
      const next = [...prev];
      next[paso] = valor;
      return next;
    });
  };

  const retroceder = () => {
    if (paso === 0) return;
    setPaso(paso - 1);
    enfocarTitulo();
  };

  const avanzar = () => {
    if (!valido || plantar.isPending) return;
    if (!desperto.current) {
      desperto.current = true;
      despertar(); // §10.7 — primer paso del asistente (enmienda 2)
    }
    if (!ultimo) {
      setPaso(paso + 1);
      enfocarTitulo();
      return;
    }
    const [basta = '', sueno = '', compromiso = ''] = frases.map((f) => f.trim());
    plantar.mutate(
      { basta, sueno, compromiso },
      {
        onSuccess: ({ id, createdAt }) => {
          onPlantada({ id, fecha: createdAt, basta, sueno, compromiso });
        },
      },
    );
  };

  const errorMensaje = plantar.isError
    ? plantar.error instanceof ApiError && plantar.error.code === 'RATE_LIMITED'
      ? plantar.error.message
      : 'Esto se rompió. Lo decimos porque publicamos todo. Probá de nuevo.'
    : null;

  return (
    <div>
      <div aria-hidden className="mb-8 flex gap-2">
        {PASOS_SEMILLA.map((p, i) => (
          <div
            key={p.campo}
            className={`h-1 flex-1 transition-colors duration-300 ${
              i <= paso ? 'bg-violeta' : 'bg-papel-borde'
            }`}
          />
        ))}
      </div>

      <div className="border-tinta bg-papel-crudo border p-10 max-[560px]:p-6">
        <p className="font-space text-tinta-50 mb-3 text-xs uppercase tracking-[0.14em]">
          Paso {paso + 1} de {PASOS_SEMILLA.length}
        </p>
        <h2
          ref={tituloRef}
          tabIndex={-1}
          id={`paso-${actual.campo}`}
          className="font-anton mb-3 text-[clamp(26px,3.4vw,40px)] leading-tight"
        >
          {actual.titulo}
        </h2>
        <p className="text-tinta-50 mb-5 text-[15px] leading-relaxed">{actual.guia}</p>

        <textarea
          rows={3}
          maxLength={LARGO_MAXIMO}
          aria-labelledby={`paso-${actual.campo}`}
          value={texto}
          placeholder={actual.placeholder}
          onChange={(e) => {
            actualizarTexto(e.target.value);
          }}
          className="border-tinta bg-papel text-tinta placeholder:text-tinta-50 w-full resize-y border p-4 text-[17px] leading-normal"
        />

        <div className="mt-5 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={retroceder}
            disabled={paso === 0}
            className="font-space text-tinta min-h-[44px] text-[13px] uppercase tracking-[0.08em] disabled:text-tinta-30 disabled:cursor-not-allowed"
          >
            ← Volver
          </button>
          <BotonPapel variant="tinta" disabled={!valido} loading={plantar.isPending} onClick={avanzar}>
            {ultimo ? 'Plantar mi semilla' : 'Siguiente →'}
          </BotonPapel>
        </div>

        {errorMensaje ? (
          <p role="alert" className="font-space text-sello mt-3 text-[11px]">
            {errorMensaje}
          </p>
        ) : null}
      </div>

      <p className="font-space text-tinta-30 mt-5 text-center text-[11px] uppercase tracking-[0.1em]">
        Anónimo si querés · Sin registro · Sin spam
      </p>
    </div>
  );
}
