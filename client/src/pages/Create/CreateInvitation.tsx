import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { createInvitation } from "helpers/api/invitations";
import { listPositions, type Position } from "helpers/api/content";
import { FaArrowLeft, FaEnvelope, FaUser, FaPhone, FaGraduationCap } from "react-icons/fa";
import MultiSelect from "components/MultiSelect/MultiSelect";
import "./CreateInvitation.scss";

type RoleOption = {
  id: number;
  name: string;
  value: string;
};

const ROLE_OPTIONS: RoleOption[] = [
  { id: 1, name: "Professor", value: "professor" },
  { id: 2, name: "Estudante", value: "student" },
  { id: 3, name: "Colaborador", value: "collaborator" },
  { id: 4, name: "Gestor de Inventário", value: "inventory_manager" },
];

const CreateInvitation = () => {
  const navigate = useNavigate();
  const [positions, setPositions] = useState<Position[]>([]);
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    phone: "",
    lattes: "",
    bio: "",
  });
  const [selectedRoles, setSelectedRoles] = useState<RoleOption[]>([]);
  const [selectedPositions, setSelectedPositions] = useState<Position[]>([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchPositions = async () => {
      const response = await listPositions();
      if (response.success) {
        setPositions(response.data);
      }
    };
    fetchPositions();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email.trim()) {
      setError("O e-mail é obrigatório.");
      return;
    }

    if (selectedRoles.length === 0) {
      setError("Selecione pelo menos uma função.");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Digite um e-mail válido.");
      return;
    }

    setIsSubmitting(true);
    setError("");
    setMessage("");

    const response = await createInvitation({
      email: formData.email,
      roles: selectedRoles.map((r) => r.value),
      name: formData.name || undefined,
      phone: formData.phone || undefined,
      lattes: formData.lattes || undefined,
      bio: formData.bio || undefined,
      position_ids: selectedPositions.length > 0 ? selectedPositions.map((p) => p.id) : undefined,
    });

    setIsSubmitting(false);

    if (response.success) {
      setMessage(response.message || "Convite enviado com sucesso!");
      setError("");

      // Clear form
      setFormData({
        email: "",
        name: "",
        phone: "",
        lattes: "",
        bio: "",
      });
      setSelectedRoles([]);
      setSelectedPositions([]);

      setTimeout(() => {
        navigate(-1);
      }, 2000);
    } else {
      setError(response.error || "Falha ao enviar convite.");
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
          <h1>Convidar Novo Membro</h1>
          <p>
            Envie um convite por e-mail para adicionar um novo membro ao
            laboratório. O usuário receberá um link para completar o cadastro
            e será aprovado automaticamente.
          </p>
        </header>

        {message && <div className="msg-success">{message}</div>}
        {error && <div className="msg-error">{error}</div>}

        <form onSubmit={handleSubmit} className="invitation-form">
          <div className="form-section">
            <h3>Informações Obrigatórias</h3>

            <div className="form-field">
              <label htmlFor="email">
                <FaEnvelope className="label-icon" />
                E-mail *
              </label>
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="email@exemplo.com"
                required
              />
            </div>

            <div className="form-field">
              <label>Função(ões) *</label>
              <MultiSelect
                options={ROLE_OPTIONS}
                selected={selectedRoles}
                onChange={setSelectedRoles}
                placeholder="Selecione as funções..."
              />
              <span className="field-hint">
                Selecione uma ou mais funções para o novo membro
              </span>
            </div>
          </div>

          <div className="form-section">
            <h3>Informações Opcionais (Pré-preenchimento)</h3>
            <p className="section-description">
              Esses campos serão preenchidos automaticamente no formulário de
              cadastro do convidado.
            </p>

            <div className="form-field">
              <label htmlFor="name">
                <FaUser className="label-icon" />
                Nome Completo
              </label>
              <input
                id="name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Nome do convidado"
              />
            </div>

            <div className="form-field">
              <label htmlFor="phone">
                <FaPhone className="label-icon" />
                Telefone
              </label>
              <input
                id="phone"
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="(00) 00000-0000"
              />
            </div>

            <div className="form-field">
              <label htmlFor="lattes">
                <FaGraduationCap className="label-icon" />
                Lattes
              </label>
              <input
                id="lattes"
                type="text"
                name="lattes"
                value={formData.lattes}
                onChange={handleChange}
                placeholder="Link do currículo Lattes"
              />
            </div>

            <div className="form-field">
              <label>Posição/Cargo</label>
              <MultiSelect
                options={positions}
                selected={selectedPositions}
                onChange={setSelectedPositions}
                placeholder="Selecione posições..."
              />
            </div>

            <div className="form-field">
              <label htmlFor="bio">Biografia</label>
              <textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                placeholder="Uma breve descrição sobre o convidado..."
                rows={4}
              />
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
              disabled={isSubmitting}
            >
              {isSubmitting ? "Enviando..." : "Enviar Convite"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateInvitation;
