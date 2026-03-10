import { sqliteTable, integer, text, real, blob, type AnySQLiteColumn } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  username: text("username").notNull().unique(),
  password: text("password").notNull(), // Hashed password
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  location: text("location"),
  createdAt: text("created_at").default("CURRENT_TIMESTAMP"),
  updatedAt: text("updated_at").default("CURRENT_TIMESTAMP"),
  lastLogin: text("last_login"),
  loginAttempts: integer("login_attempts").default(0),
  lockedUntil: text("locked_until"),
  isActive: integer("is_active", { mode: 'boolean' }).default(true),
  emailVerified: integer("email_verified", { mode: 'boolean' }).default(false),
  
  // Email verification
  emailVerificationToken: text("email_verification_token"),
  emailVerificationExpires: text("email_verification_expires"),
  
  // Password reset
  passwordResetToken: text("password_reset_token"),
  passwordResetExpires: text("password_reset_expires"),
  
  // Onboarding
  onboardingCompleted: integer("onboarding_completed", { mode: 'boolean' }).default(false),

  // 2FA
  twoFactorEnabled: integer("two_factor_enabled", { mode: 'boolean' }).default(false),
  twoFactorSecret: text("two_factor_secret"),
  twoFactorBackupCodes: text("two_factor_backup_codes"), // JSON array
});

export const dreams = sqliteTable("dreams", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").references(() => users.id),
  dream: text("dream"),
  value: text("value"),
  need: text("need"),
  basta: text("basta"),
  location: text("location"),
  latitude: text("latitude"),
  longitude: text("longitude"),
  createdAt: text("created_at").default("CURRENT_TIMESTAMP"),
  type: text("type").notNull().default('dream').$type<'dream' | 'value' | 'need' | 'basta'>(),
});

export const communityPosts = sqliteTable("community_posts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").references(() => users.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  type: text("type").notNull(), // employment, exchange, volunteer, project, donation
  location: text("location").notNull(),
  participants: integer("participants"),
  status: text("status").notNull().default('active').$type<'active' | 'paused' | 'closed'>(),
  views: integer("views").default(0),
  expiresAt: text("expires_at"),
  contactEmail: text("contact_email"),
  contactPhone: text("contact_phone"),
  // Geographic data
  latitude: real("latitude"),
  longitude: real("longitude"),
  province: text("province"),
  city: text("city"),
  postalCode: text("postal_code"),
  country: text("country").default("Argentina"),
  address: text("address"),
  // New fields for initiative features
  requiresApproval: integer("requires_approval", { mode: 'boolean' }).default(false),
  memberCount: integer("member_count").default(0),
  settings: text("settings"), // JSON with initiative settings
  createdAt: text("created_at").default("CURRENT_TIMESTAMP"),
  updatedAt: text("updated_at").default("CURRENT_TIMESTAMP"),
});

export const resources = sqliteTable("resources", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  url: text("url"),
  createdAt: text("created_at").default("CURRENT_TIMESTAMP"),
});

export const inspiringStories = sqliteTable("inspiring_stories", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  excerpt: text("excerpt").notNull(),
  content: text("content").notNull(),
  authorId: integer("author_id").references(() => users.id),
  authorName: text("author_name"), // Para casos donde no hay usuario registrado
  authorEmail: text("author_email"), // Para casos donde no hay usuario registrado
  category: text("category").notNull().$type<'employment' | 'volunteering' | 'community_project' | 'personal_growth' | 'resource_sharing' | 'connection'>(),
  location: text("location").notNull(),
  province: text("province"),
  city: text("city"),
  // Impact metrics
  impactType: text("impact_type").notNull().$type<'job_created' | 'lives_changed' | 'hours_volunteered' | 'people_helped' | 'project_completed' | 'resource_shared'>(),
  impactCount: integer("impact_count").notNull(),
  impactDescription: text("impact_description").notNull(),
  // Media
  imageUrl: text("image_url"),
  videoUrl: text("video_url"),
  // Verification and moderation
  verified: integer("verified", { mode: 'boolean' }).default(false),
  featured: integer("featured", { mode: 'boolean' }).default(false),
  status: text("status").notNull().default('pending').$type<'pending' | 'approved' | 'rejected' | 'draft'>(),
  moderatedBy: integer("moderated_by").references(() => users.id),
  moderatedAt: text("moderated_at"),
  moderationNotes: text("moderation_notes"),
  // Engagement metrics
  views: integer("views").default(0),
  likes: integer("likes").default(0),
  shares: integer("shares").default(0),
  // Metadata
  tags: text("tags"), // JSON array of tags
  relatedPostId: integer("related_post_id").references(() => communityPosts.id), // Link to related community post
  createdAt: text("created_at").default("CURRENT_TIMESTAMP"),
  updatedAt: text("updated_at").default("CURRENT_TIMESTAMP"),
  publishedAt: text("published_at"),
});

// ==================== COMMUNITY INTERACTIONS TABLES ====================

export const communityPostInteractions = sqliteTable("community_post_interactions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  postId: integer("post_id").references(() => communityPosts.id),
  userId: integer("user_id").references(() => users.id),
  type: text("type").notNull().$type<'apply' | 'interest' | 'volunteer' | 'save'>(),
  status: text("status").notNull().default('pending').$type<'pending' | 'accepted' | 'rejected' | 'completed'>(),
  message: text("message"),
  createdAt: text("created_at").default("CURRENT_TIMESTAMP"),
  updatedAt: text("updated_at").default("CURRENT_TIMESTAMP"),
});

export const communityMessages = sqliteTable("community_messages", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  senderId: integer("sender_id").references(() => users.id),
  receiverId: integer("receiver_id").references(() => users.id),
  postId: integer("post_id").references(() => communityPosts.id),
  subject: text("subject").notNull(),
  content: text("content").notNull(),
  read: integer("read", { mode: 'boolean' }).default(false),
  createdAt: text("created_at").default("CURRENT_TIMESTAMP"),
});

export const communityPostActivity = sqliteTable("community_post_activity", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  postId: integer("post_id").references(() => communityPosts.id),
  userId: integer("user_id").references(() => users.id), // Can be null for anonymous views
  activityType: text("activity_type").notNull().$type<'view' | 'share' | 'click_contact' | 'apply' | 'interest' | 'save'>(),
  metadata: text("metadata"), // JSON string for additional data
  createdAt: text("created_at").default("CURRENT_TIMESTAMP"),
});

export const geographicLocations = sqliteTable("geographic_locations", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  type: text("type").notNull().$type<'province' | 'city' | 'neighborhood'>(),
  parentId: integer("parent_id").references((): AnySQLiteColumn => geographicLocations.id),
  latitude: real("latitude"),
  longitude: real("longitude"),
  postalCode: text("postal_code"),
  country: text("country").default("Argentina"),
  createdAt: text("created_at").default("CURRENT_TIMESTAMP"),
});

export const communityPostLikes = sqliteTable("community_post_likes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  postId: integer("post_id").references(() => communityPosts.id),
  userId: integer("user_id").references(() => users.id),
  createdAt: text("created_at").default("CURRENT_TIMESTAMP"),
});

export const communityPostViews = sqliteTable("community_post_views", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  postId: integer("post_id").references(() => communityPosts.id),
  userId: integer("user_id").references(() => users.id), // Can be null for anonymous views
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  viewedAt: text("viewed_at").default("CURRENT_TIMESTAMP"),
});

// Tablas avanzadas de IA y análisis (adaptadas para SQLite)
export const sentimentAnalysis = sqliteTable("sentiment_analysis", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  contentId: integer("content_id").notNull(),
  contentType: text("content_type").notNull(), // 'dream', 'post', 'story', etc.
  sentiment: text("sentiment").notNull(), // 'positive', 'negative', 'neutral'
  confidence: real("confidence"),
  emotions: text("emotions"), // JSON string para emociones
  keywords: text("keywords"), // JSON string para palabras clave
  topics: text("topics"), // JSON string para temas
  analyzedAt: text("analyzed_at").default("CURRENT_TIMESTAMP"),
});

export const textEmbeddings = sqliteTable("text_embeddings", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  contentId: integer("content_id").notNull(),
  contentType: text("content_type").notNull(),
  embedding: blob("embedding"), // Blob para vector de embeddings
  model: text("model").notNull(),
  createdAt: text("created_at").default("CURRENT_TIMESTAMP"),
});

export const userProfiles = sqliteTable("user_profiles", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").references(() => users.id).unique(),
  interests: text("interests"), // JSON string para intereses
  values: text("values"), // JSON string para valores inferidos
  personalityTraits: text("personality_traits"), // JSON string para rasgos
  engagementScore: real("engagement_score"),
  lastAnalyzed: text("last_analyzed"),
});

export const recommendations = sqliteTable("recommendations", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").references(() => users.id),
  recommendationType: text("recommendation_type").notNull(), // 'content', 'connection', 'project'
  targetId: integer("target_id").notNull(),
  targetType: text("target_type").notNull(),
  score: real("score"),
  reason: text("reason"),
  createdAt: text("created_at").default("CURRENT_TIMESTAMP"),
  clicked: integer("clicked", { mode: 'boolean' }).default(false),
  dismissed: integer("dismissed", { mode: 'boolean' }).default(false),
});

export const aiInsights = sqliteTable("ai_insights", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  insightType: text("insight_type").notNull(), // 'trend', 'pattern', 'prediction'
  scope: text("scope").notNull(), // 'global', 'regional', 'local'
  title: text("title").notNull(),
  description: text("description").notNull(),
  data: text("data"), // JSON string para datos adicionales
  confidence: real("confidence"),
  validUntil: text("valid_until"),
  createdAt: text("created_at").default("CURRENT_TIMESTAMP"),
});

export const blockchainTransactions = sqliteTable("blockchain_transactions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  txHash: text("tx_hash").notNull().unique(),
  userId: integer("user_id").references(() => users.id),
  transactionType: text("transaction_type").notNull(), // 'vote', 'donation', 'certification'
  targetId: integer("target_id"),
  targetType: text("target_type"),
  amount: text("amount"), // String para precisión de criptomonedas
  network: text("network").notNull(),
  status: text("status").notNull(), // 'pending', 'confirmed', 'failed'
  createdAt: text("created_at").default("CURRENT_TIMESTAMP"),
  confirmedAt: text("confirmed_at"),
});

export const iotSensors = sqliteTable("iot_sensors", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  sensorId: text("sensor_id").notNull().unique(),
  sensorType: text("sensor_type").notNull(),
  location: text("location").notNull(),
  latitude: real("latitude"),
  longitude: real("longitude"),
  installationDate: text("installation_date"),
  lastReading: text("last_reading"),
  status: text("status").notNull(), // 'active', 'inactive', 'maintenance'
  metadata: text("metadata"), // JSON string para configuración
});

export const sensorData = sqliteTable("sensor_data", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  sensorId: integer("sensor_id").references(() => iotSensors.id),
  reading: text("reading").notNull(), // JSON string para datos del sensor
  timestamp: text("timestamp").default("CURRENT_TIMESTAMP"),
  quality: text("quality"), // 'good', 'moderate', 'poor'
  processed: integer("processed", { mode: 'boolean' }).default(false),
});

export const vrMeetings = sqliteTable("vr_meetings", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  description: text("description"),
  organizerId: integer("organizer_id").references(() => users.id),
  maxParticipants: integer("max_participants"),
  scheduledFor: text("scheduled_for"),
  duration: integer("duration"),
  meetingUrl: text("meeting_url"),
  recordingUrl: text("recording_url"),
  status: text("status").notNull(), // 'scheduled', 'active', 'completed', 'cancelled'
  metadata: text("metadata"), // JSON string para configuración VR
  createdAt: text("created_at").default("CURRENT_TIMESTAMP"),
});

export const meetingParticipants = sqliteTable("meeting_participants", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  meetingId: integer("meeting_id").references(() => vrMeetings.id),
  userId: integer("user_id").references(() => users.id),
  joinedAt: text("joined_at"),
  leftAt: text("left_at"),
  role: text("role"), // 'organizer', 'participant', 'moderator'
});

// ==================== BLOG & VLOG TABLES ====================

