import { api } from "./api";
import { GoogleAuthUrlResponse, GoogleAuthCodeRequest } from "../../types/User";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends LoginCredentials {
  name: string;
}

export const authApi = {
  login: async (credentials: LoginCredentials) => {
    const response = await api.post("/auth/login", credentials);
    return response.data;
  },

  // Google OAuth methods
  getGoogleAuthUrl: async (): Promise<GoogleAuthUrlResponse> => {
    const response = await api.get("/auth/google/auth-url");
    return response.data;
  },

  exchangeGoogleCode: async (data: GoogleAuthCodeRequest) => {
    const response = await api.post("/auth/exchange-code", data);
    return response.data;
  },
};
