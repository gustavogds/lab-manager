import { useState, useEffect } from "react";
import "./Settings.scss";

import { saveLabSettings, getLabSettings, uploadLabLogo } from "helpers/api/settings";

const LabSettings = () => {
  const [formData, setFormData] = useState<{
    lab_name: string;
    contact_email: string;
    contact_phone: string;
  }>({
    lab_name: "",
    contact_email: "",
    contact_phone: "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [logoUrl, setLogoUrl] = useState("");

  const MAX_LOGO_SIZE_MB = 2;
  const MAX_LOGO_SIZE_BYTES = MAX_LOGO_SIZE_MB * 1024 * 1024;

  useEffect(() => {
    const fetchLabSettings = async () => {
      const response = await getLabSettings();
      if (response.success) {
        setFormData({
          lab_name: response.data.lab_name || "",
          contact_email: response.data.email || "",
          contact_phone: response.data.phone || "",
        });
        setLogoUrl(response.data.logo || "");
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

  const handleLogoChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_LOGO_SIZE_BYTES) {
      setError(
        `O logo deve ter no máximo ${MAX_LOGO_SIZE_MB}MB.`
      );
      setMessage("");
      return;
    }

    const response = await uploadLabLogo(file);

    if (response.success) {
      setLogoUrl(response.logo_url || "");
      setMessage(response.message || "Logo atualizado com sucesso.");
      setError("");
    } else {
      setError(response.error || response.message || "Falha ao enviar o logo.");
      setMessage("");
    }

    e.target.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const dataToSend = {
      lab_name: formData.lab_name,
      email: formData.contact_email,
      phone: formData.contact_phone,
    };

    const response = await saveLabSettings(dataToSend);

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
      <h1>Configurações do Laboratório</h1>
      {message && <div className="msg-success">{message}</div>}
      {error && <div className="msg-error">{error}</div>}
      <form onSubmit={handleSubmit} className="profile-settings__form">
        <label>
          Nome do Laboratório:
          <input
            name="lab_name"
            value={formData.lab_name}
            onChange={handleChange}
          />
        </label>

        <label>
          Logo:
          <div className="profile-image-field">
            <div className="profile-image-preview logo-preview">
              {logoUrl ? (
                <img src={logoUrl} alt="Logo do laboratório" />
              ) : (
                <span>Sem logo</span>
              )}
            </div>
            <div className="profile-image-actions">
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoChange}
              />
              <small>
                Tamanho máximo: {MAX_LOGO_SIZE_MB}MB
              </small>
            </div>
          </div>
        </label>

        <label>
          Email de Contato:
          <input
            name="contact_email"
            value={formData.contact_email}
            onChange={handleChange}
          />
        </label>

        <label>
          Telefone de Contato:
          <input
            name="contact_phone"
            value={formData.contact_phone}
            onChange={handleChange}
          />
        </label>

        <button type="submit" className="btn-confirm">
          Salvar Alterações
        </button>
      </form>
    </div>
  );
};

export default LabSettings;
