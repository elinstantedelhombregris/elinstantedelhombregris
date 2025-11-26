const Database = require('better-sqlite3');

const sqlite = new Database('local.db');

// Coordenadas de ciudades importantes de Argentina
const ciudades = [
  { nombre: 'Buenos Aires', lat: '-34.6037', lng: '-58.3816' },
  { nombre: 'Córdoba', lat: '-31.4201', lng: '-64.1888' },
  { nombre: 'Rosario', lat: '-32.9442', lng: '-60.6505' },
  { nombre: 'Mendoza', lat: '-32.8895', lng: '-68.8458' },
  { nombre: 'Tucumán', lat: '-26.8083', lng: '-65.2176' },
  { nombre: 'La Plata', lat: '-34.9215', lng: '-57.9545' },
  { nombre: 'Mar del Plata', lat: '-38.0055', lng: '-57.5426' },
  { nombre: 'Salta', lat: '-24.7859', lng: '-65.4117' },
  { nombre: 'Santa Fe', lat: '-31.6333', lng: '-60.7000' },
  { nombre: 'San Juan', lat: '-31.5375', lng: '-68.5364' },
  { nombre: 'San Miguel de Tucumán', lat: '-26.8083', lng: '-65.2176' },
  { nombre: 'Resistencia', lat: '-27.4514', lng: '-58.9867' },
  { nombre: 'Neuquén', lat: '-38.9516', lng: '-68.0592' },
  { nombre: 'Bahía Blanca', lat: '-38.7183', lng: '-62.2663' },
  { nombre: 'Posadas', lat: '-27.3621', lng: '-55.9008' },
];

// Ejemplos de SUEÑOS
const suenos = [
  { contenido: 'Soñamos con una Argentina donde todos los niños tengan acceso a educación de calidad sin importar su condición económica.', ciudad: 'Buenos Aires' },
  { contenido: 'Queremos ver un país donde la tecnología y la innovación lleguen a todos los rincones, conectando comunidades rurales y urbanas.', ciudad: 'Córdoba' },
  { contenido: 'Soñamos con ciudades más verdes, con parques y espacios públicos que fomenten la convivencia y el bienestar comunitario.', ciudad: 'Rosario' },
  { contenido: 'Imaginamos una sociedad donde el diálogo y el respeto reemplacen la polarización y la violencia.', ciudad: 'Mendoza' },
  { contenido: 'Soñamos con empleos dignos para todos, donde cada persona pueda desarrollar su potencial y vivir con dignidad.', ciudad: 'Tucumán' },
  { contenido: 'Queremos una Argentina donde la cultura y las artes sean accesibles para todos, enriqueciendo nuestra identidad colectiva.', ciudad: 'La Plata' },
  { contenido: 'Soñamos con un sistema de salud pública que atienda a todos con calidad y calidez humana.', ciudad: 'Mar del Plata' },
  { contenido: 'Imaginamos comunidades donde los jóvenes tengan oportunidades reales de crecimiento y desarrollo personal.', ciudad: 'Salta' },
  { contenido: 'Soñamos con un país que proteja y valore su diversidad cultural y natural.', ciudad: 'Santa Fe' },
  { contenido: 'Queremos ver una Argentina donde la solidaridad y el trabajo en equipo sean valores cotidianos.', ciudad: 'San Juan' },
  { contenido: 'Soñamos con un sistema educativo que forme ciudadanos críticos, creativos y comprometidos con el bien común.', ciudad: 'Neuquén' },
  { contenido: 'Imaginamos un futuro donde la igualdad de género sea una realidad en todos los ámbitos de la sociedad.', ciudad: 'Bahía Blanca' },
];

