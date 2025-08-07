import { 
  Table, 
  Button, 
  Space, 
  Modal, 
  Form, 
  Input, 
  Typography, 
  Card, 
  Popconfirm, 
} from "antd";
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined 
} from "@ant-design/icons";
import { useEffect, useState } from "react";
import { getTags, createTag, updateTag, deleteTag, Tag } from "../../lib/api/tag";
import toast from 'react-hot-toast';

const { Title } = Typography;

const Tags = () => {
  const [dataSource, setDataSource] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [form] = Form.useForm();

  const fetchTags = async (page = 1, pageSize = 10) => {
    setLoading(true);
    try {
      const response = await getTags(page, pageSize);
      setDataSource(response.items || []);
      setPagination({
        current: page,
        pageSize: pageSize,
        total: response.total || 0,
      });
    } catch (error: any) {
      toast.error(`Failed to fetch tags: ${error?.response?.data?.message || error.message}`);
      setDataSource([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTags();
  }, []);

  const handleTableChange = (paginationConfig: any) => {
    const { current, pageSize } = paginationConfig;
    fetchTags(current, pageSize);
  };

  const handleCreate = () => {
    setEditingTag(null);
    setModalVisible(true);
    form.resetFields();
  };

  const handleEdit = (record: Tag) => {
    setEditingTag(record);
    setModalVisible(true);
    form.setFieldsValue({
      name: record.name
    });
  };

  const handleSubmit = async (values: { name: string }) => {
    try {
      if (editingTag) {
        // Update existing tag
        await updateTag(editingTag.id, values);
        toast.success("Tag updated successfully!");
      } else {
        // Create new tag
        await createTag(values);
        toast.success("Tag created successfully!");
      }
      
      setModalVisible(false);
      form.resetFields();
      fetchTags(pagination.current, pagination.pageSize);
    } catch (error: any) {
      toast.error(`Operation failed: ${error?.response?.data?.message || error.message}`);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteTag(id);
      toast.success("Tag deleted successfully!");
      fetchTags(pagination.current, pagination.pageSize);
    } catch (error: any) {
      toast.error(`Delete failed: ${error?.response?.data?.message || error.message}`);
    }
  };

  const columns = [
    {
      title: "Tag Name",
      dataIndex: "name",
      key: "name",
      sorter: (a: Tag, b: Tag) => a.name.localeCompare(b.name),
    },
    {
      title: "Created By",
      dataIndex: "createdByName",
      key: "createdByName",
    },
    {
      title: "Created Time",
      dataIndex: "createdTime",
      key: "createdTime",
      render: (createdTime: string) => (
        new Date(createdTime).toLocaleDateString('vi-VN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        })
      ),
      sorter: (a: Tag, b: Tag) => new Date(a.createdTime).getTime() - new Date(b.createdTime).getTime(),
    },
    {
      title: "Last Updated",
      dataIndex: "lastUpdatedTime",
      key: "lastUpdatedTime",
      render: (lastUpdatedTime: string | null, record: Tag) => (
        lastUpdatedTime ? (
          <div>
            <div>{new Date(lastUpdatedTime).toLocaleDateString('vi-VN', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit'
            })}</div>
            <div style={{ fontSize: '12px', color: '#666' }}>
              by {record.lastUpdatedByName}
            </div>
          </div>
        ) : '-'
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 120,
      render: (_: any, record: Tag) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            size="small"
          >
            Edit
          </Button>
          <Popconfirm
            title="Delete Tag"
            description="Are you sure you want to delete this tag?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              type="link"
              icon={<DeleteOutlined />}
              danger
              size="small"
            >
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title level={3} style={{ margin: 0 }}>
            Tags Management
          </Title>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreate}
          >
            Create Tag
          </Button>
        </div>

        <Table
          dataSource={dataSource}
          columns={columns}
          loading={loading}
          rowKey="id"
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} of ${total} tags`,
            pageSizeOptions: ['10', '20', '50', '100'],
          }}
          onChange={handleTableChange}
        />
      </Card>

      <Modal
        title={editingTag ? "Edit Tag" : "Create New Tag"}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="name"
            label="Tag Name"
            rules={[
              { required: true, message: "Please enter tag name" },
              { min: 2, message: "Tag name must be at least 2 characters" },
              { max: 50, message: "Tag name cannot exceed 50 characters" }
            ]}
          >
            <Input placeholder="Enter tag name" />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => {
                setModalVisible(false);
                form.resetFields();
              }}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit">
                {editingTag ? "Update" : "Create"}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Tags;