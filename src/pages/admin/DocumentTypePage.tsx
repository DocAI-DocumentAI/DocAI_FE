import { motion } from "framer-motion";
import { FileText } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import {
  useDocumentTypes,
  useDeleteDocumentType,
  DocumentType,
} from "../../services/documentTypeService";
import StatCard from "../../components/common/StatCard";
import DocumentTypeTable from "../../components/documentTypeAdmin/DocumentTypeTable";
import DeleteConfirmationModal from "../../components/common/DeleteConfirmationModal";

const DocumentTypePage = () => {
  const { data: documentTypesData } = useDocumentTypes();
  const deleteDocumentTypeMutation = useDeleteDocumentType();
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    documentType: DocumentType | null;
  }>({ isOpen: false, documentType: null });

  const handleDeleteClick = (documentType: DocumentType) => {
    setDeleteModal({ isOpen: true, documentType });
  };

  const handleDeleteConfirm = () => {
    if (!deleteModal.documentType) return;

    deleteDocumentTypeMutation.mutate(deleteModal.documentType.id, {
      onSuccess: () => {
        toast.success("Document type deleted successfully!");
        setDeleteModal({ isOpen: false, documentType: null });
      },
      onError: (error: any) => {
        toast.error(error.message || "Failed to delete document type");
      },
    });
  };

  const handleDeleteCancel = () => {
    setDeleteModal({ isOpen: false, documentType: null });
  };

  return (
    <div className="relative z-10 flex-1 overflow-auto">
      <main className="px-4 py-6 mx-auto max-w-7xl lg:px-8">
        {/* HEADER */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-2xl font-semibold text-gray-100">
            Document Type Management
          </h1>
          <p className="text-gray-400">
            Manage and monitor all document types in your system
          </p>
        </motion.div>

        {/* STATS */}
        <motion.div
          className="grid grid-cols-1 gap-5 mb-8 sm:grid-cols-2 lg:grid-cols-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <StatCard
            name="Total Document Types"
            icon={FileText}
            value={documentTypesData?.total?.toString() || "0"}
            color="#6366F1"
          />
        </motion.div>

        {/* DOCUMENT TYPE TABLE */}
        <DocumentTypeTable onDeleteClick={handleDeleteClick} />
      </main>

      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Document Type"
        message="Are you sure you want to delete this document type? This action cannot be undone and may affect documents using this type."
        itemName={deleteModal.documentType?.name}
        isLoading={deleteDocumentTypeMutation.isPending}
      />
    </div>
  );
};

export default DocumentTypePage;
