import { db } from '../server/db';
import { sql } from 'drizzle-orm';

async function migrateCommunityFeatures() {
  console.log('🚀 Iniciando migración de características de comunidad...');

  try {
    // Create initiative_members table
    console.log('📋 Creando tabla initiative_members...');
    await db.run(sql`
      CREATE TABLE IF NOT EXISTS initiative_members (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        post_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        role TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'active',
        permissions TEXT,
        joined_at TEXT DEFAULT CURRENT_TIMESTAMP,
        left_at TEXT,
        FOREIGN KEY (post_id) REFERENCES community_posts(id),
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    // Create initiative_milestones table
    console.log('🎯 Creando tabla initiative_milestones...');
    await db.run(sql`
      CREATE TABLE IF NOT EXISTS initiative_milestones (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        post_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        status TEXT NOT NULL DEFAULT 'pending',
        due_date TEXT,
        completed_at TEXT,
        completed_by INTEGER,
        order_index INTEGER DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (post_id) REFERENCES community_posts(id),
        FOREIGN KEY (completed_by) REFERENCES users(id)
      )
    `);

    // Create initiative_messages table
    console.log('💬 Creando tabla initiative_messages...');
    await db.run(sql`
      CREATE TABLE IF NOT EXISTS initiative_messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        post_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        content TEXT NOT NULL,
        type TEXT NOT NULL DEFAULT 'message',
        metadata TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (post_id) REFERENCES community_posts(id),
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    // Create initiative_tasks table
    console.log('📝 Creando tabla initiative_tasks...');
    await db.run(sql`
      CREATE TABLE IF NOT EXISTS initiative_tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        post_id INTEGER NOT NULL,
        milestone_id INTEGER,
        title TEXT NOT NULL,
        description TEXT,
        assigned_to INTEGER,
        status TEXT NOT NULL DEFAULT 'todo',
        priority TEXT DEFAULT 'medium',
        due_date TEXT,
        completed_at TEXT,
        created_by INTEGER NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (post_id) REFERENCES community_posts(id),
        FOREIGN KEY (milestone_id) REFERENCES initiative_milestones(id),
        FOREIGN KEY (assigned_to) REFERENCES users(id),
        FOREIGN KEY (created_by) REFERENCES users(id)
      )
    `);

    // Create activity_feed table
    console.log('📊 Creando tabla activity_feed...');
    await db.run(sql`
      CREATE TABLE IF NOT EXISTS activity_feed (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT NOT NULL,
        post_id INTEGER,
        user_id INTEGER,
        target_id INTEGER,
        title TEXT NOT NULL,
        description TEXT,
        metadata TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (post_id) REFERENCES community_posts(id),
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    // Create membership_requests table
    console.log('📋 Creando tabla membership_requests...');
    await db.run(sql`
      CREATE TABLE IF NOT EXISTS membership_requests (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        post_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        message TEXT,
        status TEXT NOT NULL DEFAULT 'pending',
        reviewed_by INTEGER,
        reviewed_at TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (post_id) REFERENCES community_posts(id),
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (reviewed_by) REFERENCES users(id)
      )
    `);

    // Create notifications table
    console.log('🔔 Creando tabla notifications...');
    await db.run(sql`
      CREATE TABLE IF NOT EXISTS notifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        type TEXT NOT NULL,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        post_id INTEGER,
        target_id INTEGER,
        read INTEGER DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (post_id) REFERENCES community_posts(id)
      )
    `);

    // Add new columns to community_posts table
    console.log('🔄 Agregando columnas a community_posts...');
    
    // Check if requires_approval column exists
    try {
      await db.run(sql`ALTER TABLE community_posts ADD COLUMN requires_approval INTEGER DEFAULT 0`);
      console.log('✅ Columna requires_approval agregada');
    } catch (error) {
      console.log('ℹ️  Columna requires_approval ya existe o error:', error);
    }

    // Check if member_count column exists
    try {
      await db.run(sql`ALTER TABLE community_posts ADD COLUMN member_count INTEGER DEFAULT 0`);
      console.log('✅ Columna member_count agregada');
    } catch (error) {
      console.log('ℹ️  Columna member_count ya existe o error:', error);
    }

    // Check if settings column exists
    try {
      await db.run(sql`ALTER TABLE community_posts ADD COLUMN settings TEXT`);
      console.log('✅ Columna settings agregada');
    } catch (error) {
      console.log('ℹ️  Columna settings ya existe o error:', error);
    }

    // Create indexes for better performance
    console.log('📈 Creando índices...');
    
    await db.run(sql`CREATE INDEX IF NOT EXISTS idx_initiative_members_post_id ON initiative_members(post_id)`);
    await db.run(sql`CREATE INDEX IF NOT EXISTS idx_initiative_members_user_id ON initiative_members(user_id)`);
    await db.run(sql`CREATE INDEX IF NOT EXISTS idx_initiative_members_status ON initiative_members(status)`);
    
    await db.run(sql`CREATE INDEX IF NOT EXISTS idx_initiative_milestones_post_id ON initiative_milestones(post_id)`);
    await db.run(sql`CREATE INDEX IF NOT EXISTS idx_initiative_milestones_status ON initiative_milestones(status)`);
    
    await db.run(sql`CREATE INDEX IF NOT EXISTS idx_initiative_messages_post_id ON initiative_messages(post_id)`);
    await db.run(sql`CREATE INDEX IF NOT EXISTS idx_initiative_messages_user_id ON initiative_messages(user_id)`);
    await db.run(sql`CREATE INDEX IF NOT EXISTS idx_initiative_messages_created_at ON initiative_messages(created_at)`);
    
    await db.run(sql`CREATE INDEX IF NOT EXISTS idx_initiative_tasks_post_id ON initiative_tasks(post_id)`);
    await db.run(sql`CREATE INDEX IF NOT EXISTS idx_initiative_tasks_status ON initiative_tasks(status)`);
    await db.run(sql`CREATE INDEX IF NOT EXISTS idx_initiative_tasks_assigned_to ON initiative_tasks(assigned_to)`);
    
    await db.run(sql`CREATE INDEX IF NOT EXISTS idx_activity_feed_type ON activity_feed(type)`);
    await db.run(sql`CREATE INDEX IF NOT EXISTS idx_activity_feed_created_at ON activity_feed(created_at)`);
    await db.run(sql`CREATE INDEX IF NOT EXISTS idx_activity_feed_user_id ON activity_feed(user_id)`);
    
    await db.run(sql`CREATE INDEX IF NOT EXISTS idx_membership_requests_post_id ON membership_requests(post_id)`);
    await db.run(sql`CREATE INDEX IF NOT EXISTS idx_membership_requests_user_id ON membership_requests(user_id)`);
    await db.run(sql`CREATE INDEX IF NOT EXISTS idx_membership_requests_status ON membership_requests(status)`);
    
    await db.run(sql`CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id)`);
    await db.run(sql`CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read)`);
    await db.run(sql`CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at)`);

    // Insert sample data for testing
    console.log('🌱 Insertando datos de ejemplo...');
    
    // Get a sample user and post for testing
    const sampleUser = await db.get(sql`SELECT id FROM users LIMIT 1`);
    const samplePost = await db.get(sql`SELECT id FROM community_posts LIMIT 1`);
    
    if (sampleUser && samplePost) {
      // Create a sample milestone
      await db.run(sql`
        INSERT INTO initiative_milestones (post_id, title, description, status, due_date)
        VALUES (${samplePost.id}, 'Primer evento', 'Organizar el primer evento de la iniciativa', 'pending', date('now', '+7 days'))
      `);
      
      // Create a sample task
      await db.run(sql`
        INSERT INTO initiative_tasks (post_id, title, description, status, priority, created_by)
        VALUES (${samplePost.id}, 'Diseñar flyer', 'Crear el diseño del flyer para el evento', 'todo', 'high', ${sampleUser.id})
      `);
      
      // Create a sample activity feed item
      await db.run(sql`
        INSERT INTO activity_feed (type, post_id, user_id, title, description)
        VALUES ('new_initiative', ${samplePost.id}, ${sampleUser.id}, 'Nueva iniciativa creada', 'Se ha creado una nueva iniciativa en la comunidad')
      `);
      
      console.log('✅ Datos de ejemplo insertados');
    } else {
      console.log('⚠️  No se encontraron usuarios o posts para insertar datos de ejemplo');
    }

    console.log('✅ Migración completada exitosamente!');
    console.log('');
    console.log('📋 Tablas creadas:');
    console.log('   - initiative_members');
    console.log('   - initiative_milestones');
    console.log('   - initiative_messages');
    console.log('   - initiative_tasks');
    console.log('   - activity_feed');
    console.log('   - membership_requests');
    console.log('   - notifications');
    console.log('');
    console.log('🔄 Columnas agregadas a community_posts:');
    console.log('   - requires_approval');
    console.log('   - member_count');
    console.log('   - settings');
    console.log('');
    console.log('📈 Índices creados para optimizar consultas');
    console.log('');
    console.log('🎉 El sistema de iniciativas comunitarias está listo para usar!');

  } catch (error) {
    console.error('❌ Error durante la migración:', error);
    throw error;
  }
}

// Run migration if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  migrateCommunityFeatures()
    .then(() => {
      console.log('🏁 Migración finalizada');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Error fatal:', error);
      process.exit(1);
    });
}

export default migrateCommunityFeatures;
