import { RouteObject } from "react-router-dom";
import Dashboard from "../pages/Dashboard";
import SearchPage from "../pages/search/SearchPage";
import DocumentPage from "../pages/document/DocumentDetail";

const privateRoutes: RouteObject[] = [
  {
    path: "/dashboard",
    element: <Dashboard />,
  },
  {
    path: "/search",
    element: <SearchPage />,
  },
  {
    path: "/document/:id",
    element: <DocumentPage />,
  },
];

export default privateRoutes;
