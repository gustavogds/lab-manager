import { Navigate, Route, Routes, useLocation } from "react-router";

import "./App.scss";
import Navbar from "components/Navbar/Navbar";
import { Overlays } from "components/my-own-modal-handler";
import Home from "./Home/Home";
import Login from "./Login/Login";
import { isEmptyObject } from "helpers/utils";

import { useEffect, useState } from "react";
import AuthHandler from "helpers/services/AuthHandler";
import { useGlobalData } from "helpers/context/globalContext";

const PrivateRoute = ({
  user,
  redirectPath = "/login",
  children,
}: {
  user: any;
  redirectPath?: string;
  children: React.ReactNode;
}) => {
  if (isEmptyObject(user)) {
    return <Navigate to={redirectPath} />;
  }
  return children;
};

const ProtectedRoute = ({
  user,
  redirectPath = "/",
  children,
}: {
  user: any;
  redirectPath?: string;
  children: React.ReactNode;
}) => {
  if (!isEmptyObject(user)) {
    return <Navigate to={redirectPath} />;
  }
  return children;
};

const App = () => {
  const location = useLocation();
  const hideNavbarRoutes = ["/signin", "/signup"];
  const shouldHideNavbar = hideNavbarRoutes.includes(location.pathname);
  const [readyToRender, setReadyToRender] = useState(false);
  const { user }: any = useGlobalData();

  useEffect(() => {
    (async () => {
      console.log("App mounted");
      AuthHandler.user = user;
      await AuthHandler.sync();
      setReadyToRender(true);
    })();
  }, []);

  if (!readyToRender) {
    return null;
  }

  return (
    <div className="app">
      <Overlays />
      {!shouldHideNavbar && <Navbar />}
      <div className="app-body">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/signin"
            element={
              <ProtectedRoute user={user.state}>
                <Login />
              </ProtectedRoute>
            }
          />
          <Route
            path="/signup"
            element={
              <ProtectedRoute user={user.state}>
                <Login isSignUp={true} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/password/reset"
            element={
              <ProtectedRoute user={user.state}>
                <Login isPasswordReset={true} />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </div>
  );
};

export default App;
