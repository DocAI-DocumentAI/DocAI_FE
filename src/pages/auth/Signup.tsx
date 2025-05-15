import { Link } from "react-router-dom";
import { AuthContainer } from "../../components/auth-container"; 
import LayoutAuth from "../../components/layout/layoutAuth";

 

export default function SignUp() {
  return (
  <LayoutAuth>
      <AuthContainer>
        <h2 className="mb-6 text-2xl font-bold">Sign Up</h2>
        <form className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="fullName" className="block font-medium">
              Full Name
            </label>
            <div className="flex gap-4">
              <input
                type="text"
                id="firstName"
                name="firstName"
                defaultValue="Marcus"
                placeholder="First Name"
                className="w-full rounded-md bg-gray-100 px-4 py-3"
                required
              />
              <input
                type="text"
                id="lastName"
                name="lastName"
                defaultValue="Aurelius"
                placeholder="Last Name"
                className="w-full rounded-md bg-gray-100 px-4 py-3"
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <label htmlFor="email" className="block font-medium">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              defaultValue="aurelius@rocketmail.com"
              className="w-full rounded-md bg-gray-100 px-4 py-3"
              required
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="password" className="block font-medium">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              defaultValue="••••••••••••••••••••"
              className="w-full rounded-md bg-gray-100 px-4 py-3"
              required
            />
          </div>
          <p className="text-xs text-gray-600">
            Dengan mendaftar berarti kamu setuju dengan{" "}
            <Link to="#" className="text-blue-600 hover:underline">
              Terms of Service
            </Link>{" "}
            dan{" "}
            <Link to="#" className="text-blue-600 hover:underline">
              Privacy Policy
            </Link>{" "}
            dari Namanyajugabelajar.io
          </p>
          <button type="submit" className="w-full rounded-md bg-blue-800 py-3 font-medium text-white hover:bg-blue-900">
            Sign Up
          </button>
        </form>
        <p className="mt-6 text-center text-sm">
          Have an Account?{" "}
          <Link to="/login" className="text-blue-600 hover:underline">
            Login
          </Link>
        </p>
      </AuthContainer>
  </LayoutAuth>
  )
}