// Tabla principal de posts de blog y vlog
export const blogPosts = sqliteTable("blog_posts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  excerpt: text("excerpt").notNull(),
  content: text("content").notNull(),
  authorId: integer("author_id").references(() => users.id),
  publishedAt: text("published_at").default("CURRENT_TIMESTAMP"),
  category: text("category").notNull(),
  featured: integer("featured", { mode: 'boolean' }).default(false),
  imageUrl: text("image_url"),
  videoUrl: text("video_url"),
  viewCount: integer("view_count").default(0),
  type: text("type").notNull().$type<'blog' | 'vlog'>(),
  createdAt: text("created_at").default("CURRENT_TIMESTAMP"),
  updatedAt: text("updated_at").default("CURRENT_TIMESTAMP"),
});

// Tabla de tags para posts
export const postTags = sqliteTable("post_tags", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  postId: integer("post_id").references(() => blogPosts.id),
  tag: text("tag").notNull(),
});

// Tabla de likes en posts
export const postLikes = sqliteTable("post_likes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  postId: integer("post_id").references(() => blogPosts.id),
  userId: integer("user_id").references(() => users.id),
  createdAt: text("created_at").default("CURRENT_TIMESTAMP"),
});

// Tabla de comentarios en posts
export const postComments = sqliteTable("post_comments", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  postId: integer("post_id").references(() => blogPosts.id),
  userId: integer("user_id").references(() => users.id),
  parentId: integer("parent_id").references((): AnySQLiteColumn => postComments.id), // Para replies
  content: text("content").notNull(),
  createdAt: text("created_at").default("CURRENT_TIMESTAMP"),
  updatedAt: text("updated_at").default("CURRENT_TIMESTAMP"),
});

// Tabla de bookmarks de posts
export const postBookmarks = sqliteTable("post_bookmarks", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  postId: integer("post_id").references(() => blogPosts.id),
  userId: integer("user_id").references(() => users.id),
  createdAt: text("created_at").default("CURRENT_TIMESTAMP"),
});

// Tabla de views de posts
export const postViews = sqliteTable("post_views", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  postId: integer("post_id").references(() => blogPosts.id),
  userId: integer("user_id").references(() => users.id), // Puede ser null para views anónimas
  sessionId: text("session_id"), // Para tracking de usuarios no autenticados
  viewedAt: text("viewed_at").default("CURRENT_TIMESTAMP"),
});

// ==================== COURSES TABLES ====================

// Tabla de cursos
export const courses = sqliteTable("courses", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description").notNull(),
  excerpt: text("excerpt"), // Resumen corto para cards
  category: text("category").notNull().$type<'vision' | 'action' | 'community' | 'reflection' | 'hombre-gris' | 'economia' | 'comunicacion' | 'civica'>(),
  level: text("level").notNull().$type<'beginner' | 'intermediate' | 'advanced'>(),
  duration: integer("duration"), // Duración estimada en minutos
  thumbnailUrl: text("thumbnail_url"),
  videoUrl: text("video_url"), // Opcional: video introductorio
  orderIndex: integer("order_index").default(0),
  isPublished: integer("is_published", { mode: 'boolean' }).default(false),
  isFeatured: integer("is_featured", { mode: 'boolean' }).default(false),
  requiresAuth: integer("requires_auth", { mode: 'boolean' }).default(false), // Si requiere autenticación
  authorId: integer("author_id").references(() => users.id),
  viewCount: integer("view_count").default(0),
  createdAt: text("created_at").default("CURRENT_TIMESTAMP"),
  updatedAt: text("updated_at").default("CURRENT_TIMESTAMP"),
});

// Tabla de lecciones dentro de un curso
export const courseLessons = sqliteTable("course_lessons", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  courseId: integer("course_id").references(() => courses.id),
  title: text("title").notNull(),
  description: text("description"),
  content: text("content").notNull(), // Contenido HTML/Markdown
  orderIndex: integer("order_index").notNull(),
  type: text("type").notNull().$type<'text' | 'video' | 'interactive' | 'document'>(),
  videoUrl: text("video_url"),
  documentUrl: text("document_url"),
  duration: integer("duration"), // Duración estimada en minutos
  isRequired: integer("is_required", { mode: 'boolean' }).default(true),
  createdAt: text("created_at").default("CURRENT_TIMESTAMP"),
  updatedAt: text("updated_at").default("CURRENT_TIMESTAMP"),
});

// Tabla de quizzes (un quiz por curso)
export const courseQuizzes = sqliteTable("course_quizzes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  courseId: integer("course_id").references(() => courses.id).unique(),
  title: text("title").notNull(),
  description: text("description"),
  passingScore: integer("passing_score").default(70), // Porcentaje mínimo para aprobar
  timeLimit: integer("time_limit"), // Tiempo límite en minutos (opcional)
  allowRetakes: integer("allow_retakes", { mode: 'boolean' }).default(true),
  maxAttempts: integer("max_attempts"), // Máximo de intentos (null = ilimitado)
  createdAt: text("created_at").default("CURRENT_TIMESTAMP"),
  updatedAt: text("updated_at").default("CURRENT_TIMESTAMP"),
});

// Tabla de preguntas del quiz
export const quizQuestions = sqliteTable("quiz_questions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  quizId: integer("quiz_id").references(() => courseQuizzes.id),
  question: text("question").notNull(),
  type: text("type").notNull().$type<'multiple_choice' | 'true_false' | 'short_answer'>(),
  options: text("options"), // JSON array de opciones para multiple choice
  correctAnswer: text("correct_answer").notNull(), // JSON para respuestas correctas
  explanation: text("explanation"), // Explicación de la respuesta correcta
  points: integer("points").default(1),
  orderIndex: integer("order_index").notNull(),
  createdAt: text("created_at").default("CURRENT_TIMESTAMP"),
});

// Tabla de progreso del usuario en cursos
export const userCourseProgress = sqliteTable("user_course_progress", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").references(() => users.id),
  courseId: integer("course_id").references(() => courses.id),
  status: text("status").notNull().$type<'not_started' | 'in_progress' | 'completed'>(),
  progress: integer("progress").default(0), // Porcentaje 0-100
  currentLessonId: integer("current_lesson_id").references(() => courseLessons.id),
  completedLessons: text("completed_lessons"), // JSON array de IDs de lecciones completadas
  startedAt: text("started_at"),
  completedAt: text("completed_at"),
  lastAccessedAt: text("last_accessed_at"),
  createdAt: text("created_at").default("CURRENT_TIMESTAMP"),
  updatedAt: text("updated_at").default("CURRENT_TIMESTAMP"),
});

// Tabla de progreso de lecciones individuales
export const userLessonProgress = sqliteTable("user_lesson_progress", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").references(() => users.id),
  lessonId: integer("lesson_id").references(() => courseLessons.id),
  status: text("status").notNull().$type<'not_started' | 'in_progress' | 'completed'>(),
  timeSpent: integer("time_spent").default(0), // Tiempo en segundos
  completedAt: text("completed_at"),
  createdAt: text("created_at").default("CURRENT_TIMESTAMP"),
  updatedAt: text("updated_at").default("CURRENT_TIMESTAMP"),
});

// Tabla de intentos de quiz
export const quizAttempts = sqliteTable("quiz_attempts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").references(() => users.id),
  quizId: integer("quiz_id").references(() => courseQuizzes.id),
  courseId: integer("course_id").references(() => courses.id),
  score: integer("score"), // Porcentaje obtenido
  passed: integer("passed", { mode: 'boolean' }).default(false),
  answers: text("answers"), // JSON con las respuestas del usuario
  timeSpent: integer("time_spent"), // Tiempo en segundos
  startedAt: text("started_at").default("CURRENT_TIMESTAMP"),
  completedAt: text("completed_at"),
});

// Tabla de respuestas individuales del quiz
export const quizAttemptAnswers = sqliteTable("quiz_attempt_answers", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  attemptId: integer("attempt_id").references(() => quizAttempts.id),
  questionId: integer("question_id").references(() => quizQuestions.id),
  answer: text("answer").notNull(), // Respuesta del usuario (JSON)
  isCorrect: integer("is_correct", { mode: 'boolean' }).default(false),
  pointsEarned: integer("points_earned").default(0),
  createdAt: text("created_at").default("CURRENT_TIMESTAMP"),
});

// Tabla de certificados (opcional - para usuarios que completan cursos)
export const courseCertificates = sqliteTable("course_certificates", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").references(() => users.id),
  courseId: integer("course_id").references(() => courses.id),
  certificateCode: text("certificate_code").notNull().unique(), // Código único del certificado
  issuedAt: text("issued_at").default("CURRENT_TIMESTAMP"),
  quizScore: integer("quiz_score"), // Score del quiz final
});

// ==================== GAMIFICATION TABLES ====================

// Tabla de niveles de usuario (progreso en la Guía del Cambio)
export const userLevels = sqliteTable("user_levels", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").references(() => users.id).unique(),
  currentLevel: integer("current_level").default(1), // 1-5
  experience: integer("experience").default(0),
  experienceToNext: integer("experience_to_next").default(500),
  streak: integer("streak").default(0), // Días consecutivos
  lastActivityDate: text("last_activity_date"),
  createdAt: text("created_at").default("CURRENT_TIMESTAMP"),
  updatedAt: text("updated_at").default("CURRENT_TIMESTAMP")
});

// Tabla de desafíos
export const challenges = sqliteTable("challenges", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  level: integer("level").notNull(), // 1-5
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(), // 'vision', 'action', 'community', 'reflection'
  difficulty: text("difficulty").notNull(), // 'beginner', 'intermediate', 'advanced'
  frequency: text("frequency").notNull(), // 'daily', 'weekly', 'monthly', 'annual', 'one-time'
  experience: integer("experience").notNull(), // XP que otorga
  duration: text("duration"), // "15 min", "1 hora", etc.
  iconName: text("icon_name"), // Nombre del icono de Lucide
  orderIndex: integer("order_index").default(0),
  isActive: integer("is_active", { mode: 'boolean' }).default(true),
  createdAt: text("created_at").default("CURRENT_TIMESTAMP")
});

// Tabla de pasos de desafíos
export const challengeSteps = sqliteTable("challenge_steps", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  challengeId: integer("challenge_id").references(() => challenges.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  type: text("type").notNull(), // 'question', 'action', 'reflection', 'quiz'
  orderIndex: integer("order_index").notNull(),
  data: text("data"), // JSON con opciones, preguntas, etc.
  createdAt: text("created_at").default("CURRENT_TIMESTAMP")
});

// Tabla de progreso de usuario en desafíos
export const userChallengeProgress = sqliteTable("user_challenge_progress", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").references(() => users.id),
  challengeId: integer("challenge_id").references(() => challenges.id),
  status: text("status").notNull(), // 'not_started', 'in_progress', 'completed', 'failed'
  currentStep: integer("current_step").default(0),
  completedSteps: text("completed_steps"), // JSON array de IDs
  startedAt: text("started_at"),
  completedAt: text("completed_at"),
  lastActivityAt: text("last_activity_at"),
  createdAt: text("created_at").default("CURRENT_TIMESTAMP")
});

// Tabla de badges/logros
export const badges = sqliteTable("badges", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description").notNull(),
  iconName: text("icon_name").notNull(),
  category: text("category").notNull(), // 'level', 'streak', 'challenge', 'special', 'reading'
  requirement: text("requirement").notNull(), // Descripción del requisito
  requirementData: text("requirement_data"), // JSON con criterios específicos
  rarity: text("rarity").notNull(), // 'common', 'rare', 'epic', 'legendary'
  experienceReward: integer("experience_reward").default(0),
  orderIndex: integer("order_index").default(0),
  createdAt: text("created_at").default("CURRENT_TIMESTAMP")
});

// Tabla de badges obtenidos por usuarios
export const userBadges = sqliteTable("user_badges", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").references(() => users.id),
  badgeId: integer("badge_id").references(() => badges.id),
  earnedAt: text("earned_at").default("CURRENT_TIMESTAMP"),
  seen: integer("seen", { mode: 'boolean' }).default(false)
});

// Tabla de actividad diaria del usuario
export const userDailyActivity = sqliteTable("user_daily_activity", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").references(() => users.id),
  date: text("date").notNull(), // YYYY-MM-DD
  experienceGained: integer("experience_gained").default(0),
  challengesCompleted: integer("challenges_completed").default(0),
  actionsCompleted: integer("actions_completed").default(0),
  streakActive: integer("streak_active", { mode: 'boolean' }).default(true),
  createdAt: text("created_at").default("CURRENT_TIMESTAMP")
});

// ==================== NUEVAS TABLAS DE GAMIFICACIÓN ¡BASTA! ====================

