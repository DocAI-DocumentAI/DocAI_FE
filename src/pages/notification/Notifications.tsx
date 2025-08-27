"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Layout,
  Typography,
  Card,
  List,
  Tag,
  Row,
  Col,
  Badge,
  Avatar,
  Empty,
  Spin,
  Modal,
  Button,
  message,
} from "antd";
import {
  BellOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  SendOutlined,
  ReloadOutlined,
  ClockCircleOutlined,
  CheckOutlined,
} from "@ant-design/icons";
import { api } from "../../lib/api/api";
import moment from "moment";
import { Navbar } from "../../components/layout/Navbar";

const { Title, Text } = Typography;
const { Content } = Layout;

// Notification interface
interface Notification {
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

interface NotificationResponse {
  size: number;
  page: number;
  total: number;
  totalPages: number;
  items: Notification[];
}

interface UnreadCountResponse {
  success: boolean;
  data: {
    unreadCount: number;
  };
  message: string;
}

// Notification type mappings với màu sắc phù hợp
const notificationTypes = {
  1: {
    label: "Nearing Expiration",
    color: "orange",
    icon: <ClockCircleOutlined />,
    bgColor: "#fff7e6",
  },
  2: {
    label: "Expired",
    color: "red",
    icon: <CloseCircleOutlined />,
    bgColor: "#fff2f0",
  },
  3: {
    label: "Document Update",
    color: "blue",
    icon: <SendOutlined />,
    bgColor: "#f0f5ff",
  },
  4: {
    label: "System Maintenance",
    color: "purple",
    icon: <ExclamationCircleOutlined />,
    bgColor: "#f9f0ff",
  },
  5: {
    label: "System Escalation",
    color: "red",
    icon: <ExclamationCircleOutlined />,
    bgColor: "#fff2f0",
  },
  6: {
    label: "General",
    color: "default",
    icon: <BellOutlined />,
    bgColor: "#fafafa",
  },
  7: {
    label: "Document Submitted",
    color: "green",
    icon: <SendOutlined />,
    bgColor: "#f6ffed",
  },
  8: {
    label: "Document Approved",
    color: "green",
    icon: <CheckCircleOutlined />,
    bgColor: "#f6ffed",
  },
  9: {
    label: "Document Rejected",
    color: "red",
    icon: <CloseCircleOutlined />,
    bgColor: "#fff2f0",
  },
};

export default function UserNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [selectedNotification, setSelectedNotification] =
    useState<Notification | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [markingAsRead, setMarkingAsRead] = useState<Set<string>>(new Set());
  const [markingAllAsRead, setMarkingAllAsRead] = useState(false);

  // API functions
  const getMyNotifications = async (pageNumber = 1, pageSize = 20) => {
    const response = await api.get(
      `/notification/my-notifications?page=${pageNumber}&size=${pageSize}`
    );
    return response.data as NotificationResponse;
  };

  const getUnreadNotificationCount = async () => {
    const response = await api.get("/notification/unread-count");
    return response.data as UnreadCountResponse;
  };

  const markNotificationAsRead = async (notificationId: string) => {
    const response = await api.post(
      `/notification/${notificationId}/mark-read`
    );
    return response.data;
  };

  const markAllNotificationsAsRead = async () => {
    const response = await api.post("/notification/mark-all-read");
    return response.data;
  };

