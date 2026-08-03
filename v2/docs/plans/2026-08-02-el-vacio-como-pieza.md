# El vacío como pieza — plan de implementación

> **Para quien lo ejecute:** cada paso es una casilla. Se sigue en orden y cada tarea termina en commit propio.

**Spec:** `docs/specs/2026-08-02-el-vacio-como-pieza.md`
**Objetivo:** que el mapa sin voces se lea como un país esperando y no como una herramienta rota, sin sembrar un solo dato.

**Arquitectura:** cinco tareas, todas en `apps/web`. No hay backend, no hay esquema, no hay datos. Los estados vacíos son condiciones sobre el conteo real — no hay modo, no hay flag, no hay nada que apagar después.

**Stack:** React 18 + TypeScript strict, vitest + Testing Library.

## Restricciones globales

- **No se siembra nada, en ningún lado** (spec V1). Ni base, ni cliente, ni fixture que llegue a producción.
- **Ningún vacío se disculpa** (V3). Prohibidas las cadenas «no hay datos», «sin datos disponibles», «no disponible». Hay un test que las busca (Tarea 5).
- **Ningún vacío necesita apagarse** (V4). Toda condición es `total === 0`, nunca un flag.
- **Cobertura y Simulación NO llevan estado vacío** (spec §3.4 y §3.5). Su vacío ya es su contenido.
- **Castellano rioplatense** en todo el texto de cara al usuario.
- **Commitear con rutas explícitas.** Nunca `-a` ni `add -A`: hay sesiones concurrentes (D-010).
- Archivos ≤ 300 LOC · nada de `: any` · nada de `console.*`.

## Un hallazgo que el plan tiene que arreglar

Buscando el contador de la cabecera apareció `DEMO_VOCES_COUNT = '12.496'` en `apps/web/src/components/papel/papel-nav.ts:57`. Es un número **fabricado** que la cabecera muestra en TODAS las páginas mientras la consulta carga o si falla. Su propio comentario dice «la plataforma real arranca en cero, y eso también está bien» — o sea que alguien ya lo sabía y lo dejó igual.

Es la misma mentira que acabamos de borrar de la base, en el lugar más visible del sitio. Muere en la Tarea 1.

## Estructura de archivos

| Archivo | Responsabilidad |
|---|---|
| `components/papel/papel-nav.ts` | Sale `DEMO_VOCES_COUNT` |
| `components/papel/PapelHeader.tsx` | El contador cambia de signo en cero |
| `components/papel/PapelFooter.tsx` | El pie deja de prometer datos de demostración |
| `pages/ElMapa/sections/FeedVoces.tsx` | Su vacío |
| `pages/ElMapa/instrumento/Vacio.tsx` | **Nuevo.** La pieza compartida de los vacíos del instrumento |
| `pages/ElMapa/instrumento/modos/useModo{Mapa,Analisis,Tiempo}.tsx` | Cada uno pasa su vacío |
| `pages/ElMapa/instrumento/__tests__/vacios.test.tsx` | **Nuevo.** Las guardas |

---

### Tarea 1: El contador de la cabecera cambia de signo

**Archivos:**
- Modificar: `apps/web/src/components/papel/papel-nav.ts:50-57`
- Modificar: `apps/web/src/components/papel/PapelHeader.tsx:5-12,31-36,55-57`
- Test: `apps/web/src/components/__tests__/PapelHeader.test.tsx`

**Interfaces:**
- Consume: `useVocesCount()` de `~/lib/queries/analytics`, que devuelve `{ total: number } | undefined`
- Produce: nada nuevo. `DEMO_VOCES_COUNT` deja de existir.

- [ ] **Paso 1: los tests que fallan**

Reemplazar en `PapelHeader.test.tsx` las dos aserciones que usan `DEMO_VOCES_COUNT` (líneas 35 y 46) y sacar su import de la línea 5. Agregar:

