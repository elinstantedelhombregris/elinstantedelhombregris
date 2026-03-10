import { db, schema } from './db-neon';
const { courses, courseLessons, courseQuizzes, quizQuestions, users } = schema;
import { eq } from 'drizzle-orm';

async function seedCourse12(authorId: number) {
  console.log('--- Course 12: Sobrevivir y Prosperar en la Economía Argentina ---');
  let course = await db.select().from(courses).where(eq(courses.slug, 'sobrevivir-prosperar-economia-argentina')).limit(1);

  if (course.length === 0) {
    const [newCourse] = await db.insert(courses).values({
      title: 'Sobrevivir y Prosperar en la Economía Argentina',
      slug: 'sobrevivir-prosperar-economia-argentina',
      description: 'Comprende cómo funciona realmente la economía argentina y aprende a proteger tu patrimonio. Desde la inflación como impuesto invisible hasta herramientas concretas de ahorro e inversión para un contexto volátil.',
      excerpt: 'Domina las herramientas financieras para prosperar en la economía argentina.',
      category: 'economia',
      level: 'beginner',
      duration: 180,
      thumbnailUrl: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800',
      orderIndex: 12,
      isPublished: true,
      isFeatured: true,
      requiresAuth: false,
      authorId,
    }).returning();
    course = [newCourse];
    console.log('Created course 12:', course[0].title);
  } else {
    console.log('Found existing course 12:', course[0].title);
  }

  const courseId = course[0].id;
  await db.delete(courseLessons).where(eq(courseLessons.courseId, courseId));

  const lessons = [
    {
      courseId,
      title: 'La Inflación Como Impuesto a Tu Futuro',
      description: 'Entender qué es la inflación, cómo te afecta y por qué Argentina la sufre crónicamente.',
      content: `
        <h2>El Impuesto Que No Votaste</h2>
        <p>La inflación no es un fenómeno abstracto que les pasa a los economistas. Es un <strong>impuesto invisible</strong> que pagás todos los días cuando el sueldo no alcanza, cuando los precios cambian entre que entrás y salís del supermercado, cuando tus ahorros en pesos pierden valor mientras dormís.</p>
        <h3>¿Qué Es Realmente la Inflación?</h3>
        <p>En términos simples, inflación es el <strong>aumento sostenido del nivel general de precios</strong>. No es que las cosas valgan más: es que tu dinero vale menos. Si en enero un kilo de pan cuesta $500 y en diciembre cuesta $1.500, tu billete de $500 no cambió pero ahora compra un tercio de lo que compraba.</p>
        <h3>Por Qué Argentina Es Campeona de Inflación</h3>
        <ul>
          <li><strong>Emisión monetaria:</strong> Cuando el Estado gasta más de lo que recauda, el BCRA emite pesos para cubrir la diferencia. Más pesos persiguiendo la misma cantidad de bienes = precios suben.</li>
          <li><strong>Expectativas:</strong> En Argentina, todos esperamos inflación, entonces remarcamos precios preventivamente. La inflación se autoalimenta.</li>
          <li><strong>Inercia:</strong> Contratos, alquileres, salarios se ajustan por inflación pasada, proyectándola al futuro.</li>
          <li><strong>Tipo de cambio:</strong> Cuando sube el dólar, suben los precios de todo lo importado, y por arrastre, de lo nacional también.</li>
        </ul>
        <h3>El Costo Real en Tu Vida</h3>
        <p>Si la inflación es del 100% anual, lo que ahorraste durante un año <strong>perdió la mitad de su valor</strong>. Es como si alguien entrara a tu casa y se llevara la mitad de tus ahorros. Entender esto es el primer paso para protegerte.</p>
        <blockquote>"No podés controlar la inflación. Pero podés dejar de ser su víctima pasiva."</blockquote>
      `,
      orderIndex: 1, type: 'text' as const, duration: 15, isRequired: true,
    },
    {
      courseId,
      title: 'Tu Relación Emocional con el Dinero',
      description: 'La psicología de vivir en una economía traumada y cómo afecta tus decisiones financieras.',
      content: `
        <h2>El Trauma Económico Argentino</h2>
        <p>Antes de hablar de herramientas financieras, necesitamos hablar de algo que ningún manual de finanzas personales menciona: <strong>la relación emocional</strong> que los argentinos tenemos con el dinero. Y es una relación traumática.</p>
        <h3>Las Heridas Colectivas</h3>
        <ul>
          <li><strong>El corralito (2001):</strong> "El banco se quedó con mi plata." Generación entera que no confía en el sistema bancario.</li>
          <li><strong>La hiperinflación (1989):</strong> "Los precios subían varias veces por día." El terror de que el dinero se evapore en horas.</li>
          <li><strong>Los planes Bonex, pesificación asimétrica:</strong> "El Estado me cambió las reglas del juego." La sensación de que ahorrando hacés el papel de tonto.</li>
        </ul>
        <h3>Comportamientos Que Genera el Trauma</h3>
        <ol>
          <li><strong>Gasto impulsivo:</strong> "Mejor gastarlo antes de que no valga nada." La urgencia de convertir pesos en bienes.</li>
          <li><strong>Dolarización mental:</strong> Pensamos todo en dólares. El peso es para gastar, el dólar para guardar.</li>
          <li><strong>Desconfianza total:</strong> No invertimos, no ahorramos en el sistema formal, guardamos dólares en el colchón.</li>
          <li><strong>Cortoplacismo:</strong> Planificar a más de 6 meses parece absurdo cuando las reglas cambian todo el tiempo.</li>
        </ol>
        <h3>El Primer Paso: Reconocer</h3>
        <p>No estás loco por sentir ansiedad cuando pensás en dinero. Tu comportamiento financiero es una <strong>respuesta adaptativa</strong> a décadas de inestabilidad. Pero algunas de esas adaptaciones que te protegieron en el pasado pueden estar limitándote en el presente.</p>
        <blockquote>"Sanar la relación con el dinero en Argentina es un acto de resistencia. Es negarse a que la inestabilidad te defina."</blockquote>
      `,
      orderIndex: 2, type: 'text' as const, duration: 15, isRequired: true,
    },
    {
      courseId,
      title: 'Presupuesto para Economías Volátiles',
      description: 'El método adaptativo de presupuesto personal diseñado para contextos de alta inflación.',
      content: `
        <h2>El Presupuesto Que Sí Funciona en Argentina</h2>
        <p>Los manuales de finanzas personales norteamericanos te dicen que hagas un presupuesto mensual fijo. En Argentina, donde los precios cambian cada semana, un presupuesto fijo es ficción. Necesitás un <strong>presupuesto adaptativo</strong>.</p>
        <h3>El Método 50-30-20 Argentinizado</h3>
        <p>La regla original dice: 50% necesidades, 30% deseos, 20% ahorro. En Argentina, la realidad es otra:</p>
        <ul>
          <li><strong>60-70% Supervivencia:</strong> Alquiler, comida, servicios, transporte. Lo innegociable.</li>
          <li><strong>15-20% Protección:</strong> Ahorro en instrumento que le gane a la inflación (UVA, cedears, dólar). No es lujo: es supervivencia futura.</li>
          <li><strong>10-20% Vida:</strong> Ocio, educación, salud. Lo que hace que valga la pena vivir.</li>
        </ul>
        <h3>Herramientas Prácticas</h3>
        <ol>
          <li><strong>La planilla semanal:</strong> No mensual, semanal. Los precios cambian demasiado rápido para planificar a un mes.</li>
          <li><strong>El sobre de efectivo:</strong> Para gastos variables (supermercado, transporte), sacá el efectivo el lunes y ese es tu límite.</li>
          <li><strong>La cuenta de protección:</strong> Apenas cobrás, transferí automáticamente tu porcentaje de protección a una cuenta que no toques.</li>
          <li><strong>Revisión quincenal:</strong> Cada 15 días, revisá: ¿los porcentajes siguen siendo realistas?</li>
        </ol>
        <h3>La Regla de Oro Argentina</h3>
        <p><strong>Pagá tus deudas primero, protegé tu ahorro segundo, gastá lo que sobre.</strong> En un país inflacionario, la deuda en pesos a tasa fija puede ser tu amiga (se licúa) pero la deuda en dólares o a tasa variable puede destruirte.</p>
      `,
      orderIndex: 3, type: 'text' as const, duration: 15, isRequired: true,
    },
    {
      courseId,
      title: 'Ahorro Inteligente: Plazo Fijo, UVA, Dólar y CEDEARs',
      description: 'Comparativa práctica de los instrumentos de ahorro disponibles en Argentina.',
      content: `
        <h2>Dónde Poner Tu Plata: Guía Práctica</h2>
        <p>El argentino promedio conoce dos opciones: guardar dólares en el colchón o gastar todo antes de que pierda valor. Pero hay un <strong>abanico de instrumentos</strong> entre esos dos extremos que pueden proteger tu patrimonio.</p>
        <h3>Comparativa de Instrumentos</h3>
        <ul>
          <li><strong>Plazo fijo tradicional:</strong> El más conocido. Depositás pesos, te devuelven pesos + interés. Problema: si la inflación supera la tasa, perdés plata. Útil solo para fondos de corto plazo (menos de 30 días).</li>
          <li><strong>Plazo fijo UVA:</strong> Ajusta por inflación (CER). Te garantiza no perder contra la inflación. Requiere 90 días mínimo. Ideal para ahorro de mediano plazo.</li>
          <li><strong>Dólar (oficial, MEP, blue):</strong> La reserva de valor tradicional argentina. Dólar MEP es legal y accesible a través de cualquier broker. El blue es más accesible pero con riesgo legal y spread alto.</li>
          <li><strong>CEDEARs:</strong> Certificados que representan acciones de empresas internacionales (Apple, Google, etc.) cotizadas en pesos pero atadas al dólar. Combinan protección cambiaria con potencial de ganancia.</li>
          <li><strong>FCI (Fondos Comunes de Inversión):</strong> Permiten diversificar con montos chicos. Hay de renta fija (más conservadores) y renta variable (más riesgo, más potencial).</li>
        </ul>
        <h3>La Estrategia por Capas</h3>
        <ol>
          <li><strong>Capa 1 - Emergencia (1-3 meses de gastos):</strong> En cuenta remunerada o FCI money market. Liquidez inmediata.</li>
          <li><strong>Capa 2 - Protección (3-12 meses):</strong> Plazo fijo UVA o dólar MEP.</li>
          <li><strong>Capa 3 - Crecimiento (más de 1 año):</strong> CEDEARs, FCI de renta variable, o inversión productiva.</li>
        </ol>
        <p><strong>Regla clave:</strong> nunca pongas todo en un solo instrumento. La diversificación es tu mejor defensa en un país donde las reglas cambian.</p>
      `,
      orderIndex: 4, type: 'text' as const, duration: 15, isRequired: true,
    },
    {
      courseId,
      title: 'El Monotributo y Tu Primera Estructura Fiscal',
      description: 'Guía práctica para formalizarse como monotributista en Argentina.',
      content: `
        <h2>Formalizarse Sin Morirse en el Intento</h2>
        <p>Millones de argentinos trabajan en la informalidad, no por elección sino porque el sistema tributario parece diseñado para expulsar. Pero estar informal tiene costos reales: no podés facturar, no tenés obra social, no aportás jubilación, no podés acceder a crédito.</p>
        <h3>El Monotributo: Tu Primer Paso</h3>
        <p>El monotributo es el <strong>régimen simplificado</strong> para pequeños contribuyentes. Pagás una cuota fija mensual que incluye:</p>
        <ul>
          <li><strong>Impuesto integrado:</strong> Tu aporte impositivo</li>
          <li><strong>SIPA:</strong> Tu aporte jubilatorio</li>
          <li><strong>Obra social:</strong> Cobertura de salud para vos y tu familia</li>
        </ul>
        <h3>Categorías y Cómo Elegir</h3>
        <p>Las categorías van de la A (menor facturación) a la K (mayor). Tu categoría depende de cuánto facturás por año. Empezá por la A si estás arrancando: es la cuota más baja y podés recategorizarte después.</p>
        <h3>Paso a Paso para Inscribirte</h3>
        <ol>
          <li>Sacá tu CUIT en AFIP (si no lo tenés, con DNI en cualquier oficina)</li>
          <li>Entrá a monotributo.afip.gob.ar</li>
          <li>Elegí tu categoría según facturación estimada</li>
          <li>Asociá una obra social</li>
          <li>Empezá a facturar electrónicamente desde la app "Mi Monotributo"</li>
        </ol>
        <h3>Errores Comunes</h3>
        <ul>
          <li><strong>No recategorizarse:</strong> Cada 6 meses debés verificar si tu categoría sigue siendo correcta</li>
          <li><strong>No emitir factura:</strong> Aunque el cliente no la pida, debés emitirla</li>
          <li><strong>No pagar en fecha:</strong> Los intereses son altos y se acumulan rápido</li>
        </ul>
      `,
      orderIndex: 5, type: 'text' as const, duration: 15, isRequired: true,
    },
    {
      courseId,
      title: 'Deuda: Cuándo Sirve y Cuándo Destruye',
      description: 'Entender la deuda como herramienta y sus peligros en contexto inflacionario.',
      content: `
        <h2>La Deuda No Es Mala. La Deuda Mal Usada Es Mala.</h2>
        <p>En Argentina la deuda tiene un estigma emocional enorme. "No debas nada a nadie" es casi un mandamiento familiar. Pero la realidad es más compleja: en un contexto inflacionario, <strong>la deuda en pesos a tasa fija puede ser una de tus mejores herramientas</strong>.</p>
        <h3>Deuda Buena vs. Deuda Mala</h3>
        <ul>
          <li><strong>Deuda buena:</strong> Financia algo que genera ingresos o se valoriza. Un préstamo para una herramienta de trabajo, para un curso que mejore tu empleabilidad, o para un emprendimiento con modelo viable.</li>
          <li><strong>Deuda mala:</strong> Financia consumo que se deprecia. Tarjeta de crédito en cuotas para un celular que en 6 meses vale la mitad.</li>
          <li><strong>Deuda peligrosa:</strong> Deuda en dólares o a tasa variable sin cobertura. Si sube el dólar o la tasa, tu cuota se dispara.</li>
        </ul>
        <h3>La Matemática de la Inflación y la Deuda</h3>
        <p>Si tomás un préstamo a tasa fija del 80% anual y la inflación es del 120%, en términos reales <strong>estás ganando plata</strong>. La cuota que hoy te duele, en 6 meses la pagás con lo que vale un café. Esto no es magia: es cómo funciona la deuda en un contexto inflacionario.</p>
        <h3>Reglas de Oro Para Endeudarte</h3>
        <ol>
          <li>Nunca debas más del 30% de tus ingresos mensuales en cuotas</li>
          <li>Evitá deuda en dólares si cobrás en pesos</li>
          <li>Leé la letra chica: ¿la tasa es fija o variable? ¿Hay cláusula de ajuste?</li>
          <li>Tené siempre un plan B: ¿qué pasa si perdés el trabajo?</li>
        </ol>
      `,
      orderIndex: 6, type: 'text' as const, duration: 15, isRequired: true,
    },
    {
      courseId,
      title: 'Seguros y Protección Patrimonial Básica',
      description: 'Entender qué seguros necesitás y cuáles son un gasto innecesario.',
      content: `
        <h2>El Paraguas Antes de la Tormenta</h2>
        <p>Los seguros son la herramienta financiera más subestimada en Argentina. La mayoría los ve como un gasto innecesario hasta que pasa algo. Un accidente, un robo, una enfermedad pueden destruir en un día lo que construiste en años.</p>
        <h3>Los Seguros Que Realmente Necesitás</h3>
        <ul>
          <li><strong>Obra social o prepaga:</strong> La salud es prioridad número uno. Si sos monotributista, ya tenés obra social incluida. Evaluá si necesitás un plan adicional.</li>
          <li><strong>Seguro del auto/moto (si tenés):</strong> Es obligatorio por ley, pero asegurate de que la cobertura sea adecuada, no solo el mínimo legal.</li>
          <li><strong>Seguro del hogar:</strong> Protege contra robo, incendio e inundación. Es barato y evita catástrofes.</li>
          <li><strong>Seguro de vida (si tenés familia que depende de vos):</strong> No es morboso: es responsable.</li>
        </ul>
        <h3>Los Seguros Que Probablemente NO Necesitás</h3>
        <ul>
          <li>Garantías extendidas de electrodomésticos (generalmente son un mal negocio)</li>
          <li>Seguros de cancelación de viaje (salvo viajes muy caros)</li>
          <li>Seguros de celular (el costo de la prima suele ser desproporcionado)</li>
        </ul>
        <h3>El Fondo de Emergencia: Tu Mejor Seguro</h3>
        <p>Antes de cualquier seguro, tu prioridad debería ser un <strong>fondo de emergencia</strong> de 3 meses de gastos esenciales, en un instrumento líquido (FCI money market o cuenta remunerada). Este fondo te protege de lo más probable: una reparación urgente, un mes sin trabajo, un gasto médico inesperado.</p>
      `,
      orderIndex: 7, type: 'text' as const, duration: 15, isRequired: true,
    },
    {
      courseId,
      title: 'Inversión para Principiantes en Contexto Argentino',
      description: 'Primeros pasos en inversión adaptados a la realidad argentina.',
      content: `
        <h2>Invertir No Es Para Ricos: Es Para Quien Quiera Dejar de Ser Pobre</h2>
        <p>En Argentina, "invertir" suena a algo que hacen los ricos o los especuladores. Pero invertir es simplemente <strong>poner tu dinero a trabajar</strong> en vez de dejarlo perder valor bajo el colchón.</p>
        <h3>Antes de Invertir: La Lista de Verificación</h3>
        <ol>
          <li>¿Tenés fondo de emergencia (3 meses)? Si no, armalo primero.</li>
          <li>¿Tenés deudas a tasa alta (tarjeta de crédito)? Pagalas primero.</li>
          <li>¿Entendés que podés perder parte de lo invertido? Si no, empezá con instrumentos conservadores.</li>
        </ol>
        <h3>Tu Primer Portafolio Argentino</h3>
        <p>Con tan solo $10.000 podés empezar a invertir a través de un broker online (IOL, Bull Market, PPI, Balanz). Un portafolio simple para principiante:</p>
        <ul>
          <li><strong>40% FCI money market:</strong> Tu colchón líquido. Rendimiento bajo pero acceso inmediato.</li>
          <li><strong>30% Plazo fijo UVA o bono CER:</strong> Protección contra inflación.</li>
          <li><strong>20% CEDEARs diversificados:</strong> 2-3 empresas diferentes (ej: SPY para diversificación global, AAPL, MELI).</li>
          <li><strong>10% Bono dólar linked:</strong> Protección contra devaluación.</li>
        </ul>
        <h3>Errores de Principiante</h3>
        <ul>
          <li><strong>Comprar en los picos:</strong> Cuando todos hablan de algo, ya es tarde para comprar</li>
          <li><strong>Vender en pánico:</strong> Las caídas son temporales si tu horizonte es largo</li>
          <li><strong>No diversificar:</strong> Nunca pongas todos los huevos en la misma canasta</li>
          <li><strong>Seguir "tips" de redes sociales:</strong> Nadie te va a hacer rico con un tweet</li>
        </ul>
      `,
      orderIndex: 8, type: 'text' as const, duration: 15, isRequired: true,
    },
    {
      courseId,
      title: 'Economía Familiar: El Presupuesto Como Equipo',
      description: 'Gestionar las finanzas familiares como un equipo coordinado.',
      content: `
        <h2>La Plata en Familia: Del Tabú a la Estrategia</h2>
        <p>En la mayoría de las familias argentinas, el dinero es un tema tabú. No se habla, no se planifica, no se decide junto. Y después llegan los conflictos: "¿En qué se fue la plata este mes?" Gestionar las finanzas en familia requiere <strong>comunicación, reglas claras y objetivos compartidos</strong>.</p>
        <h3>La Reunión Financiera Mensual</h3>
        <p>Una vez al mes, toda la familia (pareja, o incluso hijos adolescentes) se sienta 30 minutos a:</p>
        <ol>
          <li><strong>Revisar:</strong> ¿Cómo nos fue este mes? ¿Gastamos más o menos de lo planificado?</li>
          <li><strong>Planificar:</strong> ¿Qué gastos vienen el mes que viene? ¿Hay gastos extraordinarios?</li>
          <li><strong>Soñar:</strong> ¿Cómo vamos con nuestros objetivos? (vacaciones, arreglo de la casa, educación)</li>
        </ol>
        <h3>Modelos de Finanzas en Pareja</h3>
        <ul>
          <li><strong>Todo junto:</strong> Un solo fondo familiar. Funciona bien cuando hay confianza total y transparencia.</li>
          <li><strong>Proporcional:</strong> Cada uno aporta al fondo común un porcentaje proporcional a su ingreso. El resto es personal.</li>
          <li><strong>Separado + gastos compartidos:</strong> Cada uno maneja su plata, pero dividen gastos comunes. Funciona al principio de una relación.</li>
        </ul>
        <h3>Enseñar Finanzas a los Hijos</h3>
        <p>La educación financiera empieza en casa. Desde chicos podés enseñar conceptos como ahorro (alcancía), elección (no podés tener todo), y valor (el dinero se gana con trabajo). Con adolescentes, incluirlos en la planificación familiar les da herramientas que la escuela no les va a dar.</p>
      `,
      orderIndex: 9, type: 'text' as const, duration: 15, isRequired: true,
    },
    {
      courseId,
      title: 'Trampas Mentales Financieras del Argentino',
      description: 'Sesgos cognitivos específicos que afectan las decisiones financieras en Argentina.',
      content: `
        <h2>Tu Cerebro Te Miente Sobre la Plata</h2>
        <p>Todos tenemos <strong>sesgos cognitivos</strong> que distorsionan nuestras decisiones financieras. En Argentina, estos sesgos están amplificados por décadas de inestabilidad.</p>
        <h3>Las 7 Trampas Mentales Más Comunes</h3>
        <ol>
          <li><strong>Sesgo del presente:</strong> "Mejor gastar hoy porque mañana quién sabe." Te impide ahorrar incluso cuando podrías.</li>
          <li><strong>Ilusión monetaria:</strong> "Me aumentaron el 50%!" Sí, pero la inflación fue del 100%. Tu poder de compra bajó.</li>
          <li><strong>Anclaje al dólar:</strong> "El dólar está a X, está caro/barato." Juzgamos el precio del dólar comparando con un momento arbitrario del pasado.</li>
          <li><strong>Aversión a la pérdida:</strong> Perder $1.000 duele más que la alegría de ganar $1.000. Esto te hace mantener inversiones perdedoras demasiado tiempo.</li>
          <li><strong>Efecto manada:</strong> "Todo el mundo compra dólares, yo también." Las corridas son profecías autocumplidas.</li>
          <li><strong>Sesgo de confirmación:</strong> Solo leés las noticias que confirman lo que ya pensás sobre la economía.</li>
          <li><strong>La falacia del costo hundido:</strong> "Ya invertí mucho en esto, no puedo abandonar." Sí podés, y a veces debés.</li>
        </ol>
        <h3>Cómo Protegerte de Tus Propios Sesgos</h3>
        <ul>
          <li><strong>Automatizá:</strong> Ahorro automático el día de cobro. No le des a tu cerebro la oportunidad de elegir.</li>
          <li><strong>Regla de las 48 horas:</strong> Para compras no esenciales, esperá 48 horas. Si seguís queriéndolo, compralo.</li>
          <li><strong>Pensá en términos reales:</strong> Siempre ajustá por inflación. El número nominal no significa nada.</li>
        </ul>
      `,
      orderIndex: 10, type: 'text' as const, duration: 15, isRequired: true,
    },
    {
      courseId,
      title: 'Herramientas Digitales de Gestión Financiera',
      description: 'Apps y herramientas para gestionar tus finanzas en Argentina.',
      content: `
        <h2>Tu Celular: Tu Mejor Asesor Financiero</h2>
        <p>No necesitás un contador para llevar tus finanzas en orden. Con las herramientas digitales adecuadas, podés tener <strong>control total de tu plata</strong> desde el celular.</p>
        <h3>Apps de Presupuesto y Gastos</h3>
        <ul>
          <li><strong>Wallet by BudgetBakers:</strong> Categoriza gastos, sincroniza con cuentas bancarias, muestra gráficos claros</li>
          <li><strong>Monefy:</strong> Súper simple. Registrás cada gasto en 5 segundos. Ideal para empezar.</li>
          <li><strong>Google Sheets:</strong> Si preferís armar tu propio sistema, una planilla compartida (con tu pareja o familia) es imbatible.</li>
        </ul>
        <h3>Apps de Inversión (Brokers Online)</h3>
        <ul>
          <li><strong>IOL (InvertirOnline):</strong> El más usado. Interfaz clara, comisiones razonables, buen servicio al cliente.</li>
          <li><strong>Bull Market:</strong> Interfaz moderna, FCI propios, ideal para principiantes.</li>
          <li><strong>Balanz:</strong> Buena oferta de CEDEARs y bonos. Interfaz intuitiva.</li>
        </ul>
        <h3>Herramientas de Información</h3>
        <ul>
          <li><strong>DolarHoy:</strong> Cotizaciones en tiempo real de todas las variantes del dólar</li>
          <li><strong>Infleta:</strong> Calculadora de inflación real, para entender cuánto perdió tu plata</li>
          <li><strong>AFIP App:</strong> Para monotributistas, facturación electrónica desde el celular</li>
        </ul>
        <h3>El Hábito Más Importante</h3>
        <p>La herramienta no importa si no la usás. El hábito que necesitás construir: <strong>registrar cada gasto, todos los días</strong>. Tardás 30 segundos. Después de un mes de registro, vas a ver por primera vez a dónde va realmente tu plata. Y ese conocimiento es poder.</p>
      `,
      orderIndex: 11, type: 'text' as const, duration: 15, isRequired: true,
    },
    {
      courseId,
      title: 'Tu Plan Financiero Personal: Primeros 6 Meses',
      description: 'Crear un plan financiero personal adaptado a la realidad argentina.',
      content: `
        <h2>De la Teoría a Tu Bolsillo: Tu Plan de 6 Meses</h2>
        <p>Llegaste al final del curso con conocimiento que la mayoría de los argentinos no tiene. Ahora es momento de <strong>armar tu plan personal</strong>.</p>
        <h3>Mes 1-2: Diagnóstico y Limpieza</h3>
        <ul>
          <li>Registrá todos tus gastos durante 30 días. Sin juzgar, solo registrar.</li>
          <li>Listá todas tus deudas: monto, tasa, plazo.</li>
          <li>Calculá tu patrimonio neto: todo lo que tenés menos todo lo que debés.</li>
          <li>Identificá gastos que podés reducir sin sufrir.</li>
        </ul>
        <h3>Mes 3-4: Estructura</h3>
        <ul>
          <li>Implementá tu presupuesto adaptativo (60-20-20 o tu variante).</li>
          <li>Abrí una cuenta en un broker online (IOL, Bull Market, etc.).</li>
          <li>Empezá tu fondo de emergencia: meta = 1 mes de gastos.</li>
          <li>Automatizá lo que puedas: débito automático de servicios, ahorro automático.</li>
        </ul>
        <h3>Mes 5-6: Crecimiento</h3>
        <ul>
          <li>Completá tu fondo de emergencia hasta 3 meses.</li>
          <li>Hacé tu primera inversión (aunque sean $5.000 en un FCI).</li>
          <li>Revisá y ajustá tu plan: ¿los porcentajes funcionan? ¿Necesitás recalibrar?</li>
          <li>Compartí lo que aprendiste con alguien: enseñar es la mejor forma de consolidar.</li>
        </ul>
        <h3>Indicadores de Éxito</h3>
        <ol>
          <li>¿Sabés exactamente cuánto gastás por mes?</li>
          <li>¿Tenés al menos 1 mes de gastos como reserva?</li>
          <li>¿Estás protegiendo algún porcentaje contra la inflación?</li>
          <li>¿Dormís más tranquilo pensando en la plata?</li>
        </ol>
        <blockquote>"La libertad financiera en Argentina no es ser millonario. Es poder dormir tranquilo sabiendo que si mañana el mundo explota, tenés un plan."</blockquote>
      `,
      orderIndex: 12, type: 'text' as const, duration: 15, isRequired: true,
    },
  ];

  for (const lesson of lessons) {
    await db.insert(courseLessons).values(lesson);
  }
  console.log('Created', lessons.length, 'lessons for course 12');

  // Quiz
  const existingQuiz = await db.select().from(courseQuizzes).where(eq(courseQuizzes.courseId, courseId)).limit(1);
  if (existingQuiz.length > 0) {
    await db.delete(quizQuestions).where(eq(quizQuestions.quizId, existingQuiz[0].id));
    await db.delete(courseQuizzes).where(eq(courseQuizzes.courseId, courseId));
  }

  const [quiz] = await db.insert(courseQuizzes).values({
    courseId,
    title: 'Quiz: Sobrevivir y Prosperar en la Economía Argentina',
    description: 'Evaluá tu comprensión de finanzas personales en contexto argentino.',
    passingScore: 70,
    timeLimit: 15,
    allowRetakes: true,
    maxAttempts: 3,
  }).returning();

  const questions = [
    {
      quizId: quiz.id,
      question: '¿Qué es la inflación en términos simples?',
      type: 'multiple_choice' as const,
      options: JSON.stringify(['Las cosas valen más', 'Tu dinero vale menos', 'El gobierno sube los precios', 'Los comerciantes son ambiciosos']),
      correctAnswer: JSON.stringify(1),
      explanation: 'La inflación no es que las cosas valgan más, sino que el poder adquisitivo de tu dinero disminuye.',
      points: 2, orderIndex: 1,
    },
    {
      quizId: quiz.id,
      question: 'En un contexto de alta inflación, una deuda a tasa fija en pesos puede beneficiarte.',
      type: 'true_false' as const,
      correctAnswer: JSON.stringify(true),
      explanation: 'Si la inflación supera la tasa del préstamo, en términos reales la deuda se "licúa" a tu favor.',
      points: 1, orderIndex: 2,
    },
    {
      quizId: quiz.id,
      question: '¿Qué instrumento protege específicamente contra la inflación?',
      type: 'multiple_choice' as const,
      options: JSON.stringify(['Plazo fijo tradicional', 'Plazo fijo UVA', 'Cuenta corriente', 'Caja de ahorro']),
      correctAnswer: JSON.stringify(1),
      explanation: 'El plazo fijo UVA ajusta por inflación (CER), garantizando que tu ahorro mantenga su poder de compra.',
      points: 2, orderIndex: 3,
    },
    {
      quizId: quiz.id,
      question: '¿Cuánto debería ser tu fondo de emergencia mínimo?',
      type: 'multiple_choice' as const,
      options: JSON.stringify(['1 semana de gastos', '1 mes de gastos', '3 meses de gastos', '1 año de gastos']),
      correctAnswer: JSON.stringify(2),
      explanation: 'El objetivo ideal es 3 meses de gastos esenciales en un instrumento líquido.',
      points: 2, orderIndex: 4,
    },
    {
      quizId: quiz.id,
      question: 'El "sesgo del presente" te lleva a gastar hoy en vez de ahorrar para mañana.',
      type: 'true_false' as const,
      correctAnswer: JSON.stringify(true),
      explanation: 'Este sesgo se amplifica en Argentina por la experiencia histórica de que "mañana quién sabe".',
      points: 1, orderIndex: 5,
    },
    {
      quizId: quiz.id,
      question: '¿Qué son los CEDEARs?',
      type: 'multiple_choice' as const,
      options: JSON.stringify(['Bonos del gobierno argentino', 'Certificados que representan acciones internacionales cotizados en pesos', 'Un tipo de plazo fijo', 'Acciones de empresas argentinas']),
      correctAnswer: JSON.stringify(1),
      explanation: 'Los CEDEARs permiten invertir en empresas internacionales desde Argentina, combinando protección cambiaria con potencial de crecimiento.',
      points: 2, orderIndex: 6,
    },
    {
      quizId: quiz.id,
      question: '¿Cuál es la "regla de las 48 horas" para compras?',
      type: 'multiple_choice' as const,
      options: JSON.stringify(['Devolver todo en 48 horas', 'Esperar 48 horas antes de compras no esenciales', 'Comprar solo los primeros 48 horas del mes', 'Ahorrar 48 horas de sueldo']),
      correctAnswer: JSON.stringify(1),
      explanation: 'Esperar 48 horas antes de compras no esenciales te protege de compras impulsivas.',
      points: 2, orderIndex: 7,
    },
    {
      quizId: quiz.id,
      question: '¿Cuál debería ser el máximo de tus ingresos destinado a cuotas de deuda?',
      type: 'multiple_choice' as const,
      options: JSON.stringify(['10%', '30%', '50%', '70%']),
      correctAnswer: JSON.stringify(1),
      explanation: 'Nunca debas más del 30% de tus ingresos mensuales en cuotas para mantener un margen de seguridad.',
      points: 2, orderIndex: 8,
    },
    {
      quizId: quiz.id,
      question: 'El monotributo incluye aporte jubilatorio y obra social.',
      type: 'true_false' as const,
      correctAnswer: JSON.stringify(true),
      explanation: 'La cuota del monotributo integra impuesto, aporte jubilatorio (SIPA) y obra social.',
      points: 1, orderIndex: 9,
    },
    {
      quizId: quiz.id,
      question: '¿Qué es lo primero que debés hacer antes de empezar a invertir?',
      type: 'multiple_choice' as const,
      options: JSON.stringify(['Comprar acciones', 'Armar un fondo de emergencia y pagar deudas de tasa alta', 'Abrir una cuenta en el exterior', 'Leer noticias financieras']),
      correctAnswer: JSON.stringify(1),
      explanation: 'Antes de invertir, asegurate de tener fondo de emergencia y no tener deudas a tasa alta.',
      points: 2, orderIndex: 10,
    },
  ];

  for (const q of questions) {
    await db.insert(quizQuestions).values(q);
  }
  console.log('Created quiz with', questions.length, 'questions for course 12');
}

