import React, { useState, useEffect } from 'react';
import { Input, Button, Typography, Space, Drawer } from 'antd';
import { FolderOutlined, ClearOutlined, EditOutlined } from '@ant-design/icons';
import ModernFolderSelector from './ModernFolderSelector';
import type { FolderPermissionLevel, FolderNode } from '../../types/folder';
import { getFolderTree } from '../../lib/api/folder';

const { Text } = Typography;

export interface ModernFolderInputProps {
  selectedFolderId?: string;
  onFolderSelect: (folderId: string | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  allowClear?: boolean;
  filterPermission?: FolderPermissionLevel;
  excludeFolderIds?: string[];
  className?: string;
  size?: 'small' | 'middle' | 'large';
  style?: React.CSSProperties;
}

const ModernFolderInput: React.FC<ModernFolderInputProps> = ({
  selectedFolderId,
  onFolderSelect,
  placeholder = "Select folder (optional)",
  disabled = false,
  allowClear = true,
  filterPermission = 'read',
  excludeFolderIds = [],
  className,
  size = 'middle',
  style
}) => {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedFolderName, setSelectedFolderName] = useState<string>('');
  const [selectedFolderPath, setSelectedFolderPath] = useState<string>('');
  const [folders, setFolders] = useState<FolderNode[]>([]);
  const [tempSelectedFolderId, setTempSelectedFolderId] = useState<string | undefined>(selectedFolderId);

  // Load folders to get folder names
  useEffect(() => {
    loadFolders();
  }, []);

  // Update display when selectedFolderId changes
  useEffect(() => {
    if (selectedFolderId && folders.length > 0) {
      const folder = findFolderById(folders, selectedFolderId);
      if (folder) {
        setSelectedFolderName(folder.name);
        setSelectedFolderPath(folder.path);
      }
    } else {
      setSelectedFolderName('');
      setSelectedFolderPath('');
    }
    setTempSelectedFolderId(selectedFolderId);
  }, [selectedFolderId, folders]);

  const loadFolders = async () => {
    try {
      const response = await getFolderTree();
      if (response.success && response.data?.rootNodes) {
        setFolders(response.data.rootNodes);
      }
    } catch (error) {
      console.error('Failed to load folders:', error);
    }
  };

  const findFolderById = (folders: FolderNode[], id: string): FolderNode | null => {
    for (const folder of folders) {
      if (folder.id === id) return folder;
      if (folder.children) {
        const found = findFolderById(folder.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  const handleOpenDrawer = () => {
    if (!disabled) {
      setTempSelectedFolderId(selectedFolderId);
      setDrawerVisible(true);
    }
  };

  const handleDrawerClose = () => {
    setTempSelectedFolderId(selectedFolderId); // Reset to original value
    setDrawerVisible(false);
  };

  const handleConfirm = () => {
    onFolderSelect(tempSelectedFolderId);
    setDrawerVisible(false);
  };

  const handleClear = () => {
    onFolderSelect(undefined);
    setSelectedFolderName('');
    setSelectedFolderPath('');
  };

  const displayValue = selectedFolderName || '';
  const displayPath = selectedFolderPath || '';

  return (
    <>
      <div className={className} style={style}>
        <Input
          value={displayValue}
          placeholder={placeholder}
          readOnly
          disabled={disabled}
          size={size}
          onClick={handleOpenDrawer}
          style={{ 
            cursor: disabled ? 'not-allowed' : 'pointer',
            backgroundColor: disabled ? '#f5f5f5' : '#fff'
          }}
          prefix={<FolderOutlined style={{ color: selectedFolderId ? '#1890ff' : '#8c8c8c' }} />}
          suffix={
            <Space size="small">
              {allowClear && selectedFolderId && !disabled && (
                <Button
                  type="text"
                  size="small"
                  icon={<ClearOutlined />}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClear();
                  }}
                  style={{ padding: '0 4px' }}
                />
              )}
              <Button
                type="text"
                size="small"
                icon={<EditOutlined />}
                onClick={handleOpenDrawer}
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
              📁 {displayPath}
            </Text>
          </div>
        )}
      </div>

      <Drawer
        title="Select Folder Location"
        placement="right"
        width={600}
        open={drawerVisible}
        onClose={handleDrawerClose}
        extra={
          <Space>
            <Button onClick={handleDrawerClose}>
              Cancel
            </Button>
            <Button type="primary" onClick={handleConfirm}>
              Select Folder
            </Button>
          </Space>
        }
      >
        <div style={{ marginBottom: 16 }}>
          <Text type="secondary">
            Choose where to store your document. You can navigate through folders by double-clicking them.
          </Text>
        </div>

        <ModernFolderSelector
          selectedFolderId={tempSelectedFolderId}
          onFolderSelect={setTempSelectedFolderId}
          filterPermission={filterPermission}
          excludeFolderIds={excludeFolderIds}
          height={500}
          showSearch={true}
          title=""
          allowCreateFolder={true}
        />

        {tempSelectedFolderId && (
          <div style={{ 
            marginTop: 16, 
            padding: '12px', 
            backgroundColor: '#f0f9ff', 
            border: '1px solid #91d5ff',
            borderRadius: '6px'
          }}>
            <Text strong style={{ color: '#1890ff' }}>
              📁 Selected: {(() => {
                const folder = findFolderById(folders, tempSelectedFolderId);
                return folder ? `${folder.name} (${folder.path})` : 'Unknown folder';
              })()}
            </Text>
          </div>
        )}

        {allowClear && tempSelectedFolderId && (
          <div style={{ marginTop: 12, textAlign: 'center' }}>
            <Button 
              size="small" 
              onClick={() => setTempSelectedFolderId(undefined)}
              icon={<ClearOutlined />}
            >
              Clear Selection
            </Button>
          </div>
        )}
      </Drawer>
    </>
  );
};

export default ModernFolderInput;
