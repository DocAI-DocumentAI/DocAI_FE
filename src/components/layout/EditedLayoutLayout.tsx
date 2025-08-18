import { Outlet } from "react-router-dom";
import SidebarEdited from "../common/SidebarEdited";

function EditedLayout() {
  // Role check đã được handle bởi EditorRoute
  return (
    <div className="flex h-screen overflow-hidden text-gray-100 bg-gray-900">
      {/* BG */}

      <SidebarEdited />
      <div className="flex-1 p-6 overflow-y-auto bg-zinc-50">
        <Outlet />
      </div>
    </div>
  );
}

export default EditedLayout;
