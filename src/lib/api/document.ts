import { api } from "./api";

export const uploadDraftDocument = async (data: any) => {
  const formData = new FormData();
  formData.append("Title", data.title || "");
  formData.append("VersionName", data.versionName || "");
  formData.append("Summary", data.summary || "");
  formData.append("SignedBy", data.signedBy || "");
  formData.append("Description", data.description || "");
  formData.append("EffectiveFrom", data.effectiveFrom || "");
  formData.append("EffectiveUntil", data.effectiveUntil || "");
  formData.append(
    "Tags",
    Array.isArray(data.tags) ? data.tags.join(",") : data.tags || ""
  );
  formData.append("ReplacementDocumentId", data.replacementDocumentId || "");
  formData.append("DocumentTypeId", data.documentTypeId || "");
  formData.append("IsPublic", data.isPublic ? "true" : "false"); // Add missing IsPublic field
  if (data.file) {
    formData.append("File", data.file);
  }

  const response = await api.post(`/document/drafts`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data.data; // Return the data object which contains versionId
};

export const analyzeDocument = async (file: File) => {
  const formData = new FormData();
  formData.append("File", file);

  const response = await api.post("/document/analyze-document", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};
export const recreateDocument = async (
  id: string,
  data: any, 
) => {
  const response = await api.put(
    `/document/drafts/${id}`,
    data,
    {
      headers: { "Content-Type": "multipart/form-data" },
    }
  );
  return response.data;
};
export const getDocuments = async (
  pageNumber = 1,
  pageSize = 10,
  title?: string
) => {
  let url = `/document/documents?pageNumber=${pageNumber}&pageSize=${pageSize}`;
  if (title) {
    url += `&Title=${encodeURIComponent(title)}`;
  }
  const response = await api.get(url);
  return response.data.data;
};

export const getMyDocuments = async (
  userId: string,
  pageNumber = 1,
  pageSize = 10,
  title?: string
) => {
  let url = `/document/my-documents?userId=${userId}&pageNumber=${pageNumber}&pageSize=${pageSize}`;
  if (title) {
    url += `&Title=${encodeURIComponent(title)}`;
  }
  const response = await api.get(url);
  return response.data.data;
};

// Thêm interface cho filters
interface ApprovalQueueFilters {
  title?: string;
  documentTypeId?: string;
  isPublic?: boolean;
  fromDate?: string;
  toDate?: string;
}

// Cập nhật hàm getApprovalQueue
export const getApprovalQueue = async (
  pageNumber = 1,
  pageSize = 10,
  filters: ApprovalQueueFilters = {}
) => {
  let url = `/document/approval-queue?pageNumber=${pageNumber}&pageSize=${pageSize}`;
  
  // Thêm filters vào URL
  if (filters.title) {
    url += `&Title=${encodeURIComponent(filters.title)}`;
  }
  if (filters.documentTypeId) {
    url += `&DocumentTypeId=${encodeURIComponent(filters.documentTypeId)}`;
  }
  if (filters.isPublic !== undefined) {
    url += `&IsPublic=${filters.isPublic}`;
  }
  if (filters.fromDate) {
    url += `&FromDate=${encodeURIComponent(filters.fromDate)}`;
  }
  if (filters.toDate) {
    url += `&ToDate=${encodeURIComponent(filters.toDate)}`;
  }
  
  const response = await api.get(url);
  return response.data.data;
};

export interface SemanticSearchParams {
  Query: string;
  Tags?: string[];
  userId?: string;
  pageNumber?: number;
  pageSize?: number;
  EffectiveFrom?: string;
  EffectiveUntil?: string;
  // Enhanced filter parameters
  minRelevance?: number;
  maxResults?: number;
  enableHybridScoring?: boolean;
  boostDepartmentResults?: boolean;
  latestVersionsOnly?: boolean;
  scope?: number; // 0: All documents, 1: Public documents only, 2: Department documents only
  documentTypeId?: string;
  signedBy?: string;
  fromDate?: string;
  toDate?: string;
}

export const semanticSearchDocuments = async (params: SemanticSearchParams) => {
  const {
    Query = "",
    Tags = [],
    EffectiveFrom,
    EffectiveUntil,
    userId = "",
    pageNumber = 1,
    pageSize = 10,
    // Enhanced filter parameters
    minRelevance,
    maxResults,
    enableHybridScoring,
    boostDepartmentResults,
    latestVersionsOnly,
    scope,
    documentTypeId,
    signedBy,
    fromDate,
    toDate,
  } = params;

  const searchParams = new URLSearchParams();
  if (Query) searchParams.append("Query", Query);
  if (Tags && Tags.length > 0)
    Tags.forEach((tag) => searchParams.append("Tags", tag));
  if (EffectiveFrom) searchParams.append("EffectiveFrom", EffectiveFrom);
  if (EffectiveUntil) searchParams.append("EffectiveUntil", EffectiveUntil);
  if (userId) searchParams.append("userId", userId);
  if (pageNumber) searchParams.append("pageNumber", String(pageNumber));
  if (pageSize) searchParams.append("pageSize", String(pageSize));

  // Enhanced filter parameters
  if (minRelevance !== undefined)
    searchParams.append("minRelevance", String(minRelevance));
  if (maxResults !== undefined)
    searchParams.append("maxResults", String(maxResults));
  if (enableHybridScoring !== undefined)
    searchParams.append("enableHybridScoring", String(enableHybridScoring));
  if (boostDepartmentResults !== undefined)
    searchParams.append(
      "boostDepartmentResults",
      String(boostDepartmentResults)
    );
  if (latestVersionsOnly !== undefined)
    searchParams.append("latestVersionsOnly", String(latestVersionsOnly));
  if (scope !== undefined) searchParams.append("scope", String(scope));
  if (documentTypeId) searchParams.append("documentTypeId", documentTypeId);
  if (signedBy) searchParams.append("signedBy", signedBy);
  if (fromDate) searchParams.append("fromDate", fromDate);
  if (toDate) searchParams.append("toDate", toDate);

  const response = await api.get(
    `/document/semantic-search?${searchParams.toString()}`
  );
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

export interface ReplaceableDocument {
  id: string;
  title: string;
  description: string;
  documentTypeId: string;
  documentTypeName: string;
  departmentId: string;
  departmentName: string;
  status: string;
  createdBy: string;
  createdByName: string;
  createdTime: string;
  lastUpdatedBy: string;
  lastUpdatedByName: string;
  lastUpdatedTime: string;
  tags: string[];
  isPublic: boolean;
  isReplaced: boolean;
  signedBy: string;
  effectiveFrom: string;
  effectiveUntil: string;
  filePath: string;
  fileSize: number;
  fileType: string;
}

export const getDocumentTypes = async () => {
  const response = await api.get(
    "/document/document-types?pageNumber=1&pageSize=100"
  );
  return response.data.data.items as DocumentType[];
};

export interface ReplaceableDocumentsRequest {
  title?: string;
  keyword?: string;
  fromDate?: string;
  toDate?: string;
  documentTypeId?: string;
  tags?: string[];
  signedBy?: string;
  pageNumber?: number;
  pageSize?: number;
}

export interface ReplaceableDocumentsResponse {
  items: ReplaceableDocument[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export const getReplaceableDocuments = async (
  request: ReplaceableDocumentsRequest
): Promise<ReplaceableDocumentsResponse> => {
  const response = await api.get("/document/replaceable-documents", {
    params: {
      title: request.title,
      keyword: request.keyword,
      fromDate: request.fromDate,
      toDate: request.toDate,
      documentTypeId: request.documentTypeId,
      tags: request.tags?.join(","),
      signedBy: request.signedBy,
      pageNumber: request.pageNumber || 1,
      pageSize: request.pageSize || 10,
    },
  });
  return response.data.data;
};

// Enhanced API functions for search filters
export interface SearchUser {
  id: string;
  fullName: string;
  email: string;
}

export const getSearchUsers = async (): Promise<SearchUser[]> => {
  try {
    const user = localStorage.getItem("user");
    if (!user) {
      throw new Error("No authentication token found");
    }
    const userData = JSON.parse(user);
    const token = userData.docaiToken;

    const response = await fetch(
      `https://production.docai.asia/api/auth/users?page=1&size=100&isAsc=true`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch users");
    }

    const data = await response.json();
    return data.items.map((user: any) => ({
      id: user.id,
      fullName: user.fullName,
      email: user.email,
    }));
  } catch (error) {
    console.error("Error fetching users for search:", error);
    return [];
  }
};

export const regenerateSummary = async (file: File) => {
  const formData = new FormData();
  formData.append("File", file);

  const response = await api.post("/document/regenerate-summary", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

// Replacement Suggestion Interfaces
export interface ReplacementSuggestion {
  documentId: string;
  title: string;
  description: string;
  documentName: string;
  documentTypeName: string;
  departmentName: string;
  ownerName: string;
  status: string;
  createdTime: string;
  createdByName: string;
  relevanceScore: number;
  matchReason: string;
}

export interface ReplacementSuggestionsRequest {
  title?: string;
  description?: string;
  tags?: string[];
  documentTypeId?: string;
  isPublic?: boolean;
  maxSuggestions?: number;
  minSimilarityThreshold?: number;
  sameDepartmentOnly?: boolean;
}

export interface ReplacementSuggestionsResponse {
  suggestions: ReplacementSuggestion[];
  total: number;
  hasMore: boolean;
}

// Get replacement suggestions for a new document
export const getReplacementSuggestions = async (
  request: ReplacementSuggestionsRequest
): Promise<ReplacementSuggestionsResponse> => {
  const requestBody = {
    title: request.title || "",
    description: request.description || "",
    documentTypeId: request.documentTypeId || "",
    tags: request.tags || [],
    isPublic: request.isPublic || false,
    maxSuggestions: request.maxSuggestions || 10,
    minSimilarityThreshold: request.minSimilarityThreshold || 0.45,
    sameDepartmentOnly: request.sameDepartmentOnly || false,
  };

  const response = await api.post(
    "/document/replacement-suggestions",
    requestBody,
    {
      headers: { "Content-Type": "application/json" },
    }
  );
  return response.data.data;
};

// Get replacement suggestions for an existing document
export const getReplacementSuggestionsForDocument = async (
  documentId: string,
  request: ReplacementSuggestionsRequest
): Promise<ReplacementSuggestionsResponse> => {
  const requestBody = {
    title: request.title || "",
    description: request.description || "",
    documentTypeId: request.documentTypeId || "",
    tags: request.tags || [],
    isPublic: request.isPublic || false,
    maxSuggestions: request.maxSuggestions || 10,
    minSimilarityThreshold: request.minSimilarityThreshold || 0.45,
    sameDepartmentOnly: request.sameDepartmentOnly || false,
  };

  const response = await api.post(
    `/document/documents/${documentId}/replacement-suggestions`,
    requestBody,
    {
      headers: { "Content-Type": "application/json" },
    }
  );
  return response.data.data;
};

// Submit document for approval (separate from draft upload)
export const submitDocumentForApproval = async (
  versionId: string
): Promise<any> => {
  const response = await api.post(`/document/submit/${versionId}`);
  return response.data;
};

// Enhanced Document Library API Functions
import type {
  OfficialDocumentsRequest,
  DocumentLibraryResponse,
  DocumentTypesResponse,
  TagsResponse,
  DocumentDraftResponse,
  ApiResponse,
} from "../../types/DocumentLibrary";
import { cleanApiParams, getErrorMessage } from "../../utils/documentLibrary";

/**
 * Enhanced official documents endpoint with comprehensive filtering
 * Includes proper error handling and response transformation
 */
export const getOfficialDocuments = async (
  params: OfficialDocumentsRequest = {}
): Promise<DocumentLibraryResponse> => {
  try {
    // Clean and validate parameters
    const cleanedParams = cleanApiParams(params);
    const searchParams = new URLSearchParams();

    // Pagination
    if (cleanedParams.pageNumber)
      searchParams.append("pageNumber", cleanedParams.pageNumber.toString());
    if (cleanedParams.pageSize)
      searchParams.append("pageSize", cleanedParams.pageSize.toString());

    // Content Search Filters
    if (cleanedParams.title) searchParams.append("title", cleanedParams.title);
    if (cleanedParams.keyword)
      searchParams.append("keyword", cleanedParams.keyword);
    if (cleanedParams.versionName)
      searchParams.append("versionName", cleanedParams.versionName);

    // Date Filters
    if (cleanedParams.fromDate)
      searchParams.append("fromDate", cleanedParams.fromDate);
    if (cleanedParams.toDate)
      searchParams.append("toDate", cleanedParams.toDate);
    if (cleanedParams.effectiveFrom)
      searchParams.append("effectiveFrom", cleanedParams.effectiveFrom);
    if (cleanedParams.effectiveUntil)
      searchParams.append("effectiveUntil", cleanedParams.effectiveUntil);
    if (cleanedParams.lastSubmittedFrom)
      searchParams.append("lastSubmittedFrom", cleanedParams.lastSubmittedFrom);
    if (cleanedParams.lastSubmittedTo)
      searchParams.append("lastSubmittedTo", cleanedParams.lastSubmittedTo);

    // Document Metadata Filters
    if (cleanedParams.documentTypeId)
      searchParams.append("documentTypeId", cleanedParams.documentTypeId);
    if (cleanedParams.tags && cleanedParams.tags.length > 0) {
      cleanedParams.tags.forEach((tag) => searchParams.append("tags", tag));
    }
    if (cleanedParams.signedBy)
      searchParams.append("signedBy", cleanedParams.signedBy);
    if (cleanedParams.fileType)
      searchParams.append("fileType", cleanedParams.fileType);
    if (cleanedParams.submittedBy)
      searchParams.append("submittedBy", cleanedParams.submittedBy);

    // Access Control Filters
    if (cleanedParams.isPublic !== undefined)
      searchParams.append("isPublic", cleanedParams.isPublic.toString());

    // File Property Filters
    if (
      cleanedParams.minFileSize !== undefined &&
      cleanedParams.minFileSize > 0
    ) {
      searchParams.append("minFileSize", cleanedParams.minFileSize.toString());
    }
    if (
      cleanedParams.maxFileSize !== undefined &&
      cleanedParams.maxFileSize > 0
    ) {
      searchParams.append("maxFileSize", cleanedParams.maxFileSize.toString());
    }
    if (
      cleanedParams.minDownloads !== undefined &&
      cleanedParams.minDownloads > 0
    ) {
      searchParams.append(
        "minDownloads",
        cleanedParams.minDownloads.toString()
      );
    }
    if (
      cleanedParams.maxDownloads !== undefined &&
      cleanedParams.maxDownloads > 0
    ) {
      searchParams.append(
        "maxDownloads",
        cleanedParams.maxDownloads.toString()
      );
    }

    const response = await api.get(
      `/document/documents?${searchParams.toString()}`
    );

    // Transform response to ensure consistency
    const transformedResponse: DocumentLibraryResponse = {
      success: response.data.success || true,
      data: {
        items: response.data.data?.items || response.data.items || [],
        page: response.data.data?.page || response.data.page || 1,
        size: response.data.data?.size || response.data.size || 10,
        total: response.data.data?.total || response.data.total || 0,
        totalPages:
          response.data.data?.totalPages || response.data.totalPages || 0,
      },
      message: response.data.message || "Documents retrieved successfully",
      statusCode: response.status || 200,
    };

    return transformedResponse;
  } catch (error: any) {
    console.error("Error fetching official documents:", error);

    // Return a consistent error response
    return {
      success: false,
      data: {
        items: [],
        page: 1,
        size: 10,
        total: 0,
        totalPages: 0,
      },
      message: getErrorMessage(error),
      statusCode: error?.response?.status || 500,
    };
  }
};

/**
 * Enhanced document types endpoint with error handling
 */
export const getDocumentTypesEnhanced =
  async (): Promise<DocumentTypesResponse> => {
    try {
      const response = await api.get(
        "/document/document-types?pageNumber=1&pageSize=100"
      );

      return {
        success: response.data.success || true,
        data: {
          items: response.data.data?.items || response.data.items || [],
          page: response.data.data?.page || 1,
          size: response.data.data?.size || 100,
          total: response.data.data?.total || 0,
          totalPages: response.data.data?.totalPages || 0,
        },
        message:
          response.data.message || "Document types retrieved successfully",
        statusCode: response.status || 200,
      };
    } catch (error: any) {
      console.error("Error fetching document types:", error);

      return {
        success: false,
        data: {
          items: [],
          page: 1,
          size: 100,
          total: 0,
          totalPages: 0,
        },
        message: getErrorMessage(error),
        statusCode: error?.response?.status || 500,
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
        totalPages: response.data.data?.totalPages || 0,
      },
      message: response.data.message || "Tags retrieved successfully",
      statusCode: response.status || 200,
    };
  } catch (error: any) {
    console.error("Error fetching tags:", error);

    return {
      success: false,
      data: {
        items: [],
        page: 1,
        size: 100,
        total: 0,
        totalPages: 0,
      },
      message: getErrorMessage(error),
      statusCode: error?.response?.status || 500,
    };
  }
};

/**
 * Get a single document by ID
 */
export const getDocumentById = async (
  documentId: string
): Promise<ApiResponse<DocumentDraftResponse>> => {
  try {
    const response = await api.get(`/document/documents/${documentId}`);

    return {
      success: response.data.success || true,
      data: response.data.data || response.data,
      message: response.data.message || "Document retrieved successfully",
      statusCode: response.status || 200,
    };
  } catch (error: any) {
    console.error("Error fetching document:", error);

    return {
      success: false,
      data: {} as DocumentDraftResponse,
      message: getErrorMessage(error),
      statusCode: error?.response?.status || 500,
    };
  }
};

/**
 * Download a document
 */
export const downloadDocument = async (
  documentId: string,
  versionId?: string
): Promise<Blob> => {
  try {
    const url = versionId
      ? `/document/documents/${documentId}/download?versionId=${versionId}`
      : `/document/documents/${documentId}/download`;

    const response = await api.get(url, {
      responseType: "blob",
    });

    return response.data;
  } catch (error: any) {
    console.error("Error downloading document:", error);
    throw new Error(getErrorMessage(error));
  }
};

/**
 * Delete a document
 */
export const deleteDocument = async (
  documentId: string
): Promise<ApiResponse<void>> => {
  try {
    const response = await api.delete(`/document/documents/${documentId}`);

    return {
      success: response.data.success || true,
      data: undefined,
      message: response.data.message || "Document deleted successfully",
      statusCode: response.status || 200,
    };
  } catch (error: any) {
    console.error("Error deleting document:", error);

    return {
      success: false,
      data: undefined,
      message: getErrorMessage(error),
      statusCode: error?.response?.status || 500,
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
    ...filters,
  };

  return getOfficialDocuments(searchParams);
};

/**
 * Get document statistics
 */
export const getDocumentStats = async (): Promise<
  ApiResponse<{
    total: number;
    byType: Record<string, number>;
    byStatus: Record<string, number>;
    recentUploads: number;
  }>
> => {
  try {
    const response = await api.get("/document/documents/stats");

    return {
      success: response.data.success || true,
      data: response.data.data || response.data,
      message: response.data.message || "Statistics retrieved successfully",
      statusCode: response.status || 200,
    };
  } catch (error: any) {
    console.error("Error fetching document stats:", error);

    return {
      success: false,
      data: {
        total: 0,
        byType: {},
        byStatus: {},
        recentUploads: 0,
      },
      message: getErrorMessage(error),
      statusCode: error?.response?.status || 500,
    };
  }
};

/**
 * Create a new version of an existing document
 */
export const createNewVersion = async (
  id: string,
  data: any, 
) => {
  const formData = new FormData();
  
  // Append all form fields
  Object.keys(data).forEach(key => {
    if (key === 'file' && data[key]) {
      formData.append('file', data[key]);
    } else if (data[key] !== null && data[key] !== undefined && data[key] !== '') {
      formData.append(key, data[key]);
    }
  });

  const response = await api.post(`/document/documents/${id}/versions`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response.data;
};
