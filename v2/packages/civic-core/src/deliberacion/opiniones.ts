/** Matriz de respuestas explícitas. Nunca recibe textos ni devuelve identidades. */
export interface RespuestaParaAnalisis {
  participante: string;
  afirmacion: string;
  valor: 'acuerdo' | 'desacuerdo' | 'paso' | null;
}
export interface AnalisisOpiniones {
  estado: 'insuficiente' | 'sin_estructura' | 'exploratorio';
  motivo: string;
  participantes: number;
  incluidos: number;
  afirmaciones: number;
  grupos: { nombre: string; cuentas: number }[];
  condiciones: {
    afirmacion: string;
    apoyo: number | null;
    grupos: { nombre: string; acuerdos: number | null; respuestas: number | null }[];
  }[];
  metodo: string;
}
const METODO =
  'PCA centrada con imputación de medias solo para proyección; K-means determinista K=2; grupos de al menos cinco cuentas. Hipótesis exploratoria, sin representación poblacional.';
const norma = (v: number[]) => Math.sqrt(v.reduce((s, x) => s + x * x, 0));
const punto = (a: number[], b: number[]) => a.reduce((s, v, i) => s + v * (b[i] ?? 0), 0);
const distancia = (a: number[], b: number[]) =>
  a.reduce((s, x, i) => s + (x - (b[i] ?? 0)) ** 2, 0);
