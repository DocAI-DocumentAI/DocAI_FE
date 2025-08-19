import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import {
  Users as UsersIcon,
  UserPlus,
  UserCheck,
  TrendingDown,
} from "lucide-react";
import { getUsersApi } from "../../services/userService";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import toast from "react-hot-toast";

import StatCard from "../../components/common/StatCard";
import UsersTableManager from "../../components/userAdmin/UsersTableManager";

const UserManagerPage: React.FC = () => {
  const [userStats, setUserStats] = useState({
    totalUsers: 0,
    newUsersToday: 0,
    activeUsers: 0,
    churnRate: "0%",
  });
  const [loading, setLoading] = useState(false);

  // Get current user and manager department
  const { user } = useSelector((state: RootState) => state.auth);
  const managerDepartmentId = user?.department?.id;
  const departmentName = user?.department?.name || "Unknown Department";

  const calculateStats = async () => {
    if (!managerDepartmentId) return;

    setLoading(true);
    try {
      // Get all users in manager's department
      const allUsersResponse = await getUsersApi({
        departmentId: managerDepartmentId,
        size: 1000, // Get all users
      });

      // Get today's users in manager's department
      const today = new Date().toISOString().split("T")[0];
      const todayUsersResponse = await getUsersApi({
        departmentId: managerDepartmentId,
        createdFrom: today,
        createdTo: today,
        size: 1000,
      });

      // Calculate active vs inactive users (exclude Admin role)
      const allUsers = (allUsersResponse.items || []).filter(
        (user) => user.role.roleName !== "Admin"
      );
      const todayUsers = (todayUsersResponse.items || []).filter(
        (user) => user.role.roleName !== "Admin"
      );
      const activeUsers = allUsers.filter((user) => user.active).length;
      const inactiveUsers = allUsers.filter((user) => !user.active).length;

      // Calculate churn rate (percentage of inactive users)
      const churnRate =
        activeUsers > 0
          ? ((inactiveUsers / (activeUsers + inactiveUsers)) * 100).toFixed(1)
          : "0";

      setUserStats({
        totalUsers: allUsers.length,
        newUsersToday: todayUsers.length,
        activeUsers,
        churnRate: `${churnRate}%`,
      });
    } catch (error: any) {
      toast.error(`Error loading user stats: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (managerDepartmentId) {
      calculateStats();
    }
  }, [managerDepartmentId]);

  // Check if user is Manager
  if (!user || user.role?.roleName !== "Manager") {
    return (
      <div className="p-6 bg-red-800 bg-opacity-50 border border-red-700 shadow-lg backdrop-blur-md rounded-xl">
        <div className="text-center text-red-100">
          <h2 className="mb-2 text-xl font-semibold">Access Denied</h2>
          <p>Only users with Manager role can access this page.</p>
        </div>
      </div>
    );
  }

  if (!managerDepartmentId) {
    return (
      <div className="p-6 bg-red-800 bg-opacity-50 border border-red-700 shadow-lg backdrop-blur-md rounded-xl">
        <div className="text-center text-red-100">
          <h2 className="mb-2 text-xl font-semibold">Department Not Found</h2>
          <p>
            Manager department information is missing. Please contact
            administrator.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* STATS */}
      <motion.div
        className="grid grid-cols-1 gap-5 mb-8 sm:grid-cols-2 lg:grid-cols-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        <StatCard
          name="Total Users"
          icon={UsersIcon}
          value={loading ? "..." : userStats.totalUsers.toLocaleString()}
          color="#6366F1"
        />
        <StatCard
          name="New Users Today"
          icon={UserPlus}
          value={loading ? "..." : userStats.newUsersToday.toString()}
          color="#10B981"
        />
        <StatCard
          name="Active Users"
          icon={UserCheck}
          value={loading ? "..." : userStats.activeUsers.toLocaleString()}
          color="#F59E0B"
        />
        <StatCard
          name="Churn Rate"
          icon={TrendingDown}
          value={loading ? "..." : userStats.churnRate}
          color="#EF4444"
        />
      </motion.div>

      {/* Department Info */}
      <motion.div
        className="p-4 mb-6 bg-blue-800 bg-opacity-50 border border-blue-700 shadow-lg backdrop-blur-md rounded-xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <div className="text-center">
          <h2 className="text-xl font-bold text-blue-100">
            Managing Department: {departmentName}
          </h2>
          <p className="text-sm text-blue-200">
            View and manage users in your department
          </p>
        </div>
      </motion.div>

      {/* Users Table */}
      <UsersTableManager />
    </div>
  );
};

export default UserManagerPage;
