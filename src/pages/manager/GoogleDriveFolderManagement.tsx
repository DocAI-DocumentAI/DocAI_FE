import React, { useState, useEffect } from 'react';
import {
  Layout,
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
  Tabs,
  Table,
  Tag,
  Popconfirm,
  Modal,
  Form
} from 'antd';
import {
  FolderOutlined,
  PlusOutlined,
  MoreOutlined,
  SearchOutlined,
  FilterOutlined,
  SortAscendingOutlined,
  HomeOutlined,
  InfoCircleOutlined,
  EditOutlined,
  DeleteOutlined,
  AppstoreOutlined,
  UnorderedListOutlined,
  UserOutlined,
  TeamOutlined,
  LockOutlined,
  FolderOpenOutlined,
  FilePdfOutlined,
  FileWordOutlined
} from '@ant-design/icons';
import { FolderTree, FolderSelectorModal } from '../../components/folder';
import { getFolderDocumentsList } from '../../lib/api/folder';
import type { FolderNode, FolderPermission, FolderPermissionLevel } from '../../types/folder';
import {
  getFolderTree,
  getFolderPermissions,
  createFolder,
  updateFolder,
  deleteFolder,
  moveFolder,
  grantUserPermission,
  grantDepartmentPermission,
  revokeUserPermission,
  revokeDepartmentPermission
} from '../../lib/api/folder';
import toast from 'react-hot-toast';
// import { moveDocument } from '../../lib/api/document';
import '../../styles/google-drive-folder.css';

const { Sider, Content } = Layout;
const { Title, Text } = Typography;
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

