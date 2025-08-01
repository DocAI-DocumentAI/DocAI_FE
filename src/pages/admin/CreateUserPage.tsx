import { useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Eye, EyeOff } from "lucide-react";
import Select from "react-select";
import toast from "react-hot-toast";

import Header from "../../components/common/Header";
import MultiSelect, { Option } from "../../components/common/MultiSelect";
import { useCreateUser, CreateUserData } from "../../services/userService";
import { useRoles } from "../../services/roleService";
import { useDepartments } from "../../services/departmentService";
import { usePermissions } from "../../services/permissionService";

const DEFAULT_COLORS = [
  "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200",
  "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200",
  "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
  "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
];

const CreateUserPage = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [selectedPermissions, setSelectedPermissions] = useState<Option[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CreateUserData>();

  // React Query hooks
  const createUserMutation = useCreateUser();
  const { data: rolesData, isLoading: rolesLoading } = useRoles();
  const { data: departmentsData, isLoading: departmentsLoading } =
    useDepartments();
  const { data: permissionsData, isLoading: permissionsLoading } =
    usePermissions();

  // Transform data for react-select
  const roleOptions =
    rolesData?.items.map((role) => ({
      value: role.id,
      label: role.roleName,
    })) || [];

  const departmentOptions =
    departmentsData?.items.map((dept) => ({
      value: dept.id,
      label: dept.name,
    })) || [];

  // Transform permissions for MultiSelect with colors
  const permissionOptions: Option[] =
    permissionsData?.items.map((permission, index) => ({
      id: permission.id,
      name: permission.name,
      value: permission.id,
      description: permission.description,
      color: DEFAULT_COLORS[index % DEFAULT_COLORS.length], // Thêm màu
    })) || [];

  const onSubmit = (data: CreateUserData) => {
    const submitData = {
      ...data,
      permissionIds: selectedPermissions.map((p) => p.id),
    };

    createUserMutation.mutate(submitData, {
      onSuccess: () => {
        toast.success("User created successfully!");
        navigate("/admin/users");
      },
      onError: (error: any) => {
        toast.error(error.message || "Failed to create user");
      },
    });
  };

  const customSelectStyles = {
    control: (provided: any) => ({
      ...provided,
      backgroundColor: "#374151",
      borderColor: "#4B5563",
      color: "#F9FAFB",
      minHeight: "48px",
      "&:hover": {
        borderColor: "#6B7280",
      },
    }),
    menu: (provided: any) => ({
      ...provided,
      backgroundColor: "#374151",
    }),
    option: (provided: any, state: any) => ({
      ...provided,
      backgroundColor: state.isFocused ? "#4B5563" : "#374151",
      color: "#F9FAFB",
      "&:hover": {
        backgroundColor: "#4B5563",
      },
    }),
    singleValue: (provided: any) => ({
      ...provided,
      color: "#F9FAFB",
    }),
  };

  return (
    <div className="relative z-10 flex-1 overflow-auto">
      <Header title="Create New User" />

      <main className="max-w-4xl px-4 py-6 mx-auto lg:px-8">
        <motion.div
          className="p-6 bg-gray-800 bg-opacity-50 border border-gray-700 shadow-lg backdrop-blur-md rounded-xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => navigate("/admin/users")}
              className="flex items-center gap-2 px-4 py-2 text-gray-300 bg-gray-700 rounded-lg hover:bg-gray-600"
            >
              <ArrowLeft size={18} />
              Back to Users
            </button>
            <h1 className="text-2xl font-bold text-gray-100">
              Create New User
            </h1>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Personal Information */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-300">
                  Full Name *
                </label>
                <input
                  {...register("fullName", {
                    required: "Full name is required",
                    minLength: {
                      value: 2,
                      message: "Full name must be at least 2 characters",
                    },
                  })}
                  className="w-full px-4 py-3 text-white bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter full name"
                />
                {errors.fullName && (
                  <p className="mt-1 text-sm text-red-400">
                    {errors.fullName.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-300">
                  Email *
                </label>
                <input
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Invalid email address",
                    },
                  })}
                  type="email"
                  className="w-full px-4 py-3 text-white bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter email address"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-400">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-300">
                  Phone *
                </label>
                <input
                  {...register("phone", {
                    required: "Phone number is required",
                    pattern: {
                      value: /^[0-9+\-\s()]+$/,
                      message: "Invalid phone number format",
                    },
                  })}
                  className="w-full px-4 py-3 text-white bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter phone number"
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-400">
                    {errors.phone.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-300">
                  Password *
                </label>
                <div className="relative">
                  <input
                    {...register("password", {
                      required: "Password is required",
                      minLength: {
                        value: 8,
                        message: "Password must be at least 8 characters",
                      },
                    })}
                    type={showPassword ? "text" : "password"}
                    className="w-full px-4 py-3 pr-12 text-white bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute text-gray-400 transform -translate-y-1/2 right-3 top-1/2 hover:text-gray-300"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-400">
                    {errors.password.message}
                  </p>
                )}
              </div>
            </div>

            {/* Role and Department */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-300">
                  Role *
                </label>
                <Select
                  options={roleOptions}
                  styles={customSelectStyles}
                  placeholder="Select a role..."
                  isLoading={rolesLoading}
                  onChange={(option) => setValue("roleId", option?.value || "")}
                />
                {errors.roleId && (
                  <p className="mt-1 text-sm text-red-400">Role is required</p>
                )}
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-300">
                  Department *
                </label>
                <Select
                  options={departmentOptions}
                  styles={customSelectStyles}
                  placeholder="Select a department..."
                  isLoading={departmentsLoading}
                  onChange={(option) =>
                    setValue("departmentId", option?.value || "")
                  }
                />
                {errors.departmentId && (
                  <p className="mt-1 text-sm text-red-400">
                    Department is required
                  </p>
                )}
              </div>
            </div>

            {/* Permissions */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-300">
                Permissions *
              </label>
              <MultiSelect
                options={permissionOptions}
                selectedOptions={selectedPermissions}
                onChange={setSelectedPermissions}
                placeholder="Select permissions..."
                isLoading={permissionsLoading}
              />
              {selectedPermissions.length === 0 && (
                <p className="mt-1 text-sm text-red-400">
                  At least one permission is required
                </p>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-4 pt-6">
              <button
                type="button"
                onClick={() => navigate("/admin/users")}
                className="px-6 py-3 text-gray-300 bg-gray-700 rounded-lg hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={
                  createUserMutation.isPending ||
                  selectedPermissions.length === 0
                }
                className="flex items-center gap-2 px-6 py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {createUserMutation.isPending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white rounded-full border-t-transparent animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    Create User
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </main>
    </div>
  );
};

export default CreateUserPage;
