import { Outlet } from "react-router-dom"; 
import SidebarEdited from "../common/SidebarEdited";

function EditedLayout() {
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