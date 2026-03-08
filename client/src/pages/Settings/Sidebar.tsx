import { NavLink } from "react-router";
import { useTranslation } from "react-i18next";
import { useGlobalData } from "helpers/context/globalContext";
import { canManageAll } from "helpers/utils";
import "./Settings.scss";

const Sidebar = () => {
  const { t } = useTranslation();
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
          {t("Profile Settings")}
        </NavLink>

        {canManageAll(user?.state) && (
          <NavLink
            to="/settings/lab"
            className={({ isActive }) =>
              isActive
                ? "settings-sidebar__link active"
                : "settings-sidebar__link"
            }
          >
            {t("Lab Settings")}
          </NavLink>
        )}
      </nav>
    </aside>
  );
};

export default Sidebar;
