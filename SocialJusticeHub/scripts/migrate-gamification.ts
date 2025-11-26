import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from '@shared/schema-sqlite';

async function migrateGamification() {
  console.log('🚀 Iniciando migración de gamificación...');

  // Conectar a la base de datos
  const sqlite = new Database('./local.db');
  const db = drizzle(sqlite, { schema });

  try {
    // Crear las nuevas tablas de gamificación
    console.log('📊 Creando tablas de gamificación...');

    // Tabla user_levels
    await db.run(`
      CREATE TABLE IF NOT EXISTS user_levels (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL UNIQUE,
        current_level INTEGER DEFAULT 1,
        experience INTEGER DEFAULT 0,
        experience_to_next INTEGER DEFAULT 500,
        streak INTEGER DEFAULT 0,
        last_activity_date TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )
    `);

    // Tabla challenges
    await db.run(`
      CREATE TABLE IF NOT EXISTS challenges (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        level INTEGER NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        category TEXT NOT NULL,
        difficulty TEXT NOT NULL,
        frequency TEXT NOT NULL,
        experience INTEGER NOT NULL,
        duration TEXT,
        icon_name TEXT,
        order_index INTEGER DEFAULT 0,
        is_active INTEGER DEFAULT 1,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tabla challenge_steps
    await db.run(`
      CREATE TABLE IF NOT EXISTS challenge_steps (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        challenge_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        type TEXT NOT NULL,
        order_index INTEGER NOT NULL,
        data TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (challenge_id) REFERENCES challenges (id)
      )
    `);

    // Tabla user_challenge_progress
    await db.run(`
      CREATE TABLE IF NOT EXISTS user_challenge_progress (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        challenge_id INTEGER NOT NULL,
        status TEXT NOT NULL,
        current_step INTEGER DEFAULT 0,
        completed_steps TEXT,
        started_at TEXT,
        completed_at TEXT,
        last_activity_at TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id),
        FOREIGN KEY (challenge_id) REFERENCES challenges (id)
      )
    `);

    // Tabla badges
    await db.run(`
      CREATE TABLE IF NOT EXISTS badges (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        icon_name TEXT NOT NULL,
        category TEXT NOT NULL,
        requirement TEXT NOT NULL,
        requirement_data TEXT,
        rarity TEXT NOT NULL,
        experience_reward INTEGER DEFAULT 0,
        order_index INTEGER DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tabla user_badges
    await db.run(`
      CREATE TABLE IF NOT EXISTS user_badges (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        badge_id INTEGER NOT NULL,
        earned_at TEXT DEFAULT CURRENT_TIMESTAMP,
        seen INTEGER DEFAULT 0,
        FOREIGN KEY (user_id) REFERENCES users (id),
        FOREIGN KEY (badge_id) REFERENCES badges (id)
      )
    `);

    // Tabla user_daily_activity
    await db.run(`
      CREATE TABLE IF NOT EXISTS user_daily_activity (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        date TEXT NOT NULL,
        experience_gained INTEGER DEFAULT 0,
        challenges_completed INTEGER DEFAULT 0,
        actions_completed INTEGER DEFAULT 0,
        streak_active INTEGER DEFAULT 1,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )
    `);

    console.log('✅ Tablas creadas exitosamente');

    // Inicializar niveles para usuarios existentes
    console.log('👥 Inicializando niveles para usuarios existentes...');
    
    // Insertar niveles para usuarios que no los tengan
    await db.run(`
      INSERT OR IGNORE INTO user_levels (user_id, current_level, experience, experience_to_next, streak)
      SELECT id, 1, 0, 500, 0 FROM users
    `);
    
    console.log('✅ Niveles inicializados para usuarios existentes');

    console.log('🎉 Migración completada exitosamente!');
    
  } catch (error) {
    console.error('❌ Error durante la migración:', error);
    throw error;
  } finally {
    sqlite.close();
  }
}

// Ejecutar la migración si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  migrateGamification()
    .then(() => {
      console.log('✅ Migración completada');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error en migración:', error);
      process.exit(1);
    });
}

export default migrateGamification;
