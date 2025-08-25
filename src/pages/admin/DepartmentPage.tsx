import { motion } from "framer-motion";
import { Building2 } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import {
  useDepartments,
  useDeleteDepartment,
  Department,
} from "../../services/departmentService";
import StatCard from "../../components/common/StatCard";
import DepartmentTable from "../../components/departmentAdmin/DepartmentTable";
import DeleteConfirmationModal from "../../components/common/DeleteConfirmationModal";

const DepartmentPage = () => {
  const { data: departmentsData } = useDepartments();
  const deleteDepartmentMutation = useDeleteDepartment();
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    department: Department | null;
  }>({ isOpen: false, department: null });

  const handleDeleteClick = (department: Department) => {
    setDeleteModal({ isOpen: true, department });
  };

  const handleDeleteConfirm = () => {
    if (!deleteModal.department) return;

    deleteDepartmentMutation.mutate(deleteModal.department.id, {
      onSuccess: () => {
        toast.success("Department deleted successfully!");
        setDeleteModal({ isOpen: false, department: null });
      },
      onError: (error: any) => {
        toast.error(error.message || "Failed to delete department");
      },
    });
  };

  const handleDeleteCancel = () => {
    setDeleteModal({ isOpen: false, department: null });
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
            Department Management
          </h1>
          <p className="text-gray-400">
            Manage and monitor all departments in your organization
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
            name="Total Departments"
            icon={Building2}
            value={departmentsData?.total?.toString() || "0"}
            color="#6366F1"
          />
        </motion.div>

        {/* DEPARTMENT TABLE */}
        <DepartmentTable onDeleteClick={handleDeleteClick} />
      </main>

      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Department"
        message="Are you sure you want to delete this department? This action cannot be undone and may affect users assigned to this department."
        itemName={deleteModal.department?.name}
        isLoading={deleteDepartmentMutation.isPending}
      />
    </div>
  );
};

export default DepartmentPage;
