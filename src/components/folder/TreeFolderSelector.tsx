import React, { useState, useEffect } from 'react';
import { Card, Tree, Spin, Empty, Input, Typography } from 'antd';
import { FolderOutlined, FolderOpenOutlined, SearchOutlined } from '@ant-design/icons';
import type { TreeProps, DataNode } from 'antd/es/tree';
import type { FolderNode, FolderPermissionLevel } from '../../types/folder';
import { getFolderTree } from '../../lib/api/folder';

const { Search } = Input;
const { Text } = Typography;

export interface TreeFolderSelectorProps {
  selectedFolderId?: string;
  onFolderSelect: (folderId: string | undefined) => void;
  placeholder?: string; // eslint-disable-line @typescript-eslint/no-unused-vars
  disabled?: boolean;
  filterPermission?: FolderPermissionLevel; // eslint-disable-line @typescript-eslint/no-unused-vars
  excludeFolderIds?: string[];
  className?: string;
  height?: number;
  showSearch?: boolean;
  title?: string;
}

const TreeFolderSelector: React.FC<TreeFolderSelectorProps> = ({
  selectedFolderId,
  onFolderSelect,
  placeholder = "Select a folder",
  disabled = false,
  filterPermission = 'read',
  excludeFolderIds = [],
  className,
  height = 300,
  showSearch = true,
  title = "Select Folder"
}) => {
  const [loading, setLoading] = useState(true);
  // mark unused props as intentionally unused to satisfy TS6133
  void placeholder; void filterPermission;
  const [error, setError] = useState<string | null>(null);
  const [folders, setFolders] = useState<FolderNode[]>([]);
  const [searchValue, setSearchValue] = useState('');
  const [expandedKeys, setExpandedKeys] = useState<string[]>([]);
  const [selectedKeys, setSelectedKeys] = useState<string[]>(selectedFolderId ? [selectedFolderId] : []);

  // Load folders on component mount
  useEffect(() => {
    loadFolders();
  }, []);

  // Update selected keys when selectedFolderId prop changes
  useEffect(() => {
    setSelectedKeys(selectedFolderId ? [selectedFolderId] : []);
  }, [selectedFolderId]);

  // Load folders from API
  const loadFolders = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('TreeFolderSelector - Loading folders...');

      const response = await getFolderTree();
      console.log('TreeFolderSelector - Full API Response:', response);

      if (response.success && response.data?.rootNodes) {
        const rootNodes = response.data.rootNodes;
        console.log('TreeFolderSelector - Root Nodes:', rootNodes);
        setFolders(rootNodes);
      } else {
        console.error('TreeFolderSelector - API Error:', response.message);
        setError(response.message || 'Failed to load folders');
        setFolders([]);
      }
    } catch (err: any) {
      console.error('TreeFolderSelector - Error loading folders:', err);
      setError(err.message || 'Failed to load folders');
      setFolders([]);
    } finally {
      setLoading(false);
    }
  };

  // Convert folders to tree data format
  const buildTreeData = (folders: FolderNode[]): DataNode[] => {
    if (!folders || folders.length === 0) return [];

    return folders
      .filter(folder => !excludeFolderIds.includes(folder.id))
      .map(folder => {
        const hasChildren = folder.children && folder.children.length > 0;

        return {
          key: folder.id,
          title: (
            <div className="flex items-center">
              <span>{folder.name}</span>
              {folder.documentCount !== undefined && (
                <Text type="secondary" className="ml-2 text-xs">
                  ({folder.documentCount})
                </Text>
              )}
            </div>
          ),
          icon: hasChildren && folder.isExpanded ? <FolderOpenOutlined /> : <FolderOutlined />,
          children: hasChildren ? buildTreeData(folder.children) : undefined,
          isLeaf: !hasChildren,
          selectable: !disabled,
          disabled: disabled
        };
      });
  };

  // Get tree data with search filtering
  const getTreeData = (): DataNode[] => {
    const treeData = buildTreeData(folders);

    if (!searchValue) {
      return treeData;
    }

    // Simple search filtering - can be enhanced later
    const filterNodes = (nodes: DataNode[]): DataNode[] => {
      return nodes.filter(node => {
        const titleText = typeof node.title === 'string' ? node.title : '';
        const matches = titleText.toLowerCase().includes(searchValue.toLowerCase());

        if (matches) return true;

        if (node.children) {
          const filteredChildren = filterNodes(node.children);
          if (filteredChildren.length > 0) {
            node.children = filteredChildren;
            return true;
          }
        }

        return false;
      });
    };

    return filterNodes(treeData);
  };

  // Event handlers
  const handleSelect: TreeProps['onSelect'] = (selectedKeys, info) => {
    void info;
    const folderId = selectedKeys[0] as string;
    setSelectedKeys(selectedKeys as string[]);
    onFolderSelect(folderId || undefined);
  };

  const handleExpand: TreeProps['onExpand'] = (expandedKeys) => {
    setExpandedKeys(expandedKeys as string[]);
  };

  const handleSearch = (value: string) => {
    setSearchValue(value);
    if (value) {
      // Auto-expand all nodes when searching
      const getAllKeys = (nodes: DataNode[]): string[] => {
        const keys: string[] = [];
        nodes.forEach(node => {
          keys.push(node.key as string);
          if (node.children) {
            keys.push(...getAllKeys(node.children));
          }
        });
        return keys;
      };
      setExpandedKeys(getAllKeys(getTreeData()));
    }
  };

  // Find folder by ID for display purposes
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

  // Get the current tree data
  const currentTreeData = getTreeData();

  if (loading) {
    return (
      <Card title={title} className={className}>
        <div className="flex justify-center items-center" style={{ height }}>
          <Spin size="large" />
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card title={title} className={className}>
        <div className="flex justify-center items-center" style={{ height }}>
          <Empty description={error} />
        </div>
      </Card>
    );
  }

  console.log('TreeFolderSelector - Folders:', folders);
  console.log('TreeFolderSelector - Tree Data:', currentTreeData);
  console.log('TreeFolderSelector - Loading:', loading);
  console.log('TreeFolderSelector - Error:', error);

  return (
    <Card title={title} className={className}>
      {showSearch && (
        <Search
          placeholder="Search folders..."
          allowClear
          value={searchValue}
          onChange={(e) => handleSearch(e.target.value)}
          style={{ marginBottom: 16 }}
          prefix={<SearchOutlined />}
        />
      )}

      <div style={{ height, overflowY: 'auto' }}>
        {currentTreeData.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={searchValue ? "No folders match your search" : "No folders available"}
          />
        ) : (
          <Tree
            showIcon
            showLine={{ showLeafIcon: false }}
            selectedKeys={selectedKeys}
            expandedKeys={expandedKeys}
            treeData={currentTreeData}
            onSelect={handleSelect}
            onExpand={handleExpand}
            blockNode
            className="folder-tree-selector"
          />
        )}
      </div>

      {selectedKeys.length > 0 && (
        <div className="mt-3 p-2 bg-gray-50 rounded">
          <Text type="secondary" className="text-xs">Selected: </Text>
          <Text className="text-sm font-medium">
            {(() => {
              const folder = findFolderById(folders, selectedKeys[0]);
              return folder ? folder.path || folder.name : 'Unknown folder';
            })()}
          </Text>
        </div>
      )}
    </Card>
  );
};

export default TreeFolderSelector;
