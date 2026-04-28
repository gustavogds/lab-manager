import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { listApprovedUsers, updateProject, deleteProject } from "helpers/api/content";
import type { Project, User } from "helpers/api/content";
import { localized } from "helpers/i18n";

import { ModalsHandler } from "components/my-own-modal-handler";
import MultiSelect from "components/MultiSelect/MultiSelect";
import "pages/Manage/ManageContent.scss";

interface ProjectManageEditorProps {
  project: Project;
  onConfirm: () => void;
  onCancel?: () => void;
}

const ProjectManageEditor: React.FC<ProjectManageEditorProps> = ({
  project,
  onConfirm,
  onCancel,
}) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    title_pt: project.title_pt || "",
    title_en: project.title_en || "",
    description_pt: project.description_pt || "",
    description_en: project.description_en || "",
    members: project.members as User[],
  });
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      const response = await listApprovedUsers();
      if (response.success) {
        setAvailableUsers(response.data);
      }
      setIsLoadingUsers(false);
    };
    fetchUsers();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleMembersChange = (members: User[]) => {
    setFormData((prev) => ({ ...prev, members }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title_pt.trim() && !formData.title_en.trim()) {
      setError(t("Title is required."));
      return;
    }

    setIsSaving(true);
    setError("");

    const payload: Record<string, any> = {
      title_pt: formData.title_pt,
      title_en: formData.title_en,
      description_pt: formData.description_pt.trim() || "",
      description_en: formData.description_en.trim() || "",
      members: formData.members.map((m) => m.id),
    };

    const response = await updateProject(project.id, payload);
    setIsSaving(false);

    if (response.success) {
      ModalsHandler.createNotification({
        title: t("Success"),
        message: t("Project updated!"),
        type: "success",
      });
      onConfirm();
      onCancel?.();
    } else {
      ModalsHandler.createNotification({
        title: t("Error"),
        message: response.error || t("Failed to update project."),
        type: "error",
      });
      setError(response.error || t("Failed to update project."));
    }
  };

  const handleToggleActive = async () => {
    setIsSaving(true);
    setError("");
    const response = await updateProject(project.id, {
      is_active: !project.is_active,
    });
    setIsSaving(false);

    if (response.success) {
      ModalsHandler.createNotification({
        title: t("Success"),
        message: project.is_active
          ? t("Project deactivated!")
          : t("Project activated!"),
        type: "success",
      });
      onConfirm();
      onCancel?.();
    } else {
      setError(response.error || t("Failed to update project."));
    }
  };

  const handleDelete = async () => {
    if (!confirm(t(`Are you sure you want to delete "{{title}}"?`, { title: localized(project, "title") }))) return;

    setIsSaving(true);
    setError("");
    const response = await deleteProject(project.id);
    setIsSaving(false);

    if (response.success) {
      ModalsHandler.createNotification({
        title: t("Success"),
        message: t("Project deleted successfully!"),
        type: "success",
      });
      onConfirm();
      onCancel?.();
    } else {
      ModalsHandler.createNotification({
        title: t("Error"),
        message: response.error || t("Failed to delete project."),
        type: "error",
      });
      setError(response.error || t("Failed to delete project."));
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
          <h2>{t("Edit Project")}</h2>
          <button className="btn-close-modal" onClick={handleCancel}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body-shared">
          {error && <div className="editor-error">{error}</div>}

          <div className="form-field">
            <label htmlFor="pj-title-pt">{t("Title")} <span className="lang-badge">PT</span></label>
            <input
              id="pj-title-pt"
              type="text"
              name="title_pt"
              value={formData.title_pt}
              onChange={handleChange}
              placeholder={t("Project title")}
              maxLength={255}
            />
          </div>

          <div className="form-field">
            <label htmlFor="pj-title-en">{t("Title")} <span className="lang-badge">EN</span></label>
            <input
              id="pj-title-en"
              type="text"
              name="title_en"
              value={formData.title_en}
              onChange={handleChange}
              placeholder={t("Project title")}
              maxLength={255}
            />
          </div>

          <div className="form-field">
            <label htmlFor="pj-description-pt">{t("Description")} <span className="lang-badge">PT</span></label>
            <textarea
              id="pj-description-pt"
              name="description_pt"
              value={formData.description_pt}
              onChange={handleChange}
              placeholder={t("Project description")}
              rows={4}
            />
          </div>

          <div className="form-field">
            <label htmlFor="pj-description-en">{t("Description")} <span className="lang-badge">EN</span></label>
            <textarea
              id="pj-description-en"
              name="description_en"
              value={formData.description_en}
              onChange={handleChange}
              placeholder={t("Project description")}
              rows={4}
            />
          </div>

          <div className="form-field">
            {isLoadingUsers ? (
              <p>{t("Loading users...")}</p>
            ) : (
              <MultiSelect
                label={t("Members")}
                options={availableUsers}
                selected={formData.members}
                onChange={handleMembersChange}
                placeholder={t("Select members...")}
              />
            )}
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
                {project.is_active ? t("Deactivate") : t("Activate")}
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

export default ProjectManageEditor;
