import { motion } from "framer-motion";
import { useState } from "react";
import {
  Bell,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Header from "../../components/common/Header";
import NotificationFilters from "../../components/notificationAdmin/NotificationFilters";
import {
  useNotificationLogs,
  NotificationLogsFilters,
  NotificationLog,
} from "../../services/notificationService";

// Format date for display
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString() + " " + date.toLocaleTimeString();
};

// Get notification type label for display - user friendly
const getNotificationTypeLabel = (type: number) => {
  switch (type) {
    case 1:
      return {
        label: "Nearing Expiration",
        color: "text-yellow-400 bg-yellow-900",
      };
    case 2:
      return { label: "Expired", color: "text-red-400 bg-red-900" };
    case 3:
      return { label: "Document Update", color: "text-blue-400 bg-blue-900" };
    case 4:
      return {
        label: "System Maintenance",
        color: "text-purple-400 bg-purple-900",
      };
    case 5:
      return { label: "System Escalation", color: "text-red-500 bg-red-900" };
    case 6:
      return { label: "General", color: "text-gray-400 bg-gray-900" };
    case 7:
      return {
        label: "Document Submitted",
        color: "text-green-400 bg-green-900",
      };
    case 8:
      return {
        label: "Document Approved",
        color: "text-emerald-400 bg-emerald-900",
      };
    case 9:
      return { label: "Document Rejected", color: "text-red-400 bg-red-900" };
    default:
      return { label: "Unknown", color: "text-gray-400 bg-gray-900" };
  }
};

// Convert notification type number to enum name for API
const getNotificationTypeEnumName = (type: number): string => {
  switch (type) {
    case 1: return "NearingExpiration";
    case 2: return "Expired";
    case 3: return "DocumentUpdate";
    case 4: return "SystemMaintenance";
    case 5: return "SystemEscalation";
    case 6: return "General";
    case 7: return "DocumentSubmitted";
    case 8: return "DocumentApproved";
    case 9: return "DocumentRejected";
    default: return "Unknown";
  }
};

// Get recipient type label
const getRecipientTypeLabel = (type: number) => {
  switch (type) {
    case 1:
      return "Email";
    case 2:
      return "SMS";
    case 3:
      return "Push";
    default:
      return "Unknown";
  }
};

// Truncate text
const truncateText = (text: string, maxLength: number) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
};

