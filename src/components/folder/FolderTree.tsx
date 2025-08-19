import React, { useState, useCallback, useMemo } from 'react';
import { Tree, Dropdown, Button, Spin, Empty, Input, Tooltip } from 'antd';
import {
  FolderOutlined,
  FolderOpenOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  MoreOutlined,
  SearchOutlined,
  FileTextOutlined,
  LockOutlined,
  GlobalOutlined,
  TeamOutlined
} from '@ant-design/icons';
import type { DataNode, TreeProps } from 'antd/es/tree';
import type { MenuProps } from 'antd';
import type { FolderNode, FolderTreeProps } from '../../types/folder';
import { canUserPerformAction } from '../../lib/api/folder';

const { Search } = Input;

interface FolderTreeState {
  expandedKeys: string[];
  selectedKeys: string[];
  searchValue: string;
  filteredData: DataNode[];
}

const FolderTree: React.FC<FolderTreeProps> = ({
  folders,
  selectedFolderId,
  onFolderSelect,
  onFolderExpand,
  onFolderCollapse,
  onCreateFolder,
  onEditFolder,
  onDeleteFolder,
  onMoveFolder,
  showContextMenu = true,
  allowDragDrop = false,
  allowSelection = true,
  maxDepth,
  className,
  loading = false
}) => {
  const [state, setState] = useState<FolderTreeState>({
    expandedKeys: [],
    selectedKeys: selectedFolderId ? [selectedFolderId] : [],
    searchValue: '',
    filteredData: []
  });

  // Convert folder data to Ant Design Tree format
  const convertToTreeData = useCallback((folders: FolderNode[], level = 0): DataNode[] => {
    if (maxDepth && level >= maxDepth) return [];

    return folders.map(folder => {
      const hasChildren = folder.children && folder.children.length > 0;
      const canExpand = folder.canExpand && hasChildren;
      
      return {
        key: folder.id,
        title: (
          <FolderTreeItem
            folder={folder}
            onContextMenu={showContextMenu ? (e) => handleContextMenu(e, folder) : undefined}
            showContextMenu={showContextMenu}
            onCreateFolder={onCreateFolder}
            onEditFolder={onEditFolder}
            onDeleteFolder={onDeleteFolder}
          />
        ),
        icon: folder.isExpanded ? <FolderOpenOutlined /> : <FolderOutlined />,
        children: canExpand ? convertToTreeData(folder.children, level + 1) : undefined,
        isLeaf: !canExpand,
        selectable: allowSelection,
        disabled: !canUserPerformAction(folder, 'read')
      };
    });
  }, [maxDepth, showContextMenu, allowSelection]);

  // Filter tree data based on search
  const getFilteredData = useCallback((data: DataNode[], searchValue: string): DataNode[] => {
    if (!searchValue) return data;

    const filterNode = (node: DataNode): DataNode | null => {
      const title = typeof node.title === 'string' ? node.title : '';
      const matches = title.toLowerCase().includes(searchValue.toLowerCase());
      
      let filteredChildren: DataNode[] = [];
      if (node.children) {
        filteredChildren = node.children
          .map(child => filterNode(child))
          .filter(Boolean) as DataNode[];
      }

      if (matches || filteredChildren.length > 0) {
        return {
          ...node,
          children: filteredChildren.length > 0 ? filteredChildren : undefined
        };
      }

      return null;
    };

    return data.map(node => filterNode(node)).filter(Boolean) as DataNode[];
  }, []);

  // Memoized tree data
  const treeData = useMemo(() => {
    const baseData = convertToTreeData(folders);
    return getFilteredData(baseData, state.searchValue);
  }, [folders, state.searchValue, convertToTreeData, getFilteredData]);

  // Handle folder selection
  const handleSelect: TreeProps['onSelect'] = (selectedKeys, info) => {
    void info;
    if (!allowSelection) return;
    
    const folderId = selectedKeys[0] as string;
    setState(prev => ({ ...prev, selectedKeys: selectedKeys as string[] }));
    
    if (onFolderSelect && folderId) {
      const folder = findFolderById(folders, folderId);
      if (folder) {
        onFolderSelect(folder);
      }
    }
  };

  // Handle folder expand/collapse
  const handleExpand: TreeProps['onExpand'] = (expandedKeys, { expanded, node }) => {
    setState(prev => ({ ...prev, expandedKeys: expandedKeys as string[] }));
    
    const folderId = node.key as string;
    if (expanded && onFolderExpand) {
      onFolderExpand(folderId);
    } else if (!expanded && onFolderCollapse) {
      onFolderCollapse(folderId);
    }
  };

  // Handle context menu
  const handleContextMenu = (e: React.MouseEvent, folder: FolderNode) => {
    e.preventDefault();
    // Context menu implementation would go here
    console.log('Context menu for folder:', folder.name);
  };

  // Handle search
  const handleSearch = (value: string) => {
    setState(prev => ({ ...prev, searchValue: value }));
  };

  // Find folder by ID
  const findFolderById = (folders: FolderNode[], folderId: string): FolderNode | null => {
    for (const folder of folders) {
      if (folder.id === folderId) return folder;
      if (folder.children) {
        const found = findFolderById(folder.children, folderId);
        if (found) return found;
      }
    }
    return null;
  };

  // Handle drag and drop
  const handleDrop: TreeProps['onDrop'] = (info) => {
    if (!allowDragDrop || !onMoveFolder) return;

    const dragKey = info.dragNode.key as string;
    const dropKey = info.node.key as string;
    const dropToGap = info.dropToGap;

    const dragFolder = findFolderById(folders, dragKey);
    if (!dragFolder) return;

    // Determine new parent
    let newParentId: string | undefined;
    if (!dropToGap) {
      // Dropped on a folder
      newParentId = dropKey;
    } else {
      // Dropped between folders - use parent of drop target
      const dropFolder = findFolderById(folders, dropKey);
      newParentId = dropFolder?.parentFolderId;
    }

    onMoveFolder(dragFolder, newParentId);
  };

  return (
    <div className={`folder-tree ${className || ''}`}>
      {/* Search */}
      <div className="mb-4">
        <Search
          placeholder="Search folders..."
          allowClear
          onSearch={handleSearch}
          onChange={(e) => handleSearch(e.target.value)}
          prefix={<SearchOutlined />}
        />
      </div>

      {/* Tree */}
      {loading ? (
        <div className="flex justify-center items-center py-8">
          <Spin size="large" />
        </div>
      ) : treeData.length === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="No folders found"
        />
      ) : (
        <Tree
          showIcon
          showLine={{ showLeafIcon: false }}
          selectedKeys={state.selectedKeys}
          expandedKeys={state.expandedKeys}
          treeData={treeData}
          onSelect={handleSelect}
          onExpand={handleExpand}
          onDrop={allowDragDrop ? handleDrop : undefined}
          draggable={allowDragDrop}
          blockNode
          className="folder-tree-content"
        />
      )}
    </div>
  );
};

