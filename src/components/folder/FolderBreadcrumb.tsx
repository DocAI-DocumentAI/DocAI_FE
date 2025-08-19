import React, { useMemo } from 'react';
import { Breadcrumb, Typography } from 'antd';
import { HomeOutlined, FolderOutlined } from '@ant-design/icons';
import type { FolderBreadcrumbProps, FolderNode } from '../../types/folder';

const { Text } = Typography;

const FolderBreadcrumb: React.FC<FolderBreadcrumbProps> = ({
  folderId,
  folders,
  onFolderClick,
  separator = '/',
  maxItems = 5,
  className
}) => {
  // Build breadcrumb path
  const breadcrumbPath = useMemo(() => {
    if (!folderId) return [];

    const findPath = (nodes: FolderNode[], targetId: string, currentPath: FolderNode[] = []): FolderNode[] | null => {
      for (const node of nodes) {
        const newPath = [...currentPath, node];
        
        if (node.id === targetId) {
          return newPath;
        }
        
        if (node.children && node.children.length > 0) {
          const childPath = findPath(node.children, targetId, newPath);
          if (childPath) return childPath;
        }
      }
      return null;
    };

    return findPath(folders, folderId) || [];
  }, [folderId, folders]);

  // Handle breadcrumb click
  const handleClick = (folder: FolderNode) => {
    if (onFolderClick) {
      onFolderClick(folder.id);
    }
  };

  // Create breadcrumb items
  const breadcrumbItems = useMemo(() => {
    const items = [];

    // Add home item
    items.push({
      key: 'home',
      title: onFolderClick ? (
        <a onClick={() => onFolderClick(null)} className="flex items-center space-x-1">
          <HomeOutlined />
          <span>Root</span>
        </a>
      ) : (
        <span className="flex items-center space-x-1">
          <HomeOutlined />
          <span>Root</span>
        </span>
      )
    });

    // Add folder items
    const pathToShow = breadcrumbPath.length > maxItems 
      ? [...breadcrumbPath.slice(0, 1), ...breadcrumbPath.slice(-(maxItems - 2))]
      : breadcrumbPath;

    // Add ellipsis if path was truncated
    if (breadcrumbPath.length > maxItems && pathToShow.length > 1) {
      items.push({
        key: 'ellipsis',
        title: <Text type="secondary">...</Text>
      });
    }

    pathToShow.forEach((folder, index) => {
      const isLast = index === pathToShow.length - 1;
      
      items.push({
        key: folder.id,
        title: isLast ? (
          <span className="flex items-center space-x-1">
            <FolderOutlined />
            <Text strong>{folder.name}</Text>
          </span>
        ) : onFolderClick ? (
          <a onClick={() => handleClick(folder)} className="flex items-center space-x-1">
            <FolderOutlined />
            <span>{folder.name}</span>
          </a>
        ) : (
          <span className="flex items-center space-x-1">
            <FolderOutlined />
            <span>{folder.name}</span>
          </span>
        )
      });
    });

    return items;
  }, [breadcrumbPath, maxItems, onFolderClick]);

  if (breadcrumbItems.length <= 1) {
    return (
      <div className={className}>
        <span className="flex items-center space-x-1 text-gray-600">
          <HomeOutlined />
          <span>Root</span>
        </span>
      </div>
    );
  }

  return (
    <div className={className}>
      <Breadcrumb
        separator={separator}
        items={breadcrumbItems}
      />
    </div>
  );
};

export default FolderBreadcrumb;
