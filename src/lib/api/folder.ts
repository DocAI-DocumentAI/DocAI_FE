import { api } from "./api";
import type {
  FolderNode,
  FolderTreeResponse,
  FolderPermission,
  FolderPermissionsResponse,
  FolderStatisticsResponse,
  CreateFolderRequest,
  UpdateFolderRequest,
  MoveFolderRequest,
  GrantUserPermissionRequest,
  GrantDepartmentPermissionRequest,
  UpdatePermissionRequest,
  FolderPermissionLevel
} from "../../types/folder";

// Folder CRUD Operations
export const createFolder = async (data: CreateFolderRequest): Promise<FolderNode> => {
  try {
    console.log('API: Creating folder with data:', JSON.stringify(data, null, 2));
    const response = await api.post("/document/folders", data);
    console.log('API: Folder created successfully:', response.data);
    return response.data.data;
  } catch (error: any) {
    console.error('API: Failed to create folder:', error);
    console.error('API: Error response:', error.response?.data);
    throw error;
  }
};

export const getFolderTree = async (
  maxDepth?: number,
  includeDocuments?: boolean,
  expandedFolders?: string[]
): Promise<FolderTreeResponse> => {
  const params = new URLSearchParams();
  if (maxDepth !== undefined) params.append("maxDepth", maxDepth.toString());
  if (includeDocuments !== undefined) params.append("includeDocuments", includeDocuments.toString());
  if (expandedFolders && expandedFolders.length > 0) {
    params.append("expandedFolders", expandedFolders.join(","));
  }

  const response = await api.get(`/document/folders/tree?${params.toString()}`);
  return response.data;
};

export const getFolderChildren = async (
  parentId?: string,
  includeDocuments?: boolean
): Promise<{ success: boolean; message: string; data: FolderNode[] }> => {
  const params = new URLSearchParams();
  if (parentId) params.append("parentId", parentId);
  if (includeDocuments !== undefined) params.append("includeDocuments", includeDocuments.toString());

  const response = await api.get(`/document/folders/children?${params.toString()}`);
  return response.data;
};

export const updateFolder = async (folderId: string, data: UpdateFolderRequest): Promise<FolderNode> => {
  const response = await api.put(`/document/folders/${folderId}`, data);
  return response.data.data;
};

export const moveFolder = async (folderId: string, data: MoveFolderRequest): Promise<FolderNode> => {
  const response = await api.put(`/document/folders/${folderId}/move`, data);
  return response.data.data;
};

export const deleteFolder = async (folderId: string): Promise<void> => {
  await api.delete(`/document/folders/${folderId}`);
};

export const searchFolders = async (
  searchTerm: string,
  maxResults?: number
): Promise<{ success: boolean; message: string; data: FolderNode[] }> => {
  const params = new URLSearchParams();
  params.append("searchTerm", searchTerm);
  if (maxResults !== undefined) params.append("maxResults", maxResults.toString());

  const response = await api.get(`/document/folders/search?${params.toString()}`);
  return response.data;
};

export const getFolderStatistics = async (): Promise<FolderStatisticsResponse> => {
  const response = await api.get("/document/folders/statistics");
  return response.data;
};

export const getFolderSubtree = async (
  rootId: string,
  maxDepth?: number,
  includeDocuments?: boolean
): Promise<FolderTreeResponse> => {
  const params = new URLSearchParams();
  if (maxDepth !== undefined) params.append("maxDepth", maxDepth.toString());
  if (includeDocuments !== undefined) params.append("includeDocuments", includeDocuments.toString());

  const response = await api.get(`/document/folders/${rootId}/subtree?${params.toString()}`);
  return response.data;
};

// Permission Management Operations
export const grantUserPermission = async (
  folderId: string,
  data: GrantUserPermissionRequest
): Promise<FolderPermission> => {
  const response = await api.post(`/document/folders/${folderId}/permissions/users`, data);
  return response.data.data;
};

export const grantDepartmentPermission = async (
  folderId: string,
  data: GrantDepartmentPermissionRequest
): Promise<FolderPermission> => {
  const response = await api.post(`/document/folders/${folderId}/permissions/departments`, data);
  return response.data.data;
};

export const getFolderPermissions = async (folderId: string): Promise<FolderPermissionsResponse> => {
  const response = await api.get(`/document/folders/${folderId}/permissions`);
  return response.data;
};

export const updateUserPermission = async (
  folderId: string,
  userId: string,
  data: UpdatePermissionRequest
): Promise<FolderPermission> => {
  const response = await api.put(`/document/folders/${folderId}/permissions/users/${userId}`, data);
  return response.data.data;
};

export const updateDepartmentPermission = async (
  folderId: string,
  departmentId: string,
  data: UpdatePermissionRequest
): Promise<FolderPermission> => {
  const response = await api.put(`/document/folders/${folderId}/permissions/departments/${departmentId}`, data);
  return response.data.data;
};

export const revokeUserPermission = async (folderId: string, userId: string): Promise<void> => {
  await api.delete(`/document/folders/${folderId}/permissions/users/${userId}`);
};

export const revokeDepartmentPermission = async (folderId: string, departmentId: string): Promise<void> => {
  await api.delete(`/document/folders/${folderId}/permissions/departments/${departmentId}`);
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
  const permissionLevels = { read: 1, write: 2, admin: 3 };

  // If userPermission is undefined, check if folder is public or assume read access
  if (!folder.userPermission) {
    // If folder is public, allow read access
    if (folder.isPublic && action === 'read') {
      return true;
    }
    // For undefined permissions, be more permissive and allow read access
    return action === 'read';
  }

  const userLevel = permissionLevels[folder.userPermission];
  const requiredLevel = permissionLevels[action];
  return userLevel >= requiredLevel;
};
