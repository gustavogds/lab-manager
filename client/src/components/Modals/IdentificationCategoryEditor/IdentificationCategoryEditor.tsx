import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { updateIdentificationCategory, deleteIdentificationCategory } from "helpers/api/content";
import type { IdentificationCategory } from "helpers/api/content";

import { ModalsHandler } from "components/my-own-modal-handler";
import "pages/Manage/ManageContent.scss";

interface IdentificationCategoryEditorProps {
  category: IdentificationCategory;
  onConfirm: () => void;
  onCancel?: () => void;
}

const IdentificationCategoryEditor: React.FC<IdentificationCategoryEditorProps> = ({
  category,
  onConfirm,
  onCancel,
}) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: category.name,
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

    const response = await updateIdentificationCategory(category.id, { name: formData.name.trim() });
    setIsSaving(false);

    if (response.success) {
      ModalsHandler.createNotification({
        title: t("Success"),
        message: t("Category updated successfully!"),
        type: "success",
      });
      onConfirm();
      onCancel?.();
    } else {
      ModalsHandler.createNotification({
        title: t("Error"),
        message: response.error || t("Failed to update category."),
        type: "error",
      });
      setError(response.error || t("Failed to update category."));
    }
  };

  const handleDelete = async () => {
    if (
      !confirm(
        t(`Are you sure you want to delete the category "{{name}}"? Equipment in this category will have no category defined.`, { name: category.name })
      )
    )
      return;

    setIsSaving(true);
    setError("");
    const response = await deleteIdentificationCategory(category.id);
    setIsSaving(false);

    if (response.success) {
      ModalsHandler.createNotification({
        title: t("Success"),
        message: t("Category deleted successfully!"),
        type: "success",
      });
      onConfirm();
      onCancel?.();
    } else {
      ModalsHandler.createNotification({
        title: t("Error"),
        message: response.error || t("Failed to delete category."),
        type: "error",
      });
      setError(response.error || t("Failed to delete category."));
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
          <h2>{t("Edit Identification Category")}</h2>
          <button className="btn-close-modal" onClick={handleCancel}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body-shared">
          {error && <div className="editor-error">{error}</div>}

          <div className="form-field">
            <label htmlFor="category-name">{t("Name")} *</label>
            <input
              id="category-name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder={t("Category name")}
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

export default IdentificationCategoryEditor;