// Courses 13, 14, 15 will be defined as structure + placeholder
async function seedCourse13(authorId: number) {
  console.log('--- Course 13: Sistemas Económicos ---');
  let course = await db.select().from(courses).where(eq(courses.slug, 'sistemas-economicos-ciclo-argentino')).limit(1);
  if (course.length === 0) {
    const [newCourse] = await db.insert(courses).values({
      title: 'Sistemas Económicos: Por Qué Argentina Repite el Ciclo',
      slug: 'sistemas-economicos-ciclo-argentino',
      description: 'Analiza los ciclos económicos argentinos a través del pensamiento sistémico. Entiende por qué la emisión genera inflación, cómo funciona el stop-go, y qué significa la dependencia de commodities como bucle de retroalimentación.',
      excerpt: 'Entiende los ciclos económicos argentinos como sistemas de retroalimentación.',
      category: 'economia',
      level: 'intermediate',
      duration: 180,
      thumbnailUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800',
      orderIndex: 13,
      isPublished: true,
      isFeatured: false,
      requiresAuth: false,
      authorId,
    }).returning();
    course = [newCourse];
    console.log('Created course 13:', course[0].title);
  } else {
    console.log('Found existing course 13:', course[0].title);
  }

  const courseId = course[0].id;
  await db.delete(courseLessons).where(eq(courseLessons.courseId, courseId));

  const lessons = [
    {
      courseId,
      title: 'La Economía como Sistema: Dejá de Mirar Números, Empezá a Ver Conexiones',
      description: 'Introducción al pensamiento sistémico aplicado a la economía argentina.',
      content: `
        <h2>Más Allá de los Titulares</h2>
        <p>El noticiero te dice: "el dólar subió", "la inflación fue del 5%", "cayó el empleo". Cada dato se presenta como un evento aislado, como si la economía fuera una colección de números sueltos. Pero la economía es un <strong>sistema</strong>: un conjunto de partes interconectadas donde todo afecta a todo.</p>
        <p>Cuando entendés la economía como sistema, dejás de sorprenderte por las crisis y empezás a <strong>anticiparlas</strong>. No porque seas adivino, sino porque ves los patrones que otros no ven.</p>
        <h3>¿Qué Es un Sistema Económico?</h3>
        <p>Imaginá la economía como una red de cañerías donde fluye agua (dinero). Las canillas (producción) agregan agua. Los desagotes (importaciones, fuga de capitales) la sacan. Las bombas (Banco Central, gasto público) regulan la presión. Cuando alguna cañería se tapa o alguna bomba falla, el agua se desborda por algún lado inesperado.</p>
        <h3>Los Componentes del Sistema Argentino</h3>
        <ul>
          <li><strong>Producción:</strong> Lo que Argentina crea. Agro, industria, servicios, tecnología. Es el motor que genera riqueza real.</li>
          <li><strong>Moneda:</strong> Los pesos que circulan. Cuántos hay, cuánto valen, quién los quiere.</li>
          <li><strong>Sector externo:</strong> La relación con el mundo. Exportaciones, importaciones, deuda, inversión extranjera.</li>
          <li><strong>Estado:</strong> Lo que recauda (impuestos) y lo que gasta (servicios, transferencias, obra pública, sueldos).</li>
          <li><strong>Expectativas:</strong> Lo que la gente CREE que va a pasar. En Argentina, las expectativas son tan poderosas como la realidad.</li>
        </ul>
        <h3>El Concepto Clave: Bucles de Retroalimentación</h3>
        <p>Un bucle de retroalimentación es cuando A causa B y B refuerza A:</p>
        <ul>
          <li><strong>Bucle positivo (amplificador):</strong> La inflación genera expectativas de más inflación → la gente remarca precios preventivamente → hay más inflación. Se auto-amplifica.</li>
          <li><strong>Bucle negativo (estabilizador):</strong> Si la economía se recalienta, el Banco Central sube la tasa de interés → menos crédito → menos consumo → la economía se enfría. Se auto-regula.</li>
        </ul>
        <p>El problema de Argentina es que los bucles amplificadores son muy fuertes y los estabilizadores muy débiles.</p>
        <blockquote>"El argentino promedio entiende más de economía que el promedio mundial — porque la economía nos obliga a aprenderla por supervivencia. Este curso te da el marco teórico para organizar lo que tu instinto ya sabe."</blockquote>
      `,
      orderIndex: 1, type: 'text' as const, duration: 18, isRequired: true,
    },
    {
      courseId,
      title: 'Inflación: La Fiebre Crónica de Argentina',
      description: 'Entender la inflación como fenómeno sistémico multicausal.',
      content: `
        <h2>No Es Solo "Imprimir Billetes"</h2>
        <p>Argentina ha convivido con inflación alta durante la mayor parte de su historia moderna. Tuvimos hiperinflación en 1989-90 (5.000% anual), deflación durante la convertibilidad, y vuelta a inflación de tres dígitos en años recientes. Para entenderla, hay que ir más allá de la explicación simplista.</p>
        <h3>Las Múltiples Causas de la Inflación Argentina</h3>
        <ol>
          <li><strong>Monetaria (emisión):</strong> Cuando el Estado gasta más de lo que recauda y financia la diferencia imprimiendo pesos, hay más pesos persiguiendo los mismos bienes. Los precios suben. Es real y medible.</li>
          <li><strong>De costos (push):</strong> Si sube el dólar, suben los insumos importados, suben los costos de producción, suben los precios. Si suben los salarios más rápido que la productividad, las empresas trasladan el costo al precio.</li>
          <li><strong>Inercial (expectativas):</strong> La más difícil de romper. Si todos ESPERAN 5% mensual de inflación, remarcan 5%, piden paritarias del 5%, y la inflación es 5%. Se auto-cumple.</li>
          <li><strong>Estructural (oligopolios):</strong> Mercados concentrados donde pocas empresas pueden subir precios sin perder clientes (alimentos, combustibles, telecomunicaciones).</li>
          <li><strong>Cambiaria:</strong> Cuando el peso se devalúa, todo lo importado (y todo lo que compite con importaciones) sube de precio. En Argentina, una devaluación se traslada rápidamente a precios.</li>
        </ol>
        <h3>El Bucle Infernal</h3>
        <p>Lo que hace a la inflación argentina tan persistente es que estas causas se <strong>retroalimentan</strong>:</p>
        <p>Emisión → inflación → expectativas de más inflación → fuga al dólar → suba del dólar → más inflación → el Estado recauda menos en términos reales → más déficit → más emisión.</p>
        <h3>¿Quién Gana y Quién Pierde?</h3>
        <ul>
          <li><strong>Pierden:</strong> Los que cobran un sueldo fijo (asalariados, jubilados). Los que ahorran en pesos. Los que no pueden ajustar sus precios rápido (almaceneros vs. supermercados).</li>
          <li><strong>Ganan:</strong> Los que tienen activos en dólares o bienes reales. Los que pueden remarcar rápido. Los deudores en pesos (la inflación licúa la deuda). El propio Estado (cobra impuestos sobre precios inflados).</li>
        </ul>
        <blockquote>"La inflación es un impuesto invisible que no vota nadie, que pagan más los que menos tienen, y que beneficia a los que más saben protegerse. Entender este mecanismo es el primer paso para exigir que se detenga."</blockquote>
      `,
      orderIndex: 2, type: 'text' as const, duration: 18, isRequired: true,
    },
    {
      courseId,
      title: 'El Dólar: La Obsesión Argentina',
      description: 'Por qué Argentina tiene una relación única con el dólar y qué significa sistémicamente.',
      content: `
        <h2>¿Por Qué un País Piensa en Otra Moneda?</h2>
        <p>Ningún otro país del mundo tiene con el dólar la relación que tiene Argentina. Los brasileños no miran el tipo de cambio todos los días. Los chilenos no ahorran en dólares bajo el colchón. Pero para los argentinos, el dólar es <strong>termómetro, refugio, obsesión y trauma</strong>.</p>
        <h3>La Historia en 5 Traumas</h3>
        <ol>
          <li><strong>Rodrigazo (1975):</strong> Devaluación masiva que destruyó el salario real. Primera lección: los pesos pierden valor de golpe.</li>
          <li><strong>Tablita de Martínez de Hoz (1980):</strong> Dólar artificialmente barato seguido de crisis. Lección: el dólar barato no dura.</li>
          <li><strong>Hiperinflación (1989):</strong> Los pesos dejaron de valer. La gente corría al supermercado antes de que remarquen. Lección: los pesos pueden valer NADA.</li>
          <li><strong>Corralito (2001):</strong> Los dólares del banco se convirtieron en pesos devaluados por decreto. Lección: ni el banco es seguro.</li>
          <li><strong>Cepo (2011-2015, 2019-presente):</strong> El Estado te prohíbe comprar dólares libremente. Lección: el Estado puede impedirte protegerte.</li>
        </ol>
        <h3>El Dólar como Sistema de Información</h3>
        <p>El tipo de cambio no es solo un precio. Es un <strong>sistema de señales</strong>:</p>
        <ul>
          <li>Cuando sube rápido: la gente está perdiendo confianza en el peso (y en el gobierno).</li>
          <li>Cuando está "planchado" artificialmente: el gobierno está gastando reservas para mantenerlo bajo (insostenible).</li>
          <li>La brecha entre dólar oficial y "blue": mide la distorsión entre el precio que el gobierno quiere y el que el mercado determina.</li>
        </ul>
        <h3>El Bucle del Dólar</h3>
        <p>La desconfianza en el peso → compra de dólares → sube el dólar → suben los precios → más desconfianza en el peso → más compra de dólares. Este bucle solo se rompe con <strong>confianza sostenida en el tiempo</strong>, algo que ningún gobierno argentino logró mantener más de una década.</p>
        <h3>¿Tiene Solución?</h3>
        <p>Sí, pero requiere lo que Argentina más le cuesta: <strong>consistencia</strong>. Países como Israel, Chile y Polonia tuvieron problemas similares y los resolvieron con bancos centrales independientes, metas de inflación creíbles y disciplina fiscal sostenida durante décadas (no durante un mandato).</p>
        <blockquote>"El dólar no es el problema: es el síntoma. Argentina no necesita menos dólares: necesita un peso en el que confíe. Y la confianza no se decreta: se construye con años de coherencia."</blockquote>
      `,
      orderIndex: 3, type: 'text' as const, duration: 18, isRequired: true,
    },
    {
      courseId,
      title: 'El Ciclo Stop-Go: La Montaña Rusa que No Para',
      description: 'El patrón económico central de Argentina analizado en profundidad.',
      content: `
        <h2>70 Años Subiendo y Bajando</h2>
        <p>Desde mediados del siglo XX, Argentina repite un ciclo económico que los economistas llaman <strong>stop-go</strong>: fases de expansión (go) seguidas inevitablemente de crisis y ajuste (stop). El ciclo tiene una regularidad casi mecánica.</p>
        <h3>El Ciclo en Detalle</h3>
        <ol>
          <li><strong>Fase GO — Expansión:</strong> El gobierno aumenta el gasto público (subsidios, obra pública, empleo estatal). Suben los salarios reales. Crece el consumo. Cae el desempleo. Todos contentos. Los indicadores sociales mejoran.</li>
          <li><strong>Fase de tensión:</strong> El consumo creciente demanda más importaciones (insumos, energía, bienes de consumo). Argentina necesita más dólares para importar, pero la producción exportable no creció al mismo ritmo.</li>
          <li><strong>Fase de crisis:</strong> Las reservas de dólares se agotan. El peso se devalúa. Los precios se disparan. Los salarios reales caen. Aumenta la pobreza. La política del "bienestar" se convierte en crisis.</li>
          <li><strong>Fase STOP — Ajuste:</strong> Se reduce el gasto, se sube la tasa de interés, se devalúa (más). La economía se enfría. Hay recesión y desempleo.</li>
          <li><strong>Fase de recuperación:</strong> Con la economía enfriada, los precios se estabilizan, las cuentas externas mejoran, se acumulan reservas. Y un nuevo gobierno (o el mismo presionado) vuelve a expandir...</li>
        </ol>
        <h3>¿Por Qué Argentina Específicamente?</h3>
        <p>El stop-go es más intenso en Argentina que en otros países por razones estructurales:</p>
        <ul>
          <li><strong>Restricción externa:</strong> Argentina exporta commodities (soja, trigo, carne) pero necesita importar energía, tecnología e insumos. Cuando crece, se le acaban los dólares más rápido de lo que los genera.</li>
          <li><strong>Baja complejidad exportadora:</strong> Exportar soja no requiere innovación ni empleo masivo. Sin diversificación, el crecimiento genera más importaciones que exportaciones.</li>
          <li><strong>Incentivos políticos:</strong> Ganar elecciones requiere mostrar resultados económicos inmediatos. La expansión da votos; el ajuste no.</li>
          <li><strong>Ausencia de estabilizadores automáticos:</strong> Otros países tienen fondos contracíclicos que ahorran en bonanza y gastan en crisis. Argentina gasta en ambos momentos.</li>
        </ul>
        <h3>Romper el Ciclo</h3>
        <p>La única salida conocida es <strong>cambiar la estructura productiva</strong>: exportar más cosas de mayor valor para que el crecimiento no agote los dólares. Esto requiere inversión en educación, ciencia, tecnología e infraestructura sostenida durante décadas. Exactamente lo que el péndulo político impide.</p>
        <blockquote>"El ciclo stop-go no es mala suerte ni incompetencia: es el resultado predecible de una estructura económica que nadie se atreve a transformar de fondo porque la transformación tarda más que un mandato presidencial."</blockquote>
      `,
      orderIndex: 4, type: 'text' as const, duration: 18, isRequired: true,
    },
    {
      courseId,
      title: 'Commodities y el Síndrome Holandés: La Maldición de la Riqueza Fácil',
      description: 'Cómo la dependencia de materias primas condiciona toda la economía.',
      content: `
        <h2>El País Rico que No Puede Dejar de Ser Pobre</h2>
        <p>Argentina tiene algunas de las tierras más fértiles del planeta. Podría alimentar a 400 millones de personas. Tiene litio, petróleo (Vaca Muerta), gas, cobre, oro. Paradójicamente, esta riqueza natural es parte del <strong>problema</strong>.</p>
        <h3>¿Qué Es el Síndrome Holandés?</h3>
        <p>Cuando un país exporta muchos recursos naturales, entra una gran cantidad de dólares que <strong>aprecia la moneda local</strong>. Con la moneda apreciada, es más barato importar que producir localmente. La industria se achica. El país se vuelve más dependiente del recurso natural. Es una trampa.</p>
        <h3>La Versión Argentina</h3>
        <ul>
          <li><strong>El campo genera dólares:</strong> La soja, el trigo, la carne exportan miles de millones de dólares al año.</li>
          <li><strong>El Estado captura parte:</strong> A través de retenciones (impuestos a las exportaciones), el Estado recauda de la riqueza del campo para financiar el gasto público.</li>
          <li><strong>Conflicto permanente:</strong> Campo vs. Estado por las retenciones. El campo quiere pagar menos; el Estado necesita recaudar más. El conflicto de 2008 por la Resolución 125 es el ejemplo más visible.</li>
          <li><strong>Dependencia:</strong> Cuando el precio de la soja sube, Argentina florece. Cuando baja, Argentina sufre. Un país entero sujeto al precio internacional de un grano.</li>
        </ul>
        <h3>Vaca Muerta: ¿Salvación o Nueva Trampa?</h3>
        <p>Vaca Muerta (Neuquén) tiene una de las reservas de petróleo y gas no convencional más grandes del mundo. Promete transformar a Argentina en exportador neto de energía. Pero la historia enseña que los recursos naturales solo son una bendición si se usan para <strong>diversificar la economía</strong>, no para financiar más gasto corriente.</p>
        <h3>El Camino Noruego vs. El Camino Venezolano</h3>
        <ul>
          <li><strong>Noruega:</strong> Descubrió petróleo y creó un fondo soberano que hoy vale más de 1.5 billones de dólares. Invirtió en educación, tecnología e innovación. Usa solo los rendimientos del fondo, no el capital.</li>
          <li><strong>Venezuela:</strong> Descubrió petróleo y lo usó para financiar gasto corriente. Cuando el precio cayó, el país colapsó.</li>
        </ul>
        <blockquote>"Argentina tiene la riqueza natural para ser Noruega. Tiene los incentivos políticos para ser Venezuela. La diferencia no está en la tierra: está en las instituciones que deciden qué hacer con lo que la tierra da."</blockquote>
      `,
      orderIndex: 5, type: 'text' as const, duration: 18, isRequired: true,
    },
    {
      courseId,
      title: 'El Estado en la Economía: ¿Mucho o Poco?',
      description: 'El rol del Estado argentino en la economía: más allá de la falsa dicotomía.',
      content: `
        <h2>La Pregunta Mal Formulada</h2>
        <p>"¿El Estado tiene que intervenir más o menos en la economía?" Es la pregunta más repetida en los debates argentinos. Y es la pregunta equivocada. La pregunta correcta es: <strong>¿Cómo interviene y para qué?</strong></p>
        <h3>Lo Que el Estado Argentino Hace (Bien y Mal)</h3>
        <ul>
          <li><strong>Recauda impuestos:</strong> La presión fiscal formal es alta (~30% del PIB), pero la evasión es enorme. Los que pagan, pagan mucho. Los que evaden, no pagan nada. El sistema es injusto por donde lo mires.</li>
          <li><strong>Redistribuye:</strong> AUH, jubilaciones, pensiones, programas sociales. La red de seguridad social es extensa pero mal focalizada y con fugas.</li>
          <li><strong>Regula:</strong> Controles de precios, regulación bancaria, normas laborales. A veces necesarias, a veces contraproducentes, muchas veces cambiantes.</li>
          <li><strong>Produce:</strong> Empresas públicas (YPF, Aerolíneas, medios). Debate eterno sobre su eficiencia.</li>
          <li><strong>Emplea:</strong> Más de 3.5 millones de empleados públicos (nación + provincias + municipios). El Estado es el principal empleador del país.</li>
        </ul>
        <h3>El Problema No Es el Tamaño sino la Calidad</h3>
        <p>Dinamarca tiene un Estado más grande que Argentina (en proporción al PIB) y funciona perfectamente. Haití tiene un Estado más chico y es un desastre. El tamaño del Estado no predice nada. Lo que importa es:</p>
        <ol>
          <li><strong>¿Genera valor público?</strong> ¿Los ciudadanos reciben servicios de calidad a cambio de sus impuestos?</li>
          <li><strong>¿Es eficiente?</strong> ¿Logra sus objetivos con los recursos disponibles?</li>
          <li><strong>¿Es transparente?</strong> ¿Se puede auditar cómo se gasta?</li>
          <li><strong>¿Es predecible?</strong> ¿Las reglas se mantienen en el tiempo?</li>
        </ol>
        <h3>Más Allá de la Grieta Ideológica</h3>
        <p>En Argentina, la discusión Estado grande vs. Estado chico está cargada ideológicamente. El Hombre Gris propone salir de esa falsa dicotomía: el objetivo no es más Estado ni menos Estado sino <strong>mejor Estado</strong>. Un Estado que funcione, que sea transparente, que genere valor y que no cambie las reglas cada 4 años.</p>
        <blockquote>"No necesitamos un Estado que haga todo ni uno que no haga nada. Necesitamos uno que haga bien lo que tiene que hacer y deje de hacer lo que no sabe hacer. Esa distinción es más útil que todo el debate ideológico junto."</blockquote>
      `,
      orderIndex: 6, type: 'text' as const, duration: 18, isRequired: true,
    },
    {
      courseId,
      title: 'Deuda Externa: La Soga al Cuello',
      description: 'La historia de la deuda argentina como patrón sistémico recurrente.',
      content: `
        <h2>200 Años Debiendo</h2>
        <p>El primer préstamo externo de Argentina fue en 1824 (Baring Brothers). Tardamos 80 años en pagarlo. Desde entonces, el ciclo de endeudamiento-crisis-reestructuración se repitió tantas veces que podríamos enseñarlo como un bucle de programación: <code>while(true) { endeudar(); crisis(); reestructurar(); }</code></p>
        <h3>El Ciclo de la Deuda</h3>
        <ol>
          <li><strong>Fase de acceso:</strong> Argentina tiene "buen crédito". Los mercados prestan alegremente. Los gobiernos se endeudan porque es más fácil que ajustar o recaudar.</li>
          <li><strong>Fase de acumulación:</strong> La deuda crece más rápido que la economía. Los intereses se pagan con más deuda. La bola de nieve crece.</li>
          <li><strong>Fase de desconfianza:</strong> Los prestamistas empiezan a dudar de la capacidad de pago. Suben la tasa de interés. La deuda se encarece.</li>
          <li><strong>Fase de crisis:</strong> Argentina no puede pagar. Default, devaluación, crisis social.</li>
          <li><strong>Fase de reestructuración:</strong> Se negocia con los acreedores una quita y extensión de plazos. Argentina recupera acceso al crédito.</li>
          <li><strong>Vuelta al paso 1.</strong></li>
        </ol>
        <h3>Los Defaults Argentinos</h3>
        <ul>
          <li><strong>1890:</strong> Crisis de la banca Baring. Argentina casi quiebra al sistema financiero británico.</li>
          <li><strong>1982:</strong> La deuda de la dictadura militar. Se estataliza la deuda privada (los contribuyentes pagan la deuda de las empresas).</li>
          <li><strong>2001:</strong> El default más grande de la historia mundial hasta ese momento (~100.000 millones de dólares).</li>
          <li><strong>2014/2020:</strong> Reestructuraciones bajo diferentes gobiernos.</li>
        </ul>
        <h3>¿Es Siempre Mala la Deuda?</h3>
        <p>No. Endeudarse para invertir en infraestructura, educación o tecnología que aumenten la capacidad productiva puede ser excelente. El problema es endeudarse para <strong>financiar gasto corriente</strong> (sueldos, subsidios) que no genera capacidad de repago.</p>
        <blockquote>"Endeudarte para construir una ruta que conecte una zona productiva con el puerto es inversión. Endeudarte para pagar sueldos este mes es posponer el problema al mes que viene. Argentina hizo mucho más de lo segundo que de lo primero."</blockquote>
      `,
      orderIndex: 7, type: 'text' as const, duration: 18, isRequired: true,
    },
    {
      courseId,
      title: 'Impuestos: Quién Paga y Quién No',
      description: 'El sistema impositivo argentino y sus distorsiones sistémicas.',
      content: `
        <h2>Un Sistema Diseñado para la Injusticia</h2>
        <p>El sistema impositivo argentino es uno de los más distorsionados del mundo. Tiene más de 160 impuestos entre nación, provincias y municipios. Es complejo, injusto y desincentiva la producción. Y aun así, <strong>no recauda lo suficiente</strong> para cubrir el gasto público.</p>
        <h3>Los Impuestos que Pagás (y No Sabés)</h3>
        <ul>
          <li><strong>IVA (21%):</strong> En cada compra. El impuesto más recaudador y el más regresivo: el pobre y el rico pagan lo mismo por un litro de leche.</li>
          <li><strong>Ganancias:</strong> Impuesto a los ingresos. En teoría progresivo (quien más gana, más paga). En la práctica, recae desproporcionadamente sobre asalariados porque los ricos tienen más formas de eludir.</li>
          <li><strong>Ingresos Brutos (provincial):</strong> Impuesto en cascada que se acumula en cada etapa de producción. Se traslada al precio final. Es como pagar IVA sobre IVA.</li>
          <li><strong>Impuesto al cheque:</strong> Cada movimiento bancario tiene un impuesto. Desincentiva el uso del sistema financiero formal.</li>
          <li><strong>Retenciones:</strong> Impuesto a las exportaciones agrícolas. Captura parte de la renta del campo para el Estado.</li>
          <li><strong>Tasas municipales:</strong> ABL, alumbrado, barrido, limpieza, contribución por mejoras, etc.</li>
        </ul>
        <h3>Lo Que Está Roto</h3>
        <ol>
          <li><strong>Regresividad:</strong> Los impuestos al consumo (IVA, Ingresos Brutos) representan más del 50% de la recaudación. Estos impuestos golpean más a los que menos tienen.</li>
          <li><strong>Evasión masiva:</strong> Se estima que la economía informal es del 35-40%. Eso significa que un tercio de la economía no paga impuestos. Los que pagan, subsidian a los que no.</li>
          <li><strong>Complejidad:</strong> Cumplir con las obligaciones fiscales requiere un contador. Para una PyME, los costos administrativos de cumplir son enormes.</li>
          <li><strong>Superposición:</strong> Nación, provincia y municipio cobran impuestos similares sobre la misma base. Triple imposición.</li>
        </ol>
        <h3>¿Cómo Debería Ser?</h3>
        <p>Un sistema impositivo bien diseñado debería ser: <strong>simple</strong> (pocos impuestos, fáciles de cumplir), <strong>progresivo</strong> (quien más tiene, más paga), <strong>eficiente</strong> (no distorsiona las decisiones económicas), y <strong>transparente</strong> (sabés a dónde va tu plata).</p>
        <blockquote>"El sistema impositivo argentino castiga al que produce, al que cumple y al que más necesita. Reformarlo no es un tema técnico: es un tema de justicia. Y la justicia fiscal es la base de cualquier contrato social funcional."</blockquote>
      `,
      orderIndex: 8, type: 'text' as const, duration: 18, isRequired: true,
    },
    {
      courseId,
      title: 'Economía del Conocimiento: El Sector Que Puede Romper el Ciclo',
      description: 'Cómo la economía del conocimiento puede transformar el modelo argentino.',
      content: `
        <h2>El Futuro que Argentina Ya Tiene</h2>
        <p>Mientras el debate público se centra en soja vs. industria, existe un sector que crece silenciosamente y que podría ser la <strong>llave para romper el ciclo stop-go</strong>: la economía del conocimiento. Software, biotecnología, industrias creativas, servicios profesionales.</p>
        <h3>¿Por Qué Es Diferente?</h3>
        <p>La economía del conocimiento no tiene las limitaciones del modelo tradicional:</p>
        <ul>
          <li><strong>Escala infinita:</strong> Una app puede tener 1 millón de usuarios sin necesitar más tierra ni más máquinas.</li>
          <li><strong>Genera dólares sin gastar dólares:</strong> Un programador argentino que trabaja para una empresa extranjera genera divisas sin importar insumos.</li>
          <li><strong>Distribuida geográficamente:</strong> Se puede producir software desde Salta, Resistencia o Bariloche. No requiere estar en Buenos Aires.</li>
          <li><strong>Alto valor agregado:</strong> Un kilo de soja vale centavos. Una hora de desarrollo de software vale decenas de dólares.</li>
        </ul>
        <h3>Argentina ya Es Potencia</h3>
        <ul>
          <li><strong>Mercado Libre:</strong> La empresa más valiosa de América Latina nació en un garage argentino.</li>
          <li><strong>Unicornios:</strong> Argentina tiene más "unicornios" (startups valuadas en más de 1.000 millones) per cápita que cualquier país de la región.</li>
          <li><strong>Exportación de servicios:</strong> Argentina exporta más de 7.000 millones de dólares anuales en servicios basados en conocimiento.</li>
          <li><strong>Capital humano:</strong> El sistema educativo (universidad pública gratuita) produce profesionales de alta calidad a bajo costo.</li>
        </ul>
        <h3>Los Obstáculos</h3>
        <ol>
          <li><strong>Presión impositiva:</strong> Las empresas de conocimiento enfrentan impuestos diseñados para empresas industriales del siglo XX.</li>
          <li><strong>Brecha cambiaria:</strong> Los profesionales que cobran en dólares pierden poder adquisitivo al pesificar al tipo de cambio oficial.</li>
          <li><strong>Fuga de talento:</strong> Los mejores se van a países que les ofrecen estabilidad y mejores condiciones.</li>
          <li><strong>Conectividad:</strong> Internet de calidad no llega a todo el territorio.</li>
        </ol>
        <blockquote>"Argentina tiene el talento para ser una potencia de la economía del conocimiento. Lo que le falta es un Estado que, en vez de ponerle trabas, le despeje el camino. Ese es el diseño sistémico que el Hombre Gris propone."</blockquote>
      `,
      orderIndex: 9, type: 'text' as const, duration: 18, isRequired: true,
    },
    {
      courseId,
      title: 'Diseñar la Salida: Qué Debería Hacer Argentina',
      description: 'Síntesis de intervenciones sistémicas para transformar la economía argentina.',
      content: `
        <h2>El Mapa de la Transformación Económica</h2>
        <p>Después de entender los ciclos, los bucles y las trampas del sistema económico argentino, la pregunta es: <strong>¿qué se hace?</strong> No hay soluciones mágicas, pero sí hay un conjunto de intervenciones que, aplicadas con consistencia, podrían romper los patrones.</p>
        <h3>Las 7 Transformaciones Necesarias</h3>
        <ol>
          <li><strong>Estabilidad monetaria creíble:</strong> Un Banco Central genuinamente independiente (no al servicio del presidente de turno) con mandato constitucional de mantener la estabilidad de precios. No es ideología: es ingeniería institucional.</li>
          <li><strong>Reforma fiscal integral:</strong> Simplificar el sistema, hacerlo progresivo, eliminar la superposición. Menos impuestos pero mejor diseñados y más difíciles de evadir. Ampliar la base: que paguen todos, no solo los que cumplen.</li>
          <li><strong>Diversificación exportadora:</strong> Políticas activas para desarrollar exportaciones de alto valor: tecnología, servicios, manufactura avanzada, biotecnología. El agro como base, no como techo.</li>
          <li><strong>Fondo contracíclico:</strong> Ahorrar en las buenas para gastar en las malas. Chile lo hace con el cobre. Argentina podría hacerlo con la soja y los hidrocarburos. Requiere una ley con candados que impidan a los gobiernos gastar el fondo.</li>
          <li><strong>Integración inteligente al mundo:</strong> No cerrarse ni abrirse ciegamente. Acuerdos comerciales que protejan industrias estratégicas mientras abren mercados para lo que Argentina hace bien.</li>
          <li><strong>Inversión en capital humano:</strong> Educación de calidad (no solo acceso, sino resultados), ciencia y tecnología como política de Estado, retención de talento.</li>
          <li><strong>Reglas del juego estables:</strong> La inversión (nacional y extranjera) necesita previsibilidad. Nadie invierte en un país donde las reglas cambian con cada gobierno.</li>
        </ol>
        <h3>¿Por Qué No Se Hace?</h3>
        <p>Cada una de estas transformaciones tiene <strong>beneficiarios a largo plazo y perdedores a corto plazo</strong>. Los perdedores a corto plazo gritan; los beneficiarios a largo plazo todavía no existen. Y las elecciones son cada 2 años.</p>
        <h3>El Rol del Ciudadano</h3>
        <ul>
          <li><strong>Exigir consistencia:</strong> Dejar de pedirle al gobierno que gaste más HOY y empezar a pedir que planifique para MAÑANA.</li>
          <li><strong>Votar con información:</strong> Evaluar propuestas económicas con las herramientas de este curso, no con el estómago.</li>
          <li><strong>Emprender:</strong> Cada emprendimiento que produce valor es una contribución al cambio de modelo.</li>
          <li><strong>Educar:</strong> Compartir este conocimiento. Un pueblo que entiende su economía es más difícil de manipular.</li>
        </ul>
        <blockquote>"Argentina no necesita un milagro económico. Necesita 20 años de coherencia. Eso suena aburrido comparado con las promesas de los candidatos, pero es la pura verdad. Y el Hombre Gris prefiere verdades aburridas a mentiras emocionantes."</blockquote>
      `,
      orderIndex: 10, type: 'text' as const, duration: 18, isRequired: true,
    },
  ];

  for (const lesson of lessons) { await db.insert(courseLessons).values(lesson); }
  console.log('Created', lessons.length, 'lessons for course 13');

  const eq13 = await db.select().from(courseQuizzes).where(eq(courseQuizzes.courseId, courseId)).limit(1);
  if (eq13.length > 0) { await db.delete(quizQuestions).where(eq(quizQuestions.quizId, eq13[0].id)); await db.delete(courseQuizzes).where(eq(courseQuizzes.courseId, courseId)); }
  const [quiz13] = await db.insert(courseQuizzes).values({ courseId, title: 'Quiz: Sistemas Económicos', description: 'Evaluá tu comprensión del sistema económico argentino.', passingScore: 70, timeLimit: 15, allowRetakes: true, maxAttempts: 3 }).returning();
  const q13 = [
    { quizId: quiz13.id, question: '¿Qué es un bucle de retroalimentación positivo en economía?', type: 'multiple_choice' as const, options: JSON.stringify(['Algo bueno que pasa', 'Un ciclo donde A causa B y B refuerza A, amplificándose', 'Una política exitosa', 'Un aumento de salarios']), correctAnswer: JSON.stringify(1), explanation: 'Un bucle positivo se amplifica: como la inflación que genera expectativas de más inflación.', points: 2, orderIndex: 1 },
    { quizId: quiz13.id, question: 'La inflación argentina tiene una sola causa: la emisión monetaria.', type: 'true_false' as const, correctAnswer: JSON.stringify(false), explanation: 'La inflación argentina es multicausal: emisión, costos, expectativas, oligopolios y tipo de cambio interactúan.', points: 1, orderIndex: 2 },
    { quizId: quiz13.id, question: '¿Qué fase del ciclo stop-go se caracteriza por el agotamiento de reservas de dólares?', type: 'multiple_choice' as const, options: JSON.stringify(['Fase de expansión (GO)', 'Fase de tensión y crisis', 'Fase de ajuste (STOP)', 'Fase de recuperación']), correctAnswer: JSON.stringify(1), explanation: 'Cuando la expansión demanda más importaciones de las que las exportaciones pueden financiar, las reservas se agotan.', points: 2, orderIndex: 3 },
    { quizId: quiz13.id, question: 'Noruega y Venezuela tuvieron petróleo. Noruega creó un fondo soberano; Venezuela gastó todo.', type: 'true_false' as const, correctAnswer: JSON.stringify(true), explanation: 'Noruega ahorró la renta petrolera en un fondo que hoy vale 1.5 billones de dólares, mientras Venezuela colapsó.', points: 1, orderIndex: 4 },
    { quizId: quiz13.id, question: '¿Por qué la economía del conocimiento puede romper el ciclo stop-go?', type: 'multiple_choice' as const, options: JSON.stringify(['Porque usa menos energía', 'Porque genera dólares sin gastar dólares en importaciones', 'Porque no paga impuestos', 'Porque es más fácil que la agricultura']), correctAnswer: JSON.stringify(1), explanation: 'El conocimiento genera divisas exportando servicios sin necesitar importar insumos, rompiendo la restricción externa.', points: 2, orderIndex: 5 },
    { quizId: quiz13.id, question: 'El IVA es un impuesto progresivo porque todos lo pagan.', type: 'true_false' as const, correctAnswer: JSON.stringify(false), explanation: 'El IVA es regresivo: el pobre y el rico pagan lo mismo por los mismos bienes, pero para el pobre representa un porcentaje mayor de su ingreso.', points: 1, orderIndex: 6 },
    { quizId: quiz13.id, question: '¿Qué necesita Argentina para romper el ciclo económico según el análisis sistémico?', type: 'multiple_choice' as const, options: JSON.stringify(['Un líder carismático', '20 años de coherencia en políticas económicas', 'Más emisión monetaria', 'Cerrar la economía']), correctAnswer: JSON.stringify(1), explanation: 'La transformación requiere consistencia de políticas durante décadas, no soluciones mágicas de corto plazo.', points: 2, orderIndex: 7 },
    { quizId: quiz13.id, question: 'La brecha entre dólar oficial y "blue" mide la distorsión entre precio oficial y expectativas del mercado.', type: 'true_false' as const, correctAnswer: JSON.stringify(true), explanation: 'La brecha cambiaria refleja la diferencia entre el precio que el gobierno fija y el que el mercado determina.', points: 1, orderIndex: 8 },
  ];
  for (const q of q13) { await db.insert(quizQuestions).values(q); }
  console.log('Created quiz for course 13');
}

