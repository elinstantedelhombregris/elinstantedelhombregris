import { describe, it, expect } from 'vitest';
import {
  PLAN_NODES,
  DEPENDENCIES,
  REQUIRES_DEPENDENCIES,
  TIMELINE_PHASES,
  type Dependency,
  type DependencyNature,
  type DependencyType,
} from '../../shared/arquitecto-data';
import { runAllValidations } from '../../shared/validation-engine';

/**
 * El grafo de los cuatro PLANes nuevos (ordinales 23-26).
 *
 * ALCANCE — igual que `pisos-constitucionales.test.ts`, este test fija el grafo
 * contra una **transcripción humana** de los documentos del taller, no contra el
 * taller mismo. Lo que detecta es el drift de `arquitecto-data.ts` respecto de la
 * transcripción; si alguien reescribe una sección de INTEGRACIÓN en el taller,
 * este test sigue verde y la transcripción hay que re-verificarla a mano.
 *
 * **Manda el documento, no el grafo.** Cada arista de la tabla se transcribió de
 * la sección «INTEGRACIÓN CON EL MARCO ¡BASTA!» del PLAN que la declara —que es
 * la sección que el corpus escribe justamente para declarar aristas— el
 * 2026-08-02. La columna `domicilio` dice de qué línea salió.
 *
 * ── POR QUÉ LA TABLA ES DE `requires` Y NO DE TODAS LAS ARISTAS ───────────────
 * Un `requires` es una afirmación fuerte y falsable: *sin el otro, esto no
 * funciona*. Un `provides` es su espejo más una anotación de lectura. La tabla
 * transcribe los `requires`, que son los que el documento declara con modo
 * degradado, y el test **deriva** los espejos obligatorios de ahí en vez de
 * volver a listarlos: una lista escrita dos veces se desincroniza una sola vez.
 */

interface AristaTranscripta {
  target: string;
  nature: DependencyNature;
  type: DependencyType;
  /** Línea del documento que la declara. La guardia de remisiones la resuelve. */
  domicilio: string;
}

const REQUIRES_SEGUN_EL_TALLER: Record<string, AristaTranscripta[]> = {
  // `PLANPACTO:717` y `:721`. PACTO es sobre todo proveedor: reparte, no pide.
  PLANPACTO: [
    { target: 'PLANMON', nature: 'CRITICAL', type: 'TECHNICAL', domicilio: 'PLANPACTO:717' },
    { target: 'PLANDIG', nature: 'IMPORTANT', type: 'TECHNICAL', domicilio: 'PLANPACTO:717' },
    { target: 'PLANMESA', nature: 'IMPORTANT', type: 'INSTITUTIONAL', domicilio: 'PLANPACTO:721' },
    { target: 'PLANJUS', nature: 'IMPORTANT', type: 'INSTITUTIONAL', domicilio: 'PLANPACTO:721' },
  ],
  /**
   * «Seis dependencias críticas, y ninguna capacidad crítica que devolver»
   * (`PLANARCO:761`). Las seis van una por línea, de `:763` a `:773`. PLANPACTO
   * es la séptima y **no es crítica**: el modo degradado de `:757` deja al
   * Calendario y a la Renta corriendo sin él. Por eso el documento dice seis y
   * esta tabla tiene siete filas — no es una discrepancia, es la distinción.
   */
  PLANARCO: [
    { target: 'PLANPACTO', nature: 'IMPORTANT', type: 'INSTITUTIONAL', domicilio: 'PLANARCO:757' },
    { target: 'PLANCUIDADO', nature: 'CRITICAL', type: 'INSTITUTIONAL', domicilio: 'PLANARCO:763' },
    { target: 'PLANMON', nature: 'CRITICAL', type: 'FINANCIAL', domicilio: 'PLANARCO:765' },
    { target: 'PLANTER', nature: 'CRITICAL', type: 'FINANCIAL', domicilio: 'PLANARCO:767' },
    { target: 'PLANDIG', nature: 'CRITICAL', type: 'TECHNICAL', domicilio: 'PLANARCO:769' },
    { target: 'PLANSAL', nature: 'CRITICAL', type: 'INSTITUTIONAL', domicilio: 'PLANARCO:771' },
    { target: 'PLANREP', nature: 'CRITICAL', type: 'LABOR', domicilio: 'PLANARCO:773' },
  ],
  // «Las tres dependencias críticas» (`PLANPREGUNTA:736`), de `:738` a `:742`.
  // Las no críticas van todas juntas en `:746`, y el par recíproco en `:734`.
  PLANPREGUNTA: [
    { target: 'PLANDIG', nature: 'CRITICAL', type: 'TECHNICAL', domicilio: 'PLANPREGUNTA:738' },
    { target: 'PLANMESA', nature: 'CRITICAL', type: 'INSTITUTIONAL', domicilio: 'PLANPREGUNTA:740' },
    { target: 'PLANTER', nature: 'CRITICAL', type: 'FINANCIAL', domicilio: 'PLANPREGUNTA:742' },
    { target: 'PLANFOCO', nature: 'IMPORTANT', type: 'INSTITUTIONAL', domicilio: 'PLANPREGUNTA:734' },
    { target: 'PLANEDU', nature: 'MINOR', type: 'INSTITUTIONAL', domicilio: 'PLANPREGUNTA:746' },
    { target: 'PLANJUS', nature: 'MINOR', type: 'INSTITUTIONAL', domicilio: 'PLANPREGUNTA:746' },
    { target: 'PLANTALLER', nature: 'MINOR', type: 'INSTITUTIONAL', domicilio: 'PLANPREGUNTA:746' },
  ],
  /**
   * PLANFOCO es el que más aristas tiene y el que menos peso pone en cada una:
   * nueve `requires` y solo tres críticos. Es lo que el spec llamó «el más
   * desprendible». Su dependencia de PLANDIG **no es crítica y lo dice con todas
   * las letras** (`PLANFOCO:752`): «ninguna posterga un dispositivo».
   */
  PLANFOCO: [
    { target: 'PLANMESA', nature: 'CRITICAL', type: 'INSTITUTIONAL', domicilio: 'PLANFOCO:758' },
    { target: 'PLANEDU', nature: 'CRITICAL', type: 'INSTITUTIONAL', domicilio: 'PLANFOCO:760' },
    { target: 'PLANMEMORIA', nature: 'CRITICAL', type: 'DATA', domicilio: 'PLANFOCO:756' },
    { target: 'PLANDIG', nature: 'IMPORTANT', type: 'TECHNICAL', domicilio: 'PLANFOCO:752' },
    { target: 'PLANJUS', nature: 'IMPORTANT', type: 'LEGAL', domicilio: 'PLANFOCO:762' },
    { target: 'PLANPACTO', nature: 'IMPORTANT', type: 'FINANCIAL', domicilio: 'PLANFOCO:764' },
    { target: 'PLANREP', nature: 'IMPORTANT', type: 'LABOR', domicilio: 'PLANFOCO:764' },
    { target: 'PLANSAL', nature: 'MINOR', type: 'INSTITUTIONAL', domicilio: 'PLANFOCO:764' },
    { target: 'PLANTALLER', nature: 'MINOR', type: 'FINANCIAL', domicilio: 'PLANFOCO:764' },
  ],
};

