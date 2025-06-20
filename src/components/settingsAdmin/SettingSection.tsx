import { motion } from "framer-motion";
import React from "react";

interface SettingSectionProps {
  icon: React.ComponentType<any>;
  title: string;
  children: React.ReactNode;
}

const SettingSection: React.FC<SettingSectionProps> = ({
  icon: Icon,
  title,
  children,
}) => {
  return (
    <motion.div
      className="p-6 mb-8 bg-gray-800 bg-opacity-50 rounded-xl border border-gray-700 shadow-lg backdrop-filter backdrop-blur-lg"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center mb-4">
        <Icon className="mr-4 text-indigo-400" size="24" />
        <h2 className="text-xl font-semibold text-gray-100">{title}</h2>
      </div>
      {children}
    </motion.div>
  );
};
export default SettingSection;
