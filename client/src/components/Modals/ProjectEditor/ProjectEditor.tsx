import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { listApprovedUsers } from "helpers/api/content";
import type { Project, User } from "helpers/api/content";
import MultiSelect from "components/MultiSelect/MultiSelect";

interface ProjectEditorProps {
  project: Project;
  onConfirm: (data: {
    title_pt: string;
    title_en: string;
    description_pt: string;
    description_en: string;
    link: string;
    members: User[];
  }) => void;
  onCancel?: () => void;
}

const ProjectEditor: React.FC<ProjectEditorProps> = ({
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
    link: project.link || "",
    members: project.members || [],
  });
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleMembersChange = (members: User[]) => {
    setFormData((prev) => ({ ...prev, members }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title_pt.trim() && !formData.title_en.trim()) {
      alert(t("Title is required."));
      return;
    }
    if (!formData.description_pt.trim() && !formData.description_en.trim()) {
      alert(t("Description is required."));
      return;
    }
    onConfirm(formData);
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
          <h2>{t("Edit Project")}</h2>
          <button className="btn-close-modal" onClick={handleCancel}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body-shared">
          <div className="form-field">
            <label htmlFor="title_pt">{t("Title")} <span className="lang-badge">PT</span></label>
            <input
              id="title_pt"
              type="text"
              name="title_pt"
              value={formData.title_pt}
              onChange={handleChange}
              placeholder={t("Project title")}
            />
          </div>

          <div className="form-field">
            <label htmlFor="title_en">{t("Title")} <span className="lang-badge">EN</span></label>
            <input
              id="title_en"
              type="text"
              name="title_en"
              value={formData.title_en}
              onChange={handleChange}
              placeholder="Project title"
            />
          </div>

          <div className="form-field">
            <label htmlFor="description_pt">{t("Description")} <span className="lang-badge">PT</span></label>
            <textarea
              id="description_pt"
              name="description_pt"
              value={formData.description_pt}
              onChange={handleChange}
              placeholder={t("Project description")}
              rows={5}
            />
          </div>

          <div className="form-field">
            <label htmlFor="description_en">{t("Description")} <span className="lang-badge">EN</span></label>
            <textarea
              id="description_en"
              name="description_en"
              value={formData.description_en}
              onChange={handleChange}
              placeholder="Project description"
              rows={5}
            />
          </div>

          <div className="form-field">
            <label htmlFor="link">{t("More info link")} <span className="optional-badge">{t("optional")}</span></label>
            <input
              id="link"
              type="url"
              name="link"
              value={formData.link}
              onChange={handleChange}
              placeholder="https://..."
            />
          </div>

          <div className="form-field">
            {isLoading ? (
              <p>{t("Loading users...")}</p>
            ) : (
              <MultiSelect
                label={t("Members")}
                options={availableUsers}
                selected={formData.members}
                onChange={handleMembersChange}
                placeholder={t("Select members (Order will define display order)...")}
              />
            )}
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={handleCancel}>
              {t("Cancel")}
            </button>
            <button type="submit" className="btn-confirm">
              {t("Save")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectEditor;
