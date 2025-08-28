import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Layout, Typography, Card, Button, Tag, Row, Col, Spin, Divider, Badge, Alert, Modal } from "antd"
import {
    ArrowLeftOutlined,
    FileTextOutlined,
    UserOutlined,
    CalendarOutlined,
    FileOutlined,
    TeamOutlined, 
    EyeOutlined,
    EditOutlined,
    GlobalOutlined,
    LockOutlined,
    DeleteOutlined,
    FolderOutlined,
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
    const [submitting, setSubmitting] = useState(false);
    const [previewVisible, setPreviewVisible] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string>("");
    const [previewLoading, setPreviewLoading] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);

    const fetchDocument = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/document/documents/${id}/versions/${versionId}`);
            setDocument(res.data.data);
        } catch (error: any) {
            toast.error(`Unable to load document details: ${error?.response?.data?.message || error.message}`);
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
        if (!dateStr || dateStr.startsWith('0001-01-01')) return 'N/A';
        return new Date(dateStr).toLocaleString('en-US');
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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

    const handleSubmitForApproval = async () => {
        if (!document?.versionId) {
            toast.error("Version ID not found!");
            return;
        }
        const userStr = localStorage.getItem("user");
        if (!userStr) {

            return;
        }
        /* const user = JSON.parse(userStr); */

        setSubmitting(true);
        try {
            // Use folder-approval submit; attempt to include current folderId if present on document
            const targetFolderId = document.folderId || document.currentFolderId || undefined;
            const url = targetFolderId
                ? `/document/folder-approval/${document.versionId}/submit${targetFolderId ? `?targetFolderId=${encodeURIComponent(targetFolderId)}` : ''}`
                : `/document/folder-approval/${document.versionId}/submit`;
            await api.post(url);
            toast.success("Document submitted for approval successfully!");
            await fetchDocument();
        } catch (error: any) {
            toast.error(`Failed to submit document: ${error?.response?.data?.message || error.message}`);
        } finally {
            setSubmitting(false);
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

    const handleDeleteDraft = async () => {
        setDeleteLoading(true);
        try {
            console.log(`Deleting document: ${document.documentId}, version: ${document.versionId}`);

            const response = await api.delete(`/document/drafts/${document.documentId}?versionId=${document.versionId}`);
            console.log('Delete response:', response);

            toast.success("Document draft deleted successfully!");

            // Navigate back to queue or previous page
            setTimeout(() => {
                if (onViewChange) {
                    onViewChange("queue");
                } else {
                    navigate(-1);
                }
            }, 1500);
        } catch (error: any) {
            console.error('Delete failed:', error);
            const errorMessage = error?.response?.data?.message || error.message;
            toast.error(`Failed to delete document: ${errorMessage}`);
        } finally {
            setDeleteLoading(false);
        }
    };

    // Alternative method using custom modal
    const handleDeleteDraftAlternative = () => {
        if (!document?.documentId || !document?.versionId) {
            toast.error("Document ID or Version ID not found!");
            return;
        }

        // if (document.status?.toLowerCase() !== 'draft') {
        //     toast.error("Only documents in Draft status can be deleted!");
        //     return;
        // }

        setDeleteModalVisible(true);
    };

    const confirmDelete = async () => {
        setDeleteModalVisible(false);
        await handleDeleteDraft();
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
                            disabled={submitting || deleteLoading}
                        >
                            Back
                        </Button>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Title level={2} style={{ margin: 0 }}>
                                Document Details
                            </Title>
                            <div>
                                {document.isPublic ? (
                                    <Tag icon={<GlobalOutlined />} color="green">Public</Tag>
                                ) : (
                                    <Tag icon={<LockOutlined />} color="orange">Private</Tag>
                                )}
                                <Tag color={getStatusColor(document.status)}>{document.status}</Tag>
                            </div>
                        </div>
                    </div>

                    {/* Replacement Document Alert - Updated to show both cases */}
                    {(document.replacementDocument || (document.isReplaced && document.replacedByDocument)) && (
                        <div style={{ marginBottom: 24 }}>
                            {/* Case 1: This document replaces another document */}
                            {document.replacementDocument && (
                                <Alert
                                    message="Document Replacement"
                                    description={
                                        <div>
                                            <div style={{ marginBottom: 8 }}>
                                                This document replaces: <strong>{document.replacementDocument.title || 'Untitled Document'}</strong>
                                            </div>
                                            <div style={{ fontSize: '12px', color: '#666', marginBottom: 8 }}>
                                                <div>Original Document ID: <span style={{ fontFamily: 'monospace' }}>{document.replacementDocument.id}</span></div>
                                                {document.replacementDocument.createdTime && (
                                                    <div>Created: {new Date(document.replacementDocument.createdTime).toLocaleDateString('en-US')}</div>
                                                )}
                                                {document.replacementDocument.documentTypeName && (
                                                    <div>Type: {document.replacementDocument.documentTypeName}</div>
                                                )}
                                            </div>

                                        </div>
                                    }
                                    type="info"
                                    showIcon
                                    style={{ marginBottom: 16 }}
                                />
                            )}

                            {/* Case 2: This document is replaced by another document */}
                            {document.isReplaced && document.replacedByDocument && (
                                <Alert
                                    message="Document Status"
                                    description={
                                        <div>
                                            <div style={{ marginBottom: 8 }}>
                                                This document has been replaced by: <strong>{document.replacedByDocument.title || 'Untitled Document'}</strong>
                                            </div>
                                            <div style={{ fontSize: '12px', color: '#666', marginBottom: 8 }}>
                                                <div>Replacement Document ID: <span style={{ fontFamily: 'monospace' }}>{document.replacedByDocument.id}</span></div>
                                                {document.replacedByDocument.createdTime && (
                                                    <div>Created: {new Date(document.replacedByDocument.createdTime).toLocaleDateString('en-US')}</div>
                                                )}
                                                {document.replacedByDocument.documentTypeName && (
                                                    <div>Type: {document.replacedByDocument.documentTypeName}</div>
                                                )}
                                            </div>

                                        </div>
                                    }
                                    type="warning"
                                    showIcon
                                    style={{ marginBottom: 16 }}
                                />
                            )}
                        </div>
                    )}

                    {/* Basic Information Card */}
                    <Card title="Basic Information" style={{ marginBottom: 24 }}>
                        <Row gutter={[16, 16]}>
                            <Col xs={24} sm={12} md={8}>
                                <Text strong>Document ID:</Text>
                                <br />
                                <Text copyable>{document.documentId}</Text>
                            </Col>
                            <Col xs={24} sm={12} md={8}>
                                <Text strong>Version ID:</Text>
                                <br />
                                <Text copyable>{document.versionId}</Text>
                            </Col>
                            <Col xs={24} sm={12} md={8}>
                                <Text strong>Version Name:</Text>
                                <br />
                                <Text copyable>{document.versionName}</Text>
                            </Col>
                            <Col xs={24} sm={12} md={8}>
                                <Text strong>Document Type:</Text>
                                <br />
                                <Tag color="blue">{document.documentTypeName}</Tag>
                            </Col>
                            <Col xs={24} sm={12} md={8}>
                                <Text strong>Department:</Text>
                                <br />
                                <Tag icon={<TeamOutlined />} color="purple">{document.departmentName}</Tag>
                            </Col>
                            <Col xs={24} sm={12} md={8}>
                                <Text strong>Owner:</Text>
                                <br />
                                <Text><UserOutlined /> {document.ownerName}</Text>
                            </Col>
                        </Row>

                        <Divider />

                        {/* File Information */}
                        <Row gutter={[16, 16]}>
                            <Col xs={24} sm={12} md={8}>
                                <Text strong>File Name:</Text>
                                <br />
                                <Text><FileOutlined /> {document.fileName}</Text>
                            </Col>
                            <Col xs={24} sm={12} md={8}>
                                <Text strong>File Type:</Text>
                                <br />
                                <Tag>{document.fileType}</Tag>
                            </Col>
                            <Col xs={24} sm={12} md={8}>
                                <Text strong>File Size:</Text>
                                <br />
                                <Text>{formatFileSize(document.fileSize)}</Text>
                            </Col>
                            <Col xs={24}>
                                <Button
                                    icon={<EyeOutlined />}
                                    onClick={handlePreview}
                                    disabled={!document.versionId}
                                    loading={previewLoading}
                                >
                                    {previewLoading ? "Loading Preview..." : "Preview File"}
                                </Button>
                            </Col>
                        </Row>

                        {/* Folder Information */}
                        {(document.folderName || document.targetFolderName) && (
                            <>
                                <Divider />
                                <Row gutter={[16, 16]}>
                                    {document.folderName && (
                                        <Col xs={24} sm={12} md={8}>
                                            <Text strong>Current Folder:</Text>
                                            <br />
                                            <Text><FolderOutlined /> {document.folderName}</Text>
                                        </Col>
                                    )}
                                    {document.targetFolderName && (
                                        <Col xs={24} sm={12} md={8}>
                                            <Text strong>Target Folder:</Text>
                                            <br />
                                            <Text><FolderOutlined /> {document.targetFolderName}</Text>
                                            <br />
                                            <Text type="secondary" style={{ fontSize: '12px' }}>
                                                Document will be moved here upon approval
                                            </Text>
                                        </Col>
                                    )}
                                </Row>
                            </>
                        )}

                        <Divider />

                        {/* Date Information */}
                        <Row gutter={[16, 16]}>
                            <Col xs={24} sm={12} md={8}>
                                <Text strong>Created Time:</Text>
                                <br />
                                <Text><CalendarOutlined /> {formatDate(document.createdTime)}</Text>
                            </Col>
                            <Col xs={24} sm={12} md={8}>
                                <Text strong>Last Submitted:</Text>
                                <br />
                                <Text><CalendarOutlined /> {formatDate(document.lastSubmitted)}</Text>
                            </Col>
                            <Col xs={24} sm={12} md={8}>
                                <Text strong>Submitted By:</Text>
                                <br />
                                <Text><UserOutlined /> {document.submittedByName || 'N/A'}</Text>
                            </Col>
                        </Row>

                        {/* Effective Date Information */}
                        {(document.effectiveFrom || document.effectiveUntil) && (
                            <>
                                <Divider />
                                <Row gutter={[16, 16]}>
                                    <Col xs={24} sm={12} md={8}>
                                        <Text strong>Effective From:</Text>
                                        <br />
                                        <Text>{formatDate(document.effectiveFrom)}</Text>
                                    </Col>
                                    <Col xs={24} sm={12} md={8}>
                                        <Text strong>Effective Until:</Text>
                                        <br />
                                        <Text>{formatDate(document.effectiveUntil)}</Text>
                                    </Col>
                                    <Col xs={24} sm={12} md={8}>
                                        <Text strong>Signed By:</Text>
                                        <br />
                                        <Text><EditOutlined /> {document.signedBy || 'N/A'}</Text>
                                    </Col>
                                </Row>
                            </>
                        )}

                        {/* Tags */}
                        {document.tags && document.tags.length > 0 && (
                            <>
                                <Divider />
                                <Row>
                                    <Col span={24}>
                                        <Text strong>Tags:</Text>
                                        <br />
                                        <div style={{ marginTop: 8 }}>
                                            {document.tags.map((tag: string, index: number) => (
                                                <Tag key={index} color="geekblue">{tag}</Tag>
                                            ))}
                                        </div>
                                    </Col>
                                </Row>
                            </>
                        )}
                    </Card>

                    <Row gutter={24}>
                        {/* Left Column - Document Content */}
                        <Col xs={24} lg={16}>
                            {/* Document Title and Summary */}
                            <Card style={{ marginBottom: 24 }}>
                                <div style={{ display: "flex", alignItems: "flex-start", marginBottom: 16 }}>
                                    <FileTextOutlined style={{ fontSize: 24, marginRight: 12, marginTop: 4, color: "#1890ff" }} />
                                    <div style={{ flex: 1 }}>
                                        <Title level={3} style={{ margin: 0, marginBottom: 16 }}>
                                            {document.title}
                                        </Title>
                                        {document.summary && (
                                            <div style={{
                                                backgroundColor: "#f6f8fa",
                                                padding: 16,
                                                borderRadius: 6,
                                                border: "1px solid #e1e4e8"
                                            }}>
                                                <Text strong style={{ marginBottom: 8, display: 'block' }}>Summary:</Text>
                                                <div
                                                    className="document-summary"
                                                    style={{
                                                        fontSize: 14,
                                                        lineHeight: '1.6',
                                                        maxHeight: '400px',
                                                        overflowY: 'auto'
                                                    }}
                                                    dangerouslySetInnerHTML={{ __html: document.summary }}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </Card>

                            {/* Document Description */}
                            <Card>
                                <Title level={4} style={{ marginBottom: 16 }}>
                                    <FileTextOutlined /> Document Description
                                </Title>
                                <div style={{
                                    backgroundColor: "#f5f5f5",
                                    padding: 16,
                                    borderRadius: 6,
                                    minHeight: 120
                                }}>
                                    <Paragraph style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                                        {document.description || 'No description available.'}
                                    </Paragraph>
                                </div>
                            </Card>
                        </Col>

                        {/* Right Column - Actions */}
                        <Col xs={24} lg={8}>
                            <Card title="Actions" style={{ marginBottom: 24 }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                    {document.status === 'Draft' && (
                                        <>
                                            <Button
                                                type="primary"
                                                onClick={handleSubmitForApproval}
                                                block
                                                loading={submitting}
                                                disabled={submitting || deleteLoading}
                                                size="large"
                                            >
                                                Submit for Approval
                                            </Button>

                                            <Button
                                                type="default"

                                                block
                                                size="large"
                                                onClick={() => {
                                                    // Prepare document data for recreation
                                                    const documentData = {
                                                        title: document.title || "",
                                                        description: document.description || "",
                                                        summary: document.summary || "",
                                                        tags: document.tags || [],
                                                        effectiveFrom: document.effectiveFrom || "",
                                                        effectiveUntil: document.effectiveUntil || "",
                                                        signedBy: document.signedBy || "",
                                                        documentTypeId: document.documentTypeId || "",
                                                        isPublic: document.isPublic || false,
                                                        versionName: document.versionName || "",
                                                    };

                                                    navigate(`/editor/document/editDocument/${document.versionId}`, {
                                                        state: {
                                                            documentData,
                                                            mode: 'edit'
                                                        }
                                                    });
                                                }}
                                                disabled={submitting || deleteLoading}
                                            >
                                                Edit Draft
                                            </Button>

                                            {/* Alternative Delete Button */}
                                            <Button
                                                type="dashed"
                                                danger
                                                icon={<DeleteOutlined />}
                                                onClick={handleDeleteDraftAlternative}
                                                block
                                                loading={deleteLoading}
                                                disabled={submitting || deleteLoading}
                                                size="large"
                                            >
                                                Delete Draft
                                            </Button>
                                        </>
                                    )}

                                    {document.status === 'Rejected' && (
                                        <>
                                            <Button
                                                type="primary"
                                                danger
                                                block
                                                size="large"
                                                onClick={() => {
                                                    // Prepare document data for recreation
                                                    const documentData = {
                                                        title: document.title || "",
                                                        description: document.description || "",
                                                        summary: document.summary || "",
                                                        tags: document.tags || [],
                                                        effectiveFrom: document.effectiveFrom || "",
                                                        effectiveUntil: document.effectiveUntil || "",
                                                        signedBy: document.signedBy || "",
                                                        documentTypeId: document.documentTypeId || "",
                                                        isPublic: document.isPublic || false,
                                                        versionName: document.versionName || "",
                                                    };

                                                    navigate(`/editor/document/recreate/${document.versionId}`, {
                                                        state: {
                                                            documentData,
                                                            mode: 'recreate'
                                                        }
                                                    });
                                                }}
                                                disabled={submitting || deleteLoading}
                                            >
                                                Recreate Draft
                                            </Button>
                                            <Button
                                                type="dashed"
                                                danger
                                                icon={<DeleteOutlined />}
                                                onClick={handleDeleteDraftAlternative}
                                                block
                                                loading={deleteLoading}
                                                disabled={submitting || deleteLoading}
                                                size="large"
                                            >
                                                Delete
                                            </Button>
                                        </>
                                    )}

                                    {document.status === 'Approved' && (
                                        <Button
                                            type="default"
                                            block
                                            size="large"
                                            onClick={() => navigate(`/editor/document/new-version/${document.documentId}`)}
                                            disabled={submitting || deleteLoading}
                                        >
                                            Create New Version
                                        </Button>
                                    )}

                                    {document.status === 'Pending' && (
                                        <div style={{
                                            textAlign: 'center',
                                            padding: 16,
                                            backgroundColor: '#fff7e6',
                                            borderRadius: 6,
                                            border: '1px solid #ffd591'
                                        }}>
                                            <Badge status="processing" />
                                            <Text type="secondary" style={{ marginLeft: 8 }}>
                                                Document is pending approval
                                            </Text>
                                        </div>
                                    )}

                                    <Button
                                        icon={<EyeOutlined />}
                                        onClick={handlePreview}
                                        disabled={!document.versionId || deleteLoading}
                                        loading={previewLoading}
                                        block
                                    >
                                        {previewLoading ? "Loading..." : "Preview Document"}
                                    </Button>
                                </div>
                            </Card>

                            {/* Replacement Information */}
                            {document.replacementId && (
                                <Card title="Replacement Information" style={{ marginBottom: 24 }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                        <Text strong>Replacement ID:</Text>
                                        <Text copyable>{document.replacementId}</Text>

                                        {document.replacementDocumentName && (
                                            <>
                                                <Text strong style={{ marginTop: 8 }}>Replacement Document:</Text>
                                                <Text>{document.replacementDocumentName}</Text>
                                            </>
                                        )}

                                        <Text strong style={{ marginTop: 8 }}>Is Replaced:</Text>
                                        <Badge
                                            status={document.isReplaced ? "error" : "success"}
                                            text={document.isReplaced ? "Yes" : "No"}
                                        />
                                    </div>
                                </Card>
                            )}

                            {/* Document Statistics */}
                            <Card title="Statistics" size="small">
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Text>File Size:</Text>
                                        <Text strong>{formatFileSize(document.fileSize)}</Text>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Text>Tags Count:</Text>
                                        <Text strong>{document.tags?.length || 0}</Text>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Text>Visibility:</Text>
                                        <Text strong>{document.isPublic ? 'Public' : 'Private'}</Text>
                                    </div>
                                </div>
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
                    // sandbox="allow-scripts allow-same-origin"
                    />
                )}
            </Modal>

            {/* Custom Delete Confirmation Modal */}
            <Modal
                title="Confirm Document Deletion"
                open={deleteModalVisible}
                onOk={confirmDelete}
                onCancel={() => setDeleteModalVisible(false)}
                okText="Delete"
                cancelText="Cancel"
                okType="danger"
                confirmLoading={deleteLoading}
                width={500}
            >
                <div>
                    <p>Are you sure you want to delete this document draft?</p>
                    <p><strong>Document:</strong> {document?.title}</p>
                    <p><strong>File:</strong> {document?.fileName}</p>
                    <Alert
                        message="Warning"
                        description="This action cannot be undone!"
                        type="warning"
                        showIcon
                        style={{ marginTop: 16 }}
                    />
                </div>
            </Modal>
        </Layout>
    )
}
