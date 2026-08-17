import {
  EmbebedorFalso,
  aristasMedidas,
  claseDe,
  nucleosAlUmbral,
  similitudCoseno,
  tokensDeContenido,
} from '@v2/civic-core';
import { beforeAll, describe, expect, it } from 'vitest';

import {
  cifrasDeCorroboracion,
  cifrasDeLegitimidad,
  COBERTURA_Y_SESGO,
  coberturaDe,
  CONTRADICCION_CORROBORADA,
  ESCENARIO_BRONCA,
  ESCENARIO_DATO,
  ESCENARIO_RECLAMO,
  estaCorroborada,
  FALSO_AMIGO,
  LOS_TRES_ESCENARIOS,
  NUCLEO_MIXTO,
  PROVINCIA_MUDA,
  UMBRAL_DEL_EJEMPLO,
} from '../ejemplos';

import type { Corroboracion, Escenario } from '../ejemplos';
import type { Particion } from '@v2/civic-core';

/** Para leer `corroboracion` sin `!`: si falta, la aserción falla con sentido. */
const SIN_CORROBORAR: Corroboracion = {
  veredicto: 'sin visitar',
  confirmaciones: 0,
  nota: 'no la trajo el corpus',
};

/**
 * Los tres escenarios — las afirmaciones del ejemplo, medidas.
 *
 * Este archivo existe porque el ejemplo **afirma cosas**: que la legitimidad no
 * se mueve, que la bronca converge más que la precisión, que hay un falso amigo
 * que se junta, que hay un núcleo mixto que no se resuelve por mayoría. Cada
 * una de esas afirmaciones está escrita en un comentario y sería falsa en
 * silencio el día que alguien toque una frase. Acá se corre el motor de verdad
 * sobre el corpus de verdad y se comprueban.
 */

const embebedor = new EmbebedorFalso();
const particiones = new Map<string, Particion>();
const vectores = new Map<string, ReadonlyMap<string, readonly number[]>>();

const particionDe = (escenario: Escenario): Particion => {
  const p = particiones.get(escenario.id);
  if (p === undefined) throw new Error(`sin partición para ${escenario.id}`);
  return p;
};

const mayorDe = (p: Particion): number => Math.max(0, ...p.nucleos.map((n) => n.ids.length));

beforeAll(async () => {
  for (const escenario of LOS_TRES_ESCENARIOS) {
    const ids = escenario.voces.map((v) => v.id);
    const vs = await embebedor.embeber(escenario.voces.map((v) => v.texto));
    const porId = new Map(ids.map((id, i) => [id, vs[i] ?? []]));
    vectores.set(escenario.id, porId);
    particiones.set(
      escenario.id,
      nucleosAlUmbral(ids, aristasMedidas(porId, 12), UMBRAL_DEL_EJEMPLO),
    );
  }
});

describe('el padrón es el mismo en los tres', () => {
  it('las tres tienen 63 voces, y son las mismas 63', () => {
    for (const escenario of LOS_TRES_ESCENARIOS) {
      expect(escenario.voces).toHaveLength(63);
    }
    const [a, b, c] = LOS_TRES_ESCENARIOS.map((e) => e.voces.map((v) => v.id).join('|'));
    expect(a).toBe(b);
    expect(b).toBe(c);
  });

  it('las mismas personas, los mismos territorios y los mismos meses', () => {
    const huella = (e: Escenario): string =>
      e.voces.map((v) => `${v.actorId}@${v.territorioId}@${String(v.dicha)}`).join('|');
    expect(huella(ESCENARIO_BRONCA)).toBe(huella(ESCENARIO_RECLAMO));
    expect(huella(ESCENARIO_RECLAMO)).toBe(huella(ESCENARIO_DATO));
  });

  it('63 señales de 44 personas: las señales no son personas', () => {
    const cifras = cifrasDeLegitimidad(ESCENARIO_BRONCA);
    expect(cifras.voces).toBe(63);
    expect(cifras.actores).toBe(44);
  });

  it('la clase nunca se escribe a mano: sale del canon', () => {
    for (const escenario of LOS_TRES_ESCENARIOS) {
      for (const voz of escenario.voces) expect(voz.clase).toBe(claseDe(voz.tipo));
    }
  });
});

