import { PlusCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Header from "../../components/common/Header";
import { useAIConfigs } from "../../services/aiConfigService";
import ConfigAIAnalyzeTable from "../../components/aiConfig/ConfigAIAnalyzeTable";

const ConfigAIAnalyzePage: React.FC = () => {
  const navigate = useNavigate();
  const { data: configs, isLoading, isError, error } = useAIConfigs();

  const handleCreateNew = () => {
    navigate("/admin/config-ai-analyze/create");
  };

  return (
    <div className="relative z-10 flex-1 overflow-auto">
      <Header title="AI Analyze Configuration" />

      <main className="px-4 py-6 mx-auto max-w-7xl lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-100">
              AI Analyze Configurations
            </h1>
            <p className="text-gray-400">
              Manage AI models and settings for document analysis.
            </p>
          </div>
          <button
            onClick={handleCreateNew}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white transition-colors bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PlusCircle className="w-4 h-4 mr-2" />
            Create New Configuration
          </button>
        </div>

        {isLoading && <p>Loading configurations...</p>}
        {isError && <p>Error loading configurations: {error.message}</p>}

        {configs && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
                        <ConfigAIAnalyzeTable configs={configs} />
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default ConfigAIAnalyzePage;

