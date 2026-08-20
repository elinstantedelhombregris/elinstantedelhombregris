import { Link } from 'wouter';

import {
  BITACORA_DESTACADA,
  fechaLarga,
  HREF_BITACORA,
  HREF_MANIFIESTO,
  PRIMER_ENSAYO,
  ubicarEnsayo,
} from '../biblioteca-data';

import { findEnsayoBySlug } from '~/lib/ensayos-registry';
import { leerSenalador } from '~/lib/senalador';

interface Puerta {
  kicker: string;
  titulo: string;
  meta: string;
  href: string;
  cta: string;
}

const PUERTA_DE_CERO: Puerta = {
  kicker: '¿Venís de cero?',
  titulo: 'El manifiesto',
  meta: 'el espejo del movimiento',
  href: HREF_MANIFIESTO,
  cta: 'Leerlo',
};

/** La puerta del medio: retomar si hay señalador válido; si no, el eslabón 1. */
function puertaDePensar(): Puerta | null {
  const slug = leerSenalador();
  const guardado = slug !== null ? findEnsayoBySlug(slug) : undefined;
  const ubicacion = guardado ? ubicarEnsayo(guardado.slug) : null;
  if (guardado && ubicacion) {
    return {
      kicker: 'Estabas leyendo',
      titulo: `«${guardado.title}»`,
      meta: `Ciclo ${ubicacion.ciclo.romano} · ${String(ubicacion.posicion)} de ${String(ubicacion.total)}`,
      href: `/ensayos/${guardado.slug}`,
      cta: 'Retomar',
    };
  }
  if (!PRIMER_ENSAYO) return null;
  const arranque = ubicarEnsayo(PRIMER_ENSAYO.slug);
  const minutos =
    PRIMER_ENSAYO.readingMinutes > 0 ? ` · ${String(PRIMER_ENSAYO.readingMinutes)} min` : '';
  return {
    kicker: '¿Venís a pensar?',
    titulo: `«${PRIMER_ENSAYO.title}»`,
    meta: arranque ? `Ciclo ${arranque.ciclo.romano} · 01${minutos}` : `01${minutos}`,
    href: `/ensayos/${PRIMER_ENSAYO.slug}`,
    cta: 'Empezar por acá',
  };
}

function puertaDeVerQuePaso(): Puerta | null {
  if (!BITACORA_DESTACADA) return null;
  return {
    kicker: '¿Venís a ver qué pasó?',
    titulo: 'La bitácora',
    meta: `última crónica: ${fechaLarga(BITACORA_DESTACADA.publishedAt)}`,
    href: HREF_BITACORA,
    cta: 'Ver qué pasó',
  };
}

/**
 * La puerta de hoy (spec 2026-08-20 §5): los tres perfiles que la spec madre
 * nombra («el manifiesto si viene de cero, un ciclo si viene a pensar, la
 * bitácora si viene a ver qué pasó»), hechos superficie — y el señalador
 * cuando hay lectura empezada. Sin dato (registry vacío) la puerta no se
 * rinde: nunca una promesa vacía.
 */
export function PuertaDeHoy() {
  const puertas = [PUERTA_DE_CERO, puertaDePensar(), puertaDeVerQuePaso()].filter(
    (p): p is Puerta => p !== null,
  );
  return (
    <section
      aria-label="¿Por dónde entrar hoy?"
      className="mx-auto max-w-[1100px] px-10 pb-14 max-[560px]:px-5"
    >
      <div className="border-tinta bg-tinta grid grid-cols-3 gap-px border max-[960px]:grid-cols-1">
        {puertas.map((puerta) => (
          <Link
            key={puerta.kicker}
            href={puerta.href}
            className="bg-papel hover:bg-papel-presionado flex min-h-[132px] flex-col gap-1.5 px-6 py-5 transition-colors duration-150"
          >
            <span className="font-space text-violeta text-[11px] font-bold uppercase tracking-[0.16em]">
              {puerta.kicker}
            </span>
            <span className="text-tinta text-[17px] font-semibold leading-snug">
              {puerta.titulo}
            </span>
            <span className="font-space text-tinta-50 text-[11px] uppercase tracking-[0.1em]">
              {puerta.meta}
            </span>
            <span className="font-space text-violeta mt-auto pt-2 text-xs font-bold uppercase tracking-[0.1em]">
              {puerta.cta} →
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