describe('la composición no entra en la legitimidad', () => {
  it('la legitimidad es idéntica en los tres, hasta el último decimal', () => {
    const [a, b, c] = LOS_TRES_ESCENARIOS.map((e) => cifrasDeLegitimidad(e));
    expect(a).toBeDefined();
    expect(a).toEqual(b);
    expect(b).toEqual(c);
  });

  it('y no es cero: alcance × persistencia da algo que se puede mirar', () => {
    const cifras = cifrasDeLegitimidad(ESCENARIO_DATO);
    expect(cifras.legitimidad).toBeCloseTo(cifras.alcance * cifras.persistencia, 10);
    expect(cifras.legitimidad).toBeGreaterThan(0.15);
    expect(cifras.legitimidad).toBeLessThan(0.25);
  });
});

describe('la bronca converge más que la precisión', () => {
  it('el escenario 1 da el grupo más grande, y es casi la mitad del corpus', () => {
    const p = particionDe(ESCENARIO_BRONCA);
    expect(mayorDe(p)).toBe(31);
    expect(p.solas).toHaveLength(19);
  });

  it('el 2 se rompe en varios más chicos, y el 3 todavía más', () => {
    const bronca = particionDe(ESCENARIO_BRONCA);
    const reclamo = particionDe(ESCENARIO_RECLAMO);
    const dato = particionDe(ESCENARIO_DATO);

    expect(reclamo.nucleos.length).toBeGreaterThan(bronca.nucleos.length);
    expect(dato.nucleos.length).toBeGreaterThan(reclamo.nucleos.length);

    // Y el mayor va cayendo: la imagen se vuelve peor a medida que el corpus
    // mejora. Ésa es la lección entera del ejemplo, en dos desigualdades.
    expect(mayorDe(reclamo)).toBeLessThan(mayorDe(bronca));
    expect(mayorDe(dato)).toBeLessThan(mayorDe(reclamo));
  });

  it('y el que más converge no corrobora nada', () => {
    expect(cifrasDeCorroboracion(ESCENARIO_BRONCA).corroboradas).toBe(0);
    expect(ESCENARIO_BRONCA.mandato.hay).toBe(false);
  });
});

/**
 * Que la convergencia de la bronca sea **del corpus y no nuestra**.
 *
 * La primera versión del escenario 1 la fabricaba con tres palabras repetidas a
 * mano: «nada» en 58 de las 63 frases, «nunca» en 40, «nadie» en 23, y la
 * coletilla literal «acá nunca cambia nada» cerrando cinco. Con eso el motor
 * daba un núcleo de 60; sacando esas tres palabras caía a 24. La lección era
 * cierta y estaba inflada.
 *
 * Estas cuatro pruebas son la guarda para que la muleta no vuelva —ni la misma
 * ni otra con otro nombre—. **No miran el texto: lo miden.** Ninguna se puede
 * satisfacer escribiendo un comentario.
 */
