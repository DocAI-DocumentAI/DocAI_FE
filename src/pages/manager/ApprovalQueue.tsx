"use client"

import { Layout, Typography, Card, Button, Table, Tag, Badge, Row, Col, Tabs } from "antd"
import {
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  FolderOutlined,
  UserOutlined,
  CalendarOutlined,
} from "@ant-design/icons" 
import { Link } from "react-router-dom"

const { Title, Text } = Typography
const { Content } = Layout

 
const mockDocuments: any = [
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
  },
  {
    id: "2",
    title: "API Documentation v2.1",
    department: "Engineering",
    editor: "John Smith",
    submitted: "7/9/2025",
    version: "v1",
    status: "Pending Approval",
    content: "Updated REST API documentation with new endpoints",
    description: "This document outlines the REST API endpoints for our application...",
  },
  {
    id: "3",
    title: "Product Requirements Document",
    department: "Product",
    editor: "Emily Davis",
    submitted: "7/10/2025",
    version: "v2",
    status: "Pending Approval",
    content: "Requirements for the new user dashboard feature",
    description: "Requirements for the new user dashboard feature",
  },
]

export default function ApprovalQueue({ onViewChange }: any) {
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
      dataIndex: "department",
      key: "department",
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
          <Text type="secondary" style={{ fontSize: "12px" }}>
            3 days ago
          </Text>
        </div>
      ),
    },
    {
      title: "Version",
      dataIndex: "version",
      key: "version",
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
      render: (record: Document) => (
        <Link to="/manager/document-review">
            <Button type="primary" size="small" onClick={() => onViewChange("review", record)}>
              Review
            </Button>
        </Link>
      ),
    },
  ]

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
                    <div style={{ fontSize: "24px", fontWeight: "bold", margin: "8px 0" }}>3</div>
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
                    <div style={{ fontSize: "24px", fontWeight: "bold", margin: "8px 0" }}>1</div>
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
                    <div style={{ fontSize: "24px", fontWeight: "bold", margin: "8px 0" }}>1</div>
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
                    <div style={{ fontSize: "24px", fontWeight: "bold", margin: "8px 0" }}>5</div>
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
                    Approval Queue <Badge count={3} size="small" />
                  </span>
                ),
                children: (
                  <Card>
                    <div style={{ marginBottom: 16 }}>
                      <Title level={4} style={{ margin: 0, marginBottom: 8 }}>
                        Approval Queue <Badge count={3} />
                      </Title>
                      <Text type="secondary">Documents awaiting your approval (sorted by oldest first)</Text>
                    </div>
                    <Table columns={columns} dataSource={mockDocuments} pagination={false} />
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
