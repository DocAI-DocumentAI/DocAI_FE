import { motion } from "framer-motion";
import { useState } from "react";
import {
  Settings,
  Eye,
  EyeOff,
  Star,
  Zap,
  Clock,
  Thermometer,
  Plus,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Header from "../../components/common/Header";
import {
  useAIConfigurations,
  useDeleteAIConfiguration,
  useActivateAIConfiguration,
  useDeactivateAIConfiguration,
  useSetDefaultAIConfiguration,
} from "../../services/chatboxService";

// Format date for display
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString() + " " + date.toLocaleTimeString();
};

// Truncate long text
const truncateText = (text: string, maxLength: number) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
};

// Custom Switch Component
interface SwitchProps {
  checked: boolean;
  onChange: (e: React.MouseEvent) => void;
  disabled?: boolean;
  size?: "sm" | "md";
  color?: "blue" | "green" | "yellow";
  label?: string;
}

const Switch: React.FC<SwitchProps> = ({
  checked,
  onChange,
  disabled = false,
  size = "sm",
  color = "blue",
  label,
}) => {
  const sizeClasses = {
    sm: "w-8 h-4",
    md: "w-10 h-5",
  };

  const thumbSizeClasses = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
  };

  const translateClasses = {
    sm: checked ? "translate-x-4" : "translate-x-0.5",
    md: checked ? "translate-x-5" : "translate-x-0.5",
  };

  const colorClasses = {
    blue: checked ? "bg-blue-600" : "bg-gray-600",
    green: checked ? "bg-green-600" : "bg-gray-600",
    yellow: checked ? "bg-yellow-600" : "bg-gray-600",
  };

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={(e) => onChange(e)}
        disabled={disabled}
        className={`
          relative inline-flex items-center rounded-full transition-colors duration-200 ease-in-out
          focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
          ${sizeClasses[size]} ${colorClasses[color]}
          ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
        `}
      >
        <span
          className={`
            inline-block bg-white rounded-full shadow transform transition-transform duration-200 ease-in-out
            ${thumbSizeClasses[size]} ${translateClasses[size]}
          `}
        />
      </button>
      {label && (
        <span
          className={`text-sm text-gray-300 ${disabled ? "opacity-50" : ""}`}
        >
          {label}
        </span>
      )}
    </div>
  );
};

