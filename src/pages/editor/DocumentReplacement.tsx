import React, { useState, useEffect } from 'react';
import { UploadOutlined, InboxOutlined, SearchOutlined, SwapOutlined, FileTextOutlined, ArrowLeftOutlined, FolderOutlined } from "@ant-design/icons"
import { Layout, Typography, Card, Button, Input, Select, DatePicker, Form, Row, Col, Space, Spin, Table, Modal, Tag, Alert, Empty, Switch } from "antd"
import {
  uploadDraftDocument,
  getDocumentTypes,
  getReplaceableDocuments,
  getReplacementSuggestions,
  submitDocumentForApproval,
  regenerateSummary,
  DocumentType,
  ReplaceableDocument,
  ReplacementSuggestion
} from "../../lib/api/document";
import { useNavigate, useLocation } from "react-router-dom";
import WysiwygEditor from 'react-simple-wysiwyg';
import toast from 'react-hot-toast';
import moment from "moment";
import { FolderSelectorInput } from "../../components/folder";

const { Title, Text } = Typography;
const { Content } = Layout;



const DocumentReplacement: React.FC = () => {
  const [form] = Form.useForm()
  const navigate = useNavigate();
  const location = useLocation();
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [htmlDescription, setHtmlDescription] = useState("");
  const [htmlSummary, setHtmlSummary] = useState("");
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([]);
  const [loadingDocumentTypes, setLoadingDocumentTypes] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isPublicState, setIsPublicState] = useState(false);

  // Replacement document selection
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [replaceableDocuments, setReplaceableDocuments] = useState<ReplaceableDocument[]>([]);
  const [loadingDocuments, setLoadingDocuments] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<ReplaceableDocument | null>(null);
  const [documentSearchText, setDocumentSearchText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalDocuments, setTotalDocuments] = useState(0);

  // Replacement suggestions
  const [replacementSuggestions, setReplacementSuggestions] = useState<ReplacementSuggestion[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  // Replacement suggestion filters
  const [minSimilarityThreshold, setMinSimilarityThreshold] = useState<number>(0.45);
  const [sameDepartmentOnly, setSameDepartmentOnly] = useState<boolean>(false);

  // Folder selection
  const [selectedFolderId, setSelectedFolderId] = useState<string | undefined>(undefined);

  // Load document types and handle pre-filled data
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
    if (location.state?.analysisData) {
      const analysisData = location.state.analysisData;
      setSelectedFile(analysisData.file);
      setHtmlDescription(analysisData.description || "");
      setHtmlSummary(analysisData.summary || "");

      const isPublicValue = analysisData.isPublic || false;
      setIsPublicState(isPublicValue);

      form.setFieldsValue({
        title: analysisData.title || "",
        versionName: analysisData.versionName || "",
        tags: analysisData.tags || [],
        effectiveFrom: analysisData.effectiveFrom ? moment(analysisData.effectiveFrom) : null,
        effectiveTo: analysisData.effectiveUntil ? moment(analysisData.effectiveUntil) : null,
        signedBy: analysisData.signedBy || "",
        type: analysisData.documentTypeId || "",
        isPublic: isPublicValue,
      });

      // Load replacement suggestions automatically
      loadReplacementSuggestions(analysisData);
    }
  }, [location.state, form]);

  // Load replacement suggestions
  const loadReplacementSuggestions = async (analysisData: any) => {
    try {
      setLoadingSuggestions(true);
      const suggestions = await getReplacementSuggestions({
        title: analysisData.title,
        description: analysisData.description,
        tags: analysisData.tags,
        documentTypeId: analysisData.documentTypeId,
        isPublic: false,
        maxSuggestions: 10,
        minSimilarityThreshold: minSimilarityThreshold,
        sameDepartmentOnly: sameDepartmentOnly
      });
      setReplacementSuggestions(suggestions.suggestions || []);
    } catch (error) {
      console.error("Failed to load replacement suggestions:", error);
      toast.error("Failed to load replacement suggestions");
    } finally {
      setLoadingSuggestions(false);
    }
  };

  // Refresh suggestions with current filters
  const refreshSuggestions = () => {
    if (location.state?.analysisData) {
      loadReplacementSuggestions(location.state.analysisData);
    }
  };

  // Regenerate summary function
  const handleRegenerateSummary = async (file: File) => {
    const loadingToast = toast.loading("Regenerating summary...");
    try {
      console.log("Regenerating summary...");

      const summaryResult = await regenerateSummary(file);
      const summaryData = summaryResult.data;

      console.log("Summary result:", summaryData);

      // Update only the summary
      setHtmlSummary(summaryData.summary || summaryData || "");

      toast.dismiss(loadingToast);
      toast.success("Summary regenerated successfully!");
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error("Failed to regenerate summary. Please try again!");
      console.error("Summary regeneration error:", error);
    }
  };

  interface SearchParams {
  pageNumber: number;
  pageSize: number;
  keyword?: string; 
}
  // Load replaceable documents for modal
  const loadReplaceableDocuments = async (page = 1, search = "") => {
    try {
      setLoadingDocuments(true);
      const params : SearchParams = {
      pageNumber: page,
      pageSize: 10
    };
    if (search) {
      params.keyword = search;
    }
      const response = await getReplaceableDocuments(params);
      const normalizedItems = (response.items || []).map((it: any) => ({
        ...it,
        id: it.id || it.documentId,
      }));
      setReplaceableDocuments(normalizedItems);
      setTotalDocuments(response.totalCount || 0);
    } catch (error) {
      console.error("Failed to load replaceable documents:", error);
      toast.error("Failed to load documents");
    } finally {
      setLoadingDocuments(false);
    }
  };

  // Load documents when modal opens
  useEffect(() => {
    if (showDocumentModal) {
      loadReplaceableDocuments(currentPage, documentSearchText);
    }
  }, [showDocumentModal, currentPage, documentSearchText]);

  const handleSaveAsDraft = async (values: any) => {
    await handleDocumentAction(values, 'draft');
  };

  const handleSubmitForApproval = async (values: any) => {
    await handleDocumentAction(values, 'submit');
  };

  const handleDocumentAction = async (values: any, action: 'draft' | 'submit') => {
    // Check file
    if (!selectedFile) {
      toast.error("Please select a file to upload!");
      return;
    }

    // Check replacement document
    if (!selectedDocument) {
      toast.error("Please select a document to replace!");
      return;
    }

    // Get user information
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
      replacementDocumentId: (selectedDocument as any).documentId || selectedDocument.id,
      documentTypeId: values.type || "",
      isPublic: isPublicState, // Use the actual isPublic state
      folderId: values.folderId || selectedFolderId || "",
    };

    const isSubmitting = action === 'submit';
    setIsUploading(true);
    if (isSubmitting) setIsSubmitting(true);

    try {
      console.log(`${action === 'draft' ? 'Saving as draft' : 'Submitting replacement document'}...`, formValues);

      // Always save as draft first
      const uploadResponse = await uploadDraftDocument(formValues);
      console.log("Draft upload response:", uploadResponse);

      if (action === 'submit' && uploadResponse?.versionId) {
        // If submitting, also call submit API with the versionId from draft response (folder-aware)
        console.log("Submitting for approval with versionId:", uploadResponse.versionId, "targetFolderId:", formValues.folderId);
        await submitDocumentForApproval(uploadResponse.versionId, formValues.folderId || undefined);
        toast.success("Replacement document submitted for approval successfully!");
      } else {
        toast.success("Replacement document saved as draft successfully!");
      }

      // Reset form after successful action
      form.resetFields();
      setHtmlDescription("");
      setHtmlSummary("");
      setSelectedFile(null);
      setSelectedDocument(null);

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

  if (!location.state?.analysisData) {
    return (
      <Layout style={{ minHeight: "100vh", backgroundColor: "#f5f5f5" }}>
        <Content style={{ padding: "24px" }}>
          <Alert
            message="No Analysis Data"
            description="Please upload a document first to see analysis results."
            type="warning"
            showIcon
            action={
              <Button size="small" onClick={() => navigate('/editor/upload-document')}>
                Back to Upload
              </Button>
            }
          />
        </Content>
      </Layout>
    );
  }

  return (
    <Layout style={{ minHeight: "100vh", backgroundColor: "#f5f5f5" }}>
      <Content style={{ padding: "24px", maxWidth: "1400px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <Button 
            icon={<ArrowLeftOutlined />} 
            onClick={() => navigate('/editor/document-choice', {
              state: { analysisData: location.state?.analysisData }
            })}
            style={{ marginBottom: 16 }}
          >
            Back to Document Choice
          </Button>
          
          <Title level={2} style={{ margin: 0 }}>
            <SwapOutlined style={{ marginRight: 8 }} />
            Replace Existing Document
          </Title>
          <Text type="secondary">Select a document to replace and complete the replacement process</Text>
        </div>

        {/* Main Content */}
        <Row gutter={[24, 24]}>
          {/* Left Column - Replacement Suggestions */}
          <Col xs={24} xl={8}>
            <Card 
              title="Suggested Documents to Replace"
              style={{ marginBottom: 24, height: "fit-content" }}
            >
              <Text type="secondary" style={{ display: "block", marginBottom: 16 }}>
                Based on your document content, we found these similar documents that might be candidates for replacement.
              </Text>

              {/* Filter Controls */}
              <div style={{ marginBottom: 16, padding: 12, backgroundColor: '#f5f5f5', borderRadius: 6 }}>
                <Text strong style={{ display: 'block', marginBottom: 8 }}>Filter Options</Text>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div>
                    <Text style={{ display: 'block', marginBottom: 4, fontSize: '12px' }}>
                      Minimum Similarity: {Math.round(minSimilarityThreshold * 100)}%
                    </Text>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={minSimilarityThreshold}
                      onChange={(e) => setMinSimilarityThreshold(parseFloat(e.target.value))}
                      style={{ width: '100%' }}
                    />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Text style={{ fontSize: '12px' }}>Same Department Only</Text>
                    <Switch
                      size="small"
                      checked={sameDepartmentOnly}
                      onChange={setSameDepartmentOnly}
                    />
                  </div>
                  <Button
                    type="primary"
                    size="small"
                    onClick={refreshSuggestions}
                    loading={loadingSuggestions}
                    style={{ width: '100%' }}
                  >
                    Update Suggestions
                  </Button>
                </Space>
              </div>

              {loadingSuggestions ? (
                <div style={{ textAlign: "center", padding: "40px 0" }}>
                  <Spin size="large" />
                  <div style={{ marginTop: 16 }}>
                    <Text type="secondary">Loading replacement suggestions...</Text>
                  </div>
                </div>
              ) : replacementSuggestions.length > 0 ? (
                <div style={{ marginBottom: 24 }}>
                  <div style={{ marginBottom: 12, padding: 8, backgroundColor: '#e6f7ff', borderRadius: 4, border: '1px solid #91d5ff' }}>
                    <Text style={{ fontSize: '11px', color: '#1890ff' }}>
                      Showing {replacementSuggestions.length} suggestions with ≥{Math.round(minSimilarityThreshold * 100)}% similarity
                      {sameDepartmentOnly ? ' (same department only)' : ' (all departments)'}
                    </Text>
                  </div>
                  {replacementSuggestions.slice(0, 5).map((suggestion) => (
                    <Card 
                      key={suggestion.documentId}
                      size="small" 
                      hoverable
                      style={{
                        marginBottom: 12,
                        border: selectedDocument?.id === suggestion.documentId ? '2px solid #1890ff' : '1px solid #d9d9d9',
                        cursor: 'pointer'
                      }}
                      onClick={() => {
                        const replaceableDoc: ReplaceableDocument = {
                          id: suggestion.documentId,
                          title: suggestion.title,
                          description: suggestion.description,
                          documentTypeId: "", // Not available in suggestion
                          documentTypeName: suggestion.documentTypeName,
                          departmentId: "", // Not available in suggestion
                          departmentName: suggestion.departmentName,
                          status: suggestion.status,
                          createdBy: "", // Not available in suggestion
                          createdByName: suggestion.createdByName,
                          createdTime: suggestion.createdTime,
                          lastUpdatedBy: "",
                          lastUpdatedByName: "",
                          lastUpdatedTime: "",
                          tags: [],
                          isPublic: false,
                          isReplaced: false,
                          signedBy: "",
                          effectiveFrom: "",
                          effectiveUntil: "",
                          filePath: "",
                          fileSize: 0,
                          fileType: ""
                        };
                        setSelectedDocument(replaceableDoc);
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                            <FileTextOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                            <Text strong>{suggestion.title}</Text>
                            <Tag color="blue" style={{ marginLeft: 8 }}>
                              {Math.round((suggestion.similarityScore || 0) * 100)}% match
                            </Tag>
                          </div>
                          <Text type="secondary" style={{ fontSize: '12px', display: 'block', marginBottom: 4 }}>
                            {suggestion.description}
                          </Text>
                          <div style={{ display: 'flex', gap: 16, fontSize: '12px' }}>
                            <Text type="secondary">Type: {suggestion.documentTypeName}</Text>
                            <Text type="secondary">Department: {suggestion.departmentName}</Text>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  <Empty
                    description={
                      <div>
                        <div>No similar documents found for replacement</div>
                        <Text type="secondary" style={{ fontSize: '11px', marginTop: 8, display: 'block' }}>
                          Try lowering the similarity threshold (currently {Math.round(minSimilarityThreshold * 100)}%)
                          {sameDepartmentOnly && ' or include other departments'}
                        </Text>
                      </div>
                    }
                  />
                </div>
              )}

              <Button 
                type="dashed" 
                block
                onClick={() => setShowDocumentModal(true)}
                style={{ marginTop: 16 }}
              >
                Browse All Documents
              </Button>
            </Card>
          </Col>

          {/* Right Column - Upload Form */}
          <Col xs={24} xl={16}>
            <Card 
              title="Upload New Document"
              style={{ marginBottom: 24 }}
            >
              <Text type="secondary" style={{ display: "block", marginBottom: 16 }}>
                Upload the new document that will replace the selected document.
              </Text>

              <Form form={form} layout="vertical" onFinish={handleSaveAsDraft}>
                {/* File Upload Section */}
                <div style={{ marginBottom: 24 }}>
                  <Text strong style={{ display: "block", marginBottom: 8 }}>Document File</Text>
                  <div style={{ 
                    border: "2px dashed #d9d9d9", 
                    borderRadius: "6px", 
                    padding: "20px", 
                    textAlign: "center",
                    backgroundColor: selectedFile ? "#f6ffed" : "#fafafa"
                  }}>
                    {selectedFile ? (
                      <div>
                        <FileTextOutlined style={{ fontSize: 24, color: "#52c41a", marginBottom: 8 }} />
                        <div>
                          <Text strong>{selectedFile.name}</Text>
                          <div style={{ marginTop: 4 }}>
                            <Text type="secondary">
                              ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                            </Text>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <InboxOutlined style={{ fontSize: 24, color: "#d9d9d9", marginBottom: 8 }} />
                        <Text type="secondary">File from analysis will be used</Text>
                      </div>
                    )}
                  </div>
                </div>

                {/* Selected Document Display */}
                {selectedDocument && (
                  <div style={{ marginBottom: 24 }}>
                    <Text strong style={{ display: "block", marginBottom: 8 }}>Selected Document to Replace</Text>
                    <Card size="small" style={{ backgroundColor: '#e6f7ff', borderColor: '#91d5ff' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <Text strong>{selectedDocument.title}</Text>
                          <div style={{ marginTop: 4 }}>
                            <Text type="secondary" style={{ fontSize: '12px' }}>
                              {selectedDocument.documentTypeName} • {selectedDocument.departmentName}
                            </Text>
                          </div>
                        </div>
                        <Button 
                          type="link" 
                          onClick={() => setSelectedDocument(null)}
                          style={{ padding: 0 }}
                        >
                          Change
                        </Button>
                      </div>
                    </Card>
                  </div>
                )}

                {/* Document Details Form */}
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
                        treeType={isPublicState ? 'public' : 'department'}
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
                            setIsPublicState(checked);
                            form.setFieldValue('isPublic', checked);
                          }}
                        />
                        <Text>Make this document public</Text>
                      </div>
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
                        onClick={() => {
                          if (location.state?.analysisData?.file) {
                            handleRegenerateSummary(location.state.analysisData.file);
                          }
                        }}
                        disabled={!location.state?.analysisData?.file}
                        style={{ padding: "0 8px", fontSize: "12px" }}
                      >
                        🔄 Regenerate Summary
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
                      disabled={isSubmitting || !selectedFile || !selectedDocument}
                    >
                      {isUploading ? "Saving..." : "Save as Draft"}
                    </Button>
                    <Button
                      type="primary"
                      onClick={() => {
                        form.validateFields().then(values => {
                          handleSubmitForApproval(values);
                        });
                      }}
                      icon={isSubmitting ? <Spin size="small" /> : <UploadOutlined />}
                      loading={isSubmitting}
                      disabled={isUploading || !selectedFile || !selectedDocument}
                    >
                      {isSubmitting ? "Submitting..." : "Submit"}
                    </Button>
                  </Space>
                </Form.Item>
              </Form>
            </Card>
          </Col>
        </Row>

        {/* Document Selection Modal */}
        <Modal
          title="Select Document to Replace"
          open={showDocumentModal}
          onCancel={() => setShowDocumentModal(false)}
          footer={null}
          width={800}
        >
          <div style={{ marginBottom: 16 }}>
            <Input
              placeholder="Search documents..."
              prefix={<SearchOutlined />}
              value={documentSearchText}
              onChange={(e) => setDocumentSearchText(e.target.value)}
              style={{ marginBottom: 16 }}
            />
          </div>

          <Table
            dataSource={replaceableDocuments}
            loading={loadingDocuments}
            rowKey="id"
            pagination={{
              current: currentPage,
              total: totalDocuments,
              pageSize: 10,
              onChange: (page) => setCurrentPage(page),
            }}
            onRow={(record) => ({
              onClick: () => {
                setSelectedDocument(record);
                setShowDocumentModal(false);
              },
              style: { cursor: 'pointer' }
            })}
            columns={[
              {
                title: 'Title',
                dataIndex: 'title',
                key: 'title',
                render: (text) => <Text strong>{text}</Text>
              },
              {
                title: 'Type',
                dataIndex: 'documentTypeName',
                key: 'documentTypeName',
              },
              {
                title: 'Department',
                dataIndex: 'departmentName',
                key: 'departmentName',
              },
              {
                title: 'Created By',
                dataIndex: 'createdByName',
                key: 'createdByName',
              },
              {
                title: 'Status',
                dataIndex: 'status',
                key: 'status',
                render: (status) => (
                  <Tag color={status === 'Approved' ? 'green' : status === 'Active' ? 'blue' : 'orange'}>
                    {status}
                  </Tag>
                )
              }
            ]}
          />
        </Modal>

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
                <Title level={4} style={{ margin: 0 }}>Processing Document</Title>
                <Text type="secondary">Please wait while we process your replacement...</Text>
              </div>
            </Card>
          </div>
        )}
      </Content>
    </Layout>
  );
};

export default DocumentReplacement;
