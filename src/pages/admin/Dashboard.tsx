// import { useSelector, useDispatch } from "react-redux";
// import { RootState } from "../../store";
// // import { logout } from "../../store/slices/authSlice";
// import { Navigate } from "react-router-dom";

import { Users, Building2, Shield, Key, FileText } from "lucide-react";
import { motion } from "framer-motion";

import Header from "../../components/common/Header";
import StatCard from "../../components/common/StatCard";
import { useUsers } from "../../services/userService";
import { useDepartments } from "../../services/departmentService";
import { usePermissions } from "../../services/permissionService";
import { useRoles } from "../../services/roleService";
import { useDocumentTypes } from "../../services/documentTypeService";
import SalesOverviewChart from "../../components/dashboard/SalesOverviewChart";
import CategoryDistributionChart from "../../components/dashboard/CategoryDistributionChart";
import SalesChannelChart from "../../components/dashboard/SalesChannelChart";

// Giả lập các component cho từng vai trò

const Dashboard: React.FC = () => {
  // Fetch data for all entities
  const { data: usersData } = useUsers();
  const { data: departmentsData } = useDepartments();
  const { data: permissionsData } = usePermissions();
  const { data: rolesData } = useRoles();
  const { data: documentTypesData } = useDocumentTypes();

  return (
    <div className="relative z-10 flex-1 overflow-auto">
      <Header title="Dashboard" />

      <main className="px-4 py-6 mx-auto max-w-7xl lg:px-8">
        {/* STATS */}
        <motion.div
          className="grid grid-cols-1 gap-5 mb-8 sm:grid-cols-2 lg:grid-cols-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <StatCard
            name="Total Users"
            icon={Users}
            value={usersData?.total?.toString() || "0"}
            color="#34D399"
          />
          <StatCard
            name="Total Departments"
            icon={Building2}
            value={departmentsData?.total?.toString() || "0"}
            color="#F87171"
          />
          <StatCard
            name="Total Roles"
            icon={Shield}
            value={rolesData?.total?.toString() || "0"}
            color="#A78BFA"
          />
          <StatCard
            name="Total Permissions"
            icon={Key}
            value={permissionsData?.total?.toString() || "0"}
            color="#F472B6"
          />
          <StatCard
            name="Document Types"
            icon={FileText}
            value={documentTypesData?.total?.toString() || "0"}
            color="#60A5FA"
          />
        </motion.div>

        {/* CHARTS */}

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <SalesOverviewChart />
          <CategoryDistributionChart />
          <SalesChannelChart />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
