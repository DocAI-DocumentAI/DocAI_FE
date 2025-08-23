import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft, Edit } from 'lucide-react';
import Header from '../../components/common/Header';
import DocumentAIAnalyzeForm from '../../components/documentAIAnalyze/DocumentAIAnalyzeForm';
import { 
  useDocumentAIAnalyzeConfigById, 
  useUpdateDocumentAIAnalyzeConfig, 
  CreateDocumentAIAnalyzeConfigRequest 
} from '../../services/documentAIAnalyzeService';

const UpdateDocumentAIAnalyzePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: config, isLoading, isError, error } = useDocumentAIAnalyzeConfigById(id!);
  const updateMutation = useUpdateDocumentAIAnalyzeConfig();

  const handleSubmit = (data: CreateDocumentAIAnalyzeConfigRequest) => {
    if (!id) return;
    updateMutation.mutate({ id, data }, {
      onSuccess: () => {
        toast.success('Document AI analyze configuration updated successfully');
        navigate('/admin/document-ai-analyze');
      },
      onError: (error) => {
        toast.error(`Error updating configuration: ${error.message}`);
      },
    });
  };

  const handleGoBack = () => {
    navigate('/admin/document-ai-analyze');
  };

  if (isLoading) {
    return (
      <div className="relative z-10 flex-1 overflow-auto">
        <Header title="Update Document AI Analyze Configuration" />
        <main className="px-4 py-6 mx-auto max-w-7xl lg:px-8">
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-400">Loading configuration...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (isError || !config) {
    return (
      <div className="relative z-10 flex-1 overflow-auto">
        <Header title="Update Document AI Analyze Configuration" />
        <main className="px-4 py-6 mx-auto max-w-7xl lg:px-8">
          <div className="bg-red-900/20 border border-red-700 rounded-lg p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-500/10 rounded-lg">
                <Edit className="w-6 h-6 text-red-400" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-red-400">Configuration Not Found</h3>
                <p className="text-red-300 mt-1">
                  {error?.message || "The requested configuration could not be found."}
                </p>
                <button
                  onClick={handleGoBack}
                  className="mt-3 inline-flex items-center px-3 py-2 text-sm font-medium text-red-300 bg-red-900/20 border border-red-700 rounded-lg hover:bg-red-900/30 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Configurations
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="relative z-10 flex-1 overflow-auto">
      <Header title="Update Document AI Analyze Configuration" />
      
      <main className="px-4 py-6 mx-auto max-w-7xl lg:px-8">
        {/* Header with Back Button */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleGoBack}
              className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-300 bg-gray-700 border border-gray-600 rounded-lg hover:bg-gray-600 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Configurations
            </button>
            <div>
              <h1 className="text-2xl font-bold text-white">Update Configuration</h1>
              <p className="text-gray-400 mt-1">
                Modify the AI model configuration for document analysis
              </p>
            </div>
          </div>
        </div>

        {/* Configuration Info */}
        <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Edit className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-blue-300">Editing Configuration</h3>
              <p className="text-xs text-blue-200 mt-1">
                ID: {config.id} | Created: {new Date(config.createdTime).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg">
          <div className="px-6 py-4 border-b border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-500/10 rounded-lg">
                <Edit className="w-5 h-5 text-orange-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Configuration Details</h2>
                <p className="text-sm text-gray-400">
                  Update the AI model settings for document analysis
                </p>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <DocumentAIAnalyzeForm 
              onSubmit={handleSubmit} 
              initialData={config}
              isSubmitting={updateMutation.isPending} 
            />
          </div>
        </div>

        {/* Warning Section */}
        <div className="mt-8 bg-yellow-900/20 border border-yellow-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-yellow-300 mb-3">Update Guidelines</h3>
          <div className="text-sm text-yellow-200">
            <ul className="space-y-2">
              <li>• Changes will affect all future document analysis operations using this configuration</li>
              <li>• If this is the default configuration, all users will be impacted</li>
              <li>• Test the updated configuration with sample documents before deploying</li>
              <li>• Consider creating a new configuration instead of modifying an existing one if major changes are needed</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UpdateDocumentAIAnalyzePage;
