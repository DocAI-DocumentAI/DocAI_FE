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

  if (isAuthenticated) {
    console.log("Redirecting to /dashboard");
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">
          Welcome to Document Search Tool
        </h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-500 text-white px-6 py-3 rounded"
        >
          Login
        </button>
        {isModalOpen && <LoginModal onClose={() => setIsModalOpen(false)} />}
      </div>
    </div>
  );
};

export default Login;
