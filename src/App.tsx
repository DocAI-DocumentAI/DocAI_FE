import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import PublicRoutes from "./routes/PublicRoutes";
// import PrivateRoute from "./routes/PrivateRoute";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ChatProvider } from "./context/chat-context";
import { PreferencesProvider } from "./context/preferences-context";

// Import admin pages
import AdminPage from "./pages/admin/adminPage";
import OverviewPage from "./pages/admin/Dashboard";
import UsersPage from "./pages/admin/UsersPage";
import NotifyPage from "./pages/admin/NotifyPage";
import DepartmentPage from "./pages/admin/DepartmentPage";
import RolePage from "./pages/admin/RolePage";
import PermissionPage from "./pages/admin/PermissionPage";
import CreateUserPage from "./pages/admin/CreateUserPage";
import CreateDepartmentPage from "./pages/admin/CreateDepartmentPage";
import CreateRolePage from "./pages/admin/CreateRolePage";
import CreatePermissionPage from "./pages/admin/CreatePermissionPage";
import UpdateUserPage from "./pages/admin/UpdateUserPage";
import UpdateDepartmentPage from "./pages/admin/UpdateDepartmentPage";
import UpdateRolePage from "./pages/admin/UpdateRolePage";
import UpdatePermissionPage from "./pages/admin/UpdatePermissionPage";

const App: React.FC = () => {
  return (
    <PreferencesProvider>
      <ChatProvider>
        <BrowserRouter>
          <ToastContainer />
        <Routes>
          {/* Public Routes */}
          {PublicRoutes.map((route) => (
            <Route key={route.path} path={route.path} element={route.element}>
              {route.children &&
                route.children.map((child: any) => (
                  <Route
                    key={child.path}
                    path={child.path}
                    element={child.element}
                  />
                ))}
            </Route>
          ))}

          {/* Private Routes với Admin Layout */}
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
            <Route path="departments" element={<DepartmentPage />} />
            <Route path="roles" element={<RolePage />} />
            <Route path="permissions" element={<PermissionPage />} />
            <Route path="notifications" element={<NotifyPage />} />
            <Route path="/admin/users/create" element={<CreateUserPage />} />
            <Route
              path="/admin/departments/create"
              element={<CreateDepartmentPage />}
            />
            <Route path="/admin/roles/create" element={<CreateRolePage />} />
            <Route
              path="/admin/permissions/create"
              element={<CreatePermissionPage />}
            />
            <Route
              path="/admin/users/update/:userId"
              element={<UpdateUserPage />}
            />
            <Route
              path="/admin/departments/update/:departmentId"
              element={<UpdateDepartmentPage />}
            />
            <Route
              path="/admin/roles/update/:roleId"
              element={<UpdateRolePage />}
            />
            <Route
              path="/admin/permissions/update/:permissionId"
              element={<UpdatePermissionPage />}
            />
            <Route index element={<Navigate to="dashboard" replace />} />
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </ChatProvider>
    </PreferencesProvider>
  );
};

export default App;
