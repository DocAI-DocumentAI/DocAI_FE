import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AuthState } from "../../types/AuthState";

interface User {
  userId: string;
  email: string;
  fullName: string;
  phone: string;
  role: {
    id: string;
    roleName: string;
    description: string;
    createAt: string;
    updateAt: string;
  };
  department: {
    id: string;
    name: string;
    description: string;
    createAt: string;
    updateAt: string;
  };
  userSetting: {
    id: string;
    twoFactorEnabled: boolean;
    twoFactorMethod: string;
    notificationsEnabled: boolean;
    updateAt: string;
  };
  permissions: Array<{
    id: string;
    name: string;
    description: string;
    createAt: string;
    updateAt: string;
  }>;
  docaiToken: string;
  docaiRefreshToken: string;
  googleAccessToken: string | null;
  googleRefreshToken: string | null;
  requirePasswordChange: boolean;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginStart(state) {
      state.loading = true;
      state.error = null;
    },
    loginSuccess(state, action: PayloadAction<User>) {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.loading = false;
      state.error = null;

      // Save to localStorage for persistence
      localStorage.setItem("user", JSON.stringify(action.payload));
      localStorage.setItem("token", action.payload.docaiToken);
    },
    loginFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
    logout(state) {
      state.user = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
      // Clear localStorage on logout
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    },
    // Google OAuth specific actions
    googleAuthStart(state) {
      state.loading = true;
      state.error = null;
    },
    googleAuthSuccess(state, action: PayloadAction<User>) {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.loading = false;
      state.error = null;

      // Save to localStorage for persistence
      localStorage.setItem("user", JSON.stringify(action.payload));
      localStorage.setItem("token", action.payload.docaiToken);
    },
    googleAuthFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
    // Clear error state
    clearError(state) {
      state.error = null;
    },
    // Initialize auth state from localStorage
    initializeAuth(state) {
      console.log("Initializing auth from localStorage...");
      const token = localStorage.getItem("token");
      const userStr = localStorage.getItem("user");

      console.log("Token exists:", !!token);
      console.log("User data exists:", !!userStr);

      if (token && userStr) {
        try {
          const user = JSON.parse(userStr);
          console.log("Parsed user data:", user);

          // Validate user data structure
          if (user && user.userId && user.role) {
            state.user = user;
            state.isAuthenticated = true;
            console.log("Auth initialized successfully");
          } else {
            console.log("Invalid user data structure, clearing localStorage");
            localStorage.removeItem("token");
            localStorage.removeItem("user");
          }
        } catch (error) {
          console.error("Error parsing user data:", error);
          // If parsing fails, clear localStorage
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        }
      } else {
        console.log("No token or user data found in localStorage");
      }
      state.loading = false;
    },
  },
});

export const {
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
  googleAuthStart,
  googleAuthSuccess,
  googleAuthFailure,
  clearError,
  initializeAuth,
} = authSlice.actions;

export default authSlice.reducer;