// Ejemplos de VALORES
const valores = [
  { contenido: 'La solidaridad: creemos que ayudarnos mutuamente es la base de una sociedad fuerte y unida.', ciudad: 'Buenos Aires' },
  { contenido: 'La honestidad: valoramos la transparencia y la verdad en todas nuestras relaciones y acciones.', ciudad: 'Córdoba' },
  { contenido: 'El respeto: reconocemos la dignidad inherente de cada persona, sin importar su origen o condición.', ciudad: 'Rosario' },
  { contenido: 'La responsabilidad: entendemos que cada uno de nosotros tiene un papel en construir el futuro que queremos.', ciudad: 'Mendoza' },
  { contenido: 'La justicia: trabajamos por un país donde todos tengan las mismas oportunidades de prosperar.', ciudad: 'Tucumán' },
  { contenido: 'La empatía: ponernos en el lugar del otro nos permite construir puentes y entender nuestras diferencias.', ciudad: 'La Plata' },
  { contenido: 'La perseverancia: creemos que con esfuerzo y dedicación podemos superar cualquier desafío.', ciudad: 'Mar del Plata' },
  { contenido: 'La creatividad: valoramos las ideas innovadoras que pueden transformar nuestros problemas en oportunidades.', ciudad: 'Salta' },
  { contenido: 'La colaboración: sabemos que juntos podemos lograr mucho más que individualmente.', ciudad: 'Santa Fe' },
  { contenido: 'La esperanza: mantenemos viva la creencia de que un futuro mejor es posible.', ciudad: 'San Juan' },
  { contenido: 'La integridad: actuamos según nuestros valores, incluso cuando es difícil.', ciudad: 'Neuquén' },
  { contenido: 'La tolerancia: aceptamos y celebramos nuestras diferencias como fuente de riqueza cultural.', ciudad: 'Resistencia' },
];

// Ejemplos de NECESIDADES
const necesidades = [
  { contenido: 'Necesitamos más espacios de encuentro comunitario donde las personas puedan conocerse y colaborar.', ciudad: 'Buenos Aires' },
  { contenido: 'Urge mejorar el acceso a vivienda digna para las familias que hoy no pueden acceder a un hogar propio.', ciudad: 'Córdoba' },
  { contenido: 'Necesitamos programas de empleo juvenil que den oportunidades reales de inserción laboral a los jóvenes.', ciudad: 'Rosario' },
  { contenido: 'Es fundamental tener más centros de salud en barrios periféricos para atención primaria accesible.', ciudad: 'Mendoza' },
  { contenido: 'Necesitamos bibliotecas y centros culturales que fomenten la lectura y el aprendizaje continuo.', ciudad: 'Tucumán' },
  { contenido: 'Urge mejorar el transporte público para que sea accesible, seguro y eficiente para todos.', ciudad: 'La Plata' },
  { contenido: 'Necesitamos más programas de apoyo a emprendedores locales para generar desarrollo económico desde abajo.', ciudad: 'Mar del Plata' },
  { contenido: 'Es fundamental tener más espacios verdes y áreas recreativas en todos los barrios de la ciudad.', ciudad: 'Salta' },
  { contenido: 'Necesitamos sistemas de cuidado para adultos mayores y personas con discapacidad más accesibles.', ciudad: 'Santa Fe' },
  { contenido: 'Urge mejorar la conectividad a internet en zonas rurales para cerrar la brecha digital.', ciudad: 'San Juan' },
  { contenido: 'Necesitamos más programas de educación ambiental para crear conciencia sobre el cuidado del planeta.', ciudad: 'Neuquén' },
  { contenido: 'Es fundamental tener más apoyo para madres y padres solteros que trabajan y necesitan cuidado infantil.', ciudad: 'Bahía Blanca' },
];

