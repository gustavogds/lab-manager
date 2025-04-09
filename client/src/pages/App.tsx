import { Route, Routes, useLocation } from "react-router";

import "./App.scss";
import Navbar from "../components/Navbar/Navbar";
import { Overlays } from "../components/my-own-modal-handler";
import Home from "../pages/Home/Home";
import Login from "../pages/Login/Login";

const App = () => {
  const location = useLocation();
  const hideNavbarRoutes = ["/signin", "/signup"];
  const shouldHideNavbar = hideNavbarRoutes.includes(location.pathname);

  return (
    <div className="app">
      <Overlays />
      {!shouldHideNavbar && <Navbar />}
      <div className="app-body">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/signin" element={<Login />} />
          <Route path="/signup" element={<Login isSignUp={true} />} />
          <Route
            path="/password/reset"
            element={<Login isPasswordReset={true} />}
          />
        </Routes>
      </div>
    </div>
  );
};

export default App;
