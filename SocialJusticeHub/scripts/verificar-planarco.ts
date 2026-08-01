/**
 * Guardia del documento de PLANARCO.
 *
 * Run: npx tsx scripts/verificar-planarco.ts
 *
 * Verifica lo MECÁNICO y nada más: que estén las secciones esperadas y en
 * orden, que las cifras canónicas ya escritas aparezcan, que los strings
 * prohibidos no aparezcan, que no queden marcadores de pendiente, y que el
 * documento no se invente un piso constitucional.
 *
 * La voz, el argumento y la prosa NO se verifican acá: eso lo mira la
 * revisión. Una guardia que pretende juzgar prosa da falsa tranquilidad.
 *
 * Cada tarea del plan agrega sus secciones a SECCIONES_ESPERADAS antes de
 * escribirlas: primero la guardia falla, después el documento la hace pasar.
 * SECCIONES_ESPERADAS arranca con lo único que la Task 1 escribe —el H2 del
 * mandato— porque la guardia tiene que salir 0 al cierre de cada tarea; la
 * Task 2 le agrega el PREÁMBULO y la TESIS CENTRAL cuando las escriba.
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(SCRIPT_DIR, '../..');
const DOC = resolve(REPO_ROOT, 'Iniciativas Estratégicas/PLANARCO_Argentina_ES.md');
/** Única fuente canónica de los pisos declarados. PLANARCO no puede aparecer ahí. */
const CANON_PISOS = resolve(SCRIPT_DIR, '../tests/unit/pisos-constitucionales.test.ts');

/** El H2 del mandato. Vive aparte porque la anatomía lo necesita para verificar POSICIÓN. */
const H2_MANDATO = '## Vigésimo Quinto Mandato del Proyecto ¡BASTA!';

/** Los H2 que el documento tiene que tener, en este orden. Las tareas lo extienden. */
const SECCIONES_ESPERADAS: string[] = [
  H2_MANDATO,
  '## PREÁMBULO — LA VIDA QUE NADIE MIRÓ ENTERA',
  '## TESIS CENTRAL',
  '## SECCIÓN 0: LAS OCHO FALLAS DEL ARCO DE LA VIDA ARGENTINO',
  '## SECCIÓN 1: LA CRISIS — EL PAÍS SE ESTÁ HACIENDO VIEJO SIN HABER DECIDIDO CÓMO SE ENVEJECE',
  '## SECCIÓN 2: PRECEDENTES INTERNACIONALES Y LOCALES',
  '## SECCIÓN 3: LA SOLUCIÓN — EL CALENDARIO DE UMBRALES',
  '## SECCIÓN 4: LA RENTA DE ARCO',
  '## SECCIÓN 5: EL COMIENZO',
  '## SECCIÓN 6: EL MEDIO',
  // Task 7: SECCIÓN 7 y 8 · …
];

/**
 * Domicilio de la cabecera: el tramo ANTERIOR al primer H2. Ahí viven los
 * metadatos —el ACTA DE HABILITACIÓN, el presupuesto, los principios— y no
 * cuelgan de ningún encabezado, así que necesitan una etiqueta propia.
 */
const CABECERA = '(cabecera)';

/**
 * Las ocho fallas de la SECCIÓN 0 llevan la forma de PLANPACTO:96-130 y son
 * OCHO, ni siete ni nueve: el H2 de la sección lo promete en el título. Sin
 * esto, borrar una falla entera salía verde — el mismo modo de falla que la
 * portada tenía antes de que la anatomía se declarara acá.
 *
 * Se verifica la numeración `### 0.N` correlativa de 1 a 8 y, adentro de cada
 * una, los tres leads en negrita que el brief manda. Los leads se buscan sobre
 * el texto CON negritas a propósito: la forma es el lead en negrita, no la
 * palabra suelta, y sobre `rawPlano` un párrafo sin negrita pasaría igual.
 */
const FALLAS_ESPERADAS = 8;
const LEADS_DE_FALLA: string[] = ['**La falla:**', '**Por qué persiste:**', '**El dato:**'];

/**
 * Cifras y fórmulas verificadas que el documento no puede contradecir ni perder.
 * Cada una tiene domicilio abierto y leído antes de escribirla.
 *
 * OJO — acá van solo NÚMEROS. Las afirmaciones sin cifra van en
 * ASERCIONES_OBLIGATORIAS, abajo. Los totales de tabla NO viven en ninguna de
 * las dos: se buscan como string y siguen apareciendo en la prosa aunque la
 * tabla que los produce esté rota. Esos se suman — ver verificarTablas().
 *
 * DOMICILIO — el campo `en`, agregado en la Task 4, y es el arreglo de la
 * QUINTA forma del mismo defecto que esta guardia viene arrastrando: un chequeo
 * que informa éxito sin haber verificado nada. Hasta acá los dos bucles corrían
 * `raw.includes()` sobre el archivo ENTERO, y hoy hay cinco valores que
 * aparecen en más de un lugar. Verificado antes del arreglo: borrar
 * «18% del PBI» de §1.2 salía **exit 0**, porque el mismo número sobrevive en
 * §0.4 — o sea, la falla que la cifra existe para impedir, pasando en verde.
 * `en` lista los encabezados —H2 o H3, o `(cabecera)` para el tramo anterior al
 * primer H2— donde el valor tiene que estar, y se exige en CADA uno.
 *
 * `veces` es el mínimo de ocurrencias adentro del domicilio, y va solo donde un
 * valor legítimamente aparece dos veces en el mismo encabezado —la cita y su
 * declaración— y perder una de las dos es perder la mitad del sentido. Sin él,
 * la granularidad del chequeo vuelve a ser más gruesa que la unidad verificada,
 * que es exactamente el defecto que este arreglo cierra.
 */
type ValorConDomicilio = { valor: string; en: string[]; veces?: number; porQue: string };

/** Los encabezados que se usan como domicilio, escritos una sola vez. */
const H3_FALLA_CUIDADO = '### 0.4 El trabajo que sostiene el sistema no tiene renglón donde anotarse';
/**
 * **Domicilio por número, no por título.** Este era el título entero del H3, y
 * el H3 más largo y más editorial del documento — el que la Task 5 tenía que
 * volver a tocar. Un domicilio que es el título completo pone la guardia en rojo
 * ante cualquier retitulación futura, por una razón que no tiene nada que ver
 * con lo que el domicilio protege: acá adentro vive el blindaje anti-reversión
 * de §0.6 (la caja de PLANMEMORIA y la aserción «organismo, caja y registro»),
 * y eso sobrevive al título.
 *
 * El espacio final NO es decorativo: marca el domicilio como PREFIJO — ver
 * `textoDeDomicilio()`. `### 0.6 ` no puede colisionar con `### 0.61` porque el
 * espacio corta, y la unicidad se sigue exigiendo igual que antes.
 */
const H3_FALLA_TRANSMISION = '### 0.6 ';
const H3_FALLA_VACIAMIENTO = '### 0.8 Lo que no se financia no se deroga: se deja de ejecutar';
const H3_CURVA = '### 1.1 La curva ya está andando, y el único número que la describe es una cuenta';
const H3_CUIDADORES = '### 1.2 La crisis no es que haya más viejos: es que no hay quién los acompañe';
const H2_TESIS = '## TESIS CENTRAL';
const H2_PRECEDENTES = '## SECCIÓN 2: PRECEDENTES INTERNACIONALES Y LOCALES';
const H2_CALENDARIO = '## SECCIÓN 3: LA SOLUCIÓN — EL CALENDARIO DE UMBRALES';
const H2_RENTA = '## SECCIÓN 4: LA RENTA DE ARCO';
const H2_COMIENZO = '## SECCIÓN 5: EL COMIENZO';
const H2_MEDIO = '## SECCIÓN 6: EL MEDIO';
/** Prefijo, como `### 0.6 `: el domicilio de la tabla de fuentes es su número. */
const H3_TABLA_DE_FUENTES = '### 4.6 ';
/** Prefijo, ídem: la declaración de la liberación vive en 5.4 y en ningún otro lado. */
const H3_LIBERACION = '### 5.4 ';

const CIFRAS_CANONICAS: ValorConDomicilio[] = [
  {
    valor: '1,77–2,13x',
    en: [CABECERA],
    porQue: 'gate de spin-off contra PLANCUIDADO — ACTA_LEVANTAMIENTO_FREEZE_2026-07-26.md:24',
  },
  {
    valor: '8,83–16,00x',
    en: [CABECERA],
    porQue: 'gate de spin-off contra PLANSAL — ACTA_LEVANTAMIENTO_FREEZE_2026-07-26.md:25',
  },
  {
    valor: '1,47–1,88x',
    en: [CABECERA],
    porQue:
      'gate contra los dos huéspedes sumados: NO PASA contra un umbral de 1,5 — ACTA:26, :41-47. ' +
      'Sin este cociente escrito, la cabecera cuenta media verdad',
  },
  {
    valor: 'umbral de 1,5',
    en: [CABECERA],
    porQue: 'el cociente que falla no significa nada sin el umbral contra el que falla — ACTA:42-43',
  },
  {
    valor: '53.000–96.000M',
    en: [CABECERA],
    porQue:
      'el presupuesto a quince años sobre el que se corrió el gate — scripts/gate-spinoff-planes-nuevos.ts:25. ' +
      'El rango ANUAL no se escribe hasta la Task 8 (hallazgo C-5)',
  },
  {
    valor: 'más de 10 millones',
    en: [H3_CURVA],
    veces: 2,
    porQue:
      'la proyección 2040 de 60+, ÚNICA del corpus — PLANREP:367. Va DOS veces en §1.1 y las dos ' +
      'hacen falta: la cita textual de PLANREP y la declaración de que es cuenta del propio PLANREP ' +
      'y no medición. Sin la segunda, el número queda escrito como si detrás hubiera INDEC, CELADE u ONU',
  },
  {
    valor: '150.000 cuidadores',
    en: [H3_CUIDADORES],
    porQue:
      'el déficit de cuidadores formales — PLANREP:335, :367. Es la mitad de la crisis que la curva ' +
      'demográfica sola no muestra: el que va a cuidar tampoco está',
  },
  {
    valor: '18% del PBI',
    en: [H3_FALLA_CUIDADO, H3_CUIDADORES],
    porQue:
      'el volumen del cuidado no remunerado — PLANCUIDADO:94, que lo escribe en letras. Sostiene dos ' +
      'cosas distintas en dos lugares distintos: la falla 0.4 (sin él es una opinión) y la escala de ' +
      'la crisis en §1.2. Con un solo domicilio, borrarlo de uno de los dos salía verde',
  },
  {
    valor: 'USD 680–920M',
    en: [H3_FALLA_TRANSMISION],
    porQue:
      'la caja de la Agencia Nacional de Memoria a régimen pleno, 0,10–0,14% del PBI — PLANMEMORIA:486. ' +
      'Es el número que falsifica la versión anterior de §0.6, que apoyaba tres de sus cuatro ' +
      'afirmaciones en que la transmisión no tenía organismo ni caja. La Task 5 financia contra este ' +
      'diagnóstico: si alguien lo revierte a «no hay caja», la guardia se pone roja antes que la Sección 4',
  },
  {
    valor: '60% del presupuesto',
    en: [H3_FALLA_VACIAMIENTO],
    porQue:
      'el recorte al INTA en los años 90 — BLINDAJE:44. Aserción del corpus SIN fuente externa, y la ' +
      'evidencia del modo de falla más probable de este PLAN: no se deroga, se deja de ejecutar',
  },
  {
    valor: 'enero de 2002',
    en: [H3_FALLA_VACIAMIENTO],
    porQue:
      'la Convertibilidad «se derogó en una noche de enero de 2002» — BLINDAJE:50. El contracaso del ' +
      'INTA: derogar tampoco cuesta tanto cuando la presión alcanza',
  },
  // ── Task 5 · SECCIÓN 4 ────────────────────────────────────────────────────
  {
    valor: 'USD 2.400M',
    en: [H2_RENTA],
    porQue:
      'el pasivo de la redención previsional del cuidado, YA comprometido — PLANCUIDADO:94 y :564, ' +
      'donde es una línea del régimen pleno de ese PLAN. La SECCIÓN 4 declara que el Tramo Ganado no ' +
      'lo vuelve a gastar; sin la cifra escrita, la declaración no tiene contra qué medirse',
  },
  {
    valor: '15–20% del rendimiento',
    en: [H2_RENTA],
    porQue:
      'el Fondo Previsional Bastardo es eso y nada más: una porción del rendimiento anual del fondo ' +
      'soberano, sin monto propio declarado, sobre un capital que todavía no existe — PLANMON:1561',
  },
  {
    valor: 'USD 2.475–4.650M',
    en: [H2_RENTA],
    porQue:
      'el flujo del Fondo Intergeneracional, 15% del FSC — PLANTER:674. Es la única línea del fondo ' +
      'que acumula capital, y sus dos mandatos previos son «no distribuir»: el Fondo Previsional ' +
      'Bastardo choca contra ella y la sección lo tiene que decir con el número puesto',
  },
  // ── Task 6 · SECCIÓN 6 ────────────────────────────────────────────────────
  {
    valor: '2.400 km/año',
    en: [H2_MEDIO],
    porQue:
      'el cupo base del adulto en el Mandato Kilométrico Ciudadano — PLANMOV:469. §6.1 escribe la ' +
      'regla de que el Pasaje no crea kilómetros CONTRA este número: sin él, «se descuenta del cupo» ' +
      'no dice de cuánto',
  },
  {
    valor: '1.200 km/año',
    en: [H2_MEDIO],
    veces: 2,
    porQue:
      'el cupo del MENOR — PLANMOV:469, y las dos ocurrencias hacen falta: la cita del cupo y el ' +
      'argumento de que un solo viaje del Pasaje puede consumirlo entero. Sin la segunda, «cuatro ' +
      'viajes pagos» se sigue leyendo como regalo en un régimen donde es uso obligado del cupo propio',
  },
  {
    valor: 'USD 780M',
    en: [H2_MEDIO],
    porQue:
      'la caja anual de «Cinco Años Dignos» — PLANMOV:1339. Es el precedente estructural del ' +
      'reintegro del Alto y la única política del corpus anclada a una edad de la mediana vida: sin ' +
      'el número, el precedente es una anécdota',
  },
];

/**
 * **EL RECÍPROCO DEL DOMICILIO, y la Task 6 abrió el primer caso.** El campo
 * `en` cierra que una cifra canónica DESAPAREZCA de donde tiene que estar. No
 * cierra lo contrario: que el documento la CONTRADIGA fuera de su domicilio.
 * Hasta acá no importaba porque ninguna sección posterior repetía una cifra de
 * §4; §5.2 es la primera. Reproducido: mutando **solo** la copia de §5.2 a
 * `USD 24.750–46.500M` —un orden de magnitud— la guardia salía **exit 0** y
 * seguía anunciando «14 cifras canónicas» verificadas, con el documento
 * afirmando dos magnitudes distintas para la misma línea del mismo fondo.
 *
 * **Por qué una familia y no un barrido de unidades.** Barrer todos los `USD `
 * del documento y exigir que coincidan con la canónica es absurdo: hay ocho
 * montos legítimos y distintos. Lo que identifica a la MAGNITUD no es la unidad
 * sino el objeto del que se predica, así que la familia se declara con la cosa
 * (`cerca`), la forma del número (`unidad`) y el juego cerrado de valores que
 * esa cosa puede tener. En toda línea que nombre la cosa, cada número con esa
 * forma tiene que ser uno de los declarados.
 *
 * **Falsos positivos: cero**, verificado línea por línea. Las cuatro líneas que
 * nombran el Fondo Intergeneracional son `:465`, `:524`, `:526` y `:532`; las
 * dos que traen monto traen el mismo, y las otras dos no traen ninguno y no
 * disparan.
 */
type FamiliaDeCifra = { cerca: string; unidad: RegExp; valores: string[]; porQue: string };

const FAMILIAS_DE_CIFRA: FamiliaDeCifra[] = [
  {
    cerca: 'Fondo Intergeneracional',
    unidad: /USD\s[\d.]+(?:[–-][\d.]+)?M/gu,
    valores: ['USD 2.475–4.650M'],
    porQue:
      'el flujo anual del Fondo Intergeneracional es uno solo (PLANTER:674) y §4.5 y §5.2 lo escriben ' +
      'los dos. Dos magnitudes para la misma línea del mismo fondo es la contradicción que el ' +
      'domicilio no ve',
  },
  {
    cerca: 'Mandato Kilométrico',
    unidad: /[\d.]+\skm\/año/gu,
    valores: ['2.400 km/año', '1.200 km/año'],
    porQue:
      'los dos cupos del MKC son los de PLANMOV:469 y no otros. El Pasaje se descuenta de ellos: un ' +
      'cupo inflado en la copia vuelve gratis un viaje que consume el año entero de un menor',
  },
  {
    cerca: 'Cinco Años Dignos',
    unidad: /USD\s[\d.]+(?:[–-][\d.]+)?M/gu,
    valores: ['USD 780M'],
    porQue: 'la caja del precedente etario, PLANMOV:1339, no admite segunda versión',
  },
];

/**
 * El chequeo de la familia: en cada línea que nombre la cosa, todo número con
 * la forma declarada tiene que ser uno de los valores canónicos.
 */
function verificarFamiliasDeCifra(lineas: string[]): string[] {
  const errores: string[] = [];
  for (const { cerca, unidad, valores, porQue } of FAMILIAS_DE_CIFRA) {
    lineas.forEach((linea, k) => {
      if (!linea.includes(cerca)) return;
      const re = new RegExp(unidad.source, unidad.flags.includes('g') ? unidad.flags : `${unidad.flags}g`);
      let m: RegExpExecArray | null;
      while ((m = re.exec(linea)) !== null) {
        if (valores.includes(m[0])) continue;
        errores.push(
          `línea ${String(k + 1)}: la línea nombra «${cerca}» y escribe «${m[0]}», que no es ninguno ` +
            `de los valores canónicos de esa familia [${valores.join(' · ')}] — ${porQue}`,
        );
      }
    });
  }
  return errores;
}

/**
 * Afirmaciones sin cifra que el documento está obligado a hacer, con el mismo
 * domicilio que las cifras. Viven aparte porque no son números: mezclarlas
 * con CIFRAS_CANONICAS hacía que la constante mintiera sobre su contenido, y
 * son nueve las tareas que la extienden.
 */
