import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import type { User } from "helpers/api/content";
import { createProject, listApprovedUsers } from "helpers/api/content";
import MultiSelect from "components/MultiSelect/MultiSelect";
import { FaArrowLeft } from "react-icons/fa";
import "./CreateProject.scss";

const CreateProject = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    members: [] as User[],
  });
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      const response = await listApprovedUsers();
      if (response.success) {
        setAvailableUsers(response.data);
      }
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
    
    if (!formData.title.trim()) {
      setError(t("Title is required."));
      return;
    }

    if (!formData.description.trim()) {
      setError(t("Description is required."));
      return;
    }

    setIsSubmitting(true);
    setError("");
    setMessage("");

    const projectData = {
      title: formData.title,
      description: formData.description,
      members: formData.members.map((m) => m.id),
    };

    const response = await createProject(projectData as any);

    setIsSubmitting(false);

    if (response.success) {
      setMessage(response.message || t("Project created successfully!"));
      setError("");
      setFormData({ title: "", description: "", members: [] });
      
      setTimeout(() => {
        navigate(-1);
      }, 1500);
    } else {
      setError(response.error || t("Failed to create project."));
      setMessage("");
    }
  };

  return (
    <div className="page-layout">
      <div className="page-container">
        <button className="btn-back" onClick={() => navigate(-1)}>
          <FaArrowLeft /> {t("Back")}
        </button>

        <header className="page-header">
          <h1>{t("New Project")}</h1>
          <p>{t("Fill in the fields below to create a new project")}</p>
        </header>

        {message && <div className="msg-success">{message}</div>}
        {error && <div className="msg-error">{error}</div>}

        <form onSubmit={handleSubmit} className="project-form">
          <div className="form-field">
            <label htmlFor="title">{t("Title")} *</label>
            <input
              id="title"
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder={t("Ex: Laboratory Management System")}
              maxLength={255}
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="description">{t("Description")} *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder={t("Describe the project, objectives, methodology and expected results...")}
              rows={6}
              required
            />
          </div>

          <div className="form-field">
            <MultiSelect
              label={t("Members")}
              options={availableUsers}
              selected={formData.members}
              onChange={handleMembersChange}
              placeholder={t("Select project members...")}
            />
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn-cancel"
              onClick={() => navigate(-1)}
              disabled={isSubmitting}
            >
              {t("Cancel")}
            </button>
            <button
              type="submit"
              className="btn-confirm"
              disabled={isSubmitting}
            >
              {isSubmitting ? t("Creating...") : t("Create Project")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProject;
