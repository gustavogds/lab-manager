import React, { useState } from "react";
import { updatePartnership, deletePartnership } from "helpers/api/content";
import type { Partnership } from "helpers/api/content";

import { ModalsHandler } from "components/my-own-modal-handler";
import "pages/Manage/ManageContent.scss";

interface PartnershipManageEditorProps {
  partnership: Partnership;
  onConfirm: () => void;
  onCancel?: () => void;
}

const PartnershipManageEditor: React.FC<PartnershipManageEditorProps> = ({
  partnership,
  onConfirm,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    name: partnership.name,
    link: partnership.link || "",
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

    const payload: Record<string, any> = {
      name: formData.name,
      link: formData.link.trim() || null,
    };

    const response = await updatePartnership(partnership.id, payload);
    setIsSaving(false);

    if (response.success) {
      ModalsHandler.createNotification({
        title: "Sucesso",
        message: "Parceria atualizada!",
        type: "success",
      });
      onConfirm();
      onCancel?.();
    } else {
      ModalsHandler.createNotification({
        title: "Erro",
        message: response.error || "Falha ao atualizar parceria.",
        type: "error",
      });
      setError(response.error || "Falha ao atualizar parceria.");
    }
  };

  const handleToggleActive = async () => {
    setIsSaving(true);
    setError("");
    const response = await updatePartnership(partnership.id, {
      is_active: !partnership.is_active,
    });
    setIsSaving(false);

    if (response.success) {
      ModalsHandler.createNotification({
        title: "Sucesso",
        message: partnership.is_active
          ? "Parceria desativada!"
          : "Parceria ativada!",
        type: "success",
      });
      onConfirm();
      onCancel?.();
    } else {
      setError(response.error || "Falha ao atualizar parceria.");
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Tem certeza que deseja excluir "${partnership.name}"?`)) return;

    setIsSaving(true);
    setError("");
    const response = await deletePartnership(partnership.id);
    setIsSaving(false);

    if (response.success) {
      ModalsHandler.createNotification({
        title: "Sucesso",
        message: "Parceria excluída com sucesso!",
        type: "success",
      });
      onConfirm();
      onCancel?.();
    } else {
      ModalsHandler.createNotification({
        title: "Erro",
        message: response.error || "Falha ao excluir parceria.",
        type: "error",
      });
      setError(response.error || "Falha ao excluir parceria.");
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
          <h2>Editar Parceria</h2>
          <button className="btn-close-modal" onClick={handleCancel}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body-shared">
          {error && <div className="editor-error">{error}</div>}

          <div className="form-field">
            <label htmlFor="pt-name">Nome *</label>
            <input
              id="pt-name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Nome da parceria"
              maxLength={255}
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="pt-link">Link</label>
            <input
              id="pt-link"
              type="url"
              name="link"
              value={formData.link}
              onChange={handleChange}
              placeholder="https://exemplo.com"
              maxLength={500}
            />
          </div>

          {partnership.logo && (
            <div className="form-field">
              <label>Logo atual</label>
              <img
                src={partnership.logo}
                alt={partnership.name}
                style={{ maxWidth: "120px", maxHeight: "80px", objectFit: "contain", borderRadius: "6px", border: "2px solid #e0e0e0" }}
              />
            </div>
          )}

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
              <button
                type="button"
                className="btn-toggle"
                onClick={handleToggleActive}
                disabled={isSaving}
              >
                {partnership.is_active ? "Desativar" : "Ativar"}
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

export default PartnershipManageEditor;
