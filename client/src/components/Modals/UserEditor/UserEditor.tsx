import React, { useState } from "react";
import { updateUser, deleteUser } from "helpers/api/content";
import type { User, Room, Position } from "helpers/api/content";
import { ModalsHandler } from "components/my-own-modal-handler";
import MultiSelect from "components/MultiSelect/MultiSelect";
import "pages/Manage/ManageContent.scss";
import "./UserEditor.scss";

interface UserEditorProps {
  user: User;
  rooms: Room[];
  positions: Position[];
  onConfirm: () => void;
  onCancel?: () => void;
}

const AVAILABLE_ROLES = [
  { id: 1, name: "Professor", value: "professor" },
  { id: 2, name: "Estudante", value: "student" },
  { id: 3, name: "Colaborador", value: "collaborator" },
  { id: 4, name: "Gestor de Inventário", value: "inventory_manager" },
];

type RoleOption = (typeof AVAILABLE_ROLES)[number];

const UserEditor: React.FC<UserEditorProps> = ({
  user,
  rooms,
  positions,
  onConfirm,
  onCancel,
}) => {
  const initialPositions = user.positions || (user.position ? [user.position] : []);
  const initialRoles = AVAILABLE_ROLES.filter((r) => (user.roles || []).includes(r.value));
  const [formData, setFormData] = useState({
    selectedRoles: initialRoles,
    selectedPositions: initialPositions,
    room_id: user.room?.id ?? (null as number | null),
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const handleRolesChange = (selected: RoleOption[]) => {
    setFormData((prev) => ({
      ...prev,
      selectedRoles: selected,
    }));
  };

  const handlePositionsChange = (selected: Position[]) => {
    setFormData((prev) => ({
      ...prev,
      selectedPositions: selected,
    }));
  };

  const handleRoomChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setFormData((prev) => ({
      ...prev,
      room_id: value ? Number(value) : null,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.selectedRoles.length === 0) {
      setError("O usuário deve ter pelo menos uma função.");
      return;
    }

    setIsSaving(true);
    setError("");

    const response = await updateUser(user.id, {
      roles: formData.selectedRoles.map((r) => r.value),
      position_ids: formData.selectedPositions.map((p) => p.id),
      room_id: formData.room_id,
    });

    setIsSaving(false);

    if (response.success) {
      ModalsHandler.createNotification({
        title: "Sucesso",
        message: "Usuário atualizado com sucesso!",
        type: "success",
      });
      onConfirm();
      onCancel?.();
    } else {
      ModalsHandler.createNotification({
        title: "Erro",
        message: response.error || "Falha ao atualizar usuário.",
        type: "error",
      });
      setError(response.error || "Falha ao atualizar usuário.");
    }
  };

  const handleToggleActive = async () => {
    setIsSaving(true);
    setError("");
    const response = await updateUser(user.id, {
      is_active: !user.is_active,
    });
    setIsSaving(false);

    if (response.success) {
      ModalsHandler.createNotification({
        title: "Sucesso",
        message: user.is_active ? "Usuário desativado!" : "Usuário ativado!",
        type: "success",
      });
      onConfirm();
      onCancel?.();
    } else {
      setError(response.error || "Falha ao atualizar usuário.");
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Tem certeza que deseja excluir "${user.name || user.email}"?`)) return;

    setIsSaving(true);
    setError("");
    const response = await deleteUser(user.id);
    setIsSaving(false);

    if (response.success) {
      ModalsHandler.createNotification({
        title: "Sucesso",
        message: "Usuário excluído com sucesso!",
        type: "success",
      });
      onConfirm();
      onCancel?.();
    } else {
      ModalsHandler.createNotification({
        title: "Erro",
        message: response.error || "Falha ao excluir usuário.",
        type: "error",
      });
      setError(response.error || "Falha ao excluir usuário.");
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
      <div className="modal-panel user-editor-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header-shared">
          <h2>Editar Usuário</h2>
          <button className="btn-close-modal" onClick={handleCancel}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body-shared">
          <div className="user-info-header">
            {user.profile_image && (
              <img src={user.profile_image} alt="" className="user-avatar-large" />
            )}
            <div className="user-details">
              <span className="user-name">{user.name || "Sem nome"}</span>
              <span className="user-email">{user.email}</span>
              {user.username && <span className="user-username">@{user.username}</span>}
            </div>
          </div>

          {error && <div className="msg-error">{error}</div>}

          <div className="form-field">
            <MultiSelect
              label="Funções"
              options={AVAILABLE_ROLES}
              selected={formData.selectedRoles}
              onChange={handleRolesChange}
              placeholder="Selecione as funções..."
            />
          </div>

          <div className="form-field">
            <MultiSelect
              label="Cargos"
              options={positions}
              selected={formData.selectedPositions}
              onChange={handlePositionsChange}
              placeholder="Selecione os cargos..."
            />
          </div>

          <div className="form-field">
            <label htmlFor="room_id">Sala</label>
            <select
              id="room_id"
              value={formData.room_id || ""}
              onChange={handleRoomChange}
            >
              <option value="">Nenhuma</option>
              {rooms.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>

          <div className="modal-actions">
            <div className="left-actions">
              <button
                type="button"
                className="btn-toggle"
                onClick={handleToggleActive}
                disabled={isSaving}
              >
                {user.is_active ? "Desativar" : "Ativar"}
              </button>
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
              <button
                type="button"
                className="btn-cancel"
                onClick={handleCancel}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn-confirm"
                disabled={isSaving}
              >
                {isSaving ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserEditor;
