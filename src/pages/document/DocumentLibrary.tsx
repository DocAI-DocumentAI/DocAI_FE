import React, { useState, useEffect, useCallback } from 'react';
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
  Col
} from 'antd';
import {
  UserOutlined,
  FilterOutlined,
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
  BookOutlined,
  RobotOutlined,
  SearchOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../../components/layout/Navbar';
import { DocumentLibraryFilter } from '../../components/DocumentLibraryFilter';
import { getOfficialDocuments, getDocumentTypesEnhanced, getTagsEnhanced } from '../../lib/api/document';
import type {
  DocumentDraftResponse,
  DocumentTypeResponse,
  TagResponse,
  OfficialDocumentsRequest
} from '../../types/DocumentLibrary';

const { Title, Text } = Typography;
const { Search } = Input;



// Helper functions
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const formatDate = (dateString: string | undefined): string => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString();
};

// Get file type icon based on file extension
const getFileTypeIcon = (fileName: string) => {
  const extension = fileName?.split('.').pop()?.toLowerCase();
  const iconProps = { style: { fontSize: '20px', color: '#1e40af' } };

  switch (extension) {
    case 'pdf':
      return <FilePdfOutlined {...iconProps} style={{ ...iconProps.style, color: '#dc2626' }} />;
    case 'doc':
    case 'docx':
      return <FileWordOutlined {...iconProps} style={{ ...iconProps.style, color: '#2563eb' }} />;
    case 'xls':
    case 'xlsx':
      return <FileExcelOutlined {...iconProps} style={{ ...iconProps.style, color: '#16a34a' }} />;
    case 'ppt':
    case 'pptx':
      return <FilePptOutlined {...iconProps} style={{ ...iconProps.style, color: '#ea580c' }} />;
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
    case 'bmp':
      return <FileImageOutlined {...iconProps} style={{ ...iconProps.style, color: '#7c3aed' }} />;
    case 'zip':
    case 'rar':
    case '7z':
      return <FileZipOutlined {...iconProps} style={{ ...iconProps.style, color: '#059669' }} />;
    default:
      return <FileOutlined {...iconProps} />;
  }
};

// Truncate description to specified length
const truncateDescription = (text: string | undefined, maxLength: number = 80): string => {
  if (!text) return 'No description available';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
};

