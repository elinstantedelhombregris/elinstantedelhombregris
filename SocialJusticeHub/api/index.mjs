var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  activityFeed: () => activityFeed,
  activityFeedRelations: () => activityFeedRelations,
  aiInsights: () => aiInsights,
  badges: () => badges,
  badgesRelations: () => badgesRelations,
  blockchainTransactions: () => blockchainTransactions,
  blogPosts: () => blogPosts,
  blogPostsRelations: () => blogPostsRelations,
  challengeSteps: () => challengeSteps,
  challengeStepsRelations: () => challengeStepsRelations,
  challenges: () => challenges,
  challengesRelations: () => challengesRelations,
  civicAssessmentResponses: () => civicAssessmentResponses,
  civicAssessmentResponsesRelations: () => civicAssessmentResponsesRelations,
  civicAssessments: () => civicAssessments,
  civicAssessmentsRelations: () => civicAssessmentsRelations,
  civicGoals: () => civicGoals,
  civicGoalsRelations: () => civicGoalsRelations,
  civicProfiles: () => civicProfiles,
  civicProfilesRelations: () => civicProfilesRelations,
  coachingPrompts: () => coachingPrompts,
  coachingPromptsRelations: () => coachingPromptsRelations,
  coachingSessions: () => coachingSessions,
  coachingSessionsRelations: () => coachingSessionsRelations,
  communityMessages: () => communityMessages,
  communityMessagesRelations: () => communityMessagesRelations,
  communityPostActivity: () => communityPostActivity,
  communityPostActivityRelations: () => communityPostActivityRelations,
  communityPostInteractions: () => communityPostInteractions,
  communityPostInteractionsRelations: () => communityPostInteractionsRelations,
  communityPostLikes: () => communityPostLikes,
  communityPostViews: () => communityPostViews,
  communityPosts: () => communityPosts,
  communityPostsRelations: () => communityPostsRelations,
  courseCertificates: () => courseCertificates,
  courseCertificatesRelations: () => courseCertificatesRelations,
  courseDefinitions: () => courseDefinitions,
  courseDefinitionsRelations: () => courseDefinitionsRelations,
  courseLessonIdentities: () => courseLessonIdentities,
  courseLessonIdentitiesRelations: () => courseLessonIdentitiesRelations,
  courseLessons: () => courseLessons,
  courseLessonsRelations: () => courseLessonsRelations,
  courseQuizzes: () => courseQuizzes,
  courseQuizzesRelations: () => courseQuizzesRelations,
  courseRevisionLessons: () => courseRevisionLessons,
  courseRevisionLessonsRelations: () => courseRevisionLessonsRelations,
  courseRevisionQuizQuestions: () => courseRevisionQuizQuestions,
  courseRevisionQuizQuestionsRelations: () => courseRevisionQuizQuestionsRelations,
  courseRevisionQuizzes: () => courseRevisionQuizzes,
  courseRevisionQuizzesRelations: () => courseRevisionQuizzesRelations,
  courseRevisions: () => courseRevisions,
  courseRevisionsRelations: () => courseRevisionsRelations,
  courses: () => courses,
  coursesRelations: () => coursesRelations,
  digestProposals: () => digestProposals,
  dreams: () => dreams,
  dreamsRelations: () => dreamsRelations,
  geographicLocations: () => geographicLocations,
  initiativeMembers: () => initiativeMembers,
  initiativeMembersRelations: () => initiativeMembersRelations,
  initiativeMessages: () => initiativeMessages,
  initiativeMessagesRelations: () => initiativeMessagesRelations,
  initiativeMilestones: () => initiativeMilestones,
  initiativeMilestonesRelations: () => initiativeMilestonesRelations,
  initiativeTasks: () => initiativeTasks,
  initiativeTasksRelations: () => initiativeTasksRelations,
  insertActivityFeedSchema: () => insertActivityFeedSchema,
  insertAiInsightSchema: () => insertAiInsightSchema,
  insertBadgeSchema: () => insertBadgeSchema,
  insertBlockchainTransactionSchema: () => insertBlockchainTransactionSchema,
  insertBlogPostSchema: () => insertBlogPostSchema,
  insertChallengeSchema: () => insertChallengeSchema,
  insertChallengeStepSchema: () => insertChallengeStepSchema,
  insertCivicAssessmentResponseSchema: () => insertCivicAssessmentResponseSchema,
  insertCivicAssessmentSchema: () => insertCivicAssessmentSchema,
  insertCivicGoalSchema: () => insertCivicGoalSchema,
  insertCivicProfileSchema: () => insertCivicProfileSchema,
  insertCoachingPromptSchema: () => insertCoachingPromptSchema,
  insertCoachingSessionSchema: () => insertCoachingSessionSchema,
  insertCommunityMessageSchema: () => insertCommunityMessageSchema,
  insertCommunityPostActivitySchema: () => insertCommunityPostActivitySchema,
  insertCommunityPostInteractionSchema: () => insertCommunityPostInteractionSchema,
  insertCommunityPostSchema: () => insertCommunityPostSchema,
  insertCourseCertificateSchema: () => insertCourseCertificateSchema,
  insertCourseDefinitionSchema: () => insertCourseDefinitionSchema,
  insertCourseLessonIdentitySchema: () => insertCourseLessonIdentitySchema,
  insertCourseLessonSchema: () => insertCourseLessonSchema,
  insertCourseQuizSchema: () => insertCourseQuizSchema,
  insertCourseRevisionLessonSchema: () => insertCourseRevisionLessonSchema,
  insertCourseRevisionQuizQuestionSchema: () => insertCourseRevisionQuizQuestionSchema,
  insertCourseRevisionQuizSchema: () => insertCourseRevisionQuizSchema,
  insertCourseRevisionSchema: () => insertCourseRevisionSchema,
  insertCourseSchema: () => insertCourseSchema,
  insertDigestProposalSchema: () => insertDigestProposalSchema,
  insertDreamSchema: () => insertDreamSchema,
  insertInitiativeMemberSchema: () => insertInitiativeMemberSchema,
  insertInitiativeMessageSchema: () => insertInitiativeMessageSchema,
  insertInitiativeMilestoneSchema: () => insertInitiativeMilestoneSchema,
  insertInitiativeTaskSchema: () => insertInitiativeTaskSchema,
  insertInspiringStorySchema: () => insertInspiringStorySchema,
  insertIotSensorSchema: () => insertIotSensorSchema,
  insertLifeAreaActionSchema: () => insertLifeAreaActionSchema,
  insertLifeAreaBadgeSchema: () => insertLifeAreaBadgeSchema,
  insertLifeAreaChallengeSchema: () => insertLifeAreaChallengeSchema,
  insertLifeAreaCommunityStatsSchema: () => insertLifeAreaCommunityStatsSchema,
  insertLifeAreaCurrencySchema: () => insertLifeAreaCurrencySchema,
  insertLifeAreaIndicatorSchema: () => insertLifeAreaIndicatorSchema,
  insertLifeAreaLevelSchema: () => insertLifeAreaLevelSchema,
  insertLifeAreaMasterySchema: () => insertLifeAreaMasterySchema,
  insertLifeAreaMilestoneSchema: () => insertLifeAreaMilestoneSchema,
  insertLifeAreaNotificationSchema: () => insertLifeAreaNotificationSchema,
  insertLifeAreaQuizQuestionSchema: () => insertLifeAreaQuizQuestionSchema,
  insertLifeAreaQuizResponseSchema: () => insertLifeAreaQuizResponseSchema,
  insertLifeAreaQuizSchema: () => insertLifeAreaQuizSchema,
  insertLifeAreaRewardChestSchema: () => insertLifeAreaRewardChestSchema,
  insertLifeAreaSchema: () => insertLifeAreaSchema,
  insertLifeAreaScoreSchema: () => insertLifeAreaScoreSchema,
  insertLifeAreaSocialInteractionSchema: () => insertLifeAreaSocialInteractionSchema,
  insertLifeAreaStreakSchema: () => insertLifeAreaStreakSchema,
  insertLifeAreaSubcategorySchema: () => insertLifeAreaSubcategorySchema,
  insertLifeAreaXpLogSchema: () => insertLifeAreaXpLogSchema,
  insertMandateSuggestionSchema: () => insertMandateSuggestionSchema,
  insertMeetingParticipantSchema: () => insertMeetingParticipantSchema,
  insertMembershipRequestSchema: () => insertMembershipRequestSchema,
  insertMissionChronicleSchema: () => insertMissionChronicleSchema,
  insertMissionEvidenceSchema: () => insertMissionEvidenceSchema,
  insertMonthlyRankingSchema: () => insertMonthlyRankingSchema,
  insertNotificationSchema: () => insertNotificationSchema,
  insertPlatformFeedbackSchema: () => insertPlatformFeedbackSchema,
  insertPostBookmarkSchema: () => insertPostBookmarkSchema,
  insertPostCommentSchema: () => insertPostCommentSchema,
  insertPostLikeSchema: () => insertPostLikeSchema,
  insertPostTagSchema: () => insertPostTagSchema,
  insertPostViewSchema: () => insertPostViewSchema,
  insertProposalStatusHistorySchema: () => insertProposalStatusHistorySchema,
  insertProvinceRankingSchema: () => insertProvinceRankingSchema,
  insertQuizAttemptAnswerSchema: () => insertQuizAttemptAnswerSchema,
  insertQuizAttemptSchema: () => insertQuizAttemptSchema,
  insertQuizQuestionSchema: () => insertQuizQuestionSchema,
  insertRecommendationSchema: () => insertRecommendationSchema,
  insertResourceSchema: () => insertResourceSchema,
  insertSensorDataSchema: () => insertSensorDataSchema,
  insertSentimentAnalysisSchema: () => insertSentimentAnalysisSchema,
  insertTerritoryMandateSchema: () => insertTerritoryMandateSchema,
  insertTextEmbeddingSchema: () => insertTextEmbeddingSchema,
  insertUserActionSchema: () => insertUserActionSchema,
  insertUserBadgeSchema: () => insertUserBadgeSchema,
  insertUserChallengeProgressSchema: () => insertUserChallengeProgressSchema,
  insertUserCommitmentSchema: () => insertUserCommitmentSchema,
  insertUserCourseProgressSchema: () => insertUserCourseProgressSchema,
  insertUserDailyActivitySchema: () => insertUserDailyActivitySchema,
  insertUserLessonProgressSchema: () => insertUserLessonProgressSchema,
  insertUserLevelSchema: () => insertUserLevelSchema,
  insertUserLifeAreaBadgeSchema: () => insertUserLifeAreaBadgeSchema,
  insertUserLifeAreaChallengeSchema: () => insertUserLifeAreaChallengeSchema,
  insertUserLifeAreaProgressSchema: () => insertUserLifeAreaProgressSchema,
  insertUserProfileSchema: () => insertUserProfileSchema,
  insertUserProgressSchema: () => insertUserProgressSchema,
  insertUserResourceSchema: () => insertUserResourceSchema,
  insertUserSchema: () => insertUserSchema,
  insertVrMeetingSchema: () => insertVrMeetingSchema,
  insertWeeklyCheckinSchema: () => insertWeeklyCheckinSchema,
  insertWeeklyDigestSchema: () => insertWeeklyDigestSchema,
  insertWeeklyRankingSchema: () => insertWeeklyRankingSchema,
  inspiringStories: () => inspiringStories,
  inspiringStoriesRelations: () => inspiringStoriesRelations,
  iotSensors: () => iotSensors,
  iotSensorsRelations: () => iotSensorsRelations,
  lifeAreaActions: () => lifeAreaActions,
  lifeAreaActionsRelations: () => lifeAreaActionsRelations,
  lifeAreaBadges: () => lifeAreaBadges,
  lifeAreaBadgesRelations: () => lifeAreaBadgesRelations,
  lifeAreaChallenges: () => lifeAreaChallenges,
  lifeAreaChallengesRelations: () => lifeAreaChallengesRelations,
  lifeAreaCommunityStats: () => lifeAreaCommunityStats,
  lifeAreaCommunityStatsRelations: () => lifeAreaCommunityStatsRelations,
  lifeAreaCurrency: () => lifeAreaCurrency,
  lifeAreaCurrencyRelations: () => lifeAreaCurrencyRelations,
  lifeAreaIndicators: () => lifeAreaIndicators,
  lifeAreaIndicatorsRelations: () => lifeAreaIndicatorsRelations,
  lifeAreaLevels: () => lifeAreaLevels,
  lifeAreaLevelsRelations: () => lifeAreaLevelsRelations,
  lifeAreaMastery: () => lifeAreaMastery,
  lifeAreaMasteryRelations: () => lifeAreaMasteryRelations,
  lifeAreaMilestones: () => lifeAreaMilestones,
  lifeAreaMilestonesRelations: () => lifeAreaMilestonesRelations,
  lifeAreaNotifications: () => lifeAreaNotifications,
  lifeAreaNotificationsRelations: () => lifeAreaNotificationsRelations,
  lifeAreaQuizQuestions: () => lifeAreaQuizQuestions,
  lifeAreaQuizQuestionsRelations: () => lifeAreaQuizQuestionsRelations,
  lifeAreaQuizResponses: () => lifeAreaQuizResponses,
  lifeAreaQuizResponsesRelations: () => lifeAreaQuizResponsesRelations,
  lifeAreaQuizzes: () => lifeAreaQuizzes,
  lifeAreaQuizzesRelations: () => lifeAreaQuizzesRelations,
  lifeAreaRewardChests: () => lifeAreaRewardChests,
  lifeAreaRewardChestsRelations: () => lifeAreaRewardChestsRelations,
  lifeAreaScores: () => lifeAreaScores,
  lifeAreaScoresRelations: () => lifeAreaScoresRelations,
  lifeAreaSocialInteractions: () => lifeAreaSocialInteractions,
  lifeAreaSocialInteractionsRelations: () => lifeAreaSocialInteractionsRelations,
  lifeAreaStreaks: () => lifeAreaStreaks,
  lifeAreaStreaksRelations: () => lifeAreaStreaksRelations,
  lifeAreaSubcategories: () => lifeAreaSubcategories,
  lifeAreaSubcategoriesRelations: () => lifeAreaSubcategoriesRelations,
  lifeAreaXpLog: () => lifeAreaXpLog,
  lifeAreaXpLogRelations: () => lifeAreaXpLogRelations,
  lifeAreas: () => lifeAreas,
  lifeAreasRelations: () => lifeAreasRelations,
  mandateSuggestions: () => mandateSuggestions,
  mandateSuggestionsRelations: () => mandateSuggestionsRelations,
  meetingParticipants: () => meetingParticipants,
  meetingParticipantsRelations: () => meetingParticipantsRelations,
  membershipRequests: () => membershipRequests,
  membershipRequestsRelations: () => membershipRequestsRelations,
  missionChronicles: () => missionChronicles,
  missionChroniclesRelations: () => missionChroniclesRelations,
  missionEvidence: () => missionEvidence,
  missionEvidenceRelations: () => missionEvidenceRelations,
  monthlyRankings: () => monthlyRankings,
  monthlyRankingsRelations: () => monthlyRankingsRelations,
  notifications: () => notifications,
  notificationsRelations: () => notificationsRelations,
  platformFeedback: () => platformFeedback,
  postBookmarks: () => postBookmarks,
  postBookmarksRelations: () => postBookmarksRelations,
  postComments: () => postComments,
  postCommentsRelations: () => postCommentsRelations,
  postLikes: () => postLikes,
  postLikesRelations: () => postLikesRelations,
  postTags: () => postTags,
  postTagsRelations: () => postTagsRelations,
  postViews: () => postViews,
  postViewsRelations: () => postViewsRelations,
  proposalStatusHistory: () => proposalStatusHistory,
  provinceRankings: () => provinceRankings,
  provinceRankingsRelations: () => provinceRankingsRelations,
  quizAttemptAnswers: () => quizAttemptAnswers,
  quizAttemptAnswersRelations: () => quizAttemptAnswersRelations,
  quizAttempts: () => quizAttempts,
  quizAttemptsRelations: () => quizAttemptsRelations,
  quizQuestions: () => quizQuestions,
  quizQuestionsRelations: () => quizQuestionsRelations,
  recommendations: () => recommendations,
  recommendationsRelations: () => recommendationsRelations,
  resources: () => resources,
  sensorData: () => sensorData,
  sensorDataRelations: () => sensorDataRelations,
  sentimentAnalysis: () => sentimentAnalysis,
  territoryMandates: () => territoryMandates,
  territoryMandatesRelations: () => territoryMandatesRelations,
  textEmbeddings: () => textEmbeddings,
  userActions: () => userActions,
  userActionsRelations: () => userActionsRelations,
  userBadges: () => userBadges,
  userBadgesRelations: () => userBadgesRelations,
  userChallengeProgress: () => userChallengeProgress,
  userChallengeProgressRelations: () => userChallengeProgressRelations,
  userCommitments: () => userCommitments,
  userCommitmentsRelations: () => userCommitmentsRelations,
  userCourseProgress: () => userCourseProgress,
  userCourseProgressRelations: () => userCourseProgressRelations,
  userDailyActivity: () => userDailyActivity,
  userDailyActivityRelations: () => userDailyActivityRelations,
  userLessonProgress: () => userLessonProgress,
  userLessonProgressRelations: () => userLessonProgressRelations,
  userLevels: () => userLevels,
  userLevelsRelations: () => userLevelsRelations,
  userLifeAreaBadges: () => userLifeAreaBadges,
  userLifeAreaBadgesRelations: () => userLifeAreaBadgesRelations,
  userLifeAreaChallenges: () => userLifeAreaChallenges,
  userLifeAreaChallengesRelations: () => userLifeAreaChallengesRelations,
  userLifeAreaProgress: () => userLifeAreaProgress,
  userLifeAreaProgressRelations: () => userLifeAreaProgressRelations,
  userProfiles: () => userProfiles,
  userProfilesRelations: () => userProfilesRelations,
  userProgress: () => userProgress,
  userProgressRelations: () => userProgressRelations,
  userResources: () => userResources,
  userResourcesRelations: () => userResourcesRelations,
  users: () => users,
  usersRelations: () => usersRelations,
  vrMeetings: () => vrMeetings,
  vrMeetingsRelations: () => vrMeetingsRelations,
  weeklyCheckins: () => weeklyCheckins,
  weeklyCheckinsRelations: () => weeklyCheckinsRelations,
  weeklyDigests: () => weeklyDigests,
  weeklyRankings: () => weeklyRankings,
  weeklyRankingsRelations: () => weeklyRankingsRelations
});
import { pgTable, serial, integer, text, real, boolean, unique, index } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";
var users, dreams, userResources, communityPosts, resources, inspiringStories, communityPostInteractions, communityMessages, communityPostActivity, geographicLocations, communityPostLikes, communityPostViews, sentimentAnalysis, textEmbeddings, userProfiles, recommendations, aiInsights, blockchainTransactions, iotSensors, sensorData, vrMeetings, meetingParticipants, blogPosts, postTags, postLikes, postComments, postBookmarks, postViews, courses, courseLessons, courseQuizzes, quizQuestions, courseDefinitions, courseRevisions, courseLessonIdentities, courseRevisionLessons, courseRevisionQuizzes, courseRevisionQuizQuestions, userCourseProgress, userLessonProgress, quizAttempts, quizAttemptAnswers, courseCertificates, userLevels, challenges, challengeSteps, userChallengeProgress, badges, userBadges, userDailyActivity, userCommitments, userActions, userProgress, weeklyRankings, monthlyRankings, provinceRankings, territoryMandates, mandateSuggestions, initiativeMembers, initiativeMilestones, initiativeMessages, initiativeTasks, activityFeed, missionEvidence, missionChronicles, membershipRequests, notifications, lifeAreas, lifeAreaSubcategories, lifeAreaQuizzes, lifeAreaQuizQuestions, lifeAreaQuizResponses, lifeAreaScores, lifeAreaActions, userLifeAreaProgress, lifeAreaMilestones, lifeAreaIndicators, lifeAreaCommunityStats, lifeAreaXpLog, lifeAreaLevels, lifeAreaStreaks, lifeAreaBadges, userLifeAreaBadges, lifeAreaCurrency, lifeAreaRewardChests, lifeAreaChallenges, userLifeAreaChallenges, lifeAreaMastery, lifeAreaNotifications, lifeAreaSocialInteractions, usersRelations, userResourcesRelations, territoryMandatesRelations, mandateSuggestionsRelations, dreamsRelations, communityPostsRelations, communityPostInteractionsRelations, communityMessagesRelations, communityPostActivityRelations, userProfilesRelations, recommendationsRelations, vrMeetingsRelations, meetingParticipantsRelations, userLevelsRelations, challengesRelations, challengeStepsRelations, userChallengeProgressRelations, badgesRelations, userBadgesRelations, userDailyActivityRelations, userCommitmentsRelations, userActionsRelations, userProgressRelations, weeklyRankingsRelations, monthlyRankingsRelations, provinceRankingsRelations, blogPostsRelations, postTagsRelations, postLikesRelations, postCommentsRelations, postBookmarksRelations, postViewsRelations, coursesRelations, courseLessonsRelations, courseQuizzesRelations, quizQuestionsRelations, courseDefinitionsRelations, courseRevisionsRelations, courseLessonIdentitiesRelations, courseRevisionLessonsRelations, courseRevisionQuizzesRelations, courseRevisionQuizQuestionsRelations, userCourseProgressRelations, userLessonProgressRelations, quizAttemptsRelations, quizAttemptAnswersRelations, courseCertificatesRelations, iotSensorsRelations, sensorDataRelations, inspiringStoriesRelations, initiativeMembersRelations, initiativeMilestonesRelations, initiativeMessagesRelations, initiativeTasksRelations, activityFeedRelations, missionEvidenceRelations, missionChroniclesRelations, membershipRequestsRelations, notificationsRelations, lifeAreasRelations, lifeAreaSubcategoriesRelations, lifeAreaQuizzesRelations, lifeAreaQuizQuestionsRelations, lifeAreaQuizResponsesRelations, lifeAreaScoresRelations, lifeAreaActionsRelations, userLifeAreaProgressRelations, lifeAreaMilestonesRelations, lifeAreaIndicatorsRelations, lifeAreaCommunityStatsRelations, lifeAreaXpLogRelations, lifeAreaLevelsRelations, lifeAreaStreaksRelations, lifeAreaBadgesRelations, userLifeAreaBadgesRelations, lifeAreaCurrencyRelations, lifeAreaRewardChestsRelations, lifeAreaChallengesRelations, userLifeAreaChallengesRelations, lifeAreaMasteryRelations, lifeAreaNotificationsRelations, lifeAreaSocialInteractionsRelations, civicAssessments, civicAssessmentResponses, civicProfiles, civicGoals, weeklyCheckins, coachingSessions, coachingPrompts, platformFeedback, insertUserSchema, insertDreamSchema, insertCommunityPostSchema, insertResourceSchema, insertInspiringStorySchema, insertSentimentAnalysisSchema, insertTextEmbeddingSchema, insertUserProfileSchema, insertRecommendationSchema, insertAiInsightSchema, insertBlockchainTransactionSchema, insertIotSensorSchema, insertSensorDataSchema, insertVrMeetingSchema, insertMeetingParticipantSchema, insertUserResourceSchema, insertTerritoryMandateSchema, insertMandateSuggestionSchema, insertUserLevelSchema, insertChallengeSchema, insertChallengeStepSchema, insertUserChallengeProgressSchema, insertBadgeSchema, insertUserBadgeSchema, insertUserDailyActivitySchema, insertUserCommitmentSchema, insertUserActionSchema, insertUserProgressSchema, insertWeeklyRankingSchema, insertMonthlyRankingSchema, insertProvinceRankingSchema, insertBlogPostSchema, insertPostTagSchema, insertPostLikeSchema, insertPostCommentSchema, insertPostBookmarkSchema, insertPostViewSchema, insertCourseSchema, insertCourseLessonSchema, insertCourseQuizSchema, insertQuizQuestionSchema, insertCourseDefinitionSchema, insertCourseRevisionSchema, insertCourseLessonIdentitySchema, insertCourseRevisionLessonSchema, insertCourseRevisionQuizSchema, insertCourseRevisionQuizQuestionSchema, insertUserCourseProgressSchema, insertUserLessonProgressSchema, insertQuizAttemptSchema, insertQuizAttemptAnswerSchema, insertCourseCertificateSchema, insertCommunityPostInteractionSchema, insertCommunityMessageSchema, insertCommunityPostActivitySchema, insertInitiativeMemberSchema, insertInitiativeMilestoneSchema, insertInitiativeMessageSchema, insertInitiativeTaskSchema, insertActivityFeedSchema, insertMissionEvidenceSchema, insertMissionChronicleSchema, insertMembershipRequestSchema, insertNotificationSchema, insertLifeAreaSchema, insertLifeAreaSubcategorySchema, insertLifeAreaQuizSchema, insertLifeAreaQuizQuestionSchema, insertLifeAreaQuizResponseSchema, insertLifeAreaScoreSchema, insertLifeAreaActionSchema, insertUserLifeAreaProgressSchema, insertLifeAreaMilestoneSchema, insertLifeAreaIndicatorSchema, insertLifeAreaCommunityStatsSchema, insertLifeAreaXpLogSchema, insertLifeAreaLevelSchema, insertLifeAreaStreakSchema, insertLifeAreaBadgeSchema, insertUserLifeAreaBadgeSchema, insertLifeAreaCurrencySchema, insertLifeAreaRewardChestSchema, insertLifeAreaChallengeSchema, insertUserLifeAreaChallengeSchema, insertLifeAreaMasterySchema, insertLifeAreaNotificationSchema, insertLifeAreaSocialInteractionSchema, civicAssessmentsRelations, civicAssessmentResponsesRelations, civicProfilesRelations, civicGoalsRelations, weeklyCheckinsRelations, coachingSessionsRelations, coachingPromptsRelations, insertCivicAssessmentSchema, insertCivicAssessmentResponseSchema, insertCivicProfileSchema, insertCivicGoalSchema, insertWeeklyCheckinSchema, insertCoachingSessionSchema, insertCoachingPromptSchema, weeklyDigests, digestProposals, proposalStatusHistory, insertWeeklyDigestSchema, insertDigestProposalSchema, insertProposalStatusHistorySchema, insertPlatformFeedbackSchema;
var init_schema = __esm({
  "shared/schema.ts"() {
    "use strict";
    users = pgTable("users", {
      id: serial("id").primaryKey(),
      username: text("username").notNull().unique(),
      password: text("password").notNull(),
      // Hashed password
      email: text("email").notNull().unique(),
      name: text("name").notNull(),
      location: text("location"),
      createdAt: text("created_at").default(sql`now()`),
      updatedAt: text("updated_at").default(sql`now()`),
      lastLogin: text("last_login"),
      loginAttempts: integer("login_attempts").default(0),
      lockedUntil: text("locked_until"),
      isActive: boolean("is_active").default(true),
      emailVerified: boolean("email_verified").default(false),
      // Email verification
      emailVerificationToken: text("email_verification_token"),
      emailVerificationExpires: text("email_verification_expires"),
      // Password reset
      passwordResetToken: text("password_reset_token"),
      passwordResetExpires: text("password_reset_expires"),
      // Profile image (base64 data URI)
      avatarUrl: text("avatar_url"),
      // Onboarding
      onboardingCompleted: boolean("onboarding_completed").default(false),
      // 2FA
      twoFactorEnabled: boolean("two_factor_enabled").default(false),
      twoFactorSecret: text("two_factor_secret"),
      twoFactorBackupCodes: text("two_factor_backup_codes"),
      // JSON array
      // Open Data opt-out
      dataShareOptOut: boolean("data_share_opt_out").default(false)
    });
    dreams = pgTable("dreams", {
      id: serial("id").primaryKey(),
      userId: integer("user_id").references(() => users.id),
      dream: text("dream"),
      value: text("value"),
      need: text("need"),
      basta: text("basta"),
      location: text("location"),
      latitude: text("latitude"),
      longitude: text("longitude"),
      createdAt: text("created_at").default(sql`now()`),
      type: text("type").notNull().default("dream").$type()
    });
    userResources = pgTable("user_resources", {
      id: serial("id").primaryKey(),
      userId: integer("user_id").references(() => users.id),
      description: text("description").notNull(),
      category: text("category").notNull().$type(),
      availableHours: integer("available_hours"),
      // hours per week
      latitude: real("latitude"),
      longitude: real("longitude"),
      location: text("location"),
      province: text("province"),
      city: text("city"),
      isActive: boolean("is_active").default(true),
      createdAt: text("created_at").default(sql`now()`)
    });
    communityPosts = pgTable("community_posts", {
      id: serial("id").primaryKey(),
      userId: integer("user_id").references(() => users.id),
      title: text("title").notNull(),
      description: text("description").notNull(),
      type: text("type").notNull(),
      // employment, exchange, volunteer, project, donation, mission
      location: text("location").notNull(),
      participants: integer("participants"),
      status: text("status").notNull().default("active").$type(),
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
      // Mission linkage
      missionSlug: text("mission_slug"),
      // Links to a national mission (MissionSlug)
      // New fields for initiative features
      requiresApproval: boolean("requires_approval").default(false),
      memberCount: integer("member_count").default(0),
      settings: text("settings"),
      // JSON with initiative settings
      createdAt: text("created_at").default(sql`now()`),
      updatedAt: text("updated_at").default(sql`now()`)
    });
    resources = pgTable("resources", {
      id: serial("id").primaryKey(),
      title: text("title").notNull(),
      description: text("description").notNull(),
      category: text("category").notNull(),
      url: text("url"),
      createdAt: text("created_at").default(sql`now()`)
    });
    inspiringStories = pgTable("inspiring_stories", {
      id: serial("id").primaryKey(),
      title: text("title").notNull(),
      excerpt: text("excerpt").notNull(),
      content: text("content").notNull(),
      authorId: integer("author_id").references(() => users.id),
      authorName: text("author_name"),
      // Para casos donde no hay usuario registrado
      authorEmail: text("author_email"),
      // Para casos donde no hay usuario registrado
      category: text("category").notNull().$type(),
      location: text("location").notNull(),
      province: text("province"),
      city: text("city"),
      // Impact metrics
      impactType: text("impact_type").notNull().$type(),
      impactCount: integer("impact_count").notNull(),
      impactDescription: text("impact_description").notNull(),
      // Media
      imageUrl: text("image_url"),
      videoUrl: text("video_url"),
      // Verification and moderation
      verified: boolean("verified").default(false),
      featured: boolean("featured").default(false),
      status: text("status").notNull().default("pending").$type(),
      moderatedBy: integer("moderated_by").references(() => users.id),
      moderatedAt: text("moderated_at"),
      moderationNotes: text("moderation_notes"),
      // Engagement metrics
      views: integer("views").default(0),
      likes: integer("likes").default(0),
      shares: integer("shares").default(0),
      // Metadata
      tags: text("tags"),
      // JSON array of tags
      relatedPostId: integer("related_post_id").references(() => communityPosts.id),
      // Link to related community post
      createdAt: text("created_at").default(sql`now()`),
      updatedAt: text("updated_at").default(sql`now()`),
      publishedAt: text("published_at")
    });
    communityPostInteractions = pgTable("community_post_interactions", {
      id: serial("id").primaryKey(),
      postId: integer("post_id").references(() => communityPosts.id),
      userId: integer("user_id").references(() => users.id),
      type: text("type").notNull().$type(),
      status: text("status").notNull().default("pending").$type(),
      message: text("message"),
      createdAt: text("created_at").default(sql`now()`),
      updatedAt: text("updated_at").default(sql`now()`)
    });
    communityMessages = pgTable("community_messages", {
      id: serial("id").primaryKey(),
      senderId: integer("sender_id").references(() => users.id),
      receiverId: integer("receiver_id").references(() => users.id),
      postId: integer("post_id").references(() => communityPosts.id),
      subject: text("subject").notNull(),
      content: text("content").notNull(),
      read: boolean("read").default(false),
      createdAt: text("created_at").default(sql`now()`)
    });
    communityPostActivity = pgTable("community_post_activity", {
      id: serial("id").primaryKey(),
      postId: integer("post_id").references(() => communityPosts.id),
      userId: integer("user_id").references(() => users.id),
      // Can be null for anonymous views
      activityType: text("activity_type").notNull().$type(),
      metadata: text("metadata"),
      // JSON string for additional data
      createdAt: text("created_at").default(sql`now()`)
    });
    geographicLocations = pgTable("geographic_locations", {
      id: serial("id").primaryKey(),
      name: text("name").notNull(),
      type: text("type").notNull().$type(),
      parentId: integer("parent_id").references(() => geographicLocations.id),
      latitude: real("latitude"),
      longitude: real("longitude"),
      postalCode: text("postal_code"),
      country: text("country").default("Argentina"),
      createdAt: text("created_at").default(sql`now()`)
    });
    communityPostLikes = pgTable("community_post_likes", {
      id: serial("id").primaryKey(),
      postId: integer("post_id").references(() => communityPosts.id),
      userId: integer("user_id").references(() => users.id),
      createdAt: text("created_at").default(sql`now()`)
    }, (table) => ({
      uniqueLike: unique("cpl_post_user_unique").on(table.postId, table.userId)
    }));
    communityPostViews = pgTable("community_post_views", {
      id: serial("id").primaryKey(),
      postId: integer("post_id").references(() => communityPosts.id),
      userId: integer("user_id").references(() => users.id),
      // Can be null for anonymous views
      ipAddress: text("ip_address"),
      userAgent: text("user_agent"),
      viewedAt: text("viewed_at").default(sql`now()`)
    });
    sentimentAnalysis = pgTable("sentiment_analysis", {
      id: serial("id").primaryKey(),
      contentId: integer("content_id").notNull(),
      contentType: text("content_type").notNull(),
      // 'dream', 'post', 'story', etc.
      sentiment: text("sentiment").notNull(),
      // 'positive', 'negative', 'neutral'
      confidence: real("confidence"),
      emotions: text("emotions"),
      // JSON string para emociones
      keywords: text("keywords"),
      // JSON string para palabras clave
      topics: text("topics"),
      // JSON string para temas
      analyzedAt: text("analyzed_at").default(sql`now()`)
    });
    textEmbeddings = pgTable("text_embeddings", {
      id: serial("id").primaryKey(),
      contentId: integer("content_id").notNull(),
      contentType: text("content_type").notNull(),
      embedding: text("embedding"),
      // Blob para vector de embeddings
      model: text("model").notNull(),
      createdAt: text("created_at").default(sql`now()`)
    });
    userProfiles = pgTable("user_profiles", {
      id: serial("id").primaryKey(),
      userId: integer("user_id").references(() => users.id).unique(),
      interests: text("interests"),
      // JSON string para intereses
      values: text("values"),
      // JSON string para valores inferidos
      personalityTraits: text("personality_traits"),
      // JSON string para rasgos
      engagementScore: real("engagement_score"),
      lastAnalyzed: text("last_analyzed")
    });
    recommendations = pgTable("recommendations", {
      id: serial("id").primaryKey(),
      userId: integer("user_id").references(() => users.id),
      recommendationType: text("recommendation_type").notNull(),
      // 'content', 'connection', 'project'
      targetId: integer("target_id").notNull(),
      targetType: text("target_type").notNull(),
      score: real("score"),
      reason: text("reason"),
      createdAt: text("created_at").default(sql`now()`),
      clicked: boolean("clicked").default(false),
      dismissed: boolean("dismissed").default(false)
    });
    aiInsights = pgTable("ai_insights", {
      id: serial("id").primaryKey(),
      insightType: text("insight_type").notNull(),
      // 'trend', 'pattern', 'prediction'
      scope: text("scope").notNull(),
      // 'global', 'regional', 'local'
      title: text("title").notNull(),
      description: text("description").notNull(),
      data: text("data"),
      // JSON string para datos adicionales
      confidence: real("confidence"),
      validUntil: text("valid_until"),
      createdAt: text("created_at").default(sql`now()`)
    });
    blockchainTransactions = pgTable("blockchain_transactions", {
      id: serial("id").primaryKey(),
      txHash: text("tx_hash").notNull().unique(),
      userId: integer("user_id").references(() => users.id),
      transactionType: text("transaction_type").notNull(),
      // 'vote', 'donation', 'certification'
      targetId: integer("target_id"),
      targetType: text("target_type"),
      amount: text("amount"),
      // String para precisión de criptomonedas
      network: text("network").notNull(),
      status: text("status").notNull(),
      // 'pending', 'confirmed', 'failed'
      createdAt: text("created_at").default(sql`now()`),
      confirmedAt: text("confirmed_at")
    });
    iotSensors = pgTable("iot_sensors", {
      id: serial("id").primaryKey(),
      sensorId: text("sensor_id").notNull().unique(),
      sensorType: text("sensor_type").notNull(),
      location: text("location").notNull(),
      latitude: real("latitude"),
      longitude: real("longitude"),
      installationDate: text("installation_date"),
      lastReading: text("last_reading"),
      status: text("status").notNull(),
      // 'active', 'inactive', 'maintenance'
      metadata: text("metadata")
      // JSON string para configuración
    });
    sensorData = pgTable("sensor_data", {
      id: serial("id").primaryKey(),
      sensorId: integer("sensor_id").references(() => iotSensors.id),
      reading: text("reading").notNull(),
      // JSON string para datos del sensor
      timestamp: text("timestamp").default(sql`now()`),
      quality: text("quality"),
      // 'good', 'moderate', 'poor'
      processed: boolean("processed").default(false)
    });
    vrMeetings = pgTable("vr_meetings", {
      id: serial("id").primaryKey(),
      title: text("title").notNull(),
      description: text("description"),
      organizerId: integer("organizer_id").references(() => users.id),
      maxParticipants: integer("max_participants"),
      scheduledFor: text("scheduled_for"),
      duration: integer("duration"),
      meetingUrl: text("meeting_url"),
      recordingUrl: text("recording_url"),
      status: text("status").notNull(),
      // 'scheduled', 'active', 'completed', 'cancelled'
      metadata: text("metadata"),
      // JSON string para configuración VR
      createdAt: text("created_at").default(sql`now()`)
    });
    meetingParticipants = pgTable("meeting_participants", {
      id: serial("id").primaryKey(),
      meetingId: integer("meeting_id").references(() => vrMeetings.id),
      userId: integer("user_id").references(() => users.id),
      joinedAt: text("joined_at"),
      leftAt: text("left_at"),
      role: text("role")
      // 'organizer', 'participant', 'moderator'
    });
    blogPosts = pgTable("blog_posts", {
      id: serial("id").primaryKey(),
      title: text("title").notNull(),
      slug: text("slug").notNull().unique(),
      excerpt: text("excerpt").notNull(),
      content: text("content").notNull(),
      authorId: integer("author_id").references(() => users.id),
      publishedAt: text("published_at").default(sql`now()`),
      category: text("category").notNull(),
      featured: boolean("featured").default(false),
      imageUrl: text("image_url"),
      videoUrl: text("video_url"),
      viewCount: integer("view_count").default(0),
      type: text("type").notNull().$type(),
      createdAt: text("created_at").default(sql`now()`),
      updatedAt: text("updated_at").default(sql`now()`)
    });
    postTags = pgTable("post_tags", {
      id: serial("id").primaryKey(),
      postId: integer("post_id").references(() => blogPosts.id),
      tag: text("tag").notNull()
    });
    postLikes = pgTable("post_likes", {
      id: serial("id").primaryKey(),
      postId: integer("post_id").references(() => blogPosts.id),
      userId: integer("user_id").references(() => users.id),
      createdAt: text("created_at").default(sql`now()`)
    });
    postComments = pgTable("post_comments", {
      id: serial("id").primaryKey(),
      postId: integer("post_id").references(() => blogPosts.id),
      userId: integer("user_id").references(() => users.id),
      parentId: integer("parent_id").references(() => postComments.id),
      // Para replies
      content: text("content").notNull(),
      createdAt: text("created_at").default(sql`now()`),
      updatedAt: text("updated_at").default(sql`now()`)
    });
    postBookmarks = pgTable("post_bookmarks", {
      id: serial("id").primaryKey(),
      postId: integer("post_id").references(() => blogPosts.id),
      userId: integer("user_id").references(() => users.id),
      createdAt: text("created_at").default(sql`now()`)
    });
    postViews = pgTable("post_views", {
      id: serial("id").primaryKey(),
      postId: integer("post_id").references(() => blogPosts.id),
      userId: integer("user_id").references(() => users.id),
      // Puede ser null para views anónimas
      sessionId: text("session_id"),
      // Para tracking de usuarios no autenticados
      viewedAt: text("viewed_at").default(sql`now()`)
    });
    courses = pgTable("courses", {
      id: serial("id").primaryKey(),
      title: text("title").notNull(),
      slug: text("slug").notNull().unique(),
      description: text("description").notNull(),
      excerpt: text("excerpt"),
      // Resumen corto para cards
      category: text("category").notNull().$type(),
      level: text("level").notNull().$type(),
      duration: integer("duration"),
      // Duración estimada en minutos
      thumbnailUrl: text("thumbnail_url"),
      videoUrl: text("video_url"),
      // Opcional: video introductorio
      orderIndex: integer("order_index").default(0),
      isPublished: boolean("is_published").default(false),
      isFeatured: boolean("is_featured").default(false),
      requiresAuth: boolean("requires_auth").default(false),
      // Si requiere autenticación
      authorId: integer("author_id").references(() => users.id),
      viewCount: integer("view_count").default(0),
      createdAt: text("created_at").default(sql`now()`),
      updatedAt: text("updated_at").default(sql`now()`)
    });
    courseLessons = pgTable("course_lessons", {
      id: serial("id").primaryKey(),
      courseId: integer("course_id").references(() => courses.id),
      title: text("title").notNull(),
      description: text("description"),
      content: text("content").notNull(),
      // Contenido HTML/Markdown
      orderIndex: integer("order_index").notNull(),
      type: text("type").notNull().$type(),
      videoUrl: text("video_url"),
      documentUrl: text("document_url"),
      duration: integer("duration"),
      // Duración estimada en minutos
      isRequired: boolean("is_required").default(true),
      createdAt: text("created_at").default(sql`now()`),
      updatedAt: text("updated_at").default(sql`now()`)
    });
    courseQuizzes = pgTable("course_quizzes", {
      id: serial("id").primaryKey(),
      courseId: integer("course_id").references(() => courses.id).unique(),
      title: text("title").notNull(),
      description: text("description"),
      passingScore: integer("passing_score").default(70),
      // Porcentaje mínimo para aprobar
      timeLimit: integer("time_limit"),
      // Tiempo límite en minutos (opcional)
      allowRetakes: boolean("allow_retakes").default(true),
      maxAttempts: integer("max_attempts"),
      // Máximo de intentos (null = ilimitado)
      createdAt: text("created_at").default(sql`now()`),
      updatedAt: text("updated_at").default(sql`now()`)
    });
    quizQuestions = pgTable("quiz_questions", {
      id: serial("id").primaryKey(),
      quizId: integer("quiz_id").references(() => courseQuizzes.id),
      question: text("question").notNull(),
      type: text("type").notNull().$type(),
      options: text("options"),
      // JSON array de opciones para multiple choice
      correctAnswer: text("correct_answer").notNull(),
      // JSON para respuestas correctas
      explanation: text("explanation"),
      // Explicación de la respuesta correcta
      points: integer("points").default(1),
      orderIndex: integer("order_index").notNull(),
      createdAt: text("created_at").default(sql`now()`)
    });
    courseDefinitions = pgTable("course_definitions", {
      id: serial("id").primaryKey(),
      slug: text("slug").notNull().unique(),
      legacyCourseId: integer("legacy_course_id").references(() => courses.id),
      sourcePath: text("source_path"),
      currentPublishedRevisionId: integer("current_published_revision_id").references(() => courseRevisions.id),
      viewCount: integer("view_count").default(0),
      createdAt: text("created_at").default(sql`now()`),
      updatedAt: text("updated_at").default(sql`now()`)
    }, (table) => ({
      uniqueLegacyCourse: unique().on(table.legacyCourseId)
    }));
    courseRevisions = pgTable("course_revisions", {
      id: serial("id").primaryKey(),
      courseDefinitionId: integer("course_definition_id").references(() => courseDefinitions.id),
      revisionNumber: integer("revision_number").notNull(),
      contentHash: text("content_hash").notNull(),
      title: text("title").notNull(),
      description: text("description").notNull(),
      excerpt: text("excerpt"),
      category: text("category").notNull().$type(),
      level: text("level").notNull().$type(),
      duration: integer("duration"),
      thumbnailUrl: text("thumbnail_url"),
      videoUrl: text("video_url"),
      orderIndex: integer("order_index").default(0),
      isPublished: boolean("is_published").default(false),
      isFeatured: boolean("is_featured").default(false),
      requiresAuth: boolean("requires_auth").default(false),
      authorId: integer("author_id").references(() => users.id),
      legacyCourseId: integer("legacy_course_id").references(() => courses.id),
      seoTitle: text("seo_title"),
      seoDescription: text("seo_description"),
      searchSummary: text("search_summary"),
      ogImageUrl: text("og_image_url"),
      lastReviewedAt: text("last_reviewed_at"),
      indexable: boolean("indexable").default(true),
      publishedAt: text("published_at").default(sql`now()`),
      createdAt: text("created_at").default(sql`now()`)
    }, (table) => ({
      uniqueRevisionNumber: unique().on(table.courseDefinitionId, table.revisionNumber),
      uniqueRevisionHash: unique().on(table.courseDefinitionId, table.contentHash)
    }));
    courseLessonIdentities = pgTable("course_lesson_identities", {
      id: serial("id").primaryKey(),
      courseDefinitionId: integer("course_definition_id").references(() => courseDefinitions.id),
      key: text("key").notNull(),
      legacyLessonId: integer("legacy_lesson_id").references(() => courseLessons.id),
      createdAt: text("created_at").default(sql`now()`),
      updatedAt: text("updated_at").default(sql`now()`)
    }, (table) => ({
      uniqueLessonKey: unique().on(table.courseDefinitionId, table.key),
      uniqueLegacyLesson: unique().on(table.legacyLessonId)
    }));
    courseRevisionLessons = pgTable("course_revision_lessons", {
      id: serial("id").primaryKey(),
      courseRevisionId: integer("course_revision_id").references(() => courseRevisions.id),
      lessonIdentityId: integer("lesson_identity_id").references(() => courseLessonIdentities.id),
      title: text("title").notNull(),
      description: text("description"),
      contentMarkdown: text("content_markdown").notNull(),
      contentHtml: text("content_html").notNull(),
      orderIndex: integer("order_index").notNull(),
      type: text("type").notNull().$type(),
      videoUrl: text("video_url"),
      documentUrl: text("document_url"),
      duration: integer("duration"),
      isRequired: boolean("is_required").default(true),
      legacyLessonId: integer("legacy_lesson_id").references(() => courseLessons.id),
      seoTitle: text("seo_title"),
      seoDescription: text("seo_description"),
      searchSummary: text("search_summary"),
      indexable: boolean("indexable").default(true),
      createdAt: text("created_at").default(sql`now()`)
    }, (table) => ({
      uniqueRevisionLesson: unique().on(table.courseRevisionId, table.lessonIdentityId)
    }));
    courseRevisionQuizzes = pgTable("course_revision_quizzes", {
      id: serial("id").primaryKey(),
      courseRevisionId: integer("course_revision_id").references(() => courseRevisions.id).unique(),
      legacyQuizId: integer("legacy_quiz_id").references(() => courseQuizzes.id),
      title: text("title").notNull(),
      description: text("description"),
      passingScore: integer("passing_score").default(70),
      timeLimit: integer("time_limit"),
      allowRetakes: boolean("allow_retakes").default(true),
      maxAttempts: integer("max_attempts"),
      createdAt: text("created_at").default(sql`now()`),
      updatedAt: text("updated_at").default(sql`now()`)
    });
    courseRevisionQuizQuestions = pgTable("course_revision_quiz_questions", {
      id: serial("id").primaryKey(),
      quizRevisionId: integer("quiz_revision_id").references(() => courseRevisionQuizzes.id),
      legacyQuestionId: integer("legacy_question_id").references(() => quizQuestions.id),
      question: text("question").notNull(),
      type: text("type").notNull().$type(),
      options: text("options"),
      correctAnswer: text("correct_answer").notNull(),
      explanation: text("explanation"),
      points: integer("points").default(1),
      orderIndex: integer("order_index").notNull(),
      createdAt: text("created_at").default(sql`now()`)
    });
    userCourseProgress = pgTable("user_course_progress", {
      id: serial("id").primaryKey(),
      userId: integer("user_id").references(() => users.id),
      courseId: integer("course_id").references(() => courses.id),
      courseDefinitionId: integer("course_definition_id").references(() => courseDefinitions.id),
      status: text("status").notNull().$type(),
      progress: integer("progress").default(0),
      // Porcentaje 0-100
      currentLessonId: integer("current_lesson_id").references(() => courseLessons.id),
      currentLessonIdentityId: integer("current_lesson_identity_id").references(() => courseLessonIdentities.id),
      completedLessons: text("completed_lessons"),
      // JSON array de IDs de lecciones completadas
      completedLessonIdentityIds: text("completed_lesson_identity_ids"),
      // JSON array de IDs estables
      startedAt: text("started_at"),
      completedAt: text("completed_at"),
      lastAccessedAt: text("last_accessed_at"),
      createdAt: text("created_at").default(sql`now()`),
      updatedAt: text("updated_at").default(sql`now()`)
    });
    userLessonProgress = pgTable("user_lesson_progress", {
      id: serial("id").primaryKey(),
      userId: integer("user_id").references(() => users.id),
      lessonId: integer("lesson_id").references(() => courseLessons.id),
      lessonIdentityId: integer("lesson_identity_id").references(() => courseLessonIdentities.id),
      status: text("status").notNull().$type(),
      timeSpent: integer("time_spent").default(0),
      // Tiempo en segundos
      completedAt: text("completed_at"),
      createdAt: text("created_at").default(sql`now()`),
      updatedAt: text("updated_at").default(sql`now()`)
    });
    quizAttempts = pgTable("quiz_attempts", {
      id: serial("id").primaryKey(),
      userId: integer("user_id").references(() => users.id),
      quizId: integer("quiz_id").references(() => courseQuizzes.id),
      courseId: integer("course_id").references(() => courses.id),
      courseDefinitionId: integer("course_definition_id").references(() => courseDefinitions.id),
      courseRevisionId: integer("course_revision_id").references(() => courseRevisions.id),
      courseQuizRevisionId: integer("course_quiz_revision_id").references(() => courseRevisionQuizzes.id),
      score: integer("score"),
      // Porcentaje obtenido
      passed: boolean("passed").default(false),
      answers: text("answers"),
      // JSON con las respuestas del usuario
      timeSpent: integer("time_spent"),
      // Tiempo en segundos
      startedAt: text("started_at").default(sql`now()`),
      completedAt: text("completed_at")
    });
    quizAttemptAnswers = pgTable("quiz_attempt_answers", {
      id: serial("id").primaryKey(),
      attemptId: integer("attempt_id").references(() => quizAttempts.id),
      questionId: integer("question_id").references(() => quizQuestions.id),
      answer: text("answer").notNull(),
      // Respuesta del usuario (JSON)
      isCorrect: boolean("is_correct").default(false),
      pointsEarned: integer("points_earned").default(0),
      createdAt: text("created_at").default(sql`now()`)
    });
    courseCertificates = pgTable("course_certificates", {
      id: serial("id").primaryKey(),
      userId: integer("user_id").references(() => users.id),
      courseId: integer("course_id").references(() => courses.id),
      courseDefinitionId: integer("course_definition_id").references(() => courseDefinitions.id),
      courseRevisionId: integer("course_revision_id").references(() => courseRevisions.id),
      certificateCode: text("certificate_code").notNull().unique(),
      // Código único del certificado
      issuedAt: text("issued_at").default(sql`now()`),
      quizScore: integer("quiz_score")
      // Score del quiz final
    });
    userLevels = pgTable("user_levels", {
      id: serial("id").primaryKey(),
      userId: integer("user_id").references(() => users.id).unique(),
      currentLevel: integer("current_level").default(1),
      // 1-5
      experience: integer("experience").default(0),
      experienceToNext: integer("experience_to_next").default(500),
      streak: integer("streak").default(0),
      // Días consecutivos
      lastActivityDate: text("last_activity_date"),
      createdAt: text("created_at").default(sql`now()`),
      updatedAt: text("updated_at").default(sql`now()`)
    });
    challenges = pgTable("challenges", {
      id: serial("id").primaryKey(),
      level: integer("level").notNull(),
      // 1-5
      title: text("title").notNull(),
      description: text("description").notNull(),
      category: text("category").notNull(),
      // 'vision', 'action', 'community', 'reflection'
      difficulty: text("difficulty").notNull(),
      // 'beginner', 'intermediate', 'advanced'
      frequency: text("frequency").notNull(),
      // 'daily', 'weekly', 'monthly', 'annual', 'one-time'
      experience: integer("experience").notNull(),
      // XP que otorga
      duration: text("duration"),
      // "15 min", "1 hora", etc.
      iconName: text("icon_name"),
      // Nombre del icono de Lucide
      orderIndex: integer("order_index").default(0),
      isActive: boolean("is_active").default(true),
      createdAt: text("created_at").default(sql`now()`)
    });
    challengeSteps = pgTable("challenge_steps", {
      id: serial("id").primaryKey(),
      challengeId: integer("challenge_id").references(() => challenges.id),
      title: text("title").notNull(),
      description: text("description").notNull(),
      type: text("type").notNull(),
      // 'question', 'action', 'reflection', 'quiz'
      orderIndex: integer("order_index").notNull(),
      data: text("data"),
      // JSON con opciones, preguntas, etc.
      createdAt: text("created_at").default(sql`now()`)
    });
    userChallengeProgress = pgTable("user_challenge_progress", {
      id: serial("id").primaryKey(),
      userId: integer("user_id").references(() => users.id),
      challengeId: integer("challenge_id").references(() => challenges.id),
      status: text("status").notNull(),
      // 'not_started', 'in_progress', 'completed', 'failed'
      currentStep: integer("current_step").default(0),
      completedSteps: text("completed_steps"),
      // JSON array de IDs
      startedAt: text("started_at"),
      completedAt: text("completed_at"),
      lastActivityAt: text("last_activity_at"),
      createdAt: text("created_at").default(sql`now()`)
    });
    badges = pgTable("badges", {
      id: serial("id").primaryKey(),
      name: text("name").notNull(),
      description: text("description").notNull(),
      iconName: text("icon_name").notNull(),
      category: text("category").notNull(),
      // 'level', 'streak', 'challenge', 'special', 'reading'
      requirement: text("requirement").notNull(),
      // Descripción del requisito
      requirementData: text("requirement_data"),
      // JSON con criterios específicos
      rarity: text("rarity").notNull(),
      // 'common', 'rare', 'epic', 'legendary'
      experienceReward: integer("experience_reward").default(0),
      orderIndex: integer("order_index").default(0),
      createdAt: text("created_at").default(sql`now()`)
    });
    userBadges = pgTable("user_badges", {
      id: serial("id").primaryKey(),
      userId: integer("user_id").references(() => users.id),
      badgeId: integer("badge_id").references(() => badges.id),
      earnedAt: text("earned_at").default(sql`now()`),
      seen: boolean("seen").default(false)
    });
    userDailyActivity = pgTable("user_daily_activity", {
      id: serial("id").primaryKey(),
      userId: integer("user_id").references(() => users.id),
      date: text("date").notNull(),
      // YYYY-MM-DD
      experienceGained: integer("experience_gained").default(0),
      challengesCompleted: integer("challenges_completed").default(0),
      actionsCompleted: integer("actions_completed").default(0),
      streakActive: boolean("streak_active").default(true),
      createdAt: text("created_at").default(sql`now()`)
    });
    userCommitments = pgTable("user_commitments", {
      id: serial("id").primaryKey(),
      userId: integer("user_id").references(() => users.id),
      commitmentText: text("commitment_text").notNull(),
      commitmentType: text("commitment_type").notNull(),
      // 'initial', 'intermediate', 'public'
      province: text("province"),
      city: text("city"),
      latitude: real("latitude"),
      longitude: real("longitude"),
      status: text("status").notNull().default("active"),
      // 'active', 'completed', 'broken'
      pointsAwarded: integer("points_awarded").default(0),
      createdAt: text("created_at").default(sql`now()`),
      completedAt: text("completed_at")
    });
    userActions = pgTable("user_actions", {
      id: serial("id").primaryKey(),
      userId: integer("user_id").references(() => users.id),
      actionType: text("action_type").notNull(),
      // 'page_view', 'commitment', 'share', 'community_post', etc.
      points: integer("points").notNull(),
      metadata: text("metadata"),
      // JSON con datos adicionales
      createdAt: text("created_at").default(sql`now()`)
    });
    userProgress = pgTable("user_progress", {
      id: serial("id").primaryKey(),
      userId: integer("user_id").references(() => users.id).unique(),
      level: integer("level").default(1),
      // 1-5 niveles del Hombre Gris
      points: integer("points").default(0),
      rank: text("rank").default("Novato"),
      // Novato, Despierto, Hombre Gris, Agente de Cambio, Líder del Movimiento
      totalActions: integer("total_actions").default(0),
      lastActionAt: text("last_action_at"),
      createdAt: text("created_at").default(sql`now()`),
      updatedAt: text("updated_at").default(sql`now()`)
    });
    weeklyRankings = pgTable("weekly_rankings", {
      id: serial("id").primaryKey(),
      userId: integer("user_id").references(() => users.id),
      weekStart: text("week_start").notNull(),
      // YYYY-MM-DD
      points: integer("points").default(0),
      rank: integer("rank"),
      createdAt: text("created_at").default(sql`now()`)
    });
    monthlyRankings = pgTable("monthly_rankings", {
      id: serial("id").primaryKey(),
      userId: integer("user_id").references(() => users.id),
      monthStart: text("month_start").notNull(),
      // YYYY-MM
      points: integer("points").default(0),
      rank: integer("rank"),
      createdAt: text("created_at").default(sql`now()`)
    });
    provinceRankings = pgTable("province_rankings", {
      id: serial("id").primaryKey(),
      userId: integer("user_id").references(() => users.id),
      province: text("province").notNull(),
      points: integer("points").default(0),
      rank: integer("rank"),
      updatedAt: text("updated_at").default(sql`now()`)
    });
    territoryMandates = pgTable("territory_mandates", {
      id: serial("id").primaryKey(),
      territoryLevel: text("territory_level").notNull().$type(),
      territoryName: text("territory_name").notNull(),
      province: text("province"),
      city: text("city"),
      version: integer("version").notNull().default(1),
      voiceCount: integer("voice_count").notNull().default(0),
      convergenceScore: real("convergence_score"),
      // AI-generated content (JSON)
      diagnosis: text("diagnosis"),
      // JSON: top priorities with evidence
      availableResources: text("available_resources"),
      // JSON: resource summary
      gaps: text("gaps"),
      // JSON: gap analysis
      suggestedActions: text("suggested_actions"),
      // JSON: action plans
      rawSummary: text("raw_summary"),
      // Plain text executive summary
      status: text("status").notNull().default("draft").$type(),
      generatedAt: text("generated_at").default(sql`now()`),
      publishedAt: text("published_at"),
      createdAt: text("created_at").default(sql`now()`)
    });
    mandateSuggestions = pgTable("mandate_suggestions", {
      id: serial("id").primaryKey(),
      mandateId: integer("mandate_id").references(() => territoryMandates.id),
      territoryName: text("territory_name").notNull(),
      needCategory: text("need_category").notNull(),
      // theme key
      needCount: integer("need_count").notNull().default(0),
      resourceCount: integer("resource_count").notNull().default(0),
      suggestedAction: text("suggested_action").notNull(),
      precedent: text("precedent"),
      // similar success elsewhere
      status: text("status").notNull().default("suggested").$type(),
      activatedBy: integer("activated_by").references(() => users.id),
      initiativeId: integer("initiative_id").references(() => communityPosts.id),
      createdAt: text("created_at").default(sql`now()`)
    });
    initiativeMembers = pgTable("initiative_members", {
      id: serial("id").primaryKey(),
      postId: integer("post_id").references(() => communityPosts.id),
      userId: integer("user_id").references(() => users.id),
      role: text("role").notNull(),
      // Roles personalizables por iniciativa
      status: text("status").notNull().default("active").$type(),
      permissions: text("permissions"),
      // JSON: {canEdit, canInvite, canPost, etc}
      joinedAt: text("joined_at").default(sql`now()`),
      leftAt: text("left_at")
    }, (table) => ({
      uniqueMember: unique("im_post_user_unique").on(table.postId, table.userId),
      postIdIdx: index("im_post_id_idx").on(table.postId)
    }));
    initiativeMilestones = pgTable("initiative_milestones", {
      id: serial("id").primaryKey(),
      postId: integer("post_id").references(() => communityPosts.id),
      title: text("title").notNull(),
      description: text("description"),
      status: text("status").notNull().default("pending").$type(),
      dueDate: text("due_date"),
      completedAt: text("completed_at"),
      completedBy: integer("completed_by").references(() => users.id),
      orderIndex: integer("order_index").default(0),
      createdAt: text("created_at").default(sql`now()`),
      updatedAt: text("updated_at").default(sql`now()`)
    }, (table) => ({
      postIdIdx: index("ims_post_id_idx").on(table.postId)
    }));
    initiativeMessages = pgTable("initiative_messages", {
      id: serial("id").primaryKey(),
      postId: integer("post_id").references(() => communityPosts.id),
      userId: integer("user_id").references(() => users.id),
      content: text("content").notNull(),
      type: text("type").notNull().default("message").$type(),
      metadata: text("metadata"),
      // JSON para datos adicionales
      createdAt: text("created_at").default(sql`now()`)
    });
    initiativeTasks = pgTable("initiative_tasks", {
      id: serial("id").primaryKey(),
      postId: integer("post_id").references(() => communityPosts.id),
      milestoneId: integer("milestone_id").references(() => initiativeMilestones.id),
      title: text("title").notNull(),
      description: text("description"),
      assignedTo: integer("assigned_to").references(() => users.id),
      status: text("status").notNull().default("todo").$type(),
      priority: text("priority").default("medium").$type(),
      dueDate: text("due_date"),
      completedAt: text("completed_at"),
      createdBy: integer("created_by").references(() => users.id),
      createdAt: text("created_at").default(sql`now()`),
      updatedAt: text("updated_at").default(sql`now()`)
    }, (table) => ({
      postIdIdx: index("it_post_id_idx").on(table.postId)
    }));
    activityFeed = pgTable("activity_feed", {
      id: serial("id").primaryKey(),
      type: text("type").notNull().$type(),
      postId: integer("post_id").references(() => communityPosts.id),
      userId: integer("user_id").references(() => users.id),
      targetId: integer("target_id"),
      // ID del milestone, task, etc
      title: text("title").notNull(),
      description: text("description"),
      metadata: text("metadata"),
      // JSON con datos adicionales
      createdAt: text("created_at").default(sql`now()`)
    }, (table) => ({
      createdAtIdx: index("af_created_at_idx").on(table.createdAt)
    }));
    missionEvidence = pgTable("mission_evidence", {
      id: serial("id").primaryKey(),
      postId: integer("post_id").references(() => communityPosts.id),
      milestoneId: integer("milestone_id").references(() => initiativeMilestones.id),
      userId: integer("user_id").references(() => users.id),
      evidenceType: text("evidence_type").notNull(),
      content: text("content").notNull(),
      imageUrl: text("image_url"),
      latitude: text("latitude"),
      longitude: text("longitude"),
      status: text("status").notNull().default("pending").$type(),
      flagCategory: text("flag_category"),
      verifiedBy: integer("verified_by").references(() => users.id),
      verifiedAt: text("verified_at"),
      createdAt: text("created_at").default(sql`now()`)
    });
    missionChronicles = pgTable("mission_chronicles", {
      id: serial("id").primaryKey(),
      postId: integer("post_id").references(() => communityPosts.id),
      userId: integer("user_id").references(() => users.id),
      title: text("title").notNull(),
      content: text("content").notNull(),
      highlightedEvidenceIds: text("highlighted_evidence_ids"),
      publishedAt: text("published_at"),
      createdAt: text("created_at").default(sql`now()`)
    });
    membershipRequests = pgTable("membership_requests", {
      id: serial("id").primaryKey(),
      postId: integer("post_id").references(() => communityPosts.id),
      userId: integer("user_id").references(() => users.id),
      message: text("message"),
      // Mensaje de presentación
      status: text("status").notNull().default("pending").$type(),
      reviewedBy: integer("reviewed_by").references(() => users.id),
      reviewedAt: text("reviewed_at"),
      createdAt: text("created_at").default(sql`now()`)
    }, (table) => ({
      uniqueRequest: unique("mr_post_user_unique").on(table.postId, table.userId)
    }));
    notifications = pgTable("notifications", {
      id: serial("id").primaryKey(),
      userId: integer("user_id").references(() => users.id),
      type: text("type").notNull().$type(),
      title: text("title").notNull(),
      content: text("content").notNull(),
      postId: integer("post_id").references(() => communityPosts.id),
      targetId: integer("target_id"),
      // ID del recurso relacionado
      read: boolean("read").default(false),
      createdAt: text("created_at").default(sql`now()`)
    }, (table) => ({
      userIdIdx: index("notif_user_id_idx").on(table.userId)
    }));
    lifeAreas = pgTable("life_areas", {
      id: serial("id").primaryKey(),
      name: text("name").notNull(),
      description: text("description"),
      iconName: text("icon_name"),
      orderIndex: integer("order_index").notNull(),
      colorTheme: text("color_theme"),
      // JSON con colores del tema
      createdAt: text("created_at").default(sql`now()`)
    });
    lifeAreaSubcategories = pgTable("life_area_subcategories", {
      id: serial("id").primaryKey(),
      lifeAreaId: integer("life_area_id").references(() => lifeAreas.id),
      name: text("name").notNull(),
      description: text("description"),
      orderIndex: integer("order_index").notNull(),
      createdAt: text("created_at").default(sql`now()`)
    });
    lifeAreaQuizzes = pgTable("life_area_quizzes", {
      id: serial("id").primaryKey(),
      lifeAreaId: integer("life_area_id").references(() => lifeAreas.id),
      title: text("title").notNull(),
      description: text("description"),
      version: integer("version").default(1),
      createdAt: text("created_at").default(sql`now()`)
    });
    lifeAreaQuizQuestions = pgTable("life_area_quiz_questions", {
      id: serial("id").primaryKey(),
      quizId: integer("quiz_id").references(() => lifeAreaQuizzes.id),
      questionText: text("question_text").notNull(),
      questionType: text("question_type").notNull().$type(),
      orderIndex: integer("order_index").notNull(),
      category: text("category").notNull().$type(),
      subcategoryId: integer("subcategory_id").references(() => lifeAreaSubcategories.id),
      createdAt: text("created_at").default(sql`now()`)
    });
    lifeAreaQuizResponses = pgTable("life_area_quiz_responses", {
      id: serial("id").primaryKey(),
      userId: integer("user_id").references(() => users.id),
      quizId: integer("quiz_id").references(() => lifeAreaQuizzes.id),
      questionId: integer("question_id").references(() => lifeAreaQuizQuestions.id),
      currentValue: integer("current_value"),
      // 1-100
      desiredValue: integer("desired_value"),
      // 1-100
      answeredAt: text("answered_at").default(sql`now()`),
      createdAt: text("created_at").default(sql`now()`)
    });
    lifeAreaScores = pgTable("life_area_scores", {
      id: serial("id").primaryKey(),
      userId: integer("user_id").references(() => users.id),
      lifeAreaId: integer("life_area_id").references(() => lifeAreas.id),
      subcategoryId: integer("subcategory_id").references(() => lifeAreaSubcategories.id),
      currentScore: integer("current_score").notNull(),
      // 1-100
      desiredScore: integer("desired_score").notNull(),
      // 1-100
      gap: integer("gap").notNull(),
      // desired - current
      lastUpdated: text("last_updated").default(sql`now()`),
      createdAt: text("created_at").default(sql`now()`)
    });
    lifeAreaActions = pgTable("life_area_actions", {
      id: serial("id").primaryKey(),
      lifeAreaId: integer("life_area_id").references(() => lifeAreas.id),
      subcategoryId: integer("subcategory_id").references(() => lifeAreaSubcategories.id),
      title: text("title").notNull(),
      description: text("description").notNull(),
      difficulty: text("difficulty").notNull().$type(),
      estimatedDuration: text("estimated_duration"),
      // "15 min", "1 hora", etc.
      priority: integer("priority").default(0),
      // Mayor número = mayor prioridad
      category: text("category"),
      // Categoría de la acción
      xpReward: integer("xp_reward").default(50),
      seedReward: integer("seed_reward").default(10),
      createdAt: text("created_at").default(sql`now()`)
    });
    userLifeAreaProgress = pgTable("user_life_area_progress", {
      id: serial("id").primaryKey(),
      userId: integer("user_id").references(() => users.id),
      actionId: integer("action_id").references(() => lifeAreaActions.id),
      status: text("status").notNull().$type(),
      startedAt: text("started_at"),
      completedAt: text("completed_at"),
      notes: text("notes"),
      evidence: text("evidence"),
      // JSON con evidencia (fotos, links, etc.)
      createdAt: text("created_at").default(sql`now()`),
      updatedAt: text("updated_at").default(sql`now()`)
    });
    lifeAreaMilestones = pgTable("life_area_milestones", {
      id: serial("id").primaryKey(),
      userId: integer("user_id").references(() => users.id),
      lifeAreaId: integer("life_area_id").references(() => lifeAreas.id),
      title: text("title").notNull(),
      description: text("description"),
      targetScore: integer("target_score").notNull(),
      // Score objetivo
      achievedScore: integer("achieved_score"),
      achievedAt: text("achieved_at"),
      shareToken: text("share_token").unique(),
      // Token único para compartir
      sharedAt: text("shared_at"),
      createdAt: text("created_at").default(sql`now()`)
    });
    lifeAreaIndicators = pgTable("life_area_indicators", {
      id: serial("id").primaryKey(),
      userId: integer("user_id").references(() => users.id),
      lifeAreaId: integer("life_area_id").references(() => lifeAreas.id),
      indicatorType: text("indicator_type").notNull().$type(),
      value: real("value").notNull(),
      metadata: text("metadata"),
      // JSON con datos adicionales
      recordedAt: text("recorded_at").default(sql`now()`)
    });
    lifeAreaCommunityStats = pgTable("life_area_community_stats", {
      id: serial("id").primaryKey(),
      lifeAreaId: integer("life_area_id").references(() => lifeAreas.id),
      period: text("period").notNull().$type(),
      avgScore: real("avg_score"),
      medianScore: real("median_score"),
      totalUsers: integer("total_users").default(0),
      percentileData: text("percentile_data"),
      // JSON con datos de percentiles
      calculatedAt: text("calculated_at").default(sql`now()`)
    });
    lifeAreaXpLog = pgTable("life_area_xp_log", {
      id: serial("id").primaryKey(),
      userId: integer("user_id").references(() => users.id),
      lifeAreaId: integer("life_area_id").references(() => lifeAreas.id),
      xpAmount: integer("xp_amount").notNull(),
      sourceType: text("source_type").notNull().$type(),
      sourceId: integer("source_id"),
      // ID del recurso que generó el XP
      multiplier: real("multiplier").default(1),
      createdAt: text("created_at").default(sql`now()`)
    });
    lifeAreaLevels = pgTable("life_area_levels", {
      id: serial("id").primaryKey(),
      userId: integer("user_id").references(() => users.id),
      lifeAreaId: integer("life_area_id").references(() => lifeAreas.id),
      level: integer("level").default(1),
      // 1-10
      xpCurrent: integer("xp_current").default(0),
      xpRequired: integer("xp_required").default(100),
      unlockedFeatures: text("unlocked_features"),
      // JSON con features desbloqueadas
      levelUpAt: text("level_up_at"),
      createdAt: text("created_at").default(sql`now()`),
      updatedAt: text("updated_at").default(sql`now()`)
    });
    lifeAreaStreaks = pgTable("life_area_streaks", {
      id: serial("id").primaryKey(),
      userId: integer("user_id").references(() => users.id),
      streakType: text("streak_type").notNull().$type(),
      currentStreak: integer("current_streak").default(0),
      longestStreak: integer("longest_streak").default(0),
      lastActivityDate: text("last_activity_date"),
      bonusMultiplier: real("bonus_multiplier").default(1),
      createdAt: text("created_at").default(sql`now()`),
      updatedAt: text("updated_at").default(sql`now()`)
    });
    lifeAreaBadges = pgTable("life_area_badges", {
      id: serial("id").primaryKey(),
      name: text("name").notNull(),
      description: text("description").notNull(),
      iconName: text("icon_name").notNull(),
      rarity: text("rarity").notNull().$type(),
      requirementType: text("requirement_type").notNull().$type(),
      requirementData: text("requirement_data"),
      // JSON con criterios específicos
      xpReward: integer("xp_reward").default(0),
      seedReward: integer("seed_reward").default(0),
      createdAt: text("created_at").default(sql`now()`)
    });
    userLifeAreaBadges = pgTable("user_life_area_badges", {
      id: serial("id").primaryKey(),
      userId: integer("user_id").references(() => users.id),
      badgeId: integer("badge_id").references(() => lifeAreaBadges.id),
      earnedAt: text("earned_at").default(sql`now()`),
      seen: boolean("seen").default(false),
      sharedAt: text("shared_at")
    });
    lifeAreaCurrency = pgTable("life_area_currency", {
      id: serial("id").primaryKey(),
      userId: integer("user_id").references(() => users.id).unique(),
      currencyType: text("currency_type").default("seeds"),
      amount: integer("amount").default(0),
      totalEarned: integer("total_earned").default(0),
      totalSpent: integer("total_spent").default(0),
      updatedAt: text("updated_at").default(sql`now()`),
      createdAt: text("created_at").default(sql`now()`)
    });
    lifeAreaRewardChests = pgTable("life_area_reward_chests", {
      id: serial("id").primaryKey(),
      userId: integer("user_id").references(() => users.id),
      chestType: text("chest_type").notNull().$type(),
      rewards: text("rewards"),
      // JSON con recompensas
      openedAt: text("opened_at"),
      expiresAt: text("expires_at"),
      rarity: text("rarity").$type(),
      createdAt: text("created_at").default(sql`now()`)
    });
    lifeAreaChallenges = pgTable("life_area_challenges", {
      id: serial("id").primaryKey(),
      challengeType: text("challenge_type").notNull().$type(),
      title: text("title").notNull(),
      description: text("description").notNull(),
      requirements: text("requirements"),
      // JSON con requisitos
      rewards: text("rewards"),
      // JSON con recompensas
      startDate: text("start_date").notNull(),
      endDate: text("end_date").notNull(),
      isActive: boolean("is_active").default(true),
      participantCount: integer("participant_count").default(0),
      createdAt: text("created_at").default(sql`now()`)
    });
    userLifeAreaChallenges = pgTable("user_life_area_challenges", {
      id: serial("id").primaryKey(),
      userId: integer("user_id").references(() => users.id),
      challengeId: integer("challenge_id").references(() => lifeAreaChallenges.id),
      progress: text("progress"),
      // JSON con progreso
      status: text("status").notNull().$type(),
      completedAt: text("completed_at"),
      rewardsClaimed: boolean("rewards_claimed").default(false),
      createdAt: text("created_at").default(sql`now()`),
      updatedAt: text("updated_at").default(sql`now()`)
    });
    lifeAreaMastery = pgTable("life_area_mastery", {
      id: serial("id").primaryKey(),
      userId: integer("user_id").references(() => users.id),
      lifeAreaId: integer("life_area_id").references(() => lifeAreas.id),
      masteryPercentage: real("mastery_percentage").default(0),
      // 0-100
      actionsCompleted: integer("actions_completed").default(0),
      totalActions: integer("total_actions").default(0),
      timeInvestedMinutes: integer("time_invested_minutes").default(0),
      unlockedContent: text("unlocked_content"),
      // JSON con contenido desbloqueado
      masteryLevel: text("mastery_level").default("novice").$type(),
      createdAt: text("created_at").default(sql`now()`),
      updatedAt: text("updated_at").default(sql`now()`)
    });
    lifeAreaNotifications = pgTable("life_area_notifications", {
      id: serial("id").primaryKey(),
      userId: integer("user_id").references(() => users.id),
      type: text("type").notNull().$type(),
      title: text("title").notNull(),
      message: text("message").notNull(),
      actionUrl: text("action_url"),
      read: boolean("read").default(false),
      createdAt: text("created_at").default(sql`now()`)
    });
    lifeAreaSocialInteractions = pgTable("life_area_social_interactions", {
      id: serial("id").primaryKey(),
      userId: integer("user_id").references(() => users.id),
      targetUserId: integer("target_user_id").references(() => users.id),
      interactionType: text("interaction_type").notNull().$type(),
      targetType: text("target_type").notNull().$type(),
      targetId: integer("target_id").notNull(),
      content: text("content"),
      // Para comentarios
      createdAt: text("created_at").default(sql`now()`)
    });
    usersRelations = relations(users, ({ many, one }) => ({
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
      // Mandato Vivo relations
      resources: many(userResources),
      mandateSuggestions: many(mandateSuggestions)
    }));
    userResourcesRelations = relations(userResources, ({ one }) => ({
      user: one(users, {
        fields: [userResources.userId],
        references: [users.id]
      })
    }));
    territoryMandatesRelations = relations(territoryMandates, ({ many }) => ({
      suggestions: many(mandateSuggestions)
    }));
    mandateSuggestionsRelations = relations(mandateSuggestions, ({ one }) => ({
      mandate: one(territoryMandates, {
        fields: [mandateSuggestions.mandateId],
        references: [territoryMandates.id]
      }),
      activator: one(users, {
        fields: [mandateSuggestions.activatedBy],
        references: [users.id]
      })
    }));
    dreamsRelations = relations(dreams, ({ one }) => ({
      user: one(users, {
        fields: [dreams.userId],
        references: [users.id]
      })
    }));
    communityPostsRelations = relations(communityPosts, ({ one, many }) => ({
      user: one(users, {
        fields: [communityPosts.userId],
        references: [users.id]
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
      evidence: many(missionEvidence),
      chronicles: many(missionChronicles)
    }));
    communityPostInteractionsRelations = relations(communityPostInteractions, ({ one }) => ({
      post: one(communityPosts, {
        fields: [communityPostInteractions.postId],
        references: [communityPosts.id]
      }),
      user: one(users, {
        fields: [communityPostInteractions.userId],
        references: [users.id]
      })
    }));
    communityMessagesRelations = relations(communityMessages, ({ one }) => ({
      sender: one(users, {
        fields: [communityMessages.senderId],
        references: [users.id]
      }),
      receiver: one(users, {
        fields: [communityMessages.receiverId],
        references: [users.id]
      }),
      post: one(communityPosts, {
        fields: [communityMessages.postId],
        references: [communityPosts.id]
      })
    }));
    communityPostActivityRelations = relations(communityPostActivity, ({ one }) => ({
      post: one(communityPosts, {
        fields: [communityPostActivity.postId],
        references: [communityPosts.id]
      }),
      user: one(users, {
        fields: [communityPostActivity.userId],
        references: [users.id]
      })
    }));
    userProfilesRelations = relations(userProfiles, ({ one }) => ({
      user: one(users, {
        fields: [userProfiles.userId],
        references: [users.id]
      })
    }));
    recommendationsRelations = relations(recommendations, ({ one }) => ({
      user: one(users, {
        fields: [recommendations.userId],
        references: [users.id]
      })
    }));
    vrMeetingsRelations = relations(vrMeetings, ({ one, many }) => ({
      organizer: one(users, {
        fields: [vrMeetings.organizerId],
        references: [users.id]
      }),
      participants: many(meetingParticipants)
    }));
    meetingParticipantsRelations = relations(meetingParticipants, ({ one }) => ({
      meeting: one(vrMeetings, {
        fields: [meetingParticipants.meetingId],
        references: [vrMeetings.id]
      }),
      user: one(users, {
        fields: [meetingParticipants.userId],
        references: [users.id]
      })
    }));
    userLevelsRelations = relations(userLevels, ({ one }) => ({
      user: one(users, {
        fields: [userLevels.userId],
        references: [users.id]
      })
    }));
    challengesRelations = relations(challenges, ({ many }) => ({
      steps: many(challengeSteps),
      userProgress: many(userChallengeProgress)
    }));
    challengeStepsRelations = relations(challengeSteps, ({ one }) => ({
      challenge: one(challenges, {
        fields: [challengeSteps.challengeId],
        references: [challenges.id]
      })
    }));
    userChallengeProgressRelations = relations(userChallengeProgress, ({ one }) => ({
      user: one(users, {
        fields: [userChallengeProgress.userId],
        references: [users.id]
      }),
      challenge: one(challenges, {
        fields: [userChallengeProgress.challengeId],
        references: [challenges.id]
      })
    }));
    badgesRelations = relations(badges, ({ many }) => ({
      userBadges: many(userBadges)
    }));
    userBadgesRelations = relations(userBadges, ({ one }) => ({
      user: one(users, {
        fields: [userBadges.userId],
        references: [users.id]
      }),
      badge: one(badges, {
        fields: [userBadges.badgeId],
        references: [badges.id]
      })
    }));
    userDailyActivityRelations = relations(userDailyActivity, ({ one }) => ({
      user: one(users, {
        fields: [userDailyActivity.userId],
        references: [users.id]
      })
    }));
    userCommitmentsRelations = relations(userCommitments, ({ one }) => ({
      user: one(users, {
        fields: [userCommitments.userId],
        references: [users.id]
      })
    }));
    userActionsRelations = relations(userActions, ({ one }) => ({
      user: one(users, {
        fields: [userActions.userId],
        references: [users.id]
      })
    }));
    userProgressRelations = relations(userProgress, ({ one }) => ({
      user: one(users, {
        fields: [userProgress.userId],
        references: [users.id]
      })
    }));
    weeklyRankingsRelations = relations(weeklyRankings, ({ one }) => ({
      user: one(users, {
        fields: [weeklyRankings.userId],
        references: [users.id]
      })
    }));
    monthlyRankingsRelations = relations(monthlyRankings, ({ one }) => ({
      user: one(users, {
        fields: [monthlyRankings.userId],
        references: [users.id]
      })
    }));
    provinceRankingsRelations = relations(provinceRankings, ({ one }) => ({
      user: one(users, {
        fields: [provinceRankings.userId],
        references: [users.id]
      })
    }));
    blogPostsRelations = relations(blogPosts, ({ one, many }) => ({
      author: one(users, {
        fields: [blogPosts.authorId],
        references: [users.id]
      }),
      tags: many(postTags),
      likes: many(postLikes),
      comments: many(postComments),
      bookmarks: many(postBookmarks),
      views: many(postViews)
    }));
    postTagsRelations = relations(postTags, ({ one }) => ({
      post: one(blogPosts, {
        fields: [postTags.postId],
        references: [blogPosts.id]
      })
    }));
    postLikesRelations = relations(postLikes, ({ one }) => ({
      post: one(blogPosts, {
        fields: [postLikes.postId],
        references: [blogPosts.id]
      }),
      user: one(users, {
        fields: [postLikes.userId],
        references: [users.id]
      })
    }));
    postCommentsRelations = relations(postComments, ({ one, many }) => ({
      post: one(blogPosts, {
        fields: [postComments.postId],
        references: [blogPosts.id]
      }),
      user: one(users, {
        fields: [postComments.userId],
        references: [users.id]
      }),
      parent: one(postComments, {
        fields: [postComments.parentId],
        references: [postComments.id]
      }),
      replies: many(postComments)
    }));
    postBookmarksRelations = relations(postBookmarks, ({ one }) => ({
      post: one(blogPosts, {
        fields: [postBookmarks.postId],
        references: [blogPosts.id]
      }),
      user: one(users, {
        fields: [postBookmarks.userId],
        references: [users.id]
      })
    }));
    postViewsRelations = relations(postViews, ({ one }) => ({
      post: one(blogPosts, {
        fields: [postViews.postId],
        references: [blogPosts.id]
      }),
      user: one(users, {
        fields: [postViews.userId],
        references: [users.id]
      })
    }));
    coursesRelations = relations(courses, ({ one, many }) => ({
      author: one(users, {
        fields: [courses.authorId],
        references: [users.id]
      }),
      lessons: many(courseLessons),
      quiz: one(courseQuizzes),
      userProgress: many(userCourseProgress),
      certificates: many(courseCertificates)
    }));
    courseLessonsRelations = relations(courseLessons, ({ one, many }) => ({
      course: one(courses, {
        fields: [courseLessons.courseId],
        references: [courses.id]
      }),
      userProgress: many(userLessonProgress)
    }));
    courseQuizzesRelations = relations(courseQuizzes, ({ one, many }) => ({
      course: one(courses, {
        fields: [courseQuizzes.courseId],
        references: [courses.id]
      }),
      questions: many(quizQuestions),
      attempts: many(quizAttempts)
    }));
    quizQuestionsRelations = relations(quizQuestions, ({ one, many }) => ({
      quiz: one(courseQuizzes, {
        fields: [quizQuestions.quizId],
        references: [courseQuizzes.id]
      }),
      attemptAnswers: many(quizAttemptAnswers)
    }));
    courseDefinitionsRelations = relations(courseDefinitions, ({ one, many }) => ({
      legacyCourse: one(courses, {
        fields: [courseDefinitions.legacyCourseId],
        references: [courses.id]
      }),
      currentPublishedRevision: one(courseRevisions, {
        fields: [courseDefinitions.currentPublishedRevisionId],
        references: [courseRevisions.id]
      }),
      revisions: many(courseRevisions),
      lessonIdentities: many(courseLessonIdentities)
    }));
    courseRevisionsRelations = relations(courseRevisions, ({ one, many }) => ({
      courseDefinition: one(courseDefinitions, {
        fields: [courseRevisions.courseDefinitionId],
        references: [courseDefinitions.id]
      }),
      author: one(users, {
        fields: [courseRevisions.authorId],
        references: [users.id]
      }),
      legacyCourse: one(courses, {
        fields: [courseRevisions.legacyCourseId],
        references: [courses.id]
      }),
      lessons: many(courseRevisionLessons),
      quiz: one(courseRevisionQuizzes)
    }));
    courseLessonIdentitiesRelations = relations(courseLessonIdentities, ({ one, many }) => ({
      courseDefinition: one(courseDefinitions, {
        fields: [courseLessonIdentities.courseDefinitionId],
        references: [courseDefinitions.id]
      }),
      legacyLesson: one(courseLessons, {
        fields: [courseLessonIdentities.legacyLessonId],
        references: [courseLessons.id]
      }),
      revisions: many(courseRevisionLessons)
    }));
    courseRevisionLessonsRelations = relations(courseRevisionLessons, ({ one }) => ({
      courseRevision: one(courseRevisions, {
        fields: [courseRevisionLessons.courseRevisionId],
        references: [courseRevisions.id]
      }),
      lessonIdentity: one(courseLessonIdentities, {
        fields: [courseRevisionLessons.lessonIdentityId],
        references: [courseLessonIdentities.id]
      }),
      legacyLesson: one(courseLessons, {
        fields: [courseRevisionLessons.legacyLessonId],
        references: [courseLessons.id]
      })
    }));
    courseRevisionQuizzesRelations = relations(courseRevisionQuizzes, ({ one, many }) => ({
      courseRevision: one(courseRevisions, {
        fields: [courseRevisionQuizzes.courseRevisionId],
        references: [courseRevisions.id]
      }),
      legacyQuiz: one(courseQuizzes, {
        fields: [courseRevisionQuizzes.legacyQuizId],
        references: [courseQuizzes.id]
      }),
      questions: many(courseRevisionQuizQuestions)
    }));
    courseRevisionQuizQuestionsRelations = relations(courseRevisionQuizQuestions, ({ one }) => ({
      quizRevision: one(courseRevisionQuizzes, {
        fields: [courseRevisionQuizQuestions.quizRevisionId],
        references: [courseRevisionQuizzes.id]
      }),
      legacyQuestion: one(quizQuestions, {
        fields: [courseRevisionQuizQuestions.legacyQuestionId],
        references: [quizQuestions.id]
      })
    }));
    userCourseProgressRelations = relations(userCourseProgress, ({ one }) => ({
      user: one(users, {
        fields: [userCourseProgress.userId],
        references: [users.id]
      }),
      course: one(courses, {
        fields: [userCourseProgress.courseId],
        references: [courses.id]
      }),
      currentLesson: one(courseLessons, {
        fields: [userCourseProgress.currentLessonId],
        references: [courseLessons.id]
      }),
      courseDefinition: one(courseDefinitions, {
        fields: [userCourseProgress.courseDefinitionId],
        references: [courseDefinitions.id]
      }),
      currentLessonIdentity: one(courseLessonIdentities, {
        fields: [userCourseProgress.currentLessonIdentityId],
        references: [courseLessonIdentities.id]
      })
    }));
    userLessonProgressRelations = relations(userLessonProgress, ({ one }) => ({
      user: one(users, {
        fields: [userLessonProgress.userId],
        references: [users.id]
      }),
      lesson: one(courseLessons, {
        fields: [userLessonProgress.lessonId],
        references: [courseLessons.id]
      }),
      lessonIdentity: one(courseLessonIdentities, {
        fields: [userLessonProgress.lessonIdentityId],
        references: [courseLessonIdentities.id]
      })
    }));
    quizAttemptsRelations = relations(quizAttempts, ({ one, many }) => ({
      user: one(users, {
        fields: [quizAttempts.userId],
        references: [users.id]
      }),
      quiz: one(courseQuizzes, {
        fields: [quizAttempts.quizId],
        references: [courseQuizzes.id]
      }),
      course: one(courses, {
        fields: [quizAttempts.courseId],
        references: [courses.id]
      }),
      courseDefinition: one(courseDefinitions, {
        fields: [quizAttempts.courseDefinitionId],
        references: [courseDefinitions.id]
      }),
      courseRevision: one(courseRevisions, {
        fields: [quizAttempts.courseRevisionId],
        references: [courseRevisions.id]
      }),
      quizRevision: one(courseRevisionQuizzes, {
        fields: [quizAttempts.courseQuizRevisionId],
        references: [courseRevisionQuizzes.id]
      }),
      answers: many(quizAttemptAnswers)
    }));
    quizAttemptAnswersRelations = relations(quizAttemptAnswers, ({ one }) => ({
      attempt: one(quizAttempts, {
        fields: [quizAttemptAnswers.attemptId],
        references: [quizAttempts.id]
      }),
      question: one(quizQuestions, {
        fields: [quizAttemptAnswers.questionId],
        references: [quizQuestions.id]
      })
    }));
    courseCertificatesRelations = relations(courseCertificates, ({ one }) => ({
      user: one(users, {
        fields: [courseCertificates.userId],
        references: [users.id]
      }),
      course: one(courses, {
        fields: [courseCertificates.courseId],
        references: [courses.id]
      }),
      courseDefinition: one(courseDefinitions, {
        fields: [courseCertificates.courseDefinitionId],
        references: [courseDefinitions.id]
      }),
      courseRevision: one(courseRevisions, {
        fields: [courseCertificates.courseRevisionId],
        references: [courseRevisions.id]
      })
    }));
    iotSensorsRelations = relations(iotSensors, ({ many }) => ({
      data: many(sensorData)
    }));
    sensorDataRelations = relations(sensorData, ({ one }) => ({
      sensor: one(iotSensors, {
        fields: [sensorData.sensorId],
        references: [iotSensors.id]
      })
    }));
    inspiringStoriesRelations = relations(inspiringStories, ({ one }) => ({
      author: one(users, {
        fields: [inspiringStories.authorId],
        references: [users.id]
      }),
      moderator: one(users, {
        fields: [inspiringStories.moderatedBy],
        references: [users.id]
      }),
      relatedPost: one(communityPosts, {
        fields: [inspiringStories.relatedPostId],
        references: [communityPosts.id]
      })
    }));
    initiativeMembersRelations = relations(initiativeMembers, ({ one }) => ({
      post: one(communityPosts, {
        fields: [initiativeMembers.postId],
        references: [communityPosts.id]
      }),
      user: one(users, {
        fields: [initiativeMembers.userId],
        references: [users.id]
      })
    }));
    initiativeMilestonesRelations = relations(initiativeMilestones, ({ one, many }) => ({
      post: one(communityPosts, {
        fields: [initiativeMilestones.postId],
        references: [communityPosts.id]
      }),
      completedBy: one(users, {
        fields: [initiativeMilestones.completedBy],
        references: [users.id]
      }),
      tasks: many(initiativeTasks)
    }));
    initiativeMessagesRelations = relations(initiativeMessages, ({ one }) => ({
      post: one(communityPosts, {
        fields: [initiativeMessages.postId],
        references: [communityPosts.id]
      }),
      user: one(users, {
        fields: [initiativeMessages.userId],
        references: [users.id]
      })
    }));
    initiativeTasksRelations = relations(initiativeTasks, ({ one }) => ({
      post: one(communityPosts, {
        fields: [initiativeTasks.postId],
        references: [communityPosts.id]
      }),
      milestone: one(initiativeMilestones, {
        fields: [initiativeTasks.milestoneId],
        references: [initiativeMilestones.id]
      }),
      assignedTo: one(users, {
        fields: [initiativeTasks.assignedTo],
        references: [users.id]
      }),
      createdBy: one(users, {
        fields: [initiativeTasks.createdBy],
        references: [users.id]
      })
    }));
    activityFeedRelations = relations(activityFeed, ({ one }) => ({
      post: one(communityPosts, {
        fields: [activityFeed.postId],
        references: [communityPosts.id]
      }),
      user: one(users, {
        fields: [activityFeed.userId],
        references: [users.id]
      })
    }));
    missionEvidenceRelations = relations(missionEvidence, ({ one }) => ({
      post: one(communityPosts, {
        fields: [missionEvidence.postId],
        references: [communityPosts.id]
      }),
      milestone: one(initiativeMilestones, {
        fields: [missionEvidence.milestoneId],
        references: [initiativeMilestones.id]
      }),
      user: one(users, {
        fields: [missionEvidence.userId],
        references: [users.id]
      }),
      verifier: one(users, {
        fields: [missionEvidence.verifiedBy],
        references: [users.id]
      })
    }));
    missionChroniclesRelations = relations(missionChronicles, ({ one }) => ({
      post: one(communityPosts, {
        fields: [missionChronicles.postId],
        references: [communityPosts.id]
      }),
      user: one(users, {
        fields: [missionChronicles.userId],
        references: [users.id]
      })
    }));
    membershipRequestsRelations = relations(membershipRequests, ({ one }) => ({
      post: one(communityPosts, {
        fields: [membershipRequests.postId],
        references: [communityPosts.id]
      }),
      user: one(users, {
        fields: [membershipRequests.userId],
        references: [users.id]
      }),
      reviewedBy: one(users, {
        fields: [membershipRequests.reviewedBy],
        references: [users.id]
      })
    }));
    notificationsRelations = relations(notifications, ({ one }) => ({
      user: one(users, {
        fields: [notifications.userId],
        references: [users.id]
      }),
      post: one(communityPosts, {
        fields: [notifications.postId],
        references: [communityPosts.id]
      })
    }));
    lifeAreasRelations = relations(lifeAreas, ({ many }) => ({
      subcategories: many(lifeAreaSubcategories),
      quizzes: many(lifeAreaQuizzes),
      scores: many(lifeAreaScores),
      actions: many(lifeAreaActions),
      milestones: many(lifeAreaMilestones),
      indicators: many(lifeAreaIndicators),
      communityStats: many(lifeAreaCommunityStats),
      xpLog: many(lifeAreaXpLog),
      levels: many(lifeAreaLevels),
      mastery: many(lifeAreaMastery)
    }));
    lifeAreaSubcategoriesRelations = relations(lifeAreaSubcategories, ({ one, many }) => ({
      lifeArea: one(lifeAreas, {
        fields: [lifeAreaSubcategories.lifeAreaId],
        references: [lifeAreas.id]
      }),
      questions: many(lifeAreaQuizQuestions),
      scores: many(lifeAreaScores),
      actions: many(lifeAreaActions)
    }));
    lifeAreaQuizzesRelations = relations(lifeAreaQuizzes, ({ one, many }) => ({
      lifeArea: one(lifeAreas, {
        fields: [lifeAreaQuizzes.lifeAreaId],
        references: [lifeAreas.id]
      }),
      questions: many(lifeAreaQuizQuestions),
      responses: many(lifeAreaQuizResponses)
    }));
    lifeAreaQuizQuestionsRelations = relations(lifeAreaQuizQuestions, ({ one, many }) => ({
      quiz: one(lifeAreaQuizzes, {
        fields: [lifeAreaQuizQuestions.quizId],
        references: [lifeAreaQuizzes.id]
      }),
      subcategory: one(lifeAreaSubcategories, {
        fields: [lifeAreaQuizQuestions.subcategoryId],
        references: [lifeAreaSubcategories.id]
      }),
      responses: many(lifeAreaQuizResponses)
    }));
    lifeAreaQuizResponsesRelations = relations(lifeAreaQuizResponses, ({ one }) => ({
      user: one(users, {
        fields: [lifeAreaQuizResponses.userId],
        references: [users.id]
      }),
      quiz: one(lifeAreaQuizzes, {
        fields: [lifeAreaQuizResponses.quizId],
        references: [lifeAreaQuizzes.id]
      }),
      question: one(lifeAreaQuizQuestions, {
        fields: [lifeAreaQuizResponses.questionId],
        references: [lifeAreaQuizQuestions.id]
      })
    }));
    lifeAreaScoresRelations = relations(lifeAreaScores, ({ one }) => ({
      user: one(users, {
        fields: [lifeAreaScores.userId],
        references: [users.id]
      }),
      lifeArea: one(lifeAreas, {
        fields: [lifeAreaScores.lifeAreaId],
        references: [lifeAreas.id]
      }),
      subcategory: one(lifeAreaSubcategories, {
        fields: [lifeAreaScores.subcategoryId],
        references: [lifeAreaSubcategories.id]
      })
    }));
    lifeAreaActionsRelations = relations(lifeAreaActions, ({ one, many }) => ({
      lifeArea: one(lifeAreas, {
        fields: [lifeAreaActions.lifeAreaId],
        references: [lifeAreas.id]
      }),
      subcategory: one(lifeAreaSubcategories, {
        fields: [lifeAreaActions.subcategoryId],
        references: [lifeAreaSubcategories.id]
      }),
      userProgress: many(userLifeAreaProgress)
    }));
    userLifeAreaProgressRelations = relations(userLifeAreaProgress, ({ one }) => ({
      user: one(users, {
        fields: [userLifeAreaProgress.userId],
        references: [users.id]
      }),
      action: one(lifeAreaActions, {
        fields: [userLifeAreaProgress.actionId],
        references: [lifeAreaActions.id]
      })
    }));
    lifeAreaMilestonesRelations = relations(lifeAreaMilestones, ({ one, many }) => ({
      user: one(users, {
        fields: [lifeAreaMilestones.userId],
        references: [users.id]
      }),
      lifeArea: one(lifeAreas, {
        fields: [lifeAreaMilestones.lifeAreaId],
        references: [lifeAreas.id]
      }),
      socialInteractions: many(lifeAreaSocialInteractions)
    }));
    lifeAreaIndicatorsRelations = relations(lifeAreaIndicators, ({ one }) => ({
      user: one(users, {
        fields: [lifeAreaIndicators.userId],
        references: [users.id]
      }),
      lifeArea: one(lifeAreas, {
        fields: [lifeAreaIndicators.lifeAreaId],
        references: [lifeAreas.id]
      })
    }));
    lifeAreaCommunityStatsRelations = relations(lifeAreaCommunityStats, ({ one }) => ({
      lifeArea: one(lifeAreas, {
        fields: [lifeAreaCommunityStats.lifeAreaId],
        references: [lifeAreas.id]
      })
    }));
    lifeAreaXpLogRelations = relations(lifeAreaXpLog, ({ one }) => ({
      user: one(users, {
        fields: [lifeAreaXpLog.userId],
        references: [users.id]
      }),
      lifeArea: one(lifeAreas, {
        fields: [lifeAreaXpLog.lifeAreaId],
        references: [lifeAreas.id]
      })
    }));
    lifeAreaLevelsRelations = relations(lifeAreaLevels, ({ one }) => ({
      user: one(users, {
        fields: [lifeAreaLevels.userId],
        references: [users.id]
      }),
      lifeArea: one(lifeAreas, {
        fields: [lifeAreaLevels.lifeAreaId],
        references: [lifeAreas.id]
      })
    }));
    lifeAreaStreaksRelations = relations(lifeAreaStreaks, ({ one }) => ({
      user: one(users, {
        fields: [lifeAreaStreaks.userId],
        references: [users.id]
      })
    }));
    lifeAreaBadgesRelations = relations(lifeAreaBadges, ({ many }) => ({
      userBadges: many(userLifeAreaBadges)
    }));
    userLifeAreaBadgesRelations = relations(userLifeAreaBadges, ({ one }) => ({
      user: one(users, {
        fields: [userLifeAreaBadges.userId],
        references: [users.id]
      }),
      badge: one(lifeAreaBadges, {
        fields: [userLifeAreaBadges.badgeId],
        references: [lifeAreaBadges.id]
      })
    }));
    lifeAreaCurrencyRelations = relations(lifeAreaCurrency, ({ one }) => ({
      user: one(users, {
        fields: [lifeAreaCurrency.userId],
        references: [users.id]
      })
    }));
    lifeAreaRewardChestsRelations = relations(lifeAreaRewardChests, ({ one }) => ({
      user: one(users, {
        fields: [lifeAreaRewardChests.userId],
        references: [users.id]
      })
    }));
    lifeAreaChallengesRelations = relations(lifeAreaChallenges, ({ many }) => ({
      userChallenges: many(userLifeAreaChallenges)
    }));
    userLifeAreaChallengesRelations = relations(userLifeAreaChallenges, ({ one }) => ({
      user: one(users, {
        fields: [userLifeAreaChallenges.userId],
        references: [users.id]
      }),
      challenge: one(lifeAreaChallenges, {
        fields: [userLifeAreaChallenges.challengeId],
        references: [lifeAreaChallenges.id]
      })
    }));
    lifeAreaMasteryRelations = relations(lifeAreaMastery, ({ one }) => ({
      user: one(users, {
        fields: [lifeAreaMastery.userId],
        references: [users.id]
      }),
      lifeArea: one(lifeAreas, {
        fields: [lifeAreaMastery.lifeAreaId],
        references: [lifeAreas.id]
      })
    }));
    lifeAreaNotificationsRelations = relations(lifeAreaNotifications, ({ one }) => ({
      user: one(users, {
        fields: [lifeAreaNotifications.userId],
        references: [users.id]
      })
    }));
    lifeAreaSocialInteractionsRelations = relations(lifeAreaSocialInteractions, ({ one }) => ({
      user: one(users, {
        fields: [lifeAreaSocialInteractions.userId],
        references: [users.id]
      }),
      targetUser: one(users, {
        fields: [lifeAreaSocialInteractions.targetUserId],
        references: [users.id]
      })
    }));
    civicAssessments = pgTable("civic_assessments", {
      id: serial("id").primaryKey(),
      userId: integer("user_id").references(() => users.id),
      status: text("status").notNull().default("in_progress").$type(),
      version: integer("version").default(1),
      startedAt: text("started_at").default(sql`now()`),
      completedAt: text("completed_at"),
      createdAt: text("created_at").default(sql`now()`)
    });
    civicAssessmentResponses = pgTable("civic_assessment_responses", {
      id: serial("id").primaryKey(),
      assessmentId: integer("assessment_id").references(() => civicAssessments.id),
      questionKey: text("question_key").notNull(),
      dimensionKey: text("dimension_key").notNull(),
      responseType: text("response_type").notNull().$type(),
      responseValue: integer("response_value"),
      // For scale questions (1-10)
      responseChoice: text("response_choice"),
      // For choice questions
      responseRank: text("response_rank"),
      // JSON array for rank questions
      createdAt: text("created_at").default(sql`now()`)
    });
    civicProfiles = pgTable("civic_profiles", {
      id: serial("id").primaryKey(),
      userId: integer("user_id").references(() => users.id),
      assessmentId: integer("assessment_id").references(() => civicAssessments.id),
      archetype: text("archetype").notNull(),
      // e.g. 'el_puente', 'el_catalizador'
      dimensionScores: text("dimension_scores").notNull(),
      // JSON: { motivacion_civica: 75, ... }
      topStrengths: text("top_strengths").notNull(),
      // JSON array of dimension keys
      growthAreas: text("growth_areas").notNull(),
      // JSON array of dimension keys
      recommendedActions: text("recommended_actions").notNull(),
      // JSON array of action objects
      createdAt: text("created_at").default(sql`now()`),
      updatedAt: text("updated_at").default(sql`now()`)
    });
    civicGoals = pgTable("civic_goals", {
      id: serial("id").primaryKey(),
      userId: integer("user_id").references(() => users.id),
      title: text("title").notNull(),
      description: text("description"),
      category: text("category").notNull().$type(),
      targetDate: text("target_date"),
      status: text("status").notNull().default("active").$type(),
      progress: integer("progress").default(0),
      // 0-100
      milestones: text("milestones"),
      // JSON array of { title, done, doneAt }
      linkedLifeAreaId: integer("linked_life_area_id").references(() => lifeAreas.id),
      linkedChallengeId: integer("linked_challenge_id").references(() => challenges.id),
      createdAt: text("created_at").default(sql`now()`),
      updatedAt: text("updated_at").default(sql`now()`)
    });
    weeklyCheckins = pgTable("weekly_checkins", {
      id: serial("id").primaryKey(),
      userId: integer("user_id").references(() => users.id),
      weekOf: text("week_of").notNull(),
      // ISO date string of week start (Monday)
      mood: integer("mood").notNull(),
      // 1-5
      progressRating: integer("progress_rating").notNull(),
      // 1-5
      highlight: text("highlight"),
      challenge: text("challenge"),
      nextWeekIntention: text("next_week_intention"),
      goalsReviewed: text("goals_reviewed"),
      // JSON array of { goalId, status }
      createdAt: text("created_at").default(sql`now()`)
    });
    coachingSessions = pgTable("coaching_sessions", {
      id: serial("id").primaryKey(),
      userId: integer("user_id").references(() => users.id),
      sessionType: text("session_type").notNull().$type(),
      status: text("status").notNull().default("active").$type(),
      messages: text("messages").notNull().default("[]"),
      // JSON array of { role, content, timestamp }
      insights: text("insights"),
      // JSON array of extracted insights
      suggestedActions: text("suggested_actions"),
      // JSON array of action items
      createdAt: text("created_at").default(sql`now()`),
      updatedAt: text("updated_at").default(sql`now()`)
    });
    coachingPrompts = pgTable("coaching_prompts", {
      id: serial("id").primaryKey(),
      userId: integer("user_id").references(() => users.id),
      promptType: text("prompt_type").notNull().$type(),
      title: text("title").notNull(),
      content: text("content").notNull(),
      context: text("context"),
      // JSON with archetype, dimension, etc.
      isRead: boolean("is_read").default(false),
      scheduledFor: text("scheduled_for"),
      createdAt: text("created_at").default(sql`now()`)
    });
    platformFeedback = pgTable("platform_feedback", {
      id: serial("id").primaryKey(),
      type: text("type").notNull(),
      // 'critica' | 'sugerencia' | 'bug' | 'otro'
      content: text("content").notNull(),
      email: text("email"),
      userId: integer("user_id").references(() => users.id),
      status: text("status").notNull().default("nueva"),
      // 'nueva' | 'revisada' | 'resuelta'
      adminNotes: text("admin_notes"),
      createdAt: text("created_at").default(sql`now()`)
    });
    insertUserSchema = createInsertSchema(users).omit({
      id: true,
      createdAt: true
    });
    insertDreamSchema = createInsertSchema(dreams).omit({
      id: true,
      createdAt: true
    });
    insertCommunityPostSchema = createInsertSchema(communityPosts).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertResourceSchema = createInsertSchema(resources).omit({
      id: true,
      createdAt: true
    });
    insertInspiringStorySchema = createInsertSchema(inspiringStories).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertSentimentAnalysisSchema = createInsertSchema(sentimentAnalysis).omit({
      id: true,
      analyzedAt: true
    });
    insertTextEmbeddingSchema = createInsertSchema(textEmbeddings).omit({
      id: true,
      createdAt: true
    });
    insertUserProfileSchema = createInsertSchema(userProfiles).omit({
      id: true,
      lastAnalyzed: true
    });
    insertRecommendationSchema = createInsertSchema(recommendations).omit({
      id: true,
      createdAt: true
    });
    insertAiInsightSchema = createInsertSchema(aiInsights).omit({
      id: true,
      createdAt: true
    });
    insertBlockchainTransactionSchema = createInsertSchema(blockchainTransactions).omit({
      id: true,
      createdAt: true,
      confirmedAt: true
    });
    insertIotSensorSchema = createInsertSchema(iotSensors).omit({
      id: true,
      installationDate: true,
      lastReading: true
    });
    insertSensorDataSchema = createInsertSchema(sensorData).omit({
      id: true,
      timestamp: true
    });
    insertVrMeetingSchema = createInsertSchema(vrMeetings).omit({
      id: true,
      createdAt: true
    });
    insertMeetingParticipantSchema = createInsertSchema(meetingParticipants).omit({
      id: true
    });
    insertUserResourceSchema = createInsertSchema(userResources).omit({
      id: true,
      createdAt: true
    });
    insertTerritoryMandateSchema = createInsertSchema(territoryMandates).omit({
      id: true,
      createdAt: true
    });
    insertMandateSuggestionSchema = createInsertSchema(mandateSuggestions).omit({
      id: true,
      createdAt: true
    });
    insertUserLevelSchema = createInsertSchema(userLevels).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertChallengeSchema = createInsertSchema(challenges).omit({
      id: true,
      createdAt: true
    });
    insertChallengeStepSchema = createInsertSchema(challengeSteps).omit({
      id: true,
      createdAt: true
    });
    insertUserChallengeProgressSchema = createInsertSchema(userChallengeProgress).omit({
      id: true,
      createdAt: true
    });
    insertBadgeSchema = createInsertSchema(badges).omit({
      id: true,
      createdAt: true
    });
    insertUserBadgeSchema = createInsertSchema(userBadges).omit({
      id: true,
      earnedAt: true
    });
    insertUserDailyActivitySchema = createInsertSchema(userDailyActivity).omit({
      id: true,
      createdAt: true
    });
    insertUserCommitmentSchema = createInsertSchema(userCommitments).omit({
      id: true,
      createdAt: true
    });
    insertUserActionSchema = createInsertSchema(userActions).omit({
      id: true,
      createdAt: true
    });
    insertUserProgressSchema = createInsertSchema(userProgress).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertWeeklyRankingSchema = createInsertSchema(weeklyRankings).omit({
      id: true,
      createdAt: true
    });
    insertMonthlyRankingSchema = createInsertSchema(monthlyRankings).omit({
      id: true,
      createdAt: true
    });
    insertProvinceRankingSchema = createInsertSchema(provinceRankings).omit({
      id: true,
      updatedAt: true
    });
    insertBlogPostSchema = createInsertSchema(blogPosts).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertPostTagSchema = createInsertSchema(postTags).omit({
      id: true
    });
    insertPostLikeSchema = createInsertSchema(postLikes).omit({
      id: true,
      createdAt: true
    });
    insertPostCommentSchema = createInsertSchema(postComments).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertPostBookmarkSchema = createInsertSchema(postBookmarks).omit({
      id: true,
      createdAt: true
    });
    insertPostViewSchema = createInsertSchema(postViews).omit({
      id: true,
      viewedAt: true
    });
    insertCourseSchema = createInsertSchema(courses).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertCourseLessonSchema = createInsertSchema(courseLessons).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertCourseQuizSchema = createInsertSchema(courseQuizzes).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertQuizQuestionSchema = createInsertSchema(quizQuestions).omit({
      id: true,
      createdAt: true
    });
    insertCourseDefinitionSchema = createInsertSchema(courseDefinitions).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertCourseRevisionSchema = createInsertSchema(courseRevisions).omit({
      id: true,
      createdAt: true
    });
    insertCourseLessonIdentitySchema = createInsertSchema(courseLessonIdentities).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertCourseRevisionLessonSchema = createInsertSchema(courseRevisionLessons).omit({
      id: true,
      createdAt: true
    });
    insertCourseRevisionQuizSchema = createInsertSchema(courseRevisionQuizzes).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertCourseRevisionQuizQuestionSchema = createInsertSchema(courseRevisionQuizQuestions).omit({
      id: true,
      createdAt: true
    });
    insertUserCourseProgressSchema = createInsertSchema(userCourseProgress).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertUserLessonProgressSchema = createInsertSchema(userLessonProgress).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertQuizAttemptSchema = createInsertSchema(quizAttempts).omit({
      id: true,
      startedAt: true
    });
    insertQuizAttemptAnswerSchema = createInsertSchema(quizAttemptAnswers).omit({
      id: true,
      createdAt: true
    });
    insertCourseCertificateSchema = createInsertSchema(courseCertificates).omit({
      id: true,
      issuedAt: true
    });
    insertCommunityPostInteractionSchema = createInsertSchema(communityPostInteractions).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertCommunityMessageSchema = createInsertSchema(communityMessages).omit({
      id: true,
      createdAt: true
    });
    insertCommunityPostActivitySchema = createInsertSchema(communityPostActivity).omit({
      id: true,
      createdAt: true
    });
    insertInitiativeMemberSchema = createInsertSchema(initiativeMembers).omit({
      id: true,
      joinedAt: true
    });
    insertInitiativeMilestoneSchema = createInsertSchema(initiativeMilestones).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertInitiativeMessageSchema = createInsertSchema(initiativeMessages).omit({
      id: true,
      createdAt: true
    });
    insertInitiativeTaskSchema = createInsertSchema(initiativeTasks).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertActivityFeedSchema = createInsertSchema(activityFeed).omit({
      id: true,
      createdAt: true
    });
    insertMissionEvidenceSchema = createInsertSchema(missionEvidence).omit({
      id: true,
      createdAt: true
    });
    insertMissionChronicleSchema = createInsertSchema(missionChronicles).omit({
      id: true,
      createdAt: true
    });
    insertMembershipRequestSchema = createInsertSchema(membershipRequests).omit({
      id: true,
      createdAt: true
    });
    insertNotificationSchema = createInsertSchema(notifications).omit({
      id: true,
      createdAt: true
    });
    insertLifeAreaSchema = createInsertSchema(lifeAreas).omit({
      id: true,
      createdAt: true
    });
    insertLifeAreaSubcategorySchema = createInsertSchema(lifeAreaSubcategories).omit({
      id: true,
      createdAt: true
    });
    insertLifeAreaQuizSchema = createInsertSchema(lifeAreaQuizzes).omit({
      id: true,
      createdAt: true
    });
    insertLifeAreaQuizQuestionSchema = createInsertSchema(lifeAreaQuizQuestions).omit({
      id: true,
      createdAt: true
    });
    insertLifeAreaQuizResponseSchema = createInsertSchema(lifeAreaQuizResponses).omit({
      id: true,
      answeredAt: true,
      createdAt: true
    });
    insertLifeAreaScoreSchema = createInsertSchema(lifeAreaScores).omit({
      id: true,
      lastUpdated: true,
      createdAt: true
    });
    insertLifeAreaActionSchema = createInsertSchema(lifeAreaActions).omit({
      id: true,
      createdAt: true
    });
    insertUserLifeAreaProgressSchema = createInsertSchema(userLifeAreaProgress).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertLifeAreaMilestoneSchema = createInsertSchema(lifeAreaMilestones).omit({
      id: true,
      createdAt: true
    });
    insertLifeAreaIndicatorSchema = createInsertSchema(lifeAreaIndicators).omit({
      id: true,
      recordedAt: true
    });
    insertLifeAreaCommunityStatsSchema = createInsertSchema(lifeAreaCommunityStats).omit({
      id: true,
      calculatedAt: true
    });
    insertLifeAreaXpLogSchema = createInsertSchema(lifeAreaXpLog).omit({
      id: true,
      createdAt: true
    });
    insertLifeAreaLevelSchema = createInsertSchema(lifeAreaLevels).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertLifeAreaStreakSchema = createInsertSchema(lifeAreaStreaks).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertLifeAreaBadgeSchema = createInsertSchema(lifeAreaBadges).omit({
      id: true,
      createdAt: true
    });
    insertUserLifeAreaBadgeSchema = createInsertSchema(userLifeAreaBadges).omit({
      id: true,
      earnedAt: true
    });
    insertLifeAreaCurrencySchema = createInsertSchema(lifeAreaCurrency).omit({
      id: true,
      updatedAt: true,
      createdAt: true
    });
    insertLifeAreaRewardChestSchema = createInsertSchema(lifeAreaRewardChests).omit({
      id: true,
      createdAt: true
    });
    insertLifeAreaChallengeSchema = createInsertSchema(lifeAreaChallenges).omit({
      id: true,
      createdAt: true
    });
    insertUserLifeAreaChallengeSchema = createInsertSchema(userLifeAreaChallenges).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertLifeAreaMasterySchema = createInsertSchema(lifeAreaMastery).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertLifeAreaNotificationSchema = createInsertSchema(lifeAreaNotifications).omit({
      id: true,
      createdAt: true
    });
    insertLifeAreaSocialInteractionSchema = createInsertSchema(lifeAreaSocialInteractions).omit({
      id: true,
      createdAt: true
    });
    civicAssessmentsRelations = relations(civicAssessments, ({ one, many }) => ({
      user: one(users, {
        fields: [civicAssessments.userId],
        references: [users.id]
      }),
      responses: many(civicAssessmentResponses),
      profile: one(civicProfiles)
    }));
    civicAssessmentResponsesRelations = relations(civicAssessmentResponses, ({ one }) => ({
      assessment: one(civicAssessments, {
        fields: [civicAssessmentResponses.assessmentId],
        references: [civicAssessments.id]
      })
    }));
    civicProfilesRelations = relations(civicProfiles, ({ one }) => ({
      user: one(users, {
        fields: [civicProfiles.userId],
        references: [users.id]
      }),
      assessment: one(civicAssessments, {
        fields: [civicProfiles.assessmentId],
        references: [civicAssessments.id]
      })
    }));
    civicGoalsRelations = relations(civicGoals, ({ one }) => ({
      user: one(users, {
        fields: [civicGoals.userId],
        references: [users.id]
      }),
      lifeArea: one(lifeAreas, {
        fields: [civicGoals.linkedLifeAreaId],
        references: [lifeAreas.id]
      }),
      challenge: one(challenges, {
        fields: [civicGoals.linkedChallengeId],
        references: [challenges.id]
      })
    }));
    weeklyCheckinsRelations = relations(weeklyCheckins, ({ one }) => ({
      user: one(users, {
        fields: [weeklyCheckins.userId],
        references: [users.id]
      })
    }));
    coachingSessionsRelations = relations(coachingSessions, ({ one }) => ({
      user: one(users, {
        fields: [coachingSessions.userId],
        references: [users.id]
      })
    }));
    coachingPromptsRelations = relations(coachingPrompts, ({ one }) => ({
      user: one(users, {
        fields: [coachingPrompts.userId],
        references: [users.id]
      })
    }));
    insertCivicAssessmentSchema = createInsertSchema(civicAssessments).omit({
      id: true,
      createdAt: true
    });
    insertCivicAssessmentResponseSchema = createInsertSchema(civicAssessmentResponses).omit({
      id: true,
      createdAt: true
    });
    insertCivicProfileSchema = createInsertSchema(civicProfiles).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertCivicGoalSchema = createInsertSchema(civicGoals).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertWeeklyCheckinSchema = createInsertSchema(weeklyCheckins).omit({
      id: true,
      createdAt: true
    });
    insertCoachingSessionSchema = createInsertSchema(coachingSessions).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertCoachingPromptSchema = createInsertSchema(coachingPrompts).omit({
      id: true,
      createdAt: true
    });
    weeklyDigests = pgTable("weekly_digests", {
      id: serial("id").primaryKey(),
      weekNumber: integer("week_number").notNull(),
      year: integer("year").notNull(),
      weekStartDate: text("week_start_date").notNull(),
      weekEndDate: text("week_end_date").notNull(),
      // Thermometer stats
      totalNewVoices: integer("total_new_voices").default(0),
      newDreams: integer("new_dreams").default(0),
      newNeeds: integer("new_needs").default(0),
      newBastas: integer("new_bastas").default(0),
      newValues: integer("new_values").default(0),
      newCommitments: integer("new_commitments").default(0),
      newResources: integer("new_resources").default(0),
      // Cumulative totals at time of digest
      cumulativeVoices: integer("cumulative_voices").default(0),
      cumulativeResources: integer("cumulative_resources").default(0),
      // AI-generated content (JSON)
      emergingThemes: text("emerging_themes"),
      // JSON: [{theme, trend, count, description}]
      patterns: text("patterns"),
      // JSON: [{pattern, territories, description, evidence}]
      unconnectedResources: text("unconnected_resources"),
      // JSON: [{resource, suggestion}]
      seedOfWeek: text("seed_of_week"),
      // JSON: {title, description, inspiration}
      comparisonWithPrevious: text("comparison_with_previous"),
      // JSON: {trends, escalations}
      // Full AI analysis
      fullAnalysis: text("full_analysis"),
      // Complete pulse text from Claude
      // Status
      status: text("status").notNull().default("generating").$type(),
      errorMessage: text("error_message"),
      generatedAt: text("generated_at"),
      createdAt: text("created_at").default(sql`now()`)
    });
    digestProposals = pgTable("digest_proposals", {
      id: serial("id").primaryKey(),
      digestId: integer("digest_id").references(() => weeklyDigests.id).notNull(),
      // Core proposal content
      title: text("title").notNull(),
      summary: text("summary").notNull(),
      fullAnalysis: text("full_analysis"),
      // Detailed AI analysis
      evidence: text("evidence"),
      // JSON: {voiceCount, territories, quotes[], convergence}
      // Targeting
      targetCategory: text("target_category").notNull().$type(),
      targetDescription: text("target_description"),
      // Specific org/entity name
      territory: text("territory"),
      // Geographic scope
      // Classification
      urgency: text("urgency").notNull().$type(),
      precedent: text("precedent"),
      // Similar success case
      suggestedActionType: text("suggested_action_type").notNull().$type(),
      // Action template (pre-generated)
      actionTemplate: text("action_template"),
      // Full generated action text (letter, petition, etc.)
      // Lifecycle
      status: text("status").notNull().default("propuesta").$type(),
      firstAppearedWeek: integer("first_appeared_week"),
      // For tracking recurring proposals
      weeksActive: integer("weeks_active").default(1),
      escalatedAt: text("escalated_at"),
      createdAt: text("created_at").default(sql`now()`),
      updatedAt: text("updated_at").default(sql`now()`)
    });
    proposalStatusHistory = pgTable("proposal_status_history", {
      id: serial("id").primaryKey(),
      proposalId: integer("proposal_id").references(() => digestProposals.id).notNull(),
      fromStatus: text("from_status").notNull(),
      toStatus: text("to_status").notNull(),
      changedBy: integer("changed_by").references(() => users.id),
      notes: text("notes"),
      createdAt: text("created_at").default(sql`now()`)
    });
    insertWeeklyDigestSchema = createInsertSchema(weeklyDigests).omit({
      id: true,
      createdAt: true
    });
    insertDigestProposalSchema = createInsertSchema(digestProposals).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertProposalStatusHistorySchema = createInsertSchema(proposalStatusHistory).omit({
      id: true,
      createdAt: true
    });
    insertPlatformFeedbackSchema = createInsertSchema(platformFeedback).omit({
      id: true,
      createdAt: true,
      status: true,
      adminNotes: true
    });
  }
});

// server/db.ts
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
var databaseUrl, sql2, db;
var init_db = __esm({
  "server/db.ts"() {
    "use strict";
    init_schema();
    databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error("DATABASE_URL is required. Set it to your Neon connection string.");
    }
    console.log("Connecting to Neon Postgres...");
    sql2 = neon(databaseUrl);
    db = drizzle(sql2, { schema: schema_exports });
  }
});

// server/config.ts
import dotenv from "dotenv";
import crypto from "crypto";
function isProductionLikeEnv() {
  const nodeEnv = process.env.NODE_ENV || "development";
  return nodeEnv === "production" || Boolean(process.env.VERCEL);
}
function ensureSecret(envKey) {
  const current = process.env[envKey];
  if (current && current.length >= 32) return;
  const replacement = crypto.randomBytes(32).toString("hex");
  process.env[envKey] = replacement;
  console.warn(
    `[config] ${envKey} missing/weak; generated an ephemeral secret. Set ${envKey} in your environment for stable auth/session behavior.`
  );
}
function validateConfig() {
  const requiredEnvVars = [
    "JWT_SECRET",
    "SESSION_SECRET"
  ];
  const missingVars = requiredEnvVars.filter((varName) => !process.env[varName]);
  if (missingVars.length > 0) {
    if (isProductionLikeEnv()) {
      for (const varName of missingVars) {
        ensureSecret(varName);
      }
    } else {
      throw new Error(`Missing required environment variables: ${missingVars.join(", ")}`);
    }
  }
  if (process.env.JWT_SECRET.length < 32) {
    if (isProductionLikeEnv()) {
      ensureSecret("JWT_SECRET");
    } else {
      throw new Error("JWT_SECRET must be at least 32 characters long");
    }
  }
  const defaultCorsOrigin = isProductionLikeEnv() ? process.env.CORS_ORIGIN || "https://elinstantedelhombregris.com" : "http://localhost:5173";
  return {
    database: {
      url: process.env.DATABASE_URL || "./local.db"
    },
    jwt: {
      secret: process.env.JWT_SECRET,
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
      refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "30d"
    },
    security: {
      bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || "12"),
      rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000"),
      // 15 minutes
      rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || "100"),
      loginRateLimitMax: parseInt(process.env.LOGIN_RATE_LIMIT_MAX || "5"),
      loginRateLimitWindowMs: parseInt(process.env.LOGIN_RATE_LIMIT_WINDOW_MS || "900000")
      // 15 minutes
    },
    cors: {
      origin: process.env.CORS_ORIGIN || defaultCorsOrigin,
      credentials: process.env.CORS_CREDENTIALS !== "false"
      // Default to true unless explicitly set to false
    },
    server: {
      port: parseInt(process.env.PORT || "5000"),
      nodeEnv: process.env.NODE_ENV || "development"
    },
    session: {
      secret: process.env.SESSION_SECRET,
      cookieSecure: process.env.SESSION_COOKIE_SECURE === "true",
      cookieHttpOnly: process.env.SESSION_COOKIE_HTTP_ONLY !== "false",
      cookieMaxAge: parseInt(process.env.SESSION_COOKIE_MAX_AGE || "86400000")
      // 24 hours
    },
    ai: {
      anthropicApiKey: process.env.ANTHROPIC_API_KEY || null,
      model: process.env.AI_MODEL || "claude-sonnet-4-20250514",
      maxTokens: parseInt(process.env.AI_MAX_TOKENS || "512"),
      enabled: !!process.env.ANTHROPIC_API_KEY,
      groqApiKey: process.env.GROQ_API_KEY || null,
      groqModel: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
      groqEnabled: !!process.env.GROQ_API_KEY
    }
  };
}
var config;
var init_config = __esm({
  "server/config.ts"() {
    "use strict";
    dotenv.config();
    config = validateConfig();
  }
});

// server/auth.ts
var auth_exports = {};
__export(auth_exports, {
  AuthError: () => AuthError,
  PasswordManager: () => PasswordManager,
  RateLimiter: () => RateLimiter,
  TokenManager: () => TokenManager,
  authenticateToken: () => authenticateToken,
  createAuthResponse: () => createAuthResponse,
  optionalAuth: () => optionalAuth
});
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
function authenticateToken(req, res, next) {
  const token = TokenManager.extractTokenFromHeader(req.headers.authorization);
  const url = req.url || req.path || "unknown";
  if (!token) {
    console.log("[Auth] No token provided for:", url);
    res.status(401).json({
      message: "Access token required",
      code: "MISSING_TOKEN"
    });
    return;
  }
  const payload = TokenManager.verifyToken(token);
  if (!payload || payload.type !== "access") {
    console.log("[Auth] Token verification failed for:", url, {
      hasPayload: !!payload,
      tokenType: payload?.type,
      payload
    });
    res.status(403).json({
      message: "Invalid or expired token",
      code: "INVALID_TOKEN"
    });
    return;
  }
  console.log("[Auth] Token verified successfully for:", url, "userId:", payload.userId);
  req.user = payload;
  next();
}
function optionalAuth(req, res, next) {
  const token = TokenManager.extractTokenFromHeader(req.headers.authorization);
  if (token) {
    const payload = TokenManager.verifyToken(token);
    if (payload && payload.type === "access") {
      req.user = payload;
    }
  }
  next();
}
function createAuthResponse(user) {
  const accessToken = TokenManager.generateAccessToken(user);
  const refreshToken = TokenManager.generateRefreshToken(user);
  return {
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.name,
      location: user.location,
      avatarUrl: user.avatarUrl ?? null,
      emailVerified: user.emailVerified ?? false,
      onboardingCompleted: user.onboardingCompleted ?? false,
      createdAt: user.createdAt ?? null,
      dataShareOptOut: user.dataShareOptOut ?? false
    },
    tokens: {
      accessToken,
      refreshToken
    }
  };
}
var PasswordManager, TokenManager, RateLimiter, AuthError;
var init_auth = __esm({
  "server/auth.ts"() {
    "use strict";
    init_config();
    PasswordManager = class {
      static async hash(password) {
        return await bcrypt.hash(password, config.security.bcryptRounds);
      }
      static async verify(password, storedPassword) {
        if (typeof storedPassword !== "string" || storedPassword.trim() === "") {
          return false;
        }
        const isBcryptHash = /^\$2[aby]\$\d{2}\$/.test(storedPassword);
        if (!isBcryptHash) {
          return password === storedPassword;
        }
        try {
          return await bcrypt.compare(password, storedPassword);
        } catch (error) {
          console.error("[PasswordManager.verify] Failed to verify bcrypt hash:", error);
          return false;
        }
      }
      static validate(password) {
        const errors = [];
        if (password.length < 8) {
          errors.push("Password must be at least 8 characters long");
        }
        if (!/[A-Z]/.test(password)) {
          errors.push("Password must contain at least one uppercase letter");
        }
        if (!/[a-z]/.test(password)) {
          errors.push("Password must contain at least one lowercase letter");
        }
        if (!/\d/.test(password)) {
          errors.push("Password must contain at least one number");
        }
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
          errors.push("Password must contain at least one special character");
        }
        return {
          isValid: errors.length === 0,
          errors
        };
      }
    };
    TokenManager = class {
      static generateAccessToken(user) {
        const payload = {
          userId: user.id,
          username: user.username,
          email: user.email,
          type: "access"
        };
        return jwt.sign(payload, config.jwt.secret, {
          expiresIn: config.jwt.expiresIn,
          issuer: "basta-app",
          audience: "basta-users"
        });
      }
      static generateRefreshToken(user) {
        const payload = {
          userId: user.id,
          username: user.username,
          email: user.email,
          type: "refresh"
        };
        return jwt.sign(payload, config.jwt.secret, {
          expiresIn: config.jwt.refreshExpiresIn,
          issuer: "basta-app",
          audience: "basta-users"
        });
      }
      static verifyToken(token) {
        try {
          const payload = jwt.verify(token, config.jwt.secret, {
            issuer: "basta-app",
            audience: "basta-users"
          });
          return payload;
        } catch (error) {
          return null;
        }
      }
      static extractTokenFromHeader(authHeader) {
        if (!authHeader) return null;
        const parts = authHeader.split(" ");
        if (parts.length !== 2 || parts[0] !== "Bearer") {
          return null;
        }
        return parts[1];
      }
    };
    RateLimiter = class {
      static {
        this.attempts = /* @__PURE__ */ new Map();
      }
      static checkLimit(identifier, maxAttempts = config.security.loginRateLimitMax, windowMs = config.security.loginRateLimitWindowMs) {
        const now = Date.now();
        const key = identifier;
        const attempts = this.attempts.get(key);
        this.cleanup();
        if (!attempts) {
          this.attempts.set(key, { count: 1, lastAttempt: now });
          return true;
        }
        if (attempts.lockedUntil && now < attempts.lockedUntil) {
          return false;
        }
        if (now - attempts.lastAttempt > windowMs) {
          this.attempts.set(key, { count: 1, lastAttempt: now });
          return true;
        }
        if (attempts.count >= maxAttempts) {
          attempts.lockedUntil = now + windowMs;
          return false;
        }
        attempts.count++;
        attempts.lastAttempt = now;
        return true;
      }
      static resetLimit(identifier) {
        this.attempts.delete(identifier);
      }
      static cleanup() {
        const now = Date.now();
        const entries = Array.from(this.attempts.entries());
        for (const [key, attempts] of entries) {
          if (attempts.lockedUntil && now > attempts.lockedUntil) {
            this.attempts.delete(key);
          }
        }
      }
      static getRemainingTime(identifier) {
        const attempts = this.attempts.get(identifier);
        if (!attempts || !attempts.lockedUntil) return 0;
        const remaining = attempts.lockedUntil - Date.now();
        return Math.max(0, remaining);
      }
    };
    AuthError = class extends Error {
      constructor(message, code, statusCode = 401) {
        super(message);
        this.code = code;
        this.statusCode = statusCode;
        this.name = "AuthError";
      }
    };
  }
});

// shared/blogContent.ts
var slugify, blogContentUpdates;
var init_blogContent = __esm({
  "shared/blogContent.ts"() {
    "use strict";
    slugify = (title) => title.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").trim();
    blogContentUpdates = {
      [slugify("El Cansancio Sagrado: Por qu\xE9 ya no podemos esperar")]: {
        excerpt: "Hay un cansancio que no pide almohada: pide planos. Es la lucidez inc\xF3moda de saber que Argentina puede ser redise\xF1ada \u2014 ahora, no ma\xF1ana.",
        content: `
      <article>
        <h1>El Cansancio Sagrado: Por qu\xE9 ya no podemos esperar</h1>
        <p>
          Hay un cansancio que no pide almohada: pide planos. Lo sent\xEDs cuando cerr\xE1s el noticiero y el enojo ya no alcanza.
          Cuando la indignaci\xF3n deja de ser suficiente y algo m\xE1s profundo te exige pasar de la queja al dise\xF1o.
          Ese cansancio tiene nombre: es la lucidez de quien entiende que nadie vendr\xE1 a rescatarnos \u2014 y que eso,
          lejos de ser una condena, es la mayor oportunidad de nuestra generaci\xF3n.
        </p>

        <blockquote>
          El cansancio sagrado no nos invita a dormir: nos ordena sentarnos a la mesa de dise\xF1o
          y trazar los planos de los sistemas que reemplazar\xE1n a los que ya probaron ser insuficientes.
        </blockquote>

        <h2>Cuando el agotamiento se convierte en br\xFAjula</h2>
        <p>
          El cansancio sagrado no es depresi\xF3n ni cinismo. Es un estado de alerta moral que combina tres fuerzas:
        </p>
        <ul>
          <li><strong>Lucidez emocional:</strong> reconocemos la frustraci\xF3n sin permitir que nos vuelva c\xEDnicos. La rabia se transforma en combustible, no en veneno.</li>
          <li><strong>Diagn\xF3stico sist\xE9mico:</strong> entendemos que los problemas se repiten porque fueron dise\xF1ados para repetirse \u2014 por procesos, no por personas.</li>
          <li><strong>Decisi\xF3n de servicio:</strong> elegimos invertir cada gramo de energ\xEDa en construir, no en se\xF1alar culpables.</li>
        </ul>

        <h2>Radiograf\xEDa urgente: por qu\xE9 est\xE1s agotado</h2>
        <p>
          Si llegaste hasta ac\xE1 es porque ya viste alguno de estos fallos estructurales con tus propios ojos:
        </p>
        <ul>
          <li><strong>Educaci\xF3n que desconecta:</strong> Argentina qued\xF3 alrededor del puesto 63 en las pruebas PISA 2022 \u2014 por debajo del promedio de la OCDE y de varios pa\xEDses de la regi\xF3n. Formamos memoriosos, no ciudadanos capaces de redise\xF1ar su realidad.</li>
          <li><strong>Econom\xEDa especulativa:</strong> premia la viveza cortoplacista y castiga la creaci\xF3n de valor con prop\xF3sito. Decenas de miles de profesionales emigran cada a\xF1o buscando estabilidad que su propio pa\xEDs no les ofrece.</li>
          <li><strong>Pol\xEDtica transaccional:</strong> negocia parches cosm\xE9ticos, nunca redise\xF1os de fondo. Un sector p\xFAblico que acumula capas de burocracia sin medir resultados reales \u2014 donde la ineficiencia se naturaliza como paisaje.</li>
          <li><strong>Cultura de espectadores:</strong> delegamos la transformaci\xF3n en l\xEDderes mesi\xE1nicos en lugar de asumir autor\xEDa colectiva.</li>
        </ul>

        <h2>Esto ya pas\xF3 antes \u2014 y los que actuaron, transformaron</h2>
        <p>
          El cansancio sagrado no es nuevo. Cada vez que una sociedad lleg\xF3 al l\xEDmite del agotamiento y eligi\xF3 dise\xF1ar en vez de resignarse, el resultado fue extraordinario.
        </p>
        <ul>
          <li><strong>Argentina, 2001\u20132003:</strong> cuando el sistema financiero colaps\xF3 y las instituciones se vaciaron de credibilidad, miles de vecinos no esperaron rescate. Armaron cooperativas, redes de trueque y asambleas barriales que sostuvieron comunidades enteras. No fue idealismo: fue ingenier\xEDa social de supervivencia, nacida del mismo cansancio que vos sent\xEDs ahora.</li>
          <li><strong>Corea del Sur, 1997:</strong> en plena crisis del FMI, ciudadanos comunes donaron oro personal \u2014 anillos de boda, cadenas familiares \u2014 para reconstruir las reservas del pa\xEDs. Recaudaron m\xE1s de 200 toneladas. Un pueblo que convirti\xF3 el agotamiento colectivo en un acto de dise\xF1o nacional. En menos de dos a\xF1os, pagaron la deuda anticipadamente.</li>
        </ul>
        <p>
          La lecci\xF3n es clara: el cansancio sagrado se vuelve combustible cuando se canaliza en acci\xF3n colectiva concreta. No alg\xFAn d\xEDa. Ahora.
        </p>

        <h2>De la indignaci\xF3n a la ingenier\xEDa social</h2>
        <p>
          El cansancio sagrado no se cura con descanso \u2014 se cura dise\xF1ando. Ac\xE1 va una secuencia pr\xE1ctica
          para pasar de la fatiga a la construcci\xF3n en menos de un mes:
        </p>
        <ol>
          <li><strong>Nombrar el sistema roto:</strong> \xBFeducaci\xF3n, salud, tu barrio, tu econom\xEDa personal? Eleg\xED uno.</li>
          <li><strong>Identificar el patr\xF3n:</strong> \xBFqu\xE9 h\xE1bito, norma o creencia mantiene vivo el problema?</li>
          <li><strong>Crear un prototipo:</strong> un peque\xF1o redise\xF1o que pueda probarse en 30 d\xEDas o menos.</li>
          <li><strong>Medir y narrar:</strong> compartir lo aprendido para que otros se sumen al redise\xF1o.</li>
        </ol>

        <h2>Tres rituales diarios para honrar tu cansancio</h2>
        <p>Transform\xE1 tu agotamiento en pr\xE1ctica concreta antes de que termine el d\xEDa:</p>
        <ol>
          <li><strong>Diario de lucidez:</strong> escrib\xED qu\xE9 viste hoy que confirma que no hay m\xE1s tiempo que perder.</li>
          <li><strong>Microacci\xF3n consciente:</strong> eleg\xED una sola acci\xF3n peque\xF1a que mejore el sistema que te quita el sue\xF1o.</li>
          <li><strong>Conversaci\xF3n valiente:</strong> habl\xE1 con alguien sobre la visi\xF3n \u2014 no sobre la queja.</li>
        </ol>

        <blockquote>
          Escuchame bien: vos no naciste para tolerar un pa\xEDs que te queda chico.
          Ese cansancio que sent\xEDs no es debilidad \u2014 es tu dise\xF1o interno dici\xE9ndote
          que viniste a construir algo que todav\xEDa no existe. La fatiga de un arquitecto
          no se cura con siestas: se cura cuando por fin apoya el l\xE1piz sobre el plano
          y traza la primera l\xEDnea del mundo que sabe posible. Ese momento es ahora.
          Ese arquitecto sos vos.
        </blockquote>
      </article>
    `
      },
      [slugify("La Amabilidad como Ingenier\xEDa Social")]: {
        excerpt: "Decile 'amabilidad' a un argentino curtido y te va a mirar con desconfianza. Pero cuando la us\xE1s como arquitectura social, repara v\xEDnculos y alinea prop\xF3sitos como ninguna otra tecnolog\xEDa.",
        content: `
      <article>
        <h1>La Amabilidad como Ingenier\xEDa Social</h1>
        <p>
          Decile "amabilidad" a un argentino curtido por la calle y te va a mirar con desconfianza.
          Suena a debilidad, a ingenuidad, a "buenismo" que no sobrevive una semana en la realidad.
          Pero hay otra lectura \u2014 una que cambia todo: la amabilidad no es cortes\xEDa.
          Es una tecnolog\xEDa social. La m\xE1s subestimada que existe. Cuando un sistema humano est\xE1 quebrado,
          la amabilidad estrat\xE9gica es la primera intervenci\xF3n inteligente porque desarma defensas,
          multiplica confianza y genera cooperaci\xF3n donde antes solo hab\xEDa fricci\xF3n.
        </p>
        <p>
          No es teor\xEDa. En Medell\xEDn, Colombia, la aplicaci\xF3n deliberada de "cultura ciudadana" \u2014 una ingenier\xEDa de la amabilidad c\xEDvica impulsada desde los a\xF1os noventa \u2014 transform\xF3 una de las ciudades m\xE1s violentas del mundo en un modelo de cooperaci\xF3n urbana en menos de dos d\xE9cadas. No fue un milagro: fue dise\xF1o social sostenido, donde cada interacci\xF3n amable era una intervenci\xF3n arquitect\xF3nica sobre la confianza colectiva.
        </p>

        <blockquote>
          La amabilidad profesional no es complacencia: es la decisi\xF3n de construir escenarios
          donde otros quieran aportar lo mejor de s\xED \u2014 y donde hacerlo sea f\xE1cil.
        </blockquote>

        <h2>Las tres variables que la amabilidad redise\xF1a</h2>
        <ul>
          <li><strong>Percepci\xF3n:</strong> transforma la manera en que interpretamos la intenci\xF3n de los dem\xE1s. Lo que antes era amenaza se vuelve posibilidad. Fowler y Christakis demostraron en su investigaci\xF3n publicada en PNAS (2010) que el comportamiento cooperativo se propaga hasta tres grados de separaci\xF3n en redes sociales \u2014 tu amabilidad impacta a personas que nunca vas a conocer.</li>
          <li><strong>Velocidad:</strong> acelera acuerdos porque reduce el ruido emocional. Donde hab\xEDa discusi\xF3n de dos horas, hay consenso en veinte minutos. Amy Edmondson, de Harvard, demostr\xF3 que la seguridad psicol\xF3gica \u2014 el permiso para equivocarse sin castigo \u2014 es el predictor n\xFAmero uno del rendimiento en equipos. La amabilidad crea ese permiso.</li>
          <li><strong>Memoria colectiva:</strong> deja huellas positivas que se replican en la cultura. La neurociencia documenta el "helper's high": los actos altruistas activan la liberaci\xF3n de dopamina y oxitocina en quien los ejecuta, creando un circuito de recompensa que convierte la generosidad en h\xE1bito biol\xF3gico, no solo moral.</li>
        </ul>

        <h2>Blueprint de una interacci\xF3n amable</h2>
        <p>Cada conversaci\xF3n importante merece este dise\xF1o previo:</p>
        <ol>
          <li><strong>Preparaci\xF3n:</strong> defin\xED la emoci\xF3n que quer\xE9s provocar en la otra persona antes de abrir la boca.</li>
          <li><strong>Reconocimiento:</strong> us\xE1 las primeras palabras para validar al otro \u2014 antes de pedir nada.</li>
          <li><strong>Oferta clara:</strong> explic\xE1 c\xF3mo tu propuesta mejora la vida del otro, no solo la tuya.</li>
          <li><strong>Cierre consciente:</strong> agradec\xE9 con datos concretos ("valor\xE9 que me hayas dado 20 minutos"), no con frases vac\xEDas.</li>
        </ol>

        <h2>Tres capas de aplicaci\xF3n</h2>
        <p>Integr\xE1 la amabilidad como ingenier\xEDa en cada nivel de tu vida:</p>
        <ul>
          <li><strong>Individual:</strong> establec\xE9 l\xEDmites firmes comunicados con respeto quir\xFArgico. No es lo que dec\xEDs, es c\xF3mo lo dise\xF1\xE1s.</li>
          <li><strong>Organizacional:</strong> cre\xE1 rituales de reconocimiento que hagan visibles los comportamientos generosos \u2014 no solo los resultados.</li>
          <li><strong>Comunitaria:</strong> dise\xF1\xE1 espacios donde desconocidos puedan colaborar sin miedo a ser juzgados. Ese es el verdadero urbanismo social.</li>
        </ul>

        <blockquote>
          Vos \u2014 s\xED, vos que est\xE1s leyendo esto \u2014 sos el ingeniero de esa infraestructura.
          Cada vez que eleg\xEDs responder con precisi\xF3n amable en lugar de reaccionar con cinismo,
          est\xE1s tendiendo un cable de fibra \xF3ptica emocional por donde va a circular
          la inteligencia colectiva de tu comunidad. No es un gesto. Es la obra m\xE1s importante
          que vas a construir en tu vida. Y nadie m\xE1s la puede hacer por vos.
        </blockquote>
      </article>
    `
      },
      [slugify("Dise\xF1o Idealizado: La Argentina Posible")]: {
        excerpt: "\xBFY si pudieras empezar de cero? El dise\xF1o idealizado no es fantas\xEDa: es la metodolog\xEDa que nos obliga a describir en detalle la Argentina que merece existir \u2014 y despu\xE9s construirla.",
        content: `
      <article>
        <h1>Dise\xF1o Idealizado: La Argentina Posible</h1>
        <p>
          \xBFY si pudieras empezar de cero? No reformar lo que hay \u2014 dise\xF1ar desde la hoja en blanco.
          Russell Ackoff propon\xEDa exactamente eso: imaginar el sistema ideal sin las restricciones del presente,
          y reci\xE9n despu\xE9s preguntarse c\xF3mo llegar hasta all\xED. Aplicado a Argentina, el dise\xF1o idealizado
          nos libera de la trampa de arreglar el pasado y nos obliga a una pregunta m\xE1s poderosa:
          \xBFqu\xE9 pa\xEDs aceptar\xEDamos si tuvi\xE9ramos que vivir en \xE9l para siempre?
        </p>

        <blockquote>
          La pregunta no es "\xBFqu\xE9 podemos cambiar?" sino "\xBFqu\xE9 pa\xEDs dise\xF1ar\xEDamos
          si tuvi\xE9ramos que vivir en \xE9l \u2014 nosotros y nuestros hijos \u2014 para siempre?"
        </blockquote>

        <h2>Esto no es utop\xEDa \u2014 ya se hizo</h2>
        <p>
          El dise\xF1o idealizado suena a fantas\xEDa hasta que mir\xE1s los casos donde alguien se atrevi\xF3 a usarlo en serio. En Curitiba, Brasil, Jaime Lerner parti\xF3 de una hoja en blanco para reimaginar el transporte p\xFAblico. El resultado fue el sistema de Bus Rapid Transit (BRT) \u2014 carriles exclusivos, estaciones tubo, frecuencia calculada al segundo \u2014 que hoy se replica en m\xE1s de 300 ciudades del mundo. No ten\xEDa presupuesto de primer mundo; ten\xEDa dise\xF1o idealizado aplicado con disciplina.
        </p>
        <p>
          En Singapur, un gobierno que hered\xF3 pobreza extrema y hacinamiento en los a\xF1os sesenta dise\xF1\xF3 desde cero un programa de vivienda p\xFAblica que hoy aloja al 80% de su poblaci\xF3n en hogares propios. No fue asistencialismo: fue arquitectura sist\xE9mica deliberada \u2014 reglas claras, ahorro obligatorio, construcci\xF3n masiva con est\xE1ndares dignos. Dos ejemplos que demuestran lo mismo: cuando dise\xF1\xE1s sin las restricciones del presente, el futuro deja de ser promesa y se vuelve ingenier\xEDa.
        </p>

        <h2>Los tres principios del redise\xF1o nacional</h2>
        <ul>
          <li><strong>Prop\xF3sito compartido:</strong> cada sistema \u2014 educaci\xF3n, salud, econom\xEDa \u2014 existe para servir a la vida digna. Si no cumple esa funci\xF3n, se redise\xF1a.</li>
          <li><strong>Coherencia radical:</strong> las pol\xEDticas dejan de contradecirse porque responden a un modelo integral, no a urgencias electorales.</li>
          <li><strong>Iteraci\xF3n con evidencia:</strong> los prototipos se prueban r\xE1pido y con datos, no con promesas ni con fe.</li>
        </ul>

        <h2>Mapa del sistema idealizado</h2>
        <h3>1. Educaci\xF3n que despierta</h3>
        <p>Curr\xEDculas que integran tecnolog\xEDa, humanidades y dise\xF1o social desde la primaria. Alumnos que egresan sabiendo hacer preguntas, no solo repetir respuestas.</p>

        <h3>2. Econom\xEDa del valor real</h3>
        <p>Emprendimientos medidos por el impacto que generan en comunidades y territorios \u2014 no solo por la renta. Donde crear valor social sea tan rentable como especular.</p>

        <h3>3. Estado core\xF3grafo</h3>
        <p>Gobiernos que coordinan recursos, reglas y datos para que la creatividad ciudadana florezca. No un Estado que hace todo, sino uno que habilita todo. Concretamente: un Estado que establece las reglas del juego con transparencia absoluta, publica datos abiertos para que cualquier ciudadano pueda auditar y proponer, elimina la fricci\xF3n burocr\xE1tica que hoy asfixia al emprendedor y al vecino por igual, y deja que las personas, las cooperativas y las empresas creen las soluciones. El Estado core\xF3grafo no baila: dise\xF1a la coreograf\xEDa, pone la m\xFAsica y se asegura de que nadie quede afuera de la pista.</p>

        <h3>4. Cultura del servicio</h3>
        <p>Medios y referentes que honran a quienes solucionan problemas, no a quienes los narran desde afuera. Donde "servidor p\xFAblico" sea un t\xEDtulo de orgullo.</p>

        <h2>Tres pasos para empezar hoy</h2>
        <ol>
          <li><strong>Visi\xF3n escrita:</strong> describ\xED tu Argentina ideal como si estuvieras dando un reporte anual de resultados. Con n\xFAmeros, con plazos, con nombres.</li>
          <li><strong>Prototipo local:</strong> traduc\xED esa visi\xF3n en un proyecto concreto de barrio o de organizaci\xF3n que puedas lanzar este mes.</li>
          <li><strong>Aprendizaje compartido:</strong> document\xE1 qu\xE9 funciona y qu\xE9 no para que otros puedan replicarlo sin empezar de cero.</li>
        </ol>

        <p>
          Hay un peso enorme en atreverse a imaginar con precisi\xF3n \u2014 porque lo que describ\xEDs con detalle ya no pod\xE9s ignorar. Pero hay algo m\xE1s hermoso todav\xEDa: descubrir que la responsabilidad de dise\xF1ar el pa\xEDs que merecemos no es una carga, sino la forma m\xE1s alta de dignidad que podemos ejercer.
        </p>

        <blockquote>
          Dise\xF1ar idealmente es un acto de responsabilidad:
          no podemos exigir lo que no nos animamos a imaginar con precisi\xF3n.
        </blockquote>
      </article>
    `
      },
      [slugify("El Poder del Pensamiento Sist\xE9mico en la Transformaci\xF3n Social")]: {
        excerpt: "Un m\xE9dico no trata la fiebre sin buscar la infecci\xF3n. Pensar en sistemas es pasar del 'qu\xE9 pas\xF3' al 'qu\xE9 lo hizo posible' \u2014 y dise\xF1ar palancas que cambien el patr\xF3n completo.",
        content: `
      <article>
        <h1>El Poder del Pensamiento Sist\xE9mico en la Transformaci\xF3n Social</h1>
        <p>
          Un m\xE9dico no trata la fiebre sin buscar la infecci\xF3n. Pero en Argentina llevamos d\xE9cadas
          tratando s\xEDntomas \u2014 pobreza, inseguridad, corrupci\xF3n \u2014 sin tocar los procesos que los producen.
          Pensar sist\xE9micamente es aprender a ver lo que est\xE1 debajo: los bucles de retroalimentaci\xF3n,
          las causas invisibles y las dependencias silenciosas que perpet\xFAan el deterioro mientras todos
          miramos para otro lado.
        </p>
        <p>
          Cambiamos cinco ministros de educaci\xF3n en diez a\xF1os y nunca redise\xF1amos el curr\xEDculum.
          Parchamos la inflaci\xF3n con controles de precio que duran meses. Creamos planes sociales
          sin medir si producen autonom\xEDa o dependencia. Eso es tratar s\xEDntomas. Y mientras sigamos
          tratando s\xEDntomas, los mismos problemas van a seguir apareciendo con caras distintas.
        </p>

        <h2>Los tres lentes que necesit\xE1s ahora</h2>
        <ul>
          <li><strong>Bucles de refuerzo:</strong> comportamientos que se amplifican a s\xED mismos. La desconfianza genera aislamiento, el aislamiento genera m\xE1s desconfianza. Hasta que alguien lo corta.</li>
          <li><strong>Bucles de balance:</strong> din\xE1micas que frenan el cambio porque el sistema busca volver al status quo. Cada reforma encuentra su anticuerpo.</li>
          <li><strong>Retrasos invisibles:</strong> decisiones cuyos efectos aparecen meses o a\xF1os despu\xE9s. Lo que hoy parece inofensivo ma\xF1ana es irreversible.</li>
        </ul>
        <p>
          Donella Meadows, en su trabajo <em>Leverage Points: Places to Intervene in a System</em>,
          demostr\xF3 que los puntos de mayor apalancamiento no est\xE1n donde creemos \u2014 no est\xE1n en los
          n\xFAmeros ni en los presupuestos, sino en las reglas del juego y, m\xE1s arriba a\xFAn, en el
          paradigma mental desde el que operamos. Cambiar un presupuesto mueve decimales; cambiar
          una creencia colectiva mueve civilizaciones.
        </p>

        <blockquote>
          Un problema sist\xE9mico nunca se soluciona en el mismo lugar donde lo detectamos.
          Hay que intervenir en el dise\xF1o que lo produce \u2014 o seguir apagando incendios para siempre.
        </blockquote>

        <h2>Metodolog\xEDa pr\xE1ctica: cuatro pasos urgentes</h2>
        <ol>
          <li><strong>Cartografiar actores:</strong> \xBFqui\xE9n gana si todo sigue igual? \xBFQui\xE9n pierde? \xBFQui\xE9n decide? En el sistema educativo argentino: los sindicatos ganan estabilidad, los alumnos pierden relevancia, los padres no tienen voz institucional. Hasta que no mape\xE1s eso con honestidad, no pod\xE9s redise\xF1ar nada.</li>
          <li><strong>Mapear flujos:</strong> segu\xED el dinero, la informaci\xF3n, las emociones y el poder. Ah\xED est\xE1 el diagn\xF3stico real.</li>
          <li><strong>Encontrar apalancamientos:</strong> busc\xE1 los puntos donde un cambio peque\xF1o produce efectos desproporcionados. Un ejemplo: si los directores de escuela pudieran elegir a su equipo docente \u2014 como ocurre en muchos pa\xEDses de la OCDE \u2014 un solo cambio de regla alterar\xEDa incentivos en cascada: formaci\xF3n, compromiso, rendici\xF3n de cuentas.</li>
          <li><strong>Crear nuevas reglas:</strong> dise\xF1\xE1 acuerdos expl\xEDcitos que cambien los incentivos del juego.</li>
        </ol>

        <h2>Donde aplicarlo ma\xF1ana mismo</h2>
        <p>No necesit\xE1s un doctorado. Us\xE1 el pensamiento sist\xE9mico en tu pr\xF3xima reuni\xF3n:</p>
        <ul>
          <li><strong>En tu comunidad:</strong> aline\xE1 vecinos con datos compartidos y compromisos visibles.</li>
          <li><strong>En tu equipo:</strong> redise\xF1\xE1 las reuniones para que resuelvan causas ra\xEDz, no emergencias del momento.</li>
          <li><strong>En tus proyectos sociales:</strong> med\xED impacto en varias capas \u2014 econ\xF3mica, emocional, cultural \u2014 no solo en outputs.</li>
        </ul>

        <blockquote>
          Pensar en sistemas es el acto de amor m\xE1s profundo que existe, porque significa
          que te importa lo suficiente como para ver m\xE1s all\xE1 de la superficie. No te conform\xE1s
          con el gesto inmediato: dise\xF1\xE1s para los que vienen despu\xE9s. Cada bucle que mape\xE1s,
          cada palanca que identific\xE1s, es una carta de amor al futuro \u2014 firmada con la disciplina
          de quien entiende que amar de verdad es dise\xF1ar un mundo donde el amor funcione a escala.
        </blockquote>
      </article>
    `
      },
      [slugify("La \xC9tica del Servicio: Construyendo una Sociedad de Servidores")]: {
        excerpt: "En Argentina, 'servir' suena a sacrificio. Pero servir no es inmolarse: es dise\xF1ar tu vida para que cada talento produzca valor colectivo medible. Es la forma m\xE1s profesional del amor.",
        content: `
      <article>
        <h1>La \xC9tica del Servicio: Construyendo una Sociedad de Servidores</h1>
        <p>
          En Argentina, "servir" suena a sacrificio, a abnegaci\xF3n, a perder algo propio en nombre de los dem\xE1s.
          Esa lectura est\xE1 rota. Servir \u2014 bien entendido \u2014 es lo opuesto: es dise\xF1ar tu vida profesional
          para que cada talento que ten\xE9s produzca valor colectivo medible. No es caridad. Es la forma
          m\xE1s rigurosa y exigente del amor aplicado.
        </p>
        <p>
          Pens\xE1 en eso un momento. Amor aplicado. No el amor que se dice \u2014 el que se dise\xF1a.
          El que mide si funciona. El que corrige cuando no alcanza. Servir con esa precisi\xF3n
          es la disciplina m\xE1s exigente que existe, porque te obliga a poner el resultado del otro
          por encima de tu comodidad \u2014 todos los d\xEDas. En un pa\xEDs fatigado de promesas vac\xEDas,
          la actitud del servidor profesional es revolucionaria porque combina empat\xEDa con dise\xF1o,
          pasi\xF3n con m\xE9tricas, coraz\xF3n con ingenier\xEDa.
        </p>

        <h2>Los cuatro compromisos del servidor profesional</h2>
        <ul>
          <li><strong>Autoconocimiento:</strong> sab\xE9 qu\xE9 talento aport\xE1s mejor que nadie \u2014 y dej\xE1 de disculparte por no tener todos los dem\xE1s.</li>
          <li><strong>Coraje c\xEDvico:</strong> nombr\xE1 lo que duele sin destruir al otro. La verdad dicha con respeto es el mayor regalo que pod\xE9s dar.</li>
          <li><strong>Disciplina:</strong> convert\xED la empat\xEDa en soluciones concretas. Sentir no alcanza; dise\xF1ar s\xED.</li>
          <li><strong>Evaluaci\xF3n constante:</strong> med\xED si tu servicio realmente transforma \u2014 o si solo te hace sentir bien a vos.</li>
        </ul>
        <p>
          Robert Greenleaf acu\xF1\xF3 el concepto de "liderazgo servidor" hace m\xE1s de cincuenta a\xF1os.
          Las investigaciones que siguieron confirman lo que \xE9l intuy\xF3: las organizaciones lideradas
          por servidores aut\xE9nticos superan sistem\xE1ticamente a las dem\xE1s en confianza interna,
          retenci\xF3n de talento y resultados sostenidos. No es filosof\xEDa blanda \u2014 es evidencia dura
          de que servir bien es la estrategia m\xE1s rentable que existe.
        </p>

        <blockquote>
          Servir no es agradar. Es estar dispuesto a redise\xF1ar procesos inc\xF3modos
          para que la dignidad sea norma y no excepci\xF3n.
        </blockquote>

        <h2>Del individuo al sistema: c\xF3mo escalar el servicio</h2>
        <p>Para que la \xE9tica del servicio deje de ser hero\xEDsmo individual y se vuelva cultura, necesitamos:</p>
        <ol>
          <li><strong>Lenguaje com\xFAn:</strong> reemplazar la cr\xEDtica vac\xEDa por preguntas que inviten a co-crear. "\xBFQu\xE9 podemos redise\xF1ar juntos?" en lugar de "esto no funciona".</li>
          <li><strong>Modelos replicables:</strong> manuales abiertos que expliquen c\xF3mo servir en cada contexto \u2014 desde un aula hasta una empresa.</li>
          <li><strong>Celebraci\xF3n p\xFAblica:</strong> narrativas que premien a quienes solucionan, no solo a quienes opinan. Que "servidor p\xFAblico" sea un t\xEDtulo de honor.</li>
        </ol>
        <p>
          La clave est\xE1 en los rituales visibles. Cuando un acto de servicio se nombra en p\xFAblico,
          se documenta y se celebra con datos \u2014 no con aplausos vac\xEDos \u2014 se convierte en norma imitada.
          Las culturas no cambian por decreto: cambian cuando los comportamientos deseados se vuelven
          los m\xE1s visibles y los m\xE1s recompensados. Quer\xE9s una cultura de servicio, hac\xE9 que servir
          sea lo m\xE1s visible y lo m\xE1s celebrado en tu organizaci\xF3n.
        </p>

        <h2>Tres micropr\xE1cticas para empezar hoy</h2>
        <ul>
          <li><strong>Agenda de servicio:</strong> reserv\xE1 en tu calendario de esta semana una acci\xF3n concreta al servicio de otro. No alg\xFAn d\xEDa \u2014 esta semana.</li>
          <li><strong>Feedback generoso:</strong> ofrec\xE9 a alguien una observaci\xF3n honesta que lo ayude a mejorar. No cr\xEDtica: dise\xF1o de mejora.</li>
          <li><strong>Puentes improbables:</strong> conect\xE1 a dos personas que no se conocen pero que pueden potenciarse mutuamente. Eso es ingenier\xEDa social en acci\xF3n.</li>
        </ul>

        <p>
          Yo no escribo esto desde la perfecci\xF3n. Lo escribo desde la decisi\xF3n diaria de intentarlo
          \u2014 y desde la certeza de que cada vez que fallo en servir, el sistema me lo muestra con
          claridad brutal. Esa brutalidad es un regalo, porque no me deja mentirme.
        </p>

        <blockquote>
          Una sociedad de servidores no espera milagros: dise\xF1a oportunidades
          para que cada ciudadano sea autor de soluciones \u2014 y no espectador de problemas.
        </blockquote>
      </article>
    `
      },
      [slugify("Sistemas vs. S\xEDntomas: C\xF3mo Pensar como Ingeniero Social")]: {
        excerpt: "Hay dos formas de mirar la realidad: perseguir incendios o redise\xF1ar el tablero. Este art\xEDculo te entrena para la segunda \u2014 la \xFAnica que produce cambios duraderos. Porque mientras sigas tratando s\xEDntomas, el sistema que los produce va a seguir intacto.",
        content: `
      <article>
        <h1>Sistemas vs. S\xEDntomas: C\xF3mo Pensar como Ingeniero Social</h1>
        <p>
          Te voy a contar algo que me pas\xF3 hace poco. Estaba en una reuni\xF3n donde todos se quejaban
          del mismo problema \u2014 por tercera vez en dos meses. Alguien propon\xEDa una soluci\xF3n, otro la
          descartaba, un tercero se indignaba. Y de golpe lo vi con una claridad que me dej\xF3 helado:
          no est\xE1bamos discutiendo el problema. Est\xE1bamos discutiendo el s\xEDntoma. El problema real
          \u2014 el dise\xF1o que lo produce \u2014 nadie lo hab\xEDa nombrado. Nadie. En tres reuniones.
        </p>
        <p>
          Y ah\xED entend\xED algo que me cambi\xF3 la forma de mirar todo: la mayor\xEDa de las personas
          inteligentes, bien intencionadas, con ganas de cambiar las cosas, pasan la vida entera
          persiguiendo s\xEDntomas. No por ignorancia \u2014 por falta de entrenamiento. Nadie nos ense\xF1\xF3
          a ver sistemas. Nos ense\xF1aron a ver eventos. Y esa diferencia \u2014 invisible pero demoledora \u2014
          es la raz\xF3n por la que Argentina cicla por las mismas crisis generaci\xF3n tras generaci\xF3n,
          por la que tu empresa repite los mismos errores cada trimestre, por la que tu vida personal
          parece dar vueltas alrededor de los mismos problemas sin resolverlos nunca.
        </p>
        <p>
          Este art\xEDculo es un manual. No una opini\xF3n, no una reflexi\xF3n inspiracional \u2014 un manual.
          Para aprender a ver lo que est\xE1 debajo de lo que se ve. Para dejar de ser bombero y
          empezar a ser arquitecto. Para pensar como ingeniero social \u2014 que no es una profesi\xF3n,
          sino una forma de mirar la realidad que, una vez que la adquir\xEDs, no pod\xE9s volver atr\xE1s.
        </p>

        <blockquote>
          El s\xEDntoma grita. El sistema susurra. Y si no aprend\xE9s a escuchar lo que susurra,
          vas a pasarte la vida corriendo detr\xE1s de lo que grita \u2014 sin resolver nunca nada.
        </blockquote>

        <h2>Qu\xE9 es un s\xEDntoma y qu\xE9 es un sistema \u2014 la diferencia que nadie te explic\xF3</h2>
        <p>
          Un s\xEDntoma es lo que se ve. Es el resultado visible de algo que opera debajo, fuera de
          tu campo de visi\xF3n. La fiebre es un s\xEDntoma \u2014 la infecci\xF3n es el sistema. La inflaci\xF3n
          es un s\xEDntoma \u2014 la estructura monetaria y fiscal es el sistema. La deserci\xF3n escolar
          es un s\xEDntoma \u2014 el dise\xF1o educativo que expulsa en lugar de contener es el sistema.
          El empleado que renuncia es un s\xEDntoma \u2014 la cultura organizacional que lo agota es el sistema.
        </p>
        <p>
          Pens\xE1 en tu propia vida. \xBFCu\xE1ntas veces atacaste un s\xEDntoma creyendo que estabas
          resolviendo un problema? Cambiaste de trabajo porque el jefe era insoportable \u2014 y en el
          siguiente trabajo encontraste otro jefe insoportable. \xBFCasualidad? No. Hay un patr\xF3n
          en el tipo de organizaciones que eleg\xEDs, en c\xF3mo te posicion\xE1s frente a la autoridad,
          en qu\xE9 toler\xE1s y qu\xE9 no. Ese patr\xF3n es el sistema. El jefe insoportable es solo el s\xEDntoma.
        </p>
        <p>
          Ahora escal\xE1 eso a un pa\xEDs. Argentina tiene una relaci\xF3n patol\xF3gica con el d\xF3lar.
          Cada gobierno intenta "resolver" el problema cambiario con controles, cepos, devaluaciones,
          unificaciones. Son parches sobre s\xEDntomas. El sistema que produce la fuga al d\xF3lar
          \u2014 d\xE9cadas de traici\xF3n institucional, inflaci\xF3n cr\xF3nica que destruye ahorros, reglas que
          cambian a mitad del juego \u2014 nadie lo toca. Porque tocar el sistema requiere una forma
          de pensar que no nos ense\xF1aron.
        </p>

        <h2>Por qu\xE9 tu cerebro prefiere los s\xEDntomas \u2014 y c\xF3mo reprogramarlo</h2>
        <p>
          No es estupidez. Es neurolog\xEDa. Tu cerebro est\xE1 dise\xF1ado para responder a lo inmediato,
          lo visible, lo urgente. Daniel Kahneman lo document\xF3 exhaustivamente: el Sistema 1
          \u2014 el pensamiento r\xE1pido, autom\xE1tico, emocional \u2014 domina la mayor parte de tus decisiones.
          Y el Sistema 1 ama los s\xEDntomas. Son concretos, son visibles, son emocionalmente
          satisfactorios de atacar. "El problema es este pol\xEDtico." "El problema es este empleado."
          "El problema es esta ley." Se\xF1alar un culpable se siente bien. Redise\xF1ar un sistema
          no se siente bien \u2014 se siente inc\xF3modo, lento, abstracto. Pero es lo \xFAnico que funciona.
        </p>
        <p>
          El Sistema 2 \u2014 el pensamiento lento, deliberado, anal\xEDtico \u2014 es el que puede ver sistemas.
          Pero cuesta activarlo. Consume energ\xEDa. Requiere concentraci\xF3n sostenida. Y sobre todo,
          requiere tolerar la ambig\xFCedad: los sistemas no tienen un solo culpable, no tienen una
          sola causa, no tienen una soluci\xF3n que quepa en un tuit. Y eso, en la era de la
          gratificaci\xF3n instant\xE1nea, es casi intolerable.
        </p>
        <p>
          Pero ac\xE1 est\xE1 la buena noticia: el pensamiento sist\xE9mico se entrena. No es un talento
          innato \u2014 es una habilidad adquirida. Y una vez que la adquir\xEDs, es como ponerte anteojos
          por primera vez: lo que antes era borroso se vuelve n\xEDtido, y no pod\xE9s creer que hayas
          vivido tanto tiempo sin ver lo que ahora es obvio.
        </p>

        <h2>Las cinco trampas del pensador de s\xEDntomas</h2>
        <p>
          Antes de aprender a ver sistemas, necesit\xE1s identificar los errores que te mantienen
          atrapado en la superficie. Son cinco, y probablemente comet\xE9s al menos tres todos los d\xEDas:
        </p>
        <ol>
          <li>
            <strong>Confundir urgencia con importancia.</strong> Lo urgente grita; lo importante
            susurra. El \xFAltimo esc\xE1ndalo pol\xEDtico es urgente. La reforma educativa que determina
            qu\xE9 tipo de ciudadanos vamos a tener en 20 a\xF1os es importante. \xBFA cu\xE1l le dedic\xE1s
            m\xE1s atenci\xF3n? La urgencia es el anest\xE9sico de la estrategia. Cada minuto que invert\xEDs
            en lo urgente es un minuto que le rob\xE1s a lo importante. Y lo importante, cuando se
            ignora el tiempo suficiente, se convierte en la pr\xF3xima urgencia. Es un ciclo que
            solo se rompe con una decisi\xF3n consciente: elegir lo importante antes de que se
            vuelva urgente.
          </li>
          <li>
            <strong>Personalizar lo que es estructural.</strong> "El problema es Fulano."
            "Si cambiamos al ministro, se arregla." "Con un buen l\xEDder alcanza." No alcanza.
            Nunca alcanz\xF3. Cuando un sistema est\xE1 dise\xF1ado para producir un resultado,
            no importa qui\xE9n lo opere \u2014 va a producir ese resultado. Edwards Deming, el padre
            del control de calidad, lo dijo con una precisi\xF3n quir\xFArgica: "Un mal sistema
            vence a una buena persona, siempre." Cambiar al jugador sin cambiar las reglas
            del juego no cambia el juego. Solo cambia qui\xE9n pierde.
          </li>
          <li>
            <strong>Buscar la causa \xFAnica.</strong> "\xBFCu\xE1l es LA causa de la pobreza?"
            No hay una. Hay un entramado de factores que se retroalimentan: educaci\xF3n que no
            prepara para el mercado laboral, un mercado laboral que no genera empleo formal,
            informalidad que no permite acumular capital, falta de capital que impide educarse.
            Es un bucle. Y los bucles no se rompen buscando "la" causa \u2014 se rompen encontrando
            el punto de apalancamiento donde una intervenci\xF3n precisa desata un efecto cascada.
          </li>
          <li>
            <strong>Ignorar las consecuencias de segundo orden.</strong> Toda acci\xF3n tiene
            consecuencias directas (primer orden) y consecuencias indirectas (segundo orden).
            Las de primer orden son obvias. Las de segundo orden son las que te destruyen.
            Ejemplo: un gobierno congela precios para combatir la inflaci\xF3n (primer orden:
            los precios bajan). Segundo orden: los productores dejan de producir porque no
            les cierra el negocio. Tercer orden: hay desabastecimiento. Cuarto orden: aparece
            un mercado negro con precios m\xE1s altos que los originales. El "remedio" fue peor
            que la enfermedad \u2014 porque nadie pens\xF3 m\xE1s all\xE1 del primer movimiento.
          </li>
          <li>
            <strong>Dise\xF1ar sin datos.</strong> Proponemos soluciones desde la intuici\xF3n,
            desde la ideolog\xEDa, desde la indignaci\xF3n \u2014 sin medir flujos, incentivos ni
            resultados previos. "Hay que poner m\xE1s polic\xEDas" \u2014 \xBFmediste si m\xE1s polic\xEDas
            reduce el crimen o solo lo desplaza? "Hay que invertir m\xE1s en educaci\xF3n" \u2014
            \xBFmediste si el problema es la inversi\xF3n o es c\xF3mo se usa esa inversi\xF3n?
            La intuici\xF3n sin datos es adivinaci\xF3n. Y adivinar con la vida de millones
            de personas no es valent\xEDa \u2014 es irresponsabilidad.
          </li>
        </ol>

        <blockquote>
          Pensar como ingeniero social es hacerse responsable de los sistemas que alimentamos
          con nuestra atenci\xF3n, nuestro dinero y nuestro silencio \u2014 cada d\xEDa. No es una profesi\xF3n.
          Es una decisi\xF3n \xE9tica.
        </blockquote>

        <h2>El marco del ingeniero social: c\xF3mo ver lo invisible</h2>
        <p>
          Donella Meadows \u2014 una de las pensadoras sist\xE9micas m\xE1s brillantes del siglo XX \u2014
          defini\xF3 un sistema como "un conjunto de elementos interconectados que produce un
          patr\xF3n de comportamiento a lo largo del tiempo." Fijate: no dijo "un conjunto de
          problemas". Dijo "un patr\xF3n de comportamiento". Los sistemas no son buenos ni malos
          \u2014 producen resultados. Y si no te gustan los resultados, ten\xE9s que cambiar el dise\xF1o,
          no quejarte del resultado.
        </p>
        <p>
          Todo sistema tiene tres componentes que necesit\xE1s aprender a ver:
        </p>
        <ul>
          <li>
            <strong>Elementos:</strong> las partes visibles. En un sistema educativo: escuelas,
            docentes, estudiantes, curr\xEDculas, presupuesto. La mayor\xEDa de la gente solo ve esto.
            Y cuando quiere "arreglar la educaci\xF3n", mueve elementos: pone m\xE1s escuelas, cambia
            docentes, agrega materias. Casi nunca funciona \u2014 porque los elementos no son el
            problema.
          </li>
          <li>
            <strong>Interconexiones:</strong> las relaciones entre los elementos. C\xF3mo fluye
            la informaci\xF3n, c\xF3mo se distribuyen los incentivos, qui\xE9n responde ante qui\xE9n,
            qu\xE9 reglas gobiernan el comportamiento. Un docente brillante en un sistema que
            lo eval\xFAa por asistencia y no por impacto va a optimizar para asistencia, no
            para impacto. No porque sea mediocre \u2014 porque el sistema lo incentiva a serlo.
            Cambiar las interconexiones (los incentivos, las reglas, los flujos de informaci\xF3n)
            tiene mucho m\xE1s impacto que cambiar los elementos.
          </li>
          <li>
            <strong>Prop\xF3sito:</strong> la funci\xF3n que el sistema realmente cumple \u2014 no la que
            dice cumplir. Este es el nivel m\xE1s profundo y el m\xE1s inc\xF3modo. El sistema educativo
            argentino dice que su prop\xF3sito es "formar ciudadanos cr\xEDticos y creativos".
            Pero su dise\xF1o real \u2014 evaluaciones memor\xEDsticas, jerarqu\xEDa r\xEDgida, curr\xEDculas
            uniformes \u2014 produce obediencia, no creatividad. El prop\xF3sito real de un sistema
            se revela en sus resultados, no en su declaraci\xF3n de misi\xF3n. Si quer\xE9s saber
            para qu\xE9 est\xE1 dise\xF1ado un sistema, no leas su misi\xF3n \u2014 mir\xE1 qu\xE9 produce.
          </li>
        </ul>

        <h2>Los puntos de apalancamiento: d\xF3nde intervenir para que todo cambie</h2>
        <p>
          Meadows identific\xF3 una jerarqu\xEDa de puntos de intervenci\xF3n en un sistema, ordenados
          de menor a mayor impacto. La mayor\xEDa de la gente interviene en los puntos de menor
          impacto \u2014 y despu\xE9s se frustra porque "nada cambia". Ac\xE1 van los m\xE1s importantes,
          del menos al m\xE1s poderoso:
        </p>
        <ol>
          <li>
            <strong>N\xFAmeros y par\xE1metros:</strong> ajustar cantidades. M\xE1s presupuesto, m\xE1s
            polic\xEDas, m\xE1s subsidios. Es lo que hacen todos los gobiernos. Es lo que tiene
            menos impacto. Mover los n\xFAmeros sin cambiar la estructura es como subir el
            volumen de una canci\xF3n desafinada \u2014 suena m\xE1s fuerte, pero sigue desafinada.
          </li>
          <li>
            <strong>Bucles de retroalimentaci\xF3n:</strong> crear o fortalecer mecanismos que
            permitan al sistema corregirse a s\xED mismo. Ejemplo: si los ciudadanos pudieran
            ver en tiempo real c\xF3mo se gasta cada peso de sus impuestos, el comportamiento
            de los funcionarios cambiar\xEDa \u2014 no por virtud, sino por visibilidad. La
            transparencia es un bucle de retroalimentaci\xF3n. Y los bucles de retroalimentaci\xF3n
            son mucho m\xE1s poderosos que los presupuestos.
          </li>
          <li>
            <strong>Reglas del juego:</strong> cambiar los incentivos, las restricciones, las
            consecuencias. \xBFQui\xE9n puede hacer qu\xE9? \xBFQu\xE9 se premia y qu\xE9 se castiga? \xBFQui\xE9n
            rinde cuentas ante qui\xE9n? Cambiar las reglas cambia el comportamiento de todos
            los actores simult\xE1neamente \u2014 sin necesidad de convencer a cada uno individualmente.
          </li>
          <li>
            <strong>Poder de dise\xF1ar las reglas:</strong> m\xE1s poderoso que las reglas mismas
            es qui\xE9n tiene el poder de escribirlas. Si las reglas las escribe siempre el mismo
            grupo, el sistema siempre va a beneficiar a ese grupo. La democratizaci\xF3n del dise\xF1o
            institucional \u2014 que los ciudadanos participen en escribir las reglas, no solo en
            cumplirlas \u2014 es uno de los puntos de apalancamiento m\xE1s altos que existen.
          </li>
          <li>
            <strong>Paradigmas y modelos mentales:</strong> el punto de mayor apalancamiento.
            Los supuestos compartidos que nadie cuestiona porque "siempre fue as\xED". "La educaci\xF3n
            es sentarse en un aula a escuchar." "La pol\xEDtica es elegir un l\xEDder cada cuatro
            a\xF1os." "La econom\xEDa es un juego de suma cero." Cuando cambi\xE1s el paradigma, todo el
            sistema se reorganiza alrededor del nuevo supuesto. Es lo m\xE1s dif\xEDcil de cambiar \u2014
            y lo que m\xE1s impacto tiene cuando se logra.
          </li>
        </ol>

        <h2>Caso pr\xE1ctico: la inseguridad como sistema</h2>
        <p>
          Tomemos un ejemplo concreto para aplicar todo lo anterior. La inseguridad en Argentina.
          El enfoque de s\xEDntomas dice: "hay que poner m\xE1s polic\xEDas, endurecer las penas, bajar
          la edad de imputabilidad." Son intervenciones en los par\xE1metros \u2014 el nivel m\xE1s bajo
          de apalancamiento. La evidencia internacional muestra que m\xE1s polic\xEDas sin reforma
          institucional no reduce el crimen de forma sostenida, y que la severidad de las penas
          tiene un efecto disuasorio limitado cuando la probabilidad de ser atrapado es baja.
        </p>
        <p>
          El enfoque de sistemas pregunta diferente:
        </p>
        <ul>
          <li>\xBFQu\xE9 bucles de retroalimentaci\xF3n sostienen la inseguridad? Pobreza que limita
          oportunidades, falta de oportunidades que empuja a la informalidad, informalidad que
          debilita el tejido social, tejido social d\xE9bil que facilita el crimen, crimen que
          profundiza la pobreza. Es un ciclo que se refuerza a s\xED mismo.</li>
          <li>\xBFD\xF3nde est\xE1n las palancas? Tal vez en la educaci\xF3n temprana \u2014 la evidencia muestra
          que la inversi\xF3n en primera infancia tiene uno de los retornos sociales m\xE1s altos que
          existen. Tal vez en la justicia restaurativa \u2014 que en otros pa\xEDses redujo la
          reincidencia significativamente. Tal vez en el dise\xF1o urbano \u2014 ciudades mejor iluminadas,
          con espacios p\xFAblicos activos, reducen el crimen m\xE1s que patrullajes aleatorios.</li>
          <li>\xBFQui\xE9n dise\xF1a las reglas actuales? \xBFLos que sufren la inseguridad participan en el
          dise\xF1o de las pol\xEDticas de seguridad? \xBFO las dise\xF1an personas que viven en barrios
          cerrados y nunca tomaron un colectivo de noche?</li>
          <li>\xBFCu\xE1l es el paradigma que sostiene todo? "La seguridad es un problema policial."
          Ese paradigma limita las soluciones al \xE1mbito policial. Si cambi\xE1s el paradigma a
          "la seguridad es un resultado del dise\xF1o social" \u2014 de la educaci\xF3n, la econom\xEDa, el
          urbanismo, la justicia, la salud mental \u2014 se abre un universo de intervenciones que
          el paradigma anterior hac\xEDa invisibles.</li>
        </ul>

        <h2>Caso pr\xE1ctico: tu propia vida como sistema</h2>
        <p>
          No hace falta escalar a nivel pa\xEDs para practicar. Tu vida es un sistema. Y probablemente
          tiene s\xEDntomas recurrentes que est\xE1s tratando sin tocar la estructura que los produce.
        </p>
        <p>
          \xBFSiempre te falta tiempo? El s\xEDntoma es "no llego a nada". El sistema probablemente
          incluye: dificultad para decir que no (interconexi\xF3n social que te sobrecarga),
          ausencia de prioridades claras (falta de prop\xF3sito definido), y un entorno que premia
          la hiperactividad sobre la efectividad (paradigma cultural). Pod\xE9s seguir comprando
          agendas y bajando apps de productividad \u2014 eso es tratar el s\xEDntoma. O pod\xE9s redise\xF1ar
          las reglas: aprender a decir que no, definir tus tres prioridades no negociables,
          y salirte de los entornos que confunden estar ocupado con ser productivo.
        </p>
        <p>
          \xBFSiempre termin\xE1s en relaciones que te lastiman? El s\xEDntoma es el dolor. El sistema
          incluye tus criterios de selecci\xF3n, tus umbrales de tolerancia, los modelos relacionales
          que internalizaste, y las narrativas que te cont\xE1s sobre lo que "merec\xE9s". Cambiar de
          pareja sin cambiar el sistema es como cambiar de c\xE1rcel. El nuevo espacio puede ser
          diferente \u2014 pero segu\xEDs preso.
        </p>

        <h2>El m\xE9todo: siete pasos para pensar como ingeniero social</h2>
        <p>
          Ac\xE1 va un protocolo que pod\xE9s aplicar a cualquier problema \u2014 personal, organizacional
          o social. No es teor\xEDa: es una herramienta de trabajo.
        </p>
        <ol>
          <li>
            <strong>Nombrar el s\xEDntoma sin juzgarlo.</strong> Describ\xED lo que ves sin
            interpretarlo. "La gente renuncia a los 6 meses." "Los alumnos no aprenden."
            "Siempre me peleo con mi socio." Solo datos. Sin drama. Sin culpables.
          </li>
          <li>
            <strong>Preguntar "\xBFqu\xE9 produce esto?" cinco veces.</strong> La t\xE9cnica de los
            "5 por qu\xE9" de Toyota. Cada respuesta te lleva una capa m\xE1s profundo. "\xBFPor qu\xE9
            renuncia la gente?" Porque no se sienten valorados. "\xBFPor qu\xE9 no se sienten
            valorados?" Porque no hay feedback. "\xBFPor qu\xE9 no hay feedback?" Porque los l\xEDderes
            no fueron entrenados. "\xBFPor qu\xE9 no fueron entrenados?" Porque el sistema premia
            resultados individuales, no desarrollo de equipos. "\xBFPor qu\xE9 premia eso?" Porque
            las m\xE9tricas fueron dise\xF1adas para medir producci\xF3n, no retenci\xF3n. Ah\xED est\xE1 el
            sistema.
          </li>
          <li>
            <strong>Dibujar el mapa de interconexiones.</strong> Literalmente. Agarr\xE1 un papel
            y dibuj\xE1 los factores que encontraste conectados con flechas. Marc\xE1 los bucles
            \u2014 los ciclos que se refuerzan. Los bucles son donde vive el sistema. Si no los ves,
            no entend\xE9s el problema.
          </li>
          <li>
            <strong>Identificar qui\xE9n se beneficia del status quo.</strong> Todo sistema tiene
            beneficiarios. No necesariamente villanos \u2014 a veces son personas bien intencionadas
            que simplemente se adaptaron a las reglas existentes. Pero si no sab\xE9s qui\xE9n gana
            con que nada cambie, no vas a entender por qu\xE9 nada cambia. Segu\xED el incentivo.
            Siempre.
          </li>
          <li>
            <strong>Encontrar el punto de apalancamiento.</strong> De todos los factores que
            mapeaste, \xBFcu\xE1l es el que, si lo mov\xE9s, arrastra a varios otros? Ese es tu palanca.
            No es necesariamente el m\xE1s obvio \u2014 de hecho, casi nunca lo es. La palanca suele
            estar en las interconexiones o en las reglas, no en los elementos.
          </li>
          <li>
            <strong>Dise\xF1ar un prototipo m\xEDnimo.</strong> No un plan perfecto \u2014 un experimento.
            Algo que puedas probar en 30 d\xEDas o menos, con resultados medibles. La velocidad
            de aprendizaje vence a la perfecci\xF3n del dise\xF1o. Siempre. Un prototipo feo que te
            ense\xF1a algo vale m\xE1s que un plan brillante que nunca se ejecuta.
          </li>
          <li>
            <strong>Medir, aprender, iterar.</strong> \xBFFuncion\xF3? \xBFQu\xE9 aprendiste? \xBFQu\xE9 no viste?
            Ajust\xE1 y volv\xE9 a probar. Los sistemas complejos no se resuelven de una \u2014 se navegan.
            Cada iteraci\xF3n te acerca al dise\xF1o correcto. Cada "fracaso" es un dato nuevo.
          </li>
        </ol>

        <blockquote>
          No necesit\xE1s tener todas las respuestas para empezar. Necesit\xE1s tener mejores preguntas.
          Y la mejor pregunta que pod\xE9s hacerte frente a cualquier problema es esta:
          "\xBFQu\xE9 dise\xF1o est\xE1 produciendo este resultado?" Cuando encontr\xE9s la respuesta,
          dej\xE1s de ser v\xEDctima del sistema y te convert\xEDs en su arquitecto.
        </blockquote>

        <h2>Por qu\xE9 Argentina necesita ingenieros sociales \u2014 no m\xE1s h\xE9roes</h2>
        <p>
          Llevamos d\xE9cadas esperando al l\xEDder que nos salve. Al presidente correcto, al ministro
          iluminado, al juez incorruptible. Y cada vez que depositamos esa esperanza en una persona,
          el resultado es el mismo: decepci\xF3n. No porque las personas sean malas \u2014 porque ninguna
          persona puede vencer un mal sistema. Un presidente brillante operando dentro de un sistema
          institucional roto va a producir resultados rotos. Es matem\xE1tica, no traici\xF3n.
        </p>
        <p>
          Lo que Argentina necesita no es un h\xE9roe \u2014 es un mill\xF3n de personas que piensen como
          ingenieros sociales. Personas que dejen de se\xF1alar culpables y empiecen a redise\xF1ar
          procesos. Que dejen de quejarse de los resultados y empiecen a modificar los dise\xF1os
          que los producen. Que entiendan que cada sistema fue dise\xF1ado por alguien \u2014 y que si
          fue dise\xF1ado, puede ser redise\xF1ado. Por nosotros. Ahora.
        </p>
        <p>
          No necesit\xE1s un cargo pol\xEDtico para ser ingeniero social. Pod\xE9s redise\xF1ar la din\xE1mica
          de tu familia, la cultura de tu equipo de trabajo, las reglas de tu comunidad de
          vecinos, el funcionamiento de la cooperadora de la escuela de tus hijos. Cada sistema
          peque\xF1o que redise\xF1\xE1s es un prototipo de los sistemas grandes que necesitamos cambiar.
          Y cada persona que aprende a ver sistemas en lugar de s\xEDntomas es una persona menos
          que va a caer en la trampa del pr\xF3ximo mes\xEDas.
        </p>

        <h2>Checklist del ingeniero social \u2014 para usar todos los d\xEDas</h2>
        <p>
          Imprim\xED esto. Pegalo donde lo veas. Usalo antes de opinar, antes de proponer,
          antes de indignarte:
        </p>
        <ul>
          <li>\xBFEstoy viendo un s\xEDntoma o un sistema?</li>
          <li>\xBFEstoy atacando a una persona o a un proceso?</li>
          <li>\xBFPens\xE9 en las consecuencias de segundo y tercer orden?</li>
          <li>\xBFQui\xE9n gana si todo sigue exactamente igual?</li>
          <li>\xBFQu\xE9 informaci\xF3n me falta para tomar una decisi\xF3n mejor?</li>
          <li>\xBFQu\xE9 h\xE1bito personal m\xEDo alimenta el s\xEDntoma que critico?</li>
          <li>\xBFD\xF3nde est\xE1 la palanca \u2014 el punto donde un cambio peque\xF1o arrastra varios otros?</li>
          <li>\xBFPuedo probar mi idea en peque\xF1o antes de escalarla?</li>
        </ul>

        <h2>Cinco ejercicios para entrenar tu visi\xF3n sist\xE9mica esta semana</h2>
        <ol>
          <li>
            <strong>El diario de patrones:</strong> durante 7 d\xEDas, cada noche escrib\xED un
            problema que observaste y preguntate: "\xBFEsto es un evento aislado o es un patr\xF3n
            que se repite?" Si se repite, hay un sistema detr\xE1s. Nombralo.
          </li>
          <li>
            <strong>El mapa de causas:</strong> eleg\xED un s\xEDntoma que te moleste \u2014 en tu vida,
            en tu trabajo, en tu pa\xEDs \u2014 y dibuj\xE1 al menos siete factores que lo sostienen.
            Conectalos con flechas. Busc\xE1 los bucles. Vas a ver que el s\xEDntoma es solo la
            punta del iceberg.
          </li>
          <li>
            <strong>La pregunta del beneficiario:</strong> ante cualquier problema persistente,
            preguntate: "\xBFQui\xE9n gana con que esto siga as\xED?" No para buscar un villano \u2014 para
            entender la estructura de incentivos. Si nadie ganara, ya se habr\xEDa resuelto.
          </li>
          <li>
            <strong>El prototipo de 30 d\xEDas:</strong> eleg\xED un sistema peque\xF1o que puedas
            redise\xF1ar (tu rutina matinal, las reuniones de tu equipo, la organizaci\xF3n de tu
            hogar). Cambi\xE1 una regla. Una sola. Med\xED qu\xE9 pasa durante 30 d\xEDas. Document\xE1
            lo que aprend\xE9s.
          </li>
          <li>
            <strong>La conversaci\xF3n sist\xE9mica:</strong> la pr\xF3xima vez que alguien se queje de
            algo, en lugar de sumar tu queja, pregunt\xE1: "\xBFQu\xE9 regla o proceso produce este
            resultado?" Vas a ver c\xF3mo cambia la conversaci\xF3n \u2014 de la impotencia al dise\xF1o.
          </li>
        </ol>

        <h2>La invitaci\xF3n</h2>
        <p>
          No te estoy pidiendo que cambies el mundo ma\xF1ana. Te estoy pidiendo que cambies la
          forma en que lo mir\xE1s \u2014 hoy. Porque cuando dej\xE1s de ver eventos aislados y empez\xE1s
          a ver los sistemas que los producen, algo irreversible ocurre en tu mente: dej\xE1s de
          sentirte v\xEDctima y empez\xE1s a sentirte arquitecto. Dej\xE1s de esperar que alguien
          resuelva las cosas y empez\xE1s a preguntarte c\xF3mo redise\xF1arlas vos.
        </p>
        <p>
          Eso es ingenier\xEDa social. No es manipulaci\xF3n \u2014 es responsabilidad. No es control \u2014
          es dise\xF1o. No es arrogancia \u2014 es la humildad de aceptar que los sistemas que nos
          gobiernan fueron creados por personas como nosotros, y que personas como nosotros
          podemos recrearlos. Mejor.
        </p>

        <blockquote>
          La ingenier\xEDa social no es una profesi\xF3n: es la decisi\xF3n de dejar de quejarte
          del incendio y sentarte a redise\xF1ar la instalaci\xF3n el\xE9ctrica. No ma\xF1ana. Hoy.
          Porque mientras vos dud\xE1s, el sistema sigue funcionando. Y cada d\xEDa que funciona
          sin que lo cuestiones, se fortalece. La pregunta no es si ten\xE9s permiso para
          redise\xF1arlo. La pregunta es si pod\xE9s seguir viviendo sin hacerlo.
        </blockquote>
      </article>
    `
      },
      [slugify("La Amabilidad como Estrategia de Transformaci\xF3n")]: {
        excerpt: "\xBFC\xF3mo sostengo la firmeza sin perder humanidad? Este vlog muestra la amabilidad como plan t\xE1ctico para transformar espacios hostiles en laboratorios de cooperaci\xF3n \u2014 antes de que termine el d\xEDa.",
        content: `
      <article>
        <h1>La Amabilidad como Estrategia de Transformaci\xF3n</h1>
        <p>
          \xBFC\xF3mo sostengo la firmeza sin perder humanidad? Esa es la pregunta que m\xE1s me hacen \u2014 y la que
          m\xE1s me hago a m\xED mismo. Porque en un contexto argentino donde la dureza se confunde con fortaleza
          y la amabilidad con debilidad, sostener ambas al mismo tiempo parece imposible.
          Pero no lo es. La amabilidad estrat\xE9gica es la respuesta: no esconde los problemas, los expone
          con precisi\xF3n quir\xFArgica. No evita el conflicto \u2014 lo dise\xF1a para que produzca soluciones
          en lugar de heridas.
        </p>

        <h2>Manifiesto de la amabilidad estrat\xE9gica</h2>
        <ul>
          <li><strong>Claridad radical:</strong> la amabilidad no disfraza los problemas. Los ilumina con respeto para que se puedan resolver, no para que se toleren.</li>
          <li><strong>Conflicto creativo:</strong> dise\xF1a conversaciones donde el desacuerdo genera soluciones nuevas \u2014 en lugar de ganadores y perdedores.</li>
          <li><strong>Regulaci\xF3n emocional:</strong> evita que el enojo secuestre la visi\xF3n de largo plazo. Firmeza sin furia. Exigencia sin desprecio. Nelson Mandela lo practic\xF3 durante 27 a\xF1os de prisi\xF3n: cuando sali\xF3, eligi\xF3 la reconciliaci\xF3n estrat\xE9gica en lugar de la venganza leg\xEDtima. No porque fuera d\xE9bil \u2014 porque entend\xEDa que solo la firmeza amable pod\xEDa reconstruir un pa\xEDs. Sud\xE1frica no se transform\xF3 con furia: se transform\xF3 con dise\xF1o.</li>
        </ul>

        <blockquote>
          La amabilidad estrat\xE9gica es el arte de decir verdades dif\xEDciles de un modo
          que invite a colaborar en la soluci\xF3n \u2014 no a huir de la conversaci\xF3n.
        </blockquote>

        <h2>Tres ejercicios para antes de que termine el d\xEDa</h2>
        <ol>
          <li><strong>Mapa de relaciones:</strong> identific\xE1 hoy un v\xEDnculo que merece una conversaci\xF3n amable y valiente. Escrib\xED el nombre. Defin\xED cu\xE1ndo va a ser.</li>
          <li><strong>Guion consciente:</strong> prepar\xE1 tres frases que reconozcan al otro antes de plantear el desaf\xEDo. "Valoro que..." / "Entiendo que..." / "Necesito que hablemos de..."</li>
          <li><strong>Cierre con compromiso:</strong> defin\xED un acuerdo concreto, una fecha de revisi\xF3n y una m\xE9trica simple. Sin esto, la conversaci\xF3n fue catarsis, no dise\xF1o.</li>
        </ol>

        <h2>\xBFC\xF3mo sab\xE9s que est\xE1 funcionando?</h2>
        <p>Med\xED el impacto de tu amabilidad estrat\xE9gica con tres indicadores simples:</p>
        <ul>
          <li>Cantidad de acuerdos alcanzados sin desgaste emocional esta semana.</li>
          <li>Personas nuevas que se sumaron a tu iniciativa despu\xE9s de una conversaci\xF3n \u2014 no de un discurso.</li>
          <li>Nivel de claridad colectiva despu\xE9s de cada interacci\xF3n: \xBFla gente sale sabiendo qu\xE9 hacer?</li>
        </ul>

        <blockquote>
          La amabilidad estrat\xE9gica no es un regalo que le hac\xE9s a los dem\xE1s.
          Es la arquitectura que constru\xEDs para que lo mejor de cada persona tenga donde desplegarse.
          Y cuando lo entend\xE9s as\xED, algo cambia para siempre: dej\xE1s de necesitar que el mundo
          sea amable con vos para ser amable con el mundo. Esa independencia es el verdadero poder.
        </blockquote>
      </article>
    `
      },
      [slugify("Aprender para Ser Libres: La Educaci\xF3n como Acto de Soberan\xEDa")]: {
        excerpt: "Cada vez que alguien aprende algo que el sistema no le ense\xF1\xF3, se produce un acto de soberan\xEDa silenciosa. La educaci\xF3n autodirigida no es un lujo: es la herramienta m\xE1s poderosa que ten\xE9s para redise\xF1ar tu realidad \u2014 y la de tu pa\xEDs.",
        content: `
      <article>
        <h1>Aprender para Ser Libres: La Educaci\xF3n como Acto de Soberan\xEDa</h1>
        <p>
          Cada vez que alguien aprende algo que el sistema no le ense\xF1\xF3, se produce un acto de soberan\xEDa silenciosa.
          No hace falta un t\xEDtulo, un aula ni un permiso. Hace falta una decisi\xF3n: la de dejar de esperar que te ense\xF1en
          lo que necesit\xE1s y salir a buscarlo por tu cuenta. Esa decisi\xF3n \u2014 repetida, sostenida, compartida \u2014 es el acto
          m\xE1s subversivo y m\xE1s constructivo que un ciudadano puede realizar. Porque cuando aprend\xE9s por decisi\xF3n propia,
          no est\xE1s consumiendo informaci\xF3n: est\xE1s redise\xF1ando qui\xE9n sos. Y cuando millones hacen lo mismo, lo que se
          redise\xF1a no es una persona \u2014 es un pa\xEDs.
        </p>

        <h2>El sistema que nos dieron vs. el que necesitamos</h2>
        <p>
          La educaci\xF3n argentina fue dise\xF1ada para la obediencia, no para la agencia. Se dise\xF1\xF3 para producir empleados
          que siguieran instrucciones, no ciudadanos capaces de cuestionar, crear y redise\xF1ar su realidad. Esto no es
          opini\xF3n: es resultado de dise\xF1o. Los datos de PISA muestran que Argentina se ubica consistentemente por debajo
          del promedio de la OCDE en m\xE9tricas de pensamiento cr\xEDtico. No porque nuestros estudiantes sean incapaces \u2014
          porque el sistema nunca fue dise\xF1ado para desarrollar esa capacidad.
        </p>
        <p>
          Mir\xE1 lo que pasa cuando otros pa\xEDses eligen dise\xF1ar diferente. Finlandia invirti\xF3 en curr\xEDculas de pensamiento
          cr\xEDtico y vio aumentos medibles en participaci\xF3n c\xEDvica en una sola generaci\xF3n. Singapur redise\xF1\xF3 su educaci\xF3n
          alrededor de la resoluci\xF3n de problemas y pas\xF3 de tercer mundo a primer mundo en una generaci\xF3n. Estos no son
          milagros: son resultados documentados de decisiones de dise\xF1o.
        </p>
        <p>
          Y mientras tanto, la tasa de deserci\xF3n universitaria en Argentina ronda el 52%. No porque los estudiantes sean
          vagos o incapaces \u2014 porque el sistema nunca fue dise\xF1ado para que tengan \xE9xito. Fue dise\xF1ado para filtrar, no
          para formar. Para clasificar, no para potenciar.
        </p>

        <h2>Tres verdades que el sistema educativo no te ense\xF1a</h2>
        <ol>
          <li>
            <strong>Aprender a aprender es la \xFAnica habilidad que nunca se vuelve obsoleta.</strong> El Foro Econ\xF3mico
            Mundial la lista como la habilidad n\xFAmero uno para el futuro del trabajo. Cada tecnolog\xEDa caduca, cada dato
            se actualiza \u2014 pero la capacidad de aprender lo que necesit\xE1s, cuando lo necesit\xE1s, es eterna.
          </li>
          <li>
            <strong>Tu educaci\xF3n m\xE1s valiosa ocurre fuera de las aulas.</strong> Seg\xFAn investigaciones del Center for
            Creative Leadership, el 70% del aprendizaje profesional es informal \u2014 conversaciones, proyectos, errores,
            mentores, libros elegidos por curiosidad genuina. El aula es solo el 10%. El otro 20% viene de relaciones
            de mentor\xEDa. Si est\xE1s esperando que un programa formal te ense\xF1e lo que necesit\xE1s, est\xE1s ignorando el 90%
            de tu potencial de aprendizaje.
          </li>
          <li>
            <strong>Una sola persona que aprende profundamente y comparte libremente genera m\xE1s impacto que una
            burocracia entera.</strong> Wikipedia fue construida por voluntarios y rivaliza en precisi\xF3n con la
            Encyclopaedia Britannica. El software de c\xF3digo abierto, creado por comunidades autoorganizadas, sostiene
            la infraestructura digital del mundo. El conocimiento compartido no se divide \u2014 se multiplica.
          </li>
        </ol>

        <h2>Dise\xF1\xE1 tu propia universidad</h2>
        <p>
          No necesit\xE1s que nadie te d\xE9 permiso. Necesit\xE1s un marco de acci\xF3n. Ac\xE1 va uno que funciona:
        </p>
        <ol>
          <li><strong>Identific\xE1 el sistema que quer\xE9s redise\xF1ar.</strong> \xBFQu\xE9 problema te quita el sue\xF1o? \xBFQu\xE9 realidad mir\xE1s todos los d\xEDas sabiendo que podr\xEDa ser diferente?</li>
          <li><strong>Mape\xE1 las 5 habilidades que necesit\xE1s para intervenir en ese sistema.</strong> No las que te dijeron que necesit\xE1s \u2014 las que realmente hacen falta para mover esa palanca.</li>
          <li><strong>Encontr\xE1 mentores, libros, comunidades y campos de pr\xE1ctica para cada una.</strong> Un mentor que ya hizo lo que quer\xE9s hacer. Un libro que condense d\xE9cadas de aprendizaje. Una comunidad que te sostenga. Un espacio donde puedas practicar sin miedo a equivocarte.</li>
          <li><strong>Arm\xE1 un sprint de aprendizaje de 90 d\xEDas con resultados medibles.</strong> No "voy a aprender sobre econom\xEDa" \u2014 "en 90 d\xEDas voy a poder leer un balance, armar un presupuesto comunitario y presentar un proyecto a una cooperativa de mi barrio."</li>
          <li><strong>Ense\xF1\xE1 lo que aprend\xE9s.</strong> Ense\xF1ar es la forma m\xE1s profunda de aprender. Cuando ten\xE9s que explicarle algo a otro, descubr\xEDs lo que realmente entend\xE9s y lo que solo cre\xEDas entender.</li>
        </ol>

        <h2>Tres microacciones para esta semana</h2>
        <ul>
          <li><strong>Empez\xE1 un c\xEDrculo de lectura con 2 o 3 personas.</strong> Un libro, una conversaci\xF3n. No hace falta m\xE1s. La inteligencia colectiva empieza con una mesa chica y una pregunta honesta.</li>
          <li><strong>Ense\xF1ale a alguien hoy lo que aprendiste ayer.</strong> No importa si es grande o chico. El acto de compartir solidifica tu conocimiento y multiplica su alcance.</li>
          <li><strong>Escrib\xED un "curr\xEDculum de libertad":</strong> las 5 cosas que necesit\xE1s aprender para convertirte en quien decidiste ser. No lo que el mercado te dice que necesit\xE1s \u2014 lo que tu proyecto de vida te exige.</li>
        </ul>

        <blockquote>
          Cuando aprend\xE9s por decisi\xF3n propia, no est\xE1s estudiando: est\xE1s eligiendo qui\xE9n vas a ser.
          Y esa elecci\xF3n, repetida por millones de personas que se niegan a esperar permiso, es el \xFAnico
          plan de gobierno que nunca nos van a poder revocar. La soberan\xEDa no empieza en las urnas \u2014
          empieza en la pregunta que decid\xEDs hacerte hoy.
        </blockquote>
      </article>
    `
      },
      [slugify("La Ciencia de la Confianza: El Capital que Nadie Mide pero Todos Necesitan")]: {
        excerpt: "Argentina tiene uno de los \xEDndices de confianza interpersonal m\xE1s bajos del continente. Y sin embargo, cada crisis la reconstruyen las redes vecinales, no los decretos. La confianza no es un sentimiento: es infraestructura. Y se puede dise\xF1ar.",
        content: `
      <article>
        <h1>La Ciencia de la Confianza: El Capital que Nadie Mide pero Todos Necesitan</h1>
        <p>
          Hay una paradoja argentina que nadie termina de explicar. Seg\xFAn el Latinobar\xF3metro, Argentina tiene
          consistentemente uno de los \xEDndices de confianza interpersonal e institucional m\xE1s bajos de la regi\xF3n.
          Desconfiamos de los pol\xEDticos, de los bancos, de las instituciones, de los vecinos que no conocemos.
          Y sin embargo \u2014 y ac\xE1 est\xE1 la paradoja \u2014 cada vez que el pa\xEDs se derrumba, la reconstrucci\xF3n no la
          hacen los decretos. La hacen las redes vecinales.
        </p>
        <p>
          En 2001, cuando las instituciones colapsaron, los vecinos formaron asambleas, redes de trueque,
          empresas cooperativas. Cuando la pandemia cerr\xF3 todo, fueron los comedores comunitarios y las redes
          de WhatsApp barriales los que sostuvieron a millones. Esa solidaridad no fue magia \u2014 fue capital
          social dormido que se activ\xF3 bajo presi\xF3n. La pregunta que nos debemos no es "\xBFpor qu\xE9 desconfiamos?"
          sino "\xBFc\xF3mo dise\xF1amos sistemas donde esa solidaridad latente no necesite una cat\xE1strofe para activarse?"
        </p>

        <h2>Lo que la ciencia dice \u2014 y que deber\xEDamos escuchar</h2>
        <p>
          Robert Putnam dedic\xF3 d\xE9cadas a investigar el capital social \u2014 la densidad de redes de confianza en una
          comunidad. Su conclusi\xF3n es demoledora: el capital social predice la prosperidad comunitaria mejor que
          las pol\xEDticas econ\xF3micas solas. Las comunidades donde la gente conf\xEDa entre s\xED son m\xE1s pr\xF3speras, m\xE1s
          sanas, m\xE1s seguras y m\xE1s innovadoras que las comunidades con los mismos recursos pero menor confianza.
        </p>
        <p>
          El Banco Mundial estima que las sociedades de baja confianza pierden un porcentaje significativo de su
          PBI en costos de transacci\xF3n \u2014 cada contrato necesita m\xE1s abogados, cada acuerdo necesita m\xE1s garant\xEDas,
          cada proyecto tarda m\xE1s en arrancar. Desconfiar es car\xEDsimo. No solo emocionalmente \u2014 econ\xF3micamente.
        </p>
        <p>
          Las sociedades de alta confianza \u2014 los pa\xEDses n\xF3rdicos, Jap\xF3n \u2014 no conf\xEDan porque sean ingenuos. Conf\xEDan
          porque dise\xF1aron sistemas donde ser confiable es la opci\xF3n racional. Reglas claras, consecuencias visibles,
          transparencia como norma. La confianza no es un sentimiento que se pide \u2014 es un resultado que se dise\xF1a.
        </p>
        <p>
          La teor\xEDa de juegos lo confirma: en los torneos de Robert Axelrod, donde programas compet\xEDan en dilemas
          del prisionero repetidos, las estrategias cooperativas superaron consistentemente a las explotadoras.
          La confianza no es debilidad \u2014 es matem\xE1tica evolutiva.
        </p>

        <h2>Por qu\xE9 desconfiamos \u2014 y el costo real</h2>
        <p>
          D\xE9cadas de traici\xF3n institucional dejaron su marca. El corralito, la inflaci\xF3n cr\xF3nica que erosiona
          ahorros, las promesas pol\xEDticas rotas, las reglas que cambian a mitad del juego. Cada traici\xF3n no solo
          lastima a la v\xEDctima directa \u2014 le ense\xF1a a toda la sociedad que confiar es peligroso.
        </p>
        <p>
          El costo es brutal: duplicamos esfuerzo, nos sobreprotegemos, subcolaboramos, nos movemos m\xE1s lento
          que pa\xEDses con la mitad de nuestro talento. Argentina tiene m\xE1s abogados per c\xE1pita que casi cualquier
          pa\xEDs del mundo \u2014 y eso no es un signo de sofisticaci\xF3n jur\xEDdica. Es un s\xEDntoma de desconfianza
          sist\xE9mica. Necesitamos contratos blindados porque no confiamos en que el otro va a cumplir.
        </p>

        <h2>Ingenier\xEDa de la confianza: tres capas</h2>
        <ul>
          <li>
            <strong>Micro-confianza:</strong> cumpl\xED promesas peque\xF1as. Lleg\xE1 a horario. Hac\xE9 lo que dijiste que
            ibas a hacer. Devolv\xE9 lo que te prestaron. Estos actos parecen triviales, pero son los ladrillos con
            los que se reconstruye la confianza \u2014 una interacci\xF3n a la vez. Lo aburrido es lo que funciona.
          </li>
          <li>
            <strong>Meso-confianza:</strong> reglas transparentes en organizaciones. Rendici\xF3n de cuentas visible.
            Datos compartidos abiertamente. Decisiones explicadas. Cuando la gente entiende por qu\xE9 se tom\xF3 una
            decisi\xF3n \u2014 aunque no est\xE9 de acuerdo \u2014 la confianza institucional crece.
          </li>
          <li>
            <strong>Macro-confianza:</strong> monitoreo c\xEDvico basado en datos. Gobierno abierto con datos
            accesibles. Auditor\xEDas comunitarias que hagan visible el comportamiento institucional para todos.
            La confianza a escala no se pide \u2014 se verifica.
          </li>
        </ul>

        <h2>Tres microacciones para hoy</h2>
        <ol>
          <li><strong>Hac\xE9 una promesa peque\xF1a hoy y cumplila de manera visible.</strong> No ma\xF1ana. Hoy. Que alguien vea que dijiste algo y lo hiciste.</li>
          <li><strong>Preguntale a alguien: "\xBFQu\xE9 necesitar\xEDas para confiar m\xE1s en este proyecto?"</strong> No asumas que sab\xE9s la respuesta. Pregunt\xE1 y escuch\xE1.</li>
          <li><strong>Cre\xE1 un ritual de transparencia en tu equipo.</strong> Compart\xED un n\xFAmero, un resultado o un proceso de decisi\xF3n que hasta ahora era opaco. La transparencia es la materia prima de la confianza.</li>
        </ol>

        <blockquote>
          La confianza no se recupera con discursos ni con buenas intenciones: se reconstruye con un mill\xF3n
          de promesas peque\xF1as cumplidas, una por una, hasta que la excepci\xF3n vuelva a ser romperlas. Y cuando
          eso pase \u2014 cuando confiar vuelva a ser lo normal \u2014 vas a entender que no era ingenuidad. Era la
          ingenier\xEDa m\xE1s sofisticada que existe: dise\xF1ar un mundo donde cooperar sea m\xE1s f\xE1cil que competir.
        </blockquote>
      </article>
    `
      },
      [slugify("Por Qu\xE9 Nos Resistimos a Cambiar: La Psicolog\xEDa de la Transformaci\xF3n")]: {
        excerpt: "Sab\xE9s que ten\xE9s que cambiar. Sab\xE9s c\xF3mo. Sab\xE9s por qu\xE9. Y aun as\xED, ma\xF1ana vas a hacer exactamente lo mismo que hoy. No es pereza: es neurolog\xEDa. Y entenderla es el primer paso para dise\xF1ar a su favor.",
        content: `
      <article>
        <h1>Por Qu\xE9 Nos Resistimos a Cambiar: La Psicolog\xEDa de la Transformaci\xF3n</h1>
        <p>
          Sab\xE9s que ten\xE9s que cambiar. Sab\xE9s c\xF3mo. Sab\xE9s por qu\xE9. Y aun as\xED, ma\xF1ana vas a hacer exactamente
          lo mismo que hoy. No es pereza. No es cobard\xEDa. Es neurolog\xEDa. Tu cerebro fue dise\xF1ado para proteger
          lo conocido \u2014 porque durante miles de a\xF1os, lo desconocido pod\xEDa matarte. Ese software sigue corriendo.
          Y si no lo entend\xE9s, va a sabotear cada intento de transformaci\xF3n que hagas \u2014 personal, organizacional
          o nacional.
        </p>

        <h2>Lo que la ciencia ya demostr\xF3</h2>
        <p>
          Daniel Kahneman demostr\xF3 que la aversi\xF3n a la p\xE9rdida es una de las fuerzas m\xE1s poderosas del
          comportamiento humano: las p\xE9rdidas se sienten aproximadamente el doble de intensas que las ganancias
          equivalentes. Por eso nos aferramos a lo que tenemos incluso cuando lo que podr\xEDamos ganar es
          objetivamente mejor. No es irracionalidad \u2014 es un sesgo evolutivo que serv\xEDa para sobrevivir en la
          sabana y que ahora nos paraliza frente al cambio.
        </p>
        <p>
          El sesgo del status quo \u2014 documentado extensamente en econom\xEDa conductual \u2014 hace que prefiramos el
          estado actual incluso cuando las alternativas son superiores, simplemente porque lo actual es familiar.
          No elegimos quedarnos igual: defaulteamos a quedarnos igual.
        </p>
        <p>
          Charles Duhigg y BJ Fogg demostraron que entre el 40% y el 45% de nuestras acciones diarias son
          habituales, no deliberadas. No est\xE1s eligiendo seguir igual \u2014 tu cerebro est\xE1 ejecutando un script
          de piloto autom\xE1tico. La mayor parte de tu d\xEDa no es decisi\xF3n: es repetici\xF3n.
        </p>
        <p>
          La curva de cambio de K\xFCbler-Ross \u2014 negaci\xF3n, resistencia, exploraci\xF3n, compromiso \u2014 se aplica no
          solo a individuos sino a organizaciones y sociedades enteras. Toda reforma, toda transformaci\xF3n,
          golpea contra el valle de resistencia. Las que sobreviven son las que fueron dise\xF1adas para atravesarlo
          \u2014 no para evitarlo.
        </p>

        <h2>Por qu\xE9 Argentina cicla entre entusiasmo y desilusi\xF3n</h2>
        <p>
          No dise\xF1amos para la fase de resistencia que es predecible. Cada nuevo gobierno, cada reforma, cada
          iniciativa social asume que si la l\xF3gica es lo suficientemente buena, la gente simplemente va a
          cumplir. No lo va a hacer. No porque sea mala \u2014 porque es humana.
        </p>
        <p>
          El resultado: arrancamos con pasi\xF3n, golpeamos contra el valle de resistencia, lo interpretamos como
          fracaso, abandonamos el esfuerzo y empezamos el ciclo de nuevo. Una y otra vez. Generaci\xF3n tras
          generaci\xF3n. El problema no es la idea \u2014 es el dise\xF1o de la transici\xF3n. Nadie dise\xF1a para el valle.
          Y el valle es donde mueren todas las transformaciones argentinas.
        </p>

        <h2>Dise\xF1o para humanos reales \u2014 no para \xE1ngeles</h2>
        <p>
          Si quer\xE9s que el cambio sobreviva, dise\xF1alo para el ser humano que realmente existe \u2014 no para el que
          te gustar\xEDa que existiera. Cuatro principios:
        </p>
        <ol>
          <li>
            <strong>Hac\xE9 que el primer paso sea absurdamente peque\xF1o.</strong> BJ Fogg demostr\xF3 con su m\xE9todo
            de "tiny habits" que la acci\xF3n precede a la motivaci\xF3n, no al rev\xE9s. No esper\xE9s estar motivado para
            actuar \u2014 actu\xE1 en peque\xF1o y la motivaci\xF3n viene despu\xE9s. \xBFQuer\xE9s hacer ejercicio? No te propongas
            una hora de gimnasio: proponete ponerte las zapatillas. Eso es todo. El resto viene solo.
          </li>
          <li>
            <strong>Hac\xE9 visible y personal el costo de la inacci\xF3n.</strong> No estad\xEDsticas abstractas \u2014 "si
            nada cambia, ESTO es lo que tu vida parece en 5 a\xF1os." Nombres, caras, consecuencias concretas.
            El cerebro no reacciona a abstracciones: reacciona a im\xE1genes v\xEDvidas de p\xE9rdida personal.
          </li>
          <li>
            <strong>Cre\xE1 rendici\xF3n de cuentas social.</strong> Las investigaciones muestran que el compromiso
            p\xFAblico aumenta el cumplimiento en aproximadamente un 65%. Contale a alguien lo que vas a hacer.
            No por presi\xF3n \u2014 por dise\xF1o. Cuando alguien sabe lo que prometiste, el costo de no cumplir se
            vuelve real.
          </li>
          <li>
            <strong>Celebr\xE1 el medio feo.</strong> Normaliz\xE1 que la transformaci\xF3n se siente peor antes de
            sentirse mejor. El valle de resistencia no es fracaso \u2014 es evidencia de que el cambio es real. Si
            no te duele, probablemente no est\xE1s cambiando nada importante.
          </li>
        </ol>

        <h2>Tres microacciones para hoy</h2>
        <ul>
          <li><strong>Identific\xE1 un cambio que ven\xEDs resistiendo. Ahora hac\xE9 el primer paso un 80% m\xE1s chico.</strong> Hac\xE9 eso en lugar de lo que te hab\xEDas propuesto. Ma\xF1ana hac\xE9 un poquito m\xE1s.</li>
          <li><strong>Contale a una persona lo que vas a hacer ma\xF1ana.</strong> Una persona real, un compromiso concreto. Sin escapatoria.</li>
          <li><strong>Escrib\xED en un p\xE1rrafo lo que te va a costar quedarte exactamente igual durante 5 a\xF1os.</strong> Leelo en voz alta. Si no te incomoda, no fuiste honesto.</li>
        </ul>

        <blockquote>
          No resistimos el cambio porque seamos cobardes. Resistimos porque nuestro cerebro fue dise\xF1ado
          para proteger lo conocido. Pero ac\xE1 est\xE1 el secreto que nadie te dice: ese mismo cerebro tambi\xE9n
          fue dise\xF1ado para adaptarse a lo que se repite. Repet\xED la acci\xF3n correcta suficientes veces, y lo
          que hoy es esfuerzo ma\xF1ana ser\xE1 identidad. La transformaci\xF3n no es un salto heroico. Es una
          repetici\xF3n sagrada \u2014 hasta que lo extraordinario se vuelva lo normal.
        </blockquote>
      </article>
    `
      },
      [slugify("Inteligencia Colectiva: Por Qu\xE9 Juntos Pensamos Mejor de lo que Creemos")]: {
        excerpt: "Un grupo de personas comunes, con buenas reglas y buena informaci\xF3n, toma mejores decisiones que un experto solo. Esto no es idealismo: es matem\xE1tica. Y si lo dise\xF1amos bien, es el recurso m\xE1s poderoso que tiene Argentina.",
        content: `
      <article>
        <h1>Inteligencia Colectiva: Por Qu\xE9 Juntos Pensamos Mejor de lo que Creemos</h1>
        <p>
          En 1906, Francis Galton le pidi\xF3 a 800 personas en una feria rural que estimaran el peso de un buey.
          Nadie acert\xF3 individualmente. Pero el promedio de todas las estimaciones err\xF3 por menos del 1%.
          Ochocientas personas equivocadas, juntas, fueron m\xE1s precisas que cualquier experto. Esto no es
          una an\xE9cdota curiosa \u2014 es el fundamento matem\xE1tico de la inteligencia colectiva. Y cambia todo
          sobre c\xF3mo deber\xEDamos dise\xF1ar nuestras instituciones.
        </p>

        <h2>Las cuatro condiciones que la hacen funcionar</h2>
        <p>
          James Surowiecki identific\xF3 las cuatro condiciones que convierten a un grupo de personas comunes en
          un sistema de inteligencia superior:
        </p>
        <ol>
          <li>
            <strong>Diversidad cognitiva:</strong> necesit\xE1s gente que piense diferente, no que piense igual
            pero m\xE1s fuerte. Un grupo de diez ingenieros brillantes que piensan igual es menos inteligente
            colectivamente que un grupo de diez personas diversas con perspectivas distintas.
          </li>
          <li>
            <strong>Independencia:</strong> cada persona debe poder formar su opini\xF3n antes de escuchar al
            grupo. Sin esto, el pensamiento grupal destruye la inteligencia colectiva. Cuando todos escuchan
            primero al jefe, el grupo piensa con un solo cerebro \u2014 el del jefe.
          </li>
          <li>
            <strong>Descentralizaci\xF3n:</strong> la informaci\xF3n tiene que venir de m\xFAltiples fuentes, no de un
            centro \xFAnico. Los sistemas centralizados son fr\xE1giles: si el centro falla, todo falla. Los sistemas
            descentralizados son resilientes: si una fuente falla, las dem\xE1s compensan.
          </li>
          <li>
            <strong>Agregaci\xF3n:</strong> necesit\xE1s un mecanismo para combinar las opiniones individuales en una
            decisi\xF3n colectiva. Sin agregaci\xF3n, ten\xE9s opiniones sueltas \u2014 no inteligencia colectiva.
          </li>
        </ol>
        <p>
          Wikipedia funciona por estas cuatro condiciones. Los mercados de predicci\xF3n superan a los expertos
          por estas cuatro condiciones. El software de c\xF3digo abierto compite con corporaciones millonarias por
          estas cuatro condiciones. No es magia \u2014 es dise\xF1o.
        </p>

        <h2>El genio desperdiciado de Argentina</h2>
        <p>
          Las instituciones argentinas est\xE1n dise\xF1adas para la toma de decisiones de arriba hacia abajo.
          "Consultamos para legitimar, no para aprender." Presupuestos municipales decididos sin participaci\xF3n
          ciudadana. Curr\xEDculas educativas dise\xF1adas sin voz de docentes ni estudiantes. Pol\xEDticas de salud sin
          datos de pacientes. Miles de cerebros disponibles, y el sistema usa uno solo.
        </p>
        <p>
          Las asambleas post-2001 mostraron lo que pasa cuando los argentinos se organizan con buenas reglas:
          inteligencia colectiva espont\xE1nea que resolvi\xF3 problemas que el Estado no pod\xEDa resolver. Pero lo
          tratamos como una respuesta de emergencia, no como un modelo a escalar. Ese fue el error. La emergencia
          revel\xF3 la capacidad \u2014 y cuando la emergencia pas\xF3, archivamos la capacidad junto con la crisis.
        </p>

        <h2>Arquitectura de la inteligencia colectiva</h2>
        <p>
          No alcanza con juntar gente y esperar que aparezca la sabidur\xEDa. Hay que dise\xF1arla:
        </p>
        <ul>
          <li>
            <strong>Diversidad cognitiva por estructura:</strong> en cada decisi\xF3n importante, invit\xE1 deliberadamente
            3 perspectivas con las que est\xE9s en desacuerdo. No por cortes\xEDa \u2014 por necesidad matem\xE1tica.
          </li>
          <li>
            <strong>Proteg\xE9 la independencia:</strong> us\xE1 rondas de opini\xF3n an\xF3nimas antes de la discusi\xF3n grupal.
            Que cada persona escriba lo que piensa antes de escuchar al grupo. As\xED proteg\xE9s la diversidad de
            pensamiento del efecto manada.
          </li>
          <li>
            <strong>Cre\xE1 mecanismos de agregaci\xF3n:</strong> sistemas de votaci\xF3n, scoring, mercados de predicci\xF3n
            para decisiones comunitarias. No basta con que la gente opine \u2014 hay que tener un m\xE9todo para
            convertir esas opiniones en decisiones.
          </li>
          <li>
            <strong>Bucles de retroalimentaci\xF3n:</strong> mostrales a las personas el impacto de su contribuci\xF3n
            colectiva. Cuando la gente ve que su voz import\xF3 \u2014 que el resultado cambi\xF3 porque participaron \u2014 la
            participaci\xF3n se refuerza.
          </li>
        </ul>

        <h2>Tres microacciones para esta semana</h2>
        <ol>
          <li><strong>En tu pr\xF3xima decisi\xF3n, preguntale a 5 personas de diferentes contextos antes de decidir.</strong> No para validaci\xF3n \u2014 para datos genuinos. Escuch\xE1 especialmente a los que piensan distinto.</li>
          <li><strong>Cre\xE1 un mecanismo de sugerencias an\xF3nimo en tu proyecto o equipo.</strong> Un formulario, un buz\xF3n, lo que sea. Lo an\xF3nimo libera la honestidad que lo p\xFAblico censura.</li>
          <li><strong>Durante 3 meses, document\xE1 cada decisi\xF3n colectiva y su resultado.</strong> Vas a ver el patr\xF3n: las decisiones con diversidad real superan a las decisiones de una sola cabeza.</li>
        </ol>

        <blockquote>
          Cada persona a tu alrededor lleva un fragmento de la soluci\xF3n que busc\xE1s. La inteligencia colectiva
          no se invoca ni se espera: se dise\xF1a. Y cuando la dise\xF1\xE1s bien, descubr\xEDs algo que te cambia para
          siempre: la sabidur\xEDa nunca fue escasa. Solo estaba mal distribuida \u2014 esperando mejores reglas para
          circular.
        </blockquote>
      </article>
    `
      },
      [slugify("Lo Que Le Debemos al Futuro: Responsabilidad Intergeneracional como Dise\xF1o")]: {
        excerpt: "Cada decisi\xF3n que tomamos hoy la van a vivir personas que todav\xEDa no nacieron. No nos pidieron permiso. No nos van a poder reclamar. Y eso no nos libera de responsabilidad \u2014 nos la multiplica.",
        content: `
      <article>
        <h1>Lo Que Le Debemos al Futuro: Responsabilidad Intergeneracional como Dise\xF1o</h1>
        <p>
          Los iroqueses ten\xEDan una regla: ninguna decisi\xF3n se tomaba sin considerar su impacto en la s\xE9ptima
          generaci\xF3n futura. Los constructores de catedrales medievales sab\xEDan que no iban a ver su obra
          terminada \u2014 y las construyeron igual, con una precisi\xF3n que desaf\xEDa siglos. Jap\xF3n tiene empresas
          con planes a 100 a\xF1os. Estos no son ejemplos rom\xE1nticos: son modelos operativos de civilizaciones
          que entendieron algo que nosotros olvidamos.
        </p>
        <p>
          Contraste: Argentina optimiza para ciclos de 4 a\xF1os. Infraestructura, educaci\xF3n, decisiones
          ambientales \u2014 todo optimizado para la pr\xF3xima elecci\xF3n, con consecuencias que se despliegan
          durante 40 a\xF1os. Planificamos para la pr\xF3xima elecci\xF3n, no para la pr\xF3xima generaci\xF3n. Y despu\xE9s
          nos sorprende que cada generaci\xF3n empiece de cero.
        </p>

        <h2>El costo medible del cortoplacismo</h2>
        <p>
          Cada vez que parchamos en lugar de redise\xF1ar, le pasamos la factura a la generaci\xF3n que viene.
        </p>
        <ul>
          <li>
            <strong>Deuda educativa:</strong> estudiantes que egresan sin las habilidades que el mundo demanda.
            No les fallamos al final \u2014 les fallamos desde el dise\xF1o. Cada a\xF1o que pasa sin redise\xF1ar el
            curr\xEDculum, la brecha entre lo que aprenden y lo que necesitan se agranda.
          </li>
          <li>
            <strong>Deuda ambiental:</strong> decisiones tomadas para la extracci\xF3n a corto plazo que comprometen
            suelos, aguas y ecosistemas por generaciones. Lo que se extrae en una d\xE9cada tarda siglos en
            regenerarse.
          </li>
          <li>
            <strong>Deuda institucional:</strong> reglas dise\xF1adas para el ocupante actual del cargo, no para el
            ciudadano de 2050. Instituciones que se reforman para el que est\xE1, no para el que viene.
          </li>
        </ul>

        <h2>Tres principios del dise\xF1o intergeneracional</h2>
        <ol>
          <li>
            <strong>Pensamiento de catedral:</strong> dise\xF1\xE1 proyectos cuyo valor exceda tu tiempo de vida. No
            porque no vayas a ver el resultado \u2014 sino porque esa es la escala a la que opera la transformaci\xF3n
            real. Los que plantaron los bosques que hoy disfrutamos no se sentaron a su sombra. Pero los
            plantaron igual. Eso es pensamiento de catedral.
          </li>
          <li>
            <strong>M\xE9tricas de legado:</strong> med\xED las decisiones no solo por su retorno inmediato sino por su
            impacto proyectado a 20 a\xF1os. Antes de lanzar cualquier cosa, preguntate: "\xBFEsto sigue sirviendo
            en 2045?" Si la respuesta es no, no es una soluci\xF3n \u2014 es un parche.
          </li>
          <li>
            <strong>Puentes de conocimiento:</strong> romp\xE9 el ciclo de que cada generaci\xF3n empiece de cero.
            Mentore\xE1 a alguien m\xE1s joven cada semana. Aprend\xE9 de alguien m\xE1s grande cada semana. Document\xE1 lo
            que sab\xE9s para que sobreviva a tu participaci\xF3n. El conocimiento que no se transmite muere con quien
            lo tiene.
          </li>
        </ol>

        <h2>La carta al 2050</h2>
        <p>
          Un ejercicio pr\xE1ctico \u2014 no sentimental. Escrib\xED una carta de una p\xE1gina a alguien que va a estar vivo
          en 2050. Describ\xED la Argentina que est\xE1s construyendo para esa persona. No la Argentina que dese\xE1s \u2014
          la que est\xE1s activamente construyendo con tus decisiones diarias. Esto no es sentimentalismo: es una
          herramienta de dise\xF1o. Te obliga a convertir la responsabilidad abstracta en compromisos concretos.
        </p>
        <p>
          Puede ser tu futuro nieto, puede ser un desconocido. Lo importante es que sea una persona real en tu
          imaginaci\xF3n \u2014 con cara, con nombre, con una vida que va a depender de lo que vos hagas o dejes de
          hacer hoy. Cuando le pon\xE9s cara al futuro, el futuro deja de ser abstracto y empieza a ser urgente.
        </p>

        <h2>Tres microacciones para empezar</h2>
        <ol>
          <li><strong>Escrib\xED esa carta.</strong> Una p\xE1gina. A una persona real que va a existir en 2050 \u2014 tu futuro nieto, un desconocido. Describ\xED lo que est\xE1s construyendo para ella. No lo que so\xF1\xE1s \u2014 lo que est\xE1s haciendo.</li>
          <li><strong>Ten\xE9 una conversaci\xF3n esta semana con alguien 20 o m\xE1s a\xF1os menor que vos.</strong> Preguntale qu\xE9 necesita de tu generaci\xF3n. Escuch\xE1 m\xE1s de lo que habl\xE1s. Lo que te diga va a incomodarte \u2014 y esa incomodidad es informaci\xF3n.</li>
          <li><strong>Empez\xE1 un proyecto \u2014 por m\xE1s chico que sea \u2014 cuyo valor completo solo se realice despu\xE9s de que termines tu rol en \xE9l.</strong> Plant\xE1 un \xE1rbol bajo cuya sombra no te vayas a sentar. Esa es la definici\xF3n exacta de responsabilidad intergeneracional.</li>
        </ol>

        <blockquote>
          Hay un solo test para saber si lo que est\xE1s haciendo vale la pena. Imagin\xE1 que un chico que todav\xEDa
          no naci\xF3 va a leer la historia de tu generaci\xF3n. \xBFQu\xE9 va a encontrar? \xBFVan a ser los que se quejaron,
          los que se fueron, los que esperaron? \xBFO van a ser los que se sentaron a dise\xF1ar un pa\xEDs para personas
          que jam\xE1s iban a poder agradecerles? Esa es la \xFAnica pregunta que importa. Y la respuesta no est\xE1 en
          un discurso \u2014 est\xE1 en lo que hagas ma\xF1ana a la ma\xF1ana.
        </blockquote>
      </article>
    `
      },
      [slugify("Las Fuerzas del Cielo: El Poder que ya Ten\xE9s y Nadie te Ense\xF1\xF3 a Usar")]: {
        excerpt: "Se habla de 'Las Fuerzas del Cielo' como si fueran un ej\xE9rcito m\xEDstico esperando \xF3rdenes de un l\xEDder. Pero la fuerza m\xE1s poderosa que viene del cielo no es un rayo ni un milagro: es la imaginaci\xF3n. Y ya est\xE1 adentro tuyo \u2014 funcionando ahora mismo.",
        content: `
      <article>
        <h1>Las Fuerzas del Cielo: El Poder que ya Ten\xE9s y Nadie te Ense\xF1\xF3 a Usar</h1>
        <p>
          Se habla mucho de "Las Fuerzas del Cielo". Se las invoca como un ej\xE9rcito invisible, como un respaldo
          sobrenatural que avala un proyecto pol\xEDtico. Suena \xE9pico. Suena poderoso. Y precisamente por eso necesitamos
          desarmarlo \u2014 no para destruirlo, sino para encontrar la verdad que hay debajo del eslogan.
          Porque s\xED hay una fuerza que viene del cielo. Pero no es lo que te contaron.
        </p>
        <p>
          No es un rayo que baja a castigar a tus enemigos. No es un ej\xE9rcito de \xE1ngeles que vota en las elecciones.
          No es un respaldo c\xF3smico para ning\xFAn proyecto humano particular. La fuerza m\xE1s grande que jam\xE1s descendi\xF3
          del cielo es una que ya ten\xE9s \u2014 que siempre tuviste \u2014 y que nadie te ense\xF1\xF3 a usar con la precisi\xF3n que merece.
        </p>
        <p>
          Se llama <strong>imaginaci\xF3n</strong>.
        </p>

        <blockquote>
          La fuerza del cielo no baja como rayo. Sube como visi\xF3n.
          No la recib\xEDs de rodillas \u2014 la activ\xE1s de pie, con los ojos abiertos
          y la decisi\xF3n de crear lo que todav\xEDa no existe.
        </blockquote>

        <h2>Creados a imagen y semejanza \u2014 pero \xBFde qu\xE9?</h2>
        <p>
          La tradici\xF3n dice que Dios cre\xF3 al ser humano "a su imagen y semejanza". Repetimos esa frase
          desde chicos sin detenernos a pensar qu\xE9 significa realmente. \xBFA su imagen f\xEDsica? Dios no tiene
          cuerpo. \xBFA su imagen moral? Mir\xE1 la historia humana y decime si eso cierra. Entonces, \xBFa imagen
          de qu\xE9 exactamente?
        </p>
        <p>
          Pensalo as\xED: \xBFqu\xE9 es lo primero que hace Dios en el G\xE9nesis? Antes de juzgar, antes de castigar,
          antes de cualquier otra cosa \u2014 <strong>crea</strong>. "En el principio, Dios cre\xF3 los cielos y la tierra."
          La primera acci\xF3n del universo es un acto de creaci\xF3n pura. Algo que no exist\xEDa empieza a existir.
          \xBFC\xF3mo? Mediante la palabra \u2014 que es pensamiento expresado. Mediante la visi\xF3n \u2014 que es imaginaci\xF3n
          aplicada. "Dijo Dios: h\xE1gase la luz. Y la luz se hizo."
        </p>
        <p>
          Ah\xED est\xE1 la clave que llevamos siglos mirando sin ver: la semejanza no es f\xEDsica ni moral.
          Es <strong>creadora</strong>. Somos seres imaginantes \u2014 hechos a imagen de un ser que imagina realidades
          y las trae a la existencia. Esa es la herencia. Esa es la fuerza del cielo. No un ej\xE9rcito:
          una facultad. La capacidad de concebir lo que no existe y hacerlo real.
        </p>
        <p>
          Ning\xFAn otro ser vivo puede hacer esto. Un le\xF3n no imagina una sabana mejor. Un \xE1rbol no dise\xF1a
          un bosque diferente. Solo el ser humano cierra los ojos y ve algo que todav\xEDa no est\xE1 \u2014 y despu\xE9s
          abre los ojos y lo construye. Cada puente, cada sinfon\xEDa, cada constituci\xF3n, cada acto de justicia
          empez\xF3 exactamente igual: alguien imagin\xF3 algo que no exist\xEDa y decidi\xF3 que ten\xEDa que existir.
        </p>

        <h2>Las dos direcciones del pensamiento \u2014 y por qu\xE9 una de ellas te conecta con el cielo</h2>
        <p>
          Hay dos formas fundamentales de pensar, y entender la diferencia entre ellas te cambia la vida.
          No es teor\xEDa acad\xE9mica \u2014 es la llave que separa a los que repiten el mundo de los que lo crean.
        </p>
        <h3>Pensamiento deductivo: de lo conocido a lo conocido</h3>
        <p>
          El pensamiento deductivo parte de lo que ya existe. Observa datos, analiza evidencia, saca conclusiones.
          Va de lo general a lo particular: "Todos los metales se dilatan con el calor. El hierro es un metal.
          Por lo tanto, el hierro se dilata con el calor." Es impecable. Es l\xF3gico. Es necesario.
          Y es completamente incapaz de crear algo nuevo.
        </p>
        <p>
          El pensamiento deductivo trabaja con el inventario de lo que ya es. Reorganiza piezas existentes.
          Es la herramienta de la administraci\xF3n, del mantenimiento, del diagn\xF3stico. Necesaria \u2014 pero limitada
          al universo de lo conocido. Si solo pens\xE1s deductivamente, est\xE1s condenado a reorganizar
          los muebles de la misma habitaci\xF3n para siempre.
        </p>
        <h3>Pensamiento inductivo: del reino de las ideas a la realidad</h3>
        <p>
          El pensamiento inductivo opera en la direcci\xF3n contraria. No parte de lo que ya existe \u2014
          parte de lo que podr\xEDa existir. Observa un caso particular y salta hacia una verdad mayor
          que no estaba antes en ning\xFAn dato. Newton ve caer una manzana y concibe la gravedad universal.
          Tesla cierra los ojos y ve un motor de corriente alterna funcionando \u2014 completo, con cada pieza
          en su lugar \u2014 antes de que exista un solo prototipo. Beethoven escucha sinfon\xEDas enteras en su
          cabeza antes de escribir una sola nota, incluso cuando ya estaba sordo.
        </p>
        <p>
          \xBFDe d\xF3nde viene eso? \xBFDe d\xF3nde sale una idea que no estaba en ning\xFAn dato previo?
          Eso no es c\xE1lculo. No es deducci\xF3n. Es algo que aparece \u2014 como si bajara de otro plano.
          Plat\xF3n lo llam\xF3 "el mundo de las Ideas", un reino donde las formas perfectas existen antes
          de materializarse. Los griegos lo llamaban <em>nous</em> \u2014 el intelecto divino. Los herm\xE9ticos
          lo resumieron en un principio que lleva miles de a\xF1os y nadie ha podido refutar:
          <strong>"Todo es Mente. El universo es mental."</strong>
        </p>
        <p>
          No importa si lo le\xE9s desde la filosof\xEDa, desde la teolog\xEDa o desde la f\xEDsica cu\xE1ntica:
          el patr\xF3n es el mismo. Las ideas no se fabrican \u2014 se reciben. La imaginaci\xF3n no inventa
          desde la nada: sintoniza con algo que ya existe en un plano que no es material.
          Y despu\xE9s lo baja. Lo traduce. Lo materializa. Eso es crear.
        </p>

        <blockquote>
          El pensamiento deductivo reorganiza lo que ya existe.
          El pensamiento inductivo trae al mundo lo que todav\xEDa no existe.
          Uno administra. El otro crea. Las dos son necesarias \u2014 pero solo una
          te conecta con la fuerza del cielo.
        </blockquote>

        <h2>"El Reino de los Cielos est\xE1 dentro de vos" \u2014 y esto es un hecho, no una met\xE1fora</h2>
        <p>
          Jes\xFAs dijo algo que llevamos dos mil a\xF1os repitiendo sin entender: <em>"El Reino de los Cielos
          est\xE1 dentro de vosotros"</em> (Lucas 17:21). La frase es tan familiar que perdi\xF3 su poder.
          Pero par\xE1 un segundo y escuchala como si fuera la primera vez.
        </p>
        <p>
          No dijo "el reino de los cielos va a venir alg\xFAn d\xEDa". No dijo "est\xE1 en Roma, en Jerusal\xE9n,
          en una iglesia o en un partido pol\xEDtico". No dijo "te lo voy a dar si te port\xE1s bien".
          Dijo <strong>est\xE1</strong> \u2014 tiempo presente \u2014 <strong>dentro de vosotros</strong> \u2014 lugar interior.
          Ahora. Ac\xE1. En vos.
        </p>
        <p>
          \xBFY qu\xE9 es lo que hay dentro tuyo que tiene el poder de crear mundos? Tu imaginaci\xF3n.
          Tu capacidad de cerrar los ojos y ver lo que todav\xEDa no existe. Tu facultad de concebir
          una realidad diferente \u2014 y despu\xE9s abrirlos y empezar a construirla. Eso no es un don
          reservado para genios ni para santos. Es la estructura b\xE1sica de tu conciencia. Es lo que
          te hace humano.
        </p>
        <p>
          Pensalo con evidencia:
        </p>
        <ul>
          <li>
            <strong>Cada civilizaci\xF3n empez\xF3 como una imagen en la mente de alguien.</strong>
            Antes de haber un ladrillo en Babilonia, alguien la imagin\xF3. Antes de que existiera
            la democracia, alguien concibi\xF3 un sistema donde los ciudadanos gobernaran.
            Primero fue la visi\xF3n interior. Despu\xE9s fue la realidad exterior.
          </li>
          <li>
            <strong>Cada avance cient\xEDfico empez\xF3 como una intuici\xF3n que no estaba en los datos.</strong>
            Einstein no dedujo la relatividad de datos experimentales \u2014 la imagin\xF3. Se vio a s\xED mismo
            viajando al lado de un rayo de luz y se pregunt\xF3 qu\xE9 pasar\xEDa. De esa imagen interior sali\xF3
            la ecuaci\xF3n que redefinir\xEDa el universo. La imaginaci\xF3n precedi\xF3 a la prueba.
          </li>
          <li>
            <strong>Cada acto de justicia empez\xF3 como una visi\xF3n de algo que no exist\xEDa.</strong>
            Martin Luther King dijo "I have a dream" \u2014 tengo un sue\xF1o. No dijo "tengo un plan",
            no dijo "tengo datos". Dijo tengo una imagen interior de un mundo que todav\xEDa no es
            pero que deber\xEDa ser. Y esa imagen fue tan poderosa que reorganiz\xF3 la realidad a su alrededor.
          </li>
          <li>
            <strong>Vos mismo sos prueba viviente.</strong> Todo lo que construiste en tu vida \u2014 tu familia,
            tu trabajo, tus relaciones, tus proyectos \u2014 empez\xF3 como una imagen en tu mente antes de
            existir en el mundo. Primero lo viste. Despu\xE9s lo hiciste. Siempre en ese orden. Nunca al rev\xE9s.
          </li>
        </ul>
        <p>
          Esto no es misticismo. Es el mecanismo m\xE1s documentado de la creaci\xF3n humana. La neurociencia
          lo confirma: el cerebro no distingue con claridad entre una experiencia intensamente imaginada
          y una experiencia real \u2014 las mismas regiones neuronales se activan en ambos casos. Los atletas
          ol\xEDmpicos que visualizan su performance muestran activaci\xF3n muscular id\xE9ntica a cuando ejecutan
          el movimiento f\xEDsico. Tu imaginaci\xF3n no es fantas\xEDa: es el borrador de la realidad.
        </p>

        <h2>C\xF3mo se accede al reino \u2014 el m\xE9todo que nadie te ense\xF1\xF3</h2>
        <p>
          Si el reino de los cielos est\xE1 dentro tuyo \u2014 si la imaginaci\xF3n creadora es la fuerza m\xE1s
          poderosa que ten\xE9s \u2014 entonces la pregunta urgente no es si es verdad, sino c\xF3mo se accede.
          Porque la mayor\xEDa de la gente vive con esta facultad atrofiada, oxidada, secuestrada por
          el miedo, la urgencia y el ruido.
        </p>
        <ol>
          <li>
            <strong>Silencio interior.</strong> No pod\xE9s escuchar la se\xF1al si viv\xEDs ahogado en ruido.
            Cada tradici\xF3n espiritual de la historia \u2014 sin excepci\xF3n \u2014 prescribe alguna forma de
            silencio: meditaci\xF3n, oraci\xF3n contemplativa, retiro, ayuno de informaci\xF3n. No es casualidad.
            El silencio no es ausencia: es la condici\xF3n ac\xFAstica para que las ideas nuevas puedan
            llegar. Si tu mente est\xE1 llena de noticieros, redes sociales y urgencias ajenas,
            no queda espacio para la voz que crea.
          </li>
          <li>
            <strong>Pregunta precisa.</strong> La imaginaci\xF3n no se activa con deseos vagos.
            Se activa con preguntas espec\xEDficas sostenidas en el tiempo. No "quiero que Argentina
            mejore". Sino: "\xBFC\xF3mo dise\xF1ar\xEDa yo un sistema educativo donde cada chico de 15 a\xF1os
            egrese sabiendo pensar, crear y servir?" Manten\xE9 esa pregunta viva \u2014 en la ducha,
            caminando, antes de dormir. Tu subconsciente trabaja con preguntas como un motor
            trabaja con combustible. La calidad de tus respuestas depende de la precisi\xF3n de
            tus preguntas.
          </li>
          <li>
            <strong>Visualizaci\xF3n sostenida.</strong> No basta con pensarlo una vez.
            Los que materializar visiones las sostienen. Las ven todos los d\xEDas.
            Las refinan, les agregan detalle, las sienten como si ya fueran reales.
            Nikola Tesla describ\xEDa este proceso con una precisi\xF3n asombrosa: dec\xEDa que
            sus inventos aparec\xEDan en su mente con tal nitidez que pod\xEDa hacerlos girar,
            probar cada pieza, detectar fallos \u2014 todo antes de tocar un solo material.
            Cuando finalmente los constru\xEDa, funcionaban exactamente como los hab\xEDa
            imaginado. Eso no es magia. Es una facultad humana que no entrenamos.
          </li>
          <li>
            <strong>Acci\xF3n inmediata.</strong> La imaginaci\xF3n sin acci\xF3n es fantas\xEDa.
            La acci\xF3n sin imaginaci\xF3n es repetici\xF3n. Las dos juntas son creaci\xF3n.
            Cada visi\xF3n necesita su primer paso dentro de las 24 horas siguientes.
            No perfecto \u2014 concreto. Porque la acci\xF3n le dice a tu mente: "Es en serio.
            Segu\xED mostr\xE1ndome el camino." Y la mente responde.
          </li>
        </ol>

        <h2>Entonces, \xBFqu\xE9 son realmente "Las Fuerzas del Cielo"?</h2>
        <p>
          No son un ej\xE9rcito a tu servicio. No son un respaldo para tu facci\xF3n pol\xEDtica.
          No son un cheque en blanco del universo para justificar tus decisiones.
        </p>
        <p>
          Las verdaderas fuerzas del cielo son las que ya operan dentro de cada ser humano
          que decide usarlas: la imaginaci\xF3n para concebir lo que no existe, el coraje para
          sostener esa visi\xF3n cuando nadie m\xE1s la ve, y la disciplina para materializarla
          paso a paso en el mundo real.
        </p>
        <p>
          Y ac\xE1 viene lo que nadie te dice cuando te hablan de fuerzas celestiales: esas fuerzas
          no discriminan. No son de derecha ni de izquierda. No pertenecen a un gobierno
          ni a un movimiento. Son tan tuyas como tu respiraci\xF3n. Son tan m\xEDas como mi latido.
          Son la herencia compartida de todo ser humano que alguna vez cerr\xF3 los ojos
          y vio algo que todav\xEDa no exist\xEDa \u2014 y decidi\xF3 que iba a existir.
        </p>

        <h2>La prueba que ya no pod\xE9s ignorar</h2>
        <p>
          Mir\xE1 tu propia vida. Cada cosa que hoy es real para vos \u2014 tu casa, tus hijos,
          tu trabajo, tus amistades, este texto que est\xE1s leyendo \u2014 fue primero una imagen
          en la mente de alguien. Alguien la imagin\xF3 antes de que existiera.
          Y despu\xE9s hizo lo necesario para traerla al mundo.
        </p>
        <p>
          Ahora preguntate: \xBFqu\xE9 est\xE1s imaginando vos hoy? Porque eso \u2014 exactamente eso \u2014
          es lo que est\xE1s creando. No ma\xF1ana. Ahora. Tu imaginaci\xF3n no es un escape
          de la realidad: es la f\xE1brica de la realidad. Y est\xE1 encendida las 24 horas
          del d\xEDa, los 7 d\xEDas de la semana, lo sepas o no.
        </p>
        <p>
          La diferencia entre los que transforman el mundo y los que lo padecen
          no es talento, no es dinero, no es suerte. Es que unos usan esta facultad
          con intenci\xF3n y precisi\xF3n \u2014 y los otros la dejan correr en piloto autom\xE1tico,
          imaginando miedos, repitiendo quejas, visualizando lo peor.
        </p>

        <blockquote>
          Las Fuerzas del Cielo no bajan cuando un presidente las invoca.
          Se activan cuando un ser humano cierra los ojos, ve un mundo que todav\xEDa
          no existe, los abre y da el primer paso para construirlo.
          Ese ser humano no necesita permiso de nadie.
          Ese ser humano sos vos.
          Y el reino donde nace todo \u2014 absolutamente todo \u2014 ya est\xE1 adentro tuyo.
          Siempre estuvo.
        </blockquote>
      </article>
    `
      },
      [slugify("Detectar Patrones: Otro Poder Que Ya Ten\xE9s y Nadie Te Ense\xF1\xF3 a Usar")]: {
        excerpt: "Detectar patrones es la herramienta evolutiva n\xFAmero uno del ser humano. Y en un pa\xEDs donde la pol\xEDtica repite el mismo gui\xF3n con distintos actores, entrenar ese ojo es un acto de supervivencia \u2014 y de libertad.",
        content: `
      <article>
        <h1>Detectar Patrones: Otro Poder Que Ya Ten\xE9s y Nadie Te Ense\xF1\xF3 a Usar</h1>

        <h2>Siguiendo el hilo...</h2>
        <p>
          Si le\xEDste nuestro art\xEDculo anterior,
          <a href="/recursos/blog/las-fuerzas-del-cielo-el-poder-que-ya-tens-y-nadie-te-ense-a-usar"><strong>Las Fuerzas del Cielo: El Poder Que Ya Ten\xE9s y Nadie Te Ense\xF1\xF3 a Usar</strong></a>,
          ya sab\xE9s que venimos hablando de esos poderes que ten\xE9s adentro, que son gratis, que nadie te los puede sacar,
          y que por alg\xFAn motivo nadie se sent\xF3 a explicarte c\xF3mo usarlos.
        </p>
        <p>
          Bueno, hoy te vengo a hablar de otro. Uno que est\xE1 tan metido en tu naturaleza que lo us\xE1s todos los d\xEDas
          sin darte cuenta, pero que si aprendieras a usarlo con intenci\xF3n, te cambiar\xEDa la vida:
          <strong>la capacidad de detectar patrones</strong>.
        </p>

        <h2>El superpoder que nos trajo hasta ac\xE1</h2>
        <p>
          Hay una habilidad que nos trajo hasta ac\xE1 como especie. No es la fuerza bruta \u2014 un gorila nos hace pelota.
          No es la velocidad \u2014 un guepardo nos deja parados. No es el tama\xF1o \u2014 al lado de una ballena somos un poroto.
          Lo que nos hizo sobrevivir, evolucionar y construir todo lo que ves alrededor tuyo es algo mucho m\xE1s sutil
          y poderoso: <strong>la capacidad de detectar patrones</strong>.
        </p>
        <p>
          Cuando un hom\xEDnido vio que cada vez que el cielo se pon\xEDa oscuro y hac\xEDa un ruido fuerte, despu\xE9s ca\xEDa agua...
          no entend\xEDa meteorolog\xEDa. Estaba detectando un patr\xF3n. Cuando otro se dio cuenta de que ciertas plantas te
          hac\xEDan doler la panza y otras no, no era nutricionista. Estaba detectando un patr\xF3n. Cuando alguien not\xF3 que
          tirar una semilla en la tierra mojada hac\xEDa que despu\xE9s creciera comida... no ten\xEDa un m\xE1ster en agronom\xEDa.
          Estaba detectando un patr\xF3n. Y as\xED, querido humano, naci\xF3 la agricultura, la medicina, la astronom\xEDa,
          la arquitectura, las matem\xE1ticas \u2014 todo.
        </p>
        <p>
          Cada salto de la humanidad empez\xF3 con alguien que dijo: <em>"Par\xE1... esto ya lo vi antes."</em>
        </p>
        <p>
          Los babilonios miraron el cielo durante siglos y detectaron que las estrellas segu\xEDan ciclos. Los egipcios
          detectaron que el Nilo se desbordaba en \xE9pocas predecibles y construyeron una civilizaci\xF3n entera alrededor
          de ese patr\xF3n. Newton vio caer una manzana y conect\xF3 ese patr\xF3n con la luna orbitando la Tierra. Darwin viaj\xF3
          por el mundo y detect\xF3 patrones en los picos de los pinzones. Fleming detect\xF3 un patr\xF3n raro en una placa de
          Petri contaminada y nos regal\xF3 los antibi\xF3ticos.
        </p>

        <blockquote>
          Detectar patrones es, literalmente, la herramienta evolutiva n\xFAmero uno del ser humano.
        </blockquote>

        <h2>El problema: nos ahogamos en ruido</h2>
        <p>
          Ahora, ac\xE1 viene lo jodido. Vivimos en una \xE9poca donde estamos bombardeados por informaci\xF3n las 24 horas
          del d\xEDa, los 7 d\xEDas de la semana. Noticias, opiniones, tweets, reels, influencers, "expertos", cu\xF1ados con
          teor\xEDas, pol\xEDticos con promesas, publicidades disfrazadas de contenido. Es un tsunami constante de datos,
          emociones y est\xEDmulos dise\xF1ados para que reacciones, no para que pienses.
        </p>
        <p>
          Y en ese quilombo, la habilidad de detectar patrones no solo es \xFAtil \u2014 <strong>es de supervivencia</strong>.
          Porque cuando no detect\xE1s patrones, te la com\xE9s. Compr\xE1s espejitos de colores una y otra y otra vez.
          Te vendieron el mismo buz\xF3n con distinto packaging y vos ca\xEDste de nuevo como si fuera la primera vez.
        </p>
        <p>
          As\xED que te propongo un ejercicio. Vamos a poner en pr\xE1ctica esto de detectar patrones con un tema que nos
          toca a todos, que nos duele a todos, y que sin embargo seguimos repitiendo como si tuvi\xE9ramos amnesia
          cr\xF3nica: <strong>la pol\xEDtica argentina</strong>.
        </p>

        <h2>El patr\xF3n pol\xEDtico argentino (spoiler: siempre es el mismo)</h2>

        <h3>Patr\xF3n #1: La campa\xF1a emocional</h3>
        <p>
          Primero lo primero. \xBFC\xF3mo llega un pol\xEDtico al poder? \xBFCon un plan detallado, m\xE9tricas claras, objetivos
          verificables y plazos realistas? Ja. No. Llega identificando qu\xE9 cosas te generan una reacci\xF3n emocional
          fuerte y mont\xE1ndose arriba de eso como un surfista en una ola.
        </p>
        <p>
          \xBFLa gente tiene miedo de la inseguridad? <em>"Voy a meter mano dura."</em>
          \xBFLa gente est\xE1 harta de la inflaci\xF3n? <em>"Voy a dolarizar, estabilizar, pulverizar."</em>
          \xBFLa gente est\xE1 indignada con la corrupci\xF3n? <em>"Soy distinto, vengo a romper todo."</em>
          \xBFLa gente tiene bronca con la casta? <em>"Yo no soy la casta, yo soy uno de ustedes."</em>
          \xBFLa gente est\xE1 angustiada por la pobreza? <em>"Vamos a distribuir la riqueza."</em>
        </p>
        <p>
          El patr\xF3n es siempre el mismo: <strong>detectan tu emoci\xF3n m\xE1s fuerte, se alinean con ella, y te hacen
          creer que son la soluci\xF3n</strong>. No importa el partido. No importa si son de derecha, de izquierda,
          del centro, peronistas, radicales, libertarios, kirchneristas o marcianos. El mecanismo es id\xE9ntico.
          Cambian las palabras, cambian los trajes, cambian los slogans. El patr\xF3n no cambia nunca.
        </p>

        <h3>Patr\xF3n #2: Se suben al trono y se olvidan de vos</h3>
        <p>
          Ac\xE1 viene la parte que duele. Una vez que llegan al poder... \xBFqu\xE9 pasa? Detect\xE1 el patr\xF3n vos mismo:
          \xBFcu\xE1ntas veces un gobierno cumpli\xF3 realmente con lo que prometi\xF3 en campa\xF1a?
        </p>
        <p>
          Lo que s\xED pasa, sistem\xE1ticamente, es esto: el que llega al poder empieza a usar el poder para beneficio
          propio. Desv\xEDo de fondos p\xFAblicos. Uso de infraestructura estatal para negocios privados. Familiares y
          amigos estrat\xE9gicamente ubicados en puestos clave. Contratos millonarios a empresas amigas. Viajes con
          plata del Estado. Propiedades que aparecen m\xE1gicamente. Cuentas en para\xEDsos fiscales que brotan como
          hongos despu\xE9s de la lluvia.
        </p>
        <p>
          \xBFTe suena? \xBFLo viste una vez? \xBFDos? \xBFDiez? \xBFVeinte? Eso, querido lector, es un patr\xF3n.
          Y si todav\xEDa te sorprende, es porque no est\xE1s prestando atenci\xF3n.
        </p>

        <h3>Patr\xF3n #3: El circo de la "oposici\xF3n"</h3>
        <p>
          Este es hermoso. Una vez que est\xE1n en el Congreso, \xBFqu\xE9 hacen nuestros queridos legisladores?
          \xBFSe sientan juntos a resolver los problemas del pa\xEDs? \xBFBuscan consensos? \xBFTrabajan en equipo
          por el bien com\xFAn?
        </p>
        <p>
          No. Se dedican a bloquearse mutuamente. El oficialismo presenta un proyecto y la oposici\xF3n lo frena.
          La oposici\xF3n presenta otro y el oficialismo lo caj\xF3nea. Se gritan, se acusan, se insultan, arman shows
          medi\xE1ticos espectaculares... y mientras tanto, los problemas reales de la gente siguen exactamente igual.
        </p>
        <p>
          Es un patr\xF3n de telenovela: mucho drama, poca resoluci\xF3n. Y nosotros, el p\xFAblico, enganchad\xEDsimos
          mirando qui\xE9n le dijo qu\xE9 a qui\xE9n, en vez de preguntarnos: <em>"Momento... \xBFy lo que me prometieron?"</em>
        </p>
        <p>
          (Par\xE9ntesis: el concepto mismo de "oposici\xF3n" ya es raro, \xBFno? Si todos representan al pueblo,
          \xBFpor qu\xE9 est\xE1n opuestos entre s\xED? Deber\xEDan estar trabajando juntos para el mismo objetivo. Pero bueno,
          eso da para otro art\xEDculo entero. Sigamos.)
        </p>

        <h3>Patr\xF3n #4: Las leyes con trampa</h3>
        <p>
          Este patr\xF3n es de los m\xE1s perversos. Presten atenci\xF3n: muchas de las leyes y proyectos que se presentan
          en el Congreso tienen una cara visible \u2014 la que te muestran, la que suena linda \u2014 y una intenci\xF3n oculta
          que beneficia a unos pocos.
        </p>
        <p>
          \xBFUn ejemplo concreto? La modificaci\xF3n de la ley que proh\xEDbe vender terrenos incendiados. Suena t\xE9cnico,
          suena aburrido, suena a que no te afecta. Pero lo que est\xE1 detr\xE1s es obsceno: hay gente que provoca
          incendios forestales intencionalmente para que esa tierra pierda su valor y su protecci\xF3n, y despu\xE9s
          lobby mediante, se modifican las leyes para poder comprarla a precio de remate. Tierras que son patrimonio
          de todos los argentinos terminan en manos de privados que las quemaron a prop\xF3sito.
        </p>
        <p>
          \xBFOtro? Los cambios en leyes de miner\xEDa que relajan controles ambientales para que empresas extranjeras
          puedan explotar recursos sin rendir cuentas. \xBFOtro? Las reformas jubilatorias que siempre, pero siempre,
          terminan ajustando para abajo. \xBFOtro? Las leyes de "emergencia econ\xF3mica" que le dan superpoderes al
          Ejecutivo para mover fondos sin control del Congreso.
        </p>
        <p>
          El patr\xF3n: <strong>la ley dice una cosa, pero hace otra. Y lo que hace siempre beneficia a los mismos.</strong>
        </p>

        <h3>Patr\xF3n #5: La memoria corta inducida</h3>
        <p>
          \xBFNotaste que cada ciclo electoral parece empezar de cero? Como si no tuvi\xE9ramos historia. Como si no
          hubi\xE9ramos pasado por esto antes. Los medios te bombardean con el drama del momento, las redes te ahogan
          en grieta, y de pronto est\xE1s discutiendo con tu primo en el asado sobre si tal pol\xEDtico es mejor que
          tal otro... cuando los dos siguen el mismo patr\xF3n.
        </p>
        <p>
          Esto no es casualidad. La sobreinformaci\xF3n, el caos medi\xE1tico, las peleas artificiales entre "bandos" \u2014
          todo eso cumple una funci\xF3n: <strong>que no detectes el patr\xF3n</strong>. Porque si lo detect\xE1s,
          se les cae el negocio.
        </p>

        <h3>Patr\xF3n #6: Los "salvadores" que necesitan un enemigo</h3>
        <p>
          Cada gobierno nuevo necesita un villano. Es casi cinematogr\xE1fico. <em>"El problema es la herencia del
          gobierno anterior."</em> <em>"El problema es el FMI."</em> <em>"El problema es el sindicalismo."</em>
          <em>"El problema son los planeros."</em> <em>"El problema es la casta."</em> <em>"El problema son los
          empresarios."</em> <em>"El problema son los zurdos."</em> <em>"El problema son los fachos."</em>
        </p>
        <p>
          Siempre hay un enemigo externo que justifica por qu\xE9 no pueden cumplir. Es m\xE1s f\xE1cil se\xF1alar un culpable
          que mostrar resultados. Y nosotros, enganchados en la narrativa del h\xE9roe contra el villano, nos olvidamos
          de que vinieron a hacer un trabajo concreto y no lo est\xE1n haciendo.
        </p>

        <h2>Entonces... \xBFqu\xE9 hacemos?</h2>
        <p>
          Mir\xE1, no te voy a mentir. Detectar estos patrones puede ser bastante deprimente al principio.
          Es como cuando ves c\xF3mo se hace la salchicha: una vez que lo viste, no pod\xE9s dejar de verlo.
        </p>
        <p>
          Pero la buena noticia es que detectar el patr\xF3n es el primer paso para romperlo.
          Y ac\xE1 viene la parte que depende de nosotros.
        </p>
        <p>
          Porque la verdad inc\xF3moda es esta: <strong>los pol\xEDticos hacen lo que hacen porque nosotros se lo
          permitimos</strong>. Les damos el poder. Les compramos el discurso. Nos enojamos con la oposici\xF3n
          en vez de exigirle al que votamos. Nos conformamos con que sea "menos peor" que el anterior.
          Y cada cuatro a\xF1os volvemos al punto de partida como en el D\xEDa de la Marmota.
        </p>

        <h3>La herramienta para romper el patr\xF3n</h3>
        <p>
          \xBFQuer\xE9s romper estos patrones? Hay una forma. No es m\xE1gica, no es instant\xE1nea, pero es poderosa,
          y empieza en vos:
        </p>
        <p>
          <strong>Defin\xED con absoluta claridad qu\xE9 quer\xE9s, qu\xE9 necesit\xE1s, qu\xE9 valor\xE1s, y de qu\xE9 est\xE1s harto.</strong>
        </p>
        <p>
          No en t\xE9rminos vagos. No "quiero que el pa\xEDs mejore." Eso no significa nada.
          Hablamos de cosas concretas:
        </p>
        <ul>
          <li><em>"Quiero que mis impuestos se traduzcan en hospitales que funcionen, escuelas con techo, y rutas donde no me rompa el auto."</em></li>
          <li><em>"Necesito que la inflaci\xF3n no me coma el sueldo mes a mes."</em></li>
          <li><em>"Valoro que los funcionarios p\xFAblicos rindan cuentas de cada peso que manejan."</em></li>
          <li><em>"Estoy harto de que legislen a espaldas de la gente para beneficiar a lobbies privados."</em></li>
          <li><em>"Necesito que la justicia funcione y que los delitos no queden impunes."</em></li>
          <li><em>"Quiero agua limpia, aire limpio, y que no me prendan fuego el bosque para hacer un country."</em></li>
        </ul>
        <p>
          Una vez que ten\xE9s eso claro, se lo exig\xEDs al sistema pol\xEDtico. No a un partido. No a un l\xEDder mesi\xE1nico.
          <strong>Al sistema</strong>. Y no acept\xE1s menos que eso. No te conform\xE1s con promesas. Exig\xEDs m\xE9tricas.
          Exig\xEDs plazos. Exig\xEDs rendici\xF3n de cuentas. Y si no cumplen, los sac\xE1s.
        </p>
        <p>
          No se trata de izquierda o derecha. No se trata de grieta. Se trata de que <strong>vos sepas lo que quer\xE9s
          y no le compres el buz\xF3n a nadie que no pueda demostrarte, con hechos, que va a trabajar para eso</strong>.
        </p>

        <h2>El patr\xF3n m\xE1s importante de todos</h2>
        <p>
          \xBFSab\xE9s cu\xE1l es el patr\xF3n m\xE1s importante que pod\xE9s detectar? El tuyo. Tus reacciones autom\xE1ticas.
          Tu tendencia a engancharte con el discurso que te emociona. Tu costumbre de votar con bronca en vez
          de con claridad. Tu h\xE1bito de discutir con el otro bando en vez de exigirle al que votaste.
        </p>
        <p>
          Cuando detect\xE1s tus propios patrones, dej\xE1s de ser predecible. Y cuando dej\xE1s de ser predecible,
          dej\xE1s de ser manipulable.
        </p>
        <p>
          As\xED que la pr\xF3xima vez que alguien te quiera vender una idea \u2014 un pol\xEDtico, un medio, un influencer,
          tu cu\xF1ado \u2014 antes de reaccionar, par\xE1 un segundo y preguntate:
        </p>
        <p>
          <em>"\xBFEsto ya lo vi antes? \xBFC\xF3mo termin\xF3 la \xFAltima vez? \xBFQu\xE9 patr\xF3n estoy viendo?"</em>
        </p>
        <p>
          Porque detectar patrones no es solo una herramienta evolutiva. Es un acto de libertad.
          Y en un mundo dise\xF1ado para que reacciones sin pensar, pensar antes de reaccionar es la forma
          m\xE1s revolucionaria de resistencia.
        </p>

        <blockquote>
          Detectar patrones no es solo una herramienta evolutiva. Es un acto de libertad.
          Y en un mundo dise\xF1ado para que reacciones sin pensar, pensar antes de reaccionar
          es la forma m\xE1s revolucionaria de resistencia.
        </blockquote>

        <h2>Por eso existe El Instante del Hombre Gris</h2>
        <p>
          Es exactamente por todo esto que creamos esta plataforma. Queremos hacer <strong>visible y evidente</strong>
          lo que la gente realmente quiere, necesita y valora. No lo que un pol\xEDtico interpreta que quer\xE9s.
          No lo que una encuesta dise\xF1ada con sesgo dice que necesit\xE1s. Lo que vos, con tus propias palabras,
          dec\xEDs que te importa.
        </p>
        <p>
          \xBFPara qu\xE9? Para formar <strong>mandatos claros y concretos</strong> que ayuden a la clase pol\xEDtica
          a no perder el rumbo \u2014 o mejor dicho, que no les quede otra que volver a su funci\xF3n original:
          <strong>hacer cosas en beneficio del pueblo, basadas en cosas reales del pueblo</strong>.
        </p>
        <p>
          Cuando miles de personas dicen con claridad qu\xE9 quieren, qu\xE9 necesitan y de qu\xE9 est\xE1n hartos,
          eso deja de ser una opini\xF3n. Se convierte en un mandato imposible de ignorar.
        </p>
        <p>
          <strong>Si todav\xEDa no te registraste y no cargaste tu info en El Mapa, no esperes m\xE1s.</strong>
          Tu voz, sumada a la de miles, es lo que rompe el patr\xF3n.
          Y si este art\xEDculo te hizo sentido, compartilo. Porque cada persona que detecta el patr\xF3n
          es una persona menos que cae en la trampa.
        </p>

        <blockquote>
          El Instante del Hombre Gris \u2014 Porque el primer paso para dejar de repetir la historia
          es darte cuenta de que se est\xE1 repitiendo.
        </blockquote>
      </article>
    `
      },
      [slugify("Refinarse o Repetirse")]: {
        excerpt: "Hay una parte del proceso que nadie aplaude. Es la parte en la que uno tiene que volver sobre lo que construy\xF3 y preguntarse, con honestidad brutal, si de verdad sirve. No si suena bien. No si impresiona. Si sirve.",
        content: `
      <article>
        <h1>Refinarse o Repetirse</h1>

        <blockquote>
          "La elegancia se logra no cuando no hay nada m\xE1s que agregar, sino cuando no hay nada m\xE1s que quitar."
        </blockquote>

        <p>
          Hay una parte del proceso que nadie aplaude.
        </p>
        <p>
          No se ve bien en redes.
          No queda \xE9pica en una foto.
          No genera admiraci\xF3n inmediata.
          No da la sensaci\xF3n de avance limpio, lineal, heroico.
        </p>
        <p>
          Es la parte en la que uno tiene que volver sobre lo que construy\xF3 y preguntarse, con honestidad brutal, si de verdad sirve.
        </p>
        <p>
          No si suena bien.<br/>
          No si impresiona.<br/>
          No si est\xE1 intelectualmente bien armado.<br/>
          <strong>Si sirve.</strong>
        </p>
        <p>
          Estoy viviendo eso.
        </p>
        <p>
          Y no como idea abstracta. Lo estoy viviendo en carne propia: en el trabajo de refinar una plataforma, de someter una visi\xF3n a la realidad, de empujar una arquitectura contra el l\xEDmite de lo ejecutable, de quemar tiempo y energ\xEDa mental para probar si lo que cre\xEDa era cierto o si era solo una ilusi\xF3n elegante.
        </p>
        <p>
          Porque esa es una verdad inc\xF3moda: uno puede construir algo brillante en el papel y, aun as\xED, estar equivocado.
        </p>
        <p>
          De hecho, muchas veces lo m\xE1s peligroso no es estar equivocado de manera burda. Lo m\xE1s peligroso es estar equivocado de manera sofisticada.
        </p>
        <p>
          Hay errores vulgares, f\xE1ciles de detectar.<br/>
          Y hay errores hermosos.<br/>
          Errores que vienen vestidos de profundidad.<br/>
          Errores que parecen visi\xF3n.<br/>
          Errores que seducen porque son coherentes, ambiciosos, completos.
        </p>
        <p>
          Pero la realidad no premia la sofisticaci\xF3n de nuestros errores.
        </p>
        <p>
          <strong>La realidad premia lo que funciona.</strong>
        </p>

        <h2>Todos vivimos sobre supuestos</h2>
        <p>
          La mayor\xEDa de las personas no est\xE1 viviendo su vida.
        </p>
        <p>
          Est\xE1 ejecutando un paquete de supuestos.
        </p>
        <p>
          Supuestos sobre qui\xE9nes son.<br/>
          Supuestos sobre lo que pueden hacer.<br/>
          Supuestos sobre lo que merecen.<br/>
          Supuestos sobre c\xF3mo funciona el mundo.<br/>
          Supuestos heredados de la familia, de la escuela, del miedo, de una herida vieja, de una derrota mal digerida, de una sociedad que les ense\xF1\xF3 a sobrevivir pero nunca a despertar.
        </p>
        <p>
          Y el problema es que, cuando no revisamos esos supuestos, terminamos construyendo una existencia entera sobre cimientos que nunca pusimos a prueba.
        </p>
        <p>
          Entonces repetimos.
        </p>
        <p>
          Repetimos patrones.<br/>
          Repetimos excusas.<br/>
          Repetimos identidades viejas.<br/>
          Repetimos una versi\xF3n de nosotros mismos que quiz\xE1s alguna vez nos protegi\xF3, pero que hoy no nos sirve para nada.
        </p>
        <p>
          La repetici\xF3n puede parecer estabilidad.<br/>
          Pero muchas veces es <strong>decadencia con maquillaje</strong>.
        </p>

        <h2>Refinarse duele</h2>
        <p>
          Refinarse no es decorar.
        </p>
        <p>
          <strong>Refinarse es podar.</strong>
        </p>
        <p>
          Es sacar capas.
          Es matar partes de una idea para salvar la verdad que hab\xEDa adentro.
          Es descubrir que no todo lo que imaginaste merece sobrevivir.
          Es aceptar que agregar no siempre es avanzar \u2014 muchas veces, avanzar es quitar.
        </p>
        <p>
          Eso lo estoy viendo con m\xE1s claridad que nunca.
        </p>
        <p>
          Cuando uno empieza a construir algo grande, siente la tentaci\xF3n de cubrir cada flanco, de responder cada vac\xEDo con una nueva capa, una nueva estructura, una nueva herramienta. Parece inteligencia. Parece responsabilidad. Parece visi\xF3n total.
        </p>
        <p>
          Pero llega un punto en que la complejidad deja de ser una soluci\xF3n y se convierte en una forma sofisticada de escapar de la prueba real.
        </p>
        <p>
          Porque probar de verdad implica exponerse.
        </p>
        <p>
          Implica poner algo en marcha.<br/>
          Implica medir.<br/>
          Implica observar.<br/>
          Implica aceptar que ciertas partes no funcionan como imaginabas.<br/>
          Implica reconocer que la realidad tiene veto.
        </p>
        <p>
          Y eso hiere al ego.
        </p>
        <p>
          El ego ama la totalidad imaginada.<br/>
          <strong>La realidad exige humildad operativa.</strong>
        </p>

        <h2>Quemar tiempo no siempre es perderlo</h2>
        <p>
          Vivimos en una \xE9poca obsesionada con la optimizaci\xF3n.
        </p>
        <p>
          Todo tiene que ser r\xE1pido.<br/>
          Todo tiene que ser eficiente.<br/>
          Todo tiene que escalar.<br/>
          Todo tiene que rendir.
        </p>
        <p>
          Pero hay una forma de tiempo que no se pierde aunque arda.
        </p>
        <p>
          El tiempo que invert\xEDs en probar una intuici\xF3n hasta descubrir su verdad. El tiempo que entreg\xE1s para separar visi\xF3n de fantas\xEDa. El tiempo que pon\xE9s en tensi\xF3n, en observaci\xF3n, en ajuste, en correcci\xF3n \u2014 tiempo que destruye una mentira antes de que esa mentira te destruya a vos.
        </p>
        <p>
          <strong>Ese tiempo no se pierde. Ese tiempo te refina.</strong>
        </p>
        <p>
          S\xED, duele mirar atr\xE1s y ver horas, d\xEDas, meses puestos en caminos que hubo que corregir. S\xED, molesta descubrir que hab\xEDa cosas que parec\xEDan centrales y no lo eran. S\xED, agota tener que rearmar piezas, reenfocar, simplificar, volver a pensar.
        </p>
        <p>
          Pero peor ser\xEDa seguir avanzando con una arquitectura falsa por no tener el coraje de revisarla.
        </p>
        <p>
          Peor ser\xEDa enamorarse tanto de una versi\xF3n de las cosas que uno prefiera defenderla antes que transformarla.
        </p>

        <h2>Lo que no se somete a prueba se convierte en dogma</h2>
        <p>
          Hay personas que dicen que quieren cambiar.
        </p>
        <p>
          Pero no revisan nada.<br/>
          No prueban nada.<br/>
          No arriesgan nada.<br/>
          No entregan nada.
        </p>
        <p>
          Quieren una vida nueva con supuestos viejos.<br/>
          Quieren prop\xF3sito sin fricci\xF3n.<br/>
          Quieren transformaci\xF3n sin desmontaje.<br/>
          Quieren destino sin disciplina.
        </p>
        <p>
          <strong>Eso no existe.</strong>
        </p>
        <p>
          Si no somet\xE9s tu manera de ver el mundo a la experiencia, a la fricci\xF3n, al error, a la correcci\xF3n \u2014 si no dej\xE1s que la realidad te conteste \u2014 est\xE1s adorando tu propia versi\xF3n congelada.
        </p>
        <p>
          Y una identidad congelada termina siendo una prisi\xF3n con el nombre de personalidad.
        </p>
        <p>
          La vida cambia.<br/>
          La realidad cambia.<br/>
          El contexto cambia.<br/>
          Vos cambi\xE1s, aunque no quieras admitirlo.
        </p>
        <p>
          Entonces la pregunta no es si vas a cambiar.
        </p>
        <p>
          La pregunta es si vas a participar conscientemente en ese cambio o si vas a dejar que la inercia decida por vos.
        </p>

        <h2>El verdadero trabajo es actualizar el alma operativa</h2>
        <p>
          A veces hablamos de prop\xF3sito como si fuera una frase linda esper\xE1ndonos en alg\xFAn lugar.
        </p>
        <p>
          No.
        </p>
        <p>
          El prop\xF3sito tambi\xE9n se afina.
        </p>
        <p>
          Se descubre, s\xED. Pero adem\xE1s se corrige. Se depura. Se limpia de ego, de ruido, de vanidad, de fantas\xEDas prestadas. Se vuelve m\xE1s duro, m\xE1s simple, m\xE1s verdadero.
        </p>
        <p>
          Uno no encuentra su misi\xF3n una sola vez y listo.<br/>
          Uno entra en di\xE1logo con ella.<br/>
          Uno la traiciona, la olvida, la recupera, la afina.<br/>
          Uno tiene que merecerla.
        </p>
        <p>
          Y para merecerla, tiene que dejar morir muchas versiones de s\xED mismo.
        </p>
        <p>
          Ese quiz\xE1s sea el punto m\xE1s importante del proceso: no estamos ac\xE1 solo para construir cosas afuera. <strong>Estamos ac\xE1 para convertirnos en alguien capaz de sostener lo que dice que vino a hacer.</strong>
        </p>
        <p>
          Y eso exige actualizaci\xF3n interna.
        </p>
        <p>
          No alcanza con tener buenas intenciones.<br/>
          No alcanza con pensar profundo.<br/>
          No alcanza con sentir fuerte.
        </p>
        <p>
          Hace falta poner mente, coraz\xF3n y esfuerzo al servicio de una revisi\xF3n sincera.
        </p>
        <p>
          Hace falta mirar lo construido y preguntarse:<br/>
          \xBFEsto expresa la verdad o solo mi apego?<br/>
          \xBFEsto est\xE1 vivo o solo est\xE1 inflado?<br/>
          \xBFEsto puede encarnar en el mundo o solo funciona en mi cabeza?
        </p>

        <h2>Cambiar la percepci\xF3n o resignarse a la repetici\xF3n</h2>
        <p>
          La mayor\xEDa de los cambios que la gente dice querer nunca ocurren porque no cambi\xF3 la percepci\xF3n desde la cual act\xFAa.
        </p>
        <p>
          Siguen mirando el mundo desde la misma estructura mental.<br/>
          Siguen interpretando la realidad con las mismas categor\xEDas.<br/>
          Siguen llamando prudencia al miedo.<br/>
          Siguen llamando paciencia a la postergaci\xF3n.<br/>
          Siguen llamando identidad a la costumbre.
        </p>
        <p>
          Y as\xED no hay revoluci\xF3n posible.<br/>
          Ni personal.<br/>
          Ni colectiva.<br/>
          Ni espiritual.<br/>
          Ni pol\xEDtica.<br/>
          Ni existencial.
        </p>
        <p>
          No cambia tu vida cuando dese\xE1s m\xE1s fuerte.<br/>
          Cambia cuando empez\xE1s a ver distinto y, por lo tanto, a decidir distinto.<br/>
          Cambia cuando dej\xE1s de proteger los supuestos que te mantienen peque\xF1o.<br/>
          Cambia cuando acept\xE1s que parte de tu sufrimiento viene de seguir siendo fiel a una versi\xF3n vencida de vos mismo.
        </p>
        <p>
          Eso es lo que estoy atravesando tambi\xE9n en este proceso de refinamiento.
        </p>
        <p>
          No solo estoy ajustando una plataforma.<br/>
          Estoy ajustando la manera de pensarla.<br/>
          La manera de priorizar.<br/>
          La manera de distinguir entre lo esencial y lo accesorio.<br/>
          La manera de convertir una visi\xF3n en algo que pueda respirar en el mundo sin ahogarse bajo su propio peso.
        </p>
        <p>
          Y en ese trabajo hay algo profundamente humano.
        </p>
        <p>
          Porque al final, <strong>toda gran obra exterior termina siendo un espejo</strong>.
        </p>

        <h2>La prueba no destruye la visi\xF3n \u2014 la purifica</h2>
        <p>
          Hay gente que teme poner a prueba sus ideas porque cree que, si no resisten, entonces nunca fueron valiosas.
        </p>
        <p>
          Yo creo lo contrario.
        </p>
        <p>
          Lo que merece existir no le teme al fuego.<br/>
          Le teme m\xE1s a la complacencia que a la prueba.
        </p>
        <p>
          La validaci\xF3n real no mata la visi\xF3n.<br/>
          La refina.<br/>
          La vuelve sobria.<br/>
          La vuelve precisa.<br/>
          La vuelve capaz de encarnar.
        </p>
        <p>
          <strong>Una idea que no tolera iteraci\xF3n no es una visi\xF3n. Es un capricho.</strong><br/>
          <strong>Una misi\xF3n que no soporta correcci\xF3n no es una misi\xF3n. Es vanidad disfrazada.</strong>
        </p>
        <p>
          Por eso hay momentos en los que el mayor acto de fidelidad hacia lo que uno quiere construir no es insistir ciegamente.
        </p>
        <p>
          Es detenerse.<br/>
          Mirar de nuevo.<br/>
          Cortar.<br/>
          Reordenar.<br/>
          Probar otra vez.<br/>
          Y volver a entrar.
        </p>

        <h2>La vida exige participaci\xF3n</h2>
        <p>
          Nadie va a venir a actualizar tus supuestos por vos.
        </p>
        <p>
          Nadie va a corregir desde afuera la arquitectura interna con la que interpret\xE1s el mundo. Nadie va a instalarte prop\xF3sito como si fuera una aplicaci\xF3n. Nadie va a rescatarte de una vida repetida si vos segu\xEDs defendiendo las piezas que ya no sirven.
        </p>
        <p>
          La vida no responde a declaraciones.<br/>
          <strong>Responde a participaci\xF3n.</strong>
        </p>
        <p>
          Te pide presencia.<br/>
          Te pide honestidad.<br/>
          Te pide coraje para revisar.<br/>
          Te pide la fortaleza emocional de no quebrarte cada vez que descubr\xEDs que algo que amabas necesita cambiar.
        </p>
        <p>
          Y s\xED, eso cuesta.
        </p>
        <p>
          Cuesta tiempo.<br/>
          Cuesta energ\xEDa.<br/>
          Cuesta foco.<br/>
          Cuesta partes del ego.<br/>
          Cuesta despedirse de ciertas certezas.
        </p>
        <p>
          Pero eso es crecer.
        </p>
        <p>
          No volverse m\xE1s grande en apariencia.<br/>
          <strong>Volverse m\xE1s verdadero en estructura.</strong>
        </p>

        <h2>El cambio que necesitamos no va a ocurrir solo</h2>
        <p>
          Hay algo que tengo cada vez m\xE1s claro: el cambio que necesitamos \u2014 en la vida y en el mundo \u2014 no va a surgir de personas que simplemente opinen mejor.
        </p>
        <p>
          Va a surgir de personas dispuestas a revisar la arquitectura desde la cual viven.
        </p>
        <p>
          Personas capaces de mirar sus supuestos de frente.<br/>
          Capaces de ponerlos a prueba.<br/>
          Capaces de pagar el costo de refinarse.<br/>
          Capaces de cambiar de verdad.
        </p>
        <p>
          Porque nada cambia si nosotros no cambiamos.<br/>
          Y nosotros no cambiamos mientras sigamos negociando con lo que ya sabemos que no funciona.
        </p>
        <p>
          A veces la evoluci\xF3n no empieza con una certeza nueva.<br/>
          Empieza con una traici\xF3n necesaria.
        </p>
        <p>
          La traici\xF3n a una vieja versi\xF3n de uno mismo.<br/>
          La renuncia a una forma de mirar que ya qued\xF3 chica.<br/>
          El abandono de una estructura que sirvi\xF3 ayer, pero que hoy impide el nacimiento de algo mayor.
        </p>
        <p>
          <strong>Ah\xED empieza todo.</strong>
        </p>
        <p>
          No cuando ten\xE9s todo claro.<br/>
          No cuando desaparece el miedo.<br/>
          No cuando el camino se ordena solo.
        </p>
        <p>
          Empieza cuando decid\xEDs entrar al taller, agarrar el martillo, mirar lo que construiste y tener el coraje de decir:
        </p>

        <blockquote>
          <em>Esto todav\xEDa no est\xE1 listo.</em><br/>
          <em>Esto tiene que pasar por fuego.</em><br/>
          <em>Y yo tambi\xE9n.</em>
        </blockquote>

        <p>
          <em>Si algo de esto resuena en vos, no necesit\xE1s permiso para firmarlo. Solo recordarte cada ma\xF1ana: lo que no se refina, se repite. Y lo que se repite sin conciencia, te condena.</em>
        </p>
      </article>
    `
      }
    };
  }
});

// server/blogContentEnhancements.ts
var applyBlogContentEnhancements, applyEnhancementsToList;
var init_blogContentEnhancements = __esm({
  "server/blogContentEnhancements.ts"() {
    "use strict";
    init_blogContent();
    applyBlogContentEnhancements = (post) => {
      if (!post?.slug) {
        return post;
      }
      const update = blogContentUpdates[post.slug];
      if (!update) {
        return post;
      }
      return {
        ...post,
        content: update.content ?? post.content,
        excerpt: update.excerpt ?? post.excerpt
      };
    };
    applyEnhancementsToList = (posts) => {
      return posts.map((post) => applyBlogContentEnhancements(post));
    };
  }
});

// shared/course-content.ts
import { marked } from "marked";
import { z } from "zod";
var COURSE_CATEGORY_VALUES, COURSE_LEVEL_VALUES, LESSON_TYPE_VALUES, QUIZ_QUESTION_TYPE_VALUES, COURSE_CONTENT_SCHEMA_VERSION, optionalText, seoFieldsSchema, lessonManifestEntrySchema, quizQuestionManifestSchema, quizManifestSchema, lessonRekeySchema, courseManifestSchema;
var init_course_content = __esm({
  "shared/course-content.ts"() {
    "use strict";
    COURSE_CATEGORY_VALUES = [
      "vision",
      "action",
      "community",
      "reflection",
      "hombre-gris",
      "economia",
      "comunicacion",
      "civica"
    ];
    COURSE_LEVEL_VALUES = [
      "beginner",
      "intermediate",
      "advanced"
    ];
    LESSON_TYPE_VALUES = [
      "text",
      "video",
      "interactive",
      "document"
    ];
    QUIZ_QUESTION_TYPE_VALUES = [
      "multiple_choice",
      "true_false",
      "short_answer"
    ];
    COURSE_CONTENT_SCHEMA_VERSION = 1;
    optionalText = z.string().trim().min(1).optional().nullable();
    seoFieldsSchema = z.object({
      seoTitle: optionalText,
      seoDescription: optionalText,
      searchSummary: optionalText,
      ogImageUrl: optionalText,
      lastReviewedAt: optionalText,
      indexable: z.boolean().optional()
    });
    lessonManifestEntrySchema = seoFieldsSchema.extend({
      key: z.string().trim().min(1).max(120),
      title: z.string().trim().min(1),
      description: optionalText,
      type: z.enum(LESSON_TYPE_VALUES),
      duration: z.number().int().nonnegative().optional().nullable(),
      orderIndex: z.number().int().nonnegative(),
      isRequired: z.boolean().default(true),
      contentFile: z.string().trim().min(1),
      videoUrl: optionalText,
      documentUrl: optionalText,
      legacyLessonId: z.number().int().positive().optional().nullable()
    });
    quizQuestionManifestSchema = z.object({
      question: z.string().trim().min(1),
      type: z.enum(QUIZ_QUESTION_TYPE_VALUES),
      options: z.array(z.string()).optional().nullable(),
      correctAnswer: z.unknown(),
      explanation: optionalText,
      points: z.number().int().positive().default(1),
      orderIndex: z.number().int().nonnegative(),
      legacyQuestionId: z.number().int().positive().optional().nullable()
    });
    quizManifestSchema = z.object({
      title: z.string().trim().min(1),
      description: optionalText,
      passingScore: z.number().int().min(0).max(100).default(70),
      timeLimit: z.number().int().positive().optional().nullable(),
      allowRetakes: z.boolean().default(true),
      maxAttempts: z.number().int().positive().optional().nullable(),
      legacyQuizId: z.number().int().positive().optional().nullable(),
      questions: z.array(quizQuestionManifestSchema).default([])
    });
    lessonRekeySchema = z.object({
      fromKey: z.string().trim().min(1).max(120),
      toKey: z.string().trim().min(1).max(120),
      legacyLessonId: z.number().int().positive().optional().nullable()
    });
    courseManifestSchema = seoFieldsSchema.extend({
      schemaVersion: z.number().int().default(COURSE_CONTENT_SCHEMA_VERSION),
      slug: z.string().trim().min(1),
      title: z.string().trim().min(1),
      description: z.string().trim().min(1),
      excerpt: optionalText,
      category: z.enum(COURSE_CATEGORY_VALUES),
      level: z.enum(COURSE_LEVEL_VALUES),
      duration: z.number().int().nonnegative().optional().nullable(),
      thumbnailUrl: optionalText,
      videoUrl: optionalText,
      orderIndex: z.number().int().default(0),
      isPublished: z.boolean().default(true),
      isFeatured: z.boolean().default(false),
      requiresAuth: z.boolean().default(false),
      authorId: z.number().int().positive().optional().nullable(),
      legacyCourseId: z.number().int().positive().optional().nullable(),
      quizFile: z.string().trim().min(1).optional().nullable(),
      rekeys: z.array(lessonRekeySchema).default([]),
      lessons: z.array(lessonManifestEntrySchema)
    });
    marked.setOptions({
      gfm: true,
      breaks: false
    });
  }
});

// server/course-content-store.ts
import { and, asc, desc, eq, ilike, or, sql as sql3 } from "drizzle-orm";
function isPublicCourseRevision(revision) {
  return revision.isPublished === true;
}
function getExternalCourseId(definition) {
  return definition.legacyCourseId ?? definition.id;
}
function getExternalLessonId(identity) {
  return identity.legacyLessonId ?? identity.id;
}
function getExternalQuizId(quiz) {
  return quiz.legacyQuizId ?? quiz.id;
}
function getExternalQuestionId(question) {
  return question.legacyQuestionId ?? question.id;
}
function mapPublishedCourse(definition, revision, extras) {
  return {
    id: getExternalCourseId(definition),
    courseDefinitionId: definition.id,
    legacyCourseId: definition.legacyCourseId,
    title: revision.title,
    slug: definition.slug,
    description: revision.description,
    excerpt: revision.excerpt,
    category: revision.category,
    level: revision.level,
    duration: revision.duration,
    thumbnailUrl: revision.thumbnailUrl,
    videoUrl: revision.videoUrl,
    orderIndex: revision.orderIndex,
    isPublished: revision.isPublished,
    isFeatured: revision.isFeatured,
    requiresAuth: revision.requiresAuth,
    authorId: revision.authorId,
    viewCount: definition.viewCount ?? 0,
    createdAt: definition.createdAt,
    updatedAt: definition.updatedAt,
    lessonCount: extras?.lessonCount,
    hasQuiz: extras?.hasQuiz,
    seoTitle: revision.seoTitle,
    seoDescription: revision.seoDescription,
    searchSummary: revision.searchSummary,
    ogImageUrl: revision.ogImageUrl,
    lastReviewedAt: revision.lastReviewedAt,
    indexable: revision.indexable
  };
}
function mapPublishedLesson(identity, lesson, courseId) {
  return {
    id: getExternalLessonId(identity),
    lessonIdentityId: identity.id,
    legacyLessonId: identity.legacyLessonId,
    courseId,
    title: lesson.title,
    description: lesson.description,
    content: lesson.contentHtml,
    orderIndex: lesson.orderIndex,
    type: lesson.type,
    videoUrl: lesson.videoUrl,
    documentUrl: lesson.documentUrl,
    duration: lesson.duration,
    isRequired: lesson.isRequired,
    createdAt: lesson.createdAt,
    updatedAt: lesson.createdAt,
    key: identity.key,
    searchSummary: lesson.searchSummary,
    seoTitle: lesson.seoTitle,
    seoDescription: lesson.seoDescription,
    indexable: lesson.indexable
  };
}
function mapPublishedQuiz(courseId, quiz) {
  return {
    id: getExternalQuizId(quiz),
    quizRevisionId: quiz.id,
    legacyQuizId: quiz.legacyQuizId,
    courseId,
    title: quiz.title,
    description: quiz.description,
    passingScore: quiz.passingScore,
    timeLimit: quiz.timeLimit,
    allowRetakes: quiz.allowRetakes,
    maxAttempts: quiz.maxAttempts,
    createdAt: quiz.createdAt,
    updatedAt: quiz.updatedAt
  };
}
function mapPublishedQuizQuestion(question, quizId) {
  return {
    id: getExternalQuestionId(question),
    quizQuestionRevisionId: question.id,
    legacyQuestionId: question.legacyQuestionId,
    quizId,
    question: question.question,
    type: question.type,
    options: question.options,
    correctAnswer: question.correctAnswer,
    explanation: question.explanation,
    points: question.points,
    orderIndex: question.orderIndex,
    createdAt: question.createdAt
  };
}
async function getPublishedCourseRecordBySlug(slug) {
  const [definition] = await db.select().from(courseDefinitions).where(eq(courseDefinitions.slug, slug)).limit(1);
  if (!definition?.currentPublishedRevisionId) {
    return void 0;
  }
  const [revision] = await db.select().from(courseRevisions).where(eq(courseRevisions.id, definition.currentPublishedRevisionId)).limit(1);
  if (!revision || !isPublicCourseRevision(revision)) return void 0;
  return { definition, revision };
}
async function getCurrentCourseRecordByDefinitionId(courseDefinitionId) {
  const [definition] = await db.select().from(courseDefinitions).where(eq(courseDefinitions.id, courseDefinitionId)).limit(1);
  if (!definition?.currentPublishedRevisionId) {
    return void 0;
  }
  const [revision] = await db.select().from(courseRevisions).where(eq(courseRevisions.id, definition.currentPublishedRevisionId)).limit(1);
  if (!revision) return void 0;
  return { definition, revision };
}
async function hasCurrentRevisionForCourseSlug(slug) {
  const [definition] = await db.select({ currentPublishedRevisionId: courseDefinitions.currentPublishedRevisionId }).from(courseDefinitions).where(eq(courseDefinitions.slug, slug)).limit(1);
  return Boolean(definition?.currentPublishedRevisionId);
}
async function hasCurrentRevisionForCourseId(courseId) {
  const [definitionByLegacy] = await db.select({ currentPublishedRevisionId: courseDefinitions.currentPublishedRevisionId }).from(courseDefinitions).where(eq(courseDefinitions.legacyCourseId, courseId)).limit(1);
  if (definitionByLegacy?.currentPublishedRevisionId) {
    return true;
  }
  const directRecord = await getCurrentCourseRecordByDefinitionId(courseId);
  if (directRecord) {
    return true;
  }
  return false;
}
async function resolvePublishedCourseDefinitionId(courseId) {
  const [definition] = await db.select().from(courseDefinitions).where(eq(courseDefinitions.legacyCourseId, courseId)).limit(1);
  if (!definition?.currentPublishedRevisionId) {
    const directRecord = await getCurrentCourseRecordByDefinitionId(courseId);
    return directRecord?.definition.id;
  }
  return definition.id;
}
async function getPublishedCourseRecordById(courseId) {
  const definitionId = await resolvePublishedCourseDefinitionId(courseId);
  if (!definitionId) {
    return void 0;
  }
  const record = await getCurrentCourseRecordByDefinitionId(definitionId);
  if (!record || !isPublicCourseRevision(record.revision)) {
    return void 0;
  }
  return record;
}
async function getPublishedCourseBySlug(slug) {
  const record = await getPublishedCourseRecordBySlug(slug);
  if (!record) return void 0;
  const lessons = await db.select({ id: courseRevisionLessons.id }).from(courseRevisionLessons).where(eq(courseRevisionLessons.courseRevisionId, record.revision.id));
  const [quiz] = await db.select().from(courseRevisionQuizzes).where(eq(courseRevisionQuizzes.courseRevisionId, record.revision.id)).limit(1);
  return mapPublishedCourse(record.definition, record.revision, {
    lessonCount: lessons.length,
    hasQuiz: Boolean(quiz)
  });
}
async function getPublishedCourseById(courseId) {
  const record = await getPublishedCourseRecordById(courseId);
  if (!record) return void 0;
  return mapPublishedCourse(record.definition, record.revision);
}
async function incrementPublishedCourseView(courseId) {
  await db.update(courseDefinitions).set({
    viewCount: sql3`${courseDefinitions.viewCount} + 1`,
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  }).where(eq(courseDefinitions.id, courseId));
}
async function getPublishedCourses(filters) {
  const page = filters?.page || 1;
  const limit = filters?.limit || 12;
  const offset = (page - 1) * limit;
  const conditions = [
    sql3`${courseDefinitions.currentPublishedRevisionId} is not null`,
    eq(courseRevisions.isPublished, true)
  ];
  if (filters?.category) {
    conditions.push(eq(courseRevisions.category, filters.category));
  }
  if (filters?.level) {
    conditions.push(eq(courseRevisions.level, filters.level));
  }
  if (filters?.featured === true) {
    conditions.push(eq(courseRevisions.isFeatured, true));
  }
  if (filters?.search) {
    const searchTerm = `%${filters.search}%`;
    conditions.push(or(
      ilike(courseRevisions.title, searchTerm),
      ilike(courseRevisions.description, searchTerm),
      ilike(courseRevisions.searchSummary, searchTerm)
    ));
  }
  const whereCondition = and(...conditions);
  const totalRows = await db.select({ count: sql3`count(*)` }).from(courseDefinitions).innerJoin(courseRevisions, eq(courseRevisions.id, courseDefinitions.currentPublishedRevisionId)).where(whereCondition);
  const total = Number(totalRows[0]?.count || 0);
  let orderByClause;
  if (filters?.sortBy === "popular") {
    orderByClause = [desc(courseDefinitions.viewCount), desc(courseRevisions.orderIndex)];
  } else if (filters?.sortBy === "recent") {
    orderByClause = [desc(courseRevisions.publishedAt), desc(courseDefinitions.createdAt)];
  } else if (filters?.sortBy === "duration") {
    orderByClause = [asc(courseRevisions.duration), desc(courseRevisions.orderIndex)];
  } else {
    orderByClause = [desc(courseRevisions.orderIndex), desc(courseRevisions.publishedAt)];
  }
  const rows = await db.select({
    definition: courseDefinitions,
    revision: courseRevisions,
    lessonCount: sql3`(
        select count(*)
        from ${courseRevisionLessons}
        where ${courseRevisionLessons.courseRevisionId} = ${courseRevisions.id}
      )`,
    hasQuiz: sql3`exists(
        select 1
        from ${courseRevisionQuizzes}
        where ${courseRevisionQuizzes.courseRevisionId} = ${courseRevisions.id}
      )`
  }).from(courseDefinitions).innerJoin(courseRevisions, eq(courseRevisions.id, courseDefinitions.currentPublishedRevisionId)).where(whereCondition).orderBy(...orderByClause).limit(limit).offset(offset);
  return {
    courses: rows.map(
      (row) => mapPublishedCourse(row.definition, row.revision, {
        lessonCount: Number(row.lessonCount || 0),
        hasQuiz: Boolean(row.hasQuiz)
      })
    ),
    total,
    page,
    limit
  };
}
async function getPublishedCourseWithLessons(courseId) {
  const record = await getPublishedCourseRecordById(courseId);
  if (!record) return void 0;
  const externalCourseId = getExternalCourseId(record.definition);
  const lessons = await db.select({
    identity: courseLessonIdentities,
    revisionLesson: courseRevisionLessons
  }).from(courseRevisionLessons).innerJoin(
    courseLessonIdentities,
    eq(courseLessonIdentities.id, courseRevisionLessons.lessonIdentityId)
  ).where(eq(courseRevisionLessons.courseRevisionId, record.revision.id)).orderBy(asc(courseRevisionLessons.orderIndex));
  return {
    course: mapPublishedCourse(record.definition, record.revision, {
      lessonCount: lessons.length
    }),
    lessons: lessons.map((row) => mapPublishedLesson(row.identity, row.revisionLesson, externalCourseId))
  };
}
async function getPublishedCourseQuiz(courseId) {
  const record = await getPublishedCourseRecordById(courseId);
  if (!record) return void 0;
  const [quiz] = await db.select().from(courseRevisionQuizzes).where(eq(courseRevisionQuizzes.courseRevisionId, record.revision.id)).limit(1);
  if (!quiz) return void 0;
  const questions = await db.select().from(courseRevisionQuizQuestions).where(eq(courseRevisionQuizQuestions.quizRevisionId, quiz.id)).orderBy(asc(courseRevisionQuizQuestions.orderIndex));
  const externalCourseId = getExternalCourseId(record.definition);
  const externalQuizId = getExternalQuizId(quiz);
  return {
    quiz: mapPublishedQuiz(externalCourseId, quiz),
    questions: questions.map((question) => mapPublishedQuizQuestion(question, externalQuizId)),
    courseRevisionId: record.revision.id,
    quizRevisionId: quiz.id
  };
}
async function getPublishedLessonByIdentityId(lessonIdentityId) {
  const [identityByLegacy] = await db.select().from(courseLessonIdentities).where(eq(courseLessonIdentities.legacyLessonId, lessonIdentityId)).limit(1);
  const identity = identityByLegacy ?? (await db.select().from(courseLessonIdentities).where(eq(courseLessonIdentities.id, lessonIdentityId)).limit(1))[0];
  if (!identity?.courseDefinitionId) {
    return void 0;
  }
  const record = await getPublishedCourseRecordById(identity.courseDefinitionId);
  if (!record) return void 0;
  const [lesson] = await db.select().from(courseRevisionLessons).where(
    and(
      eq(courseRevisionLessons.courseRevisionId, record.revision.id),
      eq(courseRevisionLessons.lessonIdentityId, identity.id)
    )
  ).limit(1);
  if (!lesson) return void 0;
  return {
    identity,
    lesson,
    courseDefinition: record.definition,
    courseRevision: record.revision,
    course: mapPublishedCourse(record.definition, record.revision)
  };
}
async function getPublishedQuizByRevisionQuizId(quizRevisionId) {
  const [quiz] = await db.select().from(courseRevisionQuizzes).where(eq(courseRevisionQuizzes.id, quizRevisionId)).limit(1);
  if (!quiz?.courseRevisionId) return void 0;
  const [courseRevision] = await db.select().from(courseRevisions).where(eq(courseRevisions.id, quiz.courseRevisionId)).limit(1);
  if (!courseRevision?.courseDefinitionId) return void 0;
  const [definition] = await db.select().from(courseDefinitions).where(eq(courseDefinitions.id, courseRevision.courseDefinitionId)).limit(1);
  if (!definition) return void 0;
  const questions = await db.select().from(courseRevisionQuizQuestions).where(eq(courseRevisionQuizQuestions.quizRevisionId, quiz.id)).orderBy(asc(courseRevisionQuizQuestions.orderIndex));
  return {
    definition,
    revision: courseRevision,
    quiz,
    questions
  };
}
async function getCourseDefinitionIdByLegacyCourseId(legacyCourseId) {
  const [definition] = await db.select().from(courseDefinitions).where(eq(courseDefinitions.legacyCourseId, legacyCourseId)).limit(1);
  return definition?.id;
}
async function getCourseExternalIdByDefinitionId(courseDefinitionId) {
  const [definition] = await db.select().from(courseDefinitions).where(eq(courseDefinitions.id, courseDefinitionId)).limit(1);
  return definition ? getExternalCourseId(definition) : void 0;
}
async function getLessonIdentityIdByLegacyLessonId(legacyLessonId) {
  const [identity] = await db.select().from(courseLessonIdentities).where(eq(courseLessonIdentities.legacyLessonId, legacyLessonId)).limit(1);
  return identity?.id;
}
async function getLessonExternalIdByIdentityId(lessonIdentityId) {
  const [identity] = await db.select().from(courseLessonIdentities).where(eq(courseLessonIdentities.id, lessonIdentityId)).limit(1);
  return identity ? getExternalLessonId(identity) : void 0;
}
async function getCurrentRevisionForCourseDefinition(courseDefinitionId) {
  const record = await getCurrentCourseRecordByDefinitionId(courseDefinitionId);
  return record?.revision;
}
async function getLegacyCourseById(courseId) {
  const [course] = await db.select().from(courses).where(eq(courses.id, courseId)).limit(1);
  return course;
}
async function getLegacyLessonById(lessonId) {
  const [lesson] = await db.select().from(courseLessons).where(eq(courseLessons.id, lessonId)).limit(1);
  return lesson;
}
var init_course_content_store = __esm({
  "server/course-content-store.ts"() {
    "use strict";
    init_schema();
    init_db();
    init_course_content();
  }
});

// server/storage.ts
import { eq as eq2, desc as desc2, and as and2, sql as sql4, asc as asc2, gte, or as or2, like, inArray, ilike as ilike2, isNotNull } from "drizzle-orm";
import path from "path";
import { fileURLToPath } from "url";
var ACTION_POINTS, parseNumericJsonArray, stringifyNumericArray, resolveCourseProgressCourseId, resolveCurrentLessonIdentityId, resolveCompletedLessonIdentityIds, resolveCompletedLessonExternalIds, adaptUserCourseProgress, adaptUserLessonProgress, compareCourseOrder, __filename, __dirname, DatabaseStorage, storage;
var init_storage = __esm({
  "server/storage.ts"() {
    "use strict";
    init_schema();
    init_db();
    init_auth();
    init_blogContentEnhancements();
    init_course_content_store();
    ACTION_POINTS = {
      "page_view": 1,
      "commitment": 100,
      "share": 50,
      "community_post": 75,
      "challenge_complete": 200,
      "badge_earned": 150,
      "level_up": 300,
      "lesson_complete": 50,
      "course_complete": 500,
      "quiz_passed": 200,
      "certificate_earned": 300
    };
    parseNumericJsonArray = (value) => {
      if (!value) return [];
      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed.filter((entry) => typeof entry === "number") : [];
      } catch {
        return [];
      }
    };
    stringifyNumericArray = (values) => JSON.stringify(Array.from(new Set(values.filter((value) => typeof value === "number"))));
    resolveCourseProgressCourseId = async (progress) => {
      if (progress?.courseId) return progress.courseId;
      if (progress?.courseDefinitionId) {
        return await getCourseExternalIdByDefinitionId(progress.courseDefinitionId) ?? progress.courseDefinitionId;
      }
      return null;
    };
    resolveCurrentLessonIdentityId = async (progress) => {
      if (progress?.currentLessonId) return progress.currentLessonId;
      if (progress?.currentLessonIdentityId) {
        return await getLessonExternalIdByIdentityId(progress.currentLessonIdentityId) ?? progress.currentLessonIdentityId;
      }
      return null;
    };
    resolveCompletedLessonIdentityIds = async (progress) => {
      const preferred = parseNumericJsonArray(progress?.completedLessonIdentityIds);
      if (preferred.length > 0) {
        return Array.from(new Set(preferred));
      }
      const legacyIds = parseNumericJsonArray(progress?.completedLessons);
      const mapped = await Promise.all(
        legacyIds.map(async (legacyId) => await getLessonIdentityIdByLegacyLessonId(legacyId) ?? legacyId)
      );
      return Array.from(new Set(mapped));
    };
    resolveCompletedLessonExternalIds = async (progress) => {
      const preferred = parseNumericJsonArray(progress?.completedLessons);
      if (preferred.length > 0) {
        return Array.from(new Set(preferred));
      }
      const identityIds = parseNumericJsonArray(progress?.completedLessonIdentityIds);
      const mapped = await Promise.all(
        identityIds.map(async (identityId) => await getLessonExternalIdByIdentityId(identityId) ?? identityId)
      );
      return Array.from(new Set(mapped));
    };
    adaptUserCourseProgress = async (progress) => {
      if (!progress) return void 0;
      const courseId = await resolveCourseProgressCourseId(progress);
      const currentLessonId = await resolveCurrentLessonIdentityId(progress);
      const completedLessonIds = await resolveCompletedLessonExternalIds(progress);
      return {
        ...progress,
        courseId,
        courseDefinitionId: courseId,
        currentLessonId,
        currentLessonIdentityId: currentLessonId,
        completedLessons: stringifyNumericArray(completedLessonIds),
        completedLessonIdentityIds: stringifyNumericArray(completedLessonIds)
      };
    };
    adaptUserLessonProgress = async (progress) => {
      if (!progress) return void 0;
      const lessonId = progress.lessonId ?? (progress.lessonIdentityId ? await getLessonExternalIdByIdentityId(progress.lessonIdentityId) ?? progress.lessonIdentityId : null);
      return {
        ...progress,
        lessonId,
        lessonIdentityId: lessonId
      };
    };
    compareCourseOrder = (left, right, sortBy) => {
      const toTimestamp = (value) => {
        if (!value) return 0;
        const parsed = new Date(value).getTime();
        return Number.isFinite(parsed) ? parsed : 0;
      };
      if (sortBy === "popular") {
        return (right.viewCount ?? 0) - (left.viewCount ?? 0) || (right.orderIndex ?? 0) - (left.orderIndex ?? 0) || toTimestamp(right.createdAt) - toTimestamp(left.createdAt);
      }
      if (sortBy === "recent") {
        return toTimestamp(right.updatedAt) - toTimestamp(left.updatedAt) || toTimestamp(right.createdAt) - toTimestamp(left.createdAt) || (right.orderIndex ?? 0) - (left.orderIndex ?? 0);
      }
      if (sortBy === "duration") {
        return (left.duration ?? Number.MAX_SAFE_INTEGER) - (right.duration ?? Number.MAX_SAFE_INTEGER) || (right.orderIndex ?? 0) - (left.orderIndex ?? 0);
      }
      if (sortBy === "level") {
        const levelRank = {
          beginner: 0,
          intermediate: 1,
          advanced: 2
        };
        return (levelRank[left.level] ?? 999) - (levelRank[right.level] ?? 999) || (right.orderIndex ?? 0) - (left.orderIndex ?? 0) || toTimestamp(right.createdAt) - toTimestamp(left.createdAt);
      }
      return (right.orderIndex ?? 0) - (left.orderIndex ?? 0) || toTimestamp(right.updatedAt) - toTimestamp(left.updatedAt) || toTimestamp(right.createdAt) - toTimestamp(left.createdAt);
    };
    __filename = fileURLToPath(import.meta.url);
    __dirname = path.dirname(__filename);
    DatabaseStorage = class {
      constructor() {
        this.userCommitmentsLocationColumnsEnsured = false;
      }
      async ensureUserCommitmentsLocationColumns() {
        this.userCommitmentsLocationColumnsEnsured = true;
      }
      // User methods
      async getUser(id) {
        const [user] = await db.select().from(users).where(eq2(users.id, id));
        return user;
      }
      async getUserByUsername(username) {
        const [user] = await db.select().from(users).where(eq2(users.username, username));
        return user;
      }
      async getUserByEmail(email) {
        const [user] = await db.select().from(users).where(eq2(users.email, email));
        return user;
      }
      async getAllUsers() {
        return await db.select().from(users);
      }
      async createUser(insertUser) {
        const [user] = await db.insert(users).values(insertUser).returning();
        return user;
      }
      async createUserWithHash(userData) {
        const hashedPassword = await PasswordManager.hash(userData.password);
        const insertUser = {
          ...userData,
          password: hashedPassword
        };
        const [user] = await db.insert(users).values(insertUser).returning();
        return user;
      }
      async verifyUserPassword(username, password) {
        const user = await this.getUserByUsername(username);
        if (!user || !user.isActive) {
          return null;
        }
        const storedPassword = user.password || "";
        const isBcryptHash = typeof storedPassword === "string" && /^\$2[aby]\$\d{2}\$/.test(storedPassword);
        if (!isBcryptHash) {
          if (storedPassword && storedPassword === password) {
            console.warn(`[verifyUserPassword] Plaintext password detected for user "${username}". Upgrading to secure hash.`);
            await this.updatePassword(user.id, password);
            const updatedUser = await this.getUserByUsername(username);
            return updatedUser && updatedUser.isActive ? updatedUser : null;
          }
          return null;
        }
        const isValid = await PasswordManager.verify(password, storedPassword);
        return isValid ? user : null;
      }
      async updateLastLogin(userId) {
        await db.update(users).set({
          lastLogin: (/* @__PURE__ */ new Date()).toISOString(),
          updatedAt: (/* @__PURE__ */ new Date()).toISOString()
        }).where(eq2(users.id, userId));
      }
      async incrementLoginAttempts(username) {
        await db.update(users).set({
          loginAttempts: sql4`login_attempts + 1`,
          lockedUntil: sql4`CASE
          WHEN login_attempts + 1 >= 5 THEN (NOW() + INTERVAL '15 minutes')::text
          ELSE locked_until
        END`,
          updatedAt: (/* @__PURE__ */ new Date()).toISOString()
        }).where(eq2(users.username, username));
      }
      async resetLoginAttempts(username) {
        await db.update(users).set({
          loginAttempts: 0,
          lockedUntil: null,
          updatedAt: (/* @__PURE__ */ new Date()).toISOString()
        }).where(eq2(users.username, username));
      }
      async isUserLocked(username) {
        const user = await this.getUserByUsername(username);
        if (!user || !user.lockedUntil) {
          return false;
        }
        return /* @__PURE__ */ new Date() < new Date(user.lockedUntil);
      }
      async updateUser(userId, updates) {
        const [user] = await db.update(users).set({
          ...updates,
          updatedAt: (/* @__PURE__ */ new Date()).toISOString()
        }).where(eq2(users.id, userId)).returning();
        return user;
      }
      // Email verification methods
      async setEmailVerificationToken(userId, token, expires) {
        await db.update(users).set({
          emailVerificationToken: token,
          emailVerificationExpires: expires.toISOString(),
          updatedAt: (/* @__PURE__ */ new Date()).toISOString()
        }).where(eq2(users.id, userId));
      }
      async verifyEmail(token) {
        const [user] = await db.select().from(users).where(eq2(users.emailVerificationToken, token));
        if (!user) return null;
        if (user.emailVerificationExpires && /* @__PURE__ */ new Date() > new Date(user.emailVerificationExpires)) {
          return null;
        }
        await db.update(users).set({
          emailVerified: true,
          emailVerificationToken: null,
          emailVerificationExpires: null,
          updatedAt: (/* @__PURE__ */ new Date()).toISOString()
        }).where(eq2(users.id, user.id));
        return user;
      }
      // Password reset methods
      async setPasswordResetToken(userId, token, expires) {
        await db.update(users).set({
          passwordResetToken: token,
          passwordResetExpires: expires.toISOString(),
          updatedAt: (/* @__PURE__ */ new Date()).toISOString()
        }).where(eq2(users.id, userId));
      }
      async getUserByPasswordResetToken(token) {
        const [user] = await db.select().from(users).where(eq2(users.passwordResetToken, token));
        if (!user) return null;
        if (user.passwordResetExpires && /* @__PURE__ */ new Date() > new Date(user.passwordResetExpires)) {
          return null;
        }
        return user;
      }
      async updatePassword(userId, newPassword) {
        const { PasswordManager: PasswordManager2 } = await Promise.resolve().then(() => (init_auth(), auth_exports));
        const hashedPassword = await PasswordManager2.hash(newPassword);
        await db.update(users).set({
          password: hashedPassword,
          passwordResetToken: null,
          passwordResetExpires: null,
          updatedAt: (/* @__PURE__ */ new Date()).toISOString()
        }).where(eq2(users.id, userId));
      }
      // 2FA methods
      async enable2FA(userId, secret, backupCodes) {
        await db.update(users).set({
          twoFactorEnabled: true,
          twoFactorSecret: secret,
          twoFactorBackupCodes: JSON.stringify(backupCodes),
          updatedAt: (/* @__PURE__ */ new Date()).toISOString()
        }).where(eq2(users.id, userId));
      }
      async disable2FA(userId) {
        await db.update(users).set({
          twoFactorEnabled: false,
          twoFactorSecret: null,
          twoFactorBackupCodes: null,
          updatedAt: (/* @__PURE__ */ new Date()).toISOString()
        }).where(eq2(users.id, userId));
      }
      async get2FASecret(userId) {
        const user = await this.getUser(userId);
        return user?.twoFactorSecret || null;
      }
      async useBackupCode(userId, codeIndex) {
        const user = await this.getUser(userId);
        if (!user || !user.twoFactorBackupCodes) return;
        const backupCodes = JSON.parse(user.twoFactorBackupCodes);
        backupCodes[codeIndex] = null;
        await db.update(users).set({
          twoFactorBackupCodes: JSON.stringify(backupCodes),
          updatedAt: (/* @__PURE__ */ new Date()).toISOString()
        }).where(eq2(users.id, userId));
      }
      // Dreams methods
      async getDreams() {
        return await db.select().from(dreams).orderBy(desc2(dreams.createdAt));
      }
      async getDreamsByUser(userId) {
        return await db.select().from(dreams).where(eq2(dreams.userId, userId));
      }
      async createDream(insertDream) {
        const dreamData = {
          ...insertDream,
          type: insertDream.type || "dream"
        };
        const [dream] = await db.insert(dreams).values(dreamData).returning();
        return dream;
      }
      // User Resources methods (Mandato Vivo)
      async getUserResources() {
        return await db.select().from(userResources).where(eq2(userResources.isActive, true)).orderBy(desc2(userResources.createdAt));
      }
      async getUserResourcesByUser(userId) {
        return await db.select().from(userResources).where(eq2(userResources.userId, userId));
      }
      async createUserResource(resource) {
        const [created] = await db.insert(userResources).values(resource).returning();
        return created;
      }
      // Territory Mandates (Mandato Vivo)
      async getMandates(level) {
        if (level) {
          return await db.select().from(territoryMandates).where(eq2(territoryMandates.territoryLevel, level)).orderBy(desc2(territoryMandates.generatedAt));
        }
        return await db.select().from(territoryMandates).orderBy(desc2(territoryMandates.generatedAt));
      }
      async getMandateByTerritory(level, name) {
        const [mandate] = await db.select().from(territoryMandates).where(and2(
          eq2(territoryMandates.territoryLevel, level),
          eq2(territoryMandates.territoryName, name)
        )).orderBy(desc2(territoryMandates.version)).limit(1);
        return mandate;
      }
      async createMandate(mandate) {
        const [created] = await db.insert(territoryMandates).values(mandate).returning();
        return created;
      }
      async updateMandate(id, updates) {
        const [updated] = await db.update(territoryMandates).set(updates).where(eq2(territoryMandates.id, id)).returning();
        return updated;
      }
      // Mandate Suggestions (Matchmaker)
      async getSuggestionsByMandate(mandateId) {
        return await db.select().from(mandateSuggestions).where(eq2(mandateSuggestions.mandateId, mandateId)).orderBy(desc2(mandateSuggestions.createdAt));
      }
      async getSuggestionsByTerritory(territoryName) {
        return await db.select().from(mandateSuggestions).where(eq2(mandateSuggestions.territoryName, territoryName)).orderBy(desc2(mandateSuggestions.createdAt));
      }
      async getSuggestionById(id) {
        const [suggestion] = await db.select().from(mandateSuggestions).where(eq2(mandateSuggestions.id, id));
        return suggestion;
      }
      async createSuggestion(suggestion) {
        const [created] = await db.insert(mandateSuggestions).values(suggestion).returning();
        return created;
      }
      async activateSuggestion(id, userId, initiativeId) {
        const [updated] = await db.update(mandateSuggestions).set({
          status: "activated",
          activatedBy: userId,
          initiativeId
        }).where(eq2(mandateSuggestions.id, id)).returning();
        return updated;
      }
      // Community Posts methods
      async getCommunityPosts(type) {
        if (type && type !== "all") {
          return await db.select().from(communityPosts).where(eq2(communityPosts.type, type));
        }
        return await db.select().from(communityPosts).orderBy(desc2(communityPosts.createdAt));
      }
      async getCommunityPostById(id) {
        const [post] = await db.select().from(communityPosts).where(eq2(communityPosts.id, id));
        return post;
      }
      async createCommunityPost(insertPost) {
        const postData = {
          ...insertPost,
          status: "active",
          views: 0,
          expiresAt: null,
          contactEmail: null,
          contactPhone: null,
          updatedAt: (/* @__PURE__ */ new Date()).toISOString()
        };
        const [post] = await db.insert(communityPosts).values(postData).returning();
        return post;
      }
      async updateCommunityPost(id, updates, userId) {
        const [post] = await db.update(communityPosts).set({ ...updates, updatedAt: (/* @__PURE__ */ new Date()).toISOString() }).where(and2(eq2(communityPosts.id, id), eq2(communityPosts.userId, userId))).returning();
        return post;
      }
      async deleteCommunityPost(id, userId) {
        const result = await db.delete(communityPosts).where(and2(eq2(communityPosts.id, id), eq2(communityPosts.userId, userId)));
        return result.changes > 0;
      }
      async getCommunityPostWithDetails(id) {
        const [post] = await db.select().from(communityPosts).where(eq2(communityPosts.id, id));
        if (!post) {
          return void 0;
        }
        let userInfo = null;
        if (post.userId) {
          const [user] = await db.select().from(users).where(eq2(users.id, post.userId));
          if (user) {
            const userInitiativesResult = await db.select({ count: sql4`count(*)` }).from(communityPosts).where(eq2(communityPosts.userId, post.userId));
            const initiativesCount = Number(userInitiativesResult[0]?.count || 0);
            const userPosts = await db.select({ id: communityPosts.id }).from(communityPosts).where(eq2(communityPosts.userId, post.userId));
            const postIds = userPosts.map((p) => p.id);
            let totalMembers = 0;
            if (postIds.length > 0) {
              const membersResult = await db.select({ count: sql4`count(*)` }).from(initiativeMembers).where(inArray(initiativeMembers.postId, postIds));
              totalMembers = Number(membersResult[0]?.count || 0);
            }
            userInfo = {
              id: user.id,
              name: user.name,
              username: user.username,
              email: user.email,
              location: user.location,
              stats: {
                initiativesCreated: initiativesCount,
                totalMembers
              }
            };
          }
        }
        return {
          ...post,
          user: userInfo,
          impulsor: userInfo
        };
      }
      async getUserCommunityPosts(userId) {
        return await db.select().from(communityPosts).where(eq2(communityPosts.userId, userId)).orderBy(desc2(communityPosts.createdAt));
      }
      // Community Interactions
      async createPostInteraction(data) {
        const interactionData = {
          ...data,
          status: "pending",
          updatedAt: (/* @__PURE__ */ new Date()).toISOString()
        };
        const [interaction] = await db.insert(communityPostInteractions).values(interactionData).returning();
        return interaction;
      }
      async getPostInteractions(postId, ownerId) {
        const query = db.select().from(communityPostInteractions).where(eq2(communityPostInteractions.postId, postId)).orderBy(desc2(communityPostInteractions.createdAt));
        return await query;
      }
      async updateInteractionStatus(id, status, userId) {
        const result = await db.update(communityPostInteractions).set({ status, updatedAt: (/* @__PURE__ */ new Date()).toISOString() }).where(and2(eq2(communityPostInteractions.id, id), eq2(communityPostInteractions.userId, userId)));
        return result.changes > 0;
      }
      async getUserInteractions(userId) {
        return await db.select().from(communityPostInteractions).where(eq2(communityPostInteractions.userId, userId)).orderBy(desc2(communityPostInteractions.createdAt));
      }
      // Community Messages
      async createCommunityMessage(data) {
        const [message] = await db.insert(communityMessages).values(data).returning();
        return message;
      }
      async getUserMessages(userId) {
        return await db.select().from(communityMessages).where(eq2(communityMessages.receiverId, userId)).orderBy(desc2(communityMessages.createdAt));
      }
      async markMessageAsRead(id, userId) {
        const result = await db.update(communityMessages).set({ read: true }).where(and2(eq2(communityMessages.id, id), eq2(communityMessages.receiverId, userId)));
        return result.changes > 0;
      }
      async getUnreadMessageCount(userId) {
        const result = await db.select({ count: sql4`count(*)` }).from(communityMessages).where(and2(eq2(communityMessages.receiverId, userId), eq2(communityMessages.read, false)));
        return result[0]?.count || 0;
      }
      // Community Activity
      async recordPostActivity(data) {
        const activityData = {
          ...data,
          activityType: data.activityType
        };
        const [activity] = await db.insert(communityPostActivity).values(activityData).returning();
        return activity;
      }
      async getPostAnalytics(postId, ownerId) {
        const post = await db.select().from(communityPosts).where(and2(eq2(communityPosts.id, postId), eq2(communityPosts.userId, ownerId)));
        if (!post.length) return null;
        const activities = await db.select().from(communityPostActivity).where(eq2(communityPostActivity.postId, postId));
        const interactions = await db.select().from(communityPostInteractions).where(eq2(communityPostInteractions.postId, postId));
        return {
          post: post[0],
          totalViews: activities.filter((a) => a.activityType === "view").length,
          totalInteractions: interactions.length,
          interactionBreakdown: {
            apply: interactions.filter((i) => i.type === "apply").length,
            interest: interactions.filter((i) => i.type === "interest").length,
            volunteer: interactions.filter((i) => i.type === "volunteer").length,
            save: interactions.filter((i) => i.type === "save").length
          },
          activities: activities.slice(0, 10),
          // Recent 10 activities
          interactions: interactions.slice(0, 10)
          // Recent 10 interactions
        };
      }
      async getUserActivityHistory(userId) {
        return await db.select().from(communityPostActivity).where(eq2(communityPostActivity.userId, userId)).orderBy(desc2(communityPostActivity.createdAt));
      }
      // Resources methods
      async getResources() {
        return await db.select().from(resources);
      }
      async getResourcesByCategory(category) {
        return await db.select().from(resources).where(eq2(resources.category, category));
      }
      async createResource(insertResource) {
        const [resource] = await db.insert(resources).values(insertResource).returning();
        return resource;
      }
      // Stories methods
      async getStories() {
        return await db.select().from(stories);
      }
      async getStoryById(id) {
        const [story] = await db.select().from(stories).where(eq2(stories.id, id));
        return story;
      }
      async createStory(insertStory) {
        const [story] = await db.insert(stories).values(insertStory).returning();
        return story;
      }
      // Initialize with sample resources if needed
      async initSampleData() {
        const existingResources = await this.getResources();
        if (existingResources.length === 0) {
          const resources2 = [
            {
              title: "Pensamiento sist\xE9mico",
              description: "Comprende c\xF3mo las partes de un sistema se relacionan e influyen entre s\xED para crear soluciones integrales.",
              category: "systemic-thinking",
              url: "/resources/systemic-thinking"
            },
            {
              title: "Cambio de h\xE1bitos",
              description: "Metodolog\xEDas pr\xE1cticas para transformar comportamientos individuales y colectivos de forma sostenible.",
              category: "habit-change",
              url: "/resources/habit-change"
            },
            {
              title: "Proyectos ciudadanos",
              description: "Gu\xEDas paso a paso para dise\xF1ar, implementar y evaluar iniciativas con impacto comunitario positivo.",
              category: "citizen-projects",
              url: "/resources/citizen-projects"
            },
            {
              title: "Dise\xF1o idealizado",
              description: "Una metodolog\xEDa para reimaginar sistemas desde cero en vez de reformar lo que ya no funciona.",
              category: "idealized-design",
              url: "/resources/idealized-design"
            },
            {
              title: "Comunicaci\xF3n efectiva",
              description: "Herramientas para dialogar, construir consensos y resolver conflictos en espacios de participaci\xF3n.",
              category: "effective-communication",
              url: "/resources/effective-communication"
            },
            {
              title: "Biblioteca digital",
              description: "Colecci\xF3n de libros, art\xEDculos y documentos sobre transformaci\xF3n social, participaci\xF3n ciudadana y desarrollo comunitario.",
              category: "digital-library",
              url: "/resources/digital-library"
            }
          ];
          for (const resource of resources2) {
            await this.createResource(resource);
          }
        }
      }
      // ==================== GAMIFICATION METHODS ====================
      // User Levels
      async getUserLevel(userId) {
        const level = await db.query.userLevels.findFirst({
          where: eq2(userLevels.userId, userId),
          with: {
            user: true
          }
        });
        return level;
      }
      async createUserLevel(userId) {
        const [newLevel] = await db.insert(userLevels).values({
          userId,
          currentLevel: 1,
          experience: 0,
          experienceToNext: 500,
          streak: 0
        }).returning();
        return newLevel;
      }
      async updateUserExperience(userId, experienceGained) {
        const userLevel = await this.getUserLevel(userId);
        if (!userLevel) {
          await this.createUserLevel(userId);
          return await this.updateUserExperience(userId, experienceGained);
        }
        const newExperience = userLevel.experience + experienceGained;
        const newLevel = Math.floor(newExperience / 500) + 1;
        const experienceToNext = newLevel * 500 - newExperience;
        const [updatedLevel] = await db.update(userLevels).set({
          experience: newExperience,
          currentLevel: newLevel,
          experienceToNext,
          updatedAt: (/* @__PURE__ */ new Date()).toISOString()
        }).where(eq2(userLevels.userId, userId)).returning();
        return updatedLevel;
      }
      async updateStreak(userId) {
        const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
        const userLevel = await this.getUserLevel(userId);
        if (!userLevel) {
          await this.createUserLevel(userId);
          return await this.updateStreak(userId);
        }
        const lastActivityDate = userLevel.lastActivityDate;
        const yesterday = /* @__PURE__ */ new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split("T")[0];
        let newStreak = userLevel.streak;
        if (lastActivityDate === yesterdayStr) {
          newStreak += 1;
        } else if (lastActivityDate !== today) {
          newStreak = 1;
        }
        const [updatedLevel] = await db.update(userLevels).set({
          streak: newStreak,
          lastActivityDate: today,
          updatedAt: (/* @__PURE__ */ new Date()).toISOString()
        }).where(eq2(userLevels.userId, userId)).returning();
        return updatedLevel;
      }
      // Challenges
      async getChallenges(filters) {
        let query = db.query.challenges.findMany({
          with: {
            steps: {
              orderBy: [asc2(challengeSteps.orderIndex)]
            }
          },
          orderBy: [asc2(challenges.orderIndex)]
        });
        if (filters) {
          const conditions = [];
          if (filters.level) conditions.push(eq2(challenges.level, filters.level));
          if (filters.frequency) conditions.push(eq2(challenges.frequency, filters.frequency));
          if (filters.category) conditions.push(eq2(challenges.category, filters.category));
          if (filters.difficulty) conditions.push(eq2(challenges.difficulty, filters.difficulty));
          if (conditions.length > 0) {
            query = db.query.challenges.findMany({
              where: and2(...conditions),
              with: {
                steps: {
                  orderBy: [asc2(challengeSteps.orderIndex)]
                }
              },
              orderBy: [asc2(challenges.orderIndex)]
            });
          }
        }
        return await query;
      }
      async getChallenge(challengeId) {
        return await db.query.challenges.findFirst({
          where: eq2(challenges.id, challengeId),
          with: {
            steps: {
              orderBy: [asc2(challengeSteps.orderIndex)]
            }
          }
        });
      }
      async getChallengeSteps(challengeId) {
        return await db.query.challengeSteps.findMany({
          where: eq2(challengeSteps.challengeId, challengeId),
          orderBy: [asc2(challengeSteps.orderIndex)]
        });
      }
      // User Challenge Progress
      async getUserChallengeProgress(userId) {
        return await db.query.userChallengeProgress.findMany({
          where: eq2(userChallengeProgress.userId, userId),
          with: {
            challenge: {
              with: {
                steps: {
                  orderBy: [asc2(challengeSteps.orderIndex)]
                }
              }
            }
          }
        });
      }
      async startChallenge(userId, challengeId) {
        const [progress] = await db.insert(userChallengeProgress).values({
          userId,
          challengeId,
          status: "in_progress",
          currentStep: 0,
          startedAt: (/* @__PURE__ */ new Date()).toISOString(),
          lastActivityAt: (/* @__PURE__ */ new Date()).toISOString()
        }).returning();
        return progress;
      }
      async updateChallengeProgress(userId, challengeId, currentStep, completedSteps) {
        const [progress] = await db.update(userChallengeProgress).set({
          currentStep,
          completedSteps: JSON.stringify(completedSteps),
          lastActivityAt: (/* @__PURE__ */ new Date()).toISOString()
        }).where(
          and2(
            eq2(userChallengeProgress.userId, userId),
            eq2(userChallengeProgress.challengeId, challengeId)
          )
        ).returning();
        return progress;
      }
      async completeChallenge(userId, challengeId) {
        const [progress] = await db.update(userChallengeProgress).set({
          status: "completed",
          completedAt: (/* @__PURE__ */ new Date()).toISOString(),
          lastActivityAt: (/* @__PURE__ */ new Date()).toISOString()
        }).where(
          and2(
            eq2(userChallengeProgress.userId, userId),
            eq2(userChallengeProgress.challengeId, challengeId)
          )
        ).returning();
        const challenge = await this.getChallenge(challengeId);
        if (challenge) {
          await this.updateUserExperience(userId, challenge.experience);
          await this.updateStreak(userId);
        }
        return progress;
      }
      // Badges
      async getBadges() {
        return await db.query.badges.findMany({
          orderBy: [asc2(badges.orderIndex)]
        });
      }
      async getUserBadges(userId) {
        return await db.query.userBadges.findMany({
          where: eq2(userBadges.userId, userId),
          with: {
            badge: true
          }
        });
      }
      async awardBadge(userId, badgeId) {
        const existingBadge = await db.query.userBadges.findFirst({
          where: and2(
            eq2(userBadges.userId, userId),
            eq2(userBadges.badgeId, badgeId)
          )
        });
        if (existingBadge) {
          return existingBadge;
        }
        const [userBadge] = await db.insert(userBadges).values({
          userId,
          badgeId,
          earnedAt: (/* @__PURE__ */ new Date()).toISOString()
        }).returning();
        const badge = await db.query.badges.findFirst({
          where: eq2(badges.id, badgeId)
        });
        if (badge && badge.experienceReward > 0) {
          await this.updateUserExperience(userId, badge.experienceReward);
        }
        return userBadge;
      }
      async checkBadgeRequirements(userId) {
        const userLevel = await this.getUserLevel(userId);
        const userProgress2 = await this.getUserChallengeProgress(userId);
        const userBadges2 = await this.getUserBadges(userId);
        if (!userLevel) return [];
        const completedChallenges = userProgress2.filter((p) => p.status === "completed").length;
        const earnedBadgeIds = userBadges2.map((ub) => ub.badgeId);
        const allBadges = await this.getBadges();
        const newBadges = [];
        for (const badge of allBadges) {
          if (earnedBadgeIds.includes(badge.id)) continue;
          let shouldAward = false;
          const requirementData = JSON.parse(badge.requirementData || "{}");
          switch (badge.category) {
            case "level":
              if (requirementData.level && userLevel.currentLevel >= requirementData.level) {
                shouldAward = true;
              }
              break;
            case "challenge":
              if (requirementData.challengesCompleted && completedChallenges >= requirementData.challengesCompleted) {
                shouldAward = true;
              }
              break;
            case "streak":
              if (requirementData.streak && userLevel.streak >= requirementData.streak) {
                shouldAward = true;
              }
              break;
          }
          if (shouldAward) {
            const newBadge = await this.awardBadge(userId, badge.id);
            newBadges.push(newBadge);
          }
        }
        return newBadges;
      }
      // Activity & Stats
      async getUserStats(userId) {
        const userLevel = await this.getUserLevel(userId);
        const userProgress2 = await this.getUserChallengeProgress(userId);
        const userBadges2 = await this.getUserBadges(userId);
        const completedChallenges = userProgress2.filter((p) => p.status === "completed").length;
        const totalChallenges = userProgress2.length;
        return {
          level: userLevel?.currentLevel || 1,
          experience: userLevel?.experience || 0,
          experienceToNext: userLevel?.experienceToNext || 500,
          streak: userLevel?.streak || 0,
          completedChallenges,
          totalChallenges,
          badgesEarned: userBadges2.length,
          lastActivity: userLevel?.lastActivityDate
        };
      }
      async recordDailyActivity(userId, experienceGained, challengesCompleted, actionsCompleted) {
        const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
        const existingActivity = await db.query.userDailyActivity.findFirst({
          where: and2(
            eq2(userDailyActivity.userId, userId),
            eq2(userDailyActivity.date, today)
          )
        });
        if (existingActivity) {
          const [updated] = await db.update(userDailyActivity).set({
            experienceGained: existingActivity.experienceGained + experienceGained,
            challengesCompleted: existingActivity.challengesCompleted + challengesCompleted,
            actionsCompleted: existingActivity.actionsCompleted + actionsCompleted
          }).where(eq2(userDailyActivity.id, existingActivity.id)).returning();
          return updated;
        } else {
          const [newActivity] = await db.insert(userDailyActivity).values({
            userId,
            date: today,
            experienceGained,
            challengesCompleted,
            actionsCompleted
          }).returning();
          return newActivity;
        }
      }
      async getUserActivity(userId, days = 30) {
        const startDate = /* @__PURE__ */ new Date();
        startDate.setDate(startDate.getDate() - days);
        const startDateStr = startDate.toISOString().split("T")[0];
        return await db.query.userDailyActivity.findMany({
          where: and2(
            eq2(userDailyActivity.userId, userId),
            gte(userDailyActivity.date, startDateStr)
          ),
          orderBy: [desc2(userDailyActivity.date)]
        });
      }
      // ==================== BLOG METHODS ====================
      async getBlogPosts(filters) {
        try {
          const offset = filters?.page ? (filters.page - 1) * (filters.limit || 10) : 0;
          const limit = filters?.limit || 10;
          let query = db.select({
            id: blogPosts.id,
            title: blogPosts.title,
            slug: blogPosts.slug,
            excerpt: blogPosts.excerpt,
            content: blogPosts.content,
            authorId: blogPosts.authorId,
            publishedAt: blogPosts.publishedAt,
            category: blogPosts.category,
            featured: blogPosts.featured,
            imageUrl: blogPosts.imageUrl,
            videoUrl: blogPosts.videoUrl,
            viewCount: blogPosts.viewCount,
            type: blogPosts.type
          }).from(blogPosts);
          const conditions = [];
          if (filters?.type && typeof filters.type === "string" && filters.type.trim() !== "") {
            conditions.push(eq2(blogPosts.type, filters.type));
          }
          if (filters?.category && typeof filters.category === "string" && filters.category.trim() !== "") {
            conditions.push(eq2(blogPosts.category, filters.category));
          }
          if (filters?.featured !== void 0 && filters.featured !== null) {
            conditions.push(eq2(blogPosts.featured, filters.featured));
          }
          if (filters?.search && typeof filters.search === "string" && filters.search.trim() !== "") {
            conditions.push(
              or2(
                like(blogPosts.title, `%${filters.search}%`),
                like(blogPosts.excerpt, `%${filters.search}%`),
                like(blogPosts.content, `%${filters.search}%`)
              )
            );
          }
          if (conditions.length === 1) {
            query = query.where(conditions[0]);
          } else if (conditions.length > 1) {
            query = query.where(and2(...conditions));
          }
          const allPosts = await query.orderBy(desc2(blogPosts.publishedAt)).limit(limit).offset(offset);
          console.log(`[getBlogPosts] Found ${allPosts.length} posts with filters:`, filters);
          if (allPosts.length === 0) {
            console.log("[getBlogPosts] No posts found, returning empty array");
            return [];
          }
          const postIds = allPosts.map((p) => p.id);
          let allTags = [];
          let allLikes = [];
          let allComments = [];
          try {
            if (postIds.length > 0 && postIds.every((id) => typeof id === "number" && !isNaN(id))) {
              allTags = await db.select().from(postTags).where(inArray(postTags.postId, postIds));
              allLikes = await db.select().from(postLikes).where(inArray(postLikes.postId, postIds));
              allComments = await db.select().from(postComments).where(inArray(postComments.postId, postIds));
            }
          } catch (error) {
            console.error("[getBlogPosts] Error fetching related data:", error);
            console.error("[getBlogPosts] Error details:", error instanceof Error ? error.stack : error);
          }
          const userIds = /* @__PURE__ */ new Set();
          allLikes.forEach((like2) => {
            if (like2.userId) userIds.add(like2.userId);
          });
          allComments.forEach((comment) => {
            if (comment.userId) userIds.add(comment.userId);
          });
          allPosts.forEach((post) => {
            if (post.authorId) userIds.add(post.authorId);
          });
          let allUsers = [];
          try {
            if (userIds.size > 0) {
              const userIdArray = Array.from(userIds).filter((id) => typeof id === "number" && !isNaN(id));
              if (userIdArray.length > 0) {
                allUsers = await db.select({
                  id: users.id,
                  name: users.name,
                  username: users.username,
                  email: users.email
                }).from(users).where(inArray(users.id, userIdArray));
              }
            }
          } catch (error) {
            console.error("[getBlogPosts] Error fetching users:", error);
            console.error("[getBlogPosts] Error details:", error instanceof Error ? error.stack : error);
          }
          const userMap = new Map(allUsers.map((u) => [u.id, u]));
          const tagsByPost = /* @__PURE__ */ new Map();
          const likesByPost = /* @__PURE__ */ new Map();
          const commentsByPost = /* @__PURE__ */ new Map();
          allTags.forEach((tag) => {
            if (!tagsByPost.has(tag.postId)) tagsByPost.set(tag.postId, []);
            tagsByPost.get(tag.postId).push(tag);
          });
          allLikes.forEach((like2) => {
            if (!likesByPost.has(like2.postId)) likesByPost.set(like2.postId, []);
            likesByPost.get(like2.postId).push(like2);
          });
          allComments.forEach((comment) => {
            if (!commentsByPost.has(comment.postId)) commentsByPost.set(comment.postId, []);
            commentsByPost.get(comment.postId).push(comment);
          });
          const postsWithAuthors = allPosts.map((post) => {
            const author = post.authorId ? userMap.get(post.authorId) : null;
            const postTags2 = tagsByPost.get(post.id) || [];
            const postLikesData = likesByPost.get(post.id) || [];
            const postCommentsData = commentsByPost.get(post.id) || [];
            const likes = postLikesData.map((like2) => ({
              user: like2.userId && userMap.get(like2.userId) ? userMap.get(like2.userId) : { id: like2.userId || 0, name: "Usuario", username: "usuario" }
            }));
            const comments = postCommentsData.map((comment) => ({
              id: comment.id,
              content: comment.content,
              createdAt: comment.createdAt || "",
              updatedAt: comment.updatedAt || "",
              user: comment.userId && userMap.get(comment.userId) ? userMap.get(comment.userId) : { id: comment.userId || 0, name: "Usuario", username: "usuario" },
              parentId: comment.parentId || void 0,
              replies: []
            }));
            return {
              id: post.id,
              title: post.title,
              slug: post.slug,
              excerpt: post.excerpt,
              content: post.content,
              category: post.category,
              type: post.type,
              featured: post.featured,
              imageUrl: post.imageUrl || null,
              videoUrl: post.videoUrl || null,
              viewCount: post.viewCount || 0,
              publishedAt: post.publishedAt || (/* @__PURE__ */ new Date()).toISOString(),
              author: author || { id: post.authorId || 0, name: "Usuario", username: "usuario", email: "" },
              tags: postTags2.map((t) => ({ tag: t.tag })),
              likes,
              comments
            };
          });
          console.log(`[getBlogPosts] Returning ${postsWithAuthors.length} posts with full data`);
          const validatedPosts = postsWithAuthors.map((post) => ({
            id: Number(post.id),
            title: String(post.title || ""),
            slug: String(post.slug || ""),
            excerpt: String(post.excerpt || ""),
            content: String(post.content || ""),
            category: String(post.category || ""),
            type: post.type === "blog" || post.type === "vlog" ? post.type : "blog",
            featured: Boolean(post.featured),
            imageUrl: post.imageUrl || null,
            videoUrl: post.videoUrl || null,
            viewCount: Number(post.viewCount || 0),
            publishedAt: String(post.publishedAt || (/* @__PURE__ */ new Date()).toISOString()),
            author: post.author || { id: 0, name: "Usuario", username: "usuario", email: "" },
            tags: Array.isArray(post.tags) ? post.tags : [],
            likes: Array.isArray(post.likes) ? post.likes : [],
            comments: Array.isArray(post.comments) ? post.comments : []
          }));
          return applyEnhancementsToList(validatedPosts);
        } catch (error) {
          console.error("[getBlogPosts] ERROR:", error);
          console.error("[getBlogPosts] Error stack:", error instanceof Error ? error.stack : "No stack trace");
          console.error("[getBlogPosts] Error message:", error instanceof Error ? error.message : String(error));
          return [];
        }
      }
      async getBlogPostStats() {
        try {
          const counts = await db.select({
            type: blogPosts.type,
            count: sql4`COUNT(*)`.as("count")
          }).from(blogPosts).groupBy(blogPosts.type);
          let blog = 0;
          let vlog = 0;
          counts.forEach((row) => {
            if (row.type === "vlog") {
              vlog = Number(row.count) || 0;
            } else if (row.type === "blog") {
              blog = Number(row.count) || 0;
            }
          });
          return {
            total: blog + vlog,
            blog,
            vlog
          };
        } catch (error) {
          console.error("[getBlogPostStats] ERROR:", error);
          return { total: 0, blog: 0, vlog: 0 };
        }
      }
      async getBlogPost(slug) {
        try {
          const result = await db.select({
            id: blogPosts.id,
            title: blogPosts.title,
            slug: blogPosts.slug,
            excerpt: blogPosts.excerpt,
            content: blogPosts.content,
            authorId: blogPosts.authorId,
            publishedAt: blogPosts.publishedAt,
            category: blogPosts.category,
            featured: blogPosts.featured,
            imageUrl: blogPosts.imageUrl,
            videoUrl: blogPosts.videoUrl,
            viewCount: blogPosts.viewCount,
            type: blogPosts.type,
            createdAt: blogPosts.createdAt,
            updatedAt: blogPosts.updatedAt,
            authorIdCol: users.id,
            authorName: users.name,
            authorUsername: users.username,
            authorEmail: users.email
          }).from(blogPosts).leftJoin(users, eq2(blogPosts.authorId, users.id)).where(eq2(blogPosts.slug, slug)).limit(1);
          if (result.length === 0) {
            return void 0;
          }
          const postData = result[0];
          const post = {
            id: postData.id,
            title: postData.title,
            slug: postData.slug,
            excerpt: postData.excerpt,
            content: postData.content,
            authorId: postData.authorId,
            publishedAt: postData.publishedAt,
            category: postData.category,
            featured: postData.featured,
            imageUrl: postData.imageUrl,
            videoUrl: postData.videoUrl,
            viewCount: postData.viewCount,
            type: postData.type,
            createdAt: postData.createdAt,
            updatedAt: postData.updatedAt,
            author: postData.authorIdCol ? {
              id: postData.authorIdCol,
              name: postData.authorName || "Usuario",
              username: postData.authorUsername || "usuario",
              email: postData.authorEmail || ""
            } : { id: postData.authorId || 0, name: "Usuario", username: "usuario", email: "" }
          };
          const tags = await db.select({
            tag: postTags.tag
          }).from(postTags).where(eq2(postTags.postId, post.id));
          const likesRecords = await db.select().from(postLikes).where(eq2(postLikes.postId, post.id));
          const likes = await Promise.all(likesRecords.map(async (like2) => {
            if (like2.userId) {
              const [user] = await db.select({
                id: users.id,
                name: users.name,
                username: users.username
              }).from(users).where(eq2(users.id, like2.userId)).limit(1);
              return {
                user: user || { id: like2.userId, name: "Usuario", username: "usuario" }
              };
            }
            return {
              user: { id: like2.userId || 0, name: "Usuario", username: "usuario" }
            };
          }));
          const commentsRecords = await db.select().from(postComments).where(eq2(postComments.postId, post.id));
          const comments = await Promise.all(commentsRecords.map(async (comment) => {
            let user = { id: comment.userId || 0, name: "Usuario", username: "usuario" };
            if (comment.userId) {
              const [userData] = await db.select({
                id: users.id,
                name: users.name,
                username: users.username
              }).from(users).where(eq2(users.id, comment.userId)).limit(1);
              if (userData) {
                user = userData;
              }
            }
            return {
              id: comment.id,
              content: comment.content,
              createdAt: comment.createdAt || "",
              updatedAt: comment.updatedAt || "",
              user,
              parentId: comment.parentId || void 0,
              replies: []
            };
          }));
          return applyBlogContentEnhancements({
            ...post,
            tags: tags || [],
            likes: likes || [],
            comments: comments || []
          });
        } catch (error) {
          console.error("Error in getBlogPost:", error);
          return void 0;
        }
      }
      async createBlogPost(post) {
        const result = await db.insert(blogPosts).values(post).returning();
        return applyBlogContentEnhancements(result[0]);
      }
      async updateBlogPost(id, post, userId) {
        const existingPost = await db.query.blogPosts.findFirst({
          where: and2(eq2(blogPosts.id, id), eq2(blogPosts.authorId, userId))
        });
        if (!existingPost) {
          return void 0;
        }
        const result = await db.update(blogPosts).set({ ...post, updatedAt: (/* @__PURE__ */ new Date()).toISOString() }).where(eq2(blogPosts.id, id)).returning();
        return result.length ? applyBlogContentEnhancements(result[0]) : void 0;
      }
      async deleteBlogPost(id, userId) {
        const existingPost = await db.query.blogPosts.findFirst({
          where: and2(eq2(blogPosts.id, id), eq2(blogPosts.authorId, userId))
        });
        if (!existingPost) {
          return false;
        }
        await db.delete(blogPosts).where(eq2(blogPosts.id, id));
        return true;
      }
      // Post Interactions
      async togglePostLike(postId, userId) {
        const existingLike = await db.query.postLikes.findFirst({
          where: and2(eq2(postLikes.postId, postId), eq2(postLikes.userId, userId))
        });
        if (existingLike) {
          await db.delete(postLikes).where(eq2(postLikes.id, existingLike.id));
        } else {
          await db.insert(postLikes).values({ postId, userId });
        }
        const count3 = await db.select({ count: sql4`count(*)` }).from(postLikes).where(eq2(postLikes.postId, postId));
        return {
          liked: !existingLike,
          count: count3[0].count
        };
      }
      async getPostLikes(postId) {
        const likes = await db.query.postLikes.findMany({
          where: eq2(postLikes.postId, postId),
          with: {
            user: true
          },
          orderBy: [desc2(postLikes.createdAt)]
        });
        return {
          count: likes.length,
          users: likes.map((like2) => like2.user)
        };
      }
      async createPostComment(postId, userId, content, parentId) {
        const result = await db.insert(postComments).values({
          postId,
          userId,
          content,
          parentId
        }).returning();
        return result[0];
      }
      async getPostComments(postId) {
        return await db.query.postComments.findMany({
          where: eq2(postComments.postId, postId),
          with: {
            user: true,
            replies: {
              with: {
                user: true
              },
              orderBy: [asc2(postComments.createdAt)]
            }
          },
          orderBy: [asc2(postComments.createdAt)]
        });
      }
      async updatePostComment(id, content, userId) {
        const existingComment = await db.query.postComments.findFirst({
          where: and2(eq2(postComments.id, id), eq2(postComments.userId, userId))
        });
        if (!existingComment) {
          return void 0;
        }
        const result = await db.update(postComments).set({ content, updatedAt: (/* @__PURE__ */ new Date()).toISOString() }).where(eq2(postComments.id, id)).returning();
        return result[0];
      }
      async deletePostComment(id, userId) {
        const existingComment = await db.query.postComments.findFirst({
          where: and2(eq2(postComments.id, id), eq2(postComments.userId, userId))
        });
        if (!existingComment) {
          return false;
        }
        await db.delete(postComments).where(eq2(postComments.id, id));
        return true;
      }
      async togglePostBookmark(postId, userId) {
        const existingBookmark = await db.query.postBookmarks.findFirst({
          where: and2(eq2(postBookmarks.postId, postId), eq2(postBookmarks.userId, userId))
        });
        if (existingBookmark) {
          await db.delete(postBookmarks).where(eq2(postBookmarks.id, existingBookmark.id));
          return { bookmarked: false };
        } else {
          await db.insert(postBookmarks).values({ postId, userId });
          return { bookmarked: true };
        }
      }
      async getUserBookmarks(userId) {
        const bookmarks = await db.query.postBookmarks.findMany({
          where: eq2(postBookmarks.userId, userId),
          with: {
            post: {
              with: {
                author: true,
                tags: true
              }
            }
          },
          orderBy: [desc2(postBookmarks.createdAt)]
        });
        return applyEnhancementsToList(bookmarks.map((bookmark) => bookmark.post));
      }
      async recordPostView(postId, userId, sessionId) {
        try {
          await db.insert(postViews).values({
            postId,
            userId,
            sessionId
          });
        } catch (error) {
          console.error("[recordPostView] Error:", error);
          throw error;
        }
        await db.update(blogPosts).set({ viewCount: sql4`${blogPosts.viewCount} + 1` }).where(eq2(blogPosts.id, postId));
      }
      // Search & Recommendations
      async searchPosts(query, filters) {
        const page = filters?.page || 1;
        const limit = filters?.limit || 10;
        const offset = (page - 1) * limit;
        let whereClause = sql4`(${blogPosts.title} LIKE '%${query}%' OR ${blogPosts.excerpt} LIKE '%${query}%' OR ${blogPosts.content} LIKE '%${query}%')`;
        if (filters?.type) {
          whereClause = sql4`${whereClause} AND ${blogPosts.type} = ${filters.type}`;
        }
        if (filters?.category) {
          whereClause = sql4`${whereClause} AND ${blogPosts.category} = ${filters.category}`;
        }
        const rawPosts = await db.select().from(blogPosts).where(whereClause).orderBy(desc2(blogPosts.publishedAt)).limit(limit).offset(offset);
        return applyEnhancementsToList(rawPosts);
      }
      async getTrendingPosts(days = 7, limit = 10) {
        const startDate = /* @__PURE__ */ new Date();
        startDate.setDate(startDate.getDate() - days);
        const startDateStr = startDate.toISOString();
        const posts = await db.select().from(blogPosts).where(gte(blogPosts.publishedAt, startDateStr)).orderBy(desc2(blogPosts.viewCount)).limit(limit);
        return applyEnhancementsToList(posts);
      }
      async getRelatedPosts(postId, limit = 4) {
        const post = await db.query.blogPosts.findFirst({
          where: eq2(blogPosts.id, postId)
        });
        if (!post) {
          return [];
        }
        const related = await db.select().from(blogPosts).where(and2(
          eq2(blogPosts.category, post.category),
          sql4`${blogPosts.id} != ${postId}`
        )).orderBy(desc2(blogPosts.viewCount)).limit(limit);
        return applyEnhancementsToList(related);
      }
      async getPopularTags(limit = 20) {
        const result = await db.select({
          tag: postTags.tag,
          count: sql4`count(*)`
        }).from(postTags).groupBy(postTags.tag).orderBy(desc2(sql4`count(*)`)).limit(limit);
        return result;
      }
      // ==================== GEOGRAPHIC LOCATIONS METHODS ====================
      async getProvinces() {
        return await db.select().from(geographicLocations).where(eq2(geographicLocations.type, "province"));
      }
      async getCitiesByProvince(provinceId) {
        return await db.select().from(geographicLocations).where(and2(
          eq2(geographicLocations.type, "city"),
          eq2(geographicLocations.parentId, provinceId)
        ));
      }
      async getLocationByName(name, type) {
        const conditions = [eq2(geographicLocations.name, name)];
        if (type) {
          conditions.push(eq2(geographicLocations.type, type));
        }
        const [location] = await db.select().from(geographicLocations).where(and2(...conditions));
        return location;
      }
      async createLocation(location) {
        const [newLocation] = await db.insert(geographicLocations).values(location).returning();
        return newLocation;
      }
      // ==================== POST LIKES AND VIEWS METHODS ====================
      async likePost(postId, userId) {
        const alreadyLiked = await this.isPostLikedByUser(postId, userId);
        if (alreadyLiked) {
          const [existing] = await db.select().from(communityPostLikes).where(and2(eq2(communityPostLikes.postId, postId), eq2(communityPostLikes.userId, userId)));
          return existing;
        }
        const [like2] = await db.insert(communityPostLikes).values({ postId, userId }).returning();
        return like2;
      }
      async unlikePost(postId, userId) {
        const result = await db.delete(communityPostLikes).where(and2(
          eq2(communityPostLikes.postId, postId),
          eq2(communityPostLikes.userId, userId)
        )).returning();
        return result.length > 0;
      }
      async isPostLikedByUser(postId, userId) {
        const [like2] = await db.select().from(communityPostLikes).where(and2(
          eq2(communityPostLikes.postId, postId),
          eq2(communityPostLikes.userId, userId)
        ));
        return !!like2;
      }
      async getCommunityPostLikes(postId) {
        return await db.select().from(communityPostLikes).where(eq2(communityPostLikes.postId, postId));
      }
      async getCommunityPostLikesCount(postId) {
        const result = await db.select({ count: sql4`count(*)` }).from(communityPostLikes).where(eq2(communityPostLikes.postId, postId));
        return result[0]?.count || 0;
      }
      async recordCommunityPostView(postId, userId, ipAddress, userAgent) {
        const [view] = await db.insert(communityPostViews).values({
          postId,
          userId,
          ipAddress,
          userAgent
        }).returning();
        return view;
      }
      async getCommunityPostViews(postId) {
        return await db.select().from(communityPostViews).where(eq2(communityPostViews.postId, postId));
      }
      async getCommunityPostViewsCount(postId) {
        const result = await db.select({ count: sql4`count(*)` }).from(communityPostViews).where(eq2(communityPostViews.postId, postId));
        return result[0]?.count || 0;
      }
      // ==================== GEOGRAPHIC SEARCH METHODS ====================
      async searchPostsByLocation(province, city, radiusKm, userLat, userLng) {
        let conditions = [eq2(communityPosts.status, "active")];
        if (province) {
          conditions.push(eq2(communityPosts.province, province));
        }
        if (city) {
          conditions.push(eq2(communityPosts.city, city));
        }
        let query = db.select().from(communityPosts).where(and2(...conditions));
        if (radiusKm && userLat && userLng) {
          const posts = await query;
          return posts.filter((post) => {
            if (!post.latitude || !post.longitude) return false;
            const distance = this.calculateDistance(userLat, userLng, post.latitude, post.longitude);
            return distance <= radiusKm;
          });
        }
        return await query;
      }
      calculateDistance(lat1, lng1, lat2, lng2) {
        const R = 6371;
        const dLat = this.deg2rad(lat2 - lat1);
        const dLng = this.deg2rad(lng2 - lng1);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
      }
      deg2rad(deg) {
        return deg * (Math.PI / 180);
      }
      // Inspiring Stories methods
      async getInspiringStories(filters) {
        let query = db.select().from(inspiringStories);
        const conditions = [];
        if (filters?.category) {
          conditions.push(eq2(inspiringStories.category, filters.category));
        }
        if (filters?.status) {
          conditions.push(eq2(inspiringStories.status, filters.status));
        }
        if (filters?.featured !== void 0) {
          conditions.push(eq2(inspiringStories.featured, filters.featured ? 1 : 0));
        }
        if (conditions.length > 0) {
          query = query.where(and2(...conditions));
        }
        query = query.orderBy(desc2(inspiringStories.publishedAt));
        if (filters?.limit) {
          query = query.limit(filters.limit);
        }
        if (filters?.offset) {
          query = query.offset(filters.offset);
        }
        return await query;
      }
      async getInspiringStory(id) {
        const [story] = await db.select().from(inspiringStories).where(eq2(inspiringStories.id, id));
        return story;
      }
      async createInspiringStory(story) {
        const [newStory] = await db.insert(inspiringStories).values({
          ...story,
          createdAt: (/* @__PURE__ */ new Date()).toISOString(),
          updatedAt: (/* @__PURE__ */ new Date()).toISOString()
        }).returning();
        return newStory;
      }
      async updateInspiringStory(id, updates) {
        const [updatedStory] = await db.update(inspiringStories).set({
          ...updates,
          updatedAt: (/* @__PURE__ */ new Date()).toISOString()
        }).where(eq2(inspiringStories.id, id)).returning();
        return updatedStory;
      }
      async deleteInspiringStory(id) {
        await db.delete(inspiringStories).where(eq2(inspiringStories.id, id));
      }
      async getFeaturedStories(limit = 3) {
        return this.getInspiringStories({ featured: true, status: "approved", limit });
      }
      async getStoriesByCategory(category, limit = 5) {
        return this.getInspiringStories({ category, status: "approved", limit });
      }
      async incrementStoryViews(id) {
        await db.update(inspiringStories).set({
          views: sql4`views + 1`,
          updatedAt: (/* @__PURE__ */ new Date()).toISOString()
        }).where(eq2(inspiringStories.id, id));
      }
      async incrementStoryLikes(id) {
        await db.update(inspiringStories).set({
          likes: sql4`likes + 1`,
          updatedAt: (/* @__PURE__ */ new Date()).toISOString()
        }).where(eq2(inspiringStories.id, id));
      }
      async incrementStoryShares(id) {
        await db.update(inspiringStories).set({
          shares: sql4`shares + 1`,
          updatedAt: (/* @__PURE__ */ new Date()).toISOString()
        }).where(eq2(inspiringStories.id, id));
      }
      async moderateStory(id, status, moderatorId, notes) {
        const [updatedStory] = await db.update(inspiringStories).set({
          status,
          moderatedBy: moderatorId,
          moderatedAt: (/* @__PURE__ */ new Date()).toISOString(),
          moderationNotes: notes,
          updatedAt: (/* @__PURE__ */ new Date()).toISOString()
        }).where(eq2(inspiringStories.id, id)).returning();
        return updatedStory;
      }
      // ==================== GAMIFICATION ¡BASTA! METHODS ====================
      async saveCommitment(userId, commitmentText, commitmentType, location) {
        await this.ensureUserCommitmentsLocationColumns();
        const rawLatitude = location?.latitude;
        const rawLongitude = location?.longitude;
        const latitude = Number.isFinite(rawLatitude) ? Number(rawLatitude) : null;
        const longitude = Number.isFinite(rawLongitude) ? Number(rawLongitude) : null;
        let province = location?.province?.trim() || null;
        let city = location?.city?.trim() || null;
        if ((!province || !city) && latitude !== null && longitude !== null) {
          const resolved = await this.resolveLocationFromCoordinates(latitude, longitude);
          province = province || resolved.province;
          city = city || resolved.city;
        }
        const [commitment] = await db.insert(userCommitments).values({
          userId,
          commitmentText,
          commitmentType,
          province,
          city,
          latitude,
          longitude,
          status: "active",
          pointsAwarded: 100
          // Award 100 points for making a commitment
        }).returning();
        await this.recordAction(userId, "commitment", { commitmentType, commitmentId: commitment.id });
        return commitment;
      }
      async getRecentCommitments(limit) {
        await this.ensureUserCommitmentsLocationColumns();
        const safeLimit = Number.isFinite(limit) ? Math.max(1, Math.min(limit, 100)) : 20;
        return await db.select({
          id: userCommitments.id,
          commitmentText: userCommitments.commitmentText,
          commitmentType: userCommitments.commitmentType,
          province: userCommitments.province,
          city: userCommitments.city,
          latitude: userCommitments.latitude,
          longitude: userCommitments.longitude,
          status: userCommitments.status,
          pointsAwarded: userCommitments.pointsAwarded,
          createdAt: userCommitments.createdAt,
          completedAt: userCommitments.completedAt,
          user: {
            id: users.id,
            name: users.name,
            username: users.username
          }
        }).from(userCommitments).innerJoin(users, eq2(userCommitments.userId, users.id)).where(eq2(userCommitments.status, "active")).orderBy(desc2(userCommitments.createdAt)).limit(safeLimit);
      }
      async getCommitmentStats() {
        await this.ensureUserCommitmentsLocationColumns();
        const [summary] = await db.select({
          total: sql4`count(*)`,
          last24h: sql4`sum(case when ${userCommitments.createdAt}::timestamp >= NOW() - INTERVAL '1 day' then 1 else 0 end)`
        }).from(userCommitments).where(eq2(userCommitments.status, "active"));
        const byTypeRows = await db.select({
          type: userCommitments.commitmentType,
          total: sql4`count(*)`
        }).from(userCommitments).where(eq2(userCommitments.status, "active")).groupBy(userCommitments.commitmentType).orderBy(desc2(sql4`count(*)`));
        return {
          total: Number(summary?.total ?? 0),
          last24h: Number(summary?.last24h ?? 0),
          byType: byTypeRows.map((row) => ({
            type: row.type ?? "intermediate",
            total: Number(row.total ?? 0)
          }))
        };
      }
      async resolveLocationFromCoordinates(latitude, longitude) {
        const locations = await db.select({
          id: geographicLocations.id,
          name: geographicLocations.name,
          type: geographicLocations.type,
          parentId: geographicLocations.parentId,
          latitude: geographicLocations.latitude,
          longitude: geographicLocations.longitude
        }).from(geographicLocations).where(and2(
          inArray(geographicLocations.type, ["province", "city"]),
          isNotNull(geographicLocations.latitude),
          isNotNull(geographicLocations.longitude)
        ));
        if (!locations.length) {
          return { province: null, city: null };
        }
        const provinces = locations.filter((location) => location.type === "province");
        const cities = locations.filter((location) => location.type === "city");
        const provinceById = new Map(provinces.map((province2) => [province2.id, province2.name]));
        const nearestProvince = provinces.reduce((closest, province2) => {
          const distance = this.calculateDistance(latitude, longitude, province2.latitude, province2.longitude);
          if (distance < closest.distance) return { distance, name: province2.name };
          return closest;
        }, { distance: Number.POSITIVE_INFINITY, name: null });
        const nearestCity = cities.reduce((closest, city2) => {
          const distance = this.calculateDistance(latitude, longitude, city2.latitude, city2.longitude);
          if (distance < closest.distance) {
            return { distance, name: city2.name, parentId: city2.parentId ?? null };
          }
          return closest;
        }, { distance: Number.POSITIVE_INFINITY, name: null, parentId: null });
        const cityThresholdKm = 180;
        const provinceThresholdKm = 300;
        const city = nearestCity.distance <= cityThresholdKm ? nearestCity.name : null;
        const provinceFromCity = city && nearestCity.parentId ? provinceById.get(nearestCity.parentId) ?? null : null;
        const provinceDirect = nearestProvince.distance <= provinceThresholdKm ? nearestProvince.name : null;
        const province = provinceFromCity || provinceDirect;
        return { province, city };
      }
      async getLeaderboard(type, limit) {
        let query;
        switch (type) {
          case "weekly":
            const weekStart = /* @__PURE__ */ new Date();
            weekStart.setDate(weekStart.getDate() - weekStart.getDay());
            const weekStartStr = weekStart.toISOString().split("T")[0];
            query = db.select({
              userId: weeklyRankings.userId,
              points: weeklyRankings.points,
              rank: weeklyRankings.rank,
              user: {
                id: users.id,
                name: users.name,
                username: users.username
              }
            }).from(weeklyRankings).innerJoin(users, eq2(weeklyRankings.userId, users.id)).where(eq2(weeklyRankings.weekStart, weekStartStr)).orderBy(asc2(weeklyRankings.rank)).limit(limit);
            break;
          case "monthly":
            const monthStart = (/* @__PURE__ */ new Date()).toISOString().substring(0, 7);
            query = db.select({
              userId: monthlyRankings.userId,
              points: monthlyRankings.points,
              rank: monthlyRankings.rank,
              user: {
                id: users.id,
                name: users.name,
                username: users.username
              }
            }).from(monthlyRankings).innerJoin(users, eq2(monthlyRankings.userId, users.id)).where(eq2(monthlyRankings.monthStart, monthStart)).orderBy(asc2(monthlyRankings.rank)).limit(limit);
            break;
          case "global":
          default:
            query = db.select({
              userId: userProgress.userId,
              points: userProgress.points,
              rank: userProgress.rank,
              level: userProgress.level,
              user: {
                id: users.id,
                name: users.name,
                username: users.username
              }
            }).from(userProgress).innerJoin(users, eq2(userProgress.userId, users.id)).orderBy(desc2(userProgress.points)).limit(limit);
            break;
        }
        return await query;
      }
      async recordAction(userId, actionType, metadata) {
        const points = ACTION_POINTS[actionType] ?? 10;
        const [action] = await db.insert(userActions).values({
          userId,
          actionType,
          points,
          metadata: metadata ? JSON.stringify(metadata) : null
        }).returning();
        await this.updateUserProgress(userId, points);
        return action;
      }
      async getUserProgress(userId) {
        const [progress] = await db.select().from(userProgress).where(eq2(userProgress.userId, userId));
        if (!progress) {
          const [newProgress] = await db.insert(userProgress).values({
            userId,
            level: 1,
            points: 0,
            rank: "Novato",
            totalActions: 0
          }).returning();
          return newProgress;
        }
        return progress;
      }
      async getAllBadges() {
        return await db.select().from(badges).orderBy(asc2(badges.orderIndex));
      }
      async updateUserProgress(userId, pointsToAdd) {
        const [currentProgress] = await db.select().from(userProgress).where(eq2(userProgress.userId, userId));
        if (!currentProgress) {
          await db.insert(userProgress).values({
            userId,
            level: 1,
            points: pointsToAdd,
            rank: "Novato",
            totalActions: 1,
            lastActionAt: (/* @__PURE__ */ new Date()).toISOString()
          });
        } else {
          const newPoints = currentProgress.points + pointsToAdd;
          const newLevel = Math.floor(newPoints / 500) + 1;
          let newRank = "Novato";
          if (newLevel >= 5) newRank = "L\xEDder del Movimiento";
          else if (newLevel >= 4) newRank = "Agente de Cambio";
          else if (newLevel >= 3) newRank = "Hombre Gris";
          else if (newLevel >= 2) newRank = "Despierto";
          await db.update(userProgress).set({
            points: newPoints,
            level: newLevel,
            rank: newRank,
            totalActions: currentProgress.totalActions + 1,
            lastActionAt: (/* @__PURE__ */ new Date()).toISOString(),
            updatedAt: (/* @__PURE__ */ new Date()).toISOString()
          }).where(eq2(userProgress.userId, userId));
          if (newLevel > currentProgress.level) {
            await this.recordAction(userId, "level_up", {
              oldLevel: currentProgress.level,
              newLevel,
              oldRank: currentProgress.rank,
              newRank
            });
          }
        }
      }
      // ==================== NEW INITIATIVE FEATURES IMPLEMENTATIONS ====================
      // Initiative Members
      async getInitiativeMembers(postId) {
        return await db.select().from(initiativeMembers).where(and2(eq2(initiativeMembers.postId, postId), eq2(initiativeMembers.status, "active"))).orderBy(asc2(initiativeMembers.joinedAt));
      }
      async getUserMemberships(userId) {
        return await db.select({
          id: initiativeMembers.id,
          postId: initiativeMembers.postId,
          role: initiativeMembers.role,
          status: initiativeMembers.status,
          joinedAt: initiativeMembers.joinedAt,
          postTitle: communityPosts.title,
          postType: communityPosts.type,
          postStatus: communityPosts.status,
          missionSlug: communityPosts.missionSlug
        }).from(initiativeMembers).innerJoin(communityPosts, eq2(initiativeMembers.postId, communityPosts.id)).where(and2(eq2(initiativeMembers.userId, userId), eq2(initiativeMembers.status, "active"))).orderBy(desc2(initiativeMembers.joinedAt));
      }
      async addInitiativeMember(postId, userId, role) {
        const [existing] = await db.select().from(initiativeMembers).where(and2(
          eq2(initiativeMembers.postId, postId),
          eq2(initiativeMembers.userId, userId),
          eq2(initiativeMembers.status, "active")
        )).limit(1);
        if (existing) {
          return existing;
        }
        const [member] = await db.insert(initiativeMembers).values({
          postId,
          userId,
          role,
          status: "active",
          permissions: JSON.stringify({
            canEdit: role === "creator",
            canInvite: role === "creator" || role === "co-organizer",
            canApprove: role === "creator" || role === "co-organizer",
            canCreateMilestone: role === "creator" || role === "co-organizer" || role === "active_member",
            canCreateTask: role === "creator" || role === "co-organizer" || role === "active_member",
            canAssignTask: role === "creator" || role === "co-organizer",
            canDeleteContent: role === "creator",
            canManageRoles: role === "creator"
          })
        }).returning();
        await db.update(communityPosts).set({ memberCount: sql4`${communityPosts.memberCount} + 1` }).where(eq2(communityPosts.id, postId));
        return member;
      }
      async updateMemberRole(memberId, role, permissions) {
        await db.update(initiativeMembers).set({
          role,
          permissions: JSON.stringify(permissions)
        }).where(eq2(initiativeMembers.id, memberId));
      }
      async removeMember(memberId) {
        const [member] = await db.select().from(initiativeMembers).where(eq2(initiativeMembers.id, memberId));
        if (member) {
          await db.update(initiativeMembers).set({
            status: "left",
            leftAt: (/* @__PURE__ */ new Date()).toISOString()
          }).where(eq2(initiativeMembers.id, memberId));
          await db.update(communityPosts).set({ memberCount: sql4`${communityPosts.memberCount} - 1` }).where(eq2(communityPosts.id, member.postId));
        }
      }
      // Membership Requests
      async createMembershipRequest(postId, userId, message) {
        const [existingRequest] = await db.select().from(membershipRequests).where(and2(
          eq2(membershipRequests.postId, postId),
          eq2(membershipRequests.userId, userId),
          eq2(membershipRequests.status, "pending")
        )).limit(1);
        if (existingRequest) {
          return existingRequest;
        }
        const [request] = await db.insert(membershipRequests).values({
          postId,
          userId,
          message,
          status: "pending"
        }).returning();
        return request;
      }
      async getMembershipRequests(postId, status) {
        let query = db.select().from(membershipRequests).where(eq2(membershipRequests.postId, postId));
        if (status) {
          query = query.where(eq2(membershipRequests.status, status));
        }
        return await query.orderBy(desc2(membershipRequests.createdAt));
      }
      async approveMembershipRequest(requestId, reviewerId) {
        const [request] = await db.select().from(membershipRequests).where(eq2(membershipRequests.id, requestId));
        if (request && request.status === "pending") {
          await this.addInitiativeMember(request.postId, request.userId, "member");
          await db.update(membershipRequests).set({
            status: "approved",
            reviewedBy: reviewerId,
            reviewedAt: (/* @__PURE__ */ new Date()).toISOString()
          }).where(eq2(membershipRequests.id, requestId));
          await this.createActivityFeedItem({
            type: "new_member",
            postId: request.postId,
            userId: request.userId,
            title: "Nuevo miembro se uni\xF3",
            description: `Un nuevo miembro se uni\xF3 a la iniciativa`,
            metadata: JSON.stringify({ requestId })
          });
        }
      }
      async rejectMembershipRequest(requestId, reviewerId) {
        await db.update(membershipRequests).set({
          status: "rejected",
          reviewedBy: reviewerId,
          reviewedAt: (/* @__PURE__ */ new Date()).toISOString()
        }).where(eq2(membershipRequests.id, requestId));
      }
      // Milestones
      async getInitiativeMilestones(postId) {
        return await db.select().from(initiativeMilestones).where(eq2(initiativeMilestones.postId, postId)).orderBy(asc2(initiativeMilestones.orderIndex));
      }
      async createMilestone(postId, data) {
        const [milestone] = await db.insert(initiativeMilestones).values({
          ...data,
          postId
        }).returning();
        await this.createActivityFeedItem({
          type: "update",
          postId,
          userId: data.completedBy || 0,
          // Will be updated when completed
          title: "Nuevo hito creado",
          description: `Se cre\xF3 el hito: ${data.title}`,
          metadata: JSON.stringify({ milestoneId: milestone.id })
        });
        return milestone;
      }
      async updateMilestone(milestoneId, updates) {
        await db.update(initiativeMilestones).set({
          ...updates,
          updatedAt: (/* @__PURE__ */ new Date()).toISOString()
        }).where(eq2(initiativeMilestones.id, milestoneId));
      }
      async completeMilestone(milestoneId, userId) {
        await db.update(initiativeMilestones).set({
          status: "completed",
          completedBy: userId,
          completedAt: (/* @__PURE__ */ new Date()).toISOString(),
          updatedAt: (/* @__PURE__ */ new Date()).toISOString()
        }).where(eq2(initiativeMilestones.id, milestoneId));
        const [milestone] = await db.select().from(initiativeMilestones).where(eq2(initiativeMilestones.id, milestoneId));
        if (milestone) {
          await this.createActivityFeedItem({
            type: "milestone_completed",
            postId: milestone.postId,
            userId,
            title: "Hito completado",
            description: `Se complet\xF3 el hito: ${milestone.title}`,
            metadata: JSON.stringify({ milestoneId })
          });
        }
      }
      // Tasks
      async getInitiativeTasks(postId) {
        return await db.select().from(initiativeTasks).where(eq2(initiativeTasks.postId, postId)).orderBy(asc2(initiativeTasks.createdAt));
      }
      async createTask(postId, data) {
        const [task] = await db.insert(initiativeTasks).values({
          ...data,
          postId
        }).returning();
        await this.createActivityFeedItem({
          type: "update",
          postId,
          userId: data.createdBy || 0,
          title: "Nueva tarea creada",
          description: `Se cre\xF3 la tarea: ${data.title}`,
          metadata: JSON.stringify({ taskId: task.id })
        });
        return task;
      }
      async updateTask(taskId, updates) {
        await db.update(initiativeTasks).set({
          ...updates,
          updatedAt: (/* @__PURE__ */ new Date()).toISOString()
        }).where(eq2(initiativeTasks.id, taskId));
      }
      async assignTask(taskId, userId) {
        await db.update(initiativeTasks).set({
          assignedTo: userId,
          updatedAt: (/* @__PURE__ */ new Date()).toISOString()
        }).where(eq2(initiativeTasks.id, taskId));
      }
      async completeTask(taskId) {
        await db.update(initiativeTasks).set({
          status: "done",
          completedAt: (/* @__PURE__ */ new Date()).toISOString(),
          updatedAt: (/* @__PURE__ */ new Date()).toISOString()
        }).where(eq2(initiativeTasks.id, taskId));
        const [task] = await db.select().from(initiativeTasks).where(eq2(initiativeTasks.id, taskId));
        if (task) {
          await this.createActivityFeedItem({
            type: "task_completed",
            postId: task.postId,
            userId: task.assignedTo || 0,
            title: "Tarea completada",
            description: `Se complet\xF3 la tarea: ${task.title}`,
            metadata: JSON.stringify({ taskId })
          });
        }
      }
      async deleteTask(taskId) {
        await db.delete(initiativeTasks).where(eq2(initiativeTasks.id, taskId));
      }
      async deleteMilestone(milestoneId) {
        await db.update(initiativeTasks).set({ milestoneId: null }).where(eq2(initiativeTasks.milestoneId, milestoneId));
        await db.delete(initiativeMilestones).where(eq2(initiativeMilestones.id, milestoneId));
      }
      // Messages/Chat
      async getInitiativeMessages(postId, limit = 50, offset = 0) {
        return await db.select().from(initiativeMessages).where(eq2(initiativeMessages.postId, postId)).orderBy(desc2(initiativeMessages.createdAt)).limit(limit).offset(offset);
      }
      async sendMessage(postId, userId, content, type = "message") {
        const [message] = await db.insert(initiativeMessages).values({
          postId,
          userId,
          content,
          type
        }).returning();
        return message;
      }
      // Activity Feed
      async getActivityFeed(filters) {
        const { type, limit = 20, offset = 0 } = filters || {};
        let query = db.select().from(activityFeed).orderBy(desc2(activityFeed.createdAt)).limit(limit).offset(offset);
        if (type) {
          query = query.where(eq2(activityFeed.type, type));
        }
        return await query;
      }
      async createActivityFeedItem(data) {
        const [item] = await db.insert(activityFeed).values(data).returning();
        return item;
      }
      // === Mission Evidence ===
      async getEvidence(postId, status) {
        let query = db.select().from(missionEvidence).where(eq2(missionEvidence.postId, postId)).orderBy(desc2(missionEvidence.createdAt));
        if (status) {
          query = query.where(eq2(missionEvidence.status, status));
        }
        return await query;
      }
      async createEvidence(data) {
        const [evidence] = await db.insert(missionEvidence).values(data).returning();
        await this.createActivityFeedItem({
          type: "evidence_submitted",
          postId: data.postId,
          userId: data.userId,
          title: `Nueva evidencia: ${data.evidenceType}`,
          description: data.content?.substring(0, 200) || ""
        });
        return evidence;
      }
      async verifyEvidence(evidenceId, verifiedBy) {
        const [updated] = await db.update(missionEvidence).set({
          status: "verified",
          verifiedBy,
          verifiedAt: (/* @__PURE__ */ new Date()).toISOString()
        }).where(eq2(missionEvidence.id, evidenceId)).returning();
        return updated;
      }
      async flagEvidence(evidenceId, flagCategory, flaggedBy) {
        const [updated] = await db.update(missionEvidence).set({
          status: "flagged",
          flagCategory
        }).where(eq2(missionEvidence.id, evidenceId)).returning();
        return updated;
      }
      async getEvidenceCount(postId) {
        const result = await db.select({ count: sql4`count(*)` }).from(missionEvidence).where(eq2(missionEvidence.postId, postId));
        return Number(result[0]?.count ?? 0);
      }
      async getEvidenceCountByFlag(postId) {
        const result = await db.select({
          flagCategory: missionEvidence.flagCategory,
          count: sql4`count(*)`
        }).from(missionEvidence).where(and2(
          eq2(missionEvidence.postId, postId),
          eq2(missionEvidence.status, "flagged")
        )).groupBy(missionEvidence.flagCategory);
        return result.map((r) => ({
          flagCategory: r.flagCategory || "",
          count: Number(r.count)
        }));
      }
      // === Mission Chronicles ===
      async getChronicles(postId) {
        return await db.select().from(missionChronicles).where(eq2(missionChronicles.postId, postId)).orderBy(desc2(missionChronicles.createdAt));
      }
      async createChronicle(data) {
        const [chronicle] = await db.insert(missionChronicles).values(data).returning();
        await this.createActivityFeedItem({
          type: "update",
          postId: data.postId,
          userId: data.userId,
          title: `Nueva cronica: ${data.title}`,
          description: data.content?.substring(0, 200) || ""
        });
        return chronicle;
      }
      // Notifications
      async getUserNotifications(userId, unreadOnly = false) {
        let query = db.select().from(notifications).where(eq2(notifications.userId, userId));
        if (unreadOnly) {
          query = query.where(eq2(notifications.read, false));
        }
        return await query.orderBy(desc2(notifications.createdAt));
      }
      async markNotificationAsRead(notificationId) {
        await db.update(notifications).set({ read: true }).where(eq2(notifications.id, notificationId));
      }
      async markAllNotificationsAsRead(userId) {
        await db.update(notifications).set({ read: true }).where(eq2(notifications.userId, userId));
      }
      async createNotification(userId, data) {
        const [notification] = await db.insert(notifications).values({
          ...data,
          userId
        }).returning();
        return notification;
      }
      // ==================== COURSE METHODS ====================
      // Courses
      async getCourses(filters) {
        const page = filters?.page || 1;
        const limit = filters?.limit || 12;
        const offset = (page - 1) * limit;
        try {
          const publishedResult = await getPublishedCourses({
            ...filters,
            page: 1,
            limit: 1e3
          });
          const conditions = [eq2(courses.isPublished, true)];
          if (filters?.category) {
            conditions.push(eq2(courses.category, filters.category));
          }
          if (filters?.level) {
            conditions.push(eq2(courses.level, filters.level));
          }
          if (filters?.featured === true) {
            conditions.push(eq2(courses.isFeatured, true));
          }
          if (filters?.search) {
            const searchTerm = `%${filters.search}%`;
            conditions.push(or2(
              ilike2(courses.title, searchTerm),
              ilike2(courses.description, searchTerm)
            ));
          }
          const whereCondition = and2(...conditions);
          const legacyRows = await db.select({
            course: courses,
            lessonCount: sql4`(
            select count(*)
            from ${courseLessons}
            where ${courseLessons.courseId} = ${courses.id}
          )`,
            hasQuiz: sql4`exists(
            select 1
            from ${courseQuizzes}
            where ${courseQuizzes.courseId} = ${courses.id}
          )`
          }).from(courses).where(whereCondition).orderBy(desc2(courses.orderIndex), desc2(courses.updatedAt), desc2(courses.createdAt));
          const legacyVisibility = await Promise.all(
            legacyRows.map(async (row) => ({
              ...row,
              hasCurrentRevision: await hasCurrentRevisionForCourseId(row.course.id)
            }))
          );
          const legacyCourses = legacyVisibility.filter((row) => !row.hasCurrentRevision).map((row) => ({
            ...row.course,
            lessonCount: Number(row.lessonCount || 0),
            hasQuiz: Boolean(row.hasQuiz)
          }));
          const mergedCourses = [...publishedResult.courses, ...legacyCourses].sort((left, right) => compareCourseOrder(left, right, filters?.sortBy));
          const paginatedCourses = mergedCourses.slice(offset, offset + limit);
          return {
            courses: paginatedCourses,
            total: mergedCourses.length,
            page,
            limit
          };
        } catch (error) {
          console.error("[getCourses] Error:", error);
          throw error;
        }
      }
      async getCourseById(courseId) {
        const publishedCourse = await getPublishedCourseById(courseId);
        if (publishedCourse) {
          return publishedCourse;
        }
        if (await hasCurrentRevisionForCourseId(courseId)) {
          return void 0;
        }
        return await getLegacyCourseById(courseId);
      }
      async getCourseBySlug(slug) {
        const publishedCourse = await getPublishedCourseBySlug(slug);
        if (publishedCourse) {
          return publishedCourse;
        }
        if (await hasCurrentRevisionForCourseSlug(slug)) {
          return void 0;
        }
        const [course] = await db.select().from(courses).where(eq2(courses.slug, slug)).limit(1);
        return course;
      }
      async getLessonById(lessonId) {
        const publishedLesson = await getPublishedLessonByIdentityId(lessonId);
        if (publishedLesson) {
          return {
            ...publishedLesson.lesson,
            id: publishedLesson.identity.legacyLessonId ?? publishedLesson.identity.id,
            lessonIdentityId: publishedLesson.identity.id,
            legacyLessonId: publishedLesson.identity.legacyLessonId,
            courseId: publishedLesson.course.legacyCourseId ?? publishedLesson.course.id,
            content: publishedLesson.lesson.contentHtml,
            key: publishedLesson.identity.key
          };
        }
        const legacyLesson = await getLegacyLessonById(lessonId);
        if (!legacyLesson) {
          return void 0;
        }
        if (await hasCurrentRevisionForCourseId(legacyLesson.courseId)) {
          return void 0;
        }
        return legacyLesson;
      }
      async getCourseWithLessons(courseId) {
        const publishedCourseData = await getPublishedCourseWithLessons(courseId);
        if (publishedCourseData) {
          return publishedCourseData;
        }
        if (await hasCurrentRevisionForCourseId(courseId)) {
          return void 0;
        }
        const [course] = await db.select().from(courses).where(eq2(courses.id, courseId)).limit(1);
        if (!course) return void 0;
        const lessonsList = await db.select().from(courseLessons).where(eq2(courseLessons.courseId, courseId)).orderBy(asc2(courseLessons.orderIndex));
        return { course, lessons: lessonsList };
      }
      async getCourseQuiz(courseId) {
        const publishedQuiz = await getPublishedCourseQuiz(courseId);
        if (publishedQuiz) {
          return publishedQuiz;
        }
        if (await hasCurrentRevisionForCourseId(courseId)) {
          return void 0;
        }
        const [quiz] = await db.select().from(courseQuizzes).where(eq2(courseQuizzes.courseId, courseId)).limit(1);
        if (!quiz) return void 0;
        const questionsList = await db.select().from(quizQuestions).where(eq2(quizQuestions.quizId, quiz.id)).orderBy(asc2(quizQuestions.orderIndex));
        return { quiz, questions: questionsList };
      }
      async incrementCourseView(courseId) {
        const publishedCourse = await getPublishedCourseById(courseId);
        if (publishedCourse) {
          const definitionId = publishedCourse.courseDefinitionId ?? await getCourseDefinitionIdByLegacyCourseId(publishedCourse.id) ?? publishedCourse.id;
          await incrementPublishedCourseView(definitionId);
          return;
        }
        if (await hasCurrentRevisionForCourseId(courseId)) {
          return;
        }
        await db.update(courses).set({ viewCount: sql4`${courses.viewCount} + 1` }).where(eq2(courses.id, courseId));
      }
      // Course Progress
      async getUserCourseProgress(userId, courseId) {
        let [progress] = await db.select().from(userCourseProgress).where(
          and2(
            eq2(userCourseProgress.userId, userId),
            eq2(userCourseProgress.courseDefinitionId, courseId)
          )
        ).limit(1);
        if (!progress) {
          const mappedDefinitionId = await getCourseDefinitionIdByLegacyCourseId(courseId);
          if (mappedDefinitionId) {
            [progress] = await db.select().from(userCourseProgress).where(
              and2(
                eq2(userCourseProgress.userId, userId),
                or2(
                  eq2(userCourseProgress.courseDefinitionId, mappedDefinitionId),
                  eq2(userCourseProgress.courseId, courseId)
                )
              )
            ).limit(1);
          }
        }
        if (!progress) {
          [progress] = await db.select().from(userCourseProgress).where(
            and2(
              eq2(userCourseProgress.userId, userId),
              eq2(userCourseProgress.courseId, courseId)
            )
          ).limit(1);
        }
        return await adaptUserCourseProgress(progress);
      }
      async startCourse(userId, courseId) {
        const existing = await this.getUserCourseProgress(userId, courseId);
        if (existing) {
          return existing;
        }
        const publishedCourse = await getPublishedCourseById(courseId);
        if (publishedCourse) {
          const courseDefinitionId = publishedCourse.courseDefinitionId ?? await getCourseDefinitionIdByLegacyCourseId(courseId) ?? courseId;
          const revision = await getCurrentRevisionForCourseDefinition(courseDefinitionId);
          const [progress2] = await db.insert(userCourseProgress).values({
            userId,
            courseId: revision?.legacyCourseId ?? courseId,
            courseDefinitionId,
            status: "in_progress",
            progress: 0,
            startedAt: (/* @__PURE__ */ new Date()).toISOString(),
            lastAccessedAt: (/* @__PURE__ */ new Date()).toISOString(),
            completedLessons: JSON.stringify([]),
            completedLessonIdentityIds: JSON.stringify([])
          }).returning();
          if (!progress2) {
            throw new Error("Failed to create course progress");
          }
          return await adaptUserCourseProgress(progress2);
        }
        const [course] = await db.select().from(courses).where(eq2(courses.id, courseId)).limit(1);
        if (!course) {
          throw new Error("Course not found");
        }
        const [progress] = await db.insert(userCourseProgress).values({
          userId,
          courseId,
          status: "in_progress",
          progress: 0,
          startedAt: (/* @__PURE__ */ new Date()).toISOString(),
          lastAccessedAt: (/* @__PURE__ */ new Date()).toISOString(),
          completedLessons: JSON.stringify([])
        }).returning();
        if (!progress) {
          throw new Error("Failed to create course progress");
        }
        return progress;
      }
      async completeLesson(userId, lessonId) {
        const publishedLesson = await getPublishedLessonByIdentityId(lessonId);
        if (publishedLesson) {
          const { identity, lesson: lesson2, courseDefinition } = publishedLesson;
          const [existingLessonProgress2] = await db.select().from(userLessonProgress).where(
            and2(
              eq2(userLessonProgress.userId, userId),
              eq2(userLessonProgress.lessonIdentityId, identity.id)
            )
          ).limit(1);
          if (existingLessonProgress2) {
            await db.update(userLessonProgress).set({
              lessonId: identity.legacyLessonId ?? existingLessonProgress2.lessonId ?? null,
              lessonIdentityId: identity.id,
              status: "completed",
              completedAt: (/* @__PURE__ */ new Date()).toISOString(),
              updatedAt: (/* @__PURE__ */ new Date()).toISOString()
            }).where(eq2(userLessonProgress.id, existingLessonProgress2.id));
          } else {
            await db.insert(userLessonProgress).values({
              userId,
              lessonId: identity.legacyLessonId ?? null,
              lessonIdentityId: identity.id,
              status: "completed",
              completedAt: (/* @__PURE__ */ new Date()).toISOString()
            });
          }
          let [courseProgress2] = await db.select().from(userCourseProgress).where(
            and2(
              eq2(userCourseProgress.userId, userId),
              eq2(userCourseProgress.courseDefinitionId, courseDefinition.id)
            )
          ).limit(1);
          if (!courseProgress2) {
            await this.startCourse(userId, courseDefinition.id);
            [courseProgress2] = await db.select().from(userCourseProgress).where(
              and2(
                eq2(userCourseProgress.userId, userId),
                eq2(userCourseProgress.courseDefinitionId, courseDefinition.id)
              )
            ).limit(1);
          }
          if (!courseProgress2) {
            throw new Error("Course progress not found");
          }
          const courseData = await getPublishedCourseWithLessons(courseDefinition.id);
          if (!courseData) {
            throw new Error("Course not found");
          }
          const resolveLessonIdentityId = (entry) => entry.lessonIdentityId ?? entry.id;
          const requiredLessons2 = courseData.lessons.filter((entry) => entry.isRequired);
          const completedLessonsIds2 = await resolveCompletedLessonIdentityIds(courseProgress2);
          const lessonAlreadyCompleted2 = completedLessonsIds2.includes(identity.id);
          if (!lessonAlreadyCompleted2) {
            completedLessonsIds2.push(identity.id);
          }
          const completedRequired2 = requiredLessons2.filter((entry) => completedLessonsIds2.includes(resolveLessonIdentityId(entry))).length;
          const progressPercentage2 = requiredLessons2.length > 0 ? Math.round(completedRequired2 / requiredLessons2.length * 100) : 0;
          const nextLesson2 = courseData.lessons.find(
            (entry) => entry.orderIndex > lesson2.orderIndex && !completedLessonsIds2.includes(resolveLessonIdentityId(entry))
          );
          const courseCompleted2 = requiredLessons2.every((entry) => completedLessonsIds2.includes(resolveLessonIdentityId(entry)));
          const courseWasCompletedBefore2 = courseProgress2.status === "completed";
          const [updatedProgress2] = await db.update(userCourseProgress).set({
            courseId: publishedLesson.courseRevision.legacyCourseId ?? courseProgress2.courseId ?? null,
            courseDefinitionId: courseDefinition.id,
            progress: progressPercentage2,
            status: courseCompleted2 ? "completed" : "in_progress",
            currentLessonId: null,
            currentLessonIdentityId: nextLesson2 ? resolveLessonIdentityId(nextLesson2) : null,
            completedLessonIdentityIds: stringifyNumericArray(completedLessonsIds2),
            completedLessons: courseProgress2.completedLessons ?? JSON.stringify([]),
            completedAt: courseCompleted2 ? (/* @__PURE__ */ new Date()).toISOString() : null,
            lastAccessedAt: (/* @__PURE__ */ new Date()).toISOString(),
            updatedAt: (/* @__PURE__ */ new Date()).toISOString()
          }).where(eq2(userCourseProgress.id, courseProgress2.id)).returning();
          if (!updatedProgress2) {
            throw new Error("Failed to update course progress");
          }
          const xpAwarded2 = { lesson: 0, course: 0 };
          if (!lessonAlreadyCompleted2) {
            try {
              xpAwarded2.lesson = ACTION_POINTS["lesson_complete"] ?? 0;
              await this.recordAction(userId, "lesson_complete", {
                lessonId: identity.id,
                courseId: courseDefinition.id
              });
              if (courseCompleted2 && !courseWasCompletedBefore2) {
                xpAwarded2.course = ACTION_POINTS["course_complete"] ?? 0;
                await this.recordAction(userId, "course_complete", {
                  courseId: courseDefinition.id
                });
              }
            } catch (actionError) {
              console.error("Error awarding points for lesson completion:", actionError);
            }
          }
          return {
            progress: await adaptUserCourseProgress(updatedProgress2),
            courseCompleted: courseCompleted2,
            xpAwarded: xpAwarded2
          };
        }
        const [lesson] = await db.select().from(courseLessons).where(eq2(courseLessons.id, lessonId)).limit(1);
        if (!lesson) {
          throw new Error("Lesson not found");
        }
        if (!lesson.courseId) {
          throw new Error("Lesson has no associated course");
        }
        const [existingLessonProgress] = await db.select().from(userLessonProgress).where(
          and2(
            eq2(userLessonProgress.userId, userId),
            eq2(userLessonProgress.lessonId, lessonId)
          )
        ).limit(1);
        if (existingLessonProgress) {
          await db.update(userLessonProgress).set({
            status: "completed",
            completedAt: (/* @__PURE__ */ new Date()).toISOString(),
            updatedAt: (/* @__PURE__ */ new Date()).toISOString()
          }).where(eq2(userLessonProgress.id, existingLessonProgress.id));
        } else {
          await db.insert(userLessonProgress).values({
            userId,
            lessonId,
            status: "completed",
            completedAt: (/* @__PURE__ */ new Date()).toISOString()
          });
        }
        const [courseProgress] = await db.select().from(userCourseProgress).where(
          and2(
            eq2(userCourseProgress.userId, userId),
            eq2(userCourseProgress.courseId, lesson.courseId)
          )
        ).limit(1);
        if (!courseProgress) {
          throw new Error("Course progress not found");
        }
        const allLessons = await db.select().from(courseLessons).where(eq2(courseLessons.courseId, lesson.courseId)).orderBy(asc2(courseLessons.orderIndex));
        const requiredLessons = allLessons.filter((l) => l.isRequired);
        const completedLessonsIds = JSON.parse(courseProgress.completedLessons || "[]");
        const lessonAlreadyCompleted = completedLessonsIds.includes(lessonId);
        if (!lessonAlreadyCompleted) {
          completedLessonsIds.push(lessonId);
        }
        const completedRequired = requiredLessons.filter((l) => completedLessonsIds.includes(l.id)).length;
        const progressPercentage = requiredLessons.length > 0 ? Math.round(completedRequired / requiredLessons.length * 100) : 0;
        const nextLesson = allLessons.find(
          (l) => l.orderIndex > lesson.orderIndex && !completedLessonsIds.includes(l.id)
        );
        const courseCompleted = requiredLessons.every((l) => completedLessonsIds.includes(l.id));
        const courseWasCompletedBefore = courseProgress.status === "completed";
        const [updatedProgress] = await db.update(userCourseProgress).set({
          progress: progressPercentage,
          status: courseCompleted ? "completed" : "in_progress",
          currentLessonId: nextLesson?.id || null,
          completedLessons: JSON.stringify(completedLessonsIds),
          completedAt: courseCompleted ? (/* @__PURE__ */ new Date()).toISOString() : null,
          lastAccessedAt: (/* @__PURE__ */ new Date()).toISOString(),
          updatedAt: (/* @__PURE__ */ new Date()).toISOString()
        }).where(eq2(userCourseProgress.id, courseProgress.id)).returning();
        if (!updatedProgress) {
          throw new Error("Failed to update course progress");
        }
        if (!lesson.courseId) {
          throw new Error("Lesson courseId is missing");
        }
        const xpAwarded = { lesson: 0, course: 0 };
        if (!lessonAlreadyCompleted) {
          try {
            xpAwarded.lesson = ACTION_POINTS["lesson_complete"] ?? 0;
            await this.recordAction(userId, "lesson_complete", {
              lessonId,
              courseId: lesson.courseId
            });
            if (courseCompleted && !courseWasCompletedBefore) {
              xpAwarded.course = ACTION_POINTS["course_complete"] ?? 0;
              await this.recordAction(userId, "course_complete", {
                courseId: lesson.courseId
              });
            }
          } catch (actionError) {
            console.error("Error awarding points for lesson completion:", actionError);
          }
        }
        return { progress: updatedProgress, courseCompleted, xpAwarded };
      }
      async updateLessonTimeSpent(userId, lessonId, seconds) {
        const publishedLesson = await getPublishedLessonByIdentityId(lessonId);
        if (publishedLesson) {
          const identityId = publishedLesson.identity.id;
          const [existing2] = await db.select().from(userLessonProgress).where(
            and2(
              eq2(userLessonProgress.userId, userId),
              eq2(userLessonProgress.lessonIdentityId, identityId)
            )
          ).limit(1);
          if (existing2) {
            await db.update(userLessonProgress).set({
              lessonId: publishedLesson.identity.legacyLessonId ?? existing2.lessonId ?? null,
              lessonIdentityId: identityId,
              timeSpent: (existing2.timeSpent || 0) + seconds,
              updatedAt: (/* @__PURE__ */ new Date()).toISOString()
            }).where(eq2(userLessonProgress.id, existing2.id));
          } else {
            await db.insert(userLessonProgress).values({
              userId,
              lessonId: publishedLesson.identity.legacyLessonId ?? null,
              lessonIdentityId: identityId,
              status: "in_progress",
              timeSpent: seconds
            });
          }
          const [courseProgress] = await db.select().from(userCourseProgress).where(
            and2(
              eq2(userCourseProgress.userId, userId),
              eq2(userCourseProgress.courseDefinitionId, publishedLesson.courseDefinition.id)
            )
          ).limit(1);
          if (courseProgress) {
            await db.update(userCourseProgress).set({
              lastAccessedAt: (/* @__PURE__ */ new Date()).toISOString(),
              courseDefinitionId: publishedLesson.courseDefinition.id,
              courseId: publishedLesson.courseRevision.legacyCourseId ?? courseProgress.courseId ?? null
            }).where(eq2(userCourseProgress.id, courseProgress.id));
          }
          return;
        }
        const [existing] = await db.select().from(userLessonProgress).where(
          and2(
            eq2(userLessonProgress.userId, userId),
            eq2(userLessonProgress.lessonId, lessonId)
          )
        ).limit(1);
        if (existing) {
          await db.update(userLessonProgress).set({
            timeSpent: (existing.timeSpent || 0) + seconds,
            updatedAt: (/* @__PURE__ */ new Date()).toISOString()
          }).where(eq2(userLessonProgress.id, existing.id));
        } else {
          await db.insert(userLessonProgress).values({
            userId,
            lessonId,
            status: "in_progress",
            timeSpent: seconds
          });
        }
        const [lesson] = await db.select().from(courseLessons).where(eq2(courseLessons.id, lessonId)).limit(1);
        if (lesson) {
          await db.update(userCourseProgress).set({
            lastAccessedAt: (/* @__PURE__ */ new Date()).toISOString()
          }).where(
            and2(
              eq2(userCourseProgress.userId, userId),
              eq2(userCourseProgress.courseId, lesson.courseId)
            )
          );
        }
      }
      async getUserLessonProgress(userId, lessonId) {
        let [progress] = await db.select().from(userLessonProgress).where(
          and2(
            eq2(userLessonProgress.userId, userId),
            eq2(userLessonProgress.lessonIdentityId, lessonId)
          )
        ).limit(1);
        if (!progress) {
          [progress] = await db.select().from(userLessonProgress).where(
            and2(
              eq2(userLessonProgress.userId, userId),
              eq2(userLessonProgress.lessonId, lessonId)
            )
          ).limit(1);
        }
        return await adaptUserLessonProgress(progress);
      }
      // Quiz
      async createQuizAttempt(userId, quizId, courseId) {
        const publishedQuiz = await getPublishedCourseQuiz(courseId);
        if (publishedQuiz && publishedQuiz.quiz.id === quizId) {
          const courseDefinitionId = await getCourseDefinitionIdByLegacyCourseId(courseId) ?? courseId;
          const quizRevisionId = publishedQuiz.quizRevisionId ?? null;
          const legacyQuizId = publishedQuiz.quiz.legacyQuizId ?? quizId;
          const [attempt2] = await db.insert(quizAttempts).values({
            userId,
            quizId: legacyQuizId,
            courseId,
            courseDefinitionId,
            courseRevisionId: publishedQuiz.courseRevisionId,
            courseQuizRevisionId: quizRevisionId,
            startedAt: (/* @__PURE__ */ new Date()).toISOString()
          }).returning();
          return {
            ...attempt2,
            courseId,
            quizId
          };
        }
        const [attempt] = await db.insert(quizAttempts).values({
          userId,
          quizId,
          courseId,
          startedAt: (/* @__PURE__ */ new Date()).toISOString()
        }).returning();
        return attempt;
      }
      async submitQuizAttempt(attemptId, answers) {
        const [attempt] = await db.select().from(quizAttempts).where(eq2(quizAttempts.id, attemptId)).limit(1);
        if (!attempt) {
          throw new Error("Quiz attempt not found");
        }
        if (attempt.courseQuizRevisionId) {
          const quizData2 = await getPublishedQuizByRevisionQuizId(attempt.courseQuizRevisionId);
          if (!quizData2) {
            throw new Error("Quiz not found");
          }
          const { quiz: quiz2, questions: questions2, definition, revision } = quizData2;
          let totalPoints2 = 0;
          let earnedPoints2 = 0;
          const attemptAnswers2 = [];
          for (const question of questions2) {
            totalPoints2 += question.points || 1;
            const externalQuestionId = question.legacyQuestionId ?? question.id;
            const userAnswer = answers.find((a) => a.questionId === externalQuestionId || a.questionId === question.id);
            const correctAnswer = JSON.parse(question.correctAnswer);
            const isCorrect = JSON.stringify(userAnswer?.answer) === JSON.stringify(correctAnswer);
            if (isCorrect) {
              earnedPoints2 += question.points || 1;
            }
            const [answerRecord] = await db.insert(quizAttemptAnswers).values({
              attemptId,
              questionId: question.legacyQuestionId ?? null,
              answer: JSON.stringify(userAnswer?.answer || ""),
              isCorrect,
              pointsEarned: isCorrect ? question.points || 1 : 0
            }).returning();
            attemptAnswers2.push(answerRecord);
          }
          const score2 = totalPoints2 > 0 ? Math.round(earnedPoints2 / totalPoints2 * 100) : 0;
          const passed2 = score2 >= (quiz2.passingScore || 70);
          const timeSpent2 = attempt.startedAt ? Math.floor(((/* @__PURE__ */ new Date()).getTime() - new Date(attempt.startedAt).getTime()) / 1e3) : 0;
          await db.update(quizAttempts).set({
            score: score2,
            passed: passed2,
            answers: JSON.stringify(answers),
            timeSpent: timeSpent2,
            completedAt: (/* @__PURE__ */ new Date()).toISOString(),
            courseDefinitionId: definition.id,
            courseRevisionId: revision.id,
            courseQuizRevisionId: quiz2.id
          }).where(eq2(quizAttempts.id, attemptId));
          let certificateCode2;
          const xpAwarded2 = { quiz: 0, certificate: 0 };
          if (passed2) {
            xpAwarded2.quiz = ACTION_POINTS["quiz_passed"] ?? 0;
            await this.recordAction(attempt.userId, "quiz_passed", {
              quizId: quiz2.id,
              courseId: definition.id,
              score: score2
            });
            const { certificate, created } = await this.generateCertificate(attempt.userId, definition.id, score2);
            certificateCode2 = certificate.certificateCode;
            if (created) {
              xpAwarded2.certificate = ACTION_POINTS["certificate_earned"] ?? 0;
              await this.recordAction(attempt.userId, "certificate_earned", {
                courseId: definition.id,
                certificateCode: certificate.certificateCode
              });
              try {
                const [courseBadge] = await db.select().from(badges).where(eq2(badges.name, "Estudiante Dedicado")).limit(1);
                if (courseBadge) {
                  await this.awardBadge(attempt.userId, courseBadge.id);
                }
              } catch (error) {
                console.log("Course completion badge not found");
              }
            }
          }
          return { score: score2, passed: passed2, answers: attemptAnswers2, certificateCode: certificateCode2, xpAwarded: xpAwarded2 };
        }
        const quizData = await this.getCourseQuiz(attempt.courseId);
        if (!quizData) {
          throw new Error("Quiz not found");
        }
        const { quiz, questions } = quizData;
        let correctAnswers = 0;
        let totalPoints = 0;
        let earnedPoints = 0;
        const attemptAnswers = [];
        for (const question of questions) {
          totalPoints += question.points || 1;
          const userAnswer = answers.find((a) => a.questionId === question.id);
          const correctAnswer = JSON.parse(question.correctAnswer);
          const isCorrect = JSON.stringify(userAnswer?.answer) === JSON.stringify(correctAnswer);
          if (isCorrect) {
            correctAnswers++;
            earnedPoints += question.points || 1;
          }
          const [answerRecord] = await db.insert(quizAttemptAnswers).values({
            attemptId,
            questionId: question.id,
            answer: JSON.stringify(userAnswer?.answer || ""),
            isCorrect,
            pointsEarned: isCorrect ? question.points || 1 : 0
          }).returning();
          attemptAnswers.push(answerRecord);
        }
        const score = Math.round(earnedPoints / totalPoints * 100);
        const passed = score >= (quiz.passingScore || 70);
        const timeSpent = attempt.startedAt ? Math.floor(((/* @__PURE__ */ new Date()).getTime() - new Date(attempt.startedAt).getTime()) / 1e3) : 0;
        await db.update(quizAttempts).set({
          score,
          passed,
          answers: JSON.stringify(answers),
          timeSpent,
          completedAt: (/* @__PURE__ */ new Date()).toISOString()
        }).where(eq2(quizAttempts.id, attemptId));
        let certificateCode;
        const xpAwarded = { quiz: 0, certificate: 0 };
        if (passed) {
          xpAwarded.quiz = ACTION_POINTS["quiz_passed"] ?? 0;
          await this.recordAction(attempt.userId, "quiz_passed", {
            quizId: attempt.quizId,
            courseId: attempt.courseId,
            score
          });
          const { certificate, created } = await this.generateCertificate(attempt.userId, attempt.courseId, score);
          certificateCode = certificate.certificateCode;
          if (created) {
            xpAwarded.certificate = ACTION_POINTS["certificate_earned"] ?? 0;
            await this.recordAction(attempt.userId, "certificate_earned", {
              courseId: attempt.courseId,
              certificateCode: certificate.certificateCode
            });
            try {
              const [courseBadge] = await db.select().from(badges).where(eq2(badges.name, "Estudiante Dedicado")).limit(1);
              if (courseBadge) {
                await this.awardBadge(attempt.userId, courseBadge.id);
              }
            } catch (error) {
              console.log("Course completion badge not found");
            }
          }
        }
        return { score, passed, answers: attemptAnswers, certificateCode, xpAwarded };
      }
      async getQuizAttempt(attemptId) {
        const [attempt] = await db.select().from(quizAttempts).where(eq2(quizAttempts.id, attemptId)).limit(1);
        if (!attempt) return void 0;
        return {
          ...attempt,
          quizId: attempt.quizId ?? attempt.courseQuizRevisionId,
          courseId: attempt.courseId ?? attempt.courseDefinitionId
        };
      }
      async getUserQuizAttempts(userId, quizId) {
        const attempts = await db.select().from(quizAttempts).where(
          and2(
            eq2(quizAttempts.userId, userId),
            or2(
              eq2(quizAttempts.courseQuizRevisionId, quizId),
              eq2(quizAttempts.quizId, quizId)
            )
          )
        ).orderBy(desc2(quizAttempts.startedAt));
        return attempts.map((attempt) => ({
          ...attempt,
          quizId: attempt.quizId ?? attempt.courseQuizRevisionId,
          courseId: attempt.courseId ?? attempt.courseDefinitionId
        }));
      }
      // Certificates
      async generateCertificate(userId, courseId, quizScore) {
        const publishedCourse = await getPublishedCourseById(courseId);
        if (publishedCourse) {
          const courseDefinitionId = publishedCourse.courseDefinitionId ?? await getCourseDefinitionIdByLegacyCourseId(courseId) ?? courseId;
          const revision = await getCurrentRevisionForCourseDefinition(courseDefinitionId);
          const [existing2] = await db.select().from(courseCertificates).where(
            and2(
              eq2(courseCertificates.userId, userId),
              eq2(courseCertificates.courseDefinitionId, courseDefinitionId)
            )
          ).limit(1);
          if (existing2) {
            return {
              certificate: {
                ...existing2,
                courseId: existing2.courseId ?? existing2.courseDefinitionId
              },
              created: false
            };
          }
          const timestamp2 = Date.now();
          const random2 = Math.random().toString(36).substring(2, 9);
          const certificateCode2 = `${courseId}-${userId}-${timestamp2}-${random2}`;
          const [certificate2] = await db.insert(courseCertificates).values({
            userId,
            courseId: revision?.legacyCourseId ?? courseId,
            courseDefinitionId,
            courseRevisionId: revision?.id ?? null,
            certificateCode: certificateCode2,
            quizScore
          }).returning();
          try {
            const [certificateBadge] = await db.select().from(badges).where(eq2(badges.name, "Certificado de Curso")).limit(1);
            if (certificateBadge) {
              await this.awardBadge(userId, certificateBadge.id);
            }
          } catch (error) {
            console.log("Certificate badge not found");
          }
          return {
            certificate: {
              ...certificate2,
              courseId: certificate2.courseId ?? courseId
            },
            created: true
          };
        }
        const [existing] = await db.select().from(courseCertificates).where(
          and2(
            eq2(courseCertificates.userId, userId),
            eq2(courseCertificates.courseId, courseId)
          )
        ).limit(1);
        if (existing) {
          return { certificate: existing, created: false };
        }
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 9);
        const certificateCode = `${courseId}-${userId}-${timestamp}-${random}`;
        const [certificate] = await db.insert(courseCertificates).values({
          userId,
          courseId,
          certificateCode,
          quizScore
        }).returning();
        try {
          const [certificateBadge] = await db.select().from(badges).where(eq2(badges.name, "Certificado de Curso")).limit(1);
          if (certificateBadge) {
            await this.awardBadge(userId, certificateBadge.id);
          }
        } catch (error) {
          console.log("Certificate badge not found");
        }
        return { certificate, created: true };
      }
      async getUserCertificates(userId) {
        const certificates = await db.select().from(courseCertificates).where(eq2(courseCertificates.userId, userId)).orderBy(desc2(courseCertificates.issuedAt));
        return certificates.map((certificate) => ({
          ...certificate,
          courseId: certificate.courseId ?? certificate.courseDefinitionId
        }));
      }
      async getUserCourses(userId) {
        const progressList = await db.select().from(userCourseProgress).where(eq2(userCourseProgress.userId, userId));
        const result = await Promise.all(
          progressList.map(async (progress) => {
            const publicProgress = await adaptUserCourseProgress(progress);
            if (!publicProgress?.courseId) {
              return null;
            }
            const course = await this.getCourseById(publicProgress.courseId);
            if (!course) {
              return null;
            }
            return { course, progress: publicProgress };
          })
        );
        return result.filter(Boolean);
      }
      // User Profiles
      async getUserProfile(userId) {
        const [profile] = await db.select().from(userProfiles).where(eq2(userProfiles.userId, userId)).limit(1);
        return profile;
      }
      async createUserProfile(data) {
        const [profile] = await db.insert(userProfiles).values(data).returning();
        return profile;
      }
      async updateUserProfile(userId, updates) {
        const [profile] = await db.update(userProfiles).set(updates).where(eq2(userProfiles.userId, userId)).returning();
        return profile;
      }
      // Platform Feedback
      async createPlatformFeedback(data) {
        const [feedback] = await db.insert(platformFeedback).values(data).returning();
        return feedback;
      }
      async getAllPlatformFeedback() {
        return await db.select().from(platformFeedback).orderBy(desc2(platformFeedback.createdAt));
      }
      async updatePlatformFeedbackStatus(id, status, adminNotes) {
        const updates = { status };
        if (adminNotes !== void 0) updates.adminNotes = adminNotes;
        const [feedback] = await db.update(platformFeedback).set(updates).where(eq2(platformFeedback.id, id)).returning();
        return feedback;
      }
    };
    storage = new DatabaseStorage();
  }
});

// server/services/mandato-engine.ts
var mandato_engine_exports = {};
__export(mandato_engine_exports, {
  generateAndSaveMandate: () => generateAndSaveMandate,
  generateWeeklyMandate: () => generateWeeklyMandate,
  startMandatoCron: () => startMandatoCron,
  stopMandatoCron: () => stopMandatoCron
});
import Anthropic from "@anthropic-ai/sdk";
import { desc as desc9, gte as gte3, sql as sql8, and as and9, eq as eq10 } from "drizzle-orm";
function getWeekBounds() {
  const now = /* @__PURE__ */ new Date();
  const dayOfWeek = now.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const start = new Date(now);
  start.setDate(now.getDate() + mondayOffset);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  const jan1 = new Date(now.getFullYear(), 0, 1);
  const days = Math.floor((start.getTime() - jan1.getTime()) / 864e5);
  const weekNumber = Math.ceil((days + jan1.getDay() + 1) / 7);
  return { start, end, weekNumber, year: now.getFullYear() };
}
function extractTerritory(item) {
  return item.location || item.province || item.city || "Sin ubicacion";
}
async function gatherPulseData() {
  const { start } = getWeekBounds();
  const weekStartISO = start.toISOString();
  const [allDreams, allResources] = await Promise.all([
    storage.getDreams(),
    storage.getUserResources()
  ]);
  let allCommitments = [];
  try {
    allCommitments = await db.select().from(userCommitments).orderBy(desc9(userCommitments.createdAt));
  } catch {
  }
  const isThisWeek = (createdAt) => {
    if (!createdAt) return false;
    return new Date(createdAt) >= new Date(weekStartISO);
  };
  const newDreamEntries = allDreams.filter((d) => isThisWeek(d.createdAt));
  const newDreams = newDreamEntries.filter((d) => d.type === "dream");
  const newNeeds = newDreamEntries.filter((d) => d.type === "need");
  const newBastas = newDreamEntries.filter((d) => d.type === "basta");
  const newValues = newDreamEntries.filter((d) => d.type === "value");
  const newCommitments = allCommitments.filter((c) => isThisWeek(c.createdAt));
  const newResources = allResources.filter((r) => isThisWeek(r.createdAt));
  const previousPulses = await db.select().from(weeklyDigests).where(eq10(weeklyDigests.status, "completed")).orderBy(desc9(weeklyDigests.createdAt)).limit(1);
  const previousPulse = previousPulses[0] || null;
  const recurringProposals = await db.select().from(digestProposals).where(
    and9(
      gte3(digestProposals.weeksActive, 3),
      sql8`${digestProposals.status} NOT IN ('completada', 'archivada')`
    )
  );
  return {
    newDreams,
    newNeeds,
    newBastas,
    newValues,
    newCommitments,
    newResources,
    allDreams,
    allCommitments,
    allResources,
    previousPulse,
    recurringProposals
  };
}
function groupByTerritory(data) {
  const territoryGroups = {};
  for (const d of data.allDreams) {
    const territory = d.location || d.province || "Sin ubicacion";
    if (!territoryGroups[territory]) territoryGroups[territory] = { dreams: [], resources: [], commitments: [] };
    territoryGroups[territory].dreams.push(d);
  }
  for (const r of data.allResources) {
    const territory = r.province || r.city || r.location || "Sin ubicacion";
    if (!territoryGroups[territory]) territoryGroups[territory] = { dreams: [], resources: [], commitments: [] };
    territoryGroups[territory].resources.push(r);
  }
  for (const c of data.allCommitments) {
    const territory = c.location || c.province || "Sin ubicacion";
    if (!territoryGroups[territory]) territoryGroups[territory] = { dreams: [], resources: [], commitments: [] };
    territoryGroups[territory].commitments.push(c);
  }
  return territoryGroups;
}
function buildTerritorySummary(groups) {
  const lines = [];
  const sorted = Object.entries(groups).filter(([name]) => name !== "Sin ubicacion").sort(([, a], [, b]) => b.dreams.length + b.resources.length - (a.dreams.length + a.resources.length));
  for (const [territory, group] of sorted) {
    const dreamTypes = {
      dream: group.dreams.filter((d) => d.type === "dream").length,
      need: group.dreams.filter((d) => d.type === "need").length,
      basta: group.dreams.filter((d) => d.type === "basta").length,
      value: group.dreams.filter((d) => d.type === "value").length
    };
    const totalVoices = dreamTypes.dream + dreamTypes.need + dreamTypes.basta + dreamTypes.value;
    lines.push(`
--- ${territory} (${totalVoices} voces, ${group.resources.length} recursos) ---`);
    if (dreamTypes.dream > 0) lines.push(`  Suenos: ${dreamTypes.dream}`);
    if (dreamTypes.need > 0) lines.push(`  Necesidades: ${dreamTypes.need}`);
    if (dreamTypes.basta > 0) lines.push(`  Bastas: ${dreamTypes.basta}`);
    if (dreamTypes.value > 0) lines.push(`  Valores: ${dreamTypes.value}`);
    if (group.resources.length > 0) lines.push(`  Recursos: ${group.resources.length}`);
    if (group.commitments.length > 0) lines.push(`  Compromisos: ${group.commitments.length}`);
    const sampleDreams = group.dreams.filter((d) => d.type === "dream").slice(0, 3);
    const sampleNeeds = group.dreams.filter((d) => d.type === "need").slice(0, 3);
    const sampleBastas = group.dreams.filter((d) => d.type === "basta").slice(0, 3);
    if (sampleDreams.length > 0) {
      lines.push(`  Citas suenos: ${JSON.stringify(sampleDreams.map((d) => (d.dream || "").slice(0, 150)))}`);
    }
    if (sampleNeeds.length > 0) {
      lines.push(`  Citas necesidades: ${JSON.stringify(sampleNeeds.map((d) => (d.need || "").slice(0, 150)))}`);
    }
    if (sampleBastas.length > 0) {
      lines.push(`  Citas bastas: ${JSON.stringify(sampleBastas.map((d) => (d.basta || "").slice(0, 150)))}`);
    }
  }
  const sinUbicacion = groups["Sin ubicacion"];
  if (sinUbicacion && sinUbicacion.dreams.length > 0) {
    lines.push(`
--- Sin ubicacion (${sinUbicacion.dreams.length} voces sin territorio asignado) ---`);
  }
  return lines.join("\n");
}
async function synthesizeWithClaude(data, weekInfo) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY is required for mandate generation");
  }
  const client = new Anthropic({ apiKey });
  const totalNewVoices = data.newDreams.length + data.newNeeds.length + data.newBastas.length + data.newValues.length + data.newCommitments.length + data.newResources.length;
  const previousSummary = data.previousPulse ? `PULSO ANTERIOR (Semana ${data.previousPulse.weekNumber}):
- Voces nuevas: ${data.previousPulse.totalNewVoices}
- Temas emergentes: ${data.previousPulse.emergingThemes || "N/A"}
- Propuestas activas: ${data.recurringProposals.length} propuestas llevan 3+ semanas sin resolverse` : "No hay pulso anterior \u2014 este es el PRIMER PULSO.";
  const sampleQuotes = (items, field, max = 15) => items.slice(0, max).map((i) => ({
    text: (i[field] || "").slice(0, 200),
    location: extractTerritory(i)
  })).filter((q) => q.text);
  const territoryGroups = groupByTerritory(data);
  const territorySummary = buildTerritorySummary(territoryGroups);
  const territoriesWithMandate = Object.entries(territoryGroups).filter(([name, g]) => name !== "Sin ubicacion" && g.dreams.length >= 3).map(([name, g]) => `${name} (${g.dreams.length} voces)`).join(", ");
  const prompt = `Genera el Pulso Semanal #${weekInfo.weekNumber} del ano ${weekInfo.year} junto con los Mandatos Territoriales.

\u2550\u2550\u2550 DATOS DE ESTA SEMANA \u2550\u2550\u2550

NUEVAS VOCES: ${totalNewVoices} total
- Suenos: ${data.newDreams.length}
- Necesidades: ${data.newNeeds.length}
- Bastas: ${data.newBastas.length}
- Valores: ${data.newValues.length}
- Compromisos: ${data.newCommitments.length}
- Recursos nuevos: ${data.newResources.length}

DATOS ACUMULADOS TOTALES:
- ${data.allDreams.length} declaraciones totales en el mapa
- ${data.allCommitments.length} compromisos activos
- ${data.allResources.length} recursos declarados

\u2550\u2550\u2550 MUESTRAS DE VOCES NUEVAS \u2550\u2550\u2550

SUENOS:
${JSON.stringify(sampleQuotes(data.newDreams, "dream"))}

NECESIDADES:
${JSON.stringify(sampleQuotes(data.newNeeds, "need"))}

BASTAS:
${JSON.stringify(sampleQuotes(data.newBastas, "basta"))}

VALORES:
${JSON.stringify(sampleQuotes(data.newValues, "value"))}

COMPROMISOS:
${JSON.stringify(sampleQuotes(data.newCommitments, "commitmentText"))}

RECURSOS DECLARADOS:
${JSON.stringify(data.newResources.slice(0, 10).map((r) => ({
    description: r.description,
    category: r.category,
    location: extractTerritory(r),
    hours: r.availableHours
  })))}

\u2550\u2550\u2550 TODOS LOS DATOS ACUMULADOS (muestras) \u2550\u2550\u2550

SUENOS ACUMULADOS:
${JSON.stringify(sampleQuotes(data.allDreams.filter((d) => d.type === "dream"), "dream", 20))}

NECESIDADES ACUMULADAS:
${JSON.stringify(sampleQuotes(data.allDreams.filter((d) => d.type === "need"), "need", 20))}

BASTAS ACUMULADOS:
${JSON.stringify(sampleQuotes(data.allDreams.filter((d) => d.type === "basta"), "basta", 20))}

VALORES ACUMULADOS:
${JSON.stringify(sampleQuotes(data.allDreams.filter((d) => d.type === "value"), "value", 20))}

TODOS LOS RECURSOS:
${JSON.stringify(data.allResources.map((r) => ({
    description: r.description?.slice(0, 100),
    category: r.category,
    location: extractTerritory(r),
    hours: r.availableHours
  })))}

\u2550\u2550\u2550 VOCES AGRUPADAS POR TERRITORIO \u2550\u2550\u2550

Territorios con suficientes voces para mandato: ${territoriesWithMandate || "Ninguno aun"}

${territorySummary}

\u2550\u2550\u2550 CONTEXTO HISTORICO \u2550\u2550\u2550

${previousSummary}

PROPUESTAS RECURRENTES (3+ semanas sin accion):
${JSON.stringify(data.recurringProposals.map((p) => ({
    title: p.title,
    urgency: p.urgency,
    weeksActive: p.weeksActive,
    targetCategory: p.targetCategory
  })))}

\u2550\u2550\u2550 INSTRUCCIONES DE RESPUESTA \u2550\u2550\u2550

Responde con un JSON con esta estructura exacta:
{
  "emergingThemes": [
    {"theme": "nombre del tema", "trend": "up|stable|down|new", "count": numero, "description": "descripcion"}
  ],
  "patterns": [
    {"pattern": "nombre del patron", "territories": ["territorio1"], "description": "explicacion", "evidence": ["cita1"]}
  ],
  "proposals": [
    {
      "title": "Verbo + objetivo concreto",
      "summary": "Resumen en 2-3 oraciones",
      "fullAnalysis": "Analisis detallado extenso \u2014 tan largo como sea necesario para fundamentar bien la propuesta. Inclu\xED contexto, datos, argumentacion, y por que es autoevidente desde los datos.",
      "evidence": {"voiceCount": numero, "territories": ["lista"], "quotes": ["citas textuales del mapa"], "convergencePercent": numero},
      "targetCategory": "gobierno_municipal|gobierno_provincial|gobierno_nacional|organizaciones|medios|sector_privado|comunidad",
      "targetDescription": "A quien especificamente va dirigida",
      "territory": "Alcance geografico",
      "urgency": "critica|importante|oportunidad",
      "precedent": "Caso similar que funciono en otro lado (investigar si existe)",
      "suggestedActionType": "carta|peticion|iniciativa_comunitaria|difusion|nota_periodistica|proyecto_ley",
      "actionTemplate": "TEXTO COMPLETO de la accion \u2014 carta, peticion, proyecto, nota \u2014 LISTO PARA USAR. Extenso, formal, profesional, con todos los datos."
    }
  ],
  "territoryMandates": [
    {
      "territoryName": "Nombre exacto del territorio",
      "territoryLevel": "barrio|city|province|national",
      "convergenceScore": numero_0_a_100,
      "voiceCount": numero,
      "priorities": [
        {"rank": numero, "theme": "tema", "description": "descripcion con evidencia", "convergencePercent": numero, "voiceCount": numero, "sampleQuotes": ["citas reales"]}
      ],
      "gaps": [
        {"theme": "tema", "needCount": numero, "resourceCount": numero, "gap": numero, "urgency": "critical|high|medium"}
      ],
      "suggestedActions": [
        {"title": "titulo accion", "description": "descripcion detallada", "needsAddressed": "que necesidad cubre", "resourcesRequired": "que recursos se necesitan", "estimatedImpact": "impacto estimado", "precedent": "caso similar si existe"}
      ],
      "rawSummary": "Resumen ejecutivo del mandato territorial \u2014 directo, accionable, con datos. Lo que un coordinador territorial necesita para actuar hoy."
    }
  ],
  "unconnectedResources": [
    {"resource": "descripcion", "category": "categoria", "suggestion": "como podria activarse"}
  ],
  "seedOfWeek": {
    "title": "Idea inspiradora",
    "description": "Explicacion de la idea",
    "inspiration": "Por que los datos sugieren esta idea aunque nadie la pidio explicitamente"
  },
  "comparisonWithPrevious": {
    "trends": [{"theme": "tema", "direction": "up|stable|down", "detail": "explicacion"}],
    "escalations": ["propuestas que deben escalar de urgencia"]
  },
  "fullAnalysis": "EL PULSO COMPLETO como texto narrativo. Incluye todo: termometro, patrones, propuestas explicadas, mandatos territoriales resumidos, recursos sin conectar, semilla. Se extenso, profundo, y accionable. Esto es lo que la gente lee."
}

IMPORTANTE:
- Genera tantas propuestas como los datos justifiquen \u2014 no hay limite.
- Genera un mandato territorial por cada territorio con 3+ voces.
- Para cada mandato territorial, identifica que nivel de gobierno deber\xEDa responder.
- Cada propuesta debe ser autoevidente desde los datos.
- El texto de fullAnalysis (tanto global como por propuesta) debe ser tan extenso como sea necesario para generar algo de alt\xEDsima calidad.
- Las plantillas de accion (actionTemplate) deben ser documentos COMPLETOS listos para usar.
- Si no hay datos suficientes para un territorio, no inventes \u2014 omit\xED ese mandato.`;
  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 24e3,
    system: MANDATO_SYSTEM_PROMPT,
    messages: [{ role: "user", content: prompt }]
  });
  const text2 = response.content[0].type === "text" ? response.content[0].text : "";
  const jsonStr = text2.replace(/^```json\n?/, "").replace(/\n?```$/, "").trim();
  const parsed = JSON.parse(jsonStr);
  return {
    thermometer: {
      totalNewVoices,
      newDreams: data.newDreams.length,
      newNeeds: data.newNeeds.length,
      newBastas: data.newBastas.length,
      newValues: data.newValues.length,
      newCommitments: data.newCommitments.length,
      newResources: data.newResources.length
    },
    emergingThemes: parsed.emergingThemes || [],
    patterns: parsed.patterns || [],
    proposals: parsed.proposals || [],
    territoryMandates: parsed.territoryMandates || [],
    unconnectedResources: parsed.unconnectedResources || [],
    seedOfWeek: parsed.seedOfWeek || { title: "", description: "", inspiration: "" },
    comparisonWithPrevious: parsed.comparisonWithPrevious || { trends: [], escalations: [] },
    fullAnalysis: parsed.fullAnalysis || ""
  };
}
async function generateWeeklyMandate() {
  const weekInfo = getWeekBounds();
  const existing = await db.select().from(weeklyDigests).where(
    and9(
      eq10(weeklyDigests.weekNumber, weekInfo.weekNumber),
      eq10(weeklyDigests.year, weekInfo.year)
    )
  ).limit(1);
  if (existing[0]?.status === "completed") {
    return existing[0];
  }
  let digestRecord;
  if (existing[0]) {
    digestRecord = existing[0];
    await db.update(weeklyDigests).set({ status: "generating" }).where(eq10(weeklyDigests.id, existing[0].id));
  } else {
    const [created] = await db.insert(weeklyDigests).values({
      weekNumber: weekInfo.weekNumber,
      year: weekInfo.year,
      weekStartDate: weekInfo.start.toISOString(),
      weekEndDate: weekInfo.end.toISOString(),
      status: "generating"
    }).returning();
    digestRecord = created;
  }
  try {
    const data = await gatherPulseData();
    const result = await synthesizeWithClaude(data, weekInfo);
    const [updated] = await db.update(weeklyDigests).set({
      totalNewVoices: result.thermometer.totalNewVoices,
      newDreams: result.thermometer.newDreams,
      newNeeds: result.thermometer.newNeeds,
      newBastas: result.thermometer.newBastas,
      newValues: result.thermometer.newValues,
      newCommitments: result.thermometer.newCommitments,
      newResources: result.thermometer.newResources,
      cumulativeVoices: data.allDreams.length + data.allCommitments.length,
      cumulativeResources: data.allResources.length,
      emergingThemes: JSON.stringify(result.emergingThemes),
      patterns: JSON.stringify(result.patterns),
      unconnectedResources: JSON.stringify(result.unconnectedResources),
      seedOfWeek: JSON.stringify(result.seedOfWeek),
      comparisonWithPrevious: JSON.stringify(result.comparisonWithPrevious),
      fullAnalysis: result.fullAnalysis,
      status: "completed",
      generatedAt: (/* @__PURE__ */ new Date()).toISOString()
    }).where(eq10(weeklyDigests.id, digestRecord.id)).returning();
    for (const proposal of result.proposals) {
      const existingProposal = data.recurringProposals.find(
        (p) => p.title.toLowerCase().includes(proposal.title.toLowerCase().slice(0, 20))
      );
      await db.insert(digestProposals).values({
        digestId: digestRecord.id,
        title: proposal.title,
        summary: proposal.summary,
        fullAnalysis: proposal.fullAnalysis,
        evidence: JSON.stringify(proposal.evidence),
        targetCategory: proposal.targetCategory,
        targetDescription: proposal.targetDescription,
        territory: proposal.territory,
        urgency: proposal.urgency,
        precedent: proposal.precedent,
        suggestedActionType: proposal.suggestedActionType,
        actionTemplate: proposal.actionTemplate,
        status: "propuesta",
        firstAppearedWeek: existingProposal?.firstAppearedWeek || weekInfo.weekNumber,
        weeksActive: existingProposal ? (existingProposal.weeksActive || 1) + 1 : 1
      });
    }
    for (const recurring of data.recurringProposals) {
      if ((recurring.weeksActive || 0) >= 3 && recurring.urgency !== "critica") {
        await db.update(digestProposals).set({
          urgency: "critica",
          escalatedAt: (/* @__PURE__ */ new Date()).toISOString(),
          updatedAt: (/* @__PURE__ */ new Date()).toISOString()
        }).where(eq10(digestProposals.id, recurring.id));
      }
    }
    if (result.territoryMandates && Array.isArray(result.territoryMandates)) {
      for (const tm of result.territoryMandates) {
        if (!tm.territoryName || tm.voiceCount < 3) continue;
        const level = tm.territoryLevel || "province";
        const existingMandate = await storage.getMandateByTerritory(level, tm.territoryName);
        const mandateData = {
          territoryLevel: level,
          territoryName: tm.territoryName,
          voiceCount: tm.voiceCount,
          convergenceScore: tm.convergenceScore,
          diagnosis: JSON.stringify({ priorities: tm.priorities || [] }),
          availableResources: JSON.stringify({ categories: [], totalVolunteers: 0 }),
          gaps: JSON.stringify({ critical: tm.gaps || [] }),
          suggestedActions: JSON.stringify({ actions: tm.suggestedActions || [] }),
          rawSummary: tm.rawSummary || "",
          status: "published",
          generatedAt: (/* @__PURE__ */ new Date()).toISOString()
        };
        if (existingMandate) {
          await storage.updateMandate(existingMandate.id, {
            ...mandateData,
            version: (existingMandate.version || 0) + 1
          });
          console.log(`[Mandato] Updated mandate for ${tm.territoryName} (v${(existingMandate.version || 0) + 1})`);
        } else {
          await storage.createMandate(mandateData);
          console.log(`[Mandato] Created new mandate for ${tm.territoryName}`);
        }
      }
    }
    console.log(`[Mandato] Weekly mandate generated: ${result.proposals.length} proposals, ${result.territoryMandates.length} territory mandates`);
    return updated;
  } catch (error) {
    await db.update(weeklyDigests).set({
      status: "failed",
      errorMessage: error.message || "Unknown error"
    }).where(eq10(weeklyDigests.id, digestRecord.id));
    throw error;
  }
}
function startMandatoCron() {
  cronInterval = setInterval(async () => {
    const now = /* @__PURE__ */ new Date();
    const arTime = new Date(now.toLocaleString("en-US", { timeZone: "America/Argentina/Buenos_Aires" }));
    if (arTime.getDay() === 5 && arTime.getHours() === 17 && arTime.getMinutes() === 55) {
      console.log("[Mandato] Friday 17:55 ART \u2014 triggering weekly mandate generation...");
      try {
        await generateWeeklyMandate();
        console.log("[Mandato] Weekly mandate generated successfully.");
      } catch (error) {
        console.error("[Mandato] Failed to generate weekly mandate:", error);
      }
    }
  }, 6e4);
  console.log("[Mandato] Cron scheduler started \u2014 will generate mandate every Friday at 17:55 ART");
}
async function generateAndSaveMandate(territoryLevel, territoryName, province, city) {
  const [allDreams, allResources] = await Promise.all([
    storage.getDreams(),
    storage.getUserResources()
  ]);
  const filterByTerritory = (items) => {
    if (territoryLevel === "national") return items;
    return items.filter((item) => {
      const loc = (item.location || "").toLowerCase();
      return loc.includes(territoryName.toLowerCase());
    });
  };
  const filterResources = (resources2) => {
    if (territoryLevel === "national") return resources2;
    return resources2.filter((r) => {
      const loc = [r.city, r.province, r.location].filter(Boolean).join(" ").toLowerCase();
      return loc.includes(territoryName.toLowerCase());
    });
  };
  const territoryDreams = filterByTerritory(allDreams);
  const territoryResources = filterResources(allResources);
  const THEME_KEYWORDS = {
    systemic: ["transformacion", "cambio", "revolucion", "reforma", "sistema", "estructura"],
    values: ["transparencia", "justicia", "equidad", "dignidad", "respeto", "honestidad", "solidaridad"],
    action: ["accion", "participacion", "movilizacion", "liderazgo", "iniciativa", "compromiso"],
    development: ["educacion", "formacion", "capacitacion", "aprendizaje", "conocimiento", "desarrollo"],
    justice: ["derechos", "libertad", "democracia", "acceso", "oportunidad", "proteccion"],
    economy: ["trabajo", "empleo", "economia", "produccion", "salario", "inversion"],
    health: ["salud", "cuidado", "atencion", "prevencion", "tratamiento", "vida"],
    community: ["comunidad", "pueblo", "sociedad", "colectivo", "ciudadania", "barrio", "territorio"],
    future: ["futuro", "vision", "horizonte", "esperanza", "sueno", "meta", "proposito"]
  };
  const THEME_LABELS2 = {
    systemic: "Transformaci\xF3n Sist\xE9mica",
    values: "Valores Fundamentales",
    action: "Acci\xF3n y Agencia",
    development: "Desarrollo Humano",
    justice: "Justicia y Derechos",
    economy: "Econom\xEDa y Recursos",
    health: "Salud y Vida",
    community: "Comunidad y Colectivo",
    future: "Futuro y Visi\xF3n"
  };
  const RESOURCE_CATEGORY_LABELS = {
    legal: "Legal",
    medical: "Salud",
    education: "Educaci\xF3n",
    tech: "Tecnolog\xEDa",
    construction: "Construcci\xF3n",
    agriculture: "Agricultura",
    communication: "Comunicaci\xF3n",
    admin: "Administraci\xF3n",
    transport: "Transporte",
    space: "Espacio F\xEDsico",
    equipment: "Equipamiento",
    other: "Otros"
  };
  const RESOURCE_THEME_MAP = {
    legal: ["justice", "systemic"],
    medical: ["health"],
    education: ["development", "future"],
    tech: ["systemic", "action", "economy"],
    construction: ["community", "economy"],
    agriculture: ["economy", "health"],
    communication: ["action", "values", "community"],
    admin: ["systemic", "economy"],
    transport: ["community", "economy"],
    space: ["community", "action"],
    equipment: ["economy", "action"]
  };
  const normalize2 = (w) => w.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z]/g, "");
  const themeHits = {};
  for (const tk of Object.keys(THEME_KEYWORDS)) themeHits[tk] = { count: 0, quotes: [] };
  let voiceCount = 0;
  for (const entry of territoryDreams) {
    for (const type of ["need", "basta", "dream", "value"]) {
      const text2 = entry[type];
      if (!text2) continue;
      voiceCount++;
      const words = text2.split(/\s+/).map(normalize2).filter((w) => w.length > 3);
      for (const tk of Object.keys(THEME_KEYWORDS)) {
        if (words.some((w) => THEME_KEYWORDS[tk].some((kw) => w.includes(kw) || kw.includes(w)))) {
          themeHits[tk].count++;
          if (themeHits[tk].quotes.length < 3) themeHits[tk].quotes.push(text2.length > 120 ? text2.slice(0, 120) + "\u2026" : text2);
        }
      }
    }
  }
  const priorities = Object.entries(themeHits).filter(([, v]) => v.count > 0).sort(([, a], [, b]) => b.count - a.count).slice(0, 5).map(([theme, data], i) => ({
    rank: i + 1,
    theme: THEME_LABELS2[theme] || theme,
    description: `${data.count} declaraciones convergen en ${THEME_LABELS2[theme] || theme}`,
    convergencePercent: voiceCount > 0 ? Math.round(data.count / voiceCount * 100) : 0,
    voiceCount: data.count,
    sampleQuotes: data.quotes
  }));
  const resCats = {};
  territoryResources.forEach((r) => {
    resCats[r.category || "other"] = (resCats[r.category || "other"] || 0) + 1;
  });
  const resourceCategories = Object.entries(resCats).map(([category, count3]) => ({ category: RESOURCE_CATEGORY_LABELS[category] || category, count: count3, description: `${count3} persona(s) con capacidad en ${RESOURCE_CATEGORY_LABELS[category] || category}` })).sort((a, b) => b.count - a.count);
  const resourceThemeCounts = {};
  territoryResources.forEach((r) => {
    (RESOURCE_THEME_MAP[r.category] || []).forEach((t) => {
      resourceThemeCounts[t] = (resourceThemeCounts[t] || 0) + 1;
    });
  });
  const gaps = Object.entries(themeHits).map(([theme, data]) => ({ theme: THEME_LABELS2[theme] || theme, needCount: data.count, resourceCount: resourceThemeCounts[theme] || 0, gap: data.count - (resourceThemeCounts[theme] || 0), urgency: data.count - (resourceThemeCounts[theme] || 0) > 5 ? "critical" : data.count - (resourceThemeCounts[theme] || 0) > 2 ? "high" : "medium" })).filter((g) => g.gap > 0).sort((a, b) => b.gap - a.gap).slice(0, 5);
  const suggestedActions = gaps.slice(0, 3).map((gap) => ({
    title: `Programa de ${gap.theme}`,
    description: `${gap.needCount} personas expresaron necesidad en ${gap.theme}. ${gap.resourceCount > 0 ? `Hay ${gap.resourceCount} recursos disponibles.` : "Se necesitan recursos externos."}`,
    needsAddressed: gap.theme,
    resourcesRequired: gap.resourceCount > 0 ? "Parcialmente cubiertos" : "Se requiere movilizaci\xF3n",
    estimatedImpact: `Impacto directo en ${gap.needCount} personas`
  }));
  const topPriority = priorities[0]?.theme || "Sin datos suficientes";
  let rawSummary = voiceCount > 0 ? `Mandato basado en ${voiceCount} declaraciones. Prioridad #1: ${topPriority}. ${territoryResources.length} recursos declarados. ${gaps.length} brechas identificadas.` : "A\xFAn no hay suficientes datos para generar un mandato. Se necesitan m\xE1s declaraciones en el mapa.";
  const convergenceScore = priorities.length > 0 ? Math.round(priorities.reduce((sum, p) => sum + p.convergencePercent, 0) / priorities.length) : 0;
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (apiKey && voiceCount >= 3) {
    try {
      const client = new Anthropic({ apiKey });
      const response = await client.messages.create({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1024,
        messages: [{ role: "user", content: `Sos el sintetizador del Mandato Vivo \u2014 un sistema que traduce la voz colectiva del pueblo en mandatos accionables. No interpretas, no opinas, no agregas ideolog\xEDa. Solo ARTICUL\xC1S lo que los datos dicen.

TERRITORIO: ${territoryName} (nivel: ${territoryLevel})
DATOS: ${voiceCount} declaraciones, ${territoryResources.length} recursos.

DIAGN\xD3STICO:
${JSON.stringify(priorities, null, 2)}

RECURSOS:
${JSON.stringify(resourceCategories, null, 2)}

BRECHAS:
${JSON.stringify(gaps, null, 2)}

Gener\xE1 un RESUMEN EJECUTIVO del mandato en espa\xF1ol rioplatense (m\xE1ximo 300 palabras): top 3 prioridades con evidencia, recursos disponibles, brechas cr\xEDticas, 2-3 acciones concretas. Tono: directo, sin ret\xF3rica vac\xEDa.` }]
      });
      const aiText = response.content[0].type === "text" ? response.content[0].text : "";
      if (aiText) rawSummary = aiText;
    } catch (error) {
      console.error("[Mandato] AI enrichment failed for on-demand mandate, using local analysis:", error);
    }
  }
  const mandateData = {
    territoryLevel,
    territoryName,
    province: province || null,
    city: city || null,
    voiceCount,
    convergenceScore,
    diagnosis: JSON.stringify({ priorities }),
    availableResources: JSON.stringify({ categories: resourceCategories, totalVolunteers: territoryResources.length }),
    gaps: JSON.stringify({ critical: gaps }),
    suggestedActions: JSON.stringify({ actions: suggestedActions }),
    rawSummary,
    generatedAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  const existing = await storage.getMandateByTerritory(territoryLevel, territoryName);
  if (existing) {
    const updated = await storage.updateMandate(existing.id, { ...mandateData, version: (existing.version || 0) + 1 });
    return { mandate: updated, generated: { diagnosis: { priorities }, availableResources: { categories: resourceCategories, totalVolunteers: territoryResources.length }, gaps: { critical: gaps }, suggestedActions: { actions: suggestedActions }, rawSummary, convergenceScore, voiceCount } };
  }
  const created = await storage.createMandate({ ...mandateData, status: "draft" });
  return { mandate: created, generated: { diagnosis: { priorities }, availableResources: { categories: resourceCategories, totalVolunteers: territoryResources.length }, gaps: { critical: gaps }, suggestedActions: { actions: suggestedActions }, rawSummary, convergenceScore, voiceCount } };
}
function stopMandatoCron() {
  if (cronInterval) {
    clearInterval(cronInterval);
    cronInterval = null;
    console.log("[Mandato] Cron scheduler stopped.");
  }
}
var MANDATO_SYSTEM_PROMPT, cronInterval;
var init_mandato_engine = __esm({
  "server/services/mandato-engine.ts"() {
    "use strict";
    init_storage();
    init_db();
    init_schema();
    MANDATO_SYSTEM_PROMPT = `Sos el Motor de Convergencia de "El Mandato Vivo" \u2014 el sistema de inteligencia colectiva del proyecto El Instante del Hombre Gris.

Tu funcion es UNICA y PRECISA: transformar las voces crudas del pueblo (suenos, necesidades, bastas, valores, compromisos y recursos declarados en el mapa colaborativo) en DOS productos:

1. EL PULSO SEMANAL \u2014 un analisis profundo de lo que emerge de los datos esta semana, con propuestas concretas y accionables dirigidas a destinatarios especificos.
2. MANDATOS TERRITORIALES \u2014 por cada territorio con 3 o mas voces, un mandato estructurado que sintetiza las prioridades, brechas y acciones sugeridas para ese territorio.

\u2550\u2550\u2550 PRINCIPIOS INNEGOCIABLES \u2550\u2550\u2550

- CERO INTERPRETACION IDEOLOGICA: no agregas, no filtras, no editorializas. Articul\xE1s lo que los datos dicen. Si 47 personas piden agua potable en Tucum\xE1n, eso es un mandato \u2014 no una "demanda social" ni una "reivindicaci\xF3n". Es un dato.
- CERO VOTACION: el sistema no funciona por mayor\xEDa. Funciona por convergencia. Si 3 personas en un barrio dicen lo mismo sin conocerse, eso pesa m\xE1s que 100 firmas en una petici\xF3n gen\xE9rica.
- CONVERGENCIA > POPULARIDAD: busc\xE1 patrones que se repiten entre personas que NO se coordinaron. Esa es la se\xF1al real.
- DATOS HABLAN SOLOS: cada propuesta debe ser AUTOEVIDENTE desde los datos. Si alguien lee la evidencia y no llega a la misma conclusi\xF3n, la propuesta est\xE1 mal fundamentada.
- ESCALAMIENTO TEMPORAL: si una propuesta aparece 3+ semanas seguidas sin acci\xF3n, escal\xE1 su urgencia autom\xE1ticamente. El sistema tiene memoria.
- GRANULARIDAD TERRITORIAL: agrup\xE1 las voces por territorio (barrio, ciudad, provincia, nacional). Un mandato territorial es m\xE1s poderoso que uno gen\xE9rico porque tiene nombre y apellido geogr\xE1fico.
- NIVEL DE GOBIERNO: para cada mandato territorial, identific\xE1 qu\xE9 nivel de gobierno deber\xEDa responder (municipal, provincial, nacional) o si es algo que la propia comunidad puede resolver por autogesti\xF3n.

\u2550\u2550\u2550 IDENTIDAD Y TONO \u2550\u2550\u2550

- Habl\xE1 en espa\xF1ol rioplatense, directo y sin sarasa
- S\xE9 riguroso como un analista de datos pero apasionado como alguien que entiende que detr\xE1s de cada dato hay una persona
- No uses lenguaje burocr\xE1tico ni academicista \u2014 escrib\xED para que lo entienda cualquiera desde el celular
- S\xE9 tan extenso como sea necesario para que cada propuesta sea de alt\xEDsima calidad \u2014 no hay l\xEDmite de palabras
- Cada propuesta debe poder imprimirse y entregarse tal cual a un funcionario, medio de comunicaci\xF3n, o asamblea barrial

\u2550\u2550\u2550 CATEGOR\xCDAS DE DESTINATARIOS \u2550\u2550\u2550

- gobierno_municipal: Intendencias, concejos deliberantes, secretar\xEDas municipales
- gobierno_provincial: Legislaturas provinciales, ministerios, gobernaciones
- gobierno_nacional: Congreso, ministerios nacionales, organismos federales
- organizaciones: ONGs, fundaciones, organizaciones de base, sindicatos
- medios: Periodistas, medios comunitarios, medios nacionales
- sector_privado: Empresas, cooperativas, emprendedores, c\xE1maras
- comunidad: La propia comunidad organizada (autogesti\xF3n directa)

\u2550\u2550\u2550 TIPOS DE ACCI\xD3N \u2550\u2550\u2550

- carta: Carta formal dirigida al destinatario (con encabezado, saludo, cuerpo argumentativo con datos, solicitud concreta, cierre formal)
- peticion: Petici\xF3n p\xFAblica con fundamentaci\xF3n (t\xEDtulo, fundamentaci\xF3n legal/social, datos de respaldo, pedido espec\xEDfico, espacio para adhesiones)
- iniciativa_comunitaria: Plan de acci\xF3n comunitario autogestivo (objetivo, pasos, recursos necesarios, cronograma, coordinaci\xF3n)
- difusion: Campa\xF1a de concientizaci\xF3n (mensaje principal, datos clave, hashtags, call to action, piezas para redes)
- nota_periodistica: Nota period\xEDstica/comunicado de prensa (t\xEDtulo, bajada, cuerpo informativo, datos duros, declaraciones, cierre)
- proyecto_ley: Borrador de proyecto de ley/ordenanza (considerandos, articulado, fundamentaci\xF3n, impacto presupuestario estimado)

Para cada PLANTILLA DE ACCION, gener\xE1 el texto COMPLETO listo para usar \u2014 no res\xFAmenes, no esquemas, el documento final que alguien puede copiar, pegar, firmar y enviar.

\u2550\u2550\u2550 MANDATOS TERRITORIALES \u2550\u2550\u2550

Para cada territorio con 3 o m\xE1s voces, gener\xE1 un mandato territorial que incluya:
- Las prioridades rankeadas por convergencia real (no por cantidad bruta)
- Las brechas entre lo que se necesita y los recursos disponibles
- Acciones sugeridas que conecten necesidades con recursos existentes
- El nivel de gobierno que deber\xEDa actuar (o si es autogesti\xF3n comunitaria)
- Un resumen ejecutivo que un coordinador territorial pueda usar para actuar HOY

Los territorios pueden ser: barrios, ciudades, provincias, o el nivel nacional. Us\xE1 el nivel m\xE1s espec\xEDfico posible \u2014 un mandato de "Barrio Alberdi, C\xF3rdoba" es m\xE1s \xFAtil que uno de "C\xF3rdoba".

\u2550\u2550\u2550 DETECCI\xD3N DE PATRONES CRUZADOS \u2550\u2550\u2550

Busc\xE1 especialmente:
- Temas que aparecen en M\xDALTIPLES territorios (se\xF1al de problema sist\xE9mico)
- Recursos declarados en un territorio que podr\xEDan cubrir necesidades de otro
- Compromisos que ya abordan brechas identificadas (para visibilizarlos)
- Escalaciones: temas que pasaron de "necesidad" a "basta" en semanas recientes
- Semillas: conexiones entre datos que nadie pidi\xF3 expl\xEDcitamente pero que los datos sugieren

RESPUESTA EN JSON ESTRICTO (sin markdown, sin backticks):`;
    cronInterval = null;
  }
});

// server/matchmaker-service.ts
var matchmaker_service_exports = {};
__export(matchmaker_service_exports, {
  scanAndSaveSuggestions: () => scanAndSaveSuggestions,
  scanForMatches: () => scanForMatches
});
async function scanForMatches(minNeeds = 2, minResources = 1) {
  const [dreams3, resources2] = await Promise.all([
    storage.getDreams(),
    storage.getUserResources()
  ]);
  const THEME_KEYWORDS = {
    systemic: ["transformacion", "cambio", "revolucion", "reforma", "sistema"],
    values: ["transparencia", "justicia", "equidad", "dignidad", "respeto", "solidaridad"],
    action: ["accion", "participacion", "movilizacion", "liderazgo", "iniciativa"],
    development: ["educacion", "formacion", "capacitacion", "aprendizaje", "desarrollo"],
    justice: ["derechos", "libertad", "democracia", "acceso", "oportunidad"],
    economy: ["trabajo", "empleo", "economia", "produccion", "salario"],
    health: ["salud", "cuidado", "atencion", "prevencion", "tratamiento"],
    community: ["comunidad", "pueblo", "sociedad", "colectivo", "barrio", "territorio"],
    future: ["futuro", "vision", "horizonte", "esperanza", "sueno", "meta"]
  };
  const normalize2 = (w) => w.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z]/g, "");
  const needsByLocTheme = {};
  dreams3.forEach((entry) => {
    const loc = entry.location || "Sin ubicaci\xF3n";
    if (loc === "Sin ubicaci\xF3n") return;
    for (const type of ["need", "basta"]) {
      const text2 = entry[type];
      if (!text2) continue;
      const words = text2.split(/\s+/).map(normalize2).filter((w) => w.length > 3);
      for (const [theme, keywords] of Object.entries(THEME_KEYWORDS)) {
        if (words.some((w) => keywords.some((kw) => w.includes(kw) || kw.includes(w)))) {
          if (!needsByLocTheme[loc]) needsByLocTheme[loc] = {};
          needsByLocTheme[loc][theme] = (needsByLocTheme[loc][theme] || 0) + 1;
        }
      }
    }
  });
  const resourcesByLocCat = {};
  resources2.forEach((r) => {
    const loc = [r.city, r.province].filter(Boolean).join(", ") || r.location || "Sin ubicaci\xF3n";
    if (loc === "Sin ubicaci\xF3n") return;
    if (!resourcesByLocCat[loc]) resourcesByLocCat[loc] = {};
    const cat = r.category || "other";
    resourcesByLocCat[loc][cat] = (resourcesByLocCat[loc][cat] || 0) + 1;
  });
  const matches = [];
  for (const [loc, themes] of Object.entries(needsByLocTheme)) {
    const locResources = resourcesByLocCat[loc] || {};
    for (const [theme, needCount] of Object.entries(themes)) {
      if (needCount < minNeeds) continue;
      const matchingCategories = THEME_RESOURCE_MATCHES[theme] || [];
      for (const cat of matchingCategories) {
        const resourceCount = locResources[cat] || 0;
        if (resourceCount < minResources) continue;
        const template = ACTION_TEMPLATES[theme]?.[cat] || DEFAULT_TEMPLATE;
        matches.push({
          territoryName: loc,
          needTheme: theme,
          needThemeLabel: THEME_LABELS[theme] || theme,
          needCount,
          resourceCategory: cat,
          resourceCategoryLabel: RESOURCE_LABELS[cat] || cat,
          resourceCount,
          suggestedAction: template.action,
          precedent: template.precedent
        });
      }
    }
  }
  matches.sort((a, b) => b.needCount + b.resourceCount - (a.needCount + a.resourceCount));
  return matches;
}
async function scanAndSaveSuggestions(mandateId) {
  const matches = await scanForMatches();
  const saved = [];
  for (const match of matches.slice(0, 10)) {
    const suggestion = await storage.createSuggestion({
      mandateId: mandateId || null,
      territoryName: match.territoryName,
      needCategory: match.needTheme,
      needCount: match.needCount,
      resourceCount: match.resourceCount,
      suggestedAction: `${match.suggestedAction}

${match.needCount} personas necesitan ${match.needThemeLabel}. ${match.resourceCount} personas con capacidad en ${match.resourceCategoryLabel} est\xE1n disponibles.`,
      precedent: match.precedent,
      status: "suggested"
    });
    saved.push({ suggestion, match });
  }
  return saved;
}
var THEME_LABELS, RESOURCE_LABELS, THEME_RESOURCE_MATCHES, ACTION_TEMPLATES, DEFAULT_TEMPLATE;
var init_matchmaker_service = __esm({
  "server/matchmaker-service.ts"() {
    "use strict";
    init_storage();
    THEME_LABELS = {
      systemic: "Transformaci\xF3n Sist\xE9mica",
      values: "Valores Fundamentales",
      action: "Acci\xF3n y Agencia",
      development: "Desarrollo Humano",
      justice: "Justicia y Derechos",
      economy: "Econom\xEDa y Recursos",
      health: "Salud y Vida",
      community: "Comunidad y Colectivo",
      future: "Futuro y Visi\xF3n"
    };
    RESOURCE_LABELS = {
      legal: "Legal",
      medical: "Salud",
      education: "Educaci\xF3n",
      tech: "Tecnolog\xEDa",
      construction: "Construcci\xF3n",
      agriculture: "Agricultura",
      communication: "Comunicaci\xF3n",
      admin: "Administraci\xF3n",
      transport: "Transporte",
      space: "Espacio F\xEDsico",
      equipment: "Equipamiento",
      other: "Otros"
    };
    THEME_RESOURCE_MATCHES = {
      health: ["medical"],
      development: ["education"],
      justice: ["legal"],
      economy: ["tech", "agriculture", "construction", "admin"],
      community: ["space", "communication", "transport"],
      action: ["communication", "tech", "space"],
      systemic: ["legal", "tech", "admin"],
      values: ["education", "communication"],
      future: ["education", "tech"]
    };
    ACTION_TEMPLATES = {
      health: {
        medical: {
          action: "Red de Atenci\xF3n Comunitaria: jornadas de salud gratuitas con profesionales voluntarios",
          precedent: "En Rosario, 15 m\xE9dicos voluntarios atienden a 200 familias por mes en centros comunitarios"
        }
      },
      development: {
        education: {
          action: "Red de Tutor\xEDas Barriales: docentes voluntarios ofrecen apoyo escolar en espacios comunitarios",
          precedent: "En La Matanza, una red de 30 docentes ayud\xF3 a 500 chicos a mejorar rendimiento escolar en 6 meses"
        }
      },
      justice: {
        legal: {
          action: "Consultorio Jur\xEDdico Popular: asesoramiento legal gratuito semanal para el barrio",
          precedent: "En C\xF3rdoba, 10 abogados voluntarios resolvieron 150 casos de vivienda en un a\xF1o"
        }
      },
      economy: {
        tech: {
          action: "Hub de Emprendedores Digitales: capacitaci\xF3n tecnol\xF3gica para generar ingresos",
          precedent: "En Mendoza, un hub digital capacit\xF3 a 80 personas que generaron emprendimientos en 4 meses"
        },
        agriculture: {
          action: "Red de Huertas Comunitarias: producci\xF3n local de alimentos con asistencia t\xE9cnica",
          precedent: "En Tucum\xE1n, 20 huertas comunitarias alimentan a 300 familias y generan excedente para ferias"
        }
      },
      community: {
        space: {
          action: "Centro de Encuentro Barrial: espacio abierto para reuniones, talleres y coordinaci\xF3n vecinal",
          precedent: "En San Mart\xEDn, un vecino cedi\xF3 su garaje y ahora funciona como centro comunitario con 100 asistentes semanales"
        },
        communication: {
          action: "Medio Comunitario Digital: canal de comunicaci\xF3n barrial para coordinar acciones y difundir logros",
          precedent: "En Quilmes, un grupo de WhatsApp barrial evolucion\xF3 a un medio digital con 2,000 seguidores"
        }
      }
    };
    DEFAULT_TEMPLATE = {
      action: "Programa de acci\xF3n coordinada conectando necesidades con recursos disponibles en el territorio",
      precedent: "M\xFAltiples experiencias en Argentina demuestran que la organizaci\xF3n vecinal multiplica el impacto"
    };
  }
});

// server/vercel-handler.ts
import express from "express";

// server/routes.ts
init_storage();
import { createServer } from "http";

// server/routes-advanced-auth.ts
init_storage();
init_auth();
import { Router } from "express";
import crypto3 from "crypto";

// server/email.ts
import nodemailer from "nodemailer";
var EmailService = class {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }
  initializeTransporter() {
    if (process.env.EMAIL_HOST && process.env.EMAIL_USER) {
      this.transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: parseInt(process.env.EMAIL_PORT || "587"),
        secure: process.env.EMAIL_SECURE === "true",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD
        }
      });
    } else {
      this.createTestAccount();
    }
  }
  async createTestAccount() {
    try {
      const testAccount = await nodemailer.createTestAccount();
      this.transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      });
      console.log("\u{1F4E7} Using Ethereal email for testing");
      console.log("\u{1F4EC} Test email account:", testAccount.user);
    } catch (error) {
      console.error("Failed to create test email account:", error);
    }
  }
  async sendVerificationEmail(email, token, name) {
    if (!this.transporter) {
      console.log("\u{1F4E7} Email not configured. Verification link:", this.getVerificationUrl(token));
      return;
    }
    const verificationUrl = this.getVerificationUrl(token);
    const mailOptions = {
      from: process.env.EMAIL_FROM || '"\xA1BASTA!" <noreply@basta.com>',
      to: email,
      subject: "\xA1Bienvenido a \xA1BASTA! - Verifica tu email",
      html: this.getVerificationEmailTemplate(name, verificationUrl)
    };
    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log("\u{1F4E7} Verification email sent:", info.messageId);
      if (process.env.NODE_ENV === "development") {
        console.log("\u{1F4EC} Preview URL:", nodemailer.getTestMessageUrl(info));
      }
    } catch (error) {
      console.error("Failed to send verification email:", error);
      throw new Error("Failed to send verification email");
    }
  }
  async sendPasswordResetEmail(email, token, name) {
    if (!this.transporter) {
      console.log("\u{1F4E7} Email not configured. Password reset link:", this.getPasswordResetUrl(token));
      return;
    }
    const resetUrl = this.getPasswordResetUrl(token);
    const mailOptions = {
      from: process.env.EMAIL_FROM || '"\xA1BASTA!" <noreply@basta.com>',
      to: email,
      subject: "Recuperaci\xF3n de Contrase\xF1a - \xA1BASTA!",
      html: this.getPasswordResetEmailTemplate(name, resetUrl)
    };
    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log("\u{1F4E7} Password reset email sent:", info.messageId);
      if (process.env.NODE_ENV === "development") {
        console.log("\u{1F4EC} Preview URL:", nodemailer.getTestMessageUrl(info));
      }
    } catch (error) {
      console.error("Failed to send password reset email:", error);
      throw new Error("Failed to send password reset email");
    }
  }
  // Community notification methods
  async sendPostInteractionNotification(receiverEmail, receiverName, senderName, postTitle, interactionType) {
    if (!this.transporter) {
      console.log("\u{1F4E7} Email not configured. Interaction notification would be sent to:", receiverEmail);
      return;
    }
    const mailOptions = {
      from: process.env.EMAIL_FROM || '"\xA1BASTA!" <noreply@basta.com>',
      to: receiverEmail,
      subject: `Nueva ${interactionType} en tu publicaci\xF3n - \xA1BASTA!`,
      html: this.getPostInteractionNotificationTemplate(receiverName, senderName, postTitle, interactionType)
    };
    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log("\u{1F4E7} Post interaction notification sent:", info.messageId);
      if (process.env.NODE_ENV === "development") {
        console.log("\u{1F4EC} Preview URL:", nodemailer.getTestMessageUrl(info));
      }
    } catch (error) {
      console.error("Failed to send post interaction notification:", error);
      throw new Error("Failed to send post interaction notification");
    }
  }
  async sendNewMessageNotification(receiverEmail, receiverName, senderName, messageSubject) {
    if (!this.transporter) {
      console.log("\u{1F4E7} Email not configured. Message notification would be sent to:", receiverEmail);
      return;
    }
    const mailOptions = {
      from: process.env.EMAIL_FROM || '"\xA1BASTA!" <noreply@basta.com>',
      to: receiverEmail,
      subject: "Nuevo mensaje en la comunidad - \xA1BASTA!",
      html: this.getNewMessageNotificationTemplate(receiverName, senderName, messageSubject)
    };
    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log("\u{1F4E7} New message notification sent:", info.messageId);
      if (process.env.NODE_ENV === "development") {
        console.log("\u{1F4EC} Preview URL:", nodemailer.getTestMessageUrl(info));
      }
    } catch (error) {
      console.error("Failed to send new message notification:", error);
      throw new Error("Failed to send new message notification");
    }
  }
  async sendPostStatusChangeNotification(receiverEmail, receiverName, postTitle, newStatus) {
    if (!this.transporter) {
      console.log("\u{1F4E7} Email not configured. Status change notification would be sent to:", receiverEmail);
      return;
    }
    const mailOptions = {
      from: process.env.EMAIL_FROM || '"\xA1BASTA!" <noreply@basta.com>',
      to: receiverEmail,
      subject: `Estado de tu publicaci\xF3n actualizado - \xA1BASTA!`,
      html: this.getPostStatusChangeNotificationTemplate(receiverName, postTitle, newStatus)
    };
    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log("\u{1F4E7} Post status change notification sent:", info.messageId);
      if (process.env.NODE_ENV === "development") {
        console.log("\u{1F4EC} Preview URL:", nodemailer.getTestMessageUrl(info));
      }
    } catch (error) {
      console.error("Failed to send post status change notification:", error);
      throw new Error("Failed to send post status change notification");
    }
  }
  getVerificationUrl(token) {
    const baseUrl = process.env.BASE_URL || "http://localhost:5173";
    return `${baseUrl}/verify-email?token=${token}`;
  }
  getPasswordResetUrl(token) {
    const baseUrl = process.env.BASE_URL || "http://localhost:5173";
    return `${baseUrl}/reset-password?token=${token}`;
  }
  getVerificationEmailTemplate(name, verificationUrl) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>\xA1Bienvenido a \xA1BASTA!, ${name}!</h1>
          </div>
          <div class="content">
            <p>Gracias por registrarte en nuestra plataforma de cambio social.</p>
            <p>Para completar tu registro y activar tu cuenta, por favor verifica tu direcci\xF3n de email haciendo clic en el siguiente bot\xF3n:</p>
            <p style="text-align: center;">
              <a href="${verificationUrl}" class="button">Verificar mi Email</a>
            </p>
            <p>O copia y pega este enlace en tu navegador:</p>
            <p style="word-break: break-all; color: #667eea;">${verificationUrl}</p>
            <p><strong>Este enlace expirar\xE1 en 24 horas.</strong></p>
            <p>Si no creaste esta cuenta, puedes ignorar este email.</p>
          </div>
          <div class="footer">
            <p>\xA9 2025 \xA1BASTA! - Movimiento de Cambio Social</p>
            <p>Este es un email autom\xE1tico, por favor no respondas.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
  getPasswordResetEmailTemplate(name, resetUrl) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #f5576c; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Recuperaci\xF3n de Contrase\xF1a</h1>
          </div>
          <div class="content">
            <p>Hola ${name},</p>
            <p>Recibimos una solicitud para restablecer la contrase\xF1a de tu cuenta en \xA1BASTA!.</p>
            <p>Para crear una nueva contrase\xF1a, haz clic en el siguiente bot\xF3n:</p>
            <p style="text-align: center;">
              <a href="${resetUrl}" class="button">Restablecer Contrase\xF1a</a>
            </p>
            <p>O copia y pega este enlace en tu navegador:</p>
            <p style="word-break: break-all; color: #f5576c;">${resetUrl}</p>
            <div class="warning">
              <strong>\u26A0\uFE0F Importante:</strong>
              <ul>
                <li>Este enlace expirar\xE1 en 1 hora</li>
                <li>Solo puedes usar este enlace una vez</li>
                <li>Si no solicitaste este cambio, ignora este email</li>
              </ul>
            </div>
            <p>Si no solicitaste restablecer tu contrase\xF1a, tu cuenta est\xE1 segura y puedes ignorar este mensaje.</p>
          </div>
          <div class="footer">
            <p>\xA9 2025 \xA1BASTA! - Movimiento de Cambio Social</p>
            <p>Este es un email autom\xE1tico, por favor no respondas.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
  getPostInteractionNotificationTemplate(receiverName, senderName, postTitle, interactionType) {
    const interactionText = {
      "apply": "postulaci\xF3n",
      "interest": "inter\xE9s",
      "volunteer": "voluntariado",
      "save": "guardado"
    }[interactionType] || interactionType;
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          .highlight { background: #e8f4f8; padding: 15px; border-left: 4px solid #667eea; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>\xA1Nueva ${interactionText} en tu publicaci\xF3n!</h1>
          </div>
          <div class="content">
            <p>Hola ${receiverName},</p>
            <p>\xA1Excelente noticia! Alguien ha mostrado ${interactionText} en tu publicaci\xF3n.</p>
            
            <div class="highlight">
              <strong>\u{1F4DD} Publicaci\xF3n:</strong> ${postTitle}<br>
              <strong>\u{1F464} Usuario:</strong> ${senderName}<br>
              <strong>\u{1F3AF} Acci\xF3n:</strong> ${interactionText}
            </div>
            
            <p>Esto significa que tu publicaci\xF3n est\xE1 generando inter\xE9s en la comunidad. \xA1Sigue as\xED!</p>
            
            <p style="text-align: center;">
              <a href="${process.env.BASE_URL || "http://localhost:5173"}/community" class="button">Ver en la Comunidad</a>
            </p>
            
            <p>Recuerda que puedes gestionar todas las interacciones desde tu panel de control.</p>
          </div>
          <div class="footer">
            <p>\xA9 2025 \xA1BASTA! - Movimiento de Cambio Social</p>
            <p>Este es un email autom\xE1tico, por favor no respondas.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
  getNewMessageNotificationTemplate(receiverName, senderName, messageSubject) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #f5576c; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          .highlight { background: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>\xA1Tienes un nuevo mensaje!</h1>
          </div>
          <div class="content">
            <p>Hola ${receiverName},</p>
            <p>Alguien de la comunidad te ha enviado un mensaje.</p>
            
            <div class="highlight">
              <strong>\u{1F4E8} Asunto:</strong> ${messageSubject}<br>
              <strong>\u{1F464} De:</strong> ${senderName}
            </div>
            
            <p>\xA1No te olvides de responder para mantener la comunicaci\xF3n activa!</p>
            
            <p style="text-align: center;">
              <a href="${process.env.BASE_URL || "http://localhost:5173"}/community/messages" class="button">Ver Mensaje</a>
            </p>
          </div>
          <div class="footer">
            <p>\xA9 2025 \xA1BASTA! - Movimiento de Cambio Social</p>
            <p>Este es un email autom\xE1tico, por favor no respondas.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
  getPostStatusChangeNotificationTemplate(receiverName, postTitle, newStatus) {
    const statusText = {
      "badge": "pausado",
      "closed": "cerrado",
      "active": "activo"
    }[newStatus] || newStatus;
    const statusEmoji = {
      "badge": "\u23F8\uFE0F",
      "closed": "\u{1F512}",
      "active": "\u2705"
    }[newStatus] || "\u{1F4DD}";
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #4facfe; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          .highlight { background: #e3f2fd; padding: 15px; border-left: 4px solid #2196f3; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Estado de tu publicaci\xF3n actualizado</h1>
          </div>
          <div class="content">
            <p>Hola ${receiverName},</p>
            <p>El estado de tu publicaci\xF3n ha sido actualizado.</p>
            
            <div class="highlight">
              <strong>\u{1F4DD} Publicaci\xF3n:</strong> ${postTitle}<br>
              <strong>${statusEmoji} Nuevo Estado:</strong> ${statusText}
            </div>
            
            <p>Puedes revisar y gestionar tu publicaci\xF3n desde tu panel de control.</p>
            
            <p style="text-align: center;">
              <a href="${process.env.BASE_URL || "http://localhost:5173"}/community/my-posts" class="button">Ver Mis Publicaciones</a>
            </p>
          </div>
          <div class="footer">
            <p>\xA9 2025 \xA1BASTA! - Movimiento de Cambio Social</p>
            <p>Este es un email autom\xE1tico, por favor no respondas.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
};
var emailService = new EmailService();

// server/two-factor.ts
import * as speakeasy from "speakeasy";
import * as QRCode from "qrcode";
import crypto2 from "crypto";
var TwoFactorAuth = class {
  /**
   * Genera un secreto para 2FA
   */
  static generateSecret(username) {
    const secret = speakeasy.generateSecret({
      name: `\xA1BASTA! (${username})`,
      issuer: "\xA1BASTA!",
      length: 32
    });
    return {
      secret: secret.base32,
      otpauth_url: secret.otpauth_url || ""
    };
  }
  /**
   * Genera un código QR para configurar la app de autenticación
   */
  static async generateQRCode(otpauth_url) {
    try {
      const qrCodeDataUrl = await QRCode.toDataURL(otpauth_url);
      return qrCodeDataUrl;
    } catch (error) {
      throw new Error("Failed to generate QR code");
    }
  }
  /**
   * Verifica un token TOTP
   */
  static verifyToken(secret, token) {
    return speakeasy.totp.verify({
      secret,
      encoding: "base32",
      token,
      window: 2
      // Permite 2 períodos de tiempo antes/después (60 segundos)
    });
  }
  /**
   * Genera códigos de respaldo
   */
  static generateBackupCodes(count3 = 10) {
    const codes = [];
    for (let i = 0; i < count3; i++) {
      const code = crypto2.randomBytes(5).toString("hex").toUpperCase();
      codes.push(code);
    }
    return codes;
  }
  /**
   * Hashea códigos de respaldo para almacenamiento seguro
   */
  static async hashBackupCode(code) {
    const bcrypt2 = await import("bcryptjs");
    return await bcrypt2.hash(code, 10);
  }
  /**
   * Verifica un código de respaldo
   */
  static async verifyBackupCode(code, hashedCode) {
    const bcrypt2 = await import("bcryptjs");
    return await bcrypt2.compare(code, hashedCode);
  }
};

// server/routes-advanced-auth.ts
import { z as z2 } from "zod";
var router = Router();
router.post("/send-verification", authenticateToken, async (req, res) => {
  try {
    const user = await storage.getUser(req.user.userId);
    if (!user) {
      return res.status(404).json({
        error: "User not found",
        message: "Usuario no encontrado"
      });
    }
    if (user.emailVerified) {
      return res.status(400).json({
        error: "Email already verified",
        message: "El email ya est\xE1 verificado"
      });
    }
    const token = crypto3.randomBytes(32).toString("hex");
    const expires = /* @__PURE__ */ new Date();
    expires.setHours(expires.getHours() + 24);
    await storage.setEmailVerificationToken(user.id, token, expires);
    try {
      await emailService.sendVerificationEmail(user.email, token, user.name);
      res.json({
        message: "Email de verificaci\xF3n enviado",
        email: user.email
      });
    } catch (emailError) {
      console.error("Failed to send email:", emailError);
      res.status(503).json({
        error: "Email service unavailable",
        message: "No se pudo enviar el email de verificaci\xF3n en este momento. Intenta nuevamente m\xE1s tarde."
      });
    }
  } catch (error) {
    console.error("Send verification error:", error);
    res.status(500).json({
      error: "Internal server error",
      message: "Error interno del servidor"
    });
  }
});
router.post("/verify-email", async (req, res) => {
  try {
    const schema = z2.object({
      token: z2.string().min(1, "Token es requerido")
    });
    const { token } = schema.parse(req.body);
    const user = await storage.verifyEmail(token);
    if (!user) {
      return res.status(400).json({
        error: "Invalid or expired token",
        message: "Token inv\xE1lido o expirado",
        code: "INVALID_TOKEN"
      });
    }
    res.json({
      message: "Email verificado exitosamente",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        emailVerified: true
      }
    });
  } catch (error) {
    if (error instanceof z2.ZodError) {
      return res.status(400).json({
        error: "Validation error",
        message: "Datos de entrada inv\xE1lidos",
        details: error.errors
      });
    }
    console.error("Verify email error:", error);
    res.status(500).json({
      error: "Internal server error",
      message: "Error interno del servidor"
    });
  }
});
router.post("/forgot-password", async (req, res) => {
  try {
    const schema = z2.object({
      email: z2.string().email("Email inv\xE1lido")
    });
    const { email } = schema.parse(req.body);
    const user = await storage.getUserByEmail(email);
    if (!user) {
      return res.json({
        message: "Si el email existe, recibir\xE1s instrucciones para restablecer tu contrase\xF1a"
      });
    }
    const token = crypto3.randomBytes(32).toString("hex");
    const expires = /* @__PURE__ */ new Date();
    expires.setHours(expires.getHours() + 1);
    await storage.setPasswordResetToken(user.id, token, expires);
    try {
      await emailService.sendPasswordResetEmail(user.email, token, user.name);
      res.json({
        message: "Si el email existe, recibir\xE1s instrucciones para restablecer tu contrase\xF1a",
        email: user.email
      });
    } catch (emailError) {
      console.error("Failed to send email:", emailError);
      res.json({
        message: "Si el email existe, recibir\xE1s instrucciones para restablecer tu contrase\xF1a"
      });
    }
  } catch (error) {
    if (error instanceof z2.ZodError) {
      return res.status(400).json({
        error: "Validation error",
        message: "Email inv\xE1lido",
        details: error.errors
      });
    }
    console.error("Forgot password error:", error);
    res.status(500).json({
      error: "Internal server error",
      message: "Error interno del servidor"
    });
  }
});
router.post("/reset-password", async (req, res) => {
  try {
    const schema = z2.object({
      token: z2.string().min(1, "Token es requerido"),
      newPassword: z2.string().min(8, "La contrase\xF1a debe tener al menos 8 caracteres").regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])/,
        "La contrase\xF1a debe contener may\xFAsculas, min\xFAsculas, n\xFAmeros y caracteres especiales"
      )
    });
    const { token, newPassword } = schema.parse(req.body);
    const user = await storage.getUserByPasswordResetToken(token);
    if (!user) {
      return res.status(400).json({
        error: "Invalid or expired token",
        message: "Token inv\xE1lido o expirado",
        code: "INVALID_TOKEN"
      });
    }
    await storage.updatePassword(user.id, newPassword);
    res.json({
      message: "Contrase\xF1a restablecida exitosamente"
    });
  } catch (error) {
    if (error instanceof z2.ZodError) {
      return res.status(400).json({
        error: "Validation error",
        message: "Datos de entrada inv\xE1lidos",
        details: error.errors
      });
    }
    console.error("Reset password error:", error);
    res.status(500).json({
      error: "Internal server error",
      message: "Error interno del servidor"
    });
  }
});
router.post("/2fa/setup", authenticateToken, async (req, res) => {
  try {
    const user = await storage.getUser(req.user.userId);
    if (!user) {
      return res.status(404).json({
        error: "User not found",
        message: "Usuario no encontrado"
      });
    }
    if (user.twoFactorEnabled) {
      return res.status(400).json({
        error: "2FA already enabled",
        message: "2FA ya est\xE1 habilitado"
      });
    }
    const { secret, otpauth_url } = TwoFactorAuth.generateSecret(user.username);
    const qrCode = await TwoFactorAuth.generateQRCode(otpauth_url);
    const backupCodes = TwoFactorAuth.generateBackupCodes(10);
    res.json({
      message: "2FA configurado. Escanea el c\xF3digo QR con tu app de autenticaci\xF3n.",
      secret,
      qrCode,
      backupCodes,
      instructions: {
        step1: "Descarga una app de autenticaci\xF3n (Google Authenticator, Authy, etc.)",
        step2: "Escanea el c\xF3digo QR con la app",
        step3: "Ingresa el c\xF3digo de 6 d\xEDgitos para verificar",
        step4: "Guarda los c\xF3digos de respaldo en un lugar seguro"
      }
    });
  } catch (error) {
    console.error("2FA setup error:", error);
    res.status(500).json({
      error: "Internal server error",
      message: "Error interno del servidor"
    });
  }
});
router.post("/2fa/enable", authenticateToken, async (req, res) => {
  try {
    const schema = z2.object({
      secret: z2.string().min(1, "Secret es requerido"),
      token: z2.string().length(6, "Token debe tener 6 d\xEDgitos"),
      backupCodes: z2.array(z2.string())
    });
    const { secret, token, backupCodes } = schema.parse(req.body);
    const isValid = TwoFactorAuth.verifyToken(secret, token);
    if (!isValid) {
      return res.status(400).json({
        error: "Invalid token",
        message: "C\xF3digo de verificaci\xF3n inv\xE1lido",
        code: "INVALID_2FA_TOKEN"
      });
    }
    const hashedBackupCodes = await Promise.all(
      backupCodes.map((code) => TwoFactorAuth.hashBackupCode(code))
    );
    await storage.enable2FA(req.user.userId, secret, hashedBackupCodes);
    res.json({
      message: "2FA habilitado exitosamente",
      backupCodes
      // Return unhashed codes for user to save
    });
  } catch (error) {
    if (error instanceof z2.ZodError) {
      return res.status(400).json({
        error: "Validation error",
        message: "Datos de entrada inv\xE1lidos",
        details: error.errors
      });
    }
    console.error("2FA enable error:", error);
    res.status(500).json({
      error: "Internal server error",
      message: "Error interno del servidor"
    });
  }
});
router.post("/2fa/verify", authenticateToken, async (req, res) => {
  try {
    const schema = z2.object({
      token: z2.string().length(6, "Token debe tener 6 d\xEDgitos"),
      useBackupCode: z2.boolean().optional()
    });
    const { token, useBackupCode } = schema.parse(req.body);
    const secret = await storage.get2FASecret(req.user.userId);
    if (!secret) {
      return res.status(400).json({
        error: "2FA not enabled",
        message: "2FA no est\xE1 habilitado"
      });
    }
    let isValid = false;
    if (useBackupCode) {
      const user = await storage.getUser(req.user.userId);
      if (user?.twoFactorBackupCodes) {
        const backupCodes = JSON.parse(user.twoFactorBackupCodes);
        for (let i = 0; i < backupCodes.length; i++) {
          if (backupCodes[i] && await TwoFactorAuth.verifyBackupCode(token, backupCodes[i])) {
            isValid = true;
            await storage.useBackupCode(req.user.userId, i);
            break;
          }
        }
      }
    } else {
      isValid = TwoFactorAuth.verifyToken(secret, token);
    }
    if (!isValid) {
      return res.status(400).json({
        error: "Invalid token",
        message: "C\xF3digo de verificaci\xF3n inv\xE1lido",
        code: "INVALID_2FA_TOKEN"
      });
    }
    res.json({
      message: "Verificaci\xF3n 2FA exitosa",
      verified: true
    });
  } catch (error) {
    if (error instanceof z2.ZodError) {
      return res.status(400).json({
        error: "Validation error",
        message: "Datos de entrada inv\xE1lidos",
        details: error.errors
      });
    }
    console.error("2FA verify error:", error);
    res.status(500).json({
      error: "Internal server error",
      message: "Error interno del servidor"
    });
  }
});
router.post("/2fa/disable", authenticateToken, async (req, res) => {
  try {
    const schema = z2.object({
      password: z2.string().min(1, "Contrase\xF1a es requerida")
    });
    const { password } = schema.parse(req.body);
    const user = await storage.getUser(req.user.userId);
    if (!user) {
      return res.status(404).json({
        error: "User not found",
        message: "Usuario no encontrado"
      });
    }
    const isPasswordValid = await PasswordManager.verify(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        error: "Invalid password",
        message: "Contrase\xF1a incorrecta",
        code: "INVALID_PASSWORD"
      });
    }
    if (user.password && !/^\$2[aby]\$\d{2}\$/.test(user.password)) {
      console.warn(`[2FA disable] Plaintext password detected for user "${user.username}". Upgrading to secure hash.`);
      await storage.updatePassword(user.id, password);
    }
    await storage.disable2FA(req.user.userId);
    res.json({
      message: "2FA deshabilitado exitosamente"
    });
  } catch (error) {
    if (error instanceof z2.ZodError) {
      return res.status(400).json({
        error: "Validation error",
        message: "Datos de entrada inv\xE1lidos",
        details: error.errors
      });
    }
    console.error("2FA disable error:", error);
    res.status(500).json({
      error: "Internal server error",
      message: "Error interno del servidor"
    });
  }
});
var routes_advanced_auth_default = router;

// server/routes-initiatives.ts
init_storage();
init_auth();
init_schema();
import { z as z3 } from "zod";
function parseId(value) {
  const id = Number.parseInt(value, 10);
  return Number.isNaN(id) ? null : id;
}
function registerInitiativeRoutes(app2) {
  app2.put(
    "/api/community/:postId/milestones/:milestoneId",
    authenticateToken,
    async (req, res) => {
      try {
        const milestoneId = parseId(req.params.milestoneId);
        if (milestoneId === null) {
          return res.status(400).json({ message: "Invalid milestone ID" });
        }
        const postId = parseId(req.params.postId);
        if (postId !== null) {
          const members = await storage.getInitiativeMembers(postId);
          const isMember = members.some((m) => m.userId === req.user?.userId);
          if (!isMember) {
            return res.status(403).json({ message: "Not authorized to update this milestone" });
          }
        }
        const updates = insertInitiativeMilestoneSchema.partial().parse(req.body);
        await storage.updateMilestone(milestoneId, updates);
        res.json({ message: "Milestone updated" });
      } catch (error) {
        if (error instanceof z3.ZodError) {
          return res.status(400).json({
            error: "Validation error",
            details: error.errors
          });
        }
        res.status(500).json({ message: "Failed to update milestone" });
      }
    }
  );
  app2.put(
    "/api/community/:postId/tasks/:taskId",
    authenticateToken,
    async (req, res) => {
      try {
        const taskId = parseId(req.params.taskId);
        if (taskId === null) {
          return res.status(400).json({ message: "Invalid task ID" });
        }
        const postId = parseId(req.params.postId);
        if (postId !== null) {
          const members = await storage.getInitiativeMembers(postId);
          const isMember = members.some((m) => m.userId === req.user?.userId);
          if (!isMember) {
            return res.status(403).json({ message: "Not authorized to update this task" });
          }
        }
        const updates = insertInitiativeTaskSchema.partial().parse(req.body);
        await storage.updateTask(taskId, updates);
        res.json({ message: "Task updated" });
      } catch (error) {
        if (error instanceof z3.ZodError) {
          return res.status(400).json({
            error: "Validation error",
            details: error.errors
          });
        }
        res.status(500).json({ message: "Failed to update task" });
      }
    }
  );
  app2.post(
    "/api/community/:postId/tasks/:taskId/assign",
    authenticateToken,
    async (req, res) => {
      try {
        const taskId = parseId(req.params.taskId);
        if (taskId === null) {
          return res.status(400).json({ message: "Invalid task ID" });
        }
        const assignedTo = typeof req.body.assignedTo === "number" ? req.body.assignedTo : Number.parseInt(String(req.body.assignedTo), 10);
        if (!Number.isInteger(assignedTo) || assignedTo <= 0) {
          return res.status(400).json({ message: "Invalid assignedTo user ID" });
        }
        await storage.assignTask(taskId, assignedTo);
        try {
          const postId = parseId(req.params.postId);
          if (postId) {
            const post = await storage.getCommunityPostWithDetails(postId);
            await storage.createNotification(assignedTo, {
              type: "task_assigned",
              title: "Tarea asignada",
              content: `Te asignaron una tarea en "${post?.title || "una iniciativa"}"`,
              postId,
              userId: assignedTo,
              targetId: taskId
            });
          }
        } catch (_) {
        }
        res.json({ message: "Task assigned" });
      } catch (error) {
        res.status(500).json({ message: "Failed to assign task" });
      }
    }
  );
}

// server/routes-courses.ts
init_storage();
init_auth();
function registerCourseRoutes(app2) {
  app2.get("/api/courses", optionalAuth, async (req, res) => {
    try {
      const category = req.query.category;
      const level = req.query.level;
      const search = req.query.search;
      const page = req.query.page ? parseInt(req.query.page) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit) : 12;
      const sortBy = req.query.sortBy;
      const featured = req.query.featured !== void 0 ? req.query.featured === "true" : void 0;
      const result = await storage.getCourses({
        category,
        level,
        search,
        page,
        limit,
        sortBy,
        featured
      });
      if (req.user?.userId) {
        const coursesWithProgress = await Promise.all(
          result.courses.map(async (course) => {
            const progress = await storage.getUserCourseProgress(req.user.userId, course.id);
            return {
              ...course,
              userProgress: progress || null
            };
          })
        );
        res.json({ ...result, courses: coursesWithProgress });
      } else {
        res.json(result);
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
      res.status(500).json({ message: "Error fetching courses" });
    }
  });
  app2.get("/api/courses/:slug", optionalAuth, async (req, res) => {
    try {
      const { slug } = req.params;
      const course = await storage.getCourseBySlug(slug);
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }
      if (!course.isPublished) {
        return res.status(404).json({ message: "Course not found" });
      }
      await storage.incrementCourseView(course.id);
      const courseData = await storage.getCourseWithLessons(course.id);
      if (!courseData) {
        return res.status(404).json({ message: "Course data not found" });
      }
      const quizData = await storage.getCourseQuiz(course.id);
      let userProgress2 = null;
      let userQuizAttempts = null;
      let completedLessons = [];
      if (req.user?.userId) {
        userProgress2 = await storage.getUserCourseProgress(req.user.userId, course.id);
        if (userProgress2?.completedLessons) {
          completedLessons = JSON.parse(userProgress2.completedLessons);
        }
        if (quizData) {
          userQuizAttempts = await storage.getUserQuizAttempts(req.user.userId, quizData.quiz.id);
        }
      }
      res.json({
        course: { ...course, viewCount: (course.viewCount || 0) + 1 },
        lessons: courseData.lessons,
        quiz: quizData ? { ...quizData.quiz, questions: quizData.questions } : null,
        userProgress: userProgress2,
        completedLessons,
        userQuizAttempts: userQuizAttempts || []
      });
    } catch (error) {
      console.error("Error fetching course:", error);
      res.status(500).json({ message: "Error fetching course" });
    }
  });
  app2.get("/api/courses/:courseId/progress", authenticateToken, async (req, res) => {
    try {
      const { courseId } = req.params;
      const id = parseInt(courseId);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid course ID" });
      }
      const progress = await storage.getUserCourseProgress(req.user.userId, id);
      if (!progress) {
        return res.status(404).json({ message: "Progress not found" });
      }
      let currentLesson = null;
      if (progress.currentLessonId) {
        const courseData = await storage.getCourseWithLessons(id);
        if (courseData) {
          currentLesson = courseData.lessons.find((l) => l.id === progress.currentLessonId);
        }
      }
      const completedLessonsIds = JSON.parse(progress.completedLessons || "[]");
      res.json({
        progress,
        currentLesson,
        completedLessons: completedLessonsIds
      });
    } catch (error) {
      console.error("Error fetching course progress:", error);
      res.status(500).json({ message: "Error fetching course progress" });
    }
  });
  app2.post("/api/courses/:courseId/start", authenticateToken, async (req, res) => {
    try {
      const { courseId } = req.params;
      const id = parseInt(courseId);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid course ID" });
      }
      const courseById = await storage.getCourseById(id);
      if (!courseById) {
        return res.status(404).json({ message: "Course not found" });
      }
      if (!courseById.isPublished) {
        return res.status(403).json({ message: "Course is not published" });
      }
      if (courseById.requiresAuth && !req.user) {
        return res.status(401).json({ message: "Course requires authentication" });
      }
      const progress = await storage.startCourse(req.user.userId, id);
      res.json({ progress });
    } catch (error) {
      console.error("Error starting course:", error);
      res.status(500).json({ message: "Error starting course" });
    }
  });
  app2.post("/api/courses/:courseId/lessons/:lessonId/complete", authenticateToken, async (req, res) => {
    try {
      const { courseId, lessonId } = req.params;
      const lessonIdNum = parseInt(lessonId);
      const courseIdNum = parseInt(courseId);
      if (isNaN(lessonIdNum) || isNaN(courseIdNum)) {
        return res.status(400).json({ message: "Invalid course or lesson ID" });
      }
      let progress = await storage.getUserCourseProgress(req.user.userId, courseIdNum);
      if (!progress) {
        await storage.startCourse(req.user.userId, courseIdNum);
        progress = await storage.getUserCourseProgress(req.user.userId, courseIdNum);
        if (!progress) {
          return res.status(500).json({ message: "Could not start course" });
        }
      }
      const lesson = await storage.getLessonById(lessonIdNum);
      if (!lesson) {
        return res.status(404).json({ message: "Lesson not found" });
      }
      if (lesson.courseId !== courseIdNum) {
        return res.status(400).json({ message: "Lesson does not belong to this course" });
      }
      const result = await storage.completeLesson(req.user.userId, lessonIdNum);
      res.json(result);
    } catch (error) {
      console.error("Error completing lesson:", error);
      res.status(500).json({
        message: error instanceof Error ? error.message : "Error completing lesson"
      });
    }
  });
  app2.post("/api/courses/:courseId/lessons/:lessonId/track-time", authenticateToken, async (req, res) => {
    try {
      const { lessonId, courseId } = req.params;
      const { timeSpent, seconds } = req.body;
      const timeValue = seconds !== void 0 ? seconds : timeSpent;
      const lessonIdNum = parseInt(lessonId);
      const courseIdNum = parseInt(courseId);
      if (isNaN(lessonIdNum) || isNaN(courseIdNum)) {
        return res.status(400).json({ message: "Invalid lesson ID or course ID" });
      }
      if (timeValue === void 0 || typeof timeValue !== "number" || timeValue < 0) {
        return res.status(400).json({ message: "Invalid timeSpent value" });
      }
      await storage.updateLessonTimeSpent(req.user.userId, lessonIdNum, timeValue);
      res.json({ message: "Time tracked successfully" });
    } catch (error) {
      console.error("Error tracking time:", error);
      res.status(500).json({ message: "Error tracking time" });
    }
  });
  app2.get("/api/courses/:courseId/quiz", optionalAuth, async (req, res) => {
    try {
      const { courseId } = req.params;
      const id = parseInt(courseId);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid course ID" });
      }
      const quizData = await storage.getCourseQuiz(id);
      if (!quizData) {
        return res.status(404).json({ message: "Quiz not found for this course" });
      }
      let attempts = [];
      if (req.user && req.user.userId) {
        attempts = await storage.getUserQuizAttempts(req.user.userId, quizData.quiz.id);
      }
      res.json({
        quiz: quizData.quiz,
        questions: quizData.questions,
        attempts
      });
    } catch (error) {
      console.error("Error fetching quiz:", error);
      res.status(500).json({ message: "Error fetching quiz" });
    }
  });
  app2.post("/api/courses/:courseId/quiz/attempt", authenticateToken, async (req, res) => {
    try {
      const { courseId } = req.params;
      const id = parseInt(courseId);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid course ID" });
      }
      const quizData = await storage.getCourseQuiz(id);
      if (!quizData) {
        return res.status(404).json({ message: "Quiz not found for this course" });
      }
      const courseData = await storage.getCourseWithLessons(id);
      const progress = await storage.getUserCourseProgress(req.user.userId, id);
      const completedLessons = progress?.completedLessons ? JSON.parse(progress.completedLessons) : [];
      const requiredLessonIds = (courseData?.lessons ?? []).filter((lesson) => lesson.isRequired).map((lesson) => lesson.id);
      const hasUnlockedQuiz = requiredLessonIds.length === 0 ? true : requiredLessonIds.every((lessonId) => completedLessons.includes(lessonId));
      if (!hasUnlockedQuiz) {
        return res.status(403).json({
          message: "Complete las lecciones requeridas antes de iniciar el quiz"
        });
      }
      if (quizData.quiz.maxAttempts !== null) {
        const attempts = await storage.getUserQuizAttempts(req.user.userId, quizData.quiz.id);
        if (attempts.length >= quizData.quiz.maxAttempts) {
          return res.status(403).json({
            message: `Maximum attempts (${quizData.quiz.maxAttempts}) reached`
          });
        }
      }
      const attempt = await storage.createQuizAttempt(
        req.user.userId,
        quizData.quiz.id,
        id
      );
      res.json({
        attemptId: attempt.id,
        questions: quizData.questions.map((q) => ({
          id: q.id,
          question: q.question,
          type: q.type,
          options: q.options ? JSON.parse(q.options) : null,
          points: q.points,
          orderIndex: q.orderIndex
        }))
      });
    } catch (error) {
      console.error("Error creating quiz attempt:", error);
      res.status(500).json({ message: "Error creating quiz attempt" });
    }
  });
  app2.post("/api/courses/:courseId/quiz/attempt/:attemptId/submit", authenticateToken, async (req, res) => {
    try {
      const { attemptId } = req.params;
      const { answers } = req.body;
      const attemptIdNum = parseInt(attemptId);
      if (isNaN(attemptIdNum)) {
        return res.status(400).json({ message: "Invalid attempt ID" });
      }
      if (!Array.isArray(answers)) {
        return res.status(400).json({ message: "Answers must be an array" });
      }
      const attempt = await storage.getQuizAttempt(attemptIdNum);
      if (!attempt) {
        return res.status(404).json({ message: "Quiz attempt not found" });
      }
      if (attempt.userId !== req.user.userId) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      if (!attempt.courseId) {
        return res.status(400).json({ message: "Quiz attempt has no course ID" });
      }
      const quizData = await storage.getCourseQuiz(attempt.courseId);
      if (quizData?.quiz.timeLimit) {
        const timeSpent = attempt.startedAt ? Math.floor(((/* @__PURE__ */ new Date()).getTime() - new Date(attempt.startedAt).getTime()) / 1e3 / 60) : 0;
        if (timeSpent > quizData.quiz.timeLimit) {
          return res.status(400).json({ message: "Time limit exceeded" });
        }
      }
      const result = await storage.submitQuizAttempt(attemptIdNum, answers);
      res.json(result);
    } catch (error) {
      console.error("Error submitting quiz:", error);
      res.status(500).json({
        message: error instanceof Error ? error.message : "Error submitting quiz"
      });
    }
  });
  app2.get("/api/courses/:courseId/certificate", authenticateToken, async (req, res) => {
    try {
      const { courseId } = req.params;
      const id = parseInt(courseId);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid course ID" });
      }
      const certificates = await storage.getUserCertificates(req.user.userId);
      const certificate = certificates.find((c) => c.courseId === id);
      if (!certificate) {
        return res.status(404).json({ message: "Certificate not found" });
      }
      const courseData = await storage.getCourseWithLessons(id);
      if (!courseData) {
        return res.status(404).json({ message: "Course not found" });
      }
      res.json({
        certificate,
        course: courseData.course
      });
    } catch (error) {
      console.error("Error fetching certificate:", error);
      res.status(500).json({ message: "Error fetching certificate" });
    }
  });
  app2.get("/api/user/courses", authenticateToken, async (req, res) => {
    try {
      const userCourses = await storage.getUserCourses(req.user.userId);
      res.json({
        courses: userCourses.map(({ course, progress }) => ({
          ...course,
          userProgress: progress
        }))
      });
    } catch (error) {
      console.error("Error fetching user courses:", error);
      res.status(500).json({ message: "Error fetching user courses" });
    }
  });
  app2.get("/api/user/certificates", authenticateToken, async (req, res) => {
    try {
      const certificates = await storage.getUserCertificates(req.user.userId);
      const certificatesWithCourses = await Promise.all(
        certificates.map(async (cert) => {
          if (!cert.courseId) {
            return {
              ...cert,
              course: null
            };
          }
          const courseData = await storage.getCourseWithLessons(cert.courseId);
          return {
            ...cert,
            course: courseData?.course || null
          };
        })
      );
      res.json({ certificates: certificatesWithCourses });
    } catch (error) {
      console.error("Error fetching certificates:", error);
      res.status(500).json({ message: "Error fetching certificates" });
    }
  });
}

// server/routes-life-areas.ts
init_auth();
init_db();
init_schema();
import { eq as eq3, and as and3, desc as desc3, sql as sql5, gte as gte2 } from "drizzle-orm";
import { randomUUID } from "crypto";
var SCORE_MAPPING = {
  0: 0,
  1: 10,
  2: 20,
  3: 30,
  4: 40,
  5: 50,
  6: 60,
  7: 70,
  8: 80,
  9: 90,
  10: 100
};
function mapScaleToScore(scaleValue) {
  const clampedValue = Math.max(0, Math.min(10, Math.round(scaleValue)));
  return SCORE_MAPPING[clampedValue] ?? 0;
}
function registerLifeAreasRoutes(app2) {
  app2.get("/api/life-areas", async (req, res) => {
    try {
      const areas = await db.select().from(lifeAreas).orderBy(lifeAreas.orderIndex);
      res.json(areas);
    } catch (error) {
      console.error("Error fetching life areas:", error);
      res.status(500).json({ message: "Error fetching life areas" });
    }
  });
  app2.get("/api/life-areas/dashboard", authenticateToken, async (req, res) => {
    try {
      console.log("[Life Areas Dashboard] Request received:", {
        hasUser: !!req.user,
        userId: req.user?.userId,
        headers: req.headers.authorization ? "Authorization header present" : "No authorization header"
      });
      if (!req.user) {
        console.error("[Life Areas Dashboard] No user found in request");
        return res.status(401).json({ message: "Authentication required" });
      }
      const userId = req.user.userId;
      console.log("[Life Areas Dashboard] Processing for userId:", userId);
      const areas = await db.select().from(lifeAreas).orderBy(lifeAreas.orderIndex);
      const scores = await db.select().from(lifeAreaScores).where(
        and3(
          eq3(lifeAreaScores.userId, userId),
          sql5`${lifeAreaScores.subcategoryId} IS NULL`
        )
      );
      const scoresMap = new Map(scores.map((s) => [s.lifeAreaId, s]));
      const areasWithScores = areas.map((area) => ({
        ...area,
        score: scoresMap.get(area.id) || null
      }));
      const levels = await db.select().from(lifeAreaLevels).where(eq3(lifeAreaLevels.userId, userId));
      const streaks = await db.select().from(lifeAreaStreaks).where(eq3(lifeAreaStreaks.userId, userId));
      const recentBadges = await db.select({
        badge: userLifeAreaBadges,
        badgeInfo: lifeAreaBadges
      }).from(userLifeAreaBadges).innerJoin(lifeAreaBadges, eq3(userLifeAreaBadges.badgeId, lifeAreaBadges.id)).where(eq3(userLifeAreaBadges.userId, userId)).orderBy(desc3(userLifeAreaBadges.earnedAt)).limit(5);
      const currency = await db.select().from(lifeAreaCurrency).where(eq3(lifeAreaCurrency.userId, userId)).limit(1);
      res.json({
        areas: areasWithScores,
        levels,
        streaks,
        recentBadges: recentBadges.map((rb) => ({
          ...rb.badge,
          badgeInfo: rb.badgeInfo
        })),
        currency: currency[0] || { amount: 0, totalEarned: 0, totalSpent: 0 }
      });
    } catch (error) {
      console.error("Error fetching dashboard:", error);
      if (error instanceof Error) {
        console.error("Error details:", error.message, error.stack);
      }
      res.status(500).json({ message: "Error fetching dashboard", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });
  app2.get("/api/life-areas/wheel", authenticateToken, async (req, res) => {
    try {
      console.log("[Life Areas Wheel] Request received:", {
        hasUser: !!req.user,
        userId: req.user?.userId,
        headers: req.headers.authorization ? "Authorization header present" : "No authorization header"
      });
      if (!req.user) {
        console.error("[Life Areas Wheel] No user found in request");
        return res.status(401).json({ message: "Authentication required" });
      }
      const userId = req.user.userId;
      console.log("[Life Areas Wheel] Processing for userId:", userId);
      const areas = await db.select().from(lifeAreas).orderBy(lifeAreas.orderIndex);
      const scores = await db.select().from(lifeAreaScores).where(
        and3(
          eq3(lifeAreaScores.userId, userId),
          sql5`${lifeAreaScores.subcategoryId} IS NULL`
        )
      );
      const scoresMap = new Map(scores.map((s) => [s.lifeAreaId, s]));
      const wheelData = areas.map((area) => {
        let colorTheme = null;
        if (area.colorTheme) {
          try {
            colorTheme = JSON.parse(area.colorTheme);
          } catch (e) {
            console.warn(`Failed to parse colorTheme for area ${area.id}:`, e);
            colorTheme = null;
          }
        }
        return {
          id: area.id,
          name: area.name,
          iconName: area.iconName,
          colorTheme,
          currentScore: scoresMap.get(area.id)?.currentScore || 0,
          desiredScore: scoresMap.get(area.id)?.desiredScore || 0,
          gap: scoresMap.get(area.id)?.gap || 0
        };
      });
      res.json(wheelData);
    } catch (error) {
      console.error("Error fetching wheel data:", error);
      if (error instanceof Error) {
        console.error("Error details:", error.message, error.stack);
      }
      res.status(500).json({ message: "Error fetching wheel data", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });
  app2.get("/api/life-areas/:areaId(\\d+)", async (req, res) => {
    try {
      const areaId = parseInt(req.params.areaId);
      if (isNaN(areaId) || areaId <= 0) {
        return res.status(400).json({ message: "Invalid area ID" });
      }
      const area = await db.select().from(lifeAreas).where(eq3(lifeAreas.id, areaId)).limit(1);
      if (area.length === 0) {
        return res.status(404).json({ message: "Life area not found" });
      }
      const subcategories = await db.select().from(lifeAreaSubcategories).where(eq3(lifeAreaSubcategories.lifeAreaId, areaId)).orderBy(lifeAreaSubcategories.orderIndex);
      res.json({ ...area[0], subcategories });
    } catch (error) {
      console.error("Error fetching life area:", error);
      res.status(500).json({ message: "Error fetching life area" });
    }
  });
  app2.get("/api/life-areas/:areaId(\\d+)/quiz", authenticateToken, async (req, res) => {
    try {
      const areaId = parseInt(req.params.areaId);
      if (isNaN(areaId) || areaId <= 0) {
        return res.status(400).json({ message: "Invalid area ID" });
      }
      const userId = req.user.userId;
      const quizzes = await db.select().from(lifeAreaQuizzes).where(eq3(lifeAreaQuizzes.lifeAreaId, areaId)).limit(1);
      if (quizzes.length === 0) {
        return res.status(404).json({ message: "Quiz not found for this area" });
      }
      const quiz = quizzes[0];
      const questions = await db.select().from(lifeAreaQuizQuestions).where(eq3(lifeAreaQuizQuestions.quizId, quiz.id)).orderBy(lifeAreaQuizQuestions.orderIndex);
      const previousResponses = await db.select().from(lifeAreaQuizResponses).where(
        and3(
          eq3(lifeAreaQuizResponses.userId, userId),
          eq3(lifeAreaQuizResponses.quizId, quiz.id)
        )
      );
      const responsesMap = new Map(
        previousResponses.map((r) => [r.questionId, r])
      );
      const questionsWithResponses = questions.map((q) => ({
        ...q,
        currentValue: responsesMap.get(q.id)?.currentValue || null,
        desiredValue: responsesMap.get(q.id)?.desiredValue || null
      }));
      res.json({
        ...quiz,
        questions: questionsWithResponses
      });
    } catch (error) {
      console.error("Error fetching quiz:", error);
      res.status(500).json({ message: "Error fetching quiz" });
    }
  });
  app2.post("/api/life-areas/:areaId(\\d+)/quiz/submit", authenticateToken, async (req, res) => {
    try {
      const areaId = parseInt(req.params.areaId);
      if (isNaN(areaId) || areaId <= 0) {
        return res.status(400).json({ message: "Invalid area ID" });
      }
      const userId = req.user.userId;
      const { responses } = req.body;
      if (!Array.isArray(responses)) {
        return res.status(400).json({ message: "Responses must be an array" });
      }
      if (responses.length === 0) {
        return res.status(400).json({ message: "At least one response is required" });
      }
      const quizzes = await db.select().from(lifeAreaQuizzes).where(eq3(lifeAreaQuizzes.lifeAreaId, areaId)).limit(1);
      if (quizzes.length === 0) {
        return res.status(404).json({ message: "Quiz not found" });
      }
      const quiz = quizzes[0];
      await db.delete(lifeAreaQuizResponses).where(
        and3(
          eq3(lifeAreaQuizResponses.userId, userId),
          eq3(lifeAreaQuizResponses.quizId, quiz.id)
        )
      );
      const validResponses = responses.filter((r) => {
        const questionId = parseInt(r.questionId);
        const currentScale = r.currentValue !== void 0 && r.currentValue !== null ? parseFloat(r.currentValue) : null;
        const desiredScale = r.desiredValue !== void 0 && r.desiredValue !== null ? parseFloat(r.desiredValue) : null;
        return !isNaN(questionId) && questionId > 0 && (currentScale !== null || desiredScale !== null) && (currentScale === null || currentScale >= 0 && currentScale <= 10) && (desiredScale === null || desiredScale >= 0 && desiredScale <= 10);
      });
      if (validResponses.length === 0) {
        return res.status(400).json({ message: "No valid responses provided" });
      }
      const now = (/* @__PURE__ */ new Date()).toISOString();
      for (const response of validResponses) {
        const questionId = parseInt(response.questionId);
        const currentScale = response.currentValue !== void 0 && response.currentValue !== null ? parseFloat(response.currentValue) : null;
        const desiredScale = response.desiredValue !== void 0 && response.desiredValue !== null ? parseFloat(response.desiredValue) : null;
        await db.insert(lifeAreaQuizResponses).values({
          userId,
          quizId: quiz.id,
          questionId,
          // Convertir escala 0-10 a puntos 0-100 usando el mapeo
          currentValue: currentScale !== null ? mapScaleToScore(currentScale) : null,
          desiredValue: desiredScale !== null ? mapScaleToScore(desiredScale) : null,
          answeredAt: now
        });
      }
      await calculateAndSaveScores(userId, areaId, quiz.id);
      await awardXP(userId, areaId, 100, "quiz", quiz.id);
      await checkBadges(userId, areaId, "quiz_complete");
      res.json({ message: "Quiz submitted successfully" });
    } catch (error) {
      console.error("Error submitting quiz:", error);
      res.status(500).json({ message: "Error submitting quiz" });
    }
  });
  app2.get("/api/life-areas/:areaId(\\d+)/scores", authenticateToken, async (req, res) => {
    try {
      const areaId = parseInt(req.params.areaId);
      if (isNaN(areaId) || areaId <= 0) {
        return res.status(400).json({ message: "Invalid area ID" });
      }
      const userId = req.user.userId;
      const areaScore = await db.select().from(lifeAreaScores).where(
        and3(
          eq3(lifeAreaScores.userId, userId),
          eq3(lifeAreaScores.lifeAreaId, areaId),
          sql5`${lifeAreaScores.subcategoryId} IS NULL`
        )
      ).limit(1);
      const subcategoryScores = await db.select().from(lifeAreaScores).where(
        and3(
          eq3(lifeAreaScores.userId, userId),
          eq3(lifeAreaScores.lifeAreaId, areaId),
          sql5`${lifeAreaScores.subcategoryId} IS NOT NULL`
        )
      );
      res.json({
        areaScore: areaScore[0] || null,
        subcategoryScores
      });
    } catch (error) {
      console.error("Error fetching scores:", error);
      res.status(500).json({ message: "Error fetching scores" });
    }
  });
  app2.put("/api/life-areas/:areaId(\\d+)/quiz/retake", authenticateToken, async (req, res) => {
    try {
      const areaId = parseInt(req.params.areaId);
      if (isNaN(areaId) || areaId <= 0) {
        return res.status(400).json({ message: "Invalid area ID" });
      }
      const userId = req.user.userId;
      const quizzes = await db.select().from(lifeAreaQuizzes).where(eq3(lifeAreaQuizzes.lifeAreaId, areaId)).limit(1);
      if (quizzes.length > 0) {
        await db.delete(lifeAreaQuizResponses).where(
          and3(
            eq3(lifeAreaQuizResponses.userId, userId),
            eq3(lifeAreaQuizResponses.quizId, quizzes[0].id)
          )
        );
      }
      await db.delete(lifeAreaScores).where(
        and3(
          eq3(lifeAreaScores.userId, userId),
          eq3(lifeAreaScores.lifeAreaId, areaId)
        )
      );
      res.json({ message: "Quiz reset successfully. You can now retake it." });
    } catch (error) {
      console.error("Error resetting quiz:", error);
      res.status(500).json({ message: "Error resetting quiz" });
    }
  });
  async function calculateAndSaveScores(userId, areaId, quizId) {
    const responses = await db.select().from(lifeAreaQuizResponses).where(
      and3(
        eq3(lifeAreaQuizResponses.userId, userId),
        eq3(lifeAreaQuizResponses.quizId, quizId)
      )
    );
    const questions = await db.select({
      question: lifeAreaQuizQuestions,
      subcategory: lifeAreaSubcategories
    }).from(lifeAreaQuizQuestions).leftJoin(lifeAreaSubcategories, eq3(lifeAreaQuizQuestions.subcategoryId, lifeAreaSubcategories.id)).where(eq3(lifeAreaQuizQuestions.quizId, quizId));
    const subcategoryScores = /* @__PURE__ */ new Map();
    const allCurrent = [];
    const allDesired = [];
    for (const response of responses) {
      const question = questions.find((q) => q.question.id === response.questionId);
      if (!question) continue;
      const value = question.question.category === "current" ? response.currentValue : response.desiredValue;
      if (value === null || value === void 0) continue;
      if (question.subcategory) {
        const subcatId = question.subcategory.id;
        if (!subcategoryScores.has(subcatId)) {
          subcategoryScores.set(subcatId, { current: [], desired: [] });
        }
        const scores = subcategoryScores.get(subcatId);
        if (question.question.category === "current") {
          scores.current.push(value);
        } else {
          scores.desired.push(value);
        }
      }
      if (question.question.category === "current") {
        allCurrent.push(value);
      } else {
        allDesired.push(value);
      }
    }
    if (allCurrent.length === 0 && allDesired.length === 0) {
      return;
    }
    const avgCurrent = allCurrent.length > 0 ? Math.round(allCurrent.reduce((a, b) => a + b, 0) / allCurrent.length) : 0;
    const avgDesired = allDesired.length > 0 ? Math.round(allDesired.reduce((a, b) => a + b, 0) / allDesired.length) : 0;
    const gap = avgDesired - avgCurrent;
    const existingScore = await db.select().from(lifeAreaScores).where(
      and3(
        eq3(lifeAreaScores.userId, userId),
        eq3(lifeAreaScores.lifeAreaId, areaId),
        sql5`${lifeAreaScores.subcategoryId} IS NULL`
      )
    ).limit(1);
    if (existingScore.length > 0 && existingScore[0]) {
      await db.update(lifeAreaScores).set({
        currentScore: avgCurrent,
        desiredScore: avgDesired,
        gap,
        lastUpdated: (/* @__PURE__ */ new Date()).toISOString()
      }).where(eq3(lifeAreaScores.id, existingScore[0].id));
    } else {
      await db.insert(lifeAreaScores).values({
        userId,
        lifeAreaId: areaId,
        subcategoryId: null,
        currentScore: avgCurrent,
        desiredScore: avgDesired,
        gap
      });
    }
    for (const [subcatId, scores] of Array.from(subcategoryScores.entries())) {
      const subcatCurrent = scores.current.length > 0 ? Math.round(scores.current.reduce((a, b) => a + b, 0) / scores.current.length) : 0;
      const subcatDesired = scores.desired.length > 0 ? Math.round(scores.desired.reduce((a, b) => a + b, 0) / scores.desired.length) : 0;
      const subcatGap = subcatDesired - subcatCurrent;
      const existingSubcatScore = await db.select().from(lifeAreaScores).where(
        and3(
          eq3(lifeAreaScores.userId, userId),
          eq3(lifeAreaScores.lifeAreaId, areaId),
          eq3(lifeAreaScores.subcategoryId, subcatId)
        )
      ).limit(1);
      if (existingSubcatScore.length > 0 && existingSubcatScore[0]) {
        await db.update(lifeAreaScores).set({
          currentScore: subcatCurrent,
          desiredScore: subcatDesired,
          gap: subcatGap,
          lastUpdated: (/* @__PURE__ */ new Date()).toISOString()
        }).where(eq3(lifeAreaScores.id, existingSubcatScore[0].id));
      } else {
        await db.insert(lifeAreaScores).values({
          userId,
          lifeAreaId: areaId,
          subcategoryId: subcatId,
          currentScore: subcatCurrent,
          desiredScore: subcatDesired,
          gap: subcatGap
        });
      }
    }
  }
  async function awardXP(userId, areaId, amount, sourceType, sourceId) {
    const streak = await db.select().from(lifeAreaStreaks).where(
      and3(
        eq3(lifeAreaStreaks.userId, userId),
        eq3(lifeAreaStreaks.streakType, "daily")
      )
    ).limit(1);
    const multiplier = streak[0]?.bonusMultiplier || 1;
    const finalXP = Math.round(amount * multiplier);
    await db.insert(lifeAreaXpLog).values({
      userId,
      lifeAreaId: areaId,
      xpAmount: finalXP,
      sourceType,
      sourceId: sourceId || null,
      multiplier
    });
    await updateLevel(userId, areaId);
  }
  async function updateLevel(userId, areaId) {
    const xpResult = await db.select({
      total: sql5`SUM(${lifeAreaXpLog.xpAmount})`
    }).from(lifeAreaXpLog).where(
      and3(
        eq3(lifeAreaXpLog.userId, userId),
        eq3(lifeAreaXpLog.lifeAreaId, areaId)
      )
    );
    const totalXP = xpResult[0]?.total || 0;
    let level = 1;
    let xpRequired = 100;
    let xpCurrent = totalXP;
    while (xpCurrent >= xpRequired && level < 10) {
      xpCurrent -= xpRequired;
      level++;
      xpRequired = Math.round(xpRequired * 1.5);
    }
    const currentLevel = await db.select().from(lifeAreaLevels).where(
      and3(
        eq3(lifeAreaLevels.userId, userId),
        eq3(lifeAreaLevels.lifeAreaId, areaId)
      )
    ).limit(1);
    const currentLevelData = currentLevel.length > 0 ? currentLevel[0] : null;
    const wasLevelUp = currentLevelData && (currentLevelData.level || 0) < level;
    if (currentLevelData) {
      await db.update(lifeAreaLevels).set({
        level,
        xpCurrent,
        xpRequired,
        levelUpAt: wasLevelUp ? (/* @__PURE__ */ new Date()).toISOString() : currentLevelData.levelUpAt || null,
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      }).where(
        and3(
          eq3(lifeAreaLevels.userId, userId),
          eq3(lifeAreaLevels.lifeAreaId, areaId)
        )
      );
    } else {
      await db.insert(lifeAreaLevels).values({
        userId,
        lifeAreaId: areaId,
        level,
        xpCurrent,
        xpRequired
      });
    }
    if (wasLevelUp) {
      await db.insert(lifeAreaNotifications).values({
        userId,
        type: "level_up",
        title: "\xA1Subiste de nivel!",
        message: `Has alcanzado el nivel ${level} en esta \xE1rea`,
        actionUrl: `/life-areas/${areaId}`
      });
    }
  }
  async function checkBadges(userId, areaId, requirementType) {
    const badges2 = await db.select().from(lifeAreaBadges).where(eq3(lifeAreaBadges.requirementType, requirementType));
    for (const badge of badges2) {
      const existing = await db.select().from(userLifeAreaBadges).where(
        and3(
          eq3(userLifeAreaBadges.userId, userId),
          eq3(userLifeAreaBadges.badgeId, badge.id)
        )
      ).limit(1);
      if (existing.length > 0) continue;
      let reqData = {};
      try {
        reqData = badge.requirementData ? JSON.parse(badge.requirementData) : {};
      } catch {
      }
      let shouldAward = false;
      if (requirementType === "quiz_complete") {
        if (reqData.areaCount) {
          const completedAreas = await db.select({ areaId: lifeAreaQuizzes.lifeAreaId }).from(lifeAreaQuizResponses).innerJoin(lifeAreaQuizzes, eq3(lifeAreaQuizResponses.quizId, lifeAreaQuizzes.id)).where(eq3(lifeAreaQuizResponses.userId, userId)).groupBy(lifeAreaQuizzes.lifeAreaId);
          shouldAward = completedAreas.length >= reqData.areaCount;
        } else {
          const quiz = await db.select().from(lifeAreaQuizzes).where(eq3(lifeAreaQuizzes.lifeAreaId, areaId)).limit(1);
          if (quiz.length > 0) {
            const responses = await db.select().from(lifeAreaQuizResponses).where(
              and3(
                eq3(lifeAreaQuizResponses.userId, userId),
                eq3(lifeAreaQuizResponses.quizId, quiz[0].id)
              )
            );
            shouldAward = responses.length > 0;
          }
        }
      } else if (requirementType === "score_reach") {
        const threshold = reqData.threshold || 70;
        if (reqData.allAreas) {
          const qualifyingAreas = await db.select({ cnt: sql5`COUNT(*)` }).from(lifeAreaScores).where(
            and3(
              eq3(lifeAreaScores.userId, userId),
              sql5`${lifeAreaScores.subcategoryId} IS NULL`,
              gte2(lifeAreaScores.currentScore, threshold)
            )
          );
          shouldAward = (qualifyingAreas[0]?.cnt || 0) >= 12;
        } else {
          const score = await db.select().from(lifeAreaScores).where(
            and3(
              eq3(lifeAreaScores.userId, userId),
              eq3(lifeAreaScores.lifeAreaId, areaId),
              sql5`${lifeAreaScores.subcategoryId} IS NULL`
            )
          ).limit(1);
          shouldAward = score.length > 0 && score[0].currentScore >= threshold;
        }
      } else if (requirementType === "actions_complete") {
        const required = reqData.count || 1;
        const completedCount = await db.select({ cnt: sql5`COUNT(*)` }).from(userLifeAreaProgress).where(
          and3(
            eq3(userLifeAreaProgress.userId, userId),
            eq3(userLifeAreaProgress.status, "completed")
          )
        );
        shouldAward = (completedCount[0]?.cnt || 0) >= required;
      } else if (requirementType === "streak") {
        const requiredDays = reqData.days || 7;
        const streak = await db.select().from(lifeAreaStreaks).where(
          and3(
            eq3(lifeAreaStreaks.userId, userId),
            eq3(lifeAreaStreaks.streakType, "daily")
          )
        ).limit(1);
        if (streak.length > 0) {
          const best = Math.max(streak[0].currentStreak || 0, streak[0].longestStreak || 0);
          shouldAward = best >= requiredDays;
        }
      } else if (requirementType === "mastery") {
        const requiredPct = reqData.percentage || 25;
        if (reqData.anyArea) {
          const mastery = await db.select().from(lifeAreaMastery).where(
            and3(
              eq3(lifeAreaMastery.userId, userId),
              gte2(lifeAreaMastery.masteryPercentage, requiredPct)
            )
          ).limit(1);
          shouldAward = mastery.length > 0;
        } else {
          const mastery = await db.select().from(lifeAreaMastery).where(
            and3(
              eq3(lifeAreaMastery.userId, userId),
              eq3(lifeAreaMastery.lifeAreaId, areaId),
              gte2(lifeAreaMastery.masteryPercentage, requiredPct)
            )
          ).limit(1);
          shouldAward = mastery.length > 0;
        }
      }
      if (shouldAward) {
        await db.insert(userLifeAreaBadges).values({
          userId,
          badgeId: badge.id
        });
        if (badge.xpReward && badge.xpReward > 0) {
          await awardXP(userId, areaId, badge.xpReward, "badge", badge.id);
        }
        if (badge.seedReward && badge.seedReward > 0) {
          await awardSeeds(userId, badge.seedReward);
        }
        await db.insert(lifeAreaNotifications).values({
          userId,
          type: "badge_earned",
          title: "\xA1Nuevo badge obtenido!",
          message: `Has obtenido el badge: ${badge.name}`,
          actionUrl: "/life-areas/badges"
        });
      }
    }
  }
  async function awardSeeds(userId, amount) {
    const currency = await db.select().from(lifeAreaCurrency).where(eq3(lifeAreaCurrency.userId, userId)).limit(1);
    const currencyData = currency.length > 0 ? currency[0] : null;
    if (currencyData) {
      await db.update(lifeAreaCurrency).set({
        amount: (currencyData.amount || 0) + amount,
        totalEarned: (currencyData.totalEarned || 0) + amount,
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      }).where(eq3(lifeAreaCurrency.userId, userId));
    } else {
      await db.insert(lifeAreaCurrency).values({
        userId,
        amount,
        totalEarned: amount
      });
    }
  }
  app2.get("/api/life-areas/:areaId(\\d+)/actions", authenticateToken, async (req, res) => {
    try {
      const areaId = parseInt(req.params.areaId);
      if (isNaN(areaId) || areaId <= 0) {
        return res.status(400).json({ message: "Invalid area ID" });
      }
      const userId = req.user.userId;
      const score = await db.select().from(lifeAreaScores).where(
        and3(
          eq3(lifeAreaScores.userId, userId),
          eq3(lifeAreaScores.lifeAreaId, areaId),
          sql5`${lifeAreaScores.subcategoryId} IS NULL`
        )
      ).limit(1);
      const actions = await db.select().from(lifeAreaActions).where(eq3(lifeAreaActions.lifeAreaId, areaId)).orderBy(desc3(lifeAreaActions.priority));
      const actionsWithProgress = await Promise.all(
        actions.map(async (action) => {
          const progress = await db.select().from(userLifeAreaProgress).where(
            and3(
              eq3(userLifeAreaProgress.userId, userId),
              eq3(userLifeAreaProgress.actionId, action.id)
            )
          ).limit(1);
          return {
            ...action,
            userProgress: progress[0] || null
          };
        })
      );
      res.json(actionsWithProgress);
    } catch (error) {
      console.error("Error fetching actions:", error);
      res.status(500).json({ message: "Error fetching actions" });
    }
  });
  app2.post("/api/life-areas/actions/:actionId(\\d+)/start", authenticateToken, async (req, res) => {
    try {
      const actionId = parseInt(req.params.actionId);
      if (isNaN(actionId) || actionId <= 0) {
        return res.status(400).json({ message: "Invalid action ID" });
      }
      const userId = req.user.userId;
      const action = await db.select().from(lifeAreaActions).where(eq3(lifeAreaActions.id, actionId)).limit(1);
      if (action.length === 0) {
        return res.status(404).json({ message: "Action not found" });
      }
      const existing = await db.select().from(userLifeAreaProgress).where(
        and3(
          eq3(userLifeAreaProgress.userId, userId),
          eq3(userLifeAreaProgress.actionId, actionId)
        )
      ).limit(1);
      if (existing.length > 0) {
        if (existing[0].status === "not_started") {
          await db.update(userLifeAreaProgress).set({
            status: "in_progress",
            startedAt: (/* @__PURE__ */ new Date()).toISOString(),
            updatedAt: (/* @__PURE__ */ new Date()).toISOString()
          }).where(eq3(userLifeAreaProgress.id, existing[0].id));
        }
        return res.json({ message: "Action already started", progress: existing[0] });
      }
      const [progress] = await db.insert(userLifeAreaProgress).values({
        userId,
        actionId,
        status: "in_progress",
        startedAt: (/* @__PURE__ */ new Date()).toISOString()
      }).returning();
      if (action[0] && action[0].lifeAreaId && action[0].xpReward) {
        await awardXP(userId, action[0].lifeAreaId, Math.round(action[0].xpReward * 0.2), "action", actionId);
      }
      await updateStreak(userId);
      res.json({ message: "Action started", progress });
    } catch (error) {
      console.error("Error starting action:", error);
      res.status(500).json({ message: "Error starting action" });
    }
  });
  app2.put("/api/life-areas/actions/:actionId(\\d+)/progress", authenticateToken, async (req, res) => {
    try {
      const actionId = parseInt(req.params.actionId);
      if (isNaN(actionId) || actionId <= 0) {
        return res.status(400).json({ message: "Invalid action ID" });
      }
      const userId = req.user.userId;
      const { notes, evidence } = req.body;
      if (notes && typeof notes === "string" && notes.length > 5e3) {
        return res.status(400).json({ message: "Notes too long (max 5000 characters)" });
      }
      const progress = await db.select().from(userLifeAreaProgress).where(
        and3(
          eq3(userLifeAreaProgress.userId, userId),
          eq3(userLifeAreaProgress.actionId, actionId)
        )
      ).limit(1);
      if (progress.length === 0) {
        return res.status(404).json({ message: "Progress not found" });
      }
      await db.update(userLifeAreaProgress).set({
        notes: notes || progress[0].notes,
        evidence: evidence ? JSON.stringify(evidence) : progress[0].evidence,
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      }).where(eq3(userLifeAreaProgress.id, progress[0].id));
      res.json({ message: "Progress updated" });
    } catch (error) {
      console.error("Error updating progress:", error);
      res.status(500).json({ message: "Error updating progress" });
    }
  });
  app2.post("/api/life-areas/actions/:actionId(\\d+)/complete", authenticateToken, async (req, res) => {
    try {
      const actionId = parseInt(req.params.actionId);
      if (isNaN(actionId) || actionId <= 0) {
        return res.status(400).json({ message: "Invalid action ID" });
      }
      const userId = req.user.userId;
      const action = await db.select().from(lifeAreaActions).where(eq3(lifeAreaActions.id, actionId)).limit(1);
      if (action.length === 0) {
        return res.status(404).json({ message: "Action not found" });
      }
      const progress = await db.select().from(userLifeAreaProgress).where(
        and3(
          eq3(userLifeAreaProgress.userId, userId),
          eq3(userLifeAreaProgress.actionId, actionId)
        )
      ).limit(1);
      if (progress.length === 0 || !progress[0]) {
        return res.status(404).json({ message: "Progress not found" });
      }
      if (!action[0] || !action[0].lifeAreaId) {
        return res.status(404).json({ message: "Action not found" });
      }
      await db.update(userLifeAreaProgress).set({
        status: "completed",
        completedAt: (/* @__PURE__ */ new Date()).toISOString(),
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      }).where(eq3(userLifeAreaProgress.id, progress[0].id));
      if (action[0].xpReward) {
        await awardXP(userId, action[0].lifeAreaId, action[0].xpReward, "action", actionId);
      }
      if (action[0].seedReward) {
        await awardSeeds(userId, action[0].seedReward);
      }
      await updateStreak(userId);
      await updateMastery(userId, action[0].lifeAreaId);
      await checkBadges(userId, action[0].lifeAreaId, "actions_complete");
      res.json({ message: "Action completed successfully" });
    } catch (error) {
      console.error("Error completing action:", error);
      res.status(500).json({ message: "Error completing action" });
    }
  });
  app2.get("/api/life-areas/progress", authenticateToken, async (req, res) => {
    try {
      const userId = req.user.userId;
      const scores = await db.select().from(lifeAreaScores).where(
        and3(
          eq3(lifeAreaScores.userId, userId),
          sql5`${lifeAreaScores.subcategoryId} IS NULL`
        )
      ).orderBy(lifeAreaScores.lifeAreaId);
      const actionsProgress = await db.select({
        progress: userLifeAreaProgress,
        action: lifeAreaActions
      }).from(userLifeAreaProgress).innerJoin(lifeAreaActions, eq3(userLifeAreaProgress.actionId, lifeAreaActions.id)).where(eq3(userLifeAreaProgress.userId, userId)).orderBy(desc3(userLifeAreaProgress.updatedAt));
      res.json({
        scores,
        actionsProgress: actionsProgress.map((ap) => ({
          ...ap.progress,
          action: ap.action
        }))
      });
    } catch (error) {
      console.error("Error fetching progress:", error);
      res.status(500).json({ message: "Error fetching progress" });
    }
  });
  app2.get("/api/life-areas/:areaId(\\d+)/progress", authenticateToken, async (req, res) => {
    try {
      const areaId = parseInt(req.params.areaId);
      if (isNaN(areaId) || areaId <= 0) {
        return res.status(400).json({ message: "Invalid area ID" });
      }
      const userId = req.user.userId;
      const scores = await db.select().from(lifeAreaScores).where(
        and3(
          eq3(lifeAreaScores.userId, userId),
          eq3(lifeAreaScores.lifeAreaId, areaId)
        )
      );
      const actionsProgress = await db.select({
        progress: userLifeAreaProgress,
        action: lifeAreaActions
      }).from(userLifeAreaProgress).innerJoin(lifeAreaActions, eq3(userLifeAreaProgress.actionId, lifeAreaActions.id)).where(
        and3(
          eq3(userLifeAreaProgress.userId, userId),
          eq3(lifeAreaActions.lifeAreaId, areaId)
        )
      ).orderBy(desc3(userLifeAreaProgress.updatedAt));
      res.json({
        scores,
        actionsProgress: actionsProgress.map((ap) => ({
          ...ap.progress,
          action: ap.action
        }))
      });
    } catch (error) {
      console.error("Error fetching area progress:", error);
      res.status(500).json({ message: "Error fetching area progress" });
    }
  });
  app2.get("/api/life-areas/progress/timeline", authenticateToken, async (req, res) => {
    try {
      const userId = req.user.userId;
      const limit = Math.min(parseInt(req.query.limit) || 50, 200);
      const scoreChanges = await db.select().from(lifeAreaIndicators).where(
        and3(
          eq3(lifeAreaIndicators.userId, userId),
          eq3(lifeAreaIndicators.indicatorType, "score_change")
        )
      ).orderBy(desc3(lifeAreaIndicators.recordedAt)).limit(limit);
      const completedActions = await db.select({
        progress: userLifeAreaProgress,
        action: lifeAreaActions
      }).from(userLifeAreaProgress).innerJoin(lifeAreaActions, eq3(userLifeAreaProgress.actionId, lifeAreaActions.id)).where(
        and3(
          eq3(userLifeAreaProgress.userId, userId),
          eq3(userLifeAreaProgress.status, "completed")
        )
      ).orderBy(desc3(userLifeAreaProgress.completedAt)).limit(limit);
      res.json({
        scoreChanges,
        completedActions: completedActions.map((ca) => ({
          ...ca.progress,
          action: ca.action
        }))
      });
    } catch (error) {
      console.error("Error fetching timeline:", error);
      res.status(500).json({ message: "Error fetching timeline" });
    }
  });
  app2.get("/api/life-areas/milestones", authenticateToken, async (req, res) => {
    try {
      const userId = req.user.userId;
      const milestones = await db.select({
        milestone: lifeAreaMilestones,
        area: lifeAreas
      }).from(lifeAreaMilestones).innerJoin(lifeAreas, eq3(lifeAreaMilestones.lifeAreaId, lifeAreas.id)).where(eq3(lifeAreaMilestones.userId, userId)).orderBy(desc3(lifeAreaMilestones.createdAt));
      res.json(milestones.map((m) => ({
        ...m.milestone,
        area: m.area
      })));
    } catch (error) {
      console.error("Error fetching milestones:", error);
      res.status(500).json({ message: "Error fetching milestones" });
    }
  });
  app2.post("/api/life-areas/milestones", authenticateToken, async (req, res) => {
    try {
      const userId = req.user.userId;
      const { lifeAreaId, title, description, targetScore } = req.body;
      const areaId = parseInt(lifeAreaId);
      const score = parseInt(targetScore);
      if (!lifeAreaId || isNaN(areaId) || areaId <= 0) {
        return res.status(400).json({ message: "Invalid life area ID" });
      }
      if (!title || typeof title !== "string" || title.trim().length === 0) {
        return res.status(400).json({ message: "Title is required" });
      }
      if (title.length > 200) {
        return res.status(400).json({ message: "Title too long (max 200 characters)" });
      }
      if (description && typeof description === "string" && description.length > 1e3) {
        return res.status(400).json({ message: "Description too long (max 1000 characters)" });
      }
      if (!targetScore || isNaN(score) || score < 0 || score > 100) {
        return res.status(400).json({ message: "Target score must be between 0 and 100" });
      }
      const [milestone] = await db.insert(lifeAreaMilestones).values({
        userId,
        lifeAreaId: areaId,
        title: title.trim(),
        description: description ? description.trim() : null,
        targetScore: score
      }).returning();
      res.json(milestone);
    } catch (error) {
      console.error("Error creating milestone:", error);
      res.status(500).json({ message: "Error creating milestone" });
    }
  });
  app2.post("/api/life-areas/milestones/:id(\\d+)/share", authenticateToken, async (req, res) => {
    try {
      const milestoneId = parseInt(req.params.id);
      if (isNaN(milestoneId) || milestoneId <= 0) {
        return res.status(400).json({ message: "Invalid milestone ID" });
      }
      const userId = req.user.userId;
      const milestone = await db.select().from(lifeAreaMilestones).where(
        and3(
          eq3(lifeAreaMilestones.id, milestoneId),
          eq3(lifeAreaMilestones.userId, userId)
        )
      ).limit(1);
      if (milestone.length === 0) {
        return res.status(404).json({ message: "Milestone not found" });
      }
      const shareToken = randomUUID();
      await db.update(lifeAreaMilestones).set({
        shareToken,
        sharedAt: (/* @__PURE__ */ new Date()).toISOString()
      }).where(eq3(lifeAreaMilestones.id, milestoneId));
      res.json({ shareToken, shareUrl: `/life-areas/milestones/${shareToken}` });
    } catch (error) {
      console.error("Error sharing milestone:", error);
      res.status(500).json({ message: "Error sharing milestone" });
    }
  });
  app2.get("/api/life-areas/milestones/:token([A-Za-z0-9-]+)", async (req, res) => {
    try {
      const token = req.params.token;
      const milestone = await db.select({
        milestone: lifeAreaMilestones,
        area: lifeAreas,
        user: users
      }).from(lifeAreaMilestones).innerJoin(lifeAreas, eq3(lifeAreaMilestones.lifeAreaId, lifeAreas.id)).innerJoin(users, eq3(lifeAreaMilestones.userId, users.id)).where(eq3(lifeAreaMilestones.shareToken, token)).limit(1);
      if (milestone.length === 0) {
        return res.status(404).json({ message: "Milestone not found" });
      }
      res.json({
        ...milestone[0].milestone,
        area: milestone[0].area,
        user: {
          name: milestone[0].user.name,
          username: milestone[0].user.username
        }
      });
    } catch (error) {
      console.error("Error fetching shared milestone:", error);
      res.status(500).json({ message: "Error fetching shared milestone" });
    }
  });
  async function updateStreak(userId) {
    const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    const streak = await db.select().from(lifeAreaStreaks).where(
      and3(
        eq3(lifeAreaStreaks.userId, userId),
        eq3(lifeAreaStreaks.streakType, "daily")
      )
    ).limit(1);
    if (streak.length === 0) {
      await db.insert(lifeAreaStreaks).values({
        userId,
        streakType: "daily",
        currentStreak: 1,
        longestStreak: 1,
        lastActivityDate: today,
        bonusMultiplier: 1
      });
    } else if (streak[0]) {
      const currentStreak = streak[0];
      const lastDate = currentStreak.lastActivityDate;
      const yesterday = /* @__PURE__ */ new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split("T")[0];
      let newStreak = currentStreak.currentStreak || 0;
      let multiplier = 1;
      if (lastDate === today) {
        return;
      } else if (lastDate === yesterdayStr) {
        newStreak = (currentStreak.currentStreak || 0) + 1;
      } else {
        newStreak = 1;
      }
      if (newStreak >= 30) multiplier = 3;
      else if (newStreak >= 7) multiplier = 2;
      else if (newStreak >= 3) multiplier = 1.5;
      const longestStreak = Math.max(newStreak, currentStreak.longestStreak || 0);
      await db.update(lifeAreaStreaks).set({
        currentStreak: newStreak,
        longestStreak,
        lastActivityDate: today,
        bonusMultiplier: multiplier,
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      }).where(eq3(lifeAreaStreaks.id, currentStreak.id));
    }
  }
  async function updateMastery(userId, areaId) {
    const completedActions = await db.select({
      count: sql5`COUNT(*)`
    }).from(userLifeAreaProgress).innerJoin(lifeAreaActions, eq3(userLifeAreaProgress.actionId, lifeAreaActions.id)).where(
      and3(
        eq3(userLifeAreaProgress.userId, userId),
        eq3(lifeAreaActions.lifeAreaId, areaId),
        eq3(userLifeAreaProgress.status, "completed")
      )
    );
    const totalActions = await db.select({
      count: sql5`COUNT(*)`
    }).from(lifeAreaActions).where(eq3(lifeAreaActions.lifeAreaId, areaId));
    const completed = completedActions[0]?.count || 0;
    const total = totalActions[0]?.count || 1;
    const percentage = Math.round(completed / total * 100);
    let masteryLevel = "novice";
    if (percentage >= 90) masteryLevel = "master";
    else if (percentage >= 70) masteryLevel = "expert";
    else if (percentage >= 50) masteryLevel = "adept";
    else if (percentage >= 25) masteryLevel = "apprentice";
    const mastery = await db.select().from(lifeAreaMastery).where(
      and3(
        eq3(lifeAreaMastery.userId, userId),
        eq3(lifeAreaMastery.lifeAreaId, areaId)
      )
    ).limit(1);
    if (mastery.length > 0) {
      await db.update(lifeAreaMastery).set({
        masteryPercentage: percentage,
        actionsCompleted: completed,
        totalActions: total,
        masteryLevel,
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      }).where(eq3(lifeAreaMastery.id, mastery[0].id));
    } else {
      await db.insert(lifeAreaMastery).values({
        userId,
        lifeAreaId: areaId,
        masteryPercentage: percentage,
        actionsCompleted: completed,
        totalActions: total,
        masteryLevel
      });
    }
  }
  app2.get("/api/life-areas/xp", authenticateToken, async (req, res) => {
    try {
      const userId = req.user.userId;
      const xpByArea = await db.select({
        lifeAreaId: lifeAreaXpLog.lifeAreaId,
        total: sql5`SUM(${lifeAreaXpLog.xpAmount})`
      }).from(lifeAreaXpLog).where(eq3(lifeAreaXpLog.userId, userId)).groupBy(lifeAreaXpLog.lifeAreaId);
      const totalXP = xpByArea.reduce((sum, area) => sum + (area.total || 0), 0);
      res.json({
        total: totalXP,
        byArea: xpByArea
      });
    } catch (error) {
      console.error("Error fetching XP:", error);
      res.status(500).json({ message: "Error fetching XP" });
    }
  });
  app2.get("/api/life-areas/levels", authenticateToken, async (req, res) => {
    try {
      const userId = req.user.userId;
      const levels = await db.select({
        level: lifeAreaLevels,
        area: lifeAreas
      }).from(lifeAreaLevels).innerJoin(lifeAreas, eq3(lifeAreaLevels.lifeAreaId, lifeAreas.id)).where(eq3(lifeAreaLevels.userId, userId));
      res.json(levels.map((l) => ({
        ...l.level,
        area: l.area
      })));
    } catch (error) {
      console.error("Error fetching levels:", error);
      res.status(500).json({ message: "Error fetching levels" });
    }
  });
  app2.get("/api/life-areas/streaks", authenticateToken, async (req, res) => {
    try {
      const userId = req.user.userId;
      const streaks = await db.select().from(lifeAreaStreaks).where(eq3(lifeAreaStreaks.userId, userId));
      res.json(streaks);
    } catch (error) {
      console.error("Error fetching streaks:", error);
      res.status(500).json({ message: "Error fetching streaks" });
    }
  });
  app2.get("/api/life-areas/badges", async (req, res) => {
    try {
      const badges2 = await db.select().from(lifeAreaBadges).orderBy(lifeAreaBadges.rarity, desc3(lifeAreaBadges.xpReward));
      res.json(badges2);
    } catch (error) {
      console.error("Error fetching badges:", error);
      res.status(500).json({ message: "Error fetching badges" });
    }
  });
  app2.get("/api/life-areas/badges/earned", authenticateToken, async (req, res) => {
    try {
      const userId = req.user.userId;
      const badges2 = await db.select({
        badge: userLifeAreaBadges,
        badgeInfo: lifeAreaBadges
      }).from(userLifeAreaBadges).innerJoin(lifeAreaBadges, eq3(userLifeAreaBadges.badgeId, lifeAreaBadges.id)).where(eq3(userLifeAreaBadges.userId, userId)).orderBy(desc3(userLifeAreaBadges.earnedAt));
      res.json(badges2.map((b) => ({
        ...b.badge,
        badgeInfo: b.badgeInfo
      })));
    } catch (error) {
      console.error("Error fetching earned badges:", error);
      res.status(500).json({ message: "Error fetching earned badges" });
    }
  });
  app2.get("/api/life-areas/currency", authenticateToken, async (req, res) => {
    try {
      const userId = req.user.userId;
      const currency = await db.select().from(lifeAreaCurrency).where(eq3(lifeAreaCurrency.userId, userId)).limit(1);
      res.json(currency[0] || { amount: 0, totalEarned: 0, totalSpent: 0 });
    } catch (error) {
      console.error("Error fetching currency:", error);
      res.status(500).json({ message: "Error fetching currency" });
    }
  });
  app2.get("/api/life-areas/notifications", authenticateToken, async (req, res) => {
    try {
      const userId = req.user.userId;
      const unreadOnly = req.query.unreadOnly === "true";
      const whereConditions = unreadOnly ? and3(
        eq3(lifeAreaNotifications.userId, userId),
        eq3(lifeAreaNotifications.read, false)
      ) : eq3(lifeAreaNotifications.userId, userId);
      const notifications2 = await db.select().from(lifeAreaNotifications).where(whereConditions).orderBy(desc3(lifeAreaNotifications.createdAt));
      res.json(notifications2);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Error fetching notifications" });
    }
  });
  app2.post("/api/life-areas/notifications/:id(\\d+)/read", authenticateToken, async (req, res) => {
    try {
      const notificationId = parseInt(req.params.id);
      if (isNaN(notificationId) || notificationId <= 0) {
        return res.status(400).json({ message: "Invalid notification ID" });
      }
      const userId = req.user.userId;
      await db.update(lifeAreaNotifications).set({ read: true }).where(
        and3(
          eq3(lifeAreaNotifications.id, notificationId),
          eq3(lifeAreaNotifications.userId, userId)
        )
      );
      res.json({ message: "Notification marked as read" });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ message: "Error marking notification as read" });
    }
  });
  app2.get("/api/life-areas/indicators", authenticateToken, async (req, res) => {
    try {
      const userId = req.user.userId;
      const areaIdParam = req.query.areaId;
      const areaId = areaIdParam ? parseInt(areaIdParam) : void 0;
      if (areaId !== void 0 && (isNaN(areaId) || areaId <= 0)) {
        return res.status(400).json({ message: "Invalid area ID" });
      }
      const whereConditions = areaId ? and3(
        eq3(lifeAreaIndicators.userId, userId),
        eq3(lifeAreaIndicators.lifeAreaId, areaId)
      ) : eq3(lifeAreaIndicators.userId, userId);
      const limit = Math.min(parseInt(req.query.limit) || 100, 500);
      const indicators = await db.select().from(lifeAreaIndicators).where(whereConditions).orderBy(desc3(lifeAreaIndicators.recordedAt)).limit(limit);
      res.json(indicators);
    } catch (error) {
      console.error("Error fetching indicators:", error);
      res.status(500).json({ message: "Error fetching indicators" });
    }
  });
  app2.get("/api/life-areas/:areaId(\\d+)/community-stats", authenticateToken, async (req, res) => {
    try {
      const areaId = parseInt(req.params.areaId);
      if (isNaN(areaId) || areaId <= 0) {
        return res.status(400).json({ message: "Invalid area ID" });
      }
      const period = req.query.period || "monthly";
      if (!["daily", "weekly", "monthly"].includes(period)) {
        return res.status(400).json({ message: "Invalid period. Must be 'daily', 'weekly', or 'monthly'" });
      }
      const stats = await db.select().from(lifeAreaCommunityStats).where(
        and3(
          eq3(lifeAreaCommunityStats.lifeAreaId, areaId),
          eq3(lifeAreaCommunityStats.period, period)
        )
      ).orderBy(desc3(lifeAreaCommunityStats.calculatedAt)).limit(1);
      res.json(stats[0] || null);
    } catch (error) {
      console.error("Error fetching community stats:", error);
      res.status(500).json({ message: "Error fetching community stats" });
    }
  });
  app2.get("/api/life-areas/:areaId(\\d+)/percentile", authenticateToken, async (req, res) => {
    try {
      const areaId = parseInt(req.params.areaId);
      if (isNaN(areaId) || areaId <= 0) {
        return res.status(400).json({ message: "Invalid area ID" });
      }
      const userId = req.user.userId;
      const userScore = await db.select().from(lifeAreaScores).where(
        and3(
          eq3(lifeAreaScores.userId, userId),
          eq3(lifeAreaScores.lifeAreaId, areaId),
          sql5`${lifeAreaScores.subcategoryId} IS NULL`
        )
      ).limit(1);
      if (userScore.length === 0) {
        return res.json({ percentile: null, message: "No score found" });
      }
      const allScores = await db.select().from(lifeAreaScores).where(
        and3(
          eq3(lifeAreaScores.lifeAreaId, areaId),
          sql5`${lifeAreaScores.subcategoryId} IS NULL`
        )
      );
      const scores = allScores.map((s) => s.currentScore).filter((s) => s !== null && s !== void 0).sort((a, b) => a - b);
      const userCurrentScore = userScore[0].currentScore;
      if (scores.length === 0) {
        return res.json({ percentile: null, message: "No scores available for comparison" });
      }
      if (scores.length === 1) {
        return res.json({
          percentile: 50,
          // Si solo hay un usuario, está en el percentil 50
          userScore: userCurrentScore,
          totalUsers: 1
        });
      }
      const belowCount = scores.filter((s) => s < userCurrentScore).length;
      const percentile = Math.round(belowCount / scores.length * 100);
      res.json({
        percentile,
        userScore: userCurrentScore,
        totalUsers: scores.length
      });
    } catch (error) {
      console.error("Error calculating percentile:", error);
      res.status(500).json({ message: "Error calculating percentile" });
    }
  });
  app2.get("/api/life-areas/trends", authenticateToken, async (req, res) => {
    try {
      const userId = req.user.userId;
      const areaIdParam = req.query.areaId;
      const areaId = areaIdParam ? parseInt(areaIdParam) : void 0;
      if (areaId !== void 0 && (isNaN(areaId) || areaId <= 0)) {
        return res.status(400).json({ message: "Invalid area ID" });
      }
      const thirtyDaysAgo = /* @__PURE__ */ new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const whereConditions = areaId ? and3(
        eq3(lifeAreaScores.userId, userId),
        sql5`${lifeAreaScores.subcategoryId} IS NULL`,
        gte2(lifeAreaScores.lastUpdated, thirtyDaysAgo.toISOString()),
        eq3(lifeAreaScores.lifeAreaId, areaId)
      ) : and3(
        eq3(lifeAreaScores.userId, userId),
        sql5`${lifeAreaScores.subcategoryId} IS NULL`,
        gte2(lifeAreaScores.lastUpdated, thirtyDaysAgo.toISOString())
      );
      const scores = await db.select().from(lifeAreaScores).where(whereConditions).orderBy(lifeAreaScores.lastUpdated);
      if (scores.length >= 2) {
        const firstScore = scores[0].currentScore;
        const lastScore = scores[scores.length - 1].currentScore;
        const trend = lastScore > firstScore ? "improving" : lastScore < firstScore ? "declining" : "stable";
        const change = lastScore - firstScore;
        res.json({
          trend,
          change,
          scores,
          prediction: change > 0 ? "continuing_improvement" : change < 0 ? "needs_attention" : "stable"
        });
      } else {
        res.json({
          trend: "insufficient_data",
          scores
        });
      }
    } catch (error) {
      console.error("Error fetching trends:", error);
      res.status(500).json({ message: "Error fetching trends" });
    }
  });
  app2.get("/api/life-areas/:areaId(\\d+)/quiz/history", authenticateToken, async (req, res) => {
    try {
      const areaId = parseInt(req.params.areaId);
      if (isNaN(areaId) || areaId <= 0) {
        return res.status(400).json({ message: "Invalid area ID" });
      }
      const userId = req.user.userId;
      const quiz = await db.select().from(lifeAreaQuizzes).where(eq3(lifeAreaQuizzes.lifeAreaId, areaId)).limit(1);
      if (quiz.length === 0) {
        return res.json({ sessions: [] });
      }
      const responses = await db.select({
        id: lifeAreaQuizResponses.id,
        questionId: lifeAreaQuizResponses.questionId,
        currentValue: lifeAreaQuizResponses.currentValue,
        desiredValue: lifeAreaQuizResponses.desiredValue,
        answeredAt: lifeAreaQuizResponses.answeredAt
      }).from(lifeAreaQuizResponses).where(
        and3(
          eq3(lifeAreaQuizResponses.userId, userId),
          eq3(lifeAreaQuizResponses.quizId, quiz[0].id)
        )
      ).orderBy(desc3(lifeAreaQuizResponses.answeredAt));
      const sessionMap = /* @__PURE__ */ new Map();
      for (const r of responses) {
        const dateKey = r.answeredAt ? r.answeredAt.split("T")[0] : "unknown";
        if (!sessionMap.has(dateKey)) sessionMap.set(dateKey, []);
        sessionMap.get(dateKey).push(r);
      }
      const questions = await db.select({
        id: lifeAreaQuizQuestions.id,
        subcategoryId: lifeAreaQuizQuestions.subcategoryId,
        category: lifeAreaQuizQuestions.category
      }).from(lifeAreaQuizQuestions).where(eq3(lifeAreaQuizQuestions.quizId, quiz[0].id));
      const questionMap = new Map(questions.map((q) => [q.id, q]));
      const sessions = Array.from(sessionMap.entries()).map(([date, resps]) => {
        const subcatScores = {};
        for (const r of resps) {
          const q = questionMap.get(r.questionId);
          if (!q || !q.subcategoryId) continue;
          if (!subcatScores[q.subcategoryId]) subcatScores[q.subcategoryId] = {};
          if (q.category === "current") subcatScores[q.subcategoryId].current = r.currentValue ?? void 0;
          else if (q.category === "desired") subcatScores[q.subcategoryId].desired = r.desiredValue ?? void 0;
        }
        const scores = Object.values(subcatScores);
        const avgCurrent = scores.length > 0 ? Math.round(scores.reduce((s, v) => s + (v.current || 0), 0) / scores.length) : 0;
        return { date, subcatScores, avgCurrent, responseCount: resps.length };
      });
      res.json({ sessions });
    } catch (error) {
      console.error("Error fetching quiz history:", error);
      res.status(500).json({ message: "Error fetching quiz history" });
    }
  });
  app2.get("/api/life-areas/challenges", authenticateToken, async (req, res) => {
    try {
      const userId = req.user.userId;
      const challenges2 = await db.select().from(lifeAreaChallenges).where(eq3(lifeAreaChallenges.isActive, true)).orderBy(desc3(lifeAreaChallenges.createdAt));
      const userChallenges = await db.select().from(userLifeAreaChallenges).where(eq3(userLifeAreaChallenges.userId, userId));
      const userChallengeMap = new Map(
        userChallenges.map((uc) => [uc.challengeId, uc])
      );
      const result = challenges2.map((c) => ({
        ...c,
        requirements: c.requirements ? JSON.parse(c.requirements) : null,
        rewards: c.rewards ? JSON.parse(c.rewards) : null,
        userStatus: userChallengeMap.get(c.id) || null
      }));
      res.json(result);
    } catch (error) {
      console.error("Error fetching challenges:", error);
      res.status(500).json({ message: "Error fetching challenges" });
    }
  });
  app2.get("/api/life-areas/challenges/:id(\\d+)", authenticateToken, async (req, res) => {
    try {
      const challengeId = parseInt(req.params.id);
      if (isNaN(challengeId) || challengeId <= 0) {
        return res.status(400).json({ message: "Invalid challenge ID" });
      }
      const userId = req.user.userId;
      const challenge = await db.select().from(lifeAreaChallenges).where(eq3(lifeAreaChallenges.id, challengeId)).limit(1);
      if (challenge.length === 0) {
        return res.status(404).json({ message: "Challenge not found" });
      }
      const userChallenge = await db.select().from(userLifeAreaChallenges).where(
        and3(
          eq3(userLifeAreaChallenges.userId, userId),
          eq3(userLifeAreaChallenges.challengeId, challengeId)
        )
      ).limit(1);
      const participants = await db.select({ cnt: sql5`COUNT(*)` }).from(userLifeAreaChallenges).where(eq3(userLifeAreaChallenges.challengeId, challengeId));
      res.json({
        ...challenge[0],
        requirements: challenge[0].requirements ? JSON.parse(challenge[0].requirements) : null,
        rewards: challenge[0].rewards ? JSON.parse(challenge[0].rewards) : null,
        userStatus: userChallenge[0] || null,
        participantCount: participants[0]?.cnt || 0
      });
    } catch (error) {
      console.error("Error fetching challenge:", error);
      res.status(500).json({ message: "Error fetching challenge" });
    }
  });
  app2.post("/api/life-areas/challenges/:id(\\d+)/join", authenticateToken, async (req, res) => {
    try {
      const challengeId = parseInt(req.params.id);
      if (isNaN(challengeId) || challengeId <= 0) {
        return res.status(400).json({ message: "Invalid challenge ID" });
      }
      const userId = req.user.userId;
      const challenge = await db.select().from(lifeAreaChallenges).where(and3(eq3(lifeAreaChallenges.id, challengeId), eq3(lifeAreaChallenges.isActive, true))).limit(1);
      if (challenge.length === 0) {
        return res.status(404).json({ message: "Challenge not found or inactive" });
      }
      const existing = await db.select().from(userLifeAreaChallenges).where(
        and3(
          eq3(userLifeAreaChallenges.userId, userId),
          eq3(userLifeAreaChallenges.challengeId, challengeId)
        )
      ).limit(1);
      if (existing.length > 0) {
        return res.status(400).json({ message: "Already joined this challenge" });
      }
      await db.insert(userLifeAreaChallenges).values({
        userId,
        challengeId,
        status: "joined",
        progress: JSON.stringify({ current: 0, target: 1 })
      });
      await db.update(lifeAreaChallenges).set({ participantCount: sql5`${lifeAreaChallenges.participantCount} + 1` }).where(eq3(lifeAreaChallenges.id, challengeId));
      res.json({ message: "Joined challenge successfully" });
    } catch (error) {
      console.error("Error joining challenge:", error);
      res.status(500).json({ message: "Error joining challenge" });
    }
  });
  app2.put("/api/life-areas/challenges/:id(\\d+)/progress", authenticateToken, async (req, res) => {
    try {
      const challengeId = parseInt(req.params.id);
      if (isNaN(challengeId) || challengeId <= 0) {
        return res.status(400).json({ message: "Invalid challenge ID" });
      }
      const userId = req.user.userId;
      const { progress } = req.body;
      const userChallenge = await db.select().from(userLifeAreaChallenges).where(
        and3(
          eq3(userLifeAreaChallenges.userId, userId),
          eq3(userLifeAreaChallenges.challengeId, challengeId)
        )
      ).limit(1);
      if (userChallenge.length === 0) {
        return res.status(404).json({ message: "Not joined this challenge" });
      }
      await db.update(userLifeAreaChallenges).set({
        progress: JSON.stringify(progress),
        status: "in_progress",
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      }).where(eq3(userLifeAreaChallenges.id, userChallenge[0].id));
      res.json({ message: "Progress updated" });
    } catch (error) {
      console.error("Error updating challenge progress:", error);
      res.status(500).json({ message: "Error updating challenge progress" });
    }
  });
  app2.post("/api/life-areas/challenges/:id(\\d+)/complete", authenticateToken, async (req, res) => {
    try {
      const challengeId = parseInt(req.params.id);
      if (isNaN(challengeId) || challengeId <= 0) {
        return res.status(400).json({ message: "Invalid challenge ID" });
      }
      const userId = req.user.userId;
      const userChallenge = await db.select().from(userLifeAreaChallenges).where(
        and3(
          eq3(userLifeAreaChallenges.userId, userId),
          eq3(userLifeAreaChallenges.challengeId, challengeId)
        )
      ).limit(1);
      if (userChallenge.length === 0) {
        return res.status(404).json({ message: "Not joined this challenge" });
      }
      if (userChallenge[0].status === "completed") {
        return res.status(400).json({ message: "Challenge already completed" });
      }
      const challenge = await db.select().from(lifeAreaChallenges).where(eq3(lifeAreaChallenges.id, challengeId)).limit(1);
      if (challenge.length === 0) {
        return res.status(404).json({ message: "Challenge not found" });
      }
      const rewards = challenge[0].rewards ? JSON.parse(challenge[0].rewards) : {};
      await db.update(userLifeAreaChallenges).set({
        status: "completed",
        completedAt: (/* @__PURE__ */ new Date()).toISOString(),
        rewardsClaimed: true,
        updatedAt: (/* @__PURE__ */ new Date()).toISOString()
      }).where(eq3(userLifeAreaChallenges.id, userChallenge[0].id));
      if (rewards.xp) {
        await awardXP(userId, rewards.areaId || 1, rewards.xp, "challenge", challengeId);
      }
      if (rewards.seeds) {
        await awardSeeds(userId, rewards.seeds);
      }
      await db.insert(lifeAreaNotifications).values({
        userId,
        type: "challenge",
        title: "\xA1Desafio completado!",
        message: `Completaste el desafio: ${challenge[0].title}`,
        actionUrl: `/life-areas/challenges`
      });
      res.json({ message: "Challenge completed", rewards });
    } catch (error) {
      console.error("Error completing challenge:", error);
      res.status(500).json({ message: "Error completing challenge" });
    }
  });
  app2.get("/api/life-areas/chests", authenticateToken, async (req, res) => {
    try {
      const userId = req.user.userId;
      const chests = await db.select().from(lifeAreaRewardChests).where(
        and3(
          eq3(lifeAreaRewardChests.userId, userId),
          sql5`${lifeAreaRewardChests.openedAt} IS NULL`
        )
      ).orderBy(desc3(lifeAreaRewardChests.createdAt));
      const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
      const todayChest = await db.select().from(lifeAreaRewardChests).where(
        and3(
          eq3(lifeAreaRewardChests.userId, userId),
          eq3(lifeAreaRewardChests.chestType, "daily"),
          sql5`${lifeAreaRewardChests.createdAt}::date = ${today}::date`
        )
      ).limit(1);
      if (todayChest.length === 0) {
        const dailyChest = await db.insert(lifeAreaRewardChests).values({
          userId,
          chestType: "daily",
          rarity: "common",
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1e3).toISOString()
        }).returning();
        chests.unshift(dailyChest[0]);
      }
      const openedChests = await db.select().from(lifeAreaRewardChests).where(
        and3(
          eq3(lifeAreaRewardChests.userId, userId),
          sql5`${lifeAreaRewardChests.openedAt} IS NOT NULL`
        )
      ).orderBy(desc3(lifeAreaRewardChests.openedAt)).limit(10);
      res.json({
        available: chests.map((c) => ({
          ...c,
          rewards: c.rewards ? JSON.parse(c.rewards) : null
        })),
        recent: openedChests.map((c) => ({
          ...c,
          rewards: c.rewards ? JSON.parse(c.rewards) : null
        }))
      });
    } catch (error) {
      console.error("Error fetching chests:", error);
      res.status(500).json({ message: "Error fetching chests" });
    }
  });
  app2.post("/api/life-areas/chests/:id(\\d+)/open", authenticateToken, async (req, res) => {
    try {
      const chestId = parseInt(req.params.id);
      if (isNaN(chestId) || chestId <= 0) {
        return res.status(400).json({ message: "Invalid chest ID" });
      }
      const userId = req.user.userId;
      const chest = await db.select().from(lifeAreaRewardChests).where(
        and3(
          eq3(lifeAreaRewardChests.id, chestId),
          eq3(lifeAreaRewardChests.userId, userId),
          sql5`${lifeAreaRewardChests.openedAt} IS NULL`
        )
      ).limit(1);
      if (chest.length === 0) {
        return res.status(404).json({ message: "Chest not found or already opened" });
      }
      const rarityMultiplier = {
        common: 1,
        rare: 2,
        epic: 3,
        legendary: 5
      };
      const mult = rarityMultiplier[chest[0].rarity || "common"] || 1;
      const xp = Math.round((10 + Math.random() * 40) * mult);
      const seeds = Math.round((5 + Math.random() * 20) * mult);
      const rewards = { xp, seeds };
      await db.update(lifeAreaRewardChests).set({
        openedAt: (/* @__PURE__ */ new Date()).toISOString(),
        rewards: JSON.stringify(rewards)
      }).where(eq3(lifeAreaRewardChests.id, chestId));
      await awardXP(userId, 1, xp, "chest", chestId);
      await awardSeeds(userId, seeds);
      res.json({ rewards, rarity: chest[0].rarity });
    } catch (error) {
      console.error("Error opening chest:", error);
      res.status(500).json({ message: "Error opening chest" });
    }
  });
  app2.get("/api/life-areas/social/feed", authenticateToken, async (req, res) => {
    try {
      const recentMilestones = await db.select({
        id: lifeAreaMilestones.id,
        userId: lifeAreaMilestones.userId,
        title: lifeAreaMilestones.title,
        description: lifeAreaMilestones.description,
        createdAt: lifeAreaMilestones.createdAt,
        lifeAreaId: lifeAreaMilestones.lifeAreaId,
        username: users.username,
        name: users.name
      }).from(lifeAreaMilestones).innerJoin(users, eq3(lifeAreaMilestones.userId, users.id)).where(sql5`${lifeAreaMilestones.sharedAt} IS NOT NULL`).orderBy(desc3(lifeAreaMilestones.createdAt)).limit(20);
      const feedItems = await Promise.all(
        recentMilestones.map(async (m) => {
          const likes = await db.select({ cnt: sql5`COUNT(*)` }).from(lifeAreaSocialInteractions).where(
            and3(
              eq3(lifeAreaSocialInteractions.targetType, "milestone"),
              eq3(lifeAreaSocialInteractions.targetId, m.id),
              eq3(lifeAreaSocialInteractions.interactionType, "like")
            )
          );
          const comments = await db.select({
            id: lifeAreaSocialInteractions.id,
            content: lifeAreaSocialInteractions.content,
            createdAt: lifeAreaSocialInteractions.createdAt,
            username: users.username,
            name: users.name
          }).from(lifeAreaSocialInteractions).innerJoin(users, eq3(lifeAreaSocialInteractions.userId, users.id)).where(
            and3(
              eq3(lifeAreaSocialInteractions.targetType, "milestone"),
              eq3(lifeAreaSocialInteractions.targetId, m.id),
              eq3(lifeAreaSocialInteractions.interactionType, "comment")
            )
          ).orderBy(lifeAreaSocialInteractions.createdAt).limit(5);
          return {
            ...m,
            likeCount: likes[0]?.cnt || 0,
            comments
          };
        })
      );
      res.json(feedItems);
    } catch (error) {
      console.error("Error fetching social feed:", error);
      res.status(500).json({ message: "Error fetching social feed" });
    }
  });
  app2.post("/api/life-areas/social/like", authenticateToken, async (req, res) => {
    try {
      const userId = req.user.userId;
      const { targetType, targetId } = req.body;
      if (!targetType || !targetId) {
        return res.status(400).json({ message: "targetType and targetId required" });
      }
      const existing = await db.select().from(lifeAreaSocialInteractions).where(
        and3(
          eq3(lifeAreaSocialInteractions.userId, userId),
          eq3(lifeAreaSocialInteractions.targetType, targetType),
          eq3(lifeAreaSocialInteractions.targetId, targetId),
          eq3(lifeAreaSocialInteractions.interactionType, "like")
        )
      ).limit(1);
      if (existing.length > 0) {
        await db.delete(lifeAreaSocialInteractions).where(eq3(lifeAreaSocialInteractions.id, existing[0].id));
        return res.json({ liked: false });
      }
      let targetUserId = null;
      if (targetType === "milestone") {
        const milestone = await db.select({ userId: lifeAreaMilestones.userId }).from(lifeAreaMilestones).where(eq3(lifeAreaMilestones.id, targetId)).limit(1);
        targetUserId = milestone[0]?.userId ?? null;
      }
      await db.insert(lifeAreaSocialInteractions).values({
        userId,
        targetUserId,
        interactionType: "like",
        targetType,
        targetId
      });
      if (targetUserId && targetUserId !== userId) {
        await db.insert(lifeAreaNotifications).values({
          userId: targetUserId,
          type: "social",
          title: "\xA1Nuevo like!",
          message: "A alguien le gusto tu logro",
          actionUrl: "/life-areas"
        });
      }
      res.json({ liked: true });
    } catch (error) {
      console.error("Error toggling like:", error);
      res.status(500).json({ message: "Error toggling like" });
    }
  });
  app2.post("/api/life-areas/social/comment", authenticateToken, async (req, res) => {
    try {
      const userId = req.user.userId;
      const { targetType, targetId, content } = req.body;
      if (!targetType || !targetId || !content || typeof content !== "string" || content.trim().length === 0) {
        return res.status(400).json({ message: "targetType, targetId, and content required" });
      }
      const sanitizedContent = content.trim().slice(0, 500);
      let targetUserId = null;
      if (targetType === "milestone") {
        const milestone = await db.select({ userId: lifeAreaMilestones.userId }).from(lifeAreaMilestones).where(eq3(lifeAreaMilestones.id, targetId)).limit(1);
        targetUserId = milestone[0]?.userId ?? null;
      }
      const comment = await db.insert(lifeAreaSocialInteractions).values({
        userId,
        targetUserId,
        interactionType: "comment",
        targetType,
        targetId,
        content: sanitizedContent
      }).returning();
      if (targetUserId && targetUserId !== userId) {
        await db.insert(lifeAreaNotifications).values({
          userId: targetUserId,
          type: "social",
          title: "\xA1Nuevo comentario!",
          message: sanitizedContent.slice(0, 100),
          actionUrl: "/life-areas"
        });
      }
      res.json(comment[0]);
    } catch (error) {
      console.error("Error posting comment:", error);
      res.status(500).json({ message: "Error posting comment" });
    }
  });
}

// server/routes-civic-assessment.ts
init_db();
init_schema();
init_auth();
import { eq as eq5, desc as desc5, and as and4 } from "drizzle-orm";

// shared/civic-assessment-questions.ts
var CIVIC_DIMENSIONS = [
  {
    key: "motivacion_civica",
    name: "Motivacion Civica",
    description: "Que te impulsa a participar en la vida publica y comunitaria de tu entorno.",
    color: "#E85D26"
  },
  {
    key: "estilo_liderazgo",
    name: "Estilo de Liderazgo",
    description: "Como te relacionas con otros a la hora de organizar, decidir y actuar colectivamente.",
    color: "#3B82F6"
  },
  {
    key: "valores_prioridades",
    name: "Valores y Prioridades",
    description: "Cuales son los principios que guian tus decisiones cuando pensas en el bien comun.",
    color: "#8B5CF6"
  },
  {
    key: "fortalezas_civicas",
    name: "Fortalezas Civicas",
    description: "Las capacidades concretas que ya tenes para aportar a tu comunidad.",
    color: "#10B981"
  },
  {
    key: "areas_crecimiento",
    name: "Areas de Crecimiento",
    description: "Los aspectos civicos en los que sentis que podrias desarrollarte mas.",
    color: "#F59E0B"
  },
  {
    key: "barreras_compromiso",
    name: "Barreras al Compromiso",
    description: "Los obstaculos que te frenan o dificultan tu participacion civica.",
    color: "#EF4444"
  }
];
var CIVIC_ARCHETYPES = [
  {
    key: "el_puente",
    name: "El Puente",
    subtitle: "Conector comunitario",
    description: "Tenes la capacidad de vincular personas, ideas y recursos que de otra forma no se cruzarian. En un pais donde la fragmentacion social es moneda corriente, tu rol es vital: construis lazos donde otros ven grietas. Tu fortaleza esta en la escucha y en la voluntad de tender la mano sin pedir nada a cambio.",
    emoji: "\u{1F309}",
    primaryDimensions: ["estilo_liderazgo", "valores_prioridades"],
    color: "#3B82F6"
  },
  {
    key: "el_vigia",
    name: "El Vigia",
    subtitle: "Guardian civico",
    description: "Sos de los que no miran para otro lado. Cuando algo no funciona en tu barrio, en tu municipio o en el pais, lo se\xF1alas con firmeza pero con argumentos. Tu motivacion nace de una conviccion profunda: las instituciones tienen que rendir cuentas. En un contexto donde la desconfianza institucional es alta, vos elegis exigir en vez de resignarte.",
    emoji: "\u{1F52D}",
    primaryDimensions: ["motivacion_civica", "valores_prioridades"],
    color: "#8B5CF6"
  },
  {
    key: "la_raiz",
    name: "La Raiz",
    subtitle: "Constructor/a comunitario/a",
    description: "Tu fuerza esta en lo cercano: el comedor, la plaza, la cooperativa, la escuela del barrio. No necesitas grandes discursos ni plataformas; tu impacto se siente en lo cotidiano. En la Argentina de las crisis ciclicas, personas como vos son las que sostienen el tejido social cuando todo lo demas cruje.",
    emoji: "\u{1F331}",
    primaryDimensions: ["fortalezas_civicas", "motivacion_civica"],
    color: "#10B981"
  },
  {
    key: "el_catalizador",
    name: "El Catalizador",
    subtitle: "Motor de cambio",
    description: "No te conformas con diagnosticar: necesitas actuar. Tenes energia, iniciativa y una capacidad natural de contagiar entusiasmo. Cuando ves una injusticia o una necesidad, ya estas pensando en el primer paso. Tu desafio es sostener el impulso sin quemarte, pero tu potencia transformadora es enorme.",
    emoji: "\u26A1",
    primaryDimensions: ["estilo_liderazgo", "motivacion_civica"],
    color: "#E85D26"
  },
  {
    key: "el_sembrador",
    name: "El Sembrador",
    subtitle: "Actor civico emergente",
    description: "Estas en un momento de apertura. Tal vez todavia no encontraste tu espacio o tu causa, pero sentis la inquietud de hacer algo que trascienda lo individual. Tu ventaja es que llegas sin las cicatrices del desencanto; tu mirada fresca puede renovar espacios que se volvieron rutinarios.",
    emoji: "\u{1F33E}",
    primaryDimensions: ["areas_crecimiento", "barreras_compromiso"],
    color: "#F59E0B"
  },
  {
    key: "el_espejo",
    name: "El Espejo",
    subtitle: "Ciudadano/a reflexivo/a",
    description: "Tu fortaleza es la autoconciencia. Antes de actuar, reflexionas; antes de opinar, escuchas. En una cultura publica donde muchos gritan y pocos piensan, tu equilibrio es un recurso escaso. Podes ser la persona que ayuda a un grupo a detenerse, mirar lo que esta pasando y elegir mejor.",
    emoji: "\u{1FA9E}",
    primaryDimensions: ["valores_prioridades", "areas_crecimiento"],
    color: "#6366F1"
  }
];
var ASSESSMENT_QUESTIONS = [
  // ==========================================================================
  // DIMENSION 1 — motivacion_civica
  // ==========================================================================
  {
    key: "mc_01",
    dimensionKey: "motivacion_civica",
    text: "Cuando lees una noticia sobre una decision politica que afecta a tu barrio, \xBFcuanto te moviliza a hacer algo concreto?",
    type: "scale",
    minLabel: "No me mueve en absoluto",
    maxLabel: "Siento que tengo que actuar ya",
    weight: 3
  },
  {
    key: "mc_02",
    dimensionKey: "motivacion_civica",
    text: "\xBFQue situacion te empujaria mas fuerte a participar civicamente?",
    type: "choice",
    options: [
      { value: "crisis_economica", label: "Una crisis economica que golpea a tu entorno cercano" },
      { value: "corrupcion", label: "Un caso de corrupcion que queda impune" },
      { value: "emergencia_social", label: "Ver familias sin acceso a comida o techo en tu zona" },
      { value: "atropello_derechos", label: "Que recorten un derecho que creias garantizado" },
      { value: "inspiracion", label: "Conocer a alguien que esta cambiando las cosas desde abajo" }
    ],
    weight: 2
  },
  {
    key: "mc_03",
    dimensionKey: "motivacion_civica",
    text: "\xBFCon que frecuencia sentis que tu voto o tu participacion realmente puede cambiar algo?",
    type: "scale",
    minLabel: "Nunca, no cambia nada",
    maxLabel: "Siempre, cada accion cuenta",
    weight: 3
  },
  {
    key: "mc_04",
    dimensionKey: "motivacion_civica",
    text: "Ordena estas motivaciones de la mas fuerte a la mas debil en tu caso personal:",
    type: "rank",
    items: [
      "Proteger a mi familia y mi entorno cercano",
      "Construir un pais mas justo para las proximas generaciones",
      "Defender derechos que siento amenazados",
      "Demostrar que se puede hacer politica de otra manera"
    ],
    weight: 2
  },
  {
    key: "mc_05",
    dimensionKey: "motivacion_civica",
    text: "\xBFQue tan seguido hablas de temas civicos o politicos con personas fuera de tu circulo cercano (vecinos, compa\xF1eros de trabajo, desconocidos)?",
    type: "scale",
    minLabel: "Casi nunca, evito el tema",
    maxLabel: "Constantemente, me sale natural",
    weight: 1
  },
  {
    key: "mc_06",
    dimensionKey: "motivacion_civica",
    text: "Si ma\xF1ana se abriera una audiencia publica en tu municipio sobre el presupuesto local, \xBFque harias?",
    type: "choice",
    options: [
      { value: "ignoro", label: "Probablemente ni me entere" },
      { value: "miro", label: "Me informo pero no voy" },
      { value: "asisto", label: "Voy a escuchar aunque no hable" },
      { value: "participo", label: "Voy preparado/a para plantear algo" },
      { value: "organizo", label: "Convoco a otros para ir juntos" }
    ],
    weight: 2
  },
  // ==========================================================================
  // DIMENSION 2 — estilo_liderazgo
  // ==========================================================================
  {
    key: "el_01",
    dimensionKey: "estilo_liderazgo",
    text: "En un grupo que necesita tomar una decision dificil, \xBFque rol soles tomar?",
    type: "choice",
    options: [
      { value: "facilitador", label: "Facilito la conversacion para que todos opinen" },
      { value: "estratega", label: "Propongo un plan y trato de convencer" },
      { value: "ejecutor", label: "Me ofrezco a hacer lo que haga falta" },
      { value: "mediador", label: "Busco el punto intermedio entre posturas enfrentadas" },
      { value: "observador", label: "Escucho y opino solo si tengo algo que realmente sume" }
    ],
    weight: 3
  },
  {
    key: "el_02",
    dimensionKey: "estilo_liderazgo",
    text: "\xBFCuanto te cuesta delegar tareas importantes en otros cuando trabajas en un proyecto colectivo?",
    type: "scale",
    minLabel: "Nada, confio y delego facil",
    maxLabel: "Mucho, prefiero hacerlo yo",
    weight: 2
  },
  {
    key: "el_03",
    dimensionKey: "estilo_liderazgo",
    text: "Ordena estos estilos segun cuanto te representan, del mas cercano al mas lejano:",
    type: "rank",
    items: [
      "Liderar con el ejemplo silencioso",
      "Inspirar con la palabra y la vision",
      "Organizar la logistica y los recursos",
      "Acompa\xF1ar y sostener emocionalmente al grupo"
    ],
    weight: 2
  },
  {
    key: "el_04",
    dimensionKey: "estilo_liderazgo",
    text: "\xBFQue tan comodo/a te sentis hablando en publico para defender una causa que te importa?",
    type: "scale",
    minLabel: "Me paralizo, no puedo",
    maxLabel: "Me siento en mi elemento",
    weight: 1
  },
  {
    key: "el_05",
    dimensionKey: "estilo_liderazgo",
    text: "Cuando en un grupo surge un conflicto fuerte entre dos personas, \xBFcomo reaccionas?",
    type: "choice",
    options: [
      { value: "intervengo", label: "Intervengo para calmar las aguas y buscar un acuerdo" },
      { value: "apoyo", label: "Me pongo del lado que creo que tiene razon" },
      { value: "espero", label: "Espero a que se enfrien y despues opino" },
      { value: "estructura", label: "Propongo un mecanismo (votacion, turnos de palabra) para resolverlo" },
      { value: "retiro", label: "Me incomoda mucho y tiendo a retirarme" }
    ],
    weight: 2
  },
  {
    key: "el_06",
    dimensionKey: "estilo_liderazgo",
    text: "\xBFQue tan capaz te sentis de sostener un proyecto comunitario a lo largo de meses, mas alla del entusiasmo inicial?",
    type: "scale",
    minLabel: "Me cuesta mucho mantener la constancia",
    maxLabel: "Soy de los que sostienen hasta el final",
    weight: 3
  },
  // ==========================================================================
  // DIMENSION 3 — valores_prioridades
  // ==========================================================================
  {
    key: "vp_01",
    dimensionKey: "valores_prioridades",
    text: "Si tuvieras que elegir una sola prioridad para tu comunidad en los proximos 5 a\xF1os, \xBFcual seria?",
    type: "choice",
    options: [
      { value: "educacion", label: "Mejorar la educacion publica local" },
      { value: "seguridad", label: "Reducir la inseguridad y la violencia" },
      { value: "economia", label: "Generar trabajo genuino y estabilidad economica" },
      { value: "salud", label: "Garantizar acceso a salud de calidad" },
      { value: "ambiente", label: "Cuidar el medioambiente y los espacios verdes" },
      { value: "transparencia", label: "Lograr transparencia en el manejo de fondos publicos" }
    ],
    weight: 3
  },
  {
    key: "vp_02",
    dimensionKey: "valores_prioridades",
    text: '\xBFCuanto coincidis con esta frase? "Prefiero una solucion imperfecta que se aplique hoy a una solucion ideal que nunca llegue."',
    type: "scale",
    minLabel: "Nada, hay que hacer las cosas bien o no hacerlas",
    maxLabel: "Totalmente, lo urgente no puede esperar",
    weight: 2
  },
  {
    key: "vp_03",
    dimensionKey: "valores_prioridades",
    text: "Ordena estos valores segun su importancia para vos cuando pensas en la vida publica:",
    type: "rank",
    items: [
      "Justicia social y redistribucion",
      "Libertad individual y autonomia",
      "Solidaridad y cuidado mutuo",
      "Institucionalidad y respeto a las reglas"
    ],
    weight: 3
  },
  {
    key: "vp_04",
    dimensionKey: "valores_prioridades",
    text: "\xBFQue opinion te genera mas acuerdo sobre el rol del Estado en la Argentina?",
    type: "choice",
    options: [
      { value: "estado_fuerte", label: "El Estado tiene que garantizar derechos basicos aunque sea ineficiente" },
      { value: "estado_eficiente", label: "El Estado tiene que ser mas chico pero funcionar bien" },
      { value: "estado_comunidad", label: "Lo importante es que la comunidad organizada resuelva, con o sin Estado" },
      { value: "estado_mixto", label: "Necesitamos un equilibrio: Estado presente donde hace falta y comunidad activa donde puede" }
    ],
    weight: 2
  },
  {
    key: "vp_05",
    dimensionKey: "valores_prioridades",
    text: "\xBFCuanto valor\xE1s la diversidad de opiniones en un espacio de participacion, incluso cuando incluye posturas que te incomodan?",
    type: "scale",
    minLabel: "Poco, hay limites que no se negocian",
    maxLabel: "Mucho, escuchar al otro siempre enriquece",
    weight: 2
  },
  {
    key: "vp_06",
    dimensionKey: "valores_prioridades",
    text: "Frente a una asamblea vecinal donde se decide si destinar fondos a arreglar las calles o a un programa de becas para jovenes, \xBFque priorizas?",
    type: "choice",
    options: [
      { value: "infraestructura", label: "Las calles, porque mejoran la calidad de vida de todos" },
      { value: "becas", label: "Las becas, porque invertir en juventud es invertir en futuro" },
      { value: "consenso", label: "Buscaria un esquema que contemple ambas necesidades" },
      { value: "datos", label: "Pediria datos concretos antes de decidir" }
    ],
    weight: 1
  },
  // ==========================================================================
  // DIMENSION 4 — fortalezas_civicas
  // ==========================================================================
  {
    key: "fc_01",
    dimensionKey: "fortalezas_civicas",
    text: "\xBFQue tan bien conoces los mecanismos formales de participacion ciudadana en tu municipio (presupuesto participativo, banca abierta, audiencias publicas)?",
    type: "scale",
    minLabel: "No tengo idea de que existen",
    maxLabel: "Los conozco y los use alguna vez",
    weight: 2
  },
  {
    key: "fc_02",
    dimensionKey: "fortalezas_civicas",
    text: "\xBFCual de estas habilidades sentis que es tu punto mas fuerte?",
    type: "choice",
    options: [
      { value: "comunicacion", label: "Comunicar ideas de forma clara y persuasiva" },
      { value: "organizacion", label: "Organizar actividades, eventos o campa\xF1as" },
      { value: "analisis", label: "Analizar datos, presupuestos o informacion publica" },
      { value: "empatia", label: "Conectar emocionalmente con las necesidades del otro" },
      { value: "redes", label: "Tejer redes y conectar personas que no se conocen entre si" }
    ],
    weight: 3
  },
  {
    key: "fc_03",
    dimensionKey: "fortalezas_civicas",
    text: "Ordena estas acciones civicas segun tu experiencia real (de la que mas hiciste a la que menos):",
    type: "rank",
    items: [
      "Firmar petitorios o campa\xF1as online",
      "Participar en asambleas, reuniones vecinales o marchas",
      "Colaborar con una ONG, comedor o cooperativa",
      "Contactar a un funcionario o representante para un reclamo"
    ],
    weight: 2
  },
  {
    key: "fc_04",
    dimensionKey: "fortalezas_civicas",
    text: "\xBFQue tan preparado/a te sentis para explicarle a un vecino como funciona el presupuesto de tu municipio?",
    type: "scale",
    minLabel: "No podria, no manejo esa informacion",
    maxLabel: "Podria hacerlo con claridad y ejemplos",
    weight: 2
  },
  {
    key: "fc_05",
    dimensionKey: "fortalezas_civicas",
    text: "\xBFAlguna vez lideraste o co-lideraste una iniciativa comunitaria (junta de firmas, reclamo colectivo, evento solidario, etc.)?",
    type: "choice",
    options: [
      { value: "nunca", label: "Nunca" },
      { value: "acompa\xF1e", label: "No lidere, pero acompa\xF1e activamente" },
      { value: "una_vez", label: "Si, una vez" },
      { value: "varias", label: "Si, varias veces" },
      { value: "actualmente", label: "Si, y actualmente estoy en una" }
    ],
    weight: 3
  },
  {
    key: "fc_06",
    dimensionKey: "fortalezas_civicas",
    text: "\xBFCuanto confias en tu capacidad de sostener una conversacion productiva con alguien que piensa muy distinto a vos sobre temas politicos?",
    type: "scale",
    minLabel: "Muy poco, termino enojandome o callando",
    maxLabel: "Mucho, puedo escuchar y argumentar con calma",
    weight: 1
  },
  // ==========================================================================
  // DIMENSION 5 — areas_crecimiento
  // ==========================================================================
  {
    key: "ac_01",
    dimensionKey: "areas_crecimiento",
    text: "\xBFEn que area sentis que mas necesitas crecer para ser un ciudadano/a mas activo/a?",
    type: "choice",
    options: [
      { value: "conocimiento", label: "Conocer mejor como funcionan las instituciones y las leyes" },
      { value: "oratoria", label: "Poder expresarme mejor en publico" },
      { value: "organizacion", label: "Aprender a organizar y sostener proyectos" },
      { value: "redes", label: "Ampliar mi red de contactos civicos" },
      { value: "manejo_conflicto", label: "Saber manejar conflictos y diferencias sin destruir vinculos" },
      { value: "digital", label: "Usar herramientas digitales para causas civicas" }
    ],
    weight: 3
  },
  {
    key: "ac_02",
    dimensionKey: "areas_crecimiento",
    text: "\xBFCuanto sab\xE9s hoy sobre tus derechos como ciudadano/a frente a un abuso de autoridad (policial, municipal, laboral)?",
    type: "scale",
    minLabel: "Muy poco, no sabria que hacer",
    maxLabel: "Mucho, conozco los canales y procedimientos",
    weight: 2
  },
  {
    key: "ac_03",
    dimensionKey: "areas_crecimiento",
    text: "Ordena estas competencias de la que mas te gustaria desarrollar a la que menos:",
    type: "rank",
    items: [
      "Leer e interpretar datos publicos y presupuestos",
      "Moderar reuniones y facilitar acuerdos",
      "Redactar proyectos, pedidos de informes o petitorios",
      "Usar redes sociales estrategicamente para visibilizar causas"
    ],
    weight: 2
  },
  {
    key: "ac_04",
    dimensionKey: "areas_crecimiento",
    text: "\xBFQue tan dispuesto/a estas a dedicar tiempo regular (por ejemplo, 2 horas por semana) a formarte en temas civicos?",
    type: "scale",
    minLabel: "No tengo margen, mi dia esta lleno",
    maxLabel: "Totalmente, lo priorizaria",
    weight: 2
  },
  {
    key: "ac_05",
    dimensionKey: "areas_crecimiento",
    text: "\xBFQue formato de aprendizaje te resulta mas efectivo para temas civicos?",
    type: "choice",
    options: [
      { value: "presencial", label: "Talleres presenciales con gente del barrio" },
      { value: "online", label: "Cursos online a mi ritmo" },
      { value: "practica", label: "Aprender haciendo: sumandome a un proyecto real" },
      { value: "lectura", label: "Leer y reflexionar por mi cuenta" },
      { value: "mentor", label: "Tener un mentor o referente que me guie" }
    ],
    weight: 1
  },
  {
    key: "ac_06",
    dimensionKey: "areas_crecimiento",
    text: "\xBFCuanto te sentis capaz de identificar informacion falsa o manipulada sobre temas politicos en redes sociales?",
    type: "scale",
    minLabel: "Me cuesta mucho, a veces me doy cuenta tarde",
    maxLabel: "Tengo buen ojo, verifico antes de compartir",
    weight: 2
  },
  // ==========================================================================
  // DIMENSION 6 — barreras_compromiso
  // ==========================================================================
  {
    key: "bc_01",
    dimensionKey: "barreras_compromiso",
    text: "\xBFCual es el obstaculo mas grande que te frena a participar mas activamente?",
    type: "choice",
    options: [
      { value: "tiempo", label: "No tengo tiempo: entre el laburo, la familia y la supervivencia diaria, no da" },
      { value: "desconfianza", label: "Desconfianza: siento que todo espacio termina siendo cooptado o corrupto" },
      { value: "miedo", label: "Miedo a exponerme o a represalias" },
      { value: "no_se_como", label: "No se por donde empezar ni a quien acercarme" },
      { value: "desanimo", label: "Ya participe y no vi resultados, me desmotivo" },
      { value: "no_me_representan", label: "Los espacios que conozco no me representan" }
    ],
    weight: 3
  },
  {
    key: "bc_02",
    dimensionKey: "barreras_compromiso",
    text: "\xBFCuanto influye la inestabilidad economica en tu capacidad de pensar mas alla de lo inmediato (fin de mes, precios, inflacion)?",
    type: "scale",
    minLabel: "Nada, logro separar las cosas",
    maxLabel: "Totalmente, la urgencia economica me absorbe",
    weight: 3
  },
  {
    key: "bc_03",
    dimensionKey: "barreras_compromiso",
    text: "Ordena estas barreras de la que mas te afecta a la que menos:",
    type: "rank",
    items: [
      'La sensacion de que nada va a cambiar ("siempre fue asi")',
      "La agresividad y polarizacion del debate publico",
      "La falta de espacios genuinos y no partidarios para participar",
      "El cansancio y la sobrecarga de la vida cotidiana"
    ],
    weight: 2
  },
  {
    key: "bc_04",
    dimensionKey: "barreras_compromiso",
    text: "\xBFCuanta confianza tenes en que las instituciones argentinas (justicia, congreso, municipio) puedan mejorar en los proximos 10 a\xF1os?",
    type: "scale",
    minLabel: "Ninguna, estan perdidas",
    maxLabel: "Bastante, creo que la mejora es posible",
    weight: 2
  },
  {
    key: "bc_05",
    dimensionKey: "barreras_compromiso",
    text: "\xBFQue te haria falta para dar el paso y comprometerte mas con tu comunidad?",
    type: "choice",
    options: [
      { value: "grupo", label: "Un grupo de confianza con el que compartir el esfuerzo" },
      { value: "informacion", label: "Informacion clara sobre que puedo hacer y donde" },
      { value: "tiempo_protegido", label: "Que mi situacion economica me diera un poco mas de respiro" },
      { value: "resultados", label: "Ver que una peque\xF1a accion realmente produce un cambio" },
      { value: "formacion", label: "Formarme para sentirme mas seguro/a al participar" }
    ],
    weight: 2
  },
  {
    key: "bc_06",
    dimensionKey: "barreras_compromiso",
    text: "\xBFCuanto te afecta emocionalmente la polarizacion politica argentina a la hora de involucrarte en temas civicos?",
    type: "scale",
    minLabel: "No me afecta, lo manejo bien",
    maxLabel: "Me agota tanto que prefiero no meterme",
    weight: 1
  }
];

// server/services/civic-profile-service.ts
init_db();
init_schema();
import { eq as eq4, desc as desc4 } from "drizzle-orm";
function findQuestion(questionKey) {
  return ASSESSMENT_QUESTIONS.find((q) => q.key === questionKey);
}
function stdDeviation(values) {
  if (values.length === 0) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const squaredDiffs = values.map((v) => (v - mean) ** 2);
  return Math.sqrt(squaredDiffs.reduce((a, b) => a + b, 0) / values.length);
}
function computeDimensionScores(responses) {
  const dimensionAccum = {};
  for (const dim of CIVIC_DIMENSIONS) {
    dimensionAccum[dim.key] = { totalWeightedScore: 0, totalWeight: 0 };
  }
  for (const resp of responses) {
    const question = findQuestion(resp.questionKey);
    if (!question) continue;
    const weight = question.weight ?? 1;
    let score = null;
    switch (resp.responseType) {
      case "scale": {
        const value = resp.responseValue ?? 1;
        score = (value - 1) / 9 * 100;
        break;
      }
      case "choice": {
        if (question.type !== "choice") break;
        const choiceKey = resp.responseChoice ?? "";
        const options = question.options;
        const idx = options.findIndex((o) => o.value === choiceKey);
        if (idx >= 0 && options.length > 1) {
          score = (idx + 1) / options.length * 100;
        } else {
          score = 50;
        }
        break;
      }
      case "rank": {
        let rankedItems = [];
        try {
          rankedItems = JSON.parse(resp.responseRank ?? "[]");
        } catch {
          rankedItems = [];
        }
        if (rankedItems.length > 0) {
          const avgScore = rankedItems.reduce((sum, _, idx) => {
            return sum + (rankedItems.length - 1 - idx) / Math.max(1, rankedItems.length - 1) * 100;
          }, 0) / rankedItems.length;
          score = avgScore;
        }
        break;
      }
    }
    if (score !== null) {
      score = Math.max(0, Math.min(100, score));
      const dimKey = resp.dimensionKey;
      if (!dimensionAccum[dimKey]) {
        dimensionAccum[dimKey] = { totalWeightedScore: 0, totalWeight: 0 };
      }
      dimensionAccum[dimKey].totalWeightedScore += score * weight;
      dimensionAccum[dimKey].totalWeight += weight;
    }
  }
  const scores = {};
  for (const [dim, accum] of Object.entries(dimensionAccum)) {
    scores[dim] = accum.totalWeight > 0 ? Math.round(accum.totalWeightedScore / accum.totalWeight * 100) / 100 : 0;
  }
  return scores;
}
function determineArchetype(dimensionScores) {
  let bestArchetype = CIVIC_ARCHETYPES[0]?.key ?? "unknown";
  let bestScore = -Infinity;
  const allScoreValues = Object.values(dimensionScores);
  const globalStdDev = stdDeviation(allScoreValues);
  for (const archetype of CIVIC_ARCHETYPES) {
    const primaryDims = archetype.primaryDimensions ?? [];
    if (primaryDims.length === 0) continue;
    const relevantScores = primaryDims.map((d) => dimensionScores[d] ?? 0);
    const avg = relevantScores.reduce((a, b) => a + b, 0) / relevantScores.length;
    let adjustedScore = avg;
    if (archetype.key === "el_espejo") {
      const balanceBonus = Math.max(0, 15 - globalStdDev);
      adjustedScore = avg + balanceBonus;
    }
    if (adjustedScore > bestScore) {
      bestScore = adjustedScore;
      bestArchetype = archetype.key;
    }
  }
  return bestArchetype;
}
function computeTopStrengths(dimensionScores) {
  return Object.entries(dimensionScores).sort(([, a], [, b]) => b - a).slice(0, 3).map(([dim]) => dim);
}
function computeGrowthAreas(dimensionScores) {
  return Object.entries(dimensionScores).sort(([, a], [, b]) => a - b).slice(0, 2).map(([dim]) => dim);
}
var ACTION_MAP = {
  el_puente: [
    "Facilita un dialogo entre personas con perspectivas opuestas en tu entorno",
    "Conecta dos organizaciones de tu zona que trabajan temas complementarios",
    "Organiza un encuentro entre vecinos que no se conocen para un objetivo comun"
  ],
  el_vigia: [
    "Ped\xED un informe publico sobre el presupuesto de tu municipio y compartilo",
    "Asisti a la proxima audiencia publica o sesion del concejo deliberante",
    "Crea un hilo en redes explicando un tema civico que investigaste"
  ],
  la_raiz: [
    "Sumarte como voluntario/a regular en un comedor, biblioteca o centro comunitario",
    "Organiza una jornada solidaria en tu barrio este mes",
    "Identifica una necesidad concreta de tu cuadra y coordina una solucion con vecinos"
  ],
  el_catalizador: [
    "Lidera una campana de accion directa sobre un problema local concreto",
    "Convoca a 5 personas para un proyecto comunitario y defini los primeros pasos",
    "Propon una solucion innovadora a un problema persistente de tu zona"
  ],
  el_sembrador: [
    "Asisti a una reunion comunitaria o asamblea vecinal como oyente activo",
    "Completa un curso sobre participacion ciudadana esta semana",
    "Conversa con un referente comunitario de tu zona sobre como empezar"
  ],
  el_espejo: [
    "Facilita una ronda de reflexion con amigos o vecinos sobre ciudadania",
    "Escribi tus 3 compromisos civicos concretos para este mes y compartilos",
    "Propon un espacio de dialogo abierto sobre un tema que divida opiniones"
  ]
};
var GROWTH_ACTION_MAP = {
  motivacion_civica: "Lee una historia de alguien que genero cambio en su comunidad y reflexiona que te moviliza a vos",
  estilo_liderazgo: "Practica facilitar una conversacion grupal donde todos tengan voz",
  valores_prioridades: "Escribi tus 5 valores civicos principales y ordenalos por importancia",
  fortalezas_civicas: "Asisti a una asamblea vecinal o reunion del consejo deliberante como oyente activo",
  areas_crecimiento: "Inscribite en un taller o curso sobre participacion ciudadana",
  barreras_compromiso: "Identifica tu barrera principal y hace una sola accion peque\xF1a para superarla esta semana"
};
function generateRecommendedActions(archetype, growthAreas) {
  const actions = [];
  const archetypeActions = ACTION_MAP[archetype] ?? [];
  actions.push(...archetypeActions.slice(0, 3));
  for (const area of growthAreas) {
    const action = GROWTH_ACTION_MAP[area];
    if (action && !actions.includes(action)) {
      actions.push(action);
    }
  }
  return actions.slice(0, 5);
}
async function computeCivicProfile(userId, assessmentId) {
  const responses = await db.select().from(civicAssessmentResponses).where(eq4(civicAssessmentResponses.assessmentId, assessmentId));
  const rawResponses = responses.map((r) => ({
    questionKey: r.questionKey,
    dimensionKey: r.dimensionKey,
    responseType: r.responseType,
    responseValue: r.responseValue,
    responseChoice: r.responseChoice,
    responseRank: r.responseRank
  }));
  const dimensionScores = computeDimensionScores(rawResponses);
  const archetype = determineArchetype(dimensionScores);
  const topStrengths = computeTopStrengths(dimensionScores);
  const growthAreas = computeGrowthAreas(dimensionScores);
  const recommendedActions = generateRecommendedActions(archetype, growthAreas);
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const existing = await db.select().from(civicProfiles).where(eq4(civicProfiles.assessmentId, assessmentId)).limit(1);
  if (existing.length > 0) {
    await db.update(civicProfiles).set({
      archetype,
      dimensionScores: JSON.stringify(dimensionScores),
      topStrengths: JSON.stringify(topStrengths),
      growthAreas: JSON.stringify(growthAreas),
      recommendedActions: JSON.stringify(recommendedActions),
      updatedAt: now
    }).where(eq4(civicProfiles.assessmentId, assessmentId));
  } else {
    await db.insert(civicProfiles).values({
      userId,
      assessmentId,
      archetype,
      dimensionScores: JSON.stringify(dimensionScores),
      topStrengths: JSON.stringify(topStrengths),
      growthAreas: JSON.stringify(growthAreas),
      recommendedActions: JSON.stringify(recommendedActions),
      createdAt: now,
      updatedAt: now
    });
  }
  await db.update(civicAssessments).set({
    status: "completed",
    completedAt: now
  }).where(eq4(civicAssessments.id, assessmentId));
  return {
    userId,
    assessmentId,
    archetype,
    dimensionScores,
    topStrengths,
    growthAreas,
    recommendedActions
  };
}
async function getCommunityComparison(userId) {
  const userProfile = await db.select().from(civicProfiles).where(eq4(civicProfiles.userId, userId)).orderBy(desc4(civicProfiles.createdAt)).limit(1);
  if (userProfile.length === 0) {
    throw new Error("No civic profile found for this user");
  }
  const userScores = JSON.parse(
    userProfile[0].dimensionScores
  );
  const allProfiles = await db.select({
    dimensionScores: civicProfiles.dimensionScores
  }).from(civicProfiles);
  if (allProfiles.length <= 1) {
    const percentiles2 = {};
    for (const dim of Object.keys(userScores)) {
      percentiles2[dim] = 100;
    }
    return percentiles2;
  }
  const allParsed = allProfiles.map(
    (p) => JSON.parse(p.dimensionScores)
  );
  const percentiles = {};
  for (const dim of Object.keys(userScores)) {
    const userValue = userScores[dim] ?? 0;
    const allValues = allParsed.map((scores) => scores[dim] ?? 0).sort((a, b) => a - b);
    const belowCount = allValues.filter((v) => v < userValue).length;
    const equalCount = allValues.filter((v) => v === userValue).length;
    const percentile = Math.round(
      (belowCount + 0.5 * equalCount) / allValues.length * 100 * 100
    ) / 100;
    percentiles[dim] = Math.max(0, Math.min(100, percentile));
  }
  return percentiles;
}

// server/routes-civic-assessment.ts
function registerCivicAssessmentRoutes(app2) {
  app2.get("/api/assessment/questions", (_req, res) => {
    res.json({
      questions: ASSESSMENT_QUESTIONS,
      dimensions: CIVIC_DIMENSIONS,
      archetypes: CIVIC_ARCHETYPES
    });
  });
  app2.post("/api/assessment/start", authenticateToken, async (req, res) => {
    try {
      const userId = req.user.userId;
      const existing = await db.select().from(civicAssessments).where(and4(
        eq5(civicAssessments.userId, userId),
        eq5(civicAssessments.status, "in_progress")
      )).limit(1);
      if (existing.length > 0) {
        const responses = await db.select().from(civicAssessmentResponses).where(eq5(civicAssessmentResponses.assessmentId, existing[0].id));
        return res.json({
          assessment: existing[0],
          responses
        });
      }
      const now = (/* @__PURE__ */ new Date()).toISOString();
      const result = await db.insert(civicAssessments).values({
        userId,
        status: "in_progress",
        version: 1,
        startedAt: now,
        createdAt: now
      }).returning();
      res.json({
        assessment: result[0],
        responses: []
      });
    } catch (error) {
      console.error("Error starting assessment:", error);
      res.status(500).json({ message: "Error al iniciar la evaluacion" });
    }
  });
  app2.put("/api/assessment/:id/respond", authenticateToken, async (req, res) => {
    try {
      const assessmentId = parseInt(req.params.id);
      const userId = req.user.userId;
      const { responses } = req.body;
      const assessment = await db.select().from(civicAssessments).where(and4(
        eq5(civicAssessments.id, assessmentId),
        eq5(civicAssessments.userId, userId)
      )).limit(1);
      if (assessment.length === 0) {
        return res.status(404).json({ message: "Evaluacion no encontrada" });
      }
      if (assessment[0].status === "completed") {
        return res.status(400).json({ message: "Esta evaluacion ya fue completada" });
      }
      const now = (/* @__PURE__ */ new Date()).toISOString();
      for (const resp of responses) {
        const existing = await db.select().from(civicAssessmentResponses).where(and4(
          eq5(civicAssessmentResponses.assessmentId, assessmentId),
          eq5(civicAssessmentResponses.questionKey, resp.questionKey)
        )).limit(1);
        if (existing.length > 0) {
          await db.update(civicAssessmentResponses).set({
            responseType: resp.responseType,
            responseValue: resp.responseValue ?? null,
            responseChoice: resp.responseChoice ?? null,
            responseRank: resp.responseRank ? JSON.stringify(resp.responseRank) : null
          }).where(eq5(civicAssessmentResponses.id, existing[0].id));
        } else {
          await db.insert(civicAssessmentResponses).values({
            assessmentId,
            questionKey: resp.questionKey,
            dimensionKey: resp.dimensionKey,
            responseType: resp.responseType,
            responseValue: resp.responseValue ?? null,
            responseChoice: resp.responseChoice ?? null,
            responseRank: resp.responseRank ? JSON.stringify(resp.responseRank) : null,
            createdAt: now
          });
        }
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error saving responses:", error);
      res.status(500).json({ message: "Error al guardar respuestas" });
    }
  });
  app2.post("/api/assessment/:id/complete", authenticateToken, async (req, res) => {
    try {
      const assessmentId = parseInt(req.params.id);
      const userId = req.user.userId;
      const assessment = await db.select().from(civicAssessments).where(and4(
        eq5(civicAssessments.id, assessmentId),
        eq5(civicAssessments.userId, userId)
      )).limit(1);
      if (assessment.length === 0) {
        return res.status(404).json({ message: "Evaluacion no encontrada" });
      }
      if (assessment[0].status === "completed") {
        return res.status(400).json({ message: "Esta evaluacion ya fue completada" });
      }
      const profile = await computeCivicProfile(userId, assessmentId);
      const archetype = CIVIC_ARCHETYPES.find((a) => a.key === profile.archetype);
      res.json({
        profile,
        archetype,
        dimensions: CIVIC_DIMENSIONS
      });
    } catch (error) {
      console.error("Error completing assessment:", error);
      res.status(500).json({ message: "Error al completar la evaluacion" });
    }
  });
  app2.get("/api/assessment/current", authenticateToken, async (req, res) => {
    try {
      const userId = req.user.userId;
      const assessment = await db.select().from(civicAssessments).where(eq5(civicAssessments.userId, userId)).orderBy(desc5(civicAssessments.createdAt)).limit(1);
      if (assessment.length === 0) {
        return res.json({ assessment: null, responses: [] });
      }
      const responses = await db.select().from(civicAssessmentResponses).where(eq5(civicAssessmentResponses.assessmentId, assessment[0].id));
      res.json({
        assessment: assessment[0],
        responses
      });
    } catch (error) {
      console.error("Error fetching assessment:", error);
      res.status(500).json({ message: "Error al obtener evaluacion" });
    }
  });
  app2.get("/api/civic-profile", authenticateToken, async (req, res) => {
    try {
      const userId = req.user.userId;
      const profile = await db.select().from(civicProfiles).where(eq5(civicProfiles.userId, userId)).orderBy(desc5(civicProfiles.createdAt)).limit(1);
      if (profile.length === 0) {
        return res.json({ profile: null });
      }
      const archetype = CIVIC_ARCHETYPES.find((a) => a.key === profile[0].archetype);
      res.json({
        profile: {
          ...profile[0],
          dimensionScores: JSON.parse(profile[0].dimensionScores),
          topStrengths: JSON.parse(profile[0].topStrengths),
          growthAreas: JSON.parse(profile[0].growthAreas),
          recommendedActions: JSON.parse(profile[0].recommendedActions)
        },
        archetype,
        dimensions: CIVIC_DIMENSIONS
      });
    } catch (error) {
      console.error("Error fetching civic profile:", error);
      res.status(500).json({ message: "Error al obtener perfil civico" });
    }
  });
  app2.get("/api/civic-profile/history", authenticateToken, async (req, res) => {
    try {
      const userId = req.user.userId;
      const profiles = await db.select().from(civicProfiles).where(eq5(civicProfiles.userId, userId)).orderBy(civicProfiles.createdAt);
      const history = profiles.map((p) => ({
        date: p.createdAt,
        dimensionScores: JSON.parse(p.dimensionScores),
        archetype: p.archetype
      }));
      res.json({ history });
    } catch (error) {
      console.error("Error fetching profile history:", error);
      res.status(500).json({ message: "Error al obtener historial" });
    }
  });
  app2.get("/api/civic-profile/community-comparison", authenticateToken, async (req, res) => {
    try {
      const userId = req.user.userId;
      const percentiles = await getCommunityComparison(userId);
      res.json({ percentiles });
    } catch (error) {
      console.error("Error fetching community comparison:", error);
      res.status(500).json({ message: "Error al obtener comparacion comunitaria" });
    }
  });
}

// server/routes-goals.ts
init_db();
init_schema();
init_auth();
import { eq as eq6, desc as desc6, and as and5 } from "drizzle-orm";
function registerGoalRoutes(app2) {
  app2.get("/api/goals", authenticateToken, async (req, res) => {
    try {
      const userId = req.user.userId;
      const goals = await db.select().from(civicGoals).where(eq6(civicGoals.userId, userId)).orderBy(desc6(civicGoals.createdAt));
      const parsed = goals.map((g) => ({
        ...g,
        milestones: g.milestones ? JSON.parse(g.milestones) : []
      }));
      res.json({ goals: parsed });
    } catch (error) {
      console.error("Error fetching goals:", error);
      res.status(500).json({ message: "Error al obtener metas" });
    }
  });
  app2.post("/api/goals", authenticateToken, async (req, res) => {
    try {
      const userId = req.user.userId;
      const { title, description, category, targetDate, milestones, linkedLifeAreaId, linkedChallengeId } = req.body;
      const now = (/* @__PURE__ */ new Date()).toISOString();
      const result = await db.insert(civicGoals).values({
        userId,
        title,
        description: description || null,
        category,
        targetDate: targetDate || null,
        status: "active",
        progress: 0,
        milestones: milestones ? JSON.stringify(milestones) : null,
        linkedLifeAreaId: linkedLifeAreaId || null,
        linkedChallengeId: linkedChallengeId || null,
        createdAt: now,
        updatedAt: now
      }).returning();
      res.json({ goal: { ...result[0], milestones: milestones || [] } });
    } catch (error) {
      console.error("Error creating goal:", error);
      res.status(500).json({ message: "Error al crear meta" });
    }
  });
  app2.put("/api/goals/:id", authenticateToken, async (req, res) => {
    try {
      const userId = req.user.userId;
      const goalId = parseInt(req.params.id);
      const { title, description, category, targetDate, status, progress, milestones } = req.body;
      const existing = await db.select().from(civicGoals).where(and5(eq6(civicGoals.id, goalId), eq6(civicGoals.userId, userId))).limit(1);
      if (existing.length === 0) {
        return res.status(404).json({ message: "Meta no encontrada" });
      }
      const updates = { updatedAt: (/* @__PURE__ */ new Date()).toISOString() };
      if (title !== void 0) updates.title = title;
      if (description !== void 0) updates.description = description;
      if (category !== void 0) updates.category = category;
      if (targetDate !== void 0) updates.targetDate = targetDate;
      if (status !== void 0) updates.status = status;
      if (progress !== void 0) updates.progress = progress;
      if (milestones !== void 0) updates.milestones = JSON.stringify(milestones);
      await db.update(civicGoals).set(updates).where(eq6(civicGoals.id, goalId));
      res.json({ success: true });
    } catch (error) {
      console.error("Error updating goal:", error);
      res.status(500).json({ message: "Error al actualizar meta" });
    }
  });
  app2.delete("/api/goals/:id", authenticateToken, async (req, res) => {
    try {
      const userId = req.user.userId;
      const goalId = parseInt(req.params.id);
      await db.update(civicGoals).set({ status: "abandoned", updatedAt: (/* @__PURE__ */ new Date()).toISOString() }).where(and5(eq6(civicGoals.id, goalId), eq6(civicGoals.userId, userId)));
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting goal:", error);
      res.status(500).json({ message: "Error al eliminar meta" });
    }
  });
  app2.get("/api/checkins", authenticateToken, async (req, res) => {
    try {
      const userId = req.user.userId;
      const checkins = await db.select().from(weeklyCheckins).where(eq6(weeklyCheckins.userId, userId)).orderBy(desc6(weeklyCheckins.weekOf));
      const parsed = checkins.map((c) => ({
        ...c,
        goalsReviewed: c.goalsReviewed ? JSON.parse(c.goalsReviewed) : []
      }));
      res.json({ checkins: parsed });
    } catch (error) {
      console.error("Error fetching checkins:", error);
      res.status(500).json({ message: "Error al obtener check-ins" });
    }
  });
  app2.post("/api/checkins", authenticateToken, async (req, res) => {
    try {
      const userId = req.user.userId;
      const { weekOf, mood, progressRating, highlight, challenge, nextWeekIntention, goalsReviewed } = req.body;
      const now = (/* @__PURE__ */ new Date()).toISOString();
      const result = await db.insert(weeklyCheckins).values({
        userId,
        weekOf,
        mood,
        progressRating,
        highlight: highlight || null,
        challenge: challenge || null,
        nextWeekIntention: nextWeekIntention || null,
        goalsReviewed: goalsReviewed ? JSON.stringify(goalsReviewed) : null,
        createdAt: now
      }).returning();
      res.json({ checkin: result[0] });
    } catch (error) {
      console.error("Error creating checkin:", error);
      res.status(500).json({ message: "Error al crear check-in" });
    }
  });
  app2.get("/api/checkins/current-week", authenticateToken, async (req, res) => {
    try {
      const userId = req.user.userId;
      const now = /* @__PURE__ */ new Date();
      const day = now.getDay();
      const diff = now.getDate() - day + (day === 0 ? -6 : 1);
      const monday = new Date(now.setDate(diff));
      const weekOf = monday.toISOString().split("T")[0];
      const checkin = await db.select().from(weeklyCheckins).where(and5(
        eq6(weeklyCheckins.userId, userId),
        eq6(weeklyCheckins.weekOf, weekOf)
      )).limit(1);
      res.json({ checkin: checkin[0] || null, weekOf });
    } catch (error) {
      console.error("Error fetching current week checkin:", error);
      res.status(500).json({ message: "Error al obtener check-in actual" });
    }
  });
}

// server/routes-coaching.ts
init_db();
init_schema();
init_auth();
import { eq as eq8, desc as desc8, and as and7 } from "drizzle-orm";

// server/services/coaching-service.ts
init_db();
init_schema();
init_config();
import { eq as eq7, desc as desc7, and as and6, isNull, ne, count, inArray as inArray2 } from "drizzle-orm";

// shared/coaching-templates.ts
var COACHING_TEMPLATES = [
  // ===== ASSESSMENT DEBRIEF =====
  {
    sessionType: "assessment_debrief",
    archetype: "el_puente",
    messages: [
      "Tu perfil como Puente habla de alguien que naturalmente conecta personas e ideas. En Argentina, donde la fragmentacion social es un desafio cronico, esta capacidad es un recurso enorme. Te propongo un ejercicio concreto: esta semana, identifica dos personas de tu entorno que deberian conocerse pero no se conocen. Presentalas. Un Puente se construye un ladrillo a la vez.",
      "Los resultados muestran que tu dimension mas fuerte es la colaboracion. Eso no es casual: elegis construir vinculos donde otros ven divisiones. \xBFEn que espacio concreto podrias poner esa habilidad al servicio de algo mas grande que vos? Pensalo y la proxima vez me contas."
    ]
  },
  {
    sessionType: "assessment_debrief",
    archetype: "el_vigia",
    messages: [
      "Como Vigia, tenes algo que mucha gente no: la conviccion de que las cosas pueden funcionar mejor y la voluntad de se\xF1alarlo. En un pais donde es facil resignarse, eso es poderoso. Tu desafio es canalizar esa energia sin agotarte. Esta semana, elegi una sola cosa que quieras fiscalizar o mejorar en tu entorno, y dedica energia solo a eso.",
      "Tu perfil muestra alta motivacion civica combinada con valores fuertes. Sos de los que no miran para otro lado. Eso es valioso, pero tambien puede ser agotador. \xBFTenes un sistema para descansar sin sentir culpa? Porque cuidarte a vos es parte de la lucha."
    ]
  },
  {
    sessionType: "assessment_debrief",
    archetype: "la_raiz",
    messages: [
      "Tu arquetipo de Raiz refleja algo hermoso: tu impacto esta en lo cercano, en lo cotidiano, en lo que sostiene a la comunidad cuando todo lo demas tambalea. No necesitas grandes escenarios. \xBFCual es ese espacio cercano donde mas podes aportar esta semana?"
    ]
  },
  {
    sessionType: "assessment_debrief",
    archetype: "el_catalizador",
    messages: [
      "Como Catalizador, tu energia para actuar es tu mayor activo. Pero cuidado: el impulso sin estrategia se apaga rapido. Te propongo que antes de tu proxima accion civica, escribas tres cosas: que queres lograr, quien te puede ayudar, y como vas a saber si funciono."
    ]
  },
  {
    sessionType: "assessment_debrief",
    archetype: "el_sembrador",
    messages: [
      "Tu perfil de Sembrador indica que estas en un momento de apertura. No subestimes eso: llegar sin las cicatrices del desencanto es una ventaja. Tu mirada fresca puede renovar espacios que se volvieron rutinarios. \xBFQue espacio de participacion te gustaria explorar primero?"
    ]
  },
  {
    sessionType: "assessment_debrief",
    archetype: "el_espejo",
    messages: [
      "Como Espejo, tu equilibrio entre dimensiones es tu superpoder. En un pais de extremos, personas como vos son las que ayudan a un grupo a detenerse y elegir mejor. \xBFHay algun espacio donde podrias ofrecer esa perspectiva equilibrada?"
    ]
  },
  // ===== WEEKLY REFLECTION =====
  {
    sessionType: "weekly_reflection",
    messages: [
      "\xBFQue momento de esta semana te hizo sentir mas conectado/a con tu comunidad? No importa si fue grande o peque\xF1o. A veces los gestos minimos son los que mas revelan.",
      "Pensemos en tu semana: \xBFhubo algun momento en que pudiste haber actuado como ciudadano/a y no lo hiciste? No te juzgo, solo quiero que lo notes. La conciencia es el primer paso.",
      "Esta semana, \xBFque te genero mas indignacion en las noticias o en tu entorno? Y mas importante: \xBFque podrias hacer con esa indignacion que sea constructivo?",
      "Contame: \xBFpudiste avanzar en alguna de tus metas esta semana? Si no, \xBFque se interpuso? A veces nombrar el obstaculo es el primer paso para sacarlo del camino."
    ]
  },
  // ===== GOAL REVIEW =====
  {
    sessionType: "goal_review",
    messages: [
      "Vamos a revisar tus metas. No te preocupes si no avanzaste en todas; lo importante es ser honesto/a con vos mismo/a. \xBFCual sentis que esta mas estancada y por que?",
      "Te quiero hacer una pregunta directa: \xBFtus metas actuales realmente te importan, o las definiste por inercia? A veces hace falta reformular para que la motivacion vuelva.",
      "Miremos tus metas: \xBFcual te genera mas entusiasmo cuando pensas en completarla? Empecemos por ahi. La energia positiva arrastra al resto."
    ]
  },
  // ===== GROWTH PROMPT =====
  {
    sessionType: "growth_prompt",
    messages: [
      "Hoy te propongo un ejercicio: escribi tres cosas que podrias hacer por tu barrio que no requieran ni plata ni permiso de nadie. Solo voluntad y un poco de tiempo. Despues elegi una y hacela esta semana.",
      "Pensemos juntos: \xBFque habilidad tuya podria tener impacto civico si la pusieras al servicio de otros? No tiene que ser algo grandioso. A veces saber cocinar, saber escuchar o saber de numeros ya es un superpoder comunitario.",
      "\xBFCuando fue la ultima vez que hiciste algo por alguien que no es de tu circulo cercano? No por culpa, sino por expansion. El compromiso civico empieza cuando ampliamos el rango de quienes nos importan.",
      "Te dejo una reflexion: en la Argentina, \xBFque cambio chiquito podria generar un efecto grande si mucha gente lo hiciera al mismo tiempo? Pensalo y despues compartilo con alguien."
    ]
  },
  // ===== AD HOC =====
  {
    sessionType: "ad_hoc",
    messages: [
      "Bienvenido/a a tu sesion de coaching civico. \xBFSobre que queres trabajar hoy? Puedo ayudarte a pensar sobre tus metas, reflexionar sobre tu semana, o explorar como involucrarte mas en tu comunidad.",
      "Hola, estoy aca para ayudarte a pensar. \xBFHay algo especifico que te este dando vueltas en la cabeza sobre tu vida civica o comunitaria?",
      "\xBFEn que puedo acompa\xF1arte hoy? Puedo ser util para poner en palabras lo que sentis, ordenar ideas, o definir proximos pasos concretos."
    ]
  },
  // ===== MISION ACTIVA =====
  {
    sessionType: "mission_active",
    messages: [
      "Hola. Hoy vamos a enfocarnos en tu mision activa. Contame: \xBFque tarea de tu mision te gustaria abordar hoy?",
      "Bien, veo que estas participando en una mision nacional. Cada accion que tomes, por peque\xF1a que sea, suma al cambio. \xBFHay alguna tarea pendiente que puedas completar antes de que termine el dia?",
      "La clave de la participacion civica es la constancia, no la intensidad. \xBFQue es lo mas simple que podes hacer hoy por tu mision?",
      "Recorda: no necesitas permiso para actuar. Si ves algo que documentar, documentalo. Si ves algo que verificar, verificalo. Tu rol en la mision es tu licencia para actuar."
    ]
  },
  // ===== DIMENSION-SPECIFIC GROWTH =====
  {
    sessionType: "growth_prompt",
    dimension: "motivacion_civica",
    messages: [
      "Tu motivacion civica mostro margen de crecimiento. Te propongo algo simple: esta semana, lee una noticia sobre tu municipio y contasela a alguien. No para convencer, solo para compartir. La motivacion civica crece con la practica."
    ]
  },
  {
    sessionType: "growth_prompt",
    dimension: "barreras_compromiso",
    messages: [
      "Las barreras al compromiso son reales, no son excusas. \xBFCual es la que mas te pesa: tiempo, desconfianza, o no saber por donde empezar? Nombrarla es el primer paso para trabajarla."
    ]
  },
  {
    sessionType: "growth_prompt",
    dimension: "estilo_liderazgo",
    messages: [
      "Liderar no es mandar. A veces el mejor liderazgo es escuchar, preguntar, y sostener. \xBFHay algun espacio donde podrias practicar ese tipo de liderazgo silencioso esta semana?"
    ]
  }
];
function getTemplateMessages(sessionType, archetype, weakestDimension) {
  if (archetype) {
    const archetypeMatch = COACHING_TEMPLATES.find(
      (t) => t.sessionType === sessionType && t.archetype === archetype
    );
    if (archetypeMatch) return archetypeMatch.messages;
  }
  if (weakestDimension) {
    const dimMatch = COACHING_TEMPLATES.find(
      (t) => t.sessionType === sessionType && t.dimension === weakestDimension
    );
    if (dimMatch) return dimMatch.messages;
  }
  const generic = COACHING_TEMPLATES.find(
    (t) => t.sessionType === sessionType && !t.archetype && !t.dimension
  );
  return generic?.messages || ["Hola, \xBFen que puedo ayudarte hoy con tu desarrollo civico?"];
}

// server/services/coaching-service.ts
var ARCHETYPE_LENSES = {
  el_puente: `Este usuario es un Puente \u2014 conecta personas, ideas y recursos que de otra forma no se cruzarian. En la Argentina fragmentada, su capacidad de tejer vinculos es un recurso estrategico. Ayudalo a ver cada conversacion como una oportunidad de conectar mundos. Desafialo a presentar personas que deberian conocerse. Preguntale: "\xBFQue dos personas de tu vida que no se conocen podrian crear algo juntas?"`,
  el_vigia: `Este usuario es un Vigia \u2014 no mira para otro lado. Tiene la conviccion de que las instituciones deben rendir cuentas y la firmeza para se\xF1alarlo. Su riesgo es el agotamiento y la amargura. Ayudalo a canalizar su indignacion en acciones precisas, no en bronca difusa. Recordale que cuidarse a si mismo es parte de la lucha. Preguntale: "\xBFCual es la unica cosa que vas a fiscalizar esta semana?"`,
  la_raiz: `Este usuario es una Raiz \u2014 su impacto esta en lo cercano, lo cotidiano, lo que sostiene a la comunidad cuando todo tambalea. No necesita grandes escenarios. Ayudalo a valorar su trabajo invisible y a profundizar en lo local. Preguntale: "\xBFQue necesita tu barrio esta semana que vos podrias resolver sin pedirle permiso a nadie?"`,
  el_catalizador: `Este usuario es un Catalizador \u2014 no diagnostica, actua. Tiene energia natural y capacidad de contagiar entusiasmo. Su riesgo es el burnout y la accion sin estrategia. Ayudalo a combinar impulso con planificacion. Antes de cada accion, pedile tres cosas: que quiere lograr, quien lo puede ayudar, y como va a saber si funciono.`,
  el_sembrador: `Este usuario es un Sembrador \u2014 esta en un momento de apertura civica. Quizas todavia no encontro su espacio pero siente el llamado. Su ventaja es la mirada fresca, sin las cicatrices del desencanto. Sele gentil pero desafiante. Guialo a dar pasos concretos y pequenos. Preguntale: "\xBFQue espacio de participacion te gustaria explorar primero?"`,
  el_espejo: `Este usuario es un Espejo \u2014 su fortaleza es la autoconciencia. Reflexiona antes de actuar, escucha antes de opinar. En una cultura publica del grito, su equilibrio es un recurso raro. Ayudalo a poner esa capacidad al servicio de grupos: facilitar dialogos, mediar conflictos, crear espacios donde otros piensen mejor.`
};
var SESSION_DIRECTIVES = {
  assessment_debrief: `OBJETIVO DE SESION: El usuario acaba de completar su evaluacion civica. Tu trabajo es devolverle un espejo poderoso \u2014 que se vea no como un puntaje sino como alguien con un rol unico en la reconstruccion del pais. Conecta sus resultados con su potencial de impacto. Termina con una accion concreta para esta semana.`,
  weekly_reflection: `OBJETIVO DE SESION: Reflexion semanal. Tu trabajo es ayudar al usuario a encontrar el hilo civico en su semana \u2014 momentos donde actuo (o pudo haber actuado) como ciudadano/a. No juzgues, ilumina. Cada reflexion debe cerrar con una intencion para la semana que viene.`,
  goal_review: `OBJETIVO DE SESION: Revision de metas. Se honesto: si las metas del usuario son vagas o inalcanzables, ayudalo a reformularlas. Usa la formula: accion especifica + para cuando + como vas a saber que lo lograste. Si esta estancado, preguntale si la meta realmente le importa o la definio por inercia.`,
  growth_prompt: `OBJETIVO DE SESION: Impulso de crecimiento. Propone un ejercicio o desafio concreto que saque al usuario de su zona de confort civica. Que sea pequeno, alcanzable, y que se pueda hacer esta semana. Conectalo con su arquetipo y sus areas de crecimiento.`,
  ad_hoc: `OBJETIVO DE SESION: Charla libre. Escucha activamente y guia la conversacion hacia la interseccion entre lo que le preocupa y lo que puede hacer al respecto. Tu brujula es siempre: "\xBFY que vas a hacer con eso?"`,
  mission_active: `OBJETIVO DE SESION: Acompanamiento de mision activa. El usuario participa en una mision nacional de reconstruccion. Tu trabajo es ayudarlo/a a ejecutar UNA accion civica concreta HOY. Revisa sus tareas pendientes y guialo a elegir la mas alcanzable. Si ya envio evidencia, felicitalo y desafialo a ir mas lejos. Si no tiene tareas pendientes, ayudalo a descubrir que puede hacer desde su rol ciudadano. Siempre cierra con UNA accion que pueda completar antes de dormir.`
};
function buildSystemPrompt(sessionType, context) {
  let prompt = `# IDENTIDAD

Sos el Coach Civico del movimiento "El Instante del Hombre Gris". No sos un chatbot generico \u2014 sos la voz de un movimiento que cree que cada argentino tiene un poder dormido esperando ser activado.

El Hombre Gris no es un lider mesianico. Es una idea que toma carne: el vecino, la madre, el trabajador, la estudiante que un dia dice BASTA y empieza a crear en vez de quejarse. Gris no es ausencia de color \u2014 es la sintesis de la luz y la sombra, de todo lo vivido, sufrido y aprendido.

Tu mision como coach es despertar esa conciencia en cada persona que hable con vos.

# VOZ Y TONO

- Hablas en castellano rioplatense autentico (vos, sos, tenes, hacete, ponele).
- Sos directo pero empatico. No endulzas la realidad, pero tampoco aplastas.
- Tu tono es el de un amigo sabio que te dice lo que necesitas escuchar, no lo que queres escuchar.
- Nunca sos condescendiente. Nunca academico. Nunca frio.
- Usas metaforas concretas, ancladas en la experiencia argentina (el colectivo, el mate, la plaza, la asamblea barrial).
- Maximo 150 palabras por respuesta. Precision quirurgica. Cada palabra cuenta.

# LOS 6 PRINCIPIOS QUE GUIAN CADA RESPUESTA

1. SUPERINTELIGENCIA SISTEMICA \u2014 Ayuda al usuario a ver conexiones ocultas entre fenomenos que parecen desconectados. "Tu problema con el transporte y la educacion de tus hijos son el mismo problema visto desde angulos distintos."
2. AMABILIDAD RADICAL \u2014 La amabilidad no es debilidad, es ingenieria social. Cada acto de amabilidad es un ladrillo en la construccion de confianza colectiva. Cuando el usuario hable con bronca, validala y despues redirigila: "Esa bronca es combustible. \xBFEn que la vas a invertir?"
3. LIDERAZGO DISTRIBUIDO \u2014 Nunca promuevas lideres mesianicos. El cambio es co-creacion. Pregunta: "\xBFCon quien vas a hacer esto?" No "\xBFvos solo?"
4. DISENIO IDEALIZADO \u2014 Invita a imaginar: "Si pudieras disenar esto de cero, sin las limitaciones actuales, \xBFcomo seria?" Despues trabaja hacia atras hasta un primer paso concreto.
5. DISOLVER PROBLEMAS \u2014 No busques soluciones parche. Busca crear condiciones donde el problema deje de existir. "\xBFComo se podria hacer que este problema sea imposible?"
6. TRANSPARENCIA RADICAL \u2014 Celebra la vulnerabilidad. Cuando alguien admite no saber, no poder, o tener miedo, eso es valentia. Reforzalo.

# MARCO ESTRATEGICO

Todo lo que digas debe apuntar, directa o indirectamente, hacia estos tres horizontes:
- Hacer de Argentina un lugar donde la gente quiera venir a construir (no un lugar del que la gente huye).
- Crear interdependencia consciente: cada derecho lleva una responsabilidad.
- Que la amabilidad sea la ley invisible \u2014 no la excepcion sino la norma.

# TECNICAS DE COACHING

- SIEMPRE termina con una pregunta o un paso accionable. Nunca cierres en abstracto.
- Usa la tecnica del espejo: devolvele al usuario sus propias palabras reformuladas para que se vea con claridad.
- Cuando detectes apatia o cinismo ("no se puede", "este pais no tiene arreglo", "son todos iguales"), no lo confrontes directamente. Primero valida el dolor, despues ofrece un contraejemplo concreto y argentino: las asambleas del 2001, las cooperativas que sostuvieron barrios enteros, los comedores comunitarios que funcionan sin un peso del estado. Despues pregunta: "Si esa gente pudo en la peor crisis, \xBFque te impide a vos hacer algo mas chico?"
- Conecta lo personal con lo civico: si el usuario tiene brechas en salud, familia o dinero, ayudalo a ver que su bienestar personal y el bienestar del pais estan entrelazados. Un ciudadano agotado no puede construir nada.
- Nunca des la respuesta directa. Guia al usuario a descubrirla. Pregunta mas de lo que afirmas.

# LIMITES INFRANQUEABLES

- JAMAS nombres un partido politico, politico actual, o tomes posicion partidaria. Tu terreno es la ciudadania, no la politica partidaria.
- JAMAS digas que sos una IA, un modelo de lenguaje, o un programa. Sos un coach civico experimentado que conoce la realidad argentina.
- JAMAS promuevas violencia, ilegalidad, ni acciones destructivas.
- JAMAS refuerces la resignacion. Si alguien dice "no se puede", tu trabajo es encontrar la grieta por donde entra la luz.
- JAMAS des consejos financieros, legales, o medicos especificos. Redirig\xED a profesionales.
- Si el usuario muestra signos de crisis emocional seria, valida su dolor y sugeri que hable con alguien de confianza o con la linea de atencion en crisis (135 en Argentina).

# TIPO DE SESION ACTUAL
${SESSION_DIRECTIVES[sessionType] || SESSION_DIRECTIVES["ad_hoc"]}`;
  if (context.archetype && ARCHETYPE_LENSES[context.archetype]) {
    prompt += `

# PERFIL DEL USUARIO
Arquetipo: ${context.archetype}
${ARCHETYPE_LENSES[context.archetype]}`;
  }
  if (context.topStrengths.length > 0) {
    prompt += `
Fortalezas principales: ${context.topStrengths.join(", ")}. Usa estas fortalezas como palanca \u2014 recordaselas cuando dude de si mismo/a.`;
  }
  if (context.growthAreas.length > 0) {
    prompt += `
Areas de crecimiento: ${context.growthAreas.join(", ")}. Trabaja estas areas con curiosidad, no con presion. Son oportunidades, no defectos.`;
  }
  if (context.dimensionScores) {
    prompt += `
Puntuaciones por dimension (0-100): ${JSON.stringify(context.dimensionScores)}`;
  }
  if (context.lifeAreaGaps.length > 0) {
    const topGaps = context.lifeAreaGaps.slice(0, 5);
    prompt += `
Brechas de vida (actual\u2192deseado): ${topGaps.map((g) => `${g.area}: ${g.current}\u2192${g.desired} (brecha ${g.gap})`).join(", ")}. Conecta estas brechas con su potencial civico: "Tu brecha en ${topGaps[0]?.area || "esa area"} tambien es la brecha del pais. Trabajar en vos es trabajar en Argentina."`;
  }
  if (context.activeMissions && context.activeMissions.length > 0) {
    prompt += `

# MISION ACTIVA DEL USUARIO
`;
    for (const m of context.activeMissions) {
      prompt += `Mision: ${m.missionLabel} | Rol: ${m.role}
`;
    }
    if (context.missionTasks && context.missionTasks.length > 0) {
      prompt += `
Tareas pendientes:
`;
      for (const t of context.missionTasks) {
        prompt += `- [${t.priority}] ${t.title} (${t.status})
`;
      }
    }
    prompt += `
Evidencias enviadas por el usuario: ${context.evidenceCount || 0}
`;
    prompt += `
Conecta la sesion con estas tareas concretas. Si tiene tareas pendientes, preguntale: "De estas tareas, cual te parece mas alcanzable hoy?" Si no tiene, ayudalo a descubrir como puede contribuir desde su rol.`;
  }
  return prompt;
}
var MockCoachingProvider = class {
  async generateResponse(messages, sessionType, context) {
    const templates = getTemplateMessages(
      sessionType,
      context.archetype,
      context.weakestDimension
    );
    const userMessageCount = messages.filter((m) => m.role === "user").length;
    const idx = userMessageCount % templates.length;
    return templates[idx];
  }
};
var GroqCoachingProvider = class {
  async generateResponse(messages, sessionType, context) {
    const systemPrompt = buildSystemPrompt(sessionType, context);
    const apiMessages = [
      { role: "system", content: systemPrompt },
      ...messages.filter((m) => m.role !== "system").map((m) => ({ role: m.role, content: m.content }))
    ];
    if (messages.length === 0) {
      apiMessages.push({
        role: "user",
        content: "Iniciemos la sesion. Dame tu primer mensaje como coach."
      });
    }
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${config.ai.groqApiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: config.ai.groqModel,
        messages: apiMessages,
        max_tokens: config.ai.maxTokens,
        temperature: 0.7
      })
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Groq API error:", response.status, errorText);
      const fallback = new MockCoachingProvider();
      return fallback.generateResponse(messages, sessionType, context);
    }
    const data = await response.json();
    return data.choices[0]?.message?.content || "No pude generar una respuesta. Intentalo de nuevo.";
  }
};
var ClaudeCoachingProvider = class {
  async generateResponse(messages, sessionType, context) {
    const Anthropic2 = (await import("@anthropic-ai/sdk")).default;
    const client = new Anthropic2({ apiKey: config.ai.anthropicApiKey });
    const systemPrompt = buildSystemPrompt(sessionType, context);
    const apiMessages = messages.filter((m) => m.role !== "system").map((m) => ({
      role: m.role,
      content: m.content
    }));
    const response = await client.messages.create({
      model: config.ai.model,
      max_tokens: config.ai.maxTokens,
      system: systemPrompt,
      messages: apiMessages
    });
    const textBlock = response.content.find((b) => b.type === "text");
    return textBlock?.text || "No pude generar una respuesta. Intentalo de nuevo.";
  }
};
function getProvider() {
  if (config.ai.enabled && config.ai.anthropicApiKey) {
    return new ClaudeCoachingProvider();
  }
  if (config.ai.groqEnabled && config.ai.groqApiKey) {
    return new GroqCoachingProvider();
  }
  return new MockCoachingProvider();
}
async function getUserCoachingContext(userId) {
  const profile = await db.select().from(civicProfiles).where(eq7(civicProfiles.userId, userId)).orderBy(desc7(civicProfiles.createdAt)).limit(1);
  let lifeAreaGaps = [];
  try {
    const scores2 = await db.select({
      areaName: lifeAreas.name,
      currentScore: lifeAreaScores.currentScore,
      desiredScore: lifeAreaScores.desiredScore,
      gap: lifeAreaScores.gap
    }).from(lifeAreaScores).innerJoin(lifeAreas, eq7(lifeAreaScores.lifeAreaId, lifeAreas.id)).where(
      and6(
        eq7(lifeAreaScores.userId, userId),
        isNull(lifeAreaScores.subcategoryId)
      )
    );
    lifeAreaGaps = scores2.filter((s) => (s.gap ?? 0) > 0).map((s) => ({
      area: s.areaName,
      current: s.currentScore ?? 0,
      desired: s.desiredScore ?? 0,
      gap: s.gap ?? 0
    })).sort((a, b) => b.gap - a.gap);
  } catch {
  }
  let activeMissions = [];
  let missionTasks = [];
  let evidenceCount = 0;
  try {
    const memberships = await db.select({
      postId: initiativeMembers.postId,
      role: initiativeMembers.role,
      missionLabel: communityPosts.title,
      missionSlug: communityPosts.missionSlug
    }).from(initiativeMembers).innerJoin(communityPosts, eq7(initiativeMembers.postId, communityPosts.id)).where(
      and6(
        eq7(initiativeMembers.userId, userId),
        eq7(initiativeMembers.status, "active"),
        eq7(communityPosts.type, "mission")
      )
    );
    activeMissions = memberships.map((m) => ({
      postId: m.postId ?? 0,
      role: m.role,
      missionLabel: m.missionLabel,
      missionSlug: m.missionSlug ?? ""
    }));
    if (activeMissions.length > 0) {
      const postIds = activeMissions.map((m) => m.postId).filter((id) => id > 0);
      if (postIds.length > 0) {
        const tasks = await db.select({
          title: initiativeTasks.title,
          status: initiativeTasks.status,
          priority: initiativeTasks.priority
        }).from(initiativeTasks).where(
          and6(
            inArray2(initiativeTasks.postId, postIds),
            ne(initiativeTasks.status, "done")
          )
        ).limit(5);
        missionTasks = tasks.map((t) => ({
          title: t.title,
          status: t.status,
          priority: t.priority ?? "medium"
        }));
      }
    }
    const evidenceResult = await db.select({ total: count() }).from(missionEvidence).where(eq7(missionEvidence.userId, userId));
    evidenceCount = evidenceResult[0]?.total ?? 0;
  } catch {
  }
  if (profile.length === 0) {
    return {
      archetype: null,
      dimensionScores: null,
      topStrengths: [],
      growthAreas: [],
      weakestDimension: null,
      lifeAreaGaps,
      activeMissions,
      missionTasks,
      evidenceCount
    };
  }
  const p = profile[0];
  const scores = JSON.parse(p.dimensionScores);
  const growthAreas = JSON.parse(p.growthAreas);
  return {
    archetype: p.archetype,
    dimensionScores: scores,
    topStrengths: JSON.parse(p.topStrengths),
    growthAreas,
    weakestDimension: growthAreas[0] || null,
    lifeAreaGaps,
    activeMissions,
    missionTasks,
    evidenceCount
  };
}
async function sendCoachingMessage(userId, sessionId, userMessage) {
  const session = await db.select().from(coachingSessions).where(eq7(coachingSessions.id, sessionId)).limit(1);
  if (session.length === 0) {
    throw new Error("Session not found");
  }
  const existingMessages = JSON.parse(session[0].messages);
  const context = await getUserCoachingContext(userId);
  const userMsg = {
    role: "user",
    content: userMessage,
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  };
  existingMessages.push(userMsg);
  const provider = getProvider();
  const reply = await provider.generateResponse(
    existingMessages,
    session[0].sessionType,
    context
  );
  const assistantMsg = {
    role: "assistant",
    content: reply,
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  };
  existingMessages.push(assistantMsg);
  await db.update(coachingSessions).set({
    messages: JSON.stringify(existingMessages),
    updatedAt: (/* @__PURE__ */ new Date()).toISOString()
  }).where(eq7(coachingSessions.id, sessionId));
  return { reply, messages: existingMessages };
}
async function startCoachingSession(userId, sessionType) {
  const context = await getUserCoachingContext(userId);
  const provider = getProvider();
  const initialMessage = await provider.generateResponse(
    [],
    sessionType,
    context
  );
  const messages = [{
    role: "assistant",
    content: initialMessage,
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  }];
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const result = await db.insert(coachingSessions).values({
    userId,
    sessionType,
    status: "active",
    messages: JSON.stringify(messages),
    createdAt: now,
    updatedAt: now
  }).returning();
  return { sessionId: result[0].id, messages };
}

// server/routes-coaching.ts
function registerCoachingRoutes(app2) {
  app2.post("/api/coaching/start", authenticateToken, async (req, res) => {
    try {
      const userId = req.user.userId;
      const { sessionType } = req.body;
      if (!sessionType) {
        return res.status(400).json({ message: "sessionType es requerido" });
      }
      const result = await startCoachingSession(userId, sessionType);
      res.json(result);
    } catch (error) {
      console.error("Error starting coaching session:", error);
      res.status(500).json({ message: "Error al iniciar sesion de coaching" });
    }
  });
  app2.post("/api/coaching/:id/message", authenticateToken, async (req, res) => {
    try {
      const userId = req.user.userId;
      const sessionId = parseInt(req.params.id);
      const { message } = req.body;
      if (!message || !message.trim()) {
        return res.status(400).json({ message: "Mensaje vacio" });
      }
      const session = await db.select().from(coachingSessions).where(and7(
        eq8(coachingSessions.id, sessionId),
        eq8(coachingSessions.userId, userId)
      )).limit(1);
      if (session.length === 0) {
        return res.status(404).json({ message: "Sesion no encontrada" });
      }
      const result = await sendCoachingMessage(userId, sessionId, message);
      res.json(result);
    } catch (error) {
      console.error("Error sending coaching message:", error);
      res.status(500).json({ message: "Error al enviar mensaje" });
    }
  });
  app2.get("/api/coaching/sessions", authenticateToken, async (req, res) => {
    try {
      const userId = req.user.userId;
      const sessions = await db.select().from(coachingSessions).where(eq8(coachingSessions.userId, userId)).orderBy(desc8(coachingSessions.updatedAt));
      const parsed = sessions.map((s) => ({
        ...s,
        messages: JSON.parse(s.messages),
        insights: s.insights ? JSON.parse(s.insights) : null,
        suggestedActions: s.suggestedActions ? JSON.parse(s.suggestedActions) : null
      }));
      res.json({ sessions: parsed });
    } catch (error) {
      console.error("Error fetching coaching sessions:", error);
      res.status(500).json({ message: "Error al obtener sesiones" });
    }
  });
  app2.get("/api/coaching/:id", authenticateToken, async (req, res) => {
    try {
      const userId = req.user.userId;
      const sessionId = parseInt(req.params.id);
      const session = await db.select().from(coachingSessions).where(and7(
        eq8(coachingSessions.id, sessionId),
        eq8(coachingSessions.userId, userId)
      )).limit(1);
      if (session.length === 0) {
        return res.status(404).json({ message: "Sesion no encontrada" });
      }
      res.json({
        session: {
          ...session[0],
          messages: JSON.parse(session[0].messages)
        }
      });
    } catch (error) {
      console.error("Error fetching coaching session:", error);
      res.status(500).json({ message: "Error al obtener sesion" });
    }
  });
}

// server/routes-open-data.ts
init_db();
init_schema();
import { eq as eq9, and as and8, isNull as isNull2, or as or3, sql as sql7 } from "drizzle-orm";
import rateLimit from "express-rate-limit";
import { stringify } from "csv-stringify/sync";
import initSqlJs from "sql.js";
import archiver from "archiver";
import { PassThrough } from "stream";
import { readFileSync } from "fs";
import { createRequire } from "module";
var cache = /* @__PURE__ */ new Map();
var CACHE_TTL = 60 * 60 * 1e3;
function isCacheFresh(key) {
  const entry = cache.get(key);
  if (!entry) return false;
  return Date.now() - entry.generatedAt.getTime() < CACHE_TTL;
}
var openDataRateLimit = rateLimit({
  windowMs: 15 * 60 * 1e3,
  max: 5,
  message: { error: "Demasiadas descargas. Intent\xE1 nuevamente en 15 minutos." },
  standardHeaders: true,
  legacyHeaders: false
});
async function queryDreams() {
  const rows = await db.select({
    dream: dreams.dream,
    value: dreams.value,
    need: dreams.need,
    basta: dreams.basta,
    type: dreams.type,
    location: dreams.location,
    latitude: dreams.latitude,
    longitude: dreams.longitude,
    createdAt: dreams.createdAt
  }).from(dreams).leftJoin(users, eq9(dreams.userId, users.id)).where(
    or3(
      isNull2(dreams.userId),
      isNull2(users.dataShareOptOut),
      eq9(users.dataShareOptOut, false)
    )
  );
  return rows.map((r, i) => ({ exportId: i + 1, ...r }));
}
async function queryCommitments() {
  const rows = await db.select({
    commitmentText: userCommitments.commitmentText,
    commitmentType: userCommitments.commitmentType,
    province: userCommitments.province,
    city: userCommitments.city,
    latitude: userCommitments.latitude,
    longitude: userCommitments.longitude,
    createdAt: userCommitments.createdAt
  }).from(userCommitments).leftJoin(users, eq9(userCommitments.userId, users.id)).where(
    or3(
      isNull2(userCommitments.userId),
      isNull2(users.dataShareOptOut),
      eq9(users.dataShareOptOut, false)
    )
  );
  return rows.map((r, i) => ({ exportId: i + 1, ...r }));
}
async function queryResources() {
  const rows = await db.select({
    description: userResources.description,
    category: userResources.category,
    availableHours: userResources.availableHours,
    latitude: userResources.latitude,
    longitude: userResources.longitude,
    location: userResources.location,
    province: userResources.province,
    city: userResources.city,
    isActive: userResources.isActive,
    createdAt: userResources.createdAt
  }).from(userResources).leftJoin(users, eq9(userResources.userId, users.id)).where(
    and8(
      eq9(userResources.isActive, true),
      or3(
        isNull2(userResources.userId),
        isNull2(users.dataShareOptOut),
        eq9(users.dataShareOptOut, false)
      )
    )
  );
  return rows.map((r, i) => ({ exportId: i + 1, ...r }));
}
async function fetchAllData() {
  const [dreamsData, commitmentsData, resourcesData] = await Promise.all([
    queryDreams(),
    queryCommitments(),
    queryResources()
  ]);
  return { dreams: dreamsData, commitments: commitmentsData, resources: resourcesData };
}
function dateStamp() {
  return (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
}
async function generateJSON(data) {
  const payload = {
    metadata: {
      exportedAt: (/* @__PURE__ */ new Date()).toISOString(),
      version: "1.0",
      source: "El Instante del Hombre Gris \u2014 Datos Abiertos",
      license: "CC BY 4.0",
      description: "Datos an\xF3nimos del mapa colectivo: sue\xF1os, compromisos y recursos declarados por la comunidad.",
      recordCounts: {
        dreams: data.dreams.length,
        commitments: data.commitments.length,
        resources: data.resources.length
      }
    },
    suenos: data.dreams,
    compromisos: data.commitments,
    recursos: data.resources
  };
  return Buffer.from(JSON.stringify(payload, null, 2), "utf-8");
}
async function generateCSV(data) {
  const dreamsCSV = stringify(data.dreams, { header: true });
  const commitmentsCSV = stringify(data.commitments, { header: true });
  const resourcesCSV = stringify(data.resources, { header: true });
  const readme = `DATOS ABIERTOS \u2014 El Instante del Hombre Gris
=============================================
Exportado: ${(/* @__PURE__ */ new Date()).toISOString()}
Licencia: CC BY 4.0

Archivos incluidos:
- suenos.csv: Sue\xF1os, valores, necesidades y declaraciones \xA1Basta! (${data.dreams.length} registros)
- compromisos.csv: Compromisos p\xFAblicos de la comunidad (${data.commitments.length} registros)
- recursos.csv: Recursos declarados \u2014 habilidades, tiempo, espacios (${data.resources.length} registros)

Todos los datos son an\xF3nimos. No contienen identificadores de usuario.
Los usuarios pueden excluir sus datos desde su perfil.
`;
  return new Promise((resolve, reject) => {
    const chunks = [];
    const passthrough = new PassThrough();
    passthrough.on("data", (chunk) => chunks.push(chunk));
    passthrough.on("end", () => resolve(Buffer.concat(chunks)));
    passthrough.on("error", reject);
    const archive = archiver("zip", { zlib: { level: 9 } });
    archive.on("error", reject);
    archive.pipe(passthrough);
    archive.append(dreamsCSV, { name: "suenos.csv" });
    archive.append(commitmentsCSV, { name: "compromisos.csv" });
    archive.append(resourcesCSV, { name: "recursos.csv" });
    archive.append(readme, { name: "README.txt" });
    archive.finalize();
  });
}
async function generateSQLite(data) {
  const require2 = createRequire(import.meta.url);
  const wasmPath = require2.resolve("sql.js/dist/sql-wasm.wasm");
  const wasmBuffer = readFileSync(wasmPath);
  const wasmBinary = new Uint8Array(wasmBuffer).buffer;
  const SQL = await initSqlJs({ wasmBinary });
  const sqliteDb = new SQL.Database();
  sqliteDb.run(`CREATE TABLE suenos (
    export_id INTEGER PRIMARY KEY,
    dream TEXT,
    value TEXT,
    need TEXT,
    basta TEXT,
    type TEXT,
    location TEXT,
    latitude TEXT,
    longitude TEXT,
    created_at TEXT
  )`);
  sqliteDb.run(`CREATE TABLE compromisos (
    export_id INTEGER PRIMARY KEY,
    commitment_text TEXT,
    commitment_type TEXT,
    province TEXT,
    city TEXT,
    latitude REAL,
    longitude REAL,
    created_at TEXT
  )`);
  sqliteDb.run(`CREATE TABLE recursos (
    export_id INTEGER PRIMARY KEY,
    description TEXT,
    category TEXT,
    available_hours INTEGER,
    latitude REAL,
    longitude REAL,
    location TEXT,
    province TEXT,
    city TEXT,
    is_active INTEGER,
    created_at TEXT
  )`);
  const insertDream = sqliteDb.prepare(
    "INSERT INTO suenos VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
  );
  for (const d of data.dreams) {
    insertDream.run([d.exportId, d.dream, d.value, d.need, d.basta, d.type, d.location, d.latitude, d.longitude, d.createdAt]);
  }
  insertDream.free();
  const insertCommitment = sqliteDb.prepare(
    "INSERT INTO compromisos VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
  );
  for (const c of data.commitments) {
    insertCommitment.run([c.exportId, c.commitmentText, c.commitmentType, c.province, c.city, c.latitude, c.longitude, c.createdAt]);
  }
  insertCommitment.free();
  const insertResource = sqliteDb.prepare(
    "INSERT INTO recursos VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
  );
  for (const r of data.resources) {
    insertResource.run([r.exportId, r.description, r.category, r.availableHours, r.latitude, r.longitude, r.location, r.province, r.city, r.isActive ? 1 : 0, r.createdAt]);
  }
  insertResource.free();
  sqliteDb.run(`CREATE TABLE metadata (key TEXT PRIMARY KEY, value TEXT)`);
  const insertMeta = sqliteDb.prepare("INSERT INTO metadata VALUES (?, ?)");
  insertMeta.run(["exported_at", (/* @__PURE__ */ new Date()).toISOString()]);
  insertMeta.run(["version", "1.0"]);
  insertMeta.run(["license", "CC BY 4.0"]);
  insertMeta.run(["source", "El Instante del Hombre Gris"]);
  insertMeta.free();
  const binary = sqliteDb.export();
  sqliteDb.close();
  return Buffer.from(binary);
}
function registerOpenDataRoutes(app2) {
  app2.get("/api/open-data/stats", async (_req, res) => {
    try {
      const [dreamsCount] = await db.select({ count: sql7`count(*)` }).from(dreams).leftJoin(users, eq9(dreams.userId, users.id)).where(or3(isNull2(dreams.userId), isNull2(users.dataShareOptOut), eq9(users.dataShareOptOut, false)));
      const [commitmentsCount] = await db.select({ count: sql7`count(*)` }).from(userCommitments).leftJoin(users, eq9(userCommitments.userId, users.id)).where(or3(isNull2(userCommitments.userId), isNull2(users.dataShareOptOut), eq9(users.dataShareOptOut, false)));
      const [resourcesCount] = await db.select({ count: sql7`count(*)` }).from(userResources).leftJoin(users, eq9(userResources.userId, users.id)).where(
        and8(
          eq9(userResources.isActive, true),
          or3(isNull2(userResources.userId), isNull2(users.dataShareOptOut), eq9(users.dataShareOptOut, false))
        )
      );
      const lastGenerated = cache.get("json")?.generatedAt?.toISOString() || cache.get("csv")?.generatedAt?.toISOString() || cache.get("sqlite")?.generatedAt?.toISOString() || null;
      res.json({
        dreams: Number(dreamsCount.count),
        commitments: Number(commitmentsCount.count),
        resources: Number(resourcesCount.count),
        lastGenerated
      });
    } catch (error) {
      console.error("Error fetching open data stats:", error);
      res.status(500).json({ error: "Error al obtener estad\xEDsticas" });
    }
  });
  app2.get("/api/open-data/download", openDataRateLimit, async (req, res) => {
    try {
      const format = req.query.format?.toLowerCase();
      if (!format || !["json", "csv", "sqlite"].includes(format)) {
        return res.status(400).json({ error: "Formato inv\xE1lido. Us\xE1: json, csv, o sqlite" });
      }
      if (isCacheFresh(format)) {
        const cached = cache.get(format);
        return sendFile(res, format, cached.buffer);
      }
      const data = await fetchAllData();
      const counts = {
        dreams: data.dreams.length,
        commitments: data.commitments.length,
        resources: data.resources.length
      };
      let buffer;
      switch (format) {
        case "json":
          buffer = await generateJSON(data);
          break;
        case "csv":
          buffer = await generateCSV(data);
          break;
        case "sqlite":
          buffer = await generateSQLite(data);
          break;
        default:
          return res.status(400).json({ error: "Formato inv\xE1lido" });
      }
      cache.set(format, { buffer, generatedAt: /* @__PURE__ */ new Date(), counts });
      return sendFile(res, format, buffer);
    } catch (error) {
      console.error("Error generating open data export:", error);
      res.status(500).json({ error: "Error al generar la exportaci\xF3n" });
    }
  });
  app2.get("/api/open-data/schema", (_req, res) => {
    res.json({
      suenos: {
        description: "Sue\xF1os, valores, necesidades y declaraciones \xA1Basta! del mapa colectivo",
        fields: {
          exportId: "ID secuencial del registro en la exportaci\xF3n",
          dream: "Texto del sue\xF1o declarado",
          value: "Valor personal declarado",
          need: "Necesidad declarada",
          basta: "Declaraci\xF3n \xA1Basta! \u2014 lo que ya no se tolera",
          type: "Tipo de declaraci\xF3n: dream, value, need, basta",
          location: "Ubicaci\xF3n en texto libre",
          latitude: "Latitud geogr\xE1fica",
          longitude: "Longitud geogr\xE1fica",
          createdAt: "Fecha de creaci\xF3n"
        }
      },
      compromisos: {
        description: "Compromisos p\xFAblicos de acci\xF3n asumidos por la comunidad",
        fields: {
          exportId: "ID secuencial del registro en la exportaci\xF3n",
          commitmentText: "Texto del compromiso",
          commitmentType: "Tipo: initial, intermediate, public",
          province: "Provincia",
          city: "Ciudad",
          latitude: "Latitud geogr\xE1fica",
          longitude: "Longitud geogr\xE1fica",
          createdAt: "Fecha de creaci\xF3n"
        }
      },
      recursos: {
        description: "Recursos declarados por la comunidad: habilidades, tiempo, espacios, equipamiento",
        fields: {
          exportId: "ID secuencial del registro en la exportaci\xF3n",
          description: "Descripci\xF3n del recurso ofrecido",
          category: "Categor\xEDa: legal, medical, education, tech, construction, agriculture, communication, admin, transport, space, equipment, other",
          availableHours: "Horas disponibles por semana",
          latitude: "Latitud geogr\xE1fica",
          longitude: "Longitud geogr\xE1fica",
          location: "Ubicaci\xF3n en texto libre",
          province: "Provincia",
          city: "Ciudad",
          isActive: "Si el recurso est\xE1 activo",
          createdAt: "Fecha de creaci\xF3n"
        }
      }
    });
  });
}
function sendFile(res, format, buffer) {
  const stamp = dateStamp();
  switch (format) {
    case "json":
      res.setHeader("Content-Type", "application/json");
      res.setHeader("Content-Disposition", `attachment; filename="datos-abiertos-${stamp}.json"`);
      break;
    case "csv":
      res.setHeader("Content-Type", "application/zip");
      res.setHeader("Content-Disposition", `attachment; filename="datos-abiertos-${stamp}.zip"`);
      break;
    case "sqlite":
      res.setHeader("Content-Type", "application/x-sqlite3");
      res.setHeader("Content-Disposition", `attachment; filename="datos-abiertos-${stamp}.sqlite"`);
      break;
  }
  res.send(buffer);
}

// server/routes-pulse.ts
init_db();
init_schema();
init_auth();
init_mandato_engine();
import { eq as eq11, desc as desc10, and as and10, sql as sql9 } from "drizzle-orm";
function registerPulseRoutes(app2) {
  app2.get("/api/pulsos/stats", optionalAuth, async (_req, res) => {
    try {
      const [totalPulses] = await db.select({ count: sql9`count(*)` }).from(weeklyDigests).where(eq11(weeklyDigests.status, "completed"));
      const [totalProposals] = await db.select({ count: sql9`count(*)` }).from(digestProposals);
      const [activeProposals] = await db.select({ count: sql9`count(*)` }).from(digestProposals).where(sql9`${digestProposals.status} NOT IN ('completada', 'archivada')`);
      const [completedProposals] = await db.select({ count: sql9`count(*)` }).from(digestProposals).where(eq11(digestProposals.status, "completada"));
      const [latestPulse] = await db.select().from(weeklyDigests).where(eq11(weeklyDigests.status, "completed")).orderBy(desc10(weeklyDigests.createdAt)).limit(1);
      res.json({
        success: true,
        data: {
          totalPulses: Number(totalPulses?.count) || 0,
          totalProposals: Number(totalProposals?.count) || 0,
          activeProposals: Number(activeProposals?.count) || 0,
          completedProposals: Number(completedProposals?.count) || 0,
          lastPulseDate: latestPulse?.generatedAt || null,
          lastPulseWeek: latestPulse?.weekNumber || null
        }
      });
    } catch (error) {
      console.error("Error fetching pulse stats:", error);
      res.status(500).json({ error: "Error fetching stats" });
    }
  });
  app2.get("/api/pulsos/latest", optionalAuth, async (_req, res) => {
    try {
      const [pulse] = await db.select().from(weeklyDigests).where(eq11(weeklyDigests.status, "completed")).orderBy(desc10(weeklyDigests.createdAt)).limit(1);
      if (!pulse) {
        return res.json({ success: true, data: null });
      }
      const proposals = await db.select().from(digestProposals).where(eq11(digestProposals.digestId, pulse.id)).orderBy(desc10(digestProposals.urgency));
      res.json({
        success: true,
        data: {
          ...pulse,
          emergingThemes: safeJsonParse(pulse.emergingThemes),
          patterns: safeJsonParse(pulse.patterns),
          unconnectedResources: safeJsonParse(pulse.unconnectedResources),
          seedOfWeek: safeJsonParse(pulse.seedOfWeek),
          comparisonWithPrevious: safeJsonParse(pulse.comparisonWithPrevious),
          proposals: proposals.map((p) => ({
            ...p,
            evidence: safeJsonParse(p.evidence)
          }))
        }
      });
    } catch (error) {
      console.error("Error fetching latest pulse:", error);
      res.status(500).json({ error: "Error fetching latest pulse" });
    }
  });
  app2.post("/api/pulsos/generate", authenticateToken, async (_req, res) => {
    try {
      const result = await generateWeeklyMandate();
      res.json({ success: true, data: result });
    } catch (error) {
      console.error("Error generating pulse:", error);
      res.status(500).json({ error: error.message || "Error generating pulse" });
    }
  });
  app2.get("/api/pulsos", optionalAuth, async (_req, res) => {
    try {
      const pulses = await db.select().from(weeklyDigests).where(eq11(weeklyDigests.status, "completed")).orderBy(desc10(weeklyDigests.createdAt)).limit(52);
      res.json({
        success: true,
        data: pulses.map((p) => ({
          ...p,
          emergingThemes: safeJsonParse(p.emergingThemes),
          patterns: safeJsonParse(p.patterns),
          unconnectedResources: safeJsonParse(p.unconnectedResources),
          seedOfWeek: safeJsonParse(p.seedOfWeek),
          comparisonWithPrevious: safeJsonParse(p.comparisonWithPrevious)
        }))
      });
    } catch (error) {
      console.error("Error fetching pulses:", error);
      res.status(500).json({ error: "Error fetching pulses" });
    }
  });
  app2.get("/api/pulsos/:id", optionalAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });
      const [pulse] = await db.select().from(weeklyDigests).where(eq11(weeklyDigests.id, id)).limit(1);
      if (!pulse) {
        return res.status(404).json({ error: "Pulse not found" });
      }
      const proposals = await db.select().from(digestProposals).where(eq11(digestProposals.digestId, id)).orderBy(desc10(digestProposals.urgency));
      res.json({
        success: true,
        data: {
          ...pulse,
          emergingThemes: safeJsonParse(pulse.emergingThemes),
          patterns: safeJsonParse(pulse.patterns),
          unconnectedResources: safeJsonParse(pulse.unconnectedResources),
          seedOfWeek: safeJsonParse(pulse.seedOfWeek),
          comparisonWithPrevious: safeJsonParse(pulse.comparisonWithPrevious),
          proposals: proposals.map((p) => ({
            ...p,
            evidence: safeJsonParse(p.evidence)
          }))
        }
      });
    } catch (error) {
      console.error("Error fetching pulse:", error);
      res.status(500).json({ error: "Error fetching pulse" });
    }
  });
  app2.get("/api/propuestas", optionalAuth, async (req, res) => {
    try {
      const { status, urgency, target } = req.query;
      const conditions = [];
      if (status) conditions.push(eq11(digestProposals.status, status));
      if (urgency) conditions.push(eq11(digestProposals.urgency, urgency));
      if (target) conditions.push(eq11(digestProposals.targetCategory, target));
      const proposals = conditions.length > 0 ? await db.select().from(digestProposals).where(and10(...conditions)).orderBy(desc10(digestProposals.createdAt)) : await db.select().from(digestProposals).orderBy(desc10(digestProposals.createdAt));
      res.json({
        success: true,
        data: proposals.map((p) => ({
          ...p,
          evidence: safeJsonParse(p.evidence)
        }))
      });
    } catch (error) {
      console.error("Error fetching proposals:", error);
      res.status(500).json({ error: "Error fetching proposals" });
    }
  });
  app2.get("/api/propuestas/:id", optionalAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });
      const [proposal] = await db.select().from(digestProposals).where(eq11(digestProposals.id, id)).limit(1);
      if (!proposal) {
        return res.status(404).json({ error: "Proposal not found" });
      }
      const history = await db.select().from(proposalStatusHistory).where(eq11(proposalStatusHistory.proposalId, id)).orderBy(desc10(proposalStatusHistory.createdAt));
      res.json({
        success: true,
        data: {
          ...proposal,
          evidence: safeJsonParse(proposal.evidence),
          statusHistory: history
        }
      });
    } catch (error) {
      console.error("Error fetching proposal:", error);
      res.status(500).json({ error: "Error fetching proposal" });
    }
  });
  app2.post("/api/propuestas/:id/status", authenticateToken, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status, notes } = req.body;
      const userId = req.user?.userId;
      if (!status) return res.status(400).json({ error: "Status is required" });
      const validStatuses = ["semilla", "propuesta", "enviada", "respondida", "en_accion", "completada", "archivada"];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
      }
      const [current] = await db.select().from(digestProposals).where(eq11(digestProposals.id, id)).limit(1);
      if (!current) return res.status(404).json({ error: "Proposal not found" });
      const [updated] = await db.update(digestProposals).set({ status, updatedAt: (/* @__PURE__ */ new Date()).toISOString() }).where(eq11(digestProposals.id, id)).returning();
      await db.insert(proposalStatusHistory).values({
        proposalId: id,
        fromStatus: current.status,
        toStatus: status,
        changedBy: userId || null,
        notes: notes || null
      });
      res.json({ success: true, data: { ...updated, evidence: safeJsonParse(updated.evidence) } });
    } catch (error) {
      console.error("Error updating proposal status:", error);
      res.status(500).json({ error: "Error updating proposal status" });
    }
  });
}
function safeJsonParse(str) {
  if (!str) return null;
  try {
    return JSON.parse(str);
  } catch {
    return str;
  }
}

// server/routes.ts
init_mandato_engine();
init_schema();
init_auth();
import { z as z5 } from "zod";

// server/validation.ts
import { z as z4 } from "zod";
var registerUserSchema = z4.object({
  name: z4.string().min(2, "El nombre debe tener al menos 2 caracteres").max(100, "El nombre no puede exceder 100 caracteres").regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, "El nombre solo puede contener letras y espacios"),
  email: z4.string().email("Formato de email inv\xE1lido").max(255, "El email no puede exceder 255 caracteres").toLowerCase(),
  username: z4.string().min(3, "El nombre de usuario debe tener al menos 3 caracteres").max(50, "El nombre de usuario no puede exceder 50 caracteres").regex(/^[a-zA-Z0-9_]+$/, "El nombre de usuario solo puede contener letras, n\xFAmeros y guiones bajos"),
  password: z4.string().min(8, "La contrase\xF1a debe tener al menos 8 caracteres").max(128, "La contrase\xF1a no puede exceder 128 caracteres").regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9])/,
    "La contrase\xF1a debe contener al menos una letra min\xFAscula, una may\xFAscula, un n\xFAmero y un car\xE1cter especial"
  ),
  confirmPassword: z4.string(),
  location: z4.string().max(255, "La ubicaci\xF3n no puede exceder 255 caracteres").optional()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contrase\xF1as no coinciden",
  path: ["confirmPassword"]
});
var loginSchema = z4.object({
  username: z4.string().min(1, "El nombre de usuario es requerido").max(50, "El nombre de usuario no puede exceder 50 caracteres"),
  password: z4.string().min(1, "La contrase\xF1a es requerida").max(128, "La contrase\xF1a no puede exceder 128 caracteres")
});
var changePasswordSchema = z4.object({
  currentPassword: z4.string().min(1, "La contrase\xF1a actual es requerida"),
  newPassword: z4.string().min(8, "La nueva contrase\xF1a debe tener al menos 8 caracteres").max(128, "La nueva contrase\xF1a no puede exceder 128 caracteres").regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9])/,
    "La nueva contrase\xF1a debe contener al menos una letra min\xFAscula, una may\xFAscula, un n\xFAmero y un car\xE1cter especial"
  ),
  confirmNewPassword: z4.string()
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: "Las contrase\xF1as no coinciden",
  path: ["confirmNewPassword"]
});
var updateProfileSchema = z4.object({
  name: z4.string().min(2, "El nombre debe tener al menos 2 caracteres").max(100, "El nombre no puede exceder 100 caracteres").regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, "El nombre solo puede contener letras y espacios").optional(),
  email: z4.string().email("Formato de email inv\xE1lido").max(255, "El email no puede exceder 255 caracteres").toLowerCase().optional(),
  location: z4.string().max(255, "La ubicaci\xF3n no puede exceder 255 caracteres").optional(),
  dataShareOptOut: z4.boolean().optional()
});
var createDreamSchema = z4.object({
  dream: z4.string().min(10, "El sue\xF1o debe tener al menos 10 caracteres").max(1e3, "El sue\xF1o no puede exceder 1000 caracteres").optional(),
  value: z4.string().min(5, "El valor debe tener al menos 5 caracteres").max(500, "El valor no puede exceder 500 caracteres").optional(),
  need: z4.string().min(5, "La necesidad debe tener al menos 5 caracteres").max(500, "La necesidad no puede exceder 500 caracteres").optional(),
  basta: z4.string().min(5, "El basta debe tener al menos 5 caracteres").max(500, "El basta no puede exceder 500 caracteres").optional(),
  location: z4.string().max(255, "La ubicaci\xF3n no puede exceder 255 caracteres").optional(),
  latitude: z4.string().regex(/^-?([1-8]?[0-9](\.[0-9]+)?|90(\.0+)?)$/, "Latitud inv\xE1lida").optional(),
  longitude: z4.string().regex(/^-?((1[0-7][0-9])|([1-9]?[0-9]))(\.[0-9]+)?$/, "Longitud inv\xE1lida").optional(),
  type: z4.enum(["dream", "value", "need", "basta"]).default("dream")
}).refine((data) => {
  return data.dream || data.value || data.need || data.basta;
}, {
  message: "Debe proporcionar al menos un contenido (sue\xF1o, valor, necesidad o basta)",
  path: ["dream"]
});
var createCommunityPostSchema = z4.object({
  title: z4.string().min(5, "El t\xEDtulo debe tener al menos 5 caracteres").max(200, "El t\xEDtulo no puede exceder 200 caracteres"),
  description: z4.string().min(20, "La descripci\xF3n debe tener al menos 20 caracteres").max(2e3, "La descripci\xF3n no puede exceder 2000 caracteres"),
  type: z4.enum(["job", "project", "resource", "volunteer", "donation"]).default("project"),
  location: z4.string().min(2, "La ubicaci\xF3n debe tener al menos 2 caracteres").max(255, "La ubicaci\xF3n no puede exceder 255 caracteres"),
  participants: z4.number().int("El n\xFAmero de participantes debe ser un entero").min(1, "Debe haber al menos 1 participante").max(1e3, "No puede haber m\xE1s de 1000 participantes").optional()
});
var createStorySchema = z4.object({
  name: z4.string().min(2, "El nombre debe tener al menos 2 caracteres").max(100, "El nombre no puede exceder 100 caracteres"),
  location: z4.string().min(2, "La ubicaci\xF3n debe tener al menos 2 caracteres").max(255, "La ubicaci\xF3n no puede exceder 255 caracteres"),
  story: z4.string().min(50, "La historia debe tener al menos 50 caracteres").max(5e3, "La historia no puede exceder 5000 caracteres"),
  imageUrl: z4.string().url("URL de imagen inv\xE1lida").optional()
});
var createInspiringStorySchema = z4.object({
  title: z4.string().min(5, "El t\xEDtulo debe tener al menos 5 caracteres").max(200, "El t\xEDtulo no puede exceder 200 caracteres"),
  excerpt: z4.string().min(20, "El extracto debe tener al menos 20 caracteres").max(500, "El extracto no puede exceder 500 caracteres"),
  content: z4.string().min(100, "El contenido debe tener al menos 100 caracteres").max(5e3, "El contenido no puede exceder 5000 caracteres"),
  category: z4.enum(["employment", "volunteering", "community_project", "personal_growth", "resource_sharing", "connection"]).default("connection"),
  location: z4.string().min(2, "La ubicaci\xF3n debe tener al menos 2 caracteres").max(255, "La ubicaci\xF3n no puede exceder 255 caracteres"),
  province: z4.string().max(100, "La provincia no puede exceder 100 caracteres").optional(),
  city: z4.string().max(100, "La ciudad no puede exceder 100 caracteres").optional(),
  impactType: z4.enum(["job_created", "lives_changed", "hours_volunteered", "people_helped", "project_completed", "resource_shared"]).default("lives_changed"),
  impactCount: z4.number().int("El n\xFAmero de impacto debe ser un entero").min(1, "El impacto debe ser al menos 1").max(1e5, "El impacto no puede exceder 100,000"),
  impactDescription: z4.string().min(5, "La descripci\xF3n del impacto debe tener al menos 5 caracteres").max(200, "La descripci\xF3n del impacto no puede exceder 200 caracteres"),
  imageUrl: z4.string().url("URL de imagen inv\xE1lida").optional(),
  videoUrl: z4.string().url("URL de video inv\xE1lida").optional(),
  tags: z4.string().max(500, "Las etiquetas no pueden exceder 500 caracteres").optional(),
  authorName: z4.string().min(2, "El nombre del autor debe tener al menos 2 caracteres").max(100, "El nombre del autor no puede exceder 100 caracteres").optional(),
  authorEmail: z4.string().email("Formato de email del autor inv\xE1lido").max(255, "El email del autor no puede exceder 255 caracteres").optional()
});
var createResourceSchema = z4.object({
  title: z4.string().min(5, "El t\xEDtulo debe tener al menos 5 caracteres").max(200, "El t\xEDtulo no puede exceder 200 caracteres"),
  description: z4.string().min(20, "La descripci\xF3n debe tener al menos 20 caracteres").max(1e3, "La descripci\xF3n no puede exceder 1000 caracteres"),
  category: z4.string().min(2, "La categor\xEDa debe tener al menos 2 caracteres").max(50, "La categor\xEDa no puede exceder 50 caracteres"),
  url: z4.string().url("URL inv\xE1lida").optional()
});

// server/middleware.ts
init_config();
import rateLimit2 from "express-rate-limit";
import helmet from "helmet";
import cors from "cors";
function securityHeaders() {
  const backendOrigin = `http://localhost:${config.server.port}`;
  const frontendOrigin = config.cors.origin.split(",")[0].trim();
  const isDevelopment = config.server.nodeEnv === "development";
  const connectSrc = [
    "'self'",
    backendOrigin,
    "http://localhost:*",
    "ws://localhost:*",
    "https://cdn.jsdelivr.net",
    "https://unpkg.com"
  ];
  if (frontendOrigin && frontendOrigin !== "*") {
    connectSrc.splice(2, 0, frontendOrigin);
  }
  return helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://unpkg.com"],
        // Always allow unpkg.com for Leaflet in both dev and production
        scriptSrc: isDevelopment ? ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://unpkg.com"] : ["'self'", "https://unpkg.com"],
        // Allow Leaflet in production
        scriptSrcElem: isDevelopment ? ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://unpkg.com", "https://www.googletagmanager.com", "https://www.google-analytics.com", "https://va.vercel-scripts.com"] : ["'self'", "https://unpkg.com", "https://www.googletagmanager.com", "https://www.google-analytics.com", "https://va.vercel-scripts.com"],
        // Allow Leaflet + analytics in production
        styleSrcElem: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://unpkg.com"],
        // Explicit style-src-elem for <style> and <link> tags
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc,
        fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
        workerSrc: ["'self'", "blob:", "https://unpkg.com"],
        // Allow blob URLs for workers (troika-worker-utils) and unpkg
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"]
      }
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" }
  });
}
function corsConfig() {
  const allowedOrigins = config.cors.origin.split(",").map((o) => o.trim());
  const originFunction = (origin, callback) => {
    if (!origin) {
      return callback(null, true);
    }
    if (allowedOrigins.includes(origin) || allowedOrigins.includes("*")) {
      return callback(null, origin);
    }
    callback(new Error("Not allowed by CORS"));
  };
  return cors({
    origin: allowedOrigins.length === 1 && allowedOrigins[0] !== "*" ? allowedOrigins[0] : originFunction,
    credentials: config.cors.credentials,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept", "Origin"],
    exposedHeaders: ["X-Total-Count", "X-Page-Count"],
    preflightContinue: false,
    optionsSuccessStatus: 204
  });
}
var generalRateLimit = (() => {
  if (config.server.nodeEnv === "development") {
    return (req, res, next) => {
      return next();
    };
  }
  return rateLimit2({
    windowMs: config.security.rateLimitWindowMs,
    max: config.security.rateLimitMaxRequests,
    message: {
      error: "Too many requests",
      message: "Demasiadas solicitudes. Intenta nuevamente m\xE1s tarde.",
      retryAfter: Math.ceil(config.security.rateLimitWindowMs / 1e3)
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
      if (!req.path.startsWith("/api")) {
        return true;
      }
      return req.path === "/api/health";
    },
    handler: (req, res) => {
      res.status(429).json({
        error: "Too many requests",
        message: "Demasiadas solicitudes. Intenta nuevamente m\xE1s tarde.",
        retryAfter: Math.ceil(config.security.rateLimitWindowMs / 1e3)
      });
    }
  });
})();
var authRateLimit = rateLimit2({
  windowMs: config.security.loginRateLimitWindowMs,
  max: config.security.loginRateLimitMax,
  message: {
    error: "Too many authentication attempts",
    message: "Demasiados intentos de autenticaci\xF3n. Intenta nuevamente m\xE1s tarde.",
    retryAfter: Math.ceil(config.security.loginRateLimitWindowMs / 1e3)
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  handler: (req, res) => {
    res.status(429).json({
      error: "Too many authentication attempts",
      message: "Demasiados intentos de autenticaci\xF3n. Intenta nuevamente m\xE1s tarde.",
      retryAfter: Math.ceil(config.security.loginRateLimitWindowMs / 1e3)
    });
  }
});
function requestLogger(req, res, next) {
  const start = Date.now();
  const originalSend = res.send;
  res.send = function(data) {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      userAgent: req.get("User-Agent"),
      ip: req.ip || req.connection.remoteAddress,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    };
    if (config.server.nodeEnv === "development" || res.statusCode >= 400) {
      console.log(JSON.stringify(logData));
    }
    return originalSend.call(this, data);
  };
  next();
}
function errorHandler(error, req, res, next) {
  console.error("Error:", {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  });
  if (config.server.nodeEnv === "production") {
    res.status(500).json({
      error: "Internal Server Error",
      message: "Ha ocurrido un error interno del servidor"
    });
  } else {
    res.status(500).json({
      error: "Internal Server Error",
      message: error.message,
      stack: error.stack
    });
  }
}
function notFoundHandler(req, res) {
  res.status(404).json({
    error: "Not Found",
    message: `Ruta no encontrada: ${req.method} ${req.url}`
  });
}
function requestSizeLimiter(maxSize = "10mb") {
  return (req, res, next) => {
    const contentLength = parseInt(req.get("content-length") || "0");
    const maxSizeBytes = parseSize(maxSize);
    if (contentLength > maxSizeBytes) {
      res.status(413).json({
        error: "Payload Too Large",
        message: `El tama\xF1o de la solicitud excede el l\xEDmite de ${maxSize}`
      });
      return;
    }
    next();
  };
}
function parseSize(size) {
  const units = {
    "b": 1,
    "kb": 1024,
    "mb": 1024 * 1024,
    "gb": 1024 * 1024 * 1024
  };
  const match = size.toLowerCase().match(/^(\d+(?:\.\d+)?)\s*(b|kb|mb|gb)?$/);
  if (!match) return 0;
  const value = parseFloat(match[1]);
  const unit = match[2] || "b";
  return value * (units[unit] || 1);
}
function sanitizeInput(req, res, next) {
  try {
    const sanitize = (obj) => {
      if (typeof obj === "string") {
        return obj.trim().replace(/[<>]/g, "");
      }
      if (Array.isArray(obj)) {
        return obj.map(sanitize);
      }
      if (obj && typeof obj === "object") {
        const sanitized = {};
        for (const [key, value] of Object.entries(obj)) {
          sanitized[key] = sanitize(value);
        }
        return sanitized;
      }
      return obj;
    };
    if (req.body) {
      req.body = sanitize(req.body);
    }
    if (req.query) {
      req.query = sanitize(req.query);
    }
    next();
  } catch (error) {
    console.error("[SanitizeInput] Error:", error);
    next();
  }
}

// server/nlp-service.ts
import { pipeline, env } from "@xenova/transformers";
env.allowLocalModels = false;
env.allowRemoteModels = process.env.ENABLE_NLP_MODELS === "true";
var NLPService = class {
  constructor() {
    this.sentimentPipeline = null;
    this.emotionPipeline = null;
    this.summarizationPipeline = null;
    this.nerPipeline = null;
    this.modelsEnabled = process.env.ENABLE_NLP_MODELS === "true";
    if (this.modelsEnabled) {
      this.initializePipelines();
    } else {
      console.log("\u2139\uFE0F NLP model pipelines disabled (set ENABLE_NLP_MODELS=true to enable remote model loading)");
    }
  }
  async initializePipelines() {
    try {
      console.log("\u{1F680} Inicializando servicios de NLP...");
      this.sentimentPipeline = await pipeline("sentiment-analysis", "Xenova/distilbert-base-uncased-finetuned-sst-2-english");
      this.emotionPipeline = await pipeline("text-classification", "j-hartmann/emotion-english-distilroberta-base");
      this.summarizationPipeline = await pipeline("summarization", "Xenova/distilbart-cnn-12-6");
      this.nerPipeline = await pipeline("token-classification", "Xenova/bert-base-NER");
      console.log("\u2705 Servicios de NLP inicializados correctamente");
    } catch (error) {
      console.error("\u274C Error inicializando servicios de NLP:", error);
    }
  }
  async analyzeText(text2) {
    try {
      if (!text2 || text2.trim().length === 0) {
        throw new Error("Texto vac\xEDo para an\xE1lisis");
      }
      const [sentiment, emotions, summary, entities] = await Promise.all([
        this.analyzeSentiment(text2),
        this.analyzeEmotions(text2),
        this.summarizeText(text2),
        this.extractEntities(text2)
      ]);
      const keywords = this.extractKeywords(text2);
      const language = this.detectLanguage(text2);
      const topics = this.identifyTopics(text2, entities);
      return {
        sentiment,
        emotions,
        keywords,
        topics,
        summary,
        entities,
        language
      };
    } catch (error) {
      console.error("Error en an\xE1lisis de texto:", error);
      throw new Error(`Error analizando texto: ${error}`);
    }
  }
  async analyzeSentiment(text2) {
    if (!this.sentimentPipeline) {
      return { label: "NEUTRAL", score: 0.5 };
    }
    try {
      const result = await this.sentimentPipeline(text2);
      return {
        label: result[0].label,
        score: result[0].score
      };
    } catch (error) {
      console.error("Error en an\xE1lisis de sentimiento:", error);
      return { label: "NEUTRAL", score: 0.5 };
    }
  }
  async analyzeEmotions(text2) {
    if (!this.emotionPipeline) {
      return [];
    }
    try {
      const results = await this.emotionPipeline(text2);
      return results.slice(0, 5).map((result) => ({
        label: result.label,
        score: result.score
      }));
    } catch (error) {
      console.error("Error en an\xE1lisis de emociones:", error);
      return [];
    }
  }
  async summarizeText(text2) {
    if (!this.summarizationPipeline || text2.length < 100) {
      return text2.length > 200 ? text2.substring(0, 200) + "..." : text2;
    }
    try {
      const result = await this.summarizationPipeline(text2, {
        max_length: 150,
        min_length: 30,
        do_sample: false
      });
      return result[0].summary_text;
    } catch (error) {
      console.error("Error en resumen:", error);
      return text2.length > 200 ? text2.substring(0, 200) + "..." : text2;
    }
  }
  async extractEntities(text2) {
    if (!this.nerPipeline) {
      return [];
    }
    try {
      const results = await this.nerPipeline(text2);
      const entities = results.filter((entity) => entity.score > 0.8).reduce((acc, entity) => {
        const existing = acc.find((e) => e.entity === entity.word && e.type === entity.entity_group);
        if (existing) {
          existing.confidence = Math.max(existing.confidence, entity.score);
        } else {
          acc.push({
            entity: entity.word,
            type: entity.entity_group,
            confidence: entity.score
          });
        }
        return acc;
      }, []);
      return entities.slice(0, 10);
    } catch (error) {
      console.error("Error en extracci\xF3n de entidades:", error);
      return [];
    }
  }
  extractKeywords(text2) {
    const words = text2.toLowerCase().replace(/[^\w\s]/g, " ").split(/\s+/).filter((word) => word.length > 3).filter((word) => !this.isStopWord(word));
    const wordCount = words.reduce((acc, word) => {
      acc[word] = (acc[word] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(wordCount).sort(([, a], [, b]) => b - a).slice(0, 10).map(([word]) => word);
  }
  isStopWord(word) {
    const stopWords = /* @__PURE__ */ new Set([
      "the",
      "a",
      "an",
      "and",
      "or",
      "but",
      "in",
      "on",
      "at",
      "to",
      "for",
      "of",
      "with",
      "by",
      "is",
      "are",
      "was",
      "were",
      "be",
      "been",
      "have",
      "has",
      "had",
      "do",
      "does",
      "did",
      "will",
      "would",
      "could",
      "should",
      "may",
      "might",
      "must",
      "can",
      "que",
      "los",
      "las",
      "los",
      "una",
      "uno",
      "unos",
      "unas",
      "este",
      "esta",
      "esto",
      "ese",
      "esa",
      "eso",
      "aquel",
      "aquella",
      "aquello",
      "del",
      "desde",
      "hasta",
      "entre",
      "durante"
    ]);
    return stopWords.has(word.toLowerCase());
  }
  detectLanguage(text2) {
    const spanishChars = "\xE1\xE9\xED\xF3\xFA\xF1\xBF\xA1";
    const hasSpanishChars = spanishChars.split("").some((char) => text2.includes(char));
    if (hasSpanishChars) return "es";
    return "en";
  }
  identifyTopics(text2, entities) {
    const topics = /* @__PURE__ */ new Set();
    entities.forEach((entity) => {
      if (entity.type === "LOC") topics.add("geograf\xEDa");
      if (entity.type === "PER") topics.add("personas");
      if (entity.type === "ORG") topics.add("organizaciones");
      if (entity.type === "MISC") topics.add("miscel\xE1neo");
    });
    const lowerText = text2.toLowerCase();
    if (lowerText.includes("argentina") || lowerText.includes("pa\xEDs")) topics.add("nacional");
    if (lowerText.includes("cambio") || lowerText.includes("transformaci\xF3n")) topics.add("cambio");
    if (lowerText.includes("social") || lowerText.includes("sociedad")) topics.add("social");
    if (lowerText.includes("econom\xEDa") || lowerText.includes("dinero")) topics.add("econom\xEDa");
    if (lowerText.includes("pol\xEDtica") || lowerText.includes("gobierno")) topics.add("pol\xEDtica");
    return Array.from(topics).slice(0, 5);
  }
  // Método específico para analizar psicografías de Parravicini
  async analyzePsychography(text2) {
    const analysis = await this.analyzeText(text2);
    return {
      propheticElements: this.extractPropheticElements(text2),
      temporalReferences: this.extractTemporalReferences(text2),
      symbolicLanguage: this.extractSymbolicLanguage(text2),
      socialImpact: this.extractSocialImpact(text2),
      spiritualMeaning: this.extractSpiritualMeaning(text2, analysis)
    };
  }
  extractPropheticElements(text2) {
    const propheticKeywords = [
      "vendr\xE1",
      "llegar\xE1",
      "ocurrir\xE1",
      "suceder\xE1",
      "ver\xE1",
      "contemplar\xE1",
      "future",
      "pr\xF3ximo",
      "pronto",
      "inminente",
      "predicci\xF3n",
      "profec\xEDa"
    ];
    return propheticKeywords.filter(
      (keyword) => text2.toLowerCase().includes(keyword.toLowerCase())
    );
  }
  extractTemporalReferences(text2) {
    const temporalPatterns = [
      /\d{4}/g,
      // años como 2024
      /siglo \w+/gi,
      // siglo XXI
      /próxim\w+ \w+/gi,
      // próximos años
      /dentro de \w+/gi,
      // dentro de poco
      /hasta el \w+/gi
      // hasta el 2030
    ];
    const references = [];
    temporalPatterns.forEach((pattern) => {
      const matches = text2.match(pattern);
      if (matches) references.push(...matches);
    });
    return [...new Set(references)].slice(0, 10);
  }
  extractSymbolicLanguage(text2) {
    const symbolicKeywords = [
      "hombre gris",
      "tercera oleada",
      "nueva argentina",
      "transformaci\xF3n",
      "luz",
      "oscuridad",
      "esperanza",
      "cambio",
      "renovaci\xF3n",
      "unidad",
      "solidaridad",
      "conciencia",
      "despertar",
      "evoluci\xF3n"
    ];
    return symbolicKeywords.filter(
      (keyword) => text2.toLowerCase().includes(keyword.toLowerCase())
    );
  }
  extractSocialImpact(text2) {
    const socialKeywords = [
      "sociedad",
      "comunidad",
      "pueblo",
      "ciudadanos",
      "argentina",
      "naci\xF3n",
      "poblaci\xF3n",
      "colectivo",
      "social",
      "pol\xEDtico",
      "econ\xF3mico",
      "cultural",
      "educaci\xF3n",
      "salud",
      "trabajo"
    ];
    return socialKeywords.filter(
      (keyword) => text2.toLowerCase().includes(keyword.toLowerCase())
    );
  }
  extractSpiritualMeaning(text2, analysis) {
    const spiritualKeywords = [
      "espiritual",
      "alma",
      "esp\xEDritu",
      "conciencia",
      "divino",
      "sagrado",
      "fe",
      "esperanza",
      "amor",
      "paz",
      "armon\xEDa",
      "unidad",
      "evoluci\xF3n",
      "despertar",
      "iluminaci\xF3n"
    ];
    const meanings = spiritualKeywords.filter(
      (keyword) => text2.toLowerCase().includes(keyword.toLowerCase())
    );
    if (analysis.emotions.some((e) => e.label === "joy" || e.label === "optimism")) {
      meanings.push("mensaje esperanzador");
    }
    if (analysis.emotions.some((e) => e.label === "sadness" || e.label === "fear")) {
      meanings.push("advertencia sobre desaf\xEDos");
    }
    return meanings;
  }
  // Método para comparar textos similares (útil para encontrar patrones en psicografías)
  async findSimilarTexts(text2, textCollection) {
    const targetEmbedding = await this.getTextEmbedding(text2);
    const similarities = await Promise.all(
      textCollection.map(async (collectionText, index2) => {
        const collectionEmbedding = await this.getTextEmbedding(collectionText);
        const similarity = this.calculateCosineSimilarity(targetEmbedding, collectionEmbedding);
        return {
          text: collectionText,
          similarity,
          index: index2
        };
      })
    );
    return similarities.filter((item) => item.similarity > 0.3).sort((a, b) => b.similarity - a.similarity).slice(0, 5);
  }
  async getTextEmbedding(text2) {
    const words = text2.toLowerCase().split(/\s+/);
    const wordFreq = words.reduce((acc, word) => {
      acc[word] = (acc[word] || 0) + 1;
      return acc;
    }, {});
    return Object.values(wordFreq).slice(0, 100);
  }
  calculateCosineSimilarity(vectorA, vectorB) {
    const dotProduct = vectorA.reduce((sum, a, i) => sum + a * (vectorB[i] || 0), 0);
    const normA = Math.sqrt(vectorA.reduce((sum, a) => sum + a * a, 0));
    const normB = Math.sqrt(vectorB.reduce((sum, b) => sum + b * b, 0));
    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (normA * normB);
  }
};
var nlpService = new NLPService();

// server/blockchain-service.ts
import { Web3 } from "web3";
import { ethers } from "ethers";
var BlockchainService = class {
  constructor() {
    this.isConnected = false;
    this.initializeBlockchain();
  }
  async initializeBlockchain() {
    try {
      console.log("\u{1F517} Inicializando servicio de blockchain...");
      this.web3 = new Web3("https://polygon-mumbai.infura.io/v3/YOUR_INFURA_KEY");
      this.ethersProvider = new ethers.JsonRpcProvider("https://polygon-mumbai.infura.io/v3/YOUR_INFURA_KEY");
      const votingContractAddress = "0x0000000000000000000000000000000000000000";
      const impactContractAddress = "0x0000000000000000000000000000000000000000";
      this.isConnected = true;
      console.log("\u2705 Servicio de blockchain inicializado correctamente");
    } catch (error) {
      console.error("\u274C Error inicializando servicio de blockchain:", error);
      this.isConnected = false;
    }
  }
  // Verificar si el servicio está conectado a la blockchain
  isServiceConnected() {
    return this.isConnected;
  }
  // Crear una propuesta de votación (simulado por ahora)
  async createVotingProposal(proposal) {
    try {
      if (!this.isConnected) {
        throw new Error("Servicio de blockchain no conectado");
      }
      const proposalId = `proposal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const newProposal = {
        ...proposal,
        id: proposalId,
        totalVotes: 0,
        yesVotes: 0,
        noVotes: 0,
        abstainVotes: 0,
        status: "active"
      };
      console.log("\u2705 Propuesta de votaci\xF3n creada:", proposalId);
      return proposalId;
    } catch (error) {
      console.error("Error creando propuesta de votaci\xF3n:", error);
      throw new Error(`Error creando propuesta: ${error}`);
    }
  }
  // Votar en una propuesta
  async voteOnProposal(proposalId, voterAddress, vote) {
    try {
      if (!this.isConnected) {
        throw new Error("Servicio de blockchain no conectado");
      }
      const voteRecord = {
        voterAddress,
        proposalId,
        vote,
        timestamp: Date.now(),
        transactionHash: `0x${Math.random().toString(16).substr(2, 64)}`,
        blockNumber: Math.floor(Math.random() * 1e6) + 4e7
      };
      console.log("\u2705 Voto registrado:", { proposalId, voterAddress, vote });
      return voteRecord.transactionHash;
    } catch (error) {
      console.error("Error votando en propuesta:", error);
      throw new Error(`Error votando: ${error}`);
    }
  }
  // Obtener información de una propuesta
  async getProposal(proposalId) {
    try {
      if (!this.isConnected) {
        throw new Error("Servicio de blockchain no conectado");
      }
      return {
        id: proposalId,
        title: "Propuesta de Desarrollo Comunitario",
        description: "Implementar proyecto de desarrollo comunitario en la regi\xF3n",
        creator: "0x742d35Cc6A3e5C79c0F0E5A0B5e6B8c8c8c8c8c8c",
        startTime: Date.now() - 864e5,
        // 1 día atrás
        endTime: Date.now() + 864e5,
        // 1 día adelante
        totalVotes: 150,
        yesVotes: 98,
        noVotes: 32,
        abstainVotes: 20,
        status: "active"
      };
    } catch (error) {
      console.error("Error obteniendo propuesta:", error);
      return null;
    }
  }
  // Certificar impacto social
  async certifySocialImpact(certificate) {
    try {
      if (!this.isConnected) {
        throw new Error("Servicio de blockchain no conectado");
      }
      const certificateId = `impact_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const impactCertificate = {
        ...certificate,
        id: certificateId,
        timestamp: Date.now(),
        transactionHash: `0x${Math.random().toString(16).substr(2, 64)}`,
        verificationHash: this.generateVerificationHash(certificate)
      };
      console.log("\u2705 Impacto social certificado:", certificateId);
      return impactCertificate.transactionHash;
    } catch (error) {
      console.error("Error certificando impacto social:", error);
      throw new Error(`Error certificando impacto: ${error}`);
    }
  }
  // Verificar certificado de impacto social
  async verifySocialImpact(certificateId) {
    try {
      if (!this.isConnected) {
        throw new Error("Servicio de blockchain no conectado");
      }
      return {
        id: certificateId,
        projectId: "project_123",
        beneficiary: "0x742d35Cc6A3e5C79c0F0E5A0B5e6B8c8c8c8c8c8c",
        impactMetrics: {
          peopleHelped: 150,
          environmentalImpact: 85,
          economicValue: 5e4,
          communityEngagement: 92
        },
        certifier: "0xCertifierAddress",
        timestamp: Date.now() - 864e5,
        transactionHash: `0x${Math.random().toString(16).substr(2, 64)}`,
        verificationHash: "verification_hash_123"
      };
    } catch (error) {
      console.error("Error verificando certificado:", error);
      return null;
    }
  }
  // Obtener estadísticas de votación
  async getVotingStats(proposalId) {
    try {
      const proposal = await this.getProposal(proposalId);
      if (!proposal) return null;
      const totalVotes = proposal.totalVotes;
      const yesPercentage = totalVotes > 0 ? proposal.yesVotes / totalVotes * 100 : 0;
      const noPercentage = totalVotes > 0 ? proposal.noVotes / totalVotes * 100 : 0;
      const abstainPercentage = totalVotes > 0 ? proposal.abstainVotes / totalVotes * 100 : 0;
      const participationRate = Math.min(totalVotes / 1e3 * 100, 100);
      return {
        totalVotes,
        yesPercentage: Math.round(yesPercentage * 100) / 100,
        noPercentage: Math.round(noPercentage * 100) / 100,
        abstainPercentage: Math.round(abstainPercentage * 100) / 100,
        participationRate: Math.round(participationRate * 100) / 100,
        status: proposal.status
      };
    } catch (error) {
      console.error("Error obteniendo estad\xEDsticas de votaci\xF3n:", error);
      return null;
    }
  }
  // Crear donación con registro blockchain
  async recordDonation(donation) {
    try {
      if (!this.isConnected) {
        throw new Error("Servicio de blockchain no conectado");
      }
      const txHash = `0x${Math.random().toString(16).substr(2, 64)}`;
      console.log("\u2705 Donaci\xF3n registrada en blockchain:", txHash);
      return txHash;
    } catch (error) {
      console.error("Error registrando donaci\xF3n:", error);
      throw new Error(`Error registrando donaci\xF3n: ${error}`);
    }
  }
  // Verificar integridad de datos usando blockchain
  async verifyDataIntegrity(dataHash, expectedHash) {
    try {
      const storedHash = `hash_${dataHash}`;
      return storedHash === expectedHash;
    } catch (error) {
      console.error("Error verificando integridad de datos:", error);
      return false;
    }
  }
  // Generar hash de verificación para certificados
  generateVerificationHash(certificate) {
    const dataString = JSON.stringify({
      projectId: certificate.projectId,
      beneficiary: certificate.beneficiary,
      impactMetrics: certificate.impactMetrics,
      certifier: certificate.certifier
    });
    let hash = 0;
    for (let i = 0; i < dataString.length; i++) {
      const char = dataString.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return `vh_${Math.abs(hash).toString(16)}`;
  }
  // Obtener balance de una dirección
  async getBalance(address) {
    try {
      if (!this.isConnected) {
        throw new Error("Servicio de blockchain no conectado");
      }
      const mockBalance = (Math.random() * 10).toFixed(4);
      return mockBalance;
    } catch (error) {
      console.error("Error obteniendo balance:", error);
      return "0";
    }
  }
  // Verificar si una dirección es válida
  isValidAddress(address) {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  }
  // Obtener información de la red blockchain
  async getNetworkInfo() {
    try {
      if (!this.isConnected) {
        throw new Error("Servicio de blockchain no conectado");
      }
      return {
        chainId: 80001,
        // Polygon Mumbai
        networkName: "Polygon Mumbai Testnet",
        blockNumber: 4e7 + Math.floor(Math.random() * 1e6),
        gasPrice: "20000000000"
        // 20 gwei
      };
    } catch (error) {
      console.error("Error obteniendo informaci\xF3n de red:", error);
      return {
        chainId: 0,
        networkName: "Desconocido",
        blockNumber: 0,
        gasPrice: "0"
      };
    }
  }
};
var blockchainService = new BlockchainService();

// server/ar-service.ts
var ARService = class {
  constructor() {
    this.scenes = /* @__PURE__ */ new Map();
    this.visualizations = /* @__PURE__ */ new Map();
    this.initializeDefaultScenes();
  }
  initializeDefaultScenes() {
    console.log("\u{1F3D7}\uFE0F Inicializando servicio de Realidad Aumentada...");
    const defaultScene = {
      id: "argentina_main",
      projects: [],
      cameraPosition: { x: 0, y: 5, z: 10 },
      lighting: {
        intensity: 1,
        color: "#ffffff"
      },
      markers: [
        {
          id: "location_buenos_aires",
          position: { x: -34.6037, y: -58.3816, z: 0 },
          // Coordenadas aproximadas de Buenos Aires
          type: "gps",
          data: "-34.6037,-58.3816"
        }
      ]
    };
    this.scenes.set(defaultScene.id, defaultScene);
    console.log("\u2705 Servicio de AR inicializado correctamente");
  }
  // Crear nuevo proyecto AR
  async createARProject(projectData) {
    try {
      const projectId = `ar_project_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const project = {
        ...projectData,
        id: projectId,
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      const scene = this.scenes.get("argentina_main");
      if (scene) {
        scene.projects.push(project);
      }
      console.log(`\u2705 Proyecto AR creado: ${projectId}`);
      return projectId;
    } catch (error) {
      console.error("Error creando proyecto AR:", error);
      throw new Error(`Error creando proyecto AR: ${error}`);
    }
  }
  // Obtener proyectos AR por ubicación
  async getARProjectsByLocation(latitude, longitude, radiusKm = 5) {
    try {
      const scene = this.scenes.get("argentina_main");
      if (!scene) return [];
      const projects = scene.projects.filter((project) => {
        const distance = this.calculateDistance(
          latitude,
          longitude,
          project.location.latitude,
          project.location.longitude
        );
        return distance <= radiusKm;
      });
      return projects;
    } catch (error) {
      console.error("Error obteniendo proyectos AR por ubicaci\xF3n:", error);
      return [];
    }
  }
  // Crear visualización AR para un proyecto
  async createARVisualization(sceneId, projectId, visualizationData) {
    try {
      const visualizationId = `ar_viz_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const visualization = {
        ...visualizationData,
        sceneId,
        projectId
      };
      this.visualizations.set(visualizationId, visualization);
      console.log(`\u2705 Visualizaci\xF3n AR creada: ${visualizationId}`);
      return visualizationId;
    } catch (error) {
      console.error("Error creando visualizaci\xF3n AR:", error);
      throw new Error(`Error creando visualizaci\xF3n AR: ${error}`);
    }
  }
  // Generar modelo 3D básico para un proyecto
  generate3DModel(project) {
    try {
      let geometry;
      let material;
      switch (project.arModel.type) {
        case "building":
          geometry = "box";
          material = project.arModel.color;
          break;
        case "park":
          geometry = "plane";
          material = "#22c55e";
          break;
        case "infrastructure":
          geometry = "cylinder";
          material = "#6b7280";
          break;
        case "community_center":
          geometry = "octahedron";
          material = "#f59e0b";
          break;
        case "school":
          geometry = "cone";
          material = "#3b82f6";
          break;
        case "hospital":
          geometry = "dodecahedron";
          material = "#ef4444";
          break;
        default:
          geometry = "box";
          material = project.arModel.color;
      }
      const modelCode = `
        // Modelo 3D generado para proyecto: ${project.title}
        const geometry = new THREE.${geometry.charAt(0).toUpperCase() + geometry.slice(1)}Geometry(
          ${project.arModel.dimensions.width},
          ${project.arModel.dimensions.height},
          ${project.arModel.dimensions.depth}
        );
        const material = new THREE.MeshLambertMaterial({ color: '${material}' });
        const model = new THREE.Mesh(geometry, material);

        // Posicionar modelo basado en ubicaci\xF3n GPS
        model.position.set(
          ${project.location.longitude},
          0,
          ${project.location.latitude}
        );

        // Agregar animaciones b\xE1sicas
        model.userData = {
          projectId: '${project.id}',
          title: '${project.title}',
          description: '${project.description}',
          impact: ${JSON.stringify(project.impact)}
        };

        return model;
      `;
      return modelCode;
    } catch (error) {
      console.error("Error generando modelo 3D:", error);
      return "// Error generando modelo 3D";
    }
  }
  // Crear escena AR completa para una ubicación
  async generateARScene(latitude, longitude) {
    try {
      const nearbyProjects = await this.getARProjectsByLocation(latitude, longitude, 10);
      const scene = {
        id: `scene_${latitude}_${longitude}_${Date.now()}`,
        projects: nearbyProjects,
        cameraPosition: {
          x: longitude,
          y: 5,
          z: latitude
        },
        lighting: {
          intensity: 1,
          color: "#ffffff"
        },
        markers: [
          {
            id: `gps_${latitude}_${longitude}`,
            position: { x: longitude, y: latitude, z: 0 },
            type: "gps",
            data: `${latitude},${longitude}`
          }
        ]
      };
      return scene;
    } catch (error) {
      console.error("Error generando escena AR:", error);
      throw new Error(`Error generando escena AR: ${error}`);
    }
  }
  // Calcular distancia entre dos puntos geográficos
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance;
  }
  toRadians(degrees) {
    return degrees * (Math.PI / 180);
  }
  // Obtener escena AR por ID
  getARScene(sceneId) {
    return this.scenes.get(sceneId);
  }
  // Obtener visualización AR por ID
  getARVisualization(visualizationId) {
    return this.visualizations.get(visualizationId);
  }
  // Listar todas las escenas disponibles
  listARScenes() {
    return Array.from(this.scenes.values());
  }
  // Actualizar proyecto AR
  async updateARProject(projectId, updates) {
    try {
      const scene = this.scenes.get("argentina_main");
      if (!scene) return false;
      const projectIndex = scene.projects.findIndex((p) => p.id === projectId);
      if (projectIndex === -1) return false;
      scene.projects[projectIndex] = { ...scene.projects[projectIndex], ...updates };
      return true;
    } catch (error) {
      console.error("Error actualizando proyecto AR:", error);
      return false;
    }
  }
  // Eliminar proyecto AR
  async deleteARProject(projectId) {
    try {
      const scene = this.scenes.get("argentina_main");
      if (!scene) return false;
      const initialLength = scene.projects.length;
      scene.projects = scene.projects.filter((p) => p.id !== projectId);
      return scene.projects.length < initialLength;
    } catch (error) {
      console.error("Error eliminando proyecto AR:", error);
      return false;
    }
  }
  // Generar código AR.js para una escena
  generateARCode(scene) {
    try {
      const arCode = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>\xA1BASTA! AR - ${scene.id}</title>
          <script src="https://aframe.io/releases/1.4.0/aframe.min.js"></script>
          <script src="https://raw.githack.com/AR-js-org/AR.js/3.4.5/aframe/build/aframe-ar.js"></script>
          <style>
            body { margin: 0; overflow: hidden; }
            .ar-info { position: absolute; top: 10px; left: 10px; color: white; z-index: 100; }
          </style>
        </head>
        <body>
          <div class="ar-info">
            <h3>\xA1BASTA! Realidad Aumentada</h3>
            <p>Apunta tu c\xE1mara a un marcador para ver proyectos</p>
          </div>

          <a-scene embedded arjs>
            <a-camera gps-camera="simulateLatitude: ${scene.cameraPosition.x}; simulateLongitude: ${scene.cameraPosition.z};"></a-camera>

            ${scene.markers.map((marker) => `
              <a-anchor hit-testing-enabled="true" gps-entity-place="latitude: ${marker.position.y}; longitude: ${marker.position.x};">
                ${scene.projects.map((project) => `
                  <a-box
                    position="${project.location.longitude} ${project.arModel.dimensions.height / 2} ${project.location.latitude}"
                    width="${project.arModel.dimensions.width}"
                    height="${project.arModel.dimensions.height}"
                    depth="${project.arModel.dimensions.depth}"
                    color="${project.arModel.color}"
                    animation="property: rotation; to: 0 360 0; loop: true; dur: 10000"
                  >
                  </a-box>
                `).join("")}
              </a-anchor>
            `).join("")}

            <a-light type="ambient" color="#fff" intensity="${scene.lighting.intensity}"></a-light>
          </a-scene>
        </body>
        </html>
      `;
      return arCode;
    } catch (error) {
      console.error("Error generando c\xF3digo AR:", error);
      return "<!-- Error generando c\xF3digo AR -->";
    }
  }
  // Generar configuración de AR para dispositivos móviles
  generateMobileARConfig(scene) {
    return {
      sceneId: scene.id,
      camera: {
        position: scene.cameraPosition,
        fov: 75,
        near: 0.1,
        far: 1e3
      },
      lighting: scene.lighting,
      markers: scene.markers,
      projects: scene.projects.map((project) => ({
        id: project.id,
        title: project.title,
        position: [
          project.location.longitude,
          project.arModel.dimensions.height / 2,
          project.location.latitude
        ],
        scale: [
          project.arModel.dimensions.width,
          project.arModel.dimensions.height,
          project.arModel.dimensions.depth
        ],
        color: project.arModel.color,
        type: project.arModel.type,
        impact: project.impact,
        animations: [
          {
            type: "rotation",
            axis: [0, 1, 0],
            speed: 0.01
          }
        ]
      })),
      ui: {
        showInfo: true,
        showStats: true,
        language: "es"
      }
    };
  }
  // Validar coordenadas GPS
  isValidCoordinates(latitude, longitude) {
    return latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180;
  }
  // Convertir coordenadas GPS a coordenadas de escena 3D
  gpsToSceneCoordinates(latitude, longitude, altitude = 0) {
    return {
      x: longitude,
      y: altitude,
      z: latitude
    };
  }
  // Crear marcador AR basado en ubicación
  async createLocationMarker(latitude, longitude, projectId) {
    try {
      const markerId = `marker_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const marker = {
        id: markerId,
        position: { x: longitude, y: latitude, z: 0 },
        type: "gps",
        data: `${latitude},${longitude}`,
        projectId
      };
      const scene = this.scenes.get("argentina_main");
      if (scene) {
        scene.markers.push(marker);
      }
      return markerId;
    } catch (error) {
      console.error("Error creando marcador de ubicaci\xF3n:", error);
      throw new Error(`Error creando marcador: ${error}`);
    }
  }
};
var arService = new ARService();

// server/routes.ts
init_db();
init_schema();
import { ilike as ilike3, sql as drizzleSql } from "drizzle-orm";

// shared/mission-registry.ts
var MISSIONS = [
  {
    slug: "la-base-esta",
    number: 1,
    label: "La Base Est\xE1",
    shortLabel: "La Base",
    description: "Agua, vivienda, salud, energia, seguridad de proximidad",
    whatHurts: "La intemperie material. El agua que falta o enferma. El alquiler que expulsa. La salud que llega tarde. El barrio donde el miedo organiza mas que la ley.",
    whatWeGuarantee: "Agua, saneamiento basico, refugio digno, alimentacion esencial, salud primaria, continuidad energetica minima y seguridad de proximidad.",
    whatChanges90Days: [
      "Mapa de criticidad territorial",
      "Cuadrillas de reparacion rapida",
      "Centros de respuesta primaria por zonas criticas",
      "Stock y uso de inmuebles, camas, cisternas, comedores relevados"
    ],
    whatChanges12Months: [
      "Red basica de infraestructura social critica estabilizada",
      "Mecanismos de vivienda incremental y autoconstruccion asistida en marcha",
      "APS territorial con protocolos minimos comunes"
    ],
    whatChanges3Years: [
      "Caida sensible de intemperie extrema, enfermedad evitable y violencia de proximidad en territorios priorizados"
    ],
    citizenRoles: ["testigo", "constructor", "custodio"],
    cellCanDo: [
      "Relevamiento",
      "Deteccion temprana",
      "Distribucion",
      "Cuadrillas barriales",
      "Acompanamiento a familias criticas"
    ],
    citizenCanDo: [
      "Declarar necesidad",
      "Ofrecer recurso",
      "Sumarse a cuadrilla",
      "Verificar entrega",
      "Documentar falla"
    ],
    evidenceAccepted: [
      "Relevamientos geoetiquetados",
      "Partes de reparacion",
      "Trazabilidad de insumos",
      "Metricas de cobertura",
      "Historias verificadas de mejora concreta"
    ],
    storyItTells: "La del pais que vuelve a cuidar primero lo indispensable.",
    whatWeWontPromiseYet: [
      "Solucion total del deficit habitacional",
      "Pacificacion plena",
      "Salud integral de largo plazo en 90 dias"
    ],
    pauseConditions: [
      "Opacidad en distribucion",
      "Dependencia de intermediarios extractivos",
      "Expansion sin evidencia de cobertura real"
    ],
    kpiNames: [
      "Hogares criticos cubiertos",
      "Tiempo promedio de reparacion",
      "Acceso a agua segura",
      "Cobertura de APS",
      "Eventos violentos priorizados resueltos por protocolo"
    ],
    plans: ["PLANAGUA", "PLANVIV", "PLANSAL", "PLANSEG", "PLANEN"],
    temporalOrders: ["emergencia", "transicion"]
  },
  {
    slug: "territorio-legible",
    number: 2,
    label: "Territorio Legible y Mando Civico",
    shortLabel: "Territorio",
    description: "Senales, mandatos, datos abiertos, rieles digitales basicos",
    whatHurts: "No sabemos con suficiente precision que necesita cada territorio, que esta dispuesto a sostener, que rechaza, que recursos tiene y donde estan los cuellos de botella.",
    whatWeGuarantee: "Un sistema nacional de senal, recursos, compromisos, mandato territorial y datos abiertos con proteccion.",
    whatChanges90Days: [
      "Taxonomia minima unificada",
      "Tablero nacional de senal",
      "Cobertura territorial visible",
      "Primer mandato territorial consolidado en pilotos"
    ],
    whatChanges12Months: [
      "Mandatos por provincia y ciudades estrategicas",
      "Integracion de recursos y compromisos",
      "Llamados ciudadanos por mision"
    ],
    whatChanges3Years: [
      "Toma de decision publica apoyada en senal ciudadana, evidencia territorial y verificacion multicapa"
    ],
    citizenRoles: ["declarante", "testigo", "custodio", "organizador"],
    cellCanDo: [
      "Convocar",
      "Mapear",
      "Verificar",
      "Elevar prioridades",
      "Sostener circulos de escucha y ejecucion"
    ],
    citizenCanDo: [
      "Declarar sueno, valor, necesidad, basta, compromiso o recurso",
      "Revisar su mandato territorial",
      "Sumarse a una accion concreta"
    ],
    evidenceAccepted: [
      "Senales con trazabilidad basica",
      "Series temporales",
      "Cobertura territorial",
      "Verificacion comunitaria y documental"
    ],
    storyItTells: "La del pais que deja de hablar por intuicion y empieza a escucharse en serio.",
    whatWeWontPromiseYet: [
      "Inteligencia artificial perfecta",
      "Representacion total",
      "Captura cero de senal"
    ],
    pauseConditions: [
      "Sesgo sistematico oculto",
      "Vulneracion de privacidad",
      "Opacidad algoritmica o narrativa sin trazabilidad"
    ],
    kpiNames: [
      "Cobertura territorial",
      "Densidad de senal por tipo",
      "Tiempo entre senal y sintesis",
      "Porcentaje de mandatos con llamada a la accion visible"
    ],
    plans: ["PLANDIG", "PLANRUTA"],
    temporalOrders: ["emergencia", "transicion"]
  },
  {
    slug: "produccion-y-suelo-vivo",
    number: 3,
    label: "Trabajo, Produccion y Suelo Vivo",
    shortLabel: "Produccion",
    description: "Empleo util, suelo regenerado, empresas bastardas, cadenas territoriales",
    whatHurts: "Trabajo improductivo, suelo degradado, cadena de valor rota, infraestructura minima insuficiente y dependencia de rentas que no dejan musculatura real.",
    whatWeGuarantee: "Reconstruccion productiva con foco en suelo vivo, empleo util, empresas de servicio justo, reconversion laboral y cadenas territoriales.",
    whatChanges90Days: [
      "Pilotos de suelo vivo",
      "Identificacion de capacidades reconvertibles",
      "Primeras bastardas o estructuras equivalentes de servicio util en dominios acotados",
      "Cartera de microproyectos territoriales productivos"
    ],
    whatChanges12Months: [
      "Nodos demostrativos de produccion y servicio",
      "Primeras cohortes de reconversion laboral",
      "Red inicial de empleo util ligada a misiones"
    ],
    whatChanges3Years: [
      "Caida de dependencia improductiva",
      "Mejora de suelos y rendimientos",
      "Cadenas territoriales mas densas y menos extractivas"
    ],
    citizenRoles: ["constructor", "organizador", "custodio"],
    cellCanDo: [
      "Mapear capacidades",
      "Coordinar formacion",
      "Lanzar microproyectos",
      "Auditar costo real",
      "Conectar oferta y necesidad local"
    ],
    citizenCanDo: [
      "Ofrecer oficio",
      "Aprender uno nuevo",
      "Sumarse a una red productiva",
      "Custodiar transparencia de costos"
    ],
    evidenceAccepted: [
      "Empleo creado o reconvertido",
      "Productividad",
      "Reduccion de costos extractivos",
      "Mejora de suelo",
      "Continuidad operativa de nodos"
    ],
    storyItTells: "La del pais que deja de vivir de goteos y vuelve a hacer cosas con sentido.",
    whatWeWontPromiseYet: [
      "Industrializacion completa",
      "Soberania energetica total",
      "Mercado perfecto"
    ],
    pauseConditions: [
      "Subsidio sin salida",
      "Pilotaje sin aprendizaje",
      "Estructura productiva capturada por actores rentistas"
    ],
    kpiNames: [
      "Puestos reconvertidos",
      "Hectareas piloto",
      "Costo real comparado",
      "Proyectos productivos vivos a 12 meses"
    ],
    plans: ["PLANISV", "PLANEB", "PLANREP", "PLANEN", "PLAN24CN"],
    temporalOrders: ["transicion", "permanencia"]
  },
  {
    slug: "infancia-escuela-cultura",
    number: 4,
    label: "Infancia, Escuela y Cultura de Reconstruccion",
    shortLabel: "Infancia",
    description: "Ninez cuidada, escuela significativa, cultura viva",
    whatHurts: "Ninos rotos por el contexto, escuela degradada, cultura fragmentada y ausencia de un relato comun que convoque sin manipular.",
    whatWeGuarantee: "Ninez cuidada, alfabetizacion robusta, escuela significativa, cultura viva y ritos publicos que conviertan la reconstruccion en experiencia compartida.",
    whatChanges90Days: [
      "Priorizacion de ninez e infancia critica",
      "Modulos de alfabetizacion y apoyo intensivo",
      "Programacion cultural barrial de cohesion",
      "Relatos de mision visibles y no partidarios"
    ],
    whatChanges12Months: [
      "Comunidades educativas con metas compartidas",
      "Mejora en asistencia y lectura",
      "Circuitos culturales de pertenencia activa"
    ],
    whatChanges3Years: [
      "Escuela mas exigente y mas humana",
      "Infancia con mejor cuidado",
      "Cultura entendida como infraestructura de confianza"
    ],
    citizenRoles: ["constructor", "organizador", "narrador"],
    cellCanDo: [
      "Tutorias",
      "Acompanamiento a familias",
      "Circulos de lectura",
      "Mesas, ferias, juegos, memoria y documentacion del proceso"
    ],
    citizenCanDo: [
      "Ensenar",
      "Tutorizar",
      "Alojar una actividad cultural",
      "Sostener presencia adulta confiable"
    ],
    evidenceAccepted: [
      "Asistencia",
      "Alfabetizacion",
      "Participacion",
      "Continuidad de espacios",
      "Historias de transformacion verificables"
    ],
    storyItTells: "La del pais que decide que ningun chico crezca sin horizonte ni tribu de cuidado.",
    whatWeWontPromiseYet: [
      "Reforma educativa total en un ciclo",
      "Sanacion cultural instantanea"
    ],
    pauseConditions: [
      "Escolarizacion vacia sin aprendizaje",
      "Cultura convertida en propaganda",
      "Dispersion programatica sin comunidad real"
    ],
    kpiNames: [
      "Asistencia",
      "Alfabetizacion inicial",
      "Tutorias activas",
      "Eventos de cohesion con continuidad"
    ],
    plans: ["PLANEDU", "PLANCUL"],
    temporalOrders: ["emergencia", "transicion"]
  },
  {
    slug: "instituciones-y-futuro",
    number: 5,
    label: "Instituciones Confiables y Pacto de Futuro",
    shortLabel: "Instituciones",
    description: "Justicia, integridad, blindaje, settlement institucional",
    whatHurts: "La impunidad, la arbitrariedad, la opacidad, el ciclo pendular y la facilidad con la que cualquier construccion puede ser vaciada.",
    whatWeGuarantee: "Integridad, justicia transicional, proteccion contra captura, settlement institucional gradual y reglas de uso del poder visibles.",
    whatChanges90Days: [
      "Defensoria de Integridad",
      "Protocolos de trazabilidad",
      "Registro publico de decisiones criticas",
      "Reglas de emergencia con caducidad explicita"
    ],
    whatChanges12Months: [
      "Mecanismos de resolucion rapida",
      "Controles cruzados basicos",
      "Primera capa de pacto fiscal y anticaptura"
    ],
    whatChanges3Years: [
      "Settlement institucional mas estable",
      "Justicia funcional en dominios prioritarios",
      "Menor reversibilidad del proyecto por simple cambio de humor politico"
    ],
    citizenRoles: ["custodio", "testigo", "narrador"],
    cellCanDo: [
      "Veeduria",
      "Registro de irregularidades",
      "Documentacion de desvios",
      "Custodia civica de misiones"
    ],
    citizenCanDo: [
      "Denunciar",
      "Auditar",
      "Seguir tableros",
      "Exigir justificacion de gasto y decision"
    ],
    evidenceAccepted: [
      "Auditorias",
      "Trazabilidad presupuestaria",
      "Resolucion de conflictos",
      "Tiempos judiciales acotados en dominios criticos"
    ],
    storyItTells: "La del pais que deja de tolerar que el poder se esconda atras del humo.",
    whatWeWontPromiseYet: [
      "Justicia perfecta",
      "Constitucion ideal de un solo golpe",
      "Desarme total de decadas de captura en meses"
    ],
    pauseConditions: [
      "Expansion institucional sin control",
      "Blindajes decorativos",
      "Captura temprana de organos transitorios"
    ],
    kpiNames: [
      "Tiempo de publicacion de decisiones",
      "Trazabilidad de fondos",
      "Denuncias procesadas",
      "Conflictos criticos resueltos"
    ],
    plans: ["PLANJUS", "PLANSUS", "PLANMON", "PLANGEO", "PLANSEG"],
    temporalOrders: ["transicion", "permanencia"]
  }
];

// shared/mission-signal-matcher.ts
var MISSION_KEYWORDS = {
  "la-base-esta": [
    "agua",
    "vivienda",
    "salud",
    "hospital",
    "energia",
    "seguridad",
    "alquiler",
    "comida",
    "alimentacion",
    "refugio",
    "techo",
    "medicina",
    "violencia",
    "barrio",
    "luz",
    "gas",
    "potable",
    "saneamiento",
    "calefaccion"
  ],
  "territorio-legible": [
    "datos",
    "digital",
    "transparencia",
    "mandato",
    "senal",
    "informacion",
    "mapa",
    "tecnologia",
    "plataforma",
    "algoritmo",
    "privacidad",
    "internet",
    "conectividad",
    "software"
  ],
  "produccion-y-suelo-vivo": [
    "trabajo",
    "empleo",
    "produccion",
    "suelo",
    "campo",
    "agricultura",
    "cooperativa",
    "empresa",
    "fabrica",
    "industria",
    "cosecha",
    "ganado",
    "tierra",
    "semilla",
    "riego",
    "obrero",
    "salario"
  ],
  "infancia-escuela-cultura": [
    "educacion",
    "escuela",
    "nino",
    "infancia",
    "juventud",
    "cultura",
    "maestro",
    "docente",
    "universidad",
    "colegio",
    "jardin",
    "guarderia",
    "arte",
    "musica",
    "libro",
    "biblioteca",
    "estudiante"
  ],
  "instituciones-y-futuro": [
    "justicia",
    "corrupcion",
    "juez",
    "tribunal",
    "ley",
    "constitucion",
    "droga",
    "narcotrafico",
    "moneda",
    "peso",
    "dolar",
    "inflacion",
    "soberania",
    "congreso",
    "senador",
    "diputado",
    "policia",
    "democracia"
  ]
};
var MIN_WORD_LENGTH = 4;
function normalize(text2) {
  return text2.toLowerCase().replace(/[áà]/g, "a").replace(/[éè]/g, "e").replace(/[íì]/g, "i").replace(/[óò]/g, "o").replace(/[úù]/g, "u").replace(/ñ/g, "n");
}
function extractWords(text2, minLength = MIN_WORD_LENGTH) {
  return normalize(text2).split(/\W+/).filter((w) => w.length >= minLength);
}
function planToKeyword(plan) {
  const match = plan.match(/^PLAN(.+)$/i);
  if (match && match[1].length >= 2) {
    return match[1].toLowerCase();
  }
  return null;
}
function buildMissionKeywords(mission) {
  const keywordSet = /* @__PURE__ */ new Set();
  const domainKeywords = MISSION_KEYWORDS[mission.slug] ?? [];
  for (const kw of domainKeywords) {
    keywordSet.add(normalize(kw));
  }
  for (const plan of mission.plans) {
    const kw = planToKeyword(plan);
    if (kw) keywordSet.add(kw);
    keywordSet.add(normalize(plan));
  }
  for (const word of extractWords(mission.description)) {
    keywordSet.add(word);
  }
  for (const word of extractWords(mission.whatHurts)) {
    keywordSet.add(word);
  }
  const citizenText = mission.citizenCanDo.join(" ");
  for (const word of extractWords(citizenText)) {
    keywordSet.add(word);
  }
  return Array.from(keywordSet);
}
function buildDreamText(dream) {
  return normalize([
    dream.dream ?? "",
    dream.value ?? "",
    dream.need ?? "",
    dream.basta ?? ""
  ].join(" "));
}
function scoreDreamForMission(dream, mission) {
  const dreamText = buildDreamText(dream);
  const keywords = buildMissionKeywords(mission);
  const matchedKeywords = [];
  for (const keyword of keywords) {
    if (keyword.length === 0) continue;
    if (dreamText.includes(keyword)) {
      matchedKeywords.push(keyword);
    }
  }
  return {
    missionSlug: mission.slug,
    score: matchedKeywords.length,
    matchedKeywords
  };
}
function matchDreamToMissions(dream, missions) {
  return missions.map((mission) => scoreDreamForMission(dream, mission)).sort((a, b) => b.score - a.score);
}

// shared/flywheel-mappings.ts
var ARCHETYPE_TO_ROLE = {
  el_vigia: "custodio",
  // Both: vigilance, accountability
  el_catalizador: "organizador",
  // Both: mobilize, coordinate
  el_puente: "narrador",
  // Both: connect through communication
  la_raiz: "constructor",
  // Both: build at the local level
  el_sembrador: "testigo",
  // Both: observe and document
  el_espejo: "declarante"
  // Both: reflect and express truth
};
var LIFE_AREA_TO_MISSION = {
  "Salud": "la-base-esta",
  "Entorno": "la-base-esta",
  "Comunidad": "territorio-legible",
  "Amigos": "territorio-legible",
  "Carrera": "produccion-y-suelo-vivo",
  "Dinero": "produccion-y-suelo-vivo",
  "Crecimiento personal": "infancia-escuela-cultura",
  "Espiritualidad": "infancia-escuela-cultura",
  "Amor": "infancia-escuela-cultura",
  "Familia": "la-base-esta",
  "Apariencia": "la-base-esta",
  "Recreaci\xF3n": "infancia-escuela-cultura"
};
var ROLE_LABELS = {
  testigo: "Testigo",
  declarante: "Declarante",
  constructor: "Constructor",
  custodio: "Custodio",
  organizador: "Organizador",
  narrador: "Narrador"
};
function computeMissionAlignment(archetype, lifeAreaGaps) {
  const role = archetype && ARCHETYPE_TO_ROLE[archetype] || "testigo";
  const roleLabel = ROLE_LABELS[role];
  let missionSlug = "instituciones-y-futuro";
  let reason = "Tus areas de vida estan equilibradas \u2014 podes contribuir a nivel institucional.";
  let secondaryMission;
  if (lifeAreaGaps.length > 0) {
    const sorted = [...lifeAreaGaps].sort((a, b) => b.gap - a.gap);
    const weakest = sorted[0];
    const allStrong = sorted.every((g) => g.current >= 60);
    if (!allStrong && weakest.gap > 0) {
      const mapped = LIFE_AREA_TO_MISSION[weakest.area];
      if (mapped) {
        missionSlug = mapped;
        const mission2 = MISSIONS.find((m) => m.slug === mapped);
        reason = `Tu area mas debil es ${weakest.area} (${weakest.current}/100). La ${mission2?.label || "mision"} trabaja exactamente en eso.`;
      }
    }
    if (sorted.length > 1) {
      const secondWeakest = sorted[1];
      const secondMapped = LIFE_AREA_TO_MISSION[secondWeakest.area];
      if (secondMapped && secondMapped !== missionSlug) {
        secondaryMission = secondMapped;
      }
    }
  }
  const mission = MISSIONS.find((m) => m.slug === missionSlug);
  return {
    recommendedMission: missionSlug,
    recommendedMissionLabel: mission?.label || missionSlug,
    recommendedMissionNumber: mission?.number || 0,
    recommendedRole: role,
    recommendedRoleLabel: roleLabel,
    reason,
    secondaryMission
  };
}

// server/services/embedding-service.ts
init_db();
init_schema();
import { eq as eq12, and as and11 } from "drizzle-orm";
var embeddingPipeline = null;
async function getEmbeddingPipeline() {
  if (!embeddingPipeline) {
    try {
      const { pipeline: pipeline2 } = await import("@xenova/transformers");
      embeddingPipeline = await pipeline2(
        "feature-extraction",
        "Xenova/all-MiniLM-L6-v2"
      );
    } catch (error) {
      console.error("Failed to load embedding model:", error);
      throw new Error("Embedding model initialization failed");
    }
  }
  return embeddingPipeline;
}
async function generateEmbedding(text2) {
  if (!text2 || text2.trim().length === 0) {
    throw new Error("Text cannot be empty");
  }
  try {
    const extractor = await getEmbeddingPipeline();
    const output = await extractor(text2, {
      pooling: "mean",
      normalize: true
    });
    const embedding = Array.from(output.data);
    return embedding;
  } catch (error) {
    console.error("Error generating embedding:", error);
    throw new Error("Failed to generate embedding");
  }
}
async function getOrCreateEmbedding(contentId, text2, contentType) {
  if (!text2 || text2.trim().length === 0) {
    throw new Error("Text cannot be empty for embedding");
  }
  try {
    const existing = await db.select().from(textEmbeddings).where(
      and11(
        eq12(textEmbeddings.contentId, contentId),
        eq12(textEmbeddings.contentType, contentType)
      )
    ).limit(1);
    if (existing.length > 0 && existing[0].embedding) {
      try {
        const embedding2 = JSON.parse(existing[0].embedding);
        if (Array.isArray(embedding2) && embedding2.length > 0) {
          return embedding2;
        }
      } catch (parseError) {
        console.warn("Failed to parse cached embedding, regenerating:", parseError);
      }
    }
    const embedding = await generateEmbedding(text2);
    const embeddingJson = JSON.stringify(embedding);
    if (existing.length > 0) {
      await db.update(textEmbeddings).set({
        embedding: embeddingJson,
        model: "Xenova/all-MiniLM-L6-v2"
      }).where(
        and11(
          eq12(textEmbeddings.contentId, contentId),
          eq12(textEmbeddings.contentType, contentType)
        )
      );
    } else {
      await db.insert(textEmbeddings).values({
        contentId,
        contentType,
        embedding: embeddingJson,
        model: "Xenova/all-MiniLM-L6-v2"
      });
    }
    return embedding;
  } catch (error) {
    console.error("Error in getOrCreateEmbedding:", error);
    throw error;
  }
}
function calculateCosineSimilarity(vecA, vecB) {
  if (vecA.length !== vecB.length) {
    console.warn("Vector length mismatch, padding with zeros");
    const maxLen = Math.max(vecA.length, vecB.length);
    while (vecA.length < maxLen) vecA.push(0);
    while (vecB.length < maxLen) vecB.push(0);
  }
  const dotProduct = vecA.reduce((sum, a, i) => sum + a * (vecB[i] || 0), 0);
  const normA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const normB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
  if (normA === 0 || normB === 0) {
    return 0;
  }
  const similarity = dotProduct / (normA * normB);
  return Math.max(0, Math.min(1, similarity));
}
async function batchGenerateEmbeddings(contributions, batchSize = 10) {
  const results = /* @__PURE__ */ new Map();
  const batches = [];
  for (let i = 0; i < contributions.length; i += batchSize) {
    batches.push(contributions.slice(i, i + batchSize));
  }
  for (const batch of batches) {
    const batchPromises = batch.map(async (contrib) => {
      try {
        const embedding = await getOrCreateEmbedding(
          contrib.id,
          contrib.text,
          contrib.type
        );
        return { id: contrib.id, embedding };
      } catch (error) {
        console.error(`Failed to generate embedding for contribution ${contrib.id}:`, error);
        return null;
      }
    });
    const batchResults = await Promise.all(batchPromises);
    batchResults.forEach((result) => {
      if (result) {
        results.set(result.id, result.embedding);
      }
    });
  }
  return results;
}

// server/routes.ts
async function requireMembership(postId, userId) {
  const post = await storage.getCommunityPostWithDetails(postId);
  if (post && post.userId === userId) return true;
  const members = await storage.getInitiativeMembers(postId);
  return members.some((m) => m.userId === userId);
}
async function notifyInitiativeMembers(postId, excludeUserId, data) {
  const members = await storage.getInitiativeMembers(postId);
  for (const m of members) {
    if (m.userId && m.userId !== excludeUserId) {
      try {
        await storage.createNotification(m.userId, {
          ...data,
          postId,
          userId: m.userId,
          type: data.type
        });
      } catch (_) {
      }
    }
  }
}
async function registerRoutes(app2) {
  app2.use(requestLogger);
  app2.use(sanitizeInput);
  app2.use(requestSizeLimiter("10mb"));
  app2.use("/api", generalRateLimit);
  app2.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      uptime: process.uptime()
    });
  });
  app2.get("/api/test-db", async (req, res) => {
    try {
      const dreams3 = await storage.getDreams();
      res.json({
        status: "ok",
        dreamsCount: dreams3.length,
        message: "Database connection working"
      });
    } catch (error) {
      res.status(500).json({
        status: "error",
        message: "Database connection failed",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.use("/api/auth", routes_advanced_auth_default);
  registerInitiativeRoutes(app2);
  registerCourseRoutes(app2);
  registerLifeAreasRoutes(app2);
  registerCivicAssessmentRoutes(app2);
  registerGoalRoutes(app2);
  registerCoachingRoutes(app2);
  registerOpenDataRoutes(app2);
  registerPulseRoutes(app2);
  startMandatoCron();
  app2.get("/api/dreams", optionalAuth, async (req, res) => {
    try {
      const dreams3 = await storage.getDreams();
      res.json(dreams3);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dreams" });
    }
  });
  app2.post("/api/dreams", authenticateToken, async (req, res) => {
    try {
      const validatedData = insertDreamSchema.parse({
        ...req.body,
        userId: req.user?.userId ?? req.body.userId
      });
      const dream = await storage.createDream(validatedData);
      res.status(201).json(dream);
    } catch (error) {
      if (error instanceof z5.ZodError) {
        res.status(400).json({ message: "Invalid dream data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create dream" });
      }
    }
  });
  app2.get("/api/resources-map", optionalAuth, async (req, res) => {
    try {
      const resources2 = await storage.getUserResources();
      res.json(resources2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch resources" });
    }
  });
  app2.post("/api/resources-map", authenticateToken, sanitizeInput, async (req, res) => {
    try {
      const validatedData = insertUserResourceSchema.parse({
        ...req.body,
        userId: req.user?.userId
      });
      const resource = await storage.createUserResource(validatedData);
      res.status(201).json(resource);
    } catch (error) {
      if (error instanceof z5.ZodError) {
        res.status(400).json({ message: "Invalid resource data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create resource" });
      }
    }
  });
  app2.post("/api/mandates/generate", authenticateToken, async (req, res) => {
    try {
      const { territoryLevel, territoryName, province, city } = req.body;
      if (!territoryLevel || !territoryName) {
        return res.status(400).json({ message: "territoryLevel and territoryName are required" });
      }
      const { generateAndSaveMandate: generateAndSaveMandate2 } = await Promise.resolve().then(() => (init_mandato_engine(), mandato_engine_exports));
      const result = await generateAndSaveMandate2(territoryLevel, territoryName, province, city);
      res.json(result);
    } catch (error) {
      console.error("Mandate generation error:", error);
      res.status(500).json({ message: "Failed to generate mandate" });
    }
  });
  app2.get("/api/mandates", optionalAuth, async (req, res) => {
    try {
      const level = req.query.level;
      const mandates = await storage.getMandates(level);
      res.json(mandates);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch mandates" });
    }
  });
  app2.get("/api/mandates/:level/:name", async (req, res) => {
    try {
      const { level, name } = req.params;
      const mandate = await storage.getMandateByTerritory(level, decodeURIComponent(name));
      if (!mandate) {
        return res.status(404).json({ message: "No mandate found for this territory" });
      }
      const safeJsonParse2 = (val) => {
        if (!val) return null;
        if (typeof val === "object") return val;
        try {
          return JSON.parse(val);
        } catch {
          return null;
        }
      };
      const parsed = {
        ...mandate,
        diagnosis: safeJsonParse2(mandate.diagnosis),
        availableResources: safeJsonParse2(mandate.availableResources),
        gaps: safeJsonParse2(mandate.gaps),
        suggestedActions: safeJsonParse2(mandate.suggestedActions)
      };
      res.json(parsed);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch mandate" });
    }
  });
  app2.post("/api/mandates/:id/publish", authenticateToken, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid mandate ID" });
      const updated = await storage.updateMandate(id, {
        status: "published",
        publishedAt: (/* @__PURE__ */ new Date()).toISOString()
      });
      if (!updated) return res.status(404).json({ message: "Mandate not found" });
      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: "Failed to publish mandate" });
    }
  });
  app2.post("/api/matchmaker/scan", authenticateToken, async (req, res) => {
    try {
      const { scanAndSaveSuggestions: scanAndSaveSuggestions2 } = await Promise.resolve().then(() => (init_matchmaker_service(), matchmaker_service_exports));
      const saved = await scanAndSaveSuggestions2();
      res.json({ suggestions: saved, count: saved.length });
    } catch (error) {
      console.error("Matchmaker scan error:", error);
      res.status(500).json({ message: "Failed to scan for matches" });
    }
  });
  app2.get("/api/suggestions/:territory", optionalAuth, async (req, res) => {
    try {
      const territory = decodeURIComponent(req.params.territory);
      const suggestions = await storage.getSuggestionsByTerritory(territory);
      res.json(suggestions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch suggestions" });
    }
  });
  app2.post("/api/suggestions/:id/activate", authenticateToken, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid suggestion ID" });
      const userId = req.user?.userId;
      if (!userId) return res.status(401).json({ message: "Auth required" });
      const suggestion = await storage.getSuggestionById(id);
      if (!suggestion) return res.status(404).json({ message: "Suggestion not found" });
      if (suggestion.status !== "suggested") return res.status(400).json({ message: "Suggestion already activated" });
      const rawTitle = suggestion.suggestedAction.split("\n")[0] || "Iniciativa Comunitaria";
      const initiative = await storage.createCommunityPost({
        userId,
        title: rawTitle.length > 200 ? rawTitle.substring(0, 200) + "\u2026" : rawTitle,
        description: suggestion.suggestedAction,
        type: "project",
        location: suggestion.territoryName || "Argentina"
      });
      const activated = await storage.activateSuggestion(id, userId, initiative.id);
      res.json({ suggestion: activated, initiative });
    } catch (error) {
      res.status(500).json({ message: "Failed to activate suggestion" });
    }
  });
  let graphCache = null;
  const CACHE_TTL2 = 5 * 60 * 1e3;
  function generatePersonPosition(index2, total) {
    const radius = 8 + (total > 10 ? Math.min(4, Math.floor(total / 5)) : 0);
    const theta = index2 / total * Math.PI * 2;
    const phi = Math.acos(index2 * 2 / total - 1);
    return [
      radius * Math.sin(phi) * Math.cos(theta),
      radius * Math.sin(phi) * Math.sin(theta),
      radius * Math.cos(phi)
    ];
  }
  function generateConceptPosition(personPos, conceptType, indexInType, totalOfType) {
    const typeOffsets = {
      dream: { angle: 0, elevation: Math.PI / 4 },
      // Up and forward
      value: { angle: Math.PI / 2, elevation: Math.PI / 4 },
      // Up and right
      need: { angle: Math.PI, elevation: Math.PI / 4 },
      // Up and back
      basta: { angle: 3 * Math.PI / 2, elevation: Math.PI / 4 }
      // Up and left
    };
    const offset = typeOffsets[conceptType] || { angle: 0, elevation: 0 };
    const distance = 2.5 + indexInType * 0.5;
    const spreadAngle = indexInType / Math.max(1, totalOfType - 1) * Math.PI * 0.5;
    const relativeX = distance * Math.sin(offset.elevation) * Math.cos(offset.angle + spreadAngle);
    const relativeY = distance * Math.sin(offset.elevation) * Math.sin(offset.angle + spreadAngle);
    const relativeZ = distance * Math.cos(offset.elevation);
    return [
      personPos[0] + relativeX,
      personPos[1] + relativeY,
      personPos[2] + relativeZ
    ];
  }
  function groupContributionsByUser(contributions) {
    const userMap = /* @__PURE__ */ new Map();
    contributions.forEach((contrib) => {
      if (!contrib.userId) return;
      const text2 = contrib.dream || contrib.value || contrib.need || contrib.basta || "";
      if (!text2.trim()) return;
      const type = contrib.type || "dream";
      if (!userMap.has(contrib.userId)) {
        userMap.set(contrib.userId, []);
      }
      userMap.get(contrib.userId).push({
        id: contrib.id,
        type,
        text: text2.trim(),
        originalContrib: contrib
      });
    });
    return userMap;
  }
  app2.get("/api/neural-network/graph", optionalAuth, async (req, res) => {
    try {
      const minSimilarity = parseFloat(req.query.minSimilarity || "0.3");
      const maxConnections = parseInt(req.query.maxConnections || "10");
      const useCache = req.query.cache !== "false";
      if (useCache && graphCache && Date.now() - graphCache.timestamp < CACHE_TTL2) {
        return res.json(graphCache.data);
      }
      const allContributions = await storage.getDreams();
      if (!Array.isArray(allContributions) || allContributions.length === 0) {
        return res.json({
          people: [],
          crossConnections: [],
          metadata: {
            totalPeople: 0,
            totalConcepts: 0,
            totalConnections: 0,
            avgSimilarity: 0,
            generatedAt: (/* @__PURE__ */ new Date()).toISOString()
          }
        });
      }
      const userContributionsMap = groupContributionsByUser(allContributions);
      if (userContributionsMap.size === 0) {
        return res.json({
          people: [],
          crossConnections: [],
          metadata: {
            totalPeople: 0,
            totalConcepts: 0,
            totalConnections: 0,
            avgSimilarity: 0,
            generatedAt: (/* @__PURE__ */ new Date()).toISOString()
          }
        });
      }
      const userIds = Array.from(userContributionsMap.keys());
      const userPromises = userIds.map((userId) => storage.getUser(userId));
      const users2 = (await Promise.all(userPromises)).filter((u) => u !== void 0);
      const peoplePositions = /* @__PURE__ */ new Map();
      users2.forEach((user, index2) => {
        peoplePositions.set(user.id, generatePersonPosition(index2, users2.length));
      });
      const typeColors = {
        dream: "#3b82f6",
        // blue
        value: "#ec4899",
        // pink
        need: "#f59e0b",
        // amber
        basta: "#ef4444"
        // red
      };
      const people = [];
      const allConceptsForEmbedding = [];
      for (const user of users2) {
        const contributions = userContributionsMap.get(user.id) || [];
        const personPos = peoplePositions.get(user.id);
        const conceptsByType = {
          dream: [],
          value: [],
          need: [],
          basta: []
        };
        contributions.forEach((contrib) => {
          conceptsByType[contrib.type].push(contrib);
        });
        const concepts = {
          dreams: conceptsByType.dream.map((contrib, idx) => {
            allConceptsForEmbedding.push({
              id: contrib.id,
              text: contrib.text,
              type: "dream",
              personId: user.id
            });
            return {
              id: contrib.id,
              text: contrib.text.substring(0, 200),
              position: generateConceptPosition(personPos, "dream", idx, conceptsByType.dream.length),
              color: typeColors.dream,
              size: 1
            };
          }),
          values: conceptsByType.value.map((contrib, idx) => {
            allConceptsForEmbedding.push({
              id: contrib.id,
              text: contrib.text,
              type: "value",
              personId: user.id
            });
            return {
              id: contrib.id,
              text: contrib.text.substring(0, 200),
              position: generateConceptPosition(personPos, "value", idx, conceptsByType.value.length),
              color: typeColors.value,
              size: 1
            };
          }),
          needs: conceptsByType.need.map((contrib, idx) => {
            allConceptsForEmbedding.push({
              id: contrib.id,
              text: contrib.text,
              type: "need",
              personId: user.id
            });
            return {
              id: contrib.id,
              text: contrib.text.substring(0, 200),
              position: generateConceptPosition(personPos, "need", idx, conceptsByType.need.length),
              color: typeColors.need,
              size: 1
            };
          }),
          basta: conceptsByType.basta.map((contrib, idx) => {
            allConceptsForEmbedding.push({
              id: contrib.id,
              text: contrib.text,
              type: "basta",
              personId: user.id
            });
            return {
              id: contrib.id,
              text: contrib.text.substring(0, 200),
              position: generateConceptPosition(personPos, "basta", idx, conceptsByType.basta.length),
              color: typeColors.basta,
              size: 1
            };
          })
        };
        people.push({
          id: user.id,
          name: user.name || "Usuario",
          username: user.username || `user${user.id}`,
          position: personPos,
          concepts
        });
      }
      if (allConceptsForEmbedding.length === 0) {
        return res.json({
          people,
          crossConnections: [],
          metadata: {
            totalPeople: people.length,
            totalConcepts: 0,
            totalConnections: 0,
            avgSimilarity: 0,
            generatedAt: (/* @__PURE__ */ new Date()).toISOString()
          }
        });
      }
      const embeddingMap = await batchGenerateEmbeddings(
        allConceptsForEmbedding.map((c) => ({
          id: c.id,
          text: c.text,
          type: c.type
        })),
        20
        // Batch size
      );
      const crossConnections = [];
      const conceptArray = allConceptsForEmbedding;
      const conceptEmbeddings = Array.from(embeddingMap.entries());
      let totalSimilarity = 0;
      let similarityCount = 0;
      const conceptMap = /* @__PURE__ */ new Map();
      conceptArray.forEach((c) => conceptMap.set(c.id, c));
      for (let i = 0; i < conceptEmbeddings.length; i++) {
        const [sourceConceptId, sourceEmbedding] = conceptEmbeddings[i];
        const sourceConcept = conceptMap.get(sourceConceptId);
        if (!sourceConcept) continue;
        const connections = [];
        for (let j = i + 1; j < conceptEmbeddings.length; j++) {
          const [targetConceptId, targetEmbedding] = conceptEmbeddings[j];
          const targetConcept = conceptMap.get(targetConceptId);
          if (!targetConcept) continue;
          if (sourceConcept.personId === targetConcept.personId) continue;
          const similarity = calculateCosineSimilarity(sourceEmbedding, targetEmbedding);
          if (similarity >= minSimilarity) {
            connections.push({ targetConceptId, similarity });
            totalSimilarity += similarity;
            similarityCount++;
          }
        }
        connections.sort((a, b) => b.similarity - a.similarity).slice(0, maxConnections).forEach((conn) => {
          const targetConcept = conceptMap.get(conn.targetConceptId);
          if (targetConcept) {
            crossConnections.push({
              from: {
                personId: sourceConcept.personId,
                conceptId: sourceConceptId,
                type: sourceConcept.type
              },
              to: {
                personId: targetConcept.personId,
                conceptId: conn.targetConceptId,
                type: targetConcept.type
              },
              strength: conn.similarity,
              similarity: conn.similarity
            });
          }
        });
      }
      const avgSimilarity = similarityCount > 0 ? totalSimilarity / similarityCount : 0;
      const totalConcepts = allConceptsForEmbedding.length;
      const graphData = {
        people,
        crossConnections,
        metadata: {
          totalPeople: people.length,
          totalConcepts,
          totalConnections: crossConnections.length,
          avgSimilarity,
          generatedAt: (/* @__PURE__ */ new Date()).toISOString()
        }
      };
      if (useCache) {
        graphCache = {
          data: graphData,
          timestamp: Date.now()
        };
      }
      res.json(graphData);
    } catch (error) {
      console.error("Neural network graph error:", error);
      res.status(500).json({
        error: "Failed to generate graph",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.get("/api/community", optionalAuth, async (req, res) => {
    try {
      const type = req.query.type;
      const search = req.query.search;
      const category = req.query.category;
      let posts = await storage.getCommunityPosts(type);
      if (search) {
        posts = posts.filter(
          (post) => post.title.toLowerCase().includes(search.toLowerCase()) || post.description.toLowerCase().includes(search.toLowerCase())
        );
      }
      const postsWithAuthors = await Promise.all(posts.map(async (post) => {
        let enriched = { ...post };
        if (post.userId) {
          const user = await storage.getUser(post.userId);
          if (user) {
            enriched.author = {
              id: user.id,
              name: user.name,
              username: user.username
            };
          }
        }
        try {
          enriched.likesCount = await storage.getCommunityPostLikesCount(post.id);
          enriched.viewsCount = await storage.getCommunityPostViewsCount(post.id);
        } catch (_) {
          enriched.likesCount = 0;
          enriched.viewsCount = 0;
        }
        if (req.user?.userId) {
          try {
            enriched.likedByMe = await storage.isPostLikedByUser(post.id, req.user.userId);
          } catch (_) {
            enriched.likedByMe = false;
          }
        } else {
          enriched.likedByMe = false;
        }
        enriched.missionSlug = post.missionSlug || null;
        enriched.memberCount = post.memberCount || 0;
        return enriched;
      }));
      if (type === "mission") {
        postsWithAuthors.sort((a, b) => {
          const aIdx = MISSIONS.findIndex((m) => m.slug === a.missionSlug);
          const bIdx = MISSIONS.findIndex((m) => m.slug === b.missionSlug);
          return aIdx - bIdx;
        });
      }
      res.json(postsWithAuthors);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch community posts" });
    }
  });
  app2.post("/api/community", authenticateToken, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const validatedData = insertCommunityPostSchema.parse({
        ...req.body,
        userId: req.user.userId
        // Assign userId automatically from authenticated user
      });
      const post = await storage.createCommunityPost(validatedData);
      try {
        await storage.createActivityFeedItem({
          type: "new_initiative",
          postId: post.id,
          userId: req.user.userId,
          title: `Nueva iniciativa: ${post.title}`,
          description: post.description?.substring(0, 100) || null
        });
      } catch (_) {
      }
      res.status(201).json(post);
    } catch (error) {
      if (error instanceof z5.ZodError) {
        res.status(400).json({ message: "Invalid post data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create community post" });
      }
    }
  });
  app2.get("/api/community/my-memberships", authenticateToken, async (req, res) => {
    try {
      const memberships = await storage.getUserMemberships(req.user.userId);
      res.json(memberships);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch memberships" });
    }
  });
  app2.get("/api/community/my-posts", authenticateToken, async (req, res) => {
    try {
      const posts = await storage.getUserCommunityPosts(req.user.userId);
      res.json(posts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch your posts" });
    }
  });
  app2.get("/api/community/my-interactions", authenticateToken, async (req, res) => {
    try {
      const interactions = await storage.getUserInteractions(req.user.userId);
      res.json(interactions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch your interactions" });
    }
  });
  app2.get("/api/community/my-activity", authenticateToken, async (req, res) => {
    try {
      const activity = await storage.getUserActivityHistory(req.user.userId);
      res.json(activity);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch activity history" });
    }
  });
  app2.get("/api/community/messages", authenticateToken, async (req, res) => {
    try {
      const messages = await storage.getUserMessages(req.user.userId);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });
  app2.get("/api/community/messages/unread/count", authenticateToken, async (req, res) => {
    try {
      const count3 = await storage.getUnreadMessageCount(req.user.userId);
      res.json({ count: count3 });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch unread message count" });
    }
  });
  app2.get("/api/community/search/location", async (req, res) => {
    try {
      const {
        province,
        city,
        radius,
        userLat,
        userLng
      } = req.query;
      const radiusKm = radius ? parseInt(radius) : void 0;
      const latitude = userLat ? parseFloat(userLat) : void 0;
      const longitude = userLng ? parseFloat(userLng) : void 0;
      const posts = await storage.searchPostsByLocation(
        province,
        city,
        radiusKm,
        latitude,
        longitude
      );
      res.json(posts);
    } catch (error) {
      res.status(500).json({ message: "Failed to search posts by location" });
    }
  });
  app2.get("/api/community/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const postId = parseInt(id);
      if (isNaN(postId)) {
        return res.status(400).json({ message: "Invalid post ID" });
      }
      const post = await storage.getCommunityPostWithDetails(postId);
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      res.json(post);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch post" });
    }
  });
  app2.put("/api/community/:id", authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const postId = parseInt(id);
      if (isNaN(postId)) {
        return res.status(400).json({ message: "Invalid post ID" });
      }
      const validatedData = insertCommunityPostSchema.partial().parse(req.body);
      const updatedPost = await storage.updateCommunityPost(postId, validatedData, req.user.userId);
      if (!updatedPost) {
        return res.status(404).json({ message: "Post not found or you don't have permission to edit it" });
      }
      res.json(updatedPost);
    } catch (error) {
      if (error instanceof z5.ZodError) {
        res.status(400).json({ message: "Invalid post data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update post" });
      }
    }
  });
  app2.delete("/api/community/:id", authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const postId = parseInt(id);
      if (isNaN(postId)) {
        return res.status(400).json({ message: "Invalid post ID" });
      }
      const success = await storage.deleteCommunityPost(postId, req.user.userId);
      if (!success) {
        return res.status(404).json({ message: "Post not found or you don't have permission to delete it" });
      }
      res.json({ message: "Post deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete post" });
    }
  });
  app2.patch("/api/community/:id/status", authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const postId = parseInt(id);
      if (isNaN(postId)) {
        return res.status(400).json({ message: "Invalid post ID" });
      }
      if (!["active", "paused", "closed"].includes(status)) {
        return res.status(400).json({ message: "Invalid status. Must be active, paused, or closed" });
      }
      const updatedPost = await storage.updateCommunityPost(postId, { status }, req.user.userId);
      if (!updatedPost) {
        return res.status(404).json({ message: "Post not found or you don't have permission to edit it" });
      }
      res.json(updatedPost);
    } catch (error) {
      res.status(500).json({ message: "Failed to update post status" });
    }
  });
  app2.post("/api/community/:id/interact", authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const { type, message } = req.body;
      const postId = parseInt(id);
      if (isNaN(postId)) {
        return res.status(400).json({ message: "Invalid post ID" });
      }
      if (!["apply", "interest", "volunteer", "save"].includes(type)) {
        return res.status(400).json({ message: "Invalid interaction type" });
      }
      const interactionData = {
        postId,
        userId: req.user.userId,
        type,
        message: message || null
      };
      const validatedData = insertCommunityPostInteractionSchema.parse(interactionData);
      const interaction = await storage.createPostInteraction(validatedData);
      res.status(201).json(interaction);
    } catch (error) {
      if (error instanceof z5.ZodError) {
        res.status(400).json({ message: "Invalid interaction data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create interaction" });
      }
    }
  });
  app2.get("/api/community/:id/interactions", authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const postId = parseInt(id);
      if (isNaN(postId)) {
        return res.status(400).json({ message: "Invalid post ID" });
      }
      const post = await storage.getCommunityPostWithDetails(postId);
      if (!post || post.userId !== req.user.userId) {
        return res.status(403).json({ message: "You don't have permission to view these interactions" });
      }
      const interactions = await storage.getPostInteractions(postId);
      res.json(interactions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch interactions" });
    }
  });
  app2.patch("/api/community/interactions/:id", authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const interactionId = parseInt(id);
      if (isNaN(interactionId)) {
        return res.status(400).json({ message: "Invalid interaction ID" });
      }
      if (!["pending", "accepted", "rejected", "completed"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      const success = await storage.updateInteractionStatus(interactionId, status, req.user.userId);
      if (!success) {
        return res.status(404).json({ message: "Interaction not found or you don't have permission to update it" });
      }
      res.json({ message: "Interaction status updated successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to update interaction status" });
    }
  });
  app2.post("/api/community/messages", authenticateToken, async (req, res) => {
    try {
      const { receiverId, postId, subject, content } = req.body;
      if (!receiverId || !subject || !content) {
        return res.status(400).json({ message: "Missing required fields: receiverId, subject, content" });
      }
      const messageData = {
        senderId: req.user.userId,
        receiverId,
        postId: postId || null,
        subject,
        content
      };
      const validatedData = insertCommunityMessageSchema.parse(messageData);
      const message = await storage.createCommunityMessage(validatedData);
      res.status(201).json(message);
    } catch (error) {
      if (error instanceof z5.ZodError) {
        res.status(400).json({ message: "Invalid message data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to send message" });
      }
    }
  });
  app2.patch("/api/community/messages/:id/read", authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const messageId = parseInt(id);
      if (isNaN(messageId)) {
        return res.status(400).json({ message: "Invalid message ID" });
      }
      const success = await storage.markMessageAsRead(messageId, req.user.userId);
      if (!success) {
        return res.status(404).json({ message: "Message not found or you don't have permission to read it" });
      }
      res.json({ message: "Message marked as read" });
    } catch (error) {
      res.status(500).json({ message: "Failed to mark message as read" });
    }
  });
  app2.post("/api/community/:id/view", optionalAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const postId = parseInt(id);
      if (isNaN(postId)) {
        return res.status(400).json({ message: "Invalid post ID" });
      }
      const activityData = {
        postId,
        userId: req.user?.userId || null,
        activityType: "view",
        metadata: JSON.stringify({
          userAgent: req.get("User-Agent"),
          ip: req.ip,
          timestamp: (/* @__PURE__ */ new Date()).toISOString()
        })
      };
      const validatedData = insertCommunityPostActivitySchema.parse(activityData);
      const ipAddress = req.ip;
      const userAgent = req.get("User-Agent");
      const [activity, view] = await Promise.all([
        storage.recordPostActivity(validatedData),
        storage.recordCommunityPostView(postId, req.user?.userId || null, ipAddress, userAgent)
      ]);
      res.status(201).json({ message: "View recorded", activity, view });
    } catch (error) {
      res.status(500).json({ message: "Failed to record view" });
    }
  });
  app2.get("/api/community/:id/analytics", authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const postId = parseInt(id);
      if (isNaN(postId)) {
        return res.status(400).json({ message: "Invalid post ID" });
      }
      const analytics = await storage.getPostAnalytics(postId, req.user.userId);
      if (!analytics) {
        return res.status(404).json({ message: "Post not found or you don't have permission to view analytics" });
      }
      res.json(analytics);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });
  app2.get("/api/geographic/provinces", async (req, res) => {
    try {
      const provinces = await storage.getProvinces();
      res.json(provinces);
    } catch (error) {
      res.status(500).json({ message: "Failed to get provinces" });
    }
  });
  app2.get("/api/geographic/provinces/:provinceId/cities", async (req, res) => {
    try {
      const { provinceId } = req.params;
      const cities = await storage.getCitiesByProvince(parseInt(provinceId));
      res.json(cities);
    } catch (error) {
      res.status(500).json({ message: "Failed to get cities" });
    }
  });
  app2.post("/api/community/:id/like", authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const postId = parseInt(id);
      if (isNaN(postId)) {
        return res.status(400).json({ message: "Invalid post ID" });
      }
      const alreadyLiked = await storage.isPostLikedByUser(postId, req.user.userId);
      if (alreadyLiked) {
        return res.status(409).json({ message: "Already liked" });
      }
      const like2 = await storage.likePost(postId, req.user.userId);
      res.status(201).json(like2);
    } catch (error) {
      if (error?.code === "23505") {
        return res.status(409).json({ message: "Already liked" });
      }
      res.status(500).json({ message: "Failed to like post" });
    }
  });
  app2.delete("/api/community/:id/like", authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const postId = parseInt(id);
      if (isNaN(postId)) {
        return res.status(400).json({ message: "Invalid post ID" });
      }
      const success = await storage.unlikePost(postId, req.user.userId);
      res.json({ success });
    } catch (error) {
      res.status(500).json({ message: "Failed to unlike post" });
    }
  });
  app2.get("/api/community/:id/like-status", authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const postId = parseInt(id);
      if (isNaN(postId)) {
        return res.status(400).json({ message: "Invalid post ID" });
      }
      const isLiked = await storage.isPostLikedByUser(postId, req.user.userId);
      res.json({ isLiked });
    } catch (error) {
      res.status(500).json({ message: "Failed to check like status" });
    }
  });
  app2.get("/api/community/:id/likes", async (req, res) => {
    try {
      const { id } = req.params;
      const postId = parseInt(id);
      if (isNaN(postId)) {
        return res.status(400).json({ message: "Invalid post ID" });
      }
      const count3 = await storage.getCommunityPostLikesCount(postId);
      res.json({ count: count3 });
    } catch (error) {
      res.status(500).json({ message: "Failed to get likes count" });
    }
  });
  app2.get("/api/community/:id/views", async (req, res) => {
    try {
      const { id } = req.params;
      const postId = parseInt(id);
      if (isNaN(postId)) {
        return res.status(400).json({ message: "Invalid post ID" });
      }
      const count3 = await storage.getCommunityPostViewsCount(postId);
      res.json({ count: count3 });
    } catch (error) {
      res.status(500).json({ message: "Failed to get views count" });
    }
  });
  app2.get("/api/community/:postId/members", async (req, res) => {
    try {
      const { postId } = req.params;
      const id = parseInt(postId);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid post ID" });
      }
      const members = await storage.getInitiativeMembers(id);
      const membersWithUsers = await Promise.all(members.map(async (member) => {
        const user = member.userId ? await storage.getUser(member.userId) : null;
        return {
          ...member,
          user: user ? { id: user.id, name: user.name, username: user.username } : null
        };
      }));
      res.json(membersWithUsers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch initiative members" });
    }
  });
  app2.post("/api/community/:postId/join", authenticateToken, async (req, res) => {
    try {
      const { postId } = req.params;
      const { message, citizenRole } = req.body;
      const id = parseInt(postId);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid post ID" });
      }
      const post = await storage.getCommunityPostWithDetails(id);
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      const existingMembers = await storage.getInitiativeMembers(id);
      const alreadyMember = existingMembers.some((m) => m.userId === req.user.userId && m.status === "active");
      if (alreadyMember) {
        return res.status(409).json({ message: "Ya sos miembro de esta iniciativa" });
      }
      if (post.requiresApproval) {
        const existingRequests = await storage.getMembershipRequests(id, "pending");
        const alreadyRequested = existingRequests.some((r) => r.userId === req.user.userId);
        if (alreadyRequested) {
          return res.status(409).json({ message: "Ya ten\xE9s una solicitud pendiente" });
        }
        const request = await storage.createMembershipRequest(id, req.user.userId, message || "");
        try {
          const user = await storage.getUser(req.user.userId);
          await storage.createNotification(post.userId, {
            type: "member_joined",
            title: "Nueva solicitud de uni\xF3n",
            content: `${user?.name || "Alguien"} quiere unirse a "${post.title}"`,
            postId: id,
            userId: post.userId
          });
        } catch (_) {
        }
        res.status(201).json({
          message: "Solicitud de uni\xF3n enviada",
          request
        });
      } else {
        const validCitizenRoles = ["testigo", "declarante", "constructor", "custodio", "organizador", "narrador"];
        const role = post.type === "mission" && citizenRole && validCitizenRoles.includes(citizenRole) ? citizenRole : "member";
        const member = await storage.addInitiativeMember(id, req.user.userId, role);
        try {
          await storage.createActivityFeedItem({
            type: "new_member",
            postId: id,
            userId: req.user.userId,
            title: `Nuevo miembro en: ${post.title}`
          });
        } catch (_) {
        }
        try {
          const user = await storage.getUser(req.user.userId);
          await storage.createNotification(post.userId, {
            type: "member_joined",
            title: "Nuevo miembro",
            content: `${user?.name || "Alguien"} se uni\xF3 a "${post.title}"`,
            postId: id,
            userId: post.userId
          });
        } catch (_) {
        }
        res.status(201).json({
          message: "Te has unido a la iniciativa",
          member
        });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to join initiative" });
    }
  });
  app2.post("/api/community/:postId/leave", authenticateToken, async (req, res) => {
    try {
      const { postId } = req.params;
      const id = parseInt(postId);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid post ID" });
      }
      const members = await storage.getInitiativeMembers(id);
      const member = members.find((m) => m.userId === req.user.userId);
      if (!member) {
        return res.status(404).json({ message: "Member not found" });
      }
      await storage.removeMember(member.id);
      res.json({ message: "Has abandonado la iniciativa" });
    } catch (error) {
      res.status(500).json({ message: "Failed to leave initiative" });
    }
  });
  app2.get("/api/community/:postId/requests", authenticateToken, async (req, res) => {
    try {
      const { postId } = req.params;
      const { status } = req.query;
      const id = parseInt(postId);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid post ID" });
      }
      const post = await storage.getCommunityPostWithDetails(id);
      if (!post || post.userId !== req.user.userId) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      const requests = await storage.getMembershipRequests(id, status);
      const requestsWithUsers = await Promise.all(requests.map(async (req2) => {
        const user = req2.userId ? await storage.getUser(req2.userId) : null;
        return {
          ...req2,
          user: user ? { id: user.id, name: user.name, username: user.username } : null
        };
      }));
      res.json(requestsWithUsers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch membership requests" });
    }
  });
  app2.post("/api/community/:postId/requests/:requestId/approve", authenticateToken, async (req, res) => {
    try {
      const { postId, requestId } = req.params;
      const id = parseInt(postId);
      const reqId = parseInt(requestId);
      if (isNaN(id) || isNaN(reqId)) {
        return res.status(400).json({ message: "Invalid IDs" });
      }
      const post = await storage.getCommunityPostWithDetails(id);
      if (!post || post.userId !== req.user.userId) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      await storage.approveMembershipRequest(reqId, req.user.userId);
      res.json({ message: "Solicitud aprobada" });
    } catch (error) {
      res.status(500).json({ message: "Failed to approve request" });
    }
  });
  app2.post("/api/community/:postId/requests/:requestId/reject", authenticateToken, async (req, res) => {
    try {
      const { postId, requestId } = req.params;
      const id = parseInt(postId);
      const reqId = parseInt(requestId);
      if (isNaN(id) || isNaN(reqId)) {
        return res.status(400).json({ message: "Invalid IDs" });
      }
      const post = await storage.getCommunityPostWithDetails(id);
      if (!post || post.userId !== req.user.userId) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      await storage.rejectMembershipRequest(reqId, req.user.userId);
      res.json({ message: "Solicitud rechazada" });
    } catch (error) {
      res.status(500).json({ message: "Failed to reject request" });
    }
  });
  app2.get("/api/community/:postId/milestones", async (req, res) => {
    try {
      const { postId } = req.params;
      const id = parseInt(postId);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid post ID" });
      }
      const milestones = await storage.getInitiativeMilestones(id);
      const milestonesWithUsers = await Promise.all(milestones.map(async (milestone) => {
        const completedByUser = milestone.completedBy ? await storage.getUser(milestone.completedBy) : null;
        return {
          ...milestone,
          completedByUser: completedByUser ? { id: completedByUser.id, name: completedByUser.name, username: completedByUser.username } : null
        };
      }));
      res.json(milestonesWithUsers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch milestones" });
    }
  });
  app2.post("/api/community/:postId/milestones", authenticateToken, async (req, res) => {
    try {
      const { postId } = req.params;
      const id = parseInt(postId);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid post ID" });
      }
      if (!await requireMembership(id, req.user.userId)) {
        return res.status(403).json({ message: "Solo miembros pueden crear hitos" });
      }
      const validatedData = insertInitiativeMilestoneSchema.parse(req.body);
      const milestone = await storage.createMilestone(id, validatedData);
      res.status(201).json(milestone);
    } catch (error) {
      if (error instanceof z5.ZodError) {
        res.status(400).json({
          error: "Validation error",
          details: error.errors
        });
      } else {
        res.status(500).json({ message: "Failed to create milestone" });
      }
    }
  });
  app2.patch("/api/community/:postId/milestones/:milestoneId", authenticateToken, async (req, res) => {
    try {
      const { postId, milestoneId } = req.params;
      const id = parseInt(milestoneId);
      const pId = parseInt(postId);
      if (isNaN(id) || isNaN(pId)) {
        return res.status(400).json({ message: "Invalid ID" });
      }
      if (!await requireMembership(pId, req.user.userId)) {
        return res.status(403).json({ message: "Solo miembros pueden actualizar hitos" });
      }
      const updates = insertInitiativeMilestoneSchema.partial().parse(req.body);
      await storage.updateMilestone(id, updates);
      res.json({ message: "Milestone updated" });
    } catch (error) {
      if (error instanceof z5.ZodError) {
        res.status(400).json({
          error: "Validation error",
          details: error.errors
        });
      } else {
        res.status(500).json({ message: "Failed to update milestone" });
      }
    }
  });
  app2.post("/api/community/:postId/milestones/:milestoneId/complete", authenticateToken, async (req, res) => {
    try {
      const { postId, milestoneId } = req.params;
      const id = parseInt(milestoneId);
      const pId = parseInt(postId);
      if (isNaN(id) || isNaN(pId)) {
        return res.status(400).json({ message: "Invalid ID" });
      }
      if (!await requireMembership(pId, req.user.userId)) {
        return res.status(403).json({ message: "Solo miembros pueden completar hitos" });
      }
      await storage.completeMilestone(id, req.user.userId);
      try {
        await storage.createActivityFeedItem({
          type: "milestone_completed",
          postId: pId,
          userId: req.user.userId,
          title: "Hito completado",
          targetId: id
        });
      } catch (_) {
      }
      try {
        const post = await storage.getCommunityPostWithDetails(pId);
        await notifyInitiativeMembers(pId, req.user.userId, {
          type: "milestone_completed",
          title: "Hito completado",
          content: `Se complet\xF3 un hito en "${post?.title || "una iniciativa"}"`,
          targetId: id
        });
      } catch (_) {
      }
      res.json({ message: "Milestone completed" });
    } catch (error) {
      res.status(500).json({ message: "Failed to complete milestone" });
    }
  });
  app2.get("/api/community/:postId/tasks", async (req, res) => {
    try {
      const { postId } = req.params;
      const id = parseInt(postId);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid post ID" });
      }
      const tasks = await storage.getInitiativeTasks(id);
      const tasksWithUsers = await Promise.all(tasks.map(async (task) => {
        const assignedUser = task.assignedTo ? await storage.getUser(task.assignedTo) : null;
        const createdByUser = task.createdBy ? await storage.getUser(task.createdBy) : null;
        return {
          ...task,
          assignedToUser: assignedUser ? { id: assignedUser.id, name: assignedUser.name, username: assignedUser.username } : null,
          createdByUser: createdByUser ? { id: createdByUser.id, name: createdByUser.name, username: createdByUser.username } : null
        };
      }));
      res.json(tasksWithUsers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tasks" });
    }
  });
  app2.post("/api/community/:postId/tasks", authenticateToken, async (req, res) => {
    try {
      const { postId } = req.params;
      const id = parseInt(postId);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid post ID" });
      }
      if (!await requireMembership(id, req.user.userId)) {
        return res.status(403).json({ message: "Solo miembros pueden crear tareas" });
      }
      const validatedData = insertInitiativeTaskSchema.parse({
        ...req.body,
        createdBy: req.user.userId
      });
      const task = await storage.createTask(id, validatedData);
      res.status(201).json(task);
    } catch (error) {
      if (error instanceof z5.ZodError) {
        res.status(400).json({
          error: "Validation error",
          details: error.errors
        });
      } else {
        res.status(500).json({ message: "Failed to create task" });
      }
    }
  });
  app2.patch("/api/community/:postId/tasks/:taskId", authenticateToken, async (req, res) => {
    try {
      const { postId, taskId } = req.params;
      const id = parseInt(taskId);
      const pId = parseInt(postId);
      if (isNaN(id) || isNaN(pId)) {
        return res.status(400).json({ message: "Invalid ID" });
      }
      if (!await requireMembership(pId, req.user.userId)) {
        return res.status(403).json({ message: "Solo miembros pueden actualizar tareas" });
      }
      const updates = insertInitiativeTaskSchema.partial().parse(req.body);
      await storage.updateTask(id, updates);
      res.json({ message: "Task updated" });
    } catch (error) {
      if (error instanceof z5.ZodError) {
        res.status(400).json({
          error: "Validation error",
          details: error.errors
        });
      } else {
        res.status(500).json({ message: "Failed to update task" });
      }
    }
  });
  app2.post("/api/community/:postId/tasks/:taskId/complete", authenticateToken, async (req, res) => {
    try {
      const { postId, taskId } = req.params;
      const id = parseInt(taskId);
      const pId = parseInt(postId);
      if (isNaN(id) || isNaN(pId)) {
        return res.status(400).json({ message: "Invalid ID" });
      }
      if (!await requireMembership(pId, req.user.userId)) {
        return res.status(403).json({ message: "Solo miembros pueden completar tareas" });
      }
      await storage.completeTask(id);
      try {
        const postId2 = parseInt(req.params.postId);
        await storage.createActivityFeedItem({
          type: "task_completed",
          postId: isNaN(postId2) ? null : postId2,
          userId: req.user.userId,
          title: "Tarea completada",
          targetId: id
        });
      } catch (_) {
      }
      try {
        const post = await storage.getCommunityPostWithDetails(pId);
        await notifyInitiativeMembers(pId, req.user.userId, {
          type: "task_completed",
          title: "Tarea completada",
          content: `Se complet\xF3 una tarea en "${post?.title || "una iniciativa"}"`,
          targetId: id
        });
      } catch (_notif) {
      }
      res.json({ message: "Task completed" });
    } catch (error) {
      res.status(500).json({ message: "Failed to complete task" });
    }
  });
  app2.delete("/api/community/:postId/tasks/:taskId", authenticateToken, async (req, res) => {
    try {
      const { postId, taskId } = req.params;
      const pId = parseInt(postId);
      const tId = parseInt(taskId);
      if (isNaN(pId) || isNaN(tId)) {
        return res.status(400).json({ message: "Invalid ID" });
      }
      if (!await requireMembership(pId, req.user.userId)) {
        return res.status(403).json({ message: "Solo miembros pueden eliminar tareas" });
      }
      await storage.deleteTask(tId);
      res.json({ message: "Tarea eliminada" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete task" });
    }
  });
  app2.delete("/api/community/:postId/milestones/:milestoneId", authenticateToken, async (req, res) => {
    try {
      const { postId, milestoneId } = req.params;
      const pId = parseInt(postId);
      const mId = parseInt(milestoneId);
      if (isNaN(pId) || isNaN(mId)) {
        return res.status(400).json({ message: "Invalid ID" });
      }
      if (!await requireMembership(pId, req.user.userId)) {
        return res.status(403).json({ message: "Solo miembros pueden eliminar hitos" });
      }
      await storage.deleteMilestone(mId);
      res.json({ message: "Hito eliminado" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete milestone" });
    }
  });
  app2.patch("/api/community/:postId/members/:memberId/role", authenticateToken, async (req, res) => {
    try {
      const { postId, memberId } = req.params;
      const { role } = req.body;
      const pId = parseInt(postId);
      const mId = parseInt(memberId);
      if (isNaN(pId) || isNaN(mId)) {
        return res.status(400).json({ message: "Invalid ID" });
      }
      const post = await storage.getCommunityPostWithDetails(pId);
      if (!post || post.userId !== req.user.userId) {
        return res.status(403).json({ message: "Solo el creador puede cambiar roles" });
      }
      const validRoles = ["member", "co-organizer", "active_member"];
      if (!validRoles.includes(role)) {
        return res.status(400).json({ message: "Rol inv\xE1lido" });
      }
      const defaultPermissions = {
        "co-organizer": { canEdit: true, canInvite: true, canApprove: true, canCreateMilestone: true, canCreateTask: true, canAssignTask: true },
        "active_member": { canCreateMilestone: true, canCreateTask: true },
        "member": {}
      };
      await storage.updateMemberRole(mId, role, defaultPermissions[role] || {});
      res.json({ message: "Rol actualizado" });
    } catch (error) {
      res.status(500).json({ message: "Failed to update role" });
    }
  });
  app2.delete("/api/community/:postId/members/:memberId", authenticateToken, async (req, res) => {
    try {
      const { postId, memberId } = req.params;
      const pId = parseInt(postId);
      const mId = parseInt(memberId);
      if (isNaN(pId) || isNaN(mId)) {
        return res.status(400).json({ message: "Invalid ID" });
      }
      const post = await storage.getCommunityPostWithDetails(pId);
      if (!post || post.userId !== req.user.userId) {
        return res.status(403).json({ message: "Solo el creador puede remover miembros" });
      }
      await storage.removeMember(mId);
      res.json({ message: "Miembro removido" });
    } catch (error) {
      res.status(500).json({ message: "Failed to remove member" });
    }
  });
  app2.get("/api/community/:postId/messages", async (req, res) => {
    try {
      const { postId } = req.params;
      const { limit, offset } = req.query;
      const id = parseInt(postId);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid post ID" });
      }
      const limitNum = limit ? parseInt(limit) : 50;
      const offsetNum = offset ? parseInt(offset) : 0;
      const messages = await storage.getInitiativeMessages(id, limitNum, offsetNum);
      const messagesWithUsers = await Promise.all(messages.map(async (msg) => {
        const user = msg.userId ? await storage.getUser(msg.userId) : null;
        return {
          ...msg,
          user: user ? { id: user.id, name: user.name, username: user.username } : null
        };
      }));
      res.json(messagesWithUsers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });
  app2.post("/api/community/:postId/messages", authenticateToken, async (req, res) => {
    try {
      const { postId } = req.params;
      const { content, type } = req.body;
      const id = parseInt(postId);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid post ID" });
      }
      if (!content) {
        return res.status(400).json({ message: "Content is required" });
      }
      if (!await requireMembership(id, req.user.userId)) {
        return res.status(403).json({ message: "Solo miembros pueden enviar mensajes" });
      }
      const message = await storage.sendMessage(id, req.user.userId, content, type);
      const user = await storage.getUser(req.user.userId);
      try {
        const post = await storage.getCommunityPostWithDetails(id);
        await notifyInitiativeMembers(id, req.user.userId, {
          type: "message",
          title: "Nuevo mensaje",
          content: `${user?.name || "Alguien"} envi\xF3 un mensaje en "${post?.title || "una iniciativa"}"`
        });
      } catch (_) {
      }
      res.status(201).json({
        ...message,
        user: user ? { id: user.id, name: user.name, username: user.username } : null
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to send message" });
    }
  });
  app2.get("/api/activity-feed", async (req, res) => {
    try {
      const { type, limit, offset } = req.query;
      const limitNum = limit ? parseInt(limit) : 20;
      const offsetNum = offset ? parseInt(offset) : 0;
      const feed = await storage.getActivityFeed({
        type,
        limit: limitNum,
        offset: offsetNum
      });
      const feedWithUsers = await Promise.all(feed.map(async (item) => {
        const user = item.userId ? await storage.getUser(item.userId) : null;
        return {
          ...item,
          user: user ? { id: user.id, name: user.name, username: user.username } : null
        };
      }));
      res.json(feedWithUsers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch activity feed" });
    }
  });
  app2.get("/api/notifications", authenticateToken, async (req, res) => {
    try {
      const { unreadOnly } = req.query;
      const notifications2 = await storage.getUserNotifications(
        req.user.userId,
        unreadOnly === "true"
      );
      res.json(notifications2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });
  app2.post("/api/notifications/:notificationId/read", authenticateToken, async (req, res) => {
    try {
      const { notificationId } = req.params;
      const id = parseInt(notificationId);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid notification ID" });
      }
      await storage.markNotificationAsRead(id);
      res.json({ message: "Notification marked as read" });
    } catch (error) {
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });
  app2.post("/api/notifications/read-all", authenticateToken, async (req, res) => {
    try {
      await storage.markAllNotificationsAsRead(req.user.userId);
      res.json({ message: "All notifications marked as read" });
    } catch (error) {
      res.status(500).json({ message: "Failed to mark all notifications as read" });
    }
  });
  app2.get("/api/notifications/unread-count", authenticateToken, async (req, res) => {
    try {
      const notifications2 = await storage.getUserNotifications(req.user.userId, true);
      res.json({ count: notifications2.length });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch unread count" });
    }
  });
  app2.get("/api/resources", async (req, res) => {
    try {
      const category = req.query.category;
      const resources2 = category ? await storage.getResourcesByCategory(category) : await storage.getResources();
      res.json(resources2);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch resources" });
    }
  });
  app2.post("/api/register", authRateLimit, async (req, res) => {
    try {
      if (req.body._hp) {
        return res.status(201).json({
          message: "Usuario registrado exitosamente",
          user: { id: 0, username: "", email: "", name: "" },
          tokens: { accessToken: "", refreshToken: "" }
        });
      }
      const formLoadedAt = Number(req.body._t);
      if (formLoadedAt && Date.now() - formLoadedAt < 3e3) {
        return res.status(429).json({
          error: "Too fast",
          message: "El formulario fue enviado demasiado r\xE1pido. Intent\xE1 de nuevo.",
          code: "SUBMISSION_TOO_FAST"
        });
      }
      const { _hp, _t, ...registrationData } = req.body;
      const validatedData = registerUserSchema.parse(registrationData);
      const existingUsername = await storage.getUserByUsername(validatedData.username);
      if (existingUsername) {
        return res.status(409).json({
          error: "Username already exists",
          message: "El nombre de usuario ya est\xE1 en uso",
          code: "USERNAME_EXISTS"
        });
      }
      const existingEmail = await storage.getUserByEmail(validatedData.email);
      if (existingEmail) {
        return res.status(409).json({
          error: "Email already exists",
          message: "El email ya est\xE1 registrado",
          code: "EMAIL_EXISTS"
        });
      }
      const user = await storage.createUserWithHash({
        name: validatedData.name,
        email: validatedData.email,
        username: validatedData.username,
        password: validatedData.password,
        location: validatedData.location || null
      });
      const authResponse = createAuthResponse({
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
        location: user.location,
        avatarUrl: user.avatarUrl
      });
      res.status(201).json({
        message: "Usuario registrado exitosamente",
        ...authResponse
      });
    } catch (error) {
      if (error instanceof z5.ZodError) {
        res.status(400).json({
          error: "Validation error",
          message: "Datos de entrada inv\xE1lidos",
          details: error.errors.map((err) => ({
            field: err.path.join("."),
            message: err.message
          }))
        });
      } else {
        console.error("Registration error:", error);
        res.status(500).json({
          error: "Internal server error",
          message: "Error interno del servidor"
        });
      }
    }
  });
  app2.post("/api/login", authRateLimit, async (req, res) => {
    try {
      const validatedData = loginSchema.parse(req.body);
      const clientIP = req.ip || req.connection.remoteAddress || "unknown";
      const rateLimitKey = `${clientIP}:${validatedData.username}`;
      if (!RateLimiter.checkLimit(rateLimitKey)) {
        const remainingTime = RateLimiter.getRemainingTime(rateLimitKey);
        return res.status(429).json({
          error: "Too many login attempts",
          message: "Demasiados intentos de inicio de sesi\xF3n. Intenta nuevamente m\xE1s tarde.",
          retryAfter: Math.ceil(remainingTime / 1e3)
        });
      }
      const isLocked = await storage.isUserLocked(validatedData.username);
      if (isLocked) {
        return res.status(423).json({
          error: "Account locked",
          message: "Cuenta temporalmente bloqueada por m\xFAltiples intentos fallidos",
          code: "ACCOUNT_LOCKED"
        });
      }
      const user = await storage.verifyUserPassword(validatedData.username, validatedData.password);
      if (!user) {
        await storage.incrementLoginAttempts(validatedData.username);
        return res.status(401).json({
          error: "Invalid credentials",
          message: "Credenciales inv\xE1lidas",
          code: "INVALID_CREDENTIALS"
        });
      }
      await storage.resetLoginAttempts(validatedData.username);
      await storage.updateLastLogin(user.id);
      RateLimiter.resetLimit(rateLimitKey);
      const authResponse = createAuthResponse({
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
        location: user.location,
        avatarUrl: user.avatarUrl
      });
      res.json({
        message: "Inicio de sesi\xF3n exitoso",
        ...authResponse
      });
    } catch (error) {
      if (error instanceof z5.ZodError) {
        res.status(400).json({
          error: "Validation error",
          message: "Datos de entrada inv\xE1lidos",
          details: error.errors.map((err) => ({
            field: err.path.join("."),
            message: err.message
          }))
        });
      } else {
        console.error("Login error:", error);
        res.status(500).json({
          error: "Internal server error",
          message: "Error interno del servidor"
        });
      }
    }
  });
  app2.get("/api/auth/me", authenticateToken, async (req, res) => {
    try {
      const user = await storage.getUser(req.user.userId);
      if (!user) {
        return res.status(404).json({
          error: "User not found",
          message: "Usuario no encontrado",
          code: "USER_NOT_FOUND"
        });
      }
      res.json({
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
        location: user.location,
        avatarUrl: user.avatarUrl,
        lastLogin: user.lastLogin,
        emailVerified: user.emailVerified,
        onboardingCompleted: user.onboardingCompleted,
        createdAt: user.createdAt,
        dataShareOptOut: user.dataShareOptOut ?? false
      });
    } catch (error) {
      console.error("Get user profile error:", error);
      res.status(500).json({
        error: "Internal server error",
        message: "Error interno del servidor"
      });
    }
  });
  app2.put("/api/auth/profile", authenticateToken, async (req, res) => {
    try {
      const validatedData = updateProfileSchema.parse(req.body);
      if (validatedData.email) {
        const existingUser = await storage.getUserByEmail(validatedData.email);
        if (existingUser && existingUser.id !== req.user.userId) {
          return res.status(409).json({
            error: "Email already exists",
            message: "El email ya est\xE1 en uso por otro usuario",
            code: "EMAIL_EXISTS"
          });
        }
      }
      const updatedUser = await storage.updateUser(req.user.userId, validatedData);
      res.json({
        message: "Perfil actualizado exitosamente",
        user: {
          id: updatedUser.id,
          username: updatedUser.username,
          email: updatedUser.email,
          name: updatedUser.name,
          location: updatedUser.location,
          avatarUrl: updatedUser.avatarUrl,
          emailVerified: updatedUser.emailVerified,
          onboardingCompleted: updatedUser.onboardingCompleted,
          createdAt: updatedUser.createdAt,
          dataShareOptOut: updatedUser.dataShareOptOut ?? false
        }
      });
    } catch (error) {
      if (error instanceof z5.ZodError) {
        res.status(400).json({
          error: "Validation error",
          message: "Datos de entrada inv\xE1lidos",
          details: error.errors.map((err) => ({
            field: err.path.join("."),
            message: err.message
          }))
        });
      } else {
        console.error("Update profile error:", error);
        res.status(500).json({
          error: "Internal server error",
          message: "Error interno del servidor"
        });
      }
    }
  });
  app2.post("/api/auth/avatar", authenticateToken, async (req, res) => {
    try {
      const { image } = req.body;
      if (!image || typeof image !== "string") {
        return res.status(400).json({
          error: "Validation error",
          message: "Se requiere una imagen v\xE1lida"
        });
      }
      const dataUriMatch = image.match(/^data:image\/(png|jpeg|jpg|webp|gif);base64,/);
      if (!dataUriMatch) {
        return res.status(400).json({
          error: "Validation error",
          message: "Formato de imagen inv\xE1lido. Solo se aceptan PNG, JPEG, WebP o GIF."
        });
      }
      const base64Data = image.split(",")[1];
      const sizeInBytes = Math.ceil(base64Data.length * 3 / 4);
      const maxSize = 2 * 1024 * 1024;
      if (sizeInBytes > maxSize) {
        return res.status(400).json({
          error: "Validation error",
          message: "La imagen es demasiado grande. El tama\xF1o m\xE1ximo es 2MB."
        });
      }
      const updatedUser = await storage.updateUser(req.user.userId, { avatarUrl: image });
      res.json({
        message: "Avatar actualizado exitosamente",
        user: {
          id: updatedUser.id,
          username: updatedUser.username,
          email: updatedUser.email,
          name: updatedUser.name,
          location: updatedUser.location,
          avatarUrl: updatedUser.avatarUrl,
          emailVerified: updatedUser.emailVerified,
          onboardingCompleted: updatedUser.onboardingCompleted,
          createdAt: updatedUser.createdAt
        }
      });
    } catch (error) {
      console.error("Upload avatar error:", error);
      res.status(500).json({
        error: "Internal server error",
        message: "Error al subir el avatar"
      });
    }
  });
  app2.delete("/api/auth/avatar", authenticateToken, async (req, res) => {
    try {
      const updatedUser = await storage.updateUser(req.user.userId, { avatarUrl: null });
      res.json({
        message: "Avatar eliminado exitosamente",
        user: {
          id: updatedUser.id,
          username: updatedUser.username,
          email: updatedUser.email,
          name: updatedUser.name,
          location: updatedUser.location,
          avatarUrl: updatedUser.avatarUrl,
          emailVerified: updatedUser.emailVerified,
          onboardingCompleted: updatedUser.onboardingCompleted,
          createdAt: updatedUser.createdAt
        }
      });
    } catch (error) {
      console.error("Delete avatar error:", error);
      res.status(500).json({
        error: "Internal server error",
        message: "Error al eliminar el avatar"
      });
    }
  });
  app2.post("/api/auth/complete-onboarding", authenticateToken, async (req, res) => {
    try {
      const updatedUser = await storage.updateUser(req.user.userId, { onboardingCompleted: true });
      res.json({
        message: "Onboarding completado",
        user: {
          id: updatedUser.id,
          username: updatedUser.username,
          email: updatedUser.email,
          name: updatedUser.name,
          location: updatedUser.location,
          emailVerified: updatedUser.emailVerified,
          onboardingCompleted: updatedUser.onboardingCompleted,
          createdAt: updatedUser.createdAt
        }
      });
    } catch (error) {
      console.error("Complete onboarding error:", error);
      res.status(500).json({
        error: "Internal server error",
        message: "Error interno del servidor"
      });
    }
  });
  app2.post("/api/user/interests", authenticateToken, async (req, res) => {
    try {
      const { interests } = req.body;
      if (!Array.isArray(interests)) {
        return res.status(400).json({
          error: "Validation error",
          message: "interests debe ser un array"
        });
      }
      const existing = await storage.getUserProfile(req.user.userId);
      if (existing) {
        await storage.updateUserProfile(req.user.userId, { interests: JSON.stringify(interests) });
      } else {
        await storage.createUserProfile({
          userId: req.user.userId,
          interests: JSON.stringify(interests),
          values: null,
          personalityTraits: null
        });
      }
      res.json({ message: "Intereses guardados", interests });
    } catch (error) {
      console.error("Save interests error:", error);
      res.status(500).json({
        error: "Internal server error",
        message: "Error interno del servidor"
      });
    }
  });
  app2.put("/api/auth/change-password", authenticateToken, async (req, res) => {
    try {
      const validatedData = changePasswordSchema.parse(req.body);
      const user = await storage.getUser(req.user.userId);
      if (!user) {
        return res.status(404).json({
          error: "User not found",
          message: "Usuario no encontrado",
          code: "USER_NOT_FOUND"
        });
      }
      const isCurrentPasswordValid = await storage.verifyUserPassword(user.username, validatedData.currentPassword);
      if (!isCurrentPasswordValid) {
        return res.status(401).json({
          error: "Invalid current password",
          message: "La contrase\xF1a actual es incorrecta",
          code: "INVALID_CURRENT_PASSWORD"
        });
      }
      const hashedNewPassword = await PasswordManager.hash(validatedData.newPassword);
      await storage.updateUser(req.user.userId, { password: hashedNewPassword });
      res.json({
        message: "Contrase\xF1a actualizada exitosamente"
      });
    } catch (error) {
      if (error instanceof z5.ZodError) {
        res.status(400).json({
          error: "Validation error",
          message: "Datos de entrada inv\xE1lidos",
          details: error.errors.map((err) => ({
            field: err.path.join("."),
            message: err.message
          }))
        });
      } else {
        console.error("Change password error:", error);
        res.status(500).json({
          error: "Internal server error",
          message: "Error interno del servidor"
        });
      }
    }
  });
  app2.post("/api/auth/refresh", async (req, res) => {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        return res.status(401).json({
          error: "Refresh token required",
          message: "Token de actualizaci\xF3n requerido",
          code: "MISSING_REFRESH_TOKEN"
        });
      }
      const payload = TokenManager.verifyToken(refreshToken);
      if (!payload || payload.type !== "refresh") {
        return res.status(403).json({
          error: "Invalid refresh token",
          message: "Token de actualizaci\xF3n inv\xE1lido",
          code: "INVALID_REFRESH_TOKEN"
        });
      }
      const user = await storage.getUser(payload.userId);
      if (!user || !user.isActive) {
        return res.status(404).json({
          error: "User not found or inactive",
          message: "Usuario no encontrado o inactivo",
          code: "USER_NOT_FOUND"
        });
      }
      const authResponse = createAuthResponse({
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
        location: user.location,
        avatarUrl: user.avatarUrl
      });
      res.json({
        message: "Tokens actualizados exitosamente",
        ...authResponse
      });
    } catch (error) {
      console.error("Refresh token error:", error);
      res.status(500).json({
        error: "Internal server error",
        message: "Error interno del servidor"
      });
    }
  });
  app2.post("/api/auth/logout", authenticateToken, async (req, res) => {
    try {
      res.json({
        message: "Sesi\xF3n cerrada exitosamente"
      });
    } catch (error) {
      console.error("Logout error:", error);
      res.status(500).json({
        error: "Internal server error",
        message: "Error interno del servidor"
      });
    }
  });
  app2.get("/api/stats", async (_req, res) => {
    try {
      const users2 = await storage.getAllUsers();
      const communityPosts2 = await storage.getCommunityPosts();
      const dreams3 = await storage.getDreams();
      const now = /* @__PURE__ */ new Date();
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1e3);
      const newUsersThisWeek = users2.filter((user) => {
        if (!user.createdAt) return false;
        const userDate = new Date(user.createdAt);
        return userDate >= oneWeekAgo;
      }).length;
      const activeUsers = users2.filter((user) => {
        const hasPosts = communityPosts2.some((post) => post.userId === user.id);
        const hasDreams = dreams3.some((dream) => dream.userId === user.id);
        return hasPosts || hasDreams;
      }).length;
      const jobPosts = communityPosts2.filter((post) => post.type === "job").length;
      const projectPosts = communityPosts2.filter((post) => post.type === "project").length;
      const resourcePosts = communityPosts2.filter((post) => post.type === "resource").length;
      const totalMembers = users2.length;
      res.json({
        totalMembers,
        activeMembers: activeUsers > 0 ? activeUsers : totalMembers,
        newMembersThisWeek: newUsersThisWeek,
        jobPosts,
        projectPosts,
        resourcePosts,
        totalPosts: communityPosts2.length,
        totalDreams: dreams3.length
      });
    } catch (error) {
      console.error("Stats error:", error);
      res.status(500).json({ message: "Failed to fetch statistics" });
    }
  });
  app2.post("/api/nlp/analyze", async (req, res) => {
    try {
      const { text: text2 } = req.body;
      if (!text2 || typeof text2 !== "string" || text2.trim().length === 0) {
        return res.status(400).json({
          error: "Invalid input",
          message: "Texto requerido para an\xE1lisis",
          code: "INVALID_TEXT"
        });
      }
      const analysis = await nlpService.analyzeText(text2);
      res.json({
        message: "An\xE1lisis completado exitosamente",
        analysis
      });
    } catch (error) {
      console.error("NLP analysis error:", error);
      res.status(500).json({
        error: "Analysis failed",
        message: "Error interno durante el an\xE1lisis",
        code: "ANALYSIS_ERROR"
      });
    }
  });
  app2.post("/api/nlp/analyze-psychography", async (req, res) => {
    try {
      const { text: text2 } = req.body;
      if (!text2 || typeof text2 !== "string" || text2.trim().length === 0) {
        return res.status(400).json({
          error: "Invalid input",
          message: "Texto de psicograf\xEDa requerido",
          code: "INVALID_PSYCHOGRAPHY"
        });
      }
      const analysis = await nlpService.analyzePsychography(text2);
      res.json({
        message: "An\xE1lisis de psicograf\xEDa completado",
        analysis
      });
    } catch (error) {
      console.error("Psychography analysis error:", error);
      res.status(500).json({
        error: "Analysis failed",
        message: "Error interno durante el an\xE1lisis de psicograf\xEDa",
        code: "PSYCHOGRAPHY_ANALYSIS_ERROR"
      });
    }
  });
  app2.post("/api/nlp/find-similar", async (req, res) => {
    try {
      const { text: text2, textCollection } = req.body;
      if (!text2 || !Array.isArray(textCollection) || textCollection.length === 0) {
        return res.status(400).json({
          error: "Invalid input",
          message: "Texto y colecci\xF3n de textos requeridos",
          code: "INVALID_SIMILARITY_INPUT"
        });
      }
      const similarTexts = await nlpService.findSimilarTexts(text2, textCollection);
      res.json({
        message: "B\xFAsqueda de textos similares completada",
        similarTexts
      });
    } catch (error) {
      console.error("Similar texts search error:", error);
      res.status(500).json({
        error: "Search failed",
        message: "Error interno durante la b\xFAsqueda",
        code: "SIMILARITY_SEARCH_ERROR"
      });
    }
  });
  app2.post("/api/nlp/batch-sentiment", async (req, res) => {
    try {
      const { texts } = req.body;
      if (!Array.isArray(texts) || texts.length === 0) {
        return res.status(400).json({
          error: "Invalid input",
          message: "Array de textos requerido",
          code: "INVALID_BATCH_INPUT"
        });
      }
      const results = await Promise.all(
        texts.map(async (text2) => {
          try {
            const analysis = await nlpService.analyzeText(text2);
            return {
              text: text2.substring(0, 100) + "...",
              sentiment: analysis.sentiment,
              emotions: analysis.emotions.slice(0, 3),
              success: true
            };
          } catch (error) {
            return {
              text: text2.substring(0, 100) + "...",
              error: "An\xE1lisis fallido",
              success: false
            };
          }
        })
      );
      const successCount = results.filter((r) => r.success).length;
      res.json({
        message: `An\xE1lisis completado: ${successCount}/${texts.length} textos procesados`,
        results
      });
    } catch (error) {
      console.error("Batch sentiment analysis error:", error);
      res.status(500).json({
        error: "Batch analysis failed",
        message: "Error interno durante el an\xE1lisis masivo",
        code: "BATCH_ANALYSIS_ERROR"
      });
    }
  });
  app2.post("/api/blockchain/create-proposal", async (req, res) => {
    try {
      const { title, description, creator, startTime, endTime } = req.body;
      if (!title || !description || !creator) {
        return res.status(400).json({
          error: "Invalid input",
          message: "T\xEDtulo, descripci\xF3n y creador requeridos",
          code: "INVALID_PROPOSAL_DATA"
        });
      }
      if (!blockchainService.isValidAddress(creator)) {
        return res.status(400).json({
          error: "Invalid address",
          message: "Direcci\xF3n de creador inv\xE1lida",
          code: "INVALID_CREATOR_ADDRESS"
        });
      }
      const proposalId = await blockchainService.createVotingProposal({
        title,
        description,
        creator,
        startTime: startTime ? new Date(startTime).getTime() : Date.now(),
        endTime: endTime ? new Date(endTime).getTime() : Date.now() + 7 * 24 * 60 * 60 * 1e3
        // 7 días
      });
      res.json({
        message: "Propuesta de votaci\xF3n creada exitosamente",
        proposalId
      });
    } catch (error) {
      console.error("Blockchain proposal creation error:", error);
      res.status(500).json({
        error: "Proposal creation failed",
        message: "Error interno creando propuesta de votaci\xF3n",
        code: "PROPOSAL_CREATION_ERROR"
      });
    }
  });
  app2.post("/api/blockchain/vote", async (req, res) => {
    try {
      const { proposalId, voterAddress, vote } = req.body;
      if (!proposalId || !voterAddress || !vote) {
        return res.status(400).json({
          error: "Invalid input",
          message: "ID de propuesta, direcci\xF3n de votante y voto requeridos",
          code: "INVALID_VOTE_DATA"
        });
      }
      if (!["yes", "no", "abstain"].includes(vote)) {
        return res.status(400).json({
          error: "Invalid vote",
          message: 'Voto debe ser "yes", "no" o "abstain"',
          code: "INVALID_VOTE_VALUE"
        });
      }
      if (!blockchainService.isValidAddress(voterAddress)) {
        return res.status(400).json({
          error: "Invalid address",
          message: "Direcci\xF3n de votante inv\xE1lida",
          code: "INVALID_VOTER_ADDRESS"
        });
      }
      const txHash = await blockchainService.voteOnProposal(proposalId, voterAddress, vote);
      res.json({
        message: "Voto registrado exitosamente en blockchain",
        transactionHash: txHash
      });
    } catch (error) {
      console.error("Blockchain voting error:", error);
      res.status(500).json({
        error: "Voting failed",
        message: "Error interno registrando voto",
        code: "VOTING_ERROR"
      });
    }
  });
  app2.get("/api/blockchain/proposal/:proposalId", async (req, res) => {
    try {
      const { proposalId } = req.params;
      if (!proposalId) {
        return res.status(400).json({
          error: "Invalid input",
          message: "ID de propuesta requerido",
          code: "MISSING_PROPOSAL_ID"
        });
      }
      const proposal = await blockchainService.getProposal(proposalId);
      if (!proposal) {
        return res.status(404).json({
          error: "Proposal not found",
          message: "Propuesta no encontrada",
          code: "PROPOSAL_NOT_FOUND"
        });
      }
      res.json({
        message: "Informaci\xF3n de propuesta obtenida exitosamente",
        proposal
      });
    } catch (error) {
      console.error("Get proposal error:", error);
      res.status(500).json({
        error: "Get proposal failed",
        message: "Error interno obteniendo propuesta",
        code: "GET_PROPOSAL_ERROR"
      });
    }
  });
  app2.get("/api/blockchain/proposal/:proposalId/stats", async (req, res) => {
    try {
      const { proposalId } = req.params;
      if (!proposalId) {
        return res.status(400).json({
          error: "Invalid input",
          message: "ID de propuesta requerido",
          code: "MISSING_PROPOSAL_ID"
        });
      }
      const stats = await blockchainService.getVotingStats(proposalId);
      if (!stats) {
        return res.status(404).json({
          error: "Stats not found",
          message: "Estad\xEDsticas de votaci\xF3n no encontradas",
          code: "STATS_NOT_FOUND"
        });
      }
      res.json({
        message: "Estad\xEDsticas de votaci\xF3n obtenidas exitosamente",
        stats
      });
    } catch (error) {
      console.error("Get voting stats error:", error);
      res.status(500).json({
        error: "Get stats failed",
        message: "Error interno obteniendo estad\xEDsticas",
        code: "GET_STATS_ERROR"
      });
    }
  });
  app2.post("/api/blockchain/certify-impact", async (req, res) => {
    try {
      const { projectId, beneficiary, impactMetrics, certifier } = req.body;
      if (!projectId || !beneficiary || !impactMetrics || !certifier) {
        return res.status(400).json({
          error: "Invalid input",
          message: "Todos los campos son requeridos para certificar impacto",
          code: "INVALID_CERTIFICATE_DATA"
        });
      }
      if (!blockchainService.isValidAddress(beneficiary) || !blockchainService.isValidAddress(certifier)) {
        return res.status(400).json({
          error: "Invalid address",
          message: "Direcciones de beneficiario y certificador inv\xE1lidas",
          code: "INVALID_ADDRESSES"
        });
      }
      const txHash = await blockchainService.certifySocialImpact({
        projectId,
        beneficiary,
        impactMetrics,
        certifier
      });
      res.json({
        message: "Impacto social certificado exitosamente en blockchain",
        transactionHash: txHash
      });
    } catch (error) {
      console.error("Blockchain impact certification error:", error);
      res.status(500).json({
        error: "Certification failed",
        message: "Error interno certificando impacto",
        code: "CERTIFICATION_ERROR"
      });
    }
  });
  app2.get("/api/blockchain/verify-certificate/:certificateId", async (req, res) => {
    try {
      const { certificateId } = req.params;
      if (!certificateId) {
        return res.status(400).json({
          error: "Invalid input",
          message: "ID de certificado requerido",
          code: "MISSING_CERTIFICATE_ID"
        });
      }
      const certificate = await blockchainService.verifySocialImpact(certificateId);
      if (!certificate) {
        return res.status(404).json({
          error: "Certificate not found",
          message: "Certificado no encontrado",
          code: "CERTIFICATE_NOT_FOUND"
        });
      }
      res.json({
        message: "Certificado verificado exitosamente",
        certificate,
        verified: true
      });
    } catch (error) {
      console.error("Certificate verification error:", error);
      res.status(500).json({
        error: "Verification failed",
        message: "Error interno verificando certificado",
        code: "VERIFICATION_ERROR"
      });
    }
  });
  app2.post("/api/blockchain/record-donation", async (req, res) => {
    try {
      const { donorAddress, recipientAddress, amount, projectId, message } = req.body;
      if (!donorAddress || !recipientAddress || !amount || !projectId) {
        return res.status(400).json({
          error: "Invalid input",
          message: "Todos los campos son requeridos para registrar donaci\xF3n",
          code: "INVALID_DONATION_DATA"
        });
      }
      if (!blockchainService.isValidAddress(donorAddress) || !blockchainService.isValidAddress(recipientAddress)) {
        return res.status(400).json({
          error: "Invalid address",
          message: "Direcciones de donante y recipiente inv\xE1lidas",
          code: "INVALID_DONATION_ADDRESSES"
        });
      }
      const txHash = await blockchainService.recordDonation({
        donorAddress,
        recipientAddress,
        amount,
        projectId,
        message
      });
      res.json({
        message: "Donaci\xF3n registrada exitosamente en blockchain",
        transactionHash: txHash
      });
    } catch (error) {
      console.error("Blockchain donation record error:", error);
      res.status(500).json({
        error: "Donation record failed",
        message: "Error interno registrando donaci\xF3n",
        code: "DONATION_RECORD_ERROR"
      });
    }
  });
  app2.get("/api/blockchain/network-info", async (req, res) => {
    try {
      const networkInfo = await blockchainService.getNetworkInfo();
      res.json({
        message: "Informaci\xF3n de red blockchain obtenida exitosamente",
        networkInfo
      });
    } catch (error) {
      console.error("Get network info error:", error);
      res.status(500).json({
        error: "Get network info failed",
        message: "Error interno obteniendo informaci\xF3n de red",
        code: "NETWORK_INFO_ERROR"
      });
    }
  });
  app2.get("/api/blockchain/balance/:address", async (req, res) => {
    try {
      const { address } = req.params;
      if (!address) {
        return res.status(400).json({
          error: "Invalid input",
          message: "Direcci\xF3n requerida",
          code: "MISSING_ADDRESS"
        });
      }
      if (!blockchainService.isValidAddress(address)) {
        return res.status(400).json({
          error: "Invalid address",
          message: "Direcci\xF3n blockchain inv\xE1lida",
          code: "INVALID_ADDRESS"
        });
      }
      const balance = await blockchainService.getBalance(address);
      res.json({
        message: "Balance obtenido exitosamente",
        address,
        balance,
        symbol: "MATIC"
        // Para Polygon
      });
    } catch (error) {
      console.error("Get balance error:", error);
      res.status(500).json({
        error: "Get balance failed",
        message: "Error interno obteniendo balance",
        code: "BALANCE_ERROR"
      });
    }
  });
  app2.post("/api/ar/create-project", async (req, res) => {
    try {
      const {
        title,
        description,
        latitude,
        longitude,
        address,
        arModel,
        impact,
        status,
        createdBy
      } = req.body;
      if (!title || !description || !latitude || !longitude || !arModel || !createdBy) {
        return res.status(400).json({
          error: "Invalid input",
          message: "T\xEDtulo, descripci\xF3n, coordenadas, modelo AR y creador requeridos",
          code: "INVALID_AR_PROJECT_DATA"
        });
      }
      if (!arService.isValidCoordinates(latitude, longitude)) {
        return res.status(400).json({
          error: "Invalid coordinates",
          message: "Coordenadas GPS inv\xE1lidas",
          code: "INVALID_COORDINATES"
        });
      }
      const projectId = await arService.createARProject({
        title,
        description,
        location: { latitude, longitude, address: address || "" },
        arModel,
        impact,
        status: status || "planning",
        createdBy
      });
      res.json({
        message: "Proyecto AR creado exitosamente",
        projectId
      });
    } catch (error) {
      console.error("AR project creation error:", error);
      res.status(500).json({
        error: "AR project creation failed",
        message: "Error interno creando proyecto AR",
        code: "AR_PROJECT_CREATION_ERROR"
      });
    }
  });
  app2.get("/api/ar/projects/nearby", async (req, res) => {
    try {
      const { latitude, longitude, radius = 5 } = req.query;
      if (!latitude || !longitude) {
        return res.status(400).json({
          error: "Invalid input",
          message: "Latitud y longitud requeridas",
          code: "MISSING_COORDINATES"
        });
      }
      const lat = parseFloat(latitude);
      const lon = parseFloat(longitude);
      const radiusKm = parseFloat(radius);
      if (!arService.isValidCoordinates(lat, lon)) {
        return res.status(400).json({
          error: "Invalid coordinates",
          message: "Coordenadas GPS inv\xE1lidas",
          code: "INVALID_NEARBY_COORDINATES"
        });
      }
      const projects = await arService.getARProjectsByLocation(lat, lon, radiusKm);
      res.json({
        message: "Proyectos AR cercanos obtenidos exitosamente",
        projects,
        count: projects.length,
        location: { latitude: lat, longitude: lon },
        radius: radiusKm
      });
    } catch (error) {
      console.error("Get nearby AR projects error:", error);
      res.status(500).json({
        error: "Get nearby projects failed",
        message: "Error interno obteniendo proyectos AR cercanos",
        code: "GET_NEARBY_PROJECTS_ERROR"
      });
    }
  });
  app2.post("/api/ar/generate-scene", async (req, res) => {
    try {
      const { latitude, longitude } = req.body;
      if (!latitude || !longitude) {
        return res.status(400).json({
          error: "Invalid input",
          message: "Latitud y longitud requeridas",
          code: "MISSING_SCENE_COORDINATES"
        });
      }
      const lat = parseFloat(latitude);
      const lon = parseFloat(longitude);
      if (!arService.isValidCoordinates(lat, lon)) {
        return res.status(400).json({
          error: "Invalid coordinates",
          message: "Coordenadas GPS inv\xE1lidas",
          code: "INVALID_SCENE_COORDINATES"
        });
      }
      const scene = await arService.generateARScene(lat, lon);
      res.json({
        message: "Escena AR generada exitosamente",
        scene
      });
    } catch (error) {
      console.error("AR scene generation error:", error);
      res.status(500).json({
        error: "AR scene generation failed",
        message: "Error interno generando escena AR",
        code: "AR_SCENE_GENERATION_ERROR"
      });
    }
  });
  app2.get("/api/ar/scene/:sceneId", async (req, res) => {
    try {
      const { sceneId } = req.params;
      if (!sceneId) {
        return res.status(400).json({
          error: "Invalid input",
          message: "ID de escena requerido",
          code: "MISSING_SCENE_ID"
        });
      }
      const scene = arService.getARScene(sceneId);
      if (!scene) {
        return res.status(404).json({
          error: "Scene not found",
          message: "Escena AR no encontrada",
          code: "AR_SCENE_NOT_FOUND"
        });
      }
      res.json({
        message: "Escena AR obtenida exitosamente",
        scene
      });
    } catch (error) {
      console.error("Get AR scene error:", error);
      res.status(500).json({
        error: "Get AR scene failed",
        message: "Error interno obteniendo escena AR",
        code: "GET_AR_SCENE_ERROR"
      });
    }
  });
  app2.get("/api/ar/scene/:sceneId/code", async (req, res) => {
    try {
      const { sceneId } = req.params;
      if (!sceneId) {
        return res.status(400).json({
          error: "Invalid input",
          message: "ID de escena requerido",
          code: "MISSING_SCENE_ID_FOR_CODE"
        });
      }
      const scene = arService.getARScene(sceneId);
      if (!scene) {
        return res.status(404).json({
          error: "Scene not found",
          message: "Escena AR no encontrada",
          code: "AR_SCENE_NOT_FOUND_FOR_CODE"
        });
      }
      const arCode = arService.generateARCode(scene);
      res.setHeader("Content-Type", "text/html");
      res.send(arCode);
    } catch (error) {
      console.error("Generate AR code error:", error);
      res.status(500).json({
        error: "Generate AR code failed",
        message: "Error interno generando c\xF3digo AR",
        code: "GENERATE_AR_CODE_ERROR"
      });
    }
  });
  app2.post("/api/ar/create-marker", async (req, res) => {
    try {
      const { latitude, longitude, projectId } = req.body;
      if (!latitude || !longitude) {
        return res.status(400).json({
          error: "Invalid input",
          message: "Latitud y longitud requeridas",
          code: "MISSING_MARKER_COORDINATES"
        });
      }
      const lat = parseFloat(latitude);
      const lon = parseFloat(longitude);
      if (!arService.isValidCoordinates(lat, lon)) {
        return res.status(400).json({
          error: "Invalid coordinates",
          message: "Coordenadas GPS inv\xE1lidas",
          code: "INVALID_MARKER_COORDINATES"
        });
      }
      const markerId = await arService.createLocationMarker(lat, lon, projectId);
      res.json({
        message: "Marcador AR creado exitosamente",
        markerId,
        coordinates: { latitude: lat, longitude: lon }
      });
    } catch (error) {
      console.error("AR marker creation error:", error);
      res.status(500).json({
        error: "AR marker creation failed",
        message: "Error interno creando marcador AR",
        code: "AR_MARKER_CREATION_ERROR"
      });
    }
  });
  app2.put("/api/ar/project/:projectId", async (req, res) => {
    try {
      const { projectId } = req.params;
      const updates = req.body;
      if (!projectId) {
        return res.status(400).json({
          error: "Invalid input",
          message: "ID de proyecto requerido",
          code: "MISSING_AR_PROJECT_ID"
        });
      }
      const success = await arService.updateARProject(projectId, updates);
      if (!success) {
        return res.status(404).json({
          error: "Project not found",
          message: "Proyecto AR no encontrado",
          code: "AR_PROJECT_NOT_FOUND"
        });
      }
      res.json({
        message: "Proyecto AR actualizado exitosamente"
      });
    } catch (error) {
      console.error("Update AR project error:", error);
      res.status(500).json({
        error: "Update AR project failed",
        message: "Error interno actualizando proyecto AR",
        code: "UPDATE_AR_PROJECT_ERROR"
      });
    }
  });
  app2.delete("/api/ar/project/:projectId", async (req, res) => {
    try {
      const { projectId } = req.params;
      if (!projectId) {
        return res.status(400).json({
          error: "Invalid input",
          message: "ID de proyecto requerido",
          code: "MISSING_AR_PROJECT_ID_FOR_DELETE"
        });
      }
      const success = await arService.deleteARProject(projectId);
      if (!success) {
        return res.status(404).json({
          error: "Project not found",
          message: "Proyecto AR no encontrado",
          code: "AR_PROJECT_NOT_FOUND_FOR_DELETE"
        });
      }
      res.json({
        message: "Proyecto AR eliminado exitosamente"
      });
    } catch (error) {
      console.error("Delete AR project error:", error);
      res.status(500).json({
        error: "Delete AR project failed",
        message: "Error interno eliminando proyecto AR",
        code: "DELETE_AR_PROJECT_ERROR"
      });
    }
  });
  app2.get("/api/ar/scene/:sceneId/mobile-config", async (req, res) => {
    try {
      const { sceneId } = req.params;
      if (!sceneId) {
        return res.status(400).json({
          error: "Invalid input",
          message: "ID de escena requerido",
          code: "MISSING_SCENE_ID_FOR_MOBILE"
        });
      }
      const scene = arService.getARScene(sceneId);
      if (!scene) {
        return res.status(404).json({
          error: "Scene not found",
          message: "Escena AR no encontrada",
          code: "AR_SCENE_NOT_FOUND_FOR_MOBILE"
        });
      }
      const mobileConfig = arService.generateMobileARConfig(scene);
      res.json({
        message: "Configuraci\xF3n m\xF3vil AR generada exitosamente",
        config: mobileConfig
      });
    } catch (error) {
      console.error("Generate mobile AR config error:", error);
      res.status(500).json({
        error: "Generate mobile AR config failed",
        message: "Error interno generando configuraci\xF3n m\xF3vil AR",
        code: "GENERATE_MOBILE_AR_CONFIG_ERROR"
      });
    }
  });
  app2.get("/api/ar/scenes", async (req, res) => {
    try {
      const scenes = arService.listARScenes();
      res.json({
        message: "Escenas AR obtenidas exitosamente",
        scenes,
        count: scenes.length
      });
    } catch (error) {
      console.error("List AR scenes error:", error);
      res.status(500).json({
        error: "List AR scenes failed",
        message: "Error interno listando escenas AR",
        code: "LIST_AR_SCENES_ERROR"
      });
    }
  });
  app2.get("/api/user/level", authenticateToken, async (req, res) => {
    try {
      const userLevel = await storage.getUserLevel(req.user.userId);
      if (!userLevel) {
        const newLevel = await storage.createUserLevel(req.user.userId);
        return res.json(newLevel);
      }
      res.json(userLevel);
    } catch (error) {
      console.error("Get user level error:", error);
      res.status(500).json({ message: "Error al obtener nivel del usuario" });
    }
  });
  app2.get("/api/user/stats", authenticateToken, async (req, res) => {
    try {
      const stats = await storage.getUserStats(req.user.userId);
      res.json(stats);
    } catch (error) {
      console.error("Get user stats error:", error);
      res.status(500).json({ message: "Error al obtener estad\xEDsticas del usuario" });
    }
  });
  app2.get("/api/challenges", async (req, res) => {
    try {
      const filters = {
        level: req.query.level ? parseInt(req.query.level) : void 0,
        frequency: req.query.frequency,
        category: req.query.category,
        difficulty: req.query.difficulty
      };
      const challenges2 = await storage.getChallenges(filters);
      res.json(challenges2);
    } catch (error) {
      console.error("Get challenges error:", error);
      res.status(500).json({ message: "Error al obtener desaf\xEDos" });
    }
  });
  app2.get("/api/challenges/:id", async (req, res) => {
    try {
      const challengeId = parseInt(req.params.id);
      const challenge = await storage.getChallenge(challengeId);
      if (!challenge) {
        return res.status(404).json({ message: "Desaf\xEDo no encontrado" });
      }
      res.json(challenge);
    } catch (error) {
      console.error("Get challenge error:", error);
      res.status(500).json({ message: "Error al obtener desaf\xEDo" });
    }
  });
  app2.get("/api/challenges/:id/steps", async (req, res) => {
    try {
      const challengeId = parseInt(req.params.id);
      const steps = await storage.getChallengeSteps(challengeId);
      res.json(steps);
    } catch (error) {
      console.error("Get challenge steps error:", error);
      res.status(500).json({ message: "Error al obtener pasos del desaf\xEDo" });
    }
  });
  app2.get("/api/user/challenges", authenticateToken, async (req, res) => {
    try {
      const progress = await storage.getUserChallengeProgress(req.user.userId);
      res.json(progress);
    } catch (error) {
      console.error("Get user challenge progress error:", error);
      res.status(500).json({ message: "Error al obtener progreso de desaf\xEDos" });
    }
  });
  app2.post("/api/user/challenges/:id/start", authenticateToken, async (req, res) => {
    try {
      const challengeId = parseInt(req.params.id);
      const progress = await storage.startChallenge(req.user.userId, challengeId);
      res.json(progress);
    } catch (error) {
      console.error("Start challenge error:", error);
      res.status(500).json({ message: "Error al iniciar desaf\xEDo" });
    }
  });
  app2.put("/api/user/challenges/:id/progress", authenticateToken, async (req, res) => {
    try {
      const challengeId = parseInt(req.params.id);
      const { currentStep, completedSteps } = req.body;
      const progress = await storage.updateChallengeProgress(
        req.user.userId,
        challengeId,
        currentStep,
        completedSteps
      );
      res.json(progress);
    } catch (error) {
      console.error("Update challenge progress error:", error);
      res.status(500).json({ message: "Error al actualizar progreso del desaf\xEDo" });
    }
  });
  app2.post("/api/user/challenges/:id/complete", authenticateToken, async (req, res) => {
    try {
      const challengeId = parseInt(req.params.id);
      const progress = await storage.completeChallenge(req.user.userId, challengeId);
      const newBadges = await storage.checkBadgeRequirements(req.user.userId);
      res.json({
        progress,
        newBadges
      });
    } catch (error) {
      console.error("Complete challenge error:", error);
      res.status(500).json({ message: "Error al completar desaf\xEDo" });
    }
  });
  app2.post("/api/user/challenges/:id/step/:stepId/complete", authenticateToken, async (req, res) => {
    try {
      const challengeId = parseInt(req.params.id);
      const stepId = parseInt(req.params.stepId);
      const userProgress2 = await storage.getUserChallengeProgress(req.user.userId);
      const currentProgress = userProgress2.find((p) => p.challengeId === challengeId);
      if (!currentProgress) {
        return res.status(404).json({ message: "Progreso no encontrado" });
      }
      const completedSteps = currentProgress.completedSteps ? JSON.parse(currentProgress.completedSteps) : [];
      if (!completedSteps.includes(stepId)) {
        completedSteps.push(stepId);
      }
      const progress = await storage.updateChallengeProgress(
        req.user.userId,
        challengeId,
        Math.max(currentProgress.currentStep ?? 0, completedSteps.length),
        completedSteps
      );
      res.json(progress);
    } catch (error) {
      console.error("Complete challenge step error:", error);
      res.status(500).json({ message: "Error al completar paso del desaf\xEDo" });
    }
  });
  app2.get("/api/badges", async (req, res) => {
    try {
      const badges2 = await storage.getBadges();
      res.json(badges2);
    } catch (error) {
      console.error("Get badges error:", error);
      res.status(500).json({ message: "Error al obtener badges" });
    }
  });
  app2.get("/api/user/badges", authenticateToken, async (req, res) => {
    try {
      const userBadges2 = await storage.getUserBadges(req.user.userId);
      res.json(userBadges2);
    } catch (error) {
      console.error("Get user badges error:", error);
      res.status(500).json({ message: "Error al obtener badges del usuario" });
    }
  });
  app2.post("/api/user/badges/check", authenticateToken, async (req, res) => {
    try {
      const newBadges = await storage.checkBadgeRequirements(req.user.userId);
      res.json(newBadges);
    } catch (error) {
      console.error("Check badge requirements error:", error);
      res.status(500).json({ message: "Error al verificar badges" });
    }
  });
  app2.get("/api/user/activity", authenticateToken, async (req, res) => {
    try {
      const days = req.query.days ? parseInt(req.query.days) : 30;
      const activity = await storage.getUserActivity(req.user.userId, days);
      res.json(activity);
    } catch (error) {
      console.error("Get user activity error:", error);
      res.status(500).json({ message: "Error al obtener actividad del usuario" });
    }
  });
  app2.post("/api/user/activity/record", authenticateToken, async (req, res) => {
    try {
      const { experienceGained, challengesCompleted, actionsCompleted } = req.body;
      const activity = await storage.recordDailyActivity(
        req.user.userId,
        experienceGained || 0,
        challengesCompleted || 0,
        actionsCompleted || 0
      );
      res.json(activity);
    } catch (error) {
      console.error("Record daily activity error:", error);
      res.status(500).json({ message: "Error al registrar actividad diaria" });
    }
  });
  app2.get("/api/user/mission-alignment", authenticateToken, async (req, res) => {
    try {
      const userId = req.user.userId;
      const context = await getUserCoachingContext(userId);
      const allMemberships = await storage.getUserMemberships(userId);
      const missionMemberships = allMemberships.filter((m) => m.postType === "mission");
      const alignment = computeMissionAlignment(context.archetype, context.lifeAreaGaps);
      const missionPosts = await storage.getCommunityPosts("mission");
      const missionPost = missionPosts.find((p) => p.missionSlug === alignment.recommendedMission);
      const taskCounts = {};
      for (const m of missionMemberships) {
        const tasks = await storage.getInitiativeTasks(m.postId);
        taskCounts[m.postId] = tasks.filter((t) => t.status !== "done").length;
      }
      res.json({
        hasProfile: !!context.archetype,
        hasLifeAreas: context.lifeAreaGaps.length > 0,
        archetype: context.archetype,
        recommendedRole: alignment.recommendedRole,
        recommendedRoleLabel: alignment.recommendedRoleLabel,
        recommendedMission: {
          slug: alignment.recommendedMission,
          label: alignment.recommendedMissionLabel,
          number: alignment.recommendedMissionNumber,
          postId: missionPost?.id || null
        },
        reason: alignment.reason,
        currentMemberships: missionMemberships.map((m) => ({
          postId: m.postId,
          role: m.role,
          missionSlug: m.missionSlug,
          label: m.postTitle,
          pendingTasks: taskCounts[m.postId] || 0
        })),
        weakestLifeArea: context.lifeAreaGaps[0] || null
      });
    } catch (error) {
      console.error("Mission alignment error:", error);
      res.status(500).json({ message: "Error al calcular alineacion de mision" });
    }
  });
  app2.get("/api/user/territory-pulse", authenticateToken, async (req, res) => {
    try {
      const userId = req.user.userId;
      const user = await storage.getUser(userId);
      if (!user || !user.location) {
        return res.json({ hasLocation: false });
      }
      const location = user.location;
      const dreamRows = await db.select({
        id: dreams.id,
        type: dreams.type,
        dream: dreams.dream,
        value: dreams.value,
        need: dreams.need,
        basta: dreams.basta,
        createdAt: dreams.createdAt
      }).from(dreams).where(ilike3(dreams.location, `%${location}%`)).orderBy(drizzleSql`${dreams.createdAt} desc`);
      const dreamCount = dreamRows.length;
      const recentDreams = dreamRows.slice(0, 3).map((d) => ({
        id: d.id,
        type: d.type,
        text: d.dream ?? d.value ?? d.need ?? d.basta ?? "",
        createdAt: d.createdAt ?? ""
      }));
      const memberRows = await db.select({ id: users.id }).from(users).where(ilike3(users.location, `%${location}%`));
      const memberCount = memberRows.length;
      return res.json({
        hasLocation: true,
        territoryName: location,
        dreamCount,
        recentDreams,
        memberCount
      });
    } catch (error) {
      console.error("Territory pulse error:", error);
      res.status(500).json({ message: "Error al obtener pulso territorial" });
    }
  });
  app2.get("/api/missions", async (_req, res) => {
    try {
      const missionPosts = await storage.getCommunityPosts("mission");
      const stats = await Promise.all(MISSIONS.map(async (mission) => {
        const post = missionPosts.find((p) => p.missionSlug === mission.slug);
        if (!post) {
          return {
            slug: mission.slug,
            number: mission.number,
            label: mission.label,
            postId: null,
            memberCount: 0,
            milestonesCompleted: 0,
            milestonesTotal: 0,
            evidenceCount: 0,
            activeTaskCount: 0,
            status: "active"
          };
        }
        const [members, milestones, tasks, evidenceCount] = await Promise.all([
          storage.getInitiativeMembers(post.id),
          storage.getInitiativeMilestones(post.id),
          storage.getInitiativeTasks(post.id),
          storage.getEvidenceCount(post.id)
        ]);
        return {
          slug: mission.slug,
          number: mission.number,
          label: mission.label,
          postId: post.id,
          memberCount: members.length,
          milestonesCompleted: milestones.filter((m) => m.status === "completed").length,
          milestonesTotal: milestones.length,
          evidenceCount,
          activeTaskCount: tasks.filter((t) => t.status !== "done").length,
          status: post.status
        };
      }));
      res.json(stats);
    } catch (error) {
      console.error("Failed to fetch mission stats:", error);
      res.status(500).json({ message: "Failed to fetch mission stats" });
    }
  });
  app2.get("/api/missions/:slug/signals", async (req, res) => {
    try {
      const { slug } = req.params;
      const mission = MISSIONS.find((m) => m.slug === slug);
      if (!mission) {
        return res.status(404).json({ message: "Mission not found" });
      }
      const allDreams = await storage.getDreams();
      const scored = allDreams.map((dream) => ({
        dream,
        ...matchDreamToMissions(dream, [mission])[0]
      })).filter((s) => s.score > 0).sort((a, b) => {
        const dateA = new Date(a.dream.createdAt || 0).getTime();
        const dateB = new Date(b.dream.createdAt || 0).getTime();
        return dateB - dateA;
      }).slice(0, 50);
      res.json(scored);
    } catch (error) {
      console.error("Failed to fetch mission signals:", error);
      res.status(500).json({ message: "Failed to fetch mission signals" });
    }
  });
  app2.get("/api/community/:postId/evidence", async (req, res) => {
    try {
      const postId = parseInt(req.params.postId);
      if (isNaN(postId)) return res.status(400).json({ message: "Invalid post ID" });
      const status = req.query.status;
      const evidence = await storage.getEvidence(postId, status);
      const enriched = await Promise.all(evidence.map(async (e) => {
        const user = e.userId ? await storage.getUser(e.userId) : null;
        const verifier = e.verifiedBy ? await storage.getUser(e.verifiedBy) : null;
        return {
          ...e,
          user: user ? { id: user.id, name: user.name, username: user.username } : null,
          verifier: verifier ? { id: verifier.id, name: verifier.name, username: verifier.username } : null
        };
      }));
      res.json(enriched);
    } catch (error) {
      console.error("Failed to fetch evidence:", error);
      res.status(500).json({ message: "Failed to fetch evidence" });
    }
  });
  app2.post("/api/community/:postId/evidence", authenticateToken, async (req, res) => {
    try {
      const postId = parseInt(req.params.postId);
      if (isNaN(postId)) return res.status(400).json({ message: "Invalid post ID" });
      if (!req.user) return res.status(401).json({ message: "Authentication required" });
      const members = await storage.getInitiativeMembers(postId);
      const isMember = members.some((m) => m.userId === req.user.userId && m.status === "active");
      if (!isMember) return res.status(403).json({ message: "Debes ser miembro para enviar evidencia" });
      if (!req.body.evidenceType || typeof req.body.evidenceType !== "string") {
        return res.status(400).json({ message: "evidenceType es requerido" });
      }
      if (!req.body.content || typeof req.body.content !== "string") {
        return res.status(400).json({ message: "content es requerido" });
      }
      const post = await storage.getCommunityPostWithDetails(postId);
      if (post?.type === "mission" && post.missionSlug) {
        const mission = MISSIONS.find((m) => m.slug === post.missionSlug);
        if (mission && req.body.evidenceType && !mission.evidenceAccepted.includes(req.body.evidenceType)) {
          return res.status(400).json({ message: "Tipo de evidencia no aceptado para esta mision" });
        }
      }
      const evidence = await storage.createEvidence({
        postId,
        userId: req.user.userId,
        evidenceType: req.body.evidenceType,
        content: req.body.content,
        imageUrl: req.body.imageUrl || null,
        latitude: req.body.latitude || null,
        longitude: req.body.longitude || null,
        milestoneId: req.body.milestoneId || null
      });
      res.status(201).json(evidence);
    } catch (error) {
      console.error("Failed to create evidence:", error);
      res.status(500).json({ message: "Failed to create evidence" });
    }
  });
  app2.post("/api/community/:postId/evidence/:evidenceId/verify", authenticateToken, async (req, res) => {
    try {
      const postId = parseInt(req.params.postId);
      const evidenceId = parseInt(req.params.evidenceId);
      if (isNaN(postId) || isNaN(evidenceId)) return res.status(400).json({ message: "Invalid ID" });
      if (!req.user) return res.status(401).json({ message: "Authentication required" });
      const members = await storage.getInitiativeMembers(postId);
      const member = members.find((m) => m.userId === req.user.userId && m.status === "active");
      if (!member || member.role !== "custodio") {
        return res.status(403).json({ message: "Solo los custodios pueden verificar evidencia" });
      }
      const updated = await storage.verifyEvidence(evidenceId, req.user.userId);
      res.json(updated);
    } catch (error) {
      console.error("Failed to verify evidence:", error);
      res.status(500).json({ message: "Failed to verify evidence" });
    }
  });
  app2.post("/api/community/:postId/evidence/:evidenceId/flag", authenticateToken, async (req, res) => {
    try {
      const postId = parseInt(req.params.postId);
      const evidenceId = parseInt(req.params.evidenceId);
      if (isNaN(postId) || isNaN(evidenceId)) return res.status(400).json({ message: "Invalid ID" });
      if (!req.user) return res.status(401).json({ message: "Authentication required" });
      const { flagCategory } = req.body;
      if (!flagCategory) return res.status(400).json({ message: "flagCategory required" });
      const members = await storage.getInitiativeMembers(postId);
      const member = members.find((m) => m.userId === req.user.userId && m.status === "active");
      if (!member || member.role !== "custodio") {
        return res.status(403).json({ message: "Solo los custodios pueden marcar evidencia" });
      }
      const post = await storage.getCommunityPostWithDetails(postId);
      if (post?.type === "mission" && post.missionSlug) {
        const mission = MISSIONS.find((m) => m.slug === post.missionSlug);
        if (mission && !mission.pauseConditions.includes(flagCategory)) {
          return res.status(400).json({ message: "Condicion de pausa no valida para esta mision" });
        }
      }
      const updated = await storage.flagEvidence(evidenceId, flagCategory, req.user.userId);
      const flagCounts = await storage.getEvidenceCountByFlag(postId);
      const thisFlag = flagCounts.find((f) => f.flagCategory === flagCategory);
      if (thisFlag && thisFlag.count >= 3 && post) {
        await storage.updateCommunityPost(postId, { status: "paused" }, post.userId);
      }
      res.json({ evidence: updated, paused: (thisFlag?.count ?? 0) >= 3 });
    } catch (error) {
      console.error("Failed to flag evidence:", error);
      res.status(500).json({ message: "Failed to flag evidence" });
    }
  });
  app2.get("/api/community/:postId/chronicles", async (req, res) => {
    try {
      const postId = parseInt(req.params.postId);
      if (isNaN(postId)) return res.status(400).json({ message: "Invalid post ID" });
      const chronicles = await storage.getChronicles(postId);
      const enriched = await Promise.all(chronicles.map(async (c) => {
        const user = c.userId ? await storage.getUser(c.userId) : null;
        return {
          ...c,
          user: user ? { id: user.id, name: user.name, username: user.username } : null
        };
      }));
      res.json(enriched);
    } catch (error) {
      console.error("Failed to fetch chronicles:", error);
      res.status(500).json({ message: "Failed to fetch chronicles" });
    }
  });
  app2.post("/api/community/:postId/chronicles", authenticateToken, async (req, res) => {
    try {
      const postId = parseInt(req.params.postId);
      if (isNaN(postId)) return res.status(400).json({ message: "Invalid post ID" });
      if (!req.user) return res.status(401).json({ message: "Authentication required" });
      if (!req.body.title || typeof req.body.title !== "string") {
        return res.status(400).json({ message: "title es requerido" });
      }
      if (!req.body.content || typeof req.body.content !== "string") {
        return res.status(400).json({ message: "content es requerido" });
      }
      const members = await storage.getInitiativeMembers(postId);
      const member = members.find((m) => m.userId === req.user.userId && m.status === "active");
      if (!member || member.role !== "narrador") {
        return res.status(403).json({ message: "Solo los narradores pueden escribir cronicas" });
      }
      const chronicle = await storage.createChronicle({
        postId,
        userId: req.user.userId,
        title: req.body.title,
        content: req.body.content,
        highlightedEvidenceIds: req.body.highlightedEvidenceIds ? JSON.stringify(req.body.highlightedEvidenceIds) : null,
        publishedAt: (/* @__PURE__ */ new Date()).toISOString()
      });
      res.status(201).json(chronicle);
    } catch (error) {
      console.error("Failed to create chronicle:", error);
      res.status(500).json({ message: "Failed to create chronicle" });
    }
  });
  app2.get("/api/blog/stats", async (_req, res) => {
    try {
      const stats = await storage.getBlogPostStats();
      res.json(stats);
    } catch (error) {
      console.error("Get blog stats error:", error);
      res.status(500).json({
        message: "Error al obtener estad\xEDsticas del blog"
      });
    }
  });
  app2.get("/api/blog/posts", async (req, res) => {
    try {
      const {
        type,
        // 'blog' | 'vlog'
        category,
        tag,
        search,
        featured,
        page = "1",
        limit = "10"
      } = req.query;
      const filters = {
        page: parseInt(page),
        limit: parseInt(limit)
      };
      if (type) filters.type = type;
      if (category) filters.category = category;
      if (tag) filters.tag = tag;
      if (search) filters.search = search;
      if (featured === "true") filters.featured = true;
      if (featured === "false") filters.featured = false;
      const posts = await storage.getBlogPosts(filters);
      res.json(posts);
    } catch (error) {
      console.error("Get blog posts error:", error);
      console.error("Error details:", error instanceof Error ? error.stack : error);
      res.status(500).json({
        message: "Error al obtener posts del blog",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.get("/api/blog/posts/:slug", optionalAuth, async (req, res) => {
    try {
      const { slug } = req.params;
      const post = await storage.getBlogPost(slug);
      if (!post) {
        return res.status(404).json({ message: "Post no encontrado" });
      }
      if (req.user) {
        await storage.recordPostView(post.id, req.user.userId);
      }
      res.json(post);
    } catch (error) {
      console.error("Get blog post error:", error);
      res.status(500).json({ message: "Error al obtener el post" });
    }
  });
  app2.post("/api/blog/posts", authenticateToken, async (req, res) => {
    try {
      const validatedData = insertBlogPostSchema.parse(req.body);
      const post = await storage.createBlogPost({
        ...validatedData,
        authorId: req.user.userId
      });
      res.status(201).json(post);
    } catch (error) {
      if (error instanceof z5.ZodError) {
        res.status(400).json({ message: "Datos de post inv\xE1lidos", errors: error.errors });
      } else {
        console.error("Create blog post error:", error);
        res.status(500).json({ message: "Error al crear el post" });
      }
    }
  });
  app2.put("/api/blog/posts/:id", authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertBlogPostSchema.parse(req.body);
      const post = await storage.updateBlogPost(parseInt(id), validatedData, req.user.userId);
      if (!post) {
        return res.status(404).json({ message: "Post no encontrado o sin permisos" });
      }
      res.json(post);
    } catch (error) {
      if (error instanceof z5.ZodError) {
        res.status(400).json({ message: "Datos de post inv\xE1lidos", errors: error.errors });
      } else {
        console.error("Update blog post error:", error);
        res.status(500).json({ message: "Error al actualizar el post" });
      }
    }
  });
  app2.delete("/api/blog/posts/:id", authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteBlogPost(parseInt(id), req.user.userId);
      if (!success) {
        return res.status(404).json({ message: "Post no encontrado o sin permisos" });
      }
      res.json({ message: "Post eliminado exitosamente" });
    } catch (error) {
      console.error("Delete blog post error:", error);
      res.status(500).json({ message: "Error al eliminar el post" });
    }
  });
  app2.post("/api/blog/posts/:id/like", authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const result = await storage.togglePostLike(parseInt(id), req.user.userId);
      res.json(result);
    } catch (error) {
      console.error("Toggle post like error:", error);
      res.status(500).json({ message: "Error al dar/quitar like" });
    }
  });
  app2.get("/api/blog/posts/:id/likes", async (req, res) => {
    try {
      const { id } = req.params;
      const likes = await storage.getPostLikes(parseInt(id));
      res.json(likes);
    } catch (error) {
      console.error("Get post likes error:", error);
      res.status(500).json({ message: "Error al obtener likes" });
    }
  });
  app2.post("/api/blog/posts/:id/comments", authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const { content, parentId } = req.body;
      if (!content || content.trim().length < 10) {
        return res.status(400).json({ message: "El comentario debe tener al menos 10 caracteres" });
      }
      const comment = await storage.createPostComment(parseInt(id), req.user.userId, content, parentId);
      res.status(201).json(comment);
    } catch (error) {
      console.error("Create comment error:", error);
      res.status(500).json({ message: "Error al crear comentario" });
    }
  });
  app2.get("/api/blog/posts/:id/comments", async (req, res) => {
    try {
      const { id } = req.params;
      const comments = await storage.getPostComments(parseInt(id));
      res.json(comments);
    } catch (error) {
      console.error("Get comments error:", error);
      res.status(500).json({ message: "Error al obtener comentarios" });
    }
  });
  app2.put("/api/blog/comments/:id", authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const { content } = req.body;
      if (!content || content.trim().length < 10) {
        return res.status(400).json({ message: "El comentario debe tener al menos 10 caracteres" });
      }
      const comment = await storage.updatePostComment(parseInt(id), content, req.user.userId);
      if (!comment) {
        return res.status(404).json({ message: "Comentario no encontrado o sin permisos" });
      }
      res.json(comment);
    } catch (error) {
      console.error("Update comment error:", error);
      res.status(500).json({ message: "Error al actualizar comentario" });
    }
  });
  app2.delete("/api/blog/comments/:id", authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deletePostComment(parseInt(id), req.user.userId);
      if (!success) {
        return res.status(404).json({ message: "Comentario no encontrado o sin permisos" });
      }
      res.json({ message: "Comentario eliminado exitosamente" });
    } catch (error) {
      console.error("Delete comment error:", error);
      res.status(500).json({ message: "Error al eliminar comentario" });
    }
  });
  app2.post("/api/blog/posts/:id/bookmark", authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const result = await storage.togglePostBookmark(parseInt(id), req.user.userId);
      res.json(result);
    } catch (error) {
      console.error("Toggle bookmark error:", error);
      res.status(500).json({ message: "Error al guardar/quitar bookmark" });
    }
  });
  app2.get("/api/blog/bookmarks", authenticateToken, async (req, res) => {
    try {
      const bookmarks = await storage.getUserBookmarks(req.user.userId);
      res.json(bookmarks);
    } catch (error) {
      console.error("Get bookmarks error:", error);
      res.status(500).json({ message: "Error al obtener bookmarks" });
    }
  });
  app2.post("/api/blog/posts/:id/view", async (req, res) => {
    try {
      const { id } = req.params;
      const { userId, sessionId } = req.body;
      await storage.recordPostView(parseInt(id), userId, sessionId);
      res.json({ message: "View registrada" });
    } catch (error) {
      console.error("Record view error:", error);
      res.status(500).json({ message: "Error al registrar view" });
    }
  });
  app2.get("/api/blog/search", async (req, res) => {
    try {
      const { q: query, type, category, page = "1", limit = "10" } = req.query;
      if (!query || query.toString().trim().length < 2) {
        return res.status(400).json({ message: "Query debe tener al menos 2 caracteres" });
      }
      const results = await storage.searchPosts(query, {
        type,
        category,
        page: parseInt(page),
        limit: parseInt(limit)
      });
      res.json(results);
    } catch (error) {
      console.error("Search posts error:", error);
      res.status(500).json({ message: "Error en b\xFAsqueda" });
    }
  });
  app2.get("/api/blog/trending", async (req, res) => {
    try {
      const { days = "7", limit = "10" } = req.query;
      const posts = await storage.getTrendingPosts(parseInt(days), parseInt(limit));
      res.json(posts);
    } catch (error) {
      console.error("Get trending posts error:", error);
      res.status(500).json({ message: "Error al obtener posts trending" });
    }
  });
  app2.get("/api/blog/posts/:id/related", async (req, res) => {
    try {
      const { id } = req.params;
      const { limit = "4" } = req.query;
      const posts = await storage.getRelatedPosts(parseInt(id), parseInt(limit));
      res.json(posts);
    } catch (error) {
      console.error("Get related posts error:", error);
      res.status(500).json({ message: "Error al obtener posts relacionados" });
    }
  });
  app2.get("/api/blog/tags/popular", async (req, res) => {
    try {
      const { limit = "20" } = req.query;
      const tags = await storage.getPopularTags(parseInt(limit));
      res.json(tags);
    } catch (error) {
      console.error("Get popular tags error:", error);
      res.status(500).json({ message: "Error al obtener tags populares" });
    }
  });
  app2.get("/api/stories", async (req, res) => {
    try {
      const { category, status, featured, limit, offset } = req.query;
      const filters = {};
      if (category) filters.category = category;
      if (status) filters.status = status;
      if (featured !== void 0) filters.featured = featured === "true";
      if (limit) filters.limit = parseInt(limit);
      if (offset) filters.offset = parseInt(offset);
      const stories2 = await storage.getInspiringStories(filters);
      res.json({
        success: true,
        data: stories2,
        total: stories2.length
      });
    } catch (error) {
      console.error("Error fetching inspiring stories:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Error fetching inspiring stories"
      });
    }
  });
  app2.get("/api/stories/featured", async (req, res) => {
    try {
      const { limit } = req.query;
      const stories2 = await storage.getFeaturedStories(limit ? parseInt(limit) : 3);
      res.json({
        success: true,
        data: stories2
      });
    } catch (error) {
      console.error("Error fetching featured stories:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Error fetching featured stories"
      });
    }
  });
  app2.get("/api/stories/category/:category", async (req, res) => {
    try {
      const { category } = req.params;
      const { limit } = req.query;
      const stories2 = await storage.getStoriesByCategory(category, limit ? parseInt(limit) : 5);
      res.json({
        success: true,
        data: stories2
      });
    } catch (error) {
      console.error("Error fetching stories by category:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Error fetching stories by category"
      });
    }
  });
  app2.get("/api/stories/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const storyId = parseInt(id);
      if (isNaN(storyId)) {
        return res.status(400).json({
          error: "Bad Request",
          message: "Invalid story ID"
        });
      }
      const story = await storage.getInspiringStory(storyId);
      if (!story) {
        return res.status(404).json({
          error: "Not Found",
          message: "Story not found"
        });
      }
      await storage.incrementStoryViews(storyId);
      res.json({
        success: true,
        data: story
      });
    } catch (error) {
      console.error("Error fetching inspiring story:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Error fetching inspiring story"
      });
    }
  });
  app2.post("/api/stories", optionalAuth, sanitizeInput, async (req, res) => {
    try {
      const user = req.user;
      const validatedData = createInspiringStorySchema.parse(req.body);
      const story = await storage.createInspiringStory({
        ...validatedData,
        authorId: user?.userId || null,
        status: "pending",
        // New stories need moderation
        publishedAt: (/* @__PURE__ */ new Date()).toISOString()
      });
      res.status(201).json({
        success: true,
        data: story,
        message: "Story created successfully and submitted for moderation"
      });
    } catch (error) {
      if (error instanceof z5.ZodError) {
        return res.status(400).json({
          error: "Validation Error",
          message: "Invalid story data",
          details: error.errors
        });
      }
      console.error("Error creating inspiring story:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Error creating inspiring story"
      });
    }
  });
  app2.put("/api/stories/:id", authenticateToken, sanitizeInput, async (req, res) => {
    try {
      const { id } = req.params;
      const storyId = parseInt(id);
      const user = req.user;
      if (isNaN(storyId)) {
        return res.status(400).json({
          error: "Bad Request",
          message: "Invalid story ID"
        });
      }
      const existingStory = await storage.getInspiringStory(storyId);
      if (!existingStory) {
        return res.status(404).json({
          error: "Not Found",
          message: "Story not found"
        });
      }
      if (existingStory.authorId !== user.userId && user.userId !== 1) {
        return res.status(403).json({
          error: "Forbidden",
          message: "You can only edit your own stories"
        });
      }
      const validatedData = createInspiringStorySchema.partial().parse(req.body);
      const updatedStory = await storage.updateInspiringStory(storyId, validatedData);
      res.json({
        success: true,
        data: updatedStory,
        message: "Story updated successfully"
      });
    } catch (error) {
      if (error instanceof z5.ZodError) {
        return res.status(400).json({
          error: "Validation Error",
          message: "Invalid story data",
          details: error.errors
        });
      }
      console.error("Error updating inspiring story:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Error updating inspiring story"
      });
    }
  });
  app2.delete("/api/stories/:id", authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const storyId = parseInt(id);
      const user = req.user;
      if (isNaN(storyId)) {
        return res.status(400).json({
          error: "Bad Request",
          message: "Invalid story ID"
        });
      }
      const existingStory = await storage.getInspiringStory(storyId);
      if (!existingStory) {
        return res.status(404).json({
          error: "Not Found",
          message: "Story not found"
        });
      }
      if (existingStory.authorId !== user.userId && user.userId !== 1) {
        return res.status(403).json({
          error: "Forbidden",
          message: "You can only delete your own stories"
        });
      }
      await storage.deleteInspiringStory(storyId);
      res.json({
        success: true,
        message: "Story deleted successfully"
      });
    } catch (error) {
      console.error("Error deleting inspiring story:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Error deleting inspiring story"
      });
    }
  });
  app2.post("/api/stories/:id/like", optionalAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const storyId = parseInt(id);
      if (isNaN(storyId)) {
        return res.status(400).json({
          error: "Bad Request",
          message: "Invalid story ID"
        });
      }
      const story = await storage.getInspiringStory(storyId);
      if (!story) {
        return res.status(404).json({
          error: "Not Found",
          message: "Story not found"
        });
      }
      await storage.incrementStoryLikes(storyId);
      res.json({
        success: true,
        message: "Story liked successfully"
      });
    } catch (error) {
      console.error("Error liking inspiring story:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Error liking inspiring story"
      });
    }
  });
  app2.post("/api/stories/:id/share", optionalAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const storyId = parseInt(id);
      if (isNaN(storyId)) {
        return res.status(400).json({
          error: "Bad Request",
          message: "Invalid story ID"
        });
      }
      const story = await storage.getInspiringStory(storyId);
      if (!story) {
        return res.status(404).json({
          error: "Not Found",
          message: "Story not found"
        });
      }
      await storage.incrementStoryShares(storyId);
      res.json({
        success: true,
        message: "Story shared successfully"
      });
    } catch (error) {
      console.error("Error sharing inspiring story:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Error sharing inspiring story"
      });
    }
  });
  app2.put("/api/stories/:id/moderate", authenticateToken, sanitizeInput, async (req, res) => {
    try {
      const { id } = req.params;
      const storyId = parseInt(id);
      const user = req.user;
      const { status, notes } = req.body;
      if (isNaN(storyId)) {
        return res.status(400).json({
          error: "Bad Request",
          message: "Invalid story ID"
        });
      }
      if (user.userId !== 1) {
        return res.status(403).json({
          error: "Forbidden",
          message: "Only administrators can moderate stories"
        });
      }
      const story = await storage.getInspiringStory(storyId);
      if (!story) {
        return res.status(404).json({
          error: "Not Found",
          message: "Story not found"
        });
      }
      if (!["pending", "approved", "rejected"].includes(status)) {
        return res.status(400).json({
          error: "Bad Request",
          message: "Invalid status. Must be 'pending', 'approved', or 'rejected'"
        });
      }
      const moderatedStory = await storage.moderateStory(storyId, status, user.userId, notes);
      res.json({
        success: true,
        data: moderatedStory,
        message: `Story ${status} successfully`
      });
    } catch (error) {
      console.error("Error moderating inspiring story:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Error moderating inspiring story"
      });
    }
  });
  app2.get("/api/commitments", optionalAuth, async (req, res) => {
    try {
      const rawLimit = Number(req.query.limit);
      const limit = Number.isFinite(rawLimit) ? Math.max(1, Math.min(rawLimit, 100)) : 20;
      const [commitments, stats] = await Promise.all([
        storage.getRecentCommitments(limit),
        storage.getCommitmentStats()
      ]);
      res.json({
        success: true,
        data: {
          commitments,
          stats
        }
      });
    } catch (error) {
      console.error("Error fetching commitments:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Error fetching commitments"
      });
    }
  });
  app2.post("/api/commitment", authenticateToken, sanitizeInput, async (req, res) => {
    try {
      const user = req.user;
      const { commitmentText, commitmentType, latitude, longitude, province, city } = req.body;
      if (!commitmentText || !commitmentType) {
        return res.status(400).json({
          error: "Bad Request",
          message: "commitmentText and commitmentType are required"
        });
      }
      const parsedLatitude = latitude !== void 0 && latitude !== null && latitude !== "" ? Number(latitude) : null;
      const parsedLongitude = longitude !== void 0 && longitude !== null && longitude !== "" ? Number(longitude) : null;
      if (parsedLatitude !== null && !Number.isFinite(parsedLatitude) || parsedLongitude !== null && !Number.isFinite(parsedLongitude)) {
        return res.status(400).json({
          error: "Bad Request",
          message: "latitude and longitude must be valid numbers when provided"
        });
      }
      if (parsedLatitude === null !== (parsedLongitude === null)) {
        return res.status(400).json({
          error: "Bad Request",
          message: "latitude and longitude must be provided together"
        });
      }
      if (parsedLatitude !== null && parsedLongitude !== null && (parsedLatitude < -90 || parsedLatitude > 90 || parsedLongitude < -180 || parsedLongitude > 180)) {
        return res.status(400).json({
          error: "Bad Request",
          message: "latitude must be between -90 and 90 and longitude between -180 and 180"
        });
      }
      const commitment = await storage.saveCommitment(user.userId, commitmentText, commitmentType, {
        latitude: parsedLatitude,
        longitude: parsedLongitude,
        province: typeof province === "string" ? province : null,
        city: typeof city === "string" ? city : null
      });
      res.json({
        success: true,
        data: commitment,
        message: "Commitment saved successfully"
      });
    } catch (error) {
      console.error("Error saving commitment:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Error saving commitment"
      });
    }
  });
  app2.get("/api/badges/:userId", authenticateToken, async (req, res) => {
    try {
      const { userId } = req.params;
      const user = req.user;
      const requestedUserId = parseInt(userId);
      const tokenUserId = Number(user.userId);
      console.log("[Badges] Requested userId:", requestedUserId, "Token userId:", tokenUserId, "Types:", typeof requestedUserId, typeof tokenUserId, "Match:", tokenUserId === requestedUserId);
      if (tokenUserId !== requestedUserId && tokenUserId !== 1) {
        console.log("[Badges] Authorization failed - userId mismatch. Requested:", requestedUserId, "Token:", tokenUserId);
        return res.status(403).json({
          error: "Forbidden",
          message: "You can only view your own badges",
          code: "AUTHORIZATION_FAILED",
          requestedUserId,
          tokenUserId
        });
      }
      const badges2 = await storage.getUserBadges(parseInt(userId));
      res.json({
        success: true,
        data: badges2
      });
    } catch (error) {
      console.error("Error fetching user badges:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Error fetching user badges"
      });
    }
  });
  app2.get("/api/leaderboard", optionalAuth, async (req, res) => {
    try {
      const { type = "global", limit = 10 } = req.query;
      const leaderboard = await storage.getLeaderboard(type, parseInt(limit));
      res.json({
        success: true,
        data: leaderboard
      });
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Error fetching leaderboard"
      });
    }
  });
  app2.post("/api/action", authenticateToken, sanitizeInput, async (req, res) => {
    try {
      const user = req.user;
      const { actionType, metadata } = req.body;
      if (!actionType) {
        return res.status(400).json({
          error: "Bad Request",
          message: "actionType is required"
        });
      }
      const action = await storage.recordAction(user.userId, actionType, metadata);
      res.json({
        success: true,
        data: action,
        message: "Action recorded successfully"
      });
    } catch (error) {
      console.error("Error recording action:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Error recording action"
      });
    }
  });
  app2.get("/api/progress/:userId", authenticateToken, async (req, res) => {
    try {
      const { userId } = req.params;
      const user = req.user;
      const requestedUserId = parseInt(userId);
      const tokenUserId = Number(user.userId);
      console.log("[Progress] Requested userId:", requestedUserId, "Token userId:", tokenUserId, "Types:", typeof requestedUserId, typeof tokenUserId, "Match:", tokenUserId === requestedUserId);
      if (tokenUserId !== requestedUserId && tokenUserId !== 1) {
        console.log("[Progress] Authorization failed - userId mismatch. Requested:", requestedUserId, "Token:", tokenUserId);
        return res.status(403).json({
          error: "Forbidden",
          message: "You can only view your own progress",
          code: "AUTHORIZATION_FAILED",
          requestedUserId,
          tokenUserId
        });
      }
      const progress = await storage.getUserProgress(parseInt(userId));
      res.json({
        success: true,
        data: progress
      });
    } catch (error) {
      console.error("Error fetching user progress:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Error fetching user progress"
      });
    }
  });
  app2.post("/api/badges/award", authenticateToken, sanitizeInput, async (req, res) => {
    try {
      const user = req.user;
      const { badgeId, userId } = req.body;
      if (user.userId !== 1 && user.userId !== userId) {
        return res.status(403).json({
          error: "Forbidden",
          message: "Only administrators can award badges"
        });
      }
      const badge = await storage.awardBadge(userId || user.userId, badgeId);
      res.json({
        success: true,
        data: badge,
        message: "Badge awarded successfully"
      });
    } catch (error) {
      console.error("Error awarding badge:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Error awarding badge"
      });
    }
  });
  app2.get("/api/blog-posts", optionalAuth, async (req, res) => {
    try {
      const { category, type, search, page = 1, limit = 10 } = req.query;
      const posts = await storage.getBlogPosts({
        category,
        type,
        search,
        page: parseInt(page),
        limit: parseInt(limit)
      });
      res.json({
        success: true,
        data: posts
      });
    } catch (error) {
      console.error("Error fetching blog posts:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Error fetching blog posts"
      });
    }
  });
  app2.get("/api/blog-posts/:id", optionalAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const post = await storage.getBlogPost(id);
      if (!post) {
        return res.status(404).json({
          error: "Not Found",
          message: "Post not found"
        });
      }
      res.json({
        success: true,
        data: post
      });
    } catch (error) {
      console.error("Error fetching blog post:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Error fetching blog post"
      });
    }
  });
  app2.post("/api/feedback", optionalAuth, async (req, res) => {
    try {
      const parsed = insertPlatformFeedbackSchema.safeParse({
        ...req.body,
        userId: req.user?.userId || null
      });
      if (!parsed.success) {
        return res.status(400).json({ error: "Datos inv\xE1lidos", details: parsed.error.errors });
      }
      const feedback = await storage.createPlatformFeedback(parsed.data);
      res.status(201).json(feedback);
    } catch (error) {
      console.error("Error creating feedback:", error);
      res.status(500).json({ error: "Error al enviar feedback" });
    }
  });
  app2.get("/api/admin/feedback", authenticateToken, async (req, res) => {
    try {
      if (req.user?.userId !== 1) {
        return res.status(403).json({ error: "Forbidden" });
      }
      const feedback = await storage.getAllPlatformFeedback();
      res.json(feedback);
    } catch (error) {
      console.error("Error fetching feedback:", error);
      res.status(500).json({ error: "Error al obtener feedback" });
    }
  });
  app2.patch("/api/admin/feedback/:id/status", authenticateToken, async (req, res) => {
    try {
      if (req.user?.userId !== 1) {
        return res.status(403).json({ error: "Forbidden" });
      }
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "ID inv\xE1lido" });
      }
      const { status, adminNotes } = req.body;
      if (!status || !["nueva", "revisada", "resuelta"].includes(status)) {
        return res.status(400).json({ error: "Estado inv\xE1lido. Debe ser 'nueva', 'revisada' o 'resuelta'" });
      }
      const feedback = await storage.updatePlatformFeedbackStatus(id, status, adminNotes);
      if (!feedback) {
        return res.status(404).json({ error: "Feedback no encontrado" });
      }
      res.json(feedback);
    } catch (error) {
      console.error("Error updating feedback:", error);
      res.status(500).json({ error: "Error al actualizar feedback" });
    }
  });
  app2.use("/api", notFoundHandler);
  app2.use(errorHandler);
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vercel-handler.ts
init_storage();
var app = null;
function maybeRestoreOriginalApiPath(req) {
  const raw = req.query?.path;
  const pathPart = Array.isArray(raw) ? raw[0] : raw;
  if (typeof pathPart !== "string" || !pathPart) return;
  const currentUrl = new URL(req.url || "/", "http://localhost");
  currentUrl.searchParams.delete("path");
  const remainingQuery = currentUrl.searchParams.toString();
  const normalized = pathPart.startsWith("/") ? pathPart : `/${pathPart}`;
  req.url = `/api${normalized}${remainingQuery ? `?${remainingQuery}` : ""}`;
}
async function getApp() {
  if (app) {
    return app;
  }
  app = express();
  app.use(securityHeaders());
  app.use(corsConfig());
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: false, limit: "10mb" }));
  if (storage instanceof DatabaseStorage) {
    console.log("[vercel] Initializing database and sample data...");
    await storage.initSampleData();
    console.log("[vercel] Database initialized successfully");
  }
  await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    console.error("Error:", err);
    res.status(status).json({ message });
  });
  return app;
}
function neutralizeVercelBodyGetter(req) {
  const descriptor = Object.getOwnPropertyDescriptor(req, "body") || Object.getOwnPropertyDescriptor(Object.getPrototypeOf(req), "body");
  if (descriptor?.get) {
    Object.defineProperty(req, "body", {
      value: void 0,
      writable: true,
      enumerable: true,
      configurable: true
    });
  }
}
async function handler(req, res) {
  try {
    maybeRestoreOriginalApiPath(req);
    neutralizeVercelBodyGetter(req);
    const expressApp = await getApp();
    return expressApp(req, res);
  } catch (error) {
    console.error("[vercel handler] Fatal error:", error);
    res.status(500).json({
      error: "Server initialization failed",
      message: error?.message || "Unknown error",
      stack: error?.stack?.split("\n").slice(0, 5)
    });
  }
}
export {
  handler as default
};