// Tabla de compromisos del usuario
export const userCommitments = sqliteTable("user_commitments", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").references(() => users.id),
  commitmentText: text("commitment_text").notNull(),
  commitmentType: text("commitment_type").notNull(), // 'initial', 'intermediate', 'public'
  province: text("province"),
  city: text("city"),
  latitude: real("latitude"),
  longitude: real("longitude"),
  status: text("status").notNull().default('active'), // 'active', 'completed', 'broken'
  pointsAwarded: integer("points_awarded").default(0),
  createdAt: text("created_at").default("CURRENT_TIMESTAMP"),
  completedAt: text("completed_at")
});

// Tabla de acciones del usuario (para tracking de puntos)
export const userActions = sqliteTable("user_actions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").references(() => users.id),
  actionType: text("action_type").notNull(), // 'page_view', 'commitment', 'share', 'community_post', etc.
  points: integer("points").notNull(),
  metadata: text("metadata"), // JSON con datos adicionales
  createdAt: text("created_at").default("CURRENT_TIMESTAMP")
});

// Tabla de progreso del usuario (simplificada para ¡BASTA!)
export const userProgress = sqliteTable("user_progress", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").references(() => users.id).unique(),
  level: integer("level").default(1), // 1-5 niveles del Hombre Gris
  points: integer("points").default(0),
  rank: text("rank").default('Novato'), // Novato, Despierto, Hombre Gris, Agente de Cambio, Líder del Movimiento
  totalActions: integer("total_actions").default(0),
  lastActionAt: text("last_action_at"),
  createdAt: text("created_at").default("CURRENT_TIMESTAMP"),
  updatedAt: text("updated_at").default("CURRENT_TIMESTAMP")
});

// Tabla de ranking semanal
export const weeklyRankings = sqliteTable("weekly_rankings", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").references(() => users.id),
  weekStart: text("week_start").notNull(), // YYYY-MM-DD
  points: integer("points").default(0),
  rank: integer("rank"),
  createdAt: text("created_at").default("CURRENT_TIMESTAMP")
});

// Tabla de ranking mensual
export const monthlyRankings = sqliteTable("monthly_rankings", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").references(() => users.id),
  monthStart: text("month_start").notNull(), // YYYY-MM
  points: integer("points").default(0),
  rank: integer("rank"),
  createdAt: text("created_at").default("CURRENT_TIMESTAMP")
});

// Tabla de ranking por provincia
export const provinceRankings = sqliteTable("province_rankings", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").references(() => users.id),
  province: text("province").notNull(),
  points: integer("points").default(0),
  rank: integer("rank"),
  updatedAt: text("updated_at").default("CURRENT_TIMESTAMP")
});

// ==================== NEW INITIATIVE FEATURES TABLES ====================

// Miembros de iniciativas con roles personalizables
export const initiativeMembers = sqliteTable("initiative_members", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  postId: integer("post_id").references(() => communityPosts.id),
  userId: integer("user_id").references(() => users.id),
  role: text("role").notNull(), // Roles personalizables por iniciativa
  status: text("status").notNull().default('active').$type<'active' | 'inactive' | 'left'>(),
  permissions: text("permissions"), // JSON: {canEdit, canInvite, canPost, etc}
  joinedAt: text("joined_at").default("CURRENT_TIMESTAMP"),
  leftAt: text("left_at")
});

// Hitos de iniciativas
export const initiativeMilestones = sqliteTable("initiative_milestones", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  postId: integer("post_id").references(() => communityPosts.id),
  title: text("title").notNull(),
  description: text("description"),
  status: text("status").notNull().default('pending').$type<'pending' | 'in_progress' | 'completed' | 'cancelled'>(),
  dueDate: text("due_date"),
  completedAt: text("completed_at"),
  completedBy: integer("completed_by").references(() => users.id),
  orderIndex: integer("order_index").default(0),
  createdAt: text("created_at").default("CURRENT_TIMESTAMP"),
  updatedAt: text("updated_at").default("CURRENT_TIMESTAMP")
});

// Chat/Mensajes de iniciativa
export const initiativeMessages = sqliteTable("initiative_messages", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  postId: integer("post_id").references(() => communityPosts.id),
  userId: integer("user_id").references(() => users.id),
  content: text("content").notNull(),
  type: text("type").notNull().default('message').$type<'message' | 'system' | 'milestone' | 'member_join' | 'member_leave'>(),
  metadata: text("metadata"), // JSON para datos adicionales
  createdAt: text("created_at").default("CURRENT_TIMESTAMP")
});

// Tareas de iniciativa
export const initiativeTasks = sqliteTable("initiative_tasks", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  postId: integer("post_id").references(() => communityPosts.id),
  milestoneId: integer("milestone_id").references(() => initiativeMilestones.id),
  title: text("title").notNull(),
  description: text("description"),
  assignedTo: integer("assigned_to").references(() => users.id),
  status: text("status").notNull().default('todo').$type<'todo' | 'in_progress' | 'done'>(),
  priority: text("priority").default('medium').$type<'low' | 'medium' | 'high'>(),
  dueDate: text("due_date"),
  completedAt: text("completed_at"),
  createdBy: integer("created_by").references(() => users.id),
  createdAt: text("created_at").default("CURRENT_TIMESTAMP"),
  updatedAt: text("updated_at").default("CURRENT_TIMESTAMP")
});

// Feed de actividad global
export const activityFeed = sqliteTable("activity_feed", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  type: text("type").notNull().$type<'new_initiative' | 'new_member' | 'milestone_completed' | 'task_completed' | 'comment' | 'update'>(),
  postId: integer("post_id").references(() => communityPosts.id),
  userId: integer("user_id").references(() => users.id),
  targetId: integer("target_id"), // ID del milestone, task, etc
  title: text("title").notNull(),
  description: text("description"),
  metadata: text("metadata"), // JSON con datos adicionales
  createdAt: text("created_at").default("CURRENT_TIMESTAMP")
});

// Solicitudes de unión (para posts con aprobación)
export const membershipRequests = sqliteTable("membership_requests", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  postId: integer("post_id").references(() => communityPosts.id),
  userId: integer("user_id").references(() => users.id),
  message: text("message"), // Mensaje de presentación
  status: text("status").notNull().default('pending').$type<'pending' | 'approved' | 'rejected'>(),
  reviewedBy: integer("reviewed_by").references(() => users.id),
  reviewedAt: text("reviewed_at"),
  createdAt: text("created_at").default("CURRENT_TIMESTAMP")
});

// Notificaciones
export const notifications = sqliteTable("notifications", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").references(() => users.id),
  type: text("type").notNull().$type<'member_joined' | 'milestone_completed' | 'task_assigned' | 'message' | 'membership_approved' | 'membership_rejected'>(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  postId: integer("post_id").references(() => communityPosts.id),
  targetId: integer("target_id"), // ID del recurso relacionado
  read: integer("read", { mode: 'boolean' }).default(false),
  createdAt: text("created_at").default("CURRENT_TIMESTAMP")
});

// ==================== LIFE AREAS TABLES ====================

// Tabla de las 12 áreas principales de vida
export const lifeAreas = sqliteTable("life_areas", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description"),
  iconName: text("icon_name"),
  orderIndex: integer("order_index").notNull(),
  colorTheme: text("color_theme"), // JSON con colores del tema
  createdAt: text("created_at").default("CURRENT_TIMESTAMP")
});

// Subcategorías de cada área
export const lifeAreaSubcategories = sqliteTable("life_area_subcategories", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  lifeAreaId: integer("life_area_id").references(() => lifeAreas.id),
  name: text("name").notNull(),
  description: text("description"),
  orderIndex: integer("order_index").notNull(),
  createdAt: text("created_at").default("CURRENT_TIMESTAMP")
});

// Quizzes por área
export const lifeAreaQuizzes = sqliteTable("life_area_quizzes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  lifeAreaId: integer("life_area_id").references(() => lifeAreas.id),
  title: text("title").notNull(),
  description: text("description"),
  version: integer("version").default(1),
  createdAt: text("created_at").default("CURRENT_TIMESTAMP")
});

// Preguntas del quiz
export const lifeAreaQuizQuestions = sqliteTable("life_area_quiz_questions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  quizId: integer("quiz_id").references(() => lifeAreaQuizzes.id),
  questionText: text("question_text").notNull(),
  questionType: text("question_type").notNull().$type<'scale' | 'multiple_choice' | 'text'>(),
  orderIndex: integer("order_index").notNull(),
  category: text("category").notNull().$type<'current' | 'desired'>(),
  subcategoryId: integer("subcategory_id").references(() => lifeAreaSubcategories.id),
  createdAt: text("created_at").default("CURRENT_TIMESTAMP")
});

// Respuestas del usuario al quiz
export const lifeAreaQuizResponses = sqliteTable("life_area_quiz_responses", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").references(() => users.id),
  quizId: integer("quiz_id").references(() => lifeAreaQuizzes.id),
  questionId: integer("question_id").references(() => lifeAreaQuizQuestions.id),
  currentValue: integer("current_value"), // 1-100
  desiredValue: integer("desired_value"), // 1-100
  answeredAt: text("answered_at").default("CURRENT_TIMESTAMP"),
  createdAt: text("created_at").default("CURRENT_TIMESTAMP")
});

// Puntuaciones calculadas (1-100)
export const lifeAreaScores = sqliteTable("life_area_scores", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").references(() => users.id),
  lifeAreaId: integer("life_area_id").references(() => lifeAreas.id),
  subcategoryId: integer("subcategory_id").references(() => lifeAreaSubcategories.id),
  currentScore: integer("current_score").notNull(), // 1-100
  desiredScore: integer("desired_score").notNull(), // 1-100
  gap: integer("gap").notNull(), // desired - current
  lastUpdated: text("last_updated").default("CURRENT_TIMESTAMP"),
  createdAt: text("created_at").default("CURRENT_TIMESTAMP")
});

// Acciones recomendadas predefinidas
export const lifeAreaActions = sqliteTable("life_area_actions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  lifeAreaId: integer("life_area_id").references(() => lifeAreas.id),
  subcategoryId: integer("subcategory_id").references(() => lifeAreaSubcategories.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  difficulty: text("difficulty").notNull().$type<'beginner' | 'intermediate' | 'advanced'>(),
  estimatedDuration: text("estimated_duration"), // "15 min", "1 hora", etc.
  priority: integer("priority").default(0), // Mayor número = mayor prioridad
  category: text("category"), // Categoría de la acción
  xpReward: integer("xp_reward").default(50),
  seedReward: integer("seed_reward").default(10),
  createdAt: text("created_at").default("CURRENT_TIMESTAMP")
});

// Progreso del usuario en acciones
export const userLifeAreaProgress = sqliteTable("user_life_area_progress", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").references(() => users.id),
  actionId: integer("action_id").references(() => lifeAreaActions.id),
  status: text("status").notNull().$type<'not_started' | 'in_progress' | 'completed' | 'abandoned'>(),
  startedAt: text("started_at"),
  completedAt: text("completed_at"),
  notes: text("notes"),
  evidence: text("evidence"), // JSON con evidencia (fotos, links, etc.)
  createdAt: text("created_at").default("CURRENT_TIMESTAMP"),
  updatedAt: text("updated_at").default("CURRENT_TIMESTAMP")
});

// Milestones del usuario
export const lifeAreaMilestones = sqliteTable("life_area_milestones", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").references(() => users.id),
  lifeAreaId: integer("life_area_id").references(() => lifeAreas.id),
  title: text("title").notNull(),
  description: text("description"),
  targetScore: integer("target_score").notNull(), // Score objetivo
  achievedScore: integer("achieved_score"),
  achievedAt: text("achieved_at"),
  shareToken: text("share_token").unique(), // Token único para compartir
  sharedAt: text("shared_at"),
  createdAt: text("created_at").default("CURRENT_TIMESTAMP")
});

// Indicadores en tiempo real
export const lifeAreaIndicators = sqliteTable("life_area_indicators", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").references(() => users.id),
  lifeAreaId: integer("life_area_id").references(() => lifeAreas.id),
  indicatorType: text("indicator_type").notNull().$type<'score_change' | 'action_completed' | 'streak' | 'milestone' | 'improvement'>(),
  value: real("value").notNull(),
  metadata: text("metadata"), // JSON con datos adicionales
  recordedAt: text("recorded_at").default("CURRENT_TIMESTAMP")
});

