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
          {/* Các Route Admin lồng nhau - Các đường dẫn này là tương đối so với route cha (/admin) */}
          <Route path="dashboard" element={<OverviewPage />} />
          <Route path="users" element={<UsersPage />} />
          {/* Thêm các route admin lồng nhau khác tại đây */}
          {/* Route mặc định cho /admin - chuyển hướng đến /admin/dashboard */}
          <Route index element={<Navigate to="dashboard" replace />} />
        </Route>

        {/* Fallback/Redirect - Bắt tất cả các đường dẫn không khớp */}
        {/* Route này sẽ được render nếu không có route nào khác khớp */}
        <Route path="*" element={<Navigate to="/login" replace />} />

        {/* Chuyển hướng root path đến login - Đã tồn tại */}
        {/* <Route path="/" element={<Navigate to="/login" replace />} /> */}
      </Routes>
    </BrowserRouter>
  );
};

export default App;
