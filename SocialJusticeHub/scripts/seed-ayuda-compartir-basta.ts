import { db } from './db-neon';
import { communityPosts } from '../shared/schema';
import { sql, ne, eq, inArray } from 'drizzle-orm';

const DESCRIPTION = `Seguramente en algún momento te preguntaste: "¿y si esto no cambia nunca?" Yo también. Muchas veces.

Pero acá estamos, intentando algo distinto.

--- ¿QUÉ ES ¡BASTA!? ---

No es un partido. No es una marcha. No es un tipo con micrófono prometiendo cosas.

Es una herramienta concreta: un mapa donde cada persona puede marcar lo que ve, lo que necesita, lo que ya no aguanta. Una forma de organizarnos entre todos para que los que gobiernan rindan cuentas — sin pedirle permiso a nadie.

Presión pública organizada. Eso es ¡BASTA!

--- ¿PARA QUÉ SIRVE EL MAPA? ---

Para que desde cualquier rincón del país alguien pueda decir: "acá falta agua", "acá sobra corrupción", "acá hay gente con ganas de laburar si alguien organiza el espacio".

Cada punto en el mapa es una señal real. Cuando se juntan muchas señales, se vuelve imposible mirar para otro lado.

--- ¿QUÉ PODÉS HACER VOS? ---

1. SUMATE — Registrate. No pedimos plata, pedimos presencia. Cada persona que se suma es una señal más de que alguien se despertó.

2. COMPARTÍ — Mandá este enlace a tres personas. No a las que ya están calientes — a las que todavía creen que nada se puede hacer. Esas son las que más necesitamos.

3. MARCÁ TU SEÑAL — Entrá al mapa y dejá tu marca. Tu necesidad, tu sueño, tu basta. Cada punto es una prueba de que la ciudadanía está viva.

4. VIGILÁ — Cuando un político prometa algo, anotalo. Cuando no cumpla, documentalo. La transparencia no es un ideal lindo: es una herramienta que ya tenemos.

--- ¿POR QUÉ COMPARTIR? ---

Esto no funciona con un líder. Funciona con una red. Con muchos. Con vos pasándole esto a alguien que todavía no sabe que ya es parte.

Cuando nos vean, van a tener que escuchar. Y cuando escuchen, van a tener que actuar — no porque quieran, sino porque no les va a quedar otra.

Compartilo. Sumá tu señal. Hagámonos visibles.`;

async function seed() {
  console.log('=== Limpiando posts no-mission y creando "Ayuda a compartir ¡BASTA!" ===\n');

  // Step 1: Get IDs of non-mission posts to delete
  const nonMissionPosts = await db.select({ id: communityPosts.id })
    .from(communityPosts)
    .where(ne(communityPosts.type, 'mission'));

  const ids = nonMissionPosts.map(p => p.id);

  if (ids.length > 0) {
    console.log(`Encontrados ${ids.length} posts no-mission para eliminar.`);

    // Delete dependent records first using raw SQL for simplicity
    const tables = [
      'community_post_interactions',
      'community_post_views',
      'community_post_likes',
      'community_messages',
      'community_post_activity',
      'inspiring_stories',
      'initiative_members',
      'initiative_milestones',
      'initiative_tasks',
      'initiative_messages',
      'activity_feed',
      'membership_requests',
      'notifications',
      'mission_evidence',
      'mission_chronicles',
    ];

    for (const table of tables) {
      try {
        await db.execute(sql.raw(`DELETE FROM ${table} WHERE post_id IN (${ids.join(',')})`));
        console.log(`  Limpiada tabla: ${table}`);
      } catch (e: any) {
        // Table might not exist or column might be different
        if (e.message?.includes('does not exist')) {
          console.log(`  Tabla ${table} no existe, saltando.`);
        } else {
          console.log(`  Error en ${table}: ${e.message?.substring(0, 80)}`);
        }
      }
    }

    // Also clean inspiring_stories.related_post_id references
    try {
      await db.execute(sql.raw(`DELETE FROM inspiring_stories WHERE related_post_id IN (${ids.join(',')})`));
      console.log('  Limpiada tabla: inspiring_stories (related_post_id)');
    } catch (_) {}

    // Also clean mandate_suggestions.initiative_id references
    try {
      await db.execute(sql.raw(`DELETE FROM mandate_suggestions WHERE initiative_id IN (${ids.join(',')})`));
      console.log('  Limpiada tabla: mandate_suggestions');
    } catch (_) {}

    // Now delete the posts themselves
    await db.delete(communityPosts).where(inArray(communityPosts.id, ids));
    console.log(`\n✅ Eliminados ${ids.length} posts no-mission.\n`);
  } else {
    console.log('No hay posts no-mission para eliminar.\n');
  }

  // Step 2: Insert the featured post
  const existing = await db.select()
    .from(communityPosts)
    .where(eq(communityPosts.title, 'Ayuda a compartir ¡BASTA!'))
    .limit(1);

  if (existing.length > 0) {
    console.log(`⏩ "Ayuda a compartir ¡BASTA!" ya existe (id: ${existing[0].id}). Saltando.`);
  } else {
    const [post] = await db.insert(communityPosts).values({
      userId: 1,
      title: 'Ayuda a compartir ¡BASTA!',
      description: DESCRIPTION,
      type: 'action',
      location: 'Argentina',
      participants: 0,
      status: 'active',
      views: 0,
      country: 'Argentina',
      requiresApproval: false,
      memberCount: 0,
    }).returning();

    console.log(`✅ "Ayuda a compartir ¡BASTA!" creado (id: ${post.id})`);
  }

  // Step 3: Verify final state
  const remaining = await db.select({ id: communityPosts.id, type: communityPosts.type, title: communityPosts.title })
    .from(communityPosts);
  console.log(`\nEstado final: ${remaining.length} posts en total:`);
  for (const p of remaining) {
    console.log(`  - [${p.type}] ${p.title} (id: ${p.id})`);
  }
}

seed().catch(console.error);
