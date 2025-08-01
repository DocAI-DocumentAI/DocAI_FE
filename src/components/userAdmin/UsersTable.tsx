import { useState } from "react";
import { motion } from "framer-motion";
import { Filter, Eye, Plus } from "lucide-react";
import { useUsersPaginated } from "../../services/userService";
import { useDepartments } from "../../services/departmentService";
import { usePermissions } from "../../services/permissionService";
import { useRoles } from "../../services/roleService";
import toast from "react-hot-toast";
import React from "react";
import { useNavigate } from "react-router-dom";

interface Filters {
  email: string;
  fullName: string;
  phone: string;
  roleId: string;
  departmentId: string;
  createdFrom: string;
  createdTo: string;
  permissionId: string;
}

const UsersTable: React.FC = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showFilters, setShowFilters] = useState(false);
  const [expandedUser, setExpandedUser] = useState<string | null>(null);

  const [filters, setFilters] = useState<Filters>({
    email: "",
    fullName: "",
    phone: "",
    roleId: "",
    departmentId: "",
    createdFrom: "",
    createdTo: "",
    permissionId: "",
  });

  // React Query hooks
  const {
    data: usersData,
    isLoading,
    isError,
    error,
  } = useUsersPaginated({
    ...Object.fromEntries(
      Object.entries(filters).filter(([_, value]) => value !== "")
    ),
    page: currentPage,
    size: pageSize,
  });

  const { data: departmentsData, isError: departmentsError } = useDepartments();
  const { data: permissionsData, isError: permissionsError } = usePermissions();
  const { data: rolesData, isError: rolesError } = useRoles();

  // Handle errors
  if (departmentsError) toast.error("Failed to load departments");
  if (permissionsError) toast.error("Failed to load permissions");
  if (rolesError) toast.error("Failed to load roles");
  if (isError) toast.error(`Error loading users: ${error?.message}`);

  const handleFilterChange = (key: keyof Filters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({
      email: "",
      fullName: "",
      phone: "",
      roleId: "",
      departmentId: "",
      createdFrom: "",
      createdTo: "",
      permissionId: "",
    });
  };

  const toggleUserExpansion = (userId: string) => {
    setExpandedUser(expandedUser === userId ? null : userId);
  };

  const users = usersData?.items || [];
  const total = usersData?.total || 0;
  const totalPages = usersData?.totalPages || 1;

  return (
    <motion.div
      className="p-6 bg-gray-800 bg-opacity-50 border border-gray-700 shadow-lg backdrop-blur-md rounded-xl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-100">Users ({total})</h2>
        <div className="flex gap-2">
          <button
            onClick={() => navigate("/admin/users/create")}
            className="flex items-center gap-2 px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700"
          >
            <Plus size={18} />
            Create User
          </button>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            <Filter size={18} />
            Filters
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="p-4 mb-6 bg-gray-700 rounded-lg">
          <div className="grid grid-cols-1 gap-4 mb-4 md:grid-cols-3">
            <input
              type="text"
              placeholder="Filter by email..."
              className="px-3 py-2 text-white bg-gray-600 rounded-lg"
              value={filters.email}
              onChange={(e) => handleFilterChange("email", e.target.value)}
            />
            <input
              type="text"
              placeholder="Filter by full name..."
              className="px-3 py-2 text-white bg-gray-600 rounded-lg"
              value={filters.fullName}
              onChange={(e) => handleFilterChange("fullName", e.target.value)}
            />
            <input
              type="text"
              placeholder="Filter by phone..."
              className="px-3 py-2 text-white bg-gray-600 rounded-lg"
              value={filters.phone}
              onChange={(e) => handleFilterChange("phone", e.target.value)}
            />

            {/* Role Select */}
            <select
              className="px-3 py-2 text-white bg-gray-600 rounded-lg"
              value={filters.roleId}
              onChange={(e) => handleFilterChange("roleId", e.target.value)}
            >
              <option value="">Select Role...</option>
              {rolesData?.items.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.roleName}
                </option>
              ))}
            </select>

            {/* Department Select */}
            <select
              className="px-3 py-2 text-white bg-gray-600 rounded-lg"
              value={filters.departmentId}
              onChange={(e) =>
                handleFilterChange("departmentId", e.target.value)
              }
            >
              <option value="">Select Department...</option>
              {departmentsData?.items.map((department) => (
                <option key={department.id} value={department.id}>
                  {department.name}
                </option>
              ))}
            </select>

            {/* Permission Select */}
            <select
              className="px-3 py-2 text-white bg-gray-600 rounded-lg"
              value={filters.permissionId}
              onChange={(e) =>
                handleFilterChange("permissionId", e.target.value)
              }
            >
              <option value="">Select Permission...</option>
              {permissionsData?.items.map((permission) => (
                <option key={permission.id} value={permission.id}>
                  {permission.name}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={clearFilters}
            className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700"
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-700">
          <thead>
            <tr>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-400 uppercase">
                User
              </th>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-400 uppercase">
                Contact
              </th>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-400 uppercase">
                Role
              </th>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-400 uppercase">
                Department
              </th>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-400 uppercase">
                Status
              </th>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-400 uppercase">
                Permissions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-700">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center">
                  <div className="flex justify-center">
                    <div className="w-16 h-16 text-orange-600">
                      <svg fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12,23a9.63,9.63,0,0,1-8-9.5,9.51,9.51,0,0,1,6.79-9.1A1.66,1.66,0,0,0,12,2.81h0a1.67,1.67,0,0,0-1.94-1.64A11,11,0,0,0,12,23Z">
                          <animateTransform
                            attributeName="transform"
                            type="rotate"
                            dur="0.75s"
                            values="0 12 12;360 12 12"
                            repeatCount="indefinite"
                          />
                        </path>
                      </svg>
                    </div>
                  </div>
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-400">
                  No users found
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <React.Fragment key={user.id}>
                  <motion.tr
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 w-10 h-10">
                          <div className="flex items-center justify-center w-10 h-10 font-semibold text-white rounded-full bg-gradient-to-r from-purple-400 to-blue-500">
                            {user.fullName.charAt(0)}
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-100">
                            <button
                              onClick={() =>
                                navigate(`/admin/users/update/${user.id}`)
                              }
                              className="text-left text-blue-400 transition-colors duration-200 hover:text-blue-300 hover:underline"
                            >
                              {user.fullName}
                            </button>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-300">{user.email}</div>
                      <div className="text-sm text-gray-400">{user.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 text-xs font-semibold leading-5 text-blue-100 bg-blue-800 rounded-full">
                        {user.role.roleName}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-300">
                        {user.department.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.active
                            ? "bg-green-800 text-green-100"
                            : "bg-red-800 text-red-100"
                        }`}
                      >
                        {user.active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => toggleUserExpansion(user.id)}
                        className="flex items-center gap-1 px-2 py-1 text-xs text-gray-300 bg-gray-600 rounded hover:bg-gray-500"
                      >
                        <Eye size={14} />
                        {user.permissions.length} permissions
                      </button>
                    </td>
                  </motion.tr>

                  {/* Expanded permissions row */}
                  {expandedUser === user.id && (
                    <motion.tr
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <td colSpan={6} className="px-6 py-4 bg-gray-700">
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium text-gray-200">
                            Permissions for {user.fullName}:
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {user.permissions.map((permission) => (
                              <span
                                key={permission.id}
                                className="inline-flex px-2 py-1 text-xs font-medium text-purple-100 bg-purple-800 rounded-full"
                                title={permission.description}
                              >
                                {permission.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      </td>
                    </motion.tr>
                  )}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 0 && (
        <div className="flex items-center justify-between mt-6">
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-400">
              Page {currentPage} of {totalPages} ({total} total users)
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">Show:</span>
              <select
                value={pageSize}
                onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                className="px-2 py-1 text-sm text-white bg-gray-600 rounded"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
              <span className="text-sm text-gray-400">per page</span>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 text-white bg-gray-600 rounded disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-white bg-gray-600 rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default UsersTable;
