import React, { useState, useEffect } from 'react';
import { Input, Button, Typography, Space } from 'antd';
import { FolderOutlined, ClearOutlined } from '@ant-design/icons';
import FolderSelectorModal from './FolderSelectorModal';
import type { FolderPermissionLevel, FolderNode } from '../../types/folder';
import { getFolderTree } from '../../lib/api/folder';

const { Text } = Typography;

export interface FolderSelectorInputProps {
  selectedFolderId?: string;
  onFolderSelect: (folderId: string | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  allowClear?: boolean;
  filterPermission?: FolderPermissionLevel;
  excludeFolderIds?: string[];
  className?: string;
}

const FolderSelectorInput: React.FC<FolderSelectorInputProps> = ({
  selectedFolderId,
  onFolderSelect,
  placeholder = "Select folder (optional)",
  disabled = false,
  allowClear = true,
  filterPermission = 'read',
  excludeFolderIds = [],
  className
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedFolderName, setSelectedFolderName] = useState<string>('');
  const [selectedFolderPath, setSelectedFolderPath] = useState<string>('');
  const [folders, setFolders] = useState<FolderNode[]>([]);

  // Load folders to get folder names
  useEffect(() => {
    loadFolders();
  }, []);

  // Update folder name when selectedFolderId changes
  useEffect(() => {
    if (selectedFolderId && folders.length > 0) {
      const folder = findFolderById(folders, selectedFolderId);
      if (folder) {
        setSelectedFolderName(folder.name);
        setSelectedFolderPath(folder.path || folder.name);
      }
    } else {
      setSelectedFolderName('');
      setSelectedFolderPath('');
    }
  }, [selectedFolderId, folders]);

  const loadFolders = async () => {
    try {
      const response = await getFolderTree();
      if (response.success) {
        setFolders(response.data?.rootNodes || []);
      }
    } catch (error) {
      console.error('Failed to load folders:', error);
    }
  };

  // Find folder by ID
  const findFolderById = (folders: FolderNode[], folderId: string): FolderNode | null => {
    for (const folder of folders) {
      if (folder.id === folderId) return folder;
      if (folder.children && folder.children.length > 0) {
        const found = findFolderById(folder.children, folderId);
        if (found) return found;
      }
    }
    return null;
  };

  const handleOpenModal = () => {
    if (!disabled) {
      setModalVisible(true);
    }
  };

  const handleModalConfirm = (folderId: string | undefined) => {
    onFolderSelect(folderId);
    setModalVisible(false);
  };

  const handleModalCancel = () => {
    setModalVisible(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFolderSelect(undefined);
  };

  const displayValue = selectedFolderName || '';
  const displayPath = selectedFolderPath || '';

  return (
    <>
      <div className={className}>
        <Input
          value={displayValue}
          placeholder={placeholder}
          readOnly
          disabled={disabled}
          onClick={handleOpenModal}
          style={{ cursor: disabled ? 'not-allowed' : 'pointer' }}
          prefix={<FolderOutlined />}
          suffix={
            <Space>
              {allowClear && selectedFolderId && !disabled && (
                <Button
                  type="text"
                  size="small"
                  icon={<ClearOutlined />}
                  onClick={handleClear}
                  style={{ padding: '0 4px' }}
                />
              )}
              <Button
                type="text"
                size="small"
                onClick={handleOpenModal}
                disabled={disabled}
                style={{ padding: '0 4px' }}
              >
                Browse
              </Button>
            </Space>
          }
        />
        
        {selectedFolderId && displayPath && (
          <div style={{ marginTop: 4 }}>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              Path: {displayPath}
            </Text>
          </div>
        )}
      </div>

      <FolderSelectorModal
        visible={modalVisible}
        onCancel={handleModalCancel}
        onConfirm={handleModalConfirm}
        selectedFolderId={selectedFolderId}
        title="Select Folder Location"
        placeholder="Choose where to store this document"
        filterPermission={filterPermission}
        excludeFolderIds={excludeFolderIds}
        allowClear={allowClear}
      />
    </>
  );
};

export default FolderSelectorInput;