// Estadísticas comunitarias agregadas
export const lifeAreaCommunityStats = sqliteTable("life_area_community_stats", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  lifeAreaId: integer("life_area_id").references(() => lifeAreas.id),
  period: text("period").notNull().$type<'daily' | 'weekly' | 'monthly'>(),
  avgScore: real("avg_score"),
  medianScore: real("median_score"),
  totalUsers: integer("total_users").default(0),
  percentileData: text("percentile_data"), // JSON con datos de percentiles
  calculatedAt: text("calculated_at").default("CURRENT_TIMESTAMP")
});

// ==================== GAMIFICATION TABLES ====================

// Registro detallado de XP
export const lifeAreaXpLog = sqliteTable("life_area_xp_log", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").references(() => users.id),
  lifeAreaId: integer("life_area_id").references(() => lifeAreas.id),
  xpAmount: integer("xp_amount").notNull(),
  sourceType: text("source_type").notNull().$type<'quiz' | 'action' | 'milestone' | 'streak' | 'challenge' | 'social'>(),
  sourceId: integer("source_id"), // ID del recurso que generó el XP
  multiplier: real("multiplier").default(1.0),
  createdAt: text("created_at").default("CURRENT_TIMESTAMP")
});

// Niveles por área del usuario
export const lifeAreaLevels = sqliteTable("life_area_levels", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").references(() => users.id),
  lifeAreaId: integer("life_area_id").references(() => lifeAreas.id),
  level: integer("level").default(1), // 1-10
  xpCurrent: integer("xp_current").default(0),
  xpRequired: integer("xp_required").default(100),
  unlockedFeatures: text("unlocked_features"), // JSON con features desbloqueadas
  levelUpAt: text("level_up_at"),
  createdAt: text("created_at").default("CURRENT_TIMESTAMP"),
  updatedAt: text("updated_at").default("CURRENT_TIMESTAMP")
});

// Rachas del usuario
export const lifeAreaStreaks = sqliteTable("life_area_streaks", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").references(() => users.id),
  streakType: text("streak_type").notNull().$type<'daily' | 'weekly' | 'monthly'>(),
  currentStreak: integer("current_streak").default(0),
  longestStreak: integer("longest_streak").default(0),
  lastActivityDate: text("last_activity_date"),
  bonusMultiplier: real("bonus_multiplier").default(1.0),
  createdAt: text("created_at").default("CURRENT_TIMESTAMP"),
  updatedAt: text("updated_at").default("CURRENT_TIMESTAMP")
});

// Badges específicos de áreas de vida
export const lifeAreaBadges = sqliteTable("life_area_badges", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description").notNull(),
  iconName: text("icon_name").notNull(),
  rarity: text("rarity").notNull().$type<'common' | 'rare' | 'epic' | 'legendary'>(),
  requirementType: text("requirement_type").notNull().$type<'quiz_complete' | 'score_reach' | 'actions_complete' | 'streak' | 'share' | 'social' | 'mastery'>(),
  requirementData: text("requirement_data"), // JSON con criterios específicos
  xpReward: integer("xp_reward").default(0),
  seedReward: integer("seed_reward").default(0),
  createdAt: text("created_at").default("CURRENT_TIMESTAMP")
});

// Badges obtenidos por usuarios
export const userLifeAreaBadges = sqliteTable("user_life_area_badges", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").references(() => users.id),
  badgeId: integer("badge_id").references(() => lifeAreaBadges.id),
  earnedAt: text("earned_at").default("CURRENT_TIMESTAMP"),
  seen: integer("seen", { mode: 'boolean' }).default(false),
  sharedAt: text("shared_at")
});

// Monedas virtuales del usuario
export const lifeAreaCurrency = sqliteTable("life_area_currency", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").references(() => users.id).unique(),
  currencyType: text("currency_type").default("seeds"),
  amount: integer("amount").default(0),
  totalEarned: integer("total_earned").default(0),
  totalSpent: integer("total_spent").default(0),
  updatedAt: text("updated_at").default("CURRENT_TIMESTAMP"),
  createdAt: text("created_at").default("CURRENT_TIMESTAMP")
});

// Cofres de recompensas
export const lifeAreaRewardChests = sqliteTable("life_area_reward_chests", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").references(() => users.id),
  chestType: text("chest_type").notNull().$type<'daily' | 'weekly' | 'monthly' | 'premium'>(),
  rewards: text("rewards"), // JSON con recompensas
  openedAt: text("opened_at"),
  expiresAt: text("expires_at"),
  rarity: text("rarity").$type<'common' | 'rare' | 'epic' | 'legendary'>(),
  createdAt: text("created_at").default("CURRENT_TIMESTAMP")
});

// Desafíos especiales
export const lifeAreaChallenges = sqliteTable("life_area_challenges", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  challengeType: text("challenge_type").notNull().$type<'daily' | 'weekly' | 'monthly' | 'community' | 'seasonal'>(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  requirements: text("requirements"), // JSON con requisitos
  rewards: text("rewards"), // JSON con recompensas
  startDate: text("start_date").notNull(),
  endDate: text("end_date").notNull(),
  isActive: integer("is_active", { mode: 'boolean' }).default(true),
  participantCount: integer("participant_count").default(0),
  createdAt: text("created_at").default("CURRENT_TIMESTAMP")
});

// Progreso en desafíos
export const userLifeAreaChallenges = sqliteTable("user_life_area_challenges", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").references(() => users.id),
  challengeId: integer("challenge_id").references(() => lifeAreaChallenges.id),
  progress: text("progress"), // JSON con progreso
  status: text("status").notNull().$type<'joined' | 'in_progress' | 'completed' | 'failed'>(),
  completedAt: text("completed_at"),
  rewardsClaimed: integer("rewards_claimed", { mode: 'boolean' }).default(false),
  createdAt: text("created_at").default("CURRENT_TIMESTAMP"),
  updatedAt: text("updated_at").default("CURRENT_TIMESTAMP")
});

// Maestría por área
export const lifeAreaMastery = sqliteTable("life_area_mastery", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").references(() => users.id),
  lifeAreaId: integer("life_area_id").references(() => lifeAreas.id),
  masteryPercentage: real("mastery_percentage").default(0), // 0-100
  actionsCompleted: integer("actions_completed").default(0),
  totalActions: integer("total_actions").default(0),
  timeInvestedMinutes: integer("time_invested_minutes").default(0),
  unlockedContent: text("unlocked_content"), // JSON con contenido desbloqueado
  masteryLevel: text("mastery_level").default("novice").$type<'novice' | 'apprentice' | 'adept' | 'expert' | 'master'>(),
  createdAt: text("created_at").default("CURRENT_TIMESTAMP"),
  updatedAt: text("updated_at").default("CURRENT_TIMESTAMP")
});

// Notificaciones del sistema de áreas de vida
export const lifeAreaNotifications = sqliteTable("life_area_notifications", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").references(() => users.id),
  type: text("type").notNull().$type<'level_up' | 'badge_earned' | 'streak_reminder' | 'milestone' | 'challenge' | 'social'>(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  actionUrl: text("action_url"),
  read: integer("read", { mode: 'boolean' }).default(false),
  createdAt: text("created_at").default("CURRENT_TIMESTAMP")
});

// Interacciones sociales
export const lifeAreaSocialInteractions = sqliteTable("life_area_social_interactions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").references(() => users.id),
  targetUserId: integer("target_user_id").references(() => users.id),
  interactionType: text("interaction_type").notNull().$type<'like' | 'comment' | 'support'>(),
  targetType: text("target_type").notNull().$type<'milestone' | 'action'>(),
  targetId: integer("target_id").notNull(),
  content: text("content"), // Para comentarios
  createdAt: text("created_at").default("CURRENT_TIMESTAMP")
});

// Relations
export const usersRelations = relations(users, ({ many, one }) => ({
  dreams: many(dreams),
  communityPosts: many(communityPosts),
  sentimentAnalysis: many(sentimentAnalysis),
  textEmbeddings: many(textEmbeddings),
  userProfile: one(userProfiles),
  recommendations: many(recommendations),
  blockchainTransactions: many(blockchainTransactions),
  vrMeetings: many(vrMeetings),
  meetingParticipants: many(meetingParticipants),
  // Blog relations
  blogPosts: many(blogPosts),
  postLikes: many(postLikes),
  postComments: many(postComments),
  postBookmarks: many(postBookmarks),
  postViews: many(postViews),
  // Gamification relations
  userLevel: one(userLevels),
  challengeProgress: many(userChallengeProgress),
  userBadges: many(userBadges),
  dailyActivity: many(userDailyActivity),
  // ¡BASTA! Gamification relations
  commitments: many(userCommitments),
  actions: many(userActions),
  progress: one(userProgress),
  weeklyRankings: many(weeklyRankings),
  monthlyRankings: many(monthlyRankings),
  provinceRankings: many(provinceRankings),
  // Stories relations
  inspiringStories: many(inspiringStories),
  // Course relations
  courses: many(courses),
  userCourseProgress: many(userCourseProgress),
  userLessonProgress: many(userLessonProgress),
  quizAttempts: many(quizAttempts),
  courseCertificates: many(courseCertificates),
  // Life Areas relations
  lifeAreaQuizResponses: many(lifeAreaQuizResponses),
  lifeAreaScores: many(lifeAreaScores),
  userLifeAreaProgress: many(userLifeAreaProgress),
  lifeAreaMilestones: many(lifeAreaMilestones),
  lifeAreaIndicators: many(lifeAreaIndicators),
  lifeAreaXpLog: many(lifeAreaXpLog),
  lifeAreaLevels: many(lifeAreaLevels),
  lifeAreaStreaks: many(lifeAreaStreaks),
  userLifeAreaBadges: many(userLifeAreaBadges),
  lifeAreaCurrency: one(lifeAreaCurrency),
  lifeAreaRewardChests: many(lifeAreaRewardChests),
  userLifeAreaChallenges: many(userLifeAreaChallenges),
  lifeAreaMastery: many(lifeAreaMastery),
  lifeAreaNotifications: many(lifeAreaNotifications),
  lifeAreaSocialInteractions: many(lifeAreaSocialInteractions),
  // Civic Assessment & Personal Development relations
  civicAssessments: many(civicAssessments),
  civicProfiles: many(civicProfiles),
  civicGoals: many(civicGoals),
  weeklyCheckins: many(weeklyCheckins),
  coachingSessions: many(coachingSessions),
  coachingPrompts: many(coachingPrompts),
}));

export const dreamsRelations = relations(dreams, ({ one }) => ({
  user: one(users, {
    fields: [dreams.userId],
    references: [users.id],
  }),
}));

export const communityPostsRelations = relations(communityPosts, ({ one, many }) => ({
  user: one(users, {
    fields: [communityPosts.userId],
    references: [users.id],
  }),
  interactions: many(communityPostInteractions),
  messages: many(communityMessages),
  activity: many(communityPostActivity),
  inspiringStories: many(inspiringStories),
  // New initiative relations
  members: many(initiativeMembers),
  milestones: many(initiativeMilestones),
  initiativeMessages: many(initiativeMessages),
  tasks: many(initiativeTasks),
  activityFeedItems: many(activityFeed),
  membershipRequests: many(membershipRequests),
  notifications: many(notifications),
}));

export const communityPostInteractionsRelations = relations(communityPostInteractions, ({ one }) => ({
  post: one(communityPosts, {
    fields: [communityPostInteractions.postId],
    references: [communityPosts.id],
  }),
  user: one(users, {
    fields: [communityPostInteractions.userId],
    references: [users.id],
  }),
}));

export const communityMessagesRelations = relations(communityMessages, ({ one }) => ({
  sender: one(users, {
    fields: [communityMessages.senderId],
    references: [users.id],
  }),
  receiver: one(users, {
    fields: [communityMessages.receiverId],
    references: [users.id],
  }),
  post: one(communityPosts, {
    fields: [communityMessages.postId],
    references: [communityPosts.id],
  }),
}));

export const communityPostActivityRelations = relations(communityPostActivity, ({ one }) => ({
  post: one(communityPosts, {
    fields: [communityPostActivity.postId],
    references: [communityPosts.id],
  }),
  user: one(users, {
    fields: [communityPostActivity.userId],
    references: [users.id],
  }),
}));

export const userProfilesRelations = relations(userProfiles, ({ one }) => ({
  user: one(users, {
    fields: [userProfiles.userId],
    references: [users.id],
  }),
}));

