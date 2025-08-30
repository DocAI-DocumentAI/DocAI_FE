import React, { useState, useEffect, useCallback } from "react";
import {
  Typography,
  Tabs,
  Button,
  Badge,
  Empty,
  Card,
  Pagination,
  Input,
  Spin,
  Row,
  Col,
  Collapse,
  Tooltip,
} from "antd";
import {
  UserOutlined,
  EyeOutlined,
  FolderOutlined,
  FileOutlined,
  FilePdfOutlined,
  FileWordOutlined,
  FileExcelOutlined,
  FilePptOutlined,
  FileImageOutlined,
  FileZipOutlined,
  ClockCircleOutlined,
  UserAddOutlined,
  GlobalOutlined,
  BankOutlined, 
  LockOutlined,
  UnlockOutlined,
  UpOutlined,
  DownOutlined,
  FilterOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { Navbar } from "../../components/layout/Navbar";
import { DocumentLibraryFilter } from "../../components/DocumentLibraryFilter";
// import { FolderTree, FolderBreadcrumb } from "../../components/folder";
import {
  getOfficialDocuments,
  getDocumentTypesEnhanced,
  getTagsEnhanced,
} from "../../lib/api/document";
import { getFolderTree } from "../../lib/api/folder";
import type {
  DocumentDraftResponse,
  DocumentTypeResponse,
  TagResponse,
  OfficialDocumentsRequest,
} from "../../types/DocumentLibrary";
// import type { FolderNode } from "../../types/folder";

const { Title, Text } = Typography;
const { Search } = Input;

// Helper functions
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

const formatDate = (dateString: string | undefined): string => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString();
};

// Get file type icon based on file extension
const getFileTypeIcon = (fileName: string) => {
  const extension = fileName?.split(".").pop()?.toLowerCase();
  const iconProps = { style: { fontSize: "20px", color: "#1e40af" } };

  switch (extension) {
    case "pdf":
      return (
        <FilePdfOutlined
          {...iconProps}
          style={{ ...iconProps.style, color: "#dc2626" }}
        />
      );
    case "doc":
    case "docx":
      return (
        <FileWordOutlined
          {...iconProps}
          style={{ ...iconProps.style, color: "#2563eb" }}
        />
      );
    case "xls":
    case "xlsx":
      return (
        <FileExcelOutlined
          {...iconProps}
          style={{ ...iconProps.style, color: "#16a34a" }}
        />
      );
    case "ppt":
    case "pptx":
      return (
        <FilePptOutlined
          {...iconProps}
          style={{ ...iconProps.style, color: "#ea580c" }}
        />
      );
    case "jpg":
    case "jpeg":
    case "png":
    case "gif":
    case "bmp":
      return (
        <FileImageOutlined
          {...iconProps}
          style={{ ...iconProps.style, color: "#7c3aed" }}
        />
      );
    case "zip":
    case "rar":
    case "7z":
      return (
        <FileZipOutlined
          {...iconProps}
          style={{ ...iconProps.style, color: "#059669" }}
        />
      );
    default:
      return <FileOutlined {...iconProps} />;
  }
};

// Truncate description to specified length
const truncateDescription = (
  text: string | undefined,
  maxLength: number = 80
): string => {
  if (!text) return "No description available";
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + "...";
};

