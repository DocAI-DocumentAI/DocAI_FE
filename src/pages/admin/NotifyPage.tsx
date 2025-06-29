import { CheckCircle, Clock, DollarSign, ShoppingBag } from "lucide-react";
import { motion } from "framer-motion";

import Header from "../../components/common/Header";
import StatCard from "../../components/common/StatCard";
import Daily from "../../components/noityAdmin/Daily";
import Distribution from "../../components/noityAdmin/Distribution";
import Table from "../../components/noityAdmin/Table";

const orderStats = {
  totalOrders: "1,234",
  pendingOrders: "56",
  completedOrders: "1,178",
  totalRevenue: "$98,765",
};

const NotifyPage: React.FC = () => {
  return (
    <div className="overflow-auto relative z-10 flex-1">
      <Header title={"Orders"} />

      <main className="px-4 py-6 mx-auto max-w-7xl lg:px-8">
        <motion.div
          className="grid grid-cols-1 gap-5 mb-8 sm:grid-cols-2 lg:grid-cols-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <StatCard
            name="Total Orders"
            icon={ShoppingBag}
            value={orderStats.totalOrders}
            color="#6366F1"
          />
          <StatCard
            name="Pending Orders"
            icon={Clock}
            value={orderStats.pendingOrders}
            color="#F59E0B"
          />
          <StatCard
            name="Completed Orders"
            icon={CheckCircle}
            value={orderStats.completedOrders}
            color="#10B981"
          />
          <StatCard
            name="Total Revenue"
            icon={DollarSign}
            value={orderStats.totalRevenue}
            color="#EF4444"
          />
        </motion.div>

        <div className="grid grid-cols-1 gap-8 mb-8 lg:grid-cols-2">
          <Daily />
          <Distribution />
        </div>

        <Table />
      </main>
    </div>
  );
};
export default NotifyPage;
