import React, { useState } from "react";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
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
      setError(t("Name is required."));
      return;
    }

    setIsSaving(true);
    setError("");

    const response = await updateEquipmentState(state.id, { name: formData.name.trim() });
    setIsSaving(false);

    if (response.success) {
      ModalsHandler.createNotification({
        title: t("Success"),
        message: t("State updated successfully!"),
        type: "success",
      });
      onConfirm();
      onCancel?.();
    } else {
      ModalsHandler.createNotification({
        title: t("Error"),
        message: response.error || t("Failed to update state."),
        type: "error",
      });
      setError(response.error || t("Failed to update state."));
    }
  };

  const handleDelete = async () => {
    if (
      !confirm(
        t(`Are you sure you want to delete the state "{{name}}"? Equipment with this state will have no state defined.`, { name: state.name })
      )
    )
      return;

    setIsSaving(true);
    setError("");
    const response = await deleteEquipmentState(state.id);
    setIsSaving(false);

    if (response.success) {
      ModalsHandler.createNotification({
        title: t("Success"),
        message: t("State deleted successfully!"),
        type: "success",
      });
      onConfirm();
      onCancel?.();
    } else {
      ModalsHandler.createNotification({
        title: t("Error"),
        message: response.error || t("Failed to delete state."),
        type: "error",
      });
      setError(response.error || t("Failed to delete state."));
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
          <h2>{t("Edit Equipment State")}</h2>
          <button className="btn-close-modal" onClick={handleCancel}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body-shared">
          {error && <div className="editor-error">{error}</div>}

          <div className="form-field">
            <label htmlFor="state-name">{t("Name")} *</label>
            <input
              id="state-name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder={t("State name")}
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

export default EquipmentStateEditor;
