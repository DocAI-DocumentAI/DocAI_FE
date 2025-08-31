/**
 * Utility functions for parsing and formatting cron expressions
 */

export interface ParsedCronExpression {
  type: "daily" | "weekly" | "monthly" | "custom";
  description: string;
  time: string;
  dayOfWeek?: string;
  dayOfMonth?: string;
  originalExpression: string;
}

const dayOfWeekMap: Record<string, string> = {
  "0": "Sunday",
  "1": "Monday",
  "2": "Tuesday",
  "3": "Wednesday",
  "4": "Thursday",
  "5": "Friday",
  "6": "Saturday",
  "7": "Sunday", // Some systems use 7 for Sunday
  SUN: "Sunday",
  MON: "Monday",
  TUE: "Tuesday",
  WED: "Wednesday",
  THU: "Thursday",
  FRI: "Friday",
  SAT: "Saturday",
};

const monthMap: Record<string, string> = {
  "1": "January",
  "2": "February",
  "3": "March",
  "4": "April",
  "5": "May",
  "6": "June",
  "7": "July",
  "8": "August",
  "9": "September",
  "10": "October",
  "11": "November",
  "12": "December",
};

/**
 * Format time from hour and minute strings
 */
const formatTime = (hour: string, minute: string): string => {
  const h = parseInt(hour, 10);
  const m = parseInt(minute, 10);

  if (isNaN(h) || isNaN(m)) {
    return `${hour}:${minute}`;
  }

  const period = h >= 12 ? "PM" : "AM";
  const displayHour = h === 0 ? 12 : h > 12 ? h - 12 : h;
  const displayMinute = m.toString().padStart(2, "0");

  return `${displayHour}:${displayMinute} ${period}`;
};

/**
 * Parse minute value and return description
 */
const parseMinute = (minute: string): string => {
  if (minute === "*") return "every minute";

  // Handle steps like 0/30 (every 30 minutes starting at 0)
  if (minute.includes("/")) {
    const [base, step] = minute.split("/");
    const stepNum = parseInt(step, 10);
    if (base === "*") {
      return `every ${stepNum} minutes`;
    } else {
      const baseNum = parseInt(base, 10);
      if (!isNaN(baseNum) && !isNaN(stepNum)) {
        return `every ${stepNum} minutes starting at minute ${baseNum}`;
      }
    }
  }

  // Handle ranges like 0-30
  if (minute.includes("-")) {
    const [start, end] = minute.split("-");
    return `minutes ${start} to ${end}`;
  }

  // Handle lists like 0,15,30,45
  if (minute.includes(",")) {
    const minutes = minute.split(",");
    return `minutes ${minutes.join(", ")}`;
  }

  return `minute ${minute}`;
};

/**
 * Parse hour value and return description
 */
const parseHour = (hour: string): string => {
  if (hour === "*") return "every hour";

  // Handle steps like 0/6 (every 6 hours starting at 0)
  if (hour.includes("/")) {
    const [base, step] = hour.split("/");
    const stepNum = parseInt(step, 10);
    if (base === "*") {
      return `every ${stepNum} hours`;
    } else {
      const baseNum = parseInt(base, 10);
      if (!isNaN(baseNum) && !isNaN(stepNum)) {
        const baseTime = formatTime(base, "0");
        return `every ${stepNum} hours starting at ${baseTime}`;
      }
    }
  }

  // Handle ranges like 9-17
  if (hour.includes("-")) {
    const [start, end] = hour.split("-");
    const startTime = formatTime(start, "0");
    const endTime = formatTime(end, "0");
    return `hours ${startTime} to ${endTime}`;
  }

  // Handle lists like 9,12,15
  if (hour.includes(",")) {
    const hours = hour.split(",").map(h => formatTime(h, "0"));
    return `at ${hours.join(", ")}`;
  }

  return formatTime(hour, "0");
};

/**
 * Parse day of week value and return description
 */
const parseDayOfWeek = (dayOfWeek: string): string => {
  if (dayOfWeek === "?" || dayOfWeek === "*") return "";

  // Handle ranges like MON-FRI
  if (dayOfWeek.includes("-")) {
    const [start, end] = dayOfWeek.split("-");
    const startDay = dayOfWeekMap[start] || start;
    const endDay = dayOfWeekMap[end] || end;
    return `${startDay} to ${endDay}`;
  }

  // Handle lists like MON,WED,FRI
  if (dayOfWeek.includes(",")) {
    const days = dayOfWeek.split(",").map(day => dayOfWeekMap[day] || day);
    return days.join(", ");
  }

  // Handle steps like */2 (every 2 days)
  if (dayOfWeek.includes("/")) {
    const [base, step] = dayOfWeek.split("/");
    if (base === "*") {
      return `every ${step} days`;
    }
  }

  return dayOfWeekMap[dayOfWeek] || dayOfWeek;
};

