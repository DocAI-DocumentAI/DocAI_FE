"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { updateSettings, changePassword } from "../../lib/api/setting"
import toast from 'react-hot-toast'

interface UserInfo {
    userId: string;
    email: string;
    fullName: string;
    phone: string;
    role: {
        roleName: string;
        description: string;
    };
    department: {
        name: string;
        description: string;
    };
    userSetting: {
        twoFactorEnabled: boolean;
        twoFactorMethod: string;
        notificationsEnabled: boolean;
    };
}

export default function SecuritySettings() {
    const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
    const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
    const [twoFactorMethod, setTwoFactorMethod] = useState("Email")
    const [notificationsEnabled, setNotificationsEnabled] = useState(true)
    const [settingsLoading, setSettingsLoading] = useState(false)
    
    // Password change states
    const [currentPassword, setCurrentPassword] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [passwordLoading, setPasswordLoading] = useState(false)

    useEffect(() => {
        // Load user info from localStorage
        const userData = localStorage.getItem('user')
        if (userData) {
            try {
                const user: UserInfo = JSON.parse(userData)
                setUserInfo(user)
                // Set initial values from userSetting
                if (user.userSetting) {
                    setTwoFactorEnabled(user.userSetting.twoFactorEnabled)
                    setTwoFactorMethod(user.userSetting.twoFactorMethod)
                    setNotificationsEnabled(user.userSetting.notificationsEnabled)
                }
            } catch (error) {
                console.error('Error parsing user data:', error)
                toast.error('Failed to load user information')
            }
        }
    }, [])

    const handleUpdateSettings = async () => {
        setSettingsLoading(true)
        try {
            await updateSettings({
                twoFactorEnabled,
                twoFactorMethod,
                notificationsEnabled
            })

            // Update localStorage with new settings
            if (userInfo) {
                const updatedUser = {
                    ...userInfo,
                    userSetting: {
                        ...userInfo.userSetting,
                        twoFactorEnabled,
                        twoFactorMethod,
                        notificationsEnabled
                    }
                }
                localStorage.setItem('user', JSON.stringify(updatedUser))
                setUserInfo(updatedUser)
            }

            toast.success('Security settings updated successfully!')
        } catch (error: any) {
            toast.error(`Failed to update settings: ${error?.response?.data?.message || error.message}`)
        } finally {
            setSettingsLoading(false)
        }
    }

    const handleChangePassword = async () => {
        setPasswordLoading(true)
        try {
            await changePassword({
                currentPassword: currentPassword,
                newPassword: newPassword
            })

            // Clear password fields
            setCurrentPassword("")
            setNewPassword("")
            setConfirmPassword("")

            toast.success('Password changed successfully!')
        } catch (error: any) {
            toast.error(`Failed to change password: ${error?.response?.data?.message || error.message}`)
        } finally {
            setPasswordLoading(false)
        }
    }

    return (
        <div>
            <h1 className="mb-6 text-2xl font-semibold">Account Security</h1>
            
            {/* Security Settings Section */}
            <div className="mb-8 rounded-lg border border-gray-200 bg-white p-6">
                <h2 className="mb-4 text-lg font-medium">Security Settings</h2>
                
                {userInfo && (
                    <div className="mb-6 rounded-md bg-gray-50 p-4">
                        <h3 className="mb-2 font-medium text-gray-700">Current Account</h3>
                        <div className="space-y-1 text-sm text-gray-600">
                            <p><span className="font-medium">Email:</span> {userInfo.email}</p>
                            <p><span className="font-medium">Role:</span> {userInfo.role.roleName}</p>
                            <p><span className="font-medium">Department:</span> {userInfo.department.name}</p>
                        </div>
                    </div>
                )}

                {/* Two-Factor Authentication */}
                <div className="mb-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="font-medium">Two-Factor Authentication</h3>
                            <p className="text-sm text-gray-500">
                                Add an extra layer of security to your account
                            </p>
                        </div>
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="twoFactor"
                                checked={twoFactorEnabled}
                                onChange={(e) => setTwoFactorEnabled(e.target.checked)}
                                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <label htmlFor="twoFactor" className="ml-2 text-sm">
                                {twoFactorEnabled ? 'Enabled' : 'Disabled'}
                            </label>
                        </div>
                    </div>
                    
                    {twoFactorEnabled && (
                        <div className="mt-4">
                            <label htmlFor="twoFactorMethod" className="mb-2 block text-sm font-medium">
                                Two-Factor Method
                            </label>
                            <select
                                id="twoFactorMethod"
                                value={twoFactorMethod}
                                onChange={(e) => setTwoFactorMethod(e.target.value)}
                                className="w-full max-w-xs rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            >
                                <option value="Email">Email</option>
                                {/* <option value="SMS">SMS</option>
                                <option value="Authenticator">Authenticator App</option> */}
                            </select>
                            <p className="mt-1 text-xs text-gray-500">
                                Choose how you want to receive your two-factor authentication codes
                            </p>
                        </div>
                    )}
                </div>

                {/* Notifications */}
                <div className="mb-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="font-medium">Security Notifications</h3>
                            <p className="text-sm text-gray-500">
                                Receive alerts about security events and important account changes
                            </p>
                        </div>
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="notifications"
                                checked={notificationsEnabled}
                                onChange={(e) => setNotificationsEnabled(e.target.checked)}
                                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <label htmlFor="notifications" className="ml-2 text-sm">
                                {notificationsEnabled ? 'Enabled' : 'Disabled'}
                            </label>
                        </div>
                    </div>
                </div>

                <button 
                    onClick={handleUpdateSettings}
                    disabled={settingsLoading}
                    className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                    {settingsLoading ? 'Updating...' : 'Update Security Settings'}
                </button>
            </div>

            {/* Change Password Section */}
            <div className="rounded-lg border border-gray-200 bg-white p-6">
                <h2 className="mb-4 text-lg font-medium">Change Password</h2>
                <p className="mb-6 text-sm text-gray-500">
                    Update your account password.
                </p>

                <div className="mb-4">
                    <label htmlFor="currentPassword" className="mb-2 block font-medium">
                        Current Password
                    </label>
                    <input
                        type="password"
                        id="currentPassword"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="w-full max-w-md rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="Enter your current password"
                    />
                </div>

                <div className="mb-4">
                    <label htmlFor="newPassword" className="mb-2 block font-medium">
                        New Password
                    </label>
                    <input
                        type="password"
                        id="newPassword"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full max-w-md rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="Enter your new password"
                    />
                </div>

                <div className="mb-6">
                    <label htmlFor="confirmPassword" className="mb-2 block font-medium">
                        Confirm New Password
                    </label>
                    <input
                        type="password"
                        id="confirmPassword"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full max-w-md rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="Confirm your new password"
                    />
                </div>

                <div className="flex items-center justify-between">
                    <button 
                        onClick={handleChangePassword}
                        disabled={passwordLoading}
                        className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        {passwordLoading ? 'Changing...' : 'Change Password'}
                    </button>
                    
                    {/* <Link 
                        to="/forgot-password" 
                        className="text-sm text-blue-600 hover:underline"
                    >
                        Forgot password?
                    </Link> */}
                </div>
            </div>
        </div>
    )
}
