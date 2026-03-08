import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { updateResearchArea, deleteResearchArea } from "helpers/api/content";
import type { ResearchArea } from "helpers/api/content";

import { ModalsHandler } from "components/my-own-modal-handler";
import "pages/Manage/ManageContent.scss";

interface ResearchAreaEditorProps {
  researchArea: ResearchArea;
  onConfirm: () => void;
  onCancel?: () => void;
}

const ResearchAreaEditor: React.FC<ResearchAreaEditorProps> = ({
  researchArea,
  onConfirm,
  onCancel,
}) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    title: researchArea.title,
    description: researchArea.description || "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      setError(t("Title is required."));
      return;
    }

    setIsSaving(true);
    setError("");

    const payload: Record<string, any> = {
      title: formData.title,
      description: formData.description.trim() || "",
    };

    const response = await updateResearchArea(researchArea.id, payload);
    setIsSaving(false);

    if (response.success) {
      ModalsHandler.createNotification({
        title: t("Success"),
        message: t("Research area updated!"),
        type: "success",
      });
      onConfirm();
      onCancel?.();
    } else {
      ModalsHandler.createNotification({
        title: t("Error"),
        message: response.error || t("Failed to update research area."),
        type: "error",
      });
      setError(response.error || t("Failed to update research area."));
    }
  };

  const handleToggleActive = async () => {
    setIsSaving(true);
    setError("");
    const response = await updateResearchArea(researchArea.id, {
      is_active: !researchArea.is_active,
    });
    setIsSaving(false);

    if (response.success) {
      ModalsHandler.createNotification({
        title: t("Success"),
        message: researchArea.is_active
          ? t("Research area deactivated!")
          : t("Research area activated!"),
        type: "success",
      });
      onConfirm();
      onCancel?.();
    } else {
      setError(response.error || t("Failed to update research area."));
    }
  };

  const handleDelete = async () => {
    if (!confirm(t(`Are you sure you want to delete "{{title}}"?`, { title: researchArea.title }))) return;

    setIsSaving(true);
    setError("");
    const response = await deleteResearchArea(researchArea.id);
    setIsSaving(false);

    if (response.success) {
      ModalsHandler.createNotification({
        title: t("Success"),
        message: t("Research area deleted successfully!"),
        type: "success",
      });
      onConfirm();
      onCancel?.();
    } else {
      ModalsHandler.createNotification({
        title: t("Error"),
        message: response.error || t("Failed to delete research area."),
        type: "error",
      });
      setError(response.error || t("Failed to delete research area."));
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
          <h2>{t("Edit Research Area")}</h2>
          <button className="btn-close-modal" onClick={handleCancel}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body-shared">
          {error && <div className="editor-error">{error}</div>}

          <div className="form-field">
            <label htmlFor="ra-title">{t("Title")} *</label>
            <input
              id="ra-title"
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder={t("Research area title")}
              maxLength={255}
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="ra-description">{t("Description")}</label>
            <textarea
              id="ra-description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder={t("Research area description")}
              rows={4}
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
              <button
                type="button"
                className="btn-toggle"
                onClick={handleToggleActive}
                disabled={isSaving}
              >
                {researchArea.is_active ? t("Deactivate") : t("Activate")}
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

export default ResearchAreaEditor;
