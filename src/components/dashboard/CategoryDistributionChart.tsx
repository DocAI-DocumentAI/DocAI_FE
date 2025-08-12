import { motion } from "framer-motion";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useDepartmentUserDistribution } from "../../services/departmentUserService";

const DepartmentUserDistributionChart: React.FC = () => {
  const {
    data: departmentData,
    isLoading,
    isError,
    error,
  } = useDepartmentUserDistribution();

  // Format data for pie chart
  const chartData =
    departmentData?.map((dept) => ({
      name: dept.departmentName,
      value: dept.userCount,
      color: dept.color,
    })) || [];

  // Calculate total users
  const totalUsers = chartData.reduce((sum, dept) => sum + dept.value, 0);

  // Loading state
  if (isLoading) {
    return (
      <motion.div
        className="p-6 bg-gray-800 bg-opacity-50 border border-gray-700 shadow-lg backdrop-blur-md rounded-xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h2 className="mb-4 text-lg font-medium text-gray-100">
          Users by Department
        </h2>
        <div className="flex items-center justify-center h-80">
          <div className="flex flex-col items-center gap-4">
            <div className="w-8 h-8 border-2 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
            <p className="text-gray-400">Loading department data...</p>
          </div>
        </div>
      </motion.div>
    );
  }

  // Error state
  if (isError) {
    return (
      <motion.div
        className="p-6 bg-gray-800 bg-opacity-50 border border-gray-700 shadow-lg backdrop-blur-md rounded-xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h2 className="mb-4 text-lg font-medium text-gray-100">
          Users by Department
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
            <p className="text-red-400">Failed to load department data</p>
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
        className="p-6 bg-gray-800 bg-opacity-50 border border-gray-700 shadow-lg backdrop-blur-md rounded-xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h2 className="mb-4 text-lg font-medium text-gray-100">
          Users by Department
        </h2>
        <div className="flex items-center justify-center h-80">
          <p className="text-gray-400">No department data available</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="p-6 bg-gray-800 bg-opacity-50 border border-gray-700 shadow-lg backdrop-blur-md rounded-xl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium text-gray-100">
          Users by Department
        </h2>
        <div className="text-sm text-gray-400">Total: {totalUsers} users</div>
      </div>

      <div className="h-80">
        <ResponsiveContainer width={"100%"} height={"100%"}>
          <PieChart>
            <Pie
              data={chartData}
              cx={"50%"}
              cy={"50%"}
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              label={({ name, percent }) =>
                `${name} ${(percent * 100).toFixed(0)}%`
              }
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
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
            <Legend
              formatter={(value: string, entry: any) =>
                `${value} (${entry.payload.value} users)`
              }
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Department Summary */}
      <div className="mt-4 space-y-2">
        {chartData.slice(0, 5).map((dept, index) => (
          <div
            key={index}
            className="flex items-center justify-between text-sm"
          >
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: dept.color }}
              ></div>
              <span className="text-gray-300">{dept.name}</span>
            </div>
            <span className="text-gray-400">{dept.value} users</span>
          </div>
        ))}
        {chartData.length > 5 && (
          <div className="pt-2 text-xs text-center text-gray-500">
            +{chartData.length - 5} more departments
          </div>
        )}
      </div>
    </motion.div>
  );
};
export default DepartmentUserDistributionChart;
