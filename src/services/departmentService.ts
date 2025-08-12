import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface Department {
  id: string;
  name: string;
  description: string;
  createAt: string;
  updateAt: string;
}

interface DepartmentResponse {
  size: number;
  page: number;
  total: number;
  totalPages: number;
  items: Department[];
}

interface DepartmentFilters {
  name?: string;
  description?: string;
  page?: number;
  size?: number;
  isAsc?: boolean;
}

export interface CreateDepartmentData {
  departmentName: string;
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

const fetchDepartments = async (
  filters: DepartmentFilters = {}
): Promise<DepartmentResponse> => {
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
    `https://production.docai.asia/api/auth/departments?${params}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch departments");
  }

  return response.json();
};

const createDepartment = async (data: CreateDepartmentData) => {
  const token = getAuthToken();
  if (!token) {
    throw new Error("No authentication token found");
  }

  const response = await fetch(
    `https://production.docai.asia/api/auth/create/department`,
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
    throw new Error("Failed to create department");
  }

  return response.json();
};

// Hook for filters (get all data)
export const useDepartments = () => {
  return useQuery({
    queryKey: ["departments"],
    queryFn: () => fetchDepartments({ size: 1000 }),
    staleTime: 5 * 60 * 1000,
  });
};

// Hook for table with pagination
export const useDepartmentsPaginated = (filters: DepartmentFilters) => {
  return useQuery({
    queryKey: ["departments", "paginated", filters],
    queryFn: () => fetchDepartments(filters),
    staleTime: 5 * 60 * 1000,
  });
};

// API function for manual calls
export const getDepartmentsApi = fetchDepartments;

export const useCreateDepartment = () => {
  return useMutation({
    mutationFn: createDepartment,
  });
};

// Get single department by ID
const fetchDepartmentById = async (
  departmentId: string
): Promise<Department> => {
  const token = getAuthToken();
  if (!token) {
    throw new Error("No authentication token found");
  }

  const response = await fetch(
    `https://production.docai.asia/api/auth/department/${departmentId}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch department");
  }

  return response.json();
};

export const useDepartment = (departmentId: string) => {
  return useQuery({
    queryKey: ["department", departmentId],
    queryFn: () => fetchDepartmentById(departmentId),
    enabled: !!departmentId,
    staleTime: 5 * 60 * 1000,
  });
};

// Delete department
const deleteDepartment = async (departmentId: string) => {
  const token = getAuthToken();
  if (!token) {
    throw new Error("No authentication token found");
  }

  const response = await fetch(
    `https://production.docai.asia/api/auth/delete/department?departmentId=${departmentId}`,
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
    throw new Error(errorData.message || "Failed to delete department");
  }

  return response.json();
};

export const useDeleteDepartment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteDepartment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments"] });
    },
  });
};

export interface UpdateDepartmentData {
  departmentName: string;
  description: string;
}

const updateDepartment = async (
  departmentId: string,
  data: UpdateDepartmentData
) => {
  const token = getAuthToken();
  if (!token) {
    throw new Error("No authentication token found");
  }

  const response = await fetch(
    `https://production.docai.asia/api/auth/update/department?departmentId=${departmentId}`,
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
    throw new Error(errorData.message || "Failed to update department");
  }

  return response.json();
};

export const useUpdateDepartment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      departmentId,
      data,
    }: {
      departmentId: string;
      data: UpdateDepartmentData;
    }) => updateDepartment(departmentId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments"] });
    },
  });
};
