import React, { useState, useEffect } from 'react';
import {
  Typography,
  Button,
  Breadcrumb,
  Card,
  Row,
  Col,
  Spin,
  Empty,
  Dropdown,
  Input,
  Select,
  Modal,
  Form,
  Tabs
} from 'antd';
import {
  FolderOutlined,
  PlusOutlined,
  MoreOutlined,
  SearchOutlined,
  FilterOutlined,
  SortAscendingOutlined,
  InfoCircleOutlined,
  EditOutlined,
  DeleteOutlined,
  AppstoreOutlined,
  UnorderedListOutlined,
  FolderOpenOutlined,
  FilePdfOutlined,
  FileWordOutlined,
  MenuOutlined as Menu,
  TeamOutlined,
  GlobalOutlined
} from '@ant-design/icons';
import { FolderTree, FolderSelectorModal } from '../../components/folder';
import { getFolderDocumentsList } from '../../lib/api/folder';
import type { FolderNode } from '../../types/folder';
import {
  getFolderTree,
  getPublicFolderTree,
  createFolder,
  updateFolder,
  deleteFolder,
  moveFolder
} from '../../lib/api/folder';

import toast from 'react-hot-toast';
import { moveDocument } from '../../lib/api/document';

import '../../styles/google-drive-folder.css';

// const { Sider, Content } = Layout;
const { Title } = Typography;
const { Option } = Select;

interface FolderItem {
  id: string;
  name: string;
  type: 'folder' | 'document';
  documentId?: string; // same as id when type=document
  versionId?: string;
  size?: string;
  modifiedAt: string;
  modifiedBy: string;
  icon?: React.ReactNode;
  color?: string;
}