```tsx
it('en cero, el contador invita en vez de contar', () => {
  vi.mocked(useVocesCount).mockReturnValue({ data: { total: 0 } } as ReturnType<typeof useVocesCount>);
  render(<PapelHeader />);
  expect(screen.getByText('nadie habló todavía · empezá vos')).toBeInTheDocument();
});

it('con una sola voz vuelve a contar, sin que nadie apague nada', () => {
  vi.mocked(useVocesCount).mockReturnValue({ data: { total: 1 } } as ReturnType<typeof useVocesCount>);
  render(<PapelHeader />);
  expect(screen.getByText('1 voces · falta la tuya')).toBeInTheDocument();
});

it('mientras carga no inventa un número', () => {
  // Antes caía a DEMO_VOCES_COUNT = '12.496', un número fabricado en el lugar
  // más visible del sitio. Ahora no muestra nada hasta saber.
  vi.mocked(useVocesCount).mockReturnValue({ data: undefined } as ReturnType<typeof useVocesCount>);
  render(<PapelHeader />);
  expect(screen.queryByText(/12\.496/)).not.toBeInTheDocument();
  expect(screen.queryByText(/voces/)).not.toBeInTheDocument();
});
```

Agregar arriba del archivo, si no está: `vi.mock('~/lib/queries/analytics', () => ({ useVocesCount: vi.fn() }));` y `import { useVocesCount } from '~/lib/queries/analytics';`.

- [ ] **Paso 2: verlos fallar**

Correr: `cd apps/web && npx vitest run src/components/__tests__/PapelHeader.test.tsx`
Esperado: FAIL — `Unable to find an element with the text: nadie habló todavía · empezá vos`

- [ ] **Paso 3: la implementación mínima**

En `papel-nav.ts`, borrar el bloque completo (comentario incluido):

```ts
/**
 * Dato de demostración hasta que exista el endpoint real de voces
 * (la plataforma real arranca en cero, y eso también está bien).
 */
export const DEMO_VOCES_COUNT = '12.496';
```

En `PapelHeader.tsx`, sacar `DEMO_VOCES_COUNT,` del import y reemplazar el cálculo:

```tsx
  const vocesQuery = useVocesCount();
  /**
   * Tres estados y ninguna invención. Mientras no sabemos, no decimos nada:
   * antes se caía a un número fabricado, que es peor que un hueco.
   */
  const total = vocesQuery.data?.total;
  const leyendaVoces =
    total === undefined
      ? null
      : total === 0
        ? 'nadie habló todavía · empezá vos'
        : `${total.toLocaleString('es-AR')} voces · falta la tuya`;
```

Y el JSX:

```tsx
            {leyendaVoces === null ? null : (
              <span className="font-space text-tinta-50 hidden text-[10px] uppercase tracking-[0.14em] min-[561px]:inline">
                {leyendaVoces}
              </span>
            )}
```

- [ ] **Paso 4: verlos pasar**

Correr: `cd apps/web && npx vitest run src/components/__tests__/PapelHeader.test.tsx`
Esperado: PASS

Correr: `cd v2 && npx tsc --noEmit -p apps/web/tsconfig.json`
Esperado: sin salida — si alguien más importaba `DEMO_VOCES_COUNT`, acá se entera.

- [ ] **Paso 5: commit**

```bash
git add v2/apps/web/src/components/papel/papel-nav.ts v2/apps/web/src/components/papel/PapelHeader.tsx v2/apps/web/src/components/__tests__/PapelHeader.test.tsx
git commit -m "Fix el contador de la cabecera: 12.496 voces era un número inventado"
```

---

### Tarea 2: El pie deja de prometer datos que ya no existen

**Archivos:**
- Modificar: `apps/web/src/components/papel/PapelFooter.tsx:82`
- Test: `apps/web/src/components/papel/__tests__/PapelFooter.test.tsx` (crear si no existe)

**Interfaces:**
- Consume: nada · Produce: nada

- [ ] **Paso 1: el test que falla**

```tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { PapelFooter } from '../PapelFooter';

describe('PapelFooter', () => {
  it('no promete datos de demostración: no hay ninguno', () => {
    // La base está en cero desde que se cerró D-002. Decir «datos de
    // demostración» prometía algo que no existe.
    render(<PapelFooter />);
    expect(screen.queryByText(/datos de demostración/i)).not.toBeInTheDocument();
    expect(screen.getByText('Prototipo · todavía sin voces')).toBeInTheDocument();
  });
});
```

- [ ] **Paso 2: verlo fallar**

Correr: `cd apps/web && npx vitest run src/components/papel/__tests__/PapelFooter.test.tsx`
Esperado: FAIL — encuentra «Prototipo con datos de demostración»

- [ ] **Paso 3: la implementación mínima**

En `PapelFooter.tsx`, reemplazar la línea 82:

```tsx
          <span>Prototipo · todavía sin voces</span>
```

- [ ] **Paso 4: verlo pasar**

Correr: `cd apps/web && npx vitest run src/components/papel/__tests__/PapelFooter.test.tsx`
Esperado: PASS

