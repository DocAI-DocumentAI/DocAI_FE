import React, { useState, useEffect } from "react";
import LoginModal from "../components/LoginModal";
import { useSelector } from "react-redux";
import { RootState } from "../store";
import { Navigate } from "react-router-dom";

const Login: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { isAuthenticated, user, loading, error } = useSelector(
    (state: RootState) => state.auth
  );

  console.log("isAuthenticated:", isAuthenticated); // Debug trạng thái đăng nhập
  console.log("isModalOpen:", isModalOpen); // Debug trạng thái modal

  useEffect(() => {
    console.log("Auth State:", {
      isAuthenticated,
      user,
      loading,
      error,
    });
  }, [isAuthenticated, user, loading, error]);

  // Handle redirects based on authentication state
  if (isAuthenticated && user) {
    if (user.role?.roleName === "Admin") {
      console.log("Redirecting admin to /admin/dashboard");
      return <Navigate to="/admin/dashboard" replace />;
    } else {
      console.log("Redirecting user to /dashboard");
      return <Navigate to="/" replace />;
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="text-center">
        <h1 className="mb-4 text-3xl font-bold">
          Welcome to Document Search Tool
        </h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-6 py-3 text-white bg-blue-500 rounded"
        >
          Login
        </button>
        {isModalOpen && <LoginModal onClose={() => setIsModalOpen(false)} />}
      </div>
    </div>
  );
};

export default Login;