const ASERCIONES_OBLIGATORIAS: ValorConDomicilio[] = [
  {
    valor: 'derogación expresa',
    en: [CABECERA],
    porQue:
      'la autoridad real por la que este PLAN existe: regla 5 y condición temporal de la regla 3, ' +
      'derogadas con nombre y fecha — ACTA:131-137',
  },
  {
    valor: 'sin piso constitucional propio',
    en: [CABECERA, H2_TESIS],
    porQue: 'el arco es eje transversal adentro de los ocho escalones, no un escalón nuevo (C-2)',
  },
  {
    valor: 'la porción de vejez',
    en: [CABECERA, H2_TESIS],
    porQue:
      'el acta retira solo la vejez del hueco «Discapacidad y vejez»; la discapacidad queda en ' +
      'PLANCUIDADO + PLANSAL y PLANARCO tiene que decirlo — ACTA:169-173',
  },
  {
    valor: 'extrapolación aritmética',
    en: [H3_CURVA],
    porQue:
      'la proyección 2040 es una cuenta del propio PLANREP (7,3M × 1,03^14) y no una medición. ' +
      'Escribir el número sin esta declaración es estrenar una cifra demográfica que nadie midió',
  },
  {
    valor: 'organismo, caja y registro',
    en: [H3_FALLA_TRANSMISION],
    porQue:
      'el hallazgo trece del tramo, y el mismo modo de falla que ya costó seis: «esto no existe» dicho ' +
      'sin buscar bajo otro nombre. §0.6 decía que la transmisión no tenía dueño institucional, que ' +
      'nadie la sostenía y que nadie llevaba registro; PLANMEMORIA tiene las tres — ANM autárquica ' +
      '(:484), Síndicos a salario CONICET adjunto (:405) y el Archivo de siete nodos con hash (:283, ' +
      ':297). La afirmación positiva se exige escrita para que la negativa no pueda volver',
  },
  {
    valor: 'aserción propia sin fuente',
    en: [H2_PRECEDENTES],
    porQue:
      'la disciplina que costó el hallazgo Crítico del tramo B: la sección que DEFIENDE al PLAN es la ' +
      'que menos se revisa. Un precedente sin cita en el corpus se declara como tal, no se escribe ' +
      'como si fuera sabido (PLANPACTO:232 usa esta misma fórmula)',
  },
  // ── Task 4 · SECCIÓN 3 ────────────────────────────────────────────────────
  {
    valor: 'Cuando materia y edad entran en conflicto',
    en: [H2_CALENDARIO],
    porQue:
      'el ANTECEDENTE CONDICIONAL de la Regla de Arco (PLANPACTO:428), y va pegado a la cláusula que ' +
      'lo sigue. Sin él, «la materia decide el escalón y el arco decide adentro del escalón» se lee ' +
      'como jerarquía permanente y no como regla de desempate. Es la operación que PLANPACTO:416 ' +
      'condena por escrito sobre sí mismo: «el calificador va escrito porque la cláusula lo tiene y ' +
      'sin él la cita parece más fuerte de lo que es»',
  },
  {
    valor: 'no escribe regla de reparto propia',
    en: [H2_CALENDARIO],
    porQue:
      'la mitad de ARCO del par recíproco. PLANPACTO:430 ya escribió la suya —«PLANARCO remite a esta ' +
      'sección y no escribe su propia regla de reparto»— y esta es la aceptación explícita (C-1)',
  },
  {
    valor: 'Techo A',
    en: [H2_CALENDARIO],
    porQue:
      'la movilidad de la Renta de Arco es Techo A POR MATERIA PREVISIONAL (PLANPACTO:343, que ya ' +
      'ubica lo previsional adentro del Techo A), no una categoría nueva. «Precompromiso» está ' +
      'prohibido justamente porque estrenar categoría es lo que PLANPACTO:381 cierra por anticipado (C-4)',
  },
  {
    valor: 'capa 4',
    en: [H2_CALENDARIO],
    porQue:
      'el blindaje del arco es la capa SOCIAL de BLINDAJE:197, no la legal: «ley» es la capa 1 y ' +
      'BLINDAJE:194 la llama «Protección media». La fórmula de la spec estaba mal y la sección la corrige (arreglo 12)',
  },
  {
    valor: 'el corralito no aplica',
    en: [H2_CALENDARIO],
    porQue:
      'el análogo de BLINDAJE:63 son cinco millones con AHORROS en El Pulso —propiedad—, y el Piso ' +
      'Vital es una transferencia: no se confisca, se licúa o se deja de pagar. Decirlo explícito es ' +
      'lo que impide que la sección se apoye en una analogía que no la sostiene',
  },
  // ── Task 5 · SECCIÓN 4 ────────────────────────────────────────────────────
  {
    valor: 'un solo fondo con dos nombres',
    en: [H2_RENTA],
    porQue:
      'la respuesta a C-7, que el corpus nunca escribió. PLANTER crea el Fondo Soberano Ciudadano ' +
      '(:349) y PLANMON el Fondo Soberano Bastardo (:1561) con los mismos afluentes, y las propias ' +
      'tablas de interconexión de PLANMON le mandan esos afluentes al «Ciudadano» (:2224, :2225, ' +
      ':2235, :2239). Sin este veredicto escrito, financiar el Tramo Común «por el FSC y el Fondo ' +
      'Previsional Bastardo» es contar dos veces la misma regalía',
  },
  {
    valor: 'decisión de diseño de este documento',
    en: [H2_RENTA],
    veces: 2,
    porQue:
      'las dos decisiones que esta sección toma y que el corpus no traía —la reconciliación de los ' +
      'dos fondos y la regla de absorción del Piso Vital— van declaradas con la fórmula del corpus. ' +
      'Una decisión de diseño sin declarar se lee, tres documentos después, como una medición',
  },
  {
    valor: 'ni duplica ni sustituye',
    en: [H2_RENTA],
    porQue:
      'el veredicto sobre el Tramo Ganado, que §3.3 difiere acá por escrito. `PLANCUIDADO:340` ya ' +
      'fijó la moneda de cuidado con fórmula, techo y validación por Mesa Civil: duplicarla sería ' +
      'gastar dos veces el mismo pasivo y sustituirla sería enmendar el PLAN ajeno de prepo',
  },
  {
    valor: 'dos monedas y no tres',
    en: [H2_RENTA],
    porQue:
      'el Servicio Cívico no existe como institución del corpus (C-8) y los tres canales que sí pagan ' +
      'servicio cívico ya pagan: el panelista de PLANJUS:1659, las dietas de PLANMESA:481 y el ' +
      'Referente pago por la AMCC de PLANCUIDADO:94. Una tercera moneda previsional pagaría dos veces',
  },
  {
    valor: 'future_return',
    en: [H2_RENTA],
    porQue:
      'la clase que le cuesta la fuente al Tramo Común, nombrada en la prosa y no solo excluida de la ' +
      'tabla. El libro mayor ya clasifica las rentas extractivas así —F08, especulativa, 2030+— y ' +
      'PLANPACTO lo prohíbe dos veces (:444, :655)',
  },
  {
    valor: 'se absorbe',
    en: [H2_RENTA],
    porQue:
      'el entregable que §3.3 y §3.5 difieren a esta sección: tres pisos universales sobre la misma ' +
      'persona de sesenta y cinco —el DNP de PLANREP §15.3, el DCM de PLANTER:366-367 y el Piso ' +
      'Vital— y el documento tiene que decir cuál se suma, cuál absorbe y cuál es absorbido. El ' +
      'diferimiento estaba declarado desde los dos lados en la prosa y en ninguna parte de la guardia',
  },
  /**
   * **Las dos declaraciones de la SECCIÓN 4 que no protegía nada.** Verificado
   * rompiendo al abrir la Task 6: borrar el párrafo de la fila 1 de la tabla de
   * fuentes salía **exit 0**, y borrar el de confianzas y regla 6 también. Con
   * tres compresiones grandes ya hechas en el tramo y seis secciones por
   * delante, una sección se comprime por donde no hay guardia — que es
   * exactamente donde estaban las dos frases que sostienen la única fila con
   * caja presente y la única regla del libro mayor que la tabla incumple.
   */
  {
    valor: 'regla 6',
    en: [H2_RENTA],
    porQue:
      'la regla del libro mayor que la tabla de fuentes INCUMPLE —disponibilidad mayor a doce meses ' +
      'exige respaldo, y tres de las cuatro filas no lo tienen—. Es la clase de párrafo que la ' +
      'compresión se lleva primero porque no defiende al PLAN, y sin él la tabla se lee cubierta',
  },
  {
    valor: 'Ningún haber en curso se reduce',
    en: [H2_RENTA],
    porQue:
      'la promesa que sostiene la única fila con caja presente: la reasignación de haberes de ANSES ' +
      'cambia el título y no el monto. Sin esa frase escrita, la fila que financia el Piso Vital se ' +
      'lee como un recorte a jubilados, que es lo contrario de lo que la fila hace',
  },
  // ── Task 6 · SECCIONES 5 y 6 ──────────────────────────────────────────────
  {
    valor: 'no reclama el Fondo Intergeneracional',
    en: [H2_COMIENZO],
    porQue:
      'la resolución de C-7 del lado de la Dote. El Fondo Intergeneracional es 15% del FLUJO del FSC ' +
      '(PLANTER:674), sin stock declarado ni regla de retiro, y sus dos mandatos escritos son ambos ' +
      'de no distribuir (PLANTER:163 y :710/:839). Financiar la Dote de ahí sería la misma cadena que ' +
      'a la SECCIÓN 4 le costó el Tramo Común: la renuncia va escrita, no supuesta',
  },
  {
    valor: 'evidencia verificable por sistema',
    /**
     * **R-5, y el domicilio es la mitad del arreglo.** La frase vive en el
     * título del H3 5.4 y en la declaración, y borrar la DECLARACIÓN salía
     * **exit 0** porque el título la cubría. El primer cierre fue `veces: 2`, y
     * `veces: N` cuenta OCURRENCIAS y no LA ocurrencia: con la §5 entera de
     * domicilio, borrar la declaración y repetir la frase cinco palabras más
     * allá —en 5.6, en cualquier lado— volvía a dar dos y salía verde; y al
     * revés, retitular el H3 —operación normal— tiraba el conteo a uno y ponía
     * la guardia roja con la declaración intacta.
     *
     * Las dos se cierran juntas bajando el domicilio al H3 **por prefijo**
     * (`### 5.4 `, la forma que `H3_FALLA_TRANSMISION` estrenó): el título
     * queda afuera del tramo por construcción, el número sobrevive a cualquier
     * retitulación, y una repetición en otro H3 ya no cubre nada. Vuelve a
     * `veces: 1`, que es lo que se quería decir: la prosa de 5.4 declara el
     * criterio, una vez.
     */
    en: [H3_LIBERACION],
    porQue:
      'el arreglo 6: la liberación de la Dote NO se decide en una mesa. Un panel territorial que ' +
      'decide quién cobra un capital de dieciocho años es la mejor máquina de punteros que este ' +
      'corpus podría estrenar, y el criterio se escribe como regla o vuelve solo',
  },
  {
    valor: 'Identidad Digital Soberana',
    en: [H2_COMIENZO],
    porQue:
      'la estación 2 del Calendario ya tiene ocupante: PLANDIG §8.2 emite la IDS al nacer (:677). El ' +
      'Acta de Bienvenida es el dispositivo más nuevo de esta sección y el que más fácil pisa a otro ' +
      'PLAN sin enterarse. La relación va declarada',
  },
  {
    valor: 'Mandato Kilométrico Ciudadano',
    en: [H2_MEDIO],
    porQue:
      'el hallazgo de la Task 6, que ni la spec ni el plan traían: el Pasaje son cuatro viajes PAGOS ' +
      'y el derecho a moverse ya está escrito y es universal — PLANMOV §3.1, 2.400 km/año por adulto, ' +
      'multimodal, activable desde la Cédula Civil. Escribir cuatro viajes pagos sin nombrarlo sería ' +
      'la decimoquinta forma de «esto no existe» dicho sin buscar bajo otro nombre',
  },
  {
    valor: 'Cinco Años Dignos',
    en: [H2_MEDIO],
    porQue:
      'lo más cerca que el corpus está de anclar una política a una edad de la mediana vida: ' +
      'PLANMOV §14.3, mayores de 50 desplazados, con aportes previsionales y cobertura a cargo del ' +
      'FRM. No es la mediana edad como categoría —es un sector y un desplazamiento— pero decir ' +
      '«territorio virgen» sin acotarlo contra esto sería falso',
  },
  /**
   * **Las dos decisiones propias de §6.3, que era lo que el pendiente 3 mandaba
   * proteger y la Task 6 dejó afuera.** Las cinco aserciones de arriba cubren
   * los cinco HALLAZGOS —lo que la sección encontró en otros PLANes— y ninguna
   * cubre lo que la sección DECIDE. Verificado rompiendo, las dos **exit 0**:
   * borrar el párrafo entero de la resolución del acantilado, y bajar el
   * crédito «al 100%» a «al 75%», que es la asimetría con la jornada 6+2 dada
   * vuelta y el modo de falla principal del dispositivo reintroducido.
   */
  {
    valor: 'no escribir el umbral',
    en: [H2_MEDIO],
    porQue:
      'la resolución del acantilado del empleado 50, y la decisión más disputable de la sección: el ' +
      'crédito es igual para todos y proporcional a las horas, así que nadie cruza una frontera al ' +
      'contratar. Un umbral movido a otro número es el mismo acantilado en otro lado, y sobre la ' +
      'misma nómina PLANCUIDADO ya tiene dos cortes propios (:355, :356)',
  },
  {
    valor: 'al 100% y no al 75%',
    en: [H2_MEDIO],
    porQue:
      'la asimetría fundada con la jornada 6+2 de `PLANCUIDADO:347`: las 2 horas de cuidado las ' +
      'recibe la comunidad y en parte la empresa, y el Alto no le devuelve nada a la empresa. Bajar ' +
      'el reintegro al 75% deja la pausa paga parcialmente a cargo de quien emplea a alguien de ' +
      'cuarenta y cinco años, que es el descarte por edad que el dispositivo existe para impedir',
  },
];

/**
 * Anatomía de la cabecera. El brief manda seis elementos y sin esto la guardia
 * verificaba uno y medio: borrar el H1, el H3 de versión y la portada entera
 * salía verde. La portada es el artefacto que nadie vuelve a mirar —en el tramo
 * anterior anunció cuatro dispositivos con cero ocurrencias en el cuerpo—, así
 * que su contenido se declara acá y no se deja a la disciplina.
 */
const H1_ESPERADO = /^# PLANARCO — .+$/m;
/**
 * `\p{L}+` y no `\w+` para el mes: `\w` es `[A-Za-z0-9_]` y no cubre las tildes.
 * Hoy ningún mes castellano lleva tilde, pero es la misma clase de bug latente
 * que hacía que `/\bést[aeo]s?\b/` no marcara nunca nada.
 */
const H3_VERSION_ESPERADO = /^### Versión \d+\.\d+ — \p{L}+ \d{4}$/mu;

/**
 * Los trece dispositivos de la tabla «Los trece dispositivos» del plan del
 * tramo (v2/docs/plans/2026-07-31-tramo-c-planarco.md:171-187). Cada entrada
 * lista los fragmentos literales que tienen que estar en el bloque cercado de
 * la portada. Uno solo tiene dos fragmentos porque el plan lo cuenta como un
 * dispositivo con dos nombres.
 *
 * Esta constante cubre la dirección «¿están los trece?». La contraria —«¿hay un
 * catorceavo?»— la cierra verificarPortadaNoAnunciaDeMas(), abajo, con el mismo
 * léxico: no hace falta el cuerpo porque el conjunto legítimo de nombres de la
 * portada es cerrado y conocido hoy.
 *
 * Lo que sí necesita el cuerpo, y es de la Task 10, es la tercera dirección:
 * «cada dispositivo anunciado en el ASCII tiene ocurrencias en el cuerpo».
 */
const DISPOSITIVOS_EN_PORTADA: { nombre: string; enPortada: string[] }[] = [
  { nombre: 'Calendario de Umbrales', enPortada: ['Calendario de Umbrales'] },
  { nombre: 'Renta de Arco (tres tramos)', enPortada: ['Renta de Arco'] },
  { nombre: 'Dote de Origen', enPortada: ['Dote de Origen'] },
  { nombre: 'Umbral de la Llegada', enPortada: ['Umbral de la Llegada'] },
  { nombre: 'Acta de Bienvenida', enPortada: ['Acta de Bienvenida'] },
  { nombre: 'El Pasaje (cuatro viajes)', enPortada: ['El Pasaje'] },
  { nombre: 'El Alto de los Cuarenta y Cinco', enPortada: ['El Alto de los Cuarenta y Cinco'] },
  { nombre: 'La Rampa de Salida 60–72', enPortada: ['Rampa de Salida 60–72'] },
  { nombre: 'Casa de Dos Edades', enPortada: ['Casa de Dos Edades'] },
  { nombre: 'Casa de Arco', enPortada: ['Casa de Arco'] },
  { nombre: 'La Última Palabra', enPortada: ['La Última Palabra'] },
  {
    nombre: 'El Año del Duelo + Acompañante de Umbral',
    enPortada: ['El Año del Duelo', 'Acompañante de Umbral'],
  },
  { nombre: 'El Umbral del Legado', enPortada: ['Umbral del Legado'] },
];

/** La ANAV no es dispositivo —es la institución de la Sección 8— pero la portada la anuncia. */
const INSTITUCION_EN_PORTADA = 'Agencia Nacional del Arco de la Vida (ANAV)';

/**
 * Calificadores que la portada tiene derecho a llevar además de los nombres de
 * los trece dispositivos: los tres tramos de la Renta de Arco y las edades del
 * Pasaje. Con esto el conjunto de lo que la portada puede nombrar queda CERRADO
 * y conocido hoy, sin una palabra del cuerpo.
 */
const CALIFICADORES_EN_PORTADA: string[] = [
  ': Piso Vital Universal',
  'Tramo Ganado',
  'Tramo Común',
  ': cuatro viajes a los 12, 18, 45 y 60',
];

/**
 * La región de conjunto exacto de la portada es el BLOQUE CERCADO ENTERO. Todo
 * lo que aparezca ahí y no esté en el léxico permitido es un nombre anunciado de
 * más — el modo de falla exacto del tramo B, donde la portada anunció cuatro
 * nombres que no estaban en ninguna sección del plan.
 *
 * La región tuvo dos mojones y los dos fallaron abierto. El de inicio
 * (`PLANARCO`) dejaba el eslogan y el subtítulo afuera: un `Servicio Cívico`
 * plantado en el subtítulo salía verde. El de cierre (`Preparado para`) dejaba
 * afuera el pie —un `Servicio Cívico` pegado a `Registros Civiles` salía
 * verde— y, peor, no estaba anclado: una línea `Preparado para nada` plantada
 * ARRIBA ponía el fin en el índice 0, el bucle no iteraba ninguna línea y la
 * guardia informaba «conjunto exacto: ni falta ni sobra» sin haber mirado nada.
 * Un chequeo truncable que reporta éxito es peor que no tenerlo.
 *
 * El arreglo no es un mojón mejor sino NINGUNO: la región es el bloque entero, y
 * el encabezado y el pie legítimos pasan a ser léxico permitido como cualquier
 * otro nombre. Sin mojones no hay región que colapsar.
 */

/** El encabezado legítimo de la portada: los dos renglones del eslogan, el subtítulo y la sigla. */
const PORTADA_ENCABEZADO: string[] = [
  'NACER NO ES UNA LOTERÍA',
  'MORIR NO ES UN TRÁMITE',
  'Plan Nacional del Arco de la Vida, Calendario de Umbrales y Renta de Arco',
  'PLANARCO',
];

/**
 * El pie legítimo de la portada: destinatarios, organismos, fecha y leyenda de
 * circulación. Antes quedaba afuera del conjunto exacto porque `Preparado para`
 * era el mojón de cierre; ahora entra al léxico y el tramo posterior se verifica
 * como el resto.
 */
const PORTADA_PIE: string[] = [
  'Preparado para la República Argentina',
  'Congreso de la Nación · Ministerio de Capital Humano · ANSES · PAMI',
  'Provincias · Municipios · Registros Civiles',
  'Julio 2026 | Versión 1.0',
  'DOCUMENTO ESTRATÉGICO — PARA REVISIÓN AUTORIZADA',
];