const GoogleDriveFolder: React.FC = () => {
  // State management
  const [loading, setLoading] = useState(false);
  const [folders, setFolders] = useState<FolderNode[]>([]);
  const [publicFolders, setPublicFolders] = useState<FolderNode[]>([]);
  const [activeTreeType, setActiveTreeType] = useState<'department' | 'public'>('department');
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [currentFolderContents, setCurrentFolderContents] = useState<FolderItem[]>([]);
  const [breadcrumbPath, setBreadcrumbPath] = useState<FolderNode[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<FolderNode | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [rightPanelVisible, setRightPanelVisible] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // CRUD loading states
  const [createLoading, setCreateLoading] = useState(false);
  const [renameLoading, setRenameLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Move folder state
  const [moveModalVisible, setMoveModalVisible] = useState(false);
  const [moveLoading, setMoveLoading] = useState(false);
  void moveLoading;
  const [movingFolder, setMovingFolder] = useState<FolderNode | null>(null);

  // Modals and forms (create, rename, delete)
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [renameModalVisible, setRenameModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [createForm] = Form.useForm();
  const [renameForm] = Form.useForm();

  // Drag and drop state
  const [draggedItem, setDraggedItem] = useState<FolderItem | null>(null);

  // Document move state
  const [movingDocument, setMovingDocument] = useState<FolderItem | null>(null);
  const [documentMoveModalVisible, setDocumentMoveModalVisible] = useState(false);



  // Load folder trees on mount
  useEffect(() => {
    loadFolderTree();
    loadPublicFolderTree();
  }, []);

  // Handle mobile responsiveness
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (mobile) {
        setSidebarCollapsed(true);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Call once on mount

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Load folder contents when current folder changes
  useEffect(() => {
    if (currentFolderId) {
      loadFolderContents(currentFolderId);
      updateBreadcrumbPath(currentFolderId);
    } else {
      // Load root contents
      loadRootContents();
      setBreadcrumbPath([]);
    }
  }, [currentFolderId]);

  // Handle tree type changes - reload content for current context
  useEffect(() => {
    if (currentFolderId) {
      // If we have a current folder, try to load it in the new tree context
      loadFolderContents(currentFolderId);
      updateBreadcrumbPath(currentFolderId);
    } else {
      // Load root contents for the new tree
      loadRootContents();
    }
  }, [activeTreeType]);

  const loadFolderTree = async () => {
    try {
      setLoading(true);
      const response = await getFolderTree({ includeSystemFolders: true });
      setFolders(response.data.rootNodes);
      return response.data.rootNodes; // Return the fresh data
    } catch (error: any) {
      console.error('Failed to load folder tree:', error);
      toast.error('Failed to load folders');
      return [];
    } finally {
      setLoading(false);
    }
  };

  const loadPublicFolderTree = async () => {
    try {
      setLoading(true);
      const response = await getPublicFolderTree({ includeSystemFolders: true });
      setPublicFolders(response.data.rootNodes);
      return response.data.rootNodes; // Return the fresh data
    } catch (error: any) {
      console.error('Failed to load public folder tree:', error);
      toast.error('Failed to load public folders');
      return [];
    } finally {
      setLoading(false);
    }
  };

  const loadFolderContents = async (folderId: string, freshFolders?: FolderNode[]) => {
    try {
      setLoading(true);
      setSelectedFolder(null);

      // Use fresh folders if provided, otherwise use current state based on active tree
      const foldersToUse = freshFolders || getCurrentFolders();

      // 1) Always fetch subfolders (from our local tree if available)
      const folder = findFolderById(foldersToUse, folderId);
      const subfolderItems: FolderItem[] = folder?.children?.map(child => ({
        id: child.id,
        name: child.name,
        type: 'folder' as const,
        modifiedAt: child.updatedAt || child.createdAt,
        modifiedBy: 'System',
        icon: <FolderOutlined />
      })) || [];

      // 2) Fetch documents from API: GET /folder-documents/{folderId}/list
      const docsResp = await getFolderDocumentsList(folderId);
      const documentItems: FolderItem[] = (docsResp.data.documents || []).map(d => {
        const ext = (d.fileType || d.fileName || '').toString().toLowerCase();
        let icon: React.ReactNode | undefined;
        let color: string | undefined;
        if (ext.includes('pdf')) {
          color = '#cf1322';
          icon = <FilePdfOutlined style={{ color }} />;
        } else if (ext.includes('doc') || ext.includes('docx')) {
          color = '#1d39c4';
          icon = <FileWordOutlined style={{ color }} />;
        }
        return {
          id: d.id, // This is the version ID
          documentId: d.documentFileId || d.id, // Use documentFileId if available, fallback to id
          versionId: d.versionId || d.id, // Use versionId if available, fallback to id
          name: d.title || d.fileName,
          type: 'document' as const,
          size: d.fileSize ? `${Math.round(d.fileSize / 1024)} KB` : undefined,
          modifiedAt: d.lastUpdatedTime || '',
          modifiedBy: 'System',
          icon,
          color,
        };
      });

      // 3) Show subfolders first, then documents
      setCurrentFolderContents([...subfolderItems, ...documentItems]);
      if (folder) setSelectedFolder(folder);
    } catch (error: any) {
      console.error('Failed to load folder contents:', error);
      toast.error('Failed to load folder contents');
    } finally {
      setLoading(false);
    }
  };

  const loadRootContents = async (freshFolders?: FolderNode[]) => {
    try {
      setLoading(true);

      // Use fresh folders if provided, otherwise use current state based on active tree
      const foldersToUse = freshFolders || getCurrentFolders();

      // Show the root folder's children (subfolders) when no specific folder is selected
      if (foldersToUse.length > 0) {
        const rootFolder = foldersToUse[0]; // The main root folder (department or public)
        const contents: FolderItem[] = rootFolder.children.map(folder => ({
          id: folder.id,
          name: folder.name,
          type: 'folder' as const,
          modifiedAt: folder.updatedAt || folder.createdAt,
          modifiedBy: folder.folderType === 'system' ? 'System' : 'User',
          icon: <FolderOutlined />
        }));
        setCurrentFolderContents(contents);
        setSelectedFolder(null);
      } else {
        setCurrentFolderContents([]);
      }
    } catch (error: any) {
      console.error('Failed to load root contents:', error);
      toast.error('Failed to load root contents');
    } finally {
      setLoading(false);
    }
  };

  const findFolderById = (folderList: FolderNode[], id: string): FolderNode | null => {
    for (const folder of folderList) {
      if (folder.id === id) return folder;
      const found = findFolderById(folder.children, id);
      if (found) return found;
    }
    return null;
  };

  const updateBreadcrumbPath = (folderId: string) => {
    const path: FolderNode[] = [];
    const findPath = (folderList: FolderNode[], targetId: string, currentPath: FolderNode[]): boolean => {
      for (const folder of folderList) {
        const newPath = [...currentPath, folder];
        if (folder.id === targetId) {
          path.push(...newPath);
          return true;
        }
        if (findPath(folder.children, targetId, newPath)) {
          return true;
        }
      }
      return false;
    };
    // Use current active folders based on tree type
    findPath(getCurrentFolders(), folderId, []);
    setBreadcrumbPath(path);
  };

  // Get current active folders based on tree type
  const getCurrentFolders = () => {
    return activeTreeType === 'department' ? folders : publicFolders;
  };

  const handleFolderSelect = (folder: FolderNode) => {
    // Select and open the folder from the tree
    setSelectedFolder(folder);
    setCurrentFolderId(folder.id);
    // Load folder contents and update breadcrumb
    loadFolderContents(folder.id);
    updateBreadcrumbPath(folder.id);
  };

  const handleBreadcrumbClick = (folderId: string | null) => {
    setCurrentFolderId(folderId);
    if (folderId) {
      loadFolderContents(folderId);
      updateBreadcrumbPath(folderId);
    } else {
      // Load root contents for current tree
      loadRootContents();
      setBreadcrumbPath([]);
    }
  };

  const handleFolderDoubleClick = (item: FolderItem) => {
    if (item.type === 'folder') {
      // Double click opens the folder (navigates into it)
      setCurrentFolderId(item.id);
    } else if (item.type === 'document') {
      // Open document version detail in a new tab
      if (item.versionId && item.documentId) {
        const url = `/document/${item.documentId}/version/${item.versionId}`;
        window.open(url, '_blank', 'noopener,noreferrer');
      } else {
        // Fallback to general document page if versionId is not available
        const url = `/document/${item.id}`;
        window.open(url, '_blank', 'noopener,noreferrer');
      }
    }
  };





  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, item: FolderItem) => {
    setDraggedItem(item);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', item.id);
  };

  const handleDragOver = (e: React.DragEvent, targetItem: FolderItem) => {
    e.preventDefault();

    // Only allow dropping on folders and not on the dragged item itself
    if (targetItem.type === 'folder' && draggedItem && targetItem.id !== draggedItem.id) {
      e.dataTransfer.dropEffect = 'move';
    } else {
      e.dataTransfer.dropEffect = 'none';
    }
  };

  const handleDrop = async (e: React.DragEvent, targetItem: FolderItem) => {
    e.preventDefault();

    if (!draggedItem || draggedItem.id === targetItem.id) {
      setDraggedItem(null);
      return;
    }

    // Only allow dropping on folders
    if (targetItem.type !== 'folder') {
      toast.error('Can only move items into folders');
      setDraggedItem(null);
      return;
    }

    try {
      setLoading(true);

      if (draggedItem.type === 'document') {
        // Move document to folder
        if (!draggedItem.versionId) {
          toast.error('Document version ID not found');
          return;
        }

        await moveDocument(draggedItem.versionId, targetItem.id);
        toast.success(`Document "${draggedItem.name}" moved to "${targetItem.name}"`);

        // Refresh current folder contents
        if (currentFolderId) {
          await loadFolderContents(currentFolderId);
        } else {
          await loadRootContents();
        }
      } else if (draggedItem.type === 'folder') {
        // Move folder
        await moveFolder(draggedItem.id, { newParentFolderId: targetItem.id });
        toast.success(`Folder "${draggedItem.name}" moved to "${targetItem.name}"`);

        // Refresh folder tree and contents with proper sequencing
        const freshFolders = await loadFolderTree();
        if (currentFolderId) {
          await loadFolderContents(currentFolderId, freshFolders);
        } else {
          await loadRootContents(freshFolders);
        }
      }
    } catch (error: any) {
      console.error('Failed to move item:', error);
      toast.error(error?.response?.data?.message || `Failed to move ${draggedItem.type}`);
    } finally {
      setLoading(false);
      setDraggedItem(null);
    }
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  // Generate context menu items based on item type
  const getContextMenuItems = (item: FolderItem) => {
    if (item.type === 'folder') {
      // Folder context menu
      return [
        {
          key: 'rename',
          icon: <EditOutlined />,
          label: 'Rename',
          onClick: () => {
            const folder = findFolderById(getCurrentFolders(), item.id);
            if (folder) {
              setSelectedFolder(folder);
              renameForm.setFieldsValue({ name: folder.name });
              setRenameModalVisible(true);
            }
          }
        },
        {
          type: 'divider' as const
        },
        {
          key: 'move',
          icon: <FolderOpenOutlined />,
          label: 'Move',
          onClick: () => {
            const folder = findFolderById(getCurrentFolders(), item.id);
            if (folder) {
              setSelectedFolder(folder);
              setMovingFolder(folder);
              setMoveModalVisible(true);
            }
          }
        },
        {
          key: 'delete',
          icon: <DeleteOutlined />,
          label: 'Delete',
          danger: true,
          onClick: () => {
            const folder = findFolderById(getCurrentFolders(), item.id);
            if (folder) {
              setSelectedFolder(folder);
              setDeleteModalVisible(true);
            }
          }
        }
      ];
    } else {
      // Document context menu
      return [
        {
          key: 'move',
          icon: <FolderOpenOutlined />,
          label: 'Move',
          onClick: () => {
            setMovingDocument(item);
            setDocumentMoveModalVisible(true);
          }
        },
        {
          key: 'delete',
          icon: <DeleteOutlined />,
          label: 'Delete',
          danger: true,
          onClick: () => {
            // TODO: Implement document delete functionality
            toast('Document delete functionality not yet implemented');
          }
        }
      ];
    }
  };

  // Render breadcrumb
  const renderBreadcrumb = () => {
    const rootTitle = activeTreeType === 'department' ? 'Department Drive' : 'Public Drive';
    const rootIcon = activeTreeType === 'department' ? <TeamOutlined /> : <GlobalOutlined />;

    const items = [
      {
        key: 'root',
        title: (
          <Button
            type="text"
            icon={rootIcon}
            onClick={() => handleBreadcrumbClick(null)}
          >
            {rootTitle}
          </Button>
        )
      }
    ];

    breadcrumbPath.forEach((folder) => {
      items.push({
        key: folder.id,
        title: (
          <Button
            type="text"
            onClick={() => handleBreadcrumbClick(folder.id)}
          >
            {folder.name}
          </Button>
        )
      });
    });

    return <Breadcrumb items={items} />;
  };

  // Filter and sort contents
  const getFilteredAndSortedContents = () => {
    let filtered = currentFolderContents;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'modified':
          return new Date(b.modifiedAt).getTime() - new Date(a.modifiedAt).getTime();
        case 'size':
          return (a.size || '').localeCompare(b.size || '');
        default:
          return 0;
      }
    });

    return filtered;
  };

  // Render folder/file grid
  const renderFolderGrid = () => {
    if (loading) {
      return (
        <div className="google-drive-loading">
          <Spin size="large" />
        </div>
      );
    }

    const filteredContents = getFilteredAndSortedContents();

    if (filteredContents.length === 0) {
      return (
        <div className="google-drive-empty" style={{
          textAlign: 'center',
          padding: '80px 24px',
          color: '#5f6368',
          background: '#ffffff',
          borderRadius: '12px',
          margin: '20px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <Empty
            description={
              <span style={{ fontSize: '16px', color: '#5f6368' }}>
                {searchTerm ? "No items match your search" : "This folder is empty"}
              </span>
            }
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
          {!searchTerm && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setCreateModalVisible(true)}
              style={{ marginTop: '16px' }}
            >
              Create New Folder
            </Button>
          )}
        </div>
      );
    }

    return (
      <Row gutter={[20, 20]} style={{ padding: '8px 0' }}>
        {filteredContents.map((item) => (
          <Col key={item.id} xs={12} sm={8} md={6} lg={4} xl={3}>
            <Card
              hoverable
              className="folder-item-card"
              draggable
              data-item-id={item.id}
              data-item-type={item.type}
              onDragStart={(e) => handleDragStart(e, item)}
              onDragOver={(e) => handleDragOver(e, item)}
              onDrop={(e) => handleDrop(e, item)}
              onDragEnd={handleDragEnd}
              onClick={() => {
                // Single click selects and loads details without opening
                const folder = findFolderById(getCurrentFolders(), item.id);
                if (folder) {
                  setSelectedFolder(folder);
                }
              }}
              onDoubleClick={() => handleFolderDoubleClick(item)}
              style={{
                border: draggedItem?.id === item.id ? '2px dashed #1a73e8' : '1px solid #e8eaed',
                borderRadius: '12px',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                background: '#ffffff',
                boxShadow: draggedItem?.id === item.id ? '0 4px 12px rgba(26, 115, 232, 0.3)' : '0 1px 3px rgba(0,0,0,0.1)',
                opacity: draggedItem?.id === item.id ? 0.7 : 1
              }}
              styles={{
                body: {
                  padding: '20px 16px',
                  position: 'relative',
                  textAlign: 'center'
                }
              }}
            >
              <div>
                <div className="folder-icon" style={{
                  fontSize: '48px',
                  color: item.type === 'folder' ? '#4285f4' : '#34a853',
                  marginBottom: '12px'
                }}>
                  {item.type === 'folder' ? <FolderOutlined /> : item.icon}
                </div>
                <div className="folder-name" title={item.name} style={{
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#202124',
                  marginBottom: '6px',
                  lineHeight: '1.4',
                  wordBreak: 'break-word',
                  maxHeight: '40px',
                  overflow: 'hidden',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical'
                }}>
                  {item.name}
                </div>
                <div className="folder-meta" style={{
                  fontSize: '12px',
                  color: '#5f6368',
                  lineHeight: '1.3'
                }}>
                  Modified {new Date(item.modifiedAt).toLocaleDateString()}
                </div>
              </div>

              {/* Hover overlay with actions */}
              <div className="folder-actions" onClick={(e) => e.stopPropagation()} style={{
                position: 'absolute',
                top: '8px',
                right: '8px',
                opacity: 0,
                transition: 'opacity 0.2s',
                zIndex: 5,
                pointerEvents: 'none'
              }}>
                <Dropdown
                  menu={{
                    items: getContextMenuItems(item)
                  }}
                  trigger={['click']}
                >
                  <Button
                    type="text"
                    icon={<MoreOutlined />}
                    size="small"
                    className="folder-action-button"
                  />
                </Dropdown>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    );
  };

  // Handle click outside sidebar on mobile
  const handleOverlayClick = () => {
    if (isMobile && !sidebarCollapsed) {
      setSidebarCollapsed(true);
    }
  };

  return (
    <div className="google-drive-container">
      {/* Mobile overlay */}
      {isMobile && !sidebarCollapsed && (
        <div
          className="mobile-overlay"
          onClick={handleOverlayClick}
          style={{
            position: 'fixed',
            top: 0,
            left: 280,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            zIndex: 250
          }}
        />
      )}

      {/* Left Sidebar - Folder Tree */}
      <div className={`google-drive-sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <Button
            type="text"
            icon={<Menu />}
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="sidebar-toggle"
          />
          {!sidebarCollapsed && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              className="new-folder-btn"
              onClick={() => setCreateModalVisible(true)}
              disabled={activeTreeType === 'public'}
              title={activeTreeType === 'public' ? 'Cannot create folders in public tree' : 'Create new folder'}
            >
              New
            </Button>
          )}
        </div>

        {!sidebarCollapsed && (
          <div className="sidebar-content">
            <Tabs
              activeKey={activeTreeType}
              onChange={(key) => {
                setActiveTreeType(key as 'department' | 'public');
                // Reset current folder when switching trees
                setCurrentFolderId(null);
                setSelectedFolder(null);
                setBreadcrumbPath([]);
              }}
              size="small"
              items={[
                {
                  key: 'department',
                  label: (
                    <span>
                      <TeamOutlined />
                      Department
                    </span>
                  ),
                  children: (
                    <FolderTree
                      folders={folders}
                      selectedFolderId={activeTreeType === 'department' ? currentFolderId || undefined : undefined}
                      onFolderSelect={handleFolderSelect}
                      showContextMenu={false}
                      allowSelection={true}
                      allowDragDrop={true}
                      onMoveFolder={async (dragFolder, newParentId) => {
                        // Prevent moving between trees
                        if (activeTreeType !== 'department') {
                          toast.error('Cannot move folders between different trees');
                          return;
                        }
                        try {
                          setLoading(true);
                          await moveFolder(dragFolder.id, { newParentFolderId: newParentId });
                          toast.success('Folder moved successfully');
                          const freshFolders = await loadFolderTree();
                          if (currentFolderId) {
                            await loadFolderContents(currentFolderId, freshFolders);
                          } else {
                            await loadRootContents(freshFolders);
                          }
                        } catch (e: any) {
                          toast.error(e?.response?.data?.message || 'Failed to move folder');
                        } finally {
                          setLoading(false);
                        }
                      }}
                      loading={loading}
                    />
                  )
                },
                {
                  key: 'public',
                  label: (
                    <span>
                      <GlobalOutlined />
                      Public
                    </span>
                  ),
                  children: (
                    <FolderTree
                      folders={publicFolders}
                      selectedFolderId={activeTreeType === 'public' ? currentFolderId || undefined : undefined}
                      onFolderSelect={handleFolderSelect}
                      showContextMenu={false}
                      allowSelection={true}
                      allowDragDrop={false} // Disable drag and drop for public folders
                      loading={loading}
                    />
                  )
                }
              ]}
            />
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className={`google-drive-main-container ${rightPanelVisible ? 'with-details' : ''} ${isMobile && !sidebarCollapsed ? 'sidebar-expanded' : ''}`}>
        <div className="google-drive-content">
          {/* Top Bar with Breadcrumb and Controls */}
          <div className="content-header">
            <div className="breadcrumb-section">
              {renderBreadcrumb()}
            </div>

            {/* Search and Filter Bar */}
            <div className="toolbar-section">
              <div className="search-controls">
                <Input
                  placeholder="Search in folder"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                  prefix={<SearchOutlined />}
                  allowClear
                />

                <Select
                  value={sortBy}
                  onChange={setSortBy}
                  className="sort-select"
                  suffixIcon={<SortAscendingOutlined />}
                >
                  <Option value="name">Name</Option>
                  <Option value="modified">Modified</Option>
                  <Option value="size">Size</Option>
                </Select>
              </div>

              <div className="action-controls">
                <Button
                  icon={<FilterOutlined />}
                  type="text"
                  className="control-btn"
                >
                  Filter
                </Button>

                <Button
                  icon={viewMode === 'grid' ? <AppstoreOutlined /> : <UnorderedListOutlined />}
                  type="text"
                  onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                  className="control-btn"
                />

                <Button
                  type="text"
                  icon={<InfoCircleOutlined />}
                  onClick={() => setRightPanelVisible(!rightPanelVisible)}
                  className={`control-btn ${rightPanelVisible ? 'active' : ''}`}
                >
                  Details
                </Button>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="content-body">
            {loading ? (
              <div className="loading-container">
                <Spin size="large" />
              </div>
            ) : (
              renderFolderGrid()
            )}
          </div>
        </div>

        {/* Right Panel - Folder Information */}
        {rightPanelVisible && (
          <div className="details-panel">
            <div className="details-header">
              <Title level={4} className="details-title">
                {selectedFolder ? selectedFolder.name : currentFolderId ? 'Open Folder' : 'Details'}
              </Title>
              <Button
                type="text"
                icon={<InfoCircleOutlined />}
                onClick={() => setRightPanelVisible(false)}
                className="close-details-btn"
              />
            </div>

            <div className="details-content">
              {selectedFolder ? (
                <>
                  <div className="google-drive-details-icon">
                    <FolderOutlined />
                  </div>

                  <div className="details-section">
                    <div className="details-label">Name</div>
                    <div className="details-value">{selectedFolder.name}</div>

                    <div className="details-label">Type</div>
                    <div className="details-value">Folder</div>

                    <div className="details-label">Location</div>
                    <div className="details-value">{selectedFolder.path}</div>

                    <div className="details-label">Items</div>
                    <div className="details-value">{selectedFolder.children.length} items</div>

                    <div className="details-label">Created</div>
                    <div className="details-value">
                      {new Date(selectedFolder.createdAt).toLocaleDateString()}
                    </div>

                    <div className="details-label">Modified</div>
                    <div className="details-value">
                      {new Date(selectedFolder.updatedAt || selectedFolder.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="details-actions">
                    <Button
                      type="primary"
                      icon={<EditOutlined />}
                      block
                      onClick={() => {
                        if (selectedFolder) {
                          renameForm.setFieldsValue({ name: selectedFolder.name });
                          setRenameModalVisible(true);
                        }
                      }}
                    >
                      Rename Folder
                    </Button>
                  </div>
                </>
              ) : (
                <div className="empty-details">
                  <FolderOutlined style={{ fontSize: '48px', color: '#dadce0', marginBottom: '16px' }} />
                  <div>Select a folder to view details</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Create Folder Modal */}
        <Modal
          title="Create New Folder"
          open={createModalVisible}
          onCancel={() => {
            setCreateModalVisible(false);
            createForm.resetFields();
          }}
          onOk={() => createForm.submit()}
          okText="Create"
          confirmLoading={createLoading}
        >
          <Form
            form={createForm}
            layout="vertical"
            initialValues={{ name: '', description: '' }}
            onFinish={async (values) => {
              try {
                setCreateLoading(true);
                // Parent folder source of truth: prefer explicitly selected folder; if none, use current opened folder; else root
                const parentId = currentFolderId ?? selectedFolder?.id ?? undefined;
                const payload = {
                  name: values.name,
                  description: values.description || '',
                  parentFolderId: parentId,
                  isPublic: !!values.isPublic,
                };
                await createFolder(payload as any);
                toast.success('Folder created successfully');
                setCreateModalVisible(false);
                createForm.resetFields();

                // Refresh tree first and get fresh data
                const freshFolders = await loadFolderTree();

                // Then reload the current folder contents properly (including documents)
                if (parentId) {
                  await loadFolderContents(parentId, freshFolders);
                } else {
                  // If we're at root level, reload root contents
                  await loadRootContents(freshFolders);
                }
              } catch (e: any) {
                toast.error(e?.response?.data?.message || 'Failed to create folder');
              } finally {
                setCreateLoading(false);
              }
            }}
          >
            <Form.Item name="name" label="Folder Name" rules={[{ required: true, message: 'Please enter a name' }]}>
              <Input placeholder="New folder" />
            </Form.Item>
            <Form.Item name="description" label="Description">
              <Input.TextArea rows={3} placeholder="Optional" />
            </Form.Item>
          </Form>
        </Modal>

        {/* Move Folder Modal */}
        <FolderSelectorModal
          visible={moveModalVisible}
          onCancel={() => setMoveModalVisible(false)}
          onConfirm={async (targetFolderId) => {
            if (!movingFolder) return;
            try {
              setMoveLoading(true);
              await moveFolder(movingFolder.id, { newParentFolderId: targetFolderId });
              toast.success('Folder moved');
              setMoveModalVisible(false);
              setMovingFolder(null);
              const freshFolders = await loadFolderTree();
              if (currentFolderId) {
                await loadFolderContents(currentFolderId, freshFolders);
              } else {
                await loadRootContents(freshFolders);
              }
            } catch (e: any) {
              toast.error(e?.response?.data?.message || 'Failed to move folder');
            } finally {
              setMoveLoading(false);
            }
          }}
          selectedFolderId={currentFolderId || undefined}
          title="Move Folder"
          placeholder="Select a destination folder"
          filterPermission="write"
          excludeFolderIds={movingFolder ? [movingFolder.id] : []}
        />

        {/* Move Document Modal */}
        <FolderSelectorModal
          visible={documentMoveModalVisible}
          onCancel={() => setDocumentMoveModalVisible(false)}
          onConfirm={async (targetFolderId) => {
            if (!movingDocument || !targetFolderId) return;
            try {
              setMoveLoading(true);
              const versionId = movingDocument.versionId || movingDocument.id;
              if (!versionId) {
                toast.error('Document version ID not found');
                return;
              }
              await moveDocument(versionId, targetFolderId);
              toast.success(`Document "${movingDocument.name}" moved successfully`);
              setDocumentMoveModalVisible(false);
              setMovingDocument(null);

              // Refresh current folder contents
              if (currentFolderId) {
                await loadFolderContents(currentFolderId);
              } else {
                await loadRootContents();
              }
            } catch (e: any) {
              toast.error(e?.response?.data?.message || 'Failed to move document');
            } finally {
              setMoveLoading(false);
            }
          }}
          selectedFolderId={currentFolderId || undefined}
          title="Move Document"
          placeholder="Select a destination folder"
          filterPermission="write"
        />

        {/* Rename Folder Modal */}
        <Modal
          title="Rename Folder"
          open={renameModalVisible}
          onCancel={() => setRenameModalVisible(false)}
          onOk={() => renameForm.submit()}
          okText="Save"
          confirmLoading={renameLoading}
        >
          <Form
            form={renameForm}

            layout="vertical"
            onFinish={async (values) => {
              if (!selectedFolder) return;
              try {
                setRenameLoading(true);
                await updateFolder(selectedFolder.id, { name: values.name });
                toast.success('Folder renamed');
                setRenameModalVisible(false);
                const freshFolders = await loadFolderTree();

                // Refresh current folder contents if we're viewing a folder
                if (currentFolderId) {
                  await loadFolderContents(currentFolderId, freshFolders);
                } else {
                  await loadRootContents(freshFolders);
                }

                // Refresh current selection details
                const folder = findFolderById(freshFolders, selectedFolder.id);
                if (folder) {
                  setSelectedFolder(folder);
                }
              } catch (e: any) {
                toast.error(e?.response?.data?.message || 'Failed to rename folder');
              } finally {
                setRenameLoading(false);
              }
            }}
          >
            <Form.Item name="name" label="Folder Name" rules={[{ required: true, message: 'Please enter a new name' }]}>
              <Input />
            </Form.Item>
          </Form>
        </Modal>

        {/* Delete Folder Modal */}
        <Modal
          title="Delete Folder"
          open={deleteModalVisible}
          onCancel={() => setDeleteModalVisible(false)}
          onOk={async () => {
            if (!selectedFolder) return;
            try {
              setDeleteLoading(true);
              await deleteFolder(selectedFolder.id);
              toast.success('Folder deleted');
              setDeleteModalVisible(false);
              setSelectedFolder(null);
              const freshFolders = await loadFolderTree();

              // Refresh current folder contents properly
              if (currentFolderId) {
                await loadFolderContents(currentFolderId, freshFolders);
              } else {
                await loadRootContents(freshFolders);
              }
            } catch (e: any) {
              toast.error(e?.response?.data?.message || 'Failed to delete folder');
            } finally {
              setDeleteLoading(false);
            }
          }}
          confirmLoading={deleteLoading}
          okText="Delete"
          okType="danger"
        >
          <p>Are you sure you want to delete "{selectedFolder?.name}"?</p>
        </Modal>


      </div>
    </div>
  );
};

export default GoogleDriveFolder;
