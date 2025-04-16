import { useMutation } from "@tanstack/react-query";

export interface LoginCredentials {
  usernameOrPhoneNumber: string;
  password: string;
  otp?: string;
}

export interface LoginResponse {
  id: string;
  username: string;
  phoneNumber: string;
  fullName: string;
  token: string;
  refreshToken: string;
}

const loginApi = async (
  credentials: LoginCredentials
): Promise<LoginResponse> => {
  const response = await fetch("https://production.doca.love/api/v1/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    throw new Error("Invalid username or password");
  }

  const data = await response.json();
  return {
    id: data.id,
    username: data.username,
    phoneNumber: data.phoneNumber,
    fullName: data.fullName,
    token: data.token,
    refreshToken: data.refreshToken,
  };
};

export const useLogin = () => {
  return useMutation<LoginResponse, Error, LoginCredentials>({
    mutationFn: loginApi,
  });
};