export const recommendationsRelations = relations(recommendations, ({ one }) => ({
  user: one(users, {
    fields: [recommendations.userId],
    references: [users.id],
  }),
}));

export const vrMeetingsRelations = relations(vrMeetings, ({ one, many }) => ({
  organizer: one(users, {
    fields: [vrMeetings.organizerId],
    references: [users.id],
  }),
  participants: many(meetingParticipants),
}));

export const meetingParticipantsRelations = relations(meetingParticipants, ({ one }) => ({
  meeting: one(vrMeetings, {
    fields: [meetingParticipants.meetingId],
    references: [vrMeetings.id],
  }),
  user: one(users, {
    fields: [meetingParticipants.userId],
    references: [users.id],
  }),
}));

// Gamification Relations
export const userLevelsRelations = relations(userLevels, ({ one }) => ({
  user: one(users, {
    fields: [userLevels.userId],
    references: [users.id],
  }),
}));

export const challengesRelations = relations(challenges, ({ many }) => ({
  steps: many(challengeSteps),
  userProgress: many(userChallengeProgress),
}));

export const challengeStepsRelations = relations(challengeSteps, ({ one }) => ({
  challenge: one(challenges, {
    fields: [challengeSteps.challengeId],
    references: [challenges.id],
  }),
}));

export const userChallengeProgressRelations = relations(userChallengeProgress, ({ one }) => ({
  user: one(users, {
    fields: [userChallengeProgress.userId],
    references: [users.id],
  }),
  challenge: one(challenges, {
    fields: [userChallengeProgress.challengeId],
    references: [challenges.id],
  }),
}));

export const badgesRelations = relations(badges, ({ many }) => ({
  userBadges: many(userBadges),
}));

export const userBadgesRelations = relations(userBadges, ({ one }) => ({
  user: one(users, {
    fields: [userBadges.userId],
    references: [users.id],
  }),
  badge: one(badges, {
    fields: [userBadges.badgeId],
    references: [badges.id],
  }),
}));

export const userDailyActivityRelations = relations(userDailyActivity, ({ one }) => ({
  user: one(users, {
    fields: [userDailyActivity.userId],
    references: [users.id],
  }),
}));

// ¡BASTA! Gamification Relations
export const userCommitmentsRelations = relations(userCommitments, ({ one }) => ({
  user: one(users, {
    fields: [userCommitments.userId],
    references: [users.id],
  }),
}));

export const userActionsRelations = relations(userActions, ({ one }) => ({
  user: one(users, {
    fields: [userActions.userId],
    references: [users.id],
  }),
}));

export const userProgressRelations = relations(userProgress, ({ one }) => ({
  user: one(users, {
    fields: [userProgress.userId],
    references: [users.id],
  }),
}));

export const weeklyRankingsRelations = relations(weeklyRankings, ({ one }) => ({
  user: one(users, {
    fields: [weeklyRankings.userId],
    references: [users.id],
  }),
}));

export const monthlyRankingsRelations = relations(monthlyRankings, ({ one }) => ({
  user: one(users, {
    fields: [monthlyRankings.userId],
    references: [users.id],
  }),
}));

export const provinceRankingsRelations = relations(provinceRankings, ({ one }) => ({
  user: one(users, {
    fields: [provinceRankings.userId],
    references: [users.id],
  }),
}));

// Blog Relations
export const blogPostsRelations = relations(blogPosts, ({ one, many }) => ({
  author: one(users, {
    fields: [blogPosts.authorId],
    references: [users.id],
  }),
  tags: many(postTags),
  likes: many(postLikes),
  comments: many(postComments),
  bookmarks: many(postBookmarks),
  views: many(postViews),
}));

export const postTagsRelations = relations(postTags, ({ one }) => ({
  post: one(blogPosts, {
    fields: [postTags.postId],
    references: [blogPosts.id],
  }),
}));

export const postLikesRelations = relations(postLikes, ({ one }) => ({
  post: one(blogPosts, {
    fields: [postLikes.postId],
    references: [blogPosts.id],
  }),
  user: one(users, {
    fields: [postLikes.userId],
    references: [users.id],
  }),
}));

export const postCommentsRelations = relations(postComments, ({ one, many }) => ({
  post: one(blogPosts, {
    fields: [postComments.postId],
    references: [blogPosts.id],
  }),
  user: one(users, {
    fields: [postComments.userId],
    references: [users.id],
  }),
  parent: one(postComments, {
    fields: [postComments.parentId],
    references: [postComments.id],
  }),
  replies: many(postComments),
}));

export const postBookmarksRelations = relations(postBookmarks, ({ one }) => ({
  post: one(blogPosts, {
    fields: [postBookmarks.postId],
    references: [blogPosts.id],
  }),
  user: one(users, {
    fields: [postBookmarks.userId],
    references: [users.id],
  }),
}));

export const postViewsRelations = relations(postViews, ({ one }) => ({
  post: one(blogPosts, {
    fields: [postViews.postId],
    references: [blogPosts.id],
  }),
  user: one(users, {
    fields: [postViews.userId],
    references: [users.id],
  }),
}));

// Course Relations
export const coursesRelations = relations(courses, ({ one, many }) => ({
  author: one(users, {
    fields: [courses.authorId],
    references: [users.id],
  }),
  lessons: many(courseLessons),
  quiz: one(courseQuizzes),
  userProgress: many(userCourseProgress),
  certificates: many(courseCertificates),
}));

export const courseLessonsRelations = relations(courseLessons, ({ one, many }) => ({
  course: one(courses, {
    fields: [courseLessons.courseId],
    references: [courses.id],
  }),
  userProgress: many(userLessonProgress),
}));

export const courseQuizzesRelations = relations(courseQuizzes, ({ one, many }) => ({
  course: one(courses, {
    fields: [courseQuizzes.courseId],
    references: [courses.id],
  }),
  questions: many(quizQuestions),
  attempts: many(quizAttempts),
}));

export const quizQuestionsRelations = relations(quizQuestions, ({ one, many }) => ({
  quiz: one(courseQuizzes, {
    fields: [quizQuestions.quizId],
    references: [courseQuizzes.id],
  }),
  attemptAnswers: many(quizAttemptAnswers),
}));

export const userCourseProgressRelations = relations(userCourseProgress, ({ one }) => ({
  user: one(users, {
    fields: [userCourseProgress.userId],
    references: [users.id],
  }),
  course: one(courses, {
    fields: [userCourseProgress.courseId],
    references: [courses.id],
  }),
  currentLesson: one(courseLessons, {
    fields: [userCourseProgress.currentLessonId],
    references: [courseLessons.id],
  }),
}));

export const userLessonProgressRelations = relations(userLessonProgress, ({ one }) => ({
  user: one(users, {
    fields: [userLessonProgress.userId],
    references: [users.id],
  }),
  lesson: one(courseLessons, {
    fields: [userLessonProgress.lessonId],
    references: [courseLessons.id],
  }),
}));

export const quizAttemptsRelations = relations(quizAttempts, ({ one, many }) => ({
  user: one(users, {
    fields: [quizAttempts.userId],
    references: [users.id],
  }),
  quiz: one(courseQuizzes, {
    fields: [quizAttempts.quizId],
    references: [courseQuizzes.id],
  }),
  course: one(courses, {
    fields: [quizAttempts.courseId],
    references: [courses.id],
  }),
  answers: many(quizAttemptAnswers),
}));

export const quizAttemptAnswersRelations = relations(quizAttemptAnswers, ({ one }) => ({
  attempt: one(quizAttempts, {
    fields: [quizAttemptAnswers.attemptId],
    references: [quizAttempts.id],
  }),
  question: one(quizQuestions, {
    fields: [quizAttemptAnswers.questionId],
    references: [quizQuestions.id],
  }),
}));

export const courseCertificatesRelations = relations(courseCertificates, ({ one }) => ({
  user: one(users, {
    fields: [courseCertificates.userId],
    references: [users.id],
  }),
  course: one(courses, {
    fields: [courseCertificates.courseId],
    references: [courses.id],
  }),
}));

export const iotSensorsRelations = relations(iotSensors, ({ many }) => ({
  data: many(sensorData),
}));

export const sensorDataRelations = relations(sensorData, ({ one }) => ({
  sensor: one(iotSensors, {
    fields: [sensorData.sensorId],
    references: [iotSensors.id],
  }),
}));

// Inspiring Stories Relations
export const inspiringStoriesRelations = relations(inspiringStories, ({ one }) => ({
  author: one(users, {
    fields: [inspiringStories.authorId],
    references: [users.id],
  }),
  moderator: one(users, {
    fields: [inspiringStories.moderatedBy],
    references: [users.id],
  }),
  relatedPost: one(communityPosts, {
    fields: [inspiringStories.relatedPostId],
    references: [communityPosts.id],
  }),
}));

// ==================== NEW INITIATIVE FEATURES RELATIONS ====================

export const initiativeMembersRelations = relations(initiativeMembers, ({ one }) => ({
  post: one(communityPosts, {
    fields: [initiativeMembers.postId],
    references: [communityPosts.id],
  }),
  user: one(users, {
    fields: [initiativeMembers.userId],
    references: [users.id],
  }),
}));

export const initiativeMilestonesRelations = relations(initiativeMilestones, ({ one, many }) => ({
  post: one(communityPosts, {
    fields: [initiativeMilestones.postId],
    references: [communityPosts.id],
  }),
  completedBy: one(users, {
    fields: [initiativeMilestones.completedBy],
    references: [users.id],
  }),
  tasks: many(initiativeTasks),
}));

export const initiativeMessagesRelations = relations(initiativeMessages, ({ one }) => ({
  post: one(communityPosts, {
    fields: [initiativeMessages.postId],
    references: [communityPosts.id],
  }),
  user: one(users, {
    fields: [initiativeMessages.userId],
    references: [users.id],
  }),
}));

export const initiativeTasksRelations = relations(initiativeTasks, ({ one }) => ({
  post: one(communityPosts, {
    fields: [initiativeTasks.postId],
    references: [communityPosts.id],
  }),
  milestone: one(initiativeMilestones, {
    fields: [initiativeTasks.milestoneId],
    references: [initiativeMilestones.id],
  }),
  assignedTo: one(users, {
    fields: [initiativeTasks.assignedTo],
    references: [users.id],
  }),
  createdBy: one(users, {
    fields: [initiativeTasks.createdBy],
    references: [users.id],
  }),
}));

export const activityFeedRelations = relations(activityFeed, ({ one }) => ({
  post: one(communityPosts, {
    fields: [activityFeed.postId],
    references: [communityPosts.id],
  }),
  user: one(users, {
    fields: [activityFeed.userId],
    references: [users.id],
  }),
}));

