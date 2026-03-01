import { useNavigate } from "react-router";
import { FaFlask, FaPlus, FaProjectDiagram, FaHandshake, FaTools, FaFileAlt } from "react-icons/fa";
import "./Create.scss";

type CreateOption = {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  action: () => void;
};

const Create = () => {
  const navigate = useNavigate();

  const createOptions: CreateOption[] = [
    {
      id: "research-area",
      title: "Área de Pesquisa",
      description: "Criar uma nova área de pesquisa para o laboratório",
      icon: <FaFlask />,
      action: () => {
        navigate("/create/research-area");
      },
    },
    {
      id: "project",
      title: "Projeto",
      description: "Criar um novo projeto de pesquisa",
      icon: <FaProjectDiagram />,
      action: () => {
        navigate("/create/project");
      },
    },
    {
      id: "partnership",
      title: "Parceria",
      description: "Adicionar uma nova instituição parceira",
      icon: <FaHandshake />,
      action: () => {
        navigate("/create/partnership");
      },
    },
    {
      id: "equipment",
      title: "Equipamento",
      description: "Registrar um novo material ou equipamento do laboratório",
      icon: <FaTools />,
      action: () => {
        navigate("/create/equipment");
      },
    },
    {
      id: "report",
      title: "Relatório",
      description: "Gerar um relatório com os dados do laboratório",
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
          <h1>Criar Novo Conteúdo</h1>
          <p>Selecione o tipo de conteúdo que deseja criar</p>
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
            <p>Nenhuma opção de criação disponível no momento.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Create;
