/**
 * Mirar — la pila de aportes de otras personas, de a uno.
 *
 * Spec: `docs/specs/2026-10-19-mi-argentina-ideal-la-pila.md` §3 y §4.
 * Plan: `docs/plans/2026-10-19-mi-argentina-ideal-entrega-1-plan.md` tareas 3 y 6.
 *
 * Este módulo es isomorfo: lo usan la API (para validar y frenar) y la web (para
 * avisar antes de enviar). Nada acá llama a la red ni a un modelo.
 */

/** Lo que entra en la tarjeta. El aporte de Mi Argentina ideal es esta línea. */
export const LARGO_LINEA = 140;
/** Reportes de actores distintos que sacan un aporte de Mirar (decisión D3 del dueño). */
export const UMBRAL_REPORTES = 13;
/** Un reporte cuenta sólo si quien reporta ya contestó esta cantidad de aportes. */
export const RESPUESTAS_PARA_REPORTAR = 5;
/** Opiniones que convierten a alguien en participante, a los fines del impulso de campañas. */
export const OPINIONES_PARA_PARTICIPAR = 5;

export const MOTIVOS_DE_REPORTE = ['insulta', 'datos_personales', 'fuera_de_tema'] as const;
export type MotivoDeReporte = (typeof MOTIVOS_DE_REPORTE)[number];
export const VALORES_DE_OPINION = ['acuerdo', 'desacuerdo', 'paso'] as const;
export type ValorDeOpinion = (typeof VALORES_DE_OPINION)[number];

/** Las puntas de la primera pantalla: preguntan, nunca escriben por nadie. */
export const PUNTAS: readonly { clave: string; rotulo: string; pista: string }[] = [
  { clave: 'trabajo', rotulo: 'tu trabajo', pista: '¿De qué vivirías? ¿Cuántas horas, y dónde?' },
  {
    clave: 'barrio',
    rotulo: 'tu barrio',
    pista: '¿Cómo volvés de noche? ¿Qué hay a diez cuadras?',
  },
  {
    clave: 'familia',
    rotulo: 'tu familia',
    pista: '¿Quién cuida a quién? ¿Se tienen que separar?',
  },
  { clave: 'salud', rotulo: 'tu salud', pista: '¿Qué pasa cuando te enfermás un martes?' },
  { clave: 'tiempo', rotulo: 'tu tiempo', pista: '¿Qué harías con dos horas más por día?' },
  { clave: 'vejez', rotulo: 'cuando seas grande', pista: '¿Dónde y con quién te imaginás?' },
  { clave: 'aprender', rotulo: 'lo que aprendés', pista: '¿Qué te gustaría aprender, y dónde?' },
];

const FORMULA = /^\s*(en\s+(mi|una|la|nuestra)\s+argentina\s+ideal)\s*,?\s*/i;

/**
 * La línea que se propone a partir de lo que la persona escribió: la primera
 * oración, sin la fórmula de arranque (la tarjeta ya la dice), con mayúscula
 * inicial y cortada en una palabra entera si pasa de `max`. No inventa puntos
 * suspensivos ni cambia una palabra.
 */
export function lineaSugerida(texto: string, max = LARGO_LINEA): string {
  let t = texto.trim().replace(/\s+/g, ' ');
  const corte = t.search(/[.!?](\s|$)/);
  if (corte > 0) t = t.slice(0, corte + 1);
  t = t.replace(FORMULA, '');
  if (t) t = t.charAt(0).toUpperCase() + t.slice(1);
  if (t.length > max) {
    const recorte = t.slice(0, max + 1);
    const espacio = recorte.lastIndexOf(' ');
    t = (espacio > 0 ? recorte.slice(0, espacio) : t.slice(0, max)).replace(/[,;:]$/, '');
  }
  return t;
}

const sinTildes = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

/**
 * Raíces por tema, con las claves de la tabla `temas` (con tilde: `educación`,
 * `economía`). Chico a propósito: sugiere, no clasifica. La persona confirma
 * o cambia, y lo que se guarda es lo que ella eligió (`tema_origen = 'declarado'`).
 */
export const LEXICO_DE_TEMAS: Readonly<Record<string, readonly string[]>> = {
  salud: [
    'medic',
    'hospital',
    'turno',
    'salita',
    'remedi',
    'guardia',
    'pediatr',
    'psicolog',
    'enferm',
    'salud',
    'dentist',
  ],
  educación: [
    'escuel',
    'estudi',
    'universid',
    'maestr',
    'aprend',
    'colegio',
    'secundari',
    'facultad',
    'educa',
  ],
  trabajo: ['trabaj', 'laburo', 'empleo', 'oficio', 'changa', 'emprend', 'jubil'],
  vivienda: ['casa', 'alquil', 'vivienda', 'hipotec', 'techo', 'terreno', 'departamento'],
  movilidad: ['colectivo', 'tren', 'ruta', 'viaj', 'transporte', 'subte', 'bondi', 'bici'],
  seguridad: ['segur', 'robo', 'polic', 'miedo', 'chorr', 'violen'],
  ambiente: ['agua', ' rio ', 'incendi', 'basura', 'contamin', 'clima', 'arbol', 'plaza'],
  cultura: ['fiesta', 'music', 'cultura', ' club', 'carnaval', 'teatro', 'idioma', 'libro'],
  cuidado: ['cuid', 'vieja', 'viejo', 'abuel', 'jardin', 'discapac', 'crianza', 'bebe'],
  alimento: ['comida', 'comer', 'verdura', 'aliment', 'comedor', 'hambre', 'fruta', 'cocin'],
  democracia: [
    'votar',
    'voto',
    'diputad',
    'municip',
    'gobierno',
    'politic',
    'particip',
    'transparen',
  ],
  justicia: ['juicio', 'juez', 'justicia', 'abogad', 'denuncia', 'tribunal'],
  economía: ['precio', 'inflac', 'ahorr', 'pesos', 'dolar', 'impuesto', 'sueldo', 'plata', 'deuda'],
};

