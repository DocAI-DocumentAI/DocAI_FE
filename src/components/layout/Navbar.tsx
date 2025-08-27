import { useState, useEffect, useCallback } from "react";
import { Search, BellRing } from "lucide-react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { api } from "../../lib/api/api";

export function Navbar() {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();

  // Move user check after all hooks
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;
        
  const logout = () => {
    console.log("Logout");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  // Get unread notification count
  const getUnreadNotificationCount = useCallback(async () => {
    try {
      const response = await api.get("/notification/unread-count");
      if (response.data && response.data.data) {
        setUnreadCount(response.data.data.unreadCount);
      }
    } catch (error) {
      console.error("Failed to get unread notification count:", error);
      // Don't show error toast as this is not critical
    }
  }, []);

  // Fetch unread count on component mount and set up interval
  useEffect(() => {
    getUnreadNotificationCount();

    // Update unread count every 30 seconds
    const interval = setInterval(getUnreadNotificationCount, 30000);

    return () => clearInterval(interval);
  }, [getUnreadNotificationCount]);

  // Listen for storage events to update count when notifications are read
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "notification_update") {
        getUnreadNotificationCount();
      }
    };

    window.addEventListener("storage", handleStorageChange);

    // Also listen for custom events within the same tab
    const handleCustomEvent = () => {
      getUnreadNotificationCount();
    };

    window.addEventListener("notification_update", handleCustomEvent);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("notification_update", handleCustomEvent);
    };
  }, [getUnreadNotificationCount]);

  // Check if user exists after hooks
  if (!user) {
    toast.error("Không tìm thấy thông tin user, vui lòng đăng nhập lại!");
    return <Navigate to="/login" replace />;
  }

  return (
    <nav className="flex items-center justify-between h-16 px-6 bg-blue-800">
      <div className="flex items-center">
        <Link to="/" className="flex items-center">
          <img
            src="/LOGO.png"
            alt="Docs+AI"
            className="h-10 w-auto"
          />
        </Link>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative">
          <button
            onClick={() => navigate("/notifications")}
            className="relative flex items-center justify-center w-8 h-8 text-blue-800 transition-colors bg-white rounded-full hover:bg-gray-100"
            title="Notifications"
          >
            <BellRing className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium min-w-[20px] px-1">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>
        </div>
        <div className="relative max-w-64 ">
          {/* Mobile search button */}
          <button
            className="flex items-center justify-center w-8 h-8 text-blue-800 bg-white rounded-full sm:hidden"
            onClick={() => setShowSearch(!showSearch)}
            aria-label="Open search"
            type="button"
          >
            <Search className="w-5 h-5" />
          </button>
          {/* Mobile search input */}
          {showSearch && (
            <div className="absolute right-0 z-10 w-64 p-2 bg-white rounded-md shadow-lg top-10 sm:hidden">
              <div className="flex items-center pl-2 bg-white rounded-md">
                <Search className="w-5 h-5 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search feature"
                  className="w-full rounded-md border-none bg-white px-2 py-1.5 text-sm text-black focus:outline-none focus:ring-0"
                  autoFocus
                />
              </div>
            </div>
          )}
          <div className="items-center hidden pl-2 bg-white rounded-md sm:flex">
            <Search className="w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Search feature"
              className="w-full rounded-md border-none bg-white px-2 py-1.5 text-sm text-black focus:outline-none focus:ring-0"
            />
          </div>
        </div>

        <div className="relative">
          <button
            onClick={toggleDropdown}
            className="w-8 h-8 overflow-hidden rounded-full"
          >
            {user?.avatar ? (
              <img
                src={
                  user.avatar ||
                  "https://hoanghamobile.com/tin-tuc/wp-content/uploads/2023/07/hinh-dep-19.jpg"
                }
                alt={user.fullName}
                className="object-cover w-full h-full"
              />
            ) : (
              <div className="flex items-center justify-center w-full h-full text-blue-800 bg-gray-200 rounded-full">
                {user?.fullName?.charAt(0).toUpperCase() || "U"}
              </div>
            )}
          </button>

          {showDropdown && (
            <div className="absolute right-0 z-10 w-48 py-1 mt-2 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5">
              <div className="px-4 py-2 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-900">
                  {user?.fullName}
                </p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
              {user?.role?.roleName !== "Employee" && (
                <button
                  onClick={() => {
                    navigate(`/${user?.role?.roleName}`);
                    setShowDropdown(false);
                  }}
                  className="block w-full px-4 py-2 text-sm text-left text-black-600 hover:bg-gray-100"
                >
                  Dashboard
                </button>
              )}
              <button
                onClick={() => {
                  navigate("/settings/account");
                  setShowDropdown(false);
                }}
                className="block w-full px-4 py-2 text-sm text-left text-black-600 hover:bg-gray-100"
              >
                Settings
              </button>
              <button
                onClick={() => {
                  navigate("/bookmarks");
                  setShowDropdown(false);
                }}
                className="block w-full px-4 py-2 text-sm text-left text-black-600 hover:bg-gray-100"
              >
                Book mark
              </button>
              <button
                onClick={() => {
                  logout();
                  setShowDropdown(false);
                }}
                className="block w-full px-4 py-2 text-sm text-left text-red-600 hover:bg-gray-100"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
