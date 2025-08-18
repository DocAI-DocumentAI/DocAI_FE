import { RouteObject, Navigate } from "react-router-dom";
import { ManagerRoute } from "./PrivateRoute";

// Manager Layout
import ManagerLayoutLayout from "../components/layout/ManagerLayoutLayout";

// Manager Pages
import ApprovalQueue from "../pages/manager/ApprovalQueue";
import DocumentReview from "../pages/manager/DocumentReview";
import DocumentManagement from "../pages/manager/DocumentManagement";
import Tags from "../pages/manager/Tags";
import UserManagerPage from "../pages/manager/UserManagerPageNew";

const ManagerRoutes: RouteObject = {
  path: "/manager",
  element: (
    <ManagerRoute>
      <ManagerLayoutLayout />
    </ManagerRoute>
  ),
  children: [
    {
      index: true,
      element: <Navigate to="approvalQueue" replace />,
    },
    {
      path: "users",
      element: <UserManagerPage />,
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
      path: "document-management",
      element: <DocumentManagement />,
    },
    {
      path: "document-review/:id/:versionId",
      element: <DocumentReview />,
    },
  ],
};

export default ManagerRoutes;
