import { Layout, Typography, Card, Button, Input, Select, DatePicker, Upload, Form, Row, Col, Space, Spin, Switch } from "antd"
import { UploadOutlined, InboxOutlined, ArrowRightOutlined, FolderOutlined } from "@ant-design/icons"
import { analyzeDocument, createNewVersion, regenerateSummary, getDocumentTypes, DocumentType } from "../../lib/api/document";
import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import WysiwygEditor from 'react-simple-wysiwyg';
import toast from 'react-hot-toast';
import moment from "moment";
import { FolderSelectorInput } from "../../components/folder";

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
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState<'idle' | 'extracting' | 'analyzing' | 'generating'>('idle');
  const [isUploading, setIsUploading] = useState(false);
  const [isRegeneratingSummary, setIsRegeneratingSummary] = useState(false);
  const [htmlDescription, setHtmlDescription] = useState("");
  const [htmlSummary, setHtmlSummary] = useState("");
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([]);
  const [loadingDocumentTypes, setLoadingDocumentTypes] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isAnalyzed, setIsAnalyzed] = useState(false);
  const [mode, setMode] = useState<'upload' | 'create'>('upload');
  const [isPublicState, setIsPublicState] = useState(false);
  const [selectedFolderId, setSelectedFolderId] = useState<string | undefined>(undefined);
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

    if (location.state?.analysisData && location.state?.mode === 'create') {
      const analysisData = location.state.analysisData;
      setMode('create');
      setSelectedFile(analysisData.file);
      setHtmlDescription(analysisData.description || "");
      setHtmlSummary(analysisData.summary || "");
      setIsAnalyzed(true);
      
      const isPublicValue = analysisData.isPublic || false;
      setIsPublicState(isPublicValue);

      const formValues = {
        title: analysisData.title || "",
        versionName: analysisData.versionName || "",
        tags: analysisData.tags || [],
        effectiveFrom: analysisData.effectiveFrom ? moment(analysisData.effectiveFrom) : null,
        effectiveTo: analysisData.effectiveUntil ? moment(analysisData.effectiveUntil) : null,
        signedBy: analysisData.signedBy || "",
        type: analysisData.documentTypeId || "",
        isPublic: isPublicValue,
      };

      form.setFieldsValue(formValues);
    }
  }, [location.state, form]);

  const handleSwitchChange = (checked: boolean) => {
    setIsPublicState(checked);
    form.setFieldValue('isPublic', checked);
    
    // Clear folder selection when switching between public/private
    setSelectedFolderId(undefined);
    form.setFieldValue('folderId', undefined);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      if (!id) {
        toast.error("DocumentId not found on URL!");
        return;
      }

      if (!selectedFile) {
        toast.error("Please select a file to upload!");
        return;
      }

      const userStr = localStorage.getItem("user");
      if (!userStr) {
         
        return;
      }

      const users = JSON.parse(userStr);
      const formValues = {
        versionName: values.versionName || "",
        summary: htmlSummary || "",
        replacementDocumentId: values.replacementDocumentId || "",
        departmentId: users?.department?.id,
        effectiveFrom: values.effectiveFrom ? values.effectiveFrom.toISOString() : "",
        effectiveUntil: values.effectiveTo ? values.effectiveTo.toISOString() : "",
        signedBy: values.signedBy || "",
        title: values.title || "",
        tags: Array.isArray(values.tags) ? values.tags.filter(Boolean) : [],
        description: htmlDescription || "",
        documentTypeId: values.type || "",
        file: selectedFile,
        isPublic: isPublicState,
        folderId: values.folderId || selectedFolderId || "",
      };

      setIsUploading(true);
      await createNewVersion(id, formValues); // Sử dụng API createNewVersion thay vì recreateDocument
      toast.success("Tạo version mới thành công!");
      
      // Reset form sau khi upload thành công
      form.resetFields();
      setHtmlDescription("");
      setHtmlSummary("");
      setSelectedFile(null);
      setIsPublicState(false);
      
      navigate(-1); // hoặc chuyển hướng sang trang chi tiết mới nếu muốn
    } catch (error: any) {
      if (error.errorFields) {
        toast.error("Please check the form information again!");
      } else {
        toast.error(`Failed to create new version. Please try again! ${error?.response?.data?.message}`);
        console.error(error);
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileUpload = async (info: any) => {
    const { file } = info;

    // Nếu file bị xóa
    if (file.status === 'removed') {
      setSelectedFile(null);
      setHtmlDescription("");
      setHtmlSummary("");
      setIsAnalyzed(false);
      form.resetFields();
      return;
    }

    // Lấy file object - có thể là originFileObj hoặc chính file đó
    const fileObj = file.originFileObj || file;
    
    // Kiểm tra xem có phải là File object không
    if (fileObj && fileObj instanceof File) {
      console.log("Processing file:", fileObj.name, fileObj.size);
      
      // Lưu file vào state
      setSelectedFile(fileObj);
      setIsAnalyzed(false);
      setHtmlDescription("");
      setHtmlSummary("");
      form.resetFields();
      toast.success("File uploaded successfully! Click 'Analyze' to extract document information.");
    }
  };

  const handleAnalyzeDocument = async () => {
    if (!selectedFile) {
      toast.error("Please upload a file first!");
      return;
    }

    setIsAnalyzing(true);
    setAnalysisStep('extracting');
    setIsAnalyzed(false); // Reset analyzed state when starting new analysis

    // Clear previous analysis data
    setHtmlDescription("");
    setHtmlSummary("");
    form.resetFields(['title', 'versionName', 'tags', 'effectiveFrom', 'effectiveTo', 'signedBy']);

    try {
      // Simulate realistic step progression for better UX
      // Total: 15 seconds (5s extracting, 5s analyzing, 5s generating)
      setTimeout(() => setAnalysisStep('analyzing'), 5000);  // After 5s: start analyzing
      setTimeout(() => setAnalysisStep('generating'), 10000); // After 10s: start generating (remaining 5s)

      const analyzeResult = await analyzeDocument(selectedFile);
      const analyzedData = analyzeResult.data;

      setHtmlDescription(analyzedData.description || "");
      setHtmlSummary(analyzedData.summary || "");
      setIsAnalyzed(true);

      form.setFieldsValue({
        title: analyzedData.title || "",
        versionName: analyzedData.versionName || "",
        tags: analyzedData.tags || [],
        effectiveFrom: analyzedData.effectiveFrom ? moment(analyzedData.effectiveFrom) : null,
        effectiveTo: analyzedData.effectiveUntil ? moment(analyzedData.effectiveUntil) : null,
        signedBy: analyzedData.signedBy || "",
      });

      toast.success("Document analyzed successfully!");
    } catch (error: any) {
      console.error("Analysis error:", error);

      // Handle specific error cases
      const errorResponse = error?.response?.data;
      if (errorResponse?.errorCode === "CONFLICT") {
        toast.error(`File already exists: ${errorResponse.message}`, {
          duration: 6000,
          style: {
            maxWidth: '500px',
          }
        });
      } else {
        toast.error("Failed to analyze document. Please try again!");
      }
    } finally {
      setIsAnalyzing(false);
      setAnalysisStep('idle');
    }
  };

  const handleRegenerateSummary = async () => {
    if (!selectedFile) {
      toast.error("Please upload a file first!");
      return;
    }

    setIsRegeneratingSummary(true);
    try {
      const summaryResult = await regenerateSummary(selectedFile);
      const summaryData = summaryResult.data;
      setHtmlSummary(summaryData.summary || summaryData || "");
      toast.success("Summary regenerated successfully!");
    } catch (error) {
      toast.error("Failed to regenerate summary. Please try again!");
      console.error("Summary regeneration error:", error);
    } finally {
      setIsRegeneratingSummary(false);
    }
  };

  const handleNext = () => {
    if (!selectedFile) {
      toast.error("Please upload a file first!");
      return;
    }

    if (!isAnalyzed) {
      toast.error("Please analyze the document first!");
      return;
    }

    setMode('create');
  };

  const uploadProps = {
    name: "file",
    multiple: false,
    accept: ".pdf,.docx",
    beforeUpload: () => false,
    onChange: handleFileUpload,
    disabled: isUploading || isAnalyzing || isRegeneratingSummary,
    showUploadList: {
      showPreviewIcon: true,
      showRemoveIcon: !isUploading && !isRegeneratingSummary,
      showDownloadIcon: false,
    },
    maxCount: 1,
  }

  const isAnyOperationInProgress = isUploading || isAnalyzing || isRegeneratingSummary;

  return (
    <Layout style={{ minHeight: "100vh", backgroundColor: "#f5f5f5" }}>
      <Content style={{ padding: "14px" }}>
        <div style={{ margin: "0 auto" }}>
          {/* Header */}
          <div style={{ marginBottom: 24 }}>
            <Title level={2} style={{ margin: 0 }}>
              {mode === 'upload' ? 'Create New Version - Upload File' : 'Create New Version'}
            </Title>
            <Text type="secondary">
              {mode === 'upload'
                ? 'Upload a new file to create a new version and analyze it with AI to extract metadata'
                : 'Complete your document details to create the new version'
              }
            </Text>
          </div>

          {/* Step 1: Document Upload */}
          {mode === 'upload' && (
            <Row gutter={[24, 24]}>
              <Col xs={24} lg={16}>
                <Card
                  title={
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <UploadOutlined style={{ marginRight: 8, color: "#1890ff" }} />
                      Step 1: Upload New Document File
                    </div>
                  }
                  style={{ marginBottom: 24 }}
                >
                  <Text type="secondary" style={{ display: "block", marginBottom: 16 }}>
                    Upload a new PDF or DOCX file to create a new version.
                  </Text>

                  <Dragger
                    {...uploadProps}
                    style={{
                      padding: "40px 20px",
                      marginBottom: 16
                    }}
                  >
                    <p className="ant-upload-drag-icon">
                      <InboxOutlined style={{ fontSize: 48, color: "#d9d9d9" }} />
                    </p>
                    <p style={{ fontSize: 16, marginBottom: 8 }}>
                      Drag and drop your file here, or click to browse
                    </p>
                    <Button type="default">
                      Choose File
                    </Button>
                    <p style={{ color: "#999", fontSize: 12, marginTop: 8 }}>
                      Supported formats: PDF, DOCX (max 3MB)
                    </p>
                  </Dragger>

                  {selectedFile && (
                    <Card size="small" style={{ backgroundColor: '#f6ffed', borderColor: '#b7eb8f', marginBottom: 16 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <Text strong>Uploaded File:</Text>
                          <div style={{ marginTop: 4 }}>
                            <Text>{selectedFile.name}</Text>
                            <Text type="secondary" style={{ marginLeft: 8 }}>
                              ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                            </Text>
                          </div>
                        </div>
                        <Button
                          type="primary"
                          onClick={handleAnalyzeDocument}
                          loading={isAnalyzing}
                          disabled={isAnyOperationInProgress}
                        >
                          {isAnalyzing ? (
                            analysisStep === 'extracting' ? 'Extracting text...' :
                            analysisStep === 'analyzing' ? 'Analyzing document...' :
                            analysisStep === 'generating' ? 'Generating response...' :
                            'Processing...'
                          ) : 'Analyze Document'}
                        </Button>
                      </div>
                    </Card>
                  )}

                  {/* Analysis Progress */}
                  {isAnalyzing && (
                    <Card size="small" style={{ marginBottom: 16 }}>
                      <div style={{ marginBottom: 8 }}>
                        <Text strong>
                          {analysisStep === 'extracting' ? '📄 Extracting text from document...' :
                           analysisStep === 'analyzing' ? '🔍 Analyzing document structure...' :
                           analysisStep === 'generating' ? '✨ Generating AI response...' :
                           '🔄 Processing...'}
                        </Text>
                      </div>
                      <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
                        <Text type="secondary">
                          {analysisStep === 'extracting' ? 'Reading document content and extracting text...' :
                           analysisStep === 'analyzing' ? 'Analyzing structure, metadata, and key information...' :
                           analysisStep === 'generating' ? 'AI is generating summary and extracting details...' :
                           'Initializing analysis...'}
                        </Text>
                      </div>
                    </Card>
                  )}

                  {isAnalyzed && (
                    <Card
                      size="small"
                      title="Analysis Complete"
                      style={{ backgroundColor: '#e6f7ff', borderColor: '#91d5ff', marginBottom: 16 }}
                    >
                      <Text type="secondary">
                        Document analyzed successfully! Review the extracted information below and click "Next" to proceed.
                      </Text>
                    </Card>
                  )}
                </Card>
              </Col>

              <Col xs={24} lg={8}>
                <Card
                  title="Creation Progress"
                  style={{ height: "fit-content" }}
                >
                  <div style={{ padding: "20px 0" }}>
                    <div style={{ marginBottom: 16 }}>
                      <div style={{ display: "flex", alignItems: "center", marginBottom: 8 }}>
                        <div style={{
                          width: 24,
                          height: 24,
                          borderRadius: "50%",
                          backgroundColor: selectedFile ? "#52c41a" : "#d9d9d9",
                          color: "white",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 12,
                          marginRight: 8
                        }}>
                          1
                        </div>
                        <Text strong style={{ color: selectedFile ? "#52c41a" : "#999" }}>
                          Upload File
                        </Text>
                      </div>
                      <Text type="secondary" style={{ marginLeft: 32, fontSize: 12 }}>
                        {selectedFile ? "✓ File uploaded" : "Upload a new document file"}
                      </Text>
                    </div>

                    <div style={{ marginBottom: 16 }}>
                      <div style={{ display: "flex", alignItems: "center", marginBottom: 8 }}>
                        <div style={{
                          width: 24,
                          height: 24,
                          borderRadius: "50%",
                          backgroundColor: isAnalyzed ? "#52c41a" : (isAnalyzing ? "#1890ff" : "#d9d9d9"),
                          color: "white",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 12,
                          marginRight: 8
                        }}>
                          {isAnalyzing ? <Spin size="small" /> : "2"}
                        </div>
                        <Text strong style={{ color: isAnalyzed ? "#52c41a" : (isAnalyzing ? "#1890ff" : "#999") }}>
                          Analyze Document
                        </Text>
                      </div>
                      <Text type="secondary" style={{ marginLeft: 32, fontSize: 12 }}>
                        {isAnalyzed ? "✓ Analysis complete" : (
                          isAnalyzing ? (
                            analysisStep === 'extracting' ? "📄 Extracting text..." :
                            analysisStep === 'analyzing' ? "🔍 Analyzing document..." :
                            analysisStep === 'generating' ? "✨ Generating response..." :
                            "Processing..."
                          ) : "Extract document metadata"
                        )}
                      </Text>
                    </div>

                    <div>
                      <div style={{ display: "flex", alignItems: "center", marginBottom: 8 }}>
                        <div style={{
                          width: 24,
                          height: 24,
                          borderRadius: "50%",
                          backgroundColor: mode !== "upload" ? "#52c41a" : "#d9d9d9",
                          color: "white",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 12,
                          marginRight: 8
                        }}>
                          3
                        </div>
                        <Text strong style={{ color: mode !== 'upload' ? "#52c41a" : "#999" }}>
                          Create New Version
                        </Text>
                      </div>
                      <Text type="secondary" style={{ marginLeft: 32, fontSize: 12 }}>
                        {mode !== 'upload' ? "✓ Ready to create" : "Complete version creation"}
                      </Text>
                    </div>
                  </div>
                </Card>
              </Col>
            </Row>
          )}

          {/* Document Analysis Results */}
          {isAnalyzed && mode === 'upload' && (
            <Card
              title="Step 2: Review Extracted Information"
              style={{ marginBottom: 24 }}
            >
              <Text type="secondary" style={{ display: "block", marginBottom: 16 }}>
                Review the information extracted from your document. You can edit any field before proceeding.
              </Text>

              <Form form={form} layout="vertical">
                <Row gutter={16}>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      name="title"
                      label="Document Title"
                      rules={[{ required: true, message: "Please enter document title" }]}
                    >
                      <Input placeholder="Enter document title" disabled={isAnyOperationInProgress} />
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
                        disabled={isAnyOperationInProgress}
                      >
                        {documentTypes.map(type => (
                          <Select.Option key={type.id} value={type.id}>
                            {type.name}
                          </Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      name="versionName"
                      label="Version Name"
                      rules={[{ required: true, message: "Please enter version name" }]}
                    >
                      <Input placeholder="Enter version name" disabled={isAnyOperationInProgress} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item name="signedBy" label="Signed By">
                      <Input placeholder="Name of the person who signed the document" disabled={isAnyOperationInProgress} />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col xs={24} sm={12}>
                    <Form.Item name="effectiveFrom" label="Effective From">
                      <DatePicker style={{ width: "100%" }} disabled={isAnyOperationInProgress} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item name="effectiveTo" label="Effective Until">
                      <DatePicker style={{ width: "100%" }} disabled={isAnyOperationInProgress} />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item label="Description">
                  <WysiwygEditor
                    value={htmlDescription}
                    onChange={(e) => !isAnyOperationInProgress && setHtmlDescription(e.target.value)}
                    className="wysiwyg-editor"
                  />
                </Form.Item>

                <Form.Item
                  label={
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
                      <span>Summary</span>
                      <Button
                        type="link"
                        size="small"
                        onClick={handleRegenerateSummary}
                        disabled={!selectedFile || isAnyOperationInProgress}
                        loading={isRegeneratingSummary}
                        style={{ padding: "0 8px", fontSize: "12px" }}
                      >
                        {isRegeneratingSummary ? (
                          <>
                            <Spin size="small" style={{ marginRight: 4 }} />
                            Regenerating...
                          </>
                        ) : (
                          "🔄 Regenerate Summary"
                        )}
                      </Button>
                    </div>
                  }
                >
                  <WysiwygEditor
                    value={htmlSummary}
                    onChange={(e) => !isAnyOperationInProgress && setHtmlSummary(e.target.value)}
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
                              <Input placeholder={`Tag ${index + 1}`} disabled={isAnyOperationInProgress} />
                            </Form.Item>
                            {fields.length > 1 && (
                              <Button 
                                type="link" 
                                danger 
                                onClick={() => remove(field.name)}
                                disabled={isAnyOperationInProgress}
                              >
                                Remove
                              </Button>
                            )}
                          </Space>
                        ))}
                        <Button 
                          type="dashed" 
                          onClick={() => add()} 
                          style={{ marginTop: 8 }}
                          disabled={isAnyOperationInProgress}
                        >
                          + Add Tag
                        </Button>
                      </>
                    )}
                  </Form.List>
                </Form.Item>

                <Row gutter={16}>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      name="folderId"
                      label={
                        <span>
                          <FolderOutlined style={{ marginRight: 4 }} />
                          Folder Location
                        </span>
                      }
                    >
                      <FolderSelectorInput
                        selectedFolderId={selectedFolderId}
                        onFolderSelect={(folderId) => {
                          setSelectedFolderId(folderId);
                          form.setFieldValue('folderId', folderId);
                        }}
                        placeholder="Select folder (optional)"
                        allowClear={true}
                        filterPermission="write"
                        disabled={isAnyOperationInProgress}
                        treeType={isPublicState ? 'public' : 'department'}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      name="isPublic"
                      label="Document Visibility"
                      valuePropName="checked"
                      initialValue={false}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Switch 
                          checked={isPublicState}
                          onChange={handleSwitchChange}
                          disabled={isAnyOperationInProgress}
                        />
                        <Text>Make this document public</Text>
                      </div>
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item style={{ marginTop: 32, textAlign: "center" }}>
                  <Button
                    type="primary"
                    size="large"
                    icon={<ArrowRightOutlined />}
                    onClick={handleNext}
                    disabled={isAnyOperationInProgress}
                    style={{
                      height: "48px",
                      fontSize: "16px",
                      paddingLeft: "32px",
                      paddingRight: "32px"
                    }}
                  >
                    Next: Create New Version
                  </Button>
                </Form.Item>
              </Form>
            </Card>
          )}

          {/* Step 3: Create New Version Form */}
          {mode === 'create' && (
            <Card
              title="Create New Version"
              style={{ marginBottom: 24 }}
            >
              <Form form={form} layout="vertical">
                <Row gutter={16}>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      name="title"
                      label="Document Title"
                      rules={[{ required: true, message: "Please enter document title" }]}
                    >
                      <Input placeholder="Enter document title" disabled={isAnyOperationInProgress} />
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
                        disabled={isAnyOperationInProgress}
                      >
                        {documentTypes.map((type) => (
                          <Select.Option key={type.id} value={type.id}>
                            {type.name}
                          </Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      name="versionName"
                      label="Version Name"
                      rules={[{ required: true, message: "Please enter version name" }]}
                    >
                      <Input placeholder="Enter version name" disabled={isAnyOperationInProgress} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item name="signedBy" label="Signed By">
                      <Input placeholder="Name of the person who signed the document" disabled={isAnyOperationInProgress} />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col xs={24} sm={12}>
                    <Form.Item name="effectiveFrom" label="Effective From">
                      <DatePicker style={{ width: "100%" }} disabled={isAnyOperationInProgress} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item name="effectiveTo" label="Effective Until">
                      <DatePicker style={{ width: "100%" }} disabled={isAnyOperationInProgress} />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item label="Description">
                  <WysiwygEditor
                    value={htmlDescription}
                    onChange={(e) => !isAnyOperationInProgress && setHtmlDescription(e.target.value)}
                    placeholder="Brief description of the document"
                    className="wysiwyg-editor"
                  />
                </Form.Item>

                <Form.Item
                  label={
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
                      <span>Summary</span>
                      <Button
                        type="link"
                        size="small"
                        onClick={handleRegenerateSummary}
                        disabled={!selectedFile || isAnyOperationInProgress}
                        loading={isRegeneratingSummary}
                        style={{ padding: "0 8px", fontSize: "12px" }}
                      >
                        {isRegeneratingSummary ? (
                          <>
                            <Spin size="small" style={{ marginRight: 4 }} />
                            Regenerating...
                          </>
                        ) : (
                          "🔄 Regenerate Summary"
                        )}
                      </Button>
                    </div>
                  }
                >
                  <WysiwygEditor
                    value={htmlSummary}
                    onChange={(e) => !isAnyOperationInProgress && setHtmlSummary(e.target.value)}
                    placeholder="Document summary"
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
                              <Input placeholder={`Tag ${index + 1}`} disabled={isAnyOperationInProgress} />
                            </Form.Item>
                            {fields.length > 1 && (
                              <Button 
                                type="link" 
                                danger 
                                onClick={() => remove(field.name)}
                                disabled={isAnyOperationInProgress}
                              >
                                Remove
                              </Button>
                            )}
                          </Space>
                        ))}
                        <Button 
                          type="dashed" 
                          onClick={() => add()} 
                          style={{ marginTop: 8 }}
                          disabled={isAnyOperationInProgress}
                        >
                          + Add Tag
                        </Button>
                      </>
                    )}
                  </Form.List>
                </Form.Item>

                <Row gutter={16}>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      name="folderId"
                      label={
                        <span>
                          <FolderOutlined style={{ marginRight: 4 }} />
                          Folder Location
                        </span>
                      }
                    >
                      <FolderSelectorInput
                        selectedFolderId={selectedFolderId}
                        onFolderSelect={(folderId) => {
                          setSelectedFolderId(folderId);
                          form.setFieldValue('folderId', folderId);
                        }}
                        placeholder="Select folder (optional)"
                        allowClear={true}
                        filterPermission="write"
                        disabled={isAnyOperationInProgress}
                        treeType={isPublicState ? 'public' : 'department'}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      name="isPublic"
                      label="Document Visibility"
                      valuePropName="checked"
                      initialValue={false}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Switch 
                          checked={isPublicState}
                          onChange={handleSwitchChange}
                          disabled={isAnyOperationInProgress}
                        />
                        <Text>Make this document public</Text>
                      </div>
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item style={{ marginTop: 32 }}>
                  <Space>
                    <Button
                      disabled={isAnyOperationInProgress}
                      onClick={() => {
                        if (mode === 'create') {
                          setMode('upload');
                        } else {
                          navigate(-1);
                        }
                      }}
                    >
                      {mode === 'create' ? 'Back' : 'Cancel'}
                    </Button>
                    <Button
                      type="primary"
                      onClick={handleSubmit}
                      icon={isUploading ? <Spin size="small" /> : <UploadOutlined />}
                      loading={isUploading}
                      disabled={!selectedFile || isAnyOperationInProgress}
                    >
                      {isUploading ? "Creating Version..." : "Create New Version"}
                    </Button>
                  </Space>
                </Form.Item>
              </Form>
            </Card>
          )}

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
