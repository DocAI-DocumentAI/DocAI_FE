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
} from "antd";
import {
  BellOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  SendOutlined,
  ReloadOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import {
  getUserNotifications,
  getUnreadNotificationCount,
  Notification,
  UserNotificationFilters,
} from "../../lib/api/notification";
import toast from "react-hot-toast";
import moment from "moment";
import { Navbar } from "../../components/layout/Navbar";

const { Title, Text } = Typography;
const { Content } = Layout;

// Notification type mappings với màu sắc phù hợp
const notificationTypes = {
  1: {
    label: "Document Approved",
    color: "green",
    icon: <CheckCircleOutlined />,
    bgColor: "#f6ffed",
  },
  2: {
    label: "Document Rejected",
    color: "red",
    icon: <CloseCircleOutlined />,
    bgColor: "#fff2f0",
  },
  3: {
    label: "Document Submitted",
    color: "blue",
    icon: <SendOutlined />,
    bgColor: "#f0f5ff",
  },
  4: {
    label: "Review Reminder",
    color: "orange",
    icon: <ExclamationCircleOutlined />,
    bgColor: "#fff7e6",
  },
  5: {
    label: "Expiration Warning",
    color: "purple",
    icon: <ClockCircleOutlined />,
    bgColor: "#f9f0ff",
  },
};

export default function UserNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [filters] = useState<UserNotificationFilters>({});
  const [selectedNotification, setSelectedNotification] =
    useState<Notification | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Local state for unread count
  const [unreadCount, setUnreadCount] = useState<number>(0);

  // Refresh unread count from API
  const refreshUnreadCount = useCallback(async () => {
    try {
      const count = await getUnreadNotificationCount();
      setUnreadCount(count);
    } catch (error) {
      console.error("Failed to refresh unread count:", error);
    }
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getUserNotifications(page, 20, filters);
      setNotifications(response.items || []);
      setTotal(response.total || 0);

      // Also refresh unread count
      await refreshUnreadCount();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      toast.error(`Failed to load notifications: ${errorMessage}`);
      setNotifications([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [page, filters, refreshUnreadCount]);

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

  const handleNotificationClick = async (notification: Notification) => {
    setSelectedNotification(notification);
    setIsModalVisible(true);

    // Mark as read if not already read
    // if (!notification.isRead) {
    //   try {
    //     await markNotificationAsRead(notification.id);
    //     // Update local state to mark as read
    //     setNotifications((prev) =>
    //       prev.map((n) =>
    //         n.id === notification.id ? { ...n, isRead: true } : n
    //       )
    //     );
    //     // Update global context
    //     markAsRead(notification.id);
    //   } catch (error: any) {
    //     console.error("Failed to mark notification as read:", error);
    //     // Don't show error toast as this is not critical for user experience
    //   }
    // }

    // Call dismiss API when user views notification
    // try {
    //   await dismissNotification(notification.id);
    //   // Update local state to mark as dismissed
    //   setNotifications((prev) =>
    //     prev.map((n) =>
    //       n.id === notification.id ? { ...n, isDismissed: true } : n
    //     )
    //   );
    // } catch (error: any) {
    //   console.error("Failed to dismiss notification:", error);
    //   // Don't show error toast as this is not critical for user experience
    // }
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    setSelectedNotification(null);
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
                        cursor: "pointer",
                        transition: "all 0.2s",
                        opacity: notification.isDismissed ? 0.7 : 1, // Visual indicator for dismissed
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.boxShadow =
                          "0 2px 8px rgba(0,0,0,0.1)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.boxShadow = "none";
                      }}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <List.Item.Meta
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
                              {notification.isDismissed && (
                                <Tag color="gray" style={{ marginLeft: 8 }}>
                                  Dismissed
                                </Tag>
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
                {!selectedNotification.isRead && <Tag color="blue">Unread</Tag>}
                {selectedNotification.isDismissed && (
                  <Tag color="gray">Dismissed</Tag>
                )}
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
                      <Tag color="blue">Read</Tag>
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
