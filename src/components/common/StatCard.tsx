import { motion } from "framer-motion";
import React from "react";

interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
}

interface StatCardProps {
  name: string;
  icon: React.ComponentType<IconProps>;
  value: string;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({
  name,
  icon: Icon,
  value,
  color,
}) => {
  return (
    <motion.div
      className="overflow-hidden bg-gray-800 bg-opacity-50 border border-gray-700 shadow-lg backdrop-blur-md rounded-xl"
      whileHover={{ y: -5, boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)" }}
    >
      <div className="px-4 py-5 sm:p-6">
        <span className="flex items-center text-sm font-medium text-gray-400">
          <Icon size={20} className="mr-2" style={{ color }} />
          {name}
        </span>
        <p className="mt-1 text-3xl font-semibold text-gray-100">{value}</p>
      </div>
    </motion.div>
  );
};
export default StatCard;
