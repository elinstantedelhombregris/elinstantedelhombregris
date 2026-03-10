// @ts-nocheck

import { 
  users, type User, type InsertUser,
  dreams, type Dream, type InsertDream,
  communityPosts, type CommunityPost, type InsertCommunityPost,
  communityPostInteractions, type CommunityPostInteraction, type InsertCommunityPostInteraction,
  communityMessages, type CommunityMessage, type InsertCommunityMessage,
  communityPostActivity, type CommunityPostActivity, type InsertCommunityPostActivity,
  geographicLocations, type GeographicLocation, type InsertGeographicLocation,
  communityPostLikes, type CommunityPostLike, type InsertCommunityPostLike,
  communityPostViews, type CommunityPostView, type InsertCommunityPostView,
  userLevels, type InsertUserLevel,
  challenges, type InsertChallenge,
  challengeSteps, type InsertChallengeStep,
  userChallengeProgress, type InsertUserChallengeProgress,
  badges, type InsertBadge,
  userBadges, type InsertUserBadge,
  userDailyActivity, type InsertUserDailyActivity,
  resources, type Resource, type InsertResource,
  inspiringStories, type InspiringStory, type InsertInspiringStory,
  // Blog tables
  blogPosts, type BlogPost, type InsertBlogPost,
  postTags, type PostTag, type InsertPostTag,
  postLikes, type PostLike, type InsertPostLike,
  postComments, type PostComment, type InsertPostComment,
  postBookmarks, type PostBookmark, type InsertPostBookmark,
  postViews, type PostView, type InsertPostView,
  // ¡BASTA! Gamification tables
  userCommitments, type InsertUserCommitment,
  userActions, type InsertUserAction,
  userProgress, type InsertUserProgress,
  weeklyRankings, type InsertWeeklyRanking,
  monthlyRankings, type InsertMonthlyRanking,
  provinceRankings, type InsertProvinceRanking,
  // New Initiative Features tables
  initiativeMembers, type InitiativeMember, type InsertInitiativeMember,
  initiativeMilestones, type InitiativeMilestone, type InsertInitiativeMilestone,
  initiativeMessages, type InitiativeMessage, type InsertInitiativeMessage,
  initiativeTasks, type InitiativeTask, type InsertInitiativeTask,
  activityFeed, type ActivityFeedItem, type InsertActivityFeed,
  membershipRequests, type MembershipRequest, type InsertMembershipRequest,
  notifications, type Notification, type InsertNotification,
  // Course tables
  courses, type Course, type InsertCourse,
  courseLessons, type CourseLesson, type InsertCourseLesson,
  courseQuizzes, type CourseQuiz, type InsertCourseQuiz,
  quizQuestions, type QuizQuestion, type InsertQuizQuestion,
  userCourseProgress, type UserCourseProgress, type InsertUserCourseProgress,
  userLessonProgress, type UserLessonProgress, type InsertUserLessonProgress,
  quizAttempts, type QuizAttempt, type InsertQuizAttempt,
  quizAttemptAnswers, type QuizAttemptAnswer, type InsertQuizAttemptAnswer,
  courseCertificates, type CourseCertificate, type InsertCourseCertificate,
  userProfiles, type UserProfile, type InsertUserProfile
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql, asc, gte, or, like, inArray, ilike, isNotNull } from "drizzle-orm";
import { PasswordManager, type AuthUser } from './auth';
import path from 'path';
import { fileURLToPath } from 'url';
import { applyBlogContentEnhancements, applyEnhancementsToList } from "./blogContentEnhancements";

