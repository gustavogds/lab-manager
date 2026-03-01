import React, { useState, useEffect } from "react";
import { listApprovedUsers } from "helpers/api/content";
import type { Project, User } from "helpers/api/content";
import MultiSelect from "components/MultiSelect/MultiSelect";

import "./ProjectEditor.scss";

interface ProjectEditorProps {
  project: Project;
  onConfirm: (data: {
    title: string;
    description: string;
    members: User[];
  }) => void;
  onCancel?: () => void;
}

const ProjectEditor: React.FC<ProjectEditorProps> = ({
  project,
  onConfirm,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    title: project.title,
    description: project.description,
    members: project.members || [],
  });
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      const response = await listApprovedUsers();
      if (response.success) {
        setAvailableUsers(response.data);
      }
      setIsLoading(false);
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert("Título é obrigatório");
      return;
    }
    if (!formData.description.trim()) {
      alert("Descrição é obrigatória");
      return;
    }
    onConfirm(formData);
  };

  const handleCancel = () => {
    onCancel?.();
  };

  return (
    <div 
      className="modal-overlay-shared"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleCancel();
        }
      }}
    >
      <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header-shared">
          <h2>Editar Projeto</h2>
          <button className="btn-close-modal" onClick={handleCancel}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body-shared">
          <div className="form-field">
            <label htmlFor="title">Título *</label>
            <input
              id="title"
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Título do projeto"
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
              placeholder="Descrição do projeto"
              rows={5}
              required
            />
          </div>

          <div className="form-field">
            {isLoading ? (
              <p>Carregando usuários...</p>
            ) : (
              <MultiSelect
                label="Integrantes"
                options={availableUsers}
                selected={formData.members}
                onChange={handleMembersChange}
                placeholder="Selecione os integrantes (Ordem definirá a ordem de exibição)..."
              />
            )}
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={handleCancel}>
              Cancelar
            </button>
            <button type="submit" className="btn-confirm">
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectEditor;
