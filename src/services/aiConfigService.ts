import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface AIConfig {
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

export interface CreateAIConfigRequest {
  modelName: string;
  modelId: string;
  maxToken: number;
  systemPrompt: string;
  isDefault: boolean;
}

export interface UpdateAIConfigRequest extends CreateAIConfigRequest {}

const getAuthToken = () => {
  const user = localStorage.getItem("user");
  if (user) {
    const userData = JSON.parse(user);
    return userData.docaiToken;
  }
  return null;
};

const fetchAIConfigs = async (): Promise<AIConfig[]> => {
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

  const result = await response.json();
  return result.data;
};

const createAIConfig = async (
  data: CreateAIConfigRequest
): Promise<AIConfig> => {
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

  return response.json();
};

const updateAIConfig = async ({
  id,
  data,
}: {
  id: string;
  data: UpdateAIConfigRequest;
}): Promise<AIConfig> => {
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

  return response.json();
};

const deleteAIConfig = async (id: string): Promise<void> => {
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

const setDefaultAIConfig = async (id: string): Promise<void> => {
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

export const useAIConfigs = () => {
  return useQuery({
    queryKey: ["aiConfigs"],
    queryFn: fetchAIConfigs,
  });
};

export const useCreateAIConfig = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createAIConfig,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["aiConfigs"] });
    },
  });
};

export const useUpdateAIConfig = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateAIConfig,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["aiConfigs"] });
    },
  });
};

export const useDeleteAIConfig = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteAIConfig,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["aiConfigs"] });
    },
  });
};

export const useSetDefaultAIConfig = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: setDefaultAIConfig,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["aiConfigs"] });
    },
  });
};

