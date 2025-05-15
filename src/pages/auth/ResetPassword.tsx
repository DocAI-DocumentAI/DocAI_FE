import { AuthContainer } from "../../components/auth-container";
import LayoutAuth from "../../components/layout/layoutAuth";


export default function ResetPassword() {
  return (
    <LayoutAuth>
      <AuthContainer>
        <h2 className="mb-2 text-2xl font-bold">Reset Password</h2>
        <p className="mb-6 text-xs text-gray-600">
          Don&apos;t use a password that&apos;s difficult to guess, it&apos;ll be a hassle to be a person.
        </p>
        <form className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="newPassword" className="block text-sm font-medium">
              New password
            </label>
            <input
              type="password"
              id="newPassword"
              name="newPassword"
              defaultValue="••••••••••••••••••••"
              className="w-full rounded-md bg-gray-100 px-4 py-3"
              required
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="block text-sm font-medium">
              Confirm new password
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              defaultValue="••••••••••••••••••••"
              className="w-full rounded-md bg-gray-100 px-4 py-3"
              required
            />
          </div>
          <button type="submit" className="w-full rounded-md bg-blue-800 py-3 font-medium text-white hover:bg-blue-900">
            Reset
          </button>
        </form>
      </AuthContainer>
    </LayoutAuth>
  )
}
