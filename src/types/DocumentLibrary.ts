/**
 * Document Library Types and Interfaces
 * Following the API specification for comprehensive document filtering and management
 * Enhanced with proper TypeScript patterns and project conventions
 */

// Base API Response Interface
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message: string;
  statusCode: number;
}

// Pagination Interface
export interface PaginationData<T> {
  items: T[];
  page: number;
  size: number;
  total: number;
  totalPages: number;
}

// Enhanced API Request Interface
export interface OfficialDocumentsRequest {
  // Pagination
  pageNumber?: number;        // Default: 1
  pageSize?: number;          // Default: 10, Max: 100

  // Content Search Filters
  title?: string;             // Partial match, max 200 chars
  keyword?: string;           // Searches title/summary/version, max 500 chars
  versionName?: string;       // Partial match, max 100 chars

  // Date Filters
  fromDate?: string;          // ISO 8601 format (YYYY-MM-DD)
  toDate?: string;            // ISO 8601 format (YYYY-MM-DD)
  effectiveFrom?: string;     // ISO 8601 format (YYYY-MM-DD)
  effectiveUntil?: string;    // ISO 8601 format (YYYY-MM-DD)
  lastSubmittedFrom?: string; // ISO 8601 format (YYYY-MM-DD)
  lastSubmittedTo?: string;   // ISO 8601 format (YYYY-MM-DD)

  // Document Metadata Filters
  documentTypeId?: string;    // Document type UUID
  tags?: string[];            // Array of tag names
  signedBy?: string;          // Partial match, max 200 chars
  fileType?: string;          // PDF, DOCX, DOC, TXT, RTF
  submittedBy?: string;       // User ID, max 50 chars

  // Access Control Filters
  isPublic?: boolean;         // true for public, false for private
  departmentOnly?: boolean;   // true to show only user's department documents, false for all departments

  // File Property Filters
  minFileSize?: number;       // Bytes, min 0
  maxFileSize?: number;       // Bytes, max 1GB
  minDownloads?: number;      // Min 0
  maxDownloads?: number;      // Max 999999
}

// Enhanced Document Response Interface
export interface DocumentDraftResponse {
  documentId: string;
  versionId: string;
  title: string;
  description?: string;
  summary?: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  status: DocumentStatus;
  versionName: string;
  departmentId: string;
  departmentName?: string;
  ownerId: string;
  ownerName?: string;
  tags: string[];
  createdTime: string;
  updatedAt?: string;
  documentTypeId: string;
  documentTypeName?: string;
  isPublic: boolean;
  signedBy?: string;
  effectiveFrom?: string;
  effectiveUntil?: string;
  lastSubmitted?: string;
  submittedBy?: string;
  submittedByName?: string;
  totalDownloads?: number;
  // Enhanced fields
  createdBy?: UserInfo;
  documentType?: DocumentTypeResponse;
  department?: DepartmentInfo;
  lifecycle?: DocumentLifecycle;
}

// User Information Interface
export interface UserInfo {
  id: string;
  fullName: string;
  email?: string;
  avatar?: string;
}

// Department Information Interface
export interface DepartmentInfo {
  id: string;
  name: string;
  description?: string;
}

// Document Lifecycle Interface
export interface DocumentLifecycle {
  status: 'upcoming' | 'active' | 'expiring' | 'expired' | 'unknown';
  daysUntilExpiry?: number;
  isExpiring: boolean;
  isExpired: boolean;
}

// Document Status Enum
export type DocumentStatus =
  | 'Draft'
  | 'Under Review'
  | 'Approved'
  | 'Published'
  | 'Archived'
  | 'Rejected'
  | 'Expired'
  | 'Active'
  | 'Inactive';

// Enhanced Response Interfaces using generic base
export interface DocumentLibraryResponse extends ApiResponse<PaginationData<DocumentDraftResponse>> {}

export interface DocumentTypeResponse {
  id: string;
  name: string;
  description?: string;
  documentCount: number;
  createdTime: string;
}

export interface DocumentTypesResponse extends ApiResponse<PaginationData<DocumentTypeResponse>> {}

export interface TagResponse {
  id: string;
  name: string;
  createdTime: string;
  color?: string;
  description?: string;
  documentCount?: number;
}

export interface TagsResponse extends ApiResponse<PaginationData<TagResponse>> {}

