import { useMutation } from "@tanstack/react-query";
import { User } from "../types/User";
import { Login } from "../types/Login";
import { useDispatch } from "react-redux";
import { logout as logoutAction } from "../store/slices/authSlice";

const loginApi = async (credentials: Login): Promise<User> => {
  const response = await fetch(
    "http://localhost:5000/api" + "/auth/login",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    }
  );

  if (!response.ok) {
    throw new Error("Invalid username or password");
  }

  const data = await response.json();
  return {
    userId: data.userId,
    email: data.email,
    fullName: data.fullName,
    phone: data.phone,
    role: data.role,
    department: data.department,
    userSetting: data.userSetting,
    permissions: data.permissions,
    docaiToken: data.docaiToken,
    docaiRefreshToken: data.docaiRefreshToken,
    googleAccessToken: data.googleAccessToken,
    googleRefreshToken: data.googleRefreshToken,
    requirePasswordChange: data.requirePasswordChange,
  };
};

export const useLogin = () => {
  return useMutation<User, Error, Login>({
    mutationFn: loginApi,
  });
};

const getAuthToken = () => {
  const user = localStorage.getItem("user");
  if (user) {
    const userData = JSON.parse(user);
    return userData.docaiToken;
  }
  return null;
};

// Logout API call
const logoutUser = async (): Promise<void> => {
  const token = getAuthToken();
  if (!token) {
    throw new Error("No authentication token found");
  }

  const response = await fetch(
    "http://localhost:5000/api/auth/logout",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to logout");
  }

  return response.json();
};

// Clear all local storage and Redux data
const clearUserData = () => {
  // Clear localStorage
  localStorage.removeItem("user");
  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("userProfile");
  localStorage.removeItem("authState");

  // Clear any other auth-related data
  localStorage.removeItem("persist:root");
  localStorage.removeItem("persist:auth");

  // Clear all localStorage items that might contain user data
  const keysToRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (
      key &&
      (key.includes("auth") || key.includes("user") || key.includes("token"))
    ) {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach((key) => localStorage.removeItem(key));
};

// React Query hook for logout
export const useLogout = () => {
  const dispatch = useDispatch();

  return useMutation({
    mutationFn: logoutUser,
    onSuccess: () => {
      // Clear user data after successful logout
      clearUserData();
      // Dispatch Redux logout action
      dispatch(logoutAction());
    },
    onError: (error) => {
      // Even if logout API fails, clear local data for security
      console.error("Logout API failed:", error);
      clearUserData();
      // Still dispatch Redux logout action for security
      dispatch(logoutAction());
    },
  });
};

// Manual logout function (can be used without React Query)
export const performLogout = async (): Promise<void> => {
  try {
    await logoutUser();
  } catch (error) {
    console.error("Logout API failed:", error);
  } finally {
    // Always clear local data regardless of API success/failure
    clearUserData();
  }
};
