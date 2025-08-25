import { motion } from "framer-motion";
import { Shield } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { useRoles, useDeleteRole, Role } from "../../services/roleService";
import StatCard from "../../components/common/StatCard";
import RoleTable from "../../components/roleAdmin/RoleTable";
import DeleteConfirmationModal from "../../components/common/DeleteConfirmationModal";

const RolePage = () => {
  const { data: rolesData } = useRoles();
  const deleteRoleMutation = useDeleteRole();
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    role: Role | null;
  }>({ isOpen: false, role: null });

  const handleDeleteClick = (role: Role) => {
    setDeleteModal({ isOpen: true, role });
  };

  const handleDeleteConfirm = () => {
    if (!deleteModal.role) return;

    deleteRoleMutation.mutate(deleteModal.role.id, {
      onSuccess: () => {
        toast.success("Role deleted successfully!");
        setDeleteModal({ isOpen: false, role: null });
      },
      onError: (error: any) => {
        toast.error(error.message || "Failed to delete role");
        setDeleteModal({ isOpen: false, role: null });
      },
    });
  };

  const handleDeleteCancel = () => {
    setDeleteModal({ isOpen: false, role: null });
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
            Role Management
          </h1>
          <p className="text-gray-400">
            Manage and monitor all roles in your organization
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
            name="Total Roles"
            icon={Shield}
            value={rolesData?.total?.toString() || "0"}
            color="#10B981"
          />
        </motion.div>

        {/* ROLE TABLE */}
        <RoleTable onDeleteClick={handleDeleteClick} />
      </main>

      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Role"
        message="Are you sure you want to delete this role? This action cannot be undone and may affect users assigned to this role."
        itemName={deleteModal.role?.roleName}
        isLoading={deleteRoleMutation.isPending}
      />
    </div>
  );
};

export default RolePage;