// Enhanced Document Card Component with fixed layout
const DocumentCard: React.FC<{ document: DocumentDraftResponse }> = ({ document }) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/document/${document.documentId}`);
  };

  const handleView = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    navigate(`/document/${document.documentId}`);
  };

  const handleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    // Bookmark functionality would be implemented here
    console.log('Bookmark document:', document.documentId);
  };

  return (
    <Card
      hoverable
      onClick={handleCardClick}
      className="h-full border border-blue-100 hover:border-blue-300 hover:shadow-lg transition-all duration-300 cursor-pointer"
      styles={{ body: { padding: '16px', display: 'flex', flexDirection: 'column', height: '100%' } }}
    >
      <div className="flex-1 flex flex-col">
        {/* File Type Icon and Title */}
        <div className="flex items-start space-x-3 mb-3">
          <div className="flex-shrink-0 mt-1">
            {getFileTypeIcon(document.fileName || document.title)}
          </div>
          <div className="flex-1 min-w-0">
            <Title level={5} className="mb-2 line-clamp-2 text-gray-800 leading-tight">
              {document.title}
            </Title>
            <Text type="secondary" className="text-sm block leading-relaxed">
              {truncateDescription(document.description, 85)}
            </Text>
          </div>
        </div>

        {/* Spacer to push metadata and buttons to bottom */}
        <div className="flex-1"></div>

        {/* Document Metadata - Always at bottom */}
        <div className="mt-auto">
          <div className="space-y-2 pt-3 border-t border-gray-100 mb-3">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center space-x-1 text-gray-500">
                <FolderOutlined style={{ color: '#6b7280' }} />
                <span>Size:</span>
              </div>
              <span className="text-blue-700 font-semibold">{formatFileSize(document.fileSize || 0)}</span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center space-x-1 text-gray-500">
                <ClockCircleOutlined style={{ color: '#6b7280' }} />
                <span>Modified:</span>
              </div>
              <span className="text-gray-700">{formatDate(document.createdTime)}</span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center space-x-1 text-gray-500">
                <UserAddOutlined style={{ color: '#6b7280' }} />
                <span>Author:</span>
              </div>
              <span className="truncate ml-2 text-blue-700 font-semibold max-w-24" title={document.createdBy?.fullName || document.ownerName || 'Unknown'}>
                {document.createdBy?.fullName || document.ownerName || 'Unknown'}
              </span>
            </div>

            {/* <div className="flex items-center justify-between text-xs">
              <div className="flex items-center space-x-1 text-gray-500">
                <UserOutlined style={{ color: '#6b7280' }} />
                <span>Editor:</span>
              </div>
              <span className="truncate ml-2 text-blue-700 font-semibold max-w-24" title={document.submittedByName || document.submittedBy || 'Unknown'}>
                {document.submittedByName || document.submittedBy || 'Unknown'}
              </span>
            </div> */}

            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center space-x-1 text-gray-500">
                <FileOutlined style={{ color: '#6b7280' }} />
                <span>Type:</span>
              </div>
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                {document.fileName?.split('.').pop()?.toUpperCase() || 'FILE'}
              </span>
            </div>
          </div>

          {/* Action Buttons - Always at bottom */}
          <div className="flex space-x-2">
            <Button
              type="text"
              icon={<EyeOutlined style={{ color: '#1e40af' }} />}
              onClick={handleView}
              className="flex-1 text-blue-800 hover:text-blue-600 hover:bg-blue-50 border border-blue-200 hover:border-blue-300"
              size="small"
            >
              View
            </Button>
            <Button
              type="text"
              icon={<BookOutlined style={{ color: '#059669' }} />}
              onClick={handleBookmark}
              className="flex-1 text-green-700 hover:text-green-600 hover:bg-green-50 border border-green-200 hover:border-green-300"
              size="small"
            >
              Bookmark
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

const DocumentLibrary: React.FC = () => {
  const navigate = useNavigate();

  // State
  const [activeTab, setActiveTab] = useState<'public' | 'department'>('public');
  const [documents, setDocuments] = useState<DocumentDraftResponse[]>([]);
  const [documentTypes, setDocumentTypes] = useState<DocumentTypeResponse[]>([]);
  const [tags, setTags] = useState<TagResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [filtersLoading, setFiltersLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [total, setTotal] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<any>({});
  const [showFilters, setShowFilters] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authChecked, setAuthChecked] = useState<boolean>(false);

  // Check authentication
  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');

    if (token && user) {
      try {
        JSON.parse(user);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Invalid user data:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
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
        getTagsEnhanced()
      ]);

      if (typesResponse.success) {
        setDocumentTypes(typesResponse.data.items);
      }

      if (tagsResponse.success) {
        setTags(tagsResponse.data.items);
      }
    } catch (error) {
      console.error('Error loading filter options:', error);
    } finally {
      setFiltersLoading(false);
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
        ...(activeTab === 'public' && { isPublic: true }),
        ...filters // Include all filters
      };

      const response = await getOfficialDocuments(params);

      if (response.success) {
        setDocuments(response.data.items);
        setTotal(response.data.total);
      } else {
        console.error('Failed to load documents:', response.message);
      }
    } catch (error) {
      console.error('Error loading documents:', error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, searchTerm, activeTab, filters, isAuthenticated]);

  // Load filter options when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadFilterOptions();
    }
  }, [loadFilterOptions, isAuthenticated]);

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
    setActiveTab(key as 'public' | 'department');
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
    setSearchTerm('');
    setCurrentPage(1);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />

      <main className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex justify-between items-start">
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
            <div className="flex justify-center items-center py-20">
              <div className="text-center">
                <Spin size="large" />
                <p className="text-gray-600 mt-4">Checking authentication...</p>
              </div>
            </div>
          ) : !isAuthenticated ? (
            <div className="flex justify-center items-center py-20">
              <Card className="w-full max-w-md">
                <div className="text-center">
                  <div className="mb-4">
                    <UserOutlined className="text-4xl text-gray-400" />
                  </div>
                  <Title level={4} className="mb-2">Authentication Required</Title>
                  <Text type="secondary" className="block mb-4">
                    Please log in to access the document library.
                  </Text>
                  <Button
                    type="primary"
                    onClick={() => navigate('/login')}
                    size="large"
                  >
                    Go to Login
                  </Button>
                </div>
              </Card>
            </div>
          ) : (
            <Row gutter={24}>
              {/* Filter Sidebar */}
              {showFilters && (
                <Col xs={24} lg={6}>
                  <DocumentLibraryFilter
                    onFilterChange={handleFilterChange}
                    onClearFilters={handleClearFilters}
                    documentTypes={documentTypes}
                    tags={tags}
                    loading={filtersLoading}
                  />
                </Col>
              )}

              {/* Main Content */}
              <Col xs={24} lg={showFilters ? 18 : 24}>
                <div className="space-y-6">
                  {/* AI Search Promotion */}
                  <Card className="shadow-sm border border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="p-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full">
                          <RobotOutlined style={{ fontSize: '24px', color: 'white' }} />
                        </div>
                        <div>
                          <Title level={4} className="mb-1 text-gray-800">
                            Try AI-Powered Document Search
                          </Title>
                          <Text type="secondary" className="text-sm">
                            Use natural language to find documents with advanced AI semantic search
                          </Text>
                        </div>
                      </div>
                      <Button
                        type="primary"
                        size="large"
                        icon={<SearchOutlined />}
                        onClick={() => navigate('/search')}
                        className="bg-gradient-to-r from-purple-600 to-blue-600 border-0 shadow-lg hover:from-purple-700 hover:to-blue-700"
                      >
                        Start AI Search
                      </Button>
                    </div>
                  </Card>

                  {/* Search and Controls */}
                  <Card className="shadow-sm border border-blue-100">
                    <div className="space-y-4">
                      {/* Search Bar with Filter Button */}
                      <div className="flex items-center space-x-3">
                        <div className="flex-1">
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
                        <Button
                          icon={<FilterOutlined />}
                          onClick={() => setShowFilters(!showFilters)}
                          type={showFilters ? 'primary' : 'default'}
                          size="large"
                          className={showFilters ? 'bg-blue-800 border-blue-800 shadow-md' : 'border-blue-800 text-blue-800 hover:bg-blue-50 hover:border-blue-600'}
                        >
                          Filters
                        </Button>
                      </div>

                      {/* Tabs */}
                      <Tabs
                        activeKey={activeTab}
                        onChange={handleTabChange}
                        className="[&_.ant-tabs-tab]:text-blue-800 [&_.ant-tabs-tab-active]:text-blue-800"
                        items={[
                          {
                            key: 'public',
                            label: (
                              <span className="flex items-center space-x-2">
                                <GlobalOutlined style={{ color: '#1e40af', fontSize: '16px' }} />
                                <span className="font-medium">Public Documents</span>
                                <Badge
                                  count={activeTab === 'public' ? total : 0}
                                  style={{ backgroundColor: '#1e40af' }}
                                />
                              </span>
                            )
                          },
                          {
                            key: 'department',
                            label: (
                              <span className="flex items-center space-x-2">
                                <BankOutlined style={{ color: '#1e40af', fontSize: '16px' }} />
                                <span className="font-medium">Department Documents</span>
                                <Badge
                                  count={activeTab === 'department' ? total : 0}
                                  style={{ backgroundColor: '#1e40af' }}
                                />
                              </span>
                            )
                          }
                        ]}
                      />
                    </div>
                  </Card>

              {/* Documents */}
              {loading ? (
                <div className="flex justify-center items-center py-20">
                  <Spin size="large" />
                </div>
              ) : documents.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {documents.map(document => (
                      <DocumentCard key={document.documentId} document={document} />
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
                      pageSizeOptions={['12', '24', '48', '96']}
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
