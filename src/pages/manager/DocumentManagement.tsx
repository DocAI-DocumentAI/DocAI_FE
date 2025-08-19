 

import { useState, useEffect } from "react"
import { Layout, Typography, Card, Button, Input, Select, Table, Tag, Space, Tooltip, Badge, Row, Col } from "antd"
import {
  FileTextOutlined,
  CloseCircleOutlined,
  FolderOutlined,
  UploadOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  CalendarOutlined,
  FolderOpenOutlined,
} from "@ant-design/icons"
import { FolderTree, FolderBreadcrumb } from "../../components/folder"
import type { FolderNode } from "../../types/folder"
import { getFolderTree } from "../../lib/api/folder"

const { Title, Text } = Typography
const { Content } = Layout

interface Document {
  key: string
  title: string
  code: string
  description: string
  type: string
  status: "Draft" | "Rejected"
  created: string
  lastModified: string
  folderId?: string
  folderPath?: string
}

const documents: Document[] = [
  {
    key: "1",
    title: "Software Development Guidelines v2.1",
    code: "SDG-2024-001",
    description: "Updated software development guidelines with new coding standards",
    type: "Guidelines",
    status: "Draft",
    created: "7/9/2025",
    lastModified: "7/9/2025",
    folderId: "folder-1",
    folderPath: "/approved/IT/Development",
  },
  {
    key: "2",
    title: "Product Requirements Template",
    code: "PRT-2024-002",
    description: "Standard template for product requirement documents",
    type: "Internal Rules",
    status: "Rejected",
    created: "7/6/2025",
    lastModified: "7/6/2025",
    folderId: "folder-2",
    folderPath: "/approved/Product/Templates",
  },
]

