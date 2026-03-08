import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { FaTools, FaFlask, FaProjectDiagram, FaHandshake, FaUsers, FaArrowRight } from "react-icons/fa";
import "./ManageContent.scss";
import { useGlobalData } from "helpers/context/globalContext";
import { canManageAll } from "helpers/utils";

type ManageOption = {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  action: () => void;
  requiresFullAccess?: boolean;
};

const Manage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user }: any = useGlobalData();
  const hasFullAccess = canManageAll(user.state);

  const allOptions: ManageOption[] = [
    {
      id: "research-areas",
      title: t("Research Areas"),
      description: t("Manage lab research areas"),
      icon: <FaFlask />,
      action: () => {
        navigate("/manage/research-areas");
      },
      requiresFullAccess: true,
    },
    {
      id: "projects",
      title: t("Projects"),
      description: t("Manage lab projects"),
      icon: <FaProjectDiagram />,
      action: () => {
        navigate("/manage/projects");
      },
      requiresFullAccess: true,
    },
    {
      id: "partnerships",
      title: t("Partnerships"),
      description: t("Manage lab partnerships"),
      icon: <FaHandshake />,
      action: () => {
        navigate("/manage/partnerships");
      },
      requiresFullAccess: true,
    },
    {
      id: "equipment",
      title: t("Equipments"),
      description: t("Manage lab materials and equipment"),
      icon: <FaTools />,
      action: () => {
        navigate("/manage/equipment");
      },
      requiresFullAccess: false,
    },
    {
      id: "users",
      title: t("Users"),
      description: t("Manage users, roles and permissions"),
      icon: <FaUsers />,
      action: () => {
        navigate("/manage/users");
      },
      requiresFullAccess: true,
    },
  ];

  const manageOptions = allOptions.filter(
    (option) => !option.requiresFullAccess || hasFullAccess
  );

  return (
    <div className="page-layout">
      <div className="page-container">
        <header className="page-header">
          <h1>{t("Manage")}</h1>
          <p>{t("Select what you want to manage")}</p>
        </header>

        <div className="option-cards-grid">
          {manageOptions.map((option) => (
            <div
              key={option.id}
              className="option-card"
              onClick={option.action}
            >
              <div className="option-icon">{option.icon}</div>
              <div className="option-content">
                <h3>{option.title}</h3>
                <p>{option.description}</p>
              </div>
              <div className="option-arrow">
                <FaArrowRight />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Manage;
