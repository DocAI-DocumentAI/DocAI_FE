import { RouteObject } from "react-router-dom";
import Dashboard from "../pages/admin/Dashboard";

const privateRoutes: RouteObject[] = [
  {
    path: "/dashboard",
    element: <Dashboard />,
  },
];

export default privateRoutes;
