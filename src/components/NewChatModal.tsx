import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { getChatModels, createChatSession, ChatModel } from "../lib/api/chat";

interface NewChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onChatCreated: (chatId: string) => void;
}

export default function NewChatModal({ isOpen, onClose, onChatCreated }: NewChatModalProps) {
  const [title, setTitle] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  const [models, setModels] = useState<ChatModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchModels();
    }
  }, [isOpen]);

  const fetchModels = async () => {
    try {
      setLoading(true);
      const modelList = await getChatModels();
      setModels(modelList);
      
      // Set default model if available
      const defaultModel = modelList.find(model => model.isDefault);
      if (defaultModel) {
        setSelectedModel(defaultModel.modelName);
      }
    } catch (error) {
      console.error('Failed to fetch models:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !selectedModel) return;

    try {
      setCreating(true);
      const newChat = await createChatSession({
        title: title.trim(),
        modelName: selectedModel
      });
      
      onChatCreated(newChat.id);
      onClose();
      setTitle("");
      setSelectedModel("");
    } catch (error) {
      console.error('Failed to create chat:', error);
    } finally {
      setCreating(false);
    }
  };

  const handleClose = () => {
    onClose();
    setTitle("");
    setSelectedModel("");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-semibold">Create New Chat</h2>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-4">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Chat Title
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter chat title"
              required
            />
          </div>

          <div className="mb-6">
            <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-2">
              AI Model
            </label>
            {loading ? (
              <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                Loading models...
              </div>
            ) : (
              <select
                id="model"
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Select a model</option>
                {models.map((model) => (
                  <option key={model.modelName} value={model.modelName}>
                    {model.displayName} {model.isFree && "(Free)"}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
              disabled={creating}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim() || !selectedModel || creating || loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {creating ? "Creating..." : "Create Chat"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}