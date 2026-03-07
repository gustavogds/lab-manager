import React, { useState } from "react";
import { updatePosition, deletePosition } from "helpers/api/content";
import type { Position } from "helpers/api/content";

import { ModalsHandler } from "components/my-own-modal-handler";
import "pages/Manage/ManageContent.scss";

interface PositionEditorProps {
  position: Position;
  onConfirm: () => void;
  onCancel?: () => void;
}

const PositionEditor: React.FC<PositionEditorProps> = ({
  position,
  onConfirm,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    name: position.name,
    is_visible: position.is_visible,
    order: position.order,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? e.target.checked : type === "number" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setError("O nome é obrigatório.");
      return;
    }

    setIsSaving(true);
    setError("");

    const response = await updatePosition(position.id, {
      name: formData.name.trim(),
      order: formData.order,
      is_visible: formData.is_visible,
    });
    setIsSaving(false);

    if (response.success) {
      ModalsHandler.createNotification({
        title: "Sucesso",
        message: "Cargo atualizado com sucesso!",
        type: "success",
      });
      onConfirm();
      onCancel?.();
    } else {
      ModalsHandler.createNotification({
        title: "Erro",
        message: response.error || "Falha ao atualizar cargo.",
        type: "error",
      });
      setError(response.error || "Falha ao atualizar cargo.");
    }
  };

  const handleDelete = async () => {
    if (
      !confirm(
        `Tem certeza que deseja excluir o cargo "${position.name}"? Ele será removido dos usuários vinculados.`
      )
    )
      return;

    setIsSaving(true);
    setError("");
    const response = await deletePosition(position.id);
    setIsSaving(false);

    if (response.success) {
      ModalsHandler.createNotification({
        title: "Sucesso",
        message: "Cargo excluído com sucesso!",
        type: "success",
      });
      onConfirm();
      onCancel?.();
    } else {
      ModalsHandler.createNotification({
        title: "Erro",
        message: response.error || "Falha ao excluir cargo.",
        type: "error",
      });
      setError(response.error || "Falha ao excluir cargo.");
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
      <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header-shared">
          <h2>Editar Cargo</h2>
          <button className="btn-close-modal" onClick={handleCancel}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body-shared">
          {error && <div className="msg-error">{error}</div>}

          <div className="form-field">
            <label htmlFor="position-name">Nome *</label>
            <input
              id="position-name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Nome do cargo"
              maxLength={255}
              required
              autoFocus
            />
          </div>

          <div className="form-field">
            <label htmlFor="position-order">Ordem</label>
            <input
              id="position-order"
              type="number"
              name="order"
              value={formData.order}
              onChange={handleChange}
              min={0}
            />
            <span className="field-hint">Menor valor = aparece primeiro na lista</span>
          </div>

          <div className="form-field">
            <label htmlFor="position-visible">Visibilidade</label>
            <label className="checkbox-label">
              <input
                id="position-visible"
                type="checkbox"
                name="is_visible"
                checked={formData.is_visible}
                onChange={handleChange}
              />
              Mostrar cargo nas informações do usuário
            </label>
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

export default PositionEditor;
