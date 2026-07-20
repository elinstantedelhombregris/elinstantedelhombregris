# Rediseño Protocolo Vivo — Plan A: el núcleo del protocolo

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir el núcleo local del Coordination Protocol dentro de `juego/`: misiones con máquina de estados, obras con evidencia, pulsos con presupuesto diario, constelaciones de oficio con decay, y La Corriente v0 (feed local).

**Architecture:** Motor puro en `src/protocolo/` (TS sin React, TDD como `src/game/`), persistencia fina en `src/db/repos-protocolo.ts` (patrón `DBExecutor` inyectable de `repos.ts`), 4 tablas nuevas `pv_*` (migración drizzle 0017), y 4 pantallas expo-router que solo renderizan estado del protocolo. Todo local-first; la federación (API) es el Plan D.

**Tech Stack:** Expo SDK 57, expo-router (rutas en `src/app/`), drizzle-orm + expo-sqlite (migraciones `.sql` via babel inline-import), NativeWind v4, vitest, react-native-svg.

## Global Constraints

- Todo texto visible en **castellano rioplatense** ("vos", "mirá", "sumate").
- **Violeta `#7D5BDE` SOLO para acción**; plata `#F5F7FA` para datos; fondo `#0a0a0a`.
- **Fuego privado / pulso social**: brasas y chispas jamás aparecen en superficies de red; pulsos jamás en la práctica privada.
- **5 pulsos de aprecio por día, iguales para todos** (`PULSOS_APRECIO_POR_DIA = 5`). El latido de misión NO consume presupuesto.
- **Nunca mostrar un score escalar de reputación.** Se muestra el portfolio (constelación), nunca un número de confianza.
- Ética spec §3.7: sin ads, sin IAP, sin dinero real, sin rankings individuales, datos 100% locales, export siempre disponible.
- Pitfalls SDK 57: registrar `cssInterop` para componentes animados nuevos (`src/lib/nativewind-setup.ts`); animaciones `entering` apagadas en web (usar `native()` de `src/motion/variants.ts`).
- La suite existente (**353 tests**) debe seguir verde en cada commit. Comandos siempre desde `juego/`: `npx tsc --noEmit` y `npx vitest run`.
- Nueva migración SIEMPRE via `npx drizzle-kit generate` (los `.sql` se importan como strings; registrar en `drizzle/migrations.js` copiando el patrón de la entrada 0016).
- Jamás commitear `.env`. Mensajes de commit en el estilo del repo, terminando con `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`.

## Mapa de archivos del Plan A

```
juego/
  src/content/oficios.ts                  # catálogo de 11 oficios + mapeo desde ListeningTheme
  src/protocolo/tipos.ts                  # tipos del protocolo (estados, gobernanza, pulsos)
  src/protocolo/mision.ts                 # máquina de estados pura + reglas de gobernanza
  src/protocolo/pulsos.ts                 # presupuesto diario, dedup, latido
  src/protocolo/brillo.ts                 # decay de confianza → brillo de constelación
  src/protocolo/*.test.ts                 # un test colocalizado por módulo
  src/db/schema.ts                        # + pvMisiones, pvMisionMiembros, pvObras, pvPulsos
  drizzle/0017_protocolo_vivo.sql         # generada por drizzle-kit
  src/db/repos-protocolo.ts               # persistencia fina que delega validación al motor puro
  src/civic/protocolo-migration.test.ts   # test de la migración (harness DatabaseSync)
  src/app/misiones/index.tsx              # lista de misiones por estado
  src/app/misiones/fundar.tsx             # wizard de fundación
  src/app/misiones/[id].tsx               # detalle: miembros, transiciones, latido
  src/app/obras/publicar.tsx              # resolver misión → publicar obra con evidencia
  src/app/corriente.tsx                   # La Corriente v0 (feed local) + pulsos
  src/app/index.tsx                       # dock: + ícono Corriente; src/app/territorio/index.tsx: + card Misiones
  src/app/album.tsx                       # + solapa "Oficios" (constelaciones con brillo)
```

---

### Task 0: Checkpoint del árbol de trabajo

El working tree tiene ~8.5k líneas sin commitear (capa cívica "Territorio Vivo" de otra sesión + rediseño del cielo + 14 fixes de auditoría + parche Skia). Este plan arranca de un checkpoint limpio.

**Files:** ninguno nuevo — commit de todo lo existente.

- [ ] **Step 1: Verificar que el árbol está sano**

Run: `cd /Users/juanb/Desktop/ElInstantedelHombreGris/juego && npx tsc --noEmit && npx vitest run 2>&1 | tail -3`
Expected: tsc sin salida; `Tests  353 passed (353)`.

- [ ] **Step 2: Commit checkpoint (solo juego/ y docs del juego)**

```bash
cd /Users/juanb/Desktop/ElInstantedelHombreGris
git add juego/ docs/superpowers/plans/2026-07-19-protocolo-vivo-plan-a-nucleo.md
git commit -m "feat: Territorio Vivo (capa cívica) + cielo con atmósfera + fixes de auditoría — checkpoint pre-protocolo

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

NO tocar los archivos pre-existentes fuera de `juego/` (v2/, pnpm-lock.yaml, el archivo Russell Ackoff borrado): quedan fuera del add.

---

### Task 1: Oficios — catálogo y mapeo

**Files:**
- Create: `juego/src/content/oficios.ts`
- Test: `juego/src/content/oficios.test.ts`

**Interfaces:**
- Produces: `type OficioId` (unión de 11 ids kebab-case), `interface Oficio { id: OficioId; nombre: string; icono: string; color: string }`, `OFICIOS: readonly Oficio[]`, `oficioPorId(id: string): Oficio | null`, `oficioDeTema(tema: ListeningTheme): OficioId`.
- Consumes: `type ListeningTheme` de `src/civic/types.ts` (abrir ese archivo y cubrir TODOS los miembros de la unión — el `Record` exhaustivo de TS lo garantiza en compilación).

- [ ] **Step 1: Escribir el test que falla**

```ts
// juego/src/content/oficios.test.ts
import { describe, expect, it } from 'vitest';
import { LISTENING_THEMES } from '../civic/listening';
import { OFICIOS, oficioDeTema, oficioPorId } from './oficios';

const HEX = /^#[0-9a-fA-F]{6}$/;

describe('oficios', () => {
  it('hay 11 oficios con ids únicos, color hex e ícono', () => {
    expect(OFICIOS).toHaveLength(11);
    expect(new Set(OFICIOS.map((o) => o.id)).size).toBe(11);
    for (const o of OFICIOS) {
      expect(o.color).toMatch(HEX);
      expect(o.icono.length).toBeGreaterThan(0);
      expect(o.nombre.length).toBeGreaterThan(0);
    }
  });

  it('todo tema de escucha mapea a un oficio existente', () => {
    for (const tema of LISTENING_THEMES) {
      const id = oficioDeTema(tema);
      expect(oficioPorId(id)).not.toBeNull();
    }
  });

  it('oficioPorId devuelve null para desconocidos', () => {
    expect(oficioPorId('no-existe')).toBeNull();
  });
});
```

- [ ] **Step 2: Correr y verificar que falla**

Run: `npx vitest run src/content/oficios.test.ts`
Expected: FAIL — `Cannot find module './oficios'`.

- [ ] **Step 3: Implementar**

```ts
// juego/src/content/oficios.ts
/**
 * Oficios — los dominios de capacidad demostrada del Protocolo Vivo
 * (Capability Layer). Un oficio agrupa obras; las obras de un oficio
 * forman tu constelación de oficio. Los ids son estables: se persisten.
 */
