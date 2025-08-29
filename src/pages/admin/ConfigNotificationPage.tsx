import { motion } from "framer-motion";
import {
  Clock,
  Calendar,
  Database,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Edit,
  Zap,
  Bell,
  BellRing,
  ToggleLeft,
  ToggleRight,
  Info,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/common/Header";
import { useNotificationConfig } from "../../services/notificationService";
import { getCronDescription } from "../../utils/cronUtils";

// Format date for display
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString() + " " + date.toLocaleTimeString();
};

// // Format cron expression for display
// const formatCronExpression = (cronExpression: string) => {
//   // Basic cron expression formatting - you can enhance this
//   const parts = cronExpression.split(" ");
//   if (parts.length >= 6) {
//     const [second, minute, hour] = parts;
//     if (hour === "7" && minute === "0" && second === "0") {
//       return "Daily at 7:00 AM";
//     }
//   }
//   return cronExpression;
// };

const ConfigNotificationPage: React.FC = () => {
  const navigate = useNavigate();

  // Fetch data using React Query
  const {
    data: configData,
    isLoading,
    isError,
    error,
  } = useNotificationConfig();

  const handleEditClick = () => {
    if (configData?.id) {
      navigate(`/admin/config-notification/update/${configData.id}`);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="relative z-10 flex-1 overflow-auto">
        <Header title="Notification Configuration" />
        <main className="px-4 py-6 mx-auto max-w-7xl lg:px-8">
          <div className="flex items-center justify-center h-64">
            <div className="flex flex-col items-center gap-4">
              <div className="w-8 h-8 border-2 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
              <p className="text-gray-400">
                Loading notification configuration...
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="relative z-10 flex-1 overflow-auto">
        <Header title="Notification Configuration" />
        <main className="px-4 py-6 mx-auto max-w-7xl lg:px-8">
          <div className="flex items-center justify-center h-64">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 text-red-500">
                <XCircle className="w-full h-full" />
              </div>
              <p className="text-red-400">
                Failed to load notification configuration
              </p>
              <p className="text-sm text-gray-500">
                {error?.message || "Unknown error"}
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="relative z-10 flex-1 overflow-auto">
      <Header title="Notification Configuration" />

      <main className="px-4 py-6 mx-auto max-w-7xl lg:px-8">
        {/* Header with Edit Button */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-100">
              Notification Configuration
            </h1>
            <p className="text-gray-400">
              Manage notification settings and scheduling
            </p>
          </div>
          <button
            onClick={handleEditClick}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white transition-colors bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit Configuration
          </button>
        </div>

        {/* Configuration Card */}
        {configData && (
          <motion.div
            className="p-6 bg-gray-800 bg-opacity-50 border border-gray-700 shadow-lg backdrop-blur-md rounded-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <h3 className="mb-2 text-xl font-semibold text-gray-100">
                  {configData.configKey} Configuration
                </h3>
                <p className="text-sm text-gray-400">ID: {configData.id}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center px-3 py-1 text-sm font-medium text-green-300 bg-green-900 bg-opacity-50 rounded-full">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Active
                </span>
              </div>
            </div>

            {/* Configuration Details Grid */}
            <div className="grid grid-cols-1 gap-6 mb-6 md:grid-cols-2 lg:grid-cols-3">
              {/* Warning Threshold */}
              <div className="p-4 bg-gray-900 bg-opacity-50 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-400" />
                  <h4 className="text-sm font-medium text-gray-300">
                    Warning Threshold
                  </h4>
                </div>
                <p className="text-2xl font-semibold text-gray-100">
                  {configData.warningThresholdDays}
                </p>
                <p className="text-sm text-gray-400">days</p>
              </div>

              {/* Log Retention */}
              <div className="p-4 bg-gray-900 bg-opacity-50 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <Database className="w-5 h-5 text-blue-400" />
                  <h4 className="text-sm font-medium text-gray-300">
                    Log Retention
                  </h4>
                </div>
                <p className="text-2xl font-semibold text-gray-100">
                  {configData.logRetentionDays}
                </p>
                <p className="text-sm text-gray-400">days</p>
              </div>

              {/* Quartz Status */}
              <div className="p-4 bg-gray-900 bg-opacity-50 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <Zap className="w-5 h-5 text-green-400" />
                  <h4 className="text-sm font-medium text-gray-300">
                    Quartz Scheduler
                  </h4>
                </div>
                <div className="flex items-center gap-2">
                  {configData.quartzEnabled ? (
                    <>
                      <CheckCircle className="w-5 h-5 text-green-400" />
                      <span className="text-lg font-semibold text-green-400">
                        Enabled
                      </span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-5 h-5 text-red-400" />
                      <span className="text-lg font-semibold text-red-400">
                        Disabled
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Expired Notification Cron */}
              <div className="p-4 bg-gray-900 bg-opacity-50 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <Calendar className="w-5 h-5 text-red-400" />
                  <h4 className="text-sm font-medium text-gray-300">
                    Expired Notification Schedule
                  </h4>
                </div>
                <p className="mb-1 text-lg font-semibold text-gray-100">
                  {getCronDescription(configData.expiredNotificationCron)}
                </p>
                <p className="font-mono text-xs text-gray-400">
                  {configData.expiredNotificationCron}
                </p>
              </div>

              {/* Near Expired Notification Cron */}
              <div className="p-4 bg-gray-900 bg-opacity-50 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <Calendar className="w-5 h-5 text-yellow-400" />
                  <h4 className="text-sm font-medium text-gray-300">
                    Near Expired Notification Schedule
                  </h4>
                </div>
                <p className="mb-1 text-lg font-semibold text-gray-100">
                  {getCronDescription(configData.nearExpiredNotificationCron)}
                </p>
                <p className="font-mono text-xs text-gray-400">
                  {configData.nearExpiredNotificationCron}
                </p>
              </div>

              {/* Near Expired Mode */}
              <div className="p-4 bg-gray-900 bg-opacity-50 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <Info className="w-5 h-5 text-blue-400" />
                  <h4 className="text-sm font-medium text-gray-300">
                    Near Expired Mode
                  </h4>
                </div>
                <p className="text-lg font-semibold text-gray-100">
                  {configData.nearExpiredModeDescription}
                </p>
              </div>

              {/* Enable Expired Notifications */}
              <div className="p-4 bg-gray-900 bg-opacity-50 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <Bell className="w-5 h-5 text-purple-400" />
                  <h4 className="text-sm font-medium text-gray-300">
                    Expired Notifications
                  </h4>
                </div>
                <div className="flex items-center gap-2">
                  {configData.enableExpiredNotifications ? (
                    <>
                      <ToggleRight className="w-6 h-6 text-green-400" />{" "}
                      <span className="font-semibold text-green-400">
                        Enabled
                      </span>
                    </>
                  ) : (
                    <>
                      <ToggleLeft className="w-6 h-6 text-gray-500" />{" "}
                      <span className="font-semibold text-gray-500">
                        Disabled
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Enable Near Expired Notifications */}
              <div className="p-4 bg-gray-900 bg-opacity-50 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <BellRing className="w-5 h-5 text-purple-400" />
                  <h4 className="text-sm font-medium text-gray-300">
                    Near-Expired Notifications
                  </h4>
                </div>
                <div className="flex items-center gap-2">
                  {configData.enableNearExpiredNotifications ? (
                    <>
                      <ToggleRight className="w-6 h-6 text-green-400" />{" "}
                      <span className="font-semibold text-green-400">
                        Enabled
                      </span>
                    </>
                  ) : (
                    <>
                      <ToggleLeft className="w-6 h-6 text-gray-500" />{" "}
                      <span className="font-semibold text-gray-500">
                        Disabled
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Next Execution Times */}
            <div className="py-4 border-t border-gray-700">
              <h4 className="mb-4 text-lg font-medium text-gray-200">
                Next Scheduled Notifications
              </h4>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-400">
                    Next Expired Check:{" "}
                    <span className="text-gray-300">
                      {formatDate(configData.nextExpiredNotificationTime)}
                    </span>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-400">
                    Next Near-Expired Check:{" "}
                    <span className="text-gray-300">
                      {formatDate(configData.nextNearExpiredNotificationTime)}
                    </span>
                  </span>
                </div>
              </div>
            </div>

            {/* Timestamps */}
            <div className="pt-4 border-t border-gray-700">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-400">
                    Created:{" "}
                    <span className="text-gray-300">
                      {formatDate(configData.createAt)}
                    </span>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-400">
                    Updated:{" "}
                    <span className="text-gray-300">
                      {formatDate(configData.updateAt)}
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default ConfigNotificationPage;
