import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { updatePosition, deletePosition } from "helpers/api/content";
import type { Position } from "helpers/api/content";
import { localized } from "helpers/i18n";

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
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name_pt: position.name_pt || "",
    name_en: position.name_en || "",
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

    if (!formData.name_pt.trim() && !formData.name_en.trim()) {
      setError(t("Name is required."));
      return;
    }

    setIsSaving(true);
    setError("");

    const response = await updatePosition(position.id, {
      name_pt: formData.name_pt.trim(),
      name_en: formData.name_en.trim(),
      order: formData.order,
      is_visible: formData.is_visible,
    });
    setIsSaving(false);

    if (response.success) {
      ModalsHandler.createNotification({
        title: t("Success"),
        message: t("Position updated successfully!"),
        type: "success",
      });
      onConfirm();
      onCancel?.();
    } else {
      ModalsHandler.createNotification({
        title: t("Error"),
        message: response.error || t("Failed to update position."),
        type: "error",
      });
      setError(response.error || t("Failed to update position."));
    }
  };

  const handleDelete = async () => {
    if (
      !confirm(
        t(`Are you sure you want to delete the position "{{name}}"? It will be removed from associated users.`, { name: localized(position, "name") })
      )
    )
      return;

    setIsSaving(true);
    setError("");
    const response = await deletePosition(position.id);
    setIsSaving(false);

    if (response.success) {
      ModalsHandler.createNotification({
        title: t("Success"),
        message: t("Position deleted successfully!"),
        type: "success",
      });
      onConfirm();
      onCancel?.();
    } else {
      ModalsHandler.createNotification({
        title: t("Error"),
        message: response.error || t("Failed to delete position."),
        type: "error",
      });
      setError(response.error || t("Failed to delete position."));
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
          <h2>{t("Edit Position")}</h2>
          <button className="btn-close-modal" onClick={handleCancel}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body-shared">
          {error && <div className="msg-error">{error}</div>}

          <div className="form-field">
            <label htmlFor="position-name-pt">{t("Name")} <span className="lang-badge">PT</span></label>
            <input
              id="position-name-pt"
              type="text"
              name="name_pt"
              value={formData.name_pt}
              onChange={handleChange}
              placeholder={t("Position name")}
              maxLength={255}
              autoFocus
            />
          </div>

          <div className="form-field">
            <label htmlFor="position-name-en">{t("Name")} <span className="lang-badge">EN</span></label>
            <input
              id="position-name-en"
              type="text"
              name="name_en"
              value={formData.name_en}
              onChange={handleChange}
              placeholder={t("Position name")}
              maxLength={255}
            />
          </div>

          <div className="form-field">
            <label htmlFor="position-order">{t("Order")}</label>
            <input
              id="position-order"
              type="number"
              name="order"
              value={formData.order}
              onChange={handleChange}
              min={0}
            />
            <span className="field-hint">{t("Lower value = appears first in the list")}</span>
          </div>

          <div className="form-field">
            <label htmlFor="position-visible">{t("Visibility")}</label>
            <label className="checkbox-label">
              <input
                id="position-visible"
                type="checkbox"
                name="is_visible"
                checked={formData.is_visible}
                onChange={handleChange}
              />
              {t("Show position in user information")}
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

export default PositionEditor;
