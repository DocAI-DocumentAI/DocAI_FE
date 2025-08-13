import React, { useState, useEffect } from 'react';
import { Card, Button, Typography, Alert, Space, Divider, Tag } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, LoadingOutlined, ReloadOutlined, FolderAddOutlined } from '@ant-design/icons';
import { getFolderTree, createFolder } from '../../lib/api/folder';
import TreeFolderSelector from '../folder/TreeFolderSelector';

const { Title, Text, Paragraph } = Typography;

interface DiagnosticResult {
  test: string;
  status: 'success' | 'error' | 'loading';
  message: string;
  details?: any;
}

const FolderTreeDiagnostic: React.FC = () => {
  const [results, setResults] = useState<DiagnosticResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isCreatingFolders, setIsCreatingFolders] = useState(false);
  const [selectedFolderId, setSelectedFolderId] = useState<string | undefined>();

  const updateResult = (test: string, status: DiagnosticResult['status'], message: string, details?: any) => {
    setResults(prev => {
      const existing = prev.find(r => r.test === test);
      const newResult = { test, status, message, details };
      
      if (existing) {
        return prev.map(r => r.test === test ? newResult : r);
      } else {
        return [...prev, newResult];
      }
    });
  };

  const runDiagnostics = async () => {
    setIsRunning(true);
    setResults([]);

    // Test 1: Authentication
    updateResult('auth', 'loading', 'Checking authentication...');
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        const user = JSON.parse(userData);
        updateResult('auth', 'success', `Authenticated as: ${user.email || user.name || 'Unknown'}`, user);
      } catch (error) {
        updateResult('auth', 'error', 'Invalid user data format');
      }
    } else {
      updateResult('auth', 'error', 'Not authenticated - please log in');
    }

    // Test 2: Folder API
    updateResult('folder-api', 'loading', 'Testing folder API...');
    try {
      const response = await getFolderTree();
      console.log('Diagnostic - Full API Response:', response);
      
      if (response.success) {
        const rootNodes = response.data?.rootNodes || [];
        updateResult('folder-api', 'success', 
          `API successful - Found ${rootNodes.length} root folders`, 
          { response, rootNodesCount: rootNodes.length }
        );
      } else {
        updateResult('folder-api', 'error', `API returned error: ${response.message}`, response);
      }
    } catch (error: any) {
      updateResult('folder-api', 'error', `API call failed: ${error.message}`, error);
    }

    setIsRunning(false);
  };

  const createTestFolders = async () => {
    setIsCreatingFolders(true);
    try {
      // Create a test root folder
      const rootFolder = await createFolder({
        name: 'Test Documents',
        description: 'Test folder for document organization',
        isPublic: false
      });

      // Create a subfolder
      await createFolder({
        name: 'Project Files',
        description: 'Test subfolder for project documents',
        parentFolderId: rootFolder.id,
        isPublic: false
      });

      alert('Test folders created successfully! Refresh the page to see them.');
      
      // Refresh diagnostics
      runDiagnostics();
    } catch (error: any) {
      alert(`Failed to create test folders: ${error.message}`);
    } finally {
      setIsCreatingFolders(false);
    }
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  const getStatusIcon = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      case 'error':
        return <CloseCircleOutlined style={{ color: '#ff4d4f' }} />;
      case 'loading':
        return <LoadingOutlined style={{ color: '#1890ff' }} />;
    }
  };

  const getStatusColor = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'success':
        return 'success';
      case 'error':
        return 'error';
      case 'loading':
        return 'processing';
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <Title level={2}>Folder Tree Diagnostic Tool</Title>
      <Paragraph>
        This tool helps diagnose and fix issues with the folder tree selector.
      </Paragraph>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Diagnostics Panel */}
        <Card title="Diagnostics">
          <Space style={{ marginBottom: 20 }}>
            <Button 
              type="primary" 
              icon={<ReloadOutlined />} 
              onClick={runDiagnostics}
              loading={isRunning}
            >
              Run Diagnostics
            </Button>
            <Button 
              type="default" 
              icon={<FolderAddOutlined />} 
              onClick={createTestFolders}
              loading={isCreatingFolders}
            >
              Create Test Folders
            </Button>
          </Space>

          <Space direction="vertical" style={{ width: '100%' }}>
            {results.map((result) => (
              <Card key={result.test} size="small">
                <Space align="start" style={{ width: '100%' }}>
                  {getStatusIcon(result.status)}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Text strong>{result.test.replace('-', ' ').toUpperCase()}</Text>
                      <Tag color={getStatusColor(result.status)}>
                        {result.status.toUpperCase()}
                      </Tag>
                    </div>
                    <Text>{result.message}</Text>
                    {result.details && (
                      <details style={{ marginTop: 8 }}>
                        <summary style={{ cursor: 'pointer', color: '#1890ff' }}>
                          View Details
                        </summary>
                        <pre style={{ 
                          background: '#f5f5f5', 
                          padding: '8px', 
                          marginTop: '8px',
                          fontSize: '12px',
                          overflow: 'auto',
                          maxHeight: '200px'
                        }}>
                          {JSON.stringify(result.details, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </Space>
              </Card>
            ))}
          </Space>
        </Card>

        {/* Live Folder Tree Test */}
        <Card title="Live Folder Tree Test">
          <div style={{ marginBottom: '16px' }}>
            <Text strong>Selected Folder ID: </Text>
            <Text code>{selectedFolderId || 'None'}</Text>
          </div>
          
          <TreeFolderSelector
            selectedFolderId={selectedFolderId}
            onFolderSelect={(folderId) => {
              console.log('Folder selected:', folderId);
              setSelectedFolderId(folderId);
            }}
            height={400}
            showSearch={true}
            title="Live Test"
          />
        </Card>
      </div>

      <Divider />
      
      <Alert
        message="Troubleshooting Guide"
        description={
          <div>
            <p><strong>Common Issues & Solutions:</strong></p>
            <ul>
              <li><strong>No folders available:</strong> The system may not have any folders yet. Use "Create Test Folders" to add some.</li>
              <li><strong>Authentication failed:</strong> Log in to the application first.</li>
              <li><strong>API connection failed:</strong> Make sure the backend server is running on port 5000.</li>
              <li><strong>Permission denied:</strong> Your user account may not have folder access permissions.</li>
            </ul>
          </div>
        }
        type="info"
        showIcon
      />
    </div>
  );
};

export default FolderTreeDiagnostic;
