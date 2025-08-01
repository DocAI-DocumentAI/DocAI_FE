import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import Select from "react-select";
import toast from "react-hot-toast";

import Header from "../../components/common/Header";
import MultiSelect, { Option } from "../../components/common/MultiSelect";
import {
  useUser,
  useUpdateUser,
  UpdateUserData,
} from "../../services/userService";
import { useRoles } from "../../services/roleService";
import { useDepartments } from "../../services/departmentService";
import { usePermissions } from "../../services/permissionService";

const UpdateUserPage = () => {
  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>();
  const [selectedPermissions, setSelectedPermissions] = useState<Option[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<UpdateUserData>();

  // React Query hooks
  const {
    data: userData,
    isLoading: userLoading,
    isError: userError,
  } = useUser(userId!);
  const updateUserMutation = useUpdateUser();
  const { data: rolesData, isLoading: rolesLoading } = useRoles();
  const { data: departmentsData, isLoading: departmentsLoading } =
    useDepartments();
  const { data: permissionsData, isLoading: permissionsLoading } =
    usePermissions();

  // Pre-fill form when user data is loaded
  useEffect(() => {
    if (userData) {
      reset({
        fullName: userData.fullName,
        phone: userData.phone,
        email: userData.email,
        roleId: userData.role.id,
        departmentId: userData.department.id,
        active: userData.active,
        requirePasswordChange: false,
        permissionIds: userData.permissions.map((p) => p.id),
      });

      // Set selected permissions for MultiSelect
      const userPermissions = userData.permissions.map((permission) => ({
        id: permission.id,
        name: permission.name,
        description: permission.description,
      }));
      setSelectedPermissions(
        userPermissions.map((permission) => ({
          ...permission,
          value: permission.id,
        }))
      );
    }
  }, [userData, reset]);

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
    permissionsData?.items.map((permission) => ({
      id: permission.id,
      name: permission.name,
      value: permission.id,
      description: permission.description,
    })) || [];

  const onSubmit = (data: UpdateUserData) => {
    const submitData = {
      ...data,
      permissionIds: selectedPermissions.map((p) => p.id),
    };

    updateUserMutation.mutate(
      { userId: userId!, userData: submitData },
      {
        onSuccess: () => {
          toast.success("User updated successfully!");
          navigate("/admin/users");
        },
        onError: (error: any) => {
          toast.error(error.message || "Failed to update user");
        },
      }
    );
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

  if (userLoading) {
    return (
      <div className="relative z-10 flex-1 overflow-auto">
        <Header title="Update User" />
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-blue-500 rounded-full border-t-transparent animate-spin" />
        </div>
      </div>
    );
  }

  if (userError || !userData) {
    return (
      <div className="relative z-10 flex-1 overflow-auto">
        <Header title="Update User" />
        <div className="flex items-center justify-center h-64">
          <p className="text-red-400">Failed to load user data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative z-10 flex-1 overflow-auto">
      <Header title="Update User" />

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
              Update User: {userData.fullName}
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
                  value={roleOptions.find(
                    (option) => option.value === userData.role.id
                  )}
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
                  value={departmentOptions.find(
                    (option) => option.value === userData.department.id
                  )}
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

            {/* Status Options */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="flex items-center">
                <input
                  {...register("active")}
                  type="checkbox"
                  className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                />
                <label className="ml-2 text-sm font-medium text-gray-300">
                  Active User
                </label>
              </div>

              <div className="flex items-center">
                <input
                  {...register("requirePasswordChange")}
                  type="checkbox"
                  className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                />
                <label className="ml-2 text-sm font-medium text-gray-300">
                  Require Password Change
                </label>
              </div>
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
                  updateUserMutation.isPending ||
                  selectedPermissions.length === 0
                }
                className="flex items-center gap-2 px-6 py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {updateUserMutation.isPending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white rounded-full border-t-transparent animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    Update User
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

export default UpdateUserPage;
