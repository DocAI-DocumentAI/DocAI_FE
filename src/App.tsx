import React, { useEffect, useState } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "./store";
import routes from "./routes";
import { initializeAuth } from "./store/slices/authSlice";
import { ChatProvider } from "./context/chat-context";

const App: React.FC = () => {
  const dispatch = useDispatch();
  const [isInitialized, setIsInitialized] = useState(false);
  const { loading } = useSelector((state: RootState) => state.auth);

  // Initialize auth state from localStorage on app start
  useEffect(() => {
    const initAuth = async () => {
      try {
        dispatch(initializeAuth());
      } catch (error) {
        console.error("Failed to initialize auth:", error);
      } finally {
        setIsInitialized(true);
      }
    };

    initAuth();
  }, [dispatch]);

  // Show loading spinner while initializing
  if (!isInitialized || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="w-8 h-8 border-2 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
      </div>
    );
  }

  // Create router with our routes
  const router = createBrowserRouter(routes);

  return (
    <ChatProvider>
      <RouterProvider router={router} />
    </ChatProvider>
  );
};

export default App;