  // Refresh unread count from API
  const refreshUnreadCount = useCallback(async () => {
    try {
      const response = await getUnreadNotificationCount();
      setUnreadCount(response.data.unreadCount);
    } catch (error) {
      console.error("Failed to refresh unread count:", error);
    }
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getMyNotifications(page, 20);
      setNotifications(response.items || []);
      setTotal(response.total || 0);

      // Also refresh unread count
      await refreshUnreadCount();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      message.error(`Failed to load notifications: ${errorMessage}`);
      setNotifications([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [page, refreshUnreadCount]);

  // Fetch user notifications
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Load initial unread count
  useEffect(() => {
    refreshUnreadCount();
  }, [refreshUnreadCount]);

  const getNotificationTypeConfig = (type: number) => {
    return (
      notificationTypes[type as keyof typeof notificationTypes] || {
        label: `Type ${type}`,
        color: "default",
        icon: <BellOutlined />,
        bgColor: "#fafafa",
      }
    );
  };

  const formatTimeAgo = (dateString: string) => {
    return moment(dateString).fromNow();
  };

  const formatFullDate = (dateString: string) => {
    return moment(dateString).format("DD/MM/YYYY HH:mm:ss");
  };

  // Updated handleNotificationClick to mark as read automatically
  const handleNotificationClick = async (notification: Notification) => {
    // If notification is unread, mark it as read first
    if (!notification.isRead) {
      setMarkingAsRead((prev) => new Set([...prev, notification.id]));

      try {
        await markNotificationAsRead(notification.id);

        // Update local state
        const updatedNotification = {
          ...notification,
          isRead: true,
          readAt: new Date().toISOString(),
        };

        setNotifications((prev) =>
          prev.map((n) => (n.id === notification.id ? updatedNotification : n))
        );

        // Update selected notification for modal
        setSelectedNotification(updatedNotification);

        // Refresh unread count
        await refreshUnreadCount();

        // Trigger event to update navbar badge
        window.dispatchEvent(new CustomEvent("notification_update"));
      } catch (error) {
        console.error("Failed to mark notification as read:", error);
        message.error("Failed to mark notification as read");
        setSelectedNotification(notification); // Still show modal even if marking as read fails
      } finally {
        setMarkingAsRead((prev) => {
          const next = new Set(prev);
          next.delete(notification.id);
          return next;
        });
      }
    } else {
      // If already read, just set the selected notification
      setSelectedNotification(notification);
    }

    setIsModalVisible(true);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    setSelectedNotification(null);
  };

  const handleMarkAsRead = async (
    notificationId: string,
    e: React.MouseEvent
  ) => {
    e.stopPropagation(); // Prevent triggering the notification click

    setMarkingAsRead((prev) => new Set([...prev, notificationId]));

    try {
      await markNotificationAsRead(notificationId);

      // Update local state
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId
            ? { ...n, isRead: true, readAt: new Date().toISOString() }
            : n
        )
      );

      // Refresh unread count
      await refreshUnreadCount();

      // Trigger event to update navbar badge
      window.dispatchEvent(new CustomEvent("notification_update"));

      message.success("Notification marked as read");
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
      message.error("Failed to mark notification as read");
    } finally {
      setMarkingAsRead((prev) => {
        const next = new Set(prev);
        next.delete(notificationId);
        return next;
      });
    }
  };

  const handleMarkAllAsRead = async () => {
    setMarkingAllAsRead(true);

    try {
      await markAllNotificationsAsRead();

      // Update local state - mark all notifications as read
      setNotifications((prev) =>
        prev.map((n) => ({
          ...n,
          isRead: true,
          readAt: new Date().toISOString(),
        }))
      );

      // Refresh unread count
      await refreshUnreadCount();

      // Trigger event to update navbar badge
      window.dispatchEvent(new CustomEvent("notification_update"));

      message.success("All notifications marked as read");
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
      message.error("Failed to mark all notifications as read");
    } finally {
      setMarkingAllAsRead(false);
    }
  };

  // Function to strip HTML tags for preview
  const stripHtml = (html: string) => {
    const temp = document.createElement("div");
    temp.innerHTML = html;
    return temp.textContent || temp.innerText || "";
  };

  const stats = {
    total: total,
  };

  return (
    <Layout style={{ minHeight: "100vh", backgroundColor: "#f5f5f5" }}>
      <Navbar />
      <Content style={{ padding: "24px" }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          {/* Header */}
          <div style={{ marginBottom: 24 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <Title level={2} style={{ margin: 0 }}>
                  <BellOutlined style={{ marginRight: 8 }} />
                  Notifications
                  {unreadCount > 0 && (
                    <Badge
                      count={unreadCount}
                      style={{ marginLeft: 8 }}
                      showZero={false}
                    />
                  )}
                </Title>
                <Text type="secondary">View your document activities</Text>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                {unreadCount > 0 && (
                  <Button
                    type="primary"
                    icon={<CheckOutlined />}
                    loading={markingAllAsRead}
                    onClick={handleMarkAllAsRead}
                    size="small"
                  >
                    Mark All as Read
                  </Button>
                )}
                <ReloadOutlined
                  onClick={fetchData}
                  style={{
                    fontSize: "20px",
                    cursor: "pointer",
                    color: loading ? "#ccc" : "#1890ff",
                  }}
                />
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <Row gutter={16} style={{ marginBottom: 24 }}>
            <Col xs={12}>
              <Card size="small" style={{ textAlign: "center" }}>
                <div
                  style={{
                    fontSize: "20px",
                    fontWeight: "bold",
                    color: "#1890ff",
                  }}
                >
                  {stats.total}
                </div>
                <Text type="secondary" style={{ fontSize: "12px" }}>
                  Total Notifications
                </Text>
              </Card>
            </Col>
            <Col xs={12}>
              <Card size="small" style={{ textAlign: "center" }}>
                <div
                  style={{
                    fontSize: "20px",
                    fontWeight: "bold",
                    color: unreadCount > 0 ? "#ff4d4f" : "#52c41a",
                  }}
                >
                  {unreadCount}
                </div>
                <Text type="secondary" style={{ fontSize: "12px" }}>
                  Unread Notifications
                </Text>
              </Card>
            </Col>
          </Row>

          {/* Notifications List */}
          <Card>
            {loading ? (
              <div style={{ textAlign: "center", padding: "40px" }}>
                <Spin size="large" />
              </div>
            ) : notifications.length === 0 ? (
              <Empty
                description="No notifications found"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            ) : (
              <List
                itemLayout="vertical"
                dataSource={notifications}
                pagination={{
                  current: page,
                  pageSize: 20,
                  total: total,
                  showSizeChanger: false,
                  onChange: (p) => setPage(p),
                  showTotal: (t, range) =>
                    `${range[0]}-${range[1]} of ${t} notifications`,
                }}
                renderItem={(notification) => {
                  const typeConfig = getNotificationTypeConfig(
                    notification.notificationType
                  );
                  const isUnread = !notification.isRead;
                  const plainTextMessage = stripHtml(notification.message);
                  const isMarkingThisAsRead = markingAsRead.has(
                    notification.id
                  );

                  return (
                    <List.Item
                      style={{
                        backgroundColor: isUnread
                          ? typeConfig.bgColor
                          : "#ffffff",
                        border: isUnread
                          ? `1px solid ${typeConfig.color}`
                          : "1px solid #f0f0f0",
                        borderRadius: "8px",
                        marginBottom: "8px",
                        padding: "16px",
                        cursor: isMarkingThisAsRead ? "wait" : "pointer",
                        transition: "all 0.2s",
                        position: "relative",
                        opacity: isMarkingThisAsRead ? 0.7 : 1,
                      }}
                      onMouseEnter={(e) => {
                        if (!isMarkingThisAsRead) {
                          e.currentTarget.style.boxShadow =
                            "0 2px 8px rgba(0,0,0,0.1)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.boxShadow = "none";
                      }}
                      onClick={() =>
                        !isMarkingThisAsRead &&
                        handleNotificationClick(notification)
                      }
                    >
                      {/* Loading overlay when marking as read */}
                      {isMarkingThisAsRead && (
                        <div
                          style={{
                            position: "absolute",
                            top: "50%",
                            left: "50%",
                            transform: "translate(-50%, -50%)",
                            zIndex: 10,
                          }}
                        >
                          <Spin />
                        </div>
                      )}

                      {/* Read status indicator */}
                      <div
                        style={{
                          position: "absolute",
                          left: "8px",
                          top: "50%",
                          transform: "translateY(-50%)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: "24px",
                          height: "24px",
                        }}
                      >
                        {notification.isRead ? (
                          <CheckCircleOutlined
                            style={{ color: "#52c41a", fontSize: "16px" }}
                          />
                        ) : (
                          <div
                            style={{
                              width: "20px",
                              height: "20px",
                              border: "1px solid #d9d9d9",
                              borderRadius: "50%",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              backgroundColor: "#fff",
                              transition: "all 0.2s",
                            }}
                            onClick={(e) =>
                              handleMarkAsRead(notification.id, e)
                            }
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = "#f0f0f0";
                              e.currentTarget.style.borderColor = "#1890ff";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = "#fff";
                              e.currentTarget.style.borderColor = "#d9d9d9";
                            }}
                          >
                            {markingAsRead.has(notification.id) && (
                              <Spin size="small" style={{ fontSize: "10px" }} />
                            )}
                          </div>
                        )}
                      </div>

                      <List.Item.Meta
                        style={{ marginLeft: "32px" }} // Add margin to account for the read indicator
                        avatar={
                          <Avatar
                            style={{
                              backgroundColor: typeConfig.color,
                              color: "white",
                            }}
                            icon={typeConfig.icon}
                          />
                        }
                        title={
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                            }}
                          >
                            <div>
                              <Text
                                strong={isUnread}
                                style={{ fontSize: "16px" }}
                              >
                                {notification.subject}
                              </Text>
                              {isUnread && (
                                <Badge
                                  status="processing"
                                  style={{ marginLeft: 8 }}
                                />
                              )}
                            </div>
                            <Text type="secondary" style={{ fontSize: "12px" }}>
                              {formatTimeAgo(notification.createAt)}
                            </Text>
                          </div>
                        }
                        description={
                          <div>
                            <Tag color={typeConfig.color}>
                              {typeConfig.label}
                            </Tag>
                            <div style={{ marginTop: 8 }}>
                              <Text type="secondary">
                                {plainTextMessage.length > 100
                                  ? `${plainTextMessage.substring(0, 100)}...`
                                  : plainTextMessage}
                              </Text>
                            </div>
                            {notification.documentId && (
                              <div style={{ marginTop: 4 }}>
                                <Text
                                  style={{
                                    fontSize: "11px",
                                    fontFamily: "monospace",
                                    color: "#666",
                                  }}
                                >
                                  Document:{" "}
                                  {notification.documentId.substring(0, 8)}...
                                </Text>
                              </div>
                            )}
                          </div>
                        }
                      />
                    </List.Item>
                  );
                }}
              />
            )}
          </Card>
        </div>
      </Content>

      {/* Notification Detail Modal */}
      <Modal
        title={
          <div style={{ display: "flex", alignItems: "center" }}>
            {selectedNotification && (
              <>
                {
                  getNotificationTypeConfig(
                    selectedNotification.notificationType
                  ).icon
                }
                <span style={{ marginLeft: 8 }}>Notification Details</span>
              </>
            )}
          </div>
        }
        open={isModalVisible}
        onCancel={handleModalClose}
        footer={null}
        width={700}
        centered
      >
        {selectedNotification && (
          <div>
            <div style={{ marginBottom: 16 }}>
              <Text strong style={{ fontSize: "18px" }}>
                {selectedNotification.subject}
              </Text>
              <div style={{ marginTop: 8 }}>
                <Tag
                  color={
                    getNotificationTypeConfig(
                      selectedNotification.notificationType
                    ).color
                  }
                >
                  {
                    getNotificationTypeConfig(
                      selectedNotification.notificationType
                    ).label
                  }
                </Tag>
                {!selectedNotification.isRead && (
                  <Tag color="orange">Unread</Tag>
                )}
                {selectedNotification.isRead && <Tag color="green">Read</Tag>}
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <Text strong>Message:</Text>
              <div
                style={{
                  marginTop: 8,
                  padding: "16px",
                  backgroundColor: "#f9f9f9",
                  borderRadius: "6px",
                  border: "1px solid #e9e9e9",
                  lineHeight: "1.6",
                }}
                dangerouslySetInnerHTML={{
                  __html: selectedNotification.message,
                }}
              />
            </div>

            <Row gutter={16}>
              <Col span={12}>
                <div style={{ marginBottom: 12 }}>
                  <Text type="secondary" style={{ fontSize: "12px" }}>
                    Created At:
                  </Text>
                  <div>
                    <Text>{formatFullDate(selectedNotification.createAt)}</Text>
                  </div>
                </div>
              </Col>
              <Col span={12}>
                <div style={{ marginBottom: 12 }}>
                  <Text type="secondary" style={{ fontSize: "12px" }}>
                    Sent At:
                  </Text>
                  <div>
                    <Text>
                      {selectedNotification.sentAt
                        ? formatFullDate(selectedNotification.sentAt)
                        : "Not sent"}
                    </Text>
                  </div>
                </div>
              </Col>
            </Row>

            {selectedNotification.readAt && (
              <Row gutter={16}>
                <Col span={12}>
                  <div style={{ marginBottom: 12 }}>
                    <Text type="secondary" style={{ fontSize: "12px" }}>
                      Read At:
                    </Text>
                    <div>
                      <Text>{formatFullDate(selectedNotification.readAt)}</Text>
                    </div>
                  </div>
                </Col>
              </Row>
            )}

            {selectedNotification.documentId && (
              <div style={{ marginBottom: 12 }}>
                <Text type="secondary" style={{ fontSize: "12px" }}>
                  Related Document:
                </Text>
                <div
                  style={{
                    marginTop: 4,
                    padding: "8px",
                    backgroundColor: "#f0f5ff",
                    borderRadius: "4px",
                    fontFamily: "monospace",
                  }}
                >
                  <Text>{selectedNotification.documentId}</Text>
                  {selectedNotification.documentVersion && (
                    <Text type="secondary" style={{ marginLeft: 8 }}>
                      (v{selectedNotification.documentVersion})
                    </Text>
                  )}
                </div>
              </div>
            )}

            <div style={{ marginBottom: 12 }}>
              <Text type="secondary" style={{ fontSize: "12px" }}>
                Recipient:
              </Text>
              <div>
                <Text>{selectedNotification.recipientAddress}</Text>
              </div>
            </div>

            <Row gutter={16}>
              <Col span={12}>
                <div>
                  <Text type="secondary" style={{ fontSize: "12px" }}>
                    Status:
                  </Text>
                  <div>
                    {selectedNotification.isSent ? (
                      <Tag color="green" icon={<CheckCircleOutlined />}>
                        Sent Successfully
                      </Tag>
                    ) : (
                      <Tag color="red" icon={<CloseCircleOutlined />}>
                        Failed to Send
                      </Tag>
                    )}
                  </div>
                </div>
              </Col>
              <Col span={12}>
                <div>
                  <Text type="secondary" style={{ fontSize: "12px" }}>
                    Read Status:
                  </Text>
                  <div>
                    {selectedNotification.isRead ? (
                      <Tag color="green">Read</Tag>
                    ) : (
                      <Tag color="orange">Unread</Tag>
                    )}
                  </div>
                </div>
              </Col>
            </Row>

            {selectedNotification.errorMessage && (
              <div style={{ marginTop: 16 }}>
                <Text type="secondary" style={{ fontSize: "12px" }}>
                  Error Message:
                </Text>
                <div
                  style={{
                    marginTop: 4,
                    padding: "8px",
                    backgroundColor: "#fff2f0",
                    borderRadius: "4px",
                    border: "1px solid #ffccc7",
                  }}
                >
                  <Text type="danger">{selectedNotification.errorMessage}</Text>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Add CSS for HTML content styling */}
      <style>{`
        .ant-modal-body div[dangerouslySetInnerHTML] p {
          margin-bottom: 12px;
        }
        
        .ant-modal-body div[dangerouslySetInnerHTML] ul {
          margin: 12px 0;
          padding-left: 20px;
        }
        
        .ant-modal-body div[dangerouslySetInnerHTML] li {
          margin-bottom: 8px;
        }
        
        .ant-modal-body div[dangerouslySetInnerHTML] a {
          color: #1890ff;
          text-decoration: none;
        }
        
        .ant-modal-body div[dangerouslySetInnerHTML] a:hover {
          text-decoration: underline;
        }
        
        .ant-modal-body div[dangerouslySetInnerHTML] hr {
          margin: 16px 0;
          border: none;
          border-top: 1px solid #e9e9e9;
        }
        
        .ant-modal-body div[dangerouslySetInnerHTML] small {
          color: #999;
          font-size: 12px;
        }
        
        .ant-modal-body div[dangerouslySetInnerHTML] b {
          font-weight: 600;
        }
      `}</style>
    </Layout>
  );
}
