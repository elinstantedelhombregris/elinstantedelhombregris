import Database from 'better-sqlite3';
import * as schema from '../shared/schema-sqlite';

const sqlite = new Database('local.db');

async function main() {
  console.log('Creating course tables...');
  
  try {
    // Create courses table
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS courses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        slug TEXT NOT NULL UNIQUE,
        description TEXT NOT NULL,
        excerpt TEXT,
        category TEXT NOT NULL,
        level TEXT NOT NULL,
        duration INTEGER,
        thumbnail_url TEXT,
        video_url TEXT,
        order_index INTEGER DEFAULT 0,
        is_published INTEGER DEFAULT 0,
        is_featured INTEGER DEFAULT 0,
        requires_auth INTEGER DEFAULT 0,
        author_id INTEGER,
        view_count INTEGER DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (author_id) REFERENCES users (id)
      )
    `);
    console.log('✅ courses table created');

    // Create course_lessons table
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS course_lessons (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        course_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        content TEXT NOT NULL,
        order_index INTEGER NOT NULL,
        type TEXT NOT NULL,
        video_url TEXT,
        document_url TEXT,
        duration INTEGER,
        is_required INTEGER DEFAULT 1,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (course_id) REFERENCES courses (id) ON DELETE CASCADE
      )
    `);
    console.log('✅ course_lessons table created');

    // Create course_quizzes table
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS course_quizzes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        course_id INTEGER NOT NULL UNIQUE,
        title TEXT NOT NULL,
        description TEXT,
        passing_score INTEGER DEFAULT 70,
        time_limit INTEGER,
        allow_retakes INTEGER DEFAULT 1,
        max_attempts INTEGER,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (course_id) REFERENCES courses (id) ON DELETE CASCADE
      )
    `);
    console.log('✅ course_quizzes table created');

    // Create quiz_questions table
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS quiz_questions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        quiz_id INTEGER NOT NULL,
        question TEXT NOT NULL,
        type TEXT NOT NULL,
        options TEXT,
        correct_answer TEXT NOT NULL,
        explanation TEXT,
        points INTEGER DEFAULT 1,
        order_index INTEGER NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (quiz_id) REFERENCES course_quizzes (id) ON DELETE CASCADE
      )
    `);
    console.log('✅ quiz_questions table created');

    // Create user_course_progress table
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS user_course_progress (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        course_id INTEGER NOT NULL,
        status TEXT NOT NULL,
        progress INTEGER DEFAULT 0,
        current_lesson_id INTEGER,
        completed_lessons TEXT,
        started_at TEXT,
        completed_at TEXT,
        last_accessed_at TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
        FOREIGN KEY (course_id) REFERENCES courses (id) ON DELETE CASCADE,
        FOREIGN KEY (current_lesson_id) REFERENCES course_lessons (id),
        UNIQUE(user_id, course_id)
      )
    `);
    console.log('✅ user_course_progress table created');

    // Create user_lesson_progress table
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS user_lesson_progress (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        lesson_id INTEGER NOT NULL,
        status TEXT NOT NULL,
        time_spent INTEGER DEFAULT 0,
        completed_at TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
        FOREIGN KEY (lesson_id) REFERENCES course_lessons (id) ON DELETE CASCADE,
        UNIQUE(user_id, lesson_id)
      )
    `);
    console.log('✅ user_lesson_progress table created');

    // Create quiz_attempts table
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS quiz_attempts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        quiz_id INTEGER NOT NULL,
        course_id INTEGER NOT NULL,
        score INTEGER,
        passed INTEGER DEFAULT 0,
        answers TEXT,
        time_spent INTEGER,
        started_at TEXT DEFAULT CURRENT_TIMESTAMP,
        completed_at TEXT,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
        FOREIGN KEY (quiz_id) REFERENCES course_quizzes (id) ON DELETE CASCADE,
        FOREIGN KEY (course_id) REFERENCES courses (id) ON DELETE CASCADE
      )
    `);
    console.log('✅ quiz_attempts table created');

    // Create quiz_attempt_answers table
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS quiz_attempt_answers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        attempt_id INTEGER NOT NULL,
        question_id INTEGER NOT NULL,
        answer TEXT NOT NULL,
        is_correct INTEGER DEFAULT 0,
        points_earned INTEGER DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (attempt_id) REFERENCES quiz_attempts (id) ON DELETE CASCADE,
        FOREIGN KEY (question_id) REFERENCES quiz_questions (id) ON DELETE CASCADE
      )
    `);
    console.log('✅ quiz_attempt_answers table created');

    // Create course_certificates table
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS course_certificates (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        course_id INTEGER NOT NULL,
        certificate_code TEXT NOT NULL UNIQUE,
        issued_at TEXT DEFAULT CURRENT_TIMESTAMP,
        quiz_score INTEGER,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
        FOREIGN KEY (course_id) REFERENCES courses (id) ON DELETE CASCADE
      )
    `);
    console.log('✅ course_certificates table created');

    // Create indexes for better performance
    sqlite.exec(`CREATE INDEX IF NOT EXISTS idx_courses_author ON courses (author_id)`);
    sqlite.exec(`CREATE INDEX IF NOT EXISTS idx_courses_category ON courses (category)`);
    sqlite.exec(`CREATE INDEX IF NOT EXISTS idx_courses_level ON courses (level)`);
    sqlite.exec(`CREATE INDEX IF NOT EXISTS idx_courses_slug ON courses (slug)`);
    sqlite.exec(`CREATE INDEX IF NOT EXISTS idx_courses_published ON courses (is_published)`);
    sqlite.exec(`CREATE INDEX IF NOT EXISTS idx_course_lessons_course ON course_lessons (course_id)`);
    sqlite.exec(`CREATE INDEX IF NOT EXISTS idx_course_lessons_order ON course_lessons (course_id, order_index)`);
    sqlite.exec(`CREATE INDEX IF NOT EXISTS idx_quiz_questions_quiz ON quiz_questions (quiz_id)`);
    sqlite.exec(`CREATE INDEX IF NOT EXISTS idx_user_course_progress_user ON user_course_progress (user_id)`);
    sqlite.exec(`CREATE INDEX IF NOT EXISTS idx_user_course_progress_course ON user_course_progress (course_id)`);
    sqlite.exec(`CREATE INDEX IF NOT EXISTS idx_user_course_progress_user_course ON user_course_progress (user_id, course_id)`);
    sqlite.exec(`CREATE INDEX IF NOT EXISTS idx_user_lesson_progress_user ON user_lesson_progress (user_id)`);
    sqlite.exec(`CREATE INDEX IF NOT EXISTS idx_user_lesson_progress_lesson ON user_lesson_progress (lesson_id)`);
    sqlite.exec(`CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user ON quiz_attempts (user_id)`);
    sqlite.exec(`CREATE INDEX IF NOT EXISTS idx_quiz_attempts_quiz ON quiz_attempts (quiz_id)`);
    sqlite.exec(`CREATE INDEX IF NOT EXISTS idx_quiz_attempt_answers_attempt ON quiz_attempt_answers (attempt_id)`);
    sqlite.exec(`CREATE INDEX IF NOT EXISTS idx_course_certificates_user ON course_certificates (user_id)`);
    sqlite.exec(`CREATE INDEX IF NOT EXISTS idx_course_certificates_code ON course_certificates (certificate_code)`);

    console.log('✅ Course tables and indexes created successfully');
  } catch (error) {
    console.error('❌ Error creating course tables:', error);
    throw error;
  }
}

// Run the main function
main().finally(() => {
  console.log('Closing database connection...');
  sqlite.close();
  console.log('Database connection closed.');
});

