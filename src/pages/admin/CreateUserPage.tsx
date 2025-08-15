import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Eye, EyeOff, RefreshCw, Copy } from "lucide-react";
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

// Function to generate secure password
const generateSecurePassword = (length: number = 12): string => {
  const lowercase = "abcdefghijklmnopqrstuvwxyz";
  const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const numbers = "0123456789";
  const specialChars = "!@#$%^&*()_+-=[]{}|;:,.<>?";

  // Ensure at least one character from each category
  let password = "";
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += specialChars[Math.floor(Math.random() * specialChars.length)];

  // Fill the rest with random characters from all categories
  const allChars = lowercase + uppercase + numbers + specialChars;
  for (let i = password.length; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }

  // Shuffle the password to avoid predictable patterns
  return password
    .split("")
    .sort(() => Math.random() - 0.5)
    .join("");
};

// // Function to check password strength
// const checkPasswordStrength = (password: string) => {
//   const checks = {
//     length: password.length >= 8,
//     uppercase: /[A-Z]/.test(password),
//     lowercase: /[a-z]/.test(password),
//     number: /\d/.test(password),
//     special: /[!@#$%^&*()_+=[\]{}|;:,.<>?-]/.test(password),
//   };

//   const score = Object.values(checks).filter(Boolean).length;
//   return { checks, score };
// };

const CreateUserPage = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [selectedPermissions, setSelectedPermissions] = useState<Option[]>([]);
  const [generatedPassword, setGeneratedPassword] = useState<string>("");

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

  // Generate password on component mount
  useEffect(() => {
    const newPassword = generateSecurePassword(12);
    setGeneratedPassword(newPassword);
    setValue("password", newPassword);
  }, [setValue]);

  // Function to regenerate password
  const handleRegeneratePassword = () => {
    const newPassword = generateSecurePassword(12);
    setGeneratedPassword(newPassword);
    setValue("password", newPassword);
    toast.success("New password generated!");
  };

  // Function to copy password to clipboard
  const handleCopyPassword = async () => {
    try {
      await navigator.clipboard.writeText(generatedPassword);
      toast.success("Password copied to clipboard!");
    } catch (error) {
      toast.error("Failed to copy password");
    }
  };

  const onSubmit = (data: CreateUserData) => {
    const submitData = {
      ...data,
      permissionIds: selectedPermissions.map((p) => p.id),
    };

    createUserMutation.mutate(submitData, {
      onSuccess: () => {
        toast.success(
          `User created successfully! Password: ${generatedPassword}`,
          {
            duration: 10000, // Show for 10 seconds
          }
        );
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
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-300">
                    Password * (Auto-generated)
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleCopyPassword}
                      className="flex items-center gap-1 px-2 py-1 text-xs text-green-400 rounded hover:text-green-300 hover:bg-gray-700"
                    >
                      <Copy size={14} />
                      Copy
                    </button>
                    <button
                      type="button"
                      onClick={handleRegeneratePassword}
                      className="flex items-center gap-1 px-2 py-1 text-xs text-blue-400 rounded hover:text-blue-300 hover:bg-gray-700"
                    >
                      <RefreshCw size={14} />
                      Generate New
                    </button>
                  </div>
                </div>
                <div className="relative">
                  <input
                    {...register("password", {
                      required: "Password is required",
                      minLength: {
                        value: 8,
                        message: "Password must be at least 8 characters",
                      },
                      pattern: {
                        value:
                          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+=[\]{}|;:,.<>?-])[A-Za-z\d!@#$%^&*()_+=[\]{}|;:,.<>?-]{8,}$/,
                        message:
                          "Password must contain at least 8 characters with uppercase, lowercase, number and special character",
                      },
                    })}
                    type={showPassword ? "text" : "password"}
                    value={generatedPassword}
                    readOnly
                    className="w-full px-4 py-3 pr-20 text-white bg-gray-700 border border-gray-600 rounded-lg cursor-default focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Auto-generated password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute text-gray-400 transform -translate-y-1/2 right-3 top-1/2 hover:text-gray-300"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                <div className="mt-2 text-xs text-gray-400">
                  <div className="flex items-center justify-between mb-2">
                    <p>Password Strength:</p>
                    <span className="px-2 py-1 text-xs font-medium text-green-400 bg-green-900 rounded">
                      Strong
                    </span>
                  </div>
                  <div className="mb-2">
                    <div className="w-full h-2 bg-gray-700 rounded-full">
                      <div className="w-full h-2 bg-green-500 rounded-full"></div>
                    </div>
                  </div>
                  <p>Password requirements (all met):</p>
                  <ul className="ml-4 space-y-1 list-none">
                    <li className="flex items-center">
                      <span className="mr-2 text-green-400">✓</span>
                      Minimum 8 characters
                    </li>
                    <li className="flex items-center">
                      <span className="mr-2 text-green-400">✓</span>
                      At least one uppercase letter
                    </li>
                    <li className="flex items-center">
                      <span className="mr-2 text-green-400">✓</span>
                      At least one lowercase letter
                    </li>
                    <li className="flex items-center">
                      <span className="mr-2 text-green-400">✓</span>
                      At least one number
                    </li>
                    <li className="flex items-center">
                      <span className="mr-2 text-green-400">✓</span>
                      At least one special character
                    </li>
                  </ul>
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
