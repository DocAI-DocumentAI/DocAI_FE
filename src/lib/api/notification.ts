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
  isRead: boolean;
  readAt: string | null;
  sentAt: string;
  errorMessage: string | null;
  createAt: string;
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

export interface UnreadCountResponse {
  success: boolean;
  data: {
    unreadCount: number;
  };
  message: string;
}

// Admin notification logs (existing functions)
export const getNotificationLogs = async (
  pageNumber = 1,
  pageSize = 10,
  filters: NotificationFilters = {}
) => {
  let url = `/notification/logs?Page=${pageNumber}&Size=${pageSize}`;

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

// NEW USER NOTIFICATION FUNCTIONS
// 1. Get user's notifications
export const getMyNotifications = async (pageNumber = 1, pageSize = 20) => {
  const response = await api.get(
    `/notification/my-notifications?page=${pageNumber}&size=${pageSize}`
  );
  return response.data as NotificationResponse;
};

// 2. Get unread notification count
export const getUnreadNotificationCount = async () => {
  const response = await api.get("/notification/unread-count");
  return response.data as UnreadCountResponse;
};

// 3. Mark single notification as read
export const markNotificationAsRead = async (notificationId: string) => {
  const response = await api.post(`/notification/${notificationId}/mark-read`);
  return response.data;
};

// 4. Mark all notifications as read
export const markAllNotificationsAsRead = async () => {
  const response = await api.post("/notification/mark-all-read");
  return response.data;
};

// LEGACY FUNCTIONS (for backward compatibility - can be removed if not used elsewhere)
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
