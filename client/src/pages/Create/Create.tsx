import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { FaFlask, FaPlus, FaProjectDiagram, FaHandshake, FaTools, FaFileAlt, FaUserPlus } from "react-icons/fa";
import "./Create.scss";

type CreateOption = {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  action: () => void;
};

const Create = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const createOptions: CreateOption[] = [
    {
      id: "invitation",
      title: t("Invite Member"),
      description: t("Invite a new member by email to the lab"),
      icon: <FaUserPlus />,
      action: () => {
        navigate("/create/invitation");
      },
    },
    {
      id: "research-area",
      title: t("Research Area"),
      description: t("Create a new research area for the lab"),
      icon: <FaFlask />,
      action: () => {
        navigate("/create/research-area");
      },
    },
    {
      id: "project",
      title: t("Project"),
      description: t("Create a new research project"),
      icon: <FaProjectDiagram />,
      action: () => {
        navigate("/create/project");
      },
    },
    {
      id: "partnership",
      title: t("Partnership"),
      description: t("Add a new partner institution"),
      icon: <FaHandshake />,
      action: () => {
        navigate("/create/partnership");
      },
    },
    {
      id: "equipment",
      title: t("Equipment"),
      description: t("Register new lab material or equipment"),
      icon: <FaTools />,
      action: () => {
        navigate("/create/equipment");
      },
    },
    {
      id: "report",
      title: t("Report"),
      description: t("Generate a report with the lab data"),
      icon: <FaFileAlt />,
      action: () => {
        navigate("/create/report");
      },
    },
  ];

  return (
    <div className="page-layout">
      <div className="page-container">
        <header className="page-header">
          <h1>{t("Create New Content")}</h1>
          <p>{t("Select the type of content you want to create")}</p>
        </header>

        <div className="option-cards-grid">
          {createOptions.map((option) => (
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
                <FaPlus />
              </div>
            </div>
          ))}
        </div>

        {createOptions.length === 0 && (
          <div className="no-options">
            <p>{t("No creation options available at the moment.")}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Create;
