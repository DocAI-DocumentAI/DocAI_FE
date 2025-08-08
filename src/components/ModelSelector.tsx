import { useState, useEffect } from 'react';
import { ChevronDown, Zap, Crown } from 'lucide-react';
import { getChatModels, ChatModel } from '../lib/api/chat';

interface ModelSelectorProps {
  selectedModel: string;
  onModelChange: (modelName: string) => void;
  disabled?: boolean;
}

const ModelSelector: React.FC<ModelSelectorProps> = ({
  selectedModel,
  onModelChange,
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [models, setModels] = useState<ChatModel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchModels = async () => {
      try {
        const modelList = await getChatModels();
        setModels(modelList);
      } catch (error) {
        console.error('Failed to fetch models:', error);
        // Fallback với một số models mặc định
        setModels([]);
      } finally {
        setLoading(false);
      }
    };

    fetchModels();
  }, []);

  const selectedModelData = models.find(m => m.modelName === selectedModel);

  const handleModelSelect = (modelName: string) => {
    onModelChange(modelName);
    setIsOpen(false);
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 w-32 bg-gray-200 rounded"></div>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium
          ${disabled 
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
            : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-200'
          }
        `}
      >
        {selectedModelData?.isFree ? (
          <Zap size={14} className="text-blue-500" />
        ) : (
          <Crown size={14} className="text-amber-500" />
        )}
        <span>{selectedModelData?.displayName || selectedModel}</span>
        <ChevronDown size={14} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
            <div className="p-2">
              {models.map((model) => (
                <button
                  key={model.modelName}
                  onClick={() => handleModelSelect(model.modelName)}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2 rounded-md text-left text-sm
                    ${selectedModel === model.modelName 
                      ? 'bg-blue-50 text-blue-700' 
                      : 'hover:bg-gray-50 text-gray-700'
                    }
                  `}
                >
                  {model.isFree ? (
                    <Zap size={16} className="text-blue-500" />
                  ) : (
                    <Crown size={16} className="text-amber-500" />
                  )}
                  <div className="flex-1">
                    <div className="font-medium">{model.displayName}</div>
                    <div className="text-xs text-gray-500">
                      {model.isFree ? 'Free' : 'Premium'} • Max {model.maxTokens.toLocaleString()} tokens
                    </div>
                  </div>
                  {model.isDefault && (
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                      Default
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ModelSelector;