export default function DocumentManagement() {
  const [searchText, setSearchText] = useState("")
  const [statusFilter, setStatusFilter] = useState("All Status")
  const [sortOrder, setSortOrder] = useState("Newest First")

  // Folder state
  const [folders, setFolders] = useState<FolderNode[]>([])
  const [selectedFolderId, setSelectedFolderId] = useState<string | undefined>(undefined)
  const [showFolderTree, setShowFolderTree] = useState(false)
  const [loading, setLoading] = useState(false)
  void loading;


  // Load folders on component mount
  useEffect(() => {
    loadFolders()
  }, [])

  const loadFolders = async () => {
    try {
      setLoading(true)
      const response = await getFolderTree(undefined, true)
      if (response.success) {
        setFolders(response.data.rootNodes)
      }
    } catch (error) {
      console.error('Failed to load folders:', error)
    } finally {
      setLoading(false)
    }
  }

  // Handle folder selection
  const handleFolderSelect = (folder: FolderNode) => {
    setSelectedFolderId(folder.id)
  }

  // Handle folder navigation
  const handleFolderNavigation = (folderId: string | null) => {
    setSelectedFolderId(folderId || undefined)
  }

  const columns = [
    {
      title: "Document",
      dataIndex: "title",
      key: "title",
      render: (text: string, record: Document) => (
        <div>
          <div style={{ display: "flex", alignItems: "center", marginBottom: 4 }}>
            <FileTextOutlined style={{ marginRight: 8, color: "#666" }} />
            <Text strong>{text}</Text>
          </div>
          <Text type="secondary" style={{ fontSize: "12px" }}>
            {record.code}
          </Text>
          <br />
          <Text type="secondary" style={{ fontSize: "12px" }}>
            {record.description}
          </Text>
        </div>
      ),
    },
    {
      title: "Folder",
      dataIndex: "folderPath",
      key: "folderPath",
      render: (folderPath: string) => (
        <div style={{ display: "flex", alignItems: "center" }}>
          <FolderOutlined style={{ marginRight: 4, color: "#1890ff" }} />
          <Text type="secondary" style={{ fontSize: "12px" }}>
            {folderPath || "No folder"}
          </Text>
        </div>
      ),
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      render: (type: string) => <Tag color={type === "Guidelines" ? "orange" : "blue"}>{type}</Tag>,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => <Tag color={status === "Draft" ? "default" : "red"}>{status}</Tag>,
    },
    {
      title: "Created",
      dataIndex: "created",
      key: "created",
      render: (date: string) => (
        <div style={{ display: "flex", alignItems: "center" }}>
          <CalendarOutlined style={{ marginRight: 4, color: "#666" }} />
          <Text>{date}</Text>
        </div>
      ),
    },
    {
      title: "Last Modified",
      dataIndex: "lastModified",
      key: "lastModified",
      render: (date: string) => (
        <div style={{ display: "flex", alignItems: "center" }}>
          <CalendarOutlined style={{ marginRight: 4, color: "#666" }} />
          <Text>{date}</Text>
        </div>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: () => (
        <Space>
          <Tooltip title="Edit">
            <Button type="text" icon={<EditOutlined />} size="small" />
          </Tooltip>
          <Tooltip title="Reload">
            <Button type="text" icon={<ReloadOutlined />} size="small" />
          </Tooltip>
          <Tooltip title="Delete">
            <Button type="text" icon={<DeleteOutlined />} size="small" danger />
          </Tooltip>
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
            <Title level={2} style={{ margin: 0, color: "#262626" }}>
              Document Management
            </Title>
            <Text type="secondary">Welcome back, John Smith - Editor</Text>
          </div>

          {/* Summary Cards */}
          <Row gutter={16} style={{ marginBottom: 24 }}>
            <Col xs={24} sm={8}>
              <Card>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <Text type="secondary">Draft Documents</Text>
                    <div style={{ fontSize: "24px", fontWeight: "bold", margin: "8px 0" }}>1</div>
                    <Text type="secondary" style={{ fontSize: "12px" }}>
                      (5 remaining limit: 20)
                    </Text>
                  </div>
                  <EditOutlined style={{ color: "#666" }} />
                </div>
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <Text type="secondary">Rejected Documents</Text>
                    <div style={{ fontSize: "24px", fontWeight: "bold", margin: "8px 0" }}>1</div>
                    <Text type="secondary" style={{ fontSize: "12px" }}>
                      Need revision
                    </Text>
                  </div>
                  <CloseCircleOutlined style={{ color: "#ff4d4f" }} />
                </div>
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <Text type="secondary">Total Documents</Text>
                    <div style={{ fontSize: "24px", fontWeight: "bold", margin: "8px 0" }}>2</div>
                    <Text type="secondary" style={{ fontSize: "12px" }}>
                      In your workspace
                    </Text>
                  </div>
                  <FolderOutlined style={{ color: "#666" }} />
                </div>
              </Card>
            </Col>
          </Row>

          {/* My Drafts Section */}
          <Card>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center" }}>
                <FileTextOutlined style={{ marginRight: 8 }} />
                <Title level={4} style={{ margin: 0 }}>
                  My Drafts
                </Title>
                <Badge count={2} style={{ marginLeft: 8 }} />
              </div>
              <Button type="default" icon={<UploadOutlined />}>
                Upload Document
              </Button>
            </div>

            <Text type="secondary" style={{ display: "block", marginBottom: 16 }}>
              Manage your draft and rejected documents
            </Text>

            {/* Search and Filters */}
            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col xs={24} sm={12} md={6}>
                <Input
                  placeholder="Search documents by title..."
                  prefix={<SearchOutlined />}
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                />
              </Col>
              <Col xs={12} sm={6} md={4}>
                <Select value={statusFilter} onChange={setStatusFilter} style={{ width: "100%" }}>
                  <Select.Option value="All Status">All Status</Select.Option>
                  <Select.Option value="Draft">Draft</Select.Option>
                  <Select.Option value="Rejected">Rejected</Select.Option>
                </Select>
              </Col>
              <Col xs={12} sm={6} md={4}>
                <Select value={sortOrder} onChange={setSortOrder} style={{ width: "100%" }}>
                  <Select.Option value="Newest First">Newest First</Select.Option>
                  <Select.Option value="Oldest First">Oldest First</Select.Option>
                </Select>
              </Col>
              <Col xs={24} sm={12} md={4}>
                <Button
                  icon={<FolderOpenOutlined />}
                  onClick={() => setShowFolderTree(!showFolderTree)}
                  type={showFolderTree ? 'primary' : 'default'}
                  style={{ width: "100%" }}
                >
                  {showFolderTree ? 'Hide Folders' : 'Show Folders'}
                </Button>
              </Col>
            </Row>

            {/* Folder Navigation */}
            {showFolderTree && (
              <Row gutter={16} style={{ marginBottom: 16 }}>
                <Col span={24}>
                  <Card size="small" title="Folder Navigation">
                    {selectedFolderId && (
                      <div style={{ marginBottom: 12 }}>
                        <FolderBreadcrumb
                          folderId={selectedFolderId}
                          folders={folders}
                          onFolderClick={handleFolderNavigation}
                        />
                      </div>
                    )}
                    <FolderTree
                      folders={folders}
                      selectedFolderId={selectedFolderId}
                      onFolderSelect={handleFolderSelect}
                      allowSelection={true}
                      showContextMenu={false}
                      className="max-h-64 overflow-auto"
                    />
                  </Card>
                </Col>
              </Row>
            )}

            {/* Documents Table */}
            <Table columns={columns} dataSource={documents} pagination={false} size="middle" />
          </Card>
        </div>
      </Content>
    </Layout>
  )
}
