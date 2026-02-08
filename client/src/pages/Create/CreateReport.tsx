import { useState } from "react";
import { useNavigate } from "react-router";
import { generateReport } from "helpers/api/content";
import { FaArrowLeft } from "react-icons/fa";
import "./CreateReport.scss";

const SECTION_OPTIONS = [
  { key: "research_areas", label: "Áreas de Pesquisa" },
  { key: "projects", label: "Projetos" },
  { key: "users", label: "Usuários" },
  { key: "equipment", label: "Equipamentos" },
  { key: "partnerships", label: "Parcerias" },
];

const CreateReport = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [format, setFormat] = useState<"pdf" | "xlsx">("pdf");
  const [selectedSections, setSelectedSections] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleSection = (key: string) => {
    setSelectedSections((prev) =>
      prev.includes(key) ? prev.filter((s) => s !== key) : [...prev, key]
    );
  };

  const toggleAll = () => {
    if (selectedSections.length === SECTION_OPTIONS.length) {
      setSelectedSections([]);
    } else {
      setSelectedSections(SECTION_OPTIONS.map((s) => s.key));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError("O nome do relatório é obrigatório.");
      return;
    }

    if (selectedSections.length === 0) {
      setError("Selecione pelo menos uma seção para o relatório.");
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

  return (
    <div className="create-report-page">
      <div className="create-report-container">
        <button className="back-button" onClick={() => navigate(-1)}>
          <FaArrowLeft /> Voltar
        </button>

        <header className="page-header">
          <h1>Novo Relatório</h1>
          <p>Configure e gere um relatório com os dados do laboratório</p>
        </header>

        {message && <div className="success-message">{message}</div>}
        {error && <div className="error-message">{error}</div>}

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
            <div className="sections-header">
              <label>Seções do Relatório *</label>
              <button type="button" className="select-all-btn" onClick={toggleAll}>
                {selectedSections.length === SECTION_OPTIONS.length
                  ? "Desmarcar Todas"
                  : "Selecionar Todas"}
              </button>
            </div>
            <p className="field-hint">
              Cada seção selecionada será uma tabela separada no relatório
            </p>
            <div className="section-options">
              {SECTION_OPTIONS.map((section) => (
                <label
                  key={section.key}
                  className={`section-option ${
                    selectedSections.includes(section.key) ? "selected" : ""
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedSections.includes(section.key)}
                    onChange={() => toggleSection(section.key)}
                  />
                  <span className="checkmark" />
                  <span className="section-label">{section.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="cancel-button"
              onClick={() => navigate(-1)}
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="submit-button"
              disabled={isSubmitting}
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
