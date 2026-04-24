export type ProposalType = 'carta' | 'peticion' | 'proyecto';

export interface ProposalFact {
  label: string;
  value: string;
}

export interface ProposalArticle {
  number: string;
  heading: string;
  body: string[];
  bullets?: string[];
}

export interface ProposalRoadmapPhase {
  phase: string;
  window: string;
  action: string;
}

export interface FullProposal {
  type: ProposalType;
  kicker: string;
  title: string;
  addressee: string;
  territory: string;
  level: 'Provincial' | 'Municipal' | 'Nacional';
  date: string;
  voiceCount: number;
  convergenceHeadline: string;
  diagnosis: {
    heading: string;
    body: string[];
    facts: ProposalFact[];
  };
  foundation: {
    heading: string;
    principle: string;
    body: string[];
  };
  articlesLabel: string;
  articles: ProposalArticle[];
  roadmap: ProposalRoadmapPhase[];
  accountability: {
    heading: string;
    body: string[];
  };
  closing: {
    callToAction: string;
    signatureLine: string;
  };
}

// ─── Córdoba — Carta Ciudadana Abierta ───────────────────────────────────────

const cordobaProposal: FullProposal = {
  type: 'carta',
  kicker: 'Carta ciudadana abierta',
  title: 'Al Gobernador de Córdoba: sobre un mandato que exige respuesta',
  addressee: 'Sr. Gobernador de la Provincia de Córdoba',
  territory: 'Córdoba',
  level: 'Provincial',
  date: '23 de abril de 2026',
  voiceCount: 5200,
  convergenceHeadline:
    '5.200 cordobeses convergieron en tres prioridades. La provincia respondió a una, contradijo otra y ignoró la tercera.',
  diagnosis: {
    heading: 'Diagnóstico: lo que el mandato pidió y lo que la provincia hizo',
    body: [
      'Cinco mil doscientas voces cordobesas atravesaron el proceso de mandato territorial. No se trata de una encuesta ni de una consulta informal: es una deliberación convergente, con datos trazables, sobre qué prioridades deben guiar la acción del gobierno provincial.',
      'El resultado es claro. La convergencia supera el 70% en tres ejes — Salud y Vida (87%), Economía y Recursos (74%) y Desarrollo Humano (71%). En ningún caso estamos frente a una pluralidad dispersa: estamos frente a un mandato inequívoco.',
      'La provincia respondió con inversión hospitalaria (18% del presupuesto) alineada al eje Salud. Lo reconocemos y lo celebramos. Pero en Economía y Recursos, el 25% del presupuesto provincial se destinó a subsidiar grandes productores — una política que contradice directamente el mandato de priorizar la economía local y el empleo. Y en Desarrollo Humano, tercer eje convergente, no existe asignación presupuestaria ni programa activo.',
    ],
    facts: [
      { label: 'Voces convergentes', value: '5.200' },
      { label: 'Convergencia promedio', value: '77%' },
      { label: 'Ejes desalineados', value: '1 de 3' },
      { label: 'Ejes sin acción', value: '1 de 3' },
      { label: 'Índice de Alineación', value: '45 / 100' },
    ],
  },
  foundation: {
    heading: 'Fundamento: el principio que está en juego',
    principle:
      'Cuando el pueblo converge en una prioridad, el subsidio público que contradice esa prioridad no es neutral: es una transferencia desde la voluntad popular hacia intereses privados.',
    body: [
      'Dos principios ordenan esta carta. El primero: la ausencia de asignación también es una decisión. Un eje con 71% de convergencia que recibe cero pesos del presupuesto provincial es, en términos fácticos, un eje rechazado por el gobierno. La omisión no es inocente; es posición.',
      'El segundo: la proporcionalidad presupuestaria es la forma mínima de respeto al mandato. Cuando el 74% del pueblo converge en economía local y empleo, y el instrumento más potente del Estado provincial — el presupuesto — se gira en dirección opuesta, lo que se rompe no es una promesa electoral: se rompe el vínculo representativo.',
      'Esta carta no pide caridad ni favor. Pide coherencia entre lo que el pueblo mandó y lo que la provincia ejecuta. Pide que el dinero público exprese, y no contradiga, la voluntad pública.',
    ],
  },
  articlesLabel: 'Pedidos',
  articles: [
    {
      number: 'Pedido 1',
      heading: 'Reasignación del subsidio a grandes productores',
      body: [
        'Reasignar progresivamente el 25% del presupuesto actualmente destinado a subsidios a grandes productores hacia un Fondo de Economía Local y Empleo (FELE), con foco explícito en cooperativas, PyMEs cordobesas y empleo territorial.',
      ],
      bullets: [
        'Transición en 18 meses: 25% → 15% → 5% → 0% en tramos semestrales.',
        'El ahorro se redirige íntegramente al FELE, sin pasar por caja general.',
        'Criterios de elegibilidad del FELE publicados y auditables.',
      ],
    },
    {
      number: 'Pedido 2',
      heading: 'Piso presupuestario para Desarrollo Humano',
      body: [
        'Establecer un piso inderogable del 8% del presupuesto provincial para Desarrollo Humano, con programa activo y no como partida residual.',
      ],
      bullets: [
        'Formación profesional, educación complementaria, acceso cultural y deporte comunitario.',
        'Ejecución descentralizada por departamento, con consejos territoriales de monitoreo.',
      ],
    },
    {
      number: 'Pedido 3',
      heading: 'Informe Trimestral de Alineación al Mandato Provincial',
      body: [
        'Publicar cada trimestre un Informe de Alineación al Mandato que compare convergencia por eje con ejecución presupuestaria y actividad legislativa, en formato abierto y auditable.',
      ],
    },
    {
      number: 'Pedido 4',
      heading: 'Audiencias Públicas Territoriales obligatorias',
      body: [
        'Institucionalizar audiencias públicas territoriales antes de cada modificación presupuestaria de más del 5% en ejes con convergencia superior al 70%. No como formalidad, sino como instancia de escucha documentada.',
      ],
    },
  ],
  roadmap: [
    {
      phase: '30 días',
      window: 'Acuse de recibo',
      action:
        'Respuesta formal del Gobernador a esta carta, publicada en el Boletín Oficial provincial.',
    },
    {
      phase: '90 días',
      window: 'Primera reasignación',
      action:
        'Decreto de transición del subsidio a grandes productores hacia el FELE (tramo 1: 25% → 20%).',
    },
    {
      phase: '180 días',
      window: 'Piso de Desarrollo Humano',
      action:
        'Envío a la Legislatura del proyecto de piso presupuestario para Desarrollo Humano.',
    },
    {
      phase: '12 meses',
      window: 'Primer informe',
      action:
        'Publicación del primer Informe Trimestral de Alineación al Mandato Provincial.',
    },
  ],
  accountability: {
    heading: 'Rendición de cuentas',
    body: [
      'Esta carta no se agota en el envío. Un Consejo Ciudadano de Seguimiento, compuesto por voces de los 26 departamentos cordobeses, auditará trimestralmente el cumplimiento de los pedidos y publicará sus hallazgos. El silencio de la provincia será registrado como respuesta.',
      'Si transcurridos 180 días no existe avance sustantivo, el mandato territorial cordobés escalará al siguiente instrumento: petición pública provincial con firma convocada.',
    ],
  },
  closing: {
    callToAction:
      'Invitamos al Sr. Gobernador a responder esta carta con decisiones, no con comunicados.',
    signatureLine:
      'Firman 5.200 voces cordobesas que integraron el mandato territorial del 23 de abril de 2026.',
  },
};

