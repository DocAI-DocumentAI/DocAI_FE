import { api } from "./api";
import type {
  FolderNode,
  FolderTreeResponse,
  FolderPermission,
  FolderPermissionsResponse,

  CreateFolderRequest,
  FolderStatistics,
  UpdateFolderRequest,
  MoveFolderRequest,
  GrantUserPermissionRequest,
  GrantDepartmentPermissionRequest,
  UpdatePermissionRequest,
  FolderPermissionLevel,
  SetFolderPermissionRequest,
  CheckUserPermissionRequest,
  CheckUserPermissionResponse,
  APIPermissionType
} from "../../types/folder";

// Helper mappers to adapt backend API (FOLDER_API_REFERENCE.md) to FE types
const mapPermissionsToLevel = (permissions?: {
  canView?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  canManage?: boolean;
}): FolderPermissionLevel => {
  if (!permissions) return "read";
  if (permissions.canManage) return "admin";
  if (permissions.canEdit) return "write";
  return "read";
};

const mapPermissionString = (p?: string): FolderPermissionLevel => {
  if (!p) return "read";
  const val = String(p).toLowerCase();
  if (val === 'manage' || val === 'admin') return 'admin';
  if (val === 'edit' || val === 'write') return 'write';
  if (val === 'delete') return 'admin';
  return 'read';
};

const mapApiFolderToFolderNode = (apiFolder: any): FolderNode => {
  const permissions = apiFolder.permissions || {};
  const children = (apiFolder.subFolders || apiFolder.children || []).map((f: any) => mapApiFolderToFolderNode(f));

  const userPermission: FolderPermissionLevel = apiFolder.userPermission
    ? mapPermissionString(apiFolder.userPermission)
    : mapPermissionsToLevel(permissions);

  const canCreateSubfolders = typeof apiFolder.canCreateSubfolders === 'boolean'
    ? apiFolder.canCreateSubfolders
    : Boolean(permissions.canEdit || permissions.canManage);

  const canUploadFiles = typeof apiFolder.canUploadDocuments === 'boolean'
    ? apiFolder.canUploadDocuments
    : Boolean(permissions.canEdit || permissions.canManage);

  return {
    id: apiFolder.id,
    name: apiFolder.name,
    description: apiFolder.description,
    path: apiFolder.fullPath || apiFolder.path || apiFolder.name || "",
    parentFolderId: apiFolder.parentFolderId ?? undefined,
    isPublic: Boolean(apiFolder.isPublic),
    folderType: apiFolder.isSystemFolder ? "system" : "user",
    departmentId: apiFolder.departmentId ?? undefined,
    ownerId: apiFolder.ownerId ?? undefined,
    googleDriveFolderId: apiFolder.googleDriveFolderId ?? undefined,
    documentCount: apiFolder.documentCount ?? 0,
    userPermission,
    canExpand: (apiFolder.subFolderCount ?? 0) > 0 || children.length > 0,
    canCreateSubfolders,
    canUploadFiles,
    isExpanded: apiFolder.isExpanded ?? false,
    children,
    createdAt: apiFolder.createdTime || apiFolder.createdAt || "",
    updatedAt: apiFolder.lastUpdatedTime || apiFolder.updatedTime || apiFolder.updatedAt || "",
  };
};

// Map FE levels to API permission type strings (View/Edit/Delete/Manage)
const toApiPermissionType = (level: string): APIPermissionType => {
  const val = String(level).toLowerCase();
  if (val === 'admin' || val === 'manage') return 'Manage';
  if (val === 'write' || val === 'edit') return 'Edit';
  if (val === 'delete') return 'Delete';
  return 'View';
};

// Map numeric permission type to FE level
const mapNumericPermissionToLevel = (permissionType: number): FolderPermissionLevel => {
  switch (permissionType) {
    case 4: return 'admin'; // Manage
    case 3: return 'admin'; // Delete (treat as admin)
    case 2: return 'write'; // Edit
    case 1: return 'read';  // View
    default: return 'read';
  }
};