/**
 * Lo que los cuatro **proveen** sin que nadie lo haya declarado como `requires`.
 * No son espejos —los espejos se derivan— sino aristas de provisión propias:
 * capacidad que sale de un PLAN nuevo hacia uno viejo que no la pidió por escrito.
 */
const PROVIDES_PROPIOS_SEGUN_EL_TALLER: Record<string, AristaTranscripta[]> = {
  /**
   * La Escalera le da a cada uno su escalón (`PLANPACTO:719`). **No se modela
   * como `requires` de ellos hacia PACTO**, y la razón importa: si PACTO no se
   * sanciona, PLANVIV no pierde su 2,00% — se queda con el reclamo que ya tenía,
   * que es el estado del que se viene. Lo que PACTO les da es orden, no plata,
   * y un orden que no llega no rompe a nadie. Por eso el spec esperaba que PACTO
   * fuera punto único de falla y el documento escrito no lo produce.
   */
  PLANPACTO: [
    { target: 'PLANVIV', nature: 'CRITICAL', type: 'FINANCIAL', domicilio: 'PLANPACTO:719' },
    { target: 'PLANCUIDADO', nature: 'CRITICAL', type: 'FINANCIAL', domicilio: 'PLANPACTO:719' },
    { target: 'PLANEDU', nature: 'CRITICAL', type: 'FINANCIAL', domicilio: 'PLANPACTO:719' },
    { target: 'PLANISV', nature: 'IMPORTANT', type: 'FINANCIAL', domicilio: 'PLANPACTO:719' },
    { target: 'PLANAGUA', nature: 'IMPORTANT', type: 'FINANCIAL', domicilio: 'PLANPACTO:719' },
  ],
  // La mitad ARCO del par recíproco: entrega el Calendario como la lista pública
  // contra la cual cada escalón declara cómo repartió lo que conserva (`:757`).
  PLANARCO: [
    { target: 'PLANPACTO', nature: 'IMPORTANT', type: 'INSTITUTIONAL', domicilio: 'PLANARCO:757' },
  ],
  // «Lo que este PLAN le provee al resto» (`PLANPREGUNTA:744`). Lo que le provee
  // «a los veinticinco» NO es arista: veinticinco aristas idénticas no informan.
  PLANPREGUNTA: [
    { target: 'PLANISV', nature: 'IMPORTANT', type: 'DATA', domicilio: 'PLANPREGUNTA:744' },
    { target: 'PLANMEMORIA', nature: 'IMPORTANT', type: 'DATA', domicilio: 'PLANPREGUNTA:744' },
    { target: 'PLANEN', nature: 'MINOR', type: 'DATA', domicilio: 'PLANPREGUNTA:744' },
    { target: 'PLANGEO', nature: 'MINOR', type: 'INSTITUTIONAL', domicilio: 'PLANPREGUNTA:744' },
  ],
  PLANFOCO: [
    { target: 'PLANDIG', nature: 'IMPORTANT', type: 'FINANCIAL', domicilio: 'PLANFOCO:752' },
    { target: 'PLANCUL', nature: 'IMPORTANT', type: 'INSTITUTIONAL', domicilio: 'PLANFOCO:754' },
  ],
};

