import { Outlet } from "react-router";
import Sidebar from "./Sidebar";

export default function SettingsLayout() {
  return (
    <div className="settings-layout">
      <Sidebar />
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
}
