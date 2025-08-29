import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
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
import CronExpressionBuilder from "../../components/common/CronExpressionBuilder";
import { validateCronExpression } from "../../utils/cronUtils";
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
  const queryClient = useQueryClient();

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
  const [formKey, setFormKey] = useState(0);

  // Populate form with current data and update key to force re-render
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
      setFormKey((prev) => prev + 1);
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
        newErrors[fieldName] = `Cron expression is required`;
      } else {
        const validation = validateCronExpression(cron);
        if (!validation.isValid) {
          newErrors[fieldName] = validation.error || "Invalid cron expression";
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
      await updateMutation.mutateAsync(formData, {
        onSuccess: () => {
          toast.success("Notification configuration updated successfully!");
          queryClient.invalidateQueries({
            queryKey: ["notificationConfig"],
          });
          navigate("/admin/config-notification");
        },
      });
    } catch (error) {
      if (error instanceof Error) {
        toast.error(
          error.message || "Failed to update notification configuration"
        );
      } else {
        toast.error("Failed to update notification configuration");
      }
    }
  };

  const handleInputChange = (
    field: keyof UpdateNotificationConfigRequest,
    value: string | number | boolean
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
    <div className="relative z-10 flex-1 overflow-auto bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <Header title="Update Notification Configuration" />

      <main className="max-w-6xl px-4 py-8 mx-auto lg:px-8">
        {/* Header Section */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => navigate("/admin/config-notification")}
              className="p-3 text-gray-400 transition-all duration-200 rounded-lg hover:text-gray-300 hover:bg-gray-700/50 hover:scale-105"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="mb-2 text-3xl font-bold text-gray-100">
                Update Notification Configuration
              </h1>
              <p className="text-lg text-gray-400">
                Modify notification settings and scheduling preferences
              </p>
            </div>
          </div>

          {/* Progress indicator */}
          <div className="w-full h-1 bg-gray-700 rounded-full">
            <div className="w-1/3 h-1 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"></div>
          </div>
        </motion.div>

        {/* Form Container */}
        <motion.div
          className="overflow-hidden border shadow-2xl bg-gray-800/60 backdrop-blur-xl border-gray-700/50 rounded-2xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <form onSubmit={handleSubmit} className="space-y-0">
            {/* Form Header */}
            <div className="px-8 py-6 border-b bg-gradient-to-r from-blue-600/10 to-purple-600/10 border-gray-700/50">
              <h2 className="mb-2 text-xl font-semibold text-gray-100">
                Configuration Settings
              </h2>
              <p className="text-gray-400">
                Configure your notification preferences and scheduling
              </p>
            </div>

            {/* Form Content */}
            <div className="p-8">
              <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
                {/* Left Column - Basic Settings */}
                <div className="space-y-8">
                  <div className="mb-6">
                    <h3 className="flex items-center gap-2 mb-2 text-lg font-semibold text-gray-200">
                      <Database className="w-5 h-5 text-blue-400" />
                      Basic Settings
                    </h3>
                    <p className="text-sm text-gray-400">
                      Configure basic notification parameters
                    </p>
                  </div>
                  {/* Warning Threshold Days */}
                  <div className="p-6 border bg-gray-700/30 rounded-xl border-gray-600/50">
                    <label className="flex items-center gap-2 mb-3 text-sm font-medium text-gray-300">
                      <AlertTriangle className="w-4 h-4 text-yellow-400" />
                      Warning Threshold Days
                    </label>
                    <div className="relative">
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
                        className={`w-full px-4 py-3 bg-gray-800/50 border rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                          errors.warningThresholdDays
                            ? "border-red-500 focus:ring-red-500"
                            : "border-gray-600 hover:border-gray-500"
                        }`}
                        placeholder="Enter warning threshold in days"
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <span className="text-sm text-gray-400">days</span>
                      </div>
                    </div>
                    {errors.warningThresholdDays && (
                      <p className="flex items-center gap-1 mt-2 text-sm text-red-400">
                        <AlertTriangle className="w-3 h-3" />
                        {errors.warningThresholdDays}
                      </p>
                    )}
                    <p className="mt-2 text-xs text-gray-500">
                      Number of days before sending warning notifications
                      (1-365)
                    </p>
                  </div>

                  {/* Log Retention Days */}
                  <div className="p-6 border bg-gray-700/30 rounded-xl border-gray-600/50">
                    <label className="flex items-center gap-2 mb-3 text-sm font-medium text-gray-300">
                      <Database className="w-4 h-4 text-blue-400" />
                      Log Retention Days
                    </label>
                    <div className="relative">
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
                        className={`w-full px-4 py-3 bg-gray-800/50 border rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                          errors.logRetentionDays
                            ? "border-red-500 focus:ring-red-500"
                            : "border-gray-600 hover:border-gray-500"
                        }`}
                        placeholder="Enter log retention in days"
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <span className="text-sm text-gray-400">days</span>
                      </div>
                    </div>
                    {errors.logRetentionDays && (
                      <p className="flex items-center gap-1 mt-2 text-sm text-red-400">
                        <AlertTriangle className="w-3 h-3" />
                        {errors.logRetentionDays}
                      </p>
                    )}
                    <p className="mt-2 text-xs text-gray-500">
                      Number of days to retain logs (1-3650)
                    </p>
                  </div>

                  {/* Scheduling Section */}
                  <div className="mb-6">
                    <h3 className="flex items-center gap-2 mb-2 text-lg font-semibold text-gray-200">
                      <Calendar className="w-5 h-5 text-purple-400" />
                      Notification Scheduling
                    </h3>
                    <p className="text-sm text-gray-400">
                      Configure when notifications are sent
                    </p>
                  </div>

                  {/* Expired Notification Cron */}
                  <div className="p-6 border bg-gray-700/30 rounded-xl border-gray-600/50">
                    <div className="flex items-center gap-2 mb-4 text-sm font-medium text-gray-300">
                      <Calendar className="w-4 h-4 text-red-400" />
                      Expired Notification Schedule
                    </div>
                    <CronExpressionBuilder
                      key={`expired-${formKey}`}
                      value={formData.expiredNotificationCron}
                      onChange={(cronExpression) =>
                        handleInputChange(
                          "expiredNotificationCron",
                          cronExpression
                        )
                      }
                      error={errors.expiredNotificationCron}
                      placeholder="0 0 8 * * ?"
                    />
                    <p className="mt-3 text-xs text-gray-500">
                      Configure when to send notifications for expired documents
                    </p>
                  </div>

                  {/* Near Expired Notification Cron */}
                  <div className="p-6 border bg-gray-700/30 rounded-xl border-gray-600/50">
                    <div className="flex items-center gap-2 mb-4 text-sm font-medium text-gray-300">
                      <Calendar className="w-4 h-4 text-yellow-400" />
                      Near-Expired Notification Schedule
                    </div>
                    <CronExpressionBuilder
                      key={`near-expired-${formKey}`}
                      value={formData.nearExpiredNotificationCron}
                      onChange={(cronExpression) =>
                        handleInputChange(
                          "nearExpiredNotificationCron",
                          cronExpression
                        )
                      }
                      error={errors.nearExpiredNotificationCron}
                      placeholder="0 0 9 * * MON"
                    />
                    <p className="mt-3 text-xs text-gray-500">
                      Configure when to send notifications for documents nearing
                      expiration
                    </p>
                  </div>
                </div>

                {/* Right Column - Advanced Settings */}
                <div className="space-y-8">
                  {/* <div className="mb-6">
                    <h3 className="flex items-center gap-2 mb-2 text-lg font-semibold text-gray-200">
                      <Zap className="w-5 h-5 text-green-400" />
                      Advanced Settings
                    </h3>
                    <p className="text-sm text-gray-400">
                      Configure advanced notification options
                    </p>
                  </div> */}

                  {/* Near Expired Mode */}
                  {/* <div className="p-6 border bg-gray-700/30 rounded-xl border-gray-600/50">
                    <label className="flex items-center gap-2 mb-3 text-sm font-medium text-gray-300">
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
                      className="w-full px-4 py-3 text-gray-100 transition-all duration-200 border border-gray-600 rounded-lg bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-500"
                    >
                      <option value={1}>Weekly</option>
                      <option value={2}>Daily</option>
                    </select>
                    <p className="mt-2 text-xs text-gray-500">
                      Select the frequency mode for near-expired notifications
                    </p>
                  </div> */}

                  {/* System Controls Section */}
                  <div className="mb-6">
                    <h3 className="flex items-center gap-2 mb-2 text-lg font-semibold text-gray-200">
                      <Bell className="w-5 h-5 text-purple-400" />
                      System Controls
                    </h3>
                    <p className="text-sm text-gray-400">
                      Enable or disable system features
                    </p>
                  </div>

                  {/* Quartz Enabled */}
                  <div className="p-6 border bg-gray-700/30 rounded-xl border-gray-600/50">
                    <label className="flex items-center gap-2 mb-4 text-sm font-medium text-gray-300">
                      <Zap className="w-4 h-4 text-green-400" />
                      Quartz Scheduler
                    </label>
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <Switch
                          checked={formData.quartzEnabled}
                          onChange={(checked) =>
                            handleInputChange("quartzEnabled", checked)
                          }
                          label={
                            formData.quartzEnabled ? "Enabled" : "Disabled"
                          }
                        />
                      </div>
                      <div
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          formData.quartzEnabled
                            ? "bg-green-500/20 text-green-400 border border-green-500/30"
                            : "bg-gray-500/20 text-gray-400 border border-gray-500/30"
                        }`}
                      >
                        {formData.quartzEnabled ? "Active" : "Inactive"}
                      </div>
                    </div>
                    <p className="mt-3 text-xs text-gray-500">
                      Control the Quartz scheduler for automated notifications
                    </p>
                  </div>

                  {/* Enable Expired Notifications */}
                  <div className="p-6 border bg-gray-700/30 rounded-xl border-gray-600/50">
                    <label className="flex items-center gap-2 mb-4 text-sm font-medium text-gray-300">
                      <Bell className="w-4 h-4 text-red-400" />
                      Expired Notifications
                    </label>
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <Switch
                          checked={formData.enableExpiredNotifications}
                          onChange={(checked) =>
                            handleInputChange(
                              "enableExpiredNotifications",
                              checked
                            )
                          }
                          label={
                            formData.enableExpiredNotifications
                              ? "Enabled"
                              : "Disabled"
                          }
                        />
                      </div>
                      <div
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          formData.enableExpiredNotifications
                            ? "bg-red-500/20 text-red-400 border border-red-500/30"
                            : "bg-gray-500/20 text-gray-400 border border-gray-500/30"
                        }`}
                      >
                        {formData.enableExpiredNotifications
                          ? "Active"
                          : "Inactive"}
                      </div>
                    </div>
                    <p className="mt-3 text-xs text-gray-500">
                      Send notifications when documents have expired
                    </p>
                  </div>

                  {/* Enable Near Expired Notifications */}
                  <div className="p-6 border bg-gray-700/30 rounded-xl border-gray-600/50">
                    <label className="flex items-center gap-2 mb-4 text-sm font-medium text-gray-300">
                      <BellRing className="w-4 h-4 text-yellow-400" />
                      Near-Expired Notifications
                    </label>
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
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
                      </div>
                      <div
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          formData.enableNearExpiredNotifications
                            ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                            : "bg-gray-500/20 text-gray-400 border border-gray-500/30"
                        }`}
                      >
                        {formData.enableNearExpiredNotifications
                          ? "Active"
                          : "Inactive"}
                      </div>
                    </div>
                    <p className="mt-3 text-xs text-gray-500">
                      Send notifications for documents nearing expiration
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="px-8 py-6 border-t bg-gray-800/40 border-gray-700/50">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-400">
                    <span className="flex items-center gap-2">
                      <Info className="w-4 h-4" />
                      Changes will be applied immediately after saving
                    </span>
                  </div>
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => navigate("/admin/config-notification")}
                      disabled={updateMutation.isPending}
                      className="px-6 py-3 text-sm font-medium text-gray-300 transition-all duration-200 border border-gray-600 rounded-lg bg-gray-700/50 hover:bg-gray-600/50 hover:border-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={updateMutation.isPending}
                      className="inline-flex items-center px-8 py-3 text-sm font-medium text-white transition-all duration-200 transform border border-transparent rounded-lg shadow-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-xl hover:scale-105"
                    >
                      {updateMutation.isPending ? (
                        <>
                          <div className="w-4 h-4 mr-3 border-2 border-white rounded-full border-t-transparent animate-spin" />
                          Updating Configuration...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-3" />
                          Update Configuration
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </motion.div>
      </main>
    </div>
  );
};

export default UpdateConfigNotificationPage;
