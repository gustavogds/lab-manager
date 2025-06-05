import { useState, useEffect } from "react";
import AuthHandler from "helpers/services/AuthHandler";
import "./Settings.scss";

const LabSettings = () => {
  const [formData, setFormData] = useState({
    lab_name: "",
    address: "",
    logo: "",
    mission: "",
    contact_email: "",
    contact_phone: "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchLabSettings = async () => {
      const response = await AuthHandler.getLabSettings();
      if (response.success) {
        setFormData(response.data);
      }
    };
    fetchLabSettings();
  }, []);

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
    const response = await AuthHandler.saveLabSettings(formData);

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
      <h1>Lab Settings</h1>
      {message && <div className="success-message">{message}</div>}
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={handleSubmit} className="profile-settings__form">
        <label>
          Lab Name:
          <input
            name="lab_name"
            value={formData.lab_name}
            onChange={handleChange}
          />
        </label>
        <label>
          Address:
          <input
            name="address"
            value={formData.address}
            onChange={handleChange}
          />
        </label>
        <label>
          Logo:
          <input name="logo" value={formData.logo} onChange={handleChange} />
        </label>
        <label>
          Mission:
          <textarea
            name="mission"
            value={formData.mission}
            onChange={handleChange}
          />
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
          Contact Phone:
          <input
            name="contact_phone"
            value={formData.contact_phone}
            onChange={handleChange}
          />
        </label>

        <button type="submit" className="save-button">
          Save Changes
        </button>
      </form>
    </div>
  );
};

export default LabSettings;
