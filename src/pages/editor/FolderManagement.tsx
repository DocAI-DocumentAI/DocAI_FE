import React, { useState, useEffect } from 'react';
import {
  Layout,
  Typography,
  Card,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Switch,

  Spin,
  Row,
  Col,
  Statistic,
  Tooltip
} from 'antd';
import {
  FolderOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  BarChartOutlined,
  FileTextOutlined,
  TeamOutlined,
  GlobalOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { FolderTree } from '../../components/folder';
import type { FolderNode, FolderFormData, FolderStatistics } from '../../types/folder';
import {
  getFolderTree,
  createFolder,
  updateFolder,
  deleteFolder,
  getFolderStatistics,
  canUserPerformAction
} from '../../lib/api/folder';
import toast from 'react-hot-toast';

const { Title, Text } = Typography;
const { Content } = Layout;
const { TextArea } = Input;

const FolderManagement: React.FC = () => {
  const [folders, setFolders] = useState<FolderNode[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<FolderNode | null>(null);
  const [statistics, setStatistics] = useState<FolderStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);

  // CRUD operation loading states
  const [createLoading, setCreateLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Modal states
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  
  // Forms
  const [createForm] = Form.useForm();
  const [editForm] = Form.useForm();

  // Load data on component mount
  useEffect(() => {
    loadFolders();
    loadStatistics();
  }, []);

  const loadFolders = async () => {
    try {
      setLoading(true);
      const response = await getFolderTree({ includeSystemFolders: true });
      setFolders(response.data.rootNodes);
    } catch (error: any) {
      console.error('Failed to load folders:', error);
      toast.error('Failed to load folders');
    } finally {
      setLoading(false);
    }
  };

  const loadStatistics = async () => {
    try {
      setStatsLoading(true);
      const response = await getFolderStatistics();
      setStatistics(response.data);
    } catch (error: any) {
      console.error('Failed to load statistics:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  // Handle folder selection
  const handleFolderSelect = (folder: FolderNode) => {
    setSelectedFolder(folder);
  };

  // State to track parent folder for creation
  const [parentFolderForCreation, setParentFolderForCreation] = useState<string | undefined>(undefined);

  // Validate and clean form data
  const validateFormData = (values: any) => {
    // Ensure we only extract the necessary fields and avoid circular references
    return {
      name: String(values?.name || '').trim(),
      description: values?.description ? String(values.description).trim() : undefined,
      parentFolderId: parentFolderForCreation || undefined,
      isPublic: Boolean(values?.isPublic)
    };
  };

  // Handle create folder
  const handleCreateFolder = async (values: FolderFormData) => {
    setCreateLoading(true);
    try {
      // Validate and clean the form data
      const cleanValues = validateFormData(values);

      // Validate required fields
      if (!cleanValues.name) {
        toast.error('Folder name is required');
        return;
      }

      console.log('Creating folder with data:', cleanValues);

      const result = await createFolder(cleanValues);
      console.log('Folder created successfully:', result);

      toast.success('Folder created successfully');
      setCreateModalVisible(false);
      createForm.resetFields();
      setParentFolderForCreation(undefined);
      loadFolders();
      loadStatistics();
    } catch (error: any) {
      console.error('Failed to create folder:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to create folder';
      toast.error(errorMessage);
    } finally {
      setCreateLoading(false);
    }
  };

  // Handle edit folder
  const handleEditFolder = async (values: FolderFormData) => {
    if (!selectedFolder) return;

    setEditLoading(true);
    try {
      await updateFolder(selectedFolder.id, {
        name: values.name,
        description: values.description
      });

      toast.success('Folder updated successfully');
      setEditModalVisible(false);
      editForm.resetFields();
      loadFolders();
    } catch (error: any) {
      console.error('Failed to update folder:', error);
      toast.error('Failed to update folder');
    } finally {
      setEditLoading(false);
    }
  };

  // Handle delete folder
  const handleDeleteFolder = async () => {
    if (!selectedFolder) return;

    setDeleteLoading(true);
    try {
      await deleteFolder(selectedFolder.id);
      toast.success('Folder deleted successfully');
      setDeleteModalVisible(false);
      setSelectedFolder(null);
      loadFolders();
      loadStatistics();
    } catch (error: any) {
      console.error('Failed to delete folder:', error);
      toast.error('Failed to delete folder');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Open create modal
  const openCreateModal = (parentFolderId?: string) => {
    console.log('Opening create modal with parentFolderId:', parentFolderId);

    // Clean the parent folder ID to ensure it's a simple string
    const cleanParentId = parentFolderId ? String(parentFolderId) : undefined;

    // Set state with clean values
    setParentFolderForCreation(cleanParentId);
    setCreateModalVisible(true);

    // Reset form after modal is open
    setTimeout(() => {
      try {
        createForm.resetFields();
        createForm.setFieldsValue({
          name: '',
          description: '',
          isPublic: false
        });
      } catch (error) {
        console.error('Error setting form values:', error);
      }
    }, 100);
  };

  // Open edit modal
  const openEditModal = (folder?: FolderNode) => {
    const folderToEdit = folder || selectedFolder;
    if (!folderToEdit) return;

    // Update selected folder if a different folder is being edited
    if (folder && folder.id !== selectedFolder?.id) {
      setSelectedFolder(folder);
    }

    editForm.setFieldsValue({
      name: folderToEdit.name,
      description: folderToEdit.description || ''
    });
    setEditModalVisible(true);
  };

  // Handle delete from context menu
  const handleDeleteFromContext = (folder: FolderNode) => {
    setSelectedFolder(folder);
    setDeleteModalVisible(true);
  };

  // Utility function to find folder by ID
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

  // Check if user can perform actions on selected folder
  const canCreate = !selectedFolder || canUserPerformAction(selectedFolder, 'write');
  const canEdit = selectedFolder && canUserPerformAction(selectedFolder, 'admin');
  const canDelete = selectedFolder && canUserPerformAction(selectedFolder, 'admin');

  return (
    <Layout style={{ minHeight: "100vh", backgroundColor: "#f5f5f5" }}>
      <Content style={{ padding: "24px" }}>
        <div style={{ maxWidth: 1400, margin: "0 auto" }}>
          {/* Header */}
          <div style={{ marginBottom: 24 }}>
            <Title level={2} style={{ margin: 0, color: "#262626" }}>
              <FolderOutlined style={{ marginRight: 8 }} />
              Folder Management
            </Title>
            <Text type="secondary">Organize your documents with folders</Text>
          </div>

          {/* Statistics */}
          <Card style={{ marginBottom: 24 }} loading={statsLoading}>
            <Row gutter={16}>
              <Col span={6}>
                <Statistic
                  title="Total Folders"
                  value={statistics?.totalFolders || 0}
                  prefix={<FolderOutlined />}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="Total Documents"
                  value={statistics?.totalDocuments || 0}
                  prefix={<FileTextOutlined />}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="Public Folders"
                  value={statistics?.publicFolders || 0}
                  prefix={<GlobalOutlined />}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="Max Depth"
                  value={statistics?.maxDepth || 0}
                  prefix={<BarChartOutlined />}
                />
              </Col>
            </Row>
          </Card>

          <Row gutter={24}>
            {/* Folder Tree */}
            <Col span={16}>
              <Card
                title="Folder Structure"
                extra={
                  <Space>
                    <Tooltip title={canCreate ? "Create new folder" : "No permission to create folders"}>
                      <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => openCreateModal()}
                        disabled={!canCreate}
                        loading={createLoading}
                      >
                        New Folder
                      </Button>
                    </Tooltip>
                    <Tooltip title="Refresh folder tree">
                      <Button
                        icon={<ReloadOutlined />}
                        onClick={() => {
                          loadFolders();
                          loadStatistics();
                        }}
                        loading={loading}
                      />
                    </Tooltip>
                  </Space>
                }
              >
                {loading ? (
                  <div style={{ textAlign: 'center', padding: '40px' }}>
                    <Spin size="large" />
                  </div>
                ) : (
                  <FolderTree
                    folders={folders}
                    selectedFolderId={selectedFolder?.id}
                    onFolderSelect={handleFolderSelect}
                    onCreateFolder={openCreateModal}
                    onEditFolder={openEditModal}
                    onDeleteFolder={handleDeleteFromContext}
                    showContextMenu={true}
                    allowSelection={true}
                  />
                )}
              </Card>
            </Col>

            {/* Folder Details */}
            <Col span={8}>
              <Card
                title="Folder Details"
                extra={
                  selectedFolder && (
                    <Space>
                      <Tooltip title={canEdit ? "Edit folder" : "No permission to edit"}>
                        <Button
                          icon={<EditOutlined />}
                          onClick={() => openEditModal()}
                          disabled={!canEdit}
                          loading={editLoading}
                        />
                      </Tooltip>
                      <Tooltip title={canDelete ? "Delete folder" : "No permission to delete"}>
                        <Button
                          icon={<DeleteOutlined />}
                          danger
                          onClick={() => setDeleteModalVisible(true)}
                          disabled={!canDelete}
                          loading={deleteLoading}
                        />
                      </Tooltip>
                    </Space>
                  )
                }
              >
                {selectedFolder ? (
                  <div>
                    <div style={{ marginBottom: 16 }}>
                      <Text strong>Name:</Text>
                      <div>{selectedFolder.name}</div>
                    </div>
                    
                    {selectedFolder.description && (
                      <div style={{ marginBottom: 16 }}>
                        <Text strong>Description:</Text>
                        <div>{selectedFolder.description}</div>
                      </div>
                    )}
                    
                    <div style={{ marginBottom: 16 }}>
                      <Text strong>Path:</Text>
                      <div>{selectedFolder.path}</div>
                    </div>
                    
                    <div style={{ marginBottom: 16 }}>
                      <Text strong>Type:</Text>
                      <div>
                        {selectedFolder.folderType === 'system' ? (
                          <span><TeamOutlined /> System Folder</span>
                        ) : (
                          <span><FolderOutlined /> User Folder</span>
                        )}
                      </div>
                    </div>
                    
                    <div style={{ marginBottom: 16 }}>
                      <Text strong>Visibility:</Text>
                      <div>
                        {selectedFolder.isPublic ? (
                          <span><GlobalOutlined /> Public</span>
                        ) : (
                          <span><TeamOutlined /> Department</span>
                        )}
                      </div>
                    </div>
                    
                    <div style={{ marginBottom: 16 }}>
                      <Text strong>Documents:</Text>
                      <div>{selectedFolder.documentCount || 0}</div>
                    </div>
                    
                    <div style={{ marginBottom: 16 }}>
                      <Text strong>Permission:</Text>
                      <div>{selectedFolder.userPermission}</div>
                    </div>
                  </div>
                ) : (
                  <Text type="secondary">Select a folder to view details</Text>
                )}
              </Card>
            </Col>
          </Row>
        </div>
      </Content>

      {/* Create Folder Modal */}
      <Modal
        title="Create New Folder"
        open={createModalVisible}
        onCancel={() => {
          setCreateModalVisible(false);
          setParentFolderForCreation(undefined);
          createForm.resetFields();
        }}
        onOk={() => createForm.submit()}
        okText="Create"
        confirmLoading={createLoading}
        destroyOnClose={true}
      >
        <Form
          form={createForm}
          layout="vertical"
          onFinish={handleCreateFolder}
          preserve={false}
        >
          <Form.Item
            name="name"
            label="Folder Name"
            rules={[{ required: true, message: 'Please enter folder name' }]}
          >
            <Input placeholder="Enter folder name" />
          </Form.Item>
          
          <Form.Item
            name="description"
            label="Description"
          >
            <TextArea rows={3} placeholder="Enter folder description (optional)" />
          </Form.Item>
          
          <Form.Item
            name="isPublic"
            label="Public Folder"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
          
          {parentFolderForCreation && (
            <div>
              <Text type="secondary">
                This folder will be created inside: {
                  findFolderById(folders, parentFolderForCreation)?.path || 'Selected folder'
                }
              </Text>
            </div>
          )}
          {!parentFolderForCreation && (
            <div>
              <Text type="secondary">
                This folder will be created at the root level
              </Text>
            </div>
          )}
        </Form>
      </Modal>

      {/* Edit Folder Modal */}
      <Modal
        title="Edit Folder"
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        onOk={() => editForm.submit()}
        okText="Update"
        confirmLoading={editLoading}
      >
        <Form
          form={editForm}
          layout="vertical"
          onFinish={handleEditFolder}
        >
          <Form.Item
            name="name"
            label="Folder Name"
            rules={[{ required: true, message: 'Please enter folder name' }]}
          >
            <Input placeholder="Enter folder name" />
          </Form.Item>
          
          <Form.Item
            name="description"
            label="Description"
          >
            <TextArea rows={3} placeholder="Enter folder description (optional)" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        title="Delete Folder"
        open={deleteModalVisible}
        onCancel={() => setDeleteModalVisible(false)}
        onOk={handleDeleteFolder}
        okText="Delete"
        okType="danger"
        confirmLoading={deleteLoading}
      >
        <p>
          Are you sure you want to delete the folder "{selectedFolder?.name}"?
          This action cannot be undone.
        </p>
        {selectedFolder?.documentCount && selectedFolder.documentCount > 0 && (
          <p style={{ color: '#ff4d4f' }}>
            Warning: This folder contains {selectedFolder.documentCount} documents.
          </p>
        )}
      </Modal>
    </Layout>
  );
};

export default FolderManagement;
