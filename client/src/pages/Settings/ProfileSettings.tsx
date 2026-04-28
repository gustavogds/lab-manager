import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import DatePicker, { registerLocale } from "react-datepicker";
import { ptBR } from "date-fns/locale/pt-BR";
import "react-datepicker/dist/react-datepicker.css";
import { useGlobalData } from "helpers/context/globalContext";
import { saveProfile, uploadProfileImage } from "helpers/api/settings";
import { listPositions, type Position } from "helpers/api/content";
import MultiSelect from "components/MultiSelect/MultiSelect";
import "./Settings.scss";

registerLocale("pt-BR", ptBR);

const ProfileSettings = () => {
  const { t } = useTranslation();
  const { user }: any = useGlobalData();
  const initialData = user?.state || {};

  const [formData, setFormData] = useState({
    name: "",
    selectedPositions: [] as Position[],
    phone: "",
    contact_email: "",
    social_media: "",
    lattes: "",
    bio_pt: "",
    bio_en: "",
    birthdate: "",
    is_public: true,
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [profileImageUrl, setProfileImageUrl] = useState("");
  const [positions, setPositions] = useState<Position[]>([]);

  const MAX_PROFILE_IMAGE_SIZE_MB = 2;
  const MAX_PROFILE_IMAGE_SIZE_BYTES =
    MAX_PROFILE_IMAGE_SIZE_MB * 1024 * 1024;

  useEffect(() => {
    const userPositions = initialData.positions || (initialData.position ? [initialData.position] : []);
    setFormData({
      name: initialData.name || "",
      selectedPositions: userPositions,
      phone: initialData.phone || "",
      contact_email: initialData.contact_email || "",
      social_media: initialData.social_media || "",
      lattes: initialData.lattes || "",
      bio_pt: initialData.bio_pt || "",
      bio_en: initialData.bio_en || "",
      birthdate: initialData.birthdate || "",
      is_public: initialData.is_public ?? true,
    });
    
    if (initialData.birthdate) {
      const [year, month, day] = initialData.birthdate.split("-");
      if (year && month && day) {
        setSelectedDate(
          new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
        );
      }
    } else {
      setSelectedDate(null);
    }

    setProfileImageUrl(initialData.profile_image || "");
  }, [initialData]);

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
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const target = e.target;

    const value =
      target instanceof HTMLInputElement && target.type === "checkbox"
        ? target.checked
        : target.value;

    setFormData((prev) => ({
      ...prev,
      [target.name]: value,
    }));
  };

  const handleDateChange = (date: Date | null) => {
    setSelectedDate(date);
    if (date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      setFormData((prev) => ({
        ...prev,
        birthdate: `${year}-${month}-${day}`,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        birthdate: "",
      }));
    }
  };

  const handleProfileImageChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_PROFILE_IMAGE_SIZE_BYTES) {
      setError(
        `A imagem deve ter no máximo ${MAX_PROFILE_IMAGE_SIZE_MB}MB.`
      );
      setMessage("");
      return;
    }

    const response = await uploadProfileImage(file);

    if (response.success) {
      setProfileImageUrl(response.profile_image || "");
      setMessage(response.message || "Imagem de perfil atualizada com sucesso.");
      setError("");
    } else {
      setError(response.error || response.message || "Falha ao enviar a imagem.");
      setMessage("");
    }

    e.target.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const payload = {
      ...formData,
      position_ids: formData.selectedPositions.map((p) => p.id),
    };
    delete (payload as any).selectedPositions;
    
    const response = await saveProfile(payload);

    if (response.success) {
      setMessage(response.message);
      setError("");
    } else {
      setError(response.message);
      setMessage("");
    }

    setTimeout(() => {
      setMessage("");
      setError("");
    }, 4000);
  };

  const handlePositionsChange = (selected: Position[]) => {
    setFormData((prev) => ({
      ...prev,
      selectedPositions: selected,
    }));
  };

  return (
    <div className="profile-settings">
      <h1>{t("Profile Settings")}</h1>
      {message && <div className="msg-success">{message}</div>}
      {error && <div className="msg-error">{error}</div>}
      <form onSubmit={handleSubmit} className="profile-settings__form">
        <label>
          {t("Profile Image:")}
          <div className="profile-image-field">
            <div className="profile-image-preview">
              {profileImageUrl ? (
                <img src={profileImageUrl} alt={t("Profile Image")} />
              ) : (
                <span>{t("No image")}</span>
              )}
            </div>
            <div className="profile-image-actions">
              <input
                type="file"
                accept="image/*"
                onChange={handleProfileImageChange}
              />
              <small>
                {t("Maximum size:")} {MAX_PROFILE_IMAGE_SIZE_MB}MB
              </small>
            </div>
          </div>
        </label>
        <label>
          {t("Name")}
          <input name="name" value={formData.name} onChange={handleChange} />
        </label>
        <MultiSelect
          label={t("Positions/Roles")}
          options={positions}
          selected={formData.selectedPositions}
          onChange={handlePositionsChange}
          placeholder={t("Select positions...")}
        />
        <label>
          {t("Phone")}
          <input name="phone" value={formData.phone} onChange={handleChange} />
        </label>
        <label>
          {t("Contact Email")}
          <input
            name="contact_email"
            value={formData.contact_email}
            onChange={handleChange}
          />
        </label>
        <label>
          {t("Page")}
          <input
            name="social_media"
            value={formData.social_media}
            onChange={handleChange}
            placeholder={t("LinkedIn, personal page, etc.")}
          />
        </label>
        <label>
          Lattes
          <input
            name="lattes"
            value={formData.lattes}
            onChange={handleChange}
          />
        </label>
        <label>
          {t("Bio")} <span className="lang-badge">PT</span>
          <textarea
            name="bio_pt"
            value={formData.bio_pt}
            onChange={handleChange}
            placeholder={t("Write a brief description about yourself...")}
            rows={4}
          />
        </label>
        <label>
          {t("Bio")} <span className="lang-badge">EN</span>
          <textarea
            name="bio_en"
            value={formData.bio_en}
            onChange={handleChange}
            placeholder={t("Write a brief description about yourself...")}
            rows={4}
          />
        </label>
        <label>
          {t("Date of Birth")}
          <DatePicker
            selected={selectedDate}
            onChange={handleDateChange}
            dateFormat="dd/MM/yyyy"
            locale="pt-BR"
            placeholderText="DD/MM/AAAA"
            showYearDropdown
            showMonthDropdown
            dropdownMode="select"
            maxDate={new Date()}
            className="date-picker-input"
          />
        </label>
        <label className="checkbox-label">
          <input
            type="checkbox"
            name="is_public"
            checked={formData.is_public}
            onChange={handleChange}
          />
          {t("Public Profile")}
        </label>
        <button type="submit" className="btn-confirm">
          {t("Save Changes")}
        </button>
      </form>
    </div>
  );
};

export default ProfileSettings;