// Map API permission response to FE FolderPermission
const mapApiPermissionToFolderPermission = (apiPerm: any): FolderPermission => {
  return {
    id: apiPerm.id,
    folderId: apiPerm.folderId,
    userId: apiPerm.userId,
    userEmail: apiPerm.userEmail,
    userFullName: apiPerm.userFullName,
    departmentId: apiPerm.departmentId,
    departmentName: apiPerm.departmentName,
    permissionType: apiPerm.permissionType,
    permissionDescription: apiPerm.permissionDescription || '',
    permission: mapNumericPermissionToLevel(apiPerm.permissionType),
    isInherited: Boolean(apiPerm.isInherited),
    isDenied: Boolean(apiPerm.isDenied),
    expiresAt: apiPerm.expiresAt,
    isActive: Boolean(apiPerm.isActive ?? true),
    isValid: Boolean(apiPerm.isValid ?? true),
    permissionSource: apiPerm.permissionSource || 'Direct',
    createdTime: apiPerm.createdTime || '',
    createdBy: apiPerm.createdBy || '',
    // Legacy fields for backward compatibility
    grantedBy: apiPerm.createdBy || apiPerm.grantedBy,
    grantedAt: apiPerm.createdTime || apiPerm.grantedAt,
    updatedBy: apiPerm.updatedBy,
    updatedAt: apiPerm.updatedAt,
  };
};

// Folder CRUD Operations
export const createFolder = async (data: CreateFolderRequest): Promise<FolderNode> => {
  try {
    console.log('API: Creating folder with data:', JSON.stringify(data, null, 2));
    const response = await api.post("/document/folders", data);
    console.log('API: Folder created successfully:', response.data);
    const folder = response.data?.data || response.data;
    return mapApiFolderToFolderNode(folder);
  } catch (error: any) {
    console.error('API: Failed to create folder:', error);
    console.error('API: Error response:', error.response?.data);
    throw error;
  }
};

// New signature aligned to spec with backward compatibility
export function getFolderTree(
  maxDepth?: number,
  includeDocuments?: boolean,
  expandedFolders?: string[]
): Promise<FolderTreeResponse>;
export function getFolderTree(params?: {
  maxDepth?: number;
  includeSystemFolders?: boolean;
  departmentId?: string | null;
  expandedFolders?: string[]; // not used by backend, kept for compatibility
}): Promise<FolderTreeResponse>;
export async function getFolderTree(
  a?: number | { maxDepth?: number; includeSystemFolders?: boolean; departmentId?: string | null; expandedFolders?: string[] },
  _b?: boolean,
  _c?: string[]
): Promise<FolderTreeResponse> {
  const isObject = typeof a === 'object' && a !== null;
  const params = isObject ? (a as any) : { maxDepth: a as number | undefined };

  const query = new URLSearchParams();
  if (params?.maxDepth !== undefined) query.append("maxDepth", String(params.maxDepth));
  if (params?.includeSystemFolders !== undefined) query.append("includeSystemFolders", String(params.includeSystemFolders));

  const url = params?.departmentId
    ? `/document/folders/tree/department/${params.departmentId}?${query.toString()}`
    : `/document/folders/tree?${query.toString()}`;

  const response = await api.get(url);
  const payload = response.data;
  const data = payload?.data || payload;

  // Support both old and new shapes: rootNodes, rootFolders, or rootFolder (single root)
  let roots: any[] = [];
  if (Array.isArray(data?.rootNodes)) roots = data.rootNodes;
  else if (Array.isArray(data?.rootFolders)) roots = data.rootFolders;
  else if (data?.rootFolder) roots = [data.rootFolder];

  const mapped = roots.map((f: any) => mapApiFolderToFolderNode(f));

  const result: FolderTreeResponse = {
    success: Boolean(payload?.success ?? true),
    message: payload?.message || "",
    data: {
      rootNodes: mapped,
      departmentId: data?.departmentId || "",
      totalFolders: data?.totalFolders ?? (mapped.length ? 1 : 0),
      totalDocuments: data?.totalDocuments ?? 0,
    },
  };
  return result;
}

