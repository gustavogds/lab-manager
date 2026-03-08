import { useState } from "react";
import { useTranslation } from "react-i18next";
import "./PartnershipsEditor.scss";
import { FaTrash } from "react-icons/fa";
import type { Partnership } from "helpers/api/content";

interface PartnershipConfig {
  id: number;
  name: string;
  logo: string | null;
  order: number;
  is_active: boolean;
  deleted: boolean;
}

interface PartnershipsEditorProps {
  partnerships: Partnership[];
  onConfirm: (config: PartnershipConfig[]) => void;
  onCancel: () => void;
}

const PartnershipsEditor = ({ partnerships, onConfirm, onCancel }: PartnershipsEditorProps) => {
  const { t } = useTranslation();
  const [config, setConfig] = useState<PartnershipConfig[]>(() =>
    partnerships
      .map((p) => ({
        id: p.id,
        name: p.name,
        logo: p.logo,
        order: p.order,
        is_active: p.is_active,
        deleted: false,
      }))
      .sort((a, b) => a.order - b.order)
  );

  const toggleVisibility = (id: number) => {
    setConfig((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, is_active: !item.is_active } : item
      )
    );
  };

  const markForDeletion = (id: number) => {
    setConfig((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, deleted: !item.deleted } : item
      )
    );
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    setConfig((prev) => {
      const newConfig = [...prev];
      [newConfig[index - 1], newConfig[index]] = [newConfig[index], newConfig[index - 1]];
      return newConfig.map((item, i) => ({ ...item, order: i }));
    });
  };

  const moveDown = (index: number) => {
    if (index === config.length - 1) return;
    setConfig((prev) => {
      const newConfig = [...prev];
      [newConfig[index], newConfig[index + 1]] = [newConfig[index + 1], newConfig[index]];
      return newConfig.map((item, i) => ({ ...item, order: i }));
    });
  };

  const handleSave = () => {
    onConfirm(config);
  };

  return (
    <div className="partnerships-editor-modal" onClick={onCancel}>
      <div className="partnerships-editor-content" onClick={(e) => e.stopPropagation()}>
        <header className="modal-header-shared">
          <h2>{t("Edit Partnerships")}</h2>
          <button className="btn-close-modal" onClick={onCancel}>
            ×
          </button>
        </header>

        <div className="editor-body">
          <p className="editor-description">
            {t("Reorder partnerships, toggle visibility, or mark for deletion.")}
          </p>

          <div className="partnerships-list">
            {config.map((partnership, index) => (
              <div
                key={partnership.id}
                className={`partnership-row ${!partnership.is_active ? "hidden" : ""} ${partnership.deleted ? "deleted" : ""}`}
              >
                <div className="order-controls">
                  <button
                    onClick={() => moveUp(index)}
                    disabled={index === 0}
                    className="order-btn"
                    title={t("Move up")}
                  >
                    ▲
                  </button>
                  <button
                    onClick={() => moveDown(index)}
                    disabled={index === config.length - 1}
                    className="order-btn"
                    title={t("Move down")}
                  >
                    ▼
                  </button>
                </div>

                <div className="partnership-logo-small">
                  {partnership.logo && (
                    <img src={partnership.logo} alt={partnership.name} />
                  )}
                </div>

                <div className="partnership-name">
                  {partnership.name}
                </div>

                <label className="visibility-toggle">
                  <input
                    type="checkbox"
                    checked={partnership.is_active}
                    onChange={() => toggleVisibility(partnership.id)}
                    disabled={partnership.deleted}
                  />
                  <span className="toggle-slider"></span>
                </label>

                <button
                  className={`delete-btn ${partnership.deleted ? "active" : ""}`}
                  onClick={() => markForDeletion(partnership.id)}
                  title={partnership.deleted ? t("Cancel deletion") : t("Mark for deletion")}
                >
                  <FaTrash />
                </button>
              </div>
            ))}
          </div>

          {config.filter((p) => p.deleted).length > 0 && (
            <div className="deletion-warning">
              ⚠️ {config.filter((p) => p.deleted).length} {t("partnership(s) will be permanently deleted upon saving.")}
            </div>
          )}
        </div>

        <footer className="editor-footer">
          <button className="btn-cancel" onClick={onCancel}>
            {t("Cancel")}
          </button>
          <button className="btn-confirm" onClick={handleSave}>
            {t("Save")}
          </button>
        </footer>
      </div>
    </div>
  );
};

export default PartnershipsEditor;
