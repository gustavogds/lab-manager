import { useEffect, useState } from "react";
import { Modal } from "components/my-own-modal-handler";
import "./SectionEditor.scss";

export type SectionEditorField = {
  name: string;
  label: string;
  type?: "text" | "textarea" | "email" | "tel";
  placeholder?: string;
  rows?: number;
  required?: boolean;
};

type SectionEditorProps = {
  headerTitle?: string;
  fields?: SectionEditorField[];
  initialValues?: Record<string, string>;
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
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
  disableConfirm,
  disableCancel,
}: SectionEditorProps) => {
  const [values, setValues] = useState<Record<string, string>>(() =>
    buildInitialValues(fields, initialValues)
  );

  useEffect(() => {
    setValues(buildInitialValues(fields, initialValues));
  }, [fields, initialValues]);

  const handleChange = (name: string, value: string) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const hasFields = fields.length > 0;

  return (
    <Modal
      headerTitle={headerTitle || "Editar secao"}
      confirmLabel={confirmLabel || "Salvar"}
      cancelLabel={cancelLabel || "Cancelar"}
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
            Nenhum campo configurado.
          </div>
        )}
      </div>
    </Modal>
  );
};

export default SectionEditorModal;
