import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import PublicRoutes from "./routes/PublicRoutes";
// import PrivateRoute from "./routes/PrivateRoute";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; // Đã sửa lỗi chính tả

// Import admin pages
import AdminPage from "./pages/admin/adminPage";
import OverviewPage from "./pages/admin/Dashboard"; // Giả định Dashboard là OverviewPage
import UsersPage from "./pages/admin/UsersPage";
import DocumentPage from "./pages/admin/DocumentPage";
import SettingsPage from "./pages/admin/SettingsPage";
import NotifyPage from "./pages/admin/NotifyPage";

const App: React.FC = () => {
  // privateRoutes không còn được sử dụng trực tiếp, các route của nó được lồng dưới /admin
  return (
    <BrowserRouter>
      <ToastContainer />
      <Routes>
        {/* Public Routes */}
        {PublicRoutes.map((route) => (
          <Route key={route.path} path={route.path} element={route.element} />
        ))}

        {/* Private Routes với Admin Layout */}
        {/* Đảm bảo bỏ bình luận dòng dưới nếu muốn route /admin được bảo vệ */}
        <Route
          path="/admin"
          element={
            // <PrivateRoute>
            <AdminPage />
            // </PrivateRoute>
          }
        >
          <Route path="dashboard" element={<OverviewPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="documents" element={<DocumentPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="notifications" element={<NotifyPage />} />
          <Route index element={<Navigate to="dashboard" replace />} />
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
