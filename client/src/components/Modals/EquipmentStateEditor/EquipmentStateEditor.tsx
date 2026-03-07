import React, { useState } from "react";
import { updateEquipmentState, deleteEquipmentState } from "helpers/api/content";
import type { EquipmentState } from "helpers/api/content";

import { ModalsHandler } from "components/my-own-modal-handler";
import "pages/Manage/ManageContent.scss";

interface EquipmentStateEditorProps {
  state: EquipmentState;
  onConfirm: () => void;
  onCancel?: () => void;
}

const EquipmentStateEditor: React.FC<EquipmentStateEditorProps> = ({
  state,
  onConfirm,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    name: state.name,
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

    const response = await updateEquipmentState(state.id, { name: formData.name.trim() });
    setIsSaving(false);

    if (response.success) {
      ModalsHandler.createNotification({
        title: "Sucesso",
        message: "Estado atualizado com sucesso!",
        type: "success",
      });
      onConfirm();
      onCancel?.();
    } else {
      ModalsHandler.createNotification({
        title: "Erro",
        message: response.error || "Falha ao atualizar estado.",
        type: "error",
      });
      setError(response.error || "Falha ao atualizar estado.");
    }
  };

  const handleDelete = async () => {
    if (
      !confirm(
        `Tem certeza que deseja excluir o estado "${state.name}"? Os equipamentos com este estado ficarão sem estado definido.`
      )
    )
      return;

    setIsSaving(true);
    setError("");
    const response = await deleteEquipmentState(state.id);
    setIsSaving(false);

    if (response.success) {
      ModalsHandler.createNotification({
        title: "Sucesso",
        message: "Estado excluído com sucesso!",
        type: "success",
      });
      onConfirm();
      onCancel?.();
    } else {
      ModalsHandler.createNotification({
        title: "Erro",
        message: response.error || "Falha ao excluir estado.",
        type: "error",
      });
      setError(response.error || "Falha ao excluir estado.");
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
          <h2>Editar Estado do Equipamento</h2>
          <button className="btn-close-modal" onClick={handleCancel}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body-shared">
          {error && <div className="editor-error">{error}</div>}

          <div className="form-field">
            <label htmlFor="state-name">Nome *</label>
            <input
              id="state-name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Nome do estado"
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

export default EquipmentStateEditor;
