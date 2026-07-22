# La idea (página 2.1) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir `/la-idea` en Papel y Tinta — portada + 3 capítulos con el despertar como interacción firma — y retirar las páginas v1 `/la-vision` y `/el-instante-del-hombre-gris` con redirects permanentes.

**Architecture:** Composer fino `pages/LaIdea.tsx` + 4 secciones en `pages/LaIdea/sections/` (patrón Home). El rito de la tinta se extrae a una primitiva `RitoTinta` (con enmienda a la ley §5). El copy vive en la spec y se transcribe tal cual; la prosa repetida entre secciones va en `pages/LaIdea/la-idea-data.ts` (patrón `landing-data.ts`).

**Tech Stack:** React 18 + wouter + Tailwind (tokens papel §9b) + Vitest/Testing Library. Sin librerías nuevas.

**Spec:** `docs/specs/2026-07-22-la-idea-papel-y-tinta.md` — **todo el copy sale de ahí, carácter por carácter**. Este plan lo repite en los esqueletos para que cada tarea sea autosuficiente.

## Global Constraints

- `v2/CLAUDE.md` completo: sin `any`, sin `console.*`, archivos ≤ 300 LOC, `pnpm verify` verde antes de cada commit, Conventional Commits con scope.
- `docs/design-system/README.md` v1.1 es ley. §9b: PROHIBIDO el hex literal en TSX — solo tokens Tailwind (`bg-papel`, `text-tinta`, `font-anton`, …). Si falta un patrón, se enmienda el README **en el mismo commit** (este plan lo hace dos veces: receta `RitoTinta` en §5 y disparadores nuevos en §10.7).
- Voseo rioplatense; `¡BASTA!` siempre con ambos signos; «comillas angulares»; nunca "únete/registrate".
- **Cero datos hardcodeados (directiva 2026-07-22):** únicas cifras = `PLAN_COUNT` (de `PLAN_REGISTRY`, MDX real) y el conteo de voces (`useVocesCount()`, endpoint existente). Ningún endpoint nuevo. Ningún número tipeado.
- Una conversación = una página: NO tocar `Home/*`, `PapelHeader.tsx`, `PapelFooter.tsx`, ni otras páginas. Excepción sancionada (Task 3): `papel-nav.ts` (archivo de datos del nav) y los archivos de ruteo (`App.tsx`, `RootLayout.tsx`).
- Los redirects de las rutas v1 son permanentes (hay links viejos en Home y el chrome v1 que la Fase 7 limpiará).

---

### Task 1: Primitiva `RitoTinta` + página `LaIdea` con portada y Capítulo I (el despertar)

**Files:**
- Create: `apps/web/src/components/papel/primitives/RitoTinta.tsx`
- Modify: `apps/web/src/components/papel/primitives/index.ts`
- Modify: `apps/web/src/components/papel/primitives/primitives.test.tsx` (agregar describe `RitoTinta`)
- Modify: `docs/design-system/README.md` (§5 receta nueva; §10.7 disparador nuevo — enmienda de ley, mismo commit)
- Create: `apps/web/src/pages/LaIdea.tsx`
- Create: `apps/web/src/pages/LaIdea/sections/PortadaIdea.tsx`
- Create: `apps/web/src/pages/LaIdea/sections/CapituloHombreGris.tsx`
- Test: `apps/web/src/pages/LaIdea/sections/__tests__/CapituloHombreGris.test.tsx`
- Test: `apps/web/src/pages/__tests__/LaIdea.test.tsx`

**Interfaces:**
- Consumes: `Kicker`, `BotonPapel` (primitives) · `despertar()`/`useDespierto()` de `~/lib/despertar` · wrappers `.anim-inkfill`/`.anim-vpop`/`.anim-fadeup` de `index.css`.
- Produces: `RitoTinta({ lineas: readonly string[]; delayBase?: number; paso?: number })` — la usan esta página y todas las que siguen. `LaIdea` (named + default export) — Task 3 la lazy-importa. `PortadaIdea()`, `CapituloHombreGris()` sin props.

- [ ] **Step 1: Test de la primitiva (falla primero).** En `primitives.test.tsx`, sumar a los imports existentes `import { RitoTinta } from './RitoTinta';` y agregar al final:

```tsx
describe('RitoTinta', () => {
  it('entinta cada letra con delays escalonados y hace caer los signos al final en violeta', () => {
    const { container } = render(
      <h1 aria-label="¡BASTA!">
        <RitoTinta lineas={['¡BASTA!']} />
      </h1>,
    );

    const letras = Array.from(container.querySelectorAll<HTMLElement>('.anim-inkfill'));
    expect(letras.map((el) => el.textContent)).toEqual(['B', 'A', 'S', 'T', 'A']);
    expect(letras.map((el) => el.style.animationDelay)).toEqual([
      '0.1s',
      '0.145s',
      '0.19s',
      '0.235s',
      '0.28s',
    ]);

    const signos = Array.from(container.querySelectorAll<HTMLElement>('.anim-vpop'));
    expect(signos.map((el) => el.textContent)).toEqual(['¡', '!']);
    for (const signo of signos) {
      expect(signo).toHaveClass('text-violeta');
      expect(signo.style.animationDelay).toBe('0.525s');
    }
  });

  it('queda oculto para tecnología asistiva — el aria-label lo pone el llamador', () => {
    render(
      <h1 aria-label="Se diseña.">
        <RitoTinta lineas={['Se diseña.']} />
      </h1>,
    );

    expect(screen.getByRole('heading', { level: 1, name: 'Se diseña.' })).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Correr y ver FAIL.**

Run: `pnpm -C apps/web exec vitest run src/components/papel/primitives/primitives.test.tsx`
Esperado: FAIL — `Cannot find module './RitoTinta'`.

- [ ] **Step 3: Implementar `RitoTinta.tsx`:**

```tsx
export interface RitoTintaProps {
  /** Líneas del título — se apilan como bloques. */
  lineas: readonly string[];
  /** Segundos antes de la primera letra. */
  delayBase?: number;
  /** Segundos entre letras. */
  paso?: number;
}

