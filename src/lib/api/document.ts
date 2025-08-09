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
  Query: string;
  Tags?: string[];
  userId?: string;
  pageNumber?: number;
  pageSize?: number;
  EffectiveFrom?: string;
  EffectiveUntil?: string;
  MinRelevance?: number;
  MaxResults?: number;
  EnableHybridScoring?: boolean;
  BoostDepartmentResults?: boolean;
  LatestVersionsOnly?: boolean;
  Scope?: number;
  DocumentTypeId?: string;
  SignedBy?: string;
}

export const semanticSearchDocuments = async (params: SemanticSearchParams) => {
  // Build query string with all parameters
  const queryParams = new URLSearchParams();
  
  // Add all parameters to query string
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      if (Array.isArray(value)) {
        value.forEach(item => queryParams.append(key, item));
      } else {
        queryParams.append(key, value.toString());
      }
    }
  });

  const response = await api.get(`/document/semantic-search?${queryParams.toString()}`);
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

export interface ReplaceableDocument {
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
  effectiveFrom: string;
  effectiveUntil: string;
}

export const getReplaceableDocuments = async (pageNumber = 1, pageSize = 10, title?: string) => {
  let url = `/document/replaceable-documents?pageNumber=${pageNumber}&pageSize=${pageSize}`;
  if (title) {
    url += `&Title=${encodeURIComponent(title)}`;
  }
  const response = await api.get(url);
  return response.data.data;
};

