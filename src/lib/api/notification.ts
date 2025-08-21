import { api } from "./api";

export interface Notification {
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
  dismissedAt: string;
  dismissedByUserId: string;
  errorMessage: string;
  createAt: string;
  isRead?: boolean; // Thêm field này cho user notifications
}

export interface NotificationFilters {
  documentId?: string;
  notificationType?: number;
  recipientType?: number;
  isSent?: boolean;
  isDismissed?: boolean;
  fromDate?: string;
  toDate?: string;
}

export interface UserNotificationFilters {
  isRead?: boolean;
  notificationType?: number;
  search?: string;
}

export interface NotificationResponse {
  size: number;
  page: number;
  total: number;
  totalPages: number;
  items: Notification[];
}

// Admin notification logs
export const getNotificationLogs = async (
  pageNumber = 1,
  pageSize = 10,
  filters: NotificationFilters = {}
) => {
  let url = `/notification/logs?Page=${pageNumber}&Size=${pageSize}`;

  // Add filters to URL
  if (filters.documentId) {
    url += `&DocumentId=${encodeURIComponent(filters.documentId)}`;
  }
  if (filters.notificationType !== undefined) {
    url += `&NotificationType=${filters.notificationType}`;
  }
  if (filters.recipientType !== undefined) {
    url += `&RecipientType=${filters.recipientType}`;
  }
  if (filters.isSent !== undefined) {
    url += `&IsSent=${filters.isSent}`;
  }
  if (filters.isDismissed !== undefined) {
    url += `&IsDismissed=${filters.isDismissed}`;
  }
  if (filters.fromDate) {
    url += `&FromDate=${encodeURIComponent(filters.fromDate)}`;
  }
  if (filters.toDate) {
    url += `&ToDate=${encodeURIComponent(filters.toDate)}`;
  }

  const response = await api.get(url);
  return response.data.data as NotificationResponse;
};

export const dismissNotification = async (id: string) => {
  const response = await api.post(`/notification/dismiss/${id}`);
  return response.data;
};

export const resendNotification = async (id: string) => {
  const response = await api.post(`/notification/${id}/resend`);
  return response.data;
};

// User notifications - chỉ xem và đánh dấu đã đọc
export const getUserNotifications = async (
  pageNumber = 1,
  pageSize = 20,
  filters: UserNotificationFilters = {}
) => {
  let url = `/notification/logs?Page=${pageNumber}&Size=${pageSize}`;

  if (filters.isRead !== undefined) {
    url += `&IsRead=${filters.isRead}`;
  }
  if (filters.notificationType !== undefined) {
    url += `&NotificationType=${filters.notificationType}`;
  }
  if (filters.search) {
    url += `&Search=${encodeURIComponent(filters.search)}`;
  }

  const response = await api.get(url);
  return response.data as NotificationResponse;
};

export const markNotificationAsRead = async (id: string) => {
  const response = await api.patch(`/notification/${id}/read`);
  return response.data;
};

// Get unread notification count
export const getUnreadNotificationCount = async (): Promise<number> => {
  try {
    const response = await getUserNotifications(1, 1, { isRead: false });
    return response.total || 0;
  } catch (error) {
    console.error("Failed to get unread notification count:", error);
    return 0;
  }
};
