import { AIConfig, useDeleteAIConfig, useSetDefaultAIConfig } from "../../services/aiConfigService";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Edit, Trash2, Star } from "lucide-react";

interface ConfigAIAnalyzeTableProps {
  configs: AIConfig[];
}

const ConfigAIAnalyzeTable: React.FC<ConfigAIAnalyzeTableProps> = ({ configs }) => {
  const navigate = useNavigate();
  const deleteMutation = useDeleteAIConfig();
  const setDefaultMutation = useSetDefaultAIConfig();

  const handleEdit = (id: string) => {
    navigate(`/admin/config-ai-analyze/update/${id}`);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this configuration?")) {
      deleteMutation.mutate(id, {
        onSuccess: () => toast.success("Configuration deleted successfully"),
        onError: (error) => toast.error(`Error deleting configuration: ${error.message}`),
      });
    }
  };

  const handleSetDefault = (id: string) => {
    setDefaultMutation.mutate(id, {
      onSuccess: () => toast.success("Default configuration set successfully"),
      onError: (error) => toast.error(`Error setting default configuration: ${error.message}`),
    });
  };

  return (
    <div className="overflow-x-auto bg-gray-800 rounded-lg">
      <table className="min-w-full text-sm text-left text-gray-300">
        <thead className="text-xs text-gray-400 uppercase bg-gray-700">
          <tr>
            <th scope="col" className="px-6 py-3">Model Name</th>
            <th scope="col" className="px-6 py-3">Max Tokens</th>
            <th scope="col" className="px-6 py-3">Is Default</th>
            <th scope="col" className="px-6 py-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {configs.map((config) => (
            <tr key={config.id} className="border-b border-gray-700 hover:bg-gray-600">
              <td className="px-6 py-4 font-medium text-white">{config.modelName}</td>
              <td className="px-6 py-4">{config.maxToken}</td>
              <td className="px-6 py-4">{config.isDefault ? "Yes" : "No"}</td>
              <td className="px-6 py-4">
                <div className="flex space-x-2">
                  <button onClick={() => handleEdit(config.id)} className="text-blue-400 hover:text-blue-300"><Edit size={16} /></button>
                  <button onClick={() => handleDelete(config.id)} className="text-red-400 hover:text-red-300"><Trash2 size={16} /></button>
                  {!config.isDefault && (
                    <button onClick={() => handleSetDefault(config.id)} className="text-yellow-400 hover:text-yellow-300"><Star size={16} /></button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ConfigAIAnalyzeTable;