async function seedCourse14(authorId: number) {
  console.log('--- Course 14: Emprendimiento con Propósito ---');
  let course = await db.select().from(courses).where(eq(courses.slug, 'emprendimiento-con-proposito')).limit(1);
  if (course.length === 0) {
    const [newCourse] = await db.insert(courses).values({
      title: 'Emprendimiento con Propósito: Crear Valor Real',
      slug: 'emprendimiento-con-proposito',
      description: 'Inicia un emprendimiento que cree valor real en una sociedad de baja confianza. Desde monotributo y SAS hasta cooperativas, aprende a construir negocios basados en propósito y confianza.',
      excerpt: 'Crea un emprendimiento que genere valor real para vos y tu comunidad.',
      category: 'economia',
      level: 'advanced',
      duration: 180,
      thumbnailUrl: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800',
      orderIndex: 14,
      isPublished: true,
      isFeatured: false,
      requiresAuth: false,
      authorId,
    }).returning();
    course = [newCourse];
    console.log('Created course 14:', course[0].title);
  } else {
    console.log('Found existing course 14:', course[0].title);
  }

  const courseId = course[0].id;
  await db.delete(courseLessons).where(eq(courseLessons.courseId, courseId));

  const lessons = [
    {
      courseId,
      title: 'El Emprendedor como Arquitecto Social',
      description: 'Redefinir qué significa emprender en Argentina: no solo hacer dinero, sino construir confianza.',
      content: `
        <h2>Emprender No Es Lo Que Te Dijeron</h2>
        <p>La imagen del emprendedor exitoso que nos vende la cultura popular es la de alguien que "se hizo solo", que se saltó las reglas, que tuvo una idea genial y se hizo millonario. Pero esa imagen es una <strong>trampa</strong>, especialmente en Argentina.</p>
        <p>En un país donde la confianza interpersonal es baja, donde el 60% de la economía es informal, y donde las reglas cambian cada 4 años, emprender con propósito significa algo radicalmente diferente: <strong>ser un arquitecto de confianza en un territorio de desconfianza</strong>.</p>
        <h3>La Paradoja del Emprendimiento Argentino</h3>
        <p>Argentina produce más emprendedores per cápita que casi cualquier país latinoamericano. Tenemos Mercado Libre, Globant, Auth0, Ualá, Tiendanube. Pero al mismo tiempo, el 80% de los emprendimientos cierran antes de los 3 años. ¿Por qué?</p>
        <ul>
          <li><strong>Emprender por necesidad vs. por oportunidad:</strong> Muchos emprenden porque no consiguen empleo, no porque descubrieron un problema que resolver. El emprendimiento por necesidad tiene tasas de supervivencia mucho más bajas.</li>
          <li><strong>El mito del llanero solitario:</strong> El emprendedor argentino tiende a hacer todo solo porque "no confía en nadie". Pero los emprendimientos que sobreviven son los que construyen equipos y redes.</li>
          <li><strong>Innovación de supervivencia:</strong> La inestabilidad argentina nos hace innovadores... pero de un tipo particular: somos geniales en "atar con alambre" soluciones de emergencia, no tanto en construir sistemas sostenibles.</li>
        </ul>
        <h3>El Emprendimiento con Propósito</h3>
        <p>Un emprendimiento con propósito se define por tres ejes:</p>
        <ol>
          <li><strong>Valor económico:</strong> Tiene que ser viable. El propósito sin modelo de negocios es voluntariado (que está bien, pero no es emprendimiento).</li>
          <li><strong>Valor social:</strong> Resuelve un problema real de una comunidad real. No "disruptea" — transforma.</li>
          <li><strong>Valor sistémico:</strong> Contribuye a reconstruir la confianza. Cada transacción honesta, cada promesa cumplida, cada empleado bien tratado es un ladrillo en la reconstrucción del tejido social.</li>
        </ol>
        <blockquote>"En Argentina, cada emprendedor honesto es un acto de resistencia contra la cultura de la viveza. Cada factura emitida es un voto por la legalidad. Cada empleado en blanco es una apuesta por el futuro. No subestimes tu poder."</blockquote>
      `,
      orderIndex: 1, type: 'text' as const, duration: 18, isRequired: true,
    },
    {
      courseId,
      title: 'El Mapa del Problema: De la Queja a la Oportunidad',
      description: 'Cómo identificar problemas reales que se convierten en oportunidades de emprendimiento.',
      content: `
        <h2>Las Quejas Son Minas de Oro</h2>
        <p>Todo emprendimiento exitoso nace de un <strong>problema real</strong>. Y Argentina tiene problemas de sobra. Pero pasar de "esto anda mal" a "puedo crear algo que lo resuelva" requiere un método, no solo inspiración.</p>
        <h3>El Método del Mapa de Dolor</h3>
        <p>Tomá un papel y hacé tres columnas:</p>
        <table style="width:100%; border-collapse: collapse;">
          <tr style="background:#f0f0f0;"><th style="padding:8px; border:1px solid #ddd;">Queja / Frustración</th><th style="padding:8px; border:1px solid #ddd;">¿Quién sufre esto?</th><th style="padding:8px; border:1px solid #ddd;">¿Pagarían por una solución?</th></tr>
          <tr><td style="padding:8px; border:1px solid #ddd;">"Los trámites municipales tardan meses"</td><td style="padding:8px; border:1px solid #ddd;">Ciudadanos, PyMEs, profesionales</td><td style="padding:8px; border:1px solid #ddd;">Sí — ya pagan gestores informales</td></tr>
          <tr><td style="padding:8px; border:1px solid #ddd;">"No consigo verdura fresca a buen precio"</td><td style="padding:8px; border:1px solid #ddd;">Familias urbanas</td><td style="padding:8px; border:1px solid #ddd;">Sí — pagan sobreprecios en verdulerías</td></tr>
          <tr><td style="padding:8px; border:1px solid #ddd;">"Mi abuela no puede usar el homebanking"</td><td style="padding:8px; border:1px solid #ddd;">Adultos mayores, sus familias</td><td style="padding:8px; border:1px solid #ddd;">Las familias pagarían, los bancos también</td></tr>
        </table>
        <h3>Los 5 Filtros de un Problema Emprendible</h3>
        <ol>
          <li><strong>Frecuencia:</strong> ¿El problema ocurre todos los días, una vez por mes, o una vez en la vida? Problemas frecuentes = mejores negocios recurrentes.</li>
          <li><strong>Intensidad:</strong> ¿Cuánto duele? ¿Es una molestia o una urgencia? A mayor dolor, mayor disposición a pagar.</li>
          <li><strong>Tamaño del mercado:</strong> ¿Cuántas personas lo sufren? Un problema de 10 personas es un favor; de 10.000, un negocio; de 1 millón, una empresa.</li>
          <li><strong>Soluciones actuales:</strong> ¿Cómo lo resuelven hoy? Si la solución actual es mala, cara o inexistente, hay oportunidad.</li>
          <li><strong>Tu cercanía:</strong> ¿Conocés personalmente este problema? Los mejores emprendimientos nacen de dolores propios.</li>
        </ol>
        <h3>Problemas Argentinos que Son Oportunidades</h3>
        <ul>
          <li><strong>Informalidad:</strong> 6 millones de trabajadores informales que necesitan herramientas para formalizarse gradualmente.</li>
          <li><strong>Educación:</strong> La brecha entre lo que se enseña y lo que el mercado necesita. Capacitación en oficios digitales.</li>
          <li><strong>Logística del último km:</strong> En pueblos y barrios periféricos, recibir un paquete o acceder a servicios es un problema sin resolver.</li>
          <li><strong>Alimentación:</strong> El 30% de la comida producida se pierde. Circuitos cortos entre productor y consumidor.</li>
          <li><strong>Energía:</strong> Paneles solares compartidos, eficiencia energética para PyMEs, medición inteligente.</li>
        </ul>
        <blockquote>"No busques la idea del siglo. Buscá un problema que te duela, que le duela a mucha gente, y que puedas resolver un poco mejor que como se resuelve hoy. Eso alcanza para empezar."</blockquote>
      `,
      orderIndex: 2, type: 'text' as const, duration: 16, isRequired: true,
    },
    {
      courseId,
      title: 'Modelo de Negocios: El Lienzo del Emprendedor Argentino',
      description: 'Adaptar el Business Model Canvas a la realidad argentina de alta incertidumbre.',
      content: `
        <h2>El Canvas, Versión Argentina</h2>
        <p>El Business Model Canvas de Alexander Osterwalder es una herramienta universal. Pero en Argentina necesita <strong>adaptaciones</strong> que ningún libro de Stanford te va a enseñar.</p>
        <h3>Los 9 Bloques (con Realidad Argentina)</h3>
        <ol>
          <li><strong>Propuesta de valor:</strong> ¿Qué problema resolvés y por qué lo resolvés mejor? En Argentina, la confianza ES parte de la propuesta de valor. "Te cumplo lo que prometo" ya es diferenciador.</li>
          <li><strong>Segmento de clientes:</strong> ¿A quién le vendés? Cuidado con la segmentación por ingreso en Argentina: la clase media se expande y contrae cada 5 años. Mejor segmentá por <em>comportamiento</em>.</li>
          <li><strong>Canales:</strong> ¿Cómo llegás al cliente? WhatsApp es el canal de ventas más poderoso de Argentina. Instagram y MercadoLibre le siguen. Los canales tradicionales murieron.</li>
          <li><strong>Relación con clientes:</strong> En una sociedad de baja confianza, la relación personal es CLAVE. La recomendación boca a boca vale 10 veces más que cualquier publicidad.</li>
          <li><strong>Fuentes de ingreso:</strong> ¿Cómo cobrás? En Argentina, considerar: ¿en pesos o dólares? ¿con inflación, cómo ajustás? ¿cuotas? ¿efectivo o digital?</li>
          <li><strong>Recursos clave:</strong> ¿Qué necesitás para operar? Minimizá los recursos en dólares. Maximizá el talento humano (abundante y relativamente barato en Argentina).</li>
          <li><strong>Actividades clave:</strong> ¿Qué tenés que hacer todos los días? En Argentina, sumá: gestión de precios con inflación, adaptación a cambios regulatorios, y manejo de stock con escasez.</li>
          <li><strong>Socios clave:</strong> ¿Con quién te aliás? En Argentina, los socios de confianza son ORO. Un buen contador, un proveedor confiable, un socio complementario pueden definir tu supervivencia.</li>
          <li><strong>Estructura de costos:</strong> ¿Cuánto te cuesta operar? Atención: en Argentina tus costos cambian TODOS LOS MESES. Necesitás una estructura que absorba variaciones del 5-10% mensual.</li>
        </ol>
        <h3>El Bloque 10: El Blindaje Anti-Argentina</h3>
        <p>Agregá un décimo bloque que ningún manual incluye: <strong>¿Cómo sobrevivís a la Argentina?</strong></p>
        <ul>
          <li>¿Tu negocio resiste una devaluación del 50%?</li>
          <li>¿Podés operar con cepo cambiario?</li>
          <li>¿Qué pasa si cambian la regulación de tu sector?</li>
          <li>¿Tenés un "plan B" si tu proveedor principal cierra?</li>
        </ul>
        <h3>MVP: Mínimo Producto Viable, Máxima Velocidad</h3>
        <p>No gastes 6 meses planificando. Salí al mercado en <strong>30 días</strong> con algo básico que funcione. En Argentina, la ventana de oportunidad se cierra rápido. Más vale un producto imperfecto en la calle que uno perfecto en tu cabeza.</p>
        <blockquote>"El plan de negocios perfecto no existe en un país donde la realidad cambia más rápido que cualquier planilla de Excel. Tu mejor plan es tu capacidad de adaptación. El canvas te da el marco; la calle te da los datos."</blockquote>
      `,
      orderIndex: 3, type: 'text' as const, duration: 18, isRequired: true,
    },
    {
      courseId,
      title: 'Formalización Sin Morir en el Intento',
      description: 'Guía práctica de estructuras legales y fiscales para emprender en Argentina.',
      content: `
        <h2>El Laberinto Legal Argentino (con Mapa)</h2>
        <p>El 40% de la economía argentina es informal. ¿Por qué? Porque formalizarse parece imposible: trámites interminables, impuestos asfixiantes, burocracia kafkiana. Pero la informalidad tiene un costo enorme: no podés crecer, no podés exportar, no podés acceder a crédito, no podés proteger tus activos.</p>
        <p>Este capítulo te da el <strong>mapa de la formalización</strong>: qué opciones tenés, cuánto cuestan realmente, y cuál te conviene según tu situación.</p>
        <h3>Las 5 Formas Jurídicas</h3>
        <table style="width:100%; border-collapse: collapse;">
          <tr style="background:#f0f0f0;"><th style="padding:8px; border:1px solid #ddd;">Forma</th><th style="padding:8px; border:1px solid #ddd;">Para quién</th><th style="padding:8px; border:1px solid #ddd;">Costo mensual aprox.</th><th style="padding:8px; border:1px solid #ddd;">Ventaja clave</th></tr>
          <tr><td style="padding:8px; border:1px solid #ddd;"><strong>Monotributo</strong></td><td style="padding:8px; border:1px solid #ddd;">Arrancando solo/a</td><td style="padding:8px; border:1px solid #ddd;">$15.000 - $40.000</td><td style="padding:8px; border:1px solid #ddd;">Simplicidad total</td></tr>
          <tr><td style="padding:8px; border:1px solid #ddd;"><strong>Responsable Inscripto</strong></td><td style="padding:8px; border:1px solid #ddd;">Facturás mucho</td><td style="padding:8px; border:1px solid #ddd;">Variable (21% IVA + Ganancias)</td><td style="padding:8px; border:1px solid #ddd;">Sin techo de facturación</td></tr>
          <tr><td style="padding:8px; border:1px solid #ddd;"><strong>SAS</strong></td><td style="padding:8px; border:1px solid #ddd;">2+ socios, crecer rápido</td><td style="padding:8px; border:1px solid #ddd;">$50.000+</td><td style="padding:8px; border:1px solid #ddd;">Patrimonio separado, rapidez</td></tr>
          <tr><td style="padding:8px; border:1px solid #ddd;"><strong>SRL</strong></td><td style="padding:8px; border:1px solid #ddd;">Tradición, varios socios</td><td style="padding:8px; border:1px solid #ddd;">$80.000+</td><td style="padding:8px; border:1px solid #ddd;">Estructura conocida</td></tr>
          <tr><td style="padding:8px; border:1px solid #ddd;"><strong>Cooperativa</strong></td><td style="padding:8px; border:1px solid #ddd;">Proyecto comunitario</td><td style="padding:8px; border:1px solid #ddd;">Variable</td><td style="padding:8px; border:1px solid #ddd;">Beneficios impositivos, democracia</td></tr>
        </table>
        <h3>Monotributo: Tu Primer Paso</h3>
        <p>El monotributo es la puerta de entrada a la formalidad. Con un solo pago mensual cubrís: impuestos, obra social y jubilación. Hay categorías (A a K) según tu facturación.</p>
        <ul>
          <li><strong>Trámite:</strong> Se hace 100% online en afip.gob.ar. Necesitás CUIL y clave fiscal nivel 3.</li>
          <li><strong>Tiempo:</strong> 1-2 horas si tenés todo listo.</li>
          <li><strong>Costo real:</strong> Depende de la categoría, pero arranca en valores accesibles.</li>
          <li><strong>Facturación:</strong> Factura C electrónica desde la app o web de AFIP.</li>
        </ul>
        <h3>La SAS: La Revolución Silenciosa</h3>
        <p>La Sociedad por Acciones Simplificada (SAS) fue creada en 2017 para que emprendedores puedan tener una sociedad formal sin los costos y la burocracia de una SRL o SA. Se constituye en 24 horas de forma digital, requiere capital mínimo de 2 salarios mínimos, y puede tener un solo socio.</p>
        <h3>¿Cuándo Dar el Salto?</h3>
        <ol>
          <li><strong>De informal a monotributo:</strong> Cuando empezás a tener clientes recurrentes que necesitan factura.</li>
          <li><strong>De monotributo a SAS/SRL:</strong> Cuando te acercás al tope de facturación, cuando necesitás separar patrimonio personal del comercial, o cuando sumás socios.</li>
          <li><strong>De SAS a SA:</strong> Cuando necesitás inversores institucionales o querés cotizar en bolsa (esto es para muy pocos).</li>
        </ol>
        <blockquote>"La formalidad no es un gasto, es una inversión. Cada peso que ponés en estar en blanco te vuelve en acceso a crédito, clientes corporativos, exportación y tranquilidad. El costo de la informalidad es invisible pero enorme."</blockquote>
      `,
      orderIndex: 4, type: 'text' as const, duration: 18, isRequired: true,
    },
    {
      courseId,
      title: 'Finanzas del Emprendedor: Sobrevivir la Montaña Rusa',
      description: 'Gestión financiera en un contexto de alta inflación e incertidumbre cambiaria.',
      content: `
        <h2>El Dinero en un País que Cambia de Reglas</h2>
        <p>Manejar las finanzas de un emprendimiento en Argentina requiere habilidades que no enseñan en ninguna escuela de negocios del mundo. Porque ningún otro país combina: inflación de tres dígitos, brecha cambiaria, congelamiento de precios, cambios impositivos trimestrales y crisis cíclicas.</p>
        <h3>La Regla de Oro: Pensá en Dólares, Operá en Pesos</h3>
        <p>Tu planilla interna de costos y márgenes debería estar en dólares (o en UVAs, o en alguna unidad de cuenta estable). Pero tu operación diaria es en pesos. Esta doble contabilidad mental es agotadora pero necesaria.</p>
        <h3>Gestión de Precios con Inflación</h3>
        <ul>
          <li><strong>Costeo por reposición:</strong> No calculés tu ganancia sobre lo que PAGASTE por el stock, sino sobre lo que te va a COSTAR REPONER. Si compraste a $1.000 y vendés a $1.500, pero reponer sale $1.800, estás perdiendo plata.</li>
          <li><strong>Frecuencia de ajuste:</strong> Revisá precios al menos una vez por mes. Si tus competidores ajustan cada 15 días, vos también.</li>
          <li><strong>Comunicación al cliente:</strong> Sé transparente. "Ajustamos precios porque nuestros costos subieron un X%" genera más confianza que remarcar silenciosamente.</li>
        </ul>
        <h3>El Flujo de Caja es Rey</h3>
        <p>En Argentina, la rentabilidad es menos importante que el <strong>flujo de caja</strong>. Podés ser "rentable" en papel pero fundir porque:</p>
        <ol>
          <li>Te pagan a 60 días pero a tus proveedores les pagás a 30.</li>
          <li>La inflación licúa lo que te deben entre que facturás y cobrás.</li>
          <li>Tus clientes te pagan en cuotas fijas mientras tus costos suben.</li>
        </ol>
        <p><strong>Regla práctica:</strong> Mantené un colchón de al menos 3 meses de costos fijos. En Argentina ideal son 6 meses. Sí, es mucho. Y sí, es la diferencia entre sobrevivir y cerrar en la próxima crisis.</p>
        <h3>Herramientas Financieras Clave</h3>
        <ul>
          <li><strong>Factura electrónica AFIP:</strong> Obligatoria y gratuita. Usala para todo.</li>
          <li><strong>Cuentas comitentes:</strong> Si tenés excedente, poné la plata a trabajar en FCI money market o plazo fijo UVA. Los pesos quietos se derriten.</li>
          <li><strong>Créditos a tasa subsidiada:</strong> Banco Nación y BICE ofrecen líneas para emprendedores. Investigá antes de ir al banco comercial.</li>
          <li><strong>Descuento de cheques:</strong> Si recibís cheques a 30-60-90 días, podés descontarlos en SGR (Sociedades de Garantía Recíproca) para tener la plata antes.</li>
        </ul>
        <blockquote>"En Argentina, un emprendedor que domina las finanzas tiene más ventaja competitiva que uno que tiene el mejor producto. Porque el mejor producto del mundo no sirve si te quedaste sin caja."</blockquote>
      `,
      orderIndex: 5, type: 'text' as const, duration: 18, isRequired: true,
    },
    {
      courseId,
      title: 'Capital Humano: Liderar un Equipo con Propósito',
      description: 'Cómo construir equipos en un contexto de alta rotación y desconfianza sistémica.',
      content: `
        <h2>Las Personas Son Tu Ventaja Competitiva Real</h2>
        <p>En Argentina, la tecnología se copia, los productos se imitan, los precios se igualan. Lo que NO se puede copiar es un <strong>equipo comprometido</strong>. Y construir equipo en Argentina tiene desafíos únicos.</p>
        <h3>El Dilema del Empleo en Argentina</h3>
        <p>Contratar un empleado en Argentina cuesta aproximadamente <strong>el doble del sueldo de bolsillo</strong> cuando sumás cargas sociales, ART, seguro, vacaciones, aguinaldo y contribuciones. Esto genera un sistema perverso:</p>
        <ul>
          <li>Las empresas evitan contratar formalmente → hay más informalidad.</li>
          <li>Los empleados en negro no tienen derechos → hay más rotación.</li>
          <li>La alta rotación reduce la productividad → las empresas ganan menos → contratan menos formalmente.</li>
        </ul>
        <p>Romper este ciclo es un acto de emprendimiento con propósito.</p>
        <h3>Alternativas al Empleo Tradicional</h3>
        <ul>
          <li><strong>Monotributistas asociados:</strong> Para proyectos puntuales o especializados. Cuidado con la relación de dependencia encubierta (la AFIP controla).</li>
          <li><strong>Cooperativas de trabajo:</strong> Los "empleados" son socios. Comparten ganancias y decisiones. Ideal para servicios profesionales.</li>
          <li><strong>Contratos a plazo fijo:</strong> Para necesidades temporales con cobertura legal completa.</li>
          <li><strong>Medio tiempo formal:</strong> Sí, se puede. Y a veces un buen empleado 4 horas rinde más que uno malo 8 horas.</li>
        </ul>
        <h3>Cultura de Equipo en la Argentina de Hoy</h3>
        <p>El liderazgo en Argentina requiere entender el contexto emocional:</p>
        <ol>
          <li><strong>La gente está agotada:</strong> Años de crisis sucesivas generan fatiga. Un líder que reconoce el cansancio genera más lealtad que uno que exige motivación artificial.</li>
          <li><strong>La transparencia es revolucionaria:</strong> Compartí los números del negocio con tu equipo. En un país donde "nadie te dice la verdad", la transparencia construye confianza como nada.</li>
          <li><strong>El salario emocional cuenta:</strong> Flexibilidad horaria, home office, capacitación, buen trato — en un mercado donde abundan los malos jefes, ser un buen líder es diferenciador.</li>
          <li><strong>Celebrá las pequeñas victorias:</strong> En un contexto adverso, cada logro merece reconocimiento. La cultura del "todavía falta" mata equipos.</li>
        </ol>
        <h3>La Regla del Primer Empleado</h3>
        <p>Tu primer empleado es la decisión más importante de tu emprendimiento. No contrates al más barato ni al que "me hace el favor". Contratá al que <strong>complementa tus debilidades</strong>. Si sos creativo, tu primer empleado debe ser organizado. Si sos técnico, necesitás a alguien que sepa vender.</p>
        <blockquote>"La empresa más importante de tu vida no es tu producto: es tu equipo. Los productos se pivotean, los mercados cambian, pero un equipo de confianza puede sobrevivir a cualquier crisis argentina."</blockquote>
      `,
      orderIndex: 6, type: 'text' as const, duration: 16, isRequired: true,
    },
    {
      courseId,
      title: 'Marketing Honesto: Vender Sin Vender el Alma',
      description: 'Estrategias de marketing y ventas basadas en confianza, no en manipulación.',
      content: `
        <h2>El Fin del Marketing de la Mentira</h2>
        <p>Argentina tiene una larga tradición de marketing agresivo, promesas infladas y letra chica. "Sin interés" (que tiene interés). "Natural" (que tiene químicos). "Artesanal" (que sale de una fábrica). Los consumidores argentinos son <strong>los más escépticos de Latinoamérica</strong> — y con razón.</p>
        <p>Pero esa misma desconfianza genera una oportunidad enorme: el que es genuinamente honesto <strong>se destaca como un faro en la niebla</strong>.</p>
        <h3>Los 3 Pilares del Marketing con Propósito</h3>
        <ol>
          <li><strong>Autenticidad radical:</strong> Mostrá quién sos, cómo producís, cuánto cuesta realmente. Las marcas que abren sus cocinas ganan la confianza que las que las esconden pierden.</li>
          <li><strong>Comunidad antes que audiencia:</strong> No querés "seguidores" — querés <em>cómplices</em>. Gente que comparte tu propósito y te recomienda porque cree en lo que hacés.</li>
          <li><strong>Contenido que educa:</strong> En vez de "comprá mi producto", enseñá algo útil. El emprendimiento que educa se posiciona como autoridad y genera confianza.</li>
        </ol>
        <h3>Canales que Funcionan en Argentina (2024-2025)</h3>
        <ul>
          <li><strong>WhatsApp Business:</strong> El canal de ventas más poderoso. Catálogo de productos, respuestas automáticas, grupos de clientes. GRATIS.</li>
          <li><strong>Instagram:</strong> Ideal para productos visuales. Reels cortos (15-30 segundos) superan a cualquier publicidad paga.</li>
          <li><strong>MercadoLibre:</strong> Si vendés productos físicos, es tu plaza virtual. La reputación ahí construida vale oro.</li>
          <li><strong>Ferias y eventos locales:</strong> Lo presencial sigue siendo poderoso. Una feria en tu barrio puede darte tus primeros 50 clientes fieles.</li>
          <li><strong>Boca a boca estructurado:</strong> Pedí reseñas a tus mejores clientes. Ofrecé descuentos por referidos. Hacé que recomendar tu producto sea fácil.</li>
        </ul>
        <h3>El Precio Justo en un País con Inflación</h3>
        <p>La estrategia de precios en Argentina es un arte:</p>
        <ul>
          <li><strong>Nunca compitas solo por precio:</strong> Siempre va a haber alguien más barato (y probablemente informal). Competí por valor, confianza y experiencia.</li>
          <li><strong>Comunicá el valor, no el costo:</strong> "Este producto te dura 5 años" vale más que "este producto cuesta $X".</li>
          <li><strong>Ofrecé opciones:</strong> Tres versiones (básica, estándar, premium) permiten que cada cliente elija según su presupuesto.</li>
        </ul>
        <blockquote>"El mejor marketing que existe es un cliente satisfecho que te recomienda. Y el mejor camino a un cliente satisfecho es cumplir exactamente lo que prometiste. Ni más, ni menos. En Argentina, eso te convierte en leyenda."</blockquote>
      `,
      orderIndex: 7, type: 'text' as const, duration: 16, isRequired: true,
    },
    {
      courseId,
      title: 'Economía Circular y Sustentabilidad: El Negocio del Futuro',
      description: 'Integrar la sustentabilidad como ventaja competitiva, no como costo.',
      content: `
        <h2>Ganar Plata Mientras Cuidás el Planeta</h2>
        <p>La sustentabilidad no es un lujo de países ricos. En Argentina, donde los recursos son escasos y cada peso cuenta, la <strong>economía circular</strong> no es idealismo: es la estrategia de negocios más inteligente que existe.</p>
        <h3>¿Qué Es la Economía Circular?</h3>
        <p>La economía lineal funciona así: extraer → producir → usar → tirar. La circular funciona así: cada "residuo" es el <strong>insumo</strong> de otro proceso. Nada se pierde.</p>
        <h3>Casos Argentinos Reales</h3>
        <ul>
          <li><strong>Cervecerías artesanales:</strong> El grano usado (bagazo) se dona a granjas como alimento animal. La granja produce leche. La leche hace queso. El queso se vende en la cervecería. Ciclo cerrado.</li>
          <li><strong>Cooperativas de reciclado:</strong> Los cartoneros fueron los pioneros de la economía circular en Argentina. Hoy cooperativas como El Álamo transforman residuos en productos de diseño.</li>
          <li><strong>Ropa de segunda mano:</strong> Apps como Reusá y Vigga generan un mercado de moda circular que crece 40% anual.</li>
          <li><strong>Construcción sustentable:</strong> Ecoladrillos hechos con botellas PET, casas con pallets reciclados, aislamiento con papel de diario triturado.</li>
          <li><strong>Agricultura regenerativa:</strong> Productores que restauran el suelo en vez de agotarlo, generando más productividad a largo plazo con menos insumos.</li>
        </ul>
        <h3>Cómo Integrar Circularidad a Tu Emprendimiento</h3>
        <ol>
          <li><strong>Auditoría de residuos:</strong> ¿Qué tirás? Cada cosa que tirás es dinero que perdés. Hacé una lista de todos tus "desechos" y pensá quién podría usarlos.</li>
          <li><strong>Diseño para la durabilidad:</strong> Un producto que dura más se puede cobrar más. Y genera clientes fieles que saben que lo que comprás les va a durar.</li>
          <li><strong>Sistemas de devolución:</strong> "Traé el envase y te doy un descuento." Reducís costos de empaque y generás visitas recurrentes.</li>
          <li><strong>Compartir recursos:</strong> ¿Necesitás una herramienta 2 horas por semana? Compartila con otros emprendedores en vez de comprar una cada uno.</li>
        </ol>
        <h3>El Sello B: Certificar Tu Propósito</h3>
        <p>Las Empresas B son una nueva categoría de empresas que buscan ser "las mejores PARA el mundo" y no solo "las mejores DEL mundo". Argentina tiene más de 200 empresas B certificadas. La certificación te abre puertas comerciales, atrae talento comprometido y te conecta con una red de emprendedores con valores compartidos.</p>
        <blockquote>"La economía circular no es una moda ecologista: es la lógica del que no tiene recursos para desperdiciar. Argentina es el lugar perfecto para innovar en esto, porque llevamos décadas practicando el arte de hacer mucho con poco."</blockquote>
      `,
      orderIndex: 8, type: 'text' as const, duration: 16, isRequired: true,
    },
    {
      courseId,
      title: 'Tecnología Accesible: Digitalizar Sin Complicar',
      description: 'Herramientas digitales gratuitas o baratas para potenciar tu emprendimiento.',
      content: `
        <h2>Tu Emprendimiento en el Siglo XXI (Sin Gastar una Fortuna)</h2>
        <p>No necesitás un equipo de IT ni una inversión millonaria para digitalizar tu emprendimiento. El 90% de las herramientas que necesitás son <strong>gratuitas o muy baratas</strong>. Lo que necesitás es saber cuáles usar y cómo combinarlas.</p>
        <h3>La Caja de Herramientas Digitales del Emprendedor</h3>
        <h4>Ventas y Atención al Cliente</h4>
        <ul>
          <li><strong>WhatsApp Business (gratis):</strong> Catálogo de productos, respuestas rápidas, etiquetas para organizar clientes, estadísticas de mensajes.</li>
          <li><strong>MercadoShops / Tiendanube:</strong> Tu tienda online en minutos. Integración con MercadoPago para cobrar con tarjeta, transferencia o efectivo.</li>
          <li><strong>Google My Business (gratis):</strong> Para que te encuentren en Google Maps. Esencial si tenés local físico.</li>
        </ul>
        <h4>Administración y Finanzas</h4>
        <ul>
          <li><strong>Facturador AFIP (gratis):</strong> Para emitir facturas electrónicas. Es esencial.</li>
          <li><strong>Google Sheets (gratis):</strong> Para tu planilla de ingresos y gastos. Compartible con tu contador.</li>
          <li><strong>Xubio / Colppy:</strong> Sistemas de gestión contable pensados para PyMEs argentinas. Automatizan la contabilidad.</li>
        </ul>
        <h4>Marketing y Contenido</h4>
        <ul>
          <li><strong>Canva (gratis/premium):</strong> Diseño gráfico profesional sin saber diseñar. Logos, flyers, posts para redes, presentaciones.</li>
          <li><strong>CapCut (gratis):</strong> Editor de video profesional para Reels e historias. Tan potente como editores pagos.</li>
          <li><strong>ChatGPT / Claude:</strong> Para generar textos, ideas de contenido, respuestas a clientes, traducir al inglés si exportás.</li>
        </ul>
        <h4>Organización del Equipo</h4>
        <ul>
          <li><strong>Trello / Notion (gratis):</strong> Organizá tareas, proyectos y procesos. Visual e intuitivo.</li>
          <li><strong>Google Drive (15 GB gratis):</strong> Almacenamiento y documentos compartidos. Tu oficina virtual.</li>
          <li><strong>Google Calendar (gratis):</strong> Agendá reuniones, recordatorios, plazos de AFIP, vencimientos.</li>
        </ul>
        <h3>La Regla de las 3 Herramientas</h3>
        <p>No intentes usar todo. Elegí <strong>3 herramientas máximo</strong> para empezar:</p>
        <ol>
          <li>Una para vender (WhatsApp Business o Tiendanube)</li>
          <li>Una para administrar (Google Sheets o Xubio)</li>
          <li>Una para comunicar (Instagram + Canva)</li>
        </ol>
        <p>Dominá esas tres antes de agregar más. Cada herramienta nueva que no dominás es una distracción, no una ventaja.</p>
        <h3>Inteligencia Artificial para Emprendedores</h3>
        <p>La IA no va a reemplazar emprendedores — va a empoderar a los que sepan usarla. Un emprendedor con IA puede hacer en 1 hora lo que antes tomaba 1 día: escribir textos de marketing, analizar datos de ventas, diseñar imágenes, automatizar respuestas al cliente. La clave es <strong>usarla como asistente, no como piloto automático</strong>.</p>
        <blockquote>"La brecha digital no es entre los que tienen tecnología y los que no. Es entre los que la usan con intención y los que se pierden probando herramientas sin rumbo. Tres herramientas bien usadas le ganan a veinte mal implementadas."</blockquote>
      `,
      orderIndex: 9, type: 'text' as const, duration: 16, isRequired: true,
    },
    {
      courseId,
      title: 'Redes y Ecosistema: Emprender Nunca Es Solitario',
      description: 'El ecosistema emprendedor argentino y cómo conectarte para crecer.',
      content: `
        <h2>Nadie Escala Solo</h2>
        <p>El mito del emprendedor solitario que "se hizo solo" es exactamente eso: un mito. Detrás de cada emprendimiento que creció hay una <strong>red de relaciones</strong>: mentores, socios, clientes que dieron feedback, proveedores que dieron crédito, pares que compartieron conocimiento.</p>
        <p>Argentina tiene un ecosistema emprendedor sorprendentemente rico. El problema es que muchos emprendedores no saben que existe o no saben cómo acceder.</p>
        <h3>El Mapa del Ecosistema</h3>
        <h4>Aceleradoras e Incubadoras</h4>
        <ul>
          <li><strong>INCUBA (UBA):</strong> Incubadora de la Universidad de Buenos Aires. Acceso gratuito, mentoreo y espacio de trabajo.</li>
          <li><strong>Wayra (Telefónica):</strong> Aceleradora corporativa enfocada en startups tecnológicas.</li>
          <li><strong>NXTP Labs:</strong> Inversión y aceleración para emprendimientos de alto impacto en Latinoamérica.</li>
          <li><strong>Incubadoras universitarias:</strong> Casi toda universidad tiene una. Son gratuitas y poco conocidas. Investigá la de tu ciudad.</li>
        </ul>
        <h4>Financiamiento</h4>
        <ul>
          <li><strong>Fondo Semilla (Min. de Producción):</strong> Capital no reembolsable para emprendimientos en etapa temprana.</li>
          <li><strong>Ley de Economía del Conocimiento:</strong> Beneficios impositivos para empresas de software, biotecnología, industrias creativas.</li>
          <li><strong>Clubes de inversores ángeles:</strong> IAE Angels, Buenos Aires Angels Club. Inversores que ponen capital y experiencia.</li>
          <li><strong>Crowdfunding:</strong> Plataformas como Ideame o Panal de Ideas para financiar proyectos con aportes de la comunidad.</li>
        </ul>
        <h4>Comunidades</h4>
        <ul>
          <li><strong>Meetups sectoriales:</strong> Product School, StartupBA, agro-tech, fintech. Cada sector tiene su comunidad.</li>
          <li><strong>Cámaras y asociaciones:</strong> CACE (comercio electrónico), CESSI (software), tu cámara local de comercio.</li>
          <li><strong>Redes de emprendedores B:</strong> Sistema B Argentina conecta emprendedores con propósito.</li>
        </ul>
        <h3>El Arte del Networking con Propósito</h3>
        <p>Networking no es juntar tarjetas. Es construir relaciones basadas en <strong>dar antes de pedir</strong>:</p>
        <ol>
          <li><strong>Antes del evento:</strong> Investigá quién va. Identificá 2-3 personas con las que querés hablar.</li>
          <li><strong>Durante:</strong> Hacé preguntas genuinas. "¿Qué es lo más difícil de lo que hacés?" genera mejores conexiones que "¿a qué te dedicás?"</li>
          <li><strong>Después:</strong> Hacé seguimiento en 48 horas. Ofrecé algo de valor: un contacto, un artículo, una idea.</li>
        </ol>
        <h3>Mentores: El Atajo Legal</h3>
        <p>Un buen mentor no te dice qué hacer — te ayuda a <strong>ver lo que no ves</strong>. Te ahorra los errores que ya cometió. Te da perspectiva cuando estás demasiado metido en el día a día.</p>
        <blockquote>"Tu red de contactos no es un recurso: es tu sistema inmunológico empresarial. Cuando venga la crisis (y en Argentina siempre viene), lo que te va a salvar no es tu plan de negocios sino la gente que te rodea."</blockquote>
      `,
      orderIndex: 10, type: 'text' as const, duration: 16, isRequired: true,
    },
  ];

  for (const lesson of lessons) { await db.insert(courseLessons).values(lesson); }
  console.log('Created', lessons.length, 'lessons for course 14');

  const eq14 = await db.select().from(courseQuizzes).where(eq(courseQuizzes.courseId, courseId)).limit(1);
  if (eq14.length > 0) { await db.delete(quizQuestions).where(eq(quizQuestions.quizId, eq14[0].id)); await db.delete(courseQuizzes).where(eq(courseQuizzes.courseId, courseId)); }
  const [quiz14] = await db.insert(courseQuizzes).values({ courseId, title: 'Quiz: Emprendimiento con Propósito', description: 'Evaluá tu comprensión del emprendimiento con impacto en Argentina.', passingScore: 70, timeLimit: 15, allowRetakes: true, maxAttempts: 3 }).returning();
  const q14 = [
    { quizId: quiz14.id, question: '¿Qué distingue a un emprendimiento con propósito de uno tradicional?', type: 'multiple_choice' as const, options: JSON.stringify(['Solo busca ganancias', 'Combina valor económico, social y sistémico', 'Es una ONG', 'No busca ganancias']), correctAnswer: JSON.stringify(1), explanation: 'Un emprendimiento con propósito genera valor económico, social y sistémico simultáneamente.', points: 2, orderIndex: 1 },
    { quizId: quiz14.id, question: 'El monotributo requiere presentar una declaración jurada mensual compleja.', type: 'true_false' as const, correctAnswer: JSON.stringify(false), explanation: 'El monotributo es la forma más simple de formalización: un solo pago mensual cubre impuestos, obra social y jubilación.', points: 1, orderIndex: 2 },
    { quizId: quiz14.id, question: '¿Qué es el "costeo por reposición"?', type: 'multiple_choice' as const, options: JSON.stringify(['Calcular ganancias sobre el precio de compra original', 'Calcular ganancias sobre el costo de reponer el stock', 'Reponer stock automáticamente', 'Un tipo de impuesto']), correctAnswer: JSON.stringify(1), explanation: 'Con inflación, debés calcular tu margen sobre lo que costará REPONER, no sobre lo que pagaste originalmente.', points: 2, orderIndex: 3 },
    { quizId: quiz14.id, question: 'En Argentina, WhatsApp Business es el canal de ventas más poderoso para emprendedores.', type: 'true_false' as const, correctAnswer: JSON.stringify(true), explanation: 'WhatsApp es la plataforma de comunicación dominante en Argentina y su versión Business ofrece herramientas gratuitas de venta.', points: 1, orderIndex: 4 },
    { quizId: quiz14.id, question: '¿Qué es una SAS (Sociedad por Acciones Simplificada)?', type: 'multiple_choice' as const, options: JSON.stringify(['Una sociedad anónima grande', 'Una forma societaria ágil creada en 2017 que se constituye digitalmente en 24h', 'Una cooperativa de trabajo', 'Un tipo de monotributo avanzado']), correctAnswer: JSON.stringify(1), explanation: 'La SAS fue diseñada para emprendedores: se constituye digitalmente, en 24 horas, con capital mínimo y puede tener un solo socio.', points: 2, orderIndex: 5 },
    { quizId: quiz14.id, question: 'Las Empresas B buscan ser "las mejores PARA el mundo" y no solo "las mejores DEL mundo".', type: 'true_false' as const, correctAnswer: JSON.stringify(true), explanation: 'Las Empresas B certifican que integran propósito social y ambiental en su modelo de negocios, no solo ganancias.', points: 1, orderIndex: 6 },
    { quizId: quiz14.id, question: '¿Cuál es la "regla de las 3 herramientas" para la digitalización?', type: 'multiple_choice' as const, options: JSON.stringify(['Usar 3 redes sociales diferentes', 'Dominar 3 herramientas (vender, administrar, comunicar) antes de agregar más', 'Tener 3 empleados de IT', 'Cambiar de herramienta cada 3 meses']), correctAnswer: JSON.stringify(1), explanation: 'Mejor dominar 3 herramientas bien elegidas (una para vender, una para administrar, una para comunicar) que tener 20 mal implementadas.', points: 2, orderIndex: 7 },
    { quizId: quiz14.id, question: 'En Argentina, un emprendedor puede operar exitosamente de forma completamente solitaria sin red de contactos.', type: 'true_false' as const, correctAnswer: JSON.stringify(false), explanation: 'La red de contactos es el "sistema inmunológico empresarial": mentores, socios, pares y comunidad son esenciales para sobrevivir las crisis.', points: 1, orderIndex: 8 },
  ];
  for (const q of q14) { await db.insert(quizQuestions).values(q); }
  console.log('Created quiz for course 14');
}

