import { useQuery } from "@tanstack/react-query";

export interface User {
  userId: string;
  email: string;
  fullName: string;
  phone: string;
  role: {
    id: string;
    roleName: string;
    description: string;
    createAt: string;
    updateAt: string;
  };
  department: {
    id: string;
    name: string;
    description: string;
    createAt: string;
    updateAt: string;
  };
  userSetting: {
    id: string;
    twoFactorEnabled: boolean;
    twoFactorMethod: string;
    notificationsEnabled: boolean;
    updateAt: string;
  };
  createAt: string;
  updateAt: string;
}

export interface UsersResponse {
  size: number;
  page: number;
  total: number;
  totalPages: number;
  items: User[];
}

export interface UserAnalyticsData {
  date: string;
  newUsers: number;
  activeUsers: number;
  totalUsers?: number;
}

const getAuthToken = () => {
  const user = localStorage.getItem("user");
  if (user) {
    const userData = JSON.parse(user);
    return userData.docaiToken;
  }
  return null;
};

// Fetch users from API with date range
const fetchUsersInDateRange = async (
  createdFrom: string,
  createdTo: string
): Promise<UsersResponse> => {
  const token = getAuthToken();
  if (!token) {
    throw new Error("No authentication token found");
  }

  const params = new URLSearchParams({
    page: "1",
    size: "1000", // Get all users in date range
    CreatedFrom: createdFrom,
    CreatedTo: createdTo,
    isAsc: "true",
  });

  const response = await fetch(
    `https://production.docai.asia/api/auth/users?${params}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch users");
  }

  return response.json();
};

// Generate date ranges based on time range type
const generateDateRanges = (timeRange: "daily" | "weekly" | "monthly") => {
  const ranges = [];
  const today = new Date();

  if (timeRange === "daily") {
    // Last 30 days
    for (let i = 10; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      ranges.push({
        date: dateStr,
        createdFrom: dateStr,
        createdTo: dateStr,
      });
    }
  } else if (timeRange === "weekly") {
    // Last 7 weeks
    for (let i = 6; i >= 0; i--) {
      const endDate = new Date(today);
      endDate.setDate(endDate.getDate() - i * 7);
      const startDate = new Date(endDate);
      startDate.setDate(startDate.getDate() - 6);

      ranges.push({
        date: endDate.toISOString().split("T")[0],
        createdFrom: startDate.toISOString().split("T")[0],
        createdTo: endDate.toISOString().split("T")[0],
      });
    }
  } else if (timeRange === "monthly") {
    // Last 12 months
    for (let i = 11; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);

      ranges.push({
        date: date.toISOString().split("T")[0],
        createdFrom: date.toISOString().split("T")[0],
        createdTo: endDate.toISOString().split("T")[0],
      });
    }
  }

  return ranges;
};

// Fetch user analytics by time range
const fetchUserAnalytics = async (
  timeRange: "daily" | "weekly" | "monthly"
): Promise<UserAnalyticsData[]> => {
  const dateRanges = generateDateRanges(timeRange);
  const analyticsData: UserAnalyticsData[] = [];

  // Fetch data for each date range
  for (const range of dateRanges) {
    try {
      const usersResponse = await fetchUsersInDateRange(
        range.createdFrom,
        range.createdTo
      );

      // For simplicity, we'll consider all users in the date range as "new users"
      // and simulate active users as a percentage of new users
      const newUsers = usersResponse.total;
      const activeUsers = Math.floor(newUsers * 0.7); // 70% of new users are active

      analyticsData.push({
        date: range.date,
        newUsers,
        activeUsers,
        totalUsers: timeRange === "monthly" ? newUsers : undefined,
      });
    } catch (error) {
      console.error(`Error fetching data for ${range.date}:`, error);
      // Add empty data point to maintain chart continuity
      analyticsData.push({
        date: range.date,
        newUsers: 0,
        activeUsers: 0,
        totalUsers: timeRange === "monthly" ? 0 : undefined,
      });
    }
  }

  return analyticsData;
};

// React Query hooks for different time ranges
export const useUserAnalytics = (timeRange: "daily" | "weekly" | "monthly") => {
  return useQuery({
    queryKey: ["userAnalytics", timeRange],
    queryFn: () => fetchUserAnalytics(timeRange),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 60 * 1000, // Refetch every 10 minutes
  });
};

// Individual hooks for each time range
export const useDailyUserAnalytics = () => {
  return useUserAnalytics("daily");
};

export const useWeeklyUserAnalytics = () => {
  return useUserAnalytics("weekly");
};

export const useMonthlyUserAnalytics = () => {
  return useUserAnalytics("monthly");
};
