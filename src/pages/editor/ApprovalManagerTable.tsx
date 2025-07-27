import { Table, Tag, Button, Input, Select, Space } from "antd";
import { useEffect, useState } from "react";
import { getDocuments } from "../../lib/api/document";
import { useNavigate } from "react-router-dom";

const statusOptions = [
  { value: "All", label: "Tất cả" },
  { value: "Pending", label: "Pending" },
  { value: "Approved", label: "Approved" },
  { value: "Rejected", label: "Rejected" },
];

const ApprovalManagerTable = () => {
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
      const response = await getDocuments(page, pageSize, searchTitle || undefined);
      console.log(response);

      setDataSource(response.items || response);
      setPagination({
        current: page,
        pageSize: pageSize,
        total: response.total || 0,
      });
    } catch (e) {
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
      dataIndex: "title",
      key: "title",
    },
    {
      title: "Người gửi",
      dataIndex: "ownerName",
      key: "ownerName",
    },
    {
      title: "Người chấp nhận ",
      dataIndex: "submittedByName",
      key: "submittedByName",
    },
    {
      title: "Ban/phòng",
      dataIndex: "departmentName",
      key: "departmentName",
    },
    {
      title: "Version",
      dataIndex: "versionName",
      key: "versionName",
    },
    {
      title: "Ngày gửi",
      dataIndex: "createdTime",
      key: "createdTime",
      render:(_: any, record: any)=><p> {record.createdTime ? new Date(record.createdTime).toLocaleDateString() : ""}</p>       
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag color={status === "Approved" ? "green" : status === "Pending" ? "orange" : "red"}>{status}</Tag>
      ),
    },
    {
      title: "Hành động",
      key: "action",
      render: (_: any, record: any) => <Button onClick={() => navigate(`/editor/doc/${record.documentId}/${record.versionId}`)} type="link">Xem </Button>,
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

export default ApprovalManagerTable;