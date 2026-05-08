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
