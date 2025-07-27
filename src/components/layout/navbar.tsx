import { useState } from "react";
// import { useAuth } from "@/context/auth-context"
import { Search, Plus } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export function Navbar() {
  //   const { user, logout } = useAuth()
  const [showDropdown, setShowDropdown] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const navigate=useNavigate()
  
    const userStr = localStorage.getItem("user");
  if (!userStr) {
    toast.error("Không tìm thấy thông tin user, vui lòng đăng nhập lại!");
    return;
  }
  const user = JSON.parse(userStr);
  const logout = () => {
    console.log("Logout");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };
  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  return (
    <nav className="flex h-16 items-center justify-between bg-blue-800 px-6">
      <div className="flex items-center">
        <Link to="/dashboard" className="text-2xl font-medium text-white">
          Docs<span className="text-blue-300">+</span>AI
        </Link>
      </div>

      <div className="flex items-center gap-4">
        <button className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-blue-800">
          <Plus className="h-5 w-5" />
        </button>
        <div className="relative max-w-64 ">
          {/* Mobile search button */}
          <button
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-blue-800 sm:hidden"
            onClick={() => setShowSearch(!showSearch)}
            aria-label="Open search"
            type="button" 
          >
            <Search className="h-5 w-5" />
          </button>
          {/* Mobile search input */}
          {showSearch && (
            <div className="absolute  right-0 top-10 z-10 w-64 rounded-md bg-white p-2 shadow-lg sm:hidden">
              <div className="flex items-center rounded-md bg-white pl-2">
                <Search className="h-5 w-5 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search feature"
                  className="w-full rounded-md border-none bg-white px-2 py-1.5 text-sm text-black focus:outline-none focus:ring-0"
                  autoFocus
                />
              </div>
            </div>
          )}
          <div className="hidden sm:flex items-center rounded-md bg-white pl-2">
            <Search className="h-5 w-5 text-gray-500" />
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
            className="h-8 w-8 overflow-hidden rounded-full"
          >
            {user?.avatar ? (
              <img
                src={user.avatar || "https://hoanghamobile.com/tin-tuc/wp-content/uploads/2023/07/hinh-dep-19.jpg"}
                alt={user.fullName}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center rounded-full bg-gray-200 text-blue-800">
                {user?.fullName?.charAt(0).toUpperCase() || "U"}
              </div>
            )}
          </button>

          {showDropdown && (
            <div className="absolute right-0 mt-2 w-48 rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5">
              <div className="border-b border-gray-100 px-4 py-2">
                <p className="text-sm font-medium text-gray-900">
                  {user?.fullName}
                </p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
                  <button
                onClick={() => {
                  navigate("/bookmarks");
                  setShowDropdown(false);
                }}
                className="block w-full px-4 py-2 text-left text-sm text-black-600 hover:bg-gray-100"
              >
                Book mark
              </button>
              <button
                onClick={() => {
                  logout();
                  setShowDropdown(false);
                }}
                className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100"
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
