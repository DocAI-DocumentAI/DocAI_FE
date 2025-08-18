import { Table, Tag, Button, Input, Select, Card, Row, Col, DatePicker, Typography, Empty } from "antd";
import { useEffect, useState } from "react";
import { getMyApprovalHistory, getDocumentTypes, type DocumentType, type ApprovalHistoryRequest, type ApprovalHistoryItem } from "../../lib/api/document";
import { useNavigate } from "react-router-dom";
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;
const { Title, Text } = Typography;

const statusOptions = [
  { value: "", label: "All" },
  { value: "Approved", label: "Approved" },
  { value: "Rejected", label: "Rejected" },
  { value: "Archived", label: "Archived" },
];

const ApprovalManagerTable = () => {
  const [documents, setDocuments] = useState<ApprovalHistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([]);
  const [filters, setFilters] = useState<ApprovalHistoryRequest>({ pageNumber: 1, pageSize: 10 });
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0, totalPages: 0 });
  const navigate = useNavigate();

  const loadDocumentTypes = async () => {
    try {
      const types = await getDocumentTypes();
      setDocumentTypes(types);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchData = async (req?: ApprovalHistoryRequest) => {
    setLoading(true);
    try {
      const current = req || filters;
      const response = await getMyApprovalHistory(current);
      if (response.statusCode === 200) {
        setDocuments(response.data.items);
        setPagination({
          current: response.data.page,
          pageSize: response.data.size,
          total: response.data.total,
          totalPages: response.data.totalPages,
        });
      }
    } catch (e) {
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocumentTypes();
    fetchData();
  }, []);

  const handleTableChange = (paginationConfig: any) => {
    const next = { ...filters, pageNumber: paginationConfig.current, pageSize: paginationConfig.pageSize };
    setFilters(next);
    fetchData(next);
  };

  const handleSearch = (value: string) => {
    const next = { ...filters, keyword: value, pageNumber: 1 };
    setFilters(next);
    fetchData(next);
  };

  const columns = [
    {
      title: 'Document',
      key: 'document',
      render: (record: ApprovalHistoryItem) => (
        <div className="flex items-start space-x-3">
          <div className="flex-1 min-w-0">
            <div className="font-medium text-gray-900 line-clamp-1 break-words">{record.title}</div>
             <div className="text-sm text-gray-500 line-clamp-2 break-words">
              {record.description || 'No description'}
            </div>
            {/* <div className="text-sm text-gray-500 line-clamp-2 break-words">{record.summary || record.description || 'No description'}</div> */}
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <Tag color="blue" className="max-w-[200px] truncate">{record.versionName}</Tag>
              <Tag>{record.documentTypeName}</Tag>
            </div>
          </div>
        </div>
      )
    },
    // {
    //   title: 'Owner & Department',
    //   key: 'owner',
    //   render: (record: ApprovalHistoryItem) => (
    //     <div>
    //       <div className="text-sm">{record.ownerName}</div>
    //       <div className="text-xs text-gray-500">{record.departmentName}</div>
    //     </div>
    //   )
    // },
    {
      title: 'Dates',
      key: 'dates',
      render: (record: ApprovalHistoryItem) => (
        <div className="text-sm">
          <div>Submitted: {record.lastSubmitted ? dayjs(record.lastSubmitted).format('MMM DD, YYYY') : '-'}</div>
          {record.reviewedAt && <div className="text-xs text-gray-500">Reviewed: {dayjs(record.reviewedAt).format('MMM DD, YYYY')}</div>}
        </div>
      )
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'Approved' ? 'green' : status === 'Rejected' ? 'red' : 'default'}>{status}</Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'action',
      render: (_: any, record: ApprovalHistoryItem) => (
        <Button onClick={() => navigate(`/editor/doc/${record.documentId}/${record.versionId}`)} type="link">
          View
        </Button>
      ),
    },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="w-full">
        <div className="mb-6">
          <Title level={2} className="mb-2">Approval History</Title>
          <Text type="secondary">Documents you submitted and their review outcomes</Text>
        </div>

        <Card className="mb-6">
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} sm={12} md={6}>
              <Input.Search
                placeholder="Search title or keyword"
                onSearch={handleSearch}
                allowClear
              />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Select
                placeholder="Status"
                value={filters.status}
                onChange={(v) => { const n = { ...filters, status: v || undefined, pageNumber: 1 }; setFilters(n); fetchData(n); }}
                style={{ width: '100%' }}
                allowClear
                options={statusOptions}
              />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Select
                placeholder="Document Type"
                value={filters.documentTypeId}
                onChange={(v) => { const n = { ...filters, documentTypeId: v, pageNumber: 1 }; setFilters(n); fetchData(n); }}
                style={{ width: '100%' }}
                allowClear
                options={[{ value: '', label: 'All types' }, ...documentTypes.map(t => ({ value: t.id, label: t.name }))]}
              />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <RangePicker
                placeholder={['From', 'To']}
                style={{ width: '100%' }}
                value={filters.fromDate && filters.toDate ? [dayjs(filters.fromDate), dayjs(filters.toDate)] : null}
                onChange={(dates) => {
                  const n: ApprovalHistoryRequest = { ...filters, fromDate: dates?.[0]?.toISOString(), toDate: dates?.[1]?.toISOString(), pageNumber: 1 };
                  setFilters(n);
                  fetchData(n);
                }}
              />
            </Col>
          </Row>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Text strong>Documents ({pagination.total})</Text>
            </div>
          </div>

          <Table
            columns={columns}
            dataSource={documents}
            rowKey={(r) => `${r.documentId}-${r.versionId}`}
            loading={loading}
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: pagination.total,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} documents`,
              pageSizeOptions: ['10', '20', '50', '100'],
            }}
            onChange={handleTableChange}
            locale={{
              emptyText: (
                <Empty description="No approval history found" />
              )
            }}
          />
        </Card>
      </div>
    </div>
  );
};

export default ApprovalManagerTable;