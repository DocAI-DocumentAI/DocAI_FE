import React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { FormProvider, useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import {
  loginStart,
  loginSuccess,
  loginFailure,
} from "../store/slices/authSlice";
import { useLogin, type LoginCredentials } from "../services/authService";

interface LoginModalProps {
  onClose: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ onClose }) => {
  const methods = useForm<LoginCredentials>({
    defaultValues: {
      usernameOrPhoneNumber: "",
      password: "",
      otp: "",
    },
  });
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = methods;
  const dispatch = useDispatch();
  const loginMutation = useLogin();

  const onSubmit = (data: LoginCredentials) => {
    dispatch(loginStart());
    loginMutation.mutate(data, {
      onSuccess: (response) => {
        // response chính là LoginResponse từ API
        dispatch(
          loginSuccess({
            id: response.id,
            username: response.username,
            phoneNumber: response.phoneNumber,
            fullName: response.fullName,
            token: response.token,
            refreshToken: response.refreshToken,
          })
        );
        onClose();
      },
      onError: (error: any) => {
        dispatch(loginFailure(error.message || "Login failed"));
      },
    });
  };

  return (
    <Dialog.Root open onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 transition-opacity duration-300 bg-black/50 backdrop-blur-sm" />
        <Dialog.Content className="fixed w-full max-w-md p-8 transform -translate-x-1/2 -translate-y-1/2 bg-white shadow-2xl top-1/2 left-1/2 rounded-xl">
          <Dialog.Title className="mb-6 text-2xl font-semibold text-gray-800">
            Sign In
          </Dialog.Title>
          <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Username or Phone Number
                </label>
                <input
                  {...register("usernameOrPhoneNumber", {
                    required: "Username or Phone Number is required",
                  })}
                  className="w-full p-3 mt-1 transition duration-200 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your username or phone number"
                />
                {errors.usernameOrPhoneNumber && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.usernameOrPhoneNumber.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <input
                  {...register("password", {
                    required: "Password is required",
                  })}
                  type="password"
                  className="w-full p-3 mt-1 transition duration-200 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your password"
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.password.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  OTP (Optional)
                </label>
                <input
                  {...register("otp")}
                  className="w-full p-3 mt-1 transition duration-200 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter OTP if 2FA is enabled"
                />
              </div>
              {loginMutation.isError && (
                <p className="text-sm text-red-600">
                  {loginMutation.error?.message}
                </p>
              )}
              <div className="flex justify-end space-x-3">
                <Dialog.Close asChild>
                  <button className="px-4 py-2 text-gray-700 transition duration-200 bg-gray-200 rounded-lg hover:bg-gray-300">
                    Cancel
                  </button>
                </Dialog.Close>
                <button
                  type="submit"
                  disabled={loginMutation.isPending}
                  className="px-4 py-2 text-white transition duration-200 bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loginMutation.isPending ? "Signing in..." : "Sign In"}
                </button>
              </div>
            </form>
          </FormProvider>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default LoginModal;
