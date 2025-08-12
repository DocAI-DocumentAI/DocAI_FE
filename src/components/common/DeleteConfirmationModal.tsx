import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, X } from "lucide-react";

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  itemName?: string;
  isLoading?: boolean;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  itemName,
  isLoading = false,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-50 bg-black bg-opacity-50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <div className="w-full max-w-md p-6 bg-gray-800 border border-gray-700 rounded-xl shadow-xl">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 bg-red-600 rounded-full">
                    <Trash2 size={20} className="text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-100">
                    {title}
                  </h3>
                </div>
                <button
                  onClick={onClose}
                  disabled={isLoading}
                  className="p-1 text-gray-400 hover:text-gray-200 disabled:opacity-50"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Content */}
              <div className="mb-6">
                <p className="text-gray-300">{message}</p>
                {itemName && (
                  <div className="p-3 mt-3 bg-gray-700 rounded-lg">
                    <p className="text-sm text-gray-400">Item to delete:</p>
                    <p className="font-medium text-gray-100">{itemName}</p>
                  </div>
                )}
                <div className="p-3 mt-3 bg-red-900 bg-opacity-30 border border-red-700 rounded-lg">
                  <p className="text-sm text-red-300">
                    ⚠️ This action cannot be undone. All associated data will be permanently removed.
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 text-gray-300 bg-gray-700 rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={onConfirm}
                  disabled={isLoading}
                  className="flex items-center justify-center flex-1 gap-2 px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white rounded-full border-t-transparent animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 size={16} />
                      Delete
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default DeleteConfirmationModal;
