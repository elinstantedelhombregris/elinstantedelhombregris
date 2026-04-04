import { db } from './db-neon';
import { communityPosts } from '../shared/schema';
import { sql, ne, eq, inArray } from 'drizzle-orm';

const DESCRIPTION = `No te escribo desde un podio. Te escribo desde la misma cocina donde vos tambien te preguntaste: "y si esto no cambia nunca?"

Cambia. Pero no por decreto. Por diseno.

¡BASTA! no es una protesta. No es un partido. No es un salvador con megafono. Es una herramienta: un mapa vivo donde cada ciudadano puede marcar lo que ve, lo que necesita, lo que suena, lo que ya no tolera. Una estructura de presion publica organizada que no depende de ningun poder existente pero los obliga a todos a rendir cuentas.

Porque la presion publica organizada no es protesta: es diseno de gobernanza.

Necesitamos armar un mapa nacional de senales ciudadanas. Que desde cada rincon del pais alguien diga: "Aca falta agua", "Aca sobra corrupcion", "Aca hay gente dispuesta a trabajar si alguien organiza el espacio". No pedimos permiso para hacer visible lo que el pais necesita. Lo hacemos.

Que necesitamos de vos:

1. SUMATE — Registrate. No te pedimos plata, te pedimos presencia. Cada persona registrada es una senal de que alguien desperto.

2. COMPARTI — Manda este enlace a tres personas. No a las que ya estan indignadas sino a las que todavia creen que nada se puede hacer. Esas son las que mas necesitamos.

3. MARCA TU SENAL — Entra al mapa y deja tu marca. Tu sueno, tu necesidad, tu basta. Cada punto en el mapa es una prueba de que la ciudadania esta despierta y organizada.

4. VIGILA — Cuando veas que un politico promete algo, anota. Cuando veas que no cumple, documenta. La transparencia radical no es un ideal: es una tecnologia que ya tenemos.

No llamamos a las masas. Llamamos a los despiertos. A los que entienden que los problemas del pais no son fallas morales sino bugs de diseno. Y que los bugs se arreglan con codigo nuevo, no con indignacion ciclica.

No venimos a administrar ruinas. Venimos a estrenar pais.

Otro pais es posible, no por decreto sino por diseno. Y el primer acto de diseno es hacernos visibles: un mapa donde cada punto de luz es un ciudadano que dijo basta, que sono algo mejor, que ofrecio lo que tiene.

La fuerza no esta en un lider. Esta en la red. En el nosotros distribuido. En vos compartiendo esto con alguien que todavia no sabe que ya es parte.

Compartilo. Suma tu senal. Hacenos visibles.
Porque cuando nos vean, van a tener que escuchar.
Y cuando escuchen, van a tener que actuar.
No porque quieran. Porque no les va a quedar otra.`;

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
