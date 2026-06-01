import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
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

const CreateInvitation = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const ROLE_OPTIONS: RoleOption[] = [
    { id: 1, name: t("Professor"), value: "professor" },
    { id: 2, name: t("Student"), value: "student" },
    { id: 3, name: t("Collaborator"), value: "collaborator" },
    { id: 4, name: t("Inventory Manager"), value: "inventory_manager" },
  ];
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
      setError(t("Email is required."));
      return;
    }

    if (selectedRoles.length === 0) {
      setError(t("Select at least one role."));
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError(t("Enter a valid email."));
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
      setMessage(response.message || t("Invitation sent successfully!"));
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
      setError(response.error || t("Failed to send invitation."));
      setMessage("");
    }
  };

  return (
    <div className="page-layout">
      <div className="page-container">
        <button className="btn-back" onClick={() => navigate(-1)}>
          <FaArrowLeft /> {t("Back")}
        </button>

        <header className="page-header">
          <h1>{t("Invite New Member")}</h1>
          <p>
            {t("Send an email invitation to add a new member to the lab. The user will receive a link to complete the registration and will be approved automatically.")}
          </p>
        </header>

        {message && <div className="msg-success">{message}</div>}
        {error && <div className="msg-error">{error}</div>}

        <form onSubmit={handleSubmit} className="invitation-form">
          <div className="form-section">
            <h3>{t("Required Information")}</h3>

            <div className="form-field">
              <label htmlFor="email">
                <FaEnvelope className="label-icon" />
                {t("Email")} *
              </label>
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="email@example.com"
                required
              />
            </div>

            <div className="form-field">
              <label>{t("Role(s)")} *</label>
              <MultiSelect
                options={ROLE_OPTIONS}
                selected={selectedRoles}
                onChange={setSelectedRoles}
                placeholder={t("Select roles...")}
              />
              <span className="field-hint">
                {t("Select one or more roles for the new member")}
              </span>
            </div>
          </div>

          <div className="form-section">
            <h3>{t("Optional Information (Pre-fill)")}</h3>
            <p className="section-description">
              {t("These fields will be pre-filled in the invitee's registration form.")}
            </p>

            <div className="form-field">
              <label htmlFor="name">
                <FaUser className="label-icon" />
                {t("Full Name")}
              </label>
              <input
                id="name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder={t("Invitee's name")}
              />
            </div>

            <div className="form-field">
              <label htmlFor="phone">
                <FaPhone className="label-icon" />
                {t("Phone")}
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
                {t("Lattes")}
              </label>
              <input
                id="lattes"
                type="text"
                name="lattes"
                value={formData.lattes}
                onChange={handleChange}
                placeholder={t("Lattes CV link")}
              />
            </div>

            <div className="form-field">
              <label>{t("Position/Role")}</label>
              <MultiSelect
                options={positions}
                selected={selectedPositions}
                onChange={setSelectedPositions}
                placeholder={t("Select positions...")}
              />
            </div>

            <div className="form-field">
              <label htmlFor="bio">{t("Biography")}</label>
              <textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                placeholder={t("A brief description about the invitee...")}
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
              {t("Cancel")}
            </button>
            <button
              type="submit"
              className="btn-confirm"
              disabled={isSubmitting}
            >
              {isSubmitting ? t("Sending...") : t("Send Invitation")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateInvitation;
