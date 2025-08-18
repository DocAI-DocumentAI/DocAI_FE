import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { motion } from "framer-motion";
import { useState } from "react";
import {
  useChatboxStatistics,
  ChatboxStatisticsData,
} from "../../services/chatboxService";

// Format data for chart display
const formatChartData = (data: ChatboxStatisticsData[], timeRange: string) => {
  if (!data || data.length === 0) return [];

  return data.map((item) => {
    let name = "";

    // Format the name based on time range
    if (timeRange === "daily") {
      const date = new Date(item.date);
      name = `${date.getDate()}/${date.getMonth() + 1}`;
    } else if (timeRange === "weekly") {
      const date = new Date(item.date);
      const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      name = dayNames[date.getDay()];
    } else if (timeRange === "monthly") {
      const date = new Date(item.date);
      const monthNames = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      name = monthNames[date.getMonth()];
    }

    return {
      name,
      messageCount: item.messageCount || 0,
      sessionCount: item.sessionCount || 0,
      uniqueUsers: item.uniqueUsers || 0,
      tokensUsed: item.tokensUsed || 0,
      originalDate: item.date,
    };
  });
};

type TimeRange = "daily" | "weekly" | "monthly";

const StatisticsDaily: React.FC = () => {
  const [timeRange, setTimeRange] = useState<TimeRange>("daily");

  // Fetch data using React Query
  const {
    data: statisticsData,
    isLoading,
    isError,
    error,
  } = useChatboxStatistics(timeRange);

  // Format data for chart
  const chartData = formatChartData(statisticsData || [], timeRange);

  const getTitle = () => {
    switch (timeRange) {
      case "daily":
        return "Chatbox Statistics (Last 7 Days)";
      case "weekly":
        return "Chatbox Statistics (Last 30 Days)";
      case "monthly":
        return "Chatbox Statistics (Last Year)";
      default:
        return "Chatbox Statistics";
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <motion.div
        className="p-6 bg-gray-800 bg-opacity-50 border border-gray-700 shadow-lg backdrop-blur-md rounded-xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-gray-100">{getTitle()}</h2>
          <div className="flex gap-2">
            {(["daily", "weekly", "monthly"] as TimeRange[]).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                disabled={isLoading}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  timeRange === range
                    ? "bg-blue-600 text-white"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {range.charAt(0).toUpperCase() + range.slice(1)}
              </button>
            ))}
          </div>
        </div>
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
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-gray-100">{getTitle()}</h2>
          <div className="flex gap-2">
            {(["daily", "weekly", "monthly"] as TimeRange[]).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  timeRange === range
                    ? "bg-blue-600 text-white"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
              >
                {range.charAt(0).toUpperCase() + range.slice(1)}
              </button>
            ))}
          </div>
        </div>
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

  return (
    <motion.div
      className="p-6 bg-gray-800 bg-opacity-50 border border-gray-700 shadow-lg backdrop-blur-md rounded-xl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium text-gray-100">{getTitle()}</h2>

        {/* Time Range Selector */}
        <div className="flex gap-2">
          {(["daily", "weekly", "monthly"] as TimeRange[]).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                timeRange === range
                  ? "bg-blue-600 text-white"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              {range.charAt(0).toUpperCase() + range.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="h-80">
        <ResponsiveContainer width={"100%"} height={"100%"}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#4B5563" />
            <XAxis dataKey={"name"} stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(31, 41, 55, 0.8)",
                borderColor: "#4B5563",
              }}
              itemStyle={{ color: "#E5E7EB" }}
              labelStyle={{ color: "#E5E7EB" }}
            />

            {/* Line for Message Count */}
            <Line
              type="monotone"
              dataKey="messageCount"
              stroke="#10B981"
              strokeWidth={3}
              dot={{ fill: "#10B981", strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, strokeWidth: 2 }}
              name="Messages"
            />

            {/* Line for Session Count */}
            <Line
              type="monotone"
              dataKey="sessionCount"
              stroke="#6366F1"
              strokeWidth={3}
              dot={{ fill: "#6366F1", strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, strokeWidth: 2 }}
              name="Sessions"
            />

            {/* Line for Unique Users */}
            <Line
              type="monotone"
              dataKey="uniqueUsers"
              stroke="#F59E0B"
              strokeWidth={3}
              dot={{ fill: "#F59E0B", strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, strokeWidth: 2 }}
              name="Unique Users"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span className="text-sm text-gray-300">Messages</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          <span className="text-sm text-gray-300">Sessions</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          <span className="text-sm text-gray-300">Unique Users</span>
        </div>
      </div>
    </motion.div>
  );
};

export default StatisticsDaily;
