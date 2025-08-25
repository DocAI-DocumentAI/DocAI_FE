import { useState } from "react";
import { motion } from "framer-motion";
import { Filter, Plus, Trash2 } from "lucide-react";
import { useRolesPaginated, Role } from "../../services/roleService";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

interface Filters {
  name: string;
  description: string;
}

interface RoleTableProps {
  onDeleteClick: (role: Role) => void;
}

const RoleTable: React.FC<RoleTableProps> = ({ onDeleteClick }) => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState<Filters>({
    name: "",
    description: "",
  });

  // React Query hooks
  const {
    data: rolesData,
    isLoading,
    isError,
    error,
  } = useRolesPaginated({
    ...Object.fromEntries(
      Object.entries(filters)
        .filter(([_, value]) => value !== "")
        .map(([key, value]) => [key === "name" ? "roleName" : key, value])
    ),
    page: currentPage,
    size: pageSize,
  });

  // Handle errors
  if (isError) toast.error(`Error loading roles: ${error?.message}`);

  const handleFilterChange = (key: keyof Filters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({ name: "", description: "" });
  };

  const roles = rolesData?.items || [];
  const total = rolesData?.total || 0;
  const totalPages = rolesData?.totalPages || 1;

  return (
    <motion.div
      className="p-6 bg-gray-800 bg-opacity-50 border border-gray-700 shadow-lg backdrop-blur-md rounded-xl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-100">Roles ({total})</h2>
        <div className="flex gap-2">
          <button
            onClick={() => navigate("/admin/roles/create")}
            className="flex items-center gap-2 px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700"
          >
            <Plus size={18} />
            Create Role
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
          <div className="grid grid-cols-1 gap-4 mb-4 md:grid-cols-2">
            <input
              type="text"
              placeholder="Filter by role name..."
              className="px-3 py-2 text-white bg-gray-600 rounded-lg"
              value={filters.name}
              onChange={(e) => handleFilterChange("name", e.target.value)}
            />
            <input
              type="text"
              placeholder="Filter by description..."
              className="px-3 py-2 text-white bg-gray-600 rounded-lg"
              value={filters.description}
              onChange={(e) =>
                handleFilterChange("description", e.target.value)
              }
            />
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
                Role Name
              </th>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-400 uppercase">
                Description
              </th>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-400 uppercase">
                Created At
              </th>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-400 uppercase">
                Updated At
              </th>
              <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-400 uppercase">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-700">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center">
                  <div className="flex justify-center">
                    <div className="w-16 h-16 text-orange-600">
                      <svg
                        fill="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M12,23a9.63,9.63,0,0,1-8-9.5,9.51,9.51,0,0,1,6.79-9.1A1.66,1.66,0,0,0,12,2.81h0a1.67,1.67,0,0,0-1.94-1.64A11,11,0,0,0,12,23Z">
                          <animateTransform
                            attributeName="transform"
                            type="rotate"
                            dur="0.75s"
                            values="0 12 12;360 12 12"
                            repeatCount="indefinite"
                          ></animateTransform>
                        </path>
                      </svg>
                    </div>
                  </div>
                </td>
              </tr>
            ) : roles.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-400">
                  No roles found
                </td>
              </tr>
            ) : (
              roles.map((role) => (
                <motion.tr
                  key={role.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => navigate(`/admin/roles/update/${role.id}`)}
                      className="text-left text-blue-400 transition-colors duration-200 hover:text-blue-300 hover:underline"
                    >
                      {role.roleName}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-300">
                      {role.description}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-300">
                      {new Date(role.createAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-300">
                      {new Date(role.updateAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => onDeleteClick(role)}
                      className="p-2 text-red-400 transition-colors duration-200 hover:text-red-300 hover:bg-red-900 hover:bg-opacity-20 rounded-lg"
                      title="Delete role"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </motion.tr>
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
              Page {currentPage} of {totalPages} ({total} total roles)
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

export default RoleTable;
