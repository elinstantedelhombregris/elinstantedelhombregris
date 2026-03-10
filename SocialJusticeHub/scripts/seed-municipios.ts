import { db, schema } from './db-neon';
import { eq, and } from 'drizzle-orm';

const { geographicLocations } = schema;

// Complete list of Argentine municipalities/partidos organized by province
const municipiosPorProvincia: Record<string, string[]> = {
  'Buenos Aires': [
    'Adolfo Alsina', 'Adolfo Gonzales Chaves', 'Alberti', 'Almirante Brown',
    'Arrecifes', 'Avellaneda', 'Ayacucho', 'Azul', 'Bahía Blanca', 'Balcarce',
    'Baradero', 'Benito Juárez', 'Berazategui', 'Berisso', 'Bolívar', 'Bragado',
    'Brandsen', 'Campana', 'Cañuelas', 'Capitán Sarmiento', 'Carlos Casares',
    'Carlos Tejedor', 'Carmen de Areco', 'Castelli', 'Chacabuco', 'Chascomús',
    'Chivilcoy', 'Colón', 'Coronel de Marina Leonardo Rosales', 'Coronel Dorrego',
    'Coronel Pringles', 'Coronel Suárez', 'Daireaux', 'Dolores', 'Ensenada',
    'Escobar', 'Esteban Echeverría', 'Exaltación de la Cruz', 'Ezeiza',
    'Florencio Varela', 'Florentino Ameghino', 'General Alvarado', 'General Alvear',
    'General Arenales', 'General Belgrano', 'General Guido', 'General Juan Madariaga',
    'General La Madrid', 'General Las Heras', 'General Lavalle', 'General Paz',
    'General Pinto', 'General Pueyrredón', 'General Rodríguez', 'General San Martín',
    'General Viamonte', 'General Villegas', 'Guaminí', 'Hipólito Yrigoyen',
    'Hurlingham', 'Ituzaingó', 'José C. Paz', 'Junín', 'La Costa', 'La Matanza',
    'La Plata', 'Lanús', 'Laprida', 'Las Flores', 'Leandro N. Alem', 'Lezama',
    'Lincoln', 'Lobería', 'Lobos', 'Lomas de Zamora', 'Luján', 'Magdalena',
    'Maipú', 'Malvinas Argentinas', 'Mar Chiquita', 'Marcos Paz', 'Mercedes',
    'Merlo', 'Monte', 'Monte Hermoso', 'Moreno', 'Morón', 'Navarro', 'Necochea',
    'Nueve de Julio', 'Olavarría', 'Patagones', 'Pehuajó', 'Pellegrini',
    'Pergamino', 'Pila', 'Pilar', 'Pinamar', 'Presidente Perón', 'Puan',
    'Quilmes', 'Ramallo', 'Rauch', 'Rivadavia', 'Rojas', 'Roque Pérez',
    'Saavedra', 'Saladillo', 'Salliqueló', 'Salto', 'San Andrés de Giles',
    'San Antonio de Areco', 'San Cayetano', 'San Fernando', 'San Isidro',
    'San Miguel', 'San Nicolás', 'San Pedro', 'San Vicente', 'Suipacha',
    'Tandil', 'Tapalqué', 'Tigre', 'Tordillo', 'Tornquist', 'Trenque Lauquen',
    'Tres Arroyos', 'Tres de Febrero', 'Tres Lomas', 'Veinticinco de Mayo',
    'Vicente López', 'Villa Gesell', 'Zárate',
  ],

  'Ciudad Autónoma de Buenos Aires': [
    'Comuna 1 (Retiro, San Nicolás, Puerto Madero, San Telmo, Montserrat, Constitución)',
    'Comuna 2 (Recoleta)',
    'Comuna 3 (Balvanera, San Cristóbal)',
    'Comuna 4 (La Boca, Barracas, Parque Patricios, Nueva Pompeya)',
    'Comuna 5 (Almagro, Boedo)',
    'Comuna 6 (Caballito)',
    'Comuna 7 (Flores, Parque Chacabuco)',
    'Comuna 8 (Villa Soldati, Villa Riachuelo, Villa Lugano)',
    'Comuna 9 (Liniers, Mataderos, Parque Avellaneda)',
    'Comuna 10 (Villa Real, Monte Castro, Versalles, Floresta, Vélez Sársfield, Villa Luro)',
    'Comuna 11 (Villa General Mitre, Villa Devoto, Villa del Parque, Villa Santa Rita)',
    'Comuna 12 (Coghlan, Saavedra, Villa Urquiza, Villa Pueyrredón)',
    'Comuna 13 (Núñez, Belgrano, Colegiales)',
    'Comuna 14 (Palermo)',
    'Comuna 15 (Chacarita, Villa Crespo, La Paternal, Villa Ortúzar, Agronomía, Parque Chas)',
  ],

  'Catamarca': [
    'Ambato', 'Ancasti', 'Andalgalá', 'Antofagasta de la Sierra', 'Belén',
    'Capayán', 'Capital', 'El Alto', 'Fray Mamerto Esquiú', 'La Paz',
    'Paclín', 'Pomán', 'Santa María', 'Santa Rosa', 'Tinogasta', 'Valle Viejo',
  ],

  'Chaco': [
    'Almirante Brown', 'Bermejo', 'Chacabuco', 'Comandante Fernández',
    'Doce de Octubre', 'Dos de Abril', 'Fray Justo Santa María de Oro',
    'General Belgrano', 'General Donovan', 'General Güemes', 'Independencia',
    'Libertad', 'Libertador General San Martín', 'Maipú', 'Mayor Luis J. Fontana',
    'Nueve de Julio', 'O\'Higgins', 'Presidencia de la Plaza', 'Primero de Mayo',
    'Quitilipi', 'San Fernando', 'San Lorenzo', 'Sargento Cabral',
    'Tapenagá', 'Veinticinco de Mayo',
  ],

  'Chubut': [
    'Biedma', 'Cushamen', 'Escalante', 'Florentino Ameghino', 'Futaleufú',
    'Gaiman', 'Gastre', 'Languiñeo', 'Mártires', 'Paso de Indios',
    'Rawson', 'Río Senguer', 'Sarmiento', 'Tehuelches', 'Telsen',
  ],

  'Córdoba': [
    'Calamuchita', 'Capital', 'Colón', 'Cruz del Eje', 'General Roca',
    'General San Martín', 'Ischilín', 'Juárez Celman', 'Marcos Juárez',
    'Minas', 'Pocho', 'Presidente Roque Sáenz Peña', 'Punilla', 'Río Cuarto',
    'Río Primero', 'Río Seco', 'Río Segundo', 'San Alberto', 'San Javier',
    'San Justo', 'Santa María', 'Sobremonte', 'Tercero Arriba', 'Totoral',
    'Tulumba', 'Unión',
  ],

  'Corrientes': [
    'Bella Vista', 'Berón de Astrada', 'Capital', 'Concepción', 'Curuzú Cuatiá',
    'Empedrado', 'Esquina', 'General Alvear', 'General Paz', 'Goya',
    'Itatí', 'Ituzaingó', 'Lavalle', 'Mburucuyá', 'Mercedes', 'Monte Caseros',
    'Paso de los Libres', 'Saladas', 'San Cosme', 'San Luis del Palmar',
    'San Martín', 'San Miguel', 'San Roque', 'Santo Tomé', 'Sauce',
  ],

  'Entre Ríos': [
    'Colón', 'Concordia', 'Diamante', 'Federación', 'Federal', 'Feliciano',
    'Gualeguay', 'Gualeguaychú', 'Islas del Ibicuy', 'La Paz', 'Nogoyá',
    'Paraná', 'San Salvador', 'Tala', 'Uruguay', 'Victoria', 'Villaguay',
  ],

  'Formosa': [
    'Bermejo', 'Formosa', 'Laishí', 'Matacos', 'Patiño', 'Pilagás',
    'Pilcomayo', 'Pirané', 'Ramón Lista',
  ],

  'Jujuy': [
    'Cochinoca', 'El Carmen', 'Doctor Manuel Belgrano', 'Humahuaca',
    'Ledesma', 'Palpalá', 'Rinconada', 'San Antonio', 'San Pedro',
    'Santa Bárbara', 'Santa Catalina', 'Susques', 'Tilcara', 'Tumbaya',
    'Valle Grande', 'Yavi',
  ],

  'La Pampa': [
    'Atreucó', 'Caleu Caleu', 'Capital', 'Catriló', 'Chalileo', 'Chapaleufú',
    'Chical Co', 'Conhelo', 'Curacó', 'Guatraché', 'Hucal', 'Lihuel Calel',
    'Limay Mahuida', 'Loventué', 'Maracó', 'Puelén', 'Quemú Quemú',
    'Rancul', 'Realicó', 'Toay', 'Trenel', 'Utracán',
  ],

  'La Rioja': [
    'Arauco', 'Capital', 'Castro Barros', 'Chamical', 'Chilecito',
    'Coronel Felipe Varela', 'Famatina', 'General Ángel V. Peñaloza',
    'General Belgrano', 'General Juan Facundo Quiroga', 'General Lamadrid',
    'General Ocampo', 'General San Martín', 'Independencia',
    'Rosario Vera Peñaloza', 'San Blas de los Sauces', 'Sanagasta',
    'Vinchina',
  ],

  'Mendoza': [
    'Capital', 'General Alvear', 'Godoy Cruz', 'Guaymallén', 'Junín',
    'La Paz', 'Las Heras', 'Lavalle', 'Luján de Cuyo', 'Maipú', 'Malargüe',
    'Rivadavia', 'San Carlos', 'San Martín', 'San Rafael', 'Santa Rosa',
    'Tunuyán', 'Tupungato',
  ],

  'Misiones': [
    'Apóstoles', 'Cainguás', 'Candelaria', 'Capital', 'Concepción',
    'Eldorado', 'General Manuel Belgrano', 'Guaraní', 'Iguazú',
    'Leandro N. Alem', 'Libertador General San Martín', 'Montecarlo',
    'Oberá', 'San Ignacio', 'San Javier', 'San Pedro', 'Veinticinco de Mayo',
  ],

  'Neuquén': [
    'Aluminé', 'Añelo', 'Catán Lil', 'Chos Malal', 'Collón Curá',
    'Confluencia', 'Huiliches', 'Lácar', 'Loncopué', 'Los Lagos',
    'Minas', 'Ñorquín', 'Pehuenches', 'Picún Leufú', 'Picunches',
    'Zapala',
  ],

  'Río Negro': [
    'Adolfo Alsina', 'Avellaneda', 'Bariloche', 'Conesa', 'El Cuy',
    'General Roca', 'Nueve de Julio', 'Ñorquincó', 'Pichi Mahuida',
    'Pilcaniyeu', 'San Antonio', 'Valcheta', 'Veinticinco de Mayo',
  ],

  'Salta': [
    'Anta', 'Cachi', 'Cafayate', 'Capital', 'Cerrillos', 'Chicoana',
    'General Güemes', 'General José de San Martín', 'Guachipas', 'Iruya',
    'La Caldera', 'La Candelaria', 'La Poma', 'La Viña', 'Los Andes',
    'Metán', 'Molinos', 'Orán', 'Rivadavia', 'Rosario de la Frontera',
    'Rosario de Lerma', 'San Carlos', 'Santa Victoria',
  ],

  'San Juan': [
    'Albardón', 'Angaco', 'Calingasta', 'Capital', 'Caucete', 'Chimbas',
    'Iglesia', 'Jáchal', 'Nueve de Julio', 'Pocito', 'Rawson',
    'Rivadavia', 'San Martín', 'Santa Lucía', 'Sarmiento', 'Ullum',
    'Valle Fértil', 'Veinticinco de Mayo', 'Zonda',
  ],

  'San Luis': [
    'Ayacucho', 'Belgrano', 'Chacabuco', 'Coronel Pringles',
    'General Pedernera', 'Gobernador Dupuy', 'Junín', 'La Capital',
    'Libertador General San Martín',
  ],

  'Santa Cruz': [
    'Corpen Aike', 'Deseado', 'Güer Aike', 'Lago Argentino', 'Lago Buenos Aires',
    'Magallanes', 'Río Chico',
  ],

  'Santa Fe': [
    'Belgrano', 'Caseros', 'Castellanos', 'Constitución', 'Garay',
    'General López', 'General Obligado', 'Iriondo', 'La Capital', 'Las Colonias',
    'Nueve de Julio', 'Rosario', 'San Cristóbal', 'San Javier', 'San Jerónimo',
    'San Justo', 'San Lorenzo', 'San Martín', 'Vera',
  ],

  'Santiago del Estero': [
    'Aguirre', 'Alberdi', 'Atamisqui', 'Avellaneda', 'Banda', 'Belgrano',
    'Capital', 'Copo', 'Choya', 'Figueroa', 'General Taboada', 'Guasayán',
    'Jiménez', 'Juan F. Ibarra', 'Loreto', 'Mitre', 'Moreno', 'Ojo de Agua',
    'Pellegrini', 'Quebrachos', 'Río Hondo', 'Rivadavia', 'Robles',
    'Salavina', 'San Martín', 'Sarmiento', 'Silípica',
  ],

  'Tierra del Fuego': [
    'Río Grande', 'Tolhuin', 'Ushuaia',
  ],

  'Tucumán': [
    'Burruyacú', 'Capital', 'Chicligasta', 'Cruz Alta', 'Famaillá',
    'Graneros', 'Juan Bautista Alberdi', 'La Cocha', 'Leales', 'Lules',
    'Monteros', 'Río Chico', 'Simoca', 'Tafí del Valle', 'Tafí Viejo',
    'Trancas', 'Yerba Buena',
  ],
};

