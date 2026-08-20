import { Link } from 'wouter';

import type { ReactNode } from 'react';

/**
 * La gramática única de los estantes (spec 2026-08-20 §3): border-t-2 +
 * «§ 0N — nombre» mono + «ver todo →» a la derecha cuando el estante tiene
 * catálogo detrás. Los nombres son los labels de SECCIONES_BIBLIOTECA para
 * que header, fichero y página digan lo mismo. Es h2: el mojón accesible de
 * la sección — los títulos display de adentro bajan a h3.
 */
export interface EncabezadoEstanteProps {
  num: string;
  nombre: string;
  verTodo?: { href: string; label: string } | undefined;
  children?: ReactNode;
}

export function EncabezadoEstante({ num, nombre, verTodo, children }: EncabezadoEstanteProps) {
  return (
    <div className="border-tinta flex flex-wrap items-baseline justify-between gap-3 border-t-2 pb-2 pt-[22px]">
      <h2 className="font-space text-tinta-50 text-[11px] uppercase tracking-[0.16em]">
        <span className="text-tinta-30">§ {num} — </span>
        {nombre}
      </h2>
      {verTodo ? (
        <Link
          href={verTodo.href}
          className="font-space text-violeta text-xs font-bold uppercase tracking-[0.1em]"
        >
          {verTodo.label} →
        </Link>
      ) : (
        (children ?? null)
      )}
    </div>
  );
}
