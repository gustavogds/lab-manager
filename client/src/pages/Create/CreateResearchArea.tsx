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
    title_pt: "",
    title_en: "",
    description_pt: "",
    description_en: "",
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

    if (!formData.title_pt.trim() && !formData.title_en.trim()) {
      setError(t("Title is required."));
      return;
    }

    if (!formData.description_pt.trim() && !formData.description_en.trim()) {
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

      setFormData({ title_pt: "", title_en: "", description_pt: "", description_en: "" });
      
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
            <label htmlFor="title_pt">{t("Title")} <span className="lang-badge">PT</span></label>
            <input
              id="title_pt"
              type="text"
              name="title_pt"
              value={formData.title_pt}
              onChange={handleChange}
              placeholder={t("Ex: Artificial Intelligence")}
              maxLength={255}
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
              placeholder={t("Ex: Artificial Intelligence")}
              maxLength={255}
            />
          </div>

          <div className="form-field">
            <label htmlFor="description_pt">{t("Description")} <span className="lang-badge">PT</span></label>
            <textarea
              id="description_pt"
              name="description_pt"
              value={formData.description_pt}
              onChange={handleChange}
              placeholder={t("Describe the research area, objectives and lines of investigation...")}
              rows={6}
            />
          </div>

          <div className="form-field">
            <label htmlFor="description_en">{t("Description")} <span className="lang-badge">EN</span></label>
            <textarea
              id="description_en"
              name="description_en"
              value={formData.description_en}
              onChange={handleChange}
              placeholder={t("Describe the research area, objectives and lines of investigation...")}
              rows={6}
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
