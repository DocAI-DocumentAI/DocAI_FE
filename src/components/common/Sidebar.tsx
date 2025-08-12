import {
  BarChart2,
  Menu,
  Users,
  Shield,
  Key,
  Building2,
  FileText,
  LogOut,
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
        isSidebarOpen ? "w-64" : "w-20"
      }`}
      animate={{ width: isSidebarOpen ? 256 : 80 }}
    >
      <div className="flex flex-col h-full p-4 bg-gray-800 bg-opacity-50 border-r border-gray-700 backdrop-blur-md">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 transition-colors rounded-full hover:bg-gray-700 max-w-fit"
        >
          <Menu size={24} />
        </motion.button>

        <nav className="flex-grow mt-8">
          {SIDEBAR_ITEMS.map((item) => (
            <Link key={item.href} to={item.href}>
              <motion.div className="flex items-center p-4 mb-2 text-sm font-medium transition-colors rounded-lg hover:bg-gray-700">
                <item.icon
                  size={20}
                  style={{ color: item.color, minWidth: "20px" }}
                />
                <AnimatePresence>
                  {isSidebarOpen && (
                    <motion.span
                      className="ml-4 whitespace-nowrap"
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
        </nav>

        {/* Logout Button */}
        <div className="mt-auto">
          <motion.button
            onClick={handleLogout}
            disabled={logoutMutation.isPending}
            className="flex items-center w-full p-4 text-sm font-medium transition-colors rounded-lg hover:bg-red-900 hover:bg-opacity-20 disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {logoutMutation.isPending ? (
              <div className="w-5 h-5 border-2 border-red-400 rounded-full border-t-transparent animate-spin" />
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
