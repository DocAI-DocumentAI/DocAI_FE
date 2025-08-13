import React, { useState } from 'react';
import { Card, Button, Typography, Space } from 'antd';
import TreeFolderSelector from '../folder/TreeFolderSelector';

const { Title, Text } = Typography;

const TreeFolderSelectorTest: React.FC = () => {
  const [selectedFolderId, setSelectedFolderId] = useState<string | undefined>();

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <Card>
        <Title level={3}>TreeFolderSelector Test</Title>
        
        <div style={{ marginBottom: '20px' }}>
          <Text strong>Selected Folder ID: </Text>
          <Text code>{selectedFolderId || 'None'}</Text>
        </div>

        <Space direction="vertical" style={{ width: '100%' }}>
          <Button onClick={() => setSelectedFolderId(undefined)}>
            Clear Selection
          </Button>
          
          <TreeFolderSelector
            selectedFolderId={selectedFolderId}
            onFolderSelect={setSelectedFolderId}
            height={400}
            showSearch={true}
            title="Test Folder Tree"
          />
        </Space>
      </Card>
    </div>
  );
};

export default TreeFolderSelectorTest;
