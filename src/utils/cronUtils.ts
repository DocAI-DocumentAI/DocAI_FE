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

  const parts = cronExpression.trim().split(/\s+/);

  if (parts.length < 6) {
    return {
      type: "custom",
      description: cronExpression,
      time: "",
      originalExpression,
    };
  }

  const [, minute, hour, dayOfMonth, month, dayOfWeek] = parts;

  // Format time
  const time = formatTime(hour, minute);

  // Daily pattern: 0 MM HH * * ?
  if (dayOfMonth === "*" && month === "*" && dayOfWeek === "?") {
    return {
      type: "daily",
      description: `Daily at ${time}`,
      time,
      originalExpression,
    };
  }

  // Weekly pattern: 0 MM HH ? * DOW
  if (
    (dayOfMonth === "?" || dayOfMonth === "*") &&
    month === "*" &&
    dayOfWeek !== "?" &&
    dayOfWeekMap[dayOfWeek]
  ) {
    return {
      type: "weekly",
      description: `Weekly on ${dayOfWeekMap[dayOfWeek]} at ${time}`,
      time,
      dayOfWeek: dayOfWeekMap[dayOfWeek],
      originalExpression,
    };
  }

  // Monthly pattern: 0 MM HH DD * ?
  if (month === "*" && dayOfWeek === "?" && dayOfMonth !== "*") {
    let dayDescription = dayOfMonth;

    if (dayOfMonth === "L") {
      dayDescription = "last day of the month";
    } else if (dayOfMonth.endsWith("L")) {
      const dayNum = dayOfMonth.replace("L", "");
      if (dayOfWeekMap[dayNum]) {
        dayDescription = `last ${dayOfWeekMap[dayNum]} of the month`;
      }
    } else {
      const day = parseInt(dayOfMonth, 10);
      if (!isNaN(day)) {
        const suffix =
          day === 1 ? "st" : day === 2 ? "nd" : day === 3 ? "rd" : "th";
        dayDescription = `${day}${suffix}`;
      }
    }

    return {
      type: "monthly",
      description: `Monthly on the ${dayDescription} at ${time}`,
      time,
      dayOfMonth: dayDescription,
      originalExpression,
    };
  }

  // Complex patterns or unsupported formats
  let description = cronExpression;

  // Try to provide some basic interpretation for common patterns
  if (hour !== "*" && minute !== "*") {
    description = `At ${time}`;

    if (dayOfWeek !== "?" && dayOfWeek !== "*" && dayOfWeekMap[dayOfWeek]) {
      description += ` on ${dayOfWeekMap[dayOfWeek]}`;
    }

    if (dayOfMonth !== "*" && dayOfMonth !== "?") {
      if (dayOfMonth === "L") {
        description += " on the last day of the month";
      } else {
        description += ` on day ${dayOfMonth} of the month`;
      }
    }

    if (month !== "*" && monthMap[month]) {
      description += ` in ${monthMap[month]}`;
    }
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

  // Basic validation - just check if it's not empty and has the right number of parts
  // More complex validation can be added later if needed
  return { isValid: true };
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