describe('la bronca converge sin muleta', () => {
  // El recorte de palabras vacías NO se copia acá: se importa el mismo
  // `tokensDeContenido` que usa `EmbebedorFalso` adentro. Una copia haría
  // que esta guarda midiera otra cosa el día que la lista cambie.
  const tokens = tokensDeContenido;

  const TEXTOS = ESCENARIO_BRONCA.voces.map((v) => v.texto);

  /** Frases en las que aparece cada token, de mayor a menor. */
  const frecuencias = (textos: readonly string[]): [string, number][] => {
    const cuenta = new Map<string, number>();
    for (const t of textos) {
      for (const tok of new Set(tokens(t))) cuenta.set(tok, (cuenta.get(tok) ?? 0) + 1);
    }
    return [...cuenta.entries()].sort((a, b) => b[1] - a[1]);
  };

  /** La última cláusula, en tokens de contenido. Es lo que era la coletilla. */
  const clausulaFinal = (texto: string): string => {
    const limpio = texto.trim().replace(/[.!?…]+$/u, '');
    const partes = limpio
      .split(/[.!?;,:—…]+/u)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    return tokens(partes[partes.length - 1] ?? limpio).join(' ');
  };

  const TECHO_DE_TOKEN = 0.35;

  it('ningún token de contenido llega al 35 % de las frases de la bronca', () => {
    const [masFrecuente] = frecuencias(TEXTOS);
    expect(masFrecuente).toBeDefined();
    const [token, veces] = masFrecuente ?? ['', 0];
    // El token va adentro de la aserción para que, el día que se rompa, el rojo
    // diga cuál es la muleta nueva en vez de un número pelado.
    expect([token, veces / TEXTOS.length < TECHO_DE_TOKEN]).toEqual([token, true]);
  });

  /**
   * El techo **sólo rige sobre la bronca**, y la razón no es comodidad.
   *
   * La guarda existe contra **fabricar** la lección: si la bronca converge
   * porque alguien repitió una palabra a mano, el ejemplo enseña algo falso.
   * En los otros dos corpus un token compartido no es una muleta sino la
   * precisión misma — «2026» aparece en el 57 % de las frases del dato porque
   * un reclamo preciso lleva fecha, y quitarle la fecha para que la guarda dé
   * verde sería empeorar el corpus para que el número quede lindo.
   *
   * Entonces los otros dos se **miden y se declaran**, no se gatean. Este test
   * publica sus números y sólo se pone rojo si alguno **empeora**, que es lo
   * que hace que la declaración no envejezca en silencio.
   */
  it('los otros dos corpus declaran su token más compartido, sin techo', () => {
    const medir = (voces: readonly { texto: string }[]) => {
      const textos = voces.map((v) => v.texto);
      const [top] = frecuencias(textos);
      const [token, veces] = top ?? ['', 0];
      return { token, parte: Number((veces / textos.length).toFixed(3)) };
    };

    const reclamo = medir(ESCENARIO_RECLAMO.voces);
    const dato = medir(ESCENARIO_DATO.voces);

    // Medido el 17/8/2026. Si alguno sube, el corpus se está apoyando más en
    // una palabra que antes y hay que mirarlo.
    expect(reclamo.parte).toBeLessThanOrEqual(0.45);
    expect(dato.parte).toBeLessThanOrEqual(0.6);
    expect(dato.token).toBe('2026');
  });

  it('ninguna cláusula final se repite más de dos veces', () => {
    const cuenta = new Map<string, number>();
    for (const t of TEXTOS) {
      const c = clausulaFinal(t);
      cuenta.set(c, (cuenta.get(c) ?? 0) + 1);
    }
    const repetidas = [...cuenta.entries()].filter(([, n]) => n > 2);
    expect(repetidas).toEqual([]);
  });

  /**
   * La prueba que de verdad detecta una muleta: **sacar del corpus sus tres
   * tokens más frecuentes y volver a medir**. Si el núcleo mayor se derrumba,
   * es que lo sostenían esas tres palabras y no la bronca. El techo es 25 %.
   */
  it('la ablación de los tres tokens más frecuentes mueve el mayor menos del 25 %', async () => {
    const tres = new Set(
      frecuencias(TEXTOS)
        .slice(0, 3)
        .map(([t]) => t),
    );
    const podados = TEXTOS.map((t) =>
      tokens(t)
        .filter((tok) => !tres.has(tok))
        .join(' '),
    );

    const ids = ESCENARIO_BRONCA.voces.map((v) => v.id);
    const vs = await embebedor.embeber(podados);
    const porId = new Map(ids.map((id, i) => [id, vs[i] ?? []]));
    const podado = nucleosAlUmbral(ids, aristasMedidas(porId, 12), UMBRAL_DEL_EJEMPLO);

    const entero = mayorDe(particionDe(ESCENARIO_BRONCA));
    expect(Math.abs(mayorDe(podado) - entero) / entero).toBeLessThan(0.25);
  });

  it('y el orden por tamaño del mayor se sostiene: bronca > reclamo > dato', () => {
    const bronca = mayorDe(particionDe(ESCENARIO_BRONCA));
    const reclamo = mayorDe(particionDe(ESCENARIO_RECLAMO));
    const dato = mayorDe(particionDe(ESCENARIO_DATO));
    expect(bronca).toBeGreaterThan(reclamo);
    expect(reclamo).toBeGreaterThan(dato);
  });
});

