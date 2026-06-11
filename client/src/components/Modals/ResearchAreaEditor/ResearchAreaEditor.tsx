import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  uploadResearchAreaImage,
  deleteResearchAreaImage,
} from "helpers/api/content";
import type { ResearchArea, ContentImage } from "helpers/api/content";

interface ResearchAreaEditorProps {
  researchArea: ResearchArea;
  onImagesChange?: (images: ContentImage[]) => void;
  onConfirm: (data: {
    title_pt: string;
    title_en: string;
    description_pt: string;
    description_en: string;
    link: string;
  }) => void;
  onCancel?: () => void;
}

const ResearchAreaEditor: React.FC<ResearchAreaEditorProps> = ({
  researchArea,
  onImagesChange,
  onConfirm,
  onCancel,
}) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    title_pt: researchArea.title_pt || "",
    title_en: researchArea.title_en || "",
    description_pt: researchArea.description_pt || "",
    description_en: researchArea.description_en || "",
    link: researchArea.link || "",
  });
  const [images, setImages] = useState<ContentImage[]>(researchArea.images || []);
  const [uploading, setUploading] = useState(false);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const result = await uploadResearchAreaImage(researchArea.id, file);
    setUploading(false);
    event.target.value = "";

    if (result.success && result.image) {
      const newImages = [...images, result.image];
      setImages(newImages);
      onImagesChange?.(newImages);
    }
  };

  const handleImageDelete = async (imageId: number) => {
    const result = await deleteResearchAreaImage(imageId);
    if (result.success) {
      const newImages = images.filter((img) => img.id !== imageId);
      setImages(newImages);
      onImagesChange?.(newImages);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
          <h2>{t("Edit Research Area")}</h2>
          <button className="btn-close-modal" onClick={handleCancel}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body-shared">
          <div className="form-field">
            <label htmlFor="ra-title-pt">{t("Title")} <span className="lang-badge">PT</span></label>
            <input
              id="ra-title-pt"
              type="text"
              name="title_pt"
              value={formData.title_pt}
              onChange={handleChange}
              placeholder={t("Research area title")}
              maxLength={255}
            />
          </div>

          <div className="form-field">
            <label htmlFor="ra-title-en">{t("Title")} <span className="lang-badge">EN</span></label>
            <input
              id="ra-title-en"
              type="text"
              name="title_en"
              value={formData.title_en}
              onChange={handleChange}
              placeholder={t("Research area title")}
              maxLength={255}
            />
          </div>

          <div className="form-field">
            <label htmlFor="ra-description-pt">{t("Description")} <span className="lang-badge">PT</span></label>
            <textarea
              id="ra-description-pt"
              name="description_pt"
              value={formData.description_pt}
              onChange={handleChange}
              placeholder={t("Research area description")}
              rows={5}
            />
          </div>

          <div className="form-field">
            <label htmlFor="ra-description-en">{t("Description")} <span className="lang-badge">EN</span></label>
            <textarea
              id="ra-description-en"
              name="description_en"
              value={formData.description_en}
              onChange={handleChange}
              placeholder={t("Research area description")}
              rows={5}
            />
          </div>

          <div className="form-field">
            <label htmlFor="ra-link">{t("More info link")} <span className="optional-badge">{t("optional")}</span></label>
            <input
              id="ra-link"
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
                onChange={handleImageUpload}
                disabled={uploading}
                className="image-upload-input"
              />
              {uploading && <p className="upload-status">{t("Sending...")}</p>}
              {images.length > 0 && (
                <div className="uploaded-images">
                  {images.map((img) => (
                    <div key={img.id} className="image-preview">
                      <img src={img.image} alt="" />
                      <button
                        type="button"
                        className="delete-image-btn"
                        onClick={() => handleImageDelete(img.id)}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
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

export default ResearchAreaEditor;