export const getPublicFolderTree = async (
  params?: { maxDepth?: number; includeSystemFolders?: boolean }
): Promise<FolderTreeResponse> => {
  const query = new URLSearchParams();
  if (params?.maxDepth !== undefined) query.append("maxDepth", String(params.maxDepth));
  if (params?.includeSystemFolders !== undefined) query.append("includeSystemFolders", String(params.includeSystemFolders));

  const response = await api.get(`/document/folders/tree/public?${query.toString()}`);
  const payload = response.data;
  const data = payload?.data || payload;
  const root = Array.isArray(data?.rootFolders) ? data.rootFolders : data?.rootNodes || [];
  const mapped = root.map((f: any) => mapApiFolderToFolderNode(f));
  return {
    success: Boolean(payload?.success ?? true),
    message: payload?.message || "",
    data: {
      rootNodes: mapped,
      departmentId: data?.departmentId || "",
      totalFolders: data?.totalFolders ?? 0,
      totalDocuments: data?.totalDocuments ?? 0,
    },
  };
};

export const getFolderChildren = async (
  parentId?: string
): Promise<{ success: boolean; message: string; data: FolderNode[] }> => {
  // This endpoint may not exist in the new spec; fallback to filtering from full tree if needed
  const params = new URLSearchParams();
  if (parentId) params.append("parentId", parentId);

  const response = await api.get(`/document/folders/children?${params.toString()}`);
  const payload = response.data;
  const items = (payload?.data || []).map((f: any) => mapApiFolderToFolderNode(f));
  return { success: Boolean(payload?.success ?? true), message: payload?.message || "", data: items };
};

export const getFolderDetails = async (folderId: string): Promise<FolderNode> => {
  const response = await api.get(`/document/folders/${folderId}`);
  const folder = response.data?.data || response.data;
  return mapApiFolderToFolderNode(folder);
};

export const updateFolder = async (folderId: string, data: UpdateFolderRequest): Promise<FolderNode> => {
  const response = await api.put(`/document/folders/${folderId}`, data);
  const folder = response.data?.data || response.data;
  return mapApiFolderToFolderNode(folder);
};

export const moveFolder = async (folderId: string, data: MoveFolderRequest): Promise<FolderNode> => {
  const response = await api.post(`/document/folders/${folderId}/move`, data);
  const folder = response.data?.data || response.data;
  return mapApiFolderToFolderNode(folder);
};

export const deleteFolder = async (
  folderId: string,
  options?: { deleteContents?: boolean; force?: boolean }
): Promise<void> => {
  const query = new URLSearchParams();
  if (options?.deleteContents !== undefined) query.append("deleteContents", String(options.deleteContents));
  if (options?.force !== undefined) query.append("force", String(options.force));
  const suffix = query.toString() ? `?${query.toString()}` : "";
  await api.delete(`/document/folders/${folderId}${suffix}`);
};

export const searchFolders = async (
  searchTerm: string,
  maxResults?: number
): Promise<{ success: boolean; message: string; data: FolderNode[] }> => {
  const params = new URLSearchParams();
  params.append("searchTerm", searchTerm);
  if (maxResults !== undefined) params.append("maxResults", maxResults.toString());

  const response = await api.get(`/document/folders/search?${params.toString()}`);
  const payload = response.data;
  const items = (payload?.data || []).map((f: any) => mapApiFolderToFolderNode(f));
  return { success: Boolean(payload?.success ?? true), message: payload?.message || "", data: items };
};

export const getAccessibleFolders = async (params?: {
  departmentId?: string;
  permissionType?: "View" | "Edit" | "Delete" | "Manage";
  includePublic?: boolean;
}): Promise<{ success: boolean; message: string; data: FolderNode[] }> => {
  const query = new URLSearchParams();
  if (params?.departmentId) query.append("departmentId", params.departmentId);
  if (params?.permissionType) query.append("permissionType", params.permissionType);
  if (params?.includePublic !== undefined) query.append("includePublic", String(params.includePublic));

  const response = await api.get(`/document/folders/accessible?${query.toString()}`);
  const payload = response.data;
  const items = (payload?.data || []).map((f: any) => mapApiFolderToFolderNode(f));
  return { success: Boolean(payload?.success ?? true), message: payload?.message || "", data: items };
};

