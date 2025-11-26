import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import { badges } from "@shared/schema-sqlite";

const sqlite = new Database("local.db");
const db = drizzle(sqlite);

// Badges específicos para lectura y blog
const readingBadges = [
  {
    name: "Primer Artículo",
    description: "Has leído tu primer artículo en el blog del Hombre Gris",
    iconName: "BookOpen",
    category: "reading",
    requirement: "Leer al menos 1 artículo completo",
    requirementData: JSON.stringify({
      type: "articles_read",
      count: 1
    }),
    rarity: "common",
    experienceReward: 50,
    orderIndex: 1
  },
  {
    name: "Lector Frecuente",
    description: "Has leído 10 artículos completos",
    iconName: "BookOpenCheck",
    category: "reading",
    requirement: "Leer al menos 10 artículos completos",
    requirementData: JSON.stringify({
      type: "articles_read",
      count: 10
    }),
    rarity: "rare",
    experienceReward: 200,
    orderIndex: 2
  },
  {
    name: "Devorador de Contenido",
    description: "Has leído 50 artículos completos",
    iconName: "BookMarked",
    category: "reading",
    requirement: "Leer al menos 50 artículos completos",
    requirementData: JSON.stringify({
      type: "articles_read",
      count: 50
    }),
    rarity: "epic",
    experienceReward: 500,
    orderIndex: 3
  },
  {
    name: "Comentarista Activo",
    description: "Has escrito 10 comentarios de calidad",
    iconName: "MessageCircle",
    category: "reading",
    requirement: "Escribir al menos 10 comentarios de más de 50 caracteres",
    requirementData: JSON.stringify({
      type: "quality_comments",
      count: 10,
      minLength: 50
    }),
    rarity: "rare",
    experienceReward: 300,
    orderIndex: 4
  },
  {
    name: "Curador de Contenido",
    description: "Has guardado 20 artículos en favoritos",
    iconName: "Bookmark",
    category: "reading",
    requirement: "Guardar al menos 20 artículos en bookmarks",
    requirementData: JSON.stringify({
      type: "bookmarks",
      count: 20
    }),
    rarity: "rare",
    experienceReward: 250,
    orderIndex: 5
  },
  {
    name: "Racha de Lectura",
    description: "Has leído artículos 7 días consecutivos",
    iconName: "Calendar",
    category: "reading",
    requirement: "Leer al menos un artículo por 7 días consecutivos",
    requirementData: JSON.stringify({
      type: "reading_streak",
      days: 7
    }),
    rarity: "epic",
    experienceReward: 400,
    orderIndex: 6
  },
  {
    name: "Racha Maestra",
    description: "Has leído artículos 30 días consecutivos",
    iconName: "CalendarCheck",
    category: "reading",
    requirement: "Leer al menos un artículo por 30 días consecutivos",
    requirementData: JSON.stringify({
      type: "reading_streak",
      days: 30
    }),
    rarity: "legendary",
    experienceReward: 1000,
    orderIndex: 7
  },
  {
    name: "Crítico Literario",
    description: "Has recibido 20 likes en tus comentarios",
    iconName: "Heart",
    category: "reading",
    requirement: "Recibir al menos 20 likes en comentarios propios",
    requirementData: JSON.stringify({
      type: "comment_likes_received",
      count: 20
    }),
    rarity: "epic",
    experienceReward: 600,
    orderIndex: 8
  },
  {
    name: "Explorador de Tags",
    description: "Has leído artículos de 10 categorías diferentes",
    iconName: "Tag",
    category: "reading",
    requirement: "Leer artículos de al menos 10 categorías diferentes",
    requirementData: JSON.stringify({
      type: "categories_explored",
      count: 10
    }),
    rarity: "rare",
    experienceReward: 350,
    orderIndex: 9
  },
  {
    name: "Maestro del Blog",
    description: "Has completado todos los badges de lectura",
    iconName: "Crown",
    category: "reading",
    requirement: "Obtener todos los demás badges de lectura",
    requirementData: JSON.stringify({
      type: "all_reading_badges"
    }),
    rarity: "legendary",
    experienceReward: 1500,
    orderIndex: 10
  }
];

async function seedReadingBadges() {
  console.log("🌱 Seeding reading badges...");
  
  try {
    for (const badge of readingBadges) {
      await db.insert(badges).values(badge);
      console.log(`✅ Created badge: ${badge.name}`);
    }
    
    console.log("🎉 All reading badges seeded successfully!");
  } catch (error) {
    console.error("❌ Error seeding reading badges:", error);
  }
}

seedReadingBadges().then(() => {
  sqlite.close();
  process.exit(0);
});
