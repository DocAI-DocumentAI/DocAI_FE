import React, { useState, useEffect, useMemo } from 'react';
import {
  Card,
  Input,
  Button,
  List,
  Typography,
  Space,
  Empty,
  Spin,
  Alert,
  Divider,
  Tag,
  Badge
} from 'antd';
import {
  FolderOutlined,
  SearchOutlined,
  PlusOutlined,
  CheckOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import type { FolderNode, FolderPermissionLevel } from '../../types/folder';
import { getFolderTree, createFolder } from '../../lib/api/folder';

const { Search } = Input;
const { Text } = Typography;

export interface ModernFolderSelectorProps {
  selectedFolderId?: string;
  onFolderSelect: (folderId: string | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  filterPermission?: FolderPermissionLevel;
  excludeFolderIds?: string[];
  className?: string;
  height?: number;
  showSearch?: boolean;
  title?: string;
  allowCreateFolder?: boolean;
}

// Removed FolderBreadcrumb interface - not needed for simple list

const ModernFolderSelector: React.FC<ModernFolderSelectorProps> = ({
  selectedFolderId,
  onFolderSelect,
  // disabled = false,
  excludeFolderIds = [],
  className,
  height = 400,
  showSearch = true,
  title = "Select Folder",
  allowCreateFolder = false
}) => {
  // State management
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [allFolders, setAllFolders] = useState<FolderNode[]>([]);
  // Removed navigation state - using simple list now
  const [searchValue, setSearchValue] = useState('');
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  // Flatten folder hierarchy into a simple list
  const flattenFolders = (folders: FolderNode[]): FolderNode[] => {
    const result: FolderNode[] = [];

    folders.forEach(folder => {
      result.push(folder);
      if (folder.children && folder.children.length > 0) {
        result.push(...flattenFolders(folder.children));
      }
    });

    return result;
  };

  // Load folders from API
  const loadFolders = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getFolderTree();

      if (response.success && response.data?.rootNodes) {
        setAllFolders(flattenFolders(response.data.rootNodes));
      } else {
        // Create sample folders if none exist
        const sampleFolders: FolderNode[] = [
          {
            id: 'documents',
            name: 'Documents',
            path: '/Documents',
            parentFolderId: undefined,
            isPublic: false,
            folderType: 'user',
            departmentId: 'dept-001',
            ownerId: 'user-001',
            documentCount: 12,
            userPermission: 'write',
            canExpand: true,
            canCreateSubfolders: true,
            canUploadFiles: true,
            isExpanded: false,
            children: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: 'shared',
            name: 'Shared',
            path: '/Shared',
            parentFolderId: undefined,
            isPublic: true,
            folderType: 'system',
            departmentId: 'dept-001',
            ownerId: 'system',
            documentCount: 5,
            userPermission: 'read',
            canExpand: true,
            canCreateSubfolders: false,
            canUploadFiles: true,
            isExpanded: false,
            children: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ];
        setAllFolders(sampleFolders);
      }
    } catch (err: any) {
      console.error('Error loading folders:', err);
      setError(err.message || 'Failed to load folders');
      setAllFolders([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter folders based on search and exclusions
  const filteredFolders = useMemo(() => {
    let folders = allFolders.filter(folder => !excludeFolderIds.includes(folder.id));

    if (searchValue) {
      folders = folders.filter(folder =>
        folder.name.toLowerCase().includes(searchValue.toLowerCase()) ||
        folder.path.toLowerCase().includes(searchValue.toLowerCase())
      );
    }

    return folders;
  }, [allFolders, excludeFolderIds, searchValue]);

  // Select folder
  const selectFolder = (folder: FolderNode) => {
    onFolderSelect(folder.id);
  };

  // Create new folder
  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    
    try {
      setIsCreatingFolder(true);
      await createFolder({
        name: newFolderName,
        description: `Created folder: ${newFolderName}`,
        parentFolderId: undefined, // Create at root level for simplicity
        isPublic: false
      });
      
      setNewFolderName('');
      await loadFolders(); // Reload folders
    } catch (error: any) {
      console.error('Failed to create folder:', error);
    } finally {
      setIsCreatingFolder(false);
    }
  };

  useEffect(() => {
    loadFolders();
  }, []);

  if (loading) {
    return (
      <Card title={title} className={className}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: height - 100 
        }}>
          <Spin size="large" />
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card title={title} className={className}>
        <Alert
          message="Error Loading Folders"
          description={error}
          type="error"
          showIcon
          action={
            <Button size="small" icon={<ReloadOutlined />} onClick={loadFolders}>
              Retry
            </Button>
          }
        />
      </Card>
    );
  }

  return (
    <Card 
      title={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>{title}</span>
          {selectedFolderId && (
            <Tag color="blue" icon={<CheckOutlined />}>
              Selected
            </Tag>
          )}
        </div>
      } 
      className={className}
    >
      {/* Search */}
      {showSearch && (
        <Search
          placeholder="Search folders..."
          allowClear
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          style={{ marginBottom: 16 }}
          prefix={<SearchOutlined />}
        />
      )}

      {/* Simple folder list - no navigation needed */}

      {/* Create New Folder */}
      {allowCreateFolder && (
        <div style={{ marginBottom: 16 }}>
          <Space.Compact style={{ width: '100%' }}>
            <Input
              placeholder="New folder name..."
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onPressEnter={handleCreateFolder}
            />
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={handleCreateFolder}
              loading={isCreatingFolder}
            >
              Create
            </Button>
          </Space.Compact>
        </div>
      )}

      <Divider style={{ margin: '12px 0' }} />

      {/* Folder List */}
      <div style={{ height: height - 200, overflowY: 'auto' }}>
        {filteredFolders.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={searchValue ? "No folders match your search" : "No folders available"}
          />
        ) : (
          <List
            dataSource={filteredFolders}
            renderItem={(folder) => (
              <List.Item
                key={folder.id}
                style={{
                  cursor: 'pointer',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  marginBottom: '4px',
                  backgroundColor: selectedFolderId === folder.id ? '#e6f7ff' : 'transparent',
                  border: selectedFolderId === folder.id ? '1px solid #1890ff' : '1px solid transparent'
                }}
                onClick={() => selectFolder(folder)}
              >
                <List.Item.Meta
                  avatar={
                    <Badge count={folder.documentCount || 0} size="small">
                      {folder.children && folder.children.length > 0 ? 
                        <FolderOutlined style={{ fontSize: 20, color: '#1890ff' }} /> :
                        <FolderOutlined style={{ fontSize: 20, color: '#8c8c8c' }} />
                      }
                    </Badge>
                  }
                  title={
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>{folder.name}</span>
                      <Space>
                        {folder.isPublic && <Tag color="green">Public</Tag>}
                        <Tag color="blue">{folder.userPermission}</Tag>
                      </Space>
                    </div>
                  }
                  description={
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      {folder.path} • {folder.documentCount || 0} documents
                    </Text>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </div>

      {/* Selected Folder Info */}
      {selectedFolderId && (
        <div style={{ 
          marginTop: 16, 
          padding: '12px', 
          backgroundColor: '#f6ffed', 
          border: '1px solid #b7eb8f',
          borderRadius: '6px'
        }}>
          <Text strong style={{ color: '#52c41a' }}>
            Selected: {filteredFolders.find(f => f.id === selectedFolderId)?.name || 'Unknown folder'}
          </Text>
        </div>
      )}
    </Card>
  );
};

export default ModernFolderSelector;
