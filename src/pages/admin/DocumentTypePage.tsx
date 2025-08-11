import { motion } from "framer-motion";
import { FileText } from "lucide-react";
import { useDocumentTypes } from "../../services/documentTypeService";
import StatCard from "../../components/common/StatCard";
import DocumentTypeTable from "../../components/documentTypeAdmin/DocumentTypeTable";

const DocumentTypePage = () => {
  const { data: documentTypesData } = useDocumentTypes();

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
        <DocumentTypeTable />
      </main>
    </div>
  );
};

export default DocumentTypePage;