const NotificationDashboardPage: React.FC = () => {
  const [filters, setFilters] = useState<NotificationLogsFilters>({
    page: 1,
    size: 10,
  });

  const [selectedNotification, setSelectedNotification] =
    useState<NotificationLog | null>(null);

  // Fetch data using React Query
  const {
    data: logsData,
    isLoading,
    isError,
    error,
  } = useNotificationLogs(filters);

  const handleFiltersChange = (newFilters: NotificationLogsFilters) => {
    setFilters(newFilters);
  };

  const handleResetFilters = () => {
    setFilters({
      page: 1,
      size: 10,
    });
  };

  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({
      ...prev,
      page: newPage,
    }));
  };

  const handleViewDetails = (notification: NotificationLog) => {
    setSelectedNotification(notification);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="relative z-10 flex-1 overflow-auto">
        <Header title="Notification Dashboard" />
        <main className="px-4 py-6 mx-auto max-w-7xl lg:px-8">
          <div className="flex items-center justify-center h-64">
            <div className="flex flex-col items-center gap-4">
              <div className="w-8 h-8 border-2 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
              <p className="text-gray-400">Loading notification logs...</p>
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
        <Header title="Notification Dashboard" />
        <main className="px-4 py-6 mx-auto max-w-7xl lg:px-8">
          <div className="flex items-center justify-center h-64">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 text-red-500">
                <XCircle className="w-full h-full" />
              </div>
              <p className="text-red-400">Failed to load notification logs</p>
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
      <Header title="Notification Dashboard" />

      <main className="px-4 py-6 mx-auto max-w-7xl lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-100">
            Notification Dashboard
          </h1>
          <p className="text-gray-400">Monitor and manage notification logs</p>
        </div>

        {/* Summary Stats */}
        <motion.div
          className="grid grid-cols-1 gap-5 mb-6 sm:grid-cols-2 lg:grid-cols-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <div className="p-6 bg-gray-800 bg-opacity-50 border border-gray-700 shadow-lg backdrop-blur-md rounded-xl">
            <div className="flex items-center">
              <Bell className="w-8 h-8 text-blue-400" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Total Logs</p>
                <p className="text-2xl font-semibold text-gray-100">
                  {logsData?.total || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 bg-gray-800 bg-opacity-50 border border-gray-700 shadow-lg backdrop-blur-md rounded-xl">
            <div className="flex items-center">
              <CheckCircle className="w-8 h-8 text-green-400" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Sent</p>
                <p className="text-2xl font-semibold text-gray-100">
                  {logsData?.items.filter((item) => item.isSent).length || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 bg-gray-800 bg-opacity-50 border border-gray-700 shadow-lg backdrop-blur-md rounded-xl">
            <div className="flex items-center">
              <XCircle className="w-8 h-8 text-red-400" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Failed</p>
                <p className="text-2xl font-semibold text-gray-100">
                  {logsData?.items.filter((item) => !item.isSent).length || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 bg-gray-800 bg-opacity-50 border border-gray-700 shadow-lg backdrop-blur-md rounded-xl">
            <div className="flex items-center">
              <Clock className="w-8 h-8 text-purple-400" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">
                  Current Page
                </p>
                <p className="text-2xl font-semibold text-gray-100">
                  {logsData?.page || 1} / {logsData?.totalPages || 1}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Filters */}
        <NotificationFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onReset={handleResetFilters}
        />

        {/* Notification Logs Table */}
        <motion.div
          className="bg-gray-800 bg-opacity-50 border border-gray-700 shadow-lg backdrop-blur-md rounded-xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-300">
                <thead className="text-xs text-gray-400 uppercase bg-gray-700 bg-opacity-50">
                  <tr>
                    <th className="px-6 py-3">Type</th>
                    <th className="px-6 py-3">Recipient</th>
                    <th className="px-6 py-3">Subject</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Sent At</th>
                    <th className="px-6 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {logsData?.items.map((notification, index) => {
                    const notificationType = getNotificationTypeLabel(
                      notification.notificationType
                    );
                    return (
                      <motion.tr
                        key={notification.id}
                        className="border-b border-gray-700 hover:bg-gray-700 hover:bg-opacity-30"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                      >
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-opacity-50 ${notificationType.color}`}
                          >
                            {notificationType.label}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <div className="font-medium text-gray-100">
                              {notification.recipientAddress}
                            </div>
                            <div className="text-xs text-gray-400">
                              {getRecipientTypeLabel(
                                notification.recipientType
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="max-w-xs">
                            <div className="font-medium text-gray-100">
                              {truncateText(notification.subject, 50)}
                            </div>
                            <div className="text-xs text-gray-400">
                              Doc: {notification.documentVersion}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {notification.isSent ? (
                              <CheckCircle className="w-4 h-4 text-green-400" />
                            ) : (
                              <XCircle className="w-4 h-4 text-red-400" />
                            )}
                            <span
                              className={
                                notification.isSent
                                  ? "text-green-400"
                                  : "text-red-400"
                              }
                            >
                              {notification.isSent ? "Sent" : "Failed"}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-400">
                          {notification.sentAt
                            ? formatDate(notification.sentAt)
                            : "N/A"}
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleViewDetails(notification)}
                            className="flex items-center gap-1 px-3 py-1 text-xs text-blue-400 transition-colors hover:text-blue-300"
                          >
                            <Eye className="w-3 h-3" />
                            View
                          </button>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {logsData && logsData.totalPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-gray-400">
                  Showing {(logsData.page - 1) * logsData.size + 1} to{" "}
                  {Math.min(logsData.page * logsData.size, logsData.total)} of{" "}
                  {logsData.total} results
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(logsData.page - 1)}
                    disabled={logsData.page <= 1}
                    className="flex items-center gap-1 px-3 py-1 text-sm text-gray-400 transition-colors hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </button>
                  <span className="px-3 py-1 text-sm text-gray-300">
                    Page {logsData.page} of {logsData.totalPages}
                  </span>
                  <button
                    onClick={() => handlePageChange(logsData.page + 1)}
                    disabled={logsData.page >= logsData.totalPages}
                    className="flex items-center gap-1 px-3 py-1 text-sm text-gray-400 transition-colors hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Notification Details Modal */}
        {selectedNotification && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <motion.div
              className="w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 bg-gray-800 border border-gray-700 shadow-xl rounded-xl"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-100">
                  Notification Details
                </h3>
                <button
                  onClick={() => setSelectedNotification(null)}
                  className="p-2 text-gray-400 transition-colors rounded-md hover:text-gray-300 hover:bg-gray-700"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Basic Info */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-400">
                      ID
                    </label>
                    <p className="font-mono text-sm text-gray-100">
                      {selectedNotification.id}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400">
                      Document ID
                    </label>
                    <p className="font-mono text-sm text-gray-100">
                      {selectedNotification.documentId}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400">
                      Document Version
                    </label>
                    <p className="text-gray-100">
                      {selectedNotification.documentVersion}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400">
                      Notification Type
                    </label>
                    <span
                      className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-opacity-50 ${
                        getNotificationTypeLabel(
                          selectedNotification.notificationType
                        ).color
                      }`}
                    >
                      {
                        getNotificationTypeLabel(
                          selectedNotification.notificationType
                        ).label
                      }
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400">
                      Recipient
                    </label>
                    <p className="text-gray-100">
                      {selectedNotification.recipientAddress}
                    </p>
                    <p className="text-xs text-gray-400">
                      {getRecipientTypeLabel(
                        selectedNotification.recipientType
                      )}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400">
                      Status
                    </label>
                    <div className="flex items-center gap-2">
                      {selectedNotification.isSent ? (
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-400" />
                      )}
                      <span
                        className={
                          selectedNotification.isSent
                            ? "text-green-400"
                            : "text-red-400"
                        }
                      >
                        {selectedNotification.isSent ? "Sent" : "Failed"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Subject */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-400">
                    Subject
                  </label>
                  <p className="p-3 text-gray-100 bg-gray-900 bg-opacity-50 rounded-lg">
                    {selectedNotification.subject}
                  </p>
                </div>

                {/* Message */}
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-400">
                    Message
                  </label>
                  <div
                    className="p-3 overflow-y-auto text-gray-100 bg-gray-900 bg-opacity-50 rounded-lg max-h-60"
                    dangerouslySetInnerHTML={{
                      __html: selectedNotification.message,
                    }}
                  />
                </div>

                {/* Timestamps */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-400">
                      Created At
                    </label>
                    <p className="text-gray-100">
                      {formatDate(selectedNotification.createAt)}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400">
                      Sent At
                    </label>
                    <p className="text-gray-100">
                      {selectedNotification.sentAt
                        ? formatDate(selectedNotification.sentAt)
                        : "N/A"}
                    </p>
                  </div>
                </div>

                {/* Error Message */}
                {selectedNotification.errorMessage && (
                  <div>
                    <label className="block mb-2 text-sm font-medium text-red-400">
                      Error Message
                    </label>
                    <p className="p-3 text-red-300 bg-red-900 border border-red-700 rounded-lg bg-opacity-20">
                      {selectedNotification.errorMessage}
                    </p>
                  </div>
                )}

                {/* Dismissal Info */}
                {selectedNotification.isDismissed && (
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-400">
                        Dismissed At
                      </label>
                      <p className="text-gray-100">
                        {selectedNotification.dismissedAt
                          ? formatDate(selectedNotification.dismissedAt)
                          : "N/A"}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400">
                        Dismissed By
                      </label>
                      <p className="text-gray-100">
                        {selectedNotification.dismissedByUserId || "N/A"}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </main>
    </div>
  );
};

export default NotificationDashboardPage;
