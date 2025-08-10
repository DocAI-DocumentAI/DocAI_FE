import React, { useState } from "react";
import { GoogleAuthService } from "../services/googleAuthService";
import { GoogleLoginButtonProps } from "../types/GoogleOAuth";

const GoogleLoginButton: React.FC<GoogleLoginButtonProps> = ({
  onLoading,
  onError,
  disabled = false,
  className = "",
  children,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = async () => {
    if (disabled || isLoading) return;

    setIsLoading(true);
    onLoading?.(true);

    try {
      console.log("🔍 Google Login Debug Info:");
      console.log("Current URL:", window.location.href);
      console.log("API Base URL:", "https://production.docai.asia/api");
      console.log("Environment:", import.meta.env.MODE);

      // Get Google OAuth URL from the API
      const { authUrl } = await GoogleAuthService.getGoogleAuthUrl();

      console.log("✅ Received auth URL:", authUrl);

      // Parse and log the auth URL details
      const url = new URL(authUrl);
      console.log("Auth URL Details:");
      console.log("  - Host:", url.host);
      console.log("  - Client ID:", url.searchParams.get("client_id"));
      console.log("  - Redirect URI:", url.searchParams.get("redirect_uri"));
      console.log("  - Scope:", url.searchParams.get("scope"));

      // Redirect to Google OAuth
      GoogleAuthService.redirectToGoogle(authUrl);
    } catch (error: any) {
      console.error("❌ Google Login Error:", error);
      console.error("Error details:", {
        message: error.message,
        status: error.status,
        response: error.response?.data,
      });

      const errorMessage = error.message || "Failed to initiate Google login";
      onError?.(errorMessage);
      setIsLoading(false);
      onLoading?.(false);
    }
  };

  const defaultContent = (
    <div className="flex items-center justify-center space-x-2">
      <svg
        className="w-5 h-5"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fill="#4285F4"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        />
        <path
          fill="#34A853"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <path
          fill="#FBBC05"
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        />
        <path
          fill="#EA4335"
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        />
      </svg>
      <span>{isLoading ? "Connecting..." : "Continue with Google"}</span>
    </div>
  );

  return (
    <button
      onClick={handleGoogleLogin}
      disabled={disabled || isLoading}
      className={`
        w-full py-3 px-4 border border-gray-300 rounded-md 
        bg-white text-gray-700 font-medium
        hover:bg-gray-50 hover:border-gray-400
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
        disabled:opacity-50 disabled:cursor-not-allowed
        transition-colors duration-200
        ${className}
      `}
      type="button"
    >
      {children || defaultContent}
    </button>
  );
};

export default GoogleLoginButton;
