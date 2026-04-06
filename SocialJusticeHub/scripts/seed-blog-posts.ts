import { db, schema } from './db-neon';
const { blogPosts, postTags } = schema;
import { blogContentUpdates } from "../shared/blogContent";

// Crear función para generar slug
function createSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remover caracteres especiales
    .replace(/\s+/g, '-') // Reemplazar espacios con guiones
    .replace(/-+/g, '-') // Reemplazar múltiples guiones con uno solo
    .trim();
}

// Posts de blog con contenido completo
const baseBlogPostsData = [
  {
    title: "El Cansancio Sagrado: Por qué ya no podemos esperar",
    slug: createSlug("El Cansancio Sagrado: Por qué ya no podemos esperar"),
    category: "Filosofía",
    type: "blog" as const,
    featured: true,
    imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=400&fit=crop",
    authorId: 1,
    publishedAt: new Date("2025-05-05").toISOString(),
    tags: ["transformación", "cansancio", "acción", "filosofía", "liderazgo"],
  },
  {
    title: "La Amabilidad como Ingeniería Social",
    slug: createSlug("La Amabilidad como Ingeniería Social"),
    category: "Valores",
    type: "blog" as const,
    featured: false,
    imageUrl: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800&h=400&fit=crop",
    authorId: 1,
    publishedAt: new Date("2025-06-09").toISOString(),
    tags: ["amabilidad", "comunidad", "ingeniería social", "transformación", "cultura"],
  },
  {
    title: "Diseño Idealizado: La Argentina Posible",
    slug: createSlug("Diseño Idealizado: La Argentina Posible"),
    category: "Visión",
    type: "blog" as const,
    featured: true,
    imageUrl: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=800&h=400&fit=crop",
    authorId: 1,
    publishedAt: new Date("2025-07-14").toISOString(),
    tags: ["diseño", "visión", "Argentina", "transformación", "planificación"],
  },
  {
    title: "El Poder del Pensamiento Sistémico en la Transformación Social",
    slug: createSlug("El Poder del Pensamiento Sistémico en la Transformación Social"),
    category: "Análisis",
    type: "blog" as const,
    featured: false,
    imageUrl: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=800&h=400&fit=crop",
    authorId: 1,
    publishedAt: new Date("2025-08-11").toISOString(),
    tags: ["pensamiento sistémico", "transformación", "análisis", "sociedad", "estrategia"],
  },
  {
    title: "La Ética del Servicio: Construyendo una Sociedad de Servidores",
    slug: createSlug("La Ética del Servicio: Construyendo una Sociedad de Servidores"),
    category: "Valores",
    type: "blog" as const,
    featured: false,
    imageUrl: "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800&h=400&fit=crop",
    authorId: 1,
    publishedAt: new Date("2025-09-01").toISOString(),
    tags: ["ética", "servicio", "valores", "transformación", "comunidad"],
  },
  {
    title: "Aprender para Ser Libres: La Educación como Acto de Soberanía",
    slug: createSlug("Aprender para Ser Libres: La Educación como Acto de Soberanía"),
    category: "Filosofía",
    type: "blog" as const,
    featured: true,
    imageUrl: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&h=400&fit=crop",
    authorId: 1,
    publishedAt: new Date("2025-09-22").toISOString(),
    tags: ["educación", "soberanía", "autodidacta", "transformación", "libertad"],
  },
  {
    title: "La Ciencia de la Confianza: El Capital que Nadie Mide pero Todos Necesitan",
    slug: createSlug("La Ciencia de la Confianza: El Capital que Nadie Mide pero Todos Necesitan"),
    category: "Análisis",
    type: "blog" as const,
    featured: false,
    imageUrl: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&h=400&fit=crop",
    authorId: 1,
    publishedAt: new Date("2025-10-13").toISOString(),
    tags: ["confianza", "capital social", "comunidad", "cooperación", "ciencia"],
  },
  {
    title: "Por Qué Nos Resistimos a Cambiar: La Psicología de la Transformación",
    slug: createSlug("Por Qué Nos Resistimos a Cambiar: La Psicología de la Transformación"),
    category: "Filosofía",
    type: "blog" as const,
    featured: true,
    imageUrl: "https://images.unsplash.com/photo-1494500764479-0c8f2919a3d8?w=800&h=400&fit=crop",
    authorId: 1,
    publishedAt: new Date("2025-11-03").toISOString(),
    tags: ["psicología", "cambio", "resistencia", "transformación", "neurociencia"],
  },
  {
    title: "Inteligencia Colectiva: Por Qué Juntos Pensamos Mejor de lo que Creemos",
    slug: createSlug("Inteligencia Colectiva: Por Qué Juntos Pensamos Mejor de lo que Creemos"),
    category: "Visión",
    type: "blog" as const,
    featured: false,
    imageUrl: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=400&fit=crop",
    authorId: 1,
    publishedAt: new Date("2025-11-24").toISOString(),
    tags: ["inteligencia colectiva", "comunidad", "sabiduría", "cooperación", "diseño"],
  },
  {
    title: "Lo Que Le Debemos al Futuro: Responsabilidad Intergeneracional como Diseño",
    slug: createSlug("Lo Que Le Debemos al Futuro: Responsabilidad Intergeneracional como Diseño"),
    category: "Visión",
    type: "blog" as const,
    featured: true,
    imageUrl: "https://images.unsplash.com/photo-1476234251651-f353b5e73ae8?w=800&h=400&fit=crop",
    authorId: 1,
    publishedAt: new Date("2025-12-15").toISOString(),
    tags: ["legado", "futuro", "responsabilidad", "intergeneracional", "diseño"],
  },
  {
    title: "Las Fuerzas del Cielo: El Poder que ya Tenés y Nadie te Enseñó a Usar",
    slug: createSlug("Las Fuerzas del Cielo: El Poder que ya Tenés y Nadie te Enseñó a Usar"),
    category: "Filosofía",
    type: "blog" as const,
    featured: true,
    imageUrl: "https://images.unsplash.com/photo-1507400492013-162706c8c05e?w=800&h=400&fit=crop",
    authorId: 1,
    publishedAt: new Date("2026-01-12").toISOString(),
    tags: ["imaginación", "creación", "cielo", "pensamiento", "transformación"],
  },
  {
    title: "Sistemas vs. Síntomas: Cómo Pensar como Ingeniero Social",
    slug: createSlug("Sistemas vs. Síntomas: Cómo Pensar como Ingeniero Social"),
    category: "Análisis",
    type: "blog" as const,
    featured: true,
    imageUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=400&fit=crop",
    authorId: 1,
    publishedAt: new Date("2026-02-03").toISOString(),
    tags: ["sistemas", "ingeniería social", "pensamiento sistémico", "análisis", "transformación"],
  },
  {
    title: "Detectar Patrones: Otro Poder Que Ya Tenés y Nadie Te Enseñó a Usar",
    slug: createSlug("Detectar Patrones: Otro Poder Que Ya Tenés y Nadie Te Enseñó a Usar"),
    category: "Filosofía",
    type: "blog" as const,
    featured: true,
    imageUrl: "https://images.unsplash.com/photo-1509228627152-72ae9ae6848d?w=800&h=400&fit=crop",
    authorId: 1,
    publishedAt: new Date("2026-03-12").toISOString(),
    tags: ["patrones", "política", "pensamiento crítico", "transformación", "Argentina"],
  },
  {
    title: "Refinarse o Repetirse",
    slug: createSlug("Refinarse o Repetirse"),
    category: "Filosofía",
    type: "blog" as const,
    featured: true,
    imageUrl: "https://images.unsplash.com/photo-1517420704952-d9f39e95b43e?w=800&h=400&fit=crop",
    authorId: 1,
    publishedAt: new Date("2026-04-02").toISOString(),
    tags: ["refinamiento", "supuestos", "transformación", "iteración", "propósito"],
  },
  {
    title: "El Cristo que llevás dentro",
    slug: createSlug("El Cristo que llevás dentro"),
    category: "Filosofía",
    type: "blog" as const,
    featured: true,
    imageUrl: "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?w=800&h=400&fit=crop",
    authorId: 1,
    publishedAt: new Date("2026-04-05").toISOString(),
    tags: ["pascuas", "consciencia", "despertar", "etimología", "transformación"],
  },
];

