import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface NotificationConfig {
  id: string;
  configKey: string;
  warningThresholdDays: number;
  scanCronExpression: string;
  quartzEnabled: boolean;
  logRetentionDays: number;
  createAt: string;
  updateAt: string;
}

export interface UpdateNotificationConfigRequest {
  warningThresholdDays: number;
  scanCronExpression: string;
  quartzEnabled: boolean;
  logRetentionDays: number;
}

export interface NotificationLog {
  id: string;
  documentId: string;
  documentVersion: string;
  notificationType: number;
  recipientType: number;
  recipientAddress: string;
  subject: string;
  message: string;
  isSent: boolean;
  sentAt: string;
  isDismissed: boolean;
  dismissedAt: string | null;
  dismissedByUserId: string | null;
  errorMessage: string | null;
  createAt: string;
}

export interface NotificationLogsResponse {
  size: number;
  page: number;
  total: number;
  totalPages: number;
  items: NotificationLog[];
}

export interface NotificationLogsFilters {
  page?: number;
  size?: number;
  documentId?: string;
  notificationType?: string;
  recipient?: string;
  sortBy?: string;
  isAsc?: boolean;
}

const getAuthToken = () => {
  const user = localStorage.getItem("user");
  if (user) {
    const userData = JSON.parse(user);
    return userData.docaiToken;
  }
  return null;
};

const fetchNotificationConfig = async (): Promise<NotificationConfig> => {
  const token = getAuthToken();
  if (!token) {
    throw new Error("No authentication token found");
  }

  const response = await fetch(
    "https://production.docai.asia/api/notification/config",
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message || `HTTP error! status: ${response.status}`
    );
  }

  return response.json();
};

const updateNotificationConfig = async (
  data: UpdateNotificationConfigRequest
): Promise<NotificationConfig> => {
  const token = getAuthToken();
  if (!token) {
    throw new Error("No authentication token found");
  }

  const response = await fetch(
    "https://production.docai.asia/api/notification/config",
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message || `HTTP error! status: ${response.status}`
    );
  }

  return response.json();
};

const fetchNotificationLogs = async (
  filters: NotificationLogsFilters = {}
): Promise<NotificationLogsResponse> => {
  const token = getAuthToken();
  if (!token) {
    throw new Error("No authentication token found");
  }

  const params = new URLSearchParams();
  params.append("Page", (filters.page || 1).toString());
  params.append("Size", (filters.size || 10).toString());

  if (filters.documentId) params.append("DocumentId", filters.documentId);
  if (filters.notificationType)
    params.append("NotificationType", filters.notificationType);
  if (filters.recipient) params.append("Recipient", filters.recipient);
  if (filters.sortBy) params.append("SortBy", filters.sortBy);
  if (filters.isAsc !== undefined)
    params.append("IsAsc", filters.isAsc.toString());

  const response = await fetch(
    `https://production.docai.asia/api/notification/admin/all-logs?${params}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message || `HTTP error! status: ${response.status}`
    );
  }

  return response.json();
};

// React Query hooks
export const useNotificationConfig = () => {
  return useQuery({
    queryKey: ["notificationConfig"],
    queryFn: fetchNotificationConfig,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};

export const useUpdateNotificationConfig = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateNotificationConfig,
    onSuccess: () => {
      // Invalidate and refetch notification config data
      queryClient.invalidateQueries({ queryKey: ["notificationConfig"] });
    },
  });
};

export const useNotificationLogs = (filters: NotificationLogsFilters = {}) => {
  return useQuery({
    queryKey: ["notificationLogs", filters],
    queryFn: () => fetchNotificationLogs(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 2,
  });
};
