import { Outlet } from "react-router-dom"; 
import SidebarManager from "../common/SidebarManager";

function ManagerLayoutLayout() {
  return (
    <div className="flex overflow-hidden h-screen text-gray-100 bg-gray-900">
      {/* BG */}
 
      <SidebarManager />
      <div className="overflow-y-auto flex-1 p-6">
        <Outlet />
      </div>
    </div>
  );
}

export default ManagerLayoutLayout; 