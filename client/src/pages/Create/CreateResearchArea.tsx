import { useState } from "react";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { createResearchArea } from "helpers/api/content";
import { FaArrowLeft } from "react-icons/fa";
import "./CreateResearchArea.scss";

const CreateResearchArea = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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

    if (!formData.description.trim()) {
      setError(t("Description is required."));
      return;
    }

    setIsSubmitting(true);
    setError("");
    setMessage("");

    const response = await createResearchArea(formData);

    setIsSubmitting(false);

    if (response.success) {
      setMessage(response.message || t("Research area created successfully!"));
      setError("");
      
      setFormData({ title: "", description: "" });
      
      setTimeout(() => {
        navigate(-1);
      }, 1500);
    } else {
      setError(response.error || t("Failed to create research area."));
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
          <h1>{t("New Research Area")}</h1>
          <p>{t("Fill in the fields below to create a new research area")}</p>
        </header>

        {message && <div className="msg-success">{message}</div>}
        {error && <div className="msg-error">{error}</div>}

        <form onSubmit={handleSubmit} className="research-area-form">
          <div className="form-field">
            <label htmlFor="title">{t("Title")} *</label>
            <input
              id="title"
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder={t("Ex: Artificial Intelligence")}
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
              placeholder={t("Describe the research area, objectives and lines of investigation...")}
              rows={6}
              required
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
              {isSubmitting ? t("Creating...") : t("Create Research Area")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateResearchArea;
