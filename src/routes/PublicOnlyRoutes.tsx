import { RouteObject } from "react-router-dom";

// Auth Pages
import Login from "../pages/auth/Login";
import SignUp from "../pages/auth/Signup";
import VerifyEmail from "../pages/auth/VerifyEmail";
import ResetPassword from "../pages/auth/ResetPassword";
import ForgotPassword from "../pages/auth/ForgotPassword";
import GoogleCallbackPage from "../pages/auth/GoogleCallback";

// Test Pages
import AdminRouteTestPage from "../pages/AdminRouteTestPage";

const PublicOnlyRoutes: RouteObject[] = [
  {
    path: "/login",
    element: <Login />,
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
    path: "/auth/google/callback",
    element: <GoogleCallbackPage />,
  },
  {
    path: "/admin-route-test",
    element: <AdminRouteTestPage />,
  },
];

export default PublicOnlyRoutes;