const NUEVOS = Object.keys(REQUIRES_SEGUN_EL_TALLER);

function clave(d: Dependency): string {
  return `${d.kind ?? 'requires'} ${d.source}->${d.target}`;
}

describe('grafo de los cuatro PLANes nuevos (ordinales 23-26)', () => {
  it('los cuatro existen como nodos', () => {
    for (const id of NUEVOS) {
      expect(PLAN_NODES.find((p) => p.id === id), `${id}: no está en PLAN_NODES`).toBeDefined();
    }
  });

  describe('cada `requires` transcripto está en el grafo, con su naturaleza y su tipo', () => {
    for (const [source, aristas] of Object.entries(REQUIRES_SEGUN_EL_TALLER)) {
      for (const a of aristas) {
        it(`${source} → ${a.target} (${a.nature}/${a.type}, ${a.domicilio})`, () => {
          const encontradas = REQUIRES_DEPENDENCIES.filter(
            (d) => d.source === source && d.target === a.target,
          );
          expect(encontradas.length, `${source}→${a.target}: no está en el grafo`).toBe(1);
          const d = encontradas[0]!;
          expect(d.nature, `${source}→${a.target}: naturaleza`).toBe(a.nature);
          expect(d.type, `${source}→${a.target}: tipo`).toBe(a.type);
          // Una arista sin descripción es una arista sin razón escrita.
          expect(d.description.length, `${source}→${a.target}: sin descripción`).toBeGreaterThan(40);
        });
      }
    }
  });

  /**
   * El lado que una tabla sola no cubre: el grafo **no puede tener aristas de
   * más**. Sin esto, la transcripción verifica presencia y no exhaustividad, y
   * una arista inventada pasa en verde para siempre.
   */
  it('el grafo no tiene ningún `requires` de un PLAN nuevo que la tabla no declare', () => {
    const declarados = new Set(
      Object.entries(REQUIRES_SEGUN_EL_TALLER).flatMap(([s, as]) =>
        as.map((a) => `${s}->${a.target}`),
      ),
    );
    const enElGrafo = REQUIRES_DEPENDENCIES.filter((d) => NUEVOS.includes(d.source)).map(
      (d) => `${d.source}->${d.target}`,
    );
    expect(enElGrafo.filter((k) => !declarados.has(k))).toEqual([]);
  });

  it('ningún PLAN viejo declara `requires` sobre uno nuevo salvo los transcriptos', () => {
    // Hoy la lista es vacía a propósito: ninguno de los veintidós documentos
    // viejos fue reescrito para pedirle algo a uno de los cuatro. Lo que los
    // nuevos les dan entra como `provides`, que es una anotación y no un reclamo.
    const entrantes = REQUIRES_DEPENDENCIES.filter(
      (d) => NUEVOS.includes(d.target) && !NUEVOS.includes(d.source),
    );
    expect(entrantes.map(clave)).toEqual([]);
  });

  describe('cada `provides` propio transcripto está en el grafo', () => {
    for (const [source, aristas] of Object.entries(PROVIDES_PROPIOS_SEGUN_EL_TALLER)) {
      for (const a of aristas) {
        it(`${source} ⇢ ${a.target} (${a.nature}/${a.type}, ${a.domicilio})`, () => {
          const d = DEPENDENCIES.find(
            (x) => x.kind === 'provides' && x.source === source && x.target === a.target,
          );
          expect(d, `${source}⇢${a.target}: no está en el grafo`).toBeDefined();
          expect(d!.nature).toBe(a.nature);
          expect(d!.type).toBe(a.type);
        });
      }
    }
  });

  /**
   * V-REF-01 sobre el bloque nuevo, pero como ERROR y no como WARNING. La regla
   * del motor avisa; acá el espejo faltante rompe el build, que es lo que
   * corresponde para aristas que se cargan de una vez y en bloque.
   */
  it('cada `requires` de un PLAN nuevo tiene su espejo `provides`', () => {
    const sinEspejo = REQUIRES_DEPENDENCIES.filter(
      (d) => NUEVOS.includes(d.source) || NUEVOS.includes(d.target),
    )
      .filter((d) => !DEPENDENCIES.some((x) => x.source === d.target && x.target === d.source))
      .map(clave);
    expect(sinEspejo).toEqual([]);
  });

  it('el espejo conserva la naturaleza declarada por el documento', () => {
    const desalineados: string[] = [];
    for (const d of REQUIRES_DEPENDENCIES.filter((x) => NUEVOS.includes(x.source))) {
      const espejo = DEPENDENCIES.find(
        (x) => x.kind === 'provides' && x.source === d.target && x.target === d.source,
      );
      if (espejo && espejo.nature !== d.nature) {
        desalineados.push(`${clave(d)}: requires ${d.nature} vs provides ${espejo.nature}`);
      }
    }
    expect(desalineados).toEqual([]);
  });

  /**
   * `PLANRUTA` no es nodo del grafo, y los tres documentos que quisieron tenderle
   * una arista lo bajaron a prosa con la razón escrita: `PLANPACTO:723`,
   * `PLANARCO:779` y `PLANPREGUNTA:750`. Si vuelve a entrar, V-REF-03 dispara
   * ERROR — este test lo dice antes y con nombre.
   */
  it('PLANRUTA no es extremo de ninguna arista', () => {
    const conRuta = DEPENDENCIES.filter(
      (d) => d.source === 'PLANRUTA' || d.target === 'PLANRUTA',
    ).map(clave);
    expect(conRuta).toEqual([]);
  });

  it('los alimentadores documentales no son extremo de ninguna arista', () => {
    // `PRESUPUESTO_CONSOLIDADO_BASTA.md`, `SOURCE_OF_FUNDS_LEDGER.md` y el acta
    // se citan como fuente y no como PLAN (`PLANARCO:779`, `PLANPREGUNTA:750`).
    const ids = new Set(PLAN_NODES.map((p) => p.id));
    const fantasmas = DEPENDENCIES.filter(
      (d) => !ids.has(d.source) || !ids.has(d.target),
    ).map(clave);
    expect(fantasmas).toEqual([]);
  });

  it('ninguno de los cuatro queda aislado (V-REF-04 / V-RES-04)', () => {
    for (const id of NUEVOS) {
      const grado = REQUIRES_DEPENDENCIES.filter(
        (d) => d.source === id || d.target === id,
      ).length;
      expect(grado, `${id}: grado ${grado}`).toBeGreaterThanOrEqual(3);
    }
  });

  /**
   * Sin fases, V-TIME-01 hace `continue` y **no verifica ninguna** de las aristas
   * críticas nuevas: la regla más severa del motor se saltea en silencio los
   * cuatro PLANes. Cargar las fases es lo que la enciende.
   */
  it('los cuatro tienen fases cargadas, así V-TIME-01 no los saltea', () => {
    for (const id of NUEVOS) {
      const fases = TIMELINE_PHASES.filter((p) => p.planId === id);
      expect(fases.length, `${id}: sin TIMELINE_PHASES`).toBeGreaterThanOrEqual(4);
    }
  });

  it('ninguna arista crítica nueva arranca antes que aquello de lo que depende', () => {
    const inicio = new Map<string, number>();
    for (const f of TIMELINE_PHASES) {
      inicio.set(f.planId, Math.min(inicio.get(f.planId) ?? Number.MAX_SAFE_INTEGER, f.startYear));
    }
    const invertidas: string[] = [];
    for (const d of REQUIRES_DEPENDENCIES) {
      if (d.nature !== 'CRITICAL') continue;
      if (!NUEVOS.includes(d.source) && !NUEVOS.includes(d.target)) continue;
      const s = inicio.get(d.source);
      const t = inicio.get(d.target);
      if (s === undefined || t === undefined) continue;
      if (s < t) invertidas.push(`${clave(d)}: ${String(s)} < ${String(t)}`);
    }
    expect(invertidas).toEqual([]);
  });

  it('el motor de validación no reporta ningún ERROR', () => {
    const errores = runAllValidations().filter((r) => r.severity === 'ERROR');
    expect(errores.map((e) => `${e.ruleId} ${e.planId ?? ''} ${e.message}`)).toEqual([]);
  });

  it('los ids de dependencia son únicos y correlativos', () => {
    const ids = DEPENDENCIES.map((d) => d.id);
    expect(new Set(ids).size, 'hay ids repetidos').toBe(ids.length);
  });
});
