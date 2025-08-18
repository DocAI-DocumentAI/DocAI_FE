import { RouteObject } from "react-router-dom";
// import Login from "../pages/Login";
import SignUp from "../pages/auth/Signup";
import VerifyEmail from "../pages/auth/VerifyEmail";
import ResetPassword from "../pages/auth/ResetPassword";
import Login from "../pages/auth/Login";
import ForgotPassword from "../pages/auth/ForgotPassword";
import GoogleCallbackPage from "../pages/auth/GoogleCallback";
import HomePage from "../pages/HomePage";
import SettingsLayout from "../components/layout/SettingsLayout";
import AccountSettings from "../pages/settings/Account";
import AppearanceSettings from "../pages/settings/Appearance";
import SecuritySettings from "../pages/settings/Security";
import PersonalizationSettings from "../pages/settings/Personalization";
import NotificationsSettings from "../pages/settings/Notification";
import NewChatPage from "../pages/chat/ChatNew";
import ChatDetail from "../pages/chat/ChatDetail";

import DocumentPage from "../pages/document/DocumentDetail";
import SearchPage from "../pages/search/SearchPage";

import BookmarksPage from "../pages/bookmarks/BookmarksPage";
import ChatIndexPage from "../pages/chat/ChatIndex";
import DocumentLibrary from "../pages/document/DocumentLibrary.tsx";
import Notifications from "../pages/notification/Notifications.tsx";
import AdminRouteTestPage from "../pages/AdminRouteTestPage";
import DocumentVersionDetail from "../pages/document/DocumentVersionDetail.tsx";

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
    path: "/document/:documentId/version/:versionId",
    element: <DocumentVersionDetail />,
  },
  {
    path: "/signup",
    element: <SignUp />,
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
    path: "/auth/google/callback",
    element: (() => {
      console.log("PublicRoutes: Google callback route matched!");
      console.log("PublicRoutes: Current URL:", window.location.href);
      console.log("PublicRoutes: URL search params:", window.location.search);
      return <GoogleCallbackPage />;
    })(),
  },
  {
    path: "/chat",
    element: <ChatIndexPage />,
  },
  {
    path: "/chat/new",
    element: <NewChatPage />,
  },
  {
    path: "/chat/:id",
    element: <ChatDetail />,
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
    path: "/bookmarks",
    element: <BookmarksPage />,
  },
  {
    path: "/document-library",
    element: <DocumentLibrary />,
  },
  {
    path: "/notifications",
    element: <Notifications />,
  },
  {
    path: "/admin-test",
    element: <AdminRouteTestPage />,
  },

  {
    path: "/settings",
    element: <SettingsLayout />,
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
      },
    ],
  },
];

export default PublicRoutes;
