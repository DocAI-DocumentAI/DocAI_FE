import { DocumentAIAnalyzeConfig, useDeleteDocumentAIAnalyzeConfig, useSetDefaultDocumentAIAnalyzeConfig } from "../../services/documentAIAnalyzeService";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Edit, Trash2, Star, Eye } from "lucide-react";
import { useState } from "react";

interface DocumentAIAnalyzeTableProps {
  configs: DocumentAIAnalyzeConfig[];
}

const DocumentAIAnalyzeTable: React.FC<DocumentAIAnalyzeTableProps> = ({ configs }) => {
  const navigate = useNavigate();
  const deleteMutation = useDeleteDocumentAIAnalyzeConfig();
  const setDefaultMutation = useSetDefaultDocumentAIAnalyzeConfig();
  const [expandedPrompt, setExpandedPrompt] = useState<string | null>(null);

  const handleEdit = (id: string) => {
    navigate(`/admin/config-ai-analyze/update/${id}`);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this AI analyze configuration?")) {
      deleteMutation.mutate(id, {
        onSuccess: () => toast.success("AI analyze configuration deleted successfully"),
        onError: (error) => toast.error(`Error deleting configuration: ${error.message}`),
      });
    }
  };

  const handleSetDefault = (id: string) => {
    setDefaultMutation.mutate(id, {
      onSuccess: () => toast.success("Default AI analyze configuration set successfully"),
      onError: (error) => toast.error(`Error setting default configuration: ${error.message}`),
    });
  };

  const togglePromptExpansion = (id: string) => {
    setExpandedPrompt(expandedPrompt === id ? null : id);
  };

  const truncateText = (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  return (
    <div className="overflow-x-auto bg-gray-800 rounded-lg">
      <table className="min-w-full text-sm text-left text-gray-300">
        <thead className="text-xs text-gray-400 uppercase bg-gray-700">
          <tr>
            <th scope="col" className="px-6 py-3">Model Name</th>
            <th scope="col" className="px-6 py-3">Model ID</th>
            <th scope="col" className="px-6 py-3">Max Tokens</th>
            <th scope="col" className="px-6 py-3">System Prompt</th>
            <th scope="col" className="px-6 py-3">Is Default</th>
            <th scope="col" className="px-6 py-3">Created Time</th>
            <th scope="col" className="px-6 py-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {configs.map((config) => (
            <tr key={config.id} className="border-b border-gray-700 hover:bg-gray-600">
              <td className="px-6 py-4 font-medium text-white">{config.modelName}</td>
              <td className="px-6 py-4 text-gray-300">{config.modelId}</td>
              <td className="px-6 py-4">{config.maxToken.toLocaleString()}</td>
              <td className="px-6 py-4 max-w-xs">
                <div className="relative">
                  <p className="text-gray-300">
                    {expandedPrompt === config.id 
                      ? config.systemPrompt 
                      : truncateText(config.systemPrompt)
                    }
                  </p>
                  {config.systemPrompt.length > 100 && (
                    <button
                      onClick={() => togglePromptExpansion(config.id)}
                      className="mt-1 text-blue-400 hover:text-blue-300 text-xs flex items-center"
                    >
                      <Eye size={12} className="mr-1" />
                      {expandedPrompt === config.id ? "Show less" : "Show more"}
                    </button>
                  )}
                </div>
              </td>
              <td className="px-6 py-4">
                <span className={`px-2 py-1 text-xs rounded-full ${
                  config.isDefault 
                    ? "bg-green-900 text-green-300 border border-green-700" 
                    : "bg-gray-700 text-gray-300 border border-gray-600"
                }`}>
                  {config.isDefault ? "Yes" : "No"}
                </span>
              </td>
              <td className="px-6 py-4 text-gray-400">
                {new Date(config.createdTime).toLocaleDateString()}
              </td>
              <td className="px-6 py-4">
                <div className="flex space-x-2">
                  <button 
                    onClick={() => handleEdit(config.id)} 
                    className="text-blue-400 hover:text-blue-300 p-1 rounded hover:bg-blue-900/20"
                    title="Edit configuration"
                  >
                    <Edit size={16} />
                  </button>
                  <button 
                    onClick={() => handleDelete(config.id)} 
                    className="text-red-400 hover:text-red-300 p-1 rounded hover:bg-red-900/20"
                    title="Delete configuration"
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 size={16} />
                  </button>
                  {!config.isDefault && (
                    <button 
                      onClick={() => handleSetDefault(config.id)} 
                      className="text-yellow-400 hover:text-yellow-300 p-1 rounded hover:bg-yellow-900/20"
                      title="Set as default"
                      disabled={setDefaultMutation.isPending}
                    >
                      <Star size={16} />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {configs.length === 0 && (
        <div className="px-6 py-8 text-center text-gray-400">
          <p>No AI analyze configurations found.</p>
          <p className="text-sm mt-2">Create your first configuration to get started.</p>
        </div>
      )}
    </div>
  );
};

export default DocumentAIAnalyzeTable;
