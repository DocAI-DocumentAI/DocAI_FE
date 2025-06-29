import { motion } from "framer-motion";

import Header from "../../components/common/Header";
import StatCard from "../../components/common/StatCard";

import { AlertTriangle, DollarSign, Package, TrendingUp } from "lucide-react";
import CategoryDistributionChart from "../../components/documentAdmin/CategoryDistributionChart";
import SalesTrendChart from "../../components/documentAdmin/SalesTrendChart";
import DocumentsTable from "../../components/documentAdmin/DocumentsTable";

const DocumentPage = () => {
  return (
    <div className="overflow-auto relative z-10 flex-1">
      <Header title="Products" />

      <main className="px-4 py-6 mx-auto max-w-7xl lg:px-8">
        {/* STATS */}
        <motion.div
          className="grid grid-cols-1 gap-5 mb-8 sm:grid-cols-2 lg:grid-cols-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <StatCard
            name="Total Products"
            icon={Package}
            value="1234"
            color="#6366F1"
          />
          <StatCard
            name="Top Selling"
            icon={TrendingUp}
            value="89"
            color="#10B981"
          />
          <StatCard
            name="Low Stock"
            icon={AlertTriangle}
            value="23"
            color="#F59E0B"
          />
          <StatCard
            name="Total Revenue"
            icon={DollarSign}
            value={"$543,210"}
            color="#EF4444"
          />
        </motion.div>

        <DocumentsTable />

        {/* CHARTS */}
        <div className="grid gap-8 grid-col-1 lg:grid-cols-2">
          <SalesTrendChart />
          <CategoryDistributionChart />
        </div>
      </main>
    </div>
  );
};
export default DocumentPage;
