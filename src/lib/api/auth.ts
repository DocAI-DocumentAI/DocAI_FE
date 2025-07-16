import { api } from "./api";
 
export interface LoginCredentials { 
  email: string;
  password: string;
}

export interface RegisterData extends LoginCredentials {
  name: string;
}

export const authApi = {
  login: async (credentials: LoginCredentials) => { 
    const response = await api.post('/auth/login', credentials); 
    return response.data;
  },

  // register: async (data: RegisterData) => {
  //   const response = await api.post('/Auth/register', data);
  //   return response.data;
  // },

  // logout: async () => {
  //   const response = await api.post('/auth/logout');
  //   return response.data;
  // },

  // getCurrentUser: async () => {
  //   const response = await api.get('/auth/me');
  //   return response.data;
  // },
}; 