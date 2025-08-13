import React, { useState } from 'react';
import { Button, Input, message, Space } from 'antd';
import { createFolder } from '../../lib/api/folder';

const FolderCreateTest: React.FC = () => {
  const [folderName, setFolderName] = useState('');
  const [loading, setLoading] = useState(false);

  const testCreateFolder = async () => {
    if (!folderName.trim()) {
      message.error('Please enter a folder name');
      return;
    }

    setLoading(true);
    try {
      const testData = {
        name: folderName.trim(),
        description: 'Test folder created from debug component',
        isPublic: false
      };

      console.log('Test: Creating folder with data:', testData);
      console.log('Test: JSON.stringify test:', JSON.stringify(testData));

      // Test with direct fetch first
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/document/folders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify(testData)
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Test: Fetch error:', errorData);
        throw new Error(`HTTP ${response.status}: ${errorData}`);
      }

      const result = await response.json();
      console.log('Test: Folder created successfully with fetch:', result);

      message.success('Folder created successfully!');
      setFolderName('');
    } catch (error: any) {
      console.error('Test: Failed to create folder:', error);
      message.error(`Failed to create folder: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testWithApiFunction = async () => {
    if (!folderName.trim()) {
      message.error('Please enter a folder name');
      return;
    }

    setLoading(true);
    try {
      const testData = {
        name: folderName.trim(),
        description: 'Test folder created with API function',
        isPublic: false
      };

      console.log('Test API: Creating folder with data:', testData);

      const result = await createFolder(testData);
      console.log('Test API: Folder created successfully:', result);

      message.success('Folder created successfully with API function!');
      setFolderName('');
    } catch (error: any) {
      console.error('Test API: Failed to create folder:', error);
      message.error(`Failed to create folder with API: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 16, border: '1px solid #d9d9d9', borderRadius: 6, margin: 16 }}>
      <h4>Folder Creation Test</h4>
      <Space direction="vertical" style={{ width: '100%' }}>
        <Input
          placeholder="Enter folder name"
          value={folderName}
          onChange={(e) => setFolderName(e.target.value)}
          onPressEnter={testCreateFolder}
        />
        <Space>
          <Button
            type="primary"
            onClick={testCreateFolder}
            loading={loading}
          >
            Test with Fetch
          </Button>
          <Button
            onClick={testWithApiFunction}
            loading={loading}
          >
            Test with API Function
          </Button>
        </Space>
      </Space>
    </div>
  );
};

export default FolderCreateTest;
