import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface Role {
  id: string;
  roleName: string;
  description: string;
  createAt: string;
  updateAt: string;
}

interface RoleResponse {
  size: number;
  page: number;
  total: number;
  totalPages: number;
  items: Role[];
}

interface RoleFilters {
  roleName?: string;
  description?: string;
  page?: number;
  size?: number;
  isAsc?: boolean;
}

export interface CreateRoleData {
  roleName: string;
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

const fetchRoles = async (filters: RoleFilters = {}): Promise<RoleResponse> => {
  const token = getAuthToken();
  if (!token) {
    throw new Error("No authentication token found");
  }

  const params = new URLSearchParams();
  params.append("page", (filters.page || 1).toString());
  params.append("size", (filters.size || 30).toString());
  params.append("isAsc", (filters.isAsc || true).toString());

  if (filters.roleName) params.append("roleName", filters.roleName);
  if (filters.description) params.append("description", filters.description);

  const response = await fetch(
    `https://production.docai.asia/api/auth/roles?${params}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch roles");
  }

  return response.json();
};

const createRole = async (data: CreateRoleData) => {
  const token = getAuthToken();
  if (!token) {
    throw new Error("No authentication token found");
  }

  const response = await fetch(
    `https://production.docai.asia/api/auth/create/role`,
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
    throw new Error("Failed to create role");
  }

  return response.json();
};

// Hook for filters (get all data)
export const useRoles = () => {
  return useQuery({
    queryKey: ["roles"],
    queryFn: () => fetchRoles({ size: 1000 }),
    staleTime: 5 * 60 * 1000,
  });
};

// Hook for table with pagination
export const useRolesPaginated = (filters: RoleFilters) => {
  return useQuery({
    queryKey: ["roles", "paginated", filters],
    queryFn: () => fetchRoles(filters),
    staleTime: 5 * 60 * 1000,
  });
};

// API function for manual calls
export const getRolesApi = fetchRoles;

export const useCreateRole = () => {
  return useMutation({
    mutationFn: createRole,
  });
};

// Get single role by ID
const fetchRoleById = async (roleId: string): Promise<Role> => {
  const token = getAuthToken();
  if (!token) {
    throw new Error("No authentication token found");
  }

  const response = await fetch(
    `https://production.docai.asia/api/auth/role/${roleId}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch role");
  }

  return response.json();
};

export const useRole = (roleId: string) => {
  return useQuery({
    queryKey: ["role", roleId],
    queryFn: () => fetchRoleById(roleId),
    enabled: !!roleId,
    staleTime: 5 * 60 * 1000,
  });
};

// Delete role
const deleteRole = async (roleId: string) => {
  const token = getAuthToken();
  if (!token) {
    throw new Error("No authentication token found");
  }

  const response = await fetch(
    `https://production.docai.asia/api/auth/delete/role?roleId=${roleId}`,
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
    throw new Error(errorData.message || "Failed to delete role");
  }

  return response.json();
};

export const useDeleteRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteRole,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
    },
  });
};

export interface UpdateRoleData {
  roleName: string;
  description: string;
}

const updateRole = async (roleId: string, data: UpdateRoleData) => {
  const token = getAuthToken();
  if (!token) {
    throw new Error("No authentication token found");
  }

  const response = await fetch(
    `https://production.docai.asia/api/auth/update/role?roleId=${roleId}`,
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
    throw new Error(errorData.message || "Failed to update role");
  }

  return response.json();
};

export const useUpdateRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ roleId, data }: { roleId: string; data: UpdateRoleData }) =>
      updateRole(roleId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
    },
  });
};
