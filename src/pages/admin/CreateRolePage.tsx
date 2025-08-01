import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import toast from "react-hot-toast";

import Header from "../../components/common/Header";
import { useCreateRole, CreateRoleData } from "../../services/roleService";

const CreateRolePage = () => {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateRoleData>();

  const createRoleMutation = useCreateRole();

  const onSubmit = (data: CreateRoleData) => {
    createRoleMutation.mutate(data, {
      onSuccess: () => {
        toast.success("Role created successfully!");
        navigate("/admin/roles");
      },
      onError: (error: any) => {
        toast.error(error.message || "Failed to create role");
      },
    });
  };

  return (
    <div className="relative z-10 flex-1 overflow-auto">
      <Header title="Create New Role" />

      <main className="max-w-4xl px-4 py-6 mx-auto lg:px-8">
        <motion.div
          className="p-6 bg-gray-800 bg-opacity-50 border border-gray-700 shadow-lg backdrop-blur-md rounded-xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => navigate("/admin/roles")}
              className="flex items-center gap-2 px-4 py-2 text-gray-300 bg-gray-700 rounded-lg hover:bg-gray-600"
            >
              <ArrowLeft size={18} />
              Back to Roles
            </button>
            <h1 className="text-2xl font-bold text-gray-100">
              Create New Role
            </h1>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-300">
                Role Name *
              </label>
              <input
                {...register("roleName", {
                  required: "Role name is required",
                  minLength: {
                    value: 2,
                    message: "Role name must be at least 2 characters",
                  },
                })}
                className="w-full px-4 py-3 text-white bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter role name"
              />
              {errors.roleName && (
                <p className="mt-1 text-sm text-red-400">
                  {errors.roleName.message}
                </p>
              )}
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-300">
                Description *
              </label>
              <textarea
                {...register("description", {
                  required: "Description is required",
                  minLength: {
                    value: 10,
                    message: "Description must be at least 10 characters",
                  },
                })}
                rows={4}
                className="w-full px-4 py-3 text-white bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter role description"
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-400">
                  {errors.description.message}
                </p>
              )}
            </div>

            <div className="flex justify-end gap-4 pt-6">
              <button
                type="button"
                onClick={() => navigate("/admin/roles")}
                className="px-6 py-3 text-gray-300 bg-gray-700 rounded-lg hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createRoleMutation.isPending}
                className="flex items-center gap-2 px-6 py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {createRoleMutation.isPending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white rounded-full border-t-transparent animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    Create Role
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

export default CreateRolePage;