function componente(x: number[][], anterior?: number[]): number[] {
  const m = x[0]?.length ?? 0;
  let v = Array.from({ length: m }, (_, i) => Math.sin(i + 1));
  for (let t = 0; t < 50; t++) {
    const nuevo = Array<number>(m).fill(0);
    for (const fila of x) {
      const d = punto(fila, v);
      fila.forEach((a, i) => {
        nuevo[i] = (nuevo[i] ?? 0) + a * d;
      });
    }
    if (anterior) {
      const d = punto(nuevo, anterior);
      nuevo.forEach((a, i) => {
        nuevo[i] = a - d * (anterior[i] ?? 0);
      });
    }
    const n = norma(nuevo);
    if (n < 1e-9) return Array<number>(m).fill(0);
    v = nuevo.map((a) => a / n);
  }
  return v;
}
export function analizarOpiniones(respuestas: readonly RespuestaParaAnalisis[]): AnalisisOpiniones {
  const personas = [...new Set(respuestas.map((r) => r.participante))].sort();
  const frases = [...new Set(respuestas.map((r) => r.afirmacion))].sort();
  const base: AnalisisOpiniones = {
    estado: 'insuficiente',
    motivo: 'Hace falta más conversación explícita antes de buscar grupos.',
    participantes: personas.length,
    incluidos: 0,
    afirmaciones: frases.length,
    grupos: [],
    condiciones: [],
    metodo: METODO,
  };
  if (personas.length < 10 || frases.length < 3 || personas.length > 400 || frases.length > 100)
    return {
      ...base,
      motivo:
        personas.length > 400 || frases.length > 100
          ? 'Este conjunto requiere un cálculo desacoplado. Los apoyos generales siguen disponibles.'
          : base.motivo,
    };
  const indice = new Map(
    respuestas
      .filter((r) => r.valor !== null)
      .map((r) => [`${r.participante}:${r.afirmacion}`, r.valor]),
  );
  const participantes = personas.filter(
    (p) => frases.filter((f) => indice.has(`${p}:${f}`)).length >= 3,
  );
  base.incluidos = participantes.length;
  if (participantes.length < 10) return base;
  const originales: (number | null)[][] = participantes.map((p) =>
    frases.map((f) => {
      const v = indice.get(`${p}:${f}`);
      return v === undefined ? null : v === 'acuerdo' ? 1 : v === 'desacuerdo' ? -1 : 0;
    }),
  );
  const medias = frases.map((_, j) => {
    const valores = originales
      .map((f) => f[j])
      .filter((v): v is number => v !== null && v !== undefined);
    return valores.length ? valores.reduce((a, b) => a + b, 0) / valores.length : 0;
  });
  const x = originales.map((f) => f.map((v, j) => (v ?? medias[j] ?? 0) - (medias[j] ?? 0)));
  if (x.every((f) => norma(f) < 1e-9))
    return {
      ...base,
      estado: 'sin_estructura',
      motivo: 'Las respuestas no muestran variación suficiente para separar grupos.',
    };
  const pc1 = componente(x);
  const pc2 = componente(x, pc1);
  const proyectados = x.map((f) => [punto(f, pc1), punto(f, pc2)]);
  let centros = [
    proyectados[0] ?? [0, 0],
    proyectados.reduce((a, b) =>
      distancia(a, proyectados[0] ?? [0, 0]) > distancia(b, proyectados[0] ?? [0, 0]) ? a : b,
    ),
  ];
  let etiquetas: number[] = [];
  for (let t = 0; t < 40; t++) {
    etiquetas = proyectados.map((p) =>
      distancia(p, centros[0] ?? [0, 0]) <= distancia(p, centros[1] ?? [0, 0]) ? 0 : 1,
    );
    centros = [0, 1].map((g) => {
      const grupo = proyectados.filter((_, i) => etiquetas[i] === g);
      return [0, 1].map((j) =>
        grupo.length ? grupo.reduce((a, b) => a + (b[j] ?? 0), 0) / grupo.length : 0,
      );
    });
  }
  const tamanos = [0, 1].map((g) => etiquetas.filter((e) => e === g).length);
  if (tamanos.some((n) => n < 5))
    return {
      ...base,
      estado: 'sin_estructura',
      motivo:
        'La separación dejaría un grupo demasiado pequeño. Conservamos los apoyos sin publicar grupos.',
    };
  const silueta =
    proyectados.reduce((s, p, i) => {
      const mismo = proyectados.filter((_, j) => i !== j && etiquetas[i] === etiquetas[j]);
      const otro = proyectados.filter((_, j) => etiquetas[i] !== etiquetas[j]);
      const a = mismo.reduce((n, v) => n + Math.sqrt(distancia(p, v)), 0) / mismo.length;
      const b = otro.reduce((n, v) => n + Math.sqrt(distancia(p, v)), 0) / otro.length;
      return s + (b - a) / Math.max(a, b, 1e-9);
    }, 0) / proyectados.length;
  if (silueta < 0.25)
    return {
      ...base,
      estado: 'sin_estructura',
      motivo: 'La separación es débil. Hace falta revisar las preguntas y escuchar más.',
    };
  const nombres = ['Mirada A', 'Mirada B'];
  return {
    ...base,
    estado: 'exploratorio',
    motivo:
      'Estos grupos describen respuestas en esta ficha. Su lectura necesita revisión y más de una configuración del método.',
    grupos: tamanos.map((cuentas, i) => ({ nombre: nombres[i] ?? 'Mirada', cuentas })),
    condiciones: frases.map((afirmacion, j) => {
      const grupos = [0, 1].map((g) => {
        const valores = originales
          .filter((_, i) => etiquetas[i] === g)
          .map((f) => f[j])
          .filter((v): v is number => v !== null && v !== undefined);
        const acuerdos = valores.filter((v) => v === 1).length;
        return {
          nombre: nombres[g] ?? 'Mirada',
          acuerdos: valores.length >= 5 ? acuerdos : null,
          respuestas: valores.length >= 5 ? valores.length : null,
        };
      });
      return {
        afirmacion,
        grupos,
        apoyo: grupos.every((g) => g.respuestas !== null)
          ? grupos.reduce((s, g) => (s * ((g.acuerdos ?? 0) + 1)) / ((g.respuestas ?? 0) + 2), 1)
          : null,
      };
    }),
  };
}
