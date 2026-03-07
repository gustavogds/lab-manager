import React, { useState } from "react";
import { updateIdentificationCategory, deleteIdentificationCategory } from "helpers/api/content";
import type { IdentificationCategory } from "helpers/api/content";

import { ModalsHandler } from "components/my-own-modal-handler";
import "pages/Manage/ManageContent.scss";

interface IdentificationCategoryEditorProps {
  category: IdentificationCategory;
  onConfirm: () => void;
  onCancel?: () => void;
}

const IdentificationCategoryEditor: React.FC<IdentificationCategoryEditorProps> = ({
  category,
  onConfirm,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    name: category.name,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setError("O nome é obrigatório.");
      return;
    }

    setIsSaving(true);
    setError("");

    const response = await updateIdentificationCategory(category.id, { name: formData.name.trim() });
    setIsSaving(false);

    if (response.success) {
      ModalsHandler.createNotification({
        title: "Sucesso",
        message: "Categoria atualizada com sucesso!",
        type: "success",
      });
      onConfirm();
      onCancel?.();
    } else {
      ModalsHandler.createNotification({
        title: "Erro",
        message: response.error || "Falha ao atualizar categoria.",
        type: "error",
      });
      setError(response.error || "Falha ao atualizar categoria.");
    }
  };

  const handleDelete = async () => {
    if (
      !confirm(
        `Tem certeza que deseja excluir a categoria "${category.name}"? Os equipamentos desta categoria ficarão sem categoria definida.`
      )
    )
      return;

    setIsSaving(true);
    setError("");
    const response = await deleteIdentificationCategory(category.id);
    setIsSaving(false);

    if (response.success) {
      ModalsHandler.createNotification({
        title: "Sucesso",
        message: "Categoria excluída com sucesso!",
        type: "success",
      });
      onConfirm();
      onCancel?.();
    } else {
      ModalsHandler.createNotification({
        title: "Erro",
        message: response.error || "Falha ao excluir categoria.",
        type: "error",
      });
      setError(response.error || "Falha ao excluir categoria.");
    }
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
      <div
        className="modal-panel"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header-shared">
          <h2>Editar Categoria de Identificação</h2>
          <button className="btn-close-modal" onClick={handleCancel}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body-shared">
          {error && <div className="editor-error">{error}</div>}

          <div className="form-field">
            <label htmlFor="category-name">Nome *</label>
            <input
              id="category-name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Nome da categoria"
              maxLength={255}
              required
              autoFocus
            />
          </div>

          <div className="modal-actions">
            <div className="left-actions">
              <button
                type="button"
                className="btn-danger"
                onClick={handleDelete}
                disabled={isSaving}
              >
                Excluir
              </button>
            </div>
            <div className="right-actions">
              <button type="button" className="btn-cancel" onClick={handleCancel}>
                Cancelar
              </button>
              <button type="submit" className="btn-confirm" disabled={isSaving}>
                {isSaving ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default IdentificationCategoryEditor;
