import React, { useState, useEffect, useMemo } from 'react';
import { Select, Spin, Empty, Typography } from 'antd';
import { FolderOutlined, GlobalOutlined, LockOutlined, TeamOutlined } from '@ant-design/icons';
import type { FolderSelectorProps, FolderNode } from '../../types/folder';
import { getFolderTree, canUserPerformAction } from '../../lib/api/folder';

const { Text } = Typography;
const { Option } = Select;

const FolderSelector: React.FC<FolderSelectorProps> = ({
  selectedFolderId,
  onFolderSelect,
  placeholder = "Select a folder",
  allowClear = true,
  disabled = false,
  showPath = true,
  filterPermission = 'read',
  excludeFolderIds = [],
  className
}) => {
  const [folders, setFolders] = useState<FolderNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load folders on component mount
  useEffect(() => {
    loadFolders();
  }, []);

  const loadFolders = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getFolderTree(undefined, false);
      setFolders(response.data.rootNodes);
    } catch (err: any) {
      setError(err.message || 'Failed to load folders');
      console.error('Failed to load folders:', err);
    } finally {
      setLoading(false);
    }
  };

  // Flatten folder tree for select options
  const flattenFolders = (folders: FolderNode[], level = 0): Array<FolderNode & { level: number }> => {
    const result: Array<FolderNode & { level: number }> = [];
    
    for (const folder of folders) {
      // Check if folder should be included
      const hasPermission = canUserPerformAction(folder, filterPermission);
      const isNotExcluded = !excludeFolderIds.includes(folder.id);
      
      if (hasPermission && isNotExcluded) {
        result.push({ ...folder, level });
      }
      
      // Recursively add children
      if (folder.children && folder.children.length > 0) {
        result.push(...flattenFolders(folder.children, level + 1));
      }
    }
    
    return result;
  };

  // Memoized flattened folders
  const flatFolders = useMemo(() => flattenFolders(folders), [folders, filterPermission, excludeFolderIds]);

  // Get folder display name with indentation
  const getFolderDisplayName = (folder: FolderNode & { level: number }) => {
    const indent = '  '.repeat(folder.level);
    const name = showPath && folder.level > 0 ? folder.path.split('/').pop() || folder.name : folder.name;
    return `${indent}${name}`;
  };

  // Get permission icon
  const getPermissionIcon = (folder: FolderNode) => {
    if (folder.isPublic) return <GlobalOutlined className="text-green-500" />;
    if (folder.folderType === 'system') return <LockOutlined className="text-orange-500" />;
    return <TeamOutlined className="text-blue-500" />;
  };

  // Handle folder selection
  const handleChange = (value: string | undefined) => {
    onFolderSelect(value);
  };

  // Custom filter function for search
  const filterOption = (input: string, option: any) => {
    const folder = flatFolders.find(f => f.id === option.value);
    if (!folder) return false;
    
    return (
      folder.name.toLowerCase().includes(input.toLowerCase()) ||
      folder.path.toLowerCase().includes(input.toLowerCase())
    );
  };

  if (loading) {
    return (
      <Select
        className={className}
        placeholder={placeholder}
        disabled
        suffixIcon={<Spin size="small" />}
      />
    );
  }

  if (error) {
    return (
      <Select
        className={className}
        placeholder="Error loading folders"
        disabled
        status="error"
      />
    );
  }

  return (
    <Select
      className={className}
      value={selectedFolderId}
      onChange={handleChange}
      placeholder={placeholder}
      allowClear={allowClear}
      disabled={disabled}
      showSearch
      filterOption={filterOption}
      notFoundContent={
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="No folders available"
        />
      }
      optionLabelProp="label"
    >
      {flatFolders.map(folder => (
        <Option
          key={folder.id}
          value={folder.id}
          label={getFolderDisplayName(folder)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FolderOutlined />
              <Text className="truncate">
                {getFolderDisplayName(folder)}
              </Text>
            </div>
            <div className="flex items-center space-x-1">
              {getPermissionIcon(folder)}
              {folder.documentCount !== undefined && (
                <Text type="secondary" className="text-xs">
                  ({folder.documentCount})
                </Text>
              )}
            </div>
          </div>
        </Option>
      ))}
    </Select>
  );
};

export default FolderSelector;