// Deprecated on backend; compute from current tree where needed
export const getFolderStatistics = async (): Promise<{ success: boolean; message: string; data: FolderStatistics }> => {
  // Fallback: fetch tree and compute client-side
  const tree = await getFolderTree({ maxDepth: undefined, includeSystemFolders: true });

  const stats: FolderStatistics = { totalFolders: 0, systemFolders: 0, userFolders: 0, publicFolders: 0, totalDocuments: 0, maxDepth: 0, emptyFolders: 0 };

  const traverse = (nodes: FolderNode[], depth: number) => {
    stats.maxDepth = Math.max(stats.maxDepth, depth);
    for (const n of nodes) {
      stats.totalFolders += 1;
      if (n.folderType === 'system') stats.systemFolders += 1; else stats.userFolders += 1;
      if (n.isPublic) stats.publicFolders += 1;
      stats.totalDocuments += n.documentCount || 0;
      if (!n.children || n.children.length === 0) stats.emptyFolders += 1;
      if (n.children && n.children.length > 0) traverse(n.children, depth + 1);
    }
  };

  traverse(tree.data.rootNodes, 1);

  return { success: true, message: "Computed locally", data: stats };
};

export const getFolderSubtree = async (
  rootId: string,
  maxDepth?: number
): Promise<FolderTreeResponse> => {
  const params = new URLSearchParams();
  if (maxDepth !== undefined) params.append("maxDepth", maxDepth.toString());

  const response = await api.get(`/document/folders/${rootId}/subtree?${params.toString()}`);
  const payload = response.data;
  const data = payload?.data || payload;
  const root = Array.isArray(data?.rootNodes) ? data.rootNodes : Array.isArray(data?.subFolders) ? data.subFolders : [];
  const mapped = root.map((f: any) => mapApiFolderToFolderNode(f));
  return {
    success: Boolean(payload?.success ?? true),
    message: payload?.message || "",
    data: {
      rootNodes: mapped,
      departmentId: data?.departmentId || "",
      totalFolders: data?.totalFolders ?? 0,
      totalDocuments: data?.totalDocuments ?? 0,
    },
  };
};

// Folder Documents (list documents within a folder)
export interface FolderDocumentsListResponse {
  success: boolean;
  message: string;
  data: {
    searchFolder?: { id: string; name: string };
    documents: Array<{
      id: string; // documentId
      versionId?: string;
      documentFileId?: string;
      title: string;
      fileName: string;
      fileType?: string;
      fileSize?: number;
      lastUpdatedTime?: string;
      status?: string;
    }>;
    totalResults: number;
    totalPages: number;
    currentPage: number;
  };
}

export const getFolderDocumentsList = async (
  folderId: string,
  opts?: { status?: string; documentTypeId?: string; sortBy?: string; sortDirection?: 'asc' | 'desc' }
): Promise<FolderDocumentsListResponse> => {
  const params = new URLSearchParams();
  if (opts?.status) params.append('status', opts.status);
  if (opts?.documentTypeId) params.append('documentTypeId', opts.documentTypeId);
  if (opts?.sortBy) params.append('sortBy', opts.sortBy);
  if (opts?.sortDirection) params.append('sortDirection', opts.sortDirection);
  const query = params.toString() ? `?${params.toString()}` : '';
  const response = await api.get(`/document/folder-documents/${folderId}/list${query}`);
  const payload = response.data;
  const data = payload?.data || payload;
  return {
    success: Boolean(payload?.success ?? true),
    message: payload?.message || '',
    data: {
      searchFolder: data?.searchFolder,
      documents: data?.documents || [],
      totalResults: data?.totalResults ?? 0,
      totalPages: data?.totalPages ?? 0,
      currentPage: data?.currentPage ?? 1,
    },
  };
};


// Permission Management Operations - Updated to use new API endpoints
export const getFolderPermissions = async (folderId: string): Promise<FolderPermissionsResponse> => {
  const response = await api.get(`/document/folder-permissions/${folderId}`);
  const permissions = (response.data?.data || []).map(mapApiPermissionToFolderPermission);

  return {
    success: Boolean(response.data?.success ?? true),
    message: response.data?.message || '',
    data: permissions
  };
};

export const setFolderPermission = async (
  folderId: string,
  data: SetFolderPermissionRequest
): Promise<FolderPermission> => {
  const response = await api.post(`/document/folder-permissions/${folderId}`, data);
  const permission = response.data?.data || response.data;
  return mapApiPermissionToFolderPermission(permission);
};

export const updateFolderPermission = async (
  permissionId: string,
  data: { permissionType: APIPermissionType; expiresAt?: string | null }
): Promise<FolderPermission> => {
  const response = await api.put(`/document/folder-permissions/${permissionId}`, data);
  const permission = response.data?.data || response.data;
  return mapApiPermissionToFolderPermission(permission);
};

