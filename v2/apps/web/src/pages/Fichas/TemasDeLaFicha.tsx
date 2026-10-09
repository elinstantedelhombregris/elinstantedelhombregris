import { useId } from 'react';

import { useTemasDelCatalogo } from './consultas';

import { cn } from '~/lib/utils';

/** El esquema de la ficha admite hasta ocho temas. */
export const MAX_TEMAS = 8;

const CHIP = 'font-space min-h-11 border px-4 py-2 text-xs transition-colors';

interface Props {
  /** Las claves elegidas; un tema escrito a mano en una ficha vieja entra tal cual. */
  valor: readonly string[];
  cambiar: (temas: string[]) => void;
}

/**
 * Los temas de una ficha, elegidos del catálogo que ofrece el servidor.
 *
 * Se guardan las claves y se muestran las etiquetas. Un tema que una ficha
 * vieja tiene escrito a mano, y que no está en el catálogo, se conserva como
 * un chip que se puede quitar.
 */
export function TemasDeLaFicha({ valor, cambiar }: Props) {
  const q = useTemasDelCatalogo();
  const motivoId = useId();
  const catalogo = q.data?.temas ?? [];
  const delCatalogo = new Set(catalogo.map((t) => t.clave));
  const aMano = q.isLoading ? [] : valor.filter((t) => !delCatalogo.has(t));
  const lleno = valor.length >= MAX_TEMAS;
  const alternar = (clave: string) => {
    cambiar(valor.includes(clave) ? valor.filter((t) => t !== clave) : [...valor, clave]);
  };
  return (
    <fieldset className="min-w-0">
      <legend className="font-bold">Temas</legend>
      <p className="text-tinta-50 mt-2 text-sm">
        Elegí hasta {MAX_TEMAS} temas que toque esta ficha. También podés no elegir ninguno.
      </p>
      {q.isLoading ? (
        <p role="status" className="mt-3 text-sm">
          Cargando los temas…
        </p>
      ) : null}
      {q.isError ? (
        <p role="status" className="text-tinta-75 mt-3 text-sm">
          No pudimos leer los temas. Podés guardar la ficha sin elegirlos.
        </p>
      ) : null}
      {!q.isLoading && !q.isError && catalogo.length === 0 ? (
        <p className="text-tinta-75 mt-3 text-sm">Todavía no hay temas para elegir.</p>
      ) : null}
      {aMano.length ? (
        <div className="mt-3">
          <p className="text-tinta-75 text-sm">Temas que esta ficha ya tenía escritos a mano:</p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {aMano.map((tema) => (
              <li key={tema}>
                <button
                  type="button"
                  className={cn(CHIP, 'border-tinta bg-tinta text-papel')}
                  aria-label={`Quitar el tema ${tema}`}
                  onClick={() => {
                    alternar(tema);
                  }}
                >
                  {tema} ×
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      {catalogo.length ? (
        <ul className="mt-3 flex flex-wrap gap-2">
          {catalogo.map((tema) => {
            const elegido = valor.includes(tema.clave);
            const bloqueado = lleno && !elegido;
            return (
              <li key={tema.clave}>
                <button
                  type="button"
                  aria-pressed={elegido}
                  disabled={bloqueado}
                  aria-describedby={bloqueado ? motivoId : undefined}
                  className={cn(
                    CHIP,
                    elegido
                      ? 'border-tinta bg-tinta text-papel'
                      : bloqueado
                        ? 'border-tinta-30 text-tinta-50 cursor-not-allowed'
                        : 'border-tinta text-tinta hover:bg-papel-crudo',
                  )}
                  onClick={() => {
                    alternar(tema.clave);
                  }}
                >
                  {tema.etiqueta}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
      {lleno ? (
        <p id={motivoId} className="text-tinta-75 mt-3 text-sm">
          Elegiste {MAX_TEMAS} temas, el máximo.
        </p>
      ) : null}
    </fieldset>
  );
}
