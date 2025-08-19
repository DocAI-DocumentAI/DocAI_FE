import { api } from "../lib/api/api";
import {
  GoogleAuthUrlResponse,
  GoogleAuthCodeRequest,
  User,
} from "../types/User";
import { GoogleOAuthError } from "../types/GoogleOAuth";

export class GoogleAuthService {
  /**
   * Get Google OAuth authorization URL
   * @returns Promise with the Google auth URL
   */
  static async getGoogleAuthUrl(): Promise<GoogleAuthUrlResponse> {
    try {
      const response = await api.get("/auth/google/auth-url");
      return response.data;
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message || "Failed to get Google auth URL";
      throw new GoogleOAuthError(errorMessage, error?.response?.status);
    }
  }

  /**
   * Exchange authorization code for user data and tokens
   * @param code - Authorization code from Google OAuth callback
   * @returns Promise with user data and tokens
   */
  static async exchangeAuthCode(code: string): Promise<User> {
    try {
      const requestData: GoogleAuthCodeRequest = { code };
      const response = await api.post("/auth/exchange-code", requestData);
      return response.data;
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        "Failed to exchange authorization code";
      throw new GoogleOAuthError(errorMessage, error?.response?.status);
    }
  }

  /**
   * Redirect user to Google OAuth authorization page
   * @param authUrl - The Google OAuth authorization URL
   */
  static redirectToGoogle(authUrl: string): void {
    window.location.href = authUrl;
  }

  /**
   * Extract authorization code from URL query parameters
   * @param url - The current URL (optional, defaults to window.location.href)
   * @returns Authorization code or null if not found
   */
  static extractCodeFromUrl(url?: string): string | null {
    const currentUrl = url || window.location.href;
    const urlParams = new URLSearchParams(new URL(currentUrl).search);
    return urlParams.get("code");
  }

  /**
   * Check if current URL contains OAuth error
   * @param url - The current URL (optional, defaults to window.location.href)
   * @returns Error message or null if no error
   */
  static extractErrorFromUrl(url?: string): string | null {
    const currentUrl = url || window.location.href;
    const urlParams = new URLSearchParams(new URL(currentUrl).search);
    return urlParams.get("error");
  }

  /**
   * Clean OAuth parameters from URL
   * This removes code, state, error, etc. from the URL after processing
   */
  static cleanUrlParams(): void {
    const url = new URL(window.location.href);
    const paramsToRemove = ["code", "state", "error", "error_description"];

    paramsToRemove.forEach((param) => {
      url.searchParams.delete(param);
    });

    // Update URL without reloading the page
    window.history.replaceState({}, document.title, url.toString());
  }
}

// GoogleOAuthError is now imported from ../types/GoogleOAuth
