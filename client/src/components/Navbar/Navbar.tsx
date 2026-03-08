import Medias from "../../components/Medias/Medias";
import Icons from "../../components/Icons/Icons";
import LanguageSelector from "../../components/LanguageSelector/LanguageSelector";
import "./Navbar.scss";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { useGlobalData } from "helpers/context/globalContext";
import AuthHandler from "helpers/services/AuthHandler";
import { isEmptyObject, canManageAll, canManageEquipment } from "helpers/utils";
import { getLabSettings } from "helpers/api/settings";

const Navbar = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user }: any = useGlobalData();
  const [menuOpen, setMenuOpen] = useState(false);
  const [labLogo, setLabLogo] = useState("");
  const menuRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    AuthHandler.logout();
  };

  useEffect(() => {
    const fetchLabSettings = async () => {
      const response = await getLabSettings();
      if (response.success && response.data.logo) {
        setLabLogo(response.data.logo);
      }
    };
    fetchLabSettings();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuOpen]);

  return (
    <div className="navbar">
      <div className="navbar-header">
        <div className="header-left">
          <img
            src={labLogo || Medias.Logo}
            alt="Lab Manager"
            onClick={() => navigate("/")}
          />
        </div>

        <div className="header-right">
          <LanguageSelector />
          <div
            className="profile-wrapper"
            style={{ position: "relative" }}
            ref={menuRef}
          >
            <span
              className="header-icon profile-icon"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {!isEmptyObject(user.state) && user.state.profile_image ? (
                <img
                  src={user.state.profile_image}
                  alt={t("Profile")}
                  className="profile-image"
                />
              ) : (
                <Icons.Profile />
              )}
            </span>

            {menuOpen && (
              <div className="profile-menu">
                {!isEmptyObject(user.state) ? (
                  <>
                    <button onClick={() => navigate("/settings/profile")}>
                      {t("Settings")}
                    </button>
                    {canManageAll(user.state) && (
                      <button onClick={() => navigate("/approval")}>
                        {t("Account Activation")}
                      </button>
                    )}
                    <button onClick={() => handleLogout()}>{t("Logout")}</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => navigate("/signin")}>{t("Sign In")}</button>
                    <button onClick={() => navigate("/signup")}>{t("Sign Up")}</button>
                  </>
                )}
              </div>
            )}
          </div>
          {!isEmptyObject(user.state) && canManageEquipment(user.state) && (
            <span className="header-icon" onClick={() => navigate("/manage")}>
              <Icons.FaSlidersH />
            </span>
          )}
          {!isEmptyObject(user.state) && canManageAll(user.state) && (
            <span className="header-icon" onClick={() => navigate("/create")}>
              <Icons.FaPlus />
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
