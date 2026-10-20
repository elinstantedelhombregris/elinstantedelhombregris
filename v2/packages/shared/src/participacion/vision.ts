/**
 * Ver — la visión de Mi Argentina ideal, como la devuelve `GET /api/v1/vision`.
 *
 * Spec: `docs/specs/2026-10-19-mi-argentina-ideal-la-pila.md` §5. Las reglas que
 * deciden qué entra en cada sección viven en `@v2/civic-core` (`vision/leer.ts`),
 * y los números chicos se suprimen en el servidor antes de llegar acá (D-088).
 */
import type { ValorDeOpinion } from './pila.js';

export interface RegionEnAporte {
  region: string;
  /** `null` cuando la región tiene menos de cinco opiniones en el aporte. */
  acuerdo: number | null;
  cuenta: boolean;
}

export interface AporteEnVision {
  id: string;
  texto: string;
  provincia: string | null;
  tema: { clave: string; etiqueta: string } | null;
  /** «Yo también» + «Yo no». Los «Paso» van aparte y no entran en los porcentajes. */
  opiniones: number;
  pasos: number;
  /** Acuerdo sobre quienes opinaron, de 0 a 1. */
  acuerdo: number;
  /** El acuerdo de la región que cuenta y anda peor; `null` si ninguna cuenta. */
  peor: number | null;
  regiones: RegionEnAporte[];
  miOpinion?: ValorDeOpinion | null;
}

export interface PrioridadEnVision extends AporteEnVision {
  comparaciones: number;
  /** `(veces primero + 1) / (comparaciones + 2)`. */
  puntaje: number;
}

export interface RegionEnVision {
  region: string;
  /** Personas que participaron desde ahí; `null` si son menos de cinco. */
  personas: number | null;
  /** En cuántos aportes en discusión la región tiene cinco opiniones o más. */
  cuentaEn: number;
}

export interface ProvinciaEnVision {
  id: number;
  nombre: string;
  iso: string;
  region: string;
  /** Nivel de luz de 0 (nadie) a 5. Se calcula por habitante con números ya suprimidos. */
  nivel: number;
  /** `null` si participaron menos de cinco personas: el número exacto delataría a alguien. */
  personas: number | null;
}

export interface VisionCampana {
  campana: {
    id: string;
    slug: string;
    titulo: string;
    edicion: number;
    /** Hasta cuándo recibe aportes la edición, si sus reglas lo dicen. */
    recibeHasta: string | null;
    devolucion: string | null;
  };
  cifras: { personas: number; opiniones: number; provincias: number };
  /** Aportes con 20 opiniones o más y dos regiones que cuentan. */
  enDiscusion: number;
  une: AporteEnVision[];
  primero: PrioridadEnVision[];
  divide: AporteEnVision[];
  temas: { clave: string; etiqueta: string; aporte: AporteEnVision | null }[];
  regiones: RegionEnVision[];
  provincias: ProvinciaEnVision[];
  recien: AporteEnVision[];
  /** El aporte propio, si quien mira publicó uno. Sólo lo ve su autor. */
  tuyo: { id: string; texto: string; opiniones: number; acuerdos: number; pasos: number } | null;
  /** La región de quien mira, si se sabe: habilita «Completar los de tu región». */
  miRegion: string | null;
  calculadaEn: string;
}

/** Un aporte parecido a lo que la persona está escribiendo (entrega 2). */
export interface AporteParecido {
  id: string;
  texto: string;
  provincia: string | null;
}
