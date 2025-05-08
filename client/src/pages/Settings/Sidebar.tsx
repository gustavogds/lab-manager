import { NavLink } from "react-router";
import { useGlobalData } from "helpers/context/globalContext";
import "./Settings.scss";

const Sidebar = () => {
  const { user }: any = useGlobalData();

  return (
    <aside className="settings-sidebar">
      <nav className="settings-sidebar__nav">
        <NavLink
          to="/settings/profile"
          className={({ isActive }) =>
            isActive
              ? "settings-sidebar__link active"
              : "settings-sidebar__link"
          }
        >
          Profile Settings
        </NavLink>

        {user?.state?.role === "professor" && (
          <NavLink
            to="/settings/lab"
            className={({ isActive }) =>
              isActive
                ? "settings-sidebar__link active"
                : "settings-sidebar__link"
            }
          >
            Lab Settings
          </NavLink>
        )}
      </nav>
    </aside>
  );
};

export default Sidebar;
