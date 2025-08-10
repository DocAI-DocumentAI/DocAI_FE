import React, { useState, useEffect } from 'react';
import { Layout, Typography, Card, Button, Space, Row, Col, Radio, Alert, Spin } from 'antd';
import { ArrowLeftOutlined, ArrowRightOutlined, PlusOutlined, SwapOutlined, FileTextOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';

const { Title, Text, Paragraph } = Typography;
const { Content } = Layout;

interface AnalysisData {
  title: string;
  description: string;
  summary: string;
  tags: string[];
  effectiveFrom: string;
  effectiveUntil: string;
  signedBy: string;
  documentTypeId: string;
  file: File;
}

type DocumentAction = 'create-new' | 'replace-existing';

const DocumentChoice: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [selectedAction, setSelectedAction] = useState<DocumentAction>('create-new');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get analysis data from navigation state
    if (location.state?.analysisData) {
      setAnalysisData(location.state.analysisData);
      setLoading(false);
    } else {
      // If no data, redirect back to upload
      toast.error("No analysis data found. Please upload a document first.");
      navigate('/editor/upload-document');
    }
  }, [location.state, navigate]);

  const handleBack = () => {
    navigate('/editor/upload-document');
  };

  const handleNext = () => {
    if (!analysisData) {
      toast.error("No analysis data available");
      return;
    }

    if (selectedAction === 'create-new') {
      // Navigate to regular upload form with pre-filled data
      navigate('/editor/upload-document', {
        state: { 
          analysisData,
          mode: 'create-new'
        }
      });
    } else {
      // Navigate to replacement form with pre-filled data
      navigate('/editor/document-replacement', {
        state: {
          analysisData,
          mode: 'replace-existing'
        }
      });
    }
  };

  if (loading) {
    return (
      <Layout style={{ minHeight: "100vh", backgroundColor: "#f5f5f5" }}>
        <Content style={{ padding: "24px", display: "flex", justifyContent: "center", alignItems: "center" }}>
          <Spin size="large" />
        </Content>
      </Layout>
    );
  }

  if (!analysisData) {
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
      <Content style={{ padding: "24px", maxWidth: "1200px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <Button 
            icon={<ArrowLeftOutlined />} 
            onClick={handleBack}
            style={{ marginBottom: 16 }}
          >
            Back
          </Button>
          
          <Title level={2} style={{ margin: 0, color: "#1890ff" }}>
            Choose Document Action
          </Title>
          <Text type="secondary" style={{ fontSize: "16px" }}>
            Select how you want to proceed with your document
          </Text>
        </div>

        <Row gutter={[24, 24]}>
          {/* Left Column - Action Selection */}
          <Col xs={24} lg={12}>
            <Card 
              title="Document Action"
              bordered
              style={{ height: "100%" }}
            >
              <Radio.Group 
                value={selectedAction} 
                onChange={(e) => setSelectedAction(e.target.value)}
                style={{ width: "100%" }}
              >
                <Space direction="vertical" size="large" style={{ width: "100%" }}>
                  <Card 
                    hoverable
                    style={{ 
                      border: selectedAction === 'create-new' ? '2px solid #1890ff' : '1px solid #d9d9d9',
                      cursor: 'pointer'
                    }}
                    onClick={() => setSelectedAction('create-new')}
                  >
                    <div style={{ display: "flex", alignItems: "flex-start" }}>
                      <Radio value="create-new" style={{ marginTop: 4 }} />
                      <div style={{ marginLeft: 12, flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", marginBottom: 8 }}>
                          <PlusOutlined style={{ marginRight: 8, color: "#52c41a" }} />
                          <Title level={4} style={{ margin: 0 }}>
                            Create New Document
                          </Title>
                        </div>
                        <Paragraph style={{ margin: 0, color: "#595959" }}>
                          Create a completely new document in the system. This will add a new entry to the document library.
                        </Paragraph>
                      </div>
                    </div>
                  </Card>

                  <Card 
                    hoverable
                    style={{ 
                      border: selectedAction === 'replace-existing' ? '2px solid #1890ff' : '1px solid #d9d9d9',
                      cursor: 'pointer'
                    }}
                    onClick={() => setSelectedAction('replace-existing')}
                  >
                    <div style={{ display: "flex", alignItems: "flex-start" }}>
                      <Radio value="replace-existing" style={{ marginTop: 4 }} />
                      <div style={{ marginLeft: 12, flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", marginBottom: 8 }}>
                          <SwapOutlined style={{ marginRight: 8, color: "#fa8c16" }} />
                          <Title level={4} style={{ margin: 0 }}>
                            Replace Existing Document
                          </Title>
                        </div>
                        <Paragraph style={{ margin: 0, color: "#595959" }}>
                          Replace an existing document with this new version. The system will suggest similar documents or you can search manually.
                        </Paragraph>
                      </div>
                    </div>
                  </Card>
                </Space>
              </Radio.Group>

              <div style={{ marginTop: 32, textAlign: "center" }}>
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
                  Continue
                </Button>
              </div>
            </Card>
          </Col>

          {/* Right Column - Document Preview */}
          <Col xs={24} lg={12}>
            <Card 
              title={
                <div style={{ display: "flex", alignItems: "center" }}>
                  <FileTextOutlined style={{ marginRight: 8, color: "#1890ff" }} />
                  Document Preview
                </div>
              }
              bordered
              style={{ height: "100%" }}
            >
              <div style={{ marginBottom: 16 }}>
                <Text strong style={{ color: "#595959" }}>Title</Text>
                <Title level={5} style={{ margin: "4px 0 16px 0", color: "#262626" }}>
                  {analysisData.title || "Untitled Document"}
                </Title>
              </div>

              <div style={{ marginBottom: 16 }}>
                <Text strong style={{ color: "#595959" }}>File Name</Text>
                <Paragraph style={{ margin: "4px 0", color: "#595959" }}>
                  {analysisData.file?.name || "Unknown"}
                </Paragraph>
              </div>

              <div style={{ marginBottom: 16 }}>
                <Text strong style={{ color: "#595959" }}>Summary</Text>
                <Paragraph 
                  style={{ 
                    margin: "4px 0", 
                    color: "#595959",
                    maxHeight: "120px",
                    overflow: "hidden",
                    textOverflow: "ellipsis"
                  }}
                >
                  {analysisData.summary || analysisData.description || "No summary available"}
                </Paragraph>
              </div>

              <div style={{ marginBottom: 16 }}>
                <Text strong style={{ color: "#595959" }}>Tags</Text>
                <div style={{ marginTop: 8 }}>
                  {analysisData.tags && analysisData.tags.length > 0 ? (
                    <Text style={{ color: "#595959" }}>
                      {analysisData.tags.join(", ")}
                    </Text>
                  ) : (
                    <Text type="secondary">No tags</Text>
                  )}
                </div>
              </div>

              <div>
                <Text strong style={{ color: "#595959" }}>Signed By</Text>
                <Paragraph style={{ margin: "4px 0", color: "#595959" }}>
                  {analysisData.signedBy || "Not specified"}
                </Paragraph>
              </div>
            </Card>
          </Col>
        </Row>
      </Content>
    </Layout>
  );
};

export default DocumentChoice;
