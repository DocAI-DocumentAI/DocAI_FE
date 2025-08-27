"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { updateProfile } from "../../lib/api/setting"
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

export default function AccountSettings() {
    const [fullName, setFullName] = useState("")
    const [email, setEmail] = useState("")
    const [phone, setPhone] = useState("")
    const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        // Load user info from localStorage
        const userData = localStorage.getItem('user')
        if (userData) {
            try {
                const user: UserInfo = JSON.parse(userData)
                setUserInfo(user)
                setFullName(user.fullName)
                setEmail(user.email)
                setPhone(user.phone)
            } catch (error) {
                console.error('Error parsing user data:', error)
                toast.error('Failed to load user information')
            }
        }
    }, [])

    const handleUpdateProfile = async () => {
        if (!fullName.trim()) {
            toast.error('Please enter your full name')
            return
        }

        if (!email.trim()) {
            toast.error('Please enter your email')
            return
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
            toast.error('Please enter a valid email address')
            return
        }

        setLoading(true)
        try {
            await updateProfile({
                fullName: fullName.trim(),
                email: email.trim(),
                phone: phone.trim()
            })

            // Update localStorage with new info
            if (userInfo) {
                const updatedUser = {
                    ...userInfo,
                    fullName: fullName.trim(),
                    email: email.trim(),
                    phone: phone.trim()
                }
                localStorage.setItem('user', JSON.stringify(updatedUser))
                setUserInfo(updatedUser)
            }

            toast.success('Profile updated successfully!')
        } catch (error: any) {
            toast.error(`Failed to update profile: ${error?.response?.data?.message || error.message}`)
        } finally {
            setLoading(false)
        }
    }

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(word => word.charAt(0))
            .join('')
            .toUpperCase()
            .substring(0, 2)
    }

    return (
        <div>
            <h1 className="mb-6 text-2xl font-semibold">Public profile</h1>
            <div className="mb-8 grid grid-cols-1 gap-8 md:grid-cols-3">
                <div className="col-span-2">
                    <div className="mb-6">
                        <label htmlFor="fullName" className="mb-2 block font-medium">
                            Full Name
                        </label>
                        <input
                            type="text"
                            id="fullName"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder="Enter your full name"
                        />
                        <p className="mt-1 text-xs text-gray-500">
                            Your name may appear around Docs+AI where you contribute or are mentioned. You can update it at any time.
                        </p>
                    </div>

                    <div className="mb-6">
                        <label htmlFor="email" className="mb-2 block font-medium">
                            Email Address
                        </label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder="Enter your email address"
                        />
                        <p className="mt-1 text-xs text-gray-500">
                            Your email address is used for account notifications and login. Make sure it's a valid email you have access to.
                        </p>
                    </div>

                    <div className="mb-6">
                        <label htmlFor="phone" className="mb-2 block font-medium">
                            Phone Number
                        </label>
                        <input
                            type="tel"
                            id="phone"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder="Enter your phone number"
                        />
                        <p className="mt-1 text-xs text-gray-500">
                            Optional. Your phone number can be used for two-factor authentication and important account notifications.
                        </p>
                    </div>

                  

                    <p className="mb-4 text-xs text-gray-500">
                        All of the fields on this page are optional and can be deleted at any time, and by filling them out,
                        you&apos;re giving us consent to share this data wherever your user profile appears. Please see our{" "}
                        <Link to="/privacy" className="text-blue-600 hover:underline">
                            privacy statement
                        </Link>{" "}
                        to learn more about how we use this information.
                    </p>

                    <button 
                        onClick={handleUpdateProfile}
                        disabled={loading}
                        className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Updating...' : 'Update profile'}
                    </button>
                </div>

                <div>
                    <h2 className="mb-2 font-medium">Profile picture</h2>
                    <div className="relative h-40 w-40">
                        <div className="h-40 w-40 overflow-hidden rounded-full bg-gray-100">
                            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-400 to-blue-600 text-4xl font-bold text-white">
                                {fullName ? getInitials(fullName) : "U"}
                            </div>
                        </div>
                        <button className="absolute bottom-2 right-28 rounded-md bg-white px-3 py-1 text-sm font-medium shadow hover:bg-gray-50 border border-gray-200">
                            Edit
                        </button>
                    </div>
                    <p className="mt-2 text-xs text-gray-500">
                        Click edit to upload a new profile picture
                    </p>
                </div>
            </div>
        </div>
    )
}
