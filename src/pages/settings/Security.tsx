 

import { useState } from "react" 
import { Link } from "react-router-dom"
export default function SecuritySettings() {
  const [email, setEmail] = useState("example@gmail.com")
  const [phone, setPhone] = useState("")
  const [enable2FA, setEnable2FA] = useState(true)

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">Account security</h1>

      <div className="mb-6">
        <label htmlFor="email" className="mb-2 block font-medium">
          Email
        </label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full max-w-md rounded-md border border-gray-300 px-3 py-2"
        />
      </div>

      <div className="mb-6">
        <label htmlFor="phone" className="mb-2 block font-medium">
          Phone number
        </label>
        <input
          type="tel"
          id="phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full max-w-md rounded-md border border-gray-300 px-3 py-2"
          placeholder="+1 (555) 123-4567"
        />
      </div>

      <div className="mb-6">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="2fa"
            checked={enable2FA}
            onChange={(e) => setEnable2FA(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300"
          />
          <label htmlFor="2fa" className="ml-2 block text-sm">
            Enable 2FA
          </label>
        </div>
      </div>

      <div className="mb-6">
        <Link to="/reset-password" className="text-sm text-red-600 hover:underline">
          Reset password
        </Link>
      </div>

      <button className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium hover:bg-gray-50">
        Update
      </button>
    </div>
  )
}
