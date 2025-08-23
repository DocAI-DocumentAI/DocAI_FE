import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Save,
  ArrowLeft,
  AlertTriangle,
  Database,
  Calendar,
  Zap,
  Bell,
  BellRing,
  Info,
} from "lucide-react";
import toast from "react-hot-toast";
import Header from "../../components/common/Header";
import {
  useNotificationConfig,
  useUpdateNotificationConfig,
  UpdateNotificationConfigRequest,
} from "../../services/notificationService";

// Custom Switch Component
interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
}

const Switch: React.FC<SwitchProps> = ({
  checked,
  onChange,
  disabled = false,
  label,
}) => {
  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={() => onChange(!checked)}
        disabled={disabled}
        className={`
          relative inline-flex items-center w-10 h-5 rounded-full transition-colors duration-200 ease-in-out
          focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
          ${checked ? "bg-blue-600" : "bg-gray-600"}
          ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
        `}
      >
        <span
          className={`
            inline-block w-4 h-4 bg-white rounded-full shadow transform transition-transform duration-200 ease-in-out
            ${checked ? "translate-x-5" : "translate-x-0.5"}
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

const UpdateConfigNotificationPage: React.FC = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<UpdateNotificationConfigRequest>({
    warningThresholdDays: 7,
    logRetentionDays: 90,
    quartzEnabled: true,
    expiredNotificationCron: "0 0 8 * * ?",
    nearExpiredNotificationCron: "0 0 9 * * MON",
    enableExpiredNotifications: true,
    enableNearExpiredNotifications: true,
    nearExpiredMode: 1,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch current config data
  const { data: configData, isLoading, isError } = useNotificationConfig();
  const updateMutation = useUpdateNotificationConfig();

  // Populate form with current data
  useEffect(() => {
    if (configData) {
      setFormData({
        warningThresholdDays: configData.warningThresholdDays,
        logRetentionDays: configData.logRetentionDays,
        quartzEnabled: configData.quartzEnabled,
        expiredNotificationCron: configData.expiredNotificationCron,
        nearExpiredNotificationCron: configData.nearExpiredNotificationCron,
        enableExpiredNotifications: configData.enableExpiredNotifications,
        enableNearExpiredNotifications:
          configData.enableNearExpiredNotifications,
        nearExpiredMode: configData.nearExpiredMode,
      });
    }
  }, [configData]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validate warning threshold days
    if (
      formData.warningThresholdDays < 1 ||
      formData.warningThresholdDays > 365
    ) {
      newErrors.warningThresholdDays =
        "Warning threshold must be between 1 and 365 days";
    }

    // Validate log retention days
    if (formData.logRetentionDays < 1 || formData.logRetentionDays > 3650) {
      newErrors.logRetentionDays =
        "Log retention must be between 1 and 3650 days";
    }

    // Validate cron expressions
    const validateCron = (cron: string, fieldName: string) => {
      if (!cron.trim()) {
        newErrors[fieldName] = `Cron expression for ${fieldName} is required`;
      } else {
        const cronParts = cron.trim().split(/\s+/);
        if (cronParts.length < 5 || cronParts.length > 7) {
          newErrors[fieldName] = "Cron expression must have 5 to 7 parts";
        }
      }
    };

    validateCron(formData.expiredNotificationCron, "expiredNotificationCron");
    validateCron(
      formData.nearExpiredNotificationCron,
      "nearExpiredNotificationCron"
    );

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the validation errors");
      return;
    }

    try {
      await updateMutation.mutateAsync(formData);
      toast.success("Notification configuration updated successfully!");
      navigate("/admin/config-notification");
    } catch (error: any) {
      toast.error(
        error.message || "Failed to update notification configuration"
      );
    }
  };

  const handleInputChange = (
    field: keyof UpdateNotificationConfigRequest,
    value: any
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="relative z-10 flex-1 overflow-auto">
        <Header title="Update Notification Configuration" />
        <main className="max-w-4xl px-4 py-6 mx-auto lg:px-8">
          <div className="flex items-center justify-center h-64">
            <div className="flex flex-col items-center gap-4">
              <div className="w-8 h-8 border-2 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
              <p className="text-gray-400">Loading configuration...</p>
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
        <Header title="Update Notification Configuration" />
        <main className="max-w-4xl px-4 py-6 mx-auto lg:px-8">
          <div className="flex items-center justify-center h-64">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 text-red-500">
                <AlertTriangle className="w-full h-full" />
              </div>
              <p className="text-red-400">Failed to load configuration</p>
              <button
                onClick={() => navigate("/admin/config-notification")}
                className="px-4 py-2 text-sm text-blue-400 hover:text-blue-300"
              >
                Go back
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="relative z-10 flex-1 overflow-auto">
      <Header title="Update Notification Configuration" />

      <main className="max-w-4xl px-4 py-6 mx-auto lg:px-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate("/admin/config-notification")}
            className="p-2 text-gray-400 transition-colors rounded-md hover:text-gray-300 hover:bg-gray-700"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-semibold text-gray-100">
              Update Notification Configuration
            </h1>
            <p className="text-gray-400">
              Modify notification settings and scheduling
            </p>
          </div>
        </div>

        {/* Form */}
        <motion.div
          className="p-6 bg-gray-800 bg-opacity-50 border border-gray-700 shadow-lg backdrop-blur-md rounded-xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              {/* Left Column */}
              <div className="space-y-6">
                {/* Warning Threshold Days */}
                <div>
                  <label className="flex items-center gap-2 mb-2 text-sm font-medium text-gray-300">
                    <AlertTriangle className="w-4 h-4 text-yellow-400" />
                    Warning Threshold Days
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="365"
                    value={formData.warningThresholdDays}
                    onChange={(e) =>
                      handleInputChange(
                        "warningThresholdDays",
                        parseInt(e.target.value) || 0
                      )
                    }
                    className={`w-full px-3 py-2 bg-gray-700 border rounded-md text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.warningThresholdDays
                        ? "border-red-500"
                        : "border-gray-600"
                    }`}
                    placeholder="Enter warning threshold in days"
                  />
                  {errors.warningThresholdDays && (
                    <p className="mt-1 text-sm text-red-400">
                      {errors.warningThresholdDays}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    Number of days before sending warning notifications (1-365)
                  </p>
                </div>

                {/* Log Retention Days */}
                <div>
                  <label className="flex items-center gap-2 mb-2 text-sm font-medium text-gray-300">
                    <Database className="w-4 h-4 text-blue-400" />
                    Log Retention Days
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="3650"
                    value={formData.logRetentionDays}
                    onChange={(e) =>
                      handleInputChange(
                        "logRetentionDays",
                        parseInt(e.target.value) || 0
                      )
                    }
                    className={`w-full px-3 py-2 bg-gray-700 border rounded-md text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.logRetentionDays
                        ? "border-red-500"
                        : "border-gray-600"
                    }`}
                    placeholder="Enter log retention in days"
                  />
                  {errors.logRetentionDays && (
                    <p className="mt-1 text-sm text-red-400">
                      {errors.logRetentionDays}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    Number of days to retain logs (1-3650)
                  </p>
                </div>

                {/* Expired Notification Cron */}
                <div>
                  <label className="flex items-center gap-2 mb-2 text-sm font-medium text-gray-300">
                    <Calendar className="w-4 h-4 text-red-400" />
                    Expired Notification Cron
                  </label>
                  <input
                    type="text"
                    value={formData.expiredNotificationCron}
                    onChange={(e) =>
                      handleInputChange(
                        "expiredNotificationCron",
                        e.target.value
                      )
                    }
                    className={`w-full px-3 py-2 bg-gray-700 border rounded-md text-gray-100 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.expiredNotificationCron
                        ? "border-red-500"
                        : "border-gray-600"
                    }`}
                    placeholder="0 0 8 * * ?"
                  />
                  {errors.expiredNotificationCron && (
                    <p className="mt-1 text-sm text-red-400">
                      {errors.expiredNotificationCron}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    Cron expression for expired notifications.
                  </p>
                </div>

                {/* Near Expired Notification Cron */}
                <div>
                  <label className="flex items-center gap-2 mb-2 text-sm font-medium text-gray-300">
                    <Calendar className="w-4 h-4 text-yellow-400" />
                    Near Expired Notification Cron
                  </label>
                  <input
                    type="text"
                    value={formData.nearExpiredNotificationCron}
                    onChange={(e) =>
                      handleInputChange(
                        "nearExpiredNotificationCron",
                        e.target.value
                      )
                    }
                    className={`w-full px-3 py-2 bg-gray-700 border rounded-md text-gray-100 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.nearExpiredNotificationCron
                        ? "border-red-500"
                        : "border-gray-600"
                    }`}
                    placeholder="0 0 9 * * MON"
                  />
                  {errors.nearExpiredNotificationCron && (
                    <p className="mt-1 text-sm text-red-400">
                      {errors.nearExpiredNotificationCron}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    Cron expression for near-expired notifications.
                  </p>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Near Expired Mode */}
                <div>
                  <label className="flex items-center gap-2 mb-2 text-sm font-medium text-gray-300">
                    <Info className="w-4 h-4 text-blue-400" />
                    Near Expired Mode
                  </label>
                  <select
                    value={formData.nearExpiredMode}
                    onChange={(e) =>
                      handleInputChange(
                        "nearExpiredMode",
                        parseInt(e.target.value)
                      )
                    }
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={1}>Weekly</option>
                    <option value={2}>Monthly</option>
                  </select>
                  <p className="mt-1 text-xs text-gray-500">
                    Select the mode for near-expired notifications.
                  </p>
                </div>

                {/* Quartz Enabled */}
                <div>
                  <label className="flex items-center gap-2 mb-3 text-sm font-medium text-gray-300">
                    <Zap className="w-4 h-4 text-green-400" />
                    Quartz Scheduler
                  </label>
                  <Switch
                    checked={formData.quartzEnabled}
                    onChange={(checked) =>
                      handleInputChange("quartzEnabled", checked)
                    }
                    label={formData.quartzEnabled ? "Enabled" : "Disabled"}
                  />
                  <p className="mt-2 text-xs text-gray-500">
                    Enable or disable the Quartz scheduler.
                  </p>
                </div>

                {/* Enable Expired Notifications */}
                <div>
                  <label className="flex items-center gap-2 mb-3 text-sm font-medium text-gray-300">
                    <Bell className="w-4 h-4 text-purple-400" />
                    Enable Expired Notifications
                  </label>
                  <Switch
                    checked={formData.enableExpiredNotifications}
                    onChange={(checked) =>
                      handleInputChange("enableExpiredNotifications", checked)
                    }
                    label={
                      formData.enableExpiredNotifications
                        ? "Enabled"
                        : "Disabled"
                    }
                  />
                  <p className="mt-2 text-xs text-gray-500">
                    Enable or disable notifications for expired documents.
                  </p>
                </div>

                {/* Enable Near Expired Notifications */}
                <div>
                  <label className="flex items-center gap-2 mb-3 text-sm font-medium text-gray-300">
                    <BellRing className="w-4 h-4 text-purple-400" />
                    Enable Near-Expired Notifications
                  </label>
                  <Switch
                    checked={formData.enableNearExpiredNotifications}
                    onChange={(checked) =>
                      handleInputChange(
                        "enableNearExpiredNotifications",
                        checked
                      )
                    }
                    label={
                      formData.enableNearExpiredNotifications
                        ? "Enabled"
                        : "Disabled"
                    }
                  />
                  <p className="mt-2 text-xs text-gray-500">
                    Enable or disable notifications for documents nearing
                    expiration.
                  </p>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-3 pt-6 border-t border-gray-700">
              <button
                type="button"
                onClick={() => navigate("/admin/config-notification")}
                disabled={updateMutation.isPending}
                className="px-4 py-2 text-sm font-medium text-gray-300 transition-colors bg-gray-700 border border-gray-600 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={updateMutation.isPending}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white transition-colors bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {updateMutation.isPending ? (
                  <>
                    <div className="w-4 h-4 mr-2 border-2 border-white rounded-full border-t-transparent animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Update Configuration
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </main>
    </div>
  );
};

export default UpdateConfigNotificationPage;