// ─── La Matanza — Petición Pública ───────────────────────────────────────────

const laMatanzaProposal: FullProposal = {
  type: 'peticion',
  kicker: 'Petición pública vecinal',
  title: 'Reasignación presupuestaria: Salud y Vida al nivel del mandato',
  addressee:
    'Sr. Intendente del Municipio de La Matanza y Honorable Concejo Deliberante',
  territory: 'La Matanza',
  level: 'Municipal',
  date: '23 de abril de 2026',
  voiceCount: 3100,
  convergenceHeadline:
    '3.100 vecinos pusieron a Salud y Vida como tercera prioridad con 73% de convergencia. El presupuesto asignado es del 4%. La desproporción es de casi 20 a 1.',
  diagnosis: {
    heading: 'Diagnóstico: un mandato parcialmente cumplido',
    body: [
      'El Municipio de La Matanza respondió bien a dos de las tres prioridades expresadas por 3.100 vecinos: el eje Economía y Recursos (91% de convergencia) recibió el 22% del presupuesto municipal a través del programa de emprendedores, y el eje Comunidad y Colectivo (79%) recibió el 15% a través de los centros comunitarios barriales. Ambas decisiones están alineadas y merecen reconocimiento.',
      'El problema está en el tercer eje. Salud y Vida convergió con 73% de adhesión — prácticamente tres de cada cuatro vecinos que participaron del mandato. El presupuesto asignado es del 4% del total municipal. Lo matemático es simple: si el mandato pesa 73 y la respuesta pesa 4, el respeto a la voluntad popular está operando a un vigésimo de lo que el pueblo pidió.',
      'Esta desproporción no es un error técnico ni un olvido administrativo. Es una decisión política sobre qué cuerpos importan, qué salas de primeros auxilios se sostienen, qué turnos hospitalarios se consiguen. La salud en La Matanza no es un tema menor: es el eje donde el sufrimiento cotidiano se vuelve diagnóstico del sistema.',
    ],
    facts: [
      { label: 'Voces convergentes', value: '3.100' },
      { label: 'Convergencia en Salud', value: '73%' },
      { label: 'Presupuesto actual en Salud', value: '4%' },
      { label: 'Brecha proporcional', value: '18,25×' },
      { label: 'Índice de Alineación', value: '72 / 100' },
    ],
  },
  foundation: {
    heading: 'Fundamento: proporcionalidad como mínimo respeto',
    principle:
      'Un mandato parcialmente cumplido no es un mandato cumplido: es un mandato postergado. La proporcionalidad presupuestaria es la forma mínima de respeto al pueblo que lo emitió.',
    body: [
      'Dos alineaciones correctas no compensan una desalineación de esta magnitud. El mandato no funciona como un examen que se aprueba con dos de tres: funciona como un compromiso donde cada eje tiene derecho a respuesta proporcional a su convergencia.',
      'Pedir un piso del 12% no es pedir un máximo ni un techo: es pedir el punto mínimo donde la asignación deja de ser simbólica y empieza a ser estructural. Todo lo que quede por debajo es teatro presupuestario; todo lo que suba por encima es política pública real.',
      'Esta petición parte de un principio sencillo: el presupuesto municipal es el instrumento más honesto para medir qué prioridades existen de verdad. Lo que no se financia, no existe.',
    ],
  },
  articlesLabel: 'Puntos de la petición',
  articles: [
    {
      number: 'Punto 1',
      heading: 'Piso presupuestario del 12% para Salud y Vida',
      body: [
        'Establecer por ordenanza municipal un piso del 12% del presupuesto municipal total para el eje Salud y Vida, vigente desde el próximo ejercicio fiscal, con cláusula de indexación y mecanismo de actualización semestral.',
      ],
    },
    {
      number: 'Punto 2',
      heading: 'Consejos Barriales de Salud',
      body: [
        'Crear Consejos Barriales de Salud en cada una de las localidades del partido, con representación vecinal, profesionales sanitarios y referentes barriales, con facultad deliberativa sobre la asignación territorial del presupuesto de salud.',
      ],
      bullets: [
        'Un Consejo por localidad.',
        'Reuniones mensuales con acta pública.',
        'Autoridad vinculante sobre hasta el 20% del presupuesto de salud asignado al barrio.',
      ],
    },
    {
      number: 'Punto 3',
      heading: 'Red de Salas de Primeros Auxilios Barriales',
      body: [
        'Priorizar, dentro del nuevo piso presupuestario, la apertura de salas de primeros auxilios en los barrios sin cobertura cercana, asegurando atención básica a menos de 1,5 km de distancia para toda la población del partido.',
      ],
    },
    {
      number: 'Punto 4',
      heading: 'Auditoría vecinal trimestral',
      body: [
        'Instituir un mecanismo de auditoría vecinal trimestral sobre la ejecución del presupuesto de salud, con publicación abierta de datos, visita documentada a las salas y hospitales, y dictamen público.',
      ],
    },
  ],
  roadmap: [
    {
      phase: '45 días',
      window: 'Tratamiento legislativo',
      action:
        'Ingreso de la petición al Honorable Concejo Deliberante, con solicitud de tratamiento en comisión dentro de los 45 días.',
    },
    {
      phase: '90 días',
      window: 'Ordenanza del piso',
      action:
        'Sanción de la ordenanza de piso del 12% para el eje Salud y Vida.',
    },
    {
      phase: '120 días',
      window: 'Consejos activos',
      action:
        'Conformación de los Consejos Barriales de Salud en todas las localidades, con primera reunión constitutiva.',
    },
    {
      phase: '12 meses',
      window: 'Red de salas operativa',
      action:
        'Plan de apertura y puesta en funcionamiento de salas de primeros auxilios barriales priorizadas por los Consejos.',
    },
  ],
  accountability: {
    heading: 'Rendición de cuentas',
    body: [
      'La petición no se considerará cumplida con la sanción de la ordenanza: se considerará cumplida cuando la ejecución presupuestaria real alcance el piso comprometido. Cada trimestre, un Observatorio Vecinal independiente publicará el porcentaje efectivamente ejecutado, la comparación con el mandato y el mapa barrial de atención sanitaria.',
      'Si al cabo de un año el piso del 12% no se ha ejecutado efectivamente, esta petición escalará a iniciativa popular formal bajo la legislación municipal vigente.',
    ],
  },
  closing: {
    callToAction:
      'Invitamos al Sr. Intendente y al Concejo Deliberante a recibir esta petición en audiencia pública, con presencia vecinal y cobertura abierta.',
    signatureLine:
      'Firman 3.100 vecinos de La Matanza que integraron el mandato territorial municipal del 23 de abril de 2026.',
  },
};