// Enhanced Document Card Component with fixed layout
const DocumentCard: React.FC<{ document: DocumentDraftResponse }> = ({
  document,
}) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/document/${document.documentId}`);
  };

  const handleView = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    navigate(`/document/${document.documentId}`);
  };

  // const handleBookmark = (e: React.MouseEvent) => {
  //   e.stopPropagation(); // Prevent card click
  //   // Bookmark functionality would be implemented here
  //   console.log("Bookmark document:", document.documentId);
  // };

  return (
    <Card
      hoverable
      onClick={handleCardClick}
      className="h-full transition-all duration-300 border border-blue-100 cursor-pointer hover:border-blue-300 hover:shadow-lg"
      styles={{
        body: {
          padding: "16px",
          display: "flex",
          flexDirection: "column",
          height: "100%",
        },
      }}
    >
      <div className="flex flex-col flex-1">
        {/* File Type Icon and Title */}
        <div className="flex items-start mb-3 space-x-3">
          <div className="flex-shrink-0 mt-1">
            {getFileTypeIcon(document.fileName || document.title)}
          </div>
          <div className="flex-1 min-w-0">
            <Tooltip 
              title={document.title}
              placement="top"
            >
              <Title
                level={5}
                className="mb-2 leading-tight text-gray-800 line-clamp-2 cursor-help"
              >
                {document.title}
              </Title>
            </Tooltip>
            <Text type="secondary" className="block text-sm leading-relaxed">
              {truncateDescription(document.description, 85)}
            </Text>
          </div>
        </div>

        {/* Spacer to push metadata and buttons to bottom */}
        <div className="flex-1"></div>

        {/* Document Metadata - Always at bottom */}
        <div className="mt-auto">
          <div className="pt-3 mb-3 space-y-2 border-t border-gray-100">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center space-x-1 text-gray-500">
                <FolderOutlined style={{ color: "#6b7280" }} />
                <span>Size:</span>
              </div>
              <span className="font-semibold text-blue-700">
                {formatFileSize(document.fileSize || 0)}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center space-x-1 text-gray-500">
                <ClockCircleOutlined style={{ color: "#6b7280" }} />
                <span>Modified:</span>
              </div>
              <span className="text-gray-700">
                {formatDate(document.createdTime)}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center space-x-1 text-gray-500">
                <UserAddOutlined style={{ color: "#6b7280" }} />
                <span>Signed By:</span>
              </div>
              <Tooltip 
                title={document.signedBy || "Not signed"}
                placement="topRight"
              >
                <span
                  className="ml-2 font-semibold text-blue-700 truncate max-w-24 cursor-help"
                  title={document.signedBy || "Not signed"}
                >
                  {document.signedBy || "Not signed"}
                </span>
              </Tooltip>
            </div>

            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center space-x-1 text-gray-500">
                {document.isPublic ? (
                  <UnlockOutlined style={{ color: "#10b981" }} />
                ) : (
                  <LockOutlined style={{ color: "#ef4444" }} />
                )}
                <span>Access:</span>
              </div>
              <span
                className={`font-semibold ${
                  document.isPublic ? "text-green-600" : "text-red-600"
                }`}
              >
                {document.isPublic ? "Public" : "Private"}
              </span>
            </div>

            {/* <div className="flex items-center justify-between text-xs">
              <div className="flex items-center space-x-1 text-gray-500">
                <UserOutlined style={{ color: '#6b7280' }} />
                <span>Editor:</span>
              </div>
              <span className="ml-2 font-semibold text-blue-700 truncate max-w-24" title={document.submittedByName || document.submittedBy || 'Unknown'}>
                {document.submittedByName || document.submittedBy || 'Unknown'}
              </span>
            </div> */}

            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center space-x-1 text-gray-500">
                <FileOutlined style={{ color: "#6b7280" }} />
                <span>Type:</span>
              </div>
              <span className="px-2 py-1 text-xs font-medium text-blue-800 bg-blue-100 rounded-full">
                {document.fileName?.split(".").pop()?.toUpperCase() || "FILE"}
              </span>
            </div>
          </div>

          {/* Action Buttons - Always at bottom */}
          <div className="flex space-x-2">
            <Button
              type="text"
              icon={<EyeOutlined style={{ color: "#1e40af" }} />}
              onClick={handleView}
              className="flex-1 text-blue-800 border border-blue-200 hover:text-blue-600 hover:bg-blue-50 hover:border-blue-300"
              size="small"
            >
              View
            </Button>
            {/* <Button
              type="text"
              icon={<BookOutlined style={{ color: "#059669" }} />}
              onClick={handleBookmark}
              className="flex-1 text-green-700 border border-green-200 hover:text-green-600 hover:bg-green-50 hover:border-green-300"
              size="small"
            >
              Bookmark
            </Button> */}
          </div>
        </div>
      </div>
    </Card>
  );
};

const DocumentLibrary: React.FC = () => {
  const navigate = useNavigate();

  // State
  const [activeTab, setActiveTab] = useState<"public" | "department">("public");
  const [documents, setDocuments] = useState<DocumentDraftResponse[]>([]);
  const [documentTypes, setDocumentTypes] = useState<DocumentTypeResponse[]>(
    []
  );
  const [tags, setTags] = useState<TagResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [filtersLoading, setFiltersLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [total, setTotal] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<any>({});
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authChecked, setAuthChecked] = useState<boolean>(false);

  // Folder navigation state
  // const [folders, setFolders] = useState<FolderNode[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string | undefined>(
    undefined
  );

  // Collapse state for sidebar cards
  // const [folderCollapsed, setFolderCollapsed] = useState(false);
  const [filterCollapsed, setFilterCollapsed] = useState(false);

  // Check authentication
  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");

    if (token && user) {
      try {
        JSON.parse(user);
        setIsAuthenticated(true);
      } catch (error) {
        console.error("Invalid user data:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setIsAuthenticated(false);
      }
    } else {
      setIsAuthenticated(false);
    }

    setAuthChecked(true);
  }, []);

  // Load filter options (document types and tags)
  const loadFilterOptions = useCallback(async () => {
    if (!isAuthenticated) return;

    setFiltersLoading(true);
    try {
      const [typesResponse, tagsResponse] = await Promise.all([
        getDocumentTypesEnhanced(),
        getTagsEnhanced(),
      ]);

      if (typesResponse.success) {
        setDocumentTypes(typesResponse.data.items);
      }

      if (tagsResponse.success) {
        setTags(tagsResponse.data.items);
      }
    } catch (error) {
      console.error("Error loading filter options:", error);
    } finally {
      setFiltersLoading(false);
    }
  }, [isAuthenticated]);

  // Load folders
  const loadFolders = useCallback(async () => {
    if (!isAuthenticated) return;

    setLoading(true);
    try {
      const response = await getFolderTree(undefined, true);
      if (response.success) {
        // setFolders(response.data.rootNodes);
      }
    } catch (error) {
      console.error("Error loading folders:", error);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Load documents
  const loadDocuments = useCallback(async () => {
    if (!isAuthenticated) return;

    setLoading(true);
    try {
      const params: OfficialDocumentsRequest = {
        pageNumber: currentPage,
        pageSize: pageSize,
        ...(searchTerm && { keyword: searchTerm }),
        // Department tab: departmentOnly=true (user's department documents)
        // Public tab: departmentOnly=false (all departments)
        departmentOnly: activeTab === "department",
        ...filters, // Include all filters
      };

      const response = await getOfficialDocuments(params);

      if (response.success) {
        setDocuments(response.data.items);
        setTotal(response.data.total);
      } else {
        console.error("Failed to load documents:", response.message);
      }
    } catch (error) {
      console.error("Error loading documents:", error);
    } finally {
      setLoading(false);
    }
  }, [
    currentPage,
    pageSize,
    searchTerm,
    activeTab,
    selectedFolderId,
    filters,
    isAuthenticated,
  ]);

  // Load filter options and folders when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadFilterOptions();
      loadFolders();
    }
  }, [loadFilterOptions, loadFolders, isAuthenticated]);

  // Load documents when dependencies change
  useEffect(() => {
    if (isAuthenticated) {
      loadDocuments();
    }
  }, [loadDocuments, isAuthenticated]);

  // Handle pagination
  const handlePaginationChange = (page: number, size?: number) => {
    setCurrentPage(page);
    if (size && size !== pageSize) {
      setPageSize(size);
    }
  };

  // Handle tab change
  const handleTabChange = (key: string) => {
    setActiveTab(key as "public" | "department");
    setCurrentPage(1);
  };

  // Handle search
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  // Handle filter changes
  const handleFilterChange = (newFilters: any) => {
    setFilters((prev: any) => ({ ...prev, ...newFilters }));
    setCurrentPage(1);
  };

  // Clear all filters
  const handleClearFilters = () => {
    setFilters({});
    setSearchTerm("");
    setSelectedFolderId(undefined);
    setCurrentPage(1);
  };

  // Handle folder selection
  // const handleFolderSelect = (folder: FolderNode) => {
  //   setSelectedFolderId(folder.id);
  //   setCurrentPage(1);
  // };

  // Handle folder navigation
  // const handleFolderNavigation = (folderId: string | null) => {
  //   setSelectedFolderId(folderId || undefined);
  //   setCurrentPage(1);
  // };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />

      <main className="flex-1 p-6">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-start justify-between">
              <div>
                <Title level={2} className="mb-2">
                  Document Library
                </Title>
                <Text type="secondary" className="text-base">
                  Browse and search through all organizational documents
                </Text>
              </div>
            </div>
          </div>

          {/* Authentication Check */}
          {!authChecked ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <Spin size="large" />
                <p className="mt-4 text-gray-600">Checking authentication...</p>
              </div>
            </div>
          ) : !isAuthenticated ? (
            <div className="flex items-center justify-center py-20">
              <Card className="w-full max-w-md">
                <div className="text-center">
                  <div className="mb-4">
                    <UserOutlined className="text-4xl text-gray-400" />
                  </div>
                  <Title level={4} className="mb-2">
                    Authentication Required
                  </Title>
                  <Text type="secondary" className="block mb-4">
                    Please log in to access the document library.
                  </Text>
                  <Button
                    type="primary"
                    onClick={() => navigate("/login")}
                    size="large"
                  >
                    Go to Login
                  </Button>
                </div>
              </Card>
            </div>
          ) : (
            <Row gutter={[24, 24]}>
              {/* Sidebar with Folder and Filter */}
              <Col xs={24} sm={24} md={8} lg={6} xl={5}>
                <div className="space-y-4">
                  {/* Remove/Comment out Folder Navigation Card */}
      {/* 
      <Card
        title={
          <div className="flex items-center justify-between">
            <span className="text-sm sm:text-base">
              <FolderOutlined style={{ marginRight: 8 }} />
              <span className="hidden sm:inline">
                Folder Navigation
              </span>
              <span className="sm:hidden">Folders</span>
            </span>
            <Button
              type="text"
              size="small"
              icon={
                folderCollapsed ? <DownOutlined /> : <UpOutlined />
              }
              onClick={() => setFolderCollapsed(!folderCollapsed)}
              className="text-blue-800 hover:text-blue-600"
            />
          </div>
        }
        className="border border-blue-100 shadow-sm"
        size="small"
      >
        <Collapse
          ghost
          activeKey={folderCollapsed ? [] : ["folder"]}
          items={[
            {
              key: "folder",
              label: "",
              children: (
                <div>
                  {selectedFolderId && (
                    <div className="mb-4">
                      <FolderBreadcrumb
                        folderId={selectedFolderId}
                        folders={folders}
                        onFolderClick={handleFolderNavigation}
                        className="text-sm"
                      />
                    </div>
                  )}
                  <FolderTree
                    folders={folders}
                    selectedFolderId={selectedFolderId}
                    onFolderSelect={handleFolderSelect}
                    allowSelection={true}
                    showContextMenu={false}
                    className="overflow-auto max-h-96"
                  />
                </div>
              ),
              showArrow: false,
            },
          ]}
        />
      </Card>
      */}

                  {/* Filter Card */}
                  <Card
                    title={
                      <div className="flex items-center justify-between">
                        <span className="text-sm sm:text-base">
                          <FilterOutlined style={{ marginRight: 8 }} />
                          Filters
                        </span>
                        <Button
                          type="text"
                          size="small"
                          icon={
                            filterCollapsed ? <DownOutlined /> : <UpOutlined />
                          }
                          onClick={() => setFilterCollapsed(!filterCollapsed)}
                          className="text-blue-800 hover:text-blue-600"
                        />
                      </div>
                    }
                    className="border border-blue-100 shadow-sm"
                    size="small"
                  >
                    <Collapse
                      ghost
                      activeKey={filterCollapsed ? [] : ["filter"]}
                      items={[
                        {
                          key: "filter",
                          label: "",
                          children: (
                            <DocumentLibraryFilter
                              onFilterChange={handleFilterChange}
                              onClearFilters={handleClearFilters}
                              documentTypes={documentTypes}
                              tags={tags}
                              loading={filtersLoading}
                            />
                          ),
                          showArrow: false,
                        },
                      ]}
                    />
                  </Card>
                </div>
              </Col>

              {/* Main Content */}
              <Col xs={24} sm={24} md={16} lg={18} xl={19}>
                <div className="space-y-6">
                  {/* Search and Controls */}
                  <Card className="border border-blue-100 shadow-sm">
                    <div className="space-y-4">
                      {/* Search Bar */}
                      <div>
                        <Search
                          placeholder="Search documents by title, description, or keywords..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          onSearch={handleSearch}
                          size="large"
                          allowClear
                          className="[&_.ant-input]:border-blue-200 [&_.ant-input]:focus:border-blue-500"
                        />
                      </div>

                      {/* Tabs */}
                      <Tabs
                        activeKey={activeTab}
                        onChange={handleTabChange}
                        className="[&_.ant-tabs-tab]:text-blue-800 [&_.ant-tabs-tab-active]:text-blue-800"
                        items={[
                          {
                            key: "public",
                            label: (
                              <span className="flex items-center space-x-2">
                                <GlobalOutlined
                                  style={{ color: "#1e40af", fontSize: "16px" }}
                                />
                                <span className="font-medium">
                                  Public Documents
                                </span>
                                <Badge
                                  count={activeTab === "public" ? total : 0}
                                  style={{ backgroundColor: "#1e40af" }}
                                />
                              </span>
                            ),
                          },
                          {
                            key: "department",
                            label: (
                              <span className="flex items-center space-x-2">
                                <BankOutlined
                                  style={{ color: "#1e40af", fontSize: "16px" }}
                                />
                                <span className="font-medium">
                                  Department Documents
                                </span>
                                <Badge
                                  count={activeTab === "department" ? total : 0}
                                  style={{ backgroundColor: "#1e40af" }}
                                />
                              </span>
                            ),
                          },
                        ]}
                      />
                    </div>
                  </Card>

                  {/* Documents */}
                  {loading ? (
                    <div className="flex items-center justify-center py-20">
                      <Spin size="large" />
                    </div>
                  ) : documents.length > 0 ? (
                    <>
                      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {documents.map((document) => (
                          <DocumentCard
                            key={document.documentId}
                            document={document}
                          />
                        ))}
                      </div>

                      {/* Pagination */}
                      <div className="flex justify-center mt-8">
                        <Pagination
                          current={currentPage}
                          pageSize={pageSize}
                          total={total}
                          showSizeChanger
                          showQuickJumper
                          showTotal={(total, range) =>
                            `${range[0]}-${range[1]} of ${total} documents`
                          }
                          onChange={handlePaginationChange}
                          pageSizeOptions={["12", "24", "48", "96"]}
                        />
                      </div>
                    </>
                  ) : (
                    <Empty
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                      description="No documents found"
                      className="py-20"
                    />
                  )}
                </div>
              </Col>
            </Row>
          )}
        </div>
      </main>
    </div>
  );
};

export default DocumentLibrary;
