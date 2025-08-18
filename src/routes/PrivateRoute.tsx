import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { RootState } from "../store";

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // Lấy trạng thái đăng nhập từ Redux
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated
  );

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

// Component riêng để bảo vệ các route Manager
const ManagerRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // Lấy trạng thái đăng nhập và thông tin user từ Redux
  const { isAuthenticated, user } = useSelector(
    (state: RootState) => state.auth
  );

  // Kiểm tra authentication trước
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Kiểm tra role Manager
  if (!user || user.role.roleName !== "Manager") {
    // Nếu đã đăng nhập nhưng không phải Manager, chuyển về trang chủ
    return <Navigate to="/" replace />;
  }

  // Nếu đã đăng nhập và là Manager, render children
  return <>{children}</>;
};

// Component riêng để bảo vệ các route Editor
const EditorRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Lấy trạng thái đăng nhập và thông tin user từ Redux
  const { isAuthenticated, user } = useSelector(
    (state: RootState) => state.auth
  );

  // Kiểm tra authentication trước
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Kiểm tra role Editor
  if (!user || user.role.roleName !== "Editor") {
    // Nếu đã đăng nhập nhưng không phải Editor, chuyển về trang chủ
    return <Navigate to="/" replace />;
  }

  // Nếu đã đăng nhập và là Editor, render children
  return <>{children}</>;
};

export default PrivateRoute;
export { AdminRoute, ManagerRoute, EditorRoute };