const blogPostsData = baseBlogPostsData.map((post) => {
  const update = blogContentUpdates[post.slug];
  if (!update) {
    throw new Error(`No hay contenido actualizado para el slug ${post.slug}`);
  }

  return {
    ...post,
    excerpt: update.excerpt,
    content: update.content,
  };
});

// Vlogs con los videos especificados
const baseVlogPostsData = [
  {
    title: "La Amabilidad como Estrategia de Transformación",
    slug: createSlug("La Amabilidad como Estrategia de Transformación"),
    category: "Acción",
    type: "blog" as const,
    featured: false,
    imageUrl: "https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800&h=400&fit=crop",
    authorId: 1,
    publishedAt: new Date("2025-06-23").toISOString(),
    tags: ["amabilidad", "estrategia", "transformación", "comunidad", "conexión"],
  },
];

const vlogPostsData = baseVlogPostsData.map((post) => {
  const update = blogContentUpdates[post.slug];
  if (!update) {
    throw new Error(`No hay contenido actualizado para el slug ${post.slug}`);
  }

  return {
    ...post,
    excerpt: update.excerpt,
    content: update.content,
  };
});

async function seedBlogPosts() {
  console.log("🌱 Seeding blog posts...");
  
  try {
    // Insert blog posts
    for (const post of blogPostsData) {
      const { tags, ...postData } = post;
      const result = await db.insert(blogPosts).values(postData).returning();
      const postId = result[0].id;
      
      // Insert tags
      for (const tag of tags) {
        await db.insert(postTags).values({ postId, tag });
      }
      
      console.log(`✅ Created blog post: ${post.title}`);
    }

    // Insert vlog posts
    for (const post of vlogPostsData) {
      const { tags, ...postData } = post;
      const result = await db.insert(blogPosts).values(postData).returning();
      const postId = result[0].id;
      
      // Insert tags
      for (const tag of tags) {
        await db.insert(postTags).values({ postId, tag });
      }
      
      console.log(`✅ Created vlog post: ${post.title}`);
    }
    
    console.log("🎉 All blog posts seeded successfully!");
  } catch (error) {
    console.error("❌ Error seeding blog posts:", error);
  }
}

seedBlogPosts().then(() => {
  console.log('Done.');
  process.exit(0);
});
