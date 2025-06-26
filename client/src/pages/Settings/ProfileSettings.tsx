import { useState, useEffect } from "react";
import { useGlobalData } from "helpers/context/globalContext";
import { saveProfile } from "helpers/api/settings";
import "./Settings.scss";

const ProfileSettings = () => {
  const { user }: any = useGlobalData();
  const initialData = user?.state || {};

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    contact_email: "",
    social_media: "",
    lattes: "",
    birthdate: "",
    is_public: true,
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setFormData({
      name: initialData.name || "",
      phone: initialData.phone || "",
      contact_email: initialData.contact_email || "",
      social_media: initialData.social_media || "",
      lattes: initialData.lattes || "",
      birthdate: initialData.birthdate || "",
      is_public: initialData.is_public ?? true,
    });
  }, [initialData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const response = await saveProfile(formData);

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

  return (
    <div className="profile-settings">
      <h1>Profile Settings</h1>
      {message && <div className="success-message">{message}</div>}
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={handleSubmit} className="profile-settings__form">
        <label>
          Name:
          <input name="name" value={formData.name} onChange={handleChange} />
        </label>

        <label>
          Phone:
          <input name="phone" value={formData.phone} onChange={handleChange} />
        </label>

        <label>
          Contact Email:
          <input
            name="contact_email"
            value={formData.contact_email}
            onChange={handleChange}
          />
        </label>

        <label>
          Social Media:
          <input
            name="social_media"
            value={formData.social_media}
            onChange={handleChange}
          />
        </label>

        <label>
          Lattes:
          <input
            name="lattes"
            value={formData.lattes}
            onChange={handleChange}
          />
        </label>

        <label>
          Birthdate:
          <input
            type="date"
            name="birthdate"
            value={formData.birthdate}
            onChange={handleChange}
          />
        </label>

        <label className="checkbox-label">
          <input
            type="checkbox"
            name="is_public"
            checked={formData.is_public}
            onChange={handleChange}
          />
          Public Profile
        </label>

        <button type="submit" className="save-button">
          Save Changes
        </button>
      </form>
    </div>
  );
};

export default ProfileSettings;
