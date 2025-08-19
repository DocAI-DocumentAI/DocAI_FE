import { Outlet, useLocation } from "react-router-dom";
import SidebarEdited from "../common/SidebarEdited";

function EditedLayout() {
  // Role check đã được handle bởi EditorRoute
  const location = useLocation();

  // Check if current route is Google Drive folders page
  const isGoogleDrivePage = location.pathname.includes('/google-drive-folders');

  return (
    <div className="flex h-screen overflow-hidden text-gray-100 bg-gray-900">
      {/* BG */}

      <SidebarEdited />
      <div className={`overflow-y-auto flex-1 bg-zinc-50 ${isGoogleDrivePage ? '' : 'p-6'}`}>
        <Outlet />
      </div>
    </div>
  );
}

export default EditedLayout;
