import React from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { RootState } from "../store";

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // Get authentication state from Redux
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated
  );

  // If authenticated, render children (the private route component)
  // If not, redirect to the login page
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

export default PrivateRoute;
