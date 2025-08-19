import React, { useState } from 'react';
import { Card, Button, Typography, Space, Row, Col, Divider } from 'antd';
import ModernFolderSelector from '../folder/ModernFolderSelector';
import ModernFolderInput from '../folder/ModernFolderInput';

const { Title, Text } = Typography;

const ModernFolderSelectorTest: React.FC = () => {
  const [selectedFolderId1, setSelectedFolderId1] = useState<string | undefined>();
  const [selectedFolderId2, setSelectedFolderId2] = useState<string | undefined>();
  const [selectedFolderId3, setSelectedFolderId3] = useState<string | undefined>();

  return (
    <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
      <Title level={2}>Modern Folder Selector Test</Title>
      <Text type="secondary">
        Test the new modern folder selector with different configurations and UI patterns.
      </Text>

      <Divider />

      <Row gutter={[24, 24]}>
        {/* Full Selector Test */}
        <Col xs={24} lg={12}>
          <Card title="Full Folder Selector" size="small">
            <div style={{ marginBottom: '16px' }}>
              <Text strong>Selected Folder ID: </Text>
              <Text code>{selectedFolderId1 || 'None'}</Text>
            </div>

            <Space direction="vertical" style={{ width: '100%' }}>
              <Button onClick={() => setSelectedFolderId1(undefined)} size="small">
                Clear Selection
              </Button>
              
              <ModernFolderSelector
                selectedFolderId={selectedFolderId1}
                onFolderSelect={setSelectedFolderId1}
                height={400}
                showSearch={true}
                title="Browse Folders"
                allowCreateFolder={true}
              />
            </Space>
          </Card>
        </Col>

        {/* Compact Selector Test */}
        <Col xs={24} lg={12}>
          <Card title="Compact Folder Selector" size="small">
            <div style={{ marginBottom: '16px' }}>
              <Text strong>Selected Folder ID: </Text>
              <Text code>{selectedFolderId2 || 'None'}</Text>
            </div>

            <Space direction="vertical" style={{ width: '100%' }}>
              <Button onClick={() => setSelectedFolderId2(undefined)} size="small">
                Clear Selection
              </Button>
              
              <ModernFolderSelector
                selectedFolderId={selectedFolderId2}
                onFolderSelect={setSelectedFolderId2}
                height={300}
                showSearch={false}
                title="Quick Select"
                allowCreateFolder={false}
              />
            </Space>
          </Card>
        </Col>

        {/* Input Component Test */}
        <Col xs={24}>
          <Card title="Modern Folder Input Component" size="small">
            <div style={{ marginBottom: '16px' }}>
              <Text strong>Selected Folder ID: </Text>
              <Text code>{selectedFolderId3 || 'None'}</Text>
            </div>

            <Row gutter={16}>
              <Col xs={24} sm={12} md={8}>
                <div style={{ marginBottom: '16px' }}>
                  <Text strong>Small Size:</Text>
                  <ModernFolderInput
                    selectedFolderId={selectedFolderId3}
                    onFolderSelect={setSelectedFolderId3}
                    placeholder="Select folder..."
                    size="small"
                    allowClear={true}
                    filterPermission="write"
                  />
                </div>
              </Col>
              
              <Col xs={24} sm={12} md={8}>
                <div style={{ marginBottom: '16px' }}>
                  <Text strong>Medium Size:</Text>
                  <ModernFolderInput
                    selectedFolderId={selectedFolderId3}
                    onFolderSelect={setSelectedFolderId3}
                    placeholder="Select folder..."
                    size="middle"
                    allowClear={true}
                    filterPermission="write"
                  />
                </div>
              </Col>
              
              <Col xs={24} sm={12} md={8}>
                <div style={{ marginBottom: '16px' }}>
                  <Text strong>Large Size:</Text>
                  <ModernFolderInput
                    selectedFolderId={selectedFolderId3}
                    onFolderSelect={setSelectedFolderId3}
                    placeholder="Select folder..."
                    size="large"
                    allowClear={true}
                    filterPermission="write"
                  />
                </div>
              </Col>
            </Row>

            <Divider />

            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <div style={{ marginBottom: '16px' }}>
                  <Text strong>Disabled State:</Text>
                  <ModernFolderInput
                    selectedFolderId={selectedFolderId3}
                    onFolderSelect={setSelectedFolderId3}
                    placeholder="Disabled folder input"
                    disabled={true}
                    allowClear={true}
                    filterPermission="write"
                  />
                </div>
              </Col>
              
              <Col xs={24} sm={12}>
                <div style={{ marginBottom: '16px' }}>
                  <Text strong>Read-only Permission:</Text>
                  <ModernFolderInput
                    selectedFolderId={selectedFolderId3}
                    onFolderSelect={setSelectedFolderId3}
                    placeholder="Read-only folders"
                    allowClear={true}
                    filterPermission="read"
                  />
                </div>
              </Col>
            </Row>

            <Space style={{ marginTop: '16px' }}>
              <Button onClick={() => setSelectedFolderId3(undefined)}>
                Clear Selection
              </Button>
              <Button onClick={() => setSelectedFolderId3('documents')}>
                Select Documents
              </Button>
              <Button onClick={() => setSelectedFolderId3('shared')}>
                Select Shared
              </Button>
            </Space>
          </Card>
        </Col>
      </Row>

      <Divider />

      <Card title="Features & Benefits" size="small">
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Title level={4}>✨ New Features</Title>
            <ul>
              <li><strong>Breadcrumb Navigation:</strong> Easy navigation through folder hierarchy</li>
              <li><strong>Double-click to Navigate:</strong> Intuitive folder browsing</li>
              <li><strong>Visual Folder Cards:</strong> Better visual representation with badges</li>
              <li><strong>Create New Folders:</strong> Built-in folder creation capability</li>
              <li><strong>Drawer Interface:</strong> Modern slide-out selection panel</li>
              <li><strong>Smart Search:</strong> Search by name or path</li>
              <li><strong>Permission Tags:</strong> Clear visibility of folder permissions</li>
              <li><strong>Document Count:</strong> Shows number of documents in each folder</li>
            </ul>
          </Col>
          
          <Col xs={24} md={12}>
            <Title level={4}>🎨 UI Improvements</Title>
            <ul>
              <li><strong>Modern Design:</strong> Clean, card-based interface</li>
              <li><strong>Better Spacing:</strong> Improved visual hierarchy</li>
              <li><strong>Color Coding:</strong> Different colors for folder types and permissions</li>
              <li><strong>Responsive Layout:</strong> Works well on all screen sizes</li>
              <li><strong>Loading States:</strong> Better feedback during API calls</li>
              <li><strong>Error Handling:</strong> Clear error messages with retry options</li>
              <li><strong>Accessibility:</strong> Better keyboard navigation and screen reader support</li>
              <li><strong>Consistent Styling:</strong> Matches Ant Design system</li>
            </ul>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default ModernFolderSelectorTest;