export const membershipRequestsRelations = relations(membershipRequests, ({ one }) => ({
  post: one(communityPosts, {
    fields: [membershipRequests.postId],
    references: [communityPosts.id],
  }),
  user: one(users, {
    fields: [membershipRequests.userId],
    references: [users.id],
  }),
  reviewedBy: one(users, {
    fields: [membershipRequests.reviewedBy],
    references: [users.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
  post: one(communityPosts, {
    fields: [notifications.postId],
    references: [communityPosts.id],
  }),
}));

// ==================== LIFE AREAS RELATIONS ====================

export const lifeAreasRelations = relations(lifeAreas, ({ many }) => ({
  subcategories: many(lifeAreaSubcategories),
  quizzes: many(lifeAreaQuizzes),
  scores: many(lifeAreaScores),
  actions: many(lifeAreaActions),
  milestones: many(lifeAreaMilestones),
  indicators: many(lifeAreaIndicators),
  communityStats: many(lifeAreaCommunityStats),
  xpLog: many(lifeAreaXpLog),
  levels: many(lifeAreaLevels),
  mastery: many(lifeAreaMastery),
}));

export const lifeAreaSubcategoriesRelations = relations(lifeAreaSubcategories, ({ one, many }) => ({
  lifeArea: one(lifeAreas, {
    fields: [lifeAreaSubcategories.lifeAreaId],
    references: [lifeAreas.id],
  }),
  questions: many(lifeAreaQuizQuestions),
  scores: many(lifeAreaScores),
  actions: many(lifeAreaActions),
}));

export const lifeAreaQuizzesRelations = relations(lifeAreaQuizzes, ({ one, many }) => ({
  lifeArea: one(lifeAreas, {
    fields: [lifeAreaQuizzes.lifeAreaId],
    references: [lifeAreas.id],
  }),
  questions: many(lifeAreaQuizQuestions),
  responses: many(lifeAreaQuizResponses),
}));

export const lifeAreaQuizQuestionsRelations = relations(lifeAreaQuizQuestions, ({ one, many }) => ({
  quiz: one(lifeAreaQuizzes, {
    fields: [lifeAreaQuizQuestions.quizId],
    references: [lifeAreaQuizzes.id],
  }),
  subcategory: one(lifeAreaSubcategories, {
    fields: [lifeAreaQuizQuestions.subcategoryId],
    references: [lifeAreaSubcategories.id],
  }),
  responses: many(lifeAreaQuizResponses),
}));

export const lifeAreaQuizResponsesRelations = relations(lifeAreaQuizResponses, ({ one }) => ({
  user: one(users, {
    fields: [lifeAreaQuizResponses.userId],
    references: [users.id],
  }),
  quiz: one(lifeAreaQuizzes, {
    fields: [lifeAreaQuizResponses.quizId],
    references: [lifeAreaQuizzes.id],
  }),
  question: one(lifeAreaQuizQuestions, {
    fields: [lifeAreaQuizResponses.questionId],
    references: [lifeAreaQuizQuestions.id],
  }),
}));

export const lifeAreaScoresRelations = relations(lifeAreaScores, ({ one }) => ({
  user: one(users, {
    fields: [lifeAreaScores.userId],
    references: [users.id],
  }),
  lifeArea: one(lifeAreas, {
    fields: [lifeAreaScores.lifeAreaId],
    references: [lifeAreas.id],
  }),
  subcategory: one(lifeAreaSubcategories, {
    fields: [lifeAreaScores.subcategoryId],
    references: [lifeAreaSubcategories.id],
  }),
}));

export const lifeAreaActionsRelations = relations(lifeAreaActions, ({ one, many }) => ({
  lifeArea: one(lifeAreas, {
    fields: [lifeAreaActions.lifeAreaId],
    references: [lifeAreas.id],
  }),
  subcategory: one(lifeAreaSubcategories, {
    fields: [lifeAreaActions.subcategoryId],
    references: [lifeAreaSubcategories.id],
  }),
  userProgress: many(userLifeAreaProgress),
}));

export const userLifeAreaProgressRelations = relations(userLifeAreaProgress, ({ one }) => ({
  user: one(users, {
    fields: [userLifeAreaProgress.userId],
    references: [users.id],
  }),
  action: one(lifeAreaActions, {
    fields: [userLifeAreaProgress.actionId],
    references: [lifeAreaActions.id],
  }),
}));

export const lifeAreaMilestonesRelations = relations(lifeAreaMilestones, ({ one, many }) => ({
  user: one(users, {
    fields: [lifeAreaMilestones.userId],
    references: [users.id],
  }),
  lifeArea: one(lifeAreas, {
    fields: [lifeAreaMilestones.lifeAreaId],
    references: [lifeAreas.id],
  }),
  socialInteractions: many(lifeAreaSocialInteractions),
}));

export const lifeAreaIndicatorsRelations = relations(lifeAreaIndicators, ({ one }) => ({
  user: one(users, {
    fields: [lifeAreaIndicators.userId],
    references: [users.id],
  }),
  lifeArea: one(lifeAreas, {
    fields: [lifeAreaIndicators.lifeAreaId],
    references: [lifeAreas.id],
  }),
}));

export const lifeAreaCommunityStatsRelations = relations(lifeAreaCommunityStats, ({ one }) => ({
  lifeArea: one(lifeAreas, {
    fields: [lifeAreaCommunityStats.lifeAreaId],
    references: [lifeAreas.id],
  }),
}));

export const lifeAreaXpLogRelations = relations(lifeAreaXpLog, ({ one }) => ({
  user: one(users, {
    fields: [lifeAreaXpLog.userId],
    references: [users.id],
  }),
  lifeArea: one(lifeAreas, {
    fields: [lifeAreaXpLog.lifeAreaId],
    references: [lifeAreas.id],
  }),
}));

export const lifeAreaLevelsRelations = relations(lifeAreaLevels, ({ one }) => ({
  user: one(users, {
    fields: [lifeAreaLevels.userId],
    references: [users.id],
  }),
  lifeArea: one(lifeAreas, {
    fields: [lifeAreaLevels.lifeAreaId],
    references: [lifeAreas.id],
  }),
}));

export const lifeAreaStreaksRelations = relations(lifeAreaStreaks, ({ one }) => ({
  user: one(users, {
    fields: [lifeAreaStreaks.userId],
    references: [users.id],
  }),
}));

export const lifeAreaBadgesRelations = relations(lifeAreaBadges, ({ many }) => ({
  userBadges: many(userLifeAreaBadges),
}));

export const userLifeAreaBadgesRelations = relations(userLifeAreaBadges, ({ one }) => ({
  user: one(users, {
    fields: [userLifeAreaBadges.userId],
    references: [users.id],
  }),
  badge: one(lifeAreaBadges, {
    fields: [userLifeAreaBadges.badgeId],
    references: [lifeAreaBadges.id],
  }),
}));

export const lifeAreaCurrencyRelations = relations(lifeAreaCurrency, ({ one }) => ({
  user: one(users, {
    fields: [lifeAreaCurrency.userId],
    references: [users.id],
  }),
}));

export const lifeAreaRewardChestsRelations = relations(lifeAreaRewardChests, ({ one }) => ({
  user: one(users, {
    fields: [lifeAreaRewardChests.userId],
    references: [users.id],
  }),
}));

export const lifeAreaChallengesRelations = relations(lifeAreaChallenges, ({ many }) => ({
  userChallenges: many(userLifeAreaChallenges),
}));

export const userLifeAreaChallengesRelations = relations(userLifeAreaChallenges, ({ one }) => ({
  user: one(users, {
    fields: [userLifeAreaChallenges.userId],
    references: [users.id],
  }),
  challenge: one(lifeAreaChallenges, {
    fields: [userLifeAreaChallenges.challengeId],
    references: [lifeAreaChallenges.id],
  }),
}));

export const lifeAreaMasteryRelations = relations(lifeAreaMastery, ({ one }) => ({
  user: one(users, {
    fields: [lifeAreaMastery.userId],
    references: [users.id],
  }),
  lifeArea: one(lifeAreas, {
    fields: [lifeAreaMastery.lifeAreaId],
    references: [lifeAreas.id],
  }),
}));

export const lifeAreaNotificationsRelations = relations(lifeAreaNotifications, ({ one }) => ({
  user: one(users, {
    fields: [lifeAreaNotifications.userId],
    references: [users.id],
  }),
}));

export const lifeAreaSocialInteractionsRelations = relations(lifeAreaSocialInteractions, ({ one }) => ({
  user: one(users, {
    fields: [lifeAreaSocialInteractions.userId],
    references: [users.id],
  }),
  targetUser: one(users, {
    fields: [lifeAreaSocialInteractions.targetUserId],
    references: [users.id],
  }),
}));

// ==================== CIVIC ASSESSMENT & PERSONAL DEVELOPMENT TABLES ====================

// Civic assessment sessions
export const civicAssessments = sqliteTable("civic_assessments", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").references(() => users.id),
  status: text("status").notNull().default('in_progress').$type<'in_progress' | 'completed'>(),
  version: integer("version").default(1),
  startedAt: text("started_at").default("CURRENT_TIMESTAMP"),
  completedAt: text("completed_at"),
  createdAt: text("created_at").default("CURRENT_TIMESTAMP"),
});

// Individual question responses
export const civicAssessmentResponses = sqliteTable("civic_assessment_responses", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  assessmentId: integer("assessment_id").references(() => civicAssessments.id),
  questionKey: text("question_key").notNull(),
  dimensionKey: text("dimension_key").notNull(),
  responseType: text("response_type").notNull().$type<'scale' | 'choice' | 'rank'>(),
  responseValue: integer("response_value"), // For scale questions (1-10)
  responseChoice: text("response_choice"), // For choice questions
  responseRank: text("response_rank"), // JSON array for rank questions
  createdAt: text("created_at").default("CURRENT_TIMESTAMP"),
});

// Computed civic profiles
export const civicProfiles = sqliteTable("civic_profiles", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").references(() => users.id),
  assessmentId: integer("assessment_id").references(() => civicAssessments.id),
  archetype: text("archetype").notNull(), // e.g. 'el_puente', 'el_catalizador'
  dimensionScores: text("dimension_scores").notNull(), // JSON: { motivacion_civica: 75, ... }
  topStrengths: text("top_strengths").notNull(), // JSON array of dimension keys
  growthAreas: text("growth_areas").notNull(), // JSON array of dimension keys
  recommendedActions: text("recommended_actions").notNull(), // JSON array of action objects
  createdAt: text("created_at").default("CURRENT_TIMESTAMP"),
  updatedAt: text("updated_at").default("CURRENT_TIMESTAMP"),
});

// Civic goals
export const civicGoals = sqliteTable("civic_goals", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").references(() => users.id),
  title: text("title").notNull(),
  description: text("description"),
  category: text("category").notNull().$type<'civic_participation' | 'personal_growth' | 'community_building' | 'accountability' | 'learning'>(),
  targetDate: text("target_date"),
  status: text("status").notNull().default('active').$type<'active' | 'completed' | 'paused' | 'abandoned'>(),
  progress: integer("progress").default(0), // 0-100
  milestones: text("milestones"), // JSON array of { title, done, doneAt }
  linkedLifeAreaId: integer("linked_life_area_id").references(() => lifeAreas.id),
  linkedChallengeId: integer("linked_challenge_id").references(() => challenges.id),
  createdAt: text("created_at").default("CURRENT_TIMESTAMP"),
  updatedAt: text("updated_at").default("CURRENT_TIMESTAMP"),
});

// Weekly check-ins
export const weeklyCheckins = sqliteTable("weekly_checkins", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").references(() => users.id),
  weekOf: text("week_of").notNull(), // ISO date string of week start (Monday)
  mood: integer("mood").notNull(), // 1-5
  progressRating: integer("progress_rating").notNull(), // 1-5
  highlight: text("highlight"),
  challenge: text("challenge"),
  nextWeekIntention: text("next_week_intention"),
  goalsReviewed: text("goals_reviewed"), // JSON array of { goalId, status }
  createdAt: text("created_at").default("CURRENT_TIMESTAMP"),
});

// Coaching sessions
export const coachingSessions = sqliteTable("coaching_sessions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").references(() => users.id),
  sessionType: text("session_type").notNull().$type<'weekly_reflection' | 'goal_review' | 'assessment_debrief' | 'growth_prompt' | 'ad_hoc'>(),
  status: text("status").notNull().default('active').$type<'active' | 'completed'>(),
  messages: text("messages").notNull().default('[]'), // JSON array of { role, content, timestamp }
  insights: text("insights"), // JSON array of extracted insights
  suggestedActions: text("suggested_actions"), // JSON array of action items
  createdAt: text("created_at").default("CURRENT_TIMESTAMP"),
  updatedAt: text("updated_at").default("CURRENT_TIMESTAMP"),
});

