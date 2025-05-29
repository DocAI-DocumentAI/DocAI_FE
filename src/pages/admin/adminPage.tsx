import { Outlet } from "react-router-dom";

import Sidebar from "../../components/common/Sidebar";

// Remove page imports from here as they will be routed in App.tsx
// import OverviewPage from "./Dashboard";
// import UsersPage from "./UsersPage";

function AdminPage() {
  return (
    <div className="flex h-screen overflow-hidden text-gray-100 bg-gray-900">
      {/* BG */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 opacity-80" />
        <div className="absolute inset-0 backdrop-blur-sm" />
      </div>

      <Sidebar />
      {/* Render nested routes here */}
      <div className="flex-1 overflow-y-auto p-6">
        <Outlet />
      </div>
    </div>
  );
}

export default AdminPage;
