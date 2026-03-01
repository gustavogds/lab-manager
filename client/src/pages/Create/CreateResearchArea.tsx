import { useState } from "react";
import { useNavigate } from "react-router";
import { createResearchArea } from "helpers/api/content";
import { FaArrowLeft } from "react-icons/fa";
import "./CreateResearchArea.scss";

const CreateResearchArea = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      setError("O título é obrigatório.");
      return;
    }

    if (!formData.description.trim()) {
      setError("A descrição é obrigatória.");
      return;
    }

    setIsSubmitting(true);
    setError("");
    setMessage("");

    const response = await createResearchArea(formData);

    setIsSubmitting(false);

    if (response.success) {
      setMessage(response.message || "Área de pesquisa criada com sucesso!");
      setError("");
      
      // Limpar formulário
      setFormData({ title: "", description: "" });
      
      setTimeout(() => {
        navigate(-1);
      }, 1500);
    } else {
      setError(response.error || "Falha ao criar área de pesquisa.");
      setMessage("");
    }
  };

  return (
    <div className="page-layout">
      <div className="page-container">
        <button className="btn-back" onClick={() => navigate(-1)}>
          <FaArrowLeft /> Voltar
        </button>

        <header className="page-header">
          <h1>Nova Área de Pesquisa</h1>
          <p>Preencha os campos abaixo para criar uma nova área de pesquisa</p>
        </header>

        {message && <div className="msg-success">{message}</div>}
        {error && <div className="msg-error">{error}</div>}

        <form onSubmit={handleSubmit} className="research-area-form">
          <div className="form-field">
            <label htmlFor="title">Título *</label>
            <input
              id="title"
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Ex: Inteligência Artificial"
              maxLength={255}
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="description">Descrição *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Descreva a área de pesquisa, objetivos e linhas de investigação..."
              rows={6}
              required
            />
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn-cancel"
              onClick={() => navigate(-1)}
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-confirm"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Criando..." : "Criar Área de Pesquisa"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateResearchArea;
