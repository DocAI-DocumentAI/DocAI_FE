import { UserCheck, UserPlus, UsersIcon, UserX } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { getUsersApi } from "../../services/userService";
import toast from "react-hot-toast";

import Header from "../../components/common/Header";
import StatCard from "../../components/common/StatCard";
import UsersTable from "../../components/userAdmin/UsersTable";
import UserGrowthChart from "../../components/userAdmin/UserGrowthChart";
import UserActivityHeatmap from "../../components/userAdmin/UserActivityHeatmap";
import UserDemographicsChart from "../../components/userAdmin/UserDemographicsChart";

const UsersPage: React.FC = () => {
  const [userStats, setUserStats] = useState({
    totalUsers: 0,
    newUsersToday: 0,
    activeUsers: 0,
    churnRate: "0%",
  });
  const [loading, setLoading] = useState(false);

  const calculateStats = async () => {
    setLoading(true);
    try {
      const today = new Date().toISOString().split("T")[0];

      // Get all users
      const allUsersResponse = await getUsersApi({ size: 1000 });

      // Get today's users
      const todayUsersResponse = await getUsersApi({
        createdFrom: today,
        createdTo: today,
        size: 1000,
      });

      const activeUsers = allUsersResponse.items.filter(
        (user) => user.active
      ).length;
      const inactiveUsers = allUsersResponse.items.filter(
        (user) => !user.active
      ).length;
      const churnRate =
        activeUsers > 0
          ? ((inactiveUsers / (activeUsers + inactiveUsers)) * 100).toFixed(1)
          : "0";

      setUserStats({
        totalUsers: allUsersResponse.total,
        newUsersToday: todayUsersResponse.total,
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
    calculateStats();
  }, []);

  return (
    <div className="relative z-10 flex-1 overflow-auto">
      <Header title="Users" />

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
            icon={UserX}
            value={loading ? "..." : userStats.churnRate}
            color="#EF4444"
          />
        </motion.div>

        <UsersTable />

        {/* USER CHARTS */}
        <div className="grid grid-cols-1 gap-6 mt-8 lg:grid-cols-2">
          <UserGrowthChart />
          <UserActivityHeatmap />
          <UserDemographicsChart />
        </div>
      </main>
    </div>
  );
};
export default UsersPage;
