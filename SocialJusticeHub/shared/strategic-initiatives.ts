// Strategic Initiatives - Idealized Design proposals
// Following Russell Ackoff's methodology: Problem → Projection → Ideal Design → Backward Plan → KPIs

export type InitiativeCategory =
  | 'educacion'
  | 'economia'
  | 'justicia'
  | 'salud'
  | 'infraestructura'
  | 'tecnologia'
  | 'medio-ambiente'
  | 'cultura'
  | 'instituciones';

export interface PathStep {
  id: number;
  title: string;
  description: string;
  timeline: string;
  dependencies: string[];
  orderIndex: number;
}

export interface KPI {
  id: string;
  metric: string;
  currentValue: number;
  targetValue: number;
  unit: string;
  source?: string;
  milestones?: { date: string; targetValue: number }[];
}

export interface InitiativeSection {
  title: string;
  content: string;
  pullQuote?: string;
  stats?: { label: string; value: string }[];
}

export interface StrategicInitiative {
  slug: string;
  title: string;
  subtitle?: string;
  category: InitiativeCategory;
  summary: string;
  iconName: string;
  elProblema: InitiativeSection;
  quePasaSiNoCambiamos: InitiativeSection;
  elDisenoIdeal: InitiativeSection;
  elCamino: { overview: string; steps: PathStep[] };
  kpis: KPI[];
  tags: string[];
  relatedInitiativeSlugs?: string[];
  sources?: { title: string; url?: string }[];
}

