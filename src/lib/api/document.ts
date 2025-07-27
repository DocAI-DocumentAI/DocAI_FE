import { api } from "./api";

export const uploadDraftDocument = async (data: any, userId: string) => {
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
  if (data.file) {
    formData.append("File", data.file);
  }

  const response = await api.post(`/document/drafts?userId=${userId}`, formData, {
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
export const recreateDocument = async (id: string,  data: any) => {
  const response = await api.post(`/document/documents/${id}/versions`, data, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};
export const getDocuments = async (pageNumber = 1, pageSize = 10) => {
  const response = await api.get(`/document/documents?pageNumber=${pageNumber}&pageSize=${pageSize}`);
  return response.data.data.items;
};

export const getMyDocuments = async (userId: string, pageNumber = 1, pageSize = 10) => {
  const response = await api.get(`/document/my-documents?userId=${userId}&pageNumber=${pageNumber}&pageSize=${pageSize}`);
  return response.data.data;
};

export const getApprovalQueue = async (departmentId: string, pageNumber = 1, pageSize = 10) => {
  const response = await api.get(`/document/approval-queue/${departmentId}?pageNumber=${pageNumber}&pageSize=${pageSize}`);
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