// Folder tree item component
interface FolderTreeItemProps {
  folder: FolderNode;
  onContextMenu?: (e: React.MouseEvent) => void;
  showContextMenu: boolean;
  onCreateFolder?: (parentFolderId: string) => void;
  onEditFolder?: (folder: FolderNode) => void;
  onDeleteFolder?: (folder: FolderNode) => void;
}

const FolderTreeItem: React.FC<FolderTreeItemProps> = ({
  folder,
  onContextMenu,
  showContextMenu,
  onCreateFolder,
  onEditFolder,
  onDeleteFolder
}) => {
  const getPermissionIcon = () => {
    if (folder.isPublic) return <GlobalOutlined className="text-green-500" />;
    if (folder.folderType === 'system') return <LockOutlined className="text-orange-500" />;
    return <TeamOutlined className="text-blue-500" />;
  };

  const getContextMenuItems = (): MenuProps['items'] => {
    const items: MenuProps['items'] = [];

    if (canUserPerformAction(folder, 'write')) {
      items.push({
        key: 'create',
        label: 'Create Subfolder',
        icon: <PlusOutlined />,
        onClick: () => {
          try {
            onCreateFolder?.(folder.id);
          } catch (error) {
            console.error('Error in create folder context menu:', error);
          }
        },
      });
    }

    if (canUserPerformAction(folder, 'admin')) {
      items.push(
        {
          key: 'edit',
          label: 'Edit Folder',
          icon: <EditOutlined />,
          onClick: () => {
            try {
              // Create a clean folder object to avoid circular references
              const cleanFolder = {
                id: folder.id,
                name: folder.name,
                description: folder.description,
                path: folder.path,
                isPublic: folder.isPublic,
                userPermission: folder.userPermission
              };
              onEditFolder?.(cleanFolder as FolderNode);
            } catch (error) {
              console.error('Error in edit folder context menu:', error);
            }
          },
        },
        {
          key: 'delete',
          label: 'Delete Folder',
          icon: <DeleteOutlined />,
          danger: true,
          onClick: () => {
            try {
              // Create a clean folder object to avoid circular references
              const cleanFolder = {
                id: folder.id,
                name: folder.name,
                description: folder.description,
                path: folder.path,
                isPublic: folder.isPublic,
                userPermission: folder.userPermission
              };
              onDeleteFolder?.(cleanFolder as FolderNode);
            } catch (error) {
              console.error('Error in delete folder context menu:', error);
            }
          },
        }
      );
    }

    return items;
  };

  return (
    <div className="flex items-center justify-between w-full group" onContextMenu={onContextMenu}>
      <div className="flex items-center space-x-2 flex-1 min-w-0">
        <span className="font-medium text-gray-800 truncate">{folder.name}</span>
        <Tooltip title={folder.isPublic ? 'Public' : folder.folderType === 'system' ? 'System' : 'Department'}>
          {getPermissionIcon()}
        </Tooltip>
        {folder.documentCount !== undefined && (
          <Tooltip title={`${folder.documentCount} documents`}>
            <span className="flex items-center text-xs text-gray-500">
              <FileTextOutlined className="mr-1" />
              {folder.documentCount}
            </span>
          </Tooltip>
        )}
      </div>

      {showContextMenu && (getContextMenuItems() || []).length > 0 && (
        <Dropdown
          menu={{ items: getContextMenuItems() }}
          trigger={['click']}
          placement="bottomRight"
        >
          <Button
            type="text"
            size="small"
            icon={<MoreOutlined />}
            className="opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => e.stopPropagation()}
          />
        </Dropdown>
      )}
    </div>
  );
};

export default FolderTree;
