import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleAuthService } from "../services/googleAuthService";
import { useDispatch } from "react-redux";
import {
  loginStart,
  loginSuccess,
  loginFailure,
} from "../store/slices/authSlice";
import {
  GoogleCallbackProps,
  GoogleOAuthFlowStatus,
} from "../types/GoogleOAuth";

const GoogleCallback: React.FC<GoogleCallbackProps> = ({
  onSuccess,
  onError,
}) => {
  console.log("GoogleCallback component rendered");
  console.log("Current URL:", window.location.href);

  const [status, setStatus] = useState<GoogleOAuthFlowStatus>("processing");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    console.log("GoogleCallback useEffect triggered");
    console.log("Current URL:", window.location.href);
    console.log("URL Protocol:", window.location.protocol);
    console.log("URL Host:", window.location.host);
    console.log("URL Search:", window.location.search);

    const handleCallback = async () => {
      console.log("Starting handleCallback");
      dispatch(loginStart());

      try {
        // Check for OAuth error in URL
        const error = GoogleAuthService.extractErrorFromUrl();
        if (error) {
          throw new Error(`OAuth error: ${error}`);
        }

        // Extract authorization code from URL
        const code = GoogleAuthService.extractCodeFromUrl();
        console.log("Extracted code:", code);
        if (!code) {
          throw new Error("No authorization code found in URL");
        }

        // Exchange code for user data
        console.log("Calling exchangeAuthCode with code:", code);
        console.log("API Base URL:", "https://production.docai.asia/api");

        const userData = await GoogleAuthService.exchangeAuthCode(code);
        console.log("Received userData:", userData);

        if (!userData) {
          throw new Error("No user data received from API");
        }

        if (!userData.docaiToken) {
          throw new Error("No token received from API");
        }

        // Store user data in localStorage
        localStorage.setItem("token", userData.docaiToken);
        localStorage.setItem("user", JSON.stringify(userData));

        // Update Redux state
        console.log("Updating Redux state...");
        dispatch(loginSuccess(userData));

        // Clean URL parameters
        console.log("Cleaning URL parameters...");
        GoogleAuthService.cleanUrlParams();

        console.log("Setting status to success...");
        setStatus("success");
        onSuccess?.(userData);

        // Navigate based on user role
        console.log("Preparing navigation...");
        setTimeout(() => {
          const roleName = userData.role?.roleName;
          console.log("User role:", roleName);
          console.log("Navigating based on role...");

          if (roleName === "Admin") {
            console.log("Navigating to admin dashboard");
            navigate("/admin/dashboard");
          } else {
            console.log("Navigating to home page");
            navigate("/");
          }
        }, 1500);
      } catch (error: any) {
        console.error("❌ Google authentication error:", error);
        console.error("Error details:", {
          message: error.message,
          status: error.status,
          response: error.response?.data,
          stack: error.stack,
        });

        const errorMsg =
          error.message || "Failed to complete Google authentication";
        console.log("Setting error message:", errorMsg);

        setErrorMessage(errorMsg);
        setStatus("error");
        dispatch(loginFailure(errorMsg));
        onError?.(errorMsg);

        // Clean URL parameters even on error
        console.log("Cleaning URL parameters after error...");
        GoogleAuthService.cleanUrlParams();

        // Redirect to login page after showing error
        console.log("Will redirect to login in 3 seconds...");
        setTimeout(() => {
          console.log("Redirecting to login page...");
          navigate("/login");
        }, 3000);
      }
    };

    handleCallback();

    // Fallback timeout - if nothing happens in 30 seconds, show error
    const timeoutId = setTimeout(() => {
      console.log("⏰ Timeout reached - showing error");
      setStatus("error");
      setErrorMessage("Authentication timeout. Please try again.");
    }, 30000);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [dispatch, navigate, onSuccess, onError]);

  const renderContent = () => {
    switch (status) {
      case "processing":
        return (
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-4 border-b-2 border-blue-600 rounded-full animate-spin"></div>
            <h2 className="mb-2 text-xl font-semibold text-gray-800">
              Completing Google Sign In...
            </h2>
            <p className="text-gray-600">
              Please wait while we verify your account.
            </p>
          </div>
        );

      case "success":
        return (
          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-green-100 rounded-full">
              <svg
                className="w-6 h-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="mb-2 text-xl font-semibold text-gray-800">
              Sign In Successful!
            </h2>
            <p className="text-gray-600">
              Redirecting you to your dashboard...
            </p>
          </div>
        );

      case "error":
        return (
          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
              <svg
                className="w-6 h-6 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h2 className="mb-2 text-xl font-semibold text-gray-800">
              Sign In Failed
            </h2>
            <p className="mb-4 text-red-600">{errorMessage}</p>
            <p className="text-gray-600">
              Redirecting you back to the login page...
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
        {renderContent()}
      </div>
    </div>
  );
};

export default GoogleCallback;
