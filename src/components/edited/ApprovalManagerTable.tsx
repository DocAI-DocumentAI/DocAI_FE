import { Table, Tag, Button, Input, Select, Space } from "antd";
import { useEffect, useState } from "react";
import { getDocuments } from "../../lib/api/document";

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

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const docs = await getDocuments(1, 10);
        setDataSource(
          docs.map((doc: any) => ({
            key: doc.documentId,
            name: doc.title,
            sender: doc.submittedBy || doc.ownerId || "N/A",
            date: doc.createdTime ? new Date(doc.createdTime).toLocaleDateString() : "",
            status: doc.status,
          }))
        );
      } catch (e) {
        setDataSource([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredData = dataSource.filter(
    (item) =>
      (item.name?.toLowerCase().includes(search.toLowerCase()) ||
        item.sender?.toLowerCase().includes(search.toLowerCase())) &&
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
      <Table dataSource={filteredData} columns={columns} loading={loading} />
    </>
  );
};

export default ApprovalManagerTable; 