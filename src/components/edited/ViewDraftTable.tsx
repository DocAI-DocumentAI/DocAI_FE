import { Table, Tag, Button, Input, Select, Space } from "antd";
import { useState } from "react";

const dataSource = [
  {
    key: "1",
    name: "Báo cáo tài chính Q4 2023",
    date: "09/11/2023",
    status: "Draft",
  },
  {
    key: "2",
    name: "Báo cáo kiểm toán Q3 2023",
    date: "10/10/2023",
    status: "Draft",
  },
];

const statusOptions = [
  { value: "All", label: "Tất cả" },
  { value: "Draft", label: "Draft" },
  { value: "Submitted", label: "Submitted" },
];

const ViewDraftTable = () => {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");

  const filteredData = dataSource.filter(
    (item) =>
      item.name.toLowerCase().includes(search.toLowerCase()) &&
      (status === "All" || item.status === status)
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
        <Tag color={status === "Draft" ? "blue" : "default"}>{status}</Tag>
      ),
    },
    {
      title: "Hành động",
      key: "action",
      render: () => <Button type="link">Chỉnh sửa</Button>,
    },
  ];

  return (
    <>
      <Space style={{ marginBottom: 16 }}>
        <Input.Search
          placeholder="Tìm kiếm tài liệu"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ width: 240 }}
        />
        <Select
          value={status}
          onChange={setStatus}
          options={statusOptions}
          style={{ width: 140 }}
        />
      </Space>
      <Table dataSource={filteredData} columns={columns} />
    </>
  );
};

export default ViewDraftTable; 