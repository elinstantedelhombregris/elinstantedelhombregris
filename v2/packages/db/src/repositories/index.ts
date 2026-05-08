/**
 * Repository barrel.
 *
 * One repository per domain (users, auth, blog, community, ...).
 * They take a `Db` in the constructor so test code can inject a
 * test branch's client.
 */
export { UsersRepository } from './users.js';
export { AuthRepository } from './auth.js';
export { NotificationsRepository } from './notifications.js';
export { GeographicRepository, normalizeProvinceName } from './geographic.js';
export { CommunityRepository } from './community.js';
export { BlogRepository } from './blog.js';
export { EnsayosRepository } from './ensayos.js';
export { CivicAssessmentRepository } from './civic-assessment.js';
export { GoalsRepository } from './goals.js';
export { CoachingRepository } from './coaching.js';
export { ResourcesRepository } from './resources.js';
export { DreamsRepository } from './dreams.js';
export { FeedbackRepository } from './feedback.js';
export { CoursesRepository } from './courses.js';
export { IniciativasRepository } from './iniciativas.js';
export { MandatoRepository } from './mandato.js';
export { PulsoRepository } from './pulso.js';
export { GamificationRepository } from './gamification.js';
