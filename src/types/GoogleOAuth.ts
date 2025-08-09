// Google OAuth API Types
import { User } from "./User";

export interface GoogleAuthUrlResponse {
  authUrl: string;
}

export interface GoogleAuthCodeRequest {
  code: string;
}

export interface GoogleOAuthErrorData {
  message: string;
  status?: number;
  error?: string;
  error_description?: string;
}

// Google OAuth URL parameters
export interface GoogleOAuthUrlParams {
  code?: string;
  state?: string;
  error?: string;
  error_description?: string;
}

// Google OAuth state management
export interface GoogleOAuthState {
  isLoading: boolean;
  error: string | null;
  authUrl: string | null;
}

// Google OAuth flow status
export type GoogleOAuthFlowStatus =
  | "idle"
  | "initiating"
  | "redirecting"
  | "processing"
  | "success"
  | "error";

// Google OAuth callback status
export interface GoogleOAuthCallbackStatus {
  status: GoogleOAuthFlowStatus;
  message?: string;
  error?: string;
}

// Google OAuth configuration
export interface GoogleOAuthConfig {
  clientId: string;
  redirectUri: string;
  scope: string[];
  responseType: "code";
  accessType: "offline";
  prompt: "consent" | "select_account" | "none";
}

// Google user profile (from Google's API)
export interface GoogleUserProfile {
  id: string;
  email: string;
  verified_email: boolean;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  locale: string;
}

// Google OAuth tokens
export interface GoogleOAuthTokens {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: "Bearer";
  scope: string;
  id_token?: string;
}

// Extended error class for better error handling
export class GoogleOAuthError extends Error {
  status?: number;
  code?: string;
  details?: Record<string, unknown>;

  constructor(
    message: string,
    status?: number,
    code?: string,
    details?: Record<string, unknown>
  ) {
    super(message);
    this.name = "GoogleOAuthError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

// Google OAuth hook return type
export interface UseGoogleAuthReturn {
  isLoading: boolean;
  error: string | null;
  initiateGoogleLogin: () => Promise<void>;
  handleGoogleCallback: () => Promise<User | null>;
  clearAuthError: () => void;
}

// Google OAuth button props
export interface GoogleLoginButtonProps {
  onLoading?: (loading: boolean) => void;
  onError?: (error: string) => void;
  onSuccess?: (user: User) => void;
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
  variant?: "default" | "outline" | "minimal";
  size?: "sm" | "md" | "lg";
}

// Google OAuth callback component props
export interface GoogleCallbackProps {
  onSuccess?: (user: User) => void;
  onError?: (error: string) => void;
  redirectOnSuccess?: boolean;
  redirectOnError?: boolean;
  successRedirectPath?: string;
  errorRedirectPath?: string;
}

// Note: TypeScript interfaces and types cannot be exported as values in a default export
// All types are already exported individually above and can be imported as needed
