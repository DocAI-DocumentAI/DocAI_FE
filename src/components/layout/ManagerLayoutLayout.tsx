import { Navigate, Outlet, useLocation } from "react-router-dom";
import SidebarManager from "../common/SidebarManager";
import toast from "react-hot-toast";

function ManagerLayoutLayout() {
  const location = useLocation();
  const userStr = localStorage.getItem("user");
  if (!userStr) {
    toast.error("Không tìm thấy thông tin user, vui lòng đăng nhập lại!");
    return <Navigate to="/login" replace />;
  }
  const user = JSON.parse(userStr);
  if(user?.role?.roleName!== "Manager") {
    return <Navigate to="/" replace />;
  }

  // Check if current route is Google Drive folders page
  const isGoogleDrivePage = location.pathname.includes('/google-drive-folders');

  return (
    <div className="flex overflow-hidden h-screen text-gray-100 bg-gray-900">
      {/* BG */}

      <SidebarManager />
      <div className={`overflow-y-auto flex-1 bg-zinc-50 ${isGoogleDrivePage ? '' : 'p-6'}`}>
        <Outlet />
      </div>
    </div>
  );
}

export default ManagerLayoutLayout; 