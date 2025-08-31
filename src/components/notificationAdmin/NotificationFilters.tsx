import { useState } from "react";
import { Search, Filter, X, ChevronDown } from "lucide-react";
import { NotificationLogsFilters } from "../../services/notificationService";

interface NotificationFiltersProps {
  filters: NotificationLogsFilters;
  onFiltersChange: (filters: NotificationLogsFilters) => void;
  onReset: () => void;
}

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

// Convert enum name back to number for dropdown display
const getNotificationTypeNumber = (enumName: string): number | undefined => {
  switch (enumName) {
    case "NearingExpiration": return 1;
    case "Expired": return 2;
    case "DocumentUpdate": return 3;
    case "SystemMaintenance": return 4;
    case "SystemEscalation": return 5;
    case "General": return 6;
    case "DocumentSubmitted": return 7;
    case "DocumentApproved": return 8;
    case "DocumentRejected": return 9;
    default: return undefined;
  }
};

const NotificationFilters: React.FC<NotificationFiltersProps> = ({
  filters,
  onFiltersChange,
  onReset,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleInputChange = (
    field: keyof NotificationLogsFilters,
    value: any
  ) => {
    // Convert notification type number to enum name for API
    if (field === "notificationType" && value && !isNaN(Number(value))) {
      value = getNotificationTypeEnumName(Number(value));
    }

    onFiltersChange({
      ...filters,
      [field]: value,
      page: 1, // Reset to first page when filters change
    });
  };

  const hasActiveFilters = Object.values(filters).some(
    (value) => value !== undefined && value !== "" && value !== null
  );

  // Define available notification types
  const notificationTypes = [
    { value: 1, label: getNotificationTypeLabel(1).label },
    { value: 2, label: getNotificationTypeLabel(2).label },
    { value: 3, label: getNotificationTypeLabel(3).label },
    { value: 4, label: getNotificationTypeLabel(4).label },
    { value: 5, label: getNotificationTypeLabel(5).label },
    { value: 6, label: getNotificationTypeLabel(6).label },
    { value: 7, label: getNotificationTypeLabel(7).label },
    { value: 8, label: getNotificationTypeLabel(8).label },
    { value: 9, label: getNotificationTypeLabel(9).label },
  ];

  return (
    <div className="p-4 mb-6 bg-gray-800 bg-opacity-50 border border-gray-700 shadow-lg backdrop-blur-md rounded-xl">
      {/* Filter Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-blue-400" />
          <h3 className="text-lg font-semibold text-gray-100">Filters</h3>
          {hasActiveFilters && (
            <span className="px-2 py-1 text-xs font-medium text-blue-300 bg-blue-900 bg-opacity-50 rounded-full">
              Active
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <button
              onClick={onReset}
              className="flex items-center gap-1 px-3 py-1 text-sm text-red-400 transition-colors hover:text-red-300"
            >
              <X className="w-4 h-4" />
              Reset
            </button>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 px-3 py-1 text-sm text-gray-400 transition-colors hover:text-gray-300"
          >
            <ChevronDown
              className={`w-4 h-4 transition-transform ${
                isExpanded ? "rotate-180" : ""
              }`}
            />
            {isExpanded ? "Collapse" : "Expand"}
          </button>
        </div>
      </div>

      {/* Quick Filters (Always Visible) */}
      <div className="grid grid-cols-1 gap-4 mb-4 md:grid-cols-3">
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-300">
            Page Size
          </label>
          <select
            value={filters.size || 10}
            onChange={(e) =>
              handleInputChange("size", parseInt(e.target.value))
            }
            className="w-full px-3 py-2 text-gray-100 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium text-gray-300">
            Notification Type
          </label>
          <select
            value={
              filters.notificationType
                ? getNotificationTypeNumber(filters.notificationType) || ""
                : ""
            }
            onChange={(e) =>
              handleInputChange("notificationType", e.target.value || undefined)
            }
            className="w-full px-3 py-2 text-gray-100 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Types</option>
            {notificationTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium text-gray-300">
            Sort Order
          </label>
          <select
            value={filters.isAsc === undefined ? "" : filters.isAsc.toString()}
            onChange={(e) =>
              handleInputChange(
                "isAsc",
                e.target.value === "" ? undefined : e.target.value === "true"
              )
            }
            className="w-full px-3 py-2 text-gray-100 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Default</option>
            <option value="true">Ascending</option>
            <option value="false">Descending</option>
          </select>
        </div>
      </div>

      {/* Expanded Filters */}
      {isExpanded && (
        <div className="grid grid-cols-1 gap-4 pt-4 border-t border-gray-700 md:grid-cols-2 lg:grid-cols-3">
          {/* <div>
            <label className="block mb-1 text-sm font-medium text-gray-300">
              Document ID
            </label>
            <div className="relative">
              <Search className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
              <input
                type="text"
                value={filters.documentId || ""}
                onChange={(e) =>
                  handleInputChange("documentId", e.target.value || undefined)
                }
                placeholder="Enter document ID"
                className="w-full py-2 pl-10 pr-3 text-gray-100 placeholder-gray-400 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div> */}

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-300">
              Recipient
            </label>
            <div className="relative">
              <Search className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
              <input
                type="text"
                value={filters.recipient || ""}
                onChange={(e) =>
                  handleInputChange("recipient", e.target.value || undefined)
                }
                placeholder="Enter recipient email"
                className="w-full py-2 pl-10 pr-3 text-gray-100 placeholder-gray-400 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-300">
              Sort By
            </label>
            <select
              value={filters.sortBy || ""}
              onChange={(e) =>
                handleInputChange("sortBy", e.target.value || undefined)
              }
              className="w-full px-3 py-2 text-gray-100 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Default</option>
              <option value="createAt">Created Date</option>
              <option value="sentAt">Sent Date</option>
              <option value="notificationType">Notification Type</option>
              <option value="recipientAddress">Recipient</option>
              <option value="subject">Subject</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationFilters;
