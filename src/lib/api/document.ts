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

export const getDocuments = async (pageNumber = 1, pageSize = 10) => {
  const response = await api.get(`/document/documents?pageNumber=${pageNumber}&pageSize=${pageSize}`);
  return response.data.data.items;
};

