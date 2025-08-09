import { useState, useEffect } from 'react';
import { X, Zap, Crown, Check } from 'lucide-react';
import { getChatModels, ChatModel } from '../lib/api/chat';

interface ModelSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectModel: (modelName: string) => void;
}

const ModelSelectionModal: React.FC<ModelSelectionModalProps> = ({
  isOpen,
  onClose,
  onSelectModel
}) => {
  const [models, setModels] = useState<ChatModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedModel, setSelectedModel] = useState<string>('');

  useEffect(() => {
    const fetchModels = async () => {
      try {
        const modelList = await getChatModels();
        setModels(modelList);
        // Set default model as selected
        const defaultModel = modelList.find(m => m.isDefault) || modelList[0];
        if (defaultModel) {
          setSelectedModel(defaultModel.modelName);
        }
      } catch (error) {
        console.error('Failed to fetch models:', error);
        // Fallback với một số models mặc định
        const fallbackModels = [
          {
            modelName: 'gpt-3.5-turbo',
            displayName: 'GPT-3.5 Turbo',
            maxTokens: 4096,
            isDefault: true,
            isFree: true,
            temperature: 0.7,
            topP: 1
          },
          {
            modelName: 'gpt-4',
            displayName: 'GPT-4',
            maxTokens: 8192,
            isDefault: false,
            isFree: false,
            temperature: 0.7,
            topP: 1
          }
        ];
        setModels(fallbackModels);
        setSelectedModel(fallbackModels[0].modelName);
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      fetchModels();
    }
  }, [isOpen]);

  const handleConfirm = () => {
    if (selectedModel) {
      onSelectModel(selectedModel);
      onClose();
    }
  };

  const handleCancel = () => {
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={handleCancel}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Choose AI Model</h2>
          <button
            onClick={handleCancel}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-16 bg-gray-200 rounded-lg"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-gray-600 mb-4">
                Select the AI model you want to use for this conversation:
              </p>
              
              {models.map((model) => (
                <button
                  key={model.modelName}
                  onClick={() => setSelectedModel(model.modelName)}
                  className={`
                    w-full flex items-center gap-4 p-4 rounded-lg border-2 text-left transition-all
                    ${selectedModel === model.modelName 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }
                  `}
                >
                  <div className="flex-shrink-0">
                    {model.isFree ? (
                      <Zap size={24} className="text-blue-500" />
                    ) : (
                      <Crown size={24} className="text-amber-500" />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-gray-900">{model.displayName}</h3>
                      {model.isDefault && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                          Recommended
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600">
                      {model.isFree ? 'Free' : 'Premium'} • Max {model.maxTokens.toLocaleString()} tokens
                    </div>
                  </div>
                  
                  {selectedModel === model.modelName && (
                    <div className="flex-shrink-0">
                      <Check size={20} className="text-blue-500" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50">
          <button
            onClick={handleCancel}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedModel || loading}
            className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Start Chat
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModelSelectionModal;