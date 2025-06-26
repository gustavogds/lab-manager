import { useState, useEffect } from "react";
import "./Settings.scss";

import { saveLabSettings, getLabSettings } from "helpers/api/settings";

const LabSettings = () => {
  const [formData, setFormData] = useState<{
    lab_name: string;
    address: string;
    logo: File | null;
    mission: string;
    contact_email: string;
    contact_phone: string;
  }>({
    lab_name: "",
    address: "",
    logo: null,
    mission: "",
    contact_email: "",
    contact_phone: "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchLabSettings = async () => {
      const response = await getLabSettings();
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

    const form = new FormData();
    form.append("lab_name", formData.lab_name);
    form.append("address", formData.address);
    form.append("mission", formData.mission);
    form.append("contact_email", formData.contact_email);
    form.append("contact_phone", formData.contact_phone);
    if (formData.logo) form.append("logo", formData.logo);

    const response = await saveLabSettings(form);

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
          <input
            type="file"
            accept="image/*"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;

              const formData = new FormData();
              formData.append("logo", file);

              try {
                const response = await fetch("/core/settings/upload-logo/", {
                  method: "POST",
                  body: formData,
                  credentials: "include",
                });

                const data = await response.json();

                if (response.ok) {
                  setFormData((prev) => ({
                    ...prev,
                    logo: data.logo_url,
                  }));
                } else {
                  console.error(data.error || "Upload failed");
                }
              } catch (err) {
                console.error("Upload failed", err);
              }
            }}
          />
          {/* {formData.logo && (
            <img
              src={formData.logo}
              alt="Logo preview"
              style={{ maxHeight: 100, marginTop: 10 }}
            />
          )} */}
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
