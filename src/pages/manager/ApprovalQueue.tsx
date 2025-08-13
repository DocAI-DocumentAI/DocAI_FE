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
  documentFileId: string;
  versionId: string;
  versionName: string;
  title: string;
  submittedBy: string;
  submittedByName: string;
  lastSubmitted: string;
  status: string;
  departmentId: string;
  departmentName: string;
  documentTypeId: string;
  documentTypeName: string;
  isPublic: boolean;
  signedBy: string | null;
  effectiveFrom: string;
  effectiveUntil: string;
  isBeingReviewed: boolean;
  reviewedBy: string | null;
  claimedAt: string | null;
  reviewedByName: string | null;
  description: string;
  summary: string;
  fileSize: number;
  fileType: string;
  tags: string[];
  createdTime: string;
  lastUpdatedTime: string;
  ownerId: string;
  ownerName: string | null;
  priority: string;
  daysSinceSubmission: number;
  isApproachingExpiration: boolean;
  resubmissionCount: number;
  previousRejectionReason: string | null;
}

interface ApprovalQueueStatistics {
  totalPending: number;
  totalApproved: number;
  totalRejected: number;
  totalArchived: number;
  totalBeingReviewed: number;
  recentSubmissions: number;
  approachingExpiration: number;
  averageProcessingTimeHours: number;
}

interface ApprovalQueueResponse {
  documents: {
    size: number;
    page: number;
    total: number;
    totalPages: number;
    items: ApprovalQueueItem[];
  };
  statistics: ApprovalQueueStatistics;
}

export default function ApprovalQueue() {
  const [documents, setDocuments] = useState<ApprovalQueueItem[]>([]);
  const [statistics, setStatistics] = useState<ApprovalQueueStatistics>({
    totalPending: 0,
    totalApproved: 0,
    totalRejected: 0,
    totalArchived: 0,
    totalBeingReviewed: 0,
    recentSubmissions: 0,
    approachingExpiration: 0,
    averageProcessingTimeHours: 0,
  });
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
      
      setDocuments(data.documents?.items || []);
      setTotal(data.documents?.total || 0);
      setStatistics(data.statistics || statistics);
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

  const handleDateRangeChange = (dates: any, dateStrings: [string, string]) => {
    setFilters(prev => ({
      ...prev,
      fromDate: dateStrings[0] || undefined,
      toDate: dateStrings[1] || undefined,
    }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({});
    setPage(1);
  };

  const formatDate = (dateString: string) => {
    return moment(dateString).format('DD/MM/YYYY HH:mm');
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high': return 'red';
      case 'medium': return 'orange';
      case 'low': return 'green';
      default: return 'default';
    }
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
            {record.isApproachingExpiration && (
              <Tag color="red"  style={{ marginLeft: 8 }}>
                Expiring Soon
              </Tag>
            )}
          </div>
          <div style={{ marginBottom: 4 }}>
            <Tag color="blue">{record.documentTypeName}</Tag>
            <Tag color={getPriorityColor(record.priority)}>{record.priority}</Tag>
            {record.isPublic && <Tag color="green">Public</Tag>}
          </div>
          <Text type="secondary" style={{ fontSize: "12px" }}>
            {record.description?.substring(0, 100)}...
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
      title: "Submitted By",
      dataIndex: "submittedByName",
      key: "submittedByName",
      render: (name: string, record: ApprovalQueueItem) => (
        <div>
          <div style={{ display: "flex", alignItems: "center" }}>
            <UserOutlined style={{ marginRight: 4, color: "#666" }} />
            <Text>{name}</Text>
          </div>
          <Text type="secondary" style={{ fontSize: "12px" }}>
            {record.daysSinceSubmission} days ago
          </Text>
        </div>
      ),
    },
    {
      title: "Submitted Date",
      dataIndex: "lastSubmitted",
      key: "lastSubmitted",
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
      render: (version: string, record: ApprovalQueueItem) => (
        <div>
          <Text>{version}</Text>
          {record.resubmissionCount > 0 && (
            <div>
              <Tag color="orange"  >
                Resubmission #{record.resubmissionCount}
              </Tag>
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string, record: ApprovalQueueItem) => (
        <div>
          <Tag color={status === 'Pending' ? 'orange' : 'default'}>{status}</Tag>
          {record.isBeingReviewed && (
            <Tag color="blue"  >Being Reviewed</Tag>
          )}
        </div>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (record: ApprovalQueueItem) => (
        <Space>
          {record.status === 'Pending' && !record.isBeingReviewed && (
            <Button 
              type="primary" 
              size="small" 
              onClick={() => navigate(`/manager/document-review/${record.documentFileId}/${record.versionId}`)}
            >
              Review
            </Button>
          )}
          {record.isBeingReviewed && (
            <Button 
              type="default" 
              size="small" 
              disabled
            >
              Being Reviewed
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
                      {statistics.totalPending}
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
                      {statistics.totalApproved}
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
                      {statistics.totalRejected}
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
                      {statistics.approachingExpiration}
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
                    Approval Queue <Badge count={statistics.totalPending} size="small" />
                  </span>
                ),
                children: (
                  <Card>
                    <div style={{ marginBottom: 16 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <Title level={4} style={{ margin: 0 }}>
                          Approval Queue <Badge count={statistics.totalPending} />
                        </Title>
                        <Text type="secondary">
                          Avg processing time: {statistics.averageProcessingTimeHours.toFixed(1)} hours
                        </Text>
                      </div>
                      <Text type="secondary">Documents awaiting your approval (sorted by priority and submission date)</Text>
                    </div>
                    <Table 
                      columns={columns} 
                      dataSource={documents} 
                      loading={loading} 
                      rowKey="versionId"
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
                            {statistics.recentSubmissions}
                          </div>
                        </Card>
                      </Col>
                      <Col span={12}>
                        <Card size="small">
                          <Text type="secondary">Being Reviewed</Text>
                          <div style={{ fontSize: "20px", fontWeight: "bold" }}>
                            {statistics.totalBeingReviewed}
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
