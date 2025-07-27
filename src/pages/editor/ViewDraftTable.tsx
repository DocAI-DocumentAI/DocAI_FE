import { Table, Tag, Button, Input, Select, Space } from "antd";
import { useState, useEffect } from "react";
import { getMyDocuments } from "../../lib/api/document";
import toast from 'react-hot-toast';
import { useNavigate } from "react-router-dom";

const statusOptions = [
  { value: "All", label: "Tất cả" },
  { value: "Draft", label: "Draft" },
  { value: "Submitted", label: "Submitted" },
];

const ViewDraftTable = () => {
  const [dataSource, setDataSource] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const navigate = useNavigate();

  const fetchData = async (page = 1, pageSize = 10, searchTitle = "") => {
    setLoading(true);
    try {
      const userStr = localStorage.getItem("user");
      if (!userStr) {
        toast.error("Không tìm thấy thông tin user, vui lòng đăng nhập lại!");
        return;
      }
      const user = JSON.parse(userStr);
      
      const response = await getMyDocuments(user.userId, page, pageSize = 10, searchTitle || undefined);
      const transformedData = response.items.map((doc: any) => ({
        key: doc.documentId,
        name: doc.title,
        date: doc.createdTime ? new Date(doc.createdTime).toLocaleDateString() : "",
        status: doc.status,
        description: doc.description,
        summary: doc.summary,
        fileName: doc.fileName,
        fileSize: doc.fileSize,
        tags: doc.tags,
        documentId: doc.documentId,
        versionId: doc.versionId,
      }));
      
      setDataSource(transformedData);
      console.log(response);
      
      setPagination({
        current: page,
        pageSize: pageSize,
        total: response.total || 0,
      });
    } catch (error: any) {
      toast.error(`Lỗi khi tải dữ liệu: ${error?.response?.data?.message || error.message}`);
      setDataSource([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(1, 10, search);
  }, []);

  const handleTableChange = (paginationConfig: any) => {
    const { current, pageSize } = paginationConfig;
    fetchData(current, pageSize, search);
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    fetchData(1, pagination.pageSize, value);
  };

  const filteredData = dataSource.filter(
    (item) => status === "All" || item.status === status
  );

  const columns = [
    {
      title: "Tên tài liệu",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Ngày tạo",
      dataIndex: "date",
      key: "date",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag color={status === "Draft" ? "blue" : status === "Submitted" ? "orange" : "default"}>{status}</Tag>
      ),
    },
    {
      title: "Hành động",
      key: "action",
      render: (_: any, record: any) => (
        <Space> 
          <Button type="link" onClick={() => navigate(`/editor/doc/${record.documentId}/${record.versionId}`)}>Xem</Button>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Space style={{ marginBottom: 16 }}>
        <Input.Search
          placeholder="Tìm kiếm theo tên tài liệu"
          onSearch={handleSearch}
          style={{ width: 240 }}
          allowClear
        />
        <Select
          value={status}
          onChange={setStatus}
          options={statusOptions}
          style={{ width: 140 }}
        />
      </Space>
      <Table 
        dataSource={filteredData} 
        columns={columns} 
        loading={loading}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} tài liệu`,
          pageSizeOptions: ['10', '20', '50', '100'],
        }}
        onChange={handleTableChange}
      />
    </>
  );
};

export default ViewDraftTable;