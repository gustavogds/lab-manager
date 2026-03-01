import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import type { User } from "helpers/api/content";
import { createProject, listApprovedUsers } from "helpers/api/content";
import MultiSelect from "components/MultiSelect/MultiSelect";
import { FaArrowLeft } from "react-icons/fa";
import "./CreateProject.scss";

const CreateProject = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    members: [] as User[],
  });
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      const response = await listApprovedUsers();
      if (response.success) {
        setAvailableUsers(response.data);
      }
    };
    fetchUsers();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleMembersChange = (members: User[]) => {
    setFormData((prev) => ({ ...prev, members }));
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

    const projectData = {
      title: formData.title,
      description: formData.description,
      members: formData.members.map((m) => m.id),
    };

    const response = await createProject(projectData as any);

    setIsSubmitting(false);

    if (response.success) {
      setMessage(response.message || "Projeto criado com sucesso!");
      setError("");
      setFormData({ title: "", description: "", members: [] });
      
      setTimeout(() => {
        navigate(-1);
      }, 1500);
    } else {
      setError(response.error || "Falha ao criar projeto.");
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
          <h1>Novo Projeto</h1>
          <p>Preencha os campos abaixo para criar um novo projeto</p>
        </header>

        {message && <div className="msg-success">{message}</div>}
        {error && <div className="msg-error">{error}</div>}

        <form onSubmit={handleSubmit} className="project-form">
          <div className="form-field">
            <label htmlFor="title">Título *</label>
            <input
              id="title"
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Ex: Sistema de Gestão Laboratorial"
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
              placeholder="Descreva o projeto, objetivos, metodologia e resultados esperados..."
              rows={6}
              required
            />
          </div>

          <div className="form-field">
            <MultiSelect
              label="Integrantes"
              options={availableUsers}
              selected={formData.members}
              onChange={handleMembersChange}
              placeholder="Selecione os integrantes do projeto..."
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
              {isSubmitting ? "Criando..." : "Criar Projeto"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProject;
