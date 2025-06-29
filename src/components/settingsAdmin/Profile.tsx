import { User } from "lucide-react";
import SettingSection from "./SettingSection";

const Profile: React.FC = () => {
  return (
    <SettingSection icon={User} title={"Profile"}>
      <div className="flex flex-col items-center mb-6 sm:flex-row">
        <img
          src="https://randomuser.me/api/portraits/men/3.jpg"
          alt="Profile"
          className="object-cover mr-4 w-20 h-20 rounded-full"
        />

        <div>
          <h3 className="text-lg font-semibold text-gray-100">John Doe</h3>
          <p className="text-gray-400">john.doe@example.com</p>
        </div>
      </div>

      <button className="px-4 py-2 w-full font-bold text-white bg-indigo-600 rounded transition duration-200 hover:bg-indigo-700 sm:w-auto">
        Edit Profile
      </button>
    </SettingSection>
  );
};
export default Profile;
