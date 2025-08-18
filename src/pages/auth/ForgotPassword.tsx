import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContainer } from "../../components/auth-container";
import LayoutAuth from "../../components/layout/LayoutAuth";
import { sendOtp } from "../../lib/api/setting";
import toast from "react-hot-toast";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsLoading(true);

    try {
      await sendOtp({ email });
      toast.success("OTP sent successfully! Please check your email.");

      // Navigate to verify email page with email state
      navigate("/verify-email", {
        state: {
          email: email,
          from: "forgot-password",
        },
      });
    } catch (error: any) {
      console.error("Send OTP error:", error);
      const errorMessage =
        error?.response?.data?.message || error.message || "Failed to send OTP";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LayoutAuth>
      <AuthContainer>
        <h2 className="mb-2 text-2xl font-bold">Forgot Password</h2>
        <p className="mb-6 text-gray-600">
          Enter the email address registered with your account. We&apos;ll send
          you an OTP to reset your password.
        </p>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label htmlFor="email" className="block font-medium">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              className="w-full px-4 py-3 bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
              required
              disabled={isLoading}
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
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
                Sending OTP...
              </>
            ) : (
              "Send OTP"
            )}
          </button>
        </form>
        <p className="mt-6 text-sm text-center">
          Remembered password?{" "}
          <Link to="/login" className="text-blue-600 hover:underline">
            Login
          </Link>
        </p>
      </AuthContainer>
    </LayoutAuth>
  );
}
