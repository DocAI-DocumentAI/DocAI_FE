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
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const docs = await getDocuments(1, 10);
        console.log(docs);

        setDataSource(
          docs)
      } catch (e) {
        setDataSource([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);
 

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
      <Table dataSource={dataSource} columns={columns} loading={loading} />
    </>
  );
};

export default ApprovalManagerTable; 