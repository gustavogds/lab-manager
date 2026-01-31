import { useState } from "react";
import "./ResearchersEditor.scss";
import Icons from "components/Icons/Icons";
import type { Researcher } from "helpers/api/content";

interface ResearcherConfig {
  id: number;
  name: string;
  profile_image: string | null;
  position: string | null;
  order: number;
  show: boolean;
}

interface ResearchersEditorProps {
  researchers: Researcher[];
  onConfirm: (config: ResearcherConfig[]) => void;
  onCancel: () => void;
}

const ResearchersEditor = ({ researchers, onConfirm, onCancel }: ResearchersEditorProps) => {
  const [config, setConfig] = useState<ResearcherConfig[]>(() =>
    researchers
      .map((r) => ({
        id: r.id,
        name: r.name,
        profile_image: r.profile_image,
        position: r.position ?? null,
        order: r.researcher_order ?? 0,
        show: r.show_in_researchers ?? true,
      }))
      .sort((a, b) => a.order - b.order)
  );

  const toggleVisibility = (id: number) => {
    setConfig((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, show: !item.show } : item
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
    <div className="researchers-editor-modal" onClick={onCancel}>
      <div className="researchers-editor-content" onClick={(e) => e.stopPropagation()}>
        <header className="editor-header">
          <h2>Editar Seção de Pesquisadores</h2>
          <button className="close-button" onClick={onCancel}>
            ×
          </button>
        </header>

        <div className="editor-body">
          <p className="editor-description">
            Arraste para reordenar e use o toggle para mostrar/ocultar pesquisadores na página.
          </p>

          <div className="researchers-list">
            {config.map((researcher, index) => (
              <div
                key={researcher.id}
                className={`researcher-row ${!researcher.show ? "hidden" : ""}`}
              >
                <div className="order-controls">
                  <button
                    onClick={() => moveUp(index)}
                    disabled={index === 0}
                    className="order-btn"
                    title="Mover para cima"
                  >
                    ▲
                  </button>
                  <button
                    onClick={() => moveDown(index)}
                    disabled={index === config.length - 1}
                    className="order-btn"
                    title="Mover para baixo"
                  >
                    ▼
                  </button>
                </div>

                <div className="researcher-avatar-small">
                  {researcher.profile_image ? (
                    <img src={researcher.profile_image} alt={researcher.name} />
                  ) : (
                    <Icons.Profile />
                  )}
                </div>

                <div className="researcher-info-row">
                  <span className="researcher-name">{researcher.name}</span>
                  {researcher.position && (
                    <span className="researcher-position">{researcher.position}</span>
                  )}
                </div>

                <label className="visibility-toggle">
                  <input
                    type="checkbox"
                    checked={researcher.show}
                    onChange={() => toggleVisibility(researcher.id)}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            ))}
          </div>
        </div>

        <footer className="editor-footer">
          <button className="btn-cancel" onClick={onCancel}>
            Cancelar
          </button>
          <button className="btn-save" onClick={handleSave}>
            Salvar
          </button>
        </footer>
      </div>
    </div>
  );
};

export default ResearchersEditor;
