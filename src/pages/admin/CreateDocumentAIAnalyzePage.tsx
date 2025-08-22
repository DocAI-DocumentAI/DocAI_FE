import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft, Save } from 'lucide-react';
import Header from '../../components/common/Header';
import DocumentAIAnalyzeForm from '../../components/documentAIAnalyze/DocumentAIAnalyzeForm';
import { useCreateDocumentAIAnalyzeConfig, CreateDocumentAIAnalyzeConfigRequest } from '../../services/documentAIAnalyzeService';

const CreateDocumentAIAnalyzePage: React.FC = () => {
  const navigate = useNavigate();
  const createMutation = useCreateDocumentAIAnalyzeConfig();

  const handleSubmit = (data: CreateDocumentAIAnalyzeConfigRequest) => {
    createMutation.mutate(data, {
      onSuccess: () => {
        toast.success('Document AI analyze configuration created successfully');
        navigate('/admin/document-ai-analyze');
      },
      onError: (error) => {
        toast.error(`Error creating configuration: ${error.message}`);
      },
    });
  };

  const handleGoBack = () => {
    navigate('/admin/document-ai-analyze');
  };

  return (
    <div className="relative z-10 flex-1 overflow-auto">
      <Header title="Create Document AI Analyze Configuration" />
      
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
              <h1 className="text-2xl font-bold text-white">Create New Configuration</h1>
              <p className="text-gray-400 mt-1">
                Set up a new AI model configuration for document analysis
              </p>
            </div>
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg">
          <div className="px-6 py-4 border-b border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Save className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Configuration Details</h2>
                <p className="text-sm text-gray-400">
                  Configure the AI model settings for document analysis
                </p>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <DocumentAIAnalyzeForm 
              onSubmit={handleSubmit} 
              isSubmitting={createMutation.isPending} 
            />
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-8 bg-blue-900/20 border border-blue-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-300 mb-3">Configuration Guidelines</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-200">
            <div>
              <h4 className="font-medium mb-2">Model Selection:</h4>
              <ul className="space-y-1 text-blue-300">
                <li>• Choose models optimized for text analysis</li>
                <li>• Consider token limits for document size</li>
                <li>• Test with sample documents first</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">System Prompt:</h4>
              <ul className="space-y-1 text-blue-300">
                <li>• Define clear extraction requirements</li>
                <li>• Specify output format (JSON recommended)</li>
                <li>• Include validation rules</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CreateDocumentAIAnalyzePage;
