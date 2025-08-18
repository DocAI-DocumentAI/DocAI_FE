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
    console.log("🔍 Extracting code from URL:", currentUrl);

    try {
      const urlObj = new URL(currentUrl);
      console.log("🔍 URL pathname:", urlObj.pathname);
      console.log("🔍 URL search params:", urlObj.search);

      const urlParams = new URLSearchParams(urlObj.search);
      const code = urlParams.get("code");

      console.log("🔍 All URL parameters:");
      urlParams.forEach((value, key) => {
        console.log(`  ${key}: ${value}`);
      });

      console.log("🔍 Extracted code:", code);
      return code;
    } catch (error) {
      console.error("❌ Error parsing URL:", error);
      return null;
    }
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

  /**
   * Debug helper to check current URL and expected callback URL
   */
  static debugCallbackUrl(): void {
    const currentUrl = window.location.href;
    const expectedCallbackPath = "/auth/google/callback";
    const currentDomain = `${window.location.protocol}//${window.location.host}`;
    const expectedCallbackUrl = `${currentDomain}${expectedCallbackPath}`;

    console.log("🔧 Google OAuth Debug Info:");
    console.log("  Current URL:", currentUrl);
    console.log("  Current Domain:", currentDomain);
    console.log("  Expected Callback URL:", expectedCallbackUrl);
    console.log("  Current Path:", window.location.pathname);
    console.log(
      "  Is Callback Path?",
      window.location.pathname === expectedCallbackPath
    );

    // Check if URL has any OAuth-related parameters
    const urlParams = new URLSearchParams(window.location.search);
    const hasCode = urlParams.has("code");
    const hasError = urlParams.has("error");
    const hasState = urlParams.has("state");

    console.log("  Has 'code' parameter?", hasCode);
    console.log("  Has 'error' parameter?", hasError);
    console.log("  Has 'state' parameter?", hasState);

    if (hasError) {
      console.log("  Error:", urlParams.get("error"));
      console.log("  Error Description:", urlParams.get("error_description"));
    }

    if (!hasCode && !hasError) {
      console.warn("⚠️ No OAuth parameters found in URL. Possible issues:");
      console.warn("  1. Redirect URI mismatch in Google OAuth app config");
      console.warn("  2. User denied authorization");
      console.warn("  3. OAuth flow was interrupted");
      console.warn("  Expected callback URL should be:", expectedCallbackUrl);
    }
  }
}

// GoogleOAuthError is now imported from ../types/GoogleOAuth