// ─── Argentina — Proyecto de Ley Nacional ────────────────────────────────────

const argentinaProposal: FullProposal = {
  type: 'proyecto',
  kicker: 'Proyecto de ley nacional',
  title: 'Ley de Alineación Presupuestaria al Mandato Popular',
  addressee: 'Honorable Congreso de la Nación Argentina',
  territory: 'Argentina',
  level: 'Nacional',
  date: '23 de abril de 2026',
  voiceCount: 50000,
  convergenceHeadline:
    '50.000 ciudadanos convergieron en cinco prioridades nacionales por encima del 70%. El Estado respondió recortando salud, educación y sin legislar sobre justicia. El vínculo representativo se rompió.',
  diagnosis: {
    heading: 'Diagnóstico: cuando la respuesta es la contradicción',
    body: [
      'El mandato territorial nacional reunió 50.000 voces convergentes. No hablamos de una fracción marginal ni de un sector interesado: hablamos de la deliberación ciudadana más extensa producida en este ciclo político bajo el marco ¡BASTA!. Cinco ejes superaron el 70% de convergencia — Economía y Recursos (88%), Salud y Vida (82%), Justicia y Derechos (76%), Desarrollo Humano (73%) y Comunidad y Colectivo (69%).',
      'El Estado respondió así: recorte del 30% en partidas de salud pública, recorte del 20% en educación, desregulación económica de alineación ambigua con el mandato, y cero iniciativas legislativas o presupuestarias en Justicia y Derechos. El Índice de Alineación resultante es de 28 sobre 100 — territorio de ruptura institucional.',
      'Lo que se presenta como "ajuste" o "desregulación" en el plano técnico, en el plano democrático es otra cosa: es una decisión del Poder Ejecutivo de gobernar en dirección opuesta a la voluntad popular cuantificada y convergente. Frente a este nivel de desalineación, los mecanismos correctivos voluntarios han demostrado ser insuficientes. Se requiere un mecanismo estructural, vinculante y auditable.',
    ],
    facts: [
      { label: 'Voces convergentes', value: '50.000' },
      { label: 'Ejes con convergencia ≥70%', value: '5' },
      { label: 'Recorte en salud', value: '−30%' },
      { label: 'Recorte en educación', value: '−20%' },
      { label: 'Ejes sin acción', value: '1 de 5' },
      { label: 'Índice de Alineación', value: '28 / 100' },
    ],
  },
  foundation: {
    heading: 'Fundamento: el límite de la delegación',
    principle:
      'La democracia representativa no puede legítimamente contradecir un mandato popular cuantificado y convergente. Cuando lo hace, deja de representar y pasa a gobernar contra el pueblo.',
    body: [
      'El contrato representativo no es un cheque en blanco. Delegar la administración no equivale a ceder la soberanía. Cuando la voluntad popular se expresa con convergencia superior al 70% en cinco ejes simultáneamente, y la respuesta ejecutiva es el recorte, la inacción o la contradicción frontal, el sistema ha cruzado el umbral donde la representación se vuelve simulación.',
      'Argentina no necesita un mecanismo más de súplica ciudadana. Necesita una ley que haga estructuralmente imposible gobernar por debajo de un piso mínimo de alineación con el mandato popular convergente. No se trata de imponer políticas específicas: se trata de imponer un umbral de respeto democrático por debajo del cual el poder no puede operar legítimamente.',
      'Esta ley es el dispositivo que el ¡BASTA! demanda del Congreso: que el diseño vuelva al pueblo, que la administración quede al Estado, y que la ejecución política esté obligada — no invitada — a respetar lo diseñado.',
    ],
  },
  articlesLabel: 'Articulado',
  articles: [
    {
      number: 'Art. 1',
      heading: 'Índice de Alineación al Mandato Popular (IAMP)',
      body: [
        'Créase el Índice de Alineación al Mandato Popular (IAMP) como indicador oficial de medición trimestral de la correspondencia entre la convergencia ciudadana expresada en el mandato territorial nacional y la ejecución presupuestaria, legislativa y reglamentaria del Estado.',
      ],
      bullets: [
        'Escala de 0 a 100 puntos, desagregada por eje convergente.',
        'Metodología pública, auditable y reproducible por terceros.',
        'Publicación trimestral obligatoria en el Boletín Oficial y en formato de datos abiertos.',
      ],
    },
    {
      number: 'Art. 2',
      heading: 'Umbral crítico y suspensión decretoria',
      body: [
        'Si el IAMP agregado cae por debajo de los 40 puntos, el Poder Ejecutivo pierde la facultad de emitir decretos de necesidad y urgencia o modificaciones reglamentarias sobre las materias correspondientes a ejes desalineados, hasta tanto una ley del Congreso o la recomposición del índice restablezca la alineación.',
      ],
    },
    {
      number: 'Art. 3',
      heading: 'Defensor del Mandato Popular',
      body: [
        'Créase la figura del Defensor del Mandato Popular, con autonomía funcional, designado por dos tercios del Congreso con participación vinculante de los firmantes del mandato territorial, con mandato de seis años, con facultades de investigación, publicación y acción ante el Ministerio Público cuando detecte desviaciones estructurales.',
      ],
    },
    {
      number: 'Art. 4',
      heading: 'Audiencias parlamentarias vinculantes',
      body: [
        'Toda caída del IAMP mayor a 30 puntos en un eje convergente con peso superior al 70% obliga al Poder Ejecutivo a comparecer en audiencia parlamentaria pública dentro de los 30 días, presentar plan de recomposición y quedar sometido a votación de aprobación o rechazo del plan.',
      ],
    },
    {
      number: 'Art. 5',
      heading: 'Consulta popular vinculante por piso crítico',
      body: [
        'Si el IAMP agregado cae por debajo de 20 puntos, se activa automáticamente el mecanismo de consulta popular vinculante previsto por la ley 25.432, con pregunta referida a la continuidad del plan de gobierno sobre las materias desalineadas.',
      ],
    },
    {
      number: 'Art. 6',
      heading: 'Reglamentación y entrada en vigencia',
      body: [
        'El Poder Ejecutivo reglamentará la presente ley dentro de los 180 días de su promulgación, con participación vinculante del Consejo Federal de Mandato Territorial. La primera publicación oficial del IAMP se realizará dentro del primer trimestre del año siguiente a la reglamentación.',
      ],
    },
  ],
  roadmap: [
    {
      phase: '60 días',
      window: 'Tratamiento',
      action:
        'Ingreso del proyecto a ambas cámaras con pedido de tratamiento preferencial.',
    },
    {
      phase: '180 días',
      window: 'Sanción',
      action:
        'Aprobación de la ley por el Congreso y promulgación por el Poder Ejecutivo.',
    },
    {
      phase: '360 días',
      window: 'Reglamentación',
      action:
        'Reglamentación y constitución del Consejo Federal de Mandato Territorial.',
    },
    {
      phase: 'Primer trimestre 2027',
      window: 'IAMP operativo',
      action:
        'Publicación del primer IAMP oficial desagregado por eje y jurisdicción.',
    },
  ],
  accountability: {
    heading: 'Rendición de cuentas',
    body: [
      'El IAMP es, por diseño, el mecanismo de rendición. Es público, auditable, trimestral y legalmente vinculante. No depende de la buena voluntad del Ejecutivo ni del protagonismo opositor: depende de una fórmula que cualquier ciudadano, universidad o medio puede reproducir.',
      'Por encima del IAMP, el Defensor del Mandato Popular garantiza la existencia de un actor institucional dedicado exclusivamente a vigilar que la voluntad popular convergente no sea contradicha en silencio. El silencio administrativo será, a partir de esta ley, jurídicamente interpretado como desvío.',
    ],
  },
  closing: {
    callToAction:
      'Se invita al Congreso de la Nación a dar tratamiento preferencial a este proyecto, y al Poder Ejecutivo a acompañar su sanción como expresión mínima de respeto al mandato popular convergente.',
    signatureLine:
      'Firman 50.000 ciudadanas y ciudadanos argentinos que integraron el mandato territorial nacional del 23 de abril de 2026.',
  },
};

// ─── Registry ────────────────────────────────────────────────────────────────

export const proposalsByTerritory: Record<string, FullProposal> = {
  Córdoba: cordobaProposal,
  'La Matanza': laMatanzaProposal,
  Argentina: argentinaProposal,
};