describe('el instrumento se equivoca, y se ve', () => {
  it('el falso amigo se junta en el escenario 2', () => {
    const porId = vectores.get(ESCENARIO_RECLAMO.id);
    const a = porId?.get(FALSO_AMIGO.a);
    const b = porId?.get(FALSO_AMIGO.b);
    expect(a).toBeDefined();
    expect(b).toBeDefined();
    expect(similitudCoseno(a ?? [], b ?? [])).toBeGreaterThan(UMBRAL_DEL_EJEMPLO);

    const juntas = particionDe(ESCENARIO_RECLAMO).nucleos.some(
      (n) => n.ids.includes(FALSO_AMIGO.a) && n.ids.includes(FALSO_AMIGO.b),
    );
    expect(juntas).toBe(true);
  });

  it('y se deshace en el 3, porque alguien escribió el nombre completo de la cosa', () => {
    const porId = vectores.get(ESCENARIO_DATO.id);
    const a = porId?.get(FALSO_AMIGO.a);
    const b = porId?.get(FALSO_AMIGO.b);
    expect(similitudCoseno(a ?? [], b ?? [])).toBeLessThan(UMBRAL_DEL_EJEMPLO);
  });
});

describe('el núcleo mixto no se resuelve por mayoría', () => {
  it('los hechos y los deseos del agua caen en el mismo núcleo del escenario 2', () => {
    const todos = [...NUCLEO_MIXTO.hechos, ...NUCLEO_MIXTO.deseos];
    const nucleo = particionDe(ESCENARIO_RECLAMO).nucleos.find((n) =>
      todos.every((id) => n.ids.includes(id)),
    );
    expect(nucleo).toBeDefined();
  });

  it('y adentro conviven las dos clases: una se corrobora, la otra se delibera', () => {
    const porId = new Map(ESCENARIO_RECLAMO.voces.map((v) => [v.id, v]));
    for (const id of NUCLEO_MIXTO.hechos) expect(porId.get(id)?.clase).toBe('hecho');
    for (const id of NUCLEO_MIXTO.deseos) expect(porId.get(id)?.clase).toBe('deseo');
  });
});

describe('toda síntesis muestra cobertura y sesgo', () => {
  it('hay una provincia muda, y está en el padrón para que se la pueda nombrar', () => {
    const cobertura = coberturaDe(ESCENARIO_DATO);
    expect(cobertura.mudas).toEqual([PROVINCIA_MUDA]);
    expect(cobertura.conVoz).toHaveLength(7);
    expect(cobertura.fueraDelPadron).toHaveLength(16);
    expect(cobertura.provinciasDelPais).toBe(24);
  });
});

