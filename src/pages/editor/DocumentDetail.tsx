"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Layout, Typography, Card, Button, Input, Space, Tag, Alert, Row, Col, Spin } from "antd"
import {
    ArrowLeftOutlined,
    FileTextOutlined,
    UserOutlined,
    CalendarOutlined,
    CheckOutlined,
    CloseOutlined,
} from "@ant-design/icons"
import { api } from "../../lib/api/api";
import toast from 'react-hot-toast';

const { Title, Text, Paragraph } = Typography
const { Content } = Layout
const { TextArea } = Input

export default function DocumentDetail({ onViewChange, mode }: any) {
    const { id, versionId } = useParams();
    const navigate = useNavigate();
    const [document, setDocument] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [rejectionComments, setRejectionComments] = useState("");

    useEffect(() => {
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
        if (id && versionId) fetchDocument();
    }, [id, versionId]);

    if (loading) return <Spin style={{ margin: 40 }} />;
    if (!document) return <div>No document selected</div>;

    const formatDate = (dateStr: string) => {
        if (!dateStr || dateStr.startsWith('0001-01-01')) return '';
        return new Date(dateStr).toLocaleString();
    };

    const handleApprove = () => {
        // Handle approval logic
        onViewChange ? onViewChange("queue") : navigate(-1);
    }

    const handleReject = () => {
        if (mode === "approve") {
            // Switch to reject mode
            onViewChange ? onViewChange("reject-review") : navigate(-1);
        } else {
            // Confirm rejection
            onViewChange ? onViewChange("queue") : navigate(-1);
        }
    }

    const handleSubmitForApproval = async () => {
        if (!document?.id) {
            toast.error("Không tìm thấy versionId!");
            return;
        }
        const userStr = localStorage.getItem("user");
        if (!userStr) {
            toast.error("Không tìm thấy thông tin user, vui lòng đăng nhập lại!");
            return;
        }
        const user = JSON.parse(userStr);
        try {
            await api.post(`/document/submit/${document.id}?userId=${user.userId}`);
            toast.success("Đã gửi tài liệu lên quản lý kiểm duyệt!");
        } catch (error: any) {
            toast.error(`Gửi tài liệu thất bại: ${error?.response?.data?.message || error.message}`);
        }
    };

    return (
        <Layout style={{ minHeight: "100vh", backgroundColor: "#f5f5f5" }}>
            <Content style={{ padding: "24px" }}>
                <div style={{   margin: "0 auto" }}>
                    {/* Header */}
                    <div style={{ marginBottom: 24 }}>
                        <Button
                            type="text"
                            icon={<ArrowLeftOutlined />}
                            onClick={() => onViewChange ? onViewChange("queue") : navigate(-1)}
                            style={{ marginBottom: 16 }}
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
                                <Text strong>ID:</Text> <Text copyable>{document.id}</Text>
                            </Col>
                            <Col span={12}>
                                <Text strong>Status:</Text> <Tag color={document.status === 'Pending' ? 'orange' : 'blue'}>{document.status}</Tag>
                            </Col>
                        </Row>
                        <Row gutter={16} style={{ marginTop: 16 }}>
                            <Col span={12}>
                                <Text strong>Version Number:</Text> <Text>{document.versionNumber || '-'}</Text>
                            </Col>
                            <Col span={12}>
                                <Text strong>Document ID:</Text> <Text>{document.documentId || '-'}</Text>
                            </Col>
                        </Row>
                        <Row gutter={16} style={{ marginTop: 16 }}>
                            <Col span={12}>
                                <Text strong>Created At:</Text> <Text>{formatDate(document.createdAt)}</Text>
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
                        </Row>
                        <Row style={{ marginTop: 24 }}>
                            <Col span={24}>
                                <Button type="primary" onClick={handleSubmitForApproval} block>
                                    Xác nhận đẩy lên cho quản lý kiểm duyệt
                                </Button>
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
                                        <Text type="secondary">{document.summary}</Text>
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
                            {/* <Card>
                                <Title level={4} style={{ marginBottom: 16 }}>
                                    Review Actions
                                </Title>
                                <Text type="secondary" style={{ display: "block", marginBottom: 16 }}>
                                    Choose to approve or reject this document
                                </Text>

                                {mode === "approve" ? (
                                    <Space direction="vertical" style={{ width: "100%" }}>
                                        <Button type="primary" icon={<CheckOutlined />} block size="large" onClick={handleApprove}>
                                            Approve Document
                                        </Button>
                                        <Button danger icon={<CloseOutlined />} block size="large" onClick={handleReject}>
                                            Reject Document
                                        </Button>
                                    </Space>
                                ) : (
                                    <Space direction="vertical" style={{ width: "100%" }}>
                                        <div>
                                            <Text strong style={{ color: "#ff4d4f" }}>
                                                Rejection Comments *
                                            </Text>
                                            <TextArea
                                                rows={4}
                                                placeholder="Please provide detailed feedback on why this document is being rejected (minimum 10 characters)"
                                                value={rejectionComments}
                                                onChange={(e) => setRejectionComments(e.target.value)}
                                                style={{ marginTop: 8 }}
                                            />
                                            <Text type="secondary" style={{ fontSize: "12px" }}>
                                                0/10 characters minimum
                                            </Text>
                                        </div>
                                        <Button
                                            danger
                                            icon={<CheckOutlined />}
                                            block
                                            size="large"
                                            onClick={handleReject}
                                            disabled={rejectionComments.length < 10}
                                        >
                                            Confirm Rejection
                                        </Button>
                                        <Button block onClick={() => onViewChange ? onViewChange("review") : navigate(-1)}>
                                            Cancel
                                        </Button>
                                    </Space>
                                )}
                            </Card> */}
 
                            {/* <Card style={{ marginTop: 16 }}>
                                <Title level={5} style={{ marginBottom: 12 }}>
                                    Review Guidelines
                                </Title>
                                <ul style={{ paddingLeft: 16, margin: 0 }}>
                                    <li style={{ marginBottom: 8 }}>
                                        <Text type="secondary" style={{ fontSize: "12px" }}>
                                            Once approved, this document becomes searchable to all department members
                                        </Text>
                                    </li>
                                    <li style={{ marginBottom: 8 }}>
                                        <Text type="secondary" style={{ fontSize: "12px" }}>
                                            Approval will archive any previous approved version
                                        </Text>
                                    </li>
                                    <li style={{ marginBottom: 8 }}>
                                        <Text type="secondary" style={{ fontSize: "12px" }}>
                                            Rejection requires detailed comments (minimum 10 characters)
                                        </Text>
                                    </li>
                                    <li style={{ marginBottom: 8 }}>
                                        <Text type="secondary" style={{ fontSize: "12px" }}>
                                            Rejected documents will be auto-deleted after 7 days if not resubmitted
                                        </Text>
                                    </li>
                                    <li>
                                        <Text type="secondary" style={{ fontSize: "12px" }}>
                                            This document is temporarily locked while you review it
                                        </Text>
                                    </li>
                                </ul>
                            </Card> */}
                        </Col>
                    </Row>
                </div>
            </Content>
        </Layout>
    )
}
