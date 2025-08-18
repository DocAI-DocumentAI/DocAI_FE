import { useQuery, useMutation } from "@tanstack/react-query";

export interface ChatboxStatisticsData {
  date: string;
  messageCount: number;
  sessionCount: number;
  uniqueUsers: number;
  tokensUsed: number;
}

export interface ModelStatisticsData {
  modelName: string;
  sessionCount: number;
  messageCount: number;
  tokensUsed: number;
  uniqueUsers: number;
  lastUsed: string;
  averageSessionLength: number;
  usagePercentage: number;
}

export interface AIConfigurationData {
  id: string;
  modelName: string;
  displayName: string;
  isActive: boolean;
  isFree: boolean;
  isDefault: boolean;
  maxTokens: number;
  temperature: number;
  topP: number;
  systemPrompt: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

export interface CreateAIConfigurationRequest {
  modelName: string;
  displayName: string;
  temperature: number;
  topP: number;
  maxTokens: number;
  systemPrompt: string;
  isFree: boolean;
}

export interface UpdateAIConfigurationRequest {
  modelName: string;
  displayName: string;
  temperature: number;
  topP: number;
  maxTokens: number;
  systemPrompt: string;
  isFree: boolean;
}

export interface ModelUsageStats {
  modelName: string;
  sessionCount: number;
  messageCount: number;
  tokensUsed: number;
  uniqueUsers: number;
  lastUsed: string;
  averageSessionLength: number;
  usagePercentage: number;
}

export interface ChatboxStatisticsOverview {
  totalSessions: number;
  totalMessages: number;
  totalUsers: number;
  activeSessions: number;
  modelUsageStats: ModelUsageStats[];
  generatedAt: string;
}

const getAuthToken = () => {
  const user = localStorage.getItem("user");
  if (user) {
    const userData = JSON.parse(user);
    return userData.docaiToken;
  }
  return null;
};

// Fetch chatbox statistics from API
const fetchChatboxStatistics = async (
  days: number
): Promise<ChatboxStatisticsData[]> => {
  const token = getAuthToken();
  if (!token) {
    throw new Error("No authentication token found");
  }

  const response = await fetch(
    `https://production.docai.asia/api/chatbox/statistics/daily?days=${days}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch chatbox statistics");
  }

  return response.json();
};

// Get days parameter based on time range
const getDaysForTimeRange = (
  timeRange: "daily" | "weekly" | "monthly"
): number => {
  switch (timeRange) {
    case "daily":
      return 7; // Last 7 days
    case "weekly":
      return 30; // Last 30 days (approximately 4 weeks)
    case "monthly":
      return 365; // Last 365 days (approximately 12 months)
    default:
      return 7;
  }
};

// React Query hook for chatbox statistics
export const useChatboxStatistics = (
  timeRange: "daily" | "weekly" | "monthly"
) => {
  const days = getDaysForTimeRange(timeRange);

  return useQuery({
    queryKey: ["chatboxStatistics", timeRange, days],
    queryFn: () => fetchChatboxStatistics(days),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 60 * 1000, // Refetch every 10 minutes
  });
};

// Individual hooks for each time range
export const useDailyChatboxStatistics = () => {
  return useChatboxStatistics("daily");
};

export const useWeeklyChatboxStatistics = () => {
  return useChatboxStatistics("weekly");
};

export const useMonthlyChatboxStatistics = () => {
  return useChatboxStatistics("monthly");
};

// Fetch model statistics from API
const fetchModelStatistics = async (): Promise<ModelStatisticsData[]> => {
  const token = getAuthToken();
  if (!token) {
    throw new Error("No authentication token found");
  }

  const response = await fetch(
    `https://production.docai.asia/api/chatbox/statistics/models`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch model statistics");
  }

  return response.json();
};

// React Query hook for model statistics
export const useModelStatistics = () => {
  return useQuery({
    queryKey: ["modelStatistics"],
    queryFn: fetchModelStatistics,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 60 * 1000, // Refetch every 10 minutes
  });
};

// Fetch AI configurations from API
const fetchAIConfigurations = async (): Promise<AIConfigurationData[]> => {
  const token = getAuthToken();
  if (!token) {
    throw new Error("No authentication token found");
  }

  const response = await fetch(
    `https://production.docai.asia/api/chatbox/configurations`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch AI configurations");
  }

  return response.json();
};

// React Query hook for AI configurations
export const useAIConfigurations = () => {
  return useQuery({
    queryKey: ["aiConfigurations"],
    queryFn: fetchAIConfigurations,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 60 * 1000, // Refetch every 10 minutes
  });
};

// Create AI configuration
const createAIConfiguration = async (
  data: CreateAIConfigurationRequest
): Promise<AIConfigurationData> => {
  const token = getAuthToken();
  if (!token) {
    throw new Error("No authentication token found");
  }

  const response = await fetch(
    `https://production.docai.asia/api/chatbox/configuration`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to create AI configuration");
  }

  return response.json();
};

// React Query mutation for creating AI configuration
export const useCreateAIConfiguration = () => {
  return useMutation({
    mutationFn: createAIConfiguration,
  });
};

// Update AI configuration
const updateAIConfiguration = async (
  id: string,
  data: UpdateAIConfigurationRequest
): Promise<AIConfigurationData> => {
  const token = getAuthToken();
  if (!token) {
    throw new Error("No authentication token found");
  }

  const response = await fetch(
    `https://production.docai.asia/api/chatbox/configuration/${id}`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to update AI configuration");
  }

  return response.json();
};

// React Query mutation for updating AI configuration
export const useUpdateAIConfiguration = () => {
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateAIConfigurationRequest;
    }) => updateAIConfiguration(id, data),
  });
};