// Enhanced Filter interfaces for the DocumentLibrary components
export interface DocumentLibraryFilters {
  // Content Search
  title: string;
  keyword: string;
  versionName: string;

  // Date Filters
  fromDate: string;
  toDate: string;
  effectiveFrom: string;
  effectiveUntil: string;
  lastSubmittedFrom: string;
  lastSubmittedTo: string;

  // Metadata Filters
  documentTypeId: string;
  selectedTags: string[];
  signedBy: string;
  fileType: string;
  submittedBy: string;

  // Access Control
  isPublic?: boolean;

  // File Properties
  minFileSize: number;
  maxFileSize: number;
  minDownloads: number;
  maxDownloads: number;

  // Enhanced filters
  status?: DocumentStatus[];
  departmentId?: string;
  lifecycleStatus?: DocumentLifecycle['status'][];
}

// Filter state management
export interface FilterState {
  filters: DocumentLibraryFilters;
  isActive: boolean;
  activeCount: number;
}

// View mode options
export type ViewMode = 'grid' | 'list' | 'table';

// Sort options
export interface SortOption {
  field: 'title' | 'createdTime' | 'fileSize' | 'status' | 'documentType' | 'updatedAt';
  order: 'asc' | 'desc';
  label: string;
}

// Default filter values
export const defaultFilters: DocumentLibraryFilters = {
  title: '',
  keyword: '',
  versionName: '',
  fromDate: '',
  toDate: '',
  effectiveFrom: '',
  effectiveUntil: '',
  lastSubmittedFrom: '',
  lastSubmittedTo: '',
  documentTypeId: '',
  selectedTags: [],
  signedBy: '',
  fileType: '',
  submittedBy: '',
  isPublic: undefined,
  minFileSize: 0,
  maxFileSize: 0,
  minDownloads: 0,
  maxDownloads: 0,
};

// Enhanced File type options
export const FILE_TYPE_OPTIONS = [
  { value: '', label: 'All Types' },
  { value: 'PDF', label: 'PDF Documents' },
  { value: 'DOCX', label: 'Word Documents (DOCX)' },
  { value: 'DOC', label: 'Word Documents (DOC)' },
  { value: 'TXT', label: 'Text Files' },
  { value: 'RTF', label: 'Rich Text Format' },
  { value: 'XLS', label: 'Excel Spreadsheets (XLS)' },
  { value: 'XLSX', label: 'Excel Spreadsheets (XLSX)' },
  { value: 'PPT', label: 'PowerPoint (PPT)' },
  { value: 'PPTX', label: 'PowerPoint (PPTX)' },
];

// Sort options
export const SORT_OPTIONS: SortOption[] = [
  { field: 'title', order: 'asc', label: 'Title A-Z' },
  { field: 'title', order: 'desc', label: 'Title Z-A' },
  { field: 'createdTime', order: 'desc', label: 'Newest First' },
  { field: 'createdTime', order: 'asc', label: 'Oldest First' },
  { field: 'updatedAt', order: 'desc', label: 'Recently Updated' },
  { field: 'fileSize', order: 'desc', label: 'Largest First' },
  { field: 'fileSize', order: 'asc', label: 'Smallest First' },
  { field: 'status', order: 'asc', label: 'Status A-Z' },
  { field: 'documentType', order: 'asc', label: 'Type A-Z' },
];

// View mode options
export const VIEW_MODE_OPTIONS = [
  { value: 'grid' as ViewMode, label: 'Grid View', icon: 'AppstoreOutlined' },
  { value: 'list' as ViewMode, label: 'List View', icon: 'UnorderedListOutlined' },
  { value: 'table' as ViewMode, label: 'Table View', icon: 'TableOutlined' },
];

// Lifecycle management interfaces
export interface LifecycleTimeRange {
  label: string;
  days: number;
}

export const LIFECYCLE_TIME_RANGES: LifecycleTimeRange[] = [
  { label: '7 days', days: 7 },
  { label: '30 days', days: 30 },
  { label: '90 days', days: 90 },
];

// Helper functions for date-based filtering
export const getUpcomingEffectiveDocuments = (daysAhead: number = 30): Partial<OfficialDocumentsRequest> => {
  const today = new Date().toISOString().split('T')[0];
  const futureDate = new Date(Date.now() + daysAhead * 24 * 60 * 60 * 1000)
    .toISOString().split('T')[0];

  return {
    effectiveFrom: today,
    effectiveUntil: futureDate,
    pageSize: 50 // Larger page size for lifecycle management
  };
};

