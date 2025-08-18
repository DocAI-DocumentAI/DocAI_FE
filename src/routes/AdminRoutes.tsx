import { RouteObject, Navigate } from "react-router-dom";
import { AdminRoute } from "./PrivateRoute";

// Admin Layout
import AdminLayout from "../components/layout/AdminLayout";

// Admin Pages
import Dashboard from "../pages/admin/Dashboard";
import UsersPage from "../pages/admin/UsersPage";
import DepartmentPage from "../pages/admin/DepartmentPage";
import RolePage from "../pages/admin/RolePage";
import PermissionPage from "../pages/admin/PermissionPage";
import DocumentTypePage from "../pages/admin/DocumentTypePage";
import NotifyPage from "../pages/admin/NotifyPage";
import ConfigAIPage from "../pages/admin/ConfigAIPage";
import CreateConfigAI from "../pages/admin/CreateConfigAI";
import UpdateConfigAI from "../pages/admin/UpdateConfigAI";
import ChatboxDashboardPage from "../pages/admin/ChatboxDashboardPage";

// Create Pages
import CreateUserPage from "../pages/admin/CreateUserPage";
import CreateDepartmentPage from "../pages/admin/CreateDepartmentPage";
import CreateRolePage from "../pages/admin/CreateRolePage";
import CreatePermissionPage from "../pages/admin/CreatePermissionPage";
import CreateDocumentTypePage from "../pages/admin/CreateDocumentTypePage";

// Update Pages
import UpdateUserPage from "../pages/admin/UpdateUserPage";
import UpdateDepartmentPage from "../pages/admin/UpdateDepartmentPage";
import UpdateRolePage from "../pages/admin/UpdateRolePage";
import UpdatePermissionPage from "../pages/admin/UpdatePermissionPage";
import UpdateDocumentTypePage from "../pages/admin/UpdateDocumentTypePage";

const AdminRoutes: RouteObject = {
  path: "/admin",
  element: (
    <AdminRoute>
      <AdminLayout />
    </AdminRoute>
  ),
  children: [
    {
      index: true,
      element: <Navigate to="dashboard" replace />,
    },
    {
      path: "dashboard",
      element: <Dashboard />,
    },
    {
      path: "chatbox-dashboard",
      element: <ChatboxDashboardPage />,
    },
    {
      path: "config-ai",
      element: <ConfigAIPage />,
    },
    {
      path: "config-ai/create",
      element: <CreateConfigAI />,
    },
    {
      path: "config-ai/update/:id",
      element: <UpdateConfigAI />,
    },
    {
      path: "users",
      element: <UsersPage />,
    },
    {
      path: "users/create",
      element: <CreateUserPage />,
    },
    {
      path: "users/update/:userId",
      element: <UpdateUserPage />,
    },
    {
      path: "departments",
      element: <DepartmentPage />,
    },
    {
      path: "departments/create",
      element: <CreateDepartmentPage />,
    },
    {
      path: "departments/update/:departmentId",
      element: <UpdateDepartmentPage />,
    },
    {
      path: "roles",
      element: <RolePage />,
    },
    {
      path: "roles/create",
      element: <CreateRolePage />,
    },
    {
      path: "roles/update/:roleId",
      element: <UpdateRolePage />,
    },
    {
      path: "permissions",
      element: <PermissionPage />,
    },
    {
      path: "permissions/create",
      element: <CreatePermissionPage />,
    },
    {
      path: "permissions/update/:permissionId",
      element: <UpdatePermissionPage />,
    },
    {
      path: "document-types",
      element: <DocumentTypePage />,
    },
    {
      path: "document-types/create",
      element: <CreateDocumentTypePage />,
    },
    {
      path: "document-types/update/:documentTypeId",
      element: <UpdateDocumentTypePage />,
    },
    {
      path: "notifications",
      element: <NotifyPage />,
    },
  ],
};

export default AdminRoutes;
