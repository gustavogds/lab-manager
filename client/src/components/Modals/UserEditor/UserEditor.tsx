import React, { useState } from "react";
import { useTranslation } from "react-i18next";
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
  onConfirm: (updatedUser: User) => void;
  onDelete?: () => void;
  onCancel?: () => void;
}

const AVAILABLE_ROLES = [
  { id: 1, name: "Professor", value: "professor" },
  { id: 2, name: "Student", value: "student" },
  { id: 3, name: "Collaborator", value: "collaborator" },
  { id: 4, name: "Inventory Manager", value: "inventory_manager" },
];

type RoleOption = (typeof AVAILABLE_ROLES)[number];

const UserEditor: React.FC<UserEditorProps> = ({
  user,
  rooms,
  positions,
  onConfirm,
  onDelete,
  onCancel,
}) => {
  const { t } = useTranslation();
  const initialPositions = user.positions || (user.position ? [user.position] : []);
  const initialRoles = AVAILABLE_ROLES.filter((r) => (user.roles || []).includes(r.value));
  const initialRoom = user.room ? [user.room] : [];
  const [formData, setFormData] = useState({
    selectedRoles: initialRoles,
    selectedPositions: initialPositions,
    selectedRoom: initialRoom as Room[],
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

  const handleRoomChange = (selected: Room[]) => {
    setFormData((prev) => ({
      ...prev,
      selectedRoom: selected,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.selectedRoles.length === 0) {
      setError(t("User must have at least one role."));
      return;
    }

    setIsSaving(true);
    setError("");

    const response = await updateUser(user.id, {
      roles: formData.selectedRoles.map((r) => r.value),
      position_ids: formData.selectedPositions.map((p) => p.id),
      room_id: formData.selectedRoom.length > 0 ? formData.selectedRoom[0].id : null,
    });

    setIsSaving(false);

    if (response.success) {
      ModalsHandler.createNotification({
        title: t("Success"),
        message: t("User updated successfully!"),
        type: "success",
      });
      onConfirm(response.data);
      onCancel?.();
    } else {
      ModalsHandler.createNotification({
        title: t("Error"),
        message: response.error || t("Failed to update user."),
        type: "error",
      });
      setError(response.error || t("Failed to update user."));
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
        title: t("Success"),
        message: user.is_active ? t("User deactivated!") : t("User activated!"),
        type: "success",
      });
      onConfirm(response.data);
      onCancel?.();
    } else {
      setError(response.error || t("Failed to update user."));
    }
  };

  const handleDelete = async () => {
    if (!confirm(t(`Are you sure you want to delete "{{name}}"?`, { name: user.name || user.email }))) return;

    setIsSaving(true);
    setError("");
    const response = await deleteUser(user.id);
    setIsSaving(false);

    if (response.success) {
      ModalsHandler.createNotification({
        title: t("Success"),
        message: t("User deleted successfully!"),
        type: "success",
      });
      onDelete?.();
      onCancel?.();
    } else {
      ModalsHandler.createNotification({
        title: t("Error"),
        message: response.error || t("Failed to delete user."),
        type: "error",
      });
      setError(response.error || t("Failed to delete user."));
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
          <h2>{t("Edit User")}</h2>
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
              <span className="user-name">{user.name || t("No name")}</span>
              <span className="user-email">{user.email}</span>
              {user.username && <span className="user-username">@{user.username}</span>}
            </div>
          </div>

          {error && <div className="msg-error">{error}</div>}

          <div className="form-field">
            <MultiSelect
              label={t("Roles")}
              options={AVAILABLE_ROLES}
              selected={formData.selectedRoles}
              onChange={handleRolesChange}
              placeholder={t("Select roles...")}
            />
          </div>

          <div className="form-field">
            <MultiSelect
              label={t("Positions")}
              options={positions}
              selected={formData.selectedPositions}
              onChange={handlePositionsChange}
              placeholder={t("Select positions...")}
            />
          </div>

          <div className="form-field">
            <MultiSelect
              label={t("Room")}
              options={rooms}
              selected={formData.selectedRoom}
              onChange={handleRoomChange}
              singleSelect
              placeholder={t("None")}
            />
          </div>

          <div className="modal-actions">
            <div className="left-actions">
              <button
                type="button"
                className="btn-toggle"
                onClick={handleToggleActive}
                disabled={isSaving}
              >
                {user.is_active ? t("Deactivate") : t("Activate")}
              </button>
              <button
                type="button"
                className="btn-danger"
                onClick={handleDelete}
                disabled={isSaving}
              >
                {t("Delete")}
              </button>
            </div>
            <div className="right-actions">
              <button
                type="button"
                className="btn-cancel"
                onClick={handleCancel}
              >
                {t("Cancel")}
              </button>
              <button
                type="submit"
                className="btn-confirm"
                disabled={isSaving}
              >
                {isSaving ? t("Saving...") : t("Save")}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserEditor;
