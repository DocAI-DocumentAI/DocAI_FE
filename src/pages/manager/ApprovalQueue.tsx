"use client"

import { useEffect, useState } from "react"
import { Layout, Typography, Card, Button, Table, Tag, Badge, Row, Col, Tabs, Input, Select,  Space } from "antd"
import {
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  FolderOutlined,
  UserOutlined,
  CalendarOutlined,
  SearchOutlined,
  FilterOutlined,
  ReloadOutlined,
} from "@ant-design/icons" 
import { useNavigate } from "react-router-dom"
import { getApprovalQueue, getDocumentTypes, DocumentType } from "../../lib/api/document"
import toast from 'react-hot-toast'
import moment from 'moment'

const { Title, Text } = Typography
const { Content } = Layout 

interface ApprovalQueueFilters {
  title?: string;
  documentTypeId?: string;
  isPublic?: boolean;
  fromDate?: string;
  toDate?: string;
}

interface ApprovalQueueItem {
  id: string; // version id (same as versionId)
  versionId?: string;
  documentFileId?: string;
  versionName?: string;
  title: string;
  status: string; // Pending
  containingFolder?: { fullPath?: string; id: string; name: string };
  submittedAt: string;
  submittedBy?: string;
  submittedByName?: string;
  daysSinceSubmission: number;
  approvalDeadline?: string;
  isUrgent?: boolean;
  tags?: string[];
  fileSize?: number;
}



interface ApprovalQueueResponse {
  pendingDocuments: ApprovalQueueItem[];
  totalPending: number;
  currentPage: number;
  pageSize: number;
  totalPages: number;
}

