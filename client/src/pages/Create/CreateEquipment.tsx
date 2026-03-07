import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { createEquipment, listRooms, listIdentificationCategories, listEquipmentStates } from "helpers/api/content";
import type { Room, IdentificationCategory, EquipmentState } from "helpers/api/content";
import { FaArrowLeft } from "react-icons/fa";
import "./CreateEquipment.scss";

const CreateEquipment = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    custom_id: "",
    observation: "",
    identification_category_id: "" as string,
    equipment_state_id: "" as string,
    room_id: "" as string,
  });
  const [rooms, setRooms] = useState<Room[]>([]);
  const [categories, setCategories] = useState<IdentificationCategory[]>([]);
  const [states, setStates] = useState<EquipmentState[]>([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const [roomsResponse, categoriesResponse, statesResponse] = await Promise.all([
        listRooms(),
        listIdentificationCategories(),
        listEquipmentStates(),
      ]);
      if (roomsResponse.success) {
        setRooms(roomsResponse.data);
      }
      if (categoriesResponse.success) {
        setCategories(categoriesResponse.data);
      }
      if (statesResponse.success) {
        setStates(statesResponse.data);
      }
    };
    fetchData();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
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

    const payload: { name: string; custom_id: string; observation?: string; identification_category_id?: number | null; equipment_state_id?: number | null; room_id?: number | null } = {
      name: formData.name,
      custom_id: formData.custom_id,
    };
    if (formData.observation.trim()) {
      payload.observation = formData.observation.trim();
    }
    if (formData.identification_category_id) {
      payload.identification_category_id = Number(formData.identification_category_id);
    }
    if (formData.equipment_state_id) {
      payload.equipment_state_id = Number(formData.equipment_state_id);
    }
    if (formData.room_id) {
      payload.room_id = Number(formData.room_id);
    }

    const response = await createEquipment(payload);
    setIsSubmitting(false);

    if (response.success) {
      setMessage(response.message || "Equipamento criado com sucesso!");
      setError("");
      setFormData({ name: "", custom_id: "", observation: "", identification_category_id: "", equipment_state_id: "", room_id: "" });
      setTimeout(() => {
        navigate(-1);
      }, 1500);
    } else {
      setError(response.error || "Falha ao criar equipamento.");
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
          <h1>Novo Equipamento</h1>
          <p>Preencha os campos abaixo para registrar um novo material ou equipamento</p>
        </header>
        {message && <div className="msg-success">{message}</div>}
        {error && <div className="msg-error">{error}</div>}
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
            <label htmlFor="identification_category_id">Categoria de Identificação (opcional)</label>
            <select
              id="identification_category_id"
              name="identification_category_id"
              value={formData.identification_category_id}
              onChange={handleChange}
            >
              <option value="">Nenhuma</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-field">
            <label htmlFor="room_id">Sala (opcional)</label>
            <select
              id="room_id"
              name="room_id"
              value={formData.room_id}
              onChange={handleChange}
            >
              <option value="">Nenhuma</option>
              {rooms.map((room) => (
                <option key={room.id} value={room.id}>
                  {room.name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-field">
            <label htmlFor="equipment_state_id">Estado do Equipamento (opcional)</label>
            <select
              id="equipment_state_id"
              name="equipment_state_id"
              value={formData.equipment_state_id}
              onChange={handleChange}
            >
              <option value="">Nenhum</option>
              {states.map((state) => (
                <option key={state.id} value={state.id}>
                  {state.name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-field">
            <label htmlFor="observation">Observação (opcional)</label>
            <textarea
              id="observation"
              name="observation"
              value={formData.observation}
              onChange={handleChange}
              placeholder="Observações sobre o equipamento..."
              rows={3}
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
              {isSubmitting ? "Criando..." : "Criar Equipamento"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEquipment;
