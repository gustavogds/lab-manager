import { Navigate, Route, Routes, useLocation } from "react-router";

import "./App.scss";
import { isEmptyObject, canManageAll, canManageEquipment } from "../helpers/utils";
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
import CreateEquipment from "./Create/CreateEquipment";
import CreateReport from "./Create/CreateReport";
import CreateInvitation from "./Create/CreateInvitation";
import Manage from "./Manage/Manage";
import ManageEquipment from "./Manage/ManageEquipment";
import ManageResearchAreas from "./Manage/ManageResearchAreas";
import ManageProjects from "./Manage/ManageProjects";
import ManagePartnerships from "./Manage/ManagePartnerships";
import ManageUsers from "./Manage/ManageUsers";

import { useEffect, useState } from "react";
import AuthHandler from "../helpers/services/AuthHandler";
import { useGlobalData } from "../helpers/context/globalContext";
import { getLabSettings } from "../helpers/api/settings";
import Notification from "../components/Modals/Notification/Notification";
import SectionEditorModal from "../components/Modals/SectionEditor/SectionEditor";
import ProjectDetails from "../components/Modals/ProjectDetails/ProjectDetails";
import ProjectEditor from "../components/Modals/ProjectEditor/ProjectEditor";
import ResearcherDetails from "../components/Modals/ResearcherDetails/ResearcherDetails";
import ResearchersEditor from "../components/Modals/ResearchersEditor/ResearchersEditor";
import PartnershipsEditor from "../components/Modals/PartnershipsEditor/PartnershipsEditor";
import EquipmentEditor from "../components/Modals/EquipmentEditor/EquipmentEditor";
import ResearchAreaEditor from "../components/Modals/ResearchAreaEditor/ResearchAreaEditor";
import ProjectManageEditor from "../components/Modals/ProjectManageEditor/ProjectManageEditor";
import PartnershipManageEditor from "../components/Modals/PartnershipManageEditor/PartnershipManageEditor";
import RoomEditor from "../components/Modals/RoomEditor/RoomEditor";
import RoomSectionEditor from "../components/Modals/RoomSectionEditor/RoomSectionEditor";
import IdentificationCategoryEditor from "../components/Modals/IdentificationCategoryEditor/IdentificationCategoryEditor";
import EquipmentStateEditor from "../components/Modals/EquipmentStateEditor/EquipmentStateEditor";
import UserEditor from "../components/Modals/UserEditor/UserEditor";
import PositionEditor from "../components/Modals/PositionEditor/PositionEditor";

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
  const hideNavbarRoutes = [
    "/signin",
    "/signup",
    "/password/reset",
    "/password/reset/confirm",
  ];
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
    ModalsHandler.registerModal("EquipmentEditor", EquipmentEditor);
    ModalsHandler.registerModal("ResearchAreaEditor", ResearchAreaEditor);
    ModalsHandler.registerModal("ProjectManageEditor", ProjectManageEditor);
    ModalsHandler.registerModal("PartnershipManageEditor", PartnershipManageEditor);
    ModalsHandler.registerModal("RoomEditor", RoomEditor);
    ModalsHandler.registerModal("RoomSectionEditor", RoomSectionEditor);
    ModalsHandler.registerModal("IdentificationCategoryEditor", IdentificationCategoryEditor);
    ModalsHandler.registerModal("EquipmentStateEditor", EquipmentStateEditor);
    ModalsHandler.registerModal("UserEditor", UserEditor);
    ModalsHandler.registerModal("PositionEditor", PositionEditor);

    (async () => {
      const response = await getLabSettings();
      if (!response.success) return;
      if (response.data.lab_name) {
        document.title = response.data.lab_name;
      }
      if (response.data.favicon) {
        let link = document.querySelector<HTMLLinkElement>("link[rel='icon']");
        if (!link) {
          link = document.createElement("link");
          link.rel = "icon";
          document.head.appendChild(link);
        }
        link.removeAttribute("type");
        link.href = response.data.favicon;
      }
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
          <Route
            path="/password/reset/confirm"
            element={
              <ProtectedRoute user={user.state}>
                <Login isPasswordResetConfirm={true} />
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
            {canManageAll(user.state) && (
              <Route path="lab" element={<LabSettings />} />
            )}
          </Route>
          <Route
            path="/approval"
            element={
              canManageAll(user.state) ? (
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
              canManageAll(user.state) ? (
                <PrivateRoute user={user.state}>
                  <Create />
                </PrivateRoute>
              ) : (
                <Navigate to="/" />
              )
            }
          />
          <Route
            path="/create/invitation"
            element={
              canManageAll(user.state) ? (
                <PrivateRoute user={user.state}>
                  <CreateInvitation />
                </PrivateRoute>
              ) : (
                <Navigate to="/" />
              )
            }
          />
          <Route
            path="/create/research-area"
            element={
              canManageAll(user.state) ? (
                <PrivateRoute user={user.state}>
                  <CreateResearchArea />
                </PrivateRoute>
              ) : (
                <Navigate to="/" />
              )
            }
          />
          <Route
            path="/create/project"
            element={
              canManageAll(user.state) ? (
                <PrivateRoute user={user.state}>
                  <CreateProject />
                </PrivateRoute>
              ) : (
                <Navigate to="/" />
              )
            }
          />
          <Route
            path="/create/partnership"
            element={
              canManageAll(user.state) ? (
                <PrivateRoute user={user.state}>
                  <CreatePartnership />
                </PrivateRoute>
              ) : (
                <Navigate to="/" />
              )
            }
          />
          <Route
            path="/create/equipment"
            element={
              canManageEquipment(user.state) ? (
                <PrivateRoute user={user.state}>
                  <CreateEquipment />
                </PrivateRoute>
              ) : (
                <Navigate to="/" />
              )
            }
          />
          <Route
            path="/create/report"
            element={
              canManageAll(user.state) ? (
                <PrivateRoute user={user.state}>
                  <CreateReport />
                </PrivateRoute>
              ) : (
                <Navigate to="/" />
              )
            }
          />
          <Route
            path="/manage"
            element={
              canManageEquipment(user.state) ? (
                <PrivateRoute user={user.state}>
                  <Manage />
                </PrivateRoute>
              ) : (
                <Navigate to="/" />
              )
            }
          />
          <Route
            path="/manage/equipment"
            element={
              canManageEquipment(user.state) ? (
                <PrivateRoute user={user.state}>
                  <ManageEquipment />
                </PrivateRoute>
              ) : (
                <Navigate to="/" />
              )
            }
          />
          <Route
            path="/manage/research-areas"
            element={
              canManageAll(user.state) ? (
                <PrivateRoute user={user.state}>
                  <ManageResearchAreas />
                </PrivateRoute>
              ) : (
                <Navigate to="/" />
              )
            }
          />
          <Route
            path="/manage/projects"
            element={
              canManageAll(user.state) ? (
                <PrivateRoute user={user.state}>
                  <ManageProjects />
                </PrivateRoute>
              ) : (
                <Navigate to="/" />
              )
            }
          />
          <Route
            path="/manage/partnerships"
            element={
              canManageAll(user.state) ? (
                <PrivateRoute user={user.state}>
                  <ManagePartnerships />
                </PrivateRoute>
              ) : (
                <Navigate to="/" />
              )
            }
          />
          <Route
            path="/manage/users"
            element={
              canManageAll(user.state) ? (
                <PrivateRoute user={user.state}>
                  <ManageUsers />
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
