import { motion } from "framer-motion";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useChatboxStatisticsOverview } from "../../services/chatboxService";

// Color palette for pie chart
const COLORS = [
  "#8B5CF6", // violet
  "#10B981", // emerald
  "#F59E0B", // amber
  "#EF4444", // red
  "#3B82F6", // blue
  "#EC4899", // pink
  "#14B8A6", // teal
  "#F97316", // orange
];

const StatisticsChatbox: React.FC = () => {
  const {
    data: statisticsData,
    isLoading,
    isError,
    error,
  } = useChatboxStatisticsOverview();

  // Format data for pie chart - show model usage by session count
  const chartData =
    statisticsData?.modelUsageStats
      ?.filter((model) => model.sessionCount > 0) // Only show models with sessions
      ?.map((model, index) => ({
        name:
          model.modelName.split("/").pop()?.replace(":free", "") ||
          model.modelName,
        value: model.sessionCount,
        color: COLORS[index % COLORS.length],
        fullName: model.modelName,
        messageCount: model.messageCount,
        uniqueUsers: model.uniqueUsers,
        tokensUsed: model.tokensUsed,
      })) || [];

  // Calculate total sessions from chart data
  const totalSessions = chartData.reduce((sum, model) => sum + model.value, 0);

  // Loading state
  if (isLoading) {
    return (
      <motion.div
        className="p-6 bg-gray-800 bg-opacity-50 border border-gray-700 shadow-lg backdrop-blur-md rounded-xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <h2 className="mb-4 text-lg font-medium text-gray-100">
          Model Usage Distribution
        </h2>
        <div className="flex items-center justify-center h-80">
          <div className="flex flex-col items-center gap-4">
            <div className="w-8 h-8 border-2 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
            <p className="text-gray-400">Loading chatbox statistics...</p>
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
        transition={{ delay: 0.4 }}
      >
        <h2 className="mb-4 text-lg font-medium text-gray-100">
          Model Usage Distribution
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
            <p className="text-red-400">Failed to load chatbox statistics</p>
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
        transition={{ delay: 0.4 }}
      >
        <h2 className="mb-4 text-lg font-medium text-gray-100">
          Model Usage Distribution
        </h2>
        <div className="flex items-center justify-center h-80">
          <p className="text-gray-400">No model usage data available</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="p-6 bg-gray-800 bg-opacity-50 border border-gray-700 shadow-lg backdrop-blur-md rounded-xl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium text-gray-100">
          Model Usage Distribution
        </h2>
        <div className="text-sm text-gray-400">
          Total: {totalSessions} sessions
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6 lg:grid-cols-4">
        <div className="p-3 bg-gray-900 bg-opacity-50 rounded-lg">
          <div className="text-xs text-gray-400">Total Sessions</div>
          <div className="text-lg font-semibold text-blue-400">
            {statisticsData?.totalSessions.toLocaleString()}
          </div>
        </div>
        <div className="p-3 bg-gray-900 bg-opacity-50 rounded-lg">
          <div className="text-xs text-gray-400">Total Messages</div>
          <div className="text-lg font-semibold text-green-400">
            {statisticsData?.totalMessages.toLocaleString()}
          </div>
        </div>
        <div className="p-3 bg-gray-900 bg-opacity-50 rounded-lg">
          <div className="text-xs text-gray-400">Total Users</div>
          <div className="text-lg font-semibold text-yellow-400">
            {statisticsData?.totalUsers.toLocaleString()}
          </div>
        </div>
        <div className="p-3 bg-gray-900 bg-opacity-50 rounded-lg">
          <div className="text-xs text-gray-400">Active Sessions</div>
          <div className="text-lg font-semibold text-purple-400">
            {statisticsData?.activeSessions.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Pie Chart */}
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
                `${value} sessions`,
                name,
              ]}
              labelFormatter={(label: string) => `Model: ${label}`}
            />
            <Legend
              formatter={(value: string, entry: any) =>
                `${value} (${entry.payload.value} sessions)`
              }
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Model Summary */}
      <div className="mt-4 space-y-2">
        {chartData.slice(0, 5).map((model, index) => (
          <div
            key={index}
            className="flex items-center justify-between text-sm"
          >
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: model.color }}
              ></div>
              <span className="text-gray-300" title={model.fullName}>
                {model.name}
              </span>
            </div>
            <div className="flex items-center gap-4 text-gray-400">
              <span>{model.value} sessions</span>
              <span>{model.uniqueUsers} users</span>
            </div>
          </div>
        ))}
        {chartData.length > 5 && (
          <div className="pt-2 text-xs text-center text-gray-500">
            +{chartData.length - 5} more models
          </div>
        )}
      </div>

      {/* Generated At */}
      {statisticsData?.generatedAt && (
        <div className="pt-4 mt-4 text-xs text-center text-gray-500 border-t border-gray-700">
          Generated at: {new Date(statisticsData.generatedAt).toLocaleString()}
        </div>
      )}
    </motion.div>
  );
};

export default StatisticsChatbox;