async function seedCourse15(authorId: number) {
  console.log('--- Course 15: Economía Familiar y Comunitaria ---');
  let course = await db.select().from(courses).where(eq(courses.slug, 'economia-familiar-comunitaria')).limit(1);
  if (course.length === 0) {
    const [newCourse] = await db.insert(courses).values({
      title: 'Economía Familiar y Comunitaria',
      slug: 'economia-familiar-comunitaria',
      description: 'Fortalece la resiliencia económica desde la familia y el barrio. Círculos de ahorro, economía cooperativa, recursos compartidos y la economía de la confianza a nivel vecinal.',
      excerpt: 'Construye resiliencia económica desde tu familia y tu barrio.',
      category: 'economia',
      level: 'intermediate',
      duration: 200,
      thumbnailUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800',
      orderIndex: 15,
      isPublished: true,
      isFeatured: false,
      requiresAuth: false,
      authorId,
    }).returning();
    course = [newCourse];
    console.log('Created course 15:', course[0].title);
  } else {
    console.log('Found existing course 15:', course[0].title);
  }

  const courseId = course[0].id;
  await db.delete(courseLessons).where(eq(courseLessons.courseId, courseId));

  const lessons = [
    {
      courseId,
      title: 'La Economía Invisible: Lo Que Pasa Dentro de Tu Casa',
      description: 'Descubrir que tu hogar es una economía completa con producción, distribución y decisiones estratégicas.',
      content: `
        <h2>Tu Hogar Es una Economía</h2>
        <p>Cuando pensamos en "economía", pensamos en Wall Street, el Banco Central, las exportaciones de soja. Pero la <strong>primera economía</strong> que experimentamos — y la que más nos afecta día a día — es la economía de nuestro hogar.</p>
        <p>Dentro de tu casa hay producción (cocinar, limpiar, cuidar, reparar), distribución (quién recibe qué), decisiones de inversión (¿arreglo el techo o compro zapatillas?), ahorro (o falta de él), y hasta política fiscal (quién decide en qué se gasta). La diferencia es que <strong>nadie te enseñó a verlo así</strong>.</p>
        <h3>La Economía del Cuidado: El PBI Invisible</h3>
        <p>Si se pagara un salario por todo el trabajo doméstico y de cuidado que se realiza en Argentina, equivaldría al <strong>16% del PBI</strong> — más que la industria manufacturera, más que el agro. Es la actividad económica más grande del país, y es casi enteramente invisible.</p>
        <ul>
          <li><strong>¿Quién lo hace?</strong> El 76% del trabajo doméstico no remunerado lo hacen mujeres. Esto no es dato de género: es dato económico. Es una transferencia masiva de riqueza que no se contabiliza.</li>
          <li><strong>¿Cuánto vale?</strong> Si una madre soltera contratara todos los servicios que provee gratis (cocinera, niñera, limpieza, enfermera, tutora), necesitaría 3-4 salarios mínimos por mes.</li>
          <li><strong>¿Por qué importa?</strong> Porque cuando se diseñan políticas económicas sin considerar esta economía invisible, se diseñan políticas que perjudican a la mitad de la población.</li>
        </ul>
        <div style="background:#f0fdf4;border:2px solid #16a34a;border-radius:12px;padding:24px;margin:28px 0;">
          <h4 style="color:#16a34a;margin-top:0;">Pausa para Reflexionar</h4>
          <p>Antes de seguir, tomá un momento para pensar en la economía invisible de tu hogar. Agarrá un papel o abrí una nota en tu celular y respondé estas preguntas:</p>
          <ol>
            <li><strong>¿Quién realiza la mayor parte del trabajo doméstico en tu casa?</strong> Pensá no solo en cocinar y limpiar, sino en las tareas invisibles: organizar turnos médicos, recordar qué falta en la heladera, coordinar los horarios de todos, planificar las comidas de la semana.</li>
            <li><strong>¿Cuántas horas por día se dedican a ese trabajo?</strong> Intentá estimar un número real. Multiplicalo por 30. Ahora buscá cuánto cobra una empleada doméstica con retiro por hora en tu zona y multiplicá. El resultado te va a sorprender.</li>
            <li><strong>¿Alguna vez tu familia se sentó a hablar explícitamente sobre cómo se reparten las tareas económicas del hogar?</strong> Si la respuesta es no, ya tenés tu primera tarea: abrir esa conversación esta semana.</li>
          </ol>
          <p>No hay respuestas "correctas". El ejercicio busca que veas con ojos nuevos algo que hacías en automático. La mayoría de la gente nunca se detiene a cuantificar la economía invisible de su hogar — y por eso nunca la valora como merece.</p>
        </div>
        <h3>El Presupuesto Familiar: Tu Primera Herramienta de Poder</h3>
        <p>El 65% de las familias argentinas no tiene un presupuesto escrito. Viven "al día", decidiendo con el instinto. En épocas de estabilidad, eso funciona. Con inflación de tres dígitos, es una receta para el desastre.</p>
        <p>Un presupuesto familiar no es una planilla aburrida: es un <strong>mapa de tus decisiones</strong>. Te muestra a dónde va tu plata y te permite decidir conscientemente si eso es lo que querés.</p>
        <h3>Las Tres Preguntas del Presupuesto Consciente</h3>
        <p>Cada vez que sacás la billetera o pasás la tarjeta, hacete estas tres preguntas:</p>
        <ul>
          <li><strong>¿Es necesidad o deseo?</strong> Las necesidades son innegociables (techo, comida, salud, educación). Los deseos son legítimos pero postergables. La clave es saber la diferencia.</li>
          <li><strong>¿Es la mejor opción disponible?</strong> ¿Podrías conseguir lo mismo más barato? ¿En otro lugar? ¿En otra presentación? La diferencia entre comparar y no comparar puede ser del 30-40% en un mes.</li>
          <li><strong>¿Mi yo del futuro me agradecería esta compra?</strong> Imaginate dentro de 6 meses mirando el resumen. ¿Esa compra sumó algo real a tu vida o fue un impulso que se evaporó?</li>
        </ul>
        <h3>Ejercicio: El Registro de 30 Días</h3>
        <p>Durante 30 días, anotá CADA peso que gastás. Todo. El café de la esquina, la boleta de luz, la cuota del cole, el delivery del viernes. No juzgues — solo registrá. Al final del mes, vas a tener la radiografía más reveladora de tu vida económica. La mayoría de la gente descubre que gasta entre un 15% y un 30% en cosas que no le aportan valor real.</p>
        <h3>El Caso de la Familia Méndez de Quilmes</h3>
        <p>Marcela y Jorge Méndez viven en Quilmes con tres hijos. Jorge es empleado de comercio, Marcela trabaja de costurera desde la casa. Cuando hicieron el registro de 30 días por primera vez, descubrieron que gastaban <strong>$47.000 por mes en deliverys y comidas afuera</strong> — casi el 18% de sus ingresos. No era porque fueran irresponsables: era porque después de jornadas agotadoras, cocinar parecía imposible. La solución no fue "dejar de pedir delivery" (insostenible). Fue dedicar una tarde del domingo a preparar viandas para la semana — meal prepping criollo. Resultado: bajaron ese gasto a $12.000 y la comida mejoró en calidad. Esos $35.000 de diferencia, al cabo de un año, se convirtieron en el colchón de emergencia que no tenían.</p>
        <blockquote>"No necesitás ganar más para vivir mejor. Primero necesitás saber a dónde va lo que ganás. El autoconocimiento económico es el primer paso de la libertad financiera."</blockquote>
      `,
      orderIndex: 1, type: 'text' as const, duration: 16, isRequired: true,
    },
    {
      courseId,
      title: 'Ahorrar en Argentina: El Arte de lo "Imposible"',
      description: 'Estrategias reales de ahorro adaptadas a la inflación y la volatilidad argentina.',
      content: `
        <h2>"Ahorrar en Pesos Es Tirar la Plata" — ¿Seguro?</h2>
        <p>La frase más repetida de la Argentina es "si ahorrás en pesos, perdés". Y tiene algo de verdad — pero la conclusión que saca la mayoría ("entonces no ahorro") es un error fatal. <strong>No ahorrar es mucho más caro que ahorrar imperfectamente.</strong></p>
        <h3>Las 4 Capas del Ahorro</h3>
        <ol>
          <li><strong>Capa 1: El colchón de emergencia (en pesos líquidos)</strong>
            <p>Sí, en pesos. ¿Por qué? Porque las emergencias se pagan en pesos: la guardia, el mecánico, la factura de luz. Necesitás tener el equivalente a 1-2 meses de gastos en una cuenta de ahorros o un FCI money market (que al menos paga algo de interés). No es "ahorro": es <strong>seguro contra desastres</strong>.</p>
          </li>
          <li><strong>Capa 2: Protección contra inflación (UVA / CER)</strong>
            <p>Los plazos fijo UVA y los bonos CER te protegen contra la inflación. No ganás — pero no perdés. Es mejor que guardar pesos bajo el colchón. Disponible en cualquier banco con homebanking.</p>
          </li>
          <li><strong>Capa 3: Ahorro en moneda dura (dólares, oro digital)</strong>
            <p>Para los excedentes que no necesitás en el corto plazo. Dólar MEP (legal, a través de cualquier cuenta comitente), criptomonedas estables (USDT, DAI), o oro tokenizado. No necesitás fortunas: podés empezar con el equivalente a $10.000 pesos.</p>
          </li>
          <li><strong>Capa 4: Inversión productiva</strong>
            <p>El mejor "ahorro" en Argentina es invertir en algo que produzca: tu emprendimiento, herramientas de trabajo, capacitación. Un curso que te sube el sueldo un 20% es la mejor inversión que podés hacer.</p>
          </li>
        </ol>
        <h3>Errores Comunes del Ahorrista Argentino</h3>
        <ul>
          <li><strong>"Todo al dólar":</strong> Comprar dólares a cualquier precio, incluso cuando está caro, por miedo. A veces el dólar baja. Comprá gradualmente, no todo de golpe.</li>
          <li><strong>"La plata la guardo yo":</strong> Tener los ahorros en efectivo en tu casa es el método menos eficiente (y más riesgoso). Usá herramientas financieras.</li>
          <li><strong>"Para ahorrar hay que ganar mucho":</strong> Falso. Lo importante es la diferencia entre lo que ganás y lo que gastás, no el monto absoluto. Alguien que gana $300.000 y gasta $290.000 ahorra menos que alguien que gana $200.000 y gasta $170.000.</li>
        </ul>
        <h3>La Regla del 10% Automático</h3>
        <p>Antes de pagar CUALQUIER gasto, separá el 10% de tu ingreso. Ponelo en una cuenta aparte. Tratalo como si ese dinero no existiera. Si no podés el 10%, empezá con el 5%. Si no podés el 5%, empezá con el 2%. Lo importante es el <strong>hábito</strong>, no el monto.</p>
        <blockquote>"El ahorro no es lo que te sobra a fin de mes. Es lo que apartás ANTES de gastar. Si esperás a que sobre, nunca va a sobrar. Pagáte primero a vos."</blockquote>
      `,
      orderIndex: 2, type: 'text' as const, duration: 16, isRequired: true,
    },
    {
      courseId,
      title: 'Deuda Inteligente vs. Deuda Tóxica',
      description: 'Entender la diferencia entre deuda que te construye y deuda que te destruye.',
      content: `
        <h2>No Toda Deuda Es Mala (y No Toda Es Buena)</h2>
        <p>Argentina tiene una relación traumática con la deuda. A nivel país, la deuda externa ha sido fuente de crisis recurrentes. A nivel familiar, las tarjetas de crédito y los préstamos personales han arruinado a millones. Pero la deuda, bien usada, es una <strong>herramienta de crecimiento</strong>.</p>
        <h3>Deuda Inteligente vs. Deuda Tóxica</h3>
        <table style="width:100%; border-collapse: collapse;">
          <tr style="background:#f0f0f0;"><th style="padding:8px; border:1px solid #ddd;">Deuda Inteligente</th><th style="padding:8px; border:1px solid #ddd;">Deuda Tóxica</th></tr>
          <tr><td style="padding:8px; border:1px solid #ddd;">Comprar una herramienta de trabajo que te genera ingresos</td><td style="padding:8px; border:1px solid #ddd;">Comprar un celular último modelo en 24 cuotas</td></tr>
          <tr><td style="padding:8px; border:1px solid #ddd;">Crédito hipotecario UVA para tu vivienda</td><td style="padding:8px; border:1px solid #ddd;">Préstamo personal para irse de vacaciones</td></tr>
          <tr><td style="padding:8px; border:1px solid #ddd;">Invertir en tu capacitación</td><td style="padding:8px; border:1px solid #ddd;">Pagar el mínimo de la tarjeta (interés del 150%+ anual)</td></tr>
          <tr><td style="padding:8px; border:1px solid #ddd;">Capital de trabajo para tu emprendimiento</td><td style="padding:8px; border:1px solid #ddd;">"Créditos fáciles" de apps con tasas usurarias</td></tr>
        </table>
        <h3>La Regla de Oro: ¿La Deuda Genera Ingresos?</h3>
        <p>Antes de endeudarte, hacé una sola pregunta: <strong>¿Este dinero prestado me va a generar más dinero del que cuesta?</strong> Si la respuesta es sí (comprar stock para tu negocio, una herramienta, capacitación), la deuda es una inversión. Si la respuesta es no (un TV, ropa, salidas), la deuda es consumo — y el consumo con deuda es la forma más cara de comprar.</p>
        <h3>La Trampa de la Tarjeta de Crédito</h3>
        <p>La tarjeta de crédito es la herramienta financiera más peligrosa en manos de quien no la entiende:</p>
        <ul>
          <li><strong>Pagar el total:</strong> Si pagás el total cada mes, la tarjeta es GRATIS. Es un préstamo a 30 días sin interés. Usala así.</li>
          <li><strong>Pagar el mínimo:</strong> Si pagás el mínimo, el resto acumula interés compuesto a tasas que superan el 150% anual. Una compra de $10.000 puede costarte $25.000 en un año.</li>
          <li><strong>Cuotas "sin interés":</strong> Aprovechalas siempre que puedas. Con inflación, las cuotas fijas valen menos cada mes. Pero solo si necesitabas esa compra de todas formas.</li>
        </ul>
        <h3>Salir de la Trampa de la Deuda</h3>
        <ol>
          <li><strong>Listá todas tus deudas:</strong> Monto, tasa de interés, cuota mensual. Todo en un solo lugar.</li>
          <li><strong>Priorizá por tasa:</strong> Pagá primero la deuda con la tasa más alta (generalmente tarjeta de crédito).</li>
          <li><strong>Negociá:</strong> Llamá a tu banco. Pedí refinanciación. Los bancos prefieren cobrar menos a no cobrar nada.</li>
          <li><strong>Cortá la fuente:</strong> Si no podés controlar la tarjeta, congelala (literalmente). Usá solo efectivo o débito hasta que te estabilices.</li>
        </ol>
        <blockquote>"La deuda es como el fuego: bien controlada te calienta y te cocina; descontrolada te quema la casa. En Argentina, la tentación de endeudarte para mantener tu nivel de vida es constante. Resistila cuando no produzca retorno."</blockquote>
      `,
      orderIndex: 3, type: 'text' as const, duration: 16, isRequired: true,
    },
    {
      courseId,
      title: 'La Economía del Barrio: Tu Comunidad como Red Económica',
      description: 'Redescubrir el barrio como espacio de intercambio económico y resiliencia colectiva.',
      content: `
        <h2>El Barrio: La Economía que el Economista No Ve</h2>
        <p>Antes del supermercado existía el almacén. Antes de Rappi existía "el pibe que te llevaba el pedido". Antes de MercadoLibre existía la feria del barrio. La economía barrial nunca desapareció — solo se hizo invisible. Y en cada crisis argentina, <strong>vuelve a ser la red de supervivencia más importante</strong>.</p>
        <h3>Capital Social: La Moneda Invisible</h3>
        <p>En tu barrio circula una moneda que no imprime el Banco Central: la <strong>confianza</strong>. "Te fío hasta el viernes". "Te cuido al nene mientras vas al médico". "Te presto la escalera". Cada uno de estos actos es una transacción económica real que no aparece en ningún PBI pero sostiene la vida de millones de argentinos.</p>
        <ul>
          <li><strong>Redes de reciprocidad:</strong> "Yo te hago el pan, vos me arreglás el caño." No es trueque (no es simultáneo ni equivalente): es una red de favores basada en la confianza de que eventualmente "se devuelve".</li>
          <li><strong>Compras colectivas:</strong> 10 familias que se juntan para comprar directo al mayorista. Cada familia ahorra 20-30%. Requiere organización, pero el beneficio es enorme.</li>
          <li><strong>Compartir recursos:</strong> ¿Para qué tener 10 cortadoras de pasto en una cuadra si con 2 alcanza? Herramientas, vehículos, espacios: compartir es la forma más eficiente de usar recursos escasos.</li>
        </ul>
        <h3>Ferias y Mercados Populares</h3>
        <p>Las ferias barriales son mucho más que un lugar para comprar verdura barata:</p>
        <ul>
          <li><strong>Circuito corto:</strong> Del productor al consumidor, sin intermediarios que se quedan con el 60% del precio.</li>
          <li><strong>Empleo local:</strong> Cada puesto de feria es un microemprendimiento que sostiene una familia.</li>
          <li><strong>Tejido social:</strong> La feria es donde te encontrás con el vecino, charlás, te enterás de las novedades. Es plaza pública y mercado al mismo tiempo.</li>
          <li><strong>Seguridad alimentaria:</strong> Acceso a alimentos frescos a precios accesibles, especialmente en barrios donde no llegan los supermercados.</li>
        </ul>
        <div style="background:#f0fdf4;border:2px solid #16a34a;border-radius:12px;padding:24px;margin:28px 0;">
          <h4 style="color:#16a34a;margin-top:0;">Pausa para Reflexionar</h4>
          <p>Hacé un mapeo rápido de tu red económica barrial. Dibujá un círculo en el centro de una hoja con tu nombre y respondé:</p>
          <ol>
            <li><strong>¿A cuántos vecinos les pedirías un favor sin vergüenza?</strong> Desde prestarte una herramienta hasta cuidarte un hijo una hora. Anotá sus nombres alrededor de tu círculo y uní con una línea. Esa es tu red de confianza económica real.</li>
            <li><strong>¿Qué servicios o habilidades tenés vos que podrían servirle a un vecino?</strong> Pensá más allá de lo obvio: sabés cocinar algo especial, podés enseñar inglés, tenés un auto y podrías compartir un viaje, sabés arreglar algo. Escribí al menos tres cosas.</li>
            <li><strong>¿Cuántas veces en el último mes compraste algo que un vecino produce o vende?</strong> Si la respuesta es cero, no te culpes — pero preguntate por qué. Probablemente no es que no haya nada, sino que no lo sabías.</li>
            <li><strong>¿Hay alguna compra que hacés regularmente que podrías hacer en grupo?</strong> Frutas, verduras, artículos de limpieza, pañales. Identificá al menos una posibilidad concreta.</li>
          </ol>
          <p>Este mapa es el punto de partida de tu economía barrial. Guardalo. Vas a volver a él al final del curso cuando armes tu plan de resiliencia completo.</p>
        </div>
        <h3>Ejemplo Real: La Red del Barrio Güemes, Córdoba</h3>
        <p>En el barrio Güemes de Córdoba, un grupo de 25 familias armó un sistema que combina varias de estas estrategias. Los sábados organizan una "ronda de intercambios": alguien trae verduras de su quinta, otro ofrece cortes de pelo, otra enseña apoyo escolar. No usan dinero — usan una planilla compartida de Google donde anotan los intercambios. "No es que no tengamos pesos", explica Mirta, la coordinadora. "Es que para muchas cosas los pesos son innecesarios. Mi vecina me ayuda con las cuentas de la luz y yo le cuido a los chicos. ¿Para qué meter plata en el medio?" En 2023, con la inflación más alta en décadas, las familias del grupo reportaron que lograron cubrir entre un 15% y un 20% de sus necesidades mensuales <strong>sin gastar un peso</strong>, solo con intercambios vecinales.</p>
        <h3>Clubes de Trueque 2.0</h3>
        <p>Los clubes de trueque del 2001 fracasaron por la falsificación de créditos y la falta de regulación. Pero el concepto era brillante. Hoy, con tecnología, se pueden crear <strong>redes de intercambio digitales</strong> mucho más robustas:</p>
        <ul>
          <li>Apps de intercambio de servicios entre vecinos</li>
          <li>Bancos de tiempo donde una hora de tu trabajo vale una hora del mío</li>
          <li>Monedas complementarias digitales respaldadas por la comunidad</li>
        </ul>
        <h3>Cómo Empezar: El Primer Paso Es el Más Simple</h3>
        <p>No necesitás un sistema formal ni una app para arrancar. El primer paso es <strong>hablar con tus vecinos</strong>. Golpeá la puerta, escribí por WhatsApp, aprovechá el próximo encuentro en la vereda. Preguntá: "¿Necesitás algo que yo pueda ofrecerte? ¿Tenés algo que me pueda servir?" Esa simple pregunta, repetida suficientes veces, crea una red. Y esa red, cuando llega la próxima crisis — porque siempre llega —, es la diferencia entre hundirse solo o flotar juntos.</p>
        <blockquote>"La economía más resiliente del mundo no está en Silicon Valley ni en Wall Street. Está en el barrio argentino que sobrevivió a 5 crisis sin que nadie le diera un préstamo del FMI. Esa inteligencia colectiva es tu mayor activo económico."</blockquote>
      `,
      orderIndex: 4, type: 'text' as const, duration: 16, isRequired: true,
    },
    {
      courseId,
      title: 'Círculos de Ahorro y Crédito: Finanzas entre Vecinos',
      description: 'El poder ancestral de las tandas, roscas y círculos de ahorro comunitario.',
      content: `
        <h2>El Banco que No Necesita Banco</h2>
        <p>Mucho antes de que existieran los bancos, las comunidades humanas se organizaban para ahorrar y prestarse dinero entre sí. En América Latina les decimos <strong>"tandas"</strong>, en África "tontines", en Asia "chit funds". En Argentina, los conocemos como "vaquitas" o "cadenas". El principio es simple y poderoso.</p>
        <h3>¿Cómo Funciona un Círculo de Ahorro?</h3>
        <ol>
          <li>Un grupo de 10-20 personas de confianza se compromete a aportar un monto fijo cada mes (por ejemplo, $50.000).</li>
          <li>Cada mes, el pozo total ($500.000 - $1.000.000) se le entrega a UN miembro.</li>
          <li>El orden se define por sorteo, acuerdo o subasta.</li>
          <li>Al final del ciclo (10-20 meses), todos recibieron una vez y todos aportaron la misma cantidad.</li>
        </ol>
        <p><strong>El resultado:</strong> Cada miembro accedió a una suma grande que no hubiera podido juntar solo. Sin banco, sin interés, sin requisitos, sin burocracia.</p>
        <h3>¿Por Qué Funcionan?</h3>
        <ul>
          <li><strong>Presión social positiva:</strong> No pagás porque te obligan — pagás porque no querés quedar mal con gente que conocés y respetás.</li>
          <li><strong>Ahorro forzado:</strong> Muchas personas no pueden ahorrar solas (la plata "se va"). El círculo las obliga a separar el dinero.</li>
          <li><strong>Acceso a capital:</strong> Para gente que no califica para un préstamo bancario, el círculo es la ÚNICA forma de acceder a una suma importante.</li>
          <li><strong>Costo cero:</strong> No hay intereses, ni comisiones, ni seguros, ni mantenimiento de cuenta.</li>
        </ul>
        <h3>Versiones Más Sofisticadas</h3>
        <ul>
          <li><strong>ROSCA (Rotating Savings and Credit Association):</strong> La versión formal del círculo de ahorro, estudiada y promovida por organismos internacionales.</li>
          <li><strong>Grupos de ahorro tipo VSLA:</strong> Village Savings and Loan Associations. Incluyen un fondo de préstamos de emergencia además del ahorro rotativo. Se han implementado exitosamente en comunidades rurales de todo el mundo.</li>
          <li><strong>Círculos digitales:</strong> Apps que formalizan el sistema, llevando registro, enviando recordatorios y resolviendo disputas.</li>
        </ul>
        <h3>Cómo Armar Tu Propio Círculo</h3>
        <ol>
          <li><strong>Seleccioná con cuidado:</strong> Solo gente de absoluta confianza. Es mejor un grupo de 8 personas confiables que uno de 20 con 2 dudosos.</li>
          <li><strong>Escribí las reglas:</strong> Monto, fecha de aporte, orden de recepción, qué pasa si alguien no paga.</li>
          <li><strong>Elegí un administrador:</strong> Alguien respetado por todos que gestione las cobranzas y los pagos.</li>
          <li><strong>Empezá chico:</strong> Primer ciclo con montos bajos. Si funciona, aumentás en el siguiente.</li>
        </ol>
        <blockquote>"Cada círculo de ahorro es una pequeña revolución financiera: demuestra que la gente común puede organizarse para resolver sus problemas sin esperar que ninguna institución les dé permiso. Eso es empoderamiento real."</blockquote>
      `,
      orderIndex: 5, type: 'text' as const, duration: 16, isRequired: true,
    },
    {
      courseId,
      title: 'Cooperativismo: La Empresa Democrática',
      description: 'El modelo cooperativo como alternativa económica real en Argentina.',
      content: `
        <h2>¿Y Si la Empresa Fuera de Todos?</h2>
        <p>Argentina tiene más de <strong>25.000 cooperativas</strong> que emplean a más de 1 millón de personas. Generan el 10% del PBI. Sin embargo, para la mayoría, las cooperativas son invisibles o están asociadas solo a la provisión de servicios públicos (electricidad, agua, teléfono en pueblos del interior).</p>
        <p>El cooperativismo es mucho más que eso: es un <strong>modelo empresarial alternativo</strong> donde los trabajadores son los dueños, las decisiones se toman democráticamente, y las ganancias se distribuyen equitativamente.</p>
        <h3>Los 7 Principios Cooperativos</h3>
        <ol>
          <li><strong>Membresía abierta y voluntaria:</strong> Cualquiera puede entrar (y salir) sin discriminación.</li>
          <li><strong>Control democrático:</strong> Un socio = un voto. No importa cuánto capital tengas.</li>
          <li><strong>Participación económica:</strong> Los socios contribuyen equitativamente al capital y comparten los excedentes.</li>
          <li><strong>Autonomía e independencia:</strong> Las cooperativas son organizaciones autónomas controladas por sus miembros.</li>
          <li><strong>Educación y formación:</strong> Se comprometen a educar a sus miembros, directivos y comunidad.</li>
          <li><strong>Cooperación entre cooperativas:</strong> Trabajan juntas en redes locales, nacionales e internacionales.</li>
          <li><strong>Compromiso con la comunidad:</strong> Trabajan por el desarrollo sostenible de sus comunidades.</li>
        </ol>
        <h3>Tipos de Cooperativas en Argentina</h3>
        <ul>
          <li><strong>De trabajo:</strong> Los socios son los trabajadores. Ejemplo: una cooperativa de programadores, albañiles o diseñadores que comparten proyectos y ganancias.</li>
          <li><strong>De consumo:</strong> Los socios son los compradores. Ejemplo: supermercados cooperativos donde los clientes son dueños y compran a precio de costo.</li>
          <li><strong>De servicios públicos:</strong> Proveen electricidad, agua, gas, internet en pueblos y ciudades donde las empresas privadas no llegan.</li>
          <li><strong>Agropecuarias:</strong> Productores rurales que se juntan para comercializar, comprar insumos y acceder a tecnología.</li>
          <li><strong>De crédito:</strong> Cajas de crédito cooperativas que dan préstamos a tasas más bajas que los bancos comerciales.</li>
        </ul>
        <h3>Casos Inspiradores</h3>
        <ul>
          <li><strong>Mondragon (País Vasco):</strong> La cooperativa más grande del mundo. 80.000 trabajadores-socios, facturación de 12 mil millones de euros. Prueba de que el modelo escala.</li>
          <li><strong>Cooperativas de servicios del interior argentino:</strong> Pueblos donde la cooperativa provee electricidad, internet, TV, agua y hasta créditos. Son el Estado de bienestar donde el Estado no llega.</li>
          <li><strong>Empresas recuperadas:</strong> Fábricas cerradas por sus dueños que fueron tomadas y gestionadas exitosamente por sus trabajadores.</li>
        </ul>
        <blockquote>"La cooperativa es la demostración de que la democracia no es solo para votar presidentes cada 4 años. Es para decidir colectivamente cómo trabajamos, cómo producimos y cómo distribuimos la riqueza que creamos."</blockquote>
      `,
      orderIndex: 6, type: 'text' as const, duration: 16, isRequired: true,
    },
    {
      courseId,
      title: 'Consumo Consciente: Votar con el Bolsillo',
      description: 'Cómo cada decisión de compra es un voto por el mundo que querés.',
      content: `
        <h2>Cada Compra Es un Voto</h2>
        <p>Votás presidente cada 4 años. Pero votás con tu billetera <strong>todos los días</strong>. Cada vez que comprás algo, estás financiando un modelo de producción, una cadena de valor, una forma de tratar a los trabajadores, un impacto ambiental. El consumo consciente es darse cuenta de ese poder y usarlo intencionalmente.</p>
        <h3>La Cadena Invisible</h3>
        <p>Detrás de cada producto hay una cadena que casi nunca vemos:</p>
        <ul>
          <li><strong>Una remera de $5.000:</strong> ¿Quién cosió esa remera? ¿En qué condiciones? ¿Cuánto le pagaron? ¿De dónde viene la tela? ¿Qué químicos se usaron? ¿Adónde va cuando la tirás?</li>
          <li><strong>Un kilo de carne:</strong> ¿Cómo fue criado el animal? ¿Se usaron antibióticos? ¿El frigorífico cumple normas sanitarias? ¿Los trabajadores están en blanco?</li>
          <li><strong>Un café:</strong> ¿De qué país viene el grano? ¿El productor recibió un precio justo? ¿O una multinacional se quedó con el 95% del valor?</li>
        </ul>
        <h3>5 Estrategias de Consumo Consciente</h3>
        <ol>
          <li><strong>Comprá local:</strong> Cada peso gastado en el almacén del barrio circula en tu comunidad. Cada peso gastado en una cadena multinacional sale del barrio. La diferencia se multiplica.</li>
          <li><strong>Comprá directo:</strong> Ferias de productores, bolsones de verdura, compras colectivas. Menos intermediarios = mejor precio para vos y mejor pago para el productor.</li>
          <li><strong>Preguntá:</strong> "¿Esto de dónde viene?" "¿Quién lo hace?" "¿Tienen empleados en blanco?" Preguntar incomoda, pero cambia las prácticas.</li>
          <li><strong>Reducí:</strong> La compra más sustentable es la que no hacés. Antes de comprar: ¿realmente lo necesito? ¿Puedo pedirlo prestado? ¿Puedo comprarlo usado?</li>
          <li><strong>Elegí calidad sobre cantidad:</strong> Una prenda buena que dura 5 años es más barata que 5 prendas malas que duran 1 año cada una.</li>
        </ol>
        <div style="background:#f0fdf4;border:2px solid #16a34a;border-radius:12px;padding:24px;margin:28px 0;">
          <h4 style="color:#16a34a;margin-top:0;">Pausa para Reflexionar</h4>
          <p>Abrí tu billetera, tu app de homebanking o tu resumen de tarjeta del último mes. Elegí las últimas 10 compras que hiciste y hacé este ejercicio con cada una:</p>
          <ol>
            <li><strong>¿Sabés quién lo produjo?</strong> Si compraste en un almacén del barrio, probablemente sí. Si compraste en una cadena multinacional, probablemente no. No es para juzgar — es para observar.</li>
            <li><strong>¿Cuántos intermediarios creés que hubo entre el productor y vos?</strong> Un tomate en la feria tiene 0-1 intermediarios. Un tomate en el supermercado tiene 3-5. Cada intermediario agrega costo sin agregar valor al producto.</li>
            <li><strong>¿Podrías haber conseguido lo mismo de un productor local?</strong> Pensá en la feria de tu barrio, en el almacén de la esquina, en algún vecino que produzca algo. No se trata de eliminar el super de tu vida — se trata de redistribuir al menos una parte de tus compras.</li>
            <li><strong>De las 10 compras, ¿cuántas fueron necesidades reales y cuántas fueron impulsos?</strong> No te castigues si la mayoría fueron impulsos. Ese es el punto de partida normal. Lo importante es que ahora lo ves.</li>
          </ol>
          <p>Si te animás, durante una semana llevá una marca al lado de cada compra: "L" si fue local/directa, "C" si fue cadena/multinacional. Al final de la semana, mirá la proporción. No hay un número "correcto", pero tener conciencia de la proporción ya cambia tus decisiones.</p>
        </div>
        <h3>Comercio Justo en Argentina</h3>
        <p>El movimiento de comercio justo busca que los productores reciban un precio digno por su trabajo. En Argentina tenemos:</p>
        <ul>
          <li><strong>Red de Comercio Justo:</strong> Conecta productores campesinos e indígenas con consumidores urbanos.</li>
          <li><strong>Almacenes cooperativos:</strong> Espacios donde se venden productos de cooperativas y emprendedores sociales.</li>
          <li><strong>Sellos:</strong> Fair Trade, Economía Social, productos orgánicos certificados.</li>
        </ul>
        <h3>El Efecto Multiplicador Local</h3>
        <p>Cuando gastás $1.000 en un supermercado de cadena, aproximadamente $150 quedan en tu comunidad (sueldos de empleados locales). El resto se va a proveedores centralizados, alquileres corporativos, accionistas en otro país. Cuando gastás $1.000 en el almacén del barrio, entre $450 y $600 quedan circulando en tu comunidad: el almacenero le compra al verdulero, el verdulero le paga al flete local, el fletero gasta en el kiosco. Ese efecto multiplicador es la razón por la cual los barrios con comercio local fuerte son más resilientes a las crisis. No es romanticismo — es matemática económica.</p>
        <h3>Consumo Consciente en Tiempos de Inflación</h3>
        <p>El argumento más fuerte contra el consumo consciente en Argentina es: "No puedo elegir lo ético, tengo que elegir lo más barato." Es entendible. Pero muchas veces lo local Y lo directo es también lo más barato. El bolsón de verduras directo del productor cuesta un 30-40% menos que el supermercado. La feria del barrio tiene precios que compiten con (y a menudo ganan) los de cualquier cadena. Comprar local no siempre es más caro — a veces es la opción más inteligente para tu bolsillo y para tu comunidad al mismo tiempo.</p>
        <blockquote>"No te pido que cambies el mundo con cada compra. Te pido que seas CONSCIENTE de cada compra. Que sepas que cuando elegís al productor local sobre la multinacional, cuando elegís calidad sobre descarte, estás construyendo la economía que querés."</blockquote>
      `,
      orderIndex: 7, type: 'text' as const, duration: 16, isRequired: true,
    },
    {
      courseId,
      title: 'Educación Financiera para Toda la Familia',
      description: 'Cómo enseñar a niños y adolescentes a manejar dinero en un país inestable.',
      content: `
        <h2>Lo Que No Te Enseñaron (y Debés Enseñar)</h2>
        <p>El sistema educativo argentino te enseña trigonometría, pero no te enseña a leer un resumen de tarjeta de crédito. Te enseña la revolución de mayo, pero no cómo funciona el impuesto a las ganancias. Te enseña biología celular, pero no cómo armar un presupuesto. La educación financiera está ausente de las escuelas — lo que significa que <strong>la tienen que dar las familias</strong>.</p>
        <h3>Educación Financiera por Edad</h3>
        <h4>3-6 años: Los conceptos básicos</h4>
        <ul>
          <li><strong>Las cosas cuestan dinero:</strong> Llevalos al almacén. Mostrales que pagás. Que vean el intercambio.</li>
          <li><strong>Esperar vale la pena:</strong> "Si guardás esta moneda hoy, mañana podés comprar algo mejor." La base del ahorro.</li>
          <li><strong>Necesidades vs. deseos:</strong> "La leche es una necesidad. El juguete es un deseo. Primero las necesidades."</li>
        </ul>
        <h4>7-12 años: Práctica supervisada</h4>
        <ul>
          <li><strong>La mesada:</strong> Un monto semanal fijo que el niño/a administra. Si lo gasta todo el lunes, no hay más hasta el sábado. La escasez enseña.</li>
          <li><strong>El ahorro con objetivo:</strong> "Querés ese juego? Vale $X. Si ahorrás $Y por semana, en Z semanas lo tenés." Planificación concreta.</li>
          <li><strong>La alcancía transparente:</strong> Que VEAN crecer el ahorro. La visualización del progreso motiva.</li>
          <li><strong>Compras con participación:</strong> En el super, dales un presupuesto y que elijan. "Tenemos $5.000 para galletitas y jugos. ¿Qué compramos?"</li>
        </ul>
        <h4>13-18 años: Finanzas reales</h4>
        <ul>
          <li><strong>Mostrales las cuentas de la casa:</strong> Cuánto ganan, cuánto gastan, en qué se va. La transparencia destruye las fantasías y construye responsabilidad.</li>
          <li><strong>Primer trabajo o emprendimiento:</strong> Vender algo en la feria, dar clases particulares, hacer algo productivo. Que experimenten el ciclo completo de generar ingreso.</li>
          <li><strong>Conceptos financieros:</strong> Inflación (por qué las cosas cuestan más cada mes), interés compuesto (por qué las deudas crecen), tipo de cambio (por qué importa el dólar).</li>
          <li><strong>Simulación de presupuesto adulto:</strong> "Si vivieras solo/a con este sueldo, ¿cómo lo distribuirías?" Ejercicio revelador.</li>
        </ul>
        <h3>Errores Comunes de los Padres</h3>
        <ul>
          <li><strong>"De plata no se habla":</strong> El tabú sobre el dinero genera adultos financieramente analfabetos.</li>
          <li><strong>"Que no le falte nada":</strong> Darle todo al hijo le quita la capacidad de valorar y priorizar.</li>
          <li><strong>"Ya va a aprender cuando sea grande":</strong> Las conductas financieras se forman antes de los 10 años.</li>
        </ul>
        <blockquote>"La mejor herencia que podés dejarle a tus hijos no es dinero: es la capacidad de manejar dinero. Eso no se pierde con ninguna devaluación."</blockquote>
      `,
      orderIndex: 8, type: 'text' as const, duration: 16, isRequired: true,
    },
    {
      courseId,
      title: 'Monedas Complementarias y Economía Social Solidaria',
      description: 'Sistemas económicos alternativos que funcionan en paralelo a la economía formal.',
      content: `
        <h2>Más Allá del Peso y el Dólar</h2>
        <p>¿Qué pasa cuando el dinero oficial no alcanza? ¿Cuando la inflación destruye el poder adquisitivo? ¿Cuando el desempleo deja a millones fuera del sistema? En Argentina hemos experimentado respuestas colectivas extraordinarias: los clubes de trueque del 2001 llegaron a tener <strong>6 millones de participantes</strong>. Fracasaron por problemas de diseño, no porque la idea fuera mala.</p>
        <h3>Monedas Complementarias: La Idea</h3>
        <p>Una moneda complementaria no reemplaza al peso. Lo <strong>complementa</strong>. Funciona dentro de una comunidad específica para facilitar intercambios que el dinero oficial no logra.</p>
        <ul>
          <li><strong>Bancos de Tiempo:</strong> Una hora de tu trabajo vale una hora del mío, sin importar qué hagas. Una hora de plomería = una hora de clases de inglés = una hora de diseño gráfico. Elimina la desigualdad en la valoración del trabajo.</li>
          <li><strong>Monedas locales:</strong> Vales que circulan dentro de un barrio o pueblo, incentivando el consumo local. Si solo podés gastar tu "moneda barrial" en negocios del barrio, el dinero no se fuga.</li>
          <li><strong>Créditos de servicio:</strong> Hacés X horas de trabajo comunitario y recibís créditos canjeables por servicios o productos dentro de la red.</li>
        </ul>
        <h3>Economía Social Solidaria (ESS)</h3>
        <p>La ESS es un movimiento global que propone una economía centrada en las personas, no en las ganancias. En Argentina tiene expresiones concretas:</p>
        <ul>
          <li><strong>Ferias de la agricultura familiar:</strong> Productores que venden directo sin intermediarios. Precio justo para ambas partes.</li>
          <li><strong>Empresas recuperadas:</strong> Más de 400 fábricas en Argentina fueron recuperadas por sus trabajadores cuando los dueños las abandonaron.</li>
          <li><strong>Microcrédito:</strong> Organizaciones que dan préstamos pequeños (desde $10.000) a personas que ningún banco aceptaría, con acompañamiento y tasas accesibles.</li>
          <li><strong>Huertas comunitarias:</strong> Producción de alimentos en espacios urbanos ociosos. Seguridad alimentaria + comunidad + educación.</li>
        </ul>
        <h3>¿Utopía o Realidad?</h3>
        <p>Los escépticos dicen que la economía social es idealismo. Los datos dicen otra cosa:</p>
        <ul>
          <li>Las cooperativas emplean más personas a nivel mundial que todas las multinacionales juntas.</li>
          <li>Los bancos de tiempo funcionan exitosamente en más de 35 países.</li>
          <li>El microcrédito ha sacado de la pobreza a más de 200 millones de personas globalmente.</li>
          <li>En Argentina, la economía social genera el 10% del PBI y es más resiliente a las crisis que el sector privado tradicional.</li>
        </ul>
        <blockquote>"La economía social solidaria no es 'la economía de los pobres'. Es la economía de los que entienden que la riqueza real no se acumula — se comparte. Y que una comunidad fuerte es el mejor seguro contra cualquier crisis."</blockquote>
      `,
      orderIndex: 9, type: 'text' as const, duration: 16, isRequired: true,
    },
    {
      courseId,
      title: 'Tu Plan de Resiliencia Económica Familiar',
      description: 'Integrar todo lo aprendido en un plan concreto para tu familia y tu comunidad.',
      content: `
        <h2>De la Teoría a Tu Mesa</h2>
        <p>Este curso te dio herramientas. Ahora es momento de armar tu <strong>plan de resiliencia económica</strong>: un sistema de protección para tu familia y tu comunidad que funcione hoy, en la próxima crisis, y en cualquier escenario que Argentina invente.</p>
        <h3>El Plan de 4 Anillos</h3>
        <h4>Anillo 1: Tu persona (inmediato)</h4>
        <ul>
          <li>Registro de gastos durante 30 días</li>
          <li>Presupuesto familiar escrito</li>
          <li>Regla del 10% de ahorro automático</li>
          <li>Eliminar deudas tóxicas (tarjeta, préstamos de consumo)</li>
          <li>Colchón de emergencia de 1-3 meses</li>
        </ul>
        <h4>Anillo 2: Tu hogar (1-3 meses)</h4>
        <ul>
          <li>Conversar sobre finanzas en familia (romper el tabú)</li>
          <li>Implementar educación financiera con tus hijos</li>
          <li>Revisar todos los servicios: ¿estás pagando de más?</li>
          <li>Evaluar oportunidades de ingreso adicional</li>
          <li>Diversificar ahorros en las 4 capas</li>
        </ul>
        <h4>Anillo 3: Tu barrio (3-6 meses)</h4>
        <ul>
          <li>Identificar vecinos con complementariedad económica</li>
          <li>Organizar una compra colectiva (empezá con frutas y verduras)</li>
          <li>Crear un grupo de WhatsApp de intercambio vecinal</li>
          <li>Evaluar un círculo de ahorro con personas de confianza</li>
          <li>Participar en la feria o mercado más cercano</li>
        </ul>
        <h4>Anillo 4: Tu comunidad (6-12 meses)</h4>
        <ul>
          <li>Explorar el modelo cooperativo para tu sector</li>
          <li>Conectar con redes de economía social en tu zona</li>
          <li>Promover educación financiera en tu escuela / club / parroquia</li>
          <li>Impulsar un banco de tiempo o moneda complementaria local</li>
          <li>Incentivar el consumo consciente en tu red</li>
        </ul>
        <h3>La Hoja de Resiliencia</h3>
        <p>Completá esta hoja y colgala en tu heladera:</p>
        <table style="width:100%; border-collapse: collapse;">
          <tr style="background:#f0f0f0;"><th style="padding:8px; border:1px solid #ddd;">Indicador</th><th style="padding:8px; border:1px solid #ddd;">Hoy</th><th style="padding:8px; border:1px solid #ddd;">Meta 6 meses</th></tr>
          <tr><td style="padding:8px; border:1px solid #ddd;">Ahorro mensual</td><td style="padding:8px; border:1px solid #ddd;">$___</td><td style="padding:8px; border:1px solid #ddd;">$___</td></tr>
          <tr><td style="padding:8px; border:1px solid #ddd;">Deuda total</td><td style="padding:8px; border:1px solid #ddd;">$___</td><td style="padding:8px; border:1px solid #ddd;">$___</td></tr>
          <tr><td style="padding:8px; border:1px solid #ddd;">Meses de colchón</td><td style="padding:8px; border:1px solid #ddd;">___</td><td style="padding:8px; border:1px solid #ddd;">___</td></tr>
          <tr><td style="padding:8px; border:1px solid #ddd;">% ingreso en ahorro</td><td style="padding:8px; border:1px solid #ddd;">___</td><td style="padding:8px; border:1px solid #ddd;">10%</td></tr>
          <tr><td style="padding:8px; border:1px solid #ddd;">Vecinos en mi red económica</td><td style="padding:8px; border:1px solid #ddd;">___</td><td style="padding:8px; border:1px solid #ddd;">___</td></tr>
        </table>
        <h3>El Verdadero Indicador de Riqueza</h3>
        <p>La verdadera riqueza no es cuánta plata tenés en el banco. Es <strong>cuánto tiempo podés mantener tu nivel de vida sin ingresos</strong>. Si perdés tu trabajo hoy, ¿cuántos meses sobrevivís? Ese número es tu indicador real de resiliencia. Trabajá para aumentarlo.</p>
        <blockquote>"La economía familiar y comunitaria no es una segunda opción para los que no pudieron con la economía 'de verdad'. Es la economía de verdad: la que te alimenta, te cuida, te sostiene y te conecta. El PBI no te va a salvar en una crisis. Tu familia y tu comunidad sí."</blockquote>
      `,
      orderIndex: 10, type: 'text' as const, duration: 18, isRequired: true,
    },
    {
      courseId,
      title: 'Cooperativas de Consumo: Comprar Juntos para Vivir Mejor',
      description: 'Guía paso a paso para armar una cooperativa de compras comunitarias y abaratar costos sin sacrificar calidad.',
      content: `
        <h2>¿Por Qué Comprás Caro Si Podés Comprar Barato?</h2>
        <p>Pensá en lo que gastás cada mes en el supermercado. Ahora imaginá que en vez de ir solo, vas con otras 15 familias y le comprás directo al mayorista, al productor, al distribuidor. Sin la góndola de por medio. Sin la publicidad que pagás en el precio. Sin el alquiler del local lujoso que se traslada a cada producto. Eso es una <strong>cooperativa de consumo</strong>: un grupo de personas que se organizan para comprar juntas, mejor y más barato.</p>
        <p>No es una idea nueva. En Argentina hay cooperativas de consumo desde los años 1920. En Europa, las cooperativas de consumo mueven miles de millones de euros. Pero en los últimos años, con la inflación devorando los sueldos, el modelo volvió con fuerza en barrios de todo el país. Y la buena noticia es que <strong>vos podés armar una</strong>.</p>
        <h3>Paso 1: Juntar el Grupo Fundador</h3>
        <p>Necesitás entre 10 y 30 familias para que el volumen de compra sea significativo. No hace falta que sean amigos íntimos, pero sí tiene que haber <strong>confianza básica y compromiso</strong>. Empezá con tu cuadra, tu edificio, el grupo de padres del colegio, tu comunidad religiosa, tus compañeros de trabajo. Convocá a una primera reunión informativa. Explicá el concepto, mostrá números concretos (los vas a ver más abajo) y preguntá quién se suma.</p>
        <h3>Paso 2: Definir Qué Se Compra</h3>
        <p>No intentes comprar TODO desde el primer día. Empezá con una categoría que tenga alto impacto:</p>
        <ul>
          <li><strong>Frutas y verduras:</strong> Los márgenes de intermediación son altísimos (60-70%). Comprando directo al productor del cinturón hortícola, podés ahorrar entre un 30% y un 50%.</li>
          <li><strong>Productos de limpieza:</strong> Comprando bidones al por mayor y fraccionando, el ahorro es del 40-60% respecto al supermercado.</li>
          <li><strong>Alimentos secos:</strong> Arroz, fideos, legumbres, aceite. Por bolsa o caja, los precios mayoristas son un 25-35% menores.</li>
          <li><strong>Carne:</strong> Comprando la media res entre varias familias y carneándola, el ahorro es significativo — aunque requiere más logística.</li>
        </ul>
        <h3>Paso 3: Encontrar Proveedores</h3>
        <p>Acá es donde la cooperativa demuestra su poder. Un solo consumidor no puede negociar. Veinte familias sí:</p>
        <ul>
          <li><strong>Mercado Central o mercados regionales:</strong> Compradores con volumen acceden a precios que el público general no ve.</li>
          <li><strong>Productores directos:</strong> En el conurbano bonaerense hay cientos de quintas que venden directo si les garantizás volumen. Lo mismo en Córdoba, Mendoza, Tucumán, el Alto Valle.</li>
          <li><strong>Distribuidores mayoristas:</strong> Muchos venden directo si comprás por pallets o cantidades mínimas que una familia sola no alcanza.</li>
        </ul>
        <div style="background:#f0fdf4;border:2px solid #16a34a;border-radius:12px;padding:24px;margin:28px 0;">
          <h4 style="color:#16a34a;margin-top:0;">Pausa para Reflexionar</h4>
          <p>Antes de seguir, hacé un cálculo rápido. Mirá tu último ticket de supermercado y elegí 5 productos que comprás todas las semanas (leche, pan, verduras, aceite, fideos — lo que sea habitual):</p>
          <ol>
            <li>Anotá cuánto pagaste por cada uno.</li>
            <li>Buscá el precio mayorista de esos mismos productos (podés consultar en maxiconsumo.com, diarco.com.ar, o preguntar directamente en un mayorista de tu zona).</li>
            <li>Calculá la diferencia porcentual.</li>
            <li>Multiplicá esa diferencia por 4 semanas y por 12 meses.</li>
          </ol>
          <p>Ese número que te da es lo que podrías ahorrar en un año solo con esos 5 productos. Ahora imaginá si aplicás el mismo principio a TODA tu compra mensual. ¿Empezás a ver el poder del volumen colectivo?</p>
        </div>
        <h3>Paso 4: La Logística (Donde la Mayoría Fracasa)</h3>
        <p>La cooperativa más entusiasta del mundo se muere si no resuelve la logística. Los puntos clave:</p>
        <ul>
          <li><strong>Punto de acopio:</strong> Necesitás un lugar donde recibir la mercadería y fraccionarla. Puede ser el garaje de alguien, un salón comunitario, la parroquia, el club del barrio. No necesita ser lujoso — necesita ser accesible y seguro.</li>
          <li><strong>Día de reparto:</strong> Fijá un día y horario de retiro. Que sea sagrado. La previsibilidad sostiene el compromiso.</li>
          <li><strong>Sistema de pedidos:</strong> Un Google Form o un grupo de WhatsApp con planilla compartida alcanza para empezar. No te compliques con apps ni sistemas caros.</li>
          <li><strong>Cobro anticipado:</strong> SIEMPRE cobrá antes de comprar. Nunca financiés vos la compra del grupo. Transferencia bancaria o efectivo antes del pedido al proveedor.</li>
          <li><strong>Roles rotativos:</strong> Que las tareas (hacer el pedido, recibir, fraccionar, cobrar) roten entre los miembros. Si todo cae en una sola persona, esa persona se quema y la cooperativa muere.</li>
        </ul>
        <h3>Caso Real: Cooperativa "La Vecinal" de Lanús</h3>
        <div style="background:linear-gradient(135deg,#fef3c7,#fde68a);border-left:4px solid #f59e0b;border-radius:8px;padding:20px;margin:24px 0;">
          <h4 style="color:#92400e;margin-top:0;">Historia Real</h4>
          <p>En 2022, un grupo de 18 familias de Lanús, zona sur del conurbano bonaerense, armó una cooperativa de consumo después de que la inflación les comiera el sueldo mes a mes. Arrancaron solo con verduras: una vez por semana, Graciela — jubilada y coordinadora del grupo — juntaba los pedidos por WhatsApp, le compraba a un quintero de Florencio Varela, y los sábados a la mañana las familias retiraban sus bolsones del garaje de su casa.</p>
          <p>"Al principio éramos muy desorganizados", cuenta Graciela. "Había gente que no retiraba, otros que se quejaban de las lechugas. Tuvimos que aprender sobre la marcha." En tres meses ya habían sumado productos de limpieza y alimentos secos. Para el sexto mes tenían 32 familias y habían conseguido un espacio prestado en la sociedad de fomento del barrio.</p>
          <p><strong>Números concretos:</strong> Una familia tipo que gastaba $120.000 mensuales en el supermercado pasó a gastar $78.000 comprando a través de la cooperativa — un ahorro del 35%. En un año, cada familia ahorró en promedio <strong>$504.000 pesos</strong>. Ese dinero se reinvirtió en el colchón de emergencias familiares, en mejoras del hogar y en la cuota de los pibes.</p>
          <p>"Lo más lindo no es la plata que nos ahorramos", dice Graciela. "Es que nos conocimos. Antes éramos vecinos que se saludaban de lejos. Ahora somos una comunidad."</p>
        </div>
        <h3>Paso 5: Crecer Sin Romperse</h3>
        <p>Cuando la cooperativa funciona, empieza a crecer. Más familias quieren sumarse. Más proveedores te ofrecen productos. La tentación es crecer rápido. <strong>Resistila.</strong> Crecé de a poco, consolidando cada etapa:</p>
        <ol>
          <li><strong>Primer mes:</strong> Solo una categoría de productos, máximo 15 familias.</li>
          <li><strong>Tercer mes:</strong> Si funciona, sumá una segunda categoría.</li>
          <li><strong>Sexto mes:</strong> Abrí a nuevas familias, pero con un período de prueba.</li>
          <li><strong>Al año:</strong> Evaluá si conviene formalizarse legalmente como cooperativa. El INAES (Instituto Nacional de Asociativismo) tiene programas de asistencia gratuita para cooperativas nuevas.</li>
        </ol>
        <h3>Los 5 Errores Que Matan Cooperativas de Consumo</h3>
        <ol>
          <li><strong>No cobrar por adelantado:</strong> Alguien pide y no paga. Otro pide y no retira. La deuda acumulada destruye la confianza y las finanzas del grupo.</li>
          <li><strong>Un solo líder que hace todo:</strong> El burnout del coordinador es la causa de muerte número uno. Distribuí las tareas.</li>
          <li><strong>Crecer demasiado rápido:</strong> Pasar de 15 a 50 familias sin haber resuelto la logística básica genera caos.</li>
          <li><strong>No tener reglas escritas:</strong> ¿Qué pasa si alguien no paga? ¿Si no retira? ¿Si trae un amigo sin avisar? Escribí las reglas ANTES de que surjan los problemas.</li>
          <li><strong>Esperar perfección:</strong> La primera compra va a tener errores. La segunda también. Lo importante es mejorar cada semana, no ser perfecto desde el día uno.</li>
        </ol>
        <blockquote>"No necesitás permiso del gobierno ni capital inicial para armar una cooperativa de consumo. Necesitás vecinos de confianza, un grupo de WhatsApp y las ganas de dejar de pagar de más por lo mismo. El poder de compra colectivo es poder real — y está al alcance de tu mano."</blockquote>
      `,
      orderIndex: 11, type: 'text' as const, duration: 22, isRequired: true,
    },
    {
      courseId,
      title: 'El Presupuesto en Crisis: Cuando Todo Cambia de Golpe',
      description: 'Protocolos de emergencia económica para devaluaciones, pérdida de empleo y crisis imprevistas, con caso real de una familia rosarina en 2023.',
      content: `
        <h2>El Día Que Se Cae Todo</h2>
        <p>Sabés cómo es. Un lunes a la mañana te enterás de que devaluaron. O te llega el telegrama de despido. O el banco te congela los ahorros. O la inflación se dispara y tu sueldo queda congelado. En Argentina no es "si pasa" — es "cuándo pasa". Y cuando pasa, la diferencia entre hundirte y sostenerte no es cuánta plata tenés: es <strong>cuánto preparado estás para reaccionar</strong>.</p>
        <p>Esta lección no es teoría. Es un <strong>protocolo de emergencia</strong> — un manual paso a paso para los primeros 72 horas, la primera semana y el primer mes después de que todo cambia de golpe. Porque la crisis no espera a que termines de leer un libro de finanzas.</p>
        <h3>Protocolo de las Primeras 72 Horas</h3>
        <p>Cuando estalla una crisis económica (devaluación, hiperinflación, pérdida de empleo), los primeros tres días son críticos. Acá no hay espacio para la parálisis. Tenés que actuar:</p>
        <h4>Hora 0-6: Diagnóstico Rápido</h4>
        <ul>
          <li><strong>¿Cuánto tengo?</strong> Revisá todas tus cuentas, efectivo, ahorros. Todo. Necesitás saber tu posición exacta AHORA.</li>
          <li><strong>¿Cuánto debo?</strong> Listá todas tus deudas con fechas de vencimiento. ¿Hay cuotas que vencen esta semana?</li>
          <li><strong>¿Cuánto necesito para sobrevivir este mes?</strong> Solo lo esencial: alquiler/cuota, comida, servicios básicos, medicamentos, transporte al trabajo. Todo lo demás se congela.</li>
        </ul>
        <h4>Hora 6-24: Congelar y Proteger</h4>
        <ul>
          <li><strong>Congelá todo gasto no esencial:</strong> Streaming, delivery, salidas, compras pendientes, regalos, suscripciones. Todo se frena. Sin excepciones, sin "pero es poquito". La suma de "poquitos" es lo que te hunde.</li>
          <li><strong>Protegé lo líquido:</strong> Si hay devaluación, tus pesos pierden valor por hora. Si tenés acceso a dólar MEP o stablecoins, convertí lo que no necesitás para gastos inmediatos. Si no tenés acceso, comprá bienes durables que no pierdan valor (alimentos no perecederos, artículos de limpieza en cantidad).</li>
          <li><strong>Comunicá:</strong> Hablá con tu familia. Explicá lo que pasa sin generar pánico. "Tenemos que ajustar durante X semanas. Esto es lo que vamos a hacer." La transparencia reduce la ansiedad y genera compromiso colectivo.</li>
        </ul>
        <h4>Hora 24-72: Estabilizar</h4>
        <ul>
          <li><strong>Llamá a tus acreedores:</strong> Banco, tarjeta, alquiler. Explicá la situación. Pedí refinanciación, extensión de plazos, reducción de cuotas. El peor error es esconderte. Los acreedores prefieren negociar a no cobrar.</li>
          <li><strong>Activá tu red:</strong> Familia, amigos, vecinos, comunidad. No se trata de pedir plata (aunque a veces sea necesario). Se trata de compartir recursos: compras en grupo, cuidado de niños compartido, información sobre changas u oportunidades.</li>
          <li><strong>Revisá tus ingresos:</strong> ¿Podés generar ingresos extra inmediatos? Vender algo que no uses, ofrecer un servicio, hacer horas extra, activar un plan B.</li>
        </ul>
        <div style="background:#f0fdf4;border:2px solid #16a34a;border-radius:12px;padding:24px;margin:28px 0;">
          <h4 style="color:#16a34a;margin-top:0;">Pausa para Reflexionar</h4>
          <p>Este ejercicio es el más importante del curso. Hacelo AHORA, no cuando la crisis llegue — porque en ese momento no vas a tener la cabeza para pensar:</p>
          <ol>
            <li><strong>Escribí tu "número de supervivencia":</strong> ¿Cuál es el mínimo absoluto que tu familia necesita por mes para sobrevivir? No para vivir bien — para sobrevivir. Alquiler/cuota, comida básica, servicios esenciales, medicamentos imprescindibles, transporte mínimo. Ese número es tu línea roja.</li>
            <li><strong>¿Cuántos meses podés cubrir ese número con lo que tenés hoy?</strong> Sumá todos tus ahorros, inversiones, cosas que podrías vender. Dividí por tu número de supervivencia. Ese es tu "tiempo de flotación" real.</li>
            <li><strong>¿Cuáles son tus tres primeros gastos a cortar en emergencia?</strong> Tenelos identificados de antemano. No los cortes ahora — pero sabé cuáles son para el momento en que necesites actuar rápido.</li>
            <li><strong>¿Quiénes son las 3-5 personas a las que llamarías primero?</strong> Tu red de emergencia. Asegurate de que sea gente que realmente pueda y quiera ayudar, no solo nombres en tu agenda.</li>
          </ol>
          <p>Guardá estas respuestas en un lugar accesible (la app de notas del celular, un papel en tu billetera). Es tu plan de emergencia personal. Revisalo cada tres meses y actualizalo.</p>
        </div>
        <h3>El Plan de la Primera Semana</h3>
        <p>Pasados los primeros tres días, si la crisis persiste, necesitás un plan de mediano plazo:</p>
        <ul>
          <li><strong>Presupuesto de guerra:</strong> Armá un presupuesto nuevo desde cero con solo los gastos esenciales. Todo lo demás se suspende hasta nuevo aviso.</li>
          <li><strong>Generación de ingresos alternativos:</strong> ¿Qué sabés hacer que alguien pagaría? Electricidad, plomería, repostería, clases particulares, cuidado de mascotas, diseño, traducciones. En crisis, la economía informal es la primera que se activa.</li>
          <li><strong>Renegociación de deudas:</strong> Si perdiste el empleo, la ley argentina te protege: no te pueden ejecutar la vivienda única en los primeros meses, podés pedir refinanciación bancaria con condiciones especiales. Consultá con un abogado o un defensor del consumidor (gratuito).</li>
          <li><strong>Registrate en programas de asistencia:</strong> ANSES, programas municipales, comedores comunitarios, bolsones de alimentos. No es vergüenza — es usar los recursos que existen para lo que fueron creados.</li>
        </ul>
        <h3>El Plan del Primer Mes</h3>
        <p>Si la crisis se alarga (y en Argentina suelen alargarse), necesitás pasar de la emergencia a la adaptación:</p>
        <ul>
          <li><strong>Reestructurá tu vida:</strong> ¿Podés mudarte a algo más barato? ¿Cambiar a los chicos a una escuela pública? ¿Usar transporte público en vez de auto? Las decisiones grandes duelen — pero son las que realmente mueven la aguja.</li>
          <li><strong>Convertí habilidades en ingresos:</strong> La crisis obliga a reinventarse. Mucha gente descubre en la crisis una vocación o un talento que no sabía que tenía. No lo veas como degradación — velo como transformación.</li>
          <li><strong>Fortalecé tu red comunitaria:</strong> Compras colectivas, intercambio de servicios, cuidado compartido de niños. Todo lo que aprendiste en este curso se activa ahora.</li>
        </ul>
        <div style="background:linear-gradient(135deg,#fef3c7,#fde68a);border-left:4px solid #f59e0b;border-radius:8px;padding:20px;margin:24px 0;">
          <h4 style="color:#92400e;margin-top:0;">Historia Real</h4>
          <p><strong>La familia Pereyra de Rosario, 2023</strong></p>
          <p>Diego y Soledad Pereyra viven en el barrio Fisherton de Rosario con sus dos hijas, Martina (14) y Julieta (9). Diego trabajaba como encargado en una concesionaria de autos. Soledad hacía tortas por encargo desde la casa. Entre los dos juntaban un ingreso que les permitía vivir bien: alquiler de un departamento de tres ambientes, escuela privada para las nenas, un auto usado.</p>
          <p>En agosto de 2023, la devaluación post-PASO golpeó como un mazazo. El dólar se disparó de $280 a $700 en días. Los precios se duplicaron en semanas. La concesionaria donde trabajaba Diego dejó de vender autos — nadie compraba con esa incertidumbre. En septiembre, le redujeron las horas. En octubre, lo despidieron.</p>
          <p>"Los primeros tres días fueron los peores", cuenta Soledad. "Diego no podía ni hablar. Yo tenía pánico. Las nenas lo percibían." Pero al cuarto día, se sentaron a la mesa y sacaron los números. Siguieron, sin saberlo, algo parecido al protocolo de emergencia.</p>
          <p><strong>Primero, el diagnóstico:</strong> tenían ahorros para tres meses si cortaban todo lo no esencial. Su "número de supervivencia" era $180.000 (alquiler, comida, servicios, transporte). Tenían $540.000 guardados. Tres meses de flotación.</p>
          <p><strong>Segundo, las decisiones difíciles:</strong> cambiaron a las nenas a la escuela pública del barrio (Martina lloró una semana pero después hizo nuevas amigas). Renegociaron el alquiler — el dueño aceptó una reducción temporal del 20% antes que perder inquilinos en un mercado parado. Cortaron streaming, gimnasio, salidas.</p>
          <p><strong>Tercero, reinventarse:</strong> Soledad triplicó la producción de tortas, vendiendo ahora por redes sociales y a oficinas del centro. Diego, que siempre había sido bueno con los autos, empezó a hacer service y reparaciones a domicilio desde el garaje de un amigo. En noviembre ya tenía una lista de clientes. "Gano menos que antes, pero no dependo de que otro me dé permiso para trabajar", dice.</p>
          <p><strong>Cuarto, la comunidad:</strong> Se sumaron a un grupo de compras colectivas del barrio. Las madres de la escuela organizaron un sistema de viandas compartidas — cada día cocinaba una familia diferente para cuatro. "Al principio me daba vergüenza", confiesa Soledad. "Pensaba que íbamos a parecer pobres. Pero todas las familias estaban igual. No era vergüenza — era solidaridad."</p>
          <p>Seis meses después, la familia Pereyra no volvió a su vida anterior. Volvió a algo diferente. Diego tiene su propio taller mecánico a domicilio y gana más que en la concesionaria. Soledad transformó sus tortas en un negocio formal con CUIT y facturación. Las nenas, que al principio lloraban por la escuela privada, ahora tienen amigos en todo el barrio. "La crisis nos sacó cosas", resume Diego. "Pero nos obligó a descubrir cosas que teníamos y no sabíamos. No volvería a ese momento por nada — pero tampoco cambiaría lo que aprendimos."</p>
        </div>
        <h3>Las 7 Reglas de la Economía de Crisis</h3>
        <ol>
          <li><strong>Actuá rápido.</strong> La parálisis mata. Mejor una decisión imperfecta hoy que una decisión perfecta dentro de un mes.</li>
          <li><strong>Priorizá la comida.</strong> Primero comés, después pagás todo lo demás. Ningún acreedor vale más que alimentar a tu familia.</li>
          <li><strong>No te aísles.</strong> La vergüenza es el veneno de las crisis. Hablá, compartí, pedí ayuda. Los que se aíslan se hunden; los que se conectan sobreviven.</li>
          <li><strong>Cuidá tu salud mental.</strong> La crisis económica genera ansiedad, depresión, conflictos familiares. Si lo necesitás, buscá ayuda profesional — hay servicios gratuitos de salud mental en hospitales públicos y centros comunitarios.</li>
          <li><strong>No vendas el futuro por el presente.</strong> No vendas tus herramientas de trabajo, no dejes de formarte, no saques a los chicos de la escuela. Esas decisiones resuelven hoy pero destruyen mañana.</li>
          <li><strong>Documentá todo.</strong> Guardá todos los papeles: telegramas, recibos, constancias. En la recuperación, los papeles son tu protección legal.</li>
          <li><strong>Recordá que es temporal.</strong> Argentina tuvo hiperinflación, corralito, default, pandemia — y de todas salió. No minimices el dolor presente, pero tampoco pierdas la perspectiva: <strong>esto también pasa</strong>.</li>
        </ol>
        <h3>Kit de Emergencia Económica: Tenelo Listo</h3>
        <p>Así como tenés (o deberías tener) un botiquín de primeros auxilios, armá tu kit de emergencia económica:</p>
        <ul>
          <li><strong>Carpeta física o digital con:</strong> Recibos de sueldo, contratos de alquiler, pólizas de seguro, constancias de CUIT/CUIL, documentación de deudas, teléfonos de ANSES, defensoría del consumidor y asistencia legal gratuita.</li>
          <li><strong>Efectivo de emergencia:</strong> El equivalente a una semana de gastos esenciales en efectivo. En las crisis argentinas, los cajeros se quedan sin plata y las transferencias se demoran.</li>
          <li><strong>Lista de contactos de emergencia:</strong> No solo familia — incluí abogado laboralista, contador, defensor del consumidor, programas de asistencia social de tu municipio.</li>
          <li><strong>Plan B de ingresos:</strong> Al menos una idea concreta de cómo generar ingresos alternativos si perdés tu trabajo. Tenela pensada ANTES de que pase.</li>
        </ul>
        <blockquote>"En Argentina, la crisis no es la excepción — es parte del paisaje. No podés evitar las tormentas. Pero podés construir un techo antes de que llueva. Cada herramienta que preparás hoy, cada peso que ahorrás, cada vecino con el que te conectás, es un ladrillo de ese techo. Cuando llegue la próxima tormenta — y va a llegar — no te va a encontrar a la intemperie."</blockquote>
      `,
      orderIndex: 12, type: 'text' as const, duration: 24, isRequired: true,
    },
  ];

  for (const lesson of lessons) { await db.insert(courseLessons).values(lesson); }
  console.log('Created', lessons.length, 'lessons for course 15');

  const eq15 = await db.select().from(courseQuizzes).where(eq(courseQuizzes.courseId, courseId)).limit(1);
  if (eq15.length > 0) { await db.delete(quizQuestions).where(eq(quizQuestions.quizId, eq15[0].id)); await db.delete(courseQuizzes).where(eq(courseQuizzes.courseId, courseId)); }
  const [quiz15] = await db.insert(courseQuizzes).values({ courseId, title: 'Quiz: Economía Familiar y Comunitaria', description: 'Evaluá tu comprensión de la economía familiar, barrial y solidaria.', passingScore: 70, timeLimit: 15, allowRetakes: true, maxAttempts: 3 }).returning();
  const q15 = [
    { quizId: quiz15.id, question: '¿Qué porcentaje del PBI argentino representaría el trabajo doméstico no remunerado si se pagara?', type: 'multiple_choice' as const, options: JSON.stringify(['2%', '8%', '16%', '30%']), correctAnswer: JSON.stringify(2), explanation: 'El trabajo doméstico y de cuidado equivale al 16% del PBI argentino, más que la industria manufacturera.', points: 2, orderIndex: 1 },
    { quizId: quiz15.id, question: 'Para ahorrar en Argentina, es necesario tener ingresos altos.', type: 'true_false' as const, correctAnswer: JSON.stringify(false), explanation: 'Lo importante es la diferencia entre ingreso y gasto, no el monto absoluto. Se puede empezar ahorrando el 2%.', points: 1, orderIndex: 2 },
    { quizId: quiz15.id, question: '¿Cuál es la diferencia entre deuda inteligente y deuda tóxica?', type: 'multiple_choice' as const, options: JSON.stringify(['El monto de la deuda', 'Si la deuda genera ingresos que superen su costo', 'El banco que presta', 'Si es en pesos o dólares']), correctAnswer: JSON.stringify(1), explanation: 'La deuda inteligente genera retorno (herramientas, capacitación), mientras la tóxica financia consumo sin retorno.', points: 2, orderIndex: 3 },
    { quizId: quiz15.id, question: 'Un círculo de ahorro comunitario cobra intereses a sus miembros.', type: 'true_false' as const, correctAnswer: JSON.stringify(false), explanation: 'Los círculos de ahorro funcionan sin intereses ni comisiones. Son mecanismos de ahorro forzado colectivo.', points: 1, orderIndex: 4 },
    { quizId: quiz15.id, question: '¿Qué principio cooperativo establece "un socio = un voto"?', type: 'multiple_choice' as const, options: JSON.stringify(['Membresía abierta', 'Control democrático', 'Participación económica', 'Autonomía']), correctAnswer: JSON.stringify(1), explanation: 'El control democrático (un socio, un voto) es el segundo principio cooperativo, sin importar el capital aportado.', points: 2, orderIndex: 5 },
    { quizId: quiz15.id, question: 'Los clubes de trueque del 2001 fracasaron porque la idea era inviable.', type: 'true_false' as const, correctAnswer: JSON.stringify(false), explanation: 'Fracasaron por problemas de diseño (falsificación de créditos, falta de regulación), no porque el concepto fuera malo.', points: 1, orderIndex: 6 },
    { quizId: quiz15.id, question: '¿Qué es un banco de tiempo?', type: 'multiple_choice' as const, options: JSON.stringify(['Un banco que abre solo en ciertos horarios', 'Un sistema donde una hora de trabajo de cualquier persona vale lo mismo', 'Un ahorro a plazo fijo', 'Una app de productividad']), correctAnswer: JSON.stringify(1), explanation: 'En un banco de tiempo, una hora de plomería = una hora de inglés = una hora de diseño. Elimina la desigualdad en la valoración del trabajo.', points: 2, orderIndex: 7 },
    { quizId: quiz15.id, question: 'La verdadera medida de riqueza es cuántos meses podés mantener tu nivel de vida sin ingresos.', type: 'true_false' as const, correctAnswer: JSON.stringify(true), explanation: 'La resiliencia financiera se mide por la capacidad de sostenerte sin ingresos, no por el monto de tu sueldo.', points: 1, orderIndex: 8 },
    { quizId: quiz15.id, question: '¿Cuál es la regla más importante para la logística de una cooperativa de consumo?', type: 'multiple_choice' as const, options: JSON.stringify(['Tener un local propio', 'Cobrar siempre por adelantado antes de comprar', 'Usar una app profesional de gestión', 'Que un solo líder coordine todo']), correctAnswer: JSON.stringify(1), explanation: 'Cobrar por adelantado evita deudas acumuladas y protege las finanzas del grupo. Es la regla que más cooperativas salva.', points: 2, orderIndex: 9 },
    { quizId: quiz15.id, question: 'Las cooperativas de consumo solo funcionan en barrios de bajos recursos.', type: 'true_false' as const, correctAnswer: JSON.stringify(false), explanation: 'Las cooperativas de consumo funcionan en cualquier contexto socioeconómico. El principio de compra colectiva beneficia a cualquier familia que quiera ahorrar comprando en volumen.', points: 1, orderIndex: 10 },
    { quizId: quiz15.id, question: '¿Qué es lo primero que hay que hacer en las primeras 6 horas de una crisis económica?', type: 'multiple_choice' as const, options: JSON.stringify(['Comprar dólares', 'Hacer un diagnóstico rápido de cuánto tenés, cuánto debés y cuánto necesitás', 'Llamar al banco para cancelar cuentas', 'Buscar un segundo trabajo inmediatamente']), correctAnswer: JSON.stringify(1), explanation: 'El diagnóstico rápido (posición financiera, deudas, número de supervivencia) es el primer paso porque todas las decisiones posteriores dependen de ese dato.', points: 2, orderIndex: 11 },
    { quizId: quiz15.id, question: 'En una crisis económica, aislarse y resolver todo solo es más efectivo que pedir ayuda a la comunidad.', type: 'true_false' as const, correctAnswer: JSON.stringify(false), explanation: 'El aislamiento es uno de los mayores peligros en una crisis. Compartir recursos, información y apoyo emocional con la comunidad multiplica las chances de supervivencia.', points: 1, orderIndex: 12 },
  ];
  for (const q of q15) { await db.insert(quizQuestions).values(q); }
  console.log('Created quiz for course 15');
}

async function main() {
  console.log('Seeding Road 2: La Economía del Hombre Gris...');
  try {
    const [author] = await db.select().from(users).limit(1);
    if (!author) {
      console.log('No users found. Please create a user first.');
      return;
    }
    const authorId = author.id;
    console.log('Using author ID:', authorId, 'Username:', author.username);

    await seedCourse12(authorId);
    await seedCourse13(authorId);
    await seedCourse14(authorId);
    await seedCourse15(authorId);

    console.log('Road 2: La Economía del Hombre Gris seeding complete!');
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

main().then(() => process.exit(0)).catch(() => process.exit(1));
