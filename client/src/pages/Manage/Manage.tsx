import { useNavigate } from "react-router";
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
  const navigate = useNavigate();
  const { user }: any = useGlobalData();
  const hasFullAccess = canManageAll(user.state);

  const allOptions: ManageOption[] = [
    {
      id: "research-areas",
      title: "Áreas de Pesquisa",
      description: "Gerenciar as áreas de pesquisa do laboratório",
      icon: <FaFlask />,
      action: () => {
        navigate("/manage/research-areas");
      },
      requiresFullAccess: true,
    },
    {
      id: "projects",
      title: "Projetos",
      description: "Gerenciar os projetos do laboratório",
      icon: <FaProjectDiagram />,
      action: () => {
        navigate("/manage/projects");
      },
      requiresFullAccess: true,
    },
    {
      id: "partnerships",
      title: "Parcerias",
      description: "Gerenciar as parcerias do laboratório",
      icon: <FaHandshake />,
      action: () => {
        navigate("/manage/partnerships");
      },
      requiresFullAccess: true,
    },
    {
      id: "equipment",
      title: "Equipamentos",
      description: "Gerenciar materiais e equipamentos do laboratório",
      icon: <FaTools />,
      action: () => {
        navigate("/manage/equipment");
      },
      requiresFullAccess: false,
    },
    {
      id: "users",
      title: "Usuários",
      description: "Gerenciar usuários, cargos e permissões",
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
          <h1>Gerenciar</h1>
          <p>Selecione o que deseja gerenciar</p>
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
