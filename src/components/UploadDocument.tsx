
import { Layout, Typography, Card, Button, Input, Select, DatePicker, Upload, Form, Row, Col, Space, Spin } from "antd"
import { ArrowLeftOutlined, UploadOutlined, InboxOutlined } from "@ant-design/icons"
import { uploadDraftDocument, analyzeDocument } from "../lib/api/document"; 
import { useState } from "react"; 
import WysiwygEditor from 'react-simple-wysiwyg';
import toast from 'react-hot-toast';

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


export default function UploadDocument({ onViewChange }: any) {
  const [form] = Form.useForm() 
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [htmlDescription, setHtmlDescription] = useState("");
  const [htmlSummary, setHtmlSummary] = useState("");

  const handleSubmit = async (values: any) => {
    // Map các trường form sang đúng tên API
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      toast.error("Không tìm thấy thông tin user, vui lòng đăng nhập lại!");
      return;
    }
    const users = JSON.parse(userStr);
    const formValues = {
      versionName: values.versionName || "",
      summary: values.summary || "",
      replacementDocumentId: values.replacementDocumentId || "",
      departmentId: users?.department?.id, // <-- map for DepartmentId
      effectiveFrom: values.effectiveFrom ? values.effectiveFrom.toISOString() : "",
      signedBy: values.signedBy || "",
      effectiveUntil: values.effectiveTo ? values.effectiveTo.toISOString() : "",
      title: values.title || "",
      tags: Array.isArray(values.tags) ? values.tags.filter(Boolean) : [],
      description: values.description || "",
      file: values.file?.file, // Antd Dragger lưu file ở values.file.file
    };
    try {
      // if (!userId) throw new Error("Không tìm thấy userId, vui lòng đăng nhập lại!");
      console.log(formValues);
      const userStr = localStorage.getItem("user");
      if (!userStr) {
        toast.error("Không tìm thấy thông tin user, vui lòng đăng nhập lại!");
        return;
      }
      const user = JSON.parse(userStr);
      await uploadDraftDocument(formValues, user.userId);
      toast.success("Upload document thành công!");
      onViewChange && onViewChange("queue");
    } catch (error: any) {
      toast.error(`Upload document thất bại. Vui lòng thử lại! ${error?.response?.data?.message}`);
      console.error(error);
    }
  };

  const handleFileUpload = async (info: any) => {
    const { file } = info;
    console.log("File info:", file);
    console.log("File originFileObj:", file.originFileObj);

    // Nếu file bị xóa
    if (file.status === 'removed') {
      form.setFieldsValue({ file: undefined });
      return;
    }

    // Khi có file mới được chọn (status có thể undefined hoặc 'done')
    if (!file.originFileObj) {
      setIsAnalyzing(true);
      try {
        // Analyze document
        console.log("Analyzing document...");
        const analyzeResult = await analyzeDocument(file);

        // Auto-fill form with analyzed data
        const analyzedData = analyzeResult.data;

        // Lưu HTML content cho hiển thị
        setHtmlDescription(analyzedData.description || "");
        setHtmlSummary(analyzedData.summary || "");

        form.setFieldsValue({
          title: analyzedData.title || "",
          description: analyzedData.description || "",
          summary: analyzedData.summary || "",
          tags: analyzedData.tags || [],
          effectiveFrom: analyzedData.effectiveFrom ? new Date(analyzedData.effectiveFrom) : null,
          effectiveTo: analyzedData.effectiveUntil ? new Date(analyzedData.effectiveUntil) : null,
          signedBy: analyzedData.signedBy || "",
        });

        toast.success("Document analyzed successfully!");
      } catch (error) {
        toast.error("Failed to analyze document. Please try again!");
        console.error(error);
      } finally {
        setIsAnalyzing(false);
      }
    }
  };

  const uploadProps = {
    name: "file",
    multiple: false, // Chỉ upload 1 file
    accept: ".pdf,.docx",
    beforeUpload: () => false, // Prevent auto upload
    onChange: handleFileUpload,
    showUploadList: {
      showPreviewIcon: true,
      showRemoveIcon: true,
      showDownloadIcon: false,
    },
    maxCount: 1, // Chỉ cho phép 1 file
  }

  return (
    <Layout style={{ minHeight: "100vh", backgroundColor: "#f5f5f5" }}>
      <Content style={{ padding: "14px" }}>
        <div style={{ margin: "0 auto" }}>
          {/* Header */}
          <div style={{ marginBottom: 24 }}>
            <Button
              type="text"
              icon={<ArrowLeftOutlined />}
              onClick={() => onViewChange("queue")}
              style={{ marginBottom: 16 }}
            >
              Back to Document List
            </Button>
            <Title level={2} style={{ margin: 0 }}>
              Upload New Document
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
                    <Spin size="small" style={{ marginLeft: 8 }}>
                      <span style={{ marginLeft: 8, fontSize: 12 }}>Analyzing...</span>
                    </Spin>
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
                  <Dragger {...uploadProps} style={{ padding: "40px 20px" }}>
                    <p className="ant-upload-drag-icon">
                      <InboxOutlined style={{ fontSize: 48, color: "#d9d9d9" }} />
                    </p>
                    <p style={{ fontSize: 16, marginBottom: 8 }}>Drag and drop your file here, or click to browse</p>
                    <Button type="default">Choose File</Button>
                    <p style={{ color: "#999", fontSize: 12, marginTop: 8 }}>Supported formats: PDF, DOCX (max 5MB)</p>
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
                    <Select placeholder="Select document type">
                      <Select.Option value="guidelines">Guidelines</Select.Option>
                      <Select.Option value="policy">Policy</Select.Option>
                      <Select.Option value="procedure">Procedure</Select.Option>
                      <Select.Option value="template">Template</Select.Option>
                      <Select.Option value="manual">Manual</Select.Option>
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
                <Form.Item name="description" noStyle>
                  <WysiwygEditor
                    value={htmlDescription}
                    onChange={(e) => setHtmlDescription(e.target.value)}
                    placeholder="Brief description of the document"
                    className="wysiwyg-editor"
                  />
                </Form.Item>
              </Form.Item>

              {/* Summary with Wysiwyg editor */}
              <Form.Item label="Summary">
                <Form.Item name="summary" noStyle>
                  <WysiwygEditor
                    value={htmlSummary}
                    onChange={(e) => setHtmlSummary(e.target.value)}
                    placeholder="Document summary (can be auto-generated by AI)"
                    className="wysiwyg-editor"
                  />
                </Form.Item>
              </Form.Item>

              <Form.Item label="Tags">
                <Form.List name="tags">
                  {(fields, { add, remove }) => (
                    <>
                      {fields.map((field, index) => (
                        <Space key={field.key} align="baseline">
                          <Form.Item
                            {...field}
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
                  <Button onClick={() => onViewChange("queue")}>Cancel</Button>
                  <Button type="primary" htmlType="submit" icon={<UploadOutlined />}>
                    Next: Analyze Document
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </Card>
        </div>
      </Content>
    </Layout>
  )
}
