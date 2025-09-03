import { useEffect, useState } from "react";
import { Typography, Card, Button, Table, Tag, Row, Col, Input, Select, Space, DatePicker, Modal, Tooltip } from "antd";
import {
  SearchOutlined,
  FilterOutlined,
  ReloadOutlined,
  CommentOutlined,
} from "@ant-design/icons";
import { getApprovalLogs } from "../../lib/api/document";
import toast from 'react-hot-toast';
import moment from 'moment';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const approvalActionOptions = [
    { value: "", label: "All Actions" },
    { value: "0", label: "Submitted" },
    { value: "1", label: "Approved" },
    { value: "2", label: "Rejected" },
    { value: "3", label: "Claimed" },
    { value: "4", label: "Unclaimed" },
    { value: "5", label: "Archived" },
    { value: "6", label: "Deleted" },
];

interface ApprovalLogFilter {
  action?: string;
  fromDate?: string;
  toDate?: string;
  submittedBy?: string;
  documentTitle?: string;
}

interface ApprovalLogItem {
  id: string;
  action: number;
  comments: string | null;
  documentVersionId: string;
  documentId: string;
  documentTitle: string;
  documentDescription: string;
  versionName: string;
  fileName: string;
  documentTypeId: string;
  documentTypeName: string;
  submittedBy: string;
  submittedByName: string;
  submittedAt: string;
  reviewedBy: string;
  reviewedByName: string;
  reviewedAt: string;
  status: string;
}

interface ApprovalLogsResponse {
  size: number;
  page: number;
  total: number;
  totalPages: number;
  items: ApprovalLogItem[];
}

