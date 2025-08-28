"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Layout, Typography, Card, Button, Input, Space, Tag, Alert, Row, Col, Spin, Modal } from "antd"
import {
    ArrowLeftOutlined,
    FileTextOutlined,
    UserOutlined,
    CalendarOutlined,
    CheckOutlined,
    CloseOutlined,
    EyeOutlined,
    FolderOutlined,
    FolderOpenOutlined
} from "@ant-design/icons"
import { api } from "../../lib/api/api";
import toast from 'react-hot-toast';
import { FolderSelectorInput, FolderTree, FolderBreadcrumb } from "../../components/folder";
import type { FolderNode } from "../../types/folder";
import { getFolderTree } from "../../lib/api/folder";

const { Title, Text, Paragraph } = Typography
const { Content } = Layout
const { TextArea } = Input

export default function DocumentReview() {
    const { id, versionId } = useParams();
    const navigate = useNavigate();
    const [document, setDocument] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [rejectionComments, setRejectionComments] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [previewVisible, setPreviewVisible] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string>("");
    const [previewLoading, setPreviewLoading] = useState(false);
    // Optional target folder after approval
    const [targetFolderId, setTargetFolderId] = useState<string | undefined>(undefined);

    // Folder state for public documents
    const [folders, setFolders] = useState<FolderNode[]>([]);
    const [folderLoading, setFolderLoading] = useState(false);
    const [showFolderTree, setShowFolderTree] = useState(false);

    useEffect(() => {
        const fetchDocument = async () => {
            setLoading(true);
            try {
                const res = await api.get(`/document/documents/${id}/versions/${versionId}`);
                const documentData = res.data.data;
                setDocument(documentData);
                // Initialize target folder with the document's targetFolderId if available
                if (documentData.targetFolderId) {
                    setTargetFolderId(documentData.targetFolderId);
                }
                // Fetch public folder tree if the document is public
                if (documentData.isPublic) {
                    loadFolders();
                }
            } catch (error: any) {
                toast.error(`Không thể tải chi tiết tài liệu: ${error?.response?.data?.message || error.message}`);
                setDocument(null);
            } finally {
                setLoading(false);
            }
        };
        if (id && versionId) fetchDocument();
    }, [id, versionId]);

    const loadFolders = async () => {
        try {
            setFolderLoading(true);
            const response = await getFolderTree(undefined, true);
            if (response.success) {
                setFolders(response.data.rootNodes);
            }
        } catch (error) {
            console.error('Failed to load folders:', error);
            toast.error('Failed to load public folder tree.');
        } finally {
            setFolderLoading(false);
        }
    };

    const handleFolderSelect = (folder: FolderNode) => {
        setTargetFolderId(folder.id);
    };

    const handleFolderNavigation = (folderId: string | null) => {
        setTargetFolderId(folderId || undefined);
    };

    const handleReview = async (isApproved: boolean) => {
        if (!document?.versionId) {
            toast.error("Không tìm thấy versionId!");
            return;
        }
        const userStr = localStorage.getItem("user");
        if (!userStr) {

            return;
        }
        if (!isApproved && rejectionComments.trim().length < 10) {
            toast.error("Vui lòng nhập nhận xét tối thiểu 10 ký tự khi từ chối!");
            return;
        }
        /* const user = JSON.parse(userStr); */
        setSubmitting(true);
        try {
            // Folder-approval review endpoint (consolidated): POST /{versionId}/review
            const url = `/document/review/${document.versionId}`;
            const body = isApproved
                ? { isApproved: true, ...(rejectionComments.trim() ? { comments: rejectionComments } : {}), ...(targetFolderId ? { targetFolderId } : {}) }
                : { isApproved: false, comments: rejectionComments, returnToDrafts: true };
            await api.post(url, body);
            toast.success(isApproved ? "Duyệt tài liệu thành công!" : "Từ chối tài liệu thành công!");
            navigate(-1);
        } catch (error: any) {
            toast.error(`Gửi kết quả duyệt thất bại: ${error?.response?.data?.message || error.message}`);
        } finally {
            setSubmitting(false);
        }
    };

    const handlePreview = async () => {
        if (!document?.versionId) {
            toast.error("Không tìm thấy versionId!");
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
                toast.error("This file type cannot be previewed inline");
            }
        } catch (error: any) {
            toast.error(`Preview failed: ${error?.response?.data?.message || error.message}`);
            console.error("Preview error:", error);
        } finally {
            setPreviewLoading(false);
        }
    };

    const handleClosePreview = () => {
        setPreviewVisible(false);
        setPreviewUrl("");
    };

    if (loading) return <Spin style={{ margin: 40 }} />;
    if (!document) return <div>No document selected</div>;

    const formatDate = (dateStr: string) => {
        if (!dateStr || dateStr.startsWith('0001-01-01')) return '';
        return new Date(dateStr).toLocaleString();
    };

    return (
        <Layout style={{ minHeight: "100vh", backgroundColor: "#f5f5f5" }}>
            <Content style={{ padding: "24px" }}>
                <div style={{ maxWidth: 1200, margin: "0 auto" }}>
                    {/* Header */}
                    <div style={{ marginBottom: 24 }}>
                        <Button
                            type="text"
                            icon={<ArrowLeftOutlined />}
                            onClick={() => navigate(-1)}
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

                    {/* Replacement Document Information - Add this after document title section */}
                    {(document.replacementDocument || (document.isReplaced && document.replacedByDocument)) && (
                        <Alert
                            style={{ marginBottom: 16 }}
                            type={document.isReplaced ? "warning" : "info"}
                            showIcon
                            message="Document Replacement Information"
                            description={
                                <div>
                                    {/* Case 1: This document replaces another document */}
                                    {document.replacementDocument && (
                                        <div style={{ marginBottom: document.isReplaced ? 12 : 0 }}>
                                            <Text strong>This document replaces:</Text>
                                            <div style={{ marginLeft: 12, marginTop: 4, padding: 8, backgroundColor: '#f0f8ff', borderRadius: 4 }}>
                                                <Text strong>{document.replacementDocument.title || 'Untitled Document'}</Text>
                                                <br />
                                                <Text style={{ fontSize: '12px', color: '#666' }}>
                                                    Original ID: <span style={{ fontFamily: 'monospace' }}>{document.replacementDocument.id}</span>
                                                </Text>
                                                {document.replacementDocument.createdTime && (
                                                    <>
                                                        <br />
                                                        <Text style={{ fontSize: '12px', color: '#666' }}>
                                                            Created: {new Date(document.replacementDocument.createdTime).toLocaleDateString('en-US')}
                                                        </Text>
                                                    </>
                                                )}
                                                {document.replacementDocument.documentTypeName && (
                                                    <>
                                                        <br />
                                                        <Text style={{ fontSize: '12px', color: '#666' }}>
                                                            Type: {document.replacementDocument.documentTypeName}
                                                        </Text>
                                                    </>
                                                )}
                                                <br />
                                                <Button
                                                    type="link"
                                                    size="small"
                                                    onClick={() => navigate(`/document/${document.replacementDocument.id}`)}
                                                    style={{ padding: 0, height: 'auto', marginTop: 2 }}
                                                >
                                                    View Original Document →
                                                </Button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Case 2: This document is replaced by another document */}
                                    {document.isReplaced && document.replacedByDocument && (
                                        <div>
                                            <Text strong>This document has been replaced by:</Text>
                                            <div style={{ marginLeft: 12, marginTop: 4, padding: 8, backgroundColor: '#fff7e6', borderRadius: 4 }}>
                                                <Text strong>{document.replacedByDocument.title || 'Untitled Document'}</Text>
                                                <br />
                                                <Text style={{ fontSize: '12px', color: '#666' }}>
                                                    Replacement ID: <span style={{ fontFamily: 'monospace' }}>{document.replacedByDocument.id}</span>
                                                </Text>
                                                {document.replacedByDocument.createdTime && (
                                                    <>
                                                        <br />
                                                        <Text style={{ fontSize: '12px', color: '#666' }}>
                                                            Created: {new Date(document.replacedByDocument.createdTime).toLocaleDateString('en-US')}
                                                        </Text>
                                                    </>
                                                )}
                                                {document.replacedByDocument.documentTypeName && (
                                                    <>
                                                        <br />
                                                        <Text style={{ fontSize: '12px', color: '#666' }}>
                                                            Type: {document.replacedByDocument.documentTypeName}
                                                        </Text>
                                                    </>
                                                )}
                                                <br />
                                              
                                            </div>
                                        </div>
                                    )}
                                </div>
                            }
                        />
                    )}
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
                                        {/* Thêm thông tin tổng quan */}
                                        <div style={{ marginTop: 12 }}>
                                            <Text strong>Tóm tắt:</Text>
                                            <div
                                                style={{ background: "#f6f8fa", padding: 12, borderRadius: 6, marginTop: 4 }}
                                                dangerouslySetInnerHTML={{ __html: document.summary }}
                                            />
                                        </div>
                                        <div style={{ marginTop: 12 }}>
                                            <Text strong>Tên file:</Text> <Text>{document.fileName}</Text>
                                            <br />
                                            <Text strong>Kích thước:</Text> <Text>{(document.fileSize / 1024).toFixed(1)} KB</Text>
                                            <br />
                                            <Text strong>Loại file:</Text> <Text>{document.fileType}</Text>
                                            <br />
                                            <Text strong>Loại tài liệu:</Text> <Tag color="purple">{document.documentTypeName}</Tag>
                                            <br />
                                            <Text strong>Quyền truy cập:</Text> <Tag color={document.isPublic ? "green" : "red"}>{document.isPublic ? "Công khai" : "Riêng tư"}</Tag>
                                            <br />
                                            <Text strong>Người ký:</Text> <Text>{document.signedBy || "Chưa có"}</Text>
                                            <br />
                                            <Text strong>Hiệu lực:</Text>{" "}
                                            <Text>
                                                {formatDate(document.effectiveFrom)} - {formatDate(document.effectiveUntil)}
                                            </Text>
                                            <br />
                                            <Text strong>Trạng thái:</Text> <Tag color="orange">{document.status}</Tag>
                                            <br />
                                            <Text strong>Tags:</Text>{" "}
                                            {document.tags?.map((tag: string) => (
                                                <Tag key={tag}>{tag}</Tag>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <Row gutter={16} style={{ marginBottom: 16 }}>
                                    <Col span={12}>
                                        <div>
                                            <Text strong>Chủ sở hữu</Text>
                                            <div style={{ display: "flex", alignItems: "center", marginTop: 4 }}>
                                                <UserOutlined style={{ marginRight: 4, color: "#666" }} />
                                                <Text>{document.ownerName || document.ownerId}</Text>
                                            </div>
                                        </div>
                                    </Col>
                                    <Col span={12}>
                                        <div>
                                            <Text strong>Phòng ban</Text>
                                            <div style={{ marginTop: 4 }}>
                                                <Tag color="blue">{document.departmentName || document.departmentId}</Tag>
                                            </div>
                                        </div>
                                    </Col>
                                </Row>

                                <Row gutter={16} style={{ marginBottom: 16 }}>
                                    <Col span={12}>
                                        <div>
                                            <Text strong>Người nộp</Text>
                                            <div style={{ display: "flex", alignItems: "center", marginTop: 4 }}>
                                                <UserOutlined style={{ marginRight: 4, color: "#666" }} />
                                                <Text>{document.submittedByName || document.submittedBy}</Text>
                                            </div>
                                        </div>
                                    </Col>
                                    <Col span={12}>
                                        <div>
                                            <Text strong>Ngày tạo</Text>
                                            <div style={{ display: "flex", alignItems: "center", marginTop: 4 }}>
                                                <CalendarOutlined style={{ marginRight: 4, color: "#666" }} />
                                                <Text>{formatDate(document.createdTime)}</Text>
                                            </div>
                                        </div>
                                    </Col>
                                </Row>

                                <Row gutter={16} style={{ marginBottom: 16 }}>
                                    <Col span={12}>
                                        <div>
                                            <Text strong>Ngày nộp</Text>
                                            <div style={{ display: "flex", alignItems: "center", marginTop: 4 }}>
                                                <CalendarOutlined style={{ marginRight: 4, color: "#666" }} />
                                                <Text>{formatDate(document.lastSubmitted)}</Text>
                                            </div>
                                        </div>
                                    </Col>
                                    <Col span={12}>
                                        <div>
                                            <Text strong>Phiên bản</Text>
                                            <div style={{ marginTop: 4 }}>
                                                <Tag color="geekblue">{document.versionName}</Tag>
                                            </div>
                                        </div>
                                    </Col>
                                </Row>

                                {/* Folder Information */}
                                {(document.folderName || document.targetFolderName) && (
                                    <Row gutter={16}>
                                        {document.folderName && (
                                            <Col span={12}>
                                                <div>
                                                    <Text strong>Thư mục hiện tại</Text>
                                                    <div style={{ display: "flex", alignItems: "center", marginTop: 4 }}>
                                                        <FolderOutlined style={{ marginRight: 4, color: "#666" }} />
                                                        <Text>{document.folderName}</Text>
                                                    </div>
                                                </div>
                                            </Col>
                                        )}
                                        {document.targetFolderName && (
                                            <Col span={12}>
                                                <div>
                                                    <Text strong>Thư mục đích</Text>
                                                    <div style={{ display: "flex", alignItems: "center", marginTop: 4 }}>
                                                        <FolderOutlined style={{ marginRight: 4, color: "#1890ff" }} />
                                                        <Text style={{ color: "#1890ff" }}>{document.targetFolderName}</Text>
                                                    </div>
                                                    <Text type="secondary" style={{ fontSize: '12px' }}>
                                                        Tài liệu sẽ được chuyển đến đây khi được duyệt
                                                    </Text>
                                                </div>
                                            </Col>
                                        )}
                                    </Row>
                                )}
                            </Card>

                            {/* Document Content */}
                            <Card>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                                    <Title level={4} style={{ margin: 0 }}>
                                        Document Content
                                    </Title>
                                    <Button
                                        icon={<EyeOutlined />}
                                        onClick={handlePreview}
                                        disabled={!document.versionId}
                                        loading={previewLoading}
                                    >
                                        {previewLoading ? "Loading Preview..." : "Preview File"}
                                    </Button>
                                </div>
                                <div style={{ backgroundColor: "#f5f5f5", padding: 16, borderRadius: 6 }}>
                                    <Paragraph>{document.description}</Paragraph>
                                </div>
                            </Card>
                        </Col>

                        {/* Right Column - Review Actions - Only show for Pending documents */}
                        <Col xs={24} lg={8}>
                            {document.status === "Pending" ? (
                                <Card>
                                    <Title level={4} style={{ marginBottom: 16 }}>
                                        Review Actions
                                    </Title>
                                    <Text type="secondary" style={{ display: "block", marginBottom: 16 }}>
                                        Please provide your review comments (required for rejection; optional for approval)
                                    </Text>
                                    <div style={{ marginBottom: 16 }}>
                                        <Text strong>Target Folder (optional)</Text>
                                        <FolderSelectorInput
                                            selectedFolderId={targetFolderId}
                                            onFolderSelect={setTargetFolderId}
                                            placeholder="Select target folder after approval (optional)"
                                            allowClear={true}
                                            filterPermission="write"
                                            treeType={document.isPublic ? 'public' : 'department'}
                                        />
                                    </div>
                                    <div style={{ marginBottom: 16 }}>
                                        <Text strong>Comments *</Text>
                                        <TextArea
                                            rows={4}
                                            placeholder="Please provide detailed feedback (minimum 10 characters)"
                                            value={rejectionComments}
                                            onChange={(e) => setRejectionComments(e.target.value)}
                                            style={{ marginTop: 8 }}
                                        />
                                        <Text type="secondary" style={{ fontSize: "12px" }}>
                                            {rejectionComments.length}/10 characters minimum for rejection
                                        </Text>
                                    </div>
                                    <Space direction="vertical" style={{ width: "100%" }}>
                                        <Button type="primary" icon={<CheckOutlined />} block size="large" loading={submitting} onClick={() => handleReview(true)}>
                                            Approve Document
                                        </Button>
                                        <Button danger icon={<CloseOutlined />} block size="large" loading={submitting} onClick={() => handleReview(false)} disabled={rejectionComments.length < 10}>
                                            Reject Document
                                        </Button>
                                    </Space>

                                    {/* Public Folder Tree for Public Documents */}
                                    {document.isPublic && (
                                        <div style={{ marginTop: 24 }}>
                                            <Button
                                                icon={<FolderOpenOutlined />}
                                                onClick={() => setShowFolderTree(!showFolderTree)}
                                                type={showFolderTree ? 'primary' : 'default'}
                                                style={{ width: "100%", marginBottom: 16 }}
                                            >
                                                {showFolderTree ? 'Hide Public Folders' : 'Show Public Folders'}
                                            </Button>
                                            {showFolderTree && (
                                                <Card size="small" title="Public Folder Navigation">
                                                    {folderLoading ? (
                                                        <Spin />
                                                    ) : (
                                                        <>
                                                            {targetFolderId && (
                                                                <div style={{ marginBottom: 12 }}>
                                                                    <FolderBreadcrumb
                                                                        folderId={targetFolderId}
                                                                        folders={folders}
                                                                        onFolderClick={handleFolderNavigation}
                                                                    />
                                                                </div>
                                                            )}
                                                            <FolderTree
                                                                folders={folders}
                                                                selectedFolderId={targetFolderId}
                                                                onFolderSelect={handleFolderSelect}
                                                                allowSelection={true}
                                                                showContextMenu={false}
                                                                className="max-h-64 overflow-auto"
                                                            />
                                                        </>
                                                    )}
                                                </Card>
                                            )}
                                        </div>
                                    )}
                                </Card>
                            ) : (
                                /* Document Status Info Card - For non-pending documents */
                                <Card>
                                    <Title level={4} style={{ marginBottom: 16 }}>
                                        Document Status
                                    </Title>
                                    <div style={{ textAlign: 'center', padding: '24px 0' }}>
                                        <Tag 
                                            color={
                                                document.status === 'Approved' ? 'green' : 
                                                document.status === 'Rejected' ? 'red' : 
                                                document.status === 'Draft' ? 'blue' : 'default'
                                            }
                                            style={{ fontSize: '14px', padding: '8px 16px' }}
                                        >
                                            {document.status}
                                        </Tag>
                                        <div style={{ marginTop: 16 }}>
                                            <Text type="secondary">
                                                {document.status === 'Approved' && 'This document has already been approved.'}
                                                {document.status === 'Rejected' && 'This document has been rejected.'}
                                                {document.status === 'Draft' && 'This document is still in draft status.'}
                                                {!['Approved', 'Rejected', 'Draft', 'Pending'].includes(document.status) && 
                                                 'This document is not available for review.'}
                                            </Text>
                                        </div>
                                        {document.status === 'Approved' && (
                                            <div style={{ marginTop: 12 }}>
                                                <Text strong>Approved on:</Text>
                                                <br />
                                                <Text>{formatDate(document.lastSubmitted)}</Text>
                                            </div>
                                        )}
                                        {document.status === 'Rejected' && (
                                            <div style={{ marginTop: 12 }}>
                                                <Text strong>Rejected on:</Text>
                                                <br />
                                                <Text>{formatDate(document.lastSubmitted)}</Text>
                                            </div>
                                        )}
                                    </div>
                                    
                                    {/* Action buttons for non-pending documents */}
                                    <Space direction="vertical" style={{ width: "100%", marginTop: 16 }}>
                                        <Button 
                                            icon={<EyeOutlined />}
                                            onClick={handlePreview}
                                            disabled={!document.versionId}
                                            loading={previewLoading}
                                            block
                                        >
                                            {previewLoading ? "Loading Preview..." : "Preview Document"}
                                        </Button>
                                        <Button 
                                            icon={<ArrowLeftOutlined />}
                                            onClick={() => navigate(-1)}
                                            block
                                        >
                                            Back to Queue
                                        </Button>
                                    </Space>
                                </Card>
                            )}

                            {/* Review Guidelines Card - Always show but with different content */}
                            <Card style={{ marginTop: 16 }}>
                                <Title level={5} style={{ marginBottom: 12 }}>
                                    {document.status === "Pending" ? "Review Guidelines" : "Document Information"}
                                </Title>
                                <ul style={{ paddingLeft: 16, margin: 0 }}>
                                    {document.status === "Pending" ? (
                                        /* Guidelines for pending documents */
                                        <>
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
                                            {document.replacementDocument && (
                                                <li style={{ marginBottom: 8 }}>
                                                    <Text type="secondary" style={{ fontSize: "12px" }}>
                                                        Approving this document will replace the original document in the system
                                                    </Text>
                                                </li>
                                            )}
                                            {document.isReplaced && (
                                                <li style={{ marginBottom: 8 }}>
                                                    <Text type="secondary" style={{ fontSize: "12px" }}>
                                                        This document has been superseded - consider if approval is still needed
                                                    </Text>
                                                </li>
                                            )}
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
                                        </>
                                    ) : (
                                        /* Information for non-pending documents */
                                        <>
                                            <li style={{ marginBottom: 8 }}>
                                                <Text type="secondary" style={{ fontSize: "12px" }}>
                                                    Document Type: <Text strong>{document.documentTypeName}</Text>
                                                </Text>
                                            </li>
                                            <li style={{ marginBottom: 8 }}>
                                                <Text type="secondary" style={{ fontSize: "12px" }}>
                                                    File Size: <Text strong>{(document.fileSize / 1024).toFixed(1)} KB</Text>
                                                </Text>
                                            </li>
                                            <li style={{ marginBottom: 8 }}>
                                                <Text type="secondary" style={{ fontSize: "12px" }}>
                                                    File Type: <Text strong>{document.fileType}</Text>
                                                </Text>
                                            </li>
                                            <li style={{ marginBottom: 8 }}>
                                                <Text type="secondary" style={{ fontSize: "12px" }}>
                                                    Visibility: <Text strong>{document.isPublic ? "Public" : "Private"}</Text>
                                                </Text>
                                            </li>
                                            <li>
                                                <Text type="secondary" style={{ fontSize: "12px" }}>
                                                    Version: <Text strong>{document.versionName}</Text>
                                                </Text>
                                            </li>
                                        </>
                                    )}
                                </ul>
                            </Card>
                        </Col>
                    </Row>
                </div>
            </Content>

            {/* Document Preview Modal */}
            <Modal
                title={
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <FileTextOutlined style={{ marginRight: 8 }} />
                        Document Preview - {document?.fileName}
                    </div>
                }
                open={previewVisible}
                onCancel={handleClosePreview}
                footer={[
                    <Button key="close" onClick={handleClosePreview}>
                        Close
                    </Button>
                ]}
                width="90%"
                style={{ top: 20 }}
                bodyStyle={{ padding: 0, height: '80vh' }}
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

        </Layout>
    )
}