/**
 * Parse day of month value and return description
 */
const parseDayOfMonth = (dayOfMonth: string): string => {
  if (dayOfMonth === "?" || dayOfMonth === "*") return "";

  if (dayOfMonth === "L") {
    return "last day of the month";
  }

  // Handle last weekday like 5L (last Friday)
  if (dayOfMonth.endsWith("L")) {
    const dayNum = dayOfMonth.replace("L", "");
    if (dayOfWeekMap[dayNum]) {
      return `last ${dayOfWeekMap[dayNum]} of the month`;
    }
  }

  // Handle ranges like 1-15
  if (dayOfMonth.includes("-")) {
    const [start, end] = dayOfMonth.split("-");
    return `day ${start} to ${end}`;
  }

  // Handle lists like 1,15,30
  if (dayOfMonth.includes(",")) {
    const days = dayOfMonth.split(",");
    return `day ${days.join(", ")}`;
  }

  // Handle steps like */5 (every 5 days)
  if (dayOfMonth.includes("/")) {
    const [base, step] = dayOfMonth.split("/");
    if (base === "*") {
      return `every ${step} days`;
    }
  }

  const day = parseInt(dayOfMonth, 10);
  if (!isNaN(day)) {
    const suffix = day === 1 ? "st" : day === 2 ? "nd" : day === 3 ? "rd" : "th";
    return `${day}${suffix}`;
  }

  return dayOfMonth;
};

/**
 * Parse month value and return description
 */
const parseMonth = (month: string): string => {
  if (month === "*") return "";

  // Handle ranges like 1-6
  if (month.includes("-")) {
    const [start, end] = month.split("-");
    const startMonth = monthMap[start] || start;
    const endMonth = monthMap[end] || end;
    return `${startMonth} to ${endMonth}`;
  }

  // Handle lists like 1,6,12
  if (month.includes(",")) {
    const months = month.split(",").map(m => monthMap[m] || m);
    return months.join(", ");
  }

  // Handle steps like */3 (every 3 months)
  if (month.includes("/")) {
    const [base, step] = month.split("/");
    if (base === "*") {
      return `every ${step} months`;
    }
  }

  return monthMap[month] || month;
};

/**
 * Parse a cron expression and return a human-readable description
 */
