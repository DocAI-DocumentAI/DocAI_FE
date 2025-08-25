import { motion } from "framer-motion";
import { Key } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import {
  usePermissions,
  useDeletePermission,
  Permission,
} from "../../services/permissionService";
import StatCard from "../../components/common/StatCard";
import PermissionTable from "../../components/permissionAdmin/PermissionTable";
import DeleteConfirmationModal from "../../components/common/DeleteConfirmationModal";

const PermissionPage = () => {
  const { data: permissionsData } = usePermissions();
  const deletePermissionMutation = useDeletePermission();
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    permission: Permission | null;
  }>({ isOpen: false, permission: null });

  const handleDeleteClick = (permission: Permission) => {
    setDeleteModal({ isOpen: true, permission });
  };

  const handleDeleteConfirm = () => {
    if (!deleteModal.permission) return;

    deletePermissionMutation.mutate(deleteModal.permission.id, {
      onSuccess: () => {
        toast.success("Permission deleted successfully!");
        setDeleteModal({ isOpen: false, permission: null });
      },
      onError: (error: any) => {
        toast.error(error.message || "Failed to delete permission");
      },
    });
  };

  const handleDeleteCancel = () => {
    setDeleteModal({ isOpen: false, permission: null });
  };

  return (
    <div className="relative z-10 flex-1 overflow-auto">
      <main className="px-4 py-6 mx-auto max-w-7xl lg:px-8">
        {/* HEADER */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-2xl font-semibold text-gray-100">
            Permission Management
          </h1>
          <p className="text-gray-400">
            Manage and monitor all permissions in your organization
          </p>
        </motion.div>

        {/* STATS */}
        <motion.div
          className="grid grid-cols-1 gap-5 mb-8 sm:grid-cols-2 lg:grid-cols-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <StatCard
            name="Total Permissions"
            icon={Key}
            value={permissionsData?.total?.toString() || "0"}
            color="#F59E0B"
          />
        </motion.div>

        {/* PERMISSION TABLE */}
        <PermissionTable onDeleteClick={handleDeleteClick} />
      </main>

      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Permission"
        message="Are you sure you want to delete this permission? This action cannot be undone and may affect roles that have this permission."
        itemName={deleteModal.permission?.name}
        isLoading={deletePermissionMutation.isPending}
      />
    </div>
  );
};

export default PermissionPage;
