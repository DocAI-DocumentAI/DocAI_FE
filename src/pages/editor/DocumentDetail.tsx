import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Layout, Typography, Card, Button, Tag, Row, Col, Spin } from "antd"
import {
    ArrowLeftOutlined,
    FileTextOutlined,
    UserOutlined,
    CalendarOutlined,
} from "@ant-design/icons"
import { api } from "../../lib/api/api";
import toast from 'react-hot-toast';

const { Title, Text, Paragraph } = Typography
const { Content } = Layout

export default function DocumentDetail({ onViewChange, }: any) {
    const { id, versionId } = useParams();
    const navigate = useNavigate();
    const [document, setDocument] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false); // Thêm state cho submit loading

    const fetchDocument = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/document/documents/${id}/versions/${versionId}`);
            setDocument(res.data.data);
        } catch (error: any) {
            toast.error(`Không thể tải chi tiết tài liệu: ${error?.response?.data?.message || error.message}`);
            setDocument(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id && versionId) fetchDocument();
    }, [id, versionId]);

    if (loading) return <Spin style={{ margin: 40 }} />;
    if (!document) return <div>No document selected</div>;

    const formatDate = (dateStr: string) => {
        if (!dateStr || dateStr.startsWith('0001-01-01')) return '';
        return new Date(dateStr).toLocaleString();
    };

    const handleSubmitForApproval = async () => {
        console.log(document);

        if (!document?.versionId) {
            toast.error("Không tìm thấy versionId!");
            return;
        }
        const userStr = localStorage.getItem("user");
        if (!userStr) {
            toast.error("Không tìm thấy thông tin user, vui lòng đăng nhập lại!");
            return;
        }
        const user = JSON.parse(userStr);

        setSubmitting(true); // Bắt đầu loading
        try {
            await api.post(`/document/submit/${document.versionId}?userId=${user.userId}`);
            toast.success("Đã gửi tài liệu lên quản lý kiểm duyệt!");
            // Reload document để cập nhật status
            await fetchDocument();
        } catch (error: any) {
            toast.error(`Gửi tài liệu thất bại: ${error?.response?.data?.message || error.message}`);
        } finally {
            setSubmitting(false); // Kết thúc loading
        }
    };

    return (
        <Layout style={{ minHeight: "100vh", backgroundColor: "#f5f5f5" }}>
            <Content style={{ padding: "24px" }}>
                <div style={{ margin: "0 auto" }}>
                    {/* Header */}
                    <div style={{ marginBottom: 24 }}>
                        <Button
                            type="text"
                            icon={<ArrowLeftOutlined />}
                            onClick={() => onViewChange ? onViewChange("queue") : navigate(-1)}
                            style={{ marginBottom: 16 }}
                            disabled={submitting} // Disable khi đang submit
                        >
                            Back
                        </Button>
                        <Title level={2} style={{ margin: 0 }}>
                            Document Detail
                        </Title>
                    </div>

                    <Card style={{ marginBottom: 24 }}>
                        <Row gutter={16}>
                            <Col span={12}>
                                <Text strong>ID:</Text> <Text copyable>{document.documentId}</Text>
                            </Col>
                            <Col span={12}>
                                <Text strong>Status:</Text> <Tag color={document.status === 'Pending' ? 'orange' : 'blue'}>{document.status}</Tag>
                            </Col>
                        </Row>
                        <Row gutter={16} style={{ marginTop: 16 }}>
                            <Col span={12}>
                                <Text strong>Version Number:</Text> <Text>{document.versionId || '-'}</Text>
                            </Col>
                            <Col span={12}>
                                <Text strong>Document ID:</Text> <Text>{document.documentId || '-'}</Text>
                            </Col>
                        </Row>
                        <Row gutter={16} style={{ marginTop: 16 }}>
                            <Col span={12}>
                                <Text strong>Created At:</Text> <Text>{formatDate(document.createdTime)}</Text>
                            </Col>
                            <Col span={12}>
                                <Text strong>Last Submitted:</Text> <Text>{formatDate(document.lastSubmitted)}</Text>
                            </Col>
                        </Row>
                        <Row gutter={16} style={{ marginTop: 16 }}>
                            <Col span={12}>
                                <Text strong>Submitted By:</Text> <Text>{document.submittedBy || '-'}</Text>
                            </Col>
                            <Col span={12}>
                                <Text strong>Tags:</Text> {Array.isArray(document.tags) && document.tags.length > 0 ? document.tags.map((tag: string) => <Tag key={tag}>{tag}</Tag>) : <Text>-</Text>}
                            </Col>
                            <Col span={12}>
                                <Text strong>file name:</Text> {document.fileName || '-'}
                            </Col>
                            <Col span={12}>
                                <Text strong>documentTypeName:</Text> {document.documentTypeName || '-'}
                            </Col>
                            <Col span={12}>
                                <Text strong>Public:</Text> {document.isPublic ? 'Yes' : 'No'}
                            </Col>
                        </Row>
                        <Row style={{ marginTop: 24 }}>
                            <Col span={24}>
                                {document.status === 'Draft' && (
                                    <Button 
                                        type="primary" 
                                        onClick={handleSubmitForApproval} 
                                        block
                                        loading={submitting}
                                        disabled={submitting}
                                    >
                                        {submitting ? "Đang gửi..." : "Xác nhận đẩy lên cho quản lý kiểm duyệt"}
                                    </Button>
                                )}
                                {document.status === 'Rejected' && (
                                    <Button 
                                        type="primary" 
                                        danger 
                                        block 
                                        onClick={() => navigate(`/editor/document/recreate/${document.documentId}`)}
                                        disabled={submitting}
                                    >
                                        Tạo lại bản nháp
                                    </Button>
                                )}
                                {document.status === 'Approved' && (
                                    <Button 
                                        type="default" 
                                        block 
                                        onClick={() => navigate(`/editor/document/new-version/${document.documentId}`)}
                                        disabled={submitting}
                                    >
                                        Tạo Version mới
                                    </Button>
                                )}
                                {document.status === 'Pending' && (
                                    <div style={{ textAlign: 'center', padding: 16 }}>
                                        <Text type="secondary">
                                            Tài liệu đang chờ phê duyệt
                                        </Text>
                                    </div>
                                )}
                            </Col>
                        </Row>
                    </Card>

                    <Row gutter={25}>
                        {/* Left Column - Document Details */}
                        <Col xs={24} lg={24}>
                            <Card style={{ marginBottom: 24 }}>
                                <div style={{ display: "flex", alignItems: "flex-start", marginBottom: 16 }}>
                                    <FileTextOutlined style={{ fontSize: 24, marginRight: 12, marginTop: 4 }} />
                                    <div style={{ flex: 1 }}>
                                        <Title level={4} style={{ margin: 0, marginBottom: 8 }}>
                                            {document.title}
                                        </Title>
                                        <div className="text-gray-500" style={{ fontSize: 14 }} dangerouslySetInnerHTML={{ __html: document.summary || '' }} />
                                    </div>
                                </div>

                                <Row gutter={16} style={{ marginBottom: 16 }}>
                                    <Col span={12}>
                                        <div>
                                            <Text strong>Editor</Text>
                                            <div style={{ display: "flex", alignItems: "center", marginTop: 4 }}>
                                                <UserOutlined style={{ marginRight: 4, color: "#666" }} />
                                                <Text>{document.signedBy || document.ownerId}</Text>
                                            </div>
                                        </div>
                                    </Col>
                                    <Col span={12}>
                                        <div>
                                            <Text strong>Department</Text>
                                            <div style={{ marginTop: 4 }}>
                                                <Tag color="blue">{document.departmentId}</Tag>
                                            </div>
                                        </div>
                                    </Col>
                                </Row>

                                <Row gutter={16}>
                                    <Col span={12}>
                                        <div>
                                            <Text strong>Submitted</Text>
                                            <div style={{ display: "flex", alignItems: "center", marginTop: 4 }}>
                                                <CalendarOutlined style={{ marginRight: 4, color: "#666" }} />
                                                <Text>{document.lastSubmitted ? new Date(document.lastSubmitted).toLocaleString() : ""}</Text>
                                            </div>
                                        </div>
                                    </Col>
                                    <Col span={12}>
                                        <div>
                                            <Text strong>Version</Text>
                                            <div style={{ marginTop: 4 }}>
                                                <Text>{document.versionName}</Text>
                                            </div>
                                        </div>
                                    </Col>
                                </Row>
                            </Card>

                            {/* Document Content */}
                            <Card>
                                <Title level={4} style={{ marginBottom: 16 }}>
                                    Document Content
                                </Title>
                                <div style={{ backgroundColor: "#f5f5f5", padding: 16, borderRadius: 6 }}>
                                    <Paragraph>{document.description}</Paragraph>
                                </div>
                            </Card>
                        </Col>

                        {/* Right Column - Review Actions */}
                        <Col xs={24} lg={8}>
                            {/* Comment out existing code for now */}
                        </Col>
                    </Row>
                </div>
            </Content>
        </Layout>
    )
}
