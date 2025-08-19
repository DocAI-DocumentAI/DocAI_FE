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

      console.log("🔍 Extracted code from URL:", code);

      // If code found in URL, store it in sessionStorage as backup
      if (code) {
        this.storeOAuthCode(code);
        return code;
      }

      // If no code in URL, try to get from sessionStorage
      console.log("🔍 No code in URL, checking sessionStorage...");
      const storedCode = this.getStoredOAuthCode();
      if (storedCode) {
        console.log("🔍 Using stored code from sessionStorage");
        return storedCode;
      }

      console.log("🔍 No code found in URL or sessionStorage");
      return null;
    } catch (error) {
      console.error("❌ Error parsing URL:", error);

      // Try sessionStorage as fallback even if URL parsing fails
      const storedCode = this.getStoredOAuthCode();
      if (storedCode) {
        console.log("🔍 Using stored code as fallback after URL parsing error");
        return storedCode;
      }

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
    try {
      const url = new URL(window.location.href);
      const paramsToRemove = ["code", "state", "error", "error_description"];

      console.log("🧹 Cleaning URL parameters...");
      console.log("  Original URL:", url.toString());

      let hasChanges = false;
      paramsToRemove.forEach((param) => {
        if (url.searchParams.has(param)) {
          console.log(`  Removing parameter: ${param}`);
          url.searchParams.delete(param);
          hasChanges = true;
        }
      });

      if (hasChanges) {
        console.log("  Clean URL:", url.toString());
        // Update URL without reloading the page
        window.history.replaceState({}, document.title, url.toString());
      } else {
        console.log("  No parameters to clean");
      }
    } catch (error) {
      console.error("❌ Error cleaning URL parameters:", error);
    }
  }

  /**
   * Store OAuth code temporarily to prevent loss during URL manipulations
   */
  static storeOAuthCode(code: string): void {
    try {
      sessionStorage.setItem("google_oauth_code", code);
      console.log("🔒 Stored OAuth code in sessionStorage");
    } catch (error) {
      console.warn("⚠️ Could not store OAuth code in sessionStorage:", error);
    }
  }

  /**
   * Retrieve stored OAuth code
   */
  static getStoredOAuthCode(): string | null {
    try {
      const code = sessionStorage.getItem("google_oauth_code");
      if (code) {
        console.log("🔓 Retrieved OAuth code from sessionStorage");
      }
      return code;
    } catch (error) {
      console.warn(
        "⚠️ Could not retrieve OAuth code from sessionStorage:",
        error
      );
      return null;
    }
  }

  /**
   * Clear stored OAuth code
   */
  static clearStoredOAuthCode(): void {
    try {
      sessionStorage.removeItem("google_oauth_code");
      console.log("🗑️ Cleared OAuth code from sessionStorage");
    } catch (error) {
      console.warn("⚠️ Could not clear OAuth code from sessionStorage:", error);
    }
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

    if (hasCode) {
      const code = urlParams.get("code");
      console.log("  Code value:", code?.substring(0, 10) + "...");
    }

    if (hasError) {
      console.log("  Error:", urlParams.get("error"));
      console.log("  Error Description:", urlParams.get("error_description"));
    }

    // Check sessionStorage for stored code
    const storedCode = this.getStoredOAuthCode();
    if (storedCode) {
      console.log(
        "  Has stored code in sessionStorage:",
        storedCode.substring(0, 10) + "..."
      );
    }

    if (!hasCode && !hasError && !storedCode) {
      console.warn(
        "⚠️ No OAuth parameters found in URL or sessionStorage. Possible issues:"
      );
      console.warn("  1. Redirect URI mismatch in Google OAuth app config");
      console.warn("  2. User denied authorization");
      console.warn("  3. OAuth flow was interrupted");
      console.warn("  4. URL parameters were lost during navigation");
      console.warn("  Expected callback URL should be:", expectedCallbackUrl);
    }
  }
}

// GoogleOAuthError is now imported from ../types/GoogleOAuth
