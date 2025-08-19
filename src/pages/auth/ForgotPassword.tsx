import { Link } from "react-router-dom";
import { AuthContainer } from "../../components/auth-container";
import LayoutAuth from "../../components/layout/LayoutAuth";

export default function ForgotPassword() {
  return (
    <LayoutAuth>
      <AuthContainer>
        <h2 className="mb-2 text-2xl font-bold">Forgot Password</h2>
        <p className="mb-6 text-gray-600">
          Enter the email address registered with your account. We&apos;ll send
          you a link to reset your password.
        </p>
        <form className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="block font-medium">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              defaultValue="saipul@gmail.com"
              className="w-full px-4 py-3 bg-gray-100 rounded-md"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 font-medium text-white bg-blue-800 rounded-md hover:bg-blue-900"
          >
            Submit
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
