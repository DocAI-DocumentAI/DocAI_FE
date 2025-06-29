 

import { useState } from "react"

export default function NotificationsSettings() {
  const [email, setEmail] = useState("example@gmail.com")
  const [notificationEnabled, setNotificationEnabled] = useState("Enable")
  const [receiveUpdates, setReceiveUpdates] = useState(true)

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">Notification</h1>

      <div className="mb-6">
        <label htmlFor="email" className="mb-2 block font-medium">
          Email to notify
        </label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full max-w-md rounded-md border border-gray-300 px-3 py-2"
        />
        <p className="mt-1 text-xs text-gray-500">Receive all notification through this email</p>
      </div>

      <div className="mb-6">
        <label htmlFor="notification" className="mb-2 block font-medium">
          Enable notification
        </label>
        <select
          id="notification"
          value={notificationEnabled}
          onChange={(e) => setNotificationEnabled(e.target.value)}
          className="w-full max-w-md rounded-md border border-gray-300 px-3 py-2"
        >
          <option value="Enable">Enable</option>
          <option value="Disable">Disable</option>
        </select>
        <p className="mt-1 text-xs text-gray-500">Allow the system to notify you</p>
      </div>

      <div className="mb-6">
        <div className="flex items-center">
          <input
            type="checkbox"
            id="updates"
            checked={receiveUpdates}
            onChange={(e) => setReceiveUpdates(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300"
          />
          <label htmlFor="updates" className="ml-2 block text-sm">
            Receive notification on new update
          </label>
        </div>
        <p className="ml-6 mt-1 text-xs text-gray-500">
          When new update in the system, new feature will be notify to you
        </p>
      </div>

      <button className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium hover:bg-gray-50">
        Update preferences
      </button>
    </div>
  )
}
