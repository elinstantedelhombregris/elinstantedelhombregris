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
    relatedInitiativeSlugs: ['plan24cn-24-ciudades-nuevas', 'planrep-reconversion-empleo-publico', 'planedu-refundacion-educativa'],
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
    relatedInitiativeSlugs: ['planisv-infraestructura-suelo-vivo', 'planrep-reconversion-empleo-publico', 'planedu-refundacion-educativa'],
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
    relatedInitiativeSlugs: ['planisv-infraestructura-suelo-vivo', 'plan24cn-24-ciudades-nuevas', 'planedu-refundacion-educativa'],
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
    summary: 'Argentina ocupa el puesto 63 de 81 en PISA gastando más del 5% de su PBI en educación. El 46% de los alumnos no alcanza el nivel mínimo de comprensión lectora. PLANEDU propone una refundación basada en Siete Capacidades, Maestros Creadores, AI como co-tutor, y aprendizaje por dominio — con el objetivo de ubicar a Argentina en el top 20 mundial en 15 años.',
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

<p><strong>AI Socrática como Co-Tutor:</strong> Cada alumno con un asistente de IA personalizado que pregunta más de lo que responde — guiando hacia el descubrimiento, no dictando respuestas. Plataforma Argentina de Aprendizaje (PAA) desarrollada como infraestructura soberana.</p>

<p><strong>Aprendizaje por Dominio:</strong> Avanzás cuando demostrás que sabés, no cuando el calendario dice. Se terminó la farsa del "aprobé con 4".</p>

<p><strong>Portfolio reemplaza al boletín:</strong> Cada alumno egresa con un cuerpo de creaciones reales — no con un papel.</p>

<p><strong>500 Escuelas del Futuro:</strong> Laboratorios vivientes distribuidos en todo el país, abiertos 14 horas/día, 350 días/año, sirviendo a toda la comunidad.</p>

<p><strong>ANCE:</strong> Agencia Nacional de Calidad Educativa — ente autárquico, blindado contra el ciclo electoral, con directorio de 9 miembros (docentes, académicos, familias, sindicatos, estudiantes) y piso presupuestario del 0,5% del PBI.</p>`,
      pullQuote: 'No les enseñemos a nuestros hijos a ganarse la vida. Enseñémosles a crear una vida que valga la pena ser vivida — y que haga del mundo un lugar mejor para todos.',
      stats: [
        { label: 'Capacidades centrales', value: '7' },
        { label: 'Escuelas del Futuro', value: '500' },
        { label: 'ROI estimado (20 años)', value: '8:1 a 12:1' },
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
          description: '50 Escuelas del Futuro operando a régimen completo. 5.000 Maestros Creadores activos. PAA v1.0 desplegada en las 50 EdF. Primera evaluación de impacto: diferencia medible entre EdF y convencionales. Build in Public: documentación abierta de éxitos y fracasos. Programa de bilingüismo con inmersión en inglés desde los 4 años.',
          timeline: 'Año 3-5',
          dependencies: ['Irradiación: 500 Escuelas del Futuro'],
          orderIndex: 3,
        },
        {
          id: 4,
          title: 'Siembra: ANCE, currículo y cohorte fundacional',
          description: 'Creación de la ANCE por ley del Congreso. Diseño del currículo de Siete Capacidades con equipos interdisciplinarios. Selección de 2.000 Maestros Creadores fundacionales (mejores docentes existentes) + Residencia de Transformación de 12 meses. Inicio de construcción/adaptación de 50 escuelas. Prototipo de la PAA. Diseño del portfolio. Campaña "La educación que merecemos". Pacto de la Dignidad con sindicatos docentes.',
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
    ],
    tags: ['educación', 'maestros creadores', 'siete capacidades', 'inteligencia artificial', 'bilingüismo', 'portfolio', 'escuelas del futuro'],
    relatedInitiativeSlugs: ['planisv-infraestructura-suelo-vivo', 'plan24cn-24-ciudades-nuevas', 'planrep-reconversion-empleo-publico'],
    sources: [
      { title: 'PLANEDU — Plan Nacional de Refundación Educativa (Documento Estratégico, Mar 2026)' },
      { title: 'PISA 2022 — Resultados Argentina (OCDE)' },
      { title: 'Observatorio Argentinos por la Educación — Indicadores educativos' },
      { title: 'Hanushek & Woessmann — The Knowledge Capital of Nations (2015)' },
      { title: 'Heckman — The Economics of Human Potential (Perry Preschool / Abecedarian)' },
      { title: 'Russell Ackoff — Idealized Design (Metodología)' },
    ],
  },
];
