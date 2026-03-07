import React, { useState } from "react";
import { updateRoomSection, deleteRoomSection } from "helpers/api/content";
import type { RoomSection } from "helpers/api/content";

import { ModalsHandler } from "components/my-own-modal-handler";
import "pages/Manage/ManageContent.scss";

interface RoomSectionEditorProps {
  section: RoomSection;
  roomName: string;
  onConfirm: () => void;
  onCancel?: () => void;
}

const RoomSectionEditor: React.FC<RoomSectionEditorProps> = ({
  section,
  roomName,
  onConfirm,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    name: section.name,
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

    const response = await updateRoomSection(section.id, { name: formData.name.trim() });
    setIsSaving(false);

    if (response.success) {
      ModalsHandler.createNotification({
        title: "Sucesso",
        message: "Seção atualizada com sucesso!",
        type: "success",
      });
      onConfirm();
      onCancel?.();
    } else {
      ModalsHandler.createNotification({
        title: "Erro",
        message: response.error || "Falha ao atualizar seção.",
        type: "error",
      });
      setError(response.error || "Falha ao atualizar seção.");
    }
  };

  const handleDelete = async () => {
    if (
      !confirm(
        `Tem certeza que deseja excluir a seção "${section.name}"? Os equipamentos desta seção ficarão sem seção definida.`
      )
    )
      return;

    setIsSaving(true);
    setError("");
    const response = await deleteRoomSection(section.id);
    setIsSaving(false);

    if (response.success) {
      ModalsHandler.createNotification({
        title: "Sucesso",
        message: "Seção excluída com sucesso!",
        type: "success",
      });
      onConfirm();
      onCancel?.();
    } else {
      ModalsHandler.createNotification({
        title: "Erro",
        message: response.error || "Falha ao excluir seção.",
        type: "error",
      });
      setError(response.error || "Falha ao excluir seção.");
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
          <h2>Editar Seção</h2>
          <button className="btn-close-modal" onClick={handleCancel}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body-shared">
          {error && <div className="editor-error">{error}</div>}

          <div className="form-info">
            <span className="info-label">Sala:</span>
            <span className="info-value">{roomName}</span>
          </div>

          <div className="form-field">
            <label htmlFor="section-name">Nome *</label>
            <input
              id="section-name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Nome da seção"
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

export default RoomSectionEditor;
