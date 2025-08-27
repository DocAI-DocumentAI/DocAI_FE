import { api } from "./api";

// Move a document (by document version) to another folder
export const moveDocument = async (
  documentVersionId: string,
  targetFolderId: string
) => {
  const params = new URLSearchParams();
  params.append("targetFolderId", targetFolderId);
  const response = await api.put(
    `/document/folder-documents/${documentVersionId}/move?${params.toString()}`
  );
  return response.data;
};

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
  formData.append("FolderId", data.folderId || ""); // Add folder ID field
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
export const recreateDocument = async (id: string, data: any) => {
  const formData = new FormData();

  // Add all the standard fields
  if (data.title) formData.append("Title", data.title);
  if (data.versionName) formData.append("VersionName", data.versionName);
  if (data.summary) formData.append("Summary", data.summary);
  if (data.signedBy) formData.append("SignedBy", data.signedBy);
  if (data.description) formData.append("Description", data.description);
  if (data.effectiveFrom) formData.append("EffectiveFrom", data.effectiveFrom);
  if (data.effectiveUntil)
    formData.append("EffectiveUntil", data.effectiveUntil);
  if (data.tags) {
    formData.append(
      "Tags",
      Array.isArray(data.tags) ? data.tags.join(",") : data.tags
    );
  }
  if (data.replacementDocumentId)
    formData.append("ReplacementDocumentId", data.replacementDocumentId);
  if (data.documentTypeId)
    formData.append("DocumentTypeId", data.documentTypeId);
  formData.append("IsPublic", data.isPublic ? "true" : "false");
  formData.append("FolderId", data.folderId || ""); // Add folder ID field

  if (data.file) {
    formData.append("File", data.file);
  }

  const response = await api.put(`/document/drafts/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};
export const editDocument = async (id: string, data: any) => {
  const response = await api.put(`/document/drafts/${id}`, data, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};
export const getDocuments = async (
  pageNumber = 1,
  pageSize = 10,
  title?: string,
  folderId?: string
) => {
  let url = `/document/documents?pageNumber=${pageNumber}&pageSize=${pageSize}`;
  if (title) {
    url += `&Title=${encodeURIComponent(title)}`;
  }
  if (folderId) {
    url += `&folderId=${encodeURIComponent(folderId)}`;
  }
  const response = await api.get(url);
  return response.data.data;
};

// Updated interface for My Documents filters
export interface MyDocumentsFilters {
  title?: string;
  isPublic?: boolean;
  from?: string; // datetime
  to?: string; // datetime
  status?: string;
  documentTypeId?: string;
  pageNumber?: number;
  pageSize?: number;
}

// Updated interface for My Documents response
export interface MyDocumentsResponse {
  statusCode: number;
  message: string;
  data: {
    documents: {
      size: number;
      page: number;
      total: number;
      totalPages: number;
      items: MyDocumentItem[];
    };
    statistics: {
      totalDrafts: number;
      totalPending: number;
      totalApproved: number;
      totalRejected: number;
      totalArchived: number;
      totalDocuments: number;
    };
  };
}

export interface MyDocumentItem {
  documentId: string;
  versionId: string;
  title: string;
  description: string;
  summary: string;
  filePath: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  status: string;
  versionName: string;
  departmentId: string;
  departmentName: string;
  ownerId: string;
  ownerName: string;
  tags: string[];
  createdTime: string;
  documentTypeId: string;
  documentTypeName: string;
  replacementId: string;
  replacementDocument: any;
  replacementDocumentName: string;
  isReplaced: boolean;
  lastSubmitted: string;
  submittedBy: string;
  submittedByName: string;
  isPublic: boolean;
  signedBy: string;
  // New folder fields for approval workflow
  folderId?: string;
  folderName?: string;
  targetFolderId?: string;
  targetFolderName?: string;
}

export const getMyDocuments = async (
  userId: string,
  pageNumber = 1,
  pageSize = 10,
  title?: string,
  folderId?: string
) => {
  let url = `/document/my-documents?userId=${userId}&pageNumber=${pageNumber}&pageSize=${pageSize}`;
  if (title) {
    url += `&Title=${encodeURIComponent(title)}`;
  }
  if (folderId) {
    url += `&folderId=${encodeURIComponent(folderId)}`;
  }
  const response = await api.get(url);
  return response.data.data;
};

// New function for the enhanced API endpoint
export const getMyDocumentsWithStats = async (
  filters: MyDocumentsFilters = {}
): Promise<MyDocumentsResponse> => {
  const params = new URLSearchParams();

  if (filters.title) params.append("title", filters.title);
  if (filters.isPublic !== undefined)
    params.append("isPublic", filters.isPublic.toString());
  if (filters.from) params.append("from", filters.from);
  if (filters.to) params.append("to", filters.to);
  if (filters.status) params.append("status", filters.status);
  if (filters.documentTypeId)
    params.append("documentTypeId", filters.documentTypeId);

  params.append("pageNumber", (filters.pageNumber || 1).toString());
  params.append("pageSize", (filters.pageSize || 10).toString());

  const response = await api.get(
    `/document/my-documents/with-stats?${params.toString()}`
  );
  return response.data;
};

// Interface for approval queue filters
interface ApprovalQueueFilters {
  status?: string;
  fromDate?: string;
  toDate?: string;
  documentTypeId?: string;
  isPublic?: boolean;
  title?: string;
}

// Updated getApprovalQueue to match new API
export const getApprovalQueue = async (
  page = 1,
  pageSize = 10,
  filters: ApprovalQueueFilters = {}
) => {
  const params = new URLSearchParams();
  params.append("pageNumber", String(page));
  params.append("pageSize", String(pageSize));

  if (filters.status) params.append("Status", filters.status);
  if (filters.fromDate) params.append("FromDate", filters.fromDate);
  if (filters.toDate) params.append("ToDate", filters.toDate);
  if (filters.documentTypeId)
    params.append("DocumentTypeId", filters.documentTypeId);
  if (filters.isPublic !== undefined)
    params.append("IsPublic", String(filters.isPublic));
  if (filters.title) params.append("Title", filters.title);

  const response = await api.get(
    `/document/approval-queue?${params.toString()}`
  );
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
  folderId?: string; // Folder filtering support
}

// New interface for enhanced semantic search API
export interface EnhancedSemanticSearchParams {
  query: string;
  minRelevance?: number;
  maxResults?: number;
  enableHybridScoring?: boolean;
  scope?: string; // "0" for All, "1" for Public only, "2" for Department only
  documentTypeId?: string | null;
  departmentId?: string | null;
  fromDate?: string | null;
  toDate?: string | null;
  effectiveFrom?: string | null;
  effectiveUntil?: string | null;
  folderId?: string | null;
  includeSubfolders?: boolean;
}

// Response interface for enhanced semantic search
export interface EnhancedSemanticSearchResponse {
  statusCode: number;
  errorCode: string | null;
  message: string;
  data: {
    requestId: string;
    query: string;
    answer: string;
    hasAnswer: boolean;
    relevantDocuments: Array<{
      id: string;
      departmentId: string;
      departmentName: string;
      title: string;
      documentName: string;
      description: string;
      status: string;
      createdBy: string;
      createdByName: string;
      createdTime: string;
      lastUpdatedby: string;
      lastUpdatedByName: string;
      lastUpdatedTime: string;
      filePath: string;
      fileType: string;
      fileSize: number;
      version: string;
      tags: string[];
      replacementId: string | null;
      replacementDocument: any | null;
      isReplaced: boolean;
      relevance: number;
      documentTypeId: string;
      documentTypeName: string;
      isPublic: boolean;
      signedBy: string;
      effectiveFrom: string;
      effectiveUntil: string;
      scoring: {
        semanticSimilarity: number;
        metadataScore: number;
        contextualScore: number;
        finalScore: number;
        appliedBoosts: any[];
        matchingTags: any[];
      };
      isDepartmentBoosted: boolean;
      rank: number;
    }>;
    totalDocuments: number;
    processingTimeMs: number;
    metadata: {
      minRelevance: number;
      maxResults: number;
      hybridScoringEnabled: boolean;
      scope: string;
      departmentFilter: string | null;
      documentTypeFilter: string | null;
      dateRange: {
        fromDate: string | null;
        toDate: string | null;
        effectiveFrom: string | null;
        effectiveUntil: string | null;
      };
    };
    errorMessage: string | null;
    success: boolean;
  };
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
    folderId,
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
  if (folderId) searchParams.append("folderId", folderId);

  const response = await api.get(
    `/document/semantic-search?${searchParams.toString()}`
  );
  return response.data;
};

// New enhanced semantic search function
export const enhancedSemanticSearchDocuments = async (
  params: EnhancedSemanticSearchParams
): Promise<EnhancedSemanticSearchResponse> => {
  const searchParams = new URLSearchParams();

  // Add query parameters
  searchParams.append("query", params.query);
  if (params.minRelevance !== undefined)
    searchParams.append("minRelevance", params.minRelevance.toString());
  if (params.maxResults !== undefined)
    searchParams.append("maxResults", params.maxResults.toString());
  if (params.enableHybridScoring !== undefined)
    searchParams.append(
      "enableHybridScoring",
      params.enableHybridScoring.toString()
    );
  if (params.scope !== undefined) searchParams.append("scope", params.scope);
  if (params.documentTypeId)
    searchParams.append("documentTypeId", params.documentTypeId);
  if (params.departmentId)
    searchParams.append("departmentId", params.departmentId);
  if (params.fromDate) searchParams.append("fromDate", params.fromDate);
  if (params.toDate) searchParams.append("toDate", params.toDate);
  if (params.effectiveFrom)
    searchParams.append("effectiveFrom", params.effectiveFrom);
  if (params.effectiveUntil)
    searchParams.append("effectiveUntil", params.effectiveUntil);
  if (params.folderId) searchParams.append("folderId", params.folderId);
  if (params.includeSubfolders !== undefined)
    searchParams.append(
      "includeSubfolders",
      params.includeSubfolders.toString()
    );

  const response = await api.get(
    `/document/enhanced-semantic-search?${searchParams.toString()}`
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
  documentName?: string;
  documentTypeName: string;
  departmentName: string;
  ownerName?: string;
  status: string;
  createdTime: string;
  createdByName: string;
  similarityScore: number;
  semanticScore?: number;
  metadataScore?: number;
  contextScore?: number;
  reasons?: string[];
  canReplace?: boolean;
  departmentId?: string;
  documentTypeId?: string;
  createdBy?: string;
  lastUpdatedBy?: string;
  lastUpdatedByName?: string;
  lastUpdatedTime?: string;
  tags?: string[];
  sharedTagCount?: number;
  isPublic?: boolean;
  fileSize?: number;
  fileType?: string;
  effectiveFrom?: string;
  effectiveUntil?: string;
  signedBy?: string;
  summary?: string;
  matchReason?: string;
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

// Submit document for approval (folder-approval; optional targetFolderId)
export const submitDocumentForApproval = async (
  versionId: string,
  targetFolderId?: string
): Promise<any> => {
  const url = targetFolderId
    ? `/document/folder-approval/${versionId}/submit?targetFolderId=${encodeURIComponent(
        targetFolderId
      )}`
    : `/document/folder-approval/${versionId}/submit`;
  const response = await api.post(url);
  return response.data;
};

// Document recommendation interface
export interface DocumentRecommendation {
  documentId: string;
  title: string;
  description?: string;
  documentTypeId?: string;
  documentTypeName?: string;
  departmentId?: string;
  departmentName?: string;
  isPublic?: boolean;
  createdTime?: string;
  tags?: string[];
  relevanceScore?: number;
  recommendationReason?: string;
  sharedTagCount?: number;
  latestVersionId?: string;
}

// Recommendation API response interface
export interface RecommendationResponse {
  sourceDocumentId: string;
  sourceDocumentTitle: string;
  recommendations: DocumentRecommendation[];
  totalFound: number;
  requestedCount: number;
  generatedAt: string;
  fromCache: boolean;
}

// Get document recommendations
export const getDocumentRecommendations = async (
  documentId: string,
  count: number = 10,
  includeSameDepartmentOnly: boolean = false
): Promise<{
  data: DocumentRecommendation[];
  meta?: RecommendationResponse;
}> => {
  try {
    const response = await api.get(
      `/document/documents/${documentId}/recommendations`,
      {
        params: {
          count,
          includeSameDepartmentOnly,
        },
      }
    );

    console.log("Raw API response:", response.data);

    // Handle the specific response structure: response.data.data.recommendations
    const responseData = response.data?.data;
    const recommendations = responseData?.recommendations || [];

    return {
      data: Array.isArray(recommendations) ? recommendations : [],
      meta: responseData, // Include full response data for additional info
    };
  } catch (error) {
    console.error("Error fetching recommendations:", error);
    return { data: [], meta: undefined };
  }
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
    console.log(params);
    
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
      cleanedParams.tags.forEach((tag) => searchParams.append("Tags", tag));
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
    if (cleanedParams.departmentOnly !== undefined)
      searchParams.append(
        "departmentOnly",
        cleanedParams.departmentOnly.toString()
      );

    // Folder Organization Filters
    if (cleanedParams.folderId)
      searchParams.append("folderId", cleanedParams.folderId);

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

// Approval history (Editor)
export interface ApprovalHistoryRequest {
  title?: string;
  keyword?: string;
  status?: string; // Approved, Rejected, Archived
  fromDate?: string;
  toDate?: string;
  isPublic?: boolean;
  effectiveFrom?: string;
  effectiveUntil?: string;
  documentTypeId?: string;
  tags?: string[];
  signedBy?: string;
  reviewedBy?: string;
  pageNumber?: number; // default 1
  pageSize?: number; // default 10
}

export interface ApprovalHistoryItem {
  documentId: string;
  versionId: string;
  title: string;
  description: string;
  summary: string;
  versionName: string;
  status: string;
  ownerId: string;
  ownerName: string;
  departmentId: string;
  departmentName: string;
  documentTypeId: string;
  documentTypeName: string;
  tags: string[];
  createdTime: string;
  lastUpdatedTime: string;
  lastSubmitted: string;
  submittedBy: string;
  submittedByName: string;
  reviewedBy: string;
  reviewedByName: string;
  reviewedAt: string;
  reviewComments: string;
  signedBy: string;
  effectiveFrom: string;
  effectiveUntil: string;
  isPublic: boolean;
  isOfficial: boolean;
  totalDownloads: number;
  // New folder fields for approval workflow
  folderId?: string;
  folderName?: string;
  targetFolderId?: string;
  targetFolderName?: string;
}

export interface ApprovalHistoryResponse {
  statusCode: number;
  message: string;
  data: {
    size: number;
    page: number;
    total: number;
    totalPages: number;
    items: ApprovalHistoryItem[];
  };
}

export const getMyApprovalHistory = async (
  request: ApprovalHistoryRequest = {}
): Promise<ApprovalHistoryResponse> => {
  const params = new URLSearchParams();
  if (request.title) params.append("title", request.title);
  if (request.keyword) params.append("keyword", request.keyword);
  if (request.status) params.append("status", request.status);
  if (request.fromDate) params.append("fromDate", request.fromDate);
  if (request.toDate) params.append("toDate", request.toDate);
  if (request.isPublic !== undefined)
    params.append("isPublic", String(request.isPublic));
  if (request.effectiveFrom)
    params.append("effectiveFrom", request.effectiveFrom);
  if (request.effectiveUntil)
    params.append("effectiveUntil", request.effectiveUntil);
  if (request.documentTypeId)
    params.append("documentTypeId", request.documentTypeId);
  if (request.tags && request.tags.length > 0)
    request.tags.forEach((t) => params.append("tags", t));
  if (request.signedBy) params.append("signedBy", request.signedBy);
  if (request.reviewedBy) params.append("reviewedBy", request.reviewedBy);
  params.append("pageNumber", String(request.pageNumber ?? 1));
  params.append("pageSize", String(request.pageSize ?? 10));

  const response = await api.get(
    `/document/my-documents/approval-history?${params.toString()}`
  );
  return response.data as ApprovalHistoryResponse;
};

export const getApprovalHistoryItemById = async (
  id: string
): Promise<ApprovalHistoryItem> => {
  const response = await api.get(
    `/documents/my-documents/approval-history/${id}`
  );
  return response.data.data as ApprovalHistoryItem;
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
export const createNewVersion = async (id: string, data: any) => {
  const formData = new FormData();

  // Add all the standard fields with proper naming
  if (data.title) formData.append("Title", data.title);
  if (data.versionName) formData.append("VersionName", data.versionName);
  if (data.summary) formData.append("Summary", data.summary);
  if (data.signedBy) formData.append("SignedBy", data.signedBy);
  if (data.description) formData.append("Description", data.description);
  if (data.effectiveFrom) formData.append("EffectiveFrom", data.effectiveFrom);
  if (data.effectiveUntil)
    formData.append("EffectiveUntil", data.effectiveUntil);
  if (data.tags) {
    formData.append(
      "Tags",
      Array.isArray(data.tags) ? data.tags.join(",") : data.tags
    );
  }
  if (data.replacementDocumentId)
    formData.append("ReplacementDocumentId", data.replacementDocumentId);
  if (data.documentTypeId)
    formData.append("DocumentTypeId", data.documentTypeId);
  formData.append("IsPublic", data.isPublic ? "true" : "false");
  formData.append("FolderId", data.folderId || ""); // Add folder ID field

  if (data.file) {
    formData.append("File", data.file);
  }

  const response = await api.post(
    `/document/documents/${id}/versions`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
};