/** Evita colas binarias (0.23500000000000004) en el estilo inline. */
function redondear(segundos: number): number {
  return Math.round(segundos * 1000) / 1000;
}

/**
 * Rito de la tinta §10.1 — el H1 se entinta letra por letra (`anim-inkfill`,
 * gris → tinta) y los signos ¡ ! caen al final (`anim-vpop`, violeta).
 * El llamador pone el elemento heading y su aria-label:
 *
 *   <h1 aria-label="Un país no se hereda. Se diseña.">
 *     <RitoTinta lineas={['Un país no se hereda.', 'Se diseña.']} />
 *   </h1>
 */
export function RitoTinta({ lineas, delayBase = 0.1, paso = 0.045 }: RitoTintaProps) {
  const totalLetras = lineas.join('').replace(/[¡!\s]/g, '').length;
  const delaySignos = redondear(delayBase + totalLetras * paso + 0.2);
  let letra = 0;

  return (
    <span aria-hidden className="contents">
      {lineas.map((linea, l) => (
        <span key={l} className="block">
          {Array.from(linea).map((char, i) => {
            if (char === '¡' || char === '!') {
              return (
                <span
                  key={i}
                  className="anim-vpop text-violeta inline-block"
                  style={{ animationDelay: `${delaySignos}s` }}
                >
                  {char}
                </span>
              );
            }
            if (char === ' ') {
              return <span key={i}>{' '}</span>;
            }
            const delay = redondear(delayBase + letra * paso);
            letra += 1;
            return (
              <span key={i} className="anim-inkfill" style={{ animationDelay: `${delay}s` }}>
                {char}
              </span>
            );
          })}
        </span>
      ))}
    </span>
  );
}
```

En `index.ts`, en orden alfabético (entre `NotaDemo` y `Sello`):

```ts
export { RitoTinta, type RitoTintaProps } from './RitoTinta';
```

- [ ] **Step 4: Correr y ver PASS.**

Run: `pnpm -C apps/web exec vitest run src/components/papel/primitives/primitives.test.tsx`
Esperado: PASS (los describes preexistentes también).

- [ ] **Step 5: Enmienda de ley.** En `docs/design-system/README.md`, §5, insertar después del bloque «Banda CTA» y antes de «Nota de datos demo»:

```markdown
Título entintado (rito §10.1)
En la app: primitiva `RitoTinta` (`components/papel/primitives/RitoTinta.tsx`) — divide
el título en letras con `anim-inkfill` escalonado (~45ms por letra) y hace caer los
signos `¡ !` al final con `anim-vpop` en violeta. El llamador pone el heading y su
`aria-label` (las letras van `aria-hidden`). En `.dc.html`: spans inline con
`animation:inkfill` y delays literales.
```

Y en §10.7, reemplazar la lista de disparadores:

```
Disparadores canónicos: CTA «Dejar mi voz en el mapa», CTA header «Sembrar tu voz», primera voz soltada.
```

por:

```
Disparadores canónicos: CTA «Dejar mi voz en el mapa», CTA header «Sembrar tu voz», botón «Este es mi instante» (La idea, Cap I), primera voz soltada.
```

(La fecha del doc ya dice «julio 2026» — no se bumpea, §11.4.)

- [ ] **Step 6: Tests de la página (fallan primero).** `apps/web/src/pages/__tests__/LaIdea.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

import { LaIdea } from '../LaIdea';

