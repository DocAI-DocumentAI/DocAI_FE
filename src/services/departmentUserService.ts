import { useQuery } from "@tanstack/react-query";

export interface DepartmentUserData {
  departmentId: string;
  departmentName: string;
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

// Fetch users count by department ID
const fetchUsersByDepartment = async (
  departmentId: string
): Promise<number> => {
  const token = getAuthToken();
  if (!token) {
    throw new Error("No authentication token found");
  }

  const params = new URLSearchParams({
    page: "1",
    size: "1000", // Get all users to count them
    DepartmentId: departmentId,
    isAsc: "true",
  });

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
    throw new Error(`Failed to fetch users for department ${departmentId}`);
  }

  const result = await response.json();
  return result.total || 0;
};

// Fetch department user distribution
const fetchDepartmentUserDistribution = async (): Promise<
  DepartmentUserData[]
> => {
  const token = getAuthToken();
  if (!token) {
    throw new Error("No authentication token found");
  }

  // First, get all departments
  const departmentsResponse = await fetch(
    `https://production.docai.asia/api/auth/departments?page=1&size=1000&isAsc=true`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!departmentsResponse.ok) {
    throw new Error("Failed to fetch departments");
  }

  const departmentsData = await departmentsResponse.json();
  const departments = departmentsData.items || [];

  // Color palette for departments
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

  // Fetch user count for each department
  const departmentUserData: DepartmentUserData[] = [];

  for (let i = 0; i < departments.length; i++) {
    const department = departments[i];
    try {
      const userCount = await fetchUsersByDepartment(department.id);
      departmentUserData.push({
        departmentId: department.id,
        departmentName: department.name,
        userCount,
        color: colors[i % colors.length],
      });
    } catch (error) {
      console.error(
        `Error fetching users for department ${department.name}:`,
        error
      );
      // Add department with 0 users if API fails
      departmentUserData.push({
        departmentId: department.id,
        departmentName: department.name,
        userCount: 0,
        color: colors[i % colors.length],
      });
    }
  }

  // Filter out departments with 0 users and sort by user count
  return departmentUserData
    .filter((dept) => dept.userCount > 0)
    .sort((a, b) => b.userCount - a.userCount);
};

// React Query hook
export const useDepartmentUserDistribution = () => {
  return useQuery({
    queryKey: ["departmentUserDistribution"],
    queryFn: fetchDepartmentUserDistribution,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 60 * 1000, // Refetch every 10 minutes
  });
};