export const deleteFolderPermission = async (folderId: string, permissionId: string): Promise<void> => {
  await api.delete(`/document/folder-permissions/${folderId}/${permissionId}`);
};

export const checkUserPermission = async (
  folderId: string,
  data: CheckUserPermissionRequest
): Promise<CheckUserPermissionResponse> => {
  const response = await api.post(`/document/folder-permissions/${folderId}/check`, data);
  return response.data;
};

// Legacy functions for backward compatibility - map to new API
export const grantUserPermission = async (
  folderId: string,
  data: GrantUserPermissionRequest
): Promise<FolderPermission> => {
  return setFolderPermission(folderId, {
    userId: data.userId,
    permissionType: toApiPermissionType(data.permission)
  });
};

export const grantDepartmentPermission = async (
  folderId: string,
  data: GrantDepartmentPermissionRequest
): Promise<FolderPermission> => {
  return setFolderPermission(folderId, {
    departmentId: data.departmentId,
    permissionType: toApiPermissionType(data.permission)
  });
};

export const updateUserPermission = async (
  folderId: string,
  userId: string,
  data: UpdatePermissionRequest
): Promise<FolderPermission> => {
  // First get the permission ID for this user
  const permissions = await getFolderPermissions(folderId);
  const userPermission = permissions.data.find(p => p.userId === userId);

  if (!userPermission) {
    throw new Error('User permission not found');
  }

  return updateFolderPermission(userPermission.id, {
    permissionType: toApiPermissionType(data.permission)
  });
};

export const updateDepartmentPermission = async (
  folderId: string,
  departmentId: string,
  data: UpdatePermissionRequest
): Promise<FolderPermission> => {
  // First get the permission ID for this department
  const permissions = await getFolderPermissions(folderId);
  const deptPermission = permissions.data.find(p => p.departmentId === departmentId);

  if (!deptPermission) {
    throw new Error('Department permission not found');
  }

  return updateFolderPermission(deptPermission.id, {
    permissionType: toApiPermissionType(data.permission)
  });
};

export const revokeUserPermission = async (folderId: string, userId: string): Promise<void> => {
  // First get the permission ID for this user
  const permissions = await getFolderPermissions(folderId);
  const userPermission = permissions.data.find(p => p.userId === userId);

  if (!userPermission) {
    throw new Error('User permission not found');
  }

  await deleteFolderPermission(folderId, userPermission.id);
};

export const revokeDepartmentPermission = async (folderId: string, departmentId: string): Promise<void> => {
  // First get the permission ID for this department
  const permissions = await getFolderPermissions(folderId);
  const deptPermission = permissions.data.find(p => p.departmentId === departmentId);

  if (!deptPermission) {
    throw new Error('Department permission not found');
  }

  await deleteFolderPermission(folderId, deptPermission.id);
};

// Utility functions for folder operations
export const buildFolderPath = (folders: FolderNode[], folderId: string): string => {
  const findPath = (nodes: FolderNode[], targetId: string, currentPath: string = ""): string | null => {
    for (const node of nodes) {
      const newPath = currentPath ? `${currentPath}/${node.name}` : node.name;
      if (node.id === targetId) {
        return newPath;
      }
      if (node.children && node.children.length > 0) {
        const childPath = findPath(node.children, targetId, newPath);
        if (childPath) return childPath;
      }
    }
    return null;
  };

  return findPath(folders, folderId) || "";
};

export const findFolderById = (folders: FolderNode[], folderId: string): FolderNode | null => {
  for (const folder of folders) {
    if (folder.id === folderId) {
      return folder;
    }
    if (folder.children && folder.children.length > 0) {
      const found = findFolderById(folder.children, folderId);
      if (found) return found;
    }
  }
  return null;
};

export const canUserPerformAction = (
  folder: FolderNode,
  action: FolderPermissionLevel
): boolean => {
  const permissionLevels = { read: 1, write: 2, admin: 3 } as const;

  // If userPermission is undefined, check if folder is public or assume read access
  if (!folder.userPermission) {
    if (folder.isPublic && action === 'read') return true;
    return action === 'read';
  }

  const userLevel = permissionLevels[folder.userPermission];
  const requiredLevel = permissionLevels[action];
  return userLevel >= requiredLevel;
};
