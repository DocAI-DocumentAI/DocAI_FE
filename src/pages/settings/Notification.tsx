"use client"

import { useState, useEffect } from "react"
import { updateSettings } from "../../lib/api/setting"
import toast from 'react-hot-toast'

interface UserInfo {
    userId: string;
    email: string;
    fullName: string;
    phone: string;
    userSetting: {
        twoFactorEnabled: boolean;
        twoFactorMethod: string;
        notificationsEnabled: boolean;
    };
}

export default function NotificationSettings() {
    const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
    const [email, setEmail] = useState("")
    const [notificationsEnabled, setNotificationsEnabled] = useState(true)
    const [receiveUpdates, setReceiveUpdates] = useState(true)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        // Load user info from localStorage
        const userData = localStorage.getItem('user')
        if (userData) {
            try {
                const user: UserInfo = JSON.parse(userData)
                setUserInfo(user)
                setEmail(user.email)
                if (user.userSetting) {
                    setNotificationsEnabled(user.userSetting.notificationsEnabled)
                }
            } catch (error) {
                console.error('Error parsing user data:', error)
                toast.error('Failed to load user information')
            }
        }
    }, [])

    const handleUpdatePreferences = async () => {
        if (!userInfo) {
            toast.error('User information not found')
            return
        }

        setLoading(true)
        try {
            // Update settings with current user's other settings preserved
            await updateSettings({
                twoFactorEnabled: userInfo.userSetting.twoFactorEnabled,
                twoFactorMethod: userInfo.userSetting.twoFactorMethod,
                notificationsEnabled
            })

            // Update localStorage
            const updatedUser = {
                ...userInfo,
                userSetting: {
                    ...userInfo.userSetting,
                    notificationsEnabled
                }
            }
            localStorage.setItem('user', JSON.stringify(updatedUser))
            setUserInfo(updatedUser)

            toast.success('Notification preferences updated successfully!')
        } catch (error: any) {
            toast.error(`Failed to update preferences: ${error?.response?.data?.message || error.message}`)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div>
            <h1 className="mb-6 text-2xl font-semibold">Notification Preferences</h1>

            {userInfo && (
                <div className="mb-6 rounded-md bg-gray-50 p-4">
                    <h3 className="mb-2 font-medium text-gray-700">Current Account</h3>
                    <div className="space-y-1 text-sm text-gray-600">
                        <p><span className="font-medium">Name:</span> {userInfo.fullName}</p>
                        <p><span className="font-medium">Email:</span> {userInfo.email}</p>
                        <p><span className="font-medium">Current Status:</span> 
                            <span className={`ml-2 px-2 py-1 text-xs rounded ${
                                userInfo.userSetting.notificationsEnabled 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-red-100 text-red-800'
                            }`}>
                                {userInfo.userSetting.notificationsEnabled ? 'Enabled' : 'Disabled'}
                            </span>
                        </p>
                    </div>
                </div>
            )}

            <div className="mb-6">
                <label htmlFor="email" className="mb-2 block font-medium">
                    Email to notify
                </label>
                <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full max-w-md rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    disabled
                />
                <p className="mt-1 text-xs text-gray-500">
                    Receive all notifications through this email (read-only, change in Account settings)
                </p>
            </div>

            <div className="mb-6">
                <label htmlFor="notification" className="mb-2 block font-medium">
                    Enable notifications
                </label>
                <select
                    id="notification"
                    value={notificationsEnabled ? "Enable" : "Disable"}
                    onChange={(e) => setNotificationsEnabled(e.target.value === "Enable")}
                    className="w-full max-w-md rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                    <option value="Enable">Enable</option>
                    <option value="Disable">Disable</option>
                </select>
                <p className="mt-1 text-xs text-gray-500">
                    Allow the system to send you notifications about document activities
                </p>
            </div>

            <div className="mb-6">
                <div className="flex items-center">
                    <input
                        type="checkbox"
                        id="updates"
                        checked={receiveUpdates}
                        onChange={(e) => setReceiveUpdates(e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="updates" className="ml-2 block text-sm font-medium">
                        Receive notification on new updates
                    </label>
                </div>
                <p className="ml-6 mt-1 text-xs text-gray-500">
                    When new features or system updates are available, you will be notified
                </p>
            </div>

            <div className="rounded-lg border border-gray-200 bg-blue-50 p-4 mb-6">
                <h3 className="font-medium text-blue-900 mb-2">Notification Types</h3>
                <div className="space-y-2 text-sm text-blue-800">
                    <p>• Document approval/rejection notifications</p>
                    <p>• Review reminders and deadlines</p>
                    <p>• System maintenance and updates</p>
                    <p>• Security alerts and account changes</p>
                </div>
            </div>

            <button 
                onClick={handleUpdatePreferences}
                disabled={loading}
                className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
                {loading ? 'Updating...' : 'Update preferences'}
            </button>
        </div>
    )
}