const ApprovalLog = () => {
    const [logs, setLogs] = useState<ApprovalLogItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [filters, setFilters] = useState<ApprovalLogFilter>({});
    const [selectedComment, setSelectedComment] = useState<{text: string, isVisible: boolean}>({text: '', isVisible: false});

    useEffect(() => {
        fetchData();
    }, [page, pageSize, filters]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await getApprovalLogs({ ...filters, pageNumber: page, pageSize });
            const data = response as ApprovalLogsResponse;
            setLogs(data.items || []);
            setTotal(data.total || 0);
        } catch (error: any) {
            toast.error(`Error loading approval logs: ${error?.response?.data?.message || error.message}`);
            setLogs([]);
            setTotal(0);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (key: keyof ApprovalLogFilter, value: any) => {
        setFilters(prev => ({
            ...prev,
            [key]: value
        }));
        setPage(1); // Reset to first page when filtering
    };

    const handleDateRangeChange = (_dates: any, dateStrings: [string, string]) => {
        setFilters(prev => ({
            ...prev,
            fromDate: dateStrings[0] ? moment(dateStrings[0]).startOf('day').toISOString() : undefined,
            toDate: dateStrings[1] ? moment(dateStrings[1]).endOf('day').toISOString() : undefined,
        }));
        setPage(1);
    };

    const clearFilters = () => {
        setFilters({});
        setPage(1);
    };

    const getActionInfo = (action: number) => {
        switch (action) {
            case 0: return { text: 'Submitted', color: 'blue' };
            case 1: return { text: 'Approved', color: 'green' };
            case 2: return { text: 'Rejected', color: 'red' };
            case 3: return { text: 'Claimed', color: 'orange' };
            case 4: return { text: 'Unclaimed', color: 'gold' };
            case 5: return { text: 'Archived', color: 'gray' };
            case 6: return { text: 'Deleted', color: 'magenta' };
            default: return { text: 'Unknown', color: 'default' };
        }
    };

    const showCommentModal = (comment: string) => {
        setSelectedComment({text: comment, isVisible: true});
    };

    const hideCommentModal = () => {
        setSelectedComment({text: '', isVisible: false});
    };

    const columns = [
        {
            title: 'Document Title',
            dataIndex: 'documentTitle',
            key: 'documentTitle',
        },
        {
            title: 'Action',
            dataIndex: 'action',
            key: 'action',
            render: (action: number) => {
                const { text, color } = getActionInfo(action);
                return <Tag color={color}>{text}</Tag>;
            },
        },
        {
            title: 'Comments',
            dataIndex: 'comments',
            key: 'comments',
            width: 120,
            render: (comments: string | null) => {
                if (!comments || comments.trim() === '') {
                    return <Text type="secondary">No comments</Text>;
                }
                return (
                    <Tooltip title="Click to view comment">
                        <Button 
                            type="link" 
                            icon={<CommentOutlined />}
                            size="small"
                            onClick={() => showCommentModal(comments)}
                        >
                            View Comment
                        </Button>
                    </Tooltip>
                );
            },
        },
        {
            title: 'Submitted By',
            dataIndex: 'submittedByName',
            key: 'submittedByName',
        },
        {
            title: 'Submitted At',
            dataIndex: 'submittedAt',
            key: 'submittedAt',
            render: (date: string) => moment(date).format('DD/MM/YYYY HH:mm'),
        },
        {
            title: 'Reviewed By',
            dataIndex: 'reviewedByName',
            key: 'reviewedByName',
        },
        {
            title: 'Reviewed At',
            dataIndex: 'reviewedAt',
            key: 'reviewedAt',
            render: (date: string) => moment(date).format('DD/MM/YYYY HH:mm'),
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => <Tag>{status}</Tag>,
        },
    ];

    return (
        <Card>
            <div style={{ marginBottom: 24 }}>
                <Title level={4} style={{ margin: 0 }}>Approval Logs</Title>
                <Text type="secondary">Track all approval-related activities</Text>
            </div>

            {/* Filters */}
            <Card style={{ marginBottom: 24 }}>
                <div style={{ marginBottom: 16 }}>
                    <Title level={5} style={{ margin: 0, marginBottom: 16 }}>
                        <FilterOutlined style={{ marginRight: 8 }} />
                        Filters
                    </Title>
                </div>
                <Row gutter={[16, 16]}>
                    <Col xs={24} sm={12} md={6}>
                        <Input
                            placeholder="Search by document title..."
                            prefix={<SearchOutlined />}
                            value={filters.documentTitle}
                            onChange={(e) => handleFilterChange('documentTitle', e.target.value)}
                            allowClear
                        />
                    </Col>
                    <Col xs={24} sm={12} md={5}>
                        <Select
                            placeholder="Action"
                            style={{ width: '100%' }}
                            value={filters.action}
                            onChange={(value) => handleFilterChange('action', value)}
                            allowClear
                            options={approvalActionOptions}
                        />
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                         <Input
                            placeholder="Search by submitted by..."
                            prefix={<SearchOutlined />}
                            value={filters.submittedBy}
                            onChange={(e) => handleFilterChange('submittedBy', e.target.value)}
                            allowClear
                        />
                    </Col>
                    <Col xs={24} sm={12} md={7}>
                        <RangePicker
                            style={{ width: '100%' }}
                            onChange={handleDateRangeChange}
                        />
                    </Col>
                </Row>
                <Row style={{ marginTop: 16 }}>
                    <Col>
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

            {/* Table */}
            <Table
                columns={columns}
                dataSource={logs}
                loading={loading}
                rowKey="id"
                pagination={{
                    total,
                    pageSize,
                    current: page,
                    showSizeChanger: true,
                    onChange: (p, ps) => { setPage(p); if (ps) setPageSize(ps); },
                    showTotal: (t, range) => `${range[0]}-${range[1]} of ${t} logs`,
                }}
            />

            {/* Comment Modal */}
            <Modal
                title={
                    <Space>
                        <CommentOutlined />
                        <span>Approval Comment</span>
                    </Space>
                }
                open={selectedComment.isVisible}
                onCancel={hideCommentModal}
                footer={[
                    <Button key="close" onClick={hideCommentModal}>
                        Close
                    </Button>
                ]}
                width={600}
            >
                <div style={{ padding: '16px 0' }}>
                    <Text>{selectedComment.text}</Text>
                </div>
            </Modal>
        </Card>
    );
}

export default ApprovalLog;
