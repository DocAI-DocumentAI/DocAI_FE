import { api } from "./api";
import { GoogleAuthUrlResponse, GoogleAuthCodeRequest } from "../../types/User";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends LoginCredentials {
  name: string;
}

export interface DepartmentUser {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  isActive: boolean;
  creatAt: string;
  role: {
    id: string;
    roleName: string;
    description: string;
  };
  department: {
    id: string;
    departmentName: string;
    description: string;
  };
  permissions: Array<{
    id: string;
    permissionName: string;
    description: string;
  }>;
}

export interface DepartmentUsersRequest {
  page?: number;
  size?: number;
  keyword?: string;
  sortBy?: string;
  isAsc?: boolean;
}

export interface DepartmentUsersResponse {
  items: DepartmentUser[];
  pageIndex: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
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

  // Get department users
  getDepartmentUsers: async (params: DepartmentUsersRequest = {}): Promise<DepartmentUsersResponse> => {
    const searchParams = new URLSearchParams();

    if (params.page) searchParams.append('page', params.page.toString());
    if (params.size) searchParams.append('size', params.size.toString());
    if (params.keyword) searchParams.append('keyword', params.keyword);
    if (params.sortBy) searchParams.append('sortBy', params.sortBy);
    if (params.isAsc !== undefined) searchParams.append('isAsc', params.isAsc.toString());

    const response = await api.get(`/auth/department-users?${searchParams.toString()}`);
    return response.data;
  },
};
