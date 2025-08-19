import { Outlet } from "react-router-dom";
import { Navbar } from "./Navbar";
import { SettingsSidebar } from "../Settings-sidebar";

export default function SettingsLayout() {
  return (
    <div className="flex flex-col min-h-screen ">
      <Navbar />
      <div className="flex flex-1 max-w-[1090px] w-[-webkit-fill-available] flex-row gap-4 px-4 py-8 mx-auto">
        <SettingsSidebar />
        <main className="flex-1 w-full p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
