import { Table, Tag, Button, Input, Select, Space } from "antd";
import { useState, useEffect } from "react";
import { getMyDocuments, getDocumentTypes, DocumentType } from "../../lib/api/document";
import toast from 'react-hot-toast';
import { useNavigate } from "react-router-dom";

const statusOptions = [
  { value: "", label: "Tất cả trạng thái" },
  { value: "0", label: "Draft" },
  { value: "4", label: "Submitted" },
  { value: "1", label: "Pending" },
  { value: "2", label: "Approved" },
  { value: "3", label: "Rejected" },
];

const publicOptions = [
  { value: "", label: "Tất cả quyền truy cập" },
  { value: "true", label: "Công khai" },
  { value: "false", label: "Riêng tư" },
];

interface DocumentFilters {
  title?: string;
  isPublic?: boolean;
  status?: string;
  documentTypeId?: string;
}

const ViewDraftTable = () => {
  const [dataSource, setDataSource] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([]);
  const [loadingDocumentTypes, setLoadingDocumentTypes] = useState(false);
  const [filters, setFilters] = useState<DocumentFilters>({
    title: "",
    isPublic: undefined,
    status: "",
    documentTypeId: "",
  });
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const navigate = useNavigate();

  // Fetch document types on component mount
  useEffect(() => {
    fetchDocumentTypes();
  }, []);

  // Fetch documents when component mounts
  useEffect(() => {
    fetchData(1, 10, filters);
  }, []);

  const fetchDocumentTypes = async () => {
    setLoadingDocumentTypes(true);
    try {
      const types = await getDocumentTypes();
      setDocumentTypes(types);
      console.log('Document types loaded:', types);
    } catch (error) {
      console.error('Error fetching document types:', error);
    } finally {
      setLoadingDocumentTypes(false);
    }
  };

  const fetchData = async (page = 1, pageSize = 10, searchFilters: DocumentFilters = {}) => {
    setLoading(true);
    try {
      const userStr = localStorage.getItem("user");
      if (!userStr) {
        toast.error("Không tìm thấy thông tin user, vui lòng đăng nhập lại!");
        return;
      }
      const user = JSON.parse(userStr);

      // Prepare filters for API call
      const apiFilters: any = {};

      if (searchFilters.title && searchFilters.title.trim()) {
        apiFilters.title = searchFilters.title.trim();
      }

      if (searchFilters.isPublic !== undefined) {
        apiFilters.isPublic = searchFilters.isPublic;
      }

      if (searchFilters.status && searchFilters.status !== "") {
        apiFilters.status = searchFilters.status;
      }

      if (searchFilters.documentTypeId && searchFilters.documentTypeId !== "") {
        apiFilters.documentTypeId = searchFilters.documentTypeId;
      }

      console.log('API call with filters:', apiFilters);

      // Call API with filters
      const response = await getMyDocuments(
        user.userId,
        page,
        pageSize,
        undefined, // title parameter (deprecated, using filters instead)
        apiFilters  // filters object
      );

      setDataSource(response.items || []);
      console.log('API response:', response);

      setPagination({
        current: page,
        pageSize: pageSize,
        total: response.total || 0,
      });
    } catch (error: any) {
      toast.error(`Lỗi khi tải dữ liệu: ${error?.response?.data?.message || error.message}`);
      setDataSource([]);
      setPagination(prev => ({ ...prev, total: 0 }));
    } finally {
      setLoading(false);
    }
  };

  const handleTableChange = (paginationConfig: any) => {
    const { current, pageSize } = paginationConfig;
    setPagination(prev => ({ ...prev, current, pageSize }));
    fetchData(current, pageSize, filters);
  };

  const handleSearch = (value: string) => {
    const newFilters = { ...filters, title: value };
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, current: 1 }));
    fetchData(1, pagination.pageSize, newFilters);
  };

  const handleStatusChange = (value: string) => {
    const newFilters = { ...filters, status: value };
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, current: 1 }));
    fetchData(1, pagination.pageSize, newFilters);
  };

  const handlePublicChange = (value: string) => {
    let isPublic: boolean | undefined;
    if (value === "true") isPublic = true;
    else if (value === "false") isPublic = false;
    else isPublic = undefined;

    const newFilters = { ...filters, isPublic };
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, current: 1 }));
    fetchData(1, pagination.pageSize, newFilters);
  };

  const handleDocumentTypeChange = (value: string) => {
    const newFilters = { ...filters, documentTypeId: value };
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, current: 1 }));
    fetchData(1, pagination.pageSize, newFilters);
  };

  const handleClearFilters = () => {
    const newFilters = {
      title: "",
      isPublic: undefined,
      status: "",
      documentTypeId: "",
    };
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, current: 1 }));
    fetchData(1, pagination.pageSize, newFilters);
  };

  // Generate document type options from API data
  const documentTypeOptions = [
    { value: "", label: "Tất cả loại tài liệu" },
    ...documentTypes.map(type => ({
      value: type.id,
      label: type.name
    }))
  ];

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.title && filters.title.trim()) count++;
    if (filters.isPublic !== undefined) count++;
    if (filters.status && filters.status !== "") count++;
    if (filters.documentTypeId && filters.documentTypeId !== "") count++;
    return count;
  };

  const columns = [
    {
      title: "Tên tài liệu",
      dataIndex: "title",
      key: "title",
      width: 100,
      ellipsis: true,
    },
    {
      title: "Loại tài liệu",
      dataIndex: "documentTypeName",
      key: "documentTypeName",
      width: 100,

    },
    {
      title: "Version",
      dataIndex: "versionName",
      width: 100,
      key: "versionName",
    },
    {
      title: "Quyền truy cập",
      width: 100,
      dataIndex: "isPublic",
      key: "isPublic",
      render: (isPublic: boolean) => (
        <Tag color={isPublic ? "blue" : "orange"}>
          {isPublic ? "Công khai" : "Riêng tư"}
        </Tag>
      ),
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdTime",
      width: 100,
      key: "createdTime",
      render: (createdTime: string) => (
        <span>
          {createdTime ? new Date(createdTime).toLocaleDateString('vi-VN') : ""}
        </span>
      )
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      width: 100,
      key: "status",
      render: (status: string) => {
        const getStatusColor = (status: string) => {
          switch (status) {
            case "Draft": return "blue";
            case "Submitted": return "orange";
            case "Pending": return "processing";
            case "Approved": return "green";
            case "Rejected": return "red";
            default: return "default";
          }
        };
        return <Tag color={getStatusColor(status)}>{status}</Tag>;
      },
    },
    {
      title: "Hành động",
      width: 100,
      key: "action",
      render: (_: any, record: any) => (
        <Button
          type="link"
          onClick={() => navigate(`/editor/doc/${record.documentId}/${record.versionId}`)}
          size="small"
        >
          Xem chi tiết
        </Button>
      ),
    },
  ];

  return (
    <>
      <div style={{ marginBottom: 16 }}>
        <Space wrap>
          <Input.Search
            placeholder="Tìm kiếm theo tên tài liệu"
            value={filters.title}
            onSearch={handleSearch}
            onChange={(e) => setFilters(prev => ({ ...prev, title: e.target.value }))}
            style={{ width: 250 }}
            allowClear
          />

          <Select
            value={filters.status}
            onChange={handleStatusChange}
            options={statusOptions}
            style={{ width: 180 }}
            placeholder="Trạng thái"
          />

          <Select
            value={filters.isPublic === undefined ? "" : filters.isPublic.toString()}
            onChange={handlePublicChange}
            options={publicOptions}
            style={{ width: 180 }}
            placeholder="Quyền truy cập"
          />

          <Select
            value={filters.documentTypeId}
            onChange={handleDocumentTypeChange}
            options={documentTypeOptions}
            style={{ width: 180 }}
            placeholder="Loại tài liệu"
            loading={loadingDocumentTypes}
            notFoundContent={loadingDocumentTypes ? "Đang tải..." : "Không có dữ liệu"}
          />

          {getActiveFiltersCount() > 0 && (
            <Button
              onClick={handleClearFilters}
              style={{ color: '#ff4d4f' }}
            >
              Xóa bộ lọc ({getActiveFiltersCount()})
            </Button>
          )}
        </Space>
      </div>

      <Table
        dataSource={dataSource}
        columns={columns}
        loading={loading}
        rowKey="documentId"
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
        scroll={{ x: 'max-content' }}
      />
    </>
  );
};

export default ViewDraftTable;