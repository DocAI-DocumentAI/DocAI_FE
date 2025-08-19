import { Layout, Typography, Card, Button, Input, Select, DatePicker, Form, Row, Col, Space, Spin, Switch } from "antd"
import { UploadOutlined, ArrowRightOutlined, FolderOutlined } from "@ant-design/icons"
import { regenerateSummary, getDocumentTypes, DocumentType, editDocument } from "../../lib/api/document";
import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import WysiwygEditor from 'react-simple-wysiwyg';
import toast from 'react-hot-toast';
import moment from "moment";
import { FolderSelectorInput } from "../../components/folder";

const { Title, Text } = Typography
const { Content } = Layout

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

export default function EditDocument() {
  const [form] = Form.useForm()
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [isAnalyzing] = useState(false);
  const [selectedFolderId, setSelectedFolderId] = useState<string | undefined>(undefined);
  const [isUploading, setIsUploading] = useState(false);
  const [isRegeneratingSummary, setIsRegeneratingSummary] = useState(false);
  const [htmlDescription, setHtmlDescription] = useState("");
  const [htmlSummary, setHtmlSummary] = useState("");
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([]);
  const [loadingDocumentTypes, setLoadingDocumentTypes] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isAnalyzed, setIsAnalyzed] = useState(false);
  const [mode, setMode] = useState<'upload' | 'edit'>('upload');
  const [isPublicState, setIsPublicState] = useState(false);

  useEffect(() => {
    const fetchDocumentTypes = async () => {
      try {
        setLoadingDocumentTypes(true);
        const types = await getDocumentTypes();
        setDocumentTypes(types);

        // Set form values after document types are loaded
        if (location.state?.analysisData && location.state?.mode === 'edit') {
          const analysisData = location.state.analysisData;
          setMode('edit');
          setSelectedFile(analysisData.file);
          setHtmlDescription(analysisData.description || "");
          setHtmlSummary(analysisData.summary || "");
          setIsAnalyzed(true);

          const isPublicValue = analysisData.isPublic || false;
          setIsPublicState(isPublicValue);

          const formValues = {
            title: analysisData.title || "",
            tags: analysisData.tags || [],
            effectiveFrom: analysisData.effectiveFrom ? moment(analysisData.effectiveFrom) : null,
            effectiveTo: analysisData.effectiveUntil ? moment(analysisData.effectiveUntil) : null,
            signedBy: analysisData.signedBy || "",
            type: analysisData.documentTypeId || "",
            isPublic: isPublicValue,
            
          };

          form.setFieldsValue(formValues);
        } else if (location.state?.documentData && location.state?.mode === 'edit') {
          // Handle document data from DocumentDetail page
          console.log('🔍 EditDocument: Received document data', location.state);

          const documentData = location.state.documentData;
          // Start in upload mode so user can upload new file, but keep the document data for later
          setMode('upload');
          setHtmlDescription(documentData.description || "");
          setHtmlSummary(documentData.summary || "");
          setIsAnalyzed(false); // No file uploaded yet, user needs to upload new file

          const isPublicValue = documentData.isPublic || false;
          setIsPublicState(isPublicValue);

          const formValues = {
            title: documentData.title || "",
            versionName: documentData.versionName || "",
            tags: documentData.tags || [],
            effectiveFrom: documentData.effectiveFrom ? moment(documentData.effectiveFrom) : null,
            effectiveTo: documentData.effectiveUntil ? moment(documentData.effectiveUntil) : null,
            signedBy: documentData.signedBy || "",
            type: documentData.documentTypeId || "",
            isPublic: isPublicValue,
            
          };

          // Set form values immediately and also with a delay to ensure it sticks
          form.setFieldsValue(formValues);
          setTimeout(() => {
            form.setFieldsValue(formValues);
          }, 500); // Delay to ensure form is ready
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

  // Separate effect to ensure form values are set after document types are loaded
  useEffect(() => {
    if (!loadingDocumentTypes && documentTypes.length > 0 && location.state?.documentData && location.state?.mode === 'edit') {
      const documentData = location.state.documentData;

      const formValues = {
        title: documentData.title || "",
        versionName: documentData.versionName || "",
        tags: documentData.tags || [],
        effectiveFrom: documentData.effectiveFrom ? moment(documentData.effectiveFrom) : null,
        effectiveTo: documentData.effectiveUntil ? moment(documentData.effectiveUntil) : null,
        signedBy: documentData.signedBy || "",
        type: documentData.documentTypeId || "",
        isPublic: documentData.isPublic || false,
      };

      form.setFieldsValue(formValues);
    }
  }, [loadingDocumentTypes, documentTypes, location.state, form]);

  const handleSwitchChange = (checked: boolean) => {
    setIsPublicState(checked);
    form.setFieldValue('isPublic', checked);
  };

  const handleDocumentAction = async (values: any, action: 'draft' | 'submit') => {
    if (!id) {
      toast.error("Không tìm thấy documentId trên URL!");
      return;
    }

    // Only require file if we don't have existing document data (i.e., not editing from rejected document)
    if (!selectedFile && !(location.state?.documentData && location.state?.mode === 'edit')) {
      toast.error("Please select a file to upload!");
      return;
    }

    // Prepare form data for API call
    const formData = new FormData();
    formData.append("Title", values.title || "");
    formData.append("VersionName", values.versionName || "");
    formData.append("Summary", htmlSummary || "");
    formData.append("SignedBy", values.signedBy || "");
    formData.append("Description", htmlDescription || "");
    formData.append("EffectiveFrom", values.effectiveFrom ? values.effectiveFrom.toISOString() : "");
    formData.append("EffectiveUntil", values.effectiveTo ? values.effectiveTo.toISOString() : "");
    formData.append("Tags", Array.isArray(values.tags) ? values.tags.filter(Boolean).join(",") : "");
    formData.append("ReplacementDocumentId", values.replacementDocumentId || "");
    formData.append("DocumentTypeId", values.type || "");
    formData.append("IsPublic", isPublicState ? "true" : "false");
    formData.append("FolderId", selectedFolderId || "");

    try {
      setIsUploading(true);

      // First, recreate as draft
      await editDocument(id, formData);
      toast.success("Document updated as draft successfully!");
      // Reset form and navigate back
      form.resetFields();
      setHtmlDescription("");
      setHtmlSummary("");
      setSelectedFile(null);
      setIsPublicState(false);

      navigate(-1);
    } catch (error: any) {
      if (error.errorFields) {
        toast.error("Vui lòng kiểm tra lại thông tin form!");
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

    setMode('edit');
  };



  const isAnyOperationInProgress = isUploading || isAnalyzing || isRegeneratingSummary;

  return (
    <Layout style={{ minHeight: "100vh", backgroundColor: "#f5f5f5" }}>
      <Content style={{ padding: "14px" }}>
        <div style={{ margin: "0 auto" }}>
          {/* Header */}
          <div style={{ marginBottom: 24 }}>
            <Title level={2} style={{ margin: 0 }}>
              {mode === 'upload' ? 'Edit Document - Upload New File' : 'Edit Document'}
            </Title>
            <Text type="secondary">
              {mode === 'upload'
                ? (location.state?.documentData
                  ? 'Review and modify the document information below. Optionally upload a new file to replace the existing one. You can edit the document without making any changes.'
                  : 'Upload a new file to edit the document and analyze it with AI to extract metadata')
                : 'Complete your document details to save the edited document'
              }
            </Text>
          </div>



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

                <Row gutter={16}>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      name="isPublic"
                      label="Document Visibility"
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

                {/* Next Button */}
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
                    Next: Edit Document
                  </Button>
                </Form.Item>
              </Form>
            </Card>
          )}

          {/* Step 3: Document Form (show when in edit mode OR when in upload mode with existing document data) */}
          {(mode === 'edit' || (mode === 'upload' && location.state?.documentData)) && (
            <Card
              title={"Edit Document"}
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
                      name="isPublic"
                      label="Document Visibility"
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

                {/* Action Buttons */}
                <Form.Item style={{ marginTop: 32 }}>
                  <Space>
                    <Button
                      disabled={isAnyOperationInProgress}
                      onClick={() => {
                        if (mode === 'edit') {
                          setMode('upload');
                        } else {
                          navigate(-1);
                        }
                      }}
                    >
                      {mode === 'edit' ? 'Back' : 'Cancel'}
                    </Button>
                    <Button
                      onClick={() => form.submit()}
                      icon={isUploading ? <Spin size="small" /> : <UploadOutlined />}
                      loading={isUploading}
                      disabled={(!selectedFile && !(location.state?.documentData && location.state?.mode === 'edit')) || isAnyOperationInProgress}
                    >
                      {isUploading ? "Saving..." : "Save as Draft"}
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
                  <Title level={4} style={{ margin: 0 }}>Editing Document</Title>
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