describe('la corroboración es otra máquina, y sólo corre en el escenario 3', () => {
  it('en el 1 y el 2 nadie fue a mirar nada', () => {
    for (const escenario of [ESCENARIO_BRONCA, ESCENARIO_RECLAMO]) {
      for (const voz of escenario.voces) expect(voz.corroboracion).toBeNull();
    }
  });

  it('un deseo nunca se corrobora: se delibera', () => {
    for (const voz of ESCENARIO_DATO.voces) {
      if (voz.clase === 'deseo' || voz.clase === 'meta') {
        expect(voz.corroboracion?.veredicto).toBe('no corresponde');
      }
    }
  });

  /**
   * El límite de corroborar, puesto a propósito y declarado.
   *
   * Dos señales confirmadas que no coinciden en cuánto duró el mismo corte. No
   * es un descuido: es lo que separa «alguien fue a mirar» de «el número es
   * correcto». Lo que se verifica acá es que **siga siendo una contradicción**
   * —si alguien la reconcilia editando un texto, la lección desaparece— y que
   * **esté declarada en la pantalla**, no sólo en un comentario.
   */
  it('dos señales corroboradas se contradicen, y las dos siguen confirmadas', () => {
    const porId = new Map(ESCENARIO_DATO.voces.map((v) => [v.id, v]));
    const a = porId.get(CONTRADICCION_CORROBORADA.a);
    const b = porId.get(CONTRADICCION_CORROBORADA.b);
    expect(a).toBeDefined();
    expect(b).toBeDefined();
    expect(a?.corroboracion?.veredicto).toBe('confirmada');
    expect(b?.corroboracion?.veredicto).toBe('confirmada');
    expect(estaCorroborada(a?.corroboracion ?? SIN_CORROBORAR)).toBe(true);
    expect(estaCorroborada(b?.corroboracion ?? SIN_CORROBORAR)).toBe(true);

    // Hablan del mismo hecho y no dicen lo mismo: misma fecha, cifras distintas.
    expect(a?.cuando).toBe(b?.cuando);
    expect(a?.texto).toContain('11 horas');
    expect(b?.texto).toContain('51 horas');
  });

  it('y la contradicción está declarada donde la pantalla la lee', () => {
    const declarada = COBERTURA_Y_SESGO.filter((linea) =>
      linea.includes(CONTRADICCION_CORROBORADA.sobre),
    );
    expect(declarada).toHaveLength(1);
    expect(declarada[0]).toContain(CONTRADICCION_CORROBORADA.queHaceElRegistro);
    // Y lo que el registro NO hace queda escrito, porque es la mitad del punto.
    expect(CONTRADICCION_CORROBORADA.queHaceElRegistro).toMatch(/[Nn]o las promedia/);
    expect(CONTRADICCION_CORROBORADA.queHaceElRegistro).toMatch(/no borra ninguna/);
  });

  it('el mandato del escenario 3 no se apoya en el hecho contradicho', () => {
    const dicho = ESCENARIO_DATO.voces.find((v) => v.id === CONTRADICCION_CORROBORADA.a);
    expect(dicho).toBeDefined();
    expect(ESCENARIO_DATO.mandato.texto).not.toContain('Alto de la Cruz');
    expect(ESCENARIO_DATO.mandato.comoSeVerifica ?? '').not.toContain('Alto de la Cruz');
  });

  it('hay una señal desmentida, y sigue en el registro', () => {
    const cifras = cifrasDeCorroboracion(ESCENARIO_DATO);
    expect(cifras.desmentidas).toBe(1);
    expect(cifras.corroboradas).toBeGreaterThan(40);
    expect(ESCENARIO_DATO.voces).toHaveLength(63);
  });
});

describe('el mandato', () => {
  it('en la bronca no hay ninguno, y la razón está escrita', () => {
    expect(ESCENARIO_BRONCA.mandato.hay).toBe(false);
    expect(ESCENARIO_BRONCA.mandato.comoSeVerifica).toBeNull();
    expect(ESCENARIO_BRONCA.mandato.porQue).toContain('Sin lugar');
    expect(ESCENARIO_BRONCA.mandato.porQue).toContain('sin fecha no hay plazo');
  });

  it('en el reclamo y en el dato hay, y el del dato dice cómo se verifica', () => {
    expect(ESCENARIO_RECLAMO.mandato.hay).toBe(true);
    expect(ESCENARIO_DATO.mandato.hay).toBe(true);
    expect(ESCENARIO_DATO.mandato.comoSeVerifica).not.toBeNull();
    expect(ESCENARIO_DATO.mandato.texto).toContain('días');
  });
});
