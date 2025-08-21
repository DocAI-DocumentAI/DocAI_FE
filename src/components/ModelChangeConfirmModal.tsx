import React from 'react';
import { X, MessageSquare, Plus, ArrowRight } from 'lucide-react';

interface ModelChangeConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentModel: string;
  newModel: string;
  onStartNewChat: () => void;
  onContinueWithCurrent: () => void;
}

const ModelChangeConfirmModal: React.FC<ModelChangeConfirmModalProps> = ({
  isOpen,
  onClose,
  currentModel,
  newModel,
  onStartNewChat,
  onContinueWithCurrent
}) => {
  if (!isOpen) return null;

  const handleStartNewChat = () => {
    onStartNewChat();
    onClose();
  };

  const handleContinueWithCurrent = () => {
    onContinueWithCurrent();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Change AI Model</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6">
          <div className="mb-6">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <p className="text-center text-gray-700 mb-4">
              You already have an ongoing conversation with <strong>{currentModel}</strong>.
            </p>
            <p className="text-center text-sm text-gray-600">
              To use <strong>{newModel}</strong>, you can either start a new chat or continue with your current model.
            </p>
          </div>

          {/* Model Change Visualization */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="font-medium">{currentModel}</span>
              </div>
              <ArrowRight size={16} className="text-gray-400" />
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="font-medium">{newModel}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="flex flex-col gap-3 p-6 border-t bg-gray-50">
          <button
            onClick={handleStartNewChat}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <Plus size={16} />
            Start New Chat with {newModel}
          </button>
          <button
            onClick={handleContinueWithCurrent}
            className="w-full px-4 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Continue with {currentModel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModelChangeConfirmModal;
