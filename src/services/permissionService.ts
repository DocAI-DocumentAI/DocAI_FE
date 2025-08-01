import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface Permission {
  id: string;
  name: string;
  description: string;
  createAt: string;
  updateAt: string;
}

interface PermissionResponse {
  size: number;
  page: number;
  total: number;
  totalPages: number;
  items: Permission[];
}

interface PermissionFilters {
  name?: string;
  description?: string;
  page?: number;
  size?: number;
  isAsc?: boolean;
}

export interface CreatePermissionData {
  permissionName: string;
  description: string;
}

const getAuthToken = () => {
  const user = localStorage.getItem("user");
  if (user) {
    const userData = JSON.parse(user);
    return userData.docaiToken;
  }
  return null;
};

const fetchPermissions = async (
  filters: PermissionFilters = {}
): Promise<PermissionResponse> => {
  const token = getAuthToken();
  if (!token) {
    throw new Error("No authentication token found");
  }

  const params = new URLSearchParams();
  params.append("page", (filters.page || 1).toString());
  params.append("size", (filters.size || 30).toString());
  params.append("isAsc", (filters.isAsc || true).toString());

  if (filters.name) params.append("name", filters.name);
  if (filters.description) params.append("description", filters.description);

  const response = await fetch(
    `${
      import.meta.env.VITE_API_BASE_URL_PRODUCTION
    }/auth/permissions?${params}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch permissions");
  }

  return response.json();
};

const createPermission = async (data: CreatePermissionData) => {
  const token = getAuthToken();
  if (!token) {
    throw new Error("No authentication token found");
  }

  const response = await fetch(
    `${import.meta.env.VITE_API_BASE_URL_PRODUCTION}/auth/create/permission`,
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
    throw new Error("Failed to create permission");
  }

  return response.json();
};

// Hook for filters (get all data)
export const usePermissions = () => {
  return useQuery({
    queryKey: ["permissions"],
    queryFn: () => fetchPermissions({ size: 1000 }),
    staleTime: 5 * 60 * 1000,
  });
};

// Hook for table with pagination
export const usePermissionsPaginated = (filters: PermissionFilters) => {
  return useQuery({
    queryKey: ["permissions", "paginated", filters],
    queryFn: () => fetchPermissions(filters),
    staleTime: 5 * 60 * 1000,
  });
};

// API function for manual calls
export const getPermissionsApi = fetchPermissions;

export const useCreatePermission = () => {
  return useMutation({
    mutationFn: createPermission,
  });
};

// Get single permission by ID
const fetchPermissionById = async (
  permissionId: string
): Promise<Permission> => {
  const token = getAuthToken();
  if (!token) {
    throw new Error("No authentication token found");
  }

  const response = await fetch(
    `${
      import.meta.env.VITE_API_BASE_URL_PRODUCTION
    }/auth/permission/${permissionId}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch permission");
  }

  return response.json();
};

export const usePermission = (permissionId: string) => {
  return useQuery({
    queryKey: ["permission", permissionId],
    queryFn: () => fetchPermissionById(permissionId),
    enabled: !!permissionId,
    staleTime: 5 * 60 * 1000,
  });
};

export interface UpdatePermissionData {
  permissionName: string;
  description: string;
}

const updatePermission = async (
  permissionId: string,
  data: UpdatePermissionData
) => {
  const token = getAuthToken();
  if (!token) {
    throw new Error("No authentication token found");
  }

  const response = await fetch(
    `${
      import.meta.env.VITE_API_BASE_URL_PRODUCTION
    }/auth/update/permission?permissionId=${permissionId}`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to update permission");
  }

  return response.json();
};

export const useUpdatePermission = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      permissionId,
      data,
    }: {
      permissionId: string;
      data: UpdatePermissionData;
    }) => updatePermission(permissionId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["permissions"] });
    },
  });
};
