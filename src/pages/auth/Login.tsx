import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContainer } from "../../components/auth-container";
import LayoutAuth from "../../components/layout/LayoutAuth";
import { useForm } from "react-hook-form";
import { authApi } from "../../lib/api/auth";

export default function Login() {
  type FormValues = { email: string; password: string };
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const onSubmit = async (values: FormValues) => {
    setLoading(true);
    setError("");
    try {
      const data = await authApi.login({
        email: values.email,
        password: values.password,
      });
      localStorage.setItem("token", data.docaiToken);
      localStorage.setItem("user", JSON.stringify(data));
      switch (data.role?.roleName) {
        case "Editor":
          navigate("/editor/view-draft");
          break;
        case "Manager":
          navigate("/manager/approvalQueue");
          break;
        default:
          navigate("/");
          break;
      }

      // Check role and redirect accordingly
      if (data.role?.roleName === "Admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/dashboard");
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <LayoutAuth>
      <AuthContainer>
        <h2 className="mb-6 text-2xl font-bold">Login</h2>
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
              disabled={loading}
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
            disabled={loading}
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
              disabled={loading}
            />
            <label htmlFor="remember" className="block ml-2 text-sm">
              Keep me sign in
            </label>
          </div>
          {error && <div className="text-sm text-red-600">{error}</div>}
          <button
            type="submit"
            className="w-full py-3 font-medium text-white bg-blue-800 rounded-md hover:bg-blue-900"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
        <p className="mt-6 text-sm text-center">
          Don&apos;t have an Account?{" "}
          <Link to="/signup" className="text-blue-600 hover:underline">
            Sign up here
          </Link>
        </p>
      </AuthContainer>
    </LayoutAuth>
  );
}