// Coaching prompts (scheduled nudges)
export const coachingPrompts = sqliteTable("coaching_prompts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").references(() => users.id),
  promptType: text("prompt_type").notNull().$type<'weekly_reflection' | 'goal_reminder' | 'assessment_retake' | 'growth_nudge'>(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  context: text("context"), // JSON with archetype, dimension, etc.
  isRead: integer("is_read", { mode: 'boolean' }).default(false),
  scheduledFor: text("scheduled_for"),
  createdAt: text("created_at").default("CURRENT_TIMESTAMP"),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertDreamSchema = createInsertSchema(dreams).omit({
  id: true,
  createdAt: true,
});

export const insertCommunityPostSchema = createInsertSchema(communityPosts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertResourceSchema = createInsertSchema(resources).omit({
  id: true,
  createdAt: true,
});

export const insertInspiringStorySchema = createInsertSchema(inspiringStories).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSentimentAnalysisSchema = createInsertSchema(sentimentAnalysis).omit({
  id: true,
  analyzedAt: true,
});

export const insertTextEmbeddingSchema = createInsertSchema(textEmbeddings).omit({
  id: true,
  createdAt: true,
});

export const insertUserProfileSchema = createInsertSchema(userProfiles).omit({
  id: true,
  lastAnalyzed: true,
});

export const insertRecommendationSchema = createInsertSchema(recommendations).omit({
  id: true,
  createdAt: true,
});

export const insertAiInsightSchema = createInsertSchema(aiInsights).omit({
  id: true,
  createdAt: true,
});

export const insertBlockchainTransactionSchema = createInsertSchema(blockchainTransactions).omit({
  id: true,
  createdAt: true,
  confirmedAt: true,
});

export const insertIotSensorSchema = createInsertSchema(iotSensors).omit({
  id: true,
  installationDate: true,
  lastReading: true,
});

export const insertSensorDataSchema = createInsertSchema(sensorData).omit({
  id: true,
  timestamp: true,
});

export const insertVrMeetingSchema = createInsertSchema(vrMeetings).omit({
  id: true,
  createdAt: true,
});

export const insertMeetingParticipantSchema = createInsertSchema(meetingParticipants).omit({
  id: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertDream = z.infer<typeof insertDreamSchema>;
export type Dream = typeof dreams.$inferSelect;

export type InsertCommunityPost = z.infer<typeof insertCommunityPostSchema>;
export type CommunityPost = typeof communityPosts.$inferSelect;

export type InsertResource = z.infer<typeof insertResourceSchema>;
export type Resource = typeof resources.$inferSelect;

export type InsertInspiringStory = z.infer<typeof insertInspiringStorySchema>;
export type InspiringStory = typeof inspiringStories.$inferSelect;

export type InsertSentimentAnalysis = z.infer<typeof insertSentimentAnalysisSchema>;
export type SentimentAnalysis = typeof sentimentAnalysis.$inferSelect;

export type InsertTextEmbedding = z.infer<typeof insertTextEmbeddingSchema>;
export type TextEmbedding = typeof textEmbeddings.$inferSelect;

export type InsertUserProfile = z.infer<typeof insertUserProfileSchema>;
export type UserProfile = typeof userProfiles.$inferSelect;

export type InsertRecommendation = z.infer<typeof insertRecommendationSchema>;
export type Recommendation = typeof recommendations.$inferSelect;

export type InsertAiInsight = z.infer<typeof insertAiInsightSchema>;
export type AiInsight = typeof aiInsights.$inferSelect;

export type InsertBlockchainTransaction = z.infer<typeof insertBlockchainTransactionSchema>;
export type BlockchainTransaction = typeof blockchainTransactions.$inferSelect;

export type InsertIotSensor = z.infer<typeof insertIotSensorSchema>;
export type IotSensor = typeof iotSensors.$inferSelect;

export type InsertSensorData = z.infer<typeof insertSensorDataSchema>;
export type SensorData = typeof sensorData.$inferSelect;

export type InsertVrMeeting = z.infer<typeof insertVrMeetingSchema>;
export type VrMeeting = typeof vrMeetings.$inferSelect;

export type InsertMeetingParticipant = z.infer<typeof insertMeetingParticipantSchema>;
export type MeetingParticipant = typeof meetingParticipants.$inferSelect;

// Gamification Insert Schemas
export const insertUserLevelSchema = createInsertSchema(userLevels).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertChallengeSchema = createInsertSchema(challenges).omit({
  id: true,
  createdAt: true,
});

export const insertChallengeStepSchema = createInsertSchema(challengeSteps).omit({
  id: true,
  createdAt: true,
});

export const insertUserChallengeProgressSchema = createInsertSchema(userChallengeProgress).omit({
  id: true,
  createdAt: true,
});

export const insertBadgeSchema = createInsertSchema(badges).omit({
  id: true,
  createdAt: true,
});

export const insertUserBadgeSchema = createInsertSchema(userBadges).omit({
  id: true,
  earnedAt: true,
});

export const insertUserDailyActivitySchema = createInsertSchema(userDailyActivity).omit({
  id: true,
  createdAt: true,
});

// ¡BASTA! Gamification Insert Schemas
export const insertUserCommitmentSchema = createInsertSchema(userCommitments).omit({
  id: true,
  createdAt: true,
});

export const insertUserActionSchema = createInsertSchema(userActions).omit({
  id: true,
  createdAt: true,
});

export const insertUserProgressSchema = createInsertSchema(userProgress).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertWeeklyRankingSchema = createInsertSchema(weeklyRankings).omit({
  id: true,
  createdAt: true,
});

export const insertMonthlyRankingSchema = createInsertSchema(monthlyRankings).omit({
  id: true,
  createdAt: true,
});

export const insertProvinceRankingSchema = createInsertSchema(provinceRankings).omit({
  id: true,
  updatedAt: true,
});

// Blog Insert Schemas
export const insertBlogPostSchema = createInsertSchema(blogPosts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPostTagSchema = createInsertSchema(postTags).omit({
  id: true,
});

export const insertPostLikeSchema = createInsertSchema(postLikes).omit({
  id: true,
  createdAt: true,
});

export const insertPostCommentSchema = createInsertSchema(postComments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPostBookmarkSchema = createInsertSchema(postBookmarks).omit({
  id: true,
  createdAt: true,
});

export const insertPostViewSchema = createInsertSchema(postViews).omit({
  id: true,
  viewedAt: true,
});

// Course Insert Schemas
export const insertCourseSchema = createInsertSchema(courses).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCourseLessonSchema = createInsertSchema(courseLessons).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCourseQuizSchema = createInsertSchema(courseQuizzes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertQuizQuestionSchema = createInsertSchema(quizQuestions).omit({
  id: true,
  createdAt: true,
});

export const insertUserCourseProgressSchema = createInsertSchema(userCourseProgress).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUserLessonProgressSchema = createInsertSchema(userLessonProgress).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertQuizAttemptSchema = createInsertSchema(quizAttempts).omit({
  id: true,
  startedAt: true,
});

export const insertQuizAttemptAnswerSchema = createInsertSchema(quizAttemptAnswers).omit({
  id: true,
  createdAt: true,
});

export const insertCourseCertificateSchema = createInsertSchema(courseCertificates).omit({
  id: true,
  issuedAt: true,
});

// Community Interactions Insert Schemas
export const insertCommunityPostInteractionSchema = createInsertSchema(communityPostInteractions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCommunityMessageSchema = createInsertSchema(communityMessages).omit({
  id: true,
  createdAt: true,
});

export const insertCommunityPostActivitySchema = createInsertSchema(communityPostActivity).omit({
  id: true,
  createdAt: true,
});

// New Initiative Features Insert Schemas
export const insertInitiativeMemberSchema = createInsertSchema(initiativeMembers).omit({
  id: true,
  joinedAt: true,
});

export const insertInitiativeMilestoneSchema = createInsertSchema(initiativeMilestones).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertInitiativeMessageSchema = createInsertSchema(initiativeMessages).omit({
  id: true,
  createdAt: true,
});

export const insertInitiativeTaskSchema = createInsertSchema(initiativeTasks).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertActivityFeedSchema = createInsertSchema(activityFeed).omit({
  id: true,
  createdAt: true,
});

export const insertMembershipRequestSchema = createInsertSchema(membershipRequests).omit({
  id: true,
  createdAt: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

// Life Areas Insert Schemas
export const insertLifeAreaSchema = createInsertSchema(lifeAreas).omit({
  id: true,
  createdAt: true,
});

export const insertLifeAreaSubcategorySchema = createInsertSchema(lifeAreaSubcategories).omit({
  id: true,
  createdAt: true,
});

export const insertLifeAreaQuizSchema = createInsertSchema(lifeAreaQuizzes).omit({
  id: true,
  createdAt: true,
});

export const insertLifeAreaQuizQuestionSchema = createInsertSchema(lifeAreaQuizQuestions).omit({
  id: true,
  createdAt: true,
});

export const insertLifeAreaQuizResponseSchema = createInsertSchema(lifeAreaQuizResponses).omit({
  id: true,
  answeredAt: true,
  createdAt: true,
});

export const insertLifeAreaScoreSchema = createInsertSchema(lifeAreaScores).omit({
  id: true,
  lastUpdated: true,
  createdAt: true,
});

export const insertLifeAreaActionSchema = createInsertSchema(lifeAreaActions).omit({
  id: true,
  createdAt: true,
});

export const insertUserLifeAreaProgressSchema = createInsertSchema(userLifeAreaProgress).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertLifeAreaMilestoneSchema = createInsertSchema(lifeAreaMilestones).omit({
  id: true,
  createdAt: true,
});

export const insertLifeAreaIndicatorSchema = createInsertSchema(lifeAreaIndicators).omit({
  id: true,
  recordedAt: true,
});

export const insertLifeAreaCommunityStatsSchema = createInsertSchema(lifeAreaCommunityStats).omit({
  id: true,
  calculatedAt: true,
});

// Gamification Insert Schemas
export const insertLifeAreaXpLogSchema = createInsertSchema(lifeAreaXpLog).omit({
  id: true,
  createdAt: true,
});

export const insertLifeAreaLevelSchema = createInsertSchema(lifeAreaLevels).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertLifeAreaStreakSchema = createInsertSchema(lifeAreaStreaks).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertLifeAreaBadgeSchema = createInsertSchema(lifeAreaBadges).omit({
  id: true,
  createdAt: true,
});

export const insertUserLifeAreaBadgeSchema = createInsertSchema(userLifeAreaBadges).omit({
  id: true,
  earnedAt: true,
});

export const insertLifeAreaCurrencySchema = createInsertSchema(lifeAreaCurrency).omit({
  id: true,
  updatedAt: true,
  createdAt: true,
});

export const insertLifeAreaRewardChestSchema = createInsertSchema(lifeAreaRewardChests).omit({
  id: true,
  createdAt: true,
});

export const insertLifeAreaChallengeSchema = createInsertSchema(lifeAreaChallenges).omit({
  id: true,
  createdAt: true,
});

export const insertUserLifeAreaChallengeSchema = createInsertSchema(userLifeAreaChallenges).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertLifeAreaMasterySchema = createInsertSchema(lifeAreaMastery).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertLifeAreaNotificationSchema = createInsertSchema(lifeAreaNotifications).omit({
  id: true,
  createdAt: true,
});

export const insertLifeAreaSocialInteractionSchema = createInsertSchema(lifeAreaSocialInteractions).omit({
  id: true,
  createdAt: true,
});

// Gamification Types
export type InsertUserLevel = z.infer<typeof insertUserLevelSchema>;
export type UserLevel = typeof userLevels.$inferSelect;

export type InsertChallenge = z.infer<typeof insertChallengeSchema>;
export type Challenge = typeof challenges.$inferSelect;

export type InsertChallengeStep = z.infer<typeof insertChallengeStepSchema>;
export type ChallengeStep = typeof challengeSteps.$inferSelect;

export type InsertUserChallengeProgress = z.infer<typeof insertUserChallengeProgressSchema>;
export type UserChallengeProgress = typeof userChallengeProgress.$inferSelect;

export type InsertBadge = z.infer<typeof insertBadgeSchema>;
export type Badge = typeof badges.$inferSelect;

export type InsertUserBadge = z.infer<typeof insertUserBadgeSchema>;
export type UserBadge = typeof userBadges.$inferSelect;

export type InsertUserDailyActivity = z.infer<typeof insertUserDailyActivitySchema>;
export type UserDailyActivity = typeof userDailyActivity.$inferSelect;

// ¡BASTA! Gamification Types
export type InsertUserCommitment = z.infer<typeof insertUserCommitmentSchema>;
export type UserCommitment = typeof userCommitments.$inferSelect;

export type InsertUserAction = z.infer<typeof insertUserActionSchema>;
export type UserAction = typeof userActions.$inferSelect;

export type InsertUserProgress = z.infer<typeof insertUserProgressSchema>;
export type UserProgress = typeof userProgress.$inferSelect;

export type InsertWeeklyRanking = z.infer<typeof insertWeeklyRankingSchema>;
export type WeeklyRanking = typeof weeklyRankings.$inferSelect;

export type InsertMonthlyRanking = z.infer<typeof insertMonthlyRankingSchema>;
export type MonthlyRanking = typeof monthlyRankings.$inferSelect;

export type InsertProvinceRanking = z.infer<typeof insertProvinceRankingSchema>;
export type ProvinceRanking = typeof provinceRankings.$inferSelect;

// Blog Types
export type InsertBlogPost = z.infer<typeof insertBlogPostSchema>;
export type BlogPost = typeof blogPosts.$inferSelect;

export type InsertPostTag = z.infer<typeof insertPostTagSchema>;
export type PostTag = typeof postTags.$inferSelect;

export type InsertPostLike = z.infer<typeof insertPostLikeSchema>;
export type PostLike = typeof postLikes.$inferSelect;

export type InsertPostComment = z.infer<typeof insertPostCommentSchema>;
export type PostComment = typeof postComments.$inferSelect;

export type InsertPostBookmark = z.infer<typeof insertPostBookmarkSchema>;
export type PostBookmark = typeof postBookmarks.$inferSelect;

export type InsertPostView = z.infer<typeof insertPostViewSchema>;
export type PostView = typeof postViews.$inferSelect;

// Course Types
export type InsertCourse = z.infer<typeof insertCourseSchema>;
export type Course = typeof courses.$inferSelect;

export type InsertCourseLesson = z.infer<typeof insertCourseLessonSchema>;
export type CourseLesson = typeof courseLessons.$inferSelect;

export type InsertCourseQuiz = z.infer<typeof insertCourseQuizSchema>;
export type CourseQuiz = typeof courseQuizzes.$inferSelect;

export type InsertQuizQuestion = z.infer<typeof insertQuizQuestionSchema>;
export type QuizQuestion = typeof quizQuestions.$inferSelect;

export type InsertUserCourseProgress = z.infer<typeof insertUserCourseProgressSchema>;
export type UserCourseProgress = typeof userCourseProgress.$inferSelect;

export type InsertUserLessonProgress = z.infer<typeof insertUserLessonProgressSchema>;
export type UserLessonProgress = typeof userLessonProgress.$inferSelect;

export type InsertQuizAttempt = z.infer<typeof insertQuizAttemptSchema>;
export type QuizAttempt = typeof quizAttempts.$inferSelect;

export type InsertQuizAttemptAnswer = z.infer<typeof insertQuizAttemptAnswerSchema>;
export type QuizAttemptAnswer = typeof quizAttemptAnswers.$inferSelect;

export type InsertCourseCertificate = z.infer<typeof insertCourseCertificateSchema>;
export type CourseCertificate = typeof courseCertificates.$inferSelect;

// Community Interactions Types
export type InsertCommunityPostInteraction = z.infer<typeof insertCommunityPostInteractionSchema>;
export type CommunityPostInteraction = typeof communityPostInteractions.$inferSelect;

export type InsertCommunityMessage = z.infer<typeof insertCommunityMessageSchema>;
export type CommunityMessage = typeof communityMessages.$inferSelect;

export type InsertCommunityPostActivity = z.infer<typeof insertCommunityPostActivitySchema>;
export type CommunityPostActivity = typeof communityPostActivity.$inferSelect;

// New Initiative Features Types
export type InsertInitiativeMember = z.infer<typeof insertInitiativeMemberSchema>;
export type InitiativeMember = typeof initiativeMembers.$inferSelect;

export type InsertInitiativeMilestone = z.infer<typeof insertInitiativeMilestoneSchema>;
export type InitiativeMilestone = typeof initiativeMilestones.$inferSelect;

export type InsertInitiativeMessage = z.infer<typeof insertInitiativeMessageSchema>;
export type InitiativeMessage = typeof initiativeMessages.$inferSelect;

export type InsertInitiativeTask = z.infer<typeof insertInitiativeTaskSchema>;
export type InitiativeTask = typeof initiativeTasks.$inferSelect;

export type InsertActivityFeed = z.infer<typeof insertActivityFeedSchema>;
export type ActivityFeedItem = typeof activityFeed.$inferSelect;

export type InsertMembershipRequest = z.infer<typeof insertMembershipRequestSchema>;
export type MembershipRequest = typeof membershipRequests.$inferSelect;

export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = typeof notifications.$inferSelect;

// Geographic Types
export type GeographicLocation = typeof geographicLocations.$inferSelect;
export type InsertGeographicLocation = typeof geographicLocations.$inferInsert;

// Community Post Likes and Views Types
export type CommunityPostLike = typeof communityPostLikes.$inferSelect;
export type InsertCommunityPostLike = typeof communityPostLikes.$inferInsert;

export type CommunityPostView = typeof communityPostViews.$inferSelect;
export type InsertCommunityPostView = typeof communityPostViews.$inferInsert;

// Life Areas Types
export type InsertLifeArea = z.infer<typeof insertLifeAreaSchema>;
export type LifeArea = typeof lifeAreas.$inferSelect;

export type InsertLifeAreaSubcategory = z.infer<typeof insertLifeAreaSubcategorySchema>;
export type LifeAreaSubcategory = typeof lifeAreaSubcategories.$inferSelect;

export type InsertLifeAreaQuiz = z.infer<typeof insertLifeAreaQuizSchema>;
export type LifeAreaQuiz = typeof lifeAreaQuizzes.$inferSelect;

export type InsertLifeAreaQuizQuestion = z.infer<typeof insertLifeAreaQuizQuestionSchema>;
export type LifeAreaQuizQuestion = typeof lifeAreaQuizQuestions.$inferSelect;

export type InsertLifeAreaQuizResponse = z.infer<typeof insertLifeAreaQuizResponseSchema>;
export type LifeAreaQuizResponse = typeof lifeAreaQuizResponses.$inferSelect;

export type InsertLifeAreaScore = z.infer<typeof insertLifeAreaScoreSchema>;
export type LifeAreaScore = typeof lifeAreaScores.$inferSelect;

export type InsertLifeAreaAction = z.infer<typeof insertLifeAreaActionSchema>;
export type LifeAreaAction = typeof lifeAreaActions.$inferSelect;

export type InsertUserLifeAreaProgress = z.infer<typeof insertUserLifeAreaProgressSchema>;
export type UserLifeAreaProgress = typeof userLifeAreaProgress.$inferSelect;

export type InsertLifeAreaMilestone = z.infer<typeof insertLifeAreaMilestoneSchema>;
export type LifeAreaMilestone = typeof lifeAreaMilestones.$inferSelect;

export type InsertLifeAreaIndicator = z.infer<typeof insertLifeAreaIndicatorSchema>;
export type LifeAreaIndicator = typeof lifeAreaIndicators.$inferSelect;

export type InsertLifeAreaCommunityStats = z.infer<typeof insertLifeAreaCommunityStatsSchema>;
export type LifeAreaCommunityStats = typeof lifeAreaCommunityStats.$inferSelect;

// Life Areas Gamification Types
export type InsertLifeAreaXpLog = z.infer<typeof insertLifeAreaXpLogSchema>;
export type LifeAreaXpLog = typeof lifeAreaXpLog.$inferSelect;

export type InsertLifeAreaLevel = z.infer<typeof insertLifeAreaLevelSchema>;
export type LifeAreaLevel = typeof lifeAreaLevels.$inferSelect;

export type InsertLifeAreaStreak = z.infer<typeof insertLifeAreaStreakSchema>;
export type LifeAreaStreak = typeof lifeAreaStreaks.$inferSelect;

export type InsertLifeAreaBadge = z.infer<typeof insertLifeAreaBadgeSchema>;
export type LifeAreaBadge = typeof lifeAreaBadges.$inferSelect;

export type InsertUserLifeAreaBadge = z.infer<typeof insertUserLifeAreaBadgeSchema>;
export type UserLifeAreaBadge = typeof userLifeAreaBadges.$inferSelect;

export type InsertLifeAreaCurrency = z.infer<typeof insertLifeAreaCurrencySchema>;
export type LifeAreaCurrency = typeof lifeAreaCurrency.$inferSelect;

export type InsertLifeAreaRewardChest = z.infer<typeof insertLifeAreaRewardChestSchema>;
export type LifeAreaRewardChest = typeof lifeAreaRewardChests.$inferSelect;

export type InsertLifeAreaChallenge = z.infer<typeof insertLifeAreaChallengeSchema>;
export type LifeAreaChallenge = typeof lifeAreaChallenges.$inferSelect;

export type InsertUserLifeAreaChallenge = z.infer<typeof insertUserLifeAreaChallengeSchema>;
export type UserLifeAreaChallenge = typeof userLifeAreaChallenges.$inferSelect;

export type InsertLifeAreaMastery = z.infer<typeof insertLifeAreaMasterySchema>;
export type LifeAreaMastery = typeof lifeAreaMastery.$inferSelect;

export type InsertLifeAreaNotification = z.infer<typeof insertLifeAreaNotificationSchema>;
export type LifeAreaNotification = typeof lifeAreaNotifications.$inferSelect;

export type InsertLifeAreaSocialInteraction = z.infer<typeof insertLifeAreaSocialInteractionSchema>;

// ==================== CIVIC ASSESSMENT & PERSONAL DEVELOPMENT RELATIONS ====================

export const civicAssessmentsRelations = relations(civicAssessments, ({ one, many }) => ({
  user: one(users, {
    fields: [civicAssessments.userId],
    references: [users.id],
  }),
  responses: many(civicAssessmentResponses),
  profile: one(civicProfiles),
}));

export const civicAssessmentResponsesRelations = relations(civicAssessmentResponses, ({ one }) => ({
  assessment: one(civicAssessments, {
    fields: [civicAssessmentResponses.assessmentId],
    references: [civicAssessments.id],
  }),
}));

export const civicProfilesRelations = relations(civicProfiles, ({ one }) => ({
  user: one(users, {
    fields: [civicProfiles.userId],
    references: [users.id],
  }),
  assessment: one(civicAssessments, {
    fields: [civicProfiles.assessmentId],
    references: [civicAssessments.id],
  }),
}));

export const civicGoalsRelations = relations(civicGoals, ({ one }) => ({
  user: one(users, {
    fields: [civicGoals.userId],
    references: [users.id],
  }),
  lifeArea: one(lifeAreas, {
    fields: [civicGoals.linkedLifeAreaId],
    references: [lifeAreas.id],
  }),
  challenge: one(challenges, {
    fields: [civicGoals.linkedChallengeId],
    references: [challenges.id],
  }),
}));

export const weeklyCheckinsRelations = relations(weeklyCheckins, ({ one }) => ({
  user: one(users, {
    fields: [weeklyCheckins.userId],
    references: [users.id],
  }),
}));

export const coachingSessionsRelations = relations(coachingSessions, ({ one }) => ({
  user: one(users, {
    fields: [coachingSessions.userId],
    references: [users.id],
  }),
}));

export const coachingPromptsRelations = relations(coachingPrompts, ({ one }) => ({
  user: one(users, {
    fields: [coachingPrompts.userId],
    references: [users.id],
  }),
}));

// Civic Assessment Insert Schemas
export const insertCivicAssessmentSchema = createInsertSchema(civicAssessments).omit({
  id: true,
  createdAt: true,
});

export const insertCivicAssessmentResponseSchema = createInsertSchema(civicAssessmentResponses).omit({
  id: true,
  createdAt: true,
});

export const insertCivicProfileSchema = createInsertSchema(civicProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCivicGoalSchema = createInsertSchema(civicGoals).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertWeeklyCheckinSchema = createInsertSchema(weeklyCheckins).omit({
  id: true,
  createdAt: true,
});

export const insertCoachingSessionSchema = createInsertSchema(coachingSessions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCoachingPromptSchema = createInsertSchema(coachingPrompts).omit({
  id: true,
  createdAt: true,
});

// Civic Assessment Types
export type InsertCivicAssessment = z.infer<typeof insertCivicAssessmentSchema>;
export type CivicAssessment = typeof civicAssessments.$inferSelect;

export type InsertCivicAssessmentResponse = z.infer<typeof insertCivicAssessmentResponseSchema>;
export type CivicAssessmentResponse = typeof civicAssessmentResponses.$inferSelect;

export type InsertCivicProfile = z.infer<typeof insertCivicProfileSchema>;
export type CivicProfile = typeof civicProfiles.$inferSelect;

export type InsertCivicGoal = z.infer<typeof insertCivicGoalSchema>;
export type CivicGoal = typeof civicGoals.$inferSelect;

export type InsertWeeklyCheckin = z.infer<typeof insertWeeklyCheckinSchema>;
export type WeeklyCheckin = typeof weeklyCheckins.$inferSelect;

export type InsertCoachingSession = z.infer<typeof insertCoachingSessionSchema>;
export type CoachingSession = typeof coachingSessions.$inferSelect;

export type InsertCoachingPrompt = z.infer<typeof insertCoachingPromptSchema>;
export type CoachingPrompt = typeof coachingPrompts.$inferSelect;
export type LifeAreaSocialInteraction = typeof lifeAreaSocialInteractions.$inferSelect;
