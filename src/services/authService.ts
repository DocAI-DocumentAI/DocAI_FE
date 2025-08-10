import { useMutation } from "@tanstack/react-query";
import { User } from "../types/User";
import { Login } from "../types/Login";

const loginApi = async (credentials: Login): Promise<User> => {
  const response = await fetch(
    "https://production.docai.asia/api" + "/auth/login",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    }
  );

  if (!response.ok) {
    throw new Error("Invalid username or password");
  }

  const data = await response.json();
  return {
    userId: data.userId,
    email: data.email,
    fullName: data.fullName,
    phone: data.phone,
    role: data.role,
    department: data.department,
    userSetting: data.userSetting,
    permissions: data.permissions,
    docaiToken: data.docaiToken,
    docaiRefreshToken: data.docaiRefreshToken,
    googleAccessToken: data.googleAccessToken,
    googleRefreshToken: data.googleRefreshToken,
    requirePasswordChange: data.requirePasswordChange,
  };
};

export const useLogin = () => {
  return useMutation<User, Error, Login>({
    mutationFn: loginApi,
  });
};
