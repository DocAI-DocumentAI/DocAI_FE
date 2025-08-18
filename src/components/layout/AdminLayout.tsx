import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../common/Sidebar";
import Header from "../common/Header";

const AdminLayout: React.FC = () => {
  return (
    <div className="flex overflow-hidden h-screen text-gray-100 bg-gray-900">
      <Sidebar />
      <div className="relative z-10 flex-1 overflow-auto">
        <Header title="Admin Dashboard" />
        <main className="px-4 py-6 mx-auto max-w-7xl lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
