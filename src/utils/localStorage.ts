import { User } from '../types/User';

// Storage keys
const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
  REFRESH_TOKEN: 'refreshToken',
  GOOGLE_ACCESS_TOKEN: 'googleAccessToken',
  GOOGLE_REFRESH_TOKEN: 'googleRefreshToken',
} as const;

/**
 * Safely store user data in localStorage
 */
export const storeUserData = (user: User): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.TOKEN, user.docaiToken);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    
    if (user.docaiRefreshToken) {
      localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, user.docaiRefreshToken);
    }
    
    if (user.googleAccessToken) {
      localStorage.setItem(STORAGE_KEYS.GOOGLE_ACCESS_TOKEN, user.googleAccessToken);
    }
    
    if (user.googleRefreshToken) {
      localStorage.setItem(STORAGE_KEYS.GOOGLE_REFRESH_TOKEN, user.googleRefreshToken);
    }
  } catch (error) {
    console.error('Failed to store user data:', error);
  }
};

/**
 * Retrieve user data from localStorage
 */
export const getUserData = (): User | null => {
  try {
    const userStr = localStorage.getItem(STORAGE_KEYS.USER);
    if (!userStr) return null;
    
    return JSON.parse(userStr) as User;
  } catch (error) {
    console.error('Failed to retrieve user data:', error);
    return null;
  }
};

/**
 * Get authentication token
 */
export const getAuthToken = (): string | null => {
  return localStorage.getItem(STORAGE_KEYS.TOKEN);
};

/**
 * Get refresh token
 */
export const getRefreshToken = (): string | null => {
  return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
};

/**
 * Get Google access token
 */
export const getGoogleAccessToken = (): string | null => {
  return localStorage.getItem(STORAGE_KEYS.GOOGLE_ACCESS_TOKEN);
};

/**
 * Get Google refresh token
 */
export const getGoogleRefreshToken = (): string | null => {
  return localStorage.getItem(STORAGE_KEYS.GOOGLE_REFRESH_TOKEN);
};

/**
 * Update authentication token
 */
export const updateAuthToken = (token: string): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.TOKEN, token);
  } catch (error) {
    console.error('Failed to update auth token:', error);
  }
};

/**
 * Update user data in localStorage
 */
export const updateUserData = (user: Partial<User>): void => {
  try {
    const currentUser = getUserData();
    if (currentUser) {
      const updatedUser = { ...currentUser, ...user };
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));
    }
  } catch (error) {
    console.error('Failed to update user data:', error);
  }
};

/**
 * Clear all authentication data
 */
export const clearAuthData = (): void => {
  try {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  } catch (error) {
    console.error('Failed to clear auth data:', error);
  }
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  const token = getAuthToken();
  const user = getUserData();
  return !!(token && user);
};

/**
 * Check if user has specific role
 */
export const hasRole = (roleName: string): boolean => {
  const user = getUserData();
  return user?.role?.roleName === roleName;
};

/**
 * Check if user has specific permission
 */
export const hasPermission = (permissionName: string): boolean => {
  const user = getUserData();
  return user?.permissions?.some(permission => permission.name === permissionName) || false;
};

/**
 * Get user role
 */
export const getUserRole = (): string | null => {
  const user = getUserData();
  return user?.role?.roleName || null;
};

/**
 * Check if tokens are expired (basic check)
 * Note: This is a simple check. In production, you might want to decode JWT tokens
 */
export const areTokensExpired = (): boolean => {
  // This is a placeholder implementation
  // In a real application, you would decode the JWT token and check its expiration
  const token = getAuthToken();
  if (!token) return true;
  
  // For now, we'll assume tokens are valid if they exist
  // You should implement proper JWT token validation here
  return false;
};

export default {
  storeUserData,
  getUserData,
  getAuthToken,
  getRefreshToken,
  getGoogleAccessToken,
  getGoogleRefreshToken,
  updateAuthToken,
  updateUserData,
  clearAuthData,
  isAuthenticated,
  hasRole,
  hasPermission,
  getUserRole,
  areTokensExpired,
};
