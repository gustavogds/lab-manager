import { useEffect, useState } from "react";
import { Outlet } from "react-router";
import AuthHandler from "helpers/services/AuthHandler";
import Sidebar from "./Sidebar";

export default function SettingsLayout() {
  const [synced, setSynced] = useState(false);

  useEffect(() => {
    (async () => {
      await AuthHandler.sync();
      setSynced(true);
    })();
  }, []);

  if (!synced) {
    return null;
  }

  return (
    <div className="settings-layout">
      <Sidebar />
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
}
