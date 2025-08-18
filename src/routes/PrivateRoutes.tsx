import { RouteObject, Navigate } from "react-router-dom";
import PrivateRoute, { EditorRoute } from "./PrivateRoute";

// Layouts
import SettingsLayout from "../components/layout/SettingsLayout";
import EditedLayout from "../components/layout/EditedLayoutLayout";

// Private Pages
import HomePage from "../pages/HomePage";
import NewChatPage from "../pages/chat/ChatNew";
import ChatDetail from "../pages/chat/ChatDetail";
import ChatIndexPage from "../pages/chat/ChatIndex";
import UploadDocument from "../pages/editor/UploadDocument";
import DocumentPage from "../pages/document/DocumentDetail";
import SearchPage from "../pages/search/SearchPage";
import BookmarksPage from "../pages/bookmarks/BookmarksPage";
import DocumentLibrary from "../pages/document/DocumentLibrary";
import Notifications from "../pages/notification/Notifications";
import DocumentVersionDetail from "../pages/document/DocumentVersionDetail";

// Settings Pages
import AccountSettings from "../pages/settings/Account";
import AppearanceSettings from "../pages/settings/Appearance";
import SecuritySettings from "../pages/settings/Security";
import PersonalizationSettings from "../pages/settings/Personalization";
import NotificationsSettings from "../pages/settings/Notification";

// Editor Pages
import ApprovalManagerTable from "../pages/editor/ApprovalManagerTable";
import ViewDraftTable from "../pages/editor/ViewDraftTable";
import DocumentDetail from "../pages/editor/DocumentDetail";
import RecreateDocument from "../pages/editor/RecreateDocument";
import NewVersionDocument from "../pages/editor/NewVersionDocument";
import DocumentChoice from "../pages/editor/DocumentChoice";
import DocumentReplacement from "../pages/editor/DocumentReplacement";
import EditDocument from "../pages/editor/EditDocument";

const PrivateRoutes: RouteObject[] = [
  {
    path: "/",
    element: (
      <PrivateRoute>
        <HomePage />
      </PrivateRoute>
    ),
  },
  {
    path: "/chat",
    element: (
      <PrivateRoute>
        <ChatIndexPage />
      </PrivateRoute>
    ),
  },
  {
    path: "/chat/new",
    element: (
      <PrivateRoute>
        <NewChatPage />
      </PrivateRoute>
    ),
  },
  {
    path: "/chat/:id",
    element: (
      <PrivateRoute>
        <ChatDetail />
      </PrivateRoute>
    ),
  },
  {
    path: "/document/:id",
    element: (
      <PrivateRoute>
        <DocumentPage />
      </PrivateRoute>
    ),
  },
  {
    path: "/document/:id/version/:versionId",
    element: (
      <PrivateRoute>
        <DocumentVersionDetail />
      </PrivateRoute>
    ),
  },
  {
    path: "/search",
    element: (
      <PrivateRoute>
        <SearchPage />
      </PrivateRoute>
    ),
  },
  {
    path: "/bookmarks",
    element: (
      <PrivateRoute>
        <BookmarksPage />
      </PrivateRoute>
    ),
  },
  {
    path: "/library",
    element: (
      <PrivateRoute>
        <DocumentLibrary />
      </PrivateRoute>
    ),
  },
  {
    path: "/notifications",
    element: (
      <PrivateRoute>
        <Notifications />
      </PrivateRoute>
    ),
  },
  // Settings Routes
  {
    path: "/settings",
    element: (
      <PrivateRoute>
        <SettingsLayout />
      </PrivateRoute>
    ),
    children: [
      {
        path: "account",
        element: <AccountSettings />,
      },
      {
        path: "appearance",
        element: <AppearanceSettings />,
      },
      {
        path: "security",
        element: <SecuritySettings />,
      },
      {
        path: "personalization",
        element: <PersonalizationSettings />,
      },
      {
        path: "notifications",
        element: <NotificationsSettings />,
      },
    ],
  },
  // Editor Routes
  {
    path: "/editor",
    element: (
      <EditorRoute>
        <EditedLayout />
      </EditorRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="view-draft" replace />,
      },
      {
        path: "upload-document",
        element: <UploadDocument />,
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
        path: "document/:id",
        element: <DocumentDetail />,
      },
      {
        path: "recreate/:id",
        element: <RecreateDocument />,
      },
      {
        path: "new-version/:id",
        element: <NewVersionDocument />,
      },
      {
        path: "choice/:id",
        element: <DocumentChoice />,
      },
      {
        path: "replacement/:id",
        element: <DocumentReplacement />,
      },
      {
        path: "edit/:id",
        element: <EditDocument />,
      },
    ],
  },
];

export default PrivateRoutes;