export default function ApprovalQueue() {
  const [documents, setDocuments] = useState<ApprovalQueueItem[]>([]);

  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingDocumentTypes, setLoadingDocumentTypes] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [filters, setFilters] = useState<ApprovalQueueFilters>({});
  const navigate = useNavigate();

  // Fetch document types
  useEffect(() => {
    const fetchDocumentTypes = async () => {
      try {
        setLoadingDocumentTypes(true);
        const types = await getDocumentTypes();
        setDocumentTypes(types);
      } catch (error) {
        console.error("Failed to fetch document types:", error);
      } finally {
        setLoadingDocumentTypes(false);
      }
    };

    fetchDocumentTypes();
  }, []);

  // Fetch approval queue data
  useEffect(() => {
    fetchData();
  }, [page, pageSize, filters]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const userStr = localStorage.getItem("user");
      if (!userStr) {
        toast.error("Không tìm thấy thông tin user, vui lòng đăng nhập lại!");
        return;
      }

      const res = await getApprovalQueue(page, pageSize, filters);
      const data = res as ApprovalQueueResponse;
      setDocuments(data.pendingDocuments || []);
      setTotal(data.totalPending || 0);

    } catch (error: any) {
      toast.error(`Lỗi khi tải dữ liệu: ${error?.response?.data?.message || error.message}`);
      setDocuments([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: keyof ApprovalQueueFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
    setPage(1); // Reset to first page when filtering
  };

 

  const clearFilters = () => {
    setFilters({});
    setPage(1);
  };

  const formatDate = (dateString: string) => {
    return moment(dateString).format('DD/MM/YYYY HH:mm');
  };



  const columns = [
    {
      title: "Document",
      dataIndex: "title",
      key: "title",
      render: (text: string, record: ApprovalQueueItem) => (
        <div>
          <div style={{ display: "flex", alignItems: "center", marginBottom: 4 }}>
            <Text strong>{text}</Text>
          </div>
          <div style={{ marginBottom: 4 }}>
            {record.tags?.slice(0, 2).map((t) => (
              <Tag key={t}>{t}</Tag>
            ))}
          </div>
        </div>
      ),
    },
    {
      title: "Folder",
      dataIndex: "containingFolder",
      key: "containingFolder",
      render: (folder: any) => <Tag color="blue">{folder?.fullPath || folder?.name || '-'}</Tag>,
    },
    {
      title: "Submitted By",
      dataIndex: "submittedByName",
      key: "submittedByName",
      render: (submittedByName: string | undefined, record: ApprovalQueueItem) => (
        <div>
          <div style={{ display: "flex", alignItems: "center" }}>
            <UserOutlined style={{ marginRight: 4, color: "#666" }} />
            <Text>{submittedByName || record.submittedBy || '-'}</Text>
          </div>
          <Text type="secondary" style={{ fontSize: "12px" }}>
            {record.daysSinceSubmission} days ago
          </Text>
        </div>
      ),
    },
    {
      title: "Submitted Date",
      dataIndex: "submittedAt",
      key: "submittedAt",
      render: (date: string) => (
        <div>
          <div style={{ display: "flex", alignItems: "center" }}>
            <CalendarOutlined style={{ marginRight: 4, color: "#666" }} />
            <Text>{formatDate(date)}</Text>
          </div>
        </div>
      ),
    },

    {
      title: "Version",
      dataIndex: "versionName",
      key: "versionName",
      render: (version: string | undefined) => (
        <div>
          <Text>{version || '-'}</Text>
        </div>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <div>
          <Tag color={status === 'Pending' ? 'orange' : 'default'}>{status}</Tag>
        </div>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (record: ApprovalQueueItem) => (
        <Space>
          {record.status === 'Pending' && (
            <Button
              type="primary"
              size="small"
              onClick={() => navigate(`/manager/document-review/${record.documentFileId ?? record.id}/${record.versionId ?? record.id}`)}
            >
              Review
            </Button>
          )}
        </Space>
      ),
    },
  ]

  return (
    <Layout style={{ minHeight: "100vh", backgroundColor: "#f5f5f5" }}>
      <Content style={{ padding: "24px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          {/* Header */}
          <div style={{ marginBottom: 24 }}>
            <Title level={2} style={{ margin: 0 }}>
              Approval Queue
            </Title>
            <Text type="secondary">
              Manage document approvals and review submissions
            </Text>
          </div>

          {/* Summary Cards */}
          <Row gutter={16} style={{ marginBottom: 24 }}>
            <Col xs={24} sm={6}>
              <Card>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <Text type="secondary">Pending Approval</Text>
                    <div style={{ fontSize: "24px", fontWeight: "bold", margin: "8px 0" }}>
                      {total}
                    </div>
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
                    <div style={{ fontSize: "24px", fontWeight: "bold", margin: "8px 0" }}>
                      --
                    </div>
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
                    <div style={{ fontSize: "24px", fontWeight: "bold", margin: "8px 0" }}>
                      --
                    </div>
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
                    <Text type="secondary">Approaching Expiration</Text>
                    <div style={{ fontSize: "24px", fontWeight: "bold", margin: "8px 0" }}>
                      --
                    </div>
                    <Text type="secondary" style={{ fontSize: "12px" }}>
                      Urgent reviews needed
                    </Text>
                  </div>
                  <FolderOutlined style={{ color: "#ff7a45" }} />
                </div>
              </Card>
            </Col>
          </Row>

          {/* Filters */}
          <Card style={{ marginBottom: 24 }}>
            <div style={{ marginBottom: 16 }}>
              <Title level={5} style={{ margin: 0, marginBottom: 16 }}>
                <FilterOutlined style={{ marginRight: 8 }} />
                Filters
              </Title>
            </div>
            
            <Row gutter={16}>
              <Col xs={24} sm={8}>
                <Input
                  placeholder="Search by title..."
                  prefix={<SearchOutlined />}
                  value={filters.title}
                  onChange={(e) => handleFilterChange('title', e.target.value)}
                  allowClear
                />
              </Col>
              <Col xs={24} sm={6}>
                <Select
                  placeholder="Document Type"
                  style={{ width: '100%' }}
                  value={filters.documentTypeId}
                  onChange={(value) => handleFilterChange('documentTypeId', value)}
                  loading={loadingDocumentTypes}
                  allowClear
                >
                  {documentTypes.map(type => (
                    <Select.Option key={type.id} value={type.id}>
                      {type.name}
                    </Select.Option>
                  ))}
                </Select>
              </Col>
              <Col xs={24} sm={6}>
                <Select
                  placeholder="Visibility"
                  style={{ width: '100%' }}
                  value={filters.isPublic}
                  onChange={(value) => handleFilterChange('isPublic', value)}
                  allowClear
                >
                  <Select.Option value={true}>Public</Select.Option>
                  <Select.Option value={false}>Private</Select.Option>
                </Select>
              </Col>
              <Col xs={24} sm={4}>
                <Space>
                  <Button 
                    icon={<ReloadOutlined />} 
                    onClick={fetchData}
                    loading={loading}
                  >
                    Refresh
                  </Button>
                  <Button onClick={clearFilters}>
                    Clear
                  </Button>
                </Space>
              </Col>
            </Row>
            
          
          </Card>

          {/* Tabs */}
          <Tabs
            defaultActiveKey="1"
            items={[
              {
                key: "1",
                label: (
                  <span>
                    Approval Queue <Badge count={total} size="small" />
                  </span>
                ),
                children: (
                  <Card>
                    <div style={{ marginBottom: 16 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <Title level={4} style={{ margin: 0 }}>
                          Approval Queue <Badge count={total} />
                        </Title>
                      </div>
                      <Text type="secondary">Documents awaiting your approval (sorted by priority and submission date)</Text>
                    </div>
                    <Table 
                      columns={columns} 
                      dataSource={documents} 
                      loading={loading} 
                      rowKey={(r) => r.versionId || r.id}
                      pagination={{
                        total,
                        pageSize,
                        current: page,
                        showSizeChanger: true,
                        onChange: (p, ps) => { setPage(p); if(ps) setPageSize(ps); },
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
                label: "Statistics",
                children: (
                  <Card>
                    <Title level={4}>Approval Statistics</Title>
                    <Row gutter={16}>
                      <Col span={12}>
                        <Card size="small">
                          <Text type="secondary">Recent Submissions (24h)</Text>
                          <div style={{ fontSize: "20px", fontWeight: "bold" }}>
                            --
                          </div>
                        </Card>
                      </Col>
                      <Col span={12}>
                        <Card size="small">
                          <Text type="secondary">Being Reviewed</Text>
                          <div style={{ fontSize: "20px", fontWeight: "bold" }}>
                            --
                          </div>
                        </Card>
                      </Col>
                    </Row>
                  </Card>
                ),
              },
            ]}
          />
        </div>
      </Content>
    </Layout>
  )
}
