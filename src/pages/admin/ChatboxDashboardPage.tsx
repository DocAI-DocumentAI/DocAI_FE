import { motion } from "framer-motion";
import Header from "../../components/common/Header";
import StatisticsDaily from "../../components/ChatBoxDashboardAdmin/StatisticsDaily";
import StatisticsModel from "../../components/ChatBoxDashboardAdmin/StatisticsModel";
import StatisticsChatbox from "../../components/ChatBoxDashboardAdmin/StatisticsChatbox";

const ChatboxDashboardPage: React.FC = () => {
  return (
    <div className="relative z-10 flex-1 overflow-auto">
      <Header title="Chatbox Dashboard" />

      <main className="px-4 py-6 mx-auto max-w-7xl lg:px-8">
        {/* CHATBOX STATISTICS CHART */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <StatisticsDaily />
        </motion.div>

        {/* MODEL STATISTICS AND CHATBOX OVERVIEW */}
        <motion.div
          className="grid grid-cols-1 gap-8 mb-8 lg:grid-cols-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
        >
          <StatisticsModel />
          <StatisticsChatbox />
        </motion.div>
      </main>
    </div>
  );
};

export default ChatboxDashboardPage;
