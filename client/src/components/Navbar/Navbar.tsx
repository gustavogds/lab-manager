import Medias from "../../components/Medias/Medias";
import Icons from "../../components/Icons/Icons";
import "./Navbar.scss";

const Navbar = () => {
  return (
    <div className="navbar">
      <div className="navbar-header">
        <div className="header-left">
          <img src={Medias.Logo} alt="Life Pets" />
        </div>
        <div className="header-right">
          <span className="header-icon">
            <Icons.Profile />
          </span>
          <span className="header-icon">
            <Icons.SquareAdd />
          </span>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