- [ ] **Paso 5: commit**

```bash
git add v2/apps/web/src/components/papel/PapelFooter.tsx v2/apps/web/src/components/papel/__tests__/PapelFooter.test.tsx
git commit -m "Fix el pie: ya no hay datos de demostración que prometer"
```

---

### Tarea 3: El vacío del feed ya existe — falta el test que lo cuida

**Archivos:**
- Test: `apps/web/src/pages/ElMapa/sections/__tests__/FeedVoces.test.tsx`

**Interfaces:**
- Consume: los mocks `useVocesAbiertas` / `useProvincias` que el archivo ya define
- Produce: nada

`FeedVoces.tsx:32-36` **ya resuelve su vacío**, y mejor de lo que decía el borrador de la spec:

> El país todavía no dijo nada acá. Empezá vos.

Invita, no se disculpa y está en voz. **No se toca ni una palabra.** Lo que falta es el test: hoy nada impide que alguien lo reemplace por «no hay datos disponibles» sin que falle nada.

- [ ] **Paso 1: el test que falla**

Agregar al final del `describe('FeedVoces', …)` de `FeedVoces.test.tsx`:

```tsx
  it('sin voces invita, y no se disculpa', () => {
    mockVoces.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof useVocesAbiertas>);

    render(<FeedVoces />);

    expect(screen.getByText('El país todavía no dijo nada acá. Empezá vos.')).toBeInTheDocument();
    expect(screen.queryByText(/no hay datos/i)).not.toBeInTheDocument();
  });
```

- [ ] **Paso 2: verlo pasar y confirmar que prueba algo**

Correr: `cd apps/web && npx vitest run src/pages/ElMapa/sections/__tests__/FeedVoces.test.tsx`
Esperado: PASS.

**Este test pasa a la primera, y eso es un problema.** Un test que nunca falló no prueba que prueba. Para verificarlo: cambiar temporalmente el texto de `FeedVoces.tsx:34` por `'x'`, correr el test, confirmar que FALLA, y revertir. Recién ahí vale.

- [ ] **Paso 3: commit**

```bash
git add v2/apps/web/src/pages/ElMapa/sections/__tests__/FeedVoces.test.tsx
git commit -m "Add el test que cuida el vacío del feed, que ya estaba bien escrito"
```

---

### Tarea 4: Los vacíos del instrumento

**Archivos:**
- Crear: `apps/web/src/pages/ElMapa/instrumento/Vacio.tsx`
- Modificar: `apps/web/src/pages/ElMapa/instrumento/modos/useModoMapa.tsx`
- Modificar: `apps/web/src/pages/ElMapa/instrumento/modos/useModoAnalisis.tsx`
- Modificar: `apps/web/src/pages/ElMapa/instrumento/modos/useModoTiempo.tsx`
- Test: `apps/web/src/pages/ElMapa/instrumento/__tests__/vacios.test.tsx`

**Interfaces:**
- Consume: `ResultadoModo.sobreMapa` de `modos/tipos.ts` — el hueco que ya existe para lo que se dibuja ENCIMA del mapa
- Produce: `<Vacio titulo="…" cuerpo="…" accion={{ href, etiqueta }} />`

**Nota:** los tres vacíos se montan en `sobreMapa`, no en `capas`. Es la ranura correcta y ya existe: son texto sobre el mapa, no capas de maplibre.

- [ ] **Paso 1: el test que falla**

```tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Vacio } from '../Vacio';

describe('Vacio', () => {
  it('muestra su título, su cuerpo y su acción', () => {
    render(
      <Vacio
        titulo="Todavía no habló nadie."
        cuerpo="La primera voz del mapa puede ser la tuya."
        accion={{ href: '#soltar', etiqueta: 'Soltar la primera voz' }}
      />,
    );
    expect(screen.getByText('Todavía no habló nadie.')).toBeInTheDocument();
    expect(screen.getByText('La primera voz del mapa puede ser la tuya.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /soltar la primera voz/i })).toHaveAttribute('href', '#soltar');
  });

  it('la acción es opcional', () => {
    render(<Vacio titulo="La línea arranca cuando alguien la arranque." cuerpo="Acá va a verse el día que el mapa se despertó." />);
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('no tapa el mapa: deja pasar el puntero', () => {
    // Un cartel que roba el arrastre convierte una invitación en un estorbo.
    const { container } = render(<Vacio titulo="T" cuerpo="C" />);
    expect(container.firstElementChild?.className).toContain('pointer-events-none');
  });
});
```