/**
 * Strings que no pueden aparecer, con el motivo de cada uno.
 * Case-insensitive salvo donde el corpus distingue mayúsculas: las siglas
 * (PUAM, PNC) y los marcadores de pendiente.
 * `salvoSi` exime la ocurrencia cuando la línea que la contiene la atribuye.
 *
 * OJO — estos patrones se corren sobre el texto SIN negritas (ver `rawPlano` en
 * main()). El corpus escribe en negrita permanentemente, y un `**` en el medio
 * de la frase hacía fallar abierto al prohibido más importante de todos.
 */
const PROHIBIDOS: { patron: RegExp; porQue: string; salvoSi?: RegExp }[] = [
  {
    patron: /\b(PUAM|PNC)\b/,
    porQue: 'cero ocurrencias en el corpus: no se estrenan siglas de partidas cuyo monto nadie tiene (C-6)',
  },
  {
    // El lookbehind es de ancho variable (V8 lo soporta) porque la negación
    // castellana no siempre está pegada al verbo: «no lo supera el umbral»,
    // «Ninguno de los cuatro superó el gate» —paráfrasis del ACTA:115, :36— son
    // las dos frases verdaderas que un lookbehind de ancho fijo marcaba en rojo.
    // Una guardia que se pone roja sobre una frase honesta empuja a reescribir
    // la frase, no la regex, y eso degrada el documento que la guardia protege.
    //
    // ALCANCE REAL, y no es el que este comentario prometía hasta el 2026-07-31:
    // el hueco entre la negación y el verbo corta SOLO contra un límite de
    // cláusula (`.`, `;`, `:`, salto de línea) y contra cinco nexos literales
    // —`y`, `pero`, `aunque`, `sino`, `mas`—. Cualquier otro nexo devuelve la
    // afirmación al alcance de una negación lejana y la deja pasar. Verificado,
    // las cuatro salen VERDES: «no cierra, ya que supera el gate» (la coma sola
    // no corta), «no cierra porque supera el gate», «no cierra mientras supera
    // el gate», «no cierra cuando supera el gate», «no cierra si supera el
    // umbral». Lo que sí atrapa: «PLANARCO supera el gate» y «PLANARCO no es el
    // primero y supera el gate».
    //
    // SEGUNDO EJE, del mismo tamaño y más fácil de olvidar porque este comentario
    // no lo nombraba: el patrón conoce SOLO seis flexiones (`pasó`, `paso`,
    // `superó`, `supero`, `supera`, `pasa`) y exige el artículo PEGADO al verbo.
    // Verificado, salen VERDES «PLANARCO logró superar el gate», «PLANARCO habría
    // superado el gate», «los cocientes superan el umbral de 1,5», «PLANARCO
    // supera holgadamente el gate» —un solo adverbio entre el verbo y el artículo
    // alcanza— y «PLANARCO supera un gate exigente». Las dos últimas son
    // formulación DIRECTA, así que ni siquiera la promesa acotada del párrafo de
    // abajo se cumple entera: la red tiene el agujero de este lado también.
    //
    // No se cierran esos casos ampliando la lista de nexos, porque la lista de
    // nexos del castellano no tiene fondo y cada agregado vuelve a poner en rojo
    // frases honestas. **Este prohibido es una red, no una prueba**: atrapa la
    // formulación directa —la que un documento apurado escribe— y no demuestra
    // que el documento no afirme lo contrario por un camino oblicuo. Eso lo
    // tiene que mirar la revisión, y las Tasks 8 y 9 —que son las que escriben
    // sobre el gate— no pueden delegar en esta regex la verdad de lo que digan.
    patron:
      /(?<!\b(?:no|nunca|jamás|tampoco|ninguno|ninguna|ni)\b(?:(?!\b(?:y|pero|aunque|sino|mas)\b)[^.;:\n]){0,30})(pas[óo]|super[óo]|supera|pasa)\s+(el|ese|este|dicho)\s+(gate|umbral)/iu,
    porQue:
      'falso: PLANARCO falla contra la suma de sus dos huéspedes por tres centésimas. ' +
      'Se habilita por derogación expresa, no por el gate (ACTA:41-47, :131-137)',
  },
  {
    patron: /precompromiso/i,
    porQue:
      'categoría inexistente en PLANPACTO (cero ocurrencias, igual que «indexado»); su uso choca con ' +
      'PLANPACTO:381. La movilidad es Techo A por materia (C-4)',
  },
  {
    patron: /escal[óo]n de PLANARCO|nuestro escal[óo]n|noveno escal[óo]n/i,
    porQue: 'la Escalera de PLANPACTO cierra en ocho escalones y en 2,40 exacto (C-2)',
  },
  {
    patron: /piso constitucional de PLANARCO|nuestro piso constitucional/i,
    porQue: 'PLANARCO no reclama piso: financia su régimen sin escalón propio (C-2)',
  },
  {
    patron: /PLANJUB\s+(es|son|tiene|tienen|establece|crea|garantiza|paga|administra|financia|dispone|declara|rige|sigue|vige)\b|\b(el|del)\s+PLANJUB\s+vigente/i,
    // La frase que el plan MANDA escribir —«el PLAN que nunca existió y del que
    // PLANARCO es sucesor»— es literalmente «PLANJUB es …», y con la
    // normalización sin negritas «**PLANJUB** es» también cae. La exención mira
    // la línea: si nombra la inexistencia o la sucesión, la cópula es honesta.
    salvoSi: /nunca existió|no existe|nunca lleg[óo]|inexistente|fantasma|sucesor|sucede/i,
    porQue:
      'PLANJUB es el fantasma que este PLAN sucede: puede nombrarse como inexistente, nunca afirmarse ' +
      'en presente como PLAN vigente',
  },
  {
    patron: /7[.,]3\s*millones/,
    salvoSi: /PLANREP/,
    porQue:
      'los 7,3 millones de 60+ son el blindaje de la Rama 2 de PLANREP (PLANREP:335, :367). ' +
      'PLANARCO puede citarlos atribuidos, nunca usarlos como su propio universo (C-9)',
  },
  {
    patron: /contrato de continuidad de 36 meses/i,
    porQue: 'no existe en el corpus: se inventaría entero y la spec lo daba por escrito (C-8)',
  },
  {
    patron: /50\.000\s*[-–—]\s*60\.000/,
    porQue:
      'el monto bajo administración de la ANAV no sale por ningún camino del corpus en esa banda: ' +
      '45% × 150.000M da ~65.000–72.000M. O se escribe la derivación o se declara hueco',
  },
  {
    patron: /\bTODO:|\[TODO\]|<!--\s*TODO|\bTKTK\b|\bXXX\b/,
    porQue: 'marcador de borrador: el documento se commitea sin secciones a medio escribir',
  },
  {
    // Aparte de los de arriba porque va case-insensitive: el juego anterior
    // (`\[pendiente\]|«PENDIENTE»|\{PENDIENTE\}`) era asimétrico y dejaba pasar
    // `[PENDIENTE]`, `«pendiente»` y `{pendiente}`. Los delimitadores se cruzan a
    // propósito: `[pendiente»` también es un marcador.
    patron: /[[«{]pendiente[\]»}]/i,
    porQue: 'marcador de borrador entre delimitadores: el documento se commitea sin huecos anotados',
  },
  {
    patron: /(?<!\p{L})(sólo|ést[aeo]s?|és[aeo]s?|aquél(?:la|los|las)?)(?!\p{L})/iu,
    porQue:
      'Global Constraint del corpus: «solo» y los demostrativos van sin tilde. ' +
      'PLANPACTO, el modelo declarado, tiene 0 ocurrencias de «sólo» y 32 de «solo»',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Tablas: se parsean y se suman. Buscar los totales como string no sirve —
// siguen apareciendo en la prosa aunque la tabla que los produce esté rota.
//
// Hoy la única tabla que se cruza es la de pisos (que PLANARCO no debería
// tener). La Task 4 agrega el Calendario de Umbrales y la Task 5 la tabla de
// fuentes de la Renta de Arco: las dos entran acá abajo, no en CIFRAS_CANONICAS.
// ─────────────────────────────────────────────────────────────────────────────

/** Centésimas enteras: la aritmética en punto flotante sobre 0,07 no cierra. */
const c = (n: number): number => Math.round(n * 100);
const fmt = (cent: number): string => (cent / 100).toFixed(2).replace('.', ',');

/** Celdas de una fila markdown, sin negritas ni bordes. */
function celdas(linea: string): string[] {
  return linea
    .replace(/\*\*/g, '')
    .split('|')
    .slice(1, -1)
    .map((s) => s.trim());
}

/** «0,25 – 0,30» → [25, 30]; «0,10» → [10, 10]; «0.25-0.30% PBI» → [25, 30]. */
function rango(celda: string): [number, number] | null {
  const nums = celda.replace(',', '.').replace(/(\d)\s*[–—-]\s*(\d)/g, '$1|$2').split('|');
  const vals = nums.map((s) => {
    const m = /-?\d+(?:[.,]\d+)?/.exec(s.replace(',', '.'));
    return m ? Number(m[0]) : NaN;
  });
  if (vals.length === 0 || vals.some(Number.isNaN)) return null;
  const bajo = c(vals[0]);
  const alto = c(vals.length > 1 ? vals[vals.length - 1] : vals[0]);
  return [bajo, alto];
}

const esFilaDeTabla = (l: string): boolean => l.trim().startsWith('|');
const esSeparadorDeTabla = (l: string): boolean => /^\|[\s:|-]+\|$/.test(l.trim());
const esEncabezado = (l: string): boolean => /^#{1,6}\s/.test(l.trim());

/**
 * Las filas de LA tabla cuya cabecera contiene todas las columnas pedidas.
 *
 * Antes de la Task 4 esta función tenía los dos modos de falla del arquetipo de
 * esta guardia, y el segundo fallaba ABIERTO:
 *
 * 1. `findIndex` devolvía la PRIMERA tabla que coincidiera y no verificaba que
 *    hubiera una sola. Con dos tablas de columnas compartidas, una ensombrece a
 *    la otra: se verifica la de arriba y la de abajo no la mira nadie. Es
 *    exactamente el modo de falla de la portada (`iAbre` tomando UNA portada) y
 *    el de `tramoDeSeccion` (un H2 señuelo). La doctrina ya está fijada: **si el
 *    ancla no es única, el chequeo no corre y lo dice.**
 * 2. El bucle cortaba en la primera línea que no empezara con `|`. Este corpus
 *    parte tablas con párrafos intercalados —lo hace PLANPACTO—, así que la
 *    mitad de abajo quedaba sin parsear y un chequeo del tipo «cada fila tiene
 *    columna X» pasaba en verde sobre las filas que nunca vio. Ahora el párrafo
 *    intercalado NO corta: cortan los encabezados y la cabecera de otra tabla,
 *    que se reconoce por el separador `|---|` que la sigue.
 */
/**
 * `exigirContigua` es de la Task 5 y cierra la mitad que faltaba del punto 2.
 * Que el párrafo intercalado no CORTE el parseo es lo correcto para la tabla del
 * Calendario —el corpus parte tablas y las filas de abajo se tienen que
 * verificar igual—, pero deja de serlo cuando la tabla es un registro contable:
 * una tabla de fuentes con un párrafo en el medio ya no se lee como una tabla, y
 * el renglón que quede del otro lado del corte es exactamente donde se esconde
 * la fuente incómoda. Con la bandera puesta, el corte se parsea Y se reporta.
 */
/**
 * UNDÉCIMA FORMA DEL ARQUETIPO (encontrada rompiendo, arreglada acá). La cabecera
 * se reconocía con `columnas.every((col) => l.includes(col))`: un test de
 * CONJUNTO, no de ORDEN. `| Dueño | Fuente | Disponibilidad | Confianza | Clase |`
 * matcheaba igual y salía **exit 0**, mientras todo lo que se lee por índice
 * —`fila[1]` como dueño, que es el que entra al `Set`, y `fila[0]` como fuente,
 * que es el que se cita en todos los mensajes de error— quedaba corrido una
 * columna. Una tabla contable con las columnas permutadas se verifica entera
 * contra la columna equivocada y no se entera nadie.
 *
 * Ahora la comparación es POSICIONAL: la celda k de la cabecera tiene que
 * contener la columna k. Se compara por `includes` y no por igualdad a propósito,
 * porque el Calendario declara `Dispositivo del arco` donde la constante dice
 * `Dispositivo`; exigir igualdad exacta pondría roja una cabecera honesta, que es
 * la falla que este tramo ya cometió dos veces. Permutar sigue saliendo rojo: la
 * cabecera deja de reconocerse y el chequeo reporta que falta la tabla, que es la
 * respuesta correcta —«si el ancla no es única, el chequeo no corre y lo dice»
 * aplicado al orden de las columnas.
 */
function filasDeTabla(
  lineas: string[],
  columnas: string[],
  exigirContigua = false,
): { filas: string[][] | null; errores: string[] } {
  const errores: string[] = [];
  const cabeceras: number[] = [];
  lineas.forEach((l, k) => {
    if (!esFilaDeTabla(l)) return;
    const cel = celdas(l);
    if (cel.length < columnas.length) return;
    if (columnas.every((col, i) => (cel[i] ?? '').includes(col))) cabeceras.push(k);
  });

  if (cabeceras.length === 0) return { filas: null, errores };
  if (cabeceras.length > 1) {
    errores.push(
      `hay ${String(cabeceras.length)} tablas con las columnas [${columnas.join(' · ')}] ` +
        `(líneas ${cabeceras.map((k) => String(k + 1)).join(', ')}) y tiene que haber UNA: ` +
        'con dos, se verifica la primera y la segunda no la mira nadie',
    );
    return { filas: null, errores };
  }

  const i = cabeceras[0];
  const filas: string[][] = [];
  /** Líneas que no son fila y quedaron ENTRE dos filas: el corte de la tabla. */
  const cortes: number[] = [];
  let candidatas: number[] = [];
  for (let j = i + 1; j < lineas.length; j++) {
    const l = lineas[j];
    if (esEncabezado(l)) break; // la tabla no cruza un título
    if (!esFilaDeTabla(l)) {
      // Párrafo intercalado: NO corta el parseo. Queda anotado y solo cuenta
      // como corte si después vuelve a haber filas — lo de abajo del último
      // renglón es prosa que sigue, no una tabla partida.
      if (filas.length > 0) candidatas.push(j);
      continue;
    }
    if (esSeparadorDeTabla(l)) continue;
    // La cabecera de OTRA tabla se reconoce por el separador que la sigue.
    if (filas.length > 0 && esSeparadorDeTabla(lineas[j + 1] ?? '')) break;
    if (candidatas.length > 0) {
      cortes.push(...candidatas);
      candidatas = [];
    }
    filas.push(celdas(l));
  }

  if (exigirContigua && cortes.length > 0) {
    errores.push(
      `la tabla con las columnas [${columnas.join(' · ')}] está partida: entre sus filas hay ` +
        `${String(cortes.length)} línea(s) que no son fila (línea ${cortes.map((k) => String(k + 1)).join(', ')}). ` +
        'Una tabla contable no se parte: el renglón que queda del otro lado del corte es donde se ' +
        'esconde la fuente que nadie quiere sumar',
    );
  }

  return { filas, errores };
}

/** `PISOS_SEGUN_EL_TALLER` del test canónico: PLAN → [bajo, alto] en centésimas. */
function pisosDelCanon(): Map<string, [number, number]> {
  const src = readFileSync(CANON_PISOS, 'utf8');
  const bloque = /const PISOS_SEGUN_EL_TALLER[^{]*\{([\s\S]*?)\n\};/.exec(src);
  const out = new Map<string, [number, number]>();
  if (!bloque) return out;
  const re = /(PLAN[A-Z0-9]+):\s*\{\s*floor:\s*'([^']+)'/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(bloque[1])) !== null) {
    const r = rango(m[2]);
    if (r) out.set(m[1], r);
  }
  return out;
}

/**
 * El cruce que este PLAN existe para no romper: PLANARCO no agrega piso.
 * Falla si aparece en el canon del taller, o si el documento se declara uno
 * propio en una tabla de pisos.
 */
function verificarTablas(lineas: string[]): string[] {
  const errores: string[] = [];

  // (a) El canon del taller no puede tener fila de PLANARCO.
  const canon = pisosDelCanon();
  if (canon.size === 0) {
    errores.push(`no se pudo leer PISOS_SEGUN_EL_TALLER de ${CANON_PISOS}`);
  } else {
    const propio = canon.get('PLANARCO');
    if (propio) {
      errores.push(
        `PISOS_SEGUN_EL_TALLER declara un piso de PLANARCO (${fmt(propio[0])}–${fmt(propio[1])}). ` +
          'El arco es eje transversal adentro de los ocho escalones y no agrega escalón: ' +
          'si el canon cambió, se revisa la Escalera de PLANPACTO antes de tocar este documento',
      );
    }
  }

  // (b) Si el documento trae una tabla de pisos, PLANARCO no puede tener fila.
  const pisos = filasDeTabla(lineas, ['PLAN', 'Piso declarado']);
  errores.push(...pisos.errores);
  if (pisos.filas) {
    for (const fila of pisos.filas) {
      if (/PLANARCO/.test(fila[0] ?? '')) {
        errores.push(`el documento se declara un piso constitucional propio: «${fila.join(' | ')}»`);
      }
    }
  }

  // (c) Task 4: el Calendario de Umbrales. Task 5: fuentes de la Renta de Arco.
  errores.push(...verificarCalendarioDeUmbrales(lineas));
  errores.push(...verificarTablaDeFuentes(lineas));

  return errores;
}

// ─────────────────────────────────────────────────────────────────────────────
// La tabla de fuentes de la Renta de Arco: la SECCIÓN 4.
// ─────────────────────────────────────────────────────────────────────────────

const COLUMNAS_FUENTES = ['Fuente', 'Dueño', 'Disponibilidad', 'Confianza', 'Clase'];

/** Las cuatro calificaciones de `PLANPACTO §5.1` y de la regla 3 del libro mayor. */
const CONFIANZAS = ['alta', 'media', 'baja', 'especulativa'];

/**
 * La clase que ninguna fila puede llevar. `PLANPACTO:444` la prohíbe —«ningún
 * retorno futuro puede computarse como fuente disponible para gasto presente»—
 * y `PLANPACTO:655` la vuelve a prohibir sobre su propio presupuesto. Es la
 * prohibición que le cuesta al Tramo Común su fuente, y por eso se verifica acá
 * y no se deja a la disciplina de quien escriba la próxima fila.
 */
const CLASE_PROHIBIDA = 'future_return';

/** Sin backticks ni negritas: las celdas escriben los identificadores en `código`. */
const pelada = (celda: string): string => celda.replace(/[`*]/g, '').trim();

/**
 * DÉCIMA FORMA DEL ARQUETIPO (encontrada rompiendo, arreglada acá). El chequeo de
 * celda llena era `pelada(c) === ''`, y eso solo atrapa la cadena vacía: poner
 * `—` en la fecha de disponibilidad, o `—` en el dueño, salía **exit 0** en los
 * dos casos. El comentario de esta misma guardia dice que la celda del dueño «es
 * la que hace verificable la fila», y una fuente sin dueño y sin fecha pasaba en
 * verde con un guion puesto.
 *
 * Una celda es hueca si no queda nada, si es solo puntuación de relleno
 * (`-`, `–`, `—`, `·`, `.`) o si es uno de los placeholders que el corpus usa
 * para decir «esto no lo sé todavía». **El alcance es la tabla de fuentes y
 * ninguna otra**: el Calendario declara `—` como valor legítimo —`SIN_OCUPANTE`,
 * la estación que no tiene ocupante previo—, y aplicar esta regla allá pondría
 * roja una celda honesta. En un registro contable no hay estación vacía: hay
 * fuente sin dueño, que es otra cosa.
 */
const HUECOS_DE_CELDA = /^(?:[-–—·.]+|n\/?d|s\/?d|tbd|tba|pendiente|por definir|\?+)$/i;
const celdaHueca = (celda: string): boolean => {
  const p = pelada(celda);
  return p === '' || HUECOS_DE_CELDA.test(p);
};

/**
 * Las seis clases, **leídas del propio libro mayor** y no copiadas acá. Copiarlas
 * sería estrenar una taxonomía paralela, que es exactamente lo que `PLANPACTO:655`
 * declina hacer: «las clases son las de `SOURCE_OF_FUNDS_LEDGER.md` y no una
 * taxonomía propia». Si el libro mayor agrega una clase, esta guardia la acepta
 * sola; si le cambian el formato a la regla 2, el chequeo **no corre y lo dice**.
 */
function clasesDelLibroMayor(): string[] {
  const rel = DOCUMENTOS_CITABLES['SOURCE_OF_FUNDS_LEDGER.md'];
  if (rel === undefined) return [];
  const f = resolve(REPO_ROOT, rel);
  if (!existsSync(f)) return [];
  const m = /Cada fuente tiene clasificaci[óo]n:\s*`([^`]+)`/.exec(readFileSync(f, 'utf8'));
  if (!m) return [];
  return m[1]
    .split('|')
    .map((s) => s.trim())
    .filter((s) => s !== '');
}

/**
 * **DUODÉCIMA FORMA DEL ARQUETIPO: la columna del dueño no tenía autoridad
 * detrás.** Encontrada rompiendo, en dos mitades y las dos verdes:
 *
 * | Mutación | Antes |
 * |---|---|
 * | `Ministerio de Economía` → `ANSES (Ministerio de Economía)` | **exit 0** — dos filas comparten organismo, `duenos.size` sigue en 4, y «cuatro dueños» sigue siendo cierto para la guardia y falso para el lector |
 * | `ANCV` → `Agencia Inventada del Arco` | **exit 0** — el dueño podía ser cualquier cadena |
 *
 * Lo filoso es la asimetría: la **clase** se cruza contra
 * `SOURCE_OF_FUNDS_LEDGER.md`, la **confianza** contra las cuatro de
 * `PLANPACTO §5.1`, y el **dueño** —que es lo primero que nombra la regla de
 * `PLANPACTO:442` y lo único que contesta quién responde el día que haya que
 * pagar— contra nada. `new Set()` sobre una columna libre es un chequeo de
 * ortografía con nombre de chequeo de propiedad.
 *
 * **La autoridad existe y son tres registros, en orden de vigencia:**
 *
 * 1. La columna «Dueño» del propio `SOURCE_OF_FUNDS_LEDGER.md`, que está
 *    `current` y es la autoridad primaria: ahí viven `Ministerio de Economía`
 *    y `PEO`, que no son agencias del ecosistema.
 * 2. La columna «Sigla» de `TABLA_AGENCIAS_BASTA.md`, **con su `superseded`
 *    declarado**, exactamente como §0.3 y §4.5 ya lo declaran en la prosa: el
 *    papel dejó de ser vinculante para la arquitectura de agencias y sigue
 *    siendo el único censo de siglas que el corpus escribió.
 * 3. Los dos que ninguno de los dos provee, listados acá con su razón.
 *
 * Y el conteo de dueños distintos se hace sobre el **identificador resuelto**,
 * no sobre la celda: es lo que cierra la primera mutación.
 */
const DUENOS_EXPLICITOS: { id: string; porQue: string }[] = [
  {
    id: 'ANSES',
    porQue:
      'organismo existente de la República, no una agencia del ecosistema: no está en la tabla de ' +
      'agencias porque ninguna la crea, y es el dueño de la única fila con caja presente',
  },
  {
    id: 'ANAV',
    porQue: 'la agencia que este PLAN crea en la SECCIÓN 8, con el patrón AN+sufijo del corpus',
  },
];

/** Una celda de registro que no nombra a nadie: no se registra como dueño. */
const DUENO_NO_ES_DUENO = /^(?:—|-|n\/?a|reflujo\b)/i;

function duenosDelLibroMayor(): string[] {
  const rel = DOCUMENTOS_CITABLES['SOURCE_OF_FUNDS_LEDGER.md'];
  if (rel === undefined) return [];
  const f = resolve(REPO_ROOT, rel);
  if (!existsSync(f)) return [];
  const lineas = readFileSync(f, 'utf8').split('\n');
  const out: string[] = [];
  let col = -1;
  for (const l of lineas) {
    if (!esFilaDeTabla(l)) {
      col = -1;
      continue;
    }
    const cs = celdas(l);
    if (col === -1) {
      col = cs.findIndex((c) => pelada(c) === 'Dueño');
      continue;
    }
    if (esSeparadorDeTabla(l)) continue;
    const celda = pelada(cs[col] ?? '');
    if (celda === '' || DUENO_NO_ES_DUENO.test(celda)) continue;
    // «Hacienda + BID» son dos dueños de la misma fuente: valen los dos y el entero.
    out.push(celda, ...celda.split('+').map((s) => s.trim()));
  }
  return out.filter((s) => s !== '');
}

/** Las siglas del censo de agencias. `superseded`, y por eso se declara en la prosa. */
function siglasDeAgencias(): string[] {
  const rel = DOCUMENTOS_CITABLES['TABLA_AGENCIAS_BASTA.md'];
  if (rel === undefined) return [];
  const f = resolve(REPO_ROOT, rel);
  if (!existsSync(f)) return [];
  const lineas = readFileSync(f, 'utf8').split('\n');
  const out: string[] = [];
  let col = -1;
  for (const l of lineas) {
    if (!esFilaDeTabla(l)) {
      col = -1;
      continue;
    }
    const cs = celdas(l);
    if (col === -1) {
      col = cs.findIndex((c) => pelada(c) === 'Sigla');
      continue;
    }
    if (esSeparadorDeTabla(l)) continue;
    const celda = pelada(cs[col] ?? '');
    if (celda === '' || DUENO_NO_ES_DUENO.test(celda)) continue;
    // «AMCO, AMRO, … (placeholders)» — se descartan: no son dueños de nada todavía.
    if (celda.includes('placeholder')) continue;
    out.push(celda);
  }
  return out;
}

/**
 * **M-4.** El barrido de dueños contra la prosa se acota a las SIGLAS —el censo
 * de agencias más los dos explícitos— y deja afuera la columna «Dueño» del libro
 * mayor, que trae nombres corrientes: `Hacienda`, `MinSalud`, `MinHabitat`,
 * `PLANTER L2`. Barridos contra la prosa de §4.6, cualquiera de esos mencionado
 * al pasar por una sección futura pone la guardia roja sin motivo — un falso
 * positivo latente, y esta guardia ya documentó que un chequeo que se pone rojo
 * sobre prosa honesta se termina borrando entero.
 *
 * Acotar no pierde el chequeo: la mutación que lo estrenó —`ANSES` → `ANTSPO`
 * en la fila 1— sigue roja, porque `ANSES` es uno de los dos explícitos y
 * `ANTSPO` es sigla del censo.
 */
function registroAcotadoALasSiglas(): string[] {
  const todos = [...siglasDeAgencias(), ...DUENOS_EXPLICITOS.map((d) => d.id)];
  return [...new Set(todos)].sort((a, b) => b.length - a.length);
}

function registroDeDuenos(): string[] {
  const todos = [
    ...duenosDelLibroMayor(),
    ...siglasDeAgencias(),
    ...DUENOS_EXPLICITOS.map((d) => d.id),
  ];
  // Del más largo al más corto: una celda que nombre «ANEB execution cell» tiene
  // que resolver por el identificador largo y no quedar partida en dos.
  return [...new Set(todos)].sort((a, b) => b.length - a.length);
}

/**
 * Resuelve la celda del dueño contra el registro. Devuelve el identificador
 * canónico, o el error de por qué la celda no nombra exactamente a uno.
 *
 * Los bordes son de LETRA y no `\b`, por la misma razón que en `dice()`: `\b`
 * no entiende la `ñ` ni la `í`. Y una coincidencia contenida dentro de otra más
 * larga no cuenta como segundo dueño — `ANEB` adentro de `ANEB execution cell`
 * es el mismo organismo nombrado con más o menos precisión, no dos.
 */
function resolverDueno(celda: string, registro: string[]): { id: string } | { error: string } {
  const p = pelada(celda);
  const hallados: string[] = [];
  for (const id of registro) {
    const re = new RegExp(`(?<!\\p{L})${id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?!\\p{L})`, 'u');
    if (!re.test(p)) continue;
    if (hallados.some((y) => y.includes(id))) continue;
    hallados.push(id);
  }
  if (hallados.length === 0) {
    return {
      error:
        `nombra como dueño a «${p}», que no resuelve contra ningún registro: ni la columna «Dueño» ` +
        'de `SOURCE_OF_FUNDS_LEDGER.md`, ni las siglas de `TABLA_AGENCIAS_BASTA.md`, ni la lista ' +
        'explícita de la guardia. Un dueño que no existe es una fuente por la que no responde nadie',
    };
  }
  if (hallados.length > 1) {
    return {
      error:
        `nombra a más de un dueño en la misma celda («${hallados.join('», «')}»), y la primera regla ` +
        'de `PLANPACTO §5.1` es «una fuente, un dueño». Dos organismos en una celda hacen que el ' +
        'conteo de dueños distintos siga cerrando mientras nadie sabe a cuál de los dos llamar',
    };
  }
  return { id: hallados[0] };
}

/**
 * **DECIMOQUINTA FORMA DEL ARQUETIPO, del lado de la tabla: la columna del
 * dueño resolvía contra el REGISTRO GLOBAL y no contra la autoridad que la
 * propia fila cita.**
 *
 * (M-5: este bloque venía rotulado `DECIMOCUARTA` igual que el de las anclas,
 * tres pantallas más abajo. En un archivo cuyo valor documental es llevar la
 * cuenta de las formas del arquetipo, dos bloques con el mismo número son una
 * forma que nadie puede citar. La serie va: 14 = el ancla completa que secuestra
 * al antecedente, 15 = esta, 16 = el cruce condicionado a su propio ancla.)
 *
 * El arreglo anterior le puso autoridad a la columna: hoy una celda tiene que
 * nombrar exactamente un dueño del registro. Lo que no cerró es que el registro
 * es un CONJUNTO —todas las siglas del corpus— y la fila 4 no cita el conjunto:
 * cita `SOURCE_OF_FUNDS_LEDGER.md:37`, que es F10, y esa línea trae dueño,
 * clase, confianza y disponibilidad. Reproducido, las dos **exit 0**:
 * `PEO` → `ANMov` (sigla real, dueño de otra fuente) y `baja` → `media`
 * (mientras `:488` sigue diciendo «la lleva F10 con esa confianza»).
 *
 * **La autoridad está en la celda de al lado.** Cuando la celda «Fuente» ancla
 * una línea del libro mayor, las cuatro columnas se cruzan contra ESA línea.
 *
 * La disponibilidad se cruza por equivalencia declarada y no por igualdad: el
 * libro mayor escribe `rolling` y la tabla de este PLAN escribe la condición en
 * castellano —«continua, adhesión por adhesión»—, que es lo que §4.6 declara
 * cuando dice que tres de las cuatro dan condición y no fecha. Una igualdad
 * literal ahí pondría en rojo prosa honesta; la equivalencia va escrita para que
 * agregar una no sea gratis.
 */
const ANCLA_LIBRO_MAYOR = /SOURCE_OF_FUNDS_LEDGER\.md:(\d+)/;

/** `rolling` del libro mayor ↔ la condición en castellano de la tabla. */
const EQUIVALENCIAS_DE_DISPONIBILIDAD: Record<string, RegExp> = {
  rolling: /continua|rolling/i,
};

/** Las celdas de una línea del libro mayor, por nombre de columna. */
function filaDelLibroMayor(n: number): Record<string, string> | null {
  const ls = lineasDelPlan('SOURCE_OF_FUNDS_LEDGER.md');
  if (ls === null) return null;
  const linea = ls[n - 1];
  if (linea === undefined || !esFilaDeTabla(linea) || esSeparadorDeTabla(linea)) return null;
  // La cabecera de esa tabla es la última fila de encabezado antes de `n`.
  let cabecera: string[] | null = null;
  for (let i = n - 2; i >= 0; i -= 1) {
    const l = ls[i] ?? '';
    if (!esFilaDeTabla(l)) break;
    if (esSeparadorDeTabla(l)) {
      cabecera = celdas(ls[i - 1] ?? '').map((c) => pelada(c));
      break;
    }
  }
  if (cabecera === null) return null;
  const cs = celdas(linea).map((c) => pelada(c));
  const out: Record<string, string> = {};
  cabecera.forEach((col, i) => {
    out[col] = cs[i] ?? '';
  });
  return out;
}

/**
 * Cruza una fila de la tabla de fuentes contra la línea del libro mayor que
 * ella misma cita. Devuelve los errores y el `ID` de la línea anclada, o `null`
 * si la fila no ancla ninguna.
 */
function cruzarContraLibroMayor(
  fila: string[],
  donde: string,
  registro: string[],
): { errores: string[]; id: string | null } {
  const m = ANCLA_LIBRO_MAYOR.exec(fila[0] ?? '');
  if (!m) return { errores: [], id: null };
  const n = Number(m[1]);
  const ref = filaDelLibroMayor(n);
  if (ref === null) {
    return {
      errores: [
        `${donde} ancla \`SOURCE_OF_FUNDS_LEDGER.md:${String(n)}\` y esa línea no es una fila de la ` +
          'tabla del libro mayor: la fila dice apoyarse en una autoridad que no se puede leer',
      ],
      id: null,
    };
  }

  const errores: string[] = [];
  const id = ref['ID'] ?? `línea ${String(n)}`;

  const duenoRef = registro.length > 0 ? resolverDueno(ref['Dueño'] ?? '', registro) : null;
  const duenoFila = registro.length > 0 ? resolverDueno(fila[1] ?? '', registro) : null;
  if (duenoRef !== null && duenoFila !== null && 'id' in duenoRef && 'id' in duenoFila) {
    if (duenoRef.id !== duenoFila.id) {
      errores.push(
        `${donde} nombra dueño «${duenoFila.id}» y la línea que ella misma cita —${id} de ` +
          `\`SOURCE_OF_FUNDS_LEDGER.md:${String(n)}\`— dice «${duenoRef.id}». La autoridad de una fila ` +
          'anclada es su línea, no el conjunto de siglas del corpus: contra el conjunto, cualquier ' +
          'sigla real pasa',
      );
    }
  }

  const paresExactos: [string, string, number][] = [
    ['Confianza', 'confianza', 3],
    ['Clase', 'clase', 4],
  ];
  for (const [col, nombre, i] of paresExactos) {
    const esperado = (ref[col] ?? '').toLowerCase();
    const escrito = pelada(fila[i] ?? '').toLowerCase();
    if (esperado !== '' && esperado !== escrito) {
      errores.push(
        `${donde} declara ${nombre} «${escrito}» y ${id} la tiene en «${esperado}» ` +
          `(\`SOURCE_OF_FUNDS_LEDGER.md:${String(n)}\`)`,
      );
    }
  }

  const dispRef = (ref['Disponibilidad'] ?? '').toLowerCase();
  const dispFila = pelada(fila[2] ?? '').toLowerCase();
  const equiv = EQUIVALENCIAS_DE_DISPONIBILIDAD[dispRef];
  const cierra = equiv ? equiv.test(dispFila) : dispRef === dispFila;
  if (dispRef !== '' && !cierra) {
    errores.push(
      `${donde} declara disponibilidad «${dispFila}» y ${id} la tiene en «${dispRef}» ` +
        `(\`SOURCE_OF_FUNDS_LEDGER.md:${String(n)}\`). Si son la misma cosa dicha de dos maneras, la ` +
        'equivalencia se declara en EQUIVALENCIAS_DE_DISPONIBILIDAD y no se supone',
    );
  }

  return { errores, id: (ref['ID'] ?? '') === '' ? null : ref['ID'] };
}

/**
 * **DECIMOSEXTA FORMA DEL ARQUETIPO: el cruce contra el libro mayor estaba
 * condicionado al token cuya desaparición tenía que reportar.**
 *
 * `cruzarContraLibroMayor()` arranca con `if (!m) return []` sobre el ancla que
 * la propia fila trae, y una fila sin ancla es indistinguible de una verificada
 * y correcta. Reproducido sobre el árbol de `8559818`: **borrar el ancla de la
 * fila 4 y mutar sus cuatro columnas a la vez** —`PEO` → `ANMov`,
 * disponibilidad → `2031 en adelante`, `baja` → `media`, `reassignment` →
 * `public_net_cost`— sale **exit 0**, mientras `:488` sigue diciendo «La cuarta
 * sí es trazable: la lleva F10 con esa confianza y esa disponibilidad» y `:492`
 * sigue diciendo «el dueño es la oficina de ejecución del proyecto».
 *
 * Detalle que confirma el diagnóstico: la variante con dueño `ANCV` salía roja
 * **de rebote** —colisiona con el dueño de la fila 3 y rompe el conteo de
 * dueños— y con cualquier otra sigla real seguía verde. De rebote no es un
 * chequeo, y está escrito así tres pantallas más abajo, en `CORTA_ORACION`.
 *
 * **El arreglo es simétrico con `verificarDuenosContraLaProsa()`, que ya cerró
 * la mitad de arriba:** todo identificador del libro mayor que la prosa de §4.6
 * nombre —hoy `F10`— tiene que ser el `ID` de una línea que alguna fila de la
 * tabla ancle. La prosa se apoya en la trazabilidad de esa línea; si ninguna
 * fila la cita, la prosa afirma una autoridad que la tabla ya no invoca.
 *
 * El domicilio es §4.6 y no la SECCIÓN 4 entera, por la misma razón que el
 * chequeo de dueños: §4.5 nombra a `F08` —las regalías extractivas— y eso es
 * verdad y no es una fila de esta tabla.
 */
function idsDelLibroMayor(): string[] {
  const rel = DOCUMENTOS_CITABLES['SOURCE_OF_FUNDS_LEDGER.md'];
  if (rel === undefined) return [];
  const f = resolve(REPO_ROOT, rel);
  if (!existsSync(f)) return [];
  const lineas = readFileSync(f, 'utf8').split('\n');
  const out: string[] = [];
  let col = -1;
  for (const l of lineas) {
    if (!esFilaDeTabla(l)) {
      col = -1;
      continue;
    }
    const cs = celdas(l);
    if (col === -1) {
      col = cs.findIndex((c) => pelada(c) === 'ID');
      continue;
    }
    if (esSeparadorDeTabla(l)) continue;
    const celda = pelada(cs[col] ?? '');
    if (celda !== '') out.push(celda);
  }
  return [...new Set(out)];
}

function verificarIdsDelLibroMayorEnLaProsa(
  lineas: string[],
  idsAnclados: Set<string>,
): string[] {
  const { texto, errores } = textoDeDomicilio(lineas, H3_TABLA_DE_FUENTES);
  if (texto === null) return errores;
  const ids = idsDelLibroMayor();
  if (ids.length === 0) {
    errores.push(
      'no se pudo leer la columna «ID» de `SOURCE_OF_FUNDS_LEDGER.md`: el cruce entre los ' +
        'identificadores que la prosa de §4.6 nombra y las líneas que la tabla ancla **NO corre**, y ' +
        'una prosa que se apoya en una línea que nadie cita es exactamente lo que ese cruce existe ' +
        'para atrapar',
    );
    return errores;
  }
  // Las filas se descuentan: si no, el ancla de la propia fila cubriría a la prosa.
  const prosa = texto
    .split('\n')
    .filter((l) => !esFilaDeTabla(l))
    .join('\n');
  for (const id of ids) {
    const re = new RegExp(`(?<![\\p{L}\\p{N}])${id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?![\\p{L}\\p{N}])`, 'u');
    if (!re.test(prosa)) continue;
    if (idsAnclados.has(id)) continue;
    errores.push(
      `la prosa de §4.6 se apoya en «${id}» del libro mayor —«la lleva ${id} con esa confianza»— y ` +
        'ninguna fila de la tabla ancla esa línea ' +
        `(las ancladas son ${idsAnclados.size === 0 ? '**ninguna**' : `«${[...idsAnclados].join('», «')}»`}). ` +
        'Sin el ancla, las cuatro columnas de la fila dejan de cruzarse contra su línea y se pueden ' +
        'mutar de a cuatro sin que nada se ponga rojo: el chequeo quedaría condicionado al token ' +
        'cuya desaparición tiene que reportar',
    );
  }
  return errores;
}

/**
 * **La otra mitad del mismo defecto: la fila SIN ancla al libro mayor.** La
 * primera fila —la única con caja presente— no cita ninguna línea porque su
 * fuente no está en el libro mayor, así que el cruce de arriba no la alcanza.
 * Reproducido: `ANSES` → `ANTSPO` salía **exit 0**, con una sigla real, el
 * dueño del fondo soberano de otro PLAN, y `:490` a tres líneas diciendo «los
 * haberes que ANSES ya liquida».
 *
 * La autoridad de esas filas es la prosa que las glosa. La regla es simétrica y
 * barata: **toda SIGLA del registro que §4.6 nombre en su prosa tiene que ser
 * dueño de alguna fila de la tabla.** No exige que la prosa nombre a los cuatro
 * —dos se glosan por su función y no por su sigla— sino que no pueda nombrar
 * uno que la tabla ya no tiene. Que sea sobre siglas y no sobre el registro
 * entero lo explica `registroAcotadoALasSiglas()`: barrer `Hacienda` o
 * `MinSalud` contra la prosa es un falso positivo esperando una sección futura.
 *
 * El domicilio es §4.6 y no la SECCIÓN 4 entera a propósito: §4.5 nombra a la
 * ANTSPO como administradora del Fondo Soberano Ciudadano, que es verdad y no
 * es un dueño de esta tabla. Y las filas de la tabla se descuentan del texto,
 * porque si no la mutación se cubriría a sí misma.
 */
function verificarDuenosContraLaProsa(
  lineas: string[],
  duenosDeLaTabla: Set<string>,
  registro: string[],
): string[] {
  const { texto, errores } = textoDeDomicilio(lineas, H3_TABLA_DE_FUENTES);
  if (texto === null) return errores;
  const prosa = texto
    .split('\n')
    .filter((l) => !esFilaDeTabla(l))
    .join('\n');
  for (const id of registro) {
    if (duenosDeLaTabla.has(id)) continue;
    const re = new RegExp(`(?<!\\p{L})${id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?!\\p{L})`, 'u');
    if (!re.test(prosa)) continue;
    errores.push(
      `la prosa de §4.6 nombra a «${id}» como dueño y la tabla de fuentes no lo tiene en ninguna ` +
        `fila (los que tiene son «${[...duenosDeLaTabla].join('», «')}»). La prosa y la tabla no ` +
        'pueden nombrar dueños distintos para la misma plata: una de las dos está mutada',
    );
  }
  return errores;
}

/**
 * Los conteos que la prosa de la SECCIÓN 4 tiene que decir, **derivados de la
 * tabla y no escritos a mano.** Misma doctrina que
 * `frasesDerivadasDelCalendario()`: se exige el par número-sustantivo y no la
 * oración entera, para que la prosa se pueda reescribir sin que la guardia se
 * ponga roja sobre prosa honesta.
 *
 * El cuarto es el que más trabajo hace. Que ninguna fuente llegue a confianza
 * `alta` no es un descuido: la regla 5 del libro mayor dice que una reasignación
 * no sube de media a alta sin ley sancionada o decreto firmado, y la ley de este
 * PLAN no existe. Si mañana alguien escribe una fila `alta` sin la ley, la
 * guardia obliga a que la prosa lo diga en vez de dejarlo pasar en una celda.
 */
function frasesDerivadasDeFuentes(
  total: number,
  duenos: number,
  clases: number,
  altas: number,
): { frase: string; porQue: string }[] {
  const letra = (n: number): string => EN_LETRAS[n] ?? String(n);
  return [
    {
      frase: `${letra(total)} fuentes`,
      porQue: 'la cantidad de fuentes sale de contar la tabla, no de la memoria de quien la escribió',
    },
    {
      frase: `${letra(duenos)} dueños`,
      porQue:
        'los dueños DISTINTOS salen de `new Set()` sobre la segunda columna. La regla de ' +
        '`PLANPACTO §5.1` es «una fuente, un dueño»: si dos filas comparten dueño, el número lo dice',
    },
    {
      frase: `${letra(clases)} clases`,
      porQue:
        'las clases DISTINTAS usadas, contra las seis de `SOURCE_OF_FUNDS_LEDGER.md`. Es el número ' +
        'que delata si la tabla se apoya toda en un solo tipo de fuente',
    },
    {
      frase: altas === 0 ? 'ninguna de confianza alta' : `${letra(altas)} de confianza alta`,
      porQue:
        'la regla 5 del libro mayor: una reasignación no sube a `alta` sin ley sancionada o decreto ' +
        'firmado. Escribir una fila `alta` sin la ley y no decirlo es la manera prolija de estrenar ' +
        'una fuente que no existe',
    },
  ];
}

/**
 * La tabla de la plata. Lo que se verifica, y por qué cada cosa:
 *
 * - **Una sola tabla y CONTIGUA.** Lo cierra `filasDeTabla()` con la bandera.
 * - **Cinco celdas llenas por fila.** La celda que se puede dejar en blanco sin
 *   que el renglón se note es la del dueño, y es la que hace verificable la fila.
 * - **La confianza es una de las cuatro** de `PLANPACTO §5.1`, y **la clase es
 *   una de las seis** del libro mayor, leídas del libro mayor.
 * - **Ninguna fila es `future_return`.**
 * - **Los conteos de la prosa salen de la tabla.**
 *
 * Las anclas de las celdas —`PLANCUIDADO:340` y las demás— no se resuelven acá:
 * las resuelve `verificarAnclasDeProsa()`, que barre TODAS las líneas del
 * archivo, filas de tabla incluidas. Verificado rompiendo una: sale roja.
 */
function verificarTablaDeFuentes(lineas: string[]): string[] {
  const { filas, errores } = filasDeTabla(lineas, COLUMNAS_FUENTES, true);
  if (filas === null) {
    if (errores.length === 0) {
      errores.push(
        `falta la tabla de fuentes de la Renta de Arco, con las columnas [${COLUMNAS_FUENTES.join(' · ')}]: ` +
          'sin ella la SECCIÓN 4 promete plata y no dice de dónde sale, que es la práctica que ' +
          'PLANPACTO §5.1 existe para terminar',
      );
    }
    return errores;
  }

  const clasesValidas = clasesDelLibroMayor();
  if (clasesValidas.length === 0) {
    errores.push(
      'no se pudieron leer las seis clases de la regla 2 de `SOURCE_OF_FUNDS_LEDGER.md`: el chequeo ' +
        'de clases NO corre, y una tabla de fuentes sin clase verificada es una taxonomía propia',
    );
  }

  const registro = registroDeDuenos();
  if (registro.length === 0) {
    errores.push(
      'no se pudo armar el registro de dueños (`SOURCE_OF_FUNDS_LEDGER.md` + ' +
        '`TABLA_AGENCIAS_BASTA.md`): el chequeo de la columna «Dueño» NO corre, y una columna de ' +
        'dueños sin autoridad detrás es un `new Set()` sobre texto libre',
    );
  }

  const duenos = new Set<string>();
  const clases = new Set<string>();
  /** Los `ID` del libro mayor que ALGUNA fila de la tabla ancla. Ver R-4. */
  const idsAnclados = new Set<string>();
  let altas = 0;
  filas.forEach((fila, k) => {
    const donde = `la fuente ${String(k + 1)} de la Renta de Arco («${pelada(fila[0] ?? '').slice(0, 44)}»)`;
    if (fila.length !== COLUMNAS_FUENTES.length) {
      errores.push(
        `${donde} tiene ${String(fila.length)} celda(s) y la tabla tiene ` +
          `${String(COLUMNAS_FUENTES.length)} columnas`,
      );
      return;
    }
    if (fila.some(celdaHueca)) {
      errores.push(
        `${donde} tiene una celda hueca —vacía, un guion o un placeholder—: «${fila.join(' | ')}». ` +
          'La regla de PLANPACTO §5.1 es «una fuente, un dueño, una fecha de disponibilidad, una ' +
          'calificación de confianza», y las cuatro van escritas o la fila no es una fuente. Un guion ' +
          'en la celda del dueño es una fuente por la que no responde nadie, escrita de manera que no ' +
          'se note',
      );
      return;
    }

    if (registro.length > 0) {
      const dueno = resolverDueno(fila[1], registro);
      if ('error' in dueno) errores.push(`${donde} ${dueno.error}`);
      else duenos.add(dueno.id);
    } else {
      duenos.add(pelada(fila[1]));
    }

    // La autoridad de la fila anclada es su línea del libro mayor, no el conjunto.
    const cruce = cruzarContraLibroMayor(fila, donde, registro);
    errores.push(...cruce.errores);
    if (cruce.id !== null) idsAnclados.add(cruce.id);

    const confianza = pelada(fila[3]).toLowerCase();
    if (!CONFIANZAS.includes(confianza)) {
      errores.push(
        `${donde} declara confianza «${pelada(fila[3])}», que no es una de las cuatro de ` +
          `PLANPACTO §5.1 [${CONFIANZAS.join(' · ')}]`,
      );
    } else if (confianza === 'alta') {
      altas += 1;
    }

    const clase = pelada(fila[4]);
    clases.add(clase);
    if (clase === CLASE_PROHIBIDA) {
      errores.push(
        `${donde} está clasificada \`${CLASE_PROHIBIDA}\`, y ninguna fila puede estarlo: ` +
          'PLANPACTO lo prohíbe dos veces (`:444` y `:655`) y la regla 4 del libro mayor lo repite. ' +
          'Un retorno futuro no financia gasto presente, por bien fundado que esté el retorno',
      );
    } else if (clasesValidas.length > 0 && !clasesValidas.includes(clase)) {
      errores.push(
        `${donde} declara la clase «${clase}», que no está en la regla 2 de ` +
          `\`SOURCE_OF_FUNDS_LEDGER.md\` [${clasesValidas.join(' · ')}]: las clases son las del libro ` +
          'mayor y no una taxonomía propia (PLANPACTO:655)',
      );
    }
  });

  if (registro.length > 0) {
    errores.push(...verificarDuenosContraLaProsa(lineas, duenos, registroAcotadoALasSiglas()));
  }
  errores.push(...verificarIdsDelLibroMayorEnLaProsa(lineas, idsAnclados));

  const { tramo, errores: errTramo } = tramoDeSeccion(lineas, H2_RENTA);
  errores.push(...errTramo);
  if (tramo !== null) {
    const texto = tramo.join('\n');
    for (const { frase, porQue } of frasesDerivadasDeFuentes(
      filas.length,
      duenos.size,
      clases.size,
      altas,
    )) {
      if (!dice(texto, frase)) {
        errores.push(`la SECCIÓN 4 no dice «${frase}»: ${porQue}`);
      }
    }
  }

  return errores;
}

// ─────────────────────────────────────────────────────────────────────────────
// El Calendario de Umbrales: la tabla de estaciones de la SECCIÓN 3.
// ─────────────────────────────────────────────────────────────────────────────

const COLUMNAS_CALENDARIO = ['Estación', 'Edad o hito', 'Dispositivo', 'Quién la ocupa hoy'];

/** Las estaciones del arco. El número va acá porque la prosa lo tiene que decir. */
const ESTACIONES_ESPERADAS = 16;

/** La celda que declara que una estación no tiene ocupante previo. */
const SIN_OCUPANTE = '—';

/**
 * Los PLANes que existen como documento en el taller. La columna «quién la
 * ocupa hoy» solo puede nombrar PLANes reales: un ocupante inventado sería una
 * remisión falsa, que es la falla que este tramo lleva nueve veces detectadas.
 */
function planesDelTaller(): Set<string> {
  const dir = resolve(REPO_ROOT, 'Iniciativas Estratégicas');
  const out = new Set<string>();
  for (const f of readdirSync(dir)) {
    const m = /^(PLAN[A-Z0-9]+)_Argentina_ES\.md$/.exec(f);
    if (m) out.add(m[1]);
  }
  return out;
}

/**
 * Los documentos que la prosa cita por un nombre que no es `PLANXXX`. Sin este
 * mapa, `BLINDAJE:194` y `spec:190` no se pueden abrir, y son exactamente las
 * citas que este tramo viene errando: **dos números de línea de BLINDAJE
 * estaban mal en el propio plan.**
 *
 * Un nombre que no esté acá ni sea un PLAN del taller se reporta: registrar un
 * documento citable nuevo es una línea, y es más barato que una remisión que
 * nadie puede abrir.
 */
const DOCUMENTOS_CITABLES: Record<string, string> = {
  BLINDAJE: 'Iniciativas Estratégicas/BLINDAJE_INSTITUCIONAL_BASTA.md',
  'TABLA_AGENCIAS_BASTA.md': 'Iniciativas Estratégicas/TABLA_AGENCIAS_BASTA.md',
  ACTA: 'Iniciativas Estratégicas/ACTA_LEVANTAMIENTO_FREEZE_2026-07-26.md',
  spec: 'v2/docs/specs/2026-07-26-cuatro-planes-nuevos.md',
  // Task 5: el libro mayor de fuentes y sus dos vecinos, que la SECCIÓN 4 cita.
  'SOURCE_OF_FUNDS_LEDGER.md': 'Iniciativas Estratégicas/SOURCE_OF_FUNDS_LEDGER.md',
  'PRESUPUESTO_CONSOLIDADO_BASTA.md': 'Iniciativas Estratégicas/PRESUPUESTO_CONSOLIDADO_BASTA.md',
  'CASCADA_LEGAL_BASTA.md': 'Iniciativas Estratégicas/CASCADA_LEGAL_BASTA.md',
};

/** Las líneas de un documento citable, cacheadas: la resolución de anclas relee. */
const CACHE_TALLER = new Map<string, string[]>();
function lineasDelPlan(doc: string): string[] | null {
  const hit = CACHE_TALLER.get(doc);
  if (hit) return hit;
  const rel =
    DOCUMENTOS_CITABLES[doc] ?? `Iniciativas Estratégicas/${doc}_Argentina_ES.md`;
  const f = resolve(REPO_ROOT, rel);
  if (!existsSync(f)) return null;
  const ls = readFileSync(f, 'utf8').split('\n');
  CACHE_TALLER.set(doc, ls);
  return ls;
}

/**
 * Una celda de ocupante se trocea por `·` y cada pedazo tiene que traer PLAN y
 * ancla. Formas aceptadas, que son las que el corpus escribe:
 *
 *   `PLANSAL §4.4`   `PLANCUIDADO:340`   `PLANMON:1543-1576`
 *
 * El `§` remite a un encabezado; el `:` a una línea (o a un rango).
 */
const ANCLA_SECCION = /^(PLAN[A-Z0-9]+)\s+§(\d+(?:\.\d+)*)$/;
const ANCLA_LINEA = /^(PLAN[A-Z0-9]+):(\d+)(?:-(\d+))?$/;

/**
 * **La sexta forma del arquetipo, y la peor de las seis.** Antes de esta
 * función la guardia se publicitaba como «ocupantes cruzados contra el taller»
 * y lo único que cruzaba era que el TOKEN `PLANXXX` tuviera archivo. El ancla
 * —`§4.4`, `:340`— no se miraba nunca: reproducido, un ocupante
 * `PLANAGUA §999.9` en la celda de «El piso» —un PLAN que no dice una palabra
 * de jubilaciones, en una sección que no existe— salía **exit 0**. El chequeo
 * que se anuncia como lo que hace confiable la cuarta columna informaba éxito
 * sobre una remisión inventada.
 *
 * Esto no verifica semántica —`PLANAGUA §1.1` existe y sigue sin hablar de
 * jubilaciones— pero cierra la dirección barata, que es la que se usa: inventar
 * el número de sección o de línea porque nadie lo va a abrir.
 *
 * Se resuelve contra el archivo destino: `§N.N` exige un encabezado
 * `^#{1,6} N.N` (y `9.1` NO matchea `9.10`); `:NNN` exige que la línea exista y
 * no esté vacía —una remisión a una línea en blanco es una remisión a nada—.
 */
/**
 * El núcleo compartido por la cuarta columna del Calendario y por las anclas de
 * la prosa: abre el documento y comprueba que el ancla exista.
 *
 * `faltaDocumento` decide qué pasa cuando el documento no está. En la tabla se
 * devuelve `null` porque el cruce contra `planesDelTaller()` ya lo reporta con
 * mejor mensaje; en la prosa NO hay tal cruce, así que un `PLANJUB:100` en un
 * paréntesis pasaría en silencio, que es la falla que este tramo persigue.
 */
function resolverContra(
  bruto: string,
  doc: string,
  seccion: string | null,
  desde: number,
  hasta: number,
  faltaDocumento: 'reportar' | 'callar',
): string | null {
  const ls = lineasDelPlan(doc);
  if (ls === null) {
    return faltaDocumento === 'callar'
      ? null
      : `«${bruto}» cita a «${doc}», que no es un PLAN del taller ni un documento citable registrado: ` +
          'o el nombre está mal, o hay que registrarlo en DOCUMENTOS_CITABLES';
  }

  if (seccion !== null) {
    const re = new RegExp(`^#{1,6}\\s+${seccion.replace(/\./g, '\\.')}(?![\\d.])`);
    if (!ls.some((l) => re.test(l))) {
      return `«${bruto}» apunta a una sección que ${doc} no tiene: no hay encabezado «${seccion}»`;
    }
    return null;
  }

  if (desde < 1 || hasta > ls.length || hasta < desde) {
    return `«${bruto}» apunta fuera de ${doc}, que tiene ${String(ls.length)} líneas`;
  }
  if ((ls[desde - 1] ?? '').trim() === '') {
    return `«${bruto}» apunta a una línea vacía de ${doc}: una remisión a nada`;
  }
  return null;
}

function resolverAncla(fragmento: string): string | null {
  const bruto = fragmento.replace(/`/g, '').trim();
  if (bruto === '') return null;

  const s = ANCLA_SECCION.exec(bruto);
  if (s) return resolverContra(bruto, s[1], s[2], 0, 0, 'callar');

  const l = ANCLA_LINEA.exec(bruto);
  if (l) {
    const desde = Number(l[2]);
    return resolverContra(bruto, l[1], null, desde, l[3] === undefined ? desde : Number(l[3]), 'callar');
  }

  return (
    `«${bruto}» no trae PLAN con ancla resoluble: la cuarta columna se escribe ` +
    '`PLANXXX §N.N` o `PLANXXX:NNN` (o `PLANXXX:NNN-NNN`), y sin ancla el ocupante no se puede abrir'
  );
}

/**
 * Las anclas de la PROSA, resueltas con la misma máquina que las de la tabla.
 *
 * Hasta acá `resolverAncla()` se aplicaba a las dieciséis celdas de la cuarta
 * columna del Calendario y a nada más, mientras el cuerpo del documento llevaba
 * unas veinticinco citas ancladas —`PLANPACTO:428`, `BLINDAJE:194`,
 * `PLANMON:1547`, `TABLA_AGENCIAS_BASTA.md:54`— que no se abrían nunca.
 * Reproducido antes de escribir esto: `BLINDAJE:194` → `BLINDAJE:19400` salía
 * **exit 0**, y `PLANPACTO §4.7` → `§4.77` también.
 *
 * No es hipotético: **dos números de línea de BLINDAJE estaban mal en el propio
 * plan del tramo** (`:53` dado como «protección media», que está en `:194`; y
 * `:88-96` dado como masa de beneficiarios, que está en `:186-188`). La cita
 * anclada es la unidad de evidencia de este documento; una que no resuelve es
 * una remisión falsa con aspecto de rigor.
 *
 * **Las tres formas, y por qué la tercera.** El corpus escribe
 * `PLANXXX:NNN` / `PLANXXX §N.N` cuando nombra el documento, y `:NNN` a secas
 * cuando sigue hablando del mismo — «`PLANCUIDADO:94` … con mecanismo propio
 * (`:340`)». La forma corta se resuelve contra el ÚLTIMO documento citado, que
 * es como la lee un lector. Es aproximada por construcción: si el antecedente
 * real quedó dos citas atrás, la corta se resuelve contra el documento
 * equivocado y —salvo que el número caiga fuera de rango— pasa. Atrapa el error
 * grosero, no demuestra la corrección de la cita.
 *
 * **Falsos positivos: cero, y se verificó antes de dar el chequeo por bueno.**
 * Una guardia roja sobre prosa honesta empuja al que sigue a reescribir la
 * frase en vez de arreglar la regex, y en este tramo ya pasó dos veces.
 */
const ANCLA_PROSA_SECCION = /^([A-Za-z][A-Za-z0-9_]*(?:\.md)?)\s+§(\d+(?:\.\d+)*)$/;
const ANCLA_PROSA_LINEA = /^([A-Za-z][A-Za-z0-9_]*(?:\.md)?):(\d+)(?:-(\d+))?$/;
const ANCLA_PROSA_CORTA = /^:(\d+)(?:-(\d+))?$/;
const NOMBRE_DE_DOCUMENTO = /^([A-Za-z][A-Za-z0-9_]*(?:\.md)?)$/;

/**
 * **La octava forma del arquetipo, y la que le faltaba justo a este chequeo: la
 * guardia contaba lo que ENTENDIÓ, no lo que VIO.**
 *
 * Las cuatro formas de arriba reconocen las anclas que el corpus escribe hoy, y
 * todo lo demás se descartaba **en silencio**: un token en backticks que no
 * matcheara era indistinguible de prosa entre comillas invertidas. O sea que la
 * manera más barata de sacarle una cita a la verificación no era romperla — era
 * escribirla en un formato que la guardia no conociera.
 *
 * No es hipotético, y el propio documento trae el caso: `ANCLA_PROSA_LINEA`
 * exige `[A-Za-z][A-Za-z0-9_]*` **sin guiones**, y
 * `ACTA_LEVANTAMIENTO_FREEZE_2026-07-26.md` ya está en la cabecera como nombre
 * suelto. Reproducido antes de escribir esto, los tres salían **exit 0** y el
 * titular seguía imprimiendo el mismo número de anclas:
 *
 * | Token plantado | Antes |
 * |---|---|
 * | `` `ACTA_LEVANTAMIENTO_FREEZE_2026-07-26.md:99999` `` | exit 0 |
 * | `` `PLANPACTO §4.6-4.7` `` | exit 0 |
 * | `` `PLANMON §6.2:99999` `` | exit 0 |
 *
 * El arreglo no es reconocer más formatos —eso sería perseguir la sintaxis— sino
 * **declarar lo que no se pudo leer**: todo token en backticks con forma de
 * ancla (un `§`, o un `:` seguido de dígito) que ninguna de las cuatro formas
 * capture se reporta. Registrar un formato nuevo es una línea de esta guardia;
 * una cita que nadie puede abrir es lo que este tramo existe para impedir.
 *
 * **Falsos positivos: cero sobre el documento entero**, verificado token por
 * token antes de dar el chequeo por bueno. Los backticks que NO son anclas
 * —`superseded`, `[est.]`, `future_return`, `PLAN_REGISTRY.yml`,
 * `LEGAL_OPINIONS/PLANARCO.md`— no llevan `§` ni `:` seguido de dígito y no
 * entran nunca a este brazo.
 */
const CON_FORMA_DE_ANCLA = /§|:\d/u;

/**
 * **DECIMOTERCERA FORMA, y la única de las trece que produce un FALSO POSITIVO
 * de verificación: un chequeo que AFIRMA una cita equivocada.**
 *
 * `antecedente` era una sola variable global al archivo y **cualquier** nombre
 * de PLAN entre backticks la pisaba, incluido un nombre pelado sin ancla.
 * Reproducido dos veces sobre el árbol de la Task 5: inyectando `` `PLANTER` ``
 * entre `` `PRESUPUESTO_CONSOLIDADO_BASTA.md:100` `` y su remisión corta
 * `` `:430` ``, la guardia salía **exit 0** y contaba esa ancla entre las
 * doscientas «abiertas y resueltas», mientras `:430` resolvía contra
 * `PLANTER:430` —el H2 de otra sección de otro PLAN— en vez de contra el
 * documento del que la oración hablaba.
 *
 * No es un chequeo que falla abierto: es uno que da por verificada una remisión
 * falsa, y la cuenta en el número que el tramo usa para darse por verificado.
 *
 * **El arreglo son dos reglas, y la segunda es la que importa.** Primera: el
 * antecedente de una remisión corta lo fija **solo un ancla completa**
 * (`DOC:NNN` o `DOC §N.N`); un nombre pelado no lo pisa nunca. Segunda: si
 * entre el ancla completa y la remisión corta apareció el nombre pelado de
 * **otro** documento, el chequeo **no corre y lo dice** — no adivina cuál de
 * los dos quiso decir el que escribió. Es la doctrina que esta guardia ya tiene
 * escrita para los domicilios ambiguos, aplicada donde faltaba.
 *
 * **Falsos positivos: cero sobre el documento entero**, verificado antes de dar
 * el chequeo por bueno. El corpus escribe la remisión corta pegada a su ancla
 * —«`PLANTER:674` … (`:163`)»— y el caso ambiguo, cuando aparece, es prosa que
 * el lector tampoco puede desambiguar.
 *
 * ── DECIMOCUARTA FORMA: el arreglo de arriba cerró al hijacker DÉBIL y dejó
 * abierto al FUERTE, que es el realista ────────────────────────────────────
 *
 * El nombre pelado entre backticks —`` `PLANTER` `` suelto— no es prosa que el
 * corpus escriba. El **ancla completa de otro documento** sí lo es. Reproducido
 * sobre `:455` (§4.5), insertando `` `PLANTER:349` `` entre
 * `` `PRESUPUESTO_CONSOLIDADO_BASTA.md:100` `` y sus dos remisiones cortas:
 * **exit 0**, el titular pasó de 246 anclas «abiertas y resueltas» a 247, y
 * `` `:430` `` resolvió contra `PLANTER:430` y `` `:3` `` contra `PLANTER:3`.
 * El ancla completa reasignaba el antecedente y encima LIMPIABA los pelados
 * pendientes.
 *
 * **Lo que NO se puede hacer, y va escrito para que nadie lo reintente:** tratar
 * cualquier ancla intermedia como ambigüedad. Un ancla completa siempre se
 * vuelve el antecedente, así que «entre el antecedente y la remisión corta» no
 * puede haber ninguna otra por construcción; y contar todos los documentos
 * anclados desde la remisión corta anterior pone en rojo prosa honesta —`:465`
 * ancla PLANTER, después PLANMON, después PLANTER otra vez, y sus tres
 * remisiones cortas son correctas—. Medido sobre el árbol limpio: sesenta y
 * pico de falsos positivos.
 *
 * **El corte que sí distingue es la ORACIÓN.** Un lector resuelve la remisión
 * corta contra el último documento citado, y eso alcanza mientras la oración
 * nombre uno solo. Cuando la MISMA oración ancla dos documentos distintos antes
 * de la remisión corta, el lector tampoco puede desambiguar: ahí el chequeo no
 * corre y lo dice, igual que con el nombre pelado. La oración se corta contra
 * `.` o `;` —no contra `:`, y la razón está abajo, en `CORTA_ORACION`— y contra
 * el principio de línea, porque el corpus escribe un párrafo por línea.
 *
 * ── EL DEFAULT INVERTIDO: el corte por oración cerraba UNA de tres variantes ──
 *
 * El arreglo de arriba cerró la variante que comparte oración con el ancla
 * secuestradora —separador coma, **rojo**— y dejó pasar las otras dos, las dos
 * medidas sobre el árbol de `8559818` y las dos **exit 0**:
 *
 * | Variante | Separador | Antes |
 * |---|---|---|
 * | misma oración | coma | rojo |
 * | misma línea, oración distinta | **un punto** | **exit 0**: `` `:1556` `` resolvía contra `PLANSAL:1556` |
 * | líneas distintas | **un párrafo insertado** | **exit 0**: `` `:428` `` resolvía contra `PLANSAL:428` |
 *
 * La tercera es la peligrosa. `ancladosEnLaOracion` se reinicializa en cada
 * línea, así que un ancla de una línea anterior es invisible para el chequeo de
 * ambigüedad mientras `antecedente` —global al archivo— la sigue usando. El
 * documento tenía dos remisiones cortas que cruzaban línea (`:331`→`:329` y
 * `:528`→`:526`), y **insertar un párrafo entre dos párrafos es la operación de
 * edición más común que hay**: con un párrafo nuevo entre `:329` y `:331`, la
 * Regla de Arco citada literal —la cláusula más portante de §3.4— pasaba a
 * resolver contra otro PLAN y se contaba entre las anclas «resueltas».
 *
 * **El arreglo es invertir el default, no agregar una excepción más.** La
 * remisión corta corre **solo si su ancla completa está en la misma oración**;
 * si no, el chequeo no corre y lo dice. Es la doctrina que esta guardia ya
 * proclamaba —el lector resuelve contra lo que tiene a la vista— escrita como
 * requisito positivo en vez de como excepción negativa, que es la forma que se
 * puede escapar por los bordes que nadie enumeró.
 *
 * **El presupuesto del cambio, medido y no supuesto:** 21 de las 62 remisiones
 * cortas del documento pedían el nombre escrito, y `` `:428` `` → ``
 * `PLANPACTO:428` `` es **un token en los dos casos** (`wc -w`), o sea **cero
 * palabras de costo** sobre secciones con margen de tres a seis.
 *
 * **Falsos positivos: cero sobre el documento entero**, medido después de
 * invertir el default: 253 anclas abiertas y resueltas, las mismas 253.
 */
/**
 * Límite de ORACIÓN entre dos tokens. Los dos puntos NO cortan, y la diferencia
 * se midió: con `:` adentro del juego, la mutación «`PLANTER:674` … que
 * `PLANMON:941` no computa … de no distribuir: preservación de capital (`:163`)»
 * se escapaba del chequeo de ambigüedad —el `:` de «no distribuir:» vaciaba el
 * conjunto— y solo caía de rebote, porque `PLANMON` no tiene esas líneas. De
 * rebote no es un chequeo. El castellano del corpus usa los dos puntos para
 * seguir la misma oración, así que cortan `.` y `;` y nada más.
 */
const CORTA_ORACION = /[.;]\s|[.;]$/;

function verificarAnclasDeProsa(lineas: string[]): { errores: string[]; resueltas: number } {
  const errores: string[] = [];
  /**
   * Cuántas anclas se abrieron de verdad **y resolvieron**. Va al titular a
   * propósito: cero anclas escaneadas también da cero errores, y un chequeo que
   * informa éxito sin haber mirado nada es el arquetipo que esta guardia lleva
   * ocho veces. Se incrementa DESPUÉS de resolver y solo si resolvió: antes se
   * contaba al entrar al brazo, así que una cita a un documento no registrado
   * sumaba al titular «abiertas contra su documento» sin haberse abierto nunca.
   */
  let resueltas = 0;
  const anotar = (err: string | null, donde: string): void => {
    if (err === null) resueltas += 1;
    else errores.push(`${donde}: ${err}`);
  };

  lineas.forEach((linea, k) => {
    /**
     * Documentos ANCLADOS en la oración en curso, y nombres PELADOS de la misma
     * oración. Los dos se vacían en cada `.` y `;`. **No hay estado que cruce la
     * oración:** el antecedente global que había acá es exactamente lo que
     * dejaba pasar las variantes B y C.
     */
    let ancladosEnLaOracion = new Set<string>();
    let peladosEnLaOracion = new Set<string>();
    let finDelTokenAnterior = 0;

    for (const m of linea.matchAll(/`([^`\n]+)`/g)) {
      const bruto = m[1].trim();
      const donde = `línea ${String(k + 1)}`;
      if (CORTA_ORACION.test(linea.slice(finDelTokenAnterior, m.index))) {
        ancladosEnLaOracion = new Set<string>();
        peladosEnLaOracion = new Set<string>();
      }
      finDelTokenAnterior = m.index + m[0].length;

      const s = ANCLA_PROSA_SECCION.exec(bruto);
      if (s) {
        if (lineasDelPlan(s[1]) !== null) ancladosEnLaOracion.add(s[1]);
        anotar(resolverContra(bruto, s[1], s[2], 0, 0, 'reportar'), donde);
        continue;
      }

      const l = ANCLA_PROSA_LINEA.exec(bruto);
      if (l) {
        if (lineasDelPlan(l[1]) !== null) ancladosEnLaOracion.add(l[1]);
        const desde = Number(l[2]);
        anotar(
          resolverContra(bruto, l[1], null, desde, l[3] === undefined ? desde : Number(l[3]), 'reportar'),
          donde,
        );
        continue;
      }

      const c = ANCLA_PROSA_CORTA.exec(bruto);
      if (c) {
        if (ancladosEnLaOracion.size === 0) {
          errores.push(
            `${donde}: «${bruto}» es una remisión corta y su ORACIÓN no ancla ningún documento. La ` +
              'remisión corta corre solo contra un ancla completa de la misma oración: un antecedente ' +
              'que viene de otra oración o de otro párrafo se lo lleva cualquier edición intermedia ' +
              '—un párrafo insertado entre dos párrafos— sin que nadie se entere, y la guardia ' +
              'contaría la cita secuestrada entre las resueltas. Escribí la cita con su nombre ' +
              '(`DOC:NNN`) o traé el ancla completa a esta misma oración',
          );
          continue;
        }
        if (ancladosEnLaOracion.size > 1) {
          errores.push(
            `${donde}: «${bruto}» es una remisión corta y su oración ancla más de un documento ` +
              `(«${[...ancladosEnLaOracion].join('», «')}»): el lector no tiene cómo saber cuál quiso ` +
              'decir el que escribió. La guardia no adivina — escribí la cita con su nombre ' +
              '(`DOC:NNN`) o partí la oración. Un antecedente secuestrado por un ancla legítima no ' +
              'rompe el chequeo: lo vuelve una afirmación de que la cita es correcta',
          );
          continue;
        }
        const antecedente = [...ancladosEnLaOracion][0];
        const pelados = [...peladosEnLaOracion].filter((d) => d !== antecedente);
        if (pelados.length > 0) {
          errores.push(
            `${donde}: «${bruto}» es una remisión corta y el antecedente NO es único — el ancla ` +
              `completa de su oración es de «${antecedente}» y la misma oración nombra a ` +
              `«${pelados.join('», «')}». La guardia no adivina cuál de los dos: escribí la cita con ` +
              'su nombre (`DOC:NNN`) o mové el nombre pelado. Un antecedente secuestrado no rompe el ' +
              'chequeo, lo vuelve una afirmación de que la cita es correcta',
          );
          continue;
        }
        const desde = Number(c[1]);
        anotar(
          resolverContra(
            `${antecedente}${bruto}`,
            antecedente,
            null,
            desde,
            c[2] === undefined ? desde : Number(c[2]),
            'reportar',
          ),
          donde,
        );
        continue;
      }

      const n = NOMBRE_DE_DOCUMENTO.exec(bruto);
      if (n) {
        // Un nombre PELADO no ancla: se anota como ambigüedad pendiente de la oración.
        if (lineasDelPlan(n[1]) !== null) peladosEnLaOracion.add(n[1]);
        continue;
      }

      // Octava forma: tiene pinta de ancla y ninguna de las cuatro la leyó.
      if (CON_FORMA_DE_ANCLA.test(bruto)) {
        errores.push(
          `${donde}: «${bruto}» tiene forma de ancla y la guardia no sabe leerla, así que hasta hoy ` +
            'se descartaba en silencio y contaba como prosa. Las formas que se resuelven son ' +
            '`PLANXXX §N.N`, `PLANXXX:NNN`, `PLANXXX:NNN-NNN` y la remisión corta `:NNN`. Si el ' +
            'formato es legítimo, se registra acá; si no, la cita no se puede abrir y no va escrita',
        );
      }
    }
  });

  return { errores, resueltas };
}

/**
 * **M13.** El titular decía «conjunto exacto: ni falta ni sobra» sobre la
 * portada mientras la columna «Dispositivo del arco» podía nombrar cualquier
 * cosa: verificado, renombrar «Dote de Origen» → «Bono Fundacional Vitalicio»
 * en la tabla salía exit 0. Las Tasks 5–7 escriben esos dispositivos, así que
 * el cruce vale: cada celda tiene que nombrar por lo menos uno de los trece de
 * la portada, salvo la única fila que declara no tener dispositivo propio.
 *
 * Es la dirección barata a propósito: no exige que los trece estén en la tabla
 * —`Calendario de Umbrales` es la tabla, no una fila— sino que lo que la tabla
 * nombra pertenezca al conjunto cerrado que la portada anuncia.
 */
/**
 * **M-G.** Se compara con `startsWith` y no con `===`. Era un string mágico
 * exacto: la celda «remisión, sin dispositivo propio (ver §4.2)» —la forma que
 * las Tasks 5–7 van a querer escribir cuando la Sección 4 exista— se ponía roja
 * como si nombrara un catorceavo dispositivo. El prefijo es la declaración; lo
 * que venga detrás es el puntero, y un puntero no es un dispositivo nuevo.
 */
const DISPOSITIVO_POR_REMISION = 'remisión, sin dispositivo propio';

/** 0–20 en letras: la prosa del corpus escribe los conteos estructurales así. */
const EN_LETRAS = [
  'cero', 'una', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve', 'diez',
  'once', 'doce', 'trece', 'catorce', 'quince', 'dieciséis', 'diecisiete', 'dieciocho',
  'diecinueve', 'veinte',
];

/**
 * La tabla que hace honesta la arquitectura. La columna «quién la ocupa hoy» es
 * obligatoria y es lo que impide que PLANARCO se presente como si el territorio
 * del arco estuviera vacío: no lo está.
 *
 * Lo que se verifica, y por qué cada cosa:
 *
 * - **Una sola tabla, y todas sus filas.** Lo cierra `filasDeTabla()`, arriba.
 * - **Cantidad de estaciones**, contra la constante. Borrar una fila entera es
 *   la manera más barata de hacer desaparecer un ocupante incómodo.
 * - **Cuatro celdas llenas por fila.** La columna del ocupante es la única que
 *   se puede dejar en blanco sin que el renglón se note, y es la importante.
 * - **Los ocupantes existen.** Cada `PLANXXX` de la columna tiene que tener
 *   documento en el taller. Y PLANARCO no puede ocuparse a sí mismo.
 * - **El conteo de la prosa sale de la tabla.** Es el chequeo que importa: el
 *   plan del tramo dice «nueve estaciones tienen ocupante previo» y su propio
 *   hallazgo C-9 enumera cuatro territorios, así que el número heredado no lo
 *   deriva nada. Acá la guardia cuenta las filas con ocupante y exige que la
 *   sección escriba ESE número, en letras. Si mañana se agrega una estación
 *   ocupada y nadie toca la prosa, la guardia se pone roja.
 */
function verificarCalendarioDeUmbrales(lineas: string[]): string[] {
  const { filas, errores } = filasDeTabla(lineas, COLUMNAS_CALENDARIO);
  if (filas === null) {
    if (errores.length === 0) {
      errores.push(
        `falta la tabla del Calendario de Umbrales, con las columnas [${COLUMNAS_CALENDARIO.join(' · ')}]: ` +
          'el Calendario no es un dispositivo, es la arquitectura, y sin la tabla la SECCIÓN 3 es un ensayo',
      );
    }
    return errores;
  }

  if (filas.length !== ESTACIONES_ESPERADAS) {
    errores.push(
      `el Calendario de Umbrales tiene ${String(filas.length)} estación(es) y se esperaban ` +
        `${String(ESTACIONES_ESPERADAS)}: borrar una fila es la manera más barata de hacer desaparecer ` +
        'un ocupante previo, y la cuenta de la prosa se deriva de esta tabla',
    );
  }

  const existentes = planesDelTaller();
  let ocupadas = 0;
  /** Los PLANes DISTINTOS que ocupan alguna estación: la prosa dice cuántos son. */
  const documentosOcupantes = new Set<string>();
  /** Fragmentos de ocupante de la fila más poblada: la prosa dice cuántos son. */
  let maxOcupantesEnUnaFila = 0;
  filas.forEach((fila, k) => {
    const donde = `la estación ${String(k + 1)} del Calendario («${(fila[0] ?? '').slice(0, 40)}»)`;
    if (fila.length !== COLUMNAS_CALENDARIO.length) {
      errores.push(
        `${donde} tiene ${String(fila.length)} celda(s) y la tabla tiene ` +
          `${String(COLUMNAS_CALENDARIO.length)} columnas`,
      );
      return;
    }
    if (fila.some((c) => c === '')) {
      errores.push(
        `${donde} tiene una celda vacía: «${fila.join(' | ')}». La columna del ocupante es la única ` +
          'que se puede dejar en blanco sin que el renglón se note, y es la que hace honesta la tabla',
      );
      return;
    }

    // M13: el dispositivo del arco sale del conjunto cerrado de la portada.
    const dispositivo = fila[2];
    if (!dispositivo.startsWith(DISPOSITIVO_POR_REMISION)) {
      const conocido = DISPOSITIVOS_EN_PORTADA.some((d) =>
        d.enPortada.some((frag) => dispositivo.includes(frag)),
      );
      if (!conocido) {
        errores.push(
          `${donde} nombra el dispositivo «${dispositivo}», que no está entre los trece de la portada: ` +
            'la portada se declara conjunto exacto, así que un dispositivo que solo vive en la tabla ' +
            `es un catorceavo por la puerta de atrás (o «${DISPOSITIVO_POR_REMISION}» si no tiene uno propio)`,
        );
      }
    }

    const ocupante = fila[3];
    if (ocupante === SIN_OCUPANTE) return;

    // Crítico 2: cada ocupante trae ancla, y el ancla se resuelve contra el destino.
    const fragmentos = ocupante.split('·');
    maxOcupantesEnUnaFila = Math.max(maxOcupantesEnUnaFila, fragmentos.length);
    for (const frag of fragmentos) {
      const err = resolverAncla(frag);
      if (err !== null) errores.push(`${donde} ${err}`);
    }

    const nombrados = [...ocupante.matchAll(/PLAN[A-Z0-9]+/g)].map((m) => m[0]);
    if (nombrados.length === 0) {
      errores.push(
        `${donde} declara ocupante «${ocupante}» y no nombra ningún PLAN: o la estación tiene ` +
          `ocupante con nombre de PLAN, o lleva «${SIN_OCUPANTE}»`,
      );
      return;
    }
    for (const p of nombrados) {
      if (p === 'PLANARCO') {
        errores.push(`${donde} se declara ocupada por PLANARCO: la columna dice quién la ocupa HOY`);
      } else if (!existentes.has(p)) {
        errores.push(
          `${donde} nombra a «${p}» como ocupante y no hay documento suyo en el taller: ` +
            'un ocupante inventado es una remisión falsa',
        );
      } else {
        documentosOcupantes.add(p);
      }
    }
    ocupadas += 1;
  });

  const { tramo, errores: errTramo } = tramoDeSeccion(lineas, H2_CALENDARIO);
  errores.push(...errTramo);
  if (tramo !== null) {
    const texto = tramo.join('\n');
    for (const { frase, porQue } of frasesDerivadasDelCalendario(
      ocupadas,
      filas.length,
      documentosOcupantes.size,
      maxOcupantesEnUnaFila,
    )) {
      if (!dice(texto, frase)) {
        errores.push(`la SECCIÓN 3 no dice «${frase}»: ${porQue}`);
      }
    }
  }

  return errores;
}

/**
 * **La séptima forma del arquetipo de esta guardia**, y la más fina de las
 * siete: *el arreglo se aplicó al número que estaba mal y no a los que nacieron
 * del arreglo.*
 *
 * La Task 4 le enseñó a la guardia a derivar UN número de la tabla —las
 * estaciones con ocupante— y a exigirlo en la prosa. Después §3.3 creció **tres
 * números más de la misma tabla** y ninguno se derivó. Reproducido antes de
 * escribir esto, los tres salían **exit 0**:
 *
 * | Mutación | Resultado |
 * |---|---|
 * | `Son diez documentos` → `Son cuatro documentos` | exit 0 |
 * | `Solo dos filas llevan guion` → `Solo siete filas llevan guion` | exit 0 |
 * | `cuatro ocupantes, tres de plata` → `nueve ocupantes, ocho de plata` | exit 0 |
 *
 * El titular seguía diciendo «16 estaciones parseadas… y sus ocupantes resueltos
 * ancla por ancla» mientras tres cuartas partes de la aritmética que la sección
 * saca de esa tabla no las miraba nadie.
 *
 * Se exige el par número-sustantivo y no la oración entera, a propósito: la
 * prosa se puede reescribir sin que la guardia se ponga roja sobre prosa
 * honesta, y el número sigue teniendo que salir de la tabla.
 *
 * Lo que NO deriva, y va dicho para que nadie lo suponga derivado: «tres de
 * plata» de la misma frase es una clasificación semántica —qué ocupante paga y
 * cuál es un rol— y ninguna columna la trae. Eso lo mira la revisión.
 */
function frasesDerivadasDelCalendario(
  ocupadas: number,
  total: number,
  documentos: number,
  maxEnUnaFila: number,
): { frase: string; porQue: string }[] {
  const letra = (n: number): string => EN_LETRAS[n] ?? String(n);
  return [
    {
      frase: `${letra(ocupadas)} de las ${letra(total)} estaciones`,
      porQue:
        'el conteo de estaciones con ocupante previo se deriva de la tabla y no se hereda. El plan ' +
        'del tramo dice «nueve» y su propio hallazgo C-9 enumera cuatro territorios: un número que ' +
        'no sale de ninguna cuenta es una cifra estrenada',
    },
    {
      frase: `${letra(documentos)} documentos`,
      porQue:
        'los PLANes DISTINTOS que ocupan alguna estación salen de `new Set()` sobre la cuarta ' +
        'columna. El censo ya pasó de cinco a diez una vez: el número que resume la tabla no puede ' +
        'quedar escrito a mano mientras la tabla se mueve',
    },
    {
      frase: ocupadas === total - 1 ? 'una fila lleva guion' : `${letra(total - ocupadas)} filas llevan guion`,
      porQue:
        'las vacantes son `filas.length - ocupadas` y la prosa las nombra una por una. Sumar un ' +
        'ocupante sin tocar esta frase deja la sección afirmando una vacante que la tabla ya llenó',
    },
    {
      frase: maxEnUnaFila === 1 ? 'un ocupante' : `${letra(maxEnUnaFila)} ocupantes`,
      porQue:
        'la estación más poblada del Calendario es la que obliga a §3.3 a escribir la excepción a la ' +
        'regla de remisión, y su población es el conteo de fragmentos de esa celda',
    },
  ];
}

/**
 * El tramo de líneas de una sección: de su H2 al siguiente H2, o al fin del archivo.
 *
 * Toma EL H2, no UNO de los H2 que coincidan. Con `findIndex` tomaba el primero,
 * y eso lo volvía truncable exactamente como la portada: un H2 señuelo plantado
 * antes del real —tres pares triviales de `*Pidió:*`/`*Dio:*`, u ocho `### 0.N`
 * mínimos— hacía que la anatomía se verificara sobre el señuelo, que la sección
 * real quedara sin mirar y que la línea de éxito informara «precedentes en dos
 * columnas balanceadas» y «8 fallas correlativas» sin haber verificado nada.
 *
 * Es la tercera instancia del mismo arquetipo en esta guardia; las dos primeras
 * fueron de la portada (`iAbre` tomando UNA portada, y los mojones de región que
 * colapsaban en un tramo vacío). La doctrina ya la fijó `verificarCabecera()`
 * con las cercas: **si el ancla no es única, el chequeo no corre y lo dice**.
 * Un chequeo truncable que reporta éxito es peor que no tenerlo.
 */
function tramoDeSeccion(
  lineas: string[],
  h2: string,
): { tramo: string[] | null; desde: number; errores: string[] } {
  const indices: number[] = [];
  lineas.forEach((l, k) => {
    if (l.trim() === h2) indices.push(k);
  });
  // La ausencia ya la reporta el chequeo de SECCIONES_ESPERADAS: acá no se duplica.
  if (indices.length === 0) return { tramo: null, desde: -1, errores: [] };
  if (indices.length > 1) {
    return {
      tramo: null,
      desde: -1,
      errores: [
        `«${h2}» aparece ${String(indices.length)} veces (líneas ${indices.map((k) => String(k + 1)).join(', ')}) ` +
          'y el H2 de una sección es UNO: con un señuelo plantado antes, la anatomía se verifica sobre ' +
          'el señuelo y la sección real no la mira nadie',
      ],
    };
  }
  const i = indices[0];
  const j = lineas.findIndex((l, k) => k > i && l.startsWith('## '));
  return {
    tramo: lineas.slice(i + 1, j === -1 ? lineas.length : j),
    desde: i + 1,
    errores: [],
  };
}

/**
 * El texto que vive bajo un domicilio: `(cabecera)` es el tramo anterior al
 * primer H2; cualquier otra etiqueta es un encabezado —H2 o H3— y su tramo va
 * hasta el siguiente encabezado del MISMO nivel o de uno superior.
 *
 * Si el encabezado no existe o aparece más de una vez, el chequeo **no corre y
 * lo dice**: la misma doctrina que `tramoDeSeccion()`. Un domicilio ambiguo que
 * devuelve el primer tramo es un chequeo truncable, y la guardia ya tuvo cinco.
 */
function textoDeDomicilio(
  lineas: string[],
  etiqueta: string,
): { texto: string | null; errores: string[] } {
  if (etiqueta === CABECERA) {
    const iH2 = lineas.findIndex((l) => l.startsWith('## '));
    return { texto: lineas.slice(0, iH2 === -1 ? lineas.length : iH2).join('\n'), errores: [] };
  }

  const nivel = /^#+/.exec(etiqueta)?.[0].length ?? 0;
  if (nivel === 0) {
    return { texto: null, errores: [`domicilio mal escrito en la guardia: «${etiqueta}»`] };
  }
  /**
   * Un domicilio que termina en espacio es un PREFIJO: `### 0.6 ` domicilia por
   * el número del H3 y no por su título. El resto se compara exacto, como antes.
   * La unicidad se exige igual en los dos casos, así que el prefijo no reabre la
   * puerta del chequeo truncable: si dos H3 empiezan igual, el chequeo no corre
   * y lo dice.
   */
  const porPrefijo = etiqueta.endsWith(' ');
  const indices: number[] = [];
  lineas.forEach((l, k) => {
    const t = l.trim();
    if (porPrefijo ? t.startsWith(etiqueta) : t === etiqueta) indices.push(k);
  });
  if (indices.length === 0) {
    return { texto: null, errores: [`falta el domicilio «${etiqueta}», donde viven cifras canónicas`] };
  }
  if (indices.length > 1) {
    return {
      texto: null,
      errores: [
        `el domicilio «${etiqueta}» aparece ${String(indices.length)} veces ` +
          `(líneas ${indices.map((k) => String(k + 1)).join(', ')}): con un señuelo plantado antes, ` +
          'la cifra se busca en el señuelo y el tramo real no lo mira nadie',
      ],
    };
  }
  const i = indices[0];
  const corte = new RegExp(`^#{1,${String(nivel)}} `);
  const j = lineas.findIndex((l, k) => k > i && corte.test(l));
  return { texto: lineas.slice(i + 1, j === -1 ? lineas.length : j).join('\n'), errores: [] };
}

/** Cuenta ocurrencias literales, sin regex: los valores traen `.`, `%` y `–`. */
function contar(texto: string, valor: string): number {
  return texto.split(valor).length - 1;
}

/**
 * El texto de un domicilio SIN sus encabezados ni sus filas de tabla. Ver R-5
 * en `verificarValoresConDomicilio()`: un valor que vive en un título se cubre
 * a sí mismo, y retitular un H3 —operación normal— rompería el conteo.
 */
function soloProsa(texto: string): string {
  return texto
    .split('\n')
    .filter((l) => !l.trimStart().startsWith('#') && !esFilaDeTabla(l))
    .join('\n');
}

/**
 * **Una frase derivada de una tabla se busca con bordes de palabra, no con
 * `includes()`.** Encontrado rompiendo, y es la novena forma del arquetipo:
 * cambiar la confianza de una fila de `media` a `alta` hacía que la frase
 * derivada pasara de «ninguna de confianza alta» a «una de confianza alta»…
 * que es **subcadena de la anterior** —«ning*una de confianza alta*»—, así que
 * el documento sin tocar seguía satisfaciendo la frase nueva y la mutación
 * salía **exit 0**. El chequeo que existe para atrapar una fila estrenada se
 * cubría a sí mismo por accidente ortográfico.
 *
 * El mismo riesgo lo tienen las frases del Calendario —«un ocupante» adentro de
 * «algun ocupante», «dos documentos» adentro de «ciendos documentos»— así que
 * los dos juegos pasan por acá. Los bordes son de LETRA, no `\b`: `\b` no
 * entiende que la `ñ` de «años» o la `é` de «régimen» son letras.
 */
function dice(texto: string, frase: string): boolean {
  const escapada = frase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`(?<!\\p{L})${escapada}(?!\\p{L})`, 'u').test(texto);
}

/**
 * Cifras y aserciones, cada una buscada EN SU DOMICILIO y no en el archivo
 * entero. Ver el comentario largo de CIFRAS_CANONICAS: hasta la Task 4 los dos
 * bucles corrían `raw.includes()` sobre todo el documento y cinco valores
 * duplicados se cubrían entre sí.
 *
 * Lo que este arreglo NO cierra, y va escrito para que nadie lo suponga
 * cerrado: un valor que aparezca dos veces adentro del MISMO domicilio sigue
 * cubriéndose a sí mismo salvo que su entrada declare `veces`. La granularidad
 * es el encabezado, no el párrafo.
 *
 * ── R-5: `veces: N` cuenta OCURRENCIAS, y lo que hacía falta era LA ocurrencia ─
 *
 * El cierre por `veces: 2` de la declaración de `:548` tapaba el caso y dejaba
 * la clase abierta en las dos direcciones, y las dos se midieron:
 *
 * - **Falso negativo:** borrar la declaración y escribir la frase una vez más
 *   en cualquier lugar de §5 sale **exit 0**. Con una de las dos ocurrencias
 *   viviendo en el TÍTULO del H3 5.4, alcanza una repetición casual de cinco
 *   palabras para tapar el borrado.
 * - **Falso positivo esperando:** si una tarea futura retitula el H3 5.4
 *   —operación normal— el conteo cae a 1 y la guardia se pone roja con la
 *   declaración intacta.
 *
 * **El arreglo es estructural y no por entrada: se descuentan del domicilio las
 * líneas de encabezado y las de tabla antes de contar.** Un título nombra el
 * criterio; la prosa es la que lo declara, y es la prosa la que este juego
 * existe para custodiar. Medido sobre los 43 valores domiciliados: con la
 * exclusión puesta, los 43 siguen pasando sobre prosa sola —salvo el que la
 * exclusión existe para destapar, que vuelve a `veces: 1`—, así que el cambio
 * elimina la clase entera en vez del caso.
 */
function verificarValoresConDomicilio(
  lineas: string[],
  lista: ValorConDomicilio[],
  clase: string,
): string[] {
  const errores: string[] = [];
  for (const { valor, en, veces, porQue } of lista) {
    const minimo = veces ?? 1;
    for (const etiqueta of en) {
      const { texto, errores: errDom } = textoDeDomicilio(lineas, etiqueta);
      errores.push(...errDom);
      if (texto === null) continue;
      const hay = contar(soloProsa(texto), valor);
      if (hay < minimo) {
        errores.push(
          `${clase} «${valor}»: se esperaba${minimo > 1 ? `n ${String(minimo)} ocurrencias` : ''} en ` +
            `«${etiqueta}» y hay ${String(hay)} — ${porQue}`,
        );
      }
    }
  }
  return errores;
}

/**
 * La SECCIÓN 0 promete OCHO fallas en su propio H2 y cada una lleva la forma de
 * PLANPACTO:96-130: `### 0.N {título}` con tres párrafos de lead en negrita.
 * Sin este chequeo se podía borrar una falla entera —o dejarla sin «El dato:»,
 * que es el párrafo que la sostiene contra el corpus— y la guardia salía verde.
 *
 * Se verifica la numeración CORRELATIVA, no la cantidad: ocho H3 numerados
 * 0.1, 0.3, 0.3, … también dan ocho.
 */
function verificarOchoFallas(lineas: string[]): string[] {
  const { tramo, errores } = tramoDeSeccion(
    lineas,
    '## SECCIÓN 0: LAS OCHO FALLAS DEL ARCO DE LA VIDA ARGENTINO',
  );
  if (tramo === null) return errores; // H2 ausente (lo reporta el chequeo de secciones) o duplicado

  const iH3: number[] = [];
  const numeros: string[] = [];
  tramo.forEach((l, k) => {
    const m = /^### 0\.(\d+) \S/.exec(l.trim());
    if (m) {
      iH3.push(k);
      numeros.push(m[1]);
    }
  });

  if (iH3.length !== FALLAS_ESPERADAS) {
    errores.push(
      `la SECCIÓN 0 tiene ${String(iH3.length)} falla(s) con forma «### 0.N {título}» y su propio H2 ` +
        `promete ${String(FALLAS_ESPERADAS)}: el título de la sección y su contenido no pueden discrepar`,
    );
  }
  numeros.forEach((n, k) => {
    if (n !== String(k + 1)) {
      errores.push(
        `la falla número ${String(k + 1)} de la SECCIÓN 0 está numerada «0.${n}»: la numeración es ` +
          'correlativa desde 0.1, y ocho H3 mal numerados también suman ocho',
      );
    }
  });

  // Los tres leads, adentro de cada falla y no en cualquier lado de la sección.
  iH3.forEach((inicio, k) => {
    const fin = k + 1 < iH3.length ? iH3[k + 1] : tramo.length;
    const cuerpo = tramo.slice(inicio + 1, fin).join('\n');
    for (const lead of LEADS_DE_FALLA) {
      if (!cuerpo.includes(lead)) {
        errores.push(
          `la falla «${tramo[inicio].trim()}» no trae el lead «${lead}»: la forma de PLANPACTO:96-130 ` +
            'son tres párrafos, y «El dato:» es el que ata la falla al corpus',
        );
      }
    }
  });

  return errores;
}

/**
 * La SECCIÓN 2 es la que DEFIENDE al PLAN, y por eso es la que menos se revisa:
 * fue el hallazgo Crítico del tramo B, donde los precedentes se enumeraron por
 * lo que PIDIERON y nadie escribió lo que DIERON — y dos de ellos sí traían la
 * característica que el documento invocaba como diferencia propia.
 *
 * El arreglo editorial de PLANPACTO:226-232 fue marcar las dos columnas con
 * `*Pidió:*` y `*Dio:*` en el propio texto. Acá se verifica que estén, que sean
 * al menos tres pares —un precedente solo no es una sección— y que estén
 * BALANCEADAS: la falla real es escribir la primera columna y olvidar la
 * segunda, y eso se detecta contando, no buscando.
 *
 * El balance se exige ADENTRO DE CADA PÁRRAFO, y esa granularidad es el arreglo
 * de la Task 4. Antes se exigía adentro de cada H3, y esa era la CUARTA forma
 * del defecto de esta guardia: **la unidad del chequeo no coincidía con la
 * unidad verificada.** §2.4 lleva DOS precedentes bajo un solo H3 —la AUH y el
 * PAMI—, así que el H3 los compensa entre sí igual que el total de la sección
 * compensaba a los H3. Verificado: sacándole el `*Dio:*` a la AUH y poniéndole
 * uno de más al PAMI, el H3 cierra 2 y 2 y salía **exit 0** — con la AUH
 * enumerada por lo que pidió sin lo que dio, que es el Crítico exacto del tramo
 * anterior, pasando en verde.
 *
 * El párrafo es la unidad real: un precedente se escribe en un párrafo, y los
 * cinco pares del documento viven uno por línea. La sección entera se trocea,
 * incluidos el encabezado y las líneas sueltas: un `*Pidió:*` huérfano en
 * cualquier lado no puede quedar fuera del conteo.
 */
const PARES_MINIMOS_DE_PRECEDENTE = 3;

function verificarPrecedentesEnDosColumnas(lineas: string[]): string[] {
  const { tramo, desde, errores } = tramoDeSeccion(
    lineas,
    '## SECCIÓN 2: PRECEDENTES INTERNACIONALES Y LOCALES',
  );
  if (tramo === null) return errores;

  // Párrafos: bloques de líneas no vacías separados por líneas en blanco.
  const parrafos: { texto: string; linea: number }[] = [];
  let actual: string[] = [];
  let inicio = 0;
  const cerrar = (): void => {
    if (actual.length > 0) parrafos.push({ texto: actual.join('\n'), linea: desde + inicio + 1 });
    actual = [];
  };
  tramo.forEach((l, k) => {
    if (l.trim() === '') {
      cerrar();
      return;
    }
    if (actual.length === 0) inicio = k;
    actual.push(l);
  });
  cerrar();

  let pidioTotal = 0;
  for (const { texto, linea } of parrafos) {
    const pidio = (texto.match(/\*Pidió:\*/g) ?? []).length;
    const dio = (texto.match(/\*Dio:\*/g) ?? []).length;
    pidioTotal += pidio;
    if (dio !== pidio) {
      errores.push(
        `el párrafo de la línea ${String(linea)} marca ${String(pidio)} «*Pidió:*» y ${String(dio)} ` +
          '«*Dio:*»: la falla del tramo B fue enumerar lo que un antecedente pidió sin escribir lo que ' +
          'dio, y el balance se exige por PÁRRAFO porque §2.4 lleva dos precedentes bajo un solo H3 y ' +
          'el H3 los compensa entre sí. Si un «Dio» no se pudo verificar, se escribe declarándolo ' +
          '—el patrón de PLANPACTO:230— y la columna igual existe',
      );
    }
  }

  if (pidioTotal < PARES_MINIMOS_DE_PRECEDENTE) {
    errores.push(
      `la SECCIÓN 2 marca ${String(pidioTotal)} «*Pidió:*» y se esperaban al menos ` +
        `${String(PARES_MINIMOS_DE_PRECEDENTE)}: cada precedente se lee en dos columnas declaradas`,
    );
  }

  return errores;
}

/**
 * La anatomía de la cabecera: H1, H3 de versión y portada ASCII con los trece
 * dispositivos adentro. Sin esto se podía borrar la portada entera y salir 0.
 */
function verificarCabecera(raw: string, lineas: string[]): string[] {
  const errores: string[] = [];

  const iH1 = lineas.findIndex((l) => H1_ESPERADO.test(l.trim()));
  if (iH1 === -1) {
    errores.push(
      'falta el H1 del documento («# PLANARCO — {título}»): la anatomía de PLANPACTO lo pone ' +
        'entre el `---` de la cabecera y el H2 del mandato',
    );
  }

  const iMandato = lineas.findIndex((l) => l.trim() === H2_MANDATO);
  const iVersion = lineas.findIndex((l) => H3_VERSION_ESPERADO.test(l.trim()));
  if (iVersion === -1) {
    errores.push(
      'falta el H3 de versión («### Versión 1.0 — Julio 2026»), que va entre el H2 del mandato y la portada',
    );
  }

  // El brief manda el ORDEN, no solo la existencia: con el chequeo anterior se
  // podía mover el H1 al final del archivo y salir 0. La portada ya se busca
  // desde el H3 en adelante; esto cierra la mitad que faltaba.
  if (iH1 !== -1 && iMandato !== -1 && iH1 > iMandato) {
    errores.push(
      `el H1 está en la línea ${String(iH1 + 1)}, después del H2 del mandato (línea ${String(iMandato + 1)}): ` +
        'el orden de la anatomía es H1 → H2 del mandato → H3 de versión → portada',
    );
  }
  if (iMandato !== -1 && iVersion !== -1 && iMandato > iVersion) {
    errores.push(
      `el H2 del mandato está en la línea ${String(iMandato + 1)}, después del H3 de versión ` +
        `(línea ${String(iVersion + 1)}): el orden de la anatomía es H1 → H2 del mandato → H3 de versión → portada`,
    );
  }

  // La portada es el primer bloque cercado después del H3 de versión: buscarla
  // desde ahí verifica presencia y orden de una sola vez.
  const desde = iVersion === -1 ? 0 : iVersion + 1;

  // `iAbre` toma UNA portada, no LA portada: con una copia legítima plantada
  // arriba, el conjunto exacto se verificaba sobre la copia y la portada real
  // —contaminada con los dispositivos que se quisiera— no la miraba nadie. Es
  // el mismo modo de falla que la Task 4 tiene anotado para `filasDeTabla()`.
  // El tramo de la portada va del H3 de versión al primer H2 del cuerpo y ahí
  // adentro tiene que haber EXACTAMENTE dos cercas; acotado a propósito, porque
  // las Secciones 3 y siguientes traen bloques cercados propios que no son
  // asunto de este chequeo.
  const iCuerpo = lineas.findIndex((l, j) => j >= desde && l.startsWith('## '));
  const finTramo = iCuerpo === -1 ? lineas.length : iCuerpo;
  const cercas = lineas.slice(desde, finTramo).filter((l) => l.trim() === '```').length;
  if (cercas !== 2) {
    errores.push(
      `entre el H3 de versión y el primer H2 del cuerpo hay ${String(cercas)} cerca(s) de bloque, ` +
        'y tienen que ser exactamente dos: la portada es UNA. Con más de un bloque cercado, el ' +
        'conjunto exacto se verifica sobre el primero y la portada real queda sin mirar',
    );
  }

  const iAbre = lineas.findIndex((l, j) => j >= desde && l.trim() === '```');
  const iCierra = iAbre === -1 ? -1 : lineas.findIndex((l, j) => j > iAbre && l.trim() === '```');
  if (iAbre === -1 || iCierra === -1) {
    errores.push(
      'falta la portada ASCII en bloque cercado después del H3 de versión. Es la página que nadie ' +
        'vuelve a mirar: si no la verifica la guardia, no la verifica nadie',
    );
    return errores;
  }

  const portada = lineas.slice(iAbre + 1, iCierra).join('\n');
  for (const { nombre, enPortada } of DISPOSITIVOS_EN_PORTADA) {
    for (const fragmento of enPortada) {
      if (!portada.includes(fragmento)) {
        errores.push(
          `la portada no anuncia «${fragmento}» (dispositivo «${nombre}»): los trece dispositivos ` +
            'del plan del tramo se anuncian todos, y no se anuncia ninguno de más',
        );
      }
    }
  }
  if (!portada.includes(INSTITUCION_EN_PORTADA)) {
    errores.push(`la portada no anuncia «${INSTITUCION_EN_PORTADA}», la institución de la Sección 8`);
  }

  errores.push(...verificarPortadaNoAnunciaDeMas(lineas.slice(iAbre + 1, iCierra)));

  return errores;
}

/**
 * La dirección contraria, y la que reventó en el tramo B: la portada anunciando
 * de MÁS. Ahí anunció cuatro nombres que no estaban en ninguna sección del plan,
 * dos de ellos cosas que el propio PLAN prohíbe.
 *
 * No hace falta el cuerpo para cerrarlo: el conjunto legítimo de nombres de la
 * portada es cerrado y conocido hoy —los trece dispositivos, sus calificadores,
 * la ANAV, el encabezado y el pie—, así que esto es un chequeo de CONJUNTO
 * EXACTO sobre el bloque cercado ENTERO. Se le resta a cada línea cada fragmento
 * permitido, del más largo al más corto, y si queda alguna letra, la portada
 * anuncia algo que nadie mandó. Sin mojones de región no hay región truncable.
 *
 * Itera la PORTADA, no la constante. Si iterara la constante, un nombre
 * inventado que se cuele en el ASCII seguiría sin verlo nadie.
 *
 * El encabezado y el pie se verifican además en la dirección barata —«¿está lo
 * que esperaba?»—, porque el mojón que se borró era lo único que exigía que
 * `Preparado para …` existiera: sin esa línea, sacarlo del documento no
 * levantaba ningún error.
 *
 * La otra dirección todavía —«el dispositivo anunciado, ¿aparece en el cuerpo?»—
 * sí necesita el cuerpo, y es de la Task 10.
 */
function verificarPortadaNoAnunciaDeMas(portada: string[]): string[] {
  const errores: string[] = [];

  for (const renglon of [...PORTADA_ENCABEZADO, ...PORTADA_PIE]) {
    if (!portada.some((l) => l.trim() === renglon)) {
      errores.push(
        `la portada no trae el renglón «${renglon}»: el encabezado y el pie son parte del conjunto ` +
          'exacto y se verifican en las dos direcciones, ni falta ni sobra',
      );
    }
  }

  const lexico = [
    ...PORTADA_ENCABEZADO,
    ...PORTADA_PIE,
    ...DISPOSITIVOS_EN_PORTADA.flatMap((d) => d.enPortada),
    ...CALIFICADORES_EN_PORTADA,
    INSTITUCION_EN_PORTADA,
  ].sort((a, b) => b.length - a.length);

  for (const linea of portada) {
    if (linea.trim() === '') continue;
    let resto = linea;
    for (const permitido of lexico) resto = resto.split(permitido).join('');
    const sobra = resto.replace(/[·\s]/gu, '');
    if (sobra !== '') {
      errores.push(
        `la portada anuncia algo que no está en los trece dispositivos del plan: «${linea.trim()}» ` +
          `→ sobra «${sobra}». En el tramo B la portada anunció cuatro nombres que no existían en ` +
          'ninguna sección: el conjunto es cerrado, ni falta ni sobra',
      );
    }
  }

  return errores;
}

function main(): void {
  let raw: string;
  try {
    raw = readFileSync(DOC, 'utf8');
  } catch {
    console.error(`No existe el documento: ${DOC}`);
    process.exit(1);
  }

  const errores: string[] = [];
  const lineas = raw.split('\n');

  /**
   * El mismo texto sin negritas, para los prohibidos. Sacar los `**` no cambia
   * el conteo de líneas —no hay saltos adentro—, así que los números de línea
   * que se reportan abajo siguen siendo los del archivo real.
   */
  const rawPlano = raw.replace(/\*\*/g, '');
  const lineasPlano = rawPlano.split('\n');

  // 1) Las secciones esperadas, presentes y en orden.
  let cursor = -1;
  for (const seccion of SECCIONES_ESPERADAS) {
    const i = lineas.findIndex((l, j) => j > cursor && l.trim() === seccion);
    if (i === -1) {
      const existeFueraDeOrden = lineas.some((l) => l.trim() === seccion);
      errores.push(
        existeFueraDeOrden
          ? `«${seccion}» está, pero fuera de orden (se esperaba después de la anterior)`
          : `falta la sección «${seccion}»`,
      );
      continue;
    }
    cursor = i;
  }

  // 2) Las cifras canónicas y las aserciones obligatorias, EN SU DOMICILIO.
  errores.push(...verificarValoresConDomicilio(lineas, CIFRAS_CANONICAS, 'cifra canónica'));
  errores.push(
    ...verificarValoresConDomicilio(lineas, ASERCIONES_OBLIGATORIAS, 'aserción obligatoria'),
  );
  // 2 bis) El recíproco del domicilio: una cifra canónica contradicha AFUERA.
  errores.push(...verificarFamiliasDeCifra(lineas));

  // 3) Los prohibidos, sobre el texto sin negritas.
  for (const { patron, porQue, salvoSi } of PROHIBIDOS) {
    const global = new RegExp(patron.source, patron.flags.includes('g') ? patron.flags : `${patron.flags}g`);
    let m: RegExpExecArray | null;
    while ((m = global.exec(rawPlano)) !== null) {
      const nLinea = rawPlano.slice(0, m.index).split('\n').length;
      const linea = lineasPlano[nLinea - 1] ?? '';
      if (salvoSi && salvoSi.test(linea)) continue;
      errores.push(`línea ${String(nLinea)}: «${m[0]}» está prohibido — ${porQue}`);
    }
  }

  // 4) Las tablas: parseadas y cruzadas contra el canon, no buscadas como string.
  errores.push(...verificarTablas(lineas));

  // 5) La cabecera de auditoría, una sola vez y al principio.
  const cabeceras = lineas.filter((l) => l.startsWith('> **CANONICAL_ARCHITECTURE:**')).length;
  if (cabeceras !== 1) {
    errores.push(`se esperaba 1 línea CANONICAL_ARCHITECTURE en la cabecera, hay ${String(cabeceras)}`);
  }

  // 6) El desfasaje ordinal/mandato se declara: ordinal 24, mandato 25.
  if (!/> \*\*ORDINAL Y MANDATO:\*\*[^\n]*\(24\)[^\n]*\(25\)/.test(raw)) {
    errores.push(
      'la cabecera no declara el desfasaje ordinal (24) / mandato (25), que es convención de todo el corpus',
    );
  }

  // 7) La anatomía de la cabecera: H1, H3 de versión y portada.
  errores.push(...verificarCabecera(raw, lineas));

  // 8) La anatomía del diagnóstico: ocho fallas con sus tres leads, y los
  //    precedentes leídos en dos columnas.
  errores.push(...verificarOchoFallas(lineas));
  errores.push(...verificarPrecedentesEnDosColumnas(lineas));

  // 9) Las anclas de la PROSA, abiertas una por una contra su documento.
  const prosa = verificarAnclasDeProsa(lineas);
  errores.push(...prosa.errores);

  if (errores.length > 0) {
    console.error(`La guardia de PLANARCO encontró ${String(errores.length)} problema(s):\n`);
    for (const e of errores) console.error(`  · ${e}`);
    process.exit(1);
  }

  console.log(
    `PLANARCO OK: ${String(SECCIONES_ESPERADAS.length)} sección(es) esperada(s), ` +
      `${String(CIFRAS_CANONICAS.length)} cifras canónicas en su domicilio y ` +
      `${String(FAMILIAS_DE_CIFRA.length)} familias barridas afuera de él, ` +
      `${String(ASERCIONES_OBLIGATORIAS.length)} aserciones obligatorias, ` +
      `${String(PROHIBIDOS.length)} patrones prohibidos, ${String(DISPOSITIVOS_EN_PORTADA.length)} dispositivos en portada ` +
      '(conjunto exacto: ni falta ni sobra), ' +
      `${String(FALLAS_ESPERADAS)} fallas correlativas con sus ${String(LEADS_DE_FALLA.length)} leads, ` +
      'precedentes en dos columnas balanceadas adentro de cada PÁRRAFO, ' +
      `Calendario de Umbrales con ${String(ESTACIONES_ESPERADAS)} estaciones parseadas, sus dispositivos ` +
      'cruzados contra los trece de la portada y sus ocupantes resueltos ancla por ancla contra el ' +
      'archivo destino, ' +
      'tabla de fuentes contigua con sus clases cruzadas contra SOURCE_OF_FUNDS_LEDGER.md, cada fila ' +
      'anclada cruzada contra SU línea del libro mayor (dueño, confianza, disponibilidad y clase) y ' +
      `sin una sola fila \`${CLASE_PROHIBIDA}\`, ` +
      `${String(prosa.resueltas)} anclas de la prosa abiertas y resueltas contra su documento ` +
      '(todo token con forma de ancla que la guardia no sepa leer se reporta, no se descarta, y la ' +
      'remisión corta corre SOLO contra un ancla completa de su misma oración), ' +
      `${String(lineas.length)} líneas. Sin piso constitucional propio, cruzado contra PISOS_SEGUN_EL_TALLER.`,
  );
}

main();
