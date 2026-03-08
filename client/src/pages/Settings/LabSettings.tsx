import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import "./Settings.scss";

import MultiSelect from "components/MultiSelect/MultiSelect";
import { saveLabSettings, getLabSettings, uploadLabLogo } from "helpers/api/settings";
import { setLabDefaultLanguage, getLabDefaultLanguage } from "helpers/i18n";

const DEFAULT_COLORS = {
  home_bg_color_start: "#eef7f6",
  home_bg_color_middle: "#f7fbfb",
  home_bg_color_end: "#ffffff",
  home_accent_color: "#1d8b83",
  home_border_hover_color: "#1d8b83",
  home_icon_color: "#1d8b83",
  home_text_color: "#1b2b2a",
};

const LabSettings = () => {
  const { t } = useTranslation();

  const languageOptions = useMemo(() => [
    { id: 1, name: t("English"), code: "en" },
    { id: 2, name: t("Portuguese"), code: "pt" },
  ], [t]);

  const [formData, setFormData] = useState<{
    lab_name: string;
    contact_email: string;
    contact_phone: string;
    home_use_gradient: boolean;
    home_bg_color_start: string;
    home_bg_color_middle: string;
    home_bg_color_end: string;
    home_accent_color: string;
    home_border_hover_color: string;
    home_icon_color: string;
    home_text_color: string;
    default_language: string;
  }>({
    lab_name: "",
    contact_email: "",
    contact_phone: "",
    home_use_gradient: true,
    home_bg_color_start: DEFAULT_COLORS.home_bg_color_start,
    home_bg_color_middle: DEFAULT_COLORS.home_bg_color_middle,
    home_bg_color_end: DEFAULT_COLORS.home_bg_color_end,
    home_accent_color: DEFAULT_COLORS.home_accent_color,
    home_border_hover_color: DEFAULT_COLORS.home_border_hover_color,
    home_icon_color: DEFAULT_COLORS.home_icon_color,
    home_text_color: DEFAULT_COLORS.home_text_color,
    default_language: getLabDefaultLanguage(),
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
          home_use_gradient: response.data.home_use_gradient ?? true,
          home_bg_color_start: response.data.home_bg_color_start || DEFAULT_COLORS.home_bg_color_start,
          home_bg_color_middle: response.data.home_bg_color_middle || DEFAULT_COLORS.home_bg_color_middle,
          home_bg_color_end: response.data.home_bg_color_end || DEFAULT_COLORS.home_bg_color_end,
          home_accent_color: response.data.home_accent_color || DEFAULT_COLORS.home_accent_color,
          home_border_hover_color: response.data.home_border_hover_color || DEFAULT_COLORS.home_border_hover_color,
          home_icon_color: response.data.home_icon_color || DEFAULT_COLORS.home_icon_color,
          home_text_color: response.data.home_text_color || DEFAULT_COLORS.home_text_color,
          default_language: response.data.default_language || getLabDefaultLanguage(),
        });
        setLogoUrl(response.data.logo || "");
      }
    };
    fetchLabSettings();
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

  const handleLanguageChange = (selected: typeof languageOptions) => {
    if (selected.length > 0) {
      const langCode = selected[0].code;
      setFormData((prev) => ({ ...prev, default_language: langCode }));
      setLabDefaultLanguage(langCode);
    }
  };

  const handleLogoChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_LOGO_SIZE_BYTES) {
      setError(
        `${t("The logo must be at most")} ${MAX_LOGO_SIZE_MB}MB.`
      );
      setMessage("");
      return;
    }

    const response = await uploadLabLogo(file);

    if (response.success) {
      setLogoUrl(response.logo_url || "");
      setMessage(response.message || t("Logo updated successfully."));
      setError("");
    } else {
      setError(response.error || response.message || t("Failed to upload logo."));
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
      home_use_gradient: formData.home_use_gradient,
      home_bg_color_start: formData.home_bg_color_start || null,
      home_bg_color_middle: formData.home_bg_color_middle || null,
      home_bg_color_end: formData.home_bg_color_end || null,
      home_accent_color: formData.home_accent_color || null,
      home_border_hover_color: formData.home_border_hover_color || null,
      home_icon_color: formData.home_icon_color || null,
      home_text_color: formData.home_text_color || null,
      default_language: formData.default_language,
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
      <h1>{t("Lab Settings")}</h1>
      {message && <div className="msg-success">{message}</div>}
      {error && <div className="msg-error">{error}</div>}
      <form onSubmit={handleSubmit} className="profile-settings__form">
        <label>
          {t("Laboratory Name")}:
          <input
            name="lab_name"
            value={formData.lab_name}
            onChange={handleChange}
          />
        </label>

        <label>
          {t("Logo")}:
          <div className="profile-image-field">
            <div className="profile-image-preview logo-preview">
              {logoUrl ? (
                <img src={logoUrl} alt={t("Laboratory logo")} />
              ) : (
                <span>{t("No logo")}</span>
              )}
            </div>
            <div className="profile-image-actions">
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoChange}
              />
              <small>
                {t("Maximum size:")} {MAX_LOGO_SIZE_MB}MB
              </small>
            </div>
          </div>
        </label>

        <label>
          {t("Contact Email")}:
          <input
            name="contact_email"
            value={formData.contact_email}
            onChange={handleChange}
          />
        </label>

        <label>
          {t("Contact Phone")}:
          <input
            name="contact_phone"
            value={formData.contact_phone}
            onChange={handleChange}
          />
        </label>

        <div className="settings-section">
          <h2>{t("Default Language")}</h2>
          <p className="settings-section-description">
            {t("Default language for visitors who haven't set a preference")}
          </p>
          <MultiSelect
            options={languageOptions}
            selected={languageOptions.filter((l) => l.code === formData.default_language)}
            onChange={handleLanguageChange}
            singleSelect
            hideSearch
            placeholder={t("Select language...")}
          />
        </div>

        <div className="settings-section">
          <h2>{t("Home Page Colors")}</h2>
          <p className="settings-section-description">
            {t("Customize the colors of the laboratory's public page. Leave blank to use default colors.")}
          </p>

          <label className="checkbox-label">
            <input
              type="checkbox"
              name="home_use_gradient"
              checked={formData.home_use_gradient}
              onChange={handleChange}
            />
            {t("Use gradient background")}
          </label>

          <div className="color-fields-grid">
            <label className="color-field">
              <span className="color-field-label">{t("Background Color (Start)")}</span>
              <div className="color-field-input">
                <input
                  type="color"
                  name="home_bg_color_start"
                  value={formData.home_bg_color_start}
                  onChange={handleChange}
                />
                <input
                  type="text"
                  value={formData.home_bg_color_start}
                  onChange={(e) => setFormData((prev) => ({ ...prev, home_bg_color_start: e.target.value }))}
                  placeholder="#eef7f6"
                  maxLength={7}
                />
              </div>
            </label>

            {formData.home_use_gradient && (
              <label className="color-field">
                <span className="color-field-label">{t("Background Color (Middle)")}</span>
                <div className="color-field-input">
                  <input
                    type="color"
                    name="home_bg_color_middle"
                    value={formData.home_bg_color_middle}
                    onChange={handleChange}
                  />
                  <input
                    type="text"
                    value={formData.home_bg_color_middle}
                    onChange={(e) => setFormData((prev) => ({ ...prev, home_bg_color_middle: e.target.value }))}
                    placeholder="#f7fbfb"
                    maxLength={7}
                  />
                </div>
              </label>
            )}

            {formData.home_use_gradient && (
              <label className="color-field">
                <span className="color-field-label">{t("Background Color (End)")}</span>
                <div className="color-field-input">
                  <input
                    type="color"
                    name="home_bg_color_end"
                    value={formData.home_bg_color_end}
                    onChange={handleChange}
                  />
                  <input
                    type="text"
                    value={formData.home_bg_color_end}
                    onChange={(e) => setFormData((prev) => ({ ...prev, home_bg_color_end: e.target.value }))}
                    placeholder="#ffffff"
                    maxLength={7}
                  />
                </div>
              </label>
            )}
            <label className="color-field">
              <span className="color-field-label">{t("Highlight Color (Titles)")}</span>
              <div className="color-field-input">
                <input
                  type="color"
                  name="home_accent_color"
                  value={formData.home_accent_color}
                  onChange={handleChange}
                />
                <input
                  type="text"
                  value={formData.home_accent_color}
                  onChange={(e) => setFormData((prev) => ({ ...prev, home_accent_color: e.target.value }))}
                  placeholder="#1d8b83"
                  maxLength={7}
                />
              </div>
            </label>
            <label className="color-field">
              <span className="color-field-label">{t("Border Color (Hover)")}</span>
              <div className="color-field-input">
                <input
                  type="color"
                  name="home_border_hover_color"
                  value={formData.home_border_hover_color}
                  onChange={handleChange}
                />
                <input
                  type="text"
                  value={formData.home_border_hover_color}
                  onChange={(e) => setFormData((prev) => ({ ...prev, home_border_hover_color: e.target.value }))}
                  placeholder="#1d8b83"
                  maxLength={7}
                />
              </div>
            </label>
            <label className="color-field">
              <span className="color-field-label">{t("Icons Color")}</span>
              <div className="color-field-input">
                <input
                  type="color"
                  name="home_icon_color"
                  value={formData.home_icon_color}
                  onChange={handleChange}
                />
                <input
                  type="text"
                  value={formData.home_icon_color}
                  onChange={(e) => setFormData((prev) => ({ ...prev, home_icon_color: e.target.value }))}
                  placeholder="#1d8b83"
                  maxLength={7}
                />
              </div>
            </label>
            <label className="color-field">
              <span className="color-field-label">{t("Text Color")}</span>
              <div className="color-field-input">
                <input
                  type="color"
                  name="home_text_color"
                  value={formData.home_text_color}
                  onChange={handleChange}
                />
                <input
                  type="text"
                  value={formData.home_text_color}
                  onChange={(e) => setFormData((prev) => ({ ...prev, home_text_color: e.target.value }))}
                  placeholder="#1b2b2a"
                  maxLength={7}
                />
              </div>
            </label>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setFormData((prev) => ({
                ...prev,
                home_use_gradient: true,
                home_bg_color_start: DEFAULT_COLORS.home_bg_color_start,
                home_bg_color_middle: DEFAULT_COLORS.home_bg_color_middle,
                home_bg_color_end: DEFAULT_COLORS.home_bg_color_end,
                home_accent_color: DEFAULT_COLORS.home_accent_color,
                home_border_hover_color: DEFAULT_COLORS.home_border_hover_color,
                home_icon_color: DEFAULT_COLORS.home_icon_color,
                home_text_color: DEFAULT_COLORS.home_text_color,
              }))}
            >
              {t("Restore Default Colors")}
            </button>
          </div>
        </div>
        <button type="submit" className="btn-confirm">
          {t("Save Changes")}
        </button>
      </form>
    </div>
  );
};

export default LabSettings;
