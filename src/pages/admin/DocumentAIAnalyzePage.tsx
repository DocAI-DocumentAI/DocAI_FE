import { PlusCircle, Settings, Database } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Header from "../../components/common/Header";
import { useDocumentAIAnalyzeConfigs } from "../../services/documentAIAnalyzeService";
import DocumentAIAnalyzeTable from "../../components/documentAIAnalyze/DocumentAIAnalyzeTable";

const DocumentAIAnalyzePage: React.FC = () => {
  const navigate = useNavigate();
  const { data: configs, isLoading, isError, error } = useDocumentAIAnalyzeConfigs();

  const handleCreateNew = () => {
    navigate("/admin/document-ai-analyze/create");
  };

  return (
    <div className="relative z-10 flex-1 overflow-auto">
      <Header title="Document AI Analyze Configuration" />

      <main className="px-4 py-6 mx-auto max-w-7xl lg:px-8">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
              <Database className="w-8 h-8 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-100">
                Document AI Analyze Configurations
              </h1>
              <p className="text-gray-400 mt-1">
                Manage AI models and prompts for automated document analysis and data extraction.
              </p>
            </div>
          </div>
          <button
            onClick={handleCreateNew}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white transition-all duration-200 bg-blue-600 border border-transparent rounded-lg shadow-sm hover:bg-blue-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transform hover:scale-105"
          >
            <PlusCircle className="w-4 h-4 mr-2" />
            Create New Configuration
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Settings className="w-6 h-6 text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Total Configurations</p>
                <p className="text-2xl font-bold text-white">
                  {isLoading ? "..." : configs?.length || 0}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <Database className="w-6 h-6 text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Default Configuration</p>
                <p className="text-2xl font-bold text-white">
                  {isLoading ? "..." : configs?.find(c => c.isDefault)?.modelName || "None"}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <Settings className="w-6 h-6 text-purple-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Active Models</p>
                <p className="text-2xl font-bold text-white">
                  {isLoading ? "..." : new Set(configs?.map(c => c.modelName)).size || 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-400">Loading configurations...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {isError && (
          <div className="bg-red-900/20 border border-red-700 rounded-lg p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-500/10 rounded-lg">
                <Settings className="w-6 h-6 text-red-400" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-red-400">Error Loading Configurations</h3>
                <p className="text-red-300 mt-1">
                  {error?.message || "Failed to load AI analyze configurations"}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Configurations Table */}
        {configs && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-gray-700">
              <h2 className="text-lg font-semibold text-white">Configuration List</h2>
              <p className="text-sm text-gray-400 mt-1">
                Manage your document analysis AI configurations
              </p>
            </div>
            <DocumentAIAnalyzeTable configs={configs} />
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default DocumentAIAnalyzePage;
