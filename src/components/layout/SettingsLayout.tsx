import type React from "react"
import { Navbar } from "./navbar"
import { SettingsSidebar } from "../settings-sidebar"

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-screen  flex-col ">
            <Navbar />
            <div className="flex flex-1 max-w-[1090px] w-[-webkit-fill-available] flex-row gap-4 px-4 py-8 mx-auto">
                <SettingsSidebar />
                <main className="flex-1 p-8 w-full">{children}</main>
            </div>
        </div>
    )
}
