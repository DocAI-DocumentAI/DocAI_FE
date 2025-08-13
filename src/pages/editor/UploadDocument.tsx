import { Layout, Typography, Card, Button, Input, Select, DatePicker, Upload, Form, Row, Col, Space, Spin, Switch } from "antd"
import {  UploadOutlined, InboxOutlined, ArrowRightOutlined, FolderOutlined } from "@ant-design/icons"
import { uploadDraftDocument, analyzeDocument, regenerateSummary, getDocumentTypes, submitDocumentForApproval, DocumentType } from "../../lib/api/document";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import WysiwygEditor from 'react-simple-wysiwyg';
import toast from 'react-hot-toast';
import moment from "moment";
import { FolderSelectorInput } from "../../components/folder";
import FolderDebug from "../../components/debug/FolderDebug";
import TreeFolderSelectorTest from "../../components/debug/TreeFolderSelectorTest";

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

export default function UploadDocument() {
  const [form] = Form.useForm()
  const navigate = useNavigate();
  const location = useLocation();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [htmlDescription, setHtmlDescription] = useState("");
  const [htmlSummary, setHtmlSummary] = useState("");
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([]);
  const [loadingDocumentTypes, setLoadingDocumentTypes] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isAnalyzed, setIsAnalyzed] = useState(false);
  const [mode, setMode] = useState<'upload' | 'create-new'>('upload');
  const [isRegeneratingSummary, setIsRegeneratingSummary] = useState(false);

  // Thêm state để track switch value
  const [isPublicState, setIsPublicState] = useState(false);
  const [selectedFolderId, setSelectedFolderId] = useState<string | undefined>(undefined);

  // Load document types on component mount and handle pre-filled data
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

    // Handle pre-filled data from document choice step
    if (location.state?.analysisData && location.state?.mode === 'create-new') {
      const analysisData = location.state.analysisData;
      setMode('create-new');
      setSelectedFile(analysisData.file);
      setHtmlDescription(analysisData.description || "");
      setHtmlSummary(analysisData.summary || "");
      setIsAnalyzed(true);

      form.setFieldsValue({
        title: analysisData.title || "",
        versionName: analysisData.versionName || "",
        tags: analysisData.tags || [],
        effectiveFrom: analysisData.effectiveFrom ? moment(analysisData.effectiveFrom) : null,
        effectiveTo: analysisData.effectiveUntil ? moment(analysisData.effectiveUntil) : null,
        signedBy: analysisData.signedBy || "",
        type: analysisData.documentTypeId || "",
      });
    }
  }, [location.state, form]);

  // Kiểm tra và debug giá trị isPublic
  const handleDocumentAction = async (values: any, action: 'draft' | 'submit') => {
    // Debug để xem values có gì
    console.log('=== FORM VALUES DEBUG ===');
    console.log('All form values:', values);
    console.log('isPublic value:', values.isPublic);
    console.log('isPublic type:', typeof values.isPublic);
    console.log('=== END DEBUG ===');
    
    // Kiểm tra file
    if (!selectedFile) {
      toast.error("Please select a file to upload!");
      return;
    }

    // Map các trường form sang đúng tên API
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      toast.error("User information not found, please login again!");
      return;
    }
    
    const formValues = {
      title: values.title || "",
      versionName: values.versionName || "",
      summary: htmlSummary || "",
      signedBy: values.signedBy || "",
      description: htmlDescription || "",
      effectiveFrom: values.effectiveFrom ? values.effectiveFrom.toISOString() : "",
      effectiveUntil: values.effectiveTo ? values.effectiveTo.toISOString() : "",
      tags: Array.isArray(values.tags) ? values.tags.filter(Boolean) : [],
      file: selectedFile,
      documentTypeId: values.type || "",
      isPublic: values.isPublic === true, // Đảm bảo là boolean
    };

    console.log('=== FINAL PAYLOAD DEBUG ===');
    console.log('formValues.isPublic:', formValues.isPublic);
    console.log('formValues.isPublic type:', typeof formValues.isPublic);
    console.log('=== END FINAL DEBUG ===');

    const isSubmitting = action === 'submit';
    setIsUploading(true);
    if (isSubmitting) setIsSubmitting(true);

    try {
      console.log(`${action === 'draft' ? 'Saving as draft' : 'Submitting document'}...`, formValues);

      // First, upload as draft
      const uploadResponse = await uploadDraftDocument(formValues);

      if (action === 'submit' && uploadResponse?.versionId) {
        // If submitting, also call submit API
        await submitDocumentForApproval(uploadResponse.versionId);
        toast.success("Document submitted for approval successfully!");
      } else {
        toast.success("Document saved as draft successfully!");
      }

      // Reset form after successful action
      form.resetFields();
      setHtmlDescription("");
      setHtmlSummary("");
      setSelectedFile(null);

      // Navigate back to document management
      navigate('/editor/my-document');
    } catch (error: any) {
      const actionText = action === 'draft' ? 'save draft' : 'submit document';
      toast.error(`Failed to ${actionText}. Please try again! ${error?.response?.data?.message || ''}`);
      console.error(error);
    } finally {
      setIsUploading(false);
      if (isSubmitting) setIsSubmitting(false);
    }
  };

  const handleSubmitForApproval = async (values: any) => {
    // Debug trước khi gọi handleDocumentAction
    console.log('=== SUBMIT FOR APPROVAL DEBUG ===');
    console.log('Values passed to submit:', values);
    console.log('isPublic in submit:', values.isPublic);
    console.log('=== END SUBMIT DEBUG ===');
    
    await handleDocumentAction(values, 'submit');
  };

  const handleSaveAsDraft = async (values: any) => {
    // Debug trước khi gọi handleDocumentAction
    console.log('=== SAVE AS DRAFT DEBUG ===');
    console.log('Values passed to draft:', values);
    console.log('isPublic in draft:', values.isPublic);
    console.log('=== END DRAFT DEBUG ===');
    
    await handleDocumentAction(values, 'draft');
  };

  const handleFileUpload = async (info: any) => {
    const { file } = info;
    console.log("File info:", file);
    console.log("File originFileObj:", file.originFileObj);
    console.log("File status:", file.status);

    // If file is removed
    if (file.status === 'removed') {
      setSelectedFile(null);
      setHtmlDescription("");
      setHtmlSummary("");
      setIsAnalyzed(false);
      form.resetFields();
      return;
    }

    // Get file object - could be originFileObj or the file itself
    const fileObj = file.originFileObj || file;

    // Check if it's a valid File object
    if (fileObj && fileObj instanceof File) {
      console.log("Processing file:", fileObj.name, fileObj.size);

      // Save file to state
      setSelectedFile(fileObj);
      setIsAnalyzed(false); // Reset analysis state

      // Clear any previous analysis data
      setHtmlDescription("");
      setHtmlSummary("");
      form.resetFields();

      toast.success("File uploaded successfully! Click 'Analyze' to extract document information.");
    } else {
      console.log("No valid file object found");
    }
  };

  // Separate function to handle document analysis (without summary)
  const handleAnalyzeDocument = async () => {
    if (!selectedFile) {
      toast.error("Please upload a file first!");
      return;
    }

    setIsAnalyzing(true);
    try {
      console.log("Analyzing document...");

      // Only call analyze API, not regenerate summary
      const analyzeResult = await analyzeDocument(selectedFile);
      const analyzedData = analyzeResult.data;

      console.log("Analyze result:", analyzedData);

      // Save analysis data to state (including summary from analyze response)
      setHtmlDescription(analyzedData.description || "");
      setHtmlSummary(analyzedData.summary || ""); // Populate summary from analyze response
      setIsAnalyzed(true);

      // Auto-fill form with analyzed data
      form.setFieldsValue({
        title: analyzedData.title || "",
        versionName: analyzedData.versionName || "",
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
  };

  // Separate function to regenerate summary only
  const handleRegenerateSummary = async () => {
    if (!selectedFile) {
      toast.error("Please upload a file first!");
      return;
    }

    setIsRegeneratingSummary(true);
    try {
      console.log("Regenerating summary...");

      const summaryResult = await regenerateSummary(selectedFile);
      const summaryData = summaryResult.data;

      console.log("Summary result:", summaryData);

      // Update only the summary
      setHtmlSummary(summaryData.summary || summaryData || "");

      toast.success("Summary regenerated successfully!");
    } catch (error) {
      toast.error("Failed to regenerate summary. Please try again!");
      console.error("Summary regeneration error:", error);
    } finally {
      setIsRegeneratingSummary(false);
    }
  };

  // Handle next button click
  const handleNext = () => {
    if (!selectedFile) {
      toast.error("Please upload a file first!");
      return;
    }

    if (!isAnalyzed) {
      toast.error("Please analyze the document first!");
      return;
    }

    // Prepare analysis data for navigation
    const analysisData = {
      title: form.getFieldValue('title') || "",
      versionName: form.getFieldValue('versionName') || "",
      description: htmlDescription || "",
      summary: htmlSummary || "",
      tags: form.getFieldValue('tags') || [],
      effectiveFrom: form.getFieldValue('effectiveFrom')?.toISOString() || "",
      effectiveUntil: form.getFieldValue('effectiveTo')?.toISOString() || "",
      signedBy: form.getFieldValue('signedBy') || "",
      documentTypeId: form.getFieldValue('type') || "",
      file: selectedFile
    };

    // Navigate to document choice page
    navigate('/editor/document-choice', {
      state: { analysisData }
    });
  };

  const isAnyOperationInProgress = isUploading || isAnalyzing || isRegeneratingSummary;

  const uploadProps = {
    name: "file",
    multiple: false,
    accept: ".pdf,.docx",
    beforeUpload: () => false,
    onChange: handleFileUpload,
    disabled: isAnyOperationInProgress,
    showUploadList: {
      showPreviewIcon: true,
      showRemoveIcon: !isAnyOperationInProgress,
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
              {mode === 'upload' ? 'Upload New Document' : 'Create New Document'}
            </Title>
            <Text type="secondary">
              {mode === 'upload'
                ? 'Upload a document and analyze it with AI to extract metadata'
                : 'Complete your document details and save or submit for approval'
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
                      Step 1: Upload Document
                    </div>
                  }
                  style={{ marginBottom: 24 }}
                >
                  <Text type="secondary" style={{ display: "block", marginBottom: 16 }}>
                    Upload a PDF or DOCX file to get started.
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
                      Supported formats: PDF, DOCX (max 5MB)
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
                          disabled={isAnalyzing}
                        >
                          {isAnalyzing ? 'Analyzing...' : 'Analyze Document'}
                        </Button>
                      </div>
                    </Card>
                  )}

                  {/* Analysis Results */}
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
                  title="Upload Progress"
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
                        {selectedFile ? "✓ File uploaded" : "Upload a document file"}
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
                        {isAnalyzed ? "✓ Analysis complete" : (isAnalyzing ? "Analyzing..." : "Extract document metadata")}
                      </Text>
                    </div>

                    <div>
                      <div style={{ display: "flex", alignItems: "center", marginBottom: 8 }}>
                        <div style={{
                          width: 24,
                          height: 24,
                          borderRadius: "50%",
                          backgroundColor: "#d9d9d9",
                          color: "white",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 12,
                          marginRight: 8
                        }}>
                          3
                        </div>
                        <Text strong style={{ color: "#999" }}>
                          Choose Action
                        </Text>
                      </div>
                      <Text type="secondary" style={{ marginLeft: 32, fontSize: 12 }}>
                        Select create new or replace existing
                      </Text>
                    </div>
                  </div>
                </Card>
              </Col>
            </Row>
          )}

          {/* Document Analysis Results (show when analyzed) */}
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
                      <Input placeholder="Enter version name" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item name="signedBy" label="Signed By">
                      <Input placeholder="Name of the person who signed the document" />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col xs={24} sm={12}>
                    <Form.Item name="effectiveFrom" label="Effective From">
                      <DatePicker style={{ width: "100%" }} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item name="effectiveTo" label="Effective Until">
                      <DatePicker style={{ width: "100%" }} />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item label="Description">
                  <WysiwygEditor
                    value={htmlDescription}
                    onChange={(e) => setHtmlDescription(e.target.value)}
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
                    onChange={(e) => setHtmlSummary(e.target.value)}
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

                <Row gutter={16}>
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
                          onChange={(checked) => {
                            console.log('Switch changed to:', checked);
                            setIsPublicState(checked);
                            form.setFieldValue('isPublic', checked);
                            
                            // Verify form value after setting
                            setTimeout(() => {
                              console.log('Form value after change:', form.getFieldValue('isPublic'));
                            }, 0);
                          }}
                        />
                        <Text>Make this document public</Text>
                        {/* Debug display */}
                       
                      </div>
                    </Form.Item>
                  </Col>
                </Row>

                {/* Next Button */}
                <Form.Item style={{ marginTop: 32, textAlign: "center" }}>
                  <Button
                    type="primary"
                    size="large"
                    icon={<ArrowRightOutlined />}
                    onClick={handleNext}
                    style={{
                      height: "48px",
                      fontSize: "16px",
                      paddingLeft: "32px",
                      paddingRight: "32px"
                    }}
                  >
                    Next: Choose Action
                  </Button>
                </Form.Item>
              </Form>
            </Card>
          )}

          {/* Step 3: Document Form (only show when in create-new mode) */}
          {mode === 'create-new' && (
            <Card
              title="Create New Document"
              style={{ marginBottom: 24 }}
            >
              <Form form={form} layout="vertical" onFinish={handleSaveAsDraft}>
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
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    {/* Empty column for spacing */}
                  </Col>
                </Row>

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
                  <Col xs={24} sm={12}>
                    <Form.Item name="signedBy" label="Signed By">
                      <Input placeholder="Name of the person who signed the document" />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col xs={24} sm={12}>
                    <Form.Item name="effectiveFrom" label="Effective From">
                      <DatePicker style={{ width: "100%" }} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item name="effectiveTo" label="Effective Until">
                      <DatePicker style={{ width: "100%" }} />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item label="Description">
                  <WysiwygEditor
                    value={htmlDescription}
                    onChange={(e) => setHtmlDescription(e.target.value)}
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
                    onChange={(e) => setHtmlSummary(e.target.value)}
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

                <Row gutter={16}>
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
                          onChange={(checked) => {
                            console.log('Switch changed to:', checked);
                            setIsPublicState(checked);
                            form.setFieldValue('isPublic', checked);
                            
                            // Verify form value after setting
                            setTimeout(() => {
                              console.log('Form value after change:', form.getFieldValue('isPublic'));
                            }, 0);
                          }}
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
                      disabled={isUploading || isSubmitting}
                      onClick={() => navigate('/editor/document-choice', {
                        state: { analysisData: location.state?.analysisData }
                      })}
                    >
                      Back
                    </Button>
                    <Button
                      onClick={() => form.submit()}
                      icon={isUploading ? <Spin size="small" /> : <UploadOutlined />}
                      loading={isUploading}
                      disabled={isSubmitting || !selectedFile}
                    >
                      {isUploading ? "Saving..." : "Save as Draft"}
                    </Button>
                    <Button
                      type="primary"
                      onClick={() => {
                        form.validateFields().then(values => {
                          console.log('=== BUTTON CLICK VALUES ===');
                          console.log('Validated values:', values);
                          console.log('isPublic from validation:', values.isPublic);
                          console.log('=== END BUTTON CLICK ===');
                          
                          handleSubmitForApproval(values);
                        }).catch(errorInfo => {
                          console.log('Form validation failed:', errorInfo);
                        });
                      }}
                      icon={isSubmitting ? <Spin size="small" /> : <UploadOutlined />}
                      loading={isSubmitting}
                      disabled={isUploading || !selectedFile}
                    >
                      {isSubmitting ? "Submitting..." : "Submit"}
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
                  <Title level={4} style={{ margin: 0 }}>Uploading Document</Title>
                  <Text type="secondary">Please wait while we process your document...</Text>
                </div>
              </Card>
            </div>
          )}
        </div>
      </Content>

      {/* Debug Components - Remove in production */}
      <FolderDebug />
      <TreeFolderSelectorTest />
    </Layout>
  )
}
