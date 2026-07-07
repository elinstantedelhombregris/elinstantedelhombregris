/** Contratos del backend v1 (SocialJusticeHub) que consume la app. */

export interface ApiUser {
  id: number;
  username: string;
  email: string;
  name: string;
  location: string | null;
  avatarUrl: string | null;
  bio: string | null;
  emailVerified: boolean;
  onboardingCompleted: boolean;
  createdAt: string;
  dataShareOptOut: boolean;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  message: string;
  user: ApiUser;
  tokens: AuthTokens;
}

export interface ApiError {
  error?: string;
  message?: string;
  code?: string;
}
