import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

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

interface DocumentTypeResponse {
  size: number;
  page: number;
  total: number;
  totalPages: number;
  items: DocumentType[];
}

interface DocumentTypeFilters {
  name?: string;
  description?: string;
  pageNumber?: number;
  pageSize?: number;
}

const getAuthToken = () => {
  const user = localStorage.getItem("user");
  if (user) {
    const userData = JSON.parse(user);
    return userData.docaiToken;
  }
  return null;
};

const fetchDocumentTypes = async (
  filters: DocumentTypeFilters = {}
): Promise<DocumentTypeResponse> => {
  const token = getAuthToken();
  if (!token) {
    throw new Error("No authentication token found");
  }

  const params = new URLSearchParams();
  params.append("pageNumber", (filters.pageNumber || 1).toString());
  params.append("pageSize", (filters.pageSize || 10).toString());

  if (filters.name) params.append("name", filters.name);
  if (filters.description) params.append("description", filters.description);

  const response = await fetch(
    `https://production.docai.asia/api/document/document-types?${params}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch document types");
  }

  const result = await response.json();
  return result.data;
};

// Hook for filters (get all data)
export const useDocumentTypes = () => {
  return useQuery({
    queryKey: ["documentTypes"],
    queryFn: () => fetchDocumentTypes({ pageSize: 1000 }),
    staleTime: 5 * 60 * 1000,
  });
};

// Hook for table with pagination
export const useDocumentTypesPaginated = (filters: DocumentTypeFilters) => {
  return useQuery({
    queryKey: ["documentTypes", "paginated", filters],
    queryFn: () => fetchDocumentTypes(filters),
    staleTime: 5 * 60 * 1000,
  });
};

// API function for manual calls
export const getDocumentTypesApi = fetchDocumentTypes;

export interface CreateDocumentTypeData {
  name: string;
  description: string;
}

export interface UpdateDocumentTypeData {
  name: string;
  description: string;
}

const createDocumentType = async (data: CreateDocumentTypeData) => {
  const token = getAuthToken();
  if (!token) {
    throw new Error("No authentication token found");
  }

  const response = await fetch(
    `https://production.docai.asia/api/document/document-types`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to create document type");
  }

  const result = await response.json();
  return result.data;
};

const updateDocumentType = async (
  documentTypeId: string,
  data: UpdateDocumentTypeData
) => {
  const token = getAuthToken();
  if (!token) {
    throw new Error("No authentication token found");
  }

  const response = await fetch(
    `https://production.docai.asia/api/document/document-types/${documentTypeId}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to update document type");
  }

  const result = await response.json();
  return result.data;
};

// Get single document type by ID
const fetchDocumentTypeById = async (
  documentTypeId: string
): Promise<DocumentType> => {
  const token = getAuthToken();
  if (!token) {
    throw new Error("No authentication token found");
  }

  const response = await fetch(
    `https://production.docai.asia/api/document/document-types/${documentTypeId}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch document type");
  }

  const result = await response.json();
  return result.data;
};

export const useCreateDocumentType = () => {
  return useMutation({
    mutationFn: createDocumentType,
  });
};

export const useUpdateDocumentType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      documentTypeId,
      data,
    }: {
      documentTypeId: string;
      data: UpdateDocumentTypeData;
    }) => updateDocumentType(documentTypeId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documentTypes"] });
    },
  });
};

export const useDocumentType = (documentTypeId: string) => {
  return useQuery({
    queryKey: ["documentType", documentTypeId],
    queryFn: () => fetchDocumentTypeById(documentTypeId),
    enabled: !!documentTypeId,
    staleTime: 5 * 60 * 1000,
  });
};

// Delete document type
const deleteDocumentType = async (documentTypeId: string) => {
  const token = getAuthToken();
  if (!token) {
    throw new Error("No authentication token found");
  }

  const response = await fetch(
    `https://production.docai.asia/api/document/document-types/${documentTypeId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to delete document type");
  }

  return response.json();
};

export const useDeleteDocumentType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteDocumentType,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documentTypes"] });
    },
  });
};