describe('LaIdea (página papel 2.1)', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('abre con el rito de la tinta en el H1 y el kicker de la página', () => {
    render(<LaIdea />);

    expect(
      screen.getByRole('heading', { level: 1, name: 'Un país no se hereda. Se diseña.' }),
    ).toBeInTheDocument();
    expect(screen.getByText('La idea · tres capítulos · seis minutos')).toBeInTheDocument();
  });

  it('presenta el Capítulo I con su caja del despertar', () => {
    render(<LaIdea />);

    expect(
      screen.getByRole('heading', { level: 2, name: 'El instante del hombre gris' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Este es mi instante' })).toBeInTheDocument();
  });
});
```

Y `apps/web/src/pages/LaIdea/sections/__tests__/CapituloHombreGris.test.tsx`:

```tsx
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

import { CapituloHombreGris } from '../CapituloHombreGris';

describe('CapituloHombreGris', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('arranca en gris: aviso mono + botón «Este es mi instante»', () => {
    render(<CapituloHombreGris />);

    expect(
      screen.getByText('Esta página está en gris. Como el país. Como vos, hasta hoy.'),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Este es mi instante' })).toBeInTheDocument();
  });

  it('lleva la identidad plata: argentum, nunca acero', () => {
    render(<CapituloHombreGris />);

    expect(screen.getByText(/argentum/)).toBeInTheDocument();
    expect(screen.getByText(/Plata, no acero\./)).toBeInTheDocument();
  });

  it('al apretar el botón despierta el sitio y estampa el ¡BASTA!', () => {
    render(<CapituloHombreGris />);

    fireEvent.click(screen.getByRole('button', { name: 'Este es mi instante' }));

    expect(window.localStorage.getItem('basta_despierto')).toBe('1');
    expect(screen.getByText('¡BASTA!')).toBeInTheDocument();
    expect(
      screen.getByText('Eso fue todo. Así de simple empieza. Lo que sigue es método.'),
    ).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Este es mi instante' })).not.toBeInTheDocument();
  });

  it('si ya está despierto muestra el estado encendido sin botón', () => {
    window.localStorage.setItem('basta_despierto', '1');
    render(<CapituloHombreGris />);

    expect(screen.queryByRole('button', { name: 'Este es mi instante' })).not.toBeInTheDocument();
    expect(screen.getByText('¡BASTA!')).toBeInTheDocument();
  });
});
```

Run: `pnpm -C apps/web exec vitest run src/pages/__tests__/LaIdea.test.tsx src/pages/LaIdea/sections/__tests__/CapituloHombreGris.test.tsx`
Esperado: FAIL — módulos inexistentes.

- [ ] **Step 7: Implementar.** `apps/web/src/pages/LaIdea/sections/PortadaIdea.tsx`:

```tsx
import { Kicker, RitoTinta } from '~/components/papel/primitives';

/** § 0 — Portada: rito de la tinta en el H1 (todo tinta — decisión 1 de la spec). */
export function PortadaIdea() {
  return (
    <section className="mx-auto max-w-[1100px] px-5 pb-14 pt-[72px] min-[961px]:px-10">
      <Kicker className="anim-fadeup mb-5">La idea · tres capítulos · seis minutos</Kicker>
      <h1
        aria-label="Un país no se hereda. Se diseña."
        className="font-anton riso-hover mb-6 text-[clamp(48px,7vw,104px)] leading-[0.98]"
      >
        <RitoTinta lineas={['Un país no se hereda.', 'Se diseña.']} />
      </h1>
      <p
        className="anim-fadeup text-tinta-75 max-w-[640px] text-pretty text-[19px] leading-[1.6]"
        style={{ animationDelay: '0.9s' }}
      >
        Tres capítulos: quién sos en esta historia, cómo funciona el método, y por qué acá
        nadie viene a salvarte — a propósito.
      </p>
    </section>
  );
}
```

`apps/web/src/pages/LaIdea/sections/CapituloHombreGris.tsx`:

```tsx
import { BotonPapel, Kicker } from '~/components/papel/primitives';
import { despertar, useDespierto } from '~/lib/despertar';

/**
 * Capítulo I — la identidad (absorbe la v1 /el-instante-del-hombre-gris).
 * Banda gris que se enciende con el despertar: la interacción firma de la
 * página (spec docs/specs/2026-07-22-la-idea-papel-y-tinta.md). AA: sobre
 * el gris #8E8A82 TODO el texto va en tinta plena, nunca tinta-90/75/50.
 */
export function CapituloHombreGris() {
  const despierto = useDespierto();

  return (
    <section
      id="capitulo-i"
      className={`${despierto ? 'bg-papel-crudo' : 'bg-oscuro-meta'} transition-colors duration-1000 motion-reduce:transition-none`}
    >
      <div className="text-tinta mx-auto max-w-[1100px] px-5 py-[72px] min-[961px]:px-10">
        <Kicker color="tinta" className="text-tinta mb-5">
          Capítulo I
        </Kicker>
        <h2 className="font-anton riso-hover mb-7 text-[clamp(36px,4.6vw,64px)] leading-none">
          El instante del hombre gris
        </h2>

        <div className="grid grid-cols-2 gap-10 text-[17px] leading-[1.65] max-[960px]:grid-cols-1">
          <div>
            <p className="mb-4 text-pretty">
              El hombre gris no es un personaje: sos vos a las 7:40, apretado en un tren que
              llega tarde a un trabajo que apenas alcanza. Es la maestra que enseña con
              fotocopias, el médico que atiende sin insumos, la piba que ya averiguó cuánto
              sale irse.
            </p>
            <p className="text-pretty">
              Y una aclaración, porque importa: gris no quiere decir mediocre. El gris es
              todos los colores juntos. Es plata — <em>argentum</em>, el metal que le puso
              nombre a la Argentina. Canas de aguantar, cicatrices que ya no avergüenzan:
              enseñan. Plata, no acero.
            </p>
          </div>
          <div>
            <p className="mb-4 text-pretty">
              Pero hay un instante — uno solo — en que el gris se corta. Una factura que no
              cierra, una sala de espera, una injusticia de más. El instante en que un tipo
              común dice en voz alta la palabra que venía tragando hace años.
            </p>
            <p className="text-pretty font-semibold">
              Ese instante, multiplicado y ordenado con método, es todo esto. No hace falta
              ser héroe. Hace falta decidirse.
            </p>
          </div>
        </div>

        <aside className="border-tinta mt-10 max-w-[720px] border-l-2 pl-6">
          <p className="font-space mb-3 text-[11px] uppercase tracking-[0.16em]">
            Por qué el nombre largo
          </p>
          <p className="mb-3 text-pretty text-[15px] leading-relaxed">
            El proyecto se llama El Instante del Hombre Gris por las psicografías de Solari
            Parravicini sobre la Argentina y su «Hombre Gris». Las leemos como diagnóstico,
            no como profecía: lo que él dibujó entonces es lo que resolvemos ahora.
          </p>
          <blockquote className="text-pretty text-[15px] italic leading-relaxed">
            «Eres un pozo tallado no en piedra, sino en tiempo. Y estás destinado a
            desbordarte.»
          </blockquote>
        </aside>

        <div className="border-tinta bg-papel-crudo mt-11 border p-9 text-center">
          {despierto ? (
            <>
              <div className="font-anton text-violeta anim-vpop text-[clamp(30px,3.6vw,48px)] leading-[1.05]">
                ¡BASTA!
              </div>
              <p className="text-tinta-90 mt-3.5 text-base">
                Eso fue todo. Así de simple empieza. Lo que sigue es método.
              </p>
            </>
          ) : (
            <>
              <p className="font-space mb-4 text-xs uppercase tracking-[0.14em]">
                Esta página está en gris. Como el país. Como vos, hasta hoy.
              </p>
              <BotonPapel variant="tinta" onClick={despertar}>
                Este es mi instante
              </BotonPapel>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
```

`apps/web/src/pages/LaIdea.tsx` (composer parcial — Task 2 suma los caps II y III):

```tsx
import { CapituloHombreGris } from './LaIdea/sections/CapituloHombreGris';
import { PortadaIdea } from './LaIdea/sections/PortadaIdea';

/**
 * La idea — página 2.1 «Papel y Tinta»
 * (docs/specs/2026-07-22-la-idea-papel-y-tinta.md). Fusiona las v1
 * /la-vision y /el-instante-del-hombre-gris en un recorrido de tres
 * capítulos. El chrome papel (header/footer/grano/velo) lo pone RootLayout.
 */
export function LaIdea() {
  return (
    <main>
      <PortadaIdea />
      <CapituloHombreGris />
    </main>
  );
}

export default LaIdea;
```

- [ ] **Step 8: Correr y ver PASS.**

Run: `pnpm -C apps/web exec vitest run src/pages src/components/papel/primitives`
Esperado: PASS todos (los suites de Home y primitives incluidos — nada de Home se tocó).

- [ ] **Step 9: Verificación completa y commit.**

Run: `pnpm verify` (raíz de `v2/`). Esperado: lint + type-check + tests + build verdes.

```bash
git add apps/web/src/components/papel/primitives/RitoTinta.tsx \
        apps/web/src/components/papel/primitives/index.ts \
        apps/web/src/components/papel/primitives/primitives.test.tsx \
        apps/web/src/pages/LaIdea.tsx \
        apps/web/src/pages/LaIdea/sections/PortadaIdea.tsx \
        apps/web/src/pages/LaIdea/sections/CapituloHombreGris.tsx \
        apps/web/src/pages/LaIdea/sections/__tests__/CapituloHombreGris.test.tsx \
        apps/web/src/pages/__tests__/LaIdea.test.tsx \
        docs/design-system/README.md
git commit -m "feat(web): La idea — portada y Capítulo I con el despertar; primitiva RitoTinta (§5)"
```

---

### Task 2: Capítulos II y III (el método · sin líder)

**Files:**
- Create: `apps/web/src/pages/LaIdea/la-idea-data.ts`
- Create: `apps/web/src/pages/LaIdea/sections/CapituloMetodo.tsx`
- Create: `apps/web/src/pages/LaIdea/sections/CapituloSinLider.tsx`
- Modify: `apps/web/src/pages/LaIdea.tsx` (sumar las dos secciones)
- Modify: `apps/web/src/pages/__tests__/LaIdea.test.tsx` (mock analytics + capítulos en orden)
- Modify: `docs/design-system/README.md` (§10.7: disparador CTA «Dejar mi voz» — mismo commit)
- Test: `apps/web/src/pages/LaIdea/sections/__tests__/CapituloMetodo.test.tsx`
- Test: `apps/web/src/pages/LaIdea/sections/__tests__/CapituloSinLider.test.tsx`

**Interfaces:**
- Consumes: `Kicker`, `BotonPapel`, `Sello` (primitives) · `useVocesCount()` de `~/lib/queries/analytics` (retorna query con `data?: { total: number }`) · `despertar()` de `~/lib/despertar` · `PLAN_REGISTRY` de `~/lib/plans-registry` (items con `isMeta: boolean`) · `cn()` de `~/lib/utils`.
- Produces: `ROLES: readonly RolRow[]` (`{ num, a, b, body }`), `CICLO: readonly CicloPaso[]` (`{ label, acento?: 'violeta' | 'verde' }`), `SIN_LIDER: readonly SinLiderCard[]` (`{ stamp, body }`), `PLAN_COUNT: number` · `CapituloMetodo()`, `CapituloSinLider()` sin props.

- [ ] **Step 1: Tests de sección (fallan primero).** `CapituloMetodo.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { CICLO, PLAN_COUNT, ROLES } from '../../la-idea-data';
import { CapituloMetodo } from '../CapituloMetodo';

describe('CapituloMetodo', () => {
  it('renderiza los tres roles con su verbo', () => {
    render(<CapituloMetodo />);

    expect(ROLES).toHaveLength(3);
    for (const rol of ROLES) {
      expect(screen.getByRole('heading', { name: `${rol.a} ${rol.b}` })).toBeInTheDocument();
    }
  });

  it('muestra el ciclo completo como cadena de chips que vuelve a girar', () => {
    render(<CapituloMetodo />);

    for (const paso of CICLO) {
      expect(screen.getByText(paso.label)).toBeInTheDocument();
    }
    expect(screen.getByText('↺')).toBeInTheDocument();
  });

  it('cierra con la prueba: sello, conteo real de planes y CTA a /planes', () => {
    render(<CapituloMetodo />);

    expect(screen.getByText('No es doctrina')).toBeInTheDocument();
    expect(screen.getByText(new RegExp(`redactó ${PLAN_COUNT} planes`))).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ver la prueba: los planes →' })).toHaveAttribute(
      'href',
      '/planes',
    );
  });
});
```

`CapituloSinLider.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { SIN_LIDER } from '../../la-idea-data';
import { CapituloSinLider } from '../CapituloSinLider';

import { useVocesCount } from '~/lib/queries/analytics';

vi.mock('~/lib/queries/analytics', () => ({
  useVocesCount: vi.fn(),
}));

const mockedUseVocesCount = vi.mocked(useVocesCount);

describe('CapituloSinLider', () => {
  beforeEach(() => {
    mockedUseVocesCount.mockReturnValue({
      data: { total: 12496 },
      isLoading: false,
      isError: false,
    } as ReturnType<typeof useVocesCount>);
  });

  it('estampa los tres sellos: sin líder, sin partido, sin excusas', () => {
    render(<CapituloSinLider />);

    expect(SIN_LIDER).toHaveLength(3);
    for (const card of SIN_LIDER) {
      expect(screen.getByText(card.stamp)).toBeInTheDocument();
    }
  });

  it('remata con el conteo real de voces y el CTA al mapa', () => {
    render(<CapituloSinLider />);

    expect(screen.getByText(/12\.496 voces ya están en el mapa/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Dejar mi voz →' })).toHaveAttribute(
      'href',
      '/el-mapa',
    );
  });

  it('si el conteo carga o falló, la línea no aparece — jamás un número inventado', () => {
    mockedUseVocesCount.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    } as ReturnType<typeof useVocesCount>);
    render(<CapituloSinLider />);

    expect(screen.queryByText(/voces ya están en el mapa/)).not.toBeInTheDocument();
  });
});
```

Run: `pnpm -C apps/web exec vitest run src/pages/LaIdea`
Esperado: FAIL — módulos inexistentes.

- [ ] **Step 2: Implementar `la-idea-data.ts`** (prosa estática — no métricas; decisión 4 de la spec):

```ts
import { PLAN_REGISTRY } from '~/lib/plans-registry';

/**
 * Copy estático de La idea (spec docs/specs/2026-07-22-la-idea-papel-y-tinta.md).
 * Las únicas cifras de la página son PLAN_COUNT (registry MDX, real) y el
 * conteo de voces del Cap III (useVocesCount, API real).
 */

export interface RolRow {
  num: string;
  a: string;
  b: string;
  body: string;
}

export const ROLES: readonly RolRow[] = [
  {
    num: '01',
    a: 'La ciudadanía',
    b: 'diseña.',
    body: 'La que vive el país es la que sabe dónde duele. Vos soltás tu voz en el mapa; miles de voces convergen; de esa convergencia sale el mandato: el país pedido por escrito. Nadie interpreta lo que quisiste decir. Nadie firma en tu nombre.',
  },
  {
    num: '02',
    a: 'El Estado',
    b: 'administra.',
    body: 'Técnicos que gestionan lo que la ciudadanía diseñó: miden, registran, protegen, garantizan que nada se caiga entre un gobierno y el siguiente. Gerentes del país, no dueños. Y con otro tablero: además del PBI, cuánta dignidad sostiene una persona, cuánta confianza circula entre vecinos, cuánta belleza funcional sale a la calle.',
  },
  {
    num: '03',
    a: 'La política',
    b: 'ejecuta.',
    body: 'El que quiera un cargo firma el mandato ciudadano antes de pedirte el voto. Después ejecuta lo diseñado y rinde cuentas en público, con calendario. Empleada del diseño, no autora. Si no cumple, el mismo método la deja afuera.',
  },
];

export interface CicloPaso {
  label: string;
  acento?: 'violeta' | 'verde';
}

export const CICLO: readonly CicloPaso[] = [
  { label: 'tu voz', acento: 'violeta' },
  { label: 'el mandato' },
  { label: 'los planes' },
  { label: 'la ejecución' },
  { label: 'la auditoría', acento: 'verde' },
];

export interface SinLiderCard {
  stamp: string;
  body: string;
}

export const SIN_LIDER: readonly SinLiderCard[] = [
  {
    stamp: 'Sin líder',
    body: 'Un líder es un punto único de falla: se compra, se cansa, se equivoca o se va. Acá decide el método, y al método no lo podés sobornar ni jubilar. Si mañana desaparece el que escribió todo esto, no cambia nada. Esa es la idea.',
  },
  {
    stamp: 'Sin partido',
    body: 'Un partido necesita ganar elecciones, y para ganar necesita prometer lo que sea. Un método solo necesita funcionar. No competimos por los cargos: los condicionamos. El que quiera uno, firma el mandato.',
  },
  {
    stamp: 'Sin excusas',
    body: 'La parte incómoda: si no hay nadie arriba, no queda a quién echarle la culpa. La ciudadanía diseña — entonces la ciudadanía responde. Tu silencio también firma.',
  },
];

/** Planes reales (sin PLANRUTA, que es meta) — mismo criterio que la landing. */
export const PLAN_COUNT = PLAN_REGISTRY.filter((p) => !p.isMeta).length;
```

- [ ] **Step 3: Implementar `CapituloMetodo.tsx`:**

```tsx
import { Fragment } from 'react';
import { Link } from 'wouter';

import { CICLO, PLAN_COUNT, ROLES } from '../la-idea-data';

import { BotonPapel, Kicker, Sello } from '~/components/papel/primitives';
import { cn } from '~/lib/utils';

const CHIP_ACENTO: Record<'violeta' | 'verde', string> = {
  violeta: 'bg-violeta text-papel border-violeta',
  verde: 'bg-verde text-papel border-verde',
};

/** Capítulo II — el método (absorbe la v1 /la-vision: Ackoff + tres roles + la prueba). */
export function CapituloMetodo() {
  return (
    <section id="capitulo-ii" className="mx-auto max-w-[1100px] px-5 py-20 min-[961px]:px-10">
      <Kicker className="mb-5">Capítulo II</Kicker>
      <h2 className="font-anton riso-hover mb-4 text-[clamp(36px,4.6vw,64px)] leading-none">
        El método: tres roles que no se mezclan
      </h2>
      <div className="text-tinta-75 max-w-[620px] text-[17px] leading-relaxed">
        <p className="mb-4 text-pretty">
          La política argentina fracasa por un error de diseño: una sola casta hace los tres
          trabajos. Decide qué país quiere, lo administra y se controla a sí misma. Acá los
          tres roles se separan — y no se vuelven a mezclar.
        </p>
        <p className="mb-10 text-pretty">
          El método tiene nombre: diseño idealizado. Cuando un sistema falla en todo, no se
          lo emparcha — se lo dibuja de nuevo, como si empezara hoy. No prometemos arreglar
          lo viejo: dibujamos lo nuevo hasta que volver atrás quede en ridículo.
        </p>
      </div>

      {ROLES.map((rol) => (
        <div
          key={rol.num}
          className="border-tinta grid grid-cols-[90px_1fr] gap-7 border-t py-[30px] max-[560px]:grid-cols-1 max-[560px]:gap-2"
        >
          <span className="font-space text-tinta-50 text-sm">{rol.num}</span>
          <div>
            <h3 className="font-anton mb-3 text-[clamp(28px,3.4vw,44px)] leading-none">
              {rol.a} <span className="text-violeta">{rol.b}</span>
            </h3>
            <p className="text-tinta-75 max-w-[640px] text-pretty text-base leading-relaxed">
              {rol.body}
            </p>
          </div>
        </div>
      ))}

      <div className="border-tinta bg-papel-crudo mt-8 border p-9">
        <Kicker color="tinta" className="mb-5">
          El ciclo completo
        </Kicker>
        <div className="flex flex-wrap items-center gap-2.5">
          {CICLO.map((paso, i) => (
            <Fragment key={paso.label}>
              {i > 0 ? <span className="font-space text-tinta-30 text-sm">→</span> : null}
              <span
                className={cn(
                  'font-space border-tinta border px-4 py-2.5 text-[13px] font-bold uppercase tracking-[0.06em]',
                  paso.acento && CHIP_ACENTO[paso.acento],
                )}
              >
                {paso.label}
              </span>
            </Fragment>
          ))}
          <span className="font-space text-tinta-30 text-sm">↺</span>
        </div>
        <p className="text-tinta-50 mt-5 text-sm leading-relaxed">
          El ciclo no tiene última vuelta: las voces nuevas ajustan el mandato, el mandato
          ajusta los planes, y la ejecución se audita a la vista de todos. Después vuelve a
          girar.
        </p>
      </div>

      <div className="border-tinta mt-14 flex flex-wrap items-center justify-between gap-6 border-t pt-8">
        <div className="flex max-w-[680px] flex-wrap items-start gap-5">
          <Sello color="rojo" rotate={-4}>
            No es doctrina
          </Sello>
          <p className="text-tinta-75 min-w-[260px] flex-1 text-pretty text-base leading-relaxed">
            ¿Suena imposible? Ya está escrito. Un ciudadano común redactó {PLAN_COUNT} planes
            de país — más PLANRUTA, el que explica cómo se arranca. No son doctrina: son la
            prueba de que cualquiera puede. Imaginate lo que sale de millones.
          </p>
        </div>
        <BotonPapel asChild variant="fantasma">
          <Link href="/planes">Ver la prueba: los planes →</Link>
        </BotonPapel>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Implementar `CapituloSinLider.tsx`:**

```tsx
import { Link } from 'wouter';

import { SIN_LIDER } from '../la-idea-data';

import { BotonPapel, Kicker, Sello } from '~/components/papel/primitives';
import { despertar } from '~/lib/despertar';
import { useVocesCount } from '~/lib/queries/analytics';

/**
 * Capítulo III — sin líder, sin partido, sin excusas. Sección oscura.
 * Única métrica viva de la página: el conteo real de voces; si carga o
 * falla, la línea no se renderiza (regla de datos reales de la spec).
 */
export function CapituloSinLider() {
  const vocesQuery = useVocesCount();

  return (
    <section id="capitulo-iii" className="bg-tinta text-papel">
      <div className="mx-auto max-w-[1100px] px-5 py-20 min-[961px]:px-10">
        <Kicker className="text-violeta-claro mb-5">Capítulo III</Kicker>
        <h2 className="font-anton riso-hover mb-10 text-[clamp(36px,4.6vw,64px)] leading-none">
          Nadie viene a salvarte.
          <br />
          Por diseño.
        </h2>

        <div className="bg-oscuro-borde border-oscuro-borde grid grid-cols-3 gap-px border max-[960px]:grid-cols-1">
          {SIN_LIDER.map((card) => (
            <div key={card.stamp} className="bg-tinta p-7">
              <Sello color="rojo" rotate={-3} className="mb-4 border-2 px-2.5 py-1.5 text-[11px]">
                {card.stamp}
              </Sello>
              <p className="text-oscuro-secundario text-pretty text-[15px] leading-relaxed">
                {card.body}
              </p>
            </div>
          ))}
        </div>

        <div className="border-oscuro-borde mt-12 flex flex-wrap items-center justify-between gap-5 border-t pt-8">
          <div>
            <p className="text-oscuro-secundario max-w-[520px] text-pretty text-[17px] leading-relaxed">
              Si terminaste los tres capítulos esperando el nombre de un candidato, volvé al
              primero. Si en cambio te quedó algo por decir — hay un mapa esperándote.
            </p>
            {vocesQuery.data ? (
              <p className="font-space text-oscuro-meta mt-3 text-[11px] uppercase tracking-[0.12em]">
                {vocesQuery.data.total.toLocaleString('es-AR')} voces ya están en el mapa.
                Falta la tuya.
              </p>
            ) : null}
          </div>
          <BotonPapel asChild variant="violeta" surface="oscuro">
            <Link href="/el-mapa" onClick={despertar}>
              Dejar mi voz →
            </Link>
          </BotonPapel>
        </div>
      </div>
    </section>
  );
}
```

Actualizar el composer `apps/web/src/pages/LaIdea.tsx`:

```tsx
import { CapituloHombreGris } from './LaIdea/sections/CapituloHombreGris';
import { CapituloMetodo } from './LaIdea/sections/CapituloMetodo';
import { CapituloSinLider } from './LaIdea/sections/CapituloSinLider';
import { PortadaIdea } from './LaIdea/sections/PortadaIdea';

/**
 * La idea — página 2.1 «Papel y Tinta»
 * (docs/specs/2026-07-22-la-idea-papel-y-tinta.md). Fusiona las v1
 * /la-vision y /el-instante-del-hombre-gris en un recorrido de tres
 * capítulos. El chrome papel (header/footer/grano/velo) lo pone RootLayout.
 */
export function LaIdea() {
  return (
    <main>
      <PortadaIdea />
      <CapituloHombreGris />
      <CapituloMetodo />
      <CapituloSinLider />
    </main>
  );
}

export default LaIdea;
```

- [ ] **Step 5: Actualizar el test de página** (`pages/__tests__/LaIdea.test.tsx` — ahora monta el Cap III, hay que mockear analytics). Archivo completo:

```tsx
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { LaIdea } from '../LaIdea';

import { useVocesCount } from '~/lib/queries/analytics';

vi.mock('~/lib/queries/analytics', () => ({
  useVocesCount: vi.fn(),
}));

const mockedUseVocesCount = vi.mocked(useVocesCount);

describe('LaIdea (página papel 2.1)', () => {
  beforeEach(() => {
    window.localStorage.clear();
    mockedUseVocesCount.mockReturnValue({
      data: { total: 12496 },
      isLoading: false,
      isError: false,
    } as ReturnType<typeof useVocesCount>);
  });

  it('abre con el rito de la tinta en el H1 y el kicker de la página', () => {
    render(<LaIdea />);

    expect(
      screen.getByRole('heading', { level: 1, name: 'Un país no se hereda. Se diseña.' }),
    ).toBeInTheDocument();
    expect(screen.getByText('La idea · tres capítulos · seis minutos')).toBeInTheDocument();
  });

  it('presenta el Capítulo I con su caja del despertar', () => {
    render(<LaIdea />);

    expect(
      screen.getByRole('heading', { level: 2, name: 'El instante del hombre gris' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Este es mi instante' })).toBeInTheDocument();
  });

  it('recorre los tres capítulos en orden', () => {
    render(<LaIdea />);

    const capitulos = screen.getAllByRole('heading', { level: 2 });
    expect(capitulos).toHaveLength(3);
    expect(capitulos[0]).toHaveTextContent('El instante del hombre gris');
    expect(capitulos[1]).toHaveTextContent('El método: tres roles que no se mezclan');
    expect(capitulos[2]).toHaveTextContent('Nadie viene a salvarte.');
  });
});
```

- [ ] **Step 6: Enmienda de ley (§10.7, mismo commit).** En `docs/design-system/README.md`, reemplazar:

```
Disparadores canónicos: CTA «Dejar mi voz en el mapa», CTA header «Sembrar tu voz», botón «Este es mi instante» (La idea, Cap I), primera voz soltada.
```

por:

```
Disparadores canónicos: CTA «Dejar mi voz en el mapa», CTA header «Sembrar tu voz», botón «Este es mi instante» (La idea, Cap I), CTA «Dejar mi voz» (La idea, Cap III), primera voz soltada.
```

- [ ] **Step 7: Correr y ver PASS.**

Run: `pnpm -C apps/web exec vitest run src/pages/LaIdea src/pages/__tests__/LaIdea.test.tsx`
Esperado: PASS los 3 suites nuevos + el de página.

- [ ] **Step 8: Verificación completa y commit.**

Run: `pnpm verify`. Esperado: verde.

```bash
git add apps/web/src/pages/LaIdea.tsx \
        apps/web/src/pages/LaIdea/la-idea-data.ts \
        apps/web/src/pages/LaIdea/sections/CapituloMetodo.tsx \
        apps/web/src/pages/LaIdea/sections/CapituloSinLider.tsx \
        apps/web/src/pages/LaIdea/sections/__tests__/CapituloMetodo.test.tsx \
        apps/web/src/pages/LaIdea/sections/__tests__/CapituloSinLider.test.tsx \
        apps/web/src/pages/__tests__/LaIdea.test.tsx \
        docs/design-system/README.md
git commit -m "feat(web): La idea — Capítulos II y III, método y sin líder"
```

---

### Task 3: Swap de router — `/la-idea` canónica, redirects, `PAPEL_ROUTES`, borrar las páginas v1, prueba en navegador

**Files:**
- Modify: `apps/web/src/App.tsx` (import de wouter, bloques `lazy`, rutas)
- Modify: `apps/web/src/layouts/RootLayout.tsx:17` (`PAPEL_ROUTES`)
- Modify: `apps/web/src/components/papel/papel-nav.ts:16` (href del nav — archivo de datos; `PapelHeader`/`PapelFooter` NO se tocan)
- Delete: `apps/web/src/pages/LaVision.tsx`
- Delete: `apps/web/src/pages/ElInstanteDelHombreGris.tsx`

**Interfaces:**
- Consumes: `LaIdea` (named export de `~/pages/LaIdea`, Task 1) · `Redirect` de wouter v3.
- Produces: ruta canónica `/la-idea` con chrome papel; `/la-vision` y `/el-instante-del-hombre-gris` redirigen con `replace`.

- [ ] **Step 1: App.tsx.** En la línea 3, sumar `Redirect` al import:

```tsx
import { Redirect, Route, Switch } from 'wouter';
```

Reemplazar el bloque lazy de `LaVision` (líneas ~47-50) por:

```tsx
const LaIdea = lazy(async () => {
  const m = await import('~/pages/LaIdea');
  return { default: m.LaIdea };
});
```

Borrar entero el bloque lazy de `ElInstanteDelHombreGris` (líneas ~63-66).

En el `<Switch>`, reemplazar las dos rutas viejas (`/la-vision` línea ~232 y `/el-instante-del-hombre-gris` línea ~236) por:

```tsx
{/* La idea — fusión papel de las v1 /la-vision + /el-instante-del-hombre-gris */}
<Route path="/la-idea" component={LaIdea} />
<Route path="/la-vision">
  <Redirect to="/la-idea" replace />
</Route>
<Route path="/el-instante-del-hombre-gris">
  <Redirect to="/la-idea" replace />
</Route>
```

- [ ] **Step 2: RootLayout.** En `RootLayout.tsx:17`:

```tsx
const PAPEL_ROUTES = new Set(['/', '/la-idea']);
```

- [ ] **Step 3: Nav papel.** En `papel-nav.ts:16`:

```ts
  { href: '/la-idea', label: 'La idea', num: '01' },
```

- [ ] **Step 4: Borrar las páginas v1 y verificar que nada las importa.**

```bash
git rm apps/web/src/pages/LaVision.tsx apps/web/src/pages/ElInstanteDelHombreGris.tsx
grep -rn "LaVision\|ElInstanteDelHombreGris" apps/web/src
```

Esperado: el grep no devuelve nada. (Los strings `/la-vision` que quedan en `Home/sections/*`, `Header.tsx`, `Footer.tsx` y `Home.test.tsx` son hrefs que sirve el redirect — protocolo una-página; la Fase 7 los limpia. No tocarlos.)

- [ ] **Step 5: Suite completa.**

Run: `pnpm -C apps/web test:unit`
Esperado: PASS — `PapelHeader.test.tsx` itera `PAPEL_NAV` dinámicamente, así que el href nuevo pasa solo; `Home.test.tsx` no se tocó y sigue verde.

- [ ] **Step 6: Verificación completa.**

Run: `pnpm verify`
Esperado: lint + type-check + tests + build verdes.

- [ ] **Step 7: Prueba en navegador (DoD del protocolo, con capturas).**

Run: `pnpm dev` (levanta api + web; abrir el puerto que reporta Vite).

Desktop (1280×800):
1. Ir a `/la-idea` **con localStorage limpio**: velo gris activo, H1 se entinta letra por letra, Cap I sobre banda gris con botón «Este es mi instante». Captura.
2. Click en «Este es mi instante»: velo se disuelve (~1.4s), la banda del Cap I pasa a papel crudo (~1s), la caja estampa `¡BASTA!`. Captura.
3. Scroll: Cap II (roles + ciclo + sello «No es doctrina» + CTA a `/planes`) y Cap III (3 sellos + línea «N voces ya están en el mapa» + CTA «Dejar mi voz →»). Capturas.
4. Navegar a `/la-vision` y a `/el-instante-del-hombre-gris`: la URL queda en `/la-idea` (replace, sin entrada en el historial).
5. El nav del header «La idea» apunta a `/la-idea`.
6. Recargar `/la-idea` ya despierto: sin velo, banda papel crudo, caja en estado `¡BASTA!` sin botón.
7. Teclado: tab hasta «Este es mi instante» y los CTAs — focus violeta visible.

Mobile (375×812): repetir 1–3 — todo colapsa a 1 columna, targets ≥ 44px. Capturas.

Reduced motion (emulación del navegador): el H1 aparece entintado (estado final), sin animaciones; el despertar cambia estados sin transición.

- [ ] **Step 8: Commit.**

```bash
git add apps/web/src/App.tsx \
        apps/web/src/layouts/RootLayout.tsx \
        apps/web/src/components/papel/papel-nav.ts
git commit -m "feat(web): La idea papel en /la-idea — redirects, nav y páginas v1 borradas"
```

(El `git rm` del Step 4 ya dejó los borrados en stage.)

---

## Self-review

- **Cobertura de la spec:** portada + rito (T1) · Cap I gris→color + aside del nombre + caja despertar (T1) · Cap II roles/ciclo/prueba (T2) · Cap III sellos/voces/CTA (T2) · ruta, redirects, nav, PAPEL_ROUTES, borrado, DoD navegador (T3) · enmiendas §5 y §10.7 (T1/T2, mismo commit que su feature). La decisión sobre `/una-ruta-para-argentina` es solo registro en la spec — se ejecuta en la fase 3.6, no acá.
- **Sin placeholders:** todo el copy y el código están completos en los steps.
- **Consistencia de tipos:** `RitoTintaProps`/`RolRow`/`CicloPaso`/`SinLiderCard` idénticos entre data, secciones y tests; `LaIdea` named+default export como espera el lazy de T3; `PLAN_COUNT` viene de `la-idea-data.ts` (no del `landing-data` de Home — no se cruzan páginas).
- **LOC:** archivo más grande `CapituloHombreGris.tsx` ≈ 120 LOC — todos bajo 300.
