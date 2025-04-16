import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../store";
import { logout } from "../store/slices/authSlice";
import { Navigate } from "react-router-dom";

// Giả lập các component cho từng vai trò
const AdminPanel: React.FC = () => (
  <div>Admin Panel: Manage users, logs, and settings.</div>
);
const UserDashboard: React.FC = () => (
  <div>User Dashboard: Upload and search documents.</div>
);
const ViewerDashboard: React.FC = () => (
  <div>Viewer Dashboard: Search and view documents.</div>
);

const Dashboard: React.FC = () => {
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Welcome, {user?.username}</h1>
        <button
          onClick={handleLogout}
          className="px-4 py-2 text-white bg-red-500 rounded"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
