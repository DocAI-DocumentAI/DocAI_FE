import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { RootState } from "../store";
import { isGoogleOAuthProcessing } from "../hooks/useGoogleCallbackProtection";

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // Lấy trạng thái đăng nhập từ Redux
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated
  );

  // Check if Google OAuth is currently being processed
  const isOAuthProcessing = isGoogleOAuthProcessing();

  // If OAuth is processing, don't redirect to prevent interrupting the flow
  if (isOAuthProcessing) {
    console.log("🛡️ PrivateRoute: OAuth processing detected, not redirecting");
    return <>{children}</>;
  }

  // Nếu đã đăng nhập, render children (route private)
  // Nếu chưa, chuyển hướng về /login
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

// Component riêng để bảo vệ các route Admin
const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Lấy trạng thái đăng nhập và thông tin user từ Redux
  const { isAuthenticated, user } = useSelector(
    (state: RootState) => state.auth
  );

  // Check if Google OAuth is currently being processed
  const isOAuthProcessing = isGoogleOAuthProcessing();

  // If OAuth is processing, don't redirect to prevent interrupting the flow
  if (isOAuthProcessing) {
    console.log("🛡️ AdminRoute: OAuth processing detected, not redirecting");
    return <>{children}</>;
  }

  // Kiểm tra authentication trước
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Kiểm tra role Admin
  if (!user || user.role.roleName !== "Admin") {
    // Nếu đã đăng nhập nhưng không phải Admin, chuyển về trang chủ
    return <Navigate to="/" replace />;
  }

  // Nếu đã đăng nhập và là Admin, render children
  return <>{children}</>;
};

export default PrivateRoute;
export { AdminRoute };
