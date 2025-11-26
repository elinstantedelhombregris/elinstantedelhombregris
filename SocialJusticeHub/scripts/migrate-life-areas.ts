import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from '../shared/schema-sqlite';

async function migrateLifeAreas() {
  console.log('🚀 Iniciando migración de áreas de vida...');

  // Conectar a la base de datos
  const sqlite = new Database('./local.db');
  const db = drizzle(sqlite, { schema });

  try {
    console.log('📊 Creando tablas de áreas de vida...');

    // Tabla life_areas
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS life_areas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        icon_name TEXT,
        order_index INTEGER NOT NULL,
        color_theme TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tabla life_area_subcategories
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS life_area_subcategories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        life_area_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        order_index INTEGER NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (life_area_id) REFERENCES life_areas (id)
      )
    `);

    // Tabla life_area_quizzes
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS life_area_quizzes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        life_area_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        version INTEGER DEFAULT 1,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (life_area_id) REFERENCES life_areas (id)
      )
    `);

    // Tabla life_area_quiz_questions
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS life_area_quiz_questions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        quiz_id INTEGER NOT NULL,
        question_text TEXT NOT NULL,
        question_type TEXT NOT NULL,
        order_index INTEGER NOT NULL,
        category TEXT NOT NULL,
        subcategory_id INTEGER,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (quiz_id) REFERENCES life_area_quizzes (id),
        FOREIGN KEY (subcategory_id) REFERENCES life_area_subcategories (id)
      )
    `);

    // Tabla life_area_quiz_responses
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS life_area_quiz_responses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        quiz_id INTEGER NOT NULL,
        question_id INTEGER NOT NULL,
        current_value INTEGER,
        desired_value INTEGER,
        answered_at TEXT DEFAULT CURRENT_TIMESTAMP,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id),
        FOREIGN KEY (quiz_id) REFERENCES life_area_quizzes (id),
        FOREIGN KEY (question_id) REFERENCES life_area_quiz_questions (id)
      )
    `);

    // Tabla life_area_scores
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS life_area_scores (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        life_area_id INTEGER NOT NULL,
        subcategory_id INTEGER,
        current_score INTEGER NOT NULL,
        desired_score INTEGER NOT NULL,
        gap INTEGER NOT NULL,
        last_updated TEXT DEFAULT CURRENT_TIMESTAMP,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id),
        FOREIGN KEY (life_area_id) REFERENCES life_areas (id),
        FOREIGN KEY (subcategory_id) REFERENCES life_area_subcategories (id)
      )
    `);

    // Tabla life_area_actions
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS life_area_actions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        life_area_id INTEGER NOT NULL,
        subcategory_id INTEGER,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        difficulty TEXT NOT NULL,
        estimated_duration TEXT,
        priority INTEGER DEFAULT 0,
        category TEXT,
        xp_reward INTEGER DEFAULT 50,
        seed_reward INTEGER DEFAULT 10,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (life_area_id) REFERENCES life_areas (id),
        FOREIGN KEY (subcategory_id) REFERENCES life_area_subcategories (id)
      )
    `);

    // Tabla user_life_area_progress
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS user_life_area_progress (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        action_id INTEGER NOT NULL,
        status TEXT NOT NULL,
        started_at TEXT,
        completed_at TEXT,
        notes TEXT,
        evidence TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id),
        FOREIGN KEY (action_id) REFERENCES life_area_actions (id)
      )
    `);

    // Tabla life_area_milestones
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS life_area_milestones (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        life_area_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        target_score INTEGER NOT NULL,
        achieved_score INTEGER,
        achieved_at TEXT,
        share_token TEXT UNIQUE,
        shared_at TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id),
        FOREIGN KEY (life_area_id) REFERENCES life_areas (id)
      )
    `);

    // Tabla life_area_indicators
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS life_area_indicators (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        life_area_id INTEGER NOT NULL,
        indicator_type TEXT NOT NULL,
        value REAL NOT NULL,
        metadata TEXT,
        recorded_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id),
        FOREIGN KEY (life_area_id) REFERENCES life_areas (id)
      )
    `);

    // Tabla life_area_community_stats
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS life_area_community_stats (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        life_area_id INTEGER NOT NULL,
        period TEXT NOT NULL,
        avg_score REAL,
        median_score REAL,
        total_users INTEGER DEFAULT 0,
        percentile_data TEXT,
        calculated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (life_area_id) REFERENCES life_areas (id)
      )
    `);

    console.log('🎮 Creando tablas de gamificación...');

    // Tabla life_area_xp_log
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS life_area_xp_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        life_area_id INTEGER NOT NULL,
        xp_amount INTEGER NOT NULL,
        source_type TEXT NOT NULL,
        source_id INTEGER,
        multiplier REAL DEFAULT 1.0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id),
        FOREIGN KEY (life_area_id) REFERENCES life_areas (id)
      )
    `);

    // Tabla life_area_levels
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS life_area_levels (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        life_area_id INTEGER NOT NULL,
        level INTEGER DEFAULT 1,
        xp_current INTEGER DEFAULT 0,
        xp_required INTEGER DEFAULT 100,
        unlocked_features TEXT,
        level_up_at TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id),
        FOREIGN KEY (life_area_id) REFERENCES life_areas (id)
      )
    `);

    // Tabla life_area_streaks
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS life_area_streaks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        streak_type TEXT NOT NULL,
        current_streak INTEGER DEFAULT 0,
        longest_streak INTEGER DEFAULT 0,
        last_activity_date TEXT,
        bonus_multiplier REAL DEFAULT 1.0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )
    `);

    // Tabla life_area_badges
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS life_area_badges (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        icon_name TEXT NOT NULL,
        rarity TEXT NOT NULL,
        requirement_type TEXT NOT NULL,
        requirement_data TEXT,
        xp_reward INTEGER DEFAULT 0,
        seed_reward INTEGER DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tabla user_life_area_badges
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS user_life_area_badges (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        badge_id INTEGER NOT NULL,
        earned_at TEXT DEFAULT CURRENT_TIMESTAMP,
        seen INTEGER DEFAULT 0,
        shared_at TEXT,
        FOREIGN KEY (user_id) REFERENCES users (id),
        FOREIGN KEY (badge_id) REFERENCES life_area_badges (id)
      )
    `);

    // Tabla life_area_currency
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS life_area_currency (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL UNIQUE,
        currency_type TEXT DEFAULT 'seeds',
        amount INTEGER DEFAULT 0,
        total_earned INTEGER DEFAULT 0,
        total_spent INTEGER DEFAULT 0,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )
    `);

    // Tabla life_area_reward_chests
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS life_area_reward_chests (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        chest_type TEXT NOT NULL,
        rewards TEXT,
        opened_at TEXT,
        expires_at TEXT,
        rarity TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )
    `);

    // Tabla life_area_challenges
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS life_area_challenges (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        challenge_type TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        requirements TEXT,
        rewards TEXT,
        start_date TEXT NOT NULL,
        end_date TEXT NOT NULL,
        is_active INTEGER DEFAULT 1,
        participant_count INTEGER DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tabla user_life_area_challenges
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS user_life_area_challenges (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        challenge_id INTEGER NOT NULL,
        progress TEXT,
        status TEXT NOT NULL,
        completed_at TEXT,
        rewards_claimed INTEGER DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id),
        FOREIGN KEY (challenge_id) REFERENCES life_area_challenges (id)
      )
    `);

    // Tabla life_area_mastery
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS life_area_mastery (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        life_area_id INTEGER NOT NULL,
        mastery_percentage REAL DEFAULT 0,
        actions_completed INTEGER DEFAULT 0,
        total_actions INTEGER DEFAULT 0,
        time_invested_minutes INTEGER DEFAULT 0,
        unlocked_content TEXT,
        mastery_level TEXT DEFAULT 'novice',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id),
        FOREIGN KEY (life_area_id) REFERENCES life_areas (id)
      )
    `);

    // Tabla life_area_notifications
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS life_area_notifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        type TEXT NOT NULL,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        action_url TEXT,
        read INTEGER DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )
    `);

    // Tabla life_area_social_interactions
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS life_area_social_interactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        target_user_id INTEGER NOT NULL,
        interaction_type TEXT NOT NULL,
        target_type TEXT NOT NULL,
        target_id INTEGER NOT NULL,
        content TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id),
        FOREIGN KEY (target_user_id) REFERENCES users (id)
      )
    `);

    console.log('✅ Migración completada exitosamente!');
    console.log('📊 Tablas creadas:');
    console.log('   - life_areas');
    console.log('   - life_area_subcategories');
    console.log('   - life_area_quizzes');
    console.log('   - life_area_quiz_questions');
    console.log('   - life_area_quiz_responses');
    console.log('   - life_area_scores');
    console.log('   - life_area_actions');
    console.log('   - user_life_area_progress');
    console.log('   - life_area_milestones');
    console.log('   - life_area_indicators');
    console.log('   - life_area_community_stats');
    console.log('   - life_area_xp_log');
    console.log('   - life_area_levels');
    console.log('   - life_area_streaks');
    console.log('   - life_area_badges');
    console.log('   - user_life_area_badges');
    console.log('   - life_area_currency');
    console.log('   - life_area_reward_chests');
    console.log('   - life_area_challenges');
    console.log('   - user_life_area_challenges');
    console.log('   - life_area_mastery');
    console.log('   - life_area_notifications');
    console.log('   - life_area_social_interactions');

  } catch (error) {
    console.error('❌ Error en la migración:', error);
    throw error;
  } finally {
    sqlite.close();
  }
}

migrateLifeAreas().catch(console.error);

