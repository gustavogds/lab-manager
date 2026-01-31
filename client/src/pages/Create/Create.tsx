import { useNavigate } from "react-router";
import { FaFlask, FaPlus, FaProjectDiagram } from "react-icons/fa";
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
    // Futuras opções podem ser adicionadas aqui
  ];

  return (
    <div className="create-page">
      <div className="create-container">
        <header className="create-header">
          <h1>Criar Novo Conteúdo</h1>
          <p>Selecione o tipo de conteúdo que deseja criar</p>
        </header>

        <div className="create-options">
          {createOptions.map((option) => (
            <div
              key={option.id}
              className="create-option-card"
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
