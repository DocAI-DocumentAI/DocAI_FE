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
  const [status, setStatus] = useState<GoogleOAuthFlowStatus>("processing");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    console.log("GoogleCallback useEffect triggered");
    console.log("Current URL:", window.location.href);

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
        const userData = await GoogleAuthService.exchangeAuthCode(code);
        console.log("Received userData:", userData);

        // Store user data in localStorage
        localStorage.setItem("token", userData.docaiToken);
        localStorage.setItem("user", JSON.stringify(userData));

        // Update Redux state
        dispatch(loginSuccess(userData));

        // Clean URL parameters
        GoogleAuthService.cleanUrlParams();

        setStatus("success");
        onSuccess?.(userData);

        // Navigate based on user role
        setTimeout(() => {
          switch (userData.role?.roleName) {
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
        }, 1500);
      } catch (error: any) {
        const errorMsg =
          error.message || "Failed to complete Google authentication";
        setErrorMessage(errorMsg);
        setStatus("error");
        dispatch(loginFailure(errorMsg));
        onError?.(errorMsg);

        // Clean URL parameters even on error
        GoogleAuthService.cleanUrlParams();

        // Redirect to login page after showing error
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      }
    };

    handleCallback();
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
