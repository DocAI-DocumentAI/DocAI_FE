import { Layout, Typography, Card, Button, Input, Select, DatePicker, Upload, Form, Row, Col, Space, Spin, Table, Modal, Tag } from "antd"
import { UploadOutlined, InboxOutlined, SearchOutlined, SwapOutlined } from "@ant-design/icons"
import {
  uploadDraftDocument,
  analyzeDocument,
  regenerateSummary,
  getDocumentTypes,
  getReplaceableDocuments,
  DocumentType,
  ReplaceableDocument
} from "../../lib/api/document";
import { useState, useEffect } from "react";
import WysiwygEditor from 'react-simple-wysiwyg';
import toast from 'react-hot-toast';
import moment from "moment";

const { Title, Text } = Typography
const { Content } = Layout
const { Dragger } = Upload

// Custom CSS for Wysiwyg editor
const editorStyles = `
  .wysiwyg-editor {
    border: 1px solid #d9d9d9;
    border-radius: 6px;
    min-height: 120px;
  }
  .wysiwyg-editor:focus-within {
    border-color: #1890ff;
    box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
  }
  .wysiwyg-editor .wysiwyg-toolbar {
    border-bottom: 1px solid #d9d9d9;
    padding: 8px;
    background: #fafafa;
  }
  .wysiwyg-editor .wysiwyg-toolbar button {
    margin-right: 4px;
    padding: 4px 8px;
    border: 1px solid #d9d9d9;
    border-radius: 4px;
    background: white;
    cursor: pointer;
  }
  .wysiwyg-editor .wysiwyg-toolbar button:hover {
    background: #f0f0f0;
  }
  .wysiwyg-editor .wysiwyg-toolbar button.active {
    background: #1890ff;
    color: white;
    border-color: #1890ff;
  }
  .wysiwyg-editor .wysiwyg-content {
    padding: 12px;
    min-height: 100px;
    font-size: 14px;
    line-height: 1.5;
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = editorStyles;
  document.head.appendChild(style);
}

export default function UploadDocumentReplacement() {
  const [form] = Form.useForm()
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [htmlDescription, setHtmlDescription] = useState("");
  const [htmlSummary, setHtmlSummary] = useState("");
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([]);
  const [loadingDocumentTypes, setLoadingDocumentTypes] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Replacement document selection
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [replaceableDocuments, setReplaceableDocuments] = useState<ReplaceableDocument[]>([]);
  const [loadingDocuments, setLoadingDocuments] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<ReplaceableDocument | null>(null);
  const [documentSearchText, setDocumentSearchText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalDocuments, setTotalDocuments] = useState(0);

  // Load document types on component mount
  useEffect(() => {
    const fetchDocumentTypes = async () => {
      try {
        setLoadingDocumentTypes(true);
        const types = await getDocumentTypes();
        setDocumentTypes(types);
      } catch (error) {
        console.error("Failed to fetch document types:", error);
        toast.error("Failed to load document types");
      } finally {
        setLoadingDocumentTypes(false);
      }
    };

    fetchDocumentTypes();
  }, []);

  // Load replaceable documents
  const fetchReplaceableDocuments = async (page = 1, searchTitle?: string) => {
    try {
      setLoadingDocuments(true);
      const result = await getReplaceableDocuments(page, 10, searchTitle);
      setReplaceableDocuments(result.items);
      setTotalDocuments(result.total);
    } catch (error) {
      console.error("Failed to fetch replaceable documents:", error);
      toast.error("Failed to load replaceable documents");
    } finally {
      setLoadingDocuments(false);
    }
  };

  useEffect(() => {
    if (showDocumentModal) {
      fetchReplaceableDocuments(1, documentSearchText);
    }
  }, [showDocumentModal]);

  const handleDocumentSearch = () => {
    setCurrentPage(1);
    fetchReplaceableDocuments(1, documentSearchText);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchReplaceableDocuments(page, documentSearchText);
  };

  const handleDocumentSelect = (document: ReplaceableDocument) => {
    setSelectedDocument(document);
    form.setFieldsValue({ replacementDocumentId: document.documentId });
    setShowDocumentModal(false);
    toast.success(`Selected document: ${document.title}`);
  };

  const handleSubmit = async (values: any) => {
    // Kiểm tra file
    if (!selectedFile) {
      toast.error("Vui lòng chọn file để upload!");
      return;
    }

    // Kiểm tra replacement document
    if (!selectedDocument) {
      toast.error("Vui lòng chọn tài liệu cần thay thế!");
      return;
    }

    // Map các trường form sang đúng tên API
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      toast.error("Không tìm thấy thông tin user, vui lòng đăng nhập lại!");
      return;
    }

    const users = JSON.parse(userStr);

    // Debug log để kiểm tra giá trị
    console.log("Form values:", values);
    console.log("effectiveFrom:",values.effectiveFrom.toISOString() );
    console.log("effectiveTo:", values.effectiveTo);

    const formValues = {
      versionName: values.versionName || "",
      summary: htmlSummary || "",
      replacementDocumentId: selectedDocument.documentId, // Use selected document versionId ID
      departmentId: users?.department?.id,
      effectiveFrom: values.effectiveFrom   ? values.effectiveFrom.toISOString() : "",
      signedBy: values.signedBy || "",
      effectiveUntil: values.effectiveTo ? values.effectiveTo.toISOString() : "",
      title: values.title || "",
      tags: Array.isArray(values.tags) ? values.tags.filter(Boolean) : [],
      description: htmlDescription || "",
      documentTypeId: values.type || "",
      file: selectedFile,
    };
    console.log("Final form values being sent:", formValues);

    setIsUploading(true);
    try {
      console.log("Uploading replacement document...", formValues);

      await uploadDraftDocument(formValues);
      toast.success("Upload replacement document thành công!");

      // Reset form sau khi upload thành công
      form.resetFields();
      setHtmlDescription("");
      setHtmlSummary("");
      setSelectedFile(null);
      setSelectedDocument(null);
    } catch (error: any) {
      toast.error(`Upload document thất bại. Vui lòng thử lại! ${error?.response?.data?.message}`);
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileUpload = async (info: any) => {
    const { file } = info;

    if (file.status === 'removed') {
      setSelectedFile(null);
      setHtmlDescription("");
      setHtmlSummary("");
      form.setFieldsValue({ file: undefined });
      return;
    }

    const fileObj = file.originFileObj || file;

    if (fileObj && fileObj instanceof File) {
      setSelectedFile(fileObj);

      setIsAnalyzing(true);
      try {
        const [analyzeResult, summaryResult] = await Promise.all([
          analyzeDocument(fileObj),
          regenerateSummary(fileObj)
        ]);

        const analyzedData = analyzeResult.data;
        const summaryData = summaryResult.data;

        setHtmlDescription(analyzedData.description || "");
        setHtmlSummary(summaryData.summary || summaryData || "");

        form.setFieldsValue({
          title: analyzedData.title || "",
          tags: analyzedData.tags || [],
          // Sửa tên field để match với form
          effectiveFrom: analyzedData.effectiveFrom ? moment(analyzedData.effectiveFrom) : null,
          effectiveTo: analyzedData.effectiveUntil ? moment(analyzedData.effectiveUntil) : null,
          signedBy: analyzedData.signedBy || "",
        });

        toast.success("Document analyzed successfully!");
      } catch (error) {
        toast.error("Failed to analyze document. Please try again!");
        console.error("Analysis error:", error);
      } finally {
        setIsAnalyzing(false);
      }
    }
  };

  const uploadProps = {
    name: "file",
    multiple: false,
    accept: ".pdf,.docx",
    beforeUpload: () => false,
    onChange: handleFileUpload,
    disabled: isUploading || isAnalyzing,
    showUploadList: {
      showPreviewIcon: true,
      showRemoveIcon: !isUploading,
      showDownloadIcon: false,
    },
    maxCount: 1,
  }

  const documentColumns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      render: (text: string) => (
        <div style={{ maxWidth: 300 }}>
          <Text strong>{text}</Text>
        </div>
      ),
    },
    {
      title: 'Department',
      dataIndex: 'departmentName',
      key: 'departmentName',
      width: 150,
    },
    {
      title: 'Type',
      dataIndex: 'documentTypeName',
      key: 'documentTypeName',
      width: 120,
    },
    {
      title: 'Owner',
      dataIndex: 'ownerName',
      key: 'ownerName',
      width: 120,
    },
    {
      title: 'Tags',
      dataIndex: 'tags',
      key: 'tags',
      width: 200,
      render: (tags: string[]) => (
        <div>
          {tags?.slice(0, 2).map((tag, index) => (
            <Tag key={index} color="blue" style={{ marginBottom: 4 }}>
              {tag}
            </Tag>
          ))}
          {tags?.length > 2 && <Tag color="default">+{tags.length - 2}</Tag>}
        </div>
      ),
    },
    {
      title: 'Created',
      dataIndex: 'createdTime',
      key: 'createdTime',
      width: 120,
      render: (date: string) => moment(date).format('DD/MM/YYYY'),
    },
    {
      title: 'Action',
      key: 'action',
      width: 100,
      render: (_: any, record: ReplaceableDocument) => (
        <Button
          type="primary"
          size="small"
          onClick={() => handleDocumentSelect(record)}
        >
          Select
        </Button>
      ),
    },
  ];

  return (
    <Layout style={{ minHeight: "100vh", backgroundColor: "#f5f5f5" }}>
      <Content style={{ padding: "14px" }}>
        <div style={{ margin: "0 auto" }}>
          {/* Header */}
          <div style={{ marginBottom: 24 }}>
            <Title level={2} style={{ margin: 0 }}>
              <SwapOutlined style={{ marginRight: 8 }} />
              Upload Replacement Document
            </Title>
            <Text type="secondary">Upload a new document to replace an existing one</Text>
          </div>

          <Card>
            <Form form={form} layout="vertical" onFinish={handleSubmit}>
              {/* Document Selection Section */}
              <div style={{ marginBottom: 32 }}>
                <Title level={4} style={{ marginBottom: 16 }}>
                  Select Document to Replace
                </Title>
                <Text type="secondary" style={{ display: "block", marginBottom: 16 }}>
                  Choose the existing document that will be replaced by the new upload.
                </Text>

                <Form.Item
                  name="replacementDocumentId"
                  label="Document to Replace"
                  rules={[{ required: true, message: "Please select a document to replace" }]}
                >
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <Input
                      placeholder="Click 'Browse Documents' to select a document"
                      value={selectedDocument ? selectedDocument.title : ''}
                      readOnly
                      style={{ flex: 1 }}
                    />
                    <Button
                      type="primary"
                      icon={<SearchOutlined />}
                      onClick={() => setShowDocumentModal(true)}
                      disabled={isUploading}
                    >
                      Browse Documents
                    </Button>
                  </div>
                </Form.Item>

                {selectedDocument && (
                  <Card size="small" style={{ backgroundColor: '#f6ffed', borderColor: '#b7eb8f' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                      <div>
                        <Text strong>Selected Document:</Text>
                        <div style={{ marginTop: 4 }}>
                          <div><Text strong>Title:</Text> {selectedDocument.title}</div>
                          <div><Text strong>Department:</Text> {selectedDocument.departmentName}</div>
                          <div><Text strong>Type:</Text> {selectedDocument.documentTypeName}</div>
                          <div><Text strong>Owner:</Text> {selectedDocument.ownerName}</div>
                        </div>
                      </div>
                      <Button
                        type="link"
                        onClick={() => {
                          setSelectedDocument(null);
                          form.setFieldsValue({ replacementDocumentId: undefined });
                        }}
                        disabled={isUploading}
                      >
                        Clear
                      </Button>
                    </div>
                  </Card>
                )}
              </div>

              {/* Document Upload Section */}
              <div style={{ marginBottom: 32 }}>
                <div style={{ display: "flex", alignItems: "center", marginBottom: 16 }}>
                  <UploadOutlined style={{ marginRight: 8 }} />
                  <Title level={4} style={{ margin: 0 }}>
                    Upload New Document
                  </Title>
                  {isAnalyzing && (
                    <div style={{ marginLeft: 8, display: "flex", alignItems: "center" }}>
                      <Spin size="small" />
                      <span style={{ marginLeft: 8, fontSize: 12, color: "#1890ff" }}>
                        Analyzing & generating summary...
                      </span>
                    </div>
                  )}
                  {isUploading && (
                    <div style={{ marginLeft: 8, display: "flex", alignItems: "center" }}>
                      <Spin size="small" />
                      <span style={{ marginLeft: 8, fontSize: 12, color: "#52c41a" }}>
                        Uploading document...
                      </span>
                    </div>
                  )}
                </div>
                <Text type="secondary" style={{ display: "block", marginBottom: 16 }}>
                  Upload a PDF or DOCX file. Our AI will automatically extract metadata to help you.
                </Text>

                <Form.Item
                  name="file"
                  label="Document File"
                  rules={[{ required: true, message: "Please upload a document file" }]}
                >
                  <Dragger
                    {...uploadProps}
                    style={{
                      padding: "40px 20px",
                      opacity: isUploading || isAnalyzing ? 0.6 : 1
                    }}
                  >
                    <p className="ant-upload-drag-icon">
                      <InboxOutlined style={{ fontSize: 48, color: "#d9d9d9" }} />
                    </p>
                    <p style={{ fontSize: 16, marginBottom: 8 }}>
                      {isUploading || isAnalyzing
                        ? "Processing file..."
                        : "Drag and drop your replacement file here, or click to browse"
                      }
                    </p>
                    <Button
                      type="default"
                      disabled={isUploading || isAnalyzing}
                    >
                      Choose File
                    </Button>
                    <p style={{ color: "#999", fontSize: 12, marginTop: 8 }}>
                      Supported formats: PDF, DOCX (max 5MB)
                    </p>
                  </Dragger>
                </Form.Item>
              </div>

              {/* Document Details */}
              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="title"
                    label="Document Title"
                    rules={[{ required: true, message: "Please enter document title" }]}
                  >
                    <Input placeholder="Enter document title" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="type"
                    label="Document Type"
                    rules={[{ required: true, message: "Please select document type" }]}
                  >
                    <Select
                      placeholder="Select document type"
                      loading={loadingDocumentTypes}
                      showSearch
                      optionFilterProp="children"
                      filterOption={(input, option) =>
                        (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase()) ||
                        (option?.title as unknown as string)?.toLowerCase().includes(input.toLowerCase())
                      }
                    >
                      {documentTypes.map((type) => (
                        <Select.Option
                          key={type.id}
                          value={type.id}
                          title={type.description}
                        >
                          {type.name}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item name="effectiveFrom" label="Effective From">
                    <DatePicker style={{ width: "100%" }} placeholder="mm/dd/yyyy" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item name="effectiveTo" label="Effective To">
                    <DatePicker style={{ width: "100%" }} placeholder="mm/dd/yyyy" />
                  </Form.Item>
                </Col>
              </Row>

              {/* Description with Wysiwyg editor */}
              <Form.Item label="Description">
                <WysiwygEditor
                  value={htmlDescription}
                  onChange={(e) => setHtmlDescription(e.target.value)}
                  placeholder="Brief description of the document"
                  className="wysiwyg-editor"
                />
              </Form.Item>

              {/* Summary with Wysiwyg editor */}
              <Form.Item label="Summary">
                <WysiwygEditor
                  value={htmlSummary}
                  onChange={(e) => setHtmlSummary(e.target.value)}
                  placeholder="Document summary (can be auto-generated by AI)"
                  className="wysiwyg-editor"
                />
              </Form.Item>

              <Form.Item label="Tags">
                <Form.List name="tags">
                  {(fields, { add, remove }) => (
                    <>
                      {fields.map((field, index) => (
                        <Space key={field.key} align="baseline">
                          <Form.Item
                            key={field.key}
                            name={field.name}
                            rules={[{ required: true, message: "Please enter a tag" }]}
                            style={{ marginBottom: 0 }}
                          >
                            <Input placeholder={`Tag ${index + 1}`} />
                          </Form.Item>
                          {fields.length > 1 && (
                            <Button type="link" danger onClick={() => remove(field.name)}>
                              Remove
                            </Button>
                          )}
                        </Space>
                      ))}
                      <Button type="dashed" onClick={() => add()} style={{ marginTop: 8 }}>
                        + Add Tag
                      </Button>
                    </>
                  )}
                </Form.List>
              </Form.Item>

              <Form.Item name="signedBy" label="Signed By">
                <Input placeholder="Name of the person who signed the document" />
              </Form.Item>

              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="versionName"
                    label="Version Name"
                    rules={[{ required: true, message: "Please enter version name" }]}
                  >
                    <Input placeholder="Enter version name" />
                  </Form.Item>
                </Col>
              </Row>

              {/* Action Buttons */}
              <Form.Item style={{ marginTop: 32 }}>
                <Space>
                  <Button disabled={isUploading}>
                    Cancel
                  </Button>
                  <Button
                    type="primary"
                    htmlType="submit"
                    icon={isUploading ? <Spin size="small" /> : <SwapOutlined />}
                    loading={isUploading}
                    disabled={isAnalyzing || !selectedFile || !selectedDocument}
                  >
                    {isUploading ? "Uploading..." : "Upload Replacement Document"}
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </Card>

          {/* Loading overlay khi đang upload */}
          {isUploading && (
            <div style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 9999
            }}>
              <Card style={{ textAlign: "center", minWidth: 300 }}>
                <Spin size="large" />
                <div style={{ marginTop: 16 }}>
                  <Title level={4} style={{ margin: 0 }}>Uploading Replacement Document</Title>
                  <Text type="secondary">Please wait while we process your document...</Text>
                </div>
              </Card>
            </div>
          )}
        </div>
      </Content>

      {/* Document Selection Modal */}
      <Modal
        title="Select Document to Replace"
        open={showDocumentModal}
        onCancel={() => setShowDocumentModal(false)}
        footer={null}
        width={1000}
        style={{ top: 20 }}
      >
        <div style={{ marginBottom: 16 }}>
          <Input.Search
            placeholder="Search documents by title..."
            value={documentSearchText}
            onChange={(e) => setDocumentSearchText(e.target.value)}
            onSearch={handleDocumentSearch}
            style={{ marginBottom: 16 }}
            enterButton={<SearchOutlined />}
          />
        </div>

        <Table
          dataSource={replaceableDocuments}
          columns={documentColumns}
          rowKey="documentId"
          loading={loadingDocuments}
          pagination={{
            current: currentPage,
            total: totalDocuments,
            pageSize: 10,
            onChange: handlePageChange,
            showSizeChanger: false,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} documents`,
          }}
          scroll={{ x: 800 }}
          size="small"
        />
      </Modal>
    </Layout>
  )
}