import type { ListeningTheme } from '../civic/types';

export type OficioId =
  | 'alimentacion' | 'vivienda' | 'trabajo' | 'cuidados' | 'salud'
  | 'educacion' | 'ambiente' | 'movilidad' | 'convivencia'
  | 'cultura' | 'participacion';

export interface Oficio {
  id: OficioId;
  nombre: string;
  /** Nombre de ícono Ionicons. */
  icono: string;
  color: string;
}

export const OFICIOS: readonly Oficio[] = [
  { id: 'alimentacion', nombre: 'Alimentación', icono: 'nutrition-outline', color: '#f59e0b' },
  { id: 'vivienda', nombre: 'Vivienda', icono: 'home-outline', color: '#f97316' },
  { id: 'trabajo', nombre: 'Trabajo', icono: 'hammer-outline', color: '#eab308' },
  { id: 'cuidados', nombre: 'Cuidados', icono: 'heart-outline', color: '#ec4899' },
  { id: 'salud', nombre: 'Salud', icono: 'medkit-outline', color: '#ef4444' },
  { id: 'educacion', nombre: 'Educación', icono: 'book-outline', color: '#3b82f6' },
  { id: 'ambiente', nombre: 'Ambiente', icono: 'leaf-outline', color: '#10b981' },
  { id: 'movilidad', nombre: 'Movilidad', icono: 'bus-outline', color: '#14b8a6' },
  { id: 'convivencia', nombre: 'Convivencia', icono: 'shield-outline', color: '#8b5cf6' },
  { id: 'cultura', nombre: 'Cultura y comunidad', icono: 'people-outline', color: '#a855f7' },
  { id: 'participacion', nombre: 'Participación', icono: 'megaphone-outline', color: '#7D5BDE' },
];

export const oficioPorId = (id: string): Oficio | null =>
  OFICIOS.find((o) => o.id === id) ?? null;

/**
 * Mapeo exhaustivo tema-de-escucha → oficio. Abrí `src/civic/types.ts`,
 * copiá la unión ListeningTheme y completá: el Record exhaustivo hace que
 * TS rompa la compilación si aparece un tema nuevo sin oficio.
 */
const OFICIO_POR_TEMA: Record<ListeningTheme, OficioId> = {
  // Completar con los miembros reales de ListeningTheme, p.ej.:
  // food: 'alimentacion', housing: 'vivienda', work: 'trabajo', ...
} as Record<ListeningTheme, OficioId>;

export const oficioDeTema = (tema: ListeningTheme): OficioId =>
  OFICIO_POR_TEMA[tema];
```

IMPORTANTE: el `as Record<...>` de arriba es solo para que el snippet compile en el plan — al implementar, completá el objeto con TODOS los temas reales y BORRÁ el `as` para que la exhaustividad de TS quede activa. Si `LISTENING_THEMES` no existe en `src/civic/listening.ts` con ese nombre, buscá el export real (`grep -n "LISTENING_THEMES" src/civic/listening.ts`) y ajustá el import del test.

- [ ] **Step 4: Verificar verde**

Run: `npx vitest run src/content/oficios.test.ts && npx tsc --noEmit`
Expected: 3 tests PASS; tsc sin salida.

- [ ] **Step 5: Commit**

```bash
git add juego/src/content/oficios.ts juego/src/content/oficios.test.ts
git commit -m "feat: catálogo de oficios — dominios de capacidad del Protocolo Vivo

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 2: Máquina de estados de misión (motor puro)

**Files:**
- Create: `juego/src/protocolo/tipos.ts`
- Create: `juego/src/protocolo/mision.ts`
- Test: `juego/src/protocolo/mision.test.ts`

**Interfaces:**
- Produces:
  - `type EstadoMision = 'propuesta' | 'equipo' | 'activa' | 'verificacion' | 'resuelta' | 'abandonada'`
  - `type TipoMision = 'relevamiento' | 'obra' | 'diseno'`
  - `type Gobernanza = 'coordinada' | 'consentimiento'`
  - `type RolMiembro = 'coordinador' | 'miembro'`
  - `transicionValida(desde: EstadoMision, hacia: EstadoMision): boolean`
  - `puedeResolver(g: Gobernanza, actor: RolMiembro, aceptaciones: number, totalMiembros: number): boolean`

- [ ] **Step 1: Escribir el test que falla**

```ts
// juego/src/protocolo/mision.test.ts
import { describe, expect, it } from 'vitest';
import { puedeResolver, transicionValida } from './mision';

describe('máquina de estados de misión', () => {
  it('el camino feliz: propuesta→equipo→activa→verificacion→resuelta', () => {
    expect(transicionValida('propuesta', 'equipo')).toBe(true);
    expect(transicionValida('equipo', 'activa')).toBe(true);
    expect(transicionValida('activa', 'verificacion')).toBe(true);
    expect(transicionValida('verificacion', 'resuelta')).toBe(true);
  });

  it('la verificación puede volver a activa (obra rechazada)', () => {
    expect(transicionValida('verificacion', 'activa')).toBe(true);
  });

  it('abandonar se puede desde propuesta/equipo/activa, nunca desde resuelta', () => {
    expect(transicionValida('propuesta', 'abandonada')).toBe(true);
    expect(transicionValida('equipo', 'abandonada')).toBe(true);
    expect(transicionValida('activa', 'abandonada')).toBe(true);
    expect(transicionValida('resuelta', 'abandonada')).toBe(false);
  });

  it('no hay saltos: propuesta no va directo a activa ni a resuelta', () => {
    expect(transicionValida('propuesta', 'activa')).toBe(false);
    expect(transicionValida('propuesta', 'resuelta')).toBe(false);
    expect(transicionValida('resuelta', 'activa')).toBe(false);
  });

  it('gobernanza coordinada: solo el coordinador resuelve', () => {
    expect(puedeResolver('coordinada', 'coordinador', 0, 4)).toBe(true);
    expect(puedeResolver('coordinada', 'miembro', 4, 4)).toBe(false);
  });

  it('gobernanza por consentimiento: mayoría simple de miembros', () => {
    expect(puedeResolver('consentimiento', 'miembro', 2, 4)).toBe(true);  // 2 >= ceil(4/2)
    expect(puedeResolver('consentimiento', 'miembro', 1, 4)).toBe(false);
    expect(puedeResolver('consentimiento', 'coordinador', 1, 3)).toBe(false); // 1 < ceil(3/2)
    expect(puedeResolver('consentimiento', 'miembro', 2, 3)).toBe(true);
  });
});
```

- [ ] **Step 2: Correr y verificar que falla**

Run: `npx vitest run src/protocolo/mision.test.ts`
Expected: FAIL — `Cannot find module './mision'`.

- [ ] **Step 3: Implementar tipos + máquina**

```ts
// juego/src/protocolo/tipos.ts
/**
 * Tipos del Protocolo Vivo — el vocabulario compartido de misiones,
 * pulsos y oficios. Motor puro: nada de React, nada de DB.
 */
export type EstadoMision =
  | 'propuesta' | 'equipo' | 'activa' | 'verificacion' | 'resuelta' | 'abandonada';

export type TipoMision = 'relevamiento' | 'obra' | 'diseno';

export type Gobernanza = 'coordinada' | 'consentimiento';

export type RolMiembro = 'coordinador' | 'miembro';
```

