import { Layout, Typography, Card, Button, Input, Select, DatePicker, Upload, Form, Row, Col, Space, Spin } from "antd"
import { UploadOutlined, InboxOutlined } from "@ant-design/icons"
import { analyzeDocument, regenerateSummary, recreateDocument, getDocumentTypes, DocumentType } from "../../lib/api/document";
import { useState, useEffect } from "react";
import WysiwygEditor from 'react-simple-wysiwyg';
import toast from 'react-hot-toast';
import moment from "moment";
import { useParams, useNavigate } from "react-router-dom";

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

export default function NewVersionDocument() {
  const [form] = Form.useForm()
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [htmlDescription, setHtmlDescription] = useState("");
  const [htmlSummary, setHtmlSummary] = useState("");
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([]);
  const [loadingDocumentTypes, setLoadingDocumentTypes] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { id } = useParams();
  const navigate = useNavigate();

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

  const handleSubmit = async (values: any) => {
    // Kiểm tra file
    if (!selectedFile) {
      toast.error("Vui lòng chọn file để upload!");
      return;
    }

    if (!id) {
      toast.error("Không tìm thấy documentId trên URL!");
      return;
    }
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      toast.error("Không tìm thấy thông tin user, vui lòng đăng nhập lại!");
      return;
    }
    const users = JSON.parse(userStr);
    const formValues = {
      versionName: values.versionName || "",
      summary: htmlSummary || "", // Sử dụng htmlSummary từ editor
      replacementDocumentId: values.replacementDocumentId || "",
      departmentId: users?.department?.id,
      effectiveFrom: values.effectiveFrom && moment.isMoment(values.effectiveFrom) ? values.effectiveFrom.toISOString() : "",
      signedBy: values.signedBy || "",
      effectiveUntil: values.effectiveTo && moment.isMoment(values.effectiveTo) ? values.effectiveTo.toISOString() : "",
      title: values.title || "",
      tags: Array.isArray(values.tags) ? values.tags.filter(Boolean) : [],
      description: htmlDescription || "", // Sử dụng htmlDescription từ editor
      documentTypeId: values.type || "", // Thêm documentTypeId
      file: selectedFile,
    };

    setIsUploading(true);
    try {
      await recreateDocument(id, formValues);
      toast.success("Tạo Version mới thành công!");
      
      // Reset form sau khi upload thành công
      form.resetFields();
      setHtmlDescription("");
      setHtmlSummary("");
      setSelectedFile(null);
      navigate(-1); // hoặc chuyển hướng sang trang chi tiết mới nếu muốn
    } catch (error: any) {
      toast.error(`Tạo Version mới thất bại. Vui lòng thử lại! ${error?.response?.data?.message}`);
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileUpload = async (info: any) => {
    const { file } = info;
    console.log("File info:", file);
    console.log("File originFileObj:", file.originFileObj);

    // Nếu file bị xóa
    if (file.status === 'removed') {
      setSelectedFile(null);
      setHtmlDescription("");
      setHtmlSummary("");
      form.setFieldsValue({ file: undefined });
      return;
    }

    // Lấy file object - có thể là originFileObj hoặc chính file đó
    const fileObj = file.originFileObj || file;
    
    // Kiểm tra xem có phải là File object không
    if (fileObj && fileObj instanceof File) {
      console.log("Processing file:", fileObj.name, fileObj.size);
      
      // Lưu file vào state
      setSelectedFile(fileObj);

      setIsAnalyzing(true);
      try {
        console.log("Analyzing document...");
        
        // Call cả 2 API đồng thời
        const [analyzeResult, summaryResult] = await Promise.all([
          analyzeDocument(fileObj),
          regenerateSummary(fileObj)
        ]);

        // Auto-fill form với data từ analyze API
        const analyzedData = analyzeResult.data;
        const summaryData = summaryResult.data;

        console.log("Analyze result:", analyzedData);
        console.log("Summary result:", summaryData);

        // Lưu HTML content cho hiển thị
        setHtmlDescription(analyzedData.description || "");
        setHtmlSummary(summaryData.summary || summaryData || "");

        form.setFieldsValue({
          title: analyzedData.title || "",
          tags: analyzedData.tags || [],
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
    } else {
      console.log("No valid file object found");
    }
  };

  const uploadProps = {
    name: "file",
    multiple: false,
    accept: ".pdf,.docx",
    beforeUpload: () => false,
    onChange: handleFileUpload,
    disabled: isUploading || isAnalyzing, // Disable khi đang upload hoặc analyze
    showUploadList: {
      showPreviewIcon: true,
      showRemoveIcon: !isUploading, // Ẩn nút remove khi đang upload
      showDownloadIcon: false,
    },
    maxCount: 1,
  }

  return (
    <Layout style={{ minHeight: "100vh", backgroundColor: "#f5f5f5" }}>
      <Content style={{ padding: "14px" }}>
        <div style={{ margin: "0 auto" }}>
          {/* Header */}
          <div style={{ marginBottom: 24 }}>
            <Title level={2} style={{ margin: 0 }}>
              Upload New Document Version
            </Title>
            <Text type="secondary">Upload a document with AI-powered analysis</Text>
          </div>

          <Card>
            <Form form={form} layout="vertical" onFinish={handleSubmit}>
              {/* Document Upload Section */}
              <div style={{ marginBottom: 32 }}>
                <div style={{ display: "flex", alignItems: "center", marginBottom: 16 }}>
                  <UploadOutlined style={{ marginRight: 8 }} />
                  <Title level={4} style={{ margin: 0 }}>
                    Document Upload
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
                        Creating new version...
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
                        : "Drag and drop your file here, or click to browse"
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
                    name="documentNumber"
                    label="Official Document Number"
                    rules={[{ required: true, message: "Please enter document number" }]}
                  >
                    <Input placeholder="e.g. IVA/2025/HD-CP" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
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
                    icon={isUploading ? <Spin size="small" /> : <UploadOutlined />}
                    loading={isUploading}
                    disabled={isAnalyzing || !selectedFile}
                  >
                    {isUploading ? "Creating Version..." : "Create New Version"}
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
                  <Title level={4} style={{ margin: 0 }}>Creating New Version</Title>
                  <Text type="secondary">Please wait while we process your document...</Text>
                </div>
              </Card>
            </div>
          )}
        </div>
      </Content>
    </Layout>
  )
}