const GoogleDriveFolderManagement: React.FC = () => {
  // State management
  const [loading, setLoading] = useState(false);
  const [folders, setFolders] = useState<FolderNode[]>([]);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [currentFolderContents, setCurrentFolderContents] = useState<FolderItem[]>([]);
  const [breadcrumbPath, setBreadcrumbPath] = useState<FolderNode[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<FolderNode | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [rightPanelVisible, setRightPanelVisible] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeTab, setActiveTab] = useState('details');
  const [permissions, setPermissions] = useState<FolderPermission[]>([]);
  const [permissionsLoading, setPermissionsLoading] = useState(false);

  // CRUD loading states
  const [createLoading, setCreateLoading] = useState(false);
  const [renameLoading, setRenameLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [grantLoading, setGrantLoading] = useState(false);

  // Move folder state
  const [moveModalVisible, setMoveModalVisible] = useState(false);
  const [moveLoading, setMoveLoading] = useState(false);
  void moveLoading;
  const [movingFolder, setMovingFolder] = useState<FolderNode | null>(null);

  // Modals and forms (create, rename, delete, grant permission)
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [renameModalVisible, setRenameModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [grantPermissionModalVisible, setGrantPermissionModalVisible] = useState(false);
  const [createForm] = Form.useForm();
  const [renameForm] = Form.useForm();
  const [grantPermissionForm] = Form.useForm();

  // Load folder tree on mount
  useEffect(() => {
    loadFolderTree();
  }, []);

  // Load folder contents when current folder changes
  useEffect(() => {
    if (currentFolderId) {
      loadFolderContents(currentFolderId);
      updateBreadcrumbPath(currentFolderId);
      if (activeTab === 'permissions') {
        loadPermissions(currentFolderId);
      }
    } else {
      // Load root contents
      loadRootContents();
      setBreadcrumbPath([]);
      setPermissions([]);
    }
  }, [currentFolderId, activeTab]);

  const loadFolderTree = async () => {
    try {
      setLoading(true);
      const response = await getFolderTree({ includeSystemFolders: true });
      setFolders(response.data.rootNodes);
    } catch (error: any) {
      console.error('Failed to load folder tree:', error);
      toast.error('Failed to load folders');
    } finally {
      setLoading(false);
    }
  };

  const loadFolderContents = async (folderId: string) => {
    try {
      setLoading(true);
      setSelectedFolder(null);

      // 1) Always fetch subfolders (from our local tree if available)
      const folder = findFolderById(folders, folderId);
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
          id: d.id,
          documentId: d.id,
          versionId: d.versionId,
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

  const loadRootContents = () => {
    const contents: FolderItem[] = folders.map(folder => ({
      id: folder.id,
      name: folder.name,
      type: 'folder' as const,
      modifiedAt: folder.updatedAt || folder.createdAt,
      modifiedBy: 'System',
      icon: <FolderOutlined />
    }));
    setCurrentFolderContents(contents);
    setSelectedFolder(null);
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
    findPath(folders, folderId, []);
    setBreadcrumbPath(path);
  };

  const handleFolderSelect = (folder: FolderNode) => {
    // Select and open the folder from the tree
    setSelectedFolder(folder);
    setCurrentFolderId(folder.id);
    loadPermissions(folder.id);
  };

  const handleBreadcrumbClick = (folderId: string | null) => {
    setCurrentFolderId(folderId);
  };

  const handleFolderDoubleClick = (item: FolderItem) => {
    if (item.type === 'folder') {
      // Double click opens the folder (navigates into it)
      setCurrentFolderId(item.id);
    } else if (item.type === 'document') {
      // Open document detail in a new tab, passing versionId if available
      const url = item.versionId ? `/document/${item.id}?versionId=${encodeURIComponent(item.versionId)}` : `/document/${item.id}`;
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const loadPermissions = async (folderId: string) => {
    try {
      setPermissionsLoading(true);
      const response = await getFolderPermissions(folderId);
      setPermissions(response.data);
    } catch (error: any) {
      console.error('Failed to load permissions:', error);
      toast.error('Failed to load permissions');
    } finally {
      setPermissionsLoading(false);
    }
  };

  const handleRevokePermission = async (permission: FolderPermission) => {
    try {
      const folderId = permission.folderId || selectedFolder?.id || currentFolderId;
      if (!folderId) return;
      if (permission.userId) {
        await revokeUserPermission(folderId, permission.userId);
      } else if (permission.departmentId) {
        await revokeDepartmentPermission(folderId, permission.departmentId);
      }
      toast.success('Permission revoked successfully');
      await loadPermissions(folderId);
    } catch (error: any) {
      console.error('Failed to revoke permission:', error);
      toast.error('Failed to revoke permission');
    }
  };



  const getPermissionColor = (permission: FolderPermissionLevel): string => {
    switch (permission) {
      case 'admin': return 'red';
      case 'write': return 'orange';
      case 'read': return 'green';
      default: return 'default';
    }
  };

  // Render breadcrumb
  const renderBreadcrumb = () => {
    const items = [
      {
        key: 'root',
        title: (
          <Button
            type="text"
            icon={<HomeOutlined />}
            onClick={() => handleBreadcrumbClick(null)}
          >
            My Drive
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
        <div className="google-drive-empty">
          <Empty
            description={searchTerm ? "No items match your search" : "This folder is empty"}
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        </div>
      );
    }

    return (
      <Row gutter={[16, 16]}>
        {filteredContents.map((item) => (
          <Col key={item.id} xs={12} sm={8} md={6} lg={4} xl={3}>
            <Card
              hoverable
              className="folder-item-card"
              onClick={() => {
                // Single click selects and loads details/permissions without opening
                const folder = findFolderById(folders, item.id);
                if (folder) {
                  setSelectedFolder(folder);
                  loadPermissions(folder.id);
                }
              }}
              onDoubleClick={() => handleFolderDoubleClick(item)}
              styles={{ body: { padding: '16px', position: 'relative' } }}
            >
              <div style={{ textAlign: 'center' }}>
                <div className="folder-icon">
                  {item.type === 'folder' ? <FolderOutlined /> : item.icon}
                </div>
                <div className="folder-name" title={item.name}>
                  {item.name}
                </div>
                <div className="folder-meta">
                  Modified {new Date(item.modifiedAt).toLocaleDateString()}
                </div>
              </div>

              {/* Hover overlay with actions */}
              <div className="folder-actions" onClick={(e) => e.stopPropagation()}>
                <Dropdown
                  menu={{
                    items: [
                      {
                        key: 'rename',
                        icon: <EditOutlined />,
                        label: 'Rename',
                        onClick: () => {
                          const folder = findFolderById(folders, item.id);
                          if (folder) {
                            setSelectedFolder(folder);
                            renameForm.setFieldsValue({ name: folder.name });
                            setRenameModalVisible(true);
                          }
                        }
                      },
                      {
                        type: 'divider'
                      },
                      {
                        key: 'move',
                        icon: <FolderOpenOutlined />,
                        label: 'Move',
                        onClick: () => {
                          const folder = findFolderById(folders, item.id);
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
                          const folder = findFolderById(folders, item.id);
                          if (folder) {
                            setSelectedFolder(folder);
                            setDeleteModalVisible(true);
                          }
                        }
                      }
                    ]
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

  return (
    <Layout className="google-drive-layout">
      {/* Left Sidebar - Folder Tree */}
      <Sider
        width={280}
        collapsed={sidebarCollapsed}
        onCollapse={setSidebarCollapsed}
        className="google-drive-sidebar"
        theme="light"
        collapsible
      >
        <div style={{ padding: '16px' }}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            className="google-drive-new-button"
            block
            size="large"
            onClick={() => {
              setCreateModalVisible(true);
            }}
          >
            New
          </Button>
        </div>

        <div className="google-drive-tree">
          <FolderTree
            folders={folders}
            selectedFolderId={currentFolderId || undefined}
            onFolderSelect={handleFolderSelect}
            showContextMenu={false}
            allowSelection={true}
            allowDragDrop={true}
            onMoveFolder={async (dragFolder, newParentId) => {
              try {
                setLoading(true);
                await moveFolder(dragFolder.id, { newParentFolderId: newParentId });
                toast.success('Folder moved');
                await loadFolderTree();
                if (currentFolderId) await loadFolderContents(currentFolderId);
              } catch (e: any) {
                toast.error(e?.response?.data?.message || 'Failed to move folder');
              } finally {
                setLoading(false);
              }
            }}
            loading={loading}
          />
        </div>
      </Sider>

      {/* Main Content Area */}
      <Layout>
        <Content className="google-drive-content">
          {/* Top Bar with Breadcrumb and Controls */}
          <div className="google-drive-header">
            <div className="google-drive-breadcrumb">
              {renderBreadcrumb()}
            </div>

            {/* Search and Filter Bar */}
            <div className="google-drive-toolbar">
              <Input
                placeholder="Search in folder"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="google-drive-search"
                style={{ width: 300 }}
                prefix={<SearchOutlined />}
                allowClear
              />

              <Select
                value={sortBy}
                onChange={setSortBy}
                style={{ width: 140 }}
                suffixIcon={<SortAscendingOutlined />}
              >
                <Option value="name">Name</Option>
                <Option value="modified">Modified</Option>
                <Option value="size">Size</Option>
              </Select>

              <Button icon={<FilterOutlined />} type="text">
                Filter
              </Button>

              <Button
                icon={viewMode === 'grid' ? <AppstoreOutlined /> : <UnorderedListOutlined />}
                type="text"
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              />

              <Button
                type="text"
                icon={<InfoCircleOutlined />}
                onClick={() => setRightPanelVisible(!rightPanelVisible)}
              >
                Details
              </Button>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="google-drive-main">
            {renderFolderGrid()}
          </div>
        </Content>

        {/* Right Panel - Folder Information */}
        {rightPanelVisible && (
          <Sider
            width={360}
            className="google-drive-details"
            theme="light"
          >
            <div className="google-drive-details-header">
              <Title level={4} style={{ margin: 0, fontSize: '16px', fontWeight: 500 }}>
                {selectedFolder ? selectedFolder.name : currentFolderId ? 'Open Folder' : 'Details'}
              </Title>
            </div>

            <div className="google-drive-details-content">
              {selectedFolder ? (
                <Tabs
                  activeKey={activeTab}
                  onChange={setActiveTab}
                  items={[
                    {
                      key: 'details',
                      label: (
                        <span>
                          <InfoCircleOutlined />
                          Details
                        </span>
                      ),
                      children: (
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
                      )
                    },
                    {
                      key: 'permissions',
                      label: (
                        <span>
                          <LockOutlined />
                          Permissions
                        </span>
                      ),
                      children: (
                        <div style={{ padding: '8px 0' }}>
                          <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text strong>Access Control</Text>
                            <Button
                              type="primary"
                              size="small"
                              icon={<PlusOutlined />}
                              onClick={() => setGrantPermissionModalVisible(true)}
                            >
                              Add
                            </Button>
                          </div>

                          {permissionsLoading ? (
                            <div style={{ textAlign: 'center', padding: '20px' }}>
                              <Spin />
                            </div>
                          ) : (
                            <Table
                              dataSource={permissions}
                              pagination={false}
                              size="small"
                              scroll={{ y: 300 }}
                              columns={[
                                {
                                  title: 'User/Department',
                                  key: 'entity',
                                  render: (record: FolderPermission) => (
                                    <div>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        {record.userId ? (
                                          <>
                                            <UserOutlined style={{ color: '#1890ff' }} />
                                            <span>{record.userFullName || record.userEmail || 'Unknown User'}</span>
                                          </>
                                        ) : (
                                          <>
                                            <TeamOutlined style={{ color: '#52c41a' }} />
                                            <span>{record.departmentName || 'Unknown Department'}</span>
                                          </>
                                        )}
                                      </div>
                                      {record.isInherited && (
                                        <Tag color="blue" style={{ marginTop: '4px' }}>
                                          Inherited
                                        </Tag>
                                      )}
                                    </div>
                                  )
                                },
                                {
                                  title: 'Access',
                                  key: 'permission',
                                  render: (record: FolderPermission) => (
                                    <Tag color={getPermissionColor(record.permission)}>
                                      {record.permission.toUpperCase()}
                                    </Tag>
                                  )
                                },
                                {
                                  title: 'Actions',
                                  key: 'actions',
                                  width: 60,
                                  render: (record: FolderPermission) => (
                                    !record.isInherited && (
                                      <Popconfirm
                                        title="Remove access?"
                                        onConfirm={() => handleRevokePermission(record)}
                                        okText="Yes"
                                        cancelText="No"
                                      >
                                        <Button
                                          type="text"
                                          size="small"
                                          icon={<DeleteOutlined />}
                                          danger
                                        />
                                      </Popconfirm>
                                    )
                                  )
                                }
                              ]}
                            />
                          )}
                        </div>
                      )
                    }
                  ]}
                />
              ) : (
                <div className="google-drive-empty">
                  <FolderOutlined style={{ fontSize: '48px', color: '#dadce0', marginBottom: '16px' }} />
                  <div>Select a folder to view details</div>
                </div>
              )}
            </div>
          </Sider>
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

                // Refresh tree and current view deterministically using fresh data
                const treeResp = await getFolderTree({ includeSystemFolders: true });
                const newRoots = treeResp.data.rootNodes;
                setFolders(newRoots);

                if (parentId) {
                  const parentNode = findFolderById(newRoots, parentId);
                  if (parentNode) {
                    const contents: FolderItem[] = parentNode.children.map(child => ({
                      id: child.id,
                      name: child.name,
                      type: 'folder' as const,
                      modifiedAt: child.updatedAt || child.createdAt,
                      modifiedBy: 'System',
                      icon: <FolderOutlined />
                    }));
                    setCurrentFolderId(parentId);
                    setSelectedFolder(parentNode);
                    setCurrentFolderContents(contents);
                    await loadPermissions(parentId);
                  }
                } else {
                  // root
                  const rootContents: FolderItem[] = newRoots.map(folder => ({
                    id: folder.id,
                    name: folder.name,
                    type: 'folder' as const,
                    modifiedAt: folder.updatedAt || folder.createdAt,
                    modifiedBy: 'System',
                    icon: <FolderOutlined />
                  }));
                  setCurrentFolderId(null);
                  setSelectedFolder(null);
                  setCurrentFolderContents(rootContents);
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
              await loadFolderTree();
              if (currentFolderId) await loadFolderContents(currentFolderId);
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
                await loadFolderTree();
                // Refresh current selection details
                const folder = findFolderById(folders, selectedFolder.id);
                if (folder) {
                  setSelectedFolder(folder);
                  await loadPermissions(folder.id);
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
              await loadFolderTree();
              loadRootContents();
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

        {/* Grant Permission Modal (full) */}
        <Modal
          title="Grant Permission"
          open={grantPermissionModalVisible}
          onCancel={() => setGrantPermissionModalVisible(false)}
          onOk={() => grantPermissionForm.submit()}
          okText="Grant"
          confirmLoading={grantLoading}
        >
          <Form
            form={grantPermissionForm}
            layout="vertical"
            onFinish={async (values) => {
              if (!selectedFolder) return;
              try {
                setGrantLoading(true);
                if (values.type === 'user') {
                  await grantUserPermission(selectedFolder.id, {
                    userId: values.userId,
                    permission: values.permission,
                  });
                } else {
                  await grantDepartmentPermission(selectedFolder.id, {
                    departmentId: values.departmentId,
                    permission: values.permission,
                  });
                }
                toast.success('Permission granted successfully');
                setGrantPermissionModalVisible(false);
                grantPermissionForm.resetFields();
                await loadPermissions(selectedFolder.id);
              } catch (e: any) {
                toast.error(e?.response?.data?.message || 'Failed to grant permission');
              } finally {
                setGrantLoading(false);
              }
            }}
          >
            <Form.Item
              name="type"
              label="Permission Type"
              rules={[{ required: true, message: 'Please select permission type' }]}
            >
              <Select placeholder="Select type">
                <Option value="user">User Permission</Option>
                <Option value="department">Department Permission</Option>
              </Select>
            </Form.Item>

            <Form.Item noStyle shouldUpdate={(prev, cur) => prev.type !== cur.type}>
              {({ getFieldValue }) => {
                const type = getFieldValue('type');
                if (type === 'user') {
                  return (
                    <Form.Item
                      name="userId"
                      label="User ID"
                      rules={[{ required: true, message: 'Please enter user id' }]}
                    >
                      <Input placeholder="user-001" />
                    </Form.Item>
                  );
                }
                if (type === 'department') {
                  return (
                    <Form.Item
                      name="departmentId"
                      label="Department ID"
                      rules={[{ required: true, message: 'Please enter department id' }]}
                    >
                      <Input placeholder="dept-001" />
                    </Form.Item>
                  );
                }
                return null;
              }}
            </Form.Item>

            <Form.Item
              name="permission"
              label="Permission Level"
              rules={[{ required: true, message: 'Please select permission level' }]}
            >
              <Select placeholder="Select permission level">
                <Option value="read">Read</Option>
                <Option value="write">Write</Option>
                <Option value="admin">Admin</Option>
              </Select>
            </Form.Item>
          </Form>
        </Modal>
      </Layout>
    </Layout>
  );
};

export default GoogleDriveFolderManagement;
