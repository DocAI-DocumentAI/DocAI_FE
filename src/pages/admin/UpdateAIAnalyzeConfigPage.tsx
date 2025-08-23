import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import Header from '../../components/common/Header';
import ConfigAIAnalyzeForm from '../../components/aiConfig/ConfigAIAnalyzeForm';
import { useAIConfigs, useUpdateAIConfig, CreateAIConfigRequest } from '../../services/aiConfigService';

const UpdateAIAnalyzeConfigPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: configs, isLoading } = useAIConfigs();
  const updateMutation = useUpdateAIConfig();

  const config = configs?.find(c => c.id === id);

  const handleSubmit = (data: CreateAIConfigRequest) => {
    if (!id) return;
    updateMutation.mutate({ id, data }, {
      onSuccess: () => {
        toast.success('AI configuration updated successfully');
        navigate('/admin/config-ai-analyze');
      },
      onError: (error) => {
        toast.error(`Error updating configuration: ${error.message}`);
      },
    });
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!config) {
    return <div>Configuration not found.</div>;
  }

  return (
    <div className="relative z-10 flex-1 overflow-auto">
      <Header title="Update AI Analyze Configuration" />
      <main className="px-4 py-6 mx-auto max-w-7xl lg:px-8">
        <div className="p-6 bg-gray-800 rounded-lg">
          <h1 className="mb-4 text-xl font-semibold text-white">Edit AI Configuration</h1>
          <ConfigAIAnalyzeForm onSubmit={handleSubmit} initialData={config} isSubmitting={updateMutation.isPending} />
        </div>
      </main>
    </div>
  );
};

export default UpdateAIAnalyzeConfigPage;

