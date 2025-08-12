import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
} from "recharts";
import { useRoleUserDistribution } from "../../services/roleUserService";

const SalesChannelChart: React.FC = () => {
  const {
    data: roleData,
    isLoading,
    isError,
    error,
  } = useRoleUserDistribution();

  // Format data for bar chart
  const chartData =
    roleData?.map((role) => ({
      name: role.roleName,
      value: role.userCount,
      color: role.color,
    })) || [];

  // Calculate total users
  const totalUsers = chartData.reduce((sum, role) => sum + role.value, 0);

  // Loading state
  if (isLoading) {
    return (
      <motion.div
        className="p-6 bg-gray-800 bg-opacity-50 border border-gray-700 shadow-lg backdrop-blur-md rounded-xl lg:col-span-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <h2 className="mb-4 text-lg font-medium text-gray-100">
          Users by Role
        </h2>
        <div className="flex items-center justify-center h-80">
          <div className="flex flex-col items-center gap-4">
            <div className="w-8 h-8 border-2 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
            <p className="text-gray-400">Loading role data...</p>
          </div>
        </div>
      </motion.div>
    );
  }

  // Error state
  if (isError) {
    return (
      <motion.div
        className="p-6 bg-gray-800 bg-opacity-50 border border-gray-700 shadow-lg backdrop-blur-md rounded-xl lg:col-span-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <h2 className="mb-4 text-lg font-medium text-gray-100">
          Users by Role
        </h2>
        <div className="flex items-center justify-center h-80">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 text-red-500">
              <svg fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <p className="text-red-400">Failed to load role data</p>
            <p className="text-sm text-gray-500">
              {error?.message || "Unknown error"}
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  // Empty state
  if (!chartData || chartData.length === 0) {
    return (
      <motion.div
        className="p-6 bg-gray-800 bg-opacity-50 border border-gray-700 shadow-lg backdrop-blur-md rounded-xl lg:col-span-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <h2 className="mb-4 text-lg font-medium text-gray-100">
          Users by Role
        </h2>
        <div className="flex items-center justify-center h-80">
          <p className="text-gray-400">No role data available</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="p-6 bg-gray-800 bg-opacity-50 border border-gray-700 shadow-lg backdrop-blur-md rounded-xl lg:col-span-2"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium text-gray-100">Users by Role</h2>
        <div className="text-sm text-gray-400">Total: {totalUsers} users</div>
      </div>

      <div className="h-80">
        <ResponsiveContainer>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#4B5563" />
            <XAxis
              dataKey="name"
              stroke="#9CA3AF"
              tick={{ fontSize: 12 }}
              interval={0}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis stroke="#9CA3AF" />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(31, 41, 55, 0.8)",
                borderColor: "#4B5563",
              }}
              itemStyle={{ color: "#E5E7EB" }}
              formatter={(value: number, name: string) => [
                `${value} users`,
                name,
              ]}
            />
            <Legend formatter={(value: string) => `${value} Users`} />
            <Bar dataKey={"value"} fill="#8884d8" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Role Summary */}
      <div className="grid grid-cols-2 gap-4 mt-4 md:grid-cols-3 lg:grid-cols-4">
        {chartData.map((role, index) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: role.color }}
            ></div>
            <span className="text-gray-300 truncate">{role.name}</span>
            <span className="ml-auto text-gray-400">{role.value}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
};
export default SalesChannelChart;
