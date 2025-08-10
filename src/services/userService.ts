import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface UserFilters {
  email?: string;
  fullName?: string;
  phone?: string;
  roleId?: string;
  departmentId?: string;
  createdFrom?: string;
  createdTo?: string;
  permissionId?: string;
  page?: number;
  size?: number;
  isAsc?: boolean;
}

interface UserResponse {
  size: number;
  page: number;
  total: number;
  totalPages: number;
  items: User[];
}

interface User {
  id: string;
  email: string;
  phone: string;
  fullName: string;
  active: boolean;
  role: {
    id: string;
    roleName: string;
    description: string;
    createAt: string;
    updateAt: string;
  };
  permissions: Array<{
    id: string;
    name: string;
    description: string;
    createAt: string;
    updateAt: string;
  }>;
  department: {
    id: string;
    name: string;
    description: string;
    createAt: string;
    updateAt: string;
  };
  userSetting: {
    id: string;
    twoFactorEnabled: boolean;
    twoFactorMethod: string;
    notificationsEnabled: boolean;
    updateAt: string;
  };
  creatAt: string;
  updateAt: string;
}

const getAuthToken = () => {
  const user = localStorage.getItem("user");
  if (user) {
    const userData = JSON.parse(user);
    return userData.docaiToken;
  }
  return null;
};

const fetchUsers = async (filters: UserFilters = {}): Promise<UserResponse> => {
  const token = getAuthToken();
  if (!token) {
    throw new Error("No authentication token found");
  }

  const params = new URLSearchParams();
  params.append("page", (filters.page || 1).toString());
  params.append("size", (filters.size || 30).toString());
  params.append("isAsc", (filters.isAsc || true).toString());

  if (filters.email) params.append("email", filters.email);
  if (filters.fullName) params.append("fullName", filters.fullName);
  if (filters.phone) params.append("phone", filters.phone);
  if (filters.roleId) params.append("roleId", filters.roleId);
  if (filters.departmentId) params.append("departmentId", filters.departmentId);
  if (filters.createdFrom) params.append("createdFrom", filters.createdFrom);
  if (filters.createdTo) params.append("createdTo", filters.createdTo);
  if (filters.permissionId) params.append("permissionId", filters.permissionId);

  const response = await fetch(
    `https://production.docai.asia/api/auth/users?${params}`,
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

  return response.json();
};

// Hook for table with pagination
export const useUsersPaginated = (filters: UserFilters) => {
  return useQuery({
    queryKey: ["users", "paginated", filters],
    queryFn: () => fetchUsers(filters),
    staleTime: 5 * 60 * 1000,
  });
};

// API function for manual calls
export const getUsersApi = fetchUsers;

interface CreateUserData {
  password: string;
  email: string;
  phone: string;
  fullName: string;
  roleId: string;
  departmentId: string;
  permissionIds: string[];
}

const createUser = async (userData: CreateUserData): Promise<User> => {
  const token = getAuthToken();
  if (!token) {
    throw new Error("No authentication token found");
  }

  const response = await fetch(
    `https://production.docai.asia/api/auth/create-user`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to create user");
  }

  return response.json();
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      // Invalidate users queries to refresh the list
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
};

// Get single user by ID
const fetchUserById = async (userId: string): Promise<User> => {
  const token = getAuthToken();
  if (!token) {
    throw new Error("No authentication token found");
  }

  const response = await fetch(
    `https://production.docai.asia/api/auth/user/${userId}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch user");
  }

  return response.json();
};

export const useUser = (userId: string) => {
  return useQuery({
    queryKey: ["user", userId],
    queryFn: () => fetchUserById(userId),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });
};

interface UpdateUserData {
  fullName: string;
  phone: string;
  email: string;
  roleId: string;
  departmentId: string;
  active: boolean;
  requirePasswordChange: boolean;
  permissionIds: string[];
}

const updateUser = async (
  userId: string,
  userData: UpdateUserData
): Promise<User> => {
  const token = getAuthToken();
  if (!token) {
    throw new Error("No authentication token found");
  }

  const response = await fetch(
    `https://production.docai.asia/api/auth/admin/users?userId=${userId}`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to update user");
  }

  return response.json();
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      userData,
    }: {
      userId: string;
      userData: UpdateUserData;
    }) => updateUser(userId, userData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
};

export type { User, UserFilters, UserResponse, CreateUserData, UpdateUserData };
