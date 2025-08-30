// Folder Management Types and Interfaces

export type FolderPermissionLevel = "read" | "write" | "admin";
export type FolderType = "system" | "user";

export interface FolderNode {
  id: string;
  name: string;
  description?: string;
  path: string;
  parentFolderId?: string;
  isPublic: boolean;
  folderType: FolderType;
  departmentId?: string;
  ownerId?: string;
  googleDriveFolderId?: string;
  documentCount?: number;
  userPermission: FolderPermissionLevel;
  canExpand: boolean;
  canCreateSubfolders: boolean;
  canUploadFiles: boolean;
  isExpanded?: boolean;
  children: FolderNode[];
  createdAt: string;
  updatedAt: string;
}

export interface FolderTreeData {
  rootNodes: FolderNode[];
  departmentId: string | null;
  totalFolders: number;
  totalDocuments: number;
}

export interface FolderTreeResponse {
  success: boolean;
  message: string;
  data: FolderTreeData;
}

export interface FolderPermission {
  id: string;
  folderId: string;
  userId?: string;
  userEmail?: string;
  userFullName?: string;
  departmentId?: string;
  departmentName?: string;
  permissionType: number; // Backend uses numeric: 1=View, 2=Edit, 3=Delete, 4=Manage
  permissionDescription: string; // Backend provides human-readable description
  permission: FolderPermissionLevel; // Frontend convenience field (mapped from permissionType)
  isInherited: boolean;
  isDenied: boolean;
  expiresAt?: string | null;
  isActive: boolean;
  isValid: boolean;
  permissionSource: string; // "Direct", "Inherited", "Department", etc.
  createdTime: string;
  createdBy: string;
  // Legacy fields for backward compatibility
  grantedBy?: string;
  grantedAt?: string;
  updatedBy?: string;
  updatedAt?: string;
}

export interface FolderPermissionsData {
  folderId: string;
  folderName: string;
  userPermissions: FolderPermission[];
  departmentPermissions: FolderPermission[];
}

export interface FolderPermissionsResponse {
  success: boolean;
  message: string;
  data: FolderPermission[]; // New API returns flat array, not separated by user/department
}

// New API request/response types
export interface SetFolderPermissionRequest {
  userId?: string;
  departmentId?: string;
  permissionType: APIPermissionType;
  expiresAt?: string | null;
  applyToSubfolders?: boolean;
}

export interface CheckUserPermissionRequest {
  requiredPermission: APIPermissionType;
}

export interface CheckUserPermissionResponse {
  success: boolean;
  message: string;
  data: {
    folderId: string;
    userId: string;
    requiredPermission: APIPermissionType;
    hasPermission: boolean;
  };
}

export interface FolderStatistics {
  totalFolders: number;
  systemFolders: number;
  userFolders: number;
  publicFolders: number;
  totalDocuments: number;
  maxDepth: number;
  emptyFolders: number;
}

export interface FolderStatisticsResponse {
  success: boolean;
  message: string;
  data: FolderStatistics;
}

// Request interfaces
// API-level permission types as defined by backend spec
export type APIPermissionType = "View" | "Edit" | "Delete" | "Manage";

export interface InitialPermission {
  userId?: string;
  departmentId?: string;
  permissionType: APIPermissionType;
  expiresAt?: string | null;
}

export interface CreateFolderRequest {
  name: string;
  description?: string;
  parentFolderId?: string;
  departmentId?: string | null;
  isPublic?: boolean;
  initialPermissions?: InitialPermission[];
}

export interface UpdateFolderRequest {
  name: string;
  description?: string;
}

export interface MoveFolderRequest {
  newParentFolderId?: string;
  preservePermissions?: boolean;
}

export interface GrantUserPermissionRequest {
  userId: string;
  permission: FolderPermissionLevel;
}

export interface GrantDepartmentPermissionRequest {
  departmentId: string;
  permission: FolderPermissionLevel;
}

export interface UpdatePermissionRequest {
  permission: FolderPermissionLevel;
}

// Tree component props and state interfaces
export interface FolderTreeProps {
  folders: FolderNode[];
  selectedFolderId?: string;
  onFolderSelect?: (folder: FolderNode) => void;
  onFolderExpand?: (folderId: string) => void;
  onFolderCollapse?: (folderId: string) => void;
  onCreateFolder?: (parentFolderId?: string) => void;
  onEditFolder?: (folder: FolderNode) => void;
  onDeleteFolder?: (folder: FolderNode) => void;
  onMoveFolder?: (folder: FolderNode, newParentId?: string) => void;
  showContextMenu?: boolean;
  allowDragDrop?: boolean;
  allowSelection?: boolean;
  maxDepth?: number;
  className?: string;
  loading?: boolean;
}

export interface FolderTreeItemProps {
  folder: FolderNode;
  level: number;
  isSelected: boolean;
  onSelect: (folder: FolderNode) => void;
  onExpand: (folderId: string) => void;
  onCollapse: (folderId: string) => void;
  onCreateFolder?: (parentFolderId: string) => void;
  onEditFolder?: (folder: FolderNode) => void;
  onDeleteFolder?: (folder: FolderNode) => void;
  onMoveFolder?: (folder: FolderNode, newParentId?: string) => void;
  showContextMenu: boolean;
  allowDragDrop: boolean;
  maxDepth?: number;
}

export interface FolderContextMenuProps {
  folder: FolderNode;
  visible: boolean;
  position: { x: number; y: number };
  onClose: () => void;
  onCreateFolder?: (parentFolderId: string) => void;
  onEditFolder?: (folder: FolderNode) => void;
  onDeleteFolder?: (folder: FolderNode) => void;
  onManagePermissions?: (folder: FolderNode) => void;
  onMoveFolder?: (folder: FolderNode) => void;
}

