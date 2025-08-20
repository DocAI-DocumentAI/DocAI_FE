import { useState } from "react";
import { Search, Filter, X, ChevronDown } from "lucide-react";
import { NotificationLogsFilters } from "../../services/notificationService";

interface NotificationFiltersProps {
  filters: NotificationLogsFilters;
  onFiltersChange: (filters: NotificationLogsFilters) => void;
  onReset: () => void;
}

const NotificationFilters: React.FC<NotificationFiltersProps> = ({
  filters,
  onFiltersChange,
  onReset,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleInputChange = (field: keyof NotificationLogsFilters, value: any) => {
    onFiltersChange({
      ...filters,
      [field]: value,
      page: 1, // Reset to first page when filters change
    });
  };

  const hasActiveFilters = Object.values(filters).some(
    (value) => value !== undefined && value !== "" && value !== null
  );

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
            onChange={(e) => handleInputChange("size", parseInt(e.target.value))}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            value={filters.notificationType || ""}
            onChange={(e) => handleInputChange("notificationType", e.target.value || undefined)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Types</option>
            <option value="1">Type 1</option>
            <option value="2">Type 2</option>
            <option value="3">Type 3</option>
          </select>
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium text-gray-300">
            Sort Order
          </label>
          <select
            value={filters.isAsc === undefined ? "" : filters.isAsc.toString()}
            onChange={(e) => 
              handleInputChange("isAsc", e.target.value === "" ? undefined : e.target.value === "true")
            }
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-300">
              Document ID
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={filters.documentId || ""}
                onChange={(e) => handleInputChange("documentId", e.target.value || undefined)}
                placeholder="Enter document ID"
                className="w-full pl-10 pr-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-300">
              Recipient
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={filters.recipient || ""}
                onChange={(e) => handleInputChange("recipient", e.target.value || undefined)}
                placeholder="Enter recipient email"
                className="w-full pl-10 pr-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-300">
              Sort By
            </label>
            <select
              value={filters.sortBy || ""}
              onChange={(e) => handleInputChange("sortBy", e.target.value || undefined)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
