"use client";

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Layout,
  Card,
  Button,
  Tag,
  Typography,
  Avatar,
  Modal,
  Spin,
  Row,
  Col,
  Alert
} from "antd";
import {
  FileText,
  Eye,
  Clock,
  User,
  Building2,
  Tag as TagIcon,
  ChevronLeft,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  XCircle,
  Globe,
  Lock,
  Calendar,
  Edit3
} from "lucide-react";
import { FolderOutlined } from "@ant-design/icons";
import { api } from "../../lib/api/api";
import toast from 'react-hot-toast';
import { Navbar } from "../../components/layout/Navbar";

const { Title, Text, Paragraph } = Typography;
const { Content } = Layout;

interface DocumentVersion {
  documentId: string;
  versionId: string;
  title: string;
  content: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  versionName: string;
  status: string;
  isPublic: boolean;
  createdTime: string;
  updatedTime: string;
  ownerName: string;
  ownerEmail: string;
  departmentName: string;
  documentTypeName: string;
  tags: string[];
  description: string;
  summary?: string;
  approvedBy?: string;
  approvedAt?: string;
  rejectedBy?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  effectiveFrom?: string;
  effectiveUntil?: string;
  signedBy?: string;
  lastSubmitted?: string;
  submittedByName?: string;
  fileType?: string;
  isReplaced?: boolean;
  replacementDocument?: string;
  replacementDocumentName?: string;
  replacementId?: string;
  // New folder fields
  folderId?: string;
  folderName?: string;
  targetFolderId?: string;
  targetFolderName?: string;
}

