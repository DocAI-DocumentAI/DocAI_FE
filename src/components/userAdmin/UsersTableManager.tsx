import { useState } from "react";
import { motion } from "framer-motion";
import { Filter, Eye } from "lucide-react";
import { useUsersPaginated } from "../../services/userService";
import { usePermissions } from "../../services/permissionService";
import { useRoles } from "../../services/roleService";
import { useSelector } from "react-redux";
import { RootState } from "../../store";
import toast from "react-hot-toast";
import React from "react";

interface Filters {
  email: string;
  fullName: string;
  phone: string;
  roleId: string;
  createdFrom: string;
  createdTo: string;
  permissionId: string;
}

const UsersTableManager: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showFilters, setShowFilters] = useState(false);
  const [expandedUser, setExpandedUser] = useState<string | null>(null);

  // Get current manager's department ID
  const { user } = useSelector((state: RootState) => state.auth);
  const managerDepartmentId = user?.department?.id;

  const [filters, setFilters] = useState<Filters>({
    email: "",
    fullName: "",
    phone: "",
    roleId: "",
    createdFrom: "",
    createdTo: "",
    permissionId: "",
  });

  // React Query hooks - always filter by manager's department
  const {
    data: usersData,
    isLoading,
    isError,
    error,
  } = useUsersPaginated({
    ...Object.fromEntries(
      Object.entries(filters).filter(([_, value]) => value !== "")
    ),
    departmentId: managerDepartmentId, // Always filter by manager's department
    page: currentPage,
    size: pageSize,
  });

  const { data: permissions } = usePermissions();
  const { data: roles } = useRoles();

  const handleFilterChange = (key: keyof Filters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1); // Reset to first page when filtering
  };

  const clearFilters = () => {
    setFilters({
      email: "",
      fullName: "",
      phone: "",
      roleId: "",
      createdFrom: "",
      createdTo: "",
      permissionId: "",
    });
    setCurrentPage(1);
  };

  const toggleUserExpansion = (userId: string) => {
    setExpandedUser(expandedUser === userId ? null : userId);
  };

  if (isError) {
    toast.error(`Error loading users: ${error?.message}`);
  }

  if (!managerDepartmentId) {
    return (
      <div className="p-6 bg-gray-800 bg-opacity-50 border border-gray-700 shadow-lg backdrop-blur-md rounded-xl">
        <div className="text-center text-red-400">
          Error: Manager department not found. Please contact administrator.
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="p-6 bg-gray-800 bg-opacity-50 border border-gray-700 shadow-lg backdrop-blur-md rounded-xl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-100">
          Department Users - {user?.department?.name}
        </h2>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              showFilters
                ? "bg-blue-600 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            <Filter className="w-4 h-4" />
            Filters
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <motion.div
          className="p-4 mb-6 border border-gray-600 rounded-lg bg-gray-700/50"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-300">
                Email
              </label>
              <input
                type="text"
                value={filters.email}
                onChange={(e) => handleFilterChange("email", e.target.value)}
                className="w-full px-3 py-2 text-white bg-gray-600 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Search by email..."
              />
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-gray-300">
                Full Name
              </label>
              <input
                type="text"
                value={filters.fullName}
                onChange={(e) => handleFilterChange("fullName", e.target.value)}
                className="w-full px-3 py-2 text-white bg-gray-600 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Search by name..."
              />
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-gray-300">
                Phone
              </label>
              <input
                type="text"
                value={filters.phone}
                onChange={(e) => handleFilterChange("phone", e.target.value)}
                className="w-full px-3 py-2 text-white bg-gray-600 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Search by phone..."
              />
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-gray-300">
                Role
              </label>
              <select
                value={filters.roleId}
                onChange={(e) => handleFilterChange("roleId", e.target.value)}
                className="w-full px-3 py-2 text-white bg-gray-600 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Roles</option>
                {roles?.items
                  ?.filter((role) => role.roleName !== "Admin") // Manager không được filter role Admin
                  ?.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.roleName}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-gray-300">
                Permission
              </label>
              <select
                value={filters.permissionId}
                onChange={(e) =>
                  handleFilterChange("permissionId", e.target.value)
                }
                className="w-full px-3 py-2 text-white bg-gray-600 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Permissions</option>
                {permissions?.items?.map((permission) => (
                  <option key={permission.id} value={permission.id}>
                    {permission.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-gray-300">
                Created From
              </label>
              <input
                type="date"
                value={filters.createdFrom}
                onChange={(e) =>
                  handleFilterChange("createdFrom", e.target.value)
                }
                className="w-full px-3 py-2 text-white bg-gray-600 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-gray-300">
                Created To
              </label>
              <input
                type="date"
                value={filters.createdTo}
                onChange={(e) =>
                  handleFilterChange("createdTo", e.target.value)
                }
                className="w-full px-3 py-2 text-white bg-gray-600 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-end mt-4">
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-gray-300 transition-colors bg-gray-600 rounded-md hover:bg-gray-500"
            >
              Clear Filters
            </button>
          </div>
        </motion.div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <div className="w-8 h-8 border-2 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
        </div>
      )}

      {/* Users Table */}
      {!isLoading && usersData && (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-300">
              <thead className="text-xs text-gray-400 uppercase bg-gray-700">
                <tr>
                  <th className="px-6 py-3">User</th>
                  <th className="px-6 py-3">Role</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Created</th>
                  <th className="px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {usersData.items
                  .filter((user) => user.role.roleName !== "Admin") // Manager không được xem users có role Admin
                  .map((user) => (
                    <React.Fragment key={user.id}>
                      <tr className="border-b border-gray-700 hover:bg-gray-700/50">
                        <td className="px-6 py-4">
                          <div>
                            <div className="font-medium text-white">
                              {user.fullName}
                            </div>
                            <div className="text-gray-400">{user.email}</div>
                            <div className="text-gray-500">{user.phone}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-blue-300 bg-blue-900 bg-opacity-50 rounded-full">
                            {user.role.roleName}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                              user.active
                                ? "text-green-300 bg-green-900 bg-opacity-50"
                                : "text-red-300 bg-red-900 bg-opacity-50"
                            }`}
                          >
                            {user.active ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-400">
                          {new Date(user.creatAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => toggleUserExpansion(user.id)}
                            className="p-2 text-gray-400 transition-colors rounded-md hover:text-blue-400 hover:bg-blue-900 hover:bg-opacity-20"
                            title="View details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>

                      {/* Expanded Row */}
                      {expandedUser === user.id && (
                        <tr className="border-b border-gray-700 bg-gray-800/50">
                          <td colSpan={5} className="px-6 py-4">
                            <div className="space-y-4">
                              <h4 className="font-medium text-white">
                                User Details
                              </h4>
                              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div>
                                  <h5 className="mb-2 font-medium text-gray-300">
                                    Permissions
                                  </h5>
                                  <div className="flex flex-wrap gap-2">
                                    {user.permissions.map((permission) => (
                                      <span
                                        key={permission.id}
                                        className="inline-flex items-center px-2 py-1 text-xs font-medium text-purple-300 bg-purple-900 bg-opacity-50 rounded-full"
                                      >
                                        {permission.name}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                                <div>
                                  <h5 className="mb-2 font-medium text-gray-300">
                                    Department
                                  </h5>
                                  <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-yellow-300 bg-yellow-900 bg-opacity-50 rounded-full">
                                    {user.department.name}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-6">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">Show</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-3 py-1 text-white bg-gray-600 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
              <span className="text-sm text-gray-400">entries</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">
                Showing {(currentPage - 1) * pageSize + 1} to{" "}
                {Math.min(currentPage * pageSize, usersData.total)} of{" "}
                {usersData.total} entries
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 text-gray-300 bg-gray-600 rounded-md hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="px-3 py-1 text-white bg-blue-600 rounded-md">
                {currentPage}
              </span>
              <button
                onClick={() =>
                  setCurrentPage(
                    Math.min(usersData.totalPages, currentPage + 1)
                  )
                }
                disabled={currentPage === usersData.totalPages}
                className="px-3 py-1 text-gray-300 bg-gray-600 rounded-md hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}

      {/* Empty State */}
      {!isLoading && usersData && usersData.items.length === 0 && (
        <div className="py-8 text-center text-gray-400">
          No users found in your department.
        </div>
      )}
    </motion.div>
  );
};

export default UsersTableManager;
