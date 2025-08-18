import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Tag as TagIcon, Search } from "lucide-react";
import {
  getTags,
  createTag,
  updateTag,
  deleteTag,
  Tag,
} from "../../lib/api/tag";
import toast from "react-hot-toast";

const Tags = () => {
  const [dataSource, setDataSource] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });
  const [deleteConfirm, setDeleteConfirm] = useState<{
    visible: boolean;
    tagId: string;
    tagName: string;
  }>({
    visible: false,
    tagId: "",
    tagName: "",
  });

  const fetchTags = async (page = 1, pageSize = 10) => {
    setLoading(true);
    try {
      const response = await getTags(page, pageSize);
      setDataSource(response.items || []);
      setPagination({
        current: page,
        pageSize: pageSize,
        total: response.total || 0,
      });
    } catch (error: any) {
      toast.error(
        `Failed to fetch tags: ${
          error?.response?.data?.message || error.message
        }`
      );
      setDataSource([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTags();
  }, []);

  const handleCreate = () => {
    setEditingTag(null);
    setModalVisible(true);
    setFormData({ name: "", description: "" });
  };

  const handleEdit = (record: Tag) => {
    setEditingTag(record);
    setModalVisible(true);
    setFormData({ name: record.name, description: "" });
  };

  const handleCancel = () => {
    setModalVisible(false);
    setFormData({ name: "", description: "" });
    setEditingTag(null);
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast.error("Tag name is required");
      return;
    }

    if (formData.name.length < 2) {
      toast.error("Tag name must be at least 2 characters");
      return;
    }

    if (formData.name.length > 50) {
      toast.error("Tag name cannot exceed 50 characters");
      return;
    }

    setLoading(true);
    try {
      const values = { name: formData.name.trim() };

      if (editingTag) {
        // Update existing tag
        await updateTag(editingTag.id, values);
        toast.success("Tag updated successfully!");
      } else {
        // Create new tag
        await createTag(values);
        toast.success("Tag created successfully!");
      }

      setModalVisible(false);
      setFormData({ name: "", description: "" });
      setEditingTag(null);
      fetchTags(pagination.current, pagination.pageSize);
    } catch (error: any) {
      toast.error(
        `Operation failed: ${error?.response?.data?.message || error.message}`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (tag: Tag) => {
    setDeleteConfirm({
      visible: true,
      tagId: tag.id,
      tagName: tag.name,
    });
  };

  const handleDeleteConfirm = async () => {
    setLoading(true);
    try {
      await deleteTag(deleteConfirm.tagId);
      toast.success("Tag deleted successfully!");
      fetchTags(pagination.current, pagination.pageSize);
      setDeleteConfirm({ visible: false, tagId: "", tagName: "" });
    } catch (error: any) {
      toast.error(
        `Delete failed: ${error?.response?.data?.message || error.message}`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirm({ visible: false, tagId: "", tagName: "" });
  };

  // Filter tags based on search term
  const filteredTags = dataSource.filter((tag) =>
    tag.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        className="flex items-center justify-between"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-600 rounded-lg">
            <TagIcon className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-100">Tags Management</h1>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Tag
        </button>
      </motion.div>

      {/* Search */}
      <motion.div
        className="p-4 bg-gray-800 bg-opacity-50 border border-gray-700 shadow-lg backdrop-blur-md rounded-xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </motion.div>

      {/* Tags Table */}
      <motion.div
        className="p-6 bg-gray-800 bg-opacity-50 border border-gray-700 shadow-lg backdrop-blur-md rounded-xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-8 h-8 border-2 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-300">
                <thead className="text-xs text-gray-400 uppercase bg-gray-700">
                  <tr>
                    <th className="px-6 py-3">Tag Name</th>
                    <th className="px-6 py-3">Created</th>
                    <th className="px-6 py-3">Last Updated</th>
                    <th className="px-6 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTags.map((tag) => (
                    <tr
                      key={tag.id}
                      className="border-b border-gray-700 hover:bg-gray-700/50"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                          <span className="font-medium text-white">
                            {tag.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-400">
                        <div>
                          {new Date(tag.createdTime).toLocaleDateString(
                            "vi-VN",
                            {
                              year: "numeric",
                              month: "2-digit",
                              day: "2-digit",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </div>
                        <div className="text-xs text-gray-500">
                          by {tag.createdByName}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-400">
                        {tag.lastUpdatedTime ? (
                          <div>
                            <div>
                              {new Date(tag.lastUpdatedTime).toLocaleDateString(
                                "vi-VN",
                                {
                                  year: "numeric",
                                  month: "2-digit",
                                  day: "2-digit",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )}
                            </div>
                            <div className="text-xs text-gray-500">
                              by {tag.lastUpdatedByName}
                            </div>
                          </div>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(tag)}
                            className="p-2 text-blue-400 transition-colors rounded-md hover:text-blue-300 hover:bg-blue-900 hover:bg-opacity-20"
                            title="Edit tag"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(tag)}
                            className="p-2 text-red-400 transition-colors rounded-md hover:text-red-300 hover:bg-red-900 hover:bg-opacity-20"
                            title="Delete tag"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-6">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400">Show</span>
                <select
                  value={pagination.pageSize}
                  onChange={(e) => {
                    setPagination((prev) => ({
                      ...prev,
                      pageSize: Number(e.target.value),
                      current: 1,
                    }));
                    fetchTags(1, Number(e.target.value));
                  }}
                  className="px-3 py-1 text-white bg-gray-600 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
                <span className="text-sm text-gray-400">entries</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400">
                  Showing {(pagination.current - 1) * pagination.pageSize + 1}{" "}
                  to{" "}
                  {Math.min(
                    pagination.current * pagination.pageSize,
                    pagination.total
                  )}{" "}
                  of {pagination.total} tags
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const newPage = Math.max(1, pagination.current - 1);
                    setPagination((prev) => ({ ...prev, current: newPage }));
                    fetchTags(newPage, pagination.pageSize);
                  }}
                  disabled={pagination.current === 1}
                  className="px-3 py-1 text-gray-300 bg-gray-600 rounded-md hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="px-3 py-1 text-white bg-blue-600 rounded-md">
                  {pagination.current}
                </span>
                <button
                  onClick={() => {
                    const totalPages = Math.ceil(
                      pagination.total / pagination.pageSize
                    );
                    const newPage = Math.min(
                      totalPages,
                      pagination.current + 1
                    );
                    setPagination((prev) => ({ ...prev, current: newPage }));
                    fetchTags(newPage, pagination.pageSize);
                  }}
                  disabled={
                    pagination.current ===
                    Math.ceil(pagination.total / pagination.pageSize)
                  }
                  className="px-3 py-1 text-gray-300 bg-gray-600 rounded-md hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </motion.div>

      {/* Modal */}
      {modalVisible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <motion.div
            className="w-full max-w-md p-6 bg-gray-800 border border-gray-700 rounded-xl"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <h2 className="mb-4 text-xl font-bold text-gray-100">
              {editingTag ? "Edit Tag" : "Create New Tag"}
            </h2>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmit();
              }}
            >
              <div className="mb-4">
                <label className="block mb-2 text-sm font-medium text-gray-300">
                  Tag Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="Enter tag name"
                  className="w-full px-3 py-2 text-white bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  minLength={2}
                  maxLength={50}
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 text-gray-300 bg-gray-600 rounded-lg hover:bg-gray-500 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Saving..." : editingTag ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm.visible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <motion.div
            className="w-full max-w-md p-6 bg-gray-800 border border-gray-700 rounded-xl"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <h2 className="mb-4 text-xl font-bold text-gray-100">Delete Tag</h2>
            <p className="mb-6 text-gray-300">
              Are you sure you want to delete the tag "{deleteConfirm.tagName}"?
              This action cannot be undone.
            </p>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={handleDeleteCancel}
                className="px-4 py-2 text-gray-300 bg-gray-600 rounded-lg hover:bg-gray-500 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={loading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Tags;
