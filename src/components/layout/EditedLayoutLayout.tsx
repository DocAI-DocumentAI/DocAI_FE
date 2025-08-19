import { Navigate, Outlet } from "react-router-dom";
import SidebarEdited from "../common/SidebarEdited";
import toast from "react-hot-toast";

function EditedLayout() {
  const userStr = localStorage.getItem("user");
  if (!userStr) {
    toast.error("Không tìm thấy thông tin user, vui lòng đăng nhập lại!");
    return <Navigate to="/login" replace />;
  }
  const user = JSON.parse(userStr);
  if (user?.role?.roleName !== "Editor") {
    return <Navigate to="/" replace />;
  }
  return (
    <div className="flex overflow-hidden h-screen text-gray-100 bg-gray-900">
      {/* BG */}

      <SidebarEdited />
      <div className="overflow-y-auto flex-1 p-6 bg-zinc-50">
        <Outlet />
      </div>
    </div>
  );
}

export default EditedLayout; 