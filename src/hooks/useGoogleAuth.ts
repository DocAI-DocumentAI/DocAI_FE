import { useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { GoogleAuthService } from "../services/googleAuthService";
import {
  googleAuthStart,
  googleAuthSuccess,
  googleAuthFailure,
  clearError,
} from "../store/slices/authSlice";
import { RootState } from "../store";
import { User } from "../types/User";

interface UseGoogleAuthReturn {
  isLoading: boolean;
  error: string | null;
  initiateGoogleLogin: () => Promise<void>;
  handleGoogleCallback: () => Promise<User | null>;
  clearAuthError: () => void;
}

export const useGoogleAuth = (): UseGoogleAuthReturn => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state: RootState) => state.auth);
  const [localLoading, setLocalLoading] = useState(false);

  const isLoading = loading || localLoading;

  /**
   * Initiate Google OAuth login flow
   */
  const initiateGoogleLogin = useCallback(async () => {
    try {
      dispatch(googleAuthStart());
      setLocalLoading(true);

      // Get Google OAuth URL
      const { authUrl } = await GoogleAuthService.getGoogleAuthUrl();

      // Redirect to Google
      GoogleAuthService.redirectToGoogle(authUrl);
    } catch (error: any) {
      const errorMessage = error.message || "Failed to initiate Google login";
      dispatch(googleAuthFailure(errorMessage));
      setLocalLoading(false);
      throw error;
    }
  }, [dispatch]);

  /**
   * Handle Google OAuth callback
   */
  const handleGoogleCallback = useCallback(async (): Promise<User | null> => {
    try {
      dispatch(googleAuthStart());

      // Check for OAuth error in URL
      const urlError = GoogleAuthService.extractErrorFromUrl();
      if (urlError) {
        throw new Error(`OAuth error: ${urlError}`);
      }

      // Extract authorization code from URL
      const code = GoogleAuthService.extractCodeFromUrl();
      if (!code) {
        throw new Error("No authorization code found in URL");
      }

      // Exchange code for user data
      const userData = await GoogleAuthService.exchangeAuthCode(code);

      // Store user data in localStorage
      localStorage.setItem("token", userData.docaiToken);
      localStorage.setItem("user", JSON.stringify(userData));

      // Update Redux state
      dispatch(googleAuthSuccess(userData));

      // Clean URL parameters
      GoogleAuthService.cleanUrlParams();

      return userData;
    } catch (error: any) {
      const errorMessage =
        error.message || "Failed to complete Google authentication";
      dispatch(googleAuthFailure(errorMessage));

      // Clean URL parameters even on error
      GoogleAuthService.cleanUrlParams();

      throw error;
    }
  }, [dispatch]);

  /**
   * Navigate user based on their role
   */
  const navigateByRole = useCallback(
    (user: User) => {
      switch (user.role?.roleName) {
        case "Editor":
          navigate("/editor/view-draft");
          break;
        case "Manager":
          navigate("/manager/approvalQueue");
          break;
        case "Admin":
          navigate("/admin/dashboard");
          break;
        default:
          navigate("/");
          break;
      }
    },
    [navigate]
  );

  /**
   * Complete Google OAuth flow with navigation
   */
  const completeGoogleAuth = useCallback(async () => {
    try {
      const userData = await handleGoogleCallback();
      if (userData) {
        // Small delay to show success state
        setTimeout(() => {
          navigateByRole(userData);
        }, 1500);
      }
      return userData;
    } catch (error) {
      // Redirect to login page on error
      setTimeout(() => {
        navigate("/login");
      }, 3000);
      throw error;
    }
  }, [handleGoogleCallback, navigateByRole, navigate]);

  /**
   * Clear authentication error
   */
  const clearAuthError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  return {
    isLoading,
    error,
    initiateGoogleLogin,
    handleGoogleCallback: completeGoogleAuth,
    clearAuthError,
  };
};

export default useGoogleAuth;
