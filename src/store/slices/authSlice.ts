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
    },
  },
});

export const { loginStart, loginSuccess, loginFailure, logout } =
  authSlice.actions;

export default authSlice.reducer;
