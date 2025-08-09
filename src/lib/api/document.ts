import { api } from "./api";

export const uploadDraftDocument = async (data: any) => {
  const formData = new FormData();
  formData.append("VersionName", data.versionName || "");
  formData.append("Summary", data.summary || "");
  formData.append("ReplacementDocumentId", data.replacementDocumentId || "");
  formData.append("DepartmentId", data.departmentId || ""); // <-- ensure this is mapped from form
  formData.append("EffectiveFrom", data.effectiveFrom || "");
  formData.append("SignedBy", data.signedBy || "");
  formData.append("EffectiveUntil", data.effectiveUntil || "");
  formData.append("Title", data.title || "");
  formData.append("Tags", Array.isArray(data.tags) ? data.tags.join(",") : (data.tags || ""));
  formData.append("Description", data.description || "");
  formData.append("documentTypeId", data.documentTypeId || "");
  if (data.file) {
    formData.append("File", data.file);
  }

  const response = await api.post(`/document/drafts`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const analyzeDocument = async (file: File) => {
  const formData = new FormData();
  formData.append("File", file);

  const response = await api.post("/document/analyze-document", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};
export const recreateDocument = async (id: string,  data: any, userId: string) => {
  const response = await api.post(`/document/documents/${id}/versions?userId=${userId}`, data, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};
export const getDocuments = async (pageNumber = 1, pageSize = 10, title?: string) => {
  let url = `/document/documents?pageNumber=${pageNumber}&pageSize=${pageSize}`;
  if (title) {
    url += `&Title=${encodeURIComponent(title)}`;
  }
  const response = await api.get(url);
  return response.data.data;
};

export const getMyDocuments = async (userId: string, pageNumber = 1, pageSize = 10, title?: string) => {
  let url = `/document/my-documents?userId=${userId}&pageNumber=${pageNumber}&pageSize=${pageSize}`;
  if (title) {
    url += `&Title=${encodeURIComponent(title)}`;
  }
  const response = await api.get(url);
  return response.data.data;
};

export const getApprovalQueue = async (pageNumber = 1, pageSize = 10, title?: string) => {
  let url = `/document/approval-queue?pageNumber=${pageNumber}&pageSize=${pageSize}`;
  if (title) {
    url += `&Title=${encodeURIComponent(title)}`;
  }
  const response = await api.get(url);
  return response.data.data;
};

export interface SemanticSearchParams {
  Query?: string;
  Tags?: string[];
  EffectiveFrom?: string;
  EffectiveUntil?: string;
  userId?: string;
  pageNumber?: number;
  pageSize?: number;
}

export const semanticSearchDocuments = async (params: SemanticSearchParams) => {
  const {
    Query = '',
    Tags = [],
    EffectiveFrom,
    EffectiveUntil,
    userId = '',
    pageNumber = 1,
    pageSize = 10,
  } = params;

  const searchParams = new URLSearchParams();
  if (Query) searchParams.append('Query', Query);
  if (Tags && Tags.length > 0) Tags.forEach(tag => searchParams.append('Tags', tag));
  if (EffectiveFrom) searchParams.append('EffectiveFrom', EffectiveFrom);
  if (EffectiveUntil) searchParams.append('EffectiveUntil', EffectiveUntil);
  if (userId) searchParams.append('userId', userId);
  if (pageNumber) searchParams.append('pageNumber', String(pageNumber));
  if (pageSize) searchParams.append('pageSize', String(pageSize));

  const response = await api.get(`/document/semantic-search?${searchParams.toString()}`);
  return response.data;
};

export interface DocumentType {
  id: string;
  name: string;
  description: string;
  createdBy: string;
  lastUpdatedBy: string | null;
  createdTime: string;
  lastUpdatedTime: string | null;
  documentCount: number;
}

export const getDocumentTypes = async () => {
  const response = await api.get("/document/document-types?pageNumber=1&pageSize=100");
  return response.data.data.items as DocumentType[];
};

export const regenerateSummary = async (file: File) => {
  const formData = new FormData();
  formData.append("File", file);

  const response = await api.post("/document/regenerate-summary", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

// Enhanced Document Library API Functions
import type {
  OfficialDocumentsRequest,
  DocumentLibraryResponse,
  DocumentTypesResponse,
  TagsResponse,
  DocumentDraftResponse,
  ApiResponse
} from "../../types/DocumentLibrary";
import { cleanApiParams, getErrorMessage } from "../../utils/documentLibrary";

/**
 * Enhanced official documents endpoint with comprehensive filtering
 * Includes proper error handling and response transformation
 */
export const getOfficialDocuments = async (params: OfficialDocumentsRequest = {}): Promise<DocumentLibraryResponse> => {
  try {
    // Clean and validate parameters
    const cleanedParams = cleanApiParams(params);
    const searchParams = new URLSearchParams();

    // Pagination
    if (cleanedParams.pageNumber) searchParams.append('pageNumber', cleanedParams.pageNumber.toString());
    if (cleanedParams.pageSize) searchParams.append('pageSize', cleanedParams.pageSize.toString());

    // Content Search Filters
    if (cleanedParams.title) searchParams.append('title', cleanedParams.title);
    if (cleanedParams.keyword) searchParams.append('keyword', cleanedParams.keyword);
    if (cleanedParams.versionName) searchParams.append('versionName', cleanedParams.versionName);

    // Date Filters
    if (cleanedParams.fromDate) searchParams.append('fromDate', cleanedParams.fromDate);
    if (cleanedParams.toDate) searchParams.append('toDate', cleanedParams.toDate);
    if (cleanedParams.effectiveFrom) searchParams.append('effectiveFrom', cleanedParams.effectiveFrom);
    if (cleanedParams.effectiveUntil) searchParams.append('effectiveUntil', cleanedParams.effectiveUntil);
    if (cleanedParams.lastSubmittedFrom) searchParams.append('lastSubmittedFrom', cleanedParams.lastSubmittedFrom);
    if (cleanedParams.lastSubmittedTo) searchParams.append('lastSubmittedTo', cleanedParams.lastSubmittedTo);

    // Document Metadata Filters
    if (cleanedParams.documentTypeId) searchParams.append('documentTypeId', cleanedParams.documentTypeId);
    if (cleanedParams.tags && cleanedParams.tags.length > 0) {
      cleanedParams.tags.forEach(tag => searchParams.append('tags', tag));
    }
    if (cleanedParams.signedBy) searchParams.append('signedBy', cleanedParams.signedBy);
    if (cleanedParams.fileType) searchParams.append('fileType', cleanedParams.fileType);
    if (cleanedParams.submittedBy) searchParams.append('submittedBy', cleanedParams.submittedBy);

    // Access Control Filters
    if (cleanedParams.isPublic !== undefined) searchParams.append('isPublic', cleanedParams.isPublic.toString());

    // File Property Filters
    if (cleanedParams.minFileSize !== undefined && cleanedParams.minFileSize > 0) {
      searchParams.append('minFileSize', cleanedParams.minFileSize.toString());
    }
    if (cleanedParams.maxFileSize !== undefined && cleanedParams.maxFileSize > 0) {
      searchParams.append('maxFileSize', cleanedParams.maxFileSize.toString());
    }
    if (cleanedParams.minDownloads !== undefined && cleanedParams.minDownloads > 0) {
      searchParams.append('minDownloads', cleanedParams.minDownloads.toString());
    }
    if (cleanedParams.maxDownloads !== undefined && cleanedParams.maxDownloads > 0) {
      searchParams.append('maxDownloads', cleanedParams.maxDownloads.toString());
    }

    const response = await api.get(`/document/documents?${searchParams.toString()}`);

    // Transform response to ensure consistency
    const transformedResponse: DocumentLibraryResponse = {
      success: response.data.success || true,
      data: {
        items: response.data.data?.items || response.data.items || [],
        page: response.data.data?.page || response.data.page || 1,
        size: response.data.data?.size || response.data.size || 10,
        total: response.data.data?.total || response.data.total || 0,
        totalPages: response.data.data?.totalPages || response.data.totalPages || 0
      },
      message: response.data.message || 'Documents retrieved successfully',
      statusCode: response.status || 200
    };

    return transformedResponse;
  } catch (error: any) {
    console.error('Error fetching official documents:', error);

    // Return a consistent error response
    return {
      success: false,
      data: {
        items: [],
        page: 1,
        size: 10,
        total: 0,
        totalPages: 0
      },
      message: getErrorMessage(error),
      statusCode: error?.response?.status || 500
    };
  }
};

/**
 * Enhanced document types endpoint with error handling
 */
export const getDocumentTypesEnhanced = async (): Promise<DocumentTypesResponse> => {
  try {
    const response = await api.get("/document/document-types?pageNumber=1&pageSize=100");

    return {
      success: response.data.success || true,
      data: {
        items: response.data.data?.items || response.data.items || [],
        page: response.data.data?.page || 1,
        size: response.data.data?.size || 100,
        total: response.data.data?.total || 0,
        totalPages: response.data.data?.totalPages || 0
      },
      message: response.data.message || 'Document types retrieved successfully',
      statusCode: response.status || 200
    };
  } catch (error: any) {
    console.error('Error fetching document types:', error);

    return {
      success: false,
      data: {
        items: [],
        page: 1,
        size: 100,
        total: 0,
        totalPages: 0
      },
      message: getErrorMessage(error),
      statusCode: error?.response?.status || 500
    };
  }
};

/**
 * Enhanced tags endpoint with error handling
 */
export const getTagsEnhanced = async (): Promise<TagsResponse> => {
  try {
    const response = await api.get("/document/tags?pageNumber=1&pageSize=100");

    return {
      success: response.data.success || true,
      data: {
        items: response.data.data?.items || response.data.items || [],
        page: response.data.data?.page || 1,
        size: response.data.data?.size || 100,
        total: response.data.data?.total || 0,
        totalPages: response.data.data?.totalPages || 0
      },
      message: response.data.message || 'Tags retrieved successfully',
      statusCode: response.status || 200
    };
  } catch (error: any) {
    console.error('Error fetching tags:', error);

    return {
      success: false,
      data: {
        items: [],
        page: 1,
        size: 100,
        total: 0,
        totalPages: 0
      },
      message: getErrorMessage(error),
      statusCode: error?.response?.status || 500
    };
  }
};

/**
 * Get a single document by ID
 */
export const getDocumentById = async (documentId: string): Promise<ApiResponse<DocumentDraftResponse>> => {
  try {
    const response = await api.get(`/document/documents/${documentId}`);

    return {
      success: response.data.success || true,
      data: response.data.data || response.data,
      message: response.data.message || 'Document retrieved successfully',
      statusCode: response.status || 200
    };
  } catch (error: any) {
    console.error('Error fetching document:', error);

    return {
      success: false,
      data: {} as DocumentDraftResponse,
      message: getErrorMessage(error),
      statusCode: error?.response?.status || 500
    };
  }
};

/**
 * Download a document
 */
export const downloadDocument = async (documentId: string, versionId?: string): Promise<Blob> => {
  try {
    const url = versionId
      ? `/document/documents/${documentId}/download?versionId=${versionId}`
      : `/document/documents/${documentId}/download`;

    const response = await api.get(url, {
      responseType: 'blob'
    });

    return response.data;
  } catch (error: any) {
    console.error('Error downloading document:', error);
    throw new Error(getErrorMessage(error));
  }
};

/**
 * Delete a document
 */
export const deleteDocument = async (documentId: string): Promise<ApiResponse<void>> => {
  try {
    const response = await api.delete(`/document/documents/${documentId}`);

    return {
      success: response.data.success || true,
      data: undefined,
      message: response.data.message || 'Document deleted successfully',
      statusCode: response.status || 200
    };
  } catch (error: any) {
    console.error('Error deleting document:', error);

    return {
      success: false,
      data: undefined,
      message: getErrorMessage(error),
      statusCode: error?.response?.status || 500
    };
  }
};

/**
 * Search documents with advanced filtering
 */
export const searchDocuments = async (
  query: string,
  filters?: Partial<OfficialDocumentsRequest>
): Promise<DocumentLibraryResponse> => {
  const searchParams: OfficialDocumentsRequest = {
    keyword: query,
    pageNumber: 1,
    pageSize: 20,
    ...filters
  };

  return getOfficialDocuments(searchParams);
};

/**
 * Get document statistics
 */
export const getDocumentStats = async (): Promise<ApiResponse<{
  total: number;
  byType: Record<string, number>;
  byStatus: Record<string, number>;
  recentUploads: number;
}>> => {
  try {
    const response = await api.get('/document/documents/stats');

    return {
      success: response.data.success || true,
      data: response.data.data || response.data,
      message: response.data.message || 'Statistics retrieved successfully',
      statusCode: response.status || 200
    };
  } catch (error: any) {
    console.error('Error fetching document stats:', error);

    return {
      success: false,
      data: {
        total: 0,
        byType: {},
        byStatus: {},
        recentUploads: 0
      },
      message: getErrorMessage(error),
      statusCode: error?.response?.status || 500
    };
  }
};

