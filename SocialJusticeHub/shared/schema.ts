import { pgTable, text, serial, integer, boolean, timestamp, jsonb, decimal, vector } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull(),
  name: text("name").notNull(),
  location: text("location"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const dreams = pgTable("dreams", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  dream: text("dream"),
  value: text("value"),
  need: text("need"),
  basta: text("basta"),
  location: text("location"),
  latitude: text("latitude"),
  longitude: text("longitude"),
  createdAt: timestamp("created_at").defaultNow(),
  type: text("type").notNull().default('dream').$type<'dream' | 'value' | 'need' | 'basta'>(),
});

export const communityPosts = pgTable("community_posts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  type: text("type").notNull(), // employment, exchange, volunteer, project, donation
  location: text("location").notNull(),
  participants: integer("participants"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const resources = pgTable("resources", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  url: text("url"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const stories = pgTable("stories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  location: text("location").notNull(),
  story: text("story").notNull(),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Tablas avanzadas de IA y análisis
export const sentimentAnalysis = pgTable("sentiment_analysis", {
  id: serial("id").primaryKey(),
  contentId: integer("content_id").notNull(), // puede referenciar dreams, posts, etc.
  contentType: text("content_type").notNull(), // 'dream', 'post', 'story', etc.
  sentiment: text("sentiment").notNull(), // 'positive', 'negative', 'neutral'
  confidence: decimal("confidence", { precision: 5, scale: 4 }),
  emotions: jsonb("emotions"), // array de emociones detectadas con scores
  keywords: jsonb("keywords"), // palabras clave extraídas
  topics: jsonb("topics"), // temas identificados
  analyzedAt: timestamp("analyzed_at").defaultNow(),
});

export const textEmbeddings = pgTable("text_embeddings", {
  id: serial("id").primaryKey(),
  contentId: integer("content_id").notNull(),
  contentType: text("content_type").notNull(),
  embedding: vector("embedding", { dimensions: 1536 }), // para OpenAI text-embedding-ada-002
  model: text("model").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userProfiles = pgTable("user_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).unique(),
  interests: jsonb("interests"), // intereses basados en actividad
  values: jsonb("values"), // valores inferidos de sueños y posts
  personalityTraits: jsonb("personality_traits"), // rasgos de personalidad
  engagementScore: decimal("engagement_score", { precision: 5, scale: 2 }),
  lastAnalyzed: timestamp("last_analyzed"),
});

export const recommendations = pgTable("recommendations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  recommendationType: text("recommendation_type").notNull(), // 'content', 'connection', 'project'
  targetId: integer("target_id").notNull(), // ID del contenido/proyecto recomendado
  targetType: text("target_type").notNull(), // tipo del target recomendado
  score: decimal("score", { precision: 5, scale: 4 }), // score de relevancia
  reason: text("reason"), // explicación de por qué se recomienda
  createdAt: timestamp("created_at").defaultNow(),
  clicked: boolean("clicked").default(false),
  dismissed: boolean("dismissed").default(false),
});

export const aiInsights = pgTable("ai_insights", {
  id: serial("id").primaryKey(),
  insightType: text("insight_type").notNull(), // 'trend', 'pattern', 'prediction'
  scope: text("scope").notNull(), // 'global', 'regional', 'local'
  title: text("title").notNull(),
  description: text("description").notNull(),
  data: jsonb("data"), // datos adicionales del insight
  confidence: decimal("confidence", { precision: 5, scale: 4 }),
  validUntil: timestamp("valid_until"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const blockchainTransactions = pgTable("blockchain_transactions", {
  id: serial("id").primaryKey(),
  txHash: text("tx_hash").notNull().unique(),
  userId: integer("user_id").references(() => users.id),
  transactionType: text("transaction_type").notNull(), // 'vote', 'donation', 'certification'
  targetId: integer("target_id"), // ID del elemento certificado/votado
  targetType: text("target_type"), // tipo del elemento
  amount: decimal("amount", { precision: 20, scale: 8 }), // para donaciones cripto
  network: text("network").notNull(), // 'ethereum', 'polygon', etc.
  status: text("status").notNull(), // 'pending', 'confirmed', 'failed'
  createdAt: timestamp("created_at").defaultNow(),
  confirmedAt: timestamp("confirmed_at"),
});

export const iotSensors = pgTable("iot_sensors", {
  id: serial("id").primaryKey(),
  sensorId: text("sensor_id").notNull().unique(),
  sensorType: text("sensor_type").notNull(), // 'air_quality', 'noise', 'traffic', etc.
  location: text("location").notNull(),
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
  installationDate: timestamp("installation_date"),
  lastReading: timestamp("last_reading"),
  status: text("status").notNull(), // 'active', 'inactive', 'maintenance'
  metadata: jsonb("metadata"), // configuración específica del sensor
});

export const sensorData = pgTable("sensor_data", {
  id: serial("id").primaryKey(),
  sensorId: integer("sensor_id").references(() => iotSensors.id),
  reading: jsonb("reading").notNull(), // datos del sensor
  timestamp: timestamp("timestamp").defaultNow(),
  quality: text("quality"), // 'good', 'moderate', 'poor'
  processed: boolean("processed").default(false),
});

export const vrMeetings = pgTable("vr_meetings", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  organizerId: integer("organizer_id").references(() => users.id),
  maxParticipants: integer("max_participants"),
  scheduledFor: timestamp("scheduled_for"),
  duration: integer("duration"), // en minutos
  meetingUrl: text("meeting_url"),
  recordingUrl: text("recording_url"),
  status: text("status").notNull(), // 'scheduled', 'active', 'completed', 'cancelled'
  metadata: jsonb("metadata"), // configuración VR específica
  createdAt: timestamp("created_at").defaultNow(),
});

export const meetingParticipants = pgTable("meeting_participants", {
  id: serial("id").primaryKey(),
  meetingId: integer("meeting_id").references(() => vrMeetings.id),
  userId: integer("user_id").references(() => users.id),
  joinedAt: timestamp("joined_at"),
  leftAt: timestamp("left_at"),
  role: text("role"), // 'organizer', 'participant', 'moderator'
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
}));

export const dreamsRelations = relations(dreams, ({ one }) => ({
  user: one(users, {
    fields: [dreams.userId],
    references: [users.id],
  }),
}));

export const communityPostsRelations = relations(communityPosts, ({ one }) => ({
  user: one(users, {
    fields: [communityPosts.userId],
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

export const iotSensorsRelations = relations(iotSensors, ({ many }) => ({
  data: many(sensorData),
}));

export const sensorDataRelations = relations(sensorData, ({ one }) => ({
  sensor: one(iotSensors, {
    fields: [sensorData.sensorId],
    references: [iotSensors.id],
  }),
}));

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
});

export const insertResourceSchema = createInsertSchema(resources).omit({
  id: true,
  createdAt: true,
});

export const insertStorySchema = createInsertSchema(stories).omit({
  id: true,
  createdAt: true,
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

export type InsertStory = z.infer<typeof insertStorySchema>;
export type Story = typeof stories.$inferSelect;

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
