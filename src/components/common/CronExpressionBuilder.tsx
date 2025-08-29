import React, { useState, useEffect } from "react";
import { Clock, Calendar, Settings } from "lucide-react";

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

  // Parse existing cron expression on initial load
  useEffect(() => {
    if (value && value.trim()) {
      const parts = value.trim().split(/\s+/);
      if (parts.length >= 6) {
        const [, minute, hour, dayOfMonth, , dayOfWeek] = parts;

        let mode: CronMode = "custom";
        let newDayOfWeek = config.dayOfWeek;
        let newDayOfMonth = config.dayOfMonth;

        if (dayOfWeek !== "?" && (dayOfMonth === "*" || dayOfMonth === "?")) {
          mode = "weekly";
          newDayOfWeek = dayOfWeek;
        } else if (dayOfMonth !== "*" && dayOfWeek === "?") {
          mode = "monthly";
          newDayOfMonth = dayOfMonth;
        } else if (dayOfMonth === "*" && dayOfWeek === "?") {
          mode = "daily";
        }

        setConfig({
          mode: mode,
          hour: hour.padStart(2, "0"),
          minute: minute.padStart(2, "0"),
          dayOfWeek: newDayOfWeek,
          dayOfMonth: newDayOfMonth,
          customExpression: value,
        });
      } else {
        setConfig((prev) => ({
          ...prev,
          mode: "custom",
          customExpression: value,
        }));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Generate cron expression based on current config
  const generateCronExpression = (newConfig: CronConfig): string => {
    switch (newConfig.mode) {
      case "daily":
        return `0 ${newConfig.minute} ${newConfig.hour} * * ?`;
      case "weekly":
        return `0 ${newConfig.minute} ${newConfig.hour} ? * ${newConfig.dayOfWeek}`;
      case "monthly":
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

  // Generate hour options (00-23)
  const hourOptions = Array.from({ length: 24 }, (_, i) => {
    const hour = i.toString().padStart(2, "0");
    return { value: hour, label: hour };
  });

  // Generate minute options (00-59)
  const minuteOptions = Array.from({ length: 60 }, (_, i) => {
    const minute = i.toString().padStart(2, "0");
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
      <div className="flex p-1 space-x-1 bg-gray-700 rounded-lg">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => updateConfig({ mode: tab.id as CronMode })}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                config.mode === tab.id
                  ? "bg-blue-600 text-white"
                  : "text-gray-300 hover:text-white hover:bg-gray-600"
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
          <div className="grid grid-cols-2 gap-4">
            {/* Hour */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-300">
                Giờ
              </label>
              <select
                value={config.hour}
                onChange={(e) => updateConfig({ hour: e.target.value })}
                className="w-full px-3 py-2 text-gray-100 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {hourOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Minute */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-300">
                Phút
              </label>
              <select
                value={config.minute}
                onChange={(e) => updateConfig({ minute: e.target.value })}
                className="w-full px-3 py-2 text-gray-100 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {minuteOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Weekly specific */}
        {config.mode === "weekly" && (
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-300">
              Ngày trong tuần
            </label>
            <select
              value={config.dayOfWeek}
              onChange={(e) => updateConfig({ dayOfWeek: e.target.value })}
              className="w-full px-3 py-2 text-gray-100 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-300">
              Ngày trong tháng
            </label>
            <select
              value={config.dayOfMonth}
              onChange={(e) => updateConfig({ dayOfMonth: e.target.value })}
              className="w-full px-3 py-2 text-gray-100 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-300">
              Cron Expression
            </label>
            <input
              type="text"
              value={config.customExpression}
              onChange={(e) =>
                updateConfig({ customExpression: e.target.value })
              }
              className={`w-full px-3 py-2 bg-gray-700 border rounded-md text-gray-100 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                error ? "border-red-500" : "border-gray-600"
              }`}
              placeholder={placeholder}
            />
          </div>
        )}

        {/* Preview */}
        <div className="p-3 bg-gray-900 bg-opacity-50 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-medium text-gray-300">Preview:</span>
          </div>
          <code className="font-mono text-sm text-blue-300">
            {generateCronExpression(config)}
          </code>
        </div>
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}
    </div>
  );
};

export default CronExpressionBuilder;
