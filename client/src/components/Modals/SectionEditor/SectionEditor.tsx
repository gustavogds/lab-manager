import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Modal } from "components/my-own-modal-handler";
import { uploadAboutImage, deleteAboutImage } from "helpers/api/settings";
import "./SectionEditor.scss";

export type SectionEditorField = {
  name: string;
  label: string;
  type?: "text" | "textarea" | "email" | "tel" | "url" | "image-upload";
  placeholder?: string;
  rows?: number;
  required?: boolean;
};

type SectionEditorProps = {
  headerTitle?: string;
  fields?: SectionEditorField[];
  initialValues?: Record<string, string>;
  images?: Array<{ id: number; image: string; order: number }>;
  onImagesChange?: (images: Array<{ id: number; image: string; order: number }>) => void;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm?: (values: Record<string, string>) => void;
  onCancel?: () => void;
  disableConfirm?: boolean;
  disableCancel?: boolean;
};

const buildInitialValues = (
  fields: SectionEditorField[],
  initialValues?: Record<string, string>
) => {
  const values: Record<string, string> = { ...(initialValues || {}) };
  fields.forEach((field) => {
    if (values[field.name] === undefined || values[field.name] === null) {
      values[field.name] = "";
    }
  });
  return values;
};

const SectionEditorModal = ({
  headerTitle,
  fields = [],
  initialValues,
  images = [],
  onImagesChange,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
  disableConfirm,
  disableCancel,
}: SectionEditorProps) => {
  const { t } = useTranslation();
  const [values, setValues] = useState<Record<string, string>>(() =>
    buildInitialValues(fields, initialValues)
  );
  const [localImages, setLocalImages] = useState(images);
  const [uploading, setUploading] = useState(false);

  const handleChange = (name: string, value: string) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const result = await uploadAboutImage(file);
    setUploading(false);

    if (result.success && result.data?.image) {
      const newImages = [...localImages, result.data.image];
      setLocalImages(newImages);
      onImagesChange?.(newImages);
    }
  };

  const handleImageDelete = async (imageId: number) => {
    const result = await deleteAboutImage(imageId);
    if (result.success) {
      const newImages = localImages.filter((img) => img.id !== imageId);
      setLocalImages(newImages);
      onImagesChange?.(newImages);
    }
  };

  const hasFields = fields.length > 0;

  return (
    <Modal
      headerTitle={headerTitle || t("Edit section")}
      confirmLabel={confirmLabel || t("Save")}
      cancelLabel={cancelLabel || t("Cancel")}
      onConfirm={() => onConfirm?.(values)}
      onCancel={() => onCancel?.()}
      disableConfirm={disableConfirm || !hasFields}
      disableCancel={disableCancel}
      className="section-editor-modal"
    >
      <div slot="body">
        {hasFields ? (
          <div className="section-editor-form">
            {fields.map((field) => {
              const inputId = `section-editor-${field.name}`;
              const fieldValue = values[field.name] ?? "";
              const fieldType = field.type || "text";

              if (fieldType === "image-upload") {
                return (
                  <div className="section-editor-field" key={field.name}>
                    <label htmlFor={inputId}>{field.label}</label>
                    <div className="image-upload-section">
                      <input
                        id={inputId}
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={uploading}
                        className="image-upload-input"
                      />
                      {uploading && <p className="upload-status">{t("Sending...")}</p>}
                      
                      {localImages.length > 0 && (
                        <div className="uploaded-images">
                          {localImages.map((img) => (
                            <div key={img.id} className="image-preview">
                              <img src={img.image} alt="About" />
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
                );
              }

              return (
                <div className="section-editor-field" key={field.name}>
                  <label htmlFor={inputId}>{field.label}</label>
                  {fieldType === "textarea" ? (
                    <textarea
                      id={inputId}
                      rows={field.rows || 4}
                      placeholder={field.placeholder || ""}
                      value={fieldValue}
                      required={field.required}
                      onChange={(event) =>
                        handleChange(field.name, event.target.value)
                      }
                    />
                  ) : (
                    <input
                      id={inputId}
                      type={fieldType}
                      placeholder={field.placeholder || ""}
                      value={fieldValue}
                      required={field.required}
                      onChange={(event) =>
                        handleChange(field.name, event.target.value)
                      }
                    />
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="section-editor-empty">
            {t("No fields configured.")}
          </div>
        )}
      </div>
    </Modal>
  );
};

export default SectionEditorModal;