const ACTION_POINTS: Record<string, number> = {
  'page_view': 1,
  'commitment': 100,
  'share': 50,
  'community_post': 75,
  'challenge_complete': 200,
  'badge_earned': 150,
  'level_up': 300,
  'lesson_complete': 50,
  'course_complete': 500,
  'quiz_passed': 200,
  'certificate_earned': 300
} as const;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  createUserWithHash(userData: Omit<InsertUser, 'password'> & { password: string }): Promise<User>;
  verifyUserPassword(username: string, password: string): Promise<User | null>;
  updateLastLogin(userId: number): Promise<void>;
  incrementLoginAttempts(username: string): Promise<void>;
  resetLoginAttempts(username: string): Promise<void>;
  isUserLocked(username: string): Promise<boolean>;
  updateUser(userId: number, updates: Partial<InsertUser>): Promise<User>;
  
  // Email verification
  setEmailVerificationToken(userId: number, token: string, expires: Date): Promise<void>;
  verifyEmail(token: string): Promise<User | null>;
  
  // Password reset
  setPasswordResetToken(userId: number, token: string, expires: Date): Promise<void>;
  getUserByPasswordResetToken(token: string): Promise<User | null>;
  updatePassword(userId: number, newPassword: string): Promise<void>;
  
  // 2FA
  enable2FA(userId: number, secret: string, backupCodes: string[]): Promise<void>;
  disable2FA(userId: number): Promise<void>;
  get2FASecret(userId: number): Promise<string | null>;
  useBackupCode(userId: number, codeIndex: number): Promise<void>;
  
  // Dreams
  getDreams(): Promise<Dream[]>;
  getDreamsByUser(userId: number): Promise<Dream[]>;
  createDream(dream: InsertDream): Promise<Dream>;
  
  // Community Posts
  getCommunityPosts(type?: string): Promise<CommunityPost[]>;
  getCommunityPostById(id: number): Promise<CommunityPost | undefined>;
  createCommunityPost(post: InsertCommunityPost): Promise<CommunityPost>;
  updateCommunityPost(id: number, updates: Partial<InsertCommunityPost>, userId: number): Promise<CommunityPost | undefined>;
  deleteCommunityPost(id: number, userId: number): Promise<boolean>;
  getCommunityPostWithDetails(id: number): Promise<CommunityPost | undefined>;
  getUserCommunityPosts(userId: number): Promise<CommunityPost[]>;
  
  // Community Interactions
  createPostInteraction(data: InsertCommunityPostInteraction): Promise<CommunityPostInteraction>;
  getPostInteractions(postId: number, ownerId?: number): Promise<CommunityPostInteraction[]>;
  updateInteractionStatus(id: number, status: string, userId: number): Promise<boolean>;
  getUserInteractions(userId: number): Promise<CommunityPostInteraction[]>;
  
  // Community Messages
  createCommunityMessage(data: InsertCommunityMessage): Promise<CommunityMessage>;
  getUserMessages(userId: number): Promise<CommunityMessage[]>;
  markMessageAsRead(id: number, userId: number): Promise<boolean>;
  getUnreadMessageCount(userId: number): Promise<number>;
  
  // Community Activity
  recordPostActivity(data: InsertCommunityPostActivity): Promise<CommunityPostActivity>;
  getPostAnalytics(postId: number, ownerId: number): Promise<any>;
  getUserActivityHistory(userId: number): Promise<CommunityPostActivity[]>;
  
  // Geographic locations
  getProvinces(): Promise<GeographicLocation[]>;
  getCitiesByProvince(provinceId: number): Promise<GeographicLocation[]>;
  getLocationByName(name: string, type?: string): Promise<GeographicLocation | undefined>;
  createLocation(location: InsertGeographicLocation): Promise<GeographicLocation>;
  
  // Community post likes and views
  likePost(postId: number, userId: number): Promise<CommunityPostLike>;
  unlikePost(postId: number, userId: number): Promise<boolean>;
  isPostLikedByUser(postId: number, userId: number): Promise<boolean>;
  getCommunityPostLikes(postId: number): Promise<CommunityPostLike[]>;
  getCommunityPostLikesCount(postId: number): Promise<number>;
  
  recordCommunityPostView(postId: number, userId: number | null, ipAddress?: string, userAgent?: string): Promise<CommunityPostView>;
  getCommunityPostViews(postId: number): Promise<CommunityPostView[]>;
  getCommunityPostViewsCount(postId: number): Promise<number>;
  
  // Geographic search
  searchPostsByLocation(province?: string, city?: string, radiusKm?: number, userLat?: number, userLng?: number): Promise<CommunityPost[]>;
  
  // Resources
  getResources(): Promise<Resource[]>;
  getResourcesByCategory(category: string): Promise<Resource[]>;
  createResource(resource: InsertResource): Promise<Resource>;

  // Inspiring Stories
  getInspiringStories(filters?: {
    category?: string;
    status?: string;
    featured?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<InspiringStory[]>;
  getInspiringStory(id: number): Promise<InspiringStory | undefined>;
  createInspiringStory(story: InsertInspiringStory): Promise<InspiringStory>;
  updateInspiringStory(id: number, updates: Partial<InsertInspiringStory>): Promise<InspiringStory>;
  deleteInspiringStory(id: number): Promise<void>;
  getFeaturedStories(limit?: number): Promise<InspiringStory[]>;
  getStoriesByCategory(category: string, limit?: number): Promise<InspiringStory[]>;
  incrementStoryViews(id: number): Promise<void>;
  incrementStoryLikes(id: number): Promise<void>;
  incrementStoryShares(id: number): Promise<void>;
  moderateStory(id: number, status: string, moderatorId: number, notes?: string): Promise<InspiringStory>;

  // Gamification ¡BASTA!
  saveCommitment(
    userId: number,
    commitmentText: string,
    commitmentType: string,
    location?: {
      latitude?: number | null;
      longitude?: number | null;
      province?: string | null;
      city?: string | null;
    }
  ): Promise<any>;
  getRecentCommitments(limit: number): Promise<any[]>;
  getCommitmentStats(): Promise<{
    total: number;
    last24h: number;
    byType: { type: string; total: number }[];
  }>;
  resolveLocationFromCoordinates(latitude: number, longitude: number): Promise<{
    province: string | null;
    city: string | null;
  }>;
  getUserBadges(userId: number): Promise<any[]>;
  getLeaderboard(type: string, limit: number): Promise<any[]>;
  recordAction(userId: number, actionType: string, metadata?: any): Promise<any>;
  getUserProgress(userId: number): Promise<any>;
  awardBadge(userId: number, badgeId: number): Promise<any>;
  getAllBadges(): Promise<any[]>;
  
  // Stories
  getStories(): Promise<History[]>;
  getStoryById(id: number): Promise<History | undefined>;
  createStory(story: InsertStory): Promise<History>;
  
  // Blog Posts
  getBlogPosts(filters?: {
    type?: string;
    category?: string;
    tag?: string;
    search?: string;
    featured?: boolean;
    page?: number;
    limit?: number;
  }): Promise<BlogPost[]>;
  getBlogPostStats(): Promise<{ total: number; blog: number; vlog: number }>;
  getBlogPost(slug: string): Promise<BlogPost | undefined>;
  createBlogPost(post: InsertBlogPost): Promise<BlogPost>;
  updateBlogPost(id: number, post: InsertBlogPost, userId: number): Promise<BlogPost | undefined>;
  deleteBlogPost(id: number, userId: number): Promise<boolean>;
  
  // Post Interactions
  togglePostLike(postId: number, userId: number): Promise<{ liked: boolean; count: number }>;
  getPostLikes(postId: number): Promise<{ count: number; users: User[] }>;
  createPostComment(postId: number, userId: number, content: string, parentId?: number): Promise<PostComment>;
  getPostComments(postId: number): Promise<PostComment[]>;
  updatePostComment(id: number, content: string, userId: number): Promise<PostComment | undefined>;
  deletePostComment(id: number, userId: number): Promise<boolean>;
  togglePostBookmark(postId: number, userId: number): Promise<{ bookmarked: boolean }>;
  getUserBookmarks(userId: number): Promise<BlogPost[]>;
  recordPostView(postId: number, userId?: number, sessionId?: string): Promise<void>;
  
  // Search & Recommendations
  searchPosts(query: string, filters?: {
    type?: string;
    category?: string;
    page?: number;
    limit?: number;
  }): Promise<BlogPost[]>;
  getTrendingPosts(days?: number, limit?: number): Promise<BlogPost[]>;
  getRelatedPosts(postId: number, limit?: number): Promise<BlogPost[]>;
  getPopularTags(limit?: number): Promise<{ tag: string; count: number }[]>;

  // ==================== NEW INITIATIVE FEATURES METHODS ====================
  
  // Initiative Members
  getInitiativeMembers(postId: number): Promise<InitiativeMember[]>;
  addInitiativeMember(postId: number, userId: number, role: string): Promise<InitiativeMember>;
  updateMemberRole(memberId: number, role: string, permissions: object): Promise<void>;
  removeMember(memberId: number): Promise<void>;
  
  // Membership Requests
  createMembershipRequest(postId: number, userId: number, message: string): Promise<MembershipRequest>;
  getMembershipRequests(postId: number, status?: string): Promise<MembershipRequest[]>;
  approveMembershipRequest(requestId: number, reviewerId: number): Promise<void>;
  rejectMembershipRequest(requestId: number, reviewerId: number): Promise<void>;
  
  // Milestones
  getInitiativeMilestones(postId: number): Promise<InitiativeMilestone[]>;
  createMilestone(postId: number, data: InsertInitiativeMilestone): Promise<InitiativeMilestone>;
  updateMilestone(milestoneId: number, updates: Partial<InsertInitiativeMilestone>): Promise<void>;
  completeMilestone(milestoneId: number, userId: number): Promise<void>;
  
  // Tasks
  getInitiativeTasks(postId: number): Promise<InitiativeTask[]>;
  createTask(postId: number, data: InsertInitiativeTask): Promise<InitiativeTask>;
  updateTask(taskId: number, updates: Partial<InsertInitiativeTask>): Promise<void>;
  assignTask(taskId: number, userId: number): Promise<void>;
  completeTask(taskId: number): Promise<void>;
  
  // Messages/Chat
  getInitiativeMessages(postId: number, limit?: number, offset?: number): Promise<InitiativeMessage[]>;
  sendMessage(postId: number, userId: number, content: string, type?: string): Promise<InitiativeMessage>;
  
  // Activity Feed
  getActivityFeed(filters?: { type?: string, limit?: number, offset?: number }): Promise<ActivityFeedItem[]>;
  createActivityFeedItem(data: InsertActivityFeed): Promise<ActivityFeedItem>;
  
  // Notifications
  getUserNotifications(userId: number, unreadOnly?: boolean): Promise<Notification[]>;
  markNotificationAsRead(notificationId: number): Promise<void>;
  markAllNotificationsAsRead(userId: number): Promise<void>;
  createNotification(userId: number, data: InsertNotification): Promise<Notification>;
  
  // ==================== COURSE METHODS ====================
  
  // Courses
  getCourses(filters?: {
    category?: string;
    level?: string;
    search?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    featured?: boolean;
  }): Promise<{ courses: Course[]; total: number; page: number; limit: number }>;
  getCourseBySlug(slug: string): Promise<Course | undefined>;
  getCourseWithLessons(courseId: number): Promise<{ course: Course; lessons: CourseLesson[] } | undefined>;
  getCourseQuiz(courseId: number): Promise<{ quiz: CourseQuiz; questions: QuizQuestion[] } | undefined>;
  
  // Course Progress
  getUserCourseProgress(userId: number, courseId: number): Promise<UserCourseProgress | undefined>;
  startCourse(userId: number, courseId: number): Promise<UserCourseProgress>;
  completeLesson(userId: number, lessonId: number): Promise<{ progress: UserCourseProgress; courseCompleted: boolean; xpAwarded: { lesson: number; course: number } }>;
  updateLessonTimeSpent(userId: number, lessonId: number, seconds: number): Promise<void>;
  getUserLessonProgress(userId: number, lessonId: number): Promise<UserLessonProgress | undefined>;
  
  // Quiz
  createQuizAttempt(userId: number, quizId: number, courseId: number): Promise<QuizAttempt>;
  submitQuizAttempt(attemptId: number, answers: Array<{ questionId: number; answer: any }>): Promise<{ score: number; passed: boolean; answers: QuizAttemptAnswer[]; certificateCode?: string; xpAwarded: { quiz: number; certificate: number } }>;
  getQuizAttempt(attemptId: number): Promise<QuizAttempt | undefined>;
  getUserQuizAttempts(userId: number, quizId: number): Promise<QuizAttempt[]>;
  
  // Certificates
  generateCertificate(userId: number, courseId: number, quizScore: number): Promise<{ certificate: CourseCertificate; created: boolean }>;
  getUserCertificates(userId: number): Promise<CourseCertificate[]>;
  getUserCourses(userId: number): Promise<Array<{ course: Course; progress: UserCourseProgress }>>;
}

export class MemStorage implements Partial<IStorage> {
  private users: Map<number, User>;
  private dreams: Map<number, Dream>;
  private communityPosts: Map<number, CommunityPost>;
  private communityPostInteractions: Map<number, CommunityPostInteraction>;
  private communityMessages: Map<number, CommunityMessage>;
  private communityPostActivity: Map<number, CommunityPostActivity>;
  private geographicLocations: Map<number, GeographicLocation>;
  private communityPostLikes: Map<number, CommunityPostLike>;
  private communityPostViews: Map<number, CommunityPostView>;
  private resources: Map<number, Resource>;
  private inspiringStories: Map<number, InspiringStory>;
  private stories: Map<number, History>;
  
  currentUserId: number;
  currentDreamId: number;
  currentPostId: number;
  currentInteractionId: number;
  currentMessageId: number;
  currentActivityId: number;
  currentResourceId: number;
  currentLocationId: number;
  currentLikeId: number;
  currentViewId: number;
  currentInspiringStoryId: number;
  currentStoryId: number;

  constructor() {
    this.users = new Map();
    this.dreams = new Map();
    this.communityPosts = new Map();
    this.communityPostInteractions = new Map();
    this.communityMessages = new Map();
    this.communityPostActivity = new Map();
    this.geographicLocations = new Map();
    this.communityPostLikes = new Map();
    this.communityPostViews = new Map();
    this.resources = new Map();
    this.inspiringStories = new Map();
    this.stories = new Map();
    
    this.currentUserId = 1;
    this.currentDreamId = 1;
    this.currentPostId = 1;
    this.currentInteractionId = 1;
    this.currentMessageId = 1;
    this.currentActivityId = 1;
    this.currentResourceId = 1;
    this.currentStoryId = 1;
    this.currentLocationId = 1;
    this.currentLikeId = 1;
    this.currentViewId = 1;
    this.currentInspiringStoryId = 1;
    
    // Add sample resources
    this.addSampleResources();
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const createdAt = new Date().toISOString();
    const user: User = { 
      ...insertUser,
      id,
      username: insertUser.username,
      password: insertUser.password,
      updatedAt: null,
      lastLogin: null,
      loginAttempts: null,
      isVerified: false,
      verificationToken: null,
      resetPasswordToken: null,
      resetPasswordExpires: null,
      profileImage: null,
      bio: null,
      twoFactorEnabled: false,
      twoFactorSecret: null,
      twoFactorBackupCodes: null,
      email: insertUser.email,
      name: insertUser.name,
      location: insertUser.location ?? null,
      createdAt
    };
    this.users.set(id, user);
    return user;
  }
  
  // Dreams methods
  async getDreams(): Promise<Dream[]> {
    return Array.from(this.dreams.values());
  }
  
  async getDreamsByUser(userId: number): Promise<Dream[]> {
    return Array.from(this.dreams.values()).filter(
      (dream) => dream.userId === userId
    );
  }
  
  async createDream(insertDream: InsertDream): Promise<Dream> {
    const id = this.currentDreamId++;
    const createdAt = new Date().toISOString();
    const dream: Dream = { 
      ...insertDream, 
      id, 
      createdAt,
      type: (insertDream.type as 'dream' | 'value' | 'need' | 'basta') || 'dream',
      dream: insertDream.dream || null,
      value: insertDream.value || null,
      need: insertDream.need || null,
      basta: insertDream.basta || null,
      location: insertDream.location || null,
      userId: insertDream.userId || null,
      latitude: insertDream.latitude || null,
      longitude: insertDream.longitude || null
    };
    this.dreams.set(id, dream);
    return dream;
  }
  
  // Community Posts methods
  async getCommunityPosts(type?: string): Promise<CommunityPost[]> {
    const posts = Array.from(this.communityPosts.values());
    if (type && type !== 'all') {
      return posts.filter(post => post.type === type);
    }
    return posts;
  }
  
  async getCommunityPostById(id: number): Promise<CommunityPost | undefined> {
    return this.communityPosts.get(id);
  }
  
  async createCommunityPost(insertPost: InsertCommunityPost): Promise<CommunityPost> {
    const id = this.currentPostId++;
    const createdAt = new Date().toISOString();
    const post: CommunityPost = { 
      ...insertPost, 
      id, 
      createdAt,
      userId: insertPost.userId || null,
      participants: insertPost.participants || null,
      status: 'active' as const,
      views: 0,
      expiresAt: null,
      contactEmail: null,
      contactPhone: null,
      updatedAt: createdAt
    };
    this.communityPosts.set(id, post);
    return post;
  }

  async updateCommunityPost(id: number, updates: Partial<InsertCommunityPost>, userId: number): Promise<CommunityPost | undefined> {
    const post = this.communityPosts.get(id);
    if (!post || post.userId !== userId) {
      return undefined;
    }
    
    const updatedPost: CommunityPost = {
      ...post,
      ...updates,
      updatedAt: new Date().toISOString(),
      status: updates.status as 'active' | 'paused' | 'closed' || post.status
    };
    this.communityPosts.set(id, updatedPost);
    return updatedPost;
  }

  async deleteCommunityPost(id: number, userId: number): Promise<boolean> {
    const post = this.communityPosts.get(id);
    if (!post || post.userId !== userId) {
      return false;
    }
    
    this.communityPosts.delete(id);
    return true;
  }

  async getCommunityPostWithDetails(id: number): Promise<CommunityPost | undefined> {
    return this.communityPosts.get(id);
  }

  async getUserCommunityPosts(userId: number): Promise<CommunityPost[]> {
    return Array.from(this.communityPosts.values())
      .filter(post => post.userId === userId)
      .sort((a, b) => (b.createdAt ? new Date(b.createdAt).getTime() : 0) - (a.createdAt ? new Date(a.createdAt).getTime() : 0));
  }

  // Community Interactions
  async createPostInteraction(data: InsertCommunityPostInteraction): Promise<CommunityPostInteraction> {
    const id = this.currentInteractionId++;
    const createdAt = new Date().toISOString();
    const interaction: CommunityPostInteraction = {
      id,
      createdAt,
      updatedAt: createdAt,
      postId: data.postId || null,
      userId: data.userId || null,
      type: data.type as 'apply' | 'interest' | 'volunteer' | 'save',
      status: 'pending' as const,
      message: data.message || null
    };
    this.communityPostInteractions.set(id, interaction);
    return interaction;
  }

  async getPostInteractions(postId: number, ownerId?: number): Promise<CommunityPostInteraction[]> {
    return Array.from(this.communityPostInteractions.values())
      .filter(interaction => interaction.postId === postId)
      .sort((a, b) => (b.createdAt ? new Date(b.createdAt).getTime() : 0) - (a.createdAt ? new Date(a.createdAt).getTime() : 0));
  }

  async updateInteractionStatus(id: number, status: string, userId: number): Promise<boolean> {
    const interaction = this.communityPostInteractions.get(id);
    if (!interaction || interaction.userId !== userId) {
      return false;
    }
    
    const updatedInteraction: CommunityPostInteraction = {
      ...interaction,
      status: status as any,
      updatedAt: new Date().toISOString()
    };
    this.communityPostInteractions.set(id, updatedInteraction);
    return true;
  }

  async getUserInteractions(userId: number): Promise<CommunityPostInteraction[]> {
    return Array.from(this.communityPostInteractions.values())
      .filter(interaction => interaction.userId === userId)
      .sort((a, b) => (b.createdAt ? new Date(b.createdAt).getTime() : 0) - (a.createdAt ? new Date(a.createdAt).getTime() : 0));
  }

  // Community Messages
  async createCommunityMessage(data: InsertCommunityMessage): Promise<CommunityMessage> {
    const id = this.currentMessageId++;
    const createdAt = new Date().toISOString();
    const message: CommunityMessage = {
      id,
      createdAt,
      postId: data.postId || null,
      senderId: data.senderId || null,
      receiverId: data.receiverId || null,
      subject: data.subject,
      content: data.content,
      read: false
    };
    this.communityMessages.set(id, message);
    return message;
  }

  async getUserMessages(userId: number): Promise<CommunityMessage[]> {
    return Array.from(this.communityMessages.values())
      .filter(message => message.receiverId === userId)
      .sort((a, b) => (b.createdAt ? new Date(b.createdAt).getTime() : 0) - (a.createdAt ? new Date(a.createdAt).getTime() : 0));
  }

  async markMessageAsRead(id: number, userId: number): Promise<boolean> {
    const message = this.communityMessages.get(id);
    if (!message || message.receiverId !== userId) {
      return false;
    }
    
    const updatedMessage: CommunityMessage = {
      ...message,
      read: true
    };
    this.communityMessages.set(id, updatedMessage);
    return true;
  }

  async getUnreadMessageCount(userId: number): Promise<number> {
    return Array.from(this.communityMessages.values())
      .filter(message => message.receiverId === userId && !message.read).length;
  }

  // Community Activity
  async recordPostActivity(data: InsertCommunityPostActivity): Promise<CommunityPostActivity> {
    const id = this.currentActivityId++;
    const createdAt = new Date().toISOString();
    const activity: CommunityPostActivity = {
      id,
      createdAt,
      postId: data.postId || null,
      userId: data.userId || null,
      activityType: data.activityType as 'view' | 'share' | 'click_contact' | 'apply' | 'interest' | 'save',
      metadata: data.metadata || null
    };
    this.communityPostActivity.set(id, activity);
    return activity;
  }

  async getPostAnalytics(postId: number, ownerId: number): Promise<any> {
    const post = this.communityPosts.get(postId);
    if (!post || post.userId !== ownerId) {
      return null;
    }

    const activities = Array.from(this.communityPostActivity.values())
      .filter(activity => activity.postId === postId);

    const interactions = Array.from(this.communityPostInteractions.values())
      .filter(interaction => interaction.postId === postId);

    return {
      post,
      totalViews: activities.filter(a => a.activityType === 'view').length,
      totalInteractions: interactions.length,
      interactionBreakdown: {
        apply: interactions.filter(i => i.type === 'apply').length,
        interest: interactions.filter(i => i.type === 'interest').length,
        volunteer: interactions.filter(i => i.type === 'volunteer').length,
        save: interactions.filter(i => i.type === 'save').length,
      },
      activities: activities.slice(0, 10),
      interactions: interactions.slice(0, 10),
    };
  }

  async getUserActivityHistory(userId: number): Promise<CommunityPostActivity[]> {
    return Array.from(this.communityPostActivity.values())
      .filter(activity => activity.userId === userId)
      .sort((a, b) => (b.createdAt ? new Date(b.createdAt).getTime() : 0) - (a.createdAt ? new Date(a.createdAt).getTime() : 0));
  }

  // Geographic locations
  async getProvinces(): Promise<GeographicLocation[]> {
    return Array.from(this.geographicLocations.values())
      .filter(location => location.type === 'province');
  }

  async getCitiesByProvince(provinceId: number): Promise<GeographicLocation[]> {
    return Array.from(this.geographicLocations.values())
      .filter(location => location.type === 'city' && location.parentId === provinceId);
  }

  async getLocationByName(name: string, type?: string): Promise<GeographicLocation | undefined> {
    return Array.from(this.geographicLocations.values())
      .find(location => location.name === name && (!type || location.type === type));
  }

  async createLocation(location: InsertGeographicLocation): Promise<GeographicLocation> {
    const id = this.currentLocationId++;
    const createdAt = new Date().toISOString();
    const newLocation: GeographicLocation = {
      id,
      createdAt,
      name: location.name,
      type: location.type as 'province' | 'city' | 'neighborhood',
      parentId: location.parentId || null,
      latitude: location.latitude || null,
      longitude: location.longitude || null,
      postalCode: location.postalCode || null,
      country: location.country || 'Argentina'
    };
    this.geographicLocations.set(id, newLocation);
    return newLocation;
  }

  // Post likes and views
  async likePost(postId: number, userId: number): Promise<CommunityPostLike> {
    const id = this.currentLikeId++;
    const createdAt = new Date().toISOString();
    const like: CommunityPostLike = {
      id,
      postId,
      userId,
      createdAt
    };
    this.communityPostLikes.set(id, like);
    return like;
  }

  async unlikePost(postId: number, userId: number): Promise<boolean> {
    const like = Array.from(this.communityPostLikes.values())
      .find(l => l.postId === postId && l.userId === userId);
    
    if (like) {
      this.communityPostLikes.delete(like.id);
      return true;
    }
    return false;
  }

  async isPostLikedByUser(postId: number, userId: number): Promise<boolean> {
    return Array.from(this.communityPostLikes.values())
      .some(like => like.postId === postId && like.userId === userId);
  }

  async getCommunityPostLikes(postId: number): Promise<CommunityPostLike[]> {
    return Array.from(this.communityPostLikes.values())
      .filter(like => like.postId === postId);
  }

  async getCommunityPostLikesCount(postId: number): Promise<number> {
    return Array.from(this.communityPostLikes.values())
      .filter(like => like.postId === postId).length;
  }

  async recordCommunityPostView(postId: number, userId: number | null, ipAddress?: string, userAgent?: string): Promise<CommunityPostView> {
    const id = this.currentViewId++;
    const viewedAt = new Date().toISOString();
    const view: CommunityPostView = {
      id,
      postId,
      userId: userId || null,
      ipAddress: ipAddress || null,
      userAgent: userAgent || null,
      viewedAt
    };
    this.communityPostViews.set(id, view);
    return view;
  }

  async getCommunityPostViews(postId: number): Promise<CommunityPostView[]> {
    return Array.from(this.communityPostViews.values())
      .filter(view => view.postId === postId);
  }

  async getCommunityPostViewsCount(postId: number): Promise<number> {
    return Array.from(this.communityPostViews.values())
      .filter(view => view.postId === postId).length;
  }

  // Geographic search
  async searchPostsByLocation(province?: string, city?: string, radiusKm?: number, userLat?: number, userLng?: number): Promise<CommunityPost[]> {
    let posts = Array.from(this.communityPosts.values());

    // Filter by province
    if (province) {
      posts = posts.filter(post => post.province === province);
    }

    // Filter by city
    if (city) {
      posts = posts.filter(post => post.city === city);
    }

    // Filter by radius (simple implementation)
    if (radiusKm && userLat && userLng) {
      posts = posts.filter(post => {
        if (!post.latitude || !post.longitude) return false;
        
        const distance = this.calculateDistance(userLat, userLng, post.latitude, post.longitude);
        return distance <= radiusKm;
      });
    }

    return posts;
  }

  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.deg2rad(lat2 - lat1);
    const dLng = this.deg2rad(lng2 - lng1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI/180);
  }
  
  // Resources methods
  async getResources(): Promise<Resource[]> {
    return Array.from(this.resources.values());
  }
  
  async getResourcesByCategory(category: string): Promise<Resource[]> {
    return Array.from(this.resources.values()).filter(
      (resource) => resource.category === category
    );
  }
  
  async createResource(insertResource: InsertResource): Promise<Resource> {
    const id = this.currentResourceId++;
    const createdAt = new Date().toISOString();
    const resource: Resource = { 
      ...insertResource, 
      id, 
      createdAt,
      url: insertResource.url || null
    };
    this.resources.set(id, resource);
    return resource;
  }
  
  // Stories methods
  async getStories(): Promise<History[]> {
    return Array.from(this.stories.values());
  }
  
  async getStoryById(id: number): Promise<History | undefined> {
    return this.stories.get(id);
  }
  
  async createStory(insertStory: InsertStory): Promise<History> {
    const id = this.currentStoryId++;
    const createdAt = new Date().toISOString();
    const story: History = { 
      ...insertStory, 
      id, 
      createdAt,
      imageUrl: insertStory.imageUrl || null
    };
    this.stories.set(id, story);
    return story;
  }
  
  // Initialize sample resources
  private addSampleResources() {
    const resources: InsertResource[] = [
      {
        title: "Pensamiento sistémico",
        description: "Comprende cómo las partes de un sistema se relacionan e influyen entre sí para crear soluciones integrales.",
        category: "systemic-thinking",
        url: "/resources/systemic-thinking",
      },
      {
        title: "Cambio de hábitos",
        description: "Metodologías prácticas para transformar comportamientos individuales y colectivos de forma sostenible.",
        category: "habit-change",
        url: "/resources/habit-change",
      },
      {
        title: "Proyectos ciudadanos",
        description: "Guías paso a paso para diseñar, implementar y evaluar iniciativas con impacto comunitario positivo.",
        category: "citizen-projects",
        url: "/resources/citizen-projects",
      },
      {
        title: "Diseño idealizado",
        description: "Una metodología para reimaginar sistemas desde cero en vez de reformar lo que ya no funciona.",
        category: "idealized-design",
        url: "/resources/idealized-design",
      },
      {
        title: "Comunicación efectiva",
        description: "Herramientas para dialogar, construir consensos y resolver conflictos en espacios de participación.",
        category: "effective-communication",
        url: "/resources/effective-communication",
      },
      {
        title: "Biblioteca digital",
        description: "Colección de libros, artículos y documentos sobre transformación social, participación ciudadana y desarrollo comunitario.",
        category: "digital-library",
        url: "/resources/digital-library",
      }
    ];
    
    resources.forEach(resource => {
      this.createResource(resource);
    });
  }

  // Inspiring Stories methods
  async getInspiringStories(filters?: {
    category?: string;
    status?: string;
    featured?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<InspiringStory[]> {
    let stories = Array.from(this.inspiringStories.values());
    
    if (filters) {
      if (filters.category) {
        stories = stories.filter(story => story.category === filters.category);
      }
      if (filters.status) {
        stories = stories.filter(story => story.status === filters.status);
      }
      if (filters.featured !== undefined) {
        stories = stories.filter(story => story.featured === filters.featured);
      }
    }
    
    // Sort by published date descending
    stories.sort((a, b) => {
      const dateA = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
      const dateB = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
      return dateB - dateA;
    });
    
    if (filters?.offset) {
      stories = stories.slice(filters.offset);
    }
    if (filters?.limit) {
      stories = stories.slice(0, filters.limit);
    }
    
    return stories;
  }

  async getInspiringStory(id: number): Promise<InspiringStory | undefined> {
    return this.inspiringStories.get(id);
  }

  async createInspiringStory(story: InsertInspiringStory): Promise<InspiringStory> {
    const id = this.currentInspiringStoryId++;
    const newStory: InspiringStory = {
      ...story,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.inspiringStories.set(id, newStory);
    return newStory;
  }

  async updateInspiringStory(id: number, updates: Partial<InsertInspiringStory>): Promise<InspiringStory> {
    const existing = this.inspiringStories.get(id);
    if (!existing) {
      throw new Error(`Story with id ${id} not found`);
    }
    const updated = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.inspiringStories.set(id, updated);
    return updated;
  }

  async deleteInspiringStory(id: number): Promise<void> {
    this.inspiringStories.delete(id);
  }

  async getFeaturedStories(limit: number = 3): Promise<InspiringStory[]> {
    return this.getInspiringStories({ featured: true, status: 'approved', limit });
  }

  async getStoriesByCategory(category: string, limit: number = 5): Promise<InspiringStory[]> {
    return this.getInspiringStories({ category, status: 'approved', limit });
  }

  async incrementStoryViews(id: number): Promise<void> {
    const story = this.inspiringStories.get(id);
    if (story) {
      story.views = (story.views || 0) + 1;
      this.inspiringStories.set(id, story);
    }
  }

  async incrementStoryLikes(id: number): Promise<void> {
    const story = this.inspiringStories.get(id);
    if (story) {
      story.likes = (story.likes || 0) + 1;
      this.inspiringStories.set(id, story);
    }
  }

  async incrementStoryShares(id: number): Promise<void> {
    const story = this.inspiringStories.get(id);
    if (story) {
      story.shares = (story.shares || 0) + 1;
      this.inspiringStories.set(id, story);
    }
  }

  async moderateStory(id: number, status: string, moderatorId: number, notes?: string): Promise<InspiringStory> {
    const story = this.inspiringStories.get(id);
    if (!story) {
      throw new Error(`Story with id ${id} not found`);
    }
    const updated = {
      ...story,
      status,
      moderatedBy: moderatorId,
      moderatedAt: new Date().toISOString(),
      moderationNotes: notes,
      updatedAt: new Date().toISOString(),
    };
    this.inspiringStories.set(id, updated);
    return updated;
  }
}

export class DatabaseStorage implements IStorage {
  private userCommitmentsLocationColumnsEnsured = false;

  private async ensureUserCommitmentsLocationColumns(): Promise<void> {
    // Schema is managed by drizzle-kit push for Postgres - no runtime migration needed
    this.userCommitmentsLocationColumnsEnsured = true;
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async createUserWithHash(userData: Omit<InsertUser, 'password'> & { password: string }): Promise<User> {
    const hashedPassword = await PasswordManager.hash(userData.password);
    const insertUser: InsertUser = {
      ...userData,
      password: hashedPassword
    };
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async verifyUserPassword(username: string, password: string): Promise<User | null> {
    const user = await this.getUserByUsername(username);
    if (!user || !user.isActive) {
      return null;
    }

    const storedPassword = user.password || '';
    const isBcryptHash = typeof storedPassword === 'string' && /^\$2[aby]\$\d{2}\$/.test(storedPassword);

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

  async updateLastLogin(userId: number): Promise<void> {
    await db.update(users)
      .set({ 
        lastLogin: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
      .where(eq(users.id, userId));
  }

  async incrementLoginAttempts(username: string): Promise<void> {
    await db.update(users)
      .set({ 
        loginAttempts: sql`login_attempts + 1`,
        lockedUntil: sql`CASE
          WHEN login_attempts + 1 >= 5 THEN (NOW() + INTERVAL '15 minutes')::text
          ELSE locked_until
        END`,
        updatedAt: new Date().toISOString()
      })
      .where(eq(users.username, username));
  }

  async resetLoginAttempts(username: string): Promise<void> {
    await db.update(users)
      .set({ 
        loginAttempts: 0,
        lockedUntil: null,
        updatedAt: new Date().toISOString()
      })
      .where(eq(users.username, username));
  }

  async isUserLocked(username: string): Promise<boolean> {
    const user = await this.getUserByUsername(username);
    if (!user || !user.lockedUntil) {
      return false;
    }
    
    return new Date() < new Date(user.lockedUntil);
  }

  async updateUser(userId: number, updates: Partial<InsertUser>): Promise<User> {
    const [user] = await db.update(users)
      .set({ 
        ...updates,
        updatedAt: new Date().toISOString()
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  // Email verification methods
  async setEmailVerificationToken(userId: number, token: string, expires: Date): Promise<void> {
    await db.update(users)
      .set({
        emailVerificationToken: token,
        emailVerificationExpires: expires.toISOString(),
        updatedAt: new Date().toISOString()
      })
      .where(eq(users.id, userId));
  }

  async verifyEmail(token: string): Promise<User | null> {
    const [user] = await db.select()
      .from(users)
      .where(eq(users.emailVerificationToken, token));
    
    if (!user) return null;
    
    // Check if token is expired
    if (user.emailVerificationExpires && new Date() > new Date(user.emailVerificationExpires)) {
      return null;
    }
    
    // Mark email as verified
    await db.update(users)
      .set({
        emailVerified: true,
        emailVerificationToken: null,
        emailVerificationExpires: null,
        updatedAt: new Date().toISOString()
      })
      .where(eq(users.id, user.id));
    
    return user;
  }

  // Password reset methods
  async setPasswordResetToken(userId: number, token: string, expires: Date): Promise<void> {
    await db.update(users)
      .set({
        passwordResetToken: token,
        passwordResetExpires: expires.toISOString(),
        updatedAt: new Date().toISOString()
      })
      .where(eq(users.id, userId));
  }

  async getUserByPasswordResetToken(token: string): Promise<User | null> {
    const [user] = await db.select()
      .from(users)
      .where(eq(users.passwordResetToken, token));
    
    if (!user) return null;
    
    // Check if token is expired
    if (user.passwordResetExpires && new Date() > new Date(user.passwordResetExpires)) {
      return null;
    }
    
    return user;
  }

  async updatePassword(userId: number, newPassword: string): Promise<void> {
    const { PasswordManager } = await import('./auth');
    const hashedPassword = await PasswordManager.hash(newPassword);
    
    await db.update(users)
      .set({
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetExpires: null,
        updatedAt: new Date().toISOString()
      })
      .where(eq(users.id, userId));
  }

  // 2FA methods
  async enable2FA(userId: number, secret: string, backupCodes: string[]): Promise<void> {
    await db.update(users)
      .set({
        twoFactorEnabled: true,
        twoFactorSecret: secret,
        twoFactorBackupCodes: JSON.stringify(backupCodes),
        updatedAt: new Date().toISOString()
      })
      .where(eq(users.id, userId));
  }

  async disable2FA(userId: number): Promise<void> {
    await db.update(users)
      .set({
        twoFactorEnabled: false,
        twoFactorSecret: null,
        twoFactorBackupCodes: null,
        updatedAt: new Date().toISOString()
      })
      .where(eq(users.id, userId));
  }

  async get2FASecret(userId: number): Promise<string | null> {
    const user = await this.getUser(userId);
    return user?.twoFactorSecret || null;
  }

  async useBackupCode(userId: number, codeIndex: number): Promise<void> {
    const user = await this.getUser(userId);
    if (!user || !user.twoFactorBackupCodes) return;
    
    const backupCodes = JSON.parse(user.twoFactorBackupCodes);
    backupCodes[codeIndex] = null; // Mark as used
    
    await db.update(users)
      .set({
        twoFactorBackupCodes: JSON.stringify(backupCodes),
        updatedAt: new Date().toISOString()
      })
      .where(eq(users.id, userId));
  }
  
  // Dreams methods
  async getDreams(): Promise<Dream[]> {
    return await db.select().from(dreams).orderBy(desc(dreams.createdAt));
  }
  
  async getDreamsByUser(userId: number): Promise<Dream[]> {
    return await db.select().from(dreams).where(eq(dreams.userId, userId));
  }
  
  async createDream(insertDream: InsertDream): Promise<Dream> {
    const dreamData = {
      ...insertDream,
      type: (insertDream.type as 'dream' | 'value' | 'need' | 'basta') || 'dream'
    };
    const [dream] = await db.insert(dreams).values(dreamData).returning();
    return dream;
  }
  
  // Community Posts methods
  async getCommunityPosts(type?: string): Promise<CommunityPost[]> {
    if (type && type !== 'all') {
      return await db.select().from(communityPosts).where(eq(communityPosts.type, type));
    }
    return await db.select().from(communityPosts).orderBy(desc(communityPosts.createdAt));
  }
  
  async getCommunityPostById(id: number): Promise<CommunityPost | undefined> {
    const [post] = await db.select().from(communityPosts).where(eq(communityPosts.id, id));
    return post;
  }
  
  async createCommunityPost(insertPost: InsertCommunityPost): Promise<CommunityPost> {
    const postData = {
      ...insertPost,
      status: 'active' as const,
      views: 0,
      expiresAt: null,
      contactEmail: null,
      contactPhone: null,
      updatedAt: new Date().toISOString()
    };
    const [post] = await db.insert(communityPosts).values(postData).returning();
    return post;
  }

  async updateCommunityPost(id: number, updates: Partial<InsertCommunityPost>, userId: number): Promise<CommunityPost | undefined> {
    const [post] = await db.update(communityPosts)
      .set({ ...updates, updatedAt: new Date().toISOString() })
      .where(and(eq(communityPosts.id, id), eq(communityPosts.userId, userId)))
      .returning();
    return post;
  }

  async deleteCommunityPost(id: number, userId: number): Promise<boolean> {
    const result = await db.delete(communityPosts)
      .where(and(eq(communityPosts.id, id), eq(communityPosts.userId, userId)));
    return result.changes > 0;
  }

  async getCommunityPostWithDetails(id: number): Promise<any | undefined> {
    // First get the post
    const [post] = await db.select().from(communityPosts).where(eq(communityPosts.id, id));
    
    if (!post) {
      return undefined;
    }
    
    // Get user (impulsor) information if userId exists
    let userInfo = null;
    if (post.userId) {
      const [user] = await db.select().from(users).where(eq(users.id, post.userId));
      
      if (user) {
        // Calculate impulsor stats
        // Count initiatives created by this user
        const userInitiativesResult = await db
          .select({ count: sql<number>`count(*)` })
          .from(communityPosts)
          .where(eq(communityPosts.userId, post.userId));
        const initiativesCount = Number(userInitiativesResult[0]?.count || 0);
        
        // Count total members across all user's initiatives
        const userPosts = await db
          .select({ id: communityPosts.id })
          .from(communityPosts)
          .where(eq(communityPosts.userId, post.userId));
        const postIds = userPosts.map(p => p.id);
        
        let totalMembers = 0;
        if (postIds.length > 0) {
          const membersResult = await db
            .select({ count: sql<number>`count(*)` })
            .from(initiativeMembers)
            .where(inArray(initiativeMembers.postId, postIds));
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
            totalMembers: totalMembers
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

  async getUserCommunityPosts(userId: number): Promise<CommunityPost[]> {
    return await db.select().from(communityPosts)
      .where(eq(communityPosts.userId, userId))
      .orderBy(desc(communityPosts.createdAt));
  }

  // Community Interactions
  async createPostInteraction(data: InsertCommunityPostInteraction): Promise<CommunityPostInteraction> {
    const interactionData = {
      ...data,
      status: 'pending' as const,
      updatedAt: new Date().toISOString()
    };
    const [interaction] = await db.insert(communityPostInteractions).values(interactionData).returning();
    return interaction;
  }

  async getPostInteractions(postId: number, ownerId?: number): Promise<CommunityPostInteraction[]> {
    const query = db.select().from(communityPostInteractions)
      .where(eq(communityPostInteractions.postId, postId))
      .orderBy(desc(communityPostInteractions.createdAt));
    
    // If ownerId is provided, we can add additional filtering if needed
    return await query;
  }

  async updateInteractionStatus(id: number, status: string, userId: number): Promise<boolean> {
    const result = await db.update(communityPostInteractions)
      .set({ status: status as 'pending' | 'accepted' | 'rejected' | 'completed', updatedAt: new Date().toISOString() })
      .where(and(eq(communityPostInteractions.id, id), eq(communityPostInteractions.userId, userId)));
    return result.changes > 0;
  }

  async getUserInteractions(userId: number): Promise<CommunityPostInteraction[]> {
    return await db.select().from(communityPostInteractions)
      .where(eq(communityPostInteractions.userId, userId))
      .orderBy(desc(communityPostInteractions.createdAt));
  }

  // Community Messages
  async createCommunityMessage(data: InsertCommunityMessage): Promise<CommunityMessage> {
    const [message] = await db.insert(communityMessages).values(data).returning();
    return message;
  }

  async getUserMessages(userId: number): Promise<CommunityMessage[]> {
    return await db.select().from(communityMessages)
      .where(eq(communityMessages.receiverId, userId))
      .orderBy(desc(communityMessages.createdAt));
  }

  async markMessageAsRead(id: number, userId: number): Promise<boolean> {
    const result = await db.update(communityMessages)
      .set({ read: true })
      .where(and(eq(communityMessages.id, id), eq(communityMessages.receiverId, userId)));
    return result.changes > 0;
  }

  async getUnreadMessageCount(userId: number): Promise<number> {
    const result = await db.select({ count: sql<number>`count(*)` })
      .from(communityMessages)
      .where(and(eq(communityMessages.receiverId, userId), eq(communityMessages.read, false)));
    return result[0]?.count || 0;
  }

  // Community Activity
  async recordPostActivity(data: InsertCommunityPostActivity): Promise<CommunityPostActivity> {
    const activityData = {
      ...data,
      activityType: data.activityType as 'view' | 'share' | 'click_contact' | 'apply' | 'interest' | 'save'
    };
    const [activity] = await db.insert(communityPostActivity).values(activityData).returning();
    return activity;
  }

  async getPostAnalytics(postId: number, ownerId: number): Promise<any> {
    // Verify ownership
    const post = await db.select().from(communityPosts)
      .where(and(eq(communityPosts.id, postId), eq(communityPosts.userId, ownerId)));
    
    if (!post.length) return null;

    // Get activity summary
    const activities = await db.select().from(communityPostActivity)
      .where(eq(communityPostActivity.postId, postId));

    const interactions = await db.select().from(communityPostInteractions)
      .where(eq(communityPostInteractions.postId, postId));

    return {
      post: post[0],
      totalViews: activities.filter(a => a.activityType === 'view').length,
      totalInteractions: interactions.length,
      interactionBreakdown: {
        apply: interactions.filter(i => i.type === 'apply').length,
        interest: interactions.filter(i => i.type === 'interest').length,
        volunteer: interactions.filter(i => i.type === 'volunteer').length,
        save: interactions.filter(i => i.type === 'save').length,
      },
      activities: activities.slice(0, 10), // Recent 10 activities
      interactions: interactions.slice(0, 10), // Recent 10 interactions
    };
  }

  async getUserActivityHistory(userId: number): Promise<CommunityPostActivity[]> {
    return await db.select().from(communityPostActivity)
      .where(eq(communityPostActivity.userId, userId))
      .orderBy(desc(communityPostActivity.createdAt));
  }
  
  // Resources methods
  async getResources(): Promise<Resource[]> {
    return await db.select().from(resources);
  }
  
  async getResourcesByCategory(category: string): Promise<Resource[]> {
    return await db.select().from(resources).where(eq(resources.category, category));
  }
  
  async createResource(insertResource: InsertResource): Promise<Resource> {
    const [resource] = await db.insert(resources).values(insertResource).returning();
    return resource;
  }
  
  // Stories methods
  async getStories(): Promise<Story[]> {
    return await db.select().from(stories);
  }
  
  async getStoryById(id: number): Promise<Story | undefined> {
    const [story] = await db.select().from(stories).where(eq(stories.id, id));
    return story;
  }
  
  async createStory(insertStory: InsertStory): Promise<Story> {
    const [story] = await db.insert(stories).values(insertStory).returning();
    return story;
  }

  // Initialize with sample resources if needed
  async initSampleData() {
    // Check if resources exist
    const existingResources = await this.getResources();
    
    if (existingResources.length === 0) {
      // Add sample resources
      const resources: InsertResource[] = [
        {
          title: "Pensamiento sistémico",
          description: "Comprende cómo las partes de un sistema se relacionan e influyen entre sí para crear soluciones integrales.",
          category: "systemic-thinking",
          url: "/resources/systemic-thinking",
        },
        {
          title: "Cambio de hábitos",
          description: "Metodologías prácticas para transformar comportamientos individuales y colectivos de forma sostenible.",
          category: "habit-change",
          url: "/resources/habit-change",
        },
        {
          title: "Proyectos ciudadanos",
          description: "Guías paso a paso para diseñar, implementar y evaluar iniciativas con impacto comunitario positivo.",
          category: "citizen-projects",
          url: "/resources/citizen-projects",
        },
        {
          title: "Diseño idealizado",
          description: "Una metodología para reimaginar sistemas desde cero en vez de reformar lo que ya no funciona.",
          category: "idealized-design",
          url: "/resources/idealized-design",
        },
        {
          title: "Comunicación efectiva",
          description: "Herramientas para dialogar, construir consensos y resolver conflictos en espacios de participación.",
          category: "effective-communication",
          url: "/resources/effective-communication",
        },
        {
          title: "Biblioteca digital",
          description: "Colección de libros, artículos y documentos sobre transformación social, participación ciudadana y desarrollo comunitario.",
          category: "digital-library",
          url: "/resources/digital-library",
        }
      ];
      
      for (const resource of resources) {
        await this.createResource(resource);
      }
    }
  }

  // ==================== GAMIFICATION METHODS ====================

  // User Levels
  async getUserLevel(userId: number) {
    const level = await db.query.userLevels.findFirst({
      where: eq(userLevels.userId, userId),
      with: {
        user: true
      }
    });
    return level;
  }

  async createUserLevel(userId: number) {
    const [newLevel] = await db.insert(userLevels).values({
      userId,
      currentLevel: 1,
      experience: 0,
      experienceToNext: 500,
      streak: 0
    }).returning();
    return newLevel;
  }

  async updateUserExperience(userId: number, experienceGained: number): Promise<any> {
    const userLevel = await this.getUserLevel(userId);
    if (!userLevel) {
      await this.createUserLevel(userId);
      return await this.updateUserExperience(userId, experienceGained);
    }

    const newExperience = userLevel.experience + experienceGained;
    const newLevel = Math.floor(newExperience / 500) + 1;
    const experienceToNext = newLevel * 500 - newExperience;

    const [updatedLevel] = await db.update(userLevels)
      .set({
        experience: newExperience,
        currentLevel: newLevel,
        experienceToNext,
        updatedAt: new Date().toISOString()
      })
      .where(eq(userLevels.userId, userId))
      .returning();

    return updatedLevel;
  }

  async updateStreak(userId: number): Promise<void> {
    const today = new Date().toISOString().split('T')[0];
    const userLevel = await this.getUserLevel(userId);
    
    if (!userLevel) {
      await this.createUserLevel(userId);
      return await this.updateStreak(userId);
    }

    const lastActivityDate = userLevel.lastActivityDate;
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    let newStreak = userLevel.streak;
    if (lastActivityDate === yesterdayStr) {
      newStreak += 1;
    } else if (lastActivityDate !== today) {
      newStreak = 1; // Reset streak if not consecutive
    }

    const [updatedLevel] = await db.update(userLevels)
      .set({
        streak: newStreak,
        lastActivityDate: today,
        updatedAt: new Date().toISOString()
      })
      .where(eq(userLevels.userId, userId))
      .returning();

    return updatedLevel;
  }

  // Challenges
  async getChallenges(filters?: {
    level?: number;
    frequency?: string;
    category?: string;
    difficulty?: string;
  }) {
    let query = db.query.challenges.findMany({
      with: {
        steps: {
          orderBy: [asc(challengeSteps.orderIndex)]
        }
      },
      orderBy: [asc(challenges.orderIndex)]
    });

    if (filters) {
      const conditions = [];
      if (filters.level) conditions.push(eq(challenges.level, filters.level));
      if (filters.frequency) conditions.push(eq(challenges.frequency, filters.frequency));
      if (filters.category) conditions.push(eq(challenges.category, filters.category));
      if (filters.difficulty) conditions.push(eq(challenges.difficulty, filters.difficulty));
      
      if (conditions.length > 0) {
        query = db.query.challenges.findMany({
          where: and(...conditions),
          with: {
            steps: {
              orderBy: [asc(challengeSteps.orderIndex)]
            }
          },
          orderBy: [asc(challenges.orderIndex)]
        });
      }
    }

    return await query;
  }

  async getChallenge(challengeId: number) {
    return await db.query.challenges.findFirst({
      where: eq(challenges.id, challengeId),
      with: {
        steps: {
          orderBy: [asc(challengeSteps.orderIndex)]
        }
      }
    });
  }

  async getChallengeSteps(challengeId: number) {
    return await db.query.challengeSteps.findMany({
      where: eq(challengeSteps.challengeId, challengeId),
      orderBy: [asc(challengeSteps.orderIndex)]
    });
  }

  // User Challenge Progress
  async getUserChallengeProgress(userId: number) {
    return await db.query.userChallengeProgress.findMany({
      where: eq(userChallengeProgress.userId, userId),
      with: {
        challenge: {
          with: {
            steps: {
              orderBy: [asc(challengeSteps.orderIndex)]
            }
          }
        }
      }
    });
  }

  async startChallenge(userId: number, challengeId: number) {
    const [progress] = await db.insert(userChallengeProgress).values({
      userId,
      challengeId,
      status: 'in_progress',
      currentStep: 0,
      startedAt: new Date().toISOString(),
      lastActivityAt: new Date().toISOString()
    }).returning();

    return progress;
  }

  async updateChallengeProgress(userId: number, challengeId: number, currentStep: number, completedSteps: number[]) {
    const [progress] = await db.update(userChallengeProgress)
      .set({
        currentStep,
        completedSteps: JSON.stringify(completedSteps),
        lastActivityAt: new Date().toISOString()
      })
      .where(
        and(
          eq(userChallengeProgress.userId, userId),
          eq(userChallengeProgress.challengeId, challengeId)
        )
      )
      .returning();

    return progress;
  }

  async completeChallenge(userId: number, challengeId: number) {
    const [progress] = await db.update(userChallengeProgress)
      .set({
        status: 'completed',
        completedAt: new Date().toISOString(),
        lastActivityAt: new Date().toISOString()
      })
      .where(
        and(
          eq(userChallengeProgress.userId, userId),
          eq(userChallengeProgress.challengeId, challengeId)
        )
      )
      .returning();

    // Award experience
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
      orderBy: [asc(badges.orderIndex)]
    });
  }

  async getUserBadges(userId: number) {
    return await db.query.userBadges.findMany({
      where: eq(userBadges.userId, userId),
      with: {
        badge: true
      }
    });
  }

  async awardBadge(userId: number, badgeId: number) {
    // Check if user already has this badge
    const existingBadge = await db.query.userBadges.findFirst({
      where: and(
        eq(userBadges.userId, userId),
        eq(userBadges.badgeId, badgeId)
      )
    });

    if (existingBadge) {
      return existingBadge; // Already has this badge
    }

    const [userBadge] = await db.insert(userBadges).values({
      userId,
      badgeId,
      earnedAt: new Date().toISOString()
    }).returning();

    // Award experience if badge has experience reward
    const badge = await db.query.badges.findFirst({
      where: eq(badges.id, badgeId)
    });

    if (badge && badge.experienceReward > 0) {
      await this.updateUserExperience(userId, badge.experienceReward);
    }

    return userBadge;
  }

  async checkBadgeRequirements(userId: number) {
    const userLevel = await this.getUserLevel(userId);
    const userProgress = await this.getUserChallengeProgress(userId);
    const userBadges = await this.getUserBadges(userId);

    if (!userLevel) return [];

    const completedChallenges = userProgress.filter(p => p.status === 'completed').length;
    const earnedBadgeIds = userBadges.map(ub => ub.badgeId);

    const allBadges = await this.getBadges();
    const newBadges = [];

    for (const badge of allBadges) {
      if (earnedBadgeIds.includes(badge.id)) continue;

      let shouldAward = false;
      const requirementData = JSON.parse(badge.requirementData || '{}');

      switch (badge.category) {
        case 'level':
          if (requirementData.level && userLevel.currentLevel >= requirementData.level) {
            shouldAward = true;
          }
          break;
        case 'challenge':
          if (requirementData.challengesCompleted && completedChallenges >= requirementData.challengesCompleted) {
            shouldAward = true;
          }
          break;
        case 'streak':
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
  async getUserStats(userId: number) {
    const userLevel = await this.getUserLevel(userId);
    const userProgress = await this.getUserChallengeProgress(userId);
    const userBadges = await this.getUserBadges(userId);

    const completedChallenges = userProgress.filter(p => p.status === 'completed').length;
    const totalChallenges = userProgress.length;

    return {
      level: userLevel?.currentLevel || 1,
      experience: userLevel?.experience || 0,
      experienceToNext: userLevel?.experienceToNext || 500,
      streak: userLevel?.streak || 0,
      completedChallenges,
      totalChallenges,
      badgesEarned: userBadges.length,
      lastActivity: userLevel?.lastActivityDate
    };
  }

  async recordDailyActivity(userId: number, experienceGained: number, challengesCompleted: number, actionsCompleted: number) {
    const today = new Date().toISOString().split('T')[0];
    
    const existingActivity = await db.query.userDailyActivity.findFirst({
      where: and(
        eq(userDailyActivity.userId, userId),
        eq(userDailyActivity.date, today)
      )
    });

    if (existingActivity) {
      const [updated] = await db.update(userDailyActivity)
        .set({
          experienceGained: existingActivity.experienceGained + experienceGained,
          challengesCompleted: existingActivity.challengesCompleted + challengesCompleted,
          actionsCompleted: existingActivity.actionsCompleted + actionsCompleted
        })
        .where(eq(userDailyActivity.id, existingActivity.id))
        .returning();
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

  async getUserActivity(userId: number, days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const startDateStr = startDate.toISOString().split('T')[0];

    return await db.query.userDailyActivity.findMany({
      where: and(
        eq(userDailyActivity.userId, userId),
        gte(userDailyActivity.date, startDateStr)
      ),
      orderBy: [desc(userDailyActivity.date)]
    });
  }

  // ==================== BLOG METHODS ====================

  async getBlogPosts(filters?: {
    type?: string;
    category?: string;
    tag?: string;
    search?: string;
    featured?: boolean;
    page?: number;
    limit?: number;
  }): Promise<BlogPost[]> {
    try {
      // Apply pagination
      const offset = filters?.page ? (filters.page - 1) * (filters.limit || 10) : 0;
      const limit = filters?.limit || 10;
      
      // Build the query base
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
      })
      .from(blogPosts);

      // Build where conditions
      const conditions = [];
      
      if (filters?.type && typeof filters.type === 'string' && filters.type.trim() !== '') {
        conditions.push(eq(blogPosts.type, filters.type as 'blog' | 'vlog'));
      }
      
      if (filters?.category && typeof filters.category === 'string' && filters.category.trim() !== '') {
        conditions.push(eq(blogPosts.category, filters.category));
      }
      
      if (filters?.featured !== undefined && filters.featured !== null) {
        conditions.push(eq(blogPosts.featured, filters.featured));
      }
      
      if (filters?.search && typeof filters.search === 'string' && filters.search.trim() !== '') {
        conditions.push(
          or(
            like(blogPosts.title, `%${filters.search}%`),
            like(blogPosts.excerpt, `%${filters.search}%`),
            like(blogPosts.content, `%${filters.search}%`)
          )!
        );
      }

      // Apply where conditions
      if (conditions.length === 1) {
        query = query.where(conditions[0]);
      } else if (conditions.length > 1) {
        query = query.where(and(...conditions)!);
      }
      
      const allPosts = await query
        .orderBy(desc(blogPosts.publishedAt))
        .limit(limit)
        .offset(offset);

      console.log(`[getBlogPosts] Found ${allPosts.length} posts with filters:`, filters);

      // If no posts, return empty array
      if (allPosts.length === 0) {
        console.log('[getBlogPosts] No posts found, returning empty array');
        return [];
      }

      // Get all post IDs
      const postIds = allPosts.map(p => p.id);
      
      // Batch fetch all tags, likes, and comments for all posts
      let allTags: any[] = [];
      let allLikes: any[] = [];
      let allComments: any[] = [];
      
      try {
        if (postIds.length > 0 && postIds.every(id => typeof id === 'number' && !isNaN(id))) {
          allTags = await db.select().from(postTags).where(inArray(postTags.postId, postIds));
          allLikes = await db.select().from(postLikes).where(inArray(postLikes.postId, postIds));
          allComments = await db.select().from(postComments).where(inArray(postComments.postId, postIds));
        }
      } catch (error) {
        console.error('[getBlogPosts] Error fetching related data:', error);
        console.error('[getBlogPosts] Error details:', error instanceof Error ? error.stack : error);
        // Continue with empty arrays if there's an error
      }
      
      // Get unique user IDs from likes and comments
      const userIds = new Set<number>();
      allLikes.forEach(like => { if (like.userId) userIds.add(like.userId); });
      allComments.forEach(comment => { if (comment.userId) userIds.add(comment.userId); });
      allPosts.forEach(post => { if (post.authorId) userIds.add(post.authorId); });
      
      // Batch fetch all users
      let allUsers: any[] = [];
      try {
        if (userIds.size > 0) {
          const userIdArray = Array.from(userIds).filter(id => typeof id === 'number' && !isNaN(id));
          if (userIdArray.length > 0) {
            allUsers = await db.select({
              id: users.id,
              name: users.name,
              username: users.username,
              email: users.email
            })
            .from(users)
            .where(inArray(users.id, userIdArray));
          }
        }
      } catch (error) {
        console.error('[getBlogPosts] Error fetching users:', error);
        console.error('[getBlogPosts] Error details:', error instanceof Error ? error.stack : error);
        // Continue with empty array if there's an error
      }
      
      const userMap = new Map(allUsers.map(u => [u.id, u]));
      
      // Group data by post ID
      const tagsByPost = new Map<number, any[]>();
      const likesByPost = new Map<number, any[]>();
      const commentsByPost = new Map<number, any[]>();
      
      allTags.forEach(tag => {
        if (!tagsByPost.has(tag.postId)) tagsByPost.set(tag.postId, []);
        tagsByPost.get(tag.postId)!.push(tag);
      });
      
      allLikes.forEach(like => {
        if (!likesByPost.has(like.postId)) likesByPost.set(like.postId, []);
        likesByPost.get(like.postId)!.push(like);
      });
      
      allComments.forEach(comment => {
        if (!commentsByPost.has(comment.postId)) commentsByPost.set(comment.postId, []);
        commentsByPost.get(comment.postId)!.push(comment);
      });
      
      // Build posts with all data
      const postsWithAuthors = allPosts.map((post) => {
        const author = post.authorId ? userMap.get(post.authorId) : null;
        const postTags = tagsByPost.get(post.id) || [];
        const postLikesData = likesByPost.get(post.id) || [];
        const postCommentsData = commentsByPost.get(post.id) || [];
        
        const likes = postLikesData.map((like: any) => ({
          user: like.userId && userMap.get(like.userId) 
            ? userMap.get(like.userId)!
            : { id: like.userId || 0, name: 'Usuario', username: 'usuario' }
        }));
        
        const comments = postCommentsData.map((comment: any) => ({
          id: comment.id,
          content: comment.content,
          createdAt: comment.createdAt || '',
          updatedAt: comment.updatedAt || '',
          user: comment.userId && userMap.get(comment.userId)
            ? userMap.get(comment.userId)!
            : { id: comment.userId || 0, name: 'Usuario', username: 'usuario' },
          parentId: comment.parentId || undefined,
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
          publishedAt: post.publishedAt || new Date().toISOString(),
          author: author || { id: post.authorId || 0, name: 'Usuario', username: 'usuario', email: '' },
          tags: postTags.map((t: any) => ({ tag: t.tag })),
          likes: likes,
          comments: comments
        };
      });

      console.log(`[getBlogPosts] Returning ${postsWithAuthors.length} posts with full data`);
      
      // Validate that all posts have required fields
      const validatedPosts = postsWithAuthors.map(post => ({
        id: Number(post.id),
        title: String(post.title || ''),
        slug: String(post.slug || ''),
        excerpt: String(post.excerpt || ''),
        content: String(post.content || ''),
        category: String(post.category || ''),
        type: post.type === 'blog' || post.type === 'vlog' ? post.type : 'blog' as 'blog' | 'vlog',
        featured: Boolean(post.featured),
        imageUrl: post.imageUrl || null,
        videoUrl: post.videoUrl || null,
        viewCount: Number(post.viewCount || 0),
        publishedAt: String(post.publishedAt || new Date().toISOString()),
        author: post.author || { id: 0, name: 'Usuario', username: 'usuario', email: '' },
        tags: Array.isArray(post.tags) ? post.tags : [],
        likes: Array.isArray(post.likes) ? post.likes : [],
        comments: Array.isArray(post.comments) ? post.comments : []
      }));
      
      return applyEnhancementsToList(validatedPosts);
    } catch (error) {
      console.error('[getBlogPosts] ERROR:', error);
      console.error('[getBlogPosts] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      console.error('[getBlogPosts] Error message:', error instanceof Error ? error.message : String(error));
      // Return empty array on error to prevent breaking the frontend
      return [];
    }
  }

  async getBlogPostStats(): Promise<{ total: number; blog: number; vlog: number }> {
    try {
      const counts = await db
        .select({
          type: blogPosts.type,
          count: sql<number>`COUNT(*)`.as('count')
        })
        .from(blogPosts)
        .groupBy(blogPosts.type);

      let blog = 0;
      let vlog = 0;

      counts.forEach((row) => {
        if (row.type === 'vlog') {
          vlog = Number(row.count) || 0;
        } else if (row.type === 'blog') {
          blog = Number(row.count) || 0;
        }
      });

      return {
        total: blog + vlog,
        blog,
        vlog
      };
    } catch (error) {
      console.error('[getBlogPostStats] ERROR:', error);
      return { total: 0, blog: 0, vlog: 0 };
    }
  }

  async getBlogPost(slug: string): Promise<BlogPost | undefined> {
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
      })
      .from(blogPosts)
      .leftJoin(users, eq(blogPosts.authorId, users.id))
      .where(eq(blogPosts.slug, slug))
      .limit(1);

      if (result.length === 0) {
        return undefined;
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
          name: postData.authorName || 'Usuario',
          username: postData.authorUsername || 'usuario',
          email: postData.authorEmail || ''
        } : { id: postData.authorId || 0, name: 'Usuario', username: 'usuario', email: '' }
      };

      // Get tags
      const tags = await db.select({
        tag: postTags.tag
      })
      .from(postTags)
      .where(eq(postTags.postId, post.id));

      // Get likes with user info
      const likesRecords = await db.select()
        .from(postLikes)
        .where(eq(postLikes.postId, post.id));

      const likes = await Promise.all(likesRecords.map(async (like) => {
        if (like.userId) {
          const [user] = await db.select({
            id: users.id,
            name: users.name,
            username: users.username
          })
          .from(users)
          .where(eq(users.id, like.userId))
          .limit(1);
          
          return {
            user: user || { id: like.userId, name: 'Usuario', username: 'usuario' }
          };
        }
        return {
          user: { id: like.userId || 0, name: 'Usuario', username: 'usuario' }
        };
      }));

      // Get comments with user info
      const commentsRecords = await db.select()
        .from(postComments)
        .where(eq(postComments.postId, post.id));

      const comments = await Promise.all(commentsRecords.map(async (comment) => {
        let user = { id: comment.userId || 0, name: 'Usuario', username: 'usuario' };
        
        if (comment.userId) {
          const [userData] = await db.select({
            id: users.id,
            name: users.name,
            username: users.username
          })
          .from(users)
          .where(eq(users.id, comment.userId))
          .limit(1);
          
          if (userData) {
            user = userData;
          }
        }

        return {
          id: comment.id,
          content: comment.content,
          createdAt: comment.createdAt || '',
          updatedAt: comment.updatedAt || '',
          user: user,
          parentId: comment.parentId || undefined,
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
      console.error('Error in getBlogPost:', error);
      return undefined;
    }
  }

  async createBlogPost(post: InsertBlogPost): Promise<BlogPost> {
    const result = await db.insert(blogPosts).values(post).returning();
    return applyBlogContentEnhancements(result[0]);
  }

  async updateBlogPost(id: number, post: InsertBlogPost, userId: number): Promise<BlogPost | undefined> {
    const existingPost = await db.query.blogPosts.findFirst({
      where: and(eq(blogPosts.id, id), eq(blogPosts.authorId, userId))
    });

    if (!existingPost) {
      return undefined;
    }

    const result = await db.update(blogPosts)
      .set({ ...post, updatedAt: new Date().toISOString() })
      .where(eq(blogPosts.id, id))
      .returning();

    return result.length ? applyBlogContentEnhancements(result[0]) : undefined;
  }

  async deleteBlogPost(id: number, userId: number): Promise<boolean> {
    const existingPost = await db.query.blogPosts.findFirst({
      where: and(eq(blogPosts.id, id), eq(blogPosts.authorId, userId))
    });

    if (!existingPost) {
      return false;
    }

    await db.delete(blogPosts).where(eq(blogPosts.id, id));
    return true;
  }

  // Post Interactions
  async togglePostLike(postId: number, userId: number): Promise<{ liked: boolean; count: number }> {
    const existingLike = await db.query.postLikes.findFirst({
      where: and(eq(postLikes.postId, postId), eq(postLikes.userId, userId))
    });

    if (existingLike) {
      // Unlike
      await db.delete(postLikes).where(eq(postLikes.id, existingLike.id));
    } else {
      // Like
      await db.insert(postLikes).values({ postId, userId });
    }

    // Get updated count
    const count = await db.select({ count: sql<number>`count(*)` })
      .from(postLikes)
      .where(eq(postLikes.postId, postId));

    return {
      liked: !existingLike,
      count: count[0].count
    };
  }

  async getPostLikes(postId: number): Promise<{ count: number; users: User[] }> {
    const likes = await db.query.postLikes.findMany({
      where: eq(postLikes.postId, postId),
      with: {
        user: true
      },
      orderBy: [desc(postLikes.createdAt)]
    });

    return {
      count: likes.length,
      users: likes.map(like => like.user)
    };
  }

  async createPostComment(postId: number, userId: number, content: string, parentId?: number): Promise<PostComment> {
    const result = await db.insert(postComments).values({
      postId,
      userId,
      content,
      parentId
    }).returning();

    return result[0];
  }

  async getPostComments(postId: number): Promise<PostComment[]> {
    return await db.query.postComments.findMany({
      where: eq(postComments.postId, postId),
      with: {
        user: true,
        replies: {
          with: {
            user: true
          },
          orderBy: [asc(postComments.createdAt)]
        }
      },
      orderBy: [asc(postComments.createdAt)]
    });
  }

  async updatePostComment(id: number, content: string, userId: number): Promise<PostComment | undefined> {
    const existingComment = await db.query.postComments.findFirst({
      where: and(eq(postComments.id, id), eq(postComments.userId, userId))
    });

    if (!existingComment) {
      return undefined;
    }

    const result = await db.update(postComments)
      .set({ content, updatedAt: new Date().toISOString() })
      .where(eq(postComments.id, id))
      .returning();

    return result[0];
  }

  async deletePostComment(id: number, userId: number): Promise<boolean> {
    const existingComment = await db.query.postComments.findFirst({
      where: and(eq(postComments.id, id), eq(postComments.userId, userId))
    });

    if (!existingComment) {
      return false;
    }

    await db.delete(postComments).where(eq(postComments.id, id));
    return true;
  }

  async togglePostBookmark(postId: number, userId: number): Promise<{ bookmarked: boolean }> {
    const existingBookmark = await db.query.postBookmarks.findFirst({
      where: and(eq(postBookmarks.postId, postId), eq(postBookmarks.userId, userId))
    });

    if (existingBookmark) {
      // Remove bookmark
      await db.delete(postBookmarks).where(eq(postBookmarks.id, existingBookmark.id));
      return { bookmarked: false };
    } else {
      // Add bookmark
      await db.insert(postBookmarks).values({ postId, userId });
      return { bookmarked: true };
    }
  }

  async getUserBookmarks(userId: number): Promise<BlogPost[]> {
    const bookmarks = await db.query.postBookmarks.findMany({
      where: eq(postBookmarks.userId, userId),
      with: {
        post: {
          with: {
            author: true,
            tags: true
          }
        }
      },
      orderBy: [desc(postBookmarks.createdAt)]
    });

    return applyEnhancementsToList(bookmarks.map(bookmark => bookmark.post));
  }

  async recordPostView(postId: number, userId?: number, sessionId?: string): Promise<void> {
    try {
      await db.insert(postViews).values({
        postId,
        userId,
        sessionId
      });
    } catch (error) {
      console.error('[recordPostView] Error:', error);
      throw error;
    }

    // Increment view count
    await db.update(blogPosts)
      .set({ viewCount: sql`${blogPosts.viewCount} + 1` })
      .where(eq(blogPosts.id, postId));
  }

  // Search & Recommendations
  async searchPosts(query: string, filters?: {
    type?: string;
    category?: string;
    page?: number;
    limit?: number;
  }): Promise<BlogPost[]> {
    const page = filters?.page || 1;
    const limit = filters?.limit || 10;
    const offset = (page - 1) * limit;

    let whereClause = sql`(${blogPosts.title} LIKE '%${query}%' OR ${blogPosts.excerpt} LIKE '%${query}%' OR ${blogPosts.content} LIKE '%${query}%')`;

    if (filters?.type) {
      whereClause = sql`${whereClause} AND ${blogPosts.type} = ${filters.type}`;
    }

    if (filters?.category) {
      whereClause = sql`${whereClause} AND ${blogPosts.category} = ${filters.category}`;
    }

    const rawPosts = await db.select().from(blogPosts)
      .where(whereClause)
      .orderBy(desc(blogPosts.publishedAt))
      .limit(limit)
      .offset(offset);

    return applyEnhancementsToList(rawPosts);
  }

  async getTrendingPosts(days: number = 7, limit: number = 10): Promise<BlogPost[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const startDateStr = startDate.toISOString();

    const posts = await db.select().from(blogPosts)
      .where(gte(blogPosts.publishedAt, startDateStr))
      .orderBy(desc(blogPosts.viewCount))
      .limit(limit);

    return applyEnhancementsToList(posts);
  }

  async getRelatedPosts(postId: number, limit: number = 4): Promise<BlogPost[]> {
    const post = await db.query.blogPosts.findFirst({
      where: eq(blogPosts.id, postId)
    });

    if (!post) {
      return [];
    }

    // Find posts with same category
    const related = await db.select().from(blogPosts)
      .where(and(
        eq(blogPosts.category, post.category),
        sql`${blogPosts.id} != ${postId}`
      ))
      .orderBy(desc(blogPosts.viewCount))
      .limit(limit);

    return applyEnhancementsToList(related);
  }

  async getPopularTags(limit: number = 20): Promise<{ tag: string; count: number }[]> {
    const result = await db.select({
      tag: postTags.tag,
      count: sql<number>`count(*)`
    })
      .from(postTags)
      .groupBy(postTags.tag)
      .orderBy(desc(sql<number>`count(*)`))
      .limit(limit);

    return result;
  }

  // ==================== GEOGRAPHIC LOCATIONS METHODS ====================

  async getProvinces(): Promise<GeographicLocation[]> {
    return await db.select().from(geographicLocations)
      .where(eq(geographicLocations.type, 'province'));
  }

  async getCitiesByProvince(provinceId: number): Promise<GeographicLocation[]> {
    return await db.select().from(geographicLocations)
      .where(and(
        eq(geographicLocations.type, 'city'),
        eq(geographicLocations.parentId, provinceId)
      ));
  }

  async getLocationByName(name: string, type?: string): Promise<GeographicLocation | undefined> {
    const conditions = [eq(geographicLocations.name, name)];
    if (type) {
      conditions.push(eq(geographicLocations.type, type as any));
    }
    
    const [location] = await db.select().from(geographicLocations)
      .where(and(...conditions));
    
    return location;
  }

  async createLocation(location: InsertGeographicLocation): Promise<GeographicLocation> {
    const [newLocation] = await db.insert(geographicLocations)
      .values(location)
      .returning();
    return newLocation;
  }

  // ==================== POST LIKES AND VIEWS METHODS ====================

  async likePost(postId: number, userId: number): Promise<CommunityPostLike> {
    const [like] = await db.insert(communityPostLikes)
      .values({ postId, userId })
      .returning();
    return like;
  }

  async unlikePost(postId: number, userId: number): Promise<boolean> {
    const result = await db.delete(communityPostLikes)
      .where(and(
        eq(communityPostLikes.postId, postId),
        eq(communityPostLikes.userId, userId)
      ));
    return result.changes > 0;
  }

  async isPostLikedByUser(postId: number, userId: number): Promise<boolean> {
    const [like] = await db.select().from(communityPostLikes)
      .where(and(
        eq(communityPostLikes.postId, postId),
        eq(communityPostLikes.userId, userId)
      ));
    return !!like;
  }

  async getCommunityPostLikes(postId: number): Promise<CommunityPostLike[]> {
    return await db.select().from(communityPostLikes)
      .where(eq(communityPostLikes.postId, postId));
  }

  async getCommunityPostLikesCount(postId: number): Promise<number> {
    const result = await db.select({ count: sql<number>`count(*)` })
      .from(communityPostLikes)
      .where(eq(communityPostLikes.postId, postId));
    return result[0]?.count || 0;
  }

  async recordCommunityPostView(postId: number, userId: number | null, ipAddress?: string, userAgent?: string): Promise<CommunityPostView> {
    const [view] = await db.insert(communityPostViews)
      .values({
        postId,
        userId,
        ipAddress,
        userAgent
      })
      .returning();
    return view;
  }

  async getCommunityPostViews(postId: number): Promise<CommunityPostView[]> {
    return await db.select().from(communityPostViews)
      .where(eq(communityPostViews.postId, postId));
  }

  async getCommunityPostViewsCount(postId: number): Promise<number> {
    const result = await db.select({ count: sql<number>`count(*)` })
      .from(communityPostViews)
      .where(eq(communityPostViews.postId, postId));
    return result[0]?.count || 0;
  }

  // ==================== GEOGRAPHIC SEARCH METHODS ====================

  async searchPostsByLocation(province?: string, city?: string, radiusKm?: number, userLat?: number, userLng?: number): Promise<CommunityPost[]> {
    let conditions = [eq(communityPosts.status, 'active')];

    if (province) {
      conditions.push(eq(communityPosts.province, province));
    }

    if (city) {
      conditions.push(eq(communityPosts.city, city));
    }

    let query = db.select().from(communityPosts)
      .where(and(...conditions));

    // For radius search, we'll need to implement a more complex query
    // For now, we'll filter by province/city and then apply radius filtering in memory
    // In a production system, you'd want to use spatial indexes and proper SQL functions
    
    if (radiusKm && userLat && userLng) {
      const posts = await query;
      return posts.filter(post => {
        if (!post.latitude || !post.longitude) return false;
        
        const distance = this.calculateDistance(userLat, userLng, post.latitude, post.longitude);
        return distance <= radiusKm;
      });
    }

    return await query;
  }

  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.deg2rad(lat2 - lat1);
    const dLng = this.deg2rad(lng2 - lng1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI/180);
  }

  // Inspiring Stories methods
  async getInspiringStories(filters?: {
    category?: string;
    status?: string;
    featured?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<InspiringStory[]> {
    let query = db.select().from(inspiringStories);
    
    const conditions = [];
    
    if (filters?.category) {
      conditions.push(eq(inspiringStories.category, filters.category as any));
    }
    if (filters?.status) {
      conditions.push(eq(inspiringStories.status, filters.status as any));
    }
    if (filters?.featured !== undefined) {
      conditions.push(eq(inspiringStories.featured, filters.featured ? 1 : 0));
    }
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    query = query.orderBy(desc(inspiringStories.publishedAt));
    
    if (filters?.limit) {
      query = query.limit(filters.limit);
    }
    if (filters?.offset) {
      query = query.offset(filters.offset);
    }
    
    return await query;
  }

  async getInspiringStory(id: number): Promise<InspiringStory | undefined> {
    const [story] = await db.select().from(inspiringStories).where(eq(inspiringStories.id, id));
    return story;
  }

  async createInspiringStory(story: InsertInspiringStory): Promise<InspiringStory> {
    const [newStory] = await db.insert(inspiringStories).values({
      ...story,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }).returning();
    return newStory;
  }

  async updateInspiringStory(id: number, updates: Partial<InsertInspiringStory>): Promise<InspiringStory> {
    const [updatedStory] = await db.update(inspiringStories)
      .set({
        ...updates,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(inspiringStories.id, id))
      .returning();
    return updatedStory;
  }

  async deleteInspiringStory(id: number): Promise<void> {
    await db.delete(inspiringStories).where(eq(inspiringStories.id, id));
  }

  async getFeaturedStories(limit: number = 3): Promise<InspiringStory[]> {
    return this.getInspiringStories({ featured: true, status: 'approved', limit });
  }

  async getStoriesByCategory(category: string, limit: number = 5): Promise<InspiringStory[]> {
    return this.getInspiringStories({ category, status: 'approved', limit });
  }

  async incrementStoryViews(id: number): Promise<void> {
    await db.update(inspiringStories)
      .set({
        views: sql`views + 1`,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(inspiringStories.id, id));
  }

  async incrementStoryLikes(id: number): Promise<void> {
    await db.update(inspiringStories)
      .set({
        likes: sql`likes + 1`,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(inspiringStories.id, id));
  }

  async incrementStoryShares(id: number): Promise<void> {
    await db.update(inspiringStories)
      .set({
        shares: sql`shares + 1`,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(inspiringStories.id, id));
  }

  async moderateStory(id: number, status: string, moderatorId: number, notes?: string): Promise<InspiringStory> {
    const [updatedStory] = await db.update(inspiringStories)
      .set({
        status: status as any,
        moderatedBy: moderatorId,
        moderatedAt: new Date().toISOString(),
        moderationNotes: notes,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(inspiringStories.id, id))
      .returning();
    return updatedStory;
  }

  // ==================== GAMIFICATION ¡BASTA! METHODS ====================

  async saveCommitment(
    userId: number,
    commitmentText: string,
    commitmentType: string,
    location?: {
      latitude?: number | null;
      longitude?: number | null;
      province?: string | null;
      city?: string | null;
    }
  ): Promise<any> {
    await this.ensureUserCommitmentsLocationColumns();

    const rawLatitude = location?.latitude;
    const rawLongitude = location?.longitude;

    const latitude = Number.isFinite(rawLatitude as number) ? Number(rawLatitude) : null;
    const longitude = Number.isFinite(rawLongitude as number) ? Number(rawLongitude) : null;

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
      status: 'active',
      pointsAwarded: 100 // Award 100 points for making a commitment
    }).returning();

    // Award points for the commitment
    await this.recordAction(userId, 'commitment', { commitmentType, commitmentId: commitment.id });

    return commitment;
  }

  async getRecentCommitments(limit: number): Promise<any[]> {
    await this.ensureUserCommitmentsLocationColumns();

    const safeLimit = Number.isFinite(limit) ? Math.max(1, Math.min(limit, 100)) : 20;

    return await db
      .select({
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
      })
      .from(userCommitments)
      .innerJoin(users, eq(userCommitments.userId, users.id))
      .where(eq(userCommitments.status, 'active'))
      .orderBy(desc(userCommitments.createdAt))
      .limit(safeLimit);
  }

  async getCommitmentStats(): Promise<{
    total: number;
    last24h: number;
    byType: { type: string; total: number }[];
  }> {
    await this.ensureUserCommitmentsLocationColumns();

    const [summary] = await db
      .select({
        total: sql<number>`count(*)`,
        last24h: sql<number>`sum(case when ${userCommitments.createdAt}::timestamp >= NOW() - INTERVAL '1 day' then 1 else 0 end)`
      })
      .from(userCommitments)
      .where(eq(userCommitments.status, 'active'));

    const byTypeRows = await db
      .select({
        type: userCommitments.commitmentType,
        total: sql<number>`count(*)`
      })
      .from(userCommitments)
      .where(eq(userCommitments.status, 'active'))
      .groupBy(userCommitments.commitmentType)
      .orderBy(desc(sql`count(*)`));

    return {
      total: Number(summary?.total ?? 0),
      last24h: Number(summary?.last24h ?? 0),
      byType: byTypeRows.map((row) => ({
        type: row.type ?? 'intermediate',
        total: Number(row.total ?? 0)
      }))
    };
  }

  async resolveLocationFromCoordinates(latitude: number, longitude: number): Promise<{
    province: string | null;
    city: string | null;
  }> {
    const locations = await db
      .select({
        id: geographicLocations.id,
        name: geographicLocations.name,
        type: geographicLocations.type,
        parentId: geographicLocations.parentId,
        latitude: geographicLocations.latitude,
        longitude: geographicLocations.longitude
      })
      .from(geographicLocations)
      .where(and(
        inArray(geographicLocations.type, ['province', 'city']),
        isNotNull(geographicLocations.latitude),
        isNotNull(geographicLocations.longitude)
      ));

    if (!locations.length) {
      return { province: null, city: null };
    }

    const provinces = locations.filter((location) => location.type === 'province');
    const cities = locations.filter((location) => location.type === 'city');
    const provinceById = new Map(provinces.map((province) => [province.id, province.name]));

    const nearestProvince = provinces.reduce<{ distance: number; name: string | null }>((closest, province) => {
      const distance = this.calculateDistance(latitude, longitude, province.latitude, province.longitude);
      if (distance < closest.distance) return { distance, name: province.name };
      return closest;
    }, { distance: Number.POSITIVE_INFINITY, name: null });

    const nearestCity = cities.reduce<{ distance: number; name: string | null; parentId: number | null }>((closest, city) => {
      const distance = this.calculateDistance(latitude, longitude, city.latitude, city.longitude);
      if (distance < closest.distance) {
        return { distance, name: city.name, parentId: city.parentId ?? null };
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

  async getLeaderboard(type: string, limit: number): Promise<any[]> {
    let query;
    
    switch (type) {
      case 'weekly':
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        const weekStartStr = weekStart.toISOString().split('T')[0];
        
        query = db
          .select({
            userId: weeklyRankings.userId,
            points: weeklyRankings.points,
            rank: weeklyRankings.rank,
            user: {
              id: users.id,
              name: users.name,
              username: users.username
            }
          })
          .from(weeklyRankings)
          .innerJoin(users, eq(weeklyRankings.userId, users.id))
          .where(eq(weeklyRankings.weekStart, weekStartStr))
          .orderBy(asc(weeklyRankings.rank))
          .limit(limit);
        break;
        
      case 'monthly':
        const monthStart = new Date().toISOString().substring(0, 7); // YYYY-MM
        
        query = db
          .select({
            userId: monthlyRankings.userId,
            points: monthlyRankings.points,
            rank: monthlyRankings.rank,
            user: {
              id: users.id,
              name: users.name,
              username: users.username
            }
          })
          .from(monthlyRankings)
          .innerJoin(users, eq(monthlyRankings.userId, users.id))
          .where(eq(monthlyRankings.monthStart, monthStart))
          .orderBy(asc(monthlyRankings.rank))
          .limit(limit);
        break;
        
      case 'global':
      default:
        query = db
          .select({
            userId: userProgress.userId,
            points: userProgress.points,
            rank: userProgress.rank,
            level: userProgress.level,
            user: {
              id: users.id,
              name: users.name,
              username: users.username
            }
          })
          .from(userProgress)
          .innerJoin(users, eq(userProgress.userId, users.id))
          .orderBy(desc(userProgress.points))
          .limit(limit);
        break;
    }

    return await query;
  }

  async recordAction(userId: number, actionType: string, metadata?: any): Promise<any> {
    const points = ACTION_POINTS[actionType] ?? 10;

    // Insert the action
    const [action] = await db.insert(userActions).values({
      userId,
      actionType,
      points,
      metadata: metadata ? JSON.stringify(metadata) : null
    }).returning();

    // Update user progress
    await this.updateUserProgress(userId, points);

    return action;
  }

  async getUserProgress(userId: number): Promise<any> {
    const [progress] = await db
      .select()
      .from(userProgress)
      .where(eq(userProgress.userId, userId));

    if (!progress) {
      // Create initial progress if it doesn't exist
      const [newProgress] = await db.insert(userProgress).values({
        userId,
        level: 1,
        points: 0,
        rank: 'Novato',
        totalActions: 0
      }).returning();
      return newProgress;
    }

    return progress;
  }

  async getAllBadges(): Promise<any[]> {
    return await db
      .select()
      .from(badges)
      .orderBy(asc(badges.orderIndex));
  }

  private async updateUserProgress(userId: number, pointsToAdd: number): Promise<void> {
    // Get current progress
    const [currentProgress] = await db
      .select()
      .from(userProgress)
      .where(eq(userProgress.userId, userId));

    if (!currentProgress) {
      // Create initial progress
      await db.insert(userProgress).values({
        userId,
        level: 1,
        points: pointsToAdd,
        rank: 'Novato',
        totalActions: 1,
        lastActionAt: new Date().toISOString()
      });
    } else {
      const newPoints = currentProgress.points + pointsToAdd;
      const newLevel = Math.floor(newPoints / 500) + 1; // 500 points per level
      
      // Determine rank based on level
      let newRank = 'Novato';
      if (newLevel >= 5) newRank = 'Líder del Movimiento';
      else if (newLevel >= 4) newRank = 'Agente de Cambio';
      else if (newLevel >= 3) newRank = 'Hombre Gris';
      else if (newLevel >= 2) newRank = 'Despierto';

      await db.update(userProgress)
        .set({
          points: newPoints,
          level: newLevel,
          rank: newRank,
          totalActions: currentProgress.totalActions + 1,
          lastActionAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        })
        .where(eq(userProgress.userId, userId));

      // Check if user leveled up
      if (newLevel > currentProgress.level) {
        await this.recordAction(userId, 'level_up', { 
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
  async getInitiativeMembers(postId: number): Promise<InitiativeMember[]> {
    return await db
      .select()
      .from(initiativeMembers)
      .where(and(eq(initiativeMembers.postId, postId), eq(initiativeMembers.status, 'active')))
      .orderBy(asc(initiativeMembers.joinedAt));
  }

  async addInitiativeMember(postId: number, userId: number, role: string): Promise<InitiativeMember> {
    const [member] = await db
      .insert(initiativeMembers)
      .values({
        postId,
        userId,
        role,
        status: 'active',
        permissions: JSON.stringify({
          canEdit: role === 'creator',
          canInvite: role === 'creator' || role === 'co-organizer',
          canApprove: role === 'creator' || role === 'co-organizer',
          canCreateMilestone: role === 'creator' || role === 'co-organizer' || role === 'active_member',
          canCreateTask: role === 'creator' || role === 'co-organizer' || role === 'active_member',
          canAssignTask: role === 'creator' || role === 'co-organizer',
          canDeleteContent: role === 'creator',
          canManageRoles: role === 'creator'
        })
      })
      .returning();

    // Update member count in community post
    await db
      .update(communityPosts)
      .set({ memberCount: sql`${communityPosts.memberCount} + 1` })
      .where(eq(communityPosts.id, postId));

    return member;
  }

  async updateMemberRole(memberId: number, role: string, permissions: object): Promise<void> {
    await db
      .update(initiativeMembers)
      .set({
        role,
        permissions: JSON.stringify(permissions)
      })
      .where(eq(initiativeMembers.id, memberId));
  }

  async removeMember(memberId: number): Promise<void> {
    const [member] = await db
      .select()
      .from(initiativeMembers)
      .where(eq(initiativeMembers.id, memberId));

    if (member) {
      await db
        .update(initiativeMembers)
        .set({
          status: 'left',
          leftAt: new Date().toISOString()
        })
        .where(eq(initiativeMembers.id, memberId));

      // Update member count in community post
      await db
        .update(communityPosts)
        .set({ memberCount: sql`${communityPosts.memberCount} - 1` })
        .where(eq(communityPosts.id, member.postId));
    }
  }

  // Membership Requests
  async createMembershipRequest(postId: number, userId: number, message: string): Promise<MembershipRequest> {
    const [request] = await db
      .insert(membershipRequests)
      .values({
        postId,
        userId,
        message,
        status: 'pending'
      })
      .returning();

    return request;
  }

  async getMembershipRequests(postId: number, status?: string): Promise<MembershipRequest[]> {
    let query = db
      .select()
      .from(membershipRequests)
      .where(eq(membershipRequests.postId, postId));

    if (status) {
      query = query.where(eq(membershipRequests.status, status as any));
    }

    return await query.orderBy(desc(membershipRequests.createdAt));
  }

  async approveMembershipRequest(requestId: number, reviewerId: number): Promise<void> {
    const [request] = await db
      .select()
      .from(membershipRequests)
      .where(eq(membershipRequests.id, requestId));

    if (request && request.status === 'pending') {
      // Add member to initiative
      await this.addInitiativeMember(request.postId, request.userId, 'member');

      // Update request status
      await db
        .update(membershipRequests)
        .set({
          status: 'approved',
          reviewedBy: reviewerId,
          reviewedAt: new Date().toISOString()
        })
        .where(eq(membershipRequests.id, requestId));

      // Create activity feed item
      await this.createActivityFeedItem({
        type: 'new_member',
        postId: request.postId,
        userId: request.userId,
        title: 'Nuevo miembro se unió',
        description: `Un nuevo miembro se unió a la iniciativa`,
        metadata: JSON.stringify({ requestId })
      });
    }
  }

  async rejectMembershipRequest(requestId: number, reviewerId: number): Promise<void> {
    await db
      .update(membershipRequests)
      .set({
        status: 'rejected',
        reviewedBy: reviewerId,
        reviewedAt: new Date().toISOString()
      })
      .where(eq(membershipRequests.id, requestId));
  }

  // Milestones
  async getInitiativeMilestones(postId: number): Promise<InitiativeMilestone[]> {
    return await db
      .select()
      .from(initiativeMilestones)
      .where(eq(initiativeMilestones.postId, postId))
      .orderBy(asc(initiativeMilestones.orderIndex));
  }

  async createMilestone(postId: number, data: InsertInitiativeMilestone): Promise<InitiativeMilestone> {
    const [milestone] = await db
      .insert(initiativeMilestones)
      .values({
        ...data,
        postId
      })
      .returning();

    // Create activity feed item
    await this.createActivityFeedItem({
      type: 'update',
      postId,
      userId: data.completedBy || 0, // Will be updated when completed
      title: 'Nuevo hito creado',
      description: `Se creó el hito: ${data.title}`,
      metadata: JSON.stringify({ milestoneId: milestone.id })
    });

    return milestone;
  }

  async updateMilestone(milestoneId: number, updates: Partial<InsertInitiativeMilestone>): Promise<void> {
    await db
      .update(initiativeMilestones)
      .set({
        ...updates,
        updatedAt: new Date().toISOString()
      })
      .where(eq(initiativeMilestones.id, milestoneId));
  }

  async completeMilestone(milestoneId: number, userId: number): Promise<void> {
    await db
      .update(initiativeMilestones)
      .set({
        status: 'completed',
        completedBy: userId,
        completedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
      .where(eq(initiativeMilestones.id, milestoneId));

    // Get milestone info for activity feed
    const [milestone] = await db
      .select()
      .from(initiativeMilestones)
      .where(eq(initiativeMilestones.id, milestoneId));

    if (milestone) {
      await this.createActivityFeedItem({
        type: 'milestone_completed',
        postId: milestone.postId,
        userId,
        title: 'Hito completado',
        description: `Se completó el hito: ${milestone.title}`,
        metadata: JSON.stringify({ milestoneId })
      });
    }
  }

  // Tasks
  async getInitiativeTasks(postId: number): Promise<InitiativeTask[]> {
    return await db
      .select()
      .from(initiativeTasks)
      .where(eq(initiativeTasks.postId, postId))
      .orderBy(asc(initiativeTasks.createdAt));
  }

  async createTask(postId: number, data: InsertInitiativeTask): Promise<InitiativeTask> {
    const [task] = await db
      .insert(initiativeTasks)
      .values({
        ...data,
        postId
      })
      .returning();

    // Create activity feed item
    await this.createActivityFeedItem({
      type: 'update',
      postId,
      userId: data.createdBy || 0,
      title: 'Nueva tarea creada',
      description: `Se creó la tarea: ${data.title}`,
      metadata: JSON.stringify({ taskId: task.id })
    });

    return task;
  }

  async updateTask(taskId: number, updates: Partial<InsertInitiativeTask>): Promise<void> {
    await db
      .update(initiativeTasks)
      .set({
        ...updates,
        updatedAt: new Date().toISOString()
      })
      .where(eq(initiativeTasks.id, taskId));
  }

  async assignTask(taskId: number, userId: number): Promise<void> {
    await db
      .update(initiativeTasks)
      .set({
        assignedTo: userId,
        updatedAt: new Date().toISOString()
      })
      .where(eq(initiativeTasks.id, taskId));
  }

  async completeTask(taskId: number): Promise<void> {
    await db
      .update(initiativeTasks)
      .set({
        status: 'done',
        completedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
      .where(eq(initiativeTasks.id, taskId));

    // Get task info for activity feed
    const [task] = await db
      .select()
      .from(initiativeTasks)
      .where(eq(initiativeTasks.id, taskId));

    if (task) {
      await this.createActivityFeedItem({
        type: 'task_completed',
        postId: task.postId,
        userId: task.assignedTo || 0,
        title: 'Tarea completada',
        description: `Se completó la tarea: ${task.title}`,
        metadata: JSON.stringify({ taskId })
      });
    }
  }

  // Messages/Chat
  async getInitiativeMessages(postId: number, limit: number = 50, offset: number = 0): Promise<InitiativeMessage[]> {
    return await db
      .select()
      .from(initiativeMessages)
      .where(eq(initiativeMessages.postId, postId))
      .orderBy(desc(initiativeMessages.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async sendMessage(postId: number, userId: number, content: string, type: string = 'message'): Promise<InitiativeMessage> {
    const [message] = await db
      .insert(initiativeMessages)
      .values({
        postId,
        userId,
        content,
        type: type as any
      })
      .returning();

    return message;
  }

  // Activity Feed
  async getActivityFeed(filters?: { type?: string, limit?: number, offset?: number }): Promise<ActivityFeedItem[]> {
    const { type, limit = 20, offset = 0 } = filters || {};
    
    let query = db
      .select()
      .from(activityFeed)
      .orderBy(desc(activityFeed.createdAt))
      .limit(limit)
      .offset(offset);

    if (type) {
      query = query.where(eq(activityFeed.type, type as any));
    }

    return await query;
  }

  async createActivityFeedItem(data: InsertActivityFeed): Promise<ActivityFeedItem> {
    const [item] = await db
      .insert(activityFeed)
      .values(data)
      .returning();

    return item;
  }

  // Notifications
  async getUserNotifications(userId: number, unreadOnly: boolean = false): Promise<Notification[]> {
    let query = db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId));

    if (unreadOnly) {
      query = query.where(eq(notifications.read, false));
    }

    return await query.orderBy(desc(notifications.createdAt));
  }

  async markNotificationAsRead(notificationId: number): Promise<void> {
    await db
      .update(notifications)
      .set({ read: true })
      .where(eq(notifications.id, notificationId));
  }

  async markAllNotificationsAsRead(userId: number): Promise<void> {
    await db
      .update(notifications)
      .set({ read: true })
      .where(eq(notifications.userId, userId));
  }

  async createNotification(userId: number, data: InsertNotification): Promise<Notification> {
    const [notification] = await db
      .insert(notifications)
      .values({
        ...data,
        userId
      })
      .returning();

    return notification;
  }

  // ==================== COURSE METHODS ====================

  // Courses
  async getCourses(filters?: {
    category?: string;
    level?: string;
    search?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    featured?: boolean;
  }): Promise<{ courses: Course[]; total: number; page: number; limit: number }> {
    const page = filters?.page || 1;
    const limit = filters?.limit || 12;
    const offset = (page - 1) * limit;

    try {
      // Build conditions array
      const conditions = [eq(courses.isPublished, true)];

      if (filters?.category) {
        conditions.push(eq(courses.category, filters.category as any));
      }
      if (filters?.level) {
        conditions.push(eq(courses.level, filters.level as any));
      }
      if (filters?.featured === true) {
        conditions.push(eq(courses.isFeatured, true));
      }
      if (filters?.search) {
        const searchTerm = `%${filters.search}%`;
        conditions.push(or(
          ilike(courses.title, searchTerm),
          ilike(courses.description, searchTerm)
        )!);
      }

      const whereCondition = and(...conditions);

      // Get total count
      const countResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(courses)
        .where(whereCondition);
      const total = Number(countResult[0]?.count || 0);

      // Apply sorting
      let orderByClause;
      if (filters?.sortBy === 'popular') {
        orderByClause = [desc(courses.viewCount)];
      } else if (filters?.sortBy === 'recent') {
        orderByClause = [desc(courses.createdAt)];
      } else if (filters?.sortBy === 'duration') {
        orderByClause = [asc(courses.duration)];
      } else {
        orderByClause = [desc(courses.orderIndex), desc(courses.createdAt)];
      }

      // Get courses
      const courseList = await db
        .select()
        .from(courses)
        .where(whereCondition)
        .orderBy(...orderByClause)
        .limit(limit)
        .offset(offset);

      return {
        courses: courseList,
        total,
        page,
        limit
      };
    } catch (error) {
      console.error('[getCourses] Error:', error);
      throw error;
    }
  }

  async getCourseBySlug(slug: string): Promise<Course | undefined> {
    const [course] = await db
      .select()
      .from(courses)
      .where(eq(courses.slug, slug))
      .limit(1);
    return course;
  }

  async getCourseWithLessons(courseId: number): Promise<{ course: Course; lessons: CourseLesson[] } | undefined> {
    const [course] = await db
      .select()
      .from(courses)
      .where(eq(courses.id, courseId))
      .limit(1);

    if (!course) return undefined;

    const lessonsList = await db
      .select()
      .from(courseLessons)
      .where(eq(courseLessons.courseId, courseId))
      .orderBy(asc(courseLessons.orderIndex));

    return { course, lessons: lessonsList };
  }

  async getCourseQuiz(courseId: number): Promise<{ quiz: CourseQuiz; questions: QuizQuestion[] } | undefined> {
    const [quiz] = await db
      .select()
      .from(courseQuizzes)
      .where(eq(courseQuizzes.courseId, courseId))
      .limit(1);

    if (!quiz) return undefined;

    const questionsList = await db
      .select()
      .from(quizQuestions)
      .where(eq(quizQuestions.quizId, quiz.id))
      .orderBy(asc(quizQuestions.orderIndex));

    return { quiz, questions: questionsList };
  }

  // Course Progress
  async getUserCourseProgress(userId: number, courseId: number): Promise<UserCourseProgress | undefined> {
    const [progress] = await db
      .select()
      .from(userCourseProgress)
      .where(
        and(
          eq(userCourseProgress.userId, userId),
          eq(userCourseProgress.courseId, courseId)
        )
      )
      .limit(1);
    return progress;
  }

  async startCourse(userId: number, courseId: number): Promise<UserCourseProgress> {
    // Check if progress already exists
    const existing = await this.getUserCourseProgress(userId, courseId);
    if (existing) {
      return existing;
    }

    // Verify course exists and is published
    const [course] = await db
      .select()
      .from(courses)
      .where(eq(courses.id, courseId))
      .limit(1);

    if (!course) {
      throw new Error('Course not found');
    }

    const [progress] = await db
      .insert(userCourseProgress)
      .values({
        userId,
        courseId,
        status: 'in_progress',
        progress: 0,
        startedAt: new Date().toISOString(),
        lastAccessedAt: new Date().toISOString(),
        completedLessons: JSON.stringify([])
      })
      .returning();

    if (!progress) {
      throw new Error('Failed to create course progress');
    }

    return progress;
  }

  async completeLesson(userId: number, lessonId: number): Promise<{ progress: UserCourseProgress; courseCompleted: boolean; xpAwarded: { lesson: number; course: number } }> {
    // Get lesson to find course
    const [lesson] = await db
      .select()
      .from(courseLessons)
      .where(eq(courseLessons.id, lessonId))
      .limit(1);

    if (!lesson) {
      throw new Error('Lesson not found');
    }

    if (!lesson.courseId) {
      throw new Error('Lesson has no associated course');
    }

    // Update lesson progress
    const [existingLessonProgress] = await db
      .select()
      .from(userLessonProgress)
      .where(
        and(
          eq(userLessonProgress.userId, userId),
          eq(userLessonProgress.lessonId, lessonId)
        )
      )
      .limit(1);

    if (existingLessonProgress) {
      await db
        .update(userLessonProgress)
        .set({
          status: 'completed',
          completedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        })
        .where(eq(userLessonProgress.id, existingLessonProgress.id));
    } else {
      await db.insert(userLessonProgress).values({
        userId,
        lessonId,
        status: 'completed',
        completedAt: new Date().toISOString()
      });
    }

    // Update course progress
    const [courseProgress] = await db
      .select()
      .from(userCourseProgress)
      .where(
        and(
          eq(userCourseProgress.userId, userId),
          eq(userCourseProgress.courseId, lesson.courseId)
        )
      )
      .limit(1);

    if (!courseProgress) {
      throw new Error('Course progress not found');
    }

    // Get all lessons for the course
    const allLessons = await db
      .select()
      .from(courseLessons)
      .where(eq(courseLessons.courseId, lesson.courseId))
      .orderBy(asc(courseLessons.orderIndex));

    const requiredLessons = allLessons.filter(l => l.isRequired);
    const completedLessonsIds = JSON.parse(courseProgress.completedLessons || '[]') as number[];
    const lessonAlreadyCompleted = completedLessonsIds.includes(lessonId);
    
    if (!lessonAlreadyCompleted) {
      completedLessonsIds.push(lessonId);
    }

    // Calculate progress
    const completedRequired = requiredLessons.filter(l => completedLessonsIds.includes(l.id)).length;
    const progressPercentage = requiredLessons.length > 0
      ? Math.round((completedRequired / requiredLessons.length) * 100)
      : 0;

    // Find next lesson
    const nextLesson = allLessons.find(l => 
      l.orderIndex > lesson.orderIndex && !completedLessonsIds.includes(l.id)
    );

    // Check if course is completed
    const courseCompleted = requiredLessons.every(l => completedLessonsIds.includes(l.id));
    const courseWasCompletedBefore = courseProgress.status === 'completed';

    const [updatedProgress] = await db
      .update(userCourseProgress)
      .set({
        progress: progressPercentage,
        status: courseCompleted ? 'completed' : 'in_progress',
        currentLessonId: nextLesson?.id || null,
        completedLessons: JSON.stringify(completedLessonsIds),
        completedAt: courseCompleted ? new Date().toISOString() : null,
        lastAccessedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
      .where(eq(userCourseProgress.id, courseProgress.id))
      .returning();

    if (!updatedProgress) {
      throw new Error('Failed to update course progress');
    }

    if (!lesson.courseId) {
      throw new Error('Lesson courseId is missing');
    }

    const xpAwarded = { lesson: 0, course: 0 };

    if (!lessonAlreadyCompleted) {
      try {
        xpAwarded.lesson = ACTION_POINTS['lesson_complete'] ?? 0;
        await this.recordAction(userId, 'lesson_complete', {
          lessonId,
          courseId: lesson.courseId
        });

        if (courseCompleted && !courseWasCompletedBefore) {
          xpAwarded.course = ACTION_POINTS['course_complete'] ?? 0;
          await this.recordAction(userId, 'course_complete', {
            courseId: lesson.courseId
          });
        }
      } catch (actionError) {
        console.error('Error awarding points for lesson completion:', actionError);
      }
    }

    return { progress: updatedProgress, courseCompleted, xpAwarded };
  }

  async updateLessonTimeSpent(userId: number, lessonId: number, seconds: number): Promise<void> {
    const [existing] = await db
      .select()
      .from(userLessonProgress)
      .where(
        and(
          eq(userLessonProgress.userId, userId),
          eq(userLessonProgress.lessonId, lessonId)
        )
      )
      .limit(1);

    if (existing) {
      await db
        .update(userLessonProgress)
        .set({
          timeSpent: (existing.timeSpent || 0) + seconds,
          updatedAt: new Date().toISOString()
        })
        .where(eq(userLessonProgress.id, existing.id));
    } else {
      await db.insert(userLessonProgress).values({
        userId,
        lessonId,
        status: 'in_progress',
        timeSpent: seconds
      });
    }

    // Update lastAccessedAt in course progress
    const [lesson] = await db
      .select()
      .from(courseLessons)
      .where(eq(courseLessons.id, lessonId))
      .limit(1);

    if (lesson) {
      await db
        .update(userCourseProgress)
        .set({
          lastAccessedAt: new Date().toISOString()
        })
        .where(
          and(
            eq(userCourseProgress.userId, userId),
            eq(userCourseProgress.courseId, lesson.courseId)
          )
        );
    }
  }

  async getUserLessonProgress(userId: number, lessonId: number): Promise<UserLessonProgress | undefined> {
    const [progress] = await db
      .select()
      .from(userLessonProgress)
      .where(
        and(
          eq(userLessonProgress.userId, userId),
          eq(userLessonProgress.lessonId, lessonId)
        )
      )
      .limit(1);
    return progress;
  }

  // Quiz
  async createQuizAttempt(userId: number, quizId: number, courseId: number): Promise<QuizAttempt> {
    const [attempt] = await db
      .insert(quizAttempts)
      .values({
        userId,
        quizId,
        courseId,
        startedAt: new Date().toISOString()
      })
      .returning();

    return attempt;
  }

  async submitQuizAttempt(attemptId: number, answers: Array<{ questionId: number; answer: any }>): Promise<{ score: number; passed: boolean; answers: QuizAttemptAnswer[]; certificateCode?: string; xpAwarded: { quiz: number; certificate: number } }> {
    // Get attempt
    const [attempt] = await db
      .select()
      .from(quizAttempts)
      .where(eq(quizAttempts.id, attemptId))
      .limit(1);

    if (!attempt) {
      throw new Error('Quiz attempt not found');
    }

    // Get quiz and questions
    const quizData = await this.getCourseQuiz(attempt.courseId);
    if (!quizData) {
      throw new Error('Quiz not found');
    }

    const { quiz, questions } = quizData;

    // Calculate score
    let correctAnswers = 0;
    let totalPoints = 0;
    let earnedPoints = 0;
    const attemptAnswers: QuizAttemptAnswer[] = [];

    for (const question of questions) {
      totalPoints += question.points || 1;
      const userAnswer = answers.find(a => a.questionId === question.id);
      const correctAnswer = JSON.parse(question.correctAnswer);
      const isCorrect = JSON.stringify(userAnswer?.answer) === JSON.stringify(correctAnswer);

      if (isCorrect) {
        correctAnswers++;
        earnedPoints += question.points || 1;
      }

      const [answerRecord] = await db
        .insert(quizAttemptAnswers)
        .values({
          attemptId,
          questionId: question.id,
          answer: JSON.stringify(userAnswer?.answer || ''),
          isCorrect,
          pointsEarned: isCorrect ? (question.points || 1) : 0
        })
        .returning();

      attemptAnswers.push(answerRecord);
    }

    const score = Math.round((earnedPoints / totalPoints) * 100);
    const passed = score >= (quiz.passingScore || 70);

    // Update attempt
    const timeSpent = attempt.startedAt
      ? Math.floor((new Date().getTime() - new Date(attempt.startedAt).getTime()) / 1000)
      : 0;

    await db
      .update(quizAttempts)
      .set({
        score,
        passed,
        answers: JSON.stringify(answers),
        timeSpent,
        completedAt: new Date().toISOString()
      })
      .where(eq(quizAttempts.id, attemptId));

    // Generate certificate if passed
    let certificateCode: string | undefined;
    const xpAwarded = { quiz: 0, certificate: 0 };
    if (passed) {
      xpAwarded.quiz = ACTION_POINTS['quiz_passed'] ?? 0;
      await this.recordAction(attempt.userId, 'quiz_passed', {
        quizId: attempt.quizId,
        courseId: attempt.courseId,
        score
      });

      const { certificate, created } = await this.generateCertificate(attempt.userId, attempt.courseId, score);
      certificateCode = certificate.certificateCode;

      if (created) {
        xpAwarded.certificate = ACTION_POINTS['certificate_earned'] ?? 0;
        await this.recordAction(attempt.userId, 'certificate_earned', {
          courseId: attempt.courseId,
          certificateCode: certificate.certificateCode
        });

        try {
          const [courseBadge] = await db
            .select()
            .from(badges)
            .where(eq(badges.name, 'Estudiante Dedicado'))
            .limit(1);
          
          if (courseBadge) {
            await this.awardBadge(attempt.userId, courseBadge.id);
          }
        } catch (error) {
          console.log('Course completion badge not found');
        }
      }
    }

    return { score, passed, answers: attemptAnswers, certificateCode, xpAwarded };
  }

  async getQuizAttempt(attemptId: number): Promise<QuizAttempt | undefined> {
    const [attempt] = await db
      .select()
      .from(quizAttempts)
      .where(eq(quizAttempts.id, attemptId))
      .limit(1);
    return attempt;
  }

  async getUserQuizAttempts(userId: number, quizId: number): Promise<QuizAttempt[]> {
    return await db
      .select()
      .from(quizAttempts)
      .where(
        and(
          eq(quizAttempts.userId, userId),
          eq(quizAttempts.quizId, quizId)
        )
      )
      .orderBy(desc(quizAttempts.startedAt));
  }

  // Certificates
  async generateCertificate(userId: number, courseId: number, quizScore: number): Promise<{ certificate: CourseCertificate; created: boolean }> {
    const [existing] = await db
      .select()
      .from(courseCertificates)
      .where(
        and(
          eq(courseCertificates.userId, userId),
          eq(courseCertificates.courseId, courseId)
        )
      )
      .limit(1);

    if (existing) {
      return { certificate: existing, created: false };
    }

    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 9);
    const certificateCode = `${courseId}-${userId}-${timestamp}-${random}`;

    const [certificate] = await db
      .insert(courseCertificates)
      .values({
        userId,
        courseId,
        certificateCode,
        quizScore
      })
      .returning();

    try {
      const [certificateBadge] = await db
        .select()
        .from(badges)
        .where(eq(badges.name, 'Certificado de Curso'))
        .limit(1);
      
      if (certificateBadge) {
        await this.awardBadge(userId, certificateBadge.id);
      }
    } catch (error) {
      console.log('Certificate badge not found');
    }

    return { certificate, created: true };
  }

  async getUserCertificates(userId: number): Promise<CourseCertificate[]> {
    return await db
      .select()
      .from(courseCertificates)
      .where(eq(courseCertificates.userId, userId))
      .orderBy(desc(courseCertificates.issuedAt));
  }

  async getUserCourses(userId: number): Promise<Array<{ course: Course; progress: UserCourseProgress }>> {
    const progressList = await db
      .select()
      .from(userCourseProgress)
      .where(eq(userCourseProgress.userId, userId));

    const result = await Promise.all(
      progressList.map(async (progress) => {
        const [course] = await db
          .select()
          .from(courses)
          .where(progress.courseId !== null ? eq(courses.id, progress.courseId) : undefined)
          .limit(1);
        return { course: course!, progress };
      })
    );

    return result.filter(item => item.course);
  }

  // User Profiles
  async getUserProfile(userId: number): Promise<UserProfile | undefined> {
    const [profile] = await db.select().from(userProfiles).where(eq(userProfiles.userId, userId)).limit(1);
    return profile;
  }

  async createUserProfile(data: Partial<InsertUserProfile> & { userId: number }): Promise<UserProfile> {
    const [profile] = await db.insert(userProfiles).values(data as any).returning();
    return profile;
  }

  async updateUserProfile(userId: number, updates: Partial<InsertUserProfile>): Promise<UserProfile> {
    const [profile] = await db.update(userProfiles)
      .set(updates)
      .where(eq(userProfiles.userId, userId))
      .returning();
    return profile;
  }
}

// Use DatabaseStorage with Neon Postgres
export const storage = new DatabaseStorage();
