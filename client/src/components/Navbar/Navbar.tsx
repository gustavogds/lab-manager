import Medias from "../../components/Medias/Medias";
import Icons from "../../components/Icons/Icons";
import "./Navbar.scss";
import { useState } from "react";
import { useNavigate } from "react-router";
import { useGlobalData } from "helpers/context/globalContext";
import AuthHandler from "helpers/services/AuthHandler";
import { isEmptyObject } from "helpers/utils";

const Navbar = () => {
  const navigate = useNavigate();
  const { user }: any = useGlobalData();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    AuthHandler.logout();
  };

  return (
    <div className="navbar">
      <div className="navbar-header">
        <div className="header-left">
          <img
            src={Medias.Logo}
            alt="Lab Manager"
            onClick={() => navigate("/")}
          />
        </div>

        <div className="header-right">
          {!isEmptyObject(user.state) && (
            <span className="header-icon" onClick={() => navigate("/create")}>
              <Icons.SquareAdd />
            </span>
          )}

          <div className="profile-wrapper" style={{ position: "relative" }}>
            <span
              className="header-icon"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <Icons.Profile />
            </span>

            {menuOpen && (
              <div className="profile-menu">
                {!isEmptyObject(user.state) ? (
                  <>
                    <button onClick={() => navigate("/profile")}>
                      Profile
                    </button>
                    <button onClick={() => handleLogout()}>Sign Out</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => navigate("/signin")}>Sign In</button>
                    <button onClick={() => navigate("/signup")}>Sign Up</button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
