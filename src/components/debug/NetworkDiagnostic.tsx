import React, { useState, useEffect } from 'react';
import { Card, Button, Typography, Alert, Space, Divider, Tag } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, LoadingOutlined, ReloadOutlined } from '@ant-design/icons';
// import { api } from '../../lib/api/api';
import { getFolderTree } from '../../lib/api/folder';

const { Title, Text, Paragraph } = Typography;

interface DiagnosticResult {
  test: string;
  status: 'success' | 'error' | 'loading';
  message: string;
  details?: any;
}

const NetworkDiagnostic: React.FC = () => {
  const [results, setResults] = useState<DiagnosticResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

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

    // Test 1: Basic API connectivity
    updateResult('api-connectivity', 'loading', 'Testing API connectivity...');
    try {
      const response = await fetch('https://production.docai.asia/api/health', { 
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        updateResult('api-connectivity', 'success', 'API server is reachable');
      } else {
        updateResult('api-connectivity', 'error', `API server responded with status: ${response.status}`);
      }
    } catch (error: any) {
      updateResult('api-connectivity', 'error', `Cannot reach API server: ${error.message}`);
    }

    // Test 2: Authentication token
    updateResult('auth-token', 'loading', 'Checking authentication token...');
    const token = localStorage.getItem('token');
    if (token) {
      updateResult('auth-token', 'success', 'Authentication token found');
    } else {
      updateResult('auth-token', 'error', 'No authentication token found. Please log in.');
    }

    // Test 3: User data
    updateResult('user-data', 'loading', 'Checking user data...');
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        updateResult('user-data', 'success', `User data found: ${user.email || user.name || 'Unknown user'}`, user);
      } catch (error) {
        updateResult('user-data', 'error', 'Invalid user data format');
      }
    } else {
      updateResult('user-data', 'error', 'No user data found. Please log in.');
    }

    // Test 4: Folder API endpoint
    updateResult('folder-api', 'loading', 'Testing folder API endpoint...');
    try {
      const response = await getFolderTree();
      updateResult('folder-api', 'success', 'Folder API responded successfully', response);
    } catch (error: any) {
      let errorMessage = 'Folder API test failed';
      if (error.code === 'ERR_NETWORK') {
        errorMessage = 'Network error - backend server may not be running';
      } else if (error.response?.status === 401) {
        errorMessage = 'Authentication failed - please log in';
      } else if (error.response?.status === 403) {
        errorMessage = 'Access denied - insufficient permissions';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      updateResult('folder-api', 'error', errorMessage, error.response?.data);
    }

    setIsRunning(false);
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
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <Card>
        <Title level={3}>Network & API Diagnostic Tool</Title>
        <Paragraph>
          This tool helps diagnose issues with the folder tree selector by testing various components.
        </Paragraph>

        <Space style={{ marginBottom: 20 }}>
          <Button 
            type="primary" 
            icon={<ReloadOutlined />} 
            onClick={runDiagnostics}
            loading={isRunning}
          >
            Run Diagnostics
          </Button>
        </Space>

        <Divider />

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

        {results.length > 0 && (
          <>
            <Divider />
            <Alert
              message="Diagnostic Summary"
              description={
                <div>
                  <p><strong>Common Solutions:</strong></p>
                  <ul>
                    <li>If API connectivity fails: Start the backend server on port 5000</li>
                    <li>If authentication fails: Log in to the application</li>
                    <li>If folder API fails: Check server logs and database connection</li>
                    <li>If user data is missing: Clear browser storage and log in again</li>
                  </ul>
                </div>
              }
              type="info"
              showIcon
            />
          </>
        )}
      </Card>
    </div>
  );
};

export default NetworkDiagnostic;
