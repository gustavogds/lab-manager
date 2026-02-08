import React, { useState } from "react";
import { updateResearchArea, deleteResearchArea } from "helpers/api/content";
import type { ResearchArea } from "helpers/api/content";
import { FaTimes } from "react-icons/fa";
import { ModalsHandler } from "components/my-own-modal-handler";
import "pages/Manage/ManageContent.scss";

interface ResearchAreaEditorProps {
  researchArea: ResearchArea;
  onConfirm: () => void;
  onCancel?: () => void;
}

const ResearchAreaEditor: React.FC<ResearchAreaEditorProps> = ({
  researchArea,
  onConfirm,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    title: researchArea.title,
    description: researchArea.description || "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

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

    setIsSaving(true);
    setError("");

    const payload: Record<string, any> = {
      title: formData.title,
      description: formData.description.trim() || "",
    };

    const response = await updateResearchArea(researchArea.id, payload);
    setIsSaving(false);

    if (response.success) {
      ModalsHandler.createNotification({
        title: "Sucesso",
        message: "Área de pesquisa atualizada!",
        type: "success",
      });
      onConfirm();
      onCancel?.();
    } else {
      ModalsHandler.createNotification({
        title: "Erro",
        message: response.error || "Falha ao atualizar área de pesquisa.",
        type: "error",
      });
      setError(response.error || "Falha ao atualizar área de pesquisa.");
    }
  };

  const handleToggleActive = async () => {
    setIsSaving(true);
    setError("");
    const response = await updateResearchArea(researchArea.id, {
      is_active: !researchArea.is_active,
    });
    setIsSaving(false);

    if (response.success) {
      ModalsHandler.createNotification({
        title: "Sucesso",
        message: researchArea.is_active
          ? "Área de pesquisa desativada!"
          : "Área de pesquisa ativada!",
        type: "success",
      });
      onConfirm();
      onCancel?.();
    } else {
      setError(response.error || "Falha ao atualizar área de pesquisa.");
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Tem certeza que deseja excluir "${researchArea.title}"?`)) return;

    setIsSaving(true);
    setError("");
    const response = await deleteResearchArea(researchArea.id);
    setIsSaving(false);

    if (response.success) {
      ModalsHandler.createNotification({
        title: "Sucesso",
        message: "Área de pesquisa excluída com sucesso!",
        type: "success",
      });
      onConfirm();
      onCancel?.();
    } else {
      ModalsHandler.createNotification({
        title: "Erro",
        message: response.error || "Falha ao excluir área de pesquisa.",
        type: "error",
      });
      setError(response.error || "Falha ao excluir área de pesquisa.");
    }
  };

  const handleCancel = () => {
    onCancel?.();
  };

  return (
    <div
      className="content-editor-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleCancel();
        }
      }}
    >
      <div
        className="content-editor-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="editor-header">
          <h2>Editar Área de Pesquisa</h2>
          <button className="close-btn" onClick={handleCancel}>
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="editor-form">
          {error && <div className="editor-error">{error}</div>}

          <div className="form-field">
            <label htmlFor="ra-title">Título *</label>
            <input
              id="ra-title"
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Título da área de pesquisa"
              maxLength={255}
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="ra-description">Descrição</label>
            <textarea
              id="ra-description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Descrição da área de pesquisa"
              rows={4}
            />
          </div>

          <div className="editor-actions">
            <div className="left-actions">
              <button
                type="button"
                className="danger-btn"
                onClick={handleDelete}
                disabled={isSaving}
              >
                Excluir
              </button>
              <button
                type="button"
                className="toggle-btn"
                onClick={handleToggleActive}
                disabled={isSaving}
              >
                {researchArea.is_active ? "Desativar" : "Ativar"}
              </button>
            </div>
            <div className="right-actions">
              <button type="button" className="cancel-btn" onClick={handleCancel}>
                Cancelar
              </button>
              <button type="submit" className="confirm-btn" disabled={isSaving}>
                {isSaving ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResearchAreaEditor;
