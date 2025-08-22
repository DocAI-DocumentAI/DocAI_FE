import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "./store";
import PublicRoutes from "./routes/PublicRoutes";
import { AdminRoute } from "./routes/PrivateRoute";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Toaster } from "react-hot-toast";
import { ChatProvider } from "./context/chat-context";
import { initializeAuth } from "./store/slices/authSlice";

// Import admin pages
import AdminPage from "./pages/admin/adminPage";
import DashboardPage from "./pages/admin/Dashboard";
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
import DocumentTypePage from "./pages/admin/DocumentTypePage";
import CreateDocumentTypePage from "./pages/admin/CreateDocumentTypePage";
import UpdateDocumentTypePage from "./pages/admin/UpdateDocumentTypePage";
import ChatboxDashboardPage from "./pages/admin/ChatboxDashboardPage";
import ConfigAIPage from "./pages/admin/ConfigAIPage";
import CreateConfigAI from "./pages/admin/CreateConfigAI";
import UpdateConfigAI from "./pages/admin/UpdateConfigAI";
import ConfigNotificationPage from "./pages/admin/ConfigNotificationPage";
import UpdateConfigNotificationPage from "./pages/admin/UpdateConfigNotificationPage";
import NotificationDashboardPage from "./pages/admin/NotificationDashboardPage";
import ConfigAIAnalyzePage from "./pages/admin/ConfigAIAnalyzePage";
import CreateAIAnalyzeConfigPage from "./pages/admin/CreateAIAnalyzeConfigPage";
import UpdateAIAnalyzeConfigPage from "./pages/admin/UpdateAIAnalyzeConfigPage";
import DocumentAIAnalyzePage from "./pages/admin/DocumentAIAnalyzePage";
import CreateDocumentAIAnalyzePage from "./pages/admin/CreateDocumentAIAnalyzePage";
import UpdateDocumentAIAnalyzePage from "./pages/admin/UpdateDocumentAIAnalyzePage";

const App: React.FC = () => {
  const dispatch = useDispatch();
  const [isInitialized, setIsInitialized] = useState(false);
  const { loading } = useSelector((state: RootState) => state.auth);

  // Initialize auth state from localStorage on app start
  useEffect(() => {
    console.log("App: Initializing auth...");
    console.log("Current pathname:", window.location.pathname);

    // Always initialize auth, but the authSlice will handle Google callback specially
    dispatch(initializeAuth());
    setIsInitialized(true);
  }, [dispatch]);

  // Special handling for Google OAuth callback - don't show loading screen
  const isGoogleCallback = window.location.pathname === "/auth/google/callback";

  console.log(
    "App render - isInitialized:",
    isInitialized,
    "loading:",
    loading,
    "isGoogleCallback:",
    isGoogleCallback
  );

  // Show loading screen while initializing, but NOT for Google OAuth callback
  if ((!isInitialized || loading) && !isGoogleCallback) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
          <p className="text-gray-300">Initializing application...</p>
        </div>
      </div>
    );
  }

  // Force render for Google OAuth callback even if not fully initialized
  if (isGoogleCallback) {
    console.log("🚀 Force rendering Google OAuth callback");
    return (
      <ChatProvider>
        <BrowserRouter>
          <ToastContainer />
          <Toaster position="top-right" />
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
                <AdminRoute>
                  <AdminPage />
                </AdminRoute>
              }
            >
              <Route path="dashboard" element={<DashboardPage />} />
              <Route
                path="chatbox-dashboard"
                element={<ChatboxDashboardPage />}
              />
              <Route path="config-ai-analyze" element={<ConfigAIAnalyzePage />} />
              <Route path="config-ai-analyze/create" element={<CreateAIAnalyzeConfigPage />} />
              <Route path="config-ai-analyze/update/:id" element={<UpdateAIAnalyzeConfigPage />} />
              <Route path="document-ai-analyze" element={<DocumentAIAnalyzePage />} />
              <Route path="document-ai-analyze/create" element={<CreateDocumentAIAnalyzePage />} />
              <Route path="document-ai-analyze/update/:id" element={<UpdateDocumentAIAnalyzePage />} />
              <Route path="config-ai" element={<ConfigAIPage />} />
              <Route path="config-ai/create" element={<CreateConfigAI />} />
              <Route path="config-ai/update/:id" element={<UpdateConfigAI />} />
              <Route path="users" element={<UsersPage />} />
              <Route path="departments" element={<DepartmentPage />} />
              <Route path="roles" element={<RolePage />} />
              <Route path="permissions" element={<PermissionPage />} />
              <Route path="document-types" element={<DocumentTypePage />} />
              <Route path="notifications" element={<NotifyPage />} />
              <Route
                path="config-notification"
                element={<ConfigNotificationPage />}
              />
              <Route
                path="config-notification/update/:id"
                element={<UpdateConfigNotificationPage />}
              />
              <Route
                path="notification-dashboard"
                element={<NotificationDashboardPage />}
              />
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
                path="/admin/document-types/create"
                element={<CreateDocumentTypePage />}
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
              <Route
                path="/admin/document-types/update/:documentTypeId"
                element={<UpdateDocumentTypePage />}
              />
              <Route index element={<Navigate to="dashboard" replace />} />
            </Route>

            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
      </ChatProvider>
    );
  }

  return (
    <ChatProvider>
      <BrowserRouter>
        <ToastContainer />
        <Toaster position="top-right" />
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
              <AdminRoute>
                <AdminPage />
              </AdminRoute>
            }
          >
            <Route path="dashboard" element={<DashboardPage />} />
            <Route
              path="chatbox-dashboard"
              element={<ChatboxDashboardPage />}
            />
              <Route path="config-ai-analyze" element={<ConfigAIAnalyzePage />} />
              <Route path="config-ai-analyze/create" element={<CreateAIAnalyzeConfigPage />} />
              <Route path="config-ai-analyze/update/:id" element={<UpdateAIAnalyzeConfigPage />} />
              <Route path="document-ai-analyze" element={<DocumentAIAnalyzePage />} />
              <Route path="document-ai-analyze/create" element={<CreateDocumentAIAnalyzePage />} />
              <Route path="document-ai-analyze/update/:id" element={<UpdateDocumentAIAnalyzePage />} />
            <Route path="config-ai" element={<ConfigAIPage />} />
            <Route path="config-ai/create" element={<CreateConfigAI />} />
            <Route path="config-ai/update/:id" element={<UpdateConfigAI />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="departments" element={<DepartmentPage />} />
            <Route path="roles" element={<RolePage />} />
            <Route path="permissions" element={<PermissionPage />} />
            <Route path="document-types" element={<DocumentTypePage />} />
            <Route path="notifications" element={<NotifyPage />} />
            <Route
              path="config-notification"
              element={<ConfigNotificationPage />}
            />
            <Route
              path="config-notification/update/:id"
              element={<UpdateConfigNotificationPage />}
            />
            <Route
              path="notification-dashboard"
              element={<NotificationDashboardPage />}
            />
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
              path="/admin/document-types/create"
              element={<CreateDocumentTypePage />}
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
            <Route
              path="/admin/document-types/update/:documentTypeId"
              element={<UpdateDocumentTypePage />}
            />
            <Route index element={<Navigate to="dashboard" replace />} />
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </ChatProvider>
  );
};

export default App;
