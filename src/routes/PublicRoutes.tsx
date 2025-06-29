import { Outlet, RouteObject } from "react-router-dom";
// import Login from "../pages/Login";
import SignUp from "../pages/auth/Signup";
import VerifyEmail from "../pages/auth/VerifyEmail";
import ResetPassword from "../pages/auth/ResetPassword";
import Login from "../pages/auth/Login";
import ForgotPassword from "../pages/auth/ForgotPassword";
import HomePage from "../pages/HomePage";
import SettingsLayout from "../components/layout/SettingsLayout";
import AccountSettings from "../pages/settings/Account";
import AppearanceSettings from "../pages/settings/Appearance";
import SecuritySettings from "../pages/settings/Security";
import PersonalizationSettings from "../pages/settings/Personalization";
import NotificationsSettings from "../pages/settings/Notification";
import NewChatPage from "../pages/chat/ChatNew";
import ChatDetail from "../pages/chat/ChatDetail";
import UploadDocument from "../components/UploadDocument";
import EditDocument from "../components/EditDocument";
import AdminPage from "../pages/admin/adminPage";
import DocumentPage from "../pages/document/DocumentDetail";
import Dashboard from "../pages/admin/Dashboard"; 
import SearchPage from "../pages/search/SearchPage";

const PublicRoutes: RouteObject[] = [
  // {
  //   path: "/login",
  //   element: <Login />,
  // },
  {
    path: "/",
    element: <HomePage />,
  },
  {
    path: "/signup",
    element: <SignUp />,
  },
  {
    path: "/admin",
    element: <AdminPage />,
  },
  {
    path: "/verify-email",
    element: <VerifyEmail />,
  },
  {
    path: "/reset-password",
    element: <ResetPassword />,
  },
  {
    path: "/forgot-password",
    element: <ForgotPassword />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/chat",
    element: <NewChatPage />,
  },
  {
    path: "/chat/:id",
    element: <ChatDetail />,
  },
  {
    path: "/document/up",
    element: < UploadDocument/>,
  },
  {
    path: "/document/edit",
    element: < EditDocument/>,
  },
 
  {
    path: "/search",
    element: <SearchPage />,
  },
  
  {
    path: "/document/:id",
    element: <DocumentPage />,
  },
  {
    path: "/settings",
    element: <SettingsLayout><Outlet /></SettingsLayout>,
    children: [
      {
        index: true,
        element: <AccountSettings />,
      },
      {
        path: "account",
        element: <AccountSettings />,
      },
      {
        path: "appearance",
        element: <AppearanceSettings />,
      },
       {
        path: "notifications",
        element: <NotificationsSettings />,
      },
       {
        path: "personalization",
        element: <PersonalizationSettings />,
      },
       {
        path: "security",
        element: <SecuritySettings />,
      },
      {
        path: "*",
        element: <div>404</div>,
      }
    ]
  }
];

export default PublicRoutes;
