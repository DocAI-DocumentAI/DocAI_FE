"use client";

import type React from "react";

import { useState, useRef, useEffect } from "react";
import { AuthContainer } from "../../components/auth-container";
import { Link, useLocation, useNavigate } from "react-router-dom";
import LayoutAuth from "../../components/layout/LayoutAuth";
import { checkOtp, sendOtp } from "../../lib/api/setting";
import toast from "react-hot-toast";

export default function VerifyEmail() {
  const [code, setCode] = useState<string[]>(Array(6).fill(""));
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(120); // 2 minutes in seconds
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email || "";
  const from = location.state?.from || "";

  // Redirect back if no email provided
  useEffect(() => {
    if (!email) {
      toast.error("Email not found. Please try again.");
      navigate("/forgot-password");
    }
  }, [email, navigate]);

  // Countdown timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (countdown > 0 && !canResend) {
      interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [countdown, canResend]);

  // Format countdown time as MM:SS
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value[0];
    }

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Move to next input if current one is filled
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    // Move to previous input on backspace if current is empty
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, ""); // Remove non-digits

    if (pastedData.length >= 6) {
      const newCode = pastedData.slice(0, 6).split("");
      setCode([...newCode, ...Array(6 - newCode.length).fill("")]);

      // Focus on the last filled input or the next empty one
      const nextIndex = Math.min(newCode.length, 5);
      inputRefs.current[nextIndex]?.focus();

      toast.success("OTP pasted successfully!");
    } else if (pastedData.length > 0) {
      toast.error("Please paste a complete 6-digit OTP code");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const otpCode = code.join("");

    if (otpCode.length !== 6) {
      toast.error("Please enter the complete 6-digit code");
      return;
    }

    setIsLoading(true);

    try {
      await checkOtp({
        email: email,
        otp: otpCode,
        removeAfterValidation: true,
      });

      toast.success("OTP verified successfully!");

      // Navigate to reset password page or login based on context
      if (from === "forgot-password") {
        navigate("/reset-password", {
          state: {
            email: email,
            otpVerified: true,
          },
        });
      } else {
        navigate("/login");
      }
    } catch (error: any) {
      console.error("OTP verification error:", error);
      const errorMessage =
        error?.response?.data?.message ||
        error.data ||
        "Invalid OTP. Please try again.";
      toast.error(errorMessage);

      // Clear the code on error
      setCode(Array(6).fill(""));
      inputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      toast.error("Email not found. Please try again.");
      return;
    }

    if (!canResend) {
      toast.error(
        `Please wait ${formatTime(countdown)} before requesting a new OTP`
      );
      return;
    }

    setIsResending(true);

    try {
      await sendOtp({ email });
      toast.success("OTP sent successfully! Please check your email.");

      // Clear current code and reset countdown
      setCode(Array(6).fill(""));
      setCountdown(120); // Reset to 2 minutes
      setCanResend(false);
      inputRefs.current[0]?.focus();
    } catch (error: any) {
      console.error("Resend OTP error:", error);
      const errorMessage =
        error?.response?.data?.message ||
        error.message ||
        "Failed to resend OTP";
      toast.error(errorMessage);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <LayoutAuth>
      <AuthContainer>
        <h2 className="mb-2 text-2xl font-bold">
          Please verify your email address
        </h2>
        <p className="mb-6 text-gray-600">
          We&apos;ve sent an OTP to <strong>{email}</strong>, please enter the
          code below.
        </p>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label htmlFor="code" className="block font-medium">
              Enter 6-digit code
            </label>
            <p className="text-sm text-gray-500 mb-3">
              You can paste the complete OTP code or enter it digit by digit
            </p>
            <div className="flex justify-between gap-2">
              {Array(6)
                .fill(0)
                .map((_, index) => (
                  <input
                    key={index}
                    ref={(el) => {
                      inputRefs.current[index] = el;
                    }}
                    type="text"
                    maxLength={1}
                    value={code[index]
                    }
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    disabled={isLoading}
                    className="text-xl text-center border border-gray-300 rounded-md h-14 w-14 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                ))}
            </div>
          </div>
          <button
            type="submit"
            disabled={isLoading || code.join("").length !== 6}
            className="w-full py-3 font-medium text-white bg-blue-800 rounded-md hover:bg-blue-900 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Verifying...
              </>
            ) : (
              "Verify OTP"
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm mb-2">
            Don&apos;t see your email?{" "}
            {canResend ? (
              <button
                onClick={handleResend}
                disabled={isResending || isLoading}
                className="text-blue-600 hover:underline disabled:text-gray-400 disabled:cursor-not-allowed"
              >
                {isResending ? "Sending..." : "Resend OTP"}
              </button>
            ) : (
              <span className="text-gray-500">
                Resend in {formatTime(countdown)}
              </span>
            )}
          </p>

          {!canResend && (
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
              <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span>Wait before requesting new OTP</span>
            </div>
          )}
        </div>

        <p className="mt-4 text-sm text-center">
          <Link to="/forgot-password" className="text-blue-600 hover:underline">
            Back to Forgot Password
          </Link>
        </p>
      </AuthContainer>
    </LayoutAuth>
  );
}
