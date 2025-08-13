import React, { useState, useEffect } from 'react';
import { Modal, Button, Input, Typography } from 'antd';
import { FolderOutlined, FolderOpenOutlined } from '@ant-design/icons';
import TreeFolderSelector from './TreeFolderSelector';
import type { FolderPermissionLevel } from '../../types/folder';

const { Text } = Typography;

export interface FolderSelectorModalProps {
  visible: boolean;
  onCancel: () => void;
  onConfirm: (folderId: string | undefined) => void;
  selectedFolderId?: string;
  title?: string;
  placeholder?: string;
  filterPermission?: FolderPermissionLevel;
  excludeFolderIds?: string[];
  allowClear?: boolean;
}

const FolderSelectorModal: React.FC<FolderSelectorModalProps> = ({
  visible,
  onCancel,
  onConfirm,
  selectedFolderId,
  title = "Select Folder",
  placeholder = "Choose a folder location",
  filterPermission = 'read',
  excludeFolderIds = [],
  allowClear = true
}) => {
  const [tempSelectedFolderId, setTempSelectedFolderId] = useState<string | undefined>(selectedFolderId);

  // Reset temp selection when modal opens/closes or selectedFolderId changes
  useEffect(() => {
    setTempSelectedFolderId(selectedFolderId);
  }, [visible, selectedFolderId]);

  const handleConfirm = () => {
    onConfirm(tempSelectedFolderId);
  };

  const handleCancel = () => {
    setTempSelectedFolderId(selectedFolderId); // Reset to original value
    onCancel();
  };

  const handleClear = () => {
    setTempSelectedFolderId(undefined);
  };

  return (
    <Modal
      title={title}
      open={visible}
      onCancel={handleCancel}
      onOk={handleConfirm}
      okText="Select"
      cancelText="Cancel"
      width={600}
      style={{ top: 20 }}
      bodyStyle={{ padding: '16px' }}
    >
      <div style={{ marginBottom: 16 }}>
        <Text type="secondary">{placeholder}</Text>
      </div>

      <TreeFolderSelector
        selectedFolderId={tempSelectedFolderId}
        onFolderSelect={setTempSelectedFolderId}
        filterPermission={filterPermission}
        excludeFolderIds={excludeFolderIds}
        height={400}
        showSearch={true}
        title=""
      />

      {allowClear && tempSelectedFolderId && (
        <div style={{ marginTop: 16, textAlign: 'right' }}>
          <Button size="small" onClick={handleClear}>
            Clear Selection
          </Button>
        </div>
      )}
    </Modal>
  );
};

export default FolderSelectorModal;
