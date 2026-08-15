/**
 * El documento del mandato — el país pedido por escrito.
 *
 * ## Qué cambió, y por qué importa
 *
 * Hasta hoy este archivo agregaba `dreams`, `pulse_signals` y `proposals`: las
 * tres tablas viejas, con el vocabulario viejo. Desde la `0022` las tres están
 * marcadas RETIRADA y lo que la gente carga vive en `senales` — o sea que **el
 * mapa escribía en un lado y el mandato leía del otro**, y el documento
 * devolvía ceros mientras el país cargaba señales. Era el corte más grave del
 * sistema y no se veía como un error: se veía como un país que no dijo nada.
 *
 * Ahora lee `senales`, y con eso gana algo que antes no podía tener: **la
 * composición por clase**. Un documento que dice «300 voces» no distingue entre
 * 300 hechos comprobables y 300 sueños, y son dos países distintos. La regla 11
 * vive acá también: lo que se comprueba y lo que se delibera se cuentan
 * separados o el número miente.
 *
 * La FORMA de la respuesta no cambia —`voces`, `recursos`, `brechas`,
 * `senales`, `propuestas`— porque la página del mandato ya la consume. Lo que
 * cambia es de dónde sale y qué gana: `porClase` es nuevo.
 */
import { CLASES_SENAL } from '@v2/civic-core';
import { desc, eq, sql } from '@v2/db';
import { geographicLocations, senales } from '@v2/db/schema';

import type { Db } from '@v2/db';

const TEMAS_TOPE = 8;
const PROPUESTAS_TOPE = 5;

export interface DocumentoMandato {
  generadoEl: string;
  voces: {
    total: number;
    porTipo: { tipo: string | null; total: number }[];
    /** La composición por clase — lo que se comprueba contra lo que se delibera. */
    porClase: { clase: string; total: number }[];
  };
  recursos: { total: number; porProvincia: { provincia: string | null; total: number }[] };
  brechas: { provincia: string; piden: number; ofrecen: number }[];
  senales: {
    total: number;
    clasificadas: number;
    temas: {
      tema: string;
      total: number;
      /** El id PÚBLICO, un uuid: el ordinal deja enumerar el corpus entero. */
      ultima: { id: string; texto: string; provincia: string | null; fecha: string } | null;
    }[];
  };
  /**
   * Sin `votos` ni `apoyo`: **no hay votación**. Una propuesta junta
   * adhesiones, y una adhesión no es un voto. Mostrar un contador que se lea
   * como resultado es lo que la regla 11 prohíbe.
   */
  propuestas: { id: string; titulo: string; resumen: string; estado: string }[];
}

