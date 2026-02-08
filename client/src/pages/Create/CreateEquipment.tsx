import { useState } from "react";
import { useNavigate } from "react-router";
import { createEquipment } from "helpers/api/content";
import { FaArrowLeft } from "react-icons/fa";
import "./CreateEquipment.scss";

const CreateEquipment = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    custom_id: "",
    location: "",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setError("O nome é obrigatório.");
      return;
    }
    if (!formData.custom_id.trim()) {
      setError("O ID do equipamento é obrigatório.");
      return;
    }

    setIsSubmitting(true);
    setError("");
    setMessage("");

    const payload: { name: string; custom_id: string; location?: string } = {
      name: formData.name,
      custom_id: formData.custom_id,
    };
    if (formData.location.trim()) {
      payload.location = formData.location;
    }

    const response = await createEquipment(payload);
    setIsSubmitting(false);

    if (response.success) {
      setMessage(response.message || "Equipamento criado com sucesso!");
      setError("");
      setFormData({ name: "", custom_id: "", location: "" });
      setTimeout(() => {
        navigate(-1);
      }, 1500);
    } else {
      setError(response.error || "Falha ao criar equipamento.");
      setMessage("");
    }
  };

  return (
    <div className="create-equipment-page">
      <div className="create-equipment-container">
        <button className="back-button" onClick={() => navigate(-1)}>
          <FaArrowLeft /> Voltar
        </button>
        <header className="page-header">
          <h1>Novo Equipamento</h1>
          <p>Preencha os campos abaixo para registrar um novo material ou equipamento</p>
        </header>
        {message && <div className="success-message">{message}</div>}
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit} className="equipment-form">
          <div className="form-field">
            <label htmlFor="name">Nome do Equipamento *</label>
            <input
              id="name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Ex: Monitor 27 polegadas"
              maxLength={255}
              required
            />
          </div>
          <div className="form-field">
            <label htmlFor="custom_id">ID do Equipamento *</label>
            <input
              id="custom_id"
              type="text"
              name="custom_id"
              value={formData.custom_id}
              onChange={handleChange}
              placeholder="Ex: mon_001"
              maxLength={100}
              required
            />
            <small className="field-hint">Identificador único do equipamento no laboratório</small>
          </div>
          <div className="form-field">
            <label htmlFor="location">Localização (opcional)</label>
            <input
              id="location"
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="Ex: Sala 401"
              maxLength={255}
            />
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
              {isSubmitting ? "Criando..." : "Criar Equipamento"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEquipment;
