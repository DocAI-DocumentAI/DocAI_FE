import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Input,
  Select,
  DatePicker,
  Button,
  Space,
  Tag,
  Typography,
  Row,
  Col,
  Statistic,
  Tooltip,
  Avatar,
  Badge,
  Empty,
} from 'antd';
import {
  SearchOutlined,
  FilterOutlined,
  EyeOutlined,
  EditOutlined,
  FileTextOutlined,
  CalendarOutlined,
  TeamOutlined,
  ClockCircleOutlined,
  ClearOutlined,
  DownloadOutlined,
  FolderOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import toast from 'react-hot-toast';
import { 
  getMyDocumentsWithStats, 
  getDocumentTypes, 
  MyDocumentsFilters, 
  MyDocumentItem,
  DocumentType 
} from '../../lib/api/document';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const MyDocumentsPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [documents, setDocuments] = useState<MyDocumentItem[]>([]);
  const [statistics, setStatistics] = useState({
    totalDrafts: 0,
    totalPending: 0,
    totalApproved: 0,
    totalRejected: 0,
    totalArchived: 0,
    totalDocuments: 0
  });
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([]);
  const [filters, setFilters] = useState<MyDocumentsFilters>({
    pageNumber: 1,
    pageSize: 10
  });
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0
  });

  const navigate = useNavigate();

  useEffect(() => {
    loadDocumentTypes();
    loadDocuments();
  }, []);

  const loadDocumentTypes = async () => {
    try {
      const types = await getDocumentTypes();
      setDocumentTypes(types);
    } catch (error) {
      console.error('Error loading document types:', error);
    }
  };

  const loadDocuments = async (newFilters?: MyDocumentsFilters) => {
    setLoading(true);
    try {
      const currentFilters = newFilters || filters;
      const response = await getMyDocumentsWithStats(currentFilters);
      
      if (response.statusCode === 200) {
        setDocuments(response.data.documents.items);
        setStatistics(response.data.statistics);
        setPagination({
          current: response.data.documents.page,
          pageSize: response.data.documents.size,
          total: response.data.documents.total,
          totalPages: response.data.documents.totalPages
        });
      }
    } catch (error: any) {
      console.error('Error loading documents:', error);
      toast.error('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: keyof MyDocumentsFilters, value: any) => {
    const newFilters = { ...filters, [key]: value, pageNumber: 1 };
    setFilters(newFilters);
    loadDocuments(newFilters);
  };

  const handleDateRangeChange = (dates: any) => {
    const newFilters = {
      ...filters,
      from: dates?.[0]?.toISOString(),
      to: dates?.[1]?.toISOString(),
      pageNumber: 1
    };
    setFilters(newFilters);
    loadDocuments(newFilters);
  };

  const handleClearFilters = () => {
    const newFilters: MyDocumentsFilters = { pageNumber: 1, pageSize: 10 };
    setFilters(newFilters);
    loadDocuments(newFilters);
  };

  const handleTableChange = (paginationConfig: any) => {
    const newFilters = {
      ...filters,
      pageNumber: paginationConfig.current,
      pageSize: paginationConfig.pageSize
    };
    setFilters(newFilters);
    loadDocuments(newFilters);
  };

  const getStatusColor = (status: string) => {
    const statusColors: Record<string, string> = {
      'Draft': 'blue',
      'Pending': 'orange',
      'Approved': 'green',
      'Rejected': 'red',
      'Archived': 'gray',
      'Submitted': 'purple'
    };
    return statusColors[status] || 'default';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const hasActiveFilters = () => {
    return !!(filters.title || filters.status || filters.isPublic !== undefined || 
              filters.documentTypeId || filters.from || filters.to);
  };

  const columns = [
    {
      title: 'Document',
      key: 'document',
      // width removed to avoid horizontal scrollbar
      render: (record: MyDocumentItem) => (
        <div className="flex items-start space-x-3">
          <Avatar 
            icon={<FileTextOutlined />} 
            className="bg-blue-100 text-blue-600 flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <div className="font-medium text-gray-900 line-clamp-1 break-words">
              {record.title}
            </div>
            <div className="text-sm text-gray-500 line-clamp-2 break-words">
              {record.description || 'No description'}
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <Tag color="blue" className="max-w-[200px] truncate text-xs px-2 py-0.5">{record.versionName}</Tag>
              <Text type="secondary" className="text-xs">
                {formatFileSize(record.fileSize)}
              </Text>
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'Type & Department',
      key: 'type',
      // width removed to avoid horizontal scrollbar
      render: (record: MyDocumentItem) => (
        <div>
          <div className="flex items-center space-x-1 mb-1">
            <FolderOutlined className="text-gray-400" />
            <Text className="text-sm">{record.documentTypeName}</Text>
          </div>
          <div className="flex items-center space-x-1">
            <TeamOutlined className="text-gray-400" />
            <Text type="secondary" className="text-xs">{record.departmentName}</Text>
          </div>
        </div>
      )
    },
    {
      title: 'Status & Access',
      key: 'status',
      // width removed to avoid horizontal scrollbar
      render: (record: MyDocumentItem) => (
        <div className="space-y-1">
          <Tag color={getStatusColor(record.status)}>{record.status}</Tag>
          <div>
            <Tag color={record.isPublic ? 'green' : 'orange'} className="text-xs px-2 py-0.5">
              {record.isPublic ? 'Public' : 'Private'}
            </Tag>
          </div>
        </div>
      )
    },
    {
      title: 'Created',
      key: 'created',
      // width removed to avoid horizontal scrollbar
      render: (record: MyDocumentItem) => (
        <div className="text-sm">
          <div className="flex items-center space-x-1">
            <CalendarOutlined className="text-gray-400" />
            <Text>{dayjs(record.createdTime).format('MMM DD, YYYY')}</Text>
          </div>
          <Text type="secondary" className="text-xs">
            {dayjs(record.createdTime).format('HH:mm')}
          </Text>
        </div>
      )
    },
    {
      title: 'Tags',
      key: 'tags',
      // width removed to avoid horizontal scrollbar
      render: (record: MyDocumentItem) => (
        <div className="space-y-1">
          {record.tags?.slice(0, 2).map((tag, index) => (
            <Tag key={index} color="blue" className="text-xs px-2 py-0.5">{tag}</Tag>
          ))}
          {record.tags?.length > 2 && (
            <Text type="secondary" className="text-xs">
              +{record.tags.length - 2} more
            </Text>
          )}
        </div>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (record: MyDocumentItem) => (
        <Space>
          <Tooltip title="View Details">
            <Button
              type="text"
              icon={<EyeOutlined />}
              size="small"
              onClick={() => navigate(`/editor/doc/${record.documentId}/${record.versionId}`)}
            />
          </Tooltip>
          <Tooltip title="Edit">
            <Button
              type="text"
              icon={<EditOutlined />}
              size="small"
              onClick={() => navigate(`/editor/doc/${record.documentId}/${record.versionId}`)}
            />
          </Tooltip>
          <Tooltip title="Download">
            <Button
              type="text"
              icon={<DownloadOutlined />}
              size="small"
            />
          </Tooltip>
        </Space>
      )
    }
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="w-full">
        {/* Header */}
        <div className="mb-6">
          <Title level={2} className="mb-2">My Documents</Title>
          <Text type="secondary">Manage and track all your documents</Text>
        </div>

        {/* Statistics Cards */}
        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={24} sm={12} md={8} lg={4}>
            <Card>
              <Statistic
                title="Total Documents"
                value={statistics.totalDocuments}
                prefix={<FileTextOutlined className="text-blue-500" />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={4}>
            <Card>
              <Statistic
                title="Drafts"
                value={statistics.totalDrafts}
                prefix={<EditOutlined className="text-orange-500" />}
                valueStyle={{ color: '#fa8c16' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={4}>
            <Card>
              <Statistic
                title="Pending"
                value={statistics.totalPending}
                prefix={<ClockCircleOutlined className="text-yellow-500" />}
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={4}>
            <Card>
              <Statistic
                title="Approved"
                value={statistics.totalApproved}
                prefix={<Badge status="success" />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={4}>
            <Card>
              <Statistic
                title="Rejected"
                value={statistics.totalRejected}
                prefix={<Badge status="error" />}
                valueStyle={{ color: '#ff4d4f' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={4}>
            <Card>
              <Statistic
                title="Archived"
                value={statistics.totalArchived}
                prefix={<Badge status="default" />}
                valueStyle={{ color: '#8c8c8c' }}
              />
            </Card>
          </Col>
        </Row>

        {/* Filters */}
        <Card className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <FilterOutlined />
              <Text strong>Filters</Text>
              {hasActiveFilters() && (
                <Badge count="Active" style={{ backgroundColor: '#52c41a' }} />
              )}
            </div>
            {hasActiveFilters() && (
              <Button
                type="link"
                icon={<ClearOutlined />}
                onClick={handleClearFilters}
                size="small"
              >
                Clear All
              </Button>
            )}
          </div>

          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={6}>
              <Input
                placeholder="Search by title..."
                prefix={<SearchOutlined />}
                value={filters.title}
                onChange={(e) => handleFilterChange('title', e.target.value)}
                allowClear
              />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Select
                placeholder="Status"
                value={filters.status}
                onChange={(value) => handleFilterChange('status', value)}
                allowClear
                style={{ width: '100%' }}
              >
                <Select.Option value="Draft">Draft</Select.Option>
                <Select.Option value="Pending">Pending</Select.Option>
                <Select.Option value="Approved">Approved</Select.Option>
                <Select.Option value="Rejected">Rejected</Select.Option>
                <Select.Option value="Archived">Archived</Select.Option>
              </Select>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Select
                placeholder="Access Level"
                value={filters.isPublic}
                onChange={(value) => handleFilterChange('isPublic', value)}
                allowClear
                style={{ width: '100%' }}
              >
                <Select.Option value={true}>Public</Select.Option>
                <Select.Option value={false}>Private</Select.Option>
              </Select>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Select
                placeholder="Document Type"
                value={filters.documentTypeId}
                onChange={(value) => handleFilterChange('documentTypeId', value)}
                allowClear
                style={{ width: '100%' }}
              >
                {documentTypes.map(type => (
                  <Select.Option key={type.id} value={type.id}>
                    {type.name}
                  </Select.Option>
                ))}
              </Select>
            </Col>
            <Col xs={24} sm={24} md={12}>
              <RangePicker
                placeholder={['From Date', 'To Date']}
                onChange={handleDateRangeChange}
                style={{ width: '100%' }}
                value={filters.from && filters.to ? [dayjs(filters.from), dayjs(filters.to)] : null}
              />
            </Col>
          </Row>
        </Card>

        {/* Documents Table */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <FileTextOutlined />
              <Text strong>Documents ({pagination.total})</Text>
            </div>
          </div>

          <Table
            columns={columns}
            dataSource={documents}
            rowKey="documentId"
            loading={loading}
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: pagination.total,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} documents`,
              pageSizeOptions: ['10', '20', '50', '100'],
            }}
            onChange={handleTableChange}
            locale={{
              emptyText: (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="No documents found"
                />
              )
            }}
          />
        </Card>
      </div>
    </div>
  );
};

export default MyDocumentsPage;
