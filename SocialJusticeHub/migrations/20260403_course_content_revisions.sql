CREATE TABLE IF NOT EXISTS course_definitions (
  id SERIAL PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  legacy_course_id INTEGER REFERENCES courses(id),
  source_path TEXT,
  current_published_revision_id INTEGER,
  view_count INTEGER DEFAULT 0,
  created_at TEXT DEFAULT now(),
  updated_at TEXT DEFAULT now()
);

CREATE TABLE IF NOT EXISTS course_revisions (
  id SERIAL PRIMARY KEY,
  course_definition_id INTEGER REFERENCES course_definitions(id),
  revision_number INTEGER NOT NULL,
  content_hash TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  excerpt TEXT,
  category TEXT NOT NULL,
  level TEXT NOT NULL,
  duration INTEGER,
  thumbnail_url TEXT,
  video_url TEXT,
  order_index INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  requires_auth BOOLEAN DEFAULT false,
  author_id INTEGER REFERENCES users(id),
  legacy_course_id INTEGER REFERENCES courses(id),
  seo_title TEXT,
  seo_description TEXT,
  search_summary TEXT,
  og_image_url TEXT,
  last_reviewed_at TEXT,
  indexable BOOLEAN DEFAULT true,
  published_at TEXT DEFAULT now(),
  created_at TEXT DEFAULT now()
);

CREATE TABLE IF NOT EXISTS course_lesson_identities (
  id SERIAL PRIMARY KEY,
  course_definition_id INTEGER REFERENCES course_definitions(id),
  key TEXT NOT NULL,
  legacy_lesson_id INTEGER REFERENCES course_lessons(id),
  created_at TEXT DEFAULT now(),
  updated_at TEXT DEFAULT now()
);

CREATE TABLE IF NOT EXISTS course_revision_lessons (
  id SERIAL PRIMARY KEY,
  course_revision_id INTEGER REFERENCES course_revisions(id),
  lesson_identity_id INTEGER REFERENCES course_lesson_identities(id),
  title TEXT NOT NULL,
  description TEXT,
  content_markdown TEXT NOT NULL,
  content_html TEXT NOT NULL,
  order_index INTEGER NOT NULL,
  type TEXT NOT NULL,
  video_url TEXT,
  document_url TEXT,
  duration INTEGER,
  is_required BOOLEAN DEFAULT true,
  legacy_lesson_id INTEGER REFERENCES course_lessons(id),
  seo_title TEXT,
  seo_description TEXT,
  search_summary TEXT,
  indexable BOOLEAN DEFAULT true,
  created_at TEXT DEFAULT now()
);

CREATE TABLE IF NOT EXISTS course_revision_quizzes (
  id SERIAL PRIMARY KEY,
  course_revision_id INTEGER UNIQUE REFERENCES course_revisions(id),
  legacy_quiz_id INTEGER REFERENCES course_quizzes(id),
  title TEXT NOT NULL,
  description TEXT,
  passing_score INTEGER DEFAULT 70,
  time_limit INTEGER,
  allow_retakes BOOLEAN DEFAULT true,
  max_attempts INTEGER,
  created_at TEXT DEFAULT now(),
  updated_at TEXT DEFAULT now()
);

CREATE TABLE IF NOT EXISTS course_revision_quiz_questions (
  id SERIAL PRIMARY KEY,
  quiz_revision_id INTEGER REFERENCES course_revision_quizzes(id),
  legacy_question_id INTEGER REFERENCES quiz_questions(id),
  question TEXT NOT NULL,
  type TEXT NOT NULL,
  options TEXT,
  correct_answer TEXT NOT NULL,
  explanation TEXT,
  points INTEGER DEFAULT 1,
  order_index INTEGER NOT NULL,
  created_at TEXT DEFAULT now()
);

ALTER TABLE user_course_progress
  ADD COLUMN IF NOT EXISTS course_definition_id INTEGER REFERENCES course_definitions(id),
  ADD COLUMN IF NOT EXISTS current_lesson_identity_id INTEGER REFERENCES course_lesson_identities(id),
  ADD COLUMN IF NOT EXISTS completed_lesson_identity_ids TEXT;

ALTER TABLE user_lesson_progress
  ADD COLUMN IF NOT EXISTS lesson_identity_id INTEGER REFERENCES course_lesson_identities(id);

ALTER TABLE quiz_attempts
  ADD COLUMN IF NOT EXISTS course_definition_id INTEGER REFERENCES course_definitions(id),
  ADD COLUMN IF NOT EXISTS course_revision_id INTEGER REFERENCES course_revisions(id),
  ADD COLUMN IF NOT EXISTS course_quiz_revision_id INTEGER REFERENCES course_revision_quizzes(id);

ALTER TABLE course_certificates
  ADD COLUMN IF NOT EXISTS course_definition_id INTEGER REFERENCES course_definitions(id),
  ADD COLUMN IF NOT EXISTS course_revision_id INTEGER REFERENCES course_revisions(id);

CREATE UNIQUE INDEX IF NOT EXISTS idx_course_definitions_legacy_course_id_unique
  ON course_definitions(legacy_course_id) WHERE legacy_course_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_course_revisions_definition_revision_unique
  ON course_revisions(course_definition_id, revision_number);

CREATE UNIQUE INDEX IF NOT EXISTS idx_course_revisions_definition_hash_unique
  ON course_revisions(course_definition_id, content_hash);

CREATE UNIQUE INDEX IF NOT EXISTS idx_course_lesson_identities_definition_key_unique
  ON course_lesson_identities(course_definition_id, key);

CREATE UNIQUE INDEX IF NOT EXISTS idx_course_lesson_identities_legacy_lesson_unique
  ON course_lesson_identities(legacy_lesson_id) WHERE legacy_lesson_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_course_revision_lessons_revision_identity_unique
  ON course_revision_lessons(course_revision_id, lesson_identity_id);

CREATE INDEX IF NOT EXISTS idx_course_definitions_current_published_revision
  ON course_definitions(current_published_revision_id);

CREATE INDEX IF NOT EXISTS idx_course_revision_lessons_revision_order
  ON course_revision_lessons(course_revision_id, order_index);

CREATE INDEX IF NOT EXISTS idx_course_revision_quiz_questions_revision_order
  ON course_revision_quiz_questions(quiz_revision_id, order_index);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'course_definitions_current_published_revision_id_fkey'
  ) THEN
    ALTER TABLE course_definitions
      ADD CONSTRAINT course_definitions_current_published_revision_id_fkey
      FOREIGN KEY (current_published_revision_id)
      REFERENCES course_revisions(id);
  END IF;
END $$;
