import { Layout, Typography, Card, Button, Input, Select, DatePicker, Upload, Form, Row, Col, Space, Spin, Switch } from "antd"
import { UploadOutlined, InboxOutlined, FolderOutlined } from "@ant-design/icons"
import { analyzeDocument, recreateDocument, regenerateSummary, getDocumentTypes, DocumentType } from "../../lib/api/document";
import { api } from "../../lib/api/api";
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

export default function RecreateDocument() {
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
  const [isPublicState, setIsPublicState] = useState(false);
  const [selectedFolderId, setSelectedFolderId] = useState<string | undefined>(undefined);

  useEffect(() => {
    const fetchDocumentTypes = async () => {
      try {
        setLoadingDocumentTypes(true);
        const types = await getDocumentTypes();
        setDocumentTypes(types);

        // Pre-fill data if coming from document detail page
        if (location.state?.documentData && location.state?.mode === 'recreate') {
          const documentData = location.state.documentData;

          setHtmlDescription(documentData.description || "");
          setHtmlSummary(documentData.summary || "");
          setIsPublicState(documentData.isPublic || false);

          const formValues = {
            title: documentData.title || "",
            versionName: documentData.versionName || "",
            tags: documentData.tags || [],
            effectiveFrom: documentData.effectiveFrom ? moment(documentData.effectiveFrom) : null,
            effectiveUntil: documentData.effectiveUntil ? moment(documentData.effectiveUntil) : null,
            signedBy: documentData.signedBy || "",
            type: documentData.documentTypeId || "",
            isPublic: documentData.isPublic || false,
          };

          form.setFieldsValue(formValues);
        }
      } catch (error) {
        console.error("Failed to fetch document types:", error);
        toast.error("Failed to load document types");
      } finally {
        setLoadingDocumentTypes(false);
      }
    };

    fetchDocumentTypes();
  }, [location.state, form]);

  const handleSwitchChange = (checked: boolean) => {
    setIsPublicState(checked);
    form.setFieldValue('isPublic', checked);
    
    // Clear folder selection when switching between public/private
    setSelectedFolderId(undefined);
    form.setFieldValue('folderId', undefined);
  };

  const handleDocumentAction = async (values: any, action: 'draft' | 'submit') => {
    if (!id) {
      toast.error("DocumentId not found on URL!");
      return;
    }
    console.log(123, values);

    // Only require file if we don't have existing document data (i.e., not recreating from rejected document)
    if (!selectedFile && !(location.state?.documentData && location.state?.mode === 'recreate')) {
      toast.error("Please select a file to upload!");
      return;
    }
 
    const formData = {
      title: values.title || "",
      versionName: values.versionName || "",
      description: htmlDescription || "",
      summary: htmlSummary || "",
      tags: values.tags || [],
      effectiveFrom: values.effectiveFrom ? values.effectiveFrom.toISOString() : null,
      effectiveUntil: values.effectiveUntil ? values.effectiveUntil.toISOString() : null,
      signedBy: values.signedBy || "",
      type: values.type || "",
      documentTypeId: values.type || "",
      isPublic: values.isPublic || false,
      folderId: values.folderId || "",
    };

    try {
      setIsUploading(true);
      if (selectedFile) {
        const formData2 = { ...formData, File: selectedFile };
        await recreateDocument(id, formData2);

      } else {
        await recreateDocument(id, formData);
      }

      // First, recreate as draft

      if (action === 'submit') {
        // If submitting, also call submit API

        await api.post(`/document/submit/${id}`);
        toast.success("Document recreated and submitted for approval successfully!");
      } else {
        toast.success("Document recreated as draft successfully!");
      }

      // Reset form and navigate back
      form.resetFields();
      setHtmlDescription("");
      setHtmlSummary("");
      setSelectedFile(null);
      setIsPublicState(false);

      navigate(-1);
    } catch (error: any) {
      if (error.errorFields) {
        toast.error("Please check the form information again!");
      } else {
        const errorMessage = error?.response?.data?.message || error.message;
        toast.error(`${action === 'draft' ? 'Save as draft' : 'Submit'} failed: ${errorMessage}`);
        console.error(error);
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveAsDraft = async (values: any) => {
    await handleDocumentAction(values, 'draft');
  };

  const handleSubmitForApproval = async (values: any) => {
    await handleDocumentAction(values, 'submit');
  };

  const handleFileUpload = async (info: any) => {
    const { file } = info;

    if (file.status === 'removed') {
      setSelectedFile(null);
      setIsAnalyzed(false);
      return;
    }

    const fileObj = file.originFileObj || file;

    if (fileObj && fileObj instanceof File) {
      setSelectedFile(fileObj);
      setIsAnalyzed(false);
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

    try {
      // Simulate realistic step progression for better UX
      // Total: 15 seconds (5s extracting, 5s analyzing, 5s generating)
      setTimeout(() => setAnalysisStep('analyzing'), 5000);  // After 5s: start analyzing
      setTimeout(() => setAnalysisStep('generating'), 10000); // After 10s: start generating (remaining 5s)

      const analyzeResult = await analyzeDocument(selectedFile);
      const analyzedData = analyzeResult.data;

      // Update HTML editors
      setHtmlDescription(analyzedData.description || "");
      setHtmlSummary(analyzedData.summary || "");
      setIsAnalyzed(true);

      // Get current form values to preserve existing data
      const currentValues = form.getFieldsValue();

      // Merge analyzed data with existing data (existing data takes priority)
      const mergedValues = {
        title: currentValues.title || analyzedData.title || "",
        versionName: currentValues.versionName || analyzedData.versionName || "",
        tags: currentValues.tags?.length > 0 ? currentValues.tags : (analyzedData.tags || []),
        effectiveFrom: currentValues.effectiveFrom || (analyzedData.effectiveFrom ? moment(analyzedData.effectiveFrom) : null),
        effectiveUntil: currentValues.effectiveUntil || (analyzedData.effectiveUntil ? moment(analyzedData.effectiveUntil) : null),
        signedBy: currentValues.signedBy || analyzedData.signedBy || "",
        type: currentValues.type || analyzedData.documentTypeId || "",
        isPublic: currentValues.isPublic !== undefined ? currentValues.isPublic : (analyzedData.isPublic || false),
        folderId: currentValues.folderId || "",
      };

      // Update form with merged values
      form.setFieldsValue(mergedValues);

      // Update isPublic state if needed
      if (mergedValues.isPublic !== isPublicState) {
        setIsPublicState(mergedValues.isPublic);
      }

      toast.success("Document analyzed successfully! Information has been updated.");
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
              Recreate Document
            </Title>
            <Text type="secondary">
              {location.state?.documentData
                ? 'Review and modify the document information below. Optionally upload a new file to replace the existing one.'
                : 'Upload a new file and analyze it with AI to extract metadata, then complete the document recreation.'
              }
            </Text>
          </div>

          {/* Single Form Card */}
          <Card title="Document Information" style={{ marginBottom: 24 }}>
            <Form form={form} layout="vertical" onFinish={handleSaveAsDraft}>
              {/* File Upload Section */}
              <div style={{ marginBottom: 32 }}>
                <div style={{ display: "flex", alignItems: "center", marginBottom: 16 }}>
                  <UploadOutlined style={{ marginRight: 8, color: "#1890ff" }} />
                  <Text strong>Upload Document File</Text>
                  {location.state?.documentData && (
                    <Text type="secondary" style={{ marginLeft: 8 }}>(Optional - replace existing file)</Text>
                  )}
                </div>

                {location.state?.documentData && (
                  <div style={{
                    backgroundColor: '#f6ffed',
                    border: '1px solid #b7eb8f',
                    borderRadius: 6,
                    padding: 12,
                    marginBottom: 16
                  }}>
                    <Text strong style={{ color: '#52c41a' }}>✓ Original Document Information Preserved</Text>
                    <div style={{ marginTop: 4 }}>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        Title: {location.state.documentData.title || 'N/A'} |
                        Type: {location.state.documentData.documentTypeId || 'N/A'} |
                        Public: {location.state.documentData.isPublic ? 'Yes' : 'No'}
                      </Text>
                    </div>
                  </div>
                )}

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
                    Supported formats: PDF, DOCX (max 1MB)
                  </p>
                </Dragger>

                {/* Show uploaded file info */}
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

                {/* Analysis Results */}
                {isAnalyzed && (
                  <Card
                    size="small"
                    title="✓ Analysis Complete"
                    style={{ backgroundColor: '#e6f7ff', borderColor: '#91d5ff', marginBottom: 16 }}
                  >
                    <Text type="secondary">
                      Document analyzed successfully! The form below has been updated with extracted information.
                    </Text>
                  </Card>
                )}
              </div>

              {/* Document Details Form */}
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
                  <Form.Item name="effectiveUntil" label="Effective Until">
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

              {/* Action Buttons */}
              <Form.Item style={{ marginTop: 32 }}>
                <Space>
                  <Button
                    disabled={isAnyOperationInProgress}
                    onClick={() => navigate(-1)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => form.submit()}
                    icon={isUploading ? <Spin size="small" /> : <UploadOutlined />}
                    loading={isUploading}
                    disabled={(!selectedFile && !(location.state?.documentData && location.state?.mode === 'recreate')) || isAnyOperationInProgress}
                  >
                    {isUploading ? "Saving..." : "Save as Draft"}
                  </Button>
                  <Button
                    type="primary"
                    onClick={() => {
                      form.validateFields().then(values => {
                        handleSubmitForApproval(values);
                      }).catch(errorInfo => {
                        console.log('Form validation failed:', errorInfo);
                      });
                    }}
                    loading={isUploading}
                    disabled={(!selectedFile && !(location.state?.documentData && location.state?.mode === 'recreate')) || isAnyOperationInProgress}
                  >
                    {isUploading ? "Submitting..." : "Submit for Approval"}
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </Card>

          {/* Loading overlay */}
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
                  <Title level={4} style={{ margin: 0 }}>Recreating Document</Title>
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
