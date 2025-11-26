import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
// @ts-ignore: Cannot find module '@shared/schema-sqlite'
import { blogPosts, postTags } from "@shared/schema-sqlite";
import { blogContentUpdates } from "../shared/blogContent";

const sqlite = new Database("local.db");
const db = drizzle(sqlite);

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
    publishedAt: new Date("2024-12-15").toISOString(),
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
    publishedAt: new Date("2024-12-13").toISOString(),
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
    publishedAt: new Date("2024-12-10").toISOString(),
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
    publishedAt: new Date("2024-12-08").toISOString(),
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
    publishedAt: new Date("2024-12-05").toISOString(),
    tags: ["ética", "servicio", "valores", "transformación", "comunidad"],
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
    title: "El Pozo que se Desborda - Reflexiones en Vivo",
    slug: createSlug("El Pozo que se Desborda - Reflexiones en Vivo"),
    category: "Reflexión",
    type: "vlog" as const,
    featured: true,
    videoUrl: "https://youtu.be/ngE6CwUatho",
    imageUrl: "https://img.youtube.com/vi/ngE6CwUatho/maxresdefault.jpg",
    authorId: 1,
    publishedAt: new Date("2024-12-14").toISOString(),
    tags: ["despertar", "responsabilidad", "acción", "reflexión", "transformación"],
  },
  {
    title: "Sistemas vs. Síntomas: Cómo Pensar como Ingeniero Social",
    slug: createSlug("Sistemas vs. Síntomas: Cómo Pensar como Ingeniero Social"),
    category: "Análisis",
    type: "vlog" as const,
    featured: false,
    videoUrl: "https://youtu.be/L1qeN78SlEE",
    imageUrl: "https://img.youtube.com/vi/L1qeN78SlEE/maxresdefault.jpg",
    authorId: 1,
    publishedAt: new Date("2024-12-11").toISOString(),
    tags: ["sistemas", "ingeniería", "análisis", "metodología", "solución-problemas"],
  },
  {
    title: "La Amabilidad como Estrategia de Transformación",
    slug: createSlug("La Amabilidad como Estrategia de Transformación"),
    category: "Acción",
    type: "vlog" as const,
    featured: false,
    videoUrl: "https://youtu.be/dQw4w9WgXcQ",
    imageUrl: "https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800&h=400&fit=crop",
    authorId: 1,
    publishedAt: new Date("2024-12-09").toISOString(),
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
  sqlite.close();
  process.exit(0);
});