export const parseCronExpression = (
  cronExpression: string
): ParsedCronExpression => {
  const originalExpression = cronExpression;

  if (!cronExpression || !cronExpression.trim()) {
    return {
      type: "custom",
      description: "No schedule configured",
      time: "",
      originalExpression,
    };
  }

  // Auto-fix common errors before parsing
  const fixedExpression = fixCronExpression(cronExpression);
  const parts = fixedExpression.trim().split(/\s+/);

  // Handle both 5-part (minute hour day month dow) and 6-part (second minute hour day month dow) cron expressions
  let minute, hour, dayOfMonth, month, dayOfWeek;

  if (parts.length === 5) {
    // Standard 5-part cron: minute hour day month dow
    [minute, hour, dayOfMonth, month, dayOfWeek] = parts;
  } else if (parts.length === 6) {
    // 6-part cron with seconds: second minute hour day month dow
    [, minute, hour, dayOfMonth, month, dayOfWeek] = parts;
  } else if (parts.length === 7) {
    // 7-part cron with year: second minute hour day month dow year
    [, minute, hour, dayOfMonth, month, dayOfWeek] = parts;
  } else {
    return {
      type: "custom",
      description: cronExpression,
      time: "",
      originalExpression,
    };
  }

  // Format time
  const time = formatTime(hour, minute);

  // Parse individual components
  const dayOfWeekDesc = parseDayOfWeek(dayOfWeek);
  const dayOfMonthDesc = parseDayOfMonth(dayOfMonth);
  const monthDesc = parseMonth(month);

  // Daily pattern: * * * * * ? (any time, any day, any month, no specific day of week)
  if (dayOfMonth === "*" && month === "*" && (dayOfWeek === "?" || dayOfWeek === "*")) {
    // Check if it's truly daily (every day)
    if (hour !== "*" && minute !== "*") {
      return {
        type: "daily",
        description: `Daily at ${time}`,
        time,
        originalExpression,
      };
    }
  }

  // Weekly pattern: specific day of week, any day of month
  if (
    (dayOfMonth === "?" || dayOfMonth === "*") &&
    month === "*" &&
    dayOfWeek !== "?" &&
    dayOfWeek !== "*"
  ) {
    const dayDesc = parseDayOfWeek(dayOfWeek);
    if (dayDesc && hour !== "*" && minute !== "*") {
      return {
        type: "weekly",
        description: `Weekly on ${dayDesc} at ${time}`,
        time,
        dayOfWeek: dayDesc,
        originalExpression,
      };
    }
  }

  // Monthly pattern: specific day of month, no specific day of week
  if (month === "*" && (dayOfWeek === "?" || dayOfWeek === "*") && dayOfMonth !== "*" && dayOfMonth !== "?") {
    const dayDesc = parseDayOfMonth(dayOfMonth);
    if (hour !== "*" && minute !== "*") {
      return {
        type: "monthly",
        description: `Monthly on the ${dayDesc} at ${time}`,
        time,
        dayOfMonth: dayDesc,
        originalExpression,
      };
    }
  }

  // Build complex description for other patterns
  let description = "";

  // Handle minute patterns
  const minuteDesc = parseMinute(minute);
  const hourDesc = parseHour(hour);

  // Special handling for step patterns
  if (minute.includes("/") && hour === "*") {
    // Pattern like "0 0/30 * * * ?" - every 30 minutes
    description = minuteDesc.charAt(0).toUpperCase() + minuteDesc.slice(1);
  } else if (hour.includes("/") && minute === "0") {
    // Pattern like "0 0 */6 * * ?" - every 6 hours
    description = hourDesc.charAt(0).toUpperCase() + hourDesc.slice(1);
  } else if (minute.includes("/") && hour.includes("/")) {
    // Both minute and hour have steps
    description = `${minuteDesc} and ${hourDesc}`;
  } else if (hour !== "*" && minute !== "*") {
    // Specific time
    description = `At ${time}`;
  } else if (hour !== "*") {
    // Specific hour, any minute
    if (minute === "*") {
      description = `Every minute during ${hourDesc}`;
    } else {
      description = `At ${minuteDesc} during ${hourDesc}`;
    }
  } else if (minute !== "*") {
    // Any hour, specific minute pattern
    description = minuteDesc.charAt(0).toUpperCase() + minuteDesc.slice(1) + " of every hour";
  } else {
    // Both hour and minute are *
    description = "Every minute";
  }

  // Add day of week information
  if (dayOfWeekDesc) {
    description += ` on ${dayOfWeekDesc}`;
  }

  // Add day of month information
  if (dayOfMonthDesc) {
    if (dayOfWeekDesc) {
      description += ` and on the ${dayOfMonthDesc}`;
    } else {
      description += ` on the ${dayOfMonthDesc}`;
    }
  }

  // Add month information
  if (monthDesc) {
    description += ` in ${monthDesc}`;
  }

  return {
    type: "custom",
    description,
    time,
    originalExpression,
  };
};

/**
 * Get a short description of the cron expression
 */
export const getCronDescription = (cronExpression: string): string => {
  const parsed = parseCronExpression(cronExpression);
  return parsed.description;
};

/**
 * Validate a cron expression format
 */
