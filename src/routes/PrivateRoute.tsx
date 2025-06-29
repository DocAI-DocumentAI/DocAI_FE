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

export default PrivateRoute;