```ts
// juego/src/protocolo/mision.ts
/**
 * Máquina de estados de misión (Mission Layer del protocolo):
 * PROPUESTA → EQUIPO → ACTIVA → VERIFICACION → RESUELTA, con vuelta
 * VERIFICACION→ACTIVA (obra rechazada) y ABANDONADA desde todo estado
 * no terminal. Al resolverse, la misión se disuelve: nada es permanente.
 */
import type { EstadoMision, Gobernanza, RolMiembro } from './tipos';

const TRANSICIONES: Record<EstadoMision, readonly EstadoMision[]> = {
  propuesta: ['equipo', 'abandonada'],
  equipo: ['activa', 'abandonada'],
  activa: ['verificacion', 'abandonada'],
  verificacion: ['resuelta', 'activa'],
  resuelta: [],
  abandonada: [],
};

export const transicionValida = (
  desde: EstadoMision,
  hacia: EstadoMision,
): boolean => TRANSICIONES[desde].includes(hacia);

/** Regla de resolución según la gobernanza elegida en la fundación. */
export const puedeResolver = (
  gobernanza: Gobernanza,
  actor: RolMiembro,
  aceptaciones: number,
  totalMiembros: number,
): boolean => {
  if (gobernanza === 'coordinada') return actor === 'coordinador';
  return aceptaciones >= Math.ceil(totalMiembros / 2);
};
```

- [ ] **Step 4: Verificar verde**

Run: `npx vitest run src/protocolo/mision.test.ts && npx tsc --noEmit`
Expected: 6 tests PASS; tsc limpio.

- [ ] **Step 5: Commit**

```bash
git add juego/src/protocolo/
git commit -m "feat: máquina de estados de misión — Mission Layer puro del Protocolo Vivo

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 3: Pulsos — presupuesto, dedup y latido (motor puro)

**Files:**
- Create: `juego/src/protocolo/pulsos.ts`
- Test: `juego/src/protocolo/pulsos.test.ts`

**Interfaces:**
- Produces:
  - `PULSOS_APRECIO_POR_DIA = 5`
  - `LATIDO_VENCE_DIAS = 7`
  - `pulsosDisponibles(dadosHoy: number): number`
  - `puedeDarPulso(dadosHoy: number, yaDioAlTarget: boolean): { ok: true } | { ok: false; motivo: 'sin-presupuesto' | 'repetido' }`
  - `latidoVencido(ultimoLatidoISO: string | null, ahoraISO: string): boolean`

- [ ] **Step 1: Escribir el test que falla**

```ts
// juego/src/protocolo/pulsos.test.ts
import { describe, expect, it } from 'vitest';
import {
  LATIDO_VENCE_DIAS,
  PULSOS_APRECIO_POR_DIA,
  latidoVencido,
  puedeDarPulso,
  pulsosDisponibles,
} from './pulsos';

describe('presupuesto de pulsos', () => {
  it('5 por día, iguales para todos, nunca negativo', () => {
    expect(PULSOS_APRECIO_POR_DIA).toBe(5);
    expect(pulsosDisponibles(0)).toBe(5);
    expect(pulsosDisponibles(3)).toBe(2);
    expect(pulsosDisponibles(5)).toBe(0);
    expect(pulsosDisponibles(9)).toBe(0);
  });

  it('no se puede pulsar sin presupuesto ni repetir target', () => {
    expect(puedeDarPulso(0, false)).toEqual({ ok: true });
    expect(puedeDarPulso(5, false)).toEqual({ ok: false, motivo: 'sin-presupuesto' });
    expect(puedeDarPulso(0, true)).toEqual({ ok: false, motivo: 'repetido' });
  });
});

describe('latido de misión', () => {
  it('vence a los 7 días; nunca haber latido cuenta como vencido', () => {
    expect(LATIDO_VENCE_DIAS).toBe(7);
    expect(latidoVencido(null, '2026-07-19T12:00:00.000Z')).toBe(true);
    expect(latidoVencido('2026-07-15T12:00:00.000Z', '2026-07-19T12:00:00.000Z')).toBe(false);
    expect(latidoVencido('2026-07-11T12:00:00.000Z', '2026-07-19T12:00:00.000Z')).toBe(true);
  });
});
```

- [ ] **Step 2: Correr y verificar que falla**

Run: `npx vitest run src/protocolo/pulsos.test.ts`
Expected: FAIL — `Cannot find module './pulsos'`.

- [ ] **Step 3: Implementar**

```ts
// juego/src/protocolo/pulsos.ts
/**
 * Pulsos — el primitivo de confianza del protocolo (Trust Layer).
 * Aprecio: presupuesto diario igual para todos (sinceridad por escasez,
 * sin plutocracia); un pulso por persona por obra, para siempre.
 * Latido: el "¿seguís?" semanal de las misiones activas — gratis,
 * porque es deber, no regalo.
 */
export const PULSOS_APRECIO_POR_DIA = 5;
export const LATIDO_VENCE_DIAS = 7;

export const pulsosDisponibles = (dadosHoy: number): number =>
  Math.max(0, PULSOS_APRECIO_POR_DIA - dadosHoy);

export type VeredictoPulso =
  | { ok: true }
  | { ok: false; motivo: 'sin-presupuesto' | 'repetido' };

export const puedeDarPulso = (
  dadosHoy: number,
  yaDioAlTarget: boolean,
): VeredictoPulso => {
  if (yaDioAlTarget) return { ok: false, motivo: 'repetido' };
  if (pulsosDisponibles(dadosHoy) === 0) return { ok: false, motivo: 'sin-presupuesto' };
  return { ok: true };
};

const MS_POR_DIA = 24 * 60 * 60 * 1000;

export const latidoVencido = (
  ultimoLatidoISO: string | null,
  ahoraISO: string,
): boolean => {
  if (!ultimoLatidoISO) return true;
  const dias = (Date.parse(ahoraISO) - Date.parse(ultimoLatidoISO)) / MS_POR_DIA;
  return dias > LATIDO_VENCE_DIAS;
};
```

- [ ] **Step 4: Verificar verde**

Run: `npx vitest run src/protocolo/pulsos.test.ts && npx tsc --noEmit`
Expected: 3 tests PASS; tsc limpio.

- [ ] **Step 5: Commit**

```bash
git add juego/src/protocolo/pulsos.ts juego/src/protocolo/pulsos.test.ts
git commit -m "feat: pulsos — presupuesto diario, dedup y latido de misión

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 4: Brillo de constelación — el decay de confianza (motor puro)

**Files:**
- Create: `juego/src/protocolo/brillo.ts`
- Test: `juego/src/protocolo/brillo.test.ts`

**Interfaces:**
- Produces:
  - `VIDA_MEDIA_DIAS = 90`
  - `brilloDeObras(fechasISO: readonly string[], ahoraISO: string): number`
  - `type NivelBrillo = 'apagada' | 'tenue' | 'viva' | 'radiante'`
  - `nivelDeBrillo(brillo: number): NivelBrillo`

- [ ] **Step 1: Escribir el test que falla**