export const validateCronExpression = (
  cronExpression: string
): { isValid: boolean; error?: string } => {
  if (!cronExpression || !cronExpression.trim()) {
    return { isValid: false, error: "Cron expression is required" };
  }

  const parts = cronExpression.trim().split(/\s+/);

  if (parts.length < 5 || parts.length > 7) {
    return { isValid: false, error: "Cron expression must have 5 to 7 parts" };
  }

  // Determine format based on number of parts
  let second, minute, hour, dayOfMonth, month, dayOfWeek;

  if (parts.length === 5) {
    [minute, hour, dayOfMonth, month, dayOfWeek] = parts;
  } else if (parts.length === 6) {
    [second, minute, hour, dayOfMonth, month, dayOfWeek] = parts;
  } else {
    [second, minute, hour, dayOfMonth, month, dayOfWeek] = parts;
  }

  // Validate individual fields
  const validateField = (value: string, min: number, max: number, fieldName: string): string | null => {
    if (value === "*" || value === "?") return null;

    // Check for invalid patterns like "0*", "1*", etc.
    if (/^\d+\*/.test(value)) {
      return `Invalid ${fieldName} format: ${value}. Did you mean "*" or "${value.replace('*', '')}"?`;
    }

    // Check for invalid patterns like "*0", "*1", etc.
    if (/\*\d+/.test(value)) {
      return `Invalid ${fieldName} format: ${value}. Did you mean "*" or "${value.replace('*', '')}"?`;
    }

    // Handle ranges
    if (value.includes("-")) {
      const [start, end] = value.split("-");
      const startNum = parseInt(start, 10);
      const endNum = parseInt(end, 10);
      if (isNaN(startNum) || isNaN(endNum) || startNum < min || endNum > max || startNum > endNum) {
        return `Invalid range in ${fieldName}: ${value}`;
      }
      return null;
    }

    // Handle lists
    if (value.includes(",")) {
      const values = value.split(",");
      for (const val of values) {
        if (val.trim() === "") {
          return `Empty value in ${fieldName} list: ${value}`;
        }
        const num = parseInt(val, 10);
        if (isNaN(num) || num < min || num > max) {
          return `Invalid value in ${fieldName} list: ${val}`;
        }
      }
      return null;
    }

    // Handle steps
    if (value.includes("/")) {
      const [base, step] = value.split("/");
      const stepNum = parseInt(step, 10);
      if (isNaN(stepNum) || stepNum <= 0) {
        return `Invalid step value in ${fieldName}: ${step}`;
      }
      if (base !== "*" && base !== "?") {
        const baseNum = parseInt(base, 10);
        if (isNaN(baseNum) || baseNum < min || baseNum > max) {
          return `Invalid base value in ${fieldName}: ${base}`;
        }
      }
      return null;
    }

    // Handle single values
    const num = parseInt(value, 10);
    if (isNaN(num) || num < min || num > max) {
      return `Invalid ${fieldName} value: ${value} (must be ${min}-${max})`;
    }

    return null;
  };

  // Validate each field
  if (second !== undefined) {
    const error = validateField(second, 0, 59, "second");
    if (error) return { isValid: false, error };
  }

  const minuteError = validateField(minute, 0, 59, "minute");
  if (minuteError) return { isValid: false, error: minuteError };

  const hourError = validateField(hour, 0, 23, "hour");
  if (hourError) return { isValid: false, error: hourError };

  // Day of month validation (1-31, L, or special values)
  if (dayOfMonth !== "*" && dayOfMonth !== "?") {
    if (dayOfMonth === "L" || dayOfMonth.endsWith("L")) {
      // Valid last day patterns
    } else {
      const dayError = validateField(dayOfMonth, 1, 31, "day of month");
      if (dayError) return { isValid: false, error: dayError };
    }
  }

  const monthError = validateField(month, 1, 12, "month");
  if (monthError) return { isValid: false, error: monthError };

  // Day of week validation (0-7 or SUN-SAT)
  if (dayOfWeek !== "*" && dayOfWeek !== "?") {
    if (!dayOfWeek.includes("-") && !dayOfWeek.includes(",") && !dayOfWeek.includes("/")) {
      if (!dayOfWeekMap[dayOfWeek]) {
        return { isValid: false, error: `Invalid day of week: ${dayOfWeek}` };
      }
    }
  }

  // Validate day of month and day of week mutual exclusivity
  if (dayOfMonth !== "?" && dayOfMonth !== "*" && dayOfWeek !== "?" && dayOfWeek !== "*") {
    return {
      isValid: false,
      error: "Cannot specify both day of month and day of week. Use '?' for one of them. Example: '0 0 8 ? * MON' (weekly) or '0 0 8 15 * ?' (monthly)"
    };
  }

  // Additional validation: if day of week is specified, day of month should be ?
  if (dayOfWeek !== "?" && dayOfWeek !== "*" && dayOfMonth !== "?" && dayOfMonth !== "*") {
    return {
      isValid: false,
      error: "When specifying day of week, day of month must be '?'. Example: '0 0 8 ? * MON'"
    };
  }

  // Additional validation: if day of month is specified, day of week should be ?
  if (dayOfMonth !== "?" && dayOfMonth !== "*" && dayOfWeek !== "?" && dayOfWeek !== "*") {
    return {
      isValid: false,
      error: "When specifying day of month, day of week must be '?'. Example: '0 0 8 15 * ?'"
    };
  }

  return { isValid: true };
};

/**
 * Fix common cron expression errors
 */
export const fixCronExpression = (cronExpression: string): string => {
  if (!cronExpression || !cronExpression.trim()) {
    return cronExpression;
  }

  let fixed = cronExpression.trim();

  // Fix patterns like "0*", "1*", "2*" etc. -> "*"
  // Use word boundary to ensure we match complete tokens
  fixed = fixed.replace(/\b\d+\*\b/g, '*');

  // Fix patterns like "*0", "*1", "*2" etc. -> "*"
  fixed = fixed.replace(/\*\d+\b/g, '*');

  // Fix double spaces
  fixed = fixed.replace(/\s+/g, ' ');

  console.log(`[DEBUG] fixCronExpression: "${cronExpression}" → "${fixed}"`);

  return fixed;
};

/**
 * Get next execution time description (simplified)
 */
export const getNextExecutionDescription = (cronExpression: string): string => {
  const parsed = parseCronExpression(cronExpression);

  switch (parsed.type) {
    case "daily":
      return `Next: Today at ${parsed.time}`;
    case "weekly":
      return `Next: ${parsed.dayOfWeek} at ${parsed.time}`;
    case "monthly":
      return `Next: ${parsed.dayOfMonth} at ${parsed.time}`;
    default:
      return "Next execution time varies";
  }
};