export const getUpcomingExpirationDocuments = (_daysAhead: number = 30): Partial<OfficialDocumentsRequest> => {
  // Since we can't directly filter for "expiring in X days" via API,
  // we'll need to fetch documents and filter client-side
  return {
    pageSize: 100, // Larger page size to reduce API calls
    // Client-side filtering will be applied after API response
  };
};

// Helper function to check if a document is expiring within the specified days
export const isDocumentExpiringWithinDays = (effectiveUntil: string | undefined, days: number): boolean => {
  if (!effectiveUntil) return false;
  
  const expirationDate = new Date(effectiveUntil);
  const today = new Date();
  const futureDate = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
  
  return expirationDate >= today && expirationDate <= futureDate;
};

// Component Props Interfaces
export interface DocumentCardProps {
  document: DocumentDraftResponse;
  viewMode?: ViewMode;
  onView?: (document: DocumentDraftResponse) => void;
  onDownload?: (document: DocumentDraftResponse) => void;
  onEdit?: (document: DocumentDraftResponse) => void;
  onDelete?: (document: DocumentDraftResponse) => void;
  showActions?: boolean;
  className?: string;
}

export interface DocumentLibraryFilterProps {
  filters: DocumentLibraryFilters;
  onFiltersChange: (filters: DocumentLibraryFilters) => void;
  documentTypes: DocumentTypeResponse[];
  tags: TagResponse[];
  loading?: boolean;
  onReset?: () => void;
  className?: string;
}

export interface DocumentLibraryHeaderProps {
  title?: string;
  description?: string;
  total: number;
  loading?: boolean;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  sortOption: SortOption;
  onSortChange: (option: SortOption) => void;
  onRefresh?: () => void;
  className?: string;
}

// State management interfaces
export interface DocumentLibraryState {
  // Data
  documents: DocumentDraftResponse[];
  documentTypes: DocumentTypeResponse[];
  tags: TagResponse[];

  // UI State
  loading: boolean;
  filtersLoading: boolean;
  error: string | null;

  // Filters and Search
  filters: DocumentLibraryFilters;
  searchTerm: string;
  activeTab: 'public' | 'department' | 'all';

  // View Options
  viewMode: ViewMode;
  sortOption: SortOption;

  // Pagination
  currentPage: number;
  pageSize: number;
  total: number;

  // Selection (for bulk operations)
  selectedDocuments: string[];
  selectAll: boolean;
}

// Action interfaces for state management
export interface DocumentLibraryActions {
  // Data loading
  loadDocuments: () => Promise<void>;
  loadFilterOptions: () => Promise<void>;
  refreshData: () => Promise<void>;

  // Filters and Search
  updateFilters: (filters: Partial<DocumentLibraryFilters>) => void;
  resetFilters: () => void;
  setSearchTerm: (term: string) => void;
  setActiveTab: (tab: 'public' | 'department' | 'all') => void;

  // View Options
  setViewMode: (mode: ViewMode) => void;
  setSortOption: (option: SortOption) => void;

  // Pagination
  setCurrentPage: (page: number) => void;
  setPageSize: (size: number) => void;

  // Selection
  toggleDocumentSelection: (documentId: string) => void;
  toggleSelectAll: () => void;
  clearSelection: () => void;

  // Document Actions
  viewDocument: (document: DocumentDraftResponse) => void;
  downloadDocument: (document: DocumentDraftResponse) => Promise<void>;
  editDocument: (document: DocumentDraftResponse) => void;
  deleteDocument: (document: DocumentDraftResponse) => Promise<void>;
}

// Hook return type
export interface UseDocumentLibraryReturn extends DocumentLibraryState, DocumentLibraryActions {
  // Computed values
  filteredDocuments: DocumentDraftResponse[];
  hasActiveFilters: boolean;
  isLoading: boolean;
  isEmpty: boolean;

  // Utility functions
  getDocumentUrl: (documentId: string) => string;
  getDownloadUrl: (documentId: string, versionId?: string) => string;
}

// Helper function to format date
export const formatDate = (dateString: string): string => {
  if (!dateString) return '-';
  
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch {
    return dateString;
  }
};
