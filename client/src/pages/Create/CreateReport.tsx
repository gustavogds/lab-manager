import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { generateReport, getReportConfig } from "helpers/api/content";
import type { ReportConfig, ReportSections } from "helpers/api/content";
import { FaArrowLeft, FaChevronDown, FaChevronRight } from "react-icons/fa";
import "./CreateReport.scss";

type SectionState = {
  selected: boolean;
  expanded: boolean;
  columns: string[];
  group_by_room: boolean;
  group_by_section: boolean;
};

type SectionsState = {
  [key: string]: SectionState;
};

const CreateReport = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [format, setFormat] = useState<"pdf" | "xlsx">("pdf");
  const [reportConfig, setReportConfig] = useState<ReportConfig | null>(null);
  const [sectionsState, setSectionsState] = useState<SectionsState>({});
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchConfig = async () => {
      const response = await getReportConfig();
      if (response.success && response.data) {
        setReportConfig(response.data);
        const initialState: SectionsState = {};
        for (const key of Object.keys(response.data)) {
          initialState[key] = {
            selected: false,
            expanded: false,
            columns: [],
            group_by_room: false,
            group_by_section: false,
          };
        }
        setSectionsState(initialState);
      }
      setIsLoading(false);
    };
    fetchConfig();
  }, []);

  const toggleSectionSelected = (key: string) => {
    setSectionsState((prev) => {
      const current = prev[key];
      const newSelected = !current.selected;
      const config = reportConfig?.[key];
      return {
        ...prev,
        [key]: {
          ...current,
          selected: newSelected,
          expanded: newSelected ? true : current.expanded,
          columns: newSelected && current.columns.length === 0 && config
            ? config.columns.map((c) => c.key)
            : current.columns,
        },
      };
    });
  };

  const toggleSectionExpanded = (key: string) => {
    setSectionsState((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        expanded: !prev[key].expanded,
      },
    }));
  };

  const toggleColumn = (sectionKey: string, columnKey: string) => {
    setSectionsState((prev) => {
      const current = prev[sectionKey];
      const newColumns = current.columns.includes(columnKey)
        ? current.columns.filter((c) => c !== columnKey)
        : [...current.columns, columnKey];
      return {
        ...prev,
        [sectionKey]: {
          ...current,
          columns: newColumns,
        },
      };
    });
  };

  const toggleAllColumns = (sectionKey: string) => {
    const config = reportConfig?.[sectionKey];
    if (!config) return;

    setSectionsState((prev) => {
      const current = prev[sectionKey];
      const allColumnKeys = config.columns.map((c) => c.key);
      const allSelected = allColumnKeys.every((k) => current.columns.includes(k));
      return {
        ...prev,
        [sectionKey]: {
          ...current,
          columns: allSelected ? [] : allColumnKeys,
        },
      };
    });
  };

  const toggleGroupByRoom = (sectionKey: string) => {
    setSectionsState((prev) => ({
      ...prev,
      [sectionKey]: {
        ...prev[sectionKey],
        group_by_room: !prev[sectionKey].group_by_room,
      },
    }));
  };

  const toggleGroupBySection = (sectionKey: string) => {
    setSectionsState((prev) => ({
      ...prev,
      [sectionKey]: {
        ...prev[sectionKey],
        group_by_section: !prev[sectionKey].group_by_section,
      },
    }));
  };

  const getSelectedSectionsCount = () => {
    return Object.values(sectionsState).filter((s) => s.selected && s.columns.length > 0).length;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError("O nome do relatório é obrigatório.");
      return;
    }

    const selectedSections: ReportSections = {};
    for (const [key, state] of Object.entries(sectionsState)) {
      if (state.selected && state.columns.length > 0) {
        selectedSections[key] = {
          columns: state.columns,
          group_by_room: state.group_by_room,
          group_by_section: state.group_by_section,
        };
      }
    }

    if (Object.keys(selectedSections).length === 0) {
      setError("Selecione pelo menos uma seção com colunas para o relatório.");
      return;
    }

    setIsSubmitting(true);
    setError("");
    setMessage("");

    const response = await generateReport({
      name: name.trim(),
      format,
      sections: selectedSections,
    });

    setIsSubmitting(false);

    if (response.success) {
      setMessage("Relatório gerado com sucesso!");
      setError("");
    } else {
      setError(response.error || "Falha ao gerar relatório.");
      setMessage("");
    }
  };

  if (isLoading) {
    return (
      <div className="page-layout">
        <div className="page-container">
          <p>Carregando configurações...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-layout">
      <div className="page-container">
        <button className="btn-back" onClick={() => navigate(-1)}>
          <FaArrowLeft /> Voltar
        </button>

        <header className="page-header">
          <h1>Novo Relatório</h1>
          <p>Configure e gere um relatório com os dados do laboratório</p>
        </header>

        {message && <div className="msg-success">{message}</div>}
        {error && <div className="msg-error">{error}</div>}

        <form onSubmit={handleSubmit} className="report-form">
          <div className="form-field">
            <label htmlFor="report-name">Nome do Relatório *</label>
            <input
              id="report-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Relatório Anual 2025"
              maxLength={255}
              required
            />
          </div>

          <div className="form-field">
            <label>Formato *</label>
            <div className="format-options">
              <label className={`format-option ${format === "pdf" ? "selected" : ""}`}>
                <input
                  type="radio"
                  name="format"
                  value="pdf"
                  checked={format === "pdf"}
                  onChange={() => setFormat("pdf")}
                />
                <span className="format-label">PDF</span>
                <span className="format-description">Documento para impressão e visualização</span>
              </label>
              <label className={`format-option ${format === "xlsx" ? "selected" : ""}`}>
                <input
                  type="radio"
                  name="format"
                  value="xlsx"
                  checked={format === "xlsx"}
                  onChange={() => setFormat("xlsx")}
                />
                <span className="format-label">Excel (XLSX)</span>
                <span className="format-description">Planilha para análise e edição de dados</span>
              </label>
            </div>
          </div>

          <div className="form-field">
            <label>Seções do Relatório *</label>
            <p className="field-hint">
              Selecione as seções e personalize as colunas que aparecerão em cada tabela
            </p>
            <div className="sections-container">
              {reportConfig && Object.entries(reportConfig).map(([sectionKey, config]) => {
                const state = sectionsState[sectionKey];
                if (!state) return null;

                return (
                  <div
                    key={sectionKey}
                    className={`section-item ${state.selected ? "selected" : ""}`}
                  >
                    <div className="section-header" onClick={() => toggleSectionSelected(sectionKey)}>
                      <label
                        className="section-checkbox"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="checkbox"
                          checked={state.selected}
                          onChange={() => toggleSectionSelected(sectionKey)}
                        />
                        <span className="checkmark" />
                      </label>
                      <div className="section-title-row">
                        <span className="section-label">{config.label}</span>
                        {state.selected && (
                          <span className="columns-count">
                            {state.columns.length} de {config.columns.length} colunas
                          </span>
                        )}
                      </div>
                      {state.selected && (
                        <button
                          type="button"
                          className="expand-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSectionExpanded(sectionKey);
                          }}
                        >
                          {state.expanded ? <FaChevronDown /> : <FaChevronRight />}
                        </button>
                      )}
                    </div>

                    {state.selected && state.expanded && (
                      <div className="section-content">
                        <div className="columns-header">
                          <span>Colunas da tabela</span>
                          <button
                            type="button"
                            className="select-all-btn"
                            onClick={() => toggleAllColumns(sectionKey)}
                          >
                            {config.columns.every((c) => state.columns.includes(c.key))
                              ? "Desmarcar Todas"
                              : "Selecionar Todas"}
                          </button>
                        </div>
                        <div className="columns-grid">
                          {config.columns.map((col) => (
                            <label
                              key={col.key}
                              className={`column-option ${
                                state.columns.includes(col.key) ? "selected" : ""
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={state.columns.includes(col.key)}
                                onChange={() => toggleColumn(sectionKey, col.key)}
                              />
                              <span className="column-label">{col.label}</span>
                            </label>
                          ))}
                        </div>

                        {(config.supports_room_grouping || config.supports_section_grouping) && (
                          <div className="grouping-options">
                            <span className="grouping-label">Agrupar por:</span>
                            {config.supports_room_grouping && (
                              <label
                                className={`grouping-option ${state.group_by_room ? "selected" : ""}`}
                              >
                                <input
                                  type="checkbox"
                                  checked={state.group_by_room}
                                  onChange={() => toggleGroupByRoom(sectionKey)}
                                />
                                <span className="checkmark" />
                                <span>Sala</span>
                              </label>
                            )}
                            {config.supports_section_grouping && (
                              <label
                                className={`grouping-option ${state.group_by_section ? "selected" : ""}`}
                              >
                                <input
                                  type="checkbox"
                                  checked={state.group_by_section}
                                  onChange={() => toggleGroupBySection(sectionKey)}
                                />
                                <span className="checkmark" />
                                <span>Seção</span>
                              </label>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn-cancel"
              onClick={() => navigate(-1)}
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-confirm"
              disabled={isSubmitting || getSelectedSectionsCount() === 0}
            >
              {isSubmitting ? "Gerando..." : "Gerar Relatório"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateReport;