export const STRATEGIC_INITIATIVES: StrategicInitiative[] = [
  {
    slug: 'planisv-infraestructura-suelo-vivo',
    title: 'PLANISV',
    subtitle: 'Plan Nacional para la Reconstrucción de la Infraestructura de Suelo Vivo de la Argentina',
    category: 'medio-ambiente',
    summary: 'El suelo que genera el 60–70% de los ingresos por exportaciones de Argentina se degrada aceleradamente. PLANISV propone tratar al suelo como infraestructura estratégica nacional — medible, gestionable y reconstruible — mediante ingeniería biológica y física del agua, con un retorno de inversión estimado de 8:1 a 15:1 en 10 años.',
    iconName: 'Leaf',
    elProblema: {
      title: 'El Problema',
      content: `<p>La Argentina es una de las naciones productoras de alimentos más importantes del planeta. Con 39 millones de hectáreas bajo cultivo, produce alimentos para más de 400 millones de personas — diez veces su población. Sus exportaciones agropecuarias generan entre USD 40.000 y 50.000 millones anuales, representando el 60–70% de los ingresos totales por exportaciones.</p>
<p>Esta riqueza se está liquidando. Tres décadas de monocultivo sojero intensificado, dependencia creciente de agroquímicos y extracción sistemática de capital biológico han empujado a los suelos argentinos hacia un punto de quiebre.</p>
<p>Los niveles de materia orgánica del suelo (MOS) en zonas núcleo pampeanas cayeron de un 5–6% histórico a un 2–3%. La erosión arrastra aproximadamente 130 millones de toneladas de suelo por año. La minería de nutrientes — extraer más del suelo de lo que se repone — genera un déficit de 3 a 4 millones de toneladas de nutrientes anuales.</p>
<p>La Argentina rastrea meticulosamente los flujos financieros que el suelo genera mientras ignora completamente el activo biológico que los produce. Es como monitorear la facturación de una empresa mientras se deja desintegrar la fábrica.</p>
<p>La aplicación de glifosato aumentó 14 veces desde 1996. Argentina usa ~500 millones de litros de agroquímicos anualmente. El ecosistema microbiano del suelo — la fuerza laboral biológica que hace posible la agricultura — colapsa bajo la presión química. Sin biología, los suelos no pueden ciclar nutrientes, suprimir enfermedades ni construir estructura. La química debe sustituir a la biología a un costo creciente.</p>`,
      pullQuote: 'La Argentina no tiene un pozo de petróleo debajo de sus pies. Tiene algo más valioso: un suelo vivo capaz de alimentar a 400 millones de personas. La pregunta es si lo gestionamos como infraestructura o lo liquidamos como materia prima.',
      stats: [
        { label: 'Exportaciones agro / año', value: 'USD 40-50 mil M' },
        { label: 'MOS zona núcleo (era 5-6%)', value: '2-3%' },
        { label: 'Erosión de suelo / año', value: '130M ton' },
        { label: 'Déficit de nutrientes / año', value: '3-4M ton' },
      ],
    },
    quePasaSiNoCambiamos: {
      title: '¿Qué pasa si no cambiamos?',
      content: `<p>Cada año de demora incrementa los costos de restauración en un estimado del 8–15% debido a la degradación biológica compuesta, la erosión, el agotamiento de nutrientes y la pérdida de carbono.</p>

<p><strong>Próximos 10 años — Pérdida de suelo y productividad:</strong> USD 30.000–50.000 millones acumulados en erosión de ingresos exportadores por estancamiento y caída de rendimientos. Los costos de insumos químicos escalarán USD 20.000–40.000 millones adicionales versus una línea base biológica. La irreversibilidad es alta: la regeneración del suelo superficial toma 500–1.000 años por pulgada.</p>

<p><strong>Riesgo de acceso al mercado UE:</strong> El Reglamento de Deforestación (EUDR), la estrategia Farm-to-Fork y el Mecanismo de Ajuste en Frontera por Carbono (CBAM) exigen cumplimiento de sostenibilidad. Sin infraestructura de verificación, Argentina enfrenta la pérdida potencial de USD 5.000–10.000 millones por año en exportaciones agrícolas a la UE. El acceso a mercados una vez perdido tarda años en recuperarse.</p>

<p><strong>Pasivo climático:</strong> Emisión neta continuada desde suelos agrícolas. Entre 1.000 y 2.000 millones de toneladas de CO₂e de potencial de secuestro desperdiciado en 25 años. Riesgo de incumplimiento del Acuerdo de París con bucles de retroalimentación climática.</p>

<p><strong>Colapso social rural:</strong> Aceleración de la despoblación rural, concentración de la propiedad de la tierra, pérdida de conocimiento agrícola. En 25 años: colapso estructural de las economías provinciales del interior. Las comunidades una vez perdidas no regresan.</p>

<p><strong>Próximos 25 años:</strong> USD 100.000–200.000 millones acumulados en pérdida permanente de capacidad productiva. Inseguridad hídrica estructural en regiones agrícolas núcleo. Argentina queda relegada en la economía regenerativa global emergente.</p>`,
      pullQuote: 'La intervención más barata es siempre la que comienza ahora. Cada año de demora incrementa los costos de restauración en un 8–15%.',
      stats: [
        { label: 'Pérdida exportadora (10 años)', value: 'USD 30-50 mil M' },
        { label: 'Sobregasto químico (10 años)', value: 'USD 20-40 mil M' },
        { label: 'Riesgo mercado UE / año', value: 'USD 5-10 mil M' },
        { label: 'CO₂e secuestro perdido (25 años)', value: '1.000-2.000 Mt' },
      ],
    },
    elDisenoIdeal: {
      title: 'El Diseño Ideal',
      content: `<p>El suelo argentino no es un insumo agropecuario. Es <strong>infraestructura estratégica nacional</strong>. Es el cimiento de la economía exportadora del país, de su soberanía alimentaria, de su posición climática y de los medios de vida de millones de personas. Puede medirse, gestionarse y reconstruirse con tecnologías de ingeniería biológica y física del agua.</p>

<p><strong>Tres leyes del capital edáfico:</strong></p>

<p><strong>1. Ley de Primacía Biológica:</strong> La productividad del suelo es función de la actividad biológica, no de los insumos químicos. Restaurar la biología restaura la capacidad inherente del sistema para producir su propia química. Cada peso invertido en biología del suelo se capitaliza; cada peso gastado en sustitución sintética se deprecia.</p>

<p><strong>2. Ley del Acoplamiento Agua-Biología:</strong> El agua es el principal regulador ambiental de la biología del suelo. La capacidad de retención de agua (función directa de la materia orgánica y la actividad biológica) determina si la lluvia se convierte en humedad productiva o en escorrentía destructiva.</p>

<p><strong>3. Ley de los Retornos Compuestos:</strong> El suelo sano se vuelve más sano. Cada 1% de incremento en materia orgánica mejora la retención de agua en ~80.000 litros por hectárea, aumenta el ciclado de nutrientes, reduce la erosión y crea hábitat para más biología. El sistema es autorreforzante una vez que se cruza el umbral biológico.</p>

<p><strong>PLANISV — 5 pilares estratégicos:</strong></p>
<p><strong>Pilar I — Censo Nacional de Suelo Vivo:</strong> La primera base de datos nacional de salud biológica, química y física del suelo, georreferenciada y en tiempo real.</p>
<p><strong>Pilar II — Red de Despliegue Tecnológico:</strong> Sistemas de inoculación biológica + optimización de física del agua desplegados en 4 niveles (demostración → centros regionales → escala comercial → acceso comunitario).</p>
<p><strong>Pilar III — Pagos por Resultados Verificados:</strong> Los productores obtienen pagos vinculados a mejoras medidas (+MOS, +biomasa microbiana, −insumos químicos, CO₂e secuestrado), no por adopción de prácticas.</p>
<p><strong>Pilar IV — Mercado de Carbono Agroecológico:</strong> Protocolo verificado por el Estado que permite monetizar el carbono secuestrado. Argentina como exportador de un nuevo commodity: carbono del suelo.</p>
<p><strong>Pilar V — Red de Conocimiento y Formación:</strong> Capacitación nacional de técnicos, extensionistas y productores líderes a través de la red de INTA (52 Estaciones Experimentales, 350+ Unidades de Extensión).</p>`,
      pullQuote: 'La Argentina alimenta a 400 millones de personas a partir de un suelo en el que nunca invirtió sistemáticamente. Imaginen lo que sucede cuando empezamos.',
      stats: [
        { label: 'Retorno de inversión (10 años)', value: '8:1 a 15:1' },
        { label: 'Potencial prima exportación', value: 'USD 2-5 mil M/año' },
        { label: 'Potencial créditos carbono', value: 'USD 1-3.5 mil M/año' },
        { label: 'Manufactura nacional meta', value: '70%+' },
      ],
    },
    elCamino: {
      overview: 'PLANISV se despliega en 4 fases, trabajando hacia atrás desde la visión de una Argentina con suelos reconstruidos, autofinanciada por créditos de carbono y líder global en agricultura regenerativa verificada.',
      steps: [
        {
          id: 1,
          title: 'Argentina: líder global en suelo vivo',
          description: '25+ millones de hectáreas participantes. Los ingresos por créditos de carbono superan USD 1.000 millones/año y el programa se autofinancia. Argentina es reconocida como líder global en agricultura regenerativa verificada. Las mejoras de densidad nutricional alimentaria son medibles a nivel poblacional. El capital biológico del suelo se incluye en las cuentas económicas nacionales junto al PBI. El modelo PLANISV se exporta a otras naciones latinoamericanas.',
          timeline: 'Año 6-15 — META',
          dependencies: [],
          orderIndex: 1,
        },
        {
          id: 2,
          title: 'Despliegue nacional y mercado de carbono',
          description: '1.000+ operaciones comerciales Nivel 3 y 5.000+ sitios comunitarios Nivel 4. Lanzamiento del Mercado Argentino de Carbono Agroecológico con créditos verificados por el Estado. 70%+ de manufactura nacional de equipamiento. Infraestructura de cumplimiento EUDR operativa para el 50%+ de las exportaciones a la UE. Métricas de salud del suelo integradas en seguros de cosecha y evaluaciones de riesgo bancario. Se publica el Índice Nacional de Salud del Suelo (INSS). Resultados medibles: +1,5% MOS, −30% insumos químicos, +25% eficiencia hídrica.',
          timeline: 'Año 3-6',
          dependencies: ['Argentina: líder global en suelo vivo'],
          orderIndex: 2,
        },
        {
          id: 3,
          title: 'Red regional y pagos por resultados',
          description: '300 centros regionales Nivel 2 en zonas prioritarias (Pampa Húmeda, Cuyo, NOA, NEA). Activación de Pagos por Resultados (PPR) a través del Fondo Nacional de Suelo Vivo. 1.000 sitios comunitarios Nivel 4. Alianzas de manufactura nacional (50% contenido nacional). Primer Informe Nacional Anual de Salud del Suelo con resultados verificados. Registro de protocolo de créditos de carbono con registros internacionales. 6 Centros de Excelencia regionales en facultades de agronomía. Piloto de cumplimiento EUDR con 100+ exportadores.',
          timeline: 'Año 1-3',
          dependencies: ['Despliegue nacional y mercado de carbono'],
          orderIndex: 3,
        },
        {
          id: 4,
          title: 'Demostración, datos de línea base y capacidad institucional',
          description: 'Oficina de Programa PLANISV dentro de SAGyP, con INTA como líder operativo. 50 sitios de demostración Nivel 1 en 6 agro-regiones con stack tecnológico completo Biología + Agua e instrumentación MRV. Muestreo de línea base del Censo Nacional de Suelo Vivo. Especificaciones técnicas de desempeño y protocolo de certificación INTI. 300+ extensionistas capacitados (INTA, provincial, CREA). Tablero Nacional de Salud del Suelo (beta). Solicitudes de financiamiento internacional (GCF, BID, Banco Mundial). Propuesta de reestructuración de retenciones para capitalizar el Fondo Nacional.',
          timeline: 'Mes 0-12',
          dependencies: ['Red regional y pagos por resultados'],
          orderIndex: 4,
        },
      ],
    },
    kpis: [
      {
        id: 'mos-zona-nucleo',
        metric: 'Materia Orgánica del Suelo — Zona Núcleo',
        currentValue: 2.5,
        targetValue: 5,
        unit: '%',
        source: 'INTA / Estaciones Experimentales',
        milestones: [
          { date: 'Año 3', targetValue: 3.2 },
          { date: 'Año 6', targetValue: 4.0 },
          { date: 'Año 15', targetValue: 5.0 },
        ],
      },
      {
        id: 'hectareas-participantes',
        metric: 'Hectáreas Participantes',
        currentValue: 0,
        targetValue: 25,
        unit: 'M ha',
        source: 'PLANISV — Objetivo de Programa',
        milestones: [
          { date: 'Año 1', targetValue: 0.05 },
          { date: 'Año 3', targetValue: 1.5 },
          { date: 'Año 6', targetValue: 8 },
          { date: 'Año 15', targetValue: 25 },
        ],
      },
      {
        id: 'secuestro-carbono',
        metric: 'Secuestro de Carbono Anual',
        currentValue: 0,
        targetValue: 75,
        unit: 'Mt CO₂e/año',
        source: 'Proyección escenario ambicioso',
        milestones: [
          { date: 'Año 3', targetValue: 3 },
          { date: 'Año 6', targetValue: 20 },
          { date: 'Año 15', targetValue: 75 },
        ],
      },
      {
        id: 'reduccion-agroquimicos',
        metric: 'Reducción de Insumos Químicos (participantes)',
        currentValue: 0,
        targetValue: 50,
        unit: '%',
        source: 'PLANISV — Meta de desempeño',
        milestones: [
          { date: 'Año 3', targetValue: 15 },
          { date: 'Año 6', targetValue: 30 },
          { date: 'Año 15', targetValue: 50 },
        ],
      },
      {
        id: 'ingresos-carbono',
        metric: 'Ingresos Anuales por Créditos de Carbono',
        currentValue: 0,
        targetValue: 3500,
        unit: 'M USD/año',
        source: 'Proyección a USD 35-40/t CO₂e',
        milestones: [
          { date: 'Año 3', targetValue: 50 },
          { date: 'Año 6', targetValue: 500 },
          { date: 'Año 15', targetValue: 3500 },
        ],
      },
      {
        id: 'manufactura-nacional',
        metric: 'Manufactura Nacional del Equipamiento',
        currentValue: 0,
        targetValue: 70,
        unit: '%',
        source: 'PLANISV — Meta de soberanía tecnológica',
        milestones: [
          { date: 'Año 3', targetValue: 50 },
          { date: 'Año 5', targetValue: 70 },
        ],
      },
    ],
    tags: ['suelo vivo', 'agricultura regenerativa', 'carbono', 'soberanía alimentaria', 'exportaciones', 'INTA', 'agua'],
    sources: [
      { title: 'PLANISV — Plan Nacional de Infraestructura de Suelo Vivo (Documento Estratégico, Feb 2026)' },
      { title: 'INTA — Estaciones Experimentales (datos de MOS y erosión)' },
      { title: 'OECD — PISA Agricultural Sustainability Indicators' },
      { title: 'EUDR — Reglamento de Deforestación de la UE' },
      { title: 'Acuerdo de París — Compromisos de Argentina (NDC)' },
      { title: 'Russell Ackoff — Idealized Design (Metodología)' },
    ],
  },
];
