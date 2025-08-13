import { api } from "./api";

// Interfaces
export interface UserSettings {
  twoFactorEnabled: boolean;
  twoFactorMethod: string;
  notificationsEnabled: boolean;
}

export interface UserProfile {
  fullName: string;
  phone: string;
  email: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

// API Functions
export const updateSettings = async (settings: UserSettings) => {
  const response = await api.patch('/auth/settings', settings);
  return response.data;
};

export const updateProfile = async (profile: UserProfile) => {
  const response = await api.patch('/auth/update-profile', profile);
  return response.data;
};

export const changePassword = async (passwordData: ChangePasswordRequest) => {
  const response = await api.patch('/auth/change-password', passwordData);
  return response.data;
};

// Get current user profile/settings
export const getCurrentUser = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};