async function seedMunicipios() {
  console.log('Deleting existing city entries...');
  await db.delete(geographicLocations).where(eq(geographicLocations.type, 'city'));

  // Get all provinces
  const provinces = await db.select().from(geographicLocations)
    .where(eq(geographicLocations.type, 'province'));

  const provinceMap = new Map(provinces.map(p => [p.name, p.id]));

  let totalInserted = 0;

  for (const [provinceName, municipios] of Object.entries(municipiosPorProvincia)) {
    const provinceId = provinceMap.get(provinceName);
    if (!provinceId) {
      console.warn(`Province not found: ${provinceName}`);
      continue;
    }

    console.log(`Inserting ${municipios.length} municipios for ${provinceName}...`);

    // Insert in batches of 50
    for (let i = 0; i < municipios.length; i += 50) {
      const batch = municipios.slice(i, i + 50);
      const values = batch.map(name => ({
        name,
        type: 'city' as const,
        parentId: provinceId,
        country: 'Argentina',
      }));

      await db.insert(geographicLocations).values(values);
      totalInserted += batch.length;
    }
  }

  console.log(`Done! Inserted ${totalInserted} municipios across ${Object.keys(municipiosPorProvincia).length} provinces.`);
}

seedMunicipios()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Failed:', err);
    process.exit(1);
  });
