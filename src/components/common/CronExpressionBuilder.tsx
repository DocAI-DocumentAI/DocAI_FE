import React, { useState, useEffect } from "react";
import { Clock, Calendar, Settings, Info } from "lucide-react";
import { getCronDescription, fixCronExpression } from "../../utils/cronUtils";

interface CronExpressionBuilderProps {
  value: string;
  onChange: (cronExpression: string) => void;
  label?: string;
  error?: string;
  placeholder?: string;
}

type CronMode = "daily" | "weekly" | "monthly" | "custom";

interface CronConfig {
  mode: CronMode;
  hour: string;
  minute: string;
  dayOfWeek: string;
  dayOfMonth: string;
  customExpression: string;
}

const CronExpressionBuilder: React.FC<CronExpressionBuilderProps> = ({
  value,
  onChange,
  label,
  error,
  placeholder = "0 0 8 * * ?",
}) => {
  const [config, setConfig] = useState<CronConfig>({
    mode: "daily",
    hour: "08",
    minute: "00",
    dayOfWeek: "MON",
    dayOfMonth: "1",
    customExpression: value || placeholder,
  });

  const [autoFixMessage, setAutoFixMessage] = useState<string>("");

  // Parse existing cron expression on initial load
  useEffect(() => {
    if (value && value.trim()) {
      // Auto-fix the value first
      const fixedValue = fixCronExpression(value);
      const parts = fixedValue.trim().split(/\s+/);

      // If value was fixed, notify parent
      if (fixedValue !== value) {
        onChange(fixedValue);
      }

      // Handle both 5-part and 6-part cron expressions
      let second, minute, hour, dayOfMonth, month, dayOfWeek;

      if (parts.length === 5) {
        // Standard 5-part: minute hour day month dow
        [minute, hour, dayOfMonth, month, dayOfWeek] = parts;
        second = "0";
      } else if (parts.length >= 6) {
        // 6-part with seconds: second minute hour day month dow
        [second, minute, hour, dayOfMonth, month, dayOfWeek] = parts;
      }

      if (minute && hour && dayOfMonth && month && dayOfWeek) {
        let mode: CronMode = "custom";
        let newDayOfWeek = config.dayOfWeek;
        let newDayOfMonth = config.dayOfMonth;

        // Check if minute and hour are simple values (not patterns)
        const isSimpleMinute = /^\d+$/.test(minute);
        const isSimpleHour = /^\d+$/.test(hour);

        // Only classify as simple modes if minute and hour are simple values
        if (isSimpleMinute && isSimpleHour) {
          // Apply cron rules: day of month and day of week are mutually exclusive
          if (dayOfWeek !== "?" && dayOfWeek !== "*" && (dayOfMonth === "?" || dayOfMonth === "*")) {
            // Weekly pattern: specific day of week, any day of month
            mode = "weekly";
            newDayOfWeek = dayOfWeek;
          } else if ((dayOfMonth !== "*" && dayOfMonth !== "?") && (dayOfWeek === "?" || dayOfWeek === "*")) {
            // Monthly pattern: specific day of month, any day of week
            mode = "monthly";
            newDayOfMonth = dayOfMonth;
          } else if (dayOfMonth === "*" && (dayOfWeek === "?" || dayOfWeek === "*")) {
            // Daily pattern: any day of month, any day of week
            mode = "daily";
          }
        }
        // If minute or hour contains patterns like */30, 0/15, etc., keep as custom mode

        // Only pad simple numeric values, not complex patterns
        const formatTimeValue = (value: string): string => {
          // If it's a simple number, pad it
          if (/^\d+$/.test(value)) {
            return value.padStart(2, "0");
          }
          // For complex patterns like "0/30", "*/15", etc., return as-is
          return value;
        };

        setConfig({
          mode: mode,
          hour: formatTimeValue(hour),
          minute: formatTimeValue(minute),
          dayOfWeek: newDayOfWeek,
          dayOfMonth: newDayOfMonth,
          customExpression: fixedValue,
        });
      } else {
        setConfig((prev) => ({
          ...prev,
          mode: "custom",
          customExpression: fixedValue,
        }));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Generate cron expression based on current config
  const generateCronExpression = (newConfig: CronConfig): string => {
    switch (newConfig.mode) {
      case "daily":
        // Daily: run every day at specified time
        // Format: second minute hour * * ?
        return `0 ${newConfig.minute} ${newConfig.hour} * * ?`;
      case "weekly":
        // Weekly: run on specific day of week at specified time
        // Format: second minute hour ? * dayOfWeek
        // IMPORTANT: Use ? for day of month when specifying day of week
        return `0 ${newConfig.minute} ${newConfig.hour} ? * ${newConfig.dayOfWeek}`;
      case "monthly":
        // Monthly: run on specific day of month at specified time
        // Format: second minute hour dayOfMonth * ?
        // IMPORTANT: Use ? for day of week when specifying day of month
        return `0 ${newConfig.minute} ${newConfig.hour} ${newConfig.dayOfMonth} * ?`;
      case "custom":
        return newConfig.customExpression;
      default:
        return `0 ${newConfig.minute} ${newConfig.hour} * * ?`;
    }
  };

  // Update config and notify parent
  const updateConfig = (updates: Partial<CronConfig>) => {
    const newConfig = { ...config, ...updates };
    setConfig(newConfig);

    const cronExpression = generateCronExpression(newConfig);
    onChange(cronExpression);
  };

  // Generate hour options (0-23, no leading zeros in value)
  const hourOptions = Array.from({ length: 24 }, (_, i) => {
    const hour = i.toString(); // No leading zeros for value
    return { value: hour, label: hour };
  });

  // Generate minute options (0-59, no leading zeros in value)
  const minuteOptions = Array.from({ length: 60 }, (_, i) => {
    const minute = i.toString(); // No leading zeros for value
    return { value: minute, label: minute };
  });

  // Day of week options
  const dayOfWeekOptions = [
    { value: "SUN", label: "Sunday" },
    { value: "MON", label: "Monday" },
    { value: "TUE", label: "Tuesday" },
    { value: "WED", label: "Wednesday" },
    { value: "THU", label: "Thursday" },
    { value: "FRI", label: "Friday" },
    { value: "SAT", label: "Saturday" },
  ];

  // Day of month options (1-31 + last day)
  const dayOfMonthOptions = [
    ...Array.from({ length: 31 }, (_, i) => ({
      value: (i + 1).toString(),
      label: `${i + 1}`,
    })),
    { value: "L", label: "Last day of month" },
  ];

  const tabs = [
    { id: "daily", label: "Hàng ngày", icon: Clock },
    { id: "weekly", label: "Hàng tuần", icon: Calendar },
    { id: "monthly", label: "Hàng tháng", icon: Calendar },
    { id: "custom", label: "Tùy chỉnh", icon: Settings },
  ];

  return (
    <div className="space-y-4">
      {label && (
        <label className="block text-sm font-medium text-gray-300">
          {label}
        </label>
      )}

      {/* Tabs */}
      <div className="flex p-1 space-x-1 bg-gray-800/50 rounded-lg border border-gray-600/30">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => updateConfig({ mode: tab.id as CronMode })}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium rounded-md transition-all duration-200 ${
                config.mode === tab.id
                  ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/25"
                  : "text-gray-300 hover:text-white hover:bg-gray-600/50 hover:shadow-md"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Configuration based on selected mode */}
      <div className="space-y-4">
        {config.mode !== "custom" && (
          <div className="p-4 bg-gray-800/30 rounded-lg border border-gray-600/30">
            <div className="grid grid-cols-2 gap-4">
              {/* Hour */}
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-300">
                  <Clock className="w-4 h-4 inline mr-1" />
                  Giờ
                </label>
                <select
                  value={config.hour}
                  onChange={(e) => updateConfig({ hour: e.target.value })}
                  className="w-full px-3 py-2 text-gray-100 bg-gray-700/50 border border-gray-600/50 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                >
                  {hourOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}:00
                    </option>
                  ))}
                </select>
              </div>

              {/* Minute */}
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-300">
                  <Clock className="w-4 h-4 inline mr-1" />
                  Phút
                </label>
                <select
                  value={config.minute}
                  onChange={(e) => updateConfig({ minute: e.target.value })}
                  className="w-full px-3 py-2 text-gray-100 bg-gray-700/50 border border-gray-600/50 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                >
                  {minuteOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Weekly specific */}
        {config.mode === "weekly" && (
          <div className="p-4 bg-gray-800/30 rounded-lg border border-gray-600/30">
            <label className="block mb-2 text-sm font-medium text-gray-300">
              <Calendar className="w-4 h-4 inline mr-1" />
              Ngày trong tuần
            </label>
            <select
              value={config.dayOfWeek}
              onChange={(e) => updateConfig({ dayOfWeek: e.target.value })}
              className="w-full px-3 py-2 text-gray-100 bg-gray-700/50 border border-gray-600/50 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            >
              {dayOfWeekOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Monthly specific */}
        {config.mode === "monthly" && (
          <div className="p-4 bg-gray-800/30 rounded-lg border border-gray-600/30">
            <label className="block mb-2 text-sm font-medium text-gray-300">
              <Calendar className="w-4 h-4 inline mr-1" />
              Ngày trong tháng
            </label>
            <select
              value={config.dayOfMonth}
              onChange={(e) => updateConfig({ dayOfMonth: e.target.value })}
              className="w-full px-3 py-2 text-gray-100 bg-gray-700/50 border border-gray-600/50 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            >
              {dayOfMonthOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Custom expression */}
        {config.mode === "custom" && (
          <div className="p-4 bg-gray-800/30 rounded-lg border border-gray-600/30">
            <label className="block mb-2 text-sm font-medium text-gray-300">
              <Settings className="w-4 h-4 inline mr-1" />
              Cron Expression
            </label>
            <input
              type="text"
              value={config.customExpression}
              onChange={(e) => {
                const rawValue = e.target.value;
                const fixedValue = fixCronExpression(rawValue);
                updateConfig({ customExpression: fixedValue });

                // Show warning if value was auto-fixed
                if (rawValue !== fixedValue && rawValue.length > 0) {
                  setAutoFixMessage(`Đã tự động sửa: "${rawValue}" → "${fixedValue}"`);
                  setTimeout(() => setAutoFixMessage(""), 3000);
                } else {
                  setAutoFixMessage("");
                }
              }}
              className={`w-full px-3 py-2 bg-gray-700/50 border rounded-md text-gray-100 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                error ? "border-red-500 focus:ring-red-500" : "border-gray-600/50"
              }`}
              placeholder={placeholder}
            />
            <div className="mt-2 space-y-2">
              <p className="text-xs text-gray-400">
                Định dạng: <code className="text-blue-300">second minute hour day month dayOfWeek</code>
              </p>



              {/* Auto-fix message */}
              {autoFixMessage && (
                <div className="mt-2 p-2 bg-green-900/20 border border-green-500/30 rounded text-xs text-green-300">
                  <Info className="w-3 h-3 inline mr-1" />
                  {autoFixMessage}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Preview */}
        <div className="p-4 bg-gradient-to-r from-gray-900/50 to-gray-800/50 rounded-lg border border-gray-600/30">
          <div className="space-y-3">
            {/* Cron Expression */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-blue-400" />
                <span className="text-sm font-medium text-gray-300">Cron Expression:</span>
              </div>
              <div className="p-2 bg-gray-800/50 rounded border border-gray-600/50">
                <code className="font-mono text-sm text-blue-300 break-all">
                  {generateCronExpression(config)}
                </code>
              </div>
            </div>

            {/* Human Readable Description */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Info className="w-4 h-4 text-green-400" />
                <span className="text-sm font-medium text-gray-300">Mô tả:</span>
              </div>
              <div className="p-2 bg-gray-800/50 rounded border border-gray-600/50">
                <p className="text-sm text-green-300 font-medium">
                  {getCronDescription(generateCronExpression(config))}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
          <p className="text-sm text-red-400 flex items-center gap-2">
            <Info className="w-4 h-4" />
            {error}
          </p>
        </div>
      )}
    </div>
  );
};

export default CronExpressionBuilder;
