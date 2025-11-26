import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import { eq } from "drizzle-orm";
import { blogPosts, postTags } from "../shared/schema-sqlite";

const sqlite = new Database("local.db");
const db = drizzle(sqlite);

// Función para generar slug
function createSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remover caracteres especiales
    .replace(/\s+/g, '-') // Reemplazar espacios con guiones
    .replace(/-+/g, '-') // Reemplazar múltiples guiones con uno solo
    .trim();
}

const newPost = {
  title: "Dos Manos que Hacen: La Verdad Matemática del Cambio",
  slug: createSlug("Dos Manos que Hacen: La Verdad Matemática del Cambio"),
  excerpt: "Dos manos que hacen son más importantes que un millón de labios que prometen. Esta no es una metáfora poética, es una verdad matemática del cambio social...",
  content: `# Dos Manos que Hacen: La Verdad Matemática del Cambio

Dos manos que hacen son más importantes que un millón de labios que prometen.

Esta no es una metáfora poética, es una verdad matemática del cambio social. Como ingeniero, lo sé: los sistemas se transforman por acción, no por intención. Las promesas son entropía pura si no se materializan en movimiento.

## La Ecuación del Cambio Real

En todo sistema, el cambio se calcula así:

**Cambio Real = Σ (Acciones Ejecutadas) × (Impacto por Acción)**

Las promesas no aparecen en esta ecuación. No tienen masa, no generan fuerza, no alteran la realidad. Son variables que se cancelan antes de llegar al resultado.

Dos manos que trabajan ejecutan acciones con impacto medible. Un millón de labios que prometen genera ruido, expectativas, pero cero transformación.

## El Cálculo de la Eficiencia Social

Imaginemos que tenemos dos recursos:
- **Recurso A**: Un millón de personas que prometen ayudar
- **Recurso B**: Dos personas que están ayudando ahora mismo

¿Cuál genera más valor real?

La respuesta es inevitable: Recurso B. Porque el valor se crea en el presente, no en el futuro condicional de las promesas. Dos manos construyendo un puente hoy, superan a un millón de voces que prometen construir mañana.

## La Física de la Acción

En física, trabajo se define como fuerza aplicada sobre una distancia. Las promesas no aplican fuerza, no recorren distancia. Son potencial sin actualización.

Dos manos haciendo algo aplican fuerza. Mueven materia. Transforman el mundo físico. Crean cambios que pueden medirse, tocarse, experimentarse.

Esta es la verdad que no podemos negar: la acción tiene masa, la promesa tiene peso cero.

## El Sistema de las Promesas Vacías

Hemos construido un sistema social que premia las promesas sobre las acciones. El político que promete más es el que gana elecciones. El líder que habla mejor es el que atrae seguidores. Pero cuando llega el momento de la verdad, cuando necesitamos que el sistema funcione, ¿qué encontramos?

Encontramos que las promesas no construyen puentes, no alimentan niños, no sanan enfermos. Encontramos que necesitamos manos que hagan, no labios que prometan.

## La Inversión del Paradigma

Como Hombre Gris, propongo una inversión del paradigma: comencemos a valorar las acciones sobre las palabras. Construyamos un sistema donde lo que haces importa más que lo que dices.

Imaginemos una Argentina donde:
- El que construye tiene más autoridad que el que promete construir
- El que ayuda tiene más reconocimiento que el que promete ayudar
- El que actúa tiene más influencia que el que promete actuar

Esta no es una utopía, es simplemente una reordenación de valores. Pasar de valorar la intención a valorar el resultado.

## La Matemática de la Transformación

Si queremos transformar Argentina, necesitamos entender esta ecuación:

**Transformación Nacional = Σ (Acciones Individuales) × (Multiplicador Sistémico)**

Cada acción individual tiene un multiplicador. Si dos personas ayudan a un vecino, eso inspira a otros cuatro. Esos cuatro inspiran a ocho. La acción se multiplica, la promesa se desvanece.

## El Poder de las Dos Manos

Dos manos pueden:
- Construir un refugio para alguien que lo necesita
- Enseñar a un niño a leer
- Plantar un árbol que crecerá durante décadas
- Ayudar a un anciano a cruzar la calle
- Crear algo que no existía antes

Un millón de labios prometiendo pueden:
- Crear expectativas
- Generar esperanza temporal
- Producir decepción cuando no se cumplen

Las matemáticas son claras: dos manos > un millón de promesas.

## La Invitación a la Acción

No te pido que prometas cambiar. Te invito a que cambies ahora, con tus propias manos.

No necesitas esperar a que otros lo hagan. No necesitas que un millón de personas se comprometa contigo. Solo necesitas comenzar. Dos manos son suficientes.

Cada acción que ejecutas hoy es una semilla de transformación. Cada promesa que no cumples es una oportunidad perdida.

## La Inevitabilidad de la Acción

Esto no es una opinión, es una ley de la naturaleza: los sistemas cambian por acción, no por intención. La gravedad no respeta promesas, respeta masa. El tiempo no respeta intenciones, respeta resultados.

Dos manos que hacen son más importantes que un millón de labios que prometen porque:
1. La acción tiene masa, la promesa no
2. La acción transforma el presente, la promesa pospone el futuro
3. La acción se multiplica, la promesa se desvanece
4. La acción es verificable, la promesa es hipotética

Esta verdad es lógica, inevitable, indudable.

## La Construcción del Cambio

Si queremos construir una Argentina diferente, necesitamos manos que construyan, no labios que prometan.

Cada uno de nosotros tiene dos manos. Cada uno de nosotros puede comenzar hoy. No necesitamos esperar a que otros lo hagan. No necesitamos que un millón de personas se comprometa.

Solo necesitamos actuar.

Dos manos que hacen son más importantes que un millón de labios que prometen.

Esta es la verdad matemática del cambio.

¿Estás listo para usar tus manos?`,
  category: "Acción",
  type: "blog" as const,
  featured: true,
  imageUrl: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=400&fit=crop",
  authorId: 1,
  publishedAt: new Date().toISOString(),
  tags: ["acción", "cambio", "transformación", "filosofía", "sistemas", "realidad"]
};

