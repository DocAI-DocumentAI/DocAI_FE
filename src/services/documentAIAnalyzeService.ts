import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface DocumentAIAnalyzeConfig {
  id: string;
  modelName: string;
  modelId: string;
  maxToken: number;
  systemPrompt: string;
  isDefault: boolean;
  createdTime: string;
  lastUpdatedTime: string | null;
  createdBy: string;
  lastUpdatedBy: string | null;
  createdByName: string | null;
  lastUpdatedByName: string | null;
}

export interface CreateDocumentAIAnalyzeConfigRequest {
  modelName: string;
  modelId: string;
  maxToken: number;
  systemPrompt: string;
  isDefault: boolean;
}

export interface UpdateDocumentAIAnalyzeConfigRequest extends CreateDocumentAIAnalyzeConfigRequest {}

export interface DocumentAIAnalyzeConfigResponse {
  statusCode: number;
  errorCode: string | null;
  message: string;
  data: DocumentAIAnalyzeConfig[] | DocumentAIAnalyzeConfig;
}

const getAuthToken = () => {
  const user = localStorage.getItem("user");
  if (user) {
    const userData = JSON.parse(user);
    return userData.docaiToken;
  }
  return null;
};

const fetchDocumentAIAnalyzeConfigs = async (): Promise<DocumentAIAnalyzeConfig[]> => {
  const token = getAuthToken();
  if (!token) {
    throw new Error("No authentication token found");
  }

  const response = await fetch(
    "https://production.docai.asia/api/document/ai-configurations",
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message || `HTTP error! status: ${response.status}`
    );
  }

  const result: DocumentAIAnalyzeConfigResponse = await response.json();
  return Array.isArray(result.data) ? result.data : [];
};

const fetchDefaultDocumentAIAnalyzeConfig = async (): Promise<DocumentAIAnalyzeConfig | null> => {
  const token = getAuthToken();
  if (!token) {
    throw new Error("No authentication token found");
  }

  const response = await fetch(
    "https://production.docai.asia/api/document/ai-configurations/default",
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message || `HTTP error! status: ${response.status}`
    );
  }

  const result: DocumentAIAnalyzeConfigResponse = await response.json();
  return !Array.isArray(result.data) ? result.data : null;
};

const fetchDocumentAIAnalyzeConfigById = async (id: string): Promise<DocumentAIAnalyzeConfig> => {
  const token = getAuthToken();
  if (!token) {
    throw new Error("No authentication token found");
  }

  const response = await fetch(
    `https://production.docai.asia/api/document/ai-configurations/${id}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message || `HTTP error! status: ${response.status}`
    );
  }

  const result: DocumentAIAnalyzeConfigResponse = await response.json();
  return result.data as DocumentAIAnalyzeConfig;
};

const createDocumentAIAnalyzeConfig = async (
  data: CreateDocumentAIAnalyzeConfigRequest
): Promise<DocumentAIAnalyzeConfig> => {
  const token = getAuthToken();
  if (!token) {
    throw new Error("No authentication token found");
  }

  const response = await fetch(
    "https://production.docai.asia/api/document/ai-configurations",
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
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message || `HTTP error! status: ${response.status}`
    );
  }

  const result: DocumentAIAnalyzeConfigResponse = await response.json();
  return result.data as DocumentAIAnalyzeConfig;
};

const updateDocumentAIAnalyzeConfig = async ({
  id,
  data,
}: {
  id: string;
  data: UpdateDocumentAIAnalyzeConfigRequest;
}): Promise<DocumentAIAnalyzeConfig> => {
  const token = getAuthToken();
  if (!token) {
    throw new Error("No authentication token found");
  }

  const response = await fetch(
    `https://production.docai.asia/api/document/ai-configurations/${id}`,
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
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message || `HTTP error! status: ${response.status}`
    );
  }

  const result: DocumentAIAnalyzeConfigResponse = await response.json();
  return result.data as DocumentAIAnalyzeConfig;
};

const deleteDocumentAIAnalyzeConfig = async (id: string): Promise<void> => {
  const token = getAuthToken();
  if (!token) {
    throw new Error("No authentication token found");
  }

  const response = await fetch(
    `https://production.docai.asia/api/document/ai-configurations/${id}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message || `HTTP error! status: ${response.status}`
    );
  }
};

const setDefaultDocumentAIAnalyzeConfig = async (id: string): Promise<void> => {
  const token = getAuthToken();
  if (!token) {
    throw new Error("No authentication token found");
  }

  const response = await fetch(
    `https://production.docai.asia/api/document/ai-configurations/${id}/set-default`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message || `HTTP error! status: ${response.status}`
    );
  }
};

// React Query Hooks
export const useDocumentAIAnalyzeConfigs = () => {
  return useQuery({
    queryKey: ["documentAIAnalyzeConfigs"],
    queryFn: fetchDocumentAIAnalyzeConfigs,
  });
};

export const useDefaultDocumentAIAnalyzeConfig = () => {
  return useQuery({
    queryKey: ["defaultDocumentAIAnalyzeConfig"],
    queryFn: fetchDefaultDocumentAIAnalyzeConfig,
  });
};

export const useDocumentAIAnalyzeConfigById = (id: string) => {
  return useQuery({
    queryKey: ["documentAIAnalyzeConfig", id],
    queryFn: () => fetchDocumentAIAnalyzeConfigById(id),
    enabled: !!id,
  });
};

export const useCreateDocumentAIAnalyzeConfig = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createDocumentAIAnalyzeConfig,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documentAIAnalyzeConfigs"] });
      queryClient.invalidateQueries({ queryKey: ["defaultDocumentAIAnalyzeConfig"] });
    },
  });
};

export const useUpdateDocumentAIAnalyzeConfig = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateDocumentAIAnalyzeConfig,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documentAIAnalyzeConfigs"] });
      queryClient.invalidateQueries({ queryKey: ["defaultDocumentAIAnalyzeConfig"] });
    },
  });
};

export const useDeleteDocumentAIAnalyzeConfig = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteDocumentAIAnalyzeConfig,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documentAIAnalyzeConfigs"] });
      queryClient.invalidateQueries({ queryKey: ["defaultDocumentAIAnalyzeConfig"] });
    },
  });
};

export const useSetDefaultDocumentAIAnalyzeConfig = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: setDefaultDocumentAIAnalyzeConfig,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documentAIAnalyzeConfigs"] });
      queryClient.invalidateQueries({ queryKey: ["defaultDocumentAIAnalyzeConfig"] });
    },
  });
};
