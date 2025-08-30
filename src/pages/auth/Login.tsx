import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { AuthContainer } from "../../components/auth-container";
import LayoutAuth from "../../components/layout/LayoutAuth";
import { useForm } from "react-hook-form";
import { authApi } from "../../lib/api/auth";
import { sendOtp, checkOtp } from "../../lib/api/setting";
import GoogleLoginButton from "../../components/GoogleLoginButton";
import { toast } from "react-hot-toast";
import { loginSuccess } from "../../store/slices/authSlice";
import { Modal } from "antd";

export default function Login() {
  type FormValues = { email: string; password: string };
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<FormValues>();
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // 2FA Modal states
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [otpCode, setOtpCode] = useState<string[]>(Array(6).fill(""));
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResendingOTP, setIsResendingOTP] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [pendingLoginData, setPendingLoginData] = useState<any>(null);

  const emailValue = watch("email");

  // Countdown timer for resend OTP
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (countdown > 0) {
      interval = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [countdown]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const completeLogin = (data: any) => {
    localStorage.setItem("token", data.docaiToken);
    localStorage.setItem("user", JSON.stringify(data));
    localStorage.setItem("refreshToken", data.docaiRefreshToken)

    // Update Redux state
    dispatch(loginSuccess(data));

    switch (data.role?.roleName) {
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
  };

  const onSubmit = async (values: FormValues) => {
    setLoading(true);
    setError("");
    try {
      const data = await authApi.login({
        email: values.email,
        password: values.password,
      });

      // Check if 2FA is required
      if (data.userSetting?.twoFactorEnabled) {
        // Store pending login data
        setPendingLoginData(data);

        // Send OTP for 2FA
        try {
          await sendOtp({ email: values.email });
          toast.success("2FA required. OTP sent to your email!");

          // Show 2FA modal
          setShow2FAModal(true);
          setCountdown(120); // 2 minutes countdown
        } catch (otpError: any) {
          console.error("Failed to send OTP:", otpError);
          toast.error("Failed to send OTP. Please try again.");
          setError("Failed to send OTP");
        }
      } else {
        // No 2FA required, proceed with login
        completeLogin(data);
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  // 2FA OTP Handlers
  const handleOTPChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value[0];
    }

    const newCode = [...otpCode];
    newCode[index] = value;
    setOtpCode(newCode);

    // Auto focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleOTPKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !otpCode[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleOTPPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "");

    if (pastedData.length >= 6) {
      const newCode = pastedData.slice(0, 6).split("");
      setOtpCode([...newCode, ...Array(6 - newCode.length).fill("")]);
      toast.success("OTP pasted successfully!");
    }
  };

  const handleVerify2FA = async () => {
    const code = otpCode.join("");

    if (code.length !== 6) {
      toast.error("Please enter the complete 6-digit code");
      return;
    }

    setIsVerifying(true);

    try {
      // Verify OTP
      await checkOtp({
        email: emailValue,
        otp: code,
        removeAfterValidation: true,
      });

      // Complete login with pending data
      completeLogin(pendingLoginData);

      // Close modal and reset states
      setShow2FAModal(false);
      setOtpCode(Array(6).fill(""));
      setPendingLoginData(null);
      setCountdown(0);
    } catch (error: any) {
      console.error("2FA verification error:", error);
      const errorMessage = "Invalid OTP. Please try again.";
      toast.error(errorMessage);

      // Clear OTP on error
      setOtpCode(Array(6).fill(""));
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendOTP = async () => {
    if (countdown > 0) {
      toast.error(
        `Please wait ${formatTime(countdown)} before requesting a new OTP`
      );
      return;
    }

    setIsResendingOTP(true);

    try {
      await sendOtp({ email: emailValue });
      toast.success("OTP sent successfully! Please check your email.");
      setOtpCode(Array(6).fill(""));
      setCountdown(120);
    } catch (error: any) {
      console.error("Resend OTP error:", error);
      const errorMessage = "Failed to resend OTP";
      toast.error(errorMessage);
    } finally {
      setIsResendingOTP(false);
    }
  };

  const handleCancel2FA = () => {
    setShow2FAModal(false);
    setOtpCode(Array(6).fill(""));
    setPendingLoginData(null);
    setCountdown(0);
    toast.error("Login cancelled");
  };

  const handleGoogleLoading = (isLoading: boolean) => {
    setGoogleLoading(isLoading);
  };

  const handleGoogleError = (errorMessage: string) => {
    setError(errorMessage);
    toast.error(errorMessage);
  };

  const isFormDisabled = loading || googleLoading;

  return (
    <LayoutAuth>
      <AuthContainer>
        <h2 className="mb-6 text-2xl font-bold">Login</h2>

        {/* Google Login Button */}
        <div className="mb-6">
          <GoogleLoginButton
            onLoading={handleGoogleLoading}
            onError={handleGoogleError}
            disabled={isFormDisabled}
          />
        </div>

        {/* Divider */}
        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 text-gray-500 bg-white">
              Or continue with email
            </span>
          </div>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-2">
            <label htmlFor="email" className="block font-medium">
              Email
            </label>
            <input
              type="text"
              id="email"
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Email không hợp lệ",
                },
              })}
              className="w-full px-4 py-3 bg-gray-100 rounded-md"
              disabled={isFormDisabled}
            />
            {errors.email && typeof errors.email.message === "string" && (
              <div className="text-sm text-red-600">{errors.email.message}</div>
            )}
          </div>
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="block font-medium">
              Password
            </label>
            <Link
              to="/forgot-password"
              className="text-sm text-blue-600 hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <input
            type="password"
            id="password"
            {...register("password", { required: "Password is required" })}
            className="w-full px-4 py-3 bg-gray-100 rounded-md"
            disabled={isFormDisabled}
          />
          {errors.password && typeof errors.password.message === "string" && (
            <div className="text-sm text-red-600">
              {errors.password.message}
            </div>
          )}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="remember"
              name="remember"
              className="w-4 h-4 border-gray-300 rounded"
              disabled={isFormDisabled}
            />
            <label htmlFor="remember" className="block ml-2 text-sm">
              Keep me sign in
            </label>
          </div>
          {error && <div className="text-sm text-red-600">{error}</div>}
          <button
            type="submit"
            className="w-full py-3 font-medium text-white bg-blue-800 rounded-md hover:bg-blue-900 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isFormDisabled}
          >
            {loading
              ? "Logging in..."
              : googleLoading
                ? "Please wait..."
                : "Login"}
          </button>
        </form>
        {/* <p className="mt-6 text-sm text-center">
          Don&apos;t have an Account?{" "}
          <Link to="/signup" className="text-blue-600 hover:underline">
            Sign up here
          </Link>
        </p> */}
      </AuthContainer>

      {/* 2FA Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <svg
              className="w-5 h-5 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
            <span>Two-Factor Authentication</span>
          </div>
        }
        open={show2FAModal}
        onCancel={handleCancel2FA}
        footer={null}
        closable={true}
        width={480}
        centered
      >
        <div className="py-4">
          <p className="text-gray-600 mb-4">
            For security, we've sent a 6-digit code to{" "}
            <strong>{emailValue}</strong>. Please enter it below to complete your
            login.
          </p>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-3">
              Enter 6-digit code
            </label>
            <div className="flex justify-between gap-2">
              {Array(6)
                .fill(0)
                .map((_, index) => (
                  <input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    maxLength={1}
                    value={otpCode[index]}
                    onChange={(e) => handleOTPChange(index, e.target.value)}
                    onKeyDown={(e) => handleOTPKeyDown(index, e)}
                    onPaste={handleOTPPaste}
                    disabled={isVerifying}
                    className="text-xl text-center border border-gray-300 rounded-md h-12 w-12 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                  />
                ))}
            </div>
          </div>

          <button
            onClick={handleVerify2FA}
            disabled={isVerifying || otpCode.join("").length !== 6}
            className="w-full py-3 font-medium text-white bg-blue-800 rounded-md hover:bg-blue-900 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center mb-4"
          >
            {isVerifying ? (
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
              "Verify & Sign In"
            )}
          </button>

          <div className="text-center">
            <p className="text-sm mb-2">
              Didn't receive the code?{" "}
              {countdown > 0 ? (
                <span className="text-gray-500">
                  Resend in {formatTime(countdown)}
                </span>
              ) : (
                <button
                  onClick={handleResendOTP}
                  disabled={isResendingOTP || isVerifying}
                  className="text-blue-600 hover:underline disabled:text-gray-400 disabled:cursor-not-allowed"
                >
                  {isResendingOTP ? "Sending..." : "Resend OTP"}
                </button>
              )}
            </p>
          </div>
        </div>
      </Modal>
    </LayoutAuth>
  );
}
