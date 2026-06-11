import { useState } from "react";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import {
  createResearchArea,
  uploadResearchAreaImage,
} from "helpers/api/content";
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
    link: "",
  });
  const [pendingImages, setPendingImages] = useState<
    Array<{ file: File; preview: string }>
  >([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const newImages = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setPendingImages((prev) => [...prev, ...newImages]);
    e.target.value = "";
  };

  const handleImageRemove = (preview: string) => {
    setPendingImages((prev) => {
      const image = prev.find((img) => img.preview === preview);
      if (image) {
        URL.revokeObjectURL(image.preview);
      }
      return prev.filter((img) => img.preview !== preview);
    });
  };

  const submitForm = async (createAnother: boolean) => {
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

    if (response.success) {
      let uploadFailed = false;
      const areaId = response.data?.id;
      if (areaId && pendingImages.length > 0) {
        for (const img of pendingImages) {
          const uploadResult = await uploadResearchAreaImage(areaId, img.file);
          if (!uploadResult.success) {
            uploadFailed = true;
          }
          URL.revokeObjectURL(img.preview);
        }
        setPendingImages([]);
      }

      setIsSubmitting(false);
      setMessage(response.message || t("Research area created successfully!"));
      setError(
        uploadFailed
          ? t("Research area created, but some images failed to upload.")
          : ""
      );

      setFormData({ title_pt: "", title_en: "", description_pt: "", description_en: "", link: "" });

      if (createAnother) {
        setTimeout(() => {
          setMessage("");
        }, 3000);
      } else {
        setTimeout(() => {
          navigate(-1);
        }, 1500);
      }
    } else {
      setIsSubmitting(false);
      setError(response.error || t("Failed to create research area."));
      setMessage("");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitForm(false);
  };

  const handleCreateAnother = (e: React.MouseEvent<HTMLButtonElement>) => {
    const form = e.currentTarget.form;
    if (form && !form.reportValidity()) {
      return;
    }
    submitForm(true);
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
              placeholder={"Ex: Artificial Intelligence"}
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
              placeholder={"Describe the research area, objectives and lines of investigation..."}
              rows={6}
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
            <label htmlFor="ra-images">{t("Images")} <span className="optional-badge">{t("optional")}</span></label>
            <div className="image-upload-section">
              <input
                id="ra-images"
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageSelect}
                className="image-upload-input"
              />
              {pendingImages.length > 0 && (
                <div className="uploaded-images">
                  {pendingImages.map((img) => (
                    <div key={img.preview} className="image-preview">
                      <img src={img.preview} alt="" />
                      <button
                        type="button"
                        className="delete-image-btn"
                        onClick={() => handleImageRemove(img.preview)}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
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
              type="button"
              className="btn-confirm-outline"
              onClick={handleCreateAnother}
              disabled={isSubmitting}
            >
              {isSubmitting ? t("Creating...") : t("Create & Add Another")}
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