export async function buildDocumento(db: Db): Promise<DocumentoMandato> {
  /**
   * El filtro que va en TODAS las consultas de abajo.
   *
   * `retenida_en is null` es la retención de cuidado: visibilidad, no calidad.
   * No toca `estado`, así que un filtro por estado no la caza — tiene que estar
   * escrito acá o el documento publica lo que se pidió sacar de circulación.
   * Y `estado <> 'retirada'` porque una retirada conserva la fila para la
   * cobertura pero su texto está vacío por CHECK: contarla como voz sería
   * contar un silencio.
   */
  const visible = sql`${senales.retenidaEn} is null and ${senales.estado} <> 'retirada'`;

  // 1. El registro: voces por tipo y por clase.
  const porTipo = await db
    .select({ tipo: senales.tipo, total: sql<number>`count(*)::int` })
    .from(senales)
    .where(visible)
    .groupBy(senales.tipo)
    .orderBy(sql`count(*) desc`);
  const vocesTotal = porTipo.reduce((acc, t) => acc + t.total, 0);

  const porClaseCrudo = await db
    .select({ clase: senales.clase, total: sql<number>`count(*)::int` })
    .from(senales)
    .where(visible)
    .groupBy(senales.clase);

  /**
   * Las cuatro SIEMPRE, incluso en cero.
   *
   * Una clase ausente de la lista se lee como «no aplica»; una clase en cero se
   * lee como «nadie dijo nada de eso», que es una afirmación sobre el país y no
   * sobre el instrumento. Son cosas distintas y la de abajo es la verdadera.
   */
  const cuenta = new Map(porClaseCrudo.map((c) => [c.clase, c.total]));
  const porClase = CLASES_SENAL.map((clase) => ({ clase, total: cuenta.get(clase) ?? 0 }));

  // 2. Lo que se ofrece: los `recurso`, por provincia.
  const recursosPorProvincia = await db
    .select({ provincia: geographicLocations.name, total: sql<number>`count(*)::int` })
    .from(senales)
    .leftJoin(geographicLocations, eq(senales.provinceId, geographicLocations.id))
    .where(sql`${visible} and ${senales.tipo} = 'recurso'`)
    .groupBy(geographicLocations.name)
    .orderBy(sql`count(*) desc`);
  const recursosTotal = recursosPorProvincia.reduce((acc, r) => acc + r.total, 0);

  /**
   * 3. La brecha: lo que se pide contra lo que se ofrece, por provincia.
   *
   * Es el cruce más útil que este documento puede hacer hoy sin corroboración,
   * y también el más fácil de leer mal: una brecha grande puede significar que
   * falta mucho, o que nadie cargó todavía lo que tiene para ofrecer. El número
   * solo no distingue las dos cosas — por eso la página lo muestra al lado de
   * la cobertura y no como un titular.
   */
  const nvsr = await db
    .select({
      provincia: geographicLocations.name,
      tipo: senales.tipo,
      total: sql<number>`count(*)::int`,
    })
    .from(senales)
    .innerJoin(geographicLocations, eq(senales.provinceId, geographicLocations.id))
    .where(sql`${visible} and ${senales.tipo} in ('necesidad', 'recurso')`)
    .groupBy(geographicLocations.name, senales.tipo);
  const porProvincia = new Map<string, { piden: number; ofrecen: number }>();
  for (const fila of nvsr) {
    const entry = porProvincia.get(fila.provincia) ?? { piden: 0, ofrecen: 0 };
    if (fila.tipo === 'necesidad') entry.piden += fila.total;
    if (fila.tipo === 'recurso') entry.ofrecen += fila.total;
    porProvincia.set(fila.provincia, entry);
  }
  const brechas = [...porProvincia.entries()]
    .filter(([, v]) => v.piden >= 1)
    .map(([provincia, v]) => ({ provincia, ...v }))
    .sort((a, b) => b.piden - b.ofrecen - (a.piden - a.ofrecen));

  /**
   * 4. Los temas.
   *
   * `senales.tema` sale del catálogo cerrado de once que la `0022` siembra, así
   * que acá no hay clasificador ni texto libre: o el tema está declarado o es
   * NULL, y NULL se cuenta aparte en vez de plegarse a «otros». `sin_clasificar`
   * dejó de existir como valor — era el sumidero de la tabla vieja.
   */
  const [totales] = await db
    .select({
      total: sql<number>`count(*)::int`,
      clasificadas: sql<number>`count(*) filter (where ${senales.tema} is not null)::int`,
    })
    .from(senales)
    .where(visible);

  const temasRanked = await db
    .select({ tema: senales.tema, total: sql<number>`count(*)::int` })
    .from(senales)
    .where(sql`${visible} and ${senales.tema} is not null`)
    .groupBy(senales.tema)
    .orderBy(sql`count(*) desc`)
    .limit(TEMAS_TOPE);

  const temas = await Promise.all(
    temasRanked.flatMap((t) => {
      const tema = t.tema;
      if (tema === null) return [];
      return [
        (async () => {
          const [ultima] = await db
            .select({
              idPublico: senales.idPublico,
              texto: senales.texto,
              provincia: geographicLocations.name,
              fecha: senales.creadaEn,
            })
            .from(senales)
            .leftJoin(geographicLocations, eq(senales.provinceId, geographicLocations.id))
            .where(sql`${visible} and ${senales.tema} = ${tema}`)
            .orderBy(desc(senales.creadaEn))
            .limit(1);
          return {
            tema,
            total: t.total,
            ultima: ultima
              ? {
                  id: ultima.idPublico,
                  texto: ultima.texto,
                  provincia: ultima.provincia,
                  fecha: ultima.fecha.toISOString(),
                }
              : null,
          };
        })(),
      ];
    }),
  );

  /**
   * 5. Las propuestas.
   *
   * Salen de `senales` con tipo `propuesta` y ya no de la tabla `proposals`. Y
   * pierden el `votos`/`apoyo` que traían: **no hay votación**. Una propuesta
   * junta adhesiones, y una adhesión no es un voto — mostrar un contador que se
   * lea como resultado es exactamente lo que la regla 11 prohíbe. El día que
   * exista deliberación, el número que vaya acá saldrá de ahí.
   */
  const propuestasCrudas = await db
    .select({
      idPublico: senales.idPublico,
      titulo: senales.titulo,
      texto: senales.texto,
      estado: senales.estado,
    })
    .from(senales)
    .where(sql`${visible} and ${senales.tipo} = 'propuesta'`)
    .orderBy(desc(senales.creadaEn))
    .limit(PROPUESTAS_TOPE);

  const propuestas = propuestasCrudas.map((p) => ({
    id: p.idPublico,
    titulo: p.titulo ?? p.texto.slice(0, 80),
    resumen: p.texto,
    estado: p.estado,
  }));

  return {
    generadoEl: new Date().toISOString(),
    voces: { total: vocesTotal, porTipo, porClase },
    recursos: { total: recursosTotal, porProvincia: recursosPorProvincia },
    brechas,
    senales: {
      total: totales?.total ?? 0,
      clasificadas: totales?.clasificadas ?? 0,
      temas,
    },
    propuestas,
  };
}
