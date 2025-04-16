import React from "react";
import { RouteObject } from "react-router-dom";
import Dashboard from "../pages/Dashboard";

const privateRoutes: RouteObject[] = [
  {
    path: "/dashboard",
    element: <Dashboard />,
  },
];

export default privateRoutes;
