import { RouteObject } from "react-router-dom";

// Route Groups
import AdminRoutes from "./AdminRoutes";
import ManagerRoutes from "./ManagerRoutes";
import PrivateRoutes from "./PrivateRoutes";
import PublicOnlyRoutes from "./PublicOnlyRoutes";

// Error Pages
import NotFoundPage from "../pages/NotFoundPage";

const routes: RouteObject[] = [
  // Public Only Routes (Auth pages)
  ...PublicOnlyRoutes,

  // Admin Routes
  AdminRoutes,

  // Manager Routes
  ManagerRoutes,

  // Private Routes (Authenticated users)
  ...PrivateRoutes,

  // Catch-all route for 404
  {
    path: "*",
    element: <NotFoundPage />,
  },
];

export default routes;
