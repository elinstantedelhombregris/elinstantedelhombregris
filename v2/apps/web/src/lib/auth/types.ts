/**
 * Shape of the authenticated user the frontend uses.
 *
 * Matches the public envelope returned by /api/auth/me. Re-exported
 * separately here so React components don't need to import @v2/shared
 * just to type a useAuth() return value.
 */
export interface AuthenticatedUser {
  id: number;
  username: string;
  email: string;
  name: string;
  location: string | null;
  bio: string | null;
  avatarUrl: string | null;
  emailVerified: boolean;
  onboardingCompleted: boolean;
  createdAt: string;
}
