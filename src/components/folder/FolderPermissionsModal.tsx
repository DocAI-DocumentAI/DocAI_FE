import React, { useState, useEffect } from 'react';
import {
  Modal,
  Table,
  Button,
  Form,
  Select,
  Input,
  Tag,
  Space,
  Popconfirm,
  Tabs,
  Card,
  Typography,
  Spin,
  Empty,
  message
} from 'antd';
import {
  PlusOutlined,
  UserOutlined,
  TeamOutlined,
  DeleteOutlined,
  EditOutlined,
  LockOutlined
} from '@ant-design/icons';
import type {
  FolderNode,
  FolderPermission,
  FolderPermissionLevel
} from '../../types/folder';
import {
  getFolderPermissions,
  grantUserPermission,
  grantDepartmentPermission,
  updateUserPermission,
  updateDepartmentPermission,
  revokeUserPermission,
  revokeDepartmentPermission
} from '../../lib/api/folder';

const { Text } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

interface FolderPermissionsModalProps {
  visible: boolean;
  folder: FolderNode | null;
  onClose: () => void;
  onPermissionsUpdated?: () => void;
}

interface PermissionFormData {
  type: 'user' | 'department';
  userId?: string;
  departmentId?: string;
  permission: FolderPermissionLevel;
}

const FolderPermissionsModal: React.FC<FolderPermissionsModalProps> = ({
  visible,
  folder,
  onClose,
  onPermissionsUpdated
}) => {
  const [permissions, setPermissions] = useState<FolderPermission[]>([]);
  const [loading, setLoading] = useState(false);
  const [grantModalVisible, setGrantModalVisible] = useState(false);
  const [editingPermission, setEditingPermission] = useState<FolderPermission | null>(null);

  const [grantForm] = Form.useForm();
  const [editForm] = Form.useForm();

  // Separate permissions by type for display
  const userPermissions = permissions.filter(p => p.userId);
  const departmentPermissions = permissions.filter(p => p.departmentId);

  // Load permissions when folder changes
  useEffect(() => {
    if (folder && visible) {
      loadPermissions();
    }
  }, [folder, visible]);

  const loadPermissions = async () => {
    if (!folder) return;

    setLoading(true);
    try {
      const response = await getFolderPermissions(folder.id);
      setPermissions(response.data); // New API returns flat array
    } catch (error: any) {
      console.error('Failed to load permissions:', error);
      message.error('Failed to load permissions');
    } finally {
      setLoading(false);
    }
  };

  // Handle grant permission
  const handleGrantPermission = async (values: PermissionFormData) => {
    if (!folder) return;

    try {
      if (values.type === 'user' && values.userId) {
        await grantUserPermission(folder.id, {
          userId: values.userId,
          permission: values.permission
        });
      } else if (values.type === 'department' && values.departmentId) {
        await grantDepartmentPermission(folder.id, {
          departmentId: values.departmentId,
          permission: values.permission
        });
      }

      message.success('Permission granted successfully');
      setGrantModalVisible(false);
      grantForm.resetFields();
      loadPermissions();
      onPermissionsUpdated?.();
    } catch (error: any) {
      console.error('Failed to grant permission:', error);
      message.error('Failed to grant permission');
    }
  };

  // Handle update permission
  const handleUpdatePermission = async (values: { permission: FolderPermissionLevel }) => {
    if (!folder || !editingPermission) return;

    try {
      if (editingPermission.userId) {
        await updateUserPermission(folder.id, editingPermission.userId, values);
      } else if (editingPermission.departmentId) {
        await updateDepartmentPermission(folder.id, editingPermission.departmentId, values);
      }

      message.success('Permission updated successfully');
      setEditingPermission(null);
      editForm.resetFields();
      loadPermissions();
      onPermissionsUpdated?.();
    } catch (error: any) {
      console.error('Failed to update permission:', error);
      message.error('Failed to update permission');
    }
  };

  // Handle revoke permission
  const handleRevokePermission = async (permission: FolderPermission) => {
    if (!folder) return;

    try {
      if (permission.userId) {
        await revokeUserPermission(folder.id, permission.userId);
      } else if (permission.departmentId) {
        await revokeDepartmentPermission(folder.id, permission.departmentId);
      }

      message.success('Permission revoked successfully');
      loadPermissions();
      onPermissionsUpdated?.();
    } catch (error: any) {
      console.error('Failed to revoke permission:', error);
      message.error('Failed to revoke permission');
    }
  };

  // Get permission color
  const getPermissionColor = (permission: FolderPermissionLevel) => {
    switch (permission) {
      case 'admin': return 'red';
      case 'write': return 'orange';
      case 'read': return 'blue';
      default: return 'default';
    }
  };

  // User permissions table columns
  const userColumns = [
    {
      title: 'User',
      dataIndex: 'userFullName',
      key: 'userFullName',
      render: (text: string, record: FolderPermission) => (
        <span>
          <UserOutlined style={{ marginRight: 8, color: '#1890ff' }} />
          {text || record.userEmail || 'Unknown User'}
        </span>
      )
    },
    {
      title: 'Permission',
      dataIndex: 'permission',
      key: 'permission',
      render: (permission: FolderPermissionLevel, record: FolderPermission) => (
        <Space>
          <Tag color={getPermissionColor(permission)}>
            {permission.toUpperCase()}
          </Tag>
          {record.isInherited && (
            <Tag color="blue">
              Inherited
            </Tag>
          )}
          {record.isDenied && (
            <Tag color="red">
              Denied
            </Tag>
          )}
          {record.expiresAt && (
            <Tag color="orange">
              Expires
            </Tag>
          )}
        </Space>
      )
    },
    {
      title: 'Source',
      dataIndex: 'permissionSource',
      key: 'permissionSource',
      render: (source: string) => (
        <Tag color="default">
          {source}
        </Tag>
      )
    },
    {
      title: 'Granted By',
      dataIndex: 'createdBy',
      key: 'createdBy'
    },
    {
      title: 'Granted At',
      dataIndex: 'createdTime',
      key: 'createdTime',
      render: (date: string) => date ? new Date(date).toLocaleDateString() : '-'
    },
    {
      title: 'Expires At',
      dataIndex: 'expiresAt',
      key: 'expiresAt',
      render: (date: string | null) => date ? new Date(date).toLocaleDateString() : 'Never'
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record: FolderPermission) => (
        <Space>
          {!record.isInherited && (
            <>
              <Button
                type="text"
                icon={<EditOutlined />}
                size="small"
                onClick={() => {
                  setEditingPermission(record);
                  editForm.setFieldsValue({ permission: record.permission });
                }}
              >
                Edit
              </Button>
              <Popconfirm
                title="Are you sure you want to revoke this permission?"
                onConfirm={() => handleRevokePermission(record)}
                okText="Yes"
                cancelText="No"
              >
                <Button
                  type="text"
                  icon={<DeleteOutlined />}
                  size="small"
                  danger
                >
                  Revoke
                </Button>
              </Popconfirm>
            </>
          )}
          {record.isInherited && (
            <Tag color="blue">
              Inherited - Cannot Edit
            </Tag>
          )}
        </Space>
      )
    }
  ];

  // Department permissions table columns (same structure as user columns)
  const departmentColumns = [
    {
      title: 'Department',
      dataIndex: 'departmentName',
      key: 'departmentName',
      render: (text: string) => (
        <span>
          <TeamOutlined style={{ marginRight: 8, color: '#52c41a' }} />
          {text || 'Unknown Department'}
        </span>
      )
    },
    {
      title: 'Permission',
      dataIndex: 'permission',
      key: 'permission',
      render: (permission: FolderPermissionLevel, record: FolderPermission) => (
        <Space>
          <Tag color={getPermissionColor(permission)}>
            {permission.toUpperCase()}
          </Tag>
          {record.isInherited && (
            <Tag color="blue">
              Inherited
            </Tag>
          )}
          {record.isDenied && (
            <Tag color="red">
              Denied
            </Tag>
          )}
          {record.expiresAt && (
            <Tag color="orange">
              Expires
            </Tag>
          )}
        </Space>
      )
    },
    {
      title: 'Source',
      dataIndex: 'permissionSource',
      key: 'permissionSource',
      render: (source: string) => (
        <Tag color="default">
          {source}
        </Tag>
      )
    },
    {
      title: 'Granted By',
      dataIndex: 'createdBy',
      key: 'createdBy'
    },
    {
      title: 'Granted At',
      dataIndex: 'createdTime',
      key: 'createdTime',
      render: (date: string) => date ? new Date(date).toLocaleDateString() : '-'
    },
    {
      title: 'Expires At',
      dataIndex: 'expiresAt',
      key: 'expiresAt',
      render: (date: string | null) => date ? new Date(date).toLocaleDateString() : 'Never'
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (record: FolderPermission) => (
        <Space>
          {!record.isInherited && (
            <>
              <Button
                type="text"
                icon={<EditOutlined />}
                size="small"
                onClick={() => {
                  setEditingPermission(record);
                  editForm.setFieldsValue({ permission: record.permission });
                }}
              >
                Edit
              </Button>
              <Popconfirm
                title="Are you sure you want to revoke this permission?"
                onConfirm={() => handleRevokePermission(record)}
                okText="Yes"
                cancelText="No"
              >
                <Button
                  type="text"
                  icon={<DeleteOutlined />}
                  size="small"
                  danger
                >
                  Revoke
                </Button>
              </Popconfirm>
            </>
          )}
          {record.isInherited && (
            <Tag color="blue">
              Inherited - Cannot Edit
            </Tag>
          )}
        </Space>
      )
    }
  ];

  return (
    <>
      <Modal
        title={
          <span>
            <LockOutlined style={{ marginRight: 8 }} />
            Manage Folder Permissions - {folder?.name}
          </span>
        }
        open={visible}
        onCancel={onClose}
        width={800}
        footer={[
          <Button key="close" onClick={onClose}>
            Close
          </Button>
        ]}
      >
        <div className="space-y-4">
          {/* Folder Info */}
          <Card size="small">
            <div className="flex items-center justify-between">
              <div>
                <Text strong>Folder: </Text>
                <Text>{folder?.path}</Text>
              </div>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setGrantModalVisible(true)}
              >
                Grant Permission
              </Button>
            </div>
          </Card>

          {/* Permissions Tables */}
          <Spin spinning={loading}>
            <Tabs defaultActiveKey="users">
              <TabPane tab="User Permissions" key="users">
                <Table
                  dataSource={userPermissions}
                  columns={userColumns}
                  rowKey="id"
                  pagination={false}
                  locale={{
                    emptyText: <Empty description="No user permissions found" />
                  }}
                />
              </TabPane>
              <TabPane tab="Department Permissions" key="departments">
                <Table
                  dataSource={departmentPermissions}
                  columns={departmentColumns}
                  rowKey="id"
                  pagination={false}
                  locale={{
                    emptyText: <Empty description="No department permissions found" />
                  }}
                />
              </TabPane>
            </Tabs>
          </Spin>
        </div>
      </Modal>

      {/* Grant Permission Modal */}
      <Modal
        title="Grant Permission"
        open={grantModalVisible}
        onCancel={() => {
          setGrantModalVisible(false);
          grantForm.resetFields();
        }}
        onOk={() => grantForm.submit()}
        okText="Grant"
      >
        <Form
          form={grantForm}
          layout="vertical"
          onFinish={handleGrantPermission}
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

          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) => prevValues.type !== currentValues.type}
          >
            {({ getFieldValue }) => {
              const type = getFieldValue('type');
              if (type === 'user') {
                return (
                  <Form.Item
                    name="userId"
                    label="User ID"
                    rules={[{ required: true, message: 'Please enter user ID' }]}
                  >
                    <Input placeholder="Enter user ID" />
                  </Form.Item>
                );
              } else if (type === 'department') {
                return (
                  <Form.Item
                    name="departmentId"
                    label="Department ID"
                    rules={[{ required: true, message: 'Please enter department ID' }]}
                  >
                    <Input placeholder="Enter department ID" />
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

      {/* Edit Permission Modal */}
      <Modal
        title="Edit Permission"
        open={!!editingPermission}
        onCancel={() => {
          setEditingPermission(null);
          editForm.resetFields();
        }}
        onOk={() => editForm.submit()}
        okText="Update"
      >
        <Form
          form={editForm}
          layout="vertical"
          onFinish={handleUpdatePermission}
        >
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
    </>
  );
};

export default FolderPermissionsModal;
