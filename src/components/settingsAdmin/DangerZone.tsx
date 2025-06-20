import React from "react";
import { motion } from "framer-motion";
import { Trash2 } from "lucide-react";

const DangerZone: React.FC = () => {
  return (
    <motion.div
      className="p-6 mb-8 bg-red-900 bg-opacity-50 rounded-xl border border-red-700 shadow-lg backdrop-filter backdrop-blur-lg"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <div className="flex items-center mb-4">
        <Trash2 className="mr-3 text-red-400" size={24} />
        <h2 className="text-xl font-semibold text-gray-100">Danger Zone</h2>
      </div>
      <p className="mb-4 text-gray-300">
        Permanently delete your account and all of your content.
      </p>
      <button className="px-4 py-2 font-bold text-white bg-red-600 rounded transition duration-200 hover:bg-red-700">
        Delete Account
      </button>
    </motion.div>
  );
};
export default DangerZone;
