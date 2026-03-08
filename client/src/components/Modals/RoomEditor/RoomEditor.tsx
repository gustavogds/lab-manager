import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { updateRoom, deleteRoom } from "helpers/api/content";
import type { Room } from "helpers/api/content";

import { ModalsHandler } from "components/my-own-modal-handler";
import "pages/Manage/ManageContent.scss";

interface RoomEditorProps {
  room: Room;
  onConfirm: () => void;
  onCancel?: () => void;
}

const RoomEditor: React.FC<RoomEditorProps> = ({
  room,
  onConfirm,
  onCancel,
}) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: room.name,
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
      setError(t("Name is required."));
      return;
    }

    setIsSaving(true);
    setError("");

    const response = await updateRoom(room.id, { name: formData.name.trim() });
    setIsSaving(false);

    if (response.success) {
      ModalsHandler.createNotification({
        title: t("Success"),
        message: t("Room updated successfully!"),
        type: "success",
      });
      onConfirm();
      onCancel?.();
    } else {
      ModalsHandler.createNotification({
        title: t("Error"),
        message: response.error || t("Failed to update room."),
        type: "error",
      });
      setError(response.error || t("Failed to update room."));
    }
  };

  const handleDelete = async () => {
    if (
      !confirm(
        t(`Are you sure you want to delete the room "{{name}}"? Equipment in this room will have no room defined.`, { name: room.name })
      )
    )
      return;

    setIsSaving(true);
    setError("");
    const response = await deleteRoom(room.id);
    setIsSaving(false);

    if (response.success) {
      ModalsHandler.createNotification({
        title: t("Success"),
        message: t("Room deleted successfully!"),
        type: "success",
      });
      onConfirm();
      onCancel?.();
    } else {
      ModalsHandler.createNotification({
        title: t("Error"),
        message: response.error || t("Failed to delete room."),
        type: "error",
      });
      setError(response.error || t("Failed to delete room."));
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
          <h2>{t("Edit Room")}</h2>
          <button className="btn-close-modal" onClick={handleCancel}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body-shared">
          {error && <div className="editor-error">{error}</div>}

          <div className="form-field">
            <label htmlFor="room-name">{t("Name")} *</label>
            <input
              id="room-name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder={t("Room name")}
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
                {t("Delete")}
              </button>
            </div>
            <div className="right-actions">
              <button type="button" className="btn-cancel" onClick={handleCancel}>
                {t("Cancel")}
              </button>
              <button type="submit" className="btn-confirm" disabled={isSaving}>
                {isSaving ? t("Saving...") : t("Save")}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RoomEditor;