// Delete AI configuration
const deleteAIConfiguration = async (id: string): Promise<void> => {
  const token = getAuthToken();
  if (!token) {
    throw new Error("No authentication token found");
  }

  const response = await fetch(
    `https://production.docai.asia/api/chatbox/configuration/${id}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to delete AI configuration");
  }
};

// React Query mutation for deleting AI configuration
export const useDeleteAIConfiguration = () => {
  return useMutation({
    mutationFn: deleteAIConfiguration,
  });
};

// Activate AI configuration
const activateAIConfiguration = async (id: string): Promise<void> => {
  const token = getAuthToken();
  if (!token) {
    throw new Error("No authentication token found");
  }

  const response = await fetch(
    `https://production.docai.asia/api/chatbox/configuration/${id}/activate`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to activate AI configuration");
  }
};

// Deactivate AI configuration
const deactivateAIConfiguration = async (id: string): Promise<void> => {
  const token = getAuthToken();
  if (!token) {
    throw new Error("No authentication token found");
  }

  const response = await fetch(
    `https://production.docai.asia/api/chatbox/configuration/${id}/deactivate`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message || "Failed to deactivate AI configuration"
    );
  }
};

// Set default AI configuration
const setDefaultAIConfiguration = async (id: string): Promise<void> => {
  const token = getAuthToken();
  if (!token) {
    throw new Error("No authentication token found");
  }

  const response = await fetch(
    `https://production.docai.asia/api/chatbox/configuration/${id}/set-default`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message || "Failed to set default AI configuration"
    );
  }
};

// React Query mutations
export const useActivateAIConfiguration = () => {
  return useMutation({
    mutationFn: activateAIConfiguration,
  });
};

export const useDeactivateAIConfiguration = () => {
  return useMutation({
    mutationFn: deactivateAIConfiguration,
  });
};

export const useSetDefaultAIConfiguration = () => {
  return useMutation({
    mutationFn: setDefaultAIConfiguration,
  });
};

// Fetch chatbox statistics overview from API
const fetchChatboxStatisticsOverview =
  async (): Promise<ChatboxStatisticsOverview> => {
    const token = getAuthToken();
    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await fetch(
      `https://production.docai.asia/api/chatbox/statistics`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch chatbox statistics overview");
    }

    return response.json();
  };

// React Query hook for chatbox statistics overview
export const useChatboxStatisticsOverview = () => {
  return useQuery({
    queryKey: ["chatboxStatisticsOverview"],
    queryFn: fetchChatboxStatisticsOverview,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 60 * 1000, // Refetch every 10 minutes
  });
};
