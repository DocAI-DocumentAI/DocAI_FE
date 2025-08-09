export interface User {
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

// Google OAuth specific types
export interface GoogleAuthUrlResponse {
  authUrl: string;
}

export interface GoogleAuthCodeRequest {
  code: string;
}

export interface GoogleOAuthErrorData {
  message: string;
  status?: number;
}
