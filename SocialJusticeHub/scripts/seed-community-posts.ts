// replaced
import { db } from './db-neon';
import { communityPosts } from '../shared/schema.js';

// removed sqlite
// using db from db-neon

const samplePosts = [
  {
    title: "Proyecto de Huerta Comunitaria en Villa Crespo",
    description: "Buscamos personas interesadas en crear una huerta comunitaria en el barrio. Tenemos el espacio y algunas herramientas, necesitamos manos voluntarias y conocimiento sobre agricultura urbana.",
    type: "project",
    location: "Villa Crespo, CABA",
    participants: 10,
    userId: 1,
    status: "active",
    views: 45,
    tags: JSON.stringify(["huerta", "comunidad", "sostenibilidad", "agricultura urbana"])
  },
  {
    title: "Clases de Inglés Gratuitas - Zona Norte",
    description: "Ofrezco clases de inglés básico e intermedio para adultos de forma gratuita. Soy profesora certificada y quiero contribuir a la educación de mi comunidad.",
    type: "volunteer",
    location: "San Isidro, Buenos Aires",
    participants: 15,
    userId: 1,
    status: "active",
    views: 32,
    tags: JSON.stringify(["educación", "inglés", "gratis", "comunidad"])
  },
  {
    title: "Intercambio: Muebles por Servicios de Plomería",
    description: "Tengo muebles en buen estado que ya no necesito. Busco alguien que pueda ayudarme con algunos arreglos de plomería en mi casa a cambio de estos muebles.",
    type: "exchange",
    location: "Palermo, CABA",
    participants: 1,
    userId: 1,
    status: "active",
    views: 28,
    tags: JSON.stringify(["intercambio", "muebles", "plomería", "trueque"])
  },
  {
    title: "Busco Trabajo: Desarrollador Web Frontend",
    description: "Soy desarrollador frontend con experiencia en React, TypeScript y Node.js. Busco oportunidades laborales en empresas que valoren el trabajo remoto y la flexibilidad horaria.",
    type: "employment",
    location: "Remoto",
    participants: 1,
    userId: 1,
    status: "active",
    views: 67,
    tags: JSON.stringify(["trabajo", "desarrollo", "frontend", "react", "remoto"])
  },
  {
    title: "Donación de Libros - Biblioteca Popular",
    description: "Tenemos más de 200 libros que queremos donar a una biblioteca popular o espacio comunitario. Incluye literatura argentina, historia, filosofía y novelas contemporáneas.",
    type: "donation",
    location: "Belgrano, CABA",
    participants: 5,
    userId: 1,
    status: "active",
    views: 41,
    tags: JSON.stringify(["donación", "libros", "biblioteca", "cultura"])
  },
  {
    title: "Mi Experiencia Organizando un Banco de Alimentos",
    description: "Comparto mi experiencia organizando un banco de alimentos en mi barrio durante la pandemia. Cómo empezamos, qué desafíos enfrentamos y los resultados que obtuvimos.",
    type: "story",
    location: "Flores, CABA",
    participants: null,
    userId: 1,
    status: "active",
    views: 89,
    tags: JSON.stringify(["experiencia", "banco de alimentos", "solidaridad", "comunidad"])
  },
  {
    title: "Iniciativa: Red de Apoyo Vecinal",
    description: "Proponemos crear una red de apoyo entre vecinos para situaciones de emergencia, cuidado de adultos mayores y ayuda mutua. ¿Quién se suma?",
    type: "action",
    location: "Caballito, CABA",
    participants: 20,
    userId: 1,
    status: "active",
    views: 56,
    tags: JSON.stringify(["red de apoyo", "vecinos", "solidaridad", "emergencia"])
  },
  {
    title: "Idea: App para Conectar Productores Locales",
    description: "Tengo la idea de crear una aplicación que conecte productores locales con consumidores, eliminando intermediarios. ¿Alguien con conocimientos técnicos se quiere sumar al proyecto?",
    type: "idea",
    location: "Argentina",
    participants: 5,
    userId: 1,
    status: "active",
    views: 73,
    tags: JSON.stringify(["app", "productores", "tecnología", "economía local"])
  },
  {
    title: "¿Cómo Organizar un Mercado de Trueque?",
    description: "Quiero organizar un mercado de trueque en mi barrio pero no sé por dónde empezar. ¿Alguien tiene experiencia en este tipo de eventos? ¿Qué permisos necesito?",
    type: "question",
    location: "Villa Urquiza, CABA",
    participants: null,
    userId: 1,
    status: "active",
    views: 34,
    tags: JSON.stringify(["trueque", "mercado", "organización", "permisos"])
  },
  {
    title: "Taller de Reparación de Bicicletas",
    description: "Organizo talleres gratuitos de reparación de bicicletas los fines de semana. Enseño mantenimiento básico y reparaciones comunes. ¡Trae tu bici!",
    type: "volunteer",
    location: "Parque Centenario, CABA",
    participants: 8,
    userId: 1,
    status: "active",
    views: 52,
    tags: JSON.stringify(["taller", "bicicletas", "reparación", "gratis"])
  }
];

async function seedCommunityPosts() {
  try {
    console.log('🌱 Seeding community posts...');
    
    // Clear existing posts
    await db.delete(communityPosts);
    console.log('✅ Cleared existing posts');
    
    // Insert sample posts
    for (const post of samplePosts) {
      await db.insert(communityPosts).values({
        ...post,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
    
    console.log(`✅ Inserted ${samplePosts.length} community posts`);
    console.log('🎉 Community posts seeding completed!');
    
  } catch (error) {
    console.error('❌ Error seeding community posts:', error);
  } finally {
    console.log('Done.');
  }
}

seedCommunityPosts();
