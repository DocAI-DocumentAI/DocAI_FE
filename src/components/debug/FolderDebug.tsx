import React, { useState, useEffect } from 'react';
import { Card, Button, Typography, Spin } from 'antd';
import { getFolderTree } from '../../lib/api/folder';
import type { FolderNode } from '../../types/folder';

const { Text, Paragraph } = Typography;

const FolderDebug: React.FC = () => {
  const [folders, setFolders] = useState<FolderNode[]>([]);
  const [loading, setLoading] = useState(false);
  const [rawResponse, setRawResponse] = useState<any>(null);

  const loadFolders = async () => {
    try {
      setLoading(true);
      const response = await getFolderTree();
      console.log('FolderDebug - Raw API Response:', response);
      setRawResponse(response);
      
      if (response.success) {
        const rootNodes = response.data?.rootNodes || [];
        setFolders(rootNodes);
        console.log('FolderDebug - Root Nodes:', rootNodes);
      }
    } catch (error) {
      console.error('FolderDebug - Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFolders();
  }, []);

  const renderFolder = (folder: FolderNode, level = 0) => {
    const indent = '  '.repeat(level);
    return (
      <div key={folder.id} style={{ marginLeft: level * 20 }}>
        <Text>
          {indent}📁 {folder.name} (ID: {folder.id}, Permission: {folder.userPermission})
        </Text>
        {folder.children && folder.children.map(child => renderFolder(child, level + 1))}
      </div>
    );
  };

  return (
    <Card title="Folder Debug" style={{ margin: 16 }}>
      <Button onClick={loadFolders} loading={loading} style={{ marginBottom: 16 }}>
        Reload Folders
      </Button>
      
      {loading && <Spin />}
      
      <div style={{ marginBottom: 16 }}>
        <Text strong>Folder Count: </Text>
        <Text>{folders.length}</Text>
      </div>
      
      <div style={{ marginBottom: 16 }}>
        <Text strong>Raw Response:</Text>
        <Paragraph>
          <pre style={{ fontSize: '12px', background: '#f5f5f5', padding: '8px' }}>
            {JSON.stringify(rawResponse, null, 2)}
          </pre>
        </Paragraph>
      </div>
      
      <div>
        <Text strong>Folder Tree:</Text>
        <div style={{ marginTop: 8 }}>
          {folders.length === 0 ? (
            <Text type="secondary">No folders found</Text>
          ) : (
            folders.map(folder => renderFolder(folder))
          )}
        </div>
      </div>
    </Card>
  );
};

export default FolderDebug;