const ConfigAIPage: React.FC = () => {
  const navigate = useNavigate();
  const [expandedPrompts, setExpandedPrompts] = useState<Set<string>>(
    new Set()
  );
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    configId: string;
    configName: string;
  }>({
    isOpen: false,
    configId: "",
    configName: "",
  });

  // Fetch data using React Query
  const {
    data: configData,
    isLoading,
    isError,
    error,
    refetch,
  } = useAIConfigurations();
  const deleteMutation = useDeleteAIConfiguration();
  const activateMutation = useActivateAIConfiguration();
  const deactivateMutation = useDeactivateAIConfiguration();
  const setDefaultMutation = useSetDefaultAIConfiguration();

  const togglePromptExpansion = (id: string) => {
    const newExpanded = new Set(expandedPrompts);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedPrompts(newExpanded);
  };

  const handleDeleteClick = (
    e: React.MouseEvent,
    configId: string,
    configName: string
  ) => {
    e.stopPropagation(); // Prevent card click navigation
    setDeleteConfirm({
      isOpen: true,
      configId,
      configName,
    });
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteMutation.mutateAsync(deleteConfirm.configId);
      toast.success("AI configuration deleted successfully!");
      setDeleteConfirm({ isOpen: false, configId: "", configName: "" });
      // Refetch data to update the list
      window.location.reload(); // Simple way to refresh data
    } catch (error: any) {
      toast.error(error.message || "Failed to delete AI configuration");
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirm({ isOpen: false, configId: "", configName: "" });
  };

  const handleActivateToggle = async (
    e: React.MouseEvent,
    configId: string,
    isActive: boolean
  ) => {
    e.stopPropagation(); // Prevent card click navigation
    try {
      if (isActive) {
        await deactivateMutation.mutateAsync(configId);
        toast.success("Model deactivated successfully!");
      } else {
        await activateMutation.mutateAsync(configId);
        toast.success("Model activated successfully!");
      }
      refetch(); // Refresh data
    } catch (error: any) {
      toast.error(error.message || "Failed to update model status");
    }
  };

  const handleSetDefault = async (
    e: React.MouseEvent,
    configId: string,
    isDefault: boolean
  ) => {
    e.stopPropagation(); // Prevent card click navigation
    if (isDefault) {
      // Already default, do nothing
      return;
    }

    try {
      await setDefaultMutation.mutateAsync(configId);
      toast.success("Model set as default successfully!");
      refetch(); // Refresh data
    } catch (error: any) {
      toast.error(error.message || "Failed to set model as default");
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="relative z-10 flex-1 overflow-auto">
        <Header title="AI Configuration" />
        <main className="px-4 py-6 mx-auto max-w-7xl lg:px-8">
          <div className="flex items-center justify-center h-64">
            <div className="flex flex-col items-center gap-4">
              <div className="w-8 h-8 border-2 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
              <p className="text-gray-400">Loading AI configurations...</p>
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
        <Header title="AI Configuration" />
        <main className="px-4 py-6 mx-auto max-w-7xl lg:px-8">
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
              <p className="text-red-400">Failed to load AI configurations</p>
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
      <Header title="AI Configuration" />

      <main className="px-4 py-6 mx-auto max-w-7xl lg:px-8">
        {/* Header with Create Button */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-100">
              AI Model Configurations
            </h1>
            <p className="text-gray-400">
              Manage AI models and their configurations
            </p>
          </div>
          <Link
            to="/admin/config-ai/create"
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white transition-colors bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Configuration
          </Link>
        </div>
        {/* Summary Stats */}
        <motion.div
          className="grid grid-cols-1 gap-5 mb-8 sm:grid-cols-2 lg:grid-cols-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <div className="p-6 bg-gray-800 bg-opacity-50 border border-gray-700 shadow-lg backdrop-blur-md rounded-xl">
            <div className="flex items-center">
              <Settings className="w-8 h-8 text-blue-400" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">
                  Total Models
                </p>
                <p className="text-2xl font-semibold text-gray-100">
                  {configData?.length || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 bg-gray-800 bg-opacity-50 border border-gray-700 shadow-lg backdrop-blur-md rounded-xl">
            <div className="flex items-center">
              <Zap className="w-8 h-8 text-green-400" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">
                  Active Models
                </p>
                <p className="text-2xl font-semibold text-gray-100">
                  {configData?.filter((config) => config.isActive).length || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 bg-gray-800 bg-opacity-50 border border-gray-700 shadow-lg backdrop-blur-md rounded-xl">
            <div className="flex items-center">
              <Star className="w-8 h-8 text-yellow-400" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">
                  Default Model
                </p>
                <p className="text-2xl font-semibold text-gray-100">
                  {configData?.filter((config) => config.isDefault).length || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 bg-gray-800 bg-opacity-50 border border-gray-700 shadow-lg backdrop-blur-md rounded-xl">
            <div className="flex items-center">
              <Clock className="w-8 h-8 text-purple-400" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Free Models</p>
                <p className="text-2xl font-semibold text-gray-100">
                  {configData?.filter((config) => config.isFree).length || 0}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* AI Models Grid */}
        <motion.div
          className="grid grid-cols-1 gap-6 lg:grid-cols-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
        >
          {configData?.map((config, index) => (
            <motion.div
              key={config.id}
              className="p-6 transition-all duration-200 bg-gray-800 bg-opacity-50 border border-gray-700 shadow-lg cursor-pointer backdrop-blur-md rounded-xl hover:bg-gray-700 hover:bg-opacity-50 hover:border-gray-600"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              onClick={() => navigate(`/admin/config-ai/update/${config.id}`)}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="mb-1 text-lg font-semibold text-gray-100">
                    {config.displayName}
                  </h3>
                  <p className="font-mono text-sm text-gray-400">
                    {config.modelName}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex gap-2">
                    {config.isDefault && (
                      <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-yellow-300 bg-yellow-900 bg-opacity-50 rounded-full">
                        <Star className="w-3 h-3 mr-1" />
                        Default
                      </span>
                    )}
                    {config.isActive ? (
                      <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-green-300 bg-green-900 bg-opacity-50 rounded-full">
                        <Zap className="w-3 h-3 mr-1" />
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-red-300 bg-red-900 bg-opacity-50 rounded-full">
                        Inactive
                      </span>
                    )}
                    {config.isFree && (
                      <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-blue-300 bg-blue-900 bg-opacity-50 rounded-full">
                        Free
                      </span>
                    )}
                  </div>
                  {/* Delete Button */}
                  <button
                    onClick={(e) =>
                      handleDeleteClick(e, config.id, config.displayName)
                    }
                    className="p-2 text-gray-400 transition-colors rounded-md hover:text-red-400 hover:bg-red-900 hover:bg-opacity-20 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
                    title="Delete configuration"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Parameters */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-300">
                    Max Tokens:{" "}
                    <span className="text-gray-100">
                      {config.maxTokens.toLocaleString()}
                    </span>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Thermometer className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-300">
                    Temperature:{" "}
                    <span className="text-gray-100">{config.temperature}</span>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Settings className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-300">
                    Top P: <span className="text-gray-100">{config.topP}</span>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-300">
                    Updated:{" "}
                    <span className="text-gray-100">
                      {formatDate(config.updatedAt)}
                    </span>
                  </span>
                </div>
              </div>

              {/* Controls */}
              <div className="mb-4">
                <h4 className="mb-3 text-sm font-medium text-gray-300">
                  Controls
                </h4>
                <div className="flex items-center justify-between p-3 bg-gray-900 bg-opacity-50 rounded-lg">
                  <div className="flex items-center gap-6">
                    {/* Active/Inactive Switch */}
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-400">Status:</span>
                      <Switch
                        checked={config.isActive}
                        onChange={(e) =>
                          handleActivateToggle(e, config.id, config.isActive)
                        }
                        disabled={
                          activateMutation.isPending ||
                          deactivateMutation.isPending
                        }
                        color="green"
                        label={config.isActive ? "Active" : "Inactive"}
                      />
                    </div>

                    {/* Default Switch */}
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-400">Default:</span>
                      <Switch
                        checked={config.isDefault}
                        onChange={(e) =>
                          handleSetDefault(e, config.id, config.isDefault)
                        }
                        disabled={
                          setDefaultMutation.isPending || config.isDefault
                        }
                        color="yellow"
                        label={config.isDefault ? "Default" : "Set Default"}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* System Prompt */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-gray-300">
                    System Prompt
                  </h4>
                  <button
                    onClick={() => togglePromptExpansion(config.id)}
                    className="flex items-center gap-1 text-xs text-blue-400 transition-colors hover:text-blue-300"
                  >
                    {expandedPrompts.has(config.id) ? (
                      <>
                        <EyeOff className="w-3 h-3" />
                        Hide
                      </>
                    ) : (
                      <>
                        <Eye className="w-3 h-3" />
                        Show
                      </>
                    )}
                  </button>
                </div>
                <div className="p-3 bg-gray-900 bg-opacity-50 rounded-lg">
                  <p className="font-mono text-xs leading-relaxed text-gray-400">
                    {expandedPrompts.has(config.id)
                      ? config.systemPrompt
                      : truncateText(config.systemPrompt, 150)}
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="pt-4 border-t border-gray-700">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Created: {formatDate(config.createdAt)}</span>
                  <span>ID: {config.id.substring(0, 8)}...</span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Delete Confirmation Modal */}
        {deleteConfirm.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <motion.div
              className="w-full max-w-md p-6 bg-gray-800 border border-gray-700 shadow-xl rounded-xl"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center justify-center w-10 h-10 bg-red-900 bg-opacity-50 rounded-full">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-100">
                    Delete Configuration
                  </h3>
                  <p className="text-sm text-gray-400">
                    This action cannot be undone
                  </p>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-gray-300">
                  Are you sure you want to delete the configuration{" "}
                  <span className="font-semibold text-gray-100">
                    "{deleteConfirm.configName}"
                  </span>
                  ?
                </p>
                <p className="mt-2 text-sm text-gray-400">
                  This will permanently remove the AI model configuration and
                  cannot be recovered.
                </p>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={handleDeleteCancel}
                  disabled={deleteMutation.isPending}
                  className="px-4 py-2 text-sm font-medium text-gray-300 transition-colors bg-gray-700 border border-gray-600 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={deleteMutation.isPending}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white transition-colors bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deleteMutation.isPending ? (
                    <>
                      <div className="w-4 h-4 mr-2 border-2 border-white rounded-full border-t-transparent animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ConfigAIPage;