- [ ] **Paso 2: verlo fallar**

Correr: `cd apps/web && npx vitest run src/pages/ElMapa/instrumento/__tests__/vacios.test.tsx`
Esperado: FAIL — `Failed to load url ../Vacio`

- [ ] **Paso 3: la implementación mínima**

`apps/web/src/pages/ElMapa/instrumento/Vacio.tsx`:

```tsx
/**
 * El vacío de una lente — spec `2026-08-02-el-vacio-como-pieza.md` §3.
 *
 * No se disculpa y no dice «no hay datos»: contesta la misma pregunta que la
 * lente contestaría con datos, en su versión de cero. Y no roba el puntero,
 * porque un cartel que impide arrastrar el mapa convierte una invitación en un
 * estorbo.
 */
export function Vacio({
  titulo,
  cuerpo,
  accion,
}: {
  titulo: string;
  cuerpo: string;
  accion?: { href: string; etiqueta: string };
}) {
  return (
    <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center p-6">
      <div className="max-w-[38ch] text-center">
        <p className="font-anton text-papel text-[clamp(20px,2.6vw,30px)] leading-[1.1]">{titulo}</p>
        <p className="text-oscuro-secundario mt-2 text-[14px] leading-relaxed">{cuerpo}</p>
        {accion ? (
          <a
            href={accion.href}
            className="font-space text-tinta bg-papel pointer-events-auto mt-4 inline-block px-4 py-2 text-[11px] uppercase tracking-[0.14em]"
          >
            {accion.etiqueta}
          </a>
        ) : null}
      </div>
    </div>
  );
}
```

- [ ] **Paso 4: verlo pasar**

Correr: `cd apps/web && npx vitest run src/pages/ElMapa/instrumento/__tests__/vacios.test.tsx`
Esperado: PASS, 3 tests

- [ ] **Paso 5: cablear los tres modos**

En `useModoMapa.tsx`, agregar al objeto que retorna (junto a `sobreMapa` si ya existe, o como campo nuevo):

```tsx
    sobreMapa:
      ctx.todas.length === 0 && !ctx.cargando ? (
        <Vacio
          titulo="Todavía no habló nadie."
          cuerpo="La primera voz del mapa puede ser la tuya."
          accion={{ href: '#soltar-tu-voz', etiqueta: 'Soltar la primera voz' }}
        />
      ) : null,
```

En `useModoAnalisis.tsx`:

```tsx
    sobreMapa:
      ctx.todas.length === 0 && !ctx.cargando ? (
        <Vacio
          titulo="Ninguna provincia tiene todavía con qué hablar."
          cuerpo="Cuando entren las primeras voces esto se llena de intensidades: quién habla más, por habitante, por territorio. Tocá una provincia para ver cuántas voces necesita."
        />
      ) : null,
```

En `useModoTiempo.tsx`:

```tsx
    sobreMapa:
      ctx.todas.length === 0 && !ctx.cargando ? (
        <Vacio
          titulo="La línea arranca cuando alguien la arranque."
          cuerpo="Acá va a verse el día que el mapa se despertó."
        />
      ) : null,
```

Los tres necesitan `import { Vacio } from '../Vacio';`. Si un modo ya devuelve `sobreMapa`, envolver ambos en un fragmento en vez de pisar el que había.

- [ ] **Paso 6: los dos textos de Cobertura y Simulación**

**No llevan `<Vacio>`** — su vacío ya es su contenido (spec §3.4 y §3.5). Lo único que cambia es la redacción, para que el cero se lea como afirmación y no como falla.

En `useModoCobertura.tsx`, donde hoy se arma el conteo de celdas, la leyenda pasa a decir, cuando **todas** están mudas:

```tsx
`${String(celdas.length)} celdas. Las ${String(celdas.length)} en silencio.`
```

Manteniendo la redacción que ya tenga para el caso en que alguna esté observada.

En `modos/useModoSimulacion.tsx:86`, la etiqueta izquierda de la cortina se vuelve condicional:

```tsx
        etiquetaIzquierda={ctx.todas.length === 0 ? 'Hoy · nadie' : 'Hoy'}
```

- [ ] **Paso 7: verificar**

Correr: `cd apps/web && npx vitest run src/pages/ElMapa`
Esperado: todo verde

Correr: `cd v2 && npx tsc --noEmit -p apps/web/tsconfig.json`
Esperado: sin salida

- [ ] **Paso 8: commit**

