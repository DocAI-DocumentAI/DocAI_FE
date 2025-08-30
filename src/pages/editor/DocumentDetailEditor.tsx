import { useState, useEffect, useCallback } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { Layout, Typography, Card, Button, Tag, Row, Col, Spin, Divider, Alert, Modal, Tabs } from "antd";
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
  DownloadOutlined,
  ClockCircleOutlined,
  LikeOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import { api } from "../../lib/api/api";
import { getDocumentRecommendations } from "../../lib/api/document";
import toast from "react-hot-toast";
import { DocumentChatBox } from "../../components/DocumentChatBox";
import { Link } from "react-router-dom";

const { Title, Text, Paragraph } = Typography;
const { Content } = Layout;
const { TabPane } = Tabs;

export default function DocumentDetailEditor() {
  const { id } = useParams();
  const location = useLocation();
  const urlParams = new URLSearchParams(location.search);
  const versionIdFromQuery = urlParams.get('versionId') || undefined;
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("1"); // 1: Preview, 2: Content, 3: Information, 4: Original, 5: Versions, 6: Recommendations
  const [versions, setVersions] = useState<any[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [previewLoading, setPreviewLoading] = useState(false);
  const [canPreview, setCanPreview] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    setActiveTab("1");
  }, [id]);




  const loadPreview = async (versionId: string) => {
    if (!versionId) return;

    setPreviewLoading(true);
    try {
      const response = await api.get(`/document/files/${versionId}/iframe-url`);
      const data = response.data.data;

      if (data.canViewInline && data.iframeUrl) {
        setPreviewUrl(data.iframeUrl);
        setCanPreview(true);
      } else {
        setCanPreview(false);
        toast.error("This file type cannot be previewed inline");
      }
    } catch (error: any) {
      console.error("Preview failed:", error);
      setCanPreview(false);
      toast.error(
        `Preview failed: ${error?.response?.data?.message || error.message}`
      );
    } finally {
      setPreviewLoading(false);
    }
  };

  const downloadFile = async (versionId: string) => {
    try {
      const response = await api.get(`/document/files/${versionId}/download`, {
        responseType: "blob",
      });

      if (typeof window === "undefined") return;

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;

      const contentDisposition = response.headers["content-disposition"];
      let filename = "download";

      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(
          /filename\*?=(?:UTF-8'')?(?:"?)([^";]+)(?:"?)/
        );
        if (filenameMatch) {
          filename = decodeURIComponent(filenameMatch[1]);
        }
      } else {
        if (mainDoc.fileName) {
          filename = mainDoc.fileName;
        } else {
          const contentType = response.headers["content-type"];
          let extension = "";
          if (contentType) {
            if (contentType.includes("pdf")) extension = ".pdf";
            else if (contentType.includes("wordprocessingml")) extension = ".docx";
            else if (contentType.includes("spreadsheetml")) extension = ".xlsx";
            else if (contentType.includes("presentationml")) extension = ".pptx";
            else if (contentType.includes("msword")) extension = ".doc";
            else if (contentType.includes("excel")) extension = ".xls";
            else if (contentType.includes("powerpoint")) extension = ".ppt";
          }
          filename = `${mainDoc.title || "document"}${extension}`;
        }
      }

      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success("File downloaded successfully");
    } catch (error) {
      console.error("Download failed:", error);
      toast.error("File download failed");
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr || dateStr.startsWith('0001-01-01')) return 'N/A';
    return new Date(dateStr).toLocaleString('en-US');
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "approved": return "green";
      case "pending": return "orange";
      case "rejected": return "red";
      case "draft": return "blue";
      default: return "default";
    }
  };

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api.get(`/document/documents/${id}/versions`).then(res => {
      const list = res.data.data || [];
      if (versionIdFromQuery) {
        const idx = list.findIndex((v: any) => v.versionId === versionIdFromQuery);
        if (idx > 0) {
          const [found] = list.splice(idx, 1);
          list.unshift(found);
        }
      }
      setVersions(list);
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });
  }, [id, versionIdFromQuery]);

  const mainDoc = versions[0] || {};

  const handlePreview = async () => {
    if (mainDoc.versionId && !previewUrl) {
      await loadPreview(mainDoc.versionId);
    }
    if (canPreview && previewUrl) {
      setPreviewVisible(true);
    }
  };

  const handleClosePreview = () => {
    setPreviewVisible(false);
  };

  const fetchRecommendations = useCallback(async () => {
    if (!id) return;

    setLoadingRecommendations(true);
    try {
      const response = await getDocumentRecommendations(id, 10, false);
      setRecommendations(response.data || []);
    } catch (error) {
      console.error("Failed to fetch recommendations:", error);
      toast.error("Failed to load recommendations");
      setRecommendations([]);
    } finally {
      setLoadingRecommendations(false);
    }
  }, [id]);

  useEffect(() => {
    if (id && mainDoc.documentId) {
      fetchRecommendations();
    }
  }, [id, mainDoc.documentId, fetchRecommendations]);

  useEffect(() => {
    if (location.state?.activeTab) {
      const tabMap: { [key: string]: string } = {
        "content": "1",
        "information": "2",
        "original": "3",
        "version": "4",
        "recommendations": "5"
      };
      setActiveTab(tabMap[location.state.activeTab] || "1");
    }
  }, [location.state]);

  if (loading) return <Spin style={{ margin: 40 }} />;
  if (!mainDoc) return <div>No document found</div>;

  return (
    <Layout style={{ minHeight: "100vh", backgroundColor: "#f5f5f5" }}>
      <Content style={{ padding: "24px" }}>
        <div style={{ margin: "0 auto" }}>
          {/* Header */}
          <div style={{ marginBottom: 24 }}>
            <Button
              type="text"
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate(-1)}
              style={{ marginBottom: 16 }}
            >
              Back
            </Button>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Title level={2} style={{ margin: 0 }}>
                {mainDoc.title || "No title"}
              </Title>
              <div>
                {mainDoc.isPublic ? (
                  <Tag icon={<GlobalOutlined />} color="green">Public</Tag>
                ) : (
                  <Tag icon={<LockOutlined />} color="orange">Private</Tag>
                )}
                <Tag color={getStatusColor(mainDoc.status)}>{mainDoc.status}</Tag>
                {mainDoc.isReplaced && (
                  <Tag color="red">Replaced</Tag>
                )}
              </div>
            </div>
          </div>

          {/* Replacement Document Alert */}
          {(mainDoc.replacementDocument || (mainDoc.isReplaced && mainDoc.replacedByDocument)) && (
            <div style={{ marginBottom: 24 }}>
              {mainDoc.replacementDocument && (
                <Alert
                  message="Document Replacement"
                  description={
                    <div>
                      <div style={{ marginBottom: 8 }}>
                        This document replaces: <strong>{
                          <Link to={`/editor/doc/${mainDoc.replacementDocument.id}`}>
                            {mainDoc.replacementDocument.title}
                          </Link>}</strong>
                      </div>
                      <div style={{ fontSize: '12px', color: '#666', marginBottom: 8 }}>
                        <div>Original Document ID: <span style={{ fontFamily: 'monospace' }}>{mainDoc.replacementDocument.id}</span></div>
                        {mainDoc.replacementDocument.createdTime && (
                          <div>Created: {new Date(mainDoc.replacementDocument.createdTime).toLocaleDateString('en-US')}</div>
                        )}
                        {mainDoc.replacementDocument.documentTypeName && (
                          <div>Type: {mainDoc.replacementDocument.documentTypeName}</div>
                        )}
                      </div>
                    </div>
                  }
                  type="info"
                  showIcon
                  style={{ marginBottom: 16 }}
                />
              )}

              {mainDoc.isReplaced && mainDoc.replacedByDocument && (
                <Alert
                  message="Document Status"
                  description={
                    <div>
                      <div style={{ marginBottom: 8 }}>
                        This document has been replaced by: <strong>
                          <Link to={`/editor/doc/${mainDoc.replacedByDocument.id}`}>
                            {mainDoc.replacedByDocument.title}
                          </Link>
                        </strong>
                      </div>
                      <div style={{ fontSize: '12px', color: '#666', marginBottom: 8 }}>
                        <div>Replacement Document ID: <span style={{ fontFamily: 'monospace' }}>{mainDoc.replacedByDocument.id}</span></div>
                        {mainDoc.replacedByDocument.createdTime && (
                          <div>Created: {new Date(mainDoc.replacedByDocument.createdTime).toLocaleDateString('en-US')}</div>
                        )}
                        {mainDoc.replacedByDocument.documentTypeName && (
                          <div>Type: {mainDoc.replacedByDocument.documentTypeName}</div>
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
                <Text copyable>{mainDoc.documentId}</Text>
              </Col>
              <Col xs={24} sm={12} md={8}>
                <Text strong>Version ID:</Text>
                <br />
                <Text copyable>{mainDoc.versionId}</Text>
              </Col>
              <Col xs={24} sm={12} md={8}>
                <Text strong>Version Name:</Text>
                <br />
                <Text>{mainDoc.versionName || "N/A"}</Text>
              </Col>
              <Col xs={24} sm={12} md={8}>
                <Text strong>Document Type:</Text>
                <br />
                <Tag color="blue">{mainDoc.documentTypeName || "N/A"}</Tag>
              </Col>
              <Col xs={24} sm={12} md={8}>
                <Text strong>Department:</Text>
                <br />
                <Tag icon={<TeamOutlined />} color="purple">{mainDoc.departmentName || "N/A"}</Tag>
              </Col>
              <Col xs={24} sm={12} md={8}>
                <Text strong>Owner:</Text>
                <br />
                <Text><UserOutlined /> {mainDoc.ownerName || "N/A"}</Text>
              </Col>
            </Row>

            <Divider />

            {/* File Information */}
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} md={8}>
                <Text strong>File Name:</Text>
                <br />
                <Text><FileOutlined /> {mainDoc.fileName || "N/A"}</Text>
              </Col>
              <Col xs={24} sm={12} md={8}>
                <Text strong>File Type:</Text>
                <br />
                <Tag>{mainDoc.fileType || "N/A"}</Tag>
              </Col>
              <Col xs={24} sm={12} md={8}>
                <Text strong>File Size:</Text>
                <br />
                <Text>{mainDoc.fileSize ? formatFileSize(mainDoc.fileSize) : "N/A"}</Text>
              </Col>
            </Row>

            <Divider />

            {/* Date Information */}
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} md={8}>
                <Text strong>Created Time:</Text>
                <br />
                <Text><CalendarOutlined /> {formatDate(mainDoc.createdTime)}</Text>
              </Col>
              <Col xs={24} sm={12} md={8}>
                <Text strong>Last Submitted:</Text>
                <br />
                <Text><CalendarOutlined /> {formatDate(mainDoc.lastSubmitted)}</Text>
              </Col>
              <Col xs={24} sm={12} md={8}>
                <Text strong>Submitted By:</Text>
                <br />
                <Text><UserOutlined /> {mainDoc.submittedByName || 'N/A'}</Text>
              </Col>
            </Row>

            {/* Effective Date Information */}
            {(mainDoc.effectiveFrom || mainDoc.effectiveUntil || mainDoc.signedBy) && (
              <>
                <Divider />
                <Row gutter={[16, 16]}>
                  {mainDoc.effectiveFrom && (
                    <Col xs={24} sm={12} md={8}>
                      <Text strong>Effective From:</Text>
                      <br />
                      <Text>{formatDate(mainDoc.effectiveFrom)}</Text>
                    </Col>
                  )}
                  {mainDoc.effectiveUntil && (
                    <Col xs={24} sm={12} md={8}>
                      <Text strong>Effective Until:</Text>
                      <br />
                      <Text>{formatDate(mainDoc.effectiveUntil)}</Text>
                    </Col>
                  )}
                  {mainDoc.signedBy && (
                    <Col xs={24} sm={12} md={8}>
                      <Text strong>Signed By:</Text>
                      <br />
                      <Text><EditOutlined /> {mainDoc.signedBy}</Text>
                    </Col>
                  )}
                </Row>
              </>
            )}

            {/* Tags */}
            {Array.isArray(mainDoc.tags) && mainDoc.tags.length > 0 && (
              <>
                <Divider />
                <Row>
                  <Col span={24}>
                    <Text strong>Tags:</Text>
                    <br />
                    <div style={{ marginTop: 8 }}>
                      {mainDoc.tags.map((tag: string, index: number) => (
                        <Tag key={index} color="geekblue">{tag}</Tag>
                      ))}
                    </div>
                  </Col>
                </Row>
              </>
            )}
          </Card>

          <Row gutter={24}>
            {/* Left Column - Tabs Content */}
            <Col xs={24} lg={16}>
              <Card>
                <Tabs activeKey={activeTab} onChange={setActiveTab}>
                  <TabPane tab={<span><FileTextOutlined />Content & Summary</span>} key="1">
                    <div>
                      {mainDoc.description && (
                        <div style={{ marginBottom: 24 }}>
                          <Title level={4}>Description</Title>
                          <div style={{ backgroundColor: "#f5f5f5", padding: 16, borderRadius: 6 }}>
                            <Paragraph style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                              {mainDoc.description}
                            </Paragraph>
                          </div>
                        </div>
                      )}

                      {mainDoc.summary && (
                        <div>
                          <Title level={4}>Summary</Title>
                          <div style={{ backgroundColor: "#f6f8fa", padding: 16, borderRadius: 6, border: "1px solid #e1e4e8" }}>
                            <div
                              style={{ fontSize: 14, lineHeight: '1.6' }}
                              dangerouslySetInnerHTML={{ __html: mainDoc.summary }}
                            />
                          </div>
                        </div>
                      )}

                      {!mainDoc.description && !mainDoc.summary && (
                        <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
                          <FileTextOutlined style={{ fontSize: 48, marginBottom: 16 }} />
                          <div>No content or summary available for this document.</div>
                        </div>
                      )}
                    </div>
                  </TabPane>

                  <TabPane tab={<span><InfoCircleOutlined />Information</span>} key="2">
                    <Row gutter={[24, 24]}>
                      <Col xs={24} md={12}>
                        <Card title="Basic Information" size="small">
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <Text>Document ID:</Text>
                              <Text copyable style={{ fontFamily: 'monospace', fontSize: '12px' }}>{mainDoc.documentId}</Text>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <Text>Version ID:</Text>
                              <Text copyable style={{ fontFamily: 'monospace', fontSize: '12px' }}>{mainDoc.versionId}</Text>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <Text>Version Name:</Text>
                              <Text>{mainDoc.versionName || "N/A"}</Text>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <Text>File Type:</Text>
                              <Text>{mainDoc.fileType || "N/A"}</Text>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <Text>File Size:</Text>
                              <Text>{mainDoc.fileSize ? formatFileSize(mainDoc.fileSize) : "N/A"}</Text>
                            </div>
                          </div>
                        </Card>
                      </Col>

                      <Col xs={24} md={12}>
                        <Card title="People & Department" size="small">
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <Text>Owner:</Text>
                              <Text>{mainDoc.ownerName || "N/A"}</Text>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <Text>Department:</Text>
                              <Text>{mainDoc.departmentName || "N/A"}</Text>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <Text>Document Type:</Text>
                              <Text>{mainDoc.documentTypeName || "N/A"}</Text>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <Text>Submitted By:</Text>
                              <Text>{mainDoc.submittedByName || "N/A"}</Text>
                            </div>
                            {mainDoc.signedBy && (
                              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Text>Signed By:</Text>
                                <Text>{mainDoc.signedBy}</Text>
                              </div>
                            )}
                          </div>
                        </Card>
                      </Col>

                      <Col xs={24} md={12}>
                        <Card title="Important Dates" size="small">
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <Text>Created:</Text>
                              <Text>{formatDate(mainDoc.createdTime)}</Text>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <Text>Last Submitted:</Text>
                              <Text>{formatDate(mainDoc.lastSubmitted)}</Text>
                            </div>
                            {mainDoc.effectiveFrom && (
                              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Text>Effective From:</Text>
                                <Text>{formatDate(mainDoc.effectiveFrom)}</Text>
                              </div>
                            )}
                            {mainDoc.effectiveUntil && (
                              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Text>Effective Until:</Text>
                                <Text>{formatDate(mainDoc.effectiveUntil)}</Text>
                              </div>
                            )}
                          </div>
                        </Card>
                      </Col>

                      <Col xs={24} md={12}>
                        <Card title="Status & Properties" size="small">
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Text>Status:</Text>
                              <Tag color={getStatusColor(mainDoc.status)}>{mainDoc.status || "Unknown"}</Tag>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Text>Visibility:</Text>
                              <Tag color={mainDoc.isPublic ? "green" : "orange"}>
                                {mainDoc.isPublic ? "Public" : "Private"}
                              </Tag>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Text>Is Replaced:</Text>
                              <Tag color={mainDoc.isReplaced ? "red" : "green"}>
                                {mainDoc.isReplaced ? "Yes" : "No"}
                              </Tag>
                            </div>
                          </div>
                        </Card>
                      </Col>
                    </Row>
                  </TabPane>

                  <TabPane tab={<span><FileTextOutlined />Original Document</span>} key="3">
                    {mainDoc.replacementDocument ? (
                      <div style={{ padding: 16, backgroundColor: '#f0f8ff', borderRadius: 6, border: '1px solid #d4edda' }}>
                        <Title level={4}>This document replaces:</Title>
                        <div style={{ padding: 12, backgroundColor: 'white', borderRadius: 4, borderLeft: '4px solid #ffa500' }}>
                          <Title level={5}>{mainDoc.replacementDocument.title || 'Untitled Document'}</Title>
                          <div style={{ marginBottom: 8, fontSize: '12px', color: '#666' }}>
                            <div>Document ID: <span style={{ fontFamily: 'monospace' }}>{mainDoc.replacementDocument.id}</span></div>
                            {mainDoc.replacementDocument.createdTime && (
                              <div>Created: {formatDate(mainDoc.replacementDocument.createdTime)}</div>
                            )}
                            {mainDoc.replacementDocument.documentTypeName && (
                              <div>Type: {mainDoc.replacementDocument.documentTypeName}</div>
                            )}
                          </div>
                          <div style={{ fontSize: '14px', color: '#333' }}>
                            {mainDoc.replacementDocument.description || "No description available."}
                          </div>
                        </div>
                      </div>
                    ) : mainDoc.isReplaced && mainDoc.replacedByDocument ? (
                      <div style={{ padding: 16, backgroundColor: '#fff7e6', borderRadius: 6, border: '1px solid #ffec3d' }}>
                        <Title level={4}>This document has been replaced by:</Title>
                        <div style={{ padding: 12, backgroundColor: 'white', borderRadius: 4, borderLeft: '4px solid #ff4d4f' }}>
                          <Title level={5}>{mainDoc.replacedByDocument.title || 'Untitled Document'}</Title>
                          <div style={{ marginBottom: 8, fontSize: '12px', color: '#666' }}>
                            <div>Document ID: <span style={{ fontFamily: 'monospace' }}>{mainDoc.replacedByDocument.id}</span></div>
                            {mainDoc.replacedByDocument.createdTime && (
                              <div>Created: {formatDate(mainDoc.replacedByDocument.createdTime)}</div>
                            )}
                            {mainDoc.replacedByDocument.documentTypeName && (
                              <div>Type: {mainDoc.replacedByDocument.documentTypeName}</div>
                            )}
                          </div>
                          <div style={{ fontSize: '14px', color: '#333' }}>
                            {mainDoc.replacedByDocument.description || "No description available."}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
                        <FileTextOutlined style={{ fontSize: 48, marginBottom: 16 }} />
                        <Title level={4} style={{ color: '#999' }}>No Document Replacement</Title>
                        <Text>This document is not involved in any replacement relationship.</Text>
                      </div>
                    )}
                  </TabPane>

                  <TabPane tab={<span><ClockCircleOutlined />Versions</span>} key="4">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                      {versions.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
                          <ClockCircleOutlined style={{ fontSize: 48, marginBottom: 16 }} />
                          <div>No versions found.</div>
                        </div>
                      ) : (
                        versions.map((ver, index) => (
                          <Card key={ver.versionId} size="small" style={{ border: '1px solid #d9d9d9' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                              <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                                  <Title level={5} style={{ margin: 0 }}>
                                    {ver.title || ver.versionName || `Version ${index + 1}`}
                                  </Title>
                                  <Tag color={getStatusColor(ver.status)}>{ver.status || "Unknown"}</Tag>
                                  {index === 0 && <Tag color="blue">Current</Tag>}
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 8, fontSize: '12px', color: '#666' }}>
                                  <div>File: {ver.fileName || "N/A"}</div>
                                  <div>Size: {ver.fileSize ? formatFileSize(ver.fileSize) : "N/A"}</div>
                                  <div>Type: {ver.fileType || "N/A"}</div>
                                  <div>Created: {formatDate(ver.createdTime)}</div>
                                </div>
                                {ver.description && (
                                  <div style={{ marginTop: 8, fontSize: '12px', color: '#333' }}>
                                    <Text strong>Description:</Text> {ver.description}
                                  </div>
                                )}
                                {Array.isArray(ver.tags) && ver.tags.length > 0 && (
                                  <div style={{ marginTop: 8 }}>
                                    {ver.tags.map((tag: string, tagIndex: number) => (
                                      <Tag key={tagIndex} color="geekblue">{tag}</Tag>
                                    ))}
                                  </div>
                                )}
                              </div>
                              <div style={{ display: 'flex', gap: 8 }}>
                                <Button
                                  size="small"
                                  icon={<EyeOutlined />}
                                  onClick={() => navigate(`/editor/doc/${id}/${ver.versionId}`)}
                                >
                                  Preview
                                </Button>
                                <Button
                                  size="small"
                                  icon={<DownloadOutlined />}
                                  onClick={() => downloadFile(ver.versionId)}
                                >
                                  Download
                                </Button>
                              </div>
                            </div>
                          </Card>
                        ))
                      )}
                    </div>
                  </TabPane>

                  <TabPane tab={<span><LikeOutlined />Recommendations</span>} key="5">
                    {loadingRecommendations ? (
                      <div style={{ textAlign: 'center', padding: 40 }}>
                        <Spin />
                        <div style={{ marginTop: 16 }}>Loading recommendations...</div>
                      </div>
                    ) : !Array.isArray(recommendations) || recommendations.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
                        <LikeOutlined style={{ fontSize: 48, marginBottom: 16 }} />
                        <div>No recommendations found.</div>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {recommendations.map((rec, index) => (
                          <Card
                            key={rec.documentId || index}
                            size="small"
                            hoverable
                            onClick={() => navigate(`/document/${rec.documentId}`, { state: { activeTab: "preview" } })}
                            style={{ cursor: 'pointer' }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                              <div style={{ flex: 1 }}>
                                <Title level={5} style={{ margin: '0 0 8px 0', color: '#1890ff' }}>
                                  {rec.title || "Untitled Document"}
                                </Title>
                                <div style={{ display: 'flex', gap: 16, marginBottom: 8, fontSize: '12px', color: '#666' }}>
                                  <span><TeamOutlined /> {rec.departmentName || "N/A"}</span>
                                  <span><FileTextOutlined /> {rec.documentTypeName || "N/A"}</span>
                                  <span><CalendarOutlined /> {formatDate(rec.createdTime)}</span>
                                </div>
                                {rec.description && (
                                  <div style={{ fontSize: '14px', color: '#333', marginBottom: 8 }}>
                                    {rec.description}
                                  </div>
                                )}
                                {Array.isArray(rec.tags) && rec.tags.length > 0 && (
                                  <div>
                                    {rec.tags.slice(0, 5).map((tag: string, tagIndex: number) => (
                                      <Tag key={tagIndex} color="geekblue">{tag}</Tag>
                                    ))}
                                    {rec.tags.length > 5 && (
                                      <Tag color="default">+{rec.tags.length - 5} more</Tag>
                                    )}
                                  </div>
                                )}
                              </div>
                              <div>
                                <Tag color={rec.isPublic ? "green" : "orange"}>
                                  {rec.isPublic ? "Public" : "Private"}
                                </Tag>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    )}
                  </TabPane>
                </Tabs>
              </Card>
            </Col>

            {/* Right Column - Actions */}
            <Col xs={24} lg={8}>
              <Card title="Actions" style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <Button
                    type="primary"
                    icon={<EyeOutlined />}
                    onClick={handlePreview}
                    disabled={!mainDoc.versionId}
                    loading={previewLoading}
                    block
                    size="large"
                  >
                    {previewLoading ? "Loading..." : "Preview Document"}
                  </Button>

                  <Button
                    icon={<DownloadOutlined />}
                    onClick={() => mainDoc.versionId && downloadFile(mainDoc.versionId)}
                    disabled={!mainDoc.versionId}
                    block
                    size="large"
                  >
                    Download
                  </Button>

                </div>
              </Card>

              {/* Document Statistics */}
              <Card title="Statistics" size="small">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text>File Size:</Text>
                    <Text strong>{mainDoc.fileSize ? formatFileSize(mainDoc.fileSize) : "N/A"}</Text>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text>Tags Count:</Text>
                    <Text strong>{mainDoc.tags?.length || 0}</Text>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text>Visibility:</Text>
                    <Text strong>{mainDoc.isPublic ? 'Public' : 'Private'}</Text>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text>Versions:</Text>
                    <Text strong>{versions.length}</Text>
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
            Document Preview - {mainDoc?.fileName}
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

      {/* Floating Document Chat Box */}
      {id && mainDoc?.title && (
        <DocumentChatBox documentId={id} documentTitle={mainDoc.title} />
      )}
    </Layout>
  );
}