async function addPost() {
  console.log("📝 Añadiendo nuevo post del Hombre Gris...");
  
  try {
    // Verificar si el post ya existe
    const existing = await db.select().from(blogPosts).where(
      eq(blogPosts.slug, newPost.slug)
    );
    
    if (existing.length > 0) {
      console.log("⚠️  El post ya existe con este slug. Actualizando...");
      // Actualizar el post existente
      await db.update(blogPosts)
        .set({
          title: newPost.title,
          excerpt: newPost.excerpt,
          content: newPost.content,
          category: newPost.category,
          featured: newPost.featured,
          imageUrl: newPost.imageUrl,
          publishedAt: newPost.publishedAt,
        })
        .where(eq(blogPosts.slug, newPost.slug));
      
      const updatedPost = await db.select().from(blogPosts).where(
        eq(blogPosts.slug, newPost.slug)
      );
      
      // Eliminar tags antiguos y agregar nuevos
      await db.delete(postTags).where(eq(postTags.postId, updatedPost[0].id));
      
      for (const tag of newPost.tags) {
        await db.insert(postTags).values({ postId: updatedPost[0].id, tag });
      }
      
      console.log(`✅ Post actualizado: ${newPost.title}`);
    } else {
      // Insertar nuevo post
      const { tags, ...postData } = newPost;
      const result = await db.insert(blogPosts).values(postData).returning();
      const postId = result[0].id;
      
      // Insertar tags
      for (const tag of tags) {
        await db.insert(postTags).values({ postId, tag });
      }
      
      console.log(`✅ Post creado: ${newPost.title}`);
    }
    
    console.log("🎉 Post añadido exitosamente!");
  } catch (error) {
    console.error("❌ Error añadiendo post:", error);
    throw error;
  } finally {
    sqlite.close();
  }
}

addPost().then(() => {
  process.exit(0);
}).catch((error) => {
  console.error(error);
  process.exit(1);
});