```ts
// juego/src/protocolo/brillo.test.ts
import { describe, expect, it } from 'vitest';
import { VIDA_MEDIA_DIAS, brilloDeObras, nivelDeBrillo } from './brillo';

const AHORA = '2026-07-19T00:00:00.000Z';
const haceDias = (d: number): string =>
  new Date(Date.parse(AHORA) - d * 24 * 60 * 60 * 1000).toISOString();

describe('brillo con decay (trust half-life §4.2)', () => {
  it('una obra de hoy vale ~1; a la vida media vale ~0.5', () => {
    expect(brilloDeObras([haceDias(0)], AHORA)).toBeCloseTo(1, 5);
    expect(brilloDeObras([haceDias(VIDA_MEDIA_DIAS)], AHORA)).toBeCloseTo(0.5, 2);
    expect(brilloDeObras([haceDias(VIDA_MEDIA_DIAS * 2)], AHORA)).toBeCloseTo(0.25, 2);
  });

  it('las obras suman; sin obras el brillo es 0', () => {
    expect(brilloDeObras([], AHORA)).toBe(0);
    const tres = brilloDeObras([haceDias(0), haceDias(0), haceDias(0)], AHORA);
    expect(tres).toBeCloseTo(3, 5);
  });

  it('sos quien sos ahora: obra vieja pesa menos que obra nueva', () => {
    const vieja = brilloDeObras([haceDias(300)], AHORA);
    const nueva = brilloDeObras([haceDias(3)], AHORA);
    expect(nueva).toBeGreaterThan(vieja);
  });

  it('niveles para el render: apagada/tenue/viva/radiante', () => {
    expect(nivelDeBrillo(0)).toBe('apagada');
    expect(nivelDeBrillo(0.4)).toBe('tenue');
    expect(nivelDeBrillo(1.5)).toBe('viva');
    expect(nivelDeBrillo(3.2)).toBe('radiante');
  });
});
```

- [ ] **Step 2: Correr y verificar que falla**

Run: `npx vitest run src/protocolo/brillo.test.ts`
Expected: FAIL — `Cannot find module './brillo'`.

- [ ] **Step 3: Implementar**

```ts
// juego/src/protocolo/brillo.ts
/**
 * Brillo — el trust decay del protocolo, renderizado como cielo.
 * La reputación no se muestra jamás como número: se muestra como
 * constelación cuyo brillo refleja obra RECIENTE (vida media 90 días).
 * Sos quien sos ahora, no quien fuiste en 2012.
 */
export const VIDA_MEDIA_DIAS = 90;

const LAMBDA = Math.LN2 / VIDA_MEDIA_DIAS;
const MS_POR_DIA = 24 * 60 * 60 * 1000;

export const brilloDeObras = (
  fechasISO: readonly string[],
  ahoraISO: string,
): number => {
  const ahora = Date.parse(ahoraISO);
  return fechasISO.reduce((acc, f) => {
    const dias = Math.max(0, (ahora - Date.parse(f)) / MS_POR_DIA);
    return acc + Math.exp(-LAMBDA * dias);
  }, 0);
};

export type NivelBrillo = 'apagada' | 'tenue' | 'viva' | 'radiante';

export const nivelDeBrillo = (brillo: number): NivelBrillo => {
  if (brillo <= 0) return 'apagada';
  if (brillo < 1) return 'tenue';
  if (brillo < 3) return 'viva';
  return 'radiante';
};
```

- [ ] **Step 4: Verificar verde**

Run: `npx vitest run src/protocolo/brillo.test.ts && npx tsc --noEmit`
Expected: 4 tests PASS; tsc limpio.

- [ ] **Step 5: Commit**

```bash
git add juego/src/protocolo/brillo.ts juego/src/protocolo/brillo.test.ts
git commit -m "feat: brillo de constelación — trust decay renderizable, jamás un score

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 5: Schema + migración 0017

**Files:**
- Modify: `juego/src/db/schema.ts` (agregar al final, antes de los type exports)
- Create (generada): `juego/drizzle/0017_protocolo_vivo.sql`
- Modify: `juego/drizzle/migrations.js` (registrar 0017 copiando el patrón de la entrada 0016)
- Test: `juego/src/civic/protocolo-migration.test.ts`

**Interfaces:**
- Produces: tablas `pv_misiones`, `pv_mision_miembros`, `pv_obras`, `pv_pulsos`; exports drizzle `pvMisiones`, `pvMisionMiembros`, `pvObras`, `pvPulsos` + types `PvMisionRow`, `PvObraRow`, `PvPulsoRow`, `PvMiembroRow`.

- [ ] **Step 1: Agregar las tablas al schema**

```ts
// juego/src/db/schema.ts — agregar (seguir el estilo de las tablas civic_*)
/** Misiones del Protocolo Vivo (Mission Layer): máquina de estados local. */
export const pvMisiones = sqliteTable('pv_misiones', {
  id: text('id').primaryKey(),
  titulo: text('titulo').notNull(),
  proposito: text('proposito').notNull(),
  tipo: text('tipo').notNull(), // 'relevamiento' | 'obra' | 'diseno'
  oficioId: text('oficio_id').notNull(),
  estado: text('estado').notNull().default('propuesta'),
  gobernanza: text('gobernanza').notNull(), // 'coordinada' | 'consentimiento'
  territorio: text('territorio'),
  parentId: text('parent_id'),
  creadaPor: text('creada_por').notNull(), // actorKey del dispositivo
  createdAt: text('created_at').notNull(),
  resueltaAt: text('resuelta_at'),
});

export const pvMisionMiembros = sqliteTable(
  'pv_mision_miembros',
  {
    misionId: text('mision_id').notNull(),
    actorKey: text('actor_key').notNull(),
    rol: text('rol').notNull(), // 'coordinador' | 'miembro'
    comprometidoAt: text('comprometido_at').notNull(),
    ultimoLatidoAt: text('ultimo_latido_at'),
  },
  (t) => [primaryKey({ columns: [t.misionId, t.actorKey] })],
);

/** Obras: proof-of-output. La unidad de La Corriente. */
export const pvObras = sqliteTable('pv_obras', {
  id: text('id').primaryKey(),
  misionId: text('mision_id'),
  titulo: text('titulo').notNull(),
  resumen: text('resumen'),
  oficioId: text('oficio_id').notNull(),
  evidenciaUri: text('evidencia_uri'),
  territorio: text('territorio'),
  publicadaAt: text('publicada_at').notNull(),
  estado: text('estado').notNull().default('sin_corroborar'), // 'sin_corroborar' | 'corroborada'
});

/** Pulsos de aprecio: 1 por actor por target, para siempre. */
export const pvPulsos = sqliteTable(
  'pv_pulsos',
  {
    id: text('id').primaryKey(),
    targetTipo: text('target_tipo').notNull(), // 'obra' | 'mision'
    targetId: text('target_id').notNull(),
    actorKey: text('actor_key').notNull(),
    fecha: text('fecha').notNull(), // YYYY-MM-DD local (presupuesto diario)
    createdAt: text('created_at').notNull(),
  },
  (t) => [uniqueIndex('pv_pulsos_unico').on(t.actorKey, t.targetTipo, t.targetId)],
);

