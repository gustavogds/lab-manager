import { useState } from "react";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { createPartnership } from "helpers/api/content";
import { FaArrowLeft, FaUpload } from "react-icons/fa";
import "./CreatePartnership.scss";

const CreatePartnership = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    link: "",
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const MAX_LOGO_SIZE_MB = 2;
  const MAX_LOGO_SIZE_BYTES = MAX_LOGO_SIZE_MB * 1024 * 1024;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_LOGO_SIZE_BYTES) {
      setError(t("Logo must be at most") + ` ${MAX_LOGO_SIZE_MB}MB.`);
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError(t("The file must be an image."));
      return;
    }

    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setError(t("Name is required."));
      return;
    }

    if (!logoFile) {
      setError(t("Logo is required."));
      return;
    }

    setIsSubmitting(true);
    setError("");
    setMessage("");

    const data = new FormData();
    data.append("name", formData.name);
    data.append("logo", logoFile);
    if (formData.link.trim()) {
      data.append("link", formData.link);
    }

    const response = await createPartnership(data);

    setIsSubmitting(false);

    if (response.success) {
      setMessage(response.message || t("Partnership created successfully!"));
      setError("");
      setFormData({ name: "", link: "" });
      setLogoFile(null);
      setLogoPreview(null);

      setTimeout(() => {
        navigate(-1);
      }, 1500);
    } else {
      setError(response.error || t("Failed to create partnership."));
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
          <h1>{t("New Partnership")}</h1>
          <p>{t("Fill in the fields below to add a new partner institution")}</p>
        </header>

        {message && <div className="msg-success">{message}</div>}
        {error && <div className="msg-error">{error}</div>}

        <form onSubmit={handleSubmit} className="partnership-form">
          <div className="form-field">
            <label>{t("Institution Logo")} *</label>
            <div className="logo-upload-area">
              {logoPreview ? (
                <div className="logo-preview">
                  <img src={logoPreview} alt={t("Logo preview")} />
                  <button
                    type="button"
                    className="remove-logo"
                    onClick={() => {
                      setLogoFile(null);
                      setLogoPreview(null);
                    }}
                  >
                    ×
                  </button>
                </div>
              ) : (
                <label className="upload-placeholder">
                  <FaUpload />
                  <span>{t("Click to select the logo")}</span>
                  <small>{t("Maximum size:")} {MAX_LOGO_SIZE_MB}MB</small>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    hidden
                  />
                </label>
              )}
            </div>
          </div>

          <div className="form-field">
            <label htmlFor="name">{t("Institution Name")} *</label>
            <input
              id="name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder={t("Ex: UFSC, USP, UNICAMP...")}
              maxLength={255}
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="link">{t("Website Link (optional)")}</label>
            <input
              id="link"
              type="url"
              name="link"
              value={formData.link}
              onChange={handleChange}
              placeholder="https://www.institution.edu"
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
              {isSubmitting ? t("Creating...") : t("Create Partnership")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePartnership;
