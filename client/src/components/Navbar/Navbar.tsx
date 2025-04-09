import Medias from "../../components/Medias/Medias";
import Icons from "../../components/Icons/Icons";
import "./Navbar.scss";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import api from "helpers/api";

const Navbar = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    api.auth
      .sync()
      .then((res: any) => {
        if (res.data) {
          setUser(res.data);
        }
      })
      .catch(() => {
        setUser(null);
      });
  }, []);

  const handleLogout = () => {
    api.auth.logout().then(() => {
      setUser(null);
      navigate("/signin");
    });
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
          {user && (
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
                {user ? (
                  <>
                    <button onClick={() => navigate("/profile")}>
                      Profile
                    </button>
                    <button onClick={handleLogout}>Sign Out</button>
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
