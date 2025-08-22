import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Header from '../../components/common/Header';
import ConfigAIAnalyzeForm from '../../components/aiConfig/ConfigAIAnalyzeForm';
import { useCreateAIConfig, CreateAIConfigRequest } from '../../services/aiConfigService';

const CreateAIAnalyzeConfigPage: React.FC = () => {
  const navigate = useNavigate();
  const createMutation = useCreateAIConfig();

  const handleSubmit = (data: CreateAIConfigRequest) => {
    createMutation.mutate(data, {
      onSuccess: () => {
        toast.success('AI configuration created successfully');
        navigate('/admin/config-ai-analyze');
      },
      onError: (error) => {
        toast.error(`Error creating configuration: ${error.message}`);
      },
    });
  };

  return (
    <div className="relative z-10 flex-1 overflow-auto">
      <Header title="Create AI Analyze Configuration" />
      <main className="px-4 py-6 mx-auto max-w-7xl lg:px-8">
        <div className="p-6 bg-gray-800 rounded-lg">
          <h1 className="mb-4 text-xl font-semibold text-white">New AI Configuration</h1>
          <ConfigAIAnalyzeForm onSubmit={handleSubmit} isSubmitting={createMutation.isPending} />
        </div>
      </main>
    </div>
  );
};

export default CreateAIAnalyzeConfigPage;

