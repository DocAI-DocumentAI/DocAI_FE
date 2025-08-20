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
import UploadDocument from "../pages/editor/UploadDocument";
import DocumentPage from "../pages/document/DocumentDetail";
import SearchPage from "../pages/search/SearchPage";
import ApprovalManagerTable from "../pages/editor/ApprovalManagerTable";
import ViewDraftTable from "../pages/editor/ViewDraftTable";
import EditedLayout from "../components/layout/EditedLayoutLayout";
import ManagerLayoutLayout from "../components/layout/ManagerLayoutLayout";
import ApprovalQueue from "../pages/manager/ApprovalQueue";
import DocumentReview from "../pages/manager/DocumentReview";
import DocumentManagement from "../pages/manager/DocumentManagement";
import DocumentDetail from "../pages/editor/DocumentDetail";
import RecreateDocument from "../pages/editor/RecreateDocument";
import BookmarksPage from "../pages/bookmarks/BookmarksPage";
import NewVersionDocument from "../pages/editor/NewVersionDocument";
import ChatIndexPage from "../pages/chat/ChatIndex";
import Tags from "../pages/manager/Tags";
import DocumentChoice from "../pages/editor/DocumentChoice";
import DocumentReplacement from "../pages/editor/DocumentReplacement";
import ManagerFolderManagement from "../pages/manager/FolderManagement";
import GoogleDriveFolder from "../pages/editor/GoogleDriveFolder";
import GoogleDriveFolderManagement from "../pages/manager/GoogleDriveFolderManagement";
import DocumentLibrary from "../pages/document/DocumentLibrary.tsx";
import Notifications from "../pages/notification/Notifications.tsx";
import AdminRouteTestPage from "../pages/AdminRouteTestPage";
import DocumentVersionDetail from "../pages/document/DocumentVersionDetail.tsx";
import EditDocument from "../pages/editor/EditDocument.tsx";
import UserManagerPage from "../pages/manager/UserManagerPage";

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
    element: <GoogleCallbackPage />,
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
    path: "/manager",
    element: <ManagerLayoutLayout />,
    children: [
      {
        path: "users",
        element: <UserManagerPage />,
      },
      {
        path: "document-management",
        element: <DocumentManagement />,
      },
      {
        path: "approvalQueue",
        element: <ApprovalQueue />,
      },
      {
        path: "tags",
        element: <Tags />,
      },
      {
        path: "folder-management",
        element: <ManagerFolderManagement />,
      },
      {
        path: "google-drive-folders",
        element: <GoogleDriveFolderManagement />,
      },
      {
        path: "document-review/:id/:versionId",
        element: <DocumentReview />,
      },
    ],
  },
  {
    path: "/editor",
    element: <EditedLayout />,
    children: [
      {
        path: "upload-document",
        element: <UploadDocument />,
      },
      {
        path: "upload-document-replacement",
        element: <DocumentReplacement />,
      },

      {
        path: "document-choice",
        element: <DocumentChoice />,
      },
      {
        path: "document-replacement",
        element: <DocumentReplacement />,
      },
      {
        path: "document/new-version/:id",
        element: <NewVersionDocument />,
      },
      {
        path: "my-document",
        element: <ViewDraftTable />,
      },
      {
        path: "approval-manager",
        element: <ApprovalManagerTable />,
      },
      {
        path: "view-draft",
        element: <ViewDraftTable />,
      },
      {
        path: "doc/:id/:versionId",
        element: <DocumentDetail />,
      },
      {
        path: "document/recreate/:id",
        element: <RecreateDocument />,
      },
      {
        path: "google-drive-folders",
        element: <GoogleDriveFolder />,
      },
      {
        path: "document/editDocument/:id",
        element: <EditDocument />,
      },
    ],
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
