import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import { sql } from "drizzle-orm";
import { inspiringStories } from "../shared/schema-sqlite.js";

const dbPath = "./local.db";
const sqlite = new Database(dbPath);
const db = drizzle(sqlite);

async function migrateInspiringStories() {
  console.log("🚀 Iniciando migración de historias inspiradoras...");

  try {
    // Crear tabla de historias inspiradoras
    await db.run(sql`
      CREATE TABLE IF NOT EXISTS inspiring_stories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        excerpt TEXT NOT NULL,
        content TEXT NOT NULL,
        author_id INTEGER REFERENCES users(id),
        author_name TEXT,
        author_email TEXT,
        category TEXT NOT NULL CHECK (category IN ('employment', 'volunteering', 'community_project', 'personal_growth', 'resource_sharing', 'connection')),
        location TEXT NOT NULL,
        province TEXT,
        city TEXT,
        impact_type TEXT NOT NULL CHECK (impact_type IN ('job_created', 'lives_changed', 'hours_volunteered', 'people_helped', 'project_completed', 'resource_shared')),
        impact_count INTEGER NOT NULL,
        impact_description TEXT NOT NULL,
        image_url TEXT,
        video_url TEXT,
        verified BOOLEAN DEFAULT FALSE,
        featured BOOLEAN DEFAULT FALSE,
        status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'draft')),
        moderated_by INTEGER REFERENCES users(id),
        moderated_at TEXT,
        moderation_notes TEXT,
        views INTEGER DEFAULT 0,
        likes INTEGER DEFAULT 0,
        shares INTEGER DEFAULT 0,
        tags TEXT,
        related_post_id INTEGER REFERENCES community_posts(id),
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        published_at TEXT
      )
    `);

    console.log("✅ Tabla inspiring_stories creada exitosamente");

    // Insertar historias de ejemplo
    const sampleStories = [
      {
        title: "María encontró su trabajo soñado",
        excerpt: "Después de 6 meses buscando empleo, María conectó con una oportunidad que cambió su vida a través de nuestra comunidad.",
        content: `María González, una contadora de 32 años de Buenos Aires, había estado buscando empleo durante 6 meses después de que su empresa anterior cerrara. 

"Estaba perdiendo la esperanza", recuerda María. "Había enviado más de 200 CVs sin éxito. Entonces encontré una oferta en la comunidad ¡BASTA! que realmente resonó conmigo."

La oferta era para una posición de contadora senior en una empresa social que trabaja con comunidades vulnerables. "No solo era un trabajo, sino una oportunidad de hacer algo que realmente importa", explica María.

"El proceso fue increíblemente humano. En lugar de un formulario genérico, pude contar mi historia y explicar por qué este trabajo era perfecto para mí. Y la empresa pudo ver más allá de mi CV."

María fue contratada y ahora lleva 8 meses en su nuevo trabajo. "No solo encontré empleo, encontré mi propósito. Cada día voy a trabajar sabiendo que estoy contribuyendo a algo más grande que yo mismo."

Su historia inspiró a otros 15 miembros de la comunidad a postularse a oportunidades similares, y 8 de ellos también encontraron empleo.`,
        authorId: null,
        authorName: "María González",
        authorEmail: "maria.gonzalez@email.com",
        category: "employment",
        location: "Buenos Aires, Argentina",
        province: "Buenos Aires",
        city: "Buenos Aires",
        impactType: "job_created",
        impactCount: 1,
        impactDescription: "1 empleo creado",
        imageUrl: null,
        videoUrl: null,
        verified: true,
        featured: true,
        status: "approved",
        moderatedBy: null,
        moderatedAt: new Date().toISOString(),
        moderationNotes: "Historia verificada por contacto directo",
        views: 156,
        likes: 23,
        shares: 8,
        tags: JSON.stringify(["empleo", "transformación", "oportunidad", "contabilidad"]),
        relatedPostId: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        publishedAt: new Date().toISOString(),
      },
      {
        title: "Proyecto de reciclaje que transformó un barrio",
        excerpt: "Carlos y su comunidad lograron reducir los residuos en un 70% y crear 12 empleos locales a través de un proyecto colaborativo.",
        content: `Carlos Mendoza, un vecino de Villa Crespo, siempre había estado preocupado por la cantidad de basura en su barrio. "Veía cómo los residuos se acumulaban y nadie hacía nada", recuerda.

"Un día publiqué en ¡BASTA! mi idea de crear un sistema de reciclaje comunitario. No esperaba mucho, pero la respuesta fue increíble."

En dos semanas, Carlos había conectado con 15 vecinos interesados, 3 organizaciones ambientales y 2 empresas que querían apoyar el proyecto.

"Lo que empezó como una idea simple se convirtió en algo mucho más grande. Creamos un sistema de recolección diferenciada, capacitamos a 50 familias, y establecimos alianzas con recicladores locales."

El proyecto no solo redujo los residuos del barrio en un 70%, sino que también creó 12 empleos locales en el sector del reciclaje.

"Lo más hermoso fue ver cómo la comunidad se unió. Vecinos que nunca se hablaban ahora trabajan juntos por un objetivo común."

El proyecto se ha replicado en otros 3 barrios de la ciudad, y Carlos ahora asesora a otras comunidades que quieren implementar sistemas similares.`,
        authorId: null,
        authorName: "Carlos Mendoza",
        authorEmail: "carlos.mendoza@email.com",
        category: "community_project",
        location: "Villa Crespo, Buenos Aires",
        province: "Buenos Aires",
        city: "Buenos Aires",
        impactType: "lives_changed",
        impactCount: 200,
        impactDescription: "200 vidas impactadas",
        imageUrl: null,
        videoUrl: null,
        verified: true,
        featured: true,
        status: "approved",
        moderatedBy: null,
        moderatedAt: new Date().toISOString(),
        moderationNotes: "Proyecto verificado con evidencia fotográfica y testimonios",
        views: 89,
        likes: 34,
        shares: 15,
        tags: JSON.stringify(["medio ambiente", "comunidad", "reciclaje", "sostenibilidad"]),
        relatedPostId: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        publishedAt: new Date().toISOString(),
      },
      {
        title: "Ana compartió recursos educativos y ayudó a 20 familias",
        excerpt: "Una maestra retirada decidió compartir sus materiales educativos y terminó creando una red de apoyo para familias con dificultades de aprendizaje.",
        content: `Ana Rodríguez, una maestra de primaria jubilada de 65 años, había acumulado más de 30 años de materiales educativos en su casa.

"Sabía que tenía recursos valiosos que podrían ayudar a otros, pero no sabía cómo compartirlos de manera efectiva", explica Ana.

"Cuando descubrí ¡BASTA!, publiqué que tenía materiales educativos para compartir. No esperaba la respuesta que recibí."

En el primer mes, Ana había compartido materiales con 20 familias de diferentes barrios. "No solo les di libros y cuadernos, sino que también les brindé apoyo y orientación."

"Una madre me escribió diciendo que su hijo había mejorado significativamente en matemáticas gracias a los ejercicios que le compartí. Eso me llenó el corazón."

Ana no se detuvo ahí. Organizó sesiones virtuales de tutoría para niños con dificultades de aprendizaje y creó una red de apoyo entre las familias.

"Lo más hermoso fue ver cómo las familias se ayudaban entre sí. Una madre que había recibido ayuda ahora ayudaba a otra."

Ana ha compartido más de 500 materiales educativos y ha impactado directamente en la educación de 50 niños. Su iniciativa inspiró a otros 10 educadores a compartir sus recursos.`,
        authorId: null,
        authorName: "Ana Rodríguez",
        authorEmail: "ana.rodriguez@email.com",
        category: "resource_sharing",
        location: "La Plata, Buenos Aires",
        province: "Buenos Aires",
        city: "La Plata",
        impactType: "people_helped",
        impactCount: 70,
        impactDescription: "70 personas ayudadas",
        imageUrl: null,
        videoUrl: null,
        verified: true,
        featured: false,
        status: "approved",
        moderatedBy: null,
        moderatedAt: new Date().toISOString(),
        moderationNotes: "Historia verificada con testimonios de familias beneficiadas",
        views: 67,
        likes: 28,
        shares: 12,
        tags: JSON.stringify(["educación", "recursos", "apoyo", "comunidad"]),
        relatedPostId: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        publishedAt: new Date().toISOString(),
      },
      {
        title: "Roberto pasó de desempleado a emprendedor",
        excerpt: "Un padre de familia encontró en ¡BASTA! no solo apoyo emocional, sino también los recursos y conexiones necesarias para iniciar su propio negocio.",
        content: `Roberto Silva, un padre de familia de 45 años, había perdido su trabajo en una empresa de construcción y estaba luchando para mantener a su familia.

"Estaba desesperado. Tenía habilidades en carpintería, pero no sabía cómo convertir eso en un negocio", recuerda Roberto.

"Publicar en ¡BASTA! mi situación fue difícil, pero necesitaba ayuda. La respuesta de la comunidad me sorprendió."

Roberto recibió no solo apoyo emocional, sino también consejos prácticos sobre cómo iniciar un negocio, contactos con proveedores de materiales, y ofertas de trabajo temporal mientras desarrollaba su emprendimiento.

"Una persona me conectó con un arquitecto que necesitaba muebles personalizados. Esa fue mi primera gran oportunidad."

Con el apoyo de la comunidad, Roberto estableció "Muebles Silva", un taller de carpintería personalizada. "No solo estoy trabajando, sino que estoy haciendo lo que amo."

En 8 meses, Roberto ha creado 3 empleos adicionales y ha servido a más de 50 clientes. "¡BASTA! no solo me ayudó a encontrar trabajo, me ayudó a crear mi propio futuro."

Su historia ha inspirado a otros 12 miembros de la comunidad a explorar el emprendimiento como una alternativa al empleo tradicional.`,
        authorId: null,
        authorName: "Roberto Silva",
        authorEmail: "roberto.silva@email.com",
        category: "personal_growth",
        location: "San Miguel, Buenos Aires",
        province: "Buenos Aires",
        city: "San Miguel",
        impactType: "job_created",
        impactCount: 4,
        impactDescription: "4 empleos creados",
        imageUrl: null,
        videoUrl: null,
        verified: true,
        featured: false,
        status: "approved",
        moderatedBy: null,
        moderatedAt: new Date().toISOString(),
        moderationNotes: "Emprendimiento verificado con evidencia de registro comercial",
        views: 112,
        likes: 45,
        shares: 18,
        tags: JSON.stringify(["emprendimiento", "carpintería", "transformación", "empleo"]),
        relatedPostId: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        publishedAt: new Date().toISOString(),
      },
      {
        title: "Voluntariado que cambió vidas en un hogar de ancianos",
        excerpt: "Un grupo de 12 voluntarios coordinados a través de ¡BASTA! transformó la experiencia de vida de 30 residentes de un hogar de ancianos.",
        content: `Lucía Fernández, una estudiante de psicología de 22 años, siempre había querido hacer voluntariado pero no sabía por dónde empezar.

"Publicé en ¡BASTA! que quería hacer voluntariado y estaba abierta a cualquier causa. No esperaba que tantas personas respondieran."

Lucía se conectó con 11 otros voluntarios que tenían intereses similares. Juntos decidieron enfocarse en un hogar de ancianos en su barrio.

"Lo que empezó como visitas individuales se convirtió en un programa estructurado de actividades semanales."

El grupo organizó actividades como lectura en voz alta, manualidades, música, y simplemente conversación. "Muchos de estos abuelos no tenían visitas regulares", explica Lucía.

"Ver cómo sus caras se iluminaban cuando llegábamos era increíble. No solo los ayudamos a ellos, sino que ellos nos enseñaron tanto a nosotros."

El programa ha estado funcionando por 6 meses y ha impactado directamente a 30 residentes del hogar. "Hemos creado verdaderas amistades intergeneracionales."

Lucía y su equipo han inspirado a otros 25 voluntarios a iniciar programas similares en otros hogares de ancianos de la ciudad.`,
        authorId: null,
        authorName: "Lucía Fernández",
        authorEmail: "lucia.fernandez@email.com",
        category: "volunteering",
        location: "Palermo, Buenos Aires",
        province: "Buenos Aires",
        city: "Buenos Aires",
        impactType: "hours_volunteered",
        impactCount: 480,
        impactDescription: "480 horas de voluntariado",
        imageUrl: null,
        videoUrl: null,
        verified: true,
        featured: false,
        status: "approved",
        moderatedBy: null,
        moderatedAt: new Date().toISOString(),
        moderationNotes: "Programa verificado con certificación del hogar de ancianos",
        views: 78,
        likes: 31,
        shares: 14,
        tags: JSON.stringify(["voluntariado", "ancianos", "comunidad", "intergeneracional"]),
        relatedPostId: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        publishedAt: new Date().toISOString(),
      }
    ];

    // Insertar historias de ejemplo
    for (const story of sampleStories) {
      await db.run(sql`
        INSERT INTO inspiring_stories (
          title, excerpt, content, author_id, author_name, author_email,
          category, location, province, city, impact_type, impact_count,
          impact_description, image_url, video_url, verified, featured,
          status, moderated_by, moderated_at, moderation_notes, views,
          likes, shares, tags, related_post_id, created_at, updated_at, published_at
        ) VALUES (
          ${story.title}, ${story.excerpt}, ${story.content}, ${story.authorId || null},
          ${story.authorName}, ${story.authorEmail}, ${story.category}, ${story.location},
          ${story.province}, ${story.city}, ${story.impactType}, ${story.impactCount},
          ${story.impactDescription}, ${story.imageUrl || null}, ${story.videoUrl || null}, 
          ${story.verified ? 1 : 0}, ${story.featured ? 1 : 0}, ${story.status}, 
          ${story.moderatedBy || null}, ${story.moderatedAt}, ${story.moderationNotes},
          ${story.views}, ${story.likes}, ${story.shares}, ${story.tags}, 
          ${story.relatedPostId || null}, ${story.createdAt}, ${story.updatedAt}, ${story.publishedAt}
        )
      `);
    }

    console.log(`✅ ${sampleStories.length} historias de ejemplo insertadas exitosamente`);

    // Crear índices para mejorar el rendimiento
    await db.run(sql`CREATE INDEX IF NOT EXISTS idx_inspiring_stories_category ON inspiring_stories(category)`);
    await db.run(sql`CREATE INDEX IF NOT EXISTS idx_inspiring_stories_status ON inspiring_stories(status)`);
    await db.run(sql`CREATE INDEX IF NOT EXISTS idx_inspiring_stories_featured ON inspiring_stories(featured)`);
    await db.run(sql`CREATE INDEX IF NOT EXISTS idx_inspiring_stories_location ON inspiring_stories(province, city)`);
    await db.run(sql`CREATE INDEX IF NOT EXISTS idx_inspiring_stories_impact_type ON inspiring_stories(impact_type)`);
    await db.run(sql`CREATE INDEX IF NOT EXISTS idx_inspiring_stories_published_at ON inspiring_stories(published_at)`);

    console.log("✅ Índices creados exitosamente");

    console.log("🎉 Migración de historias inspiradoras completada exitosamente");

  } catch (error) {
    console.error("❌ Error durante la migración:", error);
    throw error;
  } finally {
    sqlite.close();
  }
}

// Ejecutar migración si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  migrateInspiringStories().catch(console.error);
}

export { migrateInspiringStories };
