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
  documentFile?: string;
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
    documentFile: 'PLANISV_Argentina_ES.md',
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
    relatedInitiativeSlugs: ['plan24cn-24-ciudades-nuevas', 'planrep-reconversion-empleo-publico', 'planedu-refundacion-educativa', 'planjus-justicia-popular'],
    sources: [
      { title: 'PLANISV — Plan Nacional de Infraestructura de Suelo Vivo (Documento Estratégico, Feb 2026)' },
      { title: 'INTA — Estaciones Experimentales (datos de MOS y erosión)' },
      { title: 'OECD — PISA Agricultural Sustainability Indicators' },
      { title: 'EUDR — Reglamento de Deforestación de la UE' },
      { title: 'Acuerdo de París — Compromisos de Argentina (NDC)' },
      { title: 'Russell Ackoff — Idealized Design (Metodología)' },
    ],
  },

  // PLAN24CN — 24 Ciudades Nuevas
  {
    slug: 'plan24cn-24-ciudades-nuevas',
    title: 'PLAN24CN',
    subtitle: 'Plan Nacional de Fundación de 24 Ciudades Nuevas para la Argentina',
    category: 'infraestructura',
    summary: 'La Argentina pierde entre USD 25.000 y 40.000 millones por año en costos del mal diseño urbano. PLAN24CN propone fundar 24 ciudades nuevas — una por provincia — diseñadas integralmente con los mejores conocimientos disponibles en bienestar humano, ecología, energía y gobernanza, con un retorno estimado de 5:1 a 12:1.',
    iconName: 'Building2',
    documentFile: 'PLAN24CN_Argentina_ES.md',
    elProblema: {
      title: 'El Problema',
      content: `<p>La Argentina padece una deformación urbana llamada <strong>macrocefalia</strong>: el Gran Buenos Aires concentra el 37% de la población total del país en menos del 0,4% del territorio nacional. Diecisiete millones de personas apiñadas en un área de 3.800 km² rodeada de la pampa más fértil del planeta.</p>

<p>Pero la concentración demográfica es apenas la superficie. Lo verdaderamente patológico es la concentración de <em>todo lo demás</em>: el 40% del PBI, el 45% del empleo formal privado, el 78% de la conectividad de alta velocidad. La red ferroviaria — construida como embudo hacia Buenos Aires — nunca conectó las provincias entre sí. El resultado es una <strong>doble crisis</strong>: el AMBA colapsa bajo su propio peso mientras las provincias se vacían de talento.</p>

<p>Las ciudades argentinas presentan deterioros sistémicos en 10 dimensiones: un déficit de 3,5 millones de viviendas, el 40% de la población sin cloacas, un commute promedio de 90+ minutos en el AMBA, apenas 6,2 m² de espacio verde por habitante en Buenos Aires (la OMS recomienda 15+), el 50%+ de residuos a relleno sanitario, edificios sin aislación térmica que desperdician el 40% de la energía, 30+ inundaciones severas por año, y redes de agua con 50-100 años que pierden el 40% del agua tratada.</p>

<p>El costo humano es devastador: depresión del 10-15% en zonas urbanas densas, riesgo cardiovascular incrementado 15-30% por commutes sedentarios, el 35% de adultos reporta soledad frecuente, y 7.000-10.000 muertes prematuras anuales por contaminación del aire. La fealdad urbana no es un problema cosmético: es un problema de salud pública.</p>`,
      pullQuote: 'Las ciudades argentinas no fueron diseñadas. Se acumularon. Crecieron como tumores benignos alrededor de estaciones de tren, de puertos, de plazas coloniales — sin que nadie jamás se sentara a preguntar: ¿esto es lo mejor que podemos hacer?',
      stats: [
        { label: 'Déficit habitacional', value: '3,5M viviendas' },
        { label: 'Población AMBA / país', value: '37% en 0,4%' },
        { label: 'Costo mal diseño / año', value: 'USD 25-40 mil M' },
        { label: 'Espacio verde Bs.As.', value: '6,2 m²/hab' },
      ],
    },
    quePasaSiNoCambiamos: {
      title: '¿Qué pasa si no cambiamos?',
      content: `<p>Estamos ante un caso de <strong>rendimientos decrecientes de la inversión en parcheo</strong>. Cada peso invertido en mejorar una ciudad mal diseñada rinde menos que el peso anterior, porque la estructura subyacente trabaja en contra de la intervención. Es como tratar de mejorar la aerodinámica de un ladrillo.</p>

<p><strong>Costos acumulados en 25 años:</strong> USD 625.000–1.000.000 millones en pérdidas por mal diseño urbano. Eso es entre el 5% y el 8% del PBI cada año — más de lo que cuesta construir las 24 ciudades que propone este plan.</p>

<p><strong>Infraestructura en colapso:</strong> Las redes de agua tienen 50 a 100 años y pierden el 40% del agua tratada — pero repararlas requiere romper calles que a su vez interrumpen el tránsito caótico. Los edificios sin aislación térmica consumen energía subsidiada que drena las cuentas fiscales — pero aislarlos cuesta más que construir vivienda nueva con estándares pasivos. Los subsidios energéticos cuestan USD 10.000–15.000 millones por año.</p>

<p><strong>Crisis de salud pública:</strong> 7.000-10.000 muertes prematuras anuales por contaminación del aire (USD 3.000M/año en costos de salud). El commute sedentario de millones de personas incrementa el riesgo cardiovascular hasta un 30%. Los chicos en entornos sin espacios verdes muestran déficits cognitivos medibles.</p>

<p><strong>Concentración irreversible:</strong> Sin polos de atracción alternativos, la migración hacia el AMBA continuará. Las provincias seguirán perdiendo talento, atrapadas en economías extractivas de baja complejidad. Las comunidades una vez perdidas no regresan.</p>`,
      pullQuote: 'La Argentina pierde entre USD 25.000 y 40.000 millones por año en costos asociados al mal diseño urbano. Es más de lo que cuesta construir las 24 ciudades que propone este plan.',
      stats: [
        { label: 'Pérdida acumulada (25 años)', value: 'USD 625 mil-1 B M' },
        { label: 'Subsidios energía / año', value: 'USD 10-15 mil M' },
        { label: 'Muertes contaminación / año', value: '7.000-10.000' },
        { label: 'Agua tratada perdida', value: '40%+' },
      ],
    },
    elDisenoIdeal: {
      title: 'El Diseño Ideal',
      content: `<p>Fundar <strong>24 ciudades nuevas</strong> — una por provincia — diseñadas integralmente desde la primera piedra hasta la última fibra óptica. No réplicas de las ciudades existentes. Ciudades completas, cada una un faro, cada una única porque Misiones no es Mendoza y Tierra del Fuego no es Tucumán.</p>

<p><strong>Seis Leyes del Urbanismo Vivo:</strong></p>
<p><strong>1. Escala Humana:</strong> Máximo 1.200m a todo lo esencial, todo caminable en menos de 15 minutos. Máxima altura 4-6 pisos. Densidad 50-80 hab/ha.</p>
<p><strong>2. Integración Bioclimática:</strong> Estándar Passivhaus con 80-90% de reducción energética. 60%+ de suelo permeable. 25-40 m² de espacio verde per cápita.</p>
<p><strong>3. Belleza como Infraestructura:</strong> 2% del presupuesto de construcción destinado a arte público. La neuroestética demuestra que entornos bellos reducen estrés y aumentan conducta prosocial.</p>
<p><strong>4. Economía Circular:</strong> Meta de >80% circularidad. 40-60% de producción alimentaria local. Zero residuos lineales.</p>
<p><strong>5. Ciudadanía Activa:</strong> 30% del presupuesto anual decidido directamente por los ciudadanos. Gobernanza participativa vinculante.</p>
<p><strong>6. Interconexión Vital:</strong> Las 24 ciudades como células de un organismo nacional. Protocolos de cooperación inter-ciudad.</p>

<p><strong>Siete Anillos Concéntricos:</strong> Cada ciudad se estructura desde un Núcleo Cívico (plaza central, gobierno, mercado) hacia afuera: anillo residencial denso, barrios con identidad propia, anillo productivo (talleres, laboratorios, cooperativas), anillo agro-productivo, ecotono de transición, y paisaje circundante (1:10 — 10 hectáreas gestionadas por cada 1 urbana). Más una capa digital (fibra óptica soberana, datacenter, IoT, IA, plataforma de gobernanza participativa).</p>`,
      pullQuote: 'No pedimos mejores ciudades. Pedimos ciudades dignas de la vida humana. Ciudades que nos hagan mejores personas por el solo hecho de habitarlas.',
      stats: [
        { label: 'Ciudades nuevas', value: '24' },
        { label: 'Espacio verde per cápita', value: '25-40 m²' },
        { label: 'Inversión total', value: 'USD 27-76 mil M' },
        { label: 'ROI estimado (25 años)', value: '5:1 a 12:1' },
      ],
    },
    elCamino: {
      overview: 'PLAN24CN se despliega en 4 fases, trabajando hacia atrás desde 24 ciudades maduras y autofinanciadas hasta 4 ciudades piloto iniciales — cada una en una región distinta del país.',
      steps: [
        {
          id: 1,
          title: 'Efecto faro: 24 ciudades maduras',
          description: '1 a 1,8 millones de residentes en total. Ciudades autofinanciadas por valorización de tierra, economía circular y recaudación propia. Modelo exportado a otras naciones latinoamericanas. Efecto faro: cada ciudad demuestra que otra forma de vivir es posible. Índice Nacional de Ciudades Nuevas (INCN) establece ranking público. Las ciudades con puntaje >80 durante 3 años reciben estatus de "Faro".',
          timeline: 'Año 10-25 — META',
          dependencies: [],
          orderIndex: 1,
        },
        {
          id: 2,
          title: 'Las 24 ciudades operativas',
          description: 'Todas las 24 ciudades en funcionamiento con 300.000 a 800.000 residentes en total. Primeras ciudades alcanzando autofinanciamiento. Economías circulares locales generando empleo y reduciendo dependencia externa. Tablero Nacional público con datos en tiempo real de cada ciudad en 7 dimensiones: construcción, población, economía, bienestar, medio ambiente, gobernanza y finanzas.',
          timeline: 'Año 5-10',
          dependencies: ['Efecto faro: 24 ciudades maduras'],
          orderIndex: 2,
        },
        {
          id: 3,
          title: 'Escalamiento a 16 ciudades',
          description: 'Expansión a 16 ciudades adicionales en todas las provincias restantes. Primeros residentes habitando las 4 ciudades piloto. 50.000+ trabajadores capacitados en oficios de construcción viva. Protocolo de diseño urbano validado y documentado para replicación. Lecciones de las 4 ciudades piloto integradas en los diseños posteriores.',
          timeline: 'Año 1,5-5',
          dependencies: ['Las 24 ciudades operativas'],
          orderIndex: 3,
        },
        {
          id: 4,
          title: '4 ciudades piloto: diseño y construcción',
          description: 'Cuatro ciudades fundacionales en regiones distintas: Ciudad Raíz (pampa/litoral), Ciudad Sol Alto (Cuyo/NOA), Ciudad Viento (Patagonia) y Ciudad Selva (NEA/Mesopotamia). Aprobación de la Ley Nacional de Ciudades Nuevas. Selección y aseguramiento de tierras fiscales. Concursos internacionales de diseño. Financiamiento inicial: USD 3.000-7.000 millones. Creación de la Agencia Nacional de Ciudades Nuevas.',
          timeline: 'Mes 0-18',
          dependencies: ['Escalamiento a 16 ciudades'],
          orderIndex: 4,
        },
      ],
    },
    kpis: [
      {
        id: 'poblacion-ciudades-nuevas',
        metric: 'Población en Ciudades Nuevas',
        currentValue: 0,
        targetValue: 1800,
        unit: 'K hab',
        source: 'PLAN24CN — Objetivo de Programa',
        milestones: [
          { date: 'Año 5', targetValue: 50 },
          { date: 'Año 10', targetValue: 800 },
          { date: 'Año 25', targetValue: 1800 },
        ],
      },
      {
        id: 'espacio-verde-per-capita',
        metric: 'Espacio Verde per Cápita (ciudades nuevas)',
        currentValue: 6.2,
        targetValue: 40,
        unit: 'm²/hab',
        source: 'Objetivo vs. promedio nacional actual',
        milestones: [
          { date: 'Año 5', targetValue: 25 },
          { date: 'Año 10', targetValue: 35 },
          { date: 'Año 25', targetValue: 40 },
        ],
      },
      {
        id: 'indice-incn',
        metric: 'Índice Nacional de Ciudades Nuevas (INCN)',
        currentValue: 0,
        targetValue: 80,
        unit: '/100',
        source: 'PLAN24CN — Tablero Nacional',
        milestones: [
          { date: 'Año 5', targetValue: 50 },
          { date: 'Año 10', targetValue: 65 },
          { date: 'Año 25', targetValue: 80 },
        ],
      },
      {
        id: 'ciudades-operativas',
        metric: 'Ciudades Operativas',
        currentValue: 0,
        targetValue: 24,
        unit: 'ciudades',
        source: 'PLAN24CN — Cronograma',
        milestones: [
          { date: 'Año 1,5', targetValue: 4 },
          { date: 'Año 5', targetValue: 12 },
          { date: 'Año 10', targetValue: 24 },
        ],
      },
      {
        id: 'energia-renovable',
        metric: 'Energía Renovable por Ciudad',
        currentValue: 0,
        targetValue: 100,
        unit: '%',
        source: 'PLAN24CN — Meta de soberanía energética',
        milestones: [
          { date: 'Año 5', targetValue: 60 },
          { date: 'Año 10', targetValue: 85 },
          { date: 'Año 25', targetValue: 100 },
        ],
      },
      {
        id: 'circularidad',
        metric: 'Circularidad de Materiales y Energía',
        currentValue: 15,
        targetValue: 80,
        unit: '%',
        source: 'PLAN24CN — Meta de economía circular',
        milestones: [
          { date: 'Año 5', targetValue: 40 },
          { date: 'Año 10', targetValue: 60 },
          { date: 'Año 25', targetValue: 80 },
        ],
      },
    ],
    tags: ['ciudades nuevas', 'urbanismo', 'bienestar', 'diseño ideal', 'federalismo', 'economía circular', 'belleza'],
    relatedInitiativeSlugs: ['planisv-infraestructura-suelo-vivo', 'planrep-reconversion-empleo-publico', 'planedu-refundacion-educativa', 'planjus-justicia-popular'],
    sources: [
      { title: 'PLAN24CN — Plan Nacional de 24 Ciudades Nuevas (Documento Estratégico, Mar 2026)' },
      { title: 'INDEC — Censo Nacional de Población, Hogares y Viviendas' },
      { title: 'OMS — Recomendaciones de Espacios Verdes Urbanos' },
      { title: 'CEPAL — Panorama de la Gestión Urbana en América Latina' },
      { title: 'Russell Ackoff — Idealized Design (Metodología)' },
    ],
  },

  // PLANREP — Reconversión del Empleo Público
  {
    slug: 'planrep-reconversion-empleo-publico',
    title: 'PLANREP',
    subtitle: 'Plan Nacional de Reconversión del Empleo Público hacia la Economía Privada Productiva',
    category: 'economia',
    summary: 'La Argentina tiene entre 1,2 y 1,8 millones de empleados públicos en puestos que no generan valor. PLANREP propone no echar gente sino liberarla: un programa masivo, voluntario y financiado de reconversión hacia la Economía de la Vida (8 oficios irreemplazables) y la Economía de la Inteligencia (servicios IA para el mundo), con potencial de USD 15-47 mil millones anuales.',
    iconName: 'TrendingUp',
    documentFile: 'PLANREP_Argentina_ES.md',
    elProblema: {
      title: 'El Problema',
      content: `<p>La Argentina tiene más empleados públicos per cápita que cualquier país comparable de América Latina. Son <strong>3,5 millones de personas</strong> en el sector público nacional, provincial y municipal — el 30% del empleo total. El empleo público creció un 70% entre 2003 y 2023 (de ~2M a 3,5M), mientras el empleo privado formal creció solo 35%.</p>

<p>El problema no es la cantidad en abstracto — Dinamarca emplea al 28% de su fuerza laboral en el sector público y tiene uno de los Estados más eficientes del mundo. El problema argentino es la <strong>brecha entre input y output</strong>: se emplea a tanta gente como un país nórdico pero se entregan servicios de calidad subsahariana. Esa brecha es donde se esconde el sobreempleo.</p>

<p>Entre <strong>1,2 y 1,8 millones de puestos públicos</strong> no generan valor verificable para la sociedad. Estas personas no son el problema — son las víctimas. Fueron capturadas por un sistema que les ofreció la única opción disponible: un sueldo fijo en un país donde el sector privado es hostil, frágil, informal y mal pago. Ahora están atrapadas en una trampa que les roba su potencial, su autoestima y sus mejores años.</p>

<p>El costo fiscal directo es de <strong>USD 15.000–25.000 millones anuales</strong> (3-5% del PBI). Cuando se suman costos indirectos — presión impositiva excesiva, burocracia paralizante, competencia desleal por talento, endeudamiento crónico — el costo total del Estado sobredimensionado supera los <strong>USD 50.000 millones anuales</strong>, más del 10% del PBI.</p>

<p>Todas las reformas anteriores fracasaron — los retiros voluntarios de los 90, la modernización fallida de 2000, las reducciones de contratos sin reconversión — porque trataron a la gente como un costo a eliminar en vez de un activo a reconvertir.</p>`,
      pullQuote: 'No hay nada más violento que robarle a una persona la posibilidad de hacer algo que importe. El empleo público innecesario es esa violencia, administrada con recibo de sueldo.',
      stats: [
        { label: 'Empleo público total', value: '3,5M personas' },
        { label: 'Sobreempleo estimado', value: '1,2-1,8M' },
        { label: 'Costo fiscal directo / año', value: 'USD 15-25 mil M' },
        { label: 'Costo total Estado grande', value: 'USD 50+ mil M/año' },
      ],
    },
    quePasaSiNoCambiamos: {
      title: '¿Qué pasa si no cambiamos?',
      content: `<p>La Argentina está atrapada en la <strong>Trampa del Estado Empleador</strong>. Para financiar el sobreempleo, mantiene una presión fiscal del 29-32% del PBI — nivel OCDE con servicios subsaharianos. Esta presión asfixia al sector privado, empujando al 35-40% del empleo a la informalidad, lo que reduce la recaudación, lo que requiere más deuda, lo que genera más presión fiscal. Un círculo vicioso que se autoperpetúa.</p>

<p><strong>El costo del status quo es 5 a 7 veces más caro que hacer PLANREP.</strong> Mantener el sobreempleo cuesta USD 15.000–25.000 millones cada año, para siempre. Es más que todo el presupuesto nacional de salud (USD 12.000M) y más que todo el presupuesto de educación (USD 14.000M). Con ese dinero se podrían construir 50 hospitales de última generación por año.</p>

<p><strong>Crisis demográfica inminente:</strong> Argentina tiene 7,3 millones de personas mayores de 60 años, creciendo al 3% anual. Para 2040 serán más de 10 millones. El déficit actual de cuidadores formales es de 150.000 profesionales. Sin reconversión hacia la economía del cuidado, esta demanda queda desatendida.</p>

<p><strong>Ventana competitiva cerrándose:</strong> Polonia genera 50.000 nuevos ingenieros por año. Vietnam emerge como hub tecnológico con costos más bajos. La ventana de oportunidad para posicionar a Argentina en la economía de inteligencia global es de 5 a 10 años. El tren pasa ahora — si no subimos, no pasa de vuelta.</p>

<p><strong>Fuga de cerebros perpetuada:</strong> Sin oportunidades de reconversión, el talento sigue emigrando. Argentina pierde posición competitiva en la economía de inteligencia emergente. Sin camino de retorno para la diáspora.</p>`,
      pullQuote: 'El costo del status quo es 5 a 7 veces más caro que PLANREP. Mantener el sobreempleo cuesta USD 15.000–25.000 millones cada año, para siempre. Es más que todo el presupuesto nacional de salud.',
      stats: [
        { label: 'Presión fiscal total', value: '29-32% PBI' },
        { label: 'Empleo informal', value: '35-40%' },
        { label: 'Costo status quo / año', value: 'USD 15-25 mil M' },
        { label: 'Cargas patronales', value: '40-45%' },
      ],
    },
    elDisenoIdeal: {
      title: 'El Diseño Ideal',
      content: `<p>PLANREP propone no echar gente sino <strong>liberarla</strong>. Un programa masivo, voluntario, gradual y financiado de reconversión laboral con una <strong>estrategia dual</strong>: el Escudo y la Espada.</p>

<p><strong>EL ESCUDO — Economía de la Vida</strong> (8 ramas de trabajo que requieren presencia humana irreemplazable):</p>
<p><strong>1. La Belleza</strong> (Oficios Artesanales) — 150.000-200.000 personas. Madera, cerámica, textil, cuero, metal, vidrio, joyería.</p>
<p><strong>2. El Amparo</strong> (Economía del Cuidado) — 200.000-250.000 personas. Cuidado de ancianos, niños, apoyo terapéutico.</p>
<p><strong>3. La Reparación</strong> (Remediación Ambiental) — 150.000-200.000 personas. Ríos, suelos, basurales, ecosistemas.</p>
<p><strong>4. El Refugio</strong> (Construcción Viva) — 200.000-250.000 personas. Vivienda digna, restauración patrimonial, bioconstrucción.</p>
<p><strong>5. La Mesa</strong> (Alimentación de Origen) — 150.000-200.000 personas. Producción, elaboración y gastronomía artesanal.</p>
<p><strong>6. El Encuentro</strong> (Economía de la Experiencia) — 100.000-150.000 personas. Turismo, hospitalidad, eventos, cultura viva.</p>
<p><strong>7. La Imaginación</strong> (Industria Creativa) — 100.000-150.000 personas. Cine, música, gaming, diseño, narrativa.</p>
<p><strong>8. La Precisión</strong> (Economía Circular) — 80.000-120.000 personas. Reparación, remanufactura, microfabricación.</p>

<p><strong>LA ESPADA — Economía de la Inteligencia:</strong> Servicios AI-aumentados para mercados globales. 50 Centros de Inteligencia. Ventaja argentina: zona horaria de EE.UU., afinidad cultural, ADN creativo, costos competitivos. Mercado global de USD 500.000 millones para 2030.</p>

<p><strong>Infraestructura:</strong> 120 Centros de la Vida + 50 Centros de Inteligencia + 50 unidades PLANREP-Móvil. Bonos de Impacto Social. Transición de 36 meses con garantía de ingreso, salud, apoyo psicológico y mentoría. Todos los egresados aprenden 40 horas de "Herramientas IA para mi Oficio" (Artesano Aumentado).</p>`,
      pullQuote: 'No se trata de echar gente, sino de liberarla. No ajuste fiscal disfrazado de reforma, sino reconversión real hacia actividades que requieren presencia humana irreemplazable.',
      stats: [
        { label: 'Centros de la Vida', value: '120' },
        { label: 'Centros de Inteligencia', value: '50' },
        { label: 'Potencial económico', value: 'USD 15-47 mil M/año' },
        { label: 'Punto de equilibrio fiscal', value: 'Año 4' },
      ],
    },
    elCamino: {
      overview: 'PLANREP se despliega en 5 fases, trabajando hacia atrás desde una Argentina donde el empleo público es esencial y productivo, la Economía de la Vida representa el 8-12% del PBI, y la Economía de la Inteligencia exporta USD 17-25 mil millones anuales.',
      steps: [
        {
          id: 1,
          title: 'La nueva normalidad',
          description: 'Empleo público reducido a lo esencial: educación, salud, seguridad, justicia, infraestructura (de 3,5M a 2,1M). Presión fiscal reducida 4-6 puntos de PBI. Economía de la Vida: 8-12% del PBI (comparable a turismo o construcción). Economía de la Inteligencia: USD 17.000-25.000 millones/año en exportación de servicios (2do-3er sector exportador). Argentina exporta artesanía, gastronomía y diseño como marca país. Fuga de cerebros revertida: la diáspora regresa.',
          timeline: 'Año 10-20 — META',
          dependencies: [],
          orderIndex: 1,
        },
        {
          id: 2,
          title: 'Transformación: 1M+ reconvertidos',
          description: 'Más de 1.000.000 de personas reconvertidas (~700K Vida, ~300K Inteligencia). Reducción de 2-3 puntos de PBI en presión fiscal. Economía de la Vida visible en cada ciudad. Economía de la Inteligencia: USD 5.000-10.000 millones/año en exportación de servicios. Argentina posicionada como hub regional de talento AI-aumentado. Modelo exportado a otros países de la región.',
          timeline: 'Año 5-10',
          dependencies: ['La nueva normalidad'],
          orderIndex: 2,
        },
        {
          id: 3,
          title: 'Escala: 120 Centros + 50 Centros de Inteligencia',
          description: 'Todos los 120 Centros de la Vida operativos (mínimo 5 por provincia). Todos los 50 Centros de Inteligencia operativos. 300.000 nuevos participantes por año (~200K Vida, ~100K Inteligencia). Primeras cooperativas PLANREP operando. Contratos de compra pública de productos y servicios de la Vida ejecutándose. Primeros egresados de Inteligencia generando ingresos en USD internacionalmente. 200.000+ reducción en nómina pública.',
          timeline: 'Año 2-5',
          dependencies: ['Transformación: 1M+ reconvertidos'],
          orderIndex: 3,
        },
        {
          id: 4,
          title: 'Piloto: 20 Centros, 25.000 personas',
          description: '20 Centros de la Vida operativos (1 por ciudad grande). 10 Centros de Inteligencia operativos (CABA, Córdoba, Rosario, Mendoza, Tucumán, Mar del Plata, La Plata, Neuquén, Salta, Resistencia). 1.000 personas por Centro de Vida + 500 por Centro de Inteligencia. Métricas de éxito: >85% retención, >7/10 satisfacción, >60% empleados 1 año post-egreso, ≥80% del salario público previo.',
          timeline: 'Año 1-2',
          dependencies: ['Escala: 120 Centros + 50 Centros de Inteligencia'],
          orderIndex: 4,
        },
        {
          id: 5,
          title: 'Diagnóstico y diseño',
          description: 'Censo nacional de empleo público: auditoría funcional de 3,5 millones de puestos (esencial / optimizable / prescindible). Mapeo de demanda artesanal + demanda de servicios IA. Diseño curricular (40+ oficios × 4 niveles y 4 tracks). Selección de sitios: 20 Centros de Vida + 10 Centros de Inteligencia. Convocatoria: 600 Maestros Artesanos + 580 mentores IA. Campaña: "De la oficina al taller — y al mundo". Legislación: Ley Nacional de Reconversión del Empleo Público.',
          timeline: 'Mes 0-12',
          dependencies: ['Piloto: 20 Centros, 25.000 personas'],
          orderIndex: 5,
        },
      ],
    },
    kpis: [
      {
        id: 'personas-reconvertidas',
        metric: 'Personas Reconvertidas (acumulado)',
        currentValue: 0,
        targetValue: 1800,
        unit: 'K personas',
        source: 'PLANREP — Objetivo de Programa',
        milestones: [
          { date: 'Año 2', targetValue: 25 },
          { date: 'Año 5', targetValue: 500 },
          { date: 'Año 10', targetValue: 1200 },
          { date: 'Año 20', targetValue: 1800 },
        ],
      },
      {
        id: 'ahorro-fiscal-neto',
        metric: 'Ahorro Fiscal Neto Acumulado',
        currentValue: 0,
        targetValue: 200,
        unit: 'mil M USD',
        source: 'PLANREP — Proyección fiscal',
        milestones: [
          { date: 'Año 5', targetValue: 5 },
          { date: 'Año 10', targetValue: 50 },
          { date: 'Año 20', targetValue: 200 },
        ],
      },
      {
        id: 'exportacion-inteligencia',
        metric: 'Exportaciones Economía de Inteligencia',
        currentValue: 0,
        targetValue: 25,
        unit: 'mil M USD/año',
        source: 'PLANREP — Proyección Espada',
        milestones: [
          { date: 'Año 5', targetValue: 2 },
          { date: 'Año 10', targetValue: 14 },
          { date: 'Año 20', targetValue: 25 },
        ],
      },
      {
        id: 'cooperativas-activas',
        metric: 'Cooperativas PLANREP Activas',
        currentValue: 0,
        targetValue: 2000,
        unit: 'cooperativas',
        source: 'PLANREP — Red de Economía de la Vida',
        milestones: [
          { date: 'Año 5', targetValue: 500 },
          { date: 'Año 10', targetValue: 1200 },
          { date: 'Año 20', targetValue: 2000 },
        ],
      },
      {
        id: 'reduccion-presion-fiscal',
        metric: 'Reducción de Presión Fiscal',
        currentValue: 0,
        targetValue: 5,
        unit: 'puntos PBI',
        source: 'PLANREP — Meta fiscal',
        milestones: [
          { date: 'Año 5', targetValue: 1 },
          { date: 'Año 10', targetValue: 3 },
          { date: 'Año 20', targetValue: 5 },
        ],
      },
      {
        id: 'egresados-actividad-productiva',
        metric: 'Egresados con Actividad Productiva',
        currentValue: 0,
        targetValue: 80,
        unit: '%',
        source: 'PLANREP — Indicador de efectividad',
        milestones: [
          { date: 'Año 5', targetValue: 60 },
          { date: 'Año 10', targetValue: 70 },
          { date: 'Año 20', targetValue: 80 },
        ],
      },
    ],
    tags: ['empleo público', 'reconversión laboral', 'economía de la vida', 'artesanos', 'inteligencia artificial', 'alivio fiscal', 'cooperativas'],
    relatedInitiativeSlugs: ['planisv-infraestructura-suelo-vivo', 'plan24cn-24-ciudades-nuevas', 'planedu-refundacion-educativa', 'planjus-justicia-popular'],
    sources: [
      { title: 'PLANREP — Plan Nacional de Reconversión del Empleo Público (Documento Estratégico, Mar 2026)' },
      { title: 'INDEC — Encuesta Permanente de Hogares (datos de empleo público)' },
      { title: 'Ministerio de Economía — Presupuesto Nacional (masa salarial pública)' },
      { title: 'OCDE — Government at a Glance (comparativa internacional)' },
      { title: 'OIT — Perspectivas del Empleo y la Transformación Digital' },
      { title: 'Russell Ackoff — Idealized Design (Metodología)' },
    ],
  },

  // PLANEDU — Refundación Educativa
  {
    slug: 'planedu-refundacion-educativa',
    title: 'PLANEDU',
    subtitle: 'Plan Nacional de Refundación Educativa para la Soberanía del Conocimiento Humano',
    category: 'educacion',
    summary: 'Argentina ocupa el puesto 63 de 81 en PISA gastando más del 5% de su PBI en educación. El 46% de los alumnos no alcanza el nivel mínimo de comprensión lectora — y en el quintil más pobre, el analfabetismo funcional llega al 70%. PLANEDU propone una refundación basada en Siete Capacidades, Maestros Creadores, el Modelo 3+5 (3 horas de dominio adaptativo + 5 horas de talleres, proyectos y emprendimientos), "Leer para Encender" como Pilar Cero de alfabetización, y la PAA 2.0 (Socrática + Adaptativa) — adaptando las innovaciones de Alpha School para educación pública a escala, con el objetivo de ubicar a Argentina en el top 20 mundial en 15 años.',
    iconName: 'GraduationCap',
    documentFile: 'PLANEDU_Argentina_ES.md',
    elProblema: {
      title: 'El Problema',
      content: `<p>La Argentina fue, durante la primera mitad del siglo XX, una potencia educativa. La Ley 1420 de 1884 fue una de las legislaciones más avanzadas del mundo. Para 1950, tenía la tasa de alfabetización más alta de América Latina. Eso fue hace setenta y cinco años.</p>

<p>Hoy ocupa el <strong>puesto 63 de 81 países</strong> en PISA 2022. El <strong>46% de los estudiantes de 15 años</strong> no alcanza el nivel mínimo de comprensión lectora. El <strong>69%</strong> no alcanza el nivel mínimo de matemáticas. Estos no son números de un país pobre: son de un país que gasta más del 5% de su PBI en educación — más que el promedio de la OCDE — y obtiene resultados entre los peores del continente.</p>

<p>Solo el <strong>53% de los argentinos termina la secundaria</strong>. De los que entran a la universidad, el 70% no se recibe. El salario docente promedio es de ~USD 450-600/mes — inferior al promedio de la economía. Menos del 5% de los docentes tiene maestría o doctorado (Finlandia: 100%). El ausentismo docente es del 15-20% de los días de clase. Los postulantes a carreras docentes caen año a año.</p>

<p>El sistema no enseña pensamiento crítico, creatividad, inteligencia emocional, habilidades financieras, pensamiento sistémico, comunicación efectiva, trabajo en equipo real, ni un segundo idioma funcional. Enseña fragmentos de información enciclopédica que los alumnos memorizan, vomitan en un examen, y olvidan a la semana siguiente. Confunde información con conocimiento, memorización con comprensión, y aprobación con aprendizaje.</p>`,
      pullQuote: 'El sistema educativo argentino no fracasa porque los maestros sean malos o los alumnos sean vagos. Fracasa porque está diseñado para un propósito que ya no existe: producir obreros obedientes para fábricas del siglo XX.',
      stats: [
        { label: 'Posición PISA (lectura)', value: '63 de 81' },
        { label: 'Sin nivel mínimo lectura', value: '46%' },
        { label: 'Graduación secundaria', value: '~53%' },
        { label: 'Salario docente promedio', value: 'USD 450-600/mes' },
      ],
    },
    quePasaSiNoCambiamos: {
      title: '¿Qué pasa si no cambiamos?',
      content: `<p>La Argentina pierde entre <strong>USD 50.000 y 75.000 millones por año</strong> por no educar bien a su gente — entre el 10% y el 15% del PBI anual. Es más que la deuda externa. Es más que todo el presupuesto nacional. Es el costo más grande que paga el país, y el único que nadie presupuesta.</p>

<p><strong>Productividad perdida:</strong> USD 15.000–25.000M/año. Cada desviación estándar de mejora en PISA genera +2% de crecimiento del PBI a largo plazo (Hanushek & Woessmann). Argentina está 1,5 desviaciones por debajo del promedio OCDE.</p>

<p><strong>Fuga de cerebros:</strong> ~30.000 profesionales/año emigran, llevándose el capital humano que el país financió. Costo: USD 3.000–5.000M/año.</p>

<p><strong>Criminalidad:</strong> Correlación directa entre nivel educativo y tasa de criminalidad (Lochner & Moretti). Cada punto de graduación secundaria que se pierde se paga en policía, cárceles, justicia y seguros. USD 8.000–12.000M/año.</p>

<p><strong>Desempleo estructural:</strong> Personas formadas para un mundo que no existe, no calificadas para los trabajos que sí hay. USD 10.000–15.000M/año.</p>

<p><strong>En 25 años:</strong> USD 1.500.000–2.250.000 millones acumulados en pérdidas. Y un costo que ninguna tabla captura: el talento desperdiciado de millones de personas que nunca descubrieron lo que podían ser. ¿Cuántos científicos perdimos? ¿Cuántos artistas? ¿Cuántos emprendedores? No lo sabremos nunca.</p>`,
      pullQuote: 'La Argentina pierde entre USD 50.000 y 75.000 millones por año por no educar bien a su gente. Es el costo más grande que paga el país, y el único que nadie presupuesta.',
      stats: [
        { label: 'Costo de la ignorancia / año', value: 'USD 50-75 mil M' },
        { label: 'Fuga de cerebros / año', value: '~30.000 profesionales' },
        { label: 'Pérdida acumulada (25 años)', value: 'USD 1,5-2,25 B M' },
        { label: 'Sin nivel mínimo matemáticas', value: '69%' },
      ],
    },
    elDisenoIdeal: {
      title: 'El Diseño Ideal',
      content: `<p>PLANEDU reemplaza el currículo enciclopédico obsoleto con <strong>Siete Capacidades</strong> — dimensiones integradas del saber humano que se desarrollan simultáneamente y se demuestran a través de la creación:</p>

<p><strong>1. CREAR</strong> — Arte, diseño, ingeniería, emprendimiento, programación creativa. El corazón del currículo.</p>
<p><strong>2. CUIDAR</strong> — Salud, inteligencia emocional, ecología práctica, relación con la tierra (integración PLANISV).</p>
<p><strong>3. PENSAR</strong> — Matemática aplicada, lógica, pensamiento científico, detección de falacias, pensamiento sistémico.</p>
<p><strong>4. COMUNICAR</strong> — Español avanzado, inglés fluido (B2/C1 a los 16), tercer idioma opcional (lengua originaria).</p>
<p><strong>5. CONSTRUIR</strong> — Carpintería, electricidad, fabricación digital, programación, robótica, cultivo.</p>
<p><strong>6. COLABORAR</strong> — Trabajo en equipo real, liderazgo, negociación, participación cívica.</p>
<p><strong>7. CONOCER</strong> — Ciencias integradas, culturas, saberes originarios, autoconocimiento, ética.</p>

<p><strong>Maestros Creadores:</strong> Seleccionados del tercio superior, formados en 5 años, con salario piso de 1,5× el mediano profesional (~USD 1.200-1.500/mes inicial, escalando a USD 2.500+). Carrera por mérito: 4 niveles hasta Maestro Referente Nacional.</p>

<p><strong>Leer para Encender — El Pilar Cero:</strong> Sin lectura, nada funciona. Motor adaptativo de lectura con repetición espaciada y gamificación para alumnos por debajo del nivel + lectura integrada en TODAS las Capacidades y talleres. Programa familiar "Encender en Casa": padres usan PAA, círculos de lectura comunitarios, desafíos intergeneracionales. Objetivo: 80% de alumnos por debajo del nivel recuperados en 18 meses.</p>

<p><strong>El Modelo 3+5:</strong> Inspirado en Alpha School (EE.UU., top 1-2% nacional con solo 2 horas de academia adaptativa), PLANEDU estructura la jornada en <strong>3 horas de dominio adaptativo</strong> (PAA con repetición espaciada + sesiones socráticas con Maestro Creador) + <strong>5 horas de talleres, proyectos y emprendimientos</strong>. 24+ talleres rotativos mapeados a las Siete Capacidades. Sin tarea para el hogar — todo sucede en la jornada escolar.</p>

<p><strong>PAA 2.0 — Socrática + Adaptativa:</strong> El "Dash Argentino" — motor de orquestación open-source que genera caminos de aprendizaje individualizados con repetición espaciada, detección de brechas en tiempo real, motor de lectura "Leer para Encender", scheduling de talleres, dashboard docente, y arquitectura offline-first para zonas rurales.</p>

<p><strong>Emprendimientos Estudiantiles:</strong> Edades 6-13: empresas simuladas. Edades 14+: emprendimientos reales vía Centros de la Vida PLANREP. Filtros de agua, medios comunitarios, huerta urbana, tecnología. Los emprendimientos son el motivador de lectura más potente: necesitás leer para crear un plan de negocios.</p>

<p><strong>Aprendizaje por Dominio:</strong> Avanzás cuando demostrás que sabés, no cuando el calendario dice. Se terminó la farsa del "aprobé con 4".</p>

<p><strong>Portfolio reemplaza al boletín:</strong> Cada alumno egresa con un cuerpo de creaciones reales — no con un papel.</p>

<p><strong>500 Escuelas del Futuro:</strong> Laboratorios vivientes distribuidos en todo el país, abiertos 14 horas/día, 350 días/año, sirviendo a toda la comunidad. Espacios de taller, biblioteca con 5.000+ volúmenes, incubadora de emprendimientos, makerspace.</p>

<p><strong>ANCE:</strong> Agencia Nacional de Calidad Educativa — ente autárquico, blindado contra el ciclo electoral, con directorio de 9 miembros (docentes, académicos, familias, sindicatos, estudiantes) y piso presupuestario del 0,5% del PBI.</p>`,
      pullQuote: 'PLANEDU no copia a Alpha School — la supera. Alpha demostró que el tiempo sobra. PLANEDU demuestra que el tiempo liberado puede encender a una generación entera.',
      stats: [
        { label: 'Modelo diario', value: '3+5 horas' },
        { label: 'Talleres rotativos', value: '24+' },
        { label: 'Escuelas del Futuro', value: '500' },
        { label: 'Salario docente objetivo', value: 'USD 1.200-3.500/mes' },
      ],
    },
    elCamino: {
      overview: 'PLANEDU se despliega en 4 fases, trabajando hacia atrás desde una Argentina en el top 20 mundial de educación, con bilingüismo universal, docencia como profesión de élite, y la PAA usada por 50 millones de hispanohablantes.',
      steps: [
        {
          id: 1,
          title: 'Argentina: referente educativo mundial',
          description: 'Top 20 en evaluaciones internacionales. 70% de egresados secundarios con nivel B2+ de inglés. La profesión de Maestro Creador entre las 3 más prestigiosas del país. PAA usada por 50 millones de hispanohablantes en 12+ países. Tasa de graduación secundaria >85%. Primera generación completa de egresados PLANEDU en el mercado laboral — la más creativa, capaz y empática que Argentina produjo.',
          timeline: 'Año 10-15 — META',
          dependencies: [],
          orderIndex: 1,
        },
        {
          id: 2,
          title: 'Irradiación: 500 Escuelas del Futuro',
          description: '500 Escuelas del Futuro operativas en todas las provincias. 25.000 Maestros Creadores formados y activos. PAA disponible para todo el sistema educativo (12M estudiantes). Escuelas convencionales adoptan elementos del modelo voluntariamente. Salario docente alcanza niveles objetivo en EdF. Primeras exportaciones de PAA y metodología. Argentina top 30 en PISA con cohortes EdF.',
          timeline: 'Año 5-10',
          dependencies: ['Argentina: referente educativo mundial'],
          orderIndex: 2,
        },
        {
          id: 3,
          title: 'Demostración: 50 Escuelas del Futuro',
          description: '50 Escuelas del Futuro operando con el Modelo 3+5 a régimen completo. 5.000 Maestros Creadores activos. PAA 2.0 (Socrática + Adaptativa) desplegada. "Leer para Encender" como sprint de emergencia literaria: 60% de alumnos por debajo del nivel recuperados. Primeros emprendimientos estudiantiles reales. "Encender en Casa" operativo con familias. Primera evaluación de impacto. Build in Public: documentación abierta de éxitos y fracasos.',
          timeline: 'Año 3-5',
          dependencies: ['Irradiación: 500 Escuelas del Futuro'],
          orderIndex: 3,
        },
        {
          id: 4,
          title: 'Siembra: ANCE, currículo y cohorte fundacional',
          description: 'Creación de la ANCE por ley del Congreso. Diseño del currículo de Siete Capacidades + Modelo 3+5 + talleres rotativos. Selección de 2.000 Maestros Creadores fundacionales + Residencia de Transformación de 12 meses. Desarrollo del "Dash Argentino" (PAA 2.0) y motor "Leer para Encender". Inicio de construcción de 50 EdF con espacios de taller. Pacto de la Dignidad con sindicatos (incluye evolución del rol docente en Modelo 3+5). Campaña "La educación que merecemos".',
          timeline: 'Mes 0-24',
          dependencies: ['Demostración: 50 Escuelas del Futuro'],
          orderIndex: 4,
        },
      ],
    },
    kpis: [
      {
        id: 'posicion-pisa',
        metric: 'Posición PISA (lectura)',
        currentValue: 63,
        targetValue: 20,
        unit: 'puesto mundial',
        source: 'PISA 2022 / Objetivo PLANEDU',
        milestones: [
          { date: 'Año 5', targetValue: 50 },
          { date: 'Año 10', targetValue: 30 },
          { date: 'Año 15', targetValue: 20 },
        ],
      },
      {
        id: 'graduacion-secundaria',
        metric: 'Tasa de Graduación Secundaria',
        currentValue: 53,
        targetValue: 85,
        unit: '%',
        source: 'Observatorio Argentinos por la Educación',
        milestones: [
          { date: 'Año 5', targetValue: 60 },
          { date: 'Año 10', targetValue: 75 },
          { date: 'Año 15', targetValue: 85 },
        ],
      },
      {
        id: 'bilinguismo-b2',
        metric: 'Bilingüismo B2+ Inglés (egresados 16 años)',
        currentValue: 5,
        targetValue: 70,
        unit: '%',
        source: 'PLANEDU — Objetivo Pilar IV',
        milestones: [
          { date: 'Año 5', targetValue: 15 },
          { date: 'Año 10', targetValue: 40 },
          { date: 'Año 15', targetValue: 70 },
        ],
      },
      {
        id: 'escuelas-del-futuro',
        metric: 'Escuelas del Futuro Operativas',
        currentValue: 0,
        targetValue: 500,
        unit: 'escuelas',
        source: 'PLANEDU — Pilar III',
        milestones: [
          { date: 'Año 3', targetValue: 50 },
          { date: 'Año 7', targetValue: 200 },
          { date: 'Año 10', targetValue: 500 },
        ],
      },
      {
        id: 'maestros-creadores',
        metric: 'Maestros Creadores Formados',
        currentValue: 0,
        targetValue: 25000,
        unit: 'docentes',
        source: 'PLANEDU — Pilar I',
        milestones: [
          { date: 'Año 2', targetValue: 2000 },
          { date: 'Año 5', targetValue: 5000 },
          { date: 'Año 10', targetValue: 25000 },
        ],
      },
      {
        id: 'salario-docente',
        metric: 'Salario Docente Promedio (EdF)',
        currentValue: 500,
        targetValue: 2500,
        unit: 'USD/mes',
        source: 'PLANEDU — Tabla de Escalamiento Salarial',
        milestones: [
          { date: 'Año 3', targetValue: 1200 },
          { date: 'Año 7', targetValue: 1800 },
          { date: 'Año 12', targetValue: 2500 },
        ],
      },
      {
        id: 'lectura-recuperacion',
        metric: 'Recuperación Lectora (Leer para Encender)',
        currentValue: 0,
        targetValue: 90,
        unit: '% recuperados',
        source: 'PLANEDU — Leer para Encender (Sección 4.5)',
        milestones: [
          { date: 'Año 5', targetValue: 60 },
          { date: 'Año 10', targetValue: 80 },
          { date: 'Año 15', targetValue: 90 },
        ],
      },
      {
        id: 'horas-taller',
        metric: 'Horas de Taller por Alumno/Año (EdF)',
        currentValue: 0,
        targetValue: 600,
        unit: 'horas/año',
        source: 'PLANEDU — Modelo 3+5 (Sección 4.6)',
        milestones: [
          { date: 'Año 3', targetValue: 600 },
          { date: 'Año 7', targetValue: 600 },
          { date: 'Año 15', targetValue: 600 },
        ],
      },
    ],
    tags: ['educación', 'maestros creadores', 'siete capacidades', 'inteligencia artificial', 'bilingüismo', 'portfolio', 'escuelas del futuro', 'leer para encender', 'modelo 3+5', 'emprendimientos estudiantiles', 'Alpha School', 'PAA 2.0'],
    relatedInitiativeSlugs: ['planisv-infraestructura-suelo-vivo', 'plan24cn-24-ciudades-nuevas', 'planrep-reconversion-empleo-publico', 'planjus-justicia-popular'],
    sources: [
      { title: 'PLANEDU — Plan Nacional de Refundación Educativa (Documento Estratégico, Mar 2026)' },
      { title: 'PISA 2022 — Resultados Argentina (OCDE)' },
      { title: 'Observatorio Argentinos por la Educación — Indicadores educativos' },
      { title: 'Hanushek & Woessmann — The Knowledge Capital of Nations (2015)' },
      { title: 'Heckman — The Economics of Human Potential (Perry Preschool / Abecedarian)' },
      { title: 'Russell Ackoff — Idealized Design (Metodología)' },
    ],
  },
  {
    slug: 'planjus-justicia-popular',
    title: 'PLANJUS',
    subtitle: 'Plan Nacional de Justicia Popular y Resolución de Conflictos',
    category: 'justicia',
    summary: 'El sistema judicial argentino tarda entre 3 y 11 años en resolver un caso, cuesta miles de dólares, y tiene menos del 20% de confianza ciudadana. PLANJUS propone un sistema de justicia popular con paneles ciudadanos seleccionados por sorteo democrático que resuelven conflictos en 15, 45 o 90 días — gratuito, transparente, e incorruptible por diseño arquitectónico.',
    iconName: 'Scale',
    documentFile: 'PLANJUS_Argentina_ES.md',
    elProblema: {
      title: 'El Problema',
      content: `<p>El sistema judicial argentino es una enfermedad autoinmune: el sistema que existe para proteger al ciudadano se convirtió en el sistema que lo enferma. Lo enferma con años de espera, con costos que no puede pagar, y con una impunidad que le demuestra, caso tras caso, que la justicia no es para él.</p>
<p>Un juicio civil tarda entre 3 y 6 años. Un juicio laboral entre 3 y 5 años. Las causas por corrupción tardan un promedio de 4.161 días — más de 11 años. Más del 50% de los presos están sin condena. La confianza ciudadana en la justicia es inferior al 20%.</p>
<p>El 96% del presupuesto del Poder Judicial federal se destina a salarios. Solo el 4% se invierte en tecnología, infraestructura o mejora. El sistema no está roto por falta de recursos — está diseñado para protegerse a sí mismo: cada regla procesal que agrega un paso protege al abogado que cobra por hora, cada apelación sin costo protege al que tiene más recursos para litigar, cada año de demora protege al poderoso que puede esperar y destruye al débil que no puede.</p>
<p>El costo económico de la injusticia se estima en USD 23.000–43.000 millones anuales (5–8% del PBI), contando contratos incumplidos sin resolución, desincentivo a la inversión, informalidad laboral sostenida, y el costo directo del sistema judicial.</p>`,
      pullQuote: 'La justicia argentina no está rota. Está funcionando exactamente como fue diseñada: para protegerse a sí misma.',
      stats: [
        { label: 'Duración promedio juicio civil', value: '3-6 años' },
        { label: 'Causas de corrupción', value: '11,4 años' },
        { label: 'Presos sin condena', value: '>50%' },
        { label: 'Confianza ciudadana', value: '<20%' },
        { label: 'Presupuesto judicial en salarios', value: '96%' },
        { label: 'Costo de la injusticia / año', value: 'USD 23-43 mil M' },
      ],
    },
    quePasaSiNoCambiamos: {
      title: '¿Qué pasa si no cambiamos?',
      content: `<p>Sin una alternativa funcional al sistema judicial, la Argentina seguirá pagando un costo de entre USD 23.000 y 43.000 millones anuales en justicia disfuncional — más que el presupuesto combinado de educación y salud.</p>
<p>La informalidad laboral se perpetúa porque los empleadores saben que un juicio laboral tarda 5 años. La inversión no llega porque la seguridad jurídica es una ficción. Las PyMEs quiebran porque un contrato incumplido no puede resolverse a tiempo. Los alquileres se vuelven un campo de batalla donde gana el que puede esperar, no el que tiene razón.</p>
<p>La confianza institucional seguirá erosionándose. Un pueblo que no confía en su sistema de justicia resuelve las cosas por mano propia, acepta el abuso porque reclamar es peor, y deja de creer en las reglas. La crisis de justicia no es solo jurídica — es social, económica, y democrática.</p>
<p>Cada año sin cambio profundiza la captura del sistema por sus beneficiarios: la casta judicial, los colegios de abogados, y los actores poderosos que usan la lentitud como arma. El costo de la inacción crece exponencialmente porque la desconfianza se retroalimenta.</p>`,
      pullQuote: 'Cada caso que dura una década le enseña a la sociedad que reclamar es inútil. La injusticia no solo daña a la víctima — mata la confianza de todos.',
      stats: [
        { label: 'Costo acumulado 10 años sin cambio', value: 'USD 230-430 mil M' },
        { label: 'Inversión perdida por inseguridad jurídica', value: 'USD 8-15 mil M/año' },
        { label: 'Informalidad laboral sostenida', value: '35-40%' },
        { label: 'Contratos irresueltos / año', value: 'USD 5-10 mil M' },
      ],
    },
    elDisenoIdeal: {
      title: 'El Diseño Ideal',
      content: `<p><strong>PLANJUS</strong> es un sistema de justicia popular que funciona como un sistema inmunológico: distribuido en todo el cuerpo social, sin punto único de fallo, proporcional en su respuesta, adaptativo, y antifragil — se vuelve más fuerte cada vez que alguien intenta corromperlo.</p>
<p><strong>Tres niveles JUS:</strong> JUS-1 para conflictos simples (consumo, deudas menores, vecindad) resueltos en 15 días por plataforma digital. JUS-2 para conflictos medianos (laborales, vivienda, comerciales) resueltos en 45 días con modelo híbrido. JUS-3 para conflictos complejos (familia, custodia, herencias) resueltos en 90 días en Casas JUS presenciales.</p>
<p><strong>Paneles ciudadanos por sorteo:</strong> No jueces de carrera sino ciudadanos capacitados, seleccionados al azar por algoritmo público y auditable, que rotan después de cada caso. Imposibles de capturar porque nadie sabe quiénes van a ser hasta que el caso empieza.</p>
<p><strong>Triple candado anticorrupción:</strong> (1) Imposibilidad estructural — el sorteo aleatorio hace que sobornar sea matemáticamente irracional. (2) Transparencia radical — cada decisión es pública y verificable, registrada en sistema inmutable. (3) Incentivos económicos — ser honesto paga más que ser corrupto, por diseño.</p>
<p><strong>Sin abogado obligatorio:</strong> Las partes se representan a sí mismas. Salvaguardas arquitectónicas (piso de derechos, consistencia asistida por IA, apelación automática) reemplazan la función protectora del abogado con mecanismos más confiables y gratuitos.</p>
<p><strong>Justicia restaurativa:</strong> El foco está en reparar el daño, no en castigar al infractor. Las víctimas reportan 100% más satisfacción en procesos restaurativos que en la justicia tradicional.</p>
<p><strong>Absorción gradual:</strong> PLANJUS comienza como complemento del sistema judicial ("le sacamos carga"), se convierte en la opción preferida del pueblo por velocidad y calidad, y termina siendo el sistema de facto — sin confrontación, por excelencia.</p>`,
      pullQuote: 'La justicia no es un edificio al que tenés que ir a suplicar. Es un río que fluye hacia donde la gente está.',
      stats: [
        { label: 'Resolución JUS-1', value: '15 días' },
        { label: 'Resolución JUS-2', value: '45 días' },
        { label: 'Resolución JUS-3', value: '90 días' },
        { label: 'Costo para el ciudadano', value: 'Gratuito' },
        { label: 'ROI estimado (15 años)', value: '6:1 a 10:1' },
        { label: 'Satisfacción objetivo', value: '>70%' },
      ],
    },
    elCamino: {
      overview: 'PLANJUS se despliega en tres fases: "El Alivio" (complemento que demuestra resultados), "La Preferencia" (la gente elige PLANJUS masivamente), y "La Sucesión Natural" (PLANJUS se convierte en el sistema de justicia de facto). La estrategia es ganar por excelencia, no por confrontación.',
      steps: [
        {
          id: 1,
          title: 'Ley de Justicia Popular y creación de ANJUS',
          description: 'Sanción de la ley habilitante que crea la Agencia Nacional de Justicia Popular (ANJUS), establece los tres niveles JUS, reconoce resoluciones con fuerza ejecutoria, y elimina el patrocinio letrado obligatorio para procedimientos PLANJUS.',
          timeline: 'Año 0',
          dependencies: [],
          orderIndex: 1,
        },
        {
          id: 2,
          title: 'Plataforma digital y primeras 50 Casas JUS',
          description: 'Desarrollo del MVP de la plataforma digital PLANJUS, construcción o adaptación de las primeras 50 Casas JUS en 4 provincias piloto, y formación del primer contingente de 1.000 panelistas JUS-1.',
          timeline: 'Año 0-1',
          dependencies: ['1'],
          orderIndex: 2,
        },
        {
          id: 3,
          title: 'Fase 1 — El Alivio: Lanzamiento en 4 provincias piloto',
          description: 'JUS-1 operativo completo en 4 provincias. 500.000 casos resueltos en el primer año. Satisfacción >65%. Demostración de velocidad y calidad. Expansión a 12 provincias al tercer año con 2 millones de casos/año.',
          timeline: 'Años 1-3',
          dependencies: ['2'],
          orderIndex: 3,
        },
        {
          id: 4,
          title: 'Fase 2 — La Preferencia: Cobertura nacional + JUS-2 y JUS-3',
          description: 'Cobertura en 24 provincias + CABA. JUS-1, JUS-2 y JUS-3 operativos. 5+ millones de casos/año. 70% de conflictos civiles/comerciales/laborales en PLANJUS. 500+ Casas JUS. Inicio de reasignación presupuestaria desde el sistema judicial.',
          timeline: 'Años 3-7',
          dependencies: ['3'],
          orderIndex: 4,
        },
        {
          id: 5,
          title: 'Fase 3 — La Sucesión Natural: PLANJUS como sistema primario',
          description: '90%+ de conflictos en PLANJUS. Reforma constitucional para formalizar. Sistema judicial tradicional reducido a jurisdicción penal compleja y constitucional. Argentina como referente internacional en justicia comunitaria.',
          timeline: 'Años 7-15',
          dependencies: ['4'],
          orderIndex: 5,
        },
      ],
    },
    kpis: [
      {
        id: 'tiempo-resolucion-jus1',
        metric: 'Tiempo Promedio Resolución JUS-1',
        currentValue: 0,
        targetValue: 7,
        unit: 'días',
        source: 'PLANJUS — Tablero Nacional de Justicia',
        milestones: [
          { date: 'Año 1', targetValue: 15 },
          { date: 'Año 5', targetValue: 10 },
          { date: 'Año 10', targetValue: 7 },
        ],
      },
      {
        id: 'satisfaccion-ciudadana',
        metric: 'Satisfacción Ciudadana con PLANJUS',
        currentValue: 20,
        targetValue: 85,
        unit: '%',
        source: 'PLANJUS — Evaluación post-resolución',
        milestones: [
          { date: 'Año 1', targetValue: 65 },
          { date: 'Año 5', targetValue: 75 },
          { date: 'Año 10', targetValue: 85 },
        ],
      },
      {
        id: 'casos-resueltos-ano',
        metric: 'Casos Resueltos por Año',
        currentValue: 0,
        targetValue: 5000000,
        unit: 'casos',
        source: 'PLANJUS — Tablero Nacional de Justicia',
        milestones: [
          { date: 'Año 1', targetValue: 500000 },
          { date: 'Año 3', targetValue: 2000000 },
          { date: 'Año 7', targetValue: 5000000 },
        ],
      },
      {
        id: 'casas-jus',
        metric: 'Casas JUS Operativas',
        currentValue: 0,
        targetValue: 800,
        unit: 'casas',
        source: 'PLANJUS — Despliegue territorial',
        milestones: [
          { date: 'Año 1', targetValue: 50 },
          { date: 'Año 3', targetValue: 200 },
          { date: 'Año 7', targetValue: 500 },
          { date: 'Año 10', targetValue: 800 },
        ],
      },
      {
        id: 'panelistas-activos',
        metric: 'Panelistas Ciudadanos Activos',
        currentValue: 0,
        targetValue: 50000,
        unit: 'panelistas',
        source: 'PLANJUS — Sistema de sorteo democrático',
        milestones: [
          { date: 'Año 1', targetValue: 5000 },
          { date: 'Año 3', targetValue: 20000 },
          { date: 'Año 7', targetValue: 50000 },
        ],
      },
      {
        id: 'tasa-cumplimiento',
        metric: 'Tasa de Cumplimiento de Resoluciones',
        currentValue: 55,
        targetValue: 92,
        unit: '%',
        source: 'PLANJUS — Ejecución y seguimiento',
        milestones: [
          { date: 'Año 1', targetValue: 75 },
          { date: 'Año 5', targetValue: 85 },
          { date: 'Año 10', targetValue: 92 },
        ],
      },
    ],
    tags: ['justicia', 'paneles ciudadanos', 'sorteo democrático', 'anticorrupción', 'justicia restaurativa', 'desregulación', 'Casas JUS', 'transparencia', 'resolución de conflictos'],
    relatedInitiativeSlugs: ['planisv-infraestructura-suelo-vivo', 'plan24cn-24-ciudades-nuevas', 'planrep-reconversion-empleo-publico', 'planedu-refundacion-educativa'],
    sources: [
      { title: 'PLANJUS — Plan Nacional de Justicia Popular y Resolución de Conflictos (Documento Estratégico, Mar 2026)' },
      { title: 'PISA Judicial — Duración de causas de corrupción en Argentina (4.161 días promedio)' },
      { title: 'Kleros — Decentralized Justice & Blockchain Arbitration (Stanford Law)' },
      { title: 'México — Ley General de Mecanismos Alternativos de Solución de Controversias (2024)' },
      { title: 'Rwanda — Gacaca Courts: 1.9 millones de casos procesados (2002-2012)' },
      { title: 'Tyler — Procedural Justice: satisfaction and legitimacy research' },
      { title: 'Ostrom — Governing the Commons: Design Principles (Nobel 2009)' },
      { title: 'Fulham et al. — Meta-analysis of Restorative Justice Programs (2025)' },
    ],
  },

  // PLANSAL — Salud Integral y Vitalidad Popular
  {
    slug: 'plansal-salud-integral',
    title: 'PLANSAL',
    subtitle: 'Plan Nacional de Salud Integral y Vitalidad Popular',
    category: 'salud',
    summary: 'La Argentina gasta ~10% del PBI en salud con resultados de país en desarrollo: 28% de obesidad adulta, 12.7% de diabetes tipo 2, y menos del 30% de satisfacción ciudadana. PLANSAL propone la primera arquitectura que cultiva vitalidad en vez de administrar enfermedad, con 3.000 Centros de Vitalidad barriales, 25.000 Familias Mentoras, y un retorno estimado de 12:1 a 20:1 en 10 años.',
    iconName: 'HeartPulse',
    documentFile: 'PLANSAL_Argentina_ES.md',
    elProblema: {
      title: 'El Problema',
      content: `<p>La Argentina gasta aproximadamente el 10% de su PBI en salud — comparable a Alemania — pero obtiene resultados de país en desarrollo. El 28.3% de los adultos son obesos. El 12.7% tiene diabetes tipo 2. Cinco millones de personas tienen depresión diagnosticada. El 64.9% de adultos son sedentarios. Más del 30% de las calorías provienen de ultraprocesados. El consumo de psicofármacos es el segundo más alto de América Latina.</p>
<p>El sistema no falla. Funciona exactamente como fue diseñado: para administrar enfermedad, no para cultivar salud. Cada enfermedad crónica es un cliente de por vida — medicamentos, estudios, consultas — que nunca se cura pero tampoco se muere. La industria farmacéutica global factura USD 1.6 billones anuales, y el 70% proviene de enfermedades crónicas.</p>
<p>Detrás de cada estadística hay una familia como los Ramírez de Lomas de Zamora: Ricardo con hipertensión por estrés laboral crónico, Silvia con depresión y clonazepam, Tomás de 16 años con ataques de pánico, y Nélida de 72 con diabetes y siete pastillas diarias. No están enfermos porque el sistema de salud falló — están enfermos porque el sistema de vida los enfermó: comida industrial, trabajo sin sentido, incertidumbre económica, aislamiento digital, barrios hostiles.</p>`,
      pullQuote: 'La Argentina no tiene una crisis de salud — tiene un sistema de vida que manufactura enfermedad y un sistema médico que la administra como negocio.',
      stats: [
        { label: 'Gasto en salud (% PBI)', value: '~10%' },
        { label: 'Obesidad adulta', value: '28.3%' },
        { label: 'Diabetes tipo 2', value: '12.7%' },
        { label: 'Depresión diagnosticada', value: '~5M personas' },
      ],
    },
    quePasaSiNoCambiamos: {
      title: '¿Qué pasa si no cambiamos?',
      content: `<p>Sin reconversión, la Fábrica de Enfermos sigue produciendo a pleno. La Argentina gasta USD 26.000 millones por año tratando enfermedad crónica prevenible. Cada día sin cambio son USD 70 millones quemados en tratar lo que podría prevenirse con un décimo de ese costo.</p>
<p>La diabetes tipo 2 cuesta ~USD 5.500M/año. Las enfermedades cardiovasculares prevenibles cuestan ~USD 4.500M/año. La medicación psicofarmacológica crónica consume ~USD 2.200M/año. La pérdida de productividad por presentismo y discapacidad suma ~USD 4.200M/año.</p>
<p>La fábrica opera en cinco fases: envenenamiento silencioso (comida industrial, agua contaminada, aire tóxico), desconexión progresiva (trabajo sin sentido, estrés crónico), escape (alcohol, pantallas, psicofármacos), síntoma (el cuerpo habla), y captura (paciente crónico de por vida). El ciclo se acelera con cada generación. Tomás, con 16 años, ya tiene diagnóstico psiquiátrico.</p>`,
      pullQuote: 'La Argentina no puede pagar la fábrica de enfermos. Cada día que pasa sin reconvertir el sistema son setenta millones de dólares en tratar lo que podría prevenir.',
      stats: [
        { label: 'Costo anual enfermedad prevenible', value: 'USD 26.000M' },
        { label: 'Diabetes tipo 2 / año', value: 'USD 5.500M' },
        { label: 'Pérdida de productividad', value: 'USD 4.200M/año' },
        { label: 'Equivalente diario quemado', value: 'USD 70M/día' },
      ],
    },
    elDisenoIdeal: {
      title: 'El Diseño Ideal',
      content: `<p>PLANSAL propone la primera arquitectura integral de salud que no gestiona enfermedad sino que cultiva vitalidad, organizada en torno a las 12 Raíces de la Salud: alimentación, movimiento, sueño, propósito, vínculo, entorno, trabajo, economía, espiritualidad, creatividad, aprendizaje y comunidad.</p>
<p>Cuatro pilares de infraestructura: una <strong>Red Nacional de Centros de Vitalidad</strong> (3.000+, uno por barrio, operados por la comunidad), un <strong>Sistema de Familias Mentoras</strong> (25.000+ familias que transmiten bienestar horizontalmente), <strong>Ancianos de Sabiduría</strong> (5M+ adultos mayores reposicionados como activos comunitarios), y una <strong>Plataforma Digital Nacional</strong> de autodiagnóstico por las 12 dimensiones.</p>
<p>La reconversión del sistema médico opera en 3 fases a lo largo de 15 años: de la coexistencia a la especialización hospitalaria en emergencias y trauma, mientras las enfermedades crónicas prevenibles migran a los Centros de Vitalidad. Se funda en un Pacto de Co-responsabilidad: el Estado deja de envenenar, el ciudadano elige sanarse.</p>`,
      pullQuote: 'PLANSAL no es un plan de hospitales — es un plan de transformación humana.',
      stats: [
        { label: 'Inversión total (10 años)', value: 'USD 6.000M' },
        { label: 'Retorno por peso invertido', value: '12-20x a 10 años' },
        { label: 'Centros de Vitalidad', value: '3.000+' },
        { label: 'Familias Mentoras', value: '25.000+' },
      ],
    },
    elCamino: {
      overview: 'Cuatro fases en 15 años: demostrar antes de escalar, medir antes de expandir, convencer con hechos antes de pedir confianza. Cada fase tiene métricas claras y condiciones para avanzar.',
      steps: [
        { id: 1, title: 'Fase 0 — Preparar', description: 'Crear ANVIP (agencia), seleccionar 10 barrios piloto diversos, reclutar primeras 100 Familias Mentoras, desarrollar Plataforma v1, entrenar 50 Guías de Vitalidad, presentar Ley de Vitalidad Popular al Congreso.', timeline: 'Meses 1-6', dependencies: [], orderIndex: 1 },
        { id: 2, title: 'Fase 1 — Demostrar', description: '10 Centros de Vitalidad operativos, 1.000 Familias Mentoras activas, medición cuasi-experimental rigurosa (barrios con Centro vs barrios control), primeros resultados publicados.', timeline: 'Años 1-3', dependencies: ['Fase 0 completa'], orderIndex: 2 },
        { id: 3, title: 'Fase 2 — Escalar', description: '500 Centros, 5.000 Familias Mentoras, integración formal con obras sociales y PAMI, redireccionamiento de presupuesto basado en evidencia, expansión rural, 7 leyes promulgadas.', timeline: 'Años 3-7', dependencies: ['Fase 1 con resultados demostrados'], orderIndex: 3 },
        { id: 4, title: 'Fase 3 — Consolidar', description: '3.000+ Centros (80% cobertura barrial), 25.000+ Familias Mentoras (red autosustentable), sistema dual consolidado: hospitales para emergencias, Centros para vitalidad. Argentina como referencia mundial.', timeline: 'Años 7-15', dependencies: ['Fase 2 escalada exitosamente'], orderIndex: 4 },
      ],
    },
    kpis: [
      {
        id: 'hale',
        metric: 'Esperanza de Vida Saludable (HALE)',
        currentValue: 66,
        targetValue: 71,
        unit: 'años',
        source: 'PLANSAL — Tablero Nacional de Vitalidad',
        milestones: [
          { date: 'Año 5', targetValue: 68 },
          { date: 'Año 10', targetValue: 71 },
        ],
      },
      {
        id: 'diabetes-prevalencia',
        metric: 'Prevalencia Diabetes Tipo 2',
        currentValue: 12.7,
        targetValue: 7.6,
        unit: '%',
        source: 'PLANSAL — Indicador de enfermedad crónica',
        milestones: [
          { date: 'Año 5', targetValue: 10 },
          { date: 'Año 10', targetValue: 7.6 },
        ],
      },
      {
        id: 'centros-vitalidad',
        metric: 'Centros de Vitalidad Operativos',
        currentValue: 0,
        targetValue: 3000,
        unit: 'centros',
        source: 'PLANSAL — Red Nacional',
        milestones: [
          { date: 'Año 3', targetValue: 10 },
          { date: 'Año 7', targetValue: 500 },
          { date: 'Año 15', targetValue: 3000 },
        ],
      },
      {
        id: 'sedentarismo',
        metric: 'Sedentarismo en Adultos',
        currentValue: 64.9,
        targetValue: 39,
        unit: '%',
        source: 'PLANSAL — Indicador de movimiento',
        milestones: [
          { date: 'Año 5', targetValue: 55 },
          { date: 'Año 10', targetValue: 39 },
        ],
      },
      {
        id: 'satisfaccion-salud',
        metric: 'Satisfacción Ciudadana con Salud Propia',
        currentValue: 40,
        targetValue: 70,
        unit: '%',
        source: 'PLANSAL — Encuesta Nacional',
        milestones: [
          { date: 'Año 5', targetValue: 55 },
          { date: 'Año 10', targetValue: 70 },
        ],
      },
    ],
    tags: ['salud', 'vitalidad', 'prevención', 'centros barriales', 'familias mentoras', 'enfermedad crónica', 'alimentación', 'bienestar', '12 raíces'],
    relatedInitiativeSlugs: ['planisv-infraestructura-suelo-vivo', 'plan24cn-24-ciudades-nuevas', 'planrep-reconversion-empleo-publico', 'planedu-refundacion-educativa', 'planjus-justicia-popular'],
    sources: [
      { title: 'PLANSAL — Plan Nacional de Salud Integral y Vitalidad Popular (Documento Estratégico, Mar 2026)' },
      { title: 'OMS — Esperanza de vida saludable (HALE) por país' },
      { title: 'Ministerio de Salud — Encuesta Nacional de Factores de Riesgo (ENFR 4ta edición)' },
      { title: 'Krishnamurti — No es signo de buena salud estar bien adaptado a una sociedad enferma' },
      { title: 'Russell Ackoff — Idealized Design (Metodología)' },
    ],
  },

  // PLANEB — Empresas Bastardas y Soberanía Económica Popular
  {
    slug: 'planeb-empresas-bastardas',
    title: 'PLANEB',
    subtitle: 'Plan Nacional de Empresas Bastardas y Soberanía Económica Popular',
    category: 'economia',
    summary: 'Los argentinos pierden entre USD 10.600 y 21.950 millones al año en extracción sobre costos reales en servicios esenciales. PLANEB propone Empresas Bastardas — entidades sin dueño, sin accionistas, gobernadas como DAOs, que proveen servicios al costo real con transparencia radical — como referencia de precio que discipline al mercado entero.',
    iconName: 'Store',
    documentFile: 'PLANEB_Argentina_ES.md',
    elProblema: {
      title: 'El Problema',
      content: `<p>Los mercados argentinos de servicios esenciales — seguros, banca, telecomunicaciones, energía, salud prepaga — operan sobre una asimetría de información estructural: el ciudadano no puede saber cuánto cuesta realmente proveer el servicio que consume, y esa opacidad es el mecanismo central de extracción de valor.</p>
<p>La facturación combinada de estos cinco sectores alcanza entre USD 49.000 y 65.000 millones anuales. De ese total, entre USD 10.600 y 21.950 millones no compran ningún servicio — van a márgenes de ganancia, ineficiencias administrativas infladas, comisiones intermediarias y ejecutivos que cobran bonus por "optimizar la rentabilidad."</p>
<p>Una familia tipo como los Moretti de Caballito paga entre $650.000 y $850.000 por año en extracción pura — dinero que no compra protección, ni conectividad, ni salud. Es un viaje familiar que nunca van a hacer, una operación dental que postergan, las clases de inglés que "este mes no se puede." La opacidad no es un error del sistema — es el negocio.</p>`,
      pullQuote: 'Un mercado sin transparencia no es un mercado libre — es un mecanismo de extracción con buenas relaciones públicas.',
      stats: [
        { label: 'Extracción anual total', value: 'USD 10.600-21.950M' },
        { label: 'Facturación sectores esenciales', value: 'USD 49.000-65.000M' },
        { label: 'ROE bancario (vs 8-12% global)', value: '25-40%' },
        { label: 'Extracción por hogar / año', value: '$650.000-$850.000' },
      ],
    },
    quePasaSiNoCambiamos: {
      title: '¿Qué pasa si no cambiamos?',
      content: `<p>Sin cambio estructural, la máquina de extracción continúa sin freno. La regulación ha demostrado ser estructuralmente incapaz de cerrar la brecha — cada mecanismo (topes de precio, publicación de balances, multas, control de calidad, defensa del consumidor) falla porque opera desde fuera de la opacidad en vez de eliminarla.</p>
<p>Los topes de precio hacen que la empresa ajuste la calidad hacia abajo. Las multas son una fracción de la ganancia — se convierten en costo operativo. Los balances se publican en jerga contable diseñada para que nadie entienda. La defensa del consumidor resuelve caso por caso sin cambiar la estructura del mercado.</p>
<p>La extracción de USD 10.600-21.950M anuales supera el presupuesto nacional de educación, el de salud, y los intereses de la deuda externa. Multiplicada por los 14 millones de hogares argentinos, es la razón invisible por la que la clase media siempre llega "raspando" a fin de mes.</p>`,
      pullQuote: 'La opacidad no es un error del sistema. Es el negocio.',
      stats: [
        { label: 'Extracción anual sostenida', value: 'USD 10.600-21.950M' },
        { label: 'Más que el presupuesto de educación', value: 'Sí' },
        { label: 'Más que el presupuesto de salud', value: 'Sí' },
        { label: 'Hogares afectados', value: '14 millones' },
      ],
    },
    elDisenoIdeal: {
      title: 'El Diseño Ideal',
      content: `<p>PLANEB propone el derecho de los ciudadanos a crear <strong>Empresas Bastardas</strong> — entidades constituidas como Fideicomisos de Propósito Perpetuo, gobernadas como DAOs (Organizaciones Autónomas Descentralizadas), sin dueño, sin accionistas, sin fines de lucro, que proveen servicios esenciales al costo real con transparencia radical: cada peso que entra y cada peso que sale es auditable en tiempo real por cualquier ciudadano.</p>
<p>La <strong>Red Bastarda</strong> — la red de Empresas Bastardas interconectadas — opera sobre el <strong>Protocolo Bastardo</strong>, infraestructura compartida open-source con identidad descentralizada, tesorería on-chain, gobernanza por sorteo democrático, y un motor de transparencia que publica automáticamente cada dato financiero.</p>
<p>La primera Bastarda ataca el sector de seguros: producto obligatorio, alta demanda, riesgo bien modelado. Los usuarios pagan el costo real dinámico con un techo mensual. La capitalización es ciudadana: 25.000 fundadores eliminan la necesidad de inversores. El ROI social es de 6:1 a 20:1 en cinco años.</p>`,
      pullQuote: 'Bastarda: sin padre, sin dueño, sin patrón. Pero con propósito, con transparencia, con la gente.',
      stats: [
        { label: 'Ahorro por usuario', value: '20-35%' },
        { label: 'Inversión primera Bastarda', value: 'USD 8-17M' },
        { label: 'ROI social a 5 años', value: '6:1 a 20:1' },
        { label: 'Ahorro ciudadano Año 5', value: 'USD 90-180M/año' },
      ],
    },
    elCamino: {
      overview: 'Modelo de cascada: cada Bastarda exitosa hace la siguiente más barata, más rápida y más confiable. La primera construye todo el Protocolo; para la quinta, el 95% de la infraestructura ya existe.',
      steps: [
        { id: 1, title: 'Año 0 — Fundación', description: 'PLANEB publicado. ANEB constituida. Protocolo Bastardo v1.0 desarrollado. Petición de la Bastarda Aseguradora lanzada. 25.000 firmantes reunidos.', timeline: 'Pre-lanzamiento', dependencies: [], orderIndex: 1 },
        { id: 2, title: 'Año 1 — Bastarda Aseguradora', description: 'Primera Empresa Bastarda constituida y lanzada públicamente con producto de responsabilidad civil automotor. 10.000 usuarios. Licencia SSN obtenida.', timeline: 'Meses 1-18', dependencies: ['ANEB operativa', 'Protocolo v1.0'], orderIndex: 2 },
        { id: 3, title: 'Año 2 — Expansión Aseguradora', description: 'Multi-producto (auto + hogar + micro-pólizas). 30.000 usuarios. Petición de Bastarda Financiera alcanza 25.000 firmas.', timeline: 'Meses 19-36', dependencies: ['Bastarda Aseguradora operativa'], orderIndex: 3 },
        { id: 4, title: 'Año 3 — Bastarda Financiera', description: 'Bastarda bancaria en piloto. Bastarda Conectada (telecom) en fase de petición. Red de 80.000 usuarios totales.', timeline: 'Año 3', dependencies: ['80% del Protocolo reutilizable'], orderIndex: 4 },
        { id: 5, title: 'Año 4 — Expansión de Red', description: 'Bastarda Conectada + Bastarda Energética en estudio. Primera ciudad PLAN24CN con servicios Bastardos. 150.000 usuarios.', timeline: 'Año 4', dependencies: ['Múltiples Bastardas operativas'], orderIndex: 5 },
        { id: 6, title: 'Año 5 — Red Bastarda a Escala', description: '5+ Bastardas activas. Ahorro ciudadano >USD 100M/año. Ley de Entidades de Propósito Perpetuo en el Congreso. 300.000+ usuarios.', timeline: 'Año 5', dependencies: ['Efecto cascada', '95% Protocolo reutilizable'], orderIndex: 6 },
      ],
    },
    kpis: [
      {
        id: 'usuarios-red',
        metric: 'Usuarios Totales de la Red Bastarda',
        currentValue: 0,
        targetValue: 300000,
        unit: 'usuarios',
        source: 'PLANEB — Tablero Nacional',
        milestones: [
          { date: 'Año 1', targetValue: 10000 },
          { date: 'Año 3', targetValue: 80000 },
          { date: 'Año 5', targetValue: 300000 },
        ],
      },
      {
        id: 'ahorro-ciudadano',
        metric: 'Ahorro Ciudadano Acumulado',
        currentValue: 0,
        targetValue: 180,
        unit: 'USD M/año',
        source: 'PLANEB — Impacto económico',
        milestones: [
          { date: 'Año 1', targetValue: 3 },
          { date: 'Año 3', targetValue: 40 },
          { date: 'Año 5', targetValue: 180 },
        ],
      },
      {
        id: 'bastardas-activas',
        metric: 'Bastardas Activas',
        currentValue: 0,
        targetValue: 5,
        unit: 'entidades',
        source: 'PLANEB — Red Bastarda',
        milestones: [
          { date: 'Año 1', targetValue: 1 },
          { date: 'Año 3', targetValue: 2 },
          { date: 'Año 5', targetValue: 5 },
        ],
      },
      {
        id: 'sectores-referencia',
        metric: 'Sectores con Referencia Transparente',
        currentValue: 0,
        targetValue: 5,
        unit: 'sectores',
        source: 'PLANEB — Impacto de mercado',
        milestones: [
          { date: 'Año 2', targetValue: 1 },
          { date: 'Año 4', targetValue: 3 },
          { date: 'Año 5', targetValue: 5 },
        ],
      },
    ],
    tags: ['empresas bastardas', 'DAO', 'transparencia radical', 'costo real', 'cero propiedad', 'Red Bastarda', 'Protocolo Bastardo', 'ANEB', 'seguros', 'banca', 'telecomunicaciones', 'soberanía económica'],
    relatedInitiativeSlugs: ['planrep-reconversion-empleo-publico', 'planjus-justicia-popular', 'plansus-soberania-sustancias', 'plan24cn-24-ciudades-nuevas', 'plansal-salud-integral'],
    sources: [
      { title: 'PLANEB — Plan Nacional de Empresas Bastardas y Soberanía Económica Popular (Documento Estratégico, Mar 2026)' },
      { title: 'SSN — Balances de aseguradoras (margen técnico y financiero)' },
      { title: 'BCRA — Informes de rentabilidad bancaria (ROE 25-40%)' },
      { title: 'ENACOM — Reportes de operadoras de telecomunicaciones (EBITDA margins)' },
      { title: 'Ostrom — Governing the Commons: Design Principles (Nobel 2009)' },
      { title: 'Russell Ackoff — Idealized Design (Metodología)' },
    ],
  },

  // PLANSUS — Soberanía sobre Sustancias
  {
    slug: 'plansus-soberania-sustancias',
    title: 'PLANSUS',
    subtitle: 'Plan Nacional de Soberanía sobre Sustancias y Desarrollo Productivo del Conocimiento Expandido',
    category: 'instituciones',
    summary: 'La prohibición le regaló al narcotráfico un mercado de USD 3.000-8.000M anuales que no paga impuestos, no controla calidad y mata gente. PLANSUS propone la ruptura soberana con las convenciones de la ONU y una regulación integral en cascada: cannabis en el Año 1, psicodélicos terapéuticos en el Año 3, regulación completa en el Año 5. ROI estimado 5:1 a 15:1.',
    iconName: 'FlaskConical',
    documentFile: 'PLANSUS_Argentina_ES.md',
    elProblema: {
      title: 'El Problema',
      content: `<p>La prohibición de sustancias en la Argentina es un fracaso absoluto por cualquier métrica. No redujo el consumo, no redujo la oferta, no protegió a los menores, no detuvo al narcotráfico — y le regaló al crimen organizado un mercado de USD 3.000-8.000 millones anuales que no paga impuestos, no controla calidad, no protege trabajadores, y mata gente.</p>
<p>El Estado gasta entre USD 2.000 y 4.000 millones por año en enforcement que captura apenas el 5-15% del flujo de drogas. Por cada peso que el Estado invierte en prohibir, el narco gana entre dos y cuatro pesos. Es la peor inversión de la historia de la política pública argentina.</p>
<p>El costo total estimado de la prohibición — mercado negro, enforcement, costos sanitarios, violencia, corrupción, productividad perdida — alcanza entre USD 7.300 y 20.000M por año, entre el 1,5% y el 4% del PBI. Mientras tanto, el ~40% de los presos federales están encarcelados por infracciones a la ley de drogas, y menos del 3% de los condenados son verdaderos narcotraficantes.</p>`,
      pullQuote: 'La prohibición no combate al narco. Es el modelo de negocio del narco.',
      stats: [
        { label: 'Mercado negro anual', value: 'USD 3.000-8.000M' },
        { label: 'Gasto en enforcement / año', value: 'USD 2.000-4.000M' },
        { label: 'Droga incautada vs flujo total', value: '5-15%' },
        { label: 'Muertes anuales (violencia + adulteración)', value: '2.000-5.000' },
      ],
    },
    quePasaSiNoCambiamos: {
      title: '¿Qué pasa si no cambiamos?',
      content: `<p>Sin reforma, la Argentina sigue perdiendo entre USD 7.300 y 20.000M por año al costo total de la prohibición. El Estado sigue gastando miles de millones en enforcement que captura el 10% del flujo — el narco reinvierte el 90% restante en violencia, corrupción y expansión territorial.</p>
<p>Las cárceles siguen llenas de pibes pobres por tenencia personal mientras los verdaderos narcotraficantes operan con impunidad. Los barrios populares como Las Flores en Rosario siguen siendo campos de batalla donde los conflictos comerciales se resuelven con balas porque no pueden resolverse en juzgados.</p>
<p>Mientras tanto, el mundo avanza. Portugal, Canadá, Uruguay, Colorado, Australia y Oregon ya reformaron. La Argentina queda congelada en un marco de 1961 diseñado por la guerra contra las drogas de Harry Anslinger — obedeciendo un mandato colonial disfrazado de política sanitaria, mientras el país que escribió esas convenciones legaliza en la mitad de sus estados.</p>`,
      pullQuote: 'Encarcerar consumidores y micro-vendedores es la política de salud pública más cara, más cruel y más inútil jamás diseñada.',
      stats: [
        { label: 'Costo total de prohibición / año', value: 'USD 7.300-20.000M' },
        { label: 'Presos federales por drogas', value: '~40% del total' },
        { label: 'Narco-bosses condenados', value: '<3%' },
        { label: 'Impuestos que paga el narco', value: 'USD 0' },
      ],
    },
    elDisenoIdeal: {
      title: 'El Diseño Ideal',
      content: `<p>PLANSUS reemplaza el paradigma de prohibición por uno de soberanía. Cuatro vías de licenciamiento: <strong>Ceremonial</strong> (tradiciones ancestrales, exenta de impuestos), <strong>Terapéutica</strong> (investigación y tratamiento clínico, impuesto reducido 5-8%), <strong>Recreativa/Personal</strong> (tres escalones Micro/Meso/Macro para prevenir monopolios, tributación progresiva 10-30%), e <strong>Industrial</strong> (cáñamo, farmacéutica, exportación).</p>
<p>La <strong>ANSUS</strong> (Agencia Nacional de Soberanía sobre Sustancias) administra el sistema con un directorio de 9 miembros (científicos, sociedad civil, representantes indígenas, sorteo ciudadano), presupuesto constitucional protegido, y auditoría blockchain.</p>
<p>La <strong>Amnistía "El Puente"</strong> ofrece a los operadores del mercado negro una transición hacia la legalidad — porque la única forma de destruir al narcotráfico es quitarle el mercado, no dispararle a sus soldados. Las penalidades para venta a menores son las más duras del continente. Los ingresos proyectados son de USD 2.200-4.400M/año al Año 5.</p>`,
      pullQuote: 'La única forma de destruir al narcotráfico es quitarle el mercado, no dispararle a sus soldados.',
      stats: [
        { label: 'Ingresos proyectados Año 5', value: 'USD 2.200-4.400M/año' },
        { label: 'Empleos directos Año 5', value: '100.000-200.000' },
        { label: 'Costo de implementación (5 años)', value: 'USD 800M-2.200M' },
        { label: 'ROI a 10 años', value: '5:1 a 15:1' },
      ],
    },
    elCamino: {
      overview: 'Cascada controlada en 5 años. La secuencia es fija pero el avance depende de evidencia, no de política. Cada fase avanza solo cuando un sistema tripartito de verificación (ANSUS + evaluadores internacionales + panel ciudadano) confirma que las precondiciones se cumplen.',
      steps: [
        { id: 1, title: 'Pre-Fase — Los Cimientos', description: 'Encuesta nacional de base, 5 laboratorios regionales equipados, equipo ANSUS operativo, safe harbor bancario del BCRA, plataforma de trazabilidad, protocolos DUI, campaña de comunicación.', timeline: '12 meses antes de la ley', dependencies: [], orderIndex: 1 },
        { id: 2, title: 'Fase 1 — El Alivio (Cannabis + Despenalización)', description: 'Ley aprobada. Convenciones ONU denunciadas. Liberación inmediata de presos por tenencia. ANSUS establecida formalmente. Primeras micro-licencias de cannabis. Amnistía Tier 1 operativa. Primeras ventas legales al Mes 6.', timeline: 'Año 1', dependencies: ['10 hitos pre-fase cumplidos'], orderIndex: 2 },
        { id: 3, title: 'Fase 2 — La Expansión (Psicodélicos)', description: 'Legalización completa de psicodélicos (si Gate 2 es verde). Primeros centros terapéuticos licenciados. Vía Ceremonial operativa. Hub de I+D con primeras patentes. Primeras exportaciones de cannabis con denominación de origen.', timeline: 'Años 2-3', dependencies: ['Consumo juvenil estable', 'Mercado negro contraído 20%+'], orderIndex: 3 },
        { id: 4, title: 'Fase 3 — La Soberanía (Regulación Completa)', description: 'MDMA legalizado. Cocaína regulada con controles de pureza/dosis. Todas las sustancias incorporadas. Amnistía Tier 3 completada. Mercado plenamente operativo. Evaluación integral a 5 años publicada.', timeline: 'Años 3-5', dependencies: ['Mercado negro contraído 40%+', 'Sistema de salud absorbiendo demanda'], orderIndex: 4 },
        { id: 5, title: 'Visión 2040', description: 'Mercado negro contraído 90%+. Cannabis es 4to producto agrícola de exportación. Buenos Aires, Córdoba y Mendoza son referentes mundiales en investigación psicodélica. Violencia narco reducida 80%. Presos por drogas cerca de cero.', timeline: '14 años post-implementación', dependencies: ['Cascada completada exitosamente'], orderIndex: 5 },
      ],
    },
    kpis: [
      {
        id: 'mercado-negro',
        metric: 'Contracción del Mercado Negro',
        currentValue: 0,
        targetValue: 90,
        unit: '%',
        source: 'PLANSUS — Tablero Nacional de Sustancias',
        milestones: [
          { date: 'Año 1', targetValue: 10 },
          { date: 'Año 3', targetValue: 40 },
          { date: 'Año 10', targetValue: 90 },
        ],
      },
      {
        id: 'recaudacion-fiscal',
        metric: 'Recaudación Fiscal por Sustancias',
        currentValue: 0,
        targetValue: 1500,
        unit: 'USD M/año',
        source: 'PLANSUS — Ingresos proyectados',
        milestones: [
          { date: 'Año 1', targetValue: 100 },
          { date: 'Año 3', targetValue: 500 },
          { date: 'Año 5', targetValue: 1500 },
        ],
      },
      {
        id: 'muertes-narco',
        metric: 'Muertes por Violencia Narco + Adulteración',
        currentValue: 3500,
        targetValue: 700,
        unit: 'personas/año',
        source: 'PLANSUS — Indicador de seguridad',
        milestones: [
          { date: 'Año 1', targetValue: 2800 },
          { date: 'Año 5', targetValue: 1400 },
          { date: 'Año 10', targetValue: 700 },
        ],
      },
      {
        id: 'empleos-legales',
        metric: 'Empleos Directos en Economía Legal de Sustancias',
        currentValue: 0,
        targetValue: 200000,
        unit: 'empleos',
        source: 'PLANSUS — Desarrollo productivo',
        milestones: [
          { date: 'Año 1', targetValue: 10000 },
          { date: 'Año 3', targetValue: 60000 },
          { date: 'Año 5', targetValue: 200000 },
        ],
      },
      {
        id: 'presos-drogas',
        metric: 'Presos Federales por Delitos de Drogas',
        currentValue: 40,
        targetValue: 2,
        unit: '% del total',
        source: 'PLANSUS — Indicador de justicia',
        milestones: [
          { date: 'Año 1', targetValue: 15 },
          { date: 'Año 3', targetValue: 5 },
          { date: 'Año 5', targetValue: 2 },
        ],
      },
    ],
    tags: ['soberanía', 'sustancias', 'cannabis', 'psicodélicos', 'narcotráfico', 'ANSUS', 'amnistía', 'regulación', 'cuatro vías', 'despenalización', 'convenciones ONU'],
    relatedInitiativeSlugs: ['planjus-justicia-popular', 'planrep-reconversion-empleo-publico', 'planisv-infraestructura-suelo-vivo', 'planedu-refundacion-educativa', 'planeb-empresas-bastardas'],
    sources: [
      { title: 'PLANSUS — Plan Nacional de Soberanía sobre Sustancias (Documento Estratégico, Mar 2026)' },
      { title: 'UNODC — World Drug Report (estimaciones de mercado negro)' },
      { title: 'SEDRONAR — Encuestas nacionales de consumo de sustancias' },
      { title: 'Portugal — Decriminalization Impact Assessment (2001-2020)' },
      { title: 'Uruguay — Regulación del cannabis: resultados a 10 años (IRCCA)' },
      { title: 'Johns Hopkins — Psilocybin Research for Treatment-Resistant Depression' },
    ],
  },

  // PLANAGUA — Soberanía Hídrica y Resiliencia Climática
  {
    slug: 'planagua-soberania-hidrica',
    title: 'PLANAGUA',
    subtitle: 'Plan Nacional de Soberanía Hídrica y Resiliencia Climática',
    category: 'medio-ambiente',
    summary: '7 millones de argentinos no tienen acceso a agua segura. El 40% del agua tratada se pierde en fugas. 4+ millones están expuestos a arsénico sobre el límite de la OMS. PLANAGUA propone una arquitectura de soberanía hídrica con Censo Nacional del Agua, 50.000 sensores IoT, personería jurídica para ríos, y Bastardas Hídricas al costo. ROI estimado 4:1 a 8:1.',
    iconName: 'Droplets',
    documentFile: 'PLANAGUA_Argentina_ES.md',
    elProblema: {
      title: 'El Problema',
      content: `<p>La Argentina tiene el octavo territorio más grande del mundo, glaciares que alimentan ríos vitales, el Acuífero Guaraní compartido con tres países, y uno de los sistemas fluviales más extensos del planeta. Y sin embargo, 7 millones de argentinos no tienen acceso a agua segura por red.</p>
<p>El 40% del agua tratada — unos 6.000 millones de litros por día — se pierde en fugas de cañerías que tienen en promedio más de 55 años. Más de 4 millones de argentinos están expuestos a arsénico por encima del límite de la OMS. 15 millones no tienen red cloacal. La inversión per cápita en agua es de USD 15-20 por habitante por año — contra los USD 200+ de Israel.</p>
<p>Los glaciares de los Andes Centrales perdieron hasta el 41% de su masa en dos décadas. El Paraná bajó en 2021 a niveles no vistos en 77 años. Las comunidades wichí del Chaco beben agua con cinco veces más arsénico que el límite de la OMS. En el conurbano, familias como los Ferreyra de Ingeniero Budge gastan más del 2% de sus ingresos en bidones porque el agua de la canilla sale marrón.</p>`,
      pullQuote: 'Un país que tiene agua y no puede dársela limpia a su gente no tiene un problema técnico. Tiene un problema moral.',
      stats: [
        { label: 'Sin acceso a agua segura', value: '7 millones' },
        { label: 'Agua tratada perdida en fugas', value: '40%' },
        { label: 'Expuestos a arsénico > OMS', value: '4+ millones' },
        { label: 'Inversión per cápita (vs Israel USD 200+)', value: 'USD 15-20' },
      ],
    },
    quePasaSiNoCambiamos: {
      title: '¿Qué pasa si no cambiamos?',
      content: `<p>La inacción a 10 años (2026-2036) cuesta entre USD 33.500 y 67.000 millones en pérdidas acumuladas. PLANAGUA cuesta USD 15.000-25.000M — la inacción cuesta entre USD 18.500 y 42.000 millones MÁS que la inversión propuesta.</p>
<p>Las pérdidas por fugas representan USD 8.000-12.000M. Los costos sanitarios por enfermedades hídricas suman USD 5.000-8.000M. Las pérdidas agrícolas por sequías y bajantes alcanzan USD 3.000-8.000M. El impacto de inundaciones agrega USD 3.000-7.000M. La pérdida de reservas glaciares — agua que nunca volverá — vale USD 5.000-12.000M.</p>
<p>Cada centímetro de profundidad que el Paraná pierde equivale a cientos de toneladas menos por buque y millones en costos de flete. Los glaciares que alimentan Mendoza pierden 1-2% por año — y sin ellos, Mendoza es literalmente desierto. La pregunta no es si podemos pagar PLANAGUA. Es si podemos pagar el costo de no tenerlo.</p>`,
      pullQuote: 'La pregunta no es si podemos pagar PLANAGUA. La pregunta es si podemos pagar el costo de no tenerlo.',
      stats: [
        { label: 'Costo de inacción (10 años)', value: 'USD 33.500-67.000M' },
        { label: 'Pérdidas por fugas (10 años)', value: 'USD 8.000-12.000M' },
        { label: 'Costos sanitarios hídricos', value: 'USD 5.000-8.000M' },
        { label: 'Pérdida de glaciares', value: 'USD 5.000-12.000M' },
      ],
    },
    elDisenoIdeal: {
      title: 'El Diseño Ideal',
      content: `<p>PLANAGUA propone una arquitectura de soberanía hídrica en dos pistas. La <strong>Pista Infraestructura</strong>: Censo Nacional del Agua (primer inventario completo), red de 50.000+ sensores IoT, Gemelo Digital Nacional, retrofitting de 40.000+ km de cañerías (de 40% a <15% de pérdidas), Procesos de Oxidación Avanzada en plantas potabilizadoras, desalinización estratégica, modelo de 90% de reúso de agua, y ciencia ciudadana con 100.000 monitores.</p>
<p>La <strong>Pista Derechos</strong>: personería jurídica para ríos y acuíferos (Paraná, Río de la Plata, Acuífero Guaraní), Ley de Criosfera pionera mundial, co-gobernanza indígena del agua, y créditos hídricos no especulativos.</p>
<p>La convergencia opera a través de <strong>Bastardas Hídricas</strong> — servicios de agua al costo gobernados por la comunidad, organizados por cuenca — y un cuerpo especializado de Diplomacia Hídrica para recursos transfronterizos. Cada dólar invertido evita 2-3 dólares de pérdida y genera 4-8 dólares de valor económico, sanitario y ambiental.</p>`,
      pullQuote: 'Infraestructura sin derechos es tecnocracia. Derechos sin infraestructura es poesía. PLANAGUA es las dos cosas.',
      stats: [
        { label: 'Inversión total (10 años)', value: 'USD 15.000-25.000M' },
        { label: 'Retorno por dólar invertido', value: 'USD 4-8' },
        { label: 'Sensores IoT', value: '50.000+' },
        { label: 'Bastardas Hídricas (meta)', value: '30+' },
      ],
    },
    elCamino: {
      overview: 'Cuatro fases en 10 años. Cada fase tiene hitos verificables, inversión asignada y responsables identificados. Si un hito se incumple, se activa un protocolo de revisión — no hay postergación silenciosa.',
      steps: [
        { id: 1, title: 'Fase 1 — Diagnóstico y Emergencia', description: 'Lanzar Censo Nacional del Agua. Constituir ANAGUA. 100% comunidades indígenas con agua potable. Ósmosis inversa en 500 localidades con arsénico. Piloto IoT en 3 cuencas. Ley de Criosfera al Congreso. Primera Bastarda Hídrica piloto.', timeline: 'Años 0-2', dependencies: [], orderIndex: 1 },
        { id: 2, title: 'Fase 2 — Construcción', description: 'Censo completado. 50.000+ nodos IoT. Gemelo Digital operativo. AOP en 20 plantas. Pérdidas de 40% a 30%. Ley de Criosfera promulgada. Personería jurídica para Paraná y Guaraní. 5 Bastardas Hídricas operativas. Remediación de Riachuelo/Reconquista/Salí-Dulce lanzada.', timeline: 'Años 2-5', dependencies: ['Censo y ANAGUA de Fase 1'], orderIndex: 2 },
        { id: 3, title: 'Fase 3 — Expansión', description: 'AOP en 100+ plantas (75% población urbana). Pérdidas <20%. 3 plantas desalinizadoras. 30% reúso industrial. 20+ Bastardas. Co-manejo indígena en todas las cuencas relevantes. Riachuelo ICA >40.', timeline: 'Años 5-8', dependencies: ['Infraestructura base y Tablero de Fase 2'], orderIndex: 3 },
        { id: 4, title: 'Fase 4 — Consolidación', description: 'Pérdidas <15% (rango OCDE). AOP estándar en todas las plantas >10.000 habitantes (200+). Riachuelo nadable (ICA >60). 50% reúso industrial. 30+ Bastardas con 1M+ usuarios. Argentina reconocida como líder mundial en legislación hídrica. Sistema financieramente autosustentable.', timeline: 'Años 8-10', dependencies: ['Fase 3 alcanza masa crítica'], orderIndex: 4 },
      ],
    },
    kpis: [
      {
        id: 'perdidas-red',
        metric: 'Pérdidas en Red de Distribución',
        currentValue: 40,
        targetValue: 15,
        unit: '%',
        source: 'PLANAGUA — Tablero Nacional del Agua',
        milestones: [
          { date: 'Año 5', targetValue: 30 },
          { date: 'Año 8', targetValue: 20 },
          { date: 'Año 10', targetValue: 15 },
        ],
      },
      {
        id: 'acceso-agua-segura',
        metric: 'Población con Acceso a Agua Segura por Red',
        currentValue: 85,
        targetValue: 97,
        unit: '%',
        source: 'PLANAGUA — Cobertura de red',
        milestones: [
          { date: 'Año 5', targetValue: 92 },
          { date: 'Año 10', targetValue: 97 },
        ],
      },
      {
        id: 'plantas-aop',
        metric: 'Plantas con Oxidación Avanzada Operativa',
        currentValue: 0,
        targetValue: 200,
        unit: 'plantas',
        source: 'PLANAGUA — Tecnología de tratamiento',
        milestones: [
          { date: 'Año 2', targetValue: 5 },
          { date: 'Año 5', targetValue: 20 },
          { date: 'Año 8', targetValue: 100 },
          { date: 'Año 10', targetValue: 200 },
        ],
      },
      {
        id: 'sensores-iot',
        metric: 'Sensores IoT Operativos',
        currentValue: 200,
        targetValue: 50000,
        unit: 'sensores',
        source: 'PLANAGUA — Red de monitoreo',
        milestones: [
          { date: 'Año 2', targetValue: 5000 },
          { date: 'Año 5', targetValue: 50000 },
        ],
      },
      {
        id: 'comunidades-indigenas-agua',
        metric: 'Comunidades Indígenas con Agua Potable',
        currentValue: 30,
        targetValue: 100,
        unit: '%',
        source: 'PLANAGUA — Derecho al agua',
        milestones: [
          { date: 'Año 2', targetValue: 100 },
        ],
      },
    ],
    tags: ['agua', 'soberanía hídrica', 'glaciares', 'Acuífero Guaraní', 'Paraná', 'IoT', 'arsénico', 'Bastardas Hídricas', 'criosfera', 'personería jurídica de ríos', 'ANAGUA'],
    relatedInitiativeSlugs: ['planisv-infraestructura-suelo-vivo', 'plan24cn-24-ciudades-nuevas', 'plansal-salud-integral', 'planeb-empresas-bastardas'],
    sources: [
      { title: 'PLANAGUA — Plan Nacional de Soberanía Hídrica y Resiliencia Climática (Documento Estratégico, Mar 2026)' },
      { title: 'AySA — Pérdidas en red de distribución (~40%)' },
      { title: 'IANIGLA-CONICET — Inventario Nacional de Glaciares (Ley 26.639)' },
      { title: 'OMS — Límites de arsénico en agua potable (10 µg/L)' },
      { title: 'INA — Instituto Nacional del Agua (datos hidrológicos)' },
      { title: 'Russell Ackoff — Idealized Design (Metodología)' },
    ],
  },
];