export default function DocumentVersionDetail() {
  const { documentId, versionId } = useParams();
  const navigate = useNavigate();

  const [document, setDocument] = useState<DocumentVersion | null>(null);
  const [loading, setLoading] = useState(true);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [previewLoading, setPreviewLoading] = useState(false);

  useEffect(() => {
    if (documentId && versionId) {
      fetchDocumentVersion();
    }
  }, [documentId, versionId]);

  const fetchDocumentVersion = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/document/documents/${documentId}/versions/${versionId}`);
      setDocument(res.data.data);
      console.log('Document data:', res.data.data);
    } catch (error: any) {
      console.error('Error fetching document:', error);
      toast.error(`Unable to load document information: ${error?.response?.data?.message || error.message}`);
      setDocument(null);
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = async () => {
    if (!document?.versionId) {
      toast.error("Version ID not found!");
      return;
    }

    setPreviewLoading(true);
    try {
      const response = await api.get(`/document/files/${document.versionId}/iframe-url`);
      const data = response.data.data;

      if (data.canViewInline && data.iframeUrl) {
        setPreviewUrl(data.iframeUrl);
        setPreviewVisible(true);
      } else {
        toast.error("Cannot preview this file type");
      }
    } catch (error: any) {
      toast.error(`Preview failed: ${error?.response?.data?.message || error.message}`);
      console.error("Preview error:", error);
    } finally {
      setPreviewLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'approved': return 'green';
      case 'pending': return 'orange';
      case 'rejected': return 'red';
      case 'draft': return 'blue';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'approved': return <CheckCircle size={16} />;
      case 'pending': return <Clock size={16} />;
      case 'rejected': return <XCircle size={16} />;
      case 'draft': return <AlertCircle size={16} />;
      default: return <FileText size={16} />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr || dateStr.startsWith('0001-01-01')) return 'N/A';
    return new Date(dateStr).toLocaleDateString('vi-VN');
  };

  if (loading) {
    return (
      <Layout className="min-h-screen bg-gray-50">
        <Content className="p-6">
          <div className="flex justify-center items-center h-64">
            <Spin size="large" />
          </div>
        </Content>
      </Layout>
    );
  }

  if (!document) {
    return (
      <Layout className="min-h-screen bg-gray-50">
        <Navbar />
        <Content className="p-6">
          <div className="text-center">
            <Title level={3}>Document Not Found</Title>
            <Button onClick={() => navigate('/documents')} type="primary">
              Back to List
            </Button>
          </div>
        </Content>
      </Layout>
    );
  }

  return (
    <Layout className="min-h-screen bg-gray-50">
        <Navbar />
      <Content className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <Button
            type="text"
            icon={<ChevronLeft size={16} />}
            onClick={() => navigate(-1)}
            className="mb-4 p-0 h-auto"
          >
            Back
          </Button>

          {/* Replacement Document Alert */}
          {document.isReplaced && document.replacementDocumentName && (
            <Alert
              message="Document has been replaced"
              description={
                <div>
                  This document has been replaced by: <strong>{document.replacementDocumentName}</strong>
                  <br />
                  <Button type="link" icon={<ExternalLink size={14} />} style={{ padding: 0, marginTop: 4 }}>
                    View replacement document
                  </Button>
                </div>
              }
              type="warning"
              showIcon
              style={{ marginBottom: 24 }}
            />
          )}

          <Row gutter={[24, 24]}>
            {/* Main Content */}
            <Col xs={24} lg={16}>
              <div className="mb-6">
                <Title level={1} className="!mb-4 !text-2xl md:!text-3xl">
                  {document.title}
                </Title>

                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <Tag
                    color={getStatusColor(document.status)}
                    icon={getStatusIcon(document.status)}
                    className="flex items-center gap-1 px-3 py-1"
                  >
                    {document.status}
                  </Tag>

                  <Tag
                    color={document.isPublic ? 'blue' : 'orange'}
                    icon={document.isPublic ? <Globe size={12} /> : <Lock size={12} />}
                    className="px-3 py-1 flex items-center"
                  >
                    {document.isPublic ? 'Public' : 'Private'}
                  </Tag>

                  <Text type="secondary" className="text-sm">
                    Version: {document.versionName}
                  </Text>
                </div>

                {document.description && (
                  <Paragraph className="text-gray-600 text-base leading-relaxed mb-6">
                    {document.description}
                  </Paragraph>
                )}

                {document.tags && document.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-6">
                    {document.tags.map((tag, index) => (
                      <Tag key={index} icon={<TagIcon size={12} />} className="rounded-full flex gap-2 items-center">
                        {tag}
                      </Tag>
                    ))}
                  </div>
                )}
              </div>

              {/* Document Summary */}
              {document.summary && (
                <Card title="Document Summary" className="mb-6 shadow-sm">
                  <div
                    className="prose prose-gray max-w-none bg-gray-50 p-4 rounded-lg"
                    dangerouslySetInnerHTML={{ __html: document.summary }}
                  />
                </Card>
              )}

              {/* Document Content */}
              {document.content && (
                <Card title="Detailed Content" className="mb-6 shadow-sm">
                  <div
                    className="prose prose-gray max-w-none leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: document.content }}
                  />
                </Card>
              )}
            </Col>

            {/* Sidebar */}
            <Col xs={24} lg={8}>
              <div className="space-y-6">
                {/* File Info Card */}
                <Card className="shadow-sm">
                  <div className="text-center mb-6">
                    <Avatar
                      size={80}
                      icon={<FileText />}
                      className="bg-blue-500 mb-3"
                    />
                    <div>
                      <Text strong className="block text-lg mb-1">{document.fileName}</Text>
                      <Text type="secondary" className="block text-sm">
                        {formatFileSize(document.fileSize || 0)}
                      </Text>
                      <Text type="secondary" className="block text-xs mt-1">
                        {document.fileType}
                      </Text>
                    </div>
                  </div>

                  <Button
                    block
                    type="primary"
                    size="large"
                    icon={<Eye size={18} />}
                    onClick={handlePreview}
                    loading={previewLoading}
                    className="h-12 text-base font-medium"
                  >
                    View Document
                  </Button>
                </Card>

                {/* Document Info Card */}
                <Card title="Document Information" className="shadow-sm">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <User size={16} className="text-gray-500 mt-1" />
                      <div className="flex-1">
                        <Text className="block font-medium">{document.ownerName}</Text>
                        <Text type="secondary" className="text-sm">{document.ownerEmail}</Text>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Building2 size={16} className="text-gray-500 mt-1" />
                      <div className="flex-1">
                        <Text className="block font-medium">{document.departmentName}</Text>
                        <Text type="secondary" className="text-sm">Department</Text>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Calendar size={16} className="text-gray-500 mt-1" />
                      <div className="flex-1">
                        <Text className="block font-medium">{formatDate(document.createdTime)}</Text>
                        <Text type="secondary" className="text-sm">Created Date</Text>
                      </div>
                    </div>

                    {document.documentTypeName && (
                      <div className="flex items-start gap-3">
                        <FileText size={16} className="text-gray-500 mt-1" />
                        <div className="flex-1">
                          <Text className="block font-medium">{document.documentTypeName}</Text>
                          <Text type="secondary" className="text-sm">Document Type</Text>
                        </div>
                      </div>
                    )}

                    {/* Folder Information */}
                    {document.folderName && (
                      <div className="flex items-start gap-3">
                        <FolderOutlined style={{ fontSize: 16, color: '#666', marginTop: 4 }} />
                        <div className="flex-1">
                          <Text className="block font-medium">{document.folderName}</Text>
                          <Text type="secondary" className="text-sm">Current Folder</Text>
                        </div>
                      </div>
                    )}

                    {document.targetFolderName && (
                      <div className="flex items-start gap-3">
                        <FolderOutlined style={{ fontSize: 16, color: '#1890ff', marginTop: 4 }} />
                        <div className="flex-1">
                          <Text className="block font-medium" style={{ color: '#1890ff' }}>{document.targetFolderName}</Text>
                          <Text type="secondary" className="text-sm">Target Folder</Text>
                        </div>
                      </div>
                    )}
                  </div>
                </Card>

                {/* Approval Info */}
                {(document.approvedBy || document.rejectedBy) && (
                  <Card title="Approval Information" className="shadow-sm">
                    <div className="space-y-3">
                      {document.approvedBy && (
                        <div>
                          <Text strong className="block text-green-600">Approved</Text>
                          <Text className="block">By: {document.approvedBy}</Text>
                          {document.approvedAt && (
                            <Text type="secondary" className="text-sm">
                              Date: {formatDate(document.approvedAt)}
                            </Text>
                          )}
                        </div>
                      )}

                      {document.rejectedBy && (
                        <div>
                          <Text strong className="block text-red-600">Rejected</Text>
                          <Text className="block">By: {document.rejectedBy}</Text>
                          {document.rejectionReason && (
                            <Text type="secondary" className="block text-sm mt-1">
                              Reason: {document.rejectionReason}
                            </Text>
                          )}
                        </div>
                      )}
                    </div>
                  </Card>
                )}

                {/* Effective Period */}
                {(document.effectiveFrom || document.effectiveUntil || document.signedBy) && (
                  <Card title="Effective Information" className="shadow-sm">
                    <div className="space-y-3">
                      {document.effectiveFrom && (
                        <div>
                          <Text type="secondary" className="text-sm">Effective From</Text>
                          <Text className="block font-medium">{formatDate(document.effectiveFrom)}</Text>
                        </div>
                      )}

                      {document.effectiveUntil && (
                        <div>
                          <Text type="secondary" className="text-sm">Effective Until</Text>
                          <Text className="block font-medium">{formatDate(document.effectiveUntil)}</Text>
                        </div>
                      )}

                      {document.signedBy && (
                        <div className="flex items-center gap-2">
                          <Edit3 size={14} className="text-gray-500" />
                          <div>
                            <Text type="secondary" className="text-sm block">Signed By</Text>
                            <Text className="font-medium">{document.signedBy}</Text>
                          </div>
                        </div>
                      )}
                    </div>
                  </Card>
                )}

                {/* Replacement Info */}
                {document.replacementId && (
                  <Card title="Replacement Information" className="shadow-sm border-orange-200">
                    <div className="space-y-3">
                      <div>
                        <Text type="secondary" className="text-sm block">Replacement ID</Text>
                        <Text copyable className="font-mono text-sm">{document.replacementId}</Text>
                      </div>

                      {document.replacementDocumentName && (
                        <div>
                          <Text type="secondary" className="text-sm block">Replacement Document</Text>
                          <Text className="font-medium">{document.replacementDocumentName}</Text>
                        </div>
                      )}
                    </div>
                  </Card>
                )}
              </div>
            </Col>
          </Row>
        </div>

        {/* Preview Modal */}
        <Modal
          title={
            <div className="flex items-center gap-2">
              <FileText size={18} />
              <span className="text-lg">{document?.fileName}</span>
            </div>
          }
          open={previewVisible}
          onCancel={() => setPreviewVisible(false)}
          footer={[
            <Button key="close" onClick={() => setPreviewVisible(false)} size="large">
              Close
            </Button>
          ]}
          width="95%"
          style={{ top: 20 }}
          bodyStyle={{ padding: 0, height: '85vh' }}
        >
          {previewUrl && (
            <iframe
              src={previewUrl}
              style={{
                width: '100%',
                height: '100%',
                border: 'none'
              }}
              title="Document Preview"
            />
          )}
        </Modal>
      </Content>
    </Layout>
  );
}