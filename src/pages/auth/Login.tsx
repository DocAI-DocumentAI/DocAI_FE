import { Link } from "react-router-dom";
import { AuthContainer } from "../../components/auth-container";
import LayoutAuth from "../../components/layout/layoutAuth";

 
export default function Login() {
  return (
    <LayoutAuth>
      <AuthContainer>
        <h2 className="mb-6 text-2xl font-bold">Login</h2>
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
              className="w-full rounded-md bg-gray-100 px-4 py-3"
              required
            />
          </div>
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="block font-medium">
              Password
            </label>
            <Link to="/forgot-password" className="text-sm text-blue-600 hover:underline">
              Forgot password?
            </Link>
          </div>
          <input
            type="password"
            id="password"
            name="password"
            defaultValue="••••••••••••••••••••"
            className="w-full rounded-md bg-gray-100 px-4 py-3"
            required
          />
          <div className="flex items-center">
            <input type="checkbox" id="remember" name="remember" className="h-4 w-4 rounded border-gray-300" />
            <label htmlFor="remember" className="ml-2 block text-sm">
              Keep me sign in
            </label>
          </div>
          <button type="submit" className="w-full rounded-md bg-blue-800 py-3 font-medium text-white hover:bg-blue-900">
            Login
          </button>
        </form>
        <p className="mt-6 text-center text-sm">
          Don&apos;t have an Account?{" "}
          <Link to="/signup" className="text-blue-600 hover:underline">
            Sign up here
          </Link>
        </p>
      </AuthContainer>
    </LayoutAuth>
  )
}
