import { useNavigate } from "react-router";
import { FaTools, FaFlask, FaProjectDiagram, FaHandshake, FaArrowRight } from "react-icons/fa";
import "./Manage.scss";

type ManageOption = {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  action: () => void;
};

const Manage = () => {
  const navigate = useNavigate();

  const manageOptions: ManageOption[] = [
    {
      id: "research-areas",
      title: "Áreas de Pesquisa",
      description: "Gerenciar as áreas de pesquisa do laboratório",
      icon: <FaFlask />,
      action: () => {
        navigate("/manage/research-areas");
      },
    },
    {
      id: "projects",
      title: "Projetos",
      description: "Gerenciar os projetos do laboratório",
      icon: <FaProjectDiagram />,
      action: () => {
        navigate("/manage/projects");
      },
    },
    {
      id: "partnerships",
      title: "Parcerias",
      description: "Gerenciar as parcerias do laboratório",
      icon: <FaHandshake />,
      action: () => {
        navigate("/manage/partnerships");
      },
    },
    {
      id: "equipment",
      title: "Equipamentos",
      description: "Gerenciar materiais e equipamentos do laboratório",
      icon: <FaTools />,
      action: () => {
        navigate("/manage/equipment");
      },
    },
  ];

  return (
    <div className="manage-page">
      <div className="manage-container">
        <header className="manage-header">
          <h1>Gerenciar</h1>
          <p>Selecione o que deseja gerenciar</p>
        </header>

        <div className="manage-options">
          {manageOptions.map((option) => (
            <div
              key={option.id}
              className="manage-option-card"
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
