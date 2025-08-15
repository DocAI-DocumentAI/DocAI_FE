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
          } else if (roleName === "Manager") {
            console.log("Navigating to manager dashboard");
            navigate("/manager/approvalQueue");
          } else if (roleName === "Editor") {
            console.log("Navigating to editor dashboard");
            navigate("/editor/view-draft");
          } else {
            console.log("Navigating to home page");
            navigate("/");
          }
        }, 2000);
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
        console.log("Will redirect to login in 4 seconds...");
        setTimeout(() => {
          console.log("Redirecting to login page...");
          navigate("/login");
        }, 4000);
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
          <div className="space-y-6 text-center">
            {/* Animated Logo/Icon */}
            <div className="relative">
              <div className="relative w-20 h-20 mx-auto mb-6">
                <div className="absolute inset-0 border-4 border-blue-200 rounded-full animate-pulse"></div>
                <div className="absolute inset-0 border-4 rounded-full border-t-blue-600 border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
                <div className="absolute flex items-center justify-center rounded-full inset-3 bg-gradient-to-br from-blue-500 to-blue-600">
                  <svg
                    className="w-8 h-8 text-white animate-bounce"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="space-y-3">
              <h2 className="text-2xl font-bold text-transparent text-gray-800 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text">
                Completing Google Sign In
              </h2>
              <div className="space-y-2">
                <p className="text-gray-600">
                  Please wait while we verify your account...
                </p>
                <div className="flex justify-center space-x-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                </div>
              </div>
            </div>
          </div>
        );

      case "success":
        return (
          <div className="space-y-6 text-center animate-fade-in">
            {/* Success Icon */}
            <div className="relative">
              <div className="flex items-center justify-center w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-green-400 to-green-600 animate-scale-in">
                <svg
                  className="w-10 h-10 text-white animate-check-mark"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <div className="absolute bg-green-200 rounded-full opacity-25 -inset-2 animate-ping"></div>
            </div>

            {/* Content */}
            <div className="space-y-3">
              <h2 className="text-2xl font-bold text-transparent text-gray-800 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text">
                Welcome Back!
              </h2>
              <p className="text-gray-600">
                Sign in successful. Redirecting you to your dashboard...
              </p>
              <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-green-500 to-emerald-500 animate-progress"></div>
              </div>
            </div>
          </div>
        );

      case "error":
        return (
          <div className="space-y-6 text-center animate-fade-in">
            {/* Error Icon */}
            <div className="relative">
              <div className="flex items-center justify-center w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-red-400 to-red-600 animate-shake">
                <svg
                  className="w-10 h-10 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
            </div>

            {/* Content */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-transparent text-gray-800 bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text">
                Oops! Something went wrong
              </h2>
              <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                <p className="font-medium text-red-700">{errorMessage}</p>
              </div>
              <p className="text-gray-600">
                Don't worry, we're redirecting you back to try again...
              </p>
              <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-red-500 to-pink-500 animate-progress-slow"></div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute bg-blue-200 rounded-full -top-40 -right-40 w-80 h-80 mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute bg-purple-200 rounded-full -bottom-40 -left-40 w-80 h-80 mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute bg-indigo-200 rounded-full top-40 left-1/2 w-80 h-80 mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      {/* Main card */}
      <div className="relative w-full max-w-md">
        <div className="p-8 transition-all duration-300 transform border shadow-2xl bg-white/80 backdrop-blur-lg rounded-2xl border-white/20 hover:shadow-3xl">
          {/* Glass effect overlay */}
          <div className="absolute inset-0 pointer-events-none rounded-2xl bg-gradient-to-br from-white/10 to-white/5"></div>

          {/* Content */}
          <div className="relative z-10">{renderContent()}</div>
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes scale-in {
          from {
            transform: scale(0);
          }
          to {
            transform: scale(1);
          }
        }

        @keyframes check-mark {
          0% {
            stroke-dasharray: 0 50;
          }
          100% {
            stroke-dasharray: 50 0;
          }
        }

        @keyframes shake {
          0%, 100% {
            transform: translateX(0);
          }
          10%, 30%, 50%, 70%, 90% {
            transform: translateX(-2px);
          }
          20%, 40%, 60%, 80% {
            transform: translateX(2px);
          }
        }

        @keyframes progress {
          from {
            transform: translateX(-100%);
          }
          to {
            transform: translateX(100%);
          }
        }

        @keyframes progress-slow {
          from {
            transform: translateX(-100%);
          }
          to {
            transform: translateX(100%);
          }
        }

        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }

        .animate-scale-in {
          animation: scale-in 0.5s ease-out;
        }

        .animate-check-mark {
          animation: check-mark 0.8s ease-in-out;
        }

        .animate-shake {
          animation: shake 0.8s ease-in-out;
        }

        .animate-progress {
          animation: progress 2s ease-in-out;
        }

        .animate-progress-slow {
          animation: progress-slow 4s ease-in-out;
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }

        .shadow-3xl {
          box-shadow: 0 35px 60px -12px rgba(0, 0, 0, 0.25);
        }
      `}</style>
    </div>
  );
};

export default GoogleCallback;
