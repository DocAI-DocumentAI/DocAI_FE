import React from "react";
import { motion } from "framer-motion";
import {
  ResponsiveContainer,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Legend,
  Tooltip,
} from "recharts";
import { useModelStatistics } from "../../services/chatboxService";

// Transform model data to radar chart format
const transformModelDataToRadar = (modelData: any[]) => {
  if (!modelData || modelData.length === 0) {
    // Return default data structure if no API data
    return [
      { subject: "Sessions", A: 0, B: 0, fullMark: 150 },
      { subject: "Messages", A: 0, B: 0, fullMark: 150 },
      { subject: "Users", A: 0, B: 0, fullMark: 150 },
      { subject: "Avg Session", A: 0, B: 0, fullMark: 150 },
      { subject: "Usage %", A: 0, B: 0, fullMark: 150 },
      { subject: "Recent Activity", A: 0, B: 0, fullMark: 150 },
    ];
  }

  // Get top 2 models by session count
  const topModels = modelData
    .sort((a, b) => b.sessionCount - a.sessionCount)
    .slice(0, 2);

  // If only one model, duplicate it for comparison
  if (topModels.length === 1) {
    topModels.push(topModels[0]);
  }

  if (topModels.length === 0) return [];

  // Create radar chart data structure
  const subjects = [
    "Sessions",
    "Messages",
    "Users",
    "Avg Session",
    "Recent Activity",
  ];

  // Calculate max values across all models for normalization
  const allValues = {
    sessions: modelData.map((m) => m.sessionCount),
    messages: modelData.map((m) => m.messageCount),
    users: modelData.map((m) => m.uniqueUsers),
    avgSession: modelData.map((m) => m.averageSessionLength),
  };

  const maxValues = {
    sessions: Math.max(...allValues.sessions, 1),
    messages: Math.max(...allValues.messages, 1),
    users: Math.max(...allValues.users, 1),
    avgSession: Math.max(...allValues.avgSession, 1),
  };

  return subjects.map((subject) => {
    const dataPoint: any = { subject, fullMark: 150 };

    topModels.forEach((model, index) => {
      const key = index === 0 ? "A" : "B";

      switch (subject) {
        case "Sessions":
          dataPoint[key] = Math.round(
            (model.sessionCount / maxValues.sessions) * 150
          );
          break;
        case "Messages":
          dataPoint[key] = Math.round(
            (model.messageCount / maxValues.messages) * 150
          );
          break;
        case "Users":
          dataPoint[key] = Math.round(
            (model.uniqueUsers / maxValues.users) * 150
          );
          break;
        case "Avg Session":
          dataPoint[key] = Math.round(
            (model.averageSessionLength / maxValues.avgSession) * 150
          );
          break;
        case "Recent Activity": {
          // Calculate days since last used (more recent = higher score)
          const daysSince = Math.floor(
            (Date.now() - new Date(model.lastUsed).getTime()) /
              (1000 * 60 * 60 * 24)
          );
          dataPoint[key] = Math.max(0, Math.min(150, 150 - daysSince * 5)); // Recent activity score
          break;
        }
        default:
          dataPoint[key] = 0;
      }
    });

    return dataPoint;
  });
};

const StatisticsModel: React.FC = () => {
  // Fetch data using React Query
  const { data: modelData, isLoading, isError, error } = useModelStatistics();

  // Transform API data to radar chart format
  const radarData = transformModelDataToRadar(modelData || []);

  // Debug log to see the data
  console.log("Model Data from API:", modelData);
  console.log("Transformed Radar Data:", radarData);

  // Get model names for legend
  const getModelNames = () => {
    if (!modelData || modelData.length === 0)
      return { modelA: "No Data", modelB: "No Data" };

    const topModels = modelData
      .sort((a, b) => b.sessionCount - a.sessionCount)
      .slice(0, 2);

    const modelA =
      topModels[0]?.modelName.split("/").pop()?.replace(":free", "") ||
      "Model A";
    const modelB =
      topModels[1]?.modelName.split("/").pop()?.replace(":free", "") ||
      "Model B";

    return { modelA, modelB };
  };

  const modelNames = getModelNames();

  // Loading state
  if (isLoading) {
    return (
      <motion.div
        className="p-6 bg-gray-800 bg-opacity-50 border border-gray-700 shadow-lg backdrop-filter backdrop-blur-lg rounded-xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <h2 className="mb-4 text-xl font-semibold text-gray-100">
          Model Comparison
        </h2>
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-4">
            <div className="w-8 h-8 border-2 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
            <p className="text-gray-400">Loading model statistics...</p>
          </div>
        </div>
      </motion.div>
    );
  }

  // Error state
  if (isError) {
    return (
      <motion.div
        className="p-6 bg-gray-800 bg-opacity-50 border border-gray-700 shadow-lg backdrop-filter backdrop-blur-lg rounded-xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <h2 className="mb-4 text-xl font-semibold text-gray-100">
          Model Comparison
        </h2>
        <div className="flex items-center justify-center h-64">
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
            <p className="text-red-400">Failed to load model statistics</p>
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
      className="p-6 bg-gray-800 bg-opacity-50 border border-gray-700 shadow-lg backdrop-filter backdrop-blur-lg rounded-xl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
    >
      <h2 className="mb-4 text-xl font-semibold text-gray-100">
        Model Comparison
      </h2>
      <div style={{ width: "100%", height: 300 }}>
        <ResponsiveContainer>
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
            <PolarGrid stroke="#374151" />
            <PolarAngleAxis dataKey="subject" stroke="#9CA3AF" />
            <PolarRadiusAxis angle={30} domain={[0, 150]} stroke="#9CA3AF" />
            <Radar
              name={modelNames.modelA}
              dataKey="A"
              stroke="#8B5CF6"
              fill="#8B5CF6"
              fillOpacity={0.6}
            />
            <Radar
              name={modelNames.modelB}
              dataKey="B"
              stroke="#10B981"
              fill="#10B981"
              fillOpacity={0.6}
            />
            <Legend />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(31, 41, 55, 0.8)",
                borderColor: "#4B5563",
              }}
              itemStyle={{ color: "#E5E7EB" }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};

export default StatisticsModel;
