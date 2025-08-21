import {
  BarChart2,
  Menu,
  Users,
  Shield,
  Key,
  Building2,
  FileText,
  LogOut,
  MessageSquare,
  Settings,
  Bell,
  Activity,
} from "lucide-react";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useLogout } from "../../services/authService";
import toast from "react-hot-toast";

const SIDEBAR_ITEMS: {
  name: string;
  icon: React.ComponentType<any>;
  color: string;
  href: string;
}[] = [
  {
    name: "Dashboard",
    icon: BarChart2,
    color: "#F59E0B", // amber-500
    href: "/admin/dashboard",
  },
  {
    name: "Chatbox Dashboard",
    icon: MessageSquare,
    color: "#8B5CF6", // violet-500
    href: "/admin/chatbox-dashboard",
  },
  {
    name: "AI Configuration",
    icon: Settings,
    color: "#06B6D4", // cyan-500
    href: "/admin/config-ai",
  },
  {
    name: "Users",
    icon: Users,
    color: "#34D399", // emerald-400
    href: "/admin/users",
  },
  {
    name: "Departments",
    icon: Building2,
    color: "#F87171", // red-400
    href: "/admin/departments",
  },
  {
    name: "Roles",
    icon: Shield,
    color: "#A78BFA", // violet-400
    href: "/admin/roles",
  },
  {
    name: "Permissions",
    icon: Key,
    color: "#F472B6", // pink-400
    href: "/admin/permissions",
  },
  {
    name: "Document Types",
    icon: FileText,
    color: "#60A5FA", // blue-400
    href: "/admin/document-types",
  },
  {
    name: "Notification Configuration",
    icon: Bell,
    color: "#FB923C", // orange-400
    href: "/admin/config-notification",
  },
  {
    name: "Notification Dashboard",
    icon: Activity,
    color: "#10B981", // emerald-500
    href: "/admin/notification-dashboard",
  },
];

const Sidebar: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const navigate = useNavigate();
  const logoutMutation = useLogout();

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        toast.success("Logged out successfully!");
        navigate("/login");
      },
      onError: (error: any) => {
        toast.error(error.message || "Logout failed");
        // Still navigate to login even if API fails for security
        navigate("/login");
      },
    });
  };

  return (
    <motion.div
      className={`relative z-10 transition-all duration-300 ease-in-out flex-shrink-0 ${
        isSidebarOpen ? "w-72" : "w-20"
      }`}
      animate={{ width: isSidebarOpen ? 280 : 80 }}
    >
      <div className="flex flex-col h-full min-h-screen p-4 bg-gray-800 bg-opacity-50 border-r border-gray-700 backdrop-blur-md">
        {/* Header with Menu Toggle */}
        <div className="flex-shrink-0">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 transition-colors rounded-full hover:bg-gray-700 max-w-fit"
          >
            <Menu size={24} />
          </motion.button>
        </div>

        {/* Navigation Menu - Scrollable */}
        <nav className="flex-1 mt-6 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
          <div className="space-y-1">
            {SIDEBAR_ITEMS.map((item) => (
              <Link key={item.href} to={item.href}>
                <motion.div className="flex items-center px-4 py-3 text-base font-medium transition-colors rounded-lg hover:bg-gray-700">
                  <item.icon
                    size={20}
                    style={{ color: item.color, minWidth: "20px" }}
                  />
                  <AnimatePresence>
                    {isSidebarOpen && (
                      <motion.span
                        className="ml-4 text-gray-200 whitespace-nowrap"
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: "auto" }}
                        exit={{ opacity: 0, width: 0 }}
                        transition={{ duration: 0.2, delay: 0.3 }}
                      >
                        {item.name}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.div>
              </Link>
            ))}
          </div>
        </nav>

        {/* Logout Button - Always at bottom */}
        <div className="flex-shrink-0 pt-3 border-t border-gray-700">
          <motion.button
            onClick={handleLogout}
            disabled={logoutMutation.isPending}
            className="flex items-center w-full px-4 py-3 text-base font-medium transition-colors rounded-lg hover:bg-red-900 hover:bg-opacity-20 disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {logoutMutation.isPending ? (
              <div className="w-[20px] h-[20px] border-2 border-red-400 rounded-full border-t-transparent animate-spin" />
            ) : (
              <LogOut
                size={20}
                style={{ color: "#EF4444", minWidth: "20px" }}
              />
            )}
            <AnimatePresence>
              {isSidebarOpen && (
                <motion.span
                  className="ml-4 text-red-400 whitespace-nowrap"
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.2, delay: 0.3 }}
                >
                  {logoutMutation.isPending ? "Logging out..." : "Logout"}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};
export default Sidebar;
