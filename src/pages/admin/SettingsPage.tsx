import Header from "../../components/common/Header";
import DangerZone from "../../components/settingsAdmin/DangerZone";
import Notifications from "../../components/settingsAdmin/Notifications";
import Profile from "../../components/settingsAdmin/Profile";
import Security from "../../components/settingsAdmin/Security";

const SettingsPage = () => {
  return (
    <div className="overflow-auto relative z-10 flex-1 bg-gray-900">
      <Header title="Settings" />
      <main className="px-4 py-6 mx-auto max-w-4xl lg:px-8">
        <Profile />
        <Notifications />
        <Security />
        <DangerZone />
      </main>
    </div>
  );
};
export default SettingsPage;
