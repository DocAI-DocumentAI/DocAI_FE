
import { User, Paintbrush, Bell, MessageSquare, Shield } from "lucide-react"
import { Link, useLocation } from "react-router-dom"

const menuItems = [
    {
        title: "Account",
        icon: <User className="h-4 w-4" />,
        href: "/settings/account",
    },
    {
        title: "Appearance",
        icon: <Paintbrush className="h-4 w-4" />,
        href: "/settings/appearance",
    },
    {
        title: "Notifications",
        icon: <Bell className="h-4 w-4" />,
        href: "/settings/notifications",
    },
    {
        title: "Chatbot",
        href: "#",
        isHeader: true,
    },
    {
        title: "Personalization",
        icon: <MessageSquare className="h-4 w-4" />,
        href: "/settings/personalization",
    },
    {
        title: "Security",
        href: "#",
        isHeader: true,
    },
    {
        title: "Account security",
        icon: <Shield className="h-4 w-4" />,
        href: "/settings/security",
    },
]

export function SettingsSidebar() {
    const pathname = useLocation()

    return (
        <aside className="w-64 border-r border-gray-200 bg-white p-4">
            <nav className="space-y-1">
                {menuItems.map((item, index) => {
                    if (item.isHeader) {
                        return (
                            <div key={index} className="mt-6 pt-2 text-xs font-semibold uppercase text-gray-400">
                                {item.title}
                            </div>
                        )
                    }

                    const isActive = pathname.pathname === item.href

                    return (
                        <div key={index} className=" relative flex gap-10">
                            {isActive && <div className="absolute left-0 h-full  w-1 rounded-full bg-blue-800"></div>}
                            <Link
                                to={item.href}
                                className={` flex items-center rounded-md px-3 w-full mx-2 py-2 text-sm ${isActive
                                    ? "bg-gray-200 font-medium text-blue-800"
                                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                                    }`}
                            >
                                <div className="mr-3 text-gray-500">{item.icon}</div>
                                {item.title}
                            </Link>
                        </div>
                    )
                })}
            </nav>
        </aside>
    )
}