// Ejemplos de ¡BASTA!
const bastas = [
  { contenido: '¡BASTA de corrupción! Exigimos transparencia y honestidad en todas las instituciones públicas.', ciudad: 'Buenos Aires' },
  { contenido: '¡BASTA de violencia de género! Necesitamos una sociedad donde todas las personas puedan vivir sin miedo.', ciudad: 'Córdoba' },
  { contenido: '¡BASTA de exclusión social! Todos merecemos las mismas oportunidades sin importar nuestro origen.', ciudad: 'Rosario' },
  { contenido: '¡BASTA de contaminación! Es hora de cuidar nuestro planeta para las futuras generaciones.', ciudad: 'Mendoza' },
  { contenido: '¡BASTA de trabajo precario! Exigimos empleos dignos con salarios justos y condiciones adecuadas.', ciudad: 'Tucumán' },
  { contenido: '¡BASTA de desigualdad educativa! Todos los niños merecen la misma calidad de educación.', ciudad: 'La Plata' },
  { contenido: '¡BASTA de polarización! Necesitamos diálogo constructivo para construir un país mejor juntos.', ciudad: 'Mar del Plata' },
  { contenido: '¡BASTA de impunidad! La justicia debe llegar a todos por igual, sin privilegios ni excepciones.', ciudad: 'Salta' },
  { contenido: '¡BASTA de desempleo juvenil! Los jóvenes necesitan oportunidades reales para desarrollar su potencial.', ciudad: 'Santa Fe' },
  { contenido: '¡BASTA de especulación inmobiliaria! El acceso a la vivienda no puede ser un lujo, es un derecho.', ciudad: 'San Juan' },
  { contenido: '¡BASTA de discriminación! Construyamos una sociedad donde todos seamos respetados por quienes somos.', ciudad: 'Neuquén' },
  { contenido: '¡BASTA de abandono de la educación pública! La educación es la base del futuro de nuestro país.', ciudad: 'Bahía Blanca' },
  { contenido: '¡BASTA de falta de atención en salud pública! Todos tenemos derecho a una atención médica de calidad.', ciudad: 'Posadas' },
  { contenido: '¡BASTA de explotación laboral! Exigimos condiciones de trabajo justas y respeto por los derechos de los trabajadores.', ciudad: 'Resistencia' },
];

// Función auxiliar para obtener coordenadas de una ciudad
function obtenerCoordenadas(ciudad) {
  const ciudadData = ciudades.find(c => c.nombre === ciudad);
  if (ciudadData) {
    return { lat: ciudadData.lat, lng: ciudadData.lng };
  }
  // Si no se encuentra, usar Buenos Aires como default
  return { lat: '-34.6037', lng: '-58.3816' };
}

// Preparar las sentencias SQL
const insertStmt = sqlite.prepare(`
  INSERT INTO dreams (type, dream, value, need, basta, location, latitude, longitude, created_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
`);

let contador = 0;

// Insertar SUEÑOS
console.log('✨ Insertando sueños...');
suenos.forEach((sueño) => {
  const coords = obtenerCoordenadas(sueño.ciudad);
  insertStmt.run('dream', sueño.contenido, null, null, null, sueño.ciudad, coords.lat, coords.lng);
  contador++;
});

// Insertar VALORES
console.log('💝 Insertando valores...');
valores.forEach((valor) => {
  const coords = obtenerCoordenadas(valor.ciudad);
  insertStmt.run('value', null, valor.contenido, null, null, valor.ciudad, coords.lat, coords.lng);
  contador++;
});

// Insertar NECESIDADES
console.log('🆘 Insertando necesidades...');
necesidades.forEach((necesidad) => {
  const coords = obtenerCoordenadas(necesidad.ciudad);
  insertStmt.run('need', null, null, necesidad.contenido, null, necesidad.ciudad, coords.lat, coords.lng);
  contador++;
});

// Insertar ¡BASTA!s
console.log('⚡ Insertando elementos de ¡BASTA!...');
bastas.forEach((basta) => {
  const coords = obtenerCoordenadas(basta.ciudad);
  insertStmt.run('basta', null, null, null, basta.contenido, basta.ciudad, coords.lat, coords.lng);
  contador++;
});

console.log(`✅ Se insertaron ${contador} elementos en el mapa:`);
console.log(`   - ${suenos.length} sueños`);
console.log(`   - ${valores.length} valores`);
console.log(`   - ${necesidades.length} necesidades`);
console.log(`   - ${bastas.length} elementos de ¡BASTA!`);
console.log(`\n📍 Ubicaciones distribuidas en ${ciudades.length} ciudades de Argentina`);

sqlite.close();
