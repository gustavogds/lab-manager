import React, { useState, useEffect } from "react";
import { listApprovedUsers, updateEquipment, deleteEquipment } from "helpers/api/content";
import type { Equipment, User } from "helpers/api/content";
import { FaTimes } from "react-icons/fa";
import { ModalsHandler } from "components/my-own-modal-handler";
import "pages/Manage/ManageContent.scss";

interface EquipmentEditorProps {
  equipment: Equipment;
  onConfirm: () => void;
  onCancel?: () => void;
}

const EquipmentEditor: React.FC<EquipmentEditorProps> = ({
  equipment,
  onConfirm,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    name: equipment.name,
    custom_id: equipment.custom_id,
    location: equipment.location || "",
    assigned_to: equipment.assigned_to?.id || null as number | null,
  });
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

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
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAssignedChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setFormData((prev) => ({
      ...prev,
      assigned_to: value ? Number(value) : null,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setError("O nome é obrigatório.");
      return;
    }
    if (!formData.custom_id.trim()) {
      setError("O ID do equipamento é obrigatório.");
      return;
    }

    setIsSaving(true);
    setError("");

    const payload: Record<string, any> = {
      name: formData.name,
      custom_id: formData.custom_id,
      location: formData.location.trim() || null,
      assigned_to: formData.assigned_to,
    };

    const response = await updateEquipment(equipment.id, payload);
    setIsSaving(false);

    if (response.success) {
      ModalsHandler.createNotification({
        title: "Sucesso",
        message: equipment.is_active
          ? "Equipamento desativado!"
          : "Equipamento ativado!",
        type: "success",
      });
      onConfirm();
      onCancel?.();
    } else {
      ModalsHandler.createNotification({
        title: "Erro",
        message: response.error || "Falha ao atualizar equipamento.",
        type: "error",
      });
      setError(response.error || "Falha ao atualizar equipamento.");
    }
  };

  const handleToggleActive = async () => {
    setIsSaving(true);
    setError("");
    const response = await updateEquipment(equipment.id, {
      is_active: !equipment.is_active,
    });
    setIsSaving(false);

    if (response.success) {
      onConfirm();
      onCancel?.();
    } else {
      setError(response.error || "Falha ao atualizar equipamento.");
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Tem certeza que deseja excluir "${equipment.name}"?`)) return;

    setIsSaving(true);
    setError("");
    const response = await deleteEquipment(equipment.id);
    setIsSaving(false);

    if (response.success) {
      ModalsHandler.createNotification({
        title: "Sucesso",
        message: "Equipamento excluído com sucesso!",
        type: "success",
      });
      onConfirm();
      onCancel?.();
    } else {
      ModalsHandler.createNotification({
        title: "Erro",
        message: response.error || "Falha ao excluir equipamento.",
        type: "error",
      });
      setError(response.error || "Falha ao excluir equipamento.");
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
          <h2>Editar Equipamento</h2>
          <button className="close-btn" onClick={handleCancel}>
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="editor-form">
          {error && <div className="editor-error">{error}</div>}

          <div className="form-field">
            <label htmlFor="eq-name">Nome *</label>
            <input
              id="eq-name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Nome do equipamento"
              maxLength={255}
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="eq-custom-id">ID do Equipamento *</label>
            <input
              id="eq-custom-id"
              type="text"
              name="custom_id"
              value={formData.custom_id}
              onChange={handleChange}
              placeholder="Ex: mon_001"
              maxLength={100}
              required
            />
            <small className="field-hint">
              Identificador único do equipamento no laboratório
            </small>
          </div>

          <div className="form-field">
            <label htmlFor="eq-location">Localização</label>
            <input
              id="eq-location"
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="Ex: Sala 401"
              maxLength={255}
            />
          </div>

          <div className="form-field">
            <label htmlFor="eq-assigned">Responsável</label>
            {isLoading ? (
              <p>Carregando usuários...</p>
            ) : (
              <select
                id="eq-assigned"
                name="assigned_to"
                value={formData.assigned_to ?? ""}
                onChange={handleAssignedChange}
              >
                <option value="">Nenhum</option>
                {availableUsers.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name} ({user.email})
                  </option>
                ))}
              </select>
            )}
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
                {equipment.is_active ? "Desativar" : "Ativar"}
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

export default EquipmentEditor;
