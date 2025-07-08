import { Table, Tag, Button, Input, Select, Space } from "antd";
import { useState } from "react";

const dataSource = [
  {
    key: "1",
    name: "Báo cáo tài chính Q4 2023",
    sender: "Nguyễn Văn B",
    date: "10/11/2023",
    status: "Pending",
  },
  {
    key: "2",
    name: "Báo cáo kiểm toán Q3 2023",
    sender: "Trần Văn C",
    date: "12/10/2023",
    status: "Approved",
  },
];

const statusOptions = [
  { value: "All", label: "Tất cả" },
  { value: "Pending", label: "Pending" },
  { value: "Approved", label: "Approved" },
  { value: "Rejected", label: "Rejected" },
];

const ManagerTable = () => {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");

  const filteredData = dataSource.filter(
    (item) =>
      (item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.sender.toLowerCase().includes(search.toLowerCase())) &&
      (status === "All" || item.status === status)
  );

  const columns = [
    {
      title: "Tên tài liệu",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Người gửi",
      dataIndex: "sender",
      key: "sender",
    },
    {
      title: "Ngày gửi",
      dataIndex: "date",
      key: "date",
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
      render: () => <Button type="link">Xem</Button>,
    },
  ];

  return (
    <>
      <Space style={{ marginBottom: 16 }}>
        <Input.Search
          placeholder="Tìm kiếm tài liệu hoặc người gửi"
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

export default ManagerTable; 