import { motion } from "framer-motion";
import { Key } from "lucide-react";
import { usePermissions } from "../../services/permissionService";
import StatCard from "../../components/common/StatCard";
import PermissionTable from "../../components/permissionAdmin/PermissionTable";

const PermissionPage = () => {
  const { data: permissionsData } = usePermissions();

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
        <PermissionTable />
      </main>
    </div>
  );
};

export default PermissionPage;
