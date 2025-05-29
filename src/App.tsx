import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import PublicRoutes from "./routes/PublicRoutes";
// import PrivateRoute from "./routes/PrivateRoute";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; // Corrected typo

// Import admin pages
import AdminPage from "./pages/admin/adminPage";
import OverviewPage from "./pages/admin/Dashboard"; // Assuming Dashboard is OverviewPage
import UsersPage from "./pages/admin/UsersPage";

const App: React.FC = () => {
  // privateRoutes is no longer used directly, its routes are nested under /admin
  return (
    <BrowserRouter>
      <ToastContainer />
      <Routes>
        {/* Public Routes */}
        {PublicRoutes.map((route) => (
          <Route key={route.path} path={route.path} element={route.element} />
        ))}

        {/* Private Routes with Admin Layout */}
        {/* Uncomment the route below to use PrivateRoute */}
        <Route
          path="/admin"
          element={
            // <PrivateRoute>
            <AdminPage />
            // </PrivateRoute>
          }
        >
          {/* Nested Admin Routes - These paths are relative to the parent (/admin) */}
          <Route path="dashboard" element={<OverviewPage />} />
          <Route path="users" element={<UsersPage />} />
          {/* Add other nested admin routes here */}
          {/* Default route for /admin - redirects to /admin/dashboard */}
          <Route index element={<Navigate to="dashboard" replace />} />
        </Route>

        {/* Fallback/Redirect - Catch all unmatched paths */}
        {/* This route will render if no other routes match */}
        <Route path="*" element={<Navigate to="/login" replace />} />

        {/* Redirect root path to login - Already exists */}
        {/* <Route path="/" element={<Navigate to="/login" replace />} /> */}
      </Routes>
    </BrowserRouter>
  );
};

export default App;