```bash
git add v2/apps/web/src/pages/ElMapa/instrumento/Vacio.tsx v2/apps/web/src/pages/ElMapa/instrumento/modos/ v2/apps/web/src/pages/ElMapa/instrumento/__tests__/vacios.test.tsx
git commit -m "Add el vacío de cada lente — tres que invitan y dos que ya decían la verdad"
```

---

### Tarea 5: Las guardas del vacío

**Archivos:**
- Modificar: `apps/web/src/pages/ElMapa/instrumento/__tests__/vacios.test.tsx`

**Interfaces:**
- Consume: `Vacio`, los tres hooks de modo, `MODOS` de `catalogo-modos`
- Produce: nada

Estas son las guardas de la spec §6. Los estados vacíos son la parte más fácil de romper sin que nadie se entere: aparecen justo cuando no hay nadie mirando y desaparecen para siempre en cuanto entra el primer dato.

- [ ] **Paso 1: escribir las guardas**

Agregar al final de `vacios.test.tsx`:

```tsx
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

describe('guardas del vacío', () => {
  const DIR = join(process.cwd(), 'src/pages/ElMapa/instrumento');

  it('ningún vacío se disculpa', () => {
    // La tentación de escribir «no hay datos disponibles» es enorme y quien la
    // escriba no va a notar que rompió nada. Por eso la prohibición es un test
    // y no una convención.
    const prohibidas = [/no hay datos/i, /sin datos disponibles/i, /no disponible/i];
    const archivos = [
      join(DIR, 'Vacio.tsx'),
      ...readdirSync(join(DIR, 'modos')).map((f) => join(DIR, 'modos', f)),
    ].filter((f) => f.endsWith('.tsx'));

    for (const archivo of archivos) {
      const texto = readFileSync(archivo, 'utf8');
      for (const rx of prohibidas) {
        expect(rx.test(texto), `${archivo} se disculpa: ${String(rx)}`).toBe(false);
      }
    }
  });

  it('Cobertura y Simulación no tienen estado vacío', () => {
    // Su vacío ES su contenido. Si alguien les agrega un cartel por simetría,
    // le tapa a Cobertura su estado más verdadero y a la Simulación el gesto
    // que la justifica.
    for (const modo of ['useModoCobertura.tsx', 'useModoSimulacion.tsx']) {
      const texto = readFileSync(join(DIR, 'modos', modo), 'utf8');
      expect(texto.includes('<Vacio'), `${modo} no debería tener <Vacio>`).toBe(false);
    }
  });

  it('las cinco lentes siguen estando, con datos o sin ellos', () => {
    // Una pestaña que desaparece cuando no hay datos enseña que la herramienta
    // es frágil.
    expect(MODOS.map((m) => m.id)).toEqual(['mapa', 'analisis', 'tiempo', 'cobertura', 'simulacion']);
  });
});
```

Agregar arriba del archivo: `import { MODOS } from '../catalogo-modos';`

- [ ] **Paso 2: correrlas**

Correr: `cd apps/web && npx vitest run src/pages/ElMapa/instrumento/__tests__/vacios.test.tsx`
Esperado: PASS, 6 tests en total

- [ ] **Paso 3: verificación completa**

```bash
cd v2 && pnpm lint && pnpm type-check && pnpm test && pnpm build
```

Esperado: los cuatro en verde.

- [ ] **Paso 4: verificación en el navegador**

Con la base en cero, abrir `http://localhost:5273/el-mapa` y recorrer las cinco lentes. Confirmar que Mapa, Análisis y Línea de tiempo muestran su vacío; que Cobertura dice cuántas celdas están en silencio; y que la Simulación tiene el lado izquierdo vacío y el derecho lleno.

**Ojo:** este navegador no pinta teselas, así que lo que se puede verificar es el DOM, no la imagen.

- [ ] **Paso 5: commit**

```bash
git add v2/apps/web/src/pages/ElMapa/instrumento/__tests__/vacios.test.tsx
git commit -m "Add las guardas del vacío, incluida la que prohíbe disculparse"
```

---

## Lo que este plan NO hace

- **No siembra** ni un dato, en ningún lado.
- **No toca Cobertura ni Simulación** más allá de dejarlas como están.
- **No agrega un modo demo.** Todas las condiciones son sobre el conteo real.
- **No cambia la primera voz.** Esa la carga una persona, y conviene que sea antes de mostrarle esto a nadie: un mapa con una voz cuenta que empezó, uno con cero cuenta que no arrancó.
