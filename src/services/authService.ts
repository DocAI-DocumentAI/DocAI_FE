import { useMutation } from "@tanstack/react-query";
import { User } from "../types/User";
import { Login } from "../types/Login";

const loginApi = async (credentials: Login): Promise<User> => {
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
  return useMutation<User, Error, Login>({
    mutationFn: loginApi,
  });
};
