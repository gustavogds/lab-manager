import { Navigate, Route, Routes, useLocation } from "react-router";

import "./App.scss";
import { isEmptyObject } from "helpers/utils";
import { ModalsHandler, Overlays } from "components/my-own-modal-handler";
import Navbar from "components/Navbar/Navbar";
import Home from "./Home/Home";
import Login from "./Login/Login";
import SettingsLayout from "./Settings/SettingsLayout";
import ProfileSettings from "./Settings/ProfileSettings";
import LabSettings from "./Settings/LabSettings";
import Approval from "./Approval/Approval";

import { useEffect, useState } from "react";
import AuthHandler from "helpers/services/AuthHandler";
import { useGlobalData } from "helpers/context/globalContext";
import Notification from "components/Modals/Notification/Notification";

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
  const hideNavbarRoutes = ["/signin", "/signup", "/password/reset"];
  const shouldHideNavbar = hideNavbarRoutes.includes(location.pathname);
  const [readyToRender, setReadyToRender] = useState(false);
  const { user }: any = useGlobalData();

  useEffect(() => {
    (async () => {
      AuthHandler.user = user;
      await AuthHandler.sync();
      setReadyToRender(true);
    })();
    ModalsHandler.setup();
    ModalsHandler.registerModal("Notification", Notification);
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
          <Route
            path="/settings/*"
            element={
              !isEmptyObject(user.state) ? (
                <SettingsLayout />
              ) : (
                <Navigate to="/signin" />
              )
            }
          >
            <Route path="profile" element={<ProfileSettings />} />
            {user.state.role === "professor" && (
              <Route path="lab" element={<LabSettings />} />
            )}
          </Route>
          <Route
            path="/approval"
            element={
              user.state.role === "professor" ? (
                <PrivateRoute user={user.state}>
                  <Approval />
                </PrivateRoute>
              ) : (
                <Navigate to="/" />
              )
            }
          />
        </Routes>
      </div>
    </div>
  );
};

export default App;
