"use client"

import { useEffect, useState } from "react"
import { Layout, Typography, Card, Button, Table, Tag, Badge, Row, Col, Tabs } from "antd"
import {
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  FolderOutlined,
  UserOutlined,
  CalendarOutlined,
} from "@ant-design/icons" 
import {  useNavigate } from "react-router-dom"
import { getApprovalQueue } from "../../lib/api/document"
import toast from 'react-hot-toast'

const { Title, Text } = Typography
const { Content } = Layout

 
export default function ApprovalQueue() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const userStr = localStorage.getItem("user");
        if (!userStr) {
          toast.error("Không tìm thấy thông tin user, vui lòng đăng nhập lại!");
          return;
        }
  
        const res = await getApprovalQueue( page, pageSize);
        setDocuments(res.items || []);
        setTotal(res.total || 0);
      } catch (error: any) {
        toast.error(`Lỗi khi tải dữ liệu: ${error?.response?.data?.message || error.message}`);
        setDocuments([]);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [page, pageSize]);

  const columns = [
    {
      title: "Document",
      dataIndex: "title",
      key: "title",
      render: (text: string, record: any) => (
        <div>
          <div style={{ display: "flex", alignItems: "center", marginBottom: 4 }}>
            <Text strong>{text}</Text>
          </div>
          <Text type="secondary" style={{ fontSize: "12px" }}>
            {record.content}
          </Text>
        </div>
      ),
    },
    {
      title: "Department",
      dataIndex: "departmentName",
      key: "departmentName",
      render: (dept: string) => <Tag color="blue">{dept}</Tag>,
    },
    {
      title: "Editor",
      dataIndex: "editor",
      key: "editor",
      render: (editor: string) => (
        <div style={{ display: "flex", alignItems: "center" }}>
          <UserOutlined style={{ marginRight: 4, color: "#666" }} />
          <Text>{editor}</Text>
        </div>
      ),
    },
    {
      title: "Submitted",
      dataIndex: "submitted",
      key: "submitted",
      render: (date: string) => (
        <div>
          <div style={{ display: "flex", alignItems: "center" }}>
            <CalendarOutlined style={{ marginRight: 4, color: "#666" }} />
            <Text>{date}</Text>
          </div>
        </div>
      ),
    },
    {
      title: "Version",
      dataIndex: "versionName",
      key: "versionName",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => <Tag color="orange">{status}</Tag>,
    },
    {
      title: "Actions",
      key: "actions",
      render: (record: any) => (
        <Button type="primary" size="small" onClick={() => navigate(`/manager/document-review/${record.documentFileId}/${record.versionId}`)}>
          Review
        </Button>
      ),
    },
  ]

  // Đếm số lượng trạng thái
  const pendingCount = documents.filter(doc => doc.status === 'Pending Approval' || doc.status === 'Pending').length;
  const approvedCount = documents.filter(doc => doc.status === 'Approved').length;
  const rejectedCount = documents.filter(doc => doc.status === 'Rejected').length;

  return (
    <Layout style={{ minHeight: "100vh", backgroundColor: "#f5f5f5" }}>
      <Content style={{ padding: "24px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          {/* Summary Cards */}
          <Row gutter={16} style={{ marginBottom: 24 }}>
            <Col xs={24} sm={6}>
              <Card>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <Text type="secondary">Pending Approval</Text>
                    <div style={{ fontSize: "24px", fontWeight: "bold", margin: "8px 0" }}>{pendingCount}</div>
                    <Text type="secondary" style={{ fontSize: "12px" }}>
                      Awaiting your review
                    </Text>
                  </div>
                  <ClockCircleOutlined style={{ color: "#faad14" }} />
                </div>
              </Card>
            </Col>
            <Col xs={24} sm={6}>
              <Card>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <Text type="secondary">Approved</Text>
                    <div style={{ fontSize: "24px", fontWeight: "bold", margin: "8px 0" }}>{approvedCount}</div>
                    <Text type="secondary" style={{ fontSize: "12px" }}>
                      Documents approved
                    </Text>
                  </div>
                  <CheckCircleOutlined style={{ color: "#52c41a" }} />
                </div>
              </Card>
            </Col>
            <Col xs={24} sm={6}>
              <Card>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <Text type="secondary">Rejected</Text>
                    <div style={{ fontSize: "24px", fontWeight: "bold", margin: "8px 0" }}>{rejectedCount}</div>
                    <Text type="secondary" style={{ fontSize: "12px" }}>
                      Sent back for revision
                    </Text>
                  </div>
                  <CloseCircleOutlined style={{ color: "#ff4d4f" }} />
                </div>
              </Card>
            </Col>
            <Col xs={24} sm={6}>
              <Card>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <Text type="secondary">Total Documents</Text>
                    <div style={{ fontSize: "24px", fontWeight: "bold", margin: "8px 0" }}>{total}</div>
                    <Text type="secondary" style={{ fontSize: "12px" }}>
                      In the system
                    </Text>
                  </div>
                  <FolderOutlined style={{ color: "#666" }} />
                </div>
              </Card>
            </Col>
          </Row>

          {/* Tabs */}
          <Tabs
            defaultActiveKey="1"
            items={[
              {
                key: "1",
                label: (
                  <span>
                    Approval Queue <Badge count={pendingCount} size="small" />
                  </span>
                ),
                children: (
                  <Card>
                    <div style={{ marginBottom: 16 }}>
                      <Title level={4} style={{ margin: 0, marginBottom: 8 }}>
                        Approval Queue <Badge count={pendingCount} />
                      </Title>
                      <Text type="secondary">Documents awaiting your approval (sorted by oldest first)</Text>
                    </div>
                    <Table 
                      columns={columns} 
                      dataSource={documents} 
                      loading={loading} 
                      pagination={{
                        total,
                        pageSize,
                        current: page,
                        showSizeChanger: true,
                        onChange: (p, ps) => { setPage(p); setPageSize(ps); },
                        showTotal: (t, range) => `${range[0]}-${range[1]} of ${t} documents`,
                      }}
                    />
                  </Card>
                ),
              },
              {
                key: "2",
                label: "Approval Logs",
                children: <div>Approval logs content</div>,
              },
              {
                key: "3",
                label: "Notifications",
                children: <div>Notifications content</div>,
              },
            ]}
          />

          {/* Upload Button */}
          {/* <div style={{ position: "fixed", bottom: 24, right: 24 }}>
            <Button type="primary" size="large" onClick={() => onViewChange("upload")}>
              Upload New Document
            </Button>
          </div> */}
        </div>
      </Content>
    </Layout>
  )
}
