import { Link } from 'wouter';

import { PLAN_COUNT } from '../landing-data';

import { useCifras, useVocesCount } from '~/lib/queries/analytics';
import { useSemillasCount } from '~/lib/queries/semillas';

interface CifraTile {
  key: string;
  value: number | undefined;
  isLoading: boolean;
  label: string;
  href: string;
}

/**
 * Valor de una cifra: skeleton papel-presionado (§5) mientras carga o
 * si la consulta falló — nunca un número inventado. `role="status"`
 * para que el estado de carga sea anunciado a lectores de pantalla.
 *
 * Con cero real el slot habla en vez de numerar (§5 «Cifra sin dato»):
 * cuatro «0» en Anton gigante leían como sitio muerto, y el resto del
 * sitio ya decía «todavía no» con palabras. Las cuatro cifras vivas son
 * femeninas, así que la misma frase sirve para todas.
 */
function CifraValor({ value, isLoading }: { value: number | undefined; isLoading: boolean }) {
  if (value === 0) {
    return (
      <div className="flex h-[46px] items-end">
        <span className="font-anton text-tinta-75 text-[26px] leading-none">Todavía ninguna.</span>
      </div>
    );
  }
  if (isLoading || value === undefined) {
    return (
      <div
        role="status"
        aria-label="Cargando cifra"
        className="bg-papel-presionado anim-pulso-papel h-[46px] w-20"
      />
    );
  }
  return <div className="font-anton text-[46px] leading-none">{value.toLocaleString('es-AR')}</div>;
}

/**
 * Franja de cifras reales de la plataforma: voces (reusa `useVocesCount`,
 * misma query key que el header), semillas (`useSemillasCount`, vuelta
 * sancionada por la card 2.0 — Sembrar/2.5), propuestas y señales
 * (`useCifras`, un solo round-trip), y los planes (MDX, siempre reales).
 * Círculos se retira acá — no tiene página propia todavía.
 */
export function CifrasStrip() {
  const vocesQuery = useVocesCount();
  const cifrasQuery = useCifras();
  const semillasQuery = useSemillasCount();

  const tiles: CifraTile[] = [
    {
      key: 'voces',
      value: vocesQuery.data?.total,
      isLoading: vocesQuery.isLoading,
      label: 'voces en el mapa',
      href: '/el-mapa',
    },
    {
      key: 'semillas',
      value: semillasQuery.data?.total,
      isLoading: semillasQuery.isLoading,
      label: 'semillas plantadas',
      href: '/sembrar',
    },
    {
      key: 'propuestas',
      value: cifrasQuery.data?.propuestas,
      isLoading: cifrasQuery.isLoading,
      label: 'propuestas del mandato',
      href: '/mandato-vivo',
    },
    {
      key: 'senales',
      value: cifrasQuery.data?.senales,
      isLoading: cifrasQuery.isLoading,
      label: 'señales del pulso',
      href: '/mandato-vivo',
    },
  ];

  return (
    <section className="border-tinta bg-papel-crudo border-b">
      <div className="mx-auto grid max-w-[1440px] grid-cols-5 px-5 max-[960px]:grid-cols-1 min-[961px]:px-10">
        {tiles.map((t) => (
          <Link
            key={t.key}
            href={t.href}
            className="border-papel-borde text-tinta hover:bg-papel-presionado block border-r px-6 py-[34px] transition-colors duration-200 max-[960px]:border-b max-[960px]:border-r-0"
          >
            <CifraValor value={t.value} isLoading={t.isLoading} />
            <div className="font-space text-tinta-50 mt-2.5 text-[11px] uppercase tracking-[0.12em]">
              {t.label} ↗
            </div>
          </Link>
        ))}
        <Link
          href="/planes"
          className="border-papel-borde text-tinta hover:bg-papel-presionado block border-r px-6 py-[34px] transition-colors duration-200 max-[960px]:border-b max-[960px]:border-r-0"
        >
          <div className="font-anton text-violeta text-[46px] leading-none">{PLAN_COUNT}</div>
          <div className="font-space text-tinta-50 mt-2.5 text-[11px] uppercase tracking-[0.12em]">
            planes de ejemplo ↗
          </div>
        </Link>
      </div>
    </section>
  );
}