export type PvMisionRow = typeof pvMisiones.$inferSelect;
export type PvMiembroRow = typeof pvMisionMiembros.$inferSelect;
export type PvObraRow = typeof pvObras.$inferSelect;
export type PvPulsoRow = typeof pvPulsos.$inferSelect;
```

Si `primaryKey`/`uniqueIndex` no están importados arriba del archivo, agregarlos al import de `drizzle-orm/sqlite-core` (mirar cómo lo hacen las tablas existentes — `redeemed_nonces` usa PK compuesta).

- [ ] **Step 2: Generar la migración y registrarla**

Run: `npx drizzle-kit generate --name protocolo_vivo`
Expected: crea `drizzle/0017_protocolo_vivo.sql` y actualiza `drizzle/meta/_journal.json`.
Después: abrir `drizzle/migrations.js`, copiar la línea de import y la entrada del journal de la migración 0016 y replicarlas para 0017 (mismo patrón exacto).

- [ ] **Step 3: Escribir el test de la migración**

```ts
// juego/src/civic/protocolo-migration.test.ts
import { readFileSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import { describe, expect, it } from 'vitest';

const sql = readFileSync(
  new URL('../../drizzle/0017_protocolo_vivo.sql', import.meta.url),
  'utf8',
).replaceAll('--> statement-breakpoint', '');

describe('migración 0017 protocolo vivo', () => {
  it('crea las 4 tablas pv_* y el índice único de pulsos funciona', () => {
    const db = new DatabaseSync(':memory:');
    try {
      db.exec(sql);
      db.exec(`
        INSERT INTO pv_misiones (id, titulo, proposito, tipo, oficio_id, estado, gobernanza, creada_por, created_at)
        VALUES ('m1', 'Luminarias', 'Relevar la cuadra', 'relevamiento', 'convivencia', 'propuesta', 'coordinada', 'actor-a', '2026-07-19T00:00:00.000Z');
        INSERT INTO pv_obras (id, titulo, oficio_id, publicada_at)
        VALUES ('o1', 'Cuadra relevada', 'convivencia', '2026-07-19T01:00:00.000Z');
        INSERT INTO pv_pulsos (id, target_tipo, target_id, actor_key, fecha, created_at)
        VALUES ('p1', 'obra', 'o1', 'actor-b', '2026-07-19', '2026-07-19T02:00:00.000Z');
      `);
      expect(() =>
        db.exec(`INSERT INTO pv_pulsos (id, target_tipo, target_id, actor_key, fecha, created_at)
                 VALUES ('p2', 'obra', 'o1', 'actor-b', '2026-07-20', '2026-07-20T02:00:00.000Z');`),
      ).toThrow(); // el mismo actor no puede pulsar dos veces la misma obra
      const misiones = db.prepare('SELECT estado FROM pv_misiones').all();
      expect(misiones).toEqual([{ estado: 'propuesta' }]);
    } finally {
      db.close();
    }
  });
});
```

- [ ] **Step 4: Verificar verde (todo el suite — la migración corre también en la app)**

Run: `npx vitest run && npx tsc --noEmit`
Expected: 353 + nuevos tests PASS; tsc limpio.
Después: `npx expo export --platform web 2>&1 | tail -2` — Expected: export OK (verifica que babel importa el .sql).

- [ ] **Step 5: Commit**

```bash
git add juego/src/db/schema.ts juego/drizzle/ juego/src/civic/protocolo-migration.test.ts
git commit -m "feat: tablas pv_* del Protocolo Vivo — misiones, obras, pulsos (migración 0017)

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 6: Persistencia fina — repos-protocolo

**Files:**
- Create: `juego/src/db/repos-protocolo.ts`
- Test: `juego/src/protocolo/repos-contrato.test.ts`

**Interfaces:**
- Consumes: motor puro (Tasks 2–4), `nuevoId`, `ahoraISO`, `hoyLocal`, `db`, `DBExecutor` de `src/db/repos.ts` y `src/db/client.ts`; `getActorKey()` de `src/civic/identity.ts` (verificar nombre real con `grep -n "actorKey\|getActorKey" src/civic/identity.ts` y ajustar).
- Produces (firmas exactas para las pantallas):
  - `fundarMision(input: { titulo: string; proposito: string; tipo: TipoMision; oficioId: OficioId; gobernanza: Gobernanza; territorio?: string }): PvMisionRow` — crea la misión en `propuesta` y al creador como `coordinador`.
  - `misionesTodas(): PvMisionRow[]` — orden descendente por `createdAt`.
  - `misionPorId(id: string): { mision: PvMisionRow; miembros: PvMiembroRow[] } | null`
  - `sumarseAMision(misionId: string): void` — inserta membresía `miembro` (idempotente).
  - `transicionar(misionId: string, hacia: EstadoMision): PvMisionRow` — valida con `transicionValida` (throw `Error('transicion_invalida')` si no) y con `puedeResolver` cuando `hacia === 'resuelta'`; sella `resueltaAt`.
  - `registrarLatido(misionId: string): void` — actualiza `ultimoLatidoAt` del actor.
  - `publicarObra(input: { misionId?: string; titulo: string; resumen?: string; oficioId: OficioId; evidenciaUri?: string; territorio?: string }): PvObraRow`
  - `darPulso(targetTipo: 'obra' | 'mision', targetId: string): VeredictoPulso` — cuenta `pulsosDeHoy()`, chequea dedup por índice único, valida con `puedeDarPulso`, inserta si ok.
  - `pulsosDeHoy(): number` · `pulsosDeTarget(targetTipo: string, targetId: string): number`
  - `corrienteLocal(): Array<{ clase: 'obra'; obra: PvObraRow; pulsos: number } | { clase: 'mision'; mision: PvMisionRow }>` — obras publicadas + misiones fundadas/resueltas, mezcladas, descendente por fecha.
  - `constelacionesDeOficio(): Array<{ oficio: Oficio; obras: number; brillo: number; nivel: NivelBrillo }>` — agrupa `pv_obras` propias por oficio, computa con `brilloDeObras`.

- [ ] **Step 1: Test de contrato (valida la composición motor↔repos sin device)**

La lógica decisoria ya está testeada pura (Tasks 2–4). Acá se testea el contrato de composición: que `transicionar` y `darPulso` rechazan exactamente lo que el motor rechaza. Se testea con el harness de mock de repos que ya usa `src/civic/capture-attempt-store.test.ts` (vi.mock de `@/db/client` con una DatabaseSync en memoria NO es viable — el módulo client importa expo-sqlite — así que el contrato se testea así):

```ts
// juego/src/protocolo/repos-contrato.test.ts
import { describe, expect, it } from 'vitest';
import { puedeDarPulso } from './pulsos';
import { puedeResolver, transicionValida } from './mision';

// El contrato que repos-protocolo.ts DEBE cumplir (documentado y testeado acá;
// repos delega en estas funciones — cualquier bypass rompe la revisión de código):
describe('contrato repos-protocolo ↔ motor puro', () => {
  it('resolver una misión coordinada exige rol coordinador', () => {
    expect(transicionValida('verificacion', 'resuelta')).toBe(true);
    expect(puedeResolver('coordinada', 'miembro', 99, 99)).toBe(false);
  });
  it('el sexto pulso del día se rechaza aunque el target sea nuevo', () => {
    expect(puedeDarPulso(5, false)).toEqual({ ok: false, motivo: 'sin-presupuesto' });
  });
});
```

- [ ] **Step 2: Correr — debe pasar ya (documenta el contrato antes de escribir repos)**

Run: `npx vitest run src/protocolo/repos-contrato.test.ts`
Expected: PASS.

- [ ] **Step 3: Implementar repos-protocolo**

```ts
// juego/src/db/repos-protocolo.ts
/**
 * Persistencia del Protocolo Vivo. TODA decisión vive en src/protocolo/
 * (motor puro, testeado); acá solo se compone y persiste. Si una función
 * de acá toma una decisión que el motor no tomó, es un bug de diseño.
 */
import { and, desc, eq } from 'drizzle-orm';

import { getActorKey } from '@/civic/identity';
import type { Oficio, OficioId } from '@/content/oficios';
import { OFICIOS } from '@/content/oficios';
import { brilloDeObras, nivelDeBrillo, type NivelBrillo } from '@/protocolo/brillo';
import { puedeResolver, transicionValida } from '@/protocolo/mision';
import { puedeDarPulso, type VeredictoPulso } from '@/protocolo/pulsos';
import type { EstadoMision, Gobernanza, TipoMision } from '@/protocolo/tipos';

import { db } from './client';
import { ahoraISO, hoyLocal, nuevoId } from './repos';
import {
  pvMisionMiembros, pvMisiones, pvObras, pvPulsos,
  type PvMiembroRow, type PvMisionRow, type PvObraRow,
} from './schema';

export const fundarMision = (input: {
  titulo: string; proposito: string; tipo: TipoMision; oficioId: OficioId;
  gobernanza: Gobernanza; territorio?: string;
}): PvMisionRow => {
  const actor = getActorKey();
  const row: PvMisionRow = {
    id: nuevoId(),
    titulo: input.titulo.trim(),
    proposito: input.proposito.trim(),
    tipo: input.tipo,
    oficioId: input.oficioId,
    estado: 'propuesta',
    gobernanza: input.gobernanza,
    territorio: input.territorio?.trim() || null,
    parentId: null,
    creadaPor: actor,
    createdAt: ahoraISO(),
    resueltaAt: null,
  };
  db.insert(pvMisiones).values(row).run();
  db.insert(pvMisionMiembros).values({
    misionId: row.id, actorKey: actor, rol: 'coordinador',
    comprometidoAt: ahoraISO(), ultimoLatidoAt: ahoraISO(),
  }).onConflictDoNothing().run();
  return row;
};

export const misionesTodas = (): PvMisionRow[] =>
  db.select().from(pvMisiones).orderBy(desc(pvMisiones.createdAt)).all();

export const misionPorId = (
  id: string,
): { mision: PvMisionRow; miembros: PvMiembroRow[] } | null => {
  const mision = db.select().from(pvMisiones).where(eq(pvMisiones.id, id)).get();
  if (!mision) return null;
  const miembros = db.select().from(pvMisionMiembros)
    .where(eq(pvMisionMiembros.misionId, id)).all();
  return { mision, miembros };
};

export const sumarseAMision = (misionId: string): void => {
  db.insert(pvMisionMiembros).values({
    misionId, actorKey: getActorKey(), rol: 'miembro',
    comprometidoAt: ahoraISO(), ultimoLatidoAt: ahoraISO(),
  }).onConflictDoNothing().run();
};

export const transicionar = (misionId: string, hacia: EstadoMision): PvMisionRow => {
  const encontrado = misionPorId(misionId);
  if (!encontrado) throw new Error('mision_inexistente');
  const { mision, miembros } = encontrado;
  if (!transicionValida(mision.estado as EstadoMision, hacia)) {
    throw new Error('transicion_invalida');
  }
  if (hacia === 'resuelta') {
    const actor = getActorKey();
    const yo = miembros.find((m) => m.actorKey === actor);
    // P0 local: las "aceptaciones" de consentimiento son los latidos vivos.
    const aceptaciones = miembros.filter((m) => m.ultimoLatidoAt !== null).length;
    if (!yo || !puedeResolver(
      mision.gobernanza as Gobernanza,
      yo.rol as 'coordinador' | 'miembro',
      aceptaciones,
      miembros.length,
    )) throw new Error('gobernanza_rechaza');
  }
  const cambios = hacia === 'resuelta'
    ? { estado: hacia, resueltaAt: ahoraISO() }
    : { estado: hacia };
  db.update(pvMisiones).set(cambios).where(eq(pvMisiones.id, misionId)).run();
  return { ...mision, ...cambios };
};

export const registrarLatido = (misionId: string): void => {
  db.update(pvMisionMiembros).set({ ultimoLatidoAt: ahoraISO() })
    .where(and(
      eq(pvMisionMiembros.misionId, misionId),
      eq(pvMisionMiembros.actorKey, getActorKey()),
    )).run();
};

export const publicarObra = (input: {
  misionId?: string; titulo: string; resumen?: string; oficioId: OficioId;
  evidenciaUri?: string; territorio?: string;
}): PvObraRow => {
  const row: PvObraRow = {
    id: nuevoId(),
    misionId: input.misionId ?? null,
    titulo: input.titulo.trim(),
    resumen: input.resumen?.trim() || null,
    oficioId: input.oficioId,
    evidenciaUri: input.evidenciaUri ?? null,
    territorio: input.territorio?.trim() || null,
    publicadaAt: ahoraISO(),
    estado: 'sin_corroborar',
  };
  db.insert(pvObras).values(row).run();
  return row;
};

export const pulsosDeHoy = (): number =>
  db.select().from(pvPulsos).where(and(
    eq(pvPulsos.actorKey, getActorKey()),
    eq(pvPulsos.fecha, hoyLocal()),
  )).all().length;

export const pulsosDeTarget = (targetTipo: string, targetId: string): number =>
  db.select().from(pvPulsos).where(and(
    eq(pvPulsos.targetTipo, targetTipo),
    eq(pvPulsos.targetId, targetId),
  )).all().length;

export const darPulso = (
  targetTipo: 'obra' | 'mision',
  targetId: string,
): VeredictoPulso => {
  const actor = getActorKey();
  const yaDio = db.select().from(pvPulsos).where(and(
    eq(pvPulsos.actorKey, actor),
    eq(pvPulsos.targetTipo, targetTipo),
    eq(pvPulsos.targetId, targetId),
  )).get() !== undefined;
  const veredicto = puedeDarPulso(pulsosDeHoy(), yaDio);
  if (!veredicto.ok) return veredicto;
  db.insert(pvPulsos).values({
    id: nuevoId(), targetTipo, targetId, actorKey: actor,
    fecha: hoyLocal(), createdAt: ahoraISO(),
  }).onConflictDoNothing().run();
  return veredicto;
};

export type ItemCorriente =
  | { clase: 'obra'; obra: PvObraRow; pulsos: number }
  | { clase: 'mision'; mision: PvMisionRow };

export const corrienteLocal = (): ItemCorriente[] => {
  const obras: ItemCorriente[] = db.select().from(pvObras)
    .orderBy(desc(pvObras.publicadaAt)).all()
    .map((obra) => ({ clase: 'obra', obra, pulsos: pulsosDeTarget('obra', obra.id) }));
  const misiones: ItemCorriente[] = misionesTodas()
    .map((mision) => ({ clase: 'mision', mision }));
  const fechaDe = (i: ItemCorriente) =>
    i.clase === 'obra' ? i.obra.publicadaAt : (i.mision.resueltaAt ?? i.mision.createdAt);
  return [...obras, ...misiones].sort((a, b) => fechaDe(b).localeCompare(fechaDe(a)));
};

export const constelacionesDeOficio = (): Array<{
  oficio: Oficio; obras: number; brillo: number; nivel: NivelBrillo;
}> => {
  const todas = db.select().from(pvObras).all();
  const ahora = ahoraISO();
  return OFICIOS.map((oficio) => {
    const fechas = todas.filter((o) => o.oficioId === oficio.id).map((o) => o.publicadaAt);
    const brillo = brilloDeObras(fechas, ahora);
    return { oficio, obras: fechas.length, brillo, nivel: nivelDeBrillo(brillo) };
  });
};
```

Si `getActorKey` tiene otro nombre o es async en `src/civic/identity.ts`, adaptar (si es async, resolverlo una vez en `_layout` y cachearlo en un módulo `src/civic/actor-cache.ts` sincrónico — mirar cómo lo resuelve `src/app/encender.tsx`, que ya lo usa).

- [ ] **Step 4: Verificar verde**

Run: `npx vitest run && npx tsc --noEmit`
Expected: todo PASS; tsc limpio.

- [ ] **Step 5: Commit**

```bash
git add juego/src/db/repos-protocolo.ts juego/src/protocolo/repos-contrato.test.ts
git commit -m "feat: repos del Protocolo Vivo — persistencia fina sobre el motor puro

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 7: Pantallas de misiones

**Files:**
- Create: `juego/src/app/misiones/index.tsx`, `juego/src/app/misiones/fundar.tsx`, `juego/src/app/misiones/[id].tsx`
- Modify: `juego/src/app/_layout.tsx` (registrar las 3 rutas en el Stack, patrón de `expediciones/*`)
- Modify: `juego/src/app/territorio/index.tsx` (card de entrada "Misiones del protocolo" que hace `router.push('/misiones')` — copiar la estructura de las cards existentes del hub)

**Interfaces:**
- Consumes (Task 6): `misionesTodas`, `fundarMision`, `misionPorId`, `sumarseAMision`, `transicionar`, `registrarLatido`; (Task 3): `latidoVencido`; (Task 1): `OFICIOS`.
- Produces: rutas `/misiones`, `/misiones/fundar`, `/misiones/[id]`.

- [ ] **Step 1: Lista** — `index.tsx`: `PanelHeader title="Misiones"`, secciones por estado (`propuesta`/`equipo`/`activa`/`verificacion` visibles; `resuelta` colapsada al final), cada card muestra `titulo`, chip del oficio (`oficioPorId(m.oficioId)` — ícono+color), badge de estado, y navega al detalle. Botón `AccentButton label="Fundar una misión"` → `/misiones/fundar`. Estado vacío: *"Ninguna misión todavía. La primera la puede fundar cualquiera — por ejemplo, vos."*

```tsx
// Esqueleto de la card (estilo del sistema):
<Pressable97
  accessibilityRole="button"
  accessibilityLabel={m.titulo}
  onPress={() => router.push({ pathname: '/misiones/[id]', params: { id: m.id } })}
  className="rounded-2xl border border-white/10 bg-white/5 p-4"
>
  <View className="flex-row items-center gap-2">
    <Ionicons name={oficio.icono as never} size={16} color={oficio.color} />
    <Text className="flex-1 font-sans-semibold text-sm text-plata">{m.titulo}</Text>
    <Text className="font-mono text-[10px] uppercase text-slate-500">{m.estado}</Text>
  </View>
  <Text className="mt-1 font-sans text-xs leading-5 text-slate-400" numberOfLines={2}>
    {m.proposito}
  </Text>
</Pressable97>
```

- [ ] **Step 2: Fundar** — `fundar.tsx`: wizard de un solo scroll con 5 campos: título (`TextInput maxLength={80}`), propósito (`multiline maxLength={280}`), tipo (3 chips: Relevamiento/Obra/Diseño), oficio (grid de chips desde `OFICIOS`), gobernanza (2 cards con explicación: *"Coordinada — una responsable decide, rápido"* / *"Por consentimiento — decide la mayoría del equipo"*). Botón `AccentButton label="Fundar"` deshabilitado hasta que título+propósito trimmed no vacíos y oficio elegido; con flag `fundando` anti doble-tap (patrón de `expediciones/fundar.tsx`); al fundar → `haptic.celebrate()` → `router.replace({ pathname: '/misiones/[id]', params: { id } })`.

- [ ] **Step 3: Detalle** — `[id].tsx`: título+propósito+chips; lista de miembros (mostrar `rol` y, si `latidoVencido(m.ultimoLatidoAt, ahoraISO())`, un punto ámbar "sin latido"); acciones según estado usando SIEMPRE `transicionar` dentro de try/catch (los errores `transicion_invalida`/`gobernanza_rechaza` se muestran como nota inline rioplatense, jamás crash):
  - `propuesta`: "Sumarme" (`sumarseAMision`) + "Cerrar convocatoria" → `transicionar(id,'equipo')`
  - `equipo`: "Arrancar" → `'activa'`
  - `activa`: "Dar latido" (`registrarLatido` + `haptic.tick()`) + "Presentar resultado" → `'verificacion'`
  - `verificacion`: "Aceptar y resolver" → `'resuelta'` → al lograrlo, `router.push('/obras/publicar?misionId=...')` (Task 8) + "Volver a activa" → `'activa'`
  - `propuesta|equipo|activa`: "Abandonar" (link discreto slate, confirmación inline)

- [ ] **Step 4: Verificación manual en el preview**

Run: levantar `basta-juego-web` (:8082). Recorrido: Territorio → Misiones → Fundar ("Relevar veredas rotas", oficio Movilidad, coordinada) → detalle → Cerrar convocatoria → Arrancar → Dar latido → Presentar resultado → Aceptar y resolver. Expected: cada transición re-renderiza el estado; resolver navega a publicar obra; ninguna consola roja. Después `npx tsc --noEmit && npx vitest run` verdes.

- [ ] **Step 5: Commit**

```bash
git add juego/src/app/misiones/ juego/src/app/_layout.tsx juego/src/app/territorio/index.tsx
git commit -m "feat: pantallas de misiones — fundar, equipo, transiciones y latido

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 8: Publicar obra

**Files:**
- Create: `juego/src/app/obras/publicar.tsx`
- Modify: `juego/src/app/_layout.tsx` (ruta `obras/publicar`)

**Interfaces:**
- Consumes: `publicarObra` (Task 6); `useLocalSearchParams` para `misionId` y para heredar el `oficioId` de la misión (`misionPorId`); foto opcional con el patrón de foto de `expediciones/[id].tsx` (MicroUIPaso foto-guiada — reusar el picker que ya existe ahí, guardando el uri local en `evidenciaUri`).
- Produces: ruta `/obras/publicar` con param opcional `misionId`; al publicar → `haptic.celebrate()` → `router.replace('/corriente')`.

- [ ] **Step 1: Implementar la pantalla** — campos: título (`maxLength={80}`), resumen (`multiline maxLength={280}`), oficio (heredado de la misión si vino `misionId`, si no grid de chips), foto opcional ("La evidencia es de la obra, no de las personas"), territorio (`maxLength={60}`, placeholder "Barrio, ciudad — lo que quieras contar"). `AccentButton label="Publicar la obra"` con flag `publicando` + try/catch + nota de error inline.

- [ ] **Step 2: Verificación manual** — resolver la misión del Task 7 → publicar la obra → aterriza en La Corriente (Task 9; hasta entonces, verificar con `router.replace('/')` temporal y dejarlo apuntando a `/corriente` en el commit de Task 9). `npx tsc --noEmit` limpio.

- [ ] **Step 3: Commit**

```bash
git add juego/src/app/obras/ juego/src/app/_layout.tsx
git commit -m "feat: publicar obra — proof-of-output con evidencia opcional

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 9: La Corriente v0

**Files:**
- Create: `juego/src/app/corriente.tsx`
- Modify: `juego/src/app/_layout.tsx` (ruta), `juego/src/app/index.tsx` (dock: agregar ícono `pulse-outline` con label "La Corriente" al array de navegación — hoy tiene 5 entradas, pasa a 6)

**Interfaces:**
- Consumes: `corrienteLocal`, `darPulso`, `pulsosDeHoy`, `pulsosDeTarget` (Task 6); `PULSOS_APRECIO_POR_DIA` (Task 3); `getSetting`/`setSetting` con clave nueva `corrienteUltimaVisita` (agregar a `CLAVES` en `repos.ts`).
- Produces: ruta `/corriente`.

- [ ] **Step 1: Implementar** — `PanelHeader title="La Corriente"` + subtítulo *"Lo que el país está haciendo, hecho por hecho."*. Header derecho: el presupuesto como 5 puntos (`PULSOS_APRECIO_POR_DIA - pulsosDeHoy()` llenos en plata, gastados en slate). Lista (`FlatList`) de `corrienteLocal()`:
  - Item obra: card con chip de oficio, título, resumen, foto si hay (`expo-image`), territorio, y el botón de pulso: `♥→◉` no — usar `Ionicons name="pulse"`, contador `pulsosDeTarget`, al tocar `darPulso('obra', id)`; si `{ok:false, motivo:'sin-presupuesto'}` → nota *"Tus pulsos de hoy ya laten en otras obras. Mañana hay más."*; si `'repetido'` → *"Esta obra ya tiene tu pulso."*; si ok → `haptic.send()` + re-render.
  - Item misión: línea sobria — *"Misión fundada: {titulo}"* o *"Misión resuelta: {titulo}"* con fecha, navega al detalle.
  - Marcador "**Estás al corriente**" (línea divisoria con texto centrado plata) entre lo más nuevo que `corrienteUltimaVisita` y lo anterior; al montar, `setSetting(CLAVES.corrienteUltimaVisita, ahoraISO())`.
  - Estado vacío: *"La Corriente arranca cuando alguien publica la primera obra. Puede ser la tuya."* + botón a `/misiones`.

- [ ] **Step 2: Verificación manual** — con la obra del Task 8: la Corriente la muestra; dar pulso baja el presupuesto a 4 y sube el contador; sexto pulso del día (crear obras de prueba) rechaza con la nota; recargar respeta el dedup. `npx tsc --noEmit && npx vitest run` verdes.

- [ ] **Step 3: Commit**

```bash
git add juego/src/app/corriente.tsx juego/src/app/_layout.tsx juego/src/app/index.tsx juego/src/db/repos.ts
git commit -m "feat: La Corriente v0 — feed local de obras con pulsos y 'estás al corriente'

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 10: Constelaciones de oficio en el Álbum + verificación final

**Files:**
- Modify: `juego/src/app/album.tsx` (agregar solapa "Oficios" a las 3 existentes — seguir el patrón de tabs del propio archivo)

**Interfaces:**
- Consumes: `constelacionesDeOficio()` (Task 6).

- [ ] **Step 1: Implementar la solapa** — grid de cards, una por oficio con `obras > 0` (los vacíos, una línea al pie: *"Los demás oficios esperan su primera obra."*). Card: ícono+nombre del oficio, cantidad de obras, y el brillo renderizado como estrellitas (`react-native-svg`, patrón de siluetas del propio álbum): tantos círculos como `obras` (cap 12), con `opacity` según `nivel`: `tenue 0.35 / viva 0.7 / radiante 1` y un glow sutil para `radiante`. Texto del nivel en mono (*"constelación viva"*). NUNCA un número de score — solo obras (conteo de hechos) y brillo (visual).

- [ ] **Step 2: Verificación final del plan completo**

Run: `npx tsc --noEmit && npx vitest run 2>&1 | tail -3 && npx expo export --platform web 2>&1 | tail -2`
Expected: tsc limpio; suite completa verde (353 + ~16 nuevos); export OK.
Recorrido completo en el preview: fundar misión → equipo → activa → latido → verificación → resolver → publicar obra → verla en La Corriente → pulsarla → verla sumar brillo en Álbum/Oficios. Sacar screenshot de La Corriente y del Álbum para el reporte.

- [ ] **Step 3: Commit**

```bash
git add juego/src/app/album.tsx
git commit -m "feat: constelaciones de oficio — el capability graph renderizado, sin scores

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

## Los otros planes del rediseño (escribir cada uno al arrancarlo)

- **Plan B — Los órganos y la navegación** (`2026-XX-XX-protocolo-vivo-plan-b-organos.md`): FTUE asombro-primero (pregunta→estrella <60s, pacto de datos diferido al primer "sumar al pulso colectivo"); plegar expediciones dentro de misiones (tipo `relevamiento` con plantillas); QR/chispas accesibles desde La Corriente; rediseño del dock alrededor de los cinco órganos.
- **Plan C — Engagement T1 + la visión como mecánica** (`...-plan-c-engagement.md`): banco de noches nubladas visible + hitos de racha con ceremonia; revelación de rareza al nacer; regalo de regreso; casi-completar constelaciones; cielo en tiempo real (fase lunar, lluvias de meteoros reales); wizard de misiones de diseño (Ackoff jugable) alimentado por escuchas.
- **Plan D — Federación P1** (`...-plan-d-federacion.md`): La Corriente federada vía API cívica (círculos QR-verificados), pulsos con peso por oficio, El Llamado v0 (oficio×distancia×recencia), media por Cloudinary unsigned. Requiere la decisión de backend (API propia vs SocialJusticeHub).

## Self-review

1. **Cobertura**: decisiones de Juan (Corriente ✓ Task 9; pulso social/fuego privado ✓ — ninguna pantalla nueva toca brasas; 5/día ✓ Task 3; PLANes no sembrados ✓ — el plan no siembra ningún contenido de visión, el wizard de diseño queda en Plan C). Protocolo: Mission Layer ✓ T2/T7, Proof-of-Output ✓ T8, Trust/pulsos ✓ T3/T9, capability/brillo ✓ T4/T10, gobernanza ✓ T2. Matching/Llamado → Plan D (declarado).
2. **Placeholders**: los dos puntos abiertos están marcados con instrucción de verificación concreta (`LISTENING_THEMES` export real; `getActorKey` sync/async con su plan B) — decisiones de integración que el implementador resuelve con un grep indicado, no huecos.
3. **Consistencia de tipos**: `VeredictoPulso` (T3) es el retorno de `darPulso` (T6) consumido en T9; `NivelBrillo` (T4) fluye a `constelacionesDeOficio` (T6) y al render (T10); `EstadoMision`/`Gobernanza` (T2) tipan schema-consumers en T6/T7. Nombres verificados entre tareas.
