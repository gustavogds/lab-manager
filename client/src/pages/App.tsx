import { Navigate, Route, Routes, useLocation } from "react-router";

import "./App.scss";
import { isEmptyObject } from "../helpers/utils";
import { ModalsHandler, Overlays } from "../components/my-own-modal-handler";
import Navbar from "../components/Navbar/Navbar";
import Home from "./Home/Home";
import Login from "./Login/Login";
import SettingsLayout from "./Settings/SettingsLayout";
import ProfileSettings from "./Settings/ProfileSettings";
import LabSettings from "./Settings/LabSettings";
import Approval from "./Approval/Approval";
import Create from "./Create/Create";
import CreateResearchArea from "./Create/CreateResearchArea";
import CreateProject from "./Create/CreateProject";
import CreatePartnership from "./Create/CreatePartnership";

import { useEffect, useState } from "react";
import AuthHandler from "../helpers/services/AuthHandler";
import { useGlobalData } from "../helpers/context/globalContext";
import Notification from "../components/Modals/Notification/Notification";
import SectionEditorModal from "../components/Modals/SectionEditor/SectionEditor";
import ProjectDetails from "../components/Modals/ProjectDetails/ProjectDetails";
import ProjectEditor from "../components/Modals/ProjectEditor/ProjectEditor";
import ResearcherDetails from "../components/Modals/ResearcherDetails/ResearcherDetails";
import ResearchersEditor from "../components/Modals/ResearchersEditor/ResearchersEditor";
import PartnershipsEditor from "../components/Modals/PartnershipsEditor/PartnershipsEditor";

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
    ModalsHandler.registerModal("SectionEditor", SectionEditorModal);
    ModalsHandler.registerModal("ProjectDetails", ProjectDetails);
    ModalsHandler.registerModal("ProjectEditor", ProjectEditor);
    ModalsHandler.registerModal("ResearcherDetails", ResearcherDetails);
    ModalsHandler.registerModal("ResearchersEditor", ResearchersEditor);
    ModalsHandler.registerModal("PartnershipsEditor", PartnershipsEditor);
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
          <Route
            path="/create"
            element={
              !isEmptyObject(user.state) ? (
                <Create />
              ) : (
                <Navigate to="/signin" />
              )
            }
          />
          <Route
            path="/create/research-area"
            element={
              !isEmptyObject(user.state) ? (
                <CreateResearchArea />
              ) : (
                <Navigate to="/signin" />
              )
            }
          />
          <Route
            path="/create/project"
            element={
              !isEmptyObject(user.state) ? (
                <CreateProject />
              ) : (
                <Navigate to="/signin" />
              )
            }
          />
          <Route
            path="/create/partnership"
            element={
              !isEmptyObject(user.state) ? (
                <CreatePartnership />
              ) : (
                <Navigate to="/signin" />
              )
            }
          />
        </Routes>
      </div>
    </div>
  );
};

export default App;
