"use client"

import { useState } from "react"
import { Layout, Typography, Card, Button, Input, Space, Tag, Alert, Row, Col } from "antd"
import {
    ArrowLeftOutlined,
    FileTextOutlined,
    UserOutlined,
    CalendarOutlined,
    CheckOutlined,
    CloseOutlined,
} from "@ant-design/icons"

const { Title, Text, Paragraph } = Typography
const { Content } = Layout
const { TextArea } = Input

const document: any =
{
    id: "1",
    title: "Design System Guidelines",
    department: "Design",
    editor: "Michael Chen",
    submitted: "7/8/2025",
    version: "v1",
    status: "Pending Approval",
    content: "Updated design system with new components and patterns",
    description: "Our design system provides a comprehensive set of guidelines...",
}
export default function DocumentReview({  onViewChange, mode }: any) {
    const [rejectionComments, setRejectionComments] = useState("")

    if (!document) {
        return <div>No document selected</div>
    }

    const handleApprove = () => {
        // Handle approval logic
        onViewChange("queue")
    }

    const handleReject = () => {
        if (mode === "approve") {
            // Switch to reject mode
            onViewChange("reject-review")
        } else {
            // Confirm rejection
            onViewChange("queue")
        }
    }

    return (
        <Layout style={{ minHeight: "100vh", backgroundColor: "#f5f5f5" }}>
            <Content style={{ padding: "24px" }}>
                <div style={{ maxWidth: 1200, margin: "0 auto" }}>
                    {/* Header */}
                    <div style={{ marginBottom: 24 }}>
                        <Button
                            type="text"
                            icon={<ArrowLeftOutlined />}
                            onClick={() => onViewChange("queue")}
                            style={{ marginBottom: 16 }}
                        >
                            Back to Approval Queue
                        </Button>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div>
                                <Title level={2} style={{ margin: 0 }}>
                                    Document Review
                                </Title>
                                <Text type="secondary">Review and approve or reject this document</Text>
                            </div>
                            <Alert message="Locked for Review" type="warning" showIcon />
                        </div>
                    </div>

                    <Row gutter={24}>
                        {/* Left Column - Document Details */}
                        <Col xs={24} lg={16}>
                            <Card style={{ marginBottom: 24 }}>
                                <div style={{ display: "flex", alignItems: "flex-start", marginBottom: 16 }}>
                                    <FileTextOutlined style={{ fontSize: 24, marginRight: 12, marginTop: 4 }} />
                                    <div style={{ flex: 1 }}>
                                        <Title level={4} style={{ margin: 0, marginBottom: 8 }}>
                                            {document.title}
                                        </Title>
                                        <Text type="secondary">{document.content}</Text>
                                    </div>
                                </div>

                                <Row gutter={16} style={{ marginBottom: 16 }}>
                                    <Col span={12}>
                                        <div>
                                            <Text strong>Editor</Text>
                                            <div style={{ display: "flex", alignItems: "center", marginTop: 4 }}>
                                                <UserOutlined style={{ marginRight: 4, color: "#666" }} />
                                                <Text>{document.editor}</Text>
                                            </div>
                                        </div>
                                    </Col>
                                    <Col span={12}>
                                        <div>
                                            <Text strong>Department</Text>
                                            <div style={{ marginTop: 4 }}>
                                                <Tag color="blue">{document.department}</Tag>
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
                                                <Text>{document.submitted}, 12:54:26 PM</Text>
                                            </div>
                                        </div>
                                    </Col>
                                    <Col span={12}>
                                        <div>
                                            <Text strong>Version</Text>
                                            <div style={{ marginTop: 4 }}>
                                                <Text>{document.version}</Text>
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
                            <Card>
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
                                        <Button block onClick={() => onViewChange("review")}>
                                            Cancel
                                        </Button>
                                    </Space>
                                )}
                            </Card>

                            {/* Review Guidelines */}
                            <Card style={{ marginTop: 16 }}>
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
                            </Card>
                        </Col>
                    </Row>
                </div>
            </Content>
        </Layout>
    )
}