// Folder selector component interfaces
export interface FolderSelectorProps {
  selectedFolderId?: string;
  onFolderSelect: (folderId: string | undefined) => void;
  placeholder?: string;
  allowClear?: boolean;
  disabled?: boolean;
  showPath?: boolean;
  filterPermission?: FolderPermissionLevel;
  excludeFolderIds?: string[];
  className?: string;
}

export interface FolderBreadcrumbProps {
  folderId?: string;
  folders: FolderNode[];
  onFolderClick?: (folderId: string | null) => void;
  separator?: string;
  maxItems?: number;
  className?: string;
}

// Folder management page interfaces
export interface FolderManagementState {
  folders: FolderNode[];
  selectedFolder?: FolderNode;
  expandedFolders: Set<string>;
  loading: boolean;
  error?: string;
  searchTerm: string;
  showCreateModal: boolean;
  showEditModal: boolean;
  showPermissionsModal: boolean;
  showDeleteConfirm: boolean;
}

export interface FolderFormData {
  name: string;
  description: string;
  parentFolderId?: string;
  isPublic: boolean;
}

// Drag and drop interfaces
export interface DragDropData {
  type: "folder";
  folderId: string;
  folderName: string;
}

export interface DropTargetData {
  type: "folder";
  targetFolderId?: string;
  canDrop: boolean;
}

// Search and filter interfaces
export interface FolderSearchFilters {
  searchTerm?: string;
  folderType?: FolderType;
  permission?: FolderPermissionLevel;
  departmentId?: string;
  isPublic?: boolean;
  hasDocuments?: boolean;
}

export interface FolderSearchResult {
  folder: FolderNode;
  matchType: "name" | "description" | "path";
  highlightedText?: string;
}

// Utility type for folder operations
export type FolderOperation = 
  | { type: "create"; parentFolderId?: string }
  | { type: "edit"; folder: FolderNode }
  | { type: "delete"; folder: FolderNode }
  | { type: "move"; folder: FolderNode; newParentId?: string }
  | { type: "permissions"; folder: FolderNode };

// Error handling
export interface FolderError {
  code: string;
  message: string;
  field?: string;
  details?: any;
}

export interface FolderApiError {
  success: false;
  message: string;
  errors?: FolderError[];
}

// Document detail interfaces for folder context
export interface DocumentDetailFileInfo {
  fileName: string;
  filePath: string;
  fileSize: number;
  fileType: string;
  fileHash: string;
}

export interface DocumentDetailDocumentType {
  id: string;
  name: string;
  description: string;
}

export interface DocumentDetailDates {
  createdTime: string;
  lastUpdatedTime: string;
  effectiveFrom: string;
  effectiveUntil: string;
  approvedAt: string | null;
  submittedAt: string;
}

export interface DocumentDetailOwnership {
  ownerId: string;
  ownerName: string | null;
  ownerEmail: string | null;
  departmentId: string;
  departmentName: string | null;
  signedBy: string;
}

export interface DocumentDetailFolderContext {
  currentFolder: {
    id: string;
    name: string;
    description: string | null;
    fullPath: string;
    level: number;
    isSystemFolder: boolean;
    isPublic: boolean;
    folderType: string | null;
    subFolderCount: number;
    documentCount: number;
    userPermission: string | null;
    canCreateSubfolders: boolean;
    canUploadDocuments: boolean;
    createdTime: string;
    lastUpdatedTime: string | null;
    departmentId: string;
    createdBy: string;
  };
  targetFolder: {
    id: string;
    name: string;
    description: string | null;
    fullPath: string;
    level: number;
    isSystemFolder: boolean;
    isPublic: boolean;
    folderType: string | null;
    subFolderCount: number;
    documentCount: number;
    userPermission: string | null;
    canCreateSubfolders: boolean;
    canUploadDocuments: boolean;
    createdTime: string;
    lastUpdatedTime: string | null;
    departmentId: string;
    createdBy: string;
  };
  breadcrumb: Array<{
    id: string;
    name: string;
    level: number;
    isSystemFolder: boolean;
    isCurrent: boolean;
  }>;
  canMoveDocument: boolean;
}

export interface DocumentDetailPermissions {
  canView: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canMove: boolean;
  canDownload: boolean;
  canShare: boolean;
  canApprove: boolean;
  canReject: boolean;
}

export interface DocumentDetailApprovalInfo {
  reviewerId: string;
  reviewerName: string | null;
  reviewComments: string | null;
  reviewedAt: string;
  reviewAction: string;
  approvalHistory: Array<{
    action: string;
    comments: string | null;
    reviewerId: string;
    reviewerName: string | null;
    reviewedAt: string;
  }>;
}

export interface DocumentDetailGoogleDrive {
  googleDriveFileId: string | null;
  googleDriveFolderId: string;
  webViewLink: string | null;
  downloadLink: string | null;
}

export interface DocumentDetail {
  documentId: string;
  versionId: string;
  title: string;
  description: string;
  summary: string;
  versionName: string;
  status: string;
  isPublic: boolean;
  isOfficial: boolean;
  fileInfo: DocumentDetailFileInfo;
  documentType: DocumentDetailDocumentType;
  tags: string[];
  dates: DocumentDetailDates;
  ownership: DocumentDetailOwnership;
  folderContext: DocumentDetailFolderContext;
  permissions: DocumentDetailPermissions;
  approvalInfo: DocumentDetailApprovalInfo;
  googleDrive: DocumentDetailGoogleDrive;
}

export interface DocumentDetailResponse {
  statusCode: number;
  errorCode: string | null;
  message: string;
  data: DocumentDetail;
}
