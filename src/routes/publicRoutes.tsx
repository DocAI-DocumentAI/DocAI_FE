import React from "react";
import { RouteObject } from "react-router-dom";
import Login from "../pages/Login";

const publicRoutes: RouteObject[] = [
  {
    path: "/login",
    element: <Login />,
  },
];

export default publicRoutes;
