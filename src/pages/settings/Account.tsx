"use client"

import { useState } from "react"
import { Link } from "react-router-dom"

export default function AccountSettings() {

    const [name, setName] = useState("Thomas D")
    const [emailVisibility, setEmailVisibility] = useState("Select a verified email to display")

    return (
        <div>
            <h1 className="mb-6 text-2xl font-semibold">Public profile</h1>
            <div className="mb-8 grid grid-cols-1 gap-8 md:grid-cols-3">
                <div className="col-span-2">
                    <div className="mb-6">
                        <label htmlFor="name" className="mb-2 block font-medium">
                            Name
                        </label>
                        <input
                            type="text"
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full rounded-md border border-gray-300 px-3 py-2"
                        />
                        <p className="mt-1 text-xs text-gray-500">
                            Your name may appear around Github where you contribute or are mentioned. You can remove it at any time.
                        </p>
                    </div>

                    <div className="mb-6">
                        <label htmlFor="email" className="mb-2 block font-medium">
                            Public email
                        </label>
                        <select
                            id="email"
                            value={emailVisibility}
                            onChange={(e) => setEmailVisibility(e.target.value)}
                            className="w-full rounded-md border border-gray-300 px-3 py-2"
                        >
                            <option>Select a verified email to display</option>
                            <option>{name}</option>
                        </select>
                        <p className="mt-1 text-xs text-gray-500">
                            You have set your email address to private. To toggle email privacy, go to{" "}
                            <Link to="/settings/emails" className="text-blue-600 hover:underline">
                                email settings
                            </Link>{" "}
                            and uncheck "Keep my email address private."
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

                    <button className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700">
                        Update profile
                    </button>
                </div>

                <div>
                    <h2 className="mb-2 font-medium">Profile picture</h2>
                    <div className="relative h-40 w-40 ">
                        <div className="h-40 w-40 overflow-hidden rounded-full bg-gray-100">
                            {name ? (
                                <img src={"https://danviet.mediacdn.vn/296231569849192448/2022/10/13/3-1665629160290413153880.jpg"} alt="Profile" className="h-full w-full object-cover" />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center bg-gray-200 text-4xl text-gray-500">
                                    {name?.charAt(0).toUpperCase() || "T"}
                                </div>
                            )}
                        </div>
                        <button className="absolute bottom-2 right-28 rounded-md bg-white px-3 py-1 text-sm font-medium shadow hover:bg-gray-50">
                            Edit
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
