import { useState } from 'react';

import type { LocationPrecision } from '@v2/civic-core';

import { cn } from '~/lib/utils';

/**
 * El paso de precisión (spec 2 §6, decisión D2).
 *
 * OPCIONAL Y SALTEABLE, y eso no es una concesión: los 30 segundos son la ley
 * de esta página. Sin tocar nada, el envío se comporta exactamente como antes
 * —a nivel provincia— y hay un test que lo afirma.
 *
 * El que quiere ser preciso puede: un pozo, un semáforo roto o un punto donde
 * se reparte algo no sirven de nada a 100 metros de distancia.
 */

export interface Punto {
  lat: number;
  lng: number;
}

export interface PrecisionElegida {
  punto: Punto | null;
  precision: LocationPrecision;
}

export interface SelectorPrecisionProps {
  valor: PrecisionElegida;
  onCambio: (valor: PrecisionElegida) => void;
}

/** Lo que se puede elegir una vez que hay un punto. */
const OPCIONES: { precision: LocationPrecision; etiqueta: string }[] = [
  { precision: 'exact', etiqueta: 'el punto exacto' },
  { precision: '100m', etiqueta: 'la cuadra' },
  { precision: '500m', etiqueta: 'unas cuadras' },
  { precision: 'neighborhood', etiqueta: 'el barrio' },
];

type EstadoGps = 'inactivo' | 'pidiendo' | 'negado' | 'sin-soporte';

export function SelectorPrecision({ valor, onCambio }: SelectorPrecisionProps) {
  const [gps, setGps] = useState<EstadoGps>('inactivo');

  const pedirUbicacion = () => {
    if (!('geolocation' in navigator)) {
      setGps('sin-soporte');
      return;
    }
    setGps('pidiendo');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGps('inactivo');
        onCambio({
          punto: { lat: pos.coords.latitude, lng: pos.coords.longitude },
          precision: valor.precision === 'province' ? 'exact' : valor.precision,
        });
      },
      () => {
        setGps('negado');
      },
      { enableHighAccuracy: true, timeout: 10_000 },
    );
  };

  const hayPunto = valor.punto !== null;

  return (
    <div className="mt-3.5">
      <span className="font-space text-tinta-75 mb-1.5 block text-[11px] uppercase tracking-[0.12em]">
        ¿Dónde exactamente? (opcional)
      </span>

      {hayPunto ? (
        <>
          <div role="group" aria-label="Qué tan preciso se publica" className="flex flex-wrap gap-1.5">
            {OPCIONES.map(({ precision, etiqueta }) => (
              <button
                key={precision}
                type="button"
                aria-pressed={valor.precision === precision}
                onClick={() => {
                  onCambio({ punto: valor.punto, precision });
                }}
                className={cn(
                  'font-space min-h-[36px] border px-3 text-[11px] uppercase tracking-[0.08em]',
                  valor.precision === precision
                    ? 'border-tinta bg-tinta text-papel'
                    : 'border-tinta text-tinta',
                )}
              >
                {etiqueta}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => {
              onCambio({ punto: null, precision: 'province' });
            }}
            className="font-space text-tinta-50 hover:text-tinta mt-2 text-[10px] uppercase tracking-[0.08em]"
          >
            quitar la ubicación
          </button>
        </>
      ) : (
        <button
          type="button"
          onClick={pedirUbicacion}
          disabled={gps === 'pidiendo'}
          className="border-tinta text-tinta font-space min-h-[44px] w-full border px-3.5 text-[12px] uppercase tracking-[0.08em]"
        >
          {gps === 'pidiendo' ? 'buscando…' : 'usar mi ubicación'}
        </button>
      )}

      <p className="font-archivo text-tinta-75 mt-1.5 text-[13px] leading-relaxed">
        {gps === 'negado'
          ? 'No nos diste permiso, y está perfecto. Tu voz cae igual en tu provincia.'
          : gps === 'sin-soporte'
            ? 'Tu navegador no comparte ubicación. Tu voz cae igual en tu provincia.'
            : hayPunto
              ? 'Se publica con la precisión que elijas, ni más ni menos.'
              : 'Sin esto tu voz cae en tu provincia, como siempre. Sirve para lo que necesita un lugar: un pozo, algo roto, un punto de encuentro.'}
      </p>
    </div>
  );
}