/** El tema que sugieren las palabras, o `null` si no hay uno que gane claro. */
export function sugerirTema(texto: string, claves?: readonly string[]): string | null {
  const t = ' ' + sinTildes(texto).replace(/[^a-zñ0-9]+/g, ' ') + ' ';
  const puntos = Object.entries(LEXICO_DE_TEMAS)
    .filter(([k]) => !claves || claves.includes(k))
    .map(([k, raices]) => [k, raices.filter((r) => t.includes(r)).length] as const)
    .filter(([, n]) => n > 0)
    .sort((a, b) => b[1] - a[1]);
  const [primero, segundo] = puntos;
  if (!primero) return null;
  if (!segundo || primero[1] > segundo[1]) return primero[0];
  return null;
}

export interface DatoPersonal {
  tipo: 'mail' | 'telefono' | 'dni';
  desde: number;
  hasta: number;
}

/**
 * Lo que parece un dato de una persona: mails, teléfonos y números de DNI.
 *
 * Conservador para no frenar a nadie de más: «1.000.000 de pesos», «la Ruta 40»,
 * «100.000 habitantes» o «el 0800» no frenan. Protege datos personales, no juzga
 * el contenido; por eso corre en el servidor, sin modelo y sin proveedor.
 */
export function buscarDatosPersonales(texto: string): DatoPersonal[] {
  const hallazgos: DatoPersonal[] = [];
  for (const m of texto.matchAll(/[^\s@]+@[^\s@]+\.[a-z]{2,}/gi))
    hallazgos.push({ tipo: 'mail', desde: m.index, hasta: m.index + m[0].length });
  for (const m of texto.matchAll(
    /(dni|documento|d\.n\.i\.?)[^\d]{0,15}(\d{1,2}\.?\d{3}\.?\d{3})/gi,
  )) {
    const numero = m[2] ?? '';
    const desde = m.index + m[0].lastIndexOf(numero);
    hallazgos.push({ tipo: 'dni', desde, hasta: desde + numero.length });
  }
  for (const m of texto.matchAll(/\+?\(?\d[\d\s\-()]{6,18}\d/g)) {
    const digitos = m[0].replace(/\D/g, '').length;
    const tapado = hallazgos.some((h) => m.index < h.hasta && m.index + m[0].length > h.desde);
    if (digitos >= 8 && digitos <= 13 && !tapado)
      hallazgos.push({ tipo: 'telefono', desde: m.index, hasta: m.index + m[0].length });
  }
  return hallazgos.sort((a, b) => a.desde - b.desde);
}

export const NOMBRE_DEL_DATO: Readonly<Record<DatoPersonal['tipo'], string>> = {
  mail: 'un mail',
  telefono: 'un teléfono',
  dni: 'un DNI',
};

/* ─────────────────────────── Contratos de la API ─────────────────────────── */

/** Un papelito de Mirar. `texto` ya pasó por `textoDeSenalPublica`. */
export interface TarjetaPila {
  id: string;
  texto: string;
  /** Lo que escribió completo, si lo hubo y si cedió el texto. */
  origen: string | null;
  provincia: { id: number; nombre: string } | null;
  tema: { clave: string; etiqueta: string } | null;
}

export interface EstadoEnLaPila {
  provincia: { id: number; nombre: string } | null;
  /** Nunca contestó y no publicó con provincia: se le pregunta antes del primer papelito. */
  preguntarProvincia: boolean;
  yaAporto: boolean;
  /** Pares ya comparados, como `clavePar(a, b)` de civic-core. */
  paresComparados: string[];
  /** Aportes que dijo querer, en orden de respuesta: alimenta los duelos. */
  acuerdos: string[];
}

export interface TandaPila {
  tarjetas: TarjetaPila[];
  estado: EstadoEnLaPila;
}

export interface ResultadoOpinion {
  /** Otros actores que dieron el mismo valor; `null` para `paso`. */
  coinciden: number | null;
  /** La región de quien opina llegó a `OPINIONES_PARA_CONTAR` con esta opinión. */
  regionCompleta: { region: string } | null;
}

export interface OpinionDeAporte {
  enMirar: boolean;
  miOpinion: ValorDeOpinion | null;
}

export interface AporteEnGestion {
  id: string;
  texto: string;
  provincia: string | null;
  publicadoEn: string;
  reportes: { motivo: MotivoDeReporte; cuentan: number; noCuentan: number }[];
  retenido: { origen: 'reportes' | 'gestion'; desde: string; motivo: string } | null;
  ultimaDecision: { decision: 'retener' | 'devolver'; motivo: string; fecha: string } | null;
}

/** `GET /api/v1/gestion/pila`: una página de 50; `siguiente` es el `desde` de la próxima, o `null`. */
export interface PaginaGestionPila {
  aportes: AporteEnGestion[];
  siguiente: number | null;
}
