import { useQuery } from "@tanstack/react-query";

export interface RoleUserData {
  roleId: string;
  roleName: string;
  userCount: number;
  color: string;
}

const getAuthToken = () => {
  const user = localStorage.getItem("user");
  if (user) {
    const userData = JSON.parse(user);
    return userData.docaiToken;
  }
  return null;
};

// Fetch users count by role ID
const fetchUsersByRole = async (roleId: string): Promise<number> => {
  const token = getAuthToken();
  if (!token) {
    throw new Error("No authentication token found");
  }

  const params = new URLSearchParams({
    page: "1",
    size: "1000", // Get all users to count them
    RoleId: roleId,
    isAsc: "true",
  });

  const response = await fetch(
    `http://localhost:5000/api/auth/users?${params}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch users for role ${roleId}`);
  }

  const result = await response.json();
  return result.total || 0;
};

// Fetch role user distribution
const fetchRoleUserDistribution = async (): Promise<RoleUserData[]> => {
  const token = getAuthToken();
  if (!token) {
    throw new Error("No authentication token found");
  }

  // First, get all roles
  const rolesResponse = await fetch(
    `http://localhost:5000/api/auth/roles?page=1&size=1000&isAsc=true`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!rolesResponse.ok) {
    throw new Error("Failed to fetch roles");
  }

  const rolesData = await rolesResponse.json();
  const roles = rolesData.items || [];

  // Color palette for roles
  const colors = [
    "#6366F1", // Blue
    "#8B5CF6", // Purple
    "#EC4899", // Pink
    "#10B981", // Green
    "#F59E0B", // Yellow
    "#EF4444", // Red
    "#06B6D4", // Cyan
    "#84CC16", // Lime
    "#F97316", // Orange
    "#8B5A2B", // Brown
  ];

  // Fetch user count for each role
  const roleUserData: RoleUserData[] = [];
  
  for (let i = 0; i < roles.length; i++) {
    const role = roles[i];
    try {
      const userCount = await fetchUsersByRole(role.id);
      roleUserData.push({
        roleId: role.id,
        roleName: role.roleName,
        userCount,
        color: colors[i % colors.length],
      });
    } catch (error) {
      console.error(`Error fetching users for role ${role.roleName}:`, error);
      // Add role with 0 users if API fails
      roleUserData.push({
        roleId: role.id,
        roleName: role.roleName,
        userCount: 0,
        color: colors[i % colors.length],
      });
    }
  }

  // Filter out roles with 0 users and sort by user count
  return roleUserData
    .filter(role => role.userCount > 0)
    .sort((a, b) => b.userCount - a.userCount);
};

// React Query hook
export const useRoleUserDistribution = () => {
  return useQuery({
    queryKey: ["roleUserDistribution"],
    queryFn: fetchRoleUserDistribution,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 60 * 1000, // Refetch every 10 minutes
  });
};
