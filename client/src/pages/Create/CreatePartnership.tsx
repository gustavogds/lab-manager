import { useState } from "react";
import { useNavigate } from "react-router";
import { createPartnership } from "helpers/api/content";
import { FaArrowLeft, FaUpload } from "react-icons/fa";
import "./CreatePartnership.scss";

const CreatePartnership = () => {
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
      setError(`O logo deve ter no máximo ${MAX_LOGO_SIZE_MB}MB.`);
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("O arquivo deve ser uma imagem.");
      return;
    }

    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setError("O nome é obrigatório.");
      return;
    }

    if (!logoFile) {
      setError("O logo é obrigatório.");
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
      setMessage(response.message || "Parceria criada com sucesso!");
      setError("");
      setFormData({ name: "", link: "" });
      setLogoFile(null);
      setLogoPreview(null);

      setTimeout(() => {
        navigate(-1);
      }, 1500);
    } else {
      setError(response.error || "Falha ao criar parceria.");
      setMessage("");
    }
  };

  return (
    <div className="page-layout">
      <div className="page-container">
        <button className="btn-back" onClick={() => navigate(-1)}>
          <FaArrowLeft /> Voltar
        </button>

        <header className="page-header">
          <h1>Nova Parceria</h1>
          <p>Preencha os campos abaixo para adicionar uma nova instituição parceira</p>
        </header>

        {message && <div className="msg-success">{message}</div>}
        {error && <div className="msg-error">{error}</div>}

        <form onSubmit={handleSubmit} className="partnership-form">
          <div className="form-field">
            <label>Logo da Instituição *</label>
            <div className="logo-upload-area">
              {logoPreview ? (
                <div className="logo-preview">
                  <img src={logoPreview} alt="Preview do logo" />
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
                  <span>Clique para selecionar o logo</span>
                  <small>Tamanho máximo: {MAX_LOGO_SIZE_MB}MB</small>
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
            <label htmlFor="name">Nome da Instituição *</label>
            <input
              id="name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Ex: UFSC, USP, UNICAMP..."
              maxLength={255}
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="link">Link do Site (opcional)</label>
            <input
              id="link"
              type="url"
              name="link"
              value={formData.link}
              onChange={handleChange}
              placeholder="https://www.instituicao.edu.br"
            />
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
              disabled={isSubmitting}
            >
              {isSubmitting ? "Criando..." : "Criar Parceria"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePartnership;
