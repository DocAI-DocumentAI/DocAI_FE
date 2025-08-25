import { Table, Tag, Button, Input, Select, Space } from "antd";
import { useState, useEffect } from "react";
import { getMyDocuments } from "../../lib/api/document";
import toast from 'react-hot-toast';
import { useNavigate } from "react-router-dom";

const statusOptions = [
  { value: "All", label: "All" },
  { value: "Draft", label: "Draft" },
  { value: "Submitted", label: "Submitted" },
];

const ViewDraftTable = () => {
  const [dataSource, setDataSource] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Get userId from localStorage
        const userStr = localStorage.getItem("user");
        if (!userStr) {
           
          return;
        }
        const user = JSON.parse(userStr);
        
        const response = await getMyDocuments(user.userId, 1, 10);
        setDataSource(
          response.items.map((doc: any) => ({
            key: doc.documentId,
            name: doc.title,
            date: doc.createdTime ? new Date(doc.createdTime).toLocaleDateString('en-US') : "",
            status: doc.status,
            description: doc.description,
            summary: doc.summary,
            fileName: doc.fileName,
            fileSize: doc.fileSize,
            tags: doc.tags,
            documentId: doc.documentId,
            versionId: doc.versionId,
          }))
        );
      } catch (error: any) {
        toast.error(`Error loading data: ${error?.response?.data?.message || error.message}`);
        setDataSource([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredData = dataSource.filter(
    (item) =>
      item.name?.toLowerCase().includes(search.toLowerCase()) &&
      (status === "All" || item.status === status)
  );

  const columns = [
    {
      title: "Document Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Created Date",
      dataIndex: "date",
      key: "date",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag color={status === "Draft" ? "blue" : status === "Submitted" ? "orange" : "default"}>{status}</Tag>
      ),
    },
    {
      title: "Actions",
      key: "action",
      render: (_: any, record: any) => (
        <Space>
          <Button type="link">Edit</Button>
          <Button type="link" onClick={() => navigate(`/view-draft/${record.documentId}/${record.versionId}`)}>View</Button>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Space style={{ marginBottom: 16 }}>
        <Input.Search
          placeholder="Search documents"
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
      <Table 
        dataSource={filteredData} 
        columns={columns} 
        loading={loading}
        pagination={{
          total: dataSource.length,
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} documents`,
        }}
      />
    </>
  );
};

export default ViewDraftTable;