import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Hook to protect Google OAuth callback page from premature redirects
 * This prevents other parts of the app from redirecting away from the callback page
 * while OAuth processing is in progress
 */
export const useGoogleCallbackProtection = () => {
  const location = useLocation();

  useEffect(() => {
    const isGoogleCallback = location.pathname === "/auth/google/callback";

    if (isGoogleCallback) {
      console.log("🛡️ Google OAuth callback protection activated");

      // Set a flag in sessionStorage to indicate we're processing OAuth
      sessionStorage.setItem("google_oauth_processing", "true");

      // Instead of overriding window.location.href, we'll use a simpler approach
      // Just set the flag and let the components check this flag before redirecting
      console.log("🔒 OAuth processing flag set in sessionStorage");
    }

    return () => {
      // Cleanup when component unmounts or location changes
      if (isGoogleCallback) {
        console.log("🧹 Cleaning up OAuth processing flag");
        sessionStorage.removeItem("google_oauth_processing");
      }
    };
  }, [location.pathname]);

  return {
    isGoogleCallback: location.pathname === "/auth/google/callback",
    isProcessing: sessionStorage.getItem("google_oauth_processing") === "true",
  };
};

/**
 * Check if Google OAuth is currently being processed
 */
export const isGoogleOAuthProcessing = (): boolean => {
  return sessionStorage.getItem("google_oauth_processing") === "true";
};

/**
 * Clear Google OAuth processing flag
 */
export const clearGoogleOAuthProcessing = (): void => {
  sessionStorage.removeItem("google_oauth_processing");
  console.log("🧹 Cleared Google OAuth processing flag");
